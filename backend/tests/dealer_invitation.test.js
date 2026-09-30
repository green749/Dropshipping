import { jest } from '@jest/globals';
import request from 'supertest';
import businessApp from '../services/business-dealer-service/server.js';
import authApp from '../services/auth-service/server.js';
import { connectDB, sequelize } from '../services/shared/config/database.js';
import { generateToken } from '../services/shared/utils/jwt.js';

describe('Dealer Invitation Endpoints', () => {
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

  describe('POST /api/v1/dealers/invite', () => {
    it('should allow dropshipper admin to invite a dealer', async () => {
      const res = await request(businessApp)
        .post('/api/v1/dealers/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'inviteddealer@example.com',
          company_name: 'Invited Logistics Co',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invitation.email).toBe('inviteddealer@example.com');
      expect(res.body.data.invitation.company_name).toBe('Invited Logistics Co');
      expect(res.body.data.invitation).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('inviteLink');

      invitationToken = res.body.data.invitation.token;
    });

    it('should reject invitation creation without email', async () => {
      const res = await request(businessApp)
        .post('/api/v1/dealers/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/dealers/invitations/:token', () => {
    it('should allow public access to view invitation details by token', async () => {
      const res = await request(businessApp).get(`/api/v1/dealers/invitations/${invitationToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('inviteddealer@example.com');
      expect(res.body.data.company_name).toBe('Invited Logistics Co');
      expect(res.body.data.status).toBe('PENDING');
    });

    it('should return 404 for non-existent invitation token', async () => {
      const res = await request(businessApp).get('/api/v1/dealers/invitations/invalid-token-123');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid or expired invitation token');
    });
  });

  describe('POST /api/v1/dealers/accept-invite', () => {
    it('should allow invited dealer to accept invite and create account + profile', async () => {
      const res = await request(businessApp)
        .post('/api/v1/dealers/accept-invite')
        .send({
          token: invitationToken,
          name: 'Invited Dealer Owner',
          password: 'Password123!',
          phone: '+18005550199',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('inviteddealer@example.com');
      expect(res.body.data.dealer.company_name).toBe('Invited Logistics Co');
    });

    it('should reject accepting an already accepted invitation token', async () => {
      const res = await request(businessApp)
        .post('/api/v1/dealers/accept-invite')
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

  describe('GET /api/v1/dealers/invitations', () => {
    it('should allow dropshipper admin to list all invitations', async () => {
      const res = await request(businessApp)
        .get('/api/v1/dealers/invitations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });
});
