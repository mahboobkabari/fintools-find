import { calculateCurrencyConverter, REFERENCE_EXCHANGE_RATES } from '../currency/currency-converter.js';

export const CURRENCY_PRESETS = [
  {
    id: 'usd_inr',
    name: 'USD to INR',
    description: '$1,000 USD → ₹87,500 INR (Global Trade & Freelance)',
    badge: 'USD/INR',
    icon: '🇺🇸',
    values: {
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fxSpreadPct: 0,
    },
  },
  {
    id: 'eur_usd',
    name: 'EUR to USD',
    description: '€1,000 EUR → $1,086.96 USD (Transatlantic Benchmark)',
    badge: 'EUR/USD',
    icon: '🇪🇺',
    values: {
      amount: 1000,
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      fxSpreadPct: 0,
    },
  },
  {
    id: 'gbp_inr',
    name: 'GBP to INR',
    description: '£1,000 GBP → ₹111,464.97 INR (UK Diaspora & Remittance)',
    badge: 'GBP/INR',
    icon: '🇬🇧',
    values: {
      amount: 1000,
      fromCurrency: 'GBP',
      toCurrency: 'INR',
      fxSpreadPct: 0,
    },
  },
  {
    id: 'aed_inr',
    name: 'AED to INR',
    description: 'AED 1,000 → ₹23,825.73 INR (Gulf Remittance Corridor)',
    badge: 'AED/INR',
    icon: '🇦🇪',
    values: {
      amount: 1000,
      fromCurrency: 'AED',
      toCurrency: 'INR',
      fxSpreadPct: 0,
    },
  },
  {
    id: 'cad_inr',
    name: 'CAD to INR',
    description: 'C$1,000 CAD → ₹63,636.36 INR (Canada Student & Migration)',
    badge: 'CAD/INR',
    icon: '🇨🇦',
    values: {
      amount: 1000,
      fromCurrency: 'CAD',
      toCurrency: 'INR',
      fxSpreadPct: 0,
    },
  },
  {
    id: 'usd_jpy',
    name: 'USD to JPY',
    description: '$1,000 USD → ¥155,000 JPY (Asia Tourism & Tech Trade)',
    badge: 'USD/JPY',
    icon: '🇯🇵',
    values: {
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'JPY',
      fxSpreadPct: 0,
    },
  },
];

export const currencyConverterConfig = {
  title: 'Currency Converter (Live Multi-Currency Foreign Exchange Calculator)',
  currency: 'generic',
  calculateFn: calculateCurrencyConverter,
  presets: CURRENCY_PRESETS,
  supportedCurrencies: REFERENCE_EXCHANGE_RATES,
  defaultAmount: 1000,
  defaultFrom: 'USD',
  defaultTo: 'INR',
};
