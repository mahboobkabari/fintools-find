import { calculateLoan } from '../core/loanEngine.js';

/**
 * Car Loan Calculator Math Engine
 * @param {Object} inputs
 * @param {number} inputs.vehiclePrice - Total on-road vehicle price
 * @param {number} inputs.downPaymentPct - Down payment percentage (e.g. 15%)
 * @param {number} inputs.rate - Annual interest rate (p.a.)
 * @param {number} inputs.tenure - Tenure in years or months
 * @param {string} [inputs.tenureType='years'] - 'years' or 'months'
 * @param {number} [inputs.processingFeePct=1] - Processing fee percentage
 */
export function calculateCarLoan(inputs = {}) {
  const {
    vehiclePrice = 1000000,
    downPaymentPct = 15,
    rate = 9.0,
    tenure = 5,
    tenureType = 'years',
    processingFeePct = 1,
  } = inputs;

  const price = Math.max(0, Number(vehiclePrice) || 0);
  const dpPct = Math.min(90, Math.max(0, Number(downPaymentPct) || 0));
  const downPaymentAmount = Math.round((price * dpPct) / 100);
  const loanAmount = Math.max(0, price - downPaymentAmount);

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