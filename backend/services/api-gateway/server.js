import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import proxy from 'express-http-proxy';
import { env } from '../shared/config/env.js';
import { corsOptions } from '../shared/config/cors.js';
import { setupSwagger } from './docs/swagger.js';
import { setupWebSocket } from './socket.js';

import { profilerMiddleware } from '../shared/middlewares/profiler.middleware.js';
import { compressionMiddleware } from '../shared/middlewares/compression.middleware.js';
import systemRoutes from './routes/system.routes.js';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(compressionMiddleware);
app.use(profilerMiddleware);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 Welcome to Multi-Business Dropshipping Microservices API Gateway',
    documentation: 'http://localhost:5000/docs',
    healthCheck: 'http://localhost:5000/health',
    systemMonitor: 'http://localhost:5000/api/v1/system/monitor',
    services: {
      auth: 'http://localhost:5000/api/v1/auth (Port 5001)',
      chat: 'http://localhost:5000/api/v1/chat (Port 5001)',
      businesses: 'http://localhost:5000/api/v1/businesses (Port 5002)',
      dealers: 'http://localhost:5000/api/v1/dealers (Port 5002)',
      products: 'http://localhost:5000/api/v1/products (Port 5003)',
      orders: 'http://localhost:5000/api/v1/orders (Port 5004)',
      campaigns: 'http://localhost:5000/api/v1/campaigns (Port 5005)',
      dashboard: 'http://localhost:5000/api/v1/dashboard (Port 5006)',
      system: 'http://localhost:5000/api/v1/system/monitor',
    },
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
  });
});

// System Observability & Profiler API Routes
app.use('/api/v1/system', express.json(), systemRoutes);

// Swagger API Docs
setupSwagger(app);

// Proxy routes to Microservices (with 25MB payload limit for base64 media & images)
const defaultProxyOptions = {
  limit: '25mb',
  parseReqBody: false,
  proxyErrorHandler: (err, res, next) => {
    if (err && (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET' || err.code === 'ENOTFOUND')) {
      return res.status(503).json({
        status: 'error',
        message: 'Downstream microservice is unavailable or connecting. Please retry in a moment.',
        code: err.code,
      });
    }
    next(err);
  },
};

// Auth Service (5001)
app.use('/api/v1/auth', proxy(env.AUTH_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/auth${req.url}`
}));
app.use('/api/v1/chat', proxy(env.AUTH_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/chat${req.url}`
}));
app.use('/api/v1/notifications', proxy(env.AUTH_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/notifications${req.url}`
}));
app.use('/api/v1/audit-logs', proxy(env.AUTH_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/audit-logs${req.url}`
}));
app.use('/api/v1/mail', proxy(env.AUTH_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/mail${req.url}`
}));

// Business & Dealer Service (5002)
app.use('/api/v1/businesses', proxy(env.BUSINESS_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/businesses${req.url}`
}));
app.use('/api/v1/dealers', proxy(env.BUSINESS_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/dealers${req.url}`
}));

// Product & Inventory Service (5003)
app.use('/api/v1/products', proxy(env.PRODUCT_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/products${req.url}`
}));
app.use('/api/v1/inventory', proxy(env.PRODUCT_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/inventory${req.url}`
}));
app.use('/api/v1/product-research', proxy(env.PRODUCT_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/product-research${req.url}`
}));

// Order & Customer Service (5004)
app.use('/api/v1/customers', proxy(env.ORDER_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/customers${req.url}`
}));
app.use('/api/v1/orders', proxy(env.ORDER_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/orders${req.url}`
}));
app.use('/api/v1/returns', proxy(env.ORDER_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/returns${req.url}`
}));

// Marketing Service (5005) & Marketing Invitations
app.use('/api/v1/marketing/invite', proxy(env.BUSINESS_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/marketing/invite${req.url}`
}));
app.use('/api/v1/marketing/invitations', proxy(env.BUSINESS_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/marketing/invitations${req.url}`
}));
app.use('/api/v1/marketing/accept-invite', proxy(env.BUSINESS_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/marketing/accept-invite${req.url}`
}));

// Sales Team Invitations
app.use('/api/v1/sales/invite', proxy(env.BUSINESS_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/sales/invite${req.url}`
}));
app.use('/api/v1/sales/invitations', proxy(env.BUSINESS_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/sales/invitations${req.url}`
}));
app.use('/api/v1/sales/accept-invite', proxy(env.BUSINESS_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/sales/accept-invite${req.url}`
}));
app.use('/api/v1/campaigns', proxy(env.MARKETING_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/campaigns${req.url}`
}));
app.use('/api/v1/social-accounts', proxy(env.MARKETING_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/social-accounts${req.url}`
}));
app.use('/api/v1/posts', proxy(env.MARKETING_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/posts${req.url}`
}));
app.use('/api/v1/ads', proxy(env.MARKETING_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/ads${req.url}`
}));
app.use('/api/v1/marketing/ai', proxy(env.MARKETING_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/marketing/ai${req.url}`
}));
app.use('/api/v1/ai', proxy(env.MARKETING_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/ai${req.url}`
}));

// Analytics & Financial Services (5006)
app.use('/api/v1/dashboard', proxy(env.ANALYTICS_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/dashboard${req.url}`
}));
app.use('/api/v1/expenses', proxy(env.ANALYTICS_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/expenses${req.url}`
}));
app.use('/api/v1/finances', proxy(env.ANALYTICS_SERVICE_URL, {
  ...defaultProxyOptions,
  proxyReqPathResolver: (req) => `/api/v1/finances${req.url}`
}));

const PORT = env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO WebSocket Engine
setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 API Gateway & WebSocket Server running on port ${PORT}`);
});
