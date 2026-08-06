import { describe, it, expect } from 'vitest';
import { calculateIncomeTax } from '../income-tax-calculator.js';

describe('Income Tax Calculator Engine', () => {
  it('calculates accurate tax under New Regime for ₹12 Lakhs salary', () => {
    const result = calculateIncomeTax({
      grossIncome: 1200000,
      standardDeduction: 75000,
    });

    expect(result.grossIncome).toBe(1200000);
    expect(result.taxableIncome).toBe(1125000);
    // Taxable: 11,25,000 -> Slabs: 3L-7L (20K) + 7L-10L (30K) + 10L-11.25L (18,750) = 68,750
    expect(result.baseTax).toBe(68750);
    expect(result.healthEduCess).toBe(2750);
    expect(result.totalTaxPayable).toBe(71500);
    expect(result.netTakeHome).toBe(1128500);
  });

  it('applies Section 87A rebate for income <= ₹7 Lakhs resulting in zero tax', () => {
    const result = calculateIncomeTax({
      grossIncome: 700000,
      standardDeduction: 75000,
    });

    expect(result.taxableIncome).toBe(625000);
    expect(result.totalTaxPayable).toBe(0);
  });
});