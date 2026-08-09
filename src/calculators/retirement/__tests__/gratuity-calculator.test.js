import { describe, it, expect } from 'vitest';
import { calculateGratuityCalculator } from '../gratuity-calculator.js';

describe('Gratuity Calculator Math Engine — Sprint 33 Flagship Audit', () => {
  it('Reference Case A: Benchmark Covered Establishment (15/26 Rule, ₹50k basic, 15Y 7M = 16Y rounded)', () => {
    const result = calculateGratuityCalculator({
      lastDrawnBasic: 50000,
      tenureYears: 15,
      tenureMonths: 7,
      coverageType: 'covered',
    });

    expect(result.isEligible).toBe(true);
    expect(result.roundedYears).toBe(16);
    expect(result.gratuityAmount).toBe(461538); // (15/26) * 50,000 * 16 = ₹4,61,538
    expect(result.taxFreeGratuity).toBe(461538);
    expect(result.taxableGratuity).toBe(0);
    expect(result.primaryOutput).toBe(461538);
  });

  it('Reference Case B: Non-Covered Establishment (15/30 Rule, ₹60k basic, 10Y 4M = 10 Full Years)', () => {
    const result = calculateGratuityCalculator({
      lastDrawnBasic: 60000,
      tenureYears: 10,
      tenureMonths: 4,
      coverageType: 'non_covered',
    });

    expect(result.isEligible).toBe(true);
    expect(result.roundedYears).toBe(10); // No rounding for non-covered!
    expect(result.denominator).toBe(30);
    expect(result.gratuityAmount).toBe(300000); // (15/30) * 60,000 * 10 = ₹3,00,000
    expect(result.taxFreeGratuity).toBe(300000);
  });

  it('Reference Case C: Government Employee (100% Tax-Free Exemption)', () => {
    const result = calculateGratuityCalculator({
      lastDrawnBasic: 150000,
      tenureYears: 25,
      tenureMonths: 0,
      coverageType: 'government',
    });

    expect(result.gratuityAmount).toBe(2163462); // > ₹20 Lakhs
    expect(result.taxFreeGratuity).toBe(2163462); // 100% tax free for government!
    expect(result.taxableGratuity).toBe(0);
  });

  it('Reference Case D: Service Months Rounding Boundary (< 6 Mos vs >= 6 Mos)', () => {
    const roundDown = calculateGratuityCalculator({
      lastDrawnBasic: 50000,
      tenureYears: 10,
      tenureMonths: 5, // < 6 months -> 10 years
      coverageType: 'covered',
    });

    const roundUp = calculateGratuityCalculator({
      lastDrawnBasic: 50000,
      tenureYears: 10,
      tenureMonths: 6, // >= 6 months -> 11 years
      coverageType: 'covered',
    });

    expect(roundDown.roundedYears).toBe(10);
    expect(roundUp.roundedYears).toBe(11);
    expect(roundUp.gratuityAmount).toBeGreaterThan(roundDown.gratuityAmount);
  });

  it('Reference Case E: 5-Year Eligibility Threshold Failure & Disability Waiver Exception', () => {
    const ineligible = calculateGratuityCalculator({
      lastDrawnBasic: 60000,
      tenureYears: 3,
      tenureMonths: 2,
      isDisabilityWaiver: false,
    });
    expect(ineligible.isEligible).toBe(false);
    expect(ineligible.gratuityAmount).toBe(0);

    const waiverException = calculateGratuityCalculator({
      lastDrawnBasic: 60000,
      tenureYears: 3,
      tenureMonths: 2,
      isDisabilityWaiver: true, // Waiver granted!
    });
    expect(waiverException.isEligible).toBe(true);
    expect(waiverException.gratuityAmount).toBeGreaterThan(0);
  });

  it('Reference Case F: Section 10(10) ₹20 Lakh Tax Ceiling Breach', () => {
    const result = calculateGratuityCalculator({
      lastDrawnBasic: 150000,
      tenureYears: 25,
      tenureMonths: 0,
      coverageType: 'covered',
      marginalTaxRate: 30,
    });

    expect(result.gratuityAmount).toBe(2163462);
    expect(result.taxFreeGratuity).toBe(2000000); // Max ₹20L tax free cap
    expect(result.taxableGratuity).toBe(163462); // ₹1,63,462 taxable
    expect(result.estimatedTaxOnGratuity).toBe(49039); // 30% of taxable
  });

  it('Reference Case G: Work "1 to 5 More Years" Career Growth Simulator', () => {
    const result = calculateGratuityCalculator({
      lastDrawnBasic: 50000,
      tenureYears: 10,
      tenureMonths: 0,
      annualSalaryIncrease: 5,
    });

    expect(result.careerSimulators.length).toBe(5);
    const [plus1, plus2, plus3, plus4, plus5] = result.careerSimulators;

    expect(plus1.additionalGratuity).toBeGreaterThan(0);
    expect(plus5.projectedGratuity).toBeGreaterThan(result.gratuityAmount);
  });

  it('Reference Case H: Reverse Target Gratuity Solver & Round-Trip Consistency', () => {
    const goalResult = calculateGratuityCalculator({
      tenureYears: 15,
      tenureMonths: 7,
      coverageType: 'covered',
      calculationMode: 'reverse_gratuity',
      targetGratuity: 1000000, // ₹10 Lakhs target gratuity
    });

    expect(goalResult.lastDrawnBasic).toBeGreaterThan(0);

    // Round-trip verification: feed solved basic salary back into forward engine
    const roundTrip = calculateGratuityCalculator({
      lastDrawnBasic: goalResult.lastDrawnBasic,
      tenureYears: 15,
      tenureMonths: 7,
      coverageType: 'covered',
      calculationMode: 'forward',
    });

    expect(Math.abs(roundTrip.gratuityAmount - 1000000)).toBeLessThan(100); // within ₹100
  });

  it('handles edge cases safely without NaN or negative numbers', () => {
    // Edge Case 1: Zero Basic Salary
    const zeroSal = calculateGratuityCalculator({ lastDrawnBasic: 0 });
    expect(zeroSal.gratuityAmount).toBe(0);

    // Edge Case 2: Extreme High Salary & Service Years
    const extreme = calculateGratuityCalculator({ lastDrawnBasic: 1000000, tenureYears: 40 });
    expect(isNaN(extreme.gratuityAmount)).toBe(false);
    expect(isFinite(extreme.taxFreeGratuity)).toBe(true);
  });
});