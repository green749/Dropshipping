import { Return } from '../models/Return.js';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';
import { resolveDealerIds } from '../../shared/services/dealerResolver.service.js';
import { verifyBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';
import { Op } from 'sequelize';

export const returnController = {
  async getAll(req, res, next) {
    try {
      const { business_id, dealer_id, status } = req.query;
      const { page, limit, offset } = getPaginationParams(req.query);
      const where = {};
      if (business_id) where.business_id = business_id;
      if (status && status !== 'ALL') where.status = status;

      if (req.user && req.user.role === 'DEALER') {
        const dealerIds = await resolveDealerIds(req.user);
        where.dealer_id = { [Op.in]: dealerIds };
      } else if (dealer_id) {
        where.dealer_id = dealer_id;
      }

      const { count, rows } = await Return.findAndCountAll({
        where,
        offset,
        limit,
        order: [['created_at', 'DESC']],
      });

      return sendSuccess(res, 'Returns retrieved successfully', rows, 200, formatPagination(page, limit, count));
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const record = await Return.findByPk(req.params.id);
      if (!record) {
        return sendError(res, 'Return record not found', [], 404);
      }

      if (req.user && record.business_id) {
        await verifyBusinessAccess(req.user, record.business_id);
      }

      return sendSuccess(res, 'Return retrieved successfully', record);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      if (req.user && req.body.business_id) {
        await verifyBusinessAccess(req.user, req.body.business_id);
      }
      const record = await Return.create(req.body);
      return sendSuccess(res, 'Return requested successfully', record, 201);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, resolution } = req.body;
      const record = await Return.findByPk(id);
      if (!record) {
        return sendError(res, 'Return record not found', [], 404);
      }

      if (req.user && record.business_id) {
        await verifyBusinessAccess(req.user, record.business_id);
      }

      if (status) record.status = status;
      if (resolution !== undefined) record.resolution = resolution;
      await record.save();

      return sendSuccess(res, 'Return status updated successfully', record);
    } catch (error) {
      next(error);
    }
  },
};
