import { SocialAccount } from '../models/index.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';

export const socialAccountService = {
  async getAllSocialAccounts(query) {
    const { page, limit, offset } = getPaginationParams(query);
    const where = {};

    if (query.business_id) where.business_id = query.business_id;
    if (query.platform) where.platform = query.platform;
    if (query.status) where.status = query.status;

    const { count, rows } = await SocialAccount.findAndCountAll({
      where,
      offset,
      limit,
      order: [['created_at', 'DESC']],
    });

    return { socialAccounts: rows, pagination: formatPagination(page, limit, count) };
  },

  async createSocialAccount(data) {
    const account = await SocialAccount.create(data);
    const plainAccount = account.toJSON();
    delete plainAccount.access_token;
    delete plainAccount.refresh_token;
    return plainAccount;
  },

  async updateSocialAccount(id, data) {
    const account = await SocialAccount.findByPk(id);
    if (!account) {
      const error = new Error('Social Account not found');
      error.statusCode = 404;
      throw error;
    }
    return account.update(data);
  },

  async deleteSocialAccount(id) {
    const account = await SocialAccount.findByPk(id);
    if (!account) {
      const error = new Error('Social Account not found');
      error.statusCode = 404;
      throw error;
    }
    await account.destroy();
    return true;
  },
};
