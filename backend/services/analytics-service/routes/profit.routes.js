import { Router } from 'express';
import { profitController } from '../controllers/profit.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { validateUuidParams } from '../../shared/middlewares/validate.middleware.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireBusinessAccess);

// Financial Profit & Loss Analytics
router.get('/summary', requireRole('DROPSHIPPER'), profitController.getProfitSummary);
router.get('/profit-summary', requireRole('DROPSHIPPER'), profitController.getProfitSummary);

router.get('/timeline', requireRole('DROPSHIPPER'), profitController.getProfitTimeline);

router.get('/products', requireRole('DROPSHIPPER'), profitController.getProductProfitability);
router.get('/product-profitability', requireRole('DROPSHIPPER'), profitController.getProductProfitability);

router.get('/orders', requireRole('DROPSHIPPER'), profitController.getOrderProfitabilityList);
router.get('/orders/:id', requireRole('DROPSHIPPER'), validateUuidParams('id'), profitController.getOrderProfitability);
router.get('/order-profitability/:id', requireRole('DROPSHIPPER'), validateUuidParams('id'), profitController.getOrderProfitability);

export default router;

