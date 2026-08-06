import { describe, it, expect } from 'vitest';
import { calculateTdsCalculator } from '../tds-calculator.js';

describe('TDS Calculator Engine', () => {
  it('calculates Section 194J Professional Fee TDS (10% on ₹1,00,000 with PAN)', () => {
    const output = calculateTdsCalculator({ amount: 100000, tdsRate: 10, hasPan: true });
    expect(output.grossAmount).toBe(100000);
    expect(output.effectiveRate).toBe(10);
    expect(output.tdsAmount).toBe(10000);
    expect(output.netPayout).toBe(90000);
    expect(output.primaryOutput).toBe(10000);
  });

  it('calculates Section 194C Contractor TDS (2% on ₹50,000 with PAN)', () => {
    const output = calculateTdsCalculator({ amount: 50000, tdsRate: 2, hasPan: true });
    expect(output.tdsAmount).toBe(1000);
    expect(output.netPayout).toBe(49000);
  });

  it('applies Section 206AA higher 20% TDS rate when PAN is missing', () => {
    const output = calculateTdsCalculator({ amount: 100000, tdsRate: 10, hasPan: false });
    expect(output.effectiveRate).toBe(20);
    expect(output.tdsAmount).toBe(20000);
    expect(output.netPayout).toBe(80000);
  });
});