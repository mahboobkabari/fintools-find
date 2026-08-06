import { describe, it, expect } from 'vitest';
import { pmt, fv, cagr, generateAmortizationSchedule } from '../financialMath.js';

describe('Financial Math Primitives (TVM Engine)', () => {
  it('correctly calculates Loan EMI (PMT)', () => {
    // Benchmark: ₹10,00,000 loan at 8.5% p.a. for 20 years (240 months)
    const monthlyRate = (8.5 / 12) / 100;
    const emi = pmt(monthlyRate, 240, 1000000);
    expect(Math.round(emi)).toBe(8678);
  });

  it('correctly calculates SIP Future Value (FV)', () => {
    // Benchmark: ₹10,000/month at 12% p.a. for 10 years (120 months)
    const monthlyRate = (12 / 12) / 100;
    const maturityValue = fv(monthlyRate, 120, 10000, true);
    expect(Math.round(maturityValue)).toBe(2323391);
  });

  it('correctly calculates CAGR', () => {
    // Benchmark: ₹1,00,000 to ₹2,00,000 in 5 years
    const rate = cagr(100000, 200000, 5);
    expect(Number((rate * 100).toFixed(2))).toBe(14.87);
  });

  it('generates accurate amortization schedule', () => {
    const schedule = generateAmortizationSchedule(100000, 10, 12);
    expect(schedule).toHaveLength(12);
    expect(schedule[0].month).toBe(1);
    expect(schedule[11].remainingBalance).toBe(0);
  });
});
