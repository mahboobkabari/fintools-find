/**
 * Net Present Value (NPV) & Internal Rate of Return (IRR) Financial Engine
 * 
 * Pure financial engine for capital budgeting analysis.
 * Performs NPV, Newton-Raphson / bisection IRR solving with non-normal cash flow safeguards,
 * MIRR with reinvestment/financing rates, Profitability Index, Discounted Payback Period,
 * and multi-rate NPV sensitivity.
 */

/**
 * Calculates Net Present Value (NPV) for an initial outlay CF0, array of cash flows, and discount rate.
 */
export function calculateNpv(cf0, cashFlows = [], discountRatePercent = 0) {
  const numCf0 = Math.max(0, Number(cf0) || 0);
  const numRate = Number(discountRatePercent) || 0;
  const r = numRate / 100;

  if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
    return -numCf0;
  }

  let pvInflows = 0;
  cashFlows.forEach((cf, idx) => {
    const t = idx + 1;
    const cashVal = Number(cf) || 0;
    if (r === 0) {
      pvInflows += cashVal;
    } else {
      pvInflows += cashVal / Math.pow(1 + r, t);
    }
  });

  const rounded = Math.round(pvInflows - numCf0);
  return rounded === 0 ? 0 : rounded;
}

/**
 * Analyzes cash flow sign patterns to detect non-normal cash flows and potential multiple IRRs.
 */
export function analyzeCashFlowSigns(cf0, cashFlows = []) {
  const stream = [-Math.max(0, Number(cf0) || 0), ...cashFlows.map(c => Number(c) || 0)];
  
  let signChangeCount = 0;
  let hasNegativeInflows = false;

  for (let i = 0; i < stream.length - 1; i++) {
    const current = stream[i];
    const next = stream[i + 1];
    if (next < 0 && i > 0) {
      hasNegativeInflows = true;
    }
    if ((current > 0 && next < 0) || (current < 0 && next > 0)) {
      signChangeCount++;
    }
  }

  const isNonNormal = signChangeCount > 1;

  return {
    isNonNormal,
    signChangeCount,
    hasNegativeInflows,
    possibleMultipleIrr: isNonNormal,
  };
}

/**
 * Internal helper evaluating raw unrounded NPV for solver root-finding.
 */
function rawNpv(cf0, cashFlows, r) {
  let pv = -cf0;
  for (let t = 1; t <= cashFlows.length; t++) {
    const val = cashFlows[t - 1];
    pv += val / Math.pow(1 + r, t);
  }
  return pv;
}

/**
 * Internal helper derivative d(NPV)/dr for Newton-Raphson solver.
 */
function rawNpvDerivative(cashFlows, r) {
  let dPv = 0;
  for (let t = 1; t <= cashFlows.length; t++) {
    const val = cashFlows[t - 1];
    dPv -= (t * val) / Math.pow(1 + r, t + 1);
  }
  return dPv;
}

/**
 * Solves Internal Rate of Return (IRR) with Newton-Raphson and bracketed bisection fallback.
 * Checks for non-normal cash flows and multiple candidate roots.
 */
export function calculateIrr(cf0, cashFlows = []) {
  const numCf0 = Math.max(0, Number(cf0) || 0);
  const cleanFlows = cashFlows.map(c => Number(c) || 0);

  if (numCf0 === 0 || cleanFlows.length === 0) {
    return { irr: null, isUnique: false, irrCandidates: [], irrStatus: 'unavailable', validationMessage: 'Initial outlay and cash flows required.' };
  }

  const signAnalysis = analyzeCashFlowSigns(numCf0, cleanFlows);

  // Search candidate root brackets between -0.95 and 5.0 (500%)
  const candidateRoots = [];
  const MAX_ITER = 100;

  // Bracket scan across rate intervals
  const scanStep = 0.05; // 5% interval steps
  for (let rScan = -0.95; rScan <= 5.0; rScan += scanStep) {
    const r1 = rScan;
    const r2 = rScan + scanStep;
    const npv1 = rawNpv(numCf0, cleanFlows, r1);
    const npv2 = rawNpv(numCf0, cleanFlows, r2);

    if (npv1 * npv2 <= 0) {
      // Bracket found! Perform bisection solver
      let low = r1;
      let high = r2;
      let mid = low;

      for (let iter = 0; iter < MAX_ITER; iter++) {
        mid = (low + high) / 2;
        const npvMid = rawNpv(numCf0, cleanFlows, mid);
        if (Math.abs(npvMid) < 0.01 || (high - low) / 2 < 0.00001) {
          break;
        }
        if (rawNpv(numCf0, cleanFlows, low) * npvMid < 0) {
          high = mid;
        } else {
          low = mid;
        }
      }

      // Check residual validation
      const residual = Math.abs(rawNpv(numCf0, cleanFlows, mid));
      if (residual < 500) { // Valid root
        let rootPercent = Math.round(mid * 10000) / 100;
        if (rootPercent === 0) rootPercent = 0;
        if (!candidateRoots.some(r => Math.abs(r - rootPercent) < 0.1)) {
          candidateRoots.push(rootPercent);
        }
      }
    }
  }

  // If bisection didn't find a root, try Newton-Raphson from initial guess 0.10
  if (candidateRoots.length === 0) {
    let rGuess = 0.10;
    for (let iter = 0; iter < MAX_ITER; iter++) {
      const npvVal = rawNpv(numCf0, cleanFlows, rGuess);
      if (Math.abs(npvVal) < 0.01) {
        candidateRoots.push(Math.round(rGuess * 10000) / 100);
        break;
      }
      const dNpv = rawNpvDerivative(cleanFlows, rGuess);
      if (Math.abs(dNpv) < 1e-7) break;
      const rNext = rGuess - npvVal / dNpv;
      if (rNext <= -0.99 || rNext > 10.0) break;
      if (Math.abs(rNext - rGuess) < 0.00001) {
        if (Math.abs(rawNpv(numCf0, cleanFlows, rNext)) < 500) {
          candidateRoots.push(Math.round(rNext * 10000) / 100);
        }
        break;
      }
      rGuess = rNext;
    }
  }

  if (candidateRoots.length === 0) {
    return {
      irr: null,
      isUnique: false,
      irrCandidates: [],
      irrStatus: 'none',
      signAnalysis,
      validationMessage: 'No valid Internal Rate of Return (IRR) root found for this cash flow stream.',
    };
  }

  if (candidateRoots.length === 1) {
    return {
      irr: candidateRoots[0],
      isUnique: true,
      irrCandidates: candidateRoots,
      irrStatus: 'unique',
      signAnalysis,
    };
  }

  // Multiple candidate IRRs detected!
  return {
    irr: candidateRoots[0],
    isUnique: false,
    irrCandidates: candidateRoots,
    irrStatus: 'multiple',
    signAnalysis,
    validationMessage: `Non-normal cash flows detected (${signAnalysis.signChangeCount} sign changes). Multiple IRR roots found (${candidateRoots.join('%, ')}%). Use MIRR for decision making.`,
  };
}

/**
 * Calculates Modified Internal Rate of Return (MIRR).
 */
export function calculateMirr(cf0, cashFlows = [], reinvestmentRatePercent = 10, financingRatePercent = 10) {
  const numCf0 = Math.max(0, Number(cf0) || 0);
  const cleanFlows = cashFlows.map(c => Number(c) || 0);
  const N = cleanFlows.length;

  if (numCf0 === 0 || N === 0) {
    return { mirr: null, isValid: false, validationMessage: 'Initial outlay and cash flows required.' };
  }

  const rReinvest = (Number(reinvestmentRatePercent) || 0) / 100;
  const rFinance = (Number(financingRatePercent) || 0) / 100;

  // 1. Terminal Value of positive cash inflows
  let fvPositiveInflows = 0;
  cleanFlows.forEach((cf, idx) => {
    const t = idx + 1;
    if (cf > 0) {
      fvPositiveInflows += cf * Math.pow(1 + rReinvest, N - t);
    }
  });

  // 2. Present Value of negative cash outflows
  let pvNegativeOutflows = numCf0;
  cleanFlows.forEach((cf, idx) => {
    const t = idx + 1;
    if (cf < 0) {
      pvNegativeOutflows += Math.abs(cf) / Math.pow(1 + rFinance, t);
    }
  });

  if (pvNegativeOutflows <= 0 || fvPositiveInflows <= 0) {
    return { mirr: null, isValid: false, validationMessage: 'MIRR cannot be calculated when positive inflows or negative outflows are absent.' };
  }

  const mirrRatio = fvPositiveInflows / pvNegativeOutflows;
  const mirrRaw = Math.pow(mirrRatio, 1 / N) - 1;
  const mirrPercent = Math.round(mirrRaw * 10000) / 100;

  return {
    mirr: mirrPercent,
    isValid: true,
    fvPositiveInflows: Math.round(fvPositiveInflows),
    pvNegativeOutflows: Math.round(pvNegativeOutflows),
  };
}

/**
 * Calculates Profitability Index (PI) = PV of Future Cash Inflows / Initial Outlay CF0.
 */
export function calculateProfitabilityIndex(cf0, cashFlows = [], discountRatePercent = 10) {
  const numCf0 = Math.max(0, Number(cf0) || 0);
  const cleanFlows = cashFlows.map(c => Number(c) || 0);
  const r = (Number(discountRatePercent) || 0) / 100;

  if (numCf0 === 0) {
    return { pi: null, isValid: false, validationMessage: 'Initial outlay must be greater than zero.' };
  }

  let pvInflows = 0;
  cleanFlows.forEach((cf, idx) => {
    const t = idx + 1;
    if (cf > 0) {
      if (r === 0) {
        pvInflows += cf;
      } else {
        pvInflows += cf / Math.pow(1 + r, t);
      }
    }
  });

  const piRaw = pvInflows / numCf0;
  const pi = Math.round(piRaw * 100) / 100;

  return {
    pi,
    isValid: true,
    pvInflows: Math.round(pvInflows),
    initialOutlay: numCf0,
  };
}

/**
 * Calculates Discounted Payback Period in fractional years.
 */
export function calculateDiscountedPayback(cf0, cashFlows = [], discountRatePercent = 10) {
  const numCf0 = Math.max(0, Number(cf0) || 0);
  const cleanFlows = cashFlows.map(c => Number(c) || 0);
  const r = (Number(discountRatePercent) || 0) / 100;

  if (numCf0 === 0) {
    return { paybackYears: 0, isRecovered: true };
  }

  let cumPv = 0;
  let prevCumPv = 0;
  let recoveredYear = null;

  for (let t = 1; t <= cleanFlows.length; t++) {
    const cf = cleanFlows[t - 1];
    const pv = r === 0 ? cf : cf / Math.pow(1 + r, t);
    prevCumPv = cumPv;
    cumPv += pv;

    if (cumPv >= numCf0 && recoveredYear === null) {
      const remainingNeeded = numCf0 - prevCumPv;
      const fraction = pv > 0 ? remainingNeeded / pv : 0;
      recoveredYear = Math.round(((t - 1) + fraction) * 100) / 100;
      break;
    }
  }

  return {
    paybackYears: recoveredYear,
    isRecovered: recoveredYear !== null,
  };
}

/**
 * Generates multi-rate NPV sensitivity series.
 */
export function calculateNpvSensitivity(cf0, cashFlows = [], ratesArray = [5, 10, 15, 20]) {
  return ratesArray.map(rate => {
    const npv = calculateNpv(cf0, cashFlows, rate);
    return {
      discountRatePercent: rate,
      npv,
    };
  });
}

/**
 * Main integration function for Net Present Value (NPV) & IRR Calculator.
 */
export function calculateNpvProject(inputs = {}) {
  const initialOutlay = Math.max(0, Number(inputs.initialOutlay) || 0);
  const discountRatePercent = Number(inputs.discountRatePercent) !== undefined && inputs.discountRatePercent !== ''
    ? Number(inputs.discountRatePercent)
    : 10;
  const reinvestmentRatePercent = Number(inputs.reinvestmentRatePercent) !== undefined && inputs.reinvestmentRatePercent !== ''
    ? Number(inputs.reinvestmentRatePercent)
    : discountRatePercent;
  const financingRatePercent = Number(inputs.financingRatePercent) !== undefined && inputs.financingRatePercent !== ''
    ? Number(inputs.financingRatePercent)
    : discountRatePercent;

  const rawFlows = Array.isArray(inputs.cashFlows) ? inputs.cashFlows : [];
  const cashFlows = rawFlows.map(c => Number(c) || 0);

  if (initialOutlay === 0 && cashFlows.length === 0) {
    return {
      isValid: false,
      validationMessage: 'Initial outlay and annual cash flow projections are required.',
    };
  }

  const npv = calculateNpv(initialOutlay, cashFlows, discountRatePercent);
  const irrRes = calculateIrr(initialOutlay, cashFlows);
  const mirrRes = calculateMirr(initialOutlay, cashFlows, reinvestmentRatePercent, financingRatePercent);
  const piRes = calculateProfitabilityIndex(initialOutlay, cashFlows, discountRatePercent);
  const paybackRes = calculateDiscountedPayback(initialOutlay, cashFlows, discountRatePercent);
  const sensitivity = calculateNpvSensitivity(initialOutlay, cashFlows, [5, 10, 15, 20]);

  const r = discountRatePercent / 100;
  const schedule = cashFlows.map((cf, idx) => {
    const t = idx + 1;
    const pv = Math.round(cf / Math.pow(1 + r, t));
    return {
      year: t,
      cashFlow: Math.round(cf),
      pv,
    };
  });

  const signAnalysis = analyzeCashFlowSigns(initialOutlay, cashFlows);

  // Financial signal
  let decisionSignal = 'neutral';
  if (npv > 0) decisionSignal = 'accept';
  else if (npv < 0) decisionSignal = 'reject';

  return {
    isValid: true,
    initialOutlay: Math.round(initialOutlay),
    discountRatePercent,
    reinvestmentRatePercent,
    financingRatePercent,
    cashFlows,
    npv,
    irr: irrRes.irr,
    irrStatus: irrRes.irrStatus,
    irrCandidates: irrRes.irrCandidates,
    mirr: mirrRes.mirr,
    pi: piRes.pi,
    paybackYears: paybackRes.paybackYears,
    isPaybackRecovered: paybackRes.isRecovered,
    decisionSignal,
    signAnalysis,
    sensitivity,
    schedule,
  };
}
