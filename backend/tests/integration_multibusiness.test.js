import request from 'supertest';
import authApp from '../services/auth-service/server.js';
import businessApp from '../services/business-dealer-service/server.js';
import productApp from '../services/product-service/server.js';
import orderApp from '../services/order-service/server.js';
import marketingApp from '../services/marketing-service/server.js';
import analyticsApp from '../services/analytics-service/server.js';
import { sequelize } from '../services/shared/config/database.js';

describe('Comprehensive End-to-End Multi-Business Integration & Security Tests', () => {
  let adminToken;
  let adminUser;
  let dealerAToken;
  let dealerAUser;
  let dealerAId;
  let businessAId;
  let businessBId;
  let productAId;
  let customerAId;
  let orderAId;
  let campaignAId;

  beforeAll(async () => {
    // Import all models to register schemas
    await import('../services/auth-service/models/index.js');
    await import('../services/business-dealer-service/models/index.js');
    await import('../services/product-service/models/index.js');
    await import('../services/order-service/models/index.js');
    await import('../services/marketing-service/models/index.js');
    await import('../services/analytics-service/models/index.js');

    await sequelize.sync({ force: true });

    // 1. Register Admin (Dropshipper)
    const adminRes = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Super Admin',
      email: 'admin@dropship.com',
      password: 'Password123',
      role: 'DROPSHIPPER',
    });
    adminToken = adminRes.body.data.token || adminRes.body.data.accessToken;
    adminUser = adminRes.body.data.user;

    // 2. Register Dealer A
    const dealerRes = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Dealer Alpha',
      email: 'dealeralpha@dropship.com',
      password: 'Password123',
      role: 'DEALER',
    });
    dealerAToken = dealerRes.body.data.token || dealerRes.body.data.accessToken;
    dealerAUser = dealerRes.body.data.user;

    // 3. Create Businesses A and B
    const bizARes = await request(businessApp)
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Storefront Alpha',
        description: 'Primary Storefront',
        email: 'storefront.alpha@domain.com',
        phone: '1234567890',
      });
    businessAId = bizARes.body.data.id;

    const bizBRes = await request(businessApp)
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Storefront Beta',
        description: 'Secondary Storefront',
        email: 'storefront.beta@domain.com',
        phone: '9876543210',
      });
    businessBId = bizBRes.body.data.id;

    // 4. Create Dealer profile and assign to Business A ONLY
    const dProfileRes = await request(businessApp)
      .post('/api/v1/dealers')
      .set('Authorization', `Bearer ${dealerAToken}`)
      .send({
        user_id: dealerAUser.id,
        company_name: 'Alpha Wholesale Ltd',
        email: 'dealeralpha@dropship.com',
        phone: '9876543210',
      });
    dealerAId = dProfileRes.body.data.id;

    await request(businessApp)
      .post(`/api/v1/businesses/${businessAId}/dealers/${dealerAId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('1. Non-Admin Global Access Rejection', () => {
    it('should reject Dealer A from requesting business_id=all with 403 Forbidden', async () => {
      const res = await request(productApp)
        .get('/api/v1/products?business_id=all')
        .set('Authorization', `Bearer ${dealerAToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow Admin to request business_id=all', async () => {
      const res = await request(productApp)
        .get('/api/v1/products?business_id=all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('2. Product Isolation & IDOR Protection', () => {
    it('should create Product A under Business A', async () => {
      const res = await request(productApp)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          business_id: businessAId,
          name: 'Alpha Gadget',
          sku: 'SKU-ALPHA-100',
          selling_price: 99.99,
          cost_price: 50.0,
          stock_quantity: 100,
          category: 'Electronics',
        });

      if (res.status !== 201) {
        console.error('Product creation error:', res.status, res.body);
      }
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_id).toBe(businessAId);
      productAId = res.body.data.id;
    });

    it('should NOT list Product A when querying Business B', async () => {
      const res = await request(productApp)
        .get(`/api/v1/products?business_id=${businessBId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('should block Dealer A from viewing Product A under unauthorized Business B context (IDOR)', async () => {
      const res = await request(productApp)
        .get(`/api/v1/products/${productAId}?business_id=${businessBId}`)
        .set('Authorization', `Bearer ${dealerAToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('3. Customer & Order Isolation & IDOR Protection', () => {
    it('should create Customer A under Business A', async () => {
      const res = await request(orderApp)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          business_id: businessAId,
          name: 'Jane Doe',
          email: 'jane@alpha.com',
          phone: '9876543210',
        });

      if (res.status !== 201) {
        console.error('Customer creation error:', res.status, res.body);
      }
      expect(res.status).toBe(201);
      expect(res.body.data.business_id).toBe(businessAId);
      customerAId = res.body.data.id;
    });

    it('should create Order A under Business A', async () => {
      const res = await request(orderApp)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          business_id: businessAId,
          customer_id: customerAId,
          shipping_address: '123 Alpha St',
          items: [
            {
              product_id: productAId,
              quantity: 2,
              unit_price: 99.99,
            },
          ],
        });

      if (res.status !== 201) {
        console.error('Order creation error:', res.status, res.body);
      }
      expect(res.status).toBe(201);
      expect(res.body.data.business_id).toBe(businessAId);
      orderAId = res.body.data.id;
    });

    it('should NOT return Order A when listing Business B orders', async () => {
      const res = await request(orderApp)
        .get(`/api/v1/orders?business_id=${businessBId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('should block Dealer A from accessing Order A when passing unauthorized Business B (IDOR)', async () => {
      const res = await request(orderApp)
        .get(`/api/v1/orders/${orderAId}?business_id=${businessBId}`)
        .set('Authorization', `Bearer ${dealerAToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('4. Marketing & Campaign Isolation', () => {
    it('should create Campaign A under Business A', async () => {
      const res = await request(marketingApp)
        .post('/api/v1/campaigns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          business_id: businessAId,
          name: 'Summer Alpha Sale',
          budget: 5000.0,
          status: 'ACTIVE',
        });

      if (res.status !== 201) {
        console.error('Campaign creation error:', res.status, res.body);
      }
      expect(res.status).toBe(201);
      expect(res.body.data.business_id).toBe(businessAId);
      campaignAId = res.body.data.id;
    });

    it('should NOT list Campaign A under Business B', async () => {
      const res = await request(marketingApp)
        .get(`/api/v1/campaigns?business_id=${businessBId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });
  });

  describe('5. Dashboard Analytics Scoped Metrics', () => {
    it('should report Business A overview with 1 product, 1 customer, 1 order', async () => {
      const res = await request(analyticsApp)
        .get(`/api/v1/dashboard/overview?business_id=${businessAId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.overview.totalProducts).toBe(1);
      expect(res.body.data.overview.totalOrders).toBe(1);
      expect(res.body.data.overview.totalCustomers).toBe(1);
    });

    it('should report Business B overview with 0 products, 0 customers, 0 orders', async () => {
      const res = await request(analyticsApp)
        .get(`/api/v1/dashboard/overview?business_id=${businessBId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.overview.totalProducts).toBe(0);
      expect(res.body.data.overview.totalOrders).toBe(0);
      expect(res.body.data.overview.totalCustomers).toBe(0);
    });

    it('should report marketing dashboard metrics strictly scoped to Business A vs Business B', async () => {
      const resA = await request(analyticsApp)
        .get(`/api/v1/dashboard/marketing?business_id=${businessAId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(resA.status).toBe(200);
      expect(resA.body.data.activeCampaigns).toBe(1);
      expect(resA.body.data.totalCampaignBudget).toBe(5000.0);

      const resB = await request(analyticsApp)
        .get(`/api/v1/dashboard/marketing?business_id=${businessBId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(resB.status).toBe(200);
      expect(resB.body.data.activeCampaigns).toBe(0);
      expect(resB.body.data.totalCampaignBudget).toBe(0.0);
    });
  });
});
