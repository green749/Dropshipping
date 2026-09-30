import { Dealer, Business, BusinessDealer } from '../models/index.js';

export const dealerRepository = {
  async findAll(where = {}, offset = 0, limit = 20) {
    const { count, rows } = await Dealer.findAndCountAll({
      where,
      include: [
        {
          model: Business,
          as: 'businesses',
          attributes: ['id', 'name', 'email', 'status'],
          through: { attributes: ['status', 'assigned_at'] },
        },
      ],
      offset,
      limit,
      order: [['created_at', 'DESC']],
    });
    return { total: count, dealers: rows };
  },

  async findById(id) {
    return Dealer.findByPk(id, {
      include: [
        {
          model: Business,
          as: 'businesses',
          attributes: ['id', 'name', 'email', 'status'],
          through: { attributes: ['status', 'assigned_at'] },
        },
      ],
    });
  },

  async findByUserId(userId) {
    return Dealer.findOne({ where: { user_id: userId } });
  },

  async create(data) {
    return Dealer.create(data);
  },

  async update(id, data) {
    const dealer = await Dealer.findByPk(id);
    if (!dealer) return null;
    await dealer.update(data);
    return this.findById(id);
  },

  async assignToBusiness(businessId, dealerId, status = 'ACTIVE') {
    const [assignment, created] = await BusinessDealer.findOrCreate({
      where: { business_id: businessId, dealer_id: dealerId },
      defaults: { status, assigned_at: new Date() },
    });

    if (!created && assignment.status !== status) {
      await assignment.update({ status });
    }

    return assignment;
  },

  async unassignFromBusiness(businessId, dealerId) {
    const count = await BusinessDealer.destroy({
      where: { business_id: businessId, dealer_id: dealerId },
    });
    return count > 0;
  },

  async getAssignedDealers(businessId) {
    return BusinessDealer.findAll({
      where: { business_id: businessId },
      include: [
        {
          model: Dealer,
          as: 'dealer',
        },
      ],
    });
  },
};
