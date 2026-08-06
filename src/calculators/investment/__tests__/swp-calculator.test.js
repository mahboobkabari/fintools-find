import { describe, it, expect } from 'vitest';
import { calculateSwp } from '../swp-calculator.js';

describe('SWP Calculator Engine', () => {
  it('calculates accurate monthly withdrawal and remaining corpus balance', () => {
    const result = calculateSwp({
      totalInvestment: 5000000,   // ₹50 Lakhs initial corpus
      monthlyWithdrawal: 30000,    // ₹30,000 monthly withdrawal
      expectedReturnRate: 8,       // 8% p.a. return
      tenureYears: 10,             // 10 Years
    });

    expect(result.totalInvestment).toBe(5000000);
    expect(result.totalWithdrawn).toBe(3600000); // 30K * 120 = 36 Lakhs withdrawn
    expect(result.finalBalance).toBeGreaterThan(3000000); // Remaining corpus > 30 Lakhs
    expect(result.yearlyBreakdown.length).toBe(10);
  });
});