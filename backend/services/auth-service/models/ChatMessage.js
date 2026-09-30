import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.AUTH_NAME);

export const ChatMessage = sequelize.define(
  'ChatMessage',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.UUID,
      allowNull: true, // null for broadcast to all/role
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachment_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    message_type: {
      type: DataTypes.ENUM('DIRECT', 'BROADCAST', 'SYSTEM'),
      defaultValue: 'DIRECT',
    },
    target_role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'chat_messages',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['sender_id'] },
      { fields: ['receiver_id'] },
      { fields: ['created_at'] },
      { fields: ['is_read'] },
    ],
  }
);
