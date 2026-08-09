import { describe, it, expect } from 'vitest';
import { calculateLoanPrepayment } from '../loan-prepayment-calculator.js';

describe('Flagship Loan Prepayment Calculator Engine', () => {
  it('verifies exact reference case for ₹20L Home Loan under Option A (Tenure Reduction)', () => {
    // ₹20L, 8.5% p.a., 20 Years, ₹2L prepayment at Month 12
    const result = calculateLoanPrepayment({
      amount: 2000000,
      rate: 8.5,
      tenure: 20,
      tenureType: 'years',
      prepaymentMode: 'lumpsum',
      prepaymentAmount: 200000,
      prepaymentMonth: 12,
      decisionOption: 'tenure',
    });

    expect(result.emi).toBe(17356);
    expect(result.originalInterest).toBe(2165440);
    expect(result.optionA.newTenureMonths).toBe(192);
    expect(result.optionA.monthsSaved).toBe(48);
    expect(result.optionA.interestSaved).toBe(641272);
    expect(result.optionA.netBenefit).toBe(641272);
  });

  it('verifies exact reference case for ₹20L Home Loan under Option B (EMI Reduction)', () => {
    // ₹20L, 8.5% p.a., 20 Years, ₹2L prepayment at Month 12
    const result = calculateLoanPrepayment({
      amount: 2000000,
      rate: 8.5,
      tenure: 20,
      tenureType: 'years',
      prepaymentMode: 'lumpsum',
      prepaymentAmount: 200000,
      prepaymentMonth: 12,
      decisionOption: 'emi',
    });

    expect(result.optionB.revisedEmi).toBe(15586);
    expect(result.optionB.monthlyEmiSavings).toBe(1770);
    expect(result.optionB.interestSaved).toBe(203787);
    expect(result.optionB.netBenefit).toBe(203787);
  });

  it('calculates interest savings for recurring extra monthly contributions (+₹2,000/mo)', () => {
    const result = calculateLoanPrepayment({
      amount: 2000000,
      rate: 8.5,
      tenure: 20,
      prepaymentMode: 'extra_monthly',
      prepaymentAmount: 2000,
      decisionOption: 'tenure',
    });

    expect(result.monthsSaved).toBeGreaterThan(30);
    expect(result.interestSaved).toBeGreaterThan(400000);
  });

  it('calculates interest savings for 1 extra EMI per year mode', () => {
    const result = calculateLoanPrepayment({
      amount: 2000000,
      rate: 8.5,
      tenure: 20,
      prepaymentMode: 'extra_emi',
      decisionOption: 'tenure',
    });

    expect(result.monthsSaved).toBeGreaterThan(20);
    expect(result.interestSaved).toBeGreaterThan(300000);
  });

  it('deducts prepayment penalty charges (%) from gross interest saved', () => {
    const result = calculateLoanPrepayment({
      amount: 2000000,
      rate: 8.5,
      tenure: 20,
      prepaymentAmount: 200000,
      prepaymentMonth: 12,
      prepaymentFeePct: 2.0, // 2% penalty fee = ₹4,000
      decisionOption: 'tenure',
    });

    expect(result.prepaymentFeeAmount).toBe(4000);
    expect(result.netBenefit).toBe(result.interestSaved - 4000);
  });

  it('handles overpayment by capping prepayment at outstanding principal balance', () => {
    const result = calculateLoanPrepayment({
      amount: 500000,
      rate: 10,
      tenure: 5,
      prepaymentAmount: 1000000, // Prepayment exceeds ₹5L principal
      prepaymentMonth: 6,
    });

    expect(result.overpaymentCapped).toBe(true);
    expect(result.appliedPrepayment).toBeLessThanOrEqual(500000);
    expect(result.newTenureMonths).toBeLessThanOrEqual(6);
  });

  it('handles zero prepayment cleanly', () => {
    const result = calculateLoanPrepayment({
      amount: 1000000,
      rate: 8.5,
      tenure: 20,
      prepaymentAmount: 0,
    });

    expect(result.interestSaved).toBe(0);
    expect(result.monthsSaved).toBe(0);
    expect(result.netBenefit).toBe(0);
  });

  it('preserves true positive net benefit when prepayment charge is lower than interest saved', () => {
    const result = calculateLoanPrepayment({
      amount: 2000000,
      rate: 8.5,
      tenure: 20,
      prepaymentAmount: 200000,
      prepaymentMonth: 12,
      prepaymentFeePct: 2, // 2% charge on ₹200,000 = ₹4,000 charge
      decisionOption: 'tenure',
    });

    expect(result.prepaymentFeeAmount).toBe(4000);
    expect(result.interestSaved).toBe(641272);
    expect(result.netBenefit).toBe(637272); // Positive net benefit!
  });

  it('preserves true negative net benefit when prepayment charge exceeds interest saved', () => {
    const result = calculateLoanPrepayment({
      amount: 2000000,
      rate: 8.5,
      tenure: 20,
      prepaymentAmount: 200000,
      prepaymentMonth: 12,
      prepaymentFeePct: 350, // High fee = ₹7,00,000 charge
      decisionOption: 'tenure',
    });

    expect(result.prepaymentFeeAmount).toBe(700000);
    expect(result.interestSaved).toBe(641272);
    expect(result.netBenefit).toBe(-58728); // True unclamped negative net benefit preserved!
  });

  it('preserves true zero net benefit when prepayment charge equals interest saved', () => {
    const resultBaseline = calculateLoanPrepayment({
      amount: 2000000,
      rate: 8.5,
      tenure: 20,
      prepaymentAmount: 200000,
      prepaymentMonth: 12,
      prepaymentFeePct: 0,
      decisionOption: 'tenure',
    });

    const interestSaved = resultBaseline.interestSaved; // 641272
    const feePct = (interestSaved / 200000) * 100; // 320.636%

    const resultWithFee = calculateLoanPrepayment({
      amount: 2000000,
      rate: 8.5,
      tenure: 20,
      prepaymentAmount: 200000,
      prepaymentMonth: 12,
      prepaymentFeePct: feePct,
      decisionOption: 'tenure',
    });

    expect(resultWithFee.netBenefit).toBe(0); // Break-even zero net benefit!
  });
});