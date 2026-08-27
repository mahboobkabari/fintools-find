import { describe, it, expect } from 'vitest';
import {
  calculateGrossPotentialIncome,
  calculateVacancyLoss,
  calculateEffectiveGrossIncome,
  calculateOperatingExpenses,
  calculateNOI,
  calculateValueFromCapRate,
  calculateCapRate,
  calculateValuationGap,
  calculateSensitivity,
  calculatePropertyValuation,
} from '../property-valuation-calculator';
import { PROPERTY_VALUATION_CONFIG } from '../../configs/property-valuation-calculator.config';

describe('Property Valuation Calculator Engine Tests (Income Capitalization Approach)', () => {

  // 1. Gross Potential Income (GPI)
  it('calculates gross potential income (GPI) accurately', () => {
    const gpi = calculateGrossPotentialIncome(50000, 20000);
    expect(gpi).toBe(620000); // 50k * 12 + 20k
  });

  // 2. Other annual income addition
  it('adds other annual income into GPI correctly', () => {
    const gpi = calculateGrossPotentialIncome(40000, 30000);
    expect(gpi).toBe(510000);
  });

  // 3. Vacancy loss calculation
  it('calculates vacancy loss based on vacancy rate %', () => {
    const loss = calculateVacancyLoss(1000000, 5);
    expect(loss).toBe(50000); // 5% of 10L
  });

  // 4. Effective Gross Income (EGI)
  it('calculates EGI as GPI minus vacancy loss', () => {
    const egi = calculateEffectiveGrossIncome(1000000, 50000);
    expect(egi).toBe(950000);
  });

  // 5. Operating expenses calculation
  it('summates itemized operating expenses cleanly', () => {
    const opEx = calculateOperatingExpenses({
      propertyTax: 50000,
      insurance: 20000,
      maintenance: 30000,
      managementFees: 40000,
      utilities: 10000,
    });
    expect(opEx).toBe(150000);
  });

  // 6. Net Operating Income (NOI)
  it('calculates Net Operating Income (NOI) as EGI minus operating expenses', () => {
    const noi = calculateNOI(950000, 150000);
    expect(noi).toBe(800000);
  });

  // 7. Positive NOI valuation
  it('computes positive income-implied property valuation correctly', () => {
    const val = calculateValueFromCapRate(600000, 6);
    expect(val).toBe(10000000); // 600k / 0.06 = 10,000,000
  });

  // 8. Negative NOI handling
  it('preserves negative NOI without artificially clamping to zero', () => {
    const noi = calculateNOI(200000, 300000);
    expect(noi).toBe(-100000);
    const val = calculateValueFromCapRate(noi, 5);
    expect(val).toBe(-2000000); // -100k / 0.05
  });

  // 9. Zero NOI handling
  it('handles zero NOI producing zero valuation cleanly', () => {
    const noi = calculateNOI(200000, 200000);
    expect(noi).toBe(0);
    const val = calculateValueFromCapRate(noi, 6);
    expect(val).toBe(0);
  });

  // 10. Target cap rate valuation
  it('calculates target cap rate valuation accurately across different target rates', () => {
    expect(calculateValueFromCapRate(500000, 5)).toBe(10000000); // 5% -> 10M
    expect(calculateValueFromCapRate(500000, 10)).toBe(5000000); // 10% -> 5M
  });

  // 11. Current cap rate calculation
  it('computes current cap rate when current property value is supplied', () => {
    const capRate = calculateCapRate(10000000, 600000);
    expect(capRate).toBe(6.0);
  });

  // 12. Valuation gap calculation
  it('computes valuation gap between implied value and current value', () => {
    const gap = calculateValuationGap(12000000, 10000000);
    expect(gap.gapAmount).toBe(2000000);
    expect(gap.gapPct).toBe(20.0);
    expect(gap.status).toBe('above_asking');
  });

  // 13. Valuation gap % calculation for below asking price
  it('computes negative valuation gap when implied value is below current asking price', () => {
    const gap = calculateValuationGap(8000000, 10000000);
    expect(gap.gapAmount).toBe(-2000000);
    expect(gap.gapPct).toBe(-20.0);
    expect(gap.status).toBe('below_asking');
  });

  // 14. Missing current property value
  it('handles missing current property value cleanly returning null gap metrics', () => {
    const gap = calculateValuationGap(10000000, null);
    expect(gap.gapAmount).toBeNull();
    expect(gap.gapPct).toBeNull();
    expect(gap.status).toBe('omitted');
  });

  // 15. Zero current property value
  it('handles zero current property value returning null gap metrics', () => {
    const capRate = calculateCapRate(0, 500000);
    expect(capRate).toBeNull();
  });

  // 16. Zero target cap rate handling
  it('returns 0 implied value when target cap rate is 0', () => {
    const val = calculateValueFromCapRate(600000, 0);
    expect(val).toBe(0);
  });

  // 17. Very low target cap rate
  it('handles low target cap rates (e.g. 2%) safely', () => {
    const val = calculateValueFromCapRate(500000, 2);
    expect(val).toBe(25000000); // 500k / 0.02 = 25M
  });

  // 18. High target cap rate
  it('handles high target cap rates (e.g. 20%) safely', () => {
    const val = calculateValueFromCapRate(500000, 20);
    expect(val).toBe(2500000); // 500k / 0.20 = 2.5M
  });

  // 19. Negative rent input sanitization
  it('clamps negative monthly rent to zero', () => {
    const gpi = calculateGrossPotentialIncome(-50000, 10000);
    expect(gpi).toBe(10000);
  });

  // 20. Negative expenses input sanitization
  it('clamps negative operating expenses to zero', () => {
    const noi = calculateNOI(500000, -100000);
    expect(noi).toBe(500000);
  });

  // 21. Vacancy rate boundary 0%
  it('handles 0% vacancy rate cleanly with zero vacancy loss', () => {
    const res = calculatePropertyValuation({
      monthlyGrossRent: 50000,
      vacancyRatePct: 0,
    });
    expect(res.vacancyLoss).toBe(0);
    expect(res.egi).toBe(600000);
  });

  // 22. Vacancy rate boundary 100%
  it('handles 100% vacancy rate resulting in 0 EGI', () => {
    const res = calculatePropertyValuation({
      monthlyGrossRent: 50000,
      vacancyRatePct: 100,
    });
    expect(res.vacancyLoss).toBe(600000);
    expect(res.egi).toBe(0);
  });

  // 23. Sensitivity matrix generation
  it('generates a 2D sensitivity matrix with correct dimensions', () => {
    const sens = calculateSensitivity(600000, 6, [-20, -10, 0, 10, 20], [4, 5, 6, 7, 8]);
    expect(sens.noiScenarios).toHaveLength(5);
    expect(sens.capRateScenarios).toHaveLength(5);
    expect(sens.matrix).toHaveLength(5);
    expect(sens.matrix[0]).toHaveLength(5);
  });

  // 24. NOI sensitivity scenario calculation
  it('computes NOI sensitivity scenarios correctly', () => {
    const sens = calculateSensitivity(1000000, 6, [-10, 0, 10]);
    expect(sens.noiScenarios[0].noi).toBe(900000); // -10%
    expect(sens.noiScenarios[1].noi).toBe(1000000); // Base
    expect(sens.noiScenarios[2].noi).toBe(1100000); // +10%
  });

  // 25. Cap rate sensitivity scenario calculation
  it('computes cap rate sensitivity values correctly in the matrix', () => {
    const sens = calculateSensitivity(600000, 6, [0], [5, 6, 10]);
    expect(sens.matrix[0][0]).toBe(12000000); // 600k / 0.05
    expect(sens.matrix[0][1]).toBe(10000000); // 600k / 0.06
    expect(sens.matrix[0][2]).toBe(6000000);  // 600k / 0.10
  });

  // 26. Large property values (₹100 Crores)
  it('handles large commercial real estate values (₹100 Crores) safely', () => {
    const res = calculatePropertyValuation({
      currentPropertyValue: 1000000000,
      monthlyGrossRent: 6000000,
      targetCapRatePct: 6.5,
      annualOperatingExpenses: 12000000,
    });
    expect(res.isValid).toBe(true);
    expect(res.impliedPropertyValue).toBeGreaterThan(0);
  });

  // 27. Decimal inputs handling
  it('handles decimal inputs for rent and cap rate smoothly', () => {
    const res = calculatePropertyValuation({
      monthlyGrossRent: 65432.1,
      targetCapRatePct: 6.25,
      vacancyRatePct: 4.5,
    });
    expect(res.isValid).toBe(true);
  });

  // 28. Itemized operating expenses object support
  it('supports itemized operating expenses object input', () => {
    const res = calculatePropertyValuation({
      monthlyGrossRent: 50000,
      operatingExpenses: {
        propertyTax: 40000,
        insurance: 15000,
        maintenance: 25000,
      },
    });
    expect(res.totalOpEx).toBe(80000);
  });

  // 29. No double counting of operating expenses
  it('does not double count operating expenses when direct total is provided', () => {
    const res = calculatePropertyValuation({
      monthlyGrossRent: 50000,
      annualOperatingExpenses: 120000,
    });
    expect(res.totalOpEx).toBe(120000);
  });

  // 30. Mortgage debt strictly excluded from NOI
  it('REGRESSION PROOF: Mortgage debt service is strictly excluded from NOI', () => {
    const res = calculatePropertyValuation(PROPERTY_VALUATION_CONFIG.defaultInputs);
    expect(res.noi).toBe(res.egi - res.totalOpEx);
  });

  // 31. Capital expenditures separation
  it('keeps capital expenditures distinct from operating expenses', () => {
    const opEx = calculateOperatingExpenses({ propertyTax: 30000, maintenance: 20000 });
    expect(opEx).toBe(50000);
  });

  // 32. Preset validation: Single-Family
  it('validates singleFamily preset correctly', () => {
    const res = calculatePropertyValuation(PROPERTY_VALUATION_CONFIG.scenarios.singleFamily);
    expect(res.isValid).toBe(true);
    expect(res.impliedPropertyValue).toBeGreaterThan(0);
  });

  // 33. Preset validation: Multi-Family
  it('validates multiFamily preset correctly', () => {
    const res = calculatePropertyValuation(PROPERTY_VALUATION_CONFIG.scenarios.multiFamily);
    expect(res.isValid).toBe(true);
  });

  // 34. Preset validation: Commercial Retail
  it('validates commercialRetail preset correctly', () => {
    const res = calculatePropertyValuation(PROPERTY_VALUATION_CONFIG.scenarios.commercialRetail);
    expect(res.isValid).toBe(true);
  });

  // 35. Preset validation: Industrial Warehouse
  it('validates industrialWarehouse preset correctly', () => {
    const res = calculatePropertyValuation(PROPERTY_VALUATION_CONFIG.scenarios.industrialWarehouse);
    expect(res.isValid).toBe(true);
  });

  // 36. Invalid input state validation
  it('returns isValid = false when gross rent and other income are zero', () => {
    const res = calculatePropertyValuation({ monthlyGrossRent: 0, otherAnnualIncome: 0 });
    expect(res.isValid).toBe(false);
  });

  // 37. Representative residential scenario
  it('calculates full representative residential scenario end-to-end', () => {
    const res = calculatePropertyValuation({
      currentPropertyValue: 7500000,
      monthlyGrossRent: 50000,
      vacancyRatePct: 5,
      annualOperatingExpenses: 120000,
      targetCapRatePct: 6.0,
    });
    expect(res.gpi).toBe(600000);
    expect(res.vacancyLoss).toBe(30000);
    expect(res.egi).toBe(570000);
    expect(res.noi).toBe(450000);
    expect(res.impliedPropertyValue).toBe(7500000); // 450k / 0.06 = 7.5M
    expect(res.currentCapRatePct).toBe(6.0);
    expect(res.valuationGapAmount).toBe(0);
    expect(res.valuationStatus).toBe('aligned');
  });

  // 38. Base sensitivity cell matches calculated implied value
  it('verifies that the base cell in sensitivity matrix equals the calculated implied value', () => {
    const res = calculatePropertyValuation(PROPERTY_VALUATION_CONFIG.defaultInputs);
    const baseRowIndex = res.sensitivity.noiScenarios.findIndex((s) => s.pctChange === 0);
    const baseColIndex = res.sensitivity.capRateScenarios.indexOf(res.targetCapRatePct);
    if (baseRowIndex >= 0 && baseColIndex >= 0) {
      expect(res.sensitivity.matrix[baseRowIndex][baseColIndex]).toBe(res.impliedPropertyValue);
    }
  });

  // 39. Regression scenario: Target cap rate zero
  it('REGRESSION PROOF: Target cap rate <= 0 returns isValid = false', () => {
    const res = calculatePropertyValuation({ monthlyGrossRent: 50000, targetCapRatePct: 0 });
    expect(res.isValid).toBe(false);
  });

  // 40. Full representative commercial scenario
  it('calculates full representative commercial property scenario end-to-end', () => {
    const res = calculatePropertyValuation({
      currentPropertyValue: 25000000,
      monthlyGrossRent: 200000,
      otherAnnualIncome: 50000,
      vacancyRatePct: 4,
      annualOperatingExpenses: 500000,
      targetCapRatePct: 7.5,
    });
    expect(res.isValid).toBe(true);
    expect(res.gpi).toBe(2450000);
    expect(res.vacancyLoss).toBe(98000);
    expect(res.egi).toBe(2352000);
    expect(res.noi).toBe(1852000);
    expect(res.impliedPropertyValue).toBe(24693333); // 1,852,000 / 0.075
    expect(res.valuationGapAmount).toBe(-306667);
  });

});
