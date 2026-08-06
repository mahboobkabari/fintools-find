/**
 * FIRE Calculator (Financial Independence, Retire Early) Math Engine
 * Computes Trinity Study 4% Safe Withdrawal Target FI Number, projected portfolio accumulation, and FIRE readiness status.
 *
 * @param {Object} inputs
 * @param {number} [inputs.currentAge=30] - Current age in years
 * @param {number} [inputs.targetFireAge=45] - Desired FIRE retirement age in years
 * @param {number} [inputs.annualExpenses=40000] - Current annual living expenses ($)
 * @param {number} [inputs.currentPortfolio=100000] - Existing investment portfolio ($)
 * @param {number} [inputs.annualSavings=30000] - Annual investment contribution savings ($)
 * @param {number} [inputs.swrPercent=4] - Safe Withdrawal Rate (Standard Trinity Study rule is 4%)
 * @param {number} [inputs.inflationRate=3] - Expected annual inflation rate (%)
 * @param {number} [inputs.expectedReturn=8] - Expected annual investment growth (%)
 * @returns {{ primaryOutput: number, yearsToFire: number, futureAnnualExpenses: number, targetFireCorpus: number, projectedPortfolio: number, fireSurplusOrDeficit: number, isFireAchieved: boolean }}
 */
export function calculateFireCalculator(inputs = {}) {
  const currentAge = inputs.currentAge ?? 30;
  const targetFireAge = inputs.targetFireAge ?? 45;
  const annualExpenses = inputs.annualExpenses ?? 40000;
  const currentPortfolio = inputs.currentPortfolio ?? 100000;
  const annualSavings = inputs.annualSavings ?? 30000;
  const swrPercent = inputs.swrPercent ?? 4;
  const inflationRate = inputs.inflationRate ?? 3;
  const expectedReturn = inputs.expectedReturn ?? 8;

  const numCurrentAge = Math.max(18, Number(currentAge));
  const numFireAge = Math.max(numCurrentAge + 1, Number(targetFireAge));
  const numExpenses = Math.max(0, Number(annualExpenses));
  const numPortfolio = Math.max(0, Number(currentPortfolio));
  const numSavings = Math.max(0, Number(annualSavings));
  const numSwr = Math.max(1, Number(swrPercent));
  const numInf = Math.max(0, Number(inflationRate));
  const numReturn = Math.max(0, Number(expectedReturn));

  const yearsToFire = numFireAge - numCurrentAge;

  // Inflation-adjusted living expenses at FIRE age
  const futureAnnualExpenses = numExpenses * Math.pow(1 + numInf / 100, yearsToFire);

  // Target FIRE Corpus (FI Number) using SWR multiplier
  const targetFireCorpus = futureAnnualExpenses / (numSwr / 100);

  // Simulate annual portfolio accumulation
  let runningPortfolio = numPortfolio;
  for (let yr = 0; yr < yearsToFire; yr++) {
    runningPortfolio = (runningPortfolio + numSavings) * (1 + numReturn / 100);
  }

  const projectedPortfolio = Math.round(runningPortfolio);
  const roundedTargetCorpus = Math.round(targetFireCorpus);
  const fireSurplusOrDeficit = projectedPortfolio - roundedTargetCorpus;
  const isFireAchieved = fireSurplusOrDeficit >= 0;

  return {
    primaryOutput: roundedTargetCorpus,
    yearsToFire,
    futureAnnualExpenses: Math.round(futureAnnualExpenses),
    targetFireCorpus: roundedTargetCorpus,
    projectedPortfolio,
    fireSurplusOrDeficit,
    isFireAchieved,
  };
}