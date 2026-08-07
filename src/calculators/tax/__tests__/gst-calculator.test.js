import { describe, it, expect } from 'vitest';
import { calculateGst } from '../gst-calculator.js';

describe('Flagship GST Tax Decision Engine Math Suite', () => {
  it('calculates accurate exclusive GST (18%) for ₹10,000 net base amount', () => {
    const result = calculateGst({
      amount: 10000,
      gstRate: 18,
      gstType: 'exclusive',
      txType: 'intrastate',
    });

    expect(result.netAmount).toBe(10000);
    expect(result.gstAmount).toBe(1800);
    expect(result.cgst).toBe(900);
    expect(result.sgst).toBe(900);
    expect(result.igst).toBe(0);
    expect(result.grossAmount).toBe(11800);
  });

  it('calculates accurate inclusive GST (18%) extracted from ₹11,800 gross total', () => {
    const result = calculateGst({
      amount: 11800,
      gstRate: 18,
      gstType: 'inclusive',
      txType: 'intrastate',
    });

    expect(result.grossAmount).toBe(11800);
    expect(result.netAmount).toBe(10000);
    expect(result.gstAmount).toBe(1800);
    expect(result.cgst).toBe(900);
    expect(result.sgst).toBe(900);
  });

  it('handles interstate transaction (100% IGST)', () => {
    const result = calculateGst({
      amount: 10000,
      gstRate: 18,
      gstType: 'exclusive',
      txType: 'interstate',
    });

    expect(result.igst).toBe(1800);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
  });

  it('handles all standard GST slabs (5%, 12%, 18%, 28%)', () => {
    [5, 12, 18, 28].forEach((slab) => {
      const res = calculateGst({ amount: 10000, gstRate: slab });
      expect(res.gstAmount).toBe(Math.round(10000 * (slab / 100)));
    });
  });

  it('handles zero amount and edge cases gracefully', () => {
    const result = calculateGst({ amount: 0, gstRate: 18 });
    expect(result.netAmount).toBe(0);
    expect(result.gstAmount).toBe(0);
    expect(result.grossAmount).toBe(0);
  });
});