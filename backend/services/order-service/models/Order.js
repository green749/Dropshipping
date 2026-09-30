import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.ORDER_NAME);

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED',
  REFUNDED: 'REFUNDED',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

export const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(
        ORDER_STATUS.PENDING,
        ORDER_STATUS.CONFIRMED,
        ORDER_STATUS.PROCESSING,
        ORDER_STATUS.SHIPPED,
        ORDER_STATUS.DELIVERED,
        ORDER_STATUS.CANCELLED,
        ORDER_STATUS.RETURNED,
        ORDER_STATUS.REFUNDED
      ),
      defaultValue: ORDER_STATUS.PENDING,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shipping_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM(
        PAYMENT_STATUS.PENDING,
        PAYMENT_STATUS.PAID,
        PAYMENT_STATUS.FAILED,
        PAYMENT_STATUS.REFUNDED
      ),
      defaultValue: PAYMENT_STATUS.PENDING,
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    accepted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dispatched_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancellation_source: {
      type: DataTypes.STRING(50),
      defaultValue: 'CUSTOMER', // CUSTOMER, DEALER, ADMIN, SYSTEM
      allowNull: true,
    },
    dealer_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sla_breached: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['business_id'] },
      { fields: ['customer_id'] },
      { fields: ['order_number'] },
      { fields: ['status'] },
    ],
  }
);
