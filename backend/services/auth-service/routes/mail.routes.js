import express from 'express';
import { mailController } from '../controllers/mail.controller.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';

const router = express.Router();
const authenticate = createAuthenticateMiddleware();

// Mail endpoints protected by authentication
router.use(authenticate);

router.get('/logs', mailController.getLogs);
router.get('/logs/:id', mailController.getLogById);
router.post('/test', mailController.sendTest);
router.post('/send', mailController.sendCustom);

export default router;
