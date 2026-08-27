/**
 * Purchasing Power Calculator Configuration & Presets
 * Sprint 78 / Flagship #85
 */

export const PURCHASING_POWER_CONFIG = {
  id: 'purchasing-power-calculator',
  title: 'Purchasing Power Calculator',
  category: 'currency',
  categoryName: 'Currency & Cost Calculators',
  version: '3.0.0',
  author: 'Fintools Find Financial Engineering Team',
  lastUpdated: '2026-08-27',

  defaults: {
    amount: 100000,
    inflationRate: 6.0,
    tenureYears: 10,
    incomeGrowthRate: 0,
    currency: 'INR',
  },

  limits: {
    amount: { min: 1000, max: 100000000, step: 5000 },
    inflationRate: { min: 0, max: 25, step: 0.1 },
    tenureYears: { min: 1, max: 50, step: 1 },
    incomeGrowthRate: { min: 0, max: 30, step: 0.5 },
  },

  presets: [
    {
      id: 'india_general_cpi',
      label: 'India Standard CPI',
      icon: '🇮🇳',
      amount: 100000,
      inflationRate: 6.0,
      tenureYears: 10,
      incomeGrowthRate: 0,
      currency: 'INR',
      desc: '₹1 Lakh @ 6.0% CPI over 10 Years',
    },
    {
      id: 'us_fed_target',
      label: 'US Fed Target',
      icon: '🇺🇸',
      amount: 50000,
      inflationRate: 2.5,
      tenureYears: 15,
      incomeGrowthRate: 0,
      currency: 'USD',
      desc: '$50k @ 2.5% over 15 Years',
    },
    {
      id: 'education_medical_inflation',
      label: 'Higher Education / Healthcare',
      icon: '🎓',
      amount: 2500000,
      inflationRate: 10.0,
      tenureYears: 15,
      incomeGrowthRate: 0,
      currency: 'INR',
      desc: '₹25 Lakhs @ 10% College Inflation',
    },
    {
      id: 'salary_vs_inflation',
      label: 'Salary Hike vs Inflation',
      icon: '💼',
      amount: 1200000,
      inflationRate: 6.0,
      tenureYears: 5,
      incomeGrowthRate: 8.5,
      currency: 'INR',
      desc: '₹12 LPA · 8.5% Hike vs 6% Inflation',
    },
    {
      id: 'retirement_cash_decay',
      label: 'Retirement Cash Drag',
      icon: '🏖️',
      amount: 5000000,
      inflationRate: 6.5,
      tenureYears: 20,
      incomeGrowthRate: 0,
      currency: 'INR',
      desc: '₹50 Lakhs Idle Cash over 20 Years',
    },
    {
      id: 'eurozone_ecb',
      label: 'Eurozone Baseline',
      icon: '🇪🇺',
      amount: 30000,
      inflationRate: 2.8,
      tenureYears: 10,
      incomeGrowthRate: 3.5,
      currency: 'EUR',
      desc: '€30,000 @ 2.8% vs 3.5% Raise',
    },
  ],
};
