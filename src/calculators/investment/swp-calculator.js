/**
 * SWP (Systematic Withdrawal Plan) Calculator Math Engine
 *
 * @param {Object} inputs
 * @param {number} inputs.totalInvestment - Initial lump-sum capital corpus
 * @param {number} inputs.monthlyWithdrawal - Fixed monthly withdrawal payout
 * @param {number} inputs.expectedReturnRate - Annual return rate (p.a.)
 * @param {number} inputs.tenureYears - Withdrawal duration in years
 */
export function calculateSwp(inputs = {}) {
  const {
    totalInvestment = 5000000,
    monthlyWithdrawal = 30000,
    expectedReturnRate = 8,
    tenureYears = 10,
  } = inputs;

  const initialCorpus = Math.max(0, Number(totalInvestment) || 0);
  const withdrawal = Math.max(0, Number(monthlyWithdrawal) || 0);
  const annualRate = Math.max(0, Number(expectedReturnRate) || 0);
  const years = Math.max(1, Number(tenureYears) || 1);
  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = years * 12;

  let currentBalance = initialCorpus;
  let totalWithdrawn = 0;
  const yearlyBreakdown = [];

  for (let m = 1; m <= totalMonths; m++) {
    if (currentBalance <= 0) {
      currentBalance = 0;
      break;
    }

    // Apply monthly interest growth first, then subtract monthly withdrawal payout
    const monthlyGrowth = currentBalance * monthlyRate;
    currentBalance = currentBalance + monthlyGrowth - withdrawal;
    totalWithdrawn += withdrawal;

    if (currentBalance < 0) {
      currentBalance = 0;
    }

    if (m % 12 === 0) {
      yearlyBreakdown.push({
        year: m / 12,
        invested: initialCorpus,
        totalWithdrawn: Math.round(totalWithdrawn),
        totalValue: Math.round(currentBalance),
      });
    }
  }

  const finalBalance = Math.round(currentBalance);
  const roundedWithdrawn = Math.round(totalWithdrawn);

  return {
    totalInvestment: initialCorpus,
    totalWithdrawn: roundedWithdrawn,
    finalBalance,
    yearlyBreakdown,
  };
}