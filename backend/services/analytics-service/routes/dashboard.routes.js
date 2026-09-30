import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';

import { requireBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

const router = Router();
const authenticate = createAuthenticateMiddleware();

router.use(authenticate);
router.use(requireBusinessAccess);

router.get('/overview', requireRole('DROPSHIPPER'), dashboardController.getOverview);
router.get('/dealer', requireRole('DROPSHIPPER', 'DEALER'), dashboardController.getDealerDashboard);
router.get('/marketing', requireRole('DROPSHIPPER', 'MARKETING'), dashboardController.getMarketingDashboard);

export default router;
