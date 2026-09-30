import express from 'express';
import { systemProfiler } from '../../shared/utils/profiler.js';
import { CacheService } from '../../shared/services/cache.service.js';
import http from 'http';
import { performance } from 'perf_hooks';

const router = express.Router();

// 1. Unified Real-Time System Monitor Telemetry
router.get('/monitor', async (req, res) => {
  try {
    const [healthData, requestStats, systemMetrics] = await Promise.all([
      systemProfiler.checkServicesHealth(),
      systemProfiler.getCalculatedStats(),
      systemProfiler.getSystemMetrics(),
    ]);

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      system: systemMetrics,
      requests: requestStats,
      health: healthData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 2. Health Check Aggregator
router.get('/health', async (req, res) => {
  try {
    const health = await systemProfiler.checkServicesHealth();
    const isAllUp = health.services.every((s) => s.status === 'UP') && health.database.status === 'UP';
    res.status(isAllUp ? 200 : 207).json({
      status: isAllUp ? 'HEALTHY' : 'DEGRADED',
      ...health,
    });
  } catch (error) {
    res.status(500).json({ status: 'UNHEALTHY', error: error.message });
  }
});

// 3. Process & V8 Profiler Endpoint
router.get('/profile', (req, res) => {
  try {
    const metrics = systemProfiler.getSystemMetrics();
    const stats = systemProfiler.getCalculatedStats();

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      runtime: {
        nodeVersion: process.version,
        v8Version: process.versions.v8,
        pid: process.pid,
        title: process.title,
        execPath: process.execPath,
      },
      system: metrics.os,
      memory: metrics.process,
      latencyPercentiles: stats.latency,
      slowRequests: stats.slowRequests,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Cache Management & Invalidation
router.post('/cache/flush', async (req, res) => {
  try {
    await CacheService.flush();
    res.status(200).json({
      success: true,
      message: 'Cache successfully flushed across all storage layers.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. On-Demand Performance Stress Test & Benchmark
router.post('/benchmark', async (req, res) => {
  try {
    const { totalRequests = 30, concurrency = 6 } = req.body || {};
    const latencies = [];
    const url = 'http://localhost:5000/health';
    const batches = Math.ceil(totalRequests / concurrency);
    const startOverall = performance.now();

    for (let b = 0; b < batches; b++) {
      const batchSize = Math.min(concurrency, totalRequests - b * concurrency);
      const promises = Array.from({ length: batchSize }, () => {
        return new Promise((resolve) => {
          const reqStart = performance.now();
          http.get(url, (resp) => {
            resp.on('data', () => {});
            resp.on('end', () => {
              resolve({ duration: performance.now() - reqStart, ok: resp.statusCode === 200 });
            });
          }).on('error', () => resolve({ duration: performance.now() - reqStart, ok: false }));
        });
      });

      const batchResults = await Promise.all(promises);
      for (const r of batchResults) {
        if (r.ok) latencies.push(r.duration);
      }
    }

    const totalTimeSec = (performance.now() - startOverall) / 1000;
    const rps = Math.round((totalRequests / totalTimeSec) * 100) / 100;
    latencies.sort((a, b) => a - b);
    const count = latencies.length;
    const avg = count ? latencies.reduce((a, b) => a + b, 0) / count : 0;

    res.status(200).json({
      success: true,
      benchmark: {
        totalRequests,
        concurrency,
        successfulRequests: count,
        rps,
        latency: {
          avg: Math.round(avg * 100) / 100,
          min: count ? Math.round(latencies[0] * 100) / 100 : 0,
          max: count ? Math.round(latencies[count - 1] * 100) / 100 : 0,
          p50: count ? Math.round(latencies[Math.floor(count * 0.5)] * 100) / 100 : 0,
          p95: count ? Math.round(latencies[Math.floor(count * 0.95)] * 100) / 100 : 0,
          p99: count ? Math.round(latencies[Math.floor(count * 0.99)] * 100) / 100 : 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
