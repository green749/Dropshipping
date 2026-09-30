import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { User } from '../models/User.js';

const router = Router();
const authenticate = createAuthenticateMiddleware(User);

router.use(authenticate);
router.get('/', notificationController.getAll);
router.post('/', notificationController.create);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
