/**
 * Capital Gains Tax Calculator Math Engine (FY 2025-26 / Budget 2024 Rules)
 * Computes Short-Term Capital Gains (STCG) and Long-Term Capital Gains (LTCG) for equities, real estate, and assets.
 *
 * @param {Object} inputs
 * @param {number} [inputs.purchasePrice=100000] - Original purchase cost in Rupees (₹)
 * @param {number} [inputs.salePrice=250000] - Sale / redemption price in Rupees (₹)
 * @param {string} [inputs.assetType='equity'] - 'equity' (listed stocks/equity MFs) or 'other' (real estate, gold, unlisted)
 * @param {number} [inputs.holdingPeriodMonths=18] - Holding period duration in months
 * @param {number} [inputs.transferExpenses=0] - Brokerage, stamp duty, or sales transfer expenses
 * @returns {{ primaryOutput: number, grossGain: number, netCapitalGain: number, isLongTerm: boolean, exemptionAmount: number, taxableGain: number, taxRate: number, baseTax: number, cessAmount: number, taxPayable: number, netProfit: number }}
 */
export function calculateCapitalGainsTaxCalculator(inputs = {}) {
  const {
    purchasePrice = 100000,
    salePrice = 250000,
    assetType = 'equity',
    holdingPeriodMonths = 18,
    transferExpenses = 0,
  } = inputs;

  const numPurchase = Math.max(0, Number(purchasePrice) || 0);
  const numSale = Math.max(0, Number(salePrice) || 0);
  const numHoldingMonths = Math.max(1, Number(holdingPeriodMonths) || 1);
  const numExpenses = Math.max(0, Number(transferExpenses) || 0);

  const grossGain = numSale - numPurchase;
  const netCapitalGain = Math.max(0, grossGain - numExpenses);

  const isEquity = assetType === 'equity';
  const ltcgThresholdMonths = isEquity ? 12 : 24;
  const isLongTerm = numHoldingMonths > ltcgThresholdMonths;

  let taxRate = 0;
  let exemptionAmount = 0;

  if (isEquity) {
    if (isLongTerm) {
      taxRate = 12.5; // Budget 2024 LTCG rate
      exemptionAmount = 125000; // Annual ₹1.25 Lakh exemption limit
    } else {
      taxRate = 20.0; // Budget 2024 STCG rate
      exemptionAmount = 0;
    }
  } else {
    if (isLongTerm) {
      taxRate = 12.5; // Budget 2024 LTCG rate without indexation for real estate/other
      exemptionAmount = 0;
    } else {
      taxRate = 30.0; // Standard peak tax slab assumption for short-term non-equity
      exemptionAmount = 0;
    }
  }

  const taxableGain = Math.max(0, netCapitalGain - exemptionAmount);
  const baseTax = taxableGain * (taxRate / 100);
  const cessAmount = baseTax * 0.04; // 4% Health & Education Cess
  const taxPayable = Math.round(baseTax + cessAmount);
  const netProfit = Math.round(netCapitalGain - taxPayable);

  return {
    primaryOutput: taxPayable,
    grossGain: Math.round(grossGain),
    netCapitalGain: Math.round(netCapitalGain),
    isLongTerm,
    exemptionAmount,
    taxableGain: Math.round(taxableGain),
    taxRate,
    baseTax: Math.round(baseTax),
    cessAmount: Math.round(cessAmount),
    taxPayable,
    netProfit,
  };
}