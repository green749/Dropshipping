import { Customer } from '../models/index.js';

export const customerRepository = {
  async findAll(where = {}, offset = 0, limit = 20) {
    const { count, rows } = await Customer.findAndCountAll({
      where,
      offset,
      limit,
      order: [['created_at', 'DESC']],
    });
    return { total: count, customers: rows };
  },

  async findById(id) {
    return Customer.findByPk(id);
  },

  async create(data) {
    return Customer.create(data);
  },

  async update(id, data) {
    const customer = await Customer.findByPk(id);
    if (!customer) return null;
    return customer.update(data);
  },

  async delete(id) {
    const customer = await Customer.findByPk(id);
    if (!customer) return false;
    await customer.destroy();
    return true;
  },
};
