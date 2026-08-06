/**
 * Gratuity Calculator Math Engine (Payment of Gratuity Act, 1972)
 * Computes statutory gratuity amount, 5-year eligibility threshold, and Section 10(10) ₹20 Lakh tax exemption limit.
 *
 * @param {Object} inputs
 * @param {number} [inputs.lastDrawnBasic=50000] - Last drawn monthly Basic Salary + DA in Rupees (₹)
 * @param {number} [inputs.tenureYears=15] - Completed years of continuous service
 * @param {number} [inputs.tenureMonths=7] - Additional months of service (0 to 11 months)
 * @param {boolean|string} [inputs.isCoveredUnderAct=true] - Covered under Payment of Gratuity Act (15/26 rule) vs Non-covered (15/30 rule)
 * @returns {{ primaryOutput: number, isEligible: boolean, roundedYears: number, lastDrawnBasic: number, gratuityAmount: number, taxFreeGratuity: number, taxableGratuity: number }}
 */
export function calculateGratuityCalculator(inputs = {}) {
  const lastDrawnBasic = inputs.lastDrawnBasic ?? 50000;
  const tenureYears = inputs.tenureYears ?? 15;
  const tenureMonths = inputs.tenureMonths ?? 7;
  const isCoveredUnderAct = inputs.isCoveredUnderAct ?? true;

  const numBasic = Math.max(0, Number(lastDrawnBasic));
  const numYears = Math.max(0, Number(tenureYears));
  const numMonths = Math.max(0, Math.min(11, Number(tenureMonths)));
  const isCoveredBool =
    isCoveredUnderAct === true || isCoveredUnderAct === 'true' || isCoveredUnderAct === 'yes';

  // Months >= 6 round UP to 1 full year for covered employees
  const roundedYears = isCoveredBool
    ? numYears + (numMonths >= 6 ? 1 : 0)
    : numYears;

  // Minimum 5 years (or 4 yrs 240 days) continuous service required
  const totalMonths = numYears * 12 + numMonths;
  const isEligible = totalMonths >= 54; // ~4.5+ yrs threshold for 5-year coverage

  let gratuityAmount = 0;
  if (isEligible) {
    const denominator = isCoveredBool ? 26 : 30;
    gratuityAmount = Math.round((15 / denominator) * numBasic * roundedYears);
  }

  const taxFreeLimit = 2000000; // Section 10(10) ₹20 Lakh statutory tax exemption ceiling
  const taxFreeGratuity = Math.min(gratuityAmount, taxFreeLimit);
  const taxableGratuity = Math.max(0, gratuityAmount - taxFreeLimit);

  return {
    primaryOutput: gratuityAmount,
    isEligible,
    roundedYears,
    lastDrawnBasic: Math.round(numBasic),
    gratuityAmount,
    taxFreeGratuity,
    taxableGratuity,
  };
}