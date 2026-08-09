import { describe, it, expect } from 'vitest';
import { calculateSsyCalculator } from '../ssy-calculator.js';

describe('Flagship Sukanya Samriddhi Yojana (SSY) Math Engine', () => {
  it('1. calculates standard 21-year SSY maturity (Max ₹1.5L/year @ 8.2% p.a.)', () => {
    const result = calculateSsyCalculator({
      annualDeposit: 150000,
      girlChildAge: 1,
      rate: 8.2,
      allowEducationWithdrawal: false,
    });

    expect(result.totalDeposits).toBe(2250000); // ₹1.5L * 15 years = ₹22.5 Lakhs
    expect(result.totalInterest).toBeGreaterThan(4500000); // > ₹45 Lakhs interest
    expect(result.maturityValue).toBeGreaterThan(6500000); // ~₹69.3 Lakhs maturity
    expect(result.primaryOutput).toBe(result.maturityValue);
  });

  it('2. enforces 15-year contribution window limit', () => {
    const result = calculateSsyCalculator({
      annualDeposit: 100000,
      girlChildAge: 1,
      rate: 8.2,
    });

    expect(result.yearlyRows.length).toBe(21);
    expect(result.yearlyRows[14].depositPaid).toBe(100000); // Year 15 deposit paid
    expect(result.yearlyRows[15].depositPaid).toBe(0); // Year 16 zero deposit
    expect(result.yearlyRows[20].depositPaid).toBe(0); // Year 21 zero deposit
  });

  it('3. enforces statutory ₹1.5 Lakh Section 80C annual cap', () => {
    const result = calculateSsyCalculator({
      annualDeposit: 200000, // Input ₹2 Lakhs (exceeds ₹1.5L cap)
      rate: 8.2,
    });

    expect(result.isCapped).toBe(true);
    expect(result.annualDeposit).toBe(150000);
    expect(result.totalDeposits).toBe(2250000);
  });

  it('4. calculates 50% partial higher education withdrawal at age 18', () => {
    const withoutWithdrawal = calculateSsyCalculator({
      annualDeposit: 150000,
      girlChildAge: 1,
      rate: 8.2,
      allowEducationWithdrawal: false,
    });

    const withWithdrawal = calculateSsyCalculator({
      annualDeposit: 150000,
      girlChildAge: 1,
      rate: 8.2,
      allowEducationWithdrawal: true,
    });

    expect(withWithdrawal.educationWithdrawalAmount).toBeGreaterThan(0);
    expect(withWithdrawal.totalWithdrawal).toBe(withWithdrawal.educationWithdrawalAmount);
    expect(withWithdrawal.maturityValue).toBeLessThan(withoutWithdrawal.maturityValue);
  });

  it('5. calculates Section 80C EEE tax savings', () => {
    const result = calculateSsyCalculator({
      annualDeposit: 150000,
      marginalTaxRate: 30,
    });

    expect(result.annualSec80cTaxSaved).toBe(45000); // ₹150,000 * 30% = ₹45,000/yr
    expect(result.totalSec80cTaxSaved).toBe(675000); // ₹45,000 * 15 yrs = ₹6.75 Lakhs
  });

  it('6. calculates Guaranteed SSY vs Equity SIP comparison', () => {
    const result = calculateSsyCalculator({
      annualDeposit: 150000,
      rate: 8.2,
      expectedSipReturn: 12.0,
    });

    expect(result.sipFutureValue).toBeGreaterThan(result.maturityValue);
    expect(result.sipWealthDelta).toBe(result.sipFutureValue - result.maturityValue);
  });

  it('7. calculates minimum deposit scenario (₹250/year)', () => {
    const result = calculateSsyCalculator({
      annualDeposit: 250,
      rate: 8.2,
    });

    expect(result.totalDeposits).toBe(3750); // ₹250 * 15 years
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.maturityValue).toBeGreaterThan(3750);
  });

  it('8. computes reverse goal solver for ₹50 Lakhs target college fund', () => {
    const result = calculateSsyCalculator({
      annualDeposit: 150000,
      rate: 8.2,
    });

    expect(result.requiredAnnualDepositFor50L).toBeGreaterThan(0);
    expect(result.requiredAnnualDepositFor50L).toBeLessThanOrEqual(150000);
  });

  it('9. handles zero deposit edge case cleanly', () => {
    const result = calculateSsyCalculator({
      annualDeposit: 0,
      rate: 8.2,
    });

    expect(result.maturityValue).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(Number.isNaN(result.maturityValue)).toBe(false);
    expect(result.heroText).toContain('Please enter a valid annual deposit amount');
  });

  it('10. handles girl child age boundary (age 10 max eligibility)', () => {
    const result = calculateSsyCalculator({
      annualDeposit: 100000,
      girlChildAge: 10,
      rate: 8.2,
    });

    expect(result.girlChildAge).toBe(10);
    expect(result.yearlyRows[0].girlChildAge).toBe(10);
    expect(result.yearlyRows[20].girlChildAge).toBe(30);
  });
});
