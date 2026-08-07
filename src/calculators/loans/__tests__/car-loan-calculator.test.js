import { describe, it, expect } from 'vitest';
import { calculateCarLoan } from '../car-loan-calculator.js';

describe('Car Buying Decision Engine Math Suite', () => {
  it('calculates accurate car loan EMI and down payment for benchmark values', () => {
    const result = calculateCarLoan({
      vehiclePrice: 1000000,
      downPaymentPct: 15,
      rate: 9.0,
      tenure: 5,
      processingFeePct: 1,
      monthlyIncome: 100000,
      fuelType: 'petrol',
    });

    expect(result.loanAmount).toBe(850000);
    expect(result.downPaymentAmount).toBe(150000);
    expect(result.emi).toBe(17645);
    expect(result.processingFee).toBe(8500);
    expect(result.totalInterest).toBe(208700);
    expect(result.totalOwnershipCost5Yr).toBeGreaterThan(1000000);
    expect(result.dpCoach).toBeDefined();
    expect(result.rateSensitivity).toBeDefined();
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.schedule.length).toBe(60);
  });
});