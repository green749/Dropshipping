import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { validate, validateUuidParams } from '../../shared/middlewares/validate.middleware.js';
import { createProductSchema, updateProductSchema } from '../validations/product.validation.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();
const authenticate = createAuthenticateMiddleware();

router.use(authenticate);
router.use(requireBusinessAccess);

router.get('/', requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'), productController.getAll);
router.get('/:id', validateUuidParams('id'), requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'), productController.getById);
router.post('/', requireRole('DROPSHIPPER', 'DEALER'), validate(createProductSchema), productController.create);
router.patch('/:id', validateUuidParams('id'), requireRole('DROPSHIPPER', 'DEALER'), validate(updateProductSchema), productController.update);
router.delete('/:id', validateUuidParams('id'), requireRole('DROPSHIPPER', 'DEALER'), productController.delete);

export default router;
