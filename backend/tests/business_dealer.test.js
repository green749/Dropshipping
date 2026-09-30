import request from 'supertest';
import authApp from '../services/auth-service/server.js';
import businessApp from '../services/business-dealer-service/server.js';
import { sequelize } from '../services/shared/config/database.js';

describe('Business & Dealer Endpoints', () => {
  let dropshipperToken;
  let dealerToken;
  let businessId;
  let dealerId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Register DROPSHIPPER
    const dropshipperRes = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Admin Dropshipper',
      email: 'dropshipper@example.com',
      password: 'Password123',
      role: 'DROPSHIPPER',
    });
    dropshipperToken = dropshipperRes.body.data.token;

    // Register DEALER user
    const dealerRes = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Dealer User',
      email: 'dealer@example.com',
      password: 'Password123',
      role: 'DEALER',
    });
    dealerToken = dealerRes.body.data.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Business Operations', () => {
    it('should allow DROPSHIPPER to create a new business', async () => {
      const res = await request(businessApp)
        .post('/api/v1/businesses')
        .set('Authorization', `Bearer ${dropshipperToken}`)
        .send({
          name: 'Apex Dropship Store',
          description: 'E-commerce platform',
          email: 'contact@apexstore.com',
          phone: '1234567890',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Apex Dropship Store');
      businessId = res.body.data.id;
    });

    it('should allow fetching all businesses', async () => {
      const res = await request(businessApp)
        .get('/api/v1/businesses')
        .set('Authorization', `Bearer ${dropshipperToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should deny DEALER from creating a business', async () => {
      const res = await request(businessApp)
        .post('/api/v1/businesses')
        .set('Authorization', `Bearer ${dealerToken}`)
        .send({
          name: 'Unauthorized Store',
          email: 'unauthorized@example.com',
        });

      expect(res.status).toBe(403);
    });

    it('should handle invalid UUID format in business ID route parameter with 400 Bad Request', async () => {
      const res = await request(businessApp)
        .get('/api/v1/businesses/a69e94d3-ca63-4da3-802f-b91d969exw23')
        .set('Authorization', `Bearer ${dropshipperToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid ID format');
    });
  });

  describe('Dealer & Assignment Operations', () => {
    it('should allow creating a dealer profile', async () => {
      const res = await request(businessApp)
        .post('/api/v1/dealers')
        .set('Authorization', `Bearer ${dealerToken}`)
        .send({
          company_name: 'Tech Supplies Co',
          contact_name: 'Dealer John',
          email: 'dealer@example.com',
          phone: '9876543210',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Tech Supplies Co');
      dealerId = res.body.data.id;
    });

    it('should allow DROPSHIPPER to assign dealer to business', async () => {
      const res = await request(businessApp)
        .post(`/api/v1/businesses/${businessId}/dealers/${dealerId}`)
        .set('Authorization', `Bearer ${dropshipperToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACTIVE');
    });

    it('should list assigned dealers for a business', async () => {
      const res = await request(businessApp)
        .get(`/api/v1/businesses/${businessId}/dealers`)
        .set('Authorization', `Bearer ${dropshipperToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });
});
