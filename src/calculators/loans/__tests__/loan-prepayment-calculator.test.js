import { describe, it, expect } from 'vitest';
import { calculateLoanPrepayment } from '../loan-prepayment-calculator.js';

describe('Loan Prepayment Calculator Engine', () => {
  it('calculates significant interest savings and tenure reduction for lump-sum prepayment', () => {
    const result = calculateLoanPrepayment({
      amount: 2000000,        // ₹20 Lakhs loan
      rate: 8.5,             // 8.5% p.a.
      tenure: 20,            // 20 Years
      tenureType: 'years',
      prepaymentAmount: 200000, // ₹2 Lakhs lump-sum prepayment at Month 12
      prepaymentMonth: 12,
    });

    expect(result.interestSaved).toBeGreaterThan(300000); // Saves over ₹3 Lakhs interest
    expect(result.monthsSaved).toBeGreaterThan(20);        // Saves over 20 months tenure
    expect(result.newTenureMonths).toBeLessThan(240);
  });
});