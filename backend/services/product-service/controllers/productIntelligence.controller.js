import { productIntelligenceService } from '../services/productIntelligence.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const productIntelligenceController = {
  /**
   * GET /api/v1/products/intelligence/summary
   */
  async getSummary(req, res, next) {
    try {
      const summary = await productIntelligenceService.getIntelligenceSummary(req.query, req.user);
      return sendSuccess(res, 'Product intelligence summary metrics retrieved successfully', summary);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/products/intelligence
   */
  async getList(req, res, next) {
    try {
      const result = await productIntelligenceService.getIntelligenceList(req.query, req.user);
      return sendSuccess(res, 'Product intelligence performance matrix retrieved successfully', result.items, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/products/:id/intelligence
   */
  async getDetail(req, res, next) {
    try {
      const detail = await productIntelligenceService.getProductDetailIntelligence(req.params.id, req.query, req.user);
      return sendSuccess(res, 'Product intelligence deep drilldown retrieved successfully', detail);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/products/:id/sales-trend
   */
  async getSalesTrend(req, res, next) {
    try {
      const trend = await productIntelligenceService.getProductSalesTrend(req.params.id, req.query, req.user);
      return sendSuccess(res, 'Product sales trend retrieved successfully', trend);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/products/:id/profitability
   */
  async getProfitability(req, res, next) {
    try {
      const profitability = await productIntelligenceService.getProductProfitability(req.params.id, req.query, req.user);
      return sendSuccess(res, 'Product profitability breakdown retrieved successfully', profitability);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/products/:id/dealer-performance
   */
  async getDealerPerformance(req, res, next) {
    try {
      const dealer = await productIntelligenceService.getProductDealerPerformance(req.params.id, req.query, req.user);
      return sendSuccess(res, 'Product supplier metrics and comparison retrieved successfully', dealer);
    } catch (err) {
      next(err);
    }
  },
};
