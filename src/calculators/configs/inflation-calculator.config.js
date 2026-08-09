import { calculateInflationCalculator } from '../investment/inflation-calculator.js';

export const INFLATION_CONFIG = {
  id: 'inflation-calculator',
  title: 'Inflation Calculator (Purchasing Power & Price Growth)',
  category: 'Investment Calculators',
  categorySlug: 'investment',

  defaultAmount: 100000,
  defaultInflationRate: 6.0,
  defaultTenureYears: 10,
  defaultInvestmentReturnRate: 12.0,

  referenceData: {
    indiaCpiContext: 'India Consumer Price Index (CPI) historical baseline reference: ~5.5% - 6.5% p.a.',
    rbiTargetContext: 'RBI Monetary Policy Framework target band: 4.0% (+/- 2.0%) p.a.',
    usCpiContext: 'US Bureau of Labor Statistics (BLS) CPI long-term baseline reference: ~2.5% - 3.5% p.a.',
  },

  presets: [
    {
      id: 'standard_10y_6pct',
      title: '🏠 10-Year General Inflation (₹1L @ 6% Infl)',
      description: 'Standard 10-year inflation horizon with 6% p.a. average inflation assumption.',
      values: {
        amount: 100000,
        inflationRate: 6.0,
        tenureYears: 10,
        investmentReturnRate: 12.0,
        currency: 'INR',
      },
    },
    {
      id: 'education_15y_8pct',
      title: '🎓 15-Year Higher Education Cost (₹25L @ 8% Infl)',
      description: 'Education inflation model with 8% p.a. inflation rate over 15 years.',
      values: {
        amount: 2500000,
        inflationRate: 8.0,
        tenureYears: 15,
        investmentReturnRate: 12.0,
        currency: 'INR',
      },
    },
    {
      id: 'household_grocery_1y_5pct',
      title: '🛒 1-Year Household Grocery Expense (₹3L @ 5% Infl)',
      description: 'Short-term consumer basket price increase over 12 months.',
      values: {
        amount: 300000,
        inflationRate: 5.0,
        tenureYears: 1,
        investmentReturnRate: 7.0,
        currency: 'INR',
      },
    },
    {
      id: 'retirement_living_20y_6pct',
      title: '🏖️ 20-Year Retirement Living Goal (₹50L @ 6% Infl)',
      description: 'Long-term purchasing power erosion model over a 2-decade horizon.',
      values: {
        amount: 5000000,
        inflationRate: 6.0,
        tenureYears: 20,
        investmentReturnRate: 10.0,
        currency: 'INR',
      },
    },
  ],
};

export const inflationCalculatorConfig = {
  ...INFLATION_CONFIG,
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculateInflationCalculator,
  primaryResult: {
    key: 'futureCost',
    label: 'Future Inflated Cost',
  },
  ratioBarItems: [
    { key: 'amount', label: 'Present Value Today', colorClass: 'bg-primary' },
    { key: 'inflationDelta', label: 'Inflation Cost Increase', colorClass: 'bg-rose-500' },
  ],
  summaryItems: [
    { key: 'amount', label: 'Current Present Value Today' },
    { key: 'inflationRate', label: 'Assumed Annual Inflation Rate (% p.a.)' },
    { key: 'tenureYears', label: 'Time Horizon (Years)' },
    { key: 'futureCost', label: 'Future Inflated Cost', isTotal: true },
    { key: 'erodedPurchasingPower', label: 'Retained Purchasing Power of Today\'s Value' },
    { key: 'cumulativeInflationPercent', label: 'Cumulative Price Increase (%)' },
    { key: 'realReturnRate', label: 'Fisher Real Rate of Return (% p.a.)' },
    { key: 'requiredLumpsumToday', label: 'Required Lumpsum Investment Today (@ Return Rate)' },
  ],
  inputs: [
    {
      id: 'amount',
      type: 'number',
      label: 'Current Present Value Today',
      min: 0,
      max: 100000000,
      step: 10000,
      prefix: '₹',
      minLabel: '₹0',
      maxLabel: '₹10 Cr',
      default: 100000,
    },
    {
      id: 'inflationRate',
      type: 'number',
      label: 'Assumed Inflation Rate (% p.a.)',
      min: 0,
      max: 30.0,
      step: 0.1,
      suffix: '%',
      minLabel: '0%',
      maxLabel: '30.0%',
      default: 6.0,
    },
    {
      id: 'tenureYears',
      type: 'number',
      label: 'Time Horizon (Years)',
      min: 1,
      max: 50,
      step: 1,
      minLabel: '1 Yr',
      maxLabel: '50 Yrs',
      default: 10,
    },
    {
      id: 'investmentReturnRate',
      type: 'number',
      label: 'Nominal Investment Return Benchmark (% p.a.)',
      min: 0,
      max: 30.0,
      step: 0.1,
      suffix: '%',
      minLabel: '0%',
      maxLabel: '30.0%',
      default: 12.0,
    },
  ],
};
