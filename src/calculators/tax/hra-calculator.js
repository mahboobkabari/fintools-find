/**
 * Institutional HRA Tax Exemption Calculator Engine (FY 2025-26 / AY 2026-27)
 * Computes tax-exempt HRA and taxable HRA per Indian Income Tax Act Section 10(13A) & Rule 2A.
 * Evaluates the 3 statutory limits, Old vs New Regime tax impact, rent scenario simulations,
 * and dynamic financial intelligence.
 *
 * Sourced from src/data/tax-rates/indianTaxRates.js & src/calculators/core/salaryUtils.js
 */

import { INDIAN_TAX_RATES_FY2025_26 } from '../../data/tax-rates/indianTaxRates.js';
import { calculateHRAExemption, calculateIncomeTaxForRegime } from '../core/salaryUtils.js';

/**
 * Pure calculation function for HRA Tax Exemption and Decision Support.
 *
 * @param {Object} inputs
 * @param {number} [inputs.basicSalary=600000] - Basic Salary (Annual or Monthly) (₹)
 * @param {number} [inputs.daAmount=0] - Dearness Allowance (DA) (Annual or Monthly) (₹)
 * @param {number} [inputs.hraReceived=240000] - HRA Received (Annual or Monthly) (₹)
 * @param {number} [inputs.rentPaid=300000] - Rent Paid (Annual or Monthly) (₹)
 * @param {boolean|string} [inputs.isMetro=true] - Metro city boolean (Delhi, Mumbai, Kolkata, Chennai)
 * @param {string} [inputs.inputPeriod='annual'] - 'annual' or 'monthly'
 * @param {number} [inputs.grossSalary=1200000] - Total Gross Annual Salary (₹)
 * @param {number} [inputs.otherDeductionsOld=150000] - Other Old Regime deductions (80C, 80D, 24b) (₹)
 * @param {string} [inputs.regime='old'] - Active selected regime ('old' or 'new')
 * @returns {Object} Structured numerical outputs and decision intelligence
 */
export function calculateHraCalculator(inputs = {}) {
  const {
    basicSalary = 600000,
    daAmount = 0,
    hraReceived = 240000,
    rentPaid = 300000,
    isMetro = true,
    inputPeriod = 'annual',
    grossSalary = 1200000,
    otherDeductionsOld = 150000,
    regime = 'old',
  } = inputs;

  const isMonthly = inputPeriod === 'monthly';
  const multiplier = isMonthly ? 12 : 1;

  const numBasicAnnual = Math.max(0, (Number(basicSalary) || 0) * multiplier);
  const numDaAnnual = Math.max(0, (Number(daAmount) || 0) * multiplier);
  const numHraAnnual = Math.max(0, (Number(hraReceived) || 0) * multiplier);
  const numRentAnnual = Math.max(0, (Number(rentPaid) || 0) * multiplier);
  const numGrossAnnual = Math.max(0, (Number(grossSalary) || 0) * multiplier);
  const numOtherDedOld = Math.max(0, Number(otherDeductionsOld) || 0);

  const metroBool = isMetro === true || isMetro === 'true' || isMetro === 'yes';

  // 1. CORE SECTION 10(13A) RULE 2A EXEMPTION ENGINE
  const hraRes = calculateHRAExemption({
    basicSalary: numBasicAnnual,
    daAmount: numDaAnnual,
    hraReceived: numHraAnnual,
    rentPaid: numRentAnnual,
    isMetro: metroBool,
    taxRatesData: INDIAN_TAX_RATES_FY2025_26,
  });

  const exemptHraAnnual = hraRes.exemptHra;
  const taxableHraAnnual = hraRes.taxableHra;
  const exemptHraMonthly = Math.round(exemptHraAnnual / 12);
  const taxableHraMonthly = Math.round(taxableHraAnnual / 12);

  // Primary Output: Prominent Question 1 "How much of my HRA is actually tax-exempt?"
  const primaryOutput = isMonthly ? exemptHraMonthly : exemptHraAnnual;

  // 2. TAX IMPACT & REGIME COMPARISON ENGINE
  // Old Regime Tax with HRA Exemption
  const stdDedOld = INDIAN_TAX_RATES_FY2025_26.oldRegime.standardDeduction;
  const totalDeductionsOld = stdDedOld + exemptHraAnnual + numOtherDedOld;
  const taxableIncomeOld = Math.max(0, numGrossAnnual - totalDeductionsOld);
  const taxOldRes = calculateIncomeTaxForRegime({
    taxableIncome: taxableIncomeOld,
    regime: 'old',
    taxRatesData: INDIAN_TAX_RATES_FY2025_26,
  });
  const totalTaxOld = taxOldRes.totalIncomeTax;

  // Old Regime Tax WITHOUT HRA Exemption (to compute exact HRA tax savings)
  const taxableIncomeOldNoHra = Math.max(0, numGrossAnnual - (stdDedOld + numOtherDedOld));
  const taxOldNoHraRes = calculateIncomeTaxForRegime({
    taxableIncome: taxableIncomeOldNoHra,
    regime: 'old',
    taxRatesData: INDIAN_TAX_RATES_FY2025_26,
  });
  const totalTaxOldNoHra = taxOldNoHraRes.totalIncomeTax;

  // Exact Tax Savings from HRA under Old Regime
  const estimatedTaxSavedAnnual = Math.max(0, totalTaxOldNoHra - totalTaxOld);
  const estimatedTaxSavedMonthly = Math.round(estimatedTaxSavedAnnual / 12);

  // New Regime Tax (HRA Exemption is ZERO)
  const stdDedNew = INDIAN_TAX_RATES_FY2025_26.newRegime.standardDeduction;
  const taxableIncomeNew = Math.max(0, numGrossAnnual - stdDedNew);
  const taxNewRes = calculateIncomeTaxForRegime({
    taxableIncome: taxableIncomeNew,
    regime: 'new',
    taxRatesData: INDIAN_TAX_RATES_FY2025_26,
  });
  const totalTaxNew = taxNewRes.totalIncomeTax;

  // Regime Winner & Comparison
  const isOldCheaper = totalTaxOld < totalTaxNew;
  const recommendedRegime = isOldCheaper ? 'old' : 'new';
  const taxDiffAnnual = Math.abs(totalTaxOld - totalTaxNew);
  const taxDiffMonthly = Math.round(taxDiffAnnual / 12);

  // Active Selected Regime Stats
  const activeIsOld = regime === 'old';

  // 3. DECISION ENGINE & SCORES
  const exemptionRatioPct = numHraAnnual > 0 ? Number(((exemptHraAnnual / numHraAnnual) * 100).toFixed(1)) : 0;

  let hraBenefitScore = 50;
  if (exemptionRatioPct >= 95) hraBenefitScore = 100;
  else if (exemptionRatioPct >= 75) hraBenefitScore = 85;
  else if (exemptionRatioPct >= 50) hraBenefitScore = 70;
  else if (exemptionRatioPct > 0) hraBenefitScore = 55;
  else hraBenefitScore = 20;

  let healthStatus = 'Optimal';
  let healthColor = 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
  if (hraBenefitScore < 50) {
    healthStatus = 'Sub-optimal';
    healthColor = 'text-semantic-danger border-semantic-danger/30 bg-semantic-danger/10';
  } else if (hraBenefitScore < 75) {
    healthStatus = 'Partial Exemption';
    healthColor = 'text-semantic-warning border-semantic-warning/30 bg-semantic-warning/10';
  }

  // Binding Limit Text Explanation
  let bindingLimitText = '';
  let bindingLimitShort = '';
  if (hraRes.bindingLimit === 'actual_hra') {
    bindingLimitText = 'Limited by Actual HRA received from employer.';
    bindingLimitShort = 'Actual HRA Limit';
  } else if (hraRes.bindingLimit === 'rent_minus_10pct') {
    bindingLimitText = 'Limited by Rent Paid minus 10% of Basic Salary.';
    bindingLimitShort = 'Rent minus 10% Basic';
  } else {
    bindingLimitText = `Limited by ${metroBool ? '50%' : '40%'} of Basic Salary (${metroBool ? 'Metro' : 'Non-Metro'} Ceiling).`;
    bindingLimitShort = `${metroBool ? '50%' : '40%'} Basic Salary Ceiling`;
  }

  let heroText = '';
  let healthDesc = '';
  if (exemptHraAnnual === 0) {
    heroText = '₹0 HRA Tax Exemption. Full HRA received is taxable.';
    healthDesc = 'Your rent paid does not exceed 10% of your Basic Salary, resulting in zero statutory HRA exemption under Section 10(13A).';
  } else {
    heroText = `₹${exemptHraAnnual.toLocaleString('en-IN')}/yr HRA is Tax-Exempt (${exemptionRatioPct}% of HRA received).`;
    healthDesc = `${bindingLimitText} You save an estimated ₹${estimatedTaxSavedAnnual.toLocaleString('en-IN')}/year in income tax under the Old Tax Regime.`;
  }

  // 4. RENT SCENARIO SIMULATOR (6 Scenarios)
  const currentRentMonthly = Math.round(numRentAnnual / 12);
  const scenarioConfigs = [
    { id: 'current', name: 'Current Rent', badge: 'Base', rentMonthly: currentRentMonthly, isMetro: metroBool },
    { id: 'plus5k', name: 'Rent +₹5,000/mo', badge: '+₹5k Rent', rentMonthly: currentRentMonthly + 5000, isMetro: metroBool },
    { id: 'plus10k', name: 'Rent +₹10,000/mo', badge: '+₹10k Rent', rentMonthly: currentRentMonthly + 10000, isMetro: metroBool },
    { id: 'minus5k', name: 'Lower Rent (-₹5k/mo)', badge: '-₹5k Rent', rentMonthly: Math.max(0, currentRentMonthly - 5000), isMetro: metroBool },
    { id: 'non_metro', name: 'Non-Metro Scenario', badge: '40% Basic Cap', rentMonthly: currentRentMonthly, isMetro: false },
    { id: 'metro', name: 'Metro Scenario', badge: '50% Basic Cap', rentMonthly: currentRentMonthly, isMetro: true },
  ];

  const scenarios = scenarioConfigs.map((sc) => {
    const scRentAnnual = sc.rentMonthly * 12;
    const scHraRes = calculateHRAExemption({
      basicSalary: numBasicAnnual,
      daAmount: numDaAnnual,
      hraReceived: numHraAnnual,
      rentPaid: scRentAnnual,
      isMetro: sc.isMetro,
      taxRatesData: INDIAN_TAX_RATES_FY2025_26,
    });

    // Old Regime Tax under scenario
    const scTotalDedOld = stdDedOld + scHraRes.exemptHra + numOtherDedOld;
    const scTaxableOld = Math.max(0, numGrossAnnual - scTotalDedOld);
    const scTaxOldRes = calculateIncomeTaxForRegime({
      taxableIncome: scTaxableOld,
      regime: 'old',
      taxRatesData: INDIAN_TAX_RATES_FY2025_26,
    });
    const scTaxSavedAnnual = Math.max(0, totalTaxOldNoHra - scTaxOldRes.totalIncomeTax);

    const addlRentCostAnnual = scRentAnnual - numRentAnnual;
    const addlTaxSavedAnnual = scTaxSavedAnnual - estimatedTaxSavedAnnual;
    const netFinancialImpactAnnual = addlTaxSavedAnnual - addlRentCostAnnual;
    const netFinancialImpactMonthly = Math.round(netFinancialImpactAnnual / 12);

    return {
      id: sc.id,
      name: sc.name,
      badge: sc.badge,
      monthlyRent: sc.rentMonthly,
      annualRent: scRentAnnual,
      exemptHraAnnual: scHraRes.exemptHra,
      taxableHraAnnual: scHraRes.taxableHra,
      estimatedTaxSavedAnnual: scTaxSavedAnnual,
      addlRentCostAnnual,
      addlTaxSavedAnnual,
      netFinancialImpactAnnual,
      netFinancialImpactMonthly,
    };
  });

  // 5. DYNAMIC INSIGHTS GENERATION
  const dynamicInsights = [
    {
      title: 'Tax-Exempt HRA Amount',
      value: `₹${exemptHraAnnual.toLocaleString('en-IN')}/yr`,
      description: `Under Section 10(13A) Rule 2A, ${exemptionRatioPct}% of your received HRA is exempt from income tax.`,
      icon: '🛡️',
    },
    {
      title: 'Estimated Annual Tax Saved',
      value: `₹${estimatedTaxSavedAnnual.toLocaleString('en-IN')}/yr`,
      description: `Claiming your HRA exemption under the Old Tax Regime saves ₹${estimatedTaxSavedMonthly.toLocaleString('en-IN')}/month in tax outgo.`,
      icon: '💰',
    },
    {
      title: 'Statutory Binding Limit',
      value: bindingLimitShort,
      description: bindingLimitText,
      icon: '⚖️',
    },
    {
      title: 'Regime Evaluation',
      value: activeIsOld ? 'Old Tax Regime Active' : 'New Tax Regime Selected',
      description: activeIsOld
        ? `HRA exemption reduces your Old Regime taxable income to ₹${taxableIncomeOld.toLocaleString('en-IN')}.`
        : 'Note: HRA tax exemption is unavailable under the default New Tax Regime (Budget 2024).',
      icon: '📊',
    },
  ];

  return {
    primaryOutput,
    basicSalaryAnnual: numBasicAnnual,
    daAmountAnnual: numDaAnnual,
    hraSalaryAnnual: hraRes.hraSalary,
    hraReceivedAnnual: numHraAnnual,
    rentPaidAnnual: numRentAnnual,
    grossSalaryAnnual: numGrossAnnual,
    isMetro: metroBool,
    inputPeriod,

    // Rule 2A 3 Statutory Limits
    rule2A: {
      actualHra: hraRes.actualHra,
      rentMinusTenPercent: hraRes.rentMinusTenPercent,
      salaryCap: hraRes.salaryCap,
      limit50Pct: hraRes.limit50Pct,
      limit40Pct: hraRes.limit40Pct,
      exemptHra: exemptHraAnnual,
      taxableHra: taxableHraAnnual,
      bindingLimit: hraRes.bindingLimit,
      bindingLimitText,
      bindingLimitShort,
      exemptionRatioPct,
    },

    // Monthly breakdown
    exemptHraMonthly,
    taxableHraMonthly,
    estimatedTaxSavedAnnual,
    estimatedTaxSavedMonthly,

    // Old vs New Tax Regime Comparison
    oldRegime: {
      standardDeduction: stdDedOld,
      exemptHra: exemptHraAnnual,
      taxableHra: taxableHraAnnual,
      totalDeductions: totalDeductionsOld,
      taxableIncome: taxableIncomeOld,
      totalIncomeTax: totalTaxOld,
      estimatedTaxSaved: estimatedTaxSavedAnnual,
    },
    newRegime: {
      standardDeduction: stdDedNew,
      exemptHra: 0,
      taxableHra: numHraAnnual,
      taxableIncome: taxableIncomeNew,
      totalIncomeTax: totalTaxNew,
      estimatedTaxSaved: 0,
    },
    isOldCheaper,
    recommendedRegime,
    taxDiffAnnual,
    taxDiffMonthly,

    // Intelligence & Scores
    hraBenefitScore,
    healthStatus,
    healthColor,
    heroText,
    healthDesc,

    // Scenario Simulator & Insights
    scenarios,
    dynamicInsights,
    taxYearAssumption: INDIAN_TAX_RATES_FY2025_26.financialYear,
  };
}