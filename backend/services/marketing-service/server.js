import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '../shared/config/env.js';
import { connectDB, setServiceDatabase } from '../shared/config/database.js';

setServiceDatabase(env.DB.MARKETING_NAME);

import { errorHandler } from '../shared/middlewares/error.middleware.js';
import { compressionMiddleware } from '../shared/middlewares/compression.middleware.js';
import campaignRoutes from './routes/campaign.routes.js';
import socialAccountRoutes from './routes/socialAccount.routes.js';
import postRoutes from './routes/post.routes.js';
import adRoutes from './routes/ad.routes.js';
import aiGeneratorRoutes from './routes/aiGenerator.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(compressionMiddleware);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Marketing Service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/social-accounts', socialAccountRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/ads', adRoutes);
app.use('/api/v1/marketing/ai', aiGeneratorRoutes);
app.use('/api/v1/ai', aiGeneratorRoutes);

app.use(errorHandler);

const PORT = process.env.MARKETING_SERVICE_PORT || 5005;

const startServer = async () => {
  try {
    setServiceDatabase(env.DB.MARKETING_NAME);
    await connectDB(env.DB.MARKETING_NAME, async (activeSequelize) => {
      await import('./models/index.js');
      if (activeSequelize && activeSequelize.query) {
        await activeSequelize.query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS created_by UUID;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS content TEXT;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE posts ALTER COLUMN media_url TYPE TEXT;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS product_id UUID;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS created_by UUID;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_campaign_id_fkey;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_social_account_id_fkey;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE social_accounts DROP CONSTRAINT IF EXISTS social_accounts_business_id_fkey;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE ads ADD COLUMN IF NOT EXISTS campaign_id UUID;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE ads ADD COLUMN IF NOT EXISTS social_account_id UUID;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE ads ADD COLUMN IF NOT EXISTS product_id UUID;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE ads ADD COLUMN IF NOT EXISTS name VARCHAR(255);`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE ads ADD COLUMN IF NOT EXISTS creative_url VARCHAR(500);`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE ads ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2);`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE ads ADD COLUMN IF NOT EXISTS target_audience JSON;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE ads ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE ads ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE ads ADD COLUMN IF NOT EXISTS external_ad_id VARCHAR(255);`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE ads ADD COLUMN IF NOT EXISTS created_by UUID;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE ads DROP CONSTRAINT IF EXISTS ads_campaign_id_fkey;`).catch(() => {});
      }
    });
    app.listen(PORT, () => {
      console.log(`📢 Marketing Microservice running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Marketing Microservice:', err);
  }
};

if (env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
