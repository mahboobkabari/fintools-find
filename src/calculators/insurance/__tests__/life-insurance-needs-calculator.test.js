import { describe, it, expect } from 'vitest';
import {
  calculateLifeInsuranceNeeds,
  calculateDebtNeeds,
  calculateIncomeReplacementNeed,
  calculateFutureGoalNeeds,
  calculateExistingResources,
} from '../life-insurance-needs-calculator.js';
import { LIFE_INSURANCE_NEEDS_CONFIG } from '../../configs/life-insurance-needs-calculator.config.js';

describe('Term Life Insurance Needs Financial Engine', () => {

  // 1. Basic Debt Need
  it('calculates debt needs correctly for mortgage, debts, and final expenses', () => {
    const res = calculateDebtNeeds({
      mortgageBalance: 3000000,
      otherDebts: 200000,
      finalExpenses: 150000,
    });
    expect(res).toBe(3350000);
  });

  // 2. Mortgage Need
  it('calculates standalone mortgage need accurately', () => {
    const res = calculateDebtNeeds({ mortgageBalance: 5000000 });
    expect(res).toBe(5000000);
  });

  // 3. Multiple Debts Aggregation
  it('aggregates multiple debt obligations cleanly', () => {
    const res = calculateDebtNeeds({
      mortgageBalance: 4000000,
      otherDebts: 500000,
      finalExpenses: 200000,
    });
    expect(res).toBe(4700000);
  });

  // 4. Income Replacement
  it('calculates inflation-adjusted present value of income replacement', () => {
    const pv = calculateIncomeReplacementNeed({
      annualIncome: 1000000,
      replacementPeriodYears: 10,
      annualIncomeGrowthRate: 0.05,
      discountRate: 0.06,
    });
    expect(pv).toBeGreaterThan(9000000);
    expect(pv).toBeLessThan(11000000);
  });

  // 5. Future Education Goal
  it('calculates future education and milestone goal needs', () => {
    const res = calculateFutureGoalNeeds({
      educationGoals: 2500000,
      otherFutureGoals: 1000000,
    });
    expect(res).toBe(3500000);
  });

  // 6. Final Expenses Handling
  it('handles final expenses correctly in total debt calculation', () => {
    const res = calculateDebtNeeds({ finalExpenses: 200000 });
    expect(res).toBe(200000);
  });

  // 7. Existing Life Insurance Offset
  it('offsets gross coverage need by existing life insurance policies', () => {
    const res = calculateLifeInsuranceNeeds({
      annualIncome: 1000000,
      replacementPeriodYears: 10,
      existingLifeInsurance: 5000000,
    });
    expect(res.totalExistingResources).toBeGreaterThanOrEqual(5000000);
    expect(res.estimatedAdditionalCoverage).toBe(res.totalGrossNeed - 5000000);
  });

  // 8. Savings Offset
  it('offsets gross coverage need by liquid bank savings and cash', () => {
    const res = calculateLifeInsuranceNeeds({
      mortgageBalance: 2000000,
      savingsAndCash: 500000,
    });
    expect(res.totalExistingResources).toBe(500000);
    expect(res.estimatedAdditionalCoverage).toBe(1700000); // (2M + 200k final) - 500k
  });

  // 9. Multiple Existing Resources Aggregation
  it('aggregates insurance, savings, and investments as existing resource credits', () => {
    const res = calculateExistingResources({
      existingLifeInsurance: 3000000,
      savingsAndCash: 500000,
      investments: 1500000,
      otherResources: 200000,
    });
    expect(res).toBe(5200000);
  });

  // 10. Positive Additional Coverage Result
  it('calculates positive net estimated additional coverage when needs exceed resources', () => {
    const res = calculateLifeInsuranceNeeds({
      mortgageBalance: 5000000,
      existingLifeInsurance: 2000000,
    });
    expect(res.estimatedAdditionalCoverage).toBeGreaterThan(3000000);
    expect(res.isFullyCovered).toBe(false);
  });

  // 11. Existing Resources Greater Than Total Needs (Zero Negative Coverage Safety)
  it('returns estimatedAdditionalCoverage = 0 (NOT a negative number) when resources exceed needs', () => {
    const res = calculateLifeInsuranceNeeds({
      mortgageBalance: 1000000,
      existingLifeInsurance: 10000000,
      savingsAndCash: 2000000,
    });
    expect(res.estimatedAdditionalCoverage).toBe(0);
    expect(res.isFullyCovered).toBe(true);
    expect(res.grossCoverageGap).toBeLessThan(0);
  });

  // 12. Zero Additional Coverage Verification
  it('verifies zero additional coverage state cleanly', () => {
    const res = calculateLifeInsuranceNeeds({
      annualIncome: 500000,
      replacementPeriodYears: 5,
      existingLifeInsurance: 20000000,
    });
    expect(res.estimatedAdditionalCoverage).toBe(0);
    expect(res.isFullyCovered).toBe(true);
  });

  // 13. Zero Income Handling
  it('handles zero annual income without runtime crashes or division-by-zero', () => {
    const res = calculateLifeInsuranceNeeds({
      annualIncome: 0,
      replacementPeriodYears: 10,
      mortgageBalance: 2000000,
    });
    expect(res.incomeReplacementNeed).toBe(0);
    expect(res.debtNeeds).toBe(2200000); // 2M mortgage + 200k final
    expect(res.totalGrossNeed).toBe(2200000);
  });

  // 14. Zero Replacement Period Handling
  it('handles zero replacement period cleanly', () => {
    const res = calculateLifeInsuranceNeeds({
      annualIncome: 1500000,
      replacementPeriodYears: 0,
    });
    expect(res.incomeReplacementNeed).toBe(0);
  });

  // 15. Zero Debts Handling
  it('handles zero debts and zero mortgage correctly', () => {
    const res = calculateLifeInsuranceNeeds({
      annualIncome: 1000000,
      replacementPeriodYears: 10,
      mortgageBalance: 0,
      otherDebts: 0,
      finalExpenses: 0,
    });
    expect(res.debtNeeds).toBe(0);
    expect(res.totalGrossNeed).toBe(res.incomeReplacementNeed);
  });

  // 16. Negative Input Validation Sanitization
  it('sanitizes negative input values to zero or valid defaults', () => {
    const res = calculateLifeInsuranceNeeds({
      annualIncome: -500000,
      mortgageBalance: -2000000,
      savingsAndCash: -100000,
    });
    expect(res.annualIncome).toBe(0);
    expect(res.breakdown.mortgage).toBe(0);
    expect(res.breakdown.savings).toBe(0);
    expect(res.estimatedAdditionalCoverage).toBeGreaterThanOrEqual(0);
  });

  // 17. Large Values (Enterprise HLV Portfolio)
  it('handles large HLV figures (e.g. ₹10 Crores income & ₹5 Crores mortgage) cleanly', () => {
    const res = calculateLifeInsuranceNeeds({
      annualIncome: 10000000,
      replacementPeriodYears: 20,
      mortgageBalance: 50000000,
      existingLifeInsurance: 20000000,
    });
    expect(res.totalGrossNeed).toBeGreaterThan(100000000); // 10 Crores+
    expect(res.estimatedAdditionalCoverage).toBeGreaterThan(80000000);
  });

  // 18. Income Growth Scenario Testing
  it('calculates higher income replacement PV when annual income growth rate is higher', () => {
    const lowGrowth = calculateLifeInsuranceNeeds({ annualIncome: 1000000, replacementPeriodYears: 15, annualIncomeGrowthRate: 0.02 });
    const highGrowth = calculateLifeInsuranceNeeds({ annualIncome: 1000000, replacementPeriodYears: 15, annualIncomeGrowthRate: 0.08 });

    expect(highGrowth.incomeReplacementNeed).toBeGreaterThan(lowGrowth.incomeReplacementNeed);
  });

  // 19. Preset Calculations Integration
  it('integrates cleanly with default scenario presets', () => {
    const preset = LIFE_INSURANCE_NEEDS_CONFIG.scenarios.youngFamily;
    const res = calculateLifeInsuranceNeeds(preset);

    expect(res.totalGrossNeed).toBeGreaterThan(20000000); // 2 Crores+
    expect(res.totalExistingResources).toBeGreaterThan(5000000);
    expect(res.estimatedAdditionalCoverage).toBeGreaterThan(10000000);
  });

  // 20. Combined DIME Needs Analysis Completeness
  it('computes complete DIME breakdown (Debt, Income, Mortgage, Education, Existing)', () => {
    const res = calculateLifeInsuranceNeeds({
      mortgageBalance: 4000000,
      otherDebts: 500000,
      annualIncome: 1200000,
      replacementPeriodYears: 15,
      educationGoals: 2000000,
      existingLifeInsurance: 5000000,
    });

    expect(res.debtNeeds).toBe(4700000);
    expect(res.futureGoalNeeds).toBe(2000000);
    expect(res.totalExistingResources).toBe(5000000);
    expect(res.estimatedAdditionalCoverage).toBe(res.totalGrossNeed - 5000000);
  });

  // 21. Input Sanitization (Strings & NaN)
  it('sanitizes string numbers and non-numeric NaN values safely', () => {
    const res = calculateLifeInsuranceNeeds({
      annualIncome: '1200000',
      replacementPeriodYears: '15',
      mortgageBalance: NaN,
    });

    expect(res.annualIncome).toBe(1200000);
    expect(res.replacementPeriodYears).toBe(15);
    expect(res.breakdown.mortgage).toBe(0);
  });

  // 22. Boundary Age Values
  it('clamps age to valid bounds (18 to 75)', () => {
    const young = calculateLifeInsuranceNeeds({ age: 10 });
    const old = calculateLifeInsuranceNeeds({ age: 90 });

    expect(young.age).toBe(18);
    expect(old.age).toBe(75);
  });

  // 23. Projection Edge Cases (Discount Rate Sensitivity)
  it('computes lower income PV when discount rate is higher', () => {
    const lowDiscount = calculateLifeInsuranceNeeds({ annualIncome: 1000000, replacementPeriodYears: 10, discountRate: 0.04 });
    const highDiscount = calculateLifeInsuranceNeeds({ annualIncome: 1000000, replacementPeriodYears: 10, discountRate: 0.10 });

    expect(lowDiscount.incomeReplacementNeed).toBeGreaterThan(highDiscount.incomeReplacementNeed);
  });

  // 24. Regression Scenarios
  it('handles empty options object without throwing exceptions', () => {
    const res = calculateLifeInsuranceNeeds();

    expect(res.age).toBe(30);
    expect(res.estimatedAdditionalCoverage).toBe(200000); // 200k final expenses default
  });
});
