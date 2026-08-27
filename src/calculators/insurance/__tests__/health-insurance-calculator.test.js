import { describe, it, expect } from 'vitest';
import {
  calculateRecommendedHealthCover,
  calculateEmployerCoverGap,
  calculateSuperTopUpOptimization,
  calculateSection80DSavings,
  calculateRoomRentRisk,
  calculateCopayImpact,
  calculateHealthInsuranceNeeds,
  STATUTORY_80D_LIMITS,
} from '../health-insurance-calculator';
import { HEALTH_INSURANCE_CONFIG } from '../../configs/health-insurance-calculator.config';

describe('Health Insurance Premium & Coverage Needs Engine Tests', () => {

  // 1. Single-person coverage baseline
  it('calculates single-person coverage baseline for Tier-1 city', () => {
    const res = calculateRecommendedHealthCover({ cityTier: 'tier1', hasSpouse: false, numChildren: 0, medicalInflationPercent: 12, planningHorizonYears: 5 });
    expect(res.recommendedSumInsured).toBeGreaterThan(1500000);
  });

  // 2. Nuclear-family coverage baseline
  it('calculates nuclear family coverage baseline (Couple + 1 Child)', () => {
    const res = calculateRecommendedHealthCover({ cityTier: 'tier1', hasSpouse: true, numChildren: 1, medicalInflationPercent: 12, planningHorizonYears: 5 });
    expect(res.recommendedSumInsured).toBeGreaterThan(2000000);
  });

  // 3. Multi-child household
  it('increases coverage demand for multi-child household', () => {
    const singleChild = calculateRecommendedHealthCover({ hasSpouse: true, numChildren: 1 });
    const threeChildren = calculateRecommendedHealthCover({ hasSpouse: true, numChildren: 3 });
    expect(threeChildren.recommendedSumInsured).toBeGreaterThan(singleChild.recommendedSumInsured);
  });

  // 4. Senior-citizen parent scenario
  it('includes senior citizen parent multiplier buffer', () => {
    const noParents = calculateRecommendedHealthCover({ hasSeniorParents: false });
    const withSeniorParents = calculateRecommendedHealthCover({ hasSeniorParents: true, numParents: 2 });
    expect(withSeniorParents.recommendedSumInsured).toBeGreaterThan(noParents.recommendedSumInsured);
  });

  // 5. Tier-1 city baseline
  it('uses ₹10 Lakhs baseline critical care cost for Tier-1 Metro', () => {
    const res = calculateRecommendedHealthCover({ cityTier: 'tier1', medicalInflationPercent: 0, planningHorizonYears: 0 });
    expect(res.baselineCost).toBe(1000000);
  });

  // 6. Tier-2 city baseline
  it('uses ₹7 Lakhs baseline critical care cost for Tier-2 City', () => {
    const res = calculateRecommendedHealthCover({ cityTier: 'tier2', medicalInflationPercent: 0, planningHorizonYears: 0 });
    expect(res.baselineCost).toBe(700000);
  });

  // 7. Tier-3 city baseline
  it('uses ₹5 Lakhs baseline critical care cost for Tier-3 City', () => {
    const res = calculateRecommendedHealthCover({ cityTier: 'tier3', medicalInflationPercent: 0, planningHorizonYears: 0 });
    expect(res.baselineCost).toBe(500000);
  });

  // 8. Medical inflation compounding
  it('compounds future medical cost at 12% p.a. over 5 years', () => {
    const res = calculateRecommendedHealthCover({ cityTier: 'tier1', medicalInflationPercent: 12, planningHorizonYears: 5, hasSpouse: false, numChildren: 0 });
    // 10L * (1.12)^5 = 17.62L
    expect(res.futureMedicalCost).toBeGreaterThan(1700000);
  });

  // 9. 0% medical inflation
  it('handles 0% medical inflation scenario', () => {
    const res = calculateRecommendedHealthCover({ cityTier: 'tier1', medicalInflationPercent: 0, planningHorizonYears: 5, hasSpouse: false, numChildren: 0 });
    expect(res.futureMedicalCost).toBe(1000000);
  });

  // 10. Higher medical inflation scenario
  it('evaluates 15% medical inflation scenario', () => {
    const inf12 = calculateRecommendedHealthCover({ medicalInflationPercent: 12 });
    const inf15 = calculateRecommendedHealthCover({ medicalInflationPercent: 15 });
    expect(inf15.futureMedicalCost).toBeGreaterThan(inf12.futureMedicalCost);
  });

  // 11. 10-year planning horizon
  it('evaluates 10-year planning horizon compounding', () => {
    const yr5 = calculateRecommendedHealthCover({ planningHorizonYears: 5 });
    const yr10 = calculateRecommendedHealthCover({ planningHorizonYears: 10 });
    expect(yr10.futureMedicalCost).toBeGreaterThan(yr5.futureMedicalCost);
  });

  // 12. Employer cover = 0
  it('calculates full coverage gap when existing employer cover is 0', () => {
    const gap = calculateEmployerCoverGap(2000000, 0);
    expect(gap.additionalGap).toBe(2000000);
    expect(gap.isFullyCoveredByEmployer).toBe(false);
  });

  // 13. Employer cover reducing coverage gap
  it('reduces additional gap when employer cover is provided', () => {
    const gap = calculateEmployerCoverGap(2000000, 500000);
    expect(gap.additionalGap).toBe(1500000);
  });

  // 14. Large employer cover
  it('handles large employer cover cleanly', () => {
    const gap = calculateEmployerCoverGap(2000000, 1500000);
    expect(gap.additionalGap).toBe(500000);
  });

  // 15. Employer cover exceeding modeled demand
  it('clamps additional gap at 0 when employer cover exceeds demand', () => {
    const gap = calculateEmployerCoverGap(2000000, 2500000);
    expect(gap.additionalGap).toBe(0);
    expect(gap.isFullyCoveredByEmployer).toBe(true);
  });

  // 16. Room-rent cap below actual room rent
  it('calculates room-rent proportionate deduction risk when actual rent exceeds cap', () => {
    const risk = calculateRoomRentRisk(10000, 5000, 200000);
    expect(risk.hasProportionateDeduction).toBe(true);
    expect(risk.payableRatio).toBe(0.5);
    expect(risk.estimatedUncoveredOutofPocket).toBe(100000);
  });

  // 17. Room-rent cap equal to actual room rent
  it('returns zero uncovered risk when actual room rent is within cap', () => {
    const risk = calculateRoomRentRisk(5000, 5000, 200000);
    expect(risk.hasProportionateDeduction).toBe(false);
    expect(risk.estimatedUncoveredOutofPocket).toBe(0);
  });

  // 18. Room-rent risk with zero/invalid inputs
  it('handles zero or invalid room rent inputs safely', () => {
    const risk = calculateRoomRentRisk(0, 0, 0);
    expect(risk.hasProportionateDeduction).toBe(false);
    expect(risk.estimatedUncoveredOutofPocket).toBe(0);
  });

  // 19. Co-pay calculation
  it('calculates policyholder co-pay share accurately', () => {
    const copay = calculateCopayImpact(100000, 10);
    expect(copay.policyholderShare).toBe(10000);
    expect(copay.insurerShare).toBe(90000);
  });

  // 20. Zero co-pay
  it('handles zero co-pay scenario', () => {
    const copay = calculateCopayImpact(100000, 0);
    expect(copay.policyholderShare).toBe(0);
    expect(copay.insurerShare).toBe(100000);
  });

  // 21. Full co-pay boundary
  it('handles 100% co-pay boundary scenario', () => {
    const copay = calculateCopayImpact(100000, 100);
    expect(copay.policyholderShare).toBe(100000);
    expect(copay.insurerShare).toBe(0);
  });

  // 22. Base-cover scenario
  it('calculates base cover optimization scenario', () => {
    const opt = calculateSuperTopUpOptimization(1500000);
    expect(opt.baseCover).toBe(500000);
    expect(opt.superTopUpCover).toBe(1000000);
    expect(opt.deductible).toBe(500000);
  });

  // 23. Super-top-up scenario
  it('handles super top-up combination optimization', () => {
    const opt = calculateSuperTopUpOptimization(2000000);
    expect(opt.baseCover).toBe(500000);
    expect(opt.superTopUpCover).toBe(1500000);
  });

  // 24. Base + super-top-up comparison
  it('proves combined base + super top-up is cheaper than single base policy equivalent', () => {
    const opt = calculateSuperTopUpOptimization(2000000);
    expect(opt.totalCombinedPremium).toBeLessThan(opt.estSingleBasePremium);
    expect(opt.illustrativeSavings).toBeGreaterThan(0);
  });

  // 25. Premium estimate range
  it('generates indicative annual premium range', () => {
    const res = calculateHealthInsuranceNeeds({ existingEmployerCover: 0 });
    expect(res.indicativePremiumRange.low).toBeGreaterThan(0);
    expect(res.indicativePremiumRange.high).toBeGreaterThan(res.indicativePremiumRange.low);
  });

  // 26. Premium estimate input validation
  it('validates premium estimates with custom inputs', () => {
    const res = calculateHealthInsuranceNeeds(HEALTH_INSURANCE_CONFIG.defaultInputs);
    expect(res.isValid).toBe(true);
    expect(res.indicativePremiumRange.low).toBeDefined();
  });

  // 27. Section 80D verified statutory limits (Self < 60 yrs)
  it('applies statutory ₹25,000 Section 80D limit for Self & Family under 60 yrs', () => {
    const tax = calculateSection80DSavings({ taxRegime: 'old', isSelfSenior: false, hasParents: false });
    expect(tax.selfDeductionLimit).toBe(25000);
    expect(tax.totalStatutoryLimit).toBe(25000);
  });

  // 28. Section 80D senior-parent scenario
  it('applies additional ₹50,000 Section 80D limit for Senior Citizen Parents', () => {
    const tax = calculateSection80DSavings({ taxRegime: 'old', isSelfSenior: false, hasParents: true, hasSeniorParents: true });
    expect(tax.parentsDeductionLimit).toBe(50000);
    expect(tax.totalStatutoryLimit).toBe(75000); // 25k + 50k
  });

  // 29. Section 80D regime treatment (Old vs New Regime)
  it('returns 0 Section 80D deduction under New Tax Regime', () => {
    const tax = calculateSection80DSavings({ taxRegime: 'new' });
    expect(tax.isEligible).toBe(false);
    expect(tax.totalStatutoryLimit).toBe(0);
    expect(tax.estimatedTaxSavings).toBe(0);
  });

  // 30. Statutory deduction ceiling (₹1,00,000 max)
  it('caps statutory Section 80D deduction at ₹1,00,000 ceiling', () => {
    const tax = calculateSection80DSavings({ taxRegime: 'old', isSelfSenior: true, hasParents: true, hasSeniorParents: true });
    expect(tax.totalStatutoryLimit).toBe(100000); // 50k + 50k = 100k max
  });

  // 31. Numeric-string sanitization
  it('sanitizes numeric string inputs safely', () => {
    const res = calculateHealthInsuranceNeeds({
      existingEmployerCover: '500000',
      medicalInflationPercent: '12',
      planningHorizonYears: '5',
    });
    expect(res.isValid).toBe(true);
  });

  // 32. Invalid/missing input validation
  it('handles missing or empty inputs safely without throwing', () => {
    const res = calculateHealthInsuranceNeeds({});
    expect(res.isValid).toBe(true);
    expect(res.coverage.recommendedSumInsured).toBeGreaterThan(0);
  });

  // 33. Preset integration
  it('integrates cleanly with nuclearFamily preset', () => {
    const res = calculateHealthInsuranceNeeds(HEALTH_INSURANCE_CONFIG.scenarios.nuclearFamily);
    expect(res.isValid).toBe(true);
    expect(res.coverage.recommendedSumInsured).toBeGreaterThan(0);
  });

  // 34. Full calculateHealthInsuranceNeeds integration
  it('returns complete structured result object for default inputs', () => {
    const res = calculateHealthInsuranceNeeds(HEALTH_INSURANCE_CONFIG.defaultInputs);
    expect(res.isValid).toBe(true);
    expect(res.coverage).toBeDefined();
    expect(res.gap).toBeDefined();
    expect(res.superTopUp).toBeDefined();
    expect(res.tax).toBeDefined();
  });

  // 35. Structured result-object verification
  it('verifies all expected properties in result object', () => {
    const res = calculateHealthInsuranceNeeds();
    expect(res).toHaveProperty('coverage');
    expect(res).toHaveProperty('gap');
    expect(res).toHaveProperty('superTopUp');
    expect(res).toHaveProperty('tax');
    expect(res).toHaveProperty('roomRentRisk');
    expect(res).toHaveProperty('copay');
  });

  // 36. REGRESSION PROOF: higher inflation increases modeled future cost
  it('REGRESSION PROOF: higher medical inflation rate increases modeled future cost', () => {
    const lowInf = calculateRecommendedHealthCover({ medicalInflationPercent: 8 });
    const highInf = calculateRecommendedHealthCover({ medicalInflationPercent: 15 });
    expect(highInf.futureMedicalCost).toBeGreaterThan(lowInf.futureMedicalCost);
  });

  // 37. REGRESSION PROOF: longer horizon increases modeled future cost
  it('REGRESSION PROOF: longer planning horizon increases modeled future cost', () => {
    const shortHz = calculateRecommendedHealthCover({ planningHorizonYears: 3 });
    const longHz = calculateRecommendedHealthCover({ planningHorizonYears: 10 });
    expect(longHz.futureMedicalCost).toBeGreaterThan(shortHz.futureMedicalCost);
  });

  // 38. REGRESSION PROOF: employer cover reduces additional coverage gap
  it('REGRESSION PROOF: employer cover strictly reduces additional coverage gap', () => {
    const target = 2000000;
    const gap0 = calculateEmployerCoverGap(target, 0).additionalGap;
    const gap5L = calculateEmployerCoverGap(target, 500000).additionalGap;
    expect(gap5L).toBeLessThan(gap0);
  });

  // 39. REGRESSION PROOF: room-rent restriction increases modeled uncovered proportion
  it('REGRESSION PROOF: lower room-rent cap increases uncovered out-of-pocket proportion', () => {
    const highCapRisk = calculateRoomRentRisk(10000, 8000, 200000);
    const lowCapRisk = calculateRoomRentRisk(10000, 3000, 200000);
    expect(lowCapRisk.uncoveredProportion).toBeGreaterThan(highCapRisk.uncoveredProportion);
  });

  // 40. REGRESSION PROOF: statutory tax deduction never exceeds verified limit
  it('REGRESSION PROOF: statutory Section 80D tax deduction never exceeds verified ₹1,00,000 ceiling', () => {
    const tax = calculateSection80DSavings({ taxRegime: 'old', isSelfSenior: true, hasParents: true, hasSeniorParents: true });
    expect(tax.totalStatutoryLimit).toBeLessThanOrEqual(STATUTORY_80D_LIMITS.MAX_TOTAL_DEDUCTION);
  });

});
