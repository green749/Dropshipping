import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.BUSINESS_NAME);

export const BUSINESS_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
};

export const Business = sequelize.define(
  'Business',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo: {
      type: DataTypes.TEXT,
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
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profit_margin: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 20.00,
    },
    status: {
      type: DataTypes.ENUM(BUSINESS_STATUS.ACTIVE, BUSINESS_STATUS.INACTIVE, BUSINESS_STATUS.SUSPENDED),
      defaultValue: BUSINESS_STATUS.ACTIVE,
    },
  },
  {
    tableName: 'businesses',
    timestamps: true,
    underscored: true,
  }
);
