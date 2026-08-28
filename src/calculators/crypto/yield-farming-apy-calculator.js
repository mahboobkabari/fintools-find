/**
 * Flagship Yield Farming APY & DeFi Reward Calculation Engine (Sprint 88 / Flagship #95)
 * 
 * Comprehensive decentralized finance (DeFi) yield farming, liquidity mining,
 * compounding frequencies, fee decomposition, and reward-token price sensitivity engine:
 * 1. Bidirectional APR <-> APY conversion across standard compounding frequencies
 * 2. Gross vs Net Yield Accumulation over arbitrary farming durations
 * 3. Multi-tier Fee Modeling (Deposit Fees, Performance/Reward Fees, Withdrawal Fees)
 * 4. Reward-Token Price Volatility & Depreciation Sensitivity
 * 5. Optional Impermanent Loss (IL) integration for LP token farming
 * 6. Analytical Break-Even Fee Hurdle Rate and Break-Even Reward Token Price Solver
 * 7. Compounding Frequency Benchmarking Table (None, Annual, Semi-Annual, Quarterly, Monthly, Weekly, Daily, Continuous)
 * 8. Multi-Currency Quoting (USD, EUR, GBP, INR, CAD, AUD, AED, SGD, JPY)
 * 
 * DISCLAIMER: Yield farming involves protocol smart-contract risk, liquidation risk, and severe token depreciation risk.
 * Yields fluctuate continuously in real-time. This calculator is for educational scenario modeling only.
 */

import { calculateImpermanentLossFactor } from './impermanent-loss-calculator.js';

export const COMPOUNDING_FREQUENCIES = {
  NONE: { id: 'NONE', label: 'Simple (No Compounding)', periodsPerYear: 0 },
  ANNUALLY: { id: 'ANNUALLY', label: 'Annual (1x / yr)', periodsPerYear: 1 },
  SEMI_ANNUALLY: { id: 'SEMI_ANNUALLY', label: 'Semi-Annual (2x / yr)', periodsPerYear: 2 },
  QUARTERLY: { id: 'QUARTERLY', label: 'Quarterly (4x / yr)', periodsPerYear: 4 },
  MONTHLY: { id: 'MONTHLY', label: 'Monthly (12x / yr)', periodsPerYear: 12 },
  WEEKLY: { id: 'WEEKLY', label: 'Weekly (52x / yr)', periodsPerYear: 52 },
  DAILY: { id: 'DAILY', label: 'Daily (365x / yr)', periodsPerYear: 365 },
  CONTINUOUS: { id: 'CONTINUOUS', label: 'Continuous Compounding', periodsPerYear: Infinity },
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
 * Safely sanitizes a number within boundaries.
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
 * Converts APR (Annual Percentage Rate) to APY (Annual Percentage Yield).
 * Formula: APY = (1 + APR / m)^m - 1
 * 
 * @param {number} apr - Annual percentage rate (e.g. 20 for 20%)
 * @param {number} periodsPerYear - Compounding frequency (e.g. 365 for daily, 0 for none, Infinity for continuous)
 * @returns {number} APY percentage
 */
export function convertAprToApy(apr, periodsPerYear = 365) {
  const r = sanitizeNumber(apr, 0, 0, 100000) / 100;
  if (r === 0) return 0;
  const m = Number(periodsPerYear);

  if (m === 0) {
    return Number((r * 100).toFixed(4));
  }
  if (!isFinite(m) || m === Infinity) {
    const apyCont = Math.exp(r) - 1;
    return Number((apyCont * 100).toFixed(4));
  }

  const apy = Math.pow(1 + r / m, m) - 1;
  return Number((apy * 100).toFixed(4));
}

/**
 * Converts APY (Annual Percentage Yield) to APR (Annual Percentage Rate).
 * Formula: APR = m * ((1 + APY)^(1/m) - 1)
 * 
 * @param {number} apy - Annual percentage yield (e.g. 22.13 for 22.13%)
 * @param {number} periodsPerYear - Compounding frequency
 * @returns {number} APR percentage
 */
export function convertApyToApr(apy, periodsPerYear = 365) {
  const y = sanitizeNumber(apy, 0, 0, 1000000) / 100;
  if (y === 0) return 0;
  const m = Number(periodsPerYear);

  if (m === 0) {
    return Number((y * 100).toFixed(4));
  }
  if (!isFinite(m) || m === Infinity) {
    const aprCont = Math.log(1 + y);
    return Number((aprCont * 100).toFixed(4));
  }

  const apr = m * (Math.pow(1 + y, 1 / m) - 1);
  return Number((apr * 100).toFixed(4));
}

/**
 * Generates a comparison matrix of returns across all compounding frequencies.
 * 
 * @param {number} principal - Net initial deposit ($)
 * @param {number} apr - Annual percentage rate (%)
 * @param {number} durationDays - Farming period in days
 * @returns {Array<Object>}
 */
export function generateCompoundingComparison(principal = 10000, apr = 20, durationDays = 365) {
  const p = sanitizeNumber(principal, 10000, 0);
  const r = sanitizeNumber(apr, 20, 0) / 100;
  const t = sanitizeNumber(durationDays, 365, 1) / 365;

  return Object.keys(COMPOUNDING_FREQUENCIES).map((k) => {
    const freq = COMPOUNDING_FREQUENCIES[k];
    const m = freq.periodsPerYear;
    let endBalance = p;
    let effectiveApy = 0;

    if (m === 0) {
      // Simple interest
      endBalance = p * (1 + r * t);
      effectiveApy = r * 100;
    } else if (!isFinite(m) || m === Infinity) {
      // Continuous
      endBalance = p * Math.exp(r * t);
      effectiveApy = (Math.exp(r) - 1) * 100;
    } else {
      // Discrete
      const n = m * t;
      endBalance = p * Math.pow(1 + r / m, n);
      effectiveApy = (Math.pow(1 + r / m, m) - 1) * 100;
    }

    const yieldAmount = endBalance - p;

    return {
      id: freq.id,
      label: freq.label,
      periodsPerYear: m,
      effectiveApyPct: Number(effectiveApy.toFixed(2)),
      endingBalance: Number(endBalance.toFixed(2)),
      grossYield: Number(yieldAmount.toFixed(2)),
      effectiveRoiPct: p > 0 ? Number(((yieldAmount / p) * 100).toFixed(2)) : 0,
    };
  });
}

/**
 * Primary pure calculation engine for Yield Farming APY & DeFi returns.
 * 
 * @param {Object} [inputs={}]
 * @param {number} [inputs.initialDeposit=10000] - Total initial capital in fiat ($)
 * @param {string} [inputs.rateMode='APR'] - 'APR' | 'APY'
 * @param {number} [inputs.interestRate=30] - Quoted percentage rate (%)
 * @param {string} [inputs.compoundingFrequency='DAILY'] - ID from COMPOUNDING_FREQUENCIES
 * @param {number} [inputs.farmingDurationDays=90] - Farming duration in calendar days
 * @param {number} [inputs.depositFeePct=0] - Protocol deposit fee (%)
 * @param {number} [inputs.performanceFeePct=2] - Platform fee on earned yield (%)
 * @param {number} [inputs.withdrawalFeePct=0] - Protocol exit fee (%)
 * @param {boolean} [inputs.isRewardTokenVolatile=false] - Whether reward asset changes in price
 * @param {number} [inputs.initialRewardTokenPrice=10] - Initial spot price of reward token
 * @param {number} [inputs.finalRewardTokenPrice=10] - Final spot price of reward token upon harvesting
 * @param {boolean} [inputs.isLpMode=false] - Whether farming with LP tokens subject to IL
 * @param {number} [inputs.lpPriceRatio=1.0] - Relative price ratio of underlying pooled pair
 * @param {string} [inputs.currency='USD'] - Quote fiat currency
 * @param {string} [inputs.poolName='DeFi Liquidity Farm'] - Name or protocol label
 * @returns {Object} Comprehensive yield farming analytics breakdown
 */
export function calculateYieldFarming(inputs = {}) {
  const {
    initialDeposit = 10000,
    rateMode = 'APR',
    interestRate = 30,
    compoundingFrequency = 'DAILY',
    farmingDurationDays = 90,
    depositFeePct = 0,
    performanceFeePct = 2,
    withdrawalFeePct = 0,
    isRewardTokenVolatile = false,
    initialRewardTokenPrice = 10,
    finalRewardTokenPrice = 10,
    isLpMode = false,
    lpPriceRatio = 1.0,
    currency = 'USD',
    poolName = 'DeFi Liquidity Farm',
  } = inputs;

  // 1. INPUT SANITIZATION
  const cleanDeposit = sanitizeNumber(initialDeposit, 10000, 0);
  const cleanRate = sanitizeNumber(interestRate, 30, 0, 100000);
  const cleanDurationDays = sanitizeNumber(farmingDurationDays, 90, 0, 36500);
  const cleanDepositFeePct = sanitizeNumber(depositFeePct, 0, 0, 50);
  const cleanPerfFeePct = sanitizeNumber(performanceFeePct, 0, 0, 50);
  const cleanWithFeePct = sanitizeNumber(withdrawalFeePct, 0, 0, 50);
  const cleanInitRewardPrice = sanitizeNumber(initialRewardTokenPrice, 10, 0.00000001);
  const cleanFinalRewardPrice = sanitizeNumber(finalRewardTokenPrice, 10, 0.00000001);
  const cleanLpRatio = sanitizeNumber(lpPriceRatio, 1.0, 0.00000001);

  const currMeta = FIAT_CURRENCIES[currency] || FIAT_CURRENCIES.USD;
  const freq = COMPOUNDING_FREQUENCIES[compoundingFrequency] || COMPOUNDING_FREQUENCIES.DAILY;
  const m = freq.periodsPerYear;
  const durationYears = cleanDurationDays / 365;

  // 2. RESOLVE APR AND APY
  let baseApr = 0;
  let baseApy = 0;

  if (rateMode === 'APY') {
    baseApy = cleanRate;
    baseApr = convertApyToApr(cleanRate, m);
  } else {
    baseApr = cleanRate;
    baseApy = convertAprToApy(cleanRate, m);
  }

  const r = baseApr / 100;

  // 3. DEPOSIT FEE DEDUCTION
  const depositFeeAmount = cleanDeposit * (cleanDepositFeePct / 100);
  const netPrincipalDeposited = Math.max(0, cleanDeposit - depositFeeAmount);

  // 4. GROSS YIELD ACCUMULATION
  let endingGrossBalance = netPrincipalDeposited;

  if (netPrincipalDeposited > 0 && r > 0 && cleanDurationDays > 0) {
    if (m === 0) {
      // Simple interest
      endingGrossBalance = netPrincipalDeposited * (1 + r * durationYears);
    } else if (!isFinite(m) || m === Infinity) {
      // Continuous
      endingGrossBalance = netPrincipalDeposited * Math.exp(r * durationYears);
    } else {
      // Discrete
      const n = m * durationYears;
      endingGrossBalance = netPrincipalDeposited * Math.pow(1 + r / m, n);
    }
  }

  const baseGrossYield = Math.max(0, endingGrossBalance - netPrincipalDeposited);

  // 5. REWARD TOKEN VOLATILITY & PRICE SENSITIVITY
  let adjustedGrossYield = baseGrossYield;
  let rewardTokensEarned = 0;
  let rewardPriceChangePct = 0;
  let rewardTokenValueImpact = 0;

  if (isRewardTokenVolatile && cleanInitRewardPrice > 0) {
    rewardTokensEarned = baseGrossYield / cleanInitRewardPrice;
    const finalRewardValue = rewardTokensEarned * cleanFinalRewardPrice;
    rewardPriceChangePct = ((cleanFinalRewardPrice - cleanInitRewardPrice) / cleanInitRewardPrice) * 100;
    rewardTokenValueImpact = finalRewardValue - baseGrossYield;
    adjustedGrossYield = Math.max(0, finalRewardValue);
  }

  // 6. PERFORMANCE & WITHDRAWAL FEES
  const performanceFeeAmount = adjustedGrossYield * (cleanPerfFeePct / 100);
  const balanceAfterPerfFee = netPrincipalDeposited + (adjustedGrossYield - performanceFeeAmount);
  const withdrawalFeeAmount = balanceAfterPerfFee * (cleanWithFeePct / 100);

  const totalFeesPaid = depositFeeAmount + performanceFeeAmount + withdrawalFeeAmount;

  // 7. IMPERMANENT LOSS INTEGRATION (OPTIONAL LP MODE)
  let impermanentLossPct = 0;
  let impermanentLossDollarDrag = 0;

  if (isLpMode && cleanLpRatio > 0) {
    const { factor, ilPct } = calculateImpermanentLossFactor(cleanLpRatio);
    impermanentLossPct = ilPct;
    // Applied to the principal deposited in the pool
    impermanentLossDollarDrag = netPrincipalDeposited * (factor - 1);
  }

  // 8. NET YIELD & NET OUTCOMES
  const netFarmingYieldWithoutIl = (adjustedGrossYield - performanceFeeAmount) - depositFeeAmount - withdrawalFeeAmount;
  const totalNetProfit = netFarmingYieldWithoutIl + impermanentLossDollarDrag;
  const netEndingBalance = cleanDeposit + totalNetProfit;

  const netRoiPct = cleanDeposit > 0 ? (totalNetProfit / cleanDeposit) * 100 : 0;

  // Net Annualized APY %: (1 + netReturn/principal)^(1/years) - 1
  let netAnnualizedApyPct = 0;
  if (cleanDeposit > 0 && durationYears > 0) {
    const netMultiplier = (cleanDeposit + totalNetProfit) / cleanDeposit;
    if (netMultiplier > 0) {
      netAnnualizedApyPct = (Math.pow(netMultiplier, 1 / durationYears) - 1) * 100;
    } else {
      netAnnualizedApyPct = -100;
    }
  }

  // Fee Drag %
  const feeDragPct = adjustedGrossYield > 0 ? (totalFeesPaid / adjustedGrossYield) * 100 : 0;

  // 9. BREAK-EVEN ANALYSIS
  // Minimum gross yield needed to cover all fees (Deposit + Withdrawal + Performance)
  // Total fees = DepFee + withFee*(Principal + Yield*(1-perfFee)) + perfFee*Yield
  // Yield*(1 - perfFee)*(1 - withFee) = DepFee + withFee*Principal
  const requiredGrossYieldToBreakEven = (cleanPerfFeePct < 100 && cleanWithFeePct < 100)
    ? (depositFeeAmount + (netPrincipalDeposited * (cleanWithFeePct / 100))) /
      ((1 - cleanPerfFeePct / 100) * (1 - cleanWithFeePct / 100))
    : 0;

  const breakEvenAnnualApr = (netPrincipalDeposited > 0 && durationYears > 0)
    ? (requiredGrossYieldToBreakEven / netPrincipalDeposited) * (1 / durationYears) * 100
    : 0;

  // Break-even reward token price (if volatile rewards enabled)
  let breakEvenRewardPrice = cleanInitRewardPrice;
  if (isRewardTokenVolatile && rewardTokensEarned > 0) {
    // Reward value needed to cover total fees and yield zero net loss
    breakEvenRewardPrice = totalFeesPaid / rewardTokensEarned;
  }

  // 10. PERIODIC YIELD EQUIVALENTS
  const dailyYieldGross = durationYears > 0 ? baseGrossYield / cleanDurationDays : 0;
  const monthlyYieldGross = dailyYieldGross * 30.4375;
  const annualGrossProjected = (cleanDeposit * (baseApr / 100));

  // 11. COMPOUNDING BENCHMARK TABLE
  const compoundingComparison = generateCompoundingComparison(netPrincipalDeposited, baseApr, cleanDurationDays);

  return {
    inputs: {
      initialDeposit: cleanDeposit,
      rateMode,
      interestRate: cleanRate,
      compoundingFrequency: freq.id,
      farmingDurationDays: cleanDurationDays,
      depositFeePct: cleanDepositFeePct,
      performanceFeePct: cleanPerfFeePct,
      withdrawalFeePct: cleanWithFeePct,
      isRewardTokenVolatile,
      initialRewardTokenPrice: cleanInitRewardPrice,
      finalRewardTokenPrice: cleanFinalRewardPrice,
      isLpMode,
      lpPriceRatio: cleanLpRatio,
      currency: currMeta.code,
      poolName,
    },
    meta: {
      currencySymbol: currMeta.symbol,
      currencyCode: currMeta.code,
      currencyDecimals: currMeta.decimals,
      baseApr: Number(baseApr.toFixed(4)),
      baseApy: Number(baseApy.toFixed(4)),
      compoundingLabel: freq.label,
      periodsPerYear: m,
      durationYears: Number(durationYears.toFixed(4)),
      rewardTokensEarned: Number(rewardTokensEarned.toFixed(6)),
      rewardPriceChangePct: Number(rewardPriceChangePct.toFixed(2)),
      rewardTokenValueImpact: Number(rewardTokenValueImpact.toFixed(2)),
      impermanentLossPct: Number(impermanentLossPct.toFixed(4)),
      impermanentLossDollarDrag: Number(impermanentLossDollarDrag.toFixed(2)),
    },
    fees: {
      depositFeeAmount: Number(depositFeeAmount.toFixed(2)),
      performanceFeeAmount: Number(performanceFeeAmount.toFixed(2)),
      withdrawalFeeAmount: Number(withdrawalFeeAmount.toFixed(2)),
      totalFeesPaid: Number(totalFeesPaid.toFixed(2)),
      feeDragPct: Number(feeDragPct.toFixed(2)),
    },
    summary: {
      initialDeposit: Number(cleanDeposit.toFixed(2)),
      netPrincipalDeposited: Number(netPrincipalDeposited.toFixed(2)),
      baseGrossYield: Number(baseGrossYield.toFixed(2)),
      adjustedGrossYield: Number(adjustedGrossYield.toFixed(2)),
      endingGrossBalance: Number(endingGrossBalance.toFixed(2)),
      totalNetProfit: Number(totalNetProfit.toFixed(2)),
      netEndingBalance: Number(netEndingBalance.toFixed(2)),
      netRoiPct: Number(netRoiPct.toFixed(2)),
      netAnnualizedApyPct: Number(netAnnualizedApyPct.toFixed(2)),
      dailyYieldGross: Number(dailyYieldGross.toFixed(2)),
      monthlyYieldGross: Number(monthlyYieldGross.toFixed(2)),
      annualGrossProjected: Number(annualGrossProjected.toFixed(2)),
      breakEvenGrossYield: Number(requiredGrossYieldToBreakEven.toFixed(2)),
      breakEvenAnnualApr: Number(breakEvenAnnualApr.toFixed(2)),
      breakEvenRewardPrice: Number(breakEvenRewardPrice.toFixed(4)),
    },
    compoundingComparison,
  };
}

export const calculateDeFiYieldFarmingApy = calculateYieldFarming;
export const calculateLiquidityMiningYield = calculateYieldFarming;
