import { describe, it, expect } from 'vitest';
import {
  calculateRentalYield,
  calculateAnnualGrossRent,
  calculateVacancyLoss,
  calculateEffectiveGrossIncome,
  calculateOperatingExpenses,
  calculateNOI,
  calculateGrossRentalYield,
  calculateNetRentalYield,
  calculateCapRate,
  calculateMonthlyEmi,
  calculateAnnualDebtService,
  calculatePreTaxCashFlow,
  calculateInitialCashInvested,
  calculateCashOnCashReturn,
  calculateAppreciationScenario,
} from '../rental-yield-calculator.js';
import { RENTAL_YIELD_CONFIG } from '../../configs/rental-yield-calculator.config.js';

describe('Rental Yield & Property ROI Financial Engine', () => {

  // 1. Annual rent from monthly rent (Scenario A)
  it('calculates annual gross rent from monthly rent accurately (Scenario A)', () => {
    const rent = calculateAnnualGrossRent(25000, 0);
    expect(rent).toBe(300000);
  });

  // 2. Annual rent direct input
  it('uses annual rent direct input if monthly rent is 0', () => {
    const rent = calculateAnnualGrossRent(0, 360000);
    expect(rent).toBe(360000);
  });

  // 3. Zero vacancy
  it('handles 0% vacancy rate cleanly returning full gross rent as EGI', () => {
    const loss = calculateVacancyLoss(300000, 0);
    expect(loss).toBe(0);
    const egi = calculateEffectiveGrossIncome(300000, loss);
    expect(egi).toBe(300000);
  });

  // 4. Vacancy loss (Scenario B)
  it('calculates 5% vacancy loss accurately (Scenario B)', () => {
    const loss = calculateVacancyLoss(300000, 5);
    expect(loss).toBe(15000);
  });

  // 5. Effective gross income (Scenario B)
  it('calculates effective gross income (EGI) after vacancy loss (Scenario B)', () => {
    const egi = calculateEffectiveGrossIncome(300000, 15000);
    expect(egi).toBe(285000);
  });

  // 6. Operating expense aggregation
  it('aggregates annual operating expenses correctly (Scenario B)', () => {
    const opex = calculateOperatingExpenses({
      propertyTax: 8000,
      monthlyMaintenance: 2000, // 24,000/yr
      insurance: 3000,
      otherExpenses: 25000,
    });
    expect(opex).toBe(60000);
  });

  // 7. Net Operating Income (NOI) (Scenario B)
  it('calculates NOI accurately after operating expenses (Scenario B)', () => {
    const noi = calculateNOI(285000, 60000);
    expect(noi).toBe(225000);
  });

  // 8. Gross rental yield (Scenario A & B)
  it('calculates Gross Rental Yield % using purchase price as denominator (Scenario A)', () => {
    const yieldPct = calculateGrossRentalYield(300000, 5000000);
    expect(yieldPct).toBe(6.00);
  });

  // 9. Net rental yield (Scenario B)
  it('calculates Net Rental Yield % accurately as 4.5% (Scenario B)', () => {
    const yieldPct = calculateNetRentalYield(225000, 5000000);
    expect(yieldPct).toBe(4.50);
  });

  // 10. Cap Rate (Scenario C)
  it('calculates Cap Rate % using current property value as denominator (Scenario C)', () => {
    const capRate = calculateCapRate(225000, 6000000);
    expect(capRate).toBe(3.75);
  });

  // 11. Purchase price denominator isolation
  it('verifies Gross & Net yield use purchase price denominator while Cap Rate uses current value', () => {
    const res = calculateRentalYield({
      propertyPurchasePrice: 5000000,
      currentPropertyValue: 6000000,
      monthlyRent: 25000,
      vacancyRatePercent: 5,
      propertyTax: 8000,
      monthlyMaintenance: 2000,
      insurance: 3000,
      otherExpenses: 25000,
    });

    expect(res.grossRentalYieldPercent).toBe(6.00); // 300,000 / 5,000,000
    expect(res.netRentalYieldPercent).toBe(4.50);   // 225,000 / 5,000,000
    expect(res.capRatePercent).toBe(3.75);         // 225,000 / 6,000,000
  });

  // 12. Current property value default
  it('defaults current property value to purchase price if omitted', () => {
    const res = calculateRentalYield({
      propertyPurchasePrice: 5000000,
      monthlyRent: 25000,
    });
    expect(res.currentPropertyValue).toBe(5000000);
    expect(res.capRatePercent).toBe(res.grossRentalYieldPercent);
  });

  // 13. Loan EMI calculation
  it('calculates monthly home loan EMI accurately', () => {
    const emi = calculateMonthlyEmi(4000000, 8.5, 20);
    expect(emi).toBe(34713);
  });

  // 14. Zero-interest loan EMI calculation
  it('calculates zero-interest loan EMI without division by zero', () => {
    const emi = calculateMonthlyEmi(2400000, 0, 20);
    expect(emi).toBe(10000);
  });

  // 15. Annual debt service
  it('calculates annual debt service from monthly EMI', () => {
    const debt = calculateAnnualDebtService(34713);
    expect(debt).toBe(416556);
  });

  // 16. Pre-tax annual cash flow
  it('calculates pre-tax annual cash flow by subtracting debt service from NOI', () => {
    const { annualCashFlow, monthlyCashFlow } = calculatePreTaxCashFlow(225000, 150000);
    expect(annualCashFlow).toBe(75000);
    expect(monthlyCashFlow).toBe(6250);
  });

  // 17. Monthly cash flow
  it('calculates monthly net cash flow precision', () => {
    const { monthlyCashFlow } = calculatePreTaxCashFlow(240000, 120000);
    expect(monthlyCashFlow).toBe(10000);
  });

  // 18. Initial cash invested
  it('calculates initial cash invested (Down Payment + Acquisition + Renovation)', () => {
    const cash = calculateInitialCashInvested(1500000, 300000, 100000);
    expect(cash).toBe(1900000);
  });

  // 19. Cash-on-cash return (Scenario E)
  it('calculates 10% Cash-on-Cash return accurately (Scenario E)', () => {
    const coc = calculateCashOnCashReturn(150000, 1500000);
    expect(coc).toBe(10.00);
  });

  // 20. Negative cash flow (Scenario F)
  it('handles negative cash flow accurately without clamping to 0 (Scenario F)', () => {
    const { annualCashFlow } = calculatePreTaxCashFlow(200000, 300000);
    expect(annualCashFlow).toBe(-100000);

    const coc = calculateCashOnCashReturn(-100000, 1000000);
    expect(coc).toBe(-10.00);
  });

  // 21. Zero debt scenario
  it('calculates cash flow and cash-on-cash return for unleveraged 100% cash property', () => {
    const res = calculateRentalYield({
      propertyPurchasePrice: 5000000,
      monthlyRent: 25000,
      isFinanced: false,
      downPayment: 5000000,
      acquisitionCosts: 300000,
    });
    expect(res.annualDebtService).toBe(0);
    expect(res.annualPreTaxCashFlow).toBe(300000);
    expect(res.initialCashInvested).toBe(5300000);
    expect(res.cashOnCashReturnPercent).toBe(5.66);
  });

  // 22. Financed property scenario (Scenario D)
  it('calculates complete metrics for financed property (Scenario D)', () => {
    const res = calculateRentalYield({
      propertyPurchasePrice: 6000000,
      monthlyRent: 30000,
      isFinanced: true,
      loanAmount: 4000000,
      interestRatePercent: 8.5,
      loanTenureYears: 20,
      downPayment: 2000000,
      acquisitionCosts: 360000,
    });
    expect(res.annualGrossRent).toBe(360000);
    expect(res.monthlyEmi).toBe(34713);
    expect(res.annualDebtService).toBe(416556);
    expect(res.annualPreTaxCashFlow).toBe(-56556); // Unclamped negative cash flow!
  });

  // 23. Zero initial cash invested handling
  it('returns 0% Cash-on-Cash return when initial cash invested is 0', () => {
    const coc = calculateCashOnCashReturn(100000, 0);
    expect(coc).toBe(0);
  });

  // 24. Appreciation scenario (Scenario G)
  it('calculates isolated property appreciation scenario without polluting rental yield or NOI (Scenario G)', () => {
    const app = calculateAppreciationScenario(5000000, 5, 10);
    expect(app.futureValue).toBe(8144473);
    expect(app.totalAppreciation).toBe(3144473);

    const res = calculateRentalYield({
      propertyPurchasePrice: 5000000,
      monthlyRent: 25000,
      annualAppreciationRatePercent: 5,
      holdingYears: 10,
    });
    expect(res.appreciationScenario.futureValue).toBe(8144473);
    expect(res.grossRentalYieldPercent).toBe(6.00); // Intact!
    expect(res.noi).toBe(300000); // Intact!
  });

  // 25. Appreciation disabled
  it('handles 0% appreciation rate cleanly', () => {
    const app = calculateAppreciationScenario(5000000, 0, 10);
    expect(app.futureValue).toBe(5000000);
    expect(app.totalAppreciation).toBe(0);
  });

  // 26. Numeric-string sanitization
  it('sanitizes numeric string inputs safely', () => {
    const res = calculateRentalYield({
      propertyPurchasePrice: '5000000',
      monthlyRent: '25000',
      vacancyRatePercent: '5',
    });
    expect(res.propertyPurchasePrice).toBe(5000000);
    expect(res.annualGrossRent).toBe(300000);
    expect(res.vacancyLoss).toBe(15000);
  });

  // 27. Negative input handling
  it('sanitizes negative inputs to 0 safely', () => {
    const res = calculateRentalYield({
      propertyPurchasePrice: -5000000,
      monthlyRent: -25000,
    });
    expect(res.isValid).toBe(false);
  });

  // 28. Large property values
  it('handles very large commercial property values (e.g. ₹100 Crore) cleanly', () => {
    const res = calculateRentalYield({
      propertyPurchasePrice: 1000000000,
      monthlyRent: 7500000,
    });
    expect(res.annualGrossRent).toBe(90000000);
    expect(res.grossRentalYieldPercent).toBe(9.00);
  });

  // 29. Large rental values
  it('calculates precise yield for high rental yields', () => {
    const res = calculateRentalYield({
      propertyPurchasePrice: 10000000,
      monthlyRent: 100000,
    });
    expect(res.grossRentalYieldPercent).toBe(12.00);
  });

  // 30. Multiple operating expenses
  it('aggregates all operating expense components into total Opex accurately', () => {
    const res = calculateRentalYield({
      propertyPurchasePrice: 5000000,
      monthlyRent: 25000,
      propertyTax: 10000,
      monthlyMaintenance: 2000, // 24k/yr
      insurance: 5000,
      managementFees: 12000,
      otherExpenses: 3000,
    });
    expect(res.operatingExpenses).toBe(54000); // 10k + 24k + 5k + 12k + 3k
    expect(res.noi).toBe(246000);
  });

  // 31. Existing EMI override
  it('uses existing monthly EMI override when provided', () => {
    const res = calculateRentalYield({
      propertyPurchasePrice: 6000000,
      monthlyRent: 30000,
      isFinanced: true,
      existingMonthlyEmi: 25000,
    });
    expect(res.monthlyEmi).toBe(25000);
    expect(res.annualDebtService).toBe(300000);
  });

  // 32. No double-counting of debt service
  it('verifies existing EMI override takes precedence over loan calculation without double counting', () => {
    const res = calculateRentalYield({
      propertyPurchasePrice: 6000000,
      monthlyRent: 30000,
      isFinanced: true,
      loanAmount: 4000000,
      interestRatePercent: 8.5,
      loanTenureYears: 20,
      existingMonthlyEmi: 30000,
    });
    expect(res.monthlyEmi).toBe(30000);
    expect(res.annualDebtService).toBe(360000);
  });

  // 33. CRITICAL ACCOUNTING TEST: Mortgage exclusion from NOI
  it('CRITICAL ACCOUNTING PROOF: verifies mortgage debt service DOES NOT reduce NOI', () => {
    const unleveragedRes = calculateRentalYield({
      propertyPurchasePrice: 5000000,
      monthlyRent: 25000,
      propertyTax: 10000,
      isFinanced: false,
    });

    const leveragedRes = calculateRentalYield({
      propertyPurchasePrice: 5000000,
      monthlyRent: 25000,
      propertyTax: 10000,
      isFinanced: true,
      loanAmount: 4000000,
      interestRatePercent: 8.5,
      loanTenureYears: 20,
    });

    // NOI MUST BE IDENTICAL!
    expect(unleveragedRes.noi).toBe(290000);
    expect(leveragedRes.noi).toBe(290000);
    expect(unleveragedRes.netRentalYieldPercent).toBe(5.80);
    expect(leveragedRes.netRentalYieldPercent).toBe(5.80);

    // Debt service reduces cash flow only!
    expect(unleveragedRes.annualPreTaxCashFlow).toBe(290000);
    expect(leveragedRes.annualPreTaxCashFlow).toBe(290000 - leveragedRes.annualDebtService);
  });

  // 34. Regression scenarios (Empty Options)
  it('handles empty options object safely returning invalid state', () => {
    const res = calculateRentalYield();
    expect(res.isValid).toBe(false);
    expect(res.propertyPurchasePrice).toBe(0);
  });

  // 35. Preset calculations integration
  it('integrates cleanly with commercial office preset', () => {
    const preset = RENTAL_YIELD_CONFIG.scenarios.commercialOffice;
    const res = calculateRentalYield(preset);

    expect(res.propertyPurchasePrice).toBe(12000000);
    expect(res.annualGrossRent).toBe(900000);
    expect(res.grossRentalYieldPercent).toBe(7.50);
    expect(res.vacancyLoss).toBe(72000);
    expect(res.effectiveGrossIncome).toBe(828000);
    expect(res.operatingExpenses).toBe(122000); // 25k + 48k + 8k + 36k + 5k = 122k
    expect(res.noi).toBe(706000);
    expect(res.netRentalYieldPercent).toBe(5.88); // 706,000 / 12,000,000
  });

  // 36. OPERATING EXPENSE REGRESSION TEST: Non-duplication of Maintenance & Society fees
  it('OPERATING EXPENSE REGRESSION PROOF: prevents double-counting if both monthlyMaintenance and societyCharges are supplied', () => {
    const opexWithMaint = calculateOperatingExpenses({
      monthlyMaintenance: 2000, // 24,000/yr
    });
    expect(opexWithMaint).toBe(24000);

    const opexWithBoth = calculateOperatingExpenses({
      monthlyMaintenance: 2000,
      societyCharges: 2000, // legacy duplicate field
    });
    // Must NOT double-count to 48,000! Must remain 24,000!
    expect(opexWithBoth).toBe(24000);
  });
});
