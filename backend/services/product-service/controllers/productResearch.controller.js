import { productResearchService } from '../services/productResearch.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const productResearchController = {
  /**
   * POST /api/v1/product-research
   */
  async create(req, res, next) {
    try {
      const item = await productResearchService.createResearch(req.body, req.user);
      return sendSuccess(res, 'Product research item created successfully', item, 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/product-research
   */
  async getAll(req, res, next) {
    try {
      const result = await productResearchService.getResearchList(req.query, req.user);
      return sendSuccess(res, 'Product research items retrieved successfully', result.items, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/product-research/:id
   */
  async getById(req, res, next) {
    try {
      const item = await productResearchService.getResearchById(req.params.id, req.user);
      return sendSuccess(res, 'Product research item retrieved successfully', item);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/product-research/:id
   */
  async update(req, res, next) {
    try {
      const updated = await productResearchService.updateResearch(req.params.id, req.body, req.user);
      return sendSuccess(res, 'Product research item updated successfully', updated);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/v1/product-research/:id
   */
  async delete(req, res, next) {
    try {
      const result = await productResearchService.deleteResearch(req.params.id, req.user);
      return sendSuccess(res, result.message, null);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/product-research/:id/convert
   */
  async convertToProduct(req, res, next) {
    try {
      const result = await productResearchService.convertToProduct(req.params.id, req.body, req.user);
      return sendSuccess(res, result.message, result, 201);
    } catch (err) {
      next(err);
    }
  },
};
