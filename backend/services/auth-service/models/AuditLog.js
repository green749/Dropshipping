import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.AUTH_NAME);

export const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    old_values: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    new_values: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [{ fields: ['user_id'] }, { fields: ['action'] }, { fields: ['entity_type'] }],
  }
);
