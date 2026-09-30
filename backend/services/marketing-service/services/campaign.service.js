import { Campaign, Post, Ad } from '../models/index.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';
import { CacheService } from '../../shared/services/cache.service.js';

export const campaignService = {
  async getAllCampaigns(query) {
    const { page, limit, offset } = getPaginationParams(query);
    const where = {};

    if (query.business_id) where.business_id = query.business_id;
    if (query.status) where.status = query.status;

    const cacheKey = CacheService.generateKey('campaigns:list', {
      ...where,
      page,
      limit,
    });

    const { data } = await CacheService.remember(cacheKey, 180, async () => {
      const { count, rows } = await Campaign.findAndCountAll({
        where,
        offset,
        limit,
        order: [['created_at', 'DESC']],
      });
      return { campaigns: rows, pagination: formatPagination(page, limit, count) };
    });

    return data;
  },

  async getCampaignById(id) {
    const cacheKey = `campaigns:item:${id}`;

    const { data: campaign } = await CacheService.remember(cacheKey, 300, async () => {
      return Campaign.findByPk(id, {
        include: [
          { model: Post, as: 'posts' },
          { model: Ad, as: 'ads' },
        ],
      });
    });

    if (!campaign) {
      const error = new Error('Campaign not found');
      error.statusCode = 404;
      throw error;
    }

    return campaign;
  },

  async createCampaign(data, user) {
    const created = await Campaign.create({
      ...data,
      created_by: user.id,
    });
    // Invalidate campaigns & analytics cache
    await CacheService.delByPattern('campaigns:*');
    await CacheService.delByPattern('analytics:*');
    return created;
  },

  async updateCampaign(id, data) {
    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      const error = new Error('Campaign not found');
      error.statusCode = 404;
      throw error;
    }
    const updated = await campaign.update(data);
    // Invalidate campaigns & analytics cache
    await CacheService.delByPattern('campaigns:*');
    await CacheService.delByPattern('analytics:*');
    return updated;
  },

  async deleteCampaign(id) {
    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      const error = new Error('Campaign not found');
      error.statusCode = 404;
      throw error;
    }
    await campaign.destroy();
    // Invalidate campaigns & analytics cache
    await CacheService.delByPattern('campaigns:*');
    await CacheService.delByPattern('analytics:*');
    return true;
  },
};
