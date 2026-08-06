import { describe, it, expect } from 'vitest';
import { calculateLoanEligibility } from '../loan-eligibility-calculator.js';

describe('Loan Eligibility Calculator Math Engine', () => {
  it('calculates accurate loan eligibility for FOIR 50% benchmark', () => {
    const result = calculateLoanEligibility({
      grossMonthlyIncome: 100000, // ₹1 Lakh monthly income
      existingEmis: 10000,        // ₹10,000 existing EMIs
      rate: 8.5,                 // 8.5% p.a.
      tenure: 20,                // 20 Years (240 months)
      tenureType: 'years',
      foirPct: 50,               // 50% FOIR = ₹50,000 max EMI allowance, ₹40,000 available EMI
    });

    expect(result.maxTotalEmiAllowed).toBe(50000);
    expect(result.maxEmiCapacity).toBe(40000);
    expect(result.maxLoanAmount).toBe(4609234);
    expect(result.totalPayment).toBe(9600000);
    expect(result.totalInterest).toBe(4990766);
  });

  it('returns 0 max loan amount when existing EMIs exceed FOIR capacity', () => {
    const result = calculateLoanEligibility({
      grossMonthlyIncome: 50000,
      existingEmis: 30000,
      rate: 10,
      tenure: 10,
      foirPct: 50, // 50% of 50K = 25K max EMI, existing EMIs = 30K (exceeded)
    });

    expect(result.maxLoanAmount).toBe(0);
    expect(result.maxEmiCapacity).toBe(0);
  });
});