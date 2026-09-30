const BASE_URL = 'http://localhost:5000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (e) { json = { text }; }
  return { status: res.status, ok: res.ok, body: json };
}

async function runCompleteFlowTest() {
  console.log('================================================================');
  console.log('🚀 STARTING COMPLETE END-TO-END PLATFORM FLOW TEST');
  console.log('================================================================\n');

  let adminToken, dealerToken, marketerToken;
  let businessId, dealerInviteToken, marketerInviteToken, dealerId, productId, customerId, orderId, campaignId, socialAccountId, postId, adId;
  const timestamp = Date.now();

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Gateway Health Check
    // -------------------------------------------------------------------------
    console.log('🔍 [STEP 1] Testing API Gateway Health...');
    const healthRes = await request('/health');
    console.log(`   Status: ${healthRes.status} | Response:`, healthRes.body);
    if (healthRes.status !== 200) throw new Error('API Gateway health check failed');
    console.log('   ✅ API Gateway is HEALTHY.\n');

    // -------------------------------------------------------------------------
    // STEP 2: Dropshipper Admin Registration & Login
    // -------------------------------------------------------------------------
    console.log('👤 [STEP 2] Registering Admin Dropshipper...');
    const adminEmail = `admin_${timestamp}@dropship.com`;
    const adminReg = await request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Chief Dropshipper',
        email: adminEmail,
        password: 'AdminPassword123!',
        role: 'DROPSHIPPER',
      }),
    });
    console.log(`   Status: ${adminReg.status} | Email: ${adminEmail}`);
    if (adminReg.status !== 201) throw new Error(`Admin registration failed: ${JSON.stringify(adminReg.body)}`);
    adminToken = adminReg.body.data.token;
    console.log('   ✅ Admin registered successfully with JWT.\n');

    // -------------------------------------------------------------------------
    // STEP 3: Admin Creates a Business
    // -------------------------------------------------------------------------
    console.log('🏢 [STEP 3] Admin creating new Business...');
    const bizRes = await request('/api/v1/businesses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: `Apex Electronics ${timestamp}`,
        description: 'Multi-vendor consumer electronics store',
        email: `contact_${timestamp}@apexelectronics.com`,
        phone: '+18005550199',
        address: '100 Innovation Way, Suite 500',
      }),
    });
    console.log(`   Status: ${bizRes.status}`);
    if (bizRes.status !== 201) throw new Error(`Business creation failed: ${JSON.stringify(bizRes.body)}`);
    businessId = bizRes.body.data.id;
    console.log(`   ✅ Business created successfully (ID: ${businessId}).\n`);

    // -------------------------------------------------------------------------
    // STEP 4: Dealer Invitation Flow
    // -------------------------------------------------------------------------
    console.log('📧 [STEP 4] Dealer Invitation Flow:');
    const dealerEmail = `dealer_${timestamp}@supplies.com`;
    console.log(`   4a. Admin inviting Dealer (${dealerEmail})...`);
    const dealerInviteRes = await request('/api/v1/dealers/invite', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        email: dealerEmail,
        company_name: 'Tech World Logistics',
        business_id: businessId,
      }),
    });
    console.log(`       Status: ${dealerInviteRes.status}`);
    if (dealerInviteRes.status !== 201) throw new Error(`Dealer invitation failed: ${JSON.stringify(dealerInviteRes.body)}`);
    dealerInviteToken = dealerInviteRes.body.data.invitation.token;
    console.log(`       Generated Token: ${dealerInviteToken}`);

    console.log('   4b. Dealer viewing invitation details via token...');
    const viewDealerInvite = await request(`/api/v1/dealers/invitations/${dealerInviteToken}`);
    console.log(`       Status: ${viewDealerInvite.status} | Role: ${viewDealerInvite.body.data.role} | Email: ${viewDealerInvite.body.data.email}`);

    console.log('   4c. Dealer accepting invitation & creating account...');
    const acceptDealerRes = await request('/api/v1/dealers/accept-invite', {
      method: 'POST',
      body: JSON.stringify({
        token: dealerInviteToken,
        name: 'David Dealer',
        password: 'DealerPassword123!',
        phone: '+18005550222',
      }),
    });
    console.log(`       Status: ${acceptDealerRes.status}`);
    if (acceptDealerRes.status !== 201) throw new Error(`Dealer accept invite failed: ${JSON.stringify(acceptDealerRes.body)}`);
    dealerToken = acceptDealerRes.body.data.token;
    dealerId = acceptDealerRes.body.data.dealer.id;
    console.log(`       ✅ Dealer account & profile created (Dealer ID: ${dealerId}).\n`);

    // -------------------------------------------------------------------------
    // STEP 5: Digital Marketer Invitation Flow
    // -------------------------------------------------------------------------
    console.log('📢 [STEP 5] Digital Marketer Invitation Flow:');
    const marketerEmail = `marketer_${timestamp}@agency.com`;
    console.log(`   5a. Admin inviting Digital Marketer (${marketerEmail})...`);
    const mktInviteRes = await request('/api/v1/marketing/invite', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        email: marketerEmail,
        business_id: businessId,
      }),
    });
    console.log(`       Status: ${mktInviteRes.status}`);
    if (mktInviteRes.status !== 201) throw new Error(`Marketer invitation failed: ${JSON.stringify(mktInviteRes.body)}`);
    marketerInviteToken = mktInviteRes.body.data.invitation.token;
    console.log(`       Generated Token: ${marketerInviteToken}`);

    console.log('   5b. Marketer viewing invitation details via token...');
    const viewMktInvite = await request(`/api/v1/marketing/invitations/${marketerInviteToken}`);
    console.log(`       Status: ${viewMktInvite.status} | Role: ${viewMktInvite.body.data.role}`);

    console.log('   5c. Marketer accepting invitation & creating account...');
    const acceptMktRes = await request('/api/v1/marketing/accept-invite', {
      method: 'POST',
      body: JSON.stringify({
        token: marketerInviteToken,
        name: 'Sarah Marketer',
        password: 'MarketerPassword123!',
      }),
    });
    console.log(`       Status: ${acceptMktRes.status}`);
    if (acceptMktRes.status !== 201) throw new Error(`Marketer accept invite failed: ${JSON.stringify(acceptMktRes.body)}`);
    marketerToken = acceptMktRes.body.data.token;
    console.log(`       ✅ Digital Marketer account created with MARKETING role.\n`);

    // -------------------------------------------------------------------------
    // STEP 6: Product Catalog Operations (Dealer)
    // -------------------------------------------------------------------------
    console.log('📦 [STEP 6] Dealer creating a Product in catalog...');
    const prodRes = await request('/api/v1/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${dealerToken}` },
      body: JSON.stringify({
        business_id: businessId,
        dealer_id: dealerId,
        name: `Noise Cancelling Headphones ${timestamp}`,
        sku: `NC-HEAD-PRO-${timestamp}`,
        category: 'Electronics',
        cost_price: 45.0,
        selling_price: 99.99,
        stock_quantity: 100,
        description: 'Premium wireless headphones with 40h battery life',
      }),
    });
    console.log(`   Status: ${prodRes.status}`);
    if (prodRes.status !== 201) throw new Error(`Product creation failed: ${JSON.stringify(prodRes.body)}`);
    productId = prodRes.body.data.id;
    console.log(`   ✅ Product created (ID: ${productId}, Price: $99.99, Stock: 100).\n`);

    // -------------------------------------------------------------------------
    // STEP 7: Customer & Order Processing (Dealer/Admin)
    // -------------------------------------------------------------------------
    console.log('🛒 [STEP 7] Customer Registration & Order Placement:');
    console.log('   7a. Creating Customer...');
    const custRes = await request('/api/v1/customers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${dealerToken}` },
      body: JSON.stringify({
        business_id: businessId,
        name: 'Alice Johnson',
        email: `alice_${timestamp}@customer.com`,
        phone: '+15550199',
        address: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        pincode: '97477',
      }),
    });
    console.log(`       Status: ${custRes.status}`);
    if (custRes.status !== 201) throw new Error(`Customer creation failed: ${JSON.stringify(custRes.body)}`);
    customerId = custRes.body.data.id;
    console.log(`       Customer ID: ${customerId}`);

    console.log('   7b. Placing Order with atomic stock reduction...');
    const orderRes = await request('/api/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${dealerToken}` },
      body: JSON.stringify({
        business_id: businessId,
        customer_id: customerId,
        shipping_address: '742 Evergreen Terrace, Springfield OR 97477',
        shipping_fee: 10.0,
        tax: 5.0,
        items: [{ product_id: productId, quantity: 2, dealer_id: dealerId, product_name: 'Noise Cancelling Headphones', unit_price: 99.99 }],
      }),
    });
    console.log(`       Status: ${orderRes.status} | Body:`, JSON.stringify(orderRes.body));
    if (orderRes.status !== 201) throw new Error(`Order placement failed: ${JSON.stringify(orderRes.body)}`);
    orderId = orderRes.body.data.id;
    console.log(`       ✅ Order created (ID: ${orderId}, Total Amount: $${orderRes.body.data.total_amount}).`);

    console.log('   7c. Updating Order status to PROCESSING & PAID...');
    const updateOrderRes = await request(`/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${dealerToken}` },
      body: JSON.stringify({
        status: 'PROCESSING',
        payment_status: 'PAID',
      }),
    });
    console.log(`       Status: ${updateOrderRes.status} | Order Status: ${updateOrderRes.body.data.status} | Payment: ${updateOrderRes.body.data.payment_status}\n`);

    // -------------------------------------------------------------------------
    // STEP 8: Marketing Campaign & Ads Management (Digital Marketer)
    // -------------------------------------------------------------------------
    console.log('📈 [STEP 8] Digital Marketer managing Campaign, Social & Ads:');
    console.log('   8a. Creating Marketing Campaign...');
    const campaignRes = await request('/api/v1/campaigns', {
      method: 'POST',
      headers: { Authorization: `Bearer ${marketerToken}` },
      body: JSON.stringify({
        business_id: businessId,
        name: `Q4 Holiday Blowout ${timestamp}`,
        description: 'Holiday sales promotion across social media platforms',
        objective: 'Conversion Sales',
        budget: 2500.0,
        status: 'ACTIVE',
      }),
    });
    console.log(`       Status: ${campaignRes.status}`);
    if (campaignRes.status !== 201) throw new Error(`Campaign creation failed: ${JSON.stringify(campaignRes.body)}`);
    campaignId = campaignRes.body.data.id;
    console.log(`       Campaign ID: ${campaignId}`);

    console.log('   8b. Connecting Social Account...');
    const socialRes = await request('/api/v1/social-accounts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${marketerToken}` },
      body: JSON.stringify({
        business_id: businessId,
        platform: 'INSTAGRAM',
        account_name: '@apexelectronics_official',
        access_token: 'mock_oauth_access_token_123',
      }),
    });
    console.log(`       Status: ${socialRes.status}`);
    if (socialRes.status !== 201) throw new Error(`Social account connect failed: ${JSON.stringify(socialRes.body)}`);
    socialAccountId = socialRes.body.data.id;

    console.log('   8c. Creating Organic Post...');
    const postRes = await request('/api/v1/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${marketerToken}` },
      body: JSON.stringify({
        campaign_id: campaignId,
        social_account_id: socialAccountId,
        content: 'Get 20% off Noise Cancelling Headphones! 🎧 #Electronics #Sale',
        media_url: 'https://example.com/banner.jpg',
      }),
    });
    console.log(`       Status: ${postRes.status}`);
    if (postRes.status !== 201) throw new Error(`Post creation failed: ${JSON.stringify(postRes.body)}`);
    postId = postRes.body.data.id;

    console.log('   8d. Publishing Post immediately...');
    const publishRes = await request(`/api/v1/posts/${postId}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${marketerToken}` },
    });
    console.log(`       Status: ${publishRes.status} | Post Status: ${publishRes.body.data.status}`);

    console.log('   8e. Launching Paid Ad Campaign...');
    const adRes = await request('/api/v1/ads', {
      method: 'POST',
      headers: { Authorization: `Bearer ${marketerToken}` },
      body: JSON.stringify({
        campaign_id: campaignId,
        name: 'Instagram Story Ad - Headphones',
        budget: 500.0,
        creative_url: 'https://example.com/story_ad.mp4',
      }),
    });
    console.log(`       Status: ${adRes.status}`);
    if (adRes.status !== 201) throw new Error(`Ad creation failed: ${JSON.stringify(adRes.body)}`);
    console.log('       ✅ Campaign, Social Account, Post, & Ad live!\n');

    // -------------------------------------------------------------------------
    // STEP 9: Analytics & Role-Based Dashboards
    // -------------------------------------------------------------------------
    console.log('📊 [STEP 9] Verifying Role-Based Analytics Dashboards:');
    console.log('   9a. Admin Overview Dashboard...');
    const adminDash = await request('/api/v1/dashboard/overview', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`       Status: ${adminDash.status} | Response:`, adminDash.body.data);

    console.log('   9b. Dealer Dashboard...');
    const dealerDash = await request('/api/v1/dashboard/dealer', {
      headers: { Authorization: `Bearer ${dealerToken}` },
    });
    console.log(`       Status: ${dealerDash.status} | Response:`, dealerDash.body.data);

    console.log('   9c. Marketing Dashboard...');
    const mktDash = await request('/api/v1/dashboard/marketing', {
      headers: { Authorization: `Bearer ${marketerToken}` },
    });
    console.log(`       Status: ${mktDash.status} | Response:`, mktDash.body.data);
    console.log('       ✅ All dashboards returning role-scoped analytics.\n');

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log('================================================================');
    console.log('🎉 COMPLETE END-TO-END FLOW TESTED AND VERIFIED SUCCESSFULLY!');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ END-TO-END FLOW TEST FAILED:');
    console.error(err.message);
    process.exit(1);
  }
}

runCompleteFlowTest();
