import { performance } from 'perf_hooks';
import { systemProfiler } from '../utils/profiler.js';

export const profilerMiddleware = (req, res, next) => {
  const start = performance.now();

  res.on('finish', () => {
    const duration = performance.now() - start;
    // Don't record internal monitor polling to avoid feedback noise
    if (!req.path.startsWith('/api/v1/system/monitor')) {
      systemProfiler.recordRequest(req.method, req.originalUrl || req.url, res.statusCode, duration);
    }
  });

  next();
};
