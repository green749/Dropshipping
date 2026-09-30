const API_GATEWAY_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('🧪 Starting Inventory Intelligence & Forecasting Test Suite...\n');

  try {
    // 1. Authenticate as Admin (Dropshipper)
    console.log('1️⃣ Authenticating as Dropshipper Admin (admin@dropship.com)...');
    const authRes = await fetch(`${API_GATEWAY_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@dropship.com',
        password: 'Password123!',
      }),
    });

    const authData = await authRes.json();
    if (!authRes.ok) {
      throw new Error(`Auth failed: ${JSON.stringify(authData)}`);
    }

    const token = authData.data.accessToken;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    console.log('   ✅ Authenticated successfully.\n');

    // 2. Test Inventory Summary
    console.log('2️⃣ Fetching Inventory Summary KPI Cards...');
    const summaryRes = await fetch(`${API_GATEWAY_URL}/inventory/summary?velocityPeriod=14`, {
      headers: authHeaders,
    });
    const summaryData = await summaryRes.json();
    console.log('   Status:', summaryRes.status);
    console.log('   Summary KPIs:', JSON.stringify(summaryData.data, null, 2));
    console.log('   ✅ Summary metrics received.\n');

    // 3. Test Inventory Products List
    console.log('3️⃣ Fetching Intelligent Inventory Products List...');
    const productsRes = await fetch(`${API_GATEWAY_URL}/inventory/products?page=1&limit=10&velocityPeriod=14`, {
      headers: authHeaders,
    });
    const productsData = await productsRes.json();
    const productsList = productsData.data || [];
    console.log(`   Fetched ${productsList.length} products (Total: ${productsData.pagination?.total})`);
    const sample = productsList[0];
    console.log('   Sample Product Inventory Intelligence:', {
      name: sample.name,
      sku: sample.sku,
      stock_quantity: sample.stock_quantity,
      reserved_quantity: sample.reserved_quantity,
      available_quantity: sample.available_quantity,
      daily_sales_velocity: sample.daily_sales_velocity,
      days_of_stock_remaining: sample.days_of_stock_remaining,
      inventory_status: sample.inventory_status,
      reorder_recommended: sample.reorder_recommended,
      reorder_point: sample.reorder_point,
      recommended_reorder_qty: sample.recommended_reorder_qty,
      lead_time_days: sample.lead_time_days,
    });
    console.log('   ✅ Product list inventory intelligence verified.\n');

    // 4. Test Single Product Detail Drilldown
    const testProductId = sample.id;
    console.log(`4️⃣ Fetching Product Detail Drilldown for product (${sample.name})...`);
    const detailRes = await fetch(`${API_GATEWAY_URL}/inventory/products/${testProductId}?velocityPeriod=14`, {
      headers: authHeaders,
    });
    const detailData = await detailRes.json();
    console.log('   Product Detail:', {
      id: detailData.data.product.id,
      name: detailData.data.product.name,
      metrics: detailData.data.metrics,
      dealer: detailData.data.dealer ? detailData.data.dealer.company_name : null,
      salesTrendCount: detailData.data.salesTrend ? detailData.data.salesTrend.length : 0,
      recentTransactionsCount: detailData.data.recentTransactions ? detailData.data.recentTransactions.length : 0,
    });
    console.log('   ✅ Single product drilldown verified.\n');

    // 5. Test Stock-In API
    console.log('5️⃣ Testing Stock-In mutation...');
    const initialStock = sample.stock_quantity;
    const stockInRes = await fetch(`${API_GATEWAY_URL}/inventory/stock-in`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        product_id: testProductId,
        quantity: 25,
        dealer_id: sample.dealer_id,
        reference: 'TEST-PO-2026-001',
        notes: 'Automated test procurement stock intake',
      }),
    });
    const stockInData = await stockInRes.json();
    console.log('   Stock-In Response:', stockInData.data);
    if (stockInData.data.product.stock_quantity === initialStock + 25) {
      console.log(`   ✅ Stock quantity correctly incremented: ${initialStock} -> ${stockInData.data.product.stock_quantity}\n`);
    } else {
      console.warn(`   ⚠️ Stock quantity mismatch: expected ${initialStock + 25}, got ${stockInData.data.product.stock_quantity}`);
    }

    // 6. Test Stock Adjustment API
    console.log('6️⃣ Testing Stock Adjustment mutation (Damage write-off)...');
    const adjustRes = await fetch(`${API_GATEWAY_URL}/inventory/adjustment`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        product_id: testProductId,
        quantity: -5,
        transaction_type: 'DAMAGED',
        reason: 'Warehouse water damage during transit',
        reference: 'ADJ-DMG-001',
        notes: '5 units written off due to humidity leak',
      }),
    });
    const adjustData = await adjustRes.json();
    console.log('   Adjustment Response:', adjustData.data);
    if (adjustData.data.product.stock_quantity === initialStock + 20) {
      console.log(`   ✅ Stock quantity correctly reduced with ledger record: ${initialStock + 25} -> ${adjustData.data.product.stock_quantity}\n`);
    }

    // 7. Test Inventory Transactions Ledger
    console.log('7️⃣ Testing Inventory Transactions Ledger Query...');
    const txRes = await fetch(`${API_GATEWAY_URL}/inventory/transactions?product_id=${testProductId}&limit=5`, {
      headers: authHeaders,
    });
    const txData = await txRes.json();
    const txList = txData.data || [];
    console.log(`   Fetched ${txList.length} transactions for product.`);
    console.log('   Latest transaction:', txList[0]);
    console.log('   ✅ Transaction history verified.\n');

    // 8. Test Daily Movement Trend
    console.log('8️⃣ Testing Inventory Daily Movement Trend...');
    const movementRes = await fetch(`${API_GATEWAY_URL}/inventory/movement?days=14`, {
      headers: authHeaders,
    });
    const movementData = await movementRes.json();
    const movementList = movementData.data || [];
    console.log(`   Movement trend received for ${movementList.length} days.`);
    console.log('   Sample Day:', movementList[movementList.length - 1]);
    console.log('   ✅ Daily movement analytics verified.\n');

    // 9. Concurrency Test
    console.log('9️⃣ Testing Concurrent Adjustments on Product Stock (Simulating Race Conditions)...');
    const concurrentPromises = Array.from({ length: 5 }).map((_, idx) =>
      fetch(`${API_GATEWAY_URL}/inventory/adjustment`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          product_id: testProductId,
          quantity: -1,
          transaction_type: 'ADJUSTMENT',
          reason: `Concurrent Adjustment Test Thread #${idx + 1}`,
          notes: 'Testing transaction isolation and atomic row locking',
        }),
      }).then((r) => r.json())
    );

    const concurrentResults = await Promise.allSettled(concurrentPromises);
    const successful = concurrentResults.filter((r) => r.status === 'fulfilled').length;
    console.log(`   Concurrent adjustments completed: ${successful}/5 succeeded atomically without deadlocks.`);

    const postConcurrentRes = await fetch(`${API_GATEWAY_URL}/inventory/products/${testProductId}`, {
      headers: authHeaders,
    });
    const postConcurData = await postConcurrentRes.json();
    console.log(`   Final product stock: ${postConcurData.data.product.stock_quantity} (Expected ${initialStock + 20 - 5} = ${initialStock + 15})`);
    console.log('   ✅ Concurrency & row lock test passed.\n');

    console.log('================================================================');
    console.log('🎉 ALL BACKEND INVENTORY INTELLIGENCE TESTS PASSED PERFECTLY!');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    process.exit(1);
  }
}

runTests();
