import { calculateLoan } from '../core/loanEngine.js';

/**
 * Education Loan Calculator Math Engine
 * Supports Moratorium Period (Study Duration + Grace Period) simple interest accrual.
 *
 * @param {Object} inputs
 * @param {number} inputs.amount - Borrowed education loan principal
 * @param {number} inputs.rate - Annual interest rate (p.a.)
 * @param {number} inputs.tenure - Repayment tenure after moratorium
 * @param {string} [inputs.tenureType='years'] - 'years' or 'months'
 * @param {number} [inputs.moratoriumYears=4] - Course duration + grace period (years)
 */
export function calculateEducationLoan(inputs = {}) {
  const {
    amount = 1000000,
    rate = 9.5,
    tenure = 10,
    tenureType = 'years',
    moratoriumYears = 4,
  } = inputs;

  const loanAmount = Math.max(0, Number(amount) || 0);
  const annualRate = Math.max(0, Number(rate) || 0);
  const morYears = Math.max(0, Number(moratoriumYears) || 0);

  // Simple interest accrued during moratorium period (course years)
  const moratoriumInterest = Math.round(loanAmount * (annualRate / 100) * morYears);

  // Principal at start of repayment phase (borrowed principal + accrued moratorium interest)
  const totalPrincipalAtRepayment = loanAmount + moratoriumInterest;

  const loanResult = calculateLoan({
    amount: totalPrincipalAtRepayment,
    rate: annualRate,
    tenure: Number(tenure) || 1,
    tenureType,
  });

  return {
    emi: loanResult.emi,
    loanAmount,
    moratoriumInterest,
    totalPrincipalAtRepayment,
    repaymentInterest: loanResult.totalInterest,
    totalInterest: moratoriumInterest + loanResult.totalInterest,
    totalPayment: loanAmount + moratoriumInterest + loanResult.totalInterest,
    schedule: loanResult.schedule,
  };
}