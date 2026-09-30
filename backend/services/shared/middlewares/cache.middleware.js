import { CacheService } from '../services/cache.service.js';

/**
 * Express Middleware for automated route-level caching
 * @param {number} [ttlSeconds=300] - Cache time-to-live in seconds
 * @param {(req: import('express').Request) => string} [customKeyGen] - Optional custom key generator
 */
export const cacheMiddleware = (ttlSeconds = 300, customKeyGen = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const userContext = req.user ? `${req.user.role}:${req.user.id}` : 'public';
      const cacheKey = customKeyGen
        ? customKeyGen(req)
        : CacheService.generateKey(req.baseUrl + req.path, {
            ...req.query,
            _ctx: userContext,
          });

      const cached = await CacheService.get(cacheKey);

      if (cached !== null) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        return res.status(200).json(cached);
      }

      // Cache MISS -> Intercept res.json to store in cache before sending
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Only cache successful 200 responses
        if (res.statusCode === 200 && body) {
          CacheService.set(cacheKey, body, ttlSeconds).catch((err) => {
            console.warn('[CacheMiddleware] Failed to store in cache:', err.message);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.warn('[CacheMiddleware] Error in cache middleware:', err.message);
      next();
    }
  };
};

/**
 * Invalidate cache patterns (e.g. ['products:*', 'campaigns:*'])
 * @param {string|string[]} patterns
 */
export const purgeCache = async (patterns) => {
  try {
    const patternList = Array.isArray(patterns) ? patterns : [patterns];
    for (const pattern of patternList) {
      await CacheService.delByPattern(pattern);
    }
  } catch (err) {
    console.warn('[CacheMiddleware] Failed to purge cache patterns:', err.message);
  }
};
