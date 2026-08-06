import { pmt } from './financialMath.js';

/**
 * @typedef {Object} LoanEngineOptions
 * @property {number} [amount=1000000] - Total asset/loan amount
 * @property {number} [downPayment=0] - Initial down payment or trade-in value
 * @property {number} [rate=8.5] - Annual interest rate (%)
 * @property {number} [tenure=20] - Loan tenure
 * @property {'years'|'months'} [tenureType='years'] - Tenure unit
 * @property {number} [prepaymentMonthly=0] - Extra monthly principal prepayment
 * @property {number} [moratoriumMonths=0] - Interest-only study period
 * @property {number} [monthlyAddons=0] - Add-on monthly costs (PMI, property tax, fees)
 */

/**
 * @typedef {Object} AmortizationRow
 * @property {number} month - Month index (1-based)
 * @property {number} payment - Total payment made in month
 * @property {number} principalPaid - Principal component paid
 * @property {number} interestPaid - Interest component paid
 * @property {number} remainingBalance - Outstanding balance after payment
 */

/**
 * @typedef {Object} LoanCalculationResult
 * @property {number} emi - Standard monthly EMI amount
 * @property {number} emiWithAddons - Monthly payment including add-on fees
 * @property {number} principal - Net loan principal after down payment
 * @property {number} assetValue - Total asset/property value
 * @property {number} downPayment - Down payment amount
 * @property {number} totalInterest - Total cumulative interest paid
 * @property {number} totalPayment - Total cumulative payment
 * @property {number} tenureMonths - Total tenure in months
 * @property {number} actualPayoffMonths - Actual payoff tenure after prepayments
 * @property {AmortizationRow[]} schedule - Month-by-month amortization schedule
 */

/**
 * Universal Loan Calculation Engine.
 * Serves as the single calculation core for all 20+ loan tools.
 *
 * @param {LoanEngineOptions} [options]
 * @returns {LoanCalculationResult}
 */
export function calculateLoan({
  amount = 1000000,
  downPayment = 0,
  rate = 8.5,
  tenure = 20,
  tenureType = 'years',
  prepaymentMonthly = 0,
  moratoriumMonths = 0,
  monthlyAddons = 0,
} = {}) {
  const assetValue = Math.max(0, Number(amount) || 0);
  const downPaymentVal = Math.max(0, Number(downPayment) || 0);
  const principal = Math.max(0, assetValue - downPaymentVal);

  const annualRate = Math.max(0, Number(rate) || 0);
  const tenureNum = Math.max(1, Number(tenure) || 1);
  const tenureMonths = tenureType === 'years' ? tenureNum * 12 : tenureNum;

  const monthlyRate = (annualRate / 12) / 100;
  const extraPrepayment = Math.max(0, Number(prepaymentMonthly) || 0);
  const addons = Math.max(0, Number(monthlyAddons) || 0);
  const moratorium = Math.max(0, Number(moratoriumMonths) || 0);

  // 1. Calculate Base EMI
  const baseEmi = Math.round(pmt(monthlyRate, tenureMonths, principal));
  const emiWithAddons = baseEmi + addons;

  // 2. Generate Amortization Schedule
  let balance = principal;
  const schedule = [];
  let accumulatedInterest = 0;
  let accumulatedPayment = 0;

  // Moratorium Phase
  for (let m = 1; m <= moratorium; m++) {
    const interestPaid = Math.round(balance * monthlyRate);
    accumulatedInterest += interestPaid;
    accumulatedPayment += interestPaid;
    schedule.push({
      month: m,
      payment: interestPaid,
      principalPaid: 0,
      interestPaid,
      remainingBalance: Math.round(balance),
    });
  }

  // Active Amortization Repayment Phase
  for (let m = 1; m <= tenureMonths; m++) {
    if (balance <= 0) break;

    const monthIndex = moratorium + m;
    const interestPaid = Math.round(balance * monthlyRate);
    const standardPrincipal = Math.max(0, baseEmi - interestPaid);
    const totalPrincipalPaid = Math.min(balance, standardPrincipal + extraPrepayment);
    const totalMonthPayment = totalPrincipalPaid + interestPaid + addons;

    balance = Math.max(0, balance - totalPrincipalPaid);
    accumulatedInterest += interestPaid;
    accumulatedPayment += totalMonthPayment;

    schedule.push({
      month: monthIndex,
      payment: Math.round(totalMonthPayment),
      principalPaid: Math.round(totalPrincipalPaid),
      interestPaid: Math.round(interestPaid),
      remainingBalance: Math.round(balance),
    });

    if (balance <= 0) break;
  }

  // Standard annuity total interest vs accelerated total interest
  const hasCustomSchedule = extraPrepayment > 0 || moratorium > 0 || addons > 0;
  const totalPayment = hasCustomSchedule ? Math.round(accumulatedPayment) : (baseEmi * tenureMonths);
  const totalInterest = hasCustomSchedule ? Math.round(accumulatedInterest) : Math.max(0, totalPayment - principal);

  return {
    emi: baseEmi,
    emiWithAddons,
    principal,
    assetValue,
    downPayment: downPaymentVal,
    totalInterest,
    totalPayment,
    tenureMonths,
    actualPayoffMonths: schedule.length,
    schedule,
  };
}
