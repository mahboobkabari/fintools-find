/**
 * Term Life Insurance Needs Financial Engine (HLV & DIME Needs Analysis)
 * 
 * Pure mathematical engine calculating financial obligations, income replacement present value,
 * future milestone goals, existing resource offsets, and estimated additional term cover.
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
 * Calculates Total Debt Obligations (Mortgage + Personal Loans + Car Loans + Credit Cards + Final Expenses).
 */
export function calculateDebtNeeds({
  mortgageBalance = 0,
  otherDebts = 0,
  finalExpenses = 0,
} = {}) {
  const m = sanitize(mortgageBalance);
  const d = sanitize(otherDebts);
  const f = sanitize(finalExpenses);
  return Math.round(m + d + f);
}

/**
 * Calculates Income Replacement Present Value Need.
 * 
 * PV = Annual Income * Replacement Period * Inflation Adjustment Factor
 */
export function calculateIncomeReplacementNeed({
  annualIncome = 0,
  replacementPeriodYears = 0,
  annualIncomeGrowthRate = 0.05,
  discountRate = 0.06,
} = {}) {
  const income = sanitize(annualIncome);
  const years = Math.min(40, sanitize(replacementPeriodYears));
  const g = Math.max(-0.1, Math.min(0.2, Number(annualIncomeGrowthRate) || 0));
  const r = Math.max(0.01, Math.min(0.2, Number(discountRate) || 0.06));

  if (income <= 0 || years <= 0) return 0;

  let totalPV = 0;
  let currentYearIncome = income;

  for (let y = 1; y <= years; y++) {
    const discountedYearIncome = currentYearIncome / Math.pow(1 + r, y);
    totalPV += discountedYearIncome;
    currentYearIncome *= (1 + g);
  }

  return Math.round(totalPV);
}

/**
 * Calculates Future Milestone Goals (Education, Marriage, Family Funds).
 */
export function calculateFutureGoalNeeds({
  educationGoals = 0,
  otherFutureGoals = 0,
} = {}) {
  const edu = sanitize(educationGoals);
  const oth = sanitize(otherFutureGoals);
  return Math.round(edu + oth);
}

/**
 * Calculates Total Existing Available Financial Resources (Life Insurance + Savings + Investments).
 */
export function calculateExistingResources({
  existingLifeInsurance = 0,
  savingsAndCash = 0,
  investments = 0,
  otherResources = 0,
} = {}) {
  const ins = sanitize(existingLifeInsurance);
  const sav = sanitize(savingsAndCash);
  const inv = sanitize(investments);
  const oth = sanitize(otherResources);
  return Math.round(ins + sav + inv + oth);
}

/**
 * Comprehensive Term Life Insurance Needs Analysis Engine.
 * 
 * @param {Object} inputs
 * @param {number} [inputs.age=30] - Age of primary earner (18–75)
 * @param {number} [inputs.annualIncome=0] - Current annual take-home income (₹)
 * @param {number} [inputs.replacementPeriodYears=10] - Desired income replacement period (Years)
 * @param {number} [inputs.mortgageBalance=0] - Outstanding home loan / mortgage balance (₹)
 * @param {number} [inputs.otherDebts=0] - Personal loans, car loans, credit card balances (₹)
 * @param {number} [inputs.finalExpenses=200000] - Estimated final/administrative expenses (₹)
 * @param {number} [inputs.educationGoals=0] - Future children higher education fund (₹)
 * @param {number} [inputs.otherFutureGoals=0] - Family marriage/milestone reserves (₹)
 * @param {number} [inputs.existingLifeInsurance=0] - Active term life insurance policy cover (₹)
 * @param {number} [inputs.savingsAndCash=0] - Bank savings, FDs, liquid emergency cash (₹)
 * @param {number} [inputs.investments=0] - Stocks, mutual funds, EPF/PPF balances (₹)
 * @param {number} [inputs.otherResources=0] - Real estate equity or other liquidable assets (₹)
 * @param {number} [inputs.annualIncomeGrowthRate=0.05] - Assumed annual income growth rate (0.05 = 5%)
 * @param {number} [inputs.discountRate=0.06] - Assumed conservative return/discount rate (0.06 = 6%)
 * @returns {Object} Structured Insurance Needs Analysis Results
 */
export function calculateLifeInsuranceNeeds({
  age = 30,
  annualIncome = 0,
  replacementPeriodYears = 10,
  mortgageBalance = 0,
  otherDebts = 0,
  finalExpenses = 200000,
  educationGoals = 0,
  otherFutureGoals = 0,
  existingLifeInsurance = 0,
  savingsAndCash = 0,
  investments = 0,
  otherResources = 0,
  annualIncomeGrowthRate = 0.05,
  discountRate = 0.06,
} = {}) {
  const sanitizedAge = Math.max(18, Math.min(75, sanitize(age, 30)));
  const sanitizedIncome = sanitize(annualIncome);
  const sanitizedYears = Math.min(40, sanitize(replacementPeriodYears, 10));

  // 1. Calculate Component Needs
  const debtNeeds = calculateDebtNeeds({ mortgageBalance, otherDebts, finalExpenses });
  const incomeReplacementNeed = calculateIncomeReplacementNeed({
    annualIncome: sanitizedIncome,
    replacementPeriodYears: sanitizedYears,
    annualIncomeGrowthRate,
    discountRate,
  });
  const futureGoalNeeds = calculateFutureGoalNeeds({ educationGoals, otherFutureGoals });

  // 2. Total Gross Need
  const totalGrossNeed = Math.round(debtNeeds + incomeReplacementNeed + futureGoalNeeds);

  // 3. Existing Resources
  const totalExistingResources = calculateExistingResources({
    existingLifeInsurance,
    savingsAndCash,
    investments,
    otherResources,
  });

  // 4. Net Estimated Additional Coverage (Cannot be negative)
  const grossCoverageGap = totalGrossNeed - totalExistingResources;
  const estimatedAdditionalCoverage = Math.max(0, grossCoverageGap);
  const isFullyCovered = grossCoverageGap <= 0;

  // 5. Percent Offsets & Breakdown Ratios
  const resourceOffsetPercent = totalGrossNeed > 0
    ? Number(Math.min(100, Math.max(0, (totalExistingResources / totalGrossNeed) * 100)).toFixed(1))
    : 100;

  const debtRatioPercent = totalGrossNeed > 0
    ? Number(((debtNeeds / totalGrossNeed) * 100).toFixed(1))
    : 0;

  const incomeRatioPercent = totalGrossNeed > 0
    ? Number(((incomeReplacementNeed / totalGrossNeed) * 100).toFixed(1))
    : 0;

  const goalRatioPercent = totalGrossNeed > 0
    ? Number(((futureGoalNeeds / totalGrossNeed) * 100).toFixed(1))
    : 0;

  return {
    age: sanitizedAge,
    annualIncome: sanitizedIncome,
    replacementPeriodYears: sanitizedYears,
    debtNeeds,
    incomeReplacementNeed,
    futureGoalNeeds,
    totalGrossNeed,
    totalExistingResources,
    estimatedAdditionalCoverage,
    isFullyCovered,
    grossCoverageGap,
    resourceOffsetPercent,
    debtRatioPercent,
    incomeRatioPercent,
    goalRatioPercent,
    breakdown: {
      mortgage: sanitize(mortgageBalance),
      otherDebts: sanitize(otherDebts),
      finalExpenses: sanitize(finalExpenses),
      education: sanitize(educationGoals),
      otherGoals: sanitize(otherFutureGoals),
      existingInsurance: sanitize(existingLifeInsurance),
      savings: sanitize(savingsAndCash),
      investments: sanitize(investments),
      otherResources: sanitize(otherResources),
    },
    assumptions: {
      incomeGrowthRatePct: Number((annualIncomeGrowthRate * 100).toFixed(1)),
      discountRatePct: Number((discountRate * 100).toFixed(1)),
    },
  };
}
