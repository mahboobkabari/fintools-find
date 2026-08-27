/**
 * Pure JavaScript Financial Engine for Property Valuation Calculator
 * Real Estate Income Capitalization Approach (Cap Rate Valuation),
 * Net Operating Income (NOI), Current Cap Rate, Valuation Gap, and 2D Sensitivity Analysis.
 *
 * All financial logic is completely decoupled from UI and framework code.
 */

import {
  calculateGrossPotentialIncome,
  calculateVacancyLoss,
  calculateEffectiveGrossIncome,
  calculateOperatingExpenses,
} from './cap-rate-calculator.js';

export {
  calculateGrossPotentialIncome,
  calculateVacancyLoss,
  calculateEffectiveGrossIncome,
  calculateOperatingExpenses,
};

/**
 * Sanitizes input to a finite number.
 *
 * @param {any} val
 * @param {number} [defaultVal=0]
 * @returns {number}
 */
function sanitizeNumber(val, defaultVal = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? num : defaultVal;
}

/**
 * Sanitizes input to a non-negative number.
 *
 * @param {any} val
 * @param {number} [defaultVal=0]
 * @returns {number}
 */
function sanitizeNonNegative(val, defaultVal = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? Math.max(0, num) : defaultVal;
}

/**
 * Calculates Net Operating Income (NOI).
 * Debt service and mortgage payments are strictly EXCLUDED.
 * Negative NOI is preserved and not artificially clamped.
 *
 * @param {number} [egi=0] - Effective Gross Income (₹)
 * @param {number} [opEx=0] - Total Annual Operating Expenses (₹)
 * @returns {number} Net Operating Income (₹)
 */
export function calculateNOI(egi = 0, opEx = 0) {
  const egiVal = sanitizeNumber(egi);
  const opExVal = sanitizeNonNegative(opEx);
  return Math.round(egiVal - opExVal);
}

/**
 * Calculates Income-Implied Property Value from NOI and Target Cap Rate %.
 * Value = NOI / (Target Cap Rate / 100)
 *
 * @param {number} [noi=0] - Net Operating Income (₹)
 * @param {number} [targetCapRatePct=6] - Target Cap Rate (%)
 * @returns {number} Income-Implied Property Value (₹)
 */
export function calculateValueFromCapRate(noi = 0, targetCapRatePct = 6) {
  const noiVal = sanitizeNumber(noi);
  const capRate = sanitizeNumber(targetCapRatePct);

  if (capRate <= 0) {
    return 0;
  }

  const rateDecimal = capRate / 100;
  return Math.round(noiVal / rateDecimal);
}

/**
 * Calculates Current Cap Rate % from NOI and Current Property Value.
 * Current Cap Rate = (NOI / Current Value) * 100
 *
 * @param {number} [currentValue=0] - Current Property Value / Asking Price (₹)
 * @param {number} [noi=0] - Net Operating Income (₹)
 * @returns {number|null} Current Cap Rate (%) rounded to 2 decimal places, or null if value is not provided
 */
export function calculateCapRate(currentValue = 0, noi = 0) {
  const val = sanitizeNonNegative(currentValue);
  const noiVal = sanitizeNumber(noi);

  if (val <= 0) {
    return null;
  }

  const capRate = (noiVal / val) * 100;
  return Number(capRate.toFixed(2));
}

/**
 * Calculates Valuation Gap and Valuation Gap % between Income-Implied Value and Current Value.
 *
 * @param {number} [impliedValue=0] - Income-Implied Value (₹)
 * @param {number} [currentValue=0] - Current Property Value / Asking Price (₹)
 * @returns {{ gapAmount: number|null, gapPct: number|null, status: string }}
 */
export function calculateValuationGap(impliedValue = 0, currentValue = 0) {
  const implVal = sanitizeNumber(impliedValue);
  const currVal = sanitizeNonNegative(currentValue);

  if (currVal <= 0) {
    return {
      gapAmount: null,
      gapPct: null,
      status: 'omitted',
    };
  }

  const gapAmount = Math.round(implVal - currVal);
  const gapPct = Number(((gapAmount / currVal) * 100).toFixed(2));

  let status = 'aligned';
  if (gapPct > 1) {
    status = 'above_asking';
  } else if (gapPct < -1) {
    status = 'below_asking';
  }

  return {
    gapAmount,
    gapPct,
    status,
  };
}

/**
 * Calculates a 2D Sensitivity Matrix for Property Valuation across NOI and Cap Rate variations.
 *
 * @param {number} baseNoi - Base Net Operating Income (₹)
 * @param {number} [baseCapRatePct=6] - Base Target Cap Rate (%)
 * @param {number[]} [noiPcts=[-20, -10, 0, 10, 20]] - Percentage variations for NOI
 * @param {number[]} [capRates=[4, 5, 6, 7, 8]] - Target Cap Rate scenarios (%)
 * @returns {{ noiScenarios: Array<{ label: string, pctChange: number, noi: number }>, capRateScenarios: number[], matrix: number[][] }}
 */
export function calculateSensitivity(
  baseNoi = 0,
  baseCapRatePct = 6,
  noiPcts = [-20, -10, 0, 10, 20],
  capRates = [4, 5, 6, 7, 8]
) {
  const noiVal = sanitizeNumber(baseNoi);

  const noiScenarios = noiPcts.map((pct) => {
    const scenarioNoi = Math.round(noiVal * (1 + pct / 100));
    const label = pct === 0 ? 'Base NOI' : `${pct > 0 ? '+' : ''}${pct}% NOI`;
    return {
      label,
      pctChange: pct,
      noi: scenarioNoi,
    };
  });

  const matrix = noiScenarios.map((s) => {
    return capRates.map((rate) => {
      return calculateValueFromCapRate(s.noi, rate);
    });
  });

  return {
    noiScenarios,
    capRateScenarios: capRates,
    matrix,
  };
}

/**
 * Master Financial Engine function for Property Valuation Calculator.
 *
 * @param {Object} inputs
 * @param {number} [inputs.currentPropertyValue] - Optional current market value / asking price (₹)
 * @param {number} [inputs.targetCapRatePct=6] - Target Cap Rate (%)
 * @param {number} [inputs.monthlyGrossRent=50000] - Monthly gross rental income (₹)
 * @param {number} [inputs.otherAnnualIncome=0] - Other annual property income (₹)
 * @param {number} [inputs.vacancyRatePct=5] - Vacancy & credit loss (%)
 * @param {number} [inputs.annualOperatingExpenses] - Direct total annual operating expenses (₹)
 * @param {Object} [inputs.operatingExpenses] - Itemized operating expenses
 * @returns {Object} Structured Property Valuation Results
 */
export function calculatePropertyValuation(inputs = {}) {
  const currentPropertyValue = inputs.currentPropertyValue !== undefined && inputs.currentPropertyValue !== null && inputs.currentPropertyValue !== ''
    ? sanitizeNonNegative(inputs.currentPropertyValue)
    : (inputs.askingPrice !== undefined && inputs.askingPrice !== null && inputs.askingPrice !== '' ? sanitizeNonNegative(inputs.askingPrice) : null);

  const targetCapRatePct = inputs.targetCapRatePct !== undefined && inputs.targetCapRatePct !== null
    ? Math.max(0, Number(inputs.targetCapRatePct) || 0)
    : 6;

  const monthlyGrossRent = sanitizeNonNegative(inputs.monthlyGrossRent !== undefined ? inputs.monthlyGrossRent : 50000);
  const otherAnnualIncome = sanitizeNonNegative(inputs.otherAnnualIncome || 0);
  const vacancyRatePct = Math.min(100, Math.max(0, Number(inputs.vacancyRatePct) !== undefined ? Number(inputs.vacancyRatePct) : 5));

  // Determine Operating Expenses
  let totalOpEx = 0;
  let itemizedOpEx = null;

  if (inputs.annualOperatingExpenses !== undefined && inputs.annualOperatingExpenses !== null) {
    totalOpEx = sanitizeNonNegative(inputs.annualOperatingExpenses);
  } else if (inputs.operatingExpenses && typeof inputs.operatingExpenses === 'object') {
    totalOpEx = calculateOperatingExpenses(inputs.operatingExpenses);
    itemizedOpEx = inputs.operatingExpenses;
  } else {
    totalOpEx = 120000;
  }

  // Basic validation check
  const hasIncomeInput = monthlyGrossRent > 0 || otherAnnualIncome > 0;
  const isValidTargetCapRate = targetCapRatePct > 0;
  const isValid = hasIncomeInput && isValidTargetCapRate;

  if (!isValid) {
    let validationMessage = '';
    if (!hasIncomeInput) {
      validationMessage = 'Please enter valid monthly rental income or annual income.';
    } else if (!isValidTargetCapRate) {
      validationMessage = 'Target Cap Rate must be greater than zero.';
    }

    return {
      isValid: false,
      validationMessage,
      currentPropertyValue,
      targetCapRatePct,
      monthlyGrossRent,
      otherAnnualIncome,
      vacancyRatePct,
      gpi: 0,
      vacancyLoss: 0,
      egi: 0,
      totalOpEx: 0,
      itemizedOpEx,
      noi: 0,
      impliedPropertyValue: 0,
      currentCapRatePct: null,
      valuationGapAmount: null,
      valuationGapPct: null,
      valuationStatus: 'omitted',
      valuePerAnnualNoi: 0,
      sensitivity: calculateSensitivity(0, targetCapRatePct),
    };
  }

  // 1. Calculate Income Metrics
  const gpi = calculateGrossPotentialIncome(monthlyGrossRent, otherAnnualIncome);
  const vacancyLoss = calculateVacancyLoss(gpi, vacancyRatePct);
  const egi = calculateEffectiveGrossIncome(gpi, vacancyLoss);

  // 2. Net Operating Income (NOI)
  const noi = calculateNOI(egi, totalOpEx);

  // 3. Income-Implied Property Value
  const impliedPropertyValue = calculateValueFromCapRate(noi, targetCapRatePct);

  // 4. Current Cap Rate & Valuation Gap (if currentPropertyValue is supplied)
  const currentCapRatePct = currentPropertyValue && currentPropertyValue > 0
    ? calculateCapRate(currentPropertyValue, noi)
    : null;

  const gap = currentPropertyValue && currentPropertyValue > 0
    ? calculateValuationGap(impliedPropertyValue, currentPropertyValue)
    : { gapAmount: null, gapPct: null, status: 'omitted' };

  // 5. Value per Annual NOI multiple (e.g. 10M / 600k = 16.67x)
  const valuePerAnnualNoi = noi > 0 ? Number((impliedPropertyValue / noi).toFixed(2)) : 0;

  // 6. Sensitivity Matrix
  const sensitivity = calculateSensitivity(noi, targetCapRatePct);

  return {
    isValid: true,
    validationMessage: '',
    currentPropertyValue,
    targetCapRatePct,
    monthlyGrossRent,
    annualGrossRent: Math.round(monthlyGrossRent * 12),
    otherAnnualIncome,
    vacancyRatePct,
    gpi,
    vacancyLoss,
    egi,
    totalOpEx,
    itemizedOpEx,
    noi,
    monthlyNoi: Math.round(noi / 12),
    impliedPropertyValue,
    currentCapRatePct,
    valuationGapAmount: gap.gapAmount,
    valuationGapPct: gap.gapPct,
    valuationStatus: gap.status,
    valuePerAnnualNoi,
    sensitivity,
  };
}
