import { describe, it, expect } from 'vitest';
import { calculateEducationLoan } from '../education-loan-calculator.js';

describe('Education Loan Calculator Math Engine', () => {
  it('calculates accurate education loan EMI and moratorium interest for benchmark values', () => {
    const result = calculateEducationLoan({
      amount: 1000000,       // ₹10 Lakhs education loan
      rate: 9.5,            // 9.5% p.a.
      tenure: 10,           // 10 Years repayment tenure
      tenureType: 'years',
      moratoriumYears: 4,   // 4 Years study moratorium
    });

    expect(result.loanAmount).toBe(1000000);
    expect(result.moratoriumInterest).toBe(380000); // 10L * 9.5% * 4 yrs = ₹3,80,000
    expect(result.totalPrincipalAtRepayment).toBe(1380000);
    expect(result.emi).toBe(17857);
    expect(result.totalInterest).toBe(1142840);
  });
});