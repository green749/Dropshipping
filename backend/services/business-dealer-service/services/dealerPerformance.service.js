import { dealerPerformanceRepository } from '../repositories/dealerPerformance.repository.js';
import { dealerRepository } from '../repositories/dealer.repository.js';
import { CacheService } from '../../shared/services/cache.service.js';

export const dealerPerformanceService = {
  /**
   * 1. High-Level Summary Metrics
   */
  async getPerformanceSummary(query = {}, user) {
    const { business_id, timeframe = '30d' } = query;
    const days = parseInt(timeframe, 10) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const cacheKey = CacheService.generateKey('dealer:performance-summary', {
      businessId: business_id || 'all',
      timeframe,
      userRole: user?.role,
    });

    const { data } = await CacheService.remember(cacheKey, 60, async () => {
      const dealers = await dealerPerformanceRepository.getDealersWithPerformance({
        businessId: business_id,
        startDate,
        endDate,
      });

      let totalDealers = dealers.length;
      let activeDealers = 0;
      let ordersAssigned = 0;
      let ordersFulfilled = 0;
      let pendingFulfillment = 0;
      let cancelledOrders = 0;
      let dealerCancelledOrders = 0;
      let customerCancelledOrders = 0;
      let returnedOrders = 0;
      let rtoOrders = 0;
      let totalRevenue = 0;
      let totalProductCost = 0;
      let totalProfit = 0;
      let totalDispatchHours = 0;
      let dispatchCount = 0;
      let totalSlaBreaches = 0;

      for (const d of dealers) {
        if (d.status === 'ACTIVE') activeDealers++;
        ordersAssigned += d.totalAssignedOrders;
        ordersFulfilled += d.fulfilledOrders;
        pendingFulfillment += d.pendingFulfillmentOrders;
        cancelledOrders += d.totalCancelledOrders;
        dealerCancelledOrders += d.dealerCancelledOrders;
        customerCancelledOrders += d.customerCancelledOrders;
        returnedOrders += d.returnedOrders;
        rtoOrders += d.rtoOrders;
        totalRevenue += d.revenue;
        totalProductCost += d.supplierCost;
        totalProfit += d.profit;
        totalSlaBreaches += d.slaBreachedCount;

        if (d.avgDispatchHours > 0 && d.totalAssignedOrders > 0) {
          totalDispatchHours += d.avgDispatchHours * d.totalAssignedOrders;
          dispatchCount += d.totalAssignedOrders;
        }
      }

      const avgDispatchHours = dispatchCount > 0 ? parseFloat((totalDispatchHours / dispatchCount).toFixed(1)) : 28.5;
      const avgDispatchDays = parseFloat((avgDispatchHours / 24).toFixed(1));

      const eligibleOrders = Math.max(0, ordersAssigned - customerCancelledOrders);
      const overallFulfillmentRate = eligibleOrders > 0 ? parseFloat(((ordersFulfilled / eligibleOrders) * 100).toFixed(1)) : 100.0;
      const overallReturnRate = ordersFulfilled > 0 ? parseFloat(((returnedOrders / ordersFulfilled) * 100).toFixed(1)) : 0.0;
      const overallRtoRate = ordersFulfilled > 0 ? parseFloat(((rtoOrders / ordersFulfilled) * 100).toFixed(1)) : 0.0;
      const overallSlaCompliance = ordersAssigned > 0 ? parseFloat((Math.max(0, (ordersAssigned - totalSlaBreaches) / ordersAssigned) * 100).toFixed(1)) : 100.0;

      return {
        totalDealers,
        activeDealers,
        ordersAssigned,
        ordersFulfilled,
        pendingFulfillment,
        cancelledOrders,
        dealerCancelledOrders,
        customerCancelledOrders,
        returnedOrders,
        rtoOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalProductCost: parseFloat(totalProductCost.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        profitMargin: totalRevenue > 0 ? parseFloat(((totalProfit / totalRevenue) * 100).toFixed(1)) : 0.0,
        avgDispatchHours,
        avgDispatchDays,
        overallFulfillmentRate,
        overallReturnRate,
        overallRtoRate,
        overallSlaCompliance,
        totalSlaBreaches,
      };
    });

    return data;
  },

  /**
   * 2. Detailed Performance List with Multi-Metric Sorting & Filtering
   */
  async getPerformanceList(query = {}, user) {
    const {
      business_id,
      timeframe = '30d',
      status,
      search,
      sortBy = 'revenue',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = query;

    const days = parseInt(timeframe, 10) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const cacheKey = CacheService.generateKey('dealer:performance-list', {
      businessId: business_id || 'all',
      status: status || 'all',
      search: search || '',
      sortBy,
      sortOrder,
      page,
      limit,
      timeframe,
      userRole: user?.role,
    });

    const { data } = await CacheService.remember(cacheKey, 60, async () => {
      let dealers = await dealerPerformanceRepository.getDealersWithPerformance({
        businessId: business_id,
        status,
        search,
        startDate,
        endDate,
      });

      // Sort by specified performance metric
      dealers.sort((a, b) => {
        let valA = a[sortBy] ?? 0;
        let valB = b[sortBy] ?? 0;

        if (typeof valA === 'string') {
          return sortOrder === 'ASC' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'ASC' ? valA - valB : valB - valA;
      });

      const total = dealers.length;
      const p = Math.max(1, parseInt(page, 10) || 1);
      const l = Math.max(1, parseInt(limit, 10) || 20);
      const offset = (p - 1) * l;
      const paginated = dealers.slice(offset, offset + l);

      return {
        dealers: paginated,
        pagination: {
          page: p,
          limit: l,
          total,
          totalPages: Math.ceil(total / l) || 1,
        },
      };
    });

    return data;
  },

  /**
   * 3. Single Dealer Deep Drilldown
   */
  async getDealerDetail(dealerId, query = {}, user) {
    const { business_id, timeframe = '30d' } = query;
    const detail = await dealerPerformanceRepository.getDealerDetail(dealerId, business_id, timeframe);

    if (!detail) {
      const error = new Error('Dealer not found or not assigned to this business');
      error.statusCode = 404;
      throw error;
    }
    return detail;
  },

  /**
   * 4. Multi-Dealer Side-by-Side Comparison Matrix
   */
  async getComparison(dealerIds = [], query = {}, user) {
    if (!dealerIds || dealerIds.length === 0) {
      const error = new Error('Please select at least 2 dealers for comparison');
      error.statusCode = 400;
      throw error;
    }

    const { business_id, timeframe = '30d' } = query;
    const days = parseInt(timeframe, 10) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const allDealers = await dealerPerformanceRepository.getDealersWithPerformance({
      businessId: business_id,
      startDate,
      endDate,
    });

    const selected = allDealers.filter((d) => dealerIds.includes(d.id));
    return {
      dealers: selected,
      comparedCount: selected.length,
    };
  },

  /**
   * 5. Update Dealer SLA & Operational Parameters
   */
  async updateDealerSla(dealerId, data, user) {
    const dealer = await dealerRepository.findById(dealerId);
    if (!dealer) {
      const error = new Error('Dealer not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await dealerRepository.update(dealerId, {
      dispatch_sla_hours: data.dispatch_sla_hours,
      fulfillment_sla_hours: data.fulfillment_sla_hours,
      average_lead_time_days: data.average_lead_time_days,
      payment_terms: data.payment_terms,
      commission_rate: data.commission_rate,
      credit_limit: data.credit_limit,
      rating_notes: data.rating_notes,
    });

    await CacheService.delByPattern('dealer:*');
    await CacheService.delByPattern('dealers:*');
    return updated;
  },

  /**
   * 6. Update Dealer Status (Active, Inactive, Suspended)
   */
  async updateDealerStatus(dealerId, status, user) {
    const dealer = await dealerRepository.findById(dealerId);
    if (!dealer) {
      const error = new Error('Dealer not found');
      error.statusCode = 404;
      throw error;
    }

    const updated = await dealerRepository.update(dealerId, { status });
    await CacheService.delByPattern('dealer:*');
    await CacheService.delByPattern('dealers:*');
    return updated;
  },
};
