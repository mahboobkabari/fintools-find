/**
 * Flagship Sukanya Samriddhi Yojana (SSY) Math & Decision Engine (V3)
 * Implements Ministry of Finance Sukanya Samriddhi Account Scheme 2019 rules:
 * - 15-Year Contribution Window & 21-Year Statutory Account Maturity Horizon
 * - 8.2% p.a. Government-notified annual interest rate (March 31st compounding)
 * - Section 80C ₹1,50,000 annual statutory deposit cap validation
 * - Section 10(11A) 100% Tax-Exempt EEE status (zero tax on deposits, interest, or maturity)
 * - 50% Partial Higher Education Withdrawal at Age 18
 * - Guaranteed SSY vs Market-Linked Equity SIP Comparison Engine
 * - Reverse Goal Solver for Target Education Corpus (e.g. ₹50 Lakhs)
 * - Inflation-Adjusted Real Purchasing Power
 * - 21-Year Accumulation Schedule Generation
 *
 * @param {Object} inputs
 * @param {number} [inputs.annualDeposit=150000] - Annual deposit amount (₹)
 * @param {number} [inputs.girlChildAge=1] - Current age of girl child (0 to 10 years eligible)
 * @param {number} [inputs.rate=8.2] - Government notified interest rate (% p.a.)
 * @param {boolean} [inputs.allowEducationWithdrawal=false] - 50% education withdrawal toggle at age 18
 * @param {number} [inputs.marginalTaxRate=30] - Investor marginal tax rate (%) for Sec 80C savings
 * @param {number} [inputs.expectedSipReturn=12.0] - Expected Equity SIP return (% p.a.)
 * @param {number} [inputs.inflationRate=5.0] - Inflation rate (%) for real purchasing power
 * @param {string} [inputs.currency='INR'] - Currency code ('INR' | 'USD' | 'EUR' | 'GBP')
 * @returns {Object} Structured Sukanya Samriddhi Yojana decision model
 */
export function calculateSsyCalculator(inputs = {}) {
  const {
    annualDeposit = 150000,
    girlChildAge = 1,
    rate = 8.2,
    allowEducationWithdrawal = false,
    marginalTaxRate = 30,
    expectedSipReturn = 12.0,
    inflationRate = 5.0,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & STATUTORY AUDIT
  const rawDeposit = Math.max(0, Number(annualDeposit) || 0);
  const childAge = Math.max(0, Math.min(10, Number(girlChildAge) || 0));
  const ssyRate = Math.max(0, Math.min(20, Number(rate) || 0));
  const allowWithdrawal = allowEducationWithdrawal === true || allowEducationWithdrawal === 'true';
  const taxSlabPct = Math.max(0, Math.min(50, Number(marginalTaxRate) || 0));
  const sipReturnPct = Math.max(0, Math.min(30, Number(expectedSipReturn) || 0));
  const inflPct = Math.max(0, Math.min(20, Number(inflationRate) || 0));

  // Statutory Annual Deposit Cap: Min ₹250, Max ₹1,50,000 (Sec 80C)
  const isCapped = rawDeposit > 150000;
  const deposit = Math.min(150000, rawDeposit);

  // Handle Edge Case: Zero Deposit
  if (deposit === 0) {
    return createZeroSsyResult(currency);
  }

  // 2. 21-YEAR ACCUMULATION SCHEDULE & COMPOUNDING ENGINE
  const contributionYears = 15;
  const maturityHorizonYears = 21;
  const yearlyRows = [];

  let currentBalance = 0;
  let totalDeposits = 0;
  let totalInterest = 0;
  let totalWithdrawal = 0;
  let educationWithdrawalAmount = 0;

  // Track Equity SIP Simulation concurrently
  let sipBalance = 0;

  for (let y = 1; y <= maturityHorizonYears; y++) {
    const ageInYear = childAge + (y - 1);
    const yearDeposit = y <= contributionYears ? deposit : 0;
    totalDeposits += yearDeposit;

    let preCompBalance = currentBalance + yearDeposit;

    // Check for 50% Higher Education Withdrawal at Age 18
    let yearWithdrawal = 0;
    if (allowWithdrawal && ageInYear === 18 && currentBalance > 0) {
      yearWithdrawal = Math.round(currentBalance * 0.50);
      educationWithdrawalAmount = yearWithdrawal;
      totalWithdrawal += yearWithdrawal;
      preCompBalance = Math.max(0, preCompBalance - yearWithdrawal);
    }

    // March 31st Annual Compounding Crediting
    const yearInterest = Math.round(preCompBalance * (ssyRate / 100));
    totalInterest += yearInterest;
    currentBalance = preCompBalance + yearInterest;

    // Equity SIP Compounding
    const sipPreBalance = sipBalance + yearDeposit;
    const sipInterest = Math.round(sipPreBalance * (sipReturnPct / 100));
    sipBalance = sipPreBalance + sipInterest;

    yearlyRows.push({
      year: y,
      girlChildAge: ageInYear,
      depositPaid: yearDeposit,
      totalDepositsPaid: totalDeposits,
      educationWithdrawal: yearWithdrawal,
      interestEarned: yearInterest,
      cumulativeInterest: totalInterest,
      endingBalance: currentBalance,
    });
  }

  const maturityValue = currentBalance;
  const grossMaturityPlusWithdrawal = maturityValue + totalWithdrawal;

  // 3. SECTION 80C & EEE TAX SAVINGS AUDIT
  const annualSec80cTaxSaved = Math.round(deposit * (taxSlabPct / 100));
  const totalSec80cTaxSaved = annualSec80cTaxSaved * contributionYears;

  // 4. GUARANTEED SSY vs MARKET-LINKED EQUITY SIP COMPARISON
  const sipFutureValue = sipBalance;
  const sipTotalInterest = Math.max(0, sipFutureValue - totalDeposits);
  const sipWealthDelta = Math.max(0, sipFutureValue - grossMaturityPlusWithdrawal);

  // 5. INFLATION-ADJUSTED REAL PURCHASING POWER
  const purchasingPower = Math.round(maturityValue / Math.pow(1 + inflPct / 100, maturityHorizonYears));

  // 6. REVERSE GOAL SOLVER (Annual deposit required for ₹50 Lakhs college fund)
  const targetCollegeFund50L = 5000000;
  const unitSim = runQuickSsySim(10000, ssyRate, allowWithdrawal, childAge);
  const maturityPer10k = unitSim.maturityValue;
  const requiredAnnualDepositFor50L = maturityPer10k > 0 ? Math.min(150000, Math.round((targetCollegeFund50L / maturityPer10k) * 10000)) : 0;

  // 7. SCENARIO MATRIX COMPARISON
  const scenarios = [
    {
      id: 'baseline',
      label: 'Current Setup',
      annualDeposit: deposit,
      allowWithdrawal,
      totalDeposits,
      ...runQuickSsySim(deposit, ssyRate, allowWithdrawal, childAge),
    },
    {
      id: 'max_80c',
      label: 'Max ₹1.5L/Yr Cap',
      annualDeposit: 150000,
      allowWithdrawal: false,
      totalDeposits: 150000 * 15,
      ...runQuickSsySim(150000, ssyRate, false, childAge),
    },
    {
      id: '1l_yr',
      label: '₹1 Lakh/Yr Goal',
      annualDeposit: 100000,
      allowWithdrawal: false,
      totalDeposits: 100000 * 15,
      ...runQuickSsySim(100000, ssyRate, false, childAge),
    },
    {
      id: 'edu_withdrawn',
      label: 'With 50% Edu Withdrawal',
      annualDeposit: deposit,
      allowWithdrawal: true,
      totalDeposits,
      ...runQuickSsySim(deposit, ssyRate, true, childAge),
    },
  ];

  // 8. HERO SUMMARY TEXT
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const heroText = `Your annual deposit of ${currencySymbol}${deposit.toLocaleString()}/yr at ${ssyRate.toFixed(2)}% p.a. accumulates a 100% tax-free maturity corpus of ${currencySymbol}${maturityValue.toLocaleString()} in 21 years (Total Interest: ${currencySymbol}${totalInterest.toLocaleString()}).`;

  return {
    annualDeposit: deposit,
    rawDeposit,
    isCapped,
    girlChildAge: childAge,
    rate: ssyRate,
    allowEducationWithdrawal: allowWithdrawal,
    marginalTaxRate: taxSlabPct,
    expectedSipReturn: sipReturnPct,
    inflationRate: inflPct,
    currency,

    // Primary Outputs
    primaryOutput: maturityValue,
    maturityValue,
    totalDeposits,
    totalInterest,
    totalWithdrawal,
    educationWithdrawalAmount,
    grossMaturityPlusWithdrawal,

    // Tax & EEE Audit
    annualSec80cTaxSaved,
    totalSec80cTaxSaved,

    // Equity SIP Comparison
    sipFutureValue,
    sipTotalInterest,
    sipWealthDelta,

    // Purchasing Power & Goal Solver
    purchasingPower,
    requiredAnnualDepositFor50L,

    // Schedules & Scenarios
    yearlyRows,
    scenarios,
    heroText,
  };
}

/**
 * Quick Helper for SSY Scenario Calculations
 */
function runQuickSsySim(deposit, rate, allowWithdrawal, childAge) {
  let balance = 0;
  let totalDeposits = 0;
  let totalInterest = 0;

  for (let y = 1; y <= 21; y++) {
    const ageInYear = childAge + (y - 1);
    const yearDeposit = y <= 15 ? deposit : 0;
    totalDeposits += yearDeposit;

    let preBalance = balance + yearDeposit;
    if (allowWithdrawal && ageInYear === 18 && balance > 0) {
      const w = Math.round(balance * 0.50);
      preBalance = Math.max(0, preBalance - w);
    }

    const yearInterest = Math.round(preBalance * (rate / 100));
    totalInterest += yearInterest;
    balance = preBalance + yearInterest;
  }

  return { maturityValue: balance, totalInterest };
}

/**
 * Fallback Engine Result for Zero Input
 */
function createZeroSsyResult(currency = 'INR') {
  return {
    annualDeposit: 0,
    rawDeposit: 0,
    isCapped: false,
    girlChildAge: 1,
    rate: 8.2,
    allowEducationWithdrawal: false,
    marginalTaxRate: 30,
    expectedSipReturn: 12.0,
    inflationRate: 5.0,
    currency,

    primaryOutput: 0,
    maturityValue: 0,
    totalDeposits: 0,
    totalInterest: 0,
    totalWithdrawal: 0,
    educationWithdrawalAmount: 0,
    grossMaturityPlusWithdrawal: 0,

    annualSec80cTaxSaved: 0,
    totalSec80cTaxSaved: 0,

    sipFutureValue: 0,
    sipTotalInterest: 0,
    sipWealthDelta: 0,

    purchasingPower: 0,
    requiredAnnualDepositFor50L: 0,

    yearlyRows: [],
    scenarios: [],
    heroText: `Please enter a valid annual deposit amount to compute your Sukanya Samriddhi Yojana maturity corpus.`,
  };
}
