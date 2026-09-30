import { Expense } from '../models/index.js';
import { fn, col } from 'sequelize';

export const expenseRepository = {
  async findAll(where = {}, offset = 0, limit = 20, order = [['date', 'DESC'], ['created_at', 'DESC']]) {
    const { count, rows } = await Expense.findAndCountAll({
      where,
      offset,
      limit,
      order,
    });

    return { total: count, expenses: rows };
  },

  async findById(id) {
    return Expense.findByPk(id);
  },

  async create(data) {
    return Expense.create(data);
  },

  async update(id, data) {
    const expense = await Expense.findByPk(id);
    if (!expense) return null;
    await expense.update(data);
    return this.findById(id);
  },

  async delete(id) {
    const count = await Expense.destroy({ where: { id } });
    return count > 0;
  },

  async getSummaryByCategory(where = {}) {
    return Expense.findAll({
      where,
      attributes: [
        'category',
        [fn('SUM', col('amount')), 'total_amount'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['category'],
      raw: true,
    });
  },

  async getTotalAmount(where = {}) {
    const result = await Expense.sum('amount', { where });
    return parseFloat((result || 0).toFixed(2));
  },
};
