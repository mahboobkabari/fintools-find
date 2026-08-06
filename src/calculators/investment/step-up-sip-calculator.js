/**
 * Step-up SIP Calculator Math Engine
 * Supports annual percentage contribution increases (top-ups).
 *
 * @param {Object} inputs
 * @param {number} inputs.initialMonthlyInvestment - Initial monthly contribution
 * @param {number} [inputs.annualStepUpPct=10] - Annual percentage increase in monthly contribution
 * @param {number} inputs.expectedReturnRate - Annual return rate (p.a.)
 * @param {number} inputs.tenureYears - Investment period in years
 */
export function calculateStepUpSip(inputs = {}) {
  const {
    initialMonthlyInvestment = 5000,
    annualStepUpPct = 10,
    expectedReturnRate = 12,
    tenureYears = 10,
  } = inputs;

  let currentMonthly = Math.max(0, Number(initialMonthlyInvestment) || 0);
  const stepUpPct = Math.max(0, Number(annualStepUpPct) || 0) / 100;
  const annualRate = Math.max(0, Number(expectedReturnRate) || 0);
  const years = Math.max(1, Number(tenureYears) || 1);
  const monthlyRate = annualRate / 12 / 100;

  let currentBalance = 0;
  let totalInvested = 0;
  const yearlyBreakdown = [];

  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      currentBalance = (currentBalance + currentMonthly) * (1 + monthlyRate);
      totalInvested += currentMonthly;
    }

    yearlyBreakdown.push({
      year: y,
      invested: Math.round(totalInvested),
      returns: Math.max(0, Math.round(currentBalance) - Math.round(totalInvested)),
      totalValue: Math.round(currentBalance),
    });

    // Increase monthly investment for the next year
    currentMonthly = Math.round(currentMonthly * (1 + stepUpPct));
  }

  const maturityValue = Math.round(currentBalance);
  const estReturns = Math.max(0, maturityValue - Math.round(totalInvested));

  return {
    totalInvested: Math.round(totalInvested),
    estReturns,
    maturityValue,
    yearlyBreakdown,
  };
}