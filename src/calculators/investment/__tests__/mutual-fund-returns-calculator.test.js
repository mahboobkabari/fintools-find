import { describe, it, expect } from 'vitest';
import { calculateMutualFundReturns } from '../mutual-fund-returns-calculator.js';

describe('Mutual Fund Returns Calculator Engine', () => {
  it('calculates accurate returns for SIP mode', () => {
    const result = calculateMutualFundReturns({
      amount: 5000,
      expectedReturnRate: 12,
      tenureYears: 10,
      investmentType: 'sip',
    });

    expect(result.investmentType).toBe('sip');
    expect(result.totalInvested).toBe(600000);
    expect(result.maturityValue).toBe(1161695);
    expect(result.estReturns).toBe(561695);
  });

  it('calculates accurate returns for Lumpsum mode', () => {
    const result = calculateMutualFundReturns({
      amount: 100000,
      expectedReturnRate: 12,
      tenureYears: 10,
      investmentType: 'lumpsum',
    });

    expect(result.investmentType).toBe('lumpsum');
    expect(result.totalInvested).toBe(100000);
    expect(result.maturityValue).toBe(310585);
    expect(result.estReturns).toBe(210585);
  });
});