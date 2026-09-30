import { customerService } from '../services/customer.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const customerController = {
  async getAll(req, res, next) {
    try {
      const { customers, pagination } = await customerService.getAllCustomers(req.query, req.user);
      return sendSuccess(res, 'Customers retrieved successfully', customers, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const customer = await customerService.getCustomerById(req.params.id, req.user);
      return sendSuccess(res, 'Customer details retrieved successfully', customer);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const customer = await customerService.createCustomer(req.body, req.user);
      return sendSuccess(res, 'Customer created successfully', customer, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const customer = await customerService.updateCustomer(req.params.id, req.body, req.user);
      return sendSuccess(res, 'Customer updated successfully', customer);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await customerService.deleteCustomer(req.params.id, req.user);
      return sendSuccess(res, 'Customer deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
