/**
 * Token Vesting Calculation Engine
 * Sprint 90 / Flagship #97
 * 
 * Pure deterministic token vesting schedule engine with cliff handling,
 * initial TGE unlock, periodic/linear schedules, price sensitivity, and ownership metrics.
 */

export const FIAT_CURRENCIES = {
  USD: { symbol: '$', code: 'USD', decimals: 2 },
  EUR: { symbol: '€', code: 'EUR', decimals: 2 },
  GBP: { symbol: '£', code: 'GBP', decimals: 2 },
  INR: { symbol: '₹', code: 'INR', decimals: 2 },
  CAD: { symbol: 'C$', code: 'CAD', decimals: 2 },
  AUD: { symbol: 'A$', code: 'AUD', decimals: 2 },
  AED: { symbol: 'د.إ', code: 'AED', decimals: 2 },
  SGD: { symbol: 'S$', code: 'SGD', decimals: 2 },
  JPY: { symbol: '¥', code: 'JPY', decimals: 0 },
};

export const VESTING_MODELS = {
  CLIFF_LINEAR: {
    id: 'CLIFF_LINEAR',
    label: 'Cliff + Linear Periodic Vesting',
    desc: 'Tokens unlock linearly in periodic intervals after a mandatory cliff period.',
  },
  LINEAR_NO_CLIFF: {
    id: 'LINEAR_NO_CLIFF',
    label: 'Linear Vesting (No Cliff)',
    desc: 'Tokens unlock continuously/periodically from day 1 with zero cliff delay.',
  },
  INITIAL_UNLOCK_CLIFF_LINEAR: {
    id: 'INITIAL_UNLOCK_CLIFF_LINEAR',
    label: 'Initial Unlock (TGE) + Cliff + Linear',
    desc: 'A percentage unlocks immediately at TGE; the remainder vests after a cliff.',
  },
  PERIODIC_TRANCHE: {
    id: 'PERIODIC_TRANCHE',
    label: 'Stepped Tranche Vesting',
    desc: 'Equal block tranches unlock at discrete intervals (e.g. quarterly/annually).',
  },
  IMMEDIATE: {
    id: 'IMMEDIATE',
    label: 'Immediate / Fully Unlocked',
    desc: '100% of allocation is available immediately with no lockup or vesting schedule.',
  },
};

export const VESTING_FREQUENCIES = {
  MONTHLY: { id: 'MONTHLY', label: 'Monthly (Every Month)', periodsPerYear: 12, monthInterval: 1 },
  QUARTERLY: { id: 'QUARTERLY', label: 'Quarterly (Every 3 Months)', periodsPerYear: 4, monthInterval: 3 },
  ANNUALLY: { id: 'ANNUALLY', label: 'Annually (Every 12 Months)', periodsPerYear: 1, monthInterval: 12 },
  WEEKLY: { id: 'WEEKLY', label: 'Weekly (Every 7 Days)', periodsPerYear: 52, dayInterval: 7 },
  DAILY: { id: 'DAILY', label: 'Daily (Every Day)', periodsPerYear: 365, dayInterval: 1 },
  CONTINUOUS: { id: 'CONTINUOUS', label: 'Continuous (Second-by-Second)', periodsPerYear: 365 },
};

/**
 * Sanitizes input numbers safely.
 */
export function sanitizeNumber(val, defaultVal = 0, min = 0, max = Infinity) {
  if (val === null || val === undefined) return defaultVal;
  const n = Number(val);
  if (isNaN(n) || !isFinite(n)) return defaultVal;
  return Math.min(Math.max(n, min), max);
}

/**
 * Date helper: Adds months deterministically without timezone shifts.
 * Formats: 'YYYY-MM-DD'
 * @param {string|Date} dateInput
 * @param {number} monthsToAdd
 * @returns {string} 'YYYY-MM-DD'
 */
export function addMonthsToDate(dateInput, monthsToAdd) {
  const parts = parseDateParts(dateInput);
  let year = parts.year;
  let month = parts.month + monthsToAdd;
  let day = parts.day;

  while (month > 12) {
    year += 1;
    month -= 12;
  }
  while (month < 1) {
    year -= 1;
    month += 12;
  }

  // Adjust for shorter months (e.g. Feb 30 -> Feb 28/29)
  const maxDaysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const validDay = Math.min(day, maxDaysInMonth);

  return formatDateParts(year, month, validDay);
}

/**
 * Date helper: Adds days deterministically.
 * @param {string|Date} dateInput
 * @param {number} daysToAdd
 * @returns {string} 'YYYY-MM-DD'
 */
export function addDaysToDate(dateInput, daysToAdd) {
  const parts = parseDateParts(dateInput);
  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  utcDate.setUTCDate(utcDate.getUTCDate() + daysToAdd);
  return formatDateParts(utcDate.getUTCFullYear(), utcDate.getUTCMonth() + 1, utcDate.getUTCDate());
}

/**
 * Parses YYYY-MM-DD string or Date object into { year, month (1-12), day (1-31) }
 */
export function parseDateParts(dateInput) {
  if (!dateInput) {
    const now = new Date();
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1, day: now.getUTCDate() };
  }
  if (typeof dateInput === 'string') {
    const cleanStr = dateInput.trim().split('T')[0];
    const segments = cleanStr.split('-');
    if (segments.length === 3) {
      const y = parseInt(segments[0], 10);
      const m = parseInt(segments[1], 10);
      const d = parseInt(segments[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return { year: y, month: m, day: d };
      }
    }
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return { year: 2024, month: 1, day: 1 };
  }
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/**
 * Formats { year, month, day } to 'YYYY-MM-DD'
 */
export function formatDateParts(year, month, day) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * Computes calendar days difference between two ISO date strings (D2 - D1).
 */
export function diffDays(date1, date2) {
  const p1 = parseDateParts(date1);
  const p2 = parseDateParts(date2);
  const utc1 = Date.UTC(p1.year, p1.month - 1, p1.day);
  const utc2 = Date.UTC(p2.year, p2.month - 1, p2.day);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/**
 * Calculates Token Vesting Schedule and Status.
 *
 * @param {Object} params
 * @param {number} [params.totalTokens=100000] - Total tokens granted/allocated
 * @param {number} [params.tokenPrice=1.5] - Current token price in quote currency
 * @param {number} [params.grantPrice=0.25] - Token price at initial grant/TGE (optional)
 * @param {string} [params.startDate='2024-01-01'] - Vesting start / TGE date (YYYY-MM-DD)
 * @param {string} [params.evaluationDate='2025-01-01'] - Evaluation date for vesting status (YYYY-MM-DD)
 * @param {string} [params.vestingModel='CLIFF_LINEAR'] - 'CLIFF_LINEAR', 'LINEAR_NO_CLIFF', 'INITIAL_UNLOCK_CLIFF_LINEAR', 'PERIODIC_TRANCHE', 'IMMEDIATE'
 * @param {number} [params.cliffMonths=12] - Cliff duration in months
 * @param {number} [params.vestingMonths=48] - Total vesting duration in months
 * @param {string} [params.vestingFrequency='MONTHLY'] - 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'WEEKLY', 'DAILY', 'CONTINUOUS'
 * @param {number} [params.initialUnlockPct=0] - Initial TGE unlock percentage (0-100)
 * @param {number} [params.totalSupply=10000000] - Optional total token supply for ownership %
 * @param {string} [params.currency='USD'] - Quote fiat currency
 * @param {string} [params.tokenSymbol='TOKEN'] - Token ticker symbol
 * @returns {Object} Comprehensive vesting analytics, KPI metrics, schedule table, and price sensitivity
 */
export function calculateTokenVesting(params = {}) {
  const {
    totalTokens = 100000,
    tokenPrice = 1.5,
    grantPrice = 0.25,
    startDate = '2024-01-01',
    evaluationDate = '2025-01-01',
    vestingModel = 'CLIFF_LINEAR',
    cliffMonths = 12,
    vestingMonths = 48,
    vestingFrequency = 'MONTHLY',
    initialUnlockPct = 0,
    totalSupply = 10000000,
    currency = 'USD',
    tokenSymbol = 'TOKEN',
  } = params;

  // 1. Input Sanitization
  const cleanTotalTokens = sanitizeNumber(totalTokens, 100000, 0, 1e15);
  const cleanTokenPrice = sanitizeNumber(tokenPrice, 1.5, 0, 1e9);
  const cleanGrantPrice = sanitizeNumber(grantPrice, 0.25, 0, 1e9);
  const cleanCliffMonths = sanitizeNumber(cliffMonths, 0, 0, 240);
  const cleanVestingMonths = Math.max(sanitizeNumber(vestingMonths, 48, 0, 600), cleanCliffMonths);
  const cleanInitialUnlockPct = sanitizeNumber(initialUnlockPct, 0, 0, 100);
  const cleanTotalSupply = sanitizeNumber(totalSupply, 0, 0, 1e18);

  const currMeta = FIAT_CURRENCIES[currency] || FIAT_CURRENCIES.USD;
  const cleanStartDate = formatDateParts(
    parseDateParts(startDate).year,
    parseDateParts(startDate).month,
    parseDateParts(startDate).day
  );
  const cleanEvalDate = formatDateParts(
    parseDateParts(evaluationDate).year,
    parseDateParts(evaluationDate).month,
    parseDateParts(evaluationDate).day
  );

  // 2. Dates Resolution
  const cliffEndDate = addMonthsToDate(cleanStartDate, cleanCliffMonths);
  const vestingEndDate = addMonthsToDate(cleanStartDate, cleanVestingMonths);

  const totalDays = Math.max(1, diffDays(cleanStartDate, vestingEndDate));
  const cliffDays = diffDays(cleanStartDate, cliffEndDate);
  const daysSinceStart = diffDays(cleanStartDate, cleanEvalDate);
  const daysUntilEnd = diffDays(cleanEvalDate, vestingEndDate);

  // 3. Initial TGE Unlock & Remaining Vesting Allocation
  let effectiveInitialUnlockPct = 0;
  if (vestingModel === 'IMMEDIATE') {
    effectiveInitialUnlockPct = 100;
  } else if (vestingModel === 'INITIAL_UNLOCK_CLIFF_LINEAR') {
    effectiveInitialUnlockPct = cleanInitialUnlockPct;
  } else {
    effectiveInitialUnlockPct = cleanInitialUnlockPct;
  }

  const initialUnlockTokens = cleanTotalTokens * (effectiveInitialUnlockPct / 100);
  const remainingVestingTokens = Math.max(0, cleanTotalTokens - initialUnlockTokens);

  // 4. Generate Discrete Vesting Schedule
  const schedule = generateVestingSchedule({
    totalTokens: cleanTotalTokens,
    initialUnlockTokens,
    remainingVestingTokens,
    startDate: cleanStartDate,
    cliffEndDate,
    vestingEndDate,
    cliffMonths: cleanCliffMonths,
    vestingMonths: cleanVestingMonths,
    vestingModel,
    vestingFrequency,
    tokenPrice: cleanTokenPrice,
  });

  // 5. Evaluate Current Status at Evaluation Date
  let vestedTokens = 0;
  let nextUnlockDate = null;
  let nextUnlockAmount = 0;
  let nextUnlockValue = 0;
  let daysUntilNextUnlock = 0;

  if (vestingModel === 'IMMEDIATE') {
    vestedTokens = cleanTotalTokens;
  } else if (daysSinceStart < 0) {
    // Before Grant Start Date
    vestedTokens = 0;
    if (schedule.length > 0) {
      nextUnlockDate = schedule[0].date;
      nextUnlockAmount = schedule[0].unlockedTokens;
      nextUnlockValue = schedule[0].unlockedValue;
      daysUntilNextUnlock = Math.max(0, diffDays(cleanEvalDate, nextUnlockDate));
    }
  } else if (daysUntilEnd <= 0) {
    // After Vesting End Date: 100% Vested
    vestedTokens = cleanTotalTokens;
  } else if (daysSinceStart < cliffDays && cleanCliffMonths > 0 && vestingModel !== 'LINEAR_NO_CLIFF') {
    // During Cliff Period: Only Initial Unlock is available
    vestedTokens = initialUnlockTokens;
    // Next unlock is the cliff release
    const cliffItem = schedule.find((s) => diffDays(cleanEvalDate, s.date) > 0);
    if (cliffItem) {
      nextUnlockDate = cliffItem.date;
      nextUnlockAmount = cliffItem.unlockedTokens;
      nextUnlockValue = cliffItem.unlockedValue;
      daysUntilNextUnlock = Math.max(0, diffDays(cleanEvalDate, nextUnlockDate));
    }
  } else {
    // Post-Cliff or Linear: Find cumulative vested up to evalDate
    if (vestingFrequency === 'CONTINUOUS') {
      // Second-by-second continuous linear progression
      const elapsedVestingDays = Math.min(totalDays, Math.max(0, daysSinceStart));
      const linearRatio = totalDays > 0 ? elapsedVestingDays / totalDays : 1;
      vestedTokens = Math.min(cleanTotalTokens, initialUnlockTokens + remainingVestingTokens * linearRatio);
      nextUnlockDate = addDaysToDate(cleanEvalDate, 1);
      nextUnlockAmount = totalDays > 0 ? remainingVestingTokens / totalDays : 0;
      nextUnlockValue = nextUnlockAmount * cleanTokenPrice;
      daysUntilNextUnlock = 1;
    } else {
      // Periodic discrete schedule
      let accumulated = 0;
      let foundNext = false;

      for (let i = 0; i < schedule.length; i++) {
        const item = schedule[i];
        if (diffDays(item.date, cleanEvalDate) >= 0) {
          accumulated = item.cumulativeVestedTokens;
        } else if (!foundNext) {
          nextUnlockDate = item.date;
          nextUnlockAmount = item.unlockedTokens;
          nextUnlockValue = item.unlockedValue;
          daysUntilNextUnlock = Math.max(0, diffDays(cleanEvalDate, item.date));
          foundNext = true;
        }
      }
      vestedTokens = Math.min(cleanTotalTokens, accumulated);
    }
  }

  // Safety clamps
  vestedTokens = Math.min(cleanTotalTokens, Math.max(0, vestedTokens));
  const unvestedTokens = Math.max(0, cleanTotalTokens - vestedTokens);
  const vestedPct = cleanTotalTokens > 0 ? (vestedTokens / cleanTotalTokens) * 100 : 0;
  const unvestedPct = Math.max(0, 100 - vestedPct);

  // 6. Valuation Metrics
  const totalGrantValue = cleanTotalTokens * cleanTokenPrice;
  const vestedValue = vestedTokens * cleanTokenPrice;
  const unvestedValue = unvestedTokens * cleanTokenPrice;
  const initialGrantCostValue = cleanTotalTokens * cleanGrantPrice;
  const unrealizedGainFiat = totalGrantValue - initialGrantCostValue;
  const unrealizedGainPct = initialGrantCostValue > 0 ? (unrealizedGainFiat / initialGrantCostValue) * 100 : 0;

  // 7. Ownership Metrics
  const ownershipPct = cleanTotalSupply > 0 ? (cleanTotalTokens / cleanTotalSupply) * 100 : 0;
  const vestedOwnershipPct = cleanTotalSupply > 0 ? (vestedTokens / cleanTotalSupply) * 100 : 0;

  // 8. Annualized Unlock Rate
  const vestingYears = cleanVestingMonths > 0 ? cleanVestingMonths / 12 : 1;
  const annualizedUnlockTokens = vestingYears > 0 ? cleanTotalTokens / vestingYears : cleanTotalTokens;
  const annualizedUnlockValue = annualizedUnlockTokens * cleanTokenPrice;

  // 9. Price Sensitivity Scenarios
  const priceScenarios = [
    { label: '-75% Bear Crash', multiplier: 0.25 },
    { label: '-50% Major Drawdown', multiplier: 0.50 },
    { label: '-25% Mild Pullback', multiplier: 0.75 },
    { label: '0% Current Spot Price', multiplier: 1.00 },
    { label: '+25% Growth Surge', multiplier: 1.25 },
    { label: '+50% Strong Bull Run', multiplier: 1.50 },
    { label: '+100% 2x Rally', multiplier: 2.00 },
    { label: '+300% 4x Moonshot', multiplier: 4.00 },
  ].map((s) => {
    const simPrice = cleanTokenPrice * s.multiplier;
    const simTotalVal = cleanTotalTokens * simPrice;
    const simVestedVal = vestedTokens * simPrice;
    const simUnvestedVal = unvestedTokens * simPrice;
    return {
      label: s.label,
      multiplier: s.multiplier,
      tokenPrice: Number(simPrice.toFixed(4)),
      totalValue: Number(simTotalVal.toFixed(currMeta.decimals)),
      vestedValue: Number(simVestedVal.toFixed(currMeta.decimals)),
      unvestedValue: Number(simUnvestedVal.toFixed(currMeta.decimals)),
    };
  });

  return {
    inputs: {
      totalTokens: cleanTotalTokens,
      tokenPrice: cleanTokenPrice,
      grantPrice: cleanGrantPrice,
      startDate: cleanStartDate,
      evaluationDate: cleanEvalDate,
      vestingModel,
      cliffMonths: cleanCliffMonths,
      vestingMonths: cleanVestingMonths,
      vestingFrequency,
      initialUnlockPct: effectiveInitialUnlockPct,
      totalSupply: cleanTotalSupply,
      currency,
      tokenSymbol,
    },
    meta: {
      cliffEndDate,
      vestingEndDate,
      totalDays,
      cliffDays,
      daysSinceStart,
      daysUntilEnd: Math.max(0, daysUntilEnd),
      isBeforeStart: daysSinceStart < 0,
      isDuringCliff: daysSinceStart >= 0 && daysSinceStart < cliffDays && cleanCliffMonths > 0 && vestingModel !== 'LINEAR_NO_CLIFF',
      isFullyVested: daysUntilEnd <= 0 || vestingModel === 'IMMEDIATE',
      currencySymbol: currMeta.symbol,
      currencyCode: currMeta.code,
      currencyDecimals: currMeta.decimals,
    },
    kpis: {
      vestedTokens: Number(vestedTokens.toFixed(4)),
      unvestedTokens: Number(unvestedTokens.toFixed(4)),
      vestedPct: Number(vestedPct.toFixed(2)),
      unvestedPct: Number(unvestedPct.toFixed(2)),
      totalGrantValue: Number(totalGrantValue.toFixed(currMeta.decimals)),
      vestedValue: Number(vestedValue.toFixed(currMeta.decimals)),
      unvestedValue: Number(unvestedValue.toFixed(currMeta.decimals)),
      initialGrantCostValue: Number(initialGrantCostValue.toFixed(currMeta.decimals)),
      unrealizedGainFiat: Number(unrealizedGainFiat.toFixed(currMeta.decimals)),
      unrealizedGainPct: Number(unrealizedGainPct.toFixed(2)),
      nextUnlockDate: nextUnlockDate || vestingEndDate,
      nextUnlockAmount: Number(nextUnlockAmount.toFixed(4)),
      nextUnlockValue: Number(nextUnlockValue.toFixed(currMeta.decimals)),
      daysUntilNextUnlock: Math.max(0, daysUntilNextUnlock),
      ownershipPct: Number(ownershipPct.toFixed(4)),
      vestedOwnershipPct: Number(vestedOwnershipPct.toFixed(4)),
      annualizedUnlockTokens: Number(annualizedUnlockTokens.toFixed(2)),
      annualizedUnlockValue: Number(annualizedUnlockValue.toFixed(currMeta.decimals)),
    },
    schedule,
    priceScenarios,
  };
}

/**
 * Generates discrete vesting schedule rows.
 */
export function generateVestingSchedule({
  totalTokens,
  initialUnlockTokens,
  remainingVestingTokens,
  startDate,
  cliffEndDate,
  vestingEndDate,
  cliffMonths,
  vestingMonths,
  vestingModel,
  vestingFrequency,
  tokenPrice,
}) {
  const schedule = [];
  let cumulativeVested = 0;

  // 1. TGE / Start Date Event (Initial Unlock)
  if (initialUnlockTokens > 0 || vestingModel === 'IMMEDIATE') {
    const initTokens = vestingModel === 'IMMEDIATE' ? totalTokens : initialUnlockTokens;
    cumulativeVested = initTokens;
    schedule.push({
      periodNumber: 0,
      eventName: 'TGE / Start Date Unlock',
      date: startDate,
      unlockedTokens: Number(initTokens.toFixed(4)),
      cumulativeVestedTokens: Number(cumulativeVested.toFixed(4)),
      remainingTokens: Number(Math.max(0, totalTokens - cumulativeVested).toFixed(4)),
      vestedPct: Number(((cumulativeVested / totalTokens) * 100).toFixed(2)),
      unlockedValue: Number((initTokens * tokenPrice).toFixed(2)),
      cumulativeValue: Number((cumulativeVested * tokenPrice).toFixed(2)),
      remainingValue: Number((Math.max(0, totalTokens - cumulativeVested) * tokenPrice).toFixed(2)),
      isCliffEvent: false,
    });

    if (vestingModel === 'IMMEDIATE') {
      return schedule;
    }
  }

  if (remainingVestingTokens <= 0 || vestingMonths <= 0) {
    return schedule;
  }

  // 2. Calculate Periodic Intervals
  const freqConfig = VESTING_FREQUENCIES[vestingFrequency] || VESTING_FREQUENCIES.MONTHLY;

  if (vestingFrequency === 'WEEKLY' || vestingFrequency === 'DAILY') {
    // Day-based schedule
    const dayInterval = freqConfig.dayInterval || 7;
    const totalDays = Math.max(1, diffDays(startDate, vestingEndDate));
    const cliffDays = cliffMonths > 0 && vestingModel !== 'LINEAR_NO_CLIFF' ? diffDays(startDate, cliffEndDate) : 0;
    const totalPeriods = Math.ceil(totalDays / dayInterval);

    let periodCount = 1;
    let currentDayOffset = dayInterval;

    while (currentDayOffset <= totalDays + dayInterval - 1) {
      const isFinal = currentDayOffset >= totalDays;
      const periodDate = isFinal ? vestingEndDate : addDaysToDate(startDate, currentDayOffset);

      if (currentDayOffset < cliffDays) {
        // Suppressed during cliff
      } else if (currentDayOffset >= cliffDays && schedule.length === (initialUnlockTokens > 0 ? 1 : 0)) {
        // First post-cliff event: Accrue all cliff tokens
        const accruedRatio = totalDays > 0 ? Math.min(1, currentDayOffset / totalDays) : 1;
        const accruedTokens = remainingVestingTokens * accruedRatio;
        cumulativeVested = Math.min(totalTokens, initialUnlockTokens + accruedTokens);

        schedule.push({
          periodNumber: periodCount,
          eventName: cliffDays > 0 ? `Cliff Release (${cliffMonths}m)` : `Period ${periodCount}`,
          date: periodDate,
          unlockedTokens: Number((accruedTokens).toFixed(4)),
          cumulativeVestedTokens: Number(cumulativeVested.toFixed(4)),
          remainingTokens: Number(Math.max(0, totalTokens - cumulativeVested).toFixed(4)),
          vestedPct: Number(((cumulativeVested / totalTokens) * 100).toFixed(2)),
          unlockedValue: Number((accruedTokens * tokenPrice).toFixed(2)),
          cumulativeValue: Number((cumulativeVested * tokenPrice).toFixed(2)),
          remainingValue: Number((Math.max(0, totalTokens - cumulativeVested) * tokenPrice).toFixed(2)),
          isCliffEvent: cliffDays > 0,
        });
      } else {
        // Subsequent periodic unlocks
        const prevCumulative = cumulativeVested;
        const progressRatio = totalDays > 0 ? Math.min(1, currentDayOffset / totalDays) : 1;
        cumulativeVested = isFinal ? totalTokens : Math.min(totalTokens, initialUnlockTokens + remainingVestingTokens * progressRatio);
        const unlockedInPeriod = Math.max(0, cumulativeVested - prevCumulative);

        if (unlockedInPeriod > 0 || isFinal) {
          schedule.push({
            periodNumber: periodCount,
            eventName: isFinal ? 'Final Unlock (100% Vested)' : `Period ${periodCount}`,
            date: periodDate,
            unlockedTokens: Number(unlockedInPeriod.toFixed(4)),
            cumulativeVestedTokens: Number(cumulativeVested.toFixed(4)),
            remainingTokens: Number(Math.max(0, totalTokens - cumulativeVested).toFixed(4)),
            vestedPct: Number(((cumulativeVested / totalTokens) * 100).toFixed(2)),
            unlockedValue: Number((unlockedInPeriod * tokenPrice).toFixed(2)),
            cumulativeValue: Number((cumulativeVested * tokenPrice).toFixed(2)),
            remainingValue: Number((Math.max(0, totalTokens - cumulativeVested) * tokenPrice).toFixed(2)),
            isCliffEvent: false,
          });
        }
      }

      if (isFinal) break;
      currentDayOffset += dayInterval;
      periodCount++;
    }
  } else {
    // Month-based schedule (MONTHLY, QUARTERLY, ANNUALLY, CONTINUOUS)
    const monthInterval = freqConfig.monthInterval || 1;
    const hasCliff = cliffMonths > 0 && vestingModel !== 'LINEAR_NO_CLIFF';
    let currentMonth = monthInterval;
    let periodIndex = 1;

    while (currentMonth <= vestingMonths) {
      const isFinal = currentMonth >= vestingMonths;
      const periodDate = isFinal ? vestingEndDate : addMonthsToDate(startDate, currentMonth);

      if (hasCliff && currentMonth < cliffMonths) {
        // During cliff, no unlock
      } else if (hasCliff && currentMonth === cliffMonths) {
        // Exact cliff month: Unlock the accumulated cliff proportion
        const cliffRatio = vestingMonths > 0 ? cliffMonths / vestingMonths : 1;
        const cliffUnlocked = remainingVestingTokens * cliffRatio;
        cumulativeVested = Math.min(totalTokens, initialUnlockTokens + cliffUnlocked);

        schedule.push({
          periodNumber: periodIndex,
          eventName: `Cliff Release (${cliffMonths}m)`,
          date: cliffEndDate,
          unlockedTokens: Number(cliffUnlocked.toFixed(4)),
          cumulativeVestedTokens: Number(cumulativeVested.toFixed(4)),
          remainingTokens: Number(Math.max(0, totalTokens - cumulativeVested).toFixed(4)),
          vestedPct: Number(((cumulativeVested / totalTokens) * 100).toFixed(2)),
          unlockedValue: Number((cliffUnlocked * tokenPrice).toFixed(2)),
          cumulativeValue: Number((cumulativeVested * tokenPrice).toFixed(2)),
          remainingValue: Number((Math.max(0, totalTokens - cumulativeVested) * tokenPrice).toFixed(2)),
          isCliffEvent: true,
        });
      } else {
        // Post-cliff or linear monthly
        const prevCumulative = cumulativeVested;
        const currentProgressRatio = vestingMonths > 0 ? Math.min(1, currentMonth / vestingMonths) : 1;
        cumulativeVested = isFinal ? totalTokens : Math.min(totalTokens, initialUnlockTokens + remainingVestingTokens * currentProgressRatio);
        const unlockedInPeriod = Math.max(0, cumulativeVested - prevCumulative);

        schedule.push({
          periodNumber: periodIndex,
          eventName: isFinal ? 'Final Vesting Completion' : `Month ${currentMonth} Unlock`,
          date: periodDate,
          unlockedTokens: Number(unlockedInPeriod.toFixed(4)),
          cumulativeVestedTokens: Number(cumulativeVested.toFixed(4)),
          remainingTokens: Number(Math.max(0, totalTokens - cumulativeVested).toFixed(4)),
          vestedPct: Number(((cumulativeVested / totalTokens) * 100).toFixed(2)),
          unlockedValue: Number((unlockedInPeriod * tokenPrice).toFixed(2)),
          cumulativeValue: Number((cumulativeVested * tokenPrice).toFixed(2)),
          remainingValue: Number((Math.max(0, totalTokens - cumulativeVested) * tokenPrice).toFixed(2)),
          isCliffEvent: false,
        });
      }

      currentMonth += monthInterval;
      periodIndex++;
    }
  }

  // Ensure final element equals totalTokens exactly to eliminate any microscopic float residuals
  if (schedule.length > 0) {
    const last = schedule[schedule.length - 1];
    last.cumulativeVestedTokens = totalTokens;
    last.remainingTokens = 0;
    last.vestedPct = 100;
    last.cumulativeValue = Number((totalTokens * tokenPrice).toFixed(2));
    last.remainingValue = 0;
  }

  return schedule;
}
