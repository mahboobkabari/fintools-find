/**
 * Flagship Currency Converter & Multi-Currency Valuation Engine (Math Engine V2)
 * Comprehensive Foreign Exchange (FX), Cross-Currency Arbitrage & Retail Spread Framework:
 * 
 * 1. Base Reference Rate Model:
 *    All currencies are anchored against USD reference rates (USD = 1.000000).
 *    Cross Rate (A -> B) = Rate(USD -> B) / Rate(USD -> A)
 * 2. Converted Amount = Amount * Cross Rate (A -> B)
 * 3. Inverse Cross Rate (B -> A) = 1 / Cross Rate (A -> B) = Rate(USD -> A) / Rate(USD -> B)
 * 4. Retail Bank Fee / Spread Simulation:
 *    Effective Rate = Cross Rate * (1 - FX_Spread_Pct / 100)
 *    Net Received = Amount * Effective Rate
 *    Spread Cost (in Target Currency) = (Amount * Cross Rate) - Net Received
 * 5. Quick Multi-Denomination Schedule Matrix
 * 6. Reference Rate Metadata & Transparency:
 *    Clearly stamps reference baseline date, source, and disclaimer that bank/card/remittance
 *    providers apply variable margins, commissions, and spreads.
 * 
 * @param {Object} inputs
 * @param {number} [inputs.amount=1000] - Amount to convert
 * @param {string} [inputs.fromCurrency='USD'] - Source ISO 4217 Currency Code
 * @param {string} [inputs.toCurrency='INR'] - Target ISO 4217 Currency Code
 * @param {number} [inputs.fxSpreadPct=0] - Optional Bank / Card FX Spread Fee % (0% = Mid-Market)
 * @param {string} [inputs.customRate] - Optional user-overridden exchange rate
 */

export const REFERENCE_RATE_METADATA = {
  baselineDate: '2026-08-27',
  source: 'International Interbank Reference FX Rates (Q3 2026 Baseline Benchmark)',
  rateType: 'Mid-Market Reference Rate (Indicative)',
  disclaimer: 'Exchange rates displayed are standard reference baseline benchmarks for financial analysis and estimation. Actual retail bank wire, credit card transactions, and remittance services will vary based on dealer spreads, dynamic currency conversion (DCC), and transfer fees.',
};

/**
 * Institutional Reference Exchange Rates against USD (USD = 1.000000)
 */
export const REFERENCE_EXCHANGE_RATES = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rateToUsd: 1.000000, flag: '🇺🇸', decimals: 2 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', rateToUsd: 87.500000, flag: '🇮🇳', decimals: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rateToUsd: 0.920000, flag: '🇪🇺', decimals: 2 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rateToUsd: 0.785000, flag: '🇬🇧', decimals: 2 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rateToUsd: 3.672500, flag: '🇦🇪', decimals: 2 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rateToUsd: 1.375000, flag: '🇨🇦', decimals: 2 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rateToUsd: 1.525000, flag: '🇦🇺', decimals: 2 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rateToUsd: 1.345000, flag: '🇸🇬', decimals: 2 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rateToUsd: 155.000000, flag: '🇯🇵', decimals: 0 },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rateToUsd: 0.895000, flag: '🇨🇭', decimals: 2 },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rateToUsd: 7.250000, flag: '🇨🇳', decimals: 2 },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', rateToUsd: 3.751000, flag: '🇸🇦', decimals: 2 },
  QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', rateToUsd: 3.641000, flag: '🇶🇦', decimals: 2 },
  KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', rateToUsd: 0.306500, flag: '🇰🇼', decimals: 3 },
  OMR: { code: 'OMR', name: 'Omani Rial', symbol: '﷼', rateToUsd: 0.384500, flag: '🇴🇲', decimals: 3 },
  BHD: { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', rateToUsd: 0.376000, flag: '🇧🇭', decimals: 3 },
  THB: { code: 'THB', name: 'Thai Baht', symbol: '฿', rateToUsd: 36.500000, flag: '🇹🇭', decimals: 2 },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', rateToUsd: 4.650000, flag: '🇲🇾', decimals: 2 },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', rateToUsd: 18.250000, flag: '🇿🇦', decimals: 2 },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', rateToUsd: 1.640000, flag: '🇳🇿', decimals: 2 },
};

export const SUPPORTED_CURRENCY_CODES = Object.keys(REFERENCE_EXCHANGE_RATES);

export const DEFAULT_CURRENCY_CONVERTER_INPUTS = {
  amount: 1000,
  fromCurrency: 'USD',
  toCurrency: 'INR',
  fxSpreadPct: 0,
  customRate: null,
};

/**
 * Pure Calculation Engine for Currency Conversion
 */
export function calculateCurrencyConverter(inputs = {}) {
  const merged = { ...DEFAULT_CURRENCY_CONVERTER_INPUTS, ...inputs };

  // 1. Amount Sanitization & Edge Safeguards
  const rawAmount = Number(merged.amount);
  let amount = isNaN(rawAmount) ? 1000 : rawAmount;
  // Disallow negative amounts in financial conversion
  if (amount < 0) {
    amount = Math.abs(amount);
  }

  // 2. Currency Code Sanitization & Fallback
  let fromCode = (merged.fromCurrency || 'USD').toString().trim().toUpperCase();
  let toCode = (merged.toCurrency || 'INR').toString().trim().toUpperCase();

  let isFromValid = true;
  let isToValid = true;

  if (!REFERENCE_EXCHANGE_RATES[fromCode]) {
    fromCode = 'USD';
    isFromValid = false;
  }
  if (!REFERENCE_EXCHANGE_RATES[toCode]) {
    toCode = 'INR';
    isToValid = false;
  }

  const fromMeta = REFERENCE_EXCHANGE_RATES[fromCode];
  const toMeta = REFERENCE_EXCHANGE_RATES[toCode];

  // 3. FX Spread / Bank Fee Sanitization
  const rawSpread = Number(merged.fxSpreadPct);
  const fxSpreadPct = isNaN(rawSpread) ? 0 : Math.max(0, Math.min(20, rawSpread));

  // 4. Rate Determination (Cross-Currency Rate Model)
  let midMarketRate = 1.0;
  if (fromCode === toCode) {
    midMarketRate = 1.0;
  } else if (merged.customRate && !isNaN(Number(merged.customRate)) && Number(merged.customRate) > 0) {
    midMarketRate = Number(merged.customRate);
  } else {
    // Cross Rate (A -> B) = Rate(USD -> B) / Rate(USD -> A)
    const fromRateToUsd = fromMeta.rateToUsd;
    const toRateToUsd = toMeta.rateToUsd;
    midMarketRate = toRateToUsd / fromRateToUsd;
  }

  // 5. Inverse Exchange Rate (B -> A)
  const inverseRate = midMarketRate > 0 ? 1 / midMarketRate : 0;

  // 6. Mid-Market Converted Amount
  const targetDecimals = toMeta.decimals !== undefined ? toMeta.decimals : 2;
  const rawConvertedAmount = amount * midMarketRate;
  const convertedAmount = Math.round(rawConvertedAmount * Math.pow(10, targetDecimals)) / Math.pow(10, targetDecimals);

  // 7. Bank Fee / Spread Impact
  const effectiveRate = midMarketRate * (1 - fxSpreadPct / 100);
  const rawEffectiveConverted = amount * effectiveRate;
  const effectiveConvertedAmount = Math.round(rawEffectiveConverted * Math.pow(10, targetDecimals)) / Math.pow(10, targetDecimals);
  const spreadFeeCostInTarget = Math.max(0, Math.round((convertedAmount - effectiveConvertedAmount) * 100) / 100);
  const spreadFeeCostInSource = midMarketRate > 0 ? Math.round((spreadFeeCostInTarget / midMarketRate) * 100) / 100 : 0;

  // 8. Multi-Denomination Schedule Matrix
  const standardDenominations = [1, 5, 10, 25, 50, 100, 500, 1000, 5000, 10000, 50000, 100000];
  const conversionMatrix = standardDenominations.map((denom) => {
    const directVal = Math.round(denom * midMarketRate * 100) / 100;
    const inverseVal = Math.round(denom * inverseRate * 100) / 100;
    return {
      sourceAmount: denom,
      convertedTarget: directVal,
      targetAmount: denom,
      convertedSource: inverseVal,
      formattedDirect: `${fromMeta.symbol}${denom.toLocaleString()} = ${toMeta.symbol}${directVal.toLocaleString(undefined, { minimumFractionDigits: targetDecimals, maximumFractionDigits: targetDecimals })}`,
      formattedInverse: `${toMeta.symbol}${denom.toLocaleString()} = ${fromMeta.symbol}${inverseVal.toLocaleString(undefined, { minimumFractionDigits: fromMeta.decimals, maximumFractionDigits: fromMeta.decimals })}`,
    };
  });

  // 9. Format display rates
  // Precision for unit exchange rate: up to 6 significant decimals
  const displayExchangeRate = midMarketRate < 0.01
    ? midMarketRate.toFixed(6)
    : midMarketRate < 1
    ? midMarketRate.toFixed(4)
    : midMarketRate.toFixed(4);

  const displayInverseRate = inverseRate < 0.01
    ? inverseRate.toFixed(6)
    : inverseRate < 1
    ? inverseRate.toFixed(4)
    : inverseRate.toFixed(4);

  // 10. Recommendations & Spread Warnings
  const recommendations = [
    {
      rank: 1,
      title: 'Mid-Market Rate vs Retail Bank Markup',
      savings: spreadFeeCostInTarget,
      action: fxSpreadPct > 0
        ? `A ${fxSpreadPct}% bank spread reduces your received amount by ${toMeta.symbol}${spreadFeeCostInTarget.toLocaleString()} (${fromMeta.symbol}${spreadFeeCostInSource.toLocaleString()} equivalent). Opting for zero-forex-markup cards or specialized fintech transfer services eliminates this hidden fee.`
        : `Your conversion is calculated at the exact mid-market reference rate (${displayExchangeRate}). When converting with commercial banks or airport kiosks, anticipate a 1.5% to 4.5% spread fee.`,
    },
    {
      rank: 2,
      title: 'Optimal Currency Conversion Strategy',
      savings: convertedAmount,
      action: `When spending abroad in ${toCode}, always choose to be billed in the local destination currency (${toCode}) rather than your home currency (${fromCode}) to avoid aggressive Dynamic Currency Conversion (DCC) markups.`,
    },
    {
      rank: 3,
      title: 'Cross-Currency Arbitrage & Rate Transparency',
      savings: inverseRate,
      action: `1 ${fromCode} = ${displayExchangeRate} ${toCode} · 1 ${toCode} = ${displayInverseRate} ${fromCode}. Reference benchmark anchored to Q3 2026 international interbank rates.`,
    },
  ];

  // 11. Hero Text
  const heroText = `${fromMeta.symbol}${amount.toLocaleString()} ${fromCode} = ${toMeta.symbol}${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: targetDecimals, maximumFractionDigits: targetDecimals })} ${toCode}`;

  return {
    primaryOutput: convertedAmount,
    amount,
    fromCurrency: fromCode,
    toCurrency: toCode,
    fromMeta,
    toMeta,
    midMarketRate,
    inverseRate,
    displayExchangeRate,
    displayInverseRate,
    convertedAmount,
    effectiveRate,
    effectiveConvertedAmount,
    fxSpreadPct,
    spreadFeeCostInTarget,
    spreadFeeCostInSource,
    conversionMatrix,
    recommendations,
    heroText,
    metadata: REFERENCE_RATE_METADATA,
    isFromValid,
    isToValid,
  };
}

export const calculateCurrencyConverterTool = calculateCurrencyConverter;
export const calculateFxConverter = calculateCurrencyConverter;
