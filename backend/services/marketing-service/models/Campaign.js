import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.MARKETING_NAME);

export const CAMPAIGN_STATUS = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const Campaign = sequelize.define(
  'Campaign',
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    objective: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
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
        CAMPAIGN_STATUS.DRAFT,
        CAMPAIGN_STATUS.SCHEDULED,
        CAMPAIGN_STATUS.ACTIVE,
        CAMPAIGN_STATUS.PAUSED,
        CAMPAIGN_STATUS.COMPLETED,
        CAMPAIGN_STATUS.CANCELLED
      ),
      defaultValue: CAMPAIGN_STATUS.DRAFT,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: 'campaigns',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['business_id'] }, { fields: ['status'] }],
  }
);
