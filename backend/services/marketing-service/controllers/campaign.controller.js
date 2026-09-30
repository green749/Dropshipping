import { campaignService } from '../services/campaign.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const campaignController = {
  async getAll(req, res, next) {
    try {
      const { campaigns, pagination } = await campaignService.getAllCampaigns(req.query);
      return sendSuccess(res, 'Campaigns retrieved successfully', campaigns, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const campaign = await campaignService.getCampaignById(req.params.id);
      return sendSuccess(res, 'Campaign details retrieved successfully', campaign);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const campaign = await campaignService.createCampaign(req.body, req.user);
      return sendSuccess(res, 'Campaign created successfully', campaign, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const campaign = await campaignService.updateCampaign(req.params.id, req.body);
      return sendSuccess(res, 'Campaign updated successfully', campaign);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await campaignService.deleteCampaign(req.params.id);
      return sendSuccess(res, 'Campaign deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
