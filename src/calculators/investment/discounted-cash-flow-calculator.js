/**
 * Discounted Cash Flow (DCF) Calculator Financial Engine
 * 
 * Pure mathematical engine evaluating Free Cash Flow (FCF) projections, Present Value discounting,
 * Terminal Value (Gordon Growth Model & Exit Multiple Method), Enterprise Value, Equity Value,
 * Intrinsic Share Price, Margin of Safety, Terminal Value Contribution %, and a 2D Sensitivity Grid.
 * 
 * Framework-decoupled, zero DOM dependency.
 */

/**
 * Sanitizes numeric input safely.
 */
function sanitize(val, defaultVal = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? num : defaultVal;
}

/**
 * Calculates Free Cash Flow (FCF) Projections for Explicit or Growth-Rate mode.
 */
export function calculateFcfProjections({
  mode = 'growth', // 'growth' | 'explicit'
  startingFcf = 0,
  fcfGrowthRatePercent = 8,
  explicitFcfs = [],
  projectionYears = 5,
} = {}) {
  const years = Math.max(1, Math.min(15, Math.round(sanitize(projectionYears, 5))));
  const fcfList = [];

  if (mode === 'explicit' && Array.isArray(explicitFcfs) && explicitFcfs.length > 0) {
    for (let i = 0; i < years; i++) {
      const val = explicitFcfs[i] !== undefined ? Number(explicitFcfs[i]) : 0;
      fcfList.push(Number.isFinite(val) ? Math.round(val) : 0);
    }
  } else {
    let currentFcf = sanitize(startingFcf);
    const growthRate = sanitize(fcfGrowthRatePercent) / 100;
    for (let i = 1; i <= years; i++) {
      currentFcf = currentFcf * (1 + growthRate);
      fcfList.push(Math.round(currentFcf));
    }
  }

  return {
    mode,
    fcfList,
    projectionYears: years,
  };
}

/**
 * Calculates Present Value (PV) of explicit Free Cash Flows.
 */
export function calculatePvCashFlows(fcfList = [], discountRatePercent = 10) {
  const rate = Math.max(0.001, sanitize(discountRatePercent) / 100);
  const pvList = [];
  let totalPvExplicit = 0;

  for (let i = 0; i < fcfList.length; i++) {
    const t = i + 1;
    const fcf = sanitize(fcfList[i]);
    const pv = Math.round(fcf / Math.pow(1 + rate, t));
    pvList.push(pv);
    totalPvExplicit += pv;
  }

  return {
    pvList,
    totalPvExplicit: Math.round(totalPvExplicit),
  };
}

/**
 * Calculates Terminal Value (TV) using Gordon Growth Model or Exit Multiple Method.
 * Enforces g < r for Gordon Growth Model without silent clamping.
 */
export function calculateTerminalValue({
  method = 'gordon', // 'gordon' | 'exitMultiple'
  lastYearFcf = 0,
  terminalGrowthRatePercent = 3,
  discountRatePercent = 10,
  terminalEbitda = 0,
  exitMultiple = 10,
  projectionYears = 5,
} = {}) {
  const r = sanitize(discountRatePercent) / 100;
  const years = Math.max(1, sanitize(projectionYears, 5));

  if (method === 'exitMultiple') {
    const ebitda = sanitize(terminalEbitda);
    const mult = sanitize(exitMultiple);
    const tv = Math.round(ebitda * mult);
    const pvTv = Math.round(tv / Math.pow(1 + r, years));
    return {
      isValid: true,
      validationMessage: '',
      method: 'exitMultiple',
      tv,
      pvTv,
    };
  }

  // Gordon Growth Model
  const g = sanitize(terminalGrowthRatePercent) / 100;
  const fcfN = sanitize(lastYearFcf);

  if (g >= r) {
    return {
      isValid: false,
      validationMessage: `Terminal growth rate (${terminalGrowthRatePercent}%) must be strictly less than the discount rate / WACC (${discountRatePercent}%).`,
      method: 'gordon',
      tv: 0,
      pvTv: 0,
    };
  }

  const tv = Math.round((fcfN * (1 + g)) / (r - g));
  const pvTv = Math.round(tv / Math.pow(1 + r, years));

  return {
    isValid: true,
    validationMessage: '',
    method: 'gordon',
    tv,
    pvTv,
  };
}

/**
 * Calculates Enterprise Value, Equity Value, and Terminal Value Contribution %.
 */
export function calculateEnterpriseAndEquityValue(pvExplicit = 0, pvTv = 0, cashAndEquivalents = 0, totalDebt = 0) {
  const pvExp = sanitize(pvExplicit);
  const pvT = sanitize(pvTv);
  const cash = sanitize(cashAndEquivalents);
  const debt = sanitize(totalDebt);

  const enterpriseValue = Math.round(pvExp + pvT);
  const equityValue = Math.round(enterpriseValue + cash - debt);
  
  const tvContributionPercent = enterpriseValue > 0 
    ? Number(((pvT / enterpriseValue) * 100).toFixed(2)) 
    : 0;

  return {
    enterpriseValue,
    equityValue,
    tvContributionPercent,
  };
}

/**
 * Calculates Intrinsic Value Per Share, Upside/Downside %, and Margin of Safety Price.
 */
export function calculateIntrinsicValuePerShare(
  equityValue = 0,
  sharesOutstanding = 0,
  currentStockPrice = 0,
  marginOfSafetyPercent = 15
) {
  const shares = sanitize(sharesOutstanding);
  const price = sanitize(currentStockPrice);
  const mosPct = Math.min(99, Math.max(0, sanitize(marginOfSafetyPercent)));

  if (shares <= 0) {
    return {
      isValid: false,
      validationMessage: 'Shares outstanding must be greater than zero for per-share valuation.',
      intrinsicValuePerShare: 0,
      upsideDownsidePercent: 0,
      marginOfSafetyPrice: 0,
    };
  }

  const eqVal = sanitize(equityValue);
  const intrinsicValuePerShare = Number((eqVal / shares).toFixed(2));
  
  const upsideDownsidePercent = price > 0 
    ? Number((((intrinsicValuePerShare - price) / price) * 100).toFixed(2)) 
    : 0;

  const marginOfSafetyPrice = Number((intrinsicValuePerShare * (1 - mosPct / 100)).toFixed(2));

  return {
    isValid: true,
    validationMessage: '',
    intrinsicValuePerShare,
    upsideDownsidePercent,
    marginOfSafetyPrice,
  };
}

/**
 * Calculates 2D Sensitivity Matrix for Discount Rate (WACC) vs Terminal Growth Rate.
 * Returns N/A for cells where g >= r without silent clamping.
 */
export function calculateDcfSensitivityMatrix({
  mode = 'growth',
  startingFcf = 0,
  fcfGrowthRatePercent = 8,
  explicitFcfs = [],
  projectionYears = 5,
  baseDiscountRate = 10,
  baseTerminalGrowth = 3,
  terminalMethod = 'gordon',
  terminalEbitda = 0,
  exitMultiple = 10,
  cashAndEquivalents = 0,
  totalDebt = 0,
  sharesOutstanding = 0,
} = {}) {
  const discountOffsets = [-2, -1, 0, 1, 2];
  const growthOffsets = [-1, -0.5, 0, 0.5, 1];

  const baseWacc = sanitize(baseDiscountRate, 10);
  const baseGrowth = sanitize(baseTerminalGrowth, 3);

  const matrix = [];

  for (const gOffset of growthOffsets) {
    const currentG = Number((baseGrowth + gOffset).toFixed(2));
    const row = { terminalGrowthRatePercent: currentG, cells: [] };

    for (const wOffset of discountOffsets) {
      const currentR = Number((baseWacc + wOffset).toFixed(2));

      if (currentR <= 0 || (terminalMethod === 'gordon' && currentG >= currentR)) {
        row.cells.push({
          discountRatePercent: currentR,
          intrinsicValuePerShare: null,
          formattedValue: 'N/A',
          isValid: false,
        });
        continue;
      }

      // Compute standalone cell valuation
      const fcfRes = calculateFcfProjections({
        mode,
        startingFcf,
        fcfGrowthRatePercent,
        explicitFcfs,
        projectionYears,
      });

      const pvRes = calculatePvCashFlows(fcfRes.fcfList, currentR);

      const tvRes = calculateTerminalValue({
        method: terminalMethod,
        lastYearFcf: fcfRes.fcfList[fcfRes.fcfList.length - 1] || 0,
        terminalGrowthRatePercent: currentG,
        discountRatePercent: currentR,
        terminalEbitda,
        exitMultiple,
        projectionYears,
      });

      if (!tvRes.isValid) {
        row.cells.push({
          discountRatePercent: currentR,
          intrinsicValuePerShare: null,
          formattedValue: 'N/A',
          isValid: false,
        });
        continue;
      }

      const eqRes = calculateEnterpriseAndEquityValue(
        pvRes.totalPvExplicit,
        tvRes.pvTv,
        cashAndEquivalents,
        totalDebt
      );

      const shareRes = calculateIntrinsicValuePerShare(
        eqRes.equityValue,
        sharesOutstanding,
        0,
        0
      );

      row.cells.push({
        discountRatePercent: currentR,
        intrinsicValuePerShare: shareRes.intrinsicValuePerShare,
        formattedValue: shareRes.isValid ? shareRes.intrinsicValuePerShare.toFixed(2) : 'N/A',
        isValid: shareRes.isValid,
      });
    }

    matrix.push(row);
  }

  return {
    discountRates: discountOffsets.map((o) => Number((baseWacc + o).toFixed(2))),
    matrix,
  };
}

/**
 * Main Discounted Cash Flow (DCF) Calculator Engine.
 * 
 * @param {Object} inputs
 * @returns {Object} Structured Valuation Results
 */
export function calculateDcf({
  mode = 'growth', // 'growth' | 'explicit'
  startingFcf = 1000000,
  fcfGrowthRatePercent = 8,
  explicitFcfs = [1080000, 1166400, 1259712, 1360489, 1469328],
  projectionYears = 5,
  discountRatePercent = 10,
  terminalMethod = 'gordon', // 'gordon' | 'exitMultiple'
  terminalGrowthRatePercent = 3,
  terminalEbitda = 0,
  exitMultiple = 10,
  cashAndEquivalents = 500000,
  totalDebt = 1000000,
  sharesOutstanding = 100000,
  currentStockPrice = 100,
  marginOfSafetyPercent = 15,
} = {}) {
  const wacc = sanitize(discountRatePercent, 10);
  const shares = sanitize(sharesOutstanding);

  if (wacc <= 0) {
    return {
      isValid: false,
      validationMessage: 'Discount Rate / WACC must be greater than 0%.',
    };
  }

  if (shares <= 0) {
    return {
      isValid: false,
      validationMessage: 'Shares outstanding must be greater than 0 to calculate per-share intrinsic value.',
    };
  }

  // 1. FCF Projections
  const fcfResult = calculateFcfProjections({
    mode,
    startingFcf,
    fcfGrowthRatePercent,
    explicitFcfs,
    projectionYears,
  });

  // 2. PV of Explicit FCFs
  const pvResult = calculatePvCashFlows(fcfResult.fcfList, wacc);

  // 3. Terminal Value
  const lastYearFcf = fcfResult.fcfList[fcfResult.fcfList.length - 1] || 0;
  const tvResult = calculateTerminalValue({
    method: terminalMethod,
    lastYearFcf,
    terminalGrowthRatePercent,
    discountRatePercent: wacc,
    terminalEbitda,
    exitMultiple,
    projectionYears: fcfResult.projectionYears,
  });

  if (!tvResult.isValid) {
    return {
      isValid: false,
      validationMessage: tvResult.validationMessage,
    };
  }

  // 4. Enterprise & Equity Value
  const eqResult = calculateEnterpriseAndEquityValue(
    pvResult.totalPvExplicit,
    tvResult.pvTv,
    cashAndEquivalents,
    totalDebt
  );

  // 5. Intrinsic Share Price & Margin of Safety
  const shareResult = calculateIntrinsicValuePerShare(
    eqResult.equityValue,
    shares,
    currentStockPrice,
    marginOfSafetyPercent
  );

  // 6. Sensitivity Matrix
  const sensitivityResult = calculateDcfSensitivityMatrix({
    mode,
    startingFcf,
    fcfGrowthRatePercent,
    explicitFcfs,
    projectionYears: fcfResult.projectionYears,
    baseDiscountRate: wacc,
    baseTerminalGrowth: terminalGrowthRatePercent,
    terminalMethod,
    terminalEbitda,
    exitMultiple,
    cashAndEquivalents,
    totalDebt,
    sharesOutstanding: shares,
  });

  return {
    isValid: true,
    validationMessage: '',
    mode: fcfResult.mode,
    projectionYears: fcfResult.projectionYears,
    fcfList: fcfResult.fcfList,
    pvList: pvResult.pvList,
    totalPvExplicit: pvResult.totalPvExplicit,
    terminalMethod: tvResult.method,
    terminalValue: tvResult.tv,
    pvTerminalValue: tvResult.pvTv,
    enterpriseValue: eqResult.enterpriseValue,
    cashAndEquivalents: sanitize(cashAndEquivalents),
    totalDebt: sanitize(totalDebt),
    equityValue: eqResult.equityValue,
    tvContributionPercent: eqResult.tvContributionPercent,
    sharesOutstanding: shares,
    currentStockPrice: sanitize(currentStockPrice),
    intrinsicValuePerShare: shareResult.intrinsicValuePerShare,
    upsideDownsidePercent: shareResult.upsideDownsidePercent,
    marginOfSafetyPercent: sanitize(marginOfSafetyPercent),
    marginOfSafetyPrice: shareResult.marginOfSafetyPrice,
    sensitivity: sensitivityResult,
    breakdownSchedule: fcfResult.fcfList.map((fcf, idx) => ({
      year: idx + 1,
      fcf,
      pv: pvResult.pvList[idx] || 0,
    })),
  };
}
