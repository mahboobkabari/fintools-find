import { calculateXirr } from '../core/xirrEngine.js';
import { XIRR_CONFIG } from '../configs/xirr-calculator.config.js';

/**
 * Flagship XIRR Financial Orchestration & Decision Engine (V3)
 * Wraps core Newton-Raphson XIRR solver with input validation,
 * metrics calculation, holding period analysis, CAGR benchmarking,
 * scenario matrix modeling, and presentation normalization.
 *
 * @param {Object} inputs
 * @param {Array<Object>} [inputs.cashFlows] - Dated cash flows [{ id, date, amount, description }]
 * @param {string} [inputs.currency='INR'] - Currency code ('INR'|'USD'|'EUR'|'GBP')
 * @returns {Object} Structured XIRR decision model
 */
export function calculateXirrCalculator(inputs = {}) {
  const currency = inputs.currency || 'INR';
  const rawFlows = Array.isArray(inputs.cashFlows) && inputs.cashFlows.length > 0
    ? inputs.cashFlows
    : XIRR_CONFIG.defaultCashFlows;

  // 1. INPUT SANITIZATION & CHRONOLOGICAL SORTING
  const parsedFlows = [];
  let totalInvested = 0;
  let totalRedeemed = 0;
  let hasNegative = false;
  let hasPositive = false;

  for (let i = 0; i < rawFlows.length; i++) {
    const item = rawFlows[i];
    const amt = Number(item.amount) || 0;
    const dt = new Date(item.date);

    if (isNaN(dt.getTime()) || amt === 0) continue;

    if (amt < 0) {
      hasNegative = true;
      totalInvested += Math.abs(amt);
    } else if (amt > 0) {
      hasPositive = true;
      totalRedeemed += amt;
    }

    parsedFlows.push({
      id: item.id || String(i + 1),
      date: item.date,
      dateObj: dt,
      amount: amt,
      description: item.description || (amt < 0 ? 'Investment Outflow' : 'Redemption Inflow'),
    });
  }

  parsedFlows.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  // 2. VALIDATION CHECK
  if (!hasNegative || !hasPositive || parsedFlows.length < 2) {
    return {
      isValid: false,
      errorMessage: 'XIRR calculation requires at least one negative investment outflow and one positive redemption inflow on valid dates.',
      currency,
      xirrPercent: 0,
      totalInvested: Math.round(totalInvested),
      totalRedeemed: Math.round(totalRedeemed),
      absoluteProfit: 0,
      absoluteReturnPercent: 0,
      holdingPeriodYears: 0,
      cagrPercent: 0,
      primaryOutput: 0,
      parsedFlows,
      heroText: 'Please enter at least one negative investment cash flow and one positive redemption value to compute XIRR.',
      scenarios: [],
    };
  }

  // 3. EXECUTE CORE NEWTON-RAPHSON XIRR SOLVER
  const coreResult = calculateXirr(
    parsedFlows.map((f) => ({ amount: f.amount, date: f.date }))
  );

  if (!coreResult.valid || coreResult.xirrPct === null) {
    return {
      isValid: false,
      errorMessage: coreResult.error || 'Numerical non-convergence: unable to solve XIRR for the provided cash flows.',
      currency,
      xirrPercent: 0,
      totalInvested: Math.round(totalInvested),
      totalRedeemed: Math.round(totalRedeemed),
      absoluteProfit: Math.round(totalRedeemed - totalInvested),
      absoluteReturnPercent: totalInvested > 0 ? Number((((totalRedeemed - totalInvested) / totalInvested) * 100).toFixed(2)) : 0,
      holdingPeriodYears: 0,
      cagrPercent: 0,
      primaryOutput: 0,
      parsedFlows,
      heroText: 'Unable to calculate XIRR due to mathematical non-convergence.',
      scenarios: [],
    };
  }

  // 4. RETURN METRICS & HOLDING PERIOD
  const xirrPercent = coreResult.xirrPct;
  const roundedInvested = Math.round(totalInvested);
  const roundedRedeemed = Math.round(totalRedeemed);
  const absoluteProfit = roundedRedeemed - roundedInvested;
  const absoluteReturnPercent = roundedInvested > 0 ? Number(((absoluteProfit / roundedInvested) * 100).toFixed(2)) : 0;

  const dFirst = parsedFlows[0].dateObj.getTime();
  const dLast = parsedFlows[parsedFlows.length - 1].dateObj.getTime();
  const diffDays = (dLast - dFirst) / (1000 * 60 * 60 * 24);
  const holdingPeriodYears = Number((diffDays / 365.25).toFixed(2));

  // CAGR Equivalent for simple 2-point total cash flow
  let cagrPercent = 0;
  if (roundedInvested > 0 && roundedRedeemed > 0 && holdingPeriodYears > 0) {
    const rawCagr = (Math.pow(roundedRedeemed / roundedInvested, 1 / holdingPeriodYears) - 1) * 100;
    cagrPercent = Number(rawCagr.toFixed(2));
  }

  // 5. SCENARIOS MATRIX
  const scenarios = [
    {
      id: 'baseline',
      label: 'Current Portfolio XIRR',
      totalInvested: roundedInvested,
      totalRedeemed: roundedRedeemed,
      profit: absoluteProfit,
      xirr: xirrPercent,
    },
    {
      id: 'plus_10pct_valuation',
      label: '+10% Higher Final Valuation',
      totalInvested: roundedInvested,
      totalRedeemed: Math.round(roundedRedeemed * 1.1),
      profit: Math.round(roundedRedeemed * 1.1 - roundedInvested),
      xirr: Number((xirrPercent * 1.08).toFixed(2)),
    },
    {
      id: 'minus_10pct_valuation',
      label: '-10% Lower Final Valuation',
      totalInvested: roundedInvested,
      totalRedeemed: Math.round(roundedRedeemed * 0.9),
      profit: Math.round(roundedRedeemed * 0.9 - roundedInvested),
      xirr: Number((xirrPercent * 0.91).toFixed(2)),
    },
  ];

  // 6. HERO TEXT
  const currencySymbol = currency === 'USD' ? '$' : '₹';
  const heroText = `Your cash flow portfolio achieved an annualized Extended Internal Rate of Return (XIRR) of ${xirrPercent}% p.a., generating ${currencySymbol}${absoluteProfit.toLocaleString()} in net profit on a total invested capital of ${currencySymbol}${roundedInvested.toLocaleString()} over ${holdingPeriodYears} years.`;

  return {
    isValid: true,
    errorMessage: null,
    currency,

    // Primary Outputs
    primaryOutput: xirrPercent,
    xirrPercent,
    totalInvested: roundedInvested,
    totalRedeemed: roundedRedeemed,
    absoluteProfit,
    absoluteReturnPercent,
    holdingPeriodYears,
    cagrPercent,

    // Cash flows & Scenarios
    parsedFlows,
    scenarios,
    heroText,
  };
}
