import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '../shared/config/env.js';
import { connectDB, setServiceDatabase } from '../shared/config/database.js';

setServiceDatabase(env.DB.PRODUCT_NAME);

import { errorHandler } from '../shared/middlewares/error.middleware.js';
import { compressionMiddleware } from '../shared/middlewares/compression.middleware.js';
import productRoutes from './routes/product.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import productIntelligenceRoutes from './routes/productIntelligence.routes.js';
import productResearchRoutes from './routes/productResearch.routes.js';

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
  res.status(200).json({ status: 'UP', service: 'Product Service', timestamp: new Date().toISOString() });
});

// Mounted Routes
app.use('/api/v1/products/intelligence', productIntelligenceRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/product-research', productResearchRoutes);

app.use(errorHandler);

const PORT = process.env.PRODUCT_SERVICE_PORT || 5003;

const startServer = async () => {
  try {
    setServiceDatabase(env.DB.PRODUCT_NAME);
    await connectDB(env.DB.PRODUCT_NAME, async (activeSequelize) => {
      const { Product, InventoryTransaction, ProductResearch } = await import('./models/index.js');
      if (activeSequelize && activeSequelize.query) {
        await activeSequelize.query(`ALTER TABLE products DROP CONSTRAINT IF EXISTS products_dealer_id_fkey;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS business_id UUID;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER NOT NULL DEFAULT 0;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 10;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_level INTEGER NOT NULL DEFAULT 15;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS safety_stock INTEGER NOT NULL DEFAULT 5;`).catch(() => {});
        await activeSequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS target_stock_days INTEGER NOT NULL DEFAULT 14;`).catch(() => {});
        if (InventoryTransaction && InventoryTransaction.sync) {
          await InventoryTransaction.sync({ alter: true }).catch(() => {});
        }
        if (ProductResearch && ProductResearch.sync) {
          await ProductResearch.sync({ alter: true }).catch(() => {});
        }
      }
    });
    app.listen(PORT, () => {
      console.log(`📦 Product Microservice running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Product Microservice:', err);
  }
};

if (env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
