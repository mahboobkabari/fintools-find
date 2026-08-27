/**
 * Flagship Internal Rate of Return (IRR), MIRR & Capital Budgeting Hurdle Rate Decision Engine (Math Engine V2)
 * Supports Newton-Raphson polynomial solver, Secant/Bisection fallback, Modified IRR (MIRR),
 * NPV Profile discount rate curve, Profitability Index (PI), and non-conventional cash flow diagnostics.
 * 
 * @param {Object} inputs
 * @param {number} [inputs.initialInvestment=1000000] - Initial capital outlay (₹, $, £, etc.)
 * @param {number[]} [inputs.cashFlows=[250000, 350000, 400000, 450000, 500000]] - Annual net cash inflows
 * @param {number} [inputs.hurdleRate=10] - Cost of Capital / WACC / Hurdle Rate (%)
 * @param {number} [inputs.reinvestmentRate=10] - MIRR cash inflow reinvestment rate (%)
 * @param {number} [inputs.financingRate=8] - MIRR cost of financing / debt rate (%)
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const DEFAULT_IRR_INPUTS = {
  initialInvestment: 1000000,
  cashFlows: [250000, 350000, 400000, 450000, 500000],
  hurdleRate: 10,
  reinvestmentRate: 10,
  financingRate: 8,
  currencySymbol: '₹',
};

/**
 * Calculates Net Present Value (NPV) for a given discount rate
 */
export function calculateNPVForRate(rateDecimal, allCashFlows) {
  let npv = 0;
  for (let t = 0; t < allCashFlows.length; t++) {
    npv += allCashFlows[t] / Math.pow(1 + rateDecimal, t);
  }
  return npv;
}

/**
 * Derivative of NPV with respect to discount rate
 */
function calculateNPVDerivative(rateDecimal, allCashFlows) {
  let dNpv = 0;
  for (let t = 1; t < allCashFlows.length; t++) {
    dNpv -= (t * allCashFlows[t]) / Math.pow(1 + rateDecimal, t + 1);
  }
  return dNpv;
}

/**
 * Robust Internal Rate of Return (IRR) Solver using Newton-Raphson with Secant fallback
 */
export function solveIRR(allCashFlows, guess = 0.1, maxIterations = 1000, tolerance = 1e-7) {
  // Check if all positive or all negative
  const hasPositive = allCashFlows.some((cf) => cf > 0);
  const hasNegative = allCashFlows.some((cf) => cf < 0);
  if (!hasPositive || !hasNegative) {
    return null; // IRR is mathematically undefined
  }

  let rate = guess;

  // 1. Try Newton-Raphson
  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPVForRate(rate, allCashFlows);
    if (Math.abs(npv) < tolerance) {
      return rate;
    }

    const dNpv = calculateNPVDerivative(rate, allCashFlows);
    if (Math.abs(dNpv) < 1e-10) {
      break; // Derivative too small, switch to Secant / Bisection
    }

    const newRate = rate - npv / dNpv;
    if (newRate <= -0.999 || Math.abs(newRate - rate) < tolerance) {
      rate = newRate;
      break;
    }
    rate = newRate;
  }

  // If Newton-Raphson converged to valid root
  if (rate > -0.99 && Math.abs(calculateNPVForRate(rate, allCashFlows)) < tolerance * 100) {
    return rate;
  }

  // 2. Fallback: Secant Method with wide bracket search
  let r0 = -0.5;
  let r1 = 1.5;
  let npv0 = calculateNPVForRate(r0, allCashFlows);
  let npv1 = calculateNPVForRate(r1, allCashFlows);

  for (let i = 0; i < maxIterations; i++) {
    if (Math.abs(npv1 - npv0) < 1e-12) break;
    const r2 = r1 - npv1 * ((r1 - r0) / (npv1 - npv0));
    if (Math.abs(r2 - r1) < tolerance) {
      return r2;
    }
    r0 = r1;
    npv0 = npv1;
    r1 = r2;
    npv1 = calculateNPVForRate(r1, allCashFlows);
  }

  return rate > -0.99 ? rate : null;
}

/**
 * Calculates Modified Internal Rate of Return (MIRR)
 */
export function calculateMIRR(allCashFlows, financingRateDecimal, reinvestmentRateDecimal) {
  const n = allCashFlows.length - 1;
  if (n <= 0) return 0;

  let pvNegative = 0;
  let fvPositive = 0;

  for (let t = 0; t < allCashFlows.length; t++) {
    const cf = allCashFlows[t];
    if (cf < 0) {
      pvNegative += Math.abs(cf) / Math.pow(1 + financingRateDecimal, t);
    } else if (cf > 0) {
      fvPositive += cf * Math.pow(1 + reinvestmentRateDecimal, n - t);
    }
  }

  if (pvNegative === 0 || fvPositive === 0) return 0;

  const mirr = Math.pow(fvPositive / pvNegative, 1 / n) - 1;
  return mirr;
}

export function calculateIrrCalculator(inputs = {}) {
  const merged = { ...DEFAULT_IRR_INPUTS, ...inputs };

  const initialInv = Math.max(0, Number(merged.initialInvestment) || 0);
  const rawFlows = Array.isArray(merged.cashFlows) && merged.cashFlows.length > 0
    ? merged.cashFlows.map((cf) => Number(cf) || 0)
    : [250000, 350000, 400000, 450000, 500000];

  const rawHurdle = Number(merged.hurdleRate);
  const hurdleRatePct = isNaN(rawHurdle) ? 10 : Math.max(0, Math.min(100, rawHurdle));
  const hurdleRateDec = hurdleRatePct / 100;

  const rawReinvest = Number(merged.reinvestmentRate);
  const reinvestRatePct = isNaN(rawReinvest) ? 10 : Math.max(0, Math.min(100, rawReinvest));
  const reinvestRateDec = reinvestRatePct / 100;

  const rawFinance = Number(merged.financingRate);
  const financeRatePct = isNaN(rawFinance) ? 8 : Math.max(0, Math.min(100, rawFinance));
  const financeRateDec = financeRatePct / 100;

  const currencySymbol = merged.currencySymbol || '₹';

  // Construct complete cash flow stream: t=0 is -initialInv
  const allCashFlows = [-initialInv, ...rawFlows];
  const numYears = rawFlows.length;

  // 1. Solve IRR
  const solvedIrrDec = solveIRR(allCashFlows);
  let irrPercentage = solvedIrrDec !== null ? Math.round(solvedIrrDec * 10000) / 100 : null;
  if (irrPercentage === 0) irrPercentage = 0; // Normalize -0

  // 2. Solve MIRR
  const solvedMirrDec = calculateMIRR(allCashFlows, financeRateDec, reinvestRateDec);
  let mirrPercentage = Math.round(solvedMirrDec * 10000) / 100;
  if (mirrPercentage === 0) mirrPercentage = 0;

  // 3. Calculate NPV at Hurdle Rate
  let npvAtHurdle = Math.round(calculateNPVForRate(hurdleRateDec, allCashFlows));
  if (npvAtHurdle === 0) npvAtHurdle = 0;

  // 4. Profitability Index (PI) = PV of future inflows / initial investment
  let pvFutureInflows = 0;
  for (let t = 1; t <= numYears; t++) {
    pvFutureInflows += rawFlows[t - 1] / Math.pow(1 + hurdleRateDec, t);
  }
  const profitabilityIndex = initialInv > 0 ? Math.round((pvFutureInflows / initialInv) * 100) / 100 : 0;

  // 5. Total Undiscounted Cash Inflows & Net Profit
  const totalInflows = rawFlows.reduce((sum, cf) => sum + cf, 0);
  const netUndiscountedProfit = totalInflows - initialInv;

  // 6. Non-conventional cash flow check (sign changes > 1)
  let signChanges = 0;
  for (let i = 0; i < allCashFlows.length - 1; i++) {
    if ((allCashFlows[i] < 0 && allCashFlows[i + 1] > 0) || (allCashFlows[i] > 0 && allCashFlows[i + 1] < 0)) {
      signChanges++;
    }
  }
  const isNonConventional = signChanges > 1;

  // 7. Hurdle Rate Spread
  let irrSpread = irrPercentage !== null ? Math.round((irrPercentage - hurdleRatePct) * 100) / 100 : 0;
  if (irrSpread === 0) irrSpread = 0;

  // 8. Capital Allocation Verdict
  let decision = 'REJECT';
  let decisionReason = 'IRR is below hurdle rate and project destroys economic value.';
  let decisionBadge = 'Value Destructive';

  if (irrPercentage !== null) {
    if (irrPercentage > hurdleRatePct && npvAtHurdle > 0) {
      decision = 'ACCEPT';
      decisionReason = `IRR of ${irrPercentage}% exceeds Hurdle Rate (${hurdleRatePct}%) by +${irrSpread}%, generating ${currencySymbol}${npvAtHurdle.toLocaleString()} in net present value.`;
      decisionBadge = 'Value Accretive';
    } else if (Math.abs(irrPercentage - hurdleRatePct) < 0.1 || npvAtHurdle === 0) {
      decision = 'INDIFFERENT';
      decisionReason = 'Project yields return exactly equal to cost of capital.';
      decisionBadge = 'Break-Even';
    }
  }

  // 9. NPV Sensitivity Profile (Discount Rate vs NPV Curve)
  const npvProfileRates = [0, 5, 8, 10, 12, 15, 18, 20, 25, 30];
  const npvProfile = npvProfileRates.map((rate) => {
    let npvVal = Math.round(calculateNPVForRate(rate / 100, allCashFlows));
    if (npvVal === 0) npvVal = 0;
    return {
      rate,
      npv: npvVal,
      isHurdle: rate === hurdleRatePct,
    };
  });

  // 10. Annual Cash Flow Breakdown Table
  let cumulativeUndiscounted = -initialInv;
  let cumulativeDiscounted = -initialInv;

  const annualTable = [
    {
      year: 0,
      cashFlow: -initialInv,
      discountFactor: 1.0,
      discountedFlow: -initialInv,
      cumulativeUndiscounted: -initialInv,
      cumulativeDiscounted: -initialInv,
    },
    ...rawFlows.map((flow, idx) => {
      const year = idx + 1;
      const exactDiscountFactor = 1 / Math.pow(1 + hurdleRateDec, year);
      const discountFactor = Math.round(exactDiscountFactor * 10000) / 10000;
      const discountedFlow = Math.round(flow * exactDiscountFactor);
      cumulativeUndiscounted += flow;
      cumulativeDiscounted += discountedFlow;

      return {
        year,
        cashFlow: flow,
        discountFactor,
        discountedFlow,
        cumulativeUndiscounted,
        cumulativeDiscounted,
      };
    }),
  ];

  // 11. Smart Ranked Recommendations
  const recommendations = [
    {
      rank: 1,
      title: decision === 'ACCEPT' ? 'Project Approval Recommended' : 'Capital Rejection / Redesign Required',
      savings: Math.max(0, npvAtHurdle),
      action: decision === 'ACCEPT'
        ? `Proceed with capital deployment. IRR (${irrPercentage}%) provides a safe +${irrSpread}% margin over your ${hurdleRatePct}% hurdle rate.`
        : `Do not fund in current state. Explore ways to reduce Year 0 CapEx or front-load Year 1-2 cash inflows to boost IRR above ${hurdleRatePct}%.`,
    },
    {
      rank: 2,
      title: 'Compare IRR vs Modified IRR (MIRR)',
      savings: 0,
      action: `Standard IRR assumes cash inflows are reinvested at ${irrPercentage || 0}%, which is often over-optimistic. MIRR (${mirrPercentage}%) realistically assumes reinvestment at your ${reinvestRatePct}% cost of capital.`,
    },
    {
      rank: 3,
      title: isNonConventional ? 'Multiple Sign Change Warning' : 'Conventional Cash Flow Profile Verified',
      savings: 0,
      action: isNonConventional
        ? `This cash flow stream has ${signChanges} sign reversals. Rely primarily on MIRR (${mirrPercentage}%) or NPV (${currencySymbol}${npvAtHurdle.toLocaleString()}) to avoid multiple IRR anomalies.`
        : `Single outflow followed by continuous inflows ensures a unique, mathematically reliable IRR root.`,
    },
  ];

  // 12. Hero Decision Text
  const heroText = irrPercentage !== null
    ? `Internal Rate of Return (IRR) is ${irrPercentage}%, generating a +${irrSpread}% spread over your ${hurdleRatePct}% Hurdle Rate with an NPV of ${currencySymbol}${npvAtHurdle.toLocaleString()}.`
    : `IRR is mathematically undefined for this cash flow pattern. Rely on NPV of ${currencySymbol}${npvAtHurdle.toLocaleString()}.`;

  return {
    primaryOutput: irrPercentage !== null ? irrPercentage : 0,
    initialInvestment: initialInv,
    cashFlows: rawFlows,
    allCashFlows,
    hurdleRate: hurdleRatePct,
    reinvestmentRate: reinvestRatePct,
    financingRate: financeRatePct,
    irrPercentage,
    mirrPercentage,
    npvAtHurdle,
    profitabilityIndex,
    totalInflows,
    netUndiscountedProfit,
    irrSpread,
    decision,
    decisionReason,
    decisionBadge,
    isNonConventional,
    signChanges,
    npvProfile,
    annualTable,
    recommendations,
    heroText,
    currencySymbol,
  };
}

export const calculateIrrTool = calculateIrrCalculator;
