import http from 'http';

const API_BASE = 'http://localhost:5000/api/v1';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function login(email, password = 'Password123!') {
  const res = await request('POST', '/auth/login', { email, password });
  if (res.status !== 200 || !res.body?.data?.accessToken) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
  }
  return {
    user: res.body.data.user,
    token: res.body.data.accessToken,
  };
}

async function runTests() {
  console.log('🧪 Starting Communication Rules Test Suite...\n');

  // 1. Authenticate Test Users
  const alexander = await login('admin@dropship.com');
  const dealer = await login('dealer@supplier.com');
  const sales = await login('sales@dropship.com');
  const marketer = await login('marketing@growth.com');

  console.log('✅ Authenticated 4 Test Roles:');
  console.log(` - Admin Alexander: ${alexander.user.id} (${alexander.user.role})`);
  console.log(` - Dealer User:    ${dealer.user.id} (${dealer.user.role})`);
  console.log(` - Sales User:     ${sales.user.id} (${sales.user.role})`);
  console.log(` - Marketer User:  ${marketer.user.id} (${marketer.user.role})\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} -> ${details}`);
      failed++;
    }
  }

  // TEST SUITE 1: CONTACT LIST ACCESS RESTRICTIONS
  console.log('📋 --- Test Suite 1: Contact List API Restrictions ---');
  
  const dealerContacts = await request('GET', '/chat/contacts', null, dealer.token);
  assert(
    dealerContacts.status === 200 &&
    Array.isArray(dealerContacts.body?.data) &&
    dealerContacts.body.data.length === 1 &&
    dealerContacts.body.data[0].id === alexander.user.id,
    'Dealer contacts list returns ONLY Alexander Admin',
    JSON.stringify(dealerContacts.body)
  );

  const salesContacts = await request('GET', '/chat/contacts', null, sales.token);
  assert(
    salesContacts.status === 200 &&
    Array.isArray(salesContacts.body?.data) &&
    salesContacts.body.data.length === 1 &&
    salesContacts.body.data[0].id === alexander.user.id,
    'Sales contacts list returns ONLY Alexander Admin',
    JSON.stringify(salesContacts.body)
  );

  const marketerContacts = await request('GET', '/chat/contacts', null, marketer.token);
  assert(
    marketerContacts.status === 200 &&
    Array.isArray(marketerContacts.body?.data) &&
    marketerContacts.body.data.length === 1 &&
    marketerContacts.body.data[0].id === alexander.user.id,
    'Digital Marketer contacts list returns ONLY Alexander Admin',
    JSON.stringify(marketerContacts.body)
  );

  const alexanderContacts = await request('GET', '/chat/contacts', null, alexander.token);
  const alexPartners = alexanderContacts.body?.data || [];
  const hasOnlyAllowedRoles = alexPartners.every((p) => ['DEALER', 'SALES', 'MARKETING'].includes(p.role));
  assert(
    alexanderContacts.status === 200 && alexPartners.length > 0 && hasOnlyAllowedRoles,
    'Alexander Admin contact list contains permitted Dealer, Sales, Marketing users',
    JSON.stringify(alexPartners.slice(0, 3))
  );

  // TEST SUITE 2: ALLOWED MESSAGING PAIRS (STAR TOPOLOGY)
  console.log('\n💬 --- Test Suite 2: Allowed Messaging Combinations ---');

  const t1 = await request('POST', '/chat/messages', { receiver_id: alexander.user.id, content: 'Hello Alexander from Dealer' }, dealer.token);
  assert(t1.status === 201, 'Dealer → Alexander (Allowed 201)', JSON.stringify(t1.body));

  const t2 = await request('POST', '/chat/messages', { receiver_id: dealer.user.id, content: 'Hello Dealer from Alexander' }, alexander.token);
  assert(t2.status === 201, 'Alexander → Dealer (Allowed 201)', JSON.stringify(t2.body));

  const t3 = await request('POST', '/chat/messages', { receiver_id: alexander.user.id, content: 'Hello Alexander from Sales' }, sales.token);
  assert(t3.status === 201, 'Sales → Alexander (Allowed 201)', JSON.stringify(t3.body));

  const t4 = await request('POST', '/chat/messages', { receiver_id: sales.user.id, content: 'Hello Sales from Alexander' }, alexander.token);
  assert(t4.status === 201, 'Alexander → Sales (Allowed 201)', JSON.stringify(t4.body));

  const t5 = await request('POST', '/chat/messages', { receiver_id: alexander.user.id, content: 'Hello Alexander from Marketer' }, marketer.token);
  assert(t5.status === 201, 'Digital Marketer → Alexander (Allowed 201)', JSON.stringify(t5.body));

  const t6 = await request('POST', '/chat/messages', { receiver_id: marketer.user.id, content: 'Hello Marketer from Alexander' }, alexander.token);
  assert(t6.status === 201, 'Alexander → Digital Marketer (Allowed 201)', JSON.stringify(t6.body));

  // TEST SUITE 3: BLOCKED DIRECT MESSAGING PAIRS (403 FORBIDDEN)
  console.log('\n🚫 --- Test Suite 3: Blocked Messaging Combinations ---');

  const b1 = await request('POST', '/chat/messages', { receiver_id: sales.user.id, content: 'Blocked Dealer to Sales' }, dealer.token);
  assert(b1.status === 403, 'Dealer → Sales (Blocked 403 Forbidden)', JSON.stringify(b1.body));

  const b2 = await request('POST', '/chat/messages', { receiver_id: marketer.user.id, content: 'Blocked Dealer to Marketer' }, dealer.token);
  assert(b2.status === 403, 'Dealer → Digital Marketer (Blocked 403 Forbidden)', JSON.stringify(b2.body));

  const b3 = await request('POST', '/chat/messages', { receiver_id: dealer.user.id, content: 'Blocked Sales to Dealer' }, sales.token);
  assert(b3.status === 403, 'Sales → Dealer (Blocked 403 Forbidden)', JSON.stringify(b3.body));

  const b4 = await request('POST', '/chat/messages', { receiver_id: marketer.user.id, content: 'Blocked Sales to Marketer' }, sales.token);
  assert(b4.status === 403, 'Sales → Digital Marketer (Blocked 403 Forbidden)', JSON.stringify(b4.body));

  const b5 = await request('POST', '/chat/messages', { receiver_id: dealer.user.id, content: 'Blocked Marketer to Dealer' }, marketer.token);
  assert(b5.status === 403, 'Digital Marketer → Dealer (Blocked 403 Forbidden)', JSON.stringify(b5.body));

  const b6 = await request('POST', '/chat/messages', { receiver_id: sales.user.id, content: 'Blocked Marketer to Sales' }, marketer.token);
  assert(b6.status === 403, 'Digital Marketer → Sales (Blocked 403 Forbidden)', JSON.stringify(b6.body));

  // TEST SUITE 4: GET MESSAGES AUTHORIZATION ENFORCEMENT
  console.log('\n🔒 --- Test Suite 4: GET Messages History Authorization ---');

  const getAllowed = await request('GET', `/chat/messages/${alexander.user.id}`, null, dealer.token);
  assert(getAllowed.status === 200, 'Dealer fetching conversation with Alexander (Allowed 200)', JSON.stringify(getAllowed.body));

  const getBlocked = await request('GET', `/chat/messages/${sales.user.id}`, null, dealer.token);
  assert(getBlocked.status === 403, 'Dealer trying to fetch Sales conversation (Blocked 403 Forbidden)', JSON.stringify(getBlocked.body));

  console.log(`\n========================================`);
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
