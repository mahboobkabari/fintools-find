import { describe, it, expect } from 'vitest';
import { calculateXirrCalculator } from '../xirr-calculator.js';

describe('Flagship XIRR Financial Engine', () => {
  it('1. verifies Benchmark Case A: -₹100,000 to +₹110,000 over 1 Year (Exactly 10% XIRR)', () => {
    const result = calculateXirrCalculator({
      cashFlows: [
        { date: '2024-01-01', amount: -100000 },
        { date: '2025-01-01', amount: 110000 },
      ],
    });

    expect(result.isValid).toBe(true);
    expect(result.xirrPercent).toBeCloseTo(10.0, 1);
    expect(result.totalInvested).toBe(100000);
    expect(result.totalRedeemed).toBe(110000);
    expect(result.absoluteProfit).toBe(10000);
    expect(result.absoluteReturnPercent).toBe(10.0);
    expect(result.holdingPeriodYears).toBeCloseTo(1.0, 1);
  });

  it('2. verifies Benchmark Case B: -₹100,000 to +₹121,000 over 2 Years (Exactly 10% XIRR)', () => {
    const result = calculateXirrCalculator({
      cashFlows: [
        { date: '2023-01-01', amount: -100000 },
        { date: '2025-01-01', amount: 121000 },
      ],
    });

    expect(result.isValid).toBe(true);
    expect(result.xirrPercent).toBeCloseTo(10.0, 1);
    expect(result.totalInvested).toBe(100000);
    expect(result.totalRedeemed).toBe(121000);
    expect(result.absoluteProfit).toBe(21000);
    expect(result.holdingPeriodYears).toBeCloseTo(2.0, 1);
  });

  it('3. verifies Benchmark Case C: Lumpsum + Top-up + Redemption (-₹100k, -₹50k, +₹180k)', () => {
    const result = calculateXirrCalculator({
      cashFlows: [
        { date: '2023-01-01', amount: -100000 },
        { date: '2024-01-01', amount: -50000 },
        { date: '2025-01-01', amount: 180000 },
      ],
    });

    expect(result.isValid).toBe(true);
    expect(result.xirrPercent).toBeGreaterThan(11.0);
    expect(result.totalInvested).toBe(150000);
    expect(result.totalRedeemed).toBe(180000);
    expect(result.absoluteProfit).toBe(30000);
  });

  it('4. verifies 3-Year Annual SIP Series (3 x -₹50k + ₹185k valuation)', () => {
    const result = calculateXirrCalculator({
      cashFlows: [
        { date: '2022-01-01', amount: -50000 },
        { date: '2023-01-01', amount: -50000 },
        { date: '2024-01-01', amount: -50000 },
        { date: '2025-01-01', amount: 185000 },
      ],
    });

    expect(result.isValid).toBe(true);
    expect(result.totalInvested).toBe(150000);
    expect(result.totalRedeemed).toBe(185000);
    expect(result.absoluteProfit).toBe(35000);
  });

  it('5. handles missing positive redemption cash flow gracefully (isValid: false)', () => {
    const result = calculateXirrCalculator({
      cashFlows: [
        { date: '2023-01-01', amount: -100000 },
        { date: '2024-01-01', amount: -50000 },
      ],
    });

    expect(result.isValid).toBe(false);
    expect(result.xirrPercent).toBe(0);
    expect(result.errorMessage).toContain('redemption');
  });

  it('6. handles missing negative investment cash flow gracefully (isValid: false)', () => {
    const result = calculateXirrCalculator({
      cashFlows: [
        { date: '2023-01-01', amount: 100000 },
        { date: '2024-01-01', amount: 50000 },
      ],
    });

    expect(result.isValid).toBe(false);
    expect(result.xirrPercent).toBe(0);
    expect(result.errorMessage).toContain('investment');
  });

  it('7. handles single cash flow entry gracefully (isValid: false)', () => {
    const result = calculateXirrCalculator({
      cashFlows: [{ date: '2023-01-01', amount: -100000 }],
    });

    expect(result.isValid).toBe(false);
    expect(result.xirrPercent).toBe(0);
  });

  it('8. ignores invalid date string entries cleanly', () => {
    const result = calculateXirrCalculator({
      cashFlows: [
        { date: 'invalid-date', amount: -100000 },
        { date: '2024-01-01', amount: -100000 },
        { date: '2025-01-01', amount: 110000 },
      ],
    });

    expect(result.isValid).toBe(true);
    expect(result.totalInvested).toBe(100000);
  });

  it('9. ignores zero amount transactions cleanly', () => {
    const result = calculateXirrCalculator({
      cashFlows: [
        { date: '2024-01-01', amount: -100000 },
        { date: '2024-06-01', amount: 0 },
        { date: '2025-01-01', amount: 110000 },
      ],
    });

    expect(result.isValid).toBe(true);
    expect(result.totalInvested).toBe(100000);
  });

  it('10. verifies total invested capital sum accuracy', () => {
    const result = calculateXirrCalculator({
      cashFlows: [
        { date: '2023-01-01', amount: -25000 },
        { date: '2023-06-01', amount: -25000 },
        { date: '2024-01-01', amount: -50000 },
        { date: '2025-01-01', amount: 120000 },
      ],
    });

    expect(result.totalInvested).toBe(100000);
  });

  it('11. verifies total redeemed capital sum accuracy', () => {
    const result = calculateXirrCalculator({
      cashFlows: [
        { date: '2023-01-01', amount: -100000 },
        { date: '2024-01-01', amount: 20000 },
        { date: '2025-01-01', amount: 100000 },
      ],
    });

    expect(result.totalRedeemed).toBe(120000);
  });

  it('12. verifies absolute profit calculation accuracy', () => {
    const result = calculateXirrCalculator({
      cashFlows: [
        { date: '2024-01-01', amount: -100000 },
        { date: '2025-01-01', amount: 125000 },
      ],
    });

    expect(result.absoluteProfit).toBe(25000);
  });

  it('13. verifies absolute return % calculation accuracy', () => {
    const result = calculateXirrCalculator({
      cashFlows: [
        { date: '2024-01-01', amount: -100000 },
        { date: '2025-01-01', amount: 125000 },
      ],
    });

    expect(result.absoluteReturnPercent).toBe(25.0);
  });

  it('14. verifies holding period years calculation accuracy', () => {
    const result = calculateXirrCalculator({
      cashFlows: [
        { date: '2020-01-01', amount: -100000 },
        { date: '2025-01-01', amount: 200000 },
      ],
    });

    expect(result.holdingPeriodYears).toBeCloseTo(5.0, 1);
  });

  it('15. verifies USD currency mode hero text formatting', () => {
    const result = calculateXirrCalculator({
      currency: 'USD',
      cashFlows: [
        { date: '2024-01-01', amount: -10000 },
        { date: '2025-01-01', amount: 11000 },
      ],
    });

    expect(result.currency).toBe('USD');
    expect(result.heroText).toContain('$10,000');
  });
});
