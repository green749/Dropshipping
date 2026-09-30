import { profitService } from '../services/profit.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const profitController = {
  async getProfitSummary(req, res, next) {
    try {
      const data = await profitService.getProfitSummary(req.query, req.user);
      return sendSuccess(res, 'Profit and loss analytics retrieved successfully', data.summary, 200, {
        dateRange: data.dateRange,
        business: data.business,
      });
    } catch (error) {
      next(error);
    }
  },

  async getProfitTimeline(req, res, next) {
    try {
      const data = await profitService.getProfitSummary(req.query, req.user);
      return sendSuccess(res, 'Profit trend timeline retrieved successfully', data.trend);
    } catch (error) {
      next(error);
    }
  },

  async getProductProfitability(req, res, next) {
    try {
      const { products, pagination } = await profitService.getProductProfitability(req.query, req.user);
      return sendSuccess(res, 'Product profitability breakdown retrieved successfully', products, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async getOrderProfitability(req, res, next) {
    try {
      const orderEconomics = await profitService.getOrderProfitability(req.params.id, req.user);
      return sendSuccess(res, 'Order profitability metrics retrieved successfully', orderEconomics);
    } catch (error) {
      next(error);
    }
  },

  async getOrderProfitabilityList(req, res, next) {
    try {
      const orders = await profitService.getOrderProfitabilityList(req.query, req.user);
      return sendSuccess(res, 'Order profitability list retrieved successfully', orders);
    } catch (error) {
      next(error);
    }
  },
};

