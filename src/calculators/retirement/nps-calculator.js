import { calculateNpsAssetReturn, calculateNpsTaxSavings } from '../core/npsUtils.js';

/**
 * Flagship National Pension System (NPS) Decision Engine
 *
 * Implements PFRDA exit guidelines, Section 10(12A) tax-free lump sum rules,
 * Section 80CCD(1B) and 80CCD(2) tax deduction logic under Old & New Tax Regimes,
 * Active/Auto choice asset class return weighting, and annuity pension models.
 *
 * @param {Object} inputs
 * @param {number} [inputs.currentAge=30] - Current subscriber age (18 to 70 years)
 * @param {number} [inputs.planningRetirementAge=60] - Planned exit/retirement age (years)
 * @param {number} [inputs.monthlyContribution=5000] - Monthly self-contribution to NPS Tier 1 (₹)
 * @param {number} [inputs.currentCorpus=100000] - Existing accumulated NPS Tier 1 corpus (₹)
 * @param {number} [inputs.expectedReturnRate=10.0] - Expected annual return (% p.a.) if manual
 * @param {'active'|'auto'} [inputs.allocationMode='active'] - Asset Allocation Strategy
 * @param {number} [inputs.equityPct=50] - Equity (Class E) allocation % (Max 75% up to age 50)
 * @param {number} [inputs.corporateDebtPct=30] - Corporate Debt (Class C) allocation %
 * @param {number} [inputs.govtBondsPct=20] - Government Securities (Class G) allocation %
 * @param {number} [inputs.annuityPurchasePct=40] - Percentage of corpus converted to Annuity (Min 40%, Max 100%)
 * @param {number} [inputs.annuityRatePct=6.0] - Illustrative annuity pension return rate (% p.a.)
 * @param {'old'|'new'} [inputs.taxRegime='old'] - Applicable Income Tax Regime
 * @param {number} [inputs.marginalTaxRatePct=30] - Subscriber's marginal tax bracket % (0, 5, 10, 15, 20, 30)
 * @param {number} [inputs.annualEmployerContribution=0] - Annual Employer Contribution u/s 80CCD(2) (₹)
 * @param {number} [inputs.basicSalary=0] - Annual Basic Salary + DA (₹) for 14% 80CCD(2) cap check
 */
export function calculateNps(inputs = {}) {
  const {
    currentAge = 30,
    planningRetirementAge = 60,
    monthlyContribution = 5000,
    currentCorpus = 100000,
    expectedReturnRate = 10.0,
    allocationMode = 'active',
    equityPct = 50,
    corporateDebtPct = 30,
    govtBondsPct = 20,
    annuityPurchasePct = 40,
    annuityRatePct = 6.0,
    taxRegime = 'old',
    marginalTaxRatePct = 30,
    annualEmployerContribution = 0,
    basicSalary = 0,
  } = inputs;

  // 1. BOUNDARY SAFETY & INPUT SANITIZATION
  const currAge = Math.max(18, Math.min(70, Number(currentAge) || 30));
  const retAge = Math.max(currAge + 1, Math.min(75, Number(planningRetirementAge) || 60));
  const yearsToRetirement = Math.max(1, retAge - currAge);
  const totalMonths = yearsToRetirement * 12;

  const mContrib = Math.max(0, Number(monthlyContribution) || 0);
  const existingCorpus = Math.max(0, Number(currentCorpus) || 0);

  // Asset Class Allocation & Return Weighting
  let effectiveReturnRate = Math.max(0, Number(expectedReturnRate) || 10.0);
  if (allocationMode === 'active') {
    // Active Choice Equity limit enforcement (Max 75% up to age 50, tapering down by 2.5%/yr)
    const maxAllowedEquity = currAge > 50 ? Math.max(50, 75 - (currAge - 50) * 2.5) : 75;
    const e = Math.min(maxAllowedEquity, Math.max(0, Number(equityPct) || 0));
    const c = Math.max(0, Number(corporateDebtPct) || 0);
    const g = Math.max(0, Number(govtBondsPct) || 0);

    effectiveReturnRate = calculateNpsAssetReturn(
      { e, c, g, a: 0 },
      { e: 12.0, c: 9.0, g: 7.5, a: 10.0 }
    );
  }

  // 2. CORPUS COMPOUNDING TRAJECTORY (Monthly Timing)
  const monthlyRate = effectiveReturnRate / 12 / 100;
  let balance = existingCorpus;
  let totalSelfInvested = existingCorpus + mContrib * totalMonths;

  for (let m = 1; m <= totalMonths; m++) {
    const interest = balance * monthlyRate;
    balance += interest + mContrib;
  }

  const totalAccumulatedCorpus = Math.round(balance);
  const totalWealthGained = Math.max(0, totalAccumulatedCorpus - totalSelfInvested);

  // 3. ANNUITY vs TAX-FREE LUMP-SUM WITHDRAWAL RULES (PFRDA & Sec 10(12A))
  // If total corpus <= ₹5 Lakhs, PFRDA permits 100% lump-sum withdrawal without compulsory annuity.
  const isSmallCorpusLumpSum = totalAccumulatedCorpus <= 500000;

  let actualAnnuityPct = isSmallCorpusLumpSum
    ? 0
    : Math.max(40, Math.min(100, Number(annuityPurchasePct) || 40));

  let lumpSumPct = 100 - actualAnnuityPct;

  const lumpSumAmount = Math.round(totalAccumulatedCorpus * (lumpSumPct / 100));
  const annuityAmount = Math.round(totalAccumulatedCorpus * (actualAnnuityPct / 100));

  const annRate = Math.max(0, Number(annuityRatePct) || 6.0);
  const annualAnnuityPension = Math.round(annuityAmount * (annRate / 100));
  const monthlyPension = Math.round(annualAnnuityPension / 12);

  // 4. TAX DEDUCTION & INCREMENTAL TAX BENEFIT (Sec 80CCD(1B) & Sec 80CCD(2))
  const annualSelfContribution = mContrib * 12;
  const taxSavings = calculateNpsTaxSavings({
    taxRegime,
    marginalTaxRatePct,
    annualSelfContribution,
    annualEmployerContribution,
    basicSalary,
  });

  // 5. SWR & PENSION SENSITIVITY MATRIX Across Annuity Rates (5.0%, 6.0%, 7.0%, 8.0%)
  const annuityRates = [5.0, 6.0, 7.0, 8.0];
  const annuityMatrix = annuityRates.map((r) => {
    const p = Math.round((annuityAmount * (r / 100)) / 12);
    return {
      rate: r,
      monthlyPension: p,
      annualPension: Math.round(annuityAmount * (r / 100)),
    };
  });

  // 6. HYPOTHETICAL SENSITIVITY SIMULATOR GRID
  const scenarios = [
    {
      name: 'Current NPS Plan (Baseline)',
      retAge,
      monthlyContribution: mContrib,
      effectiveReturnRate,
      annuityPurchasePct: actualAnnuityPct,
      totalCorpus: totalAccumulatedCorpus,
      lumpSumAmount,
      monthlyPension,
    },
    {
      name: '+20% Higher Contribution',
      retAge,
      monthlyContribution: Math.round(mContrib * 1.2),
      effectiveReturnRate,
      annuityPurchasePct: actualAnnuityPct,
      totalCorpus: Math.round(totalAccumulatedCorpus * 1.18),
      lumpSumAmount: Math.round(totalAccumulatedCorpus * 1.18 * (lumpSumPct / 100)),
      monthlyPension: Math.round(monthlyPension * 1.18),
    },
    {
      name: '50% Annuity Allocation',
      retAge,
      monthlyContribution: mContrib,
      effectiveReturnRate,
      annuityPurchasePct: 50,
      totalCorpus: totalAccumulatedCorpus,
      lumpSumAmount: Math.round(totalAccumulatedCorpus * 0.5),
      monthlyPension: Math.round((totalAccumulatedCorpus * 0.5 * (annRate / 100)) / 12),
    },
    {
      name: 'Conservative 8% Return',
      retAge,
      monthlyContribution: mContrib,
      effectiveReturnRate: 8.0,
      annuityPurchasePct: actualAnnuityPct,
      totalCorpus: Math.round(totalAccumulatedCorpus * 0.78),
      lumpSumAmount: Math.round(totalAccumulatedCorpus * 0.78 * (lumpSumPct / 100)),
      monthlyPension: Math.round(monthlyPension * 0.78),
    },
    {
      name: 'Delay Exit by 5 Years',
      retAge: retAge + 5,
      monthlyContribution: mContrib,
      effectiveReturnRate,
      annuityPurchasePct: actualAnnuityPct,
      totalCorpus: Math.round(totalAccumulatedCorpus * Math.pow(1 + effectiveReturnRate / 100, 5)),
      lumpSumAmount: Math.round(
        totalAccumulatedCorpus * Math.pow(1 + effectiveReturnRate / 100, 5) * (lumpSumPct / 100)
      ),
      monthlyPension: Math.round(
        monthlyPension * Math.pow(1 + effectiveReturnRate / 100, 5)
      ),
    },
  ];

  // 7. NPS READINESS SCORE (0-100)
  let npsScore = 40;
  if (taxSavings.annualTaxSaved > 0) npsScore += 20;
  if (effectiveReturnRate >= 10.0) npsScore += 20;
  if (totalAccumulatedCorpus >= 10000000) npsScore += 20;
  npsScore = Math.max(10, Math.min(100, npsScore));

  let scoreLabel = 'Building NPS Momentum';
  if (npsScore >= 80) scoreLabel = 'Optimal NPS Plan / High Tax Efficiency';
  else if (npsScore < 40) scoreLabel = 'Early Accumulation Phase';

  return {
    currentAge: currAge,
    planningRetirementAge: retAge,
    yearsToRetirement,
    monthlyContribution: mContrib,
    annualSelfContribution,
    annualEmployerContribution: Math.max(0, Number(annualEmployerContribution) || 0),
    currentCorpus: existingCorpus,
    effectiveReturnRate,
    allocationMode,
    totalAccumulatedCorpus,
    totalSelfInvested,
    totalWealthGained,
    isSmallCorpusLumpSum,
    annuityPurchasePct: actualAnnuityPct,
    lumpSumPct,
    lumpSumAmount,
    annuityAmount,
    annuityRatePct: annRate,
    annualAnnuityPension,
    monthlyPension,
    taxSavings,
    annuityMatrix,
    scenarios,
    npsScore,
    scoreLabel,
  };
}

// Backward compatibility export wrapper
export function calculateNpsCalculator(inputs = {}) {
  const res = calculateNps(inputs);
  return {
    ...res,
    targetCorpus: res.totalAccumulatedCorpus,
    lumpSumValue: res.lumpSumAmount,
    annuityValue: res.annuityAmount,
    monthlyPensionValue: res.monthlyPension,
    taxSaved: res.taxSavings.annualTaxSaved,
    primaryOutput: res.totalAccumulatedCorpus,
  };
}