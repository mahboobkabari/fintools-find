import { calculateTdsCalculator } from '../tax/tds-calculator.js';

export const tdsCalculatorConfig = {
  title: 'TDS Deduction Details',
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculateTdsCalculator,
  primaryResult: {
    key: 'tdsAmount',
    label: 'Total Tax Deducted at Source (TDS)',
  },
  ratioBarItems: [
    { key: 'netPayout', label: 'Net Cash Payout', colorClass: 'bg-semantic-up' },
    { key: 'tdsAmount', label: 'TDS Amount', colorClass: 'bg-accent-amber' },
  ],
  summaryItems: [
    { key: 'grossAmount', label: 'Gross Bill / Payment Amount' },
    { key: 'tdsAmount', label: 'Total Tax Deducted at Source (TDS)', isTotal: true },
    { key: 'netPayout', label: 'Net Cash Amount Receivable', class: 'text-semantic-up' },
  ],
  inputs: [
    {
      id: 'amount',
      type: 'number',
      label: 'Gross Invoice / Payment Amount (₹)',
      min: 1000,
      max: 50000000,
      step: 5000,
      prefix: '₹',
      minLabel: '₹1K',
      maxLabel: '₹5 Cr',
      default: 100000,
    },
    {
      id: 'tdsRate',
      type: 'number',
      label: 'Prescribed TDS Rate (%)',
      min: 0.1,
      max: 30,
      step: 0.5,
      suffix: '%',
      minLabel: '0.1%',
      maxLabel: '30%',
      default: 10,
    },
  ],
  hasAmortizationTable: false,
};