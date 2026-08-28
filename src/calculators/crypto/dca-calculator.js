/**
 * Flagship Dollar Cost Averaging (DCA) Calculation Engine (Sprint 85 / Flagship #92)
 * 
 * Comprehensive DCA and periodic investment simulation engine:
 * 1. Multi-frequency contribution schedules (Daily, Weekly, Bi-Weekly, Monthly, Quarterly)
 * 2. Deterministic scenario price path generation (Constant, Rising/Bull, Falling/Bear, Volatile Dip & Recovery, Custom)
 * 3. Transparent transaction fee modeling (Deducted from capital, Charged separately on top, Zero fees)
 * 4. Units accumulation, average cost per unit, break-even exit price, and fee drag metrics
 * 5. Period-by-period progression schedule with unrealized PnL tracking
 * 6. Lump-Sum benchmark comparison with identical total capital deployment
 * 7. Multi-currency fiat formatting (USD, EUR, GBP, INR, CAD, AUD, AED, SGD, JPY)
 * 8. Zero fabricated historical/live data: All calculations are deterministic simulations clearly labeled.
 */

export const CONTRIBUTION_FREQUENCIES = {
  DAILY: { id: 'DAILY', label: 'Daily (365/yr)', periodsPerYear: 365, daysPerPeriod: 1 },
  WEEKLY: { id: 'WEEKLY', label: 'Weekly (52/yr)', periodsPerYear: 52, daysPerPeriod: 7 },
  BIWEEKLY: { id: 'BIWEEKLY', label: 'Bi-Weekly (26/yr)', periodsPerYear: 26, daysPerPeriod: 14 },
  MONTHLY: { id: 'MONTHLY', label: 'Monthly (12/yr)', periodsPerYear: 12, daysPerPeriod: 30.4375 },
  QUARTERLY: { id: 'QUARTERLY', label: 'Quarterly (4/yr)', periodsPerYear: 4, daysPerPeriod: 91.25 },
};

export const SCENARIO_MODES = {
  CONSTANT: {
    id: 'CONSTANT',
    label: 'Constant Flat Price',
    description: 'Asset price remains perfectly steady across all periods.',
  },
  RISING: {
    id: 'RISING',
    label: 'Rising / Bull Market Trend',
    description: 'Asset price steadily rises from starting price to target final price.',
  },
  FALLING: {
    id: 'FALLING',
    label: 'Falling / Bear Market Trend',
    description: 'Asset price steadily declines from starting price to target final price.',
  },
  VOLATILE: {
    id: 'VOLATILE',
    label: 'Volatile / Dip & Recovery',
    description: 'Asset price experiences a sharp mid-term drop before recovering, illustrating cost averaging.',
  },
  CUSTOM: {
    id: 'CUSTOM',
    label: 'Custom Price Path',
    description: 'User-specified explicit price points for each contribution period.',
  },
};

export const FEE_MODES = {
  DEDUCTED: {
    id: 'DEDUCTED',
    label: 'Deducted from Contribution',
    description: 'Fees are subtracted from your contribution amount; net capital buys units.',
  },
  SEPARATE: {
    id: 'SEPARATE',
    label: 'Charged Separately (On Top)',
    description: 'Full contribution buys units; fees are added as extra out-of-pocket cash.',
  },
  NONE: {
    id: 'NONE',
    label: 'Zero Fees (No Fee Drag)',
    description: 'Zero transaction or exchange fees applied to purchases.',
  },
};

export const FIAT_CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', decimals: 2 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
};

/**
 * Helper to safely sanitize a numeric input with bounds.
 * 
 * @param {*} val 
 * @param {number} defaultVal 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function sanitizeNumber(val, defaultVal = 0, min = 0, max = Infinity) {
  const n = Number(val);
  if (isNaN(n) || !isFinite(n)) return defaultVal;
  return Math.min(Math.max(n, min), max);
}

/**
 * Generates an array of deterministic simulated asset prices per period.
 * 
 * @param {Object} options
 * @param {string} options.scenarioMode - 'CONSTANT' | 'RISING' | 'FALLING' | 'VOLATILE' | 'CUSTOM'
 * @param {number} options.startPrice - Starting asset price
 * @param {number} options.endPrice - Ending/target asset price
 * @param {number} options.periods - Total number of periods
 * @param {Array<number>} [options.customPrices] - User-supplied prices array
 * @param {number} [options.dipPct=35] - Volatility dip percentage for VOLATILE scenario
 * @returns {Array<number>} Array of price per period (length === periods)
 */
export function generatePricePath({
  scenarioMode = 'RISING',
  startPrice = 3000,
  endPrice = 4500,
  periods = 12,
  customPrices = [],
  dipPct = 35,
} = {}) {
  const p = Math.max(1, Math.round(sanitizeNumber(periods, 12, 1, 1200)));
  const pStart = sanitizeNumber(startPrice, 100, 0.00000001, 100000000);
  const pEnd = sanitizeNumber(endPrice, pStart, 0.00000001, 100000000);
  const mode = SCENARIO_MODES[scenarioMode] ? scenarioMode : 'RISING';

  if (mode === 'CONSTANT') {
    return Array(p).fill(Number(pStart.toFixed(6)));
  }

  if (mode === 'CUSTOM') {
    const rawArray = Array.isArray(customPrices) ? customPrices : [];
    const result = [];
    for (let i = 0; i < p; i++) {
      if (i < rawArray.length && rawArray[i] !== undefined && rawArray[i] !== null && !isNaN(Number(rawArray[i]))) {
        result.push(sanitizeNumber(rawArray[i], pStart, 0.00000001, 100000000));
      } else if (result.length > 0) {
        result.push(result[result.length - 1]);
      } else {
        result.push(pStart);
      }
    }
    return result;
  }

  if (p === 1) {
    return [Number(pStart.toFixed(6))];
  }

  if (mode === 'RISING' || mode === 'FALLING') {
    const prices = [];
    for (let i = 0; i < p; i++) {
      const fraction = i / (p - 1);
      const price = pStart + (pEnd - pStart) * fraction;
      prices.push(Number(price.toFixed(6)));
    }
    return prices;
  }

  if (mode === 'VOLATILE') {
    // Parabolic dip to a trough in the middle, then rebounds to endPrice
    const prices = [];
    const minDipMultiplier = Math.max(0.1, 1 - sanitizeNumber(dipPct, 35, 5, 90) / 100);
    const troughPrice = Math.min(pStart, pEnd) * minDipMultiplier;

    for (let i = 0; i < p; i++) {
      const x = i / (p - 1); // 0 to 1
      // Quadratic curve passing through (0, pStart), (0.5, troughPrice), (1, pEnd)
      // P(x) = a*x^2 + b*x + c
      // c = pStart
      // a + b + c = pEnd => a + b = pEnd - pStart
      // 0.25*a + 0.5*b + c = troughPrice => 0.25*a + 0.5*b = troughPrice - pStart
      // 0.5*a + b = 2*(troughPrice - pStart)
      // 0.5*a = (pEnd - pStart) - 2*(troughPrice - pStart) = pEnd + pStart - 2*troughPrice
      // a = 2*pEnd + 2*pStart - 4*troughPrice
      // b = (pEnd - pStart) - a
      const a = 2 * pEnd + 2 * pStart - 4 * troughPrice;
      const b = (pEnd - pStart) - a;
      const c = pStart;
      const price = Math.max(0.000001, a * x * x + b * x + c);
      prices.push(Number(price.toFixed(6)));
    }
    return prices;
  }

  return Array(p).fill(Number(pStart.toFixed(6)));
}

/**
 * Calculates fee and net purchase amounts based on fee mode.
 * 
 * @param {number} grossAmount - Contribution amount in fiat
 * @param {number} fixedFee - Fixed fiat fee per trade
 * @param {number} pctFee - Percentage fee (%)
 * @param {string} feeMode - 'DEDUCTED' | 'SEPARATE' | 'NONE'
 * @returns {{ fee: number, netInvested: number, cashOutlay: number }}
 */
export function calculateTransactionFee(grossAmount = 0, fixedFee = 0, pctFee = 0, feeMode = 'DEDUCTED') {
  const gross = sanitizeNumber(grossAmount, 0, 0);
  if (gross === 0 || feeMode === 'NONE') {
    return { fee: 0, netInvested: gross, cashOutlay: gross };
  }

  const fixed = sanitizeNumber(fixedFee, 0, 0);
  const pct = sanitizeNumber(pctFee, 0, 0, 100);
  const rawFee = fixed + (gross * pct) / 100;

  if (feeMode === 'DEDUCTED') {
    const fee = Math.min(rawFee, gross);
    const netInvested = Math.max(0, gross - fee);
    return {
      fee: Number(fee.toFixed(4)),
      netInvested: Number(netInvested.toFixed(4)),
      cashOutlay: Number(gross.toFixed(4)),
    };
  }

  if (feeMode === 'SEPARATE') {
    const fee = rawFee;
    const cashOutlay = gross + fee;
    return {
      fee: Number(fee.toFixed(4)),
      netInvested: Number(gross.toFixed(4)),
      cashOutlay: Number(cashOutlay.toFixed(4)),
    };
  }

  return { fee: 0, netInvested: gross, cashOutlay: gross };
}

/**
 * Primary DCA Calculation Engine.
 * 
 * @param {Object} [inputs={}]
 * @param {number} [inputs.initialInvestment=0] - Initial starting lump sum
 * @param {number} [inputs.recurringContribution=500] - Recurring contribution per period
 * @param {string} [inputs.frequency='MONTHLY'] - 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY'
 * @param {number} [inputs.periods=12] - Number of contribution periods
 * @param {number} [inputs.startPrice=3000] - Initial asset price
 * @param {number} [inputs.endPrice=4500] - Expected or scenario ending asset price
 * @param {string} [inputs.scenarioMode='RISING'] - 'CONSTANT' | 'RISING' | 'FALLING' | 'VOLATILE' | 'CUSTOM'
 * @param {Array<number>} [inputs.customPrices=[]] - Explicit period prices for CUSTOM mode
 * @param {number} [inputs.dipPct=35] - Volatility dip percentage for VOLATILE mode
 * @param {string} [inputs.feeMode='DEDUCTED'] - 'DEDUCTED' | 'SEPARATE' | 'NONE'
 * @param {number} [inputs.fixedFee=0] - Fixed transaction fee in fiat
 * @param {number} [inputs.pctFee=0.5] - Percentage transaction fee (%)
 * @param {number} [inputs.targetExitPrice=null] - Optional override for final exit price
 * @param {string} [inputs.currency='USD'] - Fiat currency code
 * @param {string} [inputs.assetName='Bitcoin (BTC)'] - Asset label
 * @returns {Object} Comprehensive DCA summary, schedule, and lump-sum comparison
 */
export function calculateDca(inputs = {}) {
  const {
    initialInvestment = 0,
    recurringContribution = 500,
    frequency = 'MONTHLY',
    periods = 12,
    startPrice = 3000,
    endPrice = 4500,
    scenarioMode = 'RISING',
    customPrices = [],
    dipPct = 35,
    feeMode = 'DEDUCTED',
    fixedFee = 0,
    pctFee = 0.5,
    targetExitPrice = null,
    currency = 'USD',
    assetName = 'Bitcoin (BTC)',
  } = inputs;

  const validFrequency = CONTRIBUTION_FREQUENCIES[frequency] ? frequency : 'MONTHLY';
  const freqMeta = CONTRIBUTION_FREQUENCIES[validFrequency];
  const validFeeMode = FEE_MODES[feeMode] ? feeMode : 'DEDUCTED';
  const validScenarioMode = SCENARIO_MODES[scenarioMode] ? scenarioMode : 'RISING';
  const currMeta = FIAT_CURRENCIES[currency] || FIAT_CURRENCIES.USD;

  const cleanInitial = sanitizeNumber(initialInvestment, 0, 0);
  const cleanRecurring = sanitizeNumber(recurringContribution, 500, 0);
  const cleanPeriods = Math.max(1, Math.round(sanitizeNumber(periods, 12, 1, 1200)));
  const cleanStartPrice = sanitizeNumber(startPrice, 3000, 0.00000001);
  const cleanEndPrice = sanitizeNumber(endPrice, cleanStartPrice, 0.00000001);
  const cleanFixedFee = sanitizeNumber(fixedFee, 0, 0);
  const cleanPctFee = sanitizeNumber(pctFee, 0, 0, 100);

  // Generate price path
  const pricePath = generatePricePath({
    scenarioMode: validScenarioMode,
    startPrice: cleanStartPrice,
    endPrice: cleanEndPrice,
    periods: cleanPeriods,
    customPrices,
    dipPct,
  });

  // Calculate Initial Purchase (Period 0)
  let totalUnits = 0;
  let totalCashInvested = 0;
  let totalNetInvested = 0;
  let totalFeesPaid = 0;

  const schedule = [];

  if (cleanInitial > 0) {
    const initPrice = pricePath[0] || cleanStartPrice;
    const initTx = calculateTransactionFee(cleanInitial, cleanFixedFee, cleanPctFee, validFeeMode);
    const initUnits = initPrice > 0 ? initTx.netInvested / initPrice : 0;

    totalUnits += initUnits;
    totalCashInvested += initTx.cashOutlay;
    totalNetInvested += initTx.netInvested;
    totalFeesPaid += initTx.fee;

    const avgCost = totalUnits > 0 ? totalCashInvested / totalUnits : 0;
    const initVal = totalUnits * initPrice;

    schedule.push({
      period: 0,
      label: 'Initial Lump Sum',
      price: Number(initPrice.toFixed(4)),
      grossContribution: Number(cleanInitial.toFixed(2)),
      fee: Number(initTx.fee.toFixed(2)),
      netPurchased: Number(initTx.netInvested.toFixed(2)),
      unitsBought: Number(initUnits.toFixed(8)),
      cumulativeUnits: Number(totalUnits.toFixed(8)),
      cumulativeInvested: Number(totalCashInvested.toFixed(2)),
      cumulativeFees: Number(totalFeesPaid.toFixed(2)),
      averageCost: Number(avgCost.toFixed(4)),
      portfolioValue: Number(initVal.toFixed(2)),
      unrealizedPnL: Number((initVal - totalCashInvested).toFixed(2)),
      unrealizedRoiPct: totalCashInvested > 0 ? Number((((initVal - totalCashInvested) / totalCashInvested) * 100).toFixed(2)) : 0,
    });
  }

  // Calculate Periodic Contributions
  for (let i = 0; i < cleanPeriods; i++) {
    const periodNumber = i + 1;
    const periodPrice = pricePath[i] || cleanStartPrice;
    const tx = calculateTransactionFee(cleanRecurring, cleanFixedFee, cleanPctFee, validFeeMode);
    const unitsBought = periodPrice > 0 ? tx.netInvested / periodPrice : 0;

    totalUnits += unitsBought;
    totalCashInvested += tx.cashOutlay;
    totalNetInvested += tx.netInvested;
    totalFeesPaid += tx.fee;

    const avgCost = totalUnits > 0 ? totalCashInvested / totalUnits : 0;
    const currentVal = totalUnits * periodPrice;
    const pnl = currentVal - totalCashInvested;
    const roi = totalCashInvested > 0 ? (pnl / totalCashInvested) * 100 : 0;

    schedule.push({
      period: periodNumber,
      label: `Period ${periodNumber}`,
      price: Number(periodPrice.toFixed(4)),
      grossContribution: Number(cleanRecurring.toFixed(2)),
      fee: Number(tx.fee.toFixed(2)),
      netPurchased: Number(tx.netInvested.toFixed(2)),
      unitsBought: Number(unitsBought.toFixed(8)),
      cumulativeUnits: Number(totalUnits.toFixed(8)),
      cumulativeInvested: Number(totalCashInvested.toFixed(2)),
      cumulativeFees: Number(totalFeesPaid.toFixed(2)),
      averageCost: Number(avgCost.toFixed(4)),
      portfolioValue: Number(currentVal.toFixed(2)),
      unrealizedPnL: Number(pnl.toFixed(2)),
      unrealizedRoiPct: Number(roi.toFixed(2)),
    });
  }

  // Exit valuation
  const finalPrice = targetExitPrice !== null && targetExitPrice !== undefined && Number(targetExitPrice) > 0
    ? sanitizeNumber(targetExitPrice, cleanEndPrice, 0.00000001)
    : (pricePath[pricePath.length - 1] || cleanEndPrice);

  const endingPortfolioValue = totalUnits * finalPrice;
  const totalProfitLoss = endingPortfolioValue - totalCashInvested;
  const roiPct = totalCashInvested > 0 ? (totalProfitLoss / totalCashInvested) * 100 : 0;
  const breakEvenPrice = totalUnits > 0 ? totalCashInvested / totalUnits : 0;
  const pureAverageCost = totalUnits > 0 ? totalNetInvested / totalUnits : 0;
  const feeDragPct = totalCashInvested > 0 ? (totalFeesPaid / totalCashInvested) * 100 : 0;
  const feeImpactOnEndingValue = totalFeesPaid * (finalPrice / (breakEvenPrice || 1));

  // Lump-Sum Comparison Benchmark
  // What if the entire totalCashInvested was invested as a single purchase on Day 1 at startPrice?
  let lumpUnits = 0;
  let lumpFee = 0;
  let lumpNet = 0;

  if (totalCashInvested > 0) {
    if (validFeeMode === 'DEDUCTED') {
      lumpFee = Math.min(totalCashInvested, cleanFixedFee + (totalCashInvested * cleanPctFee) / 100);
      lumpNet = Math.max(0, totalCashInvested - lumpFee);
      lumpUnits = cleanStartPrice > 0 ? lumpNet / cleanStartPrice : 0;
    } else if (validFeeMode === 'SEPARATE') {
      // Find net such that net + fixedFee + (net * pctFee / 100) = totalCashInvested
      const net = Math.max(0, (totalCashInvested - cleanFixedFee) / (1 + cleanPctFee / 100));
      lumpFee = totalCashInvested - net;
      lumpNet = net;
      lumpUnits = cleanStartPrice > 0 ? lumpNet / cleanStartPrice : 0;
    } else {
      lumpFee = 0;
      lumpNet = totalCashInvested;
      lumpUnits = cleanStartPrice > 0 ? totalCashInvested / cleanStartPrice : 0;
    }
  }

  const lumpEndingValue = lumpUnits * finalPrice;
  const lumpProfitLoss = lumpEndingValue - totalCashInvested;
  const lumpRoiPct = totalCashInvested > 0 ? (lumpProfitLoss / totalCashInvested) * 100 : 0;
  const dcaVsLumpDiff = endingPortfolioValue - lumpEndingValue;
  const dcaVsLumpRoiDiff = roiPct - lumpRoiPct;
  const dcaOutperformed = endingPortfolioValue >= lumpEndingValue;

  // Approximate duration in months / years
  const totalDays = cleanPeriods * freqMeta.daysPerPeriod;
  const totalMonths = totalDays / 30.4375;
  const totalYears = totalDays / 365.25;

  return {
    inputs: {
      initialInvestment: cleanInitial,
      recurringContribution: cleanRecurring,
      frequency: validFrequency,
      periods: cleanPeriods,
      startPrice: cleanStartPrice,
      endPrice: cleanEndPrice,
      scenarioMode: validScenarioMode,
      feeMode: validFeeMode,
      fixedFee: cleanFixedFee,
      pctFee: cleanPctFee,
      targetExitPrice: finalPrice,
      currency: currMeta.code,
      assetName,
    },
    meta: {
      currencySymbol: currMeta.symbol,
      currencyCode: currMeta.code,
      frequencyLabel: freqMeta.label,
      scenarioLabel: SCENARIO_MODES[validScenarioMode].label,
      feeModeLabel: FEE_MODES[validFeeMode].label,
      totalDays: Number(totalDays.toFixed(1)),
      totalMonths: Number(totalMonths.toFixed(1)),
      totalYears: Number(totalYears.toFixed(2)),
    },
    summary: {
      totalInvested: Number(totalCashInvested.toFixed(2)),
      totalNetInvested: Number(totalNetInvested.toFixed(2)),
      totalFeesPaid: Number(totalFeesPaid.toFixed(2)),
      totalUnits: Number(totalUnits.toFixed(8)),
      averageCostPerUnit: Number(breakEvenPrice.toFixed(4)),
      pureAverageCost: Number(pureAverageCost.toFixed(4)),
      finalPrice: Number(finalPrice.toFixed(4)),
      endingPortfolioValue: Number(endingPortfolioValue.toFixed(2)),
      totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
      roiPct: Number(roiPct.toFixed(2)),
      breakEvenPrice: Number(breakEvenPrice.toFixed(4)),
      feeDragPct: Number(feeDragPct.toFixed(2)),
      isProfitable: totalProfitLoss >= 0,
    },
    lumpSumBenchmark: {
      totalInvested: Number(totalCashInvested.toFixed(2)),
      lumpUnits: Number(lumpUnits.toFixed(8)),
      lumpFeesPaid: Number(lumpFee.toFixed(2)),
      endingValue: Number(lumpEndingValue.toFixed(2)),
      profitLoss: Number(lumpProfitLoss.toFixed(2)),
      roiPct: Number(lumpRoiPct.toFixed(2)),
      dcaVsLumpDiff: Number(dcaVsLumpDiff.toFixed(2)),
      dcaVsLumpRoiDiff: Number(dcaVsLumpRoiDiff.toFixed(2)),
      dcaOutperformed,
    },
    pricePath,
    schedule,
  };
}

export const calculateDollarCostAveraging = calculateDca;
export const calculatePeriodicInvestment = calculateDca;
