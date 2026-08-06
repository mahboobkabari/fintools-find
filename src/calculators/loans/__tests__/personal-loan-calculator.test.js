import { describe, it, expect } from 'vitest';
import { calculatePersonalLoan } from '../personal-loan-calculator.js';

describe('Personal Loan Calculator Math Engine', () => {
  it('calculates accurate personal loan EMI for benchmark values', () => {
    const result = calculatePersonalLoan({
      amount: 500000,      // ₹5 Lakhs
      rate: 11.5,          // 11.5% p.a.
      tenure: 3,           // 3 Years (36 months)
      tenureType: 'years',
      processingFeePct: 1, // 1% = ₹5,000 processing fee
    });

    expect(result.loanAmount).toBe(500000);
    expect(result.emi).toBe(16488);
    expect(result.processingFee).toBe(5000);
    expect(result.totalInterest).toBe(93568);
    expect(result.totalPayment).toBe(500000 + 93568 + 5000);
    expect(result.schedule.length).toBe(36);
  });
});