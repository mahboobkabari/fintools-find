import { describe, it, expect } from 'vitest';
import { calculatePersonalLoan } from '../personal-loan-calculator.js';

describe('Personal Loan Calculator Math Engine — Sprint 35 Flagship Audit', () => {
  it('Reference Case A: Benchmark ₹5 Lakhs Personal Loan (11.5% Rate for 3 Years)', () => {
    const result = calculatePersonalLoan({
      amount: 500000,
      rate: 11.5,
      tenure: 3,
      monthlyIncome: 100000,
    });

    expect(result.loanAmount).toBe(500000);
    expect(result.emi).toBe(16488); // PMT(11.5%/12, 36, -500000) = ₹16,488
    expect(result.totalInterest).toBe(93568);
    expect(result.foirPct).toBe(16); // ₹16,490 / ₹1,00,000 = 16%
    expect(result.healthStatus).toBe('Comfortable');
  });

  it('Reference Case B: Credit Card Debt Consolidation Simulator (36% Credit Card APR vs 12% Personal Loan)', () => {
    const result = calculatePersonalLoan({
      amount: 800000,
      rate: 12.0,
      tenure: 4,
      creditCardBalance: 800000,
      creditCardApr: 36.0,
    });

    expect(result.consolidationSim).not.toBeNull();
    expect(result.consolidationSim.isConsolidationBeneficial).toBe(true);
    expect(result.consolidationSim.interestSavings).toBeGreaterThan(500000); // >₹5.0 Lakh interest savings!
    expect(result.consolidationSim.plEmi).toBeLessThan(result.consolidationSim.cardMinPay);
  });

  it('Reference Case C: FOIR Affordability Verdict Thresholds (Comfortable vs Moderate vs High Risk)', () => {
    const comfortable = calculatePersonalLoan({
      amount: 300000,
      monthlyIncome: 100000, // EMI ~₹9.8k = 10% FOIR
    });
    expect(comfortable.healthStatus).toBe('Comfortable');

    const highRisk = calculatePersonalLoan({
      amount: 2000000,
      monthlyIncome: 80000, // EMI ~₹44k = 55% FOIR
    });
    expect(highRisk.healthStatus).toBe('High Risk');
  });

  it('Reference Case D: Effective APR Calculation (Factoring Upfront Processing Fee + 18% GST)', () => {
    const result = calculatePersonalLoan({
      amount: 500000,
      rate: 11.5,
      tenure: 3,
      processingFeePct: 2.0, // 2% fee = ₹10,000 + 18% GST = ₹11,800 total fee
    });

    expect(result.rawProcessingFee).toBe(10000);
    expect(result.feeGst).toBe(1800);
    expect(result.processingFee).toBe(11800);
    expect(result.effectiveApr).toBeGreaterThan(11.5); // Effective APR > Nominal 11.5% due to upfront fees!
  });

  it('Reference Case E: Borrow Less Simulator (-₹1 Lakh Loan Savings)', () => {
    const result = calculatePersonalLoan({
      amount: 500000,
      rate: 11.5,
      tenure: 3,
    });

    expect(result.borrowLessScenarios.length).toBeGreaterThan(0);
    const less1L = result.borrowLessScenarios.find((s) => s.delta === 100000);
    expect(less1L).toBeDefined();
    expect(less1L.emiSaved).toBeGreaterThan(0);
    expect(less1L.interestSaved).toBeGreaterThan(0);
  });

  it('Reference Case F: Reverse Target EMI Solver & Round-Trip Consistency', () => {
    const goalResult = calculatePersonalLoan({
      rate: 11.5,
      tenure: 3,
      calculationMode: 'reverse_emi',
      targetEmi: 15000, // ₹15,000/mo EMI target
    });

    expect(goalResult.loanAmount).toBeGreaterThan(400000);

    // Round-trip verification: feed solved loan amount back into forward engine
    const roundTrip = calculatePersonalLoan({
      amount: goalResult.loanAmount,
      rate: 11.5,
      tenure: 3,
      calculationMode: 'forward',
    });

    expect(Math.abs(roundTrip.emi - 15000)).toBeLessThan(10); // within ₹10
  });

  it('Reference Case G: 4-Scenario Tenure Grid (1Y vs 3Y vs 5Y)', () => {
    const result = calculatePersonalLoan({
      amount: 500000,
      rate: 11.5,
      tenure: 3,
    });

    expect(result.scenarios.length).toBe(4);
    const [fast1Y, std3Y, long5Y, borrow20Less] = result.scenarios;

    expect(fast1Y.emi).toBeGreaterThan(std3Y.emi);
    expect(long5Y.emi).toBeLessThan(std3Y.emi);
    expect(borrow20Less.totalInterest).toBeLessThan(std3Y.totalInterest);
  });

  it('handles edge cases safely without NaN or negative numbers', () => {
    // Edge Case 1: Zero Loan Amount
    const zeroLoan = calculatePersonalLoan({ amount: 0 });
    expect(zeroLoan.emi).toBe(0);
    expect(zeroLoan.totalRepayment).toBe(0);

    // Edge Case 2: Extreme High Loan Amount & Tenure
    const extreme = calculatePersonalLoan({ amount: 10000000, tenure: 7 });
    expect(isNaN(extreme.emi)).toBe(false);
    expect(isFinite(extreme.totalRepayment)).toBe(true);
  });
});