/**
 * Refinance & Balance Transfer Savings Financial Engine
 * 
 * Pure financial engine for calculating loan refinancing and balance transfer economics.
 * 
 * MANDATORY FINANCIAL MODEL RULES:
 * 1. Prevent Financed-Fee Double Counting:
 *    - Current Remaining Cost = Current EMI * Remaining Tenure
 *    - Refinance Remaining Cost (Cash Fees) = New EMI * New Tenure + Upfront Fees
 *    - Refinance Remaining Cost (Financed Fees) = New EMI * New Tenure (since fees are inside principal & EMI)
 *    - Net Financial Savings = Current Remaining Cost - Refinance Remaining Cost
 * 2. Cumulative Cash-Flow Break-Even Month:
 *    - Month-by-month cumulative cash flow comparison finding the first month where
 *      Cumulative Refinance Outflow < Cumulative Current Outflow.
 * 3. Neutral product language and explicit interest breakdown.
 */

/**
 * Calculates monthly EMI for a given principal, rate (% p.a.), and tenure (months).
 */
export function calculateEmi(principal, ratePercent, tenureMonths) {
  const p = Math.max(0, Number(principal) || 0);
  const t = Math.max(1, Math.round(Number(tenureMonths) || 1));
  const r = Math.max(0, Number(ratePercent) || 0) / 1200;

  if (p === 0) return 0;
  if (r === 0) return Math.round(p / t);

  const factor = Math.pow(1 + r, t);
  const emi = p * ((r * factor) / (factor - 1));
  return Math.round(emi);
}

/**
 * Calculates current loan baseline cash flows and remaining interest.
 */
export function calculateExistingLoanBaseline(params = {}) {
  const principal = Math.max(0, Number(params.outstandingPrincipal) || 0);
  const ratePercent = Math.max(0, Number(params.currentInterestRatePercent) || 0);
  const tenureMonths = Math.max(1, Math.round(Number(params.remainingTenureMonths) || 1));

  const currentEmi = calculateEmi(principal, ratePercent, tenureMonths);
  const totalRemainingOutflow = currentEmi * tenureMonths;
  const totalRemainingInterest = Math.max(0, totalRemainingOutflow - principal);

  return {
    outstandingPrincipal: principal,
    currentInterestRatePercent: ratePercent,
    remainingTenureMonths: tenureMonths,
    currentEmi,
    totalRemainingOutflow,
    totalRemainingInterest,
  };
}

/**
 * Aggregates upfront refinancing transfer costs.
 */
export function calculateUpfrontFees(params = {}) {
  const principal = Math.max(0, Number(params.outstandingPrincipal) || 0);
  
  const procPct = Math.max(0, Number(params.processingFeePercent) || 0);
  const procFixed = Math.max(0, Number(params.processingFeeFixed) || 0);
  const processingFee = procFixed > 0 ? procFixed : Math.round(principal * (procPct / 100));

  const transPct = Math.max(0, Number(params.transferFeePercent) || 0);
  const transFixed = Math.max(0, Number(params.transferFeeFixed) || 0);
  const transferFee = transFixed > 0 ? transFixed : Math.round(principal * (transPct / 100));

  const penaltyPct = Math.max(0, Number(params.foreclosurePenaltyPercent) || 0);
  const penaltyFixed = Math.max(0, Number(params.foreclosurePenaltyFixed) || 0);
  const foreclosurePenalty = penaltyFixed > 0 ? penaltyFixed : Math.round(principal * (penaltyPct / 100));

  const totalUpfrontFees = processingFee + transferFee + foreclosurePenalty;

  return {
    processingFee,
    transferFee,
    foreclosurePenalty,
    totalUpfrontFees,
  };
}

/**
 * Calculates refinanced loan terms and total economic cost.
 */
export function calculateRefinancedLoan(params = {}) {
  const principal = Math.max(0, Number(params.outstandingPrincipal) || 0);
  const totalUpfrontFees = Math.max(0, Number(params.totalUpfrontFees) || 0);
  const financeFeesIntoLoan = Boolean(params.financeFeesIntoLoan);
  const newRatePercent = Math.max(0, Number(params.newInterestRatePercent) || 0);
  const newTenureMonths = Math.max(1, Math.round(Number(params.newTenureMonths) || 1));

  let newPrincipal = principal;
  let cashOutlayFees = 0;

  if (financeFeesIntoLoan) {
    newPrincipal = principal + totalUpfrontFees;
    cashOutlayFees = 0;
  } else {
    newPrincipal = principal;
    cashOutlayFees = totalUpfrontFees;
  }

  const newEmi = calculateEmi(newPrincipal, newRatePercent, newTenureMonths);
  const refinanceLoanOutflow = newEmi * newTenureMonths;
  const totalRefinanceEconomicCost = refinanceLoanOutflow + cashOutlayFees;
  const refinanceRemainingInterest = Math.max(0, refinanceLoanOutflow - newPrincipal);

  // Interest cost attributable to financed fees
  let interestOnFinancedFees = 0;
  if (financeFeesIntoLoan && totalUpfrontFees > 0) {
    const emiWithoutFees = calculateEmi(principal, newRatePercent, newTenureMonths);
    const outflowWithoutFees = emiWithoutFees * newTenureMonths;
    interestOnFinancedFees = Math.max(0, refinanceLoanOutflow - outflowWithoutFees - totalUpfrontFees);
  }

  return {
    newPrincipal,
    financeFeesIntoLoan,
    cashOutlayFees,
    newInterestRatePercent: newRatePercent,
    newTenureMonths,
    newEmi,
    refinanceLoanOutflow,
    totalRefinanceEconomicCost,
    refinanceRemainingInterest,
    interestOnFinancedFees,
  };
}

/**
 * Calculates month-by-month cumulative cash-flow break-even month.
 */
export function calculateCumulativeCashFlowBreakEven(baseline, refinanced) {
  const maxTenure = Math.max(baseline.remainingTenureMonths, refinanced.newTenureMonths);
  
  let cumCurrent = 0;
  let cumRefinance = refinanced.cashOutlayFees; // Initial cash fee outlay at Month 0
  
  let breakEvenMonth = null;
  const schedule = [];

  for (let month = 1; month <= maxTenure; month++) {
    if (month <= baseline.remainingTenureMonths) {
      cumCurrent += baseline.currentEmi;
    }
    if (month <= refinanced.newTenureMonths) {
      cumRefinance += refinanced.newEmi;
    }

    if (breakEvenMonth === null && cumRefinance < cumCurrent) {
      breakEvenMonth = month;
    }

    schedule.push({
      month,
      cumCurrent: Math.round(cumCurrent),
      cumRefinance: Math.round(cumRefinance),
      cumNetDifference: Math.round(cumCurrent - cumRefinance),
    });
  }

  const monthlyEmiSavings = baseline.currentEmi - refinanced.newEmi;
  const totalUpfrontFees = refinanced.financeFeesIntoLoan ? (refinanced.newPrincipal - baseline.outstandingPrincipal) : refinanced.cashOutlayFees;
  const naiveBreakEvenMonths = (monthlyEmiSavings > 0 && totalUpfrontFees > 0) ? Math.ceil(totalUpfrontFees / monthlyEmiSavings) : null;

  return {
    hasBreakEven: breakEvenMonth !== null,
    breakEvenMonth,
    naiveBreakEvenMonths,
    schedule,
  };
}

/**
 * Main integration function for Refinance & Balance Transfer Savings Calculator.
 */
export function calculateBalanceTransferSavings(inputs = {}) {
  const baseline = calculateExistingLoanBaseline({
    outstandingPrincipal: inputs.outstandingPrincipal,
    currentInterestRatePercent: inputs.currentInterestRatePercent,
    remainingTenureMonths: inputs.remainingTenureMonths,
  });

  const fees = calculateUpfrontFees({
    outstandingPrincipal: inputs.outstandingPrincipal,
    processingFeePercent: inputs.processingFeePercent,
    processingFeeFixed: inputs.processingFeeFixed,
    transferFeePercent: inputs.transferFeePercent,
    transferFeeFixed: inputs.transferFeeFixed,
    foreclosurePenaltyPercent: inputs.foreclosurePenaltyPercent,
    foreclosurePenaltyFixed: inputs.foreclosurePenaltyFixed,
  });

  const refinanced = calculateRefinancedLoan({
    outstandingPrincipal: inputs.outstandingPrincipal,
    totalUpfrontFees: fees.totalUpfrontFees,
    financeFeesIntoLoan: inputs.financeFeesIntoLoan,
    newInterestRatePercent: inputs.newInterestRatePercent,
    newTenureMonths: inputs.newTenureMonths || inputs.remainingTenureMonths,
  });

  const currentRemainingCost = baseline.totalRemainingOutflow;
  const refinanceRemainingCost = refinanced.totalRefinanceEconomicCost;
  const netFinancialSavings = currentRemainingCost - refinanceRemainingCost;

  const monthlyEmiSavings = baseline.currentEmi - refinanced.newEmi;
  const grossInterestSaved = baseline.totalRemainingInterest - refinanced.refinanceRemainingInterest;

  const breakEven = calculateCumulativeCashFlowBreakEven(baseline, refinanced);

  // Safety & Educational Statuses
  const isRateAdvantageous = refinanced.newInterestRatePercent < baseline.currentInterestRatePercent;
  const isNetSavingsPositive = netFinancialSavings > 0;
  const isTenureExtended = refinanced.newTenureMonths > baseline.remainingTenureMonths;

  return {
    isValid: true,
    baseline,
    fees,
    refinanced,
    currentRemainingCost,
    refinanceRemainingCost,
    netFinancialSavings,
    monthlyEmiSavings,
    grossInterestSaved,
    breakEven,
    isRateAdvantageous,
    isNetSavingsPositive,
    isTenureExtended,
  };
}
