import { describe, it, expect } from 'vitest';
import { calculateEducationLoan } from '../education-loan-calculator.js';

describe('Education Loan Calculator Math Engine — Sprint 32 Flagship Audit', () => {
  it('Reference Case A: Benchmark ₹10 Lakhs Education Loan (9.5% p.a., 4Y Moratorium, 10Y Tenure)', () => {
    const result = calculateEducationLoan({
      amount: 1000000,
      rate: 9.5,
      tenure: 10,
      tenureType: 'years',
      moratoriumYears: 4,
      payInterestDuringMoratorium: false,
    });

    expect(result.loanAmount).toBe(1000000);
    expect(result.moratoriumInterest).toBe(380000); // 10L * 9.5% * 4 yrs = ₹3,80,000
    expect(result.totalPrincipalAtRepayment).toBe(1380000);
    expect(result.emi).toBe(17857);
    expect(result.totalInterest).toBe(1142840);
  });

  it('Reference Case B: Deferred vs Pay Interest Monthly during Study (Interest Savings)', () => {
    const deferred = calculateEducationLoan({
      amount: 1000000,
      rate: 9.5,
      tenure: 10,
      moratoriumYears: 4,
      payInterestDuringMoratorium: false,
    });

    const paidMonthly = calculateEducationLoan({
      amount: 1000000,
      rate: 9.5,
      tenure: 10,
      moratoriumYears: 4,
      payInterestDuringMoratorium: true,
    });

    expect(paidMonthly.totalPrincipalAtRepayment).toBe(1000000);
    expect(paidMonthly.emi).toBeLessThan(deferred.emi); // ₹12,939/mo vs ₹17,857/mo
    expect(paidMonthly.totalPayment).toBeLessThan(deferred.totalPayment);
  });

  it('Reference Case C: Zero-Interest Stress Case (0% Rate)', () => {
    const zeroRate = calculateEducationLoan({
      amount: 1000000,
      rate: 0,
      tenure: 10,
      moratoriumYears: 4,
    });

    expect(zeroRate.moratoriumInterest).toBe(0);
    expect(zeroRate.totalInterest).toBe(0);
    expect(zeroRate.totalPayment).toBe(1000000);
  });

  it('Reference Case D: Zero-Moratorium Case (0 Years Study Moratorium)', () => {
    const noMor = calculateEducationLoan({
      amount: 1000000,
      rate: 9.5,
      tenure: 10,
      moratoriumYears: 0,
    });

    expect(noMor.moratoriumInterest).toBe(0);
    expect(noMor.totalPrincipalAtRepayment).toBe(1000000);
    expect(noMor.emi).toBe(12940);
  });

  it('Reference Case E: Section 80E 8-Year Tax Savings Calculation', () => {
    const result = calculateEducationLoan({
      amount: 1000000,
      rate: 9.5,
      tenure: 10,
      moratoriumYears: 4,
      marginalTaxRate: 30, // 30% tax bracket
    });

    expect(result.sec80E_eligibleInterest).toBeGreaterThan(0);
    expect(result.sec80E_taxSavings).toBeGreaterThan(100000); // >₹1.0 Lakh tax savings
    expect(result.effectiveNetCost).toBe(result.totalPayment - result.sec80E_taxSavings);
  });

  it('Reference Case F: Reverse Target EMI Solver & Round-Trip Consistency', () => {
    const goalResult = calculateEducationLoan({
      rate: 9.5,
      tenure: 10,
      moratoriumYears: 4,
      calculationMode: 'reverse_emi',
      targetEmi: 20000, // ₹20,000/mo EMI target
    });

    expect(goalResult.loanAmount).toBeGreaterThan(1000000);

    // Round-trip verification: feed solved loan principal back into forward engine
    const roundTrip = calculateEducationLoan({
      amount: goalResult.loanAmount,
      rate: 9.5,
      tenure: 10,
      moratoriumYears: 4,
      calculationMode: 'forward',
    });

    expect(Math.abs(roundTrip.emi - 20000)).toBeLessThan(10); // within ₹10
  });

  it('computes 4-Scenario Moratorium comparison grid correctly', () => {
    const result = calculateEducationLoan({
      amount: 1000000,
      rate: 9.5,
      tenure: 10,
      moratoriumYears: 4,
    });

    expect(result.scenarios.length).toBe(4);
    const [deferred, paidMonthly, fastTrack7Y, longTerm15Y] = result.scenarios;

    expect(paidMonthly.totalPayment).toBeLessThan(deferred.totalPayment);
    expect(fastTrack7Y.emi).toBeGreaterThan(deferred.emi);
    expect(longTerm15Y.emi).toBeLessThan(deferred.emi);
  });

  it('handles edge cases safely without NaN or negative numbers', () => {
    // Edge Case 1: Zero Loan Amount
    const zeroLoan = calculateEducationLoan({ amount: 0 });
    expect(zeroLoan.emi).toBe(0);
    expect(zeroLoan.totalPayment).toBe(0);

    // Edge Case 2: Extreme High Rate & Moratorium
    const extreme = calculateEducationLoan({ amount: 5000000, rate: 20, moratoriumYears: 6 });
    expect(isNaN(extreme.emi)).toBe(false);
    expect(isFinite(extreme.totalPayment)).toBe(true);
  });
});