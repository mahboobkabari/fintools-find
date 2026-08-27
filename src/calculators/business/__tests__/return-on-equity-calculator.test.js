import { describe, it, expect } from 'vitest';
import {
  calculateReturnOnEquityCalculator,
  calculateReturnOnEquityTool,
  calculateRoeCalculator,
  DEFAULT_ROE_INPUTS,
} from '../return-on-equity-calculator.js';

describe('Flagship Return on Equity (ROE) Suite (Sprint 75 Audit)', () => {
  // 1. Standard ROE & ROA Calculations
  describe('Standard ROE & ROA Calculations', () => {
    it('1. calculates standard ROE accurately (Net Income / Shareholders Equity)', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 25000000,
        shareholdersEquity: 125000000,
      });

      // ROE = (25M / 125M) * 100 = 20.00%
      expect(res.roePct).toBe(20);
      expect(res.primaryOutput).toBe(20);
    });

    it('2. calculates Return on Assets (ROA) accurately', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 25000000,
        totalAssets: 250000000,
      });

      // ROA = (25M / 250M) * 100 = 10.00%
      expect(res.roaPct).toBe(10);
    });
  });

  // 2. 3-Step DuPont Decomposition
  describe('3-Step DuPont Decomposition', () => {
    it('3. calculates 3-step DuPont drivers accurately', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 25000000, // 25M
        shareholdersEquity: 125000000, // 125M
        revenue: 200000000, // 200M
        totalAssets: 250000000, // 250M
      });

      // Net Profit Margin = (25M / 200M) * 100 = 12.50%
      // Asset Turnover = 200M / 250M = 0.80x
      // Equity Multiplier = 250M / 125M = 2.00x
      // DuPont ROE Product = 12.5% * 0.80 * 2.00 = 20.00%
      expect(res.netProfitMarginPct).toBe(12.5);
      expect(res.assetTurnoverRatio).toBe(0.8);
      expect(res.equityMultiplier).toBe(2.0);
      expect(res.roePct).toBe(20);
    });
  });

  // 3. 5-Step Extended DuPont Decomposition
  describe('5-Step Extended DuPont Decomposition', () => {
    it('4. calculates 5-step DuPont tax & interest burden and operating margins', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 25000000,
        ebt: 33000000,
        ebit: 38000000,
        revenue: 200000000,
      });

      // Tax Burden = (25M / 33M) * 100 = 75.8%
      // Interest Burden = (33M / 38M) * 100 = 86.8%
      // EBIT Margin = (38M / 200M) * 100 = 19.00%
      expect(res.taxBurdenPct).toBe(75.8);
      expect(res.interestBurdenPct).toBe(86.8);
      expect(res.ebitMarginPct).toBe(19);
    });
  });

  // 4. Sustainable Growth Rate (SGR) & Value Creation Spread
  describe('Sustainable Growth Rate (SGR) & Value Creation Spread', () => {
    it('5. calculates Sustainable Growth Rate (ROE * Retention Rate b)', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 25000000,
        shareholdersEquity: 125000000, // ROE = 20%
        dividendPayoutRatio: 30, // Retention = 70%
      });

      // SGR = 20% * 0.70 = 14.00%
      expect(res.retentionRatePct).toBe(70);
      expect(res.sustainableGrowthRatePct).toBe(14);
    });

    it('6. calculates Economic Value Spread against Cost of Equity Ke', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 25000000,
        shareholdersEquity: 125000000, // ROE = 20%
        costOfEquity: 12, // Ke = 12%
      });

      // Value Spread = 20% - 12% = +8.00%
      expect(res.valueCreationSpreadPct).toBe(8);
    });
  });

  // 5. Quality of ROE Diagnosis
  describe('Quality of ROE Diagnosis', () => {
    it('7. classifies ROE >= 20% as EXCEPTIONAL_MOAT', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 50000000,
        shareholdersEquity: 200000000, // 25% ROE
      });

      expect(res.roeQualityVerdict).toBe('EXCEPTIONAL_MOAT');
    });

    it('8. classifies Negative ROE as LOSS_MAKING', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: -10000000,
        shareholdersEquity: 100000000,
      });

      expect(res.roeQualityVerdict).toBe('LOSS_MAKING');
      expect(res.roeQualityColor).toBe('text-rose-600');
    });

    it('9. identifies High Financial Leverage Risk (Multiplier > 3.5 & Margin < 5%)', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 5000000, // 5M
        revenue: 200000000, // 200M -> Margin = 2.5% (< 5%)
        shareholdersEquity: 50000000, // 50M
        totalAssets: 250000000, // 250M -> Multiplier = 5.0x (> 3.5x)
      });

      expect(res.roeQualityVerdict).toBe('HIGH_LEVERAGE_RISK');
    });

    it('10. classifies ROE below Cost of Equity as BELOW_COST_OF_EQUITY', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 8000000,
        shareholdersEquity: 100000000, // ROE = 8%
        costOfEquity: 12, // Ke = 12%
      });

      expect(res.roeQualityVerdict).toBe('BELOW_COST_OF_EQUITY');
    });
  });

  // 6. Presets Validation
  describe('Presets Validation', () => {
    it('11. validates SaaS Tech Startup preset', () => {
      const res = calculateReturnOnEquityCalculator({
        calculationMode: 'dupont3',
        netIncome: 50000000,
        shareholdersEquity: 200000000,
        revenue: 250000000,
        totalAssets: 220000000,
      });

      expect(res.roePct).toBe(25);
      expect(res.netProfitMarginPct).toBe(20);
    });

    it('12. validates Consumer FMCG Brand preset', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 150000000,
        shareholdersEquity: 600000000,
        revenue: 1200000000,
        totalAssets: 850000000,
      });

      expect(res.roePct).toBe(25);
      expect(res.assetTurnoverRatio).toBe(1.41);
    });

    it('13. validates Industrial Manufacturing preset', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 25000000,
        shareholdersEquity: 125000000,
        revenue: 200000000,
        totalAssets: 250000000,
      });

      expect(res.roePct).toBe(20);
      expect(res.equityMultiplier).toBe(2.0);
    });

    it('14. validates Commercial Bank preset (High Leverage Multiplier 8x)', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 400000000,
        shareholdersEquity: 2500000000,
        revenue: 2000000000,
        totalAssets: 20000000000,
      });

      // 400M / 2.5B = 16.00% ROE
      // Equity Multiplier = 20B / 2.5B = 8.00x
      expect(res.roePct).toBe(16);
      expect(res.equityMultiplier).toBe(8.0);
    });

    it('15. validates Infrastructure Utility preset', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 300000000,
        shareholdersEquity: 3000000000,
        revenue: 2500000000,
        totalAssets: 6000000000,
      });

      expect(res.roePct).toBe(10);
      expect(res.roaPct).toBe(5);
    });

    it('16. validates Retail Supermarket Chain preset', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 100000000,
        shareholdersEquity: 500000000,
        revenue: 3000000000,
        totalAssets: 1000000000,
      });

      // 100M / 500M = 20.00% ROE
      // Asset Turnover = 3B / 1B = 3.00x
      expect(res.roePct).toBe(20);
      expect(res.assetTurnoverRatio).toBe(3.0);
    });
  });

  // 7. Boundary Safeguards & Edge Cases
  describe('Boundary Safeguards & Edge Cases', () => {
    it('17. clamps shareholders equity to at least 1 to avoid division by zero', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 5000000,
        shareholdersEquity: 0,
      });

      expect(res.roePct).toBeDefined();
    });

    it('18. handles zero revenue cleanly without crashing margins', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 0,
        revenue: 0,
      });

      expect(res.netProfitMarginPct).toBe(0);
      expect(res.assetTurnoverRatio).toBe(0);
    });

    it('19. clamps dividend payout ratio between 0% and 100%', () => {
      const resHigh = calculateReturnOnEquityCalculator({ dividendPayoutRatio: 120 });
      expect(resHigh.dividendPayoutRatio).toBe(100);
      expect(resHigh.retentionRatePct).toBe(0);

      const resLow = calculateReturnOnEquityCalculator({ dividendPayoutRatio: -10 });
      expect(resLow.dividendPayoutRatio).toBe(0);
      expect(resLow.retentionRatePct).toBe(100);
    });

    it('20. clamps cost of equity between 0% and 100%', () => {
      const res = calculateReturnOnEquityCalculator({ costOfEquity: -5 });
      expect(res.costOfEquity).toBe(0);
    });

    it('21. handles string inputs cleanly', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: '30000000',
        shareholdersEquity: '150000000',
      });

      expect(res.netIncome).toBe(30000000);
      expect(res.shareholdersEquity).toBe(150000000);
      expect(res.roePct).toBe(20);
    });

    it('22. supports custom currency symbol ($)', () => {
      const res = calculateReturnOnEquityCalculator({ currencySymbol: '$' });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
    });

    it('23. exports calculateReturnOnEquityTool alias identically', () => {
      const res1 = calculateReturnOnEquityCalculator();
      const res2 = calculateReturnOnEquityTool();
      expect(res1.roePct).toBe(res2.roePct);
    });

    it('24. exports calculateRoeCalculator alias identically', () => {
      const res1 = calculateReturnOnEquityCalculator();
      const res2 = calculateRoeCalculator();
      expect(res1.roePct).toBe(res2.roePct);
    });

    it('25. verifies default inputs when called with empty object', () => {
      const res = calculateReturnOnEquityCalculator();
      expect(res.netIncome).toBe(DEFAULT_ROE_INPUTS.netIncome);
      expect(res.roePct).toBe(20);
    });

    it('26. verifies primaryOutput is roePct', () => {
      const res = calculateReturnOnEquityCalculator();
      expect(res.primaryOutput).toBe(res.roePct);
    });

    it('27. verifies DuPont breakdown list contains 3 components', () => {
      const res = calculateReturnOnEquityCalculator();
      expect(res.dupontBreakdownList.length).toBe(3);
      expect(res.dupontBreakdownList[0].label).toBe('Net Profit Margin');
      expect(res.dupontBreakdownList[1].label).toBe('Asset Turnover');
      expect(res.dupontBreakdownList[2].label).toBe('Equity Multiplier (Leverage)');
    });

    it('28. verifies 3 prioritized recommendations are produced', () => {
      const res = calculateReturnOnEquityCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });

    it('29. handles massive corporate balance sheet values (₹10,000 Crores)', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 15000000000, // 1,500 Cr
        shareholdersEquity: 75000000000, // 7,500 Cr
        revenue: 100000000000, // 10,000 Cr
        totalAssets: 150000000000, // 15,000 Cr
      });

      // ROE = (15B / 75B) * 100 = 20.00%
      expect(res.roePct).toBe(20);
    });

    it('30. verifies hero text formatting includes ROE and ROA', () => {
      const res = calculateReturnOnEquityCalculator();
      expect(res.heroText).toContain('Return on Equity (ROE) is 20%');
      expect(res.heroText).toContain('ROA: 10%');
    });

    it('31. checks that total assets cannot be less than shareholders equity', () => {
      const res = calculateReturnOnEquityCalculator({
        shareholdersEquity: 200000000,
        totalAssets: 100000000, // lower than equity
      });

      // Total assets is clamped to at least shareholders equity
      expect(res.totalAssets).toBe(200000000);
      expect(res.equityMultiplier).toBe(1.0);
    });

    it('32. handles fractional ROE formatting (e.g. 16.67%)', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 10000000,
        shareholdersEquity: 60000000,
      });

      // 10M / 60M = 16.6666... -> rounded to 16.67%
      expect(res.roePct).toBe(16.67);
    });

    it('33. verifies tax burden defaults to 100% if EBT is 0', () => {
      const res = calculateReturnOnEquityCalculator({ ebt: 0 });
      expect(res.taxBurdenPct).toBe(100);
    });

    it('34. verifies interest burden defaults to 100% if EBIT is 0', () => {
      const res = calculateReturnOnEquityCalculator({ ebit: 0 });
      expect(res.interestBurdenPct).toBe(100);
    });

    it('35. checks that 100% dividend payout results in 0% Sustainable Growth Rate', () => {
      const res = calculateReturnOnEquityCalculator({ dividendPayoutRatio: 100 });
      expect(res.sustainableGrowthRatePct).toBe(0);
    });

    it('36. checks that 0% dividend payout results in SGR equal to ROE', () => {
      const res = calculateReturnOnEquityCalculator({ dividendPayoutRatio: 0 });
      expect(res.sustainableGrowthRatePct).toBe(res.roePct);
    });

    it('37. verifies roe quality color is indigo for exceptional moat', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 30000000,
        shareholdersEquity: 100000000, // 30% ROE
      });

      expect(res.roeQualityColor).toBe('text-indigo-600');
    });

    it('38. verifies roe quality color is amber for high leverage risk', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 4000000,
        revenue: 100000000, // 4% margin (<5%)
        shareholdersEquity: 20000000,
        totalAssets: 100000000, // 5x leverage (>3.5x)
      });

      expect(res.roeQualityColor).toBe('text-amber-600');
    });

    it('39. verifies roe quality color is amber when ROE is below cost of equity', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 5000000,
        shareholdersEquity: 100000000, // 5% ROE
        costOfEquity: 10, // Ke = 10%
      });

      expect(res.roeQualityColor).toBe('text-amber-600');
    });

    it('40. handles ebit and ebt parameters in extended mode', () => {
      const res = calculateReturnOnEquityCalculator({
        ebit: 45000000,
        ebt: 40000000,
      });

      expect(res.ebit).toBe(45000000);
      expect(res.ebt).toBe(40000000);
    });

    it('41. verifies calculation mode is preserved', () => {
      const res = calculateReturnOnEquityCalculator({ calculationMode: 'dupont5' });
      expect(res.calculationMode).toBe('dupont5');
    });

    it('42. verifies negative net income yields negative SGR', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: -20000000,
        shareholdersEquity: 100000000,
        dividendPayoutRatio: 0,
      });

      expect(res.sustainableGrowthRatePct).toBeLessThan(0);
    });

    it('43. verifies value creation spread is negative when ROE < Ke', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 5000000,
        shareholdersEquity: 100000000, // 5% ROE
        costOfEquity: 12,
      });

      expect(res.valueCreationSpreadPct).toBe(-7);
    });

    it('44. verifies that ROE equals ROA * Equity Multiplier', () => {
      const res = calculateReturnOnEquityCalculator({
        netIncome: 20000000,
        shareholdersEquity: 100000000,
        totalAssets: 200000000,
      });

      // ROE = 20%, ROA = 10%, Multiplier = 2.0x -> 10% * 2.0 = 20%
      expect(res.roePct).toBe(Math.round(res.roaPct * res.equityMultiplier * 100) / 100);
    });

    it('45. verifies complete return object contract integrity', () => {
      const res = calculateReturnOnEquityCalculator();
      expect(res).toHaveProperty('roePct');
      expect(res).toHaveProperty('roaPct');
      expect(res).toHaveProperty('netProfitMarginPct');
      expect(res).toHaveProperty('assetTurnoverRatio');
      expect(res).toHaveProperty('equityMultiplier');
      expect(res).toHaveProperty('taxBurdenPct');
      expect(res).toHaveProperty('interestBurdenPct');
      expect(res).toHaveProperty('ebitMarginPct');
      expect(res).toHaveProperty('retentionRatePct');
      expect(res).toHaveProperty('sustainableGrowthRatePct');
      expect(res).toHaveProperty('valueCreationSpreadPct');
      expect(res).toHaveProperty('dupontBreakdownList');
      expect(res).toHaveProperty('recommendations');
    });
  });
});
