import { Router } from 'express';
import { returnController } from '../controllers/return.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();
const authenticate = createAuthenticateMiddleware();

router.use(authenticate);
router.use(requireBusinessAccess);

// Dealers and Dropshippers can read returns
router.get('/', returnController.getAll);
router.get('/:id', returnController.getById);

// Only Dropshipper and Sales can initiate/create customer return requests
router.post('/', requireRole('DROPSHIPPER', 'SALES'), returnController.create);

// Dropshippers, Dealers, and Sales can update return status and resolutions
router.patch('/:id/status', requireRole('DROPSHIPPER', 'DEALER', 'SALES'), returnController.updateStatus);

export default router;

