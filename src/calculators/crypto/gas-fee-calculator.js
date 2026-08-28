/**
 * Flagship Gas Fee & EVM Transaction Cost Engine (Sprint 89 / Flagship #96)
 * 
 * Institutional-grade Ethereum / EVM transaction cost modeling, EIP-1559 mechanics,
 * gas limit vs actual gas consumption, fiat conversions, batch scaling, and gas budgeting:
 * 1. Precision Gwei <-> Native Token (ETH/BNB/MATIC/AVAX) bidirectional conversion (1e9 ratio)
 * 2. EIP-1559 fee calculation: Effective Gas Price = min(Max Fee, Base Fee + Priority Fee)
 * 3. Legacy Gas Price mode: Effective Gas Price = Gas Price
 * 4. Actual Gas Consumed vs Gas Limit ceiling decomposition & unused gas refund quantification
 * 5. Base Fee (Burned) vs Priority Fee / Tip (Validator) breakdown
 * 6. Multi-currency fiat valuation (USD, EUR, GBP, INR, CAD, AUD, AED, SGD, JPY)
 * 7. Multi-transaction batch cost scaling
 * 8. Gas cost as % of transaction value & break-even investment value solver
 * 9. Gas budget capacity planner (Max affordable txs & remaining budget)
 * 
 * DISCLAIMER: This calculator uses user-entered simulation parameters for educational modeling.
 * It does not connect to live RPC endpoints and does not claim to represent real-time gas or FX prices.
 */

export const GWEI_PER_NATIVE_TOKEN = 1_000_000_000; // 10^9

export const TRANSACTION_TYPES = {
  SIMPLE_TRANSFER: { id: 'SIMPLE_TRANSFER', label: 'Simple Native Transfer (ETH)', defaultGasLimit: 21000, defaultGasUsed: 21000 },
  ERC20_TRANSFER: { id: 'ERC20_TRANSFER', label: 'ERC-20 Token Transfer (USDT/USDC)', defaultGasLimit: 65000, defaultGasUsed: 45000 },
  DEX_SWAP: { id: 'DEX_SWAP', label: 'DEX Swap (Uniswap v2/v3)', defaultGasLimit: 180000, defaultGasUsed: 130000 },
  NFT_MINT: { id: 'NFT_MINT', label: 'NFT Mint / Trade', defaultGasLimit: 200000, defaultGasUsed: 150000 },
  DEFI_INTERACTION: { id: 'DEFI_INTERACTION', label: 'Complex DeFi Interaction / Harvest', defaultGasLimit: 350000, defaultGasUsed: 260000 },
  CUSTOM: { id: 'CUSTOM', label: 'Custom Gas Limit & Usage', defaultGasLimit: 100000, defaultGasUsed: 75000 },
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
 * Safely sanitizes a numerical input.
 * 
 * @param {*} val 
 * @param {number} defaultVal 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function sanitizeNumber(val, defaultVal = 0, min = 0, max = Infinity) {
  if (val === null || val === undefined) return defaultVal;
  const n = Number(val);
  if (isNaN(n) || !isFinite(n)) return defaultVal;
  return Math.min(Math.max(n, min), max);
}

/**
 * Converts Gwei to Native Token (ETH).
 * Formula: ETH = Gwei / 1,000,000,000
 * 
 * @param {number} gwei 
 * @returns {number}
 */
export function convertGweiToNative(gwei) {
  const g = sanitizeNumber(gwei, 0, 0);
  return g / GWEI_PER_NATIVE_TOKEN;
}

/**
 * Converts Native Token (ETH) to Gwei.
 * Formula: Gwei = ETH * 1,000,000,000
 * 
 * @param {number} native 
 * @returns {number}
 */
export function convertNativeToGwei(native) {
  const n = sanitizeNumber(native, 0, 0);
  return n * GWEI_PER_NATIVE_TOKEN;
}

/**
 * Computes EIP-1559 effective gas price in Gwei.
 * Effective Gas Price = min(Max Fee, Base Fee + Priority Fee)
 * 
 * @param {number} baseFeeGwei - Network base fee (burned)
 * @param {number} priorityFeeGwei - Tip to validator
 * @param {number} maxFeeGwei - Max fee ceiling
 * @returns {number}
 */
export function calculateEffectiveGasPriceGwei(baseFeeGwei = 20, priorityFeeGwei = 2, maxFeeGwei = 35) {
  const base = sanitizeNumber(baseFeeGwei, 0, 0);
  const tip = sanitizeNumber(priorityFeeGwei, 0, 0);
  const max = sanitizeNumber(maxFeeGwei, base + tip, 0);

  const desiredFee = base + tip;
  return Math.min(max, desiredFee);
}

/**
 * Solves maximum affordable transactions for a given gas budget.
 * 
 * @param {number} totalBudgetFiat - Total gas budget in fiat
 * @param {number} costPerTxFiat - Gas cost per single transaction in fiat
 * @returns {Object}
 */
export function calculateGasBudgetCapacity(totalBudgetFiat = 100, costPerTxFiat = 5) {
  const budget = sanitizeNumber(totalBudgetFiat, 0, 0);
  const cost = sanitizeNumber(costPerTxFiat, 0, 0);

  if (cost <= 0 || budget <= 0) {
    return {
      maxTransactions: 0,
      totalSpentFiat: 0,
      remainingBudgetFiat: budget,
      budgetUtilizationPct: 0,
    };
  }

  const maxTransactions = Math.floor(budget / cost);
  const totalSpentFiat = maxTransactions * cost;
  const remainingBudgetFiat = Math.max(0, budget - totalSpentFiat);
  const budgetUtilizationPct = (totalSpentFiat / budget) * 100;

  return {
    maxTransactions,
    totalSpentFiat: Number(totalSpentFiat.toFixed(2)),
    remainingBudgetFiat: Number(remainingBudgetFiat.toFixed(2)),
    budgetUtilizationPct: Number(budgetUtilizationPct.toFixed(2)),
  };
}

/**
 * Primary pure calculation engine for EVM Gas Fees and transaction economics.
 * 
 * @param {Object} [inputs={}]
 * @param {string} [inputs.feeModel='EIP_1559'] - 'EIP_1559' | 'LEGACY'
 * @param {string} [inputs.transactionType='SIMPLE_TRANSFER'] - ID from TRANSACTION_TYPES
 * @param {number} [inputs.gasLimit=21000] - Transaction gas limit ceiling (units)
 * @param {number} [inputs.gasUsed=21000] - Actual gas consumed by execution (units)
 * @param {number} [inputs.baseFeeGwei=20] - EIP-1559 Base fee per gas (Gwei)
 * @param {number} [inputs.priorityFeeGwei=2] - EIP-1559 Priority fee / Miner tip (Gwei)
 * @param {number} [inputs.maxFeeGwei=35] - EIP-1559 Max fee per gas (Gwei)
 * @param {number} [inputs.legacyGasPriceGwei=25] - Legacy gas price (Gwei)
 * @param {number} [inputs.nativeTokenPrice=2500] - Price of 1 Native token (e.g. 1 ETH = $2,500)
 * @param {string} [inputs.nativeTokenSymbol='ETH'] - Symbol of native token
 * @param {string} [inputs.currency='USD'] - Quote fiat currency
 * @param {number} [inputs.transactionCount=1] - Number of transactions to model
 * @param {number} [inputs.transactionValueFiat=500] - Fiat value of underlying asset transferred/swapped
 * @param {number} [inputs.maxAcceptableCostPct=2.0] - Maximum acceptable gas cost % of transaction value
 * @param {number} [inputs.gasBudgetFiat=100] - Total gas budget in fiat for capacity planning
 * @returns {Object} Comprehensive gas fee breakdown and economics
 */
export function calculateGasFee(inputs = {}) {
  const {
    feeModel = 'EIP_1559',
    transactionType = 'SIMPLE_TRANSFER',
    gasLimit = 21000,
    gasUsed = 21000,
    baseFeeGwei = 20,
    priorityFeeGwei = 2,
    maxFeeGwei = 35,
    legacyGasPriceGwei = 25,
    nativeTokenPrice = 2500,
    nativeTokenSymbol = 'ETH',
    currency = 'USD',
    transactionCount = 1,
    transactionValueFiat = 500,
    maxAcceptableCostPct = 2.0,
    gasBudgetFiat = 100,
  } = inputs;

  // 1. SANITIZE INPUTS
  const cleanGasLimit = sanitizeNumber(gasLimit, 21000, 21000, 30_000_000);
  const cleanGasUsed = sanitizeNumber(gasUsed, cleanGasLimit, 21000, cleanGasLimit);
  const cleanBaseFeeGwei = sanitizeNumber(baseFeeGwei, 20, 0, 100000);
  const cleanPriorityFeeGwei = sanitizeNumber(priorityFeeGwei, 2, 0, 100000);
  const cleanMaxFeeGwei = sanitizeNumber(maxFeeGwei, cleanBaseFeeGwei + cleanPriorityFeeGwei, 0, 100000);
  const cleanLegacyPriceGwei = sanitizeNumber(legacyGasPriceGwei, 25, 0, 100000);
  const cleanTokenPrice = sanitizeNumber(nativeTokenPrice, 2500, 0.00000001);
  const cleanTxCount = sanitizeNumber(transactionCount, 1, 1, 1000000);
  const cleanTxValueFiat = sanitizeNumber(transactionValueFiat, 500, 0);
  const cleanMaxCostPct = sanitizeNumber(maxAcceptableCostPct, 2.0, 0.01, 100);
  const cleanGasBudget = sanitizeNumber(gasBudgetFiat, 100, 0);

  const currMeta = FIAT_CURRENCIES[currency] || FIAT_CURRENCIES.USD;

  // 2. EFFECTIVE GAS PRICE RESOLUTION
  let effectiveGasPriceGwei = 0;
  let effectiveBaseFeeGwei = 0;
  let effectivePriorityFeeGwei = 0;

  if (feeModel === 'LEGACY') {
    effectiveGasPriceGwei = cleanLegacyPriceGwei;
    effectiveBaseFeeGwei = cleanLegacyPriceGwei;
    effectivePriorityFeeGwei = 0;
  } else {
    // EIP-1559
    effectiveGasPriceGwei = calculateEffectiveGasPriceGwei(cleanBaseFeeGwei, cleanPriorityFeeGwei, cleanMaxFeeGwei);
    effectiveBaseFeeGwei = Math.min(cleanBaseFeeGwei, effectiveGasPriceGwei);
    effectivePriorityFeeGwei = Math.max(0, effectiveGasPriceGwei - effectiveBaseFeeGwei);
  }

  // 3. SINGLE TRANSACTION GAS COSTS (NATIVE TOKEN & FIAT)
  const actualGasCostNative = (cleanGasUsed * effectiveGasPriceGwei) / GWEI_PER_NATIVE_TOKEN;
  const actualGasCostFiat = actualGasCostNative * cleanTokenPrice;

  // Base Fee portion (Burned) vs Priority Fee portion (Miner/Validator tip)
  const baseFeeCostNative = (cleanGasUsed * effectiveBaseFeeGwei) / GWEI_PER_NATIVE_TOKEN;
  const baseFeeCostFiat = baseFeeCostNative * cleanTokenPrice;

  const priorityFeeCostNative = (cleanGasUsed * effectivePriorityFeeGwei) / GWEI_PER_NATIVE_TOKEN;
  const priorityFeeCostFiat = priorityFeeCostNative * cleanTokenPrice;

  // Max Potential Cost based on Gas Limit and Max Fee
  const maxPotentialPriceGwei = feeModel === 'LEGACY' ? cleanLegacyPriceGwei : cleanMaxFeeGwei;
  const maxPotentialCostNative = (cleanGasLimit * maxPotentialPriceGwei) / GWEI_PER_NATIVE_TOKEN;
  const maxPotentialCostFiat = maxPotentialCostNative * cleanTokenPrice;

  // Unused Gas refund
  const unusedGasUnits = Math.max(0, cleanGasLimit - cleanGasUsed);
  const unusedGasRefundNative = Math.max(0, maxPotentialCostNative - actualGasCostNative);
  const unusedGasRefundFiat = unusedGasRefundNative * cleanTokenPrice;

  // 4. BATCH TRANSACTION SCALING
  const batchGasCostNative = actualGasCostNative * cleanTxCount;
  const batchGasCostFiat = actualGasCostFiat * cleanTxCount;
  const batchMaxCostFiat = maxPotentialCostFiat * cleanTxCount;

  // 5. ADVANCED TRANSACTION ECONOMICS & RATIOS
  const gasCostRatioPct = cleanTxValueFiat > 0 ? (actualGasCostFiat / cleanTxValueFiat) * 100 : 0;
  const breakEvenTxValueFiat = cleanMaxCostPct > 0 ? (actualGasCostFiat / (cleanMaxCostPct / 100)) : 0;

  // 6. GAS BUDGET CAPACITY PLANNER
  const budgetCapacity = calculateGasBudgetCapacity(cleanGasBudget, actualGasCostFiat);

  // 7. COMMON TRANSACTION SCENARIO BENCHMARKS (Hypothetical User Reference)
  const scenarioEstimates = [
    { type: 'Simple ETH Transfer', gas: 21000, nativeCost: (21000 * effectiveGasPriceGwei) / GWEI_PER_NATIVE_TOKEN },
    { type: 'ERC-20 Token Transfer', gas: 45000, nativeCost: (45000 * effectiveGasPriceGwei) / GWEI_PER_NATIVE_TOKEN },
    { type: 'Uniswap v3 Swap', gas: 130000, nativeCost: (130000 * effectiveGasPriceGwei) / GWEI_PER_NATIVE_TOKEN },
    { type: 'NFT Mint / Trade', gas: 150000, nativeCost: (150000 * effectiveGasPriceGwei) / GWEI_PER_NATIVE_TOKEN },
    { type: 'DeFi Yield Harvest', gas: 260000, nativeCost: (260000 * effectiveGasPriceGwei) / GWEI_PER_NATIVE_TOKEN },
  ].map((s) => ({
    ...s,
    fiatCost: s.nativeCost * cleanTokenPrice,
  }));

  return {
    inputs: {
      feeModel,
      transactionType,
      gasLimit: cleanGasLimit,
      gasUsed: cleanGasUsed,
      baseFeeGwei: cleanBaseFeeGwei,
      priorityFeeGwei: cleanPriorityFeeGwei,
      maxFeeGwei: cleanMaxFeeGwei,
      legacyGasPriceGwei: cleanLegacyPriceGwei,
      nativeTokenPrice: cleanTokenPrice,
      nativeTokenSymbol,
      currency: currMeta.code,
      transactionCount: cleanTxCount,
      transactionValueFiat: cleanTxValueFiat,
      maxAcceptableCostPct: cleanMaxCostPct,
      gasBudgetFiat: cleanGasBudget,
    },
    meta: {
      currencySymbol: currMeta.symbol,
      currencyCode: currMeta.code,
      currencyDecimals: currMeta.decimals,
      nativeTokenSymbol,
      effectiveGasPriceGwei: Number(effectiveGasPriceGwei.toFixed(4)),
      effectiveBaseFeeGwei: Number(effectiveBaseFeeGwei.toFixed(4)),
      effectivePriorityFeeGwei: Number(effectivePriorityFeeGwei.toFixed(4)),
      unusedGasUnits,
    },
    singleTransaction: {
      actualGasCostNative: Number(actualGasCostNative.toFixed(10)),
      actualGasCostFiat: Number(actualGasCostFiat.toFixed(currMeta.decimals)),
      baseFeeCostNative: Number(baseFeeCostNative.toFixed(10)),
      baseFeeCostFiat: Number(baseFeeCostFiat.toFixed(currMeta.decimals)),
      priorityFeeCostNative: Number(priorityFeeCostNative.toFixed(10)),
      priorityFeeCostFiat: Number(priorityFeeCostFiat.toFixed(currMeta.decimals)),
      maxPotentialCostNative: Number(maxPotentialCostNative.toFixed(10)),
      maxPotentialCostFiat: Number(maxPotentialCostFiat.toFixed(currMeta.decimals)),
      unusedGasRefundNative: Number(unusedGasRefundNative.toFixed(10)),
      unusedGasRefundFiat: Number(unusedGasRefundFiat.toFixed(currMeta.decimals)),
    },
    batch: {
      transactionCount: cleanTxCount,
      totalBatchNativeCost: Number(batchGasCostNative.toFixed(10)),
      totalBatchFiatCost: Number(batchGasCostFiat.toFixed(currMeta.decimals)),
      totalBatchMaxCostFiat: Number(batchMaxCostFiat.toFixed(currMeta.decimals)),
    },
    economics: {
      gasCostRatioPct: Number(gasCostRatioPct.toFixed(2)),
      breakEvenTxValueFiat: Number(breakEvenTxValueFiat.toFixed(currMeta.decimals)),
      maxAcceptableCostPct: cleanMaxCostPct,
    },
    budget: budgetCapacity,
    scenarioEstimates,
  };
}

export const calculateEthereumGasFee = calculateGasFee;
export const calculateEvmTransactionFee = calculateGasFee;
