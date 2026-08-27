import { describe, it, expect } from 'vitest';
import {
  calculateCostOfLiving,
  calculateCostOfLivingCalculator,
  calculateRelocationBudget,
  EXPENSE_CATEGORIES,
  CURRENCY_METADATA,
  REFERENCE_METADATA,
} from '../cost-of-living-calculator.js';
import { COST_OF_LIVING_CONFIG } from '../../configs/cost-of-living-calculator.config.js';

describe('Flagship Cost of Living Suite (Sprint 79 / Flagship #86)', () => {
  // 1. Core Default Execution
  describe('1. Default Parameters & Baseline Calculations', () => {
    it('1. executes successfully with default inputs', () => {
      const res = calculateCostOfLiving();
      expect(res).toBeDefined();
      expect(res.currentMonthlyTotal).toBeGreaterThan(0);
      expect(res.targetMonthlyTotal).toBeGreaterThan(0);
      expect(res.categoryBreakdown.length).toBe(8);
      expect(res.currency).toBe('INR');
    });

    it('2. annualizes monthly totals accurately (Annual = Monthly * 12)', () => {
      const res = calculateCostOfLiving();
      expect(res.currentAnnualTotal).toBe(res.currentMonthlyTotal * 12);
      expect(res.targetAnnualTotal).toBe(res.targetMonthlyTotal * 12);
      expect(res.costDifferenceAnnual).toBe(res.costDifferenceMonthly * 12);
    });

    it('3. calculates cost difference and percentage difference accurately', () => {
      const res = calculateCostOfLiving({
        currentExpenses: { housing: 20000, food: 10000 },
        targetExpenses: { housing: 30000, food: 15000 },
      });
      // Current = 30,000, Target = 45,000 -> Diff = +15,000 (+50%)
      expect(res.currentMonthlyTotal).toBe(30000);
      expect(res.targetMonthlyTotal).toBe(45000);
      expect(res.costDifferenceMonthly).toBe(15000);
      expect(res.percentageDifference).toBe(50.0);
    });

    it('4. splits essential vs discretionary expenses accurately', () => {
      const res = calculateCostOfLiving({
        currentExpenses: {
          housing: 20000, // essential
          utilities: 5000, // essential
          food: 10000, // essential
          transportation: 5000, // essential
          healthcare: 3000, // essential
          lifestyle: 6000, // discretionary
          family: 0, // discretionary
          miscellaneous: 2000, // discretionary
        },
      });
      expect(res.currentEssentialTotal).toBe(43000);
      expect(res.currentDiscretionaryTotal).toBe(8000);
      expect(res.currentMonthlyTotal).toBe(51000);
    });
  });

  // 2. Comparison & Lifestyle-Equivalent Income
  describe('2. Relocation Comparison & Equivalent Income Analysis', () => {
    it('5. computes lifestyle-equivalent target income for more expensive city', () => {
      const res = calculateCostOfLiving({
        currentIncome: 100000,
        currentExpenses: { housing: 20000, food: 10000 }, // 30,000
        targetExpenses: { housing: 30000, food: 15000 }, // 45,000 (1.5x)
      });
      // Cost multiplier = 45k / 30k = 1.5 -> Equivalent income = 150,000
      expect(res.equivalentTargetIncome).toBe(150000);
      expect(res.incomeChangeNeededPct).toBe(50.0);
      expect(res.incomeDifference).toBe(50000);
    });

    it('6. computes lifestyle-equivalent target income for cheaper city (Geo-Arbitrage)', () => {
      const res = calculateCostOfLiving({
        currentIncome: 120000,
        currentExpenses: { housing: 40000, food: 20000 }, // 60,000
        targetExpenses: { housing: 20000, food: 10000 }, // 30,000 (0.5x)
      });
      // Cost multiplier = 30k / 60k = 0.5 -> Equivalent income = 60,000
      expect(res.equivalentTargetIncome).toBe(60000);
      expect(res.incomeChangeNeededPct).toBe(-50.0);
      expect(res.percentageDifference).toBe(-50.0);
    });

    it('7. calculates net monthly savings delta when both incomes are provided', () => {
      const res = calculateCostOfLiving({
        currentIncome: 100000,
        targetIncome: 140000,
        currentExpenses: { housing: 25000, food: 15000 }, // 40,000 cost -> 60k savings
        targetExpenses: { housing: 40000, food: 20000 }, // 60,000 cost -> 80k savings
      });
      expect(res.currentMonthlySavings).toBe(60000);
      expect(res.targetMonthlySavings).toBe(80000);
      expect(res.savingsDeltaMonthly).toBe(20000);
    });
  });

  // 3. Category Breakdown & Housing Burden
  describe('3. Category Breakdown & Housing Share Ratios', () => {
    it('8. provides all 8 expense categories in breakdown array', () => {
      const res = calculateCostOfLiving();
      expect(res.categoryBreakdown.length).toBe(8);
      const ids = res.categoryBreakdown.map(c => c.id);
      expect(ids).toEqual(['housing', 'utilities', 'food', 'transportation', 'healthcare', 'lifestyle', 'family', 'miscellaneous']);
    });

    it('9. calculates category budget share percentages accurately', () => {
      const res = calculateCostOfLiving({
        currentExpenses: { housing: 50000, food: 50000 },
      });
      const hItem = res.categoryBreakdown.find(c => c.id === 'housing');
      const fItem = res.categoryBreakdown.find(c => c.id === 'food');
      expect(hItem.shareCurrentPct).toBe(50.0);
      expect(fItem.shareCurrentPct).toBe(50.0);
    });

    it('10. flags elevated housing burden ratio when housing exceeds 40% of budget', () => {
      const res = calculateCostOfLiving({
        targetExpenses: { housing: 45000, utilities: 5000, food: 10000 }, // Housing = 45k / 60k = 75%
      });
      expect(res.targetHousingShare).toBe(75.0);
      const houseRec = res.recommendations.find(r => r.title.includes('Housing Burden'));
      expect(houseRec).toBeDefined();
    });
  });

  // 4. Edge Cases & Boundary Conditions
  describe('4. Zero, Missing & Extreme Boundary Safeguards', () => {
    it('11. handles identical current and target expenses (0% difference)', () => {
      const res = calculateCostOfLiving({
        currentExpenses: { housing: 30000, food: 15000 },
        targetExpenses: { housing: 30000, food: 15000 },
      });
      expect(res.costDifferenceMonthly).toBe(0);
      expect(res.costDifferenceAnnual).toBe(0);
      expect(res.percentageDifference).toBe(0);
      expect(res.heroText).toContain('identical');
    });

    it('12. handles zero expenses across all categories safely without crashing', () => {
      const res = calculateCostOfLiving({
        currentExpenses: { housing: 0, food: 0, utilities: 0 },
        targetExpenses: { housing: 0, food: 0, utilities: 0 },
      });
      expect(res.currentMonthlyTotal).toBe(0);
      expect(res.targetMonthlyTotal).toBe(0);
      expect(res.percentageDifference).toBe(0);
      expect(res.equivalentTargetIncome).toBe(100000);
    });

    it('13. handles zero current income gracefully', () => {
      const res = calculateCostOfLiving({
        currentIncome: 0,
        currentExpenses: { housing: 20000 },
        targetExpenses: { housing: 30000 },
      });
      expect(res.currentIncome).toBe(0);
      expect(res.currentMonthlySavings).toBe(0);
      expect(res.equivalentTargetIncome).toBe(30000);
    });

    it('14. sanitizes negative expense inputs using Math.max(0)', () => {
      const res = calculateCostOfLiving({
        currentExpenses: { housing: -20000, food: -5000 },
        targetExpenses: { housing: -30000 },
      });
      expect(res.currentMonthlyTotal).toBe(0);
      expect(res.targetMonthlyTotal).toBe(0);
    });

    it('15. handles non-numeric string values gracefully', () => {
      const res = calculateCostOfLiving({
        currentIncome: 'invalid',
        currentExpenses: { housing: 'bad', food: 10000 },
      });
      expect(res.currentIncome).toBe(0);
      expect(res.currentMonthlyTotal).toBe(10000);
    });

    it('16. clamps extreme single category inputs above 10,000,000', () => {
      const res = calculateCostOfLiving({
        currentExpenses: { housing: 99999999 },
      });
      expect(res.currentMonthlyTotal).toBe(10000000);
    });
  });

  // 5. Multi-Currency Support & Metadata
  describe('5. Multi-Currency & Symbols Verification', () => {
    it('17. supports INR currency code and formatting', () => {
      const res = calculateCostOfLiving({ currency: 'INR' });
      expect(res.currency).toBe('INR');
      expect(res.currencyMeta.symbol).toBe('₹');
    });

    it('18. supports USD currency code and formatting', () => {
      const res = calculateCostOfLiving({ currency: 'USD' });
      expect(res.currency).toBe('USD');
      expect(res.currencyMeta.symbol).toBe('$');
    });

    it('19. supports EUR currency code and formatting', () => {
      const res = calculateCostOfLiving({ currency: 'EUR' });
      expect(res.currency).toBe('EUR');
      expect(res.currencyMeta.symbol).toBe('€');
    });

    it('20. supports GBP currency code and formatting', () => {
      const res = calculateCostOfLiving({ currency: 'GBP' });
      expect(res.currency).toBe('GBP');
      expect(res.currencyMeta.symbol).toBe('£');
    });

    it('21. supports AED, CAD, AUD, SGD codes', () => {
      expect(calculateCostOfLiving({ currency: 'AED' }).currencyMeta.symbol).toBe('د.إ');
      expect(calculateCostOfLiving({ currency: 'CAD' }).currencyMeta.symbol).toBe('C$');
      expect(calculateCostOfLiving({ currency: 'AUD' }).currencyMeta.symbol).toBe('A$');
      expect(calculateCostOfLiving({ currency: 'SGD' }).currencyMeta.symbol).toBe('S$');
    });

    it('22. falls back to INR for unknown currency code', () => {
      const res = calculateCostOfLiving({ currency: 'UNKNOWN' });
      expect(res.currencyMeta.symbol).toBe('₹');
    });
  });

  // 6. Hero Verdict & Actionable Recommendations
  describe('6. Hero Text & Recommendations', () => {
    it('23. formats positive percentage hero text when target is more expensive', () => {
      const res = calculateCostOfLiving({
        currentLocation: 'Pune',
        targetLocation: 'Mumbai',
        currentExpenses: { housing: 20000 },
        targetExpenses: { housing: 30000 },
      });
      expect(res.heroText).toContain('Mumbai is 50% more expensive than Pune');
    });

    it('24. formats negative percentage hero text when target is cheaper', () => {
      const res = calculateCostOfLiving({
        currentLocation: 'Bengaluru',
        targetLocation: 'Goa',
        currentExpenses: { housing: 40000 },
        targetExpenses: { housing: 20000 },
      });
      expect(res.heroText).toContain('Goa is 50% cheaper than Bengaluru');
    });

    it('25. generates critical recommendation for >20% cost increase', () => {
      const res = calculateCostOfLiving({
        currentExpenses: { housing: 20000 },
        targetExpenses: { housing: 30000 },
      });
      const critRec = res.recommendations.find(r => r.type === 'critical');
      expect(critRec).toBeDefined();
      expect(critRec.title).toContain('Substantial Relocation Cost Increase');
    });

    it('26. generates positive geo-arbitrage recommendation for <-10% cheaper move', () => {
      const res = calculateCostOfLiving({
        currentExpenses: { housing: 40000 },
        targetExpenses: { housing: 20000 },
      });
      const posRec = res.recommendations.find(r => r.type === 'positive');
      expect(posRec).toBeDefined();
      expect(posRec.title).toContain('Geo-Arbitrage Savings Opportunity');
    });
  });

  // 7. Scenario Presets Verification
  describe('7. Scenario Presets Verification', () => {
    it('27. verifies Tier-2 to Tier-1 Metro Preset', () => {
      const p = COST_OF_LIVING_CONFIG.presets[0];
      const res = calculateCostOfLiving(p);
      expect(res.currentLocation).toBe('Pune / Jaipur / Kochi');
      expect(res.targetLocation).toBe('Mumbai / Bengaluru / Delhi NCR');
      expect(res.costDifferenceMonthly).toBeGreaterThan(0);
    });

    it('28. verifies Family with 2 Kids Preset', () => {
      const p = COST_OF_LIVING_CONFIG.presets[1];
      const res = calculateCostOfLiving(p);
      const famItem = res.categoryBreakdown.find(c => c.id === 'family');
      expect(famItem.currentMonthly).toBe(20000);
      expect(famItem.targetMonthly).toBe(35000);
      expect(res.targetMonthlyTotal).toBeGreaterThan(150000);
    });

    it('29. verifies Remote Work Geo-Arbitrage Preset', () => {
      const p = COST_OF_LIVING_CONFIG.presets[2];
      const res = calculateCostOfLiving(p);
      expect(res.costDifferenceMonthly).toBeLessThan(0);
      expect(res.percentageDifference).toBeLessThan(-40);
    });

    it('30. verifies US Relocation Preset', () => {
      const p = COST_OF_LIVING_CONFIG.presets[3];
      const res = calculateCostOfLiving(p);
      expect(res.currency).toBe('USD');
      expect(res.currentMonthlyTotal).toBe(5200);
      expect(res.targetMonthlyTotal).toBe(8300);
    });

    it('31. verifies Frugal Solo Budgeting Preset', () => {
      const p = COST_OF_LIVING_CONFIG.presets[4];
      const res = calculateCostOfLiving(p);
      expect(res.currentMonthlyTotal).toBe(33500);
      expect(res.targetMonthlyTotal).toBe(51000);
    });

    it('32. verifies Eurozone Relocation Preset', () => {
      const p = COST_OF_LIVING_CONFIG.presets[5];
      const res = calculateCostOfLiving(p);
      expect(res.currency).toBe('EUR');
      expect(res.currentMonthlyTotal).toBe(2600);
      expect(res.targetMonthlyTotal).toBe(4150);
    });
  });

  // 8. Reference Metadata & Disclosures
  describe('8. Reference Metadata & Disclosures', () => {
    it('33. provides baseline date in reference metadata', () => {
      const res = calculateCostOfLiving();
      expect(res.metadata.baselineDate).toBe(REFERENCE_METADATA.baselineDate);
    });

    it('34. includes methodology and disclosure text in metadata', () => {
      const res = calculateCostOfLiving();
      expect(res.metadata.methodologyType).toContain('Personalized');
      expect(res.metadata.disclaimer).toContain('personalized budget');
    });

    it('35. verifies EXPENSE_CATEGORIES list contains all valid labels and icons', () => {
      expect(EXPENSE_CATEGORIES.length).toBe(8);
      EXPENSE_CATEGORIES.forEach((c) => {
        expect(c.id).toBeDefined();
        expect(c.label).toBeDefined();
        expect(c.icon).toBeDefined();
        expect(typeof c.isEssential).toBe('boolean');
      });
    });
  });

  // 9. Additional Scenarios & Precision
  describe('9. Detailed Comparative Calculations', () => {
    it('36. calculates category annual totals consistently (annual = monthly * 12)', () => {
      const res = calculateCostOfLiving({
        currentExpenses: { housing: 25000, utilities: 5000 },
      });
      const h = res.categoryBreakdown.find(c => c.id === 'housing');
      expect(h.currentAnnual).toBe(25000 * 12);
      expect(h.targetAnnual).toBe(h.targetMonthly * 12);
    });

    it('37. handles custom location names properly in hero text', () => {
      const res = calculateCostOfLiving({
        currentLocation: 'Tokyo',
        targetLocation: 'Singapore',
        currentExpenses: { housing: 100000 },
        targetExpenses: { housing: 150000 },
      });
      expect(res.heroText).toContain('Singapore is 50% more expensive than Tokyo');
    });

    it('38. handles equal income and expense scenario (0 savings)', () => {
      const res = calculateCostOfLiving({
        currentIncome: 50000,
        currentExpenses: { housing: 50000 },
      });
      expect(res.currentMonthlySavings).toBe(0);
    });

    it('39. handles higher income than expenses (positive savings)', () => {
      const res = calculateCostOfLiving({
        currentIncome: 120000,
        currentExpenses: { housing: 40000, food: 20000 },
      });
      expect(res.currentMonthlySavings).toBe(60000);
    });

    it('40. handles target monthly total of 0 when calculating equivalent income', () => {
      const res = calculateCostOfLiving({
        currentIncome: 100000,
        currentExpenses: { housing: 30000 },
        targetExpenses: { housing: 0, food: 0 },
      });
      expect(res.equivalentTargetIncome).toBe(0);
    });

    it('41. verifies all 8 currency metadata entries in CURRENCY_METADATA', () => {
      expect(Object.keys(CURRENCY_METADATA).length).toBe(8);
      Object.keys(CURRENCY_METADATA).forEach((code) => {
        expect(CURRENCY_METADATA[code].symbol).toBeDefined();
        expect(CURRENCY_METADATA[code].flag).toBeDefined();
      });
    });

    it('42. validates that recommendations array contains between 2 and 4 actionable items', () => {
      const res = calculateCostOfLiving();
      expect(res.recommendations.length).toBeGreaterThanOrEqual(2);
      expect(res.recommendations.length).toBeLessThanOrEqual(4);
    });
  });

  // 10. Aliases & Module Consistency
  describe('10. Aliases & Exports Verification', () => {
    it('43. exports calculateCostOfLivingCalculator alias identically', () => {
      const res1 = calculateCostOfLiving({ currentIncome: 80000 });
      const res2 = calculateCostOfLivingCalculator({ currentIncome: 80000 });
      expect(res1.currentMonthlyTotal).toBe(res2.currentMonthlyTotal);
      expect(res1.equivalentTargetIncome).toBe(res2.equivalentTargetIncome);
    });

    it('44. exports calculateRelocationBudget alias identically', () => {
      const res1 = calculateCostOfLiving({ currentIncome: 80000 });
      const res2 = calculateRelocationBudget({ currentIncome: 80000 });
      expect(res1.currentMonthlyTotal).toBe(res2.currentMonthlyTotal);
    });

    it('45. maintains consistent config id, category, and version', () => {
      expect(COST_OF_LIVING_CONFIG.id).toBe('cost-of-living-calculator');
      expect(COST_OF_LIVING_CONFIG.category).toBe('currency');
      expect(COST_OF_LIVING_CONFIG.version).toBe('3.0.0');
    });
  });
});
