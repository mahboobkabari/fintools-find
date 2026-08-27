/**
 * Global Value Added Tax (VAT) & Consumption Tax Decision Engine (Math Engine V2)
 * Supports international tax authorities: UK HMRC, EU Directives, UAE FTA, Australia ATO, etc.
 * 
 * @param {Object} inputs
 * @param {number} [inputs.amount=1000] - Base net taxable price OR Gross tax-inclusive invoice amount
 * @param {number} [inputs.rate=20] - Applicable VAT percentage rate (e.g., 20% UK, 19% Germany, 5% UAE)
 * @param {string} [inputs.mode='exclusive'] - 'exclusive' (add VAT) | 'inclusive' (extract VAT / reverse VAT)
 * @param {string} [inputs.currencySymbol='£'] - Currency symbol (£, €, $, AED, etc.)
 */
export function calculateVatCalculator(inputs = {}) {
  const {
    amount = 1000,
    rate = 20,
    mode = 'exclusive',
    currencySymbol = '£',
  } = inputs;

  const rawAmt = Math.max(0, Number(amount) || 0);
  const rawRate = Math.max(0, Number(rate) || 0);
  const isInclusive = mode.toLowerCase() === 'inclusive';

  let netAmount = 0;
  let vatAmount = 0;
  let grossAmount = 0;

  if (isInclusive) {
    grossAmount = rawAmt;
    netAmount = rawRate > 0 ? grossAmount / (1 + rawRate / 100) : grossAmount;
    vatAmount = grossAmount - netAmount;
  } else {
    netAmount = rawAmt;
    vatAmount = netAmount * (rawRate / 100);
    grossAmount = netAmount + vatAmount;
  }

  // Round values to 2 decimal places and integer benchmarks
  const netRounded = Math.round(netAmount * 100) / 100;
  const vatRounded = Math.round(vatAmount * 100) / 100;
  const grossRounded = Math.round(grossAmount * 100) / 100;

  // Effective Tax Rate on Gross Final Price
  const effectiveRate = grossRounded > 0
    ? Math.round((vatRounded / grossRounded) * 10000) / 100
    : 0;

  // Tax per 100 currency units
  const taxPer100 = netRounded > 0 ? Math.round((vatRounded / netRounded) * 100) : 0;

  // Reverse VAT Sub-Analysis (Base extracted from gross)
  const reverseVat = {
    grossPrice: grossRounded,
    extractedNet: netRounded,
    extractedTax: vatRounded,
    taxFactor: rawRate > 0 ? Math.round((rawRate / (100 + rawRate)) * 10000) / 100 : 0,
  };

  // Scenario Comparisons (Zero-Rated 0%, Reduced 5%, Standard Current, EU Average 21%, High 25%)
  const calcScenario = (r) => {
    const scNet = netRounded;
    const scVat = Math.round(scNet * (r / 100) * 100) / 100;
    const scGross = Math.round((scNet + scVat) * 100) / 100;
    return {
      rate: r,
      netAmount: scNet,
      vatAmount: scVat,
      grossAmount: scGross,
      diffFromCurrent: Math.round((scVat - vatRounded) * 100) / 100,
    };
  };

  const scenarios = {
    zeroRated: calcScenario(0),
    reduced5: calcScenario(5),
    standardCurrent: {
      rate: rawRate,
      netAmount: netRounded,
      vatAmount: vatRounded,
      grossAmount: grossRounded,
      diffFromCurrent: 0,
    },
    euAverage21: calcScenario(21),
    high25: calcScenario(25),
  };

  // Itemized Commercial B2B / B2C Tax Invoice Preview
  const invoicePreview = {
    headline: isInclusive ? 'Tax-Inclusive Retail Invoice (VAT Extracted)' : 'Standard Commercial Tax Invoice (VAT Added)',
    netAmount: netRounded,
    vatAmount: vatRounded,
    grossAmount: grossRounded,
    rate: rawRate,
    currencySymbol,
    isInclusive,
  };

  // Smart Ranked Recommendations
  const recommendations = [
    {
      rank: 1,
      title: 'Input VAT Recovery Compliance',
      savings: vatRounded,
      action: `Ensure a valid VAT invoice with supplier VAT registration number is retained to reclaim ${currencySymbol}${vatRounded.toLocaleString()} input tax.`,
    },
    {
      rank: 2,
      title: 'Tax-Inclusive Price Reverse Extraction',
      savings: netRounded,
      action: `From a consumer retail price of ${currencySymbol}${grossRounded.toLocaleString()}, the pre-tax merchant revenue is ${currencySymbol}${netRounded.toLocaleString()}.`,
    },
    {
      rank: 3,
      title: 'Zero-Rate vs Exempt Supply Check',
      savings: vatRounded,
      action: `Verify if products qualify for 0% zero-rating (allowing input tax recovery) or exemption (disallowing input recovery).`,
    },
  ];

  // Hero Decision Text
  const heroText = isInclusive
    ? `Extracted ${currencySymbol}${vatRounded.toLocaleString()} VAT (${rawRate}%) from gross ${currencySymbol}${grossRounded.toLocaleString()}. Net taxable price is ${currencySymbol}${netRounded.toLocaleString()}.`
    : `${rawRate}% VAT adds ${currencySymbol}${vatRounded.toLocaleString()} on ${currencySymbol}${netRounded.toLocaleString()} net price. Total Invoice: ${currencySymbol}${grossRounded.toLocaleString()}.`;

  return {
    primaryOutput: Math.round(vatRounded),
    netAmount: netRounded,
    vatAmount: vatRounded,
    grossAmount: grossRounded,
    rate: rawRate,
    mode: isInclusive ? 'inclusive' : 'exclusive',
    currencySymbol,
    effectiveRate,
    taxPer100,
    reverseVat,
    scenarios,
    invoicePreview,
    recommendations,
    heroText,
  };
}

export const calculateVatTool = calculateVatCalculator;