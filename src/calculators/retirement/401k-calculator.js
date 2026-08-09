import { inflationAdjustedValue, wealthMultiplier } from '../core/investmentUtils.js';

/**
 * Institutional Flagship 401(k) Retirement Decision Engine (Math Engine V3)
 * Computes multi-decade 401(k) wealth accumulation, tiered employer matching,
 * IRS annual contribution limits ($23,500 base + $7,500 catch-up for age 50+),
 * Pre-Tax Traditional vs. Roth 401(k) tax trade-off analysis, inflation-adjusted purchasing power,
 * and year-by-year accumulation schedules.
 *
 * @param {Object} inputs
 * @param {number} [inputs.currentAge=30] - Current age in years
 * @param {number} [inputs.retirementAge=65] - Target retirement age in years
 * @param {number} [inputs.annualSalary=90000] - Current gross annual salary ($)
 * @param {number} [inputs.contributionPercent=8] - Employee salary contribution rate (%)
 * @param {number} [inputs.employerMatchPercent=50] - Employer match rate on eligible contribution (e.g. 50%)
 * @param {number} [inputs.employerMatchLimit=6] - Maximum salary % eligible for match (e.g. 6%)
 * @param {number} [inputs.currentBalance=25000] - Existing 401(k) account balance ($)
 * @param {number} [inputs.expectedReturn=7] - Expected annual investment return (%)
 * @param {number} [inputs.annualSalaryIncrease=3] - Expected annual salary escalation (%)
 * @param {number} [inputs.currentTaxRate=24] - Current marginal income tax rate (%)
 * @param {number} [inputs.retirementTaxRate=15] - Expected tax rate in retirement (%)
 * @param {number} [inputs.inflationRate=2.5] - Expected annual inflation rate (%)
 * @returns {Object} Structured 401(k) analytical model
 */
export function calculate401kCalculator(inputs = {}) {
  const {
    currentAge = 30,
    retirementAge = 65,
    annualSalary = 90000,
    contributionPercent = 8,
    employerMatchPercent = 50,
    employerMatchLimit = 6,
    currentBalance = 25000,
    expectedReturn = 7,
    annualSalaryIncrease = 3,
    currentTaxRate = 24,
    retirementTaxRate = 15,
    inflationRate = 2.5,
  } = inputs;

  // 1. INPUT SANITIZATION & BOUNDARY CHECKS
  const startAge = Math.max(18, Math.min(80, Number(currentAge) || 30));
  const endAge = Math.max(startAge + 1, Math.min(90, Number(retirementAge) || 65));
  const yearsInvested = endAge - startAge;

  const salary = Math.max(0, Number(annualSalary) || 0);
  const empContribPct = Math.max(0, Math.min(100, Number(contributionPercent) || 0));
  const matchPct = Math.max(0, Math.min(100, Number(employerMatchPercent) || 0));
  const matchLimit = Math.max(0, Math.min(100, Number(employerMatchLimit) || 0));
  const initBalance = Math.max(0, Number(currentBalance) || 0);
  const returnRate = Math.max(0, Math.min(30, Number(expectedReturn) || 0));
  const salaryIncRate = Math.max(0, Math.min(20, Number(annualSalaryIncrease) || 0));
  const taxCurrent = Math.max(0, Math.min(50, Number(currentTaxRate) || 0));
  const taxRetire = Math.max(0, Math.min(50, Number(retirementTaxRate) || 0));
  const infRate = Math.max(0, Math.min(15, Number(inflationRate) || 0));

  // Handle Edge Case: Zero Salary or Zero Years Invested
  if (salary === 0 && initBalance === 0) {
    return createZero401kResult();
  }

  // 2. CONSTANTS & IRS STATUTORY LIMITS (2025/2026 Standards)
  const IRS_BASE_LIMIT = 23500;
  const IRS_CATCHUP_LIMIT = 7500;

  // 3. MULTI-YEAR ACCUMULATION SIMULATION ENGINE
  let runningTradBalance = initBalance;
  let runningRothBalance = initBalance;
  let runningSalary = salary;

  let totalEmployeeContrib = 0;
  let totalEmployerMatch = 0;
  let totalMaxPossibleMatch = 0;
  let totalRothEmployeeContrib = 0;

  const yearlyRows = [];

  for (let year = 1; year <= yearsInvested; year++) {
    const ageForYear = startAge + year - 1;
    const isCatchUpEligible = ageForYear >= 50;
    const irsCapForYear = isCatchUpEligible ? (IRS_BASE_LIMIT + IRS_CATCHUP_LIMIT) : IRS_BASE_LIMIT;

    // Traditional Employee Contribution ($) capped at IRS Annual Limit
    let rawEmpContribYear = runningSalary * (empContribPct / 100);
    const empContribYear = Math.min(rawEmpContribYear, irsCapForYear);

    // Employer Match Calculation ($)
    const matchEligiblePct = Math.min(empContribPct, matchLimit);
    const employerMatchYear = runningSalary * (matchEligiblePct / 100) * (matchPct / 100);

    // Max possible match if employee contributed at least `matchLimit` %
    const maxPossibleMatchYear = runningSalary * (matchLimit / 100) * (matchPct / 100);

    totalEmployeeContrib += empContribYear;
    totalEmployerMatch += employerMatchYear;
    totalMaxPossibleMatch += maxPossibleMatchYear;

    // Growth for Traditional 401(k)
    const annualTotalAdded = empContribYear + employerMatchYear;
    const interestEarnedYear = Math.round((runningTradBalance + annualTotalAdded / 2) * (returnRate / 100));
    runningTradBalance = Math.round(runningTradBalance + annualTotalAdded + interestEarnedYear);

    // Growth for Roth 401(k) (Roth contribution made post-tax; Employer match remains pre-tax in Trad sub-account)
    const rothEmpContribYear = empContribYear * (1 - taxCurrent / 100);
    totalRothEmployeeContrib += rothEmpContribYear;
    const rothTotalAdded = rothEmpContribYear + employerMatchYear;
    const rothInterestEarned = Math.round((runningRothBalance + rothTotalAdded / 2) * (returnRate / 100));
    runningRothBalance = Math.round(runningRothBalance + rothTotalAdded + rothInterestEarned);

    yearlyRows.push({
      year,
      age: ageForYear,
      salary: Math.round(runningSalary),
      employeeContrib: Math.round(empContribYear),
      employerMatch: Math.round(employerMatchYear),
      totalContrib: Math.round(annualTotalAdded),
      interestEarned: Math.max(0, interestEarnedYear),
      endingBalance: Math.max(0, runningTradBalance),
      isCatchUpEligible,
      irsCapForYear,
    });

    // Salary growth for next projection year
    runningSalary = runningSalary * (1 + salaryIncRate / 100);
  }

  // 4. SUMMARY METRICS & AUDITS
  const finalBalance = Math.max(0, runningTradBalance);
  const totalContributions = Math.round(totalEmployeeContrib + totalEmployerMatch);
  const totalGrowth = Math.max(0, finalBalance - initBalance - totalContributions);

  // Match Capture Audit
  const missedEmployerMatch = Math.max(0, Math.round(totalMaxPossibleMatch - totalEmployerMatch));
  const matchCapturePct = totalMaxPossibleMatch > 0
    ? Math.min(100, Math.round((totalEmployerMatch / totalMaxPossibleMatch) * 100))
    : 100;
  const isMatchMaximized = empContribPct >= matchLimit;

  // 5. PRE-TAX vs ROTH TAX IMPACT COMPARISON
  const tradAfterTaxCorpus = Math.round(finalBalance * (1 - taxRetire / 100));
  const rothAfterTaxCorpus = Math.round(runningRothBalance);
  const rothAdvantage = Math.round(rothAfterTaxCorpus - tradAfterTaxCorpus);
  const recommendedAccountType = taxCurrent > taxRetire ? 'Traditional Pre-Tax 401(k)' : 'Roth 401(k)';

  // 6. INFLATION-ADJUSTED PURCHASING POWER & MULTIPLIER
  const realValResult = inflationAdjustedValue(finalBalance, infRate, yearsInvested);
  const multiplier = wealthMultiplier(finalBalance, totalEmployeeContrib + initBalance);

  // 7. SIDE-BY-SIDE SCENARIO MATRIX
  const scenarios = [
    {
      id: 'baseline',
      label: 'Baseline (Current Setup)',
      contribPct: empContribPct,
      contribAmountYear1: Math.round(Math.min(salary * (empContribPct / 100), IRS_BASE_LIMIT)),
      finalBalance,
      afterTaxBalance: tradAfterTaxCorpus,
    },
    {
      id: 'plus_2_pct',
      label: `+2% Extra (${empContribPct + 2}%)`,
      contribPct: empContribPct + 2,
      contribAmountYear1: Math.round(Math.min(salary * ((empContribPct + 2) / 100), IRS_BASE_LIMIT)),
      ...runQuick401kSim(startAge, endAge, salary, empContribPct + 2, matchPct, matchLimit, initBalance, returnRate, salaryIncRate),
    },
    {
      id: 'max_match',
      label: `Full Match Cap (${matchLimit}%)`,
      contribPct: matchLimit,
      contribAmountYear1: Math.round(Math.min(salary * (matchLimit / 100), IRS_BASE_LIMIT)),
      ...runQuick401kSim(startAge, endAge, salary, matchLimit, matchPct, matchLimit, initBalance, returnRate, salaryIncRate),
    },
    {
      id: 'max_irs_limit',
      label: 'Max IRS Ceiling ($23.5k)',
      contribPct: Math.round((IRS_BASE_LIMIT / (salary || 1)) * 100),
      contribAmountYear1: IRS_BASE_LIMIT,
      ...runQuick401kSim(startAge, endAge, salary, 100, matchPct, matchLimit, initBalance, returnRate, salaryIncRate, IRS_BASE_LIMIT),
    },
  ];

  // 8. HERO SUMMARY TEXT
  let heroText = '';
  if (!isMatchMaximized && missedEmployerMatch > 0) {
    heroText = `Increasing your contribution to ${matchLimit}% unlocks $${missedEmployerMatch.toLocaleString()} in 100% free employer matching money over your career!`;
  } else {
    heroText = `Your projected 401(k) balance at age ${endAge} is $${finalBalance.toLocaleString()}, generating an estimated after-tax retirement corpus of $${tradAfterTaxCorpus.toLocaleString()}.`;
  }

  return {
    currentAge: startAge,
    retirementAge: endAge,
    yearsInvested,
    annualSalary: salary,
    contributionPercent: empContribPct,
    employerMatchPercent: matchPct,
    employerMatchLimit: matchLimit,
    currentBalance: initBalance,
    expectedReturn: returnRate,
    annualSalaryIncrease: salaryIncRate,
    currentTaxRate: taxCurrent,
    retirementTaxRate: taxRetire,
    inflationRate: infRate,

    // Primary Outputs
    primaryOutput: finalBalance,
    finalBalance,
    totalEmployeeContributions: Math.round(totalEmployeeContrib),
    totalEmployerMatch: Math.round(totalEmployerMatch),
    totalContributions,
    totalGrowth,
    multiplier,

    // Match Capture Audit
    totalMaxPossibleMatch: Math.round(totalMaxPossibleMatch),
    missedEmployerMatch,
    matchCapturePct,
    isMatchMaximized,

    // Pre-Tax vs Roth Comparison
    tradAfterTaxCorpus,
    rothAfterTaxCorpus,
    rothAdvantage,
    recommendedAccountType,

    // Real Value
    realValue: realValResult.realValue,

    // Schedules & Scenarios
    yearlyRows,
    scenarios,
    heroText,
  };
}

/**
 * Quick Helper for 401(k) Scenario Matrix Calculations
 */
function runQuick401kSim(startAge, endAge, salary, empPct, matchPct, matchLimit, initBal, returnRate, salaryIncRate, forceEmpDollarCap = null) {
  const years = endAge - startAge;
  let bal = initBal;
  let currSal = salary;

  for (let y = 1; y <= years; y++) {
    const age = startAge + y - 1;
    const irsCap = age >= 50 ? 31000 : 23500;

    let empDollar = forceEmpDollarCap ? forceEmpDollarCap : currSal * (empPct / 100);
    empDollar = Math.min(empDollar, irsCap);

    const matchEligiblePct = Math.min(empPct, matchLimit);
    const matchDollar = currSal * (matchEligiblePct / 100) * (matchPct / 100);

    const totalAdded = empDollar + matchDollar;
    const interest = (bal + totalAdded / 2) * (returnRate / 100);
    bal = bal + totalAdded + interest;
    currSal = currSal * (1 + salaryIncRate / 100);
  }

  const finalBal = Math.max(0, Math.round(bal));
  return {
    finalBalance: finalBal,
    afterTaxBalance: Math.round(finalBal * 0.85),
  };
}

/**
 * Fallback Engine Result for Zero Input
 */
function createZero401kResult() {
  return {
    currentAge: 30,
    retirementAge: 65,
    yearsInvested: 35,
    annualSalary: 0,
    contributionPercent: 8,
    employerMatchPercent: 50,
    employerMatchLimit: 6,
    currentBalance: 0,
    expectedReturn: 7,
    annualSalaryIncrease: 3,
    currentTaxRate: 24,
    retirementTaxRate: 15,
    inflationRate: 2.5,

    primaryOutput: 0,
    finalBalance: 0,
    totalEmployeeContributions: 0,
    totalEmployerMatch: 0,
    totalContributions: 0,
    totalGrowth: 0,
    multiplier: 1,

    totalMaxPossibleMatch: 0,
    missedEmployerMatch: 0,
    matchCapturePct: 100,
    isMatchMaximized: true,

    tradAfterTaxCorpus: 0,
    rothAfterTaxCorpus: 0,
    rothAdvantage: 0,
    recommendedAccountType: 'Traditional Pre-Tax 401(k)',

    realValue: 0,
    yearlyRows: [],
    scenarios: [],
    heroText: 'Please enter a valid salary or current 401(k) balance to compute your retirement growth.',
  };
}