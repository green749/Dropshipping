import request from 'supertest';
import authApp from '../services/auth-service/server.js';
import businessApp from '../services/business-dealer-service/server.js';
import orderApp from '../services/order-service/server.js';
import { sequelize } from '../services/shared/config/database.js';

describe('Order Creation & Transactional Stock Handling', () => {
  let dropshipperToken;
  let dealerToken;
  let businessId;
  let dealerId;
  let customerId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // 1. Create Dropshipper & Business
    const dsRes = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Dropshipper Owner',
      email: 'owner@dropship.com',
      password: 'Password123',
      role: 'DROPSHIPPER',
    });
    dropshipperToken = dsRes.body.data.token;

    const bizRes = await request(businessApp)
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${dropshipperToken}`)
      .send({
        name: 'Gear & Gadgets',
        email: 'info@geargadgets.com',
      });
    businessId = bizRes.body.data.id;

    // 2. Create Dealer & Assign to Business
    const dealerUserRes = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Tech Dealer',
      email: 'techdealer@example.com',
      password: 'Password123',
      role: 'DEALER',
    });
    dealerToken = dealerUserRes.body.data.token;

    const dProfile = await request(businessApp)
      .post('/api/v1/dealers')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({
        company_name: 'Tech Wholesalers',
        email: 'techdealer@example.com',
      });
    dealerId = dProfile.body.data.id;

    await request(businessApp)
      .post(`/api/v1/businesses/${businessId}/dealers/${dealerId}`)
      .set('Authorization', `Bearer ${dropshipperToken}`);

    // 3. Create Customer
    const custRes = await request(orderApp)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${dropshipperToken}`)
      .send({
        business_id: businessId,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '555-0199',
        address: '123 Main St, Tech City',
      });
    customerId = custRes.body.data.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/v1/orders', () => {
    let createdOrderId;

    it('should successfully create an order', async () => {
      const res = await request(orderApp)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${dropshipperToken}`)
        .send({
          business_id: businessId,
          customer_id: customerId,
          shipping_address: '123 Main St, Tech City',
          shipping_fee: 5.0,
          tax: 2.5,
          items: [
            {
              product_id: '11111111-1111-1111-1111-111111111111',
              unit_price: 25.0,
              quantity: 2,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(Number(res.body.data.subtotal)).toBe(50.0); // 2 * 25.00
      expect(Number(res.body.data.total_amount)).toBe(57.5); // 50 + 5 + 2.5
      expect(res.body.data.items.length).toBe(1);
      createdOrderId = res.body.data.id;
    });

    it('should update order details and status', async () => {
      const res = await request(orderApp)
        .patch(`/api/v1/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${dropshipperToken}`)
        .send({
          shipping_address: '456 Updated Tech Boulevard',
          status: 'SHIPPED',
          payment_status: 'PAID',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.shipping_address).toBe('456 Updated Tech Boulevard');
      expect(res.body.data.status).toBe('SHIPPED');
      expect(res.body.data.payment_status).toBe('PAID');
    });

    it('should allow admin (DROPSHIPPER) to delete an order', async () => {
      const res = await request(orderApp)
        .delete(`/api/v1/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${dropshipperToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Order deleted successfully');
    });
  });

  describe('Customer CRUD Operations', () => {
    it('should allow updating customer details', async () => {
      const res = await request(orderApp)
        .patch(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${dropshipperToken}`)
        .send({
          name: 'Alice Johnson Updated',
          city: 'Seattle',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Alice Johnson Updated');
      expect(res.body.data.city).toBe('Seattle');
    });

    it('should allow admin (DROPSHIPPER) to delete a customer', async () => {
      const res = await request(orderApp)
        .delete(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${dropshipperToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Customer deleted successfully');
    });
  });
});
