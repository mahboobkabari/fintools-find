/**
 * Pure Mathematical & Regulatory Utility Functions for National Pension System (NPS)
 *
 * Implements PFRDA guidelines, Income Tax Act provisions (Sec 80CCD(1), 80CCD(1B), 80CCD(2), Sec 10(12A)),
 * and asset allocation compounding models.
 */

/**
 * Calculates weighted annual return rate for NPS Active/Auto Choice allocations
 *
 * @param {Object} alloc - Allocation percentages { e: number, c: number, g: number, a: number }
 * @param {Object} returns - Expected return rates % p.a. { e: number, c: number, g: number, a: number }
 * @returns {number} Weighted annual expected return rate (% p.a.)
 */
export function calculateNpsAssetReturn(
  alloc = { e: 50, c: 30, g: 20, a: 0 },
  returns = { e: 12.0, c: 9.0, g: 7.5, a: 10.0 }
) {
  const e = Math.max(0, Math.min(75, Number(alloc.e) || 0));
  const c = Math.max(0, Math.min(100, Number(alloc.c) || 0));
  const g = Math.max(0, Math.min(100, Number(alloc.g) || 0));
  const a = Math.max(0, Math.min(5, Number(alloc.a) || 0));

  const totalAlloc = e + c + g + a;
  if (totalAlloc === 0) return returns.g || 7.5;

  const normE = e / totalAlloc;
  const normC = c / totalAlloc;
  const normG = g / totalAlloc;
  const normA = a / totalAlloc;

  const weightedReturn =
    normE * (returns.e || 12.0) +
    normC * (returns.c || 9.0) +
    normG * (returns.g || 7.5) +
    normA * (returns.a || 10.0);

  return Number(weightedReturn.toFixed(2));
}

/**
 * Calculates actual incremental tax benefit under Old vs New Tax Regime for NPS contributions
 *
 * @param {Object} params
 * @param {'old'|'new'} params.taxRegime - Selected Tax Regime
 * @param {number} params.marginalTaxRatePct - User's marginal tax bracket % (e.g. 5, 10, 15, 20, 30)
 * @param {number} params.annualSelfContribution - User's annual self contribution to Tier 1 (₹)
 * @param {number} params.annualEmployerContribution - Employer's annual contribution (₹)
 * @param {number} [params.basicSalary=0] - Annual Basic Salary + DA (₹) for Sec 80CCD(2) 14% cap check
 * @returns {Object} Tax savings breakdown
 */
export function calculateNpsTaxSavings(params = {}) {
  const {
    taxRegime = 'old',
    marginalTaxRatePct = 30,
    annualSelfContribution = 50000,
    annualEmployerContribution = 0,
    basicSalary = 0,
  } = params;

  const marginalRate = Math.max(0, Math.min(30, Number(marginalTaxRatePct) || 0)) / 100;
  const cessMultiplier = 1.04; // 4% Health & Education Cess

  const selfContrib = Math.max(0, Number(annualSelfContribution) || 0);
  const empContrib = Math.max(0, Number(annualEmployerContribution) || 0);
  const salary = Math.max(0, Number(basicSalary) || 0);

  let eligible80CCD1B = 0;
  let eligible80CCD2 = 0;

  if (taxRegime === 'old') {
    // Old Tax Regime: Sec 80CCD(1B) up to ₹50,000 extra
    eligible80CCD1B = Math.min(50000, selfContrib);

    // Employer Contribution u/s 80CCD(2) up to 14% of Basic Salary
    const max80CCD2 = salary > 0 ? salary * 0.14 : empContrib;
    eligible80CCD2 = Math.min(empContrib, max80CCD2 > 0 ? max80CCD2 : empContrib);
  } else {
    // New Tax Regime (u/s 115BAC): Sec 80CCD(1B) is NOT available
    eligible80CCD1B = 0;

    // Employer Contribution u/s 80CCD(2) up to 14% is ELIGIBLE under New Regime!
    const max80CCD2 = salary > 0 ? salary * 0.14 : empContrib;
    eligible80CCD2 = Math.min(empContrib, max80CCD2 > 0 ? max80CCD2 : empContrib);
  }

  const totalEligibleDeduction = eligible80CCD1B + eligible80CCD2;
  const annualTaxSaved = Math.round(totalEligibleDeduction * marginalRate * cessMultiplier);

  return {
    taxRegime,
    eligible80CCD1B,
    eligible80CCD2,
    totalEligibleDeduction,
    marginalTaxRatePct,
    annualTaxSaved,
  };
}
