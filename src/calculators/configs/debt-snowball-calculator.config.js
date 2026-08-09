/**
 * Debt Snowball vs Debt Avalanche Configuration Module
 * 
 * Separates statutory rules, lender assumptions, market assumptions, and user inputs.
 * Contains example debt portfolios and field boundary specifications.
 */

export const DEBT_SNOWBALL_CONFIG = {
  // Classification metadata
  metadata: {
    title: 'Debt Snowball vs Debt Avalanche Calculator',
    slug: 'debt-snowball-calculator',
    category: 'credit',
    categoryName: 'Credit & Debt Calculators',
    lastUpdated: '2026-08-01',
    regulatoryAuthority: 'Reserve Bank of India (RBI) & Fair Debt Collection Practices',
  },

  // Configuration Category Classifications
  classifications: {
    statutory: [
      { name: 'Credit Card Minimum Payment Rules', description: 'RBI Fair Practices Code for credit card operations requiring minimum monthly payment disclosure.' }
    ],
    lenderAssumptions: [
      { name: 'Compounding Frequency', description: 'Institutional convention computes interest monthly based on annual percentage rate (APR / 12).' },
      { name: 'Unsecured Debt Prepayment Penalties', description: 'Most credit card balances and unsecured personal loans carry zero prepayment penalty under RBI guidelines.' }
    ],
    marketAssumptions: [
      { name: 'Credit Card APR Range', description: 'Typical credit card APR ranges from 18.0% to 42.0% p.a. (1.5% - 3.5% monthly).' },
      { name: 'Personal Loan APR Range', description: 'Typical unsecured personal loan APR ranges from 10.5% to 24.0% p.a.' },
      { name: 'Auto / Student Loan APR Range', description: 'Typical secured loan APR ranges from 8.5% to 14.0% p.a.' }
    ],
    userInputs: [
      'Debt Name',
      'Current Outstanding Balance',
      'Annual Interest Rate (% p.a.)',
      'Minimum Monthly Payment',
      'Additional Monthly Payment Allocation'
    ]
  },

  // Default Initial Debts Example Portfolio
  defaultDebts: [
    {
      id: 'debt_1',
      name: 'Store Credit Card',
      balance: 25000,
      annualRate: 36.0,
      minPayment: 1250,
    },
    {
      id: 'debt_2',
      name: 'Bank Credit Card',
      balance: 75000,
      annualRate: 28.0,
      minPayment: 3000,
    },
    {
      id: 'debt_3',
      name: 'Personal Loan',
      balance: 150000,
      annualRate: 15.0,
      minPayment: 4500,
    },
  ],

  defaultExtraPayment: 5000,

  // Scenario Presets
  scenarios: {
    highInterestCards: {
      id: 'highInterestCards',
      title: 'High-Interest Credit Cards',
      description: 'Multiple high-APR credit card balances where Debt Avalanche yields maximum interest savings.',
      extraMonthlyPayment: 6000,
      debts: [
        { id: 'card_1', name: 'Premium Rewards Card', balance: 40000, annualRate: 42.0, minPayment: 2000 },
        { id: 'card_2', name: 'Shopping Credit Card', balance: 60000, annualRate: 36.0, minPayment: 3000 },
        { id: 'card_3', name: 'Low Rate Card', balance: 90000, annualRate: 24.0, minPayment: 3600 },
      ]
    },
    mixedDebts: {
      id: 'mixedDebts',
      title: 'Mixed Credit & Loan Portfolio',
      description: 'Balanced mix of high-interest cards, personal loan, and auto loan.',
      extraMonthlyPayment: 8000,
      debts: [
        { id: 'd_1', name: 'Credit Card', balance: 35000, annualRate: 36.0, minPayment: 1750 },
        { id: 'd_2', name: 'Personal Loan', balance: 120000, annualRate: 16.0, minPayment: 3800 },
        { id: 'd_3', name: 'Car Loan', balance: 250000, annualRate: 9.5, minPayment: 6000 },
      ]
    },
    quickWins: {
      id: 'quickWins',
      title: 'Quick Wins (Snowball Advantage)',
      description: 'Small balances with varying interest rates where Debt Snowball delivers rapid psychological wins.',
      extraMonthlyPayment: 4000,
      debts: [
        { id: 'qw_1', name: 'Medical Bill', balance: 10000, annualRate: 12.0, minPayment: 500 },
        { id: 'qw_2', name: 'Store Card', balance: 25000, annualRate: 30.0, minPayment: 1250 },
        { id: 'qw_3', name: 'Personal Debt', balance: 80000, annualRate: 18.0, minPayment: 2400 },
      ]
    }
  },

  // Input Field Limits
  fieldLimits: {
    maxDebts: 10,
    balance: { min: 0, max: 100000000, step: 1000, label: 'Outstanding Balance' },
    annualRate: { min: 0, max: 100, step: 0.5, label: 'Annual Interest Rate (%)' },
    minPayment: { min: 0, max: 5000000, step: 500, label: 'Minimum Monthly Payment' },
    extraPayment: { min: 0, max: 5000000, step: 1000, label: 'Additional Monthly Payment' },
  }
};
