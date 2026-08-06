import { calculateLumpsum } from '../core/investmentEngine.js';

/**
 * Lumpsum Calculator Math Engine
 * @param {Object} inputs
 * @param {number} inputs.initialInvestment - One-time lumpsum investment amount
 * @param {number} inputs.expectedReturnRate - Expected annual return rate (p.a.)
 * @param {number} inputs.tenureYears - Investment period in years
 */
export function calculateLumpsumTool(inputs = {}) {
  const { initialInvestment = 100000, expectedReturnRate = 12, tenureYears = 10 } = inputs;

  const result = calculateLumpsum({
    principal: Number(initialInvestment) || 0,
    expectedReturnRate: Number(expectedReturnRate) || 0,
    tenureYears: Number(tenureYears) || 1,
  });

  return {
    maturityValue: result.maturityValue,
    totalInvested: result.totalInvested,
    estReturns: result.estReturns,
    yearlyBreakdown: result.yearlyBreakdown,
  };
}