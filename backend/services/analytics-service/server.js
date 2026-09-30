import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '../shared/config/env.js';
import { connectDB, setServiceDatabase } from '../shared/config/database.js';

// MUST set target microservice database BEFORE statically importing routes & models
setServiceDatabase(env.DB.ANALYTICS_NAME);

import { errorHandler } from '../shared/middlewares/error.middleware.js';
import { compressionMiddleware } from '../shared/middlewares/compression.middleware.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import profitRoutes from './routes/profit.routes.js';

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
  res.status(200).json({ status: 'UP', service: 'Analytics Service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/finances', profitRoutes);

app.use(errorHandler);

const PORT = process.env.ANALYTICS_SERVICE_PORT || 5006;

const startServer = async () => {
  try {
    setServiceDatabase(env.DB.ANALYTICS_NAME);
    await import('./models/index.js');
    await connectDB(env.DB.ANALYTICS_NAME, async (activeSequelize) => {
      if (activeSequelize && activeSequelize.query) {
        await activeSequelize.query(`
          CREATE TABLE IF NOT EXISTS expenses (
            id UUID PRIMARY KEY,
            business_id UUID,
            category VARCHAR(50) NOT NULL,
            description VARCHAR(255) NOT NULL,
            amount NUMERIC(12, 2) NOT NULL,
            date DATE NOT NULL DEFAULT CURRENT_DATE,
            reference VARCHAR(100),
            notes TEXT,
            created_by UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `).catch(() => {});
      }
    });
    app.listen(PORT, () => {
      console.log(`📊 Analytics Microservice running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Analytics Microservice:', err);
  }
};

if (env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
