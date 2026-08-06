/**
  Locale-aware Currency and Number Formatting Utilities for FinTool.
 */

/**
 * Formats a monetary amount into a clean currency string.
 * Supports Indian numbering system (e.g. ₹10,00,000) and US standard ($1,000,000).
 * @param {number} amount - Numeric value
 * @param {string} currency - 'INR' | 'USD' | 'generic'
 * @param {string} locale - 'en-IN' | 'en-US'
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'generic', locale = 'en-IN') {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return currency === 'INR' ? '₹0' : currency === 'USD' ? '$0' : '0';
  }

  const rounded = Math.round(amount);

  if (currency === 'INR') {
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(rounded);
    return `₹${formatted}`;
  }

  if (currency === 'USD') {
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(rounded);
    return `$${formatted}`;
  }

  // Generic formatting (uses en-IN or en-US number rules without symbol prefix)
  const targetLocale = locale === 'en-IN' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(targetLocale, {
    maximumFractionDigits: 0,
  }).format(rounded);
}

/**
 * Formats a percentage value.
 * @param {number} rate - Percentage rate (e.g. 8.5)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage (e.g. "8.5%")
 */
export function formatPercent(rate, decimals = 2) {
  if (isNaN(rate) || rate === null || rate === undefined) return '0%';
  return `${Number(rate).toFixed(decimals)}%`;
}

/**
 * Parses raw input string to sanitized positive number.
 * @param {string|number} value - Input value
 * @param {number} fallback - Fallback if invalid
 * @returns {number} Sanitized number
 */
export function parseNumber(value, fallback = 0) {
  if (typeof value === 'number') return isNaN(value) ? fallback : value;
  if (!value) return fallback;
  const cleaned = String(value).replace(/,/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
}
