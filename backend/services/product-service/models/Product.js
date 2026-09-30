import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.PRODUCT_NAME);

export const PRODUCT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
};

export const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    dealer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    selling_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    reserved_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    low_stock_threshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    reorder_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
    },
    safety_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    target_stock_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 14,
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM(PRODUCT_STATUS.ACTIVE, PRODUCT_STATUS.INACTIVE, PRODUCT_STATUS.OUT_OF_STOCK),
      defaultValue: PRODUCT_STATUS.ACTIVE,
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['dealer_id'] },
      { fields: ['business_id'] },
      { fields: ['sku'] },
      { fields: ['category'] },
      { fields: ['status'] },
    ],
  }
);
