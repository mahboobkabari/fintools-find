import { calculateLoan } from '../core/loanEngine.js';

/**
 * Loan Amortization Calculator Math Engine
 * @param {Object} inputs
 * @param {number} inputs.amount - Principal loan balance
 * @param {number} inputs.rate - Interest rate (p.a.)
 * @param {number} inputs.tenure - Loan tenure
 * @param {string} [inputs.tenureType='years'] - 'years' or 'months'
 */
export function calculateLoanAmortization(inputs = {}) {
  const { amount = 1000000, rate = 8.5, tenure = 15, tenureType = 'years' } = inputs;

  const loanResult = calculateLoan({
    amount: Number(amount) || 0,
    rate: Number(rate) || 0,
    tenure: Number(tenure) || 1,
    tenureType,
  });

  return {
    emi: loanResult.emi,
    principal: loanResult.principal,
    totalInterest: loanResult.totalInterest,
    totalPayment: loanResult.totalPayment,
    schedule: loanResult.schedule,
  };
}