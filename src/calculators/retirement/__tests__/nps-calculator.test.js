import { describe, it, expect } from 'vitest';
import { calculateNps } from '../nps-calculator.js';
import { calculateNpsTaxSavings, calculateNpsAssetReturn } from '../../core/npsUtils.js';

describe('Flagship NPS Calculator Engine Verification', () => {
  it('Reference Case 1: Verifies Tier 1 Employee contribution u/s 80CCD(1B) under Old Tax Regime', () => {
    const result = calculateNps({
      currentAge: 30,
      planningRetirementAge: 60,
      monthlyContribution: 5000,
      currentCorpus: 100000,
      expectedReturnRate: 10.0,
      annuityPurchasePct: 40,
      annuityRatePct: 6.0,
      taxRegime: 'old',
      marginalTaxRatePct: 30,
    });

    expect(result.yearsToRetirement).toBe(30);
    expect(result.totalAccumulatedCorpus).toBeGreaterThan(11000000); // > ₹1.1 Crores
    expect(result.lumpSumPct).toBe(60);
    expect(result.annuityPurchasePct).toBe(40);

    // Lump-Sum (60%) + Annuity (40%) sum up to total corpus
    expect(result.lumpSumAmount + result.annuityAmount).toBe(result.totalAccumulatedCorpus);
    expect(result.monthlyPension).toBeGreaterThan(20000);

    // Tax savings u/s 80CCD(1B) on ₹50,000 @ 30% + 4% cess = ₹15,600
    expect(result.taxSavings.eligible80CCD1B).toBe(50000);
    expect(result.taxSavings.annualTaxSaved).toBe(15600);
  });

  it('Reference Case 2: Verifies Employer contribution u/s 80CCD(2) under New Tax Regime', () => {
    const taxSavings = calculateNpsTaxSavings({
      taxRegime: 'new',
      marginalTaxRatePct: 30,
      annualSelfContribution: 50000,
      annualEmployerContribution: 140000, // 14% of ₹10L Basic
      basicSalary: 1000000,
    });

    // Sec 80CCD(1B) is 0 under New Regime
    expect(taxSavings.eligible80CCD1B).toBe(0);
    // Sec 80CCD(2) is eligible up to 14% of Basic Salary (₹1,40,000)
    expect(taxSavings.eligible80CCD2).toBe(140000);
    // Tax saved = ₹1,40,000 * 30% * 1.04 = ₹43,680
    expect(taxSavings.annualTaxSaved).toBe(43680);
  });

  it('verifies 100% lump-sum exemption for small corpus <= ₹5 Lakhs', () => {
    const result = calculateNps({
      currentAge: 58,
      planningRetirementAge: 60,
      monthlyContribution: 2000,
      currentCorpus: 50000,
      annuityPurchasePct: 40,
    });

    expect(result.totalAccumulatedCorpus).toBeLessThanOrEqual(500000);
    expect(result.isSmallCorpusLumpSum).toBe(true);
    expect(result.annuityPurchasePct).toBe(0);
    expect(result.lumpSumPct).toBe(100);
    expect(result.lumpSumAmount).toBe(result.totalAccumulatedCorpus);
    expect(result.annuityAmount).toBe(0);
    expect(result.monthlyPension).toBe(0);
  });

  it('verifies Active Choice weighted return calculation across Equity, Corporate Debt, and Govt Bonds', () => {
    // 50% Equity @ 12%, 30% Corporate @ 9%, 20% Govt @ 7.5%
    // Weighted = 0.5*12 + 0.3*9 + 0.2*7.5 = 6.0 + 2.7 + 1.5 = 10.2%
    const rate = calculateNpsAssetReturn(
      { e: 50, c: 30, g: 20, a: 0 },
      { e: 12.0, c: 9.0, g: 7.5, a: 10.0 }
    );
    expect(rate).toBe(10.2);
  });

  it('handles zero monthly contribution and zero current corpus edge case cleanly', () => {
    const result = calculateNps({
      currentAge: 30,
      planningRetirementAge: 60,
      monthlyContribution: 0,
      currentCorpus: 0,
    });

    expect(result.totalAccumulatedCorpus).toBe(0);
    expect(result.lumpSumAmount).toBe(0);
    expect(result.annuityAmount).toBe(0);
    expect(result.monthlyPension).toBe(0);
  });
});