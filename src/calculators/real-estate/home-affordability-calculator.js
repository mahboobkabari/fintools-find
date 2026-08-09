/**
 * Home Affordability Financial Decision Engine
 * 
 * Pure mathematical calculation engine for computing maximum affordable home purchase price,
 * borrowing capacity, required down payment, monthly ownership costs, sensitivity matrices,
 * and binding financing constraints (Front-End DTI, Back-End FOIR, LTV caps).
 * 
 * Strictly decoupled from presentation layer & framework components.
 */

/**
 * Computes monthly EMI for a loan amount using standard present-value annuity formula.
 * Handles zero interest rate as a dedicated branch to avoid division by zero.
 */
export function calculateMonthlyEMI(principal, annualRatePct, tenureYears) {
  const p = Math.max(0, Number(principal) || 0);
  const n = Math.max(1, Math.round((Number(tenureYears) || 1) * 12));
  const r = Math.max(0, (Number(annualRatePct) || 0) / 1200);

  if (p === 0) return 0;
  if (r === 0) return p / n;

  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Number.isFinite(emi) ? emi : 0;
}

/**
 * Computes maximum loan principal capacity given an available monthly EMI payment.
 * Reverse of annuity formula: P = EMI * [ (1+r)^N - 1 ] / [ r * (1+r)^N ]
 */
export function calculateMaxLoanFromEMI(availableEmi, annualRatePct, tenureYears) {
  const emi = Math.max(0, Number(availableEmi) || 0);
  const n = Math.max(1, Math.round((Number(tenureYears) || 1) * 12));
  const r = Math.max(0, (Number(annualRatePct) || 0) / 1200);

  if (emi === 0) return 0;
  if (r === 0) return emi * n;

  const loan = (emi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
  return Number.isFinite(loan) ? loan : 0;
}

/**
 * Determines applicable LTV percentage based on loan amount tier according to RBI/Lender framework.
 * Tier 1: <= 3,00,0000 (90% LTV)
 * Tier 2: 3,00,0001 to 7,50,0000 (80% LTV)
 * Tier 3: > 7,50,0000 (75% LTV)
 */
export function getApplicableLTVTier(loanAmount, ltvRules = null) {
  const amount = Math.max(0, Number(loanAmount) || 0);

  if (ltvRules && Array.isArray(ltvRules) && ltvRules.length > 0) {
    for (const rule of ltvRules) {
      if (amount <= rule.maxAmount) {
        return rule.ltvPct;
      }
    }
    return ltvRules[ltvRules.length - 1].ltvPct;
  }

  // Standard default RBI Tiered LTV Framework
  if (amount <= 3000000) return 90;
  if (amount <= 7500000) return 80;
  return 75;
}

/**
 * Main Home Affordability Calculation Function
 * 
 * @param {Object} params
 * @param {number} params.grossMonthlyIncome - Gross monthly household income
 * @param {number} params.existingMonthlyDebt - Current monthly debt payments (EMIs, credit card mins)
 * @param {number} params.downPaymentSavings - Available liquid cash for down payment
 * @param {number} params.annualInterestRate - Annual home loan interest rate (% p.a.)
 * @param {number} params.tenureYears - Home loan tenure in years
 * @param {number} [params.frontEndDtiRatio=28] - Front-end housing DTI limit %
 * @param {number} [params.backEndDtiRatio=45] - Back-end total debt FOIR limit %
 * @param {number} [params.propertyTaxRate=0.5] - Annual property tax rate %
 * @param {number} [params.insuranceRate=0.25] - Annual home insurance rate %
 * @param {number} [params.maintenanceRate=0.25] - Annual maintenance/HOA rate %
 * @param {number} [params.closingCostRate=5.0] - Upfront stamp duty/closing cost %
 * @param {Array} [params.ltvRules=null] - Optional custom LTV tier rules
 * 
 * @returns {Object} Comprehensive affordability analysis result
 */
export function calculateHomeAffordability(params = {}) {
  // 1. Input Sanitization & Normalization
  const grossMonthlyIncome = Math.max(0, Number(params.grossMonthlyIncome) || 0);
  const existingMonthlyDebt = Math.max(0, Number(params.existingMonthlyDebt) || 0);
  const downPaymentSavings = Math.max(0, Number(params.downPaymentSavings) || 0);
  const annualInterestRate = Math.max(0, Number(params.annualInterestRate) || 0);
  const tenureYears = Math.max(1, Number(params.tenureYears) || 20);
  const frontEndDtiRatio = Math.max(1, Math.min(100, Number(params.frontEndDtiRatio) || 28));
  const backEndDtiRatio = Math.max(1, Math.min(100, Number(params.backEndDtiRatio) || 45));
  const propertyTaxRate = Math.max(0, Number(params.propertyTaxRate) || 0.5);
  const insuranceRate = Math.max(0, Number(params.insuranceRate) || 0.25);
  const maintenanceRate = Math.max(0, Number(params.maintenanceRate) || 0.25);
  const closingCostRate = Math.max(0, Number(params.closingCostRate) || 5.0);

  // 2. DTI & Available EMI Capacity Calculation
  const maxFrontEndEmi = grossMonthlyIncome * (frontEndDtiRatio / 100);
  const maxBackEndEmi = Math.max(0, grossMonthlyIncome * (backEndDtiRatio / 100) - existingMonthlyDebt);
  const availableMonthlyEMI = Math.min(maxFrontEndEmi, maxBackEndEmi);

  // Identify DTI Sub-constraint
  let dtiSubConstraint = 'front_end';
  if (grossMonthlyIncome * (backEndDtiRatio / 100) - existingMonthlyDebt < maxFrontEndEmi) {
    dtiSubConstraint = existingMonthlyDebt > 0 ? 'existing_debt' : 'back_end';
  }

  // 3. Maximum Income-Based Borrowing Capacity
  const maxLoanFromIncome = calculateMaxLoanFromEMI(availableMonthlyEMI, annualInterestRate, tenureYears);
  const incomeConstrainedPrice = maxLoanFromIncome + downPaymentSavings;

  // 4. LTV-Based Property Price Constraint
  const ltvPercent = getApplicableLTVTier(maxLoanFromIncome, params.ltvRules);
  const ltvDecimal = ltvPercent / 100;
  
  // Max price if LTV is the binding constraint (Price * (1 - LTV) = DownPayment)
  let ltvConstrainedPrice = Infinity;
  if (1 - ltvDecimal > 0) {
    ltvConstrainedPrice = downPaymentSavings / (1 - ltvDecimal);
  }

  // 5. Final Maximum Affordable Price & Binding Constraint Determination
  let maxAffordablePrice = Math.min(incomeConstrainedPrice, ltvConstrainedPrice);
  let bindingConstraint = 'income_dti';

  if (ltvConstrainedPrice < incomeConstrainedPrice) {
    bindingConstraint = 'ltv_down_payment';
  } else if (dtiSubConstraint === 'existing_debt') {
    bindingConstraint = 'existing_debt';
  }

  // Round values cleanly
  maxAffordablePrice = Math.round(maxAffordablePrice);

  // 6. Actual Loan Amount & Required Down Payment
  let maxLoanAmount = 0;
  let requiredDownPayment = 0;

  if (bindingConstraint === 'ltv_down_payment') {
    maxLoanAmount = Math.round(maxAffordablePrice * ltvDecimal);
    requiredDownPayment = Math.round(maxAffordablePrice - maxLoanAmount);
  } else {
    maxLoanAmount = Math.round(Math.min(maxLoanFromIncome, maxAffordablePrice));
    requiredDownPayment = Math.round(downPaymentSavings);
  }

  // 7. Closing Costs & Upfront Cash
  const estimatedClosingCosts = Math.round(maxAffordablePrice * (closingCostRate / 100));
  const upfrontCashRequired = Math.round(requiredDownPayment + estimatedClosingCosts);

  // 8. Monthly Ownership Cost Breakdown
  const actualMonthlyEMI = Math.round(calculateMonthlyEMI(maxLoanAmount, annualInterestRate, tenureYears));
  const monthlyPropertyTax = Math.round((maxAffordablePrice * (propertyTaxRate / 100)) / 12);
  const monthlyInsurance = Math.round((maxAffordablePrice * (insuranceRate / 100)) / 12);
  const monthlyMaintenance = Math.round((maxAffordablePrice * (maintenanceRate / 100)) / 12);
  const totalMonthlyOwnershipCost = Math.round(
    actualMonthlyEMI + monthlyPropertyTax + monthlyInsurance + monthlyMaintenance
  );

  // 9. Interest-Rate Sensitivity Matrix (-1.0%, -0.5%, Base, +0.5%, +1.0%)
  const rateDeltas = [-1.0, -0.5, 0, 0.5, 1.0];
  const rateSensitivity = rateDeltas.map((delta) => {
    const rateScenario = Math.max(0, annualInterestRate + delta);
    const loanCapacityScenario = calculateMaxLoanFromEMI(availableMonthlyEMI, rateScenario, tenureYears);
    const priceScenario = Math.round(loanCapacityScenario + downPaymentSavings);
    const emiScenario = Math.round(calculateMonthlyEMI(loanCapacityScenario, rateScenario, tenureYears));
    return {
      delta,
      rate: Number(rateScenario.toFixed(2)),
      maxLoanAmount: Math.round(loanCapacityScenario),
      maxAffordablePrice: priceScenario,
      monthlyEMI: emiScenario,
      isBase: delta === 0,
    };
  });

  // 10. Tenure Sensitivity Matrix (15, 20, 25, 30 years)
  const tenureOptions = [15, 20, 25, 30];
  const tenureSensitivity = tenureOptions.map((tYears) => {
    const loanCapacityScenario = calculateMaxLoanFromEMI(availableMonthlyEMI, annualInterestRate, tYears);
    const priceScenario = Math.round(loanCapacityScenario + downPaymentSavings);
    const emiScenario = Math.round(calculateMonthlyEMI(loanCapacityScenario, annualInterestRate, tYears));
    return {
      tenureYears: tYears,
      maxLoanAmount: Math.round(loanCapacityScenario),
      maxAffordablePrice: priceScenario,
      monthlyEMI: emiScenario,
      isCurrent: tYears === tenureYears,
    };
  });

  // 11. Year-by-Year Ownership Schedule
  const totalMonths = tenureYears * 12;
  const monthlyRate = annualInterestRate / 1200;
  const yearlySchedule = [];
  let remainingBalance = maxLoanAmount;

  for (let yr = 1; yr <= tenureYears; yr++) {
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let mo = 1; mo <= 12; mo++) {
      if (remainingBalance <= 0) break;
      const interestForMonth = remainingBalance * monthlyRate;
      const principalForMonth = Math.min(remainingBalance, actualMonthlyEMI - interestForMonth);
      yearlyInterest += interestForMonth;
      yearlyPrincipal += principalForMonth;
      remainingBalance -= principalForMonth;
    }

    remainingBalance = Math.max(0, remainingBalance);
    const annualPropertyTax = monthlyPropertyTax * 12;
    const annualInsurance = monthlyInsurance * 12;
    const annualMaintenance = monthlyMaintenance * 12;
    const totalAnnualOwnershipCost =
      yearlyPrincipal + yearlyInterest + annualPropertyTax + annualInsurance + annualMaintenance;

    yearlySchedule.push({
      year: yr,
      beginningBalance: Math.round(remainingBalance + yearlyPrincipal),
      principalPaid: Math.round(yearlyPrincipal),
      interestPaid: Math.round(yearlyInterest),
      propertyTaxPaid: Math.round(annualPropertyTax),
      insurancePaid: Math.round(annualInsurance),
      maintenancePaid: Math.round(annualMaintenance),
      endingBalance: Math.round(remainingBalance),
      totalAnnualCost: Math.round(totalAnnualOwnershipCost),
      equityBuilt: Math.round(maxAffordablePrice - remainingBalance),
    });
  }

  // 12. Detailed Constraint Objects
  const dtiConstraintDetails = {
    frontEndCapEmi: Math.round(maxFrontEndEmi),
    backEndCapEmi: Math.round(maxBackEndEmi),
    availableMonthlyEMI: Math.round(availableMonthlyEMI),
    subConstraint: dtiSubConstraint,
    frontEndDtiRatio,
    backEndDtiRatio,
  };

  const ltvConstraintDetails = {
    applicableLtvPct: ltvPercent,
    maxPriceByLtv: Number.isFinite(ltvConstrainedPrice) ? Math.round(ltvConstrainedPrice) : null,
    maxPriceByIncome: Math.round(incomeConstrainedPrice),
    isLtvBinding: bindingConstraint === 'ltv_down_payment',
  };

  return {
    maxAffordablePrice,
    maxLoanAmount,
    requiredDownPayment,
    estimatedClosingCosts,
    upfrontCashRequired,
    availableMonthlyEMI: Math.round(availableMonthlyEMI),
    actualMonthlyEMI,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyMaintenance,
    totalMonthlyOwnershipCost,
    bindingConstraint,
    ltvPercent,
    frontEndDtiRatio,
    backEndDtiRatio,
    dtiConstraintDetails,
    ltvConstraintDetails,
    rateSensitivity,
    tenureSensitivity,
    yearlySchedule,
    summary: {
      loanToValuePct: maxAffordablePrice > 0 ? Number(((maxLoanAmount / maxAffordablePrice) * 100).toFixed(1)) : 0,
      downPaymentPct: maxAffordablePrice > 0 ? Number(((requiredDownPayment / maxAffordablePrice) * 100).toFixed(1)) : 0,
      closingCostPct: closingCostRate,
      dtiFrontEndActualPct: grossMonthlyIncome > 0 ? Number(((actualMonthlyEMI / grossMonthlyIncome) * 100).toFixed(1)) : 0,
      dtiBackEndActualPct: grossMonthlyIncome > 0 ? Number((((actualMonthlyEMI + existingMonthlyDebt) / grossMonthlyIncome) * 100).toFixed(1)) : 0,
    },
  };
}
