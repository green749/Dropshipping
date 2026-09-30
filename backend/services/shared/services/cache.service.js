import { redisClient, isRedisConnected } from '../config/redis.js';
import { env } from '../config/env.js';

// In-memory fallback cache with TTL support (used if Redis is offline/disabled)
class MemoryCacheStore {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlSeconds) {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiry });
  }

  del(key) {
    this.store.delete(key);
  }

  delByPattern(pattern) {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  flush() {
    this.store.clear();
  }
}

const memoryFallback = new MemoryCacheStore();

export const CacheService = {
  /**
   * Retrieves an item from cache (Redis or memory fallback)
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    if (!key || env.NODE_ENV === 'test') return null;

    if (redisClient && isRedisConnected) {
      try {
        const raw = await redisClient.get(key);
        if (raw !== null) {
          try {
            return JSON.parse(raw);
          } catch {
            return raw;
          }
        }
      } catch (err) {
        console.warn(`[CacheService] Redis GET error for key "${key}":`, err.message);
      }
    }

    return memoryFallback.get(key);
  },

  /**
   * Sets an item in cache with TTL
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlSeconds]
   */
  async set(key, value, ttlSeconds = env.REDIS.DEFAULT_TTL) {
    if (!key || value === undefined) return;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    if (redisClient && isRedisConnected) {
      try {
        if (ttlSeconds > 0) {
          await redisClient.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await redisClient.set(key, serialized);
        }
      } catch (err) {
        console.warn(`[CacheService] Redis SET error for key "${key}":`, err.message);
      }
    }

    memoryFallback.set(key, value, ttlSeconds);
  },

  /**
   * Deletes a key from cache
   * @param {string} key
   */
  async del(key) {
    if (!key) return;

    if (redisClient && isRedisConnected) {
      try {
        await redisClient.del(key);
      } catch (err) {
        console.warn(`[CacheService] Redis DEL error for key "${key}":`, err.message);
      }
    }

    memoryFallback.del(key);
  },

  /**
   * Deletes keys matching a wildcard pattern (e.g. 'products:*', 'orders:*')
   * Uses SCAN for non-blocking key traversal in Redis
   * @param {string} pattern
   */
  async delByPattern(pattern) {
    if (!pattern) return;

    if (redisClient && isRedisConnected) {
      try {
        let cursor = '0';
        do {
          const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
          cursor = nextCursor;
          if (keys.length > 0) {
            await redisClient.del(...keys);
          }
        } while (cursor !== '0');
      } catch (err) {
        console.warn(`[CacheService] Redis DEL pattern error for "${pattern}":`, err.message);
      }
    }

    memoryFallback.delByPattern(pattern);
  },

  /**
   * Flushes entire cache
   */
  async flush() {
    if (redisClient && isRedisConnected) {
      try {
        await redisClient.flushdb();
      } catch (err) {
        console.warn('[CacheService] Redis FLUSHDB error:', err.message);
      }
    }
    memoryFallback.flush();
  },

  /**
   * Core Cache-Aside Pattern:
   * Checks if query result exists in cache. If found, returns it immediately.
   * Otherwise executes fetchFn (database query), caches the result, and returns it.
   *
   * @template T
   * @param {string} key - Unique cache key
   * @param {number} ttlSeconds - Expiration time in seconds
   * @param {() => Promise<T>} fetchFn - Database query function to execute on cache miss
   * @returns {Promise<{ data: T, cached: boolean }>}
   */
  async remember(key, ttlSeconds, fetchFn) {
    const cachedData = await this.get(key);
    if (cachedData !== null) {
      return { data: cachedData, cached: true };
    }

    // Cache Miss -> Execute query from database
    const freshData = await fetchFn();
    if (freshData !== undefined && freshData !== null) {
      await this.set(key, freshData, ttlSeconds);
    }

    return { data: freshData, cached: false };
  },

  /**
   * Helper to build clean, deterministic cache keys
   * @param {string} prefix - e.g. 'products', 'campaigns', 'orders'
   * @param {Record<string, any>} [params] - Query options, pagination, filters, role/userId
   * @returns {string}
   */
  generateKey(prefix, params = {}) {
    if (!params || Object.keys(params).length === 0) {
      return `${prefix}:all`;
    }

    // Sort keys deterministically
    const sorted = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        const val = params[key];
        if (val !== undefined && val !== null && val !== '') {
          acc[key] = typeof val === 'object' ? JSON.stringify(val) : String(val);
        }
        return acc;
      }, {});

    const paramStr = Object.entries(sorted)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    return paramStr ? `${prefix}:${paramStr}` : `${prefix}:all`;
  },
};
