import { describe, it, expect } from 'vitest';
import { calculateGst } from '../gst-calculator.js';

describe('GST Calculator Engine', () => {
  it('calculates accurate exclusive GST (18%) for ₹10,000 net base amount', () => {
    const result = calculateGst({
      amount: 10000,
      gstRate: 18,
      gstType: 'exclusive',
    });

    expect(result.netAmount).toBe(10000);
    expect(result.gstAmount).toBe(1800);
    expect(result.cgst).toBe(900);
    expect(result.sgst).toBe(900);
    expect(result.grossAmount).toBe(11800);
  });

  it('calculates accurate inclusive GST (18%) extracted from ₹11,800 gross total', () => {
    const result = calculateGst({
      amount: 11800,
      gstRate: 18,
      gstType: 'inclusive',
    });

    expect(result.grossAmount).toBe(11800);
    expect(result.netAmount).toBe(10000);
    expect(result.gstAmount).toBe(1800);
    expect(result.cgst).toBe(900);
    expect(result.sgst).toBe(900);
  });
});