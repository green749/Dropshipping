import { Router } from 'express';
import { socialAccountController } from '../controllers/socialAccount.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();
const authenticate = createAuthenticateMiddleware();

router.use(authenticate);
router.use(requireBusinessAccess);

// Read channels (Admin & Marketer)
router.get('/', requireRole('DROPSHIPPER', 'MARKETING'), socialAccountController.getAll);

// Connect / Create channel (Admin & Marketer)
router.post('/', requireRole('DROPSHIPPER', 'MARKETING'), socialAccountController.create);

// Update / Disconnect channel (Admin only)
router.patch('/:id', requireRole('DROPSHIPPER'), socialAccountController.update);
router.delete('/:id', requireRole('DROPSHIPPER'), socialAccountController.delete);

export default router;

