import { dealerRepository } from '../repositories/dealer.repository.js';
import { businessRepository } from '../repositories/business.repository.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';
import { CacheService } from '../../shared/services/cache.service.js';

export const dealerService = {
  async getAllDealers(query) {
    if (query.business_id && query.business_id !== 'all' && query.business_id !== 'ALL') {
      return this.getBusinessDealers(query.business_id, query);
    }
    const { page, limit, offset } = getPaginationParams(query);
    const where = {};

    if (query.status) {
      where.status = query.status;
    }

    const cacheKey = CacheService.generateKey('dealers:list', {
      ...where,
      page,
      limit,
    });

    const { data } = await CacheService.remember(cacheKey, 180, async () => {
      const { total, dealers } = await dealerRepository.findAll(where, offset, limit);
      const pagination = formatPagination(page, limit, total);
      return { dealers, pagination };
    });

    return data;
  },

  async getDealerById(id) {
    const cacheKey = `dealers:item:${id}`;

    const { data: dealer } = await CacheService.remember(cacheKey, 300, async () => {
      return dealerRepository.findById(id);
    });

    if (!dealer) {
      const error = new Error('Dealer not found');
      error.statusCode = 404;
      throw error;
    }
    return dealer;
  },

  async createDealer(data, currentUser) {
    const userId = data.user_id || currentUser.id;
    const existingDealer = await dealerRepository.findByUserId(userId);

    if (existingDealer) {
      const error = new Error('Dealer profile already exists for this user');
      error.statusCode = 409;
      throw error;
    }

    const created = await dealerRepository.create({ ...data, user_id: userId });
    if (data.business_id) {
      await dealerRepository.assignToBusiness(data.business_id, created.id);
    }
    await CacheService.delByPattern('dealers:*');
    await CacheService.delByPattern('dealer:*');
    await CacheService.delByPattern('analytics:*');
    await CacheService.delByPattern('businesses:*');
    return created;
  },

  async updateDealer(id, data) {
    const dealer = await dealerRepository.update(id, data);
    if (!dealer) {
      const error = new Error('Dealer not found');
      error.statusCode = 404;
      throw error;
    }
    await CacheService.delByPattern('dealers:*');
    await CacheService.delByPattern('dealer:*');
    await CacheService.delByPattern('analytics:*');
    return dealer;
  },

  async assignDealerToBusiness(businessId, dealerId) {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      const error = new Error('Business not found');
      error.statusCode = 404;
      throw error;
    }

    const dealer = await dealerRepository.findById(dealerId);
    if (!dealer) {
      const error = new Error('Dealer not found');
      error.statusCode = 404;
      throw error;
    }

    const assigned = await dealerRepository.assignToBusiness(businessId, dealerId);
    await CacheService.delByPattern('dealers:*');
    await CacheService.delByPattern('dealer:*');
    await CacheService.delByPattern('businesses:*');
    await CacheService.delByPattern('analytics:*');
    return assigned;
  },

  async unassignDealerFromBusiness(businessId, dealerId) {
    const success = await dealerRepository.unassignFromBusiness(businessId, dealerId);
    if (!success) {
      const error = new Error('Dealer assignment not found');
      error.statusCode = 404;
      throw error;
    }
    await CacheService.delByPattern('dealers:*');
    await CacheService.delByPattern('dealer:*');
    await CacheService.delByPattern('businesses:*');
    await CacheService.delByPattern('analytics:*');
    return true;
  },

  async getBusinessDealers(businessId, query = {}) {
    const { page, limit, offset } = getPaginationParams(query);
    const cacheKey = CacheService.generateKey(`dealers:business:${businessId}`, { page, limit });

    const { data } = await CacheService.remember(cacheKey, 180, async () => {
      const business = await businessRepository.findById(businessId);
      if (!business) {
        const error = new Error('Business not found');
        error.statusCode = 404;
        throw error;
      }
      const assigned = await dealerRepository.getAssignedDealers(businessId);
      const total = assigned.length;
      const paginated = query.limit || query.page ? assigned.slice(offset, offset + limit) : assigned;
      return { dealers: paginated, pagination: formatPagination(page, limit, total) };
    });

    return data;
  },
};
