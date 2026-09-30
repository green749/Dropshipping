import { z } from 'zod';
import { RESEARCH_STATUS } from '../models/index.js';

const statusValues = Object.values(RESEARCH_STATUS);

export const createProductResearchSchema = z.object({
  product_name: z.string().min(2, 'Product name must be at least 2 characters').max(255),
  product_url: z.string().url().optional().nullable().or(z.literal('')),
  category: z.string().min(2, 'Category is required').max(100),
  dealer_id: z.string().uuid().optional().nullable().or(z.literal('')),
  business_id: z.string().uuid().optional().nullable().or(z.literal('')),
  source: z.string().max(100).optional().nullable().or(z.literal('')),
  estimated_cost: z.number().min(0, 'Estimated cost cannot be negative'),
  expected_selling_price: z.number().min(0, 'Expected selling price cannot be negative'),
  estimated_shipping_cost: z.number().min(0).optional().default(0),
  estimated_marketing_cost: z.number().min(0).optional().default(0),
  estimated_units: z.number().int().min(1).optional().default(50),
  competitor_price: z.number().min(0).optional().nullable(),
  target_audience: z.string().max(255).optional().nullable().or(z.literal('')),
  status: z.enum(statusValues).optional().default(RESEARCH_STATUS.IDEA),
  notes: z.string().max(5000).optional().nullable().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
});

export const updateProductResearchSchema = z.object({
  product_name: z.string().min(2).max(255).optional(),
  product_url: z.string().url().optional().nullable().or(z.literal('')),
  category: z.string().min(2).max(100).optional(),
  dealer_id: z.string().uuid().optional().nullable().or(z.literal('')),
  business_id: z.string().uuid().optional().nullable().or(z.literal('')),
  source: z.string().max(100).optional().nullable().or(z.literal('')),
  estimated_cost: z.number().min(0).optional(),
  expected_selling_price: z.number().min(0).optional(),
  estimated_shipping_cost: z.number().min(0).optional(),
  estimated_marketing_cost: z.number().min(0).optional(),
  estimated_units: z.number().int().min(1).optional(),
  competitor_price: z.number().min(0).optional().nullable(),
  target_audience: z.string().max(255).optional().nullable().or(z.literal('')),
  status: z.enum(statusValues).optional(),
  notes: z.string().max(5000).optional().nullable().or(z.literal('')),
  tags: z.array(z.string()).optional(),
});

export const convertToProductSchema = z.object({
  sku: z.string().max(100).optional().nullable().or(z.literal('')),
  description: z.string().max(5000).optional().nullable().or(z.literal('')),
  stock_quantity: z.number().int().min(0).optional().default(50),
  low_stock_threshold: z.number().int().min(1).optional().default(10),
  reorder_level: z.number().int().min(1).optional().default(15),
  images: z.array(z.string()).optional().default([]),
  dealer_id: z.string().uuid().optional().nullable().or(z.literal('')),
  business_id: z.string().uuid().optional().nullable().or(z.literal('')),
  cost_price: z.number().min(0).optional(),
  selling_price: z.number().min(0).optional(),
});
