import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.PRODUCT_NAME);

export const RESEARCH_STATUS = {
  IDEA: 'IDEA',
  RESEARCHING: 'RESEARCHING',
  READY_TO_TEST: 'READY_TO_TEST',
  TESTING: 'TESTING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const ProductResearch = sequelize.define(
  'ProductResearch',
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
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'General',
    },
    dealer_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Manual Research',
    },
    estimated_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    expected_selling_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    estimated_shipping_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    estimated_marketing_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    estimated_units: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      validate: { min: 1 },
    },
    competitor_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    target_audience: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RESEARCH_STATUS)),
      defaultValue: RESEARCH_STATUS.IDEA,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    converted_product_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: 'product_research',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['business_id'] },
      { fields: ['status'] },
      { fields: ['category'] },
      { fields: ['dealer_id'] },
      { fields: ['created_at'] },
    ],
  }
);
