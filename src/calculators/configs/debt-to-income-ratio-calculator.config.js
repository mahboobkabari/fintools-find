/**
 * Debt-to-Income (DTI) Ratio Calculator Configuration Module
 * 
 * Defines metadata, input boundaries, classifications, reference bands, and illustrative presets.
 */

export const DEBT_TO_INCOME_RATIO_CONFIG = {
  metadata: {
    title: 'Debt-to-Income (DTI) Ratio Calculator',
    slug: 'debt-to-income-ratio-calculator',
    category: 'credit',
    categoryName: 'Credit & Debt Calculators',
    lastUpdated: '2026-08-09',
    financialAuthority: 'Educational Debt-to-Income Ratio Analysis Framework',
    disclosure: 'These are illustrative DTI scenarios, not universal affordability or loan-approval limits. Actual DTI thresholds and debt definitions vary by lender, loan product, jurisdiction, and underwriting methodology.',
  },

  financialMethodology: 'Debt-to-income (DTI) ratio is the percentage of gross monthly income committed to recurring monthly debt payments (Front-End Housing Ratio vs Back-End Total Debt Ratio).',

  classifications: {
    statutory: [],
    userInputs: [
      'Gross Monthly Income',
      'Monthly Housing Obligations (Mortgage / Rent, Property Tax, Insurance, HOA)',
      'Monthly Auto Loan & Personal Loan EMIs',
      'Student Loan Payments & Credit Card Minimums',
      'Other Recurring Monthly Debt Commitments'
    ],
    marketAssumptions: [
      { name: '36% DTI Scenario Benchmark', description: 'Educational scenario benchmark representing a lower recurring debt ratio.' },
      { name: '43% DTI Scenario Benchmark', description: 'Educational scenario benchmark commonly evaluated in retail financial planning.' }
    ],
    lenderAssumptions: [
      { name: 'Lender Policy Variation', description: 'Actual DTI thresholds and debt definitions vary significantly across individual banks and lending institutions.' }
    ]
  },

  defaultInputs: {
    grossMonthlyIncome: 100000,
    grossAnnualIncome: 1200000,
    mortgagePayment: 25000,
    propertyTax: 1000,
    homeInsurance: 500,
    hoaFees: 0,
    autoLoanEmi: 8000,
    personalLoanEmi: 0,
    studentLoanEmi: 0,
    creditCardMinimums: 2000,
    otherRecurringDebt: 0,
  },

  referenceBands: [
    {
      range: '≤ 36%',
      label: 'Lower Modeled Debt Burden',
      colorClass: 'emerald',
      description: 'Your modeled monthly debt payments represent a lower proportion of gross income.'
    },
    {
      range: '37% - 43%',
      label: 'Moderate Modeled Debt Burden',
      colorClass: 'blue',
      description: 'Your modeled debt payments represent a moderate proportion of gross monthly income.'
    },
    {
      range: '44% - 50%',
      label: 'Higher Modeled Debt Burden',
      colorClass: 'amber',
      description: 'Your modeled debt payments represent a higher proportion of gross monthly income.'
    },
    {
      range: '> 50%',
      label: 'Elevated Modeled Debt Burden',
      colorClass: 'rose',
      description: 'Over half of gross monthly income is committed to recurring debt payments.'
    }
  ],

  scenarios: {
    lowDebt: {
      id: 'lowDebt',
      title: 'Low Debt / Conservative',
      description: 'Illustrative example with modest housing costs and minimal auto loan debt.',
      grossMonthlyIncome: 120000,
      mortgagePayment: 20000,
      propertyTax: 1000,
      homeInsurance: 500,
      hoaFees: 0,
      autoLoanEmi: 5000,
      personalLoanEmi: 0,
      studentLoanEmi: 0,
      creditCardMinimums: 0,
      otherRecurringDebt: 0,
    },
    homeBorrower: {
      id: 'homeBorrower',
      title: 'Home Loan Borrower',
      description: 'Illustrative example balancing a home loan EMI, car loan, and minor credit card minimums.',
      grossMonthlyIncome: 100000,
      mortgagePayment: 30000,
      propertyTax: 1200,
      homeInsurance: 800,
      hoaFees: 1000,
      autoLoanEmi: 6000,
      personalLoanEmi: 0,
      studentLoanEmi: 0,
      creditCardMinimums: 2000,
      otherRecurringDebt: 0,
    },
    highConsumer: {
      id: 'highConsumer',
      title: 'High Credit Card / Consumer Debt',
      description: 'Illustrative example with rent obligations plus personal loans and credit card minimums.',
      grossMonthlyIncome: 80000,
      mortgagePayment: 20000,
      propertyTax: 0,
      homeInsurance: 0,
      hoaFees: 0,
      autoLoanEmi: 0,
      personalLoanEmi: 10000,
      studentLoanEmi: 0,
      creditCardMinimums: 8000,
      otherRecurringDebt: 0,
    },
    overleveraged: {
      id: 'overleveraged',
      title: 'Elevated Debt Household',
      description: 'Illustrative example with multiple active EMIs consuming over 65% of monthly gross income.',
      grossMonthlyIncome: 90000,
      mortgagePayment: 35000,
      propertyTax: 1000,
      homeInsurance: 500,
      hoaFees: 0,
      autoLoanEmi: 10000,
      personalLoanEmi: 12000,
      studentLoanEmi: 0,
      creditCardMinimums: 5000,
      otherRecurringDebt: 0,
    }
  },

  fieldLimits: {
    grossMonthlyIncome: { min: 0, max: 10000000, step: 5000, label: 'Gross Monthly Income (₹)' },
    mortgagePayment: { min: 0, max: 5000000, step: 1000, label: 'Mortgage / Rent Payment (₹)' },
    propertyTax: { min: 0, max: 500000, step: 500, label: 'Property Tax (Monthly ₹)' },
    homeInsurance: { min: 0, max: 500000, step: 250, label: 'Home Insurance (Monthly ₹)' },
    hoaFees: { min: 0, max: 200000, step: 250, label: 'HOA / Maintenance Fees (Monthly ₹)' },
    autoLoanEmi: { min: 0, max: 1000000, step: 500, label: 'Car Loan EMI (₹)' },
    personalLoanEmi: { min: 0, max: 1000000, step: 500, label: 'Personal Loan EMI (₹)' },
    studentLoanEmi: { min: 0, max: 1000000, step: 500, label: 'Education Loan EMI (₹)' },
    creditCardMinimums: { min: 0, max: 1000000, step: 500, label: 'Credit Card Minimum Payments (₹)' },
    otherRecurringDebt: { min: 0, max: 1000000, step: 500, label: 'Other Monthly Debt Commitments (₹)' },
  }
};
