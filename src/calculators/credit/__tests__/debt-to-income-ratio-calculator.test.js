import { describe, it, expect } from 'vitest';
import {
  calculateDebtToIncomeRatio,
  calculateFrontEndDti,
  calculateBackEndDti,
  calculateHousingObligations,
  calculateTotalMonthlyDebt,
  calculateMonthlyIncome,
  classifyDtiForEducation,
} from '../debt-to-income-ratio-calculator.js';
import { DEBT_TO_INCOME_RATIO_CONFIG } from '../../configs/debt-to-income-ratio-calculator.config.js';

describe('Debt-to-Income Ratio Financial Engine', () => {

  // 1. Basic Back-End DTI
  it('calculates basic back-end DTI ratio accurately (Scenario A)', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: 100000,
      mortgagePayment: 20000,
      autoLoanEmi: 5000,
      creditCardMinimums: 5000,
    });
    expect(res.isValid).toBe(true);
    expect(res.totalMonthlyDebt).toBe(30000);
    expect(res.backEndDtiPercent).toBe(30.0);
    expect(res.classification.debtBurdenZone).toBe('Lower');
  });

  // 2. Basic Front-End DTI
  it('calculates basic front-end DTI ratio accurately (Scenario B)', () => {
    const frontEnd = calculateFrontEndDti(25000, 100000);
    expect(frontEnd).toBe(25.0);
  });

  // 3. Multiple Debt Categories Aggregation & Mathematical Verification of 36% and 43% Illustrative Additional EMI
  it('aggregates multiple debt categories correctly and calculates illustrative additional EMI accurately (Scenario C)', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: 100000,
      mortgagePayment: 25000,
      autoLoanEmi: 8000,
      personalLoanEmi: 5000,
      creditCardMinimums: 2000,
    });
    expect(res.housingObligations).toBe(25000);
    expect(res.totalMonthlyDebt).toBe(40000);
    expect(res.frontEndDtiPercent).toBe(25.0);
    expect(res.backEndDtiPercent).toBe(40.0);
    expect(res.classification.debtBurdenZone).toBe('Moderate');

    // Mathematical Verification of 36% and 43% scenario calculations
    // 36% of 100,000 = 36,000. Existing debt = 40,000 -> Additional = 0 (max(0, 36000 - 40000))
    expect(res.illustrativeAdditionalEmi36Pct).toBe(0);
    // 43% of 100,000 = 43,000. Existing debt = 40,000 -> Additional = 3,000 (43000 - 40000)
    expect(res.illustrativeAdditionalEmi43Pct).toBe(3000);
  });

  // 4. Mathematical Verification of 36% and 43% Outputs when Debt is Low
  it('verifies mathematical precision of illustrative 36% and 43% additional EMI outputs when debt is low', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: 100000,
      mortgagePayment: 20000,
    });
    // 36% of 100k = 36k. Existing debt = 20k -> Additional = 16,000
    expect(res.illustrativeAdditionalEmi36Pct).toBe(16000);
    // 43% of 100k = 43k. Existing debt = 20k -> Additional = 23,000
    expect(res.illustrativeAdditionalEmi43Pct).toBe(23000);
  });

  // 5. Housing-Only Debt
  it('handles housing-only debt scenario cleanly', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: 100000,
      mortgagePayment: 30000,
    });
    expect(res.housingObligations).toBe(30000);
    expect(res.nonHousingDebt).toBe(0);
    expect(res.frontEndDtiPercent).toBe(30.0);
    expect(res.backEndDtiPercent).toBe(30.0);
  });

  // 6. Non-Housing Debt
  it('handles non-housing debt scenario without housing costs', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: 80000,
      autoLoanEmi: 10000,
      personalLoanEmi: 5000,
    });
    expect(res.housingObligations).toBe(0);
    expect(res.totalMonthlyDebt).toBe(15000);
    expect(res.frontEndDtiPercent).toBe(0.0);
    expect(res.backEndDtiPercent).toBe(18.8);
  });

  // 7. Zero Debt (Scenario D)
  it('handles zero debt scenario returning 0% DTI (Scenario D)', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: 100000,
      mortgagePayment: 0,
      autoLoanEmi: 0,
    });
    expect(res.isValid).toBe(true);
    expect(res.totalMonthlyDebt).toBe(0);
    expect(res.frontEndDtiPercent).toBe(0.0);
    expect(res.backEndDtiPercent).toBe(0.0);
    expect(res.classification.debtBurdenZone).toBe('Lower');
  });

  // 8. Zero Income (Scenario E)
  it('handles zero income returning clear validation state without division by zero (Scenario E)', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: 0,
      mortgagePayment: 25000,
    });
    expect(res.isValid).toBe(false);
    expect(res.validationMessage).toContain('gross monthly income greater than 0');
    expect(res.backEndDtiPercent).toBe(0);
  });

  // 9. Invalid Income
  it('handles invalid NaN income safely', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: NaN,
      mortgagePayment: 20000,
    });
    expect(res.isValid).toBe(false);
  });

  // 10. Negative Income Validation State
  it('handles negative monthly income by returning invalid validation state', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: -50000,
      mortgagePayment: 15000,
    });
    expect(res.isValid).toBe(false);
  });

  // 11. Negative Debt Input Sanitization
  it('sanitizes negative debt inputs to 0 safely', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: 100000,
      mortgagePayment: -20000,
      autoLoanEmi: -5000,
    });
    expect(res.housingObligations).toBe(0);
    expect(res.totalMonthlyDebt).toBe(0);
    expect(res.backEndDtiPercent).toBe(0.0);
  });

  // 12. Decimal Values Calculation Precision
  it('calculates precise DTI for decimal income and debt figures', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: 95500.50,
      mortgagePayment: 28650.15,
    });
    expect(res.backEndDtiPercent).toBe(30.0);
  });

  // 13. Numeric String Sanitization
  it('sanitizes string numeric inputs safely', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: '100000',
      mortgagePayment: '25000',
      autoLoanEmi: '5000',
    });
    expect(res.grossMonthlyIncome).toBe(100000);
    expect(res.totalMonthlyDebt).toBe(30000);
    expect(res.backEndDtiPercent).toBe(30.0);
  });

  // 14. Very Large Income Values
  it('handles very large monthly income figures (e.g. ₹10 Lakhs/mo) cleanly', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: 1000000,
      mortgagePayment: 200000,
      autoLoanEmi: 50000,
    });
    expect(res.totalMonthlyDebt).toBe(250000);
    expect(res.backEndDtiPercent).toBe(25.0);
  });

  // 15. Very Large Debt Values (Scenario F: DTI > 100%)
  it('handles debt greater than income without capping at 100% (Scenario F)', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: 100000,
      mortgagePayment: 70000,
      personalLoanEmi: 50000,
    });
    expect(res.totalMonthlyDebt).toBe(120000);
    expect(res.backEndDtiPercent).toBe(120.0); // Exactly 120.0%, NOT capped at 100%!
    expect(res.classification.debtBurdenZone).toBe('Elevated');
  });

  // 16. Exact 0% DTI
  it('handles exact 0% DTI cleanly', () => {
    const dti = calculateBackEndDti(0, 100000);
    expect(dti).toBe(0.0);
  });

  // 17. Exact 100% DTI
  it('calculates exact 100% DTI when debt equals monthly income', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: 50000,
      mortgagePayment: 30000,
      personalLoanEmi: 20000,
    });
    expect(res.totalMonthlyDebt).toBe(50000);
    expect(res.backEndDtiPercent).toBe(100.0);
  });

  // 18. DTI Above 100%
  it('verifies DTI ratios above 100% remain uncapped and accurate', () => {
    const dti = calculateBackEndDti(150000, 100000);
    expect(dti).toBe(150.0);
  });

  // 19. Preset Calculations Integration
  it('integrates cleanly with default scenario presets', () => {
    const preset = DEBT_TO_INCOME_RATIO_CONFIG.scenarios.homeBorrower;
    const res = calculateDebtToIncomeRatio(preset);

    expect(res.grossMonthlyIncome).toBe(100000);
    expect(res.totalMonthlyDebt).toBe(41000);
    expect(res.backEndDtiPercent).toBe(41.0);
    expect(res.classification.debtBurdenZone).toBe('Moderate');
  });

  // 20. Missing Optional Debt Categories
  it('handles missing optional debt parameters without runtime errors', () => {
    const res = calculateDebtToIncomeRatio({
      grossMonthlyIncome: 60000,
      personalLoanEmi: 12000,
    });
    expect(res.housingObligations).toBe(0);
    expect(res.totalMonthlyDebt).toBe(12000);
    expect(res.backEndDtiPercent).toBe(20.0);
  });

  // 21. Monthly Income Conversion from Annual Input
  it('converts gross annual income to monthly income if monthly income is missing', () => {
    const income = calculateMonthlyIncome(0, 1200000);
    expect(income).toBe(100000);

    const res = calculateDebtToIncomeRatio({
      grossAnnualIncome: 1200000,
      mortgagePayment: 30000,
    });
    expect(res.grossMonthlyIncome).toBe(100000);
    expect(res.backEndDtiPercent).toBe(30.0);
  });

  // 22. Reference-Band Classification
  it('classifies DTI correctly across all educational debt-burden reference bands', () => {
    expect(classifyDtiForEducation(20).debtBurdenZone).toBe('Lower');
    expect(classifyDtiForEducation(36).debtBurdenZone).toBe('Lower');
    expect(classifyDtiForEducation(40).debtBurdenZone).toBe('Moderate');
    expect(classifyDtiForEducation(43).debtBurdenZone).toBe('Moderate');
    expect(classifyDtiForEducation(48).debtBurdenZone).toBe('Higher');
    expect(classifyDtiForEducation(50).debtBurdenZone).toBe('Higher');
    expect(classifyDtiForEducation(65).debtBurdenZone).toBe('Elevated');
  });

  // 23. Regression Scenarios (Empty Options)
  it('handles empty options object safely returning invalid state', () => {
    const res = calculateDebtToIncomeRatio();
    expect(res.isValid).toBe(false);
    expect(res.grossMonthlyIncome).toBe(0);
  });
});
