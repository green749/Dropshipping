import { Product, InventoryTransaction, ProductResearch } from '../models/index.js';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';
import { CacheService } from '../../shared/services/cache.service.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';
import { resolveDealerIds } from '../../shared/services/dealerResolver.service.js';
import { runWorkerTask } from '../../shared/workers/workerPool.js';
import { Op, QueryTypes } from 'sequelize';

const GATEWAY_FEE_PERCENT = 2.0;

/**
 * Resolve timeframe to start date, end date, and number of days
 */
export const resolveTimeframe = (timeframe = '30d', customStart = null, customEnd = null) => {
  const now = new Date();
  const end = customEnd ? new Date(customEnd) : new Date();
  end.setHours(23, 59, 59, 999);

  let start = new Date();
  let days = 30;

  switch (timeframe) {
    case '7d':
      days = 7;
      start.setDate(now.getDate() - 7);
      break;
    case '14d':
      days = 14;
      start.setDate(now.getDate() - 14);
      break;
    case '30d':
      days = 30;
      start.setDate(now.getDate() - 30);
      break;
    case '60d':
      days = 60;
      start.setDate(now.getDate() - 60);
      break;
    case '90d':
      days = 90;
      start.setDate(now.getDate() - 90);
      break;
    case 'custom':
      if (customStart) {
        start = new Date(customStart);
        const diffMs = Math.abs(end.getTime() - start.getTime());
        days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      } else {
        days = 30;
        start.setDate(now.getDate() - 30);
      }
      break;
    default:
      days = 30;
      start.setDate(now.getDate() - 30);
  }

  start.setHours(0, 0, 0, 0);

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    startDateTime: start,
    endDateTime: end,
    days,
  };
};

export const productIntelligenceService = {
  /**
   * 1. Get Product Intelligence Summary KPIs
   */
  async getIntelligenceSummary(query = {}, user) {
    const { timeframe = '30d', startDate, endDate, business_id } = query;
    const dateRange = resolveTimeframe(timeframe, startDate, endDate);
    const targetBusinessId = business_id && business_id !== 'all' ? business_id : user?.business_id || null;

    const cacheKey = CacheService.generateKey('product-intelligence:summary', {
      targetBusinessId: targetBusinessId || 'all',
      userRole: user?.role,
      userId: user?.role === 'DEALER' ? user.id : 'all',
      timeframe,
      start: dateRange.startDate,
      end: dateRange.endDate,
    });

    const { data } = await CacheService.remember(cacheKey, 60, async () => {
      // 1. Fetch products
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
          'status',
          'dealer_id',
          'business_id',
        ],
      });

      // 2. Fetch sales from Order DB
      const orderDb = getSequelize(env.DB.ORDER_NAME) || getSequelize(env.DB.NAME);
      const salesMap = new Map();
      const returnMap = new Map();
      const rtoMap = new Map();

      if (orderDb) {
        try {
          const salesQuery = `
            SELECT oi.product_id, 
                   COUNT(DISTINCT o.id) as orders_count, 
                   SUM(oi.quantity) as units_sold, 
                   SUM(oi.total_price) as revenue
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.status NOT IN ('CANCELLED') 
              AND o.created_at BETWEEN :start AND :end
              ${targetBusinessId ? 'AND o.business_id = :businessId' : ''}
            GROUP BY oi.product_id
          `;
          const salesRows = await orderDb.query(salesQuery, {
            type: QueryTypes.SELECT,
            replacements: {
              start: dateRange.startDateTime,
              end: dateRange.endDateTime,
              businessId: targetBusinessId,
            },
          });

          for (const row of salesRows) {
            salesMap.set(row.product_id, {
              ordersCount: parseInt(row.orders_count, 10) || 0,
              unitsSold: parseInt(row.units_sold, 10) || 0,
              revenue: parseFloat(row.revenue) || 0,
            });
          }

          // Return metrics
          const returnQuery = `
            SELECT r.product_id, 
                   COUNT(r.id) as return_count, 
                   SUM(r.refund_amount) as refund_total,
                   SUM(CASE WHEN r.status = 'RTO' OR r.reason ILIKE '%rto%' OR r.reason ILIKE '%undelivered%' THEN 1 ELSE 0 END) as rto_count
            FROM returns r
            WHERE r.created_at BETWEEN :start AND :end
              ${targetBusinessId ? 'AND r.business_id = :businessId' : ''}
            GROUP BY r.product_id
          `;
          const returnRows = await orderDb.query(returnQuery, {
            type: QueryTypes.SELECT,
            replacements: {
              start: dateRange.startDateTime,
              end: dateRange.endDateTime,
              businessId: targetBusinessId,
            },
          });

          for (const row of returnRows) {
            returnMap.set(row.product_id, {
              returnCount: parseInt(row.return_count, 10) || 0,
              refundTotal: parseFloat(row.refund_total) || 0,
            });
            rtoMap.set(row.product_id, parseInt(row.rto_count, 10) || 0);
          }
        } catch (err) {
          console.warn('Could not query order DB for intelligence summary:', err.message);
        }
      }

      let totalProducts = products.length;
      let activeProducts = 0;
      let productsWithSales = 0;
      let productsWithNoSales = 0;
      let lowStockProducts = 0;
      let outOfStockProducts = 0;
      let highReturnProducts = 0;
      let highRtoProducts = 0;
      let profitableProducts = 0;
      let lossMakingProducts = 0;

      let totalRevenue = 0;
      let totalNetProfit = 0;

      for (const p of products) {
        if (p.status === 'ACTIVE') activeProducts++;

        const stock = parseInt(p.stock_quantity, 10) || 0;
        const reserved = parseInt(p.reserved_quantity, 10) || 0;
        const available = Math.max(0, stock - reserved);
        const reorderLevel = parseInt(p.reorder_level, 10) || parseInt(p.low_stock_threshold, 10) || 15;

        if (available <= 0) {
          outOfStockProducts++;
        } else if (available <= reorderLevel) {
          lowStockProducts++;
        }

        const sales = salesMap.get(p.id) || { ordersCount: 0, unitsSold: 0, revenue: 0 };
        const ret = returnMap.get(p.id) || { returnCount: 0, refundTotal: 0 };
        const rtoCount = rtoMap.get(p.id) || 0;

        if (sales.unitsSold > 0) {
          productsWithSales++;
        } else {
          productsWithNoSales++;
        }

        // Return rate & RTO rate
        const returnRate = sales.unitsSold > 0 ? (ret.returnCount / sales.unitsSold) * 100 : 0;
        const rtoRate = sales.ordersCount > 0 ? (rtoCount / sales.ordersCount) * 100 : 0;

        if (returnRate > 15 && ret.returnCount >= 1) highReturnProducts++;
        if (rtoRate > 10 && rtoCount >= 1) highRtoProducts++;

        // Profit calculations
        const costPrice = parseFloat(p.cost_price) || 0;
        const cogs = sales.unitsSold * costPrice;
        const gatewayFee = (sales.revenue * GATEWAY_FEE_PERCENT) / 100;
        const shippingAllocated = sales.ordersCount * 5.0; // standard $5 / order
        const returnCost = ret.refundTotal + (ret.returnCount * 8.0);
        const marketingAllocated = sales.revenue * 0.12; // 12% marketing overhead attribution

        const netProfit = sales.revenue - (cogs + gatewayFee + shippingAllocated + returnCost + marketingAllocated);

        if (sales.revenue > 0) {
          if (netProfit > 0) profitableProducts++;
          else if (netProfit < 0) lossMakingProducts++;
        }

        totalRevenue += sales.revenue;
        totalNetProfit += netProfit;
      }

      const avgMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

      return {
        totalProducts,
        activeProducts,
        productsWithSales,
        productsWithNoSales,
        lowStockProducts,
        outOfStockProducts,
        highReturnProducts,
        highRtoProducts,
        profitableProducts,
        lossMakingProducts,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalNetProfit: parseFloat(totalNetProfit.toFixed(2)),
        averageMarginPercent: parseFloat(avgMargin.toFixed(1)),
        timeframe,
        periodDays: dateRange.days,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
    });

    return data;
  },

  /**
   * 2. Get Product Intelligence List / Opportunity Matrix
   */
  async getIntelligenceList(query = {}, user) {
    const { page, limit, offset } = getPaginationParams(query);
    const {
      search,
      category,
      dealer_id,
      status,
      stock_status,
      profitability,
      classification,
      timeframe = '30d',
      startDate,
      endDate,
      business_id,
      sortBy = 'revenue',
      sortOrder = 'DESC',
    } = query;

    const dateRange = resolveTimeframe(timeframe, startDate, endDate);
    const targetBusinessId = business_id && business_id !== 'all' ? business_id : user?.business_id || null;

    const cacheKey = CacheService.generateKey('product-intelligence:list', {
      targetBusinessId: targetBusinessId || 'all',
      userRole: user?.role,
      userId: user?.role === 'DEALER' ? user.id : 'all',
      timeframe,
      start: dateRange.startDate,
      end: dateRange.endDate,
      page,
      limit,
      search: search || '',
      category: category || '',
      dealer_id: dealer_id || '',
      status: status || '',
      stock_status: stock_status || '',
      profitability: profitability || '',
      classification: classification || '',
      sortBy,
      sortOrder,
    });

    const { data } = await CacheService.remember(cacheKey, 60, async () => {
      // 1. Query Products
      const productWhere = {};
      if (targetBusinessId) productWhere.business_id = targetBusinessId;
      if (category && category !== 'ALL') productWhere.category = category;
      if (dealer_id && dealer_id !== 'ALL') productWhere.dealer_id = dealer_id;
      if (status && status !== 'ALL') productWhere.status = status;

      if (user && user.role === 'DEALER') {
        const dealerIds = await resolveDealerIds(user);
        productWhere.dealer_id = { [Op.in]: dealerIds };
      }

      if (search && search.trim()) {
        const s = `%${search.trim()}%`;
        productWhere[Op.or] = [
          { name: { [Op.iLike]: s } },
          { sku: { [Op.iLike]: s } },
          { category: { [Op.iLike]: s } },
        ];
      }

      const products = await Product.findAll({
        where: productWhere,
        order: [['created_at', 'DESC']],
      });

      // 2. Fetch Dealers map from Business DB
      const businessDb = getSequelize(env.DB.BUSINESS_NAME) || getSequelize(env.DB.NAME);
      const dealerMap = new Map();
      if (businessDb) {
        try {
          const dealers = await businessDb.query(
            'SELECT id, company_name, contact_name, email, phone, average_lead_time_days, dispatch_sla_hours, fulfillment_sla_hours, status FROM dealers',
            { type: QueryTypes.SELECT }
          );
          for (const d of dealers) {
            dealerMap.set(d.id, {
              id: d.id,
              name: d.company_name || d.contact_name || 'Authorized Supplier',
              email: d.email,
              leadTimeDays: d.average_lead_time_days || 3,
              fulfillmentRate: 98.5,
              status: d.status,
            });
          }
        } catch (err) {
          console.warn('Could not query dealers table:', err.message);
        }
      }

      // 3. Fetch Sales & Returns from Order DB
      const orderDb = getSequelize(env.DB.ORDER_NAME) || getSequelize(env.DB.NAME);
      const salesMap = new Map();
      const returnMap = new Map();
      const rtoMap = new Map();

      if (orderDb) {
        try {
          const salesQuery = `
            SELECT oi.product_id, 
                   COUNT(DISTINCT o.id) as orders_count, 
                   SUM(oi.quantity) as units_sold, 
                   SUM(oi.total_price) as revenue
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.status NOT IN ('CANCELLED') 
              AND o.created_at BETWEEN :start AND :end
              ${targetBusinessId ? 'AND o.business_id = :businessId' : ''}
            GROUP BY oi.product_id
          `;
          const salesRows = await orderDb.query(salesQuery, {
            type: QueryTypes.SELECT,
            replacements: {
              start: dateRange.startDateTime,
              end: dateRange.endDateTime,
              businessId: targetBusinessId,
            },
          });

          for (const row of salesRows) {
            salesMap.set(row.product_id, {
              ordersCount: parseInt(row.orders_count, 10) || 0,
              unitsSold: parseInt(row.units_sold, 10) || 0,
              revenue: parseFloat(row.revenue) || 0,
            });
          }

          const returnQuery = `
            SELECT r.product_id, 
                   COUNT(r.id) as return_count, 
                   SUM(r.refund_amount) as refund_total,
                   SUM(CASE WHEN r.status = 'RTO' OR r.reason ILIKE '%rto%' OR r.reason ILIKE '%undelivered%' THEN 1 ELSE 0 END) as rto_count
            FROM returns r
            WHERE r.created_at BETWEEN :start AND :end
              ${targetBusinessId ? 'AND r.business_id = :businessId' : ''}
            GROUP BY r.product_id
          `;
          const returnRows = await orderDb.query(returnQuery, {
            type: QueryTypes.SELECT,
            replacements: {
              start: dateRange.startDateTime,
              end: dateRange.endDateTime,
              businessId: targetBusinessId,
            },
          });

          for (const row of returnRows) {
            returnMap.set(row.product_id, {
              returnCount: parseInt(row.return_count, 10) || 0,
              refundTotal: parseFloat(row.refund_total) || 0,
            });
            rtoMap.set(row.product_id, parseInt(row.rto_count, 10) || 0);
          }
        } catch (err) {
          console.warn('Could not query order DB for intelligence list:', err.message);
        }
      }

      // 4. Compute Opportunity Matrix Records
      let results = [];

      for (const p of products) {
        const plain = p.toJSON ? p.toJSON() : p;
        const stock = parseInt(plain.stock_quantity, 10) || 0;
        const reserved = parseInt(plain.reserved_quantity, 10) || 0;
        const available = Math.max(0, stock - reserved);
        const costPrice = parseFloat(plain.cost_price) || 0;
        const sellingPrice = parseFloat(plain.selling_price) || 0;
        const reorderLevel = parseInt(plain.reorder_level, 10) || parseInt(plain.low_stock_threshold, 10) || 15;
        const targetDays = parseInt(plain.target_stock_days, 10) || 14;

        const sales = salesMap.get(plain.id) || { ordersCount: 0, unitsSold: 0, revenue: 0 };
        const ret = returnMap.get(plain.id) || { returnCount: 0, refundTotal: 0 };
        const rtoCount = rtoMap.get(plain.id) || 0;

        // Sales Velocity (units sold / period days)
        const salesVelocity = parseFloat((sales.unitsSold / dateRange.days).toFixed(2));
        const daysOfStock = salesVelocity > 0 ? Math.round(available / salesVelocity) : (available > 0 ? 999 : 0);

        // Return & RTO rates
        const returnRate = sales.unitsSold > 0 ? parseFloat(((ret.returnCount / sales.unitsSold) * 100).toFixed(1)) : 0;
        const rtoRate = sales.ordersCount > 0 ? parseFloat(((rtoCount / sales.ordersCount) * 100).toFixed(1)) : 0;

        // Profitability
        const cogs = sales.unitsSold * costPrice;
        const grossProfit = sales.revenue - cogs;
        const gatewayFee = (sales.revenue * GATEWAY_FEE_PERCENT) / 100;
        const shippingCost = sales.ordersCount * 5.0;
        const returnCosts = ret.refundTotal + (ret.returnCount * 8.0);
        const marketingAllocated = sales.revenue * 0.12;

        const netProfit = sales.revenue - (cogs + gatewayFee + shippingCost + returnCosts + marketingAllocated);
        const profitMargin = sales.revenue > 0 ? parseFloat(((netProfit / sales.revenue) * 100).toFixed(1)) : 0;

        // Factual Classifications
        const classifications = [];
        if (salesVelocity >= 1.5) classifications.push('HIGH_DEMAND');
        else if (salesVelocity > 0 && salesVelocity < 0.3) classifications.push('LOW_DEMAND');
        else if (sales.unitsSold === 0) classifications.push('NO_SALES');

        if (salesVelocity >= 2.0) classifications.push('FAST_MOVING');
        if (salesVelocity < 0.2 && available > 0) classifications.push('SLOW_MOVING');

        if (available <= 0) classifications.push('OUT_OF_STOCK');
        else if (available <= reorderLevel) classifications.push('LOW_STOCK');
        else if (daysOfStock > 60 || (available > 100 && salesVelocity < 0.5)) classifications.push('OVERSTOCKED');

        if (sales.revenue > 0) {
          if (netProfit > 0) classifications.push('PROFITABLE');
          else if (netProfit < 0) classifications.push('LOSS_MAKING');
        }

        if (returnRate > 15 && ret.returnCount >= 1) classifications.push('HIGH_RETURN');
        if (rtoRate > 10 && rtoCount >= 1) classifications.push('HIGH_RTO');

        const dealerInfo = dealerMap.get(plain.dealer_id) || {
          id: plain.dealer_id,
          name: 'Primary Supplier',
          leadTimeDays: 2,
          fulfillmentRate: 98.0,
        };

        const item = {
          id: plain.id,
          name: plain.name,
          sku: plain.sku,
          category: plain.category,
          images: Array.isArray(plain.images) ? plain.images : [],
          status: plain.status,
          business_id: plain.business_id,
          dealer_id: plain.dealer_id,
          dealer: dealerInfo,
          selling_price: sellingPrice,
          cost_price: costPrice,
          stock_quantity: stock,
          reserved_quantity: reserved,
          available_stock: available,
          low_stock_threshold: plain.low_stock_threshold,
          reorder_level: reorderLevel,
          target_stock_days: targetDays,
          orders_count: sales.ordersCount,
          units_sold: sales.unitsSold,
          revenue: parseFloat(sales.revenue.toFixed(2)),
          cogs: parseFloat(cogs.toFixed(2)),
          gross_profit: parseFloat(grossProfit.toFixed(2)),
          net_profit: parseFloat(netProfit.toFixed(2)),
          profit_margin: profitMargin,
          profit_margin_percent: profitMargin,
          return_count: ret.returnCount,
          return_rate: returnRate,
          rto_count: rtoCount,
          rto_rate: rtoRate,
          sales_velocity: salesVelocity,
          days_of_stock: daysOfStock,
          classifications,
        };

        // Post-filters
        if (stock_status) {
          if (stock_status === 'IN_STOCK' && available <= 0) continue;
          if (stock_status === 'LOW_STOCK' && (available <= 0 || available > reorderLevel)) continue;
          if (stock_status === 'OUT_OF_STOCK' && available > 0) continue;
          if (stock_status === 'OVERSTOCKED' && !classifications.includes('OVERSTOCKED')) continue;
        }

        if (profitability) {
          if (profitability === 'PROFITABLE' && netProfit <= 0) continue;
          if (profitability === 'LOSS_MAKING' && netProfit >= 0) continue;
          if (profitability === 'NO_SALES' && sales.unitsSold > 0) continue;
        }

        if (classification && classification !== 'ALL') {
          if (!classifications.includes(classification)) continue;
        }

        results.push(item);
      }

      // 5. Dynamic In-Memory Sorting
      const validSort = sortBy || 'revenue';
      const isAsc = sortOrder?.toUpperCase() === 'ASC';

      results.sort((a, b) => {
        let valA = a[validSort] !== undefined ? a[validSort] : 0;
        let valB = b[validSort] !== undefined ? b[validSort] : 0;

        if (typeof valA === 'string') {
          return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return isAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      });

      const total = results.length;
      const paginatedItems = results.slice(offset, offset + limit);

      return {
        items: paginatedItems,
        total,
        timeframe,
        periodDays: dateRange.days,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
    });

    const pagination = formatPagination(page, limit, data.total);

    return {
      items: data.items,
      pagination,
      timeframe: data.timeframe,
      periodDays: data.periodDays,
      startDate: data.startDate,
      endDate: data.endDate,
    };
  },

  /**
   * 3. Get Deep Drilldown Analytics for a Single Product
   */
  async getProductDetailIntelligence(productId, query = {}, user) {
    const { timeframe = '30d', startDate, endDate } = query;
    const dateRange = resolveTimeframe(timeframe, startDate, endDate);

    const product = await Product.findByPk(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (user?.role === 'DEALER') {
      const dealerIds = await resolveDealerIds(user);
      if (!dealerIds.includes(product.dealer_id)) {
        const error = new Error('Unauthorized: You do not have access to this product');
        error.statusCode = 403;
        throw error;
      }
    }

    const cacheKey = CacheService.generateKey('product-intelligence:detail', {
      productId,
      timeframe,
      start: dateRange.startDate,
      end: dateRange.endDate,
    });

    const { data } = await CacheService.remember(cacheKey, 60, async () => {
      const plainProduct = product.toJSON ? product.toJSON() : product;
      const stock = parseInt(plainProduct.stock_quantity, 10) || 0;
      const reserved = parseInt(plainProduct.reserved_quantity, 10) || 0;
      const available = Math.max(0, stock - reserved);
      const costPrice = parseFloat(plainProduct.cost_price) || 0;
      const sellingPrice = parseFloat(plainProduct.selling_price) || 0;
      const reorderLevel = parseInt(plainProduct.reorder_level, 10) || 15;
      const safetyStock = parseInt(plainProduct.safety_stock, 10) || 5;
      const targetStockDays = parseInt(plainProduct.target_stock_days, 10) || 14;

      // ─── 1. Daily Sales Trend & Orders from Order DB ───
      const orderDb = getSequelize(env.DB.ORDER_NAME) || getSequelize(env.DB.NAME);
      let salesTrend = [];
      let totalUnitsSold = 0;
      let totalRevenue = 0;
      let totalOrdersCount = 0;
      let recentOrders = [];

      if (orderDb) {
        try {
          const trendQuery = `
            SELECT DATE(o.created_at) as date,
                   COUNT(DISTINCT o.id) as orders,
                   SUM(oi.quantity) as units,
                   SUM(oi.total_price) as revenue
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE oi.product_id = :productId
              AND o.status NOT IN ('CANCELLED')
              AND o.created_at BETWEEN :start AND :end
            GROUP BY DATE(o.created_at)
            ORDER BY DATE(o.created_at) ASC
          `;
          const [trendRows] = await orderDb.query(trendQuery, {
            replacements: {
              productId,
              start: dateRange.startDateTime,
              end: dateRange.endDateTime,
            },
          });

          const trendMap = new Map();
          for (const row of trendRows) {
            const units = parseInt(row.units, 10) || 0;
            const rev = parseFloat(row.revenue) || 0;
            const cogs = units * costPrice;
            const profit = rev - cogs - (rev * 0.02) - (parseInt(row.orders, 10) * 5.0);

            trendMap.set(row.date, {
              date: row.date,
              orders: parseInt(row.orders, 10) || 0,
              units,
              revenue: parseFloat(rev.toFixed(2)),
              profit: parseFloat(profit.toFixed(2)),
            });

            totalUnitsSold += units;
            totalRevenue += rev;
            totalOrdersCount += parseInt(row.orders, 10) || 0;
          }

          // Build continuous date array
          const cursor = new Date(dateRange.startDateTime);
          while (cursor <= dateRange.endDateTime) {
            const dateStr = cursor.toISOString().split('T')[0];
            salesTrend.push(
              trendMap.get(dateStr) || {
                date: dateStr,
                orders: 0,
                units: 0,
                revenue: 0,
                profit: 0,
              }
            );
            cursor.setDate(cursor.getDate() + 1);
          }

          // Fetch recent 5 order items for this product
          const orderRows = await orderDb.query(
            `SELECT o.id, o.order_number, o.created_at, o.status, o.total_amount, oi.quantity, oi.total_price, o.customer_id
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             WHERE oi.product_id = :productId
             ORDER BY o.created_at DESC
             LIMIT 5`,
            { type: QueryTypes.SELECT, replacements: { productId } }
          );
          recentOrders = orderRows;
        } catch (err) {
          console.warn('Could not query sales trend from order DB:', err.message);
        }
      }

      // ─── 2. Returns & RTO from Order DB ───
      let returnReasons = [];
      let totalReturnsCount = 0;
      let totalRefundAmount = 0;
      let totalRtoCount = 0;

      if (orderDb) {
        try {
          const returnRows = await orderDb.query(
            `SELECT reason, status, refund_amount, created_at
             FROM returns
             WHERE product_id = :productId
             ORDER BY created_at DESC`,
            { type: QueryTypes.SELECT, replacements: { productId } }
          );

          totalReturnsCount = returnRows.length;
          const reasonMap = new Map();

          for (const r of returnRows) {
            totalRefundAmount += parseFloat(r.refund_amount) || 0;
            if (r.status === 'RTO' || (r.reason && (r.reason.toLowerCase().includes('rto') || r.reason.toLowerCase().includes('undelivered')))) {
              totalRtoCount++;
            }
            const rKey = r.reason || 'General / Customer Preference';
            reasonMap.set(rKey, (reasonMap.get(rKey) || 0) + 1);
          }

          returnReasons = Array.from(reasonMap.entries()).map(([reason, count]) => ({
            reason,
            count,
            percentage: totalReturnsCount > 0 ? parseFloat(((count / totalReturnsCount) * 100).toFixed(1)) : 0,
          }));
        } catch (err) {
          console.warn('Could not query returns from order DB:', err.message);
        }
      }

      // ─── 3. Inventory Transactions History ───
      let stockTransactions = [];
      try {
        stockTransactions = await InventoryTransaction.findAll({
          where: { product_id: productId },
          order: [['created_at', 'DESC']],
          limit: 10,
        });
      } catch (err) {
        console.warn('Could not query stock transactions:', err.message);
      }

      // ─── 4. Velocity & Inventory Calculations ───
      const salesVelocity = parseFloat((totalUnitsSold / dateRange.days).toFixed(2));
      const daysOfStock = salesVelocity > 0 ? Math.round(available / salesVelocity) : (available > 0 ? 999 : 0);
      const reorderPoint = Math.round(salesVelocity * 3 + safetyStock); // 3 day lead time + safety stock
      const recommendedReorderQty = Math.max(0, Math.round(salesVelocity * targetStockDays - available));

      // ─── 5. Centralized Profit Breakdown ───
      const cogs = totalUnitsSold * costPrice;
      const grossProfit = totalRevenue - cogs;
      const gatewayFee = (totalRevenue * GATEWAY_FEE_PERCENT) / 100;
      const shippingCost = totalOrdersCount * 5.0;
      const returnCost = totalRefundAmount + (totalReturnsCount * 8.0);
      const marketingCost = totalRevenue * 0.12;
      const netProfit = totalRevenue - (cogs + gatewayFee + shippingCost + returnCost + marketingCost);
      const profitMargin = totalRevenue > 0 ? parseFloat(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;

      // ─── 6. Dealer Information & Multi-Dealer Supplier Comparison ───
      const businessDb = getSequelize(env.DB.BUSINESS_NAME) || getSequelize(env.DB.NAME);
      let assignedDealer = null;
      let availableSuppliers = [];

      if (businessDb) {
        try {
          const dealers = await businessDb.query(
            'SELECT id, company_name, contact_name, email, phone, average_lead_time_days, dispatch_sla_hours, fulfillment_sla_hours, status FROM dealers WHERE status = \'ACTIVE\'',
            { type: QueryTypes.SELECT }
          );

          for (const d of dealers) {
            const isAssigned = d.id === plainProduct.dealer_id;
            const supplierRecord = {
              id: d.id,
              name: d.company_name || d.contact_name || 'Authorized Supplier',
              contactName: d.contact_name,
              email: d.email,
              phone: d.phone,
              leadTimeDays: d.average_lead_time_days || 3,
              fulfillmentRate: 98.0,
              costPrice: isAssigned ? costPrice : parseFloat((costPrice * 0.95).toFixed(2)), // comparative benchmark
              shippingEstimate: 5.0,
              totalFulfillmentCost: parseFloat(((isAssigned ? costPrice : costPrice * 0.95) + 5.0).toFixed(2)),
              estimatedMargin: sellingPrice > 0 ? parseFloat((((sellingPrice - (isAssigned ? costPrice : costPrice * 0.95) - 5.0) / sellingPrice) * 100).toFixed(1)) : 0,
              isCurrentSupplier: isAssigned,
              status: d.status,
            };

            availableSuppliers.push(supplierRecord);
            if (isAssigned) {
              assignedDealer = supplierRecord;
            }
          }
        } catch (err) {
          console.warn('Could not query dealers table for detail:', err.message);
        }
      }

      // ─── 7. Linked Research Item ───
      let linkedResearch = null;
      try {
        linkedResearch = await ProductResearch.findOne({
          where: {
            [Op.or]: [
              { converted_product_id: productId },
              { product_name: { [Op.iLike]: plainProduct.name } },
            ],
          },
        });
      } catch (err) {
        console.warn('Could not query linked research item:', err.message);
      }

      return {
        product: {
          ...plainProduct,
          images: Array.isArray(plainProduct.images) ? plainProduct.images : [],
          available_stock: available,
        },
        sales: {
          ordersCount: totalOrdersCount,
          unitsSold: totalUnitsSold,
          revenue: parseFloat(totalRevenue.toFixed(2)),
          salesVelocity,
          trend: salesTrend,
          recentOrders,
        },
        profitability: {
          revenue: parseFloat(totalRevenue.toFixed(2)),
          cogs: parseFloat(cogs.toFixed(2)),
          grossProfit: parseFloat(grossProfit.toFixed(2)),
          gatewayFee: parseFloat(gatewayFee.toFixed(2)),
          shippingCost: parseFloat(shippingCost.toFixed(2)),
          returnCost: parseFloat(returnCost.toFixed(2)),
          marketingCost: parseFloat(marketingCost.toFixed(2)),
          netProfit: parseFloat(netProfit.toFixed(2)),
          profitMargin,
          waterfall: {
            revenue: parseFloat(totalRevenue.toFixed(2)),
            cogs: parseFloat(cogs.toFixed(2)),
            gatewayFee: parseFloat(gatewayFee.toFixed(2)),
            shippingCost: parseFloat(shippingCost.toFixed(2)),
            returnCost: parseFloat(returnCost.toFixed(2)),
            marketingCost: parseFloat(marketingCost.toFixed(2)),
            netProfit: parseFloat(netProfit.toFixed(2)),
          },
        },
        inventory: {
          stockQuantity: stock,
          reservedQuantity: reserved,
          availableStock: available,
          lowStockThreshold: plainProduct.low_stock_threshold,
          reorderLevel,
          safetyStock,
          targetStockDays,
          salesVelocity,
          daysOfStockRemaining: daysOfStock,
          calculatedReorderPoint: reorderPoint,
          recommendedReorderQuantity: recommendedReorderQty,
          movementHistory: stockTransactions,
        },
        dealer: {
          assigned: assignedDealer,
          primaryDealer: assignedDealer,
          allSuppliers: availableSuppliers,
          allDealers: availableSuppliers,
          costComparison: availableSuppliers,
        },
        returns: {
          returnCount: totalReturnsCount,
          returnRate: totalUnitsSold > 0 ? parseFloat(((totalReturnsCount / totalUnitsSold) * 100).toFixed(1)) : 0,
          rtoCount: totalRtoCount,
          rtoRate: totalOrdersCount > 0 ? parseFloat(((totalRtoCount / totalOrdersCount) * 100).toFixed(1)) : 0,
          refundTotal: parseFloat(totalRefundAmount.toFixed(2)),
          reasonsBreakdown: returnReasons,
        },
        research: linkedResearch
          ? {
              id: linkedResearch.id,
              source: linkedResearch.source,
              notes: linkedResearch.notes,
              tags: linkedResearch.tags,
              targetAudience: linkedResearch.target_audience,
              competitorPrice: linkedResearch.competitor_price,
              status: linkedResearch.status,
            }
          : null,
      };
    });

    return data;
  },

  /**
   * 4. Get Sales Trend Alone
   */
  async getProductSalesTrend(productId, query = {}, user) {
    const detail = await this.getProductDetailIntelligence(productId, query, user);
    return detail.sales;
  },

  /**
   * 5. Get Profitability Alone
   */
  async getProductProfitability(productId, query = {}, user) {
    const detail = await this.getProductDetailIntelligence(productId, query, user);
    return detail.profitability;
  },

  /**
   * 6. Get Dealer Performance Alone
   */
  async getProductDealerPerformance(productId, query = {}, user) {
    const detail = await this.getProductDetailIntelligence(productId, query, user);
    return detail.dealer;
  },
};
