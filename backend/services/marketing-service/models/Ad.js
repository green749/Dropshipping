import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.MARKETING_NAME);

export const AD_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
};

export const Ad = sequelize.define(
  'Ad',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    campaign_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    social_account_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creative_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    target_audience: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        AD_STATUS.DRAFT,
        AD_STATUS.ACTIVE,
        AD_STATUS.PAUSED,
        AD_STATUS.COMPLETED,
        AD_STATUS.REJECTED
      ),
      defaultValue: AD_STATUS.DRAFT,
    },
    external_ad_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'ads',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['campaign_id'] },
      { fields: ['social_account_id'] },
      { fields: ['status'] },
    ],
  }
);
