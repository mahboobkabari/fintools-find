/**
 * Flagship Fixed Deposit (FD) Decision Engine (Math Engine V3)
 * Computes Indian and global bank-style fixed deposit returns, quarterly compounding reinvestment FDs,
 * monthly and quarterly interest payout options, senior citizen rate bonuses (+0.50%),
 * Section 194A statutory TDS deductions (₹40,000 / ₹50,000 threshold caps & Section 206AA 20% PAN penalty),
 * marginal tax slab net yields, and year-by-year schedule accumulation.
 *
 * @param {Object} inputs
 * @param {number} [inputs.amount=100000] - Principal deposit amount (₹ or $)
 * @param {number} [inputs.rate=7.0] - Base annual interest rate (% p.a.)
 * @param {number} [inputs.tenure=3] - Deposit tenure value
 * @param {string} [inputs.tenureType='years'] - 'years' | 'months' | 'days'
 * @param {'cumulative'|'monthly'|'quarterly'} [inputs.payoutType='cumulative'] - Interest payout frequency
 * @param {boolean} [inputs.isSeniorCitizen=false] - Senior Citizen status (+0.50% rate bonus)
 * @param {boolean} [inputs.hasPan=true] - PAN furnished status (10% vs 20% TDS under Sec 206AA)
 * @param {number} [inputs.marginalTaxRate=20] - Marginal income tax bracket rate (%)
 * @param {string} [inputs.currency='INR'] - Currency code ('INR' | 'USD' | 'EUR' | 'GBP')
 * @returns {Object} Structured Fixed Deposit analytical model
 */
export function calculateFdCalculator(inputs = {}) {
  const {
    amount = 100000,
    rate = 7.0,
    tenure = 3,
    tenureType = 'years',
    payoutType = 'cumulative',
    isSeniorCitizen = false,
    hasPan = true,
    marginalTaxRate = 20,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & BOUNDARY CHECKS
  const principal = Math.max(0, Number(amount) || 0);
  const baseRate = Math.max(0, Math.min(30, Number(rate) || 0));
  const rawTenure = Math.max(1, Number(tenure) || 1);
  const isSenior = isSeniorCitizen === true || isSeniorCitizen === 'true';
  const panBool = hasPan === true || hasPan === 'true' || hasPan === 'yes';
  const taxSlabPct = Math.max(0, Math.min(50, Number(marginalTaxRate) || 0));

  // Senior Citizen Bonus (+0.50% p.a.)
  const seniorBonusRate = isSenior ? 0.50 : 0.00;
  const effectiveRate = baseRate + seniorBonusRate;

  // Handle Edge Case: Zero Principal
  if (principal === 0) {
    return createZeroFdResult(currency);
  }

  // Calculate Tenure in Years and Total Months
  let tenureYears = rawTenure;
  if (tenureType === 'months') {
    tenureYears = rawTenure / 12;
  } else if (tenureType === 'days') {
    tenureYears = rawTenure / 365;
  }
  tenureYears = Math.max(0.01, tenureYears);
  const totalMonths = Math.max(1, Math.round(tenureYears * 12));

  // 2. INTEREST & MATURITY COMPUTATION BASED ON PAYOUT MODE
  let totalInterest = 0;
  let maturityValue = 0;
  let periodicPayout = 0;

  if (payoutType === 'cumulative') {
    // Standard Banking Quarterly Compounding: A = P * (1 + r/400)^(4*t)
    if (effectiveRate === 0) {
      maturityValue = principal;
      totalInterest = 0;
    } else {
      const quarterlyRate = (effectiveRate / 4) / 100;
      const totalQuarters = tenureYears * 4;
      const compoundFactor = Math.pow(1 + quarterlyRate, totalQuarters);
      maturityValue = Math.round(principal * compoundFactor);
      totalInterest = Math.max(0, maturityValue - principal);
    }
  } else if (payoutType === 'monthly') {
    // Simple Interest Monthly Payout
    periodicPayout = Math.round(principal * (effectiveRate / 1200));
    totalInterest = Math.round(periodicPayout * totalMonths);
    maturityValue = principal;
  } else if (payoutType === 'quarterly') {
    // Simple Interest Quarterly Payout
    const totalQuarters = Math.max(1, Math.round(tenureYears * 4));
    periodicPayout = Math.round(principal * (effectiveRate / 400));
    totalInterest = Math.round(periodicPayout * totalQuarters);
    maturityValue = principal;
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
  const netPostTaxMaturityValue = principal + netPostTaxInterest;
  const netEffectiveYield = tenureYears > 0 ? Number(((netPostTaxInterest / (principal * tenureYears)) * 100).toFixed(2)) : 0;

  // 5. YEARLY ACCUMULATION SCHEDULE
  const yearlyRows = [];
  const yearsCount = Math.ceil(tenureYears);
  let runningPrincipal = principal;
  let accumulatedInterest = 0;

  for (let y = 1; y <= yearsCount; y++) {
    const yearTenureFraction = y === yearsCount ? (tenureYears - (y - 1)) : 1;
    let interestForYear = 0;

    if (payoutType === 'cumulative') {
      const quarterlyRate = (effectiveRate / 4) / 100;
      const quartersInYear = yearTenureFraction * 4;
      const yearEndBalance = Math.round(runningPrincipal * Math.pow(1 + quarterlyRate, quartersInYear));
      interestForYear = Math.max(0, yearEndBalance - runningPrincipal);
      runningPrincipal = yearEndBalance;
    } else if (payoutType === 'monthly') {
      interestForYear = Math.round(principal * (effectiveRate / 100) * yearTenureFraction);
    } else if (payoutType === 'quarterly') {
      interestForYear = Math.round(principal * (effectiveRate / 100) * yearTenureFraction);
    }

    accumulatedInterest += interestForYear;
    const yearTds = (currency === 'INR' && interestForYear > tdsThreshold)
      ? Math.round(interestForYear * (tdsRatePct / 100))
      : 0;

    yearlyRows.push({
      year: y,
      principal: Math.round(payoutType === 'cumulative' ? runningPrincipal - interestForYear : principal),
      interestEarned: Math.round(interestForYear),
      cumulativeInterest: Math.round(accumulatedInterest),
      endingBalance: Math.round(payoutType === 'cumulative' ? runningPrincipal : principal),
      tdsDeduction: yearTds,
    });
  }

  // 6. SCENARIO MATRIX COMPARISON
  const scenarios = [
    {
      id: 'baseline',
      label: 'Baseline Setup',
      rate: effectiveRate,
      tenureYears: Number(tenureYears.toFixed(1)),
      payoutType,
      isSenior,
      totalInterest,
      maturityValue,
    },
    {
      id: 'senior_bonus',
      label: 'Senior Citizen (+0.50%)',
      rate: baseRate + 0.50,
      tenureYears: Number(tenureYears.toFixed(1)),
      payoutType,
      isSenior: true,
      ...runQuickFdSim(principal, baseRate + 0.50, tenureYears, payoutType),
    },
    {
      id: '3y_fixed',
      label: '3-Year Fixed Deposit',
      rate: effectiveRate,
      tenureYears: 3,
      payoutType,
      isSenior,
      ...runQuickFdSim(principal, effectiveRate, 3, payoutType),
    },
    {
      id: '5y_tax_saver',
      label: '5-Year Tax-Saver FD',
      rate: effectiveRate,
      tenureYears: 5,
      payoutType: 'cumulative',
      isSenior,
      ...runQuickFdSim(principal, effectiveRate, 5, 'cumulative'),
    },
  ];

  // 7. HERO SUMMARY TEXT
  let heroText = '';
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  if (payoutType === 'cumulative') {
    heroText = `Your deposit of ${currencySymbol}${principal.toLocaleString()} at ${effectiveRate.toFixed(2)}% p.a. grows to a maturity value of ${currencySymbol}${maturityValue.toLocaleString()} over ${tenureYears.toFixed(1)} years (Total Interest: ${currencySymbol}${totalInterest.toLocaleString()}).`;
  } else {
    heroText = `Your deposit generates a guaranteed ${payoutType} payout of ${currencySymbol}${periodicPayout.toLocaleString()} (${currencySymbol}${totalInterest.toLocaleString()} total interest outgo).`;
  }

  return {
    principal,
    baseRate,
    seniorBonusRate,
    effectiveRate,
    tenure: rawTenure,
    tenureType,
    tenureYears,
    payoutType,
    isSeniorCitizen: isSenior,
    hasPan: panBool,
    marginalTaxRate: taxSlabPct,
    currency,

    // Primary Outputs
    primaryOutput: maturityValue,
    maturityValue,
    totalInterest,
    periodicPayout,

    // Tax & TDS Audit
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

    // Schedules & Scenarios
    yearlyRows,
    scenarios,
    heroText,
  };
}

/**
 * Quick Helper for FD Scenario Matrix Calculations
 */
function runQuickFdSim(principal, rate, tenureYears, payoutType) {
  if (payoutType === 'cumulative') {
    const quarterlyRate = (rate / 4) / 100;
    const compoundFactor = Math.pow(1 + quarterlyRate, tenureYears * 4);
    const maturityValue = Math.round(principal * compoundFactor);
    const totalInterest = Math.max(0, maturityValue - principal);
    return { maturityValue, totalInterest };
  } else if (payoutType === 'monthly') {
    const monthlyPayout = Math.round(principal * (rate / 1200));
    const totalInterest = Math.round(monthlyPayout * (tenureYears * 12));
    return { maturityValue: principal, totalInterest };
  } else {
    const quarterlyPayout = Math.round(principal * (rate / 400));
    const totalInterest = Math.round(quarterlyPayout * (tenureYears * 4));
    return { maturityValue: principal, totalInterest };
  }
}

/**
 * Fallback Engine Result for Zero Input
 */
function createZeroFdResult(currency = 'INR') {
  return {
    principal: 0,
    baseRate: 7.0,
    seniorBonusRate: 0,
    effectiveRate: 7.0,
    tenure: 3,
    tenureType: 'years',
    tenureYears: 3,
    payoutType: 'cumulative',
    isSeniorCitizen: false,
    hasPan: true,
    marginalTaxRate: 20,
    currency,

    primaryOutput: 0,
    maturityValue: 0,
    totalInterest: 0,
    periodicPayout: 0,

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

    yearlyRows: [],
    scenarios: [],
    heroText: `Please enter a valid deposit amount to compute your Fixed Deposit maturity value.`,
  };
}
