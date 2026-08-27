import { describe, it, expect } from 'vitest';
import {
  calculatePurchasingPower,
  calculatePurchasingPowerCalculator,
  calculateRealValue,
  CURRENCY_METADATA,
  REFERENCE_METADATA,
} from '../purchasing-power-calculator.js';
import { PURCHASING_POWER_CONFIG } from '../../configs/purchasing-power-calculator.config.js';

describe('Flagship Purchasing Power Suite (Sprint 78 / Flagship #85)', () => {
  // 1. Core Default Execution
  describe('1. Default Parameters & Baseline Calculations', () => {
    it('1. executes successfully with default parameters', () => {
      const res = calculatePurchasingPower();
      expect(res).toBeDefined();
      expect(res.amount).toBe(100000);
      expect(res.inflationRate).toBe(6.0);
      expect(res.tenureYears).toBe(10);
      expect(res.incomeGrowthRate).toBe(0);
      expect(res.currency).toBe('INR');
    });

    it('2. calculates accurate 10-year purchasing power at 6% inflation (100k -> ~55,839.48)', () => {
      const res = calculatePurchasingPower({
        amount: 100000,
        inflationRate: 6.0,
        tenureYears: 10,
      });
      // 100000 / (1.06^10) = 55839.478... -> 55839.48
      expect(res.futureRealValue).toBeCloseTo(55839.48, 1);
      expect(res.purchasingPowerLossAmount).toBeCloseTo(44160.52, 1);
      expect(res.purchasingPowerLossPct).toBeCloseTo(44.16, 1);
    });

    it('3. calculates exact future equivalent inflated cost (100k -> 179,084.77)', () => {
      const res = calculatePurchasingPower({
        amount: 100000,
        inflationRate: 6.0,
        tenureYears: 10,
      });
      // 100000 * 1.06^10 = 179084.769... -> 179084.77
      expect(res.equivalentFutureCost).toBeCloseTo(179084.77, 1);
      expect(res.extraCostRequired).toBeCloseTo(79084.77, 1);
      expect(res.cumulativeInflationPct).toBeCloseTo(79.08, 1);
    });

    it('4. calculates exact logarithmic halving time (6% -> 11.9 years)', () => {
      const res = calculatePurchasingPower({ inflationRate: 6.0 });
      // ln(2) / ln(1.06) = 11.895... -> 11.9
      expect(res.halvingYears).toBe(11.9);
      expect(res.quarteringYears).toBe(23.8);
    });
  });

  // 2. Zero & Extreme Boundary Scenarios
  describe('2. Zero, Deflation & Boundary Conditions', () => {
    it('5. handles 0% inflation with 100% purchasing power retention', () => {
      const res = calculatePurchasingPower({
        amount: 50000,
        inflationRate: 0,
        tenureYears: 10,
      });
      expect(res.futureRealValue).toBe(50000);
      expect(res.purchasingPowerLossAmount).toBe(0);
      expect(res.purchasingPowerLossPct).toBe(0);
      expect(res.equivalentFutureCost).toBe(50000);
      expect(res.halvingYears).toBeNull();
    });

    it('6. handles 0 tenure years gracefully', () => {
      const res = calculatePurchasingPower({
        amount: 75000,
        inflationRate: 5.0,
        tenureYears: 0,
      });
      expect(res.futureRealValue).toBe(75000);
      expect(res.purchasingPowerLossAmount).toBe(0);
      expect(res.yearlySchedule.length).toBe(0);
    });

    it('7. handles zero amount without NaN errors ($0 -> $0)', () => {
      const res = calculatePurchasingPower({ amount: 0, inflationRate: 6.0, tenureYears: 10 });
      expect(res.futureRealValue).toBe(0);
      expect(res.purchasingPowerLossAmount).toBe(0);
      expect(res.purchasingPowerLossPct).toBe(0);
      expect(res.equivalentFutureCost).toBe(0);
    });

    it('8. handles negative deflation (-2.0% annual price decline)', () => {
      const res = calculatePurchasingPower({
        amount: 100000,
        inflationRate: -2.0,
        tenureYears: 5,
      });
      // 100000 / (0.98^5) = 110629.8
      expect(res.futureRealValue).toBeGreaterThan(100000);
      expect(res.purchasingPowerLossAmount).toBe(0);
      expect(res.equivalentFutureCost).toBeLessThan(100000);
    });

    it('9. handles high inflation rate of 12.0% p.a.', () => {
      const res = calculatePurchasingPower({
        amount: 100000,
        inflationRate: 12.0,
        tenureYears: 10,
      });
      // ln(2) / ln(1.12) = 6.1 years
      expect(res.halvingYears).toBe(6.1);
      expect(res.futureRealValue).toBeCloseTo(32197.32, 1);
      expect(res.purchasingPowerLossPct).toBeCloseTo(67.8, 0);
    });

    it('10. handles max clamped tenure of 60 years', () => {
      const res = calculatePurchasingPower({ tenureYears: 99 });
      expect(res.tenureYears).toBe(60);
      expect(res.yearlySchedule.length).toBe(60);
    });
  });

  // 3. Wage & Income Growth Modeling
  describe('3. Wage Growth & Net Real Purchasing Power', () => {
    it('11. calculates real wage expansion when salary hike (8.5%) beats inflation (6.0%)', () => {
      const res = calculatePurchasingPower({
        amount: 1200000,
        inflationRate: 6.0,
        tenureYears: 5,
        incomeGrowthRate: 8.5,
      });
      expect(res.isBeatingInflation).toBe(true);
      // Real factor = (1.085 / 1.06) - 1 = +2.358% -> 2.36%
      expect(res.realIncomeGrowthRate).toBe(2.36);
      expect(res.futureRealIncome).toBeGreaterThan(1200000);
      expect(res.realIncomeDelta).toBeGreaterThan(0);
    });

    it('12. calculates real wage erosion when salary hike (4.0%) lags inflation (6.0%)', () => {
      const res = calculatePurchasingPower({
        amount: 1000000,
        inflationRate: 6.0,
        tenureYears: 5,
        incomeGrowthRate: 4.0,
      });
      expect(res.isBeatingInflation).toBe(false);
      // Real factor = (1.04 / 1.06) - 1 = -1.886% -> -1.89%
      expect(res.realIncomeGrowthRate).toBe(-1.89);
      expect(res.futureRealIncome).toBeLessThan(1000000);
      expect(res.realIncomeDelta).toBeLessThan(0);
    });

    it('13. computes nominal future income vs real discounted income accurately', () => {
      const res = calculatePurchasingPower({
        amount: 500000,
        inflationRate: 5.0,
        tenureYears: 3,
        incomeGrowthRate: 10.0,
      });
      // Nominal: 500000 * 1.1^3 = 665500
      expect(res.nominalFutureIncome).toBe(665500);
      // Real: 500000 * (1.1 / 1.05)^3 = 574883.92
      expect(res.futureRealIncome).toBeCloseTo(574883.92, 1);
    });
  });

  // 4. Multi-Year Degradation Schedule Matrix
  describe('4. Yearly Degradation Schedule Verification', () => {
    it('14. generates exact N rows for N years tenure', () => {
      const res = calculatePurchasingPower({ tenureYears: 15 });
      expect(res.yearlySchedule.length).toBe(15);
      expect(res.yearlySchedule[0].year).toBe(1);
      expect(res.yearlySchedule[14].year).toBe(15);
    });

    it('15. verifies year 1 schedule values mathematically ($100k @ 5% inflation)', () => {
      const res = calculatePurchasingPower({ amount: 100000, inflationRate: 5.0, tenureYears: 5 });
      const yr1 = res.yearlySchedule[0];
      // Real = 100000 / 1.05 = 95238.10
      expect(yr1.realPurchasingPower).toBe(95238.1);
      expect(yr1.lossAmount).toBe(4761.9);
      expect(yr1.lossPercent).toBe(4.76);
      expect(yr1.equivalentFutureCost).toBe(105000);
    });

    it('16. ensures monotonically decreasing real purchasing power across schedule', () => {
      const res = calculatePurchasingPower({ amount: 200000, inflationRate: 6.0, tenureYears: 10 });
      for (let i = 1; i < res.yearlySchedule.length; i++) {
        expect(res.yearlySchedule[i].realPurchasingPower).toBeLessThan(res.yearlySchedule[i - 1].realPurchasingPower);
        expect(res.yearlySchedule[i].equivalentFutureCost).toBeGreaterThan(res.yearlySchedule[i - 1].equivalentFutureCost);
      }
    });
  });

  // 5. Multi-Currency Support & Formatting
  describe('5. Multi-Currency & Symbol Verification', () => {
    it('17. supports INR currency code and metadata', () => {
      const res = calculatePurchasingPower({ currency: 'INR' });
      expect(res.currency).toBe('INR');
      expect(res.currencyMeta.symbol).toBe('₹');
      expect(res.currencyMeta.name).toBe('Indian Rupee');
    });

    it('18. supports USD currency code and metadata', () => {
      const res = calculatePurchasingPower({ currency: 'USD' });
      expect(res.currency).toBe('USD');
      expect(res.currencyMeta.symbol).toBe('$');
    });

    it('19. supports EUR currency code and metadata', () => {
      const res = calculatePurchasingPower({ currency: 'EUR' });
      expect(res.currency).toBe('EUR');
      expect(res.currencyMeta.symbol).toBe('€');
    });

    it('20. supports GBP currency code and metadata', () => {
      const res = calculatePurchasingPower({ currency: 'GBP' });
      expect(res.currency).toBe('GBP');
      expect(res.currencyMeta.symbol).toBe('£');
    });

    it('21. supports AED, CAD, AUD, SGD, JPY codes', () => {
      expect(calculatePurchasingPower({ currency: 'AED' }).currencyMeta.symbol).toBe('د.إ');
      expect(calculatePurchasingPower({ currency: 'CAD' }).currencyMeta.symbol).toBe('C$');
      expect(calculatePurchasingPower({ currency: 'AUD' }).currencyMeta.symbol).toBe('A$');
      expect(calculatePurchasingPower({ currency: 'SGD' }).currencyMeta.symbol).toBe('S$');
      expect(calculatePurchasingPower({ currency: 'JPY' }).currencyMeta.symbol).toBe('¥');
    });

    it('22. falls back to INR for unknown currency code', () => {
      const res = calculatePurchasingPower({ currency: 'XYZ' });
      expect(res.currencyMeta.symbol).toBe('₹');
    });
  });

  // 6. Sanitization & Edge Safeguards
  describe('6. Input Sanitization & Robustness', () => {
    it('23. sanitizes negative amount using absolute value (-50000 -> 50000)', () => {
      const res = calculatePurchasingPower({ amount: -50000 });
      expect(res.amount).toBe(50000);
      expect(res.futureRealValue).toBeGreaterThan(0);
    });

    it('24. handles non-numeric NaN amount by defaulting to 0', () => {
      const res = calculatePurchasingPower({ amount: 'invalid' });
      expect(res.amount).toBe(0);
      expect(res.futureRealValue).toBe(0);
    });

    it('25. clamps extreme inflation rate above 100% to 100%', () => {
      const res = calculatePurchasingPower({ inflationRate: 250 });
      expect(res.inflationRate).toBe(100);
    });

    it('26. clamps negative inflation rate below -10% to -10%', () => {
      const res = calculatePurchasingPower({ inflationRate: -50 });
      expect(res.inflationRate).toBe(-10);
    });

    it('27. handles fractional micro amounts ($0.05)', () => {
      const res = calculatePurchasingPower({ amount: 0.05, inflationRate: 5.0, tenureYears: 2 });
      expect(res.futureRealValue).toBeCloseTo(0.05, 2);
    });

    it('28. handles institutional scale large amounts (₹50 Crore / 500,000,000)', () => {
      const res = calculatePurchasingPower({ amount: 500000000, inflationRate: 6.0, tenureYears: 20 });
      expect(res.futureRealValue).toBeGreaterThan(0);
      expect(res.equivalentFutureCost).toBeGreaterThan(500000000);
    });
  });

  // 7. Hero Text & Recommendations
  describe('7. Hero Verdict & Financial Recommendations', () => {
    it('29. formats dynamic hero text with currency symbol and amounts', () => {
      const res = calculatePurchasingPower({ amount: 100000, inflationRate: 6.0, tenureYears: 10, currency: 'INR' });
      expect(res.heroText).toContain('₹');
      expect(res.heroText).toContain('55,839');
      expect(res.heroText).toContain('10 years');
      expect(res.heroText).toContain('6.0%');
    });

    it('30. formats hero text for 0% inflation or 0 tenure properly', () => {
      const res = calculatePurchasingPower({ amount: 100000, inflationRate: 0, tenureYears: 5 });
      expect(res.heroText).toContain('retains 100% of its purchasing power');
    });

    it('31. generates 3 prioritized actionable recommendations', () => {
      const res = calculatePurchasingPower({ inflationRate: 7.0 });
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].title).toContain('High Inflation');
    });

    it('32. provides positive salary recommendation when wage growth beats inflation', () => {
      const res = calculatePurchasingPower({ inflationRate: 5.0, incomeGrowthRate: 8.0 });
      const salRec = res.recommendations.find(r => r.title.includes('Positive Real Income'));
      expect(salRec).toBeDefined();
    });

    it('33. provides wage drag warning when salary growth lags inflation', () => {
      const res = calculatePurchasingPower({ inflationRate: 7.0, incomeGrowthRate: 3.0 });
      const salRec = res.recommendations.find(r => r.title.includes('Negative Real Wage Drag'));
      expect(salRec).toBeDefined();
    });
  });

  // 8. Scenario Presets Verification
  describe('8. Presets Verification', () => {
    it('34. verifies India Standard CPI Preset', () => {
      const p = PURCHASING_POWER_CONFIG.presets[0];
      const res = calculatePurchasingPower(p);
      expect(res.amount).toBe(100000);
      expect(res.inflationRate).toBe(6.0);
      expect(res.tenureYears).toBe(10);
      expect(res.futureRealValue).toBeCloseTo(55839.48, 1);
    });

    it('35. verifies US Fed Target Preset', () => {
      const p = PURCHASING_POWER_CONFIG.presets[1];
      const res = calculatePurchasingPower(p);
      expect(res.amount).toBe(50000);
      expect(res.currency).toBe('USD');
      expect(res.inflationRate).toBe(2.5);
      expect(res.tenureYears).toBe(15);
      expect(res.futureRealValue).toBeCloseTo(34523.28, 1);
    });

    it('36. verifies Higher Education / Healthcare Preset', () => {
      const p = PURCHASING_POWER_CONFIG.presets[2];
      const res = calculatePurchasingPower(p);
      expect(res.amount).toBe(2500000);
      expect(res.inflationRate).toBe(10.0);
      expect(res.tenureYears).toBe(15);
      expect(res.equivalentFutureCost).toBeCloseTo(10443120.42, 1);
    });

    it('37. verifies Salary vs Inflation Preset', () => {
      const p = PURCHASING_POWER_CONFIG.presets[3];
      const res = calculatePurchasingPower(p);
      expect(res.amount).toBe(1200000);
      expect(res.incomeGrowthRate).toBe(8.5);
      expect(res.isBeatingInflation).toBe(true);
    });

    it('38. verifies Retirement Cash Drag Preset', () => {
      const p = PURCHASING_POWER_CONFIG.presets[4];
      const res = calculatePurchasingPower(p);
      expect(res.amount).toBe(5000000);
      expect(res.tenureYears).toBe(20);
      expect(res.purchasingPowerLossPct).toBeGreaterThan(70);
    });

    it('39. verifies Eurozone Baseline Preset', () => {
      const p = PURCHASING_POWER_CONFIG.presets[5];
      const res = calculatePurchasingPower(p);
      expect(res.currency).toBe('EUR');
      expect(res.amount).toBe(30000);
      expect(res.inflationRate).toBe(2.8);
      expect(res.incomeGrowthRate).toBe(3.5);
    });
  });

  // 9. Reference Metadata & Disclosures
  describe('9. Reference Metadata & Disclosures', () => {
    it('40. includes baseline date in reference metadata', () => {
      const res = calculatePurchasingPower();
      expect(res.metadata.baselineDate).toBe(REFERENCE_METADATA.baselineDate);
      expect(res.metadata.source).toContain('International CPI');
    });

    it('41. contains valid disclaimer in reference metadata', () => {
      const res = calculatePurchasingPower();
      expect(res.metadata.disclaimer).toContain('compound inflation');
    });

    it('42. verifies all 9 currency definitions contain symbols and flags', () => {
      Object.keys(CURRENCY_METADATA).forEach((code) => {
        const item = CURRENCY_METADATA[code];
        expect(item.symbol).toBeDefined();
        expect(item.flag).toBeDefined();
        expect(item.name).toBeDefined();
      });
    });
  });

  // 10. Aliases & Exports
  describe('10. Aliases & Module Exports', () => {
    it('43. exports calculatePurchasingPowerCalculator alias identically', () => {
      const res1 = calculatePurchasingPower({ amount: 50000 });
      const res2 = calculatePurchasingPowerCalculator({ amount: 50000 });
      expect(res1.futureRealValue).toBe(res2.futureRealValue);
    });

    it('44. exports calculateRealValue alias identically', () => {
      const res1 = calculatePurchasingPower({ amount: 50000 });
      const res2 = calculateRealValue({ amount: 50000 });
      expect(res1.futureRealValue).toBe(res2.futureRealValue);
    });

    it('45. maintains consistent config id and version', () => {
      expect(PURCHASING_POWER_CONFIG.id).toBe('purchasing-power-calculator');
      expect(PURCHASING_POWER_CONFIG.category).toBe('currency');
      expect(PURCHASING_POWER_CONFIG.version).toBe('3.0.0');
    });
  });
});
