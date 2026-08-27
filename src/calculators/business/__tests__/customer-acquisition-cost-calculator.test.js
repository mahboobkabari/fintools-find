import { describe, it, expect } from 'vitest';
import {
  calculateCustomerAcquisitionCostCalculator,
  calculateCustomerAcquisitionCostTool,
  DEFAULT_CAC_INPUTS,
} from '../customer-acquisition-cost-calculator.js';

describe('Flagship Customer Acquisition Cost (CAC) Suite (Sprint 68 Audit)', () => {
  // 1. Total Spend & Basic CAC Calculations
  describe('Total Acquisition Spend & Basic CAC Calculations', () => {
    it('1. calculates total acquisition expenditure across 5 itemized categories accurately', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 400000,
        salesSalaries: 200000,
        marketingSalaries: 100000,
        softwareTools: 50000,
        agencyFees: 50000,
      });

      // Total = 400k + 200k + 100k + 50k + 50k = 800k
      expect(res.totalAcquisitionSpend).toBe(800000);
    });

    it('2. calculates Paid CAC accurately (Ad Spend / Paid Customers)', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 300000,
        paidCustomers: 150,
      });

      // Paid CAC = 300,000 / 150 = 2,000
      expect(res.paidCac).toBe(2000);
    });

    it('3. calculates Blended CAC accurately (Total Spend / Total Customers)', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 300000,
        salesSalaries: 200000,
        marketingSalaries: 100000,
        softwareTools: 0,
        agencyFees: 0, // Total = 600,000
        paidCustomers: 200,
        organicCustomers: 100, // Total = 300
      });

      // Blended CAC = 600,000 / 300 = 2,000
      expect(res.blendedCac).toBe(2000);
      expect(res.totalCustomers).toBe(300);
    });

    it('4. calculates Fully Loaded Paid CAC correctly (Total Spend / Paid Customers)', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 300000,
        salesSalaries: 200000,
        marketingSalaries: 100000,
        softwareTools: 0,
        agencyFees: 0, // Total = 600,000
        paidCustomers: 200,
        organicCustomers: 100,
      });

      // Fully Loaded Paid CAC = 600,000 / 200 = 3,000
      expect(res.fullyLoadedPaidCac).toBe(3000);
    });
  });

  // 2. Organic Share & Multipliers
  describe('Organic Share & Organic Multipliers', () => {
    it('5. computes organic customer share % correctly', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidCustomers: 300,
        organicCustomers: 100, // Total = 400 -> 25.0%
      });

      expect(res.organicSharePct).toBe(25);
    });

    it('6. calculates organic lift multiplier (Total / Paid)', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidCustomers: 200,
        organicCustomers: 100, // Total = 300 -> 1.5x
      });

      expect(res.organicMultiplier).toBe(1.5);
    });
  });

  // 3. Payback Period & LTV:CAC Unit Economics
  describe('Payback Period & LTV:CAC Unit Economics', () => {
    it('7. calculates CAC payback period in months', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 200000,
        salesSalaries: 100000,
        marketingSalaries: 100000,
        softwareTools: 0,
        agencyFees: 0, // Total = 400,000
        paidCustomers: 200,
        organicCustomers: 0, // Blended CAC = 2,000
        monthlyArpu: 1000,
        grossMarginPct: 50, // Monthly Margin = 500
      });

      // Payback = 2,000 / 500 = 4.0 months
      expect(res.cacPaybackMonths).toBe(4);
    });

    it('8. calculates estimated LTV and LTV:CAC ratio', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 300000,
        salesSalaries: 0,
        marketingSalaries: 0,
        softwareTools: 0,
        agencyFees: 0,
        paidCustomers: 100,
        organicCustomers: 0, // Blended CAC = 3,000
        monthlyArpu: 1000,
        grossMarginPct: 75, // 750/mo
        customerLifetimeMonths: 20, // Estimated LTV = 15,000
      });

      expect(res.estimatedLtv).toBe(15000);
      expect(res.ltvCacRatio).toBe(5); // 15000 / 3000 = 5.0x
    });

    it('9. computes CAC as % of first-year ACV', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 60000,
        salesSalaries: 0,
        marketingSalaries: 0,
        softwareTools: 0,
        agencyFees: 0,
        paidCustomers: 10, // CAC = 6,000
        organicCustomers: 0,
        monthlyArpu: 1000, // First-year ACV = 12,000
      });

      // CAC % of ACV = 6,000 / 12,000 = 50.0%
      expect(res.cacToAcvPct).toBe(50);
    });
  });

  // 4. Acquisition Health Ratings
  describe('Acquisition Health Ratings', () => {
    it('10. classifies Payback > 18 months as CRITICAL', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 500000,
        salesSalaries: 0,
        marketingSalaries: 0,
        softwareTools: 0,
        agencyFees: 0,
        paidCustomers: 20, // CAC = 25,000
        organicCustomers: 0,
        monthlyArpu: 1000,
        grossMarginPct: 50, // 500/mo -> Payback = 50 months
      });

      expect(res.rating).toBe('CRITICAL');
    });

    it('11. classifies Payback 12 to 18 months as MODERATE', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 300000,
        salesSalaries: 0,
        marketingSalaries: 0,
        softwareTools: 0,
        agencyFees: 0,
        paidCustomers: 20, // CAC = 15,000
        organicCustomers: 0,
        monthlyArpu: 1250,
        grossMarginPct: 80, // 1000/mo -> Payback = 15 months
        customerLifetimeMonths: 36, // LTV = 36,000 -> Ratio = 2.4x
      });

      expect(res.rating).toBe('MODERATE');
    });

    it('12. classifies Payback <= 12 months as HEALTHY', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 200000,
        salesSalaries: 0,
        marketingSalaries: 0,
        softwareTools: 0,
        agencyFees: 0,
        paidCustomers: 20, // CAC = 10,000
        organicCustomers: 0,
        monthlyArpu: 1250,
        grossMarginPct: 80, // 1000/mo -> Payback = 10 months
        customerLifetimeMonths: 36, // LTV:CAC ~ 3.6x
      });

      expect(res.rating).toBe('HEALTHY');
    });

    it('13. classifies Payback <= 6 months with LTV:CAC >= 5.0x as EXCEPTIONAL', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 100000,
        salesSalaries: 0,
        marketingSalaries: 0,
        softwareTools: 0,
        agencyFees: 0,
        paidCustomers: 20, // CAC = 5,000
        organicCustomers: 0,
        monthlyArpu: 2000,
        grossMarginPct: 80, // 1600/mo -> Payback ~ 3.1 months
        customerLifetimeMonths: 36, // LTV = 57,600 -> Ratio = 11.5x
      });

      expect(res.rating).toBe('EXCEPTIONAL');
    });
  });

  // 5. Expense Breakdown Structure
  describe('Expense Breakdown Structure', () => {
    it('14. computes percentages for all 5 expense categories', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 500000, // 50%
        salesSalaries: 250000, // 25%
        marketingSalaries: 150000, // 15%
        softwareTools: 50000, // 5%
        agencyFees: 50000, // 5%
      });

      expect(res.expenseBreakdown.length).toBe(5);
      expect(res.expenseBreakdown[0].pct).toBe(50);
      expect(res.expenseBreakdown[1].pct).toBe(25);
    });
  });

  // 6. Optimization Scenarios
  describe('Optimization Scenarios', () => {
    it('15. models 4 acquisition cost optimization scenarios', () => {
      const res = calculateCustomerAcquisitionCostCalculator();
      expect(res.optimizationScenarios.length).toBe(4);
      expect(res.optimizationScenarios[1].scenario).toContain('Ad Waste');
      expect(res.optimizationScenarios[2].scenario).toContain('Organic');
      expect(res.optimizationScenarios[3].scenario).toContain('Sales Close Rate');

      // Optimized CAC should be lower than baseline
      expect(res.optimizationScenarios[1].blendedCac).toBeLessThan(res.blendedCac);
    });
  });

  // 7. Recommendations
  describe('Recommendations', () => {
    it('16. generates 3 prioritized acquisition recommendations', () => {
      const res = calculateCustomerAcquisitionCostCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });
  });

  // 8. Hero Text
  describe('Hero Text', () => {
    it('17. formats hero text with blended CAC, customers, payback, and LTV:CAC', () => {
      const res = calculateCustomerAcquisitionCostCalculator();
      expect(res.heroText).toContain('Blended Customer Acquisition Cost (CAC)');
      expect(res.heroText).toContain('new customers');
      expect(res.heroText).toContain('payback horizon');
    });
  });

  // 9. Presets Validation
  describe('Presets Validation', () => {
    it('18. validates B2B enterprise SaaS preset', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 500000,
        salesSalaries: 600000,
        marketingSalaries: 250000,
        softwareTools: 100000,
        agencyFees: 50000,
        paidCustomers: 10,
        organicCustomers: 5,
        monthlyArpu: 50000,
        grossMarginPct: 80,
      });

      expect(res.blendedCac).toBe(100000);
      expect(res.cacPaybackMonths).toBe(2.5);
    });

    it('19. validates B2C consumer mobile app preset', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 300000,
        salesSalaries: 50000,
        marketingSalaries: 100000,
        softwareTools: 30000,
        agencyFees: 20000,
        paidCustomers: 1500,
        organicCustomers: 500,
        monthlyArpu: 100,
        grossMarginPct: 80,
      });

      expect(res.blendedCac).toBe(250);
      expect(res.totalCustomers).toBe(2000);
    });

    it('20. validates D2C e-commerce brand preset', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 400000,
        salesSalaries: 20000,
        marketingSalaries: 80000,
        softwareTools: 40000,
        agencyFees: 60000,
        paidCustomers: 600,
        organicCustomers: 200,
        monthlyArpu: 250,
        grossMarginPct: 50,
      });

      expect(res.blendedCac).toBe(750);
      expect(res.cacPaybackMonths).toBe(6);
    });

    it('21. validates FinTech neo-bank platform preset', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 600000,
        salesSalaries: 200000,
        marketingSalaries: 150000,
        softwareTools: 80000,
        agencyFees: 70000,
        paidCustomers: 500,
        organicCustomers: 200,
        monthlyArpu: 250,
        grossMarginPct: 75,
      });

      expect(res.blendedCac).toBe(1571);
      expect(res.cacPaybackMonths).toBe(8.4);
    });

    it('22. validates organic flywheel preset', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 100000,
        salesSalaries: 100000,
        marketingSalaries: 150000,
        softwareTools: 50000,
        agencyFees: 50000,
        paidCustomers: 200,
        organicCustomers: 800,
        monthlyArpu: 400,
        grossMarginPct: 75,
      });

      expect(res.blendedCac).toBe(450);
      expect(res.organicSharePct).toBe(80);
      expect(res.organicMultiplier).toBe(5);
    });

    it('23. validates agency retainer preset', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 150000,
        salesSalaries: 250000,
        marketingSalaries: 100000,
        softwareTools: 40000,
        agencyFees: 60000,
        paidCustomers: 15,
        organicCustomers: 5,
        monthlyArpu: 15000,
        grossMarginPct: 60,
      });

      expect(res.blendedCac).toBe(30000);
      expect(res.cacPaybackMonths).toBe(3.3);
    });
  });

  // 10. Boundary Safeguards & Edge Cases
  describe('Boundary Safeguards & Edge Cases', () => {
    it('24. handles zero total customers safely without division by zero', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidCustomers: 0,
        organicCustomers: 0,
      });

      expect(res.blendedCac).toBe(0);
      expect(res.paidCac).toBe(0);
      expect(res.organicMultiplier).toBe(1);
    });

    it('25. handles zero paid customers with organic customers present', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidCustomers: 0,
        organicCustomers: 50,
        paidAdSpend: 0,
        salesSalaries: 100000,
        marketingSalaries: 0,
        softwareTools: 0,
        agencyFees: 0,
      });

      expect(res.paidCac).toBe(0);
      expect(res.blendedCac).toBe(2000);
      expect(res.organicSharePct).toBe(100);
    });

    it('26. clamps negative expenses to 0', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: -50000,
        salesSalaries: -20000,
      });

      expect(res.expenseBreakdown[0].amount).toBe(0);
      expect(res.expenseBreakdown[1].amount).toBe(0);
    });

    it('27. clamps negative customer counts to 0', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidCustomers: -10,
        organicCustomers: -5,
      });

      expect(res.paidCustomers).toBe(0);
      expect(res.organicCustomers).toBe(0);
    });

    it('28. clamps gross margin between 1% and 100%', () => {
      const resLow = calculateCustomerAcquisitionCostCalculator({ grossMarginPct: 0 });
      expect(resLow.grossMarginPct).toBe(1);

      const resHigh = calculateCustomerAcquisitionCostCalculator({ grossMarginPct: 150 });
      expect(resHigh.grossMarginPct).toBe(100);
    });

    it('29. clamps customer lifetime months between 1 and 240', () => {
      const resLow = calculateCustomerAcquisitionCostCalculator({ customerLifetimeMonths: 0 });
      expect(resLow.estimatedLtv).toBeGreaterThan(0);

      const resHigh = calculateCustomerAcquisitionCostCalculator({ customerLifetimeMonths: 300 });
      expect(resHigh.estimatedLtv).toBeGreaterThan(0);
    });

    it('30. handles string numeric inputs cleanly', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: '300000',
        paidCustomers: '100',
        organicCustomers: '50',
      });

      expect(res.blendedCac).toBeGreaterThan(0);
    });

    it('31. supports custom currency symbol ($)', () => {
      const res = calculateCustomerAcquisitionCostCalculator({ currencySymbol: '$' });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
    });

    it('32. exports calculateCustomerAcquisitionCostTool alias identically', () => {
      const res1 = calculateCustomerAcquisitionCostCalculator({ paidAdSpend: 400000 });
      const res2 = calculateCustomerAcquisitionCostTool({ paidAdSpend: 400000 });
      expect(res1.blendedCac).toBe(res2.blendedCac);
      expect(res1.paidCac).toBe(res2.paidCac);
    });

    it('33. verifies default inputs when called with empty object', () => {
      const res = calculateCustomerAcquisitionCostCalculator();
      expect(res.blendedCac).toBeGreaterThan(0);
      expect(res.totalCustomers).toBe(DEFAULT_CAC_INPUTS.paidCustomers + DEFAULT_CAC_INPUTS.organicCustomers);
    });

    it('34. verifies primaryOutput is blendedCac', () => {
      const res = calculateCustomerAcquisitionCostCalculator();
      expect(res.primaryOutput).toBe(res.blendedCac);
    });

    it('35. handles zero ARPU safely without crashing', () => {
      const res = calculateCustomerAcquisitionCostCalculator({ monthlyArpu: 0 });
      expect(res.cacPaybackMonths).toBe(0);
      expect(res.cacToAcvPct).toBe(0);
    });

    it('36. handles 100% gross margin cleanly', () => {
      const res = calculateCustomerAcquisitionCostCalculator({ grossMarginPct: 100, monthlyArpu: 1000, paidAdSpend: 10000, salesSalaries: 0, marketingSalaries: 0, softwareTools: 0, agencyFees: 0, paidCustomers: 10, organicCustomers: 0 });
      expect(res.monthlyMarginPerCustomer).toBe(1000);
      expect(res.cacPaybackMonths).toBe(1); // 1000 / 1000 = 1 month
    });

    it('37. checks that doubling customer acquisition cuts blended CAC in half', () => {
      const res1 = calculateCustomerAcquisitionCostCalculator({ paidCustomers: 100, organicCustomers: 0 });
      const res2 = calculateCustomerAcquisitionCostCalculator({ paidCustomers: 200, organicCustomers: 0 });
      expect(res2.blendedCac).toBe(Math.round(res1.blendedCac / 2));
    });

    it('38. checks that higher ad spend increases paid CAC linearly', () => {
      const res1 = calculateCustomerAcquisitionCostCalculator({ paidAdSpend: 200000, paidCustomers: 100 });
      const res2 = calculateCustomerAcquisitionCostCalculator({ paidAdSpend: 400000, paidCustomers: 100 });
      expect(res2.paidCac).toBe(res1.paidCac * 2);
    });

    it('39. handles large enterprise spend values (₹10 Crores)', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 50000000,
        salesSalaries: 30000000,
        marketingSalaries: 15000000,
        softwareTools: 3000000,
        agencyFees: 2000000,
        paidCustomers: 1000,
        organicCustomers: 500,
      });

      expect(res.totalAcquisitionSpend).toBe(100000000);
      expect(res.blendedCac).toBe(66667);
    });

    it('40. handles zero marketing and sales salaries gracefully', () => {
      const res = calculateCustomerAcquisitionCostCalculator({
        paidAdSpend: 100000,
        salesSalaries: 0,
        marketingSalaries: 0,
        softwareTools: 0,
        agencyFees: 0,
        paidCustomers: 50,
        organicCustomers: 0,
      });

      expect(res.blendedCac).toBe(res.paidCac);
      expect(res.fullyLoadedPaidCac).toBe(res.paidCac);
    });

    it('41. handles fractional ARPU inputs cleanly', () => {
      const res = calculateCustomerAcquisitionCostCalculator({ monthlyArpu: 49.99 });
      expect(res.monthlyArpu).toBe(49.99);
    });

    it('42. verifies zero software tools and agency fees are handled without error', () => {
      const res = calculateCustomerAcquisitionCostCalculator({ softwareTools: 0, agencyFees: 0 });
      expect(res.expenseBreakdown[3].amount).toBe(0);
      expect(res.expenseBreakdown[4].amount).toBe(0);
    });

    it('43. verifies payback period increases when CAC increases', () => {
      const res1 = calculateCustomerAcquisitionCostCalculator({ paidAdSpend: 100000 });
      const res2 = calculateCustomerAcquisitionCostCalculator({ paidAdSpend: 500000 });
      expect(res2.cacPaybackMonths).toBeGreaterThan(res1.cacPaybackMonths);
    });

    it('44. verifies that increasing organic customers lowers blended CAC while paid CAC remains unchanged', () => {
      const res1 = calculateCustomerAcquisitionCostCalculator({ paidCustomers: 100, organicCustomers: 0 });
      const res2 = calculateCustomerAcquisitionCostCalculator({ paidCustomers: 100, organicCustomers: 100 });
      expect(res2.paidCac).toBe(res1.paidCac);
      expect(res2.blendedCac).toBeLessThan(res1.blendedCac);
    });

    it('45. verifies consistent return structure fields', () => {
      const res = calculateCustomerAcquisitionCostCalculator();
      expect(res).toHaveProperty('blendedCac');
      expect(res).toHaveProperty('paidCac');
      expect(res).toHaveProperty('totalAcquisitionSpend');
      expect(res).toHaveProperty('cacPaybackMonths');
      expect(res).toHaveProperty('ltvCacRatio');
      expect(res).toHaveProperty('expenseBreakdown');
      expect(res).toHaveProperty('optimizationScenarios');
      expect(res).toHaveProperty('recommendations');
    });
  });
});
