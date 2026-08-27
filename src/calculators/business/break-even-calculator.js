/**
 * Break-Even Analysis Financial Engine (Cost-Volume-Profit CVP Analysis)
 * 
 * Pure mathematical engine calculating contribution margins, unit break-even thresholds,
 * monetary revenue break-even, target profit sales volume, and safety margins.
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
 * Calculates Contribution Margin Per Unit.
 * Contribution Margin = Selling Price - Variable Cost
 */
export function calculateContributionMargin(sellingPrice, variableCost) {
  const p = sanitize(sellingPrice);
  const v = sanitize(variableCost);
  return Number((p - v).toFixed(2));
}

/**
 * Calculates Contribution Margin Ratio (%).
 * Contribution Margin Ratio = (Selling Price - Variable Cost) / Selling Price * 100
 */
export function calculateContributionMarginRatio(sellingPrice, variableCost) {
  const p = sanitize(sellingPrice);
  const v = sanitize(variableCost);
  if (p <= 0) return 0;
  const cm = p - v;
  return Number(((cm / p) * 100).toFixed(2));
}

/**
 * Calculates Break-Even Point in Units.
 * Break-Even Units = Ceil(Fixed Costs / Contribution Margin Per Unit)
 */
export function calculateBreakEvenUnits(fixedCosts, sellingPrice, variableCost) {
  const fc = sanitize(fixedCosts);
  const p = sanitize(sellingPrice);
  const v = sanitize(variableCost);
  const cm = p - v;

  if (cm <= 0) return Infinity; // No break-even achievable when CM <= 0
  if (fc === 0) return 0;

  return Math.ceil(fc / cm);
}

/**
 * Calculates Break-Even Revenue (₹).
 * Break-Even Revenue = Break-Even Units * Selling Price
 */
export function calculateBreakEvenRevenue(fixedCosts, sellingPrice, variableCost) {
  const p = sanitize(sellingPrice);
  const units = calculateBreakEvenUnits(fixedCosts, sellingPrice, variableCost);

  if (!Number.isFinite(units)) return Infinity;
  return Math.round(units * p);
}

/**
 * Calculates Profit/Loss at a given sales volume.
 * Profit = (Selling Price - Variable Cost) * Units Sold - Fixed Costs
 */
export function calculateProfit(fixedCosts, sellingPrice, variableCost, unitSales) {
  const fc = sanitize(fixedCosts);
  const p = sanitize(sellingPrice);
  const v = sanitize(variableCost);
  const s = sanitize(unitSales);

  const cm = p - v;
  return Math.round(cm * s - fc);
}

/**
 * Calculates Required Unit Sales to achieve a Target Profit.
 * Required Units = Ceil((Fixed Costs + Target Profit) / Contribution Margin Per Unit)
 */
export function calculateRequiredUnitsForTargetProfit(fixedCosts, sellingPrice, variableCost, targetProfit = 0) {
  const fc = sanitize(fixedCosts);
  const p = sanitize(sellingPrice);
  const v = sanitize(variableCost);
  const tp = sanitize(targetProfit);

  const cm = p - v;
  if (cm <= 0) return Infinity;

  return Math.ceil((fc + tp) / cm);
}

/**
 * Comprehensive Break-Even CVP Calculation Engine.
 * 
 * @param {Object} inputs
 * @param {number} inputs.fixedCosts - Total fixed overhead costs (₹)
 * @param {number} inputs.sellingPrice - Selling price per unit (₹)
 * @param {number} inputs.variableCost - Variable cost per unit (₹)
 * @param {number} [inputs.currentSalesVolume=0] - Current/expected sales volume in units
 * @param {number} [inputs.targetProfit=0] - Optional target profit goal (₹)
 * @returns {Object} Structured CVP calculation results
 */
export function calculateBreakEven({
  fixedCosts = 0,
  sellingPrice = 0,
  variableCost = 0,
  currentSalesVolume = 0,
  targetProfit = 0,
} = {}) {
  const fc = sanitize(fixedCosts);
  const p = sanitize(sellingPrice);
  const v = sanitize(variableCost);
  const currentVolume = sanitize(currentSalesVolume);
  const tp = sanitize(targetProfit);

  const contributionMargin = calculateContributionMargin(p, v);
  const contributionMarginRatio = calculateContributionMarginRatio(p, v);

  // Financial Validation
  let isValid = true;
  let validationMessage = '';

  if (p <= 0) {
    isValid = false;
    validationMessage = 'Selling price per unit must be greater than zero.';
  } else if (v >= p) {
    isValid = false;
    validationMessage = v === p
      ? 'Selling price equals variable cost. No contribution margin is generated to cover fixed overhead.'
      : 'Variable cost exceeds selling price. The business incurs a loss on every unit sold.';
  }

  const breakEvenUnits = isValid ? calculateBreakEvenUnits(fc, p, v) : 0;
  const breakEvenRevenue = isValid ? calculateBreakEvenRevenue(fc, p, v) : 0;

  const currentRevenue = Math.round(currentVolume * p);
  const currentTotalVariableCost = Math.round(currentVolume * v);
  const currentTotalCost = Math.round(fc + currentTotalVariableCost);
  const currentProfit = Math.round(currentVolume * contributionMargin - fc);

  // Margin of Safety calculation
  let marginOfSafetyUnits = 0;
  let marginOfSafetyPercent = 0;
  let isAboveBreakEven = false;

  if (isValid && currentVolume > 0 && Number.isFinite(breakEvenUnits)) {
    marginOfSafetyUnits = currentVolume - breakEvenUnits;
    marginOfSafetyPercent = Number(((marginOfSafetyUnits / currentVolume) * 100).toFixed(1));
    isAboveBreakEven = currentVolume >= breakEvenUnits;
  }

  // Target Profit calculation
  const targetProfitUnits = (isValid && tp > 0) ? calculateRequiredUnitsForTargetProfit(fc, p, v, tp) : 0;
  const targetProfitRevenue = (isValid && tp > 0) ? Math.round(targetProfitUnits * p) : 0;

  // Sensitivity Matrix (Price variations +-10%)
  const sensitivityMatrix = [];
  if (isValid) {
    [-0.1, -0.05, 0, 0.05, 0.1].forEach((pct) => {
      const adjustedPrice = Number((p * (1 + pct)).toFixed(2));
      const adjUnits = calculateBreakEvenUnits(fc, adjustedPrice, v);
      const adjRev = calculateBreakEvenRevenue(fc, adjustedPrice, v);
      sensitivityMatrix.push({
        priceChangePct: Math.round(pct * 100),
        adjustedPrice,
        breakEvenUnits: Number.isFinite(adjUnits) ? adjUnits : 0,
        breakEvenRevenue: Number.isFinite(adjRev) ? adjRev : 0,
      });
    });
  }

  return {
    isValid,
    validationMessage,
    fixedCosts: fc,
    sellingPrice: p,
    variableCost: v,
    currentSalesVolume: currentVolume,
    targetProfit: tp,
    contributionMargin,
    contributionMarginRatio,
    breakEvenUnits: Number.isFinite(breakEvenUnits) ? breakEvenUnits : 0,
    breakEvenRevenue: Number.isFinite(breakEvenRevenue) ? breakEvenRevenue : 0,
    currentRevenue,
    currentTotalVariableCost,
    currentTotalCost,
    currentProfit,
    marginOfSafetyUnits,
    marginOfSafetyPercent,
    isAboveBreakEven,
    targetProfitUnits: Number.isFinite(targetProfitUnits) ? targetProfitUnits : 0,
    targetProfitRevenue: Number.isFinite(targetProfitRevenue) ? targetProfitRevenue : 0,
    sensitivityMatrix,
  };
}
