/**
 * Flagship Crypto Profit/Loss & Cost Basis Decision Engine (Sprint 82 / Flagship #89)
 * 
 * Institutional-grade cryptocurrency return, fee decomposition, and break-even engine:
 * 1. Single Position & Multi-Lot Weighted Average Cost Basis
 * 2. Exchange Trading Fees (Maker/Taker %) & Fixed Network Gas / Blockchain Fees
 * 3. Gross vs Net Sale Proceeds and Total Cost Basis
 * 4. Absolute Profit/Loss (Fiat & %) and Return on Investment (ROI %)
 * 5. Analytical Break-Even Exit Price Solver accounting for forward exit fees
 * 6. Realized (Sold) vs Unrealized (Paper Gain/Loss) Position Modeling
 * 7. Multi-Currency Support (USD, EUR, GBP, INR, CAD, AUD, AED, SGD, JPY)
 */

export const CRYPTO_POSITION_MODES = {
  UNREALIZED: {
    id: 'UNREALIZED',
    label: 'Unrealized (Holding Position)',
    desc: 'Paper profit/loss based on current market valuation.',
  },
  REALIZED: {
    id: 'REALIZED',
    label: 'Realized (Closed / Sold Position)',
    desc: 'Locked-in net profit/loss from completed exit trade.',
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
 * Calculates comprehensive cryptocurrency profit/loss metrics.
 * 
 * @param {Object} [inputs={}]
 * @param {number} [inputs.quantity=1.0] - Amount of crypto tokens/coins
 * @param {number} [inputs.buyPrice=50000] - Acquisition unit price in fiat
 * @param {number} [inputs.sellPrice=65000] - Exit / current unit price in fiat
 * @param {number} [inputs.buyFeePct=0.1] - Exchange buy fee percentage (%)
 * @param {number} [inputs.sellFeePct=0.1] - Exchange sell fee percentage (%)
 * @param {number} [inputs.buyFixedFee=0] - Fixed fiat buy fee (e.g. card/wire surcharge)
 * @param {number} [inputs.sellFixedFee=0] - Fixed fiat exit fee
 * @param {number} [inputs.buyGasFee=0] - Blockchain network gas fee on purchase
 * @param {number} [inputs.sellGasFee=0] - Blockchain network gas fee on exit
 * @param {string} [inputs.currency='USD'] - Fiat quote currency code
 * @param {string} [inputs.positionMode='UNREALIZED'] - 'UNREALIZED' | 'REALIZED'
 * @param {string} [inputs.assetName='Bitcoin (BTC)'] - Name or symbol of crypto asset
 * @param {Array<Object>} [inputs.lots] - Optional multi-lot purchase history [{ quantity, buyPrice, fee }]
 * @returns {Object} Full analytics breakdown
 */
export function calculateCryptoProfitLoss(inputs = {}) {
  const {
    quantity = 1.0,
    buyPrice = 50000,
    sellPrice = 65000,
    buyFeePct = 0.1,
    sellFeePct = 0.1,
    buyFixedFee = 0,
    sellFixedFee = 0,
    buyGasFee = 0,
    sellGasFee = 0,
    currency = 'USD',
    positionMode = 'UNREALIZED',
    assetName = 'Bitcoin (BTC)',
    lots = null,
  } = inputs;

  // 1. INPUT SANITIZATION
  let cleanQty = Math.max(0, Number(quantity) || 0);
  let cleanBuyPrice = Math.max(0, Number(buyPrice) || 0);
  const cleanSellPrice = Math.max(0, Number(sellPrice) || 0);
  const cleanBuyFeePct = Math.max(0, Math.min(50, Number(buyFeePct) || 0));
  const cleanSellFeePct = Math.max(0, Math.min(50, Number(sellFeePct) || 0));
  const cleanBuyFixedFee = Math.max(0, Number(buyFixedFee) || 0);
  const cleanSellFixedFee = Math.max(0, Number(sellFixedFee) || 0);
  const cleanBuyGasFee = Math.max(0, Number(buyGasFee) || 0);
  const cleanSellGasFee = Math.max(0, Number(sellGasFee) || 0);

  const currKey = String(currency).trim().toUpperCase();
  const currMeta = FIAT_CURRENCIES[currKey] || FIAT_CURRENCIES.USD;
  const sym = currMeta.symbol;
  const currDecimals = currMeta.decimals;

  const mode = String(positionMode).toUpperCase() === 'REALIZED' ? 'REALIZED' : 'UNREALIZED';

  // 2. MULTI-LOT OR SINGLE POSITION COST BASIS
  let grossCostBasis = 0;
  let buyTradingFee = 0;
  let totalBuyFees = 0;
  let isMultiLot = false;

  if (Array.isArray(lots) && lots.length > 0) {
    isMultiLot = true;
    let totalLotQty = 0;
    let totalLotGrossCost = 0;
    let totalLotFees = 0;

    lots.forEach((lot) => {
      const q = Math.max(0, Number(lot.quantity) || 0);
      const p = Math.max(0, Number(lot.buyPrice) || 0);
      const f = Math.max(0, Number(lot.fee) || 0);
      totalLotQty += q;
      totalLotGrossCost += q * p;
      totalLotFees += f;
    });

    cleanQty = totalLotQty;
    grossCostBasis = Math.round(totalLotGrossCost * 100) / 100;
    cleanBuyPrice = cleanQty > 0 ? Math.round((grossCostBasis / cleanQty) * 100) / 100 : 0;
    buyTradingFee = Math.round(totalLotFees * 100) / 100;
    totalBuyFees = Math.round((buyTradingFee + cleanBuyFixedFee + cleanBuyGasFee) * 100) / 100;
  } else {
    grossCostBasis = Math.round((cleanQty * cleanBuyPrice) * 100) / 100;
    buyTradingFee = Math.round((grossCostBasis * (cleanBuyFeePct / 100)) * 100) / 100;
    totalBuyFees = Math.round((buyTradingFee + cleanBuyFixedFee + cleanBuyGasFee) * 100) / 100;
  }

  const totalCostBasis = Math.round((grossCostBasis + totalBuyFees) * 100) / 100;
  const effectiveBuyPrice = cleanQty > 0 ? Number((totalCostBasis / cleanQty).toFixed(4)) : cleanBuyPrice;

  // 3. EXIT PROCEEDS & FEES
  const grossProceeds = Math.round((cleanQty * cleanSellPrice) * 100) / 100;
  const sellTradingFee = Math.round((grossProceeds * (cleanSellFeePct / 100)) * 100) / 100;
  const totalSellFees = Math.round((sellTradingFee + cleanSellFixedFee + cleanSellGasFee) * 100) / 100;
  const netProceeds = Math.max(0, Math.round((grossProceeds - totalSellFees) * 100) / 100);
  const effectiveSellPrice = cleanQty > 0 ? Number((netProceeds / cleanQty).toFixed(4)) : cleanSellPrice;

  // 4. TOTAL TRANSACTION FRICTION
  const totalFeesPaid = Math.round((totalBuyFees + totalSellFees) * 100) / 100;
  const totalGasFeesPaid = Math.round((cleanBuyGasFee + cleanSellGasFee) * 100) / 100;

  // 5. PROFIT / LOSS & ROI
  const grossProfitLoss = Math.round((grossProceeds - grossCostBasis) * 100) / 100;
  const netProfitLoss = Math.round((netProceeds - totalCostBasis) * 100) / 100;

  const roiPct = totalCostBasis > 0
    ? Number(((netProfitLoss / totalCostBasis) * 100).toFixed(2))
    : 0;

  const grossRoiPct = grossCostBasis > 0
    ? Number(((grossProfitLoss / grossCostBasis) * 100).toFixed(2))
    : 0;

  // 6. ANALYTICAL BREAK-EVEN EXIT PRICE SOLVER
  // Net Proceeds = Total Cost Basis
  // Q * P_be * (1 - sellFeePct/100) - sellFixedFee - sellGasFee = Total Cost Basis
  // P_be = (Total Cost Basis + sellFixedFee + sellGasFee) / (Q * (1 - sellFeePct/100))
  const sellNetFactor = 1 - (cleanSellFeePct / 100);
  let breakEvenPrice = 0;
  if (cleanQty > 0 && sellNetFactor > 0) {
    const requiredGross = totalCostBasis + cleanSellFixedFee + cleanSellGasFee;
    breakEvenPrice = Number((requiredGross / (cleanQty * sellNetFactor)).toFixed(4));
  } else {
    breakEvenPrice = cleanBuyPrice;
  }

  const priceDiffPerUnit = Number((cleanSellPrice - cleanBuyPrice).toFixed(4));
  const priceChangePct = cleanBuyPrice > 0
    ? Number(((priceDiffPerUnit / cleanBuyPrice) * 100).toFixed(2))
    : 0;

  // 7. PROFIT/LOSS STATUS CLASSIFICATION
  let status = 'BREAK_EVEN';
  if (netProfitLoss > 0.01) {
    status = 'PROFIT';
  } else if (netProfitLoss < -0.01) {
    status = 'LOSS';
  }

  // 8. DYNAMIC HERO DECISION VERDICT
  let heroVerdict = '';
  const formattedNetPL = Math.abs(netProfitLoss).toLocaleString(undefined, {
    minimumFractionDigits: currDecimals,
    maximumFractionDigits: currDecimals,
  });

  if (status === 'PROFIT') {
    heroVerdict = `${mode === 'REALIZED' ? 'Realized Profit' : 'Unrealized Gain'}: +${sym}${formattedNetPL} (+${roiPct}% ROI). Net proceeds: ${sym}${netProceeds.toLocaleString()}.`;
  } else if (status === 'LOSS') {
    heroVerdict = `${mode === 'REALIZED' ? 'Realized Loss' : 'Unrealized Drawdown'}: -${sym}${formattedNetPL} (${roiPct}% ROI). Net proceeds: ${sym}${netProceeds.toLocaleString()}.`;
  } else {
    heroVerdict = `Break-Even Position: ${sym}0 net gain/loss after ${sym}${totalFeesPaid.toLocaleString()} in trading & network fees.`;
  }

  // 9. ACTIONABLE RECOMMENDATIONS & RISK INSIGHTS
  const recommendations = [];

  if (totalFeesPaid > Math.abs(netProfitLoss) && Math.abs(netProfitLoss) > 0) {
    recommendations.push({
      title: 'Fee Drag Exceeds Net Position Return',
      type: 'warning',
      description: `Cumulative trading & gas fees (${sym}${totalFeesPaid.toLocaleString()}) exceed your net return (${sym}${Math.abs(netProfitLoss).toLocaleString()}). Consider reducing transaction frequency or utilizing lower-cost layer-2 / limit-order routes.`,
    });
  }

  if (totalGasFeesPaid > 0 && totalGasFeesPaid > (grossProceeds * 0.02)) {
    recommendations.push({
      title: 'High Blockchain Gas Friction',
      type: 'warning',
      description: `On-chain network gas fees (${sym}${totalGasFeesPaid.toLocaleString()}) represent a significant fraction of capital. Batching transfers or transacting during low-congestion hours will improve net yield.`,
    });
  }

  if (status === 'PROFIT' && roiPct > 50) {
    recommendations.push({
      title: `Substantial Gains (+${roiPct}% ROI)`,
      type: 'positive',
      description: `Your position has appreciated significantly above your break-even exit threshold of ${sym}${breakEvenPrice.toLocaleString()}. Consider evaluating profit-taking frameworks or stop-loss mechanisms to manage volatility.`,
    });
  } else if (status === 'LOSS' && roiPct < -25) {
    recommendations.push({
      title: `Significant Position Drawdown (${roiPct}%)`,
      type: 'critical',
      description: `Current valuation (${sym}${cleanSellPrice.toLocaleString()}) is below your break-even price of ${sym}${breakEvenPrice.toLocaleString()}. Review your risk tolerance, position sizing, and stop-loss criteria.`,
    });
  } else {
    recommendations.push({
      title: `Break-Even Target: ${sym}${breakEvenPrice.toLocaleString()}`,
      type: 'info',
      description: `To fully recover your initial capital plus all buy and sell transaction fees, your exit price must reach at least ${sym}${breakEvenPrice.toLocaleString()} per unit.`,
    });
  }

  recommendations.push({
    title: 'Tax & Compliance Disclosure',
    type: 'info',
    description: 'This calculation reflects gross pre-tax investment performance. In many jurisdictions, crypto disposals, stablecoin swaps, and crypto-to-crypto trades trigger statutory capital gains tax events.',
  });

  return {
    quantity: cleanQty,
    buyPrice: cleanBuyPrice,
    sellPrice: cleanSellPrice,
    effectiveBuyPrice,
    effectiveSellPrice,
    priceDiffPerUnit,
    priceChangePct,
    currency: currKey,
    symbol: sym,
    decimals: currDecimals,
    positionMode: mode,
    assetName,
    isMultiLot,
    grossCostBasis,
    buyTradingFee,
    buyFixedFee: cleanBuyFixedFee,
    buyGasFee: cleanBuyGasFee,
    totalBuyFees,
    totalCostBasis,
    grossProceeds,
    sellTradingFee,
    sellFixedFee: cleanSellFixedFee,
    sellGasFee: cleanSellGasFee,
    totalSellFees,
    netProceeds,
    totalFeesPaid,
    totalGasFeesPaid,
    grossProfitLoss,
    netProfitLoss,
    roiPct,
    grossRoiPct,
    breakEvenPrice,
    status,
    heroVerdict,
    recommendations,
  };
}

// Aliases
export const calculateCryptoPl = calculateCryptoProfitLoss;
export const calculateCryptoGains = calculateCryptoProfitLoss;
export const calculateCryptoReturn = calculateCryptoProfitLoss;
