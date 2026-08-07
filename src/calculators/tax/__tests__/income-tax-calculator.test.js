import { describe, it, expect } from 'vitest';
import { calculateIncomeTax } from '../income-tax-calculator.js';

describe('Institutional Income Tax Calculator Engine (FY 2025-26)', () => {
  it('calculates accurate tax under New Regime for ₹12 Lakhs salary', () => {
    const result = calculateIncomeTax({
      grossIncome: 1200000,
      standardDeductionNew: 75000,
    });

    expect(result.grossIncome).toBe(1200000);
    expect(result.newRegime.taxableIncome).toBe(1125000);
    // Slabs: 3L-7L (20K) + 7L-10L (30K) + 10L-11.25L (18,750) = 68,750
    expect(result.newRegime.baseTax).toBe(68750);
    expect(result.newRegime.cess).toBe(2750);
    expect(result.newRegime.totalTax).toBe(71500);
    expect(result.newRegime.netTakeHome).toBe(1128500);
  });

  it('applies Section 87A rebate for income <= ₹7 Lakhs resulting in zero tax under New Regime', () => {
    const result = calculateIncomeTax({
      grossIncome: 700000,
      standardDeductionNew: 75000,
    });

    expect(result.newRegime.taxableIncome).toBe(625000);
    expect(result.newRegime.totalTax).toBe(0);
  });

  it('correctly recommends Old Regime when deductions exceed threshold for ₹15L salary', () => {
    const result = calculateIncomeTax({
      grossIncome: 1500000,
      sec80c: 150000,
      sec24b: 200000,
      sec80d: 25000,
      nps80ccd: 50000,
    });

    expect(result.oldRegime.totalDeductions).toBe(475000);
    expect(result.heroDecision.recommendedRegime).toBe('old');
    expect(result.heroDecision.isNewBetter).toBe(false);
    expect(result.heroDecision.taxSavingsAmount).toBeGreaterThan(0);
  });

  it('computes Tax Optimization Score and marginal tax increment (+1L)', () => {
    const result = calculateIncomeTax({
      grossIncome: 1200000,
      sec80c: 0,
    });

    expect(result.taxScore.score).toBeGreaterThanOrEqual(20);
    expect(result.marginal.incrementalTaxOn1L).toBeGreaterThan(0);
    expect(result.opportunities.length).toBeGreaterThan(0);
  });
});