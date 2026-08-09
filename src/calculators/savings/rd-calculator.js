/**
 * Flagship Recurring Deposit (RD) Math & Decision Engine (V3)
 * Implements Reserve Bank of India (RBI) quarterly bank compounding for equal monthly installments:
 * - Monthly Recurring Installment Compounding Engine
 * - Senior Citizen Bonus Rate (+0.50% p.a.)
 * - Section 194A Statutory TDS Tax Threshold Audit (₹40,000 / ₹50,000 caps & Section 206AA 20% PAN penalty)
 * - Guaranteed RD vs Equity SIP Wealth Comparison
 * - Inflation-Adjusted Real Purchasing Power
 * - Reverse Solver for Goal Corpus
 * - Monthly & Yearly Accumulation Schedule Generation
 *
 * @param {Object} inputs
 * @param {number} [inputs.monthlyInstallment=10000] - Monthly deposit amount (₹ or $)
 * @param {number} [inputs.rate=7.0] - Base annual interest rate (% p.a.)
 * @param {number} [inputs.tenure=3] - Deposit tenure value
 * @param {'months'|'years'} [inputs.tenureType='years'] - Tenure unit
 * @param {boolean} [inputs.isSeniorCitizen=false] - Senior Citizen status (+0.50% rate bonus)
 * @param {boolean} [inputs.hasPan=true] - PAN furnished status (10% vs 20% TDS under Sec 206AA)
 * @param {number} [inputs.marginalTaxRate=20] - Marginal income tax bracket rate (%)
 * @param {number} [inputs.expectedSipReturn=12.0] - Expected return rate for Equity SIP comparison (% p.a.)
 * @param {number} [inputs.inflationRate=5.0] - Inflation rate (%) for purchasing power
 * @param {string} [inputs.currency='INR'] - Currency code ('INR' | 'USD' | 'EUR' | 'GBP')
 * @returns {Object} Structured Recurring Deposit decision model
 */
export function calculateRdCalculator(inputs = {}) {
  const {
    monthlyInstallment = 10000,
    rate = 7.0,
    tenure = 3,
    tenureType = 'years',
    isSeniorCitizen = false,
    hasPan = true,
    marginalTaxRate = 20,
    expectedSipReturn = 12.0,
    inflationRate = 5.0,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & BOUNDARY AUDIT
  const installment = Math.max(0, Number(monthlyInstallment) || 0);
  const baseRate = Math.max(0, Math.min(30, Number(rate) || 0));
  const rawTenure = Math.max(1, Number(tenure) || 1);
  const isSenior = isSeniorCitizen === true || isSeniorCitizen === 'true';
  const panBool = hasPan === true || hasPan === 'true' || hasPan === 'yes';
  const taxSlabPct = Math.max(0, Math.min(50, Number(marginalTaxRate) || 0));
  const sipReturnPct = Math.max(0, Math.min(30, Number(expectedSipReturn) || 0));
  const inflPct = Math.max(0, Math.min(20, Number(inflationRate) || 0));

  // Senior Citizen Bonus (+0.50% p.a.)
  const seniorBonusRate = isSenior ? 0.50 : 0.00;
  const effectiveRate = baseRate + seniorBonusRate;

  // Handle Edge Case: Zero Monthly Installment
  if (installment === 0) {
    return createZeroRdResult(currency);
  }

  // Calculate Total Months (n) and Years (t)
  let totalMonths = rawTenure;
  if (tenureType === 'years') {
    totalMonths = Math.round(rawTenure * 12);
  }
  totalMonths = Math.max(1, Math.round(totalMonths));
  const tenureYears = Number((totalMonths / 12).toFixed(2));

  // 2. QUARTERLY BANK COMPOUNDING FOR EQUAL MONTHLY INSTALLMENTS
  const totalDeposits = installment * totalMonths;
  let maturityValue = 0;
  let totalInterest = 0;

  if (effectiveRate === 0) {
    maturityValue = totalDeposits;
    totalInterest = 0;
  } else {
    // RBI Quarterly Compounding Standard for Monthly Installments
    const quarterlyRate = (effectiveRate / 4) / 100;
    let sumCompounded = 0;

    for (let m = 1; m <= totalMonths; m++) {
      const remainingQuarters = (totalMonths - m + 1) / 3;
      const compoundedFactor = Math.pow(1 + quarterlyRate, remainingQuarters);
      sumCompounded += installment * compoundedFactor;
    }

    maturityValue = Math.round(sumCompounded);
    totalInterest = Math.max(0, maturityValue - totalDeposits);
  }

  // 3. STATUTORY SECTION 194A TDS TAX AUDIT
  const tdsThreshold = currency === 'INR' ? (isSenior ? 50000 : 40000) : Infinity;
  const annualizedInterest = tenureYears > 0 ? Math.round(totalInterest / tenureYears) : totalInterest;
  const isTdsApplicable = currency === 'INR' && annualizedInterest > tdsThreshold;
  const tdsRatePct = panBool ? 10 : 20;

  let estimatedTdsAmount = 0;
  if (isTdsApplicable) {
    estimatedTdsAmount = Math.round(totalInterest * (tdsRatePct / 100));
  }

  const postTdsMaturityValue = Math.max(0, maturityValue - estimatedTdsAmount);

  // 4. MARGINAL TAX SLAB & NET POST-TAX YIELD
  const marginalTaxAmount = Math.round(totalInterest * (taxSlabPct / 100));
  const netPostTaxInterest = Math.max(0, totalInterest - marginalTaxAmount);
  const netPostTaxMaturityValue = totalDeposits + netPostTaxInterest;
  const netEffectiveYield = tenureYears > 0 ? Number(((netPostTaxInterest / (totalDeposits * tenureYears / 2)) * 100).toFixed(2)) : 0;

  // 5. GUARANTEED RD vs EQUITY SIP COMPARISON
  let sipFutureValue = totalDeposits;
  let sipTotalInterest = 0;
  if (sipReturnPct > 0) {
    const monthlySipRate = (sipReturnPct / 12) / 100;
    sipFutureValue = Math.round(
      installment * ((Math.pow(1 + monthlySipRate, totalMonths) - 1) / monthlySipRate) * (1 + monthlySipRate)
    );
    sipTotalInterest = Math.max(0, sipFutureValue - totalDeposits);
  }
  const sipWealthDelta = Math.max(0, sipFutureValue - maturityValue);

  // 6. INFLATION-ADJUSTED PURCHASING POWER
  const purchasingPower = Math.round(maturityValue / Math.pow(1 + inflPct / 100, tenureYears));

  // 7. YEARLY ACCUMULATION SCHEDULE
  const yearlyRows = [];
  const yearsCount = Math.ceil(totalMonths / 12);
  let cumDepositsRunning = 0;
  let cumMaturityRunning = 0;

  for (let y = 1; y <= yearsCount; y++) {
    const monthsInYear = y === yearsCount ? (totalMonths - (y - 1) * 12) : 12;
    const yearDeposits = installment * monthsInYear;
    cumDepositsRunning += yearDeposits;

    const quickSim = runQuickRdSim(installment, effectiveRate, y * 12);
    const yearEndMaturity = quickSim.maturityValue;
    const yearInterest = Math.max(0, yearEndMaturity - cumDepositsRunning);

    const yearTds = (currency === 'INR' && (yearInterest / y) > tdsThreshold)
      ? Math.round(yearInterest * (tdsRatePct / 100))
      : 0;

    yearlyRows.push({
      year: y,
      totalDepositsPaid: cumDepositsRunning,
      interestEarned: Math.max(0, yearInterest - (cumMaturityRunning - (cumDepositsRunning - yearDeposits))),
      cumulativeInterest: yearInterest,
      endingBalance: yearEndMaturity,
      tdsDeduction: yearTds,
    });
    cumMaturityRunning = yearEndMaturity;
  }

  // 8. REVERSE GOAL SOLVER (Monthly Installment required for ₹10 Lakhs target)
  const targetCorpus10L = 1000000;
  const unitSim = runQuickRdSim(1000, effectiveRate, totalMonths);
  const maturityPer1k = unitSim.maturityValue;
  const requiredMonthlyInstallmentFor10L = maturityPer1k > 0 ? Math.round((targetCorpus10L / maturityPer1k) * 1000) : 0;

  // 9. SCENARIO MATRIX COMPARISON
  const scenarios = [
    {
      id: 'baseline',
      label: 'Baseline Setup',
      rate: effectiveRate,
      tenureYears,
      totalDeposits,
      ...runQuickRdSim(installment, effectiveRate, totalMonths),
    },
    {
      id: 'senior_bonus',
      label: 'Senior Citizen (+0.50%)',
      rate: baseRate + 0.50,
      tenureYears,
      totalDeposits,
      ...runQuickRdSim(installment, baseRate + 0.50, totalMonths),
    },
    {
      id: '3y_rd',
      label: '3-Year Deposit',
      rate: effectiveRate,
      tenureYears: 3,
      totalDeposits: installment * 36,
      ...runQuickRdSim(installment, effectiveRate, 36),
    },
    {
      id: '5y_rd',
      label: '5-Year Deposit',
      rate: effectiveRate,
      tenureYears: 5,
      totalDeposits: installment * 60,
      ...runQuickRdSim(installment, effectiveRate, 60),
    },
  ];

  // 10. HERO SUMMARY TEXT
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const heroText = `Your monthly deposit of ${currencySymbol}${installment.toLocaleString()}/mo at ${effectiveRate.toFixed(2)}% p.a. accumulates a guaranteed maturity corpus of ${currencySymbol}${maturityValue.toLocaleString()} in ${tenureYears} years (Total Interest: ${currencySymbol}${totalInterest.toLocaleString()}).`;

  return {
    monthlyInstallment: installment,
    baseRate,
    seniorBonusRate,
    effectiveRate,
    tenure: rawTenure,
    tenureType,
    totalMonths,
    tenureYears,
    isSeniorCitizen: isSenior,
    hasPan: panBool,
    marginalTaxRate: taxSlabPct,
    expectedSipReturn: sipReturnPct,
    inflationRate: inflPct,
    currency,

    // Primary Outputs
    primaryOutput: maturityValue,
    maturityValue,
    totalDeposits,
    totalInterest,

    // Statutory Tax Audit
    tdsThreshold,
    annualizedInterest,
    isTdsApplicable,
    tdsRatePct,
    estimatedTdsAmount,
    postTdsMaturityValue,
    marginalTaxAmount,
    netPostTaxInterest,
    netPostTaxMaturityValue,
    netEffectiveYield,

    // Equity SIP Comparison
    sipFutureValue,
    sipTotalInterest,
    sipWealthDelta,

    // Purchasing Power & Goal Solver
    purchasingPower,
    requiredMonthlyInstallmentFor10L,

    // Schedules & Scenarios
    yearlyRows,
    scenarios,
    heroText,
  };
}

/**
 * Quick Helper for RD Scenario Calculations
 */
function runQuickRdSim(installment, rate, totalMonths) {
  const totalDeposits = installment * totalMonths;
  if (rate === 0) {
    return { maturityValue: totalDeposits, totalInterest: 0 };
  }
  const quarterlyRate = (rate / 4) / 100;
  let sumCompounded = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const remainingQuarters = (totalMonths - m + 1) / 3;
    sumCompounded += installment * Math.pow(1 + quarterlyRate, remainingQuarters);
  }

  const maturityValue = Math.round(sumCompounded);
  const totalInterest = Math.max(0, maturityValue - totalDeposits);
  return { maturityValue, totalInterest };
}

/**
 * Fallback Engine Result for Zero Input
 */
function createZeroRdResult(currency = 'INR') {
  return {
    monthlyInstallment: 0,
    baseRate: 7.0,
    seniorBonusRate: 0,
    effectiveRate: 7.0,
    tenure: 3,
    tenureType: 'years',
    totalMonths: 36,
    tenureYears: 3,
    isSeniorCitizen: false,
    hasPan: true,
    marginalTaxRate: 20,
    expectedSipReturn: 12.0,
    inflationRate: 5.0,
    currency,

    primaryOutput: 0,
    maturityValue: 0,
    totalDeposits: 0,
    totalInterest: 0,

    tdsThreshold: currency === 'INR' ? 40000 : Infinity,
    annualizedInterest: 0,
    isTdsApplicable: false,
    tdsRatePct: 10,
    estimatedTdsAmount: 0,
    postTdsMaturityValue: 0,
    marginalTaxAmount: 0,
    netPostTaxInterest: 0,
    netPostTaxMaturityValue: 0,
    netEffectiveYield: 0,

    sipFutureValue: 0,
    sipTotalInterest: 0,
    sipWealthDelta: 0,

    purchasingPower: 0,
    requiredMonthlyInstallmentFor10L: 0,

    yearlyRows: [],
    scenarios: [],
    heroText: `Please enter a valid monthly deposit amount to compute your Recurring Deposit maturity value.`,
  };
}
