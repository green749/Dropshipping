import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.PRODUCT_NAME);

export const INVENTORY_TRANSACTION_TYPES = [
  'STOCK_IN',
  'STOCK_OUT',
  'ORDER_RESERVED',
  'ORDER_RELEASED',
  'ORDER_CANCELLED',
  'RETURN_RECEIVED',
  'ADJUSTMENT',
  'DAMAGED',
  'LOST',
];

export const InventoryTransaction = sequelize.define(
  'InventoryTransaction',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    dealer_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    transaction_type: {
      type: DataTypes.ENUM(...INVENTORY_TRANSACTION_TYPES),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    previous_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    new_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: 'inventory_transactions',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['business_id'] },
      { fields: ['product_id'] },
      { fields: ['dealer_id'] },
      { fields: ['order_id'] },
      { fields: ['transaction_type'] },
      { fields: ['created_at'] },
    ],
  }
);
