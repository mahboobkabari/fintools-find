import { describe, it, expect } from 'vitest';
import { calculateCompoundInterestCalculator } from '../compound-interest-calculator.js';

describe('Flagship Compound Interest Math Engine', () => {
  it('1. verifies Annual compounding of ₹100,000 principal at 10% p.a. for 10 years (No monthly deposit)', () => {
    const result = calculateCompoundInterestCalculator({
      principal: 100000,
      monthlyDeposit: 0,
      rate: 10.0,
      tenureYears: 10,
      compoundingFrequency: 'annually',
    });

    expect(result.principal).toBe(100000);
    expect(result.totalMonthlyDeposits).toBe(0);
    expect(result.totalPrincipal).toBe(100000);
    // 100,000 * (1.10)^10 = 259,374.24 -> 259,374
    expect(result.finalCorpus).toBe(259374);
    expect(result.totalInterestEarned).toBe(159374);
    expect(result.effectiveAnnualRate).toBe(10.0);
  });

  it('2. verifies Monthly compounding of ₹100,000 principal at 10% p.a. for 10 years (No monthly deposit)', () => {
    const result = calculateCompoundInterestCalculator({
      principal: 100000,
      monthlyDeposit: 0,
      rate: 10.0,
      tenureYears: 10,
      compoundingFrequency: 'monthly',
    });

    // 100,000 * (1 + 0.10/12)^120 = 270,704.14 -> 270,704
    expect(result.finalCorpus).toBe(270704);
    expect(result.totalInterestEarned).toBe(170704);
    expect(result.effectiveAnnualRate).toBe(10.471);
  });

  it('3. verifies Daily compounding (365 days) of ₹100,000 principal at 10% p.a. for 10 years', () => {
    const result = calculateCompoundInterestCalculator({
      principal: 100000,
      monthlyDeposit: 0,
      rate: 10.0,
      tenureYears: 10,
      compoundingFrequency: 'daily',
    });

    // 100,000 * (1 + 0.10/365)^3650 = 271,790.95 -> 271,791
    expect(result.finalCorpus).toBe(271791);
    expect(result.totalInterestEarned).toBe(171791);
    expect(result.effectiveAnnualRate).toBe(10.516);
  });

  it('4. verifies Quarterly compounding of ₹100,000 principal at 10% p.a. for 10 years', () => {
    const result = calculateCompoundInterestCalculator({
      principal: 100000,
      monthlyDeposit: 0,
      rate: 10.0,
      tenureYears: 10,
      compoundingFrequency: 'quarterly',
    });

    // 100,000 * (1 + 0.10/4)^40 = 268,506.38 -> 268,506
    expect(result.finalCorpus).toBe(268506);
    expect(result.effectiveAnnualRate).toBe(10.381);
  });

  it('5. verifies Semi-Annual compounding of ₹100,000 principal at 10% p.a. for 10 years', () => {
    const result = calculateCompoundInterestCalculator({
      principal: 100000,
      monthlyDeposit: 0,
      rate: 10.0,
      tenureYears: 10,
      compoundingFrequency: 'semi-annually',
    });

    // 100,000 * (1 + 0.10/2)^20 = 265,329.77 -> 265,330
    expect(result.finalCorpus).toBe(265330);
    expect(result.effectiveAnnualRate).toBe(10.25);
  });

  it('6. verifies Annual compounding with monthly recurring contributions (₹100k + ₹5k/mo @ 10%)', () => {
    const result = calculateCompoundInterestCalculator({
      principal: 100000,
      monthlyDeposit: 5000,
      rate: 10.0,
      tenureYears: 10,
      compoundingFrequency: 'annually',
      contributionTiming: 'end',
    });

    expect(result.totalPrincipal).toBe(700000); // 100k + 5k * 120 = 700k
    expect(result.finalCorpus).toBeGreaterThan(result.totalPrincipal);
    expect(result.yearlySchedule.length).toBe(10);
    expect(result.yearlySchedule[9].endBalance).toBe(result.finalCorpus);
  });

  it('7. verifies Effective Annual Rate (EAR / APY) precision across all 5 frequencies', () => {
    const d = calculateCompoundInterestCalculator({ rate: 10, compoundingFrequency: 'daily' });
    const m = calculateCompoundInterestCalculator({ rate: 10, compoundingFrequency: 'monthly' });
    const q = calculateCompoundInterestCalculator({ rate: 10, compoundingFrequency: 'quarterly' });
    const s = calculateCompoundInterestCalculator({ rate: 10, compoundingFrequency: 'semi-annually' });
    const a = calculateCompoundInterestCalculator({ rate: 10, compoundingFrequency: 'annually' });

    expect(d.effectiveAnnualRate).toBe(10.516);
    expect(m.effectiveAnnualRate).toBe(10.471);
    expect(q.effectiveAnnualRate).toBe(10.381);
    expect(s.effectiveAnnualRate).toBe(10.25);
    expect(a.effectiveAnnualRate).toBe(10.0);
  });

  it('8. computes zero principal input with monthly deposit only (₹0 + ₹5,000/mo @ 10%)', () => {
    const result = calculateCompoundInterestCalculator({
      principal: 0,
      monthlyDeposit: 5000,
      rate: 10.0,
      tenureYears: 10,
    });

    expect(result.principal).toBe(0);
    expect(result.totalPrincipal).toBe(600000); // 5,000 * 120
    expect(result.finalCorpus).toBeGreaterThan(600000);
    expect(result.totalInterestEarned).toBeGreaterThan(0);
  });

  it('9. computes zero monthly deposit with principal input only (₹100,000 + ₹0/mo @ 10%)', () => {
    const result = calculateCompoundInterestCalculator({
      principal: 100000,
      monthlyDeposit: 0,
      rate: 10.0,
      tenureYears: 10,
    });

    expect(result.totalMonthlyDeposits).toBe(0);
    expect(result.totalPrincipal).toBe(100000);
    expect(result.finalCorpus).toBe(259374);
  });

  it('10. verifies Beginning vs End of month contribution timing difference', () => {
    const endResult = calculateCompoundInterestCalculator({
      principal: 100000,
      monthlyDeposit: 5000,
      rate: 10.0,
      tenureYears: 10,
      contributionTiming: 'end',
    });

    const begResult = calculateCompoundInterestCalculator({
      principal: 100000,
      monthlyDeposit: 5000,
      rate: 10.0,
      tenureYears: 10,
      contributionTiming: 'beginning',
    });

    expect(begResult.finalCorpus).toBeGreaterThan(endResult.finalCorpus);
  });

  it('11. verifies 10-year annual compounding schedule rollups and headline total reconciliation', () => {
    const result = calculateCompoundInterestCalculator({
      principal: 100000,
      monthlyDeposit: 5000,
      rate: 10.0,
      tenureYears: 10,
    });

    expect(result.yearlySchedule.length).toBe(10);
    expect(result.yearlySchedule[0].year).toBe(1);
    expect(result.yearlySchedule[9].year).toBe(10);
    expect(result.yearlySchedule[9].endBalance).toBe(result.finalCorpus);
  });

  it('12. computes 5% inflation-adjusted real purchasing power final corpus', () => {
    const result = calculateCompoundInterestCalculator({
      principal: 100000,
      monthlyDeposit: 0,
      rate: 10.0,
      tenureYears: 10,
      compoundingFrequency: 'annually',
      inflationRate: 5.0,
    });

    // 259,374.25 / (1.05)^10 = 159,233
    expect(result.purchasingPowerCorpus).toBe(159233);
  });

  it('13. handles 0% interest rate edge case cleanly', () => {
    const result = calculateCompoundInterestCalculator({
      principal: 100000,
      monthlyDeposit: 5000,
      rate: 0,
      tenureYears: 10,
    });

    expect(result.rate).toBe(0);
    expect(result.effectiveAnnualRate).toBe(0);
    expect(result.totalPrincipal).toBe(700000);
    expect(result.finalCorpus).toBe(700000);
    expect(result.totalInterestEarned).toBe(0);
  });

  it('14. computes scenario matrix comparison outputs', () => {
    const result = calculateCompoundInterestCalculator({
      principal: 100000,
      monthlyDeposit: 5000,
      rate: 10.0,
      tenureYears: 10,
    });

    expect(result.scenarios.length).toBe(4);
    expect(result.scenarios[0].id).toBe('baseline');
    expect(result.scenarios[1].id).toBe('double_deposit');
    expect(result.scenarios[2].id).toBe('higher_rate');
    expect(result.scenarios[3].id).toBe('longer_tenure');
  });

  it('15. handles USD currency mode formatting', () => {
    const result = calculateCompoundInterestCalculator({
      principal: 10000,
      currency: 'USD',
    });

    expect(result.currency).toBe('USD');
    expect(result.heroText).toContain('$10,000');
  });
});
