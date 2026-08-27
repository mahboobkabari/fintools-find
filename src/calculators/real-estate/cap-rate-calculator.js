/**
 * Pure JavaScript Financial Engine for Cap Rate (Capitalization Rate) Calculator
 *
 * Real Estate Valuation, Net Operating Income (NOI), Target Cap Rate Valuation,
 * Operating Expense Ratio (OER), and Cap Rate Spread Calculations.
 *
 * All financial logic is completely decoupled from UI and framework code.
 */

/**
 * Sanitizes numeric input to a non-negative number.
 *
 * @param {any} val
 * @param {number} [defaultVal=0]
 * @returns {number}
 */
function sanitize(val, defaultVal = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? Math.max(0, num) : defaultVal;
}

/**
 * Calculates Gross Potential Income (GPI).
 *
 * @param {number} [monthlyRent=0] - Monthly gross rental income (₹)
 * @param {number} [otherIncomeAnnual=0] - Other annual income like parking/laundry (₹)
 * @returns {number} Gross Potential Income (₹)
 */
export function calculateGrossPotentialIncome(monthlyRent = 0, otherIncomeAnnual = 0) {
  const mRent = sanitize(monthlyRent);
  const other = sanitize(otherIncomeAnnual);
  return Math.round(mRent * 12 + other);
}

/**
 * Calculates Vacancy and Credit Loss.
 *
 * @param {number} [gpi=0] - Gross Potential Income (₹)
 * @param {number} [vacancyRatePct=0] - Vacancy rate percentage (0-100%)
 * @returns {number} Vacancy Loss (₹)
 */
export function calculateVacancyLoss(gpi = 0, vacancyRatePct = 0) {
  const income = sanitize(gpi);
  const rate = Math.min(100, Math.max(0, Number(vacancyRatePct) || 0)) / 100;
  return Math.round(income * rate);
}

/**
 * Calculates Effective Gross Income (EGI).
 *
 * @param {number} [gpi=0] - Gross Potential Income (₹)
 * @param {number} [vacancyLoss=0] - Vacancy Loss (₹)
 * @returns {number} Effective Gross Income (₹)
 */
export function calculateEffectiveGrossIncome(gpi = 0, vacancyLoss = 0) {
  const income = sanitize(gpi);
  const loss = sanitize(vacancyLoss);
  return Math.max(0, Math.round(income - loss));
}

/**
 * Calculates Total Operating Expenses (OpEx).
 * Strictly includes operating costs (Property Tax, Insurance, Maintenance, Management, Utilities, HOA).
 * EXCLUDES Mortgage Principal, Interest, Income Tax, Depreciation, and Capital Expenditures.
 *
 * @param {Object} expenses
 * @param {number} [expenses.propertyTax=0] - Annual Property Tax (₹)
 * @param {number} [expenses.insurance=0] - Annual Property Insurance (₹)
 * @param {number} [expenses.maintenance=0] - Annual Maintenance & Repairs (₹)
 * @param {number} [expenses.managementFees=0] - Annual Property Management Fees (₹)
 * @param {number} [expenses.utilities=0] - Annual Utilities (₹)
 * @param {number} [expenses.hoaCharges=0] - Annual HOA / Society Charges (₹)
 * @param {number} [expenses.otherOpEx=0] - Other Annual Operating Expenses (₹)
 * @returns {number} Total Annual Operating Expenses (₹)
 */
export function calculateOperatingExpenses({
  propertyTax = 0,
  insurance = 0,
  maintenance = 0,
  managementFees = 0,
  utilities = 0,
  hoaCharges = 0,
  otherOpEx = 0,
} = {}) {
  const tax = sanitize(propertyTax);
  const ins = sanitize(insurance);
  const maint = sanitize(maintenance);
  const mgmt = sanitize(managementFees);
  const util = sanitize(utilities);
  const hoa = sanitize(hoaCharges);
  const other = sanitize(otherOpEx);

  return Math.round(tax + ins + maint + mgmt + util + hoa + other);
}

/**
 * Calculates Net Operating Income (NOI).
 *
 * @param {Object|number} egiOrParams
 * @param {number} [opExInput]
 * @returns {number} Net Operating Income (₹)
 */
export function calculateNoi(egiOrParams = 0, opExInput = 0) {
  if (typeof egiOrParams === 'object' && egiOrParams !== null) {
    const { grossRentAnnual = 0, otherIncomeAnnual = 0, vacancyRatePct = 0, operatingExpensesAnnual = 0 } = egiOrParams;
    const gpi = calculateGrossPotentialIncome(grossRentAnnual / 12, otherIncomeAnnual);
    const vacancy = calculateVacancyLoss(gpi, vacancyRatePct);
    const egi = calculateEffectiveGrossIncome(gpi, vacancy);
    const opex = sanitize(operatingExpensesAnnual);
    return Math.round(egi - opex);
  }

  const egi = sanitize(egiOrParams);
  const opex = sanitize(opExInput);
  return Math.round(egi - opex);
}

/**
 * Calculates Capitalization Rate (Cap Rate %).
 *
 * @param {Object|number} propertyValueOrParams - Property Value (₹) or params object
 * @param {number} [noiInput] - Net Operating Income (₹)
 * @returns {number} Cap Rate Percentage (%) rounded to 2 decimal places
 */
export function calculateCapRate(propertyValueOrParams = 0, noiInput = 0) {
  let val = 0;
  let noi = 0;

  if (typeof propertyValueOrParams === 'object' && propertyValueOrParams !== null) {
    val = sanitize(propertyValueOrParams.propertyValue || propertyValueOrParams.price);
    noi = Number(propertyValueOrParams.noi) || 0;
  } else {
    // Standard signature: calculateCapRate(propertyValue, noi) or (noi, propertyValue)
    const arg1 = Number(propertyValueOrParams) || 0;
    const arg2 = Number(noiInput) || 0;
    // Determine which argument is larger as property value if both are positive
    if (arg1 > arg2 && arg1 > 1000) {
      val = sanitize(arg1);
      noi = arg2;
    } else {
      noi = arg1;
      val = sanitize(arg2);
    }
  }

  if (val <= 0) return 0;
  const capRate = (noi / val) * 100;
  return Number(capRate.toFixed(2));
}

/**
 * Calculates Implied Property Valuation at Target Cap Rate.
 *
 * @param {Object|number} noiOrParams - Net Operating Income (₹) or params object
 * @param {number} [targetCapRatePctInput] - Target Cap Rate (%)
 * @returns {number} Implied Property Valuation (₹)
 */
export function calculatePropertyValuation(noiOrParams = 0, targetCapRatePctInput = 0) {
  let noi = 0;
  let targetCapRatePct = 0;

  if (typeof noiOrParams === 'object' && noiOrParams !== null) {
    noi = Number(noiOrParams.noi) || 0;
    targetCapRatePct = Number(noiOrParams.targetCapRatePct || noiOrParams.targetCapRate) || 0;
  } else {
    noi = Number(noiOrParams) || 0;
    targetCapRatePct = Number(targetCapRatePctInput) || 0;
  }

  if (targetCapRatePct <= 0 || noi <= 0) return 0;
  return Math.round(noi / (targetCapRatePct / 100));
}

/**
 * Calculates Operating Expense Ratio (OER %).
 *
 * @param {Object|number} operatingExpensesOrParams - Operating Expenses (₹) or params object
 * @param {number} [egiInput] - Effective Gross Income (₹)
 * @returns {number} OER Percentage (%) rounded to 2 decimal places
 */
export function calculateOperatingExpenseRatio(operatingExpensesOrParams = 0, egiInput = 0) {
  let opex = 0;
  let egi = 0;

  if (typeof operatingExpensesOrParams === 'object' && operatingExpensesOrParams !== null) {
    opex = sanitize(operatingExpensesOrParams.operatingExpensesAnnual || operatingExpensesOrParams.operatingExpenses);
    egi = sanitize(operatingExpensesOrParams.effectiveGrossIncome || operatingExpensesOrParams.egi);
  } else {
    opex = sanitize(operatingExpensesOrParams);
    egi = sanitize(egiInput);
  }

  if (egi <= 0) return 0;
  return Number(((opex / egi) * 100).toFixed(2));
}

/**
 * Calculates Cap Rate Spread versus Mortgage Interest Rate.
 *
 * @param {Object|number} capRatePctOrParams - Cap Rate (%) or params object
 * @param {number} [mortgageInterestRateInput] - Mortgage Interest Rate (%)
 * @returns {number} Cap Rate Spread (%) rounded to 2 decimal places
 */
export function calculateCapRateSpread(capRatePctOrParams = 0, mortgageInterestRateInput = 0) {
  let capRatePct = 0;
  let mortgageRate = 0;

  if (typeof capRatePctOrParams === 'object' && capRatePctOrParams !== null) {
    capRatePct = Number(capRatePctOrParams.capRatePct || capRatePctOrParams.capRate) || 0;
    mortgageRate = Number(capRatePctOrParams.mortgageInterestRate || capRatePctOrParams.mortgageRate) || 0;
  } else {
    capRatePct = Number(capRatePctOrParams) || 0;
    mortgageRate = Number(mortgageInterestRateInput) || 0;
  }

  return Number((capRatePct - mortgageRate).toFixed(2));
}

/**
 * Master Cap Rate Calculation Details Function.
 *
 * @param {Object} inputs
 * @returns {Object} Structured Cap Rate Calculation Results
 */
export function calculateCapRateDetails(inputs = {}) {
  const propertyValue = sanitize(inputs.propertyValue || inputs.propertyPurchasePrice || inputs.price);
  const monthlyRent = sanitize(inputs.monthlyRent);
  const otherIncomeAnnual = sanitize(inputs.otherIncomeAnnual);
  const vacancyRatePct = Math.min(100, Math.max(0, Number(inputs.vacancyRatePct) || 0));
  const targetCapRatePct = inputs.targetCapRatePct !== undefined && inputs.targetCapRatePct !== null
    ? Math.max(0, Number(inputs.targetCapRatePct))
    : 7;
  const mortgageInterestRate = Math.max(0, Number(inputs.mortgageInterestRate) || 0);

  const isValid = propertyValue > 0 && (monthlyRent > 0 || otherIncomeAnnual > 0);

  if (!isValid) {
    return {
      isValid: false,
      validationMessage: 'Please enter a valid property value and monthly rental or operating income.',
      propertyValue: 0,
      monthlyRent: 0,
      annualGrossRent: 0,
      otherIncomeAnnual: 0,
      grossPotentialIncome: 0,
      vacancyRatePct,
      vacancyLoss: 0,
      effectiveGrossIncome: 0,
      operatingExpenses: {
        propertyTax: 0,
        insurance: 0,
        maintenance: 0,
        managementFees: 0,
        utilities: 0,
        hoaCharges: 0,
        otherOpEx: 0,
        totalOpEx: 0,
      },
      noi: 0,
      monthlyNoi: 0,
      capRatePct: 0,
      targetCapRatePct,
      impliedValuationAtTarget: 0,
      operatingExpenseRatioPct: 0,
      mortgageInterestRate,
      capRateSpreadPct: 0,
      leverageStatus: 'neutral',
    };
  }

  // 1. Income
  const grossPotentialIncome = calculateGrossPotentialIncome(monthlyRent, otherIncomeAnnual);
  const vacancyLoss = calculateVacancyLoss(grossPotentialIncome, vacancyRatePct);
  const effectiveGrossIncome = calculateEffectiveGrossIncome(grossPotentialIncome, vacancyLoss);

  // 2. Operating Expenses
  const managementFeeAmt = inputs.managementFeePct !== undefined && inputs.managementFeePct !== null
    ? Math.round(effectiveGrossIncome * (sanitize(inputs.managementFeePct) / 100))
    : sanitize(inputs.managementFees);

  const opExParams = {
    propertyTax: sanitize(inputs.propertyTaxAnnual || inputs.propertyTax),
    insurance: sanitize(inputs.insuranceAnnual || inputs.insurance),
    maintenance: sanitize(inputs.maintenanceAnnual || inputs.maintenance),
    managementFees: managementFeeAmt,
    utilities: sanitize(inputs.utilitiesAnnual || inputs.utilities),
    hoaCharges: sanitize(inputs.hoaChargesAnnual || inputs.hoaCharges),
    otherOpEx: sanitize(inputs.otherOpExAnnual || inputs.otherOpEx),
  };

  const totalOpEx = calculateOperatingExpenses(opExParams);

  // 3. NOI & Cap Rate
  const noi = calculateNoi(effectiveGrossIncome, totalOpEx);
  const monthlyNoi = Math.round(noi / 12);
  const capRatePct = calculateCapRate(propertyValue, noi);

  // 4. Target Valuation & Ratios
  const impliedValuationAtTarget = calculatePropertyValuation(noi, targetCapRatePct);
  const operatingExpenseRatioPct = calculateOperatingExpenseRatio(totalOpEx, effectiveGrossIncome);
  const capRateSpreadPct = calculateCapRateSpread(capRatePct, mortgageInterestRate);

  let leverageStatus = 'neutral';
  if (mortgageInterestRate > 0) {
    if (capRateSpreadPct > 0.5) {
      leverageStatus = 'positive';
    } else if (capRateSpreadPct < -0.5) {
      leverageStatus = 'negative';
    }
  }

  return {
    isValid: true,
    validationMessage: '',
    propertyValue,
    monthlyRent,
    annualGrossRent: Math.round(monthlyRent * 12),
    otherIncomeAnnual,
    grossPotentialIncome,
    vacancyRatePct,
    vacancyLoss,
    effectiveGrossIncome,
    operatingExpenses: {
      ...opExParams,
      totalOpEx,
    },
    noi,
    monthlyNoi,
    capRatePct,
    targetCapRatePct,
    impliedValuationAtTarget,
    operatingExpenseRatioPct,
    mortgageInterestRate,
    capRateSpreadPct,
    leverageStatus,
  };
}
