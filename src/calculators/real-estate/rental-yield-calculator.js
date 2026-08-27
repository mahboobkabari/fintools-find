/**
 * Rental Yield & Property ROI Financial Engine
 * 
 * Pure mathematical engine calculating Gross Rental Yield %, Net Rental Yield %, Net Operating Income (NOI),
 * Cap Rate %, Monthly & Annual Pre-Tax Cash Flow, Initial Cash Invested, Cash-on-Cash Return %,
 * and an isolated property appreciation scenario.
 * 
 * Framework-decoupled, zero DOM dependency.
 */

/**
 * Sanitizes numeric input to a non-negative number.
 */
function sanitize(val, defaultVal = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? Math.max(0, num) : defaultVal;
}

/**
 * Calculates Annual Gross Rental Income.
 */
export function calculateAnnualGrossRent(monthlyRent = 0, annualRentInput = 0) {
  const m = sanitize(monthlyRent);
  if (m > 0) return Math.round(m * 12);
  const a = sanitize(annualRentInput);
  return Math.round(a);
}

/**
 * Calculates Annual Vacancy Loss.
 */
export function calculateVacancyLoss(annualGrossRent, vacancyRatePercent = 0) {
  const rent = sanitize(annualGrossRent);
  const rate = Math.min(100, sanitize(vacancyRatePercent)) / 100;
  return Math.round(rent * rate);
}

/**
 * Calculates Effective Gross Income (EGI).
 */
export function calculateEffectiveGrossIncome(annualGrossRent, vacancyLoss) {
  const rent = sanitize(annualGrossRent);
  const loss = sanitize(vacancyLoss);
  return Math.max(0, Math.round(rent - loss));
}

/**
 * Calculates Total Annual Operating Expenses (Excludes Mortgage Debt Service!).
 * Consolidates monthly maintenance and society charges into a single monthly fee to prevent double-counting.
 */
export function calculateOperatingExpenses({
  propertyTax = 0,
  monthlyMaintenance = 0,
  insurance = 0,
  managementFees = 0,
  societyCharges = 0,
  otherExpenses = 0,
} = {}) {
  const tax = sanitize(propertyTax);
  // Consolidate monthly maintenance and legacy society charges to prevent double counting
  const monthlyMaintVal = sanitize(monthlyMaintenance) > 0 
    ? sanitize(monthlyMaintenance) 
    : sanitize(societyCharges);
  const maint = monthlyMaintVal * 12;
  const ins = sanitize(insurance);
  const mgmt = sanitize(managementFees);
  const other = sanitize(otherExpenses);

  return Math.round(tax + maint + ins + mgmt + other);
}

/**
 * Calculates Net Operating Income (NOI) before financing.
 */
export function calculateNOI(effectiveGrossIncome, operatingExpenses) {
  const egi = sanitize(effectiveGrossIncome);
  const opex = sanitize(operatingExpenses);
  return Math.round(egi - opex);
}

/**
 * Calculates Gross Rental Yield % using Property Purchase Price as denominator.
 */
export function calculateGrossRentalYield(annualGrossRent, propertyPurchasePrice) {
  const rent = sanitize(annualGrossRent);
  const price = sanitize(propertyPurchasePrice);
  if (price <= 0) return 0;
  return Number(((rent / price) * 100).toFixed(2));
}

/**
 * Calculates Net Rental Yield % using Property Purchase Price as denominator.
 */
export function calculateNetRentalYield(noi, propertyPurchasePrice) {
  const price = sanitize(propertyPurchasePrice);
  if (price <= 0) return 0;
  return Number(((noi / price) * 100).toFixed(2));
}

/**
 * Calculates Capitalization Rate (Cap Rate %) using Current Property Value as denominator.
 */
export function calculateCapRate(noi, currentPropertyValue) {
  const val = sanitize(currentPropertyValue);
  if (val <= 0) return 0;
  return Number(((noi / val) * 100).toFixed(2));
}

/**
 * Calculates Monthly Home Loan EMI using standard amortization equation.
 */
export function calculateMonthlyEmi(loanAmount, annualInterestRatePercent, tenureYears) {
  const P = sanitize(loanAmount);
  const ratePct = sanitize(annualInterestRatePercent);
  const years = sanitize(tenureYears);

  if (P <= 0 || years <= 0) return 0;

  // Zero interest rate handling
  if (ratePct <= 0) {
    return Math.round(P / (years * 12));
  }

  const r = ratePct / 1200; // monthly rate
  const n = years * 12; // total months
  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

/**
 * Calculates Annual Debt Service.
 */
export function calculateAnnualDebtService(monthlyEmi) {
  const emi = sanitize(monthlyEmi);
  return Math.round(emi * 12);
}

/**
 * Calculates Annual & Monthly Pre-Tax Cash Flow (NOI minus Debt Service).
 * Can be negative if debt service exceeds NOI.
 */
export function calculatePreTaxCashFlow(noi, annualDebtService) {
  const debt = sanitize(annualDebtService);
  const annualCashFlow = Math.round(noi - debt);
  const monthlyCashFlow = Math.round(annualCashFlow / 12);
  return { annualCashFlow, monthlyCashFlow };
}

/**
 * Calculates Initial Cash Invested (Down Payment + Acquisition Costs + Initial Renovation).
 */
export function calculateInitialCashInvested(downPayment, acquisitionCosts = 0, initialRenovation = 0) {
  const dp = sanitize(downPayment);
  const acq = sanitize(acquisitionCosts);
  const reno = sanitize(initialRenovation);
  return Math.round(dp + acq + reno);
}

/**
 * Calculates Cash-on-Cash Return % (Annual Pre-Tax Cash Flow / Initial Cash Invested * 100).
 */
export function calculateCashOnCashReturn(annualPreTaxCashFlow, initialCashInvested) {
  const cashInvested = sanitize(initialCashInvested);
  if (cashInvested <= 0) return 0;
  return Number(((annualPreTaxCashFlow / cashInvested) * 100).toFixed(2));
}

/**
 * Calculates isolated Future Property Appreciation Scenario.
 */
export function calculateAppreciationScenario(currentPropertyValue, annualAppreciationRatePercent = 0, holdingYears = 10) {
  const val = sanitize(currentPropertyValue);
  const ratePct = Number(annualAppreciationRatePercent) || 0;
  const years = sanitize(holdingYears, 10);

  if (val <= 0) return { futureValue: 0, totalAppreciation: 0 };

  const futureValue = Math.round(val * Math.pow(1 + ratePct / 100, years));
  const totalAppreciation = Math.round(futureValue - val);

  return { futureValue, totalAppreciation, holdingYears: years };
}

/**
 * Main Rental Yield & Property ROI Calculator Engine.
 * 
 * @param {Object} inputs
 * @returns {Object} Structured Rental Yield Results
 */
export function calculateRentalYield({
  propertyPurchasePrice = 0,
  currentPropertyValue = 0,
  monthlyRent = 0,
  annualRentInput = 0,
  vacancyRatePercent = 0,
  propertyTax = 0,
  monthlyMaintenance = 0,
  insurance = 0,
  managementFees = 0,
  societyCharges = 0,
  otherExpenses = 0,
  isFinanced = false,
  loanAmount = 0,
  interestRatePercent = 0,
  loanTenureYears = 20,
  existingMonthlyEmi = 0,
  downPayment = 0,
  acquisitionCosts = 0,
  initialRenovation = 0,
  annualAppreciationRatePercent = 0,
  holdingYears = 10,
} = {}) {
  const purchasePrice = sanitize(propertyPurchasePrice);
  const propertyValue = sanitize(currentPropertyValue) > 0
    ? sanitize(currentPropertyValue)
    : purchasePrice;
  
  if (purchasePrice <= 0 && propertyValue <= 0) {
    return {
      isValid: false,
      validationMessage: 'Please enter a property purchase price or estimated property value greater than 0.',
      propertyPurchasePrice: 0,
      currentPropertyValue: 0,
      annualGrossRent: 0,
      vacancyLoss: 0,
      effectiveGrossIncome: 0,
      operatingExpenses: 0,
      noi: 0,
      grossRentalYieldPercent: 0,
      netRentalYieldPercent: 0,
      capRatePercent: 0,
      annualDebtService: 0,
      monthlyNetCashFlow: 0,
      annualPreTaxCashFlow: 0,
      initialCashInvested: 0,
      cashOnCashReturnPercent: 0,
      appreciationScenario: { futureValue: 0, totalAppreciation: 0, holdingYears: 10 },
      breakdown: { opex: 0, debt: 0 },
    };
  }

  // 1. Annual Gross Rent & Vacancy
  const annualGrossRent = calculateAnnualGrossRent(monthlyRent, annualRentInput);
  const vacancyLoss = calculateVacancyLoss(annualGrossRent, vacancyRatePercent);
  const effectiveGrossIncome = calculateEffectiveGrossIncome(annualGrossRent, vacancyLoss);

  // 2. Operating Expenses (EXCLUDES Mortgage EMI!)
  const operatingExpenses = calculateOperatingExpenses({
    propertyTax,
    monthlyMaintenance,
    insurance,
    managementFees,
    societyCharges,
    otherExpenses,
  });

  // 3. Net Operating Income (NOI)
  const noi = calculateNOI(effectiveGrossIncome, operatingExpenses);

  // 4. Yields & Cap Rate
  const grossRentalYieldPercent = calculateGrossRentalYield(annualGrossRent, purchasePrice || propertyValue);
  const netRentalYieldPercent = calculateNetRentalYield(noi, purchasePrice || propertyValue);
  const capRatePercent = calculateCapRate(noi, propertyValue || purchasePrice);

  // 5. Financing & Debt Service
  let monthlyEmi = 0;
  if (isFinanced) {
    monthlyEmi = sanitize(existingMonthlyEmi);
    if (monthlyEmi <= 0 && loanAmount > 0) {
      monthlyEmi = calculateMonthlyEmi(loanAmount, interestRatePercent, loanTenureYears);
    }
  }
  const annualDebtService = calculateAnnualDebtService(monthlyEmi);

  // 6. Pre-Tax Cash Flow
  const { annualCashFlow: annualPreTaxCashFlow, monthlyCashFlow: monthlyNetCashFlow } =
    calculatePreTaxCashFlow(noi, annualDebtService);

  // 7. Initial Cash Invested & Cash-on-Cash Return
  const effectiveDownPayment = isFinanced
    ? sanitize(downPayment, Math.max(0, purchasePrice - loanAmount))
    : purchasePrice;

  const initialCashInvested = calculateInitialCashInvested(
    effectiveDownPayment,
    acquisitionCosts,
    initialRenovation
  );

  const cashOnCashReturnPercent = calculateCashOnCashReturn(annualPreTaxCashFlow, initialCashInvested);

  // 8. Isolated Appreciation Scenario
  const appreciationScenario = calculateAppreciationScenario(
    propertyValue || purchasePrice,
    annualAppreciationRatePercent,
    holdingYears
  );

  return {
    isValid: true,
    validationMessage: '',
    propertyPurchasePrice: purchasePrice,
    currentPropertyValue: propertyValue,
    annualGrossRent,
    vacancyLoss,
    effectiveGrossIncome,
    operatingExpenses,
    noi,
    grossRentalYieldPercent,
    netRentalYieldPercent,
    capRatePercent,
    isFinanced,
    monthlyEmi,
    annualDebtService,
    monthlyNetCashFlow,
    annualPreTaxCashFlow,
    initialCashInvested,
    cashOnCashReturnPercent,
    appreciationScenario,
    breakdown: {
      grossRent: annualGrossRent,
      vacancy: vacancyLoss,
      egi: effectiveGrossIncome,
      propertyTax: sanitize(propertyTax),
      maintenance: (sanitize(monthlyMaintenance) > 0 ? sanitize(monthlyMaintenance) : sanitize(societyCharges)) * 12,
      insurance: sanitize(insurance),
      management: sanitize(managementFees),
      other: sanitize(otherExpenses),
      totalOpex: operatingExpenses,
      debtService: annualDebtService,
    },
  };
}
