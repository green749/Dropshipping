import http from 'http';
import https from 'https';
import { performance } from 'perf_hooks';
import pg from 'pg';
import { env } from '../services/shared/config/env.js';

// Configuration
const GATEWAY_URL = 'http://localhost:5000';
const SERVICES = [
  { name: 'API Gateway', url: 'http://localhost:5000/health', port: 5000 },
  { name: 'Auth Service', url: 'http://localhost:5001/health', port: 5001 },
  { name: 'Business Service', url: 'http://localhost:5002/health', port: 5002 },
  { name: 'Product Service', url: 'http://localhost:5003/health', port: 5003 },
  { name: 'Order Service', url: 'http://localhost:5004/health', port: 5004 },
  { name: 'Marketing Service', url: 'http://localhost:5005/health', port: 5005 },
  { name: 'Analytics Service', url: 'http://localhost:5006/health', port: 5006 },
];

const ENDPOINTS_TO_BENCHMARK = [
  { name: 'Gateway Health Check', path: '/health', method: 'GET' },
  { name: 'Gateway Welcome Info', path: '/', method: 'GET' },
  { name: 'Swagger Docs UI', path: '/docs', method: 'GET' },
];

function httpGet(urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const start = performance.now();
    const req = http.get(url, { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const duration = performance.now() - start;
        resolve({
          statusCode: res.statusCode,
          duration: Math.round(duration * 100) / 100,
          dataLength: data.length,
          headers: res.headers,
        });
      });
    });

    req.on('error', (err) => {
      const duration = performance.now() - start;
      resolve({
        statusCode: 0,
        duration: Math.round(duration * 100) / 100,
        error: err.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        statusCode: 408,
        duration: 3000,
        error: 'Timeout after 3000ms',
      });
    });
  });
}

function calculatePercentiles(latencies) {
  if (!latencies.length) return { min: 0, max: 0, avg: 0, p50: 0, p90: 0, p95: 0, p99: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const avg = sum / sorted.length;
  const p = (pct) => sorted[Math.min(Math.floor((pct / 100) * sorted.length), sorted.length - 1)];

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: Math.round(avg * 100) / 100,
    p50: p(50),
    p90: p(90),
    p95: p(95),
    p99: p(99),
  };
}

async function benchmarkEndpoint(endpoint, totalRequests = 50, concurrency = 10) {
  const latencies = [];
  let successful = 0;
  let failed = 0;
  const url = `${GATEWAY_URL}${endpoint.path}`;

  const batches = Math.ceil(totalRequests / concurrency);
  const startOverall = performance.now();

  for (let b = 0; b < batches; b++) {
    const currentBatchSize = Math.min(concurrency, totalRequests - b * concurrency);
    const promises = Array.from({ length: currentBatchSize }, () => httpGet(url));
    const results = await Promise.all(promises);

    for (const res of results) {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        successful++;
        latencies.push(res.duration);
      } else {
        failed++;
      }
    }
  }

  const totalTimeSec = (performance.now() - startOverall) / 1000;
  const rps = Math.round((totalRequests / totalTimeSec) * 100) / 100;
  const stats = calculatePercentiles(latencies);

  return {
    endpoint: endpoint.name,
    path: endpoint.path,
    totalRequests,
    concurrency,
    successful,
    failed,
    rps,
    ...stats,
  };
}

async function testDatabasePerformance() {
  const client = new pg.Client({
    host: env.DB.HOST,
    port: env.DB.PORT,
    user: env.DB.USER,
    password: env.DB.PASSWORD,
    database: env.DB.NAME || 'postgres',
  });

  const dbStart = performance.now();
  try {
    await client.connect();
    const connectDuration = performance.now() - dbStart;

    // Simple query benchmark
    const queryLatencies = [];
    for (let i = 0; i < 20; i++) {
      const qStart = performance.now();
      await client.query('SELECT 1 as ping, NOW() as current_time');
      queryLatencies.push(performance.now() - qStart);
    }

    // Active databases inspection
    const dbsRes = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
    const databases = dbsRes.rows.map((r) => r.datname);

    await client.end();

    const queryStats = calculatePercentiles(queryLatencies);

    return {
      status: 'UP',
      connectDurationMs: Math.round(connectDuration * 100) / 100,
      databases,
      queryStats,
    };
  } catch (err) {
    return {
      status: 'DOWN',
      error: err.message,
    };
  }
}

async function runBenchmark() {
  console.log('\n============================================================');
  console.log('⚡ BACKEND PERFORMANCE PROFILER & BENCHMARK SUITE');
  console.log('============================================================\n');

  // 1. Process & Memory Profiling
  const mem = process.memoryUsage();
  console.log('📊 [1/4] PROCESS & RUNTIME METRICS:');
  console.log(`- Node.js Version: ${process.version}`);
  console.log(`- Platform: ${process.platform} (${process.arch})`);
  console.log(`- Process Uptime: ${Math.round(process.uptime())}s`);
  console.log(`- RSS Memory: ${(mem.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Heap Total: ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- External Memory: ${(mem.external / 1024 / 1024).toFixed(2)} MB\n`);

  // 2. Microservice Health & Latency Ping
  console.log('🏥 [2/4] MICROSERVICES HEALTH & PING LATENCY:');
  const servicePings = [];
  for (const s of SERVICES) {
    const res = await httpGet(s.url);
    const statusIcon = res.statusCode === 200 ? '✅ UP' : res.statusCode === 0 ? '❌ DOWN' : `⚠️ HTTP ${res.statusCode}`;
    console.log(`  • ${s.name.padEnd(20)} [Port ${s.port}]: ${statusIcon.padEnd(10)} | Latency: ${res.duration.toFixed(2)} ms`);
    servicePings.push({ name: s.name, port: s.port, status: res.statusCode === 200 ? 'UP' : 'DOWN', latency: res.duration });
  }

  // 3. Database Latency
  console.log('\n🐘 [3/4] POSTGRESQL DATABASE BENCHMARK:');
  const dbResult = await testDatabasePerformance();
  if (dbResult.status === 'UP') {
    console.log(`  ✅ Connection Latency: ${dbResult.connectDurationMs} ms`);
    console.log(`  ✅ Query Latency (Avg): ${dbResult.queryStats.avg} ms (Min: ${dbResult.queryStats.min.toFixed(2)}ms, Max: ${dbResult.queryStats.max.toFixed(2)}ms, P95: ${dbResult.queryStats.p95.toFixed(2)}ms)`);
    console.log(`  ✅ Discovered DBs: ${dbResult.databases.join(', ')}`);
  } else {
    console.log(`  ❌ Database Connection Failed: ${dbResult.error}`);
  }

  // 4. API Gateway Throughput & Concurrency Benchmark
  console.log('\n🚀 [4/4] API GATEWAY CONCURRENCY & THROUGHPUT STRESS TEST (50 Requests, 10 Concurrent):');
  for (const ep of ENDPOINTS_TO_BENCHMARK) {
    const result = await benchmarkEndpoint(ep, 50, 10);
    console.log(`\n  📍 Endpoint: ${result.endpoint} (${result.path})`);
    console.log(`     - Success: ${result.successful}/${result.totalRequests} (Failures: ${result.failed})`);
    console.log(`     - Throughput: ${result.rps} requests/sec`);
    console.log(`     - Latency -> Avg: ${result.avg}ms | Min: ${result.min}ms | Max: ${result.max}ms`);
    console.log(`     - Percentiles -> P50: ${result.p50}ms | P90: ${result.p90}ms | P95: ${result.p95}ms | P99: ${result.p99}ms`);
  }

  console.log('\n============================================================');
  console.log('✨ BENCHMARK COMPLETE');
  console.log('============================================================\n');
}

runBenchmark().catch(console.error);
