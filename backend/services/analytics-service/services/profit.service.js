import { Order, OrderItem, Product, Return, Expense, Campaign, Ad, Business } from '../models/index.js';
import { Op } from 'sequelize';
import { CacheService } from '../../shared/services/cache.service.js';

const GATEWAY_FEE_PERCENT = 2.0; // 2% standard configurable fee

/**
 * Centralized Profit Engine Helper: Resolve Start & End Date
 */
export const resolveDateRange = (timeframe = '30d', customStart = null, customEnd = null) => {
  const now = new Date();
  const end = customEnd ? new Date(customEnd) : new Date();
  end.setHours(23, 59, 59, 999);

  let start = new Date();

  switch (timeframe) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case '7d':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      start.setHours(0, 0, 0, 0);
      break;
    case 'custom':
      if (customStart) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
      } else {
        start.setDate(now.getDate() - 30);
        start.setHours(0, 0, 0, 0);
      }
      break;
    default:
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    startDateTime: start,
    endDateTime: end,
  };
};

export const profitService = {
  /**
   * 1. Centralized Profit Summary & Time-Series Trend
   */
  async getProfitSummary(query = {}, user) {
    const { timeframe = '30d', startDate, endDate, business_id } = query;
    const dateRange = resolveDateRange(timeframe, startDate, endDate);

    const targetBusinessId = business_id && business_id !== 'all' ? business_id : null;

    const cacheKey = CacheService.generateKey('finances:profit', {
      businessId: targetBusinessId || 'all',
      start: dateRange.startDate,
      end: dateRange.endDate,
      userRole: user?.role,
    });

    const { data } = await CacheService.remember(cacheKey, 60, async () => {
      // ─── Query Conditions ───
      const orderWhere = {
        status: { [Op.notIn]: ['CANCELLED'] },
        created_at: {
          [Op.between]: [dateRange.startDateTime, dateRange.endDateTime],
        },
      };
      if (targetBusinessId) orderWhere.business_id = targetBusinessId;

      const expenseWhere = {
        date: {
          [Op.between]: [dateRange.startDate, dateRange.endDate],
        },
      };
      if (targetBusinessId) expenseWhere.business_id = targetBusinessId;

      const returnWhere = {
        status: { [Op.in]: ['APPROVED', 'RESOLVED', 'REFUNDED'] },
        created_at: {
          [Op.between]: [dateRange.startDateTime, dateRange.endDateTime],
        },
      };
      if (targetBusinessId) returnWhere.business_id = targetBusinessId;

      // ─── Concurrent DB Fetch ───
      const [orders, expenses, returnsList, businessDoc] = await Promise.all([
        Order.findAll({
          where: orderWhere,
          include: [
            {
              model: OrderItem,
              as: 'items',
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'name', 'cost_price', 'selling_price', 'category'],
                },
              ],
            },
          ],
          order: [['created_at', 'ASC']],
        }),
        Expense.findAll({
          where: expenseWhere,
          order: [['date', 'ASC']],
        }),
        Return.findAll({
          where: returnWhere,
        }),
        targetBusinessId ? Business.findByPk(targetBusinessId) : null,
      ]);

      // ─── Aggregate Core Financial Metrics ───
      let totalRevenue = 0;
      let totalProductCost = 0;
      let totalShippingCost = 0;
      let totalDiscount = 0;
      let totalTax = 0;
      let totalOrderGatewayFees = 0;
      const orderItemsTotalCount = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);

      // Track daily buckets for trend chart
      const dailyMap = new Map();

      // Initialize all dates in range with 0 so the chart has a continuous timeline
      const curr = new Date(dateRange.startDateTime);
      while (curr <= dateRange.endDateTime) {
        const dateKey = curr.toISOString().split('T')[0];
        dailyMap.set(dateKey, {
          date: dateKey,
          revenue: 0,
          productCost: 0,
          expenses: 0,
          netProfit: 0,
          ordersCount: 0,
        });
        curr.setDate(curr.getDate() + 1);
      }

      // Process Orders
      for (const order of orders) {
        const orderRev = parseFloat(Number(order.total_amount || 0).toFixed(2));
        const orderShip = parseFloat(Number(order.shipping_fee || 0).toFixed(2));
        const orderDisc = parseFloat(Number(order.discount || 0).toFixed(2));
        const orderTx = parseFloat(Number(order.tax || 0).toFixed(2));

        totalRevenue += orderRev;
        totalShippingCost += orderShip;
        totalDiscount += orderDisc;
        totalTax += orderTx;

        // Payment Gateway Fee (Configurable 2% of transaction volume)
        const gatewayFee = parseFloat(((orderRev * GATEWAY_FEE_PERCENT) / 100).toFixed(2));
        totalOrderGatewayFees += gatewayFee;

        // Product Cost (COGS)
        let orderCost = 0;
        if (order.items && order.items.length > 0) {
          for (const item of order.items) {
            const costPrice = parseFloat(Number(item.product?.cost_price || item.unit_price * 0.4 || 0).toFixed(2));
            const qty = item.quantity || 1;
            orderCost += costPrice * qty;
          }
        }
        totalProductCost += orderCost;

        // Bucket into daily map
        const orderDate = new Date(order.created_at || order.createdAt).toISOString().split('T')[0];
        if (dailyMap.has(orderDate)) {
          const bucket = dailyMap.get(orderDate);
          bucket.revenue += orderRev;
          bucket.productCost += orderCost;
          bucket.ordersCount += 1;
        }
      }

      // Process Operating Expenses
      let totalOperatingExpenses = 0;
      let marketingAdSpend = 0;
      const categoryBreakdown = {};

      for (const exp of expenses) {
        const amt = parseFloat(Number(exp.amount || 0).toFixed(2));
        totalOperatingExpenses += amt;

        if (exp.category === 'Advertising') {
          marketingAdSpend += amt;
        }

        categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + amt;

        const expDate = exp.date;
        if (dailyMap.has(expDate)) {
          const bucket = dailyMap.get(expDate);
          bucket.expenses += amt;
        }
      }

      // Process Refunds & Returns
      let totalRefunds = 0;
      for (const ret of returnsList) {
        totalRefunds += parseFloat(Number(ret.refund_amount || 0).toFixed(2));
      }

      // Final Computations
      const grossProfit = totalRevenue - totalProductCost;
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      const totalDeductions = totalProductCost + totalOperatingExpenses + totalOrderGatewayFees + totalRefunds;
      const netProfit = totalRevenue - totalDeductions;
      const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      const totalOrdersCount = orders.length;
      const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
      const profitPerOrder = totalOrdersCount > 0 ? netProfit / totalOrdersCount : 0;

      // Finalize Daily Net Profit & Format Trend
      const trend = Array.from(dailyMap.values()).map((b) => {
        const dayNet = b.revenue - b.productCost - b.expenses;
        return {
          date: b.date,
          revenue: parseFloat(b.revenue.toFixed(2)),
          productCost: parseFloat(b.productCost.toFixed(2)),
          expenses: parseFloat(b.expenses.toFixed(2)),
          netProfit: parseFloat(dayNet.toFixed(2)),
          ordersCount: b.ordersCount,
        };
      });

      return {
        summary: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalProductCost: parseFloat(totalProductCost.toFixed(2)),
          grossProfit: parseFloat(grossProfit.toFixed(2)),
          grossMargin: parseFloat(grossMargin.toFixed(2)),
          totalExpenses: parseFloat(totalOperatingExpenses.toFixed(2)),
          marketingSpend: parseFloat(marketingAdSpend.toFixed(2)),
          shippingCost: parseFloat(totalShippingCost.toFixed(2)),
          gatewayFees: parseFloat(totalOrderGatewayFees.toFixed(2)),
          refunds: parseFloat(totalRefunds.toFixed(2)),
          discounts: parseFloat(totalDiscount.toFixed(2)),
          taxes: parseFloat(totalTax.toFixed(2)),
          netProfit: parseFloat(netProfit.toFixed(2)),
          profitMargin: parseFloat(netMargin.toFixed(2)),
          totalOrdersCount,
          orderItemsTotalCount,
          averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
          profitPerOrder: parseFloat(profitPerOrder.toFixed(2)),
          gatewayFeePercentage: GATEWAY_FEE_PERCENT,
        },
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          timeframe,
        },
        business: businessDoc ? { id: businessDoc.id, name: businessDoc.name } : { id: 'all', name: 'Consolidated All Storefronts' },
        trend,
        categoryBreakdown: Object.entries(categoryBreakdown).map(([category, amount]) => ({
          category,
          amount: parseFloat(amount.toFixed(2)),
          percentage: totalOperatingExpenses > 0 ? parseFloat(((amount / totalOperatingExpenses) * 100).toFixed(1)) : 0,
        })),
      };
    });

    return data;
  },

  /**
   * 2. Product Profitability Breakdown
   */
  async getProductProfitability(query = {}, user) {
    const { timeframe = '30d', startDate, endDate, business_id, category, dealer_id, search, page = 1, limit = 20 } = query;
    const dateRange = resolveDateRange(timeframe, startDate, endDate);
    const targetBusinessId = business_id && business_id !== 'all' ? business_id : null;

    const cacheKey = CacheService.generateKey('finances:product-profitability', {
      businessId: targetBusinessId || 'all',
      category: category || 'all',
      dealerId: dealer_id || 'all',
      search: search || '',
      start: dateRange.startDate,
      end: dateRange.endDate,
      page,
      limit,
      userRole: user?.role,
    });

    const { data } = await CacheService.remember(cacheKey, 60, async () => {
      // 1. Fetch products matching filters
      const productWhere = {};
      if (category && category !== 'ALL') productWhere.category = category;
      if (dealer_id) productWhere.dealer_id = dealer_id;
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
        attributes: ['id', 'name', 'sku', 'category', 'cost_price', 'selling_price', 'dealer_id', 'stock_quantity'],
      });

      // 2. Fetch all completed order items in date range
      const orderWhere = {
        status: { [Op.notIn]: ['CANCELLED'] },
        created_at: {
          [Op.between]: [dateRange.startDateTime, dateRange.endDateTime],
        },
      };
      if (targetBusinessId) orderWhere.business_id = targetBusinessId;

      const orderItems = await OrderItem.findAll({
        include: [
          {
            model: Order,
            as: 'order',
            where: orderWhere,
            attributes: ['id', 'business_id', 'created_at'],
          },
        ],
      });

      // 3. Fetch returns by product in date range
      const returns = await Return.findAll({
        where: {
          status: { [Op.in]: ['APPROVED', 'RESOLVED', 'REFUNDED'] },
          created_at: {
            [Op.between]: [dateRange.startDateTime, dateRange.endDateTime],
          },
        },
        attributes: ['product_id', 'refund_amount'],
      });

      // Map return refunds by product_id
      const refundByProduct = new Map();
      for (const ret of returns) {
        if (ret.product_id) {
          refundByProduct.set(ret.product_id, (refundByProduct.get(ret.product_id) || 0) + parseFloat(ret.refund_amount || 0));
        }
      }

      // Map sales & volume by product_id
      const statsByProduct = new Map();
      for (const item of orderItems) {
        const pId = item.product_id;
        const current = statsByProduct.get(pId) || { unitsSold: 0, revenue: 0, totalCost: 0 };
        const qty = item.quantity || 1;
        const rev = parseFloat(Number(item.total_price || item.unit_price * qty).toFixed(2));

        current.unitsSold += qty;
        current.revenue += rev;
        statsByProduct.set(pId, current);
      }

      // 4. Compute per-product profitability
      const results = products.map((prod) => {
        const stats = statsByProduct.get(prod.id) || { unitsSold: 0, revenue: 0 };
        const unitsSold = stats.unitsSold;
        const revenue = parseFloat(stats.revenue.toFixed(2));
        const unitCost = parseFloat(Number(prod.cost_price || 0).toFixed(2));
        const totalCost = parseFloat((unitCost * unitsSold).toFixed(2));
        const refunds = parseFloat((refundByProduct.get(prod.id) || 0).toFixed(2));

        const grossProfit = parseFloat((revenue - totalCost).toFixed(2));
        const netProfit = parseFloat((grossProfit - refunds).toFixed(2));
        const margin = revenue > 0 ? parseFloat(((netProfit / revenue) * 100).toFixed(2)) : 0;

        return {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          category: prod.category,
          costPrice: unitCost,
          sellingPrice: parseFloat(Number(prod.selling_price || 0).toFixed(2)),
          stockQuantity: prod.stock_quantity,
          unitsSold,
          revenue,
          productCost: totalCost,
          refunds,
          grossProfit,
          netProfit,
          margin,
          isLowMargin: margin < 20.0,
        };
      });

      // Sort by Net Profit descending
      results.sort((a, b) => b.netProfit - a.netProfit || b.unitsSold - a.unitsSold);

      // Pagination
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const offset = (pageNum - 1) * limitNum;
      const paginatedResults = results.slice(offset, offset + limitNum);

      return {
        products: paginatedResults,
        pagination: {
          total: results.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(results.length / limitNum) || 1,
        },
      };
    });

    return data;
  },

  /**
   * 3. Order Profitability Breakdown
   */
  async getOrderProfitability(orderId, user) {
    const cacheKey = `finances:order:${orderId}`;

    const { data } = await CacheService.remember(cacheKey, 120, async () => {
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'sku', 'cost_price', 'selling_price'],
              },
            ],
          },
          {
            model: Return,
            as: 'returns',
          },
        ],
      });

      if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
      }

      const revenue = parseFloat(Number(order.total_amount || 0).toFixed(2));
      const shipping = parseFloat(Number(order.shipping_fee || 0).toFixed(2));
      const discount = parseFloat(Number(order.discount || 0).toFixed(2));
      const gatewayFee = parseFloat(((revenue * GATEWAY_FEE_PERCENT) / 100).toFixed(2));

      let productCost = 0;
      const itemBreakdown = (order.items || []).map((it) => {
        const unitCost = parseFloat(Number(it.product?.cost_price || it.unit_price * 0.4).toFixed(2));
        const totalItemCost = parseFloat((unitCost * it.quantity).toFixed(2));
        productCost += totalItemCost;

        return {
          productId: it.product_id,
          productName: it.product_name || it.product?.name,
          sku: it.sku,
          quantity: it.quantity,
          unitPrice: parseFloat(Number(it.unit_price || 0).toFixed(2)),
          totalPrice: parseFloat(Number(it.total_price || 0).toFixed(2)),
          unitCost,
          totalCost: totalItemCost,
          profit: parseFloat((Number(it.total_price || 0) - totalItemCost).toFixed(2)),
        };
      });

      let refunds = 0;
      if (order.returns && order.returns.length > 0) {
        for (const ret of order.returns) {
          refunds += parseFloat(Number(ret.refund_amount || 0).toFixed(2));
        }
      }

      const netProfit = parseFloat((revenue - productCost - gatewayFee - refunds).toFixed(2));
      const margin = revenue > 0 ? parseFloat(((netProfit / revenue) * 100).toFixed(2)) : 0;

      return {
        orderId: order.id,
        orderNumber: order.order_number,
        createdAt: order.created_at || order.createdAt,
        status: order.status,
        paymentStatus: order.payment_status,
        revenue,
        productCost: parseFloat(productCost.toFixed(2)),
        shippingCost: shipping,
        gatewayFee,
        discount,
        refunds,
        netProfit,
        margin,
        items: itemBreakdown,
      };
    });

    return data;
  },

  /**
   * 4. List Order Profitability
   */
  async getOrderProfitabilityList(query = {}, user) {
    const { business_id, limit = 30 } = query;
    const targetBusinessId = business_id && business_id !== 'all' ? business_id : null;

    const orderWhere = {
      status: { [Op.notIn]: ['CANCELLED'] },
    };
    if (targetBusinessId) orderWhere.business_id = targetBusinessId;

    const orders = await Order.findAll({
      where: orderWhere,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10) || 30,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['cost_price', 'name'] }],
        },
        {
          model: Return,
          as: 'returns',
        },
      ],
    });

    return orders.map((order) => {
      const revenue = parseFloat(Number(order.total_amount || 0).toFixed(2));
      const shipping = parseFloat(Number(order.shipping_fee || 0).toFixed(2));
      const gatewayFee = parseFloat(((revenue * GATEWAY_FEE_PERCENT) / 100).toFixed(2));

      let productCost = 0;
      for (const it of order.items || []) {
        const unitCost = parseFloat(Number(it.product?.cost_price || it.unit_price * 0.4).toFixed(2));
        productCost += unitCost * it.quantity;
      }

      let refunds = 0;
      for (const ret of order.returns || []) {
        refunds += parseFloat(Number(ret.refund_amount || 0).toFixed(2));
      }

      const netProfit = parseFloat((revenue - productCost - gatewayFee - refunds).toFixed(2));
      const margin = revenue > 0 ? parseFloat(((netProfit / revenue) * 100).toFixed(2)) : 0;

      return {
        orderId: order.id,
        orderNumber: order.order_number,
        date: order.created_at || order.createdAt,
        customerName: order.customer_name || 'Customer',
        status: order.status,
        revenue,
        productCost: parseFloat(productCost.toFixed(2)),
        shipping,
        gatewayFee,
        marketingCost: 0,
        refund: refunds,
        returnCost: 0,
        netProfit,
        margin,
      };
    });
  },
};

