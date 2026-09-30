import { z } from 'zod';
import { BUSINESS_STATUS } from '../models/Business.js';

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

export const createBusinessSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  description: z.string().optional().nullable(),
  logo: z.string().optional().or(z.literal('')).nullable(),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .refine((val) => !val || (PHONE_REGEX.test(val.trim()) && val.replace(/\D/g, '').length >= 7 && val.replace(/\D/g, '').length <= 15), {
      message: 'Invalid phone number format. Phone must be between 7 and 15 digits without letters.',
    })
    .optional()
    .nullable(),
  address: z.string().optional().nullable(),
  profit_margin: z.number().min(0).max(1000).optional(),
  status: z.enum([BUSINESS_STATUS.ACTIVE, BUSINESS_STATUS.INACTIVE, BUSINESS_STATUS.SUSPENDED]).optional(),
});

export const updateBusinessSchema = createBusinessSchema.partial();
