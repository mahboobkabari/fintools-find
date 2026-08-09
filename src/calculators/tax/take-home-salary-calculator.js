/**
 * Institutional Take-Home Salary Calculator Engine (FY 2025-26 / AY 2026-27)
 * Computes net monthly in-hand salary, income tax, EPF, professional tax,
 * tax regime comparison (Old vs New), salary health score, decision verdict,
 * and 4-scenario compensation growth modeling.
 *
 * All tax parameters are sourced from src/data/tax-rates/indianTaxRates.js
 */

import { INDIAN_TAX_RATES_FY2025_26 } from '../../data/tax-rates/indianTaxRates.js';
import {
  calculateGrossSalary,
  calculateNetSalary,
  calculateMonthlySalary,
  calculateEmployerContribution,
  calculateEmployeeContribution,
  calculateProfessionalTax,
  calculateStandardDeduction,
  calculateIncomeTaxForRegime,
} from '../core/salaryUtils.js';
import { effectiveTaxRate } from '../core/taxUtils.js';

/**
 * Primary pure calculation function for Take-Home Salary.
 *
 * @param {Object} inputs
 * @param {number} [inputs.ctc=1200000] - Cost to Company in Rupees (₹)
 * @param {string} [inputs.ctcPeriod='annual'] - 'annual' or 'monthly'
 * @param {number} [inputs.basicPercent=50] - Basic Salary % of CTC (10-100%)
 * @param {number} [inputs.bonusAmount=0] - Annual performance bonus / variable pay (₹)
 * @param {boolean} [inputs.employerEpfIncluded=true] - Is Employer EPF (12%) part of CTC
 * @param {number} [inputs.epfPercent=12] - Employee EPF contribution % (0-12%)
 * @param {number} [inputs.vpfPercent=0] - Voluntary PF contribution % (0-30%)
 * @param {number} [inputs.professionalTax=2400] - Annual Professional Tax (₹)
 * @param {number} [inputs.otherDeductions=0] - Other monthly/annual deductions (₹)
 * @param {number} [inputs.oldRegimeDeductions=0] - Additional Old Regime deductions (80C, 24b, 80D, etc.) (₹)
 * @param {string} [inputs.regime='new'] - Selected tax regime ('new' or 'old')
 * @returns {Object} Structured numerical results and decision intelligence object
 */
export function calculateTakeHomeSalaryCalculator(inputs = {}) {
  const {
    ctc = 1200000,
    ctcPeriod = 'annual',
    basicPercent = 50,
    bonusAmount = 0,
    employerEpfIncluded = true,
    epfPercent = 12,
    vpfPercent = 0,
    professionalTax = 2400,
    otherDeductions = 0,
    oldRegimeDeductions = 0,
    regime = 'new',
  } = inputs;

  const rawCtc = Math.max(0, Number(ctc) || 0);
  const annualCtc = ctcPeriod === 'monthly' ? rawCtc * 12 : rawCtc;
  const numBasicPct = Math.max(10, Math.min(100, Number(basicPercent) || 50));
  const numPt = calculateProfessionalTax(annualCtc / 12, professionalTax);
  const numOtherDed = Math.max(0, Number(otherDeductions) || 0);
  const numOldExtraDed = Math.max(0, Number(oldRegimeDeductions) || 0);

  // 1. SALARY COMPONENTS & STATUTORY BREAKDOWN
  const basicSalary = Math.round(annualCtc * (numBasicPct / 100));

  // Employer Contributions
  const employerContribRes = calculateEmployerContribution({
    basicSalary,
    epfPercent: employerEpfIncluded ? 12 : 0,
    includeGratuity: false, // Standard practice: basic salary gross allocation
  });
  const employerEpf = employerContribRes.employerEpf;
  const totalEmployerContribution = employerEpf;

  // Gross Annual Salary = CTC - Employer EPF
  const grossAnnualSalary = calculateGrossSalary({
    ctc: annualCtc,
    employerEpf,
  });
  const grossMonthlySalary = calculateMonthlySalary(grossAnnualSalary);

  // Employee Statutory Deductions
  const employeePfRes = calculateEmployeeContribution({
    basicSalary,
    epfPercent,
    vpfPercent,
  });
  const employeeEpfAnnual = employeePfRes.employeeEpf;
  const employeeVpfAnnual = employeePfRes.employeeVpf;
  const totalEmployeePfAnnual = employeePfRes.totalEmployeePf;

  // 2. NEW TAX REGIME COMPUTATION (FY 2025-26)
  const stdDedNew = calculateStandardDeduction('new', true, INDIAN_TAX_RATES_FY2025_26);
  const taxableIncomeNew = Math.max(0, grossAnnualSalary - stdDedNew);
  const taxNewRes = calculateIncomeTaxForRegime({
    taxableIncome: taxableIncomeNew,
    regime: 'new',
    taxRatesData: INDIAN_TAX_RATES_FY2025_26,
  });
  const totalTaxNew = taxNewRes.totalIncomeTax;
  const totalDeductionsNew = totalTaxNew + totalEmployeePfAnnual + numPt + numOtherDed;
  const netAnnualTakeHomeNew = calculateNetSalary(grossAnnualSalary, totalDeductionsNew);
  const netMonthlyTakeHomeNew = calculateMonthlySalary(netAnnualTakeHomeNew);

  // 3. OLD TAX REGIME COMPUTATION
  const stdDedOld = calculateStandardDeduction('old', true, INDIAN_TAX_RATES_FY2025_26);
  // Old regime allows 80C (up to 1.5L, including Employee EPF) + extra deductions (24b, 80D, HRA)
  const sec80cTotal = Math.min(150000, totalEmployeePfAnnual);
  const totalDeductionsClaimedOld = stdDedOld + sec80cTotal + numOldExtraDed;
  const taxableIncomeOld = Math.max(0, grossAnnualSalary - totalDeductionsClaimedOld);
  const taxOldRes = calculateIncomeTaxForRegime({
    taxableIncome: taxableIncomeOld,
    regime: 'old',
    taxRatesData: INDIAN_TAX_RATES_FY2025_26,
  });
  const totalTaxOld = taxOldRes.totalIncomeTax;
  const totalDeductionsOld = totalTaxOld + totalEmployeePfAnnual + numPt + numOtherDed;
  const netAnnualTakeHomeOld = calculateNetSalary(grossAnnualSalary, totalDeductionsOld);
  const netMonthlyTakeHomeOld = calculateMonthlySalary(netAnnualTakeHomeOld);

  // 4. TAX REGIME COMPARISON & RECOMMENDATION
  const isNewCheaper = totalTaxNew <= totalTaxOld;
  const recommendedRegime = isNewCheaper ? 'new' : 'old';
  const taxSavingsAnnual = Math.abs(totalTaxOld - totalTaxNew);
  const taxSavingsMonthly = Math.round(taxSavingsAnnual / 12);

  // Selected Active Regime values
  const activeIsNew = regime === 'new';
  const activeTaxRes = activeIsNew ? taxNewRes : taxOldRes;
  const totalIncomeTax = activeTaxRes.totalIncomeTax;
  const totalDeductions = activeIsNew ? totalDeductionsNew : totalDeductionsOld;
  const netAnnualTakeHome = activeIsNew ? netAnnualTakeHomeNew : netAnnualTakeHomeOld;
  const netMonthlyTakeHome = activeIsNew ? netMonthlyTakeHomeNew : netMonthlyTakeHomeOld;
  const effectiveTaxPct = effectiveTaxRate(totalIncomeTax, grossAnnualSalary);

  // Primary output value for platform consistency
  const primaryOutput = netMonthlyTakeHome;

  // 5. DECISION ENGINE & SCORES
  // Salary Health Score (0-100)
  const takeHomeRatioPct = annualCtc > 0 ? (netAnnualTakeHome / annualCtc) * 100 : 0;
  const pfRatioPct = grossAnnualSalary > 0 ? (totalEmployeePfAnnual / grossAnnualSalary) * 100 : 0;

  let healthScore = 50;
  if (takeHomeRatioPct >= 80) healthScore += 25;
  else if (takeHomeRatioPct >= 70) healthScore += 15;
  else if (takeHomeRatioPct >= 60) healthScore += 10;

  if (effectiveTaxPct <= 10) healthScore += 15;
  else if (effectiveTaxPct <= 20) healthScore += 10;

  if (pfRatioPct >= 5) healthScore += 10;
  healthScore = Math.min(100, Math.max(0, Math.round(healthScore)));

  let healthStatus = 'Good';
  let healthColor = 'text-semantic-success border-semantic-success/30 bg-semantic-success/10';
  if (healthScore >= 80) {
    healthStatus = 'Excellent';
    healthColor = 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
  } else if (healthScore < 65 && healthScore >= 50) {
    healthStatus = 'Moderate';
    healthColor = 'text-semantic-warning border-semantic-warning/30 bg-semantic-warning/10';
  } else if (healthScore < 50) {
    healthStatus = 'Attention Needed';
    healthColor = 'text-semantic-danger border-semantic-danger/30 bg-semantic-danger/10';
  }

  // Hero Verdict Description
  let heroText = '';
  let healthDesc = '';

  if (taxSavingsAnnual === 0) {
    heroText = `Both tax regimes yield equal net monthly take-home of ₹${netMonthlyTakeHome.toLocaleString('en-IN')}.`;
    healthDesc = `Under your current salary of ₹${(annualCtc / 100000).toFixed(2)} Lakhs, your tax outgo is identical in both Old and New Tax Regimes.`;
  } else if (isNewCheaper) {
    heroText = `New Tax Regime yields ₹${netMonthlyTakeHomeNew.toLocaleString('en-IN')}/mo in-hand (saves ₹${taxSavingsAnnual.toLocaleString('en-IN')}/yr in tax).`;
    healthDesc = `Under Budget 2024 New Tax Regime (₹75k standard deduction), lower slab rates save you ₹${taxSavingsMonthly.toLocaleString('en-IN')}/month compared to the Old Regime.`;
  } else {
    heroText = `Old Tax Regime yields ₹${netMonthlyTakeHomeOld.toLocaleString('en-IN')}/mo in-hand (saves ₹${taxSavingsAnnual.toLocaleString('en-IN')}/yr in tax).`;
    healthDesc = `Your Chapter VI-A tax deductions (₹${totalDeductionsClaimedOld.toLocaleString('en-IN')}) reduce tax outgo under the Old Regime by ₹${taxSavingsMonthly.toLocaleString('en-IN')}/month.`;
  }

  // 6. MULTI-SCENARIO COMPENSATION MODELING (+10%, +20%, Tax-Optimized)
  const scenarios = [
    {
      id: 'current',
      name: 'Current Salary',
      badge: 'Base',
      ctc: annualCtc,
      monthlyTakeHome: netMonthlyTakeHome,
      annualTakeHome: netAnnualTakeHome,
      annualTax: totalIncomeTax,
      annualDeductions: totalDeductions,
      monthlyDiff: 0,
    },
  ];

  // Scenario +10%
  const ctc10 = Math.round(annualCtc * 1.1);
  const basic10 = Math.round(ctc10 * (numBasicPct / 100));
  const epf10 = employerEpfIncluded ? Math.round(basic10 * 0.12) : 0;
  const gross10 = calculateGrossSalary({ ctc: ctc10, employerEpf: epf10 });
  const eeEpf10 = Math.round(basic10 * (epfPercent / 100));
  const tax10Res = calculateIncomeTaxForRegime({
    taxableIncome: Math.max(0, gross10 - stdDedNew),
    regime: 'new',
  });
  const ded10 = tax10Res.totalIncomeTax + eeEpf10 + numPt + numOtherDed;
  const netAnn10 = calculateNetSalary(gross10, ded10);
  const netMth10 = calculateMonthlySalary(netAnn10);
  scenarios.push({
    id: 'plus10',
    name: '+10% Increment',
    badge: '+10% Hike',
    ctc: ctc10,
    monthlyTakeHome: netMth10,
    annualTakeHome: netAnn10,
    annualTax: tax10Res.totalIncomeTax,
    annualDeductions: ded10,
    monthlyDiff: netMth10 - netMonthlyTakeHome,
  });

  // Scenario +20%
  const ctc20 = Math.round(annualCtc * 1.2);
  const basic20 = Math.round(ctc20 * (numBasicPct / 100));
  const epf20 = employerEpfIncluded ? Math.round(basic20 * 0.12) : 0;
  const gross20 = calculateGrossSalary({ ctc: ctc20, employerEpf: epf20 });
  const eeEpf20 = Math.round(basic20 * (epfPercent / 100));
  const tax20Res = calculateIncomeTaxForRegime({
    taxableIncome: Math.max(0, gross20 - stdDedNew),
    regime: 'new',
  });
  const ded20 = tax20Res.totalIncomeTax + eeEpf20 + numPt + numOtherDed;
  const netAnn20 = calculateNetSalary(gross20, ded20);
  const netMth20 = calculateMonthlySalary(netAnn20);
  scenarios.push({
    id: 'plus20',
    name: '+20% Increment',
    badge: '+20% Hike',
    ctc: ctc20,
    monthlyTakeHome: netMth20,
    annualTakeHome: netAnn20,
    annualTax: tax20Res.totalIncomeTax,
    annualDeductions: ded20,
    monthlyDiff: netMth20 - netMonthlyTakeHome,
  });

  // Scenario Tax-Optimized (Re-allocating basic to 50% & claiming optimal regime)
  const optTax = isNewCheaper ? totalTaxNew : totalTaxOld;
  const optNetAnn = isNewCheaper ? netAnnualTakeHomeNew : netAnnualTakeHomeOld;
  const optNetMth = calculateMonthlySalary(optNetAnn);
  scenarios.push({
    id: 'optimized',
    name: 'Tax-Optimized',
    badge: 'Best Regime',
    ctc: annualCtc,
    monthlyTakeHome: optNetMth,
    annualTakeHome: optNetAnn,
    annualTax: optTax,
    annualDeductions: isNewCheaper ? totalDeductionsNew : totalDeductionsOld,
    monthlyDiff: optNetMth - netMonthlyTakeHome,
  });

  // 7. DYNAMIC INSIGHT CARDS GENERATION
  const dynamicInsights = [
    {
      title: 'Effective Tax Rate',
      value: `${effectiveTaxPct}%`,
      description: `You pay ₹${totalIncomeTax.toLocaleString('en-IN')} in total annual income tax on a gross salary of ₹${grossAnnualSalary.toLocaleString('en-IN')}.`,
      icon: '📊',
    },
    {
      title: 'Monthly Cash Credit',
      value: `₹${netMonthlyTakeHome.toLocaleString('en-IN')}`,
      description: `Every month, ${takeHomeRatioPct.toFixed(1)}% of your gross CTC reaches your bank account after all mandatory statutory deductions.`,
      icon: '💳',
    },
    {
      title: 'Mandatory EPF Wealth Accumulation',
      value: `₹${(totalEmployeePfAnnual + employerEpf).toLocaleString('en-IN')}/yr`,
      description: `Combined Employee EPF (₹${totalEmployeePfAnnual.toLocaleString('en-IN')}) and Employer EPF (₹${employerEpf.toLocaleString('en-IN')}) build a compounding tax-free retirement fund.`,
      icon: '🏦',
    },
    {
      title: 'Tax Regime Verdict',
      value: isNewCheaper ? 'New Tax Regime' : 'Old Tax Regime',
      description: taxSavingsAnnual > 0
        ? `${isNewCheaper ? 'New' : 'Old'} Regime provides ₹${taxSavingsAnnual.toLocaleString('en-IN')} annual tax savings for your income profile.`
        : 'Both tax regimes result in identical tax outgo for your current inputs.',
      icon: '⚖️',
    },
  ];

  return {
    primaryOutput,
    grossAnnualCtc: annualCtc,
    grossMonthlyCtc: Math.round(annualCtc / 12),
    basicSalary,
    employerEpf,
    totalEmployerContribution,
    grossAnnualSalary,
    grossMonthlySalary,
    employeeEpfAnnual,
    employeeVpfAnnual,
    totalEmployeePfAnnual,
    professionalTax: numPt,
    otherDeductions: numOtherDed,

    // New Regime Outputs
    newRegime: {
      standardDeduction: stdDedNew,
      taxableIncome: taxNewRes.taxableIncome,
      rawTax: taxNewRes.rawTax,
      rebate87a: taxNewRes.rebate87a,
      marginalRelief: taxNewRes.marginalRelief,
      cessAmount: taxNewRes.cessAmount,
      totalIncomeTax: totalTaxNew,
      totalDeductions: totalDeductionsNew,
      netAnnualTakeHome: netAnnualTakeHomeNew,
      netMonthlyTakeHome: netMonthlyTakeHomeNew,
    },

    // Old Regime Outputs
    oldRegime: {
      standardDeduction: stdDedOld,
      deductionsClaimed: totalDeductionsClaimedOld,
      taxableIncome: taxOldRes.taxableIncome,
      rawTax: taxOldRes.rawTax,
      rebate87a: taxOldRes.rebate87a,
      cessAmount: taxOldRes.cessAmount,
      totalIncomeTax: totalTaxOld,
      totalDeductions: totalDeductionsOld,
      netAnnualTakeHome: netAnnualTakeHomeOld,
      netMonthlyTakeHome: netMonthlyTakeHomeOld,
    },

    // Selected Active Regime Summary
    activeRegime: regime,
    totalIncomeTax,
    totalDeductions,
    netAnnualTakeHome,
    netMonthlyTakeHome,
    effectiveTaxPct,

    // Decision Intelligence
    recommendedRegime,
    isNewCheaper,
    taxSavingsAnnual,
    taxSavingsMonthly,
    healthScore,
    healthStatus,
    healthColor,
    heroText,
    healthDesc,

    // Scenarios & Insights
    scenarios,
    dynamicInsights,
    taxYearAssumption: INDIAN_TAX_RATES_FY2025_26.financialYear,
  };
}