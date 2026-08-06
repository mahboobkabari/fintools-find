/**
 * Pension Calculator Math Engine
 * Computes monthly pension payouts, annual pension income, and total guaranteed lifetime annuity returns based on pension corpus and annuity rate.
 *
 * @param {Object} inputs
 * @param {number} [inputs.pensionCorpus=500000] - Total lump sum pension corpus ($ or ₹)
 * @param {number} [inputs.annuityRate=6.5] - Expected annual annuity payout rate (%)
 * @param {number} [inputs.guaranteeYears=20] - Guaranteed annuity payout period in years (or life expectancy)
 * @returns {{ primaryOutput: number, pensionCorpus: number, annuityRate: number, monthlyPension: number, annualPension: number, totalGuaranteedPayout: number, guaranteeYears: number }}
 */
export function calculatePensionCalculator(inputs = {}) {
  const pensionCorpus = inputs.pensionCorpus ?? 500000;
  const annuityRate = inputs.annuityRate ?? 6.5;
  const guaranteeYears = inputs.guaranteeYears ?? 20;

  const numCorpus = Math.max(0, Number(pensionCorpus));
  const numRate = Math.max(0.1, Number(annuityRate));
  const numYears = Math.max(1, Number(guaranteeYears));

  const annualPension = Math.round(numCorpus * (numRate / 100));
  const monthlyPension = Math.round(annualPension / 12);
  const totalGuaranteedPayout = Math.round(annualPension * numYears);

  return {
    primaryOutput: monthlyPension,
    pensionCorpus: Math.round(numCorpus),
    annuityRate: numRate,
    monthlyPension,
    annualPension,
    totalGuaranteedPayout,
    guaranteeYears: numYears,
  };
}