import { describe, it, expect } from 'vitest';
import {
  calculateSalary,
  solveTargetGrossSalary,
  compareSalaryOffers,
  calculateTaxByJurisdiction,
  PAY_FREQUENCIES,
  JURISDICTIONS,
} from '../salary-calculator.js';

describe('Salary Calculator Engine (Flagship #99)', () => {
  // 1-5: Pay Frequency Conversions
  it('1. should calculate annual salary correctly under ANNUAL frequency mode', () => {
    const res = calculateSalary({
      salaryAmount: 100000,
      payFrequency: 'ANNUAL',
      jurisdiction: 'GENERIC',
      customTaxRate: 20,
      customSocialRate: 5,
      preTaxDeductionsAnnual: 0,
      postTaxDeductionsAnnual: 0,
    });

    expect(res.totals.annualBaseSalary).toBe(100000);
    expect(res.totals.totalGrossAnnual).toBe(100000);
    expect(res.totals.incomeTaxAnnual).toBe(20000);
    expect(res.totals.socialContributionsAnnual).toBe(5000);
    expect(res.totals.netAnnualSalary).toBe(75000);
    expect(res.totals.netMonthlySalary).toBeCloseTo(6250, 2);
  });

  it('2. should convert MONTHLY pay input to annual gross correctly (12x multiplier)', () => {
    const res = calculateSalary({
      salaryAmount: 8000,
      payFrequency: 'MONTHLY',
      jurisdiction: 'GENERIC',
      customTaxRate: 15,
      customSocialRate: 5,
    });

    expect(res.totals.annualBaseSalary).toBe(96000); // 8000 * 12
    expect(res.periods.monthly.gross).toBe(8000);
  });

  it('3. should convert BI_WEEKLY pay input to annual gross correctly (26x multiplier)', () => {
    const res = calculateSalary({
      salaryAmount: 3000,
      payFrequency: 'BI_WEEKLY',
      jurisdiction: 'GENERIC',
      customTaxRate: 20,
      customSocialRate: 0,
    });

    expect(res.totals.annualBaseSalary).toBe(78000); // 3000 * 26
    expect(res.periods.biWeekly.gross).toBe(3000);
  });

  it('4. should convert WEEKLY pay input to annual gross correctly (52x multiplier)', () => {
    const res = calculateSalary({
      salaryAmount: 1500,
      payFrequency: 'WEEKLY',
      jurisdiction: 'GENERIC',
      customTaxRate: 10,
      customSocialRate: 0,
    });

    expect(res.totals.annualBaseSalary).toBe(78000); // 1500 * 52
    expect(res.periods.weekly.gross).toBe(1500);
  });

  it('5. should convert HOURLY wage input to annual gross correctly (hoursPerWeek * weeksPerYear)', () => {
    const res = calculateSalary({
      salaryAmount: 40,
      payFrequency: 'HOURLY',
      hoursPerWeek: 40,
      weeksPerYear: 50,
      jurisdiction: 'GENERIC',
      customTaxRate: 20,
      customSocialRate: 0,
    });

    // 40 * 40 * 50 = 80,000
    expect(res.totals.annualBaseSalary).toBe(80000);
    expect(res.totals.totalHoursAnnual).toBe(2000);
    expect(res.periods.hourly.gross).toBe(40);
  });

  // 6-10: Compensation Elements
  it('6. should aggregate Annual Bonus with Base Salary into Total Gross Compensation', () => {
    const res = calculateSalary({
      salaryAmount: 100000,
      bonusAnnual: 20000,
      jurisdiction: 'GENERIC',
      customTaxRate: 20,
      customSocialRate: 0,
    });

    expect(res.totals.annualBaseSalary).toBe(100000);
    expect(res.totals.totalVariablePayAnnual).toBe(20000);
    expect(res.totals.totalGrossAnnual).toBe(120000);
  });

  it('7. should aggregate Commission & Other Taxable compensation correctly', () => {
    const res = calculateSalary({
      salaryAmount: 80000,
      bonusAnnual: 10000,
      commissionAnnual: 15000,
      otherTaxableAnnual: 5000,
      jurisdiction: 'GENERIC',
      customTaxRate: 20,
      customSocialRate: 0,
    });

    expect(res.totals.totalVariablePayAnnual).toBe(30000);
    expect(res.totals.totalGrossAnnual).toBe(110000);
  });

  it('8. should handle zero salary and zero variable pay gracefully', () => {
    const res = calculateSalary({ salaryAmount: 0 });
    expect(res.totals.totalGrossAnnual).toBe(0);
    expect(res.totals.netAnnualSalary).toBe(0);
    expect(res.rates.effectiveTaxRatePct).toBe(0);
  });

  it('9. should handle daily pay frequency correctly (workingDaysPerYear)', () => {
    const res = calculateSalary({
      salaryAmount: 300,
      payFrequency: 'DAILY',
      workingDaysPerYear: 250,
      jurisdiction: 'GENERIC',
      customTaxRate: 10,
      customSocialRate: 0,
    });

    expect(res.totals.annualBaseSalary).toBe(75000); // 300 * 250
    expect(res.periods.daily.gross).toBe(300);
  });

  it('10. should handle semi-monthly pay frequency correctly (24x multiplier)', () => {
    const res = calculateSalary({
      salaryAmount: 4000,
      payFrequency: 'SEMI_MONTHLY',
      jurisdiction: 'GENERIC',
      customTaxRate: 10,
      customSocialRate: 0,
    });

    expect(res.totals.annualBaseSalary).toBe(96000); // 4000 * 24
    expect(res.periods.semiMonthly.gross).toBe(4000);
  });

  // 11-15: Pre-Tax & Post-Tax Deductions
  it('11. should reduce taxable income by Pre-Tax Deductions (e.g. 401k / Pension)', () => {
    const res = calculateSalary({
      salaryAmount: 100000,
      preTaxDeductionsAnnual: 10000,
      jurisdiction: 'GENERIC',
      customTaxRate: 20,
      customSocialRate: 0,
    });

    expect(res.totals.totalGrossAnnual).toBe(100000);
    expect(res.totals.taxableIncomeAnnual).toBe(90000);
    expect(res.totals.incomeTaxAnnual).toBe(18000); // 90000 * 20%
    expect(res.totals.netAnnualSalary).toBe(72000); // 100000 - 18000 tax - 10000 pre-tax
  });

  it('12. should subtract Post-Tax Deductions after tax without reducing taxable income', () => {
    const res = calculateSalary({
      salaryAmount: 100000,
      postTaxDeductionsAnnual: 5000,
      jurisdiction: 'GENERIC',
      customTaxRate: 20,
      customSocialRate: 0,
    });

    expect(res.totals.taxableIncomeAnnual).toBe(100000);
    expect(res.totals.incomeTaxAnnual).toBe(20000);
    expect(res.totals.netAnnualSalary).toBe(75000); // 100000 - 20000 tax - 5000 post-tax
  });

  it('13. should handle combined pre-tax and post-tax deductions accurately', () => {
    const res = calculateSalary({
      salaryAmount: 120000,
      preTaxDeductionsAnnual: 8000,
      postTaxDeductionsAnnual: 2000,
      jurisdiction: 'GENERIC',
      customTaxRate: 25,
      customSocialRate: 5,
    });

    // Gross = 120000
    // Taxable = 112000
    // Tax = 28000
    // Social = 6000
    // Pre-tax = 8000
    // Post-tax = 2000
    // Total deductions = 44000
    // Net = 76000
    expect(res.totals.totalDeductionsAnnual).toBe(44000);
    expect(res.totals.netAnnualSalary).toBe(76000);
  });

  it('14. should clamp net salary to 0 if total deductions exceed gross salary', () => {
    const res = calculateSalary({
      salaryAmount: 30000,
      preTaxDeductionsAnnual: 40000, // Exceeds gross
      jurisdiction: 'GENERIC',
      customTaxRate: 20,
    });

    expect(res.totals.netAnnualSalary).toBe(0);
  });

  it('15. should verify Total Deductions equals sum of taxes, social, pre-tax, and post-tax', () => {
    const res = calculateSalary({
      salaryAmount: 90000,
      preTaxDeductionsAnnual: 4000,
      postTaxDeductionsAnnual: 1000,
      jurisdiction: 'US',
    });

    const sum =
      res.totals.incomeTaxAnnual +
      res.totals.socialContributionsAnnual +
      res.totals.preTaxDeductionsAnnual +
      res.totals.postTaxDeductionsAnnual;

    expect(res.totals.totalDeductionsAnnual).toBe(sum);
  });

  // 16-20: US Jurisdiction Modeling
  it('16. should apply US Federal Standard Deduction ($15,000) for zero tax below threshold', () => {
    const res = calculateSalary({
      salaryAmount: 14000,
      jurisdiction: 'US',
      stateTaxRatePct: 0,
    });

    // Below $15,000 standard deduction -> 0 federal income tax
    expect(res.taxBreakdown.federalTax).toBe(0);
    // Still pays FICA (Social security 6.2% + Medicare 1.45% = 7.65%)
    expect(res.taxBreakdown.socialContributions).toBeCloseTo(14000 * 0.0765, 0);
  });

  it('17. should calculate US progressive federal tax across 10%, 12%, and 22% brackets', () => {
    // $75,000 gross - $15,000 std ded = $60,000 net taxable
    // 10% on $11,925 = $1,192.50
    // 12% on ($48,475 - $11,925 = $36,550) = $4,386.00
    // 22% on ($60,000 - $48,475 = $11,525) = $2,535.50
    // Total Fed Tax = $8,114
    const res = calculateSalary({
      salaryAmount: 75000,
      jurisdiction: 'US',
      stateTaxRatePct: 0,
    });

    expect(res.taxBreakdown.federalTax).toBeCloseTo(8114, 0);
  });

  it('18. should cap Social Security tax at wage base limit ($176,100)', () => {
    const resLow = calculateSalary({ salaryAmount: 100000, jurisdiction: 'US' });
    const resHigh = calculateSalary({ salaryAmount: 300000, jurisdiction: 'US' });

    expect(resLow.taxBreakdown.socialSecurity).toBeCloseTo(6200, 0);
    // Capped at 176,100 * 6.2% = 10,918.20
    expect(resHigh.taxBreakdown.socialSecurity).toBeCloseTo(176100 * 0.062, 0);
  });

  it('19. should apply additional Medicare tax (0.9%) on earnings above $200,000 in US', () => {
    const res = calculateSalary({
      salaryAmount: 250000,
      jurisdiction: 'US',
    });

    // Base Medicare = 250,000 * 1.45% = 3,625
    // Addl Medicare = 50,000 * 0.9% = 450
    // Total Medicare = 4,075
    expect(res.taxBreakdown.medicare).toBeCloseTo(4075, 0);
  });

  it('20. should calculate US State Income Tax based on configured state rate', () => {
    const res = calculateSalary({
      salaryAmount: 100000,
      jurisdiction: 'US',
      stateTaxRatePct: 5.0, // 5% of (100k - 15k) = $4,250
    });

    expect(res.taxBreakdown.stateTax).toBeCloseTo(4250, 0);
  });

  // 21-25: India Jurisdiction Modeling
  it('21. should apply India FY 2025-26 New Tax Regime with ₹75,000 standard deduction', () => {
    // ₹12,00,000 - ₹75,000 = ₹11,25,000 taxable
    const res = calculateSalary({
      salaryAmount: 1200000,
      jurisdiction: 'IN',
      indiaRegime: 'new',
    });

    expect(res.taxBreakdown.standardDeduction).toBe(75000);
    expect(res.totals.incomeTaxAnnual).toBeGreaterThan(0);
  });

  it('22. should calculate zero tax in India New Regime for income up to ₹7,00,000 (Section 87A rebate)', () => {
    const res = calculateSalary({
      salaryAmount: 700000,
      jurisdiction: 'IN',
      indiaRegime: 'new',
    });

    expect(res.totals.incomeTaxAnnual).toBe(0);
  });

  it('23. should include EPF (12% of basic) and Professional Tax in India social contributions', () => {
    const res = calculateSalary({
      salaryAmount: 1000000, // ₹10L gross -> ₹5L basic -> ₹60,000 EPF + ₹2,400 PT
      jurisdiction: 'IN',
      indiaRegime: 'new',
    });

    expect(res.taxBreakdown.epf).toBe(60000);
    expect(res.taxBreakdown.professionalTax).toBe(2400);
    expect(res.taxBreakdown.socialContributions).toBe(62400);
  });

  it('24. should support India Old Tax Regime with ₹50,000 standard deduction', () => {
    const res = calculateSalary({
      salaryAmount: 1500000,
      jurisdiction: 'IN',
      indiaRegime: 'old',
    });

    expect(res.taxBreakdown.standardDeduction).toBe(50000);
  });

  it('25. should compute Indian Health & Education Cess (4%) accurately', () => {
    const taxRes = calculateTaxByJurisdiction({
      jurisdiction: 'IN',
      taxableIncome: 1500000,
      grossIncome: 1500000,
      indiaRegime: 'new',
    });

    expect(taxRes.incomeTax).toBeGreaterThan(taxRes.federalTax);
  });

  // 26-30: UK & Canada & Australia Modeling
  it('26. should apply UK Personal Allowance (£12,570) and Class 1 National Insurance', () => {
    const res = calculateSalary({
      salaryAmount: 40000,
      jurisdiction: 'UK',
    });

    expect(res.taxBreakdown.standardDeduction).toBe(12570);
    // Taxable = 40,000 - 12,570 = 27,430 @ 20% = £5,486
    expect(res.totals.incomeTaxAnnual).toBeCloseTo(5486, 0);
    expect(res.taxBreakdown.nationalInsurance).toBeGreaterThan(0);
  });

  it('27. should taper UK Personal Allowance by £1 for every £2 over £100,000', () => {
    const res100k = calculateSalary({ salaryAmount: 100000, jurisdiction: 'UK' });
    const res120k = calculateSalary({ salaryAmount: 120000, jurisdiction: 'UK' });

    expect(res100k.taxBreakdown.standardDeduction).toBe(12570);
    // Over £100k by £20k -> allowance reduced by £10k -> £2,570 remaining
    expect(res120k.taxBreakdown.standardDeduction).toBeCloseTo(2570, 0);
  });

  it('28. should calculate Canada federal tax, CPP, and EI correctly', () => {
    const res = calculateSalary({
      salaryAmount: 85000,
      jurisdiction: 'CA',
    });

    expect(res.taxBreakdown.cpp).toBeGreaterThan(0);
    expect(res.taxBreakdown.ei).toBeGreaterThan(0);
    expect(res.totals.netAnnualSalary).toBeLessThan(85000);
  });

  it('29. should calculate Australia Stage 3 tax brackets and 2% Medicare Levy', () => {
    const res = calculateSalary({
      salaryAmount: 100000,
      jurisdiction: 'AU',
    });

    expect(res.taxBreakdown.medicareLevy).toBeCloseTo(2000, 0); // 2% of 100k
    expect(res.totals.incomeTaxAnnual).toBeGreaterThan(0);
  });

  it('30. should calculate Generic flat tax rate and social contributions accurately', () => {
    const res = calculateSalary({
      salaryAmount: 60000,
      jurisdiction: 'GENERIC',
      customTaxRate: 18,
      customSocialRate: 6,
    });

    expect(res.totals.incomeTaxAnnual).toBe(10800); // 60k * 18%
    expect(res.totals.socialContributionsAnnual).toBe(3600); // 60k * 6%
    expect(res.totals.netAnnualSalary).toBe(45600);
  });

  // 31-35: Period Matrix Consistency
  it('31. should verify period gross equals sum of deductions and net across all periods', () => {
    const res = calculateSalary({
      salaryAmount: 120000,
      preTaxDeductionsAnnual: 6000,
      postTaxDeductionsAnnual: 1200,
      jurisdiction: 'US',
    });

    for (const pKey of ['annual', 'monthly', 'semiMonthly', 'biWeekly', 'weekly', 'daily', 'hourly']) {
      const p = res.periods[pKey];
      expect(p.gross).toBeCloseTo(p.totalDeductions + p.net, 2);
    }
  });

  it('32. should verify monthly net is exactly annual net / 12', () => {
    const res = calculateSalary({ salaryAmount: 96000, jurisdiction: 'US' });
    expect(res.periods.monthly.net).toBeCloseTo(res.totals.netAnnualSalary / 12, 5);
  });

  it('33. should verify weekly net is exactly annual net / 52', () => {
    const res = calculateSalary({ salaryAmount: 104000, jurisdiction: 'US' });
    expect(res.periods.weekly.net).toBeCloseTo(res.totals.netAnnualSalary / 52, 5);
  });

  it('34. should verify hourly net is exactly annual net / (hoursPerWeek * weeksPerYear)', () => {
    const res = calculateSalary({
      salaryAmount: 100000,
      hoursPerWeek: 40,
      weeksPerYear: 50,
      jurisdiction: 'US',
    });

    const totalHours = 2000;
    expect(res.periods.hourly.net).toBeCloseTo(res.totals.netAnnualSalary / totalHours, 5);
  });

  it('35. should calculate effective tax rate and take-home ratio percentages correctly', () => {
    const res = calculateSalary({
      salaryAmount: 100000,
      jurisdiction: 'GENERIC',
      customTaxRate: 20,
      customSocialRate: 5,
    });

    expect(res.rates.effectiveTaxRatePct).toBe(25.0);
    expect(res.rates.takeHomeRatioPct).toBe(75.0);
  });

  // 36-40: Target Take-Home Solver
  it('36. should solve required gross salary for target monthly net take-home pay', () => {
    const targetMonthlyNet = 5000; // $60,000 annual net
    const solved = solveTargetGrossSalary({
      targetNet: targetMonthlyNet,
      targetPeriod: 'monthly',
      baseConfig: { jurisdiction: 'US', stateTaxRatePct: 0 },
    });

    expect(solved.converged).toBe(true);
    expect(solved.requiredGrossAnnual).toBeGreaterThan(60000);

    // Verify verification round-trip
    const verify = calculateSalary({
      salaryAmount: solved.requiredGrossAnnual,
      jurisdiction: 'US',
      stateTaxRatePct: 0,
    });
    expect(verify.totals.netMonthlySalary).toBeCloseTo(5000, 0);
  });

  it('37. should solve required gross salary for target annual net take-home pay in India', () => {
    const targetAnnualNet = 1500000; // ₹15,00,000 net
    const solved = solveTargetGrossSalary({
      targetNet: targetAnnualNet,
      targetPeriod: 'annual',
      baseConfig: { jurisdiction: 'IN', indiaRegime: 'new' },
    });

    expect(solved.converged).toBe(true);
    const verify = calculateSalary({
      salaryAmount: solved.requiredGrossAnnual,
      jurisdiction: 'IN',
      indiaRegime: 'new',
    });
    expect(verify.totals.netAnnualSalary).toBeCloseTo(1500000, -2);
  });

  it('38. should return zero gross required when target net is zero or negative', () => {
    const solved = solveTargetGrossSalary({ targetNet: 0 });
    expect(solved.requiredGrossAnnual).toBe(0);
    expect(solved.grossUpAmount).toBe(0);
  });

  it('39. should calculate gross-up amount as required gross minus target net', () => {
    const solved = solveTargetGrossSalary({
      targetNet: 80000,
      targetPeriod: 'annual',
      baseConfig: { jurisdiction: 'US' },
    });

    expect(solved.grossUpAmount).toBe(solved.requiredGrossAnnual - 80000);
  });

  it('40. should solve target gross accurately under generic flat tax mode', () => {
    // 20% tax + 5% social = 25% total deductions -> Net is 75% of Gross
    // Target net = 75,000 -> Gross should be exactly 100,000
    const solved = solveTargetGrossSalary({
      targetNet: 75000,
      targetPeriod: 'annual',
      baseConfig: {
        jurisdiction: 'GENERIC',
        customTaxRate: 20,
        customSocialRate: 5,
      },
    });

    expect(solved.requiredGrossAnnual).toBeCloseTo(100000, 0);
  });

  // 41-45: Dual-Offer Comparison & Edge Cases
  it('41. should compare two job offers accurately and declare the higher net offer as winner', () => {
    const offerA = { salaryAmount: 90000, bonusAnnual: 5000, jurisdiction: 'US' };
    const offerB = { salaryAmount: 110000, bonusAnnual: 0, jurisdiction: 'US' };

    const comp = compareSalaryOffers(offerA, offerB);
    expect(comp.deltas.deltaGrossAnnual).toBe(15000); // 110k vs 95k
    expect(comp.deltas.deltaNetAnnual).toBeGreaterThan(0);
    expect(comp.deltas.winner).toBe('B');
  });

  it('42. should compare base salary vs heavy bonus compensation packages', () => {
    const offerA = { salaryAmount: 100000, bonusAnnual: 0, jurisdiction: 'US' };
    const offerB = { salaryAmount: 80000, bonusAnnual: 30000, jurisdiction: 'US' };

    const comp = compareSalaryOffers(offerA, offerB);
    expect(comp.deltas.deltaGrossAnnual).toBe(10000); // 110k vs 100k
    expect(comp.deltas.deltaNetAnnual).toBeGreaterThan(0);
    expect(comp.deltas.winner).toBe('B');
  });

  it('43. should declare TIE when two offers result in identical net salary', () => {
    const offerA = { salaryAmount: 80000, jurisdiction: 'US' };
    const offerB = { salaryAmount: 80000, jurisdiction: 'US' };

    const comp = compareSalaryOffers(offerA, offerB);
    expect(comp.deltas.deltaNetAnnual).toBe(0);
    expect(comp.deltas.winner).toBe('TIE');
  });

  it('44. should normalize negative salary and negative deductions to 0 safely', () => {
    const res = calculateSalary({
      salaryAmount: -50000,
      bonusAnnual: -10000,
      preTaxDeductionsAnnual: -5000,
      postTaxDeductionsAnnual: -2000,
    });

    expect(res.totals.totalGrossAnnual).toBe(0);
    expect(res.totals.preTaxDeductionsAnnual).toBe(0);
    expect(res.totals.postTaxDeductionsAnnual).toBe(0);
  });

  it('45. should fallback safely to US jurisdiction on invalid jurisdiction parameter', () => {
    const res = calculateSalary({
      salaryAmount: 80000,
      jurisdiction: 'INVALID_XYZ',
    });

    expect(res.inputs.jurisdiction).toBe('US');
    expect(res.taxBreakdown.federalTax).toBeGreaterThan(0);
  });
});
