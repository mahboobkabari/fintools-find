import { describe, it, expect } from 'vitest';
import {
  calculateReturnOnAssetsCalculator,
  calculateReturnOnAssetsTool,
  calculateRoaCalculator,
  DEFAULT_ROA_INPUTS,
} from '../return-on-assets-calculator.js';
import { ROA_PRESETS } from '../../configs/return-on-assets-calculator.config.js';

describe('Flagship Return on Assets (ROA) Suite (Sprint 76 / Flagship #83)', () => {
  // 1. Core Net ROA Calculations
  describe('1. Core Net ROA Calculations', () => {
    it('1. calculates standard Net ROA accurately (Net Income / Total Assets)', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 25000000,
        totalAssets: 250000000,
      });

      // ROA = (25M / 250M) * 100 = 10.00%
      expect(res.roaPct).toBe(10);
      expect(res.primaryOutput).toBe(10);
    });

    it('2. handles high ROA software company correctly', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 50000000,
        totalAssets: 200000000,
      });

      // ROA = (50M / 200M) * 100 = 25.00%
      expect(res.roaPct).toBe(25);
    });

    it('3. handles negative Net Income (operating loss) accurately', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: -10000000,
        totalAssets: 200000000,
      });

      // ROA = (-10M / 200M) * 100 = -5.00%
      expect(res.roaPct).toBe(-5);
      expect(res.roaQualityVerdict).toBe('VALUE_DESTRUCTIVE');
    });

    it('4. uses default parameters when no inputs provided', () => {
      const res = calculateReturnOnAssetsCalculator();
      expect(res.roaPct).toBe(10);
      expect(res.totalAssets).toBe(DEFAULT_ROA_INPUTS.totalAssets);
      expect(res.netIncome).toBe(DEFAULT_ROA_INPUTS.netIncome);
    });
  });

  // 2. Operating ROA (Basic Earning Power)
  describe('2. Operating ROA / Basic Earning Power', () => {
    it('5. calculates Operating ROA accurately (EBIT / Total Assets)', () => {
      const res = calculateReturnOnAssetsCalculator({
        ebit: 38000000,
        totalAssets: 250000000,
      });

      // Operating ROA = (38M / 250M) * 100 = 15.20%
      expect(res.operatingRoaPct).toBe(15.2);
    });

    it('6. correctly evaluates high operating earnings before interest and tax', () => {
      const res = calculateReturnOnAssetsCalculator({
        ebit: 75000000,
        totalAssets: 250000000,
      });

      // Operating ROA = (75M / 250M) * 100 = 30.00%
      expect(res.operatingRoaPct).toBe(30);
    });

    it('7. reflects negative EBIT as negative Operating ROA', () => {
      const res = calculateReturnOnAssetsCalculator({
        ebit: -15000000,
        totalAssets: 300000000,
      });

      // Operating ROA = (-15M / 300M) * 100 = -5.00%
      expect(res.operatingRoaPct).toBe(-5);
    });

    it('8. provides hero text reflecting both Net ROA and Operating ROA', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 25000000,
        ebit: 38000000,
        totalAssets: 250000000,
      });

      expect(res.heroText).toContain('10%');
      expect(res.heroText).toContain('15.2%');
    });
  });

  // 3. 2-Step DuPont Decomposition (Margin × Turnover)
  describe('3. 2-Step DuPont Decomposition', () => {
    it('9. decomposes ROA into Net Profit Margin and Asset Turnover correctly', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 25000000, // 25M
        revenue: 200000000, // 200M
        totalAssets: 250000000, // 250M
      });

      // Net Margin = (25M / 200M) * 100 = 12.50%
      // Asset Turnover = 200M / 250M = 0.80x
      // ROA = 12.50% * 0.80 = 10.00%
      expect(res.netProfitMarginPct).toBe(12.5);
      expect(res.totalAssetTurnover).toBe(0.8);
      expect(res.roaPct).toBe(10);
    });

    it('10. calculates retail supermarket high turnover with slim margins', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 100000000,
        revenue: 3000000000,
        totalAssets: 1000000000,
      });

      // Net Margin = (100M / 3000M) * 100 = 3.33%
      // Asset Turnover = 3000M / 1000M = 3.00x
      // ROA = (100M / 1000M) * 100 = 10.00%
      expect(res.netProfitMarginPct).toBe(3.33);
      expect(res.totalAssetTurnover).toBe(3.0);
      expect(res.roaPct).toBe(10);
    });

    it('11. verifies mathematical consistency between DuPont product and Net ROA', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 150000000,
        revenue: 1200000000,
        totalAssets: 850000000,
      });

      // Margin = 150M / 1200M = 12.50%
      // Turnover = 1200M / 850M = 1.41x
      // Direct ROA = 150M / 850M = 17.65%
      expect(res.netProfitMarginPct).toBe(12.5);
      expect(res.totalAssetTurnover).toBe(1.41);
      expect(res.roaPct).toBe(17.65);
    });

    it('12. generates structured dupontBreakdownList items', () => {
      const res = calculateReturnOnAssetsCalculator();
      expect(res.dupontBreakdownList.length).toBe(3);
      expect(res.dupontBreakdownList[0].label).toBe('Net Profit Margin');
      expect(res.dupontBreakdownList[1].label).toBe('Total Asset Turnover');
      expect(res.dupontBreakdownList[2].label).toBe('Equity Multiplier');
    });
  });

  // 4. Extended DuPont & ROE Linkage
  describe('4. Extended DuPont & ROE Linkage', () => {
    it('13. computes Equity Multiplier accurately (Total Assets / Shareholders Equity)', () => {
      const res = calculateReturnOnAssetsCalculator({
        totalAssets: 250000000,
        shareholdersEquity: 125000000,
      });

      // Multiplier = 250M / 125M = 2.00x
      expect(res.equityMultiplier).toBe(2.0);
    });

    it('14. amplifies ROA to Return on Equity (ROE = ROA * Equity Multiplier)', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 25000000,
        totalAssets: 250000000,
        shareholdersEquity: 125000000,
      });

      // ROA = 10.00%, Multiplier = 2.00x -> ROE = 20.00%
      expect(res.roaPct).toBe(10);
      expect(res.equityMultiplier).toBe(2.0);
      expect(res.roePct).toBe(20);
    });

    it('15. computes Debt-to-Assets ratio and Total Liabilities', () => {
      const res = calculateReturnOnAssetsCalculator({
        totalAssets: 250000000,
        shareholdersEquity: 125000000,
      });

      // Liabilities = 250M - 125M = 125M
      // Debt-to-Assets = 125M / 250M = 50.00%
      expect(res.liabilities).toBe(125000000);
      expect(res.debtToAssetsPct).toBe(50);
    });

    it('16. handles 100% equity funded firm (zero debt)', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 30000000,
        totalAssets: 200000000,
        shareholdersEquity: 200000000,
      });

      // Multiplier = 1.00x, ROE = ROA = 15.00%
      expect(res.equityMultiplier).toBe(1.0);
      expect(res.debtToAssetsPct).toBe(0);
      expect(res.roePct).toBe(15);
      expect(res.roaPct).toBe(15);
    });

    it('17. handles highly leveraged bank / NBFC balance sheet', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 400000000,
        totalAssets: 20000000000, // 20,000M
        shareholdersEquity: 2500000000, // 2,500M
      });

      // ROA = 400M / 20000M = 2.00%
      // Multiplier = 20000M / 2500M = 8.00x
      // ROE = 400M / 2500M = 16.00%
      expect(res.roaPct).toBe(2);
      expect(res.equityMultiplier).toBe(8);
      expect(res.roePct).toBe(16);
      expect(res.debtToAssetsPct).toBe(87.5);
    });
  });

  // 5. Capital Intensity Ratio & Inverse Velocity
  describe('5. Capital Intensity Ratio', () => {
    it('18. calculates Capital Intensity Ratio (Total Assets / Revenue)', () => {
      const res = calculateReturnOnAssetsCalculator({
        revenue: 200000000,
        totalAssets: 250000000,
      });

      // Capital Intensity = 250M / 200M = 1.25x
      expect(res.capitalIntensityRatio).toBe(1.25);
    });

    it('19. calculates Capital Intensity for asset-light software business', () => {
      const res = calculateReturnOnAssetsCalculator({
        revenue: 500000000,
        totalAssets: 250000000,
      });

      // Capital Intensity = 250M / 500M = 0.50x
      expect(res.capitalIntensityRatio).toBe(0.5);
    });

    it('20. handles zero revenue safely with capital intensity zero clamp', () => {
      const res = calculateReturnOnAssetsCalculator({
        revenue: 0,
        totalAssets: 250000000,
      });

      expect(res.capitalIntensityRatio).toBe(0);
      expect(res.totalAssetTurnover).toBe(0);
    });
  });

  // 6. Granular Asset Productivity (FAT, CAT, ROFA)
  describe('6. Granular Asset Productivity', () => {
    it('21. calculates Fixed Asset Turnover (FAT) accurately', () => {
      const res = calculateReturnOnAssetsCalculator({
        revenue: 200000000,
        fixedAssets: 175000000,
      });

      // FAT = 200M / 175M = 1.14x
      expect(res.fixedAssetTurnover).toBe(1.14);
    });

    it('22. calculates Current Asset Turnover (CAT) accurately', () => {
      const res = calculateReturnOnAssetsCalculator({
        revenue: 200000000,
        currentAssets: 75000000,
      });

      // CAT = 200M / 75M = 2.67x
      expect(res.currentAssetTurnover).toBe(2.67);
    });

    it('23. calculates Return on Fixed Assets (ROFA %)', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 25000000,
        fixedAssets: 175000000,
      });

      // ROFA = (25M / 175M) * 100 = 14.29%
      expect(res.returnOnFixedAssetsPct).toBe(14.29);
    });

    it('24. formats asset mix list with correct percentage splits', () => {
      const res = calculateReturnOnAssetsCalculator({
        totalAssets: 250000000,
        fixedAssets: 175000000,
        currentAssets: 75000000,
      });

      expect(res.assetMixList.length).toBe(2);
      expect(res.assetMixList[0].percentage).toBe(70);
      expect(res.assetMixList[1].percentage).toBe(30);
    });

    it('25. handles zero fixed assets without division by zero errors', () => {
      const res = calculateReturnOnAssetsCalculator({
        revenue: 100000000,
        fixedAssets: 0,
      });

      expect(res.fixedAssetTurnover).toBe(0);
      expect(res.returnOnFixedAssetsPct).toBe(0);
    });
  });

  // 7. Tax-Adjusted & NOPAT ROA
  describe('7. Tax-Adjusted & NOPAT ROA', () => {
    it('26. calculates NOPAT accurately (EBIT * (1 - Tax Rate))', () => {
      const res = calculateReturnOnAssetsCalculator({
        ebit: 40000000,
        taxRate: 25,
      });

      // NOPAT = 40M * (1 - 0.25) = 30M
      expect(res.nopat).toBe(30000000);
    });

    it('27. calculates NOPAT ROA accurately', () => {
      const res = calculateReturnOnAssetsCalculator({
        ebit: 40000000,
        taxRate: 25,
        totalAssets: 200000000,
      });

      // NOPAT = 30M, Total Assets = 200M -> NOPAT ROA = 15.00%
      expect(res.nopatRoaPct).toBe(15);
    });

    it('28. handles 0% tax rate jurisdiction correctly', () => {
      const res = calculateReturnOnAssetsCalculator({
        ebit: 50000000,
        taxRate: 0,
        totalAssets: 250000000,
      });

      // NOPAT = 50M -> NOPAT ROA = (50M / 250M) * 100 = 20.00%
      expect(res.nopat).toBe(50000000);
      expect(res.nopatRoaPct).toBe(20);
    });

    it('29. clamps tax rate between 0 and 100%', () => {
      const res = calculateReturnOnAssetsCalculator({
        taxRate: 150,
      });

      expect(res.taxRate).toBe(100);
    });
  });

  // 8. DuPont Strategy Archetypes
  describe('8. DuPont Strategy Archetypes', () => {
    it('30. identifies High Margin / Low Turnover strategy', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 40000000,
        revenue: 200000000, // Margin = 20%
        totalAssets: 400000000, // Turn = 0.5x
      });

      expect(res.dupontStrategy).toBe('HIGH_MARGIN_LOW_TURNOVER');
      expect(res.dupontStrategyTitle).toContain('High Margin');
    });

    it('31. identifies Low Margin / High Turnover strategy', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 80000000,
        revenue: 2000000000, // Margin = 4.0%
        totalAssets: 1000000000, // Turn = 2.0x
      });

      expect(res.dupontStrategy).toBe('LOW_MARGIN_HIGH_TURNOVER');
      expect(res.dupontStrategyTitle).toContain('High Volume');
    });

    it('32. identifies Capital Inefficient Trapped Assets', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 2000000,
        revenue: 100000000, // Margin = 2%
        totalAssets: 200000000, // Turn = 0.5x
      });

      expect(res.dupontStrategy).toBe('CAPITAL_INEFFICIENT_TRAP');
      expect(res.dupontStrategyTitle).toContain('Capital Inefficient');
    });

    it('33. defaults to Balanced Efficiency for standard ratios', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 20000000,
        revenue: 200000000, // Margin = 10%
        totalAssets: 200000000, // Turn = 1.0x
      });

      expect(res.dupontStrategy).toBe('BALANCED_EFFICIENCY');
    });
  });

  // 9. Quality of ROA Classifications
  describe('9. Quality of ROA Classifications', () => {
    it('34. classifies Tier-1 Asset-Light Compounder (ROA >= 15%)', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 45000000,
        totalAssets: 200000000, // ROA = 22.50%
      });

      expect(res.roaQualityVerdict).toBe('TIER_ONE_COMPOUNDER');
      expect(res.roaQualityColor).toBe('text-indigo-600');
    });

    it('35. classifies Strong Operating Efficiency (10% <= ROA < 15%)', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 25000000,
        totalAssets: 200000000, // ROA = 12.50%
      });

      expect(res.roaQualityVerdict).toBe('STRONG_OPERATIONAL_EFFICIENCY');
      expect(res.roaQualityColor).toBe('text-semantic-success');
    });

    it('36. classifies Healthy Industrial Standard (5% <= ROA < 10%)', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 14000000,
        totalAssets: 200000000, // ROA = 7.00%
      });

      expect(res.roaQualityVerdict).toBe('HEALTHY_INDUSTRIAL');
      expect(res.roaQualityColor).toBe('text-primary');
    });

    it('37. classifies Financial Intermediation for low ROA high leverage banks', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 200000000,
        totalAssets: 10000000000, // ROA = 2.0%
        shareholdersEquity: 1000000000, // Multiplier = 10x
      });

      expect(res.roaQualityVerdict).toBe('FINANCIAL_INTERMEDIATION');
      expect(res.roaQualityColor).toBe('text-blue-600');
    });

    it('38. classifies Sub-Optimal Asset Utilization (ROA < 5% non-bank)', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 6000000,
        totalAssets: 200000000, // ROA = 3.0%
        shareholdersEquity: 100000000, // Multiplier = 2x
      });

      expect(res.roaQualityVerdict).toBe('SUB_OPTIMAL_UTILIZATION');
      expect(res.roaQualityColor).toBe('text-amber-600');
    });
  });

  // 10. Industry Presets Verification
  describe('10. Industry Presets Verification', () => {
    it('39. verifies SaaS Software Preset', () => {
      const preset = ROA_PRESETS.find((p) => p.id === 'saas_software');
      expect(preset).toBeDefined();
      const res = calculateReturnOnAssetsCalculator(preset.values);
      expect(res.roaPct).toBe(20);
      expect(res.netProfitMarginPct).toBe(20);
      expect(res.totalAssetTurnover).toBe(1.0);
    });

    it('40. verifies Consumer FMCG Brand Preset', () => {
      const preset = ROA_PRESETS.find((p) => p.id === 'consumer_fmcg');
      expect(preset).toBeDefined();
      const res = calculateReturnOnAssetsCalculator(preset.values);
      expect(res.roaPct).toBe(17.65);
      expect(res.netProfitMarginPct).toBe(12.5);
    });

    it('41. verifies Retail Supermarket Chain Preset', () => {
      const preset = ROA_PRESETS.find((p) => p.id === 'retail_chain');
      expect(preset).toBeDefined();
      const res = calculateReturnOnAssetsCalculator(preset.values);
      expect(res.roaPct).toBe(10);
      expect(res.totalAssetTurnover).toBe(3);
    });

    it('42. verifies Industrial Heavy Manufacturing Preset', () => {
      const preset = ROA_PRESETS.find((p) => p.id === 'industrial_mfg');
      expect(preset).toBeDefined();
      const res = calculateReturnOnAssetsCalculator(preset.values);
      expect(res.roaPct).toBe(10);
      expect(res.operatingRoaPct).toBe(15.2);
    });
  });

  // 11. Edge Cases, Clamping & Aliases
  describe('11. Edge Cases, Clamping & Aliases', () => {
    it('43. handles invalid non-numeric inputs gracefully without NaN crashing', () => {
      const res = calculateReturnOnAssetsCalculator({
        netIncome: 'invalid',
        totalAssets: 'none',
        revenue: null,
      });

      expect(isNaN(res.roaPct)).toBe(false);
      expect(isNaN(res.operatingRoaPct)).toBe(false);
      expect(isNaN(res.totalAssetTurnover)).toBe(false);
    });

    it('44. generates 3 ranked actionable recommendations', () => {
      const res = calculateReturnOnAssetsCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });

    it('45. exports all function aliases correctly for backward compatibility', () => {
      expect(typeof calculateReturnOnAssetsCalculator).toBe('function');
      expect(typeof calculateReturnOnAssetsTool).toBe('function');
      expect(typeof calculateRoaCalculator).toBe('function');

      const res1 = calculateReturnOnAssetsCalculator();
      const res2 = calculateReturnOnAssetsTool();
      const res3 = calculateRoaCalculator();

      expect(res1.roaPct).toBe(res2.roaPct);
      expect(res2.roaPct).toBe(res3.roaPct);
    });
  });
});
