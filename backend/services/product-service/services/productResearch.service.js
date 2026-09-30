import { Op } from 'sequelize';
import { productResearchRepository } from '../repositories/productResearch.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { RESEARCH_STATUS } from '../models/index.js';
import { CacheService } from '../../shared/services/cache.service.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

export const formatResearchItem = (item) => {
  const plain = item.toJSON ? item.toJSON() : item;
  const cost = parseFloat(plain.estimated_cost) || 0;
  const price = parseFloat(plain.expected_selling_price) || 0;
  const shipping = parseFloat(plain.estimated_shipping_cost) || 0;
  const marketing = parseFloat(plain.estimated_marketing_cost) || 0;
  const units = parseInt(plain.estimated_units, 10) || 1;

  const estimatedRevenue = price * units;
  const estimatedCogs = cost * units;
  const estimatedGrossProfit = estimatedRevenue - estimatedCogs;
  const estimatedTotalCost = (cost + shipping + marketing) * units;
  const estimatedNetProfit = estimatedRevenue - estimatedTotalCost;
  const estimatedMargin = estimatedRevenue > 0 ? (estimatedNetProfit / estimatedRevenue) * 100 : 0;

  return {
    ...plain,
    estimated_revenue: parseFloat(estimatedRevenue.toFixed(2)),
    estimated_gross_profit: parseFloat(estimatedGrossProfit.toFixed(2)),
    estimated_net_profit: parseFloat(estimatedNetProfit.toFixed(2)),
    estimated_margin_percent: parseFloat(estimatedMargin.toFixed(2)),
  };
};

export const productResearchService = {
  calculateEstimates: formatResearchItem,
  /**
   * 1. Create a Product Research Item
   */
  async createResearch(data, user) {
    const businessId = data.business_id || user?.business_id || null;

    const payload = {
      ...data,
      business_id: businessId,
      created_by: user?.id || null,
      status: data.status || RESEARCH_STATUS.IDEA,
    };

    const item = await productResearchRepository.create(payload);

    // Invalidate research cache
    await CacheService.delByPattern('product-research:*');

    // Audit log
    try {
      const authDb = getSequelize(env.DB.AUTH_NAME);
      if (authDb) {
        await authDb.query(
          `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_values, created_at)
           VALUES (gen_random_uuid(), :userId, 'CREATE_RESEARCH_ITEM', 'PRODUCT_RESEARCH', :entityId, :newValues, NOW())`,
          {
            replacements: {
              userId: user?.id || null,
              entityId: item.id,
              newValues: JSON.stringify({ name: item.product_name, category: item.category }),
            },
          }
        );
      }
    } catch (err) {
      console.warn('Audit logging failed for research creation:', err.message);
    }

    return formatResearchItem(item);
  },

  /**
   * 2. List Product Research Items with Search, Filters, and Pagination
   */
  async getResearchList(query = {}, user) {
    const { page, limit, offset } = getPaginationParams(query);
    const {
      search,
      status,
      category,
      dealer_id,
      tag,
      minMargin,
      maxMargin,
      business_id,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = query;

    const targetBusinessId = business_id && business_id !== 'all' ? business_id : user?.business_id || null;

    const cacheKey = CacheService.generateKey('product-research:list', {
      targetBusinessId: targetBusinessId || 'all',
      page,
      limit,
      search: search || '',
      status: status || '',
      category: category || '',
      dealer_id: dealer_id || '',
      tag: tag || '',
      minMargin: minMargin || '',
      maxMargin: maxMargin || '',
      sortBy,
      sortOrder,
    });

    const { data } = await CacheService.remember(cacheKey, 60, async () => {
      const whereConditions = [];

      if (targetBusinessId) {
        // Strictly scope to this business only — do not include unassigned (null) items
        whereConditions.push({ business_id: targetBusinessId });
      }

      if (status && status !== 'ALL') {
        whereConditions.push({ status });
      }

      if (category && category !== 'ALL') {
        whereConditions.push({ category });
      }

      if (dealer_id && dealer_id !== 'ALL') {
        whereConditions.push({ dealer_id });
      }

      if (search && search.trim()) {
        const s = `%${search.trim()}%`;
        whereConditions.push({
          [Op.or]: [
            { product_name: { [Op.iLike]: s } },
            { category: { [Op.iLike]: s } },
            { source: { [Op.iLike]: s } },
            { notes: { [Op.iLike]: s } },
          ],
        });
      }

      const where = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};

      // Valid sorting columns
      const allowedSortCols = [
        'created_at',
        'product_name',
        'category',
        'estimated_cost',
        'expected_selling_price',
        'status',
        'updated_at',
      ];
      const validSort = allowedSortCols.includes(sortBy) ? sortBy : 'created_at';
      const validOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { rows, count } = await productResearchRepository.findAll({
        where,
        order: [[validSort, validOrder]],
        limit,
        offset,
      });

      let items = rows.map(formatResearchItem);

      // In-memory tag filter if requested
      if (tag && tag !== 'ALL') {
        items = items.filter((item) => Array.isArray(item.tags) && item.tags.includes(tag));
      }

      // Margin range filters
      if (minMargin !== undefined && minMargin !== '') {
        const min = parseFloat(minMargin);
        if (!isNaN(min)) items = items.filter((i) => i.estimated_margin_percent >= min);
      }
      if (maxMargin !== undefined && maxMargin !== '') {
        const max = parseFloat(maxMargin);
        if (!isNaN(max)) items = items.filter((i) => i.estimated_margin_percent <= max);
      }

      return {
        items,
        total: count,
      };
    });

    const pagination = formatPagination(page, limit, data.total);

    return {
      items: data.items,
      pagination,
    };
  },

  /**
   * 3. Get Single Research Item by ID
   */
  async getResearchById(id, user) {
    const item = await productResearchRepository.findById(id);
    if (!item) {
      const error = new Error('Product research item not found');
      error.statusCode = 404;
      throw error;
    }

    if (user?.business_id && item.business_id && item.business_id !== user.business_id) {
      const error = new Error('Unauthorized: Tenant business isolation violation');
      error.statusCode = 403;
      throw error;
    }

    return formatResearchItem(item);
  },

  /**
   * 4. Update Research Item
   */
  async updateResearch(id, data, user) {
    const item = await productResearchRepository.findById(id);
    if (!item) {
      const error = new Error('Product research item not found');
      error.statusCode = 404;
      throw error;
    }

    if (user?.business_id && item.business_id && item.business_id !== user.business_id) {
      const error = new Error('Unauthorized: Tenant business isolation violation');
      error.statusCode = 403;
      throw error;
    }

    const updated = await item.update(data);
    await CacheService.delByPattern('product-research:*');

    // Audit log
    try {
      const authDb = getSequelize(env.DB.AUTH_NAME);
      if (authDb) {
        await authDb.query(
          `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_values, created_at)
           VALUES (gen_random_uuid(), :userId, 'UPDATE_RESEARCH_ITEM', 'PRODUCT_RESEARCH', :entityId, :newValues, NOW())`,
          {
            replacements: {
              userId: user?.id || null,
              entityId: item.id,
              newValues: JSON.stringify(data),
            },
          }
        );
      }
    } catch (err) {
      console.warn('Audit logging failed for research update:', err.message);
    }

    return formatResearchItem(updated);
  },

  /**
   * 5. Delete Research Item
   */
  async deleteResearch(id, user) {
    const item = await productResearchRepository.findById(id);
    if (!item) {
      const error = new Error('Product research item not found');
      error.statusCode = 404;
      throw error;
    }

    if (user?.business_id && item.business_id && item.business_id !== user.business_id) {
      const error = new Error('Unauthorized: Tenant business isolation violation');
      error.statusCode = 403;
      throw error;
    }

    await item.destroy();
    await CacheService.delByPattern('product-research:*');

    // Audit log
    try {
      const authDb = getSequelize(env.DB.AUTH_NAME);
      if (authDb) {
        await authDb.query(
          `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_values, created_at)
           VALUES (gen_random_uuid(), :userId, 'DELETE_RESEARCH_ITEM', 'PRODUCT_RESEARCH', :entityId, :newValues, NOW())`,
          {
            replacements: {
              userId: user?.id || null,
              entityId: id,
              newValues: JSON.stringify({ deletedName: item.product_name }),
            },
          }
        );
      }
    } catch (err) {
      console.warn('Audit logging failed for research deletion:', err.message);
    }

    return { message: 'Product research item deleted successfully' };
  },

  /**
   * 6. Convert Research Item to Live Product
   */
  async convertToProduct(id, conversionData = {}, user) {
    const item = await productResearchRepository.findById(id);
    if (!item) {
      const error = new Error('Product research item not found');
      error.statusCode = 404;
      throw error;
    }

    // Resolve or generate unique SKU
    const sku = conversionData.sku || `SKU-${item.category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // Resolve dealer id
    const businessDb = getSequelize(env.DB.BUSINESS_NAME);
    let dealerId = conversionData.dealer_id || item.dealer_id;
    if (!dealerId && businessDb) {
      const [dealers] = await businessDb.query('SELECT id FROM dealers WHERE status = \'ACTIVE\' LIMIT 1');
      if (dealers && dealers.length > 0) {
        dealerId = dealers[0].id;
      }
    }

    if (!dealerId) {
      // Fallback dealer id if none found
      dealerId = 'd0000000-0000-4000-8000-000000000001';
    }

    const costPrice = conversionData.cost_price !== undefined ? conversionData.cost_price : item.estimated_cost;
    const sellingPrice = conversionData.selling_price !== undefined ? conversionData.selling_price : item.expected_selling_price;
    const businessId = conversionData.business_id || item.business_id || user?.business_id || 'b0000000-0000-4000-8000-000000000001';

    const productPayload = {
      name: item.product_name,
      sku,
      category: item.category,
      description: conversionData.description || item.notes || `${item.product_name} - Researched and vetted product`,
      cost_price: costPrice,
      selling_price: sellingPrice,
      stock_quantity: conversionData.stock_quantity || 50,
      reserved_quantity: 0,
      low_stock_threshold: conversionData.low_stock_threshold || 10,
      reorder_level: conversionData.reorder_level || 15,
      safety_stock: 5,
      target_stock_days: 14,
      dealer_id: dealerId,
      business_id: businessId,
      images: conversionData.images && conversionData.images.length ? conversionData.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
      status: 'ACTIVE',
    };

    const newProduct = await productRepository.create(productPayload);

    // Update research status to APPROVED and store converted_product_id
    await item.update({
      status: RESEARCH_STATUS.APPROVED,
      converted_product_id: newProduct.id,
    });

    // Invalidate caches
    await CacheService.delByPattern('product-research:*');
    await CacheService.delByPattern('products:*');
    await CacheService.delByPattern('inventory:*');
    await CacheService.delByPattern('product-intelligence:*');

    // Audit log
    try {
      const authDb = getSequelize(env.DB.AUTH_NAME);
      if (authDb) {
        await authDb.query(
          `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_values, created_at)
           VALUES (gen_random_uuid(), :userId, 'CONVERT_RESEARCH_TO_PRODUCT', 'PRODUCT', :entityId, :newValues, NOW())`,
          {
            replacements: {
              userId: user?.id || null,
              entityId: newProduct.id,
              newValues: JSON.stringify({ researchId: item.id, productId: newProduct.id, name: newProduct.name }),
            },
          }
        );
      }
    } catch (err) {
      console.warn('Audit logging failed for research conversion:', err.message);
    }

    return {
      message: 'Product research item successfully converted to live Product',
      product: newProduct,
      researchItem: formatResearchItem(item),
    };
  },
};
