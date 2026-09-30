const BASE_URL = 'http://localhost:5000/api/v1';

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function testFinances() {
  console.log('🚀 Starting Profit & Expense Management API Verification...\n');

  try {
    // 1. Authenticate as Admin (DROPSHIPPER)
    console.log('1. Authenticating as Admin (admin@dropship.com)...');
    const loginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@dropship.com',
        password: 'Password123!',
      }),
    });

    const token = loginRes.data?.accessToken || loginRes.accessToken;
    console.log('✅ Authenticated successfully. Token acquired.\n');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Fetch Businesses to get active business ID
    console.log('2. Fetching Businesses for admin...');
    const bizRes = await request(`${BASE_URL}/businesses`, { headers });
    const businesses = bizRes.data || bizRes;
    const businessId = businesses[0]?.id;
    console.log(`✅ Found ${businesses.length} businesses. Testing with businessId: ${businessId}\n`);

    // 3. Test Profit Summary API
    console.log('3. Testing GET /finances/summary...');
    const summaryRes = await request(`${BASE_URL}/finances/summary?business_id=${businessId}&period=30d`, { headers });
    console.log('✅ Profit Summary Result:');
    console.log(JSON.stringify(summaryRes.data, null, 2));
    console.log();

    // 4. Test Profit Timeline API
    console.log('4. Testing GET /finances/timeline...');
    const timelineRes = await request(`${BASE_URL}/finances/timeline?business_id=${businessId}&period=30d`, { headers });
    console.log(`✅ Profit Timeline returned ${timelineRes.data?.length} daily points.`);
    if (timelineRes.data?.length > 0) {
      console.log('Sample point:', timelineRes.data[0]);
    }
    console.log();

    // 5. Test Product Profitability API
    console.log('5. Testing GET /finances/products...');
    const prodRes = await request(`${BASE_URL}/finances/products?business_id=${businessId}`, { headers });
    console.log(`✅ Product Profitability returned ${prodRes.data?.length} products.`);
    if (prodRes.data?.length > 0) {
      console.log('Sample product profitability:', prodRes.data[0]);
    }
    console.log();

    // 6. Test Expense List API
    console.log('6. Testing GET /expenses...');
    const expListRes = await request(`${BASE_URL}/expenses?business_id=${businessId}`, { headers });
    console.log(`✅ Expenses returned ${expListRes.data?.length} records.`);
    console.log();

    // 7. Test Expense Summary API
    console.log('7. Testing GET /expenses/summary...');
    const expSummaryRes = await request(`${BASE_URL}/expenses/summary?business_id=${businessId}`, { headers });
    console.log('✅ Expense summary by category:', expSummaryRes.data);
    console.log();

    // 8. Test Expense Creation
    console.log('8. Testing POST /expenses (Create Expense)...');
    const newExpRes = await request(`${BASE_URL}/expenses`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        business_id: businessId,
        category: 'Software',
        description: 'Shopify Plus & Automation Tooling',
        amount: 2999.0,
        date: '2026-09-28',
        reference: 'INV-TEST-001',
        notes: 'Monthly billing automated test',
      }),
    });
    const createdExpense = newExpRes.data;
    console.log('✅ Expense created:', createdExpense.id, '-', createdExpense.description);
    console.log();

    // 9. Test Expense Update
    console.log(`9. Testing PUT /expenses/${createdExpense.id}...`);
    const updateExpRes = await request(`${BASE_URL}/expenses/${createdExpense.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        amount: 3499.0,
        notes: 'Updated monthly billing amount',
      }),
    });
    console.log('✅ Expense updated amount:', updateExpRes.data.amount);
    console.log();

    // 10. Test Expense Deletion
    console.log(`10. Testing DELETE /expenses/${createdExpense.id}...`);
    const delExpRes = await request(`${BASE_URL}/expenses/${createdExpense.id}`, {
      method: 'DELETE',
      headers,
    });
    console.log('✅ Expense deleted successfully:', delExpRes);
    console.log();

    console.log('🎉 ALL PROFIT & EXPENSE ENDPOINTS VERIFIED AND WORKING FLAWLESSLY!');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

testFinances();
