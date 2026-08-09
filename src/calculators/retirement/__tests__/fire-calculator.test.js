import { describe, it, expect } from 'vitest';
import { calculateFire } from '../fire-calculator.js';

describe('Flagship FIRE Calculator Mathematical Accuracy Audit', () => {
  it('Reference Case 1: Standard FIRE (Age 30 to 45, ₹60k/mo expenses, ₹40k/mo savings, ₹10L corpus)', () => {
    const result = calculateFire({
      currentAge: 30,
      targetFireAge: 45,
      currentMonthlyExpenses: 60000,
      currentMonthlySavings: 40000,
      currentCorpus: 1000000,
      inflationRate: 6.0,
      expectedReturnRate: 12.0,
      swrPct: 4.0,
      fireVariant: 'standard',
    });

    expect(result.yearsToTarget).toBe(15);
    expect(result.currentAnnualExpenses).toBe(720000);
    expect(result.futureAnnualExpenses).toBe(1725522); // ₹7,20,000 * (1.06)^15
    expect(result.variants.standard).toBe(43138050); // ₹17,25,522 / 0.04
    expect(result.variants.lean).toBe(32353538); // 75% Lean FIRE
    expect(result.variants.fat).toBe(64707075); // 150% Fat FIRE
    expect(result.projectedCorpusAtTargetAge).toBeGreaterThan(20000000);
  });

  it('Reference Case 2: Coast FIRE Target Today (Age 30 to Coast Age 60)', () => {
    const result = calculateFire({
      currentAge: 30,
      targetFireAge: 45,
      coastRetirementAge: 60,
      currentMonthlyExpenses: 60000,
      currentMonthlySavings: 40000,
      currentCorpus: 1000000,
      inflationRate: 6.0,
      expectedReturnRate: 12.0,
      swrPct: 4.0,
      fireVariant: 'coast',
    });

    // At age 60 (30 years):
    // Expenses at 60 = 7,20,000 * (1.06)^30 = ₹41,35,322
    // Target Corpus at 60 = 41,35,322 / 0.04 = ₹10,33,83,050
    // Coast Target Today = 10,33,83,050 / (1.12)^30 = ₹34,50,713
    expect(result.yearsToCoastRetirement).toBe(30);
    expect(result.futureAnnualExpensesAtCoastAge).toBe(4135314);
    expect(result.targetCorpusAtCoastAge).toBe(103382850);
    expect(result.variants.coastToday).toBe(3450705);
  });

  it('Reference Case 3: Barista FIRE with Supplemental Side Income', () => {
    const result = calculateFire({
      currentAge: 30,
      targetFireAge: 45,
      currentMonthlyExpenses: 60000,
      baristaIncome: 25000, // ₹25,000/mo = ₹3,00,000/yr side income
      inflationRate: 6.0,
      swrPct: 4.0,
      fireVariant: 'barista',
    });

    // Future expenses at 45 = ₹17,25,522/yr
    // Net Barista expenses = ₹17,25,522 - ₹3,00,000 = ₹14,25,522
    // Target Barista Corpus = ₹14,25,522 / 0.04 = ₹3,56,38,050
    expect(result.variants.barista).toBe(35638050);
    expect(result.variants.barista).toBeLessThan(result.variants.standard);
  });

  it('verifies strict monotonicity of Safe Withdrawal Rate (SWR) matrix', () => {
    const result = calculateFire({
      currentAge: 30,
      targetFireAge: 45,
      currentMonthlyExpenses: 60000,
    });

    const [swr30, swr35, swr40, swr45] = result.swrMatrix;
    expect(swr30.targetCorpus).toBeGreaterThan(swr35.targetCorpus);
    expect(swr35.targetCorpus).toBeGreaterThan(swr40.targetCorpus);
    expect(swr40.targetCorpus).toBeGreaterThan(swr45.targetCorpus);
  });

  it('verifies inflation sensitivity (0%, 4%, 6%, 8%) on future expenses', () => {
    const fn = (inf) => calculateFire({ currentAge: 30, targetFireAge: 45, currentMonthlyExpenses: 50000, inflationRate: inf }).futureAnnualExpenses;
    
    expect(fn(0)).toBe(600000); // No inflation
    expect(fn(4)).toBeGreaterThan(fn(0));
    expect(fn(6)).toBeGreaterThan(fn(4));
    expect(fn(8)).toBeGreaterThan(fn(6));
  });

  it('verifies return sensitivity on projected corpus accumulation', () => {
    const fn = (ret) => calculateFire({ currentAge: 30, targetFireAge: 45, currentMonthlyExpenses: 50000, expectedReturnRate: ret }).projectedCorpusAtTargetAge;

    expect(fn(12)).toBeGreaterThan(fn(8));
    expect(fn(8)).toBeGreaterThan(fn(4));
  });

  it('handles unreachable target when current corpus & savings are zero', () => {
    const result = calculateFire({
      currentAge: 30,
      targetFireAge: 45,
      currentMonthlyExpenses: 50000,
      currentMonthlySavings: 0,
      currentCorpus: 0,
    });

    expect(result.fireStatus).toBe('not_reached_within_horizon');
    expect(result.projectedFireAge).toBeNull();
    expect(result.yearsToProjectedFireDecimal).toBeNull();
    expect(result.monthsToProjectedFire).toBeNull();
    expect(result.fireAchieved).toBe(false);
  });

  it('handles immediate FIRE status when current corpus already covers target', () => {
    const result = calculateFire({
      currentAge: 30,
      targetFireAge: 45,
      currentMonthlyExpenses: 50000,
      currentCorpus: 50000000, // ₹5 Crores corpus
    });

    expect(result.fireStatus).toBe('already_fire');
    expect(result.projectedFireAge).toBe(30);
    expect(result.yearsToProjectedFireDecimal).toBe(0);
    expect(result.fireAchieved).toBe(true);
  });
});