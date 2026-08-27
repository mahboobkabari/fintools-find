/**
 * Pure JavaScript Financial Engine for Cash-on-Cash Return Calculator
 * Leveraged Real Estate Cash Flow Yield, Net Operating Income (NOI),
 * Annual Debt Service (ADS), Pre-Tax Annual Cash Flow, and Cap Rate Comparison.
 *
 * All financial logic is completely decoupled from UI and framework code.
 */

import {
  calculateGrossPotentialIncome,
  calculateVacancyLoss,
  calculateEffectiveGrossIncome,
  calculateOperatingExpenses,
} from './cap-rate-calculator.js';

/**
 * Sanitizes input to a non-negative number.
 *
 * @param {any} val
 * @param {number} [defaultVal=0]
 * @returns {number}
 */
function sanitizeNonNegative(val, defaultVal = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? Math.max(0, num) : defaultVal;
}

/**
 * Calculates total upfront out-of-pocket cash invested.
 *
 * @param {Object} params
 * @param {number} [params.purchasePrice=0] - Property purchase price (₹)
 * @param {number} [params.downPaymentPct=20] - Down payment percentage (0-100%)
 * @param {number} [params.closingCostsPct=3] - Loan & title closing costs (% of price)
 * @param {number} [params.initialRehabCost=0] - Initial renovation/rehab outlay (₹)
 * @returns {{ downPaymentAmount: number, closingCostsAmount: number, totalUpfrontCashInvested: number, loanAmount: number }}
 */
export function calculateUpfrontCashInvested({
  purchasePrice = 0,
  downPaymentPct = 20,
  closingCostsPct = 3,
  initialRehabCost = 0,
} = {}) {
  const price = sanitizeNonNegative(purchasePrice);
  const downPct = Math.min(100, Math.max(0, Number(downPaymentPct) || 0)) / 100;
  const closingPct = Math.min(100, Math.max(0, Number(closingCostsPct) || 0)) / 100;
  const rehab = sanitizeNonNegative(initialRehabCost);

  const downPaymentAmount = Math.round(price * downPct);
  const closingCostsAmount = Math.round(price * closingPct);
  const loanAmount = Math.max(0, Math.round(price - downPaymentAmount));
  const totalUpfrontCashInvested = Math.round(downPaymentAmount + closingCostsAmount + rehab);

  return {
    downPaymentAmount,
    closingCostsAmount,
    loanAmount,
    totalUpfrontCashInvested,
  };
}

/**
 * Calculates monthly mortgage EMI and Annual Debt Service (ADS).
 *
 * @param {Object} params
 * @param {number} [params.loanAmount=0] - Total principal loan amount (₹)
 * @param {number} [params.interestRatePct=8.5] - Mortgage annual interest rate (%)
 * @param {number} [params.tenureYears=20] - Loan tenure (Years)
 * @param {number} [params.monthlyMortgageEmi] - Optional direct monthly EMI override (₹)
 * @returns {{ monthlyMortgageEmi: number, annualDebtService: number }}
 */
export function calculateAnnualDebtService({
  loanAmount = 0,
  interestRatePct = 8.5,
  tenureYears = 20,
  monthlyMortgageEmi,
} = {}) {
  const principal = sanitizeNonNegative(loanAmount);
  
  if (monthlyMortgageEmi !== undefined && monthlyMortgageEmi !== null) {
    const emiOverride = Math.round(sanitizeNonNegative(monthlyMortgageEmi));
    return {
      monthlyMortgageEmi: emiOverride,
      annualDebtService: emiOverride * 12,
    };
  }

  if (principal <= 0) {
    return { monthlyMortgageEmi: 0, annualDebtService: 0 };
  }

  const annualRate = Math.max(0, Number(interestRatePct) || 0);
  const years = Math.max(1, Number(tenureYears) || 20);

  if (annualRate === 0) {
    const emiZero = Math.round(principal / (years * 12));
    return {
      monthlyMortgageEmi: emiZero,
      annualDebtService: emiZero * 12,
    };
  }

  const r = annualRate / (12 * 100);
  const n = years * 12;
  const factor = Math.pow(1 + r, n);
  const emi = Math.round((principal * r * factor) / (factor - 1));

  return {
    monthlyMortgageEmi: emi,
    annualDebtService: emi * 12,
  };
}

/**
 * Calculates Net Operating Income (NOI) and Effective Gross Income (EGI).
 * Mortgage debt service is strictly EXCLUDED from NOI per real estate accounting standards.
 *
 * @param {Object} params
 * @param {number} [params.monthlyGrossRent=0] - Monthly gross rent (₹)
 * @param {number} [params.otherAnnualIncome=0] - Other annual income (₹)
 * @param {number} [params.vacancyRatePct=5] - Vacancy rate (0-50%)
 * @param {number} [params.annualOperatingExpenses=0] - Total annual operating expenses (₹)
 * @returns {{ gpi: number, vacancyLoss: number, egi: number, totalOpEx: number, noi: number }}
 */
export function calculateNoiAndEgi({
  monthlyGrossRent = 0,
  otherAnnualIncome = 0,
  vacancyRatePct = 5,
  annualOperatingExpenses = 0,
} = {}) {
  const gpi = calculateGrossPotentialIncome(monthlyGrossRent, otherAnnualIncome);
  const vacancyLoss = calculateVacancyLoss(gpi, vacancyRatePct);
  const egi = calculateEffectiveGrossIncome(gpi, vacancyLoss);
  const totalOpEx = sanitizeNonNegative(annualOperatingExpenses);
  const noi = Math.round(egi - totalOpEx);

  return {
    gpi,
    vacancyLoss,
    egi,
    totalOpEx,
    noi,
  };
}

/**
 * Master Cash-on-Cash Return Calculation Engine.
 *
 * @param {Object} inputs
 * @returns {Object} Structured Cash-on-Cash return results
 */
export function calculateCashOnCashReturn(inputs = {}) {
  const rawPrice = inputs.purchasePrice !== undefined ? inputs.purchasePrice : (inputs.propertyValue !== undefined ? inputs.propertyValue : 7500000);
  const purchasePrice = sanitizeNonNegative(rawPrice);
  const downPaymentPct = Math.min(100, Math.max(0, Number(inputs.downPaymentPct) !== undefined ? Number(inputs.downPaymentPct) : 20));
  const closingCostsPct = Math.min(100, Math.max(0, Number(inputs.closingCostsPct) !== undefined ? Number(inputs.closingCostsPct) : 3));
  const initialRehabCost = sanitizeNonNegative(inputs.initialRehabCost !== undefined ? inputs.initialRehabCost : (inputs.rehabCost !== undefined ? inputs.rehabCost : 200000));

  const interestRatePct = Math.max(0, Number(inputs.interestRatePct) !== undefined ? Number(inputs.interestRatePct) : 8.5);
  const tenureYears = Math.max(1, Math.min(30, Number(inputs.tenureYears) || 20));

  const monthlyGrossRent = sanitizeNonNegative(inputs.monthlyGrossRent !== undefined ? inputs.monthlyGrossRent : (inputs.monthlyRent !== undefined ? inputs.monthlyRent : 75000));
  const otherAnnualIncome = sanitizeNonNegative(inputs.otherAnnualIncome || 0);
  const vacancyRatePct = Math.min(100, Math.max(0, Number(inputs.vacancyRatePct) !== undefined ? Number(inputs.vacancyRatePct) : 5));

  // Itemized or combined operating expenses
  let annualOpEx = 0;
  if (inputs.annualOperatingExpenses !== undefined && inputs.annualOperatingExpenses !== null) {
    annualOpEx = sanitizeNonNegative(inputs.annualOperatingExpenses);
  } else if (inputs.operatingExpenses && typeof inputs.operatingExpenses === 'object') {
    annualOpEx = calculateOperatingExpenses(inputs.operatingExpenses);
  } else {
    annualOpEx = 180000;
  }

  const isValid = purchasePrice > 0;

  if (!isValid) {
    return {
      isValid: false,
      validationMessage: 'Property purchase price must be greater than zero.',
      purchasePrice: 0,
      downPaymentPct,
      closingCostsPct,
      initialRehabCost: 0,
      downPaymentAmount: 0,
      closingCostsAmount: 0,
      loanAmount: 0,
      totalUpfrontCashInvested: 0,
      interestRatePct,
      tenureYears,
      monthlyMortgageEmi: 0,
      annualDebtService: 0,
      gpi: 0,
      vacancyLoss: 0,
      egi: 0,
      totalOpEx: 0,
      noi: 0,
      annualPreTaxCashFlow: 0,
      cashOnCashReturnPct: 0,
      capRatePct: 0,
      operatingExpenseRatioPct: 0,
      leverageEffect: 'neutral',
    };
  }

  // 1. Upfront Cash Outlays
  const upfront = calculateUpfrontCashInvested({
    purchasePrice,
    downPaymentPct,
    closingCostsPct,
    initialRehabCost,
  });

  // 2. Debt Service (Mortgage EMI)
  const debtService = calculateAnnualDebtService({
    loanAmount: upfront.loanAmount,
    interestRatePct,
    tenureYears,
    monthlyMortgageEmi: inputs.monthlyMortgageEmi,
  });

  // 3. Property Operating Performance (NOI & EGI)
  const propertyPerf = calculateNoiAndEgi({
    monthlyGrossRent,
    otherAnnualIncome,
    vacancyRatePct,
    annualOperatingExpenses: annualOpEx,
  });

  // 4. Pre-Tax Annual Cash Flow (BTCF = NOI - Debt Service)
  const annualPreTaxCashFlow = Math.round(propertyPerf.noi - debtService.annualDebtService);

  // 5. Cash-on-Cash Return %
  const cashOnCashReturnPct = upfront.totalUpfrontCashInvested > 0
    ? Number(((annualPreTaxCashFlow / upfront.totalUpfrontCashInvested) * 100).toFixed(2))
    : 0;

  // 6. Unleveraged Cap Rate % Comparison
  const capRatePct = purchasePrice > 0
    ? Number(((propertyPerf.noi / purchasePrice) * 100).toFixed(2))
    : 0;

  // 7. Operating Expense Ratio (OER %)
  const operatingExpenseRatioPct = propertyPerf.egi > 0
    ? Number(((propertyPerf.totalOpEx / propertyPerf.egi) * 100).toFixed(2))
    : 0;

  // 8. Financial Leverage Effect
  let leverageEffect = 'neutral';
  if (upfront.loanAmount > 0) {
    if (cashOnCashReturnPct > capRatePct) {
      leverageEffect = 'positive';
    } else if (cashOnCashReturnPct < capRatePct) {
      leverageEffect = 'negative';
    }
  }

  return {
    isValid: true,
    validationMessage: '',
    purchasePrice,
    downPaymentPct,
    closingCostsPct,
    initialRehabCost,
    downPaymentAmount: upfront.downPaymentAmount,
    closingCostsAmount: upfront.closingCostsAmount,
    loanAmount: upfront.loanAmount,
    totalUpfrontCashInvested: upfront.totalUpfrontCashInvested,
    interestRatePct,
    tenureYears,
    monthlyMortgageEmi: debtService.monthlyMortgageEmi,
    annualDebtService: debtService.annualDebtService,
    monthlyGrossRent,
    otherAnnualIncome,
    vacancyRatePct,
    gpi: propertyPerf.gpi,
    vacancyLoss: propertyPerf.vacancyLoss,
    egi: propertyPerf.egi,
    totalOpEx: propertyPerf.totalOpEx,
    noi: propertyPerf.noi,
    annualPreTaxCashFlow,
    cashOnCashReturnPct,
    capRatePct,
    operatingExpenseRatioPct,
    leverageEffect,
  };
}
