import { Router } from 'express';
import { auditLogController } from '../controllers/auditLog.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { USER_ROLES, User } from '../models/index.js';

const router = Router();
const authenticate = createAuthenticateMiddleware(User);

router.use(authenticate);
router.get('/', requireRole(USER_ROLES.DROPSHIPPER), auditLogController.getAll);
router.get('/:id', requireRole(USER_ROLES.DROPSHIPPER), auditLogController.getById);

export default router;
