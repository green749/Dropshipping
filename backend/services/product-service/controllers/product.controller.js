import { productService } from '../services/product.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const productController = {
  async getAll(req, res, next) {
    try {
      const { products, pagination } = await productService.getAllProducts(req.query, req.user);
      return sendSuccess(res, 'Products retrieved successfully', products, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id, req.user);
      return sendSuccess(res, 'Product details retrieved successfully', product);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.body, req.user);
      return sendSuccess(res, 'Product created successfully', product, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body, req.user);
      return sendSuccess(res, 'Product updated successfully', product);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id, req.user);
      return sendSuccess(res, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
