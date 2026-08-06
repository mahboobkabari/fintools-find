import { describe, it, expect } from 'vitest';
import { calculateRetirementCorpusCalculator } from '../retirement-corpus-calculator.js';

describe('Retirement Corpus Calculator Engine', () => {
  it('calculates inflation-adjusted corpus correctly for benchmark (Age 30 to 60, ₹50k/mo expense)', () => {
    const output = calculateRetirementCorpusCalculator({
      currentAge: 30,
      retirementAge: 60,
      lifeExpectancy: 85,
      monthlyExpenses: 50000,
      inflationRate: 6,
      preRetirementReturn: 12,
      postRetirementReturn: 8,
    });
    expect(output.yearsToRetirement).toBe(30);
    expect(output.yearsInRetirement).toBe(25);
    expect(output.futureMonthlyExpense).toBe(287175); // ₹2.87 Lakhs/month at age 60
    expect(output.requiredCorpus).toBeGreaterThan(60000000); // > ₹6 Crores
    expect(output.requiredMonthlySip).toBeGreaterThan(15000); // > ₹15k/mo SIP needed
  });

  it('handles 0% inflation cleanly', () => {
    const output = calculateRetirementCorpusCalculator({
      currentAge: 40,
      retirementAge: 60,
      lifeExpectancy: 80,
      monthlyExpenses: 40000,
      inflationRate: 0,
      preRetirementReturn: 10,
      postRetirementReturn: 8,
    });
    expect(output.futureMonthlyExpense).toBe(40000);
    expect(output.yearsToRetirement).toBe(20);
    expect(output.yearsInRetirement).toBe(20);
  });
});