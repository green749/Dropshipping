import { Product, InventoryTransaction } from '../models/index.js';
import { inventoryRepository } from '../repositories/inventory.repository.js';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';
import { CacheService } from '../../shared/services/cache.service.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';
import { resolveDealerIds } from '../../shared/services/dealerResolver.service.js';
import { runWorkerTask } from '../../shared/workers/workerPool.js';
import { Op } from 'sequelize';

export const inventoryService = {
  /**
   * 1. Get Inventory Summary Dashboard KPIs
   */
  async getInventorySummary(query = {}, user) {
    const { business_id } = query;
    const targetBusinessId = business_id && business_id !== 'all' ? business_id : null;

    const cacheKey = CacheService.generateKey('inventory:summary', {
      businessId: targetBusinessId || 'all',
      userRole: user?.role,
      userId: user?.role === 'DEALER' ? user.id : 'all',
    });

    const { data } = await CacheService.remember(cacheKey, 60, async () => {
      const productWhere = {};
      if (targetBusinessId) productWhere.business_id = targetBusinessId;
      if (user && user.role === 'DEALER') {
        const dealerIds = await resolveDealerIds(user);
        productWhere.dealer_id = { [Op.in]: dealerIds };
      }

      const products = await Product.findAll({
        where: productWhere,
        attributes: [
          'id',
          'name',
          'sku',
          'category',
          'cost_price',
          'selling_price',
          'stock_quantity',
          'reserved_quantity',
          'low_stock_threshold',
          'reorder_level',
          'safety_stock',
          'target_stock_days',
          'dealer_id',
          'business_id',
          'status',
        ],
      });

      // Calculate 30-day velocity from order_items
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const mgmtDb = getSequelize(env.DB.NAME) || getSequelize(env.DB.ORDER_NAME);
      let salesMap = new Map();

      try {
        if (mgmtDb) {
          const salesQuery = `
            SELECT oi.product_id, SUM(oi.quantity) as units_sold
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.status NOT IN ('CANCELLED') AND o.created_at >= :startDate
            ${targetBusinessId ? 'AND o.business_id = :businessId' : ''}
            GROUP BY oi.product_id
          `;
          const replacements = { startDate: thirtyDaysAgo };
          if (targetBusinessId) replacements.businessId = targetBusinessId;

          const [salesRows] = await mgmtDb.query(salesQuery, {
            replacements,
          });

          for (const row of salesRows) {
            salesMap.set(row.product_id, parseInt(row.units_sold, 10) || 0);
          }
        }
      } catch (err) {
        console.warn('Could not query sales velocity table:', err.message);
      }

      let totalProducts = products.length;
      let totalStockUnits = 0;
      let totalReservedUnits = 0;
      let totalAvailableUnits = 0;
      let totalInventoryValue = 0;

      let lowStockCount = 0;
      let lowStockValue = 0;
      let outOfStockCount = 0;
      let overstockedCount = 0;
      let overstockedValue = 0;
      let deadStockCount = 0;
      let deadStockValue = 0;
      let fastMovingCount = 0;
      let reorderRecommendedCount = 0;

      for (const p of products) {
        const stock = parseInt(p.stock_quantity, 10) || 0;
        const reserved = parseInt(p.reserved_quantity, 10) || 0;
        const available = Math.max(0, stock - reserved);
        const costPrice = parseFloat(p.cost_price || 0);
        const itemVal = available * costPrice;

        totalStockUnits += stock;
        totalReservedUnits += reserved;
        totalAvailableUnits += available;
        totalInventoryValue += itemVal;

        const sold30 = salesMap.get(p.id) || 0;
        const dailyVelocity = sold30 / 30;
        const targetDays = p.target_stock_days || 14;
        const lowThreshold = p.low_stock_threshold || 10;
        const leadTime = 3; // Default 3 days lead time
        const safetyStock = p.safety_stock || 5;
        const reorderPoint = Math.ceil(dailyVelocity * leadTime + safetyStock);

        const daysRemaining = dailyVelocity > 0 ? Math.round(available / dailyVelocity) : null;

        if (available <= 0) {
          outOfStockCount++;
        } else if (available <= lowThreshold || available <= reorderPoint) {
          lowStockCount++;
          lowStockValue += itemVal;
        }

        if (available <= reorderPoint && available > 0) {
          reorderRecommendedCount++;
        }

        if (dailyVelocity >= 1.5) {
          fastMovingCount++;
        }

        if (available > 20 && daysRemaining !== null && daysRemaining > targetDays * 3) {
          overstockedCount++;
          overstockedValue += itemVal;
        }

        if (available > 0 && sold30 === 0) {
          deadStockCount++;
          deadStockValue += itemVal;
        }
      }

      return {
        totalProducts,
        totalStockUnits,
        totalReservedUnits,
        totalAvailableUnits,
        totalInventoryValue: parseFloat(totalInventoryValue.toFixed(2)),
        lowStockCount,
        lowStockValue: parseFloat(lowStockValue.toFixed(2)),
        outOfStockCount,
        overstockedCount,
        overstockedValue: parseFloat(overstockedValue.toFixed(2)),
        deadStockCount,
        deadStockValue: parseFloat(deadStockValue.toFixed(2)),
        fastMovingCount,
        reorderRecommendedCount,
      };
    });

    return data;
  },

  /**
   * 2. List Products with Intelligent Inventory Calculations
   */
  async getInventoryList(query = {}, user) {
    const {
      business_id,
      status: filterStatus,
      category,
      dealer_id,
      search,
      days = 30,
      page = 1,
      limit = 20,
      sortBy = 'stock_quantity',
      sortOrder = 'DESC',
    } = query;

    const { offset, limit: limitNum, page: pageNum } = getPaginationParams({ page, limit });
    const targetBusinessId = business_id && business_id !== 'all' ? business_id : null;

    const productWhere = {};
    if (targetBusinessId) productWhere.business_id = targetBusinessId;
    if (category && category !== 'ALL') productWhere.category = category;
    if (dealer_id && dealer_id !== 'ALL') productWhere.dealer_id = dealer_id;
    if (user && user.role === 'DEALER') {
      const dealerIds = await resolveDealerIds(user);
      productWhere.dealer_id = { [Op.in]: dealerIds };
    }

    if (search) {
      const term = `%${search.trim().toLowerCase()}%`;
      productWhere[Op.or] = [
        { name: { [Op.iLike]: term } },
        { sku: { [Op.iLike]: term } },
        { category: { [Op.iLike]: term } },
      ];
    }

    const products = await Product.findAll({
      where: productWhere,
      order: [['created_at', 'DESC']],
    });

    // Fetch Dealer Details (Company Name & Lead Time)
    const mgmtDb = getSequelize(env.DB.NAME) || getSequelize(env.DB.PRODUCT_NAME);
    let dealerMap = new Map();
    try {
      if (mgmtDb) {
        const [dealers] = await mgmtDb.query(
          'SELECT id, company_name, average_lead_time_days FROM dealers'
        );
        for (const d of dealers) {
          dealerMap.set(d.id, {
            name: d.company_name,
            leadTime: parseInt(d.average_lead_time_days, 10) || 3,
          });
        }
      }
    } catch (e) {}

    // Fetch Sales Velocities (7d, 30d, 90d)
    const daysInt = parseInt(days, 10) || 30;
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - daysInt);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let salesMap = new Map();
    let sales7dMap = new Map();

    try {
      if (mgmtDb) {
        const [salesRows] = await mgmtDb.query(
          `SELECT oi.product_id, SUM(oi.quantity) as units_sold
           FROM order_items oi
           JOIN orders o ON o.id = oi.order_id
           WHERE o.status NOT IN ('CANCELLED') AND o.created_at >= :startDate
           GROUP BY oi.product_id`,
          { replacements: { startDate: windowStart } }
        );
        for (const row of salesRows) {
          salesMap.set(row.product_id, parseInt(row.units_sold, 10) || 0);
        }

        const [sales7dRows] = await mgmtDb.query(
          `SELECT oi.product_id, SUM(oi.quantity) as units_sold
           FROM order_items oi
           JOIN orders o ON o.id = oi.order_id
           WHERE o.status NOT IN ('CANCELLED') AND o.created_at >= :startDate
           GROUP BY oi.product_id`,
          { replacements: { startDate: sevenDaysAgo } }
        );
        for (const row of sales7dRows) {
          sales7dMap.set(row.product_id, parseInt(row.units_sold, 10) || 0);
        }
      }
    } catch (e) {}

    // Process intelligence metrics per product
    let enrichedList = products.map((p) => {
      const stock = parseInt(p.stock_quantity, 10) || 0;
      const reserved = parseInt(p.reserved_quantity, 10) || 0;
      const available = Math.max(0, stock - reserved);
      const costPrice = parseFloat(p.cost_price || 0);
      const sellingPrice = parseFloat(p.selling_price || 0);
      const inventoryValue = parseFloat((available * costPrice).toFixed(2));

      const dealerInfo = dealerMap.get(p.dealer_id) || { name: 'Direct Supplier', leadTime: 3 };
      const leadTime = dealerInfo.leadTime || 3;
      const safetyStock = p.safety_stock || 5;
      const targetDays = p.target_stock_days || 14;
      const lowThreshold = p.low_stock_threshold || 10;

      const unitsSold = salesMap.get(p.id) || 0;
      const dailyVelocity = parseFloat((unitsSold / daysInt).toFixed(2));

      const unitsSold7d = sales7dMap.get(p.id) || 0;
      const velocity7d = parseFloat((unitsSold7d / 7).toFixed(2));
      const velocitySurge = dailyVelocity > 0 && velocity7d >= dailyVelocity * 2.2;

      const daysRemaining =
        dailyVelocity > 0 ? Math.round(available / dailyVelocity) : null;

      const reorderPoint = Math.ceil(dailyVelocity * leadTime + safetyStock);
      const recommendedReorder = Math.max(
        0,
        Math.round(dailyVelocity * targetDays - available)
      );

      // Determine Derived Status
      let status = 'IN_STOCK';
      if (available <= 0) {
        status = 'OUT_OF_STOCK';
      } else if (available <= lowThreshold || available <= reorderPoint) {
        status = 'LOW_STOCK';
      } else if (available > 20 && daysRemaining !== null && daysRemaining > targetDays * 3) {
        status = 'OVERSTOCKED';
      } else if (available > 0 && unitsSold === 0) {
        status = 'DEAD_STOCK';
      } else if (dailyVelocity >= 1.5) {
        status = 'FAST_MOVING';
      } else if (dailyVelocity > 0 && dailyVelocity < 0.4) {
        status = 'SLOW_MOVING';
      }

      const reorderRecommended =
        available <= reorderPoint || available <= lowThreshold;

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        costPrice,
        sellingPrice,
        stockQuantity: stock,
        reservedQuantity: reserved,
        availableStock: available,
        inventoryValue,
        dealerId: p.dealer_id,
        dealerName: dealerInfo.name,
        leadTimeDays: leadTime,
        lowStockThreshold: lowThreshold,
        reorderLevel: p.reorder_level || 15,
        reorderPoint,
        recommendedReorder,
        safetyStock,
        targetStockDays: targetDays,
        unitsSold,
        dailyVelocity,
        velocity7d,
        velocitySurge,
        daysRemaining,
        status,
        reorderRecommended,
        images: p.images || [],
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    });

    // Apply Status Filter if provided
    if (filterStatus && filterStatus !== 'ALL') {
      if (filterStatus === 'REORDER_RECOMMENDED') {
        enrichedList = enrichedList.filter((item) => item.reorderRecommended);
      } else {
        enrichedList = enrichedList.filter((item) => item.status === filterStatus);
      }
    }

    const totalCount = enrichedList.length;

    // Apply In-Memory Sorting
    enrichedList.sort((a, b) => {
      let valA = a[sortBy] !== undefined ? a[sortBy] : 0;
      let valB = b[sortBy] !== undefined ? b[sortBy] : 0;
      if (typeof valA === 'string') {
        return sortOrder === 'ASC' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'ASC' ? valA - valB : valB - valA;
    });

    // Apply Pagination
    const paginatedItems = enrichedList.slice(offset, offset + limitNum);

    return {
      products: paginatedItems,
      pagination: formatPagination(pageNum, limitNum, totalCount),
    };
  },

  /**
   * 3. Get Detailed Product Inventory Intelligence
   */
  async getProductInventoryDetail(productId, query = {}, user) {
    const product = await Product.findByPk(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (user && user.role === 'DEALER') {
      const dealerIds = await resolveDealerIds(user);
      if (!dealerIds.includes(product.dealer_id)) {
        const error = new Error('Access denied to this product');
        error.statusCode = 403;
        throw error;
      }
    }

    const mgmtDb = getSequelize(env.DB.NAME) || getSequelize(env.DB.PRODUCT_NAME);

    // 1. Dealer Details
    let dealer = { company_name: 'Direct Supplier', average_lead_time_days: 3 };
    try {
      if (mgmtDb && product.dealer_id) {
        const [dealers] = await mgmtDb.query(
          'SELECT id, company_name, email, phone, average_lead_time_days FROM dealers WHERE id = :dealerId',
          { replacements: { dealerId: product.dealer_id } }
        );
        if (dealers && dealers.length > 0) dealer = dealers[0];
      }
    } catch (e) {}

    // 2. Sales Velocities across windows
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    let sales7 = 0;
    let sales14 = 0;
    let sales30 = 0;
    let sales90 = 0;
    let dailyTimeline = [];

    try {
      if (mgmtDb) {
        const [salesRows] = await mgmtDb.query(
          `SELECT o.created_at::date as sale_date, SUM(oi.quantity) as qty
           FROM order_items oi
           JOIN orders o ON o.id = oi.order_id
           WHERE oi.product_id = :productId AND o.status NOT IN ('CANCELLED') AND o.created_at >= :startDate
           GROUP BY o.created_at::date
           ORDER BY sale_date ASC`,
          { replacements: { productId, startDate: d90 } }
        );

        const dateMap = new Map();
        for (const r of salesRows) {
          dateMap.set(r.sale_date.toISOString ? r.sale_date.toISOString().split('T')[0] : String(r.sale_date), parseInt(r.qty, 10));
        }

        // Build continuous 30-day timeline
        for (let i = 29; i >= 0; i--) {
          const dt = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const qty = dateMap.get(dt) || 0;
          dailyTimeline.push({ date: dt, unitsSold: qty });

          if (i < 7) sales7 += qty;
          if (i < 14) sales14 += qty;
          if (i < 30) sales30 += qty;
        }

        sales90 = sales30; // fallback accumulator
        for (const r of salesRows) {
          sales90 += parseInt(r.qty, 10);
        }
      }
    } catch (e) {}

    // 3. Inventory Transactions History
    const recentTransactions = await inventoryRepository.getRecentTransactionsByProduct(productId, 15);

    const stock = parseInt(product.stock_quantity, 10) || 0;
    const reserved = parseInt(product.reserved_quantity, 10) || 0;
    const available = Math.max(0, stock - reserved);
    const costPrice = parseFloat(product.cost_price || 0);
    const sellingPrice = parseFloat(product.selling_price || 0);

    const leadTime = parseInt(dealer.average_lead_time_days, 10) || 3;
    const safetyStock = product.safety_stock || 5;
    const targetDays = product.target_stock_days || 14;

    const vel30 = parseFloat((sales30 / 30).toFixed(2));
    const daysRemaining = vel30 > 0 ? Math.round(available / vel30) : null;
    const reorderPoint = Math.ceil(vel30 * leadTime + safetyStock);
    const recommendedReorder = Math.max(0, Math.round(vel30 * targetDays - available));

    return {
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        description: product.description,
        costPrice,
        sellingPrice,
        stockQuantity: stock,
        reservedQuantity: reserved,
        availableStock: available,
        inventoryValue: parseFloat((available * costPrice).toFixed(2)),
        lowStockThreshold: product.low_stock_threshold || 10,
        reorderLevel: product.reorder_level || 15,
        reorderPoint,
        recommendedReorder,
        safetyStock,
        targetStockDays: targetDays,
        status: product.status,
        images: product.images || [],
      },
      dealer: {
        id: product.dealer_id,
        name: dealer.company_name,
        email: dealer.email,
        phone: dealer.phone,
        leadTimeDays: leadTime,
      },
      analytics: {
        sales7Days: sales7,
        sales14Days: sales14,
        sales30Days: sales30,
        sales90Days: sales90,
        velocity7d: parseFloat((sales7 / 7).toFixed(2)),
        velocity30d: vel30,
        velocity90d: parseFloat((sales90 / 90).toFixed(2)),
        daysRemaining,
        reorderRecommended: available <= reorderPoint || available <= (product.low_stock_threshold || 10),
        estimatedStockoutDate:
          daysRemaining !== null
            ? new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : null,
      },
      salesTrend: dailyTimeline,
      recentTransactions,
    };
  },

  /**
   * 4. Get Traceable Stock Movement Transactions Ledger
   */
  async getTransactions(query = {}, user) {
    const { business_id, product_id, dealer_id, transaction_type, startDate, endDate, page = 1, limit = 20 } = query;
    const { offset, limit: limitNum, page: pageNum } = getPaginationParams({ page, limit });

    const where = {};
    if (business_id && business_id !== 'all') where.business_id = business_id;
    if (product_id) where.product_id = product_id;
    if (dealer_id) where.dealer_id = dealer_id;
    if (transaction_type && transaction_type !== 'ALL') where.transaction_type = transaction_type;
    if (startDate && endDate) {
      where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    if (user && user.role === 'DEALER') {
      const dealerIds = await resolveDealerIds(user);
      where.dealer_id = { [Op.in]: dealerIds };
    }

    const { total, transactions } = await inventoryRepository.findTransactions(where, offset, limitNum);

    return {
      transactions,
      pagination: formatPagination(pageNum, limitNum, total),
    };
  },

  /**
   * 5. Manual Stock Adjustment with Atomic Transaction & Audit History
   */
  async adjustStock(data, user) {
    const { product_id, quantity, transaction_type, reason, notes } = data;
    const prodDb = getSequelize(env.DB.PRODUCT_NAME);

    const result = await prodDb.transaction(async (t) => {
      const product = await inventoryRepository.findProductById(product_id, t);
      if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
      }

      if (user && user.role === 'DEALER') {
        const dealerIds = await resolveDealerIds(user);
        if (!dealerIds.includes(product.dealer_id)) {
          const error = new Error('Access denied to update stock for this product');
          error.statusCode = 403;
          throw error;
        }
      }

      const prevStock = parseInt(product.stock_quantity, 10) || 0;
      const qtyChange = parseInt(quantity, 10);
      const newStock = prevStock + qtyChange;

      if (newStock < 0) {
        const error = new Error(`Cannot adjust stock below zero. Current: ${prevStock}, requested change: ${qtyChange}`);
        error.statusCode = 400;
        throw error;
      }

      const newStatus = newStock === 0 ? 'OUT_OF_STOCK' : 'ACTIVE';

      await product.update({ stock_quantity: newStock, status: newStatus }, { transaction: t });

      const auditTx = await inventoryRepository.createTransaction(
        {
          business_id: product.business_id,
          product_id: product.id,
          dealer_id: product.dealer_id,
          transaction_type: transaction_type || 'ADJUSTMENT',
          quantity: qtyChange,
          previous_quantity: prevStock,
          new_quantity: newStock,
          reason,
          notes,
          created_by: user?.id,
        },
        t
      );

      // Sync unified database if present
      try {
        const mgmtDb = getSequelize(env.DB.NAME);
        if (mgmtDb) {
          await mgmtDb.query(
            'UPDATE products SET stock_quantity = :newStock, status = :newStatus, updated_at = NOW() WHERE id = :productId',
            { replacements: { newStock, newStatus, productId: product.id } }
          );
        }
      } catch (e) {}

      return { product, transaction: auditTx };
    });

    // Invalidate caches
    await CacheService.delByPattern('products:*');
    await CacheService.delByPattern('inventory:*');
    await CacheService.delByPattern('analytics:*');
    await CacheService.delByPattern('finances:*');

    return result;
  },

  /**
   * 6. Stock In (Supplier Inflow Receipt)
   */
  async stockIn(data, user) {
    const { product_id, dealer_id, quantity, reference, notes } = data;
    const prodDb = getSequelize(env.DB.PRODUCT_NAME);

    const qtyIn = parseInt(quantity, 10);
    if (qtyIn <= 0) {
      const error = new Error('Stock-in quantity must be a positive integer');
      error.statusCode = 400;
      throw error;
    }

    const result = await prodDb.transaction(async (t) => {
      const product = await inventoryRepository.findProductById(product_id, t);
      if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
      }

      const prevStock = parseInt(product.stock_quantity, 10) || 0;
      const newStock = prevStock + qtyIn;
      const newStatus = newStock > 0 && product.status === 'OUT_OF_STOCK' ? 'ACTIVE' : product.status;

      await product.update({ stock_quantity: newStock, status: newStatus }, { transaction: t });

      const auditTx = await inventoryRepository.createTransaction(
        {
          business_id: product.business_id,
          product_id: product.id,
          dealer_id: dealer_id || product.dealer_id,
          transaction_type: 'STOCK_IN',
          quantity: qtyIn,
          previous_quantity: prevStock,
          new_quantity: newStock,
          reason: 'Supplier Stock-In Inflow Receipt',
          reference: reference || `STOCKIN-${Date.now()}`,
          notes,
          created_by: user?.id,
        },
        t
      );

      // Sync unified database
      try {
        const mgmtDb = getSequelize(env.DB.NAME);
        if (mgmtDb) {
          await mgmtDb.query(
            'UPDATE products SET stock_quantity = :newStock, status = :newStatus, updated_at = NOW() WHERE id = :productId',
            { replacements: { newStock, newStatus, productId: product.id } }
          );
        }
      } catch (e) {}

      return { product, transaction: auditTx };
    });

    // Invalidate caches
    await CacheService.delByPattern('products:*');
    await CacheService.delByPattern('inventory:*');
    await CacheService.delByPattern('analytics:*');
    await CacheService.delByPattern('finances:*');

    return result;
  },

  /**
   * 7. Daily Inventory Movement Trend Timeline
   */
  async getMovementTrend(query = {}) {
    const { business_id, days = 30 } = query;
    const daysInt = parseInt(days, 10) || 30;

    const transactions = await inventoryRepository.getDailyMovementTrend(business_id, daysInt);

    const now = new Date();
    const dailyMap = new Map();

    for (let i = daysInt - 1; i >= 0; i--) {
      const dt = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      dailyMap.set(dt, {
        date: dt,
        stockIn: 0,
        stockOut: 0,
        returns: 0,
        adjustments: 0,
        netChange: 0,
      });
    }

    for (const tx of transactions) {
      const dt = tx.created_at ? tx.created_at.toISOString().split('T')[0] : '';
      if (dailyMap.has(dt)) {
        const bucket = dailyMap.get(dt);
        const qty = parseInt(tx.quantity, 10) || 0;

        if (tx.transaction_type === 'STOCK_IN') {
          bucket.stockIn += Math.abs(qty);
        } else if (tx.transaction_type === 'STOCK_OUT' || tx.transaction_type === 'ORDER_RESERVED') {
          bucket.stockOut += Math.abs(qty);
        } else if (tx.transaction_type === 'RETURN_RECEIVED') {
          bucket.returns += Math.abs(qty);
        } else {
          bucket.adjustments += qty;
        }
        bucket.netChange += qty;
      }
    }

    return Array.from(dailyMap.values());
  },
};
