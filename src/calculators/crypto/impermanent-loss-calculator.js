/**
 * Flagship Impermanent Loss & DeFi Liquidity Pool Analysis Engine (Sprint 87 / Flagship #94)
 * 
 * Standard Constant-Product AMM (x * y = k, 50/50 pool) formulation:
 * 1. Price ratio divergence: r = (P_A1 / P_B1) / (P_A0 / P_B0)
 * 2. Standard Impermanent Loss Factor: IL = 2 * sqrt(r) / (1 + r) - 1
 * 3. Exact pool token quantity rebalancing (A1 = A0 / sqrt(r), B1 = B0 * sqrt(r))
 * 4. HODL portfolio valuation vs LP position valuation
 * 5. Trading fee & liquidity mining yield compounding
 * 6. Analytical break-even fee yield solver
 * 7. Price-ratio sensitivity matrix and IL curve generator
 * 
 * Sourced from Uniswap v2 / Bancor / Automated Market Maker literature.
 */

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
 * Standard relative price multipliers for sensitivity curves.
 */
export const SENSITIVITY_RATIOS = [
  0.10, 0.20, 0.25, 0.3333, 0.50, 0.6667, 0.75, 0.90,
  1.00,
  1.10, 1.25, 1.50, 1.75, 2.00, 2.50, 3.00, 4.00, 5.00, 10.00,
];

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
 * Computes the pure Impermanent Loss factor and percentage for a given relative price ratio r.
 * Formula: IL Factor = 2 * sqrt(r) / (1 + r)
 * 
 * @param {number} priceRatio - New relative price ratio r = (P_A1/P_B1) / (P_A0/P_B0)
 * @returns {Object} { factor, ilPct }
 */
export function calculateImpermanentLossFactor(priceRatio) {
  const raw = Number(priceRatio);
  if (isNaN(raw) || raw <= 0) {
    return { factor: 0, ilPct: -100 };
  }
  const r = Math.min(raw, 1000000);
  const factor = (2 * Math.sqrt(r)) / (1 + r);
  const ilPct = (factor - 1) * 100;
  return {
    factor,
    ilPct: Number(ilPct.toFixed(4)),
  };
}

/**
 * Generates a full price-ratio sensitivity curve for a 50/50 constant-product pool.
 * 
 * @param {number} initialInvestment - Total initial deposit in fiat ($)
 * @param {number} initialPriceA - Initial price of token A
 * @param {number} initialPriceB - Initial price of token B
 * @returns {Array<Object>}
 */
export function generateSensitivityMatrix(initialInvestment = 10000, initialPriceA = 2000, initialPriceB = 1.0) {
  const v0 = sanitizeNumber(initialInvestment, 10000, 0);
  const pA0 = sanitizeNumber(initialPriceA, 2000, 0.00000001);
  const pB0 = sanitizeNumber(initialPriceB, 1.0, 0.00000001);

  const a0 = pA0 > 0 ? (v0 / 2) / pA0 : 0;
  const b0 = pB0 > 0 ? (v0 / 2) / pB0 : 0;

  return SENSITIVITY_RATIOS.map((r) => {
    const { factor, ilPct } = calculateImpermanentLossFactor(r);
    // Assume Token B price is constant to isolate Token A movement for explicit illustration
    const pA1 = pA0 * r;
    const pB1 = pB0;

    const a1 = a0 / Math.sqrt(r);
    const b1 = b0 * Math.sqrt(r);

    const hodlVal = a0 * pA1 + b0 * pB1;
    const lpVal = a1 * pA1 + b1 * pB1;
    const ilDollar = lpVal - hodlVal;

    return {
      ratio: r,
      ratioLabel: r >= 1 ? `${r}x` : `${r.toFixed(2)}x`,
      priceChangePct: Number(((r - 1) * 100).toFixed(2)),
      tokenAPrice: Number(pA1.toFixed(2)),
      ilPct,
      hodlValue: Number(hodlVal.toFixed(2)),
      lpValue: Number(lpVal.toFixed(2)),
      ilDollarImpact: Number(ilDollar.toFixed(2)),
    };
  });
}

/**
 * Primary pure calculation engine for Impermanent Loss & LP vs HODL benchmarking.
 * 
 * @param {Object} [inputs={}]
 * @param {string} [inputs.tokenAName='Ethereum (ETH)'] - Name/symbol of Token A
 * @param {string} [inputs.tokenBName='USDC / USD'] - Name/symbol of Token B (often stablecoin)
 * @param {number} [inputs.initialPriceA=2000] - Token A initial spot price in fiat
 * @param {number} [inputs.finalPriceA=4000] - Token A final spot price in fiat
 * @param {number} [inputs.initialPriceB=1.0] - Token B initial spot price in fiat
 * @param {number} [inputs.finalPriceB=1.0] - Token B final spot price in fiat
 * @param {number} [inputs.initialInvestment=10000] - Total fiat capital deposited (50% in A, 50% in B)
 * @param {number} [inputs.feeAprPct=15] - Annualized trading fee yield assumption (%)
 * @param {number} [inputs.feeRevenueAmount=0] - Direct fee revenue override ($)
 * @param {number} [inputs.holdingDays=90] - Duration of liquidity provision in calendar days
 * @param {string} [inputs.currency='USD'] - Quote fiat currency
 * @param {string} [inputs.calculationMode='EXPLICIT_PRICES'] - 'EXPLICIT_PRICES' | 'PERCENTAGE_CHANGE'
 * @param {number} [inputs.priceChangePctA=100] - Token A price change % in percentage mode
 * @param {number} [inputs.priceChangePctB=0] - Token B price change % in percentage mode
 * @returns {Object} Comprehensive impermanent loss analytics breakdown
 */
export function calculateImpermanentLoss(inputs = {}) {
  const {
    tokenAName = 'Ethereum (ETH)',
    tokenBName = 'USDC / USD',
    initialPriceA = 2000,
    finalPriceA = 4000,
    initialPriceB = 1.0,
    finalPriceB = 1.0,
    initialInvestment = 10000,
    feeAprPct = 15,
    feeRevenueAmount = 0,
    holdingDays = 90,
    currency = 'USD',
    calculationMode = 'EXPLICIT_PRICES',
    priceChangePctA = 100,
    priceChangePctB = 0,
  } = inputs;

  // 1. INPUT SANITIZATION
  const cleanInitA = sanitizeNumber(initialPriceA, 2000, 0.00000001);
  const cleanInitB = sanitizeNumber(initialPriceB, 1.0, 0.00000001);
  const cleanInvest = sanitizeNumber(initialInvestment, 10000, 0);
  const cleanHoldingDays = sanitizeNumber(holdingDays, 90, 0, 36500);
  const cleanFeeApr = sanitizeNumber(feeAprPct, 0, 0, 5000);
  const cleanFeeOverride = sanitizeNumber(feeRevenueAmount, 0, 0);

  const currMeta = FIAT_CURRENCIES[currency] || FIAT_CURRENCIES.USD;

  // 2. RESOLVE FINAL SPOT PRICES
  let cleanFinalA = cleanInitA;
  let cleanFinalB = cleanInitB;

  if (calculationMode === 'PERCENTAGE_CHANGE') {
    const chgA = sanitizeNumber(priceChangePctA, 0, -99.9999, 100000);
    const chgB = sanitizeNumber(priceChangePctB, 0, -99.9999, 100000);
    cleanFinalA = cleanInitA * (1 + chgA / 100);
    cleanFinalB = cleanInitB * (1 + chgB / 100);
  } else {
    cleanFinalA = sanitizeNumber(finalPriceA, cleanInitA, 0.00000001);
    cleanFinalB = sanitizeNumber(finalPriceB, cleanInitB, 0.00000001);
  }

  // 3. RELATIVE PRICE RATIO (r)
  // r = (P_A1 / P_B1) / (P_A0 / P_B0) = (P_A1 * P_B0) / (P_A0 * P_B1)
  const initialRatio = cleanInitA / cleanInitB;
  const finalRatio = cleanFinalA / cleanFinalB;
  const priceRatio = initialRatio > 0 ? finalRatio / initialRatio : 1.0;

  // 4. INITIAL TOKEN BALANCES (50/50 POOL COMPOSITION)
  const initialValueA = cleanInvest / 2;
  const initialValueB = cleanInvest / 2;
  const initialQtyA = cleanInitA > 0 ? initialValueA / cleanInitA : 0;
  const initialQtyB = cleanInitB > 0 ? initialValueB / cleanInitB : 0;
  const poolConstantK = initialQtyA * initialQtyB;

  // 5. RESULTING TOKEN BALANCES AFTER ARBITRAGE REBALANCING
  // Under constant product (x * y = k): A1 = A0 / sqrt(r), B1 = B0 * sqrt(r)
  const sqrtR = Math.sqrt(priceRatio);
  const finalQtyA = sqrtR > 0 ? initialQtyA / sqrtR : 0;
  const finalQtyB = initialQtyB * sqrtR;

  // Verify invariant: finalQtyA * finalQtyB === poolConstantK
  const resultingValueA = finalQtyA * cleanFinalA;
  const resultingValueB = finalQtyB * cleanFinalB;

  // 6. PORTFOLIO VALUATIONS (HODL VS LP)
  const hodlValue = (initialQtyA * cleanFinalA) + (initialQtyB * cleanFinalB);
  const lpValueWithoutFees = resultingValueA + resultingValueB;

  // 7. PURE IMPERMANENT LOSS
  const { factor: ilFactor, ilPct } = calculateImpermanentLossFactor(priceRatio);
  const pureIlDollar = lpValueWithoutFees - hodlValue;

  // 8. TRADING FEE & YIELD ACCRUAL
  let totalFeesEarned = 0;
  if (cleanFeeOverride > 0) {
    totalFeesEarned = cleanFeeOverride;
  } else if (cleanFeeApr > 0 && cleanHoldingDays > 0) {
    // Standard estimation: initial deposit * (feeApr / 100) * (holdingDays / 365)
    totalFeesEarned = cleanInvest * (cleanFeeApr / 100) * (cleanHoldingDays / 365);
  }

  // 9. FEE-ADJUSTED LP METRICS
  const feeAdjustedLpValue = lpValueWithoutFees + totalFeesEarned;
  const netLpAdvantage = feeAdjustedLpValue - hodlValue; // LP vs HODL net difference
  const isLpSuperior = netLpAdvantage > 0;
  const isLpInferior = netLpAdvantage < 0;

  // 10. RETURNS ON INITIAL INVESTMENT (ROI %)
  const hodlProfitDollar = hodlValue - cleanInvest;
  const hodlRoiPct = cleanInvest > 0 ? (hodlProfitDollar / cleanInvest) * 100 : 0;

  const lpProfitDollar = feeAdjustedLpValue - cleanInvest;
  const lpRoiPct = cleanInvest > 0 ? (lpProfitDollar / cleanInvest) * 100 : 0;

  // 11. BREAK-EVEN FEE SOLVER
  const breakEvenFeesRequired = Math.max(0, hodlValue - lpValueWithoutFees);
  const breakEvenFeePctOfHodl = hodlValue > 0 ? (breakEvenFeesRequired / hodlValue) * 100 : 0;
  const breakEvenAnnualApr = (cleanInvest > 0 && cleanHoldingDays > 0)
    ? (breakEvenFeesRequired / cleanInvest) * (365 / cleanHoldingDays) * 100
    : 0;

  // 12. SENSITIVITY MATRIX
  const sensitivityMatrix = generateSensitivityMatrix(cleanInvest, cleanInitA, cleanInitB);

  return {
    inputs: {
      tokenAName,
      tokenBName,
      initialPriceA: cleanInitA,
      finalPriceA: cleanFinalA,
      initialPriceB: cleanInitB,
      finalPriceB: cleanFinalB,
      initialInvestment: cleanInvest,
      feeAprPct: cleanFeeApr,
      feeRevenueAmount: cleanFeeOverride,
      holdingDays: cleanHoldingDays,
      currency: currMeta.code,
      calculationMode,
      priceChangePctA,
      priceChangePctB,
    },
    meta: {
      currencySymbol: currMeta.symbol,
      currencyCode: currMeta.code,
      currencyDecimals: currMeta.decimals,
      initialRatio: Number(initialRatio.toFixed(6)),
      finalRatio: Number(finalRatio.toFixed(6)),
      priceRatio: Number(priceRatio.toFixed(6)),
      ilFactor: Number(ilFactor.toFixed(6)),
      poolConstantK: Number(poolConstantK.toFixed(8)),
      priceChangePctTokenA: Number((((cleanFinalA - cleanInitA) / cleanInitA) * 100).toFixed(2)),
      priceChangePctTokenB: Number((((cleanFinalB - cleanInitB) / cleanInitB) * 100).toFixed(2)),
      isLpSuperior,
      isLpInferior,
    },
    poolComposition: {
      initial: {
        qtyA: Number(initialQtyA.toFixed(6)),
        qtyB: Number(initialQtyB.toFixed(6)),
        valueA: Number(initialValueA.toFixed(2)),
        valueB: Number(initialValueB.toFixed(2)),
        totalValue: Number(cleanInvest.toFixed(2)),
      },
      final: {
        qtyA: Number(finalQtyA.toFixed(6)),
        qtyB: Number(finalQtyB.toFixed(6)),
        valueA: Number(resultingValueA.toFixed(2)),
        valueB: Number(resultingValueB.toFixed(2)),
        totalValue: Number(lpValueWithoutFees.toFixed(2)),
      },
      tokensRebalanced: {
        deltaQtyA: Number((finalQtyA - initialQtyA).toFixed(6)),
        deltaQtyB: Number((finalQtyB - initialQtyB).toFixed(6)),
      },
    },
    summary: {
      initialInvestment: Number(cleanInvest.toFixed(2)),
      hodlValue: Number(hodlValue.toFixed(2)),
      lpValueWithoutFees: Number(lpValueWithoutFees.toFixed(2)),
      pureImpermanentLossPct: ilPct,
      pureIlDollarImpact: Number(pureIlDollar.toFixed(2)),
      totalFeesEarned: Number(totalFeesEarned.toFixed(2)),
      feeAdjustedLpValue: Number(feeAdjustedLpValue.toFixed(2)),
      netLpAdvantage: Number(netLpAdvantage.toFixed(2)),
      hodlProfitDollar: Number(hodlProfitDollar.toFixed(2)),
      hodlRoiPct: Number(hodlRoiPct.toFixed(2)),
      lpProfitDollar: Number(lpProfitDollar.toFixed(2)),
      lpRoiPct: Number(lpRoiPct.toFixed(2)),
      breakEvenFeesRequired: Number(breakEvenFeesRequired.toFixed(2)),
      breakEvenFeePctOfHodl: Number(breakEvenFeePctOfHodl.toFixed(2)),
      breakEvenAnnualApr: Number(breakEvenAnnualApr.toFixed(2)),
    },
    sensitivityMatrix,
  };
}

export const calculateAmmImpermanentLoss = calculateImpermanentLoss;
export const calculateDeFiLpReturns = calculateImpermanentLoss;
