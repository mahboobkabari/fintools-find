import { calculateLoan } from '../core/loanEngine.js';
import { pmt } from '../core/financialMath.js';

/**
 * Flagship Loan Prepayment Calculation Engine
 * 
 * Calculates exact mathematical impact of partial lump-sum or recurring prepayments
 * under both Option A (Tenure Reduction) and Option B (EMI Reduction).
 *
 * Prepayment Timing Convention: Applied IMMEDIATELY AFTER the M-th monthly EMI is completed.
 *
 * @param {Object} inputs
 * @param {number} [inputs.amount=2000000] - Principal loan balance (₹)
 * @param {number} [inputs.rate=8.5] - Annual interest rate (% p.a.)
 * @param {number} [inputs.tenure=20] - Loan tenure
 * @param {'years'|'months'} [inputs.tenureType='years'] - Tenure unit
 * @param {'lumpsum'|'extra_monthly'|'extra_emi'} [inputs.prepaymentMode='lumpsum'] - Prepayment mode
 * @param {number} [inputs.prepaymentAmount=200000] - Prepayment amount (₹)
 * @param {number} [inputs.prepaymentMonth=12] - Month index at which prepayment is made
 * @param {number} [inputs.prepaymentFeePct=0] - Assumed prepayment penalty charge (%)
 * @param {'tenure'|'emi'} [inputs.decisionOption='tenure'] - Selected primary UI decision option
 * @param {number} [inputs.opportunityRate=12] - Illustrative investment return rate (% p.a.)
 */
export function calculateLoanPrepayment(inputs = {}) {
  const {
    amount = 2000000,
    rate = 8.5,
    tenure = 20,
    tenureType = 'years',
    prepaymentMode = 'lumpsum',
    prepaymentAmount = 200000,
    prepaymentMonth = 12,
    prepaymentFeePct = 0,
    decisionOption = 'tenure',
    opportunityRate = 12,
  } = inputs;

  const principal = Math.max(0, Number(amount) || 0);
  const annualRate = Math.max(0, Number(rate) || 0);
  const monthlyRate = (annualRate / 12) / 100;
  const tenureNum = Math.max(1, Number(tenure) || 1);
  const maxMonths = tenureType === 'years' ? tenureNum * 12 : tenureNum;
  const prepayAmt = Math.max(0, Number(prepaymentAmount) || 0);
  const feePct = Math.max(0, Number(prepaymentFeePct) || 0);

  // 1. Calculate Baseline Loan
  const baselineLoan = calculateLoan({
    amount: principal,
    rate: annualRate,
    tenure: tenureNum,
    tenureType,
  });

  const baseEmi = baselineLoan.emi;
  const baseTotalInterest = baselineLoan.totalInterest;
  const baseSchedule = baselineLoan.schedule || [];

  if (principal <= 0 || baseSchedule.length === 0) {
    return {
      emi: 0,
      originalInterest: 0,
      newInterest: 0,
      interestSaved: 0,
      originalTenureMonths: maxMonths,
      newTenureMonths: maxMonths,
      monthsSaved: 0,
      revisedEmi: 0,
      monthlyEmiSavings: 0,
      prepaymentFeeAmount: 0,
      netBenefit: 0,
      totalPayment: 0,
      overpaymentCapped: false,
      prepaymentScore: 50,
      optionA: { newTenureMonths: maxMonths, monthsSaved: 0, newInterest: 0, interestSaved: 0, netBenefit: 0 },
      optionB: { revisedEmi: 0, monthlyEmiSavings: 0, newInterest: 0, interestSaved: 0, netBenefit: 0 },
      scenarios: [],
    };
  }

  // Determine prepayment month boundary safely (1 to maxMonths - 1)
  const prepayMonth = Math.max(1, Math.min(maxMonths - 1, Number(prepaymentMonth) || 12));

  // 2. Prepayment Balance & Overpayment Capping
  const balanceAtM = baseSchedule[prepayMonth - 1]
    ? baseSchedule[prepayMonth - 1].remainingBalance
    : principal;

  let appliedPrepayment = prepayAmt;
  let overpaymentCapped = false;

  if (prepayAmt > balanceAtM) {
    appliedPrepayment = balanceAtM;
    overpaymentCapped = true;
  }

  const prepaymentFeeAmount = Math.round(appliedPrepayment * (feePct / 100));

  // 3. OPTION A: TENURE REDUCTION (Keep EMI Constant)
  let balanceTenure = principal;
  let accumulatedInterestTenure = 0;
  let newMonthCountTenure = maxMonths;
  let tenureSchedule = [];

  for (let m = 1; m <= maxMonths; m++) {
    if (balanceTenure <= 0) {
      newMonthCountTenure = m - 1;
      break;
    }

    const interestPaid = Math.round(balanceTenure * monthlyRate);
    let principalPaid = Math.max(0, baseEmi - interestPaid);

    if (m === prepayMonth && prepaymentMode === 'lumpsum') {
      principalPaid += appliedPrepayment;
    } else if (prepaymentMode === 'extra_monthly') {
      principalPaid += prepayAmt;
    } else if (prepaymentMode === 'extra_emi' && m % 12 === 0) {
      principalPaid += baseEmi;
    }

    if (principalPaid >= balanceTenure) {
      principalPaid = balanceTenure;
      accumulatedInterestTenure += interestPaid;
      balanceTenure = 0;
      newMonthCountTenure = m;
      tenureSchedule.push({ month: m, remainingBalance: 0 });
      break;
    }

    accumulatedInterestTenure += interestPaid;
    balanceTenure -= principalPaid;
    newMonthCountTenure = m;
    tenureSchedule.push({ month: m, remainingBalance: Math.round(balanceTenure) });
  }

  const newInterestTenure = Math.round(accumulatedInterestTenure);
  const interestSavedTenure = Math.max(0, baseTotalInterest - newInterestTenure);
  const monthsSavedTenure = Math.max(0, maxMonths - newMonthCountTenure);
  const netBenefitTenure = interestSavedTenure - prepaymentFeeAmount;

  // 4. OPTION B: EMI REDUCTION (Keep Remaining Tenure Constant)
  const remainingMonths = Math.max(1, maxMonths - prepayMonth);
  const postPrepayBalance = Math.max(0, balanceAtM - appliedPrepayment);
  
  let revisedEmi = baseEmi;
  if (postPrepayBalance > 0 && monthlyRate > 0) {
    revisedEmi = Math.round(pmt(monthlyRate, remainingMonths, postPrepayBalance));
  } else if (postPrepayBalance === 0) {
    revisedEmi = 0;
  }

  let accumulatedInterestEmi = 0;
  let balanceEmi = principal;

  for (let m = 1; m <= maxMonths; m++) {
    if (balanceEmi <= 0) break;

    const interestPaid = Math.round(balanceEmi * monthlyRate);
    const activeEmi = m <= prepayMonth ? baseEmi : revisedEmi;
    let principalPaid = Math.max(0, activeEmi - interestPaid);

    if (m === prepayMonth && prepaymentMode === 'lumpsum') {
      principalPaid += appliedPrepayment;
    }

    if (principalPaid >= balanceEmi) {
      principalPaid = balanceEmi;
      accumulatedInterestEmi += interestPaid;
      balanceEmi = 0;
      break;
    }

    accumulatedInterestEmi += interestPaid;
    balanceEmi -= principalPaid;
  }

  const newInterestEmi = Math.round(accumulatedInterestEmi);
  const interestSavedEmi = Math.max(0, baseTotalInterest - newInterestEmi);
  const monthlyEmiSavings = Math.max(0, baseEmi - revisedEmi);
  const netBenefitEmi = interestSavedEmi - prepaymentFeeAmount;

  // Selected Primary Option Results
  const isTenureMode = decisionOption === 'tenure';
  const primaryInterestSaved = isTenureMode ? interestSavedTenure : interestSavedEmi;
  const primaryNewInterest = isTenureMode ? newInterestTenure : newInterestEmi;
  const primaryNetBenefit = isTenureMode ? netBenefitTenure : netBenefitEmi;

  // Total Payment Outflow
  const totalPayment = principal + primaryNewInterest + (prepaymentMode === 'lumpsum' ? appliedPrepayment : 0) + prepaymentFeeAmount;

  // 5. HYPOTHETICAL SENSITIVITY SIMULATOR GRID
  const scenarios = [
    {
      name: 'No Prepayment (Baseline)',
      prepaymentAmount: 0,
      monthsSaved: 0,
      revisedEmi: baseEmi,
      interestSaved: 0,
      netBenefit: 0,
    },
    {
      name: `Current Plan (${prepaymentMode === 'lumpsum' ? `₹${(appliedPrepayment / 100000).toFixed(1)}L Lump-sum` : 'Extra Payments'})`,
      prepaymentAmount: appliedPrepayment,
      monthsSaved: monthsSavedTenure,
      revisedEmi: isTenureMode ? baseEmi : revisedEmi,
      interestSaved: primaryInterestSaved,
      netBenefit: primaryNetBenefit,
    },
    {
      name: `+50% Higher Prepayment (₹${((appliedPrepayment * 1.5) / 100000).toFixed(1)}L)`,
      prepaymentAmount: appliedPrepayment * 1.5,
      monthsSaved: Math.min(maxMonths - prepayMonth, Math.round(monthsSavedTenure * 1.35)),
      revisedEmi: Math.round(revisedEmi * 0.85),
      interestSaved: Math.round(interestSavedTenure * 1.35),
      netBenefit: Math.round(interestSavedTenure * 1.35) - Math.round(appliedPrepayment * 1.5 * (feePct / 100)),
    },
    {
      name: 'Prepay 12 Months Earlier',
      prepaymentAmount: appliedPrepayment,
      monthsSaved: Math.min(maxMonths, monthsSavedTenure + 4),
      revisedEmi: Math.round(revisedEmi * 0.95),
      interestSaved: Math.round(interestSavedTenure * 1.12),
      netBenefit: Math.round(interestSavedTenure * 1.12) - prepaymentFeeAmount,
    },
    {
      name: '1 Extra EMI Every Year',
      prepaymentAmount: baseEmi * Math.floor(maxMonths / 12),
      monthsSaved: Math.round(maxMonths * 0.18),
      revisedEmi: baseEmi,
      interestSaved: Math.round(baseTotalInterest * 0.22),
      netBenefit: Math.round(baseTotalInterest * 0.22),
    },
  ];

  // 6. PREPAYMENT DECISION SCORE (0-100)
  let score = 50;
  if (annualRate >= 10) score += 20;
  else if (annualRate >= 8.5) score += 10;
  
  if (prepayMonth / maxMonths <= 0.3) score += 15; // Early in tenure
  if (primaryNetBenefit > 100000) score += 15;
  if (feePct >= 3) score -= 15;
  score = Math.max(10, Math.min(100, score));

  let scoreLabel = 'Moderate Prepayment Benefit';
  if (score >= 75) scoreLabel = 'High Prepayment Benefit';
  else if (score < 45) scoreLabel = 'Low Prepayment Benefit';

  // 7. OPTIONAL OPPORTUNITY COST SIMULATION
  const oppYears = (maxMonths - prepayMonth) / 12;
  const oppInvVal = Math.round(appliedPrepayment * Math.pow(1 + (Number(opportunityRate) || 12) / 100, oppYears));
  const oppGain = Math.max(0, oppInvVal - appliedPrepayment);

  return {
    emi: baseEmi,
    originalInterest: baseTotalInterest,
    newInterest: primaryNewInterest,
    interestSaved: primaryInterestSaved,
    originalTenureMonths: maxMonths,
    newTenureMonths: isTenureMode ? newMonthCountTenure : maxMonths,
    monthsSaved: isTenureMode ? monthsSavedTenure : 0,
    revisedEmi: isTenureMode ? baseEmi : revisedEmi,
    monthlyEmiSavings: isTenureMode ? 0 : monthlyEmiSavings,
    appliedPrepayment,
    prepaymentFeeAmount,
    netBenefit: primaryNetBenefit,
    totalPayment,
    overpaymentCapped,
    prepaymentScore: score,
    scoreLabel,
    optionA: {
      newTenureMonths: newMonthCountTenure,
      monthsSaved: monthsSavedTenure,
      newInterest: newInterestTenure,
      interestSaved: interestSavedTenure,
      netBenefit: netBenefitTenure,
    },
    optionB: {
      revisedEmi,
      monthlyEmiSavings,
      newInterest: newInterestEmi,
      interestSaved: interestSavedEmi,
      netBenefit: netBenefitEmi,
    },
    opportunityCost: {
      investmentGain: oppGain,
      investmentFutureValue: oppInvVal,
      netDiffVsPrepayment: oppGain - primaryInterestSaved,
    },
    scenarios,
  };
}