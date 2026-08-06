export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
  AUD: { code: 'AUD', symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar' },
  CAD: { code: 'CAD', symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar' },
};

export function getCurrencySymbol(code = 'INR') {
  return CURRENCIES[code]?.symbol || '₹';
}
