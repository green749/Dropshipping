import express from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/contacts', chatController.getContacts);
router.get('/unread-count', chatController.getUnreadCount);
router.get('/messages/:partnerId', chatController.getMessages);
router.post('/messages', chatController.sendMessage);
router.post('/broadcast', chatController.sendBroadcast);
router.put('/read/:partnerId', chatController.markAsRead);

export default router;
