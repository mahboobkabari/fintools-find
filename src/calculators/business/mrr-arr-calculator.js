/**
 * Flagship MRR / ARR, Net New MRR Waterfall & SaaS Revenue Intelligence Engine (Math Engine V2)
 * Supports Starting MRR, 5 Waterfall Streams (New, Expansion, Reactivation, Contraction, Churn),
 * Ending MRR, Run-Rate ARR, Net Revenue Retention (NRR), Gross Revenue Retention (GRR),
 * SaaS Quick Ratio, 12-Month Compound Trajectory Schedule, and ARR Valuation Multiples.
 * 
 * @param {Object} inputs
 * @param {number} [inputs.startingMrr=1000000] - Starting Monthly Recurring Revenue (MRR)
 * @param {number} [inputs.newMrr=150000] - Monthly revenue from new customer acquisitions
 * @param {number} [inputs.expansionMrr=80000] - Expansion & upsell revenue from existing customers
 * @param {number} [inputs.reactivationMrr=20000] - Reactivation revenue from churned customers returning
 * @param {number} [inputs.contractionMrr=30000] - Contraction & downgrade revenue losses
 * @param {number} [inputs.churnedMrr=40000] - Churned revenue from canceled accounts
 * @param {number} [inputs.valuationMultiple=8] - SaaS ARR Valuation Multiple (e.g. 6x, 8x, 10x)
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const DEFAULT_MRR_INPUTS = {
  startingMrr: 1000000,
  newMrr: 150000,
  expansionMrr: 80000,
  reactivationMrr: 20000,
  contractionMrr: 30000,
  churnedMrr: 40000,
  valuationMultiple: 8,
  currencySymbol: '₹',
};

export function calculateMrrArrCalculator(inputs = {}) {
  const merged = { ...DEFAULT_MRR_INPUTS, ...inputs };

  // 1. Input Sanitization & Clamping
  const rawStart = Number(merged.startingMrr);
  const startingMrr = isNaN(rawStart) ? 1000000 : Math.max(0, rawStart);

  const rawNew = Number(merged.newMrr);
  const newMrr = isNaN(rawNew) ? 150000 : Math.max(0, rawNew);

  const rawExp = Number(merged.expansionMrr);
  const expansionMrr = isNaN(rawExp) ? 80000 : Math.max(0, rawExp);

  const rawReact = Number(merged.reactivationMrr);
  const reactivationMrr = isNaN(rawReact) ? 20000 : Math.max(0, rawReact);

  const rawContr = Number(merged.contractionMrr);
  const contractionMrr = isNaN(rawContr) ? 30000 : Math.max(0, rawContr);

  const rawChurn = Number(merged.churnedMrr);
  const churnedMrr = isNaN(rawChurn) ? 40000 : Math.max(0, rawChurn);

  const rawMultiple = Number(merged.valuationMultiple);
  const valuationMultiple = isNaN(rawMultiple) ? 8 : Math.max(1, Math.min(100, rawMultiple));

  const currencySymbol = merged.currencySymbol || '₹';

  // 2. Waterfall Calculations
  const grossAdditions = newMrr + expansionMrr + reactivationMrr;
  const grossLosses = contractionMrr + churnedMrr;
  const netNewMrr = grossAdditions - grossLosses;
  const endingMrr = Math.max(0, startingMrr + netNewMrr);
  const runRateArr = endingMrr * 12;

  // 3. Growth Rates
  const netGrowthRatePct = startingMrr > 0 ? Math.round((netNewMrr / startingMrr) * 1000) / 10 : 0;
  const annualizedGrowthRatePct = startingMrr > 0
    ? Math.round((Math.pow(1 + netNewMrr / startingMrr, 12) - 1) * 1000) / 10
    : 0;

  // 4. SaaS Health Metrics: NRR, GRR & Quick Ratio
  const nrrPct = startingMrr > 0
    ? Math.round(((startingMrr + expansionMrr - contractionMrr - churnedMrr) / startingMrr) * 1000) / 10
    : 100;

  const grrPct = startingMrr > 0
    ? Math.round(((startingMrr - contractionMrr - churnedMrr) / startingMrr) * 1000) / 10
    : 100;

  const quickRatio = grossLosses > 0
    ? Math.round(((newMrr + expansionMrr) / grossLosses) * 100) / 100
    : (newMrr + expansionMrr > 0 ? Infinity : 1);

  // 5. Valuation Range
  const estimatedValuation = Math.round(runRateArr * valuationMultiple);
  const valuationBear = Math.round(runRateArr * Math.max(1, valuationMultiple * 0.7));
  const valuationBull = Math.round(runRateArr * valuationMultiple * 1.3);

  // 6. SaaS Health Rating
  let rating = 'HEALTHY';
  let ratingTitle = 'Strong Growth Engine (NRR > 100%, Quick Ratio > 2.0)';
  let ratingBadge = 'bg-semantic-success text-white';
  let ratingColor = 'text-semantic-success';

  if (quickRatio < 1.0 || netNewMrr < 0) {
    rating = 'CONTRACTING';
    ratingTitle = 'Net MRR Contraction (Losses > Additions)';
    ratingBadge = 'bg-rose-600 text-white';
    ratingColor = 'text-rose-600';
  } else if (quickRatio < 2.0 || nrrPct < 95) {
    rating = 'MODERATE';
    ratingTitle = 'Moderate Efficiency (High Churn Leakage)';
    ratingBadge = 'bg-amber-500 text-white';
    ratingColor = 'text-amber-600';
  } else if (quickRatio >= 4.0 && nrrPct >= 115) {
    rating = 'ELITE';
    ratingTitle = 'Elite Venture-Scale (NRR > 115%, Quick Ratio > 4.0)';
    ratingBadge = 'bg-indigo-600 text-white';
    ratingColor = 'text-indigo-600';
  }

  // 7. 12-Month Compound Forward Projection Schedule
  const monthlyCompoundRate = startingMrr > 0 ? Math.max(-0.5, Math.min(1.0, netNewMrr / startingMrr)) : 0;
  const forwardProjection = [];
  let currentProjMrr = endingMrr;

  for (let m = 1; m <= 12; m++) {
    currentProjMrr = Math.round(currentProjMrr * (1 + monthlyCompoundRate));
    const projArr = currentProjMrr * 12;
    forwardProjection.push({
      month: m,
      mrr: currentProjMrr,
      arr: projArr,
      impliedValuation: Math.round(projArr * valuationMultiple),
    });
  }

  // 8. Waterfall Stream Decomposition
  const waterfallItems = [
    { label: 'New Customer MRR', amount: newMrr, type: 'addition', colorClass: 'bg-primary' },
    { label: 'Expansion & Upsell MRR', amount: expansionMrr, type: 'addition', colorClass: 'bg-emerald-500' },
    { label: 'Reactivation MRR', amount: reactivationMrr, type: 'addition', colorClass: 'bg-indigo-500' },
    { label: 'Contraction & Downgrades', amount: contractionMrr, type: 'loss', colorClass: 'bg-amber-500' },
    { label: 'Churned Account Loss', amount: churnedMrr, type: 'loss', colorClass: 'bg-rose-500' },
  ];

  // 9. Smart Ranked Recommendations
  const recommendations = [
    {
      rank: 1,
      title: nrrPct >= 105 ? 'High Net Retention Expansion Power' : 'Expand Negative Churn & Account Expansion',
      savings: Math.round(startingMrr * 0.05),
      action: nrrPct >= 105
        ? `Your Net Revenue Retention (NRR) of ${nrrPct}% indicates healthy customer expansion exceeding churn loss. Your existing customer base grows organically.`
        : `Your NRR is ${nrrPct}% (below the 100% expansion threshold). Introduce seat-based expansion, premium add-ons, or usage tiers to achieve net negative churn.`,
    },
    {
      rank: 2,
      title: quickRatio >= 3.0 ? 'Exceptional Growth Velocity' : 'High Churn Drag Constraining Run-Rate ARR',
      savings: Math.round(grossLosses * 0.2),
      action: quickRatio >= 3.0
        ? `SaaS Quick Ratio is ${quickRatio}x. For every ${currencySymbol}1 lost to contraction and churn, you add ${currencySymbol}${quickRatio} in new and expansion revenue.`
        : `SaaS Quick Ratio is ${quickRatio}x. Monthly revenue leakage is ${currencySymbol}${grossLosses.toLocaleString()}. Prioritize proactive customer onboarding to cut churn in half.`,
    },
    {
      rank: 3,
      title: 'ARR Valuation Capitalization',
      savings: 0,
      action: `At ${currencySymbol}${runRateArr.toLocaleString()} Run-Rate ARR and a ${valuationMultiple}x multiple, estimated enterprise value is ${currencySymbol}${estimatedValuation.toLocaleString()} (Range: ${currencySymbol}${valuationBear.toLocaleString()} - ${currencySymbol}${valuationBull.toLocaleString()}).`,
    },
  ];

  // 10. Hero Verdict
  const heroText = `Ending MRR is ${currencySymbol}${endingMrr.toLocaleString()} with an annualized Run-Rate ARR of ${currencySymbol}${runRateArr.toLocaleString()}, generating ${currencySymbol}${netNewMrr.toLocaleString()} Net New MRR at a ${quickRatio}x SaaS Quick Ratio.`;

  return {
    primaryOutput: endingMrr,
    startingMrr,
    newMrr,
    expansionMrr,
    reactivationMrr,
    contractionMrr,
    churnedMrr,
    grossAdditions,
    grossLosses,
    netNewMrr,
    endingMrr,
    runRateArr,
    netGrowthRatePct,
    annualizedGrowthRatePct,
    nrrPct,
    grrPct,
    quickRatio,
    valuationMultiple,
    estimatedValuation,
    valuationBear,
    valuationBull,
    rating,
    ratingTitle,
    ratingBadge,
    ratingColor,
    waterfallItems,
    forwardProjection,
    recommendations,
    heroText,
    currencySymbol,
  };
}

export const calculateMrrArrTool = calculateMrrArrCalculator;
