import { calculateLoanAmortization } from '../loans/loan-amortization-calculator.js';

export const loanAmortizationCalculatorConfig = {
  title: 'Loan Amortization Details',
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculateLoanAmortization,
  primaryResult: {
    key: 'emi',
    label: 'Monthly EMI',
  },
  ratioBarItems: [
    { key: 'principal', label: 'Principal', colorClass: 'bg-primary' },
    { key: 'totalInterest', label: 'Interest', colorClass: 'bg-accent-amber' },
  ],
  summaryItems: [
    { key: 'principal', label: 'Loan Principal Borrowed' },
    { key: 'totalInterest', label: 'Total Cumulative Interest', class: 'text-semantic-down' },
    { key: 'totalPayment', label: 'Total Principal + Interest', isTotal: true },
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
      min: 1,
      max: 30,
      step: 0.1,
      suffix: '%',
      minLabel: '1%',
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