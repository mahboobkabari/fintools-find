import { describe, it, expect } from 'vitest';
import { calculatePpfCalculator } from '../ppf-calculator.js';

describe('Flagship Public Provident Fund (PPF) Math Engine', () => {
  it('1. calculates standard 15-year statutory PPF maturity (₹1.5 Lakhs/yr @ 7.1% p.a.)', () => {
    const result = calculatePpfCalculator({
      annualDeposit: 150000,
      depositFrequency: 'yearly',
      depositDay: 'before_5th',
      interestRate: 7.1,
      tenureYears: 15,
    });

    expect(result.totalDeposits).toBe(2250000); // 15 * ₹150,000 = ₹22,50,000
    expect(result.totalInterestEarned).toBeGreaterThan(1800000);
    expect(result.finalBalance).toBeGreaterThan(4000000); // > ₹40 Lakhs
    expect(result.primaryOutput).toBe(result.finalBalance);
    expect(result.yearlyRows.length).toBe(15);
  });

  it('2. validates monthly deposit timing before 5th vs after 5th of the month', () => {
    const before5th = calculatePpfCalculator({
      annualDeposit: 150000,
      depositFrequency: 'monthly',
      depositDay: 'before_5th',
      interestRate: 7.1,
      tenureYears: 15,
    });

    const after5th = calculatePpfCalculator({
      annualDeposit: 150000,
      depositFrequency: 'monthly',
      depositDay: 'after_5th',
      interestRate: 7.1,
      tenureYears: 15,
    });

    expect(before5th.totalInterestEarned).toBeGreaterThan(after5th.totalInterestEarned);
    expect(before5th.timingInterestDiff).toBeGreaterThan(0);
    expect(after5th.timingLossIfLate).toBeGreaterThan(0);
  });

  it('3. enforces statutory ₹1.5 Lakh annual contribution cap', () => {
    const overflow = calculatePpfCalculator({
      annualDeposit: 250000, // Exceeds ₹1.5L cap
      interestRate: 7.1,
      tenureYears: 15,
    });

    expect(overflow.isCapExceeded).toBe(true);
    expect(overflow.annualDeposit).toBe(150000); // Capped at ₹150,000
    expect(overflow.totalDeposits).toBe(2250000);
  });

  it('4. models 5-year extension block with continued contributions (20 Years total)', () => {
    const result20y = calculatePpfCalculator({
      annualDeposit: 150000,
      interestRate: 7.1,
      tenureYears: 20,
      extensionMode: 'with_contribution',
    });

    expect(result20y.totalDeposits).toBe(3000000); // 20 * ₹150,000 = ₹30,000,00
    expect(result20y.finalBalance).toBeGreaterThan(6500000); // > ₹65 Lakhs
    expect(result20y.yearlyRows.length).toBe(20);
    expect(result20y.yearlyRows[16].isExtension).toBe(true);
  });

  it('5. models 5-year extension block WITHOUT fresh contributions (20 Years total)', () => {
    const noContribExt = calculatePpfCalculator({
      annualDeposit: 150000,
      interestRate: 7.1,
      tenureYears: 20,
      extensionMode: 'without_contribution',
    });

    expect(noContribExt.totalDeposits).toBe(2250000); // Capped at 15 years deposits
    expect(noContribExt.contributionYearsCount).toBe(15);
    expect(noContribExt.finalBalance).toBeGreaterThan(5500000);
  });

  it('6. computes Section 80C tax savings accurately', () => {
    const result = calculatePpfCalculator({
      annualDeposit: 150000,
      tenureYears: 15,
      marginalTaxRate: 30,
    });

    expect(result.annualSec80cTaxSaved).toBe(45000); // 30% of ₹1.5L = ₹45,000
    expect(result.totalSec80cTaxSaved).toBe(45000 * 15); // ₹6,75,000 total tax saved
    expect(result.isEeeTaxExempt).toBe(true);
  });

  it('7. computes inflation-adjusted purchasing power', () => {
    const result = calculatePpfCalculator({
      annualDeposit: 150000,
      tenureYears: 15,
      inflationRate: 5.0,
    });

    expect(result.purchasingPower).toBeLessThan(result.finalBalance);
    expect(result.purchasingPower).toBeGreaterThan(1000000);
  });

  it('8. computes reverse solver for ₹1 Crore target corpus', () => {
    const result = calculatePpfCalculator({
      annualDeposit: 150000,
      tenureYears: 15,
    });

    expect(result.requiredAnnualDepositFor1Cr).toBe(150000); // Capped at statutory max ₹1.5L
  });

  it('9. handles zero contribution edge case cleanly', () => {
    const zeroResult = calculatePpfCalculator({
      annualDeposit: 0,
    });

    expect(zeroResult.finalBalance).toBe(0);
    expect(zeroResult.totalDeposits).toBe(0);
    expect(Number.isNaN(zeroResult.finalBalance)).toBe(false);
    expect(zeroResult.heroText).toContain('Please enter a valid deposit amount');
  });

  it('10. handles minimum annual deposit threshold (₹500 min)', () => {
    const minResult = calculatePpfCalculator({
      annualDeposit: 300, // Below ₹500
    });

    expect(minResult.isBelowMin).toBe(true);
    expect(minResult.finalBalance).toBeGreaterThan(0);
  });
});
