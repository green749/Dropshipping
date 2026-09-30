import { getSequelize } from '../config/database.js';
import { env } from '../config/env.js';
import { DataTypes, Op } from 'sequelize';

let DealerModel = null;

const getDealerModel = () => {
  if (!DealerModel) {
    const db = getSequelize(env.DB.BUSINESS_NAME);
    DealerModel = db.define(
      'SharedDealer',
      {
        id: { type: DataTypes.UUID, primaryKey: true },
        user_id: { type: DataTypes.UUID, allowNull: false },
        company_name: { type: DataTypes.STRING },
        contact_name: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING },
        phone: { type: DataTypes.STRING },
        status: { type: DataTypes.STRING, defaultValue: 'ACTIVE' },
      },
      { tableName: 'dealers', timestamps: true, underscored: true }
    );
  }
  return DealerModel;
};

export const resolveDealer = async (user) => {
  if (!user || user.role !== 'DEALER') return null;

  try {
    const Dealer = getDealerModel();
    const whereConditions = [];

    if (user.dealer_id) {
      whereConditions.push({ id: user.dealer_id });
    }
    if (user.id) {
      whereConditions.push({ user_id: user.id });
      whereConditions.push({ id: user.id });
    }
    if (user.email) {
      whereConditions.push({ email: user.email.toLowerCase().trim() });
    }

    if (whereConditions.length === 0) return null;

    const dealer = await Dealer.findOne({
      where: { [Op.or]: whereConditions },
    });

    return dealer ? (dealer.toJSON ? dealer.toJSON() : dealer) : null;
  } catch (err) {
    console.warn('[dealerResolver] Dealer profile lookup warning:', err.message);
    return null;
  }
};

export const resolveDealerIds = async (user) => {
  if (!user || user.role !== 'DEALER') return [];

  const ids = new Set();
  if (user.id) ids.add(user.id);
  if (user.dealer_id) ids.add(user.dealer_id);

  const dealer = await resolveDealer(user);
  if (dealer) {
    if (dealer.id) ids.add(dealer.id);
    if (dealer.user_id) ids.add(dealer.user_id);
  }

  return Array.from(ids);
};
