import { parentPort } from 'worker_threads';

if (!parentPort) {
  throw new Error('This module must be run inside a Node.js Worker Thread.');
}

/**
 * Heavy computation: Inventory Intelligence & Reorder Matrix
 */
function computeInventoryAnalytics(payload) {
  const { products, salesData, defaultLeadTimeDays = 3 } = payload;
  const results = [];

  for (const p of products) {
    const stock = Number(p.stock_quantity || 0);
    const reserved = Number(p.reserved_quantity || 0);
    const available = Math.max(0, stock - reserved);
    const cost = Number(p.cost_price || 0);
    const price = Number(p.selling_price || 0);
    const lowStockThreshold = Number(p.low_stock_threshold || 10);
    const targetDays = Number(p.target_stock_days || 30);

    // Sales metrics for this product
    const sales = salesData[p.id] || { unitsSold30d: 0, revenue30d: 0 };
    const unitsSold30d = Number(sales.unitsSold30d || 0);
    const dailyVelocity = unitsSold30d / 30;

    // Days of Inventory Remaining (DIR)
    const daysOfInventory = dailyVelocity > 0 ? Math.round(available / dailyVelocity) : 999;

    // Safety Stock & Reorder Point (ROP = (Daily Demand * Lead Time) + Safety Stock)
    const leadTime = Number(p.lead_time_days || defaultLeadTimeDays);
    const safetyStock = Number(p.safety_stock || Math.ceil(dailyVelocity * leadTime * 0.5));
    const reorderLevel = Number(p.reorder_level || Math.ceil(dailyVelocity * leadTime + safetyStock));

    // Stockout Risk Calculation
    let stockoutRisk = 'LOW';
    if (available === 0) stockoutRisk = 'CRITICAL';
    else if (available <= lowStockThreshold || daysOfInventory <= leadTime) stockoutRisk = 'HIGH';
    else if (daysOfInventory <= targetDays * 0.5) stockoutRisk = 'MEDIUM';

    // Economic Reorder Quantity (EOQ simulation: Q = Daily Demand * Target Days)
    const recommendedReorderQty = Math.max(0, Math.ceil(dailyVelocity * targetDays) - available);

    // Capital & Asset Valuation
    const totalAssetValue = stock * cost;
    const potentialRevenue = stock * price;
    const marginPercent = price > 0 ? Math.round(((price - cost) / price) * 10000) / 100 : 0;

    results.push({
      productId: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      availableStock: available,
      totalStock: stock,
      reservedStock: reserved,
      dailyVelocity: Math.round(dailyVelocity * 100) / 100,
      unitsSold30d,
      daysOfInventory,
      safetyStock,
      reorderLevel,
      recommendedReorderQty,
      reorderRecommended: available <= reorderLevel,
      stockoutRisk,
      totalAssetValue: Math.round(totalAssetValue * 100) / 100,
      potentialRevenue: Math.round(potentialRevenue * 100) / 100,
      marginPercent,
    });
  }

  return results;
}

/**
 * Heavy computation: Product Intelligence, ABC Categorization & Opportunity Scoring
 */
function computeProductIntelligence(payload) {
  const { products, orderItems = [], timeframeDays = 30 } = payload;

  // Aggregate order items per product
  const productSales = new Map();
  for (const item of orderItems) {
    const pId = item.product_id;
    let curr = productSales.get(pId) || { units: 0, revenue: 0, totalCost: 0, orders: 0 };
    const qty = Number(item.quantity || 0);
    const price = Number(item.unit_price || 0);
    const cost = Number(item.cost_price || 0);

    curr.units += qty;
    curr.revenue += qty * price;
    curr.totalCost += qty * cost;
    curr.orders += 1;
    productSales.set(pId, curr);
  }

  let enriched = [];
  let totalPlatformRevenue = 0;

  for (const p of products) {
    const s = productSales.get(p.id) || { units: 0, revenue: 0, totalCost: 0, orders: 0 };
    totalPlatformRevenue += s.revenue;
    const grossProfit = s.revenue - s.totalCost;
    const margin = s.revenue > 0 ? (grossProfit / s.revenue) * 100 : 0;
    const velocity = timeframeDays > 0 ? s.units / timeframeDays : 0;

    // Opportunity Score Matrix (0-100)
    // Weighted by Velocity (35%), Margin (35%), Stock Availability (20%), Demand Stability (10%)
    const stockScore = Math.min(100, (Number(p.stock_quantity || 0) / 50) * 100);
    const marginScore = Math.min(100, Math.max(0, margin * 1.5));
    const velocityScore = Math.min(100, velocity * 25);
    const opportunityScore = Math.round(velocityScore * 0.35 + marginScore * 0.35 + stockScore * 0.2 + 10);

    enriched.push({
      ...p,
      unitsSold: s.units,
      totalRevenue: Math.round(s.revenue * 100) / 100,
      totalCost: Math.round(s.totalCost * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      profitMarginPercent: Math.round(margin * 100) / 100,
      dailyVelocity: Math.round(velocity * 100) / 100,
      opportunityScore: Math.min(99, Math.max(1, opportunityScore)),
    });
  }

  // Sort by revenue to compute ABC Pareto Classification (A: Top 80%, B: Next 15%, C: Bottom 5%)
  enriched.sort((a, b) => b.totalRevenue - a.totalRevenue);
  let cumulative = 0;
  for (const item of enriched) {
    cumulative += item.totalRevenue;
    const cumulativePct = totalPlatformRevenue > 0 ? (cumulative / totalPlatformRevenue) * 100 : 100;
    if (cumulativePct <= 80) item.abcCategory = 'A';
    else if (cumulativePct <= 95) item.abcCategory = 'B';
    else item.abcCategory = 'C';
  }

  return enriched;
}

/**
 * Heavy computation: Financial Profit/Loss Aggregations & Run-Rate Forecasting
 */
function computeFinancialMetrics(payload) {
  const { orders = [], expenses = [] } = payload;

  let totalGrossRevenue = 0;
  let totalNetRevenue = 0;
  let totalProductCost = 0;
  let totalShippingFees = 0;
  let totalDiscountAmount = 0;

  const dailyTrendMap = new Map();

  for (const o of orders) {
    if (o.status === 'CANCELLED') continue;
    const total = Number(o.total_amount || 0);
    const subtotal = Number(o.subtotal || total);
    const shipping = Number(o.shipping_fee || 0);
    const discount = Number(o.discount_amount || 0);

    totalGrossRevenue += total;
    totalNetRevenue += subtotal;
    totalShippingFees += shipping;
    totalDiscountAmount += discount;

    const dateStr = (o.created_at || new Date().toISOString()).split('T')[0];
    let day = dailyTrendMap.get(dateStr) || { date: dateStr, revenue: 0, orders: 0, profit: 0 };
    day.revenue += total;
    day.orders += 1;
    dailyTrendMap.set(dateStr, day);
  }

  let totalExpenses = 0;
  const expenseByCategory = {};
  for (const e of expenses) {
    const amount = Number(e.amount || 0);
    totalExpenses += amount;
    const cat = e.category || 'GENERAL';
    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + amount;
  }

  const grossProfit = totalNetRevenue - totalProductCost;
  const netProfit = grossProfit - totalExpenses;
  const profitMargin = totalGrossRevenue > 0 ? (netProfit / totalGrossRevenue) * 100 : 0;

  return {
    grossRevenue: Math.round(totalGrossRevenue * 100) / 100,
    netRevenue: Math.round(totalNetRevenue * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    profitMarginPercent: Math.round(profitMargin * 100) / 100,
    expenseBreakdown: expenseByCategory,
    dailyTrends: Array.from(dailyTrendMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
  };
}

// Parent Port Message Handler
parentPort.on('message', (message) => {
  const { taskId, type, payload } = message;

  try {
    let result = null;
    switch (type) {
      case 'INVENTORY_ANALYTICS':
        result = computeInventoryAnalytics(payload);
        break;
      case 'PRODUCT_INTELLIGENCE':
        result = computeProductIntelligence(payload);
        break;
      case 'FINANCIAL_METRICS':
        result = computeFinancialMetrics(payload);
        break;
      default:
        throw new Error(`Unknown worker task type: ${type}`);
    }

    parentPort.postMessage({ taskId, success: true, result });
  } catch (error) {
    parentPort.postMessage({ taskId, success: false, error: error.message });
  }
});
