import { calculateLoan } from '../core/loanEngine.js';

/**
 * EMI Calculator Engine.
 * Delegates calculation to the universal loan engine.
 *
 * @param {Object} inputs
 * @param {number} inputs.amount - Loan principal amount (₹)
 * @param {number} inputs.rate - Annual interest rate (%)
 * @param {number} inputs.tenure - Tenure value
 * @param {string} inputs.tenureType - 'years' | 'months'
 * @returns {Object} EMI Calculation Results
 */
export function calculateEmi({ amount = 1000000, rate = 8.5, tenure = 20, tenureType = 'years' } = {}) {
  return calculateLoan({
    amount,
    rate,
    tenure,
    tenureType,
  });
}
