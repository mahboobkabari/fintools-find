import { describe, it, expect } from 'vitest';
import { calculateCagr } from '../cagr-calculator.js';

describe('CAGR Calculator Engine', () => {
  it('calculates accurate CAGR percentage for ₹1 Lakh growing to ₹2.5 Lakhs in 5 years', () => {
    const result = calculateCagr({
      initialValue: 100000,
      finalValue: 250000,
      tenureYears: 5,
    });

    expect(result.initialValue).toBe(100000);
    expect(result.finalValue).toBe(250000);
    expect(result.absoluteGain).toBe(150000);
    expect(result.cagrPct).toBe(20.11); // 20.11% p.a.
    expect(result.yearlyBreakdown.length).toBe(5);
  });
});