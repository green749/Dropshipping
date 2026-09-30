import { Router } from 'express';
import { customerController } from '../controllers/customer.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { validate, validateUuidParams } from '../../shared/middlewares/validate.middleware.js';
import { createCustomerSchema, updateCustomerSchema } from '../validations/customer.validation.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();
const authenticate = createAuthenticateMiddleware();

router.use(authenticate);
router.use(requireBusinessAccess);

router.get('/', requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'), customerController.getAll);
router.get('/:id', validateUuidParams('id'), requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'), customerController.getById);
router.post('/', requireRole('DROPSHIPPER', 'SALES'), validate(createCustomerSchema), customerController.create);
router.patch('/:id', validateUuidParams('id'), requireRole('DROPSHIPPER', 'SALES'), validate(updateCustomerSchema), customerController.update);
router.delete('/:id', validateUuidParams('id'), requireRole('DROPSHIPPER', 'SALES'), customerController.delete);

export default router;
