import { describe, it, expect } from 'vitest';
import { calculatePomisCalculator } from '../pomis-calculator.js';

describe('Flagship Post Office Monthly Income Scheme (POMIS) Math Engine', () => {
  it('1. calculates basic monthly payout for Max Single Account (₹9 Lakhs @ 7.4% p.a.)', () => {
    const result = calculatePomisCalculator({
      depositAmount: 900000,
      accountType: 'single',
      rate: 7.4,
    });

    expect(result.depositAmount).toBe(900000);
    expect(result.accountType).toBe('single');
    expect(result.rate).toBe(7.4);
    // (₹900,000 * 7.4%) / 12 = ₹5,550 / month
    expect(result.monthlyIncome).toBe(5550);
    expect(result.primaryOutput).toBe(5550);
    expect(result.annualIncome).toBe(66600); // ₹5,550 * 12
    expect(result.total5YearInterest).toBe(333000); // ₹5,550 * 60
    expect(result.maturityAmount).toBe(900000);
  });

  it('2. calculates basic monthly payout for Max Joint Account (₹15 Lakhs @ 7.4% p.a.)', () => {
    const result = calculatePomisCalculator({
      depositAmount: 1500000,
      accountType: 'joint',
      rate: 7.4,
    });

    expect(result.depositAmount).toBe(1500000);
    expect(result.accountType).toBe('joint');
    // (₹1,500,000 * 7.4%) / 12 = ₹9,250 / month
    expect(result.monthlyIncome).toBe(9250);
    expect(result.annualIncome).toBe(111000);
    expect(result.total5YearInterest).toBe(555000);
    expect(result.maturityAmount).toBe(1500000);
  });

  it('3. enforces statutory Single Account cap (₹9 Lakhs) when deposit exceeds cap', () => {
    const result = calculatePomisCalculator({
      depositAmount: 1200000, // Exceeds Single cap of ₹9L
      accountType: 'single',
      rate: 7.4,
    });

    expect(result.isCapExceeded).toBe(true);
    expect(result.effectiveCap).toBe(900000);
    expect(result.depositAmount).toBe(900000); // Sanitized to cap
    expect(result.monthlyIncome).toBe(5550); // Computed on ₹9L
  });

  it('4. enforces statutory Joint Account cap (₹15 Lakhs) when deposit exceeds cap', () => {
    const result = calculatePomisCalculator({
      depositAmount: 2000000, // Exceeds Joint cap of ₹15L
      accountType: 'joint',
      rate: 7.4,
    });

    expect(result.isCapExceeded).toBe(true);
    expect(result.effectiveCap).toBe(1500000);
    expect(result.depositAmount).toBe(1500000); // Sanitized to cap
    expect(result.monthlyIncome).toBe(9250); // Computed on ₹15L
  });

  it('5. handles minimum statutory deposit (₹1,000)', () => {
    const result = calculatePomisCalculator({
      depositAmount: 1000,
      rate: 7.4,
    });

    expect(result.depositAmount).toBe(1000);
    // (₹1,000 * 7.4%) / 12 = ₹6 / month
    expect(result.monthlyIncome).toBe(6);
    expect(result.annualIncome).toBe(72);
    expect(result.total5YearInterest).toBe(360);
  });

  it('6. calculates 5-year annual rollup cash flow schedule', () => {
    const result = calculatePomisCalculator({
      depositAmount: 900000,
      rate: 7.4,
    });

    expect(result.yearlySchedule.length).toBe(5);
    expect(result.yearlySchedule[0].year).toBe(1);
    expect(result.yearlySchedule[0].annualInterest).toBe(66600);
    expect(result.yearlySchedule[0].cumulativeInterest).toBe(66600);

    expect(result.yearlySchedule[4].year).toBe(5);
    expect(result.yearlySchedule[4].cumulativeInterest).toBe(333000);
  });

  it('7. audits taxable income estimate under 30% marginal tax slab', () => {
    const result = calculatePomisCalculator({
      depositAmount: 900000,
      rate: 7.4,
      marginalTaxRate: 30,
    });

    expect(result.annualIncome).toBe(66600);
    expect(result.annualTaxEstimate).toBe(19980); // ₹66,600 * 30% = ₹19,980
    expect(result.netMonthlyIncomeAfterTax).toBe(3885); // ₹5,550 * 70% = ₹3,885
  });

  it('8. computes premature closure penalties (1–3 years @ 2% & 3–5 years @ 1%)', () => {
    const result = calculatePomisCalculator({
      depositAmount: 900000,
      rate: 7.4,
    });

    // 1 to 3 years: 2% deduction on ₹9L = ₹18,000 penalty
    expect(result.premature1To3YearPenalty).toBe(18000);
    expect(result.premature1To3YearRefund).toBe(882000);

    // 3 to 5 years: 1% deduction on ₹9L = ₹9,000 penalty
    expect(result.premature3To5YearPenalty).toBe(9000);
    expect(result.premature3To5YearRefund).toBe(891000);
  });

  it('9. calculates POMIS vs 5-Year Bank FD monthly interest comparison', () => {
    const result = calculatePomisCalculator({
      depositAmount: 900000,
      rate: 7.4, // POMIS 7.4%
      expectedFdRate: 6.75, // Bank FD 6.75%
    });

    expect(result.monthlyIncome).toBe(5550);
    expect(result.fdMonthlyIncome).toBe(5063); // (₹9L * 6.75%) / 12 = ₹5,063
    expect(result.pomisVsFdDeltaMonthly).toBe(487); // POMIS yields ₹487 extra/month
  });

  it('10. calculates POMIS vs Senior Citizens Savings Scheme (SCSS @ 8.2%) comparison', () => {
    const result = calculatePomisCalculator({
      depositAmount: 900000,
      rate: 7.4,
      scssRate: 8.2,
    });

    expect(result.monthlyIncome).toBe(5550);
    expect(result.scssMonthlyEquivalent).toBe(6150); // (₹9L * 8.2%) / 12 = ₹6,150
    expect(result.scssVsPomisDeltaMonthly).toBe(600); // SCSS yields ₹600 extra/month
  });

  it('11. computes 5-year inflation-adjusted real purchasing power monthly payout', () => {
    const result = calculatePomisCalculator({
      depositAmount: 900000,
      rate: 7.4,
      inflationRate: 5.0,
    });

    // ₹5,550 / (1.05)^5 = ₹4,349
    expect(result.purchasingPowerMonthly).toBe(4349);
  });

  it('12. handles zero deposit edge case cleanly', () => {
    const result = calculatePomisCalculator({
      depositAmount: 0,
      rate: 7.4,
    });

    expect(result.depositAmount).toBe(0);
    expect(result.monthlyIncome).toBe(0);
    expect(result.total5YearInterest).toBe(0);
    expect(Number.isNaN(result.monthlyIncome)).toBe(false);
    expect(result.heroText).toContain('Please enter a valid deposit amount');
  });

  it('13. handles negative deposit input sanitization', () => {
    const result = calculatePomisCalculator({
      depositAmount: -100000,
      rate: 7.4,
    });

    expect(result.depositAmount).toBe(0);
    expect(result.monthlyIncome).toBe(0);
  });

  it('14. computes scenario matrix comparison outputs', () => {
    const result = calculatePomisCalculator({
      depositAmount: 900000,
      rate: 7.4,
    });

    expect(result.scenarios.length).toBe(4);
    expect(result.scenarios[0].deposit).toBe(900000);
    expect(result.scenarios[1].deposit).toBe(900000); // Max single
    expect(result.scenarios[2].deposit).toBe(1500000); // Max joint
    expect(result.scenarios[3].deposit).toBe(500000); // Moderate
  });

  it('15. handles USD currency mode formatting', () => {
    const result = calculatePomisCalculator({
      depositAmount: 50000,
      rate: 7.4,
      currency: 'USD',
    });

    expect(result.currency).toBe('USD');
    expect(result.heroText).toContain('$50,000');
  });

  it('16. verifies statutory boundary at exactly ₹9 Lakhs single cap', () => {
    const result = calculatePomisCalculator({
      depositAmount: 900000,
      accountType: 'single',
    });

    expect(result.isCapExceeded).toBe(false);
    expect(result.depositAmount).toBe(900000);
  });

  it('17. verifies statutory boundary at exactly ₹15 Lakhs joint cap', () => {
    const result = calculatePomisCalculator({
      depositAmount: 1500000,
      accountType: 'joint',
    });

    expect(result.isCapExceeded).toBe(false);
    expect(result.depositAmount).toBe(1500000);
  });
});
