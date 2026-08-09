import { describe, it, expect } from 'vitest';
import { calculateScssCalculator } from '../scss-calculator.js';

describe('Flagship Senior Citizens Savings Scheme (SCSS) Math & Decision Engine', () => {
  it('1. Individual maximum deposit cap enforcement (₹30 Lakhs)', () => {
    const result = calculateScssCalculator({
      depositAmount: 3000000,
      accountType: 'individual',
      rate: 8.2,
    });

    expect(result.statutoryMaxCap).toBe(3000000);
    expect(result.depositAmount).toBe(3000000);
    expect(result.isCapped).toBe(false);
  });

  it('2. Joint spouse account limit enforcement (₹60 Lakhs for eligible couple)', () => {
    const result = calculateScssCalculator({
      depositAmount: 6000000,
      accountType: 'joint',
      rate: 8.2,
    });

    expect(result.statutoryMaxCap).toBe(6000000);
    expect(result.depositAmount).toBe(6000000);
    expect(result.isCapped).toBe(false);
    expect(result.quarterlyGrossPayout).toBe(123000);
  });

  it('3. Quarterly payout calculation accuracy (Deposit * Rate / 4)', () => {
    const result = calculateScssCalculator({
      depositAmount: 2000000,
      rate: 8.2,
    });

    // ₹20L * (8.2% / 4) = ₹20L * 2.05% = ₹41,000 per quarter
    expect(result.quarterlyGrossPayout).toBe(41000);
    expect(result.annualGrossInterest).toBe(164000);
  });

  it('4. Current government-notified interest rate (8.2% p.a. default)', () => {
    const result = calculateScssCalculator({
      depositAmount: 1000000,
    });

    expect(result.rate).toBe(8.2);
    expect(result.quarterlyGrossPayout).toBe(20500);
  });

  it('5. 60-year eligibility boundary standard category', () => {
    const result = calculateScssCalculator({
      eligibilityCategory: 'age_60_plus',
    });
    expect(result.eligibilityCategory).toBe('age_60_plus');
  });

  it('6. Retired civilian 55-60 eligibility category', () => {
    const result = calculateScssCalculator({
      eligibilityCategory: 'vrs_55_60',
    });
    expect(result.eligibilityCategory).toBe('vrs_55_60');
  });

  it('7. Retired defense 50+ eligibility category', () => {
    const result = calculateScssCalculator({
      eligibilityCategory: 'defense_50_plus',
    });
    expect(result.eligibilityCategory).toBe('defense_50_plus');
  });

  it('8. Deposit-cap enforcement when input exceeds statutory limit', () => {
    const resultIndividual = calculateScssCalculator({
      depositAmount: 5000000, // ₹50L exceeds ₹30L limit
      accountType: 'individual',
    });
    expect(resultIndividual.isCapped).toBe(true);
    expect(resultIndividual.depositAmount).toBe(3000000);

    const resultJoint = calculateScssCalculator({
      depositAmount: 7000000, // ₹70L exceeds ₹60L limit
      accountType: 'joint',
    });
    expect(resultJoint.isCapped).toBe(true);
    expect(resultJoint.depositAmount).toBe(6000000);
  });

  it('9. Section 80C deduction limit (capped at ₹1,50,000 in deposit year)', () => {
    const resultHigh = calculateScssCalculator({
      depositAmount: 3000000,
      marginalTaxRate: 30,
    });
    expect(resultHigh.sec80cClaimable).toBe(150000);
    expect(resultHigh.sec80cTaxSaved).toBe(45000);

    const resultLow = calculateScssCalculator({
      depositAmount: 100000,
      marginalTaxRate: 20,
    });
    expect(resultLow.sec80cClaimable).toBe(100000);
    expect(resultLow.sec80cTaxSaved).toBe(20000);
  });

  it('10. Section 80TTB applicable deduction (up to ₹50,000 interest exemption)', () => {
    const result = calculateScssCalculator({
      depositAmount: 3000000, // ₹2,46,000 annual interest
      rate: 8.2,
      marginalTaxRate: 20,
    });

    expect(result.sec80ttbExemptInterest).toBe(50000);
    expect(result.taxableAnnualInterest).toBe(196000);
    expect(result.annualIncomeTaxPayable).toBe(39200);
  });

  it('11. Section 194A threshold audit (₹50,000 for senior citizens)', () => {
    const belowThreshold = calculateScssCalculator({
      depositAmount: 600000, // ₹49,200 annual interest (< ₹50,000)
      rate: 8.2,
    });
    expect(belowThreshold.isTdsApplicable).toBe(false);

    const aboveThreshold = calculateScssCalculator({
      depositAmount: 1000000, // ₹82,000 annual interest (> ₹50,000)
      rate: 8.2,
    });
    expect(aboveThreshold.isTdsApplicable).toBe(true);
  });

  it('12. PAN TDS scenario (10% statutory TDS rate)', () => {
    const result = calculateScssCalculator({
      depositAmount: 3000000, // ₹2,46,000 interest
      rate: 8.2,
      hasPan: true,
      hasForm15H: false,
    });

    expect(result.tdsRatePct).toBe(10);
    expect(result.estimatedAnnualTds).toBe(24600);
    expect(result.estimatedQuarterlyTds).toBe(6150);
    expect(result.netQuarterlyPayout).toBe(55350);
  });

  it('13. Non-PAN TDS scenario (20% penalty TDS under Sec 206AA)', () => {
    const result = calculateScssCalculator({
      depositAmount: 3000000,
      rate: 8.2,
      hasPan: false,
      hasForm15H: false,
    });

    expect(result.tdsRatePct).toBe(20);
    expect(result.estimatedAnnualTds).toBe(49200);
    expect(result.estimatedQuarterlyTds).toBe(12300);
    expect(result.netQuarterlyPayout).toBe(49200);
  });

  it('14. Form 15H scenario (0% TDS deduction when submitted)', () => {
    const result = calculateScssCalculator({
      depositAmount: 3000000,
      rate: 8.2,
      hasPan: true,
      hasForm15H: true,
    });

    expect(result.isTdsApplicable).toBe(false);
    expect(result.estimatedAnnualTds).toBe(0);
    expect(result.netQuarterlyPayout).toBe(result.quarterlyGrossPayout);
  });

  it('15. Premature closure after 1 year (1.5% principal penalty deduction)', () => {
    const result = calculateScssCalculator({
      depositAmount: 3000000,
      prematureExitYears: 1.5,
    });

    expect(result.isPrematureExit).toBe(true);
    expect(result.penaltyRatePct).toBe(1.5);
    expect(result.penaltyAmount).toBe(45000); // 1.5% of ₹30L = ₹45,000
    expect(result.netPrincipalRefund).toBe(2955000);
  });

  it('16. Premature closure after 2 years (1.0% principal penalty deduction)', () => {
    const result = calculateScssCalculator({
      depositAmount: 3000000,
      prematureExitYears: 3.0,
    });

    expect(result.isPrematureExit).toBe(true);
    expect(result.penaltyRatePct).toBe(1.0);
    expect(result.penaltyAmount).toBe(30000); // 1.0% of ₹30L = ₹30,000
    expect(result.netPrincipalRefund).toBe(2970000);
  });

  it('17. Full 5-year maturity (0% penalty, full principal refund & 20 quarters interest)', () => {
    const result = calculateScssCalculator({
      depositAmount: 3000000,
      prematureExitYears: 0, // Full 5 years
    });

    expect(result.isPrematureExit).toBe(false);
    expect(result.penaltyRatePct).toBe(0);
    expect(result.penaltyAmount).toBe(0);
    expect(result.netPrincipalRefund).toBe(3000000);
    expect(result.total5YearInterest).toBe(1230000);
  });

  it('18. Inflation-adjusted real purchasing power income over 5 years', () => {
    const result = calculateScssCalculator({
      depositAmount: 3000000,
      rate: 8.2,
      inflationRate: 5.0,
    });

    // ₹61,500 / (1.05)^5 = ₹48,187
    expect(result.purchasingPowerQuarterly).toBe(48187);
  });

  it('19. SCSS vs Senior Citizen Bank FD comparison engine', () => {
    const result = calculateScssCalculator({
      depositAmount: 3000000,
      rate: 8.2,
      expectedFdRate: 7.5,
    });

    expect(result.quarterlyGrossPayout).toBe(61500); // 8.2% SCSS
    expect(result.fdQuarterlyPayout).toBe(56250); // 7.5% Bank FD
    expect(result.scssIncomeDelta).toBe(105000); // ₹1.05 Lakhs higher interest over 5 years
  });

  it('20. Zero and negative/edge input handling', () => {
    const zeroResult = calculateScssCalculator({ depositAmount: 0 });
    expect(zeroResult.depositAmount).toBe(0);
    expect(zeroResult.quarterlyGrossPayout).toBe(0);
    expect(zeroResult.total5YearInterest).toBe(0);

    const negResult = calculateScssCalculator({ depositAmount: -5000 });
    expect(negResult.depositAmount).toBe(0);
    expect(negResult.quarterlyGrossPayout).toBe(0);
  });

  it('21. Boundary rounding cases for fractional rates & odd amounts', () => {
    const result = calculateScssCalculator({
      depositAmount: 1234567,
      rate: 8.25,
    });

    expect(Number.isInteger(result.quarterlyGrossPayout)).toBe(true);
    expect(Number.isInteger(result.annualGrossInterest)).toBe(true);
    expect(Number.isInteger(result.total5YearInterest)).toBe(true);
  });

  it('22. Financial-year and rate configuration changes', () => {
    const historicalRate = calculateScssCalculator({
      depositAmount: 3000000,
      rate: 7.4, // Historical Q4 FY22 SCSS rate
    });
    expect(historicalRate.quarterlyGrossPayout).toBe(55500);

    const currentRate = calculateScssCalculator({
      depositAmount: 3000000,
      rate: 8.2, // Current FY24/25 rate
    });
    expect(currentRate.quarterlyGrossPayout).toBe(61500);
  });
});

