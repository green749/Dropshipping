import { Router } from 'express';
import { expenseController } from '../controllers/expense.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { validate, validateUuidParams } from '../../shared/middlewares/validate.middleware.js';
import { createExpenseSchema, updateExpenseSchema } from '../validations/expense.validation.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireBusinessAccess);

// List all expenses & Summary
router.get('/', expenseController.getAll);
router.get('/summary', expenseController.getSummary);

// Single Expense Operations
router.get('/:id', validateUuidParams('id'), expenseController.getById);

// Admin-Only Mutations for Expenses
router.post(
  '/',
  requireRole('DROPSHIPPER'),
  validate(createExpenseSchema),
  expenseController.create
);

router.put(
  '/:id',
  requireRole('DROPSHIPPER'),
  validateUuidParams('id'),
  validate(updateExpenseSchema),
  expenseController.update
);

router.delete(
  '/:id',
  requireRole('DROPSHIPPER'),
  validateUuidParams('id'),
  expenseController.delete
);

export default router;
