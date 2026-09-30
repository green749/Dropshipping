import request from 'supertest';
import authApp from '../services/auth-service/server.js';
import businessApp from '../services/business-dealer-service/server.js';
import { sequelize } from '../services/shared/config/database.js';

describe('Multi-Business Chat & Isolation Endpoints', () => {
  let dropshipperToken;
  let dropshipperUser;
  let dealerAToken;
  let dealerAUser;
  let businessAId;
  let businessBId;

  beforeAll(async () => {
    await import('../services/auth-service/models/index.js');
    await import('../services/business-dealer-service/models/index.js');
    await sequelize.sync({ force: true });

    // 1. Register Dropshipper (Admin)
    const dsRes = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Admin Alexander',
      email: 'alexander@dropship.com',
      password: 'Password123',
      role: 'DROPSHIPPER',
    });
    dropshipperToken = dsRes.body.data.accessToken || dsRes.body.data.token;
    dropshipperUser = dsRes.body.data.user;

    // 2. Create Business A and Business B
    const bizARes = await request(businessApp)
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${dropshipperToken}`)
      .send({
        name: 'Alpha Corp',
        description: 'First Business',
        email: 'alpha@corp.com',
        phone: '1112223333',
      });
    businessAId = bizARes.body.data.id;

    const bizBRes = await request(businessApp)
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${dropshipperToken}`)
      .send({
        name: 'Beta LLC',
        description: 'Second Business',
        email: 'beta@llc.com',
        phone: '4445556666',
      });
    businessBId = bizBRes.body.data.id;

    // 3. Register Dealer A
    const dA和大Res = await request(authApp).post('/api/v1/auth/register').send({
      name: 'Dealer One',
      email: 'dealer1@domain.com',
      password: 'Password123',
      role: 'DEALER',
    });
    dealerAToken = dA和大Res.body.data.accessToken || dA和大Res.body.data.token;
    dealerAUser = dA和大Res.body.data.user;

    // Create Dealer Record
    const dealerRecRes = await request(businessApp)
      .post('/api/v1/dealers')
      .set('Authorization', `Bearer ${dealerAToken}`)
      .send({
        user_id: dealerAUser.id,
        company_name: 'Dealer One Inc',
        email: 'dealer1@domain.com',
      });
    const dealerAId = dealerRecRes.body.data.id;

    // Assign Dealer A to Business A only
    await request(businessApp)
      .post(`/api/v1/businesses/${businessAId}/dealers/${dealerAId}`)
      .set('Authorization', `Bearer ${dropshipperToken}`)
      .send({});
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should send a direct message in Business A and verify business_id is attached', async () => {
    const res = await request(authApp)
      .post('/api/v1/chat/messages')
      .set('Authorization', `Bearer ${dropshipperToken}`)
      .send({
        receiver_id: dealerAUser.id,
        content: 'Hello Dealer in Business Alpha',
        business_id: businessAId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.business_id).toBe(businessAId);
    expect(res.body.data.content).toBe('Hello Dealer in Business Alpha');
  });

  it('should retrieve conversation in Business A', async () => {
    const res = await request(authApp)
      .get(`/api/v1/chat/messages/${dealerAUser.id}?business_id=${businessAId}`)
      .set('Authorization', `Bearer ${dropshipperToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.messages.length).toBe(1);
    expect(res.body.data.messages[0].content).toBe('Hello Dealer in Business Alpha');
  });

  it('should NOT retrieve Business A messages when querying Business B (Isolation)', async () => {
    const res = await request(authApp)
      .get(`/api/v1/chat/messages/${dealerAUser.id}?business_id=${businessBId}`)
      .set('Authorization', `Bearer ${dropshipperToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.messages.length).toBe(0);
  });

  it('should return unread count scoped to Business A and block unauthorized Business B with 403', async () => {
    // Send message from Admin to Dealer A in Business A
    await request(authApp)
      .post('/api/v1/chat/messages')
      .set('Authorization', `Bearer ${dropshipperToken}`)
      .send({
        receiver_id: dealerAUser.id,
        content: 'Second unread msg in Alpha',
        business_id: businessAId,
      });

    // Dealer A checks unread in Business A
    const resA = await request(authApp)
      .get(`/api/v1/chat/unread-count?business_id=${businessAId}`)
      .set('Authorization', `Bearer ${dealerAToken}`);

    expect(resA.status).toBe(200);
    expect(resA.body.data.unreadCount).toBeGreaterThanOrEqual(1);

    // Dealer A checks unread in Business B (should be 403 because Dealer A has no access to Business B)
    const resB = await request(authApp)
      .get(`/api/v1/chat/unread-count?business_id=${businessBId}`)
      .set('Authorization', `Bearer ${dealerAToken}`);

    expect(resB.status).toBe(403);
  });

  it('should reject Dealer A from sending a message under unauthorized Business B with 403', async () => {
    const res = await request(authApp)
      .post('/api/v1/chat/messages')
      .set('Authorization', `Bearer ${dealerAToken}`)
      .send({
        receiver_id: dropshipperUser.id,
        content: 'Unauthorized msg in Business B',
        business_id: businessBId,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow Dealer A to send message in authorized Business A and Admin receives it', async () => {
    const res = await request(authApp)
      .post('/api/v1/chat/messages')
      .set('Authorization', `Bearer ${dealerAToken}`)
      .send({
        receiver_id: dropshipperUser.id,
        content: 'Hello Admin from Dealer in Business Alpha',
        business_id: businessAId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.business_id).toBe(businessAId);
  });
});
