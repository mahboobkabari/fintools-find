/**
 * Flagship Cryptocurrency Mining Profitability Engine (Sprint 83 / Flagship #90)
 * 
 * Institutional-grade Proof-of-Work (PoW) mining yield, thermodynamic efficiency,
 * and financial payback calculation engine:
 * 1. Multi-tier hashrate unit normalization (H/s, kH/s, MH/s, GH/s, TH/s, PH/s, EH/s)
 * 2. Network Difficulty & Network Hashrate share modeling with block rewards & fees
 * 3. Thermodynamic Power consumption (Watts -> kWh/day -> monthly/annual electricity cost)
 * 4. Uptime % adjustments and Mining Pool Fee deductions
 * 5. Itemized OPEX (Power + Pool Fees + Other Daily Facility Costs)
 * 6. Daily, Monthly, and Annual Gross Revenue, Net Profit/Loss, and Cashflows
 * 7. Hardware CAPEX Payback Period (Days & Months) and Annualized Hardware ROI %
 * 8. Analytical Break-Even Crypto Price Solver (Shutdown Threshold)
 * 9. Electricity Cost per Mined Coin and Energy Efficiency (J/TH or W/GH)
 * 10. Multi-Currency Support (USD, EUR, GBP, INR, CAD, AUD, AED, SGD, JPY)
 */

export const HASHRATE_UNITS = {
  H: { id: 'H', label: 'H/s', exponent: 0, name: 'Hashes / sec' },
  KH: { id: 'KH', label: 'kH/s', exponent: 3, name: 'Kilohashes / sec' },
  MH: { id: 'MH', label: 'MH/s', exponent: 6, name: 'Megahashes / sec' },
  GH: { id: 'GH', label: 'GH/s', exponent: 9, name: 'Gigahashes / sec' },
  TH: { id: 'TH', label: 'TH/s', exponent: 12, name: 'Terahashes / sec' },
  PH: { id: 'PH', label: 'PH/s', exponent: 15, name: 'Petahashes / sec' },
  EH: { id: 'EH', label: 'EH/s', exponent: 18, name: 'Exahashes / sec' },
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
 * Converts any numeric hashrate value and unit into base Hashes/second (H/s).
 * 
 * @param {number} value
 * @param {string} unitKey - 'H' | 'KH' | 'MH' | 'GH' | 'TH' | 'PH' | 'EH'
 * @returns {number} Value in H/s
 */
export function convertToHashesPerSecond(value, unitKey = 'TH') {
  const cleanVal = Math.max(0, Number(value) || 0);
  const u = HASHRATE_UNITS[String(unitKey).toUpperCase()] || HASHRATE_UNITS.TH;
  return cleanVal * Math.pow(10, u.exponent);
}

/**
 * Calculates complete PoW cryptocurrency mining profitability and payback metrics.
 * 
 * @param {Object} [inputs={}]
 * @param {number} [inputs.hashrate=200] - Miner hash rate in unit
 * @param {string} [inputs.hashrateUnit='TH'] - 'H' | 'KH' | 'MH' | 'GH' | 'TH' | 'PH' | 'EH'
 * @param {number} [inputs.powerWatts=3500] - Hardware power consumption in Watts
 * @param {number} [inputs.electricityCost=0.06] - Cost of electricity per kWh in quote fiat
 * @param {number} [inputs.cryptoPrice=65000] - Fiat price per cryptocurrency unit
 * @param {number} [inputs.uptimePct=99] - Operational hardware uptime % (0 - 100)
 * @param {number} [inputs.poolFeePct=2.0] - Mining pool fee percentage % (0 - 20)
 * @param {number} [inputs.hardwareCost=3500] - ASIC/Rig capital acquisition cost
 * @param {number} [inputs.otherDailyCost=0] - Facility, cooling, maintenance daily costs
 * @param {number} [inputs.networkHashrate=650] - Total PoW network hashrate in networkHashrateUnit
 * @param {string} [inputs.networkHashrateUnit='EH'] - Network hashrate unit
 * @param {number} [inputs.blockReward=3.125] - Block subsidy in native coins
 * @param {number} [inputs.blocksPerDay=144] - Number of network blocks mined per 24 hours
 * @param {number} [inputs.txFeesPerBlock=0.25] - Average transaction fees per block
 * @param {string} [inputs.currency='USD'] - Quote fiat currency
 * @param {string} [inputs.assetName='Bitcoin (BTC)'] - Cryptocurrency label
 * @param {number} [inputs.manualDailyCoins=null] - Direct manual coins per day override if provided
 * @returns {Object} Complete mining economics breakdown
 */
export function calculateMiningProfitability(inputs = {}) {
  const {
    hashrate = 200,
    hashrateUnit = 'TH',
    powerWatts = 3500,
    electricityCost = 0.06,
    cryptoPrice = 65000,
    uptimePct = 99,
    poolFeePct = 2.0,
    hardwareCost = 3500,
    otherDailyCost = 0,
    networkHashrate = 650,
    networkHashrateUnit = 'EH',
    blockReward = 3.125,
    blocksPerDay = 144,
    txFeesPerBlock = 0.25,
    currency = 'USD',
    assetName = 'Bitcoin (BTC)',
    manualDailyCoins = null,
  } = inputs;

  // 1. INPUT SANITIZATION
  const cleanHashrate = Math.max(0, Number(hashrate) || 0);
  const cleanWatts = Math.max(0, Number(powerWatts) || 0);
  const cleanElecRate = Math.max(0, Number(electricityCost) || 0);
  const cleanCryptoPrice = Math.max(0, Number(cryptoPrice) || 0);
  const cleanUptimePct = Math.max(0, Math.min(100, Number(uptimePct) || 0));
  const cleanPoolFeePct = Math.max(0, Math.min(50, Number(poolFeePct) || 0));
  const cleanHwCost = Math.max(0, Number(hardwareCost) || 0);
  const cleanOtherDailyCost = Math.max(0, Number(otherDailyCost) || 0);
  const cleanNetHashrate = Math.max(0, Number(networkHashrate) || 0);
  const cleanBlockReward = Math.max(0, Number(blockReward) || 0);
  const cleanBlocksPerDay = Math.max(0, Number(blocksPerDay) || 0);
  const cleanTxFees = Math.max(0, Number(txFeesPerBlock) || 0);

  const currKey = String(currency).trim().toUpperCase();
  const currMeta = FIAT_CURRENCIES[currKey] || FIAT_CURRENCIES.USD;
  const sym = currMeta.symbol;
  const currDecimals = currMeta.decimals;

  // 2. HASHRATE NORMALIZATION
  const minerBaseHashrate = convertToHashesPerSecond(cleanHashrate, hashrateUnit);
  const netBaseHashrate = convertToHashesPerSecond(cleanNetHashrate, networkHashrateUnit);

  // 3. COINS MINED PER DAY
  let dailyCoinsGross = 0;
  const uptimeFactor = cleanUptimePct / 100;

  if (manualDailyCoins !== null && manualDailyCoins !== undefined && Number(manualDailyCoins) > 0) {
    dailyCoinsGross = Number(manualDailyCoins) * uptimeFactor;
  } else if (netBaseHashrate > 0 && minerBaseHashrate > 0) {
    const minerNetworkShare = minerBaseHashrate / netBaseHashrate;
    const totalDailyBlockReward = cleanBlocksPerDay * (cleanBlockReward + cleanTxFees);
    dailyCoinsGross = minerNetworkShare * totalDailyBlockReward * uptimeFactor;
  }

  const monthlyCoinsGross = dailyCoinsGross * (365 / 12);
  const annualCoinsGross = dailyCoinsGross * 365;

  // 4. GROSS REVENUE
  const dailyGrossRevenue = Math.round((dailyCoinsGross * cleanCryptoPrice) * 100) / 100;
  const monthlyGrossRevenue = Math.round((dailyGrossRevenue * (365 / 12)) * 100) / 100;
  const annualGrossRevenue = Math.round((dailyGrossRevenue * 365) * 100) / 100;

  // 5. OPERATING EXPENSES (OPEX)
  // Electricity
  const dailyKwh = (cleanWatts / 1000) * 24 * uptimeFactor;
  const monthlyKwh = Math.round((dailyKwh * (365 / 12)) * 100) / 100;
  const annualKwh = Math.round((dailyKwh * 365) * 100) / 100;

  const dailyElecCost = Math.round((dailyKwh * cleanElecRate) * 100) / 100;
  const monthlyElecCost = Math.round((dailyElecCost * (365 / 12)) * 100) / 100;
  const annualElecCost = Math.round((dailyElecCost * 365) * 100) / 100;

  // Pool Fees
  const dailyPoolFee = Math.round((dailyGrossRevenue * (cleanPoolFeePct / 100)) * 100) / 100;
  const monthlyPoolFee = Math.round((dailyPoolFee * (365 / 12)) * 100) / 100;
  const annualPoolFee = Math.round((dailyPoolFee * 365) * 100) / 100;

  // Other OPEX
  const dailyOtherCost = cleanOtherDailyCost;
  const monthlyOtherCost = Math.round((dailyOtherCost * (365 / 12)) * 100) / 100;
  const annualOtherCost = Math.round((dailyOtherCost * 365) * 100) / 100;

  // Total OPEX
  const dailyTotalOpex = Math.round((dailyElecCost + dailyPoolFee + dailyOtherCost) * 100) / 100;
  const monthlyTotalOpex = Math.round((dailyTotalOpex * (365 / 12)) * 100) / 100;
  const annualTotalOpex = Math.round((dailyTotalOpex * 365) * 100) / 100;

  // 6. NET PROFIT / LOSS
  const dailyNetProfit = Math.round((dailyGrossRevenue - dailyTotalOpex) * 100) / 100;
  const monthlyNetProfit = Math.round((dailyNetProfit * (365 / 12)) * 100) / 100;
  const annualNetProfit = Math.round((dailyNetProfit * 365) * 100) / 100;

  // 7. PAYBACK PERIOD & HARDWARE ROI
  let paybackDays = null;
  let paybackMonths = null;
  let annualRoiPct = 0;

  if (dailyNetProfit > 0 && cleanHwCost > 0) {
    paybackDays = Number((cleanHwCost / dailyNetProfit).toFixed(1));
    paybackMonths = Number((paybackDays / (365 / 12)).toFixed(1));
    annualRoiPct = Number(((annualNetProfit / cleanHwCost) * 100).toFixed(2));
  } else if (cleanHwCost === 0 && dailyNetProfit > 0) {
    paybackDays = 0;
    paybackMonths = 0;
    annualRoiPct = 100;
  }

  // 8. BREAK-EVEN CRYPTO PRICE (SHUTDOWN PRICE)
  // Revenue(P_be) * (1 - PoolFee%/100) = ElecCost + OtherCost
  // DailyCoins * P_be * (1 - PoolFee/100) = DailyElecCost + DailyOtherCost
  let breakEvenCryptoPrice = 0;
  const poolRetentionFactor = 1 - (cleanPoolFeePct / 100);

  if (dailyCoinsGross > 0 && poolRetentionFactor > 0) {
    const requiredDailyCash = dailyElecCost + dailyOtherCost;
    breakEvenCryptoPrice = Number((requiredDailyCash / (dailyCoinsGross * poolRetentionFactor)).toFixed(2));
  }

  // 9. THERMODYNAMIC & UNIT EFFICIENCY METRICS
  let efficiencyJoulePerTh = null;
  if (minerBaseHashrate > 0) {
    // 1 TH/s = 10^12 H/s
    const minerThs = minerBaseHashrate / Math.pow(10, 12);
    efficiencyJoulePerTh = minerThs > 0 ? Number((cleanWatts / minerThs).toFixed(2)) : 0;
  }

  const electricityCostPerCoin = dailyCoinsGross > 0
    ? Number((dailyElecCost / dailyCoinsGross).toFixed(2))
    : 0;

  const totalCostPerCoin = dailyCoinsGross > 0
    ? Number((dailyTotalOpex / dailyCoinsGross).toFixed(2))
    : 0;

  // 10. STATUS CLASSIFICATION
  let status = 'BREAK_EVEN';
  if (dailyNetProfit > 0.01) {
    status = 'PROFITABLE';
  } else if (dailyNetProfit < -0.01) {
    status = 'UNPROFITABLE';
  }

  // 11. DYNAMIC HERO DECISION VERDICT
  let heroVerdict = '';
  const formattedDailyNet = Math.abs(dailyNetProfit).toLocaleString(undefined, {
    minimumFractionDigits: currDecimals,
    maximumFractionDigits: currDecimals,
  });
  const formattedMonthlyNet = Math.abs(monthlyNetProfit).toLocaleString(undefined, {
    minimumFractionDigits: currDecimals,
    maximumFractionDigits: currDecimals,
  });

  if (status === 'PROFITABLE') {
    heroVerdict = `Profitable Mining Operation: +${sym}${formattedDailyNet}/day (+${sym}${formattedMonthlyNet}/mo). ${paybackMonths !== null ? `Hardware payback: ${paybackMonths} months.` : ''}`;
  } else if (status === 'UNPROFITABLE') {
    heroVerdict = `Unprofitable Operation: -${sym}${formattedDailyNet}/day (-${sym}${formattedMonthlyNet}/mo). Electricity cost exceeds revenue.`;
  } else {
    heroVerdict = `Break-Even Operation: Daily revenue exactly offsets operating power and pool costs (${sym}0 net).`;
  }

  // 12. ACTIONABLE RECOMMENDATIONS & WARNINGS
  const recommendations = [];

  if (status === 'UNPROFITABLE') {
    recommendations.push({
      title: 'Power Costs Exceed Gross Revenue (Negative Cashflow)',
      type: 'critical',
      description: `At ${sym}${cleanElecRate}/kWh, daily power (${sym}${dailyElecCost}) exceeds daily gross revenue (${sym}${dailyGrossRevenue}). The operation is currently mining at an economic loss of ${sym}${formattedDailyNet} per day. Consider securing lower industrial electricity rates or powering down until network difficulty or crypto price adjusts.`,
    });
  } else if (dailyElecCost > (dailyGrossRevenue * 0.75)) {
    recommendations.push({
      title: 'High Power Cost Drag (>75% of Revenue)',
      type: 'warning',
      description: `Electricity consumption accounts for ${Math.round((dailyElecCost / dailyGrossRevenue) * 100)}% of gross mining revenue. Any market price drop below your break-even threshold of ${sym}${breakEvenCryptoPrice.toLocaleString()} will push this rig into negative cashflow.`,
    });
  } else {
    recommendations.push({
      title: 'Favorable Operating Margin',
      type: 'positive',
      description: `Power and pool expenses consume ${Math.round((dailyTotalOpex / dailyGrossRevenue) * 100)}% of revenue, generating healthy net cashflow of +${sym}${formattedMonthlyNet} per month.`,
    });
  }

  if (breakEvenCryptoPrice > 0) {
    recommendations.push({
      title: `Shutdown / Break-Even Price: ${sym}${breakEvenCryptoPrice.toLocaleString()}`,
      type: 'info',
      description: `To maintain positive cashflow after paying electricity (${sym}${cleanElecRate}/kWh) and ${cleanPoolFeePct}% pool fees, the cryptocurrency price must remain above ${sym}${breakEvenCryptoPrice.toLocaleString()}.`,
    });
  }

  recommendations.push({
    title: 'Dynamic Network Difficulty & Halving Advisory',
    type: 'info',
    description: 'Mining yield calculations assume static difficulty and block rewards. In reality, network hashrate and difficulty adjust dynamically every 2,016 blocks (~2 weeks on Bitcoin), altering real-world production over time.',
  });

  return {
    hashrate: cleanHashrate,
    hashrateUnit,
    powerWatts: cleanWatts,
    electricityCost: cleanElecRate,
    cryptoPrice: cleanCryptoPrice,
    uptimePct: cleanUptimePct,
    poolFeePct: cleanPoolFeePct,
    hardwareCost: cleanHwCost,
    otherDailyCost: cleanOtherDailyCost,
    networkHashrate: cleanNetHashrate,
    networkHashrateUnit,
    blockReward: cleanBlockReward,
    blocksPerDay: cleanBlocksPerDay,
    txFeesPerBlock: cleanTxFees,
    currency: currKey,
    symbol: sym,
    decimals: currDecimals,
    assetName,
    dailyCoinsGross,
    monthlyCoinsGross,
    annualCoinsGross,
    dailyGrossRevenue,
    monthlyGrossRevenue,
    annualGrossRevenue,
    dailyKwh,
    monthlyKwh,
    annualKwh,
    dailyElecCost,
    monthlyElecCost,
    annualElecCost,
    dailyPoolFee,
    monthlyPoolFee,
    annualPoolFee,
    dailyOtherCost,
    monthlyOtherCost,
    annualOtherCost,
    dailyTotalOpex,
    monthlyTotalOpex,
    annualTotalOpex,
    dailyNetProfit,
    monthlyNetProfit,
    annualNetProfit,
    paybackDays,
    paybackMonths,
    annualRoiPct,
    breakEvenCryptoPrice,
    efficiencyJoulePerTh,
    electricityCostPerCoin,
    totalCostPerCoin,
    status,
    heroVerdict,
    recommendations,
  };
}

// Aliases
export const calculateCryptoMining = calculateMiningProfitability;
export const calculateBtcMiningProfitability = calculateMiningProfitability;
export const calculateAsicProfitability = calculateMiningProfitability;
