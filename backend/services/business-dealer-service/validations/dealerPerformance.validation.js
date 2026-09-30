import { z } from 'zod';

export const updateDealerSlaSchema = z.object({
  dispatch_sla_hours: z.number().int().min(1).max(360).optional(),
  fulfillment_sla_hours: z.number().int().min(1).max(720).optional(),
  average_lead_time_days: z.number().int().min(1).max(90).optional(),
  payment_terms: z.string().max(50).optional(),
  commission_rate: z.number().min(0).max(100).optional(),
  credit_limit: z.number().min(0).optional(),
  rating_notes: z.string().max(1000).optional(),
});

export const updateDealerStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});
