/**
 * Configuration, educational presets, metadata, and default parameters for Net Worth Calculator.
 */

import {
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
  CONCENTRATION_THRESHOLDS,
} from '../salary/net-worth-calculator.js';

export const NET_WORTH_CONFIG = {
  id: 'net-worth-calculator',
  name: 'Net Worth Calculator',
  slug: 'net-worth-calculator',
  category: 'salary',
  categoryName: 'Personal/Salary Calculators',
  metaTitle: 'Net Worth Calculator: Assets, Liabilities & Wealth Balance Sheet',
  metaDescription: 'Calculate total net worth, liquid net worth, investable assets, home equity, debt-to-asset ratio, wealth concentration, and scenario forecasting.',

  fieldLimits: {
    maxItems: 30,
  },

  currencies: [
    { code: 'USD', symbol: '$', label: 'USD ($)' },
    { code: 'INR', symbol: '₹', label: 'INR (₹)' },
    { code: 'EUR', symbol: '€', label: 'EUR (€)' },
    { code: 'GBP', symbol: '£', label: 'GBP (£)' },
    { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
    { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
    { code: 'AED', symbol: 'د.إ', label: 'AED (د.إ)' },
    { code: 'SGD', symbol: 'S$', label: 'SGD (S$)' },
    { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
  ],

  defaults: {
    currency: 'USD',
    monthlyExpenses: 4500,
    assets: [
      { id: 'a1', name: 'Checking & Cash', categoryId: 'cash', value: 15000, isLiquid: true },
      { id: 'a2', name: 'High-Yield Savings', categoryId: 'savings_cd', value: 25000, isLiquid: true },
      { id: 'a3', name: 'Stock & ETF Portfolio', categoryId: 'stocks_etfs', value: 85000, isLiquid: true },
      { id: 'a4', name: '401(k) / Retirement', categoryId: 'retirement', value: 120000, isLiquid: false },
      { id: 'a5', name: 'Primary Home (Estimated Market Value)', categoryId: 'primary_home', value: 450000, isLiquid: false },
    ],
    liabilities: [
      { id: 'l1', name: 'Mortgage Principal Balance', categoryId: 'mortgage', balance: 280000 },
      { id: 'l2', name: 'Auto Loan Balance', categoryId: 'auto_loan', balance: 14000 },
      { id: 'l3', name: 'Credit Card (Current Statement)', categoryId: 'credit_card', balance: 2500 },
    ],
  },

  presets: [
    {
      id: 'young_professional',
      label: 'Young Professional ($112k Net Worth)',
      icon: '🚀',
      desc: 'Early-career professional with liquid savings, 401(k) retirement balance, student loan, and auto loan.',
      currency: 'USD',
      monthlyExpenses: 3500,
      assets: [
        { id: 'yp1', name: 'Checking Account', categoryId: 'cash', value: 8000, isLiquid: true },
        { id: 'yp2', name: 'Emergency Fund', categoryId: 'emergency', value: 18000, isLiquid: true },
        { id: 'yp3', name: '401(k) Retirement', categoryId: 'retirement', value: 45000, isLiquid: false },
        { id: 'yp4', name: 'Roth IRA & Stocks', categoryId: 'stocks_etfs', value: 25000, isLiquid: true },
        { id: 'yp5', name: 'Crypto Holdings', categoryId: 'crypto', value: 8000, isLiquid: true },
        { id: 'yp6', name: 'Used Vehicle Value', categoryId: 'vehicles', value: 18000, isLiquid: false },
      ],
      liabilities: [
        { id: 'ypl1', name: 'Federal Student Loans', categoryId: 'student_loan', balance: 12000 },
        { id: 'ypl2', name: 'Auto Loan', categoryId: 'auto_loan', balance: 6500 },
        { id: 'ypl3', name: 'Credit Card Balance', categoryId: 'credit_card', balance: 1500 },
      ],
    },
    {
      id: 'high_income_homeowner',
      label: 'High-Income Homeowner ($1.05M Net Worth)',
      icon: '🏡',
      desc: 'Established homeowner with $850k real estate, sizable equities, 401(k), and low-interest mortgage.',
      currency: 'USD',
      monthlyExpenses: 8000,
      assets: [
        { id: 'ho1', name: 'Cash & Checking', categoryId: 'cash', value: 25000, isLiquid: true },
        { id: 'ho2', name: 'Treasury Bills & CD', categoryId: 'savings_cd', value: 50000, isLiquid: true },
        { id: 'ho3', name: 'Brokerage Stock Portfolio', categoryId: 'stocks_etfs', value: 320000, isLiquid: true },
        { id: 'ho4', name: 'Retirement Accounts (401k/IRA)', categoryId: 'retirement', value: 280000, isLiquid: false },
        { id: 'ho5', name: 'Primary Residence', categoryId: 'primary_home', value: 850000, isLiquid: false },
        { id: 'ho6', name: 'Vehicles', categoryId: 'vehicles', value: 45000, isLiquid: false },
      ],
      liabilities: [
        { id: 'hol1', name: '30-Yr Fixed Mortgage', categoryId: 'mortgage', balance: 485000 },
        { id: 'hol2', name: 'Auto Loan', categoryId: 'auto_loan', balance: 18000 },
        { id: 'hol3', name: 'Monthly Credit Cards', categoryId: 'credit_card', balance: 4000 },
      ],
    },
    {
      id: 'debt_payoff_journey',
      label: 'Debt Payoff Journey (-$22k Net Worth)',
      icon: '🎯',
      desc: 'Borrower aggressively eliminating high-interest consumer debt, student loans, and rebuilding positive equity.',
      currency: 'USD',
      monthlyExpenses: 2800,
      assets: [
        { id: 'dp1', name: 'Checking Account', categoryId: 'cash', value: 2500, isLiquid: true },
        { id: 'dp2', name: 'Starter Emergency Fund', categoryId: 'emergency', value: 5000, isLiquid: true },
        { id: 'dp3', name: '401(k) Employer Match', categoryId: 'retirement', value: 12000, isLiquid: false },
        { id: 'dp4', name: 'Vehicle Resale Value', categoryId: 'vehicles', value: 10000, isLiquid: false },
      ],
      liabilities: [
        { id: 'dpl1', name: 'Credit Card Debt (High APR)', categoryId: 'credit_card', balance: 18500 },
        { id: 'dpl2', name: 'Consolidation Personal Loan', categoryId: 'personal_loan', balance: 12000 },
        { id: 'dpl3', name: 'Student Loans', categoryId: 'student_loan', balance: 21000 },
      ],
    },
    {
      id: 'investor_portfolio',
      label: 'Equity & Crypto Investor ($565k Net Worth)',
      icon: '📈',
      desc: 'Debt-free active investor with diversified equity index funds, dividend stocks, and digital assets.',
      currency: 'USD',
      monthlyExpenses: 4000,
      assets: [
        { id: 'inv1', name: 'High-Yield Cash Reserve', categoryId: 'savings_cd', value: 40000, isLiquid: true },
        { id: 'inv2', name: 'Index Funds & ETFs', categoryId: 'stocks_etfs', value: 280000, isLiquid: true },
        { id: 'inv3', name: 'Roth IRA & 401(k)', categoryId: 'retirement', value: 165000, isLiquid: false },
        { id: 'inv4', name: 'Bitcoin & Ethereum', categoryId: 'crypto', value: 65000, isLiquid: true },
        { id: 'inv5', name: 'Precious Metals (Gold/Silver)', categoryId: 'precious_metals', value: 15000, isLiquid: false },
      ],
      liabilities: [
        { id: 'invl1', name: 'Credit Card Paid in Full', categoryId: 'credit_card', balance: 1200 },
      ],
    },
    {
      id: 'family_balance_sheet',
      label: 'Family Balance Sheet (₹1.15 Cr Net Worth)',
      icon: '👨‍👩‍👧',
      desc: 'Indian dual-income family with primary residence, EPF/PPF retirement, mutual fund SIPs, and home loan.',
      currency: 'INR',
      monthlyExpenses: 80000,
      assets: [
        { id: 'fam1', name: 'Bank Savings & FDs', categoryId: 'cash', value: 800000, isLiquid: true },
        { id: 'fam2', name: 'Equity Mutual Funds & SIPs', categoryId: 'stocks_etfs', value: 2500000, isLiquid: true },
        { id: 'fam3', name: 'EPF & PPF Balances', categoryId: 'retirement', value: 2200000, isLiquid: false },
        { id: 'fam4', name: 'Primary 3BHK Apartment', categoryId: 'primary_home', value: 9500000, isLiquid: false },
        { id: 'fam5', name: 'Family Car', categoryId: 'vehicles', value: 600000, isLiquid: false },
        { id: 'fam6', name: 'Gold Jewellery', categoryId: 'precious_metals', value: 500000, isLiquid: false },
      ],
      liabilities: [
        { id: 'faml1', name: 'Home Loan Balance', categoryId: 'mortgage', balance: 4200000 },
        { id: 'faml2', name: 'Car Loan Balance', categoryId: 'auto_loan', balance: 350000 },
        { id: 'faml3', name: 'Credit Card Monthly Bill', categoryId: 'credit_card', balance: 50000 },
      ],
    },
    {
      id: 'pre_retirement_wealth',
      label: 'Pre-Retirement Wealth ($1.85M Net Worth)',
      icon: '🏖️',
      desc: 'Mature household approaching financial independence with paid-off real estate and large investment corpus.',
      currency: 'USD',
      monthlyExpenses: 6500,
      assets: [
        { id: 'ret1', name: 'Liquid Cash & Money Market', categoryId: 'savings_cd', value: 85000, isLiquid: true },
        { id: 'ret2', name: 'Taxable Brokerage Portfolio', categoryId: 'stocks_etfs', value: 450000, isLiquid: true },
        { id: 'ret3', name: '401(k) / Traditional IRA', categoryId: 'retirement', value: 850000, isLiquid: false },
        { id: 'ret4', name: 'Roth IRA Accounts', categoryId: 'retirement', value: 220000, isLiquid: false },
        { id: 'ret5', name: 'Paid-Off Primary Residence', categoryId: 'primary_home', value: 600000, isLiquid: false },
        { id: 'ret6', name: 'Municipal Bonds', categoryId: 'bonds', value: 120000, isLiquid: true },
      ],
      liabilities: [
        { id: 'retl1', name: 'Credit Card Paid Monthly', categoryId: 'credit_card', balance: 1800 },
      ],
    },
  ],

  assetCategories: ASSET_CATEGORIES,
  liabilityCategories: LIABILITY_CATEGORIES,
  concentrationThresholds: CONCENTRATION_THRESHOLDS,
};
