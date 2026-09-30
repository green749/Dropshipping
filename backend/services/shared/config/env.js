import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root or workspace root safely
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  ALEXANDER_ADMIN_ID: process.env.ALEXANDER_ADMIN_ID || 'a0000000-0000-4000-8000-000000000001',
  PORT: parseInt(process.env.PORT || '5000', 10),
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:5001',
  BUSINESS_SERVICE_URL: process.env.BUSINESS_SERVICE_URL || 'http://127.0.0.1:5002',
  PRODUCT_SERVICE_URL: process.env.PRODUCT_SERVICE_URL || 'http://127.0.0.1:5003',
  ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL || 'http://127.0.0.1:5004',
  MARKETING_SERVICE_URL: process.env.MARKETING_SERVICE_URL || 'http://127.0.0.1:5005',
  ANALYTICS_SERVICE_URL: process.env.ANALYTICS_SERVICE_URL || 'http://127.0.0.1:5006',
  DB: {
    HOST: process.env.DB_HOST || '127.0.0.1',
    PORT: parseInt(process.env.DB_PORT || '5432', 10),
    NAME: process.env.DB_NAME || 'dropship_management',
    AUTH_NAME: process.env.AUTH_DB_NAME || 'dropship_auth',
    BUSINESS_NAME: process.env.BUSINESS_DB_NAME || 'dropship_business',
    PRODUCT_NAME: process.env.PRODUCT_DB_NAME || 'dropship_product',
    ORDER_NAME: process.env.ORDER_DB_NAME || 'dropship_order',
    MARKETING_NAME: process.env.MARKETING_DB_NAME || 'dropship_marketing',
    ANALYTICS_NAME: process.env.ANALYTICS_DB_NAME || 'dropship_analytics',
    USER: process.env.DB_USER || 'postgres',
    PASSWORD: process.env.DB_PASSWORD || 'Chithra@8123',
    LOGGING: process.env.DB_LOGGING === 'true' ? console.log : false,
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_dropship_2026_dev',
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dropship_jwt_access_secret_auth_2026_x89a4b2c',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dropship_jwt_refresh_secret_auth_2026_z17f9e3d',
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  },
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  MAIL: {
    HOST: process.env.SMTP_HOST || '',
    PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    USER: process.env.SMTP_USER || '',
    PASS: process.env.SMTP_PASS || '',
    SECURE: process.env.SMTP_SECURE === 'true',
    FROM: process.env.EMAIL_FROM || '"DropShipHub Enterprise" <notifications@dropshiphub.com>',
    SERVICE: process.env.EMAIL_SERVICE || '',
  },
  REDIS: {
    HOST: process.env.REDIS_HOST || '127.0.0.1',
    PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    PASSWORD: process.env.REDIS_PASSWORD || undefined,
    ENABLED: process.env.REDIS_ENABLED !== 'false',
    DEFAULT_TTL: parseInt(process.env.REDIS_DEFAULT_TTL || '300', 10),
  },
};

export const validateEnv = () => {
  if (process.env.NODE_ENV === 'production') {
    const requiredInProd = ['JWT_SECRET', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'DB_HOST'];
    const missing = requiredInProd.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      console.warn(`⚠️ [ENV WARNING] Missing explicit production env variables: ${missing.join(', ')}.`);
    }
  }
};
validateEnv();
