import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.MARKETING_NAME);

export const CREATIVE_GENERATION_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

export const CreativeGeneration = sequelize.define(
  'CreativeGeneration',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    campaign_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false, // 'image' or 'video'
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reference_image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    previous_generation_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    generated_media_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        CREATIVE_GENERATION_STATUS.PENDING,
        CREATIVE_GENERATION_STATUS.PROCESSING,
        CREATIVE_GENERATION_STATUS.COMPLETED,
        CREATIVE_GENERATION_STATUS.FAILED
      ),
      defaultValue: CREATIVE_GENERATION_STATUS.PENDING,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    provider_generation_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'creative_generations',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['campaign_id'] },
      { fields: ['product_id'] },
      { fields: ['conversation_id'] },
      { fields: ['status'] },
    ],
  }
);
