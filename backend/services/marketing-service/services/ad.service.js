import { Ad, Campaign, SocialAccount } from '../models/index.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';

export const adService = {
  async getAllAds(query) {
    const { page, limit, offset } = getPaginationParams(query);
    const where = {};

    if (query.campaign_id) where.campaign_id = query.campaign_id;
    if (query.social_account_id) where.social_account_id = query.social_account_id;
    if (query.status) where.status = query.status;

    const { count, rows } = await Ad.findAndCountAll({
      where,
      offset,
      limit,
      include: [
        { model: Campaign, as: 'campaign', attributes: ['id', 'name'] },
        { model: SocialAccount, as: 'socialAccount', attributes: ['id', 'platform', 'account_name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return { ads: rows, pagination: formatPagination(page, limit, count) };
  },

  async getAdById(id) {
    const ad = await Ad.findByPk(id, {
      include: [
        { model: Campaign, as: 'campaign', attributes: ['id', 'name'] },
        { model: SocialAccount, as: 'socialAccount', attributes: ['id', 'platform', 'account_name'] },
      ],
    });

    if (!ad) {
      const error = new Error('Advertisement not found');
      error.statusCode = 404;
      throw error;
    }

    return ad;
  },

  async createAd(data) {
    return Ad.create(data);
  },

  async updateAd(id, data) {
    const ad = await Ad.findByPk(id);
    if (!ad) {
      const error = new Error('Advertisement not found');
      error.statusCode = 404;
      throw error;
    }
    return ad.update(data);
  },

  async deleteAd(id) {
    const ad = await Ad.findByPk(id);
    if (!ad) {
      const error = new Error('Advertisement not found');
      error.statusCode = 404;
      throw error;
    }
    await ad.destroy();
    return true;
  },
};
