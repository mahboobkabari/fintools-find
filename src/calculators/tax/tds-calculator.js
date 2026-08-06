/**
 * TDS Calculator (Tax Deducted at Source) Math Engine
 * Computes statutory TDS deductions under Sections 194A, 194J, 194C, and 194I of Indian Income Tax Act.
 *
 * @param {Object} inputs
 * @param {number} [inputs.amount=100000] - Gross payment / income amount in Rupees (₹)
 * @param {number} [inputs.tdsRate=10] - Prescribed statutory TDS rate percentage (e.g. 10%, 1%, 2%, 5%)
 * @param {boolean|string} [inputs.hasPan=true] - true / 'yes' if valid PAN is furnished; false for 20% higher tax rate under Section 206AA
 * @returns {{ primaryOutput: number, grossAmount: number, tdsRate: number, effectiveRate: number, tdsAmount: number, netPayout: number, hasPan: boolean }}
 */
export function calculateTdsCalculator(inputs = {}) {
  const { amount = 100000, tdsRate = 10, hasPan = true } = inputs;

  const numAmount = Math.max(0, Number(amount) || 0);
  const numRate = Math.max(0, Number(tdsRate) || 0);
  const panBool = hasPan === true || hasPan === 'true' || hasPan === 'yes';

  // Section 206AA: Higher rate of 20% applies if valid PAN is not furnished
  const effectiveRate = panBool ? numRate : Math.max(20.0, numRate);

  const baseTds = numAmount * (effectiveRate / 100);
  const tdsAmount = Math.round(baseTds);
  const netPayout = Math.round(numAmount - tdsAmount);

  return {
    primaryOutput: tdsAmount,
    grossAmount: Math.round(numAmount),
    tdsRate: numRate,
    effectiveRate,
    tdsAmount,
    netPayout,
    hasPan: panBool,
  };
}