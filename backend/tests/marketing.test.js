import request from 'supertest';
import authApp from '../services/auth-service/server.js';
import businessApp from '../services/business-dealer-service/server.js';
import marketingApp from '../services/marketing-service/server.js';
import { sequelize } from '../services/shared/config/database.js';

describe('Marketing Module Endpoints', () => {
  let marketingToken;
  let businessId;
  let campaignId;
  let socialAccountId;
  let postId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Register MARKETING user
    const mRes = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Marketing Specialist',
      email: 'marketing@example.com',
      password: 'Password123',
      role: 'MARKETING',
    });
    marketingToken = mRes.body.data.token;

    // Register DROPSHIPPER to create Business
    const dsRes = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Dropshipper Owner',
      email: 'owner@dropship.com',
      password: 'Password123',
      role: 'DROPSHIPPER',
    });
    const dsToken = dsRes.body.data.token;

    const bizRes = await request(businessApp)
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${dsToken}`)
      .send({
        name: 'Fashion Hub',
        email: 'info@fashionhub.com',
      });
    businessId = bizRes.body.data.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Campaigns & Social Accounts', () => {
    it('should allow MARKETING user to create a campaign', async () => {
      const res = await request(marketingApp)
        .post('/api/v1/campaigns')
        .set('Authorization', `Bearer ${marketingToken}`)
        .send({
          business_id: businessId,
          name: 'Summer Sale 2026',
          objective: 'Brand Awareness',
          budget: 5000,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Summer Sale 2026');
      campaignId = res.body.data.id;
    });

    it('should connect a social account without exposing tokens in standard response', async () => {
      const res = await request(marketingApp)
        .post('/api/v1/social-accounts')
        .set('Authorization', `Bearer ${marketingToken}`)
        .send({
          business_id: businessId,
          platform: 'INSTAGRAM',
          account_name: '@fashionhub_official',
          access_token: 'secret_access_token_123',
          refresh_token: 'secret_refresh_token_456',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).not.toHaveProperty('access_token');
      expect(res.body.data).not.toHaveProperty('refresh_token');
      socialAccountId = res.body.data.id;
    });
  });

  describe('Posts & Advertisements', () => {
    it('should create a social media post', async () => {
      const res = await request(marketingApp)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${marketingToken}`)
        .send({
          campaign_id: campaignId,
          social_account_id: socialAccountId,
          content: 'Discover our new Summer Collection! ☀️👗 #Fashion',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DRAFT');
      postId = res.body.data.id;
    });

    it('should publish a social post', async () => {
      const res = await request(marketingApp)
        .post(`/api/v1/posts/${postId}/publish`)
        .set('Authorization', `Bearer ${marketingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PUBLISHED');
      expect(res.body.data.published_at).not.toBeNull();
    });
  });
});
