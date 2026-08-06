import { describe, it, expect } from 'vitest';
import { calculateLumpsumTool } from '../lumpsum-calculator.js';

describe('Lumpsum Calculator Engine', () => {
  it('calculates accurate compound interest for ₹1 Lakh @ 12% for 10 years', () => {
    const result = calculateLumpsumTool({
      initialInvestment: 100000,
      expectedReturnRate: 12,
      tenureYears: 10,
    });

    expect(result.totalInvested).toBe(100000);
    expect(result.maturityValue).toBe(310585);
    expect(result.estReturns).toBe(210585);
    expect(result.yearlyBreakdown.length).toBe(10);
  });
});