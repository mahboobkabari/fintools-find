/**
 * VAT Calculator (Value Added Tax) Math Engine
 * Supports both VAT Exclusive (adding tax) and VAT Inclusive (extracting tax) calculation modes.
 *
 * @param {Object} inputs
 * @param {number} [inputs.amount=100] - Base net or gross price
 * @param {number} [inputs.rate=20] - VAT percentage rate (e.g. 20% standard UK VAT, 19% EU VAT)
 * @param {string} [inputs.mode='exclusive'] - 'exclusive' (add VAT) or 'inclusive' (extract VAT)
 * @returns {{ primaryOutput: number, netAmount: number, vatAmount: number, grossAmount: number, rate: number, mode: string }}
 */
export function calculateVatCalculator(inputs = {}) {
  const { amount = 100, rate = 20, mode = 'exclusive' } = inputs;

  const numAmount = Math.max(0, Number(amount) || 0);
  const numRate = Math.max(0, Number(rate) || 0);
  const isInclusive = mode === 'inclusive';

  let netAmount = 0;
  let vatAmount = 0;
  let grossAmount = 0;

  if (isInclusive) {
    grossAmount = numAmount;
    netAmount = grossAmount / (1 + numRate / 100);
    vatAmount = grossAmount - netAmount;
  } else {
    netAmount = numAmount;
    vatAmount = netAmount * (numRate / 100);
    grossAmount = netAmount + vatAmount;
  }

  return {
    primaryOutput: Math.round(vatAmount),
    netAmount: Math.round(netAmount),
    vatAmount: Math.round(vatAmount),
    grossAmount: Math.round(grossAmount),
    rate: numRate,
    mode: isInclusive ? 'inclusive' : 'exclusive',
  };
}