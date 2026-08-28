/**
 * Comprehensive Salary, Compensation & Take-Home Pay Engine.
 * Pure deterministic mathematical functions for gross-to-net pay conversion,
 * multi-frequency breakdowns, progressive tax modeling across major jurisdictions,
 * reverse target take-home solver, and dual-offer scenario comparisons.
 */

import { INDIAN_TAX_RATES_FY2025_26 } from '../../data/tax-rates/indianTaxRates.js';
import { calculateIncomeTaxForRegime } from '../core/salaryUtils.js';

export const PAY_FREQUENCIES = {
  ANNUAL: { id: 'ANNUAL', label: 'Per Year (Annual)', periodsPerYear: 1 },
  MONTHLY: { id: 'MONTHLY', label: 'Per Month (12x/yr)', periodsPerYear: 12 },
  SEMI_MONTHLY: { id: 'SEMI_MONTHLY', label: 'Semi-Monthly (24x/yr)', periodsPerYear: 24 },
  BI_WEEKLY: { id: 'BI_WEEKLY', label: 'Bi-Weekly (26x/yr)', periodsPerYear: 26 },
  WEEKLY: { id: 'WEEKLY', label: 'Weekly (52x/yr)', periodsPerYear: 52 },
  DAILY: { id: 'DAILY', label: 'Daily (260 days/yr)', periodsPerYear: 260 },
  HOURLY: { id: 'HOURLY', label: 'Hourly Wage', periodsPerYear: 2080 }, // default 40 hrs * 52 wks
};

export const JURISDICTIONS = {
  US: {
    id: 'US',
    name: 'United States',
    currency: 'USD',
    symbol: '$',
    description: 'Federal 2025/2026 tax brackets, FICA (Social Security & Medicare), and state tax estimates.',
  },
  IN: {
    id: 'IN',
    name: 'India',
    currency: 'INR',
    symbol: '₹',
    description: 'FY 2025-26 New & Old Tax Regimes (Union Budget 2024), Standard Deduction, 87A, EPF, & PT.',
  },
  UK: {
    id: 'UK',
    name: 'United Kingdom',
    currency: 'GBP',
    symbol: '£',
    description: '2025/2026 Personal Allowance, Basic/Higher/Additional tax bands, and Class 1 National Insurance.',
  },
  CA: {
    id: 'CA',
    name: 'Canada',
    currency: 'CAD',
    symbol: 'C$',
    description: '2025/2026 Federal tax brackets, Basic Personal Amount, CPP, EI, and provincial tax estimates.',
  },
  AU: {
    id: 'AU',
    name: 'Australia',
    currency: 'AUD',
    symbol: 'A$',
    description: '2024-25/2025-26 Stage 3 revised individual income tax rates, Medicare Levy, and Superannuation.',
  },
  GENERIC: {
    id: 'GENERIC',
    name: 'Custom / Other Jurisdiction',
    currency: 'USD',
    symbol: '$',
    description: 'User-configurable estimated effective tax rate and statutory payroll contribution percentage.',
  },
};

/**
 * Calculates progressive tax and statutory deductions for the United States (Federal + FICA + State).
 */
function calculateUsTax(taxableIncome, grossIncome, stateTaxRatePct = 4.5) {
  const standardDeduction = 15000; // 2025/2026 Single Filer
  const netTaxable = Math.max(0, taxableIncome - standardDeduction);

  const federalBrackets = [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ];

  let federalTax = 0;
  let marginalRate = 0;
  for (const b of federalBrackets) {
    if (netTaxable > b.min) {
      const taxableInBracket = Math.min(netTaxable, b.max) - b.min;
      federalTax += taxableInBracket * b.rate;
      marginalRate = b.rate;
    }
  }

  // FICA: Social Security (6.2% up to $176,100 wage base cap)
  const ssWageCap = 176100;
  const socialSecurity = Math.min(grossIncome, ssWageCap) * 0.062;

  // FICA: Medicare (1.45% + 0.9% additional over $200,000)
  let medicare = grossIncome * 0.0145;
  if (grossIncome > 200000) {
    medicare += (grossIncome - 200000) * 0.009;
  }
  const totalFica = socialSecurity + medicare;

  // State Tax Estimate
  const stateTax = Math.max(0, netTaxable * (stateTaxRatePct / 100));

  const totalTax = federalTax + stateTax;
  const totalSocial = totalFica;

  return {
    incomeTax: Math.round(totalTax),
    federalTax: Math.round(federalTax),
    stateTax: Math.round(stateTax),
    socialContributions: Math.round(totalSocial),
    socialSecurity: Math.round(socialSecurity),
    medicare: Math.round(medicare),
    marginalRate: marginalRate + (stateTaxRatePct / 100),
    standardDeduction,
    details: 'US Federal Brackets + FICA (Social Security 6.2% & Medicare 1.45%) + State Tax Estimate',
  };
}

/**
 * Calculates progressive tax and statutory deductions for India (FY 2025-26).
 */
function calculateIndiaTax(taxableIncome, grossIncome, regime = 'new', epfDeduction = 0) {
  const stdDed = regime === 'old' ? INDIAN_TAX_RATES_FY2025_26.oldRegime.standardDeduction : INDIAN_TAX_RATES_FY2025_26.newRegime.standardDeduction;
  const netTaxable = Math.max(0, taxableIncome - stdDed);
  const taxResult = calculateIncomeTaxForRegime({ taxableIncome: netTaxable, regime });
  // EPF default: 12% of basic (assuming 50% basic) or passed epfDeduction
  const epf = epfDeduction > 0 ? epfDeduction : Math.round((grossIncome * 0.5) * 0.12);
  const professionalTax = grossIncome > 300000 ? 2400 : 0;

  return {
    incomeTax: taxResult.totalIncomeTax,
    federalTax: taxResult.baseTaxAfterRebate,
    cessAmount: taxResult.cessAmount,
    rawTax: taxResult.rawTax,
    rebate87a: taxResult.rebate87a,
    stateTax: 0,
    socialContributions: epf + professionalTax,
    epf,
    professionalTax,
    marginalRate: regime === 'new' ? 0.30 : 0.30,
    standardDeduction: stdDed,
    details: `India FY 2025-26 (${regime === 'new' ? 'New Tax Regime u/s 115BAC' : 'Old Tax Regime'}) + EPF + PT`,
  };
}

/**
 * Calculates progressive tax and statutory deductions for the United Kingdom (2025/2026).
 */
function calculateUkTax(taxableIncome, grossIncome) {
  // Personal allowance: £12,570, tapering by £1 for every £2 above £100,000
  let personalAllowance = 12570;
  if (taxableIncome > 100000) {
    const reduction = Math.min(personalAllowance, (taxableIncome - 100000) / 2);
    personalAllowance = Math.max(0, personalAllowance - reduction);
  }

  const netTaxable = Math.max(0, taxableIncome - personalAllowance);

  let incomeTax = 0;
  let marginalRate = 0;

  if (netTaxable > 0) {
    const basicBand = Math.min(netTaxable, 37700); // 12,570 + 37,700 = 50,270
    incomeTax += basicBand * 0.20;
    marginalRate = 0.20;
  }
  if (netTaxable > 37700) {
    const higherBand = Math.min(netTaxable, 125140 - 12570) - 37700;
    incomeTax += higherBand * 0.40;
    marginalRate = 0.40;
  }
  if (taxableIncome > 125140) {
    const additionalBand = taxableIncome - 125140;
    incomeTax += additionalBand * 0.45;
    marginalRate = 0.45;
  }

  // National Insurance Class 1 (8% from £12,570 to £50,270, 2% above £50,270)
  let nationalInsurance = 0;
  if (grossIncome > 12570) {
    const mainNiBand = Math.min(grossIncome, 50270) - 12570;
    nationalInsurance += mainNiBand * 0.08;
  }
  if (grossIncome > 50270) {
    nationalInsurance += (grossIncome - 50270) * 0.02;
  }

  return {
    incomeTax: Math.round(incomeTax),
    federalTax: Math.round(incomeTax),
    stateTax: 0,
    socialContributions: Math.round(nationalInsurance),
    nationalInsurance: Math.round(nationalInsurance),
    marginalRate,
    standardDeduction: Math.round(personalAllowance),
    details: 'UK PAYE Income Tax (20%, 40%, 45%) + Class 1 National Insurance',
  };
}

/**
 * Calculates progressive tax and statutory deductions for Canada (2025/2026 Federal + Provincial Est).
 */
function calculateCanadaTax(taxableIncome, grossIncome, provincialRatePct = 8.0) {
  const bpa = 15705; // Basic Personal Amount
  const netTaxable = Math.max(0, taxableIncome - bpa);

  const federalBrackets = [
    { min: 0, max: 55867, rate: 0.15 },
    { min: 55867, max: 111733, rate: 0.205 },
    { min: 111733, max: 173205, rate: 0.26 },
    { min: 173205, max: 246752, rate: 0.29 },
    { min: 246752, max: Infinity, rate: 0.33 },
  ];

  let fedTax = 0;
  let marginalRate = 0;
  for (const b of federalBrackets) {
    if (netTaxable > b.min) {
      const taxable = Math.min(netTaxable, b.max) - b.min;
      fedTax += taxable * b.rate;
      marginalRate = b.rate;
    }
  }

  // CPP (5.95% up to max ~C$4,050) & EI (1.66% up to max ~C$1,077)
  const cpp = Math.min(grossIncome * 0.0595, 4050);
  const ei = Math.min(grossIncome * 0.0166, 1077);
  const totalSocial = cpp + ei;

  const provTax = netTaxable * (provincialRatePct / 100);
  const totalTax = fedTax + provTax;

  return {
    incomeTax: Math.round(totalTax),
    federalTax: Math.round(fedTax),
    stateTax: Math.round(provTax),
    socialContributions: Math.round(totalSocial),
    cpp: Math.round(cpp),
    ei: Math.round(ei),
    marginalRate: marginalRate + (provincialRatePct / 100),
    standardDeduction: bpa,
    details: 'Canada Federal Brackets + CPP/EI + Provincial Tax Estimate',
  };
}

/**
 * Calculates progressive tax and statutory deductions for Australia (2024-25/2025-26 Stage 3).
 */
function calculateAustraliaTax(taxableIncome, grossIncome) {
  const brackets = [
    { min: 0, max: 18200, rate: 0 },
    { min: 18200, max: 45000, rate: 0.16 },
    { min: 45000, max: 135000, rate: 0.30 },
    { min: 135000, max: 190000, rate: 0.37 },
    { min: 190000, max: Infinity, rate: 0.45 },
  ];

  let tax = 0;
  let marginalRate = 0;
  for (const b of brackets) {
    if (taxableIncome > b.min) {
      const taxable = Math.min(taxableIncome, b.max) - b.min;
      tax += taxable * b.rate;
      marginalRate = b.rate;
    }
  }

  // Medicare Levy (2.0% of taxable income above threshold)
  const medicareLevy = taxableIncome > 26000 ? taxableIncome * 0.02 : 0;
  const totalTax = tax + medicareLevy;

  return {
    incomeTax: Math.round(totalTax),
    federalTax: Math.round(tax),
    stateTax: 0,
    socialContributions: Math.round(medicareLevy),
    medicareLevy: Math.round(medicareLevy),
    marginalRate: marginalRate + 0.02,
    standardDeduction: 18200,
    details: 'Australia Stage 3 Individual Tax Brackets + 2% Medicare Levy',
  };
}

/**
 * Calculates generic/custom flat-rate tax and contributions.
 */
function calculateGenericTax(taxableIncome, grossIncome, customTaxRate = 20, customSocialRate = 5) {
  const tax = taxableIncome * (Math.max(0, Math.min(100, customTaxRate)) / 100);
  const social = grossIncome * (Math.max(0, Math.min(100, customSocialRate)) / 100);

  return {
    incomeTax: Math.round(tax),
    federalTax: Math.round(tax),
    stateTax: 0,
    socialContributions: Math.round(social),
    marginalRate: (customTaxRate + customSocialRate) / 100,
    standardDeduction: 0,
    details: `Custom Flat Tax Rate (${customTaxRate}%) + Social Contributions (${customSocialRate}%)`,
  };
}

/**
 * Dispatches tax calculation to the appropriate jurisdiction handler.
 */
export function calculateTaxByJurisdiction({
  jurisdiction = 'US',
  taxableIncome = 0,
  grossIncome = 0,
  indiaRegime = 'new',
  customTaxRate = 20,
  customSocialRate = 5,
  stateTaxRatePct = 4.5,
  epfDeduction = 0,
} = {}) {
  const jur = JURISDICTIONS[jurisdiction] ? jurisdiction : 'US';
  const taxInc = Math.max(0, Number(taxableIncome) || 0);
  const gross = Math.max(0, Number(grossIncome) || 0);

  switch (jur) {
    case 'US':
      return calculateUsTax(taxInc, gross, stateTaxRatePct);
    case 'IN':
      return calculateIndiaTax(taxInc, gross, indiaRegime, epfDeduction);
    case 'UK':
      return calculateUkTax(taxInc, gross);
    case 'CA':
      return calculateCanadaTax(taxInc, gross, stateTaxRatePct);
    case 'AU':
      return calculateAustraliaTax(taxInc, gross);
    case 'GENERIC':
    default:
      return calculateGenericTax(taxInc, gross, customTaxRate, customSocialRate);
  }
}

/**
 * Primary pure calculation function for Salary & Take-Home Pay.
 *
 * @param {Object} params - Input configuration
 * @returns {Object} Structured salary metrics, breakdowns, period matrix, and KPIs
 */
export function calculateSalary(params = {}) {
  const payFrequency = PAY_FREQUENCIES[params.payFrequency] ? params.payFrequency : 'ANNUAL';
  const rawSalary = Math.max(0, Number(params.salaryAmount !== undefined ? params.salaryAmount : params.salary) || 0);
  const hoursPerWeek = Math.max(1, Math.min(168, Number(params.hoursPerWeek) || 40));
  const weeksPerYear = Math.max(1, Math.min(52, Number(params.weeksPerYear) || 52));
  const workingDaysPerYear = Math.max(1, Math.min(365, Number(params.workingDaysPerYear) || 260));

  const bonusAnnual = Math.max(0, Number(params.bonusAnnual || params.bonus) || 0);
  const commissionAnnual = Math.max(0, Number(params.commissionAnnual || params.commission) || 0);
  const otherTaxableAnnual = Math.max(0, Number(params.otherTaxableAnnual || params.otherTaxable) || 0);

  const preTaxDeductionsAnnual = Math.max(0, Number(params.preTaxDeductionsAnnual || params.preTaxDeductions) || 0);
  const postTaxDeductionsAnnual = Math.max(0, Number(params.postTaxDeductionsAnnual || params.postTaxDeductions) || 0);

  const jurisdiction = JURISDICTIONS[params.jurisdiction] ? params.jurisdiction : 'US';
  const indiaRegime = params.indiaRegime === 'old' ? 'old' : 'new';
  const customTaxRate = params.customTaxRate !== undefined ? Number(params.customTaxRate) : 20;
  const customSocialRate = params.customSocialRate !== undefined ? Number(params.customSocialRate) : 0;
  const stateTaxRatePct = Number(params.stateTaxRatePct !== undefined ? params.stateTaxRatePct : 4.5);

  // 1. Convert Input Salary to Annual Base Salary
  let annualBaseSalary = 0;
  if (payFrequency === 'ANNUAL') {
    annualBaseSalary = rawSalary;
  } else if (payFrequency === 'MONTHLY') {
    annualBaseSalary = rawSalary * 12;
  } else if (payFrequency === 'SEMI_MONTHLY') {
    annualBaseSalary = rawSalary * 24;
  } else if (payFrequency === 'BI_WEEKLY') {
    annualBaseSalary = rawSalary * 26;
  } else if (payFrequency === 'WEEKLY') {
    annualBaseSalary = rawSalary * 52;
  } else if (payFrequency === 'DAILY') {
    annualBaseSalary = rawSalary * workingDaysPerYear;
  } else if (payFrequency === 'HOURLY') {
    annualBaseSalary = rawSalary * hoursPerWeek * weeksPerYear;
  }

  // 2. Gross Total Compensation
  const totalVariablePayAnnual = bonusAnnual + commissionAnnual + otherTaxableAnnual;
  const totalGrossAnnual = annualBaseSalary + totalVariablePayAnnual;

  // 3. Taxable Income after Pre-Tax Deductions
  const taxableIncomeAnnual = Math.max(0, totalGrossAnnual - preTaxDeductionsAnnual);

  // 4. Tax and Statutory Deductions
  const taxResult = calculateTaxByJurisdiction({
    jurisdiction,
    taxableIncome: taxableIncomeAnnual,
    grossIncome: totalGrossAnnual,
    indiaRegime,
    customTaxRate,
    customSocialRate,
    stateTaxRatePct,
    epfDeduction: preTaxDeductionsAnnual,
  });

  const incomeTaxAnnual = taxResult.incomeTax;
  const socialContributionsAnnual = taxResult.socialContributions;
  const totalTaxesAndSocialAnnual = incomeTaxAnnual + socialContributionsAnnual;

  // 5. Total Deductions & Net Take-Home Pay
  const totalDeductionsAnnual =
    incomeTaxAnnual +
    socialContributionsAnnual +
    preTaxDeductionsAnnual +
    postTaxDeductionsAnnual;

  const netAnnualSalary = Math.max(0, totalGrossAnnual - totalDeductionsAnnual);

  // 6. Effective & Marginal Tax Rates
  const effectiveTaxRatePct = totalGrossAnnual > 0 ? (totalTaxesAndSocialAnnual / totalGrossAnnual) * 100 : 0;
  const effectiveTotalDeductionRatePct = totalGrossAnnual > 0 ? (totalDeductionsAnnual / totalGrossAnnual) * 100 : 0;
  const takeHomeRatioPct = totalGrossAnnual > 0 ? (netAnnualSalary / totalGrossAnnual) * 100 : 0;

  // 7. Multi-Period Matrix (Gross, Tax, Social, Pre-Tax, Post-Tax, Total Deductions, Net)
  const totalHoursAnnual = hoursPerWeek * weeksPerYear;

  const periods = {
    annual: {
      label: 'Annual (Yearly)',
      gross: totalGrossAnnual,
      baseSalary: annualBaseSalary,
      variablePay: totalVariablePayAnnual,
      incomeTax: incomeTaxAnnual,
      socialContributions: socialContributionsAnnual,
      preTaxDeductions: preTaxDeductionsAnnual,
      postTaxDeductions: postTaxDeductionsAnnual,
      totalDeductions: totalDeductionsAnnual,
      net: netAnnualSalary,
    },
    monthly: {
      label: 'Monthly (12x/yr)',
      gross: totalGrossAnnual / 12,
      baseSalary: annualBaseSalary / 12,
      variablePay: totalVariablePayAnnual / 12,
      incomeTax: incomeTaxAnnual / 12,
      socialContributions: socialContributionsAnnual / 12,
      preTaxDeductions: preTaxDeductionsAnnual / 12,
      postTaxDeductions: postTaxDeductionsAnnual / 12,
      totalDeductions: totalDeductionsAnnual / 12,
      net: netAnnualSalary / 12,
    },
    semiMonthly: {
      label: 'Semi-Monthly (24x/yr)',
      gross: totalGrossAnnual / 24,
      baseSalary: annualBaseSalary / 24,
      variablePay: totalVariablePayAnnual / 24,
      incomeTax: incomeTaxAnnual / 24,
      socialContributions: socialContributionsAnnual / 24,
      preTaxDeductions: preTaxDeductionsAnnual / 24,
      postTaxDeductions: postTaxDeductionsAnnual / 24,
      totalDeductions: totalDeductionsAnnual / 24,
      net: netAnnualSalary / 24,
    },
    biWeekly: {
      label: 'Bi-Weekly (26x/yr)',
      gross: totalGrossAnnual / 26,
      baseSalary: annualBaseSalary / 26,
      variablePay: totalVariablePayAnnual / 26,
      incomeTax: incomeTaxAnnual / 26,
      socialContributions: socialContributionsAnnual / 26,
      preTaxDeductions: preTaxDeductionsAnnual / 26,
      postTaxDeductions: postTaxDeductionsAnnual / 26,
      totalDeductions: totalDeductionsAnnual / 26,
      net: netAnnualSalary / 26,
    },
    weekly: {
      label: 'Weekly (52x/yr)',
      gross: totalGrossAnnual / 52,
      baseSalary: annualBaseSalary / 52,
      variablePay: totalVariablePayAnnual / 52,
      incomeTax: incomeTaxAnnual / 52,
      socialContributions: socialContributionsAnnual / 52,
      preTaxDeductions: preTaxDeductionsAnnual / 52,
      postTaxDeductions: postTaxDeductionsAnnual / 52,
      totalDeductions: totalDeductionsAnnual / 52,
      net: netAnnualSalary / 52,
    },
    daily: {
      label: 'Daily (Working Days)',
      gross: totalGrossAnnual / workingDaysPerYear,
      baseSalary: annualBaseSalary / workingDaysPerYear,
      variablePay: totalVariablePayAnnual / workingDaysPerYear,
      incomeTax: incomeTaxAnnual / workingDaysPerYear,
      socialContributions: socialContributionsAnnual / workingDaysPerYear,
      preTaxDeductions: preTaxDeductionsAnnual / workingDaysPerYear,
      postTaxDeductions: postTaxDeductionsAnnual / workingDaysPerYear,
      totalDeductions: totalDeductionsAnnual / workingDaysPerYear,
      net: netAnnualSalary / workingDaysPerYear,
    },
    hourly: {
      label: 'Hourly Equivalent',
      gross: totalHoursAnnual > 0 ? totalGrossAnnual / totalHoursAnnual : 0,
      baseSalary: totalHoursAnnual > 0 ? annualBaseSalary / totalHoursAnnual : 0,
      variablePay: totalHoursAnnual > 0 ? totalVariablePayAnnual / totalHoursAnnual : 0,
      incomeTax: totalHoursAnnual > 0 ? incomeTaxAnnual / totalHoursAnnual : 0,
      socialContributions: totalHoursAnnual > 0 ? socialContributionsAnnual / totalHoursAnnual : 0,
      preTaxDeductions: totalHoursAnnual > 0 ? preTaxDeductionsAnnual / totalHoursAnnual : 0,
      postTaxDeductions: totalHoursAnnual > 0 ? postTaxDeductionsAnnual / totalHoursAnnual : 0,
      totalDeductions: totalHoursAnnual > 0 ? totalDeductionsAnnual / totalHoursAnnual : 0,
      net: totalHoursAnnual > 0 ? netAnnualSalary / totalHoursAnnual : 0,
    },
  };

  return {
    inputs: {
      salaryAmount: rawSalary,
      payFrequency,
      hoursPerWeek,
      weeksPerYear,
      workingDaysPerYear,
      bonusAnnual,
      commissionAnnual,
      otherTaxableAnnual,
      preTaxDeductionsAnnual,
      postTaxDeductionsAnnual,
      jurisdiction,
      indiaRegime,
      customTaxRate,
      customSocialRate,
      stateTaxRatePct,
    },
    totals: {
      annualBaseSalary,
      totalVariablePayAnnual,
      totalGrossAnnual,
      taxableIncomeAnnual,
      incomeTaxAnnual,
      socialContributionsAnnual,
      totalTaxesAndSocialAnnual,
      preTaxDeductionsAnnual,
      postTaxDeductionsAnnual,
      totalDeductionsAnnual,
      netAnnualSalary,
      netMonthlySalary: netAnnualSalary / 12,
      netWeeklySalary: netAnnualSalary / 52,
      netHourlySalary: totalHoursAnnual > 0 ? netAnnualSalary / totalHoursAnnual : 0,
      totalHoursAnnual,
    },
    taxBreakdown: taxResult,
    rates: {
      effectiveTaxRatePct,
      effectiveTotalDeductionRatePct,
      takeHomeRatioPct,
      marginalTaxRatePct: taxResult.marginalRate ? taxResult.marginalRate * 100 : 0,
    },
    periods,
  };
}

/**
 * Reverse Target Net Take-Home Pay Solver (Gross-Up Engine).
 * Uses a deterministic numerical bisection method to find required Gross Salary for a desired Net Pay.
 *
 * @param {Object} params
 * @param {number} params.targetNet - Desired Net Pay amount
 * @param {string} [params.targetPeriod='monthly'] - 'monthly' or 'annual'
 * @param {Object} [params.baseConfig={}] - Other salary config (jurisdiction, deductions, etc.)
 * @returns {Object} Target solve results (requiredGrossAnnual, requiredGrossMonthly, effectiveTaxRate, grossUpAmount)
 */
export function solveTargetGrossSalary(params = {}) {
  const targetNetInput = Math.max(0, Number(params.targetNet) || 0);
  const targetPeriod = params.targetPeriod === 'annual' ? 'annual' : 'monthly';
  const targetAnnualNet = targetPeriod === 'monthly' ? targetNetInput * 12 : targetNetInput;
  const baseConfig = params.baseConfig || {};

  if (targetAnnualNet <= 0) {
    return {
      targetNetInput,
      targetPeriod,
      targetAnnualNet: 0,
      requiredGrossAnnual: 0,
      requiredGrossMonthly: 0,
      estimatedEffectiveTaxRate: 0,
      estimatedTotalDeductions: 0,
      grossUpAmount: 0,
      converged: true,
      iterations: 0,
    };
  }

  // Bisection Solver bounds:
  // Lower bound: targetAnnualNet
  // Upper bound: targetAnnualNet * 3.5 + 500,000
  let low = targetAnnualNet;
  let high = Math.max(50000000, targetAnnualNet * 3.5 + 500000);
  let requiredGrossAnnual = low;
  let iterations = 0;
  const maxIterations = 80;
  const tolerance = 0.01; // Sub-cent precision

  while (iterations < maxIterations) {
    iterations++;
    const mid = (low + high) / 2;
    const testResult = calculateSalary({
      ...baseConfig,
      salaryAmount: mid,
      payFrequency: 'ANNUAL',
    });

    const netAchieved = testResult.totals.netAnnualSalary;
    const diff = netAchieved - targetAnnualNet;

    if (Math.abs(diff) <= tolerance || (high - low) <= 0.001) {
      requiredGrossAnnual = mid;
      break;
    }

    if (netAchieved < targetAnnualNet) {
      low = mid;
    } else {
      high = mid;
    }
    requiredGrossAnnual = mid;
  }

  const finalResult = calculateSalary({
    ...baseConfig,
    salaryAmount: requiredGrossAnnual,
    payFrequency: 'ANNUAL',
  });

  const grossUpAmount = Math.max(0, requiredGrossAnnual - targetAnnualNet);

  return {
    targetNetInput,
    targetPeriod,
    targetAnnualNet,
    requiredGrossAnnual: Math.round(requiredGrossAnnual),
    requiredGrossMonthly: Math.round(requiredGrossAnnual / 12),
    requiredGrossHourly: finalResult.periods.hourly.gross,
    estimatedEffectiveTaxRate: finalResult.rates.effectiveTaxRatePct,
    estimatedTotalDeductions: Math.round(finalResult.totals.totalDeductionsAnnual),
    grossUpAmount: Math.round(grossUpAmount),
    converged: iterations < maxIterations,
    iterations,
  };
}

/**
 * Dual Salary / Job Offer Comparison Mode (Offer A vs Offer B).
 *
 * @param {Object} offerA - Parameters for Scenario A
 * @param {Object} offerB - Parameters for Scenario B
 * @returns {Object} Side-by-side comparison matrix and delta KPIs
 */
export function compareSalaryOffers(offerA = {}, offerB = {}) {
  const resultA = calculateSalary(offerA);
  const resultB = calculateSalary(offerB);

  const deltaGrossAnnual = resultB.totals.totalGrossAnnual - resultA.totals.totalGrossAnnual;
  const deltaNetAnnual = resultB.totals.netAnnualSalary - resultA.totals.netAnnualSalary;
  const deltaNetMonthly = resultB.totals.netMonthlySalary - resultA.totals.netMonthlySalary;
  const deltaTaxAnnual = resultB.totals.incomeTaxAnnual - resultA.totals.incomeTaxAnnual;
  const deltaTotalDeductions = resultB.totals.totalDeductionsAnnual - resultA.totals.totalDeductionsAnnual;
  const deltaEffectiveTaxRate = resultB.rates.effectiveTaxRatePct - resultA.rates.effectiveTaxRatePct;
  const deltaHourlyNet = resultB.totals.netHourlySalary - resultA.totals.netHourlySalary;

  const winner = deltaNetAnnual > 0 ? 'B' : deltaNetAnnual < 0 ? 'A' : 'TIE';

  return {
    offerA: resultA,
    offerB: resultB,
    deltas: {
      deltaGrossAnnual,
      deltaNetAnnual,
      deltaNetMonthly,
      deltaTaxAnnual,
      deltaTotalDeductions,
      deltaEffectiveTaxRate,
      deltaHourlyNet,
      winner,
    },
  };
}
