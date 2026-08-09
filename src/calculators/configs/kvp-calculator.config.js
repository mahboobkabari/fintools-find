import { calculateKvpCalculator } from '../savings/kvp-calculator.js';

export const KVP_CONFIG = {
  id: 'kvp-calculator',
  title: 'Kisan Vikas Patra (KVP) Calculator',
  category: 'Deposit & Savings Calculators',
  categorySlug: 'savings',
  defaultDepositAmount: 100000,
  defaultRate: 7.5,
  defaultMaturityMonths: 115,
  defaultMarginalTaxRate: 30,

  benchmarks: {
    govtNotifiedKvpRate: 7.5,
    effectivePeriod: 'FY 2024-25 Q4 Notified Rates',
    tenureMonths: 115, // 9 Years 7 Months
    lockInMonths: 30, // 2.5 Years
    minDeposit: 1000,
    depositMultiple: 100,
    maxDepositCap: null, // No upper cap
    nscRateBenchmark: 7.7,
    expectedFdRateBenchmark: 6.75,
    sourceNotice: 'Government of India, Department of Economic Affairs (Kisan Vikas Patra Scheme 2019)',
  },

  // Statutory Premature Encashment Payout Table per ₹1,000 Deposit (Post Office Rules)
  // Lock-in: 30 Months (2.5 Years)
  prematureEncashmentTablePer1000: [
    { months: 30, lockInBlock: '2 Years 6 Months', payout: 1154 },
    { months: 36, lockInBlock: '3 Years 0 Months', payout: 1188 },
    { months: 42, lockInBlock: '3 Years 6 Months', payout: 1223 },
    { months: 48, lockInBlock: '4 Years 0 Months', payout: 1259 },
    { months: 54, lockInBlock: '4 Years 6 Months', payout: 1296 },
    { months: 60, lockInBlock: '5 Years 0 Months', payout: 1334 },
    { months: 66, lockInBlock: '5 Years 6 Months', payout: 1373 },
    { months: 72, lockInBlock: '6 Years 0 Months', payout: 1414 },
    { months: 78, lockInBlock: '6 Years 6 Months', payout: 1455 },
    { months: 84, lockInBlock: '7 Years 0 Months', payout: 1498 },
    { months: 90, lockInBlock: '7 Years 6 Months', payout: 1542 },
    { months: 96, lockInBlock: '8 Years 0 Months', payout: 1587 },
    { months: 102, lockInBlock: '8 Years 6 Months', payout: 1634 },
    { months: 108, lockInBlock: '9 Years 0 Months', payout: 1682 },
    { months: 115, lockInBlock: '9 Years 7 Months (Maturity)', payout: 2000 },
  ],

  presets: [
    {
      id: 'starter_100k',
      title: '👑 Starter Double Money (₹1 Lakh $\\rightarrow$ ₹2 Lakhs)',
      description: 'Standard deposit doubling ₹1,00,000 into ₹2,00,000 in 115 months with sovereign security.',
      values: {
        depositAmount: 100000,
        rate: 7.5,
        marginalTaxRate: 30,
        currency: 'INR',
      },
    },
    {
      id: 'high_growth_500k',
      title: '🚀 High Growth Sovereign Deposit (₹5 Lakhs $\\rightarrow$ ₹10 Lakhs)',
      description: 'High allocation doubling ₹5,00,000 into ₹10,00,000 in 9 years 7 months.',
      values: {
        depositAmount: 500000,
        rate: 7.5,
        marginalTaxRate: 30,
        currency: 'INR',
      },
    },
    {
      id: 'hni_preservation_1000k',
      title: '🛡️ HNI Wealth Preservation (₹10 Lakhs $\\rightarrow$ ₹20 Lakhs)',
      description: 'Capital preservation doubling ₹10,00,000 into ₹20,00,000 with 100% Govt of India guarantee.',
      values: {
        depositAmount: 1000000,
        rate: 7.5,
        marginalTaxRate: 30,
        currency: 'INR',
      },
    },
    {
      id: 'micro_savings_10k',
      title: '🌱 Micro Small Savings (₹10,000 $\\rightarrow$ ₹20,000)',
      description: 'Entry-level small savings doubling ₹10,000 into ₹20,00,000 in 115 months.',
      values: {
        depositAmount: 10000,
        rate: 7.5,
        marginalTaxRate: 20,
        currency: 'INR',
      },
    },
  ],
};

export const kvpCalculatorConfig = {
  ...KVP_CONFIG,
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculateKvpCalculator,
  primaryResult: {
    key: 'maturityAmount',
    label: 'Guaranteed KVP Maturity Corpus',
  },
  ratioBarItems: [
    { key: 'depositAmount', label: 'Principal Investment', colorClass: 'bg-primary' },
    { key: 'totalInterestEarned', label: 'Total Interest Earned (Doubled Principal)', colorClass: 'bg-semantic-up' },
  ],
  summaryItems: [
    { key: 'depositAmount', label: 'Principal Investment Deposit' },
    { key: 'totalInterestEarned', label: 'Total Compound Interest Earned', class: 'text-emerald-600 font-bold' },
    { key: 'maturityAmount', label: 'Doubled Maturity Value at Month 115', isTotal: true },
    { key: 'annualTaxEstimate', label: 'Estimated Annual Income Tax (Slab Rate)', class: 'text-amber-600' },
  ],
  inputs: [
    {
      id: 'depositAmount',
      type: 'number',
      label: 'KVP Principal Investment (₹)',
      min: 1000,
      max: 10000000,
      step: 100,
      prefix: '₹',
      minLabel: '₹1,000',
      maxLabel: 'No Upper Limit',
      default: 100000,
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
      default: 7.5,
    },
  ],
  hasAmortizationTable: true,
};
