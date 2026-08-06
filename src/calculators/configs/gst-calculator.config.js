import { calculateGst } from '../tax/gst-calculator.js';

export const gstCalculatorConfig = {
  title: 'GST Amount & Rate Details',
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculateGst,
  primaryResult: {
    key: 'grossAmount',
    label: 'Total Gross Amount (incl. GST)',
  },
  ratioBarItems: [
    { key: 'netAmount', label: 'Net Base Price', colorClass: 'bg-primary' },
    { key: 'gstAmount', label: 'GST Amount', colorClass: 'bg-accent-amber' },
  ],
  summaryItems: [
    { key: 'netAmount', label: 'Net Base Amount' },
    { key: 'gstAmount', label: 'Total GST Amount' },
    { key: 'cgst', label: 'Central GST (CGST - 50%)' },
    { key: 'sgst', label: 'State GST (SGST - 50%)' },
    { key: 'grossAmount', label: 'Final Gross Bill Total', isTotal: true },
  ],
  inputs: [
    {
      id: 'amount',
      type: 'number',
      label: 'Amount (Net Base or Gross Total)',
      min: 100,
      max: 10000000,
      step: 500,
      prefix: '₹',
      minLabel: '₹100',
      maxLabel: '₹1 Cr',
      default: 10000,
    },
    {
      id: 'gstRate',
      type: 'number',
      label: 'GST Slab Rate (%)',
      min: 0,
      max: 40,
      step: 1,
      suffix: '%',
      minLabel: '0%',
      maxLabel: '40%',
      default: 18,
    },
  ],
  hasAmortizationTable: false,
};