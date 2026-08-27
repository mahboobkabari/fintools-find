/**
 * Vitest Unit Tests for Gross Rent Multiplier (GRM) Calculator
 * Minimum 40 deterministic tests covering all GRM financial scenarios.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateAnnualGrossRent,
  calculateGRM,
  calculateImpliedValueFromGRM,
  calculateGrossRentYield,
  calculateGRMDifference,
  calculateGRMDifferencePercent,
  calculateValueDifference,
  calculateSensitivity,
  calculateGrossRentMultiplier,
} from '../gross-rent-multiplier-calculator.js';
import { GRM_CONFIG } from '../../configs/gross-rent-multiplier-calculator.config.js';

describe('Gross Rent Multiplier Calculator', () => {

  // 1. Annual gross rent
  describe('calculateAnnualGrossRent', () => {
    it('should calculate annual gross rent from monthly rent and other income', () => {
      expect(calculateAnnualGrossRent(50000, 24000)).toBe(624000);
    });

    // 2. Monthly rent × 12
    it('should calculate annual gross rent from monthly rent only', () => {
      expect(calculateAnnualGrossRent(50000, 0)).toBe(600000);
    });

    // 3. Other annual gross income
    it('should handle other annual gross income only', () => {
      expect(calculateAnnualGrossRent(0, 120000)).toBe(120000);
    });

    it('should return 0 when both inputs are 0', () => {
      expect(calculateAnnualGrossRent(0, 0)).toBe(0);
    });

    it('should sanitize negative monthly rent to 0', () => {
      expect(calculateAnnualGrossRent(-5000, 24000)).toBe(24000);
    });

    // 18. Negative other income
    it('should sanitize negative other income to 0', () => {
      expect(calculateAnnualGrossRent(50000, -10000)).toBe(600000);
    });
  });

  // 4. GRM calculation
  describe('calculateGRM', () => {
    it('should calculate GRM correctly', () => {
      expect(calculateGRM(6000000, 600000)).toBe(10);
    });

    it('should return GRM with decimals', () => {
      expect(calculateGRM(7500000, 624000)).toBe(12.02);
    });

    // 16. Zero rent
    it('should return null for zero annual rent', () => {
      expect(calculateGRM(5000000, 0)).toBeNull();
    });

    it('should return 0 for zero property price', () => {
      expect(calculateGRM(0, 600000)).toBe(0);
    });

    // 21. Decimal inputs
    it('should handle decimal inputs', () => {
      expect(calculateGRM(7500000.50, 624000.25)).toBe(12.02);
    });

    // 22. Large values
    it('should handle large property values', () => {
      const grm = calculateGRM(500000000, 5000000);
      expect(grm).toBe(100);
    });
  });

  // 5. Implied value
  describe('calculateImpliedValueFromGRM', () => {
    it('should calculate implied value from GRM and annual gross rent', () => {
      expect(calculateImpliedValueFromGRM(600000, 10)).toBe(6000000);
    });

    it('should return 0 for zero target GRM', () => {
      expect(calculateImpliedValueFromGRM(600000, 0)).toBe(0);
    });

    // 20. Negative target GRM
    it('should return 0 for negative target GRM', () => {
      expect(calculateImpliedValueFromGRM(600000, -5)).toBe(0);
    });

    it('should return 0 for zero annual rent', () => {
      expect(calculateImpliedValueFromGRM(0, 10)).toBe(0);
    });

    it('should handle fractional GRM', () => {
      expect(calculateImpliedValueFromGRM(624000, 8.5)).toBe(5304000);
    });
  });

  // 6. Gross rent yield
  describe('calculateGrossRentYield', () => {
    it('should calculate gross rent yield correctly', () => {
      expect(calculateGrossRentYield(600000, 6000000)).toBe(10);
    });

    it('should return 0 for zero property price', () => {
      expect(calculateGrossRentYield(600000, 0)).toBe(0);
    });

    it('should return 0 for zero rent', () => {
      expect(calculateGrossRentYield(0, 6000000)).toBe(0);
    });

    // 7. GRM/yield reciprocal relationship
    it('should be the reciprocal of GRM (100/GRM = Gross Rent Yield)', () => {
      const grm = calculateGRM(6000000, 600000);
      const yieldPct = calculateGrossRentYield(600000, 6000000);
      expect(yieldPct).toBeCloseTo(100 / grm, 2);
    });
  });

  // 8. Current GRM & 9. Target GRM
  describe('Current vs Target GRM', () => {
    it('should calculate current GRM from property value and annual rent', () => {
      const currentGRM = calculateGRM(7500000, 624000);
      expect(currentGRM).toBe(12.02);
    });

    // 10. GRM difference
    it('should calculate GRM difference', () => {
      expect(calculateGRMDifference(12.02, 8)).toBe(4.02);
    });

    // 11. GRM difference %
    it('should calculate GRM difference percent', () => {
      expect(calculateGRMDifferencePercent(12.02, 8)).toBe(50.25);
    });

    it('should return null for null currentGRM', () => {
      expect(calculateGRMDifference(null, 8)).toBeNull();
    });

    it('should return null for undefined currentGRM in difference %', () => {
      expect(calculateGRMDifferencePercent(undefined, 8)).toBeNull();
    });

    it('should return null for zero targetGRM in difference %', () => {
      expect(calculateGRMDifferencePercent(12, 0)).toBeNull();
    });
  });

  // 12 & 13. Value difference
  describe('calculateValueDifference', () => {
    it('should calculate value difference and percent', () => {
      const result = calculateValueDifference(6000000, 7500000);
      expect(result.valueDifference).toBe(-1500000);
      expect(result.valueDifferencePct).toBe(-20);
    });

    it('should return null for zero current value', () => {
      const result = calculateValueDifference(6000000, 0);
      expect(result.valueDifference).toBeNull();
      expect(result.valueDifferencePct).toBeNull();
    });

    it('should handle implied > current', () => {
      const result = calculateValueDifference(8000000, 7000000);
      expect(result.valueDifference).toBe(1000000);
      expect(result.valueDifferencePct).toBe(14.29);
    });
  });

  // 14. Missing current property value
  describe('Missing current property value', () => {
    it('should handle missing current property value in master calculation', () => {
      const result = calculateGrossRentMultiplier({
        monthlyGrossRent: 50000,
        otherAnnualGrossIncome: 0,
        targetGRM: 10,
      });
      expect(result.isValid).toBe(true);
      expect(result.currentPropertyValue).toBeNull();
      expect(result.currentGRM).toBeNull();
      expect(result.grmDifference).toBeNull();
      expect(result.valueDifference).toBeNull();
    });
  });

  // 15. Zero current property value
  describe('Zero current property value', () => {
    it('should handle zero current property value', () => {
      const result = calculateGrossRentMultiplier({
        currentPropertyValue: 0,
        monthlyGrossRent: 50000,
        targetGRM: 10,
      });
      expect(result.isValid).toBe(true);
      expect(result.currentGRM).toBeNull();
    });
  });

  // 16. Zero rent (master)
  describe('Zero rent validation', () => {
    it('should return invalid state for zero rent', () => {
      const result = calculateGrossRentMultiplier({
        currentPropertyValue: 7500000,
        monthlyGrossRent: 0,
        otherAnnualGrossIncome: 0,
        targetGRM: 10,
      });
      expect(result.isValid).toBe(false);
      expect(result.annualGrossRent).toBe(0);
    });
  });

  // 17. Negative rent
  describe('Negative rent', () => {
    it('should sanitize negative rent to zero and return invalid', () => {
      const result = calculateGrossRentMultiplier({
        monthlyGrossRent: -5000,
        otherAnnualGrossIncome: -3000,
        targetGRM: 10,
      });
      expect(result.isValid).toBe(false);
      expect(result.annualGrossRent).toBe(0);
    });
  });

  // 19. Zero target GRM
  describe('Zero target GRM', () => {
    it('should handle zero target GRM gracefully', () => {
      const result = calculateGrossRentMultiplier({
        monthlyGrossRent: 50000,
        targetGRM: 0,
      });
      expect(result.isValid).toBe(true);
      expect(result.impliedValue).toBe(0);
      expect(result.targetGRM).toBeNull();
    });
  });

  // 23. Sensitivity matrix
  describe('calculateSensitivity', () => {
    const sensitivity = calculateSensitivity(600000, 10);

    it('should return correct number of rent scenarios', () => {
      expect(sensitivity.rentScenarios).toHaveLength(5);
    });

    it('should return correct GRM scenarios', () => {
      expect(sensitivity.grmScenarios).toEqual([5, 7, 9, 11, 13]);
    });

    it('should have correct matrix dimensions', () => {
      expect(sensitivity.matrix).toHaveLength(5);
      expect(sensitivity.matrix[0]).toHaveLength(5);
    });

    // 24. Base sensitivity cell
    it('should have correct base scenario cell', () => {
      // Base rent (0%) row = index 2, GRM=9 column = index 2
      expect(sensitivity.matrix[2][2]).toBe(5400000); // 600000 × 9
    });

    // 25. Rent sensitivity
    it('should reflect rent variations correctly', () => {
      // -20% rent = 480000, GRM=5 => 2400000
      expect(sensitivity.matrix[0][0]).toBe(2400000);
      // +20% rent = 720000, GRM=13 => 9360000
      expect(sensitivity.matrix[4][4]).toBe(9360000);
    });

    // 26. GRM sensitivity
    it('should reflect GRM variations correctly at base rent', () => {
      // Base rent = 600000, GRM=5 => 3000000
      expect(sensitivity.matrix[2][0]).toBe(3000000);
      // Base rent = 600000, GRM=13 => 7800000
      expect(sensitivity.matrix[2][4]).toBe(7800000);
    });
  });

  // 27. Comparable GRM
  describe('Comparable GRM', () => {
    it('should calculate comparable GRM when both inputs are provided', () => {
      const result = calculateGrossRentMultiplier({
        monthlyGrossRent: 50000,
        targetGRM: 10,
        comparablePropertyPrice: 8000000,
        comparableAnnualGrossRent: 720000,
      });
      expect(result.comparableGRM).toBe(11.11);
    });

    // 28. Missing comparable data
    it('should return null comparable GRM when data is missing', () => {
      const result = calculateGrossRentMultiplier({
        monthlyGrossRent: 50000,
        targetGRM: 10,
      });
      expect(result.comparableGRM).toBeNull();
    });

    it('should return null comparable GRM when comparable rent is zero', () => {
      const result = calculateGrossRentMultiplier({
        monthlyGrossRent: 50000,
        targetGRM: 10,
        comparablePropertyPrice: 8000000,
        comparableAnnualGrossRent: 0,
      });
      expect(result.comparableGRM).toBeNull();
    });
  });

  // 29. Operating expenses excluded
  describe('Operating expenses excluded from GRM', () => {
    it('should not accept operating expenses as an input parameter', () => {
      const result = calculateGrossRentMultiplier({
        currentPropertyValue: 7500000,
        monthlyGrossRent: 50000,
        targetGRM: 10,
      });
      // GRM uses gross rent, not net operating income
      expect(result.annualGrossRent).toBe(600000);
      expect(result.currentGRM).toBe(12.5);
      // Verify no opex field in results
      expect(result).not.toHaveProperty('operatingExpenses');
      expect(result).not.toHaveProperty('noi');
    });
  });

  // 30. Mortgage debt excluded
  describe('Mortgage debt excluded from GRM', () => {
    it('should not include mortgage debt service in GRM calculations', () => {
      const result = calculateGrossRentMultiplier({
        currentPropertyValue: 7500000,
        monthlyGrossRent: 50000,
        targetGRM: 10,
      });
      expect(result).not.toHaveProperty('debtService');
      expect(result).not.toHaveProperty('mortgageEmi');
      // GRM is purely gross income based
      expect(result.annualGrossRent).toBe(600000);
    });
  });

  // 31. Vacancy not deducted in primary GRM
  describe('Vacancy not deducted in primary GRM', () => {
    it('should not subtract vacancy from gross rent for GRM', () => {
      const result = calculateGrossRentMultiplier({
        currentPropertyValue: 7500000,
        monthlyGrossRent: 50000,
        targetGRM: 10,
      });
      // Annual gross rent should be pure monthly×12 with no vacancy deduction
      expect(result.annualGrossRent).toBe(600000);
      expect(result).not.toHaveProperty('vacancyLoss');
      expect(result).not.toHaveProperty('effectiveGrossIncome');
    });
  });

  // 32. Cap rate not substituted
  describe('Cap rate not substituted for GRM', () => {
    it('should not output cap rate or confuse GRM with cap rate methodology', () => {
      const result = calculateGrossRentMultiplier({
        currentPropertyValue: 7500000,
        monthlyGrossRent: 50000,
        targetGRM: 10,
      });
      expect(result).not.toHaveProperty('capRate');
      expect(result).not.toHaveProperty('capRatePct');
    });
  });

  // 33. Representative residential scenario
  describe('Representative residential scenario', () => {
    it('should produce correct results for a typical residential property', () => {
      const result = calculateGrossRentMultiplier({
        currentPropertyValue: 5000000,
        monthlyGrossRent: 35000,
        otherAnnualGrossIncome: 12000,
        targetGRM: 10,
      });
      expect(result.isValid).toBe(true);
      expect(result.annualGrossRent).toBe(432000); // 35000×12 + 12000
      expect(result.currentGRM).toBe(11.57); // 5000000 / 432000
      expect(result.impliedValue).toBe(4320000); // 432000 × 10
    });
  });

  // 34. Representative multifamily scenario
  describe('Representative multifamily scenario', () => {
    it('should produce correct results for a multifamily property', () => {
      const result = calculateGrossRentMultiplier({
        currentPropertyValue: 25000000,
        monthlyGrossRent: 200000,
        otherAnnualGrossIncome: 120000,
        targetGRM: 8,
      });
      expect(result.isValid).toBe(true);
      expect(result.annualGrossRent).toBe(2520000);
      expect(result.currentGRM).toBe(9.92);
      expect(result.impliedValue).toBe(20160000);
    });
  });

  // 35. Representative commercial scenario
  describe('Representative commercial scenario', () => {
    it('should produce correct results for a commercial property', () => {
      const result = calculateGrossRentMultiplier({
        currentPropertyValue: 12000000,
        monthlyGrossRent: 120000,
        otherAnnualGrossIncome: 50000,
        targetGRM: 7,
      });
      expect(result.isValid).toBe(true);
      expect(result.annualGrossRent).toBe(1490000);
      expect(result.currentGRM).toBe(8.05);
      expect(result.impliedValue).toBe(10430000);
    });
  });

  // 36. Invalid state
  describe('Invalid state handling', () => {
    it('should return invalid state with proper message for no rental input', () => {
      const result = calculateGrossRentMultiplier({});
      expect(result.isValid).toBe(false);
      expect(result.validationMessage).toContain('gross rental income');
    });

    it('should still include sensitivity even when invalid', () => {
      const result = calculateGrossRentMultiplier({});
      expect(result.sensitivity).toBeDefined();
      expect(result.sensitivity.matrix).toBeDefined();
    });
  });

  // 37. Full end-to-end scenario
  describe('Full end-to-end scenario', () => {
    it('should produce a complete, internally consistent result set', () => {
      const result = calculateGrossRentMultiplier({
        currentPropertyValue: 7500000,
        monthlyGrossRent: 50000,
        otherAnnualGrossIncome: 24000,
        targetGRM: 8,
        comparablePropertyPrice: 8000000,
        comparableAnnualGrossRent: 720000,
      });
      expect(result.isValid).toBe(true);
      expect(result.annualGrossRent).toBe(624000);
      expect(result.currentGRM).toBe(12.02);
      expect(result.impliedValue).toBe(4992000);
      expect(result.grossRentYieldPct).toBe(8.32);
      expect(result.grmDifference).toBe(4.02);
      expect(result.grmDifferencePct).toBe(50.25);
      expect(result.valueDifference).toBe(-2508000);
      expect(result.valueDifferencePct).toBe(-33.44);
      expect(result.comparableGRM).toBe(11.11);
      expect(result.sensitivity.matrix).toHaveLength(5);
    });
  });

  // 38. Regression scenario
  describe('Regression scenario', () => {
    it('should maintain consistent results across recalculations', () => {
      const inputs = {
        currentPropertyValue: 10000000,
        monthlyGrossRent: 80000,
        otherAnnualGrossIncome: 60000,
        targetGRM: 9,
      };
      const result1 = calculateGrossRentMultiplier(inputs);
      const result2 = calculateGrossRentMultiplier(inputs);
      expect(result1.annualGrossRent).toBe(result2.annualGrossRent);
      expect(result1.currentGRM).toBe(result2.currentGRM);
      expect(result1.impliedValue).toBe(result2.impliedValue);
      expect(result1.grossRentYieldPct).toBe(result2.grossRentYieldPct);

      // Verify exact values
      expect(result1.annualGrossRent).toBe(1020000);
      expect(result1.currentGRM).toBe(9.8);
      expect(result1.impliedValue).toBe(9180000);
    });
  });

  // 39. Preset validation
  describe('Preset validation', () => {
    it('should have all required presets in config', () => {
      expect(GRM_CONFIG.scenarios.singleFamilyRental).toBeDefined();
      expect(GRM_CONFIG.scenarios.duplexSmallMultifamily).toBeDefined();
      expect(GRM_CONFIG.scenarios.apartmentProperty).toBeDefined();
      expect(GRM_CONFIG.scenarios.smallCommercialRental).toBeDefined();
    });

    it('should produce valid results for all presets', () => {
      Object.values(GRM_CONFIG.scenarios).forEach((preset) => {
        const result = calculateGrossRentMultiplier({
          currentPropertyValue: preset.currentPropertyValue,
          monthlyGrossRent: preset.monthlyGrossRent,
          otherAnnualGrossIncome: preset.otherAnnualGrossIncome,
          targetGRM: preset.targetGRM,
        });
        expect(result.isValid).toBe(true);
        expect(result.annualGrossRent).toBeGreaterThan(0);
        expect(result.currentGRM).not.toBeNull();
        expect(result.impliedValue).toBeGreaterThan(0);
      });
    });
  });

  // 40. Formatting/precision regression
  describe('Formatting and precision regression', () => {
    it('should return GRM rounded to exactly 2 decimal places', () => {
      const grm = calculateGRM(7777777, 666666);
      expect(typeof grm).toBe('number');
      const str = grm.toString();
      const decimals = str.includes('.') ? str.split('.')[1].length : 0;
      expect(decimals).toBeLessThanOrEqual(2);
    });

    it('should return gross rent yield rounded to 2 decimal places', () => {
      const yieldPct = calculateGrossRentYield(777777, 9999999);
      expect(typeof yieldPct).toBe('number');
      const str = yieldPct.toString();
      const decimals = str.includes('.') ? str.split('.')[1].length : 0;
      expect(decimals).toBeLessThanOrEqual(2);
    });

    it('should return integer implied values (no floating point drift)', () => {
      const impliedValue = calculateImpliedValueFromGRM(624000, 8);
      expect(Number.isInteger(impliedValue)).toBe(true);
    });
  });

  // Additional regression tests
  describe('Additional regression tests', () => {
    it('should handle very small GRM values', () => {
      const grm = calculateGRM(100000, 200000);
      expect(grm).toBe(0.5);
    });

    it('should handle GRM when price equals annual rent', () => {
      const grm = calculateGRM(600000, 600000);
      expect(grm).toBe(1);
    });

    it('should yield reciprocal of gross rent yield at scale', () => {
      const grm = calculateGRM(12000000, 1440000);
      const yieldPct = calculateGrossRentYield(1440000, 12000000);
      // 100 / GRM should equal yield
      expect(Number((100 / grm).toFixed(2))).toBe(yieldPct);
    });

    it('should handle NaN inputs gracefully', () => {
      expect(calculateGRM(NaN, 600000)).toBe(0);
      expect(calculateGRM(5000000, NaN)).toBeNull();
      expect(calculateAnnualGrossRent(NaN, NaN)).toBe(0);
    });

    it('should handle undefined inputs gracefully', () => {
      expect(calculateAnnualGrossRent(undefined, undefined)).toBe(0);
      expect(calculateGRM(undefined, undefined)).toBeNull();
    });

    it('should not divide by zero anywhere in master calculation', () => {
      const result = calculateGrossRentMultiplier({
        currentPropertyValue: 0,
        monthlyGrossRent: 0,
        otherAnnualGrossIncome: 0,
        targetGRM: 0,
      });
      expect(result.isValid).toBe(false);
      // Ensure no Infinity or NaN in results
      expect(Number.isFinite(result.annualGrossRent)).toBe(true);
    });
  });
});
