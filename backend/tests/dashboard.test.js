import request from 'supertest';
import authApp from '../services/auth-service/server.js';
import businessApp from '../services/business-dealer-service/server.js';
import analyticsApp from '../services/analytics-service/server.js';
import { sequelize } from '../services/shared/config/database.js';

describe('Dashboard Endpoints', () => {
  let dropshipperToken;
  let dealerToken;
  let marketingToken;

  beforeAll(async () => {
    await import('../services/auth-service/models/index.js');
    await import('../services/business-dealer-service/models/index.js');
    await import('../services/analytics-service/models/index.js');
    await sequelize.sync({ force: true });

    // Register DROPSHIPPER
    const dsRes = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Main Admin',
      email: 'admin@dropship.com',
      password: 'Password123',
      role: 'DROPSHIPPER',
    });
    dropshipperToken = dsRes.body.data.token;

    // Register DEALER
    const dRes = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Dealer Account',
      email: 'dealer@dropship.com',
      password: 'Password123',
      role: 'DEALER',
    });
    dealerToken = dRes.body.data.token;
    const dealerUserId = dRes.body.data.user.id;

    await request(businessApp)
      .post('/api/v1/dealers')
      .set('Authorization', `Bearer ${dealerToken}`)
      .send({
        user_id: dealerUserId,
        company_name: 'Dealer Corp',
        email: 'dealer@dropship.com',
      });

    // Register MARKETING
    const mRes = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Marketing Lead',
      email: 'mkt@dropship.com',
      password: 'Password123',
      role: 'MARKETING',
    });
    marketingToken = mRes.body.data.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should return overview metrics for DROPSHIPPER', async () => {
    const res = await request(analyticsApp)
      .get('/api/v1/dashboard/overview')
      .set('Authorization', `Bearer ${dropshipperToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('overview');
    expect(res.body.data.overview).toHaveProperty('totalBusinesses');
    expect(res.body.data.overview).toHaveProperty('totalRevenue');
  });

  it('should return dealer metrics for DEALER', async () => {
    const res = await request(analyticsApp)
      .get('/api/v1/dashboard/dealer')
      .set('Authorization', `Bearer ${dealerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalProducts');
    expect(res.body.data).toHaveProperty('lowStockProducts');
  });

  it('should return marketing metrics for MARKETING', async () => {
    const res = await request(analyticsApp)
      .get('/api/v1/dashboard/marketing')
      .set('Authorization', `Bearer ${marketingToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('activeCampaigns');
  });
});
