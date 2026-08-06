import { describe, it, expect } from 'vitest';
import { calculateGratuityCalculator } from '../gratuity-calculator.js';

describe('Gratuity Calculator Engine', () => {
  it('calculates Gratuity correctly for benchmark (₹50k basic, 15 yrs 7 mos = 16 yrs rounded)', () => {
    const output = calculateGratuityCalculator({
      lastDrawnBasic: 50000,
      tenureYears: 15,
      tenureMonths: 7,
      isCoveredUnderAct: true,
    });
    expect(output.isEligible).toBe(true);
    expect(output.roundedYears).toBe(16);
    expect(output.gratuityAmount).toBe(461538); // (15/26) * 50k * 16 = ₹4,61,538
    expect(output.taxFreeGratuity).toBe(461538);
    expect(output.taxableGratuity).toBe(0);
    expect(output.primaryOutput).toBe(461538);
  });

  it('handles statutory 5-year eligibility threshold failure (< 5 years service)', () => {
    const output = calculateGratuityCalculator({
      lastDrawnBasic: 60000,
      tenureYears: 3,
      tenureMonths: 2,
      isCoveredUnderAct: true,
    });
    expect(output.isEligible).toBe(false);
    expect(output.gratuityAmount).toBe(0);
  });
});