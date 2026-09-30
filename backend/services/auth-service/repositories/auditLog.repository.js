import { AuditLog, User } from '../models/index.js';

export const auditLogRepository = {
  async findAll(where = {}, offset = 0, limit = 20) {
    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      offset,
      limit,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['created_at', 'DESC']],
    });
    return { total: count, auditLogs: rows };
  },

  async findById(id) {
    return AuditLog.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
    });
  },
};
