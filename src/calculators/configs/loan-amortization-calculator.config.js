import { calculateLoanAmortization } from '../loans/loan-amortization-calculator.js';

export const LOAN_AMORTIZATION_CONFIG = {
  id: 'loan-amortization-calculator',
  title: 'Loan Amortization Schedule Calculator',
  category: 'Loan & EMI Calculators',
  categorySlug: 'loans',
  defaultInterestRate: 8.5,
  defaultTenureYears: 15,
  defaultPrincipal: 1000000,

  presets: [
    {
      id: 'home_loan_15y',
      title: '🏠 Home Loan 15Y (₹25 Lakh @ 8.5%)',
      description: 'Standard 15-year Indian home loan amortization with Section 24b/80C tax breakdown.',
      values: {
        amount: 2500000,
        rate: 8.5,
        tenure: 15,
        tenureType: 'years',
        prepaymentMonthly: 0,
        currency: 'INR',
      },
    },
    {
      id: 'us_mortgage_30y',
      title: '🇺🇸 US Mortgage 30Y ($300k @ 6.5%)',
      description: 'Standard 30-year fixed US home mortgage amortization schedule with principal vs interest tracking.',
      values: {
        amount: 300000,
        rate: 6.5,
        tenure: 30,
        tenureType: 'years',
        prepaymentMonthly: 0,
        currency: 'USD',
      },
    },
    {
      id: 'auto_loan_5y',
      title: '🚘 Car Loan 5Y (₹8 Lakh @ 8.75%)',
      description: '5-year auto loan amortization showing accelerated balance payoff.',
      values: {
        amount: 800000,
        rate: 8.75,
        tenure: 5,
        tenureType: 'years',
        prepaymentMonthly: 1000,
        currency: 'INR',
      },
    },
    {
      id: 'personal_loan_3y',
      title: '💳 Personal Loan 3Y (₹5 Lakh @ 11.5%)',
      description: 'High-interest personal loan amortization with extra monthly prepayment simulation.',
      values: {
        amount: 500000,
        rate: 11.5,
        tenure: 3,
        tenureType: 'years',
        prepaymentMonthly: 2000,
        currency: 'INR',
      },
    },
  ],

  benchmarks: {
    homeLoanRate: 8.5,
    carLoanRate: 8.75,
    personalLoanRate: 11.5,
    educationLoanRate: 9.5,
    sec24bTaxLimit: 200000,
    sec80cTaxLimit: 150000,
  },
};

export const loanAmortizationCalculatorConfig = {
  ...LOAN_AMORTIZATION_CONFIG,
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculateLoanAmortization,
  primaryResult: {
    key: 'emi',
    label: 'Monthly EMI',
  },
  ratioBarItems: [
    { key: 'principal', label: 'Principal', colorClass: 'bg-primary' },
    { key: 'totalInterest', label: 'Total Interest', colorClass: 'bg-accent-amber' },
  ],
  summaryItems: [
    { key: 'principal', label: 'Loan Principal Borrowed' },
    { key: 'totalInterest', label: 'Total Cumulative Interest Outgo', class: 'text-semantic-down' },
    { key: 'totalPayment', label: 'Total Principal + Interest Paid', isTotal: true },
  ],
  inputs: [
    {
      id: 'amount',
      type: 'number',
      label: 'Loan Principal Amount',
      min: 10000,
      max: 50000000,
      step: 10000,
      prefix: '₹',
      minLabel: '₹10K',
      maxLabel: '₹5 Cr',
      default: 1000000,
    },
    {
      id: 'rate',
      type: 'number',
      label: 'Interest Rate (p.a.)',
      min: 0.1,
      max: 30,
      step: 0.1,
      suffix: '%',
      minLabel: '0.1%',
      maxLabel: '30%',
      default: 8.5,
    },
    {
      id: 'tenure',
      type: 'tenure',
      label: 'Loan Tenure',
      maxYears: 30,
      maxMonths: 360,
      default: 15,
    },
  ],
  hasAmortizationTable: true,
};