/**
 * Emergency Fund Calculator Configuration Module
 * 
 * Defines metadata, input boundaries, classifications, reference bands, and illustrative presets.
 */

export const EMERGENCY_FUND_CONFIG = {
  metadata: {
    title: 'Emergency Fund Calculator',
    slug: 'emergency-fund-calculator',
    category: 'savings',
    categoryName: 'Deposit & Savings Calculators',
    lastUpdated: '2026-08-09',
    financialAuthority: 'Educational Personal Liquidity Planning Standard',
    disclosure: 'This calculator provides an illustrative emergency-fund target based on the expenses, savings, and assumptions you enter. There is no single emergency-fund amount that applies to everyone. Actual needs vary with income stability, dependents, expenses, access to other resources, and personal circumstances.',
  },

  financialMethodology: 'Emergency Fund Target = Essential Monthly Expenses × Target Months. Funding Gap = max(0, Target Amount - Current Emergency Savings).',

  classifications: {
    statutory: [],
    userInputs: [
      'Housing & Rent Obligations',
      'Utilities, Groceries & Food',
      'Insurance Premiums & Medical Costs',
      'Essential Transit & Minimum Debt EMIs',
      'Employment Stability & Dependents Profile',
      'Current Emergency Savings & Monthly Savings Contribution'
    ],
    marketAssumptions: [
      { name: '3-Month Scenario Benchmark', description: 'Illustrative target scenario for salaried households with dual incomes or high job stability.' },
      { name: '6-Month Scenario Benchmark', description: 'Standard illustrative planning benchmark for single-earner households with recurring debt obligations.' },
      { name: '9–12 Month Scenario Benchmark', description: 'Conservative illustrative planning benchmark for self-employed professionals, freelancers, or sole earners with dependents.' }
    ],
    lenderAssumptions: [
      { name: 'Liquidity Access Variation', description: 'Immediate cash availability, bank sweep-in terms, and short-term deposit withdrawal rules vary by individual banking institution.' }
    ]
  },

  defaultInputs: {
    housingRentMortgage: 20000,
    utilities: 3000,
    groceriesFood: 12000,
    insurancePremiums: 2000,
    transportation: 4000,
    minimumDebtPayments: 5000,
    healthcare: 2000,
    childcareDependentCare: 0,
    otherEssentials: 2000,
    targetMonths: 6,
    incomeStability: 'stable',
    dependentsCount: 1,
    currentEmergencySavings: 100000,
    monthlyContribution: 10000,
  },

  scenarios: {
    singleSalaried: {
      id: 'singleSalaried',
      title: 'Single Salaried Earner',
      description: 'Illustrative example for a young professional with low debt commitments modeling a 3-month buffer.',
      housingRentMortgage: 15000,
      utilities: 2500,
      groceriesFood: 8000,
      insurancePremiums: 1500,
      transportation: 3000,
      minimumDebtPayments: 0,
      healthcare: 1000,
      childcareDependentCare: 0,
      otherEssentials: 1000,
      targetMonths: 3,
      incomeStability: 'stable',
      dependentsCount: 0,
      currentEmergencySavings: 50000,
      monthlyContribution: 8000,
    },
    familyMortgage: {
      id: 'familyMortgage',
      title: 'Family with Home Loan',
      description: 'Illustrative example for a family household balancing a mortgage EMI and school fees modeling a 6-month buffer.',
      housingRentMortgage: 30000,
      utilities: 5000,
      groceriesFood: 18000,
      insurancePremiums: 4000,
      transportation: 6000,
      minimumDebtPayments: 8000,
      healthcare: 3000,
      childcareDependentCare: 5000,
      otherEssentials: 3000,
      targetMonths: 6,
      incomeStability: 'stable',
      dependentsCount: 2,
      currentEmergencySavings: 150000,
      monthlyContribution: 15000,
    },
    freelancerVariable: {
      id: 'freelancerVariable',
      title: 'Freelancer / Variable Income',
      description: 'Illustrative example for a self-employed consultant with irregular monthly income modeling a conservative 9-month buffer.',
      housingRentMortgage: 22000,
      utilities: 4000,
      groceriesFood: 14000,
      insurancePremiums: 3500,
      transportation: 4000,
      minimumDebtPayments: 4000,
      healthcare: 2500,
      childcareDependentCare: 0,
      otherEssentials: 2000,
      targetMonths: 9,
      incomeStability: 'freelance',
      dependentsCount: 1,
      currentEmergencySavings: 120000,
      monthlyContribution: 12000,
    },
    highDependency: {
      id: 'highDependency',
      title: 'Sole Earner with Multiple Dependents',
      description: 'Illustrative example for a sole earner supporting elderly parents and children modeling a 12-month maximum security buffer.',
      housingRentMortgage: 35000,
      utilities: 6000,
      groceriesFood: 22000,
      insurancePremiums: 6000,
      transportation: 7000,
      minimumDebtPayments: 10000,
      healthcare: 5000,
      childcareDependentCare: 8000,
      otherEssentials: 4000,
      targetMonths: 12,
      incomeStability: 'variable',
      dependentsCount: 3,
      currentEmergencySavings: 200000,
      monthlyContribution: 20000,
    }
  },

  fieldLimits: {
    housingRentMortgage: { min: 0, max: 1000000, step: 1000, label: 'Housing / Rent Payment (₹)' },
    utilities: { min: 0, max: 200000, step: 500, label: 'Utilities (Electricity, Water, Gas, Internet) (₹)' },
    groceriesFood: { min: 0, max: 500000, step: 1000, label: 'Groceries & Food (₹)' },
    insurancePremiums: { min: 0, max: 200000, step: 500, label: 'Health & Life Insurance Premiums (Monthly Pro-rated ₹)' },
    transportation: { min: 0, max: 200000, step: 500, label: 'Essential Transportation / Fuel (₹)' },
    minimumDebtPayments: { min: 0, max: 1000000, step: 1000, label: 'Minimum Debt EMIs (Home, Car, Personal) (₹)' },
    healthcare: { min: 0, max: 200000, step: 500, label: 'Medical & Healthcare (₹)' },
    childcareDependentCare: { min: 0, max: 300000, step: 1000, label: 'Childcare & Dependent Support (₹)' },
    otherEssentials: { min: 0, max: 200000, step: 500, label: 'Other Mandatory Recurring Expenses (₹)' },
    targetMonths: { min: 1, max: 36, step: 1, label: 'Target Reserve Period (Months)' },
    currentEmergencySavings: { min: 0, max: 100000000, step: 5000, label: 'Current Emergency Savings (₹)' },
    monthlyContribution: { min: 0, max: 5000000, step: 1000, label: 'Planned Monthly Contribution (₹)' },
  }
};
