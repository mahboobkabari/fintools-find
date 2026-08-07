/**
  Core Financial Math Primitives (TVM - Time Value of Money)
  Framework-free, pure functional math engine for Fintools Find.
 */

/**
 * Calculates equal periodic payment (EMI / PMT) for a loan.
 * @param {number} ratePerPeriod - Interest rate per period (e.g. annual rate / 12 / 100)
 * @param {number} numberOfPeriods - Total payment periods (e.g. tenure in months)
 * @param {number} presentValue - Loan principal amount
 * @returns {number} Periodic payment amount
 */
export function pmt(ratePerPeriod, numberOfPeriods, presentValue) {
  if (presentValue <= 0 || numberOfPeriods <= 0) return 0;
  if (ratePerPeriod === 0) return presentValue / numberOfPeriods;

  const rateFactor = Math.pow(1 + ratePerPeriod, numberOfPeriods);
  return (presentValue * ratePerPeriod * rateFactor) / (rateFactor - 1);
}

/**
 * Calculates Future Value (FV) of periodic investments (SIP / Annuity).
 * @param {number} ratePerPeriod - Rate per compounding period
 * @param {number} numberOfPeriods - Total periods
 * @param {number} periodicPayment - Monthly/periodic deposit
 * @param {boolean} payAtBeginning - True for SIP (due at start of period)
 * @returns {number} Future Value
 */
export function fv(ratePerPeriod, numberOfPeriods, periodicPayment, payAtBeginning = true) {
  if (periodicPayment <= 0 || numberOfPeriods <= 0) return 0;
  if (ratePerPeriod === 0) return periodicPayment * numberOfPeriods;

  const growthFactor = (Math.pow(1 + ratePerPeriod, numberOfPeriods) - 1) / ratePerPeriod;
  const timingMultiplier = payAtBeginning ? (1 + ratePerPeriod) : 1;
  return periodicPayment * growthFactor * timingMultiplier;
}

/**
 * Calculates Compound Annual Growth Rate (CAGR).
 * @param {number} beginningValue - Initial investment amount
 * @param {number} endingValue - Final investment value
 * @param {number} numberOfYears - Tenure in years
 * @returns {number} CAGR percentage (0.125 = 12.5%)
 */
export function cagr(beginningValue, endingValue, numberOfYears) {
  if (beginningValue <= 0 || endingValue <= 0 || numberOfYears <= 0) return 0;
  return Math.pow(endingValue / beginningValue, 1 / numberOfYears) - 1;
}

/**
 * Generates month-by-month loan amortization schedule.
 * @param {number} principal - Total loan principal
 * @param {number} annualRate - Annual interest rate (e.g. 8.5 for 8.5%)
 * @param {number} tenureMonths - Total tenure in months
 * @returns {Array<{month: number, payment: number, principalPaid: number, interestPaid: number, remainingBalance: number}>}
 */
export function generateAmortizationSchedule(principal, annualRate, tenureMonths) {
  if (principal <= 0 || tenureMonths <= 0) return [];

  const monthlyRate = (annualRate / 12) / 100;
  const monthlyPayment = pmt(monthlyRate, tenureMonths, principal);

  let balance = principal;
  const schedule = [];

  for (let month = 1; month <= tenureMonths; month++) {
    const interestPaid = balance * monthlyRate;
    const principalPaid = Math.min(balance, monthlyPayment - interestPaid);
    balance = Math.max(0, balance - principalPaid);

    schedule.push({
      month,
      payment: Math.round(monthlyPayment),
      principalPaid: Math.round(principalPaid),
      interestPaid: Math.round(interestPaid),
      remainingBalance: Math.round(balance),
    });

    if (balance <= 0) break;
  }

  return schedule;
}
