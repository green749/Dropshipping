import { dealerService } from '../services/dealer.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const dealerController = {
  async getAll(req, res, next) {
    try {
      const { dealers, pagination } = await dealerService.getAllDealers(req.query);
      return sendSuccess(res, 'Dealers retrieved successfully', dealers, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const dealer = await dealerService.getDealerById(req.params.id);
      return sendSuccess(res, 'Dealer details retrieved successfully', dealer);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const dealer = await dealerService.createDealer(req.body, req.user);
      return sendSuccess(res, 'Dealer profile created successfully', dealer, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const dealer = await dealerService.updateDealer(req.params.id, req.body);
      return sendSuccess(res, 'Dealer updated successfully', dealer);
    } catch (error) {
      next(error);
    }
  },

  async assignToBusiness(req, res, next) {
    try {
      const { businessId, dealerId } = req.params;
      const assignment = await dealerService.assignDealerToBusiness(businessId, dealerId);
      return sendSuccess(res, 'Dealer assigned to business successfully', assignment, 201);
    } catch (error) {
      next(error);
    }
  },

  async unassignFromBusiness(req, res, next) {
    try {
      const { businessId, dealerId } = req.params;
      await dealerService.unassignDealerFromBusiness(businessId, dealerId);
      return sendSuccess(res, 'Dealer unassigned from business successfully');
    } catch (error) {
      next(error);
    }
  },

  async getBusinessDealers(req, res, next) {
    try {
      const { businessId } = req.params;
      const { dealers, pagination } = await dealerService.getBusinessDealers(businessId, req.query);
      return sendSuccess(res, 'Assigned dealers retrieved successfully', dealers, 200, pagination);
    } catch (error) {
      next(error);
    }
  },
};
