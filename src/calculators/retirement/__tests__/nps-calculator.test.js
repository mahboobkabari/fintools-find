import { describe, it, expect } from 'vitest';
import { calculateNpsCalculator } from '../nps-calculator.js';

describe('NPS Calculator Engine', () => {
  it('calculates NPS maturity corpus, 60% lump sum, and monthly pension for benchmark (₹10k/mo @ 30 yrs)', () => {
    const output = calculateNpsCalculator({
      monthlyInvestment: 10000,
      currentAge: 30,
      expectedReturn: 10,
      annuityPercent: 40,
      expectedAnnuityRate: 6,
    });
    expect(output.yearsInvested).toBe(30);
    expect(output.totalInvestment).toBe(3600000);
    expect(output.totalMaturityCorpus).toBeGreaterThan(20000000); // > ₹2 Crores
    expect(output.annuityCorpus).toBe(Math.round(output.totalMaturityCorpus * 0.40));
    expect(output.lumpSumAmount).toBe(Math.round(output.totalMaturityCorpus * 0.60));
    expect(output.monthlyPension).toBeGreaterThan(40000); // > ₹40k/mo pension
  });

  it('handles 100% annuity allocation scenario', () => {
    const output = calculateNpsCalculator({
      monthlyInvestment: 5000,
      currentAge: 40,
      expectedReturn: 10,
      annuityPercent: 100,
      expectedAnnuityRate: 6,
    });
    expect(output.yearsInvested).toBe(20);
    expect(output.lumpSumAmount).toBe(0);
    expect(output.annuityCorpus).toBe(output.totalMaturityCorpus);
  });
});