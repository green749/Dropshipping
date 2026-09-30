import { Notification, User } from '../models/index.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';

export const notificationService = {
  async getUserNotifications(userId, query) {
    const { page, limit, offset } = getPaginationParams(query);

    const { count, rows } = await Notification.findAndCountAll({
      where: { user_id: userId },
      offset,
      limit,
      order: [['created_at', 'DESC']],
    });

    return { notifications: rows, pagination: formatPagination(page, limit, count) };
  },

  async createNotification(data) {
    return await Notification.create(data);
  },

  async markAsRead(id, userId) {
    const notification = await Notification.findOne({
      where: { id, user_id: userId },
    });

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    return notification.update({ is_read: true });
  },
};
