import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { validate, validateUuidParams } from '../../shared/middlewares/validate.middleware.js';
import { createOrderSchema, updateOrderStatusSchema, updateOrderSchema } from '../validations/order.validation.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();
const authenticate = createAuthenticateMiddleware();

router.use(authenticate);
router.use(requireBusinessAccess);

router.get('/', requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'), orderController.getAll);
router.get('/:id', validateUuidParams('id'), requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'), orderController.getById);
router.post('/', requireRole('DROPSHIPPER', 'SALES'), validate(createOrderSchema), orderController.create);
router.patch('/:id', validateUuidParams('id'), requireRole('DROPSHIPPER', 'DEALER', 'SALES'), validate(updateOrderSchema), orderController.update);
router.patch('/:id/status', validateUuidParams('id'), requireRole('DROPSHIPPER', 'DEALER', 'SALES'), validate(updateOrderStatusSchema), orderController.updateStatus);
router.delete('/:id', validateUuidParams('id'), requireRole('DROPSHIPPER', 'SALES'), orderController.delete);

export default router;
