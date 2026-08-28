/**
 * Pure deterministic calculation engine for NFT Creator Royalties, Marketplace Fees,
 * Transaction Friction, Multi-Sale Resale Schedules, and Enforcement Scenarios.
 */

export const ROYALTY_BASIS_MODELS = {
  GROSS_SALE_PRICE: {
    id: 'GROSS_SALE_PRICE',
    label: 'Gross Sale Price Basis',
    description: 'Royalty calculated directly on the total NFT gross sale price (standard market practice).',
  },
  NET_SALE_PROCEEDS: {
    id: 'NET_SALE_PROCEEDS',
    label: 'Net Sale Proceeds Basis',
    description: 'Royalty calculated after deducting marketplace and transaction fees from the sale price.',
  },
};

export const SALE_TYPES = {
  SECONDARY_RESALE: {
    id: 'SECONDARY_RESALE',
    label: 'Secondary Resale',
    description: 'Collector-to-collector resale where creator receives royalty and seller receives net sale proceeds.',
  },
  PRIMARY_MINT: {
    id: 'PRIMARY_MINT',
    label: 'Primary Mint / Initial Sale',
    description: 'First-time issuance where the creator receives 100% of proceeds minus marketplace/minting fees.',
  },
};

export const FIAT_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { symbol: '£', name: 'British Pound', decimals: 2 },
  INR: { symbol: '₹', name: 'Indian Rupee', decimals: 2 },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', decimals: 2 },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
  JPY: { symbol: '¥', name: 'Japanese Yen', decimals: 0 },
};

export const CRYPTO_DENOMINATIONS = {
  ETH: { symbol: 'Ξ', name: 'Ethereum (ETH)', defaultPriceUsd: 2500 },
  SOL: { symbol: '◎', name: 'Solana (SOL)', defaultPriceUsd: 140 },
  MATIC: { symbol: 'POL', name: 'Polygon (POL/MATIC)', defaultPriceUsd: 0.45 },
  BNB: { symbol: 'BNB', name: 'BNB Chain', defaultPriceUsd: 550 },
  AVAX: { symbol: 'AVAX', name: 'Avalanche', defaultPriceUsd: 25 },
  USD: { symbol: '$', name: 'USD / Fiat Equivalent', defaultPriceUsd: 1 },
};

/**
 * Calculates single-sale NFT royalty, marketplace fees, seller proceeds, and creator earnings.
 *
 * @param {Object} params
 * @param {number} params.salePrice - NFT sale price in selected currency/crypto (>= 0)
 * @param {number} params.royaltyPct - Creator royalty percentage (0 to 100)
 * @param {number} params.marketplaceFeePct - Marketplace platform fee percentage (0 to 100)
 * @param {number} [params.otherFees=0] - Additional fixed transaction/network/gas fees (>= 0)
 * @param {number} [params.enforcementPct=100] - Marketplace royalty enforcement rate % (0 to 100)
 * @param {string} [params.royaltyBasis='GROSS_SALE_PRICE'] - 'GROSS_SALE_PRICE' or 'NET_SALE_PROCEEDS'
 * @param {string} [params.saleType='SECONDARY_RESALE'] - 'SECONDARY_RESALE' or 'PRIMARY_MINT'
 * @param {string} [params.currency='USD'] - Fiat currency code
 * @param {string} [params.cryptoDenomination='ETH'] - Crypto symbol
 * @param {number} [params.cryptoPriceFiat=2500] - Crypto spot price in fiat
 * @returns {Object} Deterministic single-sale breakdown
 */
export function calculateSingleNftSale(params = {}) {
  const salePrice = Math.max(0, Number(params.salePrice) || 0);
  const rawRoyaltyPct = Number(params.royaltyPct);
  const royaltyPct = isNaN(rawRoyaltyPct) ? 5 : Math.max(0, Math.min(100, rawRoyaltyPct));
  
  const rawMktFeePct = Number(params.marketplaceFeePct);
  const marketplaceFeePct = isNaN(rawMktFeePct) ? 2.5 : Math.max(0, Math.min(100, rawMktFeePct));
  
  const otherFees = Math.max(0, Number(params.otherFees) || 0);
  
  const rawEnforcePct = Number(params.enforcementPct);
  const enforcementPct = isNaN(rawEnforcePct) ? 100 : Math.max(0, Math.min(100, rawEnforcePct));
  
  const royaltyBasis = ROYALTY_BASIS_MODELS[params.royaltyBasis] ? params.royaltyBasis : 'GROSS_SALE_PRICE';
  const saleType = SALE_TYPES[params.saleType] ? params.saleType : 'SECONDARY_RESALE';
  const currency = FIAT_CURRENCIES[params.currency] ? params.currency : 'USD';
  const cryptoDenomination = CRYPTO_DENOMINATIONS[params.cryptoDenomination] ? params.cryptoDenomination : 'ETH';
  const cryptoPriceFiat = Math.max(0, Number(params.cryptoPriceFiat) || 2500);

  // 1. Marketplace Fee Calculation
  const marketplaceFeeAmount = salePrice * (marketplaceFeePct / 100);

  // 2. Gross Royalty Calculation based on selected basis
  let grossRoyaltyAmount = 0;
  if (saleType === 'SECONDARY_RESALE') {
    if (royaltyBasis === 'GROSS_SALE_PRICE') {
      grossRoyaltyAmount = salePrice * (royaltyPct / 100);
    } else {
      const netBase = Math.max(0, salePrice - marketplaceFeeAmount - otherFees);
      grossRoyaltyAmount = netBase * (royaltyPct / 100);
    }
  }

  // 3. Expected Royalty considering Marketplace Enforcement
  const expectedRoyaltyAmount = grossRoyaltyAmount * (enforcementPct / 100);
  const lostRoyaltyAmount = Math.max(0, grossRoyaltyAmount - expectedRoyaltyAmount);

  // 4. Net Proceeds Distribution
  let creatorNetProceeds = 0;
  let sellerNetProceeds = 0;

  if (saleType === 'PRIMARY_MINT') {
    // In primary mint, creator is the seller
    creatorNetProceeds = Math.max(0, salePrice - marketplaceFeeAmount - otherFees);
    sellerNetProceeds = creatorNetProceeds;
  } else {
    // Secondary resale: Creator receives expected royalty, Seller receives balance
    creatorNetProceeds = expectedRoyaltyAmount;
    const totalDeductions = expectedRoyaltyAmount + marketplaceFeeAmount + otherFees;
    sellerNetProceeds = Math.max(0, salePrice - totalDeductions);
  }

  // 5. Buyer Cost & Total Transaction Friction
  const buyerTotalCost = salePrice; // Buyer pays sale price (gas paid to network)
  const totalFriction = expectedRoyaltyAmount + marketplaceFeeAmount + otherFees;
  const effectiveFrictionPct = salePrice > 0 ? (totalFriction / salePrice) * 100 : 0;
  const effectiveRoyaltyRate = salePrice > 0 ? (expectedRoyaltyAmount / salePrice) * 100 : 0;
  const effectiveMktFeeRate = salePrice > 0 ? (marketplaceFeeAmount / salePrice) * 100 : 0;

  // 6. Fiat Conversions
  const fiatMultiplier = cryptoDenomination === 'USD' ? 1 : cryptoPriceFiat;
  const salePriceFiat = salePrice * fiatMultiplier;
  const creatorNetFiat = creatorNetProceeds * fiatMultiplier;
  const sellerNetFiat = sellerNetProceeds * fiatMultiplier;
  const marketplaceFeeFiat = marketplaceFeeAmount * fiatMultiplier;
  const expectedRoyaltyFiat = expectedRoyaltyAmount * fiatMultiplier;
  const grossRoyaltyFiat = grossRoyaltyAmount * fiatMultiplier;
  const lostRoyaltyFiat = lostRoyaltyAmount * fiatMultiplier;
  const otherFeesFiat = otherFees * fiatMultiplier;
  const totalFrictionFiat = totalFriction * fiatMultiplier;

  return {
    inputs: {
      salePrice,
      royaltyPct,
      marketplaceFeePct,
      otherFees,
      enforcementPct,
      royaltyBasis,
      saleType,
      currency,
      cryptoDenomination,
      cryptoPriceFiat,
    },
    amounts: {
      salePrice,
      grossRoyaltyAmount,
      expectedRoyaltyAmount,
      lostRoyaltyAmount,
      marketplaceFeeAmount,
      otherFees,
      creatorNetProceeds,
      sellerNetProceeds,
      buyerTotalCost,
      totalFriction,
    },
    fiat: {
      currency,
      salePriceFiat,
      grossRoyaltyFiat,
      expectedRoyaltyFiat,
      lostRoyaltyFiat,
      marketplaceFeeFiat,
      otherFeesFiat,
      creatorNetFiat,
      sellerNetFiat,
      totalFrictionFiat,
    },
    percentages: {
      royaltyPct,
      marketplaceFeePct,
      enforcementPct,
      effectiveRoyaltyRate,
      effectiveMktFeeRate,
      effectiveFrictionPct,
      sellerProceedsPct: salePrice > 0 ? (sellerNetProceeds / salePrice) * 100 : 0,
      creatorProceedsPct: salePrice > 0 ? (creatorNetProceeds / salePrice) * 100 : 0,
    },
  };
}

/**
 * Calculates multi-sale resale schedule with cumulative volume, royalties, and statistics.
 *
 * @param {Array<Object>} resales - List of resale objects or generated resales
 * @param {Object} globalConfig - Default config overrides (royaltyPct, marketplaceFeePct, enforcementPct, etc.)
 * @returns {Object} Multi-sale schedule and aggregates
 */
export function calculateMultiSaleSchedule(resales = [], globalConfig = {}) {
  const royaltyPct = isNaN(Number(globalConfig.royaltyPct)) ? 5 : Math.max(0, Math.min(100, Number(globalConfig.royaltyPct)));
  const marketplaceFeePct = isNaN(Number(globalConfig.marketplaceFeePct)) ? 2.5 : Math.max(0, Math.min(100, Number(globalConfig.marketplaceFeePct)));
  const enforcementPct = isNaN(Number(globalConfig.enforcementPct)) ? 100 : Math.max(0, Math.min(100, Number(globalConfig.enforcementPct)));
  const royaltyBasis = ROYALTY_BASIS_MODELS[globalConfig.royaltyBasis] ? globalConfig.royaltyBasis : 'GROSS_SALE_PRICE';
  const cryptoDenomination = CRYPTO_DENOMINATIONS[globalConfig.cryptoDenomination] ? globalConfig.cryptoDenomination : 'ETH';
  const cryptoPriceFiat = Math.max(0, Number(globalConfig.cryptoPriceFiat) || 2500);
  const currency = FIAT_CURRENCIES[globalConfig.currency] ? globalConfig.currency : 'USD';
  const fiatMultiplier = cryptoDenomination === 'USD' ? 1 : cryptoPriceFiat;

  if (!Array.isArray(resales) || resales.length === 0) {
    return {
      schedule: [],
      totals: {
        totalSalesCount: 0,
        totalVolumeCrypto: 0,
        totalVolumeFiat: 0,
        totalGrossRoyaltiesCrypto: 0,
        totalGrossRoyaltiesFiat: 0,
        totalExpectedRoyaltiesCrypto: 0,
        totalExpectedRoyaltiesFiat: 0,
        totalLostRoyaltiesCrypto: 0,
        totalLostRoyaltiesFiat: 0,
        totalMarketplaceFeesCrypto: 0,
        totalMarketplaceFeesFiat: 0,
        totalOtherFeesCrypto: 0,
        totalSellerNetCrypto: 0,
        totalSellerNetFiat: 0,
        averageResalePriceCrypto: 0,
        averageResalePriceFiat: 0,
        averageRoyaltyCrypto: 0,
        averageRoyaltyFiat: 0,
        effectiveLifetimeRoyaltyRate: 0,
      },
    };
  }

  let cumulativeVolumeCrypto = 0;
  let cumulativeGrossRoyaltiesCrypto = 0;
  let cumulativeExpectedRoyaltiesCrypto = 0;
  let cumulativeMarketplaceFeesCrypto = 0;
  let cumulativeOtherFeesCrypto = 0;
  let cumulativeSellerNetCrypto = 0;

  const schedule = resales.map((sale, index) => {
    const saleNumber = index + 1;
    const salePrice = Math.max(0, Number(sale.price !== undefined ? sale.price : sale.salePrice) || 0);
    const itemRoyaltyPct = sale.royaltyPct !== undefined ? Math.max(0, Math.min(100, Number(sale.royaltyPct))) : royaltyPct;
    const itemMktFeePct = sale.marketplaceFeePct !== undefined ? Math.max(0, Math.min(100, Number(sale.marketplaceFeePct))) : marketplaceFeePct;
    const itemOtherFees = Math.max(0, Number(sale.otherFees) || 0);
    const itemEnforcementPct = sale.enforcementPct !== undefined ? Math.max(0, Math.min(100, Number(sale.enforcementPct))) : enforcementPct;
    const itemBasis = sale.royaltyBasis || royaltyBasis;

    const singleResult = calculateSingleNftSale({
      salePrice,
      royaltyPct: itemRoyaltyPct,
      marketplaceFeePct: itemMktFeePct,
      otherFees: itemOtherFees,
      enforcementPct: itemEnforcementPct,
      royaltyBasis: itemBasis,
      saleType: 'SECONDARY_RESALE',
      currency,
      cryptoDenomination,
      cryptoPriceFiat,
    });

    cumulativeVolumeCrypto += singleResult.amounts.salePrice;
    cumulativeGrossRoyaltiesCrypto += singleResult.amounts.grossRoyaltyAmount;
    cumulativeExpectedRoyaltiesCrypto += singleResult.amounts.expectedRoyaltyAmount;
    cumulativeMarketplaceFeesCrypto += singleResult.amounts.marketplaceFeeAmount;
    cumulativeOtherFeesCrypto += singleResult.amounts.otherFees;
    cumulativeSellerNetCrypto += singleResult.amounts.sellerNetProceeds;

    return {
      saleNumber,
      label: sale.label || `Resale #${saleNumber}`,
      salePriceCrypto: singleResult.amounts.salePrice,
      salePriceFiat: singleResult.fiat.salePriceFiat,
      royaltyPct: itemRoyaltyPct,
      marketplaceFeePct: itemMktFeePct,
      enforcementPct: itemEnforcementPct,
      grossRoyaltyCrypto: singleResult.amounts.grossRoyaltyAmount,
      grossRoyaltyFiat: singleResult.fiat.grossRoyaltyFiat,
      expectedRoyaltyCrypto: singleResult.amounts.expectedRoyaltyAmount,
      expectedRoyaltyFiat: singleResult.fiat.expectedRoyaltyFiat,
      lostRoyaltyCrypto: singleResult.amounts.lostRoyaltyAmount,
      marketplaceFeeCrypto: singleResult.amounts.marketplaceFeeAmount,
      marketplaceFeeFiat: singleResult.fiat.marketplaceFeeFiat,
      otherFeesCrypto: singleResult.amounts.otherFees,
      sellerNetCrypto: singleResult.amounts.sellerNetProceeds,
      sellerNetFiat: singleResult.fiat.sellerNetFiat,
      totalFrictionCrypto: singleResult.amounts.totalFriction,
      effectiveFrictionPct: singleResult.percentages.effectiveFrictionPct,
      cumulativeVolumeCrypto,
      cumulativeVolumeFiat: cumulativeVolumeCrypto * fiatMultiplier,
      cumulativeExpectedRoyaltiesCrypto,
      cumulativeExpectedRoyaltiesFiat: cumulativeExpectedRoyaltiesCrypto * fiatMultiplier,
      cumulativeGrossRoyaltiesCrypto,
    };
  });

  const totalSalesCount = schedule.length;
  const totalVolumeCrypto = cumulativeVolumeCrypto;
  const totalVolumeFiat = totalVolumeCrypto * fiatMultiplier;
  const totalGrossRoyaltiesCrypto = cumulativeGrossRoyaltiesCrypto;
  const totalGrossRoyaltiesFiat = totalGrossRoyaltiesCrypto * fiatMultiplier;
  const totalExpectedRoyaltiesCrypto = cumulativeExpectedRoyaltiesCrypto;
  const totalExpectedRoyaltiesFiat = totalExpectedRoyaltiesCrypto * fiatMultiplier;
  const totalLostRoyaltiesCrypto = Math.max(0, totalGrossRoyaltiesCrypto - totalExpectedRoyaltiesCrypto);
  const totalLostRoyaltiesFiat = totalLostRoyaltiesCrypto * fiatMultiplier;
  const totalMarketplaceFeesCrypto = cumulativeMarketplaceFeesCrypto;
  const totalMarketplaceFeesFiat = totalMarketplaceFeesCrypto * fiatMultiplier;
  const totalOtherFeesCrypto = cumulativeOtherFeesCrypto;
  const totalSellerNetCrypto = cumulativeSellerNetCrypto;
  const totalSellerNetFiat = totalSellerNetCrypto * fiatMultiplier;

  const averageResalePriceCrypto = totalSalesCount > 0 ? totalVolumeCrypto / totalSalesCount : 0;
  const averageResalePriceFiat = averageResalePriceCrypto * fiatMultiplier;
  const averageRoyaltyCrypto = totalSalesCount > 0 ? totalExpectedRoyaltiesCrypto / totalSalesCount : 0;
  const averageRoyaltyFiat = averageRoyaltyCrypto * fiatMultiplier;
  const effectiveLifetimeRoyaltyRate = totalVolumeCrypto > 0 ? (totalExpectedRoyaltiesCrypto / totalVolumeCrypto) * 100 : 0;

  return {
    schedule,
    totals: {
      totalSalesCount,
      totalVolumeCrypto,
      totalVolumeFiat,
      totalGrossRoyaltiesCrypto,
      totalGrossRoyaltiesFiat,
      totalExpectedRoyaltiesCrypto,
      totalExpectedRoyaltiesFiat,
      totalLostRoyaltiesCrypto,
      totalLostRoyaltiesFiat,
      totalMarketplaceFeesCrypto,
      totalMarketplaceFeesFiat,
      totalOtherFeesCrypto,
      totalSellerNetCrypto,
      totalSellerNetFiat,
      averageResalePriceCrypto,
      averageResalePriceFiat,
      averageRoyaltyCrypto,
      averageRoyaltyFiat,
      effectiveLifetimeRoyaltyRate,
    },
  };
}

/**
 * Generates sensitivity scenarios across Royalty Rates, Resale Prices, Resale Volumes, and Enforcement Levels.
 *
 * @param {Object} baseline - Single sale baseline parameters
 * @returns {Object} Scenario analysis matrices
 */
export function generateSensitivityScenarios(baseline = {}) {
  const salePrice = Math.max(0, Number(baseline.salePrice) || 0);
  const royaltyPct = isNaN(Number(baseline.royaltyPct)) ? 5 : Math.max(0, Math.min(100, Number(baseline.royaltyPct)));
  const marketplaceFeePct = isNaN(Number(baseline.marketplaceFeePct)) ? 2.5 : Math.max(0, Math.min(100, Number(baseline.marketplaceFeePct)));
  const enforcementPct = isNaN(Number(baseline.enforcementPct)) ? 100 : Math.max(0, Math.min(100, Number(baseline.enforcementPct)));
  const cryptoDenomination = CRYPTO_DENOMINATIONS[baseline.cryptoDenomination] ? baseline.cryptoDenomination : 'ETH';
  const cryptoPriceFiat = Math.max(0, Number(baseline.cryptoPriceFiat) || 2500);
  const currency = FIAT_CURRENCIES[baseline.currency] ? baseline.currency : 'USD';
  const fiatMultiplier = cryptoDenomination === 'USD' ? 1 : cryptoPriceFiat;

  // 1. Royalty Rate Sensitivity (0%, 2.5%, 5%, 7.5%, 10%)
  const royaltyRateTiers = [0, 2.5, 5, 7.5, 10];
  const royaltySensitivity = royaltyRateTiers.map((rPct) => {
    const res = calculateSingleNftSale({
      ...baseline,
      salePrice,
      royaltyPct: rPct,
      marketplaceFeePct,
      enforcementPct,
      cryptoDenomination,
      cryptoPriceFiat,
      currency,
    });
    return {
      royaltyPct: rPct,
      grossRoyaltyCrypto: res.amounts.grossRoyaltyAmount,
      expectedRoyaltyCrypto: res.amounts.expectedRoyaltyAmount,
      expectedRoyaltyFiat: res.fiat.expectedRoyaltyFiat,
      sellerNetCrypto: res.amounts.sellerNetProceeds,
      sellerNetFiat: res.fiat.sellerNetFiat,
      effectiveFrictionPct: res.percentages.effectiveFrictionPct,
    };
  });

  // 2. Resale Price Sensitivity (-50%, -25%, 0%, +25%, +50%, +100%)
  const priceMultipliers = [
    { label: '-50% Bear Market', mult: 0.5 },
    { label: '-25% Market Dip', mult: 0.75 },
    { label: '0% Baseline Price', mult: 1.0 },
    { label: '+25% Appreciation', mult: 1.25 },
    { label: '+50% Bull Expansion', mult: 1.5 },
    { label: '+100% 2x Rally', mult: 2.0 },
  ];
  const priceSensitivity = priceMultipliers.map((p) => {
    const simPrice = salePrice * p.mult;
    const res = calculateSingleNftSale({
      ...baseline,
      salePrice: simPrice,
      royaltyPct,
      marketplaceFeePct,
      enforcementPct,
      cryptoDenomination,
      cryptoPriceFiat,
      currency,
    });
    return {
      label: p.label,
      multiplier: p.mult,
      simulatedPriceCrypto: simPrice,
      simulatedPriceFiat: simPrice * fiatMultiplier,
      expectedRoyaltyCrypto: res.amounts.expectedRoyaltyAmount,
      expectedRoyaltyFiat: res.fiat.expectedRoyaltyFiat,
      sellerNetCrypto: res.amounts.sellerNetProceeds,
      sellerNetFiat: res.fiat.sellerNetFiat,
    };
  });

  // 3. Sale Volume Scenarios (1, 5, 10, 25, 50 resales with baseline price)
  const volumeTiers = [1, 5, 10, 25, 50];
  const volumeScenarios = volumeTiers.map((count) => {
    const dummySales = Array.from({ length: count }, (_, i) => ({
      price: salePrice,
      royaltyPct,
      marketplaceFeePct,
      enforcementPct,
    }));
    const multiRes = calculateMultiSaleSchedule(dummySales, {
      royaltyPct,
      marketplaceFeePct,
      enforcementPct,
      cryptoDenomination,
      cryptoPriceFiat,
      currency,
    });
    return {
      resaleCount: count,
      totalVolumeCrypto: multiRes.totals.totalVolumeCrypto,
      totalVolumeFiat: multiRes.totals.totalVolumeFiat,
      totalExpectedRoyaltiesCrypto: multiRes.totals.totalExpectedRoyaltiesCrypto,
      totalExpectedRoyaltiesFiat: multiRes.totals.totalExpectedRoyaltiesFiat,
      totalMarketplaceFeesCrypto: multiRes.totals.totalMarketplaceFeesCrypto,
    };
  });

  // 4. Royalty Enforcement Sensitivity (0%, 25%, 50%, 75%, 100%)
  const enforcementTiers = [
    { pct: 0, label: '0% (Zero Royalty Marketplace)' },
    { pct: 25, label: '25% (Low Enforcement)' },
    { pct: 50, label: '50% (Mixed Marketplace)' },
    { pct: 75, label: '75% (High Enforcement)' },
    { pct: 100, label: '100% (Full Enforcement)' },
  ];
  const enforcementSensitivity = enforcementTiers.map((tier) => {
    const res = calculateSingleNftSale({
      ...baseline,
      salePrice,
      royaltyPct,
      marketplaceFeePct,
      enforcementPct: tier.pct,
      cryptoDenomination,
      cryptoPriceFiat,
      currency,
    });
    return {
      enforcementPct: tier.pct,
      label: tier.label,
      expectedRoyaltyCrypto: res.amounts.expectedRoyaltyAmount,
      expectedRoyaltyFiat: res.fiat.expectedRoyaltyFiat,
      lostRoyaltyCrypto: res.amounts.lostRoyaltyAmount,
      lostRoyaltyFiat: res.fiat.lostRoyaltyFiat,
      sellerNetCrypto: res.amounts.sellerNetProceeds,
      sellerNetFiat: res.fiat.sellerNetFiat,
    };
  });

  return {
    royaltySensitivity,
    priceSensitivity,
    volumeScenarios,
    enforcementSensitivity,
  };
}

/**
 * Top-level main calculation function combining single-sale analysis, multi-sale schedule,
 * and sensitivity matrices into a unified deterministic payload.
 *
 * @param {Object} params - User inputs
 * @returns {Object} Comprehensive NFT royalty report
 */
export function calculateNftRoyalty(params = {}) {
  const single = calculateSingleNftSale(params);

  // Multi-sale schedule if provided or default 5-step growth schedule
  let customResales = params.resales;
  if (!Array.isArray(customResales) || customResales.length === 0) {
    const baseP = single.inputs.salePrice > 0 ? single.inputs.salePrice : 2.0;
    // Default 5 resales simulating gradual price appreciation (1.0x, 1.25x, 1.5x, 2.0x, 2.5x)
    customResales = [
      { label: 'Resale #1 (Baseline)', price: baseP },
      { label: 'Resale #2 (+25%)', price: baseP * 1.25 },
      { label: 'Resale #3 (+50%)', price: baseP * 1.5 },
      { label: 'Resale #4 (2x Value)', price: baseP * 2.0 },
      { label: 'Resale #5 (2.5x Value)', price: baseP * 2.5 },
    ];
  }

  const multi = calculateMultiSaleSchedule(customResales, single.inputs);
  const sensitivities = generateSensitivityScenarios(single.inputs);

  return {
    single,
    multi,
    sensitivities,
  };
}
