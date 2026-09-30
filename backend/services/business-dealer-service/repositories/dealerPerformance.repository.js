import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';

export const dealerPerformanceRepository = {
  getDb() {
    return (
      getSequelize(env.DB.BUSINESS_NAME) ||
      getSequelize(env.DB.NAME) ||
      getSequelize(env.DB.ORDER_NAME)
    );
  },

  getOrderDb() {
    return (
      getSequelize(env.DB.ORDER_NAME) ||
      getSequelize(env.DB.NAME) ||
      this.getDb()
    );
  },

  getProductDb() {
    return (
      getSequelize(env.DB.PRODUCT_NAME) ||
      getSequelize(env.DB.NAME) ||
      this.getDb()
    );
  },

  /**
   * 1. Fetch Dealers with Aggregated Performance Metrics
   */
  async getDealersWithPerformance(filter = {}) {
    const db = this.getDb();
    const orderDb = this.getOrderDb();
    const prodDb = this.getProductDb();
    if (!db) return [];

    const {
      businessId,
      dealerId,
      status,
      search,
      startDate,
      endDate,
    } = filter;

    const replacements = {
      startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate || new Date(),
    };

    let joinClause = '';
    let whereClause = '1=1';
    if (businessId && businessId !== 'all') {
      joinClause += ' INNER JOIN business_dealers bd ON bd.dealer_id = d.id';
      whereClause += ' AND bd.business_id = :businessId';
      replacements.businessId = businessId;
    }
    if (dealerId && dealerId !== 'all') {
      whereClause += ` AND d.id = :dealerId`;
      replacements.dealerId = dealerId;
    }
    if (status && status !== 'ALL') {
      whereClause += ` AND d.status = :status`;
      replacements.status = status;
    }
    if (search) {
      whereClause += ` AND (d.company_name ILIKE :search OR d.contact_name ILIKE :search OR d.email ILIKE :search)`;
      replacements.search = `%${search.trim()}%`;
    }

    // 1. Fetch Base Dealers
    const query = `
      SELECT DISTINCT
        d.id,
        d.user_id,
        d.company_name,
        d.contact_name,
        d.email,
        d.phone,
        d.status,
        COALESCE(d.credit_limit, 10000.00) as credit_limit,
        COALESCE(d.average_lead_time_days, 3) as average_lead_time_days,
        COALESCE(d.dispatch_sla_hours, 48) as dispatch_sla_hours,
        COALESCE(d.fulfillment_sla_hours, 72) as fulfillment_sla_hours,
        COALESCE(d.commission_rate, 0.00) as commission_rate,
        COALESCE(d.payment_terms, 'NET_30') as payment_terms,
        COALESCE(d.payable_balance, 0.00) as payable_balance,
        d.rating_notes,
        d.created_at,
        d.updated_at
      FROM dealers d
      ${joinClause}
      WHERE ${whereClause}
      ORDER BY d.created_at DESC
    `;

    const [dealers] = await db.query(query, { replacements });
    if (!dealers || dealers.length === 0) return [];

    // Fetch Business Assignments per Dealer
    let bizAssignmentsMap = new Map();
    try {
      const [bizRows] = await db.query(`
        SELECT
          bd.dealer_id,
          bd.business_id,
          bd.status as assignment_status,
          b.name as business_name
        FROM business_dealers bd
        JOIN businesses b ON b.id = bd.business_id
      `);
      for (const row of bizRows) {
        if (!bizAssignmentsMap.has(row.dealer_id)) {
          bizAssignmentsMap.set(row.dealer_id, []);
        }
        bizAssignmentsMap.get(row.dealer_id).push({
          id: row.business_id,
          name: row.business_name,
          status: row.assignment_status,
        });
      }
    } catch (e) {
      console.warn('Could not query business dealer assignments:', e.message);
    }

    // 2. Query Aggregated Order Metrics per Dealer in Time Window
    let orderAggQuery = `
      SELECT
        oi.dealer_id,
        COUNT(DISTINCT o.id) as total_assigned_orders,
        COUNT(DISTINCT CASE WHEN o.status IN ('DELIVERED', 'SHIPPED') THEN o.id END) as fulfilled_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'DELIVERED' THEN o.id END) as delivered_orders,
        COUNT(DISTINCT CASE WHEN o.status IN ('PENDING', 'CONFIRMED', 'PROCESSING') THEN o.id END) as pending_fulfillment_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'CANCELLED' THEN o.id END) as total_cancelled_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'CANCELLED' AND o.cancellation_source = 'DEALER' THEN o.id END) as dealer_cancelled_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'CANCELLED' AND (o.cancellation_source IS NULL OR o.cancellation_source = 'CUSTOMER') THEN o.id END) as customer_cancelled_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'RETURNED' THEN o.id END) as returned_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'SHIPPED' AND o.dispatched_at IS NOT NULL AND o.assigned_at IS NOT NULL THEN o.id END) as dispatched_count,
        AVG(CASE WHEN o.dispatched_at IS NOT NULL AND o.assigned_at IS NOT NULL THEN EXTRACT(EPOCH FROM (o.dispatched_at - o.assigned_at))/3600 END) as avg_dispatch_hours,
        SUM(CASE WHEN o.status NOT IN ('CANCELLED') THEN oi.quantity * oi.unit_price ELSE 0 END) as total_revenue,
        SUM(CASE WHEN o.status NOT IN ('CANCELLED') THEN oi.quantity * oi.unit_price * 0.6 ELSE 0 END) as total_supplier_cost,
        COUNT(DISTINCT CASE
          WHEN (o.dispatched_at IS NOT NULL AND o.assigned_at IS NOT NULL AND EXTRACT(EPOCH FROM (o.dispatched_at - o.assigned_at))/3600 > 48)
            OR (o.status IN ('PENDING', 'CONFIRMED', 'PROCESSING') AND o.assigned_at IS NOT NULL AND EXTRACT(EPOCH FROM (NOW() - o.assigned_at))/3600 > 48)
            OR o.sla_breached = true
          THEN o.id END) as sla_breached_count
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.created_at >= :startDate AND o.created_at <= :endDate
    `;

    if (businessId && businessId !== 'all') {
      orderAggQuery += ` AND o.business_id = :businessId`;
    }
    orderAggQuery += ` GROUP BY oi.dealer_id`;

    let orderAggMap = new Map();
    try {
      const [orderRows] = await (orderDb || db).query(orderAggQuery, { replacements });
      for (const row of orderRows) {
        orderAggMap.set(row.dealer_id, row);
      }
    } catch (e) {
      console.warn('Could not query order aggregations for dealers:', e.message);
    }

    // 3. Query RTO Aggregations per Dealer
    let rtoAggMap = new Map();
    try {
      let rtoQuery = `
        SELECT
          oi.dealer_id,
          COUNT(DISTINCT CASE WHEN o.payment_status = 'PENDING' OR o.status IN ('DELIVERED', 'SHIPPED', 'RETURNED') THEN o.id END) as cod_orders,
          COUNT(DISTINCT CASE WHEN o.status = 'RETURNED' AND (o.shipping_address ILIKE '%RTO%' OR o.cancellation_reason ILIKE '%RTO%') THEN o.id END) as rto_orders,
          SUM(CASE WHEN o.status = 'RETURNED' AND (o.shipping_address ILIKE '%RTO%' OR o.cancellation_reason ILIKE '%RTO%') THEN COALESCE(o.shipping_fee, 15.00) * 2 ELSE 0 END) as rto_cost
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.created_at >= :startDate AND o.created_at <= :endDate
      `;
      if (businessId && businessId !== 'all') {
        rtoQuery += ` AND o.business_id = :businessId`;
      }
      rtoQuery += ` GROUP BY oi.dealer_id`;
      const [rtoRows] = await (orderDb || db).query(rtoQuery, { replacements });
      for (const row of rtoRows) {
        rtoAggMap.set(row.dealer_id, row);
      }
    } catch (e) {}

    // 4. Query Returns Table for Breakdown
    let returnsAggMap = new Map();
    try {
      let returnsQuery = `
        SELECT
          dealer_id,
          COUNT(id) as return_count,
          SUM(COALESCE(refund_amount, 0)) as refund_amount,
          COUNT(CASE WHEN reason ILIKE '%damag%' THEN 1 END) as damaged_count,
          COUNT(CASE WHEN reason ILIKE '%defect%' OR reason ILIKE '%broken%' THEN 1 END) as defective_count,
          COUNT(CASE WHEN reason ILIKE '%wrong%' THEN 1 END) as wrong_item_count,
          COUNT(CASE WHEN reason ILIKE '%qualit%' THEN 1 END) as quality_count,
          COUNT(CASE WHEN reason ILIKE '%mind%' OR reason ILIKE '%cancel%' THEN 1 END) as customer_changed_mind_count
        FROM returns
        WHERE created_at >= :startDate AND created_at <= :endDate
      `;
      if (businessId && businessId !== 'all') {
        returnsQuery += ` AND business_id = :businessId`;
      }
      returnsQuery += ` GROUP BY dealer_id`;
      const [returnRows] = await (orderDb || db).query(returnsQuery, { replacements });
      for (const row of returnRows) {
        returnsAggMap.set(row.dealer_id, row);
      }
    } catch (e) {}

    // 5. Query Products & Stock per Dealer
    let prodAggMap = new Map();
    try {
      let prodQuery = `
        SELECT
          dealer_id,
          COUNT(id) as total_products,
          SUM(COALESCE(stock_quantity, 0)) as total_stock,
          SUM(COALESCE(reserved_quantity, 0)) as reserved_stock,
          SUM(GREATEST(0, COALESCE(stock_quantity, 0) - COALESCE(reserved_quantity, 0))) as available_stock,
          SUM(GREATEST(0, COALESCE(stock_quantity, 0) - COALESCE(reserved_quantity, 0)) * COALESCE(cost_price, 0)) as inventory_value,
          COUNT(CASE WHEN (COALESCE(stock_quantity, 0) - COALESCE(reserved_quantity, 0)) <= COALESCE(low_stock_threshold, 10) AND (COALESCE(stock_quantity, 0) - COALESCE(reserved_quantity, 0)) > 0 THEN 1 END) as low_stock_count,
          COUNT(CASE WHEN (COALESCE(stock_quantity, 0) - COALESCE(reserved_quantity, 0)) <= 0 THEN 1 END) as out_of_stock_count,
          COUNT(CASE WHEN status = 'ACTIVE' AND (COALESCE(stock_quantity, 0) - COALESCE(reserved_quantity, 0)) > 0 THEN 1 END) as in_stock_active_count,
          COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as total_active_products
        FROM products
        WHERE status != 'INACTIVE'
      `;
      if (businessId && businessId !== 'all') {
        prodQuery += ` AND (business_id = :businessId OR business_id IS NULL)`;
      }
      prodQuery += ` GROUP BY dealer_id`;
      const [prodRows] = await (prodDb || db).query(prodQuery, { replacements });
      for (const row of prodRows) {
        prodAggMap.set(row.dealer_id, row);
      }
    } catch (e) {}

    // Combine All Data Sources Per Dealer
    return dealers.map((dealer) => {
      const orderData = orderAggMap.get(dealer.id) || {};
      const rtoData = rtoAggMap.get(dealer.id) || {};
      const returnData = returnsAggMap.get(dealer.id) || {};
      const prodData = prodAggMap.get(dealer.id) || {};

      const totalAssigned = parseInt(orderData.total_assigned_orders, 10) || 0;
      const fulfilled = parseInt(orderData.fulfilled_orders, 10) || 0;
      const delivered = parseInt(orderData.delivered_orders, 10) || 0;
      const pending = parseInt(orderData.pending_fulfillment_orders, 10) || 0;
      const totalCancelled = parseInt(orderData.total_cancelled_orders, 10) || 0;
      const dealerCancelled = parseInt(orderData.dealer_cancelled_orders, 10) || 0;
      const customerCancelled = parseInt(orderData.customer_cancelled_orders, 10) || 0;
      const returnedOrders = parseInt(returnData.return_count || orderData.returned_orders, 10) || 0;
      const slaBreachedCount = parseInt(orderData.sla_breached_count, 10) || 0;

      const rawDispatchHours = parseFloat(orderData.avg_dispatch_hours || 0);
      const avgDispatchHours = parseFloat(rawDispatchHours.toFixed(1));
      const avgDispatchDays = parseFloat((rawDispatchHours / 24).toFixed(1));

      // Eligible orders for fulfillment rate = totalAssigned - customerCancelled
      const eligibleOrders = Math.max(0, totalAssigned - customerCancelled);
      const fulfillmentRate = eligibleOrders > 0 ? parseFloat(((fulfilled / eligibleOrders) * 100).toFixed(1)) : 100.0;

      const dealerCancellationRate = totalAssigned > 0 ? parseFloat(((dealerCancelled / totalAssigned) * 100).toFixed(1)) : 0.0;
      const returnRate = fulfilled > 0 ? parseFloat(((returnedOrders / fulfilled) * 100).toFixed(1)) : 0.0;

      const codOrders = parseInt(rtoData.cod_orders, 10) || fulfilled;
      const rtoOrders = parseInt(rtoData.rto_orders, 10) || 0;
      const rtoRate = codOrders > 0 ? parseFloat(((rtoOrders / codOrders) * 100).toFixed(1)) : 0.0;
      const rtoCost = parseFloat((rtoData.rto_cost || 0).toString());

      // Stock availability rate = in_stock_active / total_active
      const totalActiveProducts = parseInt(prodData.total_active_products, 10) || 0;
      const inStockActive = parseInt(prodData.in_stock_active_count, 10) || 0;
      const stockAvailabilityRate = totalActiveProducts > 0 ? parseFloat(((inStockActive / totalActiveProducts) * 100).toFixed(1)) : 100.0;

      // SLA Compliance Rate = (totalAssigned - slaBreachedCount) / totalAssigned * 100
      const slaComplianceRate = totalAssigned > 0 ? parseFloat((Math.max(0, (totalAssigned - slaBreachedCount) / totalAssigned) * 100).toFixed(1)) : 100.0;

      // Financials
      const revenue = parseFloat(orderData.total_revenue || 0);
      const supplierCost = parseFloat(orderData.total_supplier_cost || 0);
      const estimatedProfit = parseFloat((revenue - supplierCost).toFixed(2));
      const margin = revenue > 0 ? parseFloat(((estimatedProfit / revenue) * 100).toFixed(1)) : 0.0;

      const assignedBizs = bizAssignmentsMap.get(dealer.id) || [];
      const assignedBizIds = assignedBizs.map((b) => b.id);
      const isAssignedToSelected = !businessId || businessId === 'all' || assignedBizIds.includes(businessId);

      return {
        id: dealer.id,
        user_id: dealer.user_id,
        companyName: dealer.company_name,
        company_name: dealer.company_name,
        contactName: dealer.contact_name,
        contact_name: dealer.contact_name,
        email: dealer.email,
        phone: dealer.phone,
        status: dealer.status,
        creditLimit: parseFloat(dealer.credit_limit || 0),
        averageLeadTimeDays: parseInt(dealer.average_lead_time_days, 10) || 3,
        dispatchSlaHours: parseInt(dealer.dispatch_sla_hours, 10) || 48,
        fulfillmentSlaHours: parseInt(dealer.fulfillment_sla_hours, 10) || 72,
        commissionRate: parseFloat(dealer.commission_rate || 0),
        paymentTerms: dealer.payment_terms || 'NET_30',
        payableBalance: parseFloat(dealer.payable_balance || 0),
        ratingNotes: dealer.rating_notes,
        createdAt: dealer.created_at,
        created_at: dealer.created_at,
        businesses: assignedBizs,
        assignedBusinessIds: assignedBizIds,
        isAssignedToSelectedBusiness: isAssignedToSelected,

        // Performance Metrics
        totalAssignedOrders: totalAssigned,
        fulfilledOrders: fulfilled,
        deliveredOrders: delivered,
        pendingFulfillmentOrders: pending,
        totalCancelledOrders: totalCancelled,
        dealerCancelledOrders: dealerCancelled,
        customerCancelledOrders: customerCancelled,
        returnedOrders,
        rtoOrders,
        rtoRate,
        rtoCost,
        fulfillmentRate,
        dealerCancellationRate,
        returnRate,
        avgDispatchHours,
        avgDispatchDays,
        slaBreachedCount,
        slaComplianceRate,

        // Product & Stock Metrics
        totalProducts: parseInt(prodData.total_products, 10) || 0,
        totalStock: parseInt(prodData.total_stock, 10) || 0,
        availableStock: parseInt(prodData.available_stock, 10) || 0,
        reservedStock: parseInt(prodData.reserved_stock, 10) || 0,
        inventoryValue: parseFloat(prodData.inventory_value || 0),
        lowStockProductsCount: parseInt(prodData.low_stock_count, 10) || 0,
        outOfStockProductsCount: parseInt(prodData.outOfStock_count || prodData.out_of_stock_count, 10) || 0,
        stockAvailabilityRate,

        // Financial Metrics
        revenue: parseFloat(revenue.toFixed(2)),
        supplierCost: parseFloat(supplierCost.toFixed(2)),
        profit: estimatedProfit,
        profitMargin: margin,

        // Return Reason Breakdown
        returnBreakdown: {
          damaged: parseInt(returnData.damaged_count, 10) || 0,
          defective: parseInt(returnData.defective_count, 10) || 0,
          wrongItem: parseInt(returnData.wrong_item_count, 10) || 0,
          quality: parseInt(returnData.quality_count, 10) || 0,
          changedMind: parseInt(returnData.customer_changed_mind_count, 10) || 0,
        },
      };
    });
  },

  /**
   * 2. Fetch Single Dealer Comprehensive Drilldown
   */
  async getDealerDetail(dealerId, businessId, timeframe = '30d') {
    const list = await this.getDealersWithPerformance({
      dealerId,
      businessId,
      startDate: new Date(Date.now() - (parseInt(timeframe, 10) || 30) * 24 * 60 * 60 * 1000),
    });

    if (!list || list.length === 0) return null;
    const dealerData = list[0];

    const db = this.getDb();

    // 1. Fetch Products supplied by this dealer
    let products = [];
    try {
      const [prodRows] = await db.query(
        `SELECT
          p.id,
          p.name,
          p.sku,
          p.category,
          p.cost_price,
          p.selling_price,
          p.stock_quantity,
          p.reserved_quantity,
          p.images,
          p.status,
          COALESCE(SUM(oi.quantity), 0) as units_sold,
          COALESCE(SUM(CASE WHEN o.status NOT IN ('CANCELLED') THEN oi.quantity * oi.unit_price ELSE 0 END), 0) as product_revenue,
          COALESCE(COUNT(DISTINCT r.id), 0) as returns_count
        FROM products p
        LEFT JOIN order_items oi ON oi.product_id = p.id
        LEFT JOIN orders o ON o.id = oi.order_id AND o.status != 'CANCELLED'
        LEFT JOIN returns r ON r.product_id = p.id
        WHERE p.dealer_id = :dealerId
        GROUP BY p.id
        ORDER BY units_sold DESC`,
        { replacements: { dealerId } }
      );
      products = prodRows.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        costPrice: parseFloat(p.cost_price || 0),
        sellingPrice: parseFloat(p.selling_price || 0),
        stockQuantity: parseInt(p.stock_quantity, 10) || 0,
        reservedQuantity: parseInt(p.reserved_quantity, 10) || 0,
        availableStock: Math.max(0, (parseInt(p.stock_quantity, 10) || 0) - (parseInt(p.reserved_quantity, 10) || 0)),
        unitsSold: parseInt(p.units_sold, 10) || 0,
        revenue: parseFloat(parseFloat(p.product_revenue || 0).toFixed(2)),
        returnsCount: parseInt(p.returns_count, 10) || 0,
        images: Array.isArray(p.images) ? p.images : [],
        status: p.status,
      }));
    } catch (e) {}

    // 2. Fetch Operational Orders Queue for this dealer
    let ordersQueue = [];
    try {
      const [orderRows] = await db.query(
        `SELECT
          o.id,
          o.order_number,
          o.status,
          o.total_amount,
          o.payment_status,
          o.created_at,
          o.assigned_at,
          o.dispatched_at,
          o.sla_breached,
          c.name as customer_name,
          c.email as customer_email,
          COUNT(oi.id) as items_count,
          SUM(oi.quantity) as total_units
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN customers c ON c.id = o.customer_id
        WHERE oi.dealer_id = :dealerId
        GROUP BY o.id, c.name, c.email
        ORDER BY o.created_at DESC
        LIMIT 30`,
        { replacements: { dealerId } }
      );

      ordersQueue = orderRows.map((o) => {
        const assignedAt = o.assigned_at ? new Date(o.assigned_at) : new Date(o.created_at);
        const slaHours = dealerData.dispatchSlaHours || 48;
        const deadline = new Date(assignedAt.getTime() + slaHours * 60 * 60 * 1000);
        const now = new Date();
        const isDispatched = !!o.dispatched_at;
        const isBreached = o.sla_breached || (!isDispatched && now > deadline);
        const secondsRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));

        return {
          id: o.id,
          orderNumber: o.order_number,
          status: o.status,
          totalAmount: parseFloat(o.total_amount || 0),
          paymentStatus: o.payment_status,
          createdAt: o.created_at,
          assignedAt: o.assigned_at,
          dispatchedAt: o.dispatched_at,
          customerName: o.customer_name || 'Customer',
          itemsCount: parseInt(o.items_count, 10) || 1,
          totalUnits: parseInt(o.total_units, 10) || 1,
          slaDeadline: deadline.toISOString(),
          secondsRemaining,
          isBreached,
        };
      });
    } catch (e) {}

    // 3. Continuous 30-Day Daily Trends
    let trends = [];
    try {
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const dt = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        trends.push({
          date: dt,
          orders: 0,
          fulfilled: 0,
          revenue: 0,
          profit: 0,
          rto: 0,
        });
      }

      const [trendRows] = await db.query(
        `SELECT
          o.created_at::date as order_date,
          COUNT(DISTINCT o.id) as orders_count,
          COUNT(DISTINCT CASE WHEN o.status IN ('DELIVERED', 'SHIPPED') THEN o.id END) as fulfilled_count,
          SUM(CASE WHEN o.status != 'CANCELLED' THEN oi.quantity * oi.unit_price ELSE 0 END) as daily_revenue,
          SUM(CASE WHEN o.status != 'CANCELLED' THEN oi.quantity * (oi.unit_price - COALESCE(p.cost_price, oi.unit_price * 0.6)) ELSE 0 END) as daily_profit,
          COUNT(DISTINCT CASE WHEN o.status = 'RETURNED' THEN o.id END) as rto_count
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.dealer_id = :dealerId AND o.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY o.created_at::date
        ORDER BY order_date ASC`,
        { replacements: { dealerId } }
      );

      const trendMap = new Map();
      for (const r of trendRows) {
        const dStr = r.order_date.toISOString ? r.order_date.toISOString().split('T')[0] : String(r.order_date);
        trendMap.set(dStr, r);
      }

      trends = trends.map((item) => {
        const match = trendMap.get(item.date);
        if (match) {
          return {
            date: item.date,
            orders: parseInt(match.orders_count, 10) || 0,
            fulfilled: parseInt(match.fulfilled_count, 10) || 0,
            revenue: parseFloat(parseFloat(match.daily_revenue || 0).toFixed(2)),
            profit: parseFloat(parseFloat(match.daily_profit || 0).toFixed(2)),
            rto: parseInt(match.rto_count, 10) || 0,
          };
        }
        return item;
      });
    } catch (e) {}

    return {
      dealer: dealerData,
      products,
      ordersQueue,
      trends,
    };
  },
};
