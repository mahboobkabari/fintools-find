import {
  compoundGrowth,
  inflationAdjustedValue,
  wealthMultiplier,
  realReturn,
  sensitivityAnalysis,
  delayInvestmentCost,
} from '../core/investmentUtils.js';

/**
 * Flagship Lumpsum Investment Decision Engine (Math Engine V2)
 * 
 * @param {Object} inputs
 * @param {number} inputs.initialInvestment - One-time lumpsum investment amount (₹)
 * @param {number} inputs.expectedReturnRate - Expected annual return rate (% p.a.)
 * @param {number} inputs.tenureYears - Investment duration in years
 * @param {string} [inputs.compoundingFrequency='annually'] - 'annually' | 'semi-annually' | 'quarterly' | 'monthly'
 * @param {number} [inputs.inflationRate=6] - Estimated annual inflation rate (%)
 */
export function calculateLumpsumTool(inputs = {}) {
  const {
    initialInvestment = 100000,
    expectedReturnRate = 12,
    tenureYears = 10,
    compoundingFrequency = 'annually',
    inflationRate = 6,
  } = inputs;

  const principal = Math.max(0, Number(initialInvestment) || 0);
  const rate = Math.max(0, Number(expectedReturnRate) || 0);
  const tenure = Math.max(1, Number(tenureYears) || 1);
  const infRate = Math.max(0, Number(inflationRate) || 0);

  const freqMap = {
    annually: 1,
    'semi-annually': 2,
    quarterly: 4,
    monthly: 12,
  };
  const freq = freqMap[compoundingFrequency.toLowerCase()] || 1;

  // 1. Core Compound Growth Calculation
  const growthRes = compoundGrowth({
    principal,
    rate,
    tenureYears: tenure,
    compoundingFrequency: freq,
  });

  const maturityValue = growthRes.maturityValue;
  const totalInvested = growthRes.totalInvested;
  const estReturns = growthRes.estReturns;

  // 2. Returns & Multiplier Metrics
  const absoluteReturnPct = principal > 0 ? Math.round((estReturns / principal) * 100) : 0;
  const cagr = rate;
  const multiplier = wealthMultiplier(maturityValue, principal);

  // 3. Real Purchasing Power & Inflation Adjustments
  const { realValue: inflationAdjustedVal, purchasingPowerLoss } = inflationAdjustedValue(
    maturityValue,
    infRate,
    tenure
  );
  const netRealReturn = realReturn(rate, infRate);

  // 4. Human-Friendly Growth Visual ("Every ₹100 invested becomes ₹X")
  const repayPer100 = principal > 0 ? Math.round((maturityValue / principal) * 100) : 100;
  const monthlyEquivalentGrowth = Math.round(estReturns / (tenure * 12));

  // 5. Scenario Sensitivity (Conservative -2%, Expected, Optimistic +2%)
  const scenarios = sensitivityAnalysis({
    principal,
    expectedRate: rate,
    tenureYears: tenure,
    delta: 2,
  });

  // 6. Delay Investment Simulator ("Cost of Waiting 5 Years")
  const delayCost = delayInvestmentCost({
    principal,
    expectedRate: rate,
    tenureYears: tenure,
    delayYears: 5,
  });

  // 7. Investment Health Score (0 - 100)
  let healthScore = 100;
  if (netRealReturn <= 0) healthScore -= 50;
  else if (netRealReturn < 3) healthScore -= 20;
  if (tenure < 3) healthScore -= 15;
  if (multiplier >= 2.5) healthScore += 10;
  healthScore = Math.max(10, Math.min(100, Math.round(healthScore)));

  let healthStatus = 'Strong Wealth Creator';
  let healthColor = 'text-semantic-success';
  let healthDesc = `Your real return after inflation is +${netRealReturn}%. Your capital grows by ${multiplier}x!`;

  if (healthScore >= 60 && healthScore < 80) {
    healthStatus = 'Moderate Growth';
    healthColor = 'text-accent-sky';
    healthDesc = `Positive real return of +${netRealReturn}%. Beats inflation rate of ${infRate}%.`;
  } else if (healthScore < 60) {
    healthStatus = 'Inflation Risk';
    healthColor = 'text-semantic-danger';
    healthDesc = `Your real return after inflation is ${netRealReturn}%. Inflation is eroding purchasing power!`;
  }

  // 8. Smart Ranked Recommendations
  const recommendations = [
    {
      rank: 1,
      title: 'Invest Today (Avoid 5-Year Delay)',
      savings: delayCost.wealthCostOfWaiting,
      action: `Investing today instead of delaying 5 years creates an extra ₹${delayCost.wealthCostOfWaiting.toLocaleString('en-IN')} in future wealth.`,
    },
    {
      rank: 2,
      title: `Compounding Advantage (${multiplier}x Multiplier)`,
      savings: estReturns,
      action: `Your initial ₹${principal.toLocaleString('en-IN')} grows to ₹${maturityValue.toLocaleString('en-IN')} over ${tenure} years.`,
    },
    {
      rank: 3,
      title: 'Beat Inflation Real Return Goal',
      savings: purchasingPowerLoss,
      action: `Targeting ${rate}% return preserves ₹${inflationAdjustedVal.toLocaleString('en-IN')} in real purchasing power.`,
    },
  ]
    .sort((a, b) => b.savings - a.savings)
    .map((rec, idx) => ({ ...rec, rank: idx + 1 }));

  // 9. Hero Decision Text
  const heroText = `Investing ₹${principal.toLocaleString('en-IN')} today at ${rate}% grows your wealth to ₹${maturityValue.toLocaleString('en-IN')} in ${tenure} years (${multiplier}x Wealth Multiplier).`;

  return {
    initialInvestment: principal,
    expectedReturnRate: rate,
    tenureYears: tenure,
    compoundingFrequency,
    inflationRate: infRate,
    maturityValue,
    totalInvested,
    estReturns,
    absoluteReturnPct,
    cagr,
    realReturn: netRealReturn,
    inflationAdjustedValue: inflationAdjustedVal,
    purchasingPowerLoss,
    wealthMultiplier: multiplier,
    repayPer100,
    monthlyEquivalentGrowth,
    yearlyBreakdown: growthRes.yearlyBreakdown,
    scenarios,
    delayCost,
    healthScore,
    healthStatus,
    healthColor,
    healthDesc,
    recommendations,
    heroText,
    primaryOutput: maturityValue,
  };
}

export const calculateLumpsumCalculator = calculateLumpsumTool;