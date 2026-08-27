import { calculateVatCalculator } from '../tax/vat-calculator.js';

export const VAT_PRESETS = [
  {
    id: 'uk_standard',
    name: 'UK Standard Rate (20%)',
    description: '£1,000 Standard Commercial Supply @ 20% UK VAT',
    badge: 'UK 20%',
    values: {
      amount: 1000,
      rate: 20,
      mode: 'exclusive',
      currencySymbol: '£',
    },
  },
  {
    id: 'uk_reduced',
    name: 'UK Reduced Rate (5%)',
    description: '£500 Domestic Energy & Child Car Seats @ 5% Reduced VAT',
    badge: 'UK 5%',
    values: {
      amount: 500,
      rate: 5,
      mode: 'exclusive',
      currencySymbol: '£',
    },
  },
  {
    id: 'germany_standard',
    name: 'Germany Standard MwSt (19%)',
    description: '€2,000 Standard Commercial Sales @ 19% German MwSt',
    badge: 'DE 19%',
    values: {
      amount: 2000,
      rate: 19,
      mode: 'exclusive',
      currencySymbol: '€',
    },
  },
  {
    id: 'france_standard',
    name: 'France Standard TVA (20%)',
    description: '€1,500 General Goods & Services @ 20% French TVA',
    badge: 'FR 20%',
    values: {
      amount: 1500,
      rate: 20,
      mode: 'exclusive',
      currencySymbol: '€',
    },
  },
  {
    id: 'uae_gcc',
    name: 'UAE & GCC Standard VAT (5%)',
    description: 'AED 10,000 Corporate Billing @ 5% UAE VAT',
    badge: 'UAE 5%',
    values: {
      amount: 10000,
      rate: 5,
      mode: 'exclusive',
      currencySymbol: 'AED ',
    },
  },
  {
    id: 'reverse_vat',
    name: 'Consumer Retail MRP Reverse VAT (20%)',
    description: 'Extract Base Taxable Value from £1,200 Tax-Inclusive Invoice',
    badge: 'Reverse VAT',
    values: {
      amount: 1200,
      rate: 20,
      mode: 'inclusive',
      currencySymbol: '£',
    },
  },
];

export const vatCalculatorConfig = {
  title: 'Value Added Tax (VAT) Amount & Rate Details',
  currency: 'GBP',
  currencySymbol: '£',
  calculateFn: calculateVatCalculator,
  presets: VAT_PRESETS,
  defaultAmount: 1000,
  defaultRate: 20,
  defaultMode: 'exclusive',
  primaryResult: {
    key: 'grossAmount',
    label: 'Total Gross Amount (incl. VAT)',
  },
  ratioBarItems: [
    { key: 'netAmount', label: 'Net Base Price', colorClass: 'bg-primary' },
    { key: 'vatAmount', label: 'VAT Tax Amount', colorClass: 'bg-accent-amber' },
  ],
  summaryItems: [
    { key: 'netAmount', label: 'Net Base Price (Pre-Tax)' },
    { key: 'vatAmount', label: 'Value Added Tax (VAT)' },
    { key: 'grossAmount', label: 'Total Gross Bill Amount', isTotal: true },
  ],
  inputs: [
    {
      id: 'amount',
      type: 'number',
      label: 'Amount (Net Base or Gross Total)',
      min: 10,
      max: 1000000,
      step: 50,
      prefix: '£',
      minLabel: '£10',
      maxLabel: '£1M',
      default: 1000,
    },
    {
      id: 'rate',
      type: 'number',
      label: 'VAT Tax Rate (%)',
      min: 0,
      max: 50,
      step: 0.5,
      suffix: '%',
      minLabel: '0%',
      maxLabel: '50%',
      default: 20,
    },
    {
      id: 'mode',
      type: 'select',
      label: 'Calculation Mode',
      default: 'exclusive',
    },
  ],
  hasAmortizationTable: false,
};