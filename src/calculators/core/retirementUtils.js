/**
 * Shared Retirement Planning Mathematics & Utility Functions
 * Reusable across NPS, Retirement Corpus, Pension, FIRE, Provident Fund, and Goal Planner calculators.
 */

/**
 * SIP-style Corpus Projection (Monthly Contribution → Future Corpus)
 * FV = P × [((1+i)^n − 1) / i] × (1+i)
 */
export function corpusProjection({
  monthlyContribution = 10000,
  annualRate = 10,
  tenureYears = 30,
} = {}) {
  const p = Math.max(0, Number(monthlyContribution) || 0);
  const r = Math.max(0, Number(annualRate) || 0);
  const t = Math.max(1, Number(tenureYears) || 1);
  const n = t * 12;
  const i = Math.pow(1 + r / 100, 1 / 12) - 1;

  const totalContribution = p * n;

  let corpus = 0;
  if (i > 0 && p > 0) {
    corpus = Math.round(p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i));
  } else {
    corpus = Math.round(totalContribution);
  }

  const wealthGain = Math.max(0, corpus - totalContribution);

  // Year-by-year growth schedule
  const yearlyBreakdown = [];
  let bal = 0;
  let cumInvested = 0;
  for (let m = 1; m <= n; m++) {
    bal = (bal + p) * (1 + i);
    cumInvested += p;
    if (m % 12 === 0) {
      yearlyBreakdown.push({
        year: m / 12,
        invested: Math.round(cumInvested),
        returns: Math.max(0, Math.round(bal) - Math.round(cumInvested)),
        totalValue: Math.round(bal),
      });
    }
  }

  return {
    corpus,
    totalContribution: Math.round(totalContribution),
    wealthGain: Math.round(wealthGain),
    yearlyBreakdown,
  };
}

/**
 * Monthly Pension Estimate from Annuity Corpus
 * Monthly Pension = (Annuity Corpus × Annuity Rate%) / 12
 */
export function monthlyPensionEstimate(annuityCorpus = 0, annuityRate = 6) {
  const corpus = Math.max(0, Number(annuityCorpus) || 0);
  const rate = Math.max(0, Number(annuityRate) || 0) / 100;
  return Math.round((corpus * rate) / 12);
}

/**
 * Annuity Split Calculation (Lump Sum + Annuity Corpus)
 */
export function annuityCalculation(totalCorpus = 0, annuityPercent = 40) {
  const corpus = Math.max(0, Number(totalCorpus) || 0);
  const pct = Math.max(0, Math.min(100, Number(annuityPercent) || 40));

  const annuityCorpus = Math.round(corpus * (pct / 100));
  const lumpSum = Math.round(corpus - annuityCorpus);

  return { annuityCorpus, lumpSum, annuityPercent: pct };
}

/**
 * Inflation-Adjusted Retirement Corpus (Real purchasing power at retirement)
 */
export function inflationAdjustedCorpus(corpus = 0, inflationRate = 6, tenureYears = 30) {
  const c = Math.max(0, Number(corpus) || 0);
  const inf = Math.max(0, Number(inflationRate) || 0) / 100;
  const t = Math.max(1, Number(tenureYears) || 1);

  const realValue = Math.round(c / Math.pow(1 + inf, t));
  const purchasingPowerLoss = Math.max(0, c - realValue);

  return { realValue, purchasingPowerLoss };
}

/**
 * Retirement Income Replacement Ratio
 * What percentage of current monthly income will the pension replace?
 */
export function retirementReplacementRatio(monthlyPension = 0, currentMonthlyIncome = 50000) {
  const pension = Math.max(0, Number(monthlyPension) || 0);
  const income = Math.max(1, Number(currentMonthlyIncome) || 1);
  return Number(((pension / income) * 100).toFixed(1));
}
