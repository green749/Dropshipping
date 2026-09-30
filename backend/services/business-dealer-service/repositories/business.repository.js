import { Business, Dealer } from '../models/index.js';

export const businessRepository = {
  async findAll(where = {}, offset = 0, limit = 20) {
    const { count, rows } = await Business.findAndCountAll({
      where,
      offset,
      limit,
      order: [['created_at', 'DESC']],
    });
    return { total: count, businesses: rows };
  },

  async findById(id) {
    return Business.findByPk(id, {
      include: [
        {
          model: Dealer,
          as: 'dealers',
          attributes: ['id', 'company_name', 'contact_name', 'email', 'phone', 'status'],
          through: { attributes: ['status', 'assigned_at'] },
        },
      ],
    });
  },

  async create(data) {
    return Business.create(data);
  },

  async update(id, data) {
    const business = await Business.findByPk(id);
    if (!business) return null;
    return business.update(data);
  },

  async delete(id) {
    const business = await Business.findByPk(id);
    if (!business) return false;
    await business.destroy();
    return true;
  },
};
