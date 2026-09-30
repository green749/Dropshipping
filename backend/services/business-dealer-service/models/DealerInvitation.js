import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

const sequelize = getSequelize(env.DB.BUSINESS_NAME);

export const INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
};

export const DealerInvitation = sequelize.define(
  'DealerInvitation',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('DEALER', 'MARKETING', 'SALES'),
      defaultValue: 'DEALER',
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(
        INVITATION_STATUS.PENDING,
        INVITATION_STATUS.ACCEPTED,
        INVITATION_STATUS.EXPIRED,
        INVITATION_STATUS.CANCELLED
      ),
      defaultValue: INVITATION_STATUS.PENDING,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    invited_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: 'dealer_invitations',
    timestamps: true,
    underscored: true,
  }
);
