import { z } from 'zod';
import { CAMPAIGN_STATUS } from '../models/Campaign.js';

export const createCampaignSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  name: z.string().min(2, 'Campaign name must be at least 2 characters').max(150),
  description: z.string().optional(),
  objective: z.string().optional(),
  budget: z.number().min(0).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum([
    CAMPAIGN_STATUS.DRAFT,
    CAMPAIGN_STATUS.SCHEDULED,
    CAMPAIGN_STATUS.ACTIVE,
    CAMPAIGN_STATUS.PAUSED,
    CAMPAIGN_STATUS.COMPLETED,
    CAMPAIGN_STATUS.CANCELLED,
  ]).optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial().omit({ business_id: true });
