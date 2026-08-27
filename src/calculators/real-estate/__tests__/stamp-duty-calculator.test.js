import { describe, it, expect } from 'vitest';
import { calculateStampDutyCalculator, calculateStampDutyTool, STATE_STAMP_SCHEDULES } from '../stamp-duty-calculator.js';

describe('Flagship Stamp Duty & Registration Calculator Decision Suite (Sprint 60 Audit)', () => {
  // 1. Maharashtra State Benchmarks & Registration Cap Mechanics
  describe('Maharashtra State Stamp Duty & Registration Rules', () => {
    it('1. calculates Maharashtra Male Urban for ₹1 Crore flat (5% + 1% Metro Cess + ₹30K Reg Cap)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 10000000,
        state: 'maharashtra',
        gender: 'male',
        location: 'urban',
        advocateLegalFees: 25000,
      });

      expect(res.propertyValue).toBe(10000000);
      expect(res.taxableValue).toBe(10000000);
      expect(res.baseStampRate).toBe(5);
      expect(res.metroCessRate).toBe(1);
      expect(res.effectiveStampRate).toBe(6);
      expect(res.baseStampDuty).toBe(500000);
      expect(res.metroCessAmount).toBe(100000);
      expect(res.totalStampDuty).toBe(600000);
      expect(res.registrationCharges).toBe(30000); // Capped at ₹30,000
      expect(res.totalGovernmentCharges).toBe(630000);
      expect(res.totalPropertyCost).toBe(10655000); // 1Cr + 6.3L + 25K
    });

    it('2. calculates Maharashtra Female concession (4% base + 1% Metro = 5% total)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 10000000,
        state: 'maharashtra',
        gender: 'female',
        location: 'urban',
      });

      expect(res.baseStampRate).toBe(4);
      expect(res.totalStampDuty).toBe(500000);
      expect(res.genderSavings).toBe(100000); // Saved ₹1 Lakh vs 6% male rate
    });

    it('3. calculates Maharashtra Rural (no Metro Cess)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 5000000,
        state: 'maharashtra',
        gender: 'male',
        location: 'rural',
      });

      expect(res.metroCessRate).toBe(0);
      expect(res.effectiveStampRate).toBe(5);
      expect(res.totalStampDuty).toBe(250000);
    });

    it('4. calculates Maharashtra low value property (< ₹30L) where registration is 1% uncapped', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 2000000,
        state: 'maharashtra',
        gender: 'male',
        location: 'urban',
      });

      // 1% of 20L = 20,000 (< 30,000 cap)
      expect(res.registrationCharges).toBe(20000);
    });
  });

  // 2. Delhi NCR Benchmarks & Gender Slabs
  describe('Delhi NCR Stamp Duty & Registration Rules', () => {
    it('5. calculates Delhi Male (6% Stamp Duty + 1% Registration)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 8000000,
        state: 'delhi',
        gender: 'male',
      });

      expect(res.effectiveStampRate).toBe(6);
      expect(res.totalStampDuty).toBe(480000);
      expect(res.registrationCharges).toBe(80000);
      expect(res.totalGovernmentCharges).toBe(560000);
    });

    it('6. calculates Delhi Female (4% Stamp Duty + 1% Registration)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 8000000,
        state: 'delhi',
        gender: 'female',
      });

      expect(res.effectiveStampRate).toBe(4);
      expect(res.totalStampDuty).toBe(320000);
      expect(res.genderSavings).toBe(160000); // 2% savings = ₹1.6 Lakhs
    });

    it('7. calculates Delhi Joint Ownership (5% Stamp Duty + 1% Registration)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 8000000,
        state: 'delhi',
        gender: 'joint',
      });

      expect(res.effectiveStampRate).toBe(5);
      expect(res.totalStampDuty).toBe(400000);
      expect(res.genderSavings).toBe(80000); // 1% savings = ₹80,000
    });
  });

  // 3. Other Major States (Karnataka, Tamil Nadu, UP, West Bengal, Telangana)
  describe('Other Major Indian States', () => {
    it('8. calculates Karnataka (Bangalore) (5% + 0.6% cess/surcharge + 1% Registration)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 10000000,
        state: 'karnataka',
        location: 'urban',
      });

      expect(res.effectiveStampRate).toBe(5.6);
      expect(res.totalStampDuty).toBe(560000);
      expect(res.registrationCharges).toBe(100000);
      expect(res.totalGovernmentCharges).toBe(660000);
    });

    it('9. calculates Tamil Nadu (Chennai) (7% Stamp Duty + 2% Registration)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 6000000,
        state: 'tamil_nadu',
      });

      expect(res.effectiveStampRate).toBe(7);
      expect(res.totalStampDuty).toBe(420000);
      expect(res.registrationCharges).toBe(120000);
      expect(res.totalGovernmentCharges).toBe(540000);
    });

    it('10. calculates Uttar Pradesh (Noida) with ₹20,000 Registration Cap', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 7500000,
        state: 'uttar_pradesh',
        gender: 'male',
      });

      expect(res.totalStampDuty).toBe(525000);
      expect(res.registrationCharges).toBe(20000); // Capped at ₹20K
      expect(res.totalGovernmentCharges).toBe(545000);
    });

    it('11. calculates Uttar Pradesh Female Concession (6% Stamp Duty)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 5000000,
        state: 'uttar_pradesh',
        gender: 'female',
      });

      expect(res.effectiveStampRate).toBe(6);
      expect(res.totalStampDuty).toBe(300000);
      expect(res.genderSavings).toBe(50000);
    });

    it('12. calculates Telangana (Hyderabad) (5.5% + 1.5% Transfer Duty + 0.5% Reg)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 10000000,
        state: 'telangana',
        location: 'urban',
      });

      expect(res.effectiveStampRate).toBe(7.0);
      expect(res.totalStampDuty).toBe(700000);
      expect(res.registrationCharges).toBe(50000);
      expect(res.totalGovernmentCharges).toBe(750000);
    });

    it('13. calculates West Bengal (Kolkata) (6% Stamp Duty + 1% Reg)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 12000000,
        state: 'west_bengal',
      });

      expect(res.effectiveStampRate).toBe(6);
      expect(res.totalStampDuty).toBe(720000);
      expect(res.registrationCharges).toBe(120000);
    });
  });

  // 4. Ready Reckoner / Circle Rate Higher Valuation Mechanism
  describe('Circle Rate vs Agreement Value Valuation Rules', () => {
    it('14. calculates stamp duty on Circle Rate when Circle Rate > Agreement Value', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 4000000, // Agreement value ₹40L
        circleRateValue: 5000000, // Circle rate ₹50L
        state: 'delhi',
        gender: 'male',
      });

      expect(res.isCircleRateHigher).toBe(true);
      expect(res.taxableValue).toBe(5000000);
      expect(res.valuationGap).toBe(1000000);
      expect(res.totalStampDuty).toBe(300000); // 6% of 50L
      expect(res.registrationCharges).toBe(50000); // 1% of 50L
    });

    it('15. calculates stamp duty on Agreement Value when Agreement Value >= Circle Rate', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 6000000, // Agreement value ₹60L
        circleRateValue: 4500000, // Circle rate ₹45L
        state: 'delhi',
        gender: 'male',
      });

      expect(res.isCircleRateHigher).toBe(false);
      expect(res.taxableValue).toBe(6000000);
      expect(res.valuationGap).toBe(0);
      expect(res.totalStampDuty).toBe(360000);
    });
  });

  // 5. Section 80C Tax Deduction Modeling
  describe('Income Tax Section 80C Tax Deduction Modeling', () => {
    it('16. caps Section 80C deduction at ₹1,50,000 for high charges', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 10000000,
        state: 'maharashtra',
      });

      expect(res.totalGovernmentCharges).toBe(630000);
      expect(res.eligible80CDeduction).toBe(150000);
      expect(res.taxSavingsAt30Pct).toBe(46800); // 150,000 * 31.2%
    });

    it('17. allows full amount if total charges are under ₹1,50,000', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 1500000, // ₹15 Lakhs in MH
        state: 'maharashtra',
        location: 'rural',
      });

      // 5% stamp = 75,000 + 1% reg = 15,000 = 90,000
      expect(res.totalGovernmentCharges).toBe(90000);
      expect(res.eligible80CDeduction).toBe(90000);
      expect(res.taxSavingsAt30Pct).toBe(Math.round(90000 * 0.312));
    });
  });

  // 6. Custom State Rates Override
  describe('Custom State & Rate Overrides', () => {
    it('18. applies custom stamp rate (8%) and registration rate (2%)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 5000000,
        state: 'custom',
        customStampRate: 8,
        customRegRate: 2,
        advocateLegalFees: 10000,
      });

      expect(res.stateName).toBe('Custom Rate');
      expect(res.baseStampRate).toBe(8);
      expect(res.effectiveStampRate).toBe(8);
      expect(res.regRate).toBe(2);
      expect(res.totalStampDuty).toBe(400000);
      expect(res.registrationCharges).toBe(100000);
      expect(res.totalGovernmentCharges).toBe(500000);
      expect(res.totalPropertyCost).toBe(5510000);
    });

    it('19. handles 0% custom stamp rate', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 5000000,
        state: 'custom',
        customStampRate: 0,
        customRegRate: 0,
      });

      expect(res.totalStampDuty).toBe(0);
      expect(res.registrationCharges).toBe(0);
      expect(res.totalGovernmentCharges).toBe(0);
      expect(res.totalPropertyCost).toBe(5025000); // 50L + 25K default legal
    });
  });

  // 7. Multi-State Scenario Comparison Matrix
  describe('Multi-State Comparison Matrix', () => {
    it('20. generates comparison entries for all defined states', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 5000000,
        state: 'maharashtra',
      });

      expect(res.scenarios.length).toBe(Object.keys(STATE_STAMP_SCHEDULES).length);
      const mhScen = res.scenarios.find((s) => s.stateKey === 'maharashtra');
      expect(mhScen).toBeDefined();
      expect(mhScen.diffFromCurrent).toBe(0);
    });
  });

  // 8. Smart Recommendations & Insights
  describe('Smart Recommendations & Decision Insights', () => {
    it('21. generates female concession recommendation when savings exist', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 10000000,
        state: 'delhi',
        gender: 'female',
      });

      const topRec = res.recommendations[0];
      expect(topRec.title).toContain('Female Buyer');
      expect(topRec.savings).toBe(200000); // 2% of ₹1 Cr = ₹2 Lakhs
    });

    it('22. generates joint ownership exploration tip for male buyers', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 10000000,
        state: 'delhi',
        gender: 'male',
      });

      const topRec = res.recommendations[0];
      expect(topRec.title).toContain('Joint Ownership');
    });

    it('23. warns about circle rate gap when circle rate > property value', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 5000000,
        circleRateValue: 6000000,
      });

      const circleRec = res.recommendations.find((r) => r.title.includes('Circle Rate Valuation Warning'));
      expect(circleRec).toBeDefined();
      expect(circleRec.savings).toBe(1000000);
    });
  });

  // 9. Hero Decision Text Formatting
  describe('Hero Decision Verdict Text', () => {
    it('24. formats hero decision text with property value, state name, and total government charges', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 5000000,
        state: 'maharashtra',
      });

      expect(res.heroText).toContain('₹50,00,000');
      expect(res.heroText).toContain('Maharashtra');
      expect(res.heroText).toContain('₹3,30,000');
    });
  });

  // 10. Edge Cases & Boundary Handling
  describe('Edge Cases & Boundary Values', () => {
    it('25. handles 0 property value gracefully', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 0,
        circleRateValue: 0,
      });

      expect(res.propertyValue).toBe(0);
      expect(res.taxableValue).toBe(0);
      expect(res.totalStampDuty).toBe(0);
      expect(res.registrationCharges).toBe(0);
      expect(res.totalGovernmentCharges).toBe(0);
      expect(res.overheadPercentage).toBe(0);
    });

    it('26. clamps negative property value to 0', () => {
      const res = calculateStampDutyCalculator({ propertyValue: -1000000 });
      expect(res.propertyValue).toBe(0);
      expect(res.totalStampDuty).toBe(0);
    });

    it('27. handles large luxury real estate transactions (₹50 Crores)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 500000000, // ₹50 Cr
        state: 'maharashtra',
        location: 'urban',
      });

      expect(res.totalStampDuty).toBe(30000000); // 6% = ₹3 Crores
      expect(res.registrationCharges).toBe(30000); // Capped at ₹30K
      expect(res.totalGovernmentCharges).toBe(30030000);
    });

    it('28. handles legal fees addition to total property cost', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 5000000,
        state: 'delhi',
        advocateLegalFees: 50000,
      });

      expect(res.legalFees).toBe(50000);
      expect(res.totalAcquisitionOverhead).toBe(res.totalGovernmentCharges + 50000);
      expect(res.totalPropertyCost).toBe(5000000 + res.totalAcquisitionOverhead);
    });

    it('29. ensures mathematical balance invariants across random property values', () => {
      const values = [500000, 1250000, 3750000, 8500000, 25000000, 100000000];
      values.forEach((val) => {
        const res = calculateStampDutyCalculator({ propertyValue: val, state: 'karnataka' });
        expect(res.totalGovernmentCharges).toBe(res.totalStampDuty + res.registrationCharges);
        expect(res.totalAcquisitionOverhead).toBe(res.totalGovernmentCharges + res.legalFees);
        expect(res.totalPropertyCost).toBe(res.propertyValue + res.totalAcquisitionOverhead);
      });
    });
  });

  // 11. Framework Compatibility & Default Behavior
  describe('Framework Compatibility & Aliases', () => {
    it('30. defaults to 50 Lakhs Maharashtra Male Urban when called with empty inputs', () => {
      const res = calculateStampDutyCalculator();
      expect(res.propertyValue).toBe(5000000);
      expect(res.state).toBe('maharashtra');
      expect(res.gender).toBe('male');
      expect(res.totalGovernmentCharges).toBe(330000); // 6% of 50L (3L) + 30K cap = 3.3L
    });

    it('31. exports calculateStampDutyTool alias identically', () => {
      const res1 = calculateStampDutyCalculator({ propertyValue: 5000000 });
      const res2 = calculateStampDutyTool({ propertyValue: 5000000 });
      expect(res1.totalGovernmentCharges).toBe(res2.totalGovernmentCharges);
      expect(res1.primaryOutput).toBe(res2.primaryOutput);
    });

    it('32. handles string numeric inputs correctly', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: '6000000',
        advocateLegalFees: '20000',
      });
      expect(res.propertyValue).toBe(6000000);
      expect(res.legalFees).toBe(20000);
    });

    it('33. handles invalid string inputs without crashing', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 'invalid',
        circleRateValue: 'bad',
      });
      expect(res.propertyValue).toBe(0);
      expect(res.taxableValue).toBe(0);
      expect(res.totalGovernmentCharges).toBe(0);
    });

    it('34. calculates Maharashtra Joint Ownership (5% base + 1% Metro = 6%)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 6000000,
        state: 'maharashtra',
        gender: 'joint',
        location: 'urban',
      });
      expect(res.effectiveStampRate).toBe(6);
      expect(res.totalStampDuty).toBe(360000);
      expect(res.registrationCharges).toBe(30000);
    });

    it('35. calculates Delhi Rural (same rates in Delhi NCT)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 5000000,
        state: 'delhi',
        location: 'rural',
      });
      expect(res.effectiveStampRate).toBe(6);
      expect(res.totalStampDuty).toBe(300000);
    });

    it('36. calculates Karnataka Rural (no municipal surcharge)', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 5000000,
        state: 'karnataka',
        location: 'rural',
      });
      expect(res.effectiveStampRate).toBe(5);
      expect(res.totalStampDuty).toBe(250000);
    });

    it('37. calculates Telangana Female ownership', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 8000000,
        state: 'telangana',
        gender: 'female',
        location: 'urban',
      });
      expect(res.effectiveStampRate).toBe(7);
      expect(res.totalStampDuty).toBe(560000);
      expect(res.registrationCharges).toBe(40000); // 0.5%
    });

    it('38. handles zero legal fees', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 5000000,
        advocateLegalFees: 0,
      });
      expect(res.legalFees).toBe(0);
      expect(res.totalAcquisitionOverhead).toBe(res.totalGovernmentCharges);
    });

    it('39. clamps negative legal fees to 0', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 5000000,
        advocateLegalFees: -5000,
      });
      expect(res.legalFees).toBe(0);
    });

    it('40. handles equal property value and circle rate value', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 7500000,
        circleRateValue: 7500000,
        state: 'delhi',
      });
      expect(res.isCircleRateHigher).toBe(false);
      expect(res.taxableValue).toBe(7500000);
      expect(res.valuationGap).toBe(0);
    });

    it('41. correctly calculates overhead percentage ratio', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 10000000,
        state: 'delhi',
        advocateLegalFees: 40000,
      });
      // Delhi: 6L stamp + 1L reg + 40K legal = 7.4L / 1Cr = 7.4%
      expect(res.overheadPercentage).toBe(7.4);
    });

    it('42. correctly calculates stamp duty percentage ratio', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 10000000,
        state: 'delhi',
      });
      // Delhi stamp = 6L / 1Cr = 6%
      expect(res.stampDutyPercentage).toBe(6);
    });

    it('43. handles custom state with custom name and uncapped registration', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 10000000,
        state: 'custom',
        customStampRate: 4.5,
        customRegRate: 0.5,
      });
      expect(res.stateName).toBe('Custom Rate');
      expect(res.totalStampDuty).toBe(450000);
      expect(res.registrationCharges).toBe(50000);
      expect(res.totalGovernmentCharges).toBe(500000);
    });

    it('44. provides 80C deduction when total charges exactly equal 1.5 Lakhs', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 2500000,
        state: 'maharashtra',
        location: 'rural',
      });
      // 5% of 25L = 125,000 + 1% reg (25,000) = 150,000
      expect(res.totalGovernmentCharges).toBe(150000);
      expect(res.eligible80CDeduction).toBe(150000);
    });

    it('45. handles unknown state gracefully by falling back to custom rates', () => {
      const res = calculateStampDutyCalculator({
        propertyValue: 5000000,
        state: 'goa',
        customStampRate: 5,
        customRegRate: 1,
      });
      expect(res.stateName).toBe('Custom Rate');
      expect(res.totalStampDuty).toBe(250000);
      expect(res.registrationCharges).toBe(50000);
    });
  });
});
