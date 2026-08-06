import { calculateLoan } from '../core/loanEngine.js';

/**
 * Personal Loan Calculator Math Engine
 * @param {Object} inputs
 * @param {number} inputs.amount - Borrowed personal loan amount
 * @param {number} inputs.rate - Annual interest rate (p.a.)
 * @param {number} inputs.tenure - Tenure duration
 * @param {string} [inputs.tenureType='years'] - 'years' or 'months'
 * @param {number} [inputs.processingFeePct=1] - Processing fee percentage
 */
export function calculatePersonalLoan(inputs = {}) {
  const {
    amount = 500000,
    rate = 11.5,
    tenure = 3,
    tenureType = 'years',
    processingFeePct = 1,
  } = inputs;

  const loanAmount = Math.max(0, Number(amount) || 0);
  const feePct = Math.max(0, Number(processingFeePct) || 0);
  const processingFee = Math.round((loanAmount * feePct) / 100);

  const loanResult = calculateLoan({
    amount: loanAmount,
    rate: Number(rate) || 0,
    tenure: Number(tenure) || 1,
    tenureType,
  });

  return {
    emi: loanResult.emi,
    loanAmount,
    totalInterest: loanResult.totalInterest,
    processingFee,
    totalPayment: loanResult.totalPayment + processingFee,
    schedule: loanResult.schedule,
  };
}