import { describe, it, expect } from 'vitest';
import { calculatePensionCalculator } from '../pension-calculator.js';

describe('Pension Calculator Engine', () => {
  it('calculates monthly and annual pension payouts correctly for benchmark ($500k corpus @ 6.5%)', () => {
    const output = calculatePensionCalculator({
      pensionCorpus: 500000,
      annuityRate: 6.5,
      guaranteeYears: 20,
    });
    expect(output.annualPension).toBe(32500);
    expect(output.monthlyPension).toBe(2708); // $2,708/month
    expect(output.totalGuaranteedPayout).toBe(650000);
    expect(output.primaryOutput).toBe(2708);
  });

  it('handles small pension corpus cleanly', () => {
    const output = calculatePensionCalculator({
      pensionCorpus: 100000,
      annuityRate: 6.0,
      guaranteeYears: 15,
    });
    expect(output.annualPension).toBe(6000);
    expect(output.monthlyPension).toBe(500);
    expect(output.totalGuaranteedPayout).toBe(90000);
  });
});