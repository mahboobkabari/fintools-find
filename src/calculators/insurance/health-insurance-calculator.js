/**
 * Health Insurance Premium & Coverage Needs Financial Engine
 * 
 * Pure financial engine for health coverage demand estimation, medical inflation compounding,
 * employer cover gap analysis, room-rent sub-limit proportionate deduction risk modeling,
 * co-payment impact, super top-up scenario optimization, and Section 80D statutory tax deduction calculation.
 */

// Statutory Section 80D Limits under Income Tax Act (Old Tax Regime)
export const STATUTORY_80D_LIMITS = {
  SELF_FAMILY_UNDER_60: 25000,
  SELF_FAMILY_SENIOR_60: 50000,
  PARENTS_UNDER_60: 25000,
  PARENTS_SENIOR_60: 50000,
  PREVENTIVE_CHECKUP_SUB_LIMIT: 5000,
  MAX_TOTAL_DEDUCTION: 100000,
};

/**
 * City Tier Baseline Critical Care Hospitalization Costs (Illustrative Assumption)
 */
export const CITY_TIER_BASELINES = {
  tier1: 1000000, // Tier-1 Metro (₹10 Lakhs baseline critical care cost)
  tier2: 700000,  // Tier-2 City (₹7 Lakhs baseline)
  tier3: 500000,  // Tier-3 / Semi-Urban (₹5 Lakhs baseline)
};

/**
 * Calculates inflation-adjusted health coverage demand based on family profile and city tier.
 */
export function calculateRecommendedHealthCover(inputs = {}) {
  const cityTier = inputs.cityTier || 'tier1';
  const baselineCost = CITY_TIER_BASELINES[cityTier] || CITY_TIER_BASELINES.tier1;

  const medicalInflationPercent = inputs.medicalInflationPercent !== undefined && inputs.medicalInflationPercent !== ''
    ? Math.max(0, Number(inputs.medicalInflationPercent) || 0)
    : 12; // Default 12% medical inflation

  const planningHorizonYears = inputs.planningHorizonYears !== undefined && inputs.planningHorizonYears !== ''
    ? Math.max(0, Number(inputs.planningHorizonYears) || 0)
    : 5; // Default 5 years horizon

  // Compounded future critical care cost
  const i = medicalInflationPercent / 100;
  const futureMedicalCost = baselineCost * Math.pow(1 + i, planningHorizonYears);

  // Household member multiplier buffers
  const numSpouse = inputs.hasSpouse ? 1 : 0;
  const numChildren = Math.max(0, Number(inputs.numChildren) || 0);
  const hasSeniorParents = Boolean(inputs.hasSeniorParents);
  const numParents = Math.max(0, Number(inputs.numParents) || 0);

  // Incremental coverage multipliers
  let familyMultiplier = 1.0;
  if (numSpouse > 0) familyMultiplier += 0.3;
  familyMultiplier += numChildren * 0.15;
  if (hasSeniorParents || numParents > 0) {
    familyMultiplier += (numParents || 1) * 0.4;
  }

  const rawDemand = futureMedicalCost * familyMultiplier;
  // Round to nearest ₹50,000 for standard policy sum insured tiers
  const recommendedSumInsured = Math.ceil(rawDemand / 50000) * 50000;

  return {
    baselineCost,
    futureMedicalCost: Math.round(futureMedicalCost),
    medicalInflationPercent,
    planningHorizonYears,
    familyMultiplier,
    recommendedSumInsured,
  };
}

/**
 * Calculates additional coverage gap after accounting for existing employer/group health insurance.
 */
export function calculateEmployerCoverGap(recommendedSumInsured, existingEmployerCover = 0) {
  const numCover = Math.max(0, Number(existingEmployerCover) || 0);
  const rawGap = recommendedSumInsured - numCover;
  const additionalGap = Math.max(0, rawGap);

  return {
    recommendedSumInsured,
    existingEmployerCover: numCover,
    additionalGap,
    isFullyCoveredByEmployer: numCover >= recommendedSumInsured,
  };
}

/**
 * Models Base Policy + Super Top-Up combination scenario.
 */
export function calculateSuperTopUpOptimization(coverageTarget = 1500000) {
  const target = Math.max(500000, Number(coverageTarget) || 1500000);
  
  // Standard recommended split: ₹5 Lakhs Base Cover + Super Top-Up for balance
  const baseCover = Math.min(500000, target);
  const superTopUpCover = Math.max(0, target - baseCover);
  const deductible = baseCover;

  // Illustrative premium estimation rules (₹ per ₹1 Lakh cover)
  // Base cover premium is approx ₹2,000 per ₹1L; Super Top-Up is approx ₹400 per ₹1L due to deductible
  const estBasePremium = Math.round((baseCover / 100000) * 2000);
  const estTopUpPremium = Math.round((superTopUpCover / 100000) * 400);
  const totalCombinedPremium = estBasePremium + estTopUpPremium;

  // Single base policy premium equivalent
  const estSingleBasePremium = Math.round((target / 100000) * 1500);
  const illustrativeSavings = Math.max(0, estSingleBasePremium - totalCombinedPremium);

  return {
    targetCoverage: target,
    baseCover,
    superTopUpCover,
    deductible,
    estBasePremium,
    estTopUpPremium,
    totalCombinedPremium,
    estSingleBasePremium,
    illustrativeSavings,
  };
}

/**
 * Calculates Section 80D statutory tax deduction limits and tax savings under Income Tax Act.
 */
export function calculateSection80DSavings(inputs = {}) {
  const taxRegime = inputs.taxRegime || 'old'; // 'old' vs 'new'
  const isSelfSenior = Boolean(inputs.isSelfSenior);
  const hasSeniorParents = Boolean(inputs.hasSeniorParents);
  const hasParents = Boolean(inputs.hasParents) || hasSeniorParents;
  const marginalTaxRatePercent = Math.max(0, Number(inputs.marginalTaxRatePercent) || 30);

  // Section 80D is only available under Old Tax Regime
  if (taxRegime === 'new') {
    return {
      taxRegime: 'new',
      isEligible: false,
      selfDeductionLimit: 0,
      parentsDeductionLimit: 0,
      totalStatutoryLimit: 0,
      estimatedTaxSavings: 0,
      noticeMessage: 'Section 80D tax deduction is not available under the New Tax Regime (Sec 115BAC). It applies under the Old Tax Regime.',
    };
  }

  // Old Tax Regime Section 80D Limits
  const selfDeductionLimit = isSelfSenior
    ? STATUTORY_80D_LIMITS.SELF_FAMILY_SENIOR_60
    : STATUTORY_80D_LIMITS.SELF_FAMILY_UNDER_60;

  let parentsDeductionLimit = 0;
  if (hasParents) {
    parentsDeductionLimit = hasSeniorParents
      ? STATUTORY_80D_LIMITS.PARENTS_SENIOR_60
      : STATUTORY_80D_LIMITS.PARENTS_UNDER_60;
  }

  const totalStatutoryLimit = Math.min(
    STATUTORY_80D_LIMITS.MAX_TOTAL_DEDUCTION,
    selfDeductionLimit + parentsDeductionLimit
  );

  const estimatedTaxSavings = Math.round(totalStatutoryLimit * (marginalTaxRatePercent / 100));

  return {
    taxRegime: 'old',
    isEligible: true,
    selfDeductionLimit,
    parentsDeductionLimit,
    totalStatutoryLimit,
    estimatedTaxSavings,
    marginalTaxRatePercent,
  };
}

/**
 * Models Room-Rent Sub-Limit Proportionate Deduction Risk.
 */
export function calculateRoomRentRisk(actualRoomRent = 10000, roomRentCap = 5000, totalHospitalBill = 200000) {
  const actualRent = Math.max(0, Number(actualRoomRent) || 0);
  const capRent = Math.max(0, Number(roomRentCap) || 0);
  const bill = Math.max(0, Number(totalHospitalBill) || 0);

  if (actualRent === 0 || capRent === 0 || bill === 0 || actualRent <= capRent) {
    return {
      hasProportionateDeduction: false,
      payableRatio: 1.0,
      uncoveredProportion: 0,
      estimatedPayableBill: bill,
      estimatedUncoveredOutofPocket: 0,
    };
  }

  const payableRatio = Math.min(1.0, capRent / actualRent);
  const uncoveredProportion = 1 - payableRatio;
  const estimatedPayableBill = Math.round(bill * payableRatio);
  const estimatedUncoveredOutofPocket = Math.round(bill - estimatedPayableBill);

  return {
    hasProportionateDeduction: true,
    payableRatio: Math.round(payableRatio * 1000) / 1000,
    uncoveredProportion: Math.round(uncoveredProportion * 1000) / 1000,
    estimatedPayableBill,
    estimatedUncoveredOutofPocket,
  };
}

/**
 * Models Co-Payment out-of-pocket impact on hospital claims.
 */
export function calculateCopayImpact(claimAmount = 100000, copayPercent = 10) {
  const claim = Math.max(0, Number(claimAmount) || 0);
  const copay = Math.min(100, Math.max(0, Number(copayPercent) || 0));

  const policyholderShare = Math.round(claim * (copay / 100));
  const insurerShare = Math.round(claim - policyholderShare);

  return {
    claimAmount: claim,
    copayPercent: copay,
    policyholderShare,
    insurerShare,
  };
}

/**
 * Master integration function for Health Insurance Premium & Coverage Needs Calculator.
 */
export function calculateHealthInsuranceNeeds(inputs = {}) {
  const coverageRes = calculateRecommendedHealthCover(inputs);
  const gapRes = calculateEmployerCoverGap(coverageRes.recommendedSumInsured, inputs.existingEmployerCover);
  const topUpRes = calculateSuperTopUpOptimization(coverageRes.recommendedSumInsured);
  const taxRes = calculateSection80DSavings(inputs);
  const roomRentRes = calculateRoomRentRisk(inputs.actualRoomRent, inputs.roomRentCap, inputs.totalHospitalBill);
  const copayRes = calculateCopayImpact(inputs.claimAmount || 100000, inputs.copayPercent || 0);

  // Indicative Annual Premium Estimate Range (₹) based on recommended sum insured
  // Approx ₹1,200 to ₹1,800 per ₹1 Lakh sum insured for family floater
  const lowEstPremium = Math.round((coverageRes.recommendedSumInsured / 100000) * 1200);
  const highEstPremium = Math.round((coverageRes.recommendedSumInsured / 100000) * 1800);

  return {
    isValid: true,
    coverage: coverageRes,
    gap: gapRes,
    superTopUp: topUpRes,
    tax: taxRes,
    roomRentRisk: roomRentRes,
    copay: copayRes,
    indicativePremiumRange: {
      low: lowEstPremium,
      high: highEstPremium,
    },
  };
}
