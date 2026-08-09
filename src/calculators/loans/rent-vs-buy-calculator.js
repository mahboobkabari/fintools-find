import { RENT_VS_BUY_CONFIG } from '../configs/rent-vs-buy-calculator.config.js';

/**
 * Flagship Rent vs Buy Financial Decision Engine
 * Models complete 30-year multi-asset net worth trajectory comparing:
 * - BUY SCENARIO: Property Appreciation + Loan Amortization + Selling Costs vs Down Payment & Maintenance Cash Outflow
 * - RENT SCENARIO: Down Payment Opportunity Cost Lumpsum + Monthly Cash Flow Surplus Equity SIP Accumulation
 *
 * @param {Object} inputs
 * @param {number} [inputs.propertyPrice=7500000] - Purchase price of property (₹)
 * @param {number} [inputs.monthlyRent=25000] - Initial monthly rent (₹)
 * @param {number} [inputs.downPaymentPct=20.0] - Down payment percentage (%)
 * @param {number} [inputs.homeLoanRate=8.5] - Home loan interest rate (% p.a.)
 * @param {number} [inputs.tenureYears=20] - Comparison horizon in years
 * @param {number} [inputs.propertyAppreciationRate=5.0] - Property appreciation (% p.a.)
 * @param {number} [inputs.rentInflationRate=7.0] - Annual rent inflation (% p.a.)
 * @param {number} [inputs.investmentReturnRate=12.0] - Equity SIP return (% p.a.)
 * @param {number} [inputs.annualMaintenanceRate=1.0] - Annual maintenance & tax (% of property price)
 * @param {number} [inputs.purchaseCostPct=5.0] - Purchase transaction costs (%)
 * @param {number} [inputs.sellingCostPct=2.0] - Selling brokerage/costs (%)
 * @param {number} [inputs.taxSlabRate=30.0] - User income tax slab rate (%)
 * @param {boolean} [inputs.includeTaxBenefits=false] - Whether to include Sec 24(b) Old Tax Regime benefits
 * @param {string} [inputs.currency='INR'] - Currency code ('INR'|'USD'|'EUR'|'GBP')
 * @returns {Object} Structured Rent vs Buy decision analysis model
 */
export function calculateRentVsBuyCalculator(inputs = {}) {
  const {
    propertyPrice = 7500000,
    monthlyRent = 25000,
    downPaymentPct = 20.0,
    homeLoanRate = 8.5,
    tenureYears = 20,
    propertyAppreciationRate = 5.0,
    rentInflationRate = 7.0,
    investmentReturnRate = 12.0,
    annualMaintenanceRate = 1.0,
    purchaseCostPct = 5.0,
    sellingCostPct = 2.0,
    taxSlabRate = 30.0,
    includeTaxBenefits = false,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & BOUNDARY AUDIT
  const price = Math.max(0, Number(propertyPrice) || 0);
  const rent0 = Math.max(0, Number(monthlyRent) || 0);
  const dpPct = Math.max(0, Math.min(100, Number(downPaymentPct) || 0)) / 100;
  const loanRate = Math.max(0, Math.min(30, Number(homeLoanRate) || 0));
  const years = Math.max(1, Math.min(40, Math.round(Number(tenureYears) || 1)));
  const propAppr = Math.max(0, Math.min(30, Number(propertyAppreciationRate) || 0)) / 100;
  const rentInfl = Math.max(0, Math.min(30, Number(rentInflationRate) || 0)) / 100;
  const eqReturn = Math.max(0, Math.min(30, Number(investmentReturnRate) || 0)) / 100;
  const maintPct = Math.max(0, Math.min(10, Number(annualMaintenanceRate) || 0)) / 100;
  const purCostPct = Math.max(0, Math.min(20, Number(purchaseCostPct) || 0)) / 100;
  const sellCostPct = Math.max(0, Math.min(20, Number(sellingCostPct) || 0)) / 100;
  const slabRate = Math.max(0, Math.min(50, Number(taxSlabRate) || 0)) / 100;
  const useTax = Boolean(includeTaxBenefits);

  const nMonths = years * 12;
  const loanMonthlyRate = loanRate / 12 / 100;
  const eqMonthlyRate = eqReturn / 12;

  // 2. LOAN & INITIAL CAPITAL CALCULATIONS
  const downPayment = price * dpPct;
  const loanPrincipal = Math.max(0, price - downPayment);
  const purchaseCosts = price * purCostPct;
  const initialCashBuy = downPayment + purchaseCosts;

  // EMI Calculation
  let monthlyEMI = 0;
  if (loanPrincipal > 0) {
    if (loanMonthlyRate === 0) {
      monthlyEMI = Math.round(loanPrincipal / nMonths);
    } else {
      const emiFactor = Math.pow(1 + loanMonthlyRate, nMonths);
      monthlyEMI = Math.round(loanPrincipal * ((loanMonthlyRate * emiFactor) / (emiFactor - 1)));
    }
  }

  // 3. MONTH-BY-MONTH & YEAR-BY-YEAR SIMULATION
  let remainingLoan = loanPrincipal;
  let cumEmiPaid = 0;
  let cumInterestPaid = 0;
  let cumPrincipalPaid = 0;
  let cumMaintenanceBuy = 0;
  let cumTaxBenefits = 0;

  let lumpsumRentValue = initialCashBuy; // Day 1 Lumpsum of initial buy cash
  let sipRentPortfolio = 0; // Accumulation of monthly surplus/deficit
  let cumRentPaid = 0;

  const yearlySchedule = [];
  let breakevenYear = null;

  for (let y = 1; y <= years; y++) {
    // Year-specific parameters
    const propValCurrent = price * Math.pow(1 + propAppr, y);
    const yrMaintCost = (price * maintPct) * Math.pow(1 + propAppr, y - 1);
    const monthlyMaintCurrent = yrMaintCost / 12;
    const monthlyRentCurrent = rent0 * Math.pow(1 + rentInfl, y - 1);

    let yrInterestPaid = 0;
    let yrPrincipalPaid = 0;

    // Simulate 12 Months for Year y
    for (let m = 1; m <= 12; m++) {
      // Loan Amortization Month m
      if (remainingLoan > 0 && monthlyEMI > 0) {
        const mInterest = remainingLoan * loanMonthlyRate;
        const mPrincipal = (y === years && m === 12) ? remainingLoan : Math.min(remainingLoan, monthlyEMI - mInterest);
        remainingLoan = Math.max(0, remainingLoan - mPrincipal);

        yrInterestPaid += mInterest;
        yrPrincipalPaid += mPrincipal;
        cumInterestPaid += mInterest;
        cumPrincipalPaid += mPrincipal;
        cumEmiPaid += monthlyEMI;
      }

      // Rent & Equity Investment Simulation Month m
      // Lumpsum growth
      lumpsumRentValue = lumpsumRentValue * (1 + eqMonthlyRate);

      // Cash Outflow Comparison
      const buyMonthlyOutflow = monthlyEMI + monthlyMaintCurrent;
      const rentMonthlyOutflow = monthlyRentCurrent;
      cumRentPaid += monthlyRentCurrent;
      cumMaintenanceBuy += monthlyMaintCurrent;

      const monthlySurplus = buyMonthlyOutflow - rentMonthlyOutflow;

      // Compound Rent SIP Portfolio
      sipRentPortfolio = (sipRentPortfolio + monthlySurplus) * (1 + eqMonthlyRate);
    }

    // Section 24(b) Tax Deduction (AY 2025-26 Old Tax Regime: up to ₹2 Lakhs interest)
    if (useTax && yrInterestPaid > 0) {
      const taxDeductionSec24 = Math.min(200000, yrInterestPaid);
      const yrTaxSaved = taxDeductionSec24 * slabRate;
      cumTaxBenefits += yrTaxSaved;
    }

    // Year-End Net Worth Balances
    const sellingCostCurrent = propValCurrent * sellCostPct;
    const netWorthBuyYear = Math.round(propValCurrent - remainingLoan - sellingCostCurrent + (useTax ? cumTaxBenefits : 0));
    const netWorthRentYear = Math.round(lumpsumRentValue + sipRentPortfolio);
    const netAdvantageYear = netWorthBuyYear - netWorthRentYear;

    if (breakevenYear === null && netWorthBuyYear > netWorthRentYear) {
      breakevenYear = y;
    }

    yearlySchedule.push({
      year: y,
      propertyValue: Math.round(propValCurrent),
      remainingLoan: Math.round(remainingLoan),
      netWorthBuy: netWorthBuyYear,
      monthlyRent: Math.round(monthlyRentCurrent),
      cumRentPaid: Math.round(cumRentPaid),
      netWorthRent: netWorthRentYear,
      netAdvantage: netAdvantageYear,
      winningYearly: netAdvantageYear > 0 ? 'BUY' : 'RENT',
      isFinalRow: y === years,
    });
  }

  // 4. FINAL RECONCILIATION & KEY OUTPUTS
  const finalScheduleRow = yearlySchedule[yearlySchedule.length - 1];
  const netWorthBuy = finalScheduleRow.netWorthBuy;
  const netWorthRent = finalScheduleRow.netWorthRent;
  const netAdvantage = netWorthBuy - netWorthRent;
  const winningOption = netAdvantage > 0 ? 'BUY' : 'RENT';

  const totalOutflowBuy = Math.round(initialCashBuy + cumEmiPaid + cumMaintenanceBuy - (useTax ? cumTaxBenefits : 0));
  const totalOutflowRent = Math.round(cumRentPaid);
  const futurePropertyValue = finalScheduleRow.propertyValue;

  // 5. 4-SCENARIO SCENARIO MATRIX
  const scenarios = [
    {
      id: 'baseline',
      label: 'Balanced Baseline',
      propApprRate: propAppr * 100,
      eqReturnRate: eqReturn * 100,
      winningOption,
      netAdvantage,
    },
    {
      id: 'high_real_estate',
      label: 'High Property Appreciation (8%)',
      propApprRate: 8.0,
      eqReturnRate: eqReturn * 100,
      winningOption: (price * Math.pow(1.08, years) - netWorthRent) > 0 ? 'BUY' : 'RENT',
      netAdvantage: Math.round(price * Math.pow(1.08, years) - netWorthRent),
    },
    {
      id: 'high_equity',
      label: 'High Equity Return (15%)',
      propApprRate: propAppr * 100,
      eqReturnRate: 15.0,
      winningOption: 'RENT',
      netAdvantage: Math.round(netWorthBuy - (initialCashBuy * Math.pow(1.15, years))),
    },
  ];

  // 6. HERO SUMMARY TEXT
  const currencySymbol = currency === 'USD' ? '$' : '₹';
  const locale = currency === 'USD' ? 'en-US' : 'en-IN';
  const propPriceFormatted = `${currencySymbol}${price.toLocaleString(locale)}`;
  const rentFormatted = `${currencySymbol}${rent0.toLocaleString(locale)}/mo`;
  const advFormatted = `${currencySymbol}${Math.abs(netAdvantage).toLocaleString(locale)}`;

  let heroText = '';
  if (winningOption === 'BUY') {
    heroText = `Over a ${years}-year horizon, BUYING a ${propPriceFormatted} home generates an estimated net worth of ${currencySymbol}${netWorthBuy.toLocaleString(locale)}, which is ${advFormatted} HIGHER than renting at ${rentFormatted} and investing in equity SIPs.`;
  } else {
    heroText = `Over a ${years}-year horizon, RENTING at ${rentFormatted} and investing down payment & cash savings generates an estimated net worth of ${currencySymbol}${netWorthRent.toLocaleString(locale)}, which is ${advFormatted} HIGHER than buying a ${propPriceFormatted} home.`;
  }

  return {
    propertyPrice: price,
    monthlyRent: rent0,
    downPaymentPct: Number((dpPct * 100).toFixed(1)),
    homeLoanRate: loanRate,
    tenureYears: years,
    propertyAppreciationRate: Number((propAppr * 100).toFixed(1)),
    rentInflationRate: Number((rentInfl * 100).toFixed(1)),
    investmentReturnRate: Number((eqReturn * 100).toFixed(1)),
    annualMaintenanceRate: Number((maintPct * 100).toFixed(1)),
    purchaseCostPct: Number((purCostPct * 100).toFixed(1)),
    sellingCostPct: Number((sellCostPct * 100).toFixed(1)),
    taxSlabRate: Number((slabRate * 100).toFixed(1)),
    includeTaxBenefits: useTax,
    currency,

    // Primary Outputs
    primaryOutput: netAdvantage,
    winningOption,
    netAdvantage,
    breakevenYear: breakevenYear ? `Year ${breakevenYear}` : 'None (Rent stays ahead)',
    netWorthBuy,
    netWorthRent,
    totalOutflowBuy,
    totalOutflowRent,
    futurePropertyValue,

    // Component Breakdown
    downPayment,
    loanPrincipal,
    monthlyEMI,
    purchaseCosts,
    initialCashBuy,
    cumInterestPaid: Math.round(cumInterestPaid),
    cumTaxBenefits: Math.round(cumTaxBenefits),

    // Reference & Schedules
    referenceData: RENT_VS_BUY_CONFIG.referenceData,
    yearlySchedule,
    scenarios,
    heroText,
  };
}
