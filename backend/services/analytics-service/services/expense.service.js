import { expenseRepository } from '../repositories/expense.repository.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';
import { CacheService } from '../../shared/services/cache.service.js';
import { Op } from 'sequelize';

export const expenseService = {
  async getAllExpenses(query, user) {
    const { page, limit, offset } = getPaginationParams(query);
    const where = {};

    if (query.business_id && query.business_id !== 'all') {
      where.business_id = query.business_id;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.startDate && query.endDate) {
      where.date = {
        [Op.between]: [query.startDate, query.endDate],
      };
    } else if (query.startDate) {
      where.date = {
        [Op.gte]: query.startDate,
      };
    } else if (query.endDate) {
      where.date = {
        [Op.lte]: query.endDate,
      };
    }

    if (query.search) {
      const term = `%${query.search.trim().toLowerCase()}%`;
      where[Op.or] = [
        { description: { [Op.iLike]: term } },
        { reference: { [Op.iLike]: term } },
        { category: { [Op.iLike]: term } },
      ];
    }

    const cacheKey = CacheService.generateKey('expenses:list', {
      ...query,
      page,
      limit,
      userRole: user?.role,
      userId: user?.id,
    });

    const { data } = await CacheService.remember(cacheKey, 60, async () => {
      const { total, expenses } = await expenseRepository.findAll(where, offset, limit);
      return { expenses, pagination: formatPagination(page, limit, total) };
    });

    return data;
  },

  async getExpenseById(id, user) {
    const cacheKey = `expenses:item:${id}`;

    const { data: expense } = await CacheService.remember(cacheKey, 120, async () => {
      return expenseRepository.findById(id);
    });

    if (!expense) {
      const error = new Error('Expense record not found');
      error.statusCode = 404;
      throw error;
    }

    return expense;
  },

  async createExpense(data, user) {
    const expenseData = {
      ...data,
      created_by: user?.id || null,
      date: data.date || new Date().toISOString().split('T')[0],
    };

    const created = await expenseRepository.create(expenseData);
    await CacheService.delByPattern('expenses:*');
    await CacheService.delByPattern('finances:*');
    await CacheService.delByPattern('analytics:*');
    return created;
  },

  async updateExpense(id, data, user) {
    const existing = await expenseRepository.findById(id);
    if (!existing) {
      const error = new Error('Expense record not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await expenseRepository.update(id, data);
    await CacheService.delByPattern('expenses:*');
    await CacheService.delByPattern('finances:*');
    await CacheService.delByPattern('analytics:*');
    return updated;
  },

  async deleteExpense(id, user) {
    const existing = await expenseRepository.findById(id);
    if (!existing) {
      const error = new Error('Expense record not found');
      error.statusCode = 404;
      throw error;
    }

    const success = await expenseRepository.delete(id);
    await CacheService.delByPattern('expenses:*');
    await CacheService.delByPattern('finances:*');
    await CacheService.delByPattern('analytics:*');
    return success;
  },

  async getExpenseSummary(query, user) {
    const where = {};

    if (query.business_id && query.business_id !== 'all') {
      where.business_id = query.business_id;
    }

    if (query.startDate && query.endDate) {
      where.date = {
        [Op.between]: [query.startDate, query.endDate],
      };
    }

    const cacheKey = CacheService.generateKey('expenses:summary', {
      ...query,
      userRole: user?.role,
    });

    const { data } = await CacheService.remember(cacheKey, 60, async () => {
      const categories = await expenseRepository.getSummaryByCategory(where);
      const totalAmount = await expenseRepository.getTotalAmount(where);

      return {
        totalAmount,
        breakdown: categories.map((cat) => ({
          category: cat.category,
          amount: parseFloat(Number(cat.total_amount || 0).toFixed(2)),
          count: parseInt(cat.count, 10),
          percentage: totalAmount > 0 ? parseFloat(((Number(cat.total_amount || 0) / totalAmount) * 100).toFixed(1)) : 0,
        })),
      };
    });

    return data;
  },
};
