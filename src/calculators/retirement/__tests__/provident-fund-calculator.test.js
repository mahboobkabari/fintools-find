import { describe, it, expect } from 'vitest';
import { calculateProvidentFundCalculator } from '../provident-fund-calculator.js';

describe('Provident Fund (EPF) Calculator Engine', () => {
  it('calculates EPF accumulation correctly for benchmark (₹30k basic, 33 yrs tenure, 8.25% interest)', () => {
    const output = calculateProvidentFundCalculator({
      monthlyBasicSalary: 30000,
      currentAge: 25,
      retirementAge: 58,
      epfInterestRate: 8.25,
      annualSalaryIncrease: 5,
      currentEpfBalance: 0,
    });
    expect(output.yearsInvested).toBe(33);
    expect(output.totalEmployeeContribution).toBe(3458755); // ~₹34.59 Lakhs employee contribution
    expect(output.totalEmployerContribution).toBe(1057803); // ~₹10.58 Lakhs employer EPF contribution
    expect(output.finalEpfBalance).toBeGreaterThan(15000000); // > ₹1.5 Crores
    expect(output.primaryOutput).toBe(output.finalEpfBalance);
  });

  it('handles existing EPF balance cleanly', () => {
    const output = calculateProvidentFundCalculator({
      monthlyBasicSalary: 50000,
      currentAge: 35,
      retirementAge: 58,
      epfInterestRate: 8.25,
      annualSalaryIncrease: 5,
      currentEpfBalance: 500000,
    });
    expect(output.yearsInvested).toBe(23);
    expect(output.finalEpfBalance).toBeGreaterThan(10000000);
  });
});