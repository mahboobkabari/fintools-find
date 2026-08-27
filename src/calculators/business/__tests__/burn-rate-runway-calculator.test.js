import { describe, it, expect } from 'vitest';
import {
  calculateBurnRateRunwayCalculator,
  calculateBurnRateRunwayTool,
  DEFAULT_BURN_INPUTS,
} from '../burn-rate-runway-calculator.js';

describe('Flagship Startup Burn Rate & Runway Suite (Sprint 66 Audit)', () => {
  // 1. Gross & Net Burn Rate Calculations
  describe('Gross & Net Burn Rate Calculations', () => {
    it('1. calculates gross burn from itemized expense components accurately', () => {
      const res = calculateBurnRateRunwayCalculator({
        monthlyPayroll: 500000,
        monthlyMarketing: 100000,
        monthlyServers: 50000,
        monthlyOffice: 40000,
        monthlyOtherExpenses: 10000,
      });

      // Gross = 500k + 100k + 50k + 40k + 10k = 700k
      expect(res.grossBurn).toBe(700000);
    });

    it('2. calculates net burn by subtracting monthly revenue from gross burn', () => {
      const res = calculateBurnRateRunwayCalculator({
        monthlyPayroll: 500000,
        monthlyMarketing: 100000,
        monthlyServers: 50000,
        monthlyOffice: 40000,
        monthlyOtherExpenses: 10000, // Gross: 700k
        monthlyRevenue: 300000,
      });

      // Net burn = 700k - 300k = 400k
      expect(res.netBurn).toBe(400000);
    });

    it('3. detects profitable / default alive state when revenue exceeds gross burn', () => {
      const res = calculateBurnRateRunwayCalculator({
        monthlyPayroll: 400000,
        monthlyMarketing: 50000,
        monthlyServers: 30000,
        monthlyOffice: 20000,
        monthlyOtherExpenses: 0, // Gross: 500k
        monthlyRevenue: 600000, // Rev: 600k
      });

      expect(res.netBurn).toBe(-100000);
      expect(res.isProfitable).toBe(true);
      expect(res.isDefaultAlive).toBe(true);
      expect(res.staticRunwayMonths).toBe(Infinity);
      expect(res.alertStatus).toBe('PROFITABLE');
    });

    it('4. computes percentage share for each expense category', () => {
      const res = calculateBurnRateRunwayCalculator({
        monthlyPayroll: 600000,
        monthlyMarketing: 200000,
        monthlyServers: 100000,
        monthlyOffice: 100000,
        monthlyOtherExpenses: 0, // Gross: 10,00,000 (10L)
      });

      expect(res.payrollPct).toBe(60);
      expect(res.marketingPct).toBe(20);
      expect(res.serversPct).toBe(10);
      expect(res.officePct).toBe(10);
    });
  });

  // 2. Static Cash Runway Calculations
  describe('Static Cash Runway Calculations', () => {
    it('5. calculates static runway accurately (Cash / Net Burn)', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 6000000, // 60L
        monthlyPayroll: 600000,
        monthlyMarketing: 100000,
        monthlyServers: 50000,
        monthlyOffice: 30000,
        monthlyOtherExpenses: 20000, // Gross: 800k
        monthlyRevenue: 300000, // Net: 500k
      });

      // Runway = 6,000,000 / 500,000 = 12.0 months
      expect(res.staticRunwayMonths).toBe(12);
    });

    it('6. handles fractional runway months with 1 decimal precision', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 2500000,
        monthlyPayroll: 400000,
        monthlyMarketing: 0,
        monthlyServers: 0,
        monthlyOffice: 0,
        monthlyOtherExpenses: 0, // Gross: 400k
        monthlyRevenue: 100000, // Net: 300k
      });

      // 2,500,000 / 300,000 = 8.333 -> 8.3 months
      expect(res.staticRunwayMonths).toBe(8.3);
    });
  });

  // 3. Dynamic Month-by-Month Trajectory & Growth Modeling
  describe('Dynamic Month-by-Month Trajectory & Growth Modeling', () => {
    it('7. models 36 months trajectory with MoM revenue growth', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 5000000,
        monthlyRevenue: 200000,
        monthlyPayroll: 500000,
        monthlyRevGrowthPct: 10,
        monthlyExpGrowthPct: 0,
      });

      expect(res.monthlyTrajectory.length).toBe(36);
      expect(res.monthlyTrajectory[0].month).toBe(1);
      expect(res.monthlyTrajectory[0].revenue).toBe(220000); // 200k * 1.10
    });

    it('8. identifies break-even month when growing revenue catches expense line', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 10000000,
        monthlyRevenue: 400000,
        monthlyPayroll: 600000,
        monthlyMarketing: 0,
        monthlyServers: 0,
        monthlyOffice: 0,
        monthlyOtherExpenses: 0, // Gross: 600k
        monthlyRevGrowthPct: 10,
        monthlyExpGrowthPct: 2,
      });

      expect(res.breakEvenMonth).toBeDefined();
      expect(res.breakEvenMonth).toBeGreaterThan(1);
      expect(res.isDefaultAlive).toBe(true);
    });

    it('9. identifies dynamic zero cash month when cash runs out', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 1000000,
        monthlyRevenue: 50000,
        monthlyPayroll: 550000,
        monthlyMarketing: 0,
        monthlyServers: 0,
        monthlyOffice: 0,
        monthlyOtherExpenses: 0, // Net: 500k
        monthlyRevGrowthPct: 0,
        monthlyExpGrowthPct: 0,
      });

      // 1M cash / 500k net burn = Month 2
      expect(res.dynamicZeroCashMonth).toBe(2);
    });
  });

  // 4. Health Alert Classifications
  describe('Health Alert Classifications', () => {
    it('10. classifies < 3 months as CRITICAL', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 1000000,
        monthlyPayroll: 600000,
        monthlyRevenue: 100000, // Net: 500k -> 2.0 mo
      });

      expect(res.alertStatus).toBe('CRITICAL');
      expect(res.alertTitle).toContain('Critical');
    });

    it('11. classifies 3 - 6 months as URGENT (Active Fundraising)', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 2000000,
        monthlyPayroll: 600000,
        monthlyMarketing: 0,
        monthlyServers: 0,
        monthlyOffice: 0,
        monthlyOtherExpenses: 0,
        monthlyRevenue: 100000, // Net: 500k -> 4.0 mo
      });

      expect(res.alertStatus).toBe('URGENT');
      expect(res.alertTitle).toContain('Fundraising');
    });

    it('12. classifies 6 - 12 months as MODERATE', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 4000000,
        monthlyPayroll: 600000,
        monthlyMarketing: 0,
        monthlyServers: 0,
        monthlyOffice: 0,
        monthlyOtherExpenses: 0,
        monthlyRevenue: 100000, // Net: 500k -> 8.0 mo
      });

      expect(res.alertStatus).toBe('MODERATE');
    });

    it('13. classifies > 12 months as HEALTHY', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 8000000,
        monthlyPayroll: 600000,
        monthlyMarketing: 0,
        monthlyServers: 0,
        monthlyOffice: 0,
        monthlyOtherExpenses: 0,
        monthlyRevenue: 100000, // Net: 500k -> 16.0 mo
      });

      expect(res.alertStatus).toBe('HEALTHY');
    });
  });

  // 5. Safety Buffer Gap & Capital Needed
  describe('Safety Buffer Gap & Capital Needed', () => {
    it('14. calculates cash needed to achieve 6-month safety buffer when in deficit', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 1500000,
        monthlyPayroll: 600000,
        monthlyMarketing: 0,
        monthlyServers: 0,
        monthlyOffice: 0,
        monthlyOtherExpenses: 0,
        monthlyRevenue: 100000, // Net: 500k -> 3.0 mo (Gap = -3.0 mo vs 6.0 mo buffer)
        targetSafetyMonths: 6,
      });

      expect(res.bufferGapMonths).toBe(-3);
      // 3 months * 500k net burn = 1.5M needed
      expect(res.cashNeededForBuffer).toBe(1500000);
    });

    it('15. returns zero cash needed when runway exceeds target safety buffer', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 6000000,
        monthlyPayroll: 600000,
        monthlyMarketing: 0,
        monthlyServers: 0,
        monthlyOffice: 0,
        monthlyOtherExpenses: 0,
        monthlyRevenue: 100000, // Net: 500k -> 12.0 mo
        targetSafetyMonths: 6,
      });

      expect(res.bufferGapMonths).toBe(6);
      expect(res.cashNeededForBuffer).toBe(0);
    });
  });

  // 6. Cost-Cutting & Scenario Analysis
  describe('Cost-Cutting & Scenario Analysis', () => {
    it('16. models 10%, 20%, and 30% cost cuts with runway extensions', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 5000000,
        monthlyPayroll: 800000,
        monthlyMarketing: 100000,
        monthlyServers: 50000,
        monthlyOffice: 50000,
        monthlyOtherExpenses: 0, // Gross: 1,000,000
        monthlyRevenue: 200000, // Net: 800k -> 6.3 mo
      });

      expect(res.runwayScenarios.length).toBe(4);
      expect(res.runwayScenarios[0].scenario).toBe('Current Baseline');
      expect(res.runwayScenarios[1].scenario).toContain('10%');
      expect(res.runwayScenarios[2].scenario).toContain('20%');
      expect(res.runwayScenarios[3].scenario).toContain('30%');

      // 20% cut reduces gross from 10L to 8L -> Net becomes 6L -> Runway = 50L / 6L = 8.3 mo (+2.0 mo)
      expect(res.runwayScenarios[2].extendedBy).toContain('+');
    });
  });

  // 7. Smart Ranked Action Recommendations
  describe('Smart Ranked Recommendations', () => {
    it('17. produces 3 prioritized executive recommendations', () => {
      const res = calculateBurnRateRunwayCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });

    it('18. warns when payroll dominates >60% of gross expenses', () => {
      const res = calculateBurnRateRunwayCalculator({
        monthlyPayroll: 800000,
        monthlyMarketing: 50000,
        monthlyServers: 50000,
        monthlyOffice: 50000,
        monthlyOtherExpenses: 50000, // Gross: 10L (Payroll: 80%)
      });

      expect(res.recommendations[1].title).toContain('Payroll');
    });
  });

  // 8. Hero Verdict Summary
  describe('Hero Verdict Summary', () => {
    it('19. formats hero text with runway months, net burn, and gross burn', () => {
      const res = calculateBurnRateRunwayCalculator();
      expect(res.heroText).toContain('Current cash runway');
      expect(res.heroText).toContain('net burn');
      expect(res.heroText).toContain('Gross:');
    });
  });

  // 9. Startup Presets Validation
  describe('Startup Presets Validation', () => {
    it('20. validates pre-seed startup preset', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 2500000,
        monthlyRevenue: 50000,
        monthlyPayroll: 250000,
        monthlyMarketing: 50000,
        monthlyServers: 20000,
        monthlyOffice: 20000,
        monthlyOtherExpenses: 10000,
      });

      // Gross: 350k, Net: 300k -> 2.5M / 300k = 8.3 mo
      expect(res.grossBurn).toBe(350000);
      expect(res.netBurn).toBe(300000);
      expect(res.staticRunwayMonths).toBe(8.3);
    });

    it('21. validates seed stage SaaS preset', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 15000000,
        monthlyRevenue: 400000,
        monthlyPayroll: 900000,
        monthlyMarketing: 250000,
        monthlyServers: 100000,
        monthlyOffice: 80000,
        monthlyOtherExpenses: 30000,
      });

      // Gross: 13.6L, Net: 9.6L -> 1.5 Cr / 9.6L = 15.6 mo
      expect(res.grossBurn).toBe(1360000);
      expect(res.netBurn).toBe(960000);
      expect(res.staticRunwayMonths).toBe(15.6);
      expect(res.alertStatus).toBe('HEALTHY');
    });

    it('22. validates series A scaleup preset', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 50000000,
        monthlyRevenue: 2500000,
        monthlyPayroll: 4500000,
        monthlyMarketing: 1500000,
        monthlyServers: 500000,
        monthlyOffice: 400000,
        monthlyOtherExpenses: 200000,
      });

      // Gross: 71L, Net: 46L -> 5 Cr / 46L = 10.9 mo
      expect(res.grossBurn).toBe(7100000);
      expect(res.netBurn).toBe(4600000);
      expect(res.staticRunwayMonths).toBe(10.9);
      expect(res.alertStatus).toBe('MODERATE');
    });

    it('23. validates profitable bootstrapped preset', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 5000000,
        monthlyRevenue: 1200000,
        monthlyPayroll: 600000,
        monthlyMarketing: 150000,
        monthlyServers: 80000,
        monthlyOffice: 50000,
        monthlyOtherExpenses: 20000,
      });

      expect(res.isProfitable).toBe(true);
      expect(res.netBurn).toBe(-300000);
      expect(res.heroText).toContain('Default Alive');
    });

    it('24. validates distressed bridge preset (<3 mo)', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 1500000,
        monthlyRevenue: 200000,
        monthlyPayroll: 600000,
        monthlyMarketing: 100000,
        monthlyServers: 50000,
        monthlyOffice: 50000,
        monthlyOtherExpenses: 20000,
      });

      // Gross: 820k, Net: 620k -> 1.5M / 620k = 2.4 mo
      expect(res.staticRunwayMonths).toBe(2.4);
      expect(res.alertStatus).toBe('CRITICAL');
    });

    it('25. validates pre-revenue deeptech R&D preset', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 30000000,
        monthlyRevenue: 0,
        monthlyPayroll: 1800000,
        monthlyMarketing: 200000,
        monthlyServers: 500000,
        monthlyOffice: 300000,
        monthlyOtherExpenses: 200000,
      });

      // Gross: 30L, Net: 30L -> 3 Cr / 30L = 10.0 mo
      expect(res.netBurn).toBe(3000000);
      expect(res.staticRunwayMonths).toBe(10);
    });
  });

  // 10. Boundary Safeguards & Edge Cases
  describe('Boundary Safeguards & Edge Cases', () => {
    it('26. handles zero cash balance safely', () => {
      const res = calculateBurnRateRunwayCalculator({ cashBalance: 0 });
      expect(res.staticRunwayMonths).toBe(0);
      expect(res.alertStatus).toBe('CRITICAL');
    });

    it('27. handles zero revenue safely', () => {
      const res = calculateBurnRateRunwayCalculator({ monthlyRevenue: 0 });
      expect(res.netBurn).toBe(res.grossBurn);
    });

    it('28. handles zero expenses safely', () => {
      const res = calculateBurnRateRunwayCalculator({
        monthlyPayroll: 0,
        monthlyMarketing: 0,
        monthlyServers: 0,
        monthlyOffice: 0,
        monthlyOtherExpenses: 0,
        monthlyRevenue: 100000,
      });

      expect(res.grossBurn).toBe(0);
      expect(res.isProfitable).toBe(true);
      expect(res.staticRunwayMonths).toBe(Infinity);
    });

    it('29. clamps negative cash to 0', () => {
      const res = calculateBurnRateRunwayCalculator({ cashBalance: -500000 });
      expect(res.cashBalance).toBe(0);
    });

    it('30. clamps negative revenue to 0', () => {
      const res = calculateBurnRateRunwayCalculator({ monthlyRevenue: -100000 });
      expect(res.monthlyRevenue).toBe(0);
    });

    it('31. clamps negative expense inputs to 0', () => {
      const res = calculateBurnRateRunwayCalculator({
        monthlyPayroll: -50000,
        monthlyMarketing: -20000,
      });
      expect(res.payroll).toBe(0);
      expect(res.marketing).toBe(0);
    });

    it('32. handles 0% revenue growth safely', () => {
      const res = calculateBurnRateRunwayCalculator({ monthlyRevGrowthPct: 0 });
      expect(res.monthlyRevGrowth).toBe(0);
      expect(res.monthlyTrajectory[0].revenue).toBe(res.monthlyRevenue);
    });

    it('33. clamps extreme positive revenue growth to 100%', () => {
      const res = calculateBurnRateRunwayCalculator({ monthlyRevGrowthPct: 200 });
      expect(res.monthlyRevGrowth).toBe(100);
    });

    it('34. clamps extreme negative revenue growth to -50%', () => {
      const res = calculateBurnRateRunwayCalculator({ monthlyRevGrowthPct: -80 });
      expect(res.monthlyRevGrowth).toBe(-50);
    });

    it('35. handles string numeric inputs cleanly', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: '4000000',
        monthlyRevenue: '200000',
        monthlyPayroll: '400000',
      });
      expect(res.cashBalance).toBe(4000000);
      expect(res.monthlyRevenue).toBe(200000);
    });

    it('36. supports custom currency symbol ($)', () => {
      const res = calculateBurnRateRunwayCalculator({ currencySymbol: '$' });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
    });

    it('37. exports calculateBurnRateRunwayTool alias identically', () => {
      const res1 = calculateBurnRateRunwayCalculator({ cashBalance: 5000000 });
      const res2 = calculateBurnRateRunwayTool({ cashBalance: 5000000 });
      expect(res1.staticRunwayMonths).toBe(res2.staticRunwayMonths);
      expect(res1.grossBurn).toBe(res2.grossBurn);
    });

    it('38. handles large unicorn treasury (₹100 Crores)', () => {
      const res = calculateBurnRateRunwayCalculator({
        cashBalance: 1000000000,
        monthlyPayroll: 20000000,
        monthlyRevenue: 10000000, // Net: 1 Cr/mo -> 100 mo
      });

      expect(res.staticRunwayMonths).toBeGreaterThan(30);
      expect(res.alertStatus).toBe('HEALTHY');
    });

    it('39. verifies default inputs when invoked with empty object', () => {
      const res = calculateBurnRateRunwayCalculator();
      expect(res.cashBalance).toBe(DEFAULT_BURN_INPUTS.cashBalance);
      expect(res.grossBurn).toBeGreaterThan(0);
      expect(res.staticRunwayMonths).toBeGreaterThan(0);
    });

    it('40. verifies primaryOutput is numeric runway', () => {
      const res = calculateBurnRateRunwayCalculator();
      expect(typeof res.primaryOutput).toBe('number');
    });

    it('41. checks that effectiveRunwayMonths returns "Infinite (Profitable)" when profitable', () => {
      const res = calculateBurnRateRunwayCalculator({
        monthlyRevenue: 1000000,
        monthlyPayroll: 500000,
        monthlyMarketing: 0,
        monthlyServers: 0,
        monthlyOffice: 0,
        monthlyOtherExpenses: 0,
      });
      expect(res.effectiveRunwayMonths).toContain('Profitable');
    });

    it('42. verifies targetSafetyMonths validation clamp between 1 and 36', () => {
      const resLow = calculateBurnRateRunwayCalculator({ targetSafetyMonths: 0 });
      expect(resLow.safetyMonths).toBe(1);

      const resHigh = calculateBurnRateRunwayCalculator({ targetSafetyMonths: 50 });
      expect(resHigh.safetyMonths).toBe(36);
    });

    it('43. checks that higher marketing expenses increase gross burn linearly', () => {
      const res1 = calculateBurnRateRunwayCalculator({ monthlyMarketing: 100000 });
      const res2 = calculateBurnRateRunwayCalculator({ monthlyMarketing: 300000 });
      expect(res2.grossBurn).toBe(res1.grossBurn + 200000);
      expect(res2.netBurn).toBe(res1.netBurn + 200000);
    });

    it('44. checks that higher cash balance increases runway linearly', () => {
      const res1 = calculateBurnRateRunwayCalculator({ cashBalance: 5000000 });
      const res2 = calculateBurnRateRunwayCalculator({ cashBalance: 10000000 });
      expect(res2.staticRunwayMonths).toBe(Math.round(res1.staticRunwayMonths * 2 * 10) / 10);
    });

    it('45. verifies dynamic month trajectory net cash flow equals revenue minus burn', () => {
      const res = calculateBurnRateRunwayCalculator({
        monthlyRevGrowthPct: 0,
        monthlyExpGrowthPct: 0,
      });
      const m1 = res.monthlyTrajectory[0];
      expect(m1.netCashFlow).toBe(m1.revenue - m1.grossBurn);
    });
  });
});
