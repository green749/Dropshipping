import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.BUSINESS_NAME);

export const BUSINESS_DEALER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const BusinessDealer = sequelize.define(
  'BusinessDealer',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    dealer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'dealers',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM(BUSINESS_DEALER_STATUS.ACTIVE, BUSINESS_DEALER_STATUS.INACTIVE),
      defaultValue: BUSINESS_DEALER_STATUS.ACTIVE,
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'business_dealers',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['business_id', 'dealer_id'],
      },
    ],
  }
);
