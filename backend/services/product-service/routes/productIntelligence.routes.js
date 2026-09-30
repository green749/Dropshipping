import { Router } from 'express';
import { productIntelligenceController } from '../controllers/productIntelligence.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { validateUuidParams } from '../../shared/middlewares/validate.middleware.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireBusinessAccess);

// Intelligence Dashboard & Matrix
router.get(
  '/summary',
  requireRole('DROPSHIPPER', 'DEALER', 'MARKETING'),
  productIntelligenceController.getSummary
);

router.get(
  '/',
  requireRole('DROPSHIPPER', 'DEALER', 'MARKETING'),
  productIntelligenceController.getList
);

// Drilldowns & Specific Insights
router.get(
  '/:id',
  validateUuidParams('id'),
  requireRole('DROPSHIPPER', 'DEALER', 'MARKETING'),
  productIntelligenceController.getDetail
);

router.get(
  '/:id/sales-trend',
  validateUuidParams('id'),
  requireRole('DROPSHIPPER', 'DEALER', 'MARKETING'),
  productIntelligenceController.getSalesTrend
);

router.get(
  '/:id/profitability',
  validateUuidParams('id'),
  requireRole('DROPSHIPPER', 'DEALER'),
  productIntelligenceController.getProfitability
);

router.get(
  '/:id/dealer-performance',
  validateUuidParams('id'),
  requireRole('DROPSHIPPER', 'DEALER'),
  productIntelligenceController.getDealerPerformance
);

export default router;
