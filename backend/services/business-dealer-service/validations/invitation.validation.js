import { z } from 'zod';

export const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  business_id: z.string().uuid('Invalid business ID').optional(),
  company_name: z.string().optional(),
  role: z.enum(['DEALER', 'MARKETING', 'SALES']).optional(),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
  name: z.string().min(2, 'Contact name must be at least 2 characters').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  company_name: z.string().optional(),
  phone: z.string().optional(),
});
