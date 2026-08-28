/**
 * Flagship Cryptocurrency Tax Calculation Engine (Sprint 86 / Flagship #93)
 * 
 * Comprehensive multi-jurisdiction cryptocurrency tax, cost basis, and income engine:
 * 1. Multi-jurisdiction rules (Generic, United States, India, United Kingdom, Germany, Australia)
 * 2. Transaction type classification (Sell, Swap, Buy, Staking Reward, Mining Reward, Airdrop, Transfer)
 * 3. Holding period calculation (Short-Term vs Long-Term) and tax discount models
 * 4. Staking / Mining ordinary income recognition vs subsequent disposal capital gain/loss
 * 5. Cost basis and fee deductibility rules (including India Sec 115BBH fee disallowance & 1% TDS)
 * 6. Multi-lot inventory matching simulation (FIFO, LIFO, HIFO, Specific Identification)
 * 7. Multi-currency fiat formatting (USD, EUR, GBP, INR, CAD, AUD, AED, SGD, JPY)
 * 
 * DISCLAIMER: This calculator is an educational estimation tool. It does not provide legal,
 * accounting, or professional tax advice. Always consult certified tax advisors or local tax authorities.
 */

import {
  CRYPTO_TAX_JURISDICTIONS,
  CRYPTO_TRANSACTION_TYPES,
  COST_BASIS_METHODS,
} from '../../data/tax-rates/cryptoTaxRules.js';

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
 * Safely sanitizes a numeric value with boundaries.
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
 * Calculates holding duration in calendar days between two dates.
 * 
 * @param {string|Date} startDate 
 * @param {string|Date} endDate 
 * @returns {number} Days elapsed
 */
export function calculateHoldingDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const d1 = new Date(startDate);
  const d2 = new Date(endDate);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  const diffMs = d2.getTime() - d1.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Matches and calculates multi-lot disposals under FIFO, LIFO, or HIFO.
 * 
 * @param {Array<Object>} lots - Array of { id, buyDate, quantity, buyPrice, buyFee }
 * @param {number} sellQty - Quantity being disposed
 * @param {number} sellPrice - Unit disposal price
 * @param {number} sellFee - Total disposal fee
 * @param {string} method - 'FIFO' | 'LIFO' | 'HIFO'
 * @param {string} sellDate - Date of disposal
 * @returns {Object} { matchedLots, totalCostBasis, totalUnitsSold, remainingLots }
 */
export function matchLots({
  lots = [],
  sellQty = 1,
  sellPrice = 50000,
  sellFee = 0,
  method = 'FIFO',
  sellDate = new Date().toISOString().split('T')[0],
  feesDeductible = true,
} = {}) {
  const cleanSellQty = sanitizeNumber(sellQty, 0, 0);
  if (!Array.isArray(lots) || lots.length === 0 || cleanSellQty === 0) {
    return {
      matchedLots: [],
      totalCostBasis: 0,
      totalUnitsSold: 0,
      remainingLots: [],
    };
  }

  // Clone lots
  const availableLots = lots.map((l, idx) => ({
    id: l.id || `lot_${idx + 1}`,
    buyDate: l.buyDate || '2024-01-01',
    quantity: sanitizeNumber(l.quantity, 0, 0),
    buyPrice: sanitizeNumber(l.buyPrice, 0, 0),
    buyFee: sanitizeNumber(l.buyFee, 0, 0),
  })).filter((l) => l.quantity > 0);

  // Sort based on inventory method
  if (method === 'FIFO') {
    availableLots.sort((a, b) => new Date(a.buyDate).getTime() - new Date(b.buyDate).getTime());
  } else if (method === 'LIFO') {
    availableLots.sort((a, b) => new Date(b.buyDate).getTime() - new Date(a.buyDate).getTime());
  } else if (method === 'HIFO') {
    availableLots.sort((a, b) => b.buyPrice - a.buyPrice);
  }

  let qtyNeeded = cleanSellQty;
  let totalCostBasis = 0;
  let totalUnitsSold = 0;
  const matchedLots = [];
  const remainingLots = [];

  for (const lot of availableLots) {
    if (qtyNeeded <= 0) {
      remainingLots.push({ ...lot });
      continue;
    }

    const qtyFromThisLot = Math.min(lot.quantity, qtyNeeded);
    const feeProportion = lot.quantity > 0 ? (qtyFromThisLot / lot.quantity) * lot.buyFee : 0;
    const eligibleFee = feesDeductible ? feeProportion : 0;
    const lotCostBasis = qtyFromThisLot * lot.buyPrice + eligibleFee;
    const lotHoldingDays = calculateHoldingDays(lot.buyDate, sellDate);

    matchedLots.push({
      lotId: lot.id,
      buyDate: lot.buyDate,
      quantityUsed: Number(qtyFromThisLot.toFixed(8)),
      unitBuyPrice: lot.buyPrice,
      allocatedBuyFee: Number(eligibleFee.toFixed(2)),
      lotCostBasis: Number(lotCostBasis.toFixed(2)),
      holdingDays: lotHoldingDays,
      isLongTerm: lotHoldingDays > 365,
    });

    totalCostBasis += lotCostBasis;
    totalUnitsSold += qtyFromThisLot;
    qtyNeeded -= qtyFromThisLot;

    const remainingQty = lot.quantity - qtyFromThisLot;
    if (remainingQty > 0.00000001) {
      remainingLots.push({
        ...lot,
        quantity: Number(remainingQty.toFixed(8)),
        buyFee: Number((lot.buyFee - feeProportion).toFixed(2)),
      });
    }
  }

  return {
    matchedLots,
    totalCostBasis: Number(totalCostBasis.toFixed(2)),
    totalUnitsSold: Number(totalUnitsSold.toFixed(8)),
    remainingLots,
  };
}

/**
 * Primary pure calculation engine for Crypto Tax estimation.
 * 
 * @param {Object} [inputs={}]
 * @param {string} [inputs.jurisdiction='GENERIC'] - 'GENERIC' | 'US' | 'IN' | 'UK' | 'DE' | 'AU'
 * @param {string} [inputs.transactionType='SELL'] - 'SELL' | 'SWAP' | 'BUY' | 'STAKING_REWARD' | 'MINING_REWARD' | 'AIRDROP' | 'TRANSFER'
 * @param {string} [inputs.assetName='Bitcoin (BTC)'] - Token label
 * @param {number} [inputs.quantity=1.0] - Crypto quantity sold or received
 * @param {number} [inputs.buyPrice=40000] - Acquisition price per unit in fiat
 * @param {number} [inputs.sellPrice=65000] - Disposal / exit price per unit in fiat
 * @param {string} [inputs.buyDate='2024-01-15'] - Acquisition date (YYYY-MM-DD)
 * @param {string} [inputs.sellDate='2025-06-20'] - Disposal date (YYYY-MM-DD)
 * @param {number} [inputs.buyFee=0] - Acquisition trading fee in fiat
 * @param {number} [inputs.sellFee=0] - Disposal trading fee in fiat
 * @param {number} [inputs.shortTermTaxRate] - User short-term tax rate (%) override
 * @param {number} [inputs.longTermTaxRate] - User long-term tax rate (%) override
 * @param {number} [inputs.incomeTaxRate] - User ordinary income tax rate (%) override
 * @param {number} [inputs.rewardFmv=3000] - Fair Market Value at receipt for Staking/Mining/Airdrop
 * @param {number} [inputs.rewardQuantity=1.0] - Quantity of reward tokens received
 * @param {boolean} [inputs.isRewardSoldLater=false] - Whether received reward tokens were subsequently sold
 * @param {number} [inputs.rewardSalePrice=4500] - Subsequent disposal price for rewards
 * @param {string} [inputs.rewardSaleDate='2025-12-01'] - Date of reward sale
 * @param {string} [inputs.currency='USD'] - Fiat currency code
 * @param {string} [inputs.costBasisMethod='SPECIFIC_ID'] - 'SPECIFIC_ID' | 'FIFO' | 'LIFO' | 'HIFO'
 * @param {Array<Object>} [inputs.lots] - Optional multi-lot array
 * @returns {Object} Comprehensive crypto tax computation results
 */
export function calculateCryptoTax(inputs = {}) {
  const {
    jurisdiction = 'GENERIC',
    transactionType = 'SELL',
    assetName = 'Bitcoin (BTC)',
    quantity = 1.0,
    buyPrice = 40000,
    sellPrice = 65000,
    buyDate = '2024-01-15',
    sellDate = '2025-06-20',
    buyFee = 0,
    sellFee = 0,
    shortTermTaxRate = null,
    longTermTaxRate = null,
    incomeTaxRate = null,
    rewardFmv = 3000,
    rewardQuantity = 1.0,
    isRewardSoldLater = false,
    rewardSalePrice = 4500,
    rewardSaleDate = '2025-12-01',
    currency = 'USD',
    costBasisMethod = 'SPECIFIC_ID',
    lots = null,
  } = inputs;

  // 1. JURISDICTION & TRANSACTION CONFIG RESOLUTION
  const jurKey = CRYPTO_TAX_JURISDICTIONS[jurisdiction] ? jurisdiction : 'GENERIC';
  const jurConfig = CRYPTO_TAX_JURISDICTIONS[jurKey];
  const txKey = CRYPTO_TRANSACTION_TYPES[transactionType] ? transactionType : 'SELL';
  const txConfig = CRYPTO_TRANSACTION_TYPES[txKey];
  const currMeta = FIAT_CURRENCIES[currency] || FIAT_CURRENCIES[jurConfig.currency] || FIAT_CURRENCIES.USD;

  // 2. INPUT SANITIZATION
  const cleanQty = sanitizeNumber(quantity, 1.0, 0);
  const cleanBuyPrice = sanitizeNumber(buyPrice, 0, 0);
  const cleanSellPrice = sanitizeNumber(sellPrice, 0, 0);
  const cleanBuyFee = sanitizeNumber(buyFee, 0, 0);
  const cleanSellFee = sanitizeNumber(sellFee, 0, 0);
  const cleanRewardFmv = sanitizeNumber(rewardFmv, 0, 0);
  const cleanRewardQty = sanitizeNumber(rewardQuantity, 0, 0);
  const cleanRewardSalePrice = sanitizeNumber(rewardSalePrice, 0, 0);

  // Applicable statutory / user rates
  const stRate = shortTermTaxRate !== null && shortTermTaxRate !== undefined && !isNaN(Number(shortTermTaxRate))
    ? sanitizeNumber(shortTermTaxRate, jurConfig.defaultShortTermRate, 0, 100)
    : jurConfig.defaultShortTermRate;

  const ltRate = longTermTaxRate !== null && longTermTaxRate !== undefined && !isNaN(Number(longTermTaxRate))
    ? sanitizeNumber(longTermTaxRate, jurConfig.defaultLongTermRate, 0, 100)
    : jurConfig.defaultLongTermRate;

  const incRate = incomeTaxRate !== null && incomeTaxRate !== undefined && !isNaN(Number(incomeTaxRate))
    ? sanitizeNumber(incomeTaxRate, jurConfig.defaultIncomeRate, 0, 100)
    : jurConfig.defaultIncomeRate;

  // 3. HOLDING PERIOD DETERMINATION
  const holdingDays = calculateHoldingDays(buyDate, sellDate);
  const holdingMonths = Number((holdingDays / 30.4375).toFixed(1));
  const holdingYears = Number((holdingDays / 365.25).toFixed(2));

  let isLongTerm = false;
  if (jurConfig.holdingThresholdDays > 0) {
    isLongTerm = holdingDays > jurConfig.holdingThresholdDays;
  }

  // 4. COST BASIS & DISPOSAL CALCULATIONS
  let costBasis = 0;
  let grossProceeds = 0;
  let netProceeds = 0;
  let eligibleBuyFee = 0;
  let eligibleSellFee = 0;
  let matchedLotsResult = null;

  const isDisposal = txConfig.isTaxableDisposal;
  const isIncomeReward = txConfig.generatesIncomeTax;

  if (isDisposal) {
    if (Array.isArray(lots) && lots.length > 0 && costBasisMethod !== 'SPECIFIC_ID') {
      // Multi-lot matching
      matchedLotsResult = matchLots({
        lots,
        sellQty: cleanQty,
        sellPrice: cleanSellPrice,
        sellFee: cleanSellFee,
        method: costBasisMethod,
        sellDate,
        feesDeductible: jurConfig.feesDeductible,
      });

      costBasis = matchedLotsResult.totalCostBasis;
      grossProceeds = cleanQty * cleanSellPrice;
      eligibleSellFee = jurConfig.feesDeductible ? cleanSellFee : 0;
      netProceeds = Math.max(0, grossProceeds - eligibleSellFee);
    } else {
      // Single transaction / specific lot
      eligibleBuyFee = jurConfig.feesDeductible ? cleanBuyFee : 0;
      eligibleSellFee = jurConfig.feesDeductible ? cleanSellFee : 0;

      costBasis = (cleanQty * cleanBuyPrice) + eligibleBuyFee;
      grossProceeds = cleanQty * cleanSellPrice;
      netProceeds = Math.max(0, grossProceeds - eligibleSellFee);
    }
  }

  const rawGainLoss = isDisposal ? netProceeds - costBasis : 0;
  const realizedGainLoss = Number(rawGainLoss.toFixed(2));
  const isGain = realizedGainLoss > 0;
  const isLoss = realizedGainLoss < 0;

  // 5. STAKING / MINING / AIRDROP ORDINARY INCOME RECOGNITION
  let recognizedIncomeFmv = 0;
  let incomeTaxLiability = 0;
  let rewardDisposalGainLoss = 0;
  let rewardCapitalGainsTax = 0;
  let rewardHoldingDays = 0;
  let isRewardLongTerm = false;

  if (isIncomeReward) {
    recognizedIncomeFmv = cleanRewardQty * cleanRewardFmv;
    incomeTaxLiability = recognizedIncomeFmv * (incRate / 100);

    if (isRewardSoldLater && cleanRewardSalePrice > 0) {
      rewardHoldingDays = calculateHoldingDays(buyDate, rewardSaleDate);
      if (jurConfig.holdingThresholdDays > 0) {
        isRewardLongTerm = rewardHoldingDays > jurConfig.holdingThresholdDays;
      }

      const rewardCostBasis = recognizedIncomeFmv;
      const rewardProceeds = cleanRewardQty * cleanRewardSalePrice;
      rewardDisposalGainLoss = Number((rewardProceeds - rewardCostBasis).toFixed(2));

      if (rewardDisposalGainLoss > 0) {
        const applicableRewardCgtRate = isRewardLongTerm ? ltRate : stRate;
        rewardCapitalGainsTax = rewardDisposalGainLoss * (applicableRewardCgtRate / 100);
      }
    }
  }

  // 6. CAPITAL GAINS TAX COMPUTATION (JURISDICTION-SPECIFIC)
  let capitalGainsTax = 0;
  let applicableCgtRate = isLongTerm ? ltRate : stRate;
  let taxableCapitalGain = 0;
  let cgtExemptionApplied = 0;
  let cgtDiscountApplied = 0;
  let isTaxFreeLongTerm = false;
  let tdsDeducted = 0;

  if (isDisposal && isGain) {
    if (jurKey === 'DE') {
      // Germany: Holding period > 1 yr is 100% TAX FREE
      if (isLongTerm) {
        isTaxFreeLongTerm = true;
        taxableCapitalGain = 0;
        capitalGainsTax = 0;
      } else {
        // Under 1 yr: €1,000 exemption limit (Freigrenze)
        const exemption = jurConfig.annualExemptionLimit || 1000;
        if (realizedGainLoss <= exemption) {
          cgtExemptionApplied = realizedGainLoss;
          taxableCapitalGain = 0;
          capitalGainsTax = 0;
        } else {
          taxableCapitalGain = realizedGainLoss;
          capitalGainsTax = taxableCapitalGain * (stRate / 100);
        }
      }
    } else if (jurKey === 'UK') {
      // UK: £3,000 Annual Exempt Amount (AEA)
      const aea = jurConfig.annualExemptAmount || 3000;
      if (realizedGainLoss <= aea) {
        cgtExemptionApplied = realizedGainLoss;
        taxableCapitalGain = 0;
        capitalGainsTax = 0;
      } else {
        cgtExemptionApplied = aea;
        taxableCapitalGain = realizedGainLoss - aea;
        capitalGainsTax = taxableCapitalGain * (applicableCgtRate / 100);
      }
    } else if (jurKey === 'AU') {
      // Australia: 50% CGT discount for holding >= 12 months
      if (isLongTerm) {
        cgtDiscountApplied = realizedGainLoss * 0.5;
        taxableCapitalGain = realizedGainLoss * 0.5;
        capitalGainsTax = taxableCapitalGain * (stRate / 100);
      } else {
        taxableCapitalGain = realizedGainLoss;
        capitalGainsTax = taxableCapitalGain * (stRate / 100);
      }
    } else if (jurKey === 'IN') {
      // India: Flat 30% (+4% cess = 31.2%) on full gain without fee deductions
      taxableCapitalGain = realizedGainLoss;
      const baseTax = taxableCapitalGain * 0.30;
      const cess = baseTax * 0.04;
      capitalGainsTax = baseTax + cess;

      // Section 194S 1% TDS on gross transfer consideration >= ₹50,000
      if (grossProceeds >= (jurConfig.tdsThreshold || 50000)) {
        tdsDeducted = grossProceeds * 0.01;
      }
    } else {
      // US & GENERIC
      taxableCapitalGain = realizedGainLoss;
      capitalGainsTax = taxableCapitalGain * (applicableCgtRate / 100);
    }
  }

  // 7. TOTAL TAX AGGREGATION & AFTER-TAX BALANCES
  const totalEstimatedTax = Number((capitalGainsTax + incomeTaxLiability + rewardCapitalGainsTax).toFixed(2));
  
  let afterTaxProceeds = 0;
  let afterTaxGain = 0;

  if (isDisposal) {
    afterTaxProceeds = Number((netProceeds - capitalGainsTax).toFixed(2));
    afterTaxGain = Number((realizedGainLoss - capitalGainsTax).toFixed(2));
  } else if (isIncomeReward) {
    afterTaxProceeds = Number((recognizedIncomeFmv - incomeTaxLiability).toFixed(2));
    afterTaxGain = Number((recognizedIncomeFmv - incomeTaxLiability).toFixed(2));
  }

  // Effective Tax Rate %
  const totalGrossIncomeOrGain = Math.max(0, realizedGainLoss) + recognizedIncomeFmv + Math.max(0, rewardDisposalGainLoss);
  const effectiveTaxRatePct = totalGrossIncomeOrGain > 0
    ? Number(((totalEstimatedTax / totalGrossIncomeOrGain) * 100).toFixed(2))
    : 0;

  const totalFeesPaid = cleanBuyFee + cleanSellFee;

  return {
    inputs: {
      jurisdiction: jurKey,
      transactionType: txKey,
      assetName,
      quantity: cleanQty,
      buyPrice: cleanBuyPrice,
      sellPrice: cleanSellPrice,
      buyDate,
      sellDate,
      buyFee: cleanBuyFee,
      sellFee: cleanSellFee,
      shortTermTaxRate: stRate,
      longTermTaxRate: ltRate,
      incomeTaxRate: incRate,
      rewardFmv: cleanRewardFmv,
      rewardQuantity: cleanRewardQty,
      isRewardSoldLater,
      rewardSalePrice: cleanRewardSalePrice,
      rewardSaleDate,
      currency: currMeta.code,
      costBasisMethod,
    },
    meta: {
      jurisdictionName: jurConfig.name,
      countryCode: jurConfig.countryCode,
      currencySymbol: currMeta.symbol,
      currencyCode: currMeta.code,
      currencyDecimals: currMeta.decimals,
      transactionLabel: txConfig.label,
      statuteReference: jurConfig.statuteReference || 'General Tax Principles',
      holdingDays,
      holdingMonths,
      holdingYears,
      isLongTerm,
      isTaxFreeLongTerm,
      applicableCgtRate,
      feesDeductible: jurConfig.feesDeductible,
      lossOffsetAllowed: jurConfig.lossOffsetAllowed,
      notes: jurConfig.notes,
    },
    summary: {
      costBasis: Number(costBasis.toFixed(2)),
      grossProceeds: Number(grossProceeds.toFixed(2)),
      eligibleFees: Number((eligibleBuyFee + eligibleSellFee).toFixed(2)),
      totalFeesPaid: Number(totalFeesPaid.toFixed(2)),
      netProceeds: Number(netProceeds.toFixed(2)),
      realizedGainLoss: Number(realizedGainLoss.toFixed(2)),
      isGain,
      isLoss,
      taxableCapitalGain: Number(taxableCapitalGain.toFixed(2)),
      cgtExemptionApplied: Number(cgtExemptionApplied.toFixed(2)),
      cgtDiscountApplied: Number(cgtDiscountApplied.toFixed(2)),
      capitalGainsTax: Number(capitalGainsTax.toFixed(2)),
      recognizedIncomeFmv: Number(recognizedIncomeFmv.toFixed(2)),
      incomeTaxLiability: Number(incomeTaxLiability.toFixed(2)),
      rewardDisposalGainLoss: Number(rewardDisposalGainLoss.toFixed(2)),
      rewardCapitalGainsTax: Number(rewardCapitalGainsTax.toFixed(2)),
      tdsDeducted: Number(tdsDeducted.toFixed(2)),
      totalEstimatedTax: Number(totalEstimatedTax.toFixed(2)),
      afterTaxProceeds: Number(afterTaxProceeds.toFixed(2)),
      afterTaxGain: Number(afterTaxGain.toFixed(2)),
      effectiveTaxRatePct,
    },
    matchedLotsResult,
  };
}

export const calculateCryptocurrencyTax = calculateCryptoTax;
export const calculateCryptoCapitalGainsTax = calculateCryptoTax;
