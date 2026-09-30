import { Op } from 'sequelize';
import { productRepository } from '../repositories/product.repository.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';
import { CacheService } from '../../shared/services/cache.service.js';
import { resolveDealer, resolveDealerIds } from '../../shared/services/dealerResolver.service.js';
import { verifyBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

export const productService = {
  async getAllProducts(query, user) {
    const { page, limit, offset } = getPaginationParams(query);
    const where = {};

    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;
    if (query.business_id) where.business_id = query.business_id;

    if (user.role === 'DEALER') {
      const dealerIds = await resolveDealerIds(user);
      where.dealer_id = { [Op.in]: dealerIds };
    } else if (query.dealer_id) {
      where.dealer_id = query.dealer_id;
    }

    const cacheKey = CacheService.generateKey('products:list', {
      ...where,
      page,
      limit,
      userRole: user.role,
      userId: user.role === 'DEALER' ? user.id : 'all',
    });

    const { data } = await CacheService.remember(cacheKey, 180, async () => {
      const { total, products } = await productRepository.findAll(where, offset, limit);
      return { products, pagination: formatPagination(page, limit, total) };
    });

    return data;
  },

  async getProductById(id, user) {
    const cacheKey = `products:item:${id}`;

    const { data: product } = await CacheService.remember(cacheKey, 300, async () => {
      return productRepository.findById(id);
    });

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (user && product.business_id) {
      await verifyBusinessAccess(user, product.business_id);
    }

    if (user && user.role === 'DEALER') {
      const dealerIds = await resolveDealerIds(user);
      if (!dealerIds.includes(product.dealer_id)) {
        const error = new Error('Access denied. You can only view your own products.');
        error.statusCode = 403;
        throw error;
      }
    }

    return product;
  },

  async createProduct(data, user) {
    if (user && data.business_id) {
      await verifyBusinessAccess(user, data.business_id);
    }

    let dealerId = data.dealer_id || user.dealer_id || user.id;
    if (user.role === 'DEALER') {
      const dealer = await resolveDealer(user);
      dealerId = dealer ? dealer.id : (user.dealer_id || user.id);
    }

    const existingSku = await productRepository.findBySku(data.sku);
    if (existingSku) {
      const error = new Error(`Product with SKU '${data.sku}' already exists`);
      error.statusCode = 409;
      throw error;
    }

    const productPayload = {
      ...data,
      dealer_id: dealerId,
    };

    const created = await productRepository.create(productPayload);
    // Invalidate product & analytics cache patterns
    await CacheService.delByPattern('products:*');
    await CacheService.delByPattern('analytics:*');
    return created;
  },

  async updateProduct(id, data, user) {
    const product = await productRepository.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (user && product.business_id) {
      await verifyBusinessAccess(user, product.business_id);
    }

    if (user.role === 'MARKETING') {
      const error = new Error('Access denied. Marketing role cannot update products.');
      error.statusCode = 403;
      throw error;
    }

    if (user.role === 'DEALER') {
      const dealerIds = await resolveDealerIds(user);
      if (!dealerIds.includes(product.dealer_id)) {
        const error = new Error('Access denied. You can only update your own products.');
        error.statusCode = 403;
        throw error;
      }
    }

    if (data.sku && data.sku !== product.sku) {
      const existingSku = await productRepository.findBySku(data.sku);
      if (existingSku) {
        const error = new Error(`Product with SKU '${data.sku}' already exists`);
        error.statusCode = 409;
        throw error;
      }
    }

    const updated = await productRepository.update(id, data);
    await CacheService.delByPattern('products:*');
    await CacheService.delByPattern('analytics:*');
    return updated;
  },

  async deleteProduct(id, user) {
    const product = await productRepository.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (user && product.business_id) {
      await verifyBusinessAccess(user, product.business_id);
    }

    if (user.role === 'MARKETING') {
      const error = new Error('Access denied. Marketing role cannot delete products.');
      error.statusCode = 403;
      throw error;
    }

    if (user.role === 'DEALER') {
      const dealerIds = await resolveDealerIds(user);
      if (!dealerIds.includes(product.dealer_id)) {
        const error = new Error('Access denied. You can only delete your own products.');
        error.statusCode = 403;
        throw error;
      }
    }

    const deleted = await productRepository.delete(id);
    await CacheService.delByPattern('products:*');
    await CacheService.delByPattern('analytics:*');
    return deleted;
  },
};
