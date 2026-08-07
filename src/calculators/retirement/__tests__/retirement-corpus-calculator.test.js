import { describe, it, expect } from 'vitest';
import { calculateRetirementCorpusCalculator } from '../retirement-corpus-calculator.js';

describe('Institutional Retirement Corpus Calculator Engine', () => {
  it('calculates inflation-adjusted corpus & readiness score for benchmark (Age 30 to 60, ₹50k/mo expense)', () => {
    const output = calculateRetirementCorpusCalculator({
      currentAge: 30,
      retirementAge: 60,
      lifeExpectancy: 85,
      monthlyExpenses: 50000,
      currentSavings: 500000,
      monthlySip: 10000,
      inflationRate: 6,
      preRetirementReturn: 12,
      postRetirementReturn: 8,
    });

    expect(output.yearsToRetirement).toBe(30);
    expect(output.yearsInRetirement).toBe(25);
    expect(output.futureMonthlyExpense).toBe(287175); // ₹2.87 Lakhs/month at age 60
    expect(output.requiredCorpus).toBeGreaterThan(60000000); // > ₹6 Crores
    expect(output.readinessScore).toBeGreaterThanOrEqual(0);
    expect(output.opportunities.length).toBeGreaterThan(0);
    expect(output.delayOptions.length).toBeGreaterThan(0);
  });

  it('handles zero inflation & high current savings giving 100% readiness score', () => {
    const output = calculateRetirementCorpusCalculator({
      currentAge: 40,
      retirementAge: 60,
      lifeExpectancy: 80,
      monthlyExpenses: 40000,
      currentSavings: 10000000,
      monthlySip: 50000,
      inflationRate: 0,
      preRetirementReturn: 10,
      postRetirementReturn: 8,
    });

    expect(output.futureMonthlyExpense).toBe(40000);
    expect(output.readinessScore).toBe(100);
    expect(output.readinessStatus.level).toBe('Excellent');
    expect(output.corpusGap).toBe(0);
  });

  it('calculates longevity exhaustion age when savings are insufficient', () => {
    const output = calculateRetirementCorpusCalculator({
      currentAge: 50,
      retirementAge: 60,
      lifeExpectancy: 85,
      monthlyExpenses: 100000,
      currentSavings: 100000,
      monthlySip: 5000,
      inflationRate: 7,
      preRetirementReturn: 8,
      postRetirementReturn: 6,
    });

    expect(output.longevity.isExhaustedEarly).toBe(true);
    expect(output.longevity.exhaustionAge).toBeLessThan(85);
  });
});