/**
 * GST (Goods and Services Tax) Calculator Math Engine
 * Supports Exclusive and Inclusive GST calculations with CGST/SGST split.
 *
 * @param {Object} inputs
 * @param {number} inputs.amount - Net base amount OR Gross inclusive amount
 * @param {number} inputs.gstRate - Standard GST slab percentage (5%, 12%, 18%, 28%)
 * @param {string} [inputs.gstType='exclusive'] - 'exclusive' (add GST) or 'inclusive' (extract GST)
 */
export function calculateGst(inputs = {}) {
  const { amount = 10000, gstRate = 18, gstType = 'exclusive' } = inputs;

  const rawAmount = Math.max(0, Number(amount) || 0);
  const rate = Math.max(0, Number(gstRate) || 0);

  let netAmount = 0;
  let gstAmount = 0;
  let grossAmount = 0;

  if (gstType === 'inclusive') {
    // Extract GST from gross price
    grossAmount = rawAmount;
    netAmount = Math.round(grossAmount * (100 / (100 + rate)));
    gstAmount = grossAmount - netAmount;
  } else {
    // Add GST to net base price (Exclusive)
    netAmount = rawAmount;
    gstAmount = Math.round(netAmount * (rate / 100));
    grossAmount = netAmount + gstAmount;
  }

  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;

  return {
    netAmount,
    gstAmount,
    cgst,
    sgst,
    grossAmount,
    gstRate: rate,
    gstType,
  };
}