import { describe, it, expect } from 'vitest';
import { calculateVatCalculator } from '../vat-calculator.js';

describe('VAT Calculator Engine', () => {
  it('calculates VAT Exclusive correctly for benchmark £100 @ 20% VAT', () => {
    const output = calculateVatCalculator({ amount: 100, rate: 20, mode: 'exclusive' });
    expect(output.netAmount).toBe(100);
    expect(output.vatAmount).toBe(20);
    expect(output.grossAmount).toBe(120);
    expect(output.primaryOutput).toBe(20);
  });

  it('calculates VAT Inclusive correctly for benchmark £120 gross @ 20% VAT', () => {
    const output = calculateVatCalculator({ amount: 120, rate: 20, mode: 'inclusive' });
    expect(output.netAmount).toBe(100);
    expect(output.vatAmount).toBe(20);
    expect(output.grossAmount).toBe(120);
  });

  it('handles 0% VAT rate cleanly', () => {
    const output = calculateVatCalculator({ amount: 500, rate: 0, mode: 'exclusive' });
    expect(output.vatAmount).toBe(0);
    expect(output.grossAmount).toBe(500);
  });
});