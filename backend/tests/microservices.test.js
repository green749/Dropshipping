import request from 'supertest';
import authApp from '../services/auth-service/server.js';
import businessApp from '../services/business-dealer-service/server.js';
import productApp from '../services/product-service/server.js';
import orderApp from '../services/order-service/server.js';
import marketingApp from '../services/marketing-service/server.js';
import analyticsApp from '../services/analytics-service/server.js';

describe('Microservices Health Checks', () => {
  it('Auth Service health check', async () => {
    const res = await request(authApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('Auth Service');
  });

  it('Business & Dealer Service health check', async () => {
    const res = await request(businessApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('Business & Dealer Service');
  });

  it('Product Service health check', async () => {
    const res = await request(productApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('Product Service');
  });

  it('Order & Customer Service health check', async () => {
    const res = await request(orderApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('Order & Customer Service');
  });

  it('Marketing Service health check', async () => {
    const res = await request(marketingApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('Marketing Service');
  });

  it('Analytics Service health check', async () => {
    const res = await request(analyticsApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('Analytics Service');
  });
});
