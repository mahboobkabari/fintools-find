/**
 * Flagship National Savings Certificate (NSC) Math & Decision Engine (V3)
 * Implements Ministry of Finance National Savings Certificates (VIII Issue) Scheme 2019:
 * - 7.7% p.a. Government-notified interest rate compounded annually (paid at 5-year maturity)
 * - 5-Year statutory maturity horizon with 100% sovereign capital safety
 * - Section 80C initial principal tax deduction in Year 1 (up to ₹1,50,000 cap)
 * - Income Tax Section 80C Deemed Interest Reinvestment Audit (Years 1 to 4 accrued interest is deemed reinvested and tax-deductible)
 * - Year 5 (Maturity Year) interest taxability auditor (taxed at investor's marginal tax slab rate)
 * - Sovereign NSC vs 5-Year Commercial Bank Tax Saver FD Yield Comparison Engine
 * - Inflation-Adjusted Real Purchasing Power Maturity Value
 * - 5-Year Accrual & Deemed Section 80C Schedule Generation
 *
 * @param {Object} inputs
 * @param {number} [inputs.depositAmount=150000] - NSC investment deposit amount (₹)
 * @param {number} [inputs.rate=7.7] - Government notified interest rate (% p.a.)
 * @param {number} [inputs.marginalTaxRate=30] - Investor marginal tax slab rate (%)
 * @param {number} [inputs.expectedFdRate=7.25] - 5-Year Bank Tax Saver FD rate (% p.a.)
 * @param {number} [inputs.inflationRate=5.0] - Inflation rate (%) for real purchasing power
 * @param {string} [inputs.currency='INR'] - Currency code ('INR' | 'USD' | 'EUR' | 'GBP')
 * @returns {Object} Structured National Savings Certificate decision model
 */
export function calculateNscCalculator(inputs = {}) {
  const {
    depositAmount = 150000,
    rate = 7.7,
    marginalTaxRate = 30,
    expectedFdRate = 7.25,
    inflationRate = 5.0,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION
  const rawDeposit = Math.max(0, Number(depositAmount) || 0);
  const nscRate = Math.max(0, Math.min(20, Number(rate) || 0));
  const taxSlabPct = Math.max(0, Math.min(50, Number(marginalTaxRate) || 0));
  const fdRatePct = Math.max(0, Math.min(20, Number(expectedFdRate) || 0));
  const inflPct = Math.max(0, Math.min(20, Number(inflationRate) || 0));
  const tenureYears = 5;

  // Handle Edge Case: Zero Deposit
  if (rawDeposit === 0) {
    return createZeroNscResult(currency);
  }

  // 2. 5-YEAR COMPOUNDING MATURITY MATH (7.7% p.a. Compounded Annually)
  const maturityAmount = Math.round(rawDeposit * Math.pow(1 + nscRate / 100, tenureYears));
  const totalInterestEarned = Math.max(0, maturityAmount - rawDeposit);

  // 3. YEAR-BY-YEAR ACCRUAL & SECTION 80C DEEMED REINVESTMENT SCHEDULE
  const yearlyRows = [];
  let runningBalance = rawDeposit;

  for (let y = 1; y <= tenureYears; y++) {
    const openingBalance = runningBalance;
    const closingBalance = Math.round(rawDeposit * Math.pow(1 + nscRate / 100, y));
    const accruedInterest = Math.max(0, closingBalance - openingBalance);

    // Years 1 to 4 accrued interest is deemed reinvested under Section 80C.
    // Year 5 interest is paid out at maturity and is taxable at slab.
    const isDeemed80cEligible = y >= 1 && y <= 4;
    const sec80cTaxSavedOnInterest = isDeemed80cEligible
      ? Math.round(accruedInterest * (taxSlabPct / 100))
      : 0;

    yearlyRows.push({
      year: y,
      openingBalance,
      accruedInterest,
      closingBalance,
      isDeemed80cEligible,
      sec80cTaxSavedOnInterest,
    });

    runningBalance = closingBalance;
  }

  // 4. SECTION 80C TAX AUDIT
  const sec80cInitialEligible = Math.min(150000, rawDeposit);
  const sec80cYear1Saved = Math.round(sec80cInitialEligible * (taxSlabPct / 100));

  const totalDeemed80cInterest = yearlyRows.slice(0, 4).reduce((sum, r) => sum + r.accruedInterest, 0);
  const totalDeemed80cTaxSaved = yearlyRows.slice(0, 4).reduce((sum, r) => sum + r.sec80cTaxSavedOnInterest, 0);

  const year5TaxableInterest = yearlyRows[4] ? yearlyRows[4].accruedInterest : 0;
  const year5TaxPayable = Math.round(year5TaxableInterest * (taxSlabPct / 100));

  // 5. GUARANTEED NSC vs 5-YEAR BANK TAX SAVER FD COMPARISON
  const fdMaturity = Math.round(rawDeposit * Math.pow(1 + fdRatePct / 100, tenureYears));
  const fdTotalInterest = Math.max(0, fdMaturity - rawDeposit);
  const nscInterestDelta = Math.max(0, totalInterestEarned - fdTotalInterest);

  // 6. INFLATION-ADJUSTED REAL PURCHASING POWER
  const purchasingPowerMaturity = Math.round(maturityAmount / Math.pow(1 + inflPct / 100, tenureYears));

  // 7. SCENARIO MATRIX COMPARISON
  const scenarios = [
    {
      id: 'baseline',
      label: 'Selected Deposit (₹' + rawDeposit.toLocaleString() + ')',
      deposit: rawDeposit,
      rate: nscRate,
      maturityAmount,
      totalInterestEarned,
    },
    {
      id: 'max_80c',
      label: 'Max Sec 80C Deposit (₹1.5 Lakhs)',
      deposit: 150000,
      rate: nscRate,
      ...runQuickNscSim(150000, nscRate),
    },
    {
      id: 'moderate_100k',
      label: 'Moderate Tax Deposit (₹1 Lakh)',
      deposit: 100000,
      rate: nscRate,
      ...runQuickNscSim(100000, nscRate),
    },
    {
      id: 'high_500k',
      label: 'High Allocation (₹5 Lakhs)',
      deposit: 500000,
      rate: nscRate,
      ...runQuickNscSim(500000, nscRate),
    },
  ];

  // 8. HERO SUMMARY TEXT
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const heroText = `Your NSC deposit of ${currencySymbol}${rawDeposit.toLocaleString()} at ${nscRate.toFixed(2)}% p.a. grows to a guaranteed 5-year maturity corpus of ${currencySymbol}${maturityAmount.toLocaleString()} (${currencySymbol}${totalInterestEarned.toLocaleString()} interest earned).`;

  return {
    depositAmount: rawDeposit,
    rate: nscRate,
    tenureYears,
    marginalTaxRate: taxSlabPct,
    expectedFdRate: fdRatePct,
    inflationRate: inflPct,
    currency,

    // Primary Outputs
    primaryOutput: maturityAmount,
    maturityAmount,
    totalInterestEarned,

    // Section 80C & Tax Audit
    sec80cInitialEligible,
    sec80cYear1Saved,
    totalDeemed80cInterest,
    totalDeemed80cTaxSaved,
    year5TaxableInterest,
    year5TaxPayable,

    // Comparison & Purchasing Power
    fdMaturity,
    fdTotalInterest,
    nscInterestDelta,
    purchasingPowerMaturity,

    // Schedules & Scenarios
    yearlyRows,
    scenarios,
    heroText,
  };
}

/**
 * Quick Helper for NSC Scenario Calculations
 */
function runQuickNscSim(deposit, rate) {
  const maturityAmount = Math.round(deposit * Math.pow(1 + rate / 100, 5));
  const totalInterestEarned = Math.max(0, maturityAmount - deposit);
  return { maturityAmount, totalInterestEarned };
}

/**
 * Fallback Engine Result for Zero Input
 */
function createZeroNscResult(currency = 'INR') {
  return {
    depositAmount: 0,
    rate: 7.7,
    tenureYears: 5,
    marginalTaxRate: 30,
    expectedFdRate: 7.25,
    inflationRate: 5.0,
    currency,

    primaryOutput: 0,
    maturityAmount: 0,
    totalInterestEarned: 0,

    sec80cInitialEligible: 0,
    sec80cYear1Saved: 0,
    totalDeemed80cInterest: 0,
    totalDeemed80cTaxSaved: 0,
    year5TaxableInterest: 0,
    year5TaxPayable: 0,

    fdMaturity: 0,
    fdTotalInterest: 0,
    nscInterestDelta: 0,
    purchasingPowerMaturity: 0,

    yearlyRows: [],
    scenarios: [],
    heroText: 'Please enter a valid investment deposit amount to compute your National Savings Certificate maturity returns.',
  };
}
