import { notificationService } from '../services/notification.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const notificationController = {
  async getAll(req, res, next) {
    try {
      const { notifications, pagination } = await notificationService.getUserNotifications(req.user.id, req.query);
      return sendSuccess(res, 'Notifications retrieved successfully', notifications, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const notification = await notificationService.createNotification({
        user_id: req.body.user_id || req.user.id,
        title: req.body.title,
        message: req.body.message,
        type: req.body.type || 'INFO',
      });
      return sendSuccess(res, 'Notification created successfully', notification, 201);
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user.id);
      return sendSuccess(res, 'Notification marked as read', notification);
    } catch (error) {
      next(error);
    }
  },
};
