import { Router } from 'express';
import { postController } from '../controllers/post.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();
const authenticate = createAuthenticateMiddleware();

router.use(authenticate);
router.use(requireBusinessAccess);

router.get('/', requireRole('DROPSHIPPER', 'DEALER', 'MARKETING'), postController.getAll);
router.get('/:id', requireRole('DROPSHIPPER', 'DEALER', 'MARKETING'), postController.getById);
router.post('/', requireRole('DROPSHIPPER', 'MARKETING'), postController.create);
router.patch('/:id', requireRole('DROPSHIPPER', 'MARKETING'), postController.update);
router.delete('/:id', requireRole('DROPSHIPPER', 'MARKETING'), postController.delete);
router.post('/:id/publish', requireRole('DROPSHIPPER', 'MARKETING'), postController.publish);

export default router;
