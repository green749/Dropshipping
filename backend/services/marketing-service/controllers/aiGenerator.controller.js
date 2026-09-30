import { aiGeneratorService } from '../services/aiGenerator.service.js';
import { creativeService } from '../services/creative.service.js';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse.js';

export const aiGeneratorController = {
  async generate(req, res, next) {
    try {
      const {
        provider = 'gemini',
        mediaType = 'image',
        productName,
        productImage,
        category,
        price,
        theme,
        aspectRatio,
        platform,
        prompt,
        businessName,
      } = req.body;

      if (!productName && !productImage) {
        return sendError(res, 'Please provide at least a product name or product image', 400);
      }

      const result = await aiGeneratorService.generate({
        provider,
        mediaType,
        productName,
        productImage,
        category,
        price,
        theme,
        aspectRatio,
        platform,
        prompt,
        businessName,
      });

      return sendSuccess(res, `Generated ${mediaType} creative with ${result.provider} successfully`, result, 200);
    } catch (error) {
      next(error);
    }
  },

  async chat(req, res, next) {
    try {
      const result = await creativeService.processChatGeneration({ ...req.body, userId: req.user?.id });
      return sendSuccess(res, 'Chat generation completed', result, 200);
    } catch (error) {
      next(error);
    }
  },

  async generateImage(req, res, next) {
    try {
      const result = await creativeService.generateImage({ ...req.body, userId: req.user?.id });
      return sendSuccess(res, 'Image generation completed', result, 200);
    } catch (error) {
      next(error);
    }
  },

  async generateVideo(req, res, next) {
    try {
      const result = await creativeService.generateVideo({ ...req.body, userId: req.user?.id });
      return sendSuccess(res, 'Video generation completed', result, 200);
    } catch (error) {
      next(error);
    }
  },

  async getProviders(req, res, next) {
    try {
      const providers = aiGeneratorService.getAvailableProviders();
      return sendSuccess(res, 'AI Providers retrieved successfully', providers);
    } catch (error) {
      next(error);
    }
  },

  async getTemplates(req, res, next) {
    try {
      const templates = aiGeneratorService.getVideoTemplates();
      return sendSuccess(res, 'Design Shack & Renderforest Video Templates retrieved successfully', templates);
    } catch (error) {
      next(error);
    }
  },
};
