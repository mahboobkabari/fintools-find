import { describe, it, expect } from 'vitest';
import { calculateTakeHomeSalaryCalculator } from '../take-home-salary-calculator.js';

describe('Take-Home Salary Calculator Engine', () => {
  it('calculates monthly take-home for ₹12 Lakh CTC benchmark (FY 2025-26)', () => {
    const output = calculateTakeHomeSalaryCalculator({
      ctc: 1200000,
      basicPercent: 50,
      professionalTax: 2400,
    });
    expect(output.grossAnnualCtc).toBe(1200000);
    expect(output.standardDeduction).toBe(75000);
    expect(output.taxableIncome).toBe(1125000);
    expect(output.totalIncomeTax).toBe(71500);
    expect(output.epfAnnual).toBe(72000);
    expect(output.netMonthlyTakeHome).toBe(87842);
    expect(output.primaryOutput).toBe(87842);
  });

  it('calculates zero income tax under Section 87A for ₹7.5 Lakh CTC', () => {
    const output = calculateTakeHomeSalaryCalculator({
      ctc: 750000,
      basicPercent: 50,
      professionalTax: 2400,
    });
    expect(output.taxableIncome).toBe(675000); // 7.5L - 75k std ded
    expect(output.totalIncomeTax).toBe(0); // Sec 87A rebate
    expect(output.netMonthlyTakeHome).toBe(58550); // (7.5L - 45k EPF - 2.4k PT)/12
  });
});