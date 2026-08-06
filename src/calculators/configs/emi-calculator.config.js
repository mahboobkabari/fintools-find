import { calculateEmi } from '../loans/emi.js';

export const emiCalculatorConfig = {
  title: 'Loan Details',
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculateEmi,
  primaryResult: {
    key: 'emi',
    label: 'Monthly EMI',
  },
  ratioBarItems: [
    { key: 'principal', label: 'Principal', colorClass: 'bg-primary' },
    { key: 'totalInterest', label: 'Interest', colorClass: 'bg-accent-amber' },
  ],
  summaryItems: [
    { key: 'principal', label: 'Principal Amount' },
    { key: 'totalInterest', label: 'Total Interest Payable', class: 'text-semantic-down' },
    { key: 'totalPayment', label: 'Total Amount Payable', isTotal: true },
  ],
  inputs: [
    {
      id: 'amount',
      type: 'number',
      label: 'Loan Amount',
      min: 10000,
      max: 20000000,
      step: 10000,
      prefix: '₹',
      minLabel: '₹10K',
      maxLabel: '₹2 Cr',
      default: 1000000,
    },
    {
      id: 'rate',
      type: 'number',
      label: 'Interest Rate (p.a.)',
      min: 0,
      max: 30,
      step: 0.1,
      suffix: '%',
      minLabel: '0%',
      maxLabel: '30%',
      default: 8.5,
    },
    {
      id: 'tenure',
      type: 'tenure',
      label: 'Tenure',
      maxYears: 30,
      maxMonths: 360,
      default: 20,
    },
  ],
  hasAmortizationTable: true,
};
