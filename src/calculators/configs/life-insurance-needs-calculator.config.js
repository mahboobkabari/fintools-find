/**
 * Term Life Insurance Needs Calculator Configuration Module
 * 
 * Defines metadata, input boundaries, classifications, and illustrative family presets.
 */

export const LIFE_INSURANCE_NEEDS_CONFIG = {
  metadata: {
    title: 'Term Life Insurance Needs Calculator',
    slug: 'life-insurance-needs-calculator',
    category: 'insurance',
    categoryName: 'Insurance Calculators',
    lastUpdated: '2026-08-09',
    financialAuthority: 'Human Life Value (HLV) & DIME Needs Analysis Framework',
  },

  financialMethodology: 'Needs-based DIME framework (Debt + Income Replacement + Mortgage + Education/Milestones minus Existing Resources).',

  classifications: {
    statutory: [],
    userInputs: [
      'Age & Income Replacement Period',
      'Current Annual Take-Home Income',
      'Outstanding Mortgage & Loan Debts',
      'Future Education & Marriage Milestones',
      'Existing Life Insurance Policies & Liquid Savings'
    ],
    marketAssumptions: [
      { name: 'Income Growth Rate', description: 'Assumed annual salary growth rate (e.g. 5.0% p.a.).' },
      { name: 'Discount / Return Rate', description: 'Assumed conservative investment return rate on lump-sum payout (e.g. 6.0% p.a.).' }
    ],
    lenderAssumptions: []
  },

  defaultInputs: {
    age: 32,
    annualIncome: 1200000,
    replacementPeriodYears: 15,
    mortgageBalance: 3500000,
    otherDebts: 300000,
    finalExpenses: 200000,
    educationGoals: 2000000,
    otherFutureGoals: 1000000,
    existingLifeInsurance: 5000000,
    savingsAndCash: 500000,
    investments: 1500000,
    otherResources: 0,
    annualIncomeGrowthRate: 0.05,
    discountRate: 0.06,
  },

  scenarios: {
    youngSingle: {
      id: 'youngSingle',
      title: 'Young Single / Early Career',
      description: 'Focus on paying off student/personal loans and securing initial basic family dependency cover.',
      age: 25,
      annualIncome: 700000,
      replacementPeriodYears: 10,
      mortgageBalance: 0,
      otherDebts: 150000,
      finalExpenses: 150000,
      educationGoals: 0,
      otherFutureGoals: 500000,
      existingLifeInsurance: 1000000,
      savingsAndCash: 200000,
      investments: 300000,
      otherResources: 0,
    },
    youngFamily: {
      id: 'youngFamily',
      title: 'Married with Young Children',
      description: 'High protection need covering home mortgage, 18-year income replacement, and children higher education.',
      age: 32,
      annualIncome: 1500000,
      replacementPeriodYears: 18,
      mortgageBalance: 4500000,
      otherDebts: 250000,
      finalExpenses: 200000,
      educationGoals: 3000000,
      otherFutureGoals: 1500000,
      existingLifeInsurance: 5000000,
      savingsAndCash: 600000,
      investments: 1200000,
      otherResources: 0,
    },
    establishedFamily: {
      id: 'establishedFamily',
      title: 'Established Family with Mortgage',
      description: 'Mid-career household balancing large home mortgage, teens education, and existing investments.',
      age: 42,
      annualIncome: 2500000,
      replacementPeriodYears: 15,
      mortgageBalance: 6000000,
      otherDebts: 400000,
      finalExpenses: 250000,
      educationGoals: 4000000,
      otherFutureGoals: 2000000,
      existingLifeInsurance: 10000000,
      savingsAndCash: 1500000,
      investments: 4500000,
      otherResources: 0,
    },
    preRetirement: {
      id: 'preRetirement',
      title: 'Pre-Retirement Phase',
      description: 'Mature household with minimal remaining mortgage, high accumulated liquid wealth, and reduced dependency period.',
      age: 52,
      annualIncome: 3500000,
      replacementPeriodYears: 8,
      mortgageBalance: 1000000,
      otherDebts: 0,
      finalExpenses: 300000,
      educationGoals: 1000000,
      otherFutureGoals: 1000000,
      existingLifeInsurance: 15000000,
      savingsAndCash: 2500000,
      investments: 12000000,
      otherResources: 0,
    }
  },

  fieldLimits: {
    age: { min: 18, max: 75, step: 1, label: 'Age (Years)' },
    annualIncome: { min: 0, max: 100000000, step: 50000, label: 'Annual Income (₹)' },
    replacementPeriodYears: { min: 1, max: 40, step: 1, label: 'Income Replacement Period (Years)' },
    mortgageBalance: { min: 0, max: 100000000, step: 50000, label: 'Outstanding Mortgage (₹)' },
    otherDebts: { min: 0, max: 50000000, step: 25000, label: 'Other Debt Obligations (₹)' },
    finalExpenses: { min: 0, max: 10000000, step: 25000, label: 'Final Expenses (₹)' },
    educationGoals: { min: 0, max: 50000000, step: 100000, label: 'Children Education Fund (₹)' },
    otherFutureGoals: { min: 0, max: 50000000, step: 100000, label: 'Family Marriage & Milestones (₹)' },
    existingLifeInsurance: { min: 0, max: 200000000, step: 500000, label: 'Existing Term Life Cover (₹)' },
    savingsAndCash: { min: 0, max: 100000000, step: 50000, label: 'Liquid Cash & Savings (₹)' },
    investments: { min: 0, max: 200000000, step: 100000, label: 'Investments & EPF/PPF (₹)' },
    otherResources: { min: 0, max: 100000000, step: 100000, label: 'Other Realizable Assets (₹)' },
  }
};
