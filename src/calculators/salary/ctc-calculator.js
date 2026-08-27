/**
 * Pure JavaScript Financial Engine for CTC to Take-Home Salary Breakdown Calculator
 * FY 2025-26 / AY 2026-27 Income Tax Act Rules
 *
 * All financial logic is completely decoupled from UI and framework code.
 */

import {
  calculateProfessionalTax as computePt,
  calculateStandardDeduction,
  calculateIncomeTaxForRegime,
  calculateHRAExemption as computeHraExemption,
} from '../core/salaryUtils.js';

/**
 * Calculates Employer statutory and retainer contributions (Employer EPF, Gratuity, NPS).
 */
export function calculateEmployerContributions(params = {}) {
  const basicSalary = Math.max(0, Number(params.basicSalary) || 0);
  const employerEpfIncluded = params.employerEpfIncluded !== undefined ? Boolean(params.employerEpfIncluded) : true;
  const includeGratuity = params.includeGratuity !== undefined ? Boolean(params.includeGratuity) : true;
  const employerNps = Math.max(0, Number(params.employerNps) || 0);

  const employerEpf = employerEpfIncluded ? Math.round(basicSalary * 0.12) : 0;
  // Gratuity: (Basic / 26) * 15 days per year = ~4.8077% of Basic (15 / 312)
  const employerGratuity = includeGratuity ? Math.round((basicSalary * 15) / 312) : 0;
  const totalEmployerRetainers = employerEpf + employerGratuity + employerNps;

  return {
    employerEpf,
    employerGratuity,
    employerNps,
    totalEmployerRetainers,
  };
}

/**
 * Calculates Gross Annual Cash Salary by subtracting employer retainers from total CTC.
 */
export function calculateGrossSalary(params = {}) {
  const annualCtc = Math.max(0, Number(params.annualCtc || params.ctc) || 0);
  const employerRetainers = Math.max(
    0,
    Number(params.totalEmployerRetainers || params.employerRetainers) || 0
  );
  return Math.max(0, Math.round(annualCtc - employerRetainers));
}

/**
 * Decomposes Annual CTC into Basic, HRA, Special Allowance, Employer Retainers, and Bonus.
 */
export function decomposeCtc(params = {}) {
  const annualCtc = Math.max(0, Number(params.annualCtc || params.ctc) || 0);
  const basicPercentInput = Number(params.basicSalaryPercent || params.basicPercent);
  const basicPercent = Math.max(10, Math.min(100, isNaN(basicPercentInput) ? 50 : basicPercentInput));
  const isMetro = params.isMetro !== undefined ? Boolean(params.isMetro) : true;
  const bonusAmount = Math.max(0, Number(params.performanceBonusAnnual || params.bonusAmount) || 0);

  const basicSalary = Math.round(annualCtc * (basicPercent / 100));

  // Employer Retainers
  const retainers = calculateEmployerContributions({
    basicSalary,
    employerEpfIncluded: params.employerEpfIncluded,
    includeGratuity: params.includeGratuity,
    employerNps: params.employerNps,
  });

  // Gross Annual Cash Salary
  const grossAnnualSalary = calculateGrossSalary({
    annualCtc,
    totalEmployerRetainers: retainers.totalEmployerRetainers,
  });
  const grossMonthlySalary = Math.round(grossAnnualSalary / 12);

  // Allowances Breakdown
  const hraReceived = Math.round(isMetro ? basicSalary * 0.5 : basicSalary * 0.4);
  const specialAllowance = Math.max(0, grossAnnualSalary - basicSalary - hraReceived - bonusAmount);

  return {
    annualCtc,
    basicSalary,
    basicPercent,
    isMetro,
    bonusAmount,
    employerEpf: retainers.employerEpf,
    employerGratuity: retainers.employerGratuity,
    employerNps: retainers.employerNps,
    totalEmployerRetainers: retainers.totalEmployerRetainers,
    grossAnnualSalary,
    grossMonthlySalary,
    hraReceived,
    specialAllowance,
  };
}

/**
 * Calculates HRA exemption under Old Tax Regime based on Section 10(13A) & Rule 2A.
 */
export function calculateHraExemption(params = {}) {
  const { regime = 'old', basicSalary = 0, hraReceived = 0, rentPaidMonthly = 0, isMetro = true } = params;

  if (regime === 'new') {
    return {
      hraExemption: 0,
      taxableHra: Math.max(0, Number(hraReceived) || 0),
      isExempt: false,
      regimeNotice: 'HRA exemption is not available under the New Tax Regime (Section 115BAC).',
    };
  }

  const annualRentPaid = Math.max(0, (Number(rentPaidMonthly) || 0) * 12);
  const basicAnnual = Math.max(0, Number(basicSalary) || 0);
  const hraAnnual = Math.max(0, Number(hraReceived) || 0);

  const result = computeHraExemption({
    basicSalary: basicAnnual,
    hraReceived: hraAnnual,
    rentPaid: annualRentPaid,
    isMetro,
  });

  return {
    hraExemption: result.exemptHra,
    taxableHra: result.taxableHra,
    isExempt: result.exemptHra > 0,
    clauses: {
      clause1: result.actualHra,
      clause2: result.rentMinusTenPercent,
      clause3: result.salaryCap,
    },
    bindingLimit: result.bindingLimit,
  };
}

/**
 * Calculates Employee Statutory Deductions (Employee EPF & Professional Tax).
 */
export function calculateEmployeeDeductions(params = {}) {
  const basicSalary = Math.max(0, Number(params.basicSalary) || 0);
  const grossAnnualSalary = Math.max(0, Number(params.grossAnnualSalary) || 0);
  const customPt = params.professionalTax !== undefined && params.professionalTax !== null
    ? Number(params.professionalTax)
    : null;

  const employeeEpf = Math.round(basicSalary * 0.12);
  const professionalTax = computePt(grossAnnualSalary / 12, customPt);

  return {
    employeeEpf,
    professionalTax,
    totalStatutoryDeductions: employeeEpf + professionalTax,
  };
}

/**
 * Calculates Taxable Salary for Old vs New Tax Regimes.
 */
export function calculateTaxableSalary(params = {}) {
  const { grossAnnualSalary = 0, regime = 'new', hraExemption = 0, employeeEpf = 0, otherDeductionsOld = 0 } = params;

  const stdDeduction = calculateStandardDeduction(regime);

  if (regime === 'new') {
    const taxableIncome = Math.max(0, grossAnnualSalary - stdDeduction);
    return {
      regime: 'new',
      grossAnnualSalary,
      standardDeduction: stdDeduction,
      hraExemption: 0,
      employeeEpfDeduction: 0,
      otherDeductions: 0,
      taxableIncome,
    };
  }

  // Old Tax Regime Deductions
  const totalOldDeductions = stdDeduction + Math.max(0, Number(hraExemption) || 0) + Math.max(0, Number(employeeEpf) || 0) + Math.max(0, Number(otherDeductionsOld) || 0);
  const taxableIncome = Math.max(0, grossAnnualSalary - totalOldDeductions);

  return {
    regime: 'old',
    grossAnnualSalary,
    standardDeduction: stdDeduction,
    hraExemption: Math.max(0, Number(hraExemption) || 0),
    employeeEpfDeduction: Math.max(0, Number(employeeEpf) || 0),
    otherDeductions: Math.max(0, Number(otherDeductionsOld) || 0),
    taxableIncome,
  };
}

/**
 * Calculates Income Tax liability for a given taxable income and tax regime.
 */
export function calculateIncomeTax(params = {}) {
  const taxableIncome = Math.max(0, Number(params.taxableIncome) || 0);
  const regime = params.regime || 'new';
  return calculateIncomeTaxForRegime({ taxableIncome, regime });
}

/**
 * Compares Old Tax Regime vs New Tax Regime side-by-side.
 */
export function compareCtcRegimes(params = {}) {
  const decomp = decomposeCtc(params);
  const deductions = calculateEmployeeDeductions({
    basicSalary: decomp.basicSalary,
    grossAnnualSalary: decomp.grossAnnualSalary,
    professionalTax: params.professionalTax,
  });

  // HRA Exemption for Old Regime
  const hraRes = calculateHraExemption({
    regime: 'old',
    basicSalary: decomp.basicSalary,
    hraReceived: decomp.hraReceived,
    rentPaidMonthly: params.rentPaidMonthly,
    isMetro: decomp.isMetro,
  });

  // Old Regime Taxable & Income Tax
  const oldTaxable = calculateTaxableSalary({
    grossAnnualSalary: decomp.grossAnnualSalary,
    regime: 'old',
    hraExemption: hraRes.hraExemption,
    employeeEpf: deductions.employeeEpf,
    otherDeductionsOld: params.otherDeductionsOld,
  });
  const oldTax = calculateIncomeTax({ taxableIncome: oldTaxable.taxableIncome, regime: 'old' });
  const oldNetAnnual = Math.max(0, decomp.grossAnnualSalary - deductions.totalStatutoryDeductions - oldTax.totalIncomeTax);
  const oldNetMonthly = Math.round(oldNetAnnual / 12);

  // New Regime Taxable & Income Tax
  const newTaxable = calculateTaxableSalary({
    grossAnnualSalary: decomp.grossAnnualSalary,
    regime: 'new',
  });
  const newTax = calculateIncomeTax({ taxableIncome: newTaxable.taxableIncome, regime: 'new' });
  const newNetAnnual = Math.max(0, decomp.grossAnnualSalary - deductions.totalStatutoryDeductions - newTax.totalIncomeTax);
  const newNetMonthly = Math.round(newNetAnnual / 12);

  const isNewBetter = newNetAnnual >= oldNetAnnual;
  const annualSavings = Math.abs(newNetAnnual - oldNetAnnual);
  const monthlySavings = Math.round(annualSavings / 12);

  return {
    oldRegime: {
      regime: 'old',
      taxableIncome: oldTaxable.taxableIncome,
      totalTax: oldTax.totalIncomeTax,
      netAnnualTakeHome: oldNetAnnual,
      netMonthlyTakeHome: oldNetMonthly,
      hraExemption: hraRes.hraExemption,
    },
    newRegime: {
      regime: 'new',
      taxableIncome: newTaxable.taxableIncome,
      totalTax: newTax.totalIncomeTax,
      netAnnualTakeHome: newNetAnnual,
      netMonthlyTakeHome: newNetMonthly,
    },
    recommendedRegime: isNewBetter ? 'new' : 'old',
    recommendationNotice: isNewBetter
      ? `Lower modeled tax under New Tax Regime (~₹${monthlySavings.toLocaleString('en-IN')}/mo in-hand savings).`
      : `Lower modeled tax under Old Tax Regime (~₹${monthlySavings.toLocaleString('en-IN')}/mo in-hand savings due to HRA/EPF deductions).`,
    annualSavings,
    monthlySavings,
  };
}

/**
 * Master integration function for CTC to Take-Home Salary Calculator.
 */
export function calculateCtcTakeHome(inputs = {}) {
  const annualCtc = Math.max(0, Number(inputs.annualCtc || inputs.ctc) || 0);
  const isValid = annualCtc > 0;

  if (!isValid) {
    return {
      isValid: false,
      decomposition: {
        annualCtc: 0,
        basicSalary: 0,
        basicPercent: 50,
        isMetro: true,
        bonusAmount: 0,
        employerEpf: 0,
        employerGratuity: 0,
        employerNps: 0,
        totalEmployerRetainers: 0,
        grossAnnualSalary: 0,
        grossMonthlySalary: 0,
        hraReceived: 0,
        specialAllowance: 0,
      },
      deductions: {
        employeeEpf: 0,
        professionalTax: 0,
        totalStatutoryDeductions: 0,
      },
      comparison: {
        oldRegime: { regime: 'old', taxableIncome: 0, totalTax: 0, netAnnualTakeHome: 0, netMonthlyTakeHome: 0, hraExemption: 0 },
        newRegime: { regime: 'new', taxableIncome: 0, totalTax: 0, netAnnualTakeHome: 0, netMonthlyTakeHome: 0 },
        recommendedRegime: 'new',
        recommendationNotice: 'Enter a valid CTC amount to generate salary breakdown.',
        annualSavings: 0,
        monthlySavings: 0,
      },
      activeRegime: inputs.taxRegime === 'old' ? 'oldRegime' : 'newRegime',
      netAnnualTakeHome: 0,
      netMonthlyTakeHome: 0,
      effectiveTaxRate: 0,
    };
  }

  const decomp = decomposeCtc(inputs);
  const deductions = calculateEmployeeDeductions({
    basicSalary: decomp.basicSalary,
    grossAnnualSalary: decomp.grossAnnualSalary,
    professionalTax: inputs.professionalTax,
  });

  const regimeComparison = compareCtcRegimes(inputs);
  const activeRegimeKey = inputs.taxRegime === 'old' ? 'oldRegime' : 'newRegime';
  const activeRegimeData = regimeComparison[activeRegimeKey];

  return {
    isValid,
    decomposition: decomp,
    deductions,
    comparison: regimeComparison,
    activeRegime: activeRegimeKey,
    netAnnualTakeHome: activeRegimeData.netAnnualTakeHome,
    netMonthlyTakeHome: activeRegimeData.netMonthlyTakeHome,
    effectiveTaxRate: decomp.annualCtc > 0 ? (activeRegimeData.totalTax / decomp.annualCtc) * 100 : 0,
  };
}

