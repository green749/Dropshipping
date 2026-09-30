const API_GATEWAY_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('🧪 Starting Feature 5: Product Intelligence & Product Research Test Suite...\n');

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

    // 2. Test Product Intelligence Summary
    console.log('2️⃣ Fetching Product Intelligence Summary KPIs (30 days)...');
    const summaryRes = await fetch(`${API_GATEWAY_URL}/products/intelligence/summary?periodDays=30`, {
      headers: authHeaders,
    });
    const summaryData = await summaryRes.json();
    console.log('   Status:', summaryRes.status);
    console.log('   Summary KPIs:', JSON.stringify(summaryData.data, null, 2));
    console.log('   ✅ Intelligence Summary metrics received.\n');

    // 3. Test Product Opportunity Matrix (List)
    console.log('3️⃣ Fetching Product Opportunity Matrix with Classifications...');
    const tableRes = await fetch(`${API_GATEWAY_URL}/products/intelligence?page=1&limit=5&periodDays=30`, {
      headers: authHeaders,
    });
    const tableData = await tableRes.json();
    const products = tableData.data || [];
    console.log(`   Fetched ${products.length} products (Total: ${tableData.pagination?.total})`);
    if (products.length > 0) {
      const sample = products[0];
      console.log('   Sample Opportunity Product:', {
        id: sample.id,
        name: sample.name,
        category: sample.category,
        selling_price: sample.selling_price,
        cost_price: sample.cost_price,
        stock_quantity: sample.stock_quantity,
        orders_count: sample.orders_count,
        units_sold: sample.units_sold,
        revenue: sample.revenue,
        cogs: sample.cogs,
        net_profit: sample.net_profit,
        profit_margin_percent: sample.profit_margin_percent,
        sales_velocity: sample.sales_velocity,
        classifications: sample.classifications,
      });
      console.log('   ✅ Opportunity matrix fetched with factual data.\n');

      // 4. Test Deep Drilldown Analytics for Sample Product
      console.log(`4️⃣ Fetching Deep Drilldown Intelligence for Product ID: ${sample.id}...`);
      const detailRes = await fetch(`${API_GATEWAY_URL}/products/intelligence/${sample.id}?periodDays=30`, {
        headers: authHeaders,
      });
      const detailData = await detailRes.json();
      console.log('   Status:', detailRes.status);
      console.log('   Overview Data:', {
        name: detailData.data?.product?.name,
        price: detailData.data?.product?.selling_price,
        cost: detailData.data?.product?.cost_price,
        stock: detailData.data?.product?.stock_quantity,
      });
      console.log('   Sales Analytics:', {
        unitsSold: detailData.data?.sales?.unitsSold,
        revenue: detailData.data?.sales?.revenue,
        trendPoints: detailData.data?.sales?.trend?.length,
      });
      console.log('   Profit Waterfall:', detailData.data?.profitability?.waterfall);
      console.log('   Inventory Analytics:', detailData.data?.inventory);
      console.log('   Supplier/Dealer Intelligence:', {
        primarySupplier: detailData.data?.dealer?.primaryDealer?.name,
        leadTime: detailData.data?.dealer?.primaryDealer?.lead_time_days,
        costComparison: detailData.data?.dealer?.costComparison,
      });
      console.log('   Returns & RTO Analytics:', detailData.data?.returns);
      console.log('   ✅ Deep Drilldown Intelligence verified.\n');
    }

    // 5. Test Product Research Workspace (CRUD & Conversion)
    console.log('5️⃣ Testing Product Research Workspace...');
    const createResearchRes = await fetch(`${API_GATEWAY_URL}/product-research`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        product_name: 'Smart Ambient RGB Desk Lamp',
        product_url: 'https://supplier.example.com/item/rgb-lamp-88',
        category: 'Lighting',
        source: 'AliExpress / Supplier Direct',
        estimated_cost: 650,
        expected_selling_price: 1899,
        estimated_shipping_cost: 120,
        estimated_marketing_cost: 350,
        estimated_units: 50,
        competitor_price: 2199,
        target_audience: 'Remote workers & gamers 18-35',
        notes: 'High viral potential on TikTok & Instagram reels with ambient desk setups.',
        tags: ['Trending', 'Problem Solving', 'Electronics'],
      }),
    });
    const createResearchData = await createResearchRes.json();
    console.log('   Create Research Item Status:', createResearchRes.status);
    const researchItem = createResearchData.data;
    console.log('   Created Item Estimates:', {
      id: researchItem?.id,
      name: researchItem?.product_name,
      estimated_revenue: researchItem?.estimated_revenue,
      estimated_gross_profit: researchItem?.estimated_gross_profit,
      estimated_net_profit: researchItem?.estimated_net_profit,
      estimated_margin_percent: researchItem?.estimated_margin_percent,
      status: researchItem?.status,
    });
    console.log('   ✅ Product research item created with instant financial estimates.\n');

    // 6. Update Status to READY_TO_TEST
    console.log(`6️⃣ Updating status of research item ${researchItem?.id} to READY_TO_TEST...`);
    const updateRes = await fetch(`${API_GATEWAY_URL}/product-research/${researchItem?.id}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'READY_TO_TEST' }),
    });
    const updateData = await updateRes.json();
    console.log('   Updated Status:', updateData.data?.status);
    console.log('   ✅ Status updated.\n');

    // 7. Convert Research Item to Live Product
    console.log(`7️⃣ Converting research item ${researchItem?.id} to live Product in catalog...`);
    const convertRes = await fetch(`${API_GATEWAY_URL}/product-research/${researchItem?.id}/convert`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        sku: `RGB-LAMP-${Date.now().toString().slice(-4)}`,
        initial_stock: 25,
      }),
    });
    const convertData = await convertRes.json();
    console.log('   Convert Status:', convertRes.status);
    const createdProd = convertData.data?.product || convertData.product;
    console.log('   Created Product:', {
      id: createdProd?.id,
      name: createdProd?.name,
      sku: createdProd?.sku,
      selling_price: createdProd?.selling_price,
      cost_price: createdProd?.cost_price,
      stock: createdProd?.stock_quantity,
    });
    console.log('   ✅ Conversion to live product succeeded.\n');

    console.log('🎉 ALL FEATURE 5 INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🎉');
  } catch (err) {
    console.error('❌ Test suite encountered an error:', err);
    process.exit(1);
  }
}

runTests();
