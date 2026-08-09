import { describe, it, expect } from 'vitest';
import { calculateLoanAmortization } from '../loan-amortization-calculator.js';

describe('Flagship Loan Amortization Math Engine', () => {
  it('calculates standard 15-year ₹10 Lakh loan at 8.5% p.a.', () => {
    const result = calculateLoanAmortization({
      amount: 1000000,
      rate: 8.5,
      tenure: 15,
      tenureType: 'years',
      currency: 'INR',
    });

    expect(result.principal).toBe(1000000);
    expect(result.emi).toBe(9847);
    expect(result.totalInterest).toBe(772602);
    expect(result.schedule.length).toBe(180);
    expect(result.yearlyRows.length).toBe(15);
    expect(result.yearlyRows[0].taxDeductionInterest).toBeLessThanOrEqual(200000);
  });

  it('calculates 30-year $300k US Mortgage at 6.5% p.a.', () => {
    const result = calculateLoanAmortization({
      amount: 300000,
      rate: 6.5,
      tenure: 30,
      tenureType: 'years',
      currency: 'USD',
    });

    expect(result.principal).toBe(300000);
    expect(result.emi).toBe(1896);
    expect(result.totalInterest).toBe(382784);
    expect(result.schedule.length).toBe(360);
    expect(result.schedule[359].remainingBalance).toBe(0);
  });

  it('handles recurring monthly prepayments with tenure reduction', () => {
    const baseline = calculateLoanAmortization({
      amount: 1000000,
      rate: 8.5,
      tenure: 15,
      tenureType: 'years',
      prepaymentMonthly: 0,
    });

    const prepaid = calculateLoanAmortization({
      amount: 1000000,
      rate: 8.5,
      tenure: 15,
      tenureType: 'years',
      prepaymentMonthly: 2000,
      prepaymentStrategy: 'tenure_reduction',
    });

    expect(prepaid.actualPayoffMonths).toBeLessThan(baseline.baselineTenureMonths);
    expect(prepaid.totalInterest).toBeLessThan(baseline.baselineTotalInterest);
    expect(prepaid.interestSaved).toBeGreaterThan(0);
    expect(prepaid.tenureSavedMonths).toBeGreaterThan(0);
  });

  it('handles recurring monthly prepayments with EMI reduction', () => {
    const prepaid = calculateLoanAmortization({
      amount: 1000000,
      rate: 8.5,
      tenure: 15,
      tenureType: 'years',
      prepaymentMonthly: 2000,
      prepaymentStrategy: 'emi_reduction',
    });

    expect(prepaid.schedule.length).toBeLessThanOrEqual(180);
    expect(prepaid.totalInterest).toBeLessThan(772602);
  });

  it('handles annual lump-sum prepayments', () => {
    const prepaid = calculateLoanAmortization({
      amount: 1000000,
      rate: 8.5,
      tenure: 15,
      tenureType: 'years',
      prepaymentAnnual: 25000,
    });

    expect(prepaid.totalExtraPaid).toBeGreaterThan(0);
    expect(prepaid.interestSaved).toBeGreaterThan(0);
    expect(prepaid.schedule.length).toBeLessThan(180);
  });

  it('handles zero interest rate (0% p.a.)', () => {
    const result = calculateLoanAmortization({
      amount: 120000,
      rate: 0,
      tenure: 1,
      tenureType: 'years',
    });

    expect(result.emi).toBe(10000);
    expect(result.totalInterest).toBe(0);
    expect(result.schedule.length).toBe(12);
    expect(result.schedule[11].remainingBalance).toBe(0);
  });

  it('handles short tenure (3 months)', () => {
    const result = calculateLoanAmortization({
      amount: 30000,
      rate: 12,
      tenure: 3,
      tenureType: 'months',
    });

    expect(result.schedule.length).toBe(3);
    expect(result.schedule[2].remainingBalance).toBe(0);
  });

  it('handles massive prepayment exceeding loan balance cleanly', () => {
    const result = calculateLoanAmortization({
      amount: 100000,
      rate: 10,
      tenure: 5,
      tenureType: 'years',
      prepaymentOneTime: 200000,
      prepaymentOneTimeMonth: 1,
    });

    expect(result.schedule.length).toBe(1);
    expect(result.schedule[0].remainingBalance).toBe(0);
    expect(result.schedule[0].principalPaid).toBe(100000);
    expect(result.schedule[0].extraPaid).toBeLessThan(200000);
  });

  it('handles zero principal input gracefully without NaN or Infinity', () => {
    const result = calculateLoanAmortization({
      amount: 0,
      rate: 8.5,
      tenure: 15,
    });

    expect(result.emi).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(result.schedule.length).toBe(0);
    expect(result.heroText).toContain('Please enter a valid loan principal');
    expect(Number.isNaN(result.emi)).toBe(false);
  });
});