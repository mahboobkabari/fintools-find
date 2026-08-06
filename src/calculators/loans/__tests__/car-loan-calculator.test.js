import { describe, it, expect } from 'vitest';
import { calculateCarLoan } from '../car-loan-calculator.js';

describe('Car Loan Calculator Math Engine', () => {
  it('calculates accurate car loan EMI and down payment for benchmark values', () => {
    const result = calculateCarLoan({
      vehiclePrice: 1000000, // ₹10 Lakhs vehicle
      downPaymentPct: 15,    // 15% = ₹1.5 Lakhs down payment, ₹8.5 Lakhs loan
      rate: 9.0,             // 9% p.a.
      tenure: 5,            // 5 Years (60 months)
      tenureType: 'years',
      processingFeePct: 1,   // 1% = ₹8,500 processing fee
    });

    expect(result.loanAmount).toBe(850000);
    expect(result.downPaymentAmount).toBe(150000);
    expect(result.emi).toBe(17645);
    expect(result.processingFee).toBe(8500);
    expect(result.totalInterest).toBe(208700);
    expect(result.totalPayment).toBe(850000 + 208700 + 8500);
    expect(result.schedule.length).toBe(60);
  });
});