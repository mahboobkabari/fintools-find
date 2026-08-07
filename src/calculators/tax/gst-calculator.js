import {
  calculateGST,
  splitCGSTSGST,
  calculateIGST,
  reverseGST,
  effectiveTaxRate,
} from '../core/taxUtils.js';

/**
 * Flagship GST Tax Decision Engine (Math Engine V2)
 * 
 * @param {Object} inputs
 * @param {number} inputs.amount - Net base amount OR Gross inclusive price (₹)
 * @param {number} inputs.gstRate - Standard GST slab percentage (5%, 12%, 18%, 28%)
 * @param {string} [inputs.gstType='exclusive'] - 'exclusive' (add GST) or 'inclusive' (extract GST)
 * @param {string} [inputs.txType='intrastate'] - 'intrastate' (CGST+SGST) or 'interstate' (IGST)
 */
export function calculateGst(inputs = {}) {
  const {
    amount = 10000,
    gstRate = 18,
    gstType = 'exclusive',
    txType = 'intrastate',
  } = inputs;

  const rawAmt = Math.max(0, Number(amount) || 0);
  const rate = Math.max(0, Number(gstRate) || 0);
  const isInterstate = txType.toLowerCase() === 'interstate';

  // 1. Core GST Calculation
  const baseRes = calculateGST({ amount: rawAmt, rate, type: gstType });
  const { netAmount, gstAmount, grossAmount } = baseRes;

  // 2. Tax Split (Intrastate CGST+SGST vs Interstate IGST)
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterstate) {
    igst = gstAmount;
  } else {
    const split = splitCGSTSGST(gstAmount);
    cgst = split.cgst;
    sgst = split.sgst;
  }

  // 3. Effective Tax Rate
  const effectiveRate = effectiveTaxRate(gstAmount, grossAmount);

  // 4. Reverse GST Analysis
  const reverseRes = reverseGST({ grossAmount, rate });

  // 5. Scenario Comparison (No GST, Current, Lower -5%, Higher +5%)
  const scenarios = {
    noGst: {
      rate: 0,
      gstAmount: 0,
      grossAmount: netAmount,
      diff: -gstAmount,
    },
    current: {
      rate,
      gstAmount,
      grossAmount,
      diff: 0,
    },
    lower: {
      rate: Math.max(0, rate - 5),
      ...calculateGST({ amount: netAmount, rate: Math.max(0, rate - 5), type: 'exclusive' }),
    },
    higher: {
      rate: rate + 5,
      ...calculateGST({ amount: netAmount, rate: rate + 5, type: 'exclusive' }),
    },
  };

  // 6. Itemized Invoice Preview Object
  const invoicePreview = {
    b2bHeadline: isInterstate ? 'Interstate B2B Invoice (IGST)' : 'Intrastate B2B Invoice (CGST + SGST)',
    netAmount,
    gstAmount,
    cgst,
    sgst,
    igst,
    grossAmount,
    rate,
    isInterstate,
  };

  // 7. Human-Friendly Visual ("For every ₹100 base price, add ₹X GST")
  const taxPer100 = netAmount > 0 ? Math.round((gstAmount / netAmount) * 100) : 0;

  // 8. Smart Ranked Recommendations
  const recommendations = [
    {
      rank: 1,
      title: isInterstate ? 'Interstate Supply (Charge IGST)' : 'Intrastate Supply (Split CGST + SGST)',
      savings: gstAmount,
      action: isInterstate
        ? `Apply 100% IGST (₹${igst.toLocaleString('en-IN')}) on out-of-state transactions.`
        : `Split GST equally into CGST (₹${cgst.toLocaleString('en-IN')}) and SGST (₹${sgst.toLocaleString('en-IN')}).`,
    },
    {
      rank: 2,
      title: 'Tax-Inclusive Price Reverse Extraction',
      savings: reverseRes.netAmount,
      action: `When quoting inclusive prices of ₹${grossAmount.toLocaleString('en-IN')}, base taxable value is ₹${reverseRes.netAmount.toLocaleString('en-IN')}.`,
    },
    {
      rank: 3,
      title: 'Input Tax Credit (ITC) Compliance',
      savings: gstAmount,
      action: `Ensure valid GSTIN on invoice to claim full ₹${gstAmount.toLocaleString('en-IN')} Input Tax Credit.`,
    },
  ];

  // 9. Hero Decision Text
  const heroText =
    gstType === 'inclusive'
      ? `Extracted GST of ₹${gstAmount.toLocaleString('en-IN')} from gross ₹${grossAmount.toLocaleString('en-IN')}. Net taxable price is ₹${netAmount.toLocaleString('en-IN')}.`
      : `${rate}% GST adds ₹${gstAmount.toLocaleString('en-IN')} on ₹${netAmount.toLocaleString('en-IN')} base price. Total Invoice: ₹${grossAmount.toLocaleString('en-IN')}.`;

  return {
    netAmount,
    gstAmount,
    grossAmount,
    cgst,
    sgst,
    igst,
    gstRate: rate,
    gstType,
    txType,
    effectiveRate,
    taxPer100,
    reverseRes,
    scenarios,
    invoicePreview,
    recommendations,
    heroText,
  };
}