import { describe, it, expect } from 'vitest';
import {
  calculateQuickRatioCalculator,
  calculateQuickRatioTool,
  calculateAcidTestRatioCalculator,
  DEFAULT_QUICK_RATIO_INPUTS,
} from '../quick-ratio-calculator.js';

describe('Flagship Quick Ratio (Acid-Test) Suite (Sprint 73 Audit)', () => {
  // 1. Component Mode Calculations
  describe('Component Mode Calculations', () => {
    it('1. calculates standard Quick Ratio accurately with baseline component inputs', () => {
      const res = calculateQuickRatioCalculator({
        calculationMode: 'component',
        cashAndEquivalents: 2500000,
        marketableSecurities: 1500000,
        accountsReceivable: 3500000,
        inventory: 4000000,
        prepaidExpenses: 500000,
        currentLiabilities: 5000000,
      });

      // Quick Assets = 2.5M + 1.5M + 3.5M = 7,500,000
      // Quick Ratio = 7.5M / 5.0M = 1.50x
      // Derived Current Assets = 7.5M + 4M + 0.5M = 12,000,000
      // Current Ratio = 12M / 5M = 2.40x
      // Cash Ratio = 4M / 5M = 0.80x
      expect(res.quickAssets).toBe(7500000);
      expect(res.quickRatio).toBe(1.5);
      expect(res.currentRatio).toBe(2.4);
      expect(res.cashRatio).toBe(0.8);
      expect(res.quickWorkingCapital).toBe(2500000);
    });

    it('2. verifies that inventory is strictly excluded from Quick Assets', () => {
      const res1 = calculateQuickRatioCalculator({
        cashAndEquivalents: 2000000,
        marketableSecurities: 1000000,
        accountsReceivable: 3000000,
        inventory: 1000000,
        currentLiabilities: 6000000,
      });

      const res2 = calculateQuickRatioCalculator({
        cashAndEquivalents: 2000000,
        marketableSecurities: 1000000,
        accountsReceivable: 3000000,
        inventory: 10000000, // 10x higher inventory
        currentLiabilities: 6000000,
      });

      // Quick assets and quick ratio remain identical (6M / 6M = 1.0x)
      expect(res1.quickAssets).toBe(6000000);
      expect(res2.quickAssets).toBe(6000000);
      expect(res1.quickRatio).toBe(1.0);
      expect(res2.quickRatio).toBe(1.0);
    });

    it('3. calculates Cash Ratio accurately (Cash + Securities / Current Liabilities)', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 3000000,
        marketableSecurities: 2000000,
        accountsReceivable: 5000000,
        currentLiabilities: 10000000,
      });

      // Cash Ratio = (3M + 2M) / 10M = 0.50x
      expect(res.cashRatio).toBe(0.5);
    });
  });

  // 2. Deductive Balance Sheet Mode
  describe('Deductive Balance Sheet Mode', () => {
    it('4. calculates Quick Assets deductively (Current Assets - Inventory - Prepaid)', () => {
      const res = calculateQuickRatioCalculator({
        calculationMode: 'deductive',
        totalCurrentAssets: 15000000, // 15M
        inventory: 5000000, // 5M
        prepaidExpenses: 1000000, // 1M
        otherIlliquidAssets: 500000, // 0.5M
        currentLiabilities: 8000000, // 8M
      });

      // Quick Assets = 15M - 5M - 1M - 0.5M = 8,500,000
      // Quick Ratio = 8.5M / 8.0M = 1.06x
      expect(res.quickAssets).toBe(8500000);
      expect(res.quickRatio).toBe(1.06);
    });
  });

  // 3. Defensive Interval Ratio (DIR)
  describe('Defensive Interval Ratio (DIR)', () => {
    it('5. calculates Days of Cash Runway (Quick Assets / Daily OPEX)', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 3000000,
        marketableSecurities: 2000000,
        accountsReceivable: 4000000, // Quick Assets = 9M
        dailyOperatingExpenses: 60000, // 60,000 / day
      });

      // DIR = 9,000,000 / 60,000 = 150 days
      expect(res.defensiveIntervalDays).toBe(150);
    });
  });

  // 4. Target Liquidity Gap & Debt Headroom
  describe('Target Liquidity Gap & Debt Headroom', () => {
    it('6. calculates liquidity surplus when quick ratio exceeds target', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 4000000,
        marketableSecurities: 2000000,
        accountsReceivable: 2000000, // Quick Assets = 8M
        currentLiabilities: 5000000,
        targetQuickRatio: 1.0, // Target = 5M
      });

      // Quick Assets = 8M vs Required = 5M -> Gap = -3M (Surplus)
      expect(res.requiredQuickAssets).toBe(5000000);
      expect(res.liquidityGap).toBe(-3000000);
      expect(res.debtCapacityHeadroom).toBe(3000000);
    });

    it('7. calculates liquidity deficit when quick ratio is below target', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 1000000,
        marketableSecurities: 500000,
        accountsReceivable: 1500000, // Quick Assets = 3M
        currentLiabilities: 5000000,
        targetQuickRatio: 1.0, // Target = 5M
      });

      // Quick Assets = 3M vs Required = 5M -> Gap = +2M (Deficit)
      expect(res.requiredQuickAssets).toBe(5000000);
      expect(res.liquidityGap).toBe(2000000);
    });
  });

  // 5. Health & Solvency Classifications
  describe('Health & Solvency Classifications', () => {
    it('8. classifies Quick Ratio >= 1.0x and <= 1.5x as HEALTHY', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 3000000,
        marketableSecurities: 1000000,
        accountsReceivable: 2000000,
        currentLiabilities: 5000000, // 6M / 5M = 1.20x
      });

      expect(res.healthVerdict).toBe('HEALTHY');
    });

    it('9. classifies Quick Ratio < 0.80x as CRITICAL_DEFICIT', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 1000000,
        marketableSecurities: 500000,
        accountsReceivable: 1500000,
        currentLiabilities: 6000000, // 3M / 6M = 0.50x
      });

      expect(res.healthVerdict).toBe('CRITICAL_DEFICIT');
    });

    it('10. classifies Quick Ratio between 0.80x and 0.99x as VULNERABLE', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 2000000,
        marketableSecurities: 1000000,
        accountsReceivable: 1500000,
        currentLiabilities: 5000000, // 4.5M / 5M = 0.90x
      });

      expect(res.healthVerdict).toBe('VULNERABLE');
    });

    it('11. classifies Quick Ratio > 2.50x as EXCESS_IDLE_CASH', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 10000000,
        marketableSecurities: 5000000,
        accountsReceivable: 5000000,
        currentLiabilities: 5000000, // 20M / 5M = 4.0x
      });

      expect(res.healthVerdict).toBe('EXCESS_IDLE_CASH');
    });
  });

  // 6. Presets Validation
  describe('Presets Validation', () => {
    it('12. validates Manufacturing Plant preset', () => {
      const res = calculateQuickRatioCalculator({
        calculationMode: 'component',
        cashAndEquivalents: 2500000,
        marketableSecurities: 1500000,
        accountsReceivable: 3500000,
        inventory: 4000000,
        prepaidExpenses: 500000,
        currentLiabilities: 5000000,
      });

      expect(res.quickRatio).toBe(1.5);
      expect(res.currentRatio).toBe(2.4);
    });

    it('13. validates SaaS Tech Startup preset', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 5000000,
        marketableSecurities: 2000000,
        accountsReceivable: 3000000,
        inventory: 0,
        currentLiabilities: 4000000,
      });

      // Quick Assets = 10M / 4M = 2.50x
      expect(res.quickRatio).toBe(2.5);
    });

    it('14. validates Retail Supermarket preset (Inventory Heavy)', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 1000000,
        marketableSecurities: 500000,
        accountsReceivable: 500000,
        inventory: 8000000,
        currentLiabilities: 4000000,
      });

      // Quick Assets = 2M / 4M = 0.50x
      // Current Assets = 10.2M -> Current Ratio = 2.55x
      expect(res.quickRatio).toBe(0.5);
      expect(res.healthVerdict).toBe('CRITICAL_DEFICIT');
    });

    it('15. validates Healthcare Clinic preset', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 3000000,
        marketableSecurities: 1000000,
        accountsReceivable: 4000000,
        inventory: 1500000,
        currentLiabilities: 4500000,
      });

      // Quick Assets = 8M / 4.5M = 1.78x
      expect(res.quickRatio).toBe(1.78);
    });

    it('16. validates Construction Contractor preset', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 2000000,
        marketableSecurities: 1000000,
        accountsReceivable: 6000000,
        inventory: 5000000,
        currentLiabilities: 7000000,
      });

      // Quick Assets = 9M / 7M = 1.29x
      expect(res.quickRatio).toBe(1.29);
    });

    it('17. validates Wholesale FMCG preset', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 1500000,
        marketableSecurities: 1000000,
        accountsReceivable: 4500000,
        inventory: 6000000,
        currentLiabilities: 5500000,
      });

      // Quick Assets = 7M / 5.5M = 1.27x
      expect(res.quickRatio).toBe(1.27);
    });
  });

  // 7. Boundary Safeguards & Edge Cases
  describe('Boundary Safeguards & Edge Cases', () => {
    it('18. handles zero current liabilities without division by zero', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 2000000,
        currentLiabilities: 0,
      });

      expect(res.quickRatio).toBe(99.99);
      expect(res.currentRatio).toBe(99.99);
    });

    it('19. handles zero quick assets cleanly', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 0,
        marketableSecurities: 0,
        accountsReceivable: 0,
        currentLiabilities: 5000000,
      });

      expect(res.quickRatio).toBe(0);
      expect(res.healthVerdict).toBe('CRITICAL_DEFICIT');
    });

    it('20. clamps negative cash and securities to 0', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: -500000,
        marketableSecurities: -200000,
      });

      expect(res.cashAndEquivalents).toBe(0);
      expect(res.marketableSecurities).toBe(0);
    });

    it('21. clamps negative inventory to 0', () => {
      const res = calculateQuickRatioCalculator({ inventory: -300000 });
      expect(res.inventory).toBe(0);
    });

    it('22. handles string inputs cleanly', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: '3000000',
        accountsReceivable: '2000000',
        currentLiabilities: '5000000',
      });

      expect(res.cashAndEquivalents).toBe(3000000);
      expect(res.accountsReceivable).toBe(2000000);
    });

    it('23. supports custom currency symbol ($)', () => {
      const res = calculateQuickRatioCalculator({ currencySymbol: '$' });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
    });

    it('24. exports calculateQuickRatioTool alias identically', () => {
      const res1 = calculateQuickRatioCalculator();
      const res2 = calculateQuickRatioTool();
      expect(res1.quickRatio).toBe(res2.quickRatio);
    });

    it('25. exports calculateAcidTestRatioCalculator alias identically', () => {
      const res1 = calculateQuickRatioCalculator();
      const res2 = calculateAcidTestRatioCalculator();
      expect(res1.quickRatio).toBe(res2.quickRatio);
    });

    it('26. verifies default inputs when called with empty object', () => {
      const res = calculateQuickRatioCalculator();
      expect(res.cashAndEquivalents).toBe(DEFAULT_QUICK_RATIO_INPUTS.cashAndEquivalents);
      expect(res.quickRatio).toBe(1.5);
    });

    it('27. verifies primaryOutput is quickRatio', () => {
      const res = calculateQuickRatioCalculator();
      expect(res.primaryOutput).toBe(res.quickRatio);
    });

    it('28. verifies asset breakdown list contains 5 categories', () => {
      const res = calculateQuickRatioCalculator();
      expect(res.assetBreakdownList.length).toBe(5);
      expect(res.assetBreakdownList[0].label).toContain('Cash');
      expect(res.assetBreakdownList[3].label).toContain('Inventory');
    });

    it('29. verifies 3 prioritized recommendations are produced', () => {
      const res = calculateQuickRatioCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });

    it('30. handles 0 daily operating expenses gracefully in DIR calculation', () => {
      const res = calculateQuickRatioCalculator({
        dailyOperatingExpenses: 0,
      });

      expect(res.defensiveIntervalDays).toBe(0);
    });

    it('31. clamps target quick ratio between 0.2 and 5.0', () => {
      const resHigh = calculateQuickRatioCalculator({ targetQuickRatio: 10 });
      expect(resHigh.targetQuickRatio).toBe(5.0);

      const resLow = calculateQuickRatioCalculator({ targetQuickRatio: 0.05 });
      expect(resLow.targetQuickRatio).toBe(0.2);
    });

    it('32. handles massive corporate balance sheet values (₹500 Crores)', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 2000000000,
        marketableSecurities: 1000000000,
        accountsReceivable: 2000000000,
        currentLiabilities: 4000000000,
      });

      // Quick Assets = 5B / 4B = 1.25x
      expect(res.quickRatio).toBe(1.25);
      expect(res.quickWorkingCapital).toBe(1000000000);
    });

    it('33. verifies hero text formatting includes quick ratio and quick working capital', () => {
      const res = calculateQuickRatioCalculator();
      expect(res.heroText).toContain('Quick Ratio (Acid-Test) is 1.5x');
      expect(res.heroText).toContain('Quick Working Capital');
    });

    it('34. checks that quick working capital equals quick assets minus current liabilities', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 4000000,
        currentLiabilities: 6000000,
      });

      expect(res.quickWorkingCapital).toBe(res.quickAssets - res.currentLiabilities);
    });

    it('35. checks that net working capital equals derived current assets minus current liabilities', () => {
      const res = calculateQuickRatioCalculator();
      expect(res.netWorkingCapital).toBe(res.derivedCurrentAssets - res.currentLiabilities);
    });

    it('36. handles deductive mode with large deductions exceeding total current assets', () => {
      const res = calculateQuickRatioCalculator({
        calculationMode: 'deductive',
        totalCurrentAssets: 5000000,
        inventory: 6000000,
      });

      expect(res.quickAssets).toBe(0);
      expect(res.quickRatio).toBe(0);
    });

    it('37. checks that cash ratio is always less than or equal to quick ratio', () => {
      const res = calculateQuickRatioCalculator();
      expect(res.cashRatio).toBeLessThanOrEqual(res.quickRatio);
    });

    it('38. checks that quick ratio is always less than or equal to current ratio', () => {
      const res = calculateQuickRatioCalculator();
      expect(res.quickRatio).toBeLessThanOrEqual(res.currentRatio);
    });

    it('39. handles fractional quick ratio formatting (e.g. 1.33x)', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 4000000,
        marketableSecurities: 0,
        accountsReceivable: 0,
        currentLiabilities: 3000000,
      });

      // 4M / 3M = 1.3333... -> rounded to 1.33
      expect(res.quickRatio).toBe(1.33);
    });

    it('40. handles non-zero other illiquid assets in component mode', () => {
      const res = calculateQuickRatioCalculator({
        otherIlliquidAssets: 500000,
      });

      expect(res.otherIlliquidAssets).toBe(500000);
    });

    it('41. verifies health color is semantic success for optimal ratio', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 3000000,
        marketableSecurities: 1000000,
        accountsReceivable: 2000000,
        currentLiabilities: 5000000,
      });

      expect(res.healthColor).toBe('text-semantic-success');
    });

    it('42. verifies health color is rose for critical deficit', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 1000000,
        marketableSecurities: 0,
        accountsReceivable: 0,
        currentLiabilities: 5000000,
      });

      expect(res.healthColor).toBe('text-rose-600');
    });

    it('43. verifies health color is amber for vulnerable ratio', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 2000000,
        marketableSecurities: 1000000,
        accountsReceivable: 1500000,
        currentLiabilities: 5000000,
      });

      expect(res.healthColor).toBe('text-amber-600');
    });

    it('44. verifies health color is indigo for excess idle cash', () => {
      const res = calculateQuickRatioCalculator({
        cashAndEquivalents: 15000000,
        currentLiabilities: 5000000,
      });

      expect(res.healthColor).toBe('text-indigo-600');
    });

    it('45. verifies complete return object contract integrity', () => {
      const res = calculateQuickRatioCalculator();
      expect(res).toHaveProperty('quickRatio');
      expect(res).toHaveProperty('currentRatio');
      expect(res).toHaveProperty('cashRatio');
      expect(res).toHaveProperty('quickAssets');
      expect(res).toHaveProperty('quickWorkingCapital');
      expect(res).toHaveProperty('netWorkingCapital');
      expect(res).toHaveProperty('defensiveIntervalDays');
      expect(res).toHaveProperty('requiredQuickAssets');
      expect(res).toHaveProperty('liquidityGap');
      expect(res).toHaveProperty('assetBreakdownList');
      expect(res).toHaveProperty('recommendations');
    });
  });
});
