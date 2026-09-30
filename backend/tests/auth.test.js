import request from 'supertest';
import app from '../services/auth-service/server.js';
import { sequelize } from '../services/shared/config/database.js';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  const testUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123',
    role: 'DROPSHIPPER',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new user', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user).not.toHaveProperty('password_hash');
      expect(res.body.data).toHaveProperty('token');
    });

    it('should fail when registering with existing email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('User with this email already exists');
    });

    it('should fail when password is too short', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Short Pass',
        email: 'short@example.com',
        password: '123',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: 'WrongPassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user profile when authenticated', async () => {
      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should fail when no authorization header is provided', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
