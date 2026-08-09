import { SIMPLE_INTEREST_CONFIG } from '../configs/simple-interest-calculator.config.js';

/**
 * Flagship Simple Interest Financial & Decision Engine (V3)
 * Implements pure simple interest calculations supporting:
 * - Simple Interest Formula: I = P * (r/100) * t
 * - Total Maturity Amount: A = P + I
 * - Flexible Duration Units: Days (365-day convention), Months (12-month convention), Years
 * - Compound Interest Comparison: A_compound = P * (1 + r/100)^t
 * - Compounding Growth Advantage Indicator: Delta = A_compound - A
 * - Inflation-Adjusted Real Purchasing Power: Real = A / (1 + i)^t
 * - Period-by-period annual schedule rollups
 *
 * @param {Object} inputs
 * @param {number} [inputs.principal=100000] - Initial principal deposit
 * @param {number} [inputs.rate=8.0] - Annual interest rate (% p.a.)
 * @param {number} [inputs.durationValue=5] - Duration numeric value
 * @param {string} [inputs.durationUnit='years'] - Duration unit ('years'|'months'|'days')
 * @param {number} [inputs.inflationRate=5.0] - Inflation rate (% p.a.)
 * @param {string} [inputs.currency='INR'] - Currency code ('INR'|'USD'|'EUR'|'GBP')
 * @returns {Object} Structured simple interest decision model
 */
export function calculateSimpleInterestCalculator(inputs = {}) {
  const {
    principal = 100000,
    rate = 8.0,
    durationValue = 5,
    durationUnit = 'years',
    inflationRate = 5.0,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & BOUNDARY AUDIT
  const rawPrincipal = Math.max(0, Number(principal) || 0);
  const rawRate = Math.max(0, Number(rate) || 0);
  const rawDurationVal = Math.max(0, Number(durationValue) || 0);
  const rawInflation = Math.max(0, Math.min(20, Number(inflationRate) || 0));

  const validUnits = SIMPLE_INTEREST_CONFIG.durationUnits.map((u) => u.id);
  const unit = validUnits.includes(durationUnit) ? durationUnit : 'years';

  // 2. CONVERT DURATION TO TENURE YEARS (t)
  let tenureYears = 0;
  if (unit === 'days') {
    tenureYears = rawDurationVal / SIMPLE_INTEREST_CONFIG.daysPerYear;
  } else if (unit === 'months') {
    tenureYears = rawDurationVal / 12;
  } else {
    tenureYears = rawDurationVal;
  }

  // 3. PURE SIMPLE INTEREST CALCULATIONS
  // I = P * r * t
  const rateDec = rawRate / 100;
  const exactSimpleInterest = rawPrincipal * rateDec * tenureYears;
  const simpleInterestEarned = Math.round(exactSimpleInterest);
  const finalMaturityAmount = Math.round(rawPrincipal + exactSimpleInterest);

  // 4. COMPOUND INTEREST COMPARISON
  // A_compound = P * (1 + r)^t
  const exactCompoundCorpus = rawPrincipal * Math.pow(1 + rateDec, tenureYears);
  const compoundMaturityAmount = Math.round(exactCompoundCorpus);
  const compoundInterestEarned = Math.max(0, compoundMaturityAmount - rawPrincipal);
  const compoundingAdvantage = Math.max(0, compoundMaturityAmount - finalMaturityAmount);

  // 5. INFLATION-ADJUSTED REAL PURCHASING POWER
  const purchasingPowerAmount = Math.round(finalMaturityAmount / Math.pow(1 + rawInflation / 100, tenureYears));

  // 6. YEAR-BY-YEAR GROWTH SCHEDULE
  const yearlySchedule = [];
  const totalPeriods = Math.max(1, Math.ceil(tenureYears));
  let runningCumInterest = 0;

  for (let y = 1; y <= totalPeriods; y++) {
    const startBal = Math.round(rawPrincipal + runningCumInterest);
    const periodFraction = Math.min(1, tenureYears - (y - 1));
    const yearInterestExact = rawPrincipal * rateDec * periodFraction;
    const yearInterestRounded = Math.round(yearInterestExact);

    runningCumInterest += yearInterestExact;
    const endBal = Math.round(rawPrincipal + runningCumInterest);

    yearlySchedule.push({
      year: y,
      periodFraction: Number(periodFraction.toFixed(3)),
      startBalance: startBal,
      interestEarned: yearInterestRounded,
      cumulativeInterest: Math.round(runningCumInterest),
      endBalance: endBal,
      isFinalRow: y === totalPeriods,
    });
  }

  // 7. SCENARIO MATRIX COMPARISON
  const scenarios = [
    {
      id: 'baseline',
      label: `Current (${rawDurationVal} ${unit})`,
      principal: rawPrincipal,
      rate: rawRate,
      tenureYears: Number(tenureYears.toFixed(2)),
      simpleInterestEarned,
      finalMaturityAmount,
    },
    {
      id: 'double_principal',
      label: 'Double Principal Deposit',
      principal: rawPrincipal * 2,
      rate: rawRate,
      tenureYears: Number(tenureYears.toFixed(2)),
      simpleInterestEarned: Math.round(rawPrincipal * 2 * rateDec * tenureYears),
      finalMaturityAmount: Math.round(rawPrincipal * 2 + rawPrincipal * 2 * rateDec * tenureYears),
    },
    {
      id: 'higher_rate',
      label: 'Higher Interest (+2%)',
      principal: rawPrincipal,
      rate: rawRate + 2.0,
      tenureYears: Number(tenureYears.toFixed(2)),
      simpleInterestEarned: Math.round(rawPrincipal * ((rawRate + 2.0) / 100) * tenureYears),
      finalMaturityAmount: Math.round(rawPrincipal + rawPrincipal * ((rawRate + 2.0) / 100) * tenureYears),
    },
    {
      id: 'longer_tenure',
      label: '5 Extra Years (+5 Yrs)',
      principal: rawPrincipal,
      rate: rawRate,
      tenureYears: Number((tenureYears + 5).toFixed(2)),
      simpleInterestEarned: Math.round(rawPrincipal * rateDec * (tenureYears + 5)),
      finalMaturityAmount: Math.round(rawPrincipal + rawPrincipal * rateDec * (tenureYears + 5)),
    },
  ];

  // 8. HERO SUMMARY TEXT
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const durationLabel = `${rawDurationVal} ${unit}`;
  const heroText = `Investing ${currencySymbol}${rawPrincipal.toLocaleString()} at ${rawRate}% p.a. simple interest over ${durationLabel} generates ${currencySymbol}${simpleInterestEarned.toLocaleString()} in total simple interest, yielding a final maturity payout of ${currencySymbol}${finalMaturityAmount.toLocaleString()}.`;

  return {
    principal: rawPrincipal,
    rate: rawRate,
    durationValue: rawDurationVal,
    durationUnit: unit,
    tenureYears: Number(tenureYears.toFixed(4)),
    inflationRate: rawInflation,
    currency,

    // Primary Outputs
    primaryOutput: finalMaturityAmount,
    finalMaturityAmount,
    simpleInterestEarned,
    compoundMaturityAmount,
    compoundInterestEarned,
    compoundingAdvantage,
    purchasingPowerAmount,

    // Matrices & Schedules
    yearlySchedule,
    scenarios,
    heroText,
  };
}
