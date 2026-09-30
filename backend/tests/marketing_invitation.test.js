import { jest } from '@jest/globals';
import request from 'supertest';
import businessApp from '../services/business-dealer-service/server.js';
import authApp from '../services/auth-service/server.js';
import { connectDB, sequelize } from '../services/shared/config/database.js';
import { generateToken } from '../services/shared/utils/jwt.js';

describe('Digital Marketer Invitation Endpoints', () => {
  let adminToken;
  let invitationToken;

  beforeAll(async () => {
    jest.setTimeout(30000);
    await connectDB('dropship_auth', async () => {
      const { User } = await import('../services/auth-service/models/index.js');
      await User.sync({ force: true });
    });

    await connectDB('dropship_business', async () => {
      const models = await import('../services/business-dealer-service/models/index.js');
      await models.DealerInvitation.sync({ force: true });
      await models.Dealer.sync({ force: true });
      await models.Business.sync({ force: true });
      await models.BusinessDealer.sync({ force: true });
    });

    adminToken = generateToken({
      id: '11111111-1111-1111-1111-111111111111',
      email: 'admin@dropship.com',
      role: 'DROPSHIPPER',
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/v1/marketing/invite', () => {
    it('should allow dropshipper admin to invite a digital marketer', async () => {
      const res = await request(businessApp)
        .post('/api/v1/marketing/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'marketer@example.com',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invitation.email).toBe('marketer@example.com');
      expect(res.body.data.invitation.role).toBe('MARKETING');
      expect(res.body.data.invitation).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('inviteLink');

      invitationToken = res.body.data.invitation.token;
    });

    it('should reject invitation creation without email', async () => {
      const res = await request(businessApp)
        .post('/api/v1/marketing/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/marketing/invitations/:token', () => {
    it('should allow public access to view marketer invitation details by token', async () => {
      const res = await request(businessApp).get(`/api/v1/marketing/invitations/${invitationToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('marketer@example.com');
      expect(res.body.data.role).toBe('MARKETING');
      expect(res.body.data.status).toBe('PENDING');
    });
  });

  describe('POST /api/v1/marketing/accept-invite', () => {
    it('should allow invited marketer to accept invite and create user with MARKETING role', async () => {
      const res = await request(businessApp)
        .post('/api/v1/marketing/accept-invite')
        .send({
          token: invitationToken,
          name: 'Marketing Lead Sarah',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('marketer@example.com');
      expect(res.body.data.user.role).toBe('MARKETING');
    });

    it('should reject accepting an already accepted marketer invitation token', async () => {
      const res = await request(businessApp)
        .post('/api/v1/marketing/accept-invite')
        .send({
          token: invitationToken,
          name: 'Duplicate Accept',
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('non-pending');
    });
  });
});
