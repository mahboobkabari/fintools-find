/**
 * Flagship Purchasing Power Financial Engine (Sprint 78 / Flagship #85)
 * 
 * Mathematically models the decay of currency purchasing power, real vs nominal values,
 * inflation halving timelines, and net real wage growth.
 * 
 * Key Formulas:
 * 1. Future Real Purchasing Power:
 *    Real_PV = Amount / (1 + i)^n
 * 2. Purchasing Power Loss %:
 *    Loss% = (1 - (1 / (1 + i)^n)) * 100
 * 3. Future Inflated Equivalent Cost:
 *    Future_Cost = Amount * (1 + i)^n
 * 4. Halving Timeline (Years to 50% loss):
 *    T_half = ln(2) / ln(1 + i)
 * 5. Real Income Growth (with salary increase g):
 *    Real_Income = Amount * ((1 + g) / (1 + i))^n
 *    Real_Growth_Rate% = (((1 + g) / (1 + i)) - 1) * 100
 */

export const CURRENCY_METADATA = {
  INR: { symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  JPY: { symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
};

export const REFERENCE_METADATA = {
  baselineDate: '2026-08-27',
  source: 'International CPI & Fisher Valuation Benchmarks',
  disclaimer: 'Calculations utilize mathematical compound inflation and Fisher real purchasing power formulations. Actual purchasing power varies by individual consumer expenditure baskets and regional price indexes.',
};

/**
 * Calculates Purchasing Power Degradation, Future Equivalent Costs, and Real Income
 * 
 * @param {Object} [inputs={}]
 * @param {number} [inputs.amount=100000] - Initial sum or annual income
 * @param {number} [inputs.inflationRate=6.0] - Expected annual inflation rate (% p.a.)
 * @param {number} [inputs.tenureYears=10] - Time horizon in years (1 to 50)
 * @param {number} [inputs.incomeGrowthRate=0] - Optional annual salary/income growth rate (% p.a.)
 * @param {string} [inputs.currency='INR'] - Currency code
 * @returns {Object} Comprehensive purchasing power analytics
 */
export function calculatePurchasingPower(inputs = {}) {
  const {
    amount = 100000,
    inflationRate = 6.0,
    tenureYears = 10,
    incomeGrowthRate = 0,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & BOUNDARY AUDITING
  const cleanAmount = Math.abs(Number(amount) || 0);
  const cleanInflation = Math.max(-10, Math.min(100, Number(inflationRate) || 0));
  const cleanTenure = Math.max(0, Math.min(60, Math.round(Number(tenureYears) || 0)));
  const cleanIncomeGrowth = Math.max(0, Math.min(50, Number(incomeGrowthRate) || 0));
  
  const currKey = String(currency).trim().toUpperCase();
  const currMeta = CURRENCY_METADATA[currKey] || CURRENCY_METADATA.INR;
  const sym = currMeta.symbol;

  const inflDec = cleanInflation / 100;
  const growthDec = cleanIncomeGrowth / 100;

  // 2. CORE MATHEMATICAL FORMULATIONS
  // A. Future Real Purchasing Power (Today's buying power in Year N)
  // Real_PV = Amount / (1 + i)^n
  const compoundFactor = Math.pow(1 + inflDec, cleanTenure);
  const futureRealValue = compoundFactor !== 0 ? cleanAmount / compoundFactor : 0;
  const roundedRealValue = Math.round(futureRealValue * 100) / 100;

  // B. Purchasing Power Loss Amount and Percentage
  const purchasingPowerLossAmount = Math.max(0, cleanAmount - roundedRealValue);
  const purchasingPowerLossPct = cleanAmount > 0
    ? Number(((purchasingPowerLossAmount / cleanAmount) * 100).toFixed(2))
    : 0;

  // C. Future Inflated Equivalent Cost (Amount needed in Year N to buy today's basket)
  // Future_Cost = Amount * (1 + i)^n
  const equivalentFutureCost = Math.round((cleanAmount * compoundFactor) * 100) / 100;
  const extraCostRequired = Math.max(0, equivalentFutureCost - cleanAmount);

  // D. Cumulative Price Inflation Rate (%)
  const cumulativeInflationPct = Number(((compoundFactor - 1) * 100).toFixed(2));

  // E. Purchasing Power Halving & Quartering Timelines (Years)
  // T_half = ln(2) / ln(1 + i)
  let halvingYears = null;
  let quarteringYears = null;
  if (inflDec > 0) {
    halvingYears = Number((Math.log(2) / Math.log(1 + inflDec)).toFixed(1));
    quarteringYears = Number((Math.log(4) / Math.log(1 + inflDec)).toFixed(1));
  }

  // F. Real Wage / Income Growth Analysis (if income growth provided)
  const nominalFutureIncome = Math.round((cleanAmount * Math.pow(1 + growthDec, cleanTenure)) * 100) / 100;
  const realWageFactor = (1 + growthDec) / (1 + inflDec);
  const futureRealIncome = Math.round((cleanAmount * Math.pow(realWageFactor, cleanTenure)) * 100) / 100;
  const realIncomeGrowthRate = Number(((realWageFactor - 1) * 100).toFixed(2));
  const realIncomeDelta = Math.round((futureRealIncome - cleanAmount) * 100) / 100;
  const isBeatingInflation = cleanIncomeGrowth > cleanInflation;

  // 3. MULTI-YEAR DEGRADATION SCHEDULE (1 to N years)
  const yearlySchedule = [];
  for (let t = 1; t <= cleanTenure; t++) {
    const tCompound = Math.pow(1 + inflDec, t);
    const tRealVal = tCompound !== 0 ? Math.round((cleanAmount / tCompound) * 100) / 100 : 0;
    const tLossAmt = Math.max(0, Math.round((cleanAmount - tRealVal) * 100) / 100);
    const tLossPct = cleanAmount > 0 ? Number(((tLossAmt / cleanAmount) * 100).toFixed(2)) : 0;
    const tEquivCost = Math.round((cleanAmount * tCompound) * 100) / 100;
    const tNominalIncome = Math.round((cleanAmount * Math.pow(1 + growthDec, t)) * 100) / 100;
    const tRealIncome = Math.round((cleanAmount * Math.pow(realWageFactor, t)) * 100) / 100;

    yearlySchedule.push({
      year: t,
      realPurchasingPower: tRealVal,
      lossAmount: tLossAmt,
      lossPercent: tLossPct,
      equivalentFutureCost: tEquivCost,
      nominalIncome: tNominalIncome,
      realIncome: tRealIncome,
    });
  }

  // 4. DYNAMIC HERO TEXT & VERDICT
  let heroText = '';
  if (cleanTenure === 0 || cleanInflation === 0) {
    heroText = `${sym}${cleanAmount.toLocaleString()} retains 100% of its purchasing power (${sym}${cleanAmount.toLocaleString()}) over ${cleanTenure} years.`;
  } else {
    heroText = `${sym}${cleanAmount.toLocaleString()} will have the purchasing power of ${sym}${Math.round(roundedRealValue).toLocaleString()} in ${cleanTenure} years at ${cleanInflation.toFixed(1)}% annual inflation.`;
  }

  // 5. ACTIONABLE RECOMMENDATIONS
  const recommendations = [];
  if (cleanInflation >= 6.0) {
    recommendations.push({
      title: 'High Inflation Alert: Shift from Cash to Growth Assets',
      type: 'critical',
      description: `At ${cleanInflation.toFixed(1)}% inflation, your cash loses half its real value every ${halvingYears || '12'} years. Allocate capital toward equity index funds, real estate, or inflation-indexed bonds to preserve purchasing power.`,
    });
  } else {
    recommendations.push({
      title: 'Moderate Inflation Strategy',
      type: 'info',
      description: `At ${cleanInflation.toFixed(1)}% inflation, holding idle cash costs ${purchasingPowerLossPct}% in lost buying power over ${cleanTenure} years. Maintain 6 months of emergency reserves in high-yield liquid funds and invest surplus capital.`,
    });
  }

  if (cleanIncomeGrowth > 0) {
    if (isBeatingInflation) {
      recommendations.push({
        title: 'Positive Real Income Expansion',
        type: 'positive',
        description: `Your income growth (${cleanIncomeGrowth.toFixed(1)}%) outpaces inflation (${cleanInflation.toFixed(1)}%) by +${realIncomeGrowthRate.toFixed(2)}% net real growth p.a., expanding your real annual lifestyle budget by ${sym}${Math.abs(realIncomeDelta).toLocaleString()}.`,
      });
    } else {
      recommendations.push({
        title: 'Negative Real Wage Drag',
        type: 'warning',
        description: `Despite a ${cleanIncomeGrowth.toFixed(1)}% nominal salary hike, ${cleanInflation.toFixed(1)}% inflation shrinks your real take-home purchasing power by ${Math.abs(realIncomeGrowthRate).toFixed(2)}% per year.`,
      });
    }
  } else {
    recommendations.push({
      title: 'Career & Wage Compounding Requirement',
      type: 'warning',
      description: `Without annual income raises, your current salary lifestyle will cost ${sym}${Math.round(equivalentFutureCost).toLocaleString()} in ${cleanTenure} years to sustain identical living standards.`,
    });
  }

  recommendations.push({
    title: 'Utilize the Rule of 72 for Quick Inflation Math',
    type: 'info',
    description: `Divide 72 by your expected inflation rate (${cleanInflation}%) to know that purchasing power is halved in exactly ${halvingYears || (72 / Math.max(1, cleanInflation)).toFixed(1)} years.`,
  });

  return {
    amount: cleanAmount,
    inflationRate: cleanInflation,
    tenureYears: cleanTenure,
    incomeGrowthRate: cleanIncomeGrowth,
    currency: currKey,
    currencyMeta: currMeta,
    futureRealValue: roundedRealValue,
    purchasingPowerLossAmount,
    purchasingPowerLossPct,
    equivalentFutureCost,
    extraCostRequired,
    cumulativeInflationPct,
    halvingYears,
    quarteringYears,
    nominalFutureIncome,
    futureRealIncome,
    realIncomeGrowthRate,
    realIncomeDelta,
    isBeatingInflation,
    yearlySchedule,
    heroText,
    recommendations,
    metadata: REFERENCE_METADATA,
  };
}

// Named Aliases
export const calculatePurchasingPowerCalculator = calculatePurchasingPower;
export const calculateRealValue = calculatePurchasingPower;
