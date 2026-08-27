import { describe, it, expect } from 'vitest';
import {
  calculateTermLifeInsuranceCalculator,
  calculateTermLifeInsuranceTool,
  MORTALITY_RATES_PER_THOUSAND,
  DEFAULT_TERM_INSURANCE_INPUTS,
} from '../term-life-insurance-calculator.js';

describe('Flagship Term Life Insurance & HLV Decision Suite (Sprint 63 Audit)', () => {
  // 1. Sizing Methodologies (DIME vs HLV vs Multiple)
  describe('Coverage Sizing Methodologies', () => {
    it('1. calculates DIME needs-based coverage for standard family profile', () => {
      const res = calculateTermLifeInsuranceCalculator({
        currentAge: 30,
        annualIncome: 1200000,
        existingLiabilities: 3000000, // 30L
        annualFamilyExpenses: 600000, // 6L
        expenseReplacementYears: 15, // 15 yrs = 90L
        futureGoals: 2000000, // 20L
        existingAssets: 1000000, // 10L
        sizingMethod: 'dime',
      });

      // DIME = 30L + 90L + 20L - 10L = 130L (₹1.3 Crores)
      expect(res.dimeSizing).toBe(13000000);
      expect(res.recommendedSumAssured).toBe(13000000);
    });

    it('2. calculates Human Life Value (HLV) coverage capitalized to age 60', () => {
      const res = calculateTermLifeInsuranceCalculator({
        currentAge: 30,
        annualIncome: 1200000,
        sizingMethod: 'hlv',
      });

      // Net annual contribution = 70% of 12L = 8.4L
      // 30 years to age 60 @ 3% real discount rate -> multiplier = ~19.6
      // HLV = 8.4L * 19.6 = ~1.65 Crores
      expect(res.hlvSizing).toBeGreaterThan(15000000);
      expect(res.hlvSizing).toBeLessThan(18000000);
      expect(res.recommendedSumAssured).toBe(res.hlvSizing);
    });

    it('3. calculates Income Multiple rule (25x under 30, 20x under 40)', () => {
      const res1 = calculateTermLifeInsuranceCalculator({
        currentAge: 28,
        annualIncome: 1000000,
        sizingMethod: 'multiple',
      });
      // 28 yrs -> 25x 10L = 2.5 Cr
      expect(res1.recommendedSumAssured).toBe(25000000);

      const res2 = calculateTermLifeInsuranceCalculator({
        currentAge: 35,
        annualIncome: 1000000,
        sizingMethod: 'multiple',
      });
      // 35 yrs -> 20x 10L = 2.0 Cr
      expect(res2.recommendedSumAssured).toBe(20000000);
    });

    it('4. accepts custom sum assured input', () => {
      const res = calculateTermLifeInsuranceCalculator({
        sizingMethod: 'custom',
        customSumAssured: 30000000, // 3 Cr
      });

      expect(res.recommendedSumAssured).toBe(30000000);
    });
  });

  // 2. Actuarial Pricing & Mortality Rates
  describe('Actuarial Pricing & Premium Calculations', () => {
    it('5. computes base pure term premium for 30-year-old non-smoker male (₹1 Cr cover)', () => {
      const res = calculateTermLifeInsuranceCalculator({
        currentAge: 30,
        gender: 'male',
        isSmoker: false,
        sizingMethod: 'custom',
        customSumAssured: 10000000, // 1 Cr
        coverageYears: 30,
        criticalIllnessRider: false,
        accidentalRider: false,
        waiverOfPremiumRider: false,
      });

      // Age 30 mortality = 0.95 / 1000. 30 yrs duration loading = 1.08x -> rate = ~1.026 / 1000
      // Base SA = 10,000,000 * (1.026/1000) = ~10,260
      // GST 18% -> Gross = ~12,107
      expect(res.grossAnnualPremium).toBeGreaterThan(10000);
      expect(res.grossAnnualPremium).toBeLessThan(14000);
      expect(res.monthlyEquivalentPremium).toBe(Math.round(res.grossAnnualPremium / 12));
    });

    it('6. applies 10% longevity discount for female policyholders', () => {
      const resMale = calculateTermLifeInsuranceCalculator({
        currentAge: 30,
        gender: 'male',
        sizingMethod: 'custom',
        customSumAssured: 10000000,
      });

      const resFemale = calculateTermLifeInsuranceCalculator({
        currentAge: 30,
        gender: 'female',
        sizingMethod: 'custom',
        customSumAssured: 10000000,
      });

      expect(resFemale.baseAnnualPremium).toBeLessThan(resMale.baseAnnualPremium);
      expect(resFemale.baseAnnualPremium).toBeCloseTo(resMale.baseAnnualPremium * 0.90, -2);
    });

    it('7. applies +60% mortality surcharge for tobacco / smoker users', () => {
      const resNonSmoker = calculateTermLifeInsuranceCalculator({
        currentAge: 30,
        isSmoker: false,
        sizingMethod: 'custom',
        customSumAssured: 10000000,
      });

      const resSmoker = calculateTermLifeInsuranceCalculator({
        currentAge: 30,
        isSmoker: true,
        sizingMethod: 'custom',
        customSumAssured: 10000000,
      });

      expect(resSmoker.baseAnnualPremium).toBeGreaterThan(resNonSmoker.baseAnnualPremium);
      expect(resSmoker.baseAnnualPremium).toBeCloseTo(resNonSmoker.baseAnnualPremium * 1.60, -2);
    });
  });

  // 3. Add-on Riders & Statutory GST
  describe('Riders & Statutory GST (18%)', () => {
    it('8. computes riders accurately (Critical Illness 20%, Accidental 10%, WOP 4%)', () => {
      const res = calculateTermLifeInsuranceCalculator({
        currentAge: 30,
        sizingMethod: 'custom',
        customSumAssured: 10000000,
        criticalIllnessRider: true,
        accidentalRider: true,
        waiverOfPremiumRider: true,
      });

      expect(res.ciRiderCost).toBe(Math.round(res.baseAnnualPremium * 0.20));
      expect(res.accidentalRiderCost).toBe(Math.round(res.baseAnnualPremium * 0.10));
      expect(res.wopRiderCost).toBe(Math.round(res.baseAnnualPremium * 0.04));
      expect(res.totalNetPremium).toBe(res.baseAnnualPremium + res.ciRiderCost + res.accidentalRiderCost + res.wopRiderCost);
      expect(res.gstAmount).toBe(Math.round(res.totalNetPremium * 0.18));
      expect(res.grossAnnualPremium).toBe(res.totalNetPremium + res.gstAmount);
    });
  });

  // 4. Pure Term vs Return of Premium (TROP) Opportunity Cost
  describe('Pure Term vs TROP (Return of Premium) Opportunity Cost', () => {
    it('9. calculates massive wealth advantage of Pure Term + Index SIP vs TROP', () => {
      const res = calculateTermLifeInsuranceCalculator({
        currentAge: 30,
        coverageYears: 30,
        sizingMethod: 'custom',
        customSumAssured: 10000000,
        sipReturnRate: 12,
      });

      // TROP premium = 2.2x pure term
      expect(res.tropAnnualPremium).toBe(Math.round(res.grossAnnualPremium * 2.2));
      expect(res.tropRefundAtMaturity).toBe(res.tropAnnualPremium * 30);
      expect(res.annualPremiumDifference).toBe(res.tropAnnualPremium - res.grossAnnualPremium);
      // Future Value of monthly SIP difference at 12% over 30 yrs
      expect(res.sipFutureValue).toBeGreaterThan(res.tropRefundAtMaturity);
      expect(res.sipWealthAdvantage).toBe(res.sipFutureValue - res.tropRefundAtMaturity);
      expect(res.recommendations[0].title).toContain('Return of Premium');
    });
  });

  // 5. Tax Deductions (Section 80C & Section 10(10D))
  describe('Tax Savings & Exemptions', () => {
    it('10. calculates Section 80C annual tax savings up to ₹1.5L limit', () => {
      const res = calculateTermLifeInsuranceCalculator({
        currentAge: 35,
        sizingMethod: 'custom',
        customSumAssured: 20000000,
      });

      expect(res.annualTaxSavingsSec80C).toBeGreaterThan(0);
      expect(res.annualTaxSavingsSec80C).toBeLessThanOrEqual(150000 * 0.312);
    });
  });

  // 6. Multi-Scenario Sizing Matrix
  describe('Scenario Sizing Matrix', () => {
    it('11. generates comparative matrix for DIME, HLV, and Multiple methods', () => {
      const res = calculateTermLifeInsuranceCalculator({
        currentAge: 32,
        annualIncome: 1500000,
      });

      expect(res.sizingScenarios.length).toBe(3);
      expect(res.sizingScenarios.find((s) => s.id === 'dime')).toBeDefined();
      expect(res.sizingScenarios.find((s) => s.id === 'hlv')).toBeDefined();
      expect(res.sizingScenarios.find((s) => s.id === 'multiple')).toBeDefined();
    });
  });

  // 7. Smart Ranked Recommendations
  describe('Smart Ranked Recommendations', () => {
    it('12. generates ranked guidance for pure term vs TROP and tax exemptions', () => {
      const res = calculateTermLifeInsuranceCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });

    it('13. generates smoker cessation recommendation when isSmoker is true', () => {
      const res = calculateTermLifeInsuranceCalculator({ isSmoker: true });
      const rec = res.recommendations.find((r) => r.title.includes('Smoker'));
      expect(rec).toBeDefined();
      expect(rec.action).toContain('Tobacco use adds +60%');
    });
  });

  // 8. Hero Decision Verdict Text
  describe('Hero Decision Verdict Text', () => {
    it('14. formats hero verdict text with sum assured, annual premium, and monthly equivalent', () => {
      const res = calculateTermLifeInsuranceCalculator({
        currentAge: 30,
        sizingMethod: 'custom',
        customSumAssured: 10000000,
      });

      expect(res.heroText).toContain('₹1,00,00,000');
      expect(res.heroText).toContain('/month');
    });
  });

  // 9. Edge Cases, Boundaries & Clamping
  describe('Edge Cases & Boundary Safeguards', () => {
    it('15. clamps age between 18 and 65', () => {
      const res1 = calculateTermLifeInsuranceCalculator({ currentAge: 10 });
      expect(res1.currentAge).toBe(18);

      const res2 = calculateTermLifeInsuranceCalculator({ currentAge: 80 });
      expect(res2.currentAge).toBe(65);
    });

    it('16. clamps coverage years to maximum age 85', () => {
      const res = calculateTermLifeInsuranceCalculator({
        currentAge: 60,
        coverageYears: 40, // 60 + 40 = 100 > 85
      });

      expect(res.coverageYears).toBe(25); // 85 - 60
    });

    it('17. handles zero income safely by defaulting sum assured to ₹5 Lakhs minimum', () => {
      const res = calculateTermLifeInsuranceCalculator({
        annualIncome: 0,
        existingLiabilities: 0,
        annualFamilyExpenses: 0,
        futureGoals: 0,
        existingAssets: 0,
        sizingMethod: 'multiple',
      });

      expect(res.recommendedSumAssured).toBeGreaterThanOrEqual(500000);
      expect(res.grossAnnualPremium).toBeGreaterThan(0);
    });

    it('18. handles high net worth individual (₹10 Cr cover)', () => {
      const res = calculateTermLifeInsuranceCalculator({
        currentAge: 35,
        sizingMethod: 'custom',
        customSumAssured: 100000000, // 10 Cr
      });

      expect(res.recommendedSumAssured).toBe(100000000);
      expect(res.grossAnnualPremium).toBeGreaterThan(100000);
    });

    it('19. handles existing assets exceeding debts and expenses safely', () => {
      const res = calculateTermLifeInsuranceCalculator({
        existingLiabilities: 1000000,
        annualFamilyExpenses: 500000,
        expenseReplacementYears: 10,
        futureGoals: 1000000,
        existingAssets: 50000000, // 5 Cr assets exceeds 70L need
        sizingMethod: 'dime',
      });

      expect(res.dimeSizing).toBe(500000); // Clamped to 5L min
    });
  });

  // 10. Framework Compatibility & Aliases
  describe('Framework Compatibility & Aliases', () => {
    it('20. defaults to standard 30-year-old profile when called with no parameters', () => {
      const res = calculateTermLifeInsuranceCalculator();
      expect(res.currentAge).toBe(30);
      expect(res.recommendedSumAssured).toBeGreaterThan(0);
      expect(res.grossAnnualPremium).toBeGreaterThan(0);
    });

    it('21. exports calculateTermLifeInsuranceTool alias identically', () => {
      const res1 = calculateTermLifeInsuranceCalculator({ currentAge: 30 });
      const res2 = calculateTermLifeInsuranceTool({ currentAge: 30 });
      expect(res1.grossAnnualPremium).toBe(res2.grossAnnualPremium);
      expect(res1.primaryOutput).toBe(res2.primaryOutput);
    });

    it('22. handles string numeric inputs cleanly', () => {
      const res = calculateTermLifeInsuranceCalculator({
        currentAge: '32',
        annualIncome: '1500000',
        customSumAssured: '20000000',
      });
      expect(res.currentAge).toBe(32);
      expect(res.annualIncome).toBe(1500000);
    });

    it('23. handles boolean string representations for smoker status', () => {
      const res = calculateTermLifeInsuranceCalculator({ isSmoker: 'true' });
      expect(res.isSmoker).toBe(true);
    });

    it('24. formats currency symbols cleanly in hero text', () => {
      const res = calculateTermLifeInsuranceCalculator({ currencySymbol: '$' });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
    });

    it('25. verifies total lifetime premiums equals annual * term years', () => {
      const res = calculateTermLifeInsuranceCalculator({ coverageYears: 30 });
      expect(res.totalLifetimePremiumsPaid).toBe(res.grossAnnualPremium * 30);
    });

    it('26. handles mortality table lookup for all age groups', () => {
      [22, 28, 33, 38, 43, 48, 53, 62].forEach((testAge) => {
        const res = calculateTermLifeInsuranceCalculator({ currentAge: testAge });
        expect(res.grossAnnualPremium).toBeGreaterThan(0);
      });
    });

    it('27. handles 0% SIP return rate safely for TROP opportunity comparison', () => {
      const res = calculateTermLifeInsuranceCalculator({ sipReturnRate: 0 });
      expect(res.sipFutureValue).toBe(res.annualPremiumDifference * res.coverageYears);
    });

    it('28. handles female smoker underwriting profile correctly', () => {
      const res = calculateTermLifeInsuranceCalculator({
        gender: 'female',
        isSmoker: true,
      });
      expect(res.gender).toBe('female');
      expect(res.isSmoker).toBe(true);
    });

    it('29. validates young professional preset', () => {
      const res = calculateTermLifeInsuranceCalculator({
        currentAge: 25,
        annualIncome: 800000,
        existingLiabilities: 500000,
        annualFamilyExpenses: 350000,
        expenseReplacementYears: 20,
        futureGoals: 1000000,
        existingAssets: 300000,
      });
      expect(res.dimeSizing).toBe(8200000);
    });

    it('30. validates married parent preset', () => {
      const res = calculateTermLifeInsuranceCalculator({
        currentAge: 32,
        annualIncome: 1800000,
        existingLiabilities: 4500000,
        annualFamilyExpenses: 800000,
        expenseReplacementYears: 18,
        futureGoals: 3500000,
        existingAssets: 1500000,
      });
      expect(res.dimeSizing).toBe(20900000);
    });

    it('31. checks that older entry age yields higher premium per ₹1 Cr', () => {
      const res25 = calculateTermLifeInsuranceCalculator({ currentAge: 25, customSumAssured: 10000000, sizingMethod: 'custom' });
      const res45 = calculateTermLifeInsuranceCalculator({ currentAge: 45, customSumAssured: 10000000, sizingMethod: 'custom' });
      expect(res45.grossAnnualPremium).toBeGreaterThan(res25.grossAnnualPremium);
    });

    it('32. handles 1-year replacement duration cleanly', () => {
      const res = calculateTermLifeInsuranceCalculator({ expenseReplacementYears: 1 });
      expect(res.dimeSizing).toBeGreaterThan(0);
    });

    it('33. handles negative liabilities safely by clamping to 0', () => {
      const res = calculateTermLifeInsuranceCalculator({ existingLiabilities: -500000 });
      expect(res.dimeSizing).toBeGreaterThan(0);
    });

    it('34. handles negative expenses safely by clamping to 0', () => {
      const res = calculateTermLifeInsuranceCalculator({ annualFamilyExpenses: -200000 });
      expect(res.dimeSizing).toBeGreaterThan(0);
    });

    it('35. handles negative goals safely by clamping to 0', () => {
      const res = calculateTermLifeInsuranceCalculator({ futureGoals: -1000000 });
      expect(res.dimeSizing).toBeGreaterThan(0);
    });

    it('36. handles negative assets safely by clamping to 0', () => {
      const res = calculateTermLifeInsuranceCalculator({ existingAssets: -1000000 });
      expect(res.dimeSizing).toBeGreaterThan(0);
    });

    it('37. handles negative SIP rate safely by clamping to 0', () => {
      const res = calculateTermLifeInsuranceCalculator({ sipReturnRate: -5 });
      expect(res.sipFutureValue).toBeGreaterThan(0);
    });

    it('38. handles SIP rate greater than 30% safely by clamping to 30', () => {
      const res = calculateTermLifeInsuranceCalculator({ sipReturnRate: 50 });
      expect(res.sipFutureValue).toBeGreaterThan(0);
    });

    it('39. verifies primaryOutput is grossAnnualPremium', () => {
      const res = calculateTermLifeInsuranceCalculator();
      expect(res.primaryOutput).toBe(res.grossAnnualPremium);
    });

    it('40. handles single rider selection independently (Critical Illness only)', () => {
      const resBase = calculateTermLifeInsuranceCalculator({ criticalIllnessRider: false });
      const resCI = calculateTermLifeInsuranceCalculator({ criticalIllnessRider: true });
      expect(resCI.grossAnnualPremium).toBeGreaterThan(resBase.grossAnnualPremium);
      expect(resCI.accidentalRiderCost).toBe(0);
      expect(resCI.wopRiderCost).toBe(0);
    });

    it('41. handles single rider selection independently (Accidental only)', () => {
      const resBase = calculateTermLifeInsuranceCalculator({ accidentalRider: false });
      const resAcc = calculateTermLifeInsuranceCalculator({ accidentalRider: true });
      expect(resAcc.grossAnnualPremium).toBeGreaterThan(resBase.grossAnnualPremium);
      expect(resAcc.ciRiderCost).toBe(0);
    });

    it('42. handles single rider selection independently (Waiver of Premium only)', () => {
      const resBase = calculateTermLifeInsuranceCalculator({ waiverOfPremiumRider: false });
      const resWOP = calculateTermLifeInsuranceCalculator({ waiverOfPremiumRider: true });
      expect(resWOP.grossAnnualPremium).toBeGreaterThan(resBase.grossAnnualPremium);
      expect(resWOP.ciRiderCost).toBe(0);
      expect(resWOP.accidentalRiderCost).toBe(0);
    });

    it('43. rounds recommendedSumAssured to nearest Lakh', () => {
      const res = calculateTermLifeInsuranceCalculator();
      expect(res.recommendedSumAssured % 100000).toBe(0);
    });

    it('44. verifies mortality rates table is strictly non-decreasing with age', () => {
      for (let i = 0; i < MORTALITY_RATES_PER_THOUSAND.length - 1; i++) {
        expect(MORTALITY_RATES_PER_THOUSAND[i + 1].baseRate).toBeGreaterThan(MORTALITY_RATES_PER_THOUSAND[i].baseRate);
      }
    });

    it('45. handles unknown sizingMethod by falling back to DIME', () => {
      const res = calculateTermLifeInsuranceCalculator({ sizingMethod: 'unknown_method' });
      expect(res.recommendedSumAssured).toBe(res.dimeSizing);
    });
  });
});
