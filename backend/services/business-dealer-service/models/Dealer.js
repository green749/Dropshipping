import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.BUSINESS_NAME);

export const DEALER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
};

export const Dealer = sequelize.define(
  'Dealer',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    credit_limit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 10000.0,
      allowNull: true,
    },
    average_lead_time_days: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      allowNull: false,
    },
    dispatch_sla_hours: {
      type: DataTypes.INTEGER,
      defaultValue: 48,
      allowNull: false,
    },
    fulfillment_sla_hours: {
      type: DataTypes.INTEGER,
      defaultValue: 72,
      allowNull: false,
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
      allowNull: true,
    },
    payment_terms: {
      type: DataTypes.STRING,
      defaultValue: 'NET_30',
      allowNull: true,
    },
    payable_balance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
      allowNull: true,
    },
    rating_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(DEALER_STATUS.ACTIVE, DEALER_STATUS.INACTIVE, DEALER_STATUS.SUSPENDED),
      defaultValue: DEALER_STATUS.ACTIVE,
    },
  },
  {
    tableName: 'dealers',
    timestamps: true,
    underscored: true,
  }
);
