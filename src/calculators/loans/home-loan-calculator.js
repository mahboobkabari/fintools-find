import { calculateLoan } from '../core/loanEngine.js';

/**
 * Home Loan Calculator Math Engine
 * @param {Object} inputs
 * @param {number} inputs.propertyValue - Total home property purchase price
 * @param {number} inputs.downPaymentPct - Down payment percentage (e.g. 20%)
 * @param {number} inputs.rate - Annual interest rate (p.a.)
 * @param {number} inputs.tenure - Tenure duration in years or months
 * @param {string} [inputs.tenureType='years'] - 'years' or 'months'
 * @param {number} [inputs.processingFeePct=0.5] - One-time processing fee percentage
 */
export function calculateHomeLoan(inputs = {}) {
  const {
    propertyValue = 5000000,
    downPaymentPct = 20,
    rate = 8.5,
    tenure = 20,
    tenureType = 'years',
    processingFeePct = 0.5,
  } = inputs;

  const propertyCost = Number(propertyValue) || 0;
  const dpPct = Math.min(90, Math.max(0, Number(downPaymentPct) || 0));
  const downPaymentAmount = Math.round((propertyCost * dpPct) / 100);
  const loanAmount = Math.max(0, propertyCost - downPaymentAmount);

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
    downPaymentAmount,
    totalInterest: loanResult.totalInterest,
    processingFee,
    totalPayment: loanResult.totalPayment + processingFee,
    schedule: loanResult.schedule,
  };
}