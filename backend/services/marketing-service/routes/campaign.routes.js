import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { createCampaignSchema, updateCampaignSchema } from '../validations/campaign.validation.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();
const authenticate = createAuthenticateMiddleware();

router.use(authenticate);
router.use(requireBusinessAccess);

router.get('/', requireRole('DROPSHIPPER', 'DEALER', 'MARKETING'), campaignController.getAll);
router.get('/:id', requireRole('DROPSHIPPER', 'DEALER', 'MARKETING'), campaignController.getById);
router.post('/', requireRole('DROPSHIPPER', 'MARKETING'), validate(createCampaignSchema), campaignController.create);
router.patch('/:id', requireRole('DROPSHIPPER', 'MARKETING'), validate(updateCampaignSchema), campaignController.update);
router.delete('/:id', requireRole('DROPSHIPPER', 'MARKETING'), campaignController.delete);

export default router;
