import { calculatePomisCalculator } from '../savings/pomis-calculator.js';

export const POMIS_CONFIG = {
  id: 'pomis-calculator',
  title: 'Post Office Monthly Income Scheme (POMIS) Calculator',
  category: 'Deposit & Savings Calculators',
  categorySlug: 'savings',
  defaultDepositAmount: 900000,
  defaultAccountType: 'single',
  defaultRate: 7.4,
  defaultTenureYears: 5,
  defaultMarginalTaxRate: 30,

  benchmarks: {
    govtNotifiedPomisRate: 7.4,
    tenureYears: 5,
    minDeposit: 1000,
    depositMultiple: 1000,
    singleMaxCap: 900000,
    jointMaxCap: 1500000,
    expectedFdRateBenchmark: 6.75,
    scssRateBenchmark: 8.2,
    prematurePenalty1To3Years: 2.0, // 2% principal deduction
    prematurePenalty3To5Years: 1.0, // 1% principal deduction
    sourceNotice: 'Government of India, Department of Economic Affairs (National Savings Monthly Income Account Scheme 2019)',
    effectivePeriod: 'FY 2024-25 Q4 Notified Rates',
  },

  presets: [
    {
      id: 'max_single_900k',
      title: '👑 Max Single Account (₹9 Lakhs @ 7.4%)',
      description: 'Maximum individual statutory limit generating ₹5,550 guaranteed monthly income.',
      values: {
        depositAmount: 900000,
        accountType: 'single',
        rate: 7.4,
        marginalTaxRate: 30,
        currency: 'INR',
      },
    },
    {
      id: 'max_joint_1500k',
      title: '👥 Max Joint Account (₹15 Lakhs @ 7.4%)',
      description: 'Maximum joint account statutory deposit generating ₹9,250 guaranteed monthly income.',
      values: {
        depositAmount: 1500000,
        accountType: 'joint',
        rate: 7.4,
        marginalTaxRate: 30,
        currency: 'INR',
      },
    },
    {
      id: 'moderate_500k',
      title: '🛡️ Moderate Income Deposit (₹5 Lakhs @ 7.4%)',
      description: 'Balanced 5-year post office deposit generating ₹3,083 guaranteed monthly interest.',
      values: {
        depositAmount: 500000,
        accountType: 'single',
        rate: 7.4,
        marginalTaxRate: 20,
        currency: 'INR',
      },
    },
    {
      id: 'starter_100k',
      title: '🌱 Starter Monthly Deposit (₹1 Lakh @ 7.4%)',
      description: 'Entry-level deposit generating ₹617 guaranteed monthly passive cash flow.',
      values: {
        depositAmount: 100000,
        accountType: 'single',
        rate: 7.4,
        marginalTaxRate: 10,
        currency: 'INR',
      },
    },
  ],
};

export const pomisCalculatorConfig = {
  ...POMIS_CONFIG,
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculatePomisCalculator,
  primaryResult: {
    key: 'monthlyIncome',
    label: 'Guaranteed Monthly Income',
  },
  ratioBarItems: [
    { key: 'depositAmount', label: 'Principal Deposit', colorClass: 'bg-primary' },
    { key: 'total5YearInterest', label: 'Total 5-Year Interest Payout', colorClass: 'bg-semantic-up' },
  ],
  summaryItems: [
    { key: 'depositAmount', label: 'Principal Investment Deposit' },
    { key: 'monthlyIncome', label: 'Guaranteed Monthly Interest Income', class: 'text-emerald-600 font-bold' },
    { key: 'annualIncome', label: 'Annual Interest Income' },
    { key: 'total5YearInterest', label: 'Total 5-Year Interest Earned', class: 'text-purple-600 font-bold' },
    { key: 'taxableIncomeEstimate', label: 'Estimated Annual Income Tax (Slab Rate)', class: 'text-amber-600' },
    { key: 'maturityAmount', label: 'Principal Returned at 5-Year Maturity', isTotal: true },
  ],
  inputs: [
    {
      id: 'depositAmount',
      type: 'number',
      label: 'POMIS Deposit Amount (₹)',
      min: 1000,
      max: 1500000,
      step: 1000,
      prefix: '₹',
      minLabel: '₹1,000',
      maxLabel: '₹15 Lakhs (Joint Max)',
      default: 900000,
    },
    {
      id: 'accountType',
      type: 'select',
      label: 'Account Ownership Type',
      options: [
        { value: 'single', label: 'Single Account (Max ₹9 Lakhs)' },
        { value: 'joint', label: 'Joint Account (Max ₹15 Lakhs)' },
      ],
      default: 'single',
    },
    {
      id: 'rate',
      type: 'number',
      label: 'Notified Interest Rate (% p.a.)',
      min: 1,
      max: 15,
      step: 0.1,
      suffix: '%',
      minLabel: '1.0%',
      maxLabel: '15.0%',
      default: 7.4,
    },
  ],
  hasAmortizationTable: false,
};
