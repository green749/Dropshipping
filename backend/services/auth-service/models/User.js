import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.AUTH_NAME);

export const USER_ROLES = {
  DROPSHIPPER: 'DROPSHIPPER',
  DEALER: 'DEALER',
  MARKETING: 'MARKETING',
  SALES: 'SALES',
};

export const User = sequelize.define(
  'User',
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(USER_ROLES.DROPSHIPPER, USER_ROLES.DEALER, USER_ROLES.MARKETING, USER_ROLES.SALES),
      allowNull: false,
      defaultValue: USER_ROLES.DROPSHIPPER,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    defaultScope: {
      attributes: { exclude: ['password_hash'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password_hash'] },
      },
    },
  }
);
