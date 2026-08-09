/**
 * Flagship Post Office Monthly Income Scheme (POMIS) Math & Decision Engine (V3)
 * Implements National Savings (Monthly Income Account) Scheme, 2019 provisions:
 * - 7.4% p.a. Government-notified interest rate payable monthly
 * - 5-Year (60-month) statutory maturity period
 * - Statutory Account Deposit Caps: Single Account max ₹9,00,000 (₹9 Lakhs); Joint Account (up to 3 adults) max ₹15,00,000 (₹15 Lakhs)
 * - Minimum deposit ₹1,000 (multiples of ₹1,000)
 * - Premature Closure Penalties: 2% penalty between 1–3 years; 1% penalty between 3–5 years
 * - Income Tax audit on monthly interest payouts under investor's marginal tax slab
 * - POMIS vs Commercial Bank Tax Saver FD & Senior Citizens Savings Scheme (SCSS) monthly yield comparisons
 * - Inflation-adjusted real purchasing power payout model
 * - 60-Month interactive cash flow timeline schedule generation
 *
 * @param {Object} inputs
 * @param {number} [inputs.depositAmount=900000] - Deposit amount (₹)
 * @param {string} [inputs.accountType='single'] - Account type ('single' | 'joint')
 * @param {number} [inputs.rate=7.4] - Government notified interest rate (% p.a.)
 * @param {number} [inputs.marginalTaxRate=30] - Investor marginal tax rate (%)
 * @param {number} [inputs.expectedFdRate=6.75] - Bank FD benchmark rate (% p.a.)
 * @param {number} [inputs.scssRate=8.2] - SCSS benchmark rate (% p.a.)
 * @param {number} [inputs.inflationRate=5.0] - Inflation rate (%)
 * @param {string} [inputs.currency='INR'] - Currency code ('INR' | 'USD' | 'EUR' | 'GBP')
 * @returns {Object} Structured POMIS decision model
 */
export function calculatePomisCalculator(inputs = {}) {
  const {
    depositAmount = 900000,
    accountType = 'single',
    rate = 7.4,
    marginalTaxRate = 30,
    expectedFdRate = 6.75,
    scssRate = 8.2,
    inflationRate = 5.0,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & STATUTORY CAP ENFORCEMENT
  const rawDeposit = Math.max(0, Number(depositAmount) || 0);
  const type = accountType === 'joint' ? 'joint' : 'single';
  const pomisRate = Math.max(0, Math.min(20, Number(rate) || 0));
  const taxSlabPct = Math.max(0, Math.min(50, Number(marginalTaxRate) || 0));
  const fdRatePct = Math.max(0, Math.min(20, Number(expectedFdRate) || 0));
  const scssRatePct = Math.max(0, Math.min(20, Number(scssRate) || 0));
  const inflPct = Math.max(0, Math.min(20, Number(inflationRate) || 0));
  const tenureYears = 5;

  const effectiveCap = type === 'joint' ? 1500000 : 900000;
  const isCapExceeded = rawDeposit > effectiveCap;
  const sanitizedDeposit = Math.min(rawDeposit, effectiveCap);

  // Handle Edge Case: Zero Deposit
  if (sanitizedDeposit === 0) {
    return createZeroPomisResult(type, effectiveCap, currency);
  }

  // 2. MONTHLY INTEREST MATH
  // Statutory Formula: Monthly Interest = Math.round((Deposit * Rate / 100) / 12)
  const monthlyIncome = Math.round((sanitizedDeposit * (pomisRate / 100)) / 12);
  const annualIncome = monthlyIncome * 12;
  const total5YearInterest = monthlyIncome * 60;
  const maturityAmount = sanitizedDeposit; // Principal returned in full at Month 60

  // 3. TAX AUDIT
  const annualTaxEstimate = Math.round(annualIncome * (taxSlabPct / 100));
  const netMonthlyIncomeAfterTax = Math.round(monthlyIncome * (1 - taxSlabPct / 100));

  // 4. PREMATURE CLOSURE PENALTY MODEL
  // - Before 1 year: Closure not allowed
  // - 1 to 3 years: 2% deduction on principal deposit
  // - 3 to 5 years: 1% deduction on principal deposit
  const premature1To3YearPenalty = Math.round(sanitizedDeposit * 0.02);
  const premature1To3YearRefund = sanitizedDeposit - premature1To3YearPenalty;
  const premature3To5YearPenalty = Math.round(sanitizedDeposit * 0.01);
  const premature3To5YearRefund = sanitizedDeposit - premature3To5YearPenalty;

  // 5. YIELD COMPARISONS (vs Bank FD & SCSS)
  const fdMonthlyIncome = Math.round((sanitizedDeposit * (fdRatePct / 100)) / 12);
  const pomisVsFdDeltaMonthly = Math.max(0, monthlyIncome - fdMonthlyIncome);

  const scssMonthlyEquivalent = Math.round((sanitizedDeposit * (scssRatePct / 100)) / 12);
  const scssVsPomisDeltaMonthly = Math.max(0, scssMonthlyEquivalent - monthlyIncome);

  // 6. INFLATION-ADJUSTED REAL PURCHASING POWER AT YEAR 5
  const purchasingPowerMonthly = Math.round(monthlyIncome / Math.pow(1 + inflPct / 100, tenureYears));

  // 7. 60-MONTH CASH FLOW TIMELINE SCHEDULE
  const yearlySchedule = [];
  let cumInterest = 0;

  for (let m = 1; m <= 60; m++) {
    cumInterest += monthlyIncome;
    const isYearEnd = m % 12 === 0;
    if (isYearEnd) {
      const yearNumber = m / 12;
      yearlySchedule.push({
        year: yearNumber,
        month: m,
        annualInterest: annualIncome,
        cumulativeInterest: cumInterest,
        principalRemaining: sanitizedDeposit,
      });
    }
  }

  // 8. SCENARIO MATRIX COMPARISON
  const scenarios = [
    {
      id: 'baseline',
      label: 'Selected Deposit (' + (type === 'joint' ? 'Joint' : 'Single') + ')',
      deposit: sanitizedDeposit,
      accountType: type,
      rate: pomisRate,
      monthlyIncome,
      total5YearInterest,
    },
    {
      id: 'max_single',
      label: 'Max Single Account (₹9 Lakhs)',
      deposit: 900000,
      accountType: 'single',
      rate: pomisRate,
      ...runQuickPomisSim(900000, pomisRate),
    },
    {
      id: 'max_joint',
      label: 'Max Joint Account (₹15 Lakhs)',
      deposit: 1500000,
      accountType: 'joint',
      rate: pomisRate,
      ...runQuickPomisSim(1500000, pomisRate),
    },
    {
      id: 'moderate_500k',
      label: 'Moderate Deposit (₹5 Lakhs)',
      deposit: 500000,
      accountType: 'single',
      rate: pomisRate,
      ...runQuickPomisSim(500000, pomisRate),
    },
  ];

  // 9. HERO SUMMARY TEXT
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const heroText = `Your POMIS deposit of ${currencySymbol}${sanitizedDeposit.toLocaleString()} (${type === 'joint' ? 'Joint Account' : 'Single Account'}) at ${pomisRate.toFixed(2)}% p.a. generates ${currencySymbol}${monthlyIncome.toLocaleString()} guaranteed monthly interest income (${currencySymbol}${total5YearInterest.toLocaleString()} total interest over 5 years).`;

  return {
    depositAmount: sanitizedDeposit,
    rawDepositAmount: rawDeposit,
    accountType: type,
    rate: pomisRate,
    tenureYears,
    marginalTaxRate: taxSlabPct,
    expectedFdRate: fdRatePct,
    scssRate: scssRatePct,
    inflationRate: inflPct,
    currency,

    // Primary Outputs
    primaryOutput: monthlyIncome,
    monthlyIncome,
    annualIncome,
    total5YearInterest,
    maturityAmount,

    // Cap Enforcement Status
    effectiveCap,
    isCapExceeded,

    // Tax Audit
    annualTaxEstimate,
    netMonthlyIncomeAfterTax,

    // Premature Closure Penalties
    premature1To3YearPenalty,
    premature1To3YearRefund,
    premature3To5YearPenalty,
    premature3To5YearRefund,

    // Comparisons & Purchasing Power
    fdMonthlyIncome,
    pomisVsFdDeltaMonthly,
    scssMonthlyEquivalent,
    scssVsPomisDeltaMonthly,
    purchasingPowerMonthly,

    // Schedules & Scenarios
    yearlySchedule,
    scenarios,
    heroText,
  };
}

/**
 * Quick Helper for POMIS Scenario Calculations
 */
function runQuickPomisSim(deposit, rate) {
  const monthlyIncome = Math.round((deposit * (rate / 100)) / 12);
  const total5YearInterest = monthlyIncome * 60;
  return { monthlyIncome, total5YearInterest };
}

/**
 * Fallback Engine Result for Zero Input
 */
function createZeroPomisResult(accountType = 'single', effectiveCap = 900000, currency = 'INR') {
  return {
    depositAmount: 0,
    rawDepositAmount: 0,
    accountType,
    rate: 7.4,
    tenureYears: 5,
    marginalTaxRate: 30,
    expectedFdRate: 6.75,
    scssRate: 8.2,
    inflationRate: 5.0,
    currency,

    primaryOutput: 0,
    monthlyIncome: 0,
    annualIncome: 0,
    total5YearInterest: 0,
    maturityAmount: 0,

    effectiveCap,
    isCapExceeded: false,

    annualTaxEstimate: 0,
    netMonthlyIncomeAfterTax: 0,

    premature1To3YearPenalty: 0,
    premature1To3YearRefund: 0,
    premature3To5YearPenalty: 0,
    premature3To5YearRefund: 0,

    fdMonthlyIncome: 0,
    pomisVsFdDeltaMonthly: 0,
    scssMonthlyEquivalent: 0,
    scssVsPomisDeltaMonthly: 0,
    purchasingPowerMonthly: 0,

    yearlySchedule: [],
    scenarios: [],
    heroText: 'Please enter a valid deposit amount to compute your Post Office Monthly Income Scheme payouts.',
  };
}
