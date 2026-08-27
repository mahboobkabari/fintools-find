import { describe, it, expect } from 'vitest';
import {
  calculateCustomerLifetimeValueCalculator,
  calculateCustomerLifetimeValueTool,
  DEFAULT_CLV_INPUTS,
} from '../customer-lifetime-value-calculator.js';

describe('Flagship Customer Lifetime Value (CLV / LTV) Suite (Sprint 67 Audit)', () => {
  // 1. SaaS / Subscription Model Calculations
  describe('SaaS / Subscription Model Calculations', () => {
    it('1. calculates SaaS gross and net LTV accurately', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 4000,
        monthlyChurnPct: 4.0, // Lifespan = 25 months
        grossMarginPct: 80,
        cac: 20000,
      });

      // Gross LTV = 4000 * 25 = 100,000
      expect(res.grossLtv).toBe(100000);
      // Net LTV = 100,000 * 0.8 = 80,000
      expect(res.netLtv).toBe(80000);
      expect(res.averageLifespanMonths).toBe(25);
    });

    it('2. calculates SaaS discounted DCF LTV correctly', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 5000,
        monthlyChurnPct: 5.0,
        grossMarginPct: 80,
        annualDiscountRate: 12, // 1% monthly discount
      });

      // Discounted LTV = (5000 * 0.80) / (0.05 + 0.01) = 4000 / 0.06 = 66,667
      expect(res.discountedLtv).toBe(66667);
    });

    it('3. computes monthly margin contribution per user', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 6000,
        grossMarginPct: 75,
      });

      // Monthly margin = 6000 * 0.75 = 4500
      expect(res.monthlyMarginPerCustomer).toBe(4500);
    });
  });

  // 2. E-Commerce / Transactional Model Calculations
  describe('E-Commerce / Transactional Model Calculations', () => {
    it('4. calculates E-Commerce gross and net LTV accurately', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'ecommerce',
        aov: 2000,
        purchaseFrequency: 4, // ₹8,000 / year
        customerLifespanYears: 3, // Gross: ₹24,000
        grossMarginPct: 60,
      });

      expect(res.grossLtv).toBe(24000);
      expect(res.netLtv).toBe(14400); // 24k * 0.6
      expect(res.averageLifespanMonths).toBe(36);
    });

    it('5. calculates E-Commerce discounted DCF LTV correctly', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'ecommerce',
        aov: 3000,
        purchaseFrequency: 2, // ₹6,000/yr gross -> ₹3,600/yr margin @ 60% GM
        customerLifespanYears: 2,
        grossMarginPct: 60,
        annualDiscountRate: 10,
      });

      // Yr 1: 3600 / 1.10 = 3272.72
      // Yr 2: 3600 / 1.21 = 2975.20
      // Total DCF = 6248
      expect(res.discountedLtv).toBe(6248);
    });
  });

  // 3. Unit Economics: LTV:CAC Ratio & Payback Period
  describe('Unit Economics & CAC Payback Period', () => {
    it('6. calculates LTV:CAC ratio accurately', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 3000,
        monthlyChurnPct: 2.0, // Lifespan: 50 mo -> Gross: 150k
        grossMarginPct: 80, // Net LTV: 120k
        cac: 30000,
      });

      // LTV:CAC = 120,000 / 30,000 = 4.0x
      expect(res.ltvCacRatio).toBe(4);
      expect(res.netCustomerProfit).toBe(90000);
    });

    it('7. calculates CAC payback period in months', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 5000,
        grossMarginPct: 80, // Monthly margin: 4000
        cac: 24000,
      });

      // Payback = 24,000 / 4,000 = 6.0 months
      expect(res.cacPaybackMonths).toBe(6);
    });

    it('8. handles zero CAC safely without crashing (Infinity ratio, 0 payback)', () => {
      const res = calculateCustomerLifetimeValueCalculator({ cac: 0 });
      expect(res.ltvCacRatio).toBe(Infinity);
      expect(res.cacPaybackMonths).toBe(0);
    });
  });

  // 4. Unit Economics Health Ratings
  describe('Unit Economics Health Ratings', () => {
    it('9. classifies LTV:CAC < 1.0x as CRITICAL (insolvent)', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 1000,
        monthlyChurnPct: 10,
        grossMarginPct: 50, // Net LTV = 5000
        cac: 10000, // Ratio = 0.5x
      });

      expect(res.rating).toBe('CRITICAL');
      expect(res.ratingTitle).toContain('Insolvent');
    });

    it('10. classifies 1.0x to 2.99x as SUBOPTIMAL', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 2000,
        monthlyChurnPct: 5,
        grossMarginPct: 75, // Net LTV = 30000
        cac: 15000, // Ratio = 2.0x
      });

      expect(res.rating).toBe('SUBOPTIMAL');
    });

    it('11. classifies 3.0x to 5.0x as IDEAL (Gold Standard)', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 3500,
        monthlyChurnPct: 3.5,
        grossMarginPct: 75, // Net LTV = 75000
        cac: 20000, // Ratio = 3.75x
      });

      expect(res.rating).toBe('IDEAL');
    });

    it('12. classifies > 5.0x as UNDERINVESTING (Scale CAC)', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 50000,
        monthlyChurnPct: 1.5,
        grossMarginPct: 80, // Net LTV = 26.67L
        cac: 100000, // Ratio = 26.7x
      });

      expect(res.rating).toBe('UNDERINVESTING');
    });
  });

  // 5. 12-Month Cohort Retention & Cumulative Value Schedule
  describe('12-Month Cohort Retention Schedule', () => {
    it('13. generates 12 months of cohort retention and cumulative values', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        cohortSize: 1000,
        arpu: 2000,
        monthlyChurnPct: 5.0,
        cac: 5000,
      });

      expect(res.cohortSchedule.length).toBe(12);
      expect(res.cohortSchedule[0].month).toBe(1);
      expect(res.cohortSchedule[0].activeCustomers).toBe(1000);
      expect(res.cohortSchedule[11].month).toBe(12);
      expect(res.cohortSchedule[11].activeCustomers).toBeLessThan(1000);
    });

    it('14. tracks cohort payback achievement month', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        cohortSize: 100,
        arpu: 5000,
        monthlyChurnPct: 2.0,
        grossMarginPct: 80, // 4000/mo
        cac: 12000, // Payback ~ 3 months
      });

      const m1 = res.cohortSchedule.find((c) => c.month === 1);
      const m4 = res.cohortSchedule.find((c) => c.month === 4);
      expect(m1.isPaybackAchieved).toBe(false);
      expect(m4.isPaybackAchieved).toBe(true);
    });
  });

  // 6. Sensitivity & Growth Levers
  describe('Sensitivity & Growth Levers', () => {
    it('15. models sensitivity for price, churn, and CAC optimization', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 4000,
        monthlyChurnPct: 4,
        grossMarginPct: 80,
        cac: 20000,
      });

      expect(res.sensitivityLevers.length).toBe(4);
      expect(res.sensitivityLevers[1].lever).toContain('10% Price');
      expect(res.sensitivityLevers[2].lever).toContain('20% Churn');
      expect(res.sensitivityLevers[3].lever).toContain('15% CAC');

      // Price increase should expand LTV
      expect(res.sensitivityLevers[1].netLtv).toBeGreaterThan(res.netLtv);
    });
  });

  // 7. Smart Ranked Action Recommendations
  describe('Smart Ranked Recommendations', () => {
    it('16. generates 3 prioritized unit economics recommendations', () => {
      const res = calculateCustomerLifetimeValueCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });
  });

  // 8. Hero Verdict Text
  describe('Hero Verdict Text', () => {
    it('17. formats hero text with LTV, CAC, ratio, and payback period', () => {
      const res = calculateCustomerLifetimeValueCalculator();
      expect(res.heroText).toContain('Customer Lifetime Value (LTV)');
      expect(res.heroText).toContain('CAC of');
      expect(res.heroText).toContain('LTV:CAC ratio');
      expect(res.heroText).toContain('payback period');
    });
  });

  // 9. Industry Presets Validation
  describe('Industry Presets Validation', () => {
    it('18. validates B2B enterprise SaaS preset', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 50000,
        monthlyChurnPct: 1.5,
        grossMarginPct: 80,
        cac: 120000,
      });

      expect(res.netLtv).toBeGreaterThan(2500000);
      expect(res.ltvCacRatio).toBeGreaterThan(20);
      expect(res.cacPaybackMonths).toBe(3);
    });

    it('19. validates B2C mobile subscription preset', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 499,
        monthlyChurnPct: 5.0,
        grossMarginPct: 85,
        cac: 2000,
      });

      expect(res.netLtv).toBe(8483);
      expect(res.ltvCacRatio).toBe(4.24);
      expect(res.rating).toBe('IDEAL');
    });

    it('20. validates D2C e-commerce preset', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'ecommerce',
        aov: 2500,
        purchaseFrequency: 3.5,
        customerLifespanYears: 3,
        grossMarginPct: 60,
        cac: 3500,
      });

      expect(res.grossLtv).toBe(26250);
      expect(res.netLtv).toBe(15750);
      expect(res.ltvCacRatio).toBe(4.5);
    });

    it('21. validates FinTech wealth platform preset', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 1200,
        monthlyChurnPct: 2.0,
        grossMarginPct: 70,
        cac: 8000,
      });

      expect(res.netLtv).toBe(42000);
      expect(res.ltvCacRatio).toBe(5.25);
    });

    it('22. validates freemium tool preset', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 999,
        monthlyChurnPct: 8.0,
        grossMarginPct: 75,
        cac: 4500,
      });

      expect(res.netLtv).toBe(9366);
      expect(res.ltvCacRatio).toBe(2.08);
      expect(res.rating).toBe('SUBOPTIMAL');
    });

    it('23. validates agency retainer preset', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 75000,
        monthlyChurnPct: 4.0,
        grossMarginPct: 55,
        cac: 150000,
      });

      expect(res.netLtv).toBe(1031250);
      expect(res.ltvCacRatio).toBe(6.88);
      expect(res.cacPaybackMonths).toBe(3.6);
    });
  });

  // 10. Boundary Safeguards & Edge Cases
  describe('Boundary Safeguards & Edge Cases', () => {
    it('24. handles zero ARPU safely without throwing NaN', () => {
      const res = calculateCustomerLifetimeValueCalculator({ arpu: 0 });
      expect(res.netLtv).toBe(0);
      expect(res.ltvCacRatio).toBe(0);
    });

    it('25. clamps negative ARPU to 0', () => {
      const res = calculateCustomerLifetimeValueCalculator({ arpu: -5000 });
      expect(res.netLtv).toBe(0);
    });

    it('26. clamps negative CAC to 0', () => {
      const res = calculateCustomerLifetimeValueCalculator({ cac: -10000 });
      expect(res.cac).toBe(0);
    });

    it('27. clamps 0% churn to minimum 0.01% to prevent division by zero', () => {
      const res = calculateCustomerLifetimeValueCalculator({ monthlyChurnPct: 0 });
      expect(res.netLtv).toBeGreaterThan(0);
      expect(isFinite(res.netLtv)).toBe(true);
    });

    it('28. clamps 100% churn correctly (1-month lifespan)', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'saas',
        arpu: 5000,
        monthlyChurnPct: 100,
        grossMarginPct: 80,
      });

      expect(res.averageLifespanMonths).toBe(1);
      expect(res.netLtv).toBe(4000);
    });

    it('29. clamps gross margin between 1% and 100%', () => {
      const resLow = calculateCustomerLifetimeValueCalculator({ grossMarginPct: 0 });
      expect(resLow.grossMargin).toBe(1);

      const resHigh = calculateCustomerLifetimeValueCalculator({ grossMarginPct: 150 });
      expect(resHigh.grossMargin).toBe(100);
    });

    it('30. handles string numeric inputs cleanly', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        arpu: '5000',
        monthlyChurnPct: '5',
        grossMarginPct: '80',
        cac: '20000',
      });

      expect(res.netLtv).toBe(80000);
      expect(res.cac).toBe(20000);
    });

    it('31. supports custom currency symbol ($)', () => {
      const res = calculateCustomerLifetimeValueCalculator({ currencySymbol: '$' });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
    });

    it('32. exports calculateCustomerLifetimeValueTool alias identically', () => {
      const res1 = calculateCustomerLifetimeValueCalculator({ arpu: 5000 });
      const res2 = calculateCustomerLifetimeValueTool({ arpu: 5000 });
      expect(res1.netLtv).toBe(res2.netLtv);
      expect(res1.ltvCacRatio).toBe(res2.ltvCacRatio);
    });

    it('33. verifies default inputs when called with empty object', () => {
      const res = calculateCustomerLifetimeValueCalculator();
      expect(res.businessModel).toBe(DEFAULT_CLV_INPUTS.businessModel);
      expect(res.netLtv).toBeGreaterThan(0);
    });

    it('34. verifies primaryOutput is netLtv', () => {
      const res = calculateCustomerLifetimeValueCalculator();
      expect(res.primaryOutput).toBe(res.netLtv);
    });

    it('35. handles E-Commerce zero AOV safely', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'ecommerce',
        aov: 0,
      });
      expect(res.netLtv).toBe(0);
    });

    it('36. handles E-Commerce extreme lifespan (20 years)', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'ecommerce',
        aov: 1000,
        purchaseFrequency: 12,
        customerLifespanYears: 20,
        grossMarginPct: 50,
      });

      // 1000 * 12 * 20 * 0.5 = 120,000
      expect(res.netLtv).toBe(120000);
    });

    it('37. checks that higher gross margin increases net LTV linearly', () => {
      const res1 = calculateCustomerLifetimeValueCalculator({ grossMarginPct: 40 });
      const res2 = calculateCustomerLifetimeValueCalculator({ grossMarginPct: 80 });
      expect(res2.netLtv).toBe(res1.netLtv * 2);
    });

    it('38. checks that halving churn doubles net LTV in SaaS model', () => {
      const res1 = calculateCustomerLifetimeValueCalculator({ monthlyChurnPct: 4.0 });
      const res2 = calculateCustomerLifetimeValueCalculator({ monthlyChurnPct: 2.0 });
      expect(res2.netLtv).toBe(res1.netLtv * 2);
    });

    it('39. checks that discount rate lowers DCF LTV', () => {
      const res0 = calculateCustomerLifetimeValueCalculator({ annualDiscountRate: 0 });
      const res15 = calculateCustomerLifetimeValueCalculator({ annualDiscountRate: 15 });
      expect(res15.discountedLtv).toBeLessThan(res0.discountedLtv);
    });

    it('40. verifies cohort size clamp between 10 and 1,000,000', () => {
      const res = calculateCustomerLifetimeValueCalculator({ cohortSize: 5 });
      expect(res.cohortSchedule[0].activeCustomers).toBe(10);
    });

    it('41. verifies unknown businessModel falls back to saas', () => {
      const res = calculateCustomerLifetimeValueCalculator({ businessModel: 'other_model' });
      expect(res.businessModel).toBe('other_model');
      expect(res.netLtv).toBeGreaterThan(0);
    });

    it('42. verifies monthly margin contribution in E-Commerce model', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        businessModel: 'ecommerce',
        aov: 3000,
        purchaseFrequency: 4, // 12,000 / yr
        grossMarginPct: 50, // 6,000 / yr margin -> 500 / mo
      });

      expect(res.monthlyMarginPerCustomer).toBe(500);
    });

    it('43. verifies payback period scales with CAC', () => {
      const res1 = calculateCustomerLifetimeValueCalculator({ cac: 10000 });
      const res2 = calculateCustomerLifetimeValueCalculator({ cac: 20000 });
      expect(res2.cacPaybackMonths).toBe(res1.cacPaybackMonths * 2);
    });

    it('44. verifies net customer profit equals net LTV minus CAC', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        arpu: 4000,
        monthlyChurnPct: 5,
        grossMarginPct: 80,
        cac: 15000,
      });

      expect(res.netCustomerProfit).toBe(res.netLtv - res.cac);
    });

    it('45. handles fractional churn rates cleanly (e.g. 1.25%)', () => {
      const res = calculateCustomerLifetimeValueCalculator({
        arpu: 5000,
        monthlyChurnPct: 1.25,
        grossMarginPct: 80,
      });

      // Lifespan = 1 / 0.0125 = 80 months -> Gross = 400k -> Net = 320k
      expect(res.averageLifespanMonths).toBe(80);
      expect(res.netLtv).toBe(320000);
    });
  });
});
