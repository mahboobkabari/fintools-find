import { calculateLoan } from '../core/loanEngine.js';

/**
 * Loan Prepayment Calculator Math Engine
 * Compares baseline loan vs loan with lump-sum prepayment.
 *
 * @param {Object} inputs
 * @param {number} inputs.amount - Original principal balance
 * @param {number} inputs.rate - Interest rate (p.a.)
 * @param {number} inputs.tenure - Original tenure
 * @param {string} [inputs.tenureType='years'] - 'years' or 'months'
 * @param {number} [inputs.prepaymentAmount=100000] - One-time lump-sum prepayment amount
 * @param {number} [inputs.prepaymentMonth=12] - Month index at which prepayment is made
 */
export function calculateLoanPrepayment(inputs = {}) {
  const {
    amount = 2000000,
    rate = 8.5,
    tenure = 20,
    tenureType = 'years',
    prepaymentAmount = 200000,
    prepaymentMonth = 12,
  } = inputs;

  const originalLoan = calculateLoan({
    amount: Number(amount) || 0,
    rate: Number(rate) || 0,
    tenure: Number(tenure) || 1,
    tenureType,
  });

  const lumpSum = Math.max(0, Number(prepaymentAmount) || 0);
  const prepayMonth = Math.max(1, Number(prepaymentMonth) || 1);

  if (lumpSum <= 0 || !originalLoan.schedule || originalLoan.schedule.length === 0) {
    return {
      emi: originalLoan.emi,
      originalInterest: originalLoan.totalInterest,
      newInterest: originalLoan.totalInterest,
      interestSaved: 0,
      originalTenureMonths: originalLoan.schedule.length * 12,
      newTenureMonths: originalLoan.schedule.length * 12,
      monthsSaved: 0,
      totalPayment: originalLoan.totalPayment,
    };
  }

  // Calculate trajectory with prepayment
  const monthlyRate = (Number(rate) || 0) / 12 / 100;
  let remainingBalance = Number(amount) || 0;
  let newTotalInterest = 0;
  let newMonthCount = 0;

  const maxMonths = tenureType === 'months' ? Number(tenure) : Number(tenure) * 12;

  for (let m = 1; m <= maxMonths; m++) {
    if (remainingBalance <= 0) break;

    const interestForMonth = remainingBalance * monthlyRate;
    let principalForMonth = originalLoan.emi - interestForMonth;

    if (m === prepayMonth) {
      principalForMonth += lumpSum;
    }

    if (principalForMonth >= remainingBalance) {
      principalForMonth = remainingBalance;
      newTotalInterest += interestForMonth;
      remainingBalance = 0;
      newMonthCount = m;
      break;
    }

    newTotalInterest += interestForMonth;
    remainingBalance -= principalForMonth;
    newMonthCount = m;
  }

  const interestSaved = Math.max(0, originalLoan.totalInterest - Math.round(newTotalInterest));
  const monthsSaved = Math.max(0, maxMonths - newMonthCount);

  return {
    emi: originalLoan.emi,
    originalInterest: originalLoan.totalInterest,
    newInterest: Math.round(newTotalInterest),
    interestSaved,
    originalTenureMonths: maxMonths,
    newTenureMonths: newMonthCount,
    monthsSaved,
    totalPayment: Number(amount) + Math.round(newTotalInterest) + lumpSum,
  };
}