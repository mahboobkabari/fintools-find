import { describe, it, expect } from 'vitest';
import { calculateNscCalculator } from '../nsc-calculator.js';

describe('Flagship National Savings Certificate (NSC) Math Engine', () => {
  it('1. calculates standard ₹1.5 Lakh deposit @ 7.7% p.a. 5-year maturity', () => {
    const result = calculateNscCalculator({
      depositAmount: 150000,
      rate: 7.7,
    });

    expect(result.depositAmount).toBe(150000);
    expect(result.rate).toBe(7.7);
    expect(result.tenureYears).toBe(5);
    // ₹1,50,000 * (1.077)^5 = ₹217,355
    expect(result.maturityAmount).toBe(217355);
    expect(result.totalInterestEarned).toBe(67355);
    expect(result.primaryOutput).toBe(result.maturityAmount);
  });

  it('2. handles minimum statutory deposit (₹1,000)', () => {
    const result = calculateNscCalculator({
      depositAmount: 1000,
      rate: 7.7,
    });

    expect(result.depositAmount).toBe(1000);
    // ₹1,000 * (1.077)^5 = ₹1,449
    expect(result.maturityAmount).toBe(1449);
    expect(result.totalInterestEarned).toBe(449);
  });

  it('3. calculates Year 1 Section 80C initial tax deduction (capped at ₹1.5L)', () => {
    const result30 = calculateNscCalculator({
      depositAmount: 150000,
      marginalTaxRate: 30,
    });
    expect(result30.sec80cInitialEligible).toBe(150000);
    expect(result30.sec80cYear1Saved).toBe(45000); // ₹1.5L * 30% = ₹45,000

    const resultHigh = calculateNscCalculator({
      depositAmount: 500000, // ₹5 Lakhs deposit
      marginalTaxRate: 30,
    });
    expect(resultHigh.sec80cInitialEligible).toBe(150000); // Capped at ₹1.5L
    expect(resultHigh.sec80cYear1Saved).toBe(45000);
  });

  it('4. computes 5-year year-by-year accrual schedule precision', () => {
    const result = calculateNscCalculator({
      depositAmount: 100000,
      rate: 7.7,
    });

    expect(result.yearlyRows.length).toBe(5);
    expect(result.yearlyRows[0].year).toBe(1);
    expect(result.yearlyRows[0].openingBalance).toBe(100000);
    expect(result.yearlyRows[0].closingBalance).toBe(107700);
    expect(result.yearlyRows[0].accruedInterest).toBe(7700);

    expect(result.yearlyRows[4].year).toBe(5);
    expect(result.yearlyRows[4].closingBalance).toBe(144903);
  });

  it('5. audits Section 80C deemed interest reinvestment for Years 1 to 4', () => {
    const result = calculateNscCalculator({
      depositAmount: 150000,
      rate: 7.7,
      marginalTaxRate: 30,
    });

    // Years 1 to 4 interest is deemed reinvested and eligible for Sec 80C
    expect(result.yearlyRows[0].isDeemed80cEligible).toBe(true);
    expect(result.yearlyRows[1].isDeemed80cEligible).toBe(true);
    expect(result.yearlyRows[2].isDeemed80cEligible).toBe(true);
    expect(result.yearlyRows[3].isDeemed80cEligible).toBe(true);

    expect(result.totalDeemed80cInterest).toBe(51815); // Sum of accrued interest Y1-Y4
  });

  it('6. audits Year 5 maturity-year taxable interest (non-reinvested)', () => {
    const result = calculateNscCalculator({
      depositAmount: 150000,
      rate: 7.7,
      marginalTaxRate: 30,
    });

    expect(result.yearlyRows[4].isDeemed80cEligible).toBe(false);
    expect(result.yearlyRows[4].sec80cTaxSavedOnInterest).toBe(0);
    expect(result.year5TaxableInterest).toBe(15540); // Year 5 interest = ₹15,540
    expect(result.year5TaxPayable).toBe(4662); // ₹15,540 * 30% = ₹4,662
  });

  it('7. calculates higher investment scenario (₹5 Lakhs deposit)', () => {
    const result = calculateNscCalculator({
      depositAmount: 500000,
      rate: 7.7,
    });

    // ₹500,000 * (1.077)^5 = ₹724,517
    expect(result.maturityAmount).toBe(724517);
    expect(result.totalInterestEarned).toBe(224517);
  });

  it('8. calculates Guaranteed NSC vs 5-Year Bank Tax Saver FD comparison', () => {
    const result = calculateNscCalculator({
      depositAmount: 150000,
      rate: 7.7, // NSC 7.7%
      expectedFdRate: 7.25, // Bank FD 7.25%
    });

    expect(result.maturityAmount).toBe(217355);
    expect(result.fdMaturity).toBe(212852);
    expect(result.nscInterestDelta).toBe(4503); // NSC yields ₹4,503 extra interest
  });

  it('9. computes 5-year inflation-adjusted real purchasing power maturity value', () => {
    const result = calculateNscCalculator({
      depositAmount: 150000,
      rate: 7.7,
      inflationRate: 5.0,
    });

    // ₹217,355 / (1.05)^5 = ₹170,303
    expect(result.purchasingPowerMaturity).toBe(170303);
  });

  it('10. handles zero deposit edge case cleanly', () => {
    const result = calculateNscCalculator({
      depositAmount: 0,
      rate: 7.7,
    });

    expect(result.depositAmount).toBe(0);
    expect(result.maturityAmount).toBe(0);
    expect(result.totalInterestEarned).toBe(0);
    expect(Number.isNaN(result.maturityAmount)).toBe(false);
    expect(result.heroText).toContain('Please enter a valid investment deposit amount');
  });

  it('11. handles negative deposit input sanitization', () => {
    const result = calculateNscCalculator({
      depositAmount: -50000,
      rate: 7.7,
    });

    expect(result.depositAmount).toBe(0);
    expect(result.maturityAmount).toBe(0);
  });

  it('12. handles custom historical interest rate overrides', () => {
    const historical = calculateNscCalculator({
      depositAmount: 100000,
      rate: 6.8, // Historical Q4 FY21 NSC rate
    });

    // ₹100,000 * (1.068)^5 = ₹138,949
    expect(historical.maturityAmount).toBe(138949);
  });

  it('13. computes scenario matrix comparison outputs', () => {
    const result = calculateNscCalculator({
      depositAmount: 150000,
      rate: 7.7,
    });

    expect(result.scenarios.length).toBe(4);
    expect(result.scenarios[0].deposit).toBe(150000);
    expect(result.scenarios[1].deposit).toBe(150000);
    expect(result.scenarios[2].deposit).toBe(100000);
    expect(result.scenarios[3].deposit).toBe(500000);
  });

  it('14. handles USD currency mode formatting', () => {
    const result = calculateNscCalculator({
      depositAmount: 10000,
      rate: 7.7,
      currency: 'USD',
    });

    expect(result.currency).toBe('USD');
    expect(result.heroText).toContain('$10,000');
  });

  it('15. verifies rounding consistency between maturity and yearly schedule', () => {
    const result = calculateNscCalculator({
      depositAmount: 123456,
      rate: 7.7,
    });

    const lastScheduleRow = result.yearlyRows[4];
    expect(lastScheduleRow.closingBalance).toBe(result.maturityAmount);
    expect(Number.isInteger(result.maturityAmount)).toBe(true);
    expect(Number.isInteger(result.totalInterestEarned)).toBe(true);
  });
});
