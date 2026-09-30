import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '../shared/config/env.js';
import { connectDB, setServiceDatabase } from '../shared/config/database.js';

setServiceDatabase(env.DB.AUTH_NAME);

import { errorHandler } from '../shared/middlewares/error.middleware.js';
import { compressionMiddleware } from '../shared/middlewares/compression.middleware.js';
import authRoutes from './routes/auth.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import auditLogRoutes from './routes/auditLog.routes.js';
import mailRoutes from './routes/mail.routes.js';
import chatRoutes from './routes/chat.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(compressionMiddleware);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Auth Service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/mail', mailRoutes);
app.use('/api/v1/chat', chatRoutes);

app.use(errorHandler);

const PORT = process.env.AUTH_SERVICE_PORT || 5001;

const startServer = async () => {
  try {
    setServiceDatabase(env.DB.AUTH_NAME);
    await connectDB(env.DB.AUTH_NAME, async (activeSequelize) => {
      await import('./models/index.js');
      if (activeSequelize && activeSequelize.query) {
        await activeSequelize.query(`ALTER TYPE enum_users_role ADD VALUE IF NOT EXISTS 'SALES';`).catch(() => {});
      }
    });
    app.listen(PORT, () => {
      console.log(`🔐 Auth Microservice running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Auth Microservice:', err);
  }
};

if (env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
