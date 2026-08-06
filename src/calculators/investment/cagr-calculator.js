/**
 * CAGR (Compound Annual Growth Rate) Calculator Math Engine
 *
 * @param {Object} inputs
 * @param {number} inputs.initialValue - Initial investment value
 * @param {number} inputs.finalValue - Final investment value
 * @param {number} inputs.tenureYears - Holding duration in years
 */
export function calculateCagr(inputs = {}) {
  const {
    initialValue = 100000,
    finalValue = 250000,
    tenureYears = 5,
  } = inputs;

  const initial = Math.max(1, Number(initialValue) || 1);
  const final = Math.max(0, Number(finalValue) || 0);
  const years = Math.max(1, Number(tenureYears) || 1);

  const absoluteGain = final - initial;
  const absoluteGrowthPct = (absoluteGain / initial) * 100;

  let cagrPct = 0;
  if (final > 0 && initial > 0) {
    cagrPct = (Math.pow(final / initial, 1 / years) - 1) * 100;
  }

  const yearlyBreakdown = [];
  const r = cagrPct / 100;
  for (let y = 1; y <= years; y++) {
    const val = Math.round(initial * Math.pow(1 + r, y));
    yearlyBreakdown.push({
      year: y,
      invested: initial,
      returns: Math.max(0, val - initial),
      totalValue: val,
    });
  }

  return {
    initialValue: initial,
    finalValue: final,
    absoluteGain,
    absoluteGrowthPct: Number(absoluteGrowthPct.toFixed(2)),
    cagrPct: Number(cagrPct.toFixed(2)),
    yearlyBreakdown,
  };
}