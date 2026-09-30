import { z } from 'zod';
import { EXPENSE_CATEGORIES } from '../models/Expense.js';

export const createExpenseSchema = z.object({
  business_id: z.string().uuid('Invalid business ID').optional().nullable(),
  category: z.enum(EXPENSE_CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}` }),
  }),
  description: z.string().min(2, 'Description must be at least 2 characters').max(255),
  amount: z.coerce.number().positive('Expense amount must be a positive number greater than 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').optional(),
  reference: z.string().max(100).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
