/**
 * Shared Payroll & Salary Mathematics Utility Engine
 * Pure mathematical functions for gross salary, statutory contributions,
 * tax slab computation, and salary breakdown structure.
 *
 * Reusable across Take-Home Salary, HRA, CTC, In-Hand, PF, and Gratuity calculators.
 */

import { INDIAN_TAX_RATES_FY2025_26 } from '../../data/tax-rates/indianTaxRates.js';

/**
 * Calculates Gross Salary by deducting employer-side contributions from total annual CTC.
 *
 * @param {Object} params
 * @param {number} params.ctc - Total annual Cost to Company (₹)
 * @param {number} [params.employerEpf=0] - Employer EPF contribution (₹)
 * @param {number} [params.employerGratuity=0] - Employer Gratuity provision (₹)
 * @param {number} [params.employerOther=0] - Other employer perks/insurance in CTC (₹)
 * @returns {number} Gross Annual Salary (₹)
 */
export function calculateGrossSalary({ ctc = 0, employerEpf = 0, employerGratuity = 0, employerOther = 0 } = {}) {
  const numCtc = Math.max(0, Number(ctc) || 0);
  const epf = Math.max(0, Number(employerEpf) || 0);
  const grat = Math.max(0, Number(employerGratuity) || 0);
  const other = Math.max(0, Number(employerOther) || 0);

  const employerTotal = epf + grat + other;
  return Math.max(0, Math.round(numCtc - employerTotal));
}

/**
 * Calculates Net Take-Home Salary after all deductions.
 *
 * @param {number} grossSalary - Gross annual salary (₹)
 * @param {number} totalDeductions - Total annual employee deductions (₹)
 * @returns {number} Net Annual Take-Home (₹)
 */
export function calculateNetSalary(grossSalary = 0, totalDeductions = 0) {
  const gross = Math.max(0, Number(grossSalary) || 0);
  const ded = Math.max(0, Number(totalDeductions) || 0);
  return Math.max(0, Math.round(gross - ded));
}

/**
 * Converts an annual figure into rounded monthly value.
 *
 * @param {number} annualAmount - Annual amount (₹)
 * @returns {number} Monthly equivalent (₹)
 */
export function calculateMonthlySalary(annualAmount = 0) {
  const annual = Number(annualAmount) || 0;
  return Math.round(annual / 12);
}

/**
 * Calculates Employer statutory contributions (EPF, Gratuity, Health Cover).
 *
 * @param {Object} params
 * @param {number} params.basicSalary - Annual basic salary (₹)
 * @param {number} [params.epfPercent=12] - Employer EPF percentage
 * @param {boolean} [params.includeGratuity=true] - Whether gratuity is part of CTC
 * @param {number} [params.gratuityPercent=4.81] - Gratuity provision percentage
 * @param {number} [params.annualInsurance=0] - Group health insurance cost (₹)
 * @returns {{ employerEpf: number, employerGratuity: number, annualInsurance: number, totalEmployerContribution: number }}
 */
export function calculateEmployerContribution({
  basicSalary = 0,
  epfPercent = 12,
  includeGratuity = true,
  gratuityPercent = 4.81,
  annualInsurance = 0,
} = {}) {
  const basic = Math.max(0, Number(basicSalary) || 0);
  const epfPct = Math.max(0, Number(epfPercent) || 0) / 100;
  const gratPct = includeGratuity ? Math.max(0, Number(gratuityPercent) || 0) / 100 : 0;
  const ins = Math.max(0, Number(annualInsurance) || 0);

  const employerEpf = Math.round(basic * epfPct);
  const employerGratuity = Math.round(basic * gratPct);
  const totalEmployerContribution = Math.round(employerEpf + employerGratuity + ins);

  return {
    employerEpf,
    employerGratuity,
    annualInsurance: ins,
    totalEmployerContribution,
  };
}

/**
 * Calculates Employee statutory contributions (EPF + Voluntary PF).
 *
 * @param {Object} params
 * @param {number} params.basicSalary - Annual basic salary (₹)
 * @param {number} [params.epfPercent=12] - Mandatory EPF percentage (default 12%)
 * @param {number} [params.vpfPercent=0] - Voluntary PF percentage
 * @returns {{ employeeEpf: number, employeeVpf: number, totalEmployeePf: number }}
 */
export function calculateEmployeeContribution({ basicSalary = 0, epfPercent = 12, vpfPercent = 0 } = {}) {
  const basic = Math.max(0, Number(basicSalary) || 0);
  const epfPct = Math.max(0, Number(epfPercent) || 0) / 100;
  const vpfPct = Math.max(0, Number(vpfPercent) || 0) / 100;

  const employeeEpf = Math.round(basic * epfPct);
  const employeeVpf = Math.round(basic * vpfPct);
  const totalEmployeePf = Math.round(employeeEpf + employeeVpf);

  return {
    employeeEpf,
    employeeVpf,
    totalEmployeePf,
  };
}

/**
 * Calculates annual Professional Tax (PT).
 *
 * @param {number} [monthlyGross=0] - Monthly gross salary (₹)
 * @param {number} [customAnnualPt=2400] - Override annual PT (₹)
 * @returns {number} Annual Professional Tax (₹)
 */
export function calculateProfessionalTax(monthlyGross = 0, customAnnualPt = null) {
  if (customAnnualPt !== null && customAnnualPt !== undefined) {
    const customPt = Number(customAnnualPt);
    if (!isNaN(customPt) && customPt >= 0) {
      return Math.round(customPt);
    }
  }
  const gross = Math.max(0, Number(monthlyGross) || 0);
  if (gross <= 15000) {
    return 0; // Exemption for lower income tiers
  }
  return 2400; // Standard capped PT
}

/**
 * Returns Standard Deduction based on regime and salaried status.
 *
 * @param {string} [regime='new'] - 'new' or 'old'
 * @param {boolean} [isSalaried=true] - Is taxpayer a salaried employee
 * @param {Object} [taxRatesData=INDIAN_TAX_RATES_FY2025_26] - Tax constants
 * @returns {number} Standard Deduction (₹)
 */
export function calculateStandardDeduction(regime = 'new', isSalaried = true, taxRatesData = INDIAN_TAX_RATES_FY2025_26) {
  if (!isSalaried) return 0;
  if (regime === 'old') {
    return taxRatesData.oldRegime.standardDeduction;
  }
  return taxRatesData.newRegime.standardDeduction;
}

/**
 * Computes progressive tax liability from tax slab definitions.
 *
 * @param {number} taxableIncome - Taxable income after deductions (₹)
 * @param {Array<{min: number, max: number, rate: number}>} slabs - Tax slab definitions
 * @returns {number} Raw Tax (₹)
 */
export function computeTaxFromSlabs(taxableIncome = 0, slabs = []) {
  const income = Math.max(0, Number(taxableIncome) || 0);
  if (income <= 0 || !Array.isArray(slabs)) return 0;

  let tax = 0;
  for (const slab of slabs) {
    if (income > slab.min) {
      const slabTaxable = Math.min(income, slab.max) - slab.min;
      tax += slabTaxable * slab.rate;
    }
  }
  return tax;
}

/**
 * Computes complete Income Tax breakdown under specified regime (New or Old).
 * Includes Section 87A rebate, marginal relief, and 4% Health & Education Cess.
 *
 * @param {Object} params
 * @param {number} params.taxableIncome - Taxable income after deductions (₹)
 * @param {string} [params.regime='new'] - 'new' or 'old'
 * @param {Object} [params.taxRatesData=INDIAN_TAX_RATES_FY2025_26] - Tax reference constants
 * @returns {{ taxableIncome: number, rawTax: number, rebate87a: number, marginalRelief: number, baseTaxAfterRebate: number, cessAmount: number, totalIncomeTax: number }}
 */
export function calculateIncomeTaxForRegime({
  taxableIncome = 0,
  regime = 'new',
  taxRatesData = INDIAN_TAX_RATES_FY2025_26,
} = {}) {
  const income = Math.max(0, Number(taxableIncome) || 0);
  const regimeConfig = regime === 'old' ? taxRatesData.oldRegime : taxRatesData.newRegime;

  let rawTax = computeTaxFromSlabs(income, regimeConfig.slabs);
  let rebate87a = 0;
  let marginalRelief = 0;

  if (regime === 'new') {
    // New Tax Regime Sec 87A: Full rebate if taxable income <= ₹7,00,000
    if (income <= regimeConfig.rebate87aMaxIncome) {
      rebate87a = rawTax;
    } else if (regimeConfig.hasMarginalRelief) {
      // Marginal Relief: Tax payable before cess cannot exceed income over 7 Lakhs
      const excessIncome = income - regimeConfig.rebate87aMaxIncome;
      if (rawTax > excessIncome && income <= 727777) {
        marginalRelief = rawTax - excessIncome;
      }
    }
  } else {
    // Old Tax Regime Sec 87A: Full rebate up to ₹12,500 if taxable income <= ₹5,00,000
    if (income <= regimeConfig.rebate87aMaxIncome) {
      rebate87a = Math.min(rawTax, regimeConfig.rebate87aMaxAmount);
    }
  }

  const baseTaxAfterRebate = Math.max(0, rawTax - rebate87a - marginalRelief);
  const cessAmount = Math.round(baseTaxAfterRebate * taxRatesData.cessRate);
  const totalIncomeTax = Math.round(baseTaxAfterRebate + cessAmount);

  return {
    taxableIncome: Math.round(income),
    rawTax: Math.round(rawTax),
    rebate87a: Math.round(rebate87a),
    marginalRelief: Math.round(marginalRelief),
    baseTaxAfterRebate: Math.round(baseTaxAfterRebate),
    cessAmount,
    totalIncomeTax,
  };
}

/**
 * Calculates HRA Tax Exemption under Section 10(13A) & Rule 2A.
 * "Salary" for HRA calculation = Basic Salary + Dearness Allowance (DA).
 *
 * Exemption is the MINIMUM of:
 * 1. Actual HRA received
 * 2. Rent paid minus 10% of salary
 * 3. 50% of salary (Metro) OR 40% of salary (Non-Metro)
 *
 * @param {Object} params
 * @param {number} params.basicSalary - Annual Basic Salary (₹)
 * @param {number} [params.daAmount=0] - Annual Dearness Allowance (DA) (₹)
 * @param {number} params.hraReceived - Annual HRA Received from employer (₹)
 * @param {number} params.rentPaid - Annual Rent Paid (₹)
 * @param {boolean|string} [params.isMetro=true] - Metro city boolean
 * @param {Object} [params.taxRatesData=INDIAN_TAX_RATES_FY2025_26] - Reference constants
 * @returns {{
 *   hraSalary: number,
 *   actualHra: number,
 *   rentPaid: number,
 *   rentMinusTenPercent: number,
 *   salaryCap: number,
 *   limit50Pct: number,
 *   limit40Pct: number,
 *   exemptHra: number,
 *   taxableHra: number,
 *   bindingLimit: 'actual_hra' | 'rent_minus_10pct' | 'salary_cap',
 *   isMetro: boolean
 * }}
 */
export function calculateHRAExemption({
  basicSalary = 0,
  daAmount = 0,
  hraReceived = 0,
  rentPaid = 0,
  isMetro = true,
  taxRatesData = INDIAN_TAX_RATES_FY2025_26,
} = {}) {
  const numBasic = Math.max(0, Number(basicSalary) || 0);
  const numDa = Math.max(0, Number(daAmount) || 0);
  const numHra = Math.max(0, Number(hraReceived) || 0);
  const numRent = Math.max(0, Number(rentPaid) || 0);
  const metroBool = isMetro === true || isMetro === 'true' || isMetro === 'yes';

  const hraRules = taxRatesData?.hraRules || {
    metroPercent: 0.50,
    nonMetroPercent: 0.40,
    rentThresholdPercent: 0.10,
  };

  const hraSalary = numBasic + numDa;
  const actualHra = numHra;
  const rentMinusTenPercent = Math.max(0, Math.round(numRent - hraRules.rentThresholdPercent * hraSalary));

  const limit50Pct = Math.round(hraSalary * hraRules.metroPercent);
  const limit40Pct = Math.round(hraSalary * hraRules.nonMetroPercent);
  const salaryCap = metroBool ? limit50Pct : limit40Pct;

  const exemptHra = Math.min(actualHra, rentMinusTenPercent, salaryCap);
  const taxableHra = Math.max(0, actualHra - exemptHra);

  let bindingLimit = 'actual_hra';
  if (exemptHra === rentMinusTenPercent) {
    bindingLimit = 'rent_minus_10pct';
  } else if (exemptHra === salaryCap) {
    bindingLimit = 'salary_cap';
  }

  return {
    hraSalary,
    actualHra: Math.round(actualHra),
    rentPaid: Math.round(numRent),
    rentMinusTenPercent,
    salaryCap,
    limit50Pct,
    limit40Pct,
    exemptHra: Math.round(exemptHra),
    taxableHra: Math.round(taxableHra),
    bindingLimit,
    isMetro: metroBool,
  };
}
