import { z } from 'zod';
import { PRODUCT_STATUS } from '../models/Product.js';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(150),
  sku: z.string().min(2, 'SKU must be at least 2 characters').max(50),
  description: z.string().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  cost_price: z.number({ invalid_type_error: 'Cost price must be a number' }).min(0),
  selling_price: z.number({ invalid_type_error: 'Selling price must be a number' }).min(0),
  stock_quantity: z.number().int().min(0).default(0),
  images: z.array(z.string()).optional(),
  image_url: z.string().optional().nullable(),
  status: z.enum([PRODUCT_STATUS.ACTIVE, PRODUCT_STATUS.INACTIVE, PRODUCT_STATUS.OUT_OF_STOCK]).optional(),
  dealer_id: z.string().uuid().optional().nullable(),
  business_id: z.string().uuid().optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();
