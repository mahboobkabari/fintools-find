/**
 * Reusable XIRR (Extended Internal Rate of Return) Engine
 * Solves for the annual rate of return for irregular or dated cash flows using
 * Newton-Raphson method with Bisection fallback.
 *
 * Formula:
 *   NPV(r) = sum_{i=0}^N [ C_i / (1 + r)^((d_i - d_0) / 365.25) ] = 0
 *
 * Cash flows:
 *   - Investments/contributions = negative values (cash outflows)
 *   - Current portfolio value / redemption = positive values (cash inflows)
 */

/**
 * @typedef {Object} CashFlow
 * @property {number} amount - Amount in currency (negative for outflow, positive for inflow)
 * @property {Date|string} date - Date of transaction
 */

/**
 * Calculates XIRR for a given array of dated cash flows.
 *
 * @param {Array<CashFlow>} cashFlows - Array of cash flows [{ amount: -10000, date: '2024-01-01' }, ...]
 * @param {number} [guess=0.1] - Initial rate guess (0.1 = 10%)
 * @returns {Object} { valid: boolean, xirrPct: number|null, error: string|null }
 */
export function calculateXirr(cashFlows = [], guess = 0.1) {
  if (!Array.isArray(cashFlows) || cashFlows.length < 2) {
    return {
      valid: false,
      xirrPct: null,
      error: 'At least two cash flows (investment and redemption) are required.',
    };
  }

  // Parse and validate cash flows
  const flows = [];
  let hasPositive = false;
  let hasNegative = false;

  for (let i = 0; i < cashFlows.length; i++) {
    const item = cashFlows[i];
    const amt = Number(item.amount);
    const dt = new Date(item.date);

    if (isNaN(amt) || isNaN(dt.getTime())) {
      return {
        valid: false,
        xirrPct: null,
        error: `Invalid cash flow amount or date at index ${i}.`,
      };
    }

    if (amt > 0) hasPositive = true;
    if (amt < 0) hasNegative = true;

    flows.push({ amount: amt, date: dt });
  }

  if (!hasPositive || !hasNegative) {
    return {
      valid: false,
      xirrPct: null,
      error: 'Cash flows must contain both positive (redemption) and negative (investment) values.',
    };
  }

  // Sort cash flows chronologically
  flows.sort((a, b) => a.date.getTime() - b.date.getTime());
  const d0 = flows[0].date.getTime();

  // Convert dates to fractional years (using 365.25 days per year)
  const times = flows.map((f) => (f.date.getTime() - d0) / (1000 * 60 * 60 * 24 * 365.25));
  const amounts = flows.map((f) => f.amount);

  // Helper: Net Present Value (NPV) for a given rate r
  const npv = (r) => {
    if (r <= -1) return Number.MAX_VALUE;
    let sum = 0;
    for (let i = 0; i < amounts.length; i++) {
      sum += amounts[i] / Math.pow(1 + r, times[i]);
    }
    return sum;
  };

  // Helper: Derivative of NPV w.r.t rate r
  const npvDerivative = (r) => {
    if (r <= -1) return 0;
    let sum = 0;
    for (let i = 0; i < amounts.length; i++) {
      sum -= (times[i] * amounts[i]) / Math.pow(1 + r, times[i] + 1);
    }
    return sum;
  };

  // 1. Newton-Raphson Solver
  let rate = guess;
  const maxIterations = 100;
  const tolerance = 1e-7;

  for (let iter = 0; iter < maxIterations; iter++) {
    const fVal = npv(rate);
    const fDeriv = npvDerivative(rate);

    if (Math.abs(fVal) < tolerance) {
      const resultPct = Number((rate * 100).toFixed(2));
      if (!isFinite(resultPct)) break;
      return { valid: true, xirrPct: resultPct, error: null };
    }

    if (Math.abs(fDeriv) < 1e-12) {
      break; // Derivative too small, switch to bisection
    }

    const nextRate = rate - fVal / fDeriv;
    if (Math.abs(nextRate - rate) < tolerance) {
      const resultPct = Number((nextRate * 100).toFixed(2));
      if (isFinite(resultPct) && nextRate > -0.99) {
        return { valid: true, xirrPct: resultPct, error: null };
      }
    }
    rate = nextRate;
  }

  // 2. Bisection Fallback Solver (-0.99 to +10.0)
  let low = -0.99;
  let high = 10.0;
  let fLow = npv(low);
  let fHigh = npv(high);

  if (fLow * fHigh <= 0) {
    for (let iter = 0; iter < 100; iter++) {
      const mid = (low + high) / 2;
      const fMid = npv(mid);

      if (Math.abs(fMid) < tolerance || (high - low) / 2 < tolerance) {
        const resultPct = Number((mid * 100).toFixed(2));
        if (isFinite(resultPct)) {
          return { valid: true, xirrPct: resultPct, error: null };
        }
      }

      if (fLow * fMid < 0) {
        high = mid;
        fHigh = fMid;
      } else {
        low = mid;
        fLow = fMid;
      }
    }
  }

  return {
    valid: false,
    xirrPct: null,
    error: 'Unable to calculate XIRR for the supplied cash flows. (Non-convergence)',
  };
}

/**
 * Generates monthly SIP cash flows given a start date, monthly amount, tenure in years, and final redemption value.
 *
 * @param {Object} options
 * @param {number} options.monthlyAmount - Monthly investment (₹)
 * @param {number} options.tenureYears - Holding duration in years
 * @param {number} options.finalValue - Gross or net maturity value at end (₹)
 * @param {Date|string} [options.startDate='2020-01-01'] - Starting date
 * @returns {Array<CashFlow>}
 */
export function generateSipCashFlows({ monthlyAmount = 5000, tenureYears = 10, finalValue = 1161695, startDate = '2020-01-01' }) {
  const flows = [];
  const start = new Date(startDate);
  const totalMonths = Math.max(1, Math.round((Number(tenureYears) || 1) * 12));
  const p = Math.max(0, Number(monthlyAmount) || 0);

  for (let m = 0; m < totalMonths; m++) {
    const dt = new Date(start.getFullYear(), start.getMonth() + m, start.getDate());
    flows.push({ amount: -p, date: dt });
  }

  // Final redemption cash flow on the last month date
  const endDt = new Date(start.getFullYear(), start.getMonth() + totalMonths, start.getDate());
  flows.push({ amount: Math.max(0, Number(finalValue) || 0), date: endDt });

  return flows;
}
