import { describe, it, expect } from 'vitest';
import { calculateSipTool } from '../sip.js';

describe('TICKET-002: SIP Calculator Engine', () => {
  it('calculates accurate maturity wealth for standard ₹5,000 monthly SIP @ 12% for 10 years', () => {
    const res = calculateSipTool({ monthlyInvestment: 5000, expectedReturnRate: 12, tenureYears: 10 });
    expect(res.totalInvested).toBe(600000);
    expect(res.maturityValue).toBeGreaterThan(1150000);
    expect(res.estReturns).toBe(res.maturityValue - res.totalInvested);
  });

  it('handles boundary case of zero or negative inputs gracefully', () => {
    const res = calculateSipTool({ monthlyInvestment: 0, expectedReturnRate: 12, tenureYears: 10 });
    expect(res.totalInvested).toBe(0);
    expect(res.maturityValue).toBe(0);
    expect(res.estReturns).toBe(0);
  });
});
