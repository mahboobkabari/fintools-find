import { describe, it, expect } from 'vitest';
import { calculateEmi } from '../emi.js';

describe('TICKET-001: EMI Calculator Engine', () => {
  it('calculates accurate EMI for standard ₹10 Lakh benchmark loan', () => {
    const result = calculateEmi({
      amount: 1000000,
      rate: 8.5,
      tenure: 20,
      tenureType: 'years',
    });

    expect(result.emi).toBe(8678);
    expect(result.totalPayment).toBe(2082720);
    expect(result.totalInterest).toBe(1082720);
    expect(result.tenureMonths).toBe(240);
    expect(result.schedule).toHaveLength(240);
  });

  it('handles monthly tenure conversion correctly', () => {
    const result = calculateEmi({
      amount: 500000,
      rate: 10,
      tenure: 60,
      tenureType: 'months',
    });

    expect(result.tenureMonths).toBe(60);
    expect(result.emi).toBe(10624);
  });

  it('handles 0% interest rate (interest-free loan scheme)', () => {
    const result = calculateEmi({
      amount: 120000,
      rate: 0,
      tenure: 12,
      tenureType: 'months',
    });

    expect(result.emi).toBe(10000);
    expect(result.totalInterest).toBe(0);
    expect(result.totalPayment).toBe(120000);
  });

  it('handles edge case of 0 principal or interest gracefully', () => {
    const zeroResult = calculateEmi({ amount: 0, rate: 8.5, tenure: 10 });
    expect(zeroResult.emi).toBe(0);
    expect(zeroResult.totalInterest).toBe(0);
  });
});
