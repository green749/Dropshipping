import { Op, Sequelize } from 'sequelize';
import { businessRepository } from '../repositories/business.repository.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';
import { Dealer, BusinessDealer, Business, DealerInvitation } from '../models/index.js';
import { CacheService } from '../../shared/services/cache.service.js';

export const businessService = {
  async getAllBusinesses(query, user) {
    const { page, limit, offset } = getPaginationParams(query);
    const where = {};

    if (query.status) {
      where.status = query.status;
    }

    const cacheKey = CacheService.generateKey('businesses:list', {
      ...where,
      page,
      limit,
      userRole: user?.role,
      userId: user?.id,
      userEmail: (user?.email || '').toLowerCase(),
    });

    const { data } = await CacheService.remember(cacheKey, 180, async () => {
      // 1. DEALER Role: Return only businesses mapped via business_dealers or invitations
      if (user && user.role === 'DEALER') {
        const normalizedEmail = (user.email || '').trim().toLowerCase();
        const dealers = await Dealer.findAll({
          where: {
            [Op.or]: [
              { user_id: user.id },
              ...(normalizedEmail
                ? [
                    Sequelize.where(
                      Sequelize.fn('LOWER', Sequelize.col('email')),
                      normalizedEmail
                    ),
                  ]
                : []),
            ],
          },
          attributes: ['id'],
        });
        const dealerIds = dealers.map((d) => d.id);

        const assignments = await BusinessDealer.findAll({
          where: {
            [Op.or]: [
              ...(dealerIds.length > 0 ? [{ dealer_id: { [Op.in]: dealerIds } }] : []),
              { dealer_id: user.id },
            ],
          },
          attributes: ['business_id'],
        });

        const invites = await DealerInvitation.findAll({
          where: normalizedEmail
            ? {
                [Op.and]: [
                  Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('email')),
                    normalizedEmail
                  ),
                ],
              }
            : {},
          attributes: ['business_id'],
        });

        const businessIds = [
          ...assignments.map((a) => a.business_id),
          ...invites.map((i) => i.business_id),
        ].filter(Boolean);

        const uniqueBusinessIds = [...new Set(businessIds)];

        if (uniqueBusinessIds.length === 0) {
          return { businesses: [], pagination: formatPagination(page, limit, 0) };
        }

        const { count, rows } = await Business.findAndCountAll({
          where: { id: { [Op.in]: uniqueBusinessIds }, ...where },
          offset,
          limit,
          order: [['created_at', 'DESC']],
        });

        return { businesses: rows, pagination: formatPagination(page, limit, count) };
      }

      // 2. MARKETING or SALES Role: Return only assigned businesses via accepted invitations
      if (user && (user.role === 'MARKETING' || user.role === 'SALES')) {
        const normalizedEmail = (user.email || '').trim().toLowerCase();
        const invites = await DealerInvitation.findAll({
          where: normalizedEmail
            ? {
                [Op.and]: [
                  Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('email')),
                    normalizedEmail
                  ),
                ],
              }
            : {},
          attributes: ['business_id'],
        });
        const businessIds = [...new Set(invites.map((i) => i.business_id).filter(Boolean))];

        if (businessIds.length === 0) {
          return { businesses: [], pagination: formatPagination(page, limit, 0) };
        }

        const { count, rows } = await Business.findAndCountAll({
          where: { id: { [Op.in]: businessIds }, ...where },
          offset,
          limit,
          order: [['created_at', 'DESC']],
        });

        return { businesses: rows, pagination: formatPagination(page, limit, count) };
      }

      // 3. DROPSHIPPER (Admin) or Service: Full multi-storefront platform access
      const { total, businesses } = await businessRepository.findAll(where, offset, limit);
      const pagination = formatPagination(page, limit, total);

      return { businesses, pagination };
    });

    return data;
  },

  async getBusinessById(id, user) {
    const cacheKey = `businesses:item:${id}`;

    const { data: business } = await CacheService.remember(cacheKey, 300, async () => {
      return businessRepository.findById(id);
    });

    if (!business) {
      const error = new Error('Business not found');
      error.statusCode = 404;
      throw error;
    }

    if (user && user.role === 'DEALER') {
      const dealer = await Dealer.findOne({ where: { user_id: user.id } });
      const dealerId = dealer ? dealer.id : user.id;

      const assignment = await BusinessDealer.findOne({
        where: { business_id: id, dealer_id: dealerId },
      });

      if (!assignment) {
        const error = new Error('Access denied. Business is not assigned to your dealer account.');
        error.statusCode = 403;
        throw error;
      }
    }

    if (user && (user.role === 'MARKETING' || user.role === 'SALES')) {
      const normalizedEmail = (user.email || '').trim().toLowerCase();
      const invites = await DealerInvitation.findAll({
        where: normalizedEmail
          ? {
              [Op.and]: [
                Sequelize.where(
                  Sequelize.fn('LOWER', Sequelize.col('email')),
                  normalizedEmail
                ),
              ],
            }
          : {},
      });
      const specificBizIds = invites.map((i) => i.business_id).filter(Boolean);

      if (!specificBizIds.includes(id)) {
        const error = new Error(`Access denied. Business is not assigned to your ${user.role.toLowerCase()} account.`);
        error.statusCode = 403;
        throw error;
      }
    }

    return business;
  },

  async createBusiness(data) {
    const created = await businessRepository.create(data);
    await CacheService.delByPattern('businesses:*');
    await CacheService.delByPattern('analytics:*');
    return created;
  },

  async updateBusiness(id, data) {
    const business = await businessRepository.update(id, data);
    if (!business) {
      const error = new Error('Business not found');
      error.statusCode = 404;
      throw error;
    }
    await CacheService.delByPattern('businesses:*');
    await CacheService.delByPattern('analytics:*');
    return business;
  },

  async deleteBusiness(id) {
    const success = await businessRepository.delete(id);
    if (!success) {
      const error = new Error('Business not found');
      error.statusCode = 404;
      throw error;
    }
    await CacheService.delByPattern('businesses:*');
    await CacheService.delByPattern('analytics:*');
    return true;
  },
};
