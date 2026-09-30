import { emailService } from '../../shared/services/email.service.js';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse.js';

export const mailController = {
  async getLogs(req, res, next) {
    try {
      const logs = emailService.getEmailLogs();
      return sendSuccess(res, 'Email dispatch logs retrieved successfully', logs);
    } catch (error) {
      next(error);
    }
  },

  async getLogById(req, res, next) {
    try {
      const log = emailService.getEmailLogById(req.params.id);
      if (!log) {
        return sendError(res, 'Email log not found', 404);
      }
      return sendSuccess(res, 'Email log details retrieved', log);
    } catch (error) {
      next(error);
    }
  },

  async sendTest(req, res, next) {
    try {
      const recipient = req.body.to || req.user?.email || 'admin@dropship.com';
      const result = await emailService.sendTestEmail(recipient);
      return sendSuccess(res, `Test email dispatched to ${recipient}`, result, 200);
    } catch (error) {
      next(error);
    }
  },

  async sendCustom(req, res, next) {
    try {
      const { to, subject, message, title, type } = req.body;
      if (!to || (!message && !subject)) {
        return sendError(res, 'Recipient email and message/subject are required', 400);
      }

      const result = await emailService.sendNotificationEmail({
        to,
        title: title || subject || 'Notification from DropShipHub',
        message: message || subject,
        type: type || 'INFO',
      });

      return sendSuccess(res, `Email notification sent to ${to}`, result, 200);
    } catch (error) {
      next(error);
    }
  },
};
