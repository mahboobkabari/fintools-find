import { describe, it, expect } from 'vitest';
import { calculateKvpCalculator } from '../kvp-calculator.js';

describe('Flagship Kisan Vikas Patra (KVP) Math Engine', () => {
  it('1. calculates basic 115-month doubling payout for ₹1 Lakh deposit', () => {
    const result = calculateKvpCalculator({
      depositAmount: 100000,
      rate: 7.5,
    });

    expect(result.depositAmount).toBe(100000);
    expect(result.rate).toBe(7.5);
    expect(result.tenureMonths).toBe(115);
    // Principal doubles in 115 months: ₹100,000 -> ₹200,000
    expect(result.maturityAmount).toBe(200000);
    expect(result.primaryOutput).toBe(200000);
    expect(result.totalInterestEarned).toBe(100000); // 100% interest
  });

  it('2. handles minimum statutory deposit (₹1,000)', () => {
    const result = calculateKvpCalculator({
      depositAmount: 1000,
      rate: 7.5,
    });

    expect(result.depositAmount).toBe(1000);
    expect(result.maturityAmount).toBe(2000);
    expect(result.totalInterestEarned).toBe(1000);
  });

  it('3. handles large deposit amount (₹10 Lakhs) with no upper limit cap', () => {
    const result = calculateKvpCalculator({
      depositAmount: 1000000,
      rate: 7.5,
    });

    expect(result.depositAmount).toBe(1000000);
    expect(result.maturityAmount).toBe(2000000);
    expect(result.totalInterestEarned).toBe(1000000);
  });

  it('4. computes premature encashment table lookup after 30 months lock-in (30 Months)', () => {
    const result = calculateKvpCalculator({
      depositAmount: 100000, // ₹1 Lakh
    });

    const encash30 = result.prematureEncashmentSchedule.find((item) => item.months === 30);
    expect(encash30).toBeDefined();
    expect(encash30.isLockInPassed).toBe(true);
    expect(encash30.payoutPer1000).toBe(1154);
    expect(encash30.totalPayout).toBe(115400); // ₹100k * 1.154
    expect(encash30.interestEarned).toBe(15400);
  });

  it('5. computes premature encashment table lookup at 60 months (5 Years)', () => {
    const result = calculateKvpCalculator({
      depositAmount: 100000,
    });

    const encash60 = result.prematureEncashmentSchedule.find((item) => item.months === 60);
    expect(encash60).toBeDefined();
    expect(encash60.payoutPer1000).toBe(1334);
    expect(encash60.totalPayout).toBe(133400);
    expect(encash60.interestEarned).toBe(33400);
  });

  it('6. verifies full maturity encashment at 115 months (Month 115)', () => {
    const result = calculateKvpCalculator({
      depositAmount: 100000,
    });

    const encash115 = result.prematureEncashmentSchedule.find((item) => item.months === 115);
    expect(encash115).toBeDefined();
    expect(encash115.payoutPer1000).toBe(2000);
    expect(encash115.totalPayout).toBe(200000);
  });

  it('7. calculates 10-year compounding schedule rollups', () => {
    const result = calculateKvpCalculator({
      depositAmount: 100000,
      rate: 7.5,
    });

    expect(result.yearlySchedule.length).toBe(10);
    expect(result.yearlySchedule[0].year).toBe(1);
    expect(result.yearlySchedule[0].interestEarned).toBe(7500); // 7.5% of ₹100k
    expect(result.yearlySchedule[0].endBalance).toBe(107500);

    expect(result.yearlySchedule[9].year).toBe(10);
    expect(result.yearlySchedule[9].isMaturityRow).toBe(true);
    expect(result.yearlySchedule[9].endBalance).toBe(200000);
  });

  it('8. audits taxable annual income estimate under 30% marginal tax slab', () => {
    const result = calculateKvpCalculator({
      depositAmount: 100000,
      marginalTaxRate: 30,
    });

    // Average annual interest = ₹100,000 / (115/12) = ₹10,434.78
    // Annual tax @ 30% = ₹3,130
    expect(result.annualTaxEstimate).toBe(3130);
  });

  it('9. calculates KVP vs 5-Year Bank Fixed Deposit (6.75%) comparison', () => {
    const result = calculateKvpCalculator({
      depositAmount: 100000,
      rate: 7.5,
      expectedFdRate: 6.75,
    });

    expect(result.maturityAmount).toBe(200000);
    expect(result.fdCorpus).toBeLessThan(result.maturityAmount);
    expect(result.kvpVsFdDelta).toBeGreaterThan(0);
  });

  it('10. calculates KVP vs National Savings Certificate (NSC 5Y @ 7.7%) comparison', () => {
    const result = calculateKvpCalculator({
      depositAmount: 100000,
      nscRate: 7.7,
    });

    // NSC 5Y @ 7.7% compounded annually: ₹100,000 * (1.077)^5 = ₹144,903
    expect(result.nsc5YCorpus).toBe(144903);
  });

  it('11. computes 115-month inflation-adjusted real purchasing power payout', () => {
    const result = calculateKvpCalculator({
      depositAmount: 100000,
      rate: 7.5,
      inflationRate: 5.0,
    });

    // ₹200,000 / (1.05)^(115/12) = ₹125,304
    expect(result.purchasingPowerMaturity).toBe(125304);
  });

  it('12. handles zero deposit edge case cleanly', () => {
    const result = calculateKvpCalculator({
      depositAmount: 0,
      rate: 7.5,
    });

    expect(result.depositAmount).toBe(0);
    expect(result.maturityAmount).toBe(0);
    expect(result.totalInterestEarned).toBe(0);
    expect(Number.isNaN(result.maturityAmount)).toBe(false);
    expect(result.heroText).toContain('Please enter a valid deposit amount');
  });

  it('13. handles negative deposit input sanitization', () => {
    const result = calculateKvpCalculator({
      depositAmount: -50000,
      rate: 7.5,
    });

    expect(result.depositAmount).toBe(0);
    expect(result.maturityAmount).toBe(0);
  });

  it('14. computes scenario matrix comparison outputs', () => {
    const result = calculateKvpCalculator({
      depositAmount: 100000,
      rate: 7.5,
    });

    expect(result.scenarios.length).toBe(4);
    expect(result.scenarios[0].deposit).toBe(100000);
    expect(result.scenarios[1].deposit).toBe(100000);
    expect(result.scenarios[2].deposit).toBe(500000);
    expect(result.scenarios[3].deposit).toBe(1000000);
  });

  it('15. handles USD currency mode formatting', () => {
    const result = calculateKvpCalculator({
      depositAmount: 10000,
      currency: 'USD',
    });

    expect(result.currency).toBe('USD');
    expect(result.heroText).toContain('$10,000');
  });
});
