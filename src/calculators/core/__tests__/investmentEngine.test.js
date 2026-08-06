import { describe, it, expect } from 'vitest';
import { calculateSip, calculateLumpsum } from '../investmentEngine.js';

describe('Universal Investment Engine (investmentEngine.js)', () => {
  it('calculates accurate SIP maturity value for benchmark input (₹5,000/mo @ 12% for 10 yrs)', () => {
    const res = calculateSip({ monthlyInvestment: 5000, expectedReturnRate: 12, tenureYears: 10 });
    expect(res.totalInvested).toBe(600000);
    // Benchmark expected maturity: ~₹11.61 Lakhs (1161695)
    expect(res.maturityValue).toBeGreaterThan(1150000);
    expect(res.maturityValue).toBeLessThan(1170000);
    expect(res.estReturns).toBe(res.maturityValue - res.totalInvested);
    expect(res.yearlyBreakdown).toHaveLength(10);
  });

  it('handles 0% return rate scheme correctly', () => {
    const res = calculateSip({ monthlyInvestment: 5000, expectedReturnRate: 0, tenureYears: 5 });
    expect(res.totalInvested).toBe(300000);
    expect(res.maturityValue).toBe(300000);
    expect(res.estReturns).toBe(0);
  });

  it('calculates lumpsum investment maturity correctly', () => {
    const res = calculateLumpsum({ principal: 100000, expectedReturnRate: 12, tenureYears: 10 });
    expect(res.totalInvested).toBe(100000);
    expect(res.maturityValue).toBe(310585); // 100000 * 1.12^10 = 310584.85
  });
});
