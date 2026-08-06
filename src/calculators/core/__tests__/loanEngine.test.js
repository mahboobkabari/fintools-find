import { describe, it, expect } from 'vitest';
import { calculateLoan } from '../loanEngine.js';

describe('Universal Loan Engine (loanEngine.js)', () => {
  it('calculates standard loan EMI correctly', () => {
    const res = calculateLoan({ amount: 1000000, rate: 8.5, tenure: 20, tenureType: 'years' });
    expect(res.emi).toBe(8678);
    expect(res.principal).toBe(1000000);
    expect(res.totalInterest).toBe(1082720);
    expect(res.tenureMonths).toBe(240);
  });

  it('handles down payment deduction', () => {
    const res = calculateLoan({ amount: 1200000, downPayment: 200000, rate: 8.5, tenure: 20 });
    expect(res.principal).toBe(1000000);
    expect(res.emi).toBe(8678);
  });

  it('handles extra monthly prepayment accelerating payoff', () => {
    const standard = calculateLoan({ amount: 1000000, rate: 8.5, tenure: 20 });
    const accelerated = calculateLoan({ amount: 1000000, rate: 8.5, tenure: 20, prepaymentMonthly: 2000 });

    expect(accelerated.actualPayoffMonths).toBeLessThan(standard.actualPayoffMonths);
    expect(accelerated.totalInterest).toBeLessThan(standard.totalInterest);
  });

  it('handles 0% interest rate scheme', () => {
    const res = calculateLoan({ amount: 120000, rate: 0, tenure: 12, tenureType: 'months' });
    expect(res.emi).toBe(10000);
    expect(res.totalInterest).toBe(0);
  });
});
