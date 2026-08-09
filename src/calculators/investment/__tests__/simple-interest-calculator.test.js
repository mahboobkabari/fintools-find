import { describe, it, expect } from 'vitest';
import { calculateSimpleInterestCalculator } from '../simple-interest-calculator.js';

describe('Flagship Simple Interest Math Engine', () => {
  it('1. verifies Benchmark Case A: P = 100,000 @ 10% p.a. for 10 Years', () => {
    const result = calculateSimpleInterestCalculator({
      principal: 100000,
      rate: 10.0,
      durationValue: 10,
      durationUnit: 'years',
    });

    expect(result.principal).toBe(100000);
    expect(result.rate).toBe(10.0);
    expect(result.tenureYears).toBe(10);
    // Simple Interest = 100,000 * 0.10 * 10 = 100,000
    expect(result.simpleInterestEarned).toBe(100000);
    expect(result.finalMaturityAmount).toBe(200000);
    expect(result.primaryOutput).toBe(200000);
  });

  it('2. verifies Benchmark Case B: P = 100,000 @ 10% p.a. for 5 Years', () => {
    const result = calculateSimpleInterestCalculator({
      principal: 100000,
      rate: 10.0,
      durationValue: 5,
      durationUnit: 'years',
    });

    // Simple Interest = 100,000 * 0.10 * 5 = 50,000
    expect(result.simpleInterestEarned).toBe(50000);
    expect(result.finalMaturityAmount).toBe(150000);
  });

  it('3. verifies Benchmark Case C: P = 100,000 @ 10% p.a. for 6 Months', () => {
    const result = calculateSimpleInterestCalculator({
      principal: 100000,
      rate: 10.0,
      durationValue: 6,
      durationUnit: 'months',
    });

    expect(result.tenureYears).toBe(0.5);
    // Simple Interest = 100,000 * 0.10 * 0.5 = 5,000
    expect(result.simpleInterestEarned).toBe(5000);
    expect(result.finalMaturityAmount).toBe(105000);
  });

  it('4. verifies Benchmark Case D: P = 100,000 @ 10% p.a. for 180 Days (365-day convention)', () => {
    const result = calculateSimpleInterestCalculator({
      principal: 100000,
      rate: 10.0,
      durationValue: 180,
      durationUnit: 'days',
    });

    expect(result.tenureYears).toBeCloseTo(180 / 365, 4);
    // Simple Interest = 100,000 * 0.10 * (180/365) = 4,931.506 -> 4,932
    expect(result.simpleInterestEarned).toBe(4932);
    expect(result.finalMaturityAmount).toBe(104932);
  });

  it('5. verifies Benchmark Case E: Compound Interest Comparison Delta over 10 Years', () => {
    const result = calculateSimpleInterestCalculator({
      principal: 100000,
      rate: 10.0,
      durationValue: 10,
      durationUnit: 'years',
    });

    // Compound Amount = 100,000 * (1.10)^10 = 259,374
    // Simple Amount = 200,000
    // Compounding Advantage = 259,374 - 200,000 = 59,374
    expect(result.compoundMaturityAmount).toBe(259374);
    expect(result.compoundingAdvantage).toBe(59374);
  });

  it('6. verifies Benchmark Case F: 5% Inflation-Adjusted Purchasing Power Value', () => {
    const result = calculateSimpleInterestCalculator({
      principal: 100000,
      rate: 10.0,
      durationValue: 10,
      durationUnit: 'years',
      inflationRate: 5.0,
    });

    // Real Value = 200,000 / (1.05)^10 = 122,783
    expect(result.purchasingPowerAmount).toBe(122783);
  });

  it('7. tests Days unit conversion (365 days = exactly 1 year)', () => {
    const result = calculateSimpleInterestCalculator({
      principal: 100000,
      rate: 8.0,
      durationValue: 365,
      durationUnit: 'days',
    });

    expect(result.tenureYears).toBe(1);
    expect(result.simpleInterestEarned).toBe(8000);
    expect(result.finalMaturityAmount).toBe(108000);
  });

  it('8. tests Months unit conversion (12 months = exactly 1 year)', () => {
    const result = calculateSimpleInterestCalculator({
      principal: 100000,
      rate: 8.0,
      durationValue: 12,
      durationUnit: 'months',
    });

    expect(result.tenureYears).toBe(1);
    expect(result.simpleInterestEarned).toBe(8000);
    expect(result.finalMaturityAmount).toBe(108000);
  });

  it('9. handles zero interest rate edge case cleanly (0% rate)', () => {
    const result = calculateSimpleInterestCalculator({
      principal: 100000,
      rate: 0,
      durationValue: 5,
    });

    expect(result.rate).toBe(0);
    expect(result.simpleInterestEarned).toBe(0);
    expect(result.finalMaturityAmount).toBe(100000);
    expect(result.compoundingAdvantage).toBe(0);
  });

  it('10. handles zero principal input edge case cleanly (₹0 principal)', () => {
    const result = calculateSimpleInterestCalculator({
      principal: 0,
      rate: 8.0,
      durationValue: 5,
    });

    expect(result.principal).toBe(0);
    expect(result.simpleInterestEarned).toBe(0);
    expect(result.finalMaturityAmount).toBe(0);
    expect(result.compoundMaturityAmount).toBe(0);
  });

  it('11. sanitizes negative inputs properly', () => {
    const result = calculateSimpleInterestCalculator({
      principal: -50000,
      rate: -5.0,
      durationValue: -10,
    });

    expect(result.principal).toBe(0);
    expect(result.rate).toBe(0);
    expect(result.durationValue).toBe(0);
    expect(result.simpleInterestEarned).toBe(0);
  });

  it('12. verifies 5-year annual growth schedule rollups and headline total reconciliation', () => {
    const result = calculateSimpleInterestCalculator({
      principal: 100000,
      rate: 8.0,
      durationValue: 5,
      durationUnit: 'years',
    });

    expect(result.yearlySchedule.length).toBe(5);
    expect(result.yearlySchedule[0].year).toBe(1);
    expect(result.yearlySchedule[0].interestEarned).toBe(8000);
    expect(result.yearlySchedule[4].year).toBe(5);
    expect(result.yearlySchedule[4].endBalance).toBe(140000);
    expect(result.yearlySchedule[4].endBalance).toBe(result.finalMaturityAmount);
  });

  it('13. computes scenario matrix comparison outputs', () => {
    const result = calculateSimpleInterestCalculator({
      principal: 100000,
      rate: 8.0,
      durationValue: 5,
    });

    expect(result.scenarios.length).toBe(4);
    expect(result.scenarios[0].id).toBe('baseline');
    expect(result.scenarios[1].id).toBe('double_principal');
    expect(result.scenarios[2].id).toBe('higher_rate');
    expect(result.scenarios[3].id).toBe('longer_tenure');
  });

  it('14. handles USD currency mode formatting', () => {
    const result = calculateSimpleInterestCalculator({
      principal: 10000,
      currency: 'USD',
    });

    expect(result.currency).toBe('USD');
    expect(result.heroText).toContain('$10,000');
  });

  it('15. verifies high rate (25% p.a.) long duration (30 Yrs) accuracy', () => {
    const result = calculateSimpleInterestCalculator({
      principal: 100000,
      rate: 25.0,
      durationValue: 30,
      durationUnit: 'years',
    });

    // Simple Interest = 100,000 * 0.25 * 30 = 750,000
    expect(result.simpleInterestEarned).toBe(750000);
    expect(result.finalMaturityAmount).toBe(850000);
  });
});
