import { describe, it, expect } from 'vitest';
import { calculateVpfCalculator } from '../vpf-calculator.js';

describe('Flagship Voluntary Provident Fund (VPF) Math Engine', () => {
  it('1. calculates standard VPF retirement growth (₹50k basic, 12% EPF + 10% VPF @ 8.25% p.a. over 28 years)', () => {
    const result = calculateVpfCalculator({
      monthlyBasicSalary: 50000,
      epfPercent: 12,
      vpfPercent: 10,
      currentAge: 30,
      retirementAge: 58,
      rate: 8.25,
      salaryGrowth: 5.0,
    });

    expect(result.monthlyBasicSalary).toBe(50000);
    expect(result.epfPercent).toBe(12);
    expect(result.vpfPercent).toBe(10);
    expect(result.tenureYears).toBe(28);
    expect(result.monthlyEpfContribution).toBe(6000); // 12% of ₹50k
    expect(result.monthlyVpfContribution).toBe(5000); // 10% of ₹50k
    expect(result.monthlyTotalEmployeeContribution).toBe(11000);

    expect(result.maturityCorpus).toBeGreaterThan(15000000); // Over ₹1.5 Crores
    expect(result.totalEmployeeContribution).toBeGreaterThan(7000000);
    expect(result.totalInterestEarned).toBeGreaterThan(8000000);
  });

  it('2. calculates mandatory EPF only baseline (0% VPF)', () => {
    const result = calculateVpfCalculator({
      monthlyBasicSalary: 50000,
      epfPercent: 12,
      vpfPercent: 0,
      currentAge: 30,
      retirementAge: 58,
      rate: 8.25,
      salaryGrowth: 5.0,
    });

    expect(result.vpfPercent).toBe(0);
    expect(result.monthlyVpfContribution).toBe(0);
    expect(result.monthlyEpfContribution).toBe(6000);
    expect(result.monthlyTotalEmployeeContribution).toBe(6000);
  });

  it('3. enforces maximum 100% basic contribution cap (12% EPF + 88% VPF)', () => {
    const result = calculateVpfCalculator({
      monthlyBasicSalary: 50000,
      epfPercent: 12,
      vpfPercent: 95, // Exceeds 88% max (total 100%)
    });

    expect(result.epfPercent).toBe(12);
    expect(result.vpfPercent).toBe(88); // Sanitized to 88%
    expect(result.monthlyTotalEmployeeContribution).toBe(50000); // 100% of basic
  });

  it('4. audits Section 10(11) tax-free threshold when employee contribution <= ₹2.5L/year', () => {
    const result = calculateVpfCalculator({
      monthlyBasicSalary: 50000,
      epfPercent: 12,
      vpfPercent: 10,
      currentAge: 30,
      retirementAge: 58,
      rate: 8.25,
      salaryGrowth: 0, // No salary growth for predictable annual contrib
    });

    // Annual contribution = ₹11,000 * 12 = ₹132,000 <= ₹250,000 cap
    expect(result.sec10_11CapExceeded).toBe(false);
    expect(result.taxableInterest).toBe(0);
    expect(result.taxFreeInterest).toBe(result.totalInterestEarned);
  });

  it('5. audits Section 10(11) excess contribution taxability when employee contribution > ₹2.5L/year', () => {
    const result = calculateVpfCalculator({
      monthlyBasicSalary: 200000, // ₹2 Lakhs basic
      epfPercent: 12,
      vpfPercent: 15, // Total 27% = ₹54,000/mo = ₹648,000/year > ₹2.5L cap
      currentAge: 40,
      retirementAge: 58,
      rate: 8.25,
      salaryGrowth: 0,
      marginalTaxRate: 30,
    });

    expect(result.sec10_11CapExceeded).toBe(true);
    expect(result.taxableInterest).toBeGreaterThan(0);
    expect(result.totalTaxPayableOnInterest).toBeGreaterThan(0);
    expect(result.netRetirementCorpusAfterTax).toBeLessThan(result.maturityCorpus);
  });

  it('6. calculates Year 1 Section 80C initial tax deduction (capped at ₹1.5L)', () => {
    const result = calculateVpfCalculator({
      monthlyBasicSalary: 50000,
      epfPercent: 12,
      vpfPercent: 10, // Y1 contrib = ₹132,000
      marginalTaxRate: 30,
    });

    expect(result.sec80cEligible).toBe(132000);
    expect(result.sec80cYear1Saved).toBe(39600); // ₹132,000 * 30% = ₹39,600

    const resultHigh = calculateVpfCalculator({
      monthlyBasicSalary: 100000,
      epfPercent: 12,
      vpfPercent: 10, // Y1 contrib = ₹264,000 > ₹1.5L 80C cap
      marginalTaxRate: 30,
    });

    expect(resultHigh.sec80cEligible).toBe(150000); // Capped at ₹1.5L
    expect(resultHigh.sec80cYear1Saved).toBe(45000); // ₹1.5L * 30% = ₹45,000
  });

  it('7. computes 28-year annual rollup schedule precision', () => {
    const result = calculateVpfCalculator({
      monthlyBasicSalary: 50000,
      epfPercent: 12,
      vpfPercent: 10,
      currentAge: 30,
      retirementAge: 58,
      rate: 8.25,
      salaryGrowth: 5.0,
    });

    expect(result.yearlySchedule.length).toBe(28);
    expect(result.yearlySchedule[0].year).toBe(1);
    expect(result.yearlySchedule[0].age).toBe(31);
    expect(result.yearlySchedule[0].annualContrib).toBe(132000);

    expect(result.yearlySchedule[27].year).toBe(28);
    expect(result.yearlySchedule[27].age).toBe(58);
    expect(result.yearlySchedule[27].endBalance).toBe(result.maturityCorpus);
  });

  it('8. computes VPF vs PPF (@ 7.1%) & NPS (@ 10%) yield comparison corpora', () => {
    const result = calculateVpfCalculator({
      monthlyBasicSalary: 50000,
      epfPercent: 12,
      vpfPercent: 10,
      currentAge: 30,
      retirementAge: 58,
      rate: 8.25, // VPF 8.25%
      ppfRate: 7.1,
      npsRate: 10.0,
    });

    // VPF (8.25%) > PPF (7.1% with ₹1.5L cap)
    expect(result.maturityCorpus).toBeGreaterThan(result.ppfCorpus);
    expect(result.vpfVsPpfDelta).toBeGreaterThan(0);

    // NPS (10%) > VPF (8.25%)
    expect(result.npsCorpus).toBeGreaterThan(result.maturityCorpus);
    expect(result.npsVsVpfDelta).toBeGreaterThan(0);
  });

  it('9. computes inflation-adjusted real purchasing power retirement corpus', () => {
    const result = calculateVpfCalculator({
      monthlyBasicSalary: 50000,
      epfPercent: 12,
      vpfPercent: 10,
      currentAge: 30,
      retirementAge: 58,
      inflationRate: 5.0,
    });

    expect(result.purchasingPowerCorpus).toBeLessThan(result.maturityCorpus);
    expect(result.purchasingPowerCorpus).toBeGreaterThan(0);
  });

  it('10. handles zero basic salary edge case cleanly', () => {
    const result = calculateVpfCalculator({
      monthlyBasicSalary: 0,
      vpfPercent: 10,
    });

    expect(result.monthlyBasicSalary).toBe(0);
    expect(result.maturityCorpus).toBe(0);
    expect(result.totalEmployeeContribution).toBe(0);
    expect(Number.isNaN(result.maturityCorpus)).toBe(false);
    expect(result.heroText).toContain('Please enter a valid monthly basic salary');
  });

  it('11. handles negative basic salary input sanitization', () => {
    const result = calculateVpfCalculator({
      monthlyBasicSalary: -50000,
    });

    expect(result.monthlyBasicSalary).toBe(0);
    expect(result.maturityCorpus).toBe(0);
  });

  it('12. handles custom historical interest rate overrides', () => {
    const historical = calculateVpfCalculator({
      monthlyBasicSalary: 50000,
      rate: 8.15, // Historical EPFO rate
    });

    expect(historical.rate).toBe(8.15);
    expect(historical.maturityCorpus).toBeGreaterThan(0);
  });

  it('13. computes scenario matrix comparison outputs', () => {
    const result = calculateVpfCalculator({
      monthlyBasicSalary: 50000,
      epfPercent: 12,
      vpfPercent: 10,
    });

    expect(result.scenarios.length).toBe(4);
    expect(result.scenarios[0].vpfPercent).toBe(10);
    expect(result.scenarios[1].vpfPercent).toBe(10);
    expect(result.scenarios[2].vpfPercent).toBe(30);
    expect(result.scenarios[3].vpfPercent).toBe(0);
  });

  it('14. handles USD currency mode formatting', () => {
    const result = calculateVpfCalculator({
      monthlyBasicSalary: 5000,
      currency: 'USD',
    });

    expect(result.currency).toBe('USD');
    expect(result.heroText).toContain('$5,000');
  });

  it('15. verifies retirement age boundary edge case (Age 55 vs Age 60)', () => {
    const result55 = calculateVpfCalculator({
      monthlyBasicSalary: 50000,
      currentAge: 30,
      retirementAge: 55,
    });

    const result60 = calculateVpfCalculator({
      monthlyBasicSalary: 50000,
      currentAge: 30,
      retirementAge: 60,
    });

    expect(result55.tenureYears).toBe(25);
    expect(result60.tenureYears).toBe(30);
    expect(result60.maturityCorpus).toBeGreaterThan(result55.maturityCorpus);
  });
});
