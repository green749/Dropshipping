import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { validate, validateUuidParams } from '../../shared/middlewares/validate.middleware.js';
import { adjustStockSchema, stockInSchema } from '../validations/inventory.validation.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireBusinessAccess);

// Intelligence & Forecasting Queries
router.get('/summary', inventoryController.getSummary);
router.get('/products', inventoryController.getProducts);
router.get('/products/:id', validateUuidParams('id'), inventoryController.getProductDetail);
router.get('/transactions', inventoryController.getTransactions);
router.get('/movement', inventoryController.getMovementTrend);

// Stock Operations & Mutations
router.post(
  '/adjustment',
  requireRole('DROPSHIPPER', 'DEALER'),
  validate(adjustStockSchema),
  inventoryController.adjustStock
);

router.post(
  '/stock-in',
  requireRole('DROPSHIPPER', 'DEALER'),
  validate(stockInSchema),
  inventoryController.stockIn
);

export default router;
