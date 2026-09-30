import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';
import { createAuthenticateMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { User } from '../models/User.js';

const router = Router();
const authenticate = createAuthenticateMiddleware(User);

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/login-as', authenticate, authController.loginAsUser);
router.get('/users', authenticate, authController.getAllUsers);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;
