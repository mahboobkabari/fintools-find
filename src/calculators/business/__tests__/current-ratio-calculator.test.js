import { describe, it, expect } from 'vitest';
import {
  calculateCurrentRatioCalculator,
  calculateCurrentRatioTool,
  calculateWorkingCapitalRatioCalculator,
  DEFAULT_CURRENT_RATIO_INPUTS,
} from '../current-ratio-calculator.js';

describe('Flagship Current Ratio Suite (Sprint 74 Audit)', () => {
  // 1. Itemized Mode Calculations
  describe('Itemized Mode Calculations', () => {
    it('1. calculates standard Current Ratio accurately with itemized balance sheet inputs', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'itemized',
        cashAndEquivalents: 3000000,
        marketableSecurities: 1500000,
        accountsReceivable: 4500000,
        inventory: 5000000,
        prepaidExpenses: 1000000,
        otherCurrentAssets: 0,
        accountsPayable: 3500000,
        shortTermDebt: 2000000,
        currentPortionLongDebt: 1000000,
        accruedExpenses: 1000000,
        otherCurrentLiabilities: 0,
      });

      // Total Current Assets = 3M + 1.5M + 4.5M + 5M + 1M = 15,000,000
      // Total Current Liabilities = 3.5M + 2M + 1M + 1M = 7,500,000
      // Current Ratio = 15M / 7.5M = 2.00x
      // Net Working Capital = 15M - 7.5M = 7,500,000
      // Quick Assets = 15M - 5M - 1M = 9,000,000 -> Quick Ratio = 9M / 7.5M = 1.20x
      // Cash Ratio = 4.5M / 7.5M = 0.60x
      expect(res.effectiveCurrentAssets).toBe(15000000);
      expect(res.effectiveCurrentLiabilities).toBe(7500000);
      expect(res.currentRatio).toBe(2.0);
      expect(res.netWorkingCapital).toBe(7500000);
      expect(res.quickRatio).toBe(1.2);
      expect(res.cashRatio).toBe(0.6);
    });

    it('2. verifies inventory concentration % calculation', () => {
      const res = calculateCurrentRatioCalculator({
        cashAndEquivalents: 2000000,
        marketableSecurities: 0,
        accountsReceivable: 3000000,
        inventory: 5000000, // 5M of 10M total assets
        prepaidExpenses: 0,
        accountsPayable: 5000000,
        shortTermDebt: 0,
        currentPortionLongDebt: 0,
        accruedExpenses: 0,
      });

      // Inventory Concentration = (5M / 10M) * 100 = 50%
      expect(res.effectiveCurrentAssets).toBe(10000000);
      expect(res.inventoryConcentrationPct).toBe(50);
    });
  });

  // 2. Direct Mode Calculations
  describe('Direct Mode Calculations', () => {
    it('3. calculates Current Ratio directly from total current assets and liabilities', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 20000000, // 20M
        totalCurrentLiabilities: 10000000, // 10M
      });

      expect(res.effectiveCurrentAssets).toBe(20000000);
      expect(res.effectiveCurrentLiabilities).toBe(10000000);
      expect(res.currentRatio).toBe(2.0);
      expect(res.netWorkingCapital).toBe(10000000);
    });
  });

  // 3. Target Working Capital Gap & Borrowing Headroom
  describe('Target Working Capital Gap & Borrowing Headroom', () => {
    it('4. calculates working capital surplus when ratio exceeds target', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 25000000, // 25M
        totalCurrentLiabilities: 10000000, // 10M
        targetCurrentRatio: 2.0, // Required = 20M
      });

      // Required = 20M vs Actual = 25M -> Gap = -5M (Surplus)
      // Max Allowable Liabilities = 25M / 2.0 = 12.5M -> Headroom = 2.5M
      expect(res.requiredCurrentAssets).toBe(20000000);
      expect(res.workingCapitalGap).toBe(-5000000);
      expect(res.shortTermBorrowingHeadroom).toBe(2500000);
    });

    it('5. calculates working capital deficit when ratio is below target', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 12000000, // 12M
        totalCurrentLiabilities: 10000000, // 10M
        targetCurrentRatio: 2.0, // Required = 20M
      });

      // Required = 20M vs Actual = 12M -> Gap = +8M (Deficit)
      expect(res.requiredCurrentAssets).toBe(20000000);
      expect(res.workingCapitalGap).toBe(8000000);
    });
  });

  // 4. Health & Solvency Classifications
  describe('Health & Solvency Classifications', () => {
    it('6. classifies Current Ratio >= 1.5x and <= 2.5x as HEALTHY', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 20000000,
        totalCurrentLiabilities: 10000000, // 2.00x
      });

      expect(res.healthVerdict).toBe('HEALTHY');
    });

    it('7. classifies Current Ratio < 1.00x as WORKING_CAPITAL_DEFICIT', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 8000000,
        totalCurrentLiabilities: 10000000, // 0.80x
      });

      expect(res.healthVerdict).toBe('WORKING_CAPITAL_DEFICIT');
    });

    it('8. classifies Current Ratio between 1.00x and 1.49x as TIGHT_BUFFER', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 13000000,
        totalCurrentLiabilities: 10000000, // 1.30x
      });

      expect(res.healthVerdict).toBe('TIGHT_BUFFER');
    });

    it('9. classifies Current Ratio > 3.00x as EXCESS_IDLE_CAPITAL', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 35000000,
        totalCurrentLiabilities: 10000000, // 3.50x
      });

      expect(res.healthVerdict).toBe('EXCESS_IDLE_CAPITAL');
    });
  });

  // 5. Presets Validation
  describe('Presets Validation', () => {
    it('10. validates Industrial Manufacturing preset', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'itemized',
        cashAndEquivalents: 3000000,
        marketableSecurities: 1500000,
        accountsReceivable: 4500000,
        inventory: 5000000,
        prepaidExpenses: 1000000,
        accountsPayable: 3500000,
        shortTermDebt: 2000000,
        currentPortionLongDebt: 1000000,
        accruedExpenses: 1000000,
      });

      expect(res.currentRatio).toBe(2.0);
      expect(res.quickRatio).toBe(1.2);
    });

    it('11. validates FMCG Wholesale & Distribution preset', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'itemized',
        cashAndEquivalents: 4000000,
        marketableSecurities: 2000000,
        accountsReceivable: 8000000,
        inventory: 7000000,
        prepaidExpenses: 1000000,
        accountsPayable: 6000000,
        shortTermDebt: 3000000,
        currentPortionLongDebt: 1000000,
        accruedExpenses: 1000000,
      });

      // CA = 22M, CL = 11M -> 2.00x
      expect(res.currentRatio).toBe(2.0);
      expect(res.netWorkingCapital).toBe(11000000);
    });

    it('12. validates Software & Tech Enterprise preset', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'itemized',
        cashAndEquivalents: 10000000,
        marketableSecurities: 3000000,
        accountsReceivable: 4500000,
        inventory: 0,
        prepaidExpenses: 500000,
        accountsPayable: 2000000,
        shortTermDebt: 1500000,
        currentPortionLongDebt: 1000000,
        accruedExpenses: 1500000,
      });

      // CA = 18M, CL = 6M -> 3.00x
      expect(res.currentRatio).toBe(3.0);
    });

    it('13. validates Retail Store & E-Commerce preset', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'itemized',
        cashAndEquivalents: 1500000,
        marketableSecurities: 500000,
        accountsReceivable: 1000000,
        inventory: 4500000,
        prepaidExpenses: 500000,
        accountsPayable: 4000000,
        shortTermDebt: 1500000,
        currentPortionLongDebt: 500000,
        accruedExpenses: 500000,
      });

      // CA = 8M, CL = 6.5M -> 8 / 6.5 = 1.23x
      expect(res.currentRatio).toBe(1.23);
    });

    it('14. validates Commercial Construction preset', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'itemized',
        cashAndEquivalents: 5000000,
        marketableSecurities: 2000000,
        accountsReceivable: 15000000,
        inventory: 11000000,
        prepaidExpenses: 2000000,
        accountsPayable: 12000000,
        shortTermDebt: 5000000,
        currentPortionLongDebt: 1500000,
        accruedExpenses: 1500000,
      });

      // CA = 35M, CL = 20M -> 35 / 20 = 1.75x
      expect(res.currentRatio).toBe(1.75);
    });

    it('15. validates Healthcare & Pharma preset', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'itemized',
        cashAndEquivalents: 3500000,
        marketableSecurities: 1500000,
        accountsReceivable: 4000000,
        inventory: 2500000,
        prepaidExpenses: 500000,
        accountsPayable: 2500000,
        shortTermDebt: 1000000,
        currentPortionLongDebt: 500000,
        accruedExpenses: 1000000,
      });

      // CA = 12M, CL = 5M -> 12 / 5 = 2.40x
      expect(res.currentRatio).toBe(2.4);
    });
  });

  // 6. Boundary Safeguards & Edge Cases
  describe('Boundary Safeguards & Edge Cases', () => {
    it('16. handles zero current liabilities without division by zero', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 5000000,
        totalCurrentLiabilities: 0,
      });

      expect(res.currentRatio).toBe(99.99);
    });

    it('17. handles zero current assets cleanly', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 0,
        totalCurrentLiabilities: 5000000,
      });

      expect(res.currentRatio).toBe(0);
      expect(res.healthVerdict).toBe('WORKING_CAPITAL_DEFICIT');
    });

    it('18. clamps negative asset inputs to 0', () => {
      const res = calculateCurrentRatioCalculator({
        cashAndEquivalents: -1000000,
        inventory: -500000,
      });

      expect(res.cashAndEquivalents).toBe(0);
      expect(res.inventory).toBe(0);
    });

    it('19. clamps negative liability inputs to 0', () => {
      const res = calculateCurrentRatioCalculator({
        accountsPayable: -200000,
        shortTermDebt: -300000,
      });

      expect(res.accountsPayable).toBe(0);
      expect(res.shortTermDebt).toBe(0);
    });

    it('20. handles string inputs cleanly', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: '30000000',
        totalCurrentLiabilities: '15000000',
      });

      expect(res.effectiveCurrentAssets).toBe(30000000);
      expect(res.effectiveCurrentLiabilities).toBe(15000000);
      expect(res.currentRatio).toBe(2.0);
    });

    it('21. supports custom currency symbol ($)', () => {
      const res = calculateCurrentRatioCalculator({ currencySymbol: '$' });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
    });

    it('22. exports calculateCurrentRatioTool alias identically', () => {
      const res1 = calculateCurrentRatioCalculator();
      const res2 = calculateCurrentRatioTool();
      expect(res1.currentRatio).toBe(res2.currentRatio);
    });

    it('23. exports calculateWorkingCapitalRatioCalculator alias identically', () => {
      const res1 = calculateCurrentRatioCalculator();
      const res2 = calculateWorkingCapitalRatioCalculator();
      expect(res1.currentRatio).toBe(res2.currentRatio);
    });

    it('24. verifies default inputs when called with empty object', () => {
      const res = calculateCurrentRatioCalculator();
      expect(res.cashAndEquivalents).toBe(DEFAULT_CURRENT_RATIO_INPUTS.cashAndEquivalents);
      expect(res.currentRatio).toBe(2.0);
    });

    it('25. verifies primaryOutput is currentRatio', () => {
      const res = calculateCurrentRatioCalculator();
      expect(res.primaryOutput).toBe(res.currentRatio);
    });

    it('26. verifies asset breakdown list contains 5 categories', () => {
      const res = calculateCurrentRatioCalculator();
      expect(res.assetBreakdownList.length).toBe(5);
      expect(res.assetBreakdownList[0].label).toContain('Cash');
      expect(res.assetBreakdownList[3].label).toContain('Inventory');
    });

    it('27. verifies 3 prioritized recommendations are produced', () => {
      const res = calculateCurrentRatioCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });

    it('28. clamps target current ratio between 0.5 and 5.0', () => {
      const resHigh = calculateCurrentRatioCalculator({ targetCurrentRatio: 10 });
      expect(resHigh.targetCurrentRatio).toBe(5.0);

      const resLow = calculateCurrentRatioCalculator({ targetCurrentRatio: 0.1 });
      expect(resLow.targetCurrentRatio).toBe(0.5);
    });

    it('29. handles massive corporate balance sheet values (₹1,000 Crores)', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 10000000000,
        totalCurrentLiabilities: 5000000000,
      });

      // 10B / 5B = 2.00x
      expect(res.currentRatio).toBe(2.0);
      expect(res.netWorkingCapital).toBe(5000000000);
    });

    it('30. verifies hero text formatting includes current ratio and net working capital', () => {
      const res = calculateCurrentRatioCalculator();
      expect(res.heroText).toContain('Current Ratio is 2x');
      expect(res.heroText).toContain('Net Working Capital');
    });

    it('31. checks that net working capital equals current assets minus current liabilities', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 8000000,
        totalCurrentLiabilities: 5000000,
      });

      expect(res.netWorkingCapital).toBe(3000000);
    });

    it('32. checks that quick ratio is always less than or equal to current ratio', () => {
      const res = calculateCurrentRatioCalculator();
      expect(res.quickRatio).toBeLessThanOrEqual(res.currentRatio);
    });

    it('33. checks that cash ratio is always less than or equal to quick ratio', () => {
      const res = calculateCurrentRatioCalculator();
      expect(res.cashRatio).toBeLessThanOrEqual(res.quickRatio);
    });

    it('34. handles fractional current ratio formatting (e.g. 1.33x)', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 4000000,
        totalCurrentLiabilities: 3000000,
      });

      // 4M / 3M = 1.3333... -> rounded to 1.33
      expect(res.currentRatio).toBe(1.33);
    });

    it('35. handles other current assets and other current liabilities in itemized mode', () => {
      const res = calculateCurrentRatioCalculator({
        otherCurrentAssets: 500000,
        otherCurrentLiabilities: 300000,
      });

      expect(res.otherCurrentAssets).toBe(500000);
      expect(res.otherCurrentLiabilities).toBe(300000);
    });

    it('36. verifies health color is semantic success for optimal ratio', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 20000000,
        totalCurrentLiabilities: 10000000,
      });

      expect(res.healthColor).toBe('text-semantic-success');
    });

    it('37. verifies health color is rose for working capital deficit', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 5000000,
        totalCurrentLiabilities: 10000000,
      });

      expect(res.healthColor).toBe('text-rose-600');
    });

    it('38. verifies health color is amber for tight buffer', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 12000000,
        totalCurrentLiabilities: 10000000,
      });

      expect(res.healthColor).toBe('text-amber-600');
    });

    it('39. verifies health color is indigo for excess idle capital', () => {
      const res = calculateCurrentRatioCalculator({
        calculationMode: 'direct',
        totalCurrentAssets: 40000000,
        totalCurrentLiabilities: 10000000,
      });

      expect(res.healthColor).toBe('text-indigo-600');
    });

    it('40. handles current portion of long term debt (CPLTD)', () => {
      const res = calculateCurrentRatioCalculator({
        currentPortionLongDebt: 2500000,
      });

      expect(res.currentPortionLongDebt).toBe(2500000);
    });

    it('41. handles short term borrowings / bank overdrafts', () => {
      const res = calculateCurrentRatioCalculator({
        shortTermDebt: 3500000,
      });

      expect(res.shortTermDebt).toBe(3500000);
    });

    it('42. handles trade accounts payable', () => {
      const res = calculateCurrentRatioCalculator({
        accountsPayable: 4000000,
      });

      expect(res.accountsPayable).toBe(4000000);
    });

    it('43. handles prepaid expenses and operational advances', () => {
      const res = calculateCurrentRatioCalculator({
        prepaidExpenses: 1500000,
      });

      expect(res.prepaidExpenses).toBe(1500000);
    });

    it('44. handles net trade receivables / debtors', () => {
      const res = calculateCurrentRatioCalculator({
        accountsReceivable: 6000000,
      });

      expect(res.accountsReceivable).toBe(6000000);
    });

    it('45. verifies complete return object contract integrity', () => {
      const res = calculateCurrentRatioCalculator();
      expect(res).toHaveProperty('currentRatio');
      expect(res).toHaveProperty('quickRatio');
      expect(res).toHaveProperty('cashRatio');
      expect(res).toHaveProperty('effectiveCurrentAssets');
      expect(res).toHaveProperty('effectiveCurrentLiabilities');
      expect(res).toHaveProperty('netWorkingCapital');
      expect(res).toHaveProperty('inventoryConcentrationPct');
      expect(res).toHaveProperty('requiredCurrentAssets');
      expect(res).toHaveProperty('workingCapitalGap');
      expect(res).toHaveProperty('shortTermBorrowingHeadroom');
      expect(res).toHaveProperty('assetBreakdownList');
      expect(res).toHaveProperty('recommendations');
    });
  });
});
