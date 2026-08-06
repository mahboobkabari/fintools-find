import { calculateSip, calculateLumpsum } from '../core/investmentEngine.js';

/**
 * Mutual Fund Returns Calculator Math Engine
 * Supports both SIP and Lumpsum investment modes.
 *
 * @param {Object} inputs
 * @param {number} inputs.amount - Monthly SIP contribution OR lump-sum principal
 * @param {number} inputs.expectedReturnRate - Annual expected return rate (%)
 * @param {number} inputs.tenureYears - Holding duration in years
 * @param {string} [inputs.investmentType='sip'] - 'sip' or 'lumpsum'
 */
export function calculateMutualFundReturns(inputs = {}) {
  const {
    amount = 5000,
    expectedReturnRate = 12,
    tenureYears = 10,
    investmentType = 'sip',
  } = inputs;

  const returnRate = Number(expectedReturnRate) || 0;
  const years = Number(tenureYears) || 1;
  const capital = Number(amount) || 0;

  if (investmentType === 'lumpsum') {
    const result = calculateLumpsum({
      principal: capital,
      expectedReturnRate: returnRate,
      tenureYears: years,
    });
    return {
      investmentType: 'lumpsum',
      totalInvested: result.totalInvested,
      estReturns: result.estReturns,
      maturityValue: result.maturityValue,
      yearlyBreakdown: result.yearlyBreakdown,
    };
  }

  // Default to SIP mode
  const result = calculateSip({
    monthlyInvestment: capital,
    expectedReturnRate: returnRate,
    tenureYears: years,
  });

  return {
    investmentType: 'sip',
    totalInvested: result.totalInvested,
    estReturns: result.estReturns,
    maturityValue: result.maturityValue,
    yearlyBreakdown: result.yearlyBreakdown,
  };
}