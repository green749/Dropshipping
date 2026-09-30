import { adService } from '../services/ad.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const adController = {
  async getAll(req, res, next) {
    try {
      const { ads, pagination } = await adService.getAllAds(req.query);
      return sendSuccess(res, 'Advertisements retrieved successfully', ads, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const ad = await adService.getAdById(req.params.id);
      return sendSuccess(res, 'Advertisement details retrieved successfully', ad);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const ad = await adService.createAd(req.body);
      return sendSuccess(res, 'Advertisement created successfully', ad, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const ad = await adService.updateAd(req.params.id, req.body);
      return sendSuccess(res, 'Advertisement updated successfully', ad);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await adService.deleteAd(req.params.id);
      return sendSuccess(res, 'Advertisement deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
