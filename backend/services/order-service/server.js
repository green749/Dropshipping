import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '../shared/config/env.js';
import { connectDB, setServiceDatabase } from '../shared/config/database.js';

setServiceDatabase(env.DB.ORDER_NAME);

import { errorHandler } from '../shared/middlewares/error.middleware.js';
import { compressionMiddleware } from '../shared/middlewares/compression.middleware.js';
import customerRoutes from './routes/customer.routes.js';
import orderRoutes from './routes/order.routes.js';
import returnRoutes from './routes/return.routes.js';

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
  res.status(200).json({ status: 'UP', service: 'Order & Customer Service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/returns', returnRoutes);

app.use(errorHandler);

const PORT = process.env.ORDER_SERVICE_PORT || 5004;

const startServer = async () => {
  try {
    setServiceDatabase(env.DB.ORDER_NAME);
    await connectDB(env.DB.ORDER_NAME, async (activeSequelize) => {
      await import('./models/index.js');
      if (activeSequelize && activeSequelize.query) {
        await activeSequelize.query(`ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_business_id_fkey;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_business_id_fkey;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_dealer_id_fkey;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;`).catch(() => {});
      }
    });
    app.listen(PORT, () => {
      console.log(`🛒 Order & Customer Microservice running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Order & Customer Microservice:', err);
  }
};

if (env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
