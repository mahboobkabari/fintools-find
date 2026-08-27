/**
 * Flagship Cryptocurrency Staking Rewards Engine (Sprint 84 / Flagship #91)
 * 
 * Institutional-grade Proof-of-Stake (PoS) staking yields, compounding frequencies,
 * validator commissions, and token-price sensitivity calculation engine:
 * 1. Simple vs Compounded Staking Models (None, Daily, Weekly, Monthly, Quarterly, Annually)
 * 2. APR vs APY Bidirectional Conversion and Normalization
 * 3. Token-denominated Gross vs Net Staking Yields
 * 4. Validator Commissions & Fixed/Recurring Staking Fee Deductions
 * 5. Periodic Reward Projections (Daily, Monthly, Annual, Total Period)
 * 6. Dual Token & Fiat Valuation (USD, EUR, GBP, INR, CAD, AUD, AED, SGD, JPY)
 * 7. Token Price Sensitivity & Break-Even Depreciation Buffer Solver
 * 8. Unbonding & Lock-Up Period Liquidity Disclosures
 */

export const COMPOUNDING_FREQUENCIES = {
  NONE: { id: 'NONE', label: 'Simple (No Compounding)', periodsPerYear: 0 },
  DAILY: { id: 'DAILY', label: 'Daily Compounding (365/yr)', periodsPerYear: 365 },
  WEEKLY: { id: 'WEEKLY', label: 'Weekly Compounding (52/yr)', periodsPerYear: 52 },
  MONTHLY: { id: 'MONTHLY', label: 'Monthly Compounding (12/yr)', periodsPerYear: 12 },
  QUARTERLY: { id: 'QUARTERLY', label: 'Quarterly Compounding (4/yr)', periodsPerYear: 4 },
  SEMI_ANNUALLY: { id: 'SEMI_ANNUALLY', label: 'Semi-Annual Compounding (2/yr)', periodsPerYear: 2 },
  ANNUALLY: { id: 'ANNUALLY', label: 'Annual Compounding (1/yr)', periodsPerYear: 1 },
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
 * Converts APR (Annual Percentage Rate) to APY (Annual Percentage Yield).
 * 
 * @param {number} apr - APR percentage (e.g. 5 for 5%)
 * @param {number} periodsPerYear - Compounding frequency (e.g. 365 for daily)
 * @returns {number} APY percentage
 */
export function convertAprToApy(apr, periodsPerYear = 365) {
  const r = Math.max(0, Number(apr) || 0) / 100;
  const m = Math.max(0, Number(periodsPerYear) || 0);
  if (m === 0) return Number((r * 100).toFixed(4));
  const apy = Math.pow(1 + r / m, m) - 1;
  return Number((apy * 100).toFixed(4));
}

/**
 * Converts APY (Annual Percentage Yield) to APR (Annual Percentage Rate).
 * 
 * @param {number} apy - APY percentage (e.g. 5.12 for 5.12%)
 * @param {number} periodsPerYear - Compounding frequency
 * @returns {number} APR percentage
 */
export function convertApyToApr(apy, periodsPerYear = 365) {
  const y = Math.max(0, Number(apy) || 0) / 100;
  const m = Math.max(0, Number(periodsPerYear) || 0);
  if (m === 0) return Number((y * 100).toFixed(4));
  const apr = m * (Math.pow(1 + y, 1 / m) - 1);
  return Number((apr * 100).toFixed(4));
}

/**
 * Calculates comprehensive staking reward yield and balance metrics.
 * 
 * @param {Object} [inputs={}]
 * @param {number} [inputs.stakedAmount=10] - Number of tokens staked
 * @param {number} [inputs.tokenPrice=3000] - Fiat price per token
 * @param {string} [inputs.rateMode='APR'] - 'APR' | 'APY'
 * @param {number} [inputs.rewardRatePct=4.5] - Annual reward rate percentage (%)
 * @param {string} [inputs.compoundingFrequency='DAILY'] - 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'
 * @param {number} [inputs.durationMonths=12] - Staking period in months
 * @param {number} [inputs.validatorCommissionPct=5.0] - Validator commission percentage (%)
 * @param {number} [inputs.fixedFeeTokens=0] - Fixed staking transaction/gas fee in tokens
 * @param {number} [inputs.recurringMonthlyFeeTokens=0] - Recurring monthly fee in tokens
 * @param {number} [inputs.unbondingDays=0] - Lock-up / unbonding period in days
 * @param {string} [inputs.currency='USD'] - Fiat currency code
 * @param {string} [inputs.assetName='Ethereum (ETH)'] - Cryptocurrency label
 * @returns {Object} Complete staking rewards statement
 */
export function calculateStakingRewards(inputs = {}) {
  const {
    stakedAmount = 10,
    tokenPrice = 3000,
    rateMode = 'APR',
    rewardRatePct = 4.5,
    compoundingFrequency = 'DAILY',
    durationMonths = 12,
    validatorCommissionPct = 5.0,
    fixedFeeTokens = 0,
    recurringMonthlyFeeTokens = 0,
    unbondingDays = 0,
    currency = 'USD',
    assetName = 'Ethereum (ETH)',
  } = inputs;

  // 1. INPUT SANITIZATION
  const cleanStakedAmount = Math.max(0, Number(stakedAmount) || 0);
  const cleanTokenPrice = Math.max(0, Number(tokenPrice) || 0);
  const cleanRewardRate = Math.max(0, Math.min(1000, Number(rewardRatePct) || 0));
  const cleanDurationMonths = Math.max(0, Number(durationMonths) || 0);
  const cleanCommissionPct = Math.max(0, Math.min(100, Number(validatorCommissionPct) || 0));
  const cleanFixedFeeTokens = Math.max(0, Number(fixedFeeTokens) || 0);
  const cleanRecurringMonthlyFee = Math.max(0, Number(recurringMonthlyFeeTokens) || 0);
  const cleanUnbondingDays = Math.max(0, Number(unbondingDays) || 0);

  const freqKey = String(compoundingFrequency).trim().toUpperCase();
  const freqConfig = COMPOUNDING_FREQUENCIES[freqKey] || COMPOUNDING_FREQUENCIES.DAILY;
  const periodsPerYear = freqConfig.periodsPerYear;

  const currKey = String(currency).trim().toUpperCase();
  const currMeta = FIAT_CURRENCIES[currKey] || FIAT_CURRENCIES.USD;
  const sym = currMeta.symbol;
  const currDecimals = currMeta.decimals;

  // 2. NORMALIZED APR & APY
  const isApyMode = String(rateMode).toUpperCase() === 'APY';
  let effectiveApr = 0;
  let effectiveApy = 0;

  if (isApyMode) {
    effectiveApy = cleanRewardRate;
    effectiveApr = convertApyToApr(cleanRewardRate, periodsPerYear);
  } else {
    effectiveApr = cleanRewardRate;
    effectiveApy = convertAprToApy(cleanRewardRate, periodsPerYear);
  }

  // 3. GROSS STAKING REWARD TOKENS
  const durationYears = cleanDurationMonths / 12;
  let grossEndingBalanceTokens = 0;
  let grossRewardTokens = 0;

  if (cleanStakedAmount > 0 && durationYears > 0 && cleanRewardRate > 0) {
    if (periodsPerYear === 0) {
      // Simple Interest (No Compounding)
      grossRewardTokens = cleanStakedAmount * (effectiveApr / 100) * durationYears;
      grossEndingBalanceTokens = cleanStakedAmount + grossRewardTokens;
    } else {
      // Discrete Compound Interest
      const ratePerPeriod = (effectiveApr / 100) / periodsPerYear;
      const totalPeriods = periodsPerYear * durationYears;
      grossEndingBalanceTokens = cleanStakedAmount * Math.pow(1 + ratePerPeriod, totalPeriods);
      grossRewardTokens = grossEndingBalanceTokens - cleanStakedAmount;
    }
  } else {
    grossEndingBalanceTokens = cleanStakedAmount;
    grossRewardTokens = 0;
  }

  // 4. COMMISSION & STAKING FEES
  const commissionTokens = grossRewardTokens * (cleanCommissionPct / 100);
  const totalRecurringFeesTokens = cleanRecurringMonthlyFee * cleanDurationMonths;
  const totalFeesTokens = commissionTokens + cleanFixedFeeTokens + totalRecurringFeesTokens;

  // 5. NET REWARDS & BALANCES
  const netRewardTokens = Math.max(0, grossRewardTokens - totalFeesTokens);
  const netEndingBalanceTokens = cleanStakedAmount + netRewardTokens;

  // ROI & Annualized Yield
  const totalRoiPct = cleanStakedAmount > 0
    ? Number(((netRewardTokens / cleanStakedAmount) * 100).toFixed(3))
    : 0;

  const annualizedYieldPct = (cleanStakedAmount > 0 && durationYears > 0)
    ? Number(((Math.pow(netEndingBalanceTokens / cleanStakedAmount, 1 / durationYears) - 1) * 100).toFixed(3))
    : 0;

  // 6. PERIODIC BREAKDOWNS (Daily, Monthly, Annual)
  const totalDays = durationYears * 365;
  const dailyRewardTokens = totalDays > 0 ? netRewardTokens / totalDays : 0;
  const monthlyRewardTokens = dailyRewardTokens * (365 / 12);
  const annualRewardTokens = dailyRewardTokens * 365;

  // 7. FIAT VALUATIONS
  const initialFiatValue = Math.round((cleanStakedAmount * cleanTokenPrice) * 100) / 100;
  const grossRewardFiatValue = Math.round((grossRewardTokens * cleanTokenPrice) * 100) / 100;
  const commissionFiatValue = Math.round((commissionTokens * cleanTokenPrice) * 100) / 100;
  const totalFeesFiatValue = Math.round((totalFeesTokens * cleanTokenPrice) * 100) / 100;
  const netRewardFiatValue = Math.round((netRewardTokens * cleanTokenPrice) * 100) / 100;
  const netEndingFiatValue = Math.round((netEndingBalanceTokens * cleanTokenPrice) * 100) / 100;

  const dailyRewardFiatValue = Math.round((dailyRewardTokens * cleanTokenPrice) * 100) / 100;
  const monthlyRewardFiatValue = Math.round((monthlyRewardTokens * cleanTokenPrice) * 100) / 100;
  const annualRewardFiatValue = Math.round((annualRewardTokens * cleanTokenPrice) * 100) / 100;

  // 8. TOKEN PRICE SENSITIVITY & BREAK-EVEN ANALYSIS
  // Minimum token price at exit for total ending fiat value to equal initial fiat capital
  let breakEvenTokenPrice = cleanTokenPrice;
  let breakEvenBufferPct = 0;

  if (netEndingBalanceTokens > 0) {
    breakEvenTokenPrice = Number((initialFiatValue / netEndingBalanceTokens).toFixed(4));
    if (cleanTokenPrice > 0) {
      breakEvenBufferPct = Number((((cleanTokenPrice - breakEvenTokenPrice) / cleanTokenPrice) * 100).toFixed(2));
    }
  }

  // Bull (+50%), Flat (0%), Bear (-30%) scenarios
  const priceScenarios = {
    bull: {
      label: 'Bull Market (+50%)',
      price: cleanTokenPrice * 1.5,
      endingFiat: Math.round((netEndingBalanceTokens * (cleanTokenPrice * 1.5)) * 100) / 100,
      netGainFiat: Math.round(((netEndingBalanceTokens * (cleanTokenPrice * 1.5)) - initialFiatValue) * 100) / 100,
    },
    flat: {
      label: 'Constant Price (0%)',
      price: cleanTokenPrice,
      endingFiat: netEndingFiatValue,
      netGainFiat: netRewardFiatValue,
    },
    bear: {
      label: 'Bear Drawdown (-30%)',
      price: cleanTokenPrice * 0.7,
      endingFiat: Math.round((netEndingBalanceTokens * (cleanTokenPrice * 0.7)) * 100) / 100,
      netGainFiat: Math.round(((netEndingBalanceTokens * (cleanTokenPrice * 0.7)) - initialFiatValue) * 100) / 100,
    },
  };

  // 9. DYNAMIC HERO DECISION VERDICT
  let heroVerdict = '';
  const formattedNetFiat = netRewardFiatValue.toLocaleString(undefined, {
    minimumFractionDigits: currDecimals,
    maximumFractionDigits: currDecimals,
  });

  heroVerdict = `Staking Yield: +${netRewardTokens.toFixed(4)} ${assetName} (+${sym}${formattedNetFiat}) over ${cleanDurationMonths} months (${totalRoiPct}% ROI).`;

  // 10. ACTIONABLE RECOMMENDATIONS & WARNINGS
  const recommendations = [];

  if (periodsPerYear === 0 && cleanDurationMonths >= 12) {
    const compoundedSim = calculateStakingRewards({
      ...inputs,
      compoundingFrequency: 'DAILY',
    });
    const extraTokens = compoundedSim.netRewardTokens - netRewardTokens;
    if (extraTokens > 0.0001) {
      recommendations.push({
        title: 'Compounding Opportunity',
        type: 'info',
        description: `Enabling automated daily compounding would generate an additional +${extraTokens.toFixed(4)} tokens (+${sym}${Math.round(extraTokens * cleanTokenPrice).toLocaleString()}) over this ${cleanDurationMonths}-month horizon.`,
      });
    }
  }

  if (breakEvenBufferPct > 0) {
    recommendations.push({
      title: `Price Depreciation Buffer: ${breakEvenBufferPct}%`,
      type: 'positive',
      description: `Your staking rewards provide a ${breakEvenBufferPct}% downside buffer. The token price could decline to ${sym}${breakEvenTokenPrice.toLocaleString()} before your total capital suffers an absolute fiat loss.`,
    });
  }

  if (cleanUnbondingDays > 0) {
    recommendations.push({
      title: `${cleanUnbondingDays}-Day Unbonding Lock-Up Period`,
      type: 'warning',
      description: `Tokens locked in this protocol require ${cleanUnbondingDays} days to unbond before they can be transferred or sold on spot exchanges. Unbonding tokens typically do not earn staking yield.`,
    });
  }

  if (cleanCommissionPct > 10) {
    recommendations.push({
      title: `High Validator Commission (${cleanCommissionPct}%)`,
      type: 'warning',
      description: `The validator takes ${cleanCommissionPct}% of gross rewards (${commissionTokens.toFixed(4)} tokens / ${sym}${commissionFiatValue.toLocaleString()}). Comparing alternative reliable validators with lower commission (e.g. 3-5%) will increase your net yield.`,
    });
  }

  recommendations.push({
    title: 'Staking Tax & Market Volatility Disclosure',
    type: 'info',
    description: 'Staking rewards are subject to token price volatility and protocol emission changes. In many jurisdictions, receiving staking rewards is treated as taxable ordinary income upon receipt.',
  });

  return {
    stakedAmount: cleanStakedAmount,
    tokenPrice: cleanTokenPrice,
    rateMode: isApyMode ? 'APY' : 'APR',
    rewardRatePct: cleanRewardRate,
    effectiveApr,
    effectiveApy,
    compoundingFrequency: freqKey,
    compoundingLabel: freqConfig.label,
    periodsPerYear,
    durationMonths: cleanDurationMonths,
    durationYears,
    validatorCommissionPct: cleanCommissionPct,
    fixedFeeTokens: cleanFixedFeeTokens,
    recurringMonthlyFeeTokens: cleanRecurringMonthlyFee,
    unbondingDays: cleanUnbondingDays,
    currency: currKey,
    symbol: sym,
    decimals: currDecimals,
    assetName,
    grossEndingBalanceTokens,
    grossRewardTokens,
    commissionTokens,
    totalFeesTokens,
    netRewardTokens,
    netEndingBalanceTokens,
    totalRoiPct,
    annualizedYieldPct,
    dailyRewardTokens,
    monthlyRewardTokens,
    annualRewardTokens,
    initialFiatValue,
    grossRewardFiatValue,
    commissionFiatValue,
    totalFeesFiatValue,
    netRewardFiatValue,
    netEndingFiatValue,
    dailyRewardFiatValue,
    monthlyRewardFiatValue,
    annualRewardFiatValue,
    breakEvenTokenPrice,
    breakEvenBufferPct,
    priceScenarios,
    heroVerdict,
    recommendations,
  };
}

// Aliases
export const calculateStakingYield = calculateStakingRewards;
export const calculateCryptoStaking = calculateStakingRewards;
export const calculateProofOfStakeRewards = calculateStakingRewards;
