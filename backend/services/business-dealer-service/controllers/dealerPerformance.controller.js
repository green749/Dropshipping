import { dealerPerformanceService } from '../services/dealerPerformance.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const dealerPerformanceController = {
  async getSummary(req, res, next) {
    try {
      const summary = await dealerPerformanceService.getPerformanceSummary(req.query, req.user);
      return sendSuccess(res, 'Dealer performance summary retrieved successfully', summary);
    } catch (error) {
      next(error);
    }
  },

  async getList(req, res, next) {
    try {
      const { dealers, pagination } = await dealerPerformanceService.getPerformanceList(req.query, req.user);
      return sendSuccess(res, 'Dealer performance list retrieved successfully', dealers, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async getDetail(req, res, next) {
    try {
      const detail = await dealerPerformanceService.getDealerDetail(req.params.id, req.query, req.user);
      return sendSuccess(res, 'Dealer performance details retrieved successfully', detail);
    } catch (error) {
      next(error);
    }
  },

  async getComparison(req, res, next) {
    try {
      const dealerIds = typeof req.query.dealerIds === 'string' ? req.query.dealerIds.split(',') : req.query.dealerIds || [];
      const comparison = await dealerPerformanceService.getComparison(dealerIds, req.query, req.user);
      return sendSuccess(res, 'Dealer comparative analytics retrieved successfully', comparison);
    } catch (error) {
      next(error);
    }
  },

  async updateSla(req, res, next) {
    try {
      const updated = await dealerPerformanceService.updateDealerSla(req.params.id, req.body, req.user);
      return sendSuccess(res, 'Dealer SLA & operational parameters updated successfully', updated);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const updated = await dealerPerformanceService.updateDealerStatus(req.params.id, req.body.status, req.user);
      return sendSuccess(res, `Dealer status updated to ${req.body.status} successfully`, updated);
    } catch (error) {
      next(error);
    }
  },
};
