import { describe, it, expect } from 'vitest';
import { calculateLumpsumTool } from '../lumpsum-calculator.js';

describe('Flagship Lumpsum Investment Decision Engine Math Suite', () => {
  it('calculates benchmark compound interest for ₹1 Lakh @ 12% for 10 years', () => {
    const result = calculateLumpsumTool({
      initialInvestment: 100000,
      expectedReturnRate: 12,
      tenureYears: 10,
    });

    expect(result.totalInvested).toBe(100000);
    expect(result.maturityValue).toBe(310585);
    expect(result.estReturns).toBe(210585);
    expect(result.wealthMultiplier).toBe(3.11);
    expect(result.inflationAdjustedValue).toBeGreaterThan(0);
    expect(result.scenarios.conservative).toBeDefined();
    expect(result.delayCost.wealthCostOfWaiting).toBeGreaterThan(0);
    expect(result.yearlyBreakdown.length).toBe(10);
  });

  it('handles zero return rate edge case gracefully', () => {
    const result = calculateLumpsumTool({
      initialInvestment: 100000,
      expectedReturnRate: 0,
      tenureYears: 5,
    });

    expect(result.maturityValue).toBe(100000);
    expect(result.estReturns).toBe(0);
    expect(result.wealthMultiplier).toBe(1.0);
  });

  it('handles monthly compounding frequency correctly', () => {
    const result = calculateLumpsumTool({
      initialInvestment: 100000,
      expectedReturnRate: 12,
      tenureYears: 1,
      compoundingFrequency: 'monthly',
    });

    expect(result.maturityValue).toBeGreaterThan(112000);
    expect(result.yearlyBreakdown.length).toBe(1);
  });

  it('handles invalid or string input values without throwing', () => {
    const result = calculateLumpsumTool({
      initialInvestment: '200000',
      expectedReturnRate: '15',
      tenureYears: '5',
    });

    expect(result.totalInvested).toBe(200000);
    expect(result.maturityValue).toBeGreaterThan(200000);
  });
});