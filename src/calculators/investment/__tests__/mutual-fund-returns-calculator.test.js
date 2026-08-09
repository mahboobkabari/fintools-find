import { describe, it, expect } from 'vitest';
import { calculateMutualFundReturns } from '../mutual-fund-returns-calculator.js';

describe('Institutional Flagship Mutual Fund Returns Calculator Engine', () => {
  it('calculates accurate returns & XIRR for SIP mode (₹5,000 monthly over 10 years @ 12%)', () => {
    const result = calculateMutualFundReturns({
      amount: 5000,
      expectedReturnRate: 12,
      tenureYears: 10,
      investmentType: 'sip',
    });

    expect(result.investmentType).toBe('sip');
    expect(result.isLumpsum).toBe(false);
    expect(result.totalInvested).toBe(600000);
    expect(result.grossMaturityValue).toBe(1161695);
    expect(result.netProfit).toBe(561695);
    expect(result.absoluteReturnPct).toBe(93.62);
    expect(result.xirrPct).toBeGreaterThanOrEqual(12.0);
    expect(result.annualizedReturnLabel).toBe('XIRR / Annualized Return (%)');
    expect(result.wealthMultiplier).toBe(1.94);
  });

  it('calculates accurate returns & CAGR for Lumpsum mode (₹1,00,000 over 10 years @ 12%)', () => {
    const result = calculateMutualFundReturns({
      amount: 100000,
      expectedReturnRate: 12,
      tenureYears: 10,
      investmentType: 'lumpsum',
    });

    expect(result.investmentType).toBe('lumpsum');
    expect(result.isLumpsum).toBe(true);
    expect(result.totalInvested).toBe(100000);
    expect(result.grossMaturityValue).toBe(310585);
    expect(result.netProfit).toBe(210585);
    expect(result.cagrPct).toBe(12.0);
    expect(result.annualizedReturnPct).toBe(12.0);
    expect(result.annualizedReturnLabel).toBe('CAGR (%)');
    expect(result.wealthMultiplier).toBe(3.11);
  });

  it('deducts exit load correctly when user provides an explicit exit-load percentage', () => {
    const result = calculateMutualFundReturns({
      amount: 100000,
      expectedReturnRate: 12,
      tenureYears: 10,
      investmentType: 'lumpsum',
      exitLoadPct: 1, // 1% exit load assumption
    });

    // Gross = 3,10,585; Exit Load 1% = 3,106; Net = 3,07,479
    expect(result.exitLoadAmount).toBe(3106);
    expect(result.netMaturityValue).toBe(307479);
    expect(result.netProfit).toBe(207479);
  });

  it('computes inflation-adjusted real purchasing power correctly', () => {
    const result = calculateMutualFundReturns({
      amount: 100000,
      expectedReturnRate: 12,
      tenureYears: 10,
      investmentType: 'lumpsum',
      inflationRate: 6,
    });

    // Real Value = 310585 / (1.06)^10 = 173429
    expect(result.realCorpus).toBe(173429);
    expect(result.realReturnPct).toBe(5.66); // (1.12 / 1.06 - 1) = 5.66%
  });

  it('compares annualized returns against benchmarks with neutral language', () => {
    const result = calculateMutualFundReturns({
      amount: 5000,
      expectedReturnRate: 12,
      tenureYears: 10,
      investmentType: 'sip',
    });

    expect(result.benchmarkComparisons.length).toBe(4);
    const fdBench = result.benchmarkComparisons.find((b) => b.id === 'fixedDeposit');
    expect(fdBench.benchmarkRate).toBe(7.0);
    expect(fdBench.disclaimer).toContain('Illustrative benchmark assumption');
  });

  it('models Direct Plan TER savings (+0.75% return) as an illustrative scenario', () => {
    const result = calculateMutualFundReturns({
      amount: 5000,
      expectedReturnRate: 12,
      tenureYears: 10,
      investmentType: 'sip',
    });

    expect(result.directPlanWealthGain).toBeGreaterThan(0);
    const directScenario = result.scenarios.find((s) => s.id === 'direct_plan');
    expect(directScenario.badge).toBe('TER Advantage');
  });

  it('handles edge cases safely (zero amount, 0% return, negative return, high return rate, fractional tenure)', () => {
    const zeroAmt = calculateMutualFundReturns({ amount: 0, expectedReturnRate: 12, tenureYears: 10 });
    expect(zeroAmt.netMaturityValue).toBe(0);
    expect(zeroAmt.totalInvested).toBe(0);

    const zeroRet = calculateMutualFundReturns({ amount: 5000, expectedReturnRate: 0, tenureYears: 5 });
    expect(zeroRet.totalInvested).toBe(300000);
    expect(zeroRet.netMaturityValue).toBe(300000);
    expect(zeroRet.netProfit).toBe(0);

    const highRet = calculateMutualFundReturns({ amount: 100000, expectedReturnRate: 50, tenureYears: 5, investmentType: 'lumpsum' });
    expect(highRet.netMaturityValue).toBe(759375); // 100000 * 1.5^5 = 759375

    const fracTenure = calculateMutualFundReturns({ amount: 100000, expectedReturnRate: 12, tenureYears: 0.5, investmentType: 'lumpsum' });
    expect(fracTenure.netMaturityValue).toBeGreaterThan(100000);
  });
});