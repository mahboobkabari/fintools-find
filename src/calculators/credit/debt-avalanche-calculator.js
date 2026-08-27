/**
 * Pure JavaScript Financial Engine for Debt Avalanche Calculator
 * Highest Interest Rate (APR %) First Strategy Simulation, Debt Snowball Comparison,
 * Minimum Payments Baseline, and Month-by-Month Elimination Schedules.
 *
 * All financial logic is completely decoupled from UI and framework code.
 */

import {
  sanitizeDebts,
  getPriorityOrder,
  simulatePayoffStrategy,
  calculateDebtPayoff,
} from './debt-snowball-calculator.js';

export { sanitizeDebts, getPriorityOrder, simulatePayoffStrategy };

/**
 * Calculates Debt Avalanche payoff schedule (highest APR % first).
 *
 * @param {Array} debts - Array of debt objects
 * @param {number} [extraMonthlyPayment=0] - Additional monthly payment
 * @returns {Object} Strategy payoff result
 */
export function calculateDebtAvalancheSchedule(debts = [], extraMonthlyPayment = 0) {
  return simulatePayoffStrategy(debts, extraMonthlyPayment, 'avalanche');
}

/**
 * Calculates Debt Snowball payoff schedule (lowest balance first).
 *
 * @param {Array} debts - Array of debt objects
 * @param {number} [extraMonthlyPayment=0] - Additional monthly payment
 * @returns {Object} Strategy payoff result
 */
export function calculateDebtSnowballSchedule(debts = [], extraMonthlyPayment = 0) {
  return simulatePayoffStrategy(debts, extraMonthlyPayment, 'snowball');
}

/**
 * Calculates baseline minimum payment schedule without extra monthly payment.
 *
 * @param {Array} debts - Array of debt objects
 * @returns {Object} Baseline payoff result
 */
export function calculateBaselineMinimumSchedule(debts = []) {
  return simulatePayoffStrategy(debts, 0, 'minimum_only');
}

/**
 * Compares Debt Avalanche, Debt Snowball, and Minimum Payments Only strategies.
 *
 * @param {Array} debts - Array of debt objects
 * @param {number} [extraMonthlyPayment=0] - Additional monthly payment
 * @returns {Object} Strategy comparison matrix
 */
export function comparePayoffStrategies(debts = [], extraMonthlyPayment = 0) {
  return calculateDebtPayoff(debts, extraMonthlyPayment);
}

/**
 * Master Debt Avalanche Details Calculation Function.
 *
 * @param {Object} inputs
 * @param {Array} [inputs.debts] - Array of debt items
 * @param {number} [inputs.extraMonthlyPayment=0] - Extra monthly payment budget (₹)
 * @returns {Object} Structured Debt Avalanche results for widget rendering
 */
export function calculateDebtAvalancheDetails(inputs = {}) {
  const rawDebts = Array.isArray(inputs.debts) ? inputs.debts : [];
  const extraMonthlyPayment = Math.max(0, Number(inputs.extraMonthlyPayment) || 0);

  const cleanDebts = sanitizeDebts(rawDebts);
  const isValid = cleanDebts.length > 0;

  if (!isValid) {
    return {
      isValid: false,
      validationMessage: 'Please add at least one valid debt with a non-zero balance and minimum payment.',
      debtsCount: 0,
      totalInitialDebt: 0,
      totalMinimumMonthlyPayment: 0,
      extraMonthlyPayment,
      totalMonthlyPaymentBudget: extraMonthlyPayment,
      avalanche: simulatePayoffStrategy([], 0, 'avalanche'),
      snowball: simulatePayoffStrategy([], 0, 'snowball'),
      minimumOnly: simulatePayoffStrategy([], 0, 'minimum_only'),
      comparison: {
        snowballVsAvalancheInterestDiff: 0,
        snowballVsAvalancheMonthsDiff: 0,
        fastestStrategy: 'equal',
        cheapestStrategy: 'equal',
        avalancheInterestSaved: 0,
        avalancheMonthsSaved: 0,
        snowballInterestSaved: 0,
        snowballMonthsSaved: 0,
      },
    };
  }

  const payoffData = calculateDebtPayoff(cleanDebts, extraMonthlyPayment);

  // Additional formatted strings and helper flags
  const avalancheRes = payoffData.avalanche;
  const minimumRes = payoffData.minimumOnly;
  const snowballRes = payoffData.snowball;

  const totalDebt = payoffData.totalInitialDebt;
  const totalMinPay = payoffData.totalMinimumMonthlyPayment;
  const totalBudget = payoffData.totalMonthlyPaymentBudget;

  const avalancheYears = avalancheRes.estimatedDebtFreeYears;
  const avalancheMonths = avalancheRes.totalMonths;
  const avalancheInterest = avalancheRes.totalInterestPaid;

  const baselineInterest = minimumRes.totalInterestPaid;
  const interestSaved = Math.max(0, baselineInterest - avalancheInterest);
  const monthsSaved = Math.max(0, minimumRes.totalMonths - avalancheMonths);

  return {
    isValid: true,
    validationMessage: '',
    debtsCount: payoffData.debtsCount,
    debts: cleanDebts,
    totalInitialDebt: totalDebt,
    totalMinimumMonthlyPayment: totalMinPay,
    extraMonthlyPayment,
    totalMonthlyPaymentBudget: totalBudget,
    avalanche: avalancheRes,
    snowball: snowballRes,
    minimumOnly: minimumRes,
    comparison: payoffData.comparison,
    avalancheYears,
    avalancheMonths,
    avalancheInterest,
    baselineInterest,
    interestSaved,
    monthsSaved,
    isImpossible: avalancheRes.isImpossible || minimumRes.isImpossible,
  };
}
