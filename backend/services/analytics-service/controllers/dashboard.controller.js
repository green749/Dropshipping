import { dashboardService } from '../services/dashboard.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const dashboardController = {
  async getOverview(req, res, next) {
    try {
      const businessId = req.query.business_id || req.headers['x-business-id'];
      const data = await dashboardService.getDropshipperOverview(businessId);
      return sendSuccess(res, 'Dropshipper dashboard overview retrieved', data);
    } catch (error) {
      next(error);
    }
  },

  async getDealerDashboard(req, res, next) {
    try {
      const businessId = req.query.business_id || req.headers['x-business-id'];
      const data = await dashboardService.getDealerDashboard(req.user.id, businessId);
      return sendSuccess(res, 'Dealer dashboard metrics retrieved', data);
    } catch (error) {
      next(error);
    }
  },

  async getMarketingDashboard(req, res, next) {
    try {
      const businessId = req.query.business_id || req.headers['x-business-id'];
      const data = await dashboardService.getMarketingDashboard(businessId);
      return sendSuccess(res, 'Marketing dashboard metrics retrieved', data);
    } catch (error) {
      next(error);
    }
  },
};
