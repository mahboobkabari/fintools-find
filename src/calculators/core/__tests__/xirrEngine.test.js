import { describe, it, expect } from 'vitest';
import { calculateXirr, generateSipCashFlows } from '../xirrEngine.js';

describe('XIRR Core Math Engine', () => {
  it('calculates accurate XIRR for a standard monthly SIP scenario (12% expected return)', () => {
    // 10-year ₹5,000 monthly SIP yields ₹11,61,695 maturity corpus
    const cashFlows = generateSipCashFlows({
      monthlyAmount: 5000,
      tenureYears: 10,
      finalValue: 1161695,
      startDate: '2015-01-01',
    });

    const res = calculateXirr(cashFlows);
    expect(res.valid).toBe(true);
    // Nominal 12% monthly rate yields ~12.68% effective annual XIRR rate
    expect(res.xirrPct).toBeGreaterThanOrEqual(11.5);
    expect(res.xirrPct).toBeLessThanOrEqual(13.0);
    expect(res.xirrPct).toBeCloseTo(12.68, 1);
  });

  it('calculates XIRR for annual irregular investment contributions', () => {
    const cashFlows = [
      { amount: -100000, date: '2020-01-01' },
      { amount: -100000, date: '2021-01-01' },
      { amount: -100000, date: '2022-01-01' },
      { amount: 400000, date: '2023-01-01' },
    ];

    const res = calculateXirr(cashFlows);
    expect(res.valid).toBe(true);
    expect(res.xirrPct).toBeGreaterThan(10.0);
    expect(res.xirrPct).toBeLessThan(20.0);
  });

  it('calculates XIRR for irregular dated cash flows (-100k, -50k, +180k)', () => {
    const cashFlows = [
      { amount: -100000, date: '2020-01-01' },
      { amount: -50000, date: '2020-07-01' },
      { amount: 180000, date: '2021-01-01' },
    ];

    const res = calculateXirr(cashFlows);
    expect(res.valid).toBe(true);
    expect(res.xirrPct).toBeCloseTo(24.18, 1);
  });

  it('calculates XIRR for single investment matching CAGR (₹1L to ₹2.5L over 5 years)', () => {
    const cashFlows = [
      { amount: -100000, date: '2020-01-01' },
      { amount: 250000, date: '2025-01-01' },
    ];

    const res = calculateXirr(cashFlows);
    expect(res.valid).toBe(true);
    expect(res.xirrPct).toBeCloseTo(20.10, 1);
  });

  it('calculates XIRR correctly for a zero-return SIP (maturity equals total invested)', () => {
    const cashFlows = generateSipCashFlows({
      monthlyAmount: 5000,
      tenureYears: 5,
      finalValue: 300000, // 60 months * 5000 = 300000 (0% gain)
      startDate: '2020-01-01',
    });

    const res = calculateXirr(cashFlows);
    expect(res.valid).toBe(true);
    expect(res.xirrPct).toBeCloseTo(0, 0);
  });

  it('calculates XIRR correctly for a negative-return / loss SIP scenario', () => {
    const cashFlows = generateSipCashFlows({
      monthlyAmount: 5000,
      tenureYears: 3,
      finalValue: 120000, // 36 months * 5000 = 180000 invested, but redeemed at 120000 (loss)
      startDate: '2020-01-01',
    });

    const res = calculateXirr(cashFlows);
    expect(res.valid).toBe(true);
    expect(res.xirrPct).toBeLessThan(0);
  });

  it('handles leap year date intervals accurately', () => {
    const cashFlows = [
      { amount: -100000, date: '2020-02-29' }, // Leap year date
      { amount: 112000, date: '2021-02-28' },
    ];

    const res = calculateXirr(cashFlows);
    expect(res.valid).toBe(true);
    expect(res.xirrPct).toBeCloseTo(12.01, 2);
  });

  it('rejects invalid cash flow sequences (all positive or all negative)', () => {
    const allPos = [
      { amount: 10000, date: '2020-01-01' },
      { amount: 20000, date: '2021-01-01' },
    ];
    expect(calculateXirr(allPos).valid).toBe(false);
    expect(calculateXirr(allPos).error).toContain('both positive');

    const allNeg = [
      { amount: -10000, date: '2020-01-01' },
      { amount: -20000, date: '2021-01-01' },
    ];
    expect(calculateXirr(allNeg).valid).toBe(false);
  });

  it('returns structured error when fewer than two cash flows are supplied', () => {
    const res = calculateXirr([{ amount: -10000, date: '2020-01-01' }]);
    expect(res.valid).toBe(false);
    expect(res.error).toBeDefined();
  });
});
