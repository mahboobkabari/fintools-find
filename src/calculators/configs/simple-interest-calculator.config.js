import { calculateSimpleInterestCalculator } from '../investment/simple-interest-calculator.js';

export const SIMPLE_INTEREST_CONFIG = {
  id: 'simple-interest-calculator',
  title: 'Simple Interest Calculator',
  category: 'Investment Calculators',
  categorySlug: 'investment',
  defaultPrincipal: 100000,
  defaultRate: 8.0,
  defaultDurationValue: 5,
  defaultDurationUnit: 'years',
  defaultInflationRate: 5.0,
  daysPerYear: 365,

  durationUnits: [
    { id: 'years', label: 'Years' },
    { id: 'months', label: 'Months' },
    { id: 'days', label: 'Days' },
  ],

  presets: [
    {
      id: 'standard_deposit_5y',
      title: '💰 Standard 5-Year Deposit (₹1L @ 8% p.a. for 5 Years)',
      description: 'Standard 5-year simple interest investment deposit.',
      values: {
        principal: 100000,
        rate: 8.0,
        durationValue: 5,
        durationUnit: 'years',
        currency: 'INR',
      },
    },
    {
      id: 'short_term_6m',
      title: '⚡ Short-Term 6-Month Note (₹50k @ 10% p.a. for 6 Months)',
      description: 'Short-duration simple interest note over 6 months.',
      values: {
        principal: 50000,
        rate: 10.0,
        durationValue: 6,
        durationUnit: 'months',
        currency: 'INR',
      },
    },
    {
      id: 'money_market_90d',
      title: '🗓️ 90-Day Money Market Instrument (₹2L @ 7% p.a. for 90 Days)',
      description: 'Short-term commercial paper or bill computed using 365-day convention.',
      values: {
        principal: 200000,
        rate: 7.0,
        durationValue: 90,
        durationUnit: 'days',
        currency: 'INR',
      },
    },
    {
      id: 'long_term_lumpsum_10y',
      title: '🚀 10-Year Long-Term Lumpsum (₹5L @ 9% p.a. for 10 Years)',
      description: 'Long-term flat rate simple interest investment over a decade.',
      values: {
        principal: 500000,
        rate: 9.0,
        durationValue: 10,
        durationUnit: 'years',
        currency: 'INR',
      },
    },
  ],
};

export const simpleInterestCalculatorConfig = {
  ...SIMPLE_INTEREST_CONFIG,
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculateSimpleInterestCalculator,
  primaryResult: {
    key: 'finalMaturityAmount',
    label: 'Total Maturity Payout / Repayment',
  },
  ratioBarItems: [
    { key: 'principal', label: 'Initial Principal Deposit', colorClass: 'bg-primary' },
    { key: 'simpleInterestEarned', label: 'Total Simple Interest Earned', colorClass: 'bg-semantic-up' },
  ],
  summaryItems: [
    { key: 'principal', label: 'Initial Principal Investment' },
    { key: 'rate', label: 'Annual Interest Rate (% p.a.)' },
    { key: 'tenureYears', label: 'Equivalent Duration in Years' },
    { key: 'simpleInterestEarned', label: 'Total Simple Interest Earned', class: 'text-emerald-600 font-bold' },
    { key: 'compoundMaturityAmount', label: 'Compound Interest Maturity Payout' },
    { key: 'compoundingAdvantage', label: 'Compounding Growth Advantage' },
    { key: 'finalMaturityAmount', label: 'Total Maturity Payout', isTotal: true },
  ],
  inputs: [
    {
      id: 'principal',
      type: 'number',
      label: 'Initial Principal Investment',
      min: 0,
      max: 10000000,
      step: 1000,
      prefix: '₹',
      minLabel: '₹0',
      maxLabel: '₹1 Cr',
      default: 100000,
    },
    {
      id: 'rate',
      type: 'number',
      label: 'Annual Interest Rate (% p.a.)',
      min: 0,
      max: 50.0,
      step: 0.1,
      suffix: '%',
      minLabel: '0%',
      maxLabel: '50.0%',
      default: 8.0,
    },
    {
      id: 'durationValue',
      type: 'number',
      label: 'Duration Value',
      min: 1,
      max: 3650,
      step: 1,
      default: 5,
    },
  ],
  hasAmortizationTable: true,
};
