import { calculateSip } from '../core/investmentEngine.js';

/**
 * SIP Calculator Engine.
 * Delegates calculation to the universal investment engine.
 *
 * @param {Object} inputs
 * @param {number} [inputs.monthlyInvestment=5000] - Monthly SIP amount (₹)
 * @param {number} [inputs.expectedReturnRate=12] - Annual expected return rate (%)
 * @param {number} [inputs.tenureYears=10] - Investment duration in years
 * @returns {import('../core/investmentEngine.js').InvestmentResult}
 */
export function calculateSipTool({ monthlyInvestment = 5000, expectedReturnRate = 12, tenureYears = 10 } = {}) {
  return calculateSip({
    monthlyInvestment,
    expectedReturnRate,
    tenureYears,
  });
}
