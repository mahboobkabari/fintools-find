/**
 * Configuration module for Cash-on-Cash Return Calculator (Leveraged Real Estate Yield)
 */

export const CASH_ON_CASH_CONFIG = {
  meta: {
    title: 'Cash-on-Cash Return Calculator (Leveraged Real Estate Yield)',
    description: 'Calculate Cash-on-Cash Return %, Pre-Tax Annual Cash Flow, Net Operating Income (NOI), Debt Service, and total out-of-pocket cash invested for rental properties.',
    category: 'real-estate',
    categoryName: 'Real Estate & Property Calculators',
    slug: 'cash-on-cash-return-calculator',
    route: '/tools/real-estate/cash-on-cash-return-calculator',
  },

  defaultInputs: {
    purchasePrice: 7500000, // ₹75 Lakhs
    downPaymentPct: 20,
    closingCostsPct: 3,
    initialRehabCost: 200000, // ₹2 Lakhs
    interestRatePct: 8.5,
    tenureYears: 20,
    monthlyGrossRent: 75000, // ₹75k / month
    otherAnnualIncome: 20000,
    vacancyRatePct: 5,
    annualOperatingExpenses: 180000, // ₹1.8 Lakhs / year
  },

  fieldBoundaries: {
    purchasePrice: { min: 500000, max: 1000000000, step: 100000 },
    downPaymentPct: { min: 0, max: 100, step: 1 },
    closingCostsPct: { min: 0, max: 10, step: 0.5 },
    initialRehabCost: { min: 0, max: 10000000, step: 25000 },
    interestRatePct: { min: 0, max: 25, step: 0.25 },
    tenureYears: { min: 1, max: 30, step: 1 },
    monthlyGrossRent: { min: 0, max: 10000000, step: 1000 },
    otherAnnualIncome: { min: 0, max: 5000000, step: 5000 },
    vacancyRatePct: { min: 0, max: 50, step: 1 },
    annualOperatingExpenses: { min: 0, max: 50000000, step: 10000 },
  },

  disclaimers: {
    educationalNotice: 'This calculator estimates real estate Cash-on-Cash Return % based on user-supplied rental income, operating expenses, and mortgage debt service inputs.',
    leverageNotice: 'Cash-on-Cash Return incorporates mortgage leverage. Positive leverage boosts cash yield above Cap Rate, while negative leverage occurs when debt borrowing costs exceed property NOI yield.',
  },

  scenarios: {
    singleFamily: {
      title: 'Single-Family Rental (₹50 Lakhs)',
      description: 'Residential single-family home purchased with 20% down payment and 8.5% mortgage rate.',
      purchasePrice: 5000000,
      downPaymentPct: 20,
      closingCostsPct: 3,
      initialRehabCost: 100000,
      interestRatePct: 8.5,
      tenureYears: 20,
      monthlyGrossRent: 48000,
      otherAnnualIncome: 12000,
      vacancyRatePct: 5,
      annualOperatingExpenses: 120000,
    },
    multiFamily: {
      title: 'Multi-Family Apartment (₹1.5 Crores)',
      description: '4-unit residential multi-family building generating high cash flow with 25% down payment.',
      purchasePrice: 15000000,
      downPaymentPct: 25,
      closingCostsPct: 3,
      initialRehabCost: 300000,
      interestRatePct: 8.25,
      tenureYears: 20,
      monthlyGrossRent: 140000,
      otherAnnualIncome: 45000,
      vacancyRatePct: 6,
      annualOperatingExpenses: 360000,
    },
    commercialProperty: {
      title: 'Turnkey Commercial Retail (₹2 Crores)',
      description: 'Commercial retail store with 30% down payment and long-term tenant lease.',
      purchasePrice: 20000000,
      downPaymentPct: 30,
      closingCostsPct: 3.5,
      initialRehabCost: 200000,
      interestRatePct: 8.75,
      tenureYears: 15,
      monthlyGrossRent: 180000,
      otherAnnualIncome: 60000,
      vacancyRatePct: 4,
      annualOperatingExpenses: 420000,
    },
    brrrrFixerUpper: {
      title: 'Fixer-Upper BRRRR Project (₹40 Lakhs)',
      description: 'Distressed property with ₹5 Lakhs initial rehab outlay yielding high post-renovation cash return.',
      purchasePrice: 4000000,
      downPaymentPct: 20,
      closingCostsPct: 3,
      initialRehabCost: 500000,
      interestRatePct: 8.5,
      tenureYears: 20,
      monthlyGrossRent: 42000,
      otherAnnualIncome: 10000,
      vacancyRatePct: 5,
      annualOperatingExpenses: 95000,
    },
  },
};
