import { calculateIncomeTax } from '../tax/income-tax-calculator.js';

export const incomeTaxCalculatorConfig = {
  title: 'Income Tax Parameters (FY 2025-26)',
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculateIncomeTax,
  primaryResult: {
    key: 'totalTaxPayable',
    label: 'Total Annual Income Tax Payable',
  },
  ratioBarItems: [
    { key: 'netTakeHome', label: 'Net Annual Take-Home', colorClass: 'bg-semantic-up' },
    { key: 'totalTaxPayable', label: 'Income Tax + Cess', colorClass: 'bg-accent-amber' },
  ],
  summaryItems: [
    { key: 'grossIncome', label: 'Gross Annual Income' },
    { key: 'standardDeduction', label: 'Standard Deduction' },
    { key: 'taxableIncome', label: 'Net Taxable Income' },
    { key: 'baseTax', label: 'Base Income Tax' },
    { key: 'healthEduCess', label: 'Health & Education Cess (4%)' },
    { key: 'totalTaxPayable', label: 'Total Income Tax Payable', isTotal: true },
  ],
  inputs: [
    {
      id: 'grossIncome',
      type: 'number',
      label: 'Gross Annual Income (Salary / Business)',
      min: 100000,
      max: 50000000,
      step: 25000,
      prefix: '₹',
      minLabel: '₹1L',
      maxLabel: '₹5 Cr',
      default: 1200000,
    },
    {
      id: 'standardDeduction',
      type: 'number',
      label: 'Standard Deduction',
      min: 0,
      max: 100000,
      step: 5000,
      prefix: '₹',
      minLabel: '₹0',
      maxLabel: '₹1L',
      default: 75000,
    },
  ],
  hasAmortizationTable: false,
};