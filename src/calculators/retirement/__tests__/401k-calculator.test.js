import { describe, it, expect } from 'vitest';
import { calculate401kCalculator } from '../401k-calculator.js';

describe('Flagship 401(k) Retirement Math Engine', () => {
  it('1. calculates standard 401(k) accumulation ($90k salary, 35 yrs, 50% match up to 6%)', () => {
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
    expect(output.yearlyRows.length).toBe(35);
  });

  it('2. verifies employer match calculation', () => {
    const output = calculate401kCalculator({
      currentAge: 30,
      retirementAge: 31,
      annualSalary: 100000,
      contributionPercent: 6,
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      currentBalance: 0,
      expectedReturn: 0,
      annualSalaryIncrease: 0,
    });

    expect(output.totalEmployeeContributions).toBe(6000);
    expect(output.totalEmployerMatch).toBe(3000); // 50% of 6% of $100k
    expect(output.finalBalance).toBe(9000);
    expect(output.isMatchMaximized).toBe(true);
  });

  it('3. detects missed employer match when contributing below match limit', () => {
    const output = calculate401kCalculator({
      currentAge: 30,
      retirementAge: 31,
      annualSalary: 100000,
      contributionPercent: 3, // Only 3% contributed while match cap is 6%
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      currentBalance: 0,
      expectedReturn: 0,
      annualSalaryIncrease: 0,
    });

    expect(output.totalEmployeeContributions).toBe(3000);
    expect(output.totalEmployerMatch).toBe(1500);
    expect(output.missedEmployerMatch).toBe(1500); // Missed $1,500 of potential match
    expect(output.isMatchMaximized).toBe(false);
  });

  it('4. enforces IRS annual elective deferral cap ($23,500)', () => {
    const output = calculate401kCalculator({
      currentAge: 30,
      retirementAge: 31,
      annualSalary: 300000,
      contributionPercent: 20, // 20% of $300k = $60,000 (exceeds $23,500 limit)
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      currentBalance: 0,
      expectedReturn: 0,
      annualSalaryIncrease: 0,
    });

    expect(output.totalEmployeeContributions).toBe(23500); // Capped at $23,500
  });

  it('5. applies age 50+ catch-up contribution threshold ($31,000 cap)', () => {
    const output = calculate401kCalculator({
      currentAge: 52, // Age 50+
      retirementAge: 53,
      annualSalary: 300000,
      contributionPercent: 20, // 20% of $300k = $60k
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      currentBalance: 0,
      expectedReturn: 0,
      annualSalaryIncrease: 0,
    });

    expect(output.totalEmployeeContributions).toBe(31000); // Base $23.5k + Catch-up $7.5k = $31,000
    expect(output.yearlyRows[0].isCatchUpEligible).toBe(true);
  });

  it('6. calculates Traditional Pre-Tax vs Roth 401(k) tax comparison', () => {
    const output = calculate401kCalculator({
      currentAge: 30,
      retirementAge: 65,
      annualSalary: 100000,
      contributionPercent: 10,
      currentTaxRate: 24,
      retirementTaxRate: 15,
    });

    expect(output.tradAfterTaxCorpus).toBeLessThan(output.finalBalance);
    expect(output.rothAfterTaxCorpus).toBeGreaterThan(0);
    expect(output.recommendedAccountType).toBe('Traditional Pre-Tax 401(k)');
  });

  it('7. models annual salary growth escalation', () => {
    const flatSalary = calculate401kCalculator({
      currentAge: 30,
      retirementAge: 40,
      annualSalary: 100000,
      contributionPercent: 10,
      annualSalaryIncrease: 0,
    });

    const growingSalary = calculate401kCalculator({
      currentAge: 30,
      retirementAge: 40,
      annualSalary: 100000,
      contributionPercent: 10,
      annualSalaryIncrease: 5,
    });

    expect(growingSalary.totalEmployeeContributions).toBeGreaterThan(flatSalary.totalEmployeeContributions);
    expect(growingSalary.finalBalance).toBeGreaterThan(flatSalary.finalBalance);
  });

  it('8. handles zero investment return case (0% return)', () => {
    const output = calculate401kCalculator({
      currentAge: 30,
      retirementAge: 40,
      annualSalary: 100000,
      contributionPercent: 10,
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      currentBalance: 10000,
      expectedReturn: 0,
      annualSalaryIncrease: 0,
    });

    expect(output.totalGrowth).toBe(0);
    expect(output.finalBalance).toBe(10000 + (10000 + 3000) * 10);
  });

  it('9. generates scenario matrix comparison grid', () => {
    const output = calculate401kCalculator({
      currentAge: 30,
      retirementAge: 65,
      annualSalary: 90000,
    });

    expect(output.scenarios.length).toBe(4);
    expect(output.scenarios[1].id).toBe('plus_2_pct');
  });

  it('10. handles zero salary and zero balance edge cases without NaN or Infinity', () => {
    const output = calculate401kCalculator({
      annualSalary: 0,
      currentBalance: 0,
    });

    expect(output.finalBalance).toBe(0);
    expect(output.totalContributions).toBe(0);
    expect(Number.isNaN(output.finalBalance)).toBe(false);
    expect(output.heroText).toContain('Please enter a valid salary');
  });
});