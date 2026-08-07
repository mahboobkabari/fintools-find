import { describe, it, expect } from 'vitest';
import { calculatePersonalLoan } from '../personal-loan-calculator.js';

describe('Personal Borrowing Decision Engine Math Suite', () => {
  it('calculates accurate personal loan EMI and borrowing health score', () => {
    const result = calculatePersonalLoan({
      amount: 500000,
      rate: 11.5,
      tenure: 3,
      processingFeePct: 1,
      monthlyIncome: 100000,
    });

    expect(result.loanAmount).toBe(500000);
    expect(result.emi).toBe(16488);
    expect(result.processingFee).toBe(5000);
    expect(result.totalInterest).toBe(93568);
    expect(result.totalRepayment).toBe(500000 + 93568 + 5000);
    expect(result.healthScore).toBeGreaterThan(0);
    expect(result.repayPer100).toBeGreaterThan(100);
    expect(result.borrowLessScenarios.length).toBeGreaterThan(0);
    expect(result.prepaymentCoach).toBeDefined();
    expect(result.rateSensitivity).toBeDefined();
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.schedule.length).toBe(36);
  });
});