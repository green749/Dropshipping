import { z } from 'zod';
import { USER_ROLES } from '../models/User.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum([USER_ROLES.DROPSHIPPER, USER_ROLES.DEALER, USER_ROLES.MARKETING, USER_ROLES.SALES]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
