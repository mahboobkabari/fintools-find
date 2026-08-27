import { describe, it, expect } from 'vitest';
import {
  calculate503020BudgetCalculator,
  calculate503020BudgetTool,
  BUDGET_FRAMEWORKS,
  DEFAULT_BUDGET_INPUTS,
} from '../50-30-20-budget-calculator.js';

describe('Flagship 50/30/20 Budget & Wealth Projection Suite (Sprint 65 Audit)', () => {
  // 1. Target Percentage Calculations & Standard Rules
  describe('Standard 50/30/20 Target Calculations', () => {
    it('1. calculates exact 50/30/20 targets for ₹1,00,000 monthly income', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 100000,
        ruleFramework: '50_30_20',
      });

      expect(res.targetNeedsPct).toBe(50);
      expect(res.targetWantsPct).toBe(30);
      expect(res.targetSavingsPct).toBe(20);

      expect(res.targetNeedsAmount).toBe(50000);
      expect(res.targetWantsAmount).toBe(30000);
      expect(res.targetSavingsAmount).toBe(20000);
    });

    it('2. calculates Metro 60/20/20 rule correctly', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 150000,
        ruleFramework: '60_20_20',
      });

      expect(res.targetNeedsPct).toBe(60);
      expect(res.targetWantsPct).toBe(20);
      expect(res.targetSavingsPct).toBe(20);

      expect(res.targetNeedsAmount).toBe(90000);
      expect(res.targetWantsAmount).toBe(30000);
      expect(res.targetSavingsAmount).toBe(30000);
    });

    it('3. calculates Debt Recovery 70/20/10 rule correctly', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 80000,
        ruleFramework: '70_20_10',
      });

      expect(res.targetNeedsAmount).toBe(56000); // 70% of 80k
      expect(res.targetWantsAmount).toBe(16000); // 20% of 80k
      expect(res.targetSavingsAmount).toBe(8000); // 10% of 80k
    });

    it('4. calculates Aggressive FIRE 40/20/40 rule correctly', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 120000,
        ruleFramework: '40_20_40',
      });

      expect(res.targetNeedsAmount).toBe(48000); // 40% of 120k
      expect(res.targetWantsAmount).toBe(24000); // 20% of 120k
      expect(res.targetSavingsAmount).toBe(48000); // 40% of 120k
    });

    it('5. accepts custom percentage allocations', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 100000,
        ruleFramework: 'custom',
        customNeedsPct: 45,
        customWantsPct: 25,
        customSavingsPct: 30,
      });

      expect(res.targetNeedsAmount).toBe(45000);
      expect(res.targetWantsAmount).toBe(25000);
      expect(res.targetSavingsAmount).toBe(30000);
    });
  });

  // 2. Itemized Expense Aggregation
  describe('Itemized Expense Aggregation', () => {
    it('6. aggregates all itemized needs expenses accurately', () => {
      const res = calculate503020BudgetCalculator({
        actualRent: 20000,
        actualGroceries: 10000,
        actualUtilities: 5000,
        actualInsurance: 3000,
        actualTransport: 4000,
      });

      // Needs = 20k + 10k + 5k + 3k + 4k = 42k
      expect(res.totalActualNeeds).toBe(42000);
    });

    it('7. aggregates all itemized wants expenses accurately', () => {
      const res = calculate503020BudgetCalculator({
        actualDining: 8000,
        actualEntertainment: 5000,
        actualShopping: 7000,
        actualVacation: 3000,
      });

      // Wants = 8k + 5k + 7k + 3k = 23k
      expect(res.totalActualWants).toBe(23000);
    });

    it('8. aggregates investments and emergency fund savings accurately', () => {
      const res = calculate503020BudgetCalculator({
        actualInvestments: 18000,
        actualEmergencyFund: 7000,
      });

      // Savings = 18k + 7k = 25k
      expect(res.totalActualSavings).toBe(25000);
    });

    it('9. computes unallocated cash surplus correctly', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 100000,
        actualRent: 25000,
        actualGroceries: 12000,
        actualUtilities: 6000,
        actualInsurance: 4000,
        actualTransport: 5000, // Needs: 52k
        actualDining: 10000,
        actualEntertainment: 6000,
        actualShopping: 8000,
        actualVacation: 4000, // Wants: 28k
        actualInvestments: 10000,
        actualEmergencyFund: 5000, // Savings: 15k
      });

      // Total expenses = 52k + 28k + 15k = 95k
      expect(res.totalActualExpenses).toBe(95000);
      expect(res.unallocatedCash).toBe(5000);
    });
  });

  // 3. Variance Analytics (Actual vs Target)
  describe('Variance Analytics', () => {
    it('10. computes variance for needs, wants, and savings correctly', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 100000,
        ruleFramework: '50_30_20',
        actualRent: 30000,
        actualGroceries: 15000,
        actualUtilities: 10000,
        actualInsurance: 0,
        actualTransport: 0, // Needs = 55k (Target: 50k -> +5k variance)
        actualDining: 15000,
        actualEntertainment: 5000,
        actualShopping: 5000,
        actualVacation: 0, // Wants = 25k (Target: 30k -> -5k variance)
        actualInvestments: 15000,
        actualEmergencyFund: 5000, // Savings = 20k (Target: 20k -> 0 variance)
      });

      expect(res.needsVariance).toBe(5000);
      expect(res.wantsVariance).toBe(-5000);
      expect(res.savingsVariance).toBe(0);
    });
  });

  // 4. 10-Year Compound Wealth Projection Engine
  describe('10-Year Compound Wealth Projections', () => {
    it('11. projects compound wealth across 1, 3, 5, 10, 15, 20 years at 12% CAGR', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 100000,
        actualInvestments: 15000,
        actualEmergencyFund: 5000, // Total savings = 20k/mo
        expectedReturnRate: 12,
      });

      // 20k/mo @ 12% over 10 yrs (120 months) -> ~46 Lakhs
      expect(res.tenYearActualCorpus).toBeGreaterThan(4500000);
      expect(res.tenYearActualCorpus).toBeLessThan(4800000);
      expect(res.wealthProjections.length).toBe(6);
      expect(res.wealthProjections[3].years).toBe(10);
      expect(res.wealthProjections[3].actualCorpus).toBe(res.tenYearActualCorpus);
    });

    it('12. handles 0% CAGR return rate safely (straight cumulative savings)', () => {
      const res = calculate503020BudgetCalculator({
        actualInvestments: 10000,
        actualEmergencyFund: 0,
        expectedReturnRate: 0,
      });

      // 10k/mo * 120 months = 1,200,000
      expect(res.tenYearActualCorpus).toBe(1200000);
    });
  });

  // 5. Spending Health Scorecard (0 to 100)
  describe('Spending Health Scorecard', () => {
    it('13. awards 100 score to perfectly balanced 50/30/20 budget', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 100000,
        ruleFramework: '50_30_20',
        actualRent: 25000,
        actualGroceries: 15000,
        actualUtilities: 5000,
        actualInsurance: 3000,
        actualTransport: 2000, // Needs = 50k (50%)
        actualDining: 10000,
        actualEntertainment: 8000,
        actualShopping: 7000,
        actualVacation: 5000, // Wants = 30k (30%)
        actualInvestments: 15000,
        actualEmergencyFund: 5000, // Savings = 20k (20%)
      });

      expect(res.healthScore).toBe(100);
      expect(res.healthGrade).toBe('Optimal Budget');
    });

    it('14. penalizes budget with high needs and low savings', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 100000,
        actualRent: 50000,
        actualGroceries: 20000,
        actualUtilities: 10000, // Needs = 80k (80%)
        actualDining: 15000, // Wants = 15k (15%)
        actualInvestments: 5000, // Savings = 5k (5%)
      });

      expect(res.healthScore).toBeLessThan(70);
    });
  });

  // 6. Framework Comparison Matrix
  describe('Framework Comparison Matrix', () => {
    it('15. generates comparison data for all 4 established frameworks', () => {
      const res = calculate503020BudgetCalculator({ monthlyIncome: 100000 });
      expect(res.frameworkComparisons.length).toBe(4);
      expect(res.frameworkComparisons.find((f) => f.id === '50_30_20')).toBeDefined();
      expect(res.frameworkComparisons.find((f) => f.id === '60_20_20')).toBeDefined();
      expect(res.frameworkComparisons.find((f) => f.id === '70_20_10')).toBeDefined();
      expect(res.frameworkComparisons.find((f) => f.id === '40_20_40')).toBeDefined();
    });
  });

  // 7. Smart Ranked Recommendations
  describe('Smart Ranked Recommendations', () => {
    it('16. generates 3 ranked recommendations', () => {
      const res = calculate503020BudgetCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });
  });

  // 8. Hero Decision Verdict Text
  describe('Hero Decision Verdict Text', () => {
    it('17. formats hero text with percentages and 10-year wealth corpus', () => {
      const res = calculate503020BudgetCalculator();
      expect(res.heroText).toContain('Needs');
      expect(res.heroText).toContain('Wants');
      expect(res.heroText).toContain('Savings');
      expect(res.heroText).toContain('10-Year projected wealth');
    });
  });

  // 9. Demographic Presets Validation
  describe('Demographic Presets Validation', () => {
    it('18. validates young professional preset', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 40000,
        ruleFramework: '50_30_20',
        actualRent: 12000,
        actualGroceries: 4000,
        actualUtilities: 2000,
        actualInsurance: 1000,
        actualTransport: 1000,
        actualDining: 4000,
        actualEntertainment: 3000,
        actualShopping: 3000,
        actualVacation: 2000,
        actualInvestments: 6000,
        actualEmergencyFund: 2000,
      });

      expect(res.totalActualNeeds).toBe(20000);
      expect(res.totalActualWants).toBe(12000);
      expect(res.totalActualSavings).toBe(8000);
      expect(res.healthScore).toBe(100);
    });

    it('19. validates metro family preset', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 150000,
        ruleFramework: '60_20_20',
        actualRent: 45000,
        actualGroceries: 20000,
        actualUtilities: 10000,
        actualInsurance: 8000,
        actualTransport: 7000,
        actualDining: 12000,
        actualEntertainment: 8000,
        actualShopping: 6000,
        actualVacation: 4000,
        actualInvestments: 22000,
        actualEmergencyFund: 8000,
      });

      expect(res.totalActualNeeds).toBe(90000);
      expect(res.totalActualWants).toBe(30000);
      expect(res.totalActualSavings).toBe(30000);
      expect(res.healthScore).toBe(100);
    });

    it('20. validates dual income couple preset', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 250000,
        actualInvestments: 40000,
        actualEmergencyFund: 10000,
      });

      expect(res.totalActualSavings).toBe(50000);
      expect(res.actualSavingsPct).toBe(20);
    });

    it('21. validates aggressive FIRE saver preset', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 120000,
        ruleFramework: '40_20_40',
        actualInvestments: 40000,
        actualEmergencyFund: 8000,
      });

      expect(res.totalActualSavings).toBe(48000);
      expect(res.actualSavingsPct).toBe(40);
    });
  });

  // 10. Boundary Safeguards & Edge Cases
  describe('Boundary Safeguards & Edge Cases', () => {
    it('22. handles zero monthly income safely without throwing NaN', () => {
      const res = calculate503020BudgetCalculator({ monthlyIncome: 0 });
      expect(res.targetNeedsAmount).toBe(0);
      expect(res.actualNeedsPct).toBe(0);
      expect(res.tenYearActualCorpus).toBeDefined();
    });

    it('23. handles negative income by clamping to 0', () => {
      const res = calculate503020BudgetCalculator({ monthlyIncome: -50000 });
      expect(res.monthlyIncome).toBe(0);
    });

    it('24. handles negative expenses by clamping to 0', () => {
      const res = calculate503020BudgetCalculator({
        actualRent: -10000,
        actualDining: -5000,
        actualInvestments: -3000,
      });
      expect(res.totalActualNeeds).toBeGreaterThanOrEqual(0);
      expect(res.totalActualWants).toBeGreaterThanOrEqual(0);
      expect(res.totalActualSavings).toBeGreaterThanOrEqual(0);
    });

    it('25. handles negative return rate by clamping to 0', () => {
      const res = calculate503020BudgetCalculator({ expectedReturnRate: -10 });
      expect(res.expectedReturnRate).toBe(0);
    });

    it('26. handles return rate exceeding 30% by clamping to 30', () => {
      const res = calculate503020BudgetCalculator({ expectedReturnRate: 50 });
      expect(res.expectedReturnRate).toBe(30);
    });

    it('27. handles living beyond means (expenses > income)', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 50000,
        actualRent: 40000,
        actualDining: 20000,
        actualInvestments: 10000,
      });

      expect(res.unallocatedCash).toBeLessThan(0);
      expect(res.healthScore).toBeLessThan(60);
    });

    it('28. handles high income executive (₹10 Lakhs/mo)', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 1000000,
        actualInvestments: 200000,
      });

      expect(res.targetNeedsAmount).toBe(500000);
      expect(res.targetSavingsAmount).toBe(200000);
      expect(res.tenYearActualCorpus).toBeGreaterThan(45000000);
    });

    it('29. exports calculate503020BudgetTool alias identically', () => {
      const res1 = calculate503020BudgetCalculator({ monthlyIncome: 75000 });
      const res2 = calculate503020BudgetTool({ monthlyIncome: 75000 });
      expect(res1.targetNeedsAmount).toBe(res2.targetNeedsAmount);
      expect(res1.primaryOutput).toBe(res2.primaryOutput);
    });

    it('30. handles string numeric inputs cleanly', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: '120000',
        actualRent: '30000',
        actualDining: '15000',
      });
      expect(res.monthlyIncome).toBe(120000);
      expect(res.totalActualNeeds).toBeGreaterThanOrEqual(30000);
    });

    it('31. formats currency symbol cleanly', () => {
      const res = calculate503020BudgetCalculator({ currencySymbol: '$' });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
    });

    it('32. handles unknown ruleFramework by falling back to 50_30_20', () => {
      const res = calculate503020BudgetCalculator({ ruleFramework: 'unknown_rule' });
      expect(res.targetNeedsPct).toBe(50);
      expect(res.targetWantsPct).toBe(30);
      expect(res.targetSavingsPct).toBe(20);
    });

    it('33. verifies primaryOutput is totalActualSavings', () => {
      const res = calculate503020BudgetCalculator();
      expect(res.primaryOutput).toBe(res.totalActualSavings);
    });

    it('34. verifies framework comparisons match formula targets', () => {
      const res = calculate503020BudgetCalculator({ monthlyIncome: 100000 });
      const fw50 = res.frameworkComparisons.find((f) => f.id === '50_30_20');
      expect(fw50.needsAmount).toBe(50000);
      expect(fw50.wantsAmount).toBe(30000);
      expect(fw50.savingsAmount).toBe(20000);
    });

    it('35. validates custom rule percentages summing to 100%', () => {
      const res = calculate503020BudgetCalculator({
        ruleFramework: 'custom',
        customNeedsPct: 55,
        customWantsPct: 25,
        customSavingsPct: 20,
      });
      expect(res.targetNeedsPct + res.targetWantsPct + res.targetSavingsPct).toBe(100);
    });

    it('36. handles 20-year wealth projection accurately', () => {
      const res = calculate503020BudgetCalculator({
        actualInvestments: 25000,
        actualEmergencyFund: 0,
        expectedReturnRate: 12,
      });

      const twentyYr = res.wealthProjections.find((p) => p.years === 20);
      expect(twentyYr.actualCorpus).toBeGreaterThan(20000000); // 25k/mo @ 12% over 20 yrs > 2 Cr
    });

    it('37. handles 1-year short term projection', () => {
      const res = calculate503020BudgetCalculator({
        actualInvestments: 10000,
        actualEmergencyFund: 0,
      });
      const oneYr = res.wealthProjections.find((p) => p.years === 1);
      expect(oneYr.actualCorpus).toBeGreaterThan(120000);
    });

    it('38. checks that higher income scales target amounts linearly', () => {
      const res1 = calculate503020BudgetCalculator({ monthlyIncome: 100000 });
      const res2 = calculate503020BudgetCalculator({ monthlyIncome: 200000 });
      expect(res2.targetNeedsAmount).toBe(res1.targetNeedsAmount * 2);
      expect(res2.targetWantsAmount).toBe(res1.targetWantsAmount * 2);
      expect(res2.targetSavingsAmount).toBe(res1.targetSavingsAmount * 2);
    });

    it('39. checks that higher return rate increases 10-year corpus', () => {
      const res1 = calculate503020BudgetCalculator({ expectedReturnRate: 8 });
      const res2 = calculate503020BudgetCalculator({ expectedReturnRate: 14 });
      expect(res2.tenYearActualCorpus).toBeGreaterThan(res1.tenYearActualCorpus);
    });

    it('40. handles zero expenses across all categories', () => {
      const res = calculate503020BudgetCalculator({
        actualRent: 0,
        actualGroceries: 0,
        actualUtilities: 0,
        actualInsurance: 0,
        actualTransport: 0,
        actualDining: 0,
        actualEntertainment: 0,
        actualShopping: 0,
        actualVacation: 0,
        actualInvestments: 0,
        actualEmergencyFund: 0,
      });

      expect(res.totalActualExpenses).toBe(0);
      expect(res.unallocatedCash).toBe(res.monthlyIncome);
    });

    it('41. verifies health score grading levels', () => {
      const resOptimal = calculate503020BudgetCalculator();
      expect(resOptimal.healthGrade).toBe('Optimal Budget');
    });

    it('42. handles single category dominance (e.g. 90% rent)', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 100000,
        actualRent: 90000,
        actualGroceries: 0,
        actualUtilities: 0,
        actualInsurance: 0,
        actualTransport: 0,
      });
      expect(res.actualNeedsPct).toBe(90);
      expect(res.needsVariance).toBe(40000);
    });

    it('43. verifies default inputs when called with no arguments', () => {
      const res = calculate503020BudgetCalculator();
      expect(res.monthlyIncome).toBe(100000);
      expect(res.targetNeedsPct).toBe(50);
      expect(res.targetWantsPct).toBe(30);
      expect(res.targetSavingsPct).toBe(20);
    });

    it('44. checks that sum of actual expense percentages matches total', () => {
      const res = calculate503020BudgetCalculator({
        monthlyIncome: 100000,
        actualRent: 50000,
        actualGroceries: 0,
        actualUtilities: 0,
        actualInsurance: 0,
        actualTransport: 0,
        actualDining: 30000,
        actualEntertainment: 0,
        actualShopping: 0,
        actualVacation: 0,
        actualInvestments: 20000,
        actualEmergencyFund: 0,
      });
      expect(res.actualNeedsPct + res.actualWantsPct + res.actualSavingsPct).toBe(100);
    });

    it('45. handles fractional percentage inputs cleanly', () => {
      const res = calculate503020BudgetCalculator({
        ruleFramework: 'custom',
        customNeedsPct: 33.33,
        customWantsPct: 33.33,
        customSavingsPct: 33.34,
      });
      expect(res.targetNeedsAmount).toBe(33330);
    });
  });
});
