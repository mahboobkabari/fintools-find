import { calculateLoan } from '../core/loanEngine.js';

/**
 * Home Loan Calculator Math Engine
 * @param {Object} inputs
 * @param {number} [inputs.propertyValue=5000000] - Total home property purchase price
 * @param {number} [inputs.downPaymentPct=20] - Down payment percentage (e.g. 20%)
 * @param {number} [inputs.rate=8.5] - Annual interest rate (p.a.)
 * @param {number} [inputs.tenure=20] - Tenure duration in years or months
 * @param {string} [inputs.tenureType='years'] - 'years' or 'months'
 * @param {number} [inputs.processingFeePct=0.5] - One-time processing fee percentage
 * @param {number} [inputs.stampDutyPct=6.0] - Stamp duty & registration percentage (default ~6%)
 * @param {number} [inputs.monthlyIncome=150000] - Net monthly household income
 * @param {number} [inputs.existingEmi=0] - Existing monthly debt obligations
 * @param {number} [inputs.taxSlabPct=30] - Income tax bracket percentage (e.g. 30%)
 */
export function calculateHomeLoan(inputs = {}) {
  const {
    propertyValue = 5000000,
    downPaymentPct = 20,
    rate = 8.5,
    tenure = 20,
    tenureType = 'years',
    processingFeePct = 0.5,
    stampDutyPct = 6.0,
    monthlyIncome = 150000,
    existingEmi = 0,
    taxSlabPct = 30,
  } = inputs;

  const propertyCost = Math.max(0, Number(propertyValue) || 0);
  const dpPct = Math.min(90, Math.max(0, Number(downPaymentPct) || 0));
  const downPaymentAmount = Math.round((propertyCost * dpPct) / 100);
  const loanAmount = Math.max(0, propertyCost - downPaymentAmount);

  const feePct = Math.max(0, Number(processingFeePct) || 0);
  const processingFee = Math.round((loanAmount * feePct) / 100);

  const stPct = Math.max(0, Number(stampDutyPct) || 0);
  const stampDutyAmount = Math.round((propertyCost * stPct) / 100);

  // Core reducing balance loan calculation
  const loanResult = calculateLoan({
    amount: loanAmount,
    rate: Number(rate) || 0,
    tenure: Number(tenure) || 1,
    tenureType,
  });

  const emi = loanResult.emi;
  const totalInterest = loanResult.totalInterest;
  const totalBankPayment = loanResult.totalPayment;
  const totalPayment = totalBankPayment + processingFee;
  const totalOwnershipCost = propertyCost + totalInterest + processingFee + stampDutyAmount;

  // 1. Down Payment Impact Simulation (+5% down payment delta)
  const altDpPct = Math.min(90, dpPct + 5);
  const altDpAmount = Math.round((propertyCost * altDpPct) / 100);
  const altLoanAmount = Math.max(0, propertyCost - altDpAmount);
  const altLoanResult = calculateLoan({
    amount: altLoanAmount,
    rate: Number(rate) || 0,
    tenure: Number(tenure) || 1,
    tenureType,
  });
  const altProcessingFee = Math.round((altLoanAmount * feePct) / 100);
  const altOwnershipCost = propertyCost + altLoanResult.totalInterest + altProcessingFee + stampDutyAmount;

  const downPaymentImpact = {
    currentDpPct: dpPct,
    currentDpAmount: downPaymentAmount,
    currentEmi: emi,
    currentInterest: totalInterest,
    currentTotalCost: totalOwnershipCost,
    altDpPct,
    altDpAmount,
    altEmi: altLoanResult.emi,
    altInterest: altLoanResult.totalInterest,
    altTotalCost: altOwnershipCost,
    emiSavings: Math.max(0, emi - altLoanResult.emi),
    interestSaved: Math.max(0, totalInterest - altLoanResult.totalInterest),
    totalCostSaved: Math.max(0, totalOwnershipCost - altOwnershipCost),
    additionalDpNeeded: Math.max(0, altDpAmount - downPaymentAmount),
  };

  // 2. Home Buying Affordability Score (FOIR Engine)
  const income = Math.max(0, Number(monthlyIncome) || 0);
  const existingDebt = Math.max(0, Number(existingEmi) || 0);
  const totalMonthlyCommitment = emi + existingDebt;
  const foirPct = income > 0 ? Math.min(100, Math.round((totalMonthlyCommitment / income) * 100)) : 0;

  let affordabilityCategory = 'Excellent';
  let affordabilityColor = '#10B981'; // Green
  let affordabilityBadge = 'Excellent Affordability';
  let affordabilityDescription = 'Your combined loan obligations are well under 30% of monthly income. Lenders consider this prime quality with fastest approval.';

  if (foirPct > 50) {
    affordabilityCategory = 'Risky';
    affordabilityColor = '#EF4444'; // Red
    affordabilityBadge = 'Risky Debt Burden';
    affordabilityDescription = 'Combined EMIs exceed 50% of monthly income. High risk of loan rejection or mandatory co-applicant requirement.';
  } else if (foirPct > 40) {
    affordabilityCategory = 'Stretch';
    affordabilityColor = '#F59E0B'; // Amber
    affordabilityBadge = 'Stretch Budget';
    affordabilityDescription = 'EMIs take up 40%–50% of your income. Consider a higher down payment or extending loan tenure to lower monthly payments.';
  } else if (foirPct >= 30) {
    affordabilityCategory = 'Good';
    affordabilityColor = '#3B82F6'; // Blue
    affordabilityBadge = 'Good Budget Fit';
    affordabilityDescription = 'Your monthly debt burden is within standard bank qualification norms (30%–40% FOIR).';
  }

  const affordability = {
    income,
    existingEmi: existingDebt,
    newEmi: emi,
    totalMonthlyCommitment,
    foirPct,
    category: affordabilityCategory,
    color: affordabilityColor,
    badge: affordabilityBadge,
    description: affordabilityDescription,
  };

  // 3. Tax Benefit Summary (Year 1 projections under Indian IT Act)
  let year1Interest = 0;
  let year1Principal = 0;
  if (loanResult.schedule && loanResult.schedule.length > 0) {
    const monthsInYear1 = Math.min(12, loanResult.schedule.length);
    for (let i = 0; i < monthsInYear1; i++) {
      year1Interest += Number(loanResult.schedule[i].interestPaid) || 0;
      year1Principal += Number(loanResult.schedule[i].principalPaid) || 0;
    }
  } else {
    year1Interest = Math.round(loanAmount * ((Number(rate) || 0) / 100));
    year1Principal = Math.max(0, emi * 12 - year1Interest);
  }

  const sec24bDeduction = Math.min(200000, Math.round(year1Interest));
  const sec80cDeduction = Math.min(150000, Math.round(year1Principal));
  const totalTaxDeduction = sec24bDeduction + sec80cDeduction;
  const slab = Math.min(50, Math.max(0, Number(taxSlabPct) || 30));
  const annualTaxSaved = Math.round((totalTaxDeduction * slab) / 100);

  const taxBenefit = {
    year1Interest: Math.round(year1Interest),
    year1Principal: Math.round(year1Principal),
    sec24bDeduction,
    sec80cDeduction,
    totalTaxDeduction,
    taxSlabPct: slab,
    annualTaxSaved,
    monthlyTaxSavings: Math.round(annualTaxSaved / 12),
  };

  // 4. Smart Recommendations
  const tenureYears = tenureType === 'years' ? tenure : tenure / 12;
  let tenureSavings = 0;
  if (tenureYears > 5) {
    const reducedTenureResult = calculateLoan({
      amount: loanAmount,
      rate: Number(rate) || 0,
      tenure: tenureYears - 5,
      tenureType: 'years',
    });
    tenureSavings = Math.max(0, totalInterest - reducedTenureResult.totalInterest);
  }

  const lowerRateResult = calculateLoan({
    amount: loanAmount,
    rate: Math.max(0.1, (Number(rate) || 0) - 0.5),
    tenure: Number(tenure) || 1,
    tenureType,
  });
  const rateSavings = Math.max(0, totalInterest - lowerRateResult.totalInterest);

  const acceleratedResult = calculateLoan({
    amount: loanAmount,
    rate: Number(rate) || 0,
    tenure: Number(tenure) || 1,
    tenureType,
    prepaymentMonthly: Math.round(emi / 12),
  });
  const extraEmiInterestSaved = Math.max(0, totalInterest - acceleratedResult.totalInterest);
  const extraEmiMonthsSaved = Math.max(0, (loanResult.schedule?.length || 0) - acceleratedResult.actualPayoffMonths);

  const smartRecommendations = [
    {
      type: 'downPayment',
      title: 'Increase Down Payment by 5%',
      text: `Adding ₹${downPaymentImpact.additionalDpNeeded.toLocaleString('en-IN')} to down payment reduces monthly EMI by ₹${downPaymentImpact.emiSavings.toLocaleString('en-IN')}/mo and saves ₹${downPaymentImpact.interestSaved.toLocaleString('en-IN')} in total interest.`,
      savingsAmount: downPaymentImpact.interestSaved,
    },
    {
      type: 'tenure',
      title: 'Reduce Loan Tenure by 5 Years',
      text: tenureYears > 5
        ? `Choosing a ${tenureYears - 5}-year tenure instead of ${tenureYears} years saves approximately ₹${tenureSavings.toLocaleString('en-IN')} in total interest.`
        : `Opting for a shorter tenure reduces cumulative interest costs significantly.`,
      savingsAmount: tenureSavings,
    },
    {
      type: 'rate',
      title: 'Secure 0.5% Lower Interest Rate',
      text: `Negotiating or transferring to a lender at ${(Number(rate) - 0.5).toFixed(1)}% p.a. reduces total repayment by ₹${rateSavings.toLocaleString('en-IN')}.`,
      savingsAmount: rateSavings,
    },
    {
      type: 'prepayment',
      title: 'Pay 1 Extra EMI Every Year',
      text: `Prepaying just 1 extra EMI annually (₹${Math.round(emi / 12).toLocaleString('en-IN')}/month extra) saves ₹${extraEmiInterestSaved.toLocaleString('en-IN')} in interest and closes your loan ${(extraEmiMonthsSaved / 12).toFixed(1)} years earlier.`,
      savingsAmount: extraEmiInterestSaved,
    },
  ];

  return {
    propertyValue: propertyCost,
    downPaymentPct: dpPct,
    downPaymentAmount,
    loanAmount,
    rate: Number(rate) || 0,
    tenure: Number(tenure) || 1,
    tenureType,
    emi,
    totalInterest,
    processingFee,
    stampDutyPct: stPct,
    stampDutyAmount,
    totalBankPayment,
    totalPayment,
    totalOwnershipCost,
    schedule: loanResult.schedule,
    downPaymentImpact,
    affordability,
    taxBenefit,
    smartRecommendations,
  };
}