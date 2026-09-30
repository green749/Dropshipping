import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.MARKETING_NAME);

export const POST_STATUS = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

export const Post = sequelize.define(
  'Post',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    campaign_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    social_account_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    media_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        POST_STATUS.DRAFT,
        POST_STATUS.SCHEDULED,
        POST_STATUS.PUBLISHED,
        POST_STATUS.FAILED,
        POST_STATUS.CANCELLED
      ),
      defaultValue: POST_STATUS.DRAFT,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: 'posts',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['campaign_id'] },
      { fields: ['social_account_id'] },
      { fields: ['status'] },
    ],
  }
);
