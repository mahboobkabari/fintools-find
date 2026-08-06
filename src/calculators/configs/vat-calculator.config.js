import { calculateVatCalculator } from '../tax/vat-calculator.js';

export const vatCalculatorConfig = {
  title: 'VAT Details',
  currency: 'generic',
  calculateFn: calculateVatCalculator,
  primaryResult: {
    key: 'grossAmount',
    label: 'Total Gross Price (incl. VAT)',
  },
  ratioBarItems: [
    { key: 'netAmount', label: 'Net Base Price', colorClass: 'bg-primary' },
    { key: 'vatAmount', label: 'VAT Tax Amount', colorClass: 'bg-accent-amber' },
  ],
  summaryItems: [
    { key: 'netAmount', label: 'Net Base Amount' },
    { key: 'vatAmount', label: 'VAT Tax Amount' },
    { key: 'grossAmount', label: 'Total Gross Amount', isTotal: true },
  ],
  inputs: [
    {
      id: 'amount',
      type: 'number',
      label: 'Amount (Net Base or Gross Total)',
      min: 1,
      max: 1000000,
      step: 10,
      minLabel: '1',
      maxLabel: '1,000,000',
      default: 100,
    },
    {
      id: 'rate',
      type: 'number',
      label: 'VAT Percentage Rate (%)',
      min: 0,
      max: 50,
      step: 0.5,
      suffix: '%',
      minLabel: '0%',
      maxLabel: '50%',
      default: 20,
    },
  ],
  hasAmortizationTable: false,
};