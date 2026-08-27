/**
 * Configuration module for CTC to Take-Home Salary Breakdown Calculator
 */

export const CTC_CONFIG = {
  meta: {
    title: 'CTC to Take-Home Salary Breakdown Calculator',
    description: 'Decompose Annual Cost to Company (CTC) package into Basic Salary, HRA, employer retainers, employee statutory deductions, income tax, and net monthly take-home salary.',
    category: 'salary',
    categoryName: 'Salary & Personal Income Calculators',
    slug: 'ctc-calculator',
  },

  defaultInputs: {
    annualCtc: 1200000,
    basicSalaryPercent: 50,
    isMetro: true,
    rentPaidMonthly: 20000,
    performanceBonusAnnual: 0,
    employerEpfIncluded: true,
    includeGratuity: true,
    employerNps: 0,
    professionalTax: 2500,
    otherDeductionsOld: 150000,
    taxRegime: 'new',
  },

  fieldBoundaries: {
    annualCtc: { min: 100000, max: 100000000, step: 50000 },
    basicSalaryPercent: { min: 40, max: 60, step: 5 },
    rentPaidMonthly: { min: 0, max: 500000, step: 1000 },
    performanceBonusAnnual: { min: 0, max: 10000000, step: 10000 },
  },

  disclaimers: {
    educationalNotice: 'This calculator provides an illustrative breakdown of Cost to Company (CTC) packages based on standard Indian payroll structures. Actual payslip values depend on your employer offer letter, corporate benefit allowances, and HR policy agreements.',
    regimeNotice: 'Tax calculations reflect FY 2025-26 (AY 2026-27) Income Tax Act slabs. Under the New Tax Regime (Section 115BAC), Chapter VI-A deductions including HRA exemption are not available.',
  },

  scenarios: {
    entryLevel: {
      title: 'Entry-Level Graduate (₹6 LPA CTC)',
      description: 'Standard entry-level corporate salary package with 50% Basic and standard EPF retentions.',
      annualCtc: 600000,
      basicSalaryPercent: 50,
      isMetro: true,
      rentPaidMonthly: 12000,
      performanceBonusAnnual: 0,
      employerEpfIncluded: true,
      includeGratuity: true,
      taxRegime: 'new',
    },
    midCareer: {
      title: 'Mid-Career Corporate (₹18 LPA CTC)',
      description: 'Mid-level management package evaluating HRA exemption tax savings under Old vs New Tax Regime.',
      annualCtc: 1800000,
      basicSalaryPercent: 50,
      isMetro: true,
      rentPaidMonthly: 25000,
      performanceBonusAnnual: 100000,
      employerEpfIncluded: true,
      includeGratuity: true,
      taxRegime: 'new',
    },
    seniorExecutive: {
      title: 'Senior Executive (₹45 LPA CTC)',
      description: 'Senior leadership package evaluating high CTC tax slabs, EPF caps, and net monthly cash flow.',
      annualCtc: 4500000,
      basicSalaryPercent: 50,
      isMetro: true,
      rentPaidMonthly: 40000,
      performanceBonusAnnual: 500000,
      employerEpfIncluded: true,
      includeGratuity: true,
      taxRegime: 'new',
    },
    highBonus: {
      title: 'High Variable Pay Package (₹30L + ₹5L Bonus)',
      description: 'Package with significant performance bonus retained annually separate from fixed monthly salary.',
      annualCtc: 3500000,
      basicSalaryPercent: 50,
      isMetro: true,
      rentPaidMonthly: 30000,
      performanceBonusAnnual: 500000,
      employerEpfIncluded: true,
      includeGratuity: true,
      taxRegime: 'new',
    },
  },
};
