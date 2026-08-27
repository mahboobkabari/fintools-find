/**
 * Pure JavaScript Financial Engine for Payback Period Calculator
 * Simple Payback, Discounted Payback Period, Cumulative Cash Flow Timelines,
 * Net Present Value (NPV), and Profitability Index (PI).
 *
 * All financial logic is completely decoupled from UI and framework code.
 */

/**
 * Sanitizes input to a valid finite number.
 *
 * @param {any} val
 * @param {number} [defaultVal=0]
 * @returns {number}
 */
function sanitizeNumber(val, defaultVal = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? num : defaultVal;
}

/**
 * Sanitizes input to a non-negative number.
 *
 * @param {any} val
 * @param {number} [defaultVal=0]
 * @returns {number}
 */
function sanitizeNonNegative(val, defaultVal = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? Math.max(0, num) : defaultVal;
}

/**
 * Converts a fractional year value into a human-readable "X yrs Y mos" string.
 *
 * @param {number|null} years
 * @returns {string} Formatted payback duration string
 */
export function formatPaybackDuration(years) {
  if (years === null || years === undefined || isNaN(years) || years < 0) {
    return 'Not recovered within timeline';
  }
  if (years === 0) {
    return '0 years (Immediate recovery)';
  }

  let y = Math.floor(years);
  let m = Math.round((years - y) * 12);
  if (m === 12) {
    y += 1;
    m = 0;
  }

  if (y === 0) {
    return `${m} ${m === 1 ? 'month' : 'months'}`;
  }
  if (m === 0) {
    return `${y} ${y === 1 ? 'year' : 'years'}`;
  }
  return `${y} ${y === 1 ? 'yr' : 'yrs'} ${m} ${m === 1 ? 'mo' : 'mos'}`;
}

/**
 * Calculates Simple Payback Period for equal or uneven annual cash flows.
 *
 * @param {Object} params
 * @param {number} params.initialInvestment - Upfront capital outlay (₹)
 * @param {Array<number>} params.annualCashFlows - Array of annual net cash flows (₹)
 * @returns {{ simplePaybackYears: number|null, isRecovered: boolean, simplePaybackFormatted: string }}
 */
export function calculateSimplePayback({ initialInvestment = 0, annualCashFlows = [] } = {}) {
  const i0 = sanitizeNonNegative(initialInvestment);
  const flows = Array.isArray(annualCashFlows) ? annualCashFlows.map(c => sanitizeNumber(c)) : [];

  if (i0 <= 0 || flows.length === 0) {
    return {
      simplePaybackYears: i0 === 0 ? 0 : null,
      isRecovered: i0 === 0,
      simplePaybackFormatted: i0 === 0 ? '0 years' : 'Not recovered within timeline',
    };
  }

  let cumulative = 0;
  let prevCumulative = 0;
  let recoveredYear = null;

  for (let t = 1; t <= flows.length; t++) {
    const cf = flows[t - 1];
    prevCumulative = cumulative;
    cumulative += cf;

    if (cumulative >= i0 && recoveredYear === null) {
      const needed = i0 - prevCumulative;
      const fraction = cf > 0 ? needed / cf : 0;
      recoveredYear = (t - 1) + fraction;
      break;
    }
  }

  const isRecovered = recoveredYear !== null;
  const roundedYears = isRecovered ? Number(recoveredYear.toFixed(2)) : null;

  return {
    simplePaybackYears: roundedYears,
    isRecovered,
    simplePaybackFormatted: formatPaybackDuration(roundedYears),
  };
}

/**
 * Calculates Discounted Payback Period incorporating time value of money.
 *
 * @param {Object} params
 * @param {number} params.initialInvestment - Upfront capital outlay (₹)
 * @param {Array<number>} params.annualCashFlows - Array of annual net cash flows (₹)
 * @param {number} [params.discountRatePct=10] - Annual discount rate (%)
 * @returns {{ discountedPaybackYears: number|null, isRecovered: boolean, discountedPaybackFormatted: string }}
 */
export function calculateDiscountedPayback({ initialInvestment = 0, annualCashFlows = [], discountRatePct = 10 } = {}) {
  const i0 = sanitizeNonNegative(initialInvestment);
  const flows = Array.isArray(annualCashFlows) ? annualCashFlows.map(c => sanitizeNumber(c)) : [];
  const r = Math.max(0, Number(discountRatePct) || 0) / 100;

  if (i0 <= 0 || flows.length === 0) {
    return {
      discountedPaybackYears: i0 === 0 ? 0 : null,
      isRecovered: i0 === 0,
      discountedPaybackFormatted: i0 === 0 ? '0 years' : 'Not recovered within timeline',
    };
  }

  let cumulativePv = 0;
  let prevCumulativePv = 0;
  let recoveredYear = null;

  for (let t = 1; t <= flows.length; t++) {
    const cf = flows[t - 1];
    const pv = r === 0 ? cf : cf / Math.pow(1 + r, t);
    prevCumulativePv = cumulativePv;
    cumulativePv += pv;

    if (cumulativePv >= i0 && recoveredYear === null) {
      const needed = i0 - prevCumulativePv;
      const fraction = pv > 0 ? needed / pv : 0;
      recoveredYear = (t - 1) + fraction;
      break;
    }
  }

  const isRecovered = recoveredYear !== null;
  const roundedYears = isRecovered ? Number(recoveredYear.toFixed(2)) : null;

  return {
    discountedPaybackYears: roundedYears,
    isRecovered,
    discountedPaybackFormatted: formatPaybackDuration(roundedYears),
  };
}

/**
 * Generates year-by-year Cumulative Cash Flow timelines (Nominal and Discounted).
 *
 * @param {Object} params
 * @param {number} params.initialInvestment - Upfront capital outlay (₹)
 * @param {Array<number>} params.annualCashFlows - Array of annual net cash flows (₹)
 * @param {number} [params.discountRatePct=10] - Annual discount rate (%)
 * @returns {Array<{ year: number, cashFlow: number, pvCashFlow: number, cumulativeNominal: number, cumulativeDiscounted: number, unrecoveredNominal: number, unrecoveredDiscounted: number }>}
 */
export function calculateCumulativeCashFlows({ initialInvestment = 0, annualCashFlows = [], discountRatePct = 10 } = {}) {
  const i0 = sanitizeNonNegative(initialInvestment);
  const flows = Array.isArray(annualCashFlows) ? annualCashFlows.map(c => sanitizeNumber(c)) : [];
  const r = Math.max(0, Number(discountRatePct) || 0) / 100;

  let cumNominal = 0;
  let cumDiscounted = 0;

  return flows.map((cf, idx) => {
    const t = idx + 1;
    const pv = r === 0 ? cf : cf / Math.pow(1 + r, t);
    cumNominal += cf;
    cumDiscounted += pv;

    return {
      year: t,
      cashFlow: Math.round(cf),
      pvCashFlow: Math.round(pv),
      cumulativeNominal: Math.round(cumNominal),
      cumulativeDiscounted: Math.round(cumDiscounted),
      unrecoveredNominal: Math.max(0, Math.round(i0 - cumNominal)),
      unrecoveredDiscounted: Math.max(0, Math.round(i0 - cumDiscounted)),
    };
  });
}

/**
 * Calculates Net Present Value (NPV) and Profitability Index (PI).
 *
 * @param {Object} params
 * @param {number} params.initialInvestment - Upfront capital outlay (₹)
 * @param {Array<number>} params.annualCashFlows - Array of annual net cash flows (₹)
 * @param {number} [params.discountRatePct=10] - Annual discount rate (%)
 * @returns {{ npv: number, pi: number|null, pvInflows: number, totalNominalInflows: number }}
 */
export function calculateNpvAndPi({ initialInvestment = 0, annualCashFlows = [], discountRatePct = 10 } = {}) {
  const i0 = sanitizeNonNegative(initialInvestment);
  const flows = Array.isArray(annualCashFlows) ? annualCashFlows.map(c => sanitizeNumber(c)) : [];
  const r = Math.max(0, Number(discountRatePct) || 0) / 100;

  let pvInflows = 0;
  let totalNominalInflows = 0;

  flows.forEach((cf, idx) => {
    const t = idx + 1;
    totalNominalInflows += cf;
    const pv = r === 0 ? cf : cf / Math.pow(1 + r, t);
    pvInflows += pv;
  });

  const npv = Math.round(pvInflows - i0);
  const pi = i0 > 0 ? Number((pvInflows / i0).toFixed(2)) : null;

  return {
    npv: npv === 0 ? 0 : npv,
    pi,
    pvInflows: Math.round(pvInflows),
    totalNominalInflows: Math.round(totalNominalInflows),
  };
}

/**
 * Master Cap Budgeting Payback Details Function.
 *
 * @param {Object} inputs
 * @returns {Object} Structured Payback Period Results
 */
export function calculatePaybackDetails(inputs = {}) {
  const initialInvestment = sanitizeNonNegative(inputs.initialInvestment || inputs.initialOutlay || inputs.investment);
  const discountRatePct = Math.max(0, Number(inputs.discountRatePct) !== undefined ? Number(inputs.discountRatePct) : 10);
  const targetPaybackYears = Math.max(0.5, Number(inputs.targetPaybackYears) || 3);
  const cashFlowType = inputs.cashFlowType === 'uneven' ? 'uneven' : 'equal';
  const projectLifeYears = Math.min(20, Math.max(1, Math.round(Number(inputs.projectLifeYears) || 5)));

  let annualCashFlows = [];

  if (cashFlowType === 'equal') {
    const equalFlow = inputs.annualCashFlow !== undefined && inputs.annualCashFlow !== null
      ? sanitizeNumber(inputs.annualCashFlow)
      : (inputs.annualCashInflow !== undefined ? sanitizeNumber(inputs.annualCashInflow) : 300000);
    annualCashFlows = Array(projectLifeYears).fill(equalFlow);
  } else if (Array.isArray(inputs.unevenCashFlows) && inputs.unevenCashFlows.length > 0) {
    annualCashFlows = inputs.unevenCashFlows.slice(0, projectLifeYears).map(c => sanitizeNumber(c));
    // Pad with last value or 0 if user provided fewer flows than projectLifeYears
    while (annualCashFlows.length < projectLifeYears) {
      annualCashFlows.push(0);
    }
  } else {
    // Default fallback cash flows
    annualCashFlows = [250000, 350000, 400000, 450000, 500000].slice(0, projectLifeYears);
  }

  const isValid = initialInvestment > 0 && annualCashFlows.some(c => c > 0);

  if (!isValid) {
    return {
      isValid: false,
      validationMessage: 'Please enter a valid initial investment and projected annual cash inflows.',
      initialInvestment: 0,
      discountRatePct,
      cashFlowType,
      projectLifeYears,
      targetPaybackYears,
      annualCashFlows: [],
      simplePaybackYears: null,
      isSimpleRecovered: false,
      simplePaybackFormatted: 'Not recovered',
      discountedPaybackYears: null,
      isDiscountedRecovered: false,
      discountedPaybackFormatted: 'Not recovered',
      npv: 0,
      pi: null,
      pvInflows: 0,
      totalNominalInflows: 0,
      simplePaybackWithinTarget: false,
      discountedPaybackWithinTarget: false,
      timeline: [],
    };
  }

  const simpleRes = calculateSimplePayback({ initialInvestment, annualCashFlows });
  const discountedRes = calculateDiscountedPayback({ initialInvestment, annualCashFlows, discountRatePct });
  const npvPiRes = calculateNpvAndPi({ initialInvestment, annualCashFlows, discountRatePct });
  const timeline = calculateCumulativeCashFlows({ initialInvestment, annualCashFlows, discountRatePct });

  const simplePaybackWithinTarget = simpleRes.isRecovered && simpleRes.simplePaybackYears <= targetPaybackYears;
  const discountedPaybackWithinTarget = discountedRes.isRecovered && discountedRes.discountedPaybackYears <= targetPaybackYears;

  return {
    isValid: true,
    validationMessage: '',
    initialInvestment,
    discountRatePct,
    cashFlowType,
    projectLifeYears,
    targetPaybackYears,
    annualCashFlows,
    simplePaybackYears: simpleRes.simplePaybackYears,
    isSimpleRecovered: simpleRes.isRecovered,
    simplePaybackFormatted: simpleRes.simplePaybackFormatted,
    discountedPaybackYears: discountedRes.discountedPaybackYears,
    isDiscountedRecovered: discountedRes.isRecovered,
    discountedPaybackFormatted: discountedRes.discountedPaybackFormatted,
    npv: npvPiRes.npv,
    pi: npvPiRes.pi,
    pvInflows: npvPiRes.pvInflows,
    totalNominalInflows: npvPiRes.totalNominalInflows,
    simplePaybackWithinTarget,
    discountedPaybackWithinTarget,
    timeline,
  };
}
