import { z } from 'zod';
import { INVENTORY_TRANSACTION_TYPES } from '../models/InventoryTransaction.js';

export const adjustStockSchema = z.object({
  product_id: z.string().uuid('Invalid Product ID'),
  quantity: z.number().int().refine((val) => val !== 0, 'Quantity adjustment cannot be zero'),
  transaction_type: z.enum([
    'ADJUSTMENT',
    'DAMAGED',
    'LOST',
    'STOCK_IN',
    'STOCK_OUT',
  ]),
  reason: z.string().min(3, 'Reason is required (min 3 chars)').max(255),
  notes: z.string().max(1000).optional(),
});

export const stockInSchema = z.object({
  product_id: z.string().uuid('Invalid Product ID'),
  dealer_id: z.string().uuid('Invalid Dealer ID').optional(),
  quantity: z.number().int().positive('Stock-in quantity must be greater than 0'),
  reference: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateThresholdsSchema = z.object({
  low_stock_threshold: z.number().int().min(0).optional(),
  reorder_level: z.number().int().min(0).optional(),
  safety_stock: z.number().int().min(0).optional(),
  target_stock_days: z.number().int().min(1).max(365).optional(),
});
