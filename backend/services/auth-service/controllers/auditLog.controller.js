import { auditLogService } from '../services/auditLog.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const auditLogController = {
  async getAll(req, res, next) {
    try {
      const { auditLogs, pagination } = await auditLogService.getAllAuditLogs(req.query);
      return sendSuccess(res, 'Audit logs retrieved successfully', auditLogs, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const log = await auditLogService.getAuditLogById(req.params.id);
      return sendSuccess(res, 'Audit log details retrieved successfully', log);
    } catch (error) {
      next(error);
    }
  },
};
