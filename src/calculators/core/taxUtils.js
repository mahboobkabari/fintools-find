/**
 * Shared Tax Mathematics & Utility Functions
 * Reusable across Income Tax, GST, Capital Gains Tax, HRA, and Take-Home Salary calculators.
 */

/**
 * Standard GST Calculator
 * @param {Object} params
 * @param {number} params.amount - Net base amount OR Gross inclusive price
 * @param {number} params.rate - GST rate percentage (e.g. 18%)
 * @param {string} [params.type='exclusive'] - 'exclusive' (add GST) or 'inclusive' (extract GST)
 */
export function calculateGST({ amount = 10000, rate = 18, type = 'exclusive' } = {}) {
  const rawAmt = Math.max(0, Number(amount) || 0);
  const r = Math.max(0, Number(rate) || 0);

  let netAmount = 0;
  let gstAmount = 0;
  let grossAmount = 0;

  if (type === 'inclusive') {
    grossAmount = rawAmt;
    netAmount = Math.round(grossAmount * (100 / (100 + r)));
    gstAmount = grossAmount - netAmount;
  } else {
    netAmount = rawAmt;
    gstAmount = Math.round(netAmount * (r / 100));
    grossAmount = netAmount + gstAmount;
  }

  return { netAmount, gstAmount, grossAmount, rate, type };
}

/**
 * Intrastate CGST & SGST Split (50% Central + 50% State)
 */
export function splitCGSTSGST(gstAmount = 0) {
  const totalGst = Math.max(0, Number(gstAmount) || 0);
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;
  return { cgst, sgst };
}

/**
 * Interstate IGST Calculation (100% Integrated Tax)
 */
export function calculateIGST(gstAmount = 0) {
  const igst = Math.max(0, Number(gstAmount) || 0);
  return { igst };
}

/**
 * Reverse GST Extraction (Extract Taxable Value from Tax-Inclusive Price)
 */
export function reverseGST({ grossAmount = 11800, rate = 18 } = {}) {
  return calculateGST({ amount: grossAmount, rate, type: 'inclusive' });
}

/**
 * Effective Tax Rate Percentage
 */
export function effectiveTaxRate(taxAmount = 0, totalAmount = 1) {
  const tax = Math.max(0, Number(taxAmount) || 0);
  const total = Math.max(1, Number(totalAmount) || 1);
  return Number(((tax / total) * 100).toFixed(2));
}

/**
 * Percentage Difference Calculation
 */
export function percentageDifference(valA = 0, valB = 0) {
  const a = Number(valA) || 0;
  const b = Number(valB) || 0;
  const diff = b - a;
  const pct = a > 0 ? (diff / a) * 100 : 0;
  return { diff, pct: Number(pct.toFixed(2)) };
}
