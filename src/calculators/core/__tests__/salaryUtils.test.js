import { describe, it, expect } from 'vitest';
import {
  calculateGrossSalary,
  calculateNetSalary,
  calculateMonthlySalary,
  calculateEmployerContribution,
  calculateEmployeeContribution,
  calculateProfessionalTax,
  calculateStandardDeduction,
  computeTaxFromSlabs,
  calculateIncomeTaxForRegime,
} from '../salaryUtils.js';
import { INDIAN_TAX_RATES_FY2025_26 } from '../../../data/tax-rates/indianTaxRates.js';

describe('Salary Mathematics Core Utilities', () => {
  it('calculateGrossSalary deducts employer contributions accurately', () => {
    const gross = calculateGrossSalary({
      ctc: 1200000,
      employerEpf: 72000,
      employerGratuity: 28860,
      employerOther: 10000,
    });
    expect(gross).toBe(1089140);
  });

  it('calculateNetSalary calculates annual take-home correctly', () => {
    const net = calculateNetSalary(1200000, 145900);
    expect(net).toBe(1054100);
  });

  it('calculateMonthlySalary rounds to monthly integer', () => {
    expect(calculateMonthlySalary(1200000)).toBe(100000);
    expect(calculateMonthlySalary(1054100)).toBe(87842);
  });

  it('calculateEmployerContribution computes EPF and Gratuity', () => {
    const res = calculateEmployerContribution({
      basicSalary: 600000,
      epfPercent: 12,
      includeGratuity: true,
      gratuityPercent: 4.81,
    });
    expect(res.employerEpf).toBe(72000);
    expect(res.employerGratuity).toBe(28860);
    expect(res.totalEmployerContribution).toBe(100860);
  });

  it('calculateEmployeeContribution computes mandatory EPF and VPF', () => {
    const res = calculateEmployeeContribution({
      basicSalary: 600000,
      epfPercent: 12,
      vpfPercent: 5,
    });
    expect(res.employeeEpf).toBe(72000);
    expect(res.employeeVpf).toBe(30000);
    expect(res.totalEmployeePf).toBe(102000);
  });

  it('calculateProfessionalTax handles income tiers and standard defaults', () => {
    expect(calculateProfessionalTax(10000)).toBe(0);
    expect(calculateProfessionalTax(50000)).toBe(2400);
    expect(calculateProfessionalTax(100000, 2400)).toBe(2400);
  });

  it('calculateStandardDeduction returns FY 2025-26 values', () => {
    expect(calculateStandardDeduction('new', true)).toBe(75000);
    expect(calculateStandardDeduction('old', true)).toBe(50000);
    expect(calculateStandardDeduction('new', false)).toBe(0);
  });

  it('computeTaxFromSlabs calculates progressive tax slabs', () => {
    // New regime slabs: 0-3L: 0, 3L-7L: 5% (20k), 7L-10L: 10% (30k), 10L-12L: 15% (30k) -> Total for 11.25L taxable = 20k + 30k + 21.25k = 71.25k (71,250)
    const slabs = INDIAN_TAX_RATES_FY2025_26.newRegime.slabs;
    const rawTax = computeTaxFromSlabs(1125000, slabs);
    expect(rawTax).toBe(68750);
  });

  it('calculateIncomeTaxForRegime computes New Regime Sec 87A rebate for ₹7.5L CTC', () => {
    // 7.5L CTC - 75k std ded = 6.75L taxable income <= 7L threshold -> 87A rebate brings base tax to 0
    const res = calculateIncomeTaxForRegime({
      taxableIncome: 675000,
      regime: 'new',
    });
    expect(res.taxableIncome).toBe(675000);
    expect(res.rebate87a).toBeGreaterThan(0);
    expect(res.totalIncomeTax).toBe(0);
  });

  it('calculateIncomeTaxForRegime computes New Regime marginal relief for taxable income ₹7.1L', () => {
    // Taxable income 7.10L is > 7L by 10,000. Raw tax is 20,000 + 1,000 = 21,000. Marginal relief = 21k - 10k = 11,000 -> Tax = 10,000 + 4% cess = 10,400.
    const res = calculateIncomeTaxForRegime({
      taxableIncome: 710000,
      regime: 'new',
    });
    expect(res.marginalRelief).toBe(11000);
    expect(res.baseTaxAfterRebate).toBe(10000);
    expect(res.totalIncomeTax).toBe(10400);
  });
});
