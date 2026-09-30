import { redisClient, isRedisConnected } from '../services/shared/config/redis.js';

async function inspectCache() {
  console.log('\n======================================================');
  console.log('🔍 REDIS CACHE INSPECTION DASHBOARD');
  console.log('======================================================\n');

  if (!redisClient) {
    console.error('❌ Redis client is not initialized.');
    process.exit(1);
  }

  try {
    const ping = await redisClient.ping();
    const dbsize = await redisClient.dbsize();
    const info = await redisClient.info('memory');

    // Parse memory used
    const memoryMatch = info.match(/used_memory_human:(.+)/);
    const memoryUsed = memoryMatch ? memoryMatch[1].trim() : 'N/A';

    console.log(`📡 Connection Status : CONNECTED (${ping})`);
    console.log(`📦 Total Cached Keys : ${dbsize}`);
    console.log(`💾 Memory Usage      : ${memoryUsed}\n`);

    const keys = await redisClient.keys('*');

    if (keys.length === 0) {
      console.log('ℹ️  The cache is currently empty.');
      console.log('   (Keys are created when you browse products, view orders, or fetch analytics in the frontend).\n');
    } else {
      console.log('📋 Current Active Cache Keys:');
      console.log('-------------------------------------------------------------------------------------');
      console.log('| Key Name                                    | TTL (Seconds) | Data Preview        |');
      console.log('-------------------------------------------------------------------------------------');

      for (const key of keys) {
        const ttl = await redisClient.ttl(key);
        const type = await redisClient.type(key);
        let preview = '';

        if (type === 'string') {
          const val = await redisClient.get(key);
          preview = val ? (val.length > 30 ? val.substring(0, 30) + '...' : val) : 'null';
        } else if (type === 'hash') {
          preview = '[Hash Map]';
        } else if (type === 'list' || type === 'set') {
          preview = `[${type.toUpperCase()}]`;
        } else {
          preview = `[${type}]`;
        }

        const formattedKey = key.padEnd(43, ' ').substring(0, 43);
        const formattedTtl = (ttl === -1 ? 'No Expiry' : ttl === -2 ? 'Expired' : `${ttl}s`).padEnd(13, ' ');
        const formattedPreview = preview.padEnd(20, ' ').substring(0, 20);

        console.log(`| ${formattedKey} | ${formattedTtl} | ${formattedPreview} |`);
      }
      console.log('-------------------------------------------------------------------------------------\n');
    }

    console.log('💡 Tips:');
    console.log('  • To watch live cache traffic in real-time : docker exec -it dropship-redis redis-cli MONITOR');
    console.log('  • To flush/clear all cache data            : docker exec -it dropship-redis redis-cli FLUSHALL\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error inspecting cache:', err.message);
    process.exit(1);
  }
}

inspectCache();
