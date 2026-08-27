/**
 * Net Worth Calculator Configuration Module
 * 
 * Defines metadata, input field boundaries, classification structures,
 * and illustrative example presets.
 */

export const NET_WORTH_CONFIG = {
  metadata: {
    title: 'Net Worth Calculator',
    slug: 'net-worth-calculator',
    category: 'salary',
    categoryName: 'Personal & Salary Calculators',
    lastUpdated: '2026-08-01',
    financialAuthority: 'Personal Accounting Standards & Wealth Management Principles',
  },

  financialMethodology: 'Standard balance-sheet/accounting identity (Net Worth = Total Assets - Total Liabilities).',

  classifications: {
    statutory: [],
    userInputs: [
      'Cash and Bank Balances',
      'Emergency Savings',
      'Investment Portfolios (Stocks, Mutual Funds, Bonds)',
      'Retirement Accounts (EPF, PPF, NPS, 401k)',
      'Real Estate & Property Valuation',
      'Vehicles & Automobiles',
      'Credit Card Outstanding Balances',
      'Personal & Education Loans',
      'Mortgages & Home Loans'
    ],
    marketAssumptions: [
      { name: 'Property & Equity Valuation Basis', description: 'Asset valuations represent current estimated market values or liquid market prices.' },
      { name: 'Scenario Asset Growth Rate', description: 'Illustrative annual compounding asset growth assumption (e.g. 6.0% - 10.0% p.a.).' }
    ],
    lenderAssumptions: [
      { name: 'Liability Settlement Balances', description: 'Outstanding debt figures represent current principal settlement balances owed to financial institutions.' }
    ]
  },

  // Default Asset & Liability Portfolio
  defaultAssets: [
    { id: 'a1', name: 'Savings Account & Cash', categoryId: 'cash', value: 150000, isLiquid: true },
    { id: 'a2', name: 'Mutual Funds & Stocks', categoryId: 'stocks_mf', value: 450000, isLiquid: true },
    { id: 'a3', name: 'EPF & PPF Balance', categoryId: 'epf_ppf', value: 600000, isLiquid: false },
    { id: 'a4', name: 'Primary Residence (Home)', categoryId: 'real_estate', value: 4500000, isLiquid: false },
  ],

  defaultLiabilities: [
    { id: 'l1', name: 'Credit Card Outstanding', categoryId: 'credit_cards', balance: 25000 },
    { id: 'l2', name: 'Home Loan Balance', categoryId: 'mortgages', balance: 2200000 },
  ],

  defaultMonthlyExpenses: 50000,

  // Scenario Presets (Illustrative Examples Only)
  scenarios: {
    youngProfessional: {
      id: 'youngProfessional',
      title: 'Young Professional',
      description: 'Early career focus on liquid savings, initial mutual fund investments, and minimal debt.',
      monthlyExpenses: 40000,
      assets: [
        { id: 'yp_a1', name: 'Bank Balance', categoryId: 'cash', value: 100000, isLiquid: true },
        { id: 'yp_a2', name: 'SIP Investments', categoryId: 'stocks_mf', value: 250000, isLiquid: true },
        { id: 'yp_a3', name: 'EPF Account', categoryId: 'epf_ppf', value: 180000, isLiquid: false },
      ],
      liabilities: [
        { id: 'yp_l1', name: 'Credit Card', categoryId: 'credit_cards', balance: 15000 },
        { id: 'yp_l2', name: 'Education Loan', categoryId: 'student_loans', balance: 150000 },
      ]
    },
    midCareerFamily: {
      id: 'midCareerFamily',
      title: 'Mid-Career Family',
      description: 'Diversified wealth across home ownership, EPF retirement, equity SIPs, and home loan debt.',
      monthlyExpenses: 75000,
      assets: [
        { id: 'mc_a1', name: 'Emergency Savings', categoryId: 'emergency', value: 300000, isLiquid: true },
        { id: 'mc_a2', name: 'Mutual Funds & Stocks', categoryId: 'stocks_mf', value: 1200000, isLiquid: true },
        { id: 'mc_a3', name: 'EPF & NPS Corpus', categoryId: 'epf_ppf', value: 1500000, isLiquid: false },
        { id: 'mc_a4', name: 'Apartment Valuation', categoryId: 'real_estate', value: 6500000, isLiquid: false },
        { id: 'mc_a5', name: 'Family SUV Car', categoryId: 'vehicles', value: 600000, isLiquid: false },
      ],
      liabilities: [
        { id: 'mc_l1', name: 'Home Loan Balance', categoryId: 'mortgages', balance: 3200000 },
        { id: 'mc_l2', name: 'Car Loan Balance', categoryId: 'auto_loans', balance: 250000 },
      ]
    },
    realEstateOwner: {
      id: 'reOwner',
      title: 'Real Estate & Property Owner',
      description: 'High asset allocation in residential/commercial real estate with rental cash flows.',
      monthlyExpenses: 90000,
      assets: [
        { id: 're_a1', name: 'Liquid Bank Deposit', categoryId: 'cash', value: 500000, isLiquid: true },
        { id: 're_a2', name: 'Primary Residence', categoryId: 'real_estate', value: 9500000, isLiquid: false },
        { id: 're_a3', name: 'Rental Property', categoryId: 'real_estate', value: 5500000, isLiquid: false },
        { id: 're_a4', name: 'Gold & Jewelry', categoryId: 'other_assets', value: 800000, isLiquid: false },
      ],
      liabilities: [
        { id: 're_l1', name: 'Rental Property Loan', categoryId: 'mortgages', balance: 2400000 },
      ]
    },
    debtElimination: {
      id: 'debtElimination',
      title: 'Debt Elimination Phase',
      description: 'High debt relative to assets; focused on aggressive liability reduction and cash stabilization.',
      monthlyExpenses: 45000,
      assets: [
        { id: 'de_a1', name: 'Cash Buffer', categoryId: 'cash', value: 80000, isLiquid: true },
        { id: 'de_a2', name: 'Small Mutual Fund', categoryId: 'stocks_mf', value: 120000, isLiquid: true },
        { id: 'de_a3', name: 'Used Car', categoryId: 'vehicles', value: 250000, isLiquid: false },
      ],
      liabilities: [
        { id: 'de_l1', name: 'Multiple Credit Cards', categoryId: 'credit_cards', balance: 180000 },
        { id: 'de_l2', name: 'Personal Loan', categoryId: 'personal_loans', balance: 350000 },
        { id: 'de_l3', name: 'Auto Loan', categoryId: 'auto_loans', balance: 120000 },
      ]
    }
  },

  fieldLimits: {
    maxItems: 15,
    assetValue: { min: 0, max: 1000000000, step: 10000, label: 'Asset Value' },
    liabilityBalance: { min: 0, max: 1000000000, step: 10000, label: 'Liability Balance' },
    monthlyExpenses: { min: 0, max: 10000000, step: 5000, label: 'Monthly Expenses' },
    growthRate: { min: -10, max: 25, step: 0.5, label: 'Asset Growth Rate (% p.a.)' },
    annualSavings: { min: 0, max: 100000000, step: 25000, label: 'Annual Savings Contribution' },
  }
};
