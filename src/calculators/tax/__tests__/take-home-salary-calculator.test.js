import { describe, it, expect } from 'vitest';
import { calculateTakeHomeSalaryCalculator } from '../take-home-salary-calculator.js';

describe('Institutional Take-Home Salary Calculator Engine Tests', () => {
  it('computes monthly take-home for ₹12 Lakh CTC benchmark (FY 2025-26 New Regime)', () => {
    const res = calculateTakeHomeSalaryCalculator({
      ctc: 1200000,
      basicPercent: 50,
      professionalTax: 2400,
      regime: 'new',
    });

    expect(res.grossAnnualCtc).toBe(1200000);
    expect(res.basicSalary).toBe(600000);
    expect(res.employerEpf).toBe(72000);
    expect(res.grossAnnualSalary).toBe(1128000); // 12L - 72k
    expect(res.newRegime.standardDeduction).toBe(75000);
    expect(res.newRegime.taxableIncome).toBe(1053000); // 11.28L - 75k
    expect(res.employeeEpfAnnual).toBe(72000);
    expect(res.professionalTax).toBe(2400);
    expect(res.netMonthlyTakeHome).toBeGreaterThan(80000);
    expect(res.primaryOutput).toBe(res.netMonthlyTakeHome);
  });

  it('verifies 100% Section 87A tax rebate for ₹7.75 Lakh CTC under New Regime', () => {
    const res = calculateTakeHomeSalaryCalculator({
      ctc: 775000,
      basicPercent: 50,
      employerEpfIncluded: false, // Basic 3.875L, Gross 7.75L
      professionalTax: 2400,
      regime: 'new',
    });

    expect(res.grossAnnualSalary).toBe(775000);
    expect(res.newRegime.taxableIncome).toBe(700000); // 7.75L - 75k
    expect(res.newRegime.rebate87a).toBeGreaterThan(0);
    expect(res.newRegime.totalIncomeTax).toBe(0);
  });

  it('handles low salary tier (₹3.5 Lakh CTC) with zero income tax', () => {
    const res = calculateTakeHomeSalaryCalculator({
      ctc: 350000,
      basicPercent: 50,
      professionalTax: 2400,
    });

    expect(res.totalIncomeTax).toBe(0);
    expect(res.netMonthlyTakeHome).toBeGreaterThan(24000);
  });

  it('computes high salary tier (₹50 Lakh CTC) with 30% slab rate', () => {
    const res = calculateTakeHomeSalaryCalculator({
      ctc: 5000000,
      basicPercent: 50,
      professionalTax: 2400,
    });

    expect(res.grossAnnualCtc).toBe(5000000);
    expect(res.totalIncomeTax).toBeGreaterThan(1000000);
    expect(res.effectiveTaxPct).toBeGreaterThan(20);
    expect(res.healthScore).toBeGreaterThan(0);
  });

  it('correctly recommends Old Regime when Chapter VI-A deductions exceed threshold', () => {
    const res = calculateTakeHomeSalaryCalculator({
      ctc: 1800000,
      basicPercent: 50,
      oldRegimeDeductions: 350000, // High deductions (80C, 24b, 80D)
      regime: 'old',
    });

    expect(res.oldRegime.deductionsClaimed).toBeGreaterThan(300000);
    expect(res.recommendedRegime).toBe('old');
  });

  it('correctly compares Old vs New regime and identifies winner regime without hardcoded bias', () => {
    const res = calculateTakeHomeSalaryCalculator({
      ctc: 1500000,
      basicPercent: 50,
      oldRegimeDeductions: 50000,
    });

    expect(res.recommendedRegime).toBe('new');
    expect(res.isNewCheaper).toBe(true);
    expect(res.taxSavingsAnnual).toBeGreaterThan(0);
  });

  it('handles invalid, zero, or negative inputs gracefully without crashing', () => {
    const resZero = calculateTakeHomeSalaryCalculator({ ctc: 0, basicPercent: -10 });
    expect(resZero.grossAnnualCtc).toBe(0);
    expect(resZero.netMonthlyTakeHome).toBe(0);

    const resInvalid = calculateTakeHomeSalaryCalculator({ ctc: 'invalid', basicPercent: 'abc' });
    expect(resInvalid.grossAnnualCtc).toBe(0);
    expect(resInvalid.netMonthlyTakeHome).toBe(0);
  });

  it('generates 4 valid scenario models (+10%, +20%, Tax-Optimized)', () => {
    const res = calculateTakeHomeSalaryCalculator({ ctc: 1000000 });
    expect(res.scenarios.length).toBe(4);
    expect(res.scenarios[1].name).toBe('+10% Increment');
    expect(res.scenarios[2].name).toBe('+20% Increment');
    expect(res.scenarios[3].name).toBe('Tax-Optimized');
    expect(res.scenarios[1].monthlyTakeHome).toBeGreaterThan(res.scenarios[0].monthlyTakeHome);
  });
});