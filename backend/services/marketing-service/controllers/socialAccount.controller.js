import { socialAccountService } from '../services/socialAccount.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const socialAccountController = {
  async getAll(req, res, next) {
    try {
      const { socialAccounts, pagination } = await socialAccountService.getAllSocialAccounts(req.query);
      return sendSuccess(res, 'Social accounts retrieved successfully', socialAccounts, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const account = await socialAccountService.createSocialAccount(req.body);
      return sendSuccess(res, 'Social account connected successfully', account, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const account = await socialAccountService.updateSocialAccount(req.params.id, req.body);
      return sendSuccess(res, 'Social account updated successfully', account);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await socialAccountService.deleteSocialAccount(req.params.id);
      return sendSuccess(res, 'Social account disconnected successfully');
    } catch (error) {
      next(error);
    }
  },
};
