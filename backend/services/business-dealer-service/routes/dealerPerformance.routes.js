import { Router } from 'express';
import { dealerPerformanceController } from '../controllers/dealerPerformance.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { validate, validateUuidParams } from '../../shared/middlewares/validate.middleware.js';
import {
  updateDealerSlaSchema,
  updateDealerStatusSchema,
} from '../validations/dealerPerformance.validation.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();
const authenticate = createAuthenticateMiddleware();

router.use(authenticate);
router.use(requireBusinessAccess);

// Intelligence & Performance Queries
router.get(
  '/performance/summary',
  requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'),
  dealerPerformanceController.getSummary
);

router.get(
  '/performance/list',
  requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'),
  dealerPerformanceController.getList
);

router.get(
  '/performance/comparison',
  requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'),
  dealerPerformanceController.getComparison
);

router.get(
  '/:id/performance',
  validateUuidParams('id'),
  requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'),
  dealerPerformanceController.getDetail
);

// Operational & SLA Mutations
router.patch(
  '/:id/sla',
  validateUuidParams('id'),
  requireRole('DROPSHIPPER'),
  validate(updateDealerSlaSchema),
  dealerPerformanceController.updateSla
);

router.patch(
  '/:id/status',
  validateUuidParams('id'),
  requireRole('DROPSHIPPER'),
  validate(updateDealerStatusSchema),
  dealerPerformanceController.updateStatus
);

export default router;
