import { describe, it, expect } from 'vitest';
import { calculateLumpsumTool, calculateLumpsumCalculator } from '../lumpsum-calculator.js';

describe('Flagship Lumpsum Investment Decision Engine Suite (Sprint 58 Audit)', () => {
  // 1. Core Annual Compound Growth Calculations
  describe('Core Annual Compound Growth Benchmarks', () => {
    it('1. calculates benchmark ₹1 Lakh @ 12% for 10 years (Annually)', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 12,
        tenureYears: 10,
        compoundingFrequency: 'annually',
      });
      expect(res.totalInvested).toBe(100000);
      // 100000 * (1.12)^10 = 310,584.82 => 310585
      expect(res.maturityValue).toBe(310585);
      expect(res.estReturns).toBe(210585);
      expect(res.wealthMultiplier).toBe(3.11);
      expect(res.absoluteReturnPct).toBe(211);
      expect(res.cagr).toBe(12);
      expect(res.primaryOutput).toBe(310585);
    });

    it('2. calculates ₹5 Lakhs @ 15% for 15 years (Aggressive Equity)', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 500000,
        expectedReturnRate: 15,
        tenureYears: 15,
      });
      // 500000 * (1.15)^15 = 4,068,530.8 => 4068531
      expect(res.totalInvested).toBe(500000);
      expect(res.maturityValue).toBe(4068531);
      expect(res.wealthMultiplier).toBe(8.14);
    });

    it('3. calculates ₹10 Lakhs @ 12% for 20 years (Retirement Corpus)', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 1000000,
        expectedReturnRate: 12,
        tenureYears: 20,
      });
      // 1000000 * (1.12)^20 = 9,646,293.09 => 9646293
      expect(res.totalInvested).toBe(1000000);
      expect(res.maturityValue).toBe(9646293);
      expect(res.wealthMultiplier).toBe(9.65);
    });

    it('4. calculates 1-year short-term deposit @ 7% p.a.', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 7,
        tenureYears: 1,
      });
      expect(res.maturityValue).toBe(107000);
      expect(res.estReturns).toBe(7000);
      expect(res.wealthMultiplier).toBe(1.07);
    });

    it('5. calculates long-term 30-year wealth compounder @ 12% p.a.', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 12,
        tenureYears: 30,
      });
      // 100000 * (1.12)^30 = 2,995,992.21 => 2995992
      expect(res.maturityValue).toBe(2995992);
      expect(res.wealthMultiplier).toBe(29.96);
    });
  });

  // 2. Compounding Frequency Variations
  describe('Compounding Frequency Variations', () => {
    it('6. calculates semi-annual compounding (₹1L @ 10% for 5 Yrs)', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 10,
        tenureYears: 5,
        compoundingFrequency: 'semi-annually',
      });
      // 100000 * (1 + 0.05)^10 = 162,889.46 => 162889
      expect(res.maturityValue).toBe(162889);
    });

    it('7. calculates quarterly compounding (Bank FD style: ₹1L @ 8% for 5 Yrs)', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 8,
        tenureYears: 5,
        compoundingFrequency: 'quarterly',
      });
      // 100000 * (1 + 0.02)^20 = 148,594.74 => 148595
      expect(res.maturityValue).toBe(148595);
    });

    it('8. calculates monthly compounding (₹1L @ 12% for 1 Yr)', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 12,
        tenureYears: 1,
        compoundingFrequency: 'monthly',
      });
      // 100000 * (1 + 0.01)^12 = 112,682.50 => 112683
      expect(res.maturityValue).toBe(112683);
    });

    it('9. verifies higher compounding frequency yields higher future value', () => {
      const annual = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 10, tenureYears: 5, compoundingFrequency: 'annually' });
      const semi = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 10, tenureYears: 5, compoundingFrequency: 'semi-annually' });
      const quart = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 10, tenureYears: 5, compoundingFrequency: 'quarterly' });
      const month = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 10, tenureYears: 5, compoundingFrequency: 'monthly' });

      expect(semi.maturityValue).toBeGreaterThan(annual.maturityValue);
      expect(quart.maturityValue).toBeGreaterThan(semi.maturityValue);
      expect(month.maturityValue).toBeGreaterThan(quart.maturityValue);
    });
  });

  // 3. Inflation & Real Purchasing Power Modeling
  describe('Inflation Adjustments & Real Purchasing Power', () => {
    it('10. calculates real purchasing power value for 6% inflation over 10 years', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 12,
        tenureYears: 10,
        inflationRate: 6,
      });
      expect(res.realReturn).toBe(5.66); // Fisher real return = (1.12/1.06 - 1) = 5.66%
      expect(res.inflationAdjustedValue).toBeGreaterThan(0);
      expect(res.inflationAdjustedValue).toBeLessThan(res.maturityValue);
      expect(res.purchasingPowerLoss).toBe(res.maturityValue - res.inflationAdjustedValue);
    });

    it('11. handles 0% inflation (real value equals nominal maturity value)', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 10,
        tenureYears: 5,
        inflationRate: 0,
      });
      expect(res.inflationAdjustedValue).toBe(res.maturityValue);
      expect(res.purchasingPowerLoss).toBe(0);
      expect(res.realReturn).toBe(10);
    });

    it('12. detects negative real return when inflation exceeds return rate', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 4,
        tenureYears: 5,
        inflationRate: 7,
      });
      expect(res.realReturn).toBeLessThan(0);
      expect(res.healthStatus).toBe('Inflation Risk');
    });
  });

  // 4. Sensitivity Scenario Analysis
  describe('Market Return Sensitivity Analysis', () => {
    it('13. generates conservative (-2%), expected, and optimistic (+2%) scenarios', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 12,
        tenureYears: 10,
      });
      expect(res.scenarios.conservative.rate).toBe(10);
      expect(res.scenarios.expected.rate).toBe(12);
      expect(res.scenarios.optimistic.rate).toBe(14);
      expect(res.scenarios.conservative.futureValue).toBeLessThan(res.scenarios.expected.futureValue);
      expect(res.scenarios.optimistic.futureValue).toBeGreaterThan(res.scenarios.expected.futureValue);
    });
  });

  // 5. Cost of Delay Simulator
  describe('Delay Investment Simulator ("Cost of Waiting 5 Years")', () => {
    it('14. computes opportunity wealth cost of delaying 5 years', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 12,
        tenureYears: 10,
      });
      expect(res.delayCost.todayValue).toBe(res.maturityValue);
      expect(res.delayCost.delayedValue).toBeLessThan(res.delayCost.todayValue);
      expect(res.delayCost.wealthCostOfWaiting).toBe(res.delayCost.todayValue - res.delayCost.delayedValue);
      expect(res.delayCost.wealthCostOfWaiting).toBeGreaterThan(0);
    });
  });

  // 6. Financial Health Score Engine
  describe('Financial Health Score Engine', () => {
    it('15. assigns High/Strong score for double-digit real returns with long tenure', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 15,
        tenureYears: 15,
        inflationRate: 5,
      });
      expect(res.healthScore).toBeGreaterThanOrEqual(80);
      expect(res.healthStatus).toBe('Strong Wealth Creator');
    });

    it('16. assigns Moderate score for low positive real return', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 7,
        tenureYears: 5,
        inflationRate: 5.5,
      });
      expect(res.healthScore).toBeGreaterThanOrEqual(50);
    });

    it('17. assigns Danger/Risk score for negative real return', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 3,
        tenureYears: 5,
        inflationRate: 7,
      });
      expect(res.healthScore).toBeLessThan(60);
      expect(res.healthStatus).toBe('Inflation Risk');
    });
  });

  // 7. Yearly Schedule Breakdown
  describe('Yearly Growth Schedule Table Breakdown', () => {
    it('18. produces exact 10-year growth breakdown with correct balances', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 12,
        tenureYears: 10,
      });
      expect(res.yearlyBreakdown).toHaveLength(10);
      expect(res.yearlyBreakdown[0].year).toBe(1);
      expect(res.yearlyBreakdown[9].year).toBe(10);
      expect(res.yearlyBreakdown[9].totalValue).toBe(res.maturityValue);
    });

    it('19. ensures each year returns are positive and totalValue grows each year', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 200000,
        expectedReturnRate: 10,
        tenureYears: 5,
      });
      for (let i = 1; i < res.yearlyBreakdown.length; i++) {
        expect(res.yearlyBreakdown[i].totalValue).toBeGreaterThan(res.yearlyBreakdown[i - 1].totalValue);
        expect(res.yearlyBreakdown[i].returns).toBeGreaterThan(0);
      }
    });
  });

  // 8. Human-Friendly Visual Metrics
  describe('Human-Friendly Visual Metrics', () => {
    it('20. computes correct Growth per ₹100 invested metric', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 12,
        tenureYears: 10,
      });
      // 310585 / 100000 * 100 = 311
      expect(res.repayPer100).toBe(311);
    });

    it('21. computes monthly equivalent growth amount', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 12,
        tenureYears: 10,
      });
      expect(res.monthlyEquivalentGrowth).toBe(Math.round(210585 / 120));
    });
  });

  // 9. Edge Cases & Boundary Handling
  describe('Edge Cases & Boundary Values', () => {
    it('22. handles 0 initial investment gracefully', () => {
      const res = calculateLumpsumTool({ initialInvestment: 0, expectedReturnRate: 12, tenureYears: 10 });
      expect(res.totalInvested).toBe(0);
      expect(res.maturityValue).toBe(0);
      expect(res.estReturns).toBe(0);
      expect(res.wealthMultiplier).toBe(0);
    });

    it('23. clamps negative investment to 0', () => {
      const res = calculateLumpsumTool({ initialInvestment: -50000, expectedReturnRate: 12, tenureYears: 10 });
      expect(res.totalInvested).toBe(0);
      expect(res.maturityValue).toBe(0);
    });

    it('24. handles 0% return rate (capital preserved)', () => {
      const res = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 0, tenureYears: 10 });
      expect(res.totalInvested).toBe(100000);
      expect(res.maturityValue).toBe(100000);
      expect(res.estReturns).toBe(0);
      expect(res.wealthMultiplier).toBe(1.0);
    });

    it('25. clamps 0 or negative tenure to minimum 1 year', () => {
      const res = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 10, tenureYears: 0 });
      expect(res.tenureYears).toBe(1);
      expect(res.maturityValue).toBe(110000);
    });

    it('26. handles institutional large amounts (₹50 Crores)', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 500000000, // ₹50 Cr
        expectedReturnRate: 12,
        tenureYears: 10,
      });
      expect(res.totalInvested).toBe(500000000);
      expect(res.maturityValue).toBe(1552924104);
    });

    it('27. ensures mathematical balance: maturityValue = totalInvested + estReturns', () => {
      const testCases = [
        { initialInvestment: 5000, expectedReturnRate: 8, tenureYears: 3 },
        { initialInvestment: 25000, expectedReturnRate: 12.5, tenureYears: 7 },
        { initialInvestment: 750000, expectedReturnRate: 14, tenureYears: 12 },
        { initialInvestment: 5000000, expectedReturnRate: 18, tenureYears: 25 },
      ];
      testCases.forEach((tc) => {
        const res = calculateLumpsumTool(tc);
        expect(res.maturityValue).toBe(res.totalInvested + res.estReturns);
      });
    });
  });

  // 10. Smart Recommendations & Decision Intelligence
  describe('Smart Recommendations & Decision Insights', () => {
    it('28. generates ranked recommendations', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 12,
        tenureYears: 10,
      });
      expect(res.recommendations).toHaveLength(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[0].savings).toBeGreaterThan(0);
    });

    it('29. formats hero decision text with amount, rate, tenure, and multiplier', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 12,
        tenureYears: 10,
      });
      expect(res.heroText).toContain('₹1,00,000');
      expect(res.heroText).toContain('12%');
      expect(res.heroText).toContain('₹3,10,585');
      expect(res.heroText).toContain('10 years');
      expect(res.heroText).toContain('3.11x');
    });
  });

  // 11. Framework Compatibility & Aliases
  describe('Framework Aliases & Compatibility', () => {
    it('30. exports calculateLumpsumCalculator alias identically', () => {
      const res1 = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 12, tenureYears: 10 });
      const res2 = calculateLumpsumCalculator({ initialInvestment: 100000, expectedReturnRate: 12, tenureYears: 10 });
      expect(res1.maturityValue).toBe(res2.maturityValue);
      expect(res1.primaryOutput).toBe(res2.primaryOutput);
    });

    it('31. handles default inputs when called with no arguments', () => {
      const res = calculateLumpsumTool();
      expect(res.initialInvestment).toBe(100000);
      expect(res.expectedReturnRate).toBe(12);
      expect(res.tenureYears).toBe(10);
      expect(res.maturityValue).toBe(310585);
    });

    it('32. handles string numeric values correctly', () => {
      const res = calculateLumpsumTool({
        initialInvestment: '50000',
        expectedReturnRate: '10',
        tenureYears: '5',
      });
      expect(res.totalInvested).toBe(50000);
      expect(res.expectedReturnRate).toBe(10);
      expect(res.tenureYears).toBe(5);
      expect(res.maturityValue).toBe(80526);
    });

    it('33. handles invalid string gracefully without crashing', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 'invalid',
        expectedReturnRate: 'xyz',
      });
      expect(res.totalInvested).toBe(0);
      expect(res.expectedReturnRate).toBe(0);
      expect(res.maturityValue).toBe(0);
    });
  });

  // 12. Rate and Tenure Granularity
  describe('Rate and Tenure Granularity Tests', () => {
    it('34. calculates 15-year tenure @ 10% return', () => {
      const res = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 10, tenureYears: 15 });
      expect(res.maturityValue).toBe(417725);
    });

    it('35. calculates 25-year tenure @ 12% return', () => {
      const res = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 12, tenureYears: 25 });
      expect(res.maturityValue).toBe(1700006);
    });

    it('36. calculates 35-year tenure @ 15% return', () => {
      const res = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 15, tenureYears: 35 });
      expect(res.maturityValue).toBe(13317552);
    });

    it('37. calculates 40-year maximum tenure @ 12% return', () => {
      const res = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 12, tenureYears: 40 });
      expect(res.maturityValue).toBe(9305097);
    });

    it('38. calculates 1% minimum rate @ 10 years', () => {
      const res = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 1, tenureYears: 10 });
      expect(res.maturityValue).toBe(110462);
    });

    it('39. calculates 30% maximum rate @ 10 years', () => {
      const res = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 30, tenureYears: 10 });
      expect(res.maturityValue).toBe(1378585);
    });

    it('40. calculates fractional interest rate (e.g. 8.75% p.a.)', () => {
      const res = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 8.75, tenureYears: 5 });
      expect(res.maturityValue).toBe(152106);
    });

    it('41. verifies wealth multiplier increases exponentially with tenure', () => {
      const y5 = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 12, tenureYears: 5 });
      const y10 = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 12, tenureYears: 10 });
      const y20 = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 12, tenureYears: 20 });
      const y30 = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 12, tenureYears: 30 });

      expect(y10.wealthMultiplier).toBeGreaterThan(y5.wealthMultiplier);
      expect(y20.wealthMultiplier).toBeGreaterThan(y10.wealthMultiplier);
      expect(y30.wealthMultiplier).toBeGreaterThan(y20.wealthMultiplier);
    });

    it('42. verifies delay cost increases with higher expected return rate', () => {
      const r8 = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 8, tenureYears: 10 });
      const r12 = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 12, tenureYears: 10 });
      const r15 = calculateLumpsumTool({ initialInvestment: 100000, expectedReturnRate: 15, tenureYears: 10 });

      expect(r12.delayCost.wealthCostOfWaiting).toBeGreaterThan(r8.delayCost.wealthCostOfWaiting);
      expect(r15.delayCost.wealthCostOfWaiting).toBeGreaterThan(r12.delayCost.wealthCostOfWaiting);
    });

    it('43. handles unknown compounding frequency fallback to annual', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 12,
        tenureYears: 10,
        compoundingFrequency: 'daily_unsupported',
      });
      expect(res.maturityValue).toBe(310585);
    });

    it('44. returns correct absolute return percentage for ₹1L growing to ₹5L (400%)', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 100000,
        expectedReturnRate: 11.6,
        tenureYears: 15,
      });
      expect(res.absoluteReturnPct).toBeGreaterThanOrEqual(400);
    });

    it('45. calculates correct CAGR which matches input return rate for annual compounding', () => {
      const res = calculateLumpsumTool({
        initialInvestment: 250000,
        expectedReturnRate: 13.5,
        tenureYears: 8,
      });
      expect(res.cagr).toBe(13.5);
    });
  });
});