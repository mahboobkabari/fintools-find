import {
  corpusProjection,
  monthlyPensionEstimate,
  annuityCalculation,
  inflationAdjustedCorpus,
  retirementReplacementRatio,
} from '../core/retirementUtils.js';
import { realReturn, wealthMultiplier } from '../core/investmentUtils.js';

/**
 * Flagship NPS Retirement Decision Engine (Math Engine V2)
 *
 * @param {Object} inputs
 * @param {number} inputs.monthlyInvestment - Monthly NPS contribution (₹)
 * @param {number} inputs.currentAge - Current age
 * @param {number} inputs.retirementAge - Target retirement age (default 60)
 * @param {number} inputs.expectedReturn - Expected annual investment growth rate (%)
 * @param {number} inputs.annuityPercent - % of corpus used to purchase annuity (min 40%)
 * @param {number} inputs.expectedAnnuityRate - Annuity return rate (%)
 * @param {number} inputs.inflationRate - Expected annual inflation (%)
 * @param {number} inputs.currentMonthlyIncome - Current net monthly salary (₹)
 */
export function calculateNpsCalculator(inputs = {}) {
  const {
    monthlyInvestment = 10000,
    currentAge = 30,
    retirementAge = 60,
    expectedReturn = 10,
    annuityPercent = 40,
    expectedAnnuityRate = 6,
    inflationRate = 6,
    currentMonthlyIncome = 50000,
  } = inputs;

  const monthly = Math.max(500, Number(monthlyInvestment) || 500);
  const age = Math.max(18, Math.min(59, Number(currentAge) || 30));
  const retAge = Math.max(age + 1, Math.min(70, Number(retirementAge) || 60));
  const rate = Math.max(1, Number(expectedReturn) || 10);
  const annPct = Math.max(40, Math.min(100, Number(annuityPercent) || 40));
  const annRate = Math.max(1, Number(expectedAnnuityRate) || 6);
  const infRate = Math.max(0, Number(inflationRate) || 6);
  const income = Math.max(1, Number(currentMonthlyIncome) || 50000);

  const yearsInvested = retAge - age;

  // 1. Core Corpus Projection
  const projection = corpusProjection({
    monthlyContribution: monthly,
    annualRate: rate,
    tenureYears: yearsInvested,
  });

  const totalMaturityCorpus = projection.corpus;
  const totalInvestment = projection.totalContribution;
  const interestEarned = projection.wealthGain;

  // 2. Annuity & Lump Sum Split
  const annuity = annuityCalculation(totalMaturityCorpus, annPct);
  const annuityCorpus = annuity.annuityCorpus;
  const lumpSumAmount = annuity.lumpSum;

  // 3. Monthly Pension Estimate
  const monthlyPension = monthlyPensionEstimate(annuityCorpus, annRate);

  // 4. Inflation Adjusted Values
  const inflAdj = inflationAdjustedCorpus(totalMaturityCorpus, infRate, yearsInvested);
  const inflAdjPension = inflationAdjustedCorpus(monthlyPension * 12, infRate, yearsInvested);
  const realPensionMonthly = Math.round(inflAdjPension.realValue / 12);

  // 5. Replacement Ratio
  const replacementRatio = retirementReplacementRatio(monthlyPension, income);

  // 6. Wealth Multiplier & Real Return
  const multiplier = wealthMultiplier(totalMaturityCorpus, totalInvestment);
  const netRealRet = realReturn(rate, infRate);

  // 7. Retirement Readiness Score (0 - 100)
  let readinessScore = 50;
  if (replacementRatio >= 60) readinessScore += 25;
  else if (replacementRatio >= 40) readinessScore += 15;
  else if (replacementRatio >= 20) readinessScore += 5;
  if (yearsInvested >= 25) readinessScore += 15;
  else if (yearsInvested >= 15) readinessScore += 8;
  if (netRealRet > 3) readinessScore += 10;
  readinessScore = Math.max(10, Math.min(100, Math.round(readinessScore)));

  let readinessStatus = 'On Track';
  let readinessColor = 'text-semantic-success';
  let readinessDesc = `Your pension replaces ${replacementRatio}% of current income. Retirement corpus is growing well.`;

  if (readinessScore >= 60 && readinessScore < 80) {
    readinessStatus = 'Moderate';
    readinessColor = 'text-accent-sky';
    readinessDesc = `Your pension replaces ${replacementRatio}% of current income. Consider increasing contributions for better coverage.`;
  } else if (readinessScore >= 40 && readinessScore < 60) {
    readinessStatus = 'Needs Attention';
    readinessColor = 'text-accent-amber';
    readinessDesc = `Your pension covers only ${replacementRatio}% of income. Increase contributions or extend your investment horizon.`;
  } else if (readinessScore < 40) {
    readinessStatus = 'Underfunded';
    readinessColor = 'text-semantic-danger';
    readinessDesc = `Your pension replaces only ${replacementRatio}% of income. Significantly increase monthly contributions.`;
  }

  // 8. Increase Contribution Simulator (+₹2K, +₹5K, +₹10K)
  const increaseScenarios = [2000, 5000, 10000]
    .filter((delta) => monthly + delta <= 200000)
    .map((delta) => {
      const newProj = corpusProjection({ monthlyContribution: monthly + delta, annualRate: rate, tenureYears: yearsInvested });
      const newAnn = annuityCalculation(newProj.corpus, annPct);
      const newPension = monthlyPensionEstimate(newAnn.annuityCorpus, annRate);
      return {
        delta,
        newCorpus: newProj.corpus,
        corpusGain: newProj.corpus - totalMaturityCorpus,
        newPension,
        pensionGain: newPension - monthlyPension,
      };
    });

  // 9. Delay Retirement Simulator (+3 yrs, +5 yrs)
  const delayScenarios = [3, 5]
    .filter((dy) => retAge + dy <= 70)
    .map((dy) => {
      const newProj = corpusProjection({ monthlyContribution: monthly, annualRate: rate, tenureYears: yearsInvested + dy });
      const newAnn = annuityCalculation(newProj.corpus, annPct);
      const newPension = monthlyPensionEstimate(newAnn.annuityCorpus, annRate);
      return {
        delayYears: dy,
        newRetAge: retAge + dy,
        newCorpus: newProj.corpus,
        corpusGain: newProj.corpus - totalMaturityCorpus,
        newPension,
        pensionGain: newPension - monthlyPension,
      };
    });

  // 10. Return Sensitivity (Conservative -2%, Expected, Optimistic +2%)
  const scenarioRates = [Math.max(1, rate - 2), rate, rate + 2];
  const returnScenarios = scenarioRates.map((r) => {
    const proj = corpusProjection({ monthlyContribution: monthly, annualRate: r, tenureYears: yearsInvested });
    const ann = annuityCalculation(proj.corpus, annPct);
    const pen = monthlyPensionEstimate(ann.annuityCorpus, annRate);
    return { rate: r, corpus: proj.corpus, pension: pen };
  });

  // 11. Smart Ranked Recommendations
  const incScen = increaseScenarios.find((s) => s.delta === 5000) || increaseScenarios[0];
  const delScen = delayScenarios[0];

  const recommendations = [
    incScen && {
      rank: 1,
      title: `Increase Contribution by ₹${(incScen.delta).toLocaleString('en-IN')}/mo`,
      savings: incScen.corpusGain,
      action: `Adds ₹${incScen.corpusGain.toLocaleString('en-IN')} to your retirement corpus and boosts monthly pension by ₹${incScen.pensionGain.toLocaleString('en-IN')}.`,
    },
    delScen && {
      rank: 2,
      title: `Delay Retirement by ${delScen.delayYears} Years`,
      savings: delScen.corpusGain,
      action: `Retiring at ${delScen.newRetAge} instead of ${retAge} adds ₹${delScen.corpusGain.toLocaleString('en-IN')} to your corpus.`,
    },
    {
      rank: 3,
      title: 'Maximise NPS Tax Benefit (80CCD)',
      savings: Math.round(monthly * 12 * 0.3),
      action: `NPS contributions up to ₹50,000/yr are deductible under 80CCD(1B) — potential tax saving of ₹${Math.round(Math.min(monthly * 12, 50000) * 0.3).toLocaleString('en-IN')}.`,
    },
  ].filter(Boolean).sort((a, b) => b.savings - a.savings);

  // 12. Hero Decision Text
  const heroText = `Investing ₹${monthly.toLocaleString('en-IN')}/mo for ${yearsInvested} years builds a ₹${totalMaturityCorpus.toLocaleString('en-IN')} retirement corpus with ₹${monthlyPension.toLocaleString('en-IN')}/mo pension.`;

  // 13. Every ₹100 invested grows to ₹X
  const growthPer100 = totalInvestment > 0 ? Math.round((totalMaturityCorpus / totalInvestment) * 100) : 100;

  return {
    monthlyInvestment: monthly,
    currentAge: age,
    retirementAge: retAge,
    expectedReturn: rate,
    annuityPercent: annPct,
    expectedAnnuityRate: annRate,
    inflationRate: infRate,
    yearsInvested,
    totalInvestment,
    interestEarned,
    totalMaturityCorpus,
    annuityCorpus,
    lumpSumAmount,
    monthlyPension,
    realPensionMonthly,
    inflationAdjusted: inflAdj,
    replacementRatio,
    multiplier,
    realReturn: netRealRet,
    growthPer100,
    readinessScore,
    readinessStatus,
    readinessColor,
    readinessDesc,
    increaseScenarios,
    delayScenarios,
    returnScenarios,
    recommendations,
    heroText,
    yearlyBreakdown: projection.yearlyBreakdown,
  };
}