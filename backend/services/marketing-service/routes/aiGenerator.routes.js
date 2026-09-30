import express from 'express';
import { aiGeneratorController } from '../controllers/aiGenerator.controller.js';
import { verifyToken } from '../../shared/utils/jwt.js';

const router = express.Router();

const optionalAuth = (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    if (token) {
      req.user = verifyToken(token);
    }
  } catch {
    // Soft ignore token failure
  }
  next();
};

// Get available AI models/providers
router.get('/providers', optionalAuth, aiGeneratorController.getProviders);

// Get available Design Shack & Renderforest video templates
router.get('/templates', optionalAuth, aiGeneratorController.getTemplates);

// Generate AI post creative image or video
router.post('/generate', optionalAuth, aiGeneratorController.generate);

// NEW: Advanced Chat-Based Real AI Creative Generation
router.post('/chat', optionalAuth, aiGeneratorController.chat);
router.post('/image', optionalAuth, aiGeneratorController.generateImage);
router.post('/video', optionalAuth, aiGeneratorController.generateVideo);

export default router;
