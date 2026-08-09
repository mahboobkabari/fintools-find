import { KVP_CONFIG } from '../configs/kvp-calculator.config.js';

/**
 * Flagship Kisan Vikas Patra (KVP) Math & Decision Engine (V3)
 * Implements National Savings (Kisan Vikas Patra) Scheme, 2019 provisions:
 * - 7.5% p.a. Government-notified interest rate compounded annually
 * - 115-Month (9 Years 7 Months) statutory maturity / principal doubling horizon
 * - Maturity payout: Exactly 2x principal deposit at Month 115
 * - Statutory deposit limits: Minimum ₹1,000 (multiples of ₹100), no upper limit cap
 * - Lock-in period: 2.5 Years (30 Months). Encashment allowed in 6-month blocks post 30 months
 * - Income Tax audit under investor's marginal tax slab (No TDS, No Sec 80C)
 * - KVP vs National Savings Certificate (NSC) & 5-Year Bank FD comparisons
 * - Inflation-adjusted 115-month real purchasing power payout model
 * - Year-by-year compounding schedule and premature encashment lookup table generation
 *
 * @param {Object} inputs
 * @param {number} [inputs.depositAmount=100000] - Deposit amount (₹)
 * @param {number} [inputs.rate=7.5] - Government notified interest rate (% p.a.)
 * @param {number} [inputs.marginalTaxRate=30] - Investor marginal tax rate (%)
 * @param {number} [inputs.nscRate=7.7] - NSC benchmark rate (% p.a.)
 * @param {number} [inputs.expectedFdRate=6.75] - Bank FD benchmark rate (% p.a.)
 * @param {number} [inputs.inflationRate=5.0] - Inflation rate (%)
 * @param {string} [inputs.currency='INR'] - Currency code ('INR' | 'USD' | 'EUR' | 'GBP')
 * @returns {Object} Structured KVP decision model
 */
export function calculateKvpCalculator(inputs = {}) {
  const {
    depositAmount = 100000,
    rate = 7.5,
    marginalTaxRate = 30,
    nscRate = 7.7,
    expectedFdRate = 6.75,
    inflationRate = 5.0,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION
  const rawDeposit = Math.max(0, Number(depositAmount) || 0);
  const kvpRate = Math.max(0, Math.min(20, Number(rate) || 0));
  const taxSlabPct = Math.max(0, Math.min(50, Number(marginalTaxRate) || 0));
  const nscRatePct = Math.max(0, Math.min(20, Number(nscRate) || 0));
  const fdRatePct = Math.max(0, Math.min(20, Number(expectedFdRate) || 0));
  const inflPct = Math.max(0, Math.min(20, Number(inflationRate) || 0));

  // Handle Edge Case: Zero Deposit
  if (rawDeposit === 0) {
    return createZeroKvpResult(currency);
  }

  // 2. MATURITY MATH & DOUBLING HORIZON
  const tenureMonths = 115; // 9 Years 7 Months
  const tenureYearsFloat = 115 / 12; // ~9.5833 Years
  const lockInMonths = 30; // 2.5 Years

  // Statutory Rule: Principal doubles at Month 115
  const maturityAmount = rawDeposit * 2;
  const totalInterestEarned = rawDeposit;

  // 3. TAX AUDIT ESTIMATE
  const averageAnnualInterest = totalInterestEarned / tenureYearsFloat;
  const annualTaxEstimate = Math.round(averageAnnualInterest * (taxSlabPct / 100));

  // 4. PREMATURE ENCASHMENT TABLE LOOKUP
  const prematureEncashmentSchedule = KVP_CONFIG.prematureEncashmentTablePer1000.map((item) => {
    const totalPayout = Math.round((rawDeposit / 1000) * item.payout);
    const interestEarned = totalPayout - rawDeposit;
    return {
      months: item.months,
      lockInBlock: item.lockInBlock,
      payoutPer1000: item.payout,
      totalPayout,
      interestEarned,
      isLockInPassed: item.months >= lockInMonths,
    };
  });

  // 5. YEAR-BY-YEAR COMPOUNDING SCHEDULE
  const yearlySchedule = [];
  let currentBalance = rawDeposit;

  for (let y = 1; y <= 10; y++) {
    if (y < 10) {
      const interestForYear = Math.round(currentBalance * (kvpRate / 100));
      const endBalance = currentBalance + interestForYear;
      yearlySchedule.push({
        year: y,
        label: 'Year ' + y,
        startBalance: currentBalance,
        interestEarned: interestForYear,
        endBalance,
      });
      currentBalance = endBalance;
    } else {
      // Year 10 (Months 109 to 115) - Final Doubling Period
      const interestForYear = maturityAmount - currentBalance;
      yearlySchedule.push({
        year: 10,
        label: 'Year 9.58 (Month 115 Maturity)',
        startBalance: currentBalance,
        interestEarned: interestForYear,
        endBalance: maturityAmount,
        isMaturityRow: true,
      });
    }
  }

  // 6. YIELD COMPARISONS (vs NSC & Bank FD)
  // NSC 5-Year Compounded Annually
  const nsc5YCorpus = Math.round(rawDeposit * Math.pow(1 + nscRatePct / 100, 5));

  // 9.58-Year Bank FD Compounded Quarterly
  const fdCorpus = Math.round(rawDeposit * Math.pow(1 + (fdRatePct / 100) / 4, 4 * tenureYearsFloat));
  const kvpVsFdDelta = Math.max(0, maturityAmount - fdCorpus);

  // 7. INFLATION-ADJUSTED REAL PURCHASING POWER AT MONTH 115
  const purchasingPowerMaturity = Math.round(maturityAmount / Math.pow(1 + inflPct / 100, tenureYearsFloat));

  // 8. SCENARIO MATRIX COMPARISON
  const scenarios = [
    {
      id: 'baseline',
      label: 'Selected Deposit (' + (rawDeposit >= 100000 ? '₹' + (rawDeposit / 100000).toFixed(1) + 'L' : '₹' + rawDeposit.toLocaleString()) + ')',
      deposit: rawDeposit,
      rate: kvpRate,
      maturityAmount,
      totalInterestEarned,
    },
    {
      id: 'starter_100k',
      label: '₹1 Lakh Deposit',
      deposit: 100000,
      rate: kvpRate,
      maturityAmount: 200000,
      totalInterestEarned: 100000,
    },
    {
      id: 'growth_500k',
      label: '₹5 Lakhs Deposit',
      deposit: 500000,
      rate: kvpRate,
      maturityAmount: 1000000,
      totalInterestEarned: 500000,
    },
    {
      id: 'hni_1000k',
      label: '₹10 Lakhs Deposit',
      deposit: 1000000,
      rate: kvpRate,
      maturityAmount: 2000000,
      totalInterestEarned: 1000000,
    },
  ];

  // 9. HERO SUMMARY TEXT
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const heroText = `Your KVP deposit of ${currencySymbol}${rawDeposit.toLocaleString()} at ${kvpRate.toFixed(2)}% p.a. notified rate doubles into ${currencySymbol}${maturityAmount.toLocaleString()} in exactly 115 months (9 years 7 months), earning ${currencySymbol}${totalInterestEarned.toLocaleString()} in total interest with 100% sovereign guarantee.`;

  return {
    depositAmount: rawDeposit,
    rate: kvpRate,
    tenureMonths,
    tenureYearsFloat,
    lockInMonths,
    marginalTaxRate: taxSlabPct,
    nscRate: nscRatePct,
    expectedFdRate: fdRatePct,
    inflationRate: inflPct,
    currency,

    // Primary Outputs
    primaryOutput: maturityAmount,
    maturityAmount,
    totalInterestEarned,
    annualTaxEstimate,

    // Comparisons & Purchasing Power
    nsc5YCorpus,
    fdCorpus,
    kvpVsFdDelta,
    purchasingPowerMaturity,

    // Schedules & Encashment
    prematureEncashmentSchedule,
    yearlySchedule,
    scenarios,
    heroText,
  };
}

/**
 * Fallback Engine Result for Zero Input
 */
function createZeroKvpResult(currency = 'INR') {
  return {
    depositAmount: 0,
    rate: 7.5,
    tenureMonths: 115,
    tenureYearsFloat: 9.5833,
    lockInMonths: 30,
    marginalTaxRate: 30,
    nscRate: 7.7,
    expectedFdRate: 6.75,
    inflationRate: 5.0,
    currency,

    primaryOutput: 0,
    maturityAmount: 0,
    totalInterestEarned: 0,
    annualTaxEstimate: 0,

    nsc5YCorpus: 0,
    fdCorpus: 0,
    kvpVsFdDelta: 0,
    purchasingPowerMaturity: 0,

    prematureEncashmentSchedule: [],
    yearlySchedule: [],
    scenarios: [],
    heroText: 'Please enter a valid deposit amount to compute your Kisan Vikas Patra (KVP) doubling payouts.',
  };
}
