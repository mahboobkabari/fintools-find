import { describe, it, expect } from 'vitest';
import { calculate401kCalculator } from '../401k-calculator.js';

describe('401(k) Calculator Engine', () => {
  it('calculates 401(k) accumulation correctly for benchmark ($90k salary, 35 yrs, 50% match up to 6%)', () => {
    const output = calculate401kCalculator({
      currentAge: 30,
      retirementAge: 65,
      annualSalary: 90000,
      contributionPercent: 8,
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      currentBalance: 25000,
      expectedReturn: 7,
      annualSalaryIncrease: 3,
    });
    expect(output.yearsInvested).toBe(35);
    expect(output.totalEmployeeContributions).toBeGreaterThan(400000);
    expect(output.totalEmployerMatch).toBeGreaterThan(150000);
    expect(output.finalBalance).toBeGreaterThan(2000000); // > $2 Million
    expect(output.primaryOutput).toBe(output.finalBalance);
  });

  it('handles zero employer match cleanly', () => {
    const output = calculate401kCalculator({
      currentAge: 40,
      retirementAge: 60,
      annualSalary: 100000,
      contributionPercent: 10,
      employerMatchPercent: 0,
      currentBalance: 50000,
      expectedReturn: 6,
    });
    expect(output.yearsInvested).toBe(20);
    expect(output.totalEmployerMatch).toBe(0);
    expect(output.finalBalance).toBeGreaterThan(400000);
  });
});