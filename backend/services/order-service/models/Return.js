import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

export const RETURN_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
};

const sequelize = getSequelize(env.DB.ORDER_NAME);

export const Return = sequelize.define(
  'Return',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    order_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dealer_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    dealer_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RETURN_STATUS)),
      defaultValue: RETURN_STATUS.REQUESTED,
    },
    requested_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'returns',
    timestamps: true,
    underscored: true,
  }
);
