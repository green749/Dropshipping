import { Router } from 'express';
import { dealerController } from '../controllers/dealer.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { createDealerSchema, updateDealerSchema } from '../validations/dealer.validation.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();
const authenticate = createAuthenticateMiddleware();

router.use(authenticate);
router.use(requireBusinessAccess);

router.get('/', requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'), dealerController.getAll);
router.get('/:id', requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'), dealerController.getById);
router.post('/', requireRole('DROPSHIPPER', 'DEALER'), validate(createDealerSchema), dealerController.create);
router.patch('/:id', requireRole('DROPSHIPPER', 'DEALER'), validate(updateDealerSchema), dealerController.update);

export default router;
