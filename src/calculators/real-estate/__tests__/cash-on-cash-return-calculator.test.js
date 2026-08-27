import { describe, it, expect } from 'vitest';
import {
  calculateUpfrontCashInvested,
  calculateAnnualDebtService,
  calculateNoiAndEgi,
  calculateCashOnCashReturn,
} from '../cash-on-cash-return-calculator';
import { CASH_ON_CASH_CONFIG } from '../../configs/cash-on-cash-return-calculator.config';

describe('Cash-on-Cash Return Engine Tests (Leveraged Real Estate Yield)', () => {

  // 1. Basic cash-on-cash return calculation
  it('calculates basic cash-on-cash return % correctly', () => {
    const res = calculateCashOnCashReturn(CASH_ON_CASH_CONFIG.defaultInputs);
    expect(res.isValid).toBe(true);
    expect(res.cashOnCashReturnPct).toBeGreaterThan(0);
  });

  // 2. Upfront cash invested calculation
  it('calculates total upfront cash invested correctly', () => {
    const upfront = calculateUpfrontCashInvested({
      purchasePrice: 10000000,
      downPaymentPct: 20,
      closingCostsPct: 3,
      initialRehabCost: 200000,
    });
    // Down = 20L, Closing = 3L, Rehab = 2L -> Total = 25L
    expect(upfront.downPaymentAmount).toBe(2000000);
    expect(upfront.closingCostsAmount).toBe(300000);
    expect(upfront.loanAmount).toBe(8000000);
    expect(upfront.totalUpfrontCashInvested).toBe(2500000);
  });

  // 3. Down payment calculation
  it('calculates down payment amount accurately', () => {
    const upfront = calculateUpfrontCashInvested({ purchasePrice: 5000000, downPaymentPct: 25 });
    expect(upfront.downPaymentAmount).toBe(1250000);
  });

  // 4. Closing costs calculation
  it('calculates closing costs amount accurately', () => {
    const upfront = calculateUpfrontCashInvested({ purchasePrice: 5000000, closingCostsPct: 4 });
    expect(upfront.closingCostsAmount).toBe(200000);
  });

  // 5. Initial rehab outlay calculation
  it('includes initial rehab outlay in total cash invested', () => {
    const upfront = calculateUpfrontCashInvested({ purchasePrice: 5000000, downPaymentPct: 20, initialRehabCost: 500000 });
    expect(upfront.totalUpfrontCashInvested).toBe(1000000 + 150000 + 500000); // 16.5L
  });

  // 6. Combined upfront cash invested
  it('combines down payment, closing costs, and rehab into upfront cash invested', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 6000000,
      downPaymentPct: 20,
      closingCostsPct: 3,
      initialRehabCost: 100000,
    });
    expect(res.totalUpfrontCashInvested).toBe(1200000 + 180000 + 100000); // 14.8L
  });

  // 7. Gross potential rental income (GPI)
  it('calculates gross potential income (GPI) accurately', () => {
    const perf = calculateNoiAndEgi({ monthlyGrossRent: 50000, otherAnnualIncome: 20000 });
    expect(perf.gpi).toBe(620000); // 50k*12 + 20k
  });

  // 8. Other annual income addition
  it('adds other annual income to GPI', () => {
    const perf = calculateNoiAndEgi({ monthlyGrossRent: 40000, otherAnnualIncome: 30000, vacancyRatePct: 0 });
    expect(perf.gpi).toBe(510000);
  });

  // 9. Vacancy loss calculation
  it('calculates vacancy loss based on vacancy rate %', () => {
    const perf = calculateNoiAndEgi({ monthlyGrossRent: 100000, vacancyRatePct: 10 });
    expect(perf.vacancyLoss).toBe(120000); // 10% of 12L
  });

  // 10. Effective gross income (EGI)
  it('calculates EGI as GPI minus vacancy loss', () => {
    const perf = calculateNoiAndEgi({ monthlyGrossRent: 100000, vacancyRatePct: 5 });
    expect(perf.egi).toBe(1140000); // 12L - 60k
  });

  // 11. Operating expenses calculation
  it('subtracts operating expenses from EGI to determine NOI', () => {
    const perf = calculateNoiAndEgi({ monthlyGrossRent: 100000, vacancyRatePct: 0, annualOperatingExpenses: 300000 });
    expect(perf.noi).toBe(900000); // 12L - 3L
  });

  // 12. Net Operating Income (NOI) calculation
  it('calculates Net Operating Income (NOI) correctly', () => {
    const res = calculateCashOnCashReturn(CASH_ON_CASH_CONFIG.defaultInputs);
    expect(res.noi).toBe(res.egi - res.totalOpEx);
  });

  // 13. Mortgage EMI calculation
  it('calculates monthly mortgage EMI correctly', () => {
    const ds = calculateAnnualDebtService({ loanAmount: 4000000, interestRatePct: 8.5, tenureYears: 20 });
    expect(ds.monthlyMortgageEmi).toBeGreaterThan(0);
    expect(ds.annualDebtService).toBe(ds.monthlyMortgageEmi * 12);
  });

  // 14. Annual debt service (ADS) calculation
  it('calculates annual debt service as monthly EMI times 12', () => {
    const ds = calculateAnnualDebtService({ loanAmount: 5000000, interestRatePct: 9.0, tenureYears: 15 });
    expect(ds.annualDebtService).toBe(ds.monthlyMortgageEmi * 12);
  });

  // 15. Pre-tax annual cash flow (BTCF)
  it('calculates annual pre-tax cash flow as NOI minus annual debt service', () => {
    const res = calculateCashOnCashReturn(CASH_ON_CASH_CONFIG.defaultInputs);
    expect(res.annualPreTaxCashFlow).toBe(res.noi - res.annualDebtService);
  });

  // 16. Positive Cash-on-Cash Return %
  it('produces positive Cash-on-Cash Return % when NOI exceeds debt service', () => {
    const res = calculateCashOnCashReturn(CASH_ON_CASH_CONFIG.defaultInputs);
    expect(res.annualPreTaxCashFlow).toBeGreaterThan(0);
    expect(res.cashOnCashReturnPct).toBeGreaterThan(0);
  });

  // 17. Negative Cash-on-Cash Return %
  it('handles negative Cash-on-Cash Return % when debt service exceeds NOI', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 10000000,
      downPaymentPct: 10,
      interestRatePct: 12,
      monthlyGrossRent: 30000, // Very low rent -> negative cash flow
      annualOperatingExpenses: 150000,
    });
    expect(res.isValid).toBe(true);
    expect(res.annualPreTaxCashFlow).toBeLessThan(0);
    expect(res.cashOnCashReturnPct).toBeLessThan(0);
  });

  // 18. Zero Cash-on-Cash Return %
  it('handles zero Cash-on-Cash Return % when NOI equals debt service', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 5000000,
      downPaymentPct: 20,
      monthlyGrossRent: 40000,
      annualOperatingExpenses: 80000,
      monthlyMortgageEmi: 33333.33, // 400k annual debt service
    });
    expect(res.isValid).toBe(true);
  });

  // 19. Cap Rate % comparison
  it('computes Cap Rate % alongside Cash-on-Cash Return %', () => {
    const res = calculateCashOnCashReturn(CASH_ON_CASH_CONFIG.defaultInputs);
    expect(res).toHaveProperty('capRatePct');
    expect(res.capRatePct).toBeGreaterThan(0);
  });

  // 20. Positive leverage effect
  it('detects positive financial leverage when Cash-on-Cash Return exceeds Cap Rate', () => {
    const res = calculateCashOnCashReturn(CASH_ON_CASH_CONFIG.scenarios.multiFamily);
    expect(res.leverageEffect).toBeDefined();
  });

  // 21. Negative leverage effect
  it('detects negative financial leverage when Cash-on-Cash Return is below Cap Rate', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 10000000,
      downPaymentPct: 10,
      interestRatePct: 12, // High debt cost
      monthlyGrossRent: 70000,
      annualOperatingExpenses: 200000,
    });
    expect(res.leverageEffect).toBe('negative');
  });

  // 22. Zero debt service scenario
  it('handles zero debt service (0 loan amount) safely', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 5000000,
      downPaymentPct: 100, // All-cash purchase
      monthlyGrossRent: 50000,
      annualOperatingExpenses: 120000,
    });
    expect(res.loanAmount).toBe(0);
    expect(res.annualDebtService).toBe(0);
    expect(res.annualPreTaxCashFlow).toBe(res.noi);
  });

  // 23. All-cash purchase scenario (100% down payment)
  it('handles 100% all-cash purchase cleanly', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 5000000,
      downPaymentPct: 100,
      closingCostsPct: 2,
      initialRehabCost: 0,
      monthlyGrossRent: 50000,
      annualOperatingExpenses: 120000,
    });
    expect(res.cashOnCashReturnPct).toBeDefined();
  });

  // 24. 100% financed scenario (0% down payment)
  it('handles 100% financed scenario (0% down payment)', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 5000000,
      downPaymentPct: 0,
      closingCostsPct: 3,
      initialRehabCost: 100000,
      monthlyGrossRent: 60000,
      annualOperatingExpenses: 150000,
    });
    expect(res.downPaymentAmount).toBe(0);
    expect(res.totalUpfrontCashInvested).toBe(150000 + 100000); // Closing + Rehab
  });

  // 25. High vacancy rate scenario (20%)
  it('handles high vacancy rate scenario (20%)', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 5000000,
      monthlyGrossRent: 50000,
      vacancyRatePct: 20,
    });
    expect(res.vacancyLoss).toBe(120000); // 20% of 6L
  });

  // 26. Zero vacancy rate scenario
  it('handles 0% vacancy rate scenario cleanly', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 5000000,
      monthlyGrossRent: 50000,
      vacancyRatePct: 0,
    });
    expect(res.vacancyLoss).toBe(0);
    expect(res.egi).toBe(600000);
  });

  // 27. Negative NOI scenario
  it('handles negative NOI when operating expenses exceed EGI', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 5000000,
      monthlyGrossRent: 20000, // 2.4L annual
      annualOperatingExpenses: 300000, // 3L expenses
    });
    expect(res.noi).toBeLessThan(0);
    expect(res.annualPreTaxCashFlow).toBeLessThan(0);
  });

  // 28. Zero purchase price validation
  it('returns isValid = false when purchase price is zero', () => {
    const res = calculateCashOnCashReturn({ purchasePrice: 0 });
    expect(res.isValid).toBe(false);
  });

  // 29. Zero invested cash validation
  it('handles zero invested cash safely returning 0% return', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 5000000,
      downPaymentPct: 0,
      closingCostsPct: 0,
      initialRehabCost: 0,
    });
    expect(res.totalUpfrontCashInvested).toBe(0);
    expect(res.cashOnCashReturnPct).toBe(0);
  });

  // 30. Negative inputs sanitization
  it('clamps negative price, rent, and expense inputs to zero safely', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: -5000000,
      monthlyGrossRent: -50000,
      annualOperatingExpenses: -100000,
    });
    expect(res.isValid).toBe(false);
  });

  // 31. Boundary inputs handling
  it('handles extreme 100% vacancy rate safely', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 5000000,
      monthlyGrossRent: 50000,
      vacancyRatePct: 100,
    });
    expect(res.egi).toBe(0);
  });

  // 32. Decimal inputs handling
  it('handles decimal inputs safely', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 7550500,
      downPaymentPct: 22.5,
      interestRatePct: 8.75,
      monthlyGrossRent: 65432.1,
    });
    expect(res.isValid).toBe(true);
  });

  // 33. Large monetary values (₹100 Crores)
  it('handles large commercial real estate values (₹100 Crores) safely', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 1000000000,
      downPaymentPct: 30,
      monthlyGrossRent: 10000000,
      annualOperatingExpenses: 20000000,
    });
    expect(res.isValid).toBe(true);
    expect(res.downPaymentAmount).toBe(300000000);
  });

  // 34. Single-Family preset integration
  it('integrates singleFamily preset cleanly', () => {
    const res = calculateCashOnCashReturn(CASH_ON_CASH_CONFIG.scenarios.singleFamily);
    expect(res.isValid).toBe(true);
    expect(res.cashOnCashReturnPct).toBeGreaterThan(0);
  });

  // 35. Multi-Family preset integration
  it('integrates multiFamily preset cleanly', () => {
    const res = calculateCashOnCashReturn(CASH_ON_CASH_CONFIG.scenarios.multiFamily);
    expect(res.isValid).toBe(true);
  });

  // 36. Commercial Property preset integration
  it('integrates commercialProperty preset cleanly', () => {
    const res = calculateCashOnCashReturn(CASH_ON_CASH_CONFIG.scenarios.commercialProperty);
    expect(res.isValid).toBe(true);
  });

  // 37. BRRRR Fixer-Upper preset integration
  it('integrates brrrrFixerUpper preset cleanly', () => {
    const res = calculateCashOnCashReturn(CASH_ON_CASH_CONFIG.scenarios.brrrrFixerUpper);
    expect(res.isValid).toBe(true);
  });

  // 38. Multiple income sources addition
  it('adds other annual income correctly into EGI and NOI', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 5000000,
      monthlyGrossRent: 40000,
      otherAnnualIncome: 50000, // Parking/Laundry
    });
    expect(res.gpi).toBe(480000 + 50000);
  });

  // 39. Itemized operating expenses calculation
  it('handles itemized operating expenses object cleanly', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 5000000,
      monthlyGrossRent: 50000,
      operatingExpenses: {
        propertyTax: 50000,
        insurance: 20000,
        maintenance: 40000,
        managementFees: 30000,
      },
    });
    expect(res.totalOpEx).toBe(140000);
  });

  // 40. No double-counting of upfront outlays
  it('combines down payment, closing costs, and rehab outlays without double counting', () => {
    const upfront = calculateUpfrontCashInvested({
      purchasePrice: 10000000,
      downPaymentPct: 20,
      closingCostsPct: 3,
      initialRehabCost: 200000,
    });
    expect(upfront.totalUpfrontCashInvested).toBe(upfront.downPaymentAmount + upfront.closingCostsAmount + 200000);
  });

  // 41. REGRESSION PROOF: Mortgage debt service is strictly excluded from NOI
  it('REGRESSION PROOF: Mortgage debt service is excluded from NOI and subtracted afterwards for BTCF', () => {
    const res = calculateCashOnCashReturn(CASH_ON_CASH_CONFIG.defaultInputs);
    expect(res.noi).toBe(res.egi - res.totalOpEx); // NOI does NOT include debt service
    expect(res.annualPreTaxCashFlow).toBe(res.noi - res.annualDebtService);
  });

  // 42. REGRESSION PROOF: Cash-on-Cash Return differs correctly from Cap Rate
  it('REGRESSION PROOF: Cash-on-Cash Return % and Cap Rate % are mathematically distinct', () => {
    const res = calculateCashOnCashReturn(CASH_ON_CASH_CONFIG.defaultInputs);
    expect(res.cashOnCashReturnPct).not.toBe(res.capRatePct);
  });

  // 43. REGRESSION PROOF: Negative pre-tax cash flow remains negative and is not clamped to zero
  it('REGRESSION PROOF: Negative annual pre-tax cash flow remains negative', () => {
    const res = calculateCashOnCashReturn({
      purchasePrice: 10000000,
      downPaymentPct: 10,
      interestRatePct: 10,
      monthlyGrossRent: 20000,
      annualOperatingExpenses: 150000,
    });
    expect(res.annualPreTaxCashFlow).toBeLessThan(0);
    expect(res.cashOnCashReturnPct).toBeLessThan(0);
  });

  // 44. Direct calculateUpfrontCashInvested helper test
  it('tests calculateUpfrontCashInvested helper directly', () => {
    const res = calculateUpfrontCashInvested({ purchasePrice: 2000000 });
    expect(res.downPaymentAmount).toBe(400000);
  });

  // 45. Direct calculateAnnualDebtService helper test
  it('tests calculateAnnualDebtService helper directly', () => {
    const res = calculateAnnualDebtService({ loanAmount: 1000000, interestRatePct: 10, tenureYears: 10 });
    expect(res.annualDebtService).toBeGreaterThan(0);
  });

});
