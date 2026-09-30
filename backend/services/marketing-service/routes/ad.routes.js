import { Router } from 'express';
import { adController } from '../controllers/ad.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();
const authenticate = createAuthenticateMiddleware();

router.use(authenticate);
router.use(requireBusinessAccess);

router.get('/', requireRole('DROPSHIPPER', 'DEALER', 'MARKETING'), adController.getAll);
router.get('/:id', requireRole('DROPSHIPPER', 'DEALER', 'MARKETING'), adController.getById);
router.post('/', requireRole('DROPSHIPPER', 'MARKETING'), adController.create);
router.patch('/:id', requireRole('DROPSHIPPER', 'MARKETING'), adController.update);
router.delete('/:id', requireRole('DROPSHIPPER', 'MARKETING'), adController.delete);

export default router;
