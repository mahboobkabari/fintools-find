import { calculateXirrCalculator } from '../investment/xirr-calculator.js';

export const XIRR_CONFIG = {
  id: 'xirr-calculator',
  title: 'XIRR Calculator (Extended Internal Rate of Return)',
  category: 'Investment Calculators',
  categorySlug: 'investment',

  defaultCashFlows: [
    { id: '1', date: '2023-01-01', amount: -100000, description: 'Initial Investment' },
    { id: '2', date: '2024-01-01', amount: -50000, description: 'SIP / Top-up Investment' },
    { id: '3', date: '2025-01-01', amount: 180000, description: 'Current Valuation / Final Redemption' },
  ],

  presets: [
    {
      id: 'lumpsum_topup_redemption',
      title: '📈 Lumpsum + Top-up + Redemption (2-Yr Horizon)',
      description: '₹1L initial investment + ₹50k top-up after 1 year + ₹1.8L valuation at year 2.',
      values: {
        currency: 'INR',
        cashFlows: [
          { id: '1', date: '2023-01-01', amount: -100000, description: 'Initial Investment' },
          { id: '2', date: '2024-01-01', amount: -50000, description: 'Top-up Deposit' },
          { id: '3', date: '2025-01-01', amount: 180000, description: 'Final Portfolio Value' },
        ],
      },
    },
    {
      id: 'simple_annual_10pct',
      title: '🎯 Benchmark 1-Year 10% Simple Cash Flow',
      description: '₹1L investment on 2024-01-01 yielding ₹1.1L on 2025-01-01 (Exactly 10% XIRR).',
      values: {
        currency: 'INR',
        cashFlows: [
          { id: '1', date: '2024-01-01', amount: -100000, description: 'Initial Purchase' },
          { id: '2', date: '2025-01-01', amount: 110000, description: 'Current Portfolio Value' },
        ],
      },
    },
    {
      id: 'sip_3year_series',
      title: '🗓️ 3-Year Annual SIP Series',
      description: '3 annual ₹50k SIP contributions yielding ₹1.85L valuation after 3 years.',
      values: {
        currency: 'INR',
        cashFlows: [
          { id: '1', date: '2022-01-01', amount: -50000, description: 'Year 1 SIP' },
          { id: '2', date: '2023-01-01', amount: -50000, description: 'Year 2 SIP' },
          { id: '3', date: '2024-01-01', amount: -50000, description: 'Year 3 SIP' },
          { id: '4', date: '2025-01-01', amount: 185000, description: 'Final Portfolio Value' },
        ],
      },
    },
    {
      id: 'real_estate_rental_cashflow',
      title: '🏠 Real Estate Purchase + Partial Rental Income + Sale',
      description: '₹50L property purchase, ₹2L rental payout at year 1, ₹60L sale payout at year 2.',
      values: {
        currency: 'INR',
        cashFlows: [
          { id: '1', date: '2023-01-01', amount: -5000000, description: 'Property Purchase' },
          { id: '2', date: '2024-01-01', amount: 200000, description: 'Annual Rental Net Income' },
          { id: '3', date: '2025-01-01', amount: 6000000, description: 'Property Sale Payout' },
        ],
      },
    },
  ],
};

export const xirrCalculatorConfig = {
  ...XIRR_CONFIG,
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculateXirrCalculator,
  primaryResult: {
    key: 'xirrPercent',
    label: 'Annualized XIRR Return (% p.a.)',
  },
  ratioBarItems: [
    { key: 'totalInvested', label: 'Total Capital Invested', colorClass: 'bg-primary' },
    { key: 'absoluteProfit', label: 'Net Profit / Appreciation', colorClass: 'bg-semantic-up' },
  ],
  summaryItems: [
    { key: 'totalInvested', label: 'Total Capital Invested' },
    { key: 'totalRedeemed', label: 'Total Redemption / Portfolio Value' },
    { key: 'absoluteProfit', label: 'Net Capital Appreciation' },
    { key: 'absoluteReturnPercent', label: 'Absolute Return (%)' },
    { key: 'holdingPeriodYears', label: 'Total Investment Horizon' },
    { key: 'cagrPercent', label: 'Benchmark CAGR Equivalent (% p.a.)' },
    { key: 'xirrPercent', label: 'Extended Internal Rate of Return (XIRR % p.a.)', isTotal: true },
  ],
};
