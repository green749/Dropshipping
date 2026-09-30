import { z } from 'zod';
import { CUSTOMER_STATUS } from '../models/Customer.js';

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

export const createCustomerSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  name: z.string().min(2, 'Customer name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .refine((val) => !val || (PHONE_REGEX.test(val.trim()) && val.replace(/\D/g, '').length >= 7 && val.replace(/\D/g, '').length <= 15), {
      message: 'Invalid phone number format. Phone must be between 7 and 15 digits without letters.',
    })
    .optional()
    .nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  status: z.enum([CUSTOMER_STATUS.ACTIVE, CUSTOMER_STATUS.INACTIVE]).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial().omit({ business_id: true });
