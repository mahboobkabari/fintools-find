import { describe, it, expect } from 'vitest';
import { calculateFdCalculator } from '../fd-calculator.js';

describe('Flagship Fixed Deposit (FD) Math Engine', () => {
  it('1. calculates standard 1-year cumulative FD with quarterly compounding (₹1 Lakh @ 7% p.a.)', () => {
    const result = calculateFdCalculator({
      amount: 100000,
      rate: 7.0,
      tenure: 1,
      tenureType: 'years',
      payoutType: 'cumulative',
      isSeniorCitizen: false,
    });

    expect(result.principal).toBe(100000);
    expect(result.effectiveRate).toBe(7.0);
    expect(result.maturityValue).toBe(107186); // ₹100,000 * (1 + 0.07/4)^4 = ₹107,185.90 -> ₹107,186
    expect(result.totalInterest).toBe(7186);
  });

  it('2. calculates monthly payout mode (simple interest payout)', () => {
    const result = calculateFdCalculator({
      amount: 1200000,
      rate: 8.0,
      tenure: 1,
      tenureType: 'years',
      payoutType: 'monthly',
      isSeniorCitizen: false,
    });

    expect(result.periodicPayout).toBe(8000); // ₹12L * 8% / 12 = ₹8,000/mo
    expect(result.totalInterest).toBe(96000); // ₹8,000 * 12 = ₹96,000
    expect(result.maturityValue).toBe(1200000); // Principal returned at maturity
  });

  it('3. calculates quarterly payout mode (simple interest payout)', () => {
    const result = calculateFdCalculator({
      amount: 400000,
      rate: 7.5,
      tenure: 2,
      tenureType: 'years',
      payoutType: 'quarterly',
      isSeniorCitizen: false,
    });

    expect(result.periodicPayout).toBe(7500); // ₹4L * 7.5% / 4 = ₹7,500/quarter
    expect(result.totalInterest).toBe(60000); // ₹7,500 * 8 quarters = ₹60,000
    expect(result.maturityValue).toBe(400000);
  });

  it('4. applies Senior Citizen bonus (+0.50% rate bonus)', () => {
    const regular = calculateFdCalculator({
      amount: 100000,
      rate: 7.0,
      tenure: 1,
      isSeniorCitizen: false,
    });

    const senior = calculateFdCalculator({
      amount: 100000,
      rate: 7.0,
      tenure: 1,
      isSeniorCitizen: true,
    });

    expect(senior.effectiveRate).toBe(7.50);
    expect(senior.totalInterest).toBeGreaterThan(regular.totalInterest);
    expect(senior.maturityValue).toBe(107714);
  });

  it('5. audits Section 194A TDS threshold (₹40,000 general cap)', () => {
    const belowCap = calculateFdCalculator({
      amount: 200000,
      rate: 7.0,
      tenure: 1,
      isSeniorCitizen: false,
      hasPan: true,
    });

    const aboveCap = calculateFdCalculator({
      amount: 800000,
      rate: 7.0,
      tenure: 1,
      isSeniorCitizen: false,
      hasPan: true,
    });

    expect(belowCap.isTdsApplicable).toBe(false);
    expect(belowCap.estimatedTdsAmount).toBe(0);

    expect(aboveCap.isTdsApplicable).toBe(true);
    expect(aboveCap.estimatedTdsAmount).toBeGreaterThan(0);
    expect(aboveCap.estimatedTdsAmount).toBe(Math.round(aboveCap.totalInterest * 0.10));
  });

  it('6. audits Section 194A Senior Citizen TDS threshold (₹50,000 cap)', () => {
    const seniorAtCap = calculateFdCalculator({
      amount: 600000,
      rate: 7.0,
      tenure: 1,
      isSeniorCitizen: true,
    });

    expect(seniorAtCap.tdsThreshold).toBe(50000);
  });

  it('7. enforces Section 206AA higher 20% TDS rate when PAN is not furnished', () => {
    const withPan = calculateFdCalculator({
      amount: 800000,
      rate: 7.0,
      tenure: 1,
      hasPan: true,
    });

    const noPan = calculateFdCalculator({
      amount: 800000,
      rate: 7.0,
      tenure: 1,
      hasPan: false,
    });

    expect(withPan.tdsRatePct).toBe(10);
    expect(noPan.tdsRatePct).toBe(20);
    expect(noPan.estimatedTdsAmount).toBe(Math.round(noPan.totalInterest * 0.20));
  });

  it('8. handles zero interest rate (0% p.a.)', () => {
    const result = calculateFdCalculator({
      amount: 100000,
      rate: 0,
      tenure: 3,
    });

    expect(result.maturityValue).toBe(100000);
    expect(result.totalInterest).toBe(0);
    expect(result.estimatedTdsAmount).toBe(0);
  });

  it('9. handles short tenure (30 days)', () => {
    const result = calculateFdCalculator({
      amount: 100000,
      rate: 6.0,
      tenure: 30,
      tenureType: 'days',
    });

    expect(result.maturityValue).toBeGreaterThan(100000);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  it('10. handles zero deposit amount cleanly without NaN or Infinity', () => {
    const result = calculateFdCalculator({
      amount: 0,
      rate: 7.0,
      tenure: 3,
    });

    expect(result.maturityValue).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(Number.isNaN(result.maturityValue)).toBe(false);
    expect(result.heroText).toContain('Please enter a valid deposit amount');
  });
});
