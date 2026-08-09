import { describe, it, expect } from 'vitest';
import { calculateRdCalculator } from '../rd-calculator.js';

describe('Flagship Recurring Deposit (RD) Math Engine', () => {
  it('1. calculates standard 1-year RD with quarterly compounding (₹10,000/mo @ 7% p.a.)', () => {
    const result = calculateRdCalculator({
      monthlyInstallment: 10000,
      rate: 7.0,
      tenure: 1,
      tenureType: 'years',
      isSeniorCitizen: false,
    });

    expect(result.totalDeposits).toBe(120000); // ₹10,000 * 12 = ₹120,000
    expect(result.totalInterest).toBeGreaterThan(4500); // ~₹4,621 interest
    expect(result.maturityValue).toBe(124621);
    expect(result.primaryOutput).toBe(result.maturityValue);
  });

  it('2. applies Senior Citizen rate bonus (+0.50% p.a.)', () => {
    const regular = calculateRdCalculator({
      monthlyInstallment: 10000,
      rate: 7.0,
      tenure: 1,
      isSeniorCitizen: false,
    });

    const senior = calculateRdCalculator({
      monthlyInstallment: 10000,
      rate: 7.0,
      tenure: 1,
      isSeniorCitizen: true,
    });

    expect(senior.effectiveRate).toBe(7.50);
    expect(senior.totalInterest).toBeGreaterThan(regular.totalInterest);
    expect(senior.maturityValue).toBe(124957);
  });

  it('3. audits Section 194A TDS threshold (₹40,000 general cap)', () => {
    const belowCap = calculateRdCalculator({
      monthlyInstallment: 10000,
      rate: 7.0,
      tenure: 1,
      isSeniorCitizen: false,
      hasPan: true,
    });

    const aboveCap = calculateRdCalculator({
      monthlyInstallment: 50000,
      rate: 7.0,
      tenure: 3,
      isSeniorCitizen: false,
      hasPan: true,
    });

    expect(belowCap.isTdsApplicable).toBe(false);
    expect(belowCap.estimatedTdsAmount).toBe(0);

    expect(aboveCap.isTdsApplicable).toBe(true);
    expect(aboveCap.estimatedTdsAmount).toBeGreaterThan(0);
    expect(aboveCap.estimatedTdsAmount).toBe(Math.round(aboveCap.totalInterest * 0.10));
  });

  it('4. audits Section 194A Senior Citizen TDS threshold (₹50,000 cap)', () => {
    const seniorCap = calculateRdCalculator({
      monthlyInstallment: 50000,
      rate: 7.0,
      tenure: 3,
      isSeniorCitizen: true,
    });

    expect(seniorCap.tdsThreshold).toBe(50000);
  });

  it('5. enforces Section 206AA higher 20% TDS rate when PAN is not furnished', () => {
    const withPan = calculateRdCalculator({
      monthlyInstallment: 50000,
      rate: 7.0,
      tenure: 3,
      hasPan: true,
    });

    const noPan = calculateRdCalculator({
      monthlyInstallment: 50000,
      rate: 7.0,
      tenure: 3,
      hasPan: false,
    });

    expect(withPan.tdsRatePct).toBe(10);
    expect(noPan.tdsRatePct).toBe(20);
    expect(noPan.estimatedTdsAmount).toBe(Math.round(noPan.totalInterest * 0.20));
  });

  it('6. calculates Guaranteed RD vs Equity SIP comparison', () => {
    const result = calculateRdCalculator({
      monthlyInstallment: 10000,
      rate: 7.0,
      tenure: 3,
      expectedSipReturn: 12.0,
    });

    expect(result.sipFutureValue).toBeGreaterThan(result.maturityValue);
    expect(result.sipWealthDelta).toBe(result.sipFutureValue - result.maturityValue);
  });

  it('7. handles zero interest rate (0% p.a.)', () => {
    const result = calculateRdCalculator({
      monthlyInstallment: 10000,
      rate: 0,
      tenure: 1,
    });

    expect(result.maturityValue).toBe(120000);
    expect(result.totalInterest).toBe(0);
    expect(result.estimatedTdsAmount).toBe(0);
  });

  it('8. handles short tenure (6 months)', () => {
    const result = calculateRdCalculator({
      monthlyInstallment: 10000,
      rate: 7.0,
      tenure: 6,
      tenureType: 'months',
    });

    expect(result.totalDeposits).toBe(60000);
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.maturityValue).toBeGreaterThan(60000);
  });

  it('9. computes reverse goal solver for ₹10 Lakhs target corpus', () => {
    const result = calculateRdCalculator({
      monthlyInstallment: 10000,
      rate: 7.0,
      tenure: 3,
    });

    expect(result.requiredMonthlyInstallmentFor10L).toBeGreaterThan(0);
    expect(result.requiredMonthlyInstallmentFor10L).toBeLessThan(100000);
  });

  it('10. handles zero monthly installment edge case cleanly', () => {
    const result = calculateRdCalculator({
      monthlyInstallment: 0,
      rate: 7.0,
      tenure: 3,
    });

    expect(result.maturityValue).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(Number.isNaN(result.maturityValue)).toBe(false);
    expect(result.heroText).toContain('Please enter a valid monthly deposit amount');
  });
});
