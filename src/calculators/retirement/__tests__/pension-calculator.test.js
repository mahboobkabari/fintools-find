import { describe, it, expect } from 'vitest';
import { calculatePensionCalculator } from '../pension-calculator.js';

describe('Flagship Pension & Annuity Decision Engine', () => {
  it('1. calculates Return of Purchase Price (ROP) baseline annuity (₹50 Lakhs @ 6.5%)', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 5000000,
      annuityRate: 6.5,
      annuityType: 'rop',
    });

    expect(result.netAnnuityCorpus).toBe(5000000);
    expect(result.effectiveAnnuityRate).toBe(6.5);
    expect(result.annualAnnuityPension).toBe(325000); // ₹50L * 6.5% = ₹3,25,000/yr
    expect(result.monthlyAnnuityPension).toBe(27083); // ₹3,25,000 / 12 = ₹27,083/mo
    expect(result.primaryOutput).toBe(result.totalMonthlyIncome);
  });

  it('2. calculates Single Life Annuity (+0.5% rate enhancement)', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 5000000,
      annuityRate: 6.5,
      annuityType: 'single_life',
    });

    expect(result.effectiveAnnuityRate).toBe(7.0); // 6.5% + 0.5% = 7.0%
    expect(result.annualAnnuityPension).toBe(350000); // ₹50L * 7.0% = ₹3,50,000/yr
    expect(result.monthlyAnnuityPension).toBe(29167);
  });

  it('3. calculates Joint Life Annuity (-0.3% rate adjustment for 100% spouse coverage)', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 5000000,
      annuityRate: 6.5,
      annuityType: 'joint_life',
    });

    expect(result.effectiveAnnuityRate).toBe(6.2); // 6.5% - 0.3% = 6.2%
    expect(result.annualAnnuityPension).toBe(310000);
    expect(result.monthlyAnnuityPension).toBe(25833);
  });

  it('4. calculates 20-Year Guaranteed Period Annuity (+0.2% rate adjustment)', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 5000000,
      annuityRate: 6.5,
      annuityType: 'guaranteed_20y',
    });

    expect(result.effectiveAnnuityRate).toBe(6.7);
    expect(result.annualAnnuityPension).toBe(335000);
    expect(result.monthlyAnnuityPension).toBe(27917);
  });

  it('5. Section 10(10A) Gratuity Covered private employee commutation (1/3rd tax-free)', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 6000000,
      commutationPct: 33.33,
      employmentType: 'private_gratuity',
    });

    expect(result.rawCommutedLumpSum).toBe(1999800);
    expect(result.exemptCommutedLumpSum).toBe(1999800); // 100% of commuted is tax-free (< 1/3 limit)
    expect(result.taxableCommutedLumpSum).toBe(0);
    expect(result.netAnnuityCorpus).toBe(4000200);
  });

  it('6. Section 10(10A) Private Non-Gratuity employee commutation (1/2 tax-free limit)', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 6000000,
      commutationPct: 40, // 40% commuted = ₹24 Lakhs
      employmentType: 'private_non_gratuity',
    });

    // 1/2 limit = ₹30 Lakhs max tax-free
    expect(result.rawCommutedLumpSum).toBe(2400000);
    expect(result.maxTaxFreeCommutedAmount).toBe(3000000);
    expect(result.exemptCommutedLumpSum).toBe(2400000);
    expect(result.taxableCommutedLumpSum).toBe(0);
  });

  it('7. Section 10(10A) Government employee commutation (100% tax-free)', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 10000000, // ₹1 Crore
      commutationPct: 50, // 50% commuted = ₹50 Lakhs
      employmentType: 'government',
    });

    expect(result.rawCommutedLumpSum).toBe(5000000);
    expect(result.exemptCommutedLumpSum).toBe(5000000); // 100% exempt for Govt
    expect(result.taxableCommutedLumpSum).toBe(0);
  });

  it('8. calculates taxable portion when commutation exceeds statutory fraction limit', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 6000000,
      commutationPct: 50, // 50% commuted = ₹30 Lakhs
      employmentType: 'private_gratuity', // Max tax-free is 1/3rd = ₹20 Lakhs
    });

    expect(result.rawCommutedLumpSum).toBe(3000000);
    expect(result.maxTaxFreeCommutedAmount).toBe(2000000);
    expect(result.exemptCommutedLumpSum).toBe(2000000);
    expect(result.taxableCommutedLumpSum).toBe(1000000); // ₹10 Lakhs taxable
  });

  it('9. EPFO EPS-95 minimum qualifying service boundary (<10 years = ₹0 monthly pension)', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 0,
      epsServiceYears: 8, // < 10 years
      epsSalary: 15000,
    });

    expect(result.isEpsEligible).toBe(false);
    expect(result.epsMonthlyPension).toBe(0);
  });

  it('10. EPFO EPS-95 standard 15-year service calculation', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 0,
      epsServiceYears: 15,
      epsSalary: 15000,
    });

    expect(result.isEpsEligible).toBe(true);
    expect(result.effectiveServiceYears).toBe(15);
    // (15,000 * 15) / 70 = ₹3,214/month
    expect(result.epsMonthlyPension).toBe(3214);
  });

  it('11. EPFO EPS-95 2-year bonus rule for service >= 20 years', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 0,
      epsServiceYears: 25,
      epsSalary: 15000,
    });

    expect(result.isEpsEligible).toBe(true);
    expect(result.effectiveServiceYears).toBe(27); // 25 + 2 bonus = 27 years
    // (15,000 * 27) / 70 = ₹5,786/month
    expect(result.epsMonthlyPension).toBe(5786);
  });

  it('12. EPFO EPS-95 statutory salary ceiling cap enforcement (₹15,000 max)', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 0,
      epsServiceYears: 30,
      epsSalary: 50000, // ₹50k input capped at ₹15k statutory limit
    });

    expect(result.epsSalary).toBe(15000);
    expect(result.effectiveServiceYears).toBe(32); // 30 + 2 bonus = 32
    // (15,000 * 32) / 70 = ₹6,857/month
    expect(result.epsMonthlyPension).toBe(6857);
  });

  it('13. EPFO EPS-95 maximum service cap enforcement (35 + 2 = 37 years max)', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 0,
      epsServiceYears: 40, // Input 40 years
      epsSalary: 15000,
    });

    expect(result.effectiveServiceYears).toBe(37); // Capped at 37
    // (15,000 * 37) / 70 = ₹7,929/month
    expect(result.epsMonthlyPension).toBe(7929);
  });

  it('14. combines Annuity Monthly Pension and EPFO EPS-95 Pension', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 5000000, // ₹27,083/mo annuity
      annuityRate: 6.5,
      epsServiceYears: 25, // ₹5,786/mo EPS
      epsSalary: 15000,
    });

    expect(result.monthlyAnnuityPension).toBe(27083);
    expect(result.epsMonthlyPension).toBe(5786);
    expect(result.totalMonthlyIncome).toBe(32869); // ₹27,083 + ₹5,786
  });

  it('15. calculates 20-year inflation-adjusted real purchasing power pension', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 5000000,
      annuityRate: 6.5,
      inflationRate: 5.0,
    });

    // ₹27,083 / (1.05)^20 = ₹10,207
    expect(result.purchasingPowerMonthly).toBe(10207);
  });

  it('16. simulates Pension Annuity vs Equity SWP ending balance', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 5000000,
      annuityRate: 6.5,
      expectedSwpReturn: 8.5,
    });

    // At 8.5% return withdrawing ₹27,083/mo (6.5% rate), SWP balance grows over 20 years
    expect(result.swpEndingBalance).toBeGreaterThan(5000000);
    expect(result.swpTotalWithdrawn).toBe(6499920); // ₹27,083 * 240
  });

  it('17. computes 20-year cash flow payout schedule table', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 5000000,
      annuityRate: 6.5,
      epsServiceYears: 20,
    });

    expect(result.yearlySchedule.length).toBe(20);
    expect(result.yearlySchedule[0].year).toBe(1);
    expect(result.yearlySchedule[19].year).toBe(20);
    expect(result.yearlySchedule[19].cumulativePension).toBeGreaterThan(0);
  });

  it('18. handles zero corpus and zero service edge case cleanly', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 0,
      epsServiceYears: 0,
    });

    expect(result.totalMonthlyIncome).toBe(0);
    expect(result.totalAnnualIncome).toBe(0);
    expect(Number.isNaN(result.totalMonthlyIncome)).toBe(false);
    expect(result.heroText).toContain('Please enter your pension corpus');
  });

  it('19. handles high pension corpus boundary (₹10 Crores)', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 100000000,
      annuityRate: 6.5,
    });

    expect(result.pensionCorpus).toBe(100000000);
    expect(result.monthlyAnnuityPension).toBe(541667); // ₹10 Cr * 6.5% / 12 = ₹5,41,667/mo
  });

  it('20. handles USD currency mode formatting', () => {
    const result = calculatePensionCalculator({
      pensionCorpus: 500000,
      annuityRate: 6.0,
      currency: 'USD',
    });

    expect(result.currency).toBe('USD');
    expect(result.heroText).toContain('$5,00,000');
  });
});