import { describe, it, expect } from 'vitest';
import { calculateLoanAmortization } from '../loan-amortization-calculator.js';

describe('Loan Amortization Calculator Engine', () => {
  it('generates full amortization schedule for 15-year loan', () => {
    const result = calculateLoanAmortization({
      amount: 1000000,
      rate: 8.5,
      tenure: 15,
      tenureType: 'years',
    });

    expect(result.principal).toBe(1000000);
    expect(result.emi).toBe(9847);
    expect(result.totalInterest).toBe(772460);
    expect(result.schedule.length).toBe(180);
  });
});