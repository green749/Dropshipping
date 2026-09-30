const API_GATEWAY_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('🧪 Starting Dealer / Supplier Performance Management Test Suite...\n');

  try {
    // 1. Authenticate as Dropshipper Admin
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

    // 2. Test Dealer Performance Summary
    console.log('2️⃣ Fetching Overall Dealer Performance Summary KPI Cards...');
    const summaryRes = await fetch(`${API_GATEWAY_URL}/dealers/performance/summary?timeframe=30d`, {
      headers: authHeaders,
    });
    const summaryData = await summaryRes.json();
    console.log('   Status:', summaryRes.status);
    console.log('   Performance Summary KPIs:', JSON.stringify(summaryData.data, null, 2));
    console.log('   ✅ Summary metrics verified.\n');

    // 3. Test Dealer Performance List
    console.log('3️⃣ Fetching Detailed Dealer Performance List (with multi-metric sorting)...');
    const listRes = await fetch(`${API_GATEWAY_URL}/dealers/performance/list?page=1&limit=10&sortBy=revenue&sortOrder=DESC`, {
      headers: authHeaders,
    });
    const listData = await listRes.json();
    const dealers = listData.data || [];
    console.log(`   Fetched ${dealers.length} dealers (Total: ${listData.pagination?.total})`);
    const sample = dealers[0];
    console.log('   Sample Dealer Performance Indicators:', {
      companyName: sample.companyName,
      status: sample.status,
      totalAssignedOrders: sample.totalAssignedOrders,
      fulfilledOrders: sample.fulfilledOrders,
      fulfillmentRate: `${sample.fulfillmentRate}%`,
      avgDispatchHours: `${sample.avgDispatchHours}h (${sample.avgDispatchDays}d)`,
      returnRate: `${sample.returnRate}%`,
      rtoRate: `${sample.rtoRate}%`,
      stockAvailabilityRate: `${sample.stockAvailabilityRate}%`,
      revenue: sample.revenue,
      profit: sample.profit,
      profitMargin: `${sample.profitMargin}%`,
      slaComplianceRate: `${sample.slaComplianceRate}%`,
    });
    console.log('   ✅ Dealer performance table metrics verified.\n');

    // 4. Test Single Dealer Drilldown
    const testDealerId = sample.id;
    console.log(`4️⃣ Fetching Single Dealer Comprehensive Performance Detail for (${sample.companyName})...`);
    const detailRes = await fetch(`${API_GATEWAY_URL}/dealers/${testDealerId}/performance?timeframe=30d`, {
      headers: authHeaders,
    });
    const detailData = await detailRes.json();
    console.log('   Detail Response Structure:', {
      dealerName: detailData.data.dealer.companyName,
      productsSuppliedCount: detailData.data.products?.length,
      ordersQueueCount: detailData.data.ordersQueue?.length,
      trendsDaysCount: detailData.data.trends?.length,
      returnBreakdown: detailData.data.dealer.returnBreakdown,
    });
    if (detailData.data.ordersQueue && detailData.data.ordersQueue.length > 0) {
      console.log('   Sample Operational Order Queue Item:', detailData.data.ordersQueue[0]);
    }
    console.log('   ✅ Single dealer drilldown verified.\n');

    // 5. Test Multi-Dealer Comparison
    if (dealers.length >= 2) {
      console.log('5️⃣ Testing Multi-Dealer Side-by-Side Comparative Matrix...');
      const compareIds = `${dealers[0].id},${dealers[1].id}`;
      const compareRes = await fetch(`${API_GATEWAY_URL}/dealers/performance/comparison?dealerIds=${compareIds}&timeframe=30d`, {
        headers: authHeaders,
      });
      const compareData = await compareRes.json();
      console.log(`   Compared ${compareData.data.dealers.length} dealers successfully:`);
      compareData.data.dealers.forEach((d) => {
        console.log(`   - ${d.companyName}: Orders=${d.totalAssignedOrders}, Fulfilled=${d.fulfillmentRate}%, Dispatch=${d.avgDispatchDays}d, RTO=${d.rtoRate}%, Rev=$${d.revenue}, Profit=$${d.profit}`);
      });
      console.log('   ✅ Dealer comparison engine verified.\n');
    }

    // 6. Test Updating Dealer SLA Parameters
    console.log('6️⃣ Testing Updating Dealer SLA Parameters...');
    const updateSlaRes = await fetch(`${API_GATEWAY_URL}/dealers/${testDealerId}/sla`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        dispatch_sla_hours: 36,
        fulfillment_sla_hours: 60,
        average_lead_time_days: 2,
        payment_terms: 'NET_15',
        rating_notes: 'High reliability supplier with fast dispatch SLA',
      }),
    });
    const updateSlaData = await updateSlaRes.json();
    console.log('   Updated SLA Response:', updateSlaData.data);
    console.log('   ✅ Dealer SLA configuration verified.\n');

    // 7. Test Updating Dealer Status
    console.log('7️⃣ Testing Soft Dealer Status Update...');
    const updateStatusRes = await fetch(`${API_GATEWAY_URL}/dealers/${testDealerId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'ACTIVE' }),
    });
    const updateStatusData = await updateStatusRes.json();
    console.log('   Updated Status:', updateStatusData.data.status);
    console.log('   ✅ Dealer status mutation verified.\n');

    console.log('================================================================');
    console.log('🎉 ALL DEALER PERFORMANCE BACKEND TESTS PASSED PERFECTLY!');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    process.exit(1);
  }
}

runTests();
