import { INFLATION_CONFIG } from '../configs/inflation-calculator.config.js';

/**
 * Flagship Inflation Financial Engine (V3)
 * Implements purchasing power erosion and price growth modeling supporting:
 * - Future Inflated Cost: FV = PV * (1 + i)^n
 * - Eroded Purchasing Power: Real PV = PV / (1 + i)^n
 * - Cumulative Inflation Rate (%): ((1 + i)^n - 1) * 100
 * - Fisher Real Rate of Return: r_real = ((1 + r)/(1 + i) - 1) * 100
 * - Lumpsum Required Today: P = FV / (1 + r)^n
 * - Year-by-year schedule rollups
 *
 * @param {Object} inputs
 * @param {number} [inputs.amount=100000] - Present value amount today
 * @param {number} [inputs.inflationRate=6.0] - Annual inflation rate (% p.a.)
 * @param {number} [inputs.tenureYears=10] - Time horizon in years
 * @param {number} [inputs.investmentReturnRate=12.0] - Nominal return rate (% p.a.)
 * @param {string} [inputs.currency='INR'] - Currency code ('INR'|'USD'|'EUR'|'GBP')
 * @returns {Object} Structured inflation decision model
 */
export function calculateInflationCalculator(inputs = {}) {
  const {
    amount = 100000,
    inflationRate = 6.0,
    tenureYears = 10,
    investmentReturnRate = 12.0,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & BOUNDARY AUDIT
  const rawAmount = Math.max(0, Number(amount) || 0);
  const rawInflation = Math.max(0, Math.min(50, Number(inflationRate) || 0));
  const rawTenure = Math.max(0, Math.min(50, Math.round(Number(tenureYears) || 0)));
  const rawReturn = Math.max(0, Math.min(50, Number(investmentReturnRate) || 0));

  const inflDec = rawInflation / 100;
  const retDec = rawReturn / 100;

  // 2. CORE MATHEMATICAL FORMULAS
  // FV = PV * (1 + i)^n
  const exactFutureCost = rawAmount * Math.pow(1 + inflDec, rawTenure);
  const futureCost = Math.round(exactFutureCost);
  const inflationDelta = Math.max(0, futureCost - Math.round(rawAmount));

  // Purchasing Power = PV / (1 + i)^n
  const exactPurchasingPower = rawAmount / Math.pow(1 + inflDec, rawTenure);
  const erodedPurchasingPower = Math.round(exactPurchasingPower);
  const purchasingPowerLossPercent = rawAmount > 0
    ? Number((((rawAmount - erodedPurchasingPower) / rawAmount) * 100).toFixed(2))
    : 0;

  // Cumulative Inflation (%) = ((1 + i)^n - 1) * 100
  const cumulativeInflationPercent = rawTenure > 0
    ? Number(((Math.pow(1 + inflDec, rawTenure) - 1) * 100).toFixed(2))
    : 0;

  // Fisher Real Rate of Return (%) = ((1 + r)/(1 + i) - 1) * 100
  const fisherRealReturnDec = (1 + retDec) / (1 + inflDec) - 1;
  const realReturnRate = Number((fisherRealReturnDec * 100).toFixed(2));

  // Nominal Investment Growth & Real Corpus
  const exactNominalCorpus = rawAmount * Math.pow(1 + retDec, rawTenure);
  const nominalInvestmentCorpus = Math.round(exactNominalCorpus);
  const realInvestmentCorpus = Math.round(nominalInvestmentCorpus / Math.pow(1 + inflDec, rawTenure));

  // Lumpsum Required Today @ Return Rate r to meet Future Inflated Cost FV
  const requiredLumpsumToday = rawTenure > 0 && retDec > 0
    ? Math.round(futureCost / Math.pow(1 + retDec, rawTenure))
    : futureCost;

  // 3. YEAR-BY-YEAR INFLATION SCHEDULE
  const yearlySchedule = [];
  const totalYears = Math.max(1, rawTenure);

  for (let y = 1; y <= totalYears; y++) {
    const yrFutureCost = Math.round(rawAmount * Math.pow(1 + inflDec, y));
    const yrPurchasingPower = Math.round(rawAmount / Math.pow(1 + inflDec, y));
    const yrCumInflation = Number(((Math.pow(1 + inflDec, y) - 1) * 100).toFixed(2));
    const yrNominalCorpus = Math.round(rawAmount * Math.pow(1 + retDec, y));

    yearlySchedule.push({
      year: y,
      futureCost: yrFutureCost,
      purchasingPower: yrPurchasingPower,
      cumulativeInflationPercent: yrCumInflation,
      nominalCorpus: yrNominalCorpus,
      isFinalRow: y === totalYears,
    });
  }

  // 4. SCENARIO MATRIX COMPARISON
  const scenarios = [
    {
      id: 'baseline',
      label: `Current (${rawInflation}% Inflation)`,
      inflationRate: rawInflation,
      futureCost,
      erodedPurchasingPower,
      cumulativeInflationPercent,
    },
    {
      id: 'low_inflation',
      label: 'Low Inflation (4% Target)',
      inflationRate: 4.0,
      futureCost: Math.round(rawAmount * Math.pow(1.04, rawTenure)),
      erodedPurchasingPower: Math.round(rawAmount / Math.pow(1.04, rawTenure)),
      cumulativeInflationPercent: Number(((Math.pow(1.04, rawTenure) - 1) * 100).toFixed(2)),
    },
    {
      id: 'high_inflation',
      label: 'High Inflation (8% Stress Test)',
      inflationRate: 8.0,
      futureCost: Math.round(rawAmount * Math.pow(1.08, rawTenure)),
      erodedPurchasingPower: Math.round(rawAmount / Math.pow(1.08, rawTenure)),
      cumulativeInflationPercent: Number(((Math.pow(1.08, rawTenure) - 1) * 100).toFixed(2)),
    },
  ];

  // 5. HERO SUMMARY TEXT
  const currencySymbol = currency === 'USD' ? '$' : '₹';
  const heroText = `An expense of ${currencySymbol}${rawAmount.toLocaleString()} today will cost ${currencySymbol}${futureCost.toLocaleString()} in ${rawTenure} years at an assumed ${rawInflation}% p.a. inflation rate, representing a cumulative ${cumulativeInflationPercent}% price increase.`;

  return {
    amount: rawAmount,
    inflationRate: rawInflation,
    tenureYears: rawTenure,
    investmentReturnRate: rawReturn,
    currency,

    // Primary Outputs
    primaryOutput: futureCost,
    futureCost,
    erodedPurchasingPower,
    inflationDelta,
    purchasingPowerLossPercent,
    cumulativeInflationPercent,
    realReturnRate,
    nominalInvestmentCorpus,
    realInvestmentCorpus,
    requiredLumpsumToday,

    // Reference & Schedules
    referenceData: INFLATION_CONFIG.referenceData,
    yearlySchedule,
    scenarios,
    heroText,
  };
}
