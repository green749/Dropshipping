import { Router } from 'express';
import { invitationController } from '../controllers/invitation.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { requireRole } from '../../shared/middlewares/role.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { createInvitationSchema, acceptInvitationSchema } from '../validations/invitation.validation.js';

const router = Router();
const authenticate = createAuthenticateMiddleware();

// Public Invitation Endpoints (No Token Required to view / accept invite)
router.get('/invitations/:token', invitationController.getByToken);
router.post('/accept-invite', validate(acceptInvitationSchema), invitationController.accept);

// Authenticated Admin Invitation Endpoints (Dropshipper Only)
router.use(authenticate);
router.post('/invite', requireRole('DROPSHIPPER'), validate(createInvitationSchema), invitationController.invite);
router.get('/invitations', requireRole('DROPSHIPPER'), invitationController.getAll);
router.post('/invitations/:id/resend', requireRole('DROPSHIPPER'), invitationController.resend);

export default router;
