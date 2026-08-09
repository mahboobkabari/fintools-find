import { calculateLoan } from '../core/loanEngine.js';
import { LOAN_ELIGIBILITY_CONFIGS } from '../configs/loanEligibilityConfig.js';

/**
 * Institutional Loan Eligibility & Borrowing Capacity Decision Engine
 * Distinguishes statutory RBI LTV ceilings from lender FOIR underwriting practices and illustrative credit profiles.
 *
 * @param {Object} inputs
 * @param {number} [inputs.grossMonthlyIncome=100000] - Primary gross monthly income (₹)
 * @param {number} [inputs.coApplicantIncome=0] - Co-applicant monthly income (₹)
 * @param {number} [inputs.existingEmis=10000] - Current existing monthly EMI commitments (₹)
 * @param {string} [inputs.loanType='home_loan'] - Loan category ('home_loan' | 'personal_loan' | 'car_loan')
 * @param {number} [inputs.rate=8.5] - Expected annual interest rate (% p.a.)
 * @param {number} [inputs.tenure=20] - Loan repayment tenure in years
 * @param {string} [inputs.tenureType='years'] - 'years' or 'months'
 * @param {number} [inputs.foirPct=50] - Assumed FOIR percentage limit (default 50%)
 * @param {string} [inputs.calculationMode='forward'] - Mode: 'forward' | 'reverse_income' | 'reverse_emi'
 * @param {number} [inputs.targetLoanAmount=5000000] - Target loan principal for reverse solver (₹)
 * @param {number} [inputs.propertyValue=0] - Property / vehicle value for LTV cap check (₹)
 * @param {string} [inputs.creditProfile='prime'] - Credit profile ('prime' | 'good' | 'fair')
 * @returns {Object} Complete structured loan eligibility analytical results & scenario models
 */
export function calculateLoanEligibility(inputs = {}) {
  const {
    grossMonthlyIncome = 100000,
    coApplicantIncome = 0,
    existingEmis = 10000,
    loanType = 'home_loan',
    rate = 8.5,
    tenure = 20,
    tenureType = 'years',
    foirPct = 50,
    calculationMode = 'forward',
    targetLoanAmount = 5000000,
    propertyValue = 0,
    creditProfile = 'prime',
  } = inputs;

  // 1. INPUT SANITIZATION
  const primaryIncome = Math.max(0, Number(grossMonthlyIncome) || 0);
  const secondaryIncome = Math.max(0, Number(coApplicantIncome) || 0);
  const totalMonthlyIncome = primaryIncome + secondaryIncome;
  const currentEmis = Math.max(0, Number(existingEmis) || 0);

  const selectedConfig =
    LOAN_ELIGIBILITY_CONFIGS.loanTypes[loanType] || LOAN_ELIGIBILITY_CONFIGS.loanTypes.home_loan;
  const maxAllowedTenureYears = selectedConfig.maxTenureYears || 30;

  const rawTenureYears = tenureType === 'months' ? Number(tenure) / 12 : Number(tenure) || 1;
  const tenureYears = Math.max(1, Math.min(maxAllowedTenureYears, Math.round(rawTenureYears)));
  const totalMonths = tenureYears * 12;

  const foir = Math.min(80, Math.max(10, Number(foirPct) || selectedConfig.defaultFoirPct)) / 100;
  const inputRate = rate !== undefined && !isNaN(Number(rate)) ? Number(rate) : selectedConfig.defaultRatePct;
  const baseRate = Math.max(0, Math.min(40, inputRate));
  const numPropValue = Math.max(0, Number(propertyValue) || 0);
  const targetPrincipal = Math.max(0, Number(targetLoanAmount) || 0);

  // Credit Profile Interest Rate Markup Adjustment
  const creditProfileInfo =
    LOAN_ELIGIBILITY_CONFIGS.creditProfiles[creditProfile] ||
    LOAN_ELIGIBILITY_CONFIGS.creditProfiles.prime;
  const rateAdjustment = creditProfileInfo.rateAdjustmentPct || 0;
  const effectiveAnnualRate = baseRate + rateAdjustment;
  const monthlyRate = effectiveAnnualRate / 12 / 100;

  // Handle Edge Case: Zero Total Income
  if (totalMonthlyIncome === 0) {
    return createZeroIncomeResult(loanType, tenureYears, foirPct, targetPrincipal);
  }

  // 2. OBLIGATION & EMI CAPACITY FORMULATION
  const maxTotalEmiAllowed = Math.round(totalMonthlyIncome * foir);
  const availableEmiCapacity = Math.max(0, maxTotalEmiAllowed - currentEmis);

  // 3. FORWARD REVERSE-PMT LOAN PRINCIPAL CALCULATION
  let maxLoanFromIncome = 0;
  if (availableEmiCapacity > 0) {
    if (monthlyRate === 0) {
      maxLoanFromIncome = availableEmiCapacity * totalMonths;
    } else {
      // PV = EMI * [(1+r)^n - 1] / [r * (1+r)^n]
      const pvFactor =
        (Math.pow(1 + monthlyRate, totalMonths) - 1) /
        (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
      maxLoanFromIncome = Math.round(availableEmiCapacity * pvFactor);
    }
  }

  // 4. STATUTORY LTV CEILING CALCULATION (RBI Housing Finance Circular & Car Loan Caps)
  let maxLtvPct = 100;
  let maxLoanFromLtv = Infinity;
  let isLtvConstrained = false;

  if (selectedConfig.supportsLtv && numPropValue > 0) {
    if (loanType === 'home_loan') {
      // Statutory RBI LTV Ceilings (DBR.BP.BC.No.74/21.04.048/2014-15)
      if (maxLoanFromIncome <= 3000000) maxLtvPct = 90;
      else if (maxLoanFromIncome <= 7500000) maxLtvPct = 80;
      else maxLtvPct = 75;
    } else if (loanType === 'car_loan') {
      maxLtvPct = 85;
    }

    maxLoanFromLtv = Math.round(numPropValue * (maxLtvPct / 100));
    if (maxLoanFromLtv < maxLoanFromIncome) {
      isLtvConstrained = true;
    }
  }

  const finalBorrowingPrincipal =
    numPropValue > 0 ? Math.min(maxLoanFromIncome, maxLoanFromLtv) : maxLoanFromIncome;

  // Compute final loan breakdown using standard loan engine
  const finalLoanDetails = calculateLoan({
    amount: finalBorrowingPrincipal,
    rate: effectiveAnnualRate,
    tenure: tenureYears,
    tenureType: 'years',
  });

  // 5. REVERSE SOLVER MODES
  let reverseResult = null;
  if (calculationMode === 'reverse_income' || calculationMode === 'reverse_emi') {
    reverseResult = calculateReverseLoanEligibilityInternal({
      targetLoanAmount: targetPrincipal,
      rate: effectiveAnnualRate,
      tenureYears,
      foirPct: foir * 100,
      existingEmis: currentEmis,
      grossMonthlyIncome: totalMonthlyIncome,
    });
  }

  // 6. 4-SCENARIO FOIR SIMULATOR
  const foirScenarios = LOAN_ELIGIBILITY_CONFIGS.foirScenarios.map((sc) => {
    const scFoir = sc.foirPct / 100;
    const scMaxAllowedEmi = Math.round(totalMonthlyIncome * scFoir);
    const scAvailEmi = Math.max(0, scMaxAllowedEmi - currentEmis);
    let scMaxLoan = 0;
    if (scAvailEmi > 0) {
      if (monthlyRate === 0) scMaxLoan = scAvailEmi * totalMonths;
      else {
        const factor =
          (Math.pow(1 + monthlyRate, totalMonths) - 1) /
          (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
        scMaxLoan = Math.round(scAvailEmi * factor);
      }
    }
    return {
      id: sc.id,
      name: sc.name,
      foirPct: sc.foirPct,
      maxAllowedEmi: scMaxAllowedEmi,
      availableEmiCapacity: scAvailEmi,
      maxLoanAmount: scMaxLoan,
      diffFromBase: scMaxLoan - finalBorrowingPrincipal,
    };
  });

  // Co-Applicant Joined Scenario
  const joinedIncome = totalMonthlyIncome + 50000; // Illustrative +₹50k co-applicant
  const joinedMaxAllowedEmi = Math.round(joinedIncome * foir);
  const joinedAvailEmi = Math.max(0, joinedMaxAllowedEmi - currentEmis);
  let joinedMaxLoan = 0;
  if (joinedAvailEmi > 0) {
    if (monthlyRate === 0) joinedMaxLoan = joinedAvailEmi * totalMonths;
    else {
      const factor =
        (Math.pow(1 + monthlyRate, totalMonths) - 1) /
        (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
      joinedMaxLoan = Math.round(joinedAvailEmi * factor);
    }
  }

  foirScenarios.push({
    id: 'co_applicant_joined',
    name: 'Co-Applicant (+₹50k Income)',
    foirPct: foir * 100,
    maxAllowedEmi: joinedMaxAllowedEmi,
    availableEmiCapacity: joinedAvailEmi,
    maxLoanAmount: joinedMaxLoan,
    diffFromBase: joinedMaxLoan - finalBorrowingPrincipal,
  });

  // 7. 5-TENURE COMPARISON MATRIX (10Y, 15Y, 20Y, 25Y, 30Y)
  const tenureOptions = [10, 15, 20, 25, 30].filter((t) => t <= maxAllowedTenureYears);
  const tenureMatrix = tenureOptions.map((tYears) => {
    const tMonths = tYears * 12;
    let tMaxLoan = 0;
    if (availableEmiCapacity > 0) {
      if (monthlyRate === 0) tMaxLoan = availableEmiCapacity * tMonths;
      else {
        const factor =
          (Math.pow(1 + monthlyRate, tMonths) - 1) /
          (monthlyRate * Math.pow(1 + monthlyRate, tMonths));
        tMaxLoan = Math.round(availableEmiCapacity * factor);
      }
    }
    const tLoanRes = calculateLoan({
      amount: tMaxLoan,
      rate: effectiveAnnualRate,
      tenure: tYears,
      tenureType: 'years',
    });
    return {
      tenureYears: tYears,
      maxLoanAmount: tMaxLoan,
      monthlyEmi: availableEmiCapacity,
      totalPayment: tLoanRes.totalPayment,
      totalInterest: tLoanRes.totalInterest,
    };
  });

  // 8. BORROWING HEALTH SNAPSHOT & DECISION INSIGHTS
  const foirBurdenPct = Number(
    (((currentEmis + availableEmiCapacity) / totalMonthlyIncome) * 100).toFixed(1)
  );
  const existingDebtRatioPct = Number(((currentEmis / totalMonthlyIncome) * 100).toFixed(1));

  const healthMetrics = computeBorrowingHealthScore({
    totalMonthlyIncome,
    existingEmis,
    availableEmiCapacity,
    foirBurdenPct,
    existingDebtRatioPct,
    isLtvConstrained,
    creditProfile,
  });

  // Hero Summary Text
  let heroText = '';
  if (finalBorrowingPrincipal > 0) {
    heroText = `Based on your monthly income of ₹${totalMonthlyIncome.toLocaleString(
      'en-IN'
    )} and existing EMIs of ₹${currentEmis.toLocaleString(
      'en-IN'
    )}, your estimated borrowing capacity for a ${tenureYears}-year ${selectedConfig.name} is ₹${finalBorrowingPrincipal.toLocaleString(
      'en-IN'
    )}.`;
  } else {
    heroText = `Your current existing EMIs of ₹${currentEmis.toLocaleString(
      'en-IN'
    )} exhaust your assumed ${foir * 100}% FOIR monthly obligation limit of ₹${maxTotalEmiAllowed.toLocaleString(
      'en-IN'
    )}. Estimated borrowing capacity is ₹0.`;
  }

  return {
    grossMonthlyIncome: primaryIncome,
    coApplicantIncome: secondaryIncome,
    totalMonthlyIncome,
    existingEmis: currentEmis,
    loanType,
    loanTypeName: selectedConfig.name,
    rate: baseRate,
    effectiveAnnualRate,
    creditProfile,
    creditProfileName: creditProfileInfo.name,
    rateAdjustment,
    tenureYears,
    tenureMonths: totalMonths,
    foirPct: Number((foir * 100).toFixed(0)),
    calculationMode,
    targetLoanAmount: targetPrincipal,
    propertyValue: numPropValue,

    // Primary Outputs
    primaryOutput: finalBorrowingPrincipal,
    maxLoanAmount: finalBorrowingPrincipal,
    maxLoanFromIncome,
    maxLoanFromLtv: isFinite(maxLoanFromLtv) ? maxLoanFromLtv : 0,
    maxLtvPct: selectedConfig.supportsLtv ? maxLtvPct : 0,
    isLtvConstrained,
    maxEmiCapacity: availableEmiCapacity,
    maxTotalEmiAllowed,
    totalInterest: finalLoanDetails.totalInterest,
    totalPayment: finalLoanDetails.totalPayment,
    monthlyEmi: finalLoanDetails.emi,
    schedule: finalLoanDetails.schedule,

    // Scenarios & Reverse Mode
    foirScenarios,
    tenureMatrix,
    reverseResult,

    // Borrowing Health Snapshot
    foirBurdenPct,
    existingDebtRatioPct,
    score: healthMetrics.score,
    healthStatus: healthMetrics.healthStatus,
    healthColor: healthMetrics.healthColor,
    heroText,
    insights: healthMetrics.insights,
  };
}

/**
 * Reverse Loan Eligibility Solver: Computes required gross monthly income or required EMI reduction.
 */
function calculateReverseLoanEligibilityInternal({
  targetLoanAmount,
  rate,
  tenureYears,
  foirPct,
  existingEmis,
  grossMonthlyIncome,
}) {
  const target = Math.max(0, Number(targetLoanAmount) || 0);
  const annualRate = Math.max(0, Number(rate) || 0);
  const years = Math.max(1, Number(tenureYears) || 1);
  const totalMonths = years * 12;
  const foir = Math.max(10, Math.min(80, Number(foirPct) || 50)) / 100;
  const monthlyRate = annualRate / 12 / 100;

  if (target === 0) {
    return {
      requiredMonthlyEmi: 0,
      requiredTotalMonthlyIncome: 0,
      requiredAdditionalIncome: 0,
      requiredEmiReduction: 0,
    };
  }

  // Required EMI for target loan
  let requiredMonthlyEmi = 0;
  if (monthlyRate === 0) {
    requiredMonthlyEmi = Math.round(target / totalMonths);
  } else {
    // PMT = PV * [r * (1+r)^n] / [(1+r)^n - 1]
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    requiredMonthlyEmi = Math.round((target * (monthlyRate * factor)) / (factor - 1));
  }

  // Required Total Income = (Required EMI + Existing EMIs) / FOIR
  const requiredTotalMonthlyIncome = Math.round((requiredMonthlyEmi + existingEmis) / foir);
  const requiredAnnualIncome = requiredTotalMonthlyIncome * 12;
  const requiredAdditionalIncome = Math.max(0, requiredTotalMonthlyIncome - grossMonthlyIncome);

  // Required Existing EMI Reduction (if income is fixed)
  const maxAllowedObligation = Math.round(grossMonthlyIncome * foir);
  const maxAllowedExistingEmi = Math.max(0, maxAllowedObligation - requiredMonthlyEmi);
  const requiredEmiReduction = Math.max(0, existingEmis - maxAllowedExistingEmi);

  return {
    targetLoanAmount: target,
    requiredMonthlyEmi,
    requiredTotalMonthlyIncome,
    requiredAnnualIncome,
    requiredAdditionalIncome,
    requiredEmiReduction,
  };
}

/**
 * Borrowing Health Snapshot & Neutral Financial Safety Insights
 */
function computeBorrowingHealthScore({
  totalMonthlyIncome,
  existingEmis,
  availableEmiCapacity,
  foirBurdenPct,
  existingDebtRatioPct,
  isLtvConstrained,
  creditProfile,
}) {
  let score = 50;

  if (existingDebtRatioPct <= 15) score += 20;
  else if (existingDebtRatioPct <= 30) score += 10;
  else if (existingDebtRatioPct > 45) score -= 20;

  if (availableEmiCapacity > 0) score += 20;
  if (creditProfile === 'prime') score += 10;
  if (!isLtvConstrained) score += 10;

  score = Math.min(100, Math.max(0, Math.round(score)));

  let healthStatus = 'Moderate Borrowing Power';
  let healthColor = 'text-semantic-warning border-semantic-warning/30 bg-semantic-warning/10';

  if (score >= 80) {
    healthStatus = 'High Borrowing Power';
    healthColor = 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
  } else if (score < 50) {
    healthStatus = 'Restricted Borrowing Capacity';
    healthColor = 'text-semantic-danger border-semantic-danger/30 bg-semantic-danger/10';
  }

  const insights = [];
  if (existingDebtRatioPct > 35) {
    insights.push({
      type: 'warning',
      title: 'High Existing Debt Burden',
      message: `Your existing EMIs consume ${existingDebtRatioPct}% of monthly income. Prepaying existing credit card or personal loans will unlock significant borrowing capacity.`,
    });
  } else {
    insights.push({
      type: 'positive',
      title: 'Healthy Debt-to-Income Ratio',
      message: `Your existing EMI commitment is low (${existingDebtRatioPct}% of income), leaving strong monthly capacity for your new loan.`,
    });
  }

  if (isLtvConstrained) {
    insights.push({
      type: 'info',
      title: 'Property LTV Constraint Active',
      message: `Your estimated borrowing capacity is capped by statutory RBI Loan-to-Value (LTV) limits based on property value.`,
    });
  }

  return { score, healthStatus, healthColor, insights };
}

/**
 * Handle Edge Case: Zero Income Input
 */
function createZeroIncomeResult(loanType, tenureYears, foirPct, targetLoanAmount) {
  return {
    grossMonthlyIncome: 0,
    coApplicantIncome: 0,
    totalMonthlyIncome: 0,
    existingEmis: 0,
    loanType,
    loanTypeName: LOAN_ELIGIBILITY_CONFIGS.loanTypes[loanType]?.name || 'Loan',
    rate: 8.5,
    effectiveAnnualRate: 8.5,
    creditProfile: 'prime',
    creditProfileName: 'Prime Credit Score',
    rateAdjustment: 0,
    tenureYears,
    tenureMonths: tenureYears * 12,
    foirPct,
    calculationMode: 'forward',
    targetLoanAmount,
    propertyValue: 0,
    primaryOutput: 0,
    maxLoanAmount: 0,
    maxLoanFromIncome: 0,
    maxLoanFromLtv: 0,
    maxLtvPct: 0,
    isLtvConstrained: false,
    maxEmiCapacity: 0,
    maxTotalEmiAllowed: 0,
    totalInterest: 0,
    totalPayment: 0,
    monthlyEmi: 0,
    schedule: [],
    foirScenarios: [],
    tenureMatrix: [],
    reverseResult: null,
    foirBurdenPct: 0,
    existingDebtRatioPct: 0,
    score: 0,
    healthStatus: 'Zero Income Provided',
    healthColor: 'text-semantic-danger border-semantic-danger/30 bg-semantic-danger/10',
    heroText: 'Please enter a valid gross monthly income to calculate estimated borrowing capacity.',
    insights: [],
  };
}