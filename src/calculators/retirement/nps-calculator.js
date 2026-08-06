/**
 * NPS Calculator (National Pension System) Math Engine
 * Computes maturity corpus, 60% tax-free lump sum withdrawal, annuity purchase corpus, and estimated monthly pension.
 *
 * @param {Object} inputs
 * @param {number} [inputs.monthlyInvestment=10000] - Monthly NPS contribution in Rupees (₹)
 * @param {number} [inputs.currentAge=30] - Current age in years (retirement fixed at 60)
 * @param {number} [inputs.expectedReturn=10] - Expected annual investment growth rate (%)
 * @param {number} [inputs.annuityPercent=40] - Percentage of maturity corpus re-invested in Annuity (Min 40%, Max 100%)
 * @param {number} [inputs.expectedAnnuityRate=6] - Expected annual annuity rate (%)
 * @returns {{ primaryOutput: number, yearsInvested: number, totalInvestment: number, interestEarned: number, totalMaturityCorpus: number, annuityCorpus: number, lumpSumAmount: number, monthlyPension: number }}
 */
export function calculateNpsCalculator(inputs = {}) {
  const monthlyInvestment = inputs.monthlyInvestment ?? 10000;
  const currentAge = inputs.currentAge ?? 30;
  const expectedReturn = inputs.expectedReturn ?? 10;
  const annuityPercent = inputs.annuityPercent ?? 40;
  const expectedAnnuityRate = inputs.expectedAnnuityRate ?? 6;

  const numMonthlyInv = Math.max(500, Number(monthlyInvestment));
  const numCurrentAge = Math.max(18, Math.min(59, Number(currentAge)));
  const numReturn = Math.max(1, Number(expectedReturn));
  const numAnnuityPct = Math.max(40, Math.min(100, Number(annuityPercent)));
  const numAnnuityRate = Math.max(1, Number(expectedAnnuityRate));

  const yearsInvested = 60 - numCurrentAge;
  const totalMonths = yearsInvested * 12;

  const i = Math.pow(1 + numReturn / 100, 1 / 12) - 1;
  const totalInvestment = numMonthlyInv * totalMonths;

  // Compound future maturity corpus
  let totalMaturityCorpus = 0;
  if (i > 0) {
    totalMaturityCorpus =
      numMonthlyInv * ((Math.pow(1 + i, totalMonths) - 1) / i) * (1 + i);
  } else {
    totalMaturityCorpus = totalInvestment;
  }

  const interestEarned = Math.max(0, totalMaturityCorpus - totalInvestment);
  const annuityCorpus = totalMaturityCorpus * (numAnnuityPct / 100);
  const lumpSumAmount = Math.max(0, totalMaturityCorpus - annuityCorpus);

  // Monthly pension generated from annuity corpus
  const annualAnnuityIncome = annuityCorpus * (numAnnuityRate / 100);
  const monthlyPension = annualAnnuityIncome / 12;

  return {
    primaryOutput: Math.round(totalMaturityCorpus),
    yearsInvested,
    totalInvestment: Math.round(totalInvestment),
    interestEarned: Math.round(interestEarned),
    totalMaturityCorpus: Math.round(totalMaturityCorpus),
    annuityCorpus: Math.round(annuityCorpus),
    lumpSumAmount: Math.round(lumpSumAmount),
    monthlyPension: Math.round(monthlyPension),
  };
}