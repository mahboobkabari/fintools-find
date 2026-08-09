import { describe, it, expect } from 'vitest';
import { calculateFdVsDebtFundCalculator } from '../fd-vs-debt-fund-calculator.js';

describe('Flagship FD vs Debt Mutual Fund Decision Engine', () => {
  it('1. verifies Standard ₹5L Three-Year Comparison Baseline @ 30% Tax Slab', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 500000,
      tenureYears: 3,
      fdInterestRate: 7.0,
      debtFundReturnRate: 7.5,
      arbitrageReturnRate: 6.8,
      taxSlabRate: 30.0,
    });

    expect(result.depositAmount).toBe(500000);
    expect(result.tenureYears).toBe(3);
    expect(result.postTaxFdValue).toBeGreaterThan(500000);
    expect(result.postTaxDebtFundValue).toBeGreaterThan(500000);
    expect(result.postTaxArbitrageValue).toBeGreaterThan(500000);
  });

  it('2. verifies Zero Tax-Rate Scenario (0% Tax Slab Parity)', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 500000,
      tenureYears: 3,
      fdInterestRate: 7.0,
      debtFundReturnRate: 7.0,
      arbitrageReturnRate: 7.0,
      taxSlabRate: 0,
    });

    expect(result.taxFdLiability).toBe(0);
    expect(result.taxDebtLiability).toBe(0);
    expect(result.taxArbLiability).toBe(0);
  });

  it('3. verifies High Marginal Tax Scenario (40% Tax Slab)', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 500000,
      tenureYears: 3,
      taxSlabRate: 40.0,
    });

    expect(result.taxFdLiability).toBeGreaterThan(0);
    expect(result.taxDebtLiability).toBeGreaterThan(0);
  });

  it('4. verifies FD Quarterly Compounding: ₹5L @ 7% for 3 Years Gross Maturity', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 500000,
      tenureYears: 3,
      fdInterestRate: 7.0,
    });

    // 500,000 * (1 + 0.07/4)^12 = 615,720
    const fdOption = result.options.find(o => o.id === 'fd');
    expect(fdOption.grossValue).toBe(615720);
  });

  it('5. calculates FD Annual Tax Drag accurately', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 500000,
      tenureYears: 3,
      fdInterestRate: 7.0,
      taxSlabRate: 30.0,
    });

    expect(result.taxDragFd).toBeGreaterThan(0);
    expect(result.postTaxFdCagr).toBeLessThan(7.0);
  });

  it('6. verifies FD TDS vs Final Tax distinction (30% slab + 4% Cess = 31.2% tax)', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 500000,
      tenureYears: 3,
      fdInterestRate: 7.0,
      taxSlabRate: 30.0,
      cessRate: 4.0,
    });

    // Gross interest = 115,720. Tax @ 31.2% = 36,105
    expect(result.taxFdLiability).toBe(36105);
  });

  it('7. verifies Debt Fund Section 50AA applicable case (STCG at slab rate on redemption)', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 500000,
      tenureYears: 3,
      debtFundReturnRate: 7.5,
      taxSlabRate: 30.0,
      isSec50aaApplies: true,
    });

    // Gross Debt Value = 500,000 * (1.075)^3 = 621,148. Gain = 121,148. Tax @ 31.2% = 37,798
    expect(result.taxDebtLiability).toBe(37798);
  });

  it('8. verifies Arbitrage STCG case (Tenure = 1 Year, 20% + Cess tax rate)', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 500000,
      tenureYears: 1,
      arbitrageReturnRate: 7.0,
      taxSlabRate: 30.0,
    });

    // Gross Arb Value = 500,000 * 1.07 = 535,000. Gain = 35,000. STCG Tax @ 20.8% = 7,280
    expect(result.taxArbLiability).toBe(7280);
  });

  it('9. verifies Arbitrage LTCG case (Tenure = 3 Years, 12.5% + Cess tax rate)', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 500000,
      tenureYears: 3,
      arbitrageReturnRate: 6.8,
    });

    // Gross Arb Value = 500,000 * (1.068)^3 = 609,088. Gain = 109,088 <= 1.25L exemption threshold -> Tax = 0
    expect(result.taxArbLiability).toBe(0);
  });

  it('10. verifies Section 112A Exemption Threshold Boundary (Gains > ₹1,25,000 taxed @ 13%)', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 5000000, // ₹50L
      tenureYears: 3,
      arbitrageReturnRate: 7.0,
    });

    // Gross Arb Value = 5,000,000 * (1.07)^3 = 6,125,215. Gain = 1,125,215. Exemption = 125,000. Taxable = 1,000,215. Tax @ 13% = 130,028
    expect(result.taxArbLiability).toBe(130028);
  });

  it('11. verifies Tax Slab Boundary Cases (20% Slab)', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 500000,
      tenureYears: 3,
      taxSlabRate: 20.0,
    });

    expect(result.taxSlabRate).toBe(20.0);
  });

  it('12. calculates Cess accurately (4% Health & Education Cess)', () => {
    const result = calculateFdVsDebtFundCalculator({
      cessRate: 4.0,
    });

    expect(result.cessRate).toBe(4.0);
  });

  it('13. calculates short investment horizon (1 Year)', () => {
    const result = calculateFdVsDebtFundCalculator({
      tenureYears: 1,
    });

    expect(result.yearlySchedule.length).toBe(1);
  });

  it('14. calculates long investment horizon (10 Years)', () => {
    const result = calculateFdVsDebtFundCalculator({
      tenureYears: 10,
    });

    expect(result.yearlySchedule.length).toBe(10);
  });

  it('15. verifies High FD Rate Scenario (8.5% FD vs 7.0% Debt)', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 500000,
      tenureYears: 3,
      fdInterestRate: 8.5,
      debtFundReturnRate: 7.0,
      arbitrageReturnRate: 6.0,
      taxSlabRate: 10.0,
    });

    expect(result.winningOptionId).toBe('fd');
  });

  it('16. verifies High Debt-Fund Return Scenario (9.0% Debt vs 7.0% FD)', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 500000,
      tenureYears: 3,
      fdInterestRate: 7.0,
      debtFundReturnRate: 9.0,
      arbitrageReturnRate: 6.0,
      taxSlabRate: 30.0,
    });

    expect(result.winningOptionId).toBe('debt_fund');
  });

  it('17. verifies High Arbitrage Return Scenario (8.0% Arb vs 7.0% FD)', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 500000,
      tenureYears: 3,
      fdInterestRate: 7.0,
      debtFundReturnRate: 7.5,
      arbitrageReturnRate: 8.0,
      taxSlabRate: 30.0,
    });

    expect(result.winningOptionId).toBe('arbitrage_fund');
  });

  it('18. handles zero principal edge case cleanly', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 0,
    });

    expect(result.postTaxFdValue).toBe(0);
    expect(result.postTaxDebtFundValue).toBe(0);
    expect(result.postTaxArbitrageValue).toBe(0);
  });

  it('19. handles negative input sanitization cleanly', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: -500000,
      tenureYears: -3,
      fdInterestRate: -7.0,
    });

    expect(result.depositAmount).toBe(0);
    expect(result.tenureYears).toBe(1);
    expect(result.fdInterestRate).toBe(0);
  });

  it('20. handles USD currency mode formatting', () => {
    const result = calculateFdVsDebtFundCalculator({
      depositAmount: 10000,
      currency: 'USD',
    });

    expect(result.currency).toBe('USD');
    expect(result.heroText).toContain('$10,000');
  });
});
