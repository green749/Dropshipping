import Redis from 'ioredis';
import { env } from './env.js';

let redisClient = null;
let isRedisConnected = false;

if (env.REDIS.ENABLED) {
  try {
    const redisOptions = {
      host: env.REDIS.HOST,
      port: env.REDIS.PORT,
      password: env.REDIS.PASSWORD || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 10) {
          // Fall back gracefully after 10 attempts
          return null;
        }
        return Math.min(times * 150, 2000);
      },
      reconnectOnError(err) {
        const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNREFUSED'];
        return targetErrors.some((target) => err.message.includes(target));
      },
    };

    redisClient = new Redis(redisOptions);

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log(`[Redis] 🚀 Connected to Redis server at ${env.REDIS.HOST}:${env.REDIS.PORT}`);
    });

    redisClient.on('ready', () => {
      isRedisConnected = true;
      console.log(`[Redis] ✅ Redis client is ready for caching operations.`);
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
      // Log concise warning without crashing microservices
      console.warn(`[Redis] ⚠️ Warning: Redis connection issue (${err.message}). In-memory fallback active.`);
    });

    redisClient.on('close', () => {
      isRedisConnected = false;
    });

    // Initiate non-blocking connection
    redisClient.connect().catch(() => {
      // Handled in 'error' event
    });
  } catch (err) {
    console.warn(`[Redis] Failed to initialize Redis client (${err.message}). In-memory fallback active.`);
  }
} else {
  console.log(`[Redis] Caching running in local in-memory fallback mode.`);
}

export { redisClient, isRedisConnected };
