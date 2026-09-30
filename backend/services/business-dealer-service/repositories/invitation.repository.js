import { DealerInvitation } from '../models/index.js';

export const invitationRepository = {
  async create(data) {
    return DealerInvitation.create(data);
  },

  async findByToken(token) {
    return DealerInvitation.findOne({ where: { token } });
  },

  async findByEmail(email) {
    return DealerInvitation.findOne({ where: { email } });
  },

  async findAll(where = {}, offset = 0, limit = 20) {
    const { count, rows } = await DealerInvitation.findAndCountAll({
      where,
      offset,
      limit,
      order: [['created_at', 'DESC']],
    });
    return { total: count, invitations: rows };
  },

  async updateStatus(id, status) {
    const invite = await DealerInvitation.findByPk(id);
    if (!invite) return null;
    return invite.update({ status });
  },
};
