import { describe, it, expect } from 'vitest';
import { calculateHomeLoan } from '../home-loan-calculator.js';

describe('Home Loan Calculator Math Engine', () => {
  it('calculates accurate home loan EMI and down payment for benchmark values', () => {
    const result = calculateHomeLoan({
      propertyValue: 5000000, // ₹50 Lakhs
      downPaymentPct: 20,     // 20% = ₹10 Lakhs down payment, ₹40 Lakhs loan
      rate: 8.5,              // 8.5% p.a.
      tenure: 20,             // 20 Years
      tenureType: 'years',
      processingFeePct: 0.5,  // 0.5% = ₹20,000 processing fee
    });

    expect(result.loanAmount).toBe(4000000);
    expect(result.downPaymentAmount).toBe(1000000);
    expect(result.emi).toBe(34713);
    expect(result.processingFee).toBe(20000);
    expect(result.totalInterest).toBe(4331120);
    expect(result.totalPayment).toBe(4000000 + 4331120 + 20000);
    expect(result.schedule.length).toBe(240); // 240 monthly schedule rows
  });

  it('handles 0% down payment cleanly', () => {
    const result = calculateHomeLoan({
      propertyValue: 1000000,
      downPaymentPct: 0,
      rate: 10,
      tenure: 10,
      tenureType: 'years',
    });

    expect(result.loanAmount).toBe(1000000);
    expect(result.downPaymentAmount).toBe(0);
    expect(result.emi).toBeGreaterThan(0);
  });
});