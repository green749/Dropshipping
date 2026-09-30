import { auditLogRepository } from '../repositories/auditLog.repository.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';

export const auditLogService = {
  async getAllAuditLogs(query) {
    const { page, limit, offset } = getPaginationParams(query);
    const where = {};

    if (query.user_id) where.user_id = query.user_id;
    if (query.action) where.action = query.action;
    if (query.entity_type) where.entity_type = query.entity_type;

    const { total, auditLogs } = await auditLogRepository.findAll(where, offset, limit);
    const pagination = formatPagination(page, limit, total);

    return { auditLogs, pagination };
  },

  async getAuditLogById(id) {
    const log = await auditLogRepository.findById(id);
    if (!log) {
      const error = new Error('Audit log entry not found');
      error.statusCode = 404;
      throw error;
    }
    return log;
  },
};
