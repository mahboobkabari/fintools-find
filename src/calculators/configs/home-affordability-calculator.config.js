/**
 * Home Affordability Calculator Configuration Module
 * 
 * Separates statutory rules, lender assumptions, market assumptions, and user inputs.
 * Allows annual updates without modifying the underlying financial engine.
 */

export const HOME_AFFORDABILITY_CONFIG = {
  // Classification metadata
  metadata: {
    title: 'Home Affordability Calculator',
    slug: 'home-affordability-calculator',
    category: 'real-estate',
    categoryName: 'Real Estate Calculators',
    lastUpdated: '2026-08-01',
    regulatoryAuthority: 'Reserve Bank of India (RBI) & Indian Banks Association (IBA)',
  },

  // Configuration Category Classifications
  classifications: {
    statutory: [
      { name: 'RBI Tiered LTV Ceiling', description: 'RBI Housing Finance Master Circular LTV limits (90% for <=30L, 80% for 30L-75L, 75% for >75L).' }
    ],
    lenderAssumptions: [
      { name: 'Front-End Housing DTI Ratio', description: 'Lender underwriting cap on housing EMI as % of gross income (28%-35%).' },
      { name: 'Back-End Total FOIR Ratio', description: 'Lender underwriting cap on total monthly obligations as % of gross income (36%-50%).' }
    ],
    marketAssumptions: [
      { name: 'Property Tax Rate', description: 'Estimated annual municipal property tax (default 0.50% p.a. of property value).' },
      { name: 'Home Insurance Rate', description: 'Estimated annual property insurance premium (default 0.25% p.a. of property value).' },
      { name: 'Maintenance / HOA Fee Rate', description: 'Estimated annual society maintenance charge (default 0.25% p.a. of property value).' },
      { name: 'Closing Costs & Stamp Duty Rate', description: 'Estimated upfront registration, stamp duty, and legal fees (default 5.0% of property value).' }
    ],
    userInputs: [
      'Gross Monthly Income',
      'Existing Monthly Obligations',
      'Down Payment Savings',
      'Home Loan Interest Rate',
      'Loan Tenure'
    ]
  },

  // Default Initial Inputs
  defaultInputs: {
    grossMonthlyIncome: 150000,
    existingMonthlyDebt: 20000,
    downPaymentSavings: 1000000,
    annualInterestRate: 8.5,
    tenureYears: 20,
    frontEndDtiRatio: 28,
    backEndDtiRatio: 45,
    propertyTaxRate: 0.5,
    insuranceRate: 0.25,
    maintenanceRate: 0.25,
    closingCostRate: 5.0,
  },

  // Underwriting Scenario Presets (Lender Scenarios)
  scenarios: {
    conservative: {
      id: 'conservative',
      title: 'Conservative (28 / 36 DTI)',
      frontEndDtiRatio: 28,
      backEndDtiRatio: 36,
      badge: 'Prudent Risk',
      description: 'Strict financial planning limits. Keeps housing costs to 28% of gross income and total debt under 36%.',
    },
    standard: {
      id: 'standard',
      title: 'Standard Lender (30 / 45 DTI)',
      frontEndDtiRatio: 30,
      backEndDtiRatio: 45,
      badge: 'Recommended',
      description: 'Standard institutional bank underwriting baseline across SBI, HDFC, and ICICI Bank.',
    },
    aggressive: {
      id: 'aggressive',
      title: 'Aggressive Stretch (35 / 50 DTI)',
      frontEndDtiRatio: 35,
      backEndDtiRatio: 50,
      badge: 'High Debt Stretch',
      description: 'Maximum lender stretch allowance. Suitable for high income growth expectations or temporary debt.',
    },
  },

  // RBI Tiered LTV Statutory Limits Framework
  rbiLtvTiers: [
    { maxAmount: 3000000, ltvPct: 90, label: 'Loans up to ₹30 Lakhs (Max 90% LTV)' },
    { maxAmount: 7500000, ltvPct: 80, label: 'Loans ₹30L to ₹75L (Max 80% LTV)' },
    { maxAmount: Infinity, ltvPct: 75, label: 'Loans above ₹75 Lakhs (Max 75% LTV)' },
  ],

  // Input Field Bounds & Specifications
  fieldLimits: {
    grossMonthlyIncome: { min: 10000, max: 10000000, step: 5000, label: 'Gross Monthly Household Income' },
    existingMonthlyDebt: { min: 0, max: 5000000, step: 2000, label: 'Existing Monthly EMIs / Obligations' },
    downPaymentSavings: { min: 0, max: 100000000, step: 50000, label: 'Available Down Payment Cash' },
    annualInterestRate: { min: 1.0, max: 25.0, step: 0.1, label: 'Home Loan Interest Rate (% p.a.)' },
    tenureYears: { min: 1, max: 30, step: 1, label: 'Loan Tenure (Years)' },
    frontEndDtiRatio: { min: 10, max: 60, step: 1, label: 'Front-End Housing DTI Cap (%)' },
    backEndDtiRatio: { min: 15, max: 75, step: 1, label: 'Back-End Total FOIR Cap (%)' },
    propertyTaxRate: { min: 0, max: 5, step: 0.05, label: 'Property Tax Rate (% p.a.)' },
    insuranceRate: { min: 0, max: 3, step: 0.05, label: 'Home Insurance Rate (% p.a.)' },
    closingCostRate: { min: 0, max: 15, step: 0.5, label: 'Closing Costs & Stamp Duty (%)' },
  },
};
