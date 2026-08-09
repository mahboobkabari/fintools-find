import { describe, it, expect } from 'vitest';
import { calculateLoanEligibility } from '../loan-eligibility-calculator.js';

describe('Loan Eligibility Calculator Math Engine — Sprint 29 Flagship Audit', () => {
  it('calculates standard Home Loan borrowing capacity accurately (Forward Mode)', () => {
    const result = calculateLoanEligibility({
      grossMonthlyIncome: 100000, // ₹1 Lakh/mo
      existingEmis: 10000,        // ₹10,000 existing EMIs
      loanType: 'home_loan',
      rate: 8.5,
      tenure: 20,                  // 20 Years
      foirPct: 50,                 // 50% FOIR -> ₹50,000 max obligation
    });

    expect(result.grossMonthlyIncome).toBe(100000);
    expect(result.maxTotalEmiAllowed).toBe(50000);
    expect(result.maxEmiCapacity).toBe(40000); // 50k - 10k = ₹40,000/mo EMI capacity
    // Reverse PMT for ₹40k/mo @ 8.5% for 20 yrs yields ~₹46,08,127
    expect(result.maxLoanAmount).toBeGreaterThan(4500000);
    expect(result.maxLoanAmount).toBeLessThan(4700000);
  });

  it('calculates co-applicant income pooling accurately', () => {
    const singleResult = calculateLoanEligibility({
      grossMonthlyIncome: 100000,
      coApplicantIncome: 0,
      existingEmis: 10000,
      rate: 8.5,
      tenure: 20,
    });

    const jointResult = calculateLoanEligibility({
      grossMonthlyIncome: 100000,
      coApplicantIncome: 50000, // +₹50k co-applicant income
      existingEmis: 10000,
      rate: 8.5,
      tenure: 20,
    });

    // Total income ₹1.5L -> Max EMI ₹75k -> Capacity ₹65k/mo
    expect(jointResult.totalMonthlyIncome).toBe(150000);
    expect(jointResult.maxEmiCapacity).toBe(65000);
    expect(jointResult.maxLoanAmount).toBeGreaterThan(singleResult.maxLoanAmount);
  });

  it('applies statutory RBI LTV ceilings on Home Loans', () => {
    // Income ₹1 Lakh/mo -> max loan from income is ~₹46L (between ₹30L and ₹75L) -> RBI LTV ceiling = 80%
    // Property Value = ₹45 Lakhs -> 80% of ₹45L = ₹36 Lakhs
    const ltvResult = calculateLoanEligibility({
      grossMonthlyIncome: 100000,
      existingEmis: 0,
      loanType: 'home_loan',
      rate: 8.5,
      tenure: 20,
      propertyValue: 4500000,
    });

    expect(ltvResult.isLtvConstrained).toBe(true);
    expect(ltvResult.maxLtvPct).toBe(80);
    expect(ltvResult.maxLoanFromLtv).toBe(3600000);
    expect(ltvResult.maxLoanAmount).toBe(3600000); // Capped by LTV
  });

  it('calculates Personal Loan mode correctly (Max 5-Yr Tenure)', () => {
    const result = calculateLoanEligibility({
      grossMonthlyIncome: 100000,
      existingEmis: 10000,
      loanType: 'personal_loan',
      rate: 12.5,
      tenure: 7, // Requested 7 yrs -> capped to Personal Loan max 5 yrs
      foirPct: 45,
    });

    expect(result.loanType).toBe('personal_loan');
    expect(result.tenureYears).toBe(5);
    expect(result.maxTotalEmiAllowed).toBe(45000);
    expect(result.maxEmiCapacity).toBe(35000);
    expect(result.maxLoanAmount).toBeGreaterThan(1500000);
  });

  it('solves Reverse Required Income Mode accurately', () => {
    const result = calculateLoanEligibility({
      targetLoanAmount: 5000000, // ₹50 Lakhs target loan
      rate: 8.5,
      tenure: 20,
      foirPct: 50,
      existingEmis: 10000,
      grossMonthlyIncome: 80000,
      calculationMode: 'reverse_income',
    });

    expect(result.reverseResult).not.toBeNull();
    // Required EMI for ₹50L @ 8.5% for 20 yrs is ~₹43,391/mo
    expect(result.reverseResult.requiredMonthlyEmi).toBeGreaterThan(40000);
    // Required Income = (43,391 + 10,000) / 0.5 = ~₹1,06,782/mo
    expect(result.reverseResult.requiredTotalMonthlyIncome).toBeGreaterThan(100000);
  });

  it('solves Reverse EMI Reduction Mode accurately', () => {
    const result = calculateLoanEligibility({
      targetLoanAmount: 5000000, // ₹50 Lakhs target loan
      rate: 8.5,
      tenure: 20,
      foirPct: 50,
      existingEmis: 30000,      // High existing EMIs
      grossMonthlyIncome: 100000, // Income ₹1L -> Obligation ₹50k
      calculationMode: 'reverse_emi',
    });

    expect(result.reverseResult).not.toBeNull();
    // Obligation ₹50k - Required EMI ₹43.4k = Max Allowed Existing EMI ₹6.6k
    // Required Reduction = 30,000 - 6,600 = ~23,400
    expect(result.reverseResult.requiredEmiReduction).toBeGreaterThan(20000);
  });

  it('computes 4-Scenario FOIR Simulator correctly', () => {
    const result = calculateLoanEligibility({
      grossMonthlyIncome: 100000,
      existingEmis: 10000,
      rate: 8.5,
      tenure: 20,
    });

    expect(result.foirScenarios.length).toBe(4);
    const [conservative, standard, aggressive] = result.foirScenarios;

    expect(conservative.foirPct).toBe(40);
    expect(standard.foirPct).toBe(50);
    expect(aggressive.foirPct).toBe(60);

    expect(aggressive.maxLoanAmount).toBeGreaterThan(standard.maxLoanAmount);
    expect(standard.maxLoanAmount).toBeGreaterThan(conservative.maxLoanAmount);
  });

  it('computes 5-Tenure Comparison Matrix correctly', () => {
    const result = calculateLoanEligibility({
      grossMonthlyIncome: 100000,
      existingEmis: 10000,
      loanType: 'home_loan',
      rate: 8.5,
      tenure: 20,
    });

    expect(result.tenureMatrix.length).toBe(5); // 10Y, 15Y, 20Y, 25Y, 30Y
    const ten30 = result.tenureMatrix.find((t) => t.tenureYears === 30);
    const ten15 = result.tenureMatrix.find((t) => t.tenureYears === 15);

    // 30-yr tenure increases borrowing capacity but yields higher total interest
    expect(ten30.maxLoanAmount).toBeGreaterThan(ten15.maxLoanAmount);
    expect(ten30.totalInterest).toBeGreaterThan(ten15.totalInterest);
  });

  it('handles edge cases safely without NaN or negative values', () => {
    // Edge Case 1: Zero Income
    const zeroInc = calculateLoanEligibility({ grossMonthlyIncome: 0 });
    expect(zeroInc.maxLoanAmount).toBe(0);
    expect(zeroInc.maxEmiCapacity).toBe(0);

    // Edge Case 2: Existing EMIs >= Allowed FOIR Limit
    const overDebt = calculateLoanEligibility({ grossMonthlyIncome: 50000, existingEmis: 40000, foirPct: 50 });
    expect(overDebt.maxEmiCapacity).toBe(0);
    expect(overDebt.maxLoanAmount).toBe(0);

    // Edge Case 3: Zero Interest Rate
    const zeroRate = calculateLoanEligibility({ grossMonthlyIncome: 100000, existingEmis: 0, rate: 0, tenure: 10 });
    expect(zeroRate.maxLoanAmount).toBe(50000 * 120); // 50k * 120 = ₹60 Lakhs
    expect(zeroRate.totalInterest).toBe(0);
  });
});