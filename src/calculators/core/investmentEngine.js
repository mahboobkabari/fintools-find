/**
 * @typedef {Object} SipOptions
 * @property {number} [monthlyInvestment=5000] - Monthly SIP contribution amount
 * @property {number} [expectedReturnRate=12] - Annual expected return rate (%)
 * @property {number} [tenureYears=10] - Investment duration in years
 */

/**
 * @typedef {Object} InvestmentResult
 * @property {number} totalInvested - Total principal invested over tenure
 * @property {number} estReturns - Cumulative estimated wealth returns
 * @property {number} maturityValue - Final total wealth corpus
 * @property {number} tenureMonths - Total duration in months
 * @property {Array<{ year: number, invested: number, returns: number, totalValue: number }>} yearlyBreakdown
 */

/**
 * Universal Investment Math Engine.
 * Serves as the core for SIP, Lumpsum, Step-Up SIP, SWP, Mutual Funds, and CAGR tools.
 *
 * @param {SipOptions} [options]
 * @returns {InvestmentResult}
 */
export function calculateSip({
  monthlyInvestment = 5000,
  expectedReturnRate = 12,
  tenureYears = 10,
} = {}) {
  const p = Math.max(0, Number(monthlyInvestment) || 0);
  const annualRate = Math.max(0, Number(expectedReturnRate) || 0);
  const years = Math.max(1, Number(tenureYears) || 1);
  const n = years * 12;

  const i = (annualRate / 12) / 100;

  let maturityValue = 0;
  if (i === 0) {
    maturityValue = p * n;
  } else {
    // FV = P × [((1+i)^n − 1) / i] × (1+i)
    maturityValue = Math.round(p * (((Math.pow(1 + i, n) - 1) / i) * (1 + i)));
  }

  const totalInvested = p * n;
  const estReturns = Math.max(0, maturityValue - totalInvested);

  // Generate Year-by-Year Growth Schedule
  const yearlyBreakdown = [];
  let currentBalance = 0;
  let cumInvested = 0;

  for (let m = 1; m <= n; m++) {
    currentBalance = (currentBalance + p) * (1 + i);
    cumInvested += p;

    if (m % 12 === 0) {
      const yearIndex = m / 12;
      const roundedVal = Math.round(currentBalance);
      const roundedInvested = Math.round(cumInvested);
      yearlyBreakdown.push({
        year: yearIndex,
        invested: roundedInvested,
        returns: Math.max(0, roundedVal - roundedInvested),
        totalValue: roundedVal,
      });
    }
  }

  return {
    totalInvested: Math.round(totalInvested),
    estReturns: Math.round(estReturns),
    maturityValue: Math.round(maturityValue),
    tenureMonths: n,
    yearlyBreakdown,
  };
}

/**
 * Lumpsum Investment Calculator Core.
 */
export function calculateLumpsum({ principal = 100000, expectedReturnRate = 12, tenureYears = 10 } = {}) {
  const p = Math.max(0, Number(principal) || 0);
  const r = Math.max(0, Number(expectedReturnRate) || 0) / 100;
  const t = Math.max(1, Number(tenureYears) || 1);

  const maturityValue = Math.round(p * Math.pow(1 + r, t));
  const estReturns = Math.max(0, maturityValue - p);

  const yearlyBreakdown = [];
  for (let y = 1; y <= t; y++) {
    const val = Math.round(p * Math.pow(1 + r, y));
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
    tenureMonths: t * 12,
    yearlyBreakdown,
  };
}
