import request from 'supertest';
import authApp from '../services/auth-service/server.js';
import businessApp from '../services/business-dealer-service/server.js';
import productApp from '../services/product-service/server.js';
import { sequelize } from '../services/shared/config/database.js';

describe('Product Endpoints & Dealer Ownership', () => {
  let dropshipperToken;
  let dealer1Token;
  let dealer2Token;
  let businessId;
  let dealer1Id;
  let dealer2Id;
  let productId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // 1. Create Dropshipper
    const dsRes = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Dropshipper Admin',
      email: 'admin@dropship.com',
      password: 'Password123',
      role: 'DROPSHIPPER',
    });
    dropshipperToken = dsRes.body.data.token;

    // 2. Create Business
    const bizRes = await request(businessApp)
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${dropshipperToken}`)
      .send({
        name: 'Electronics Hub',
        email: 'info@electronicshub.com',
      });
    businessId = bizRes.body.data.id;

    // 3. Create Dealer 1
    const d1Res = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Dealer One',
      email: 'dealer1@example.com',
      password: 'Password123',
      role: 'DEALER',
    });
    dealer1Token = d1Res.body.data.token;

    const d1Profile = await request(businessApp)
      .post('/api/v1/dealers')
      .set('Authorization', `Bearer ${dealer1Token}`)
      .send({
        company_name: 'Dealer One Ltd',
        email: 'dealer1@example.com',
      });
    dealer1Id = d1Profile.body.data.id;

    // Assign Dealer 1 to Business
    await request(businessApp)
      .post(`/api/v1/businesses/${businessId}/dealers/${dealer1Id}`)
      .set('Authorization', `Bearer ${dropshipperToken}`);

    // 4. Create Dealer 2 (unassigned)
    const d2Res = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Dealer Two',
      email: 'dealer2@example.com',
      password: 'Password123',
      role: 'DEALER',
    });
    dealer2Token = d2Res.body.data.token;

    const d2Profile = await request(businessApp)
      .post('/api/v1/dealers')
      .set('Authorization', `Bearer ${dealer2Token}`)
      .send({
        company_name: 'Dealer Two Ltd',
        email: 'dealer2@example.com',
      });
    dealer2Id = d2Profile.body.data.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Product Creation & Ownership', () => {
    it('should allow Dealer 1 to create a product (dealer_id derived server-side)', async () => {
      const res = await request(productApp)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${dealer1Token}`)
        .send({
          name: 'Wireless Bluetooth Headphones',
          sku: 'HEADPHONE-BT-01',
          category: 'Electronics',
          cost_price: 25.0,
          selling_price: 49.99,
          stock_quantity: 100,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      productId = res.body.data.id;
    });

    it('should reject product creation with duplicate SKU', async () => {
      const res = await request(productApp)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${dealer1Token}`)
        .send({
          name: 'Duplicate SKU Product',
          sku: 'HEADPHONE-BT-01',
          category: 'Electronics',
          cost_price: 10.0,
          selling_price: 20.0,
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already exists');
    });

    it('should allow Dealer 1 to update own product', async () => {
      const res = await request(productApp)
        .patch(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${dealer1Token}`)
        .send({ selling_price: 59.99 });

      expect(res.status).toBe(200);
      expect(res.body.data.selling_price).toBe(59.99);
    });

    it('should return products', async () => {
      const res = await request(productApp)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${dropshipperToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe(productId);
    });

    it('should forbid Dealer 2 from updating Dealer 1 product', async () => {
      const res = await request(productApp)
        .patch(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${dealer2Token}`)
        .send({ selling_price: 19.99 });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Access denied');
    });

    it('should forbid Dealer 2 from deleting Dealer 1 product', async () => {
      const res = await request(productApp)
        .delete(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${dealer2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Access denied');
    });
  });
});
