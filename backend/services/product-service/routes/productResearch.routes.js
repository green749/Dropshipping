import { Router } from 'express';
import { productResearchController } from '../controllers/productResearch.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { validate, validateUuidParams } from '../../shared/middlewares/validate.middleware.js';
import {
  createProductResearchSchema,
  updateProductResearchSchema,
  convertToProductSchema,
} from '../validations/productResearch.validation.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireBusinessAccess);

// List & Create
router.get(
  '/',
  requireRole('DROPSHIPPER', 'MARKETING'),
  productResearchController.getAll
);

router.post(
  '/',
  requireRole('DROPSHIPPER', 'MARKETING'),
  validate(createProductResearchSchema),
  productResearchController.create
);

// Get Single, Update, Delete
router.get(
  '/:id',
  validateUuidParams('id'),
  requireRole('DROPSHIPPER', 'MARKETING'),
  productResearchController.getById
);

router.patch(
  '/:id',
  validateUuidParams('id'),
  requireRole('DROPSHIPPER', 'MARKETING'),
  validate(updateProductResearchSchema),
  productResearchController.update
);

router.put(
  '/:id',
  validateUuidParams('id'),
  requireRole('DROPSHIPPER', 'MARKETING'),
  validate(updateProductResearchSchema),
  productResearchController.update
);

router.patch(
  '/:id/status',
  validateUuidParams('id'),
  requireRole('DROPSHIPPER', 'MARKETING'),
  productResearchController.update
);

router.delete(
  '/:id',
  validateUuidParams('id'),
  requireRole('DROPSHIPPER'),
  productResearchController.delete
);

// Explicit User Conversion from Research Item to Live Product
router.post(
  '/:id/convert',
  validateUuidParams('id'),
  requireRole('DROPSHIPPER'),
  validate(convertToProductSchema),
  productResearchController.convertToProduct
);

export default router;
