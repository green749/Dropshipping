import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKER_SCRIPT_PATH = path.resolve(__dirname, 'tasks/computation.worker.js');

class WorkerPool {
  constructor(poolSize = Math.max(2, Math.min(os.cpus().length, 4))) {
    this.poolSize = poolSize;
    this.workers = []; // Array of { id, worker, isBusy }
    this.queue = []; // Array of { taskId, type, payload, resolve, reject, timeoutTimer }
    this.taskCounter = 0;
    this.stats = {
      totalTasksExecuted: 0,
      totalErrors: 0,
      activeTasks: 0,
      poolSize: this.poolSize,
    };

    this.isTerminated = false;
    this.initPool();
  }

  initPool() {
    for (let i = 0; i < this.poolSize; i++) {
      this.spawnWorker(i);
    }
  }

  spawnWorker(index) {
    if (this.isTerminated) return;
    try {
      const worker = new Worker(WORKER_SCRIPT_PATH);
      const workerWrapper = {
        id: index,
        worker,
        isBusy: false,
        currentTask: null,
      };

      worker.on('message', (message) => {
        const { taskId, success, result, error } = message;
        const task = workerWrapper.currentTask;

        if (task && task.taskId === taskId) {
          clearTimeout(task.timeoutTimer);
          workerWrapper.isBusy = false;
          workerWrapper.currentTask = null;
          this.stats.activeTasks = Math.max(0, this.stats.activeTasks - 1);

          if (success) {
            this.stats.totalTasksExecuted++;
            task.resolve(result);
          } else {
            this.stats.totalErrors++;
            task.reject(new Error(error || 'Worker task execution error'));
          }

          // Process next task in queue if any
          this.processQueue();
        }
      });

      worker.on('error', (err) => {
        if (this.isTerminated) return;
        console.error(`[WorkerPool] Worker #${index} encountered an error:`, err.message);
        this.recycleWorker(index);
      });

      worker.on('exit', (code) => {
        if (this.isTerminated) return;
        if (code !== 0) {
          console.warn(`[WorkerPool] Worker #${index} exited with code ${code}. Respawning worker thread...`);
          this.recycleWorker(index);
        }
      });

      this.workers[index] = workerWrapper;
    } catch (err) {
      console.error(`[WorkerPool] Failed to spawn worker #${index}:`, err.message);
    }
  }

  recycleWorker(index) {
    const existing = this.workers[index];
    if (existing && existing.currentTask) {
      clearTimeout(existing.currentTask.timeoutTimer);
      existing.currentTask.reject(new Error('Worker thread crashed unexpectedly during execution'));
      this.stats.activeTasks = Math.max(0, this.stats.activeTasks - 1);
      this.stats.totalErrors++;
    }

    try {
      existing?.worker?.terminate();
    } catch {}

    this.spawnWorker(index);
    this.processQueue();
  }

  /**
   * Execute a computation task on a background worker thread
   * @param {'INVENTORY_ANALYTICS' | 'PRODUCT_INTELLIGENCE' | 'FINANCIAL_METRICS'} type
   * @param {any} payload
   * @param {number} [timeoutMs=30000]
   * @returns {Promise<any>}
   */
  runTask(type, payload, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const taskId = `task-${++this.taskCounter}-${Date.now()}`;

      const task = {
        taskId,
        type,
        payload,
        resolve,
        reject,
        timeoutMs,
      };

      this.queue.push(task);
      this.processQueue();
    });
  }

  processQueue() {
    if (this.queue.length === 0) return;

    // Find first available idle worker
    const idleWorker = this.workers.find((w) => w && !w.isBusy);
    if (!idleWorker) return; // All workers are currently busy, queued for next completion

    const task = this.queue.shift();
    idleWorker.isBusy = true;
    idleWorker.currentTask = task;
    this.stats.activeTasks++;

    // Safety timeout
    task.timeoutTimer = setTimeout(() => {
      console.warn(`[WorkerPool] Task ${task.taskId} timed out after ${task.timeoutMs}ms.`);
      this.recycleWorker(idleWorker.id);
    }, task.timeoutMs);

    idleWorker.worker.postMessage({
      taskId: task.taskId,
      type: task.type,
      payload: task.payload,
    });
  }

  getMetrics() {
    const busyWorkers = this.workers.filter((w) => w && w.isBusy).length;
    return {
      poolSize: this.poolSize,
      activeThreads: this.workers.length,
      busyThreads: busyWorkers,
      idleThreads: Math.max(0, this.workers.length - busyWorkers),
      queuedTasks: this.queue.length,
      totalExecuted: this.stats.totalTasksExecuted,
      totalErrors: this.stats.totalErrors,
    };
  }

  terminate() {
    this.isTerminated = true;
    for (const w of this.workers) {
      if (w?.worker) {
        try {
          w.worker.terminate();
        } catch {}
      }
    }
    this.workers = [];
  }
}

export const workerPool = new WorkerPool();
export const runWorkerTask = (type, payload, timeoutMs) => workerPool.runTask(type, payload, timeoutMs);
