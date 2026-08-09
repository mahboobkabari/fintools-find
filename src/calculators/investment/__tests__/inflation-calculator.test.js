import { describe, it, expect } from 'vitest';
import { calculateInflationCalculator } from '../inflation-calculator.js';

describe('Flagship Inflation & Purchasing Power Financial Engine', () => {
  it('1. verifies Standard 10-Year Inflation: ₹100,000 @ 6% p.a. for 10 Years', () => {
    const result = calculateInflationCalculator({
      amount: 100000,
      inflationRate: 6.0,
      tenureYears: 10,
    });

    expect(result.amount).toBe(100000);
    expect(result.inflationRate).toBe(6.0);
    expect(result.tenureYears).toBe(10);
    // FV = 100,000 * (1.06)^10 = 179,084.76 -> 179,085
    expect(result.futureCost).toBe(179085);
    expect(result.primaryOutput).toBe(179085);
    expect(result.inflationDelta).toBe(79085);
  });

  it('2. verifies Eroded Purchasing Power: ₹100,000 / (1.06)^10 over 10 Years', () => {
    const result = calculateInflationCalculator({
      amount: 100000,
      inflationRate: 6.0,
      tenureYears: 10,
    });

    // Real PV = 100,000 / (1.06)^10 = 55,839.47 -> 55,839
    expect(result.erodedPurchasingPower).toBe(55839);
    expect(result.purchasingPowerLossPercent).toBeCloseTo(44.16, 1);
  });

  it('3. verifies 5-Year Inflation: ₹100,000 @ 6% p.a. for 5 Years', () => {
    const result = calculateInflationCalculator({
      amount: 100000,
      inflationRate: 6.0,
      tenureYears: 5,
    });

    // FV = 100,000 * (1.06)^5 = 133,822.55 -> 133,823
    expect(result.futureCost).toBe(133823);
  });

  it('4. verifies 15-Year Higher Education Benchmark: ₹25 Lakhs @ 8% p.a.', () => {
    const result = calculateInflationCalculator({
      amount: 2500000,
      inflationRate: 8.0,
      tenureYears: 15,
    });

    // FV = 2,500,000 * (1.08)^15 = 7,930,423
    expect(result.futureCost).toBe(7930423);
  });

  it('5. handles zero inflation rate edge case cleanly (0% inflation)', () => {
    const result = calculateInflationCalculator({
      amount: 100000,
      inflationRate: 0,
      tenureYears: 10,
    });

    expect(result.inflationRate).toBe(0);
    expect(result.futureCost).toBe(100000);
    expect(result.erodedPurchasingPower).toBe(100000);
    expect(result.cumulativeInflationPercent).toBe(0);
    expect(result.inflationDelta).toBe(0);
  });

  it('6. handles high inflation scenario (15% p.a. for 30 Years)', () => {
    const result = calculateInflationCalculator({
      amount: 100000,
      inflationRate: 15.0,
      tenureYears: 30,
    });

    // FV = 100,000 * (1.15)^30 = 6,621,177
    expect(result.futureCost).toBe(6621177);
    expect(result.cumulativeInflationPercent).toBe(6521.18);
  });

  it('7. computes Fisher Real Rate of Return (12% return @ 6% inflation)', () => {
    const result = calculateInflationCalculator({
      amount: 100000,
      inflationRate: 6.0,
      tenureYears: 10,
      investmentReturnRate: 12.0,
    });

    // r_real = ((1.12 / 1.06) - 1) * 100 = 5.66037% -> 5.66%
    expect(result.realReturnRate).toBe(5.66);
  });

  it('8. verifies Nominal Return Equal to Inflation (6% return @ 6% inflation)', () => {
    const result = calculateInflationCalculator({
      amount: 100000,
      inflationRate: 6.0,
      tenureYears: 10,
      investmentReturnRate: 6.0,
    });

    // r_real = ((1.06 / 1.06) - 1) * 100 = 0.0%
    expect(result.realReturnRate).toBe(0.0);
    expect(result.realInvestmentCorpus).toBe(100000);
  });

  it('9. verifies Nominal Return Below Inflation (4% return @ 6% inflation)', () => {
    const result = calculateInflationCalculator({
      amount: 100000,
      inflationRate: 6.0,
      tenureYears: 10,
      investmentReturnRate: 4.0,
    });

    // r_real = ((1.04 / 1.06) - 1) * 100 = -1.8867% -> -1.89%
    expect(result.realReturnRate).toBe(-1.89);
    expect(result.realInvestmentCorpus).toBeLessThan(100000);
  });

  it('10. verifies Nominal Return Above Inflation (15% return @ 6% inflation)', () => {
    const result = calculateInflationCalculator({
      amount: 100000,
      inflationRate: 6.0,
      tenureYears: 10,
      investmentReturnRate: 15.0,
    });

    // r_real = ((1.15 / 1.06) - 1) * 100 = 8.4905% -> 8.49%
    expect(result.realReturnRate).toBe(8.49);
    expect(result.realInvestmentCorpus).toBeGreaterThan(100000);
  });

  it('11. verifies cumulative inflation percentage calculation accuracy', () => {
    const result = calculateInflationCalculator({
      amount: 100000,
      inflationRate: 6.0,
      tenureYears: 10,
    });

    // Cum Infl % = ((1.06)^10 - 1) * 100 = 79.0847% -> 79.08%
    expect(result.cumulativeInflationPercent).toBe(79.08);
  });

  it('12. verifies 10-year annual price growth schedule rollups and final row reconciliation', () => {
    const result = calculateInflationCalculator({
      amount: 100000,
      inflationRate: 6.0,
      tenureYears: 10,
    });

    expect(result.yearlySchedule.length).toBe(10);
    expect(result.yearlySchedule[0].year).toBe(1);
    expect(result.yearlySchedule[0].futureCost).toBe(106000);
    expect(result.yearlySchedule[9].year).toBe(10);
    expect(result.yearlySchedule[9].futureCost).toBe(result.futureCost);
  });

  it('13. calculates fractional inflation rates accurately (5.5% p.a.)', () => {
    const result = calculateInflationCalculator({
      amount: 100000,
      inflationRate: 5.5,
      tenureYears: 10,
    });

    // FV = 100,000 * (1.055)^10 = 170,814.4 -> 170,814
    expect(result.futureCost).toBe(170814);
  });

  it('14. sanitizes negative inputs properly', () => {
    const result = calculateInflationCalculator({
      amount: -50000,
      inflationRate: -5.0,
      tenureYears: -10,
    });

    expect(result.amount).toBe(0);
    expect(result.inflationRate).toBe(0);
    expect(result.tenureYears).toBe(0);
    expect(result.futureCost).toBe(0);
  });

  it('15. handles USD currency mode formatting', () => {
    const result = calculateInflationCalculator({
      amount: 10000,
      currency: 'USD',
    });

    expect(result.currency).toBe('USD');
    expect(result.heroText).toContain('$10,000');
  });
});
