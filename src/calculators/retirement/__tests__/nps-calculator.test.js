import { describe, it, expect } from 'vitest';
import { calculateNpsCalculator } from '../nps-calculator.js';

describe('Flagship NPS Retirement Decision Engine Math Suite', () => {
  it('calculates benchmark NPS corpus and pension for ₹10k/mo from age 30 to 60', () => {
    const result = calculateNpsCalculator({
      monthlyInvestment: 10000,
      currentAge: 30,
      retirementAge: 60,
      expectedReturn: 10,
      annuityPercent: 40,
      expectedAnnuityRate: 6,
      inflationRate: 6,
      currentMonthlyIncome: 50000,
    });

    expect(result.yearsInvested).toBe(30);
    expect(result.totalInvestment).toBe(3600000);
    expect(result.totalMaturityCorpus).toBeGreaterThan(20000000);
    expect(result.annuityCorpus).toBe(Math.round(result.totalMaturityCorpus * 0.40));
    expect(result.lumpSumAmount).toBe(result.totalMaturityCorpus - result.annuityCorpus);
    expect(result.monthlyPension).toBeGreaterThan(40000);
    expect(result.readinessScore).toBeGreaterThan(0);
    expect(result.replacementRatio).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.yearlyBreakdown.length).toBe(30);
  });

  it('handles 100% annuity allocation', () => {
    const result = calculateNpsCalculator({
      monthlyInvestment: 5000,
      currentAge: 40,
      retirementAge: 60,
      expectedReturn: 10,
      annuityPercent: 100,
      expectedAnnuityRate: 6,
    });

    expect(result.yearsInvested).toBe(20);
    expect(result.lumpSumAmount).toBe(0);
    expect(result.annuityCorpus).toBe(result.totalMaturityCorpus);
  });

  it('handles late career (age 50, retire at 60)', () => {
    const result = calculateNpsCalculator({
      monthlyInvestment: 25000,
      currentAge: 50,
      retirementAge: 60,
      expectedReturn: 8,
      annuityPercent: 40,
      expectedAnnuityRate: 6,
    });

    expect(result.yearsInvested).toBe(10);
    expect(result.totalInvestment).toBe(3000000);
    expect(result.totalMaturityCorpus).toBeGreaterThan(3000000);
    expect(result.increaseScenarios.length).toBeGreaterThan(0);
  });

  it('handles zero return edge case gracefully', () => {
    const result = calculateNpsCalculator({
      monthlyInvestment: 10000,
      currentAge: 30,
      retirementAge: 60,
      expectedReturn: 0,
      annuityPercent: 40,
      expectedAnnuityRate: 6,
    });

    // Engine clamps min return to 1%, so corpus > total contributions
    expect(result.totalMaturityCorpus).toBeGreaterThan(result.totalInvestment);
    expect(result.interestEarned).toBeGreaterThan(0);
  });

  it('handles high return scenario', () => {
    const result = calculateNpsCalculator({
      monthlyInvestment: 10000,
      currentAge: 25,
      retirementAge: 60,
      expectedReturn: 14,
      annuityPercent: 40,
      expectedAnnuityRate: 8,
    });

    expect(result.yearsInvested).toBe(35);
    expect(result.multiplier).toBeGreaterThan(10);
    expect(result.monthlyPension).toBeGreaterThan(100000);
  });

  it('computes inflation-adjusted values and replacement ratio', () => {
    const result = calculateNpsCalculator({
      monthlyInvestment: 15000,
      currentAge: 35,
      retirementAge: 60,
      expectedReturn: 10,
      annuityPercent: 40,
      expectedAnnuityRate: 6,
      inflationRate: 7,
      currentMonthlyIncome: 80000,
    });

    expect(result.inflationAdjusted.realValue).toBeLessThan(result.totalMaturityCorpus);
    expect(result.inflationAdjusted.purchasingPowerLoss).toBeGreaterThan(0);
    expect(result.realPensionMonthly).toBeLessThan(result.monthlyPension);
    expect(result.replacementRatio).toBeGreaterThan(0);
  });
});