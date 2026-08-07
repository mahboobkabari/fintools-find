/**
 * Shared Investment Mathematics & Analysis Utilities
 * Reusable across SIP, Lumpsum, SWP, CAGR, Mutual Fund, Retirement, and NPS calculators.
 */

/**
 * Compound Growth Calculator
 * Supports compounding frequency: 1 (annually), 2 (semi-annually), 4 (quarterly), 12 (monthly).
 */
export function compoundGrowth({
  principal = 100000,
  rate = 12,
  tenureYears = 10,
  compoundingFrequency = 1,
} = {}) {
  const p = Math.max(0, Number(principal) || 0);
  const r = Math.max(0, Number(rate) || 0) / 100;
  const t = Math.max(1, Number(tenureYears) || 1);
  const n = Math.max(1, Number(compoundingFrequency) || 1);

  if (p === 0) {
    return { maturityValue: 0, estReturns: 0, totalInvested: 0, yearlyBreakdown: [] };
  }

  if (r === 0) {
    const yearlyBreakdown = [];
    for (let y = 1; y <= t; y++) {
      yearlyBreakdown.push({ year: y, invested: p, returns: 0, totalValue: p });
    }
    return { maturityValue: p, estReturns: 0, totalInvested: p, yearlyBreakdown };
  }

  // FV = P * (1 + r/n)^(n*t)
  const maturityValue = Math.round(p * Math.pow(1 + r / n, n * t));
  const estReturns = Math.max(0, maturityValue - p);

  const yearlyBreakdown = [];
  for (let y = 1; y <= t; y++) {
    const val = Math.round(p * Math.pow(1 + r / n, n * y));
    yearlyBreakdown.push({
      year: y,
      invested: p,
      returns: Math.max(0, val - p),
      totalValue: val,
    });
  }

  return {
    totalInvested: p,
    estReturns,
    maturityValue,
    yearlyBreakdown,
  };
}

/**
 * Inflation Adjusted Value (Real Purchasing Power)
 * Real Value = Future Value / (1 + inflationRate)^tenureYears
 */
export function inflationAdjustedValue(futureValue = 0, inflationRate = 6, tenureYears = 10) {
  const fv = Math.max(0, Number(futureValue) || 0);
  const inf = Math.max(0, Number(inflationRate) || 0) / 100;
  const t = Math.max(1, Number(tenureYears) || 1);

  const realValue = Math.round(fv / Math.pow(1 + inf, t));
  const purchasingPowerLoss = Math.max(0, fv - realValue);

  return { realValue, purchasingPowerLoss };
}

/**
 * Wealth Multiplier (Ratio of Future Value to Initial Principal)
 */
export function wealthMultiplier(futureValue = 0, initialInvestment = 1) {
  const fv = Math.max(0, Number(futureValue) || 0);
  const p = Math.max(1, Number(initialInvestment) || 1);
  return Number((fv / p).toFixed(2));
}

/**
 * Real Annualized Return (Fisher Equation)
 * Real Rate = ((1 + Nominal Rate) / (1 + Inflation Rate)) - 1
 */
export function realReturn(nominalRate = 12, inflationRate = 6) {
  const nom = Math.max(0, Number(nominalRate) || 0) / 100;
  const inf = Math.max(0, Number(inflationRate) || 0) / 100;

  const realRate = ((1 + nom) / (1 + inf) - 1) * 100;
  return Number(realRate.toFixed(2));
}

/**
 * Sensitivity Analysis (Conservative, Expected, Optimistic Scenarios)
 */
export function sensitivityAnalysis({ principal = 100000, expectedRate = 12, tenureYears = 10, delta = 2 } = {}) {
  const conservativeRate = Math.max(0, expectedRate - delta);
  const optimisticRate = expectedRate + delta;

  const conservativeRes = compoundGrowth({ principal, rate: conservativeRate, tenureYears });
  const expectedRes = compoundGrowth({ principal, rate: expectedRate, tenureYears });
  const optimisticRes = compoundGrowth({ principal, rate: optimisticRate, tenureYears });

  return {
    conservative: {
      rate: conservativeRate,
      futureValue: conservativeRes.maturityValue,
      estReturns: conservativeRes.estReturns,
      diffFromExpected: conservativeRes.maturityValue - expectedRes.maturityValue,
    },
    expected: {
      rate: expectedRate,
      futureValue: expectedRes.maturityValue,
      estReturns: expectedRes.estReturns,
      diffFromExpected: 0,
    },
    optimistic: {
      rate: optimisticRate,
      futureValue: optimisticRes.maturityValue,
      estReturns: optimisticRes.estReturns,
      diffFromExpected: optimisticRes.maturityValue - expectedRes.maturityValue,
    },
  };
}

/**
 * Delay Investment Simulator ("Cost of Waiting")
 * Compares investing today vs delaying by N years.
 */
export function delayInvestmentCost({ principal = 100000, expectedRate = 12, tenureYears = 10, delayYears = 5 } = {}) {
  const investTodayRes = compoundGrowth({ principal, rate: expectedRate, tenureYears });
  
  const reducedTenure = Math.max(1, tenureYears - delayYears);
  const investDelayedRes = compoundGrowth({ principal, rate: expectedRate, tenureYears: reducedTenure });

  const wealthCostOfWaiting = Math.max(0, investTodayRes.maturityValue - investDelayedRes.maturityValue);

  return {
    delayYears,
    todayValue: investTodayRes.maturityValue,
    delayedValue: investDelayedRes.maturityValue,
    wealthCostOfWaiting,
  };
}
