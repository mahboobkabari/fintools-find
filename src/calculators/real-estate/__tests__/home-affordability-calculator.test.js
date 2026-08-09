import { describe, it, expect } from 'vitest';
import {
  calculateHomeAffordability,
  calculateMonthlyEMI,
  calculateMaxLoanFromEMI,
  getApplicableLTVTier,
} from '../home-affordability-calculator';
import { HOME_AFFORDABILITY_CONFIG } from '../../configs/home-affordability-calculator.config';

describe('Home Affordability Financial Engine', () => {
  // 1. Standard Scenario Test
  it('calculates standard home affordability scenario correctly', () => {
    const params = {
      grossMonthlyIncome: 150000,
      existingMonthlyDebt: 20000,
      downPaymentSavings: 1000000,
      annualInterestRate: 8.5,
      tenureYears: 20,
      frontEndDtiRatio: 28,
      backEndDtiRatio: 45,
    };

    const res = calculateHomeAffordability(params);

    expect(res.maxAffordablePrice).toBeGreaterThan(1000000);
    expect(res.maxLoanAmount).toBeGreaterThan(0);
    expect(res.availableMonthlyEMI).toBe(42000); // 28% of 150k = 42k; 45% of 150k - 20k = 47.5k -> min is 42k
    expect(res.requiredDownPayment).toBe(1000000);
    expect(res.upfrontCashRequired).toBe(res.requiredDownPayment + res.estimatedClosingCosts);
    expect(res.yearlySchedule.length).toBe(20);
  });

  // 2. Zero Existing Debt Test
  it('maximizes available EMI when existing debt is zero', () => {
    const params = {
      grossMonthlyIncome: 150000,
      existingMonthlyDebt: 0,
      downPaymentSavings: 1000000,
      annualInterestRate: 8.5,
      tenureYears: 20,
      frontEndDtiRatio: 28,
      backEndDtiRatio: 45,
    };

    const res = calculateHomeAffordability(params);
    expect(res.availableMonthlyEMI).toBe(42000); // Front-end 28% (42k) is less than Back-end 45% (67.5k)
    expect(res.dtiConstraintDetails.subConstraint).toBe('front_end');
  });

  // 3. High Existing Debt Test
  it('restricts available EMI and triggers existing debt constraint under high debt', () => {
    const params = {
      grossMonthlyIncome: 150000,
      existingMonthlyDebt: 50000,
      downPaymentSavings: 1000000,
      annualInterestRate: 8.5,
      tenureYears: 20,
      frontEndDtiRatio: 28,
      backEndDtiRatio: 45,
    };

    const res = calculateHomeAffordability(params);
    // Back-end EMI cap: 150k * 0.45 - 50k = 17,500. Front-end: 42,000 -> Min is 17,500
    expect(res.availableMonthlyEMI).toBe(17500);
    expect(res.bindingConstraint).toBe('existing_debt');
  });

  // 4. Front-End DTI Binding Test
  it('correctly binds front-end DTI when tighter than back-end FOIR', () => {
    const params = {
      grossMonthlyIncome: 200000,
      existingMonthlyDebt: 10000,
      downPaymentSavings: 1500000,
      annualInterestRate: 8.5,
      tenureYears: 20,
      frontEndDtiRatio: 25, // 50,000
      backEndDtiRatio: 50,  // 100,000 - 10,000 = 90,000
    };

    const res = calculateHomeAffordability(params);
    expect(res.availableMonthlyEMI).toBe(50000);
    expect(res.dtiConstraintDetails.subConstraint).toBe('front_end');
  });

  // 5. Back-End FOIR Binding Test
  it('correctly binds back-end FOIR when tighter than front-end DTI', () => {
    const params = {
      grossMonthlyIncome: 100000,
      existingMonthlyDebt: 25000,
      downPaymentSavings: 500000,
      annualInterestRate: 8.5,
      tenureYears: 20,
      frontEndDtiRatio: 35, // 35,000
      backEndDtiRatio: 40,  // 40,000 - 25,000 = 15,000
    };

    const res = calculateHomeAffordability(params);
    expect(res.availableMonthlyEMI).toBe(15000);
    expect(res.bindingConstraint).toBe('existing_debt');
  });

  // 6. Zero Income Test
  it('yields zero affordability and zero loan amount when gross income is 0', () => {
    const params = {
      grossMonthlyIncome: 0,
      existingMonthlyDebt: 0,
      downPaymentSavings: 500000,
      annualInterestRate: 8.5,
      tenureYears: 20,
    };

    const res = calculateHomeAffordability(params);
    expect(res.availableMonthlyEMI).toBe(0);
    expect(res.maxLoanAmount).toBe(0);
    expect(res.maxAffordablePrice).toBe(500000); // Can only buy with cash
  });

  // 7. Zero Down Payment Test
  it('restricts affordability to loan capacity alone when down payment is zero', () => {
    const params = {
      grossMonthlyIncome: 150000,
      existingMonthlyDebt: 10000,
      downPaymentSavings: 0,
      annualInterestRate: 8.5,
      tenureYears: 20,
    };

    const res = calculateHomeAffordability(params);
    expect(res.requiredDownPayment).toBe(0);
    expect(res.maxAffordablePrice).toBe(0); // Cannot satisfy any non-zero LTV without down payment unless LTV = 100%
  });

  // 8. High Down Payment Test
  it('handles high down payment scenarios cleanly', () => {
    const params = {
      grossMonthlyIncome: 100000,
      existingMonthlyDebt: 0,
      downPaymentSavings: 5000000, // 50 Lakhs down payment
      annualInterestRate: 8.5,
      tenureYears: 20,
      frontEndDtiRatio: 28,
      backEndDtiRatio: 45,
    };

    const res = calculateHomeAffordability(params);
    expect(res.maxAffordablePrice).toBeGreaterThan(5000000);
    expect(res.requiredDownPayment).toBeGreaterThan(0);
  });

  // 9. LTV Constraint Binding Test
  it('binds by LTV when down payment is insufficient for income-based loan capacity', () => {
    const params = {
      grossMonthlyIncome: 500000, // High income -> Huge loan capacity (~1.4 Cr)
      existingMonthlyDebt: 0,
      downPaymentSavings: 1000000, // Only 10L down payment (75% LTV requires 25% down payment = 33L)
      annualInterestRate: 8.5,
      tenureYears: 20,
    };

    const res = calculateHomeAffordability(params);
    expect(res.bindingConstraint).toBe('ltv_down_payment');
    expect(res.ltvConstraintDetails.isLtvBinding).toBe(true);
  });

  // 10. Zero Interest Rate Test
  it('handles zero interest rate safely without division by zero', () => {
    const loan = calculateMaxLoanFromEMI(10000, 0, 10);
    expect(loan).toBe(1200000); // 10k * 120 months

    const emi = calculateMonthlyEMI(1200000, 0, 10);
    expect(emi).toBe(10000);

    const params = {
      grossMonthlyIncome: 100000,
      existingMonthlyDebt: 0,
      downPaymentSavings: 1000000, // Sufficient down payment so LTV doesn't bind
      annualInterestRate: 0,
      tenureYears: 10,
      frontEndDtiRatio: 30,
    };

    const res = calculateHomeAffordability(params);
    expect(res.availableMonthlyEMI).toBe(30000);
    expect(res.maxLoanAmount).toBe(3600000);
    expect(res.actualMonthlyEMI).toBe(30000);
  });

  // 11. Short vs Long Tenure Test
  it('yields higher loan capacity for longer tenure at same income', () => {
    const baseParams = {
      grossMonthlyIncome: 150000,
      existingMonthlyDebt: 10000,
      downPaymentSavings: 1000000,
      annualInterestRate: 8.5,
      frontEndDtiRatio: 28,
    };

    const res10 = calculateHomeAffordability({ ...baseParams, tenureYears: 10 });
    const res30 = calculateHomeAffordability({ ...baseParams, tenureYears: 30 });

    expect(res30.maxLoanAmount).toBeGreaterThan(res10.maxLoanAmount);
    expect(res30.maxAffordablePrice).toBeGreaterThan(res10.maxAffordablePrice);
  });

  // 12. Interest Rate Sensitivity Matrix Test
  it('generates a 5-tier interest rate sensitivity matrix', () => {
    const params = {
      grossMonthlyIncome: 150000,
      existingMonthlyDebt: 10000,
      downPaymentSavings: 1000000,
      annualInterestRate: 8.5,
      tenureYears: 20,
    };

    const res = calculateHomeAffordability(params);
    expect(res.rateSensitivity.length).toBe(5);

    const baseRow = res.rateSensitivity.find((r) => r.isBase);
    expect(baseRow.rate).toBe(8.5);

    // Lower interest rate yields higher loan amount
    const lowerRateRow = res.rateSensitivity.find((r) => r.delta === -1.0);
    const higherRateRow = res.rateSensitivity.find((r) => r.delta === 1.0);

    expect(lowerRateRow.maxLoanAmount).toBeGreaterThan(baseRow.maxLoanAmount);
    expect(higherRateRow.maxLoanAmount).toBeLessThan(baseRow.maxLoanAmount);
  });

  // 13. Tenure Sensitivity Matrix Test
  it('generates a 4-tier tenure sensitivity matrix', () => {
    const params = {
      grossMonthlyIncome: 150000,
      existingMonthlyDebt: 10000,
      downPaymentSavings: 1000000,
      annualInterestRate: 8.5,
      tenureYears: 20,
    };

    const res = calculateHomeAffordability(params);
    expect(res.tenureSensitivity.length).toBe(4);
    expect(res.tenureSensitivity.map((t) => t.tenureYears)).toEqual([15, 20, 25, 30]);

    const currentTenureRow = res.tenureSensitivity.find((t) => t.isCurrent);
    expect(currentTenureRow.tenureYears).toBe(20);
  });

  // 14. Property Tax & Insurance Calculation Accuracy Test
  it('computes monthly property tax, insurance, and total ownership cost correctly', () => {
    const params = {
      grossMonthlyIncome: 150000,
      existingMonthlyDebt: 10000,
      downPaymentSavings: 1000000,
      annualInterestRate: 8.5,
      tenureYears: 20,
      propertyTaxRate: 1.0, // 1% p.a.
      insuranceRate: 0.5,   // 0.5% p.a.
      maintenanceRate: 0.5, // 0.5% p.a.
    };

    const res = calculateHomeAffordability(params);
    const expectedMonthlyTax = Math.round((res.maxAffordablePrice * 0.01) / 12);
    const expectedMonthlyIns = Math.round((res.maxAffordablePrice * 0.005) / 12);

    expect(res.monthlyPropertyTax).toBe(expectedMonthlyTax);
    expect(res.monthlyInsurance).toBe(expectedMonthlyIns);
    expect(res.totalMonthlyOwnershipCost).toBe(
      res.actualMonthlyEMI + res.monthlyPropertyTax + res.monthlyInsurance + res.monthlyMaintenance
    );
  });

  // 15. Closing Costs Test
  it('computes upfront closing costs accurately according to configured percentage', () => {
    const params = {
      grossMonthlyIncome: 150000,
      existingMonthlyDebt: 10000,
      downPaymentSavings: 1000000,
      annualInterestRate: 8.5,
      tenureYears: 20,
      closingCostRate: 6.0, // 6% closing costs
    };

    const res = calculateHomeAffordability(params);
    expect(res.estimatedClosingCosts).toBe(Math.round(res.maxAffordablePrice * 0.06));
    expect(res.upfrontCashRequired).toBe(res.requiredDownPayment + res.estimatedClosingCosts);
  });

  // 16. Negative Input Sanitization Test
  it('sanitizes negative input values safely to zero or valid bounds', () => {
    const params = {
      grossMonthlyIncome: -100000,
      existingMonthlyDebt: -5000,
      downPaymentSavings: -200000,
      annualInterestRate: -5,
      tenureYears: -10,
    };

    const res = calculateHomeAffordability(params);
    expect(res.availableMonthlyEMI).toBe(0);
    expect(res.maxLoanAmount).toBe(0);
    expect(res.maxAffordablePrice).toBe(0);
  });

  // 17. High Interest Rate Test
  it('handles high interest rate (25%) accurately without crashing', () => {
    const params = {
      grossMonthlyIncome: 200000,
      existingMonthlyDebt: 10000,
      downPaymentSavings: 1000000,
      annualInterestRate: 25.0,
      tenureYears: 20,
    };

    const res = calculateHomeAffordability(params);
    expect(res.maxLoanAmount).toBeGreaterThan(0);
    expect(res.actualMonthlyEMI).toBeGreaterThan(0);
  });

  // 18. Amortization Schedule Record Count Test
  it('generates yearly schedule matching exact tenure years', () => {
    const params = {
      grossMonthlyIncome: 150000,
      existingMonthlyDebt: 10000,
      downPaymentSavings: 1000000,
      annualInterestRate: 8.5,
      tenureYears: 15,
    };

    const res = calculateHomeAffordability(params);
    expect(res.yearlySchedule.length).toBe(15);
    expect(res.yearlySchedule[14].endingBalance).toBe(0);
  });

  // 19. Upfront Cash Formula Verification Test
  it('verifies upfront cash required matches down payment plus closing costs', () => {
    const params = {
      grossMonthlyIncome: 150000,
      existingMonthlyDebt: 10000,
      downPaymentSavings: 1500000,
      annualInterestRate: 8.5,
      tenureYears: 20,
      closingCostRate: 5.0,
    };

    const res = calculateHomeAffordability(params);
    expect(res.upfrontCashRequired).toBe(res.requiredDownPayment + res.estimatedClosingCosts);
  });

  // 20. Underwriting Presets Test
  it('verifies calculations differ when using conservative vs aggressive presets', () => {
    const base = {
      grossMonthlyIncome: 200000,
      existingMonthlyDebt: 20000,
      downPaymentSavings: 5000000, // 50L down payment so income DTI binds
      annualInterestRate: 8.5,
      tenureYears: 20,
    };

    const conservative = calculateHomeAffordability({
      ...base,
      ...HOME_AFFORDABILITY_CONFIG.scenarios.conservative,
    });

    const aggressive = calculateHomeAffordability({
      ...base,
      ...HOME_AFFORDABILITY_CONFIG.scenarios.aggressive,
    });

    expect(aggressive.availableMonthlyEMI).toBeGreaterThan(conservative.availableMonthlyEMI);
    expect(aggressive.maxAffordablePrice).toBeGreaterThan(conservative.maxAffordablePrice);
  });

  // 21. Currency-Independent Accuracy Test
  it('maintains precision for large financial values', () => {
    const params = {
      grossMonthlyIncome: 2000000, // 20 Lakhs / month
      existingMonthlyDebt: 200000,
      downPaymentSavings: 20000000, // 2 Crores
      annualInterestRate: 8.5,
      tenureYears: 20,
    };

    const res = calculateHomeAffordability(params);
    expect(res.maxAffordablePrice).toBeGreaterThan(50000000);
    expect(Number.isFinite(res.maxAffordablePrice)).toBe(true);
  });

  // 22. RBI LTV Tier helper function test
  it('returns correct LTV percentages for statutory thresholds', () => {
    expect(getApplicableLTVTier(2500000)).toBe(90);
    expect(getApplicableLTVTier(5000000)).toBe(80);
    expect(getApplicableLTVTier(10000000)).toBe(75);
  });
});
