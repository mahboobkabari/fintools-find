import { PROVIDENT_FUND_CONFIG } from '../configs/providentFundConfig.js';
import { inflationAdjustedValue, wealthMultiplier } from '../core/investmentUtils.js';

/**
 * Institutional Flagship EPF & VPF Retirement Decision Engine
 * Computes EPF maturity balance, EPS pension split, Voluntary VPF top-up, Section 10(11) tax thresholds, and multi-scenario projections.
 *
 * @param {Object} inputs
 * @param {number} [inputs.monthlyBasicSalary=50000] - Primary monthly basic salary (₹)
 * @param {number} [inputs.monthlyDa=0] - Dearness Allowance (₹)
 * @param {number} [inputs.currentAge=25] - Current age in years
 * @param {number} [inputs.retirementAge=58] - Target retirement age in years (EPFO standard is 58)
 * @param {number} [inputs.epfInterestRate=8.25] - Assumed annual EPFO interest rate (%)
 * @param {number} [inputs.annualSalaryIncrease=5] - Expected annual salary growth (%)
 * @param {number} [inputs.currentEpfBalance=0] - Existing EPF balance (₹)
 * @param {string} [inputs.vpfContributionType='percentage'] - 'percentage' | 'fixed_amount'
 * @param {number} [inputs.vpfValue=0] - Voluntary VPF contribution (% of basic or ₹/mo)
 * @param {string} [inputs.calculationMode='forward'] - Mode: 'forward' | 'reverse_vpf'
 * @param {number} [inputs.targetVpfCorpus=10000000] - Target additional VPF corpus for reverse solver (₹)
 * @param {number} [inputs.inflationRate=6] - Expected annual inflation rate (%)
 * @returns {Object} Complete structured EPF & VPF retirement analytical model
 */
export function calculateProvidentFundCalculator(inputs = {}) {
  const {
    monthlyBasicSalary = 50000,
    monthlyDa = 0,
    currentAge = 25,
    retirementAge = 58,
    epfInterestRate = PROVIDENT_FUND_CONFIG.epfoInterestRate,
    annualSalaryIncrease = 5,
    currentEpfBalance = 0,
    vpfContributionType = 'percentage',
    vpfValue = 0,
    calculationMode = 'forward',
    targetVpfCorpus = 10000000,
    inflationRate = 6,
  } = inputs;

  // 1. INPUT SANITIZATION & VALIDATION
  const numBasic = Math.max(0, Number(monthlyBasicSalary) || 0);
  const numDa = Math.max(0, Number(monthlyDa) || 0);
  const numCurrentAge = Math.max(18, Math.min(70, Number(currentAge) || 25));
  const numRetireAge = Math.max(numCurrentAge + 1, Math.min(75, Number(retirementAge) || 58));
  const yearsInvested = numRetireAge - numCurrentAge;

  const rateInput = epfInterestRate !== undefined && !isNaN(Number(epfInterestRate)) ? Number(epfInterestRate) : PROVIDENT_FUND_CONFIG.epfoInterestRate;
  const ratePct = Math.max(0, Math.min(20, rateInput));
  const salIncPct = Math.max(0, Math.min(30, Number(annualSalaryIncrease) || 0));
  const initBalance = Math.max(0, Number(currentEpfBalance) || 0);
  const numVpfVal = Math.max(0, Number(vpfValue) || 0);
  const targetVpf = Math.max(0, Number(targetVpfCorpus) || 0);
  const infRate = Math.max(0, Math.min(25, Number(inflationRate) || 0));

  // Handle Edge Case: Zero Basic Salary
  if (numBasic + numDa === 0) {
    return createZeroSalaryResult(numCurrentAge, numRetireAge, ratePct);
  }

  // 2. REVERSE VPF SOLVER MODE
  let solvedVpfValue = numVpfVal;
  if (calculationMode === 'reverse_vpf') {
    if (targetVpf === 0) {
      solvedVpfValue = 0;
    } else {
      solvedVpfValue = solveRequiredVpfMonthlyInternal({
        targetVpfCorpus: targetVpf,
        monthlyBasicSalary: numBasic + numDa,
        yearsInvested,
        ratePct,
        salIncPct,
      });
    }
  }

  const effectiveVpfValue = solvedVpfValue;

  // 3. FORWARD EPF & VPF SIMULATION EXECUTION
  const simResult = runForwardEpfSimulation({
    monthlyBasicSalary: numBasic + numDa,
    yearsInvested,
    ratePct,
    salIncPct,
    initBalance,
    vpfContributionType: calculationMode === 'reverse_vpf' ? 'fixed_amount' : vpfContributionType,
    vpfValue: effectiveVpfValue,
  });

  // 4. INFLATION REAL PURCHASING POWER
  const realValResult = inflationAdjustedValue(
    simResult.finalEpfBalance,
    infRate,
    yearsInvested
  );

  // 5. 4-SCENARIO VPF COMPARISON GRID (EPF Only vs +₹2k vs +₹5k vs +₹10k)
  const vpfScenarios = [0, 2000, 5000, 10000].map((extraVpf) => {
    const scSim = runForwardEpfSimulation({
      monthlyBasicSalary: numBasic + numDa,
      yearsInvested,
      ratePct,
      salIncPct,
      initBalance,
      vpfContributionType: 'fixed_amount',
      vpfValue: extraVpf,
    });

    return {
      vpfAmount: extraVpf,
      label: extraVpf === 0 ? 'EPF Only (0% VPF)' : `EPF + ₹${(extraVpf / 1000).toFixed(0)}k/mo VPF`,
      monthlyVpf: extraVpf,
      totalContribution: scSim.totalContribution,
      totalInterestEarned: scSim.totalInterestEarned,
      finalCorpus: scSim.finalEpfBalance,
      additionalCorpus: scSim.finalEpfBalance - simResult.epfOnlyCorpus,
    };
  });

  // 6. RATE SENSITIVITY ANALYSIS (Lower 7.25%, Base 8.25%, Higher 9.25%)
  const sensitivityScenarios = [-1.0, 0, 1.0].map((delta) => {
    const scRate = Math.max(0, ratePct + delta);
    const scSim = runForwardEpfSimulation({
      monthlyBasicSalary: numBasic + numDa,
      yearsInvested,
      ratePct: scRate,
      salIncPct,
      initBalance,
      vpfContributionType: calculationMode === 'reverse_vpf' ? 'fixed_amount' : vpfContributionType,
      vpfValue: effectiveVpfValue,
    });
    return {
      ratePct: scRate,
      label: delta === 0 ? `Declared Rate (${scRate}%)` : `${scRate}% p.a.`,
      finalCorpus: scSim.finalEpfBalance,
      totalInterestEarned: scSim.totalInterestEarned,
    };
  });

  const multiplier = wealthMultiplier(
    simResult.finalEpfBalance,
    simResult.totalContribution + initBalance
  );

  // Hero Summary Text
  let heroText = '';
  if (calculationMode === 'reverse_vpf' && targetVpf > 0) {
    heroText = `To accumulate an additional ₹${targetVpf.toLocaleString(
      'en-IN'
    )} VPF corpus by age ${numRetireAge}, contribute approximately ₹${effectiveVpfValue.toLocaleString(
      'en-IN'
    )}/mo in Voluntary Provident Fund (VPF).`;
  } else {
    heroText = `By age ${numRetireAge}, your combined EPF + VPF retirement corpus is projected to reach ₹${simResult.finalEpfBalance.toLocaleString(
      'en-IN'
    )} at an assumed EPFO interest rate of ${ratePct}%.`;
  }

  return {
    monthlyBasicSalary: numBasic,
    monthlyDa: numDa,
    totalBasicSalary: numBasic + numDa,
    currentAge: numCurrentAge,
    retirementAge: numRetireAge,
    yearsInvested,
    epfInterestRate: ratePct,
    annualSalaryIncrease: salIncPct,
    currentEpfBalance: initBalance,
    vpfContributionType,
    vpfValue: effectiveVpfValue,
    calculationMode,
    targetVpfCorpus: targetVpf,
    inflationRate: infRate,

    // Primary Outputs
    primaryOutput: simResult.finalEpfBalance,
    finalEpfBalance: simResult.finalEpfBalance,
    epfCorpus: simResult.epfCorpus,
    vpfCorpus: simResult.vpfCorpus,
    employerCorpus: simResult.employerCorpus,

    totalEmployeeContribution: simResult.totalEmployeeContrib,
    totalVpfContribution: simResult.totalVpfContrib,
    totalEmployerContribution: simResult.totalEmployerContrib,
    totalEpsContribution: simResult.totalEpsContrib,
    totalContribution: simResult.totalContribution,
    totalInterestEarned: simResult.totalInterestEarned,
    wealthMultiplier: multiplier,

    // Section 10(11) Tax Threshold Alert
    isSec10_11_Taxable: simResult.isSec10_11_Taxable,
    maxAnnualEmployeeContrib: simResult.maxAnnualEmployeeContrib,
    taxableEmployeeContribYearly: simResult.taxableEmployeeContribYearly,

    // Real Inflation Purchasing Power
    realValue: realValResult.realValue,
    purchasingPowerLoss: realValResult.purchasingPowerLoss,

    // Breakdown & Scenarios
    yearlyBreakdown: simResult.yearlyBreakdown,
    vpfScenarios,
    sensitivityScenarios,

    // Health Score & Status
    heroText,
    score: computeProvidentFundHealthScore(multiplier, yearsInvested, simResult.isSec10_11_Taxable),
    healthStatus: multiplier >= 3.0 ? 'Exceptional Retirement Wealth' : 'Solid EPF Accumulation',
  };
}

/**
 * Pure Forward EPFO & VPF Simulation Loop
 */
function runForwardEpfSimulation({
  monthlyBasicSalary,
  yearsInvested,
  ratePct,
  salIncPct,
  initBalance,
  vpfContributionType,
  vpfValue,
}) {
  const monthlyRate = ratePct / 100 / 12;

  let epfBalance = initBalance;
  let vpfBalance = 0;
  let employerBalance = 0;
  let currentBasic = monthlyBasicSalary;

  let totalEmployeeContrib = 0;
  let totalVpfContrib = 0;
  let totalEmployerContrib = 0;
  let totalEpsContrib = 0;

  let isSec10_11_Taxable = false;
  let maxAnnualEmployeeContrib = 0;

  // Track EPF-only simulation for baseline comparison
  let epfOnlyBalance = initBalance;

  const yearlyBreakdown = [];

  for (let yr = 1; yr <= yearsInvested; yr++) {
    // Monthly Contribution Formulation
    const empEpfMonthly = Math.round(currentBasic * 0.12);

    let vpfMonthly = 0;
    if (vpfContributionType === 'percentage') {
      vpfMonthly = Math.round(currentBasic * (vpfValue / 100));
    } else {
      vpfMonthly = Math.round(vpfValue);
    }

    const epsBasic = Math.min(currentBasic, PROVIDENT_FUND_CONFIG.statutoryRules.epsMaxWageCap);
    const epsMonthly = Math.round(epsBasic * (PROVIDENT_FUND_CONFIG.statutoryRules.epsPct / 100));
    const emprEpfMonthly = Math.max(0, Math.round(currentBasic * 0.12) - epsMonthly);

    const annualEmpTotalContrib = (empEpfMonthly + vpfMonthly) * 12;
    if (annualEmpTotalContrib > maxAnnualEmployeeContrib) {
      maxAnnualEmployeeContrib = annualEmpTotalContrib;
    }
    if (annualEmpTotalContrib > PROVIDENT_FUND_CONFIG.statutoryRules.sec10_11_tax_threshold) {
      isSec10_11_Taxable = true;
    }

    let yrEpfInterest = 0;
    let yrVpfInterest = 0;
    let yrEmprInterest = 0;
    let yrEpfOnlyInterest = 0;

    let yrEmpContrib = 0;
    let yrVpfContrib = 0;
    let yrEmprContrib = 0;
    let yrEpsContrib = 0;

    for (let m = 1; m <= 12; m++) {
      totalEmployeeContrib += empEpfMonthly;
      totalVpfContrib += vpfMonthly;
      totalEmployerContrib += emprEpfMonthly;
      totalEpsContrib += epsMonthly;

      yrEmpContrib += empEpfMonthly;
      yrVpfContrib += vpfMonthly;
      yrEmprContrib += emprEpfMonthly;
      yrEpsContrib += epsMonthly;

      epfBalance += empEpfMonthly;
      vpfBalance += vpfMonthly;
      employerBalance += emprEpfMonthly;

      epfOnlyBalance += empEpfMonthly + emprEpfMonthly;

      yrEpfInterest += epfBalance * monthlyRate;
      yrVpfInterest += vpfBalance * monthlyRate;
      yrEmprInterest += employerBalance * monthlyRate;

      yrEpfOnlyInterest += epfOnlyBalance * monthlyRate;
    }

    epfBalance += yrEpfInterest;
    vpfBalance += yrVpfInterest;
    employerBalance += yrEmprInterest;

    epfOnlyBalance += yrEpfOnlyInterest;

    yearlyBreakdown.push({
      year: yr,
      age: 25 + yr - 1,
      monthlyBasic: Math.round(currentBasic),
      employeeEpf: Math.round(yrEmpContrib),
      vpfContrib: Math.round(yrVpfContrib),
      employerEpf: Math.round(yrEmprContrib),
      epsContrib: Math.round(yrEpsContrib),
      yearlyInterest: Math.round(yrEpfInterest + yrVpfInterest + yrEmprInterest),
      closingBalance: Math.round(epfBalance + vpfBalance + employerBalance),
    });

    currentBasic = currentBasic * (1 + salIncPct / 100);
  }

  const finalEpfBalance = Math.round(epfBalance + vpfBalance + employerBalance);
  const totalContribSum = Math.round(
    totalEmployeeContrib + totalVpfContrib + totalEmployerContrib
  );
  const totalInterestEarned = Math.max(0, finalEpfBalance - initBalance - totalContribSum);

  return {
    finalEpfBalance,
    epfCorpus: Math.round(epfBalance),
    vpfCorpus: Math.round(vpfBalance),
    employerCorpus: Math.round(employerBalance),

    totalEmployeeContrib: Math.round(totalEmployeeContrib),
    totalVpfContrib: Math.round(totalVpfContrib),
    totalEmployerContrib: Math.round(totalEmployerContrib),
    totalEpsContrib: Math.round(totalEpsContrib),
    totalContribution: totalContribSum,
    totalInterestEarned: Math.round(totalInterestEarned),

    isSec10_11_Taxable,
    maxAnnualEmployeeContrib,
    taxableEmployeeContribYearly: Math.max(
      0,
      maxAnnualEmployeeContrib - PROVIDENT_FUND_CONFIG.statutoryRules.sec10_11_tax_threshold
    ),
    epfOnlyCorpus: Math.round(epfOnlyBalance),
    yearlyBreakdown,
  };
}

/**
 * Pure Binary Search Solver for Required Monthly VPF Contribution
 */
function solveRequiredVpfMonthlyInternal({
  targetVpfCorpus,
  monthlyBasicSalary,
  yearsInvested,
  ratePct,
  salIncPct,
}) {
  if (targetVpfCorpus <= 0) return 0;

  let low = 1;
  let high = targetVpfCorpus;
  let bestVpf = high;

  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const sim = runForwardEpfSimulation({
      monthlyBasicSalary,
      yearsInvested,
      ratePct,
      salIncPct,
      initBalance: 0,
      vpfContributionType: 'fixed_amount',
      vpfValue: mid,
    });

    if (Math.abs(sim.vpfCorpus - targetVpfCorpus) < 10) {
      bestVpf = mid;
      break;
    }

    if (sim.vpfCorpus < targetVpfCorpus) {
      low = mid;
    } else {
      high = mid;
      bestVpf = mid;
    }
  }

  return Math.round(bestVpf);
}

function computeProvidentFundHealthScore(multiplier, yearsInvested, isTaxable) {
  let score = 50;
  if (multiplier >= 3.5) score += 35;
  else if (multiplier >= 2.5) score += 20;
  else if (multiplier >= 1.5) score += 10;

  if (yearsInvested >= 20) score += 15;
  if (isTaxable) score -= 5; // Alert indicator for Sec 10(11) tax

  return Math.min(100, Math.max(0, Math.round(score)));
}

function createZeroSalaryResult(currentAge, retirementAge, ratePct) {
  return {
    monthlyBasicSalary: 0,
    monthlyDa: 0,
    totalBasicSalary: 0,
    currentAge,
    retirementAge,
    yearsInvested: retirementAge - currentAge,
    epfInterestRate: ratePct,
    annualSalaryIncrease: 0,
    currentEpfBalance: 0,
    vpfContributionType: 'percentage',
    vpfValue: 0,
    calculationMode: 'forward',
    targetVpfCorpus: 0,
    inflationRate: 6,
    primaryOutput: 0,
    finalEpfBalance: 0,
    epfCorpus: 0,
    vpfCorpus: 0,
    employerCorpus: 0,
    totalEmployeeContribution: 0,
    totalVpfContribution: 0,
    totalEmployerContribution: 0,
    totalEpsContribution: 0,
    totalContribution: 0,
    totalInterestEarned: 0,
    wealthMultiplier: 0,
    isSec10_11_Taxable: false,
    maxAnnualEmployeeContrib: 0,
    taxableEmployeeContribYearly: 0,
    realValue: 0,
    purchasingPowerLoss: 0,
    yearlyBreakdown: [],
    vpfScenarios: [],
    sensitivityScenarios: [],
    heroText: 'Please enter a valid monthly basic salary to compute EPF & VPF retirement corpus.',
    score: 0,
    healthStatus: 'Zero Salary Input',
  };
}