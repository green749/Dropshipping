import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.MARKETING_NAME);

export const SOCIAL_ACCOUNT_STATUS = {
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  EXPIRED: 'EXPIRED',
};

export const SocialAccount = sequelize.define(
  'SocialAccount',
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
    platform: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    external_account_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        SOCIAL_ACCOUNT_STATUS.CONNECTED,
        SOCIAL_ACCOUNT_STATUS.DISCONNECTED,
        SOCIAL_ACCOUNT_STATUS.EXPIRED
      ),
      defaultValue: SOCIAL_ACCOUNT_STATUS.CONNECTED,
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'social_accounts',
    timestamps: true,
    underscored: true,
    defaultScope: {
      attributes: { exclude: ['access_token', 'refresh_token'] },
    },
    scopes: {
      withTokens: {
        attributes: { include: ['access_token', 'refresh_token'] },
      },
    },
    indexes: [{ fields: ['business_id'] }, { fields: ['platform'] }],
  }
);
