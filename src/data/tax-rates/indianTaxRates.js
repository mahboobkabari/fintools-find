/**
 * Indian Income Tax & Statutory Payroll Reference Data
 * Financial Year: FY 2025-26 (Assessment Year AY 2026-27)
 * Authoritative Basis: Union Budget 2024 Amendments & CBDT Guidelines
 */

export const INDIAN_TAX_RATES_FY2025_26 = {
  financialYear: 'FY 2025-26',
  assessmentYear: 'AY 2026-27',
  effectiveDate: '2025-04-01',
  lawReference: 'Income Tax Act, 1961 (Budget 2024 Amendment)',

  newRegime: {
    name: 'New Tax Regime (Section 115BAC)',
    standardDeduction: 75000,
    rebate87aMaxIncome: 700000,
    rebate87aMaxAmount: 25000,
    hasMarginalRelief: true,
    slabs: [
      { min: 0, max: 300000, rate: 0, label: 'Up to ₹3,00,000' },
      { min: 300000, max: 700000, rate: 0.05, label: '₹3,00,001 to ₹7,00,000' },
      { min: 700000, max: 1000000, rate: 0.10, label: '₹7,00,001 to ₹10,00,000' },
      { min: 1000000, max: 1200000, rate: 0.15, label: '₹10,00,001 to ₹12,00,000' },
      { min: 1200000, max: 1500000, rate: 0.20, label: '₹12,00,001 to ₹15,00,000' },
      { min: 1500000, max: Infinity, rate: 0.30, label: 'Above ₹15,00,000' },
    ],
  },

  oldRegime: {
    name: 'Old Tax Regime',
    standardDeduction: 50000,
    rebate87aMaxIncome: 500000,
    rebate87aMaxAmount: 12500,
    hasMarginalRelief: false,
    slabs: [
      { min: 0, max: 250000, rate: 0, label: 'Up to ₹2,50,000' },
      { min: 250000, max: 500000, rate: 0.05, label: '₹2,50,001 to ₹5,00,000' },
      { min: 500000, max: 1000000, rate: 0.20, label: '₹5,00,001 to ₹10,00,000' },
      { min: 1000000, max: Infinity, rate: 0.30, label: 'Above ₹10,00,000' },
    ],
    deductionLimits: {
      sec80c: 150000,
      sec24b: 200000,
      sec80d: 75000,
      sec80ccd1b: 50000,
    },
  },

  cessRate: 0.04, // 4% Health & Education Cess

  statutory: {
    defaultEpfPercent: 12, // 12% of basic
    defaultProfessionalTax: 2400, // Annual PT
    gratuityPercent: 4.81, // ~4.81% of basic (15/26 days per year)
  },

  hraRules: {
    section: 'Section 10(13A)',
    rule: 'Rule 2A',
    metroPercent: 0.50,
    nonMetroPercent: 0.40,
    rentThresholdPercent: 0.10,
    metroCities: ['Delhi', 'Mumbai', 'Kolkata', 'Chennai'],
    panThresholdAnnualRent: 100000, // ₹1,00,000/year requires landlord PAN
  },
};
