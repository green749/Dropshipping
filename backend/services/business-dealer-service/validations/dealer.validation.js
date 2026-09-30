import { z } from 'zod';
import { DEALER_STATUS } from '../models/Dealer.js';

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

export const createDealerSchema = z.object({
  user_id: z.string().uuid('Invalid user ID').optional(),
  company_name: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  contact_name: z.string().optional().nullable(),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .refine((val) => !val || (PHONE_REGEX.test(val.trim()) && val.replace(/\D/g, '').length >= 7 && val.replace(/\D/g, '').length <= 15), {
      message: 'Invalid phone number format. Phone must be between 7 and 15 digits without letters.',
    })
    .optional()
    .nullable(),
  credit_limit: z.coerce.number().min(0, 'Credit limit must be 0 or greater').optional().nullable(),
  status: z.enum([DEALER_STATUS.ACTIVE, DEALER_STATUS.INACTIVE, DEALER_STATUS.SUSPENDED]).optional(),
});

export const updateDealerSchema = createDealerSchema.partial();
