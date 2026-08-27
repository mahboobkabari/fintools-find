import { describe, it, expect } from 'vitest';
import {
  calculateWorkingCapitalCalculator,
  calculateWorkingCapitalTool,
  INDUSTRY_WORKING_CAPITAL_BENCHMARKS,
} from '../working-capital-calculator.js';

describe('Flagship Working Capital & Cash Conversion Cycle Decision Suite (Sprint 62 Audit)', () => {
  // 1. Net Working Capital & Baseline Accounting
  describe('Net Working Capital (NWC) & Liquidity Balances', () => {
    it('1. calculates standard positive working capital baseline for ₹1 Cr revenue firm', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 500000,
        accountsReceivable: 1200000,
        inventory: 800000,
        otherCurrentAssets: 100000,
        accountsPayable: 900000,
        shortTermDebt: 400000,
        accruedExpenses: 200000,
        annualRevenue: 10000000,
        annualCogs: 6000000,
        costOfCapital: 12,
      });

      expect(res.totalCurrentAssets).toBe(2600000); // 5L + 12L + 8L + 1L
      expect(res.totalCurrentLiabilities).toBe(1500000); // 9L + 4L + 2L
      expect(res.netWorkingCapital).toBe(1100000); // 26L - 15L
      expect(res.primaryOutput).toBe(1100000);
      expect(res.isSurplus).toBe(true);
      expect(res.currentRatio).toBe(1.73); // 26 / 15
      expect(res.quickRatio).toBe(1.13); // (5L + 12L) / 15L = 17 / 15
      expect(res.cashRatio).toBe(0.33); // 5 / 15
    });

    it('2. calculates working capital deficit (negative NWC) during liquidity crunch', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 200000,
        accountsReceivable: 800000,
        inventory: 500000,
        otherCurrentAssets: 50000,
        accountsPayable: 1800000,
        shortTermDebt: 1200000,
        accruedExpenses: 600000,
      });

      expect(res.totalCurrentAssets).toBe(1550000);
      expect(res.totalCurrentLiabilities).toBe(3600000);
      expect(res.netWorkingCapital).toBe(-2050000);
      expect(res.isSurplus).toBe(false);
      expect(res.currentRatio).toBe(0.43); // 15.5 / 36
      expect(res.heroText).toContain('Working Capital Deficit');
    });

    it('3. calculates exact zero net working capital balance', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 500000,
        accountsReceivable: 500000,
        inventory: 0,
        otherCurrentAssets: 0,
        accountsPayable: 1000000,
        shortTermDebt: 0,
        accruedExpenses: 0,
      });

      expect(res.totalCurrentAssets).toBe(1000000);
      expect(res.totalCurrentLiabilities).toBe(1000000);
      expect(res.netWorkingCapital).toBe(0);
      expect(res.currentRatio).toBe(1.0);
      expect(res.isSurplus).toBe(true);
    });
  });

  // 2. Cash Conversion Cycle (CCC) & Operating Cycle Days
  describe('Cash Conversion Cycle (CCC) & Velocity Analytics', () => {
    it('4. calculates DSO, DIO, DPO and net CCC accurately', () => {
      const res = calculateWorkingCapitalCalculator({
        accountsReceivable: 1200000,
        inventory: 800000,
        accountsPayable: 900000,
        annualRevenue: 10000000,
        annualCogs: 6000000,
      });

      // DSO = (1,200,000 / 10,000,000) * 365 = 43.8 -> 44 days
      expect(res.dso).toBe(44);
      // DIO = (800,000 / 6,000,000) * 365 = 48.67 -> 49 days
      expect(res.dio).toBe(49);
      // DPO = (900,000 / 6,000,000) * 365 = 54.75 -> 55 days
      expect(res.dpo).toBe(55);
      // Operating Cycle = DSO + DIO = 44 + 49 = 93 days
      expect(res.operatingCycle).toBe(93);
      // CCC = DIO + DSO - DPO = 49 + 44 - 55 = 38 days
      expect(res.cashConversionCycle).toBe(38);
    });

    it('5. calculates negative Cash Conversion Cycle (Amazon / Dell negative working capital model)', () => {
      const res = calculateWorkingCapitalCalculator({
        accountsReceivable: 100000, // 3.65 days DSO
        inventory: 200000, // 12.16 days DIO
        accountsPayable: 1000000, // 60.83 days DPO
        annualRevenue: 10000000,
        annualCogs: 6000000,
      });

      expect(res.dso).toBe(4);
      expect(res.dio).toBe(12);
      expect(res.dpo).toBe(61);
      // CCC = 12 + 4 - 61 = -45 days
      expect(res.cashConversionCycle).toBeLessThan(0);
    });
  });

  // 3. Efficiency & Turnover Ratios
  describe('Working Capital Turnover & Capital Intensity', () => {
    it('6. calculates working capital turnover ratio (Revenue / NWC)', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 500000,
        accountsReceivable: 1000000,
        inventory: 500000,
        otherCurrentAssets: 0,
        accountsPayable: 1000000,
        shortTermDebt: 0,
        accruedExpenses: 0,
        annualRevenue: 20000000, // 2 Cr
      });

      // Total CA = 20L, Total CL = 10L, NWC = 10L
      // Turnover = 200L / 10L = 20x
      expect(res.netWorkingCapital).toBe(1000000);
      expect(res.workingCapitalTurnover).toBe(20);
    });

    it('7. calculates working capital as percentage of revenue', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 1000000,
        accountsReceivable: 2000000,
        inventory: 1000000,
        otherCurrentAssets: 0,
        accountsPayable: 2000000,
        shortTermDebt: 0,
        accruedExpenses: 0,
        annualRevenue: 20000000,
      });

      // NWC = 20L. % of revenue = 20L / 200L = 10%
      expect(res.workingCapitalAsPctOfRevenue).toBe(10);
    });
  });

  // 4. Trapped Capital Financing Cost & Opportunity Unlock
  describe('Financing Cost of Trapped Working Capital', () => {
    it('8. calculates annual financing cost of positive working capital at 12%', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 500000,
        accountsReceivable: 1500000,
        inventory: 1000000,
        otherCurrentAssets: 0,
        accountsPayable: 1000000,
        shortTermDebt: 0,
        accruedExpenses: 0,
        costOfCapital: 12,
      });

      // CA = 30L, CL = 10L, NWC = 20L
      // Interest = 20L * 12% = 2.4L
      expect(res.netWorkingCapital).toBe(2000000);
      expect(res.annualInterestCost).toBe(240000);
    });

    it('9. computes 15% receivable/inventory compression cash unlock', () => {
      const res = calculateWorkingCapitalCalculator({
        accountsReceivable: 1000000,
        inventory: 1000000,
        annualRevenue: 10000000,
        annualCogs: 6000000,
        costOfCapital: 10,
      });

      // 15% of 10L AR + 15% of 10L Inv = 1.5L + 1.5L = 3.0L
      expect(res.totalPotentialCashUnlock).toBe(300000);
      expect(res.annualInterestSaved).toBe(30000); // 3L * 10%
    });
  });

  // 5. Liquidity Health Scoring
  describe('Liquidity Health Score & Diagnostic Status', () => {
    it('10. classifies healthy current ratio 1.73 as Optimal Liquidity', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 500000,
        accountsReceivable: 1200000,
        inventory: 800000,
        otherCurrentAssets: 100000,
        accountsPayable: 900000,
        shortTermDebt: 400000,
        accruedExpenses: 200000,
      });

      expect(res.healthScore).toBeGreaterThanOrEqual(70);
      expect(res.healthStatus).toBe('Optimal Liquidity');
    });

    it('11. classifies distressed sub-1.0 current ratio as Severe Deficit Risk', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 100000,
        accountsReceivable: 200000,
        inventory: 100000,
        accountsPayable: 1000000,
        shortTermDebt: 1000000,
      });

      expect(res.currentRatio).toBeLessThan(1.0);
      expect(res.healthScore).toBeLessThan(40);
      expect(res.healthStatus).toContain('Severe Liquidity Deficit');
    });
  });

  // 6. Scenario Sensitivity Modeling
  describe('Scenario Sensitivity Modeling', () => {
    it('12. generates current, optimized, and stressed scenarios', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 500000,
        accountsReceivable: 1200000,
        inventory: 800000,
        accountsPayable: 900000,
        annualRevenue: 10000000,
        annualCogs: 6000000,
      });

      expect(res.scenarios.current).toBeDefined();
      expect(res.scenarios.optimized).toBeDefined();
      expect(res.scenarios.stressed).toBeDefined();
      // Stressed scenario increases cash conversion cycle
      expect(res.scenarios.stressed.ccc).toBeGreaterThan(res.scenarios.current.ccc);
    });
  });

  // 7. Industry Benchmark Standards
  describe('Industry Benchmark Reference Data', () => {
    it('13. verifies industry benchmark reference lookup table', () => {
      expect(INDUSTRY_WORKING_CAPITAL_BENCHMARKS.ecommerce.targetCCC).toBe(-5);
      expect(INDUSTRY_WORKING_CAPITAL_BENCHMARKS.manufacturing.targetCurrentRatio).toBe(1.8);
      expect(INDUSTRY_WORKING_CAPITAL_BENCHMARKS.saas.targetDIO).toBe(0);
      expect(INDUSTRY_WORKING_CAPITAL_BENCHMARKS.construction.targetDSO).toBe(75);
    });
  });

  // 8. Edge Cases, Zero Values & Boundaries
  describe('Edge Cases & Boundary Safeguards', () => {
    it('14. handles zero liabilities without division by zero', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 500000,
        accountsReceivable: 500000,
        inventory: 0,
        otherCurrentAssets: 0,
        accountsPayable: 0,
        shortTermDebt: 0,
        accruedExpenses: 0,
      });

      expect(res.totalCurrentLiabilities).toBe(0);
      expect(res.currentRatio).toBe(99.9);
      expect(res.quickRatio).toBe(99.9);
      expect(res.netWorkingCapital).toBe(1000000);
    });

    it('15. handles zero revenue and zero COGS gracefully', () => {
      const res = calculateWorkingCapitalCalculator({
        annualRevenue: 0,
        annualCogs: 0,
      });

      expect(res.dso).toBe(0);
      expect(res.dio).toBe(0);
      expect(res.dpo).toBe(0);
      expect(res.cashConversionCycle).toBe(0);
      expect(res.workingCapitalTurnover).toBe(0);
    });

    it('16. clamps negative inputs safely to 0', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: -500000,
        accountsReceivable: -200000,
        inventory: 800000,
        otherCurrentAssets: 100000,
        accountsPayable: -100000,
      });

      expect(res.totalCurrentAssets).toBe(900000); // 0 cash + 0 AR + 800K inv + 100K other
    });

    it('17. clamps cost of capital to max 50%', () => {
      const res = calculateWorkingCapitalCalculator({ costOfCapital: 80 });
      expect(res.annualInterestCost).toBeLessThanOrEqual(res.netWorkingCapital * 0.5);
    });

    it('18. handles enterprise balance sheet (₹1,000 Crores revenue)', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 500000000,
        accountsReceivable: 1500000000,
        inventory: 1000000000,
        otherCurrentAssets: 100000000,
        accountsPayable: 1200000000,
        shortTermDebt: 800000000,
        accruedExpenses: 200000000,
        annualRevenue: 10000000000,
        annualCogs: 6000000000,
      });

      expect(res.totalCurrentAssets).toBe(3100000000);
      expect(res.totalCurrentLiabilities).toBe(2200000000);
      expect(res.netWorkingCapital).toBe(900000000);
      expect(res.currentRatio).toBe(1.41);
    });
  });

  // 9. Framework Compatibility & Tool Aliases
  describe('Framework Compatibility & Tool Aliases', () => {
    it('19. defaults to standard inputs when called with empty object', () => {
      const res = calculateWorkingCapitalCalculator();
      expect(res.netWorkingCapital).toBe(1100000);
      expect(res.currentRatio).toBe(1.73);
    });

    it('20. exports calculateWorkingCapitalTool alias identically', () => {
      const res1 = calculateWorkingCapitalCalculator({ cash: 600000 });
      const res2 = calculateWorkingCapitalTool({ cash: 600000 });
      expect(res1.netWorkingCapital).toBe(res2.netWorkingCapital);
      expect(res1.primaryOutput).toBe(res2.primaryOutput);
    });

    it('21. handles string inputs safely', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: '800000',
        accountsReceivable: '1200000',
        inventory: '800000',
        otherCurrentAssets: '100000',
        annualRevenue: '20000000',
      });
      expect(res.totalCurrentAssets).toBe(2900000);
    });

    it('22. handles invalid string parameters without throwing', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 'invalid',
        accountsReceivable: 'bad_number',
        inventory: 800000,
        otherCurrentAssets: 100000,
      });
      expect(res.totalCurrentAssets).toBe(900000); // 800K inv + 100K other
    });

    it('23. formats currency symbols cleanly in hero text', () => {
      const res = calculateWorkingCapitalCalculator({ currencySymbol: '$' });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
    });

    it('24. generates 3 ranked recommendations', () => {
      const res = calculateWorkingCapitalCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });

    it('25. provides distinct recommendation for working capital deficit', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 100000,
        accountsPayable: 2000000,
      });
      expect(res.recommendations[0].title).toContain('Working Capital Injection');
    });

    it('26. handles zero cash ratio safely', () => {
      const res = calculateWorkingCapitalCalculator({ cash: 0 });
      expect(res.cashRatio).toBe(0);
    });

    it('27. handles pure service firm with zero inventory', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 500000,
        accountsReceivable: 1000000,
        inventory: 0,
        otherCurrentAssets: 0,
        accountsPayable: 1000000,
        shortTermDebt: 0,
        accruedExpenses: 0,
        annualRevenue: 10000000,
        annualCogs: 5000000,
      });
      expect(res.dio).toBe(0);
      expect(res.quickRatio).toBe(res.currentRatio);
    });

    it('28. handles pure retail firm with instant cash sales (0 DSO)', () => {
      const res = calculateWorkingCapitalCalculator({
        accountsReceivable: 0,
      });
      expect(res.dso).toBe(0);
    });

    it('29. handles cash on delivery with 0 DPO (immediate payment)', () => {
      const res = calculateWorkingCapitalCalculator({
        accountsPayable: 0,
      });
      expect(res.dpo).toBe(0);
    });

    it('30. computes correct Quick Assets invariant (Cash + AR)', () => {
      const res = calculateWorkingCapitalCalculator({ cash: 700000, accountsReceivable: 1300000, accountsPayable: 1000000, shortTermDebt: 0, accruedExpenses: 0 });
      // Quick Assets = 20L, Liabilities = 10L -> Quick Ratio = 2.0
      expect(res.quickRatio).toBe(2.0);
    });

    it('31. checks health score bounds between 10 and 100', () => {
      const res1 = calculateWorkingCapitalCalculator({ cash: 0, accountsPayable: 50000000 });
      expect(res1.healthScore).toBeGreaterThanOrEqual(10);

      const res2 = calculateWorkingCapitalCalculator({ cash: 10000000, accountsPayable: 5000000, accountsReceivable: 5000000 });
      expect(res2.healthScore).toBeLessThanOrEqual(100);
    });

    it('32. handles negative cost of capital by clamping to 0', () => {
      const res = calculateWorkingCapitalCalculator({ costOfCapital: -10 });
      expect(res.annualInterestCost).toBe(0);
    });

    it('33. ensures operating cycle equals DSO + DIO invariant', () => {
      const res = calculateWorkingCapitalCalculator({ accountsReceivable: 1500000, inventory: 900000, annualRevenue: 12000000, annualCogs: 8000000 });
      expect(res.operatingCycle).toBe(res.dso + res.dio);
    });

    it('34. ensures cash conversion cycle equals DIO + DSO - DPO invariant', () => {
      const res = calculateWorkingCapitalCalculator({ accountsReceivable: 1500000, inventory: 900000, accountsPayable: 800000, annualRevenue: 12000000, annualCogs: 8000000 });
      expect(res.cashConversionCycle).toBe(res.dio + res.dso - res.dpo);
    });

    it('35. returns proper health color string for optimal liquidity', () => {
      const res = calculateWorkingCapitalCalculator();
      expect(res.healthColor).toContain('semantic-success');
    });

    it('36. returns proper health color string for severe liquidity deficit', () => {
      const res = calculateWorkingCapitalCalculator({ cash: 0, accountsPayable: 5000000 });
      expect(res.healthColor).toContain('rose');
    });

    it('37. handles 100% quick ratio threshold', () => {
      const res = calculateWorkingCapitalCalculator({ cash: 500000, accountsReceivable: 500000, accountsPayable: 1000000, shortTermDebt: 0, accruedExpenses: 0 });
      expect(res.quickRatio).toBe(1.0);
    });

    it('38. handles equal DIO and DPO (inventory financed completely by supplier credit)', () => {
      const res = calculateWorkingCapitalCalculator({ inventory: 1000000, accountsPayable: 1000000, annualCogs: 6000000 });
      expect(res.dio).toBe(res.dpo);
      expect(res.cashConversionCycle).toBe(res.dso);
    });

    it('39. computes positive interest savings from 15% working capital unlock', () => {
      const res = calculateWorkingCapitalCalculator({ accountsReceivable: 2000000, inventory: 2000000, annualRevenue: 10000000, annualCogs: 6000000 });
      expect(res.annualInterestSaved).toBeGreaterThan(0);
    });

    it('40. handles non-round decimals in revenue and cogs', () => {
      const res = calculateWorkingCapitalCalculator({ accountsReceivable: 1000000, inventory: 1000000, annualRevenue: 12345678, annualCogs: 7654321 });
      expect(res.dso).toBeGreaterThan(0);
      expect(res.dio).toBeGreaterThan(0);
    });

    it('41. verifies stressed scenario adds 30 days of revenue delay to NWC', () => {
      const res = calculateWorkingCapitalCalculator({ annualRevenue: 36500000 }); // 1L / day
      expect(res.scenarios.stressed.nwc).toBe(res.netWorkingCapital + 3000000);
    });

    it('42. validates wholesale industry preset values', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 1000000,
        accountsReceivable: 4500000,
        inventory: 3500000,
        otherCurrentAssets: 250000,
        accountsPayable: 5000000,
        shortTermDebt: 1500000,
        accruedExpenses: 400000,
        annualRevenue: 60000000,
        annualCogs: 50000000,
      });
      expect(res.netWorkingCapital).toBe(2350000);
      expect(res.currentRatio).toBe(1.34);
    });

    it('43. validates construction industry preset values', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 2000000,
        accountsReceivable: 12000000,
        inventory: 2000000,
        otherCurrentAssets: 1000000,
        accountsPayable: 9000000,
        shortTermDebt: 4000000,
        accruedExpenses: 1500000,
        annualRevenue: 80000000,
        annualCogs: 60000000,
      });
      expect(res.netWorkingCapital).toBe(2500000);
      expect(res.dso).toBe(55);
    });

    it('44. handles very small positive current ratio (0.01)', () => {
      const res = calculateWorkingCapitalCalculator({
        cash: 1000,
        accountsReceivable: 0,
        inventory: 0,
        otherCurrentAssets: 0,
        accountsPayable: 100000,
        shortTermDebt: 0,
        accruedExpenses: 0,
      });
      expect(res.currentRatio).toBe(0.01);
    });

    it('45. verifies heroText reflects positive surplus with exact values', () => {
      const res = calculateWorkingCapitalCalculator({ cash: 500000, accountsReceivable: 1000000, accountsPayable: 500000, shortTermDebt: 0, accruedExpenses: 0 });
      expect(res.heroText).toContain('Net Working Capital is positive');
      expect(res.heroText).toContain('Current Ratio');
    });
  });
});
