/**
 * Emergency Fund Calculator Financial Engine
 * 
 * Pure mathematical engine calculating essential monthly expenses, risk-adjusted target months,
 * total emergency fund reserve target, current savings offset, funding gap, and estimated months to target.
 * 
 * Framework-decoupled, zero DOM dependency.
 */

/**
 * Sanitizes numeric input to a non-negative number.
 */
function sanitize(val, defaultVal = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? Math.max(0, num) : defaultVal;
}

/**
 * Calculates Total Essential Monthly Expenses.
 */
export function calculateEssentialMonthlyExpenses({
  housingRentMortgage = 0,
  utilities = 0,
  groceriesFood = 0,
  insurancePremiums = 0,
  transportation = 0,
  minimumDebtPayments = 0,
  healthcare = 0,
  childcareDependentCare = 0,
  otherEssentials = 0,
} = {}) {
  const h = sanitize(housingRentMortgage);
  const u = sanitize(utilities);
  const f = sanitize(groceriesFood);
  const i = sanitize(insurancePremiums);
  const t = sanitize(transportation);
  const d = sanitize(minimumDebtPayments);
  const c = sanitize(healthcare);
  const dp = sanitize(childcareDependentCare);
  const o = sanitize(otherEssentials);

  return Math.round(h + u + f + i + t + d + c + dp + o);
}

/**
 * Calculates Emergency Fund Target amount based on monthly expenses and selected target months.
 */
export function calculateEmergencyFundTarget(essentialMonthlyExpenses, targetMonths) {
  const expenses = sanitize(essentialMonthlyExpenses);
  const months = Math.min(40, sanitize(targetMonths));
  return Math.round(expenses * months);
}

/**
 * Calculates Emergency Fund Deficit / Funding Gap (cannot be negative).
 */
export function calculateFundingGap(targetAmount, currentEmergencySavings) {
  const target = sanitize(targetAmount);
  const current = sanitize(currentEmergencySavings);
  return Math.max(0, Math.round(target - current));
}

/**
 * Calculates Estimated Months to reach Emergency Fund Target.
 */
export function calculateMonthsToTarget(fundingGap, monthlyContribution) {
  const gap = sanitize(fundingGap);
  const contribution = sanitize(monthlyContribution);

  if (gap <= 0) return 0;
  if (contribution <= 0) return null; // Unbounded timeline when contribution is 0

  return Math.ceil(gap / contribution);
}

/**
 * Calculates illustrative target months based on employment stability and dependents.
 */
export function calculateScenarioTarget(incomeStability = 'stable', dependentsCount = 0) {
  let baseMonths = 3;

  if (incomeStability === 'variable') {
    baseMonths = 6;
  } else if (incomeStability === 'freelance') {
    baseMonths = 9;
  }

  const dep = sanitize(dependentsCount);
  if (dep >= 3) {
    baseMonths += 3;
  } else if (dep >= 1) {
    baseMonths += 1;
  }

  return Math.min(24, baseMonths);
}

/**
 * Main Emergency Fund Calculator Engine.
 * 
 * @param {Object} inputs
 * @param {number} [inputs.housingRentMortgage=0] - Monthly housing rent or mortgage EMI (₹)
 * @param {number} [inputs.utilities=0] - Monthly electricity, water, gas, internet (₹)
 * @param {number} [inputs.groceriesFood=0] - Monthly food and groceries (₹)
 * @param {number} [inputs.insurancePremiums=0] - Monthly health/life insurance pro-rated (₹)
 * @param {number} [inputs.transportation=0] - Monthly essential fuel/transit (₹)
 * @param {number} [inputs.minimumDebtPayments=0] - Monthly minimum debt EMIs (₹)
 * @param {number} [inputs.healthcare=0] - Monthly medical & prescription costs (₹)
 * @param {number} [inputs.childcareDependentCare=0] - Monthly childcare or elder care (₹)
 * @param {number} [inputs.otherEssentials=0] - Other essential recurring monthly expenses (₹)
 * @param {number} [inputs.targetMonths=6] - Desired emergency reserve period (Months)
 * @param {string} [inputs.incomeStability='stable'] - 'stable', 'variable', or 'freelance'
 * @param {number} [inputs.dependentsCount=0] - Number of financial dependents (0 to 10)
 * @param {number} [inputs.currentEmergencySavings=0] - Active liquid savings & bank deposits (₹)
 * @param {number} [inputs.monthlyContribution=0] - Planned monthly emergency savings contribution (₹)
 * @returns {Object} Structured Emergency Fund Results
 */
export function calculateEmergencyFund({
  housingRentMortgage = 0,
  utilities = 0,
  groceriesFood = 0,
  insurancePremiums = 0,
  transportation = 0,
  minimumDebtPayments = 0,
  healthcare = 0,
  childcareDependentCare = 0,
  otherEssentials = 0,
  targetMonths = 6,
  incomeStability = 'stable',
  dependentsCount = 0,
  currentEmergencySavings = 0,
  monthlyContribution = 0,
} = {}) {
  // 1. Calculate Essential Monthly Expenses
  const essentialMonthlyExpenses = calculateEssentialMonthlyExpenses({
    housingRentMortgage,
    utilities,
    groceriesFood,
    insurancePremiums,
    transportation,
    minimumDebtPayments,
    healthcare,
    childcareDependentCare,
    otherEssentials,
  });

  const sanitizedMonths = Math.max(1, Math.min(36, sanitize(targetMonths, 6)));
  const sanitizedCurrentSavings = sanitize(currentEmergencySavings);
  const sanitizedMonthlyContribution = sanitize(monthlyContribution);

  // 2. Compute Target & Funding Gap
  const targetAmount = calculateEmergencyFundTarget(essentialMonthlyExpenses, sanitizedMonths);
  const fundingGap = calculateFundingGap(targetAmount, sanitizedCurrentSavings);
  const isFullyFunded = fundingGap <= 0;
  const surplusAmount = Math.max(0, sanitizedCurrentSavings - targetAmount);

  // 3. Compute Timeline
  const monthsToTarget = calculateMonthsToTarget(fundingGap, sanitizedMonthlyContribution);

  // 4. Savings Progress Percentage
  const progressPercent = targetAmount > 0
    ? Number(Math.min(100, (sanitizedCurrentSavings / targetAmount) * 100).toFixed(1))
    : 100;

  // 5. Illustrative Scenario Benchmark
  const illustrativeScenarioMonths = calculateScenarioTarget(incomeStability, dependentsCount);

  return {
    isValid: essentialMonthlyExpenses > 0 || sanitizedCurrentSavings > 0,
    essentialMonthlyExpenses,
    targetMonths: sanitizedMonths,
    targetAmount,
    currentEmergencySavings: sanitizedCurrentSavings,
    fundingGap,
    surplusAmount,
    isFullyFunded,
    progressPercent,
    monthlyContribution: sanitizedMonthlyContribution,
    monthsToTarget,
    illustrativeScenarioMonths,
    breakdown: {
      housing: sanitize(housingRentMortgage),
      utilities: sanitize(utilities),
      groceries: sanitize(groceriesFood),
      insurance: sanitize(insurancePremiums),
      transportation: sanitize(transportation),
      debtPayments: sanitize(minimumDebtPayments),
      healthcare: sanitize(healthcare),
      childcare: sanitize(childcareDependentCare),
      other: sanitize(otherEssentials),
    },
  };
}
