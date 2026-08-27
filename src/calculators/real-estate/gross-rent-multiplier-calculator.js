/**
 * Pure JavaScript Financial Engine for Gross Rent Multiplier (GRM) Calculator
 *
 * Calculates Gross Rent Multiplier, Implied Property Value from target GRM,
 * Gross Rent Yield, GRM Difference analysis, Comparable GRM, and 2D Sensitivity.
 *
 * GRM is a gross-income screening metric. It does NOT account for operating
 * expenses, vacancy, financing costs, taxes, insurance, maintenance, or
 * capital expenditures.
 *
 * Framework-decoupled, zero DOM dependency.
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
 * Calculates Annual Gross Rental Income.
 * Annual Gross Rent = (Monthly Gross Rent × 12) + Other Annual Gross Rental Income
 *
 * @param {number} [monthlyGrossRent=0] - Monthly gross rental income
 * @param {number} [otherAnnualGrossIncome=0] - Other annual gross rental income (parking, laundry, etc.)
 * @returns {number} Annual Gross Rental Income (rounded)
 */
export function calculateAnnualGrossRent(monthlyGrossRent = 0, otherAnnualGrossIncome = 0) {
  const monthly = sanitize(monthlyGrossRent);
  const other = sanitize(otherAnnualGrossIncome);
  return Math.round(monthly * 12 + other);
}

/**
 * Calculates Gross Rent Multiplier (GRM).
 * GRM = Property Price / Annual Gross Rental Income
 *
 * Returns null if annual gross rent is zero or negative (invalid state).
 *
 * @param {number} propertyPrice - Property price or asking price
 * @param {number} annualGrossRent - Annual gross rental income
 * @returns {number|null} GRM rounded to 2 decimal places, or null if invalid
 */
export function calculateGRM(propertyPrice, annualGrossRent) {
  const price = sanitize(propertyPrice);
  const rent = sanitize(annualGrossRent);

  if (rent <= 0) return null;
  if (price <= 0) return 0;

  return Number((price / rent).toFixed(2));
}

/**
 * Calculates Implied Property Value from Annual Gross Rent and Target GRM.
 * Implied Value = Annual Gross Rental Income × Target GRM
 *
 * @param {number} annualGrossRent - Annual gross rental income
 * @param {number} targetGRM - Target Gross Rent Multiplier
 * @returns {number} Implied Property Value (rounded)
 */
export function calculateImpliedValueFromGRM(annualGrossRent, targetGRM) {
  const rent = sanitize(annualGrossRent);
  const grm = Number(targetGRM);

  if (!Number.isFinite(grm) || grm <= 0) return 0;
  if (rent <= 0) return 0;

  return Math.round(rent * grm);
}

/**
 * Calculates Gross Rent Yield %.
 * Gross Rent Yield % = (Annual Gross Rental Income / Property Price) × 100
 *
 * GRM and Gross Rent Yield are mathematical reciprocals:
 * Gross Rent Yield % = 100 / GRM
 *
 * Do not confuse with Net Rental Yield or Cap Rate.
 *
 * @param {number} annualGrossRent - Annual gross rental income
 * @param {number} propertyPrice - Property price
 * @returns {number} Gross Rent Yield (%) rounded to 2 decimal places
 */
export function calculateGrossRentYield(annualGrossRent, propertyPrice) {
  const rent = sanitize(annualGrossRent);
  const price = sanitize(propertyPrice);

  if (price <= 0 || rent <= 0) return 0;

  return Number(((rent / price) * 100).toFixed(2));
}

/**
 * Calculates GRM Difference (Current GRM vs Target GRM).
 * GRM Difference = Current GRM - Target GRM
 *
 * @param {number} currentGRM - Current property GRM
 * @param {number} targetGRM - Target / market GRM
 * @returns {number|null} GRM Difference rounded to 2 decimal places, or null if either is null
 */
export function calculateGRMDifference(currentGRM, targetGRM) {
  if (currentGRM === null || currentGRM === undefined) return null;
  const current = Number(currentGRM);
  const target = Number(targetGRM);

  if (!Number.isFinite(current) || !Number.isFinite(target)) return null;

  return Number((current - target).toFixed(2));
}

/**
 * Calculates GRM Difference Percent.
 * GRM Difference % = ((Current GRM - Target GRM) / Target GRM) × 100
 *
 * @param {number} currentGRM - Current property GRM
 * @param {number} targetGRM - Target / market GRM
 * @returns {number|null} GRM Difference % rounded to 2 decimal places, or null if invalid
 */
export function calculateGRMDifferencePercent(currentGRM, targetGRM) {
  if (currentGRM === null || currentGRM === undefined) return null;
  const current = Number(currentGRM);
  const target = Number(targetGRM);

  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) return null;

  return Number((((current - target) / target) * 100).toFixed(2));
}

/**
 * Calculates Value Difference between Implied Value and Current Property Value.
 *
 * @param {number} impliedValue - Implied property value from GRM
 * @param {number} currentPropertyValue - Current property value / asking price
 * @returns {{ valueDifference: number|null, valueDifferencePct: number|null }}
 */
export function calculateValueDifference(impliedValue, currentPropertyValue) {
  const implied = Number(impliedValue);
  const current = sanitize(currentPropertyValue);

  if (!Number.isFinite(implied) || current <= 0) {
    return { valueDifference: null, valueDifferencePct: null };
  }

  const valueDifference = Math.round(implied - current);
  const valueDifferencePct = Number((((implied - current) / current) * 100).toFixed(2));

  return { valueDifference, valueDifferencePct };
}

/**
 * Calculates a 2D Sensitivity Matrix for Implied Property Value.
 *
 * Rows: Annual Gross Rent scenarios (percentage variations)
 * Columns: Target GRM scenarios
 *
 * Each cell: Implied Value = Scenario Annual Gross Rent × Scenario GRM
 *
 * @param {number} baseAnnualGrossRent - Base annual gross rental income
 * @param {number} baseTargetGRM - Base target GRM
 * @param {number[]} [rentPctVariations=[-20, -10, 0, 10, 20]] - Rent percentage variations
 * @param {number[]} [grmScenarios=[5, 7, 9, 11, 13]] - GRM scenario values
 * @returns {{ rentScenarios: Array, grmScenarios: number[], matrix: number[][] }}
 */
export function calculateSensitivity(
  baseAnnualGrossRent = 0,
  baseTargetGRM = 8,
  rentPctVariations = [-20, -10, 0, 10, 20],
  grmScenarios = [5, 7, 9, 11, 13]
) {
  const baseRent = sanitize(baseAnnualGrossRent);

  const rentScenarios = rentPctVariations.map((pct) => {
    const scenarioRent = Math.round(baseRent * (1 + pct / 100));
    const label = pct === 0 ? 'Base Rent' : `${pct > 0 ? '+' : ''}${pct}% Rent`;
    return {
      label,
      pctChange: pct,
      annualGrossRent: scenarioRent,
    };
  });

  const matrix = rentScenarios.map((s) => {
    return grmScenarios.map((grm) => {
      return calculateImpliedValueFromGRM(s.annualGrossRent, grm);
    });
  });

  return {
    rentScenarios,
    grmScenarios,
    matrix,
  };
}

/**
 * Master Gross Rent Multiplier Calculation Engine.
 *
 * @param {Object} inputs
 * @param {number} [inputs.currentPropertyValue] - Current property value or asking price (optional)
 * @param {number} [inputs.monthlyGrossRent=0] - Monthly gross rental income
 * @param {number} [inputs.otherAnnualGrossIncome=0] - Other annual gross rental income
 * @param {number} [inputs.targetGRM=8] - Target Gross Rent Multiplier
 * @param {number} [inputs.comparablePropertyPrice] - Optional comparable property price
 * @param {number} [inputs.comparableAnnualGrossRent] - Optional comparable annual gross rent
 * @returns {Object} Structured GRM calculation results
 */
export function calculateGrossRentMultiplier(inputs = {}) {
  const monthlyGrossRent = sanitize(inputs.monthlyGrossRent);
  const otherAnnualGrossIncome = sanitize(inputs.otherAnnualGrossIncome);

  const targetGRM = inputs.targetGRM !== undefined && inputs.targetGRM !== null
    ? Number(inputs.targetGRM)
    : 8;

  const currentPropertyValue = inputs.currentPropertyValue !== undefined && inputs.currentPropertyValue !== null
    ? sanitize(inputs.currentPropertyValue)
    : null;

  // 1. Annual Gross Rental Income
  const annualGrossRent = calculateAnnualGrossRent(monthlyGrossRent, otherAnnualGrossIncome);

  // Validate: annual gross rent must be > 0 for GRM calculations
  const hasValidRent = annualGrossRent > 0;
  const hasValidTargetGRM = Number.isFinite(targetGRM) && targetGRM > 0;

  if (!hasValidRent) {
    return {
      isValid: false,
      validationMessage: 'Annual gross rental income must be greater than zero. Please enter a monthly rent or other annual gross income.',
      monthlyGrossRent,
      otherAnnualGrossIncome,
      annualGrossRent: 0,
      targetGRM,
      currentPropertyValue,
      currentGRM: null,
      impliedValue: 0,
      grossRentYieldPct: 0,
      grmDifference: null,
      grmDifferencePct: null,
      valueDifference: null,
      valueDifferencePct: null,
      comparableGRM: null,
      sensitivity: calculateSensitivity(0, targetGRM > 0 ? targetGRM : 8),
    };
  }

  // 2. Current GRM (if current property value is supplied)
  const currentGRM = currentPropertyValue !== null && currentPropertyValue > 0
    ? calculateGRM(currentPropertyValue, annualGrossRent)
    : null;

  // 3. Implied Property Value from Target GRM
  const impliedValue = hasValidTargetGRM
    ? calculateImpliedValueFromGRM(annualGrossRent, targetGRM)
    : 0;

  // 4. Gross Rent Yield from current property value
  const grossRentYieldPct = currentPropertyValue !== null && currentPropertyValue > 0
    ? calculateGrossRentYield(annualGrossRent, currentPropertyValue)
    : (hasValidTargetGRM ? Number((100 / targetGRM).toFixed(2)) : 0);

  // 5. GRM Difference
  const grmDifference = hasValidTargetGRM
    ? calculateGRMDifference(currentGRM, targetGRM)
    : null;

  const grmDifferencePct = hasValidTargetGRM
    ? calculateGRMDifferencePercent(currentGRM, targetGRM)
    : null;

  // 6. Value Difference
  const { valueDifference, valueDifferencePct } = currentPropertyValue !== null && currentPropertyValue > 0
    ? calculateValueDifference(impliedValue, currentPropertyValue)
    : { valueDifference: null, valueDifferencePct: null };

  // 7. Comparable GRM (optional)
  let comparableGRM = null;
  if (inputs.comparablePropertyPrice !== undefined && inputs.comparableAnnualGrossRent !== undefined) {
    const compPrice = sanitize(inputs.comparablePropertyPrice);
    const compRent = sanitize(inputs.comparableAnnualGrossRent);
    if (compPrice > 0 && compRent > 0) {
      comparableGRM = calculateGRM(compPrice, compRent);
    }
  }

  // 8. Sensitivity Analysis
  const sensitivity = calculateSensitivity(annualGrossRent, hasValidTargetGRM ? targetGRM : 8);

  return {
    isValid: true,
    validationMessage: '',
    monthlyGrossRent,
    otherAnnualGrossIncome,
    annualGrossRent,
    targetGRM: hasValidTargetGRM ? targetGRM : null,
    currentPropertyValue,
    currentGRM,
    impliedValue,
    grossRentYieldPct,
    grmDifference,
    grmDifferencePct,
    valueDifference,
    valueDifferencePct,
    comparableGRM,
    sensitivity,
  };
}
