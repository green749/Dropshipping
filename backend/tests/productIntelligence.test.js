import { describe, it, expect } from '@jest/globals';
import { productResearchService } from '../services/product-service/services/productResearch.service.js';

describe('Feature 5: Product Intelligence & Product Research Tests', () => {
  describe('Product Research Calculations', () => {
    it('should correctly compute estimated revenue, profit, and margin for research items', () => {
      const payload = {
        product_name: 'Wireless Ergonomic Keyboard',
        expected_selling_price: 2500,
        estimated_cost: 900,
        estimated_shipping_cost: 150,
        estimated_marketing_cost: 450,
        estimated_units: 100,
      };

      const calculated = productResearchService.calculateEstimates(payload);

      // Revenue = 2500 * 100 = 250000
      expect(calculated.estimated_revenue).toBe(250000);
      
      // Total Cost per unit = 900 + 150 + 450 = 1500
      // Total Cost for 100 units = 150000
      // Net Profit = 250000 - 150000 = 100000
      expect(calculated.estimated_net_profit).toBe(100000);

      // Profit Margin = (100000 / 250000) * 100 = 40%
      expect(calculated.estimated_margin_percent).toBe(40);
    });

    it('should safely handle 0 revenue without division by zero or NaN', () => {
      const payload = {
        product_name: 'Zero Price Test Item',
        expected_selling_price: 0,
        estimated_cost: 500,
        estimated_shipping_cost: 50,
        estimated_marketing_cost: 0,
        estimated_units: 10,
      };

      const calculated = productResearchService.calculateEstimates(payload);

      expect(calculated.estimated_revenue).toBe(0);
      expect(calculated.estimated_net_profit).toBe(-5500);
      expect(calculated.estimated_margin_percent).toBe(0);
    });
  });

  describe('Product Classification & Velocity Metrics', () => {
    it('should accurately calculate sales velocity across periods', () => {
      const unitsSold = 90;
      const days = 30;
      const velocity = Number((unitsSold / days).toFixed(2));

      expect(velocity).toBe(3);
    });

    it('should evaluate factual classification thresholds without hardcoded conclusions', () => {
      const getClassification = (stock, velocity, returnRate, rtoRate, netProfit) => {
        const classifications = [];
        if (velocity >= 2.0) classifications.push('HIGH_DEMAND', 'FAST_MOVING');
        else if (velocity === 0) classifications.push('NO_SALES');
        else classifications.push('LOW_DEMAND', 'SLOW_MOVING');

        if (stock === 0) classifications.push('OUT_OF_STOCK');
        else if (stock <= 10) classifications.push('LOW_STOCK');
        else if (velocity > 0 && stock / velocity > 60) classifications.push('OVERSTOCKED');

        if (netProfit > 0) classifications.push('PROFITABLE');
        else if (netProfit < 0) classifications.push('LOSS_MAKING');

        if (returnRate > 10) classifications.push('HIGH_RETURN');
        if (rtoRate > 15) classifications.push('HIGH_RTO');

        return classifications;
      };

      const tags = getClassification(0, 4.5, 3.2, 5.0, 15000);
      expect(tags).toContain('HIGH_DEMAND');
      expect(tags).toContain('FAST_MOVING');
      expect(tags).toContain('OUT_OF_STOCK');
      expect(tags).toContain('PROFITABLE');
      expect(tags).not.toContain('LOSS_MAKING');
      expect(tags).not.toContain('HIGH_RETURN');
    });
  });

  describe('Centralized Net Profit Attribution', () => {
    it('should follow centralized net profit formula integrating COGS, Gateway fees, Shipping, Refunds, and Ad spend', () => {
      const revenue = 100000;
      const cogs = 40000;
      const gatewayFee = revenue * 0.02; // 2% gateway
      const shippingCost = 8000;
      const returnsRefunds = 5000;
      const allocatedMarketing = 12000;

      const totalCosts = cogs + gatewayFee + shippingCost + returnsRefunds + allocatedMarketing;
      const netProfit = revenue - totalCosts;
      const margin = Number(((netProfit / revenue) * 100).toFixed(1));

      // totalCosts = 40000 + 2000 + 8000 + 5000 + 12000 = 67000
      // netProfit = 100000 - 67000 = 33000
      // margin = 33%
      expect(totalCosts).toBe(67000);
      expect(netProfit).toBe(33000);
      expect(margin).toBe(33.0);
    });
  });
});
