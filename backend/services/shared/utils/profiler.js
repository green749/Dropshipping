import http from 'http';
import { performance } from 'perf_hooks';
import os from 'os';
import pg from 'pg';
import { env } from '../config/env.js';
import { isRedisConnected, redisClient } from '../config/redis.js';
import { workerPool } from '../workers/workerPool.js';

class SystemProfiler {
  constructor() {
    this.startTime = Date.now();
    this.requestMetrics = {
      totalRequests: 0,
      status2xx: 0,
      status3xx: 0,
      status4xx: 0,
      status5xx: 0,
      latencies: [],
    };
    this.routeStats = new Map();
    this.slowRequests = [];
    this.maxLatencyHistory = 500;
    this.maxSlowRequests = 50;
    this.slowThresholdMs = 250; // Requests taking > 250ms are considered slow
  }

  recordRequest(method, path, statusCode, durationMs) {
    this.requestMetrics.totalRequests++;

    if (statusCode >= 200 && statusCode < 300) this.requestMetrics.status2xx++;
    else if (statusCode >= 300 && statusCode < 400) this.requestMetrics.status3xx++;
    else if (statusCode >= 400 && statusCode < 500) this.requestMetrics.status4xx++;
    else if (statusCode >= 500) this.requestMetrics.status5xx++;

    // Latency Ring Buffer
    this.requestMetrics.latencies.push(durationMs);
    if (this.requestMetrics.latencies.length > this.maxLatencyHistory) {
      this.requestMetrics.latencies.shift();
    }

    // Per Route Aggregation
    const cleanRoute = path.split('?')[0].replace(/\/([0-9a-fA-F-]{36}|[0-9]+)/g, '/:id');
    const routeKey = `${method.toUpperCase()} ${cleanRoute}`;
    let stats = this.routeStats.get(routeKey);

    if (!stats) {
      stats = {
        key: routeKey,
        method: method.toUpperCase(),
        path: cleanRoute,
        hits: 0,
        totalDuration: 0,
        minDuration: durationMs,
        maxDuration: durationMs,
        errors: 0,
        lastAccessed: Date.now(),
      };
      this.routeStats.set(routeKey, stats);
    }

    stats.hits++;
    stats.totalDuration += durationMs;
    stats.minDuration = Math.min(stats.minDuration, durationMs);
    stats.maxDuration = Math.max(stats.maxDuration, durationMs);
    stats.lastAccessed = Date.now();
    if (statusCode >= 400) stats.errors++;

    // Track Slow Requests
    if (durationMs >= this.slowThresholdMs) {
      this.slowRequests.unshift({
        id: `slow-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        method: method.toUpperCase(),
        path,
        statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
        timestamp: new Date().toISOString(),
      });
      if (this.slowRequests.length > this.maxSlowRequests) {
        this.slowRequests.pop();
      }
    }
  }

  getCalculatedStats() {
    const latencies = [...this.requestMetrics.latencies].sort((a, b) => a - b);
    const count = latencies.length;
    const avg = count ? latencies.reduce((a, b) => a + b, 0) / count : 0;
    const p50 = count ? latencies[Math.floor(count * 0.5)] : 0;
    const p90 = count ? latencies[Math.floor(count * 0.9)] : 0;
    const p95 = count ? latencies[Math.floor(count * 0.95)] : 0;
    const p99 = count ? latencies[Math.floor(count * 0.99)] : 0;

    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    const rps = uptimeSeconds > 0 ? (this.requestMetrics.totalRequests / uptimeSeconds).toFixed(2) : 0;

    // Top Slow Routes
    const routesArray = Array.from(this.routeStats.values()).map((r) => ({
      ...r,
      avgDuration: Math.round((r.totalDuration / r.hits) * 100) / 100,
      minDuration: Math.round(r.minDuration * 100) / 100,
      maxDuration: Math.round(r.maxDuration * 100) / 100,
      errorRate: r.hits > 0 ? Math.round((r.errors / r.hits) * 10000) / 100 : 0,
    }));

    routesArray.sort((a, b) => b.avgDuration - a.avgDuration);

    return {
      totalRequests: this.requestMetrics.totalRequests,
      statusCodes: {
        '2xx': this.requestMetrics.status2xx,
        '3xx': this.requestMetrics.status3xx,
        '4xx': this.requestMetrics.status4xx,
        '5xx': this.requestMetrics.status5xx,
      },
      rps: parseFloat(rps),
      latency: {
        avg: Math.round(avg * 100) / 100,
        min: count ? Math.round(latencies[0] * 100) / 100 : 0,
        max: count ? Math.round(latencies[count - 1] * 100) / 100 : 0,
        p50: Math.round(p50 * 100) / 100,
        p90: Math.round(p90 * 100) / 100,
        p95: Math.round(p95 * 100) / 100,
        p99: Math.round(p99 * 100) / 100,
      },
      routes: routesArray.slice(0, 20),
      slowRequests: this.slowRequests,
    };
  }

  async checkServicesHealth() {
    const services = [
      { id: 'gateway', name: 'API Gateway', url: 'http://127.0.0.1:5000/health', port: 5000 },
      { id: 'auth', name: 'Auth & Chat Service', url: `${env.AUTH_SERVICE_URL}/health`, port: 5001 },
      { id: 'business', name: 'Business & Dealer Service', url: `${env.BUSINESS_SERVICE_URL}/health`, port: 5002 },
      { id: 'product', name: 'Product & Inventory Service', url: `${env.PRODUCT_SERVICE_URL}/health`, port: 5003 },
      { id: 'order', name: 'Order & Customer Service', url: `${env.ORDER_SERVICE_URL}/health`, port: 5004 },
      { id: 'marketing', name: 'Marketing & AI Service', url: `${env.MARKETING_SERVICE_URL}/health`, port: 5005 },
      { id: 'analytics', name: 'Analytics & Financial Service', url: `${env.ANALYTICS_SERVICE_URL}/health`, port: 5006 },
    ];

    const results = await Promise.all(
      services.map(async (svc) => {
        const start = performance.now();
        return new Promise((resolve) => {
          const req = http.get(svc.url, { timeout: 2000 }, (res) => {
            const latency = performance.now() - start;
            resolve({
              ...svc,
              status: res.statusCode === 200 ? 'UP' : 'DEGRADED',
              statusCode: res.statusCode,
              latencyMs: Math.round(latency * 100) / 100,
            });
          });

          req.on('error', (err) => {
            const latency = performance.now() - start;
            resolve({
              ...svc,
              status: 'DOWN',
              error: err.message,
              latencyMs: Math.round(latency * 100) / 100,
            });
          });

          req.on('timeout', () => {
            req.destroy();
            resolve({
              ...svc,
              status: 'DOWN',
              error: 'Timeout after 2000ms',
              latencyMs: 2000,
            });
          });
        });
      })
    );

    // PostgreSQL Check
    let dbStatus = { name: 'PostgreSQL Database', status: 'UNKNOWN', latencyMs: 0 };
    const dbStart = performance.now();
    try {
      const client = new pg.Client({
        host: env.DB.HOST,
        port: env.DB.PORT,
        user: env.DB.USER,
        password: env.DB.PASSWORD,
        database: env.DB.NAME || 'postgres',
      });
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      dbStatus = {
        name: 'PostgreSQL Database',
        status: 'UP',
        latencyMs: Math.round((performance.now() - dbStart) * 100) / 100,
      };
    } catch (err) {
      dbStatus = {
        name: 'PostgreSQL Database',
        status: 'DOWN',
        error: err.message,
        latencyMs: Math.round((performance.now() - dbStart) * 100) / 100,
      };
    }

    // Redis Check
    const redisStatus = {
      name: 'Redis Cache Store',
      status: isRedisConnected ? 'UP' : 'FALLBACK (In-Memory)',
      type: isRedisConnected ? 'Redis Standalone' : 'In-Memory CacheStore',
    };

    return {
      services: results,
      database: dbStatus,
      cache: redisStatus,
      timestamp: new Date().toISOString(),
    };
  }

  getSystemMetrics() {
    const mem = process.memoryUsage();
    const cpus = os.cpus();
    const freeMem = os.freemem();
    const totalMem = os.totalmem();

    return {
      os: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        cpuModel: cpus[0]?.model || 'Generic CPU',
        cpuCores: cpus.length,
        totalMemoryMB: Math.round(totalMem / 1024 / 1024),
        freeMemoryMB: Math.round(freeMem / 1024 / 1024),
        usedMemoryPercentage: Math.round(((totalMem - freeMem) / totalMem) * 10000) / 100,
        loadAvg: os.loadavg(),
      },
      process: {
        uptimeSeconds: Math.round(process.uptime()),
        rssMB: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
        heapTotalMB: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
        heapUsedMB: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
        heapUsedPercentage: Math.round((mem.heapUsed / mem.heapTotal) * 10000) / 100,
        externalMB: Math.round((mem.external / 1024 / 1024) * 100) / 100,
      },
      workers: workerPool.getMetrics(),
    };
  }
}

export const systemProfiler = new SystemProfiler();
