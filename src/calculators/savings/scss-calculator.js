/**
 * Flagship Senior Citizens Savings Scheme (SCSS) Math & Decision Engine (V3)
 * Implements Ministry of Finance Senior Citizens Savings Scheme Rules 2019:
 * - Statutory Deposit Caps: ₹30 Lakhs (Individual) / ₹60 Lakhs (Joint with Spouse)
 * - 8.2% p.a. Government-notified interest rate (Quarterly Calendar Payouts)
 * - Section 80C ₹1,50,000 tax deduction in deposit year
 * - Section 80TTB ₹50,000 senior citizen interest tax exemption audit
 * - Section 194A Statutory TDS Tax Auditor (₹50,000 cap & Form 15H support)
 * - Premature Closure Penalty Tiers (1.5% for 1Y-2Y, 1.0% for 2Y-5Y)
 * - Guaranteed Sovereign SCSS vs Senior Citizen Bank FD Comparison Engine
 * - Inflation-Adjusted Real Income Purchasing Power
 * - 20-Quarter Cash Flow Payout Schedule Generation
 *
 * @param {Object} inputs
 * @param {number} [inputs.depositAmount=3000000] - Deposit amount (₹)
 * @param {'individual'|'joint'} [inputs.accountType='individual'] - Account type (Individual vs Joint with Spouse)
 * @param {'age_60_plus'|'vrs_55_60'|'defense_50_plus'} [inputs.eligibilityCategory='age_60_plus'] - Eligibility category
 * @param {number} [inputs.rate=8.2] - Government notified interest rate (% p.a.)
 * @param {number} [inputs.marginalTaxRate=20] - Investor marginal tax rate (%)
 * @param {boolean} [inputs.hasPan=true] - Valid PAN furnished (10% vs 20% TDS)
 * @param {boolean} [inputs.hasForm15H=false] - Form 15H submitted (0% TDS)
 * @param {number} [inputs.prematureExitYears=0] - Premature exit year (0 = full 5Y maturity)
 * @param {number} [inputs.expectedFdRate=7.5] - Senior Citizen Bank FD rate (% p.a.)
 * @param {number} [inputs.inflationRate=5.0] - Inflation rate (%) for real purchasing power
 * @param {string} [inputs.currency='INR'] - Currency code ('INR' | 'USD' | 'EUR' | 'GBP')
 * @returns {Object} Structured Senior Citizens Savings Scheme decision model
 */
export function calculateScssCalculator(inputs = {}) {
  const {
    depositAmount = 3000000,
    accountType = 'individual',
    eligibilityCategory = 'age_60_plus',
    rate = 8.2,
    marginalTaxRate = 20,
    hasPan = true,
    hasForm15H = false,
    prematureExitYears = 0,
    expectedFdRate = 7.5,
    inflationRate = 5.0,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & STATUTORY CAP AUDIT
  const rawDeposit = Math.max(0, Number(depositAmount) || 0);
  const isJoint = accountType === 'joint';
  const statutoryMaxCap = isJoint ? 6000000 : 3000000;
  const isCapped = rawDeposit > statutoryMaxCap;
  const deposit = Math.min(statutoryMaxCap, rawDeposit);

  const scssRate = Math.max(0, Math.min(20, Number(rate) || 0));
  const taxSlabPct = Math.max(0, Math.min(50, Number(marginalTaxRate) || 0));
  const panBool = hasPan === true || hasPan === 'true' || hasPan === 'yes';
  const form15hBool = hasForm15H === true || hasForm15H === 'true';
  const exitYears = Math.max(0, Math.min(5, Number(prematureExitYears) || 0));
  const fdRatePct = Math.max(0, Math.min(20, Number(expectedFdRate) || 0));
  const inflPct = Math.max(0, Math.min(20, Number(inflationRate) || 0));

  // Handle Edge Case: Zero Deposit
  if (deposit === 0) {
    return createZeroScssResult(currency);
  }

  // 2. QUARTERLY INTEREST PAYOUT MATH (8.2% p.a. / 4)
  const quarterlyRate = (scssRate / 4) / 100;
  const quarterlyGrossPayout = Math.round(deposit * quarterlyRate);
  const annualGrossInterest = quarterlyGrossPayout * 4;
  const total5YearInterest = quarterlyGrossPayout * 20;

  // 3. TAX AUDIT: SECTION 80C, SECTION 80TTB & SECTION 194A TDS
  const sec80cClaimable = Math.min(150000, deposit);
  const sec80cTaxSaved = Math.round(sec80cClaimable * (taxSlabPct / 100));

  // Section 80TTB Exemption (Up to ₹50,000 interest tax-free for senior citizens)
  const sec80ttbExemptInterest = Math.min(50000, annualGrossInterest);
  const taxableAnnualInterest = Math.max(0, annualGrossInterest - sec80ttbExemptInterest);
  const annualIncomeTaxPayable = Math.round(taxableAnnualInterest * (taxSlabPct / 100));

  // Section 194A TDS Threshold Audit (₹50,000 cap for senior citizens)
  const tdsThreshold = currency === 'INR' ? 50000 : Infinity;
  const isTdsApplicable = currency === 'INR' && !form15hBool && annualGrossInterest > tdsThreshold;
  const tdsRatePct = panBool ? 10 : 20;

  let estimatedAnnualTds = 0;
  if (isTdsApplicable) {
    estimatedAnnualTds = Math.round(annualGrossInterest * (tdsRatePct / 100));
  }
  const estimatedQuarterlyTds = Math.round(estimatedAnnualTds / 4);
  const netQuarterlyPayout = Math.max(0, quarterlyGrossPayout - estimatedQuarterlyTds);

  // 4. PREMATURE CLOSURE PENALTY TIERS
  let penaltyRatePct = 0;
  let penaltyAmount = 0;
  let netPrincipalRefund = deposit;
  let isPrematureExit = exitYears > 0 && exitYears < 5;

  if (isPrematureExit) {
    if (exitYears < 1.0) {
      // Exit before 1 year: All interest paid recovered from principal
      const quartersElapsed = Math.floor(exitYears * 4);
      penaltyAmount = quarterlyGrossPayout * quartersElapsed;
      penaltyRatePct = 100; // 100% interest clawback
    } else if (exitYears >= 1.0 && exitYears < 2.0) {
      // Exit between 1Y and 2Y: 1.5% of principal deducted
      penaltyRatePct = 1.5;
      penaltyAmount = Math.round(deposit * 0.015);
    } else if (exitYears >= 2.0 && exitYears < 5.0) {
      // Exit between 2Y and 5Y: 1.0% of principal deducted
      penaltyRatePct = 1.0;
      penaltyAmount = Math.round(deposit * 0.010);
    }
    netPrincipalRefund = Math.max(0, deposit - penaltyAmount);
  }

  // 5. GUARANTEED SCSS vs SENIOR CITIZEN BANK FD COMPARISON
  const fdQuarterlyRate = (fdRatePct / 4) / 100;
  const fdQuarterlyPayout = Math.round(deposit * fdQuarterlyRate);
  const fdTotal5YearInterest = fdQuarterlyPayout * 20;
  const scssIncomeDelta = Math.max(0, total5YearInterest - fdTotal5YearInterest);

  // 6. INFLATION-ADJUSTED REAL PURCHASING POWER
  const purchasingPowerQuarterly = Math.round(quarterlyGrossPayout / Math.pow(1 + inflPct / 100, 5));

  // 7. 20-QUARTER CASH FLOW PAYOUT SCHEDULE
  const quarterlyRows = [];
  const calendarQuarters = ['April (Q1)', 'July (Q2)', 'October (Q3)', 'January (Q4)'];
  let cumInterestRunning = 0;

  for (let q = 1; q <= 20; q++) {
    cumInterestRunning += quarterlyGrossPayout;
    const qIndex = (q - 1) % 4;
    const yearNum = Math.ceil(q / 4);

    quarterlyRows.push({
      quarter: q,
      year: yearNum,
      calendarMonth: calendarQuarters[qIndex],
      principalBalance: deposit,
      grossPayout: quarterlyGrossPayout,
      sec80ttbExempt: Math.round(sec80ttbExemptInterest / 4),
      estimatedTds: estimatedQuarterlyTds,
      netPayout: netQuarterlyPayout,
      cumulativeInterest: cumInterestRunning,
    });
  }

  // 8. SCENARIO MATRIX COMPARISON
  const scenarios = [
    {
      id: 'baseline',
      label: 'Baseline Setup (₹30L Individual)',
      deposit,
      accountType,
      rate: scssRate,
      ...runQuickScssSim(deposit, scssRate),
    },
    {
      id: 'joint_spouse',
      label: 'Max Joint Account (₹60L)',
      deposit: 6000000,
      accountType: 'joint',
      rate: scssRate,
      ...runQuickScssSim(6000000, scssRate),
    },
    {
      id: 'moderate_15l',
      label: 'Moderate Deposit (₹15L)',
      deposit: 1500000,
      accountType: 'individual',
      rate: scssRate,
      ...runQuickScssSim(1500000, scssRate),
    },
    {
      id: 'exit_2y',
      label: 'Premature Exit (2 Years)',
      deposit,
      accountType,
      rate: scssRate,
      ...runQuickScssSim(deposit, scssRate, 2.0),
    },
  ];

  // 9. HERO SUMMARY TEXT
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const heroText = `Your SCSS deposit of ${currencySymbol}${deposit.toLocaleString()} at ${scssRate.toFixed(2)}% p.a. generates a guaranteed quarterly passive pension of ${currencySymbol}${quarterlyGrossPayout.toLocaleString()}/quarter (${currencySymbol}${annualGrossInterest.toLocaleString()}/year) for 5 years.`;

  return {
    depositAmount: deposit,
    rawDeposit,
    isCapped,
    statutoryMaxCap,
    accountType,
    eligibilityCategory,
    rate: scssRate,
    marginalTaxRate: taxSlabPct,
    hasPan: panBool,
    hasForm15H: form15hBool,
    prematureExitYears: exitYears,
    expectedFdRate: fdRatePct,
    inflationRate: inflPct,
    currency,

    // Primary Outputs
    primaryOutput: quarterlyGrossPayout,
    quarterlyGrossPayout,
    annualGrossInterest,
    total5YearInterest,

    // Tax & Exemption Audit
    sec80cClaimable,
    sec80cTaxSaved,
    sec80ttbExemptInterest,
    taxableAnnualInterest,
    annualIncomeTaxPayable,
    isTdsApplicable,
    tdsRatePct,
    estimatedAnnualTds,
    estimatedQuarterlyTds,
    netQuarterlyPayout,

    // Premature Exit Tiers
    isPrematureExit,
    penaltyRatePct,
    penaltyAmount,
    netPrincipalRefund,

    // Senior Citizen Bank FD Comparison
    fdQuarterlyPayout,
    fdTotal5YearInterest,
    scssIncomeDelta,

    // Purchasing Power & Schedules
    purchasingPowerQuarterly,
    quarterlyRows,
    scenarios,
    heroText,
  };
}

/**
 * Quick Helper for SCSS Scenario Calculations
 */
function runQuickScssSim(deposit, rate, prematureYears = 0) {
  const quarterlyGrossPayout = Math.round(deposit * ((rate / 4) / 100));
  const annualGrossInterest = quarterlyGrossPayout * 4;
  const total5YearInterest = quarterlyGrossPayout * 20;
  return { quarterlyGrossPayout, annualGrossInterest, total5YearInterest };
}

/**
 * Fallback Engine Result for Zero Input
 */
function createZeroScssResult(currency = 'INR') {
  return {
    depositAmount: 0,
    rawDeposit: 0,
    isCapped: false,
    statutoryMaxCap: 3000000,
    accountType: 'individual',
    eligibilityCategory: 'age_60_plus',
    rate: 8.2,
    marginalTaxRate: 20,
    hasPan: true,
    hasForm15H: false,
    prematureExitYears: 0,
    expectedFdRate: 7.5,
    inflationRate: 5.0,
    currency,

    primaryOutput: 0,
    quarterlyGrossPayout: 0,
    annualGrossInterest: 0,
    total5YearInterest: 0,

    sec80cClaimable: 0,
    sec80cTaxSaved: 0,
    sec80ttbExemptInterest: 0,
    taxableAnnualInterest: 0,
    annualIncomeTaxPayable: 0,
    isTdsApplicable: false,
    tdsRatePct: 10,
    estimatedAnnualTds: 0,
    estimatedQuarterlyTds: 0,
    netQuarterlyPayout: 0,

    isPrematureExit: false,
    penaltyRatePct: 0,
    penaltyAmount: 0,
    netPrincipalRefund: 0,

    fdQuarterlyPayout: 0,
    fdTotal5YearInterest: 0,
    scssIncomeDelta: 0,

    purchasingPowerQuarterly: 0,
    quarterlyRows: [],
    scenarios: [],
    heroText: `Please enter a valid deposit amount to compute your Senior Citizens Savings Scheme quarterly income.`,
  };
}
