import { Router } from 'express';
import { businessController } from '../controllers/business.controller.js';
import { dealerController } from '../controllers/dealer.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { validate, validateUuidParams } from '../../shared/middlewares/validate.middleware.js';
import { createBusinessSchema, updateBusinessSchema } from '../validations/business.validation.js';

const router = Router();
const authenticate = createAuthenticateMiddleware();

router.use(authenticate);

router.get('/', requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'), businessController.getAll);
router.get('/:id', validateUuidParams('id'), requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'), businessController.getById);
router.post('/', requireRole('DROPSHIPPER'), validate(createBusinessSchema), businessController.create);
router.patch('/:id', validateUuidParams('id'), requireRole('DROPSHIPPER'), validate(updateBusinessSchema), businessController.update);
router.delete('/:id', validateUuidParams('id'), requireRole('DROPSHIPPER'), businessController.delete);

// Business-Dealer Assignments
router.post('/:businessId/dealers/:dealerId', validateUuidParams('businessId', 'dealerId'), requireRole('DROPSHIPPER'), dealerController.assignToBusiness);
router.get('/:businessId/dealers', validateUuidParams('businessId'), requireRole('DROPSHIPPER', 'DEALER', 'MARKETING', 'SALES'), dealerController.getBusinessDealers);
router.delete('/:businessId/dealers/:dealerId', validateUuidParams('businessId', 'dealerId'), requireRole('DROPSHIPPER'), dealerController.unassignFromBusiness);

export default router;
