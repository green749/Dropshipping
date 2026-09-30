import { performance } from 'perf_hooks';

async function measureComparison() {
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@dropship.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData?.data?.accessToken || loginData?.data?.token;

  if (!token) {
    console.error('Authentication failed');
    return;
  }

  const iterations = 20;

  // 1. Paginated Request Test (Limit 5 items)
  const paginatedLatencies = [];
  let paginatedSize = 0;
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const res = await fetch('http://localhost:5000/api/v1/products?page=1&limit=5', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const text = await res.text();
    paginatedLatencies.push(performance.now() - start);
    paginatedSize = text.length;
  }

  // 2. Large Fetch Test (Simulating fetching full dataset)
  const fullLatencies = [];
  let fullSize = 0;
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const res = await fetch('http://localhost:5000/api/v1/products?page=1&limit=100', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const text = await res.text();
    fullLatencies.push(performance.now() - start);
    fullSize = text.length;
  }

  const avgPaginated = (paginatedLatencies.reduce((a,b)=>a+b,0)/iterations).toFixed(2);
  const avgFull = (fullLatencies.reduce((a,b)=>a+b,0)/iterations).toFixed(2);

  console.log('============================================================');
  console.log('📊 MEASURED PAGINATION PERFORMANCE COMPARISON (20 Runs)');
  console.log('============================================================');
  console.log(`📦 Payload Size:`);
  console.log(`   • Paginated (5 items):  ${(paginatedSize / 1024).toFixed(2)} KB`);
  console.log(`   • Unpaginated (Full):   ${(fullSize / 1024).toFixed(2)} KB`);
  console.log(`   • Bandwidth Saved:      ${(((fullSize - paginatedSize) / fullSize) * 100).toFixed(1)}%\n`);

  console.log(`⚡ Response Latency (Avg):`);
  console.log(`   • Paginated:            ${avgPaginated} ms`);
  console.log(`   • Full / Unpaginated:   ${avgFull} ms`);
  console.log('============================================================');
}

measureComparison().catch(console.error);
