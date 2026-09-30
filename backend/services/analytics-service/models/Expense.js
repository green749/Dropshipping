import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.ANALYTICS_NAME);

export const EXPENSE_CATEGORIES = [
  'Advertising',
  'Shipping',
  'Packaging',
  'Payment Gateway',
  'Supplier/Dealer',
  'Software',
  'Salaries',
  'Operations',
  'Refunds',
  'Returns',
  'Other',
];

export const Expense = sequelize.define(
  'Expense',
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
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [EXPENSE_CATEGORIES],
      },
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    reference: {
      type: DataTypes.STRING(100),
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
    tableName: 'expenses',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['business_id'] },
      { fields: ['date'] },
      { fields: ['category'] },
    ],
  }
);
