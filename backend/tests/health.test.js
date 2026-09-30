import request from 'supertest';
import app from '../services/auth-service/server.js';

describe('GET /health', () => {
  it('should return 200 OK with microservice health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('UP');
    expect(response.body.service).toBe('Auth Service');
    expect(response.body).toHaveProperty('timestamp');
  });
});
