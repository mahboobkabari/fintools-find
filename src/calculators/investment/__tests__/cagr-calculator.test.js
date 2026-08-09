import { describe, it, expect } from 'vitest';
import { calculateCagr } from '../cagr-calculator.js';
import {
  calculateCagrCore,
  calculateTargetFinalValue,
  calculateRequiredInitial,
} from '../../core/investmentUtils.js';

describe('Institutional CAGR Calculator Engine Tests', () => {
  it('verifies standard geometric CAGR benchmark (Initial 1L, Final 2.5L, 5 Years => 20.11% CAGR)', () => {
    const res = calculateCagr({
      initialValue: 100000,
      finalValue: 250000,
      tenureYears: 5,
      inflationRate: 6,
    });

    expect(res.cagrPct).toBe(20.11);
    expect(res.absoluteGain).toBe(150000);
    expect(res.absoluteGrowthPct).toBe(150);
    expect(res.wealthMultiplier).toBe(2.5);
    expect(res.primaryOutput).toBe(20.11);
  });

  it('verifies 1-year duration where CAGR equals Absolute Return', () => {
    const res = calculateCagr({
      initialValue: 100000,
      finalValue: 112000,
      tenureYears: 1,
    });

    expect(res.cagrPct).toBe(12);
    expect(res.absoluteGrowthPct).toBe(12);
  });

  it('verifies fractional duration (2.5 years)', () => {
    const res = calculateCagr({
      initialValue: 100000,
      finalValue: 130000,
      tenureYears: 2.5,
    });

    expect(res.cagrPct).toBeGreaterThan(0);
    expect(Number.isNaN(res.cagrPct)).toBe(false);
  });

  it('verifies Capital Loss scenario (Initial 1L, Final 80k, 5 Years => Negative CAGR)', () => {
    const res = calculateCagr({
      initialValue: 100000,
      finalValue: 80000,
      tenureYears: 5,
    });

    expect(res.cagrPct).toBeLessThan(0);
    expect(res.absoluteGain).toBe(-20000);
    expect(res.healthStatus).toBe('Capital Loss Scenario');
    expect(Number.isNaN(res.cagrPct)).toBe(false);
  });

  it('verifies Fisher Real CAGR equation (12% CAGR, 6% Inflation => 5.66% Real CAGR)', () => {
    const res = calculateCagr({
      initialValue: 100000,
      finalValue: 176234, // ~12% CAGR over 5 yrs
      tenureYears: 5,
      inflationRate: 6,
    });

    // Real Rate = (1.12 / 1.06 - 1) * 100 = 5.66%
    expect(res.realCagrPct).toBeCloseTo(5.66, 1);
  });

  it('verifies Benchmark Comparison (Outperformed vs Underperformed)', () => {
    const resOutperform = calculateCagr({
      initialValue: 100000,
      finalValue: 300000,
      tenureYears: 5,
      selectedBenchmarkId: 'fixedDeposit', // 7% benchmark
    });
    expect(resOutperform.benchmarkStatus).toBe('Outperformed');

    const resUnderperform = calculateCagr({
      initialValue: 100000,
      finalValue: 120000,
      tenureYears: 5,
      selectedBenchmarkId: 'longTermEquity', // 14.5% benchmark
    });
    expect(resUnderperform.benchmarkStatus).toBe('Underperformed');
  });

  it('verifies 4-scenario simulator outputs', () => {
    const res = calculateCagr({
      initialValue: 100000,
      finalValue: 250000,
      tenureYears: 5,
    });

    expect(res.scenarios.length).toBe(4);
    expect(res.scenarios[0].id).toBe('current');
    expect(res.scenarios[1].id).toBe('plus2years');
    expect(res.scenarios[2].id).toBe('plus2percent');
    expect(res.scenarios[3].id).toBe('benchmark');

    expect(res.scenarios[1].finalValue).toBeGreaterThan(res.scenarios[0].finalValue);
  });

  it('tests edge cases: zero initial value, zero final value, invalid inputs without NaN', () => {
    const resZeroInit = calculateCagr({ initialValue: 0, finalValue: 100000, tenureYears: 5 });
    expect(Number.isNaN(resZeroInit.cagrPct)).toBe(false);

    const resZeroFinal = calculateCagr({ initialValue: 100000, finalValue: 0, tenureYears: 5 });
    expect(resZeroFinal.cagrPct).toBe(-100);
    expect(Number.isNaN(resZeroFinal.cagrPct)).toBe(false);

    const resInvalid = calculateCagr({ initialValue: 'invalid', finalValue: null, tenureYears: -2 });
    expect(Number.isNaN(resInvalid.cagrPct)).toBe(false);
  });

  it('verifies pure investmentUtils helper functions (calculateCagrCore, calculateTargetFinalValue, calculateRequiredInitial)', () => {
    const core = calculateCagrCore({ initialValue: 100000, finalValue: 200000, tenureYears: 10 });
    expect(core.cagrPct).toBe(7.18);

    const targetVal = calculateTargetFinalValue({ initialValue: 100000, targetCagrPct: 12, tenureYears: 5 });
    expect(targetVal.finalValue).toBe(176234);

    const reqInit = calculateRequiredInitial({ finalValue: 176234, targetCagrPct: 12, tenureYears: 5 });
    expect(reqInit.requiredInitial).toBe(100000);
  });
});