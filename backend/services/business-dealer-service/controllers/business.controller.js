import { businessService } from '../services/business.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const businessController = {
  async getAll(req, res, next) {
    try {
      const { businesses, pagination } = await businessService.getAllBusinesses(req.query, req.user);
      return sendSuccess(res, 'Businesses retrieved successfully', businesses, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const business = await businessService.getBusinessById(req.params.id, req.user);
      return sendSuccess(res, 'Business details retrieved successfully', business);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const business = await businessService.createBusiness(req.body);
      return sendSuccess(res, 'Business created successfully', business, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const business = await businessService.updateBusiness(req.params.id, req.body);
      return sendSuccess(res, 'Business updated successfully', business);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await businessService.deleteBusiness(req.params.id);
      return sendSuccess(res, 'Business deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
