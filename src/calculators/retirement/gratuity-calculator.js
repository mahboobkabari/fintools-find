import { GRATUITY_CONFIG } from '../configs/gratuityConfig.js';
import { inflationAdjustedValue, wealthMultiplier } from '../core/investmentUtils.js';

/**
 * Institutional Flagship Gratuity Decision Engine (Payment of Gratuity Act, 1972 & Section 10(10))
 * Computes statutory gratuity payouts, 15/26 vs 15/30 working day rules, Section 10(10) ₹20 Lakh tax exemptions,
 * Work 1-to-5 More Years career growth simulators, and reverse target salary solvers.
 *
 * @param {Object} inputs
 * @param {number} [inputs.lastDrawnBasic=50000] - Last drawn monthly Basic Salary + DA in Rupees (₹)
 * @param {number} [inputs.tenureYears=15] - Completed years of continuous service
 * @param {number} [inputs.tenureMonths=7] - Additional months of service (0 to 11 months)
 * @param {string} [inputs.coverageType='covered'] - Coverage: 'covered' | 'non_covered' | 'government'
 * @param {boolean} [inputs.isDisabilityWaiver=false] - Death/disablement 5-year eligibility waiver exception
 * @param {number} [inputs.annualSalaryIncrease=5] - Expected annual salary growth (%)
 * @param {number} [inputs.marginalTaxRate=30] - Marginal tax rate for taxable gratuity outgo (%)
 * @param {string} [inputs.calculationMode='forward'] - Mode: 'forward' | 'reverse_gratuity'
 * @param {number} [inputs.targetGratuity=2000000] - Target gratuity payout for reverse solver (₹)
 * @param {number} [inputs.inflationRate=6] - Expected annual inflation rate (%)
 * @returns {Object} Complete structured Gratuity analytical model
 */
export function calculateGratuityCalculator(inputs = {}) {
  // Backward compatibility check for isCoveredUnderAct boolean/string
  let defaultCoverage = 'covered';
  if (inputs.isCoveredUnderAct !== undefined) {
    const isBool = inputs.isCoveredUnderAct === true || inputs.isCoveredUnderAct === 'true' || inputs.isCoveredUnderAct === 'yes';
    defaultCoverage = isBool ? 'covered' : 'non_covered';
  }

  const {
    lastDrawnBasic = 50000,
    tenureYears = 15,
    tenureMonths = 7,
    coverageType = defaultCoverage,
    isDisabilityWaiver = false,
    annualSalaryIncrease = 5,
    marginalTaxRate = 30,
    calculationMode = 'forward',
    targetGratuity = 2000000,
    inflationRate = 6,
  } = inputs;

  // 1. INPUT SANITIZATION & VALIDATION
  const numBasic = Math.max(0, Number(lastDrawnBasic) || 0);
  const numYears = Math.max(0, Number(tenureYears) || 0);
  const numMonths = Math.max(0, Math.min(11, Number(tenureMonths) || 0));
  const salIncPct = Math.max(0, Math.min(30, Number(annualSalaryIncrease) || 0));
  const taxRatePct = Math.max(0, Math.min(50, Number(marginalTaxRate) || 0));
  const targetGratVal = Math.max(0, Number(targetGratuity) || 0);
  const infRate = Math.max(0, Math.min(25, Number(inflationRate) || 0));

  const totalMonths = numYears * 12 + numMonths;
  // Standard 5-year eligibility (60 months or 54+ months ~4.5 yrs 240-day precedent), waived if disability/death
  const isEligible = totalMonths >= 54 || isDisabilityWaiver;

  // Handle Edge Case: Zero Basic Salary
  if (numBasic === 0 && calculationMode !== 'reverse_gratuity') {
    return createZeroBasicResult(numYears, numMonths, coverageType);
  }

  // 2. REVERSE TARGET GRATUITY SOLVER MODE
  let solvedBasic = numBasic;
  if (calculationMode === 'reverse_gratuity' && targetGratVal > 0) {
    solvedBasic = solveRequiredBasicSalaryInternal({
      targetGratuity: targetGratVal,
      tenureYears: numYears,
      tenureMonths: numMonths,
      coverageType,
      isDisabilityWaiver,
    });
  }

  const effectiveBasic = solvedBasic;

  // 3. FORWARD GRATUITY SIMULATION EXECUTION
  const simResult = runGratuitySimulation({
    lastDrawnBasic: effectiveBasic,
    tenureYears: numYears,
    tenureMonths: numMonths,
    coverageType,
    isEligible,
    marginalTaxRate: taxRatePct,
  });

  // 4. WORK "1 TO 5 MORE YEARS" CAREER GROWTH SIMULATOR
  const careerSimulators = [1, 2, 3, 4, 5].map((k) => {
    const projBasic = Math.round(effectiveBasic * Math.pow(1 + salIncPct / 100, k));
    const projYears = numYears + k;
    const scSim = runGratuitySimulation({
      lastDrawnBasic: projBasic,
      tenureYears: projYears,
      tenureMonths: numMonths,
      coverageType,
      isEligible: true,
      marginalTaxRate: taxRatePct,
    });

    return {
      additionalYears: k,
      label: `+${k} Year${k > 1 ? 's' : ''} Service`,
      projectedBasic: projBasic,
      projectedTenureYears: projYears,
      projectedGratuity: scSim.gratuityAmount,
      additionalGratuity: scSim.gratuityAmount - simResult.gratuityAmount,
      sec80E_taxFree: scSim.taxFreeGratuity,
      taxableGratuity: scSim.taxableGratuity,
    };
  });

  // 5. 4-SCENARIO TENURE COMPARISON GRID (5Y Milestone vs 10Y vs 15Y vs 25Y)
  const tenureScenarios = [5, 10, 15, 25].map((years) => {
    const scSim = runGratuitySimulation({
      lastDrawnBasic: effectiveBasic,
      tenureYears: years,
      tenureMonths: 0,
      coverageType,
      isEligible: true,
      marginalTaxRate: taxRatePct,
    });
    return {
      tenureYears: years,
      label: `${years}-Year Service Milestone`,
      gratuityAmount: scSim.gratuityAmount,
      taxFreeGratuity: scSim.taxFreeGratuity,
      taxableGratuity: scSim.taxableGratuity,
      netPostTaxGratuity: scSim.netPostTaxGratuity,
    };
  });

  // 6. INFLATION REAL PURCHASING POWER
  const realValResult = inflationAdjustedValue(
    simResult.gratuityAmount,
    infRate,
    numYears
  );

  const multiplier = wealthMultiplier(simResult.gratuityAmount, effectiveBasic * 12);

  // Hero Summary Text
  let heroText = '';
  if (calculationMode === 'reverse_gratuity' && targetGratVal > 0) {
    heroText = `To achieve a target gratuity payout of ₹${targetGratVal.toLocaleString(
      'en-IN'
    )} after ${simResult.roundedYears} years of service, your required last drawn monthly basic salary is approximately ₹${effectiveBasic.toLocaleString(
      'en-IN'
    )}/mo.`;
  } else if (!isEligible) {
    heroText = `Under the Payment of Gratuity Act 1972, completing 5 continuous years of service is mandatory. You currently have ${numYears} years and ${numMonths} months of service.`;
  } else {
    heroText = `Your projected gratuity payout after ${simResult.roundedYears} years of service is ₹${simResult.gratuityAmount.toLocaleString(
      'en-IN'
    )}, of which ₹${simResult.taxFreeGratuity.toLocaleString(
      'en-IN'
    )} is 100% tax-free under Section 10(10).`;
  }

  return {
    lastDrawnBasic: effectiveBasic,
    tenureYears: numYears,
    tenureMonths: numMonths,
    coverageType,
    isDisabilityWaiver,
    annualSalaryIncrease: salIncPct,
    marginalTaxRate: taxRatePct,
    calculationMode,
    targetGratuity: targetGratVal,
    inflationRate: infRate,

    // Primary Outputs
    primaryOutput: simResult.gratuityAmount,
    gratuityAmount: simResult.gratuityAmount,
    isEligible,
    roundedYears: simResult.roundedYears,
    denominator: simResult.denominator,

    // Section 10(10) Tax Exemption
    taxFreeLimit: GRATUITY_CONFIG.statutoryRules.sec10_10_taxFreeCeiling,
    taxFreeGratuity: simResult.taxFreeGratuity,
    taxableGratuity: simResult.taxableGratuity,
    estimatedTaxOnGratuity: simResult.estimatedTaxOnGratuity,
    netPostTaxGratuity: simResult.netPostTaxGratuity,
    isCeilingBreached: simResult.taxableGratuity > 0,

    // Real Inflation Value
    realValue: realValResult.realValue,

    // Career Simulators & Scenarios
    careerSimulators,
    tenureScenarios,

    // Health Score & Status
    heroText,
    score: computeGratuityHealthScore(isEligible, simResult.gratuityAmount, simResult.taxFreeGratuity),
    healthStatus: isEligible
      ? 'Fully Eligible Statutory Payout'
      : 'Ineligible (< 5 Years Service)',
  };
}

/**
 * Pure Simulation Engine for Gratuity & Section 10(10) Tax Exemption
 */
function runGratuitySimulation({
  lastDrawnBasic,
  tenureYears,
  tenureMonths,
  coverageType,
  isEligible,
  marginalTaxRate,
}) {
  const isGovernment = coverageType === 'government';
  const isNonCovered = coverageType === 'non_covered';

  // Covered / Government uses 15/26 rule with 6-month rounding
  // Non-covered uses 15/30 rule with full completed years only
  const denominator = isNonCovered ? 30 : 26;

  const roundedYears = isNonCovered
    ? tenureYears
    : tenureYears + (tenureMonths >= 6 ? 1 : 0);

  let gratuityAmount = 0;
  if (isEligible) {
    gratuityAmount = Math.round((15 / denominator) * lastDrawnBasic * roundedYears);
  }

  // Section 10(10) Tax Exemption
  let taxFreeGratuity = 0;
  let taxableGratuity = 0;

  if (isGovernment) {
    taxFreeGratuity = gratuityAmount;
    taxableGratuity = 0;
  } else {
    const taxFreeLimit = GRATUITY_CONFIG.statutoryRules.sec10_10_taxFreeCeiling; // ₹20 Lakhs
    taxFreeGratuity = Math.min(gratuityAmount, taxFreeLimit);
    taxableGratuity = Math.max(0, gratuityAmount - taxFreeLimit);
  }

  const estimatedTaxOnGratuity = Math.round(taxableGratuity * (marginalTaxRate / 100));
  const netPostTaxGratuity = Math.max(0, gratuityAmount - estimatedTaxOnGratuity);

  return {
    gratuityAmount,
    roundedYears,
    denominator,
    taxFreeGratuity,
    taxableGratuity,
    estimatedTaxOnGratuity,
    netPostTaxGratuity,
  };
}

/**
 * Pure Binary Search Solver for Required Last Drawn Basic Salary
 */
function solveRequiredBasicSalaryInternal({
  targetGratuity,
  tenureYears,
  tenureMonths,
  coverageType,
  isDisabilityWaiver,
}) {
  if (targetGratuity <= 0) return 0;

  let low = 1000;
  let high = 5000000; // ₹50 Lakhs max search space
  let bestBasic = high;

  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const sim = runGratuitySimulation({
      lastDrawnBasic: mid,
      tenureYears,
      tenureMonths,
      coverageType,
      isEligible: true,
      marginalTaxRate: 30,
    });

    if (Math.abs(sim.gratuityAmount - targetGratuity) < 10) {
      bestBasic = mid;
      break;
    }

    if (sim.gratuityAmount < targetGratuity) {
      low = mid;
    } else {
      high = mid;
      bestBasic = mid;
    }
  }

  return Math.round(bestBasic);
}

function computeGratuityHealthScore(isEligible, gratuityAmount, taxFreeGratuity) {
  if (!isEligible) return 20;

  let score = 70;
  if (gratuityAmount >= 1000000) score += 20;
  else if (gratuityAmount >= 500000) score += 10;

  if (taxFreeGratuity === gratuityAmount) score += 10; // 100% tax free bonus

  return Math.min(100, Math.max(0, Math.round(score)));
}

function createZeroBasicResult(numYears, numMonths, coverageType) {
  return {
    lastDrawnBasic: 0,
    tenureYears: numYears,
    tenureMonths: numMonths,
    coverageType,
    isDisabilityWaiver: false,
    annualSalaryIncrease: 5,
    marginalTaxRate: 30,
    calculationMode: 'forward',
    targetGratuity: 0,
    inflationRate: 6,
    primaryOutput: 0,
    gratuityAmount: 0,
    isEligible: false,
    roundedYears: numYears,
    denominator: coverageType === 'non_covered' ? 30 : 26,
    taxFreeLimit: 2000000,
    taxFreeGratuity: 0,
    taxableGratuity: 0,
    estimatedTaxOnGratuity: 0,
    netPostTaxGratuity: 0,
    isCeilingBreached: false,
    realValue: 0,
    careerSimulators: [],
    tenureScenarios: [],
    heroText: 'Please enter a valid last drawn basic salary to compute your gratuity entitlement.',
    score: 0,
    healthStatus: 'Zero Salary Input',
  };
}