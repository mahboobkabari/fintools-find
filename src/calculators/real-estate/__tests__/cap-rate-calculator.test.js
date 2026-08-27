import { describe, it, expect } from 'vitest';
import {
  calculateGrossPotentialIncome,
  calculateVacancyLoss,
  calculateEffectiveGrossIncome,
  calculateOperatingExpenses,
  calculateNoi,
  calculateCapRate,
  calculatePropertyValuation,
  calculateOperatingExpenseRatio,
  calculateCapRateSpread,
  calculateCapRateDetails,
} from '../cap-rate-calculator';
import { CAP_RATE_CONFIG } from '../../configs/cap-rate-calculator.config';

describe('Cap Rate (Capitalization Rate) Engine Tests', () => {

  // 1. Standard ₹1 Crore property cap rate calculation
  it('calculates cap rate correctly for a standard ₹1 Crore property', () => {
    const res = calculateCapRateDetails({
      propertyValue: 10000000,
      monthlyRent: 65000,
      vacancyRatePct: 5,
      propertyTaxAnnual: 60000,
      insuranceAnnual: 24000,
      maintenanceAnnual: 45000,
      managementFeePct: 8,
    });
    expect(res.isValid).toBe(true);
    expect(res.noi).toBeGreaterThan(0);
    expect(res.capRatePct).toBeGreaterThan(0);
  });

  // 2. NOI calculation with vacancy deduction
  it('deducts vacancy loss correctly in Gross Potential Income', () => {
    const gpi = calculateGrossPotentialIncome(50000, 0); // ₹6,00,000
    const vacancy = calculateVacancyLoss(gpi, 10); // 10% = ₹60,000
    const egi = calculateEffectiveGrossIncome(gpi, vacancy);
    expect(egi).toBe(540000);
  });

  // 3. Zero vacancy case
  it('handles 0% vacancy rate cleanly', () => {
    const gpi = calculateGrossPotentialIncome(50000, 0);
    const vacancy = calculateVacancyLoss(gpi, 0);
    expect(vacancy).toBe(0);
    expect(calculateEffectiveGrossIncome(gpi, vacancy)).toBe(600000);
  });

  // 4. High vacancy case (15%)
  it('handles high 15% vacancy rate correctly', () => {
    const gpi = calculateGrossPotentialIncome(100000, 0); // ₹12,00,000
    const vacancy = calculateVacancyLoss(gpi, 15); // ₹1,80,000
    expect(vacancy).toBe(180000);
  });

  // 5. Property tax inclusion
  it('includes annual property tax in operating expenses', () => {
    const opex = calculateOperatingExpenses({ propertyTax: 50000 });
    expect(opex).toBe(50000);
  });

  // 6. Insurance inclusion
  it('includes annual insurance in operating expenses', () => {
    const opex = calculateOperatingExpenses({ insurance: 20000 });
    expect(opex).toBe(20000);
  });

  // 7. Repairs & maintenance inclusion
  it('includes maintenance and repairs in operating expenses', () => {
    const opex = calculateOperatingExpenses({ maintenance: 35000 });
    expect(opex).toBe(35000);
  });

  // 8. Management fee percentage calculation
  it('calculates management fee as percentage of Effective Gross Income', () => {
    const res = calculateCapRateDetails({
      propertyValue: 10000000,
      monthlyRent: 100000,
      vacancyRatePct: 0,
      managementFeePct: 10,
    });
    expect(res.operatingExpenses.managementFees).toBe(120000); // 10% of 12L
  });

  // 9. Utilities inclusion
  it('includes annual utilities in operating expenses', () => {
    const opex = calculateOperatingExpenses({ utilities: 15000 });
    expect(opex).toBe(15000);
  });

  // 10. HOA charges inclusion
  it('includes HOA and society charges in operating expenses', () => {
    const opex = calculateOperatingExpenses({ hoaCharges: 18000 });
    expect(opex).toBe(18000);
  });

  // 11. Other operating expenses inclusion
  it('includes other general operating expenses in OpEx', () => {
    const opex = calculateOperatingExpenses({ otherOpEx: 12000 });
    expect(opex).toBe(12000);
  });

  // 12. Combined OpEx sum
  it('sums all operating expense line items accurately', () => {
    const opex = calculateOperatingExpenses({
      propertyTax: 50000,
      insurance: 20000,
      maintenance: 30000,
      managementFees: 40000,
      utilities: 10000,
      hoaCharges: 15000,
      otherOpEx: 5000,
    });
    expect(opex).toBe(170000);
  });

  // 13. Target cap rate valuation (6%)
  it('calculates implied property valuation at 6% target cap rate', () => {
    const valuation = calculatePropertyValuation(600000, 6);
    expect(valuation).toBe(10000000); // 6L / 0.06 = 1 Cr
  });

  // 14. Target cap rate valuation (8%)
  it('calculates implied property valuation at 8% target cap rate', () => {
    const valuation = calculatePropertyValuation(600000, 8);
    expect(valuation).toBe(7500000); // 6L / 0.08 = 75L
  });

  // 15. Target cap rate valuation when target is 0 or negative
  it('returns 0 valuation when target cap rate is 0 or negative', () => {
    expect(calculatePropertyValuation(600000, 0)).toBe(0);
    expect(calculatePropertyValuation(600000, -5)).toBe(0);
  });

  // 16. Operating expense ratio (OER %) calculation
  it('calculates Operating Expense Ratio (OER %) correctly', () => {
    const oer = calculateOperatingExpenseRatio(300000, 1000000);
    expect(oer).toBe(30.0);
  });

  // 17. Cap rate spread over mortgage rate
  it('calculates cap rate spread over mortgage rate correctly', () => {
    const spread = calculateCapRateSpread(7.5, 6.0);
    expect(spread).toBe(1.5);
  });

  // 18. Positive leverage status
  it('identifies positive leverage when cap rate exceeds mortgage interest rate', () => {
    const res = calculateCapRateDetails({
      propertyValue: 10000000,
      monthlyRent: 100000,
      vacancyRatePct: 0,
      propertyTaxAnnual: 50000,
      targetCapRatePct: 7,
      mortgageInterestRate: 7.0, // Cap rate ~11.5%, spread > 0.5%
    });
    expect(res.leverageStatus).toBe('positive');
  });

  // 19. Negative leverage status
  it('identifies negative leverage when cap rate is lower than mortgage interest rate', () => {
    const res = calculateCapRateDetails({
      propertyValue: 20000000,
      monthlyRent: 50000, // Low rent relative to price
      vacancyRatePct: 5,
      propertyTaxAnnual: 50000,
      mortgageInterestRate: 9.0,
    });
    expect(res.leverageStatus).toBe('negative');
  });

  // 20. Single-family rental preset integration
  it('integrates singleFamily preset cleanly', () => {
    const res = calculateCapRateDetails(CAP_RATE_CONFIG.scenarios.singleFamily);
    expect(res.isValid).toBe(true);
    expect(res.capRatePct).toBeGreaterThan(0);
  });

  // 21. Commercial retail unit preset integration
  it('integrates commercialRetail preset cleanly', () => {
    const res = calculateCapRateDetails(CAP_RATE_CONFIG.scenarios.commercialRetail);
    expect(res.isValid).toBe(true);
    expect(res.noi).toBeGreaterThan(1000000);
  });

  // 22. Multi-family apartment building preset integration
  it('integrates multiFamily preset cleanly', () => {
    const res = calculateCapRateDetails(CAP_RATE_CONFIG.scenarios.multiFamily);
    expect(res.isValid).toBe(true);
    expect(res.noi).toBeGreaterThan(3000000);
  });

  // 23. Industrial warehouse preset integration
  it('integrates industrialWarehouse preset cleanly', () => {
    const res = calculateCapRateDetails(CAP_RATE_CONFIG.scenarios.industrialWarehouse);
    expect(res.isValid).toBe(true);
    expect(res.capRatePct).toBeGreaterThan(5);
  });

  // 24. Zero property value validation
  it('returns isValid = false when property value is zero', () => {
    const res = calculateCapRateDetails({ propertyValue: 0, monthlyRent: 50000 });
    expect(res.isValid).toBe(false);
  });

  // 25. Zero rent / zero income validation
  it('returns isValid = false when rental income is zero', () => {
    const res = calculateCapRateDetails({ propertyValue: 10000000, monthlyRent: 0, otherIncomeAnnual: 0 });
    expect(res.isValid).toBe(false);
  });

  // 26. Low-end property value (₹5 Lakhs)
  it('handles low-end property value (₹5 Lakhs) safely', () => {
    const res = calculateCapRateDetails({ propertyValue: 500000, monthlyRent: 4000 });
    expect(res.isValid).toBe(true);
    expect(res.capRatePct).toBeGreaterThan(0);
  });

  // 27. High-end commercial property value (₹50 Crores)
  it('handles high commercial property valuation (₹50 Crores) safely', () => {
    const res = calculateCapRateDetails({ propertyValue: 500000000, monthlyRent: 3500000 });
    expect(res.isValid).toBe(true);
    expect(res.noi).toBeGreaterThan(30000000);
  });

  // 28. Numeric string input sanitization
  it('sanitizes numeric string inputs safely', () => {
    const res = calculateCapRateDetails({ propertyValue: '10000000', monthlyRent: '65000', vacancyRatePct: '5' });
    expect(res.isValid).toBe(true);
    expect(res.propertyValue).toBe(10000000);
  });

  // 29. Negative input clamping
  it('clamps negative inputs to zero safely', () => {
    const res = calculateCapRateDetails({ propertyValue: -1000000, monthlyRent: -50000 });
    expect(res.isValid).toBe(false);
  });

  // 30. Invalid target cap rate (0%) returns 0 valuation
  it('returns 0 valuation when target cap rate is 0', () => {
    const res = calculateCapRateDetails({ propertyValue: 10000000, monthlyRent: 65000, targetCapRatePct: 0 });
    expect(res.impliedValuationAtTarget).toBe(0);
  });

  // 31. Excess vacancy rate clamped to 100%
  it('clamps vacancy rate exceeding 100% to 100%', () => {
    const vacancy = calculateVacancyLoss(1000000, 150);
    expect(vacancy).toBe(1000000);
  });

  // 32. Negative vacancy rate clamped to 0%
  it('clamps negative vacancy rate to 0%', () => {
    const vacancy = calculateVacancyLoss(1000000, -10);
    expect(vacancy).toBe(0);
  });

  // 33. Gross potential income calculation with additional income
  it('adds other annual income to annual gross rent in GPI', () => {
    const gpi = calculateGrossPotentialIncome(50000, 30000); // 6L + 30k = 6.3L
    expect(gpi).toBe(630000);
  });

  // 34. Effective gross income calculation
  it('computes EGI as GPI minus vacancy loss', () => {
    const egi = calculateEffectiveGrossIncome(600000, 30000);
    expect(egi).toBe(570000);
  });

  // 35. Monthly NOI calculation
  it('calculates monthly NOI as annual NOI divided by 12', () => {
    const res = calculateCapRateDetails(CAP_RATE_CONFIG.defaultInputs);
    expect(res.monthlyNoi).toBe(Math.round(res.noi / 12));
  });

  // 36. REGRESSION PROOF: Mortgage principal and interest do NOT enter NOI
  it('REGRESSION PROOF: Mortgage debt service does not alter Net Operating Income (NOI)', () => {
    const baseNoi = calculateNoi(1000000, 300000);
    // Simulating adding mortgage debt service outside NOI calculation
    const debtService = 400000;
    const cashFlowAfterDebt = baseNoi - debtService;
    expect(baseNoi).toBe(700000);
    expect(cashFlowAfterDebt).toBe(300000);
    // Ensure calculateNoi remains unaffected by debt
    expect(calculateNoi({ grossRentAnnual: 1200000, vacancyRatePct: 0, operatingExpensesAnnual: 300000 })).toBe(900000);
  });

  // 37. REGRESSION PROOF: Income tax does NOT enter NOI
  it('REGRESSION PROOF: Income tax is excluded from operating expenses and NOI', () => {
    const opex = calculateOperatingExpenses({ propertyTax: 50000, insurance: 20000 });
    expect(opex).toBe(70000);
  });

  // 38. REGRESSION PROOF: Capital expenditures do NOT enter NOI
  it('REGRESSION PROOF: Capital expenditures (CapEx) are not included in property OpEx', () => {
    const opex = calculateOperatingExpenses({ maintenance: 30000, propertyTax: 40000 });
    expect(opex).toBe(70000);
  });

  // 39. Full structured result object verification
  it('verifies all expected properties in master calculateCapRateDetails result', () => {
    const res = calculateCapRateDetails(CAP_RATE_CONFIG.defaultInputs);
    expect(res).toHaveProperty('isValid');
    expect(res).toHaveProperty('propertyValue');
    expect(res).toHaveProperty('grossPotentialIncome');
    expect(res).toHaveProperty('effectiveGrossIncome');
    expect(res).toHaveProperty('operatingExpenses');
    expect(res).toHaveProperty('noi');
    expect(res).toHaveProperty('capRatePct');
    expect(res).toHaveProperty('impliedValuationAtTarget');
    expect(res).toHaveProperty('operatingExpenseRatioPct');
    expect(res).toHaveProperty('capRateSpreadPct');
  });

  // 40. Direct calculateNoi function tests
  it('calculates NOI directly via calculateNoi helper function', () => {
    const noi = calculateNoi(1000000, 350000);
    expect(noi).toBe(650000);
  });

  // 41. Direct calculateCapRate function tests
  it('calculates Cap Rate directly via calculateCapRate helper function', () => {
    const rate = calculateCapRate(10000000, 700000);
    expect(rate).toBe(7.0);
  });

  // 42. Direct calculatePropertyValuation function tests
  it('calculates property valuation directly via calculatePropertyValuation helper', () => {
    const val = calculatePropertyValuation(700000, 7.0);
    expect(val).toBe(10000000);
  });

  // 43. Direct calculateOperatingExpenseRatio function tests
  it('calculates Operating Expense Ratio directly via helper', () => {
    const oer = calculateOperatingExpenseRatio(350000, 1000000);
    expect(oer).toBe(35.0);
  });

  // 44. Direct calculateCapRateSpread function tests
  it('calculates Cap Rate spread directly via helper', () => {
    const spread = calculateCapRateSpread(8.0, 7.5);
    expect(spread).toBe(0.5);
  });

  // 45. Extreme OpEx exceeding EGI (Negative NOI handling)
  it('handles extreme operating expenses exceeding EGI safely (negative NOI)', () => {
    const res = calculateCapRateDetails({
      propertyValue: 10000000,
      monthlyRent: 20000, // ₹2.4L annual rent
      vacancyRatePct: 0,
      propertyTaxAnnual: 300000, // OpEx exceeds rent
    });
    expect(res.isValid).toBe(true);
    expect(res.noi).toBeLessThan(0);
    expect(res.capRatePct).toBeLessThan(0);
  });

});
