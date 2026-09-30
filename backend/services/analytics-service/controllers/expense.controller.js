import { expenseService } from '../services/expense.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const expenseController = {
  async getAll(req, res, next) {
    try {
      const { expenses, pagination } = await expenseService.getAllExpenses(req.query, req.user);
      return sendSuccess(res, 'Expenses retrieved successfully', expenses, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const expense = await expenseService.getExpenseById(req.params.id, req.user);
      return sendSuccess(res, 'Expense retrieved successfully', expense);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const expense = await expenseService.createExpense(req.body, req.user);
      return sendSuccess(res, 'Expense recorded successfully', expense, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const expense = await expenseService.updateExpense(req.params.id, req.body, req.user);
      return sendSuccess(res, 'Expense updated successfully', expense);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await expenseService.deleteExpense(req.params.id, req.user);
      return sendSuccess(res, 'Expense deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async getSummary(req, res, next) {
    try {
      const summary = await expenseService.getExpenseSummary(req.query, req.user);
      return sendSuccess(res, 'Expense summary retrieved successfully', summary);
    } catch (error) {
      next(error);
    }
  },
};
