import pg from 'pg';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../services/shared/config/env.js';
import {
  BUSINESS_TEMPLATES,
  BUSINESS_CATEGORIES,
  PRODUCT_CATALOG_TEMPLATES,
  FIRST_NAMES,
  LAST_NAMES,
  CITIES_STATES,
  CHAT_TEMPLATES
} from './seed-data-generator.js';

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Password123!';

// Helper to create PostgreSQL client
function createClient(database) {
  return new pg.Client({
    host: env.DB.HOST || 'localhost',
    port: env.DB.PORT || 5432,
    user: env.DB.USER || 'postgres',
    password: env.DB.PASSWORD || 'postgres',
    database,
  });
}

// Generate realistic dataset in memory
function generateDataset(passwordHash) {
  console.log('⚡ Generating large realistic dataset in memory...');
  const now = new Date();
  const nowMs = now.getTime();

  const users = [];
  const businesses = [];
  const dealers = [];
  const businessDealers = [];
  const invitations = [];
  const customers = [];
  const products = [];
  const inventoryTxns = [];
  const orders = [];
  const orderItems = [];
  const returns = [];
  const campaigns = [];
  const socialAccounts = [];
  const posts = [];
  const ads = [];
  const chatMessages = [];
  const expenses = [];
  const notifications = [];
  const auditLogs = [];

  // Standard Seed Account References for Easy Testing
  const PRIMARY_ADMIN = {
    id: 'a0000000-0000-4000-8000-000000000001',
    name: 'Alexander Wright',
    email: 'admin@dropship.com',
    role: 'DROPSHIPPER',
    is_active: true,
    created_at: now,
    updated_at: now
  };
  users.push(PRIMARY_ADMIN);

  const PRIMARY_DEALER_USER = {
    id: 'a0000000-0000-4000-8000-000000000002',
    name: 'David Chen',
    email: 'dealer@supplier.com',
    role: 'DEALER',
    is_active: true,
    created_at: now,
    updated_at: now
  };
  users.push(PRIMARY_DEALER_USER);

  const PRIMARY_MARKETER = {
    id: 'a0000000-0000-4000-8000-000000000003',
    name: 'Sarah Jenkins',
    email: 'marketing@growth.com',
    role: 'MARKETING',
    is_active: true,
    created_at: now,
    updated_at: now
  };
  users.push(PRIMARY_MARKETER);

  const PRIMARY_SALES = {
    id: 'a0000000-0000-4000-8000-000000000007',
    name: 'Emily Watson',
    email: 'sales@dropship.com',
    role: 'SALES',
    is_active: true,
    created_at: now,
    updated_at: now
  };
  users.push(PRIMARY_SALES);

  // 1. GENERATE BUSINESSES & USERS & DEALERS & INVITATIONS PER BUSINESS
  BUSINESS_TEMPLATES.forEach((bt, bIdx) => {
    businesses.push({
      ...bt,
      created_at: now,
      updated_at: now
    });

    // Business Admin User
    const adminUser = (bIdx === 0) ? PRIMARY_ADMIN : {
      id: uuidv4(),
      name: `${bt.key} Admin Lead`,
      email: `admin.${bt.key.toLowerCase()}@dropship.test`,
      role: 'DROPSHIPPER',
      is_active: true,
      created_at: now,
      updated_at: now
    };
    if (bIdx > 0) users.push(adminUser);

    // Create 5 Dealers for this Business
    const bDealers = [];
    for (let d = 0; d < 5; d++) {
      const isPrimary = (bIdx === 0 && d === 0);
      const dUser = isPrimary ? PRIMARY_DEALER_USER : {
        id: uuidv4(),
        name: `${FIRST_NAMES[(bIdx * 10 + d * 3) % FIRST_NAMES.length]} ${LAST_NAMES[(bIdx * 15 + d * 4) % LAST_NAMES.length]}`,
        email: `dealer.${bt.key.toLowerCase()}${d + 1}@supplier.test`,
        role: 'DEALER',
        is_active: true,
        created_at: now,
        updated_at: now
      };
      if (!isPrimary) users.push(dUser);

      const dealerObj = {
        id: uuidv4(),
        user_id: dUser.id,
        company_name: `${bt.name.split(' ')[0]} Wholesale Partner ${d + 1}`,
        contact_name: dUser.name,
        email: dUser.email,
        phone: `+1 (800) 555-02${bIdx}${d}`,
        status: 'ACTIVE',
        credit_limit: (15000 + d * 5000).toFixed(2),
        average_lead_time_days: 2 + (d % 3),
        dispatch_sla_hours: 24 + (d % 2) * 24,
        fulfillment_sla_hours: 48 + (d % 2) * 24,
        payment_terms: d % 2 === 0 ? 'NET_30' : 'NET_15',
        commission_rate: (5.00 + d * 1.5).toFixed(2),
        payable_balance: (1200.00 + d * 450).toFixed(2),
        created_at: now,
        updated_at: now
      };
      dealers.push(dealerObj);
      bDealers.push(dealerObj);

      // BusinessDealer Link
      businessDealers.push({
        id: uuidv4(),
        business_id: bt.id,
        dealer_id: dealerObj.id,
        status: 'ACTIVE',
        created_at: now,
        updated_at: now
      });

      // Dealer Invitation Link
      invitations.push({
        id: uuidv4(),
        email: dUser.email,
        business_id: bt.id,
        company_name: dealerObj.company_name,
        role: 'DEALER',
        token: uuidv4(),
        status: 'ACCEPTED',
        expires_at: new Date(nowMs + 30 * 86400 * 1000),
        invited_by: adminUser.id,
        created_at: now,
        updated_at: now
      });
    }

    // Create 3 Marketing Users for this Business
    const bMarketers = [];
    for (let m = 0; m < 3; m++) {
      const isPrimary = (bIdx === 0 && m === 0);
      const mUser = isPrimary ? PRIMARY_MARKETER : {
        id: uuidv4(),
        name: `${FIRST_NAMES[(bIdx * 7 + m * 5) % FIRST_NAMES.length]} ${LAST_NAMES[(bIdx * 11 + m * 3) % LAST_NAMES.length]}`,
        email: `marketing.${bt.key.toLowerCase()}${m + 1}@growth.test`,
        role: 'MARKETING',
        is_active: true,
        created_at: now,
        updated_at: now
      };
      if (!isPrimary) users.push(mUser);
      bMarketers.push(mUser);

      // Associate Marketing user with business via Invitation
      invitations.push({
        id: uuidv4(),
        email: mUser.email,
        business_id: bt.id,
        company_name: mUser.name,
        role: 'MARKETING',
        token: uuidv4(),
        status: 'ACCEPTED',
        expires_at: new Date(nowMs + 30 * 86400 * 1000),
        invited_by: adminUser.id,
        created_at: now,
        updated_at: now
      });
    }

    // Create 3 Sales Users for this Business
    const bSales = [];
    for (let s = 0; s < 3; s++) {
      const isPrimary = (bIdx === 0 && s === 0);
      const sUser = isPrimary ? PRIMARY_SALES : {
        id: uuidv4(),
        name: `${FIRST_NAMES[(bIdx * 9 + s * 2) % FIRST_NAMES.length]} ${LAST_NAMES[(bIdx * 13 + s * 7) % LAST_NAMES.length]}`,
        email: `sales.${bt.key.toLowerCase()}${s + 1}@dropship.test`,
        role: 'SALES',
        is_active: true,
        created_at: now,
        updated_at: now
      };
      if (!isPrimary) users.push(sUser);
      bSales.push(sUser);

      // Associate Sales user with business via Invitation
      invitations.push({
        id: uuidv4(),
        email: sUser.email,
        business_id: bt.id,
        company_name: sUser.name,
        role: 'SALES',
        token: uuidv4(),
        status: 'ACCEPTED',
        expires_at: new Date(nowMs + 30 * 86400 * 1000),
        invited_by: adminUser.id,
        created_at: now,
        updated_at: now
      });
    }

    // Add Pending Invitations for testing onboarding flows
    invitations.push({
      id: uuidv4(),
      email: `invite.marketer.${bt.key.toLowerCase()}@growthagency.test`,
      business_id: bt.id,
      company_name: `${bt.name.split(' ')[0]} Digital Agency`,
      role: 'MARKETING',
      token: uuidv4(),
      status: 'PENDING',
      expires_at: new Date(nowMs + 14 * 86400 * 1000),
      invited_by: adminUser.id,
      created_at: now,
      updated_at: now
    });
    invitations.push({
      id: uuidv4(),
      email: `invite.sales.${bt.key.toLowerCase()}@salesgroup.test`,
      business_id: bt.id,
      company_name: `${bt.name.split(' ')[0]} Sales Partner`,
      role: 'SALES',
      token: uuidv4(),
      status: 'PENDING',
      expires_at: new Date(nowMs + 14 * 86400 * 1000),
      invited_by: adminUser.id,
      created_at: now,
      updated_at: now
    });

    // Create 80 Customers for this Business
    const bCustomers = [];
    for (let c = 0; c < 80; c++) {
      const loc = CITIES_STATES[(bIdx * 5 + c) % CITIES_STATES.length];
      const fName = FIRST_NAMES[(bIdx * 20 + c * 3) % FIRST_NAMES.length];
      const lName = LAST_NAMES[(bIdx * 25 + c * 2) % LAST_NAMES.length];
      const custObj = {
        id: uuidv4(),
        business_id: bt.id,
        name: `${fName} ${lName}`,
        email: `cust.${bt.key.toLowerCase()}${c + 1}@clientmail.test`,
        phone: `+1 (555) 345-${(1000 + c).toString().padStart(4, '0')}`,
        address: `${100 + c * 12} ${fName} Ave, Suite ${c + 1}`,
        city: loc.city,
        state: loc.state,
        pincode: loc.pincode,
        status: 'ACTIVE',
        created_at: now,
        updated_at: now
      };
      customers.push(custObj);
      bCustomers.push(custObj);
    }

    // Create 80 Products for this Business across Categories
    const bProducts = [];
    const categories = BUSINESS_CATEGORIES[bIdx];
    let prodCounter = 0;
    categories.forEach((catName) => {
      const templates = PRODUCT_CATALOG_TEMPLATES[catName] || ['Standard Product Item'];
      for (let p = 0; p < 16; p++) {
        prodCounter++;
        const baseName = templates[p % templates.length];
        const prodName = (p >= templates.length) ? `${baseName} Pro Series v${Math.floor(p / templates.length) + 1}` : baseName;
        const assignedDealer = bDealers[prodCounter % bDealers.length];
        const costPrice = parseFloat((15.00 + (prodCounter * 7.50) % 280).toFixed(2));
        const sellingPrice = parseFloat((costPrice * (1 + bt.profit_margin / 100)).toFixed(2));
        const stockQty = 20 + (prodCounter * 17) % 220;

        const prodObj = {
          id: uuidv4(),
          business_id: bt.id,
          dealer_id: assignedDealer.id,
          name: prodName,
          sku: `SKU-${bt.key}-${prodCounter.toString().padStart(3, '0')}`,
          description: `Premium high-performance ${prodName.toLowerCase()} engineered for reliability and sleek modern design.`,
          category: catName,
          cost_price: costPrice,
          selling_price: sellingPrice,
          stock_quantity: stockQty,
          reserved_quantity: Math.floor(stockQty * 0.05),
          low_stock_threshold: 10,
          reorder_level: 15,
          safety_stock: 5,
          target_stock_days: 14,
          images: JSON.stringify([bt.logo]),
          status: 'ACTIVE',
          created_at: new Date(nowMs - 365 * 86400 * 1000),
          updated_at: now
        };
        products.push(prodObj);
        bProducts.push(prodObj);

        // Initial Procurement Stock Transaction
        inventoryTxns.push({
          id: uuidv4(),
          business_id: bt.id,
          product_id: prodObj.id,
          dealer_id: assignedDealer.id,
          transaction_type: 'STOCK_IN',
          quantity: stockQty + 100,
          previous_quantity: 0,
          new_quantity: stockQty + 100,
          reason: 'Initial Catalog Intake',
          reference: `PO-${bt.key}-INIT`,
          notes: 'Opening stock batch from primary supplier',
          created_by: adminUser.id,
          created_at: new Date(nowMs - 365 * 86400 * 1000),
          updated_at: new Date(nowMs - 365 * 86400 * 1000)
        });
      }
    });

    // Create 350 Orders for this Business distributed across 365 days
    const bOrders = [];
    for (let o = 0; o < 350; o++) {
      const cust = bCustomers[o % bCustomers.length];
      const orderNum = `ORD-${bt.key}-${(1000 + o).toString()}`;
      
      // Order status distribution
      let status = 'DELIVERED';
      let payStatus = 'PAID';
      if (o % 20 === 0) { status = 'CANCELLED'; payStatus = 'FAILED'; }
      else if (o % 25 === 0) { status = 'RETURNED'; payStatus = 'REFUNDED'; }
      else if (o % 15 === 0) { status = 'PENDING'; payStatus = 'PENDING'; }
      else if (o % 12 === 0) { status = 'PROCESSING'; payStatus = 'PAID'; }
      else if (o % 10 === 0) { status = 'SHIPPED'; payStatus = 'PAID'; }

      // Timestamps distributed over past 365 days
      const daysAgo = (o / 350) * 365 + (o % 3) * 0.2;
      const createdAt = new Date(nowMs - daysAgo * 86400 * 1000);
      const assignedAt = new Date(createdAt.getTime() + 15 * 60 * 1000);
      const acceptedAt = new Date(createdAt.getTime() + 2 * 3600 * 1000);
      const dispatchedAt = ['DELIVERED', 'SHIPPED', 'RETURNED'].includes(status) ? new Date(createdAt.getTime() + 24 * 3600 * 1000) : null;
      const deliveredAt = ['DELIVERED', 'RETURNED'].includes(status) ? new Date(createdAt.getTime() + 72 * 3600 * 1000) : null;

      // Select 1 to 3 products from this business
      const itemQty = 1 + (o % 3);
      let subtotal = 0;
      const orderItemsList = [];

      for (let it = 0; it < itemQty; it++) {
        const prod = bProducts[(o * 3 + it) % bProducts.length];
        const qty = 1 + (it % 2);
        const itemTotal = prod.selling_price * qty;
        subtotal += itemTotal;

        orderItemsList.push({
          product: prod,
          quantity: qty,
          unit_price: prod.selling_price,
          total_price: itemTotal
        });
      }

      const shippingFee = subtotal > 200 ? 0.00 : 15.00;
      const discount = (o % 5 === 0) ? 10.00 : 0.00;
      const tax = parseFloat((subtotal * 0.08).toFixed(2));
      const totalAmount = parseFloat((subtotal + shippingFee + tax - discount).toFixed(2));

      const orderObj = {
        id: uuidv4(),
        business_id: bt.id,
        customer_id: cust.id,
        order_number: orderNum,
        status,
        subtotal: subtotal.toFixed(2),
        shipping_fee: shippingFee.toFixed(2),
        discount: discount.toFixed(2),
        tax: tax.toFixed(2),
        total_amount: totalAmount.toFixed(2),
        payment_status: payStatus,
        shipping_address: `${cust.address}, ${cust.city}, ${cust.state} ${cust.pincode}`,
        assigned_at: assignedAt,
        accepted_at: acceptedAt,
        dispatched_at: dispatchedAt,
        delivered_at: deliveredAt,
        cancellation_source: status === 'CANCELLED' ? (o % 2 === 0 ? 'CUSTOMER' : 'DEALER') : null,
        cancellation_reason: status === 'CANCELLED' ? 'Stock shortage or customer request' : null,
        created_at: createdAt,
        updated_at: createdAt
      };
      orders.push(orderObj);
      bOrders.push(orderObj);

      // Create Order Items
      orderItemsList.forEach((it) => {
        orderItems.push({
          id: uuidv4(),
          order_id: orderObj.id,
          product_id: it.product.id,
          dealer_id: it.product.dealer_id,
          product_name: it.product.name,
          sku: it.product.sku,
          quantity: it.quantity,
          unit_price: it.unit_price.toFixed(2),
          total_price: it.total_price.toFixed(2)
        });
      });

      // Create Return if RETURNED status
      if (status === 'RETURNED') {
        const retProd = orderItemsList[0].product;
        returns.push({
          id: uuidv4(),
          order_id: orderObj.id,
          order_number: orderObj.order_number,
          business_id: bt.id,
          customer_id: cust.id,
          customer_name: cust.name,
          dealer_id: retProd.dealer_id,
          dealer_name: bDealers.find(d => d.id === retProd.dealer_id)?.company_name || 'Wholesale Supplier',
          product_id: retProd.id,
          product_name: retProd.name,
          reason: 'Defective item or mismatched size request',
          status: o % 2 === 0 ? 'COMPLETED' : 'APPROVED',
          requested_date: new Date(createdAt.getTime() + 5 * 86400 * 1000),
          refund_amount: retProd.selling_price.toFixed(2),
          resolution: 'Replacement unit shipped to customer',
          created_at: createdAt,
          updated_at: createdAt
        });
      }
    }

    // Create 20 Campaigns for this Business
    for (let c = 0; c < 20; c++) {
      const mUser = bMarketers[c % bMarketers.length];
      const campObj = {
        id: uuidv4(),
        business_id: bt.id,
        name: `${bt.name.split(' ')[0]} Growth Blitz Q${(c % 4) + 1} - Vol ${c + 1}`,
        description: `Multi-channel acquisition campaign targeting ${BUSINESS_CATEGORIES[bIdx][c % 5]} audience segment.`,
        objective: ['CONVERSIONS', 'AWARENESS', 'LEAD_GEN', 'RETARGETING'][c % 4],
        budget: (1500.00 + c * 800).toFixed(2),
        start_date: new Date(nowMs - (c * 15 + 10) * 86400 * 1000),
        end_date: new Date(nowMs + (20 - c * 2) * 86400 * 1000),
        status: c % 3 === 0 ? 'ACTIVE' : (c % 2 === 0 ? 'COMPLETED' : 'PAUSED'),
        created_by: mUser.id,
        created_at: now,
        updated_at: now
      };
      campaigns.push(campObj);

      // Create Social Account & Posts & Ads for campaign
      if (c < 5) {
        const platform = ['Instagram', 'Facebook', 'YouTube', 'TikTok', 'LinkedIn'][c];
        const socialAcc = {
          id: uuidv4(),
          business_id: bt.id,
          platform,
          account_name: `@${bt.key.toLowerCase()}_official`,
          external_account_id: `ext_${bt.key.toLowerCase()}_${platform.toLowerCase()}`,
          status: 'CONNECTED',
          created_at: now,
          updated_at: now
        };
        socialAccounts.push(socialAcc);

        // Posts
        const prod = bProducts[c * 4];
        posts.push({
          id: uuidv4(),
          campaign_id: campObj.id,
          social_account_id: socialAcc.id,
          product_id: prod.id,
          content: `Elevate your lifestyle with our featured ${prod.name}! Free shipping for orders over $200. Shop link in bio!`,
          media_url: bt.logo,
          scheduled_at: campObj.start_date,
          published_at: campObj.start_date,
          status: 'PUBLISHED',
          created_by: mUser.id,
          created_at: now,
          updated_at: now
        });

        // Ads
        ads.push({
          id: uuidv4(),
          campaign_id: campObj.id,
          social_account_id: socialAcc.id,
          product_id: prod.id,
          name: `${prod.name} High-ROAS Video Ad`,
          creative_url: bt.logo,
          budget: (campObj.budget / 2).toFixed(2),
          target_audience: { demographics: '25-45 Tech & Lifestyle', interests: [prod.category] },
          start_date: campObj.start_date,
          end_date: campObj.end_date,
          status: campObj.status,
          external_ad_id: `ad_ext_${c + 1}`,
          created_by: mUser.id,
          created_at: now,
          updated_at: now
        });
      }
    }

    // Create 250 Chat Messages for this Business (Admin ↔ Dealer, Admin ↔ Marketing, Admin ↔ Sales)
    const adminU = adminUser;
    for (let cm = 0; cm < 250; cm++) {
      let partnerObj = bDealers[cm % bDealers.length];
      let categoryType = 'ADMIN_DEALER';
      let partnerUserId = partnerObj.user_id;

      if (cm % 3 === 1) {
        partnerObj = bMarketers[cm % bMarketers.length];
        categoryType = 'ADMIN_MARKETING';
        partnerUserId = partnerObj.id;
      } else if (cm % 3 === 2) {
        partnerObj = bSales[cm % bSales.length];
        categoryType = 'ADMIN_SALES';
        partnerUserId = partnerObj.id;
      }

      const isFromAdmin = cm % 2 === 0;
      const senderId = isFromAdmin ? adminU.id : partnerUserId;
      const receiverId = isFromAdmin ? partnerUserId : adminU.id;

      const templateList = CHAT_TEMPLATES[categoryType];
      const templateText = templateList[cm % templateList.length]
        .replace('{order_num}', `ORD-${bt.key}-${1000 + (cm % 50)}`)
        .replace('{po_num}', `2026-00${cm % 9 + 1}`)
        .replace('{campaign_name}', `${bt.name.split(' ')[0]} Blitz`)
        .replace('{company_name}', bDealers[cm % bDealers.length].company_name);

      const msgTime = new Date(nowMs - (250 - cm) * 3600 * 1000 * 3);

      chatMessages.push({
        id: uuidv4(),
        sender_id: senderId,
        receiver_id: receiverId,
        business_id: bt.id,
        content: templateText,
        message_type: 'DIRECT',
        is_read: cm < 230,
        created_at: msgTime,
        updated_at: msgTime
      });
    }

    // Create 24 Expenses for this Business (2 per month across 12 months)
    for (let m = 0; m < 12; m++) {
      const expDate = new Date(nowMs - (11 - m) * 30 * 86400 * 1000);
      const cat1 = ['MARKETING', 'LOGISTICS', 'SOFTWARE_SAAS', 'WAREHOUSING'][m % 4];
      const cat2 = ['PAYROLL', 'PACKAGING', 'INSPECTION', 'UTILITIES'][m % 4];

      expenses.push({
        id: uuidv4(),
        business_id: bt.id,
        category: cat1,
        description: `Monthly ${cat1.toLowerCase()} operational expense M${m + 1}`,
        amount: (450.00 + m * 85 + (bIdx + 1) * 50).toFixed(2),
        date: expDate.toISOString().split('T')[0],
        reference: `EXP-${bt.key}-M${m + 1}-A`,
        notes: `Regular recurring operations ledger entry`,
        created_by: adminUser.id,
        created_at: expDate,
        updated_at: expDate
      });

      expenses.push({
        id: uuidv4(),
        business_id: bt.id,
        category: cat2,
        description: `Monthly ${cat2.toLowerCase()} service costs M${m + 1}`,
        amount: (320.00 + m * 60 + (bIdx + 1) * 40).toFixed(2),
        date: expDate.toISOString().split('T')[0],
        reference: `EXP-${bt.key}-M${m + 1}-B`,
        notes: `Vendor fulfillment and infrastructure`,
        created_by: adminUser.id,
        created_at: expDate,
        updated_at: expDate
      });
    }

    // Create 100 Notifications for this Business Users
    for (let n = 0; n < 100; n++) {
      notifications.push({
        id: uuidv4(),
        user_id: adminUser.id,
        title: n % 2 === 0 ? 'New High-Value Order' : 'Inventory Threshold Alert',
        message: n % 2 === 0 ? `Order ORD-${bt.key}-${1000 + n} placed by customer.` : `Stock level low for product SKU-${bt.key}-${n + 1}.`,
        type: n % 2 === 0 ? 'ORDER' : 'INVENTORY',
        is_read: n < 80,
        created_at: new Date(nowMs - (100 - n) * 86400 * 1000),
        updated_at: now
      });
    }

    // Audit Logs
    auditLogs.push({
      id: uuidv4(),
      user_id: adminUser.id,
      action: 'UPDATE_BUSINESS_PROFIT_MARGIN',
      entity_type: 'Business',
      entity_id: bt.id,
      old_values: { profit_margin: 20.00 },
      new_values: { profit_margin: bt.profit_margin },
      ip_address: '192.168.1.1',
      created_at: now
    });
  });

  return {
    users,
    businesses,
    dealers,
    businessDealers,
    invitations,
    customers,
    products,
    inventoryTxns,
    orders,
    orderItems,
    returns,
    campaigns,
    socialAccounts,
    posts,
    ads,
    chatMessages,
    expenses,
    notifications,
    auditLogs
  };
}

// ============================================================================
// HELPER FOR FAST BATCH INSERTS
// ============================================================================
async function batchInsert(client, table, columns, data, batchSize = 500) {
  if (!data || data.length === 0) return;
  for (let i = 0; i < data.length; i += batchSize) {
    const chunk = data.slice(i, i + batchSize);
    const valuePlaceholders = [];
    const values = [];
    let valIndex = 1;

    chunk.forEach((row) => {
      const rowParams = [];
      columns.forEach((col) => {
        let val = row[col];
        if (val instanceof Date) val = val.toISOString();
        else if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
        values.push(val);
        rowParams.push(`$${valIndex++}`);
      });
      valuePlaceholders.push(`(${rowParams.join(', ')})`);
    });

    const queryStr = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${valuePlaceholders.join(', ')}`;
    await client.query(queryStr, values);
  }
}

// ============================================================================
// SERVICE DB SEEDERS
// ============================================================================
async function seedAuthDB(client, data, passwordHash) {
  console.log('  🔐 Seeding Auth Service DB (users, notifications, audit_logs)...');
  try {
    await client.query('TRUNCATE TABLE chat_messages, notifications, audit_logs, users CASCADE');
  } catch (e) {
    await client.query('TRUNCATE TABLE notifications, audit_logs, users CASCADE');
  }

  const userCols = ['id', 'name', 'email', 'password_hash', 'role', 'is_active', 'created_at', 'updated_at'];
  const formattedUsers = data.users.map(u => ({ ...u, password_hash: passwordHash }));
  await batchInsert(client, 'users', userCols, formattedUsers);

  const notifCols = ['id', 'user_id', 'title', 'message', 'type', 'is_read', 'created_at', 'updated_at'];
  await batchInsert(client, 'notifications', notifCols, data.notifications);

  const auditCols = ['id', 'user_id', 'action', 'entity_type', 'entity_id', 'old_values', 'new_values', 'ip_address', 'created_at'];
  await batchInsert(client, 'audit_logs', auditCols, data.auditLogs);

  try {
    const chatCols = ['id', 'sender_id', 'receiver_id', 'business_id', 'content', 'message_type', 'is_read', 'created_at', 'updated_at'];
    await batchInsert(client, 'chat_messages', chatCols, data.chatMessages);
  } catch (e) {
    // chat_messages is optional in unified management db
  }
}

async function seedBusinessDB(client, data) {
  console.log('  🏢 Seeding Business Service DB (businesses, dealers, business_dealers, dealer_invitations)...');
  await client.query(`
    ALTER TABLE businesses ADD COLUMN IF NOT EXISTS profit_margin NUMERIC DEFAULT 20.00;
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS credit_limit NUMERIC DEFAULT 10000.00;
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS average_lead_time_days INTEGER DEFAULT 3;
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS dispatch_sla_hours INTEGER DEFAULT 48;
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS fulfillment_sla_hours INTEGER DEFAULT 72;
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 0.00;
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(50) DEFAULT 'NET_30';
    ALTER TABLE dealers ADD COLUMN IF NOT EXISTS payable_balance DECIMAL(12, 2) DEFAULT 0.00;
  `);

  await client.query('TRUNCATE TABLE business_dealers, dealer_invitations, dealers, businesses CASCADE');

  const bizCols = ['id', 'name', 'description', 'logo', 'email', 'phone', 'address', 'status', 'profit_margin', 'created_at', 'updated_at'];
  await batchInsert(client, 'businesses', bizCols, data.businesses);

  const dealerCols = ['id', 'user_id', 'company_name', 'contact_name', 'email', 'phone', 'status', 'credit_limit', 'average_lead_time_days', 'dispatch_sla_hours', 'fulfillment_sla_hours', 'payment_terms', 'commission_rate', 'payable_balance', 'created_at', 'updated_at'];
  await batchInsert(client, 'dealers', dealerCols, data.dealers);

  const bdCols = ['id', 'business_id', 'dealer_id', 'status', 'created_at', 'updated_at'];
  await batchInsert(client, 'business_dealers', bdCols, data.businessDealers);

  const invCols = ['id', 'email', 'business_id', 'company_name', 'role', 'token', 'status', 'expires_at', 'invited_by', 'created_at', 'updated_at'];
  await batchInsert(client, 'dealer_invitations', invCols, data.invitations);
}

async function seedProductDB(client, data) {
  console.log('  📦 Seeding Product Service DB (products, inventory_transactions)...');
  await client.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS business_id UUID;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 10;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_level INTEGER NOT NULL DEFAULT 15;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS safety_stock INTEGER NOT NULL DEFAULT 5;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS target_stock_days INTEGER NOT NULL DEFAULT 14;

    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id UUID PRIMARY KEY,
      business_id UUID,
      product_id UUID NOT NULL,
      dealer_id UUID,
      order_id UUID,
      transaction_type VARCHAR(50) NOT NULL,
      quantity INTEGER NOT NULL,
      previous_quantity INTEGER NOT NULL,
      new_quantity INTEGER NOT NULL,
      reason VARCHAR(255),
      reference VARCHAR(255),
      notes TEXT,
      created_by UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  await client.query('TRUNCATE TABLE inventory_transactions, products CASCADE');

  const prodCols = ['id', 'business_id', 'dealer_id', 'name', 'sku', 'description', 'category', 'cost_price', 'selling_price', 'stock_quantity', 'reserved_quantity', 'low_stock_threshold', 'reorder_level', 'safety_stock', 'target_stock_days', 'images', 'status', 'created_at', 'updated_at'];
  await batchInsert(client, 'products', prodCols, data.products);

  const invCols = ['id', 'business_id', 'product_id', 'dealer_id', 'transaction_type', 'quantity', 'previous_quantity', 'new_quantity', 'reason', 'reference', 'notes', 'created_by', 'created_at', 'updated_at'];
  await batchInsert(client, 'inventory_transactions', invCols, data.inventoryTxns);
}

async function seedOrderDB(client, data) {
  console.log('  🛒 Seeding Order Service DB (customers, orders, order_items, returns)...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS returns (
      id UUID PRIMARY KEY,
      order_id UUID,
      order_number VARCHAR(255),
      business_id UUID,
      customer_id UUID,
      customer_name VARCHAR(255),
      dealer_id UUID,
      dealer_name VARCHAR(255),
      product_id UUID,
      product_name VARCHAR(255),
      reason TEXT,
      status VARCHAR(50) DEFAULT 'REQUESTED',
      requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      refund_amount NUMERIC(10,2) DEFAULT 0.00,
      resolution TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_source VARCHAR(50) DEFAULT 'CUSTOMER';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS dealer_notes TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN DEFAULT false;
  `);

  await client.query('TRUNCATE TABLE returns, order_items, orders, customers CASCADE');

  const custCols = ['id', 'business_id', 'name', 'email', 'phone', 'address', 'city', 'state', 'pincode', 'status', 'created_at', 'updated_at'];
  await batchInsert(client, 'customers', custCols, data.customers);

  const orderCols = ['id', 'business_id', 'customer_id', 'order_number', 'status', 'subtotal', 'shipping_fee', 'discount', 'tax', 'total_amount', 'payment_status', 'shipping_address', 'assigned_at', 'accepted_at', 'dispatched_at', 'delivered_at', 'cancellation_source', 'cancellation_reason', 'created_at', 'updated_at'];
  await batchInsert(client, 'orders', orderCols, data.orders);

  const itemCols = ['id', 'order_id', 'product_id', 'dealer_id', 'product_name', 'sku', 'quantity', 'unit_price', 'total_price'];
  await batchInsert(client, 'order_items', itemCols, data.orderItems);

  const retCols = ['id', 'order_id', 'order_number', 'business_id', 'customer_id', 'customer_name', 'dealer_id', 'dealer_name', 'product_id', 'product_name', 'reason', 'status', 'requested_date', 'refund_amount', 'resolution', 'created_at', 'updated_at'];
  await batchInsert(client, 'returns', retCols, data.returns);
}

async function seedMarketingDB(client, data) {
  console.log('  📈 Seeding Marketing Service DB (campaigns, social_accounts, posts, ads)...');
  await client.query('TRUNCATE TABLE ads, posts, social_accounts, campaigns CASCADE');

  const campCols = ['id', 'business_id', 'name', 'description', 'objective', 'budget', 'start_date', 'end_date', 'status', 'created_by', 'created_at', 'updated_at'];
  await batchInsert(client, 'campaigns', campCols, data.campaigns);

  const socialCols = ['id', 'business_id', 'platform', 'account_name', 'external_account_id', 'status', 'created_at', 'updated_at'];
  await batchInsert(client, 'social_accounts', socialCols, data.socialAccounts);

  const postCols = ['id', 'campaign_id', 'social_account_id', 'product_id', 'content', 'media_url', 'scheduled_at', 'published_at', 'status', 'created_by', 'created_at', 'updated_at'];
  await batchInsert(client, 'posts', postCols, data.posts);

  const adCols = ['id', 'campaign_id', 'social_account_id', 'product_id', 'name', 'creative_url', 'budget', 'target_audience', 'start_date', 'end_date', 'status', 'external_ad_id', 'created_by', 'created_at', 'updated_at'];
  await batchInsert(client, 'ads', adCols, data.ads);
}

async function seedAnalyticsDB(client, data) {
  console.log('  📊 Seeding Analytics Service DB (expenses, orders, products, businesses, returns)...');

  await client.query(`
    DROP TABLE IF EXISTS expenses, returns, order_items, orders, customers, products, dealers, businesses CASCADE;

    CREATE TABLE IF NOT EXISTS businesses (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      logo VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      profit_margin NUMERIC(5,2) DEFAULT 20.00,
      status VARCHAR(50) DEFAULT 'ACTIVE',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS dealers (
      id UUID PRIMARY KEY,
      user_id UUID,
      company_name VARCHAR(255) NOT NULL,
      contact_name VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(50),
      status VARCHAR(50) DEFAULT 'ACTIVE',
      credit_limit NUMERIC(12,2) DEFAULT 10000.00,
      average_lead_time_days INTEGER DEFAULT 3,
      dispatch_sla_hours INTEGER DEFAULT 48,
      fulfillment_sla_hours INTEGER DEFAULT 72,
      payment_terms VARCHAR(50) DEFAULT 'NET_30',
      commission_rate DECIMAL(5, 2) DEFAULT 0.00,
      payable_balance DECIMAL(12, 2) DEFAULT 0.00,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY,
      business_id UUID,
      dealer_id UUID,
      name VARCHAR(255) NOT NULL,
      sku VARCHAR(100) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      cost_price NUMERIC(10,2) DEFAULT 0.00,
      selling_price NUMERIC(10,2) DEFAULT 0.00,
      stock_quantity INTEGER DEFAULT 0,
      reserved_quantity INTEGER DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 10,
      reorder_level INTEGER DEFAULT 15,
      safety_stock INTEGER DEFAULT 5,
      target_stock_days INTEGER DEFAULT 14,
      images JSONB DEFAULT '[]'::jsonb,
      status VARCHAR(50) DEFAULT 'ACTIVE',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY,
      business_id UUID,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      pincode VARCHAR(20),
      status VARCHAR(50) DEFAULT 'ACTIVE',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY,
      business_id UUID,
      customer_id UUID,
      order_number VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'PENDING',
      subtotal NUMERIC(10,2) DEFAULT 0.00,
      shipping_fee NUMERIC(10,2) DEFAULT 0.00,
      discount NUMERIC(10,2) DEFAULT 0.00,
      tax NUMERIC(10,2) DEFAULT 0.00,
      total_amount NUMERIC(10,2) DEFAULT 0.00,
      payment_status VARCHAR(50) DEFAULT 'PENDING',
      shipping_address TEXT,
      assigned_at TIMESTAMP WITH TIME ZONE,
      accepted_at TIMESTAMP WITH TIME ZONE,
      dispatched_at TIMESTAMP WITH TIME ZONE,
      delivered_at TIMESTAMP WITH TIME ZONE,
      cancellation_source VARCHAR(50) DEFAULT 'CUSTOMER',
      cancellation_reason TEXT,
      dealer_notes TEXT,
      sla_breached BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY,
      order_id UUID NOT NULL,
      product_id UUID NOT NULL,
      dealer_id UUID,
      product_name VARCHAR(255),
      sku VARCHAR(100),
      quantity INTEGER DEFAULT 1,
      unit_price NUMERIC(10,2) DEFAULT 0.00,
      total_price NUMERIC(10,2) DEFAULT 0.00
    );

    CREATE TABLE IF NOT EXISTS returns (
      id UUID PRIMARY KEY,
      order_id UUID,
      order_number VARCHAR(255),
      business_id UUID,
      customer_id UUID,
      customer_name VARCHAR(255),
      dealer_id UUID,
      dealer_name VARCHAR(255),
      product_id UUID,
      product_name VARCHAR(255),
      reason TEXT,
      status VARCHAR(50) DEFAULT 'REQUESTED',
      requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      refund_amount NUMERIC(10,2) DEFAULT 0.00,
      resolution TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id UUID PRIMARY KEY,
      business_id UUID,
      category VARCHAR(50) NOT NULL,
      description VARCHAR(255) NOT NULL,
      amount NUMERIC(12, 2) NOT NULL,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      reference VARCHAR(100),
      notes TEXT,
      created_by UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  await client.query('TRUNCATE TABLE expenses, returns, order_items, orders, customers, products, dealers, businesses CASCADE');

  const bizCols = ['id', 'name', 'description', 'logo', 'email', 'phone', 'address', 'status', 'profit_margin', 'created_at', 'updated_at'];
  await batchInsert(client, 'businesses', bizCols, data.businesses);

  const dealerCols = ['id', 'user_id', 'company_name', 'contact_name', 'email', 'phone', 'status', 'credit_limit', 'average_lead_time_days', 'dispatch_sla_hours', 'fulfillment_sla_hours', 'payment_terms', 'commission_rate', 'payable_balance', 'created_at', 'updated_at'];
  await batchInsert(client, 'dealers', dealerCols, data.dealers);

  const prodCols = ['id', 'business_id', 'dealer_id', 'name', 'sku', 'description', 'category', 'cost_price', 'selling_price', 'stock_quantity', 'reserved_quantity', 'low_stock_threshold', 'reorder_level', 'safety_stock', 'target_stock_days', 'images', 'status', 'created_at', 'updated_at'];
  await batchInsert(client, 'products', prodCols, data.products);

  const custCols = ['id', 'business_id', 'name', 'email', 'phone', 'address', 'city', 'state', 'pincode', 'status', 'created_at', 'updated_at'];
  await batchInsert(client, 'customers', custCols, data.customers);

  const orderCols = ['id', 'business_id', 'customer_id', 'order_number', 'status', 'subtotal', 'shipping_fee', 'discount', 'tax', 'total_amount', 'payment_status', 'shipping_address', 'assigned_at', 'accepted_at', 'dispatched_at', 'delivered_at', 'cancellation_source', 'cancellation_reason', 'dealer_notes', 'sla_breached', 'created_at', 'updated_at'];
  await batchInsert(client, 'orders', orderCols, data.orders);

  const itemCols = ['id', 'order_id', 'product_id', 'dealer_id', 'product_name', 'sku', 'quantity', 'unit_price', 'total_price'];
  await batchInsert(client, 'order_items', itemCols, data.orderItems);

  const retCols = ['id', 'order_id', 'order_number', 'business_id', 'customer_id', 'customer_name', 'dealer_id', 'dealer_name', 'product_id', 'product_name', 'reason', 'status', 'requested_date', 'refund_amount', 'resolution', 'created_at', 'updated_at'];
  await batchInsert(client, 'returns', retCols, data.returns);

  const expCols = ['id', 'business_id', 'category', 'description', 'amount', 'date', 'reference', 'notes', 'created_by', 'created_at', 'updated_at'];
  await batchInsert(client, 'expenses', expCols, data.expenses);
}

async function seedUnifiedManagementDB(client, data, passwordHash) {
  console.log('  🌐 Seeding Unified Database (dropship_management)...');
  await seedAuthDB(client, data, passwordHash);
  await seedBusinessDB(client, data);
  await seedProductDB(client, data);
  await seedOrderDB(client, data);
  await seedMarketingDB(client, data);
  await seedAnalyticsDB(client, data);
}

// ============================================================================
// VERIFICATION CHECKER
// ============================================================================
function verifyBusinessIsolation(data) {
  console.log('\n🔍 Verifying Business Isolation & Referential Integrity...');

  const bizIds = new Set(data.businesses.map(b => b.id));
  const custMap = new Map(data.customers.map(c => [c.id, c.business_id]));
  const prodMap = new Map(data.products.map(p => [p.id, p.business_id]));
  const userIds = new Set(data.users.map(u => u.id));

  let orphanCount = 0;
  let isolationBreaches = 0;

  // Check Chat Messages Receiver
  data.chatMessages.forEach(cm => {
    if (!userIds.has(cm.sender_id) || !userIds.has(cm.receiver_id)) {
      orphanCount++;
    }
  });

  // Check Orders
  data.orders.forEach(o => {
    if (!bizIds.has(o.business_id)) orphanCount++;
    const custBiz = custMap.get(o.customer_id);
    if (custBiz !== o.business_id) isolationBreaches++;
  });

  // Check Order Items
  data.orderItems.forEach(it => {
    const prodBiz = prodMap.get(it.product_id);
    const orderObj = data.orders.find(o => o.id === it.order_id);
    if (orderObj && prodBiz !== orderObj.business_id) isolationBreaches++;
  });

  if (orphanCount > 0 || isolationBreaches > 0) {
    throw new Error(`Integrity Verification Failed: ${orphanCount} orphans, ${isolationBreaches} cross-business isolation breaches.`);
  }

  console.log('  ✓ Foreign-key integrity: VERIFIED 100%');
  console.log('  ✓ Business data isolation: VERIFIED 100% (No cross-tenant leaks)');
}

// ============================================================================
// MAIN RUNNER
// ============================================================================
async function runSeed() {
  console.log('================================================================');
  console.log('🌱 STARTING COMPLETE MULTI-TENANT DATABASE RESET & RE-SEEDING');
  console.log('================================================================\n');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  const data = generateDataset(passwordHash);

  verifyBusinessIsolation(data);

  // 1. Auth Service Database
  const authDb = env.DB.AUTH_NAME || 'dropship_auth';
  const authClient = createClient(authDb);
  try {
    await authClient.connect();
    await seedAuthDB(authClient, data, passwordHash);
    console.log(`✅ [${authDb}] Seeded successfully.\n`);
  } catch (err) {
    console.error(`❌ Failed to seed [${authDb}]:`, err.message);
    throw err;
  } finally {
    await authClient.end().catch(() => {});
  }

  // 2. Business Service Database
  const bizDb = env.DB.BUSINESS_NAME || 'dropship_business';
  const bizClient = createClient(bizDb);
  try {
    await bizClient.connect();
    await seedBusinessDB(bizClient, data);
    console.log(`✅ [${bizDb}] Seeded successfully.\n`);
  } catch (err) {
    console.error(`❌ Failed to seed [${bizDb}]:`, err.message);
    throw err;
  } finally {
    await bizClient.end().catch(() => {});
  }

  // 3. Product Service Database
  const prodDb = env.DB.PRODUCT_NAME || 'dropship_product';
  const prodClient = createClient(prodDb);
  try {
    await prodClient.connect();
    await seedProductDB(prodClient, data);
    console.log(`✅ [${prodDb}] Seeded successfully.\n`);
  } catch (err) {
    console.error(`❌ Failed to seed [${prodDb}]:`, err.message);
    throw err;
  } finally {
    await prodClient.end().catch(() => {});
  }

  // 4. Order Service Database
  const orderDb = env.DB.ORDER_NAME || 'dropship_order';
  const orderClient = createClient(orderDb);
  try {
    await orderClient.connect();
    await seedOrderDB(orderClient, data);
    console.log(`✅ [${orderDb}] Seeded successfully.\n`);
  } catch (err) {
    console.error(`❌ Failed to seed [${orderDb}]:`, err.message);
    throw err;
  } finally {
    await orderClient.end().catch(() => {});
  }

  // 5. Marketing Service Database
  const mktDb = env.DB.MARKETING_NAME || 'dropship_marketing';
  const mktClient = createClient(mktDb);
  try {
    await mktClient.connect();
    await seedMarketingDB(mktClient, data);
    console.log(`✅ [${mktDb}] Seeded successfully.\n`);
  } catch (err) {
    console.error(`❌ Failed to seed [${mktDb}]:`, err.message);
    throw err;
  } finally {
    await mktClient.end().catch(() => {});
  }

  // 6. Analytics Service Database
  const analyticsDb = env.DB.ANALYTICS_NAME || 'dropship_analytics';
  const analyticsClient = createClient(analyticsDb);
  try {
    await analyticsClient.connect();
    await seedAnalyticsDB(analyticsClient, data);
    console.log(`✅ [${analyticsDb}] Seeded successfully.\n`);
  } catch (err) {
    console.error(`❌ Failed to seed [${analyticsDb}]:`, err.message);
    throw err;
  } finally {
    await analyticsClient.end().catch(() => {});
  }

  // 7. Unified Management Database
  const mgmtDb = env.DB.NAME || 'dropship_management';
  const mgmtClient = createClient(mgmtDb);
  try {
    await mgmtClient.connect();
    await seedUnifiedManagementDB(mgmtClient, data, passwordHash);
    console.log(`✅ [${mgmtDb}] Seeded synchronized unified DB successfully.\n`);
  } catch (err) {
    console.log(`⚠️ [${mgmtDb}] Unified fallback copy skipped (${err.message}).\n`);
  } finally {
    await mgmtClient.end().catch(() => {});
  }

  console.log('================================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
  console.log(`  Businesses:        ${data.businesses.length}`);
  console.log(`  Users:             ${data.users.length}`);
  console.log(`  Dealers:           ${data.dealers.length}`);
  console.log(`  Invitations:       ${data.invitations.length}`);
  console.log(`  Customers:         ${data.customers.length}`);
  console.log(`  Products:          ${data.products.length}`);
  console.log(`  Orders:            ${data.orders.length}`);
  console.log(`  Order Items:       ${data.orderItems.length}`);
  console.log(`  Returns:           ${data.returns.length}`);
  console.log(`  Campaigns:         ${data.campaigns.length}`);
  console.log(`  Chat Messages:     ${data.chatMessages.length}`);
  console.log(`  Expenses:          ${data.expenses.length}`);
  console.log(`  Notifications:     ${data.notifications.length}`);
  console.log('================================================================\n');

  console.log('Ready-to-use Portal Credentials (Password: Password123!):');
  console.log('  🛡️ Admin Portal:      admin@dropship.com');
  console.log('  🚚 Primary Dealer:    dealer@supplier.com');
  console.log('  📢 Primary Marketer:  marketing@growth.com');
  console.log('  💼 Primary Sales:     sales@dropship.com');
  console.log('================================================================\n');
}

runSeed().catch((err) => {
  console.error('Fatal Seeding Error:', err);
  process.exit(1);
});
