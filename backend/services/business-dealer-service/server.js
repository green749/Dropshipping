import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '../shared/config/env.js';
import { connectDB, setServiceDatabase } from '../shared/config/database.js';

setServiceDatabase(env.DB.BUSINESS_NAME);

import { errorHandler } from '../shared/middlewares/error.middleware.js';
import { compressionMiddleware } from '../shared/middlewares/compression.middleware.js';
import businessRoutes from './routes/business.routes.js';
import dealerRoutes from './routes/dealer.routes.js';
import dealerPerformanceRoutes from './routes/dealerPerformance.routes.js';
import invitationRoutes from './routes/invitation.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(compressionMiddleware);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Business & Dealer Service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/businesses', businessRoutes);
app.use('/api/v1/dealers', dealerPerformanceRoutes);
app.use('/api/v1/dealers', invitationRoutes);
app.use('/api/v1/dealers', dealerRoutes);
app.use('/api/v1/marketing', invitationRoutes);
app.use('/api/v1/sales', invitationRoutes);

app.use(errorHandler);

const PORT = process.env.BUSINESS_SERVICE_PORT || 5002;

const startServer = async () => {
  try {
    setServiceDatabase(env.DB.BUSINESS_NAME);
    await connectDB(env.DB.BUSINESS_NAME, async (activeSequelize) => {
      await import('./models/index.js');
      if (activeSequelize && activeSequelize.query) {
        await activeSequelize.query(`ALTER TABLE dealer_invitations ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'DEALER';`).catch(() => {});
        await activeSequelize.query(`ALTER TYPE enum_dealer_invitations_role ADD VALUE IF NOT EXISTS 'SALES';`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE businesses ADD COLUMN IF NOT EXISTS profit_margin DECIMAL(5, 2) DEFAULT 20.00;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE businesses ALTER COLUMN logo TYPE TEXT;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE dealers ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12, 2) DEFAULT 10000.00;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE dealers ADD COLUMN IF NOT EXISTS average_lead_time_days INTEGER DEFAULT 3;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE dealers ADD COLUMN IF NOT EXISTS dispatch_sla_hours INTEGER DEFAULT 48;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE dealers ADD COLUMN IF NOT EXISTS fulfillment_sla_hours INTEGER DEFAULT 72;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE dealers ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 0.00;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE dealers ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(50) DEFAULT 'NET_30';`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE dealers ADD COLUMN IF NOT EXISTS payable_balance DECIMAL(12, 2) DEFAULT 0.00;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE dealers ADD COLUMN IF NOT EXISTS rating_notes TEXT;`).catch(() => {});
      }
    });
    app.listen(PORT, () => {
      console.log(`🏢 Business & Dealer Microservice running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Business & Dealer Microservice:', err);
  }
};

if (env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
