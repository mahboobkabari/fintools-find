import { calculateNscCalculator } from '../savings/nsc-calculator.js';

export const NSC_CONFIG = {
  id: 'nsc-calculator',
  title: 'National Savings Certificate (NSC) Calculator',
  category: 'Deposit & Savings Calculators',
  categorySlug: 'savings',
  defaultDepositAmount: 150000,
  defaultRate: 7.7,
  defaultTenureYears: 5,
  defaultMarginalTaxRate: 30,

  benchmarks: {
    govtNotifiedNscRate: 7.7,
    tenureYears: 5,
    minDeposit: 1000,
    depositMultiple: 100,
    sec80cMaxCap: 150000,
    expectedFdRateBenchmark: 7.25,
  },

  presets: [
    {
      id: 'max_80c_150k',
      title: '👑 Max Sec 80C Deposit (₹1.5 Lakhs @ 7.7%)',
      description: 'Optimal annual tax-saving deposit utilizing full Section 80C ₹1.5L cap for ₹218,858 maturity corpus.',
      values: {
        depositAmount: 150000,
        rate: 7.7,
        marginalTaxRate: 30,
        currency: 'INR',
      },
    },
    {
      id: 'moderate_100k',
      title: '🛡️ Moderate Tax Saving Deposit (₹1 Lakh @ 7.7%)',
      description: 'Balanced 5-year post office deposit generating ₹44,905 guaranteed interest.',
      values: {
        depositAmount: 100000,
        rate: 7.7,
        marginalTaxRate: 20,
        currency: 'INR',
      },
    },
    {
      id: 'high_500k',
      title: '🚀 High Net-Worth Deposit (₹5 Lakhs @ 7.7%)',
      description: 'High-value sovereign deposit growing to ₹729,528 guaranteed tax-advantaged maturity wealth.',
      values: {
        depositAmount: 500000,
        rate: 7.7,
        marginalTaxRate: 30,
        currency: 'INR',
      },
    },
    {
      id: 'hni_1000k',
      title: '💼 HNI Wealth Deposit (₹10 Lakhs @ 7.7%)',
      description: '₹10 Lakh sovereign allocation generating ₹459,055 total guaranteed interest over 5 years.',
      values: {
        depositAmount: 1000000,
        rate: 7.7,
        marginalTaxRate: 30,
        currency: 'INR',
      },
    },
  ],
};

export const nscCalculatorConfig = {
  ...NSC_CONFIG,
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculateNscCalculator,
  primaryResult: {
    key: 'maturityAmount',
    label: 'Guaranteed 5-Year Maturity Corpus',
  },
  ratioBarItems: [
    { key: 'depositAmount', label: 'Principal Investment', colorClass: 'bg-primary' },
    { key: 'totalInterestEarned', label: 'Total 5-Year Guaranteed Interest', colorClass: 'bg-semantic-up' },
  ],
  summaryItems: [
    { key: 'depositAmount', label: 'Initial Principal Investment' },
    { key: 'totalInterestEarned', label: 'Total 5-Year Guaranteed Interest', class: 'text-semantic-up' },
    { key: 'sec80cYear1Saved', label: 'Year 1 Section 80C Tax Saved', class: 'text-semantic-success' },
    { key: 'totalDeemed80cInterest', label: 'Years 1-4 Deemed Reinvested 80C Interest', class: 'text-purple-600' },
    { key: 'year5TaxableInterest', label: 'Year 5 Taxable Interest at Maturity', class: 'text-semantic-warning' },
    { key: 'maturityAmount', label: 'Guaranteed Maturity Corpus', isTotal: true },
  ],
  inputs: [
    {
      id: 'depositAmount',
      type: 'number',
      label: 'NSC Investment Amount (₹)',
      min: 1000,
      max: 10000000,
      step: 100,
      prefix: '₹',
      minLabel: '₹1,000',
      maxLabel: '₹1 Cr',
      default: 150000,
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
      default: 7.7,
    },
  ],
  hasAmortizationTable: false,
};
