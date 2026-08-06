import { describe, it, expect } from 'vitest';
import { calculateFireCalculator } from '../fire-calculator.js';

describe('FIRE Calculator Engine', () => {
  it('calculates FI Number and FIRE status correctly for benchmark (Age 30 to 45, $40k expenses)', () => {
    const output = calculateFireCalculator({
      currentAge: 30,
      targetFireAge: 45,
      annualExpenses: 40000,
      currentPortfolio: 100000,
      annualSavings: 30000,
      swrPercent: 4,
      inflationRate: 3,
      expectedReturn: 8,
    });
    expect(output.yearsToFire).toBe(15);
    expect(output.futureAnnualExpenses).toBe(62319);
    expect(output.targetFireCorpus).toBe(1557967); // ~$1.56 Million
    expect(output.projectedPortfolio).toBeGreaterThan(1100000);
    expect(output.primaryOutput).toBe(1557967);
  });

  it('handles surplus FIRE portfolio scenario', () => {
    const output = calculateFireCalculator({
      currentAge: 30,
      targetFireAge: 45,
      annualExpenses: 30000,
      currentPortfolio: 200000,
      annualSavings: 50000,
      swrPercent: 4,
      inflationRate: 2,
      expectedReturn: 9,
    });
    expect(output.isFireAchieved).toBe(true);
    expect(output.fireSurplusOrDeficit).toBeGreaterThan(0);
  });
});