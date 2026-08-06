import { describe, it, expect } from 'vitest';
import { calculateStepUpSip } from '../step-up-sip-calculator.js';

describe('Step-up SIP Calculator Engine', () => {
  it('calculates accurate compounding for ₹5K SIP with 10% annual step-up @ 12% for 10 years', () => {
    const result = calculateStepUpSip({
      initialMonthlyInvestment: 5000,
      annualStepUpPct: 10,
      expectedReturnRate: 12,
      tenureYears: 10,
    });

    expect(result.totalInvested).toBeGreaterThan(600000); // Higher than standard flat 600K
    expect(result.maturityValue).toBeGreaterThan(1150000);
    expect(result.yearlyBreakdown.length).toBe(10);
  });
});