import { CAPITAL_GAINS_TAX_RATES_FY2025_26 } from '../../data/tax-rates/capitalGainsTaxRates.js';

/**
 * Institutional SWP (Systematic Withdrawal Plan) & Portfolio Longevity Math Engine
 * Sourced under Finance Act 2024 / FY 2025-26 Indian Capital Gains Tax Framework.
 *
 * @param {Object} inputs
 * @param {number} [inputs.totalInvestment=5000000] - Initial lump-sum capital corpus (₹)
 * @param {number} [inputs.monthlyWithdrawal=30000] - Initial monthly cash withdrawal payout (₹)
 * @param {number} [inputs.expectedReturnRate=8] - Annual return rate expectation (% p.a.)
 * @param {number} [inputs.tenureYears=10] - Withdrawal duration horizon (Years)
 * @param {number} [inputs.inflationRate=6] - Annual inflation expectation (% p.a.)
 * @param {boolean} [inputs.isInflationAdjusted=false] - Whether withdrawals increase annually with inflation
 * @param {string} [inputs.calculationMode='forward'] - Mode: 'forward' (Longevity) or 'reverse' (Target Duration Payout)
 * @param {number} [inputs.targetDurationYears=25] - Target duration in years for reverse SWP mode
 * @param {string} [inputs.assetType='equity'] - Mutual fund asset class ('equity' | 'debt_mf')
 * @param {number} [inputs.marginalTaxRatePct=30] - Taxpayer marginal slab rate (%) for debt MFs
 * @returns {Object} Complete structured SWP analytical results & scenario models
 */
export function calculateSwp(inputs = {}) {
  const {
    totalInvestment = 5000000,
    monthlyWithdrawal = 30000,
    expectedReturnRate = 8,
    tenureYears = 10,
    inflationRate = 6,
    isInflationAdjusted = false,
    calculationMode = 'forward',
    targetDurationYears = 25,
    assetType = 'equity',
    marginalTaxRatePct = 30,
  } = inputs;

  const initialCorpus = Math.max(0, Number(totalInvestment) || 0);
  const baseMonthlyWithdrawal = Math.max(0, Number(monthlyWithdrawal) || 0);
  const annualReturn = Math.max(-50, Math.min(100, Number(expectedReturnRate) || 0));
  const horizonYears = Math.max(1, Math.min(50, Number(tenureYears) || 1));
  const inflation = Math.max(0, Math.min(30, Number(inflationRate) || 0));
  const targetYears = Math.max(1, Math.min(50, Number(targetDurationYears) || 1));
  const marginalTax = Math.max(0, Math.min(30, Number(marginalTaxRatePct) || 30));

  // Handle Edge Cases: Zero Corpus or Zero Withdrawal
  if (initialCorpus === 0) {
    return createEmptySwpResult(initialCorpus, baseMonthlyWithdrawal, horizonYears);
  }

  // 1. REVERSE SWP MODE CALCULATION (Target Duration -> Sustainable Monthly Payout)
  let reverseResult = null;
  if (calculationMode === 'reverse') {
    reverseResult = calculateReverseSwpInternal({
      corpus: initialCorpus,
      annualReturn,
      inflation,
      isInflationAdjusted,
      targetYears,
    });
  }

  // Active Withdrawal amount used for forward simulation
  const effectiveMonthlyWithdrawal =
    calculationMode === 'reverse' && reverseResult
      ? reverseResult.initialMonthlyWithdrawal
      : baseMonthlyWithdrawal;

  // 2. FORWARD SWP PORTFOLIO LONGEVITY SIMULATION
  const simulationResult = runSwpSimulation({
    corpus: initialCorpus,
    monthlyWithdrawal: effectiveMonthlyWithdrawal,
    annualReturn,
    tenureYears: horizonYears,
    inflation,
    isInflationAdjusted,
  });

  // 3. WITHDRAWAL RATE ANALYSIS & BENCHMARKS (3%, 4%, 5%, 6%)
  const initialAnnualWithdrawal = effectiveMonthlyWithdrawal * 12;
  const initialWithdrawalRatePct =
    initialCorpus > 0 ? Number(((initialAnnualWithdrawal / initialCorpus) * 100).toFixed(2)) : 0;

  const withdrawalRateBenchmarks = [3, 4, 5, 6].map((ratePct) => {
    const annualAmt = Math.round(initialCorpus * (ratePct / 100));
    const monthlyAmt = Math.round(annualAmt / 12);
    const benchSim = runSwpSimulation({
      corpus: initialCorpus,
      monthlyWithdrawal: monthlyAmt,
      annualReturn,
      tenureYears: Math.max(30, horizonYears),
      inflation,
      isInflationAdjusted,
    });
    return {
      ratePct,
      monthlyWithdrawal: monthlyAmt,
      annualWithdrawal: annualAmt,
      longevityMonths: benchSim.longevityMonths,
      longevityYears: benchSim.longevityYears,
      depletionStatus: benchSim.depletionStatus,
      endingCorpus: benchSim.endingCorpus,
    };
  });

  // 4. MULTI-SCENARIO SUSTAINABILITY COMPARISON
  // Conservative (-2%), Base (Expected), Optimistic (+2%), Sequence-Risk Stress
  const conservativeReturn = Math.max(0, annualReturn - 2);
  const optimisticReturn = annualReturn + 2;

  const conservativeSim = runSwpSimulation({
    corpus: initialCorpus,
    monthlyWithdrawal: effectiveMonthlyWithdrawal,
    annualReturn: conservativeReturn,
    tenureYears: horizonYears,
    inflation,
    isInflationAdjusted,
  });

  const optimisticSim = runSwpSimulation({
    corpus: initialCorpus,
    monthlyWithdrawal: effectiveMonthlyWithdrawal,
    annualReturn: optimisticReturn,
    tenureYears: horizonYears,
    inflation,
    isInflationAdjusted,
  });

  // Sequence-Risk Stress Scenario: Low returns (3% Y1-2, 5% Y3, then expected return)
  const sequenceRiskSim = runSequenceRiskSimulation({
    corpus: initialCorpus,
    monthlyWithdrawal: effectiveMonthlyWithdrawal,
    baseAnnualReturn: annualReturn,
    tenureYears: horizonYears,
    inflation,
    isInflationAdjusted,
  });

  const scenarios = [
    {
      id: 'conservative',
      name: 'Conservative Scenario',
      badge: `${conservativeReturn}% Return`,
      annualReturn: conservativeReturn,
      longevityYears: conservativeSim.longevityYears,
      longevityMonths: conservativeSim.longevityMonths,
      endingCorpus: conservativeSim.endingCorpus,
      totalWithdrawn: conservativeSim.totalWithdrawn,
      depletionStatus: conservativeSim.depletionStatus,
      isDepleted: conservativeSim.isDepleted,
    },
    {
      id: 'base',
      name: 'Base Scenario (User Input)',
      badge: `${annualReturn}% Return`,
      annualReturn,
      longevityYears: simulationResult.longevityYears,
      longevityMonths: simulationResult.longevityMonths,
      endingCorpus: simulationResult.endingCorpus,
      totalWithdrawn: simulationResult.totalWithdrawn,
      depletionStatus: simulationResult.depletionStatus,
      isDepleted: simulationResult.isDepleted,
    },
    {
      id: 'optimistic',
      name: 'Optimistic Scenario',
      badge: `${optimisticReturn}% Return`,
      annualReturn: optimisticReturn,
      longevityYears: optimisticSim.longevityYears,
      longevityMonths: optimisticSim.longevityMonths,
      endingCorpus: optimisticSim.endingCorpus,
      totalWithdrawn: optimisticSim.totalWithdrawn,
      depletionStatus: optimisticSim.depletionStatus,
      isDepleted: optimisticSim.isDepleted,
    },
    {
      id: 'sequence_risk',
      name: 'Sequence-Risk Stress Scenario',
      badge: 'Early Downturn (3%-5%)',
      annualReturn: '3% (Y1-2) -> 5% (Y3) -> Base',
      longevityYears: sequenceRiskSim.longevityYears,
      longevityMonths: sequenceRiskSim.longevityMonths,
      endingCorpus: sequenceRiskSim.endingCorpus,
      totalWithdrawn: sequenceRiskSim.totalWithdrawn,
      depletionStatus: sequenceRiskSim.depletionStatus,
      isDepleted: sequenceRiskSim.isDepleted,
    },
  ];

  // 5. INFLATION VISUALIZATION (Year 1, 5, 10, 20, 30 Payout Schedule)
  const inflationMilestones = [1, 5, 10, 20, 30]
    .filter((y) => y <= horizonYears || y <= 30)
    .map((y) => {
      const monthlyPayout = isInflationAdjusted
        ? Math.round(effectiveMonthlyWithdrawal * Math.pow(1 + inflation / 100, y - 1))
        : effectiveMonthlyWithdrawal;
      const annualPayout = monthlyPayout * 12;
      return {
        year: y,
        monthlyPayout,
        annualPayout,
        purchasingPowerFactor: Number(Math.pow(1 + inflation / 100, y - 1).toFixed(2)),
      };
    });

  // 6. TAX-AWARE ESTIMATION (Finance Act 2024 Rules)
  const taxEstimation = estimateSwpTaxation({
    initialCorpus,
    yearlyBreakdown: simulationResult.yearlyBreakdown,
    monthlyWithdrawal: effectiveMonthlyWithdrawal,
    assetType,
    marginalTaxRatePct: marginalTax,
  });

  // 7. FINANCIAL HEALTH SCORE & DECISION INSIGHTS
  const scoreMetrics = computeSwpHealthScore({
    initialCorpus,
    initialWithdrawalRatePct,
    simulationResult,
    isInflationAdjusted,
    inflation,
    annualReturn,
  });

  // Hero Summary Text
  let heroText = '';
  if (simulationResult.isDepleted) {
    heroText = `At your current withdrawal rate, your ₹${initialCorpus.toLocaleString(
      'en-IN'
    )} corpus is projected to last approximately ${simulationResult.longevityYears} years (${simulationResult.longevityMonths} months) before depletion.`;
  } else {
    heroText = `Your ₹${initialCorpus.toLocaleString(
      'en-IN'
    )} corpus is projected to sustain full ${horizonYears} years, leaving an estimated ending balance of ₹${simulationResult.endingCorpus.toLocaleString(
      'en-IN'
    )}.`;
  }

  return {
    totalInvestment: initialCorpus,
    monthlyWithdrawal: effectiveMonthlyWithdrawal,
    expectedReturnRate: annualReturn,
    tenureYears: horizonYears,
    inflationRate: inflation,
    isInflationAdjusted,
    calculationMode,
    targetDurationYears: targetYears,
    assetType,
    marginalTaxRatePct: marginalTax,

    // Primary Outputs
    primaryOutput: simulationResult.totalWithdrawn,
    finalBalance: simulationResult.endingCorpus,
    totalWithdrawn: simulationResult.totalWithdrawn,
    totalGrowth: simulationResult.totalGrowth,
    longevityMonths: simulationResult.longevityMonths,
    longevityYears: simulationResult.longevityYears,
    exactDepletionMonth: simulationResult.exactDepletionMonth,
    exactDepletionYear: simulationResult.exactDepletionYear,
    depletionStatus: simulationResult.depletionStatus,
    isDepleted: simulationResult.isDepleted,
    yearlyBreakdown: simulationResult.yearlyBreakdown,

    // Withdrawal Rate
    initialAnnualWithdrawal,
    initialWithdrawalRatePct,
    withdrawalRateBenchmarks,

    // Scenarios & Presets
    scenarios,
    reverseResult,
    inflationMilestones,

    // Tax Estimation
    taxEstimation,

    // Health Score & Insights
    score: scoreMetrics.score,
    healthStatus: scoreMetrics.healthStatus,
    healthColor: scoreMetrics.healthColor,
    heroText,
    insights: scoreMetrics.insights,
  };
}

/**
 * Pure Forward Month-by-Month SWP Simulation Engine
 * Convention: Opening balance compounds at monthlyRate = annualReturn/12/100,
 * payout deducted at month-end, final payout capped to exact available balance.
 */
function runSwpSimulation({
  corpus,
  monthlyWithdrawal,
  annualReturn,
  tenureYears,
  inflation,
  isInflationAdjusted,
}) {
  const initialCorpus = corpus;
  const monthlyRate = annualReturn / 12 / 100;
  const maxMonths = tenureYears * 12;

  let currentBalance = initialCorpus;
  let totalWithdrawn = 0;
  let totalGrowth = 0;
  let depletedAtMonth = null;
  const yearlyBreakdown = [];

  let cumInvestedYear = initialCorpus;
  let yearWithdrawn = 0;
  let yearGrowth = 0;

  for (let m = 1; m <= maxMonths; m++) {
    if (currentBalance <= 0) {
      if (depletedAtMonth === null) depletedAtMonth = m - 1;
      currentBalance = 0;
      if (m % 12 === 0) {
        yearlyBreakdown.push({
          year: m / 12,
          invested: initialCorpus,
          monthlyWithdrawal: 0,
          totalWithdrawn: Math.round(totalWithdrawn),
          totalGrowth: Math.round(totalGrowth),
          totalValue: 0,
          isDepleted: true,
        });
      }
      continue;
    }

    // Determine target withdrawal for month m
    const yearIndex = Math.floor((m - 1) / 12);
    const targetMonthlyWithdrawal = isInflationAdjusted
      ? monthlyWithdrawal * Math.pow(1 + inflation / 100, yearIndex)
      : monthlyWithdrawal;

    // Growth applied first on opening balance
    const monthlyGrowth = currentBalance * monthlyRate;
    totalGrowth += monthlyGrowth;
    yearGrowth += monthlyGrowth;

    const preWithdrawalBalance = currentBalance + monthlyGrowth;
    let actualWithdrawal = 0;

    if (preWithdrawalBalance <= targetMonthlyWithdrawal) {
      // Depletion month: cap payout to exact available funds
      actualWithdrawal = preWithdrawalBalance;
      currentBalance = 0;
      if (depletedAtMonth === null) depletedAtMonth = m;
    } else {
      actualWithdrawal = targetMonthlyWithdrawal;
      currentBalance = preWithdrawalBalance - targetMonthlyWithdrawal;
    }

    totalWithdrawn += actualWithdrawal;
    yearWithdrawn += actualWithdrawal;

    if (m % 12 === 0) {
      yearlyBreakdown.push({
        year: m / 12,
        invested: initialCorpus,
        monthlyWithdrawal: Math.round(targetMonthlyWithdrawal),
        totalWithdrawn: Math.round(totalWithdrawn),
        totalGrowth: Math.round(totalGrowth),
        totalValue: Math.round(currentBalance),
        isDepleted: currentBalance <= 0,
      });
    }
  }

  const isDepleted = depletedAtMonth !== null;
  const longevityMonths = isDepleted ? depletedAtMonth : maxMonths;
  const longevityYears = Number((longevityMonths / 12).toFixed(1));
  const exactDepletionYear = isDepleted ? Math.ceil(longevityMonths / 12) : null;

  let depletionStatus = 'active';
  if (monthlyWithdrawal === 0) {
    depletionStatus = 'zero_withdrawal';
  } else if (isDepleted) {
    depletionStatus = 'depleted';
  } else {
    depletionStatus = 'target_reached';
  }

  return {
    endingCorpus: Math.round(currentBalance),
    totalWithdrawn: Math.round(totalWithdrawn),
    totalGrowth: Math.round(totalGrowth),
    longevityMonths,
    longevityYears,
    exactDepletionMonth: depletedAtMonth,
    exactDepletionYear,
    depletionStatus,
    isDepleted,
    yearlyBreakdown,
  };
}

/**
 * Sequence-of-Returns Risk Stress Simulation
 * Applies 3% in Years 1-2, 5% in Year 3, and base return rate from Year 4 onwards.
 */
function runSequenceRiskSimulation({
  corpus,
  monthlyWithdrawal,
  baseAnnualReturn,
  tenureYears,
  inflation,
  isInflationAdjusted,
}) {
  const initialCorpus = corpus;
  const maxMonths = tenureYears * 12;

  let currentBalance = initialCorpus;
  let totalWithdrawn = 0;
  let totalGrowth = 0;
  let depletedAtMonth = null;

  for (let m = 1; m <= maxMonths; m++) {
    if (currentBalance <= 0) {
      if (depletedAtMonth === null) depletedAtMonth = m - 1;
      currentBalance = 0;
      continue;
    }

    const yearIndex = Math.floor((m - 1) / 12);
    let applicableAnnualReturn = baseAnnualReturn;
    if (yearIndex < 2) {
      applicableAnnualReturn = 3.0; // Year 1 & 2 slump
    } else if (yearIndex === 2) {
      applicableAnnualReturn = 5.0; // Year 3 recovery start
    }

    const monthlyRate = applicableAnnualReturn / 12 / 100;
    const targetMonthlyWithdrawal = isInflationAdjusted
      ? monthlyWithdrawal * Math.pow(1 + inflation / 100, yearIndex)
      : monthlyWithdrawal;

    const monthlyGrowth = currentBalance * monthlyRate;
    totalGrowth += monthlyGrowth;

    const preWithdrawalBalance = currentBalance + monthlyGrowth;
    let actualWithdrawal = 0;

    if (preWithdrawalBalance <= targetMonthlyWithdrawal) {
      actualWithdrawal = preWithdrawalBalance;
      currentBalance = 0;
      if (depletedAtMonth === null) depletedAtMonth = m;
    } else {
      actualWithdrawal = targetMonthlyWithdrawal;
      currentBalance = preWithdrawalBalance - targetMonthlyWithdrawal;
    }

    totalWithdrawn += actualWithdrawal;
  }

  const isDepleted = depletedAtMonth !== null;
  const longevityMonths = isDepleted ? depletedAtMonth : maxMonths;
  const longevityYears = Number((longevityMonths / 12).toFixed(1));

  return {
    endingCorpus: Math.round(currentBalance),
    totalWithdrawn: Math.round(totalWithdrawn),
    totalGrowth: Math.round(totalGrowth),
    longevityMonths,
    longevityYears,
    depletionStatus: isDepleted ? 'depleted' : 'target_reached',
    isDepleted,
  };
}

/**
 * Reverse SWP Solver: Solves for initial monthly withdrawal given target duration N years.
 */
function calculateReverseSwpInternal({ corpus, annualReturn, inflation, isInflationAdjusted, targetYears }) {
  const nMonths = targetYears * 12;
  const r = annualReturn / 12 / 100;

  let initialMonthlyWithdrawal = 0;

  if (!isInflationAdjusted || inflation === 0) {
    if (r === 0) {
      initialMonthlyWithdrawal = Math.round(corpus / nMonths);
    } else {
      // Analytical annuity withdrawal formula: W = P * [r * (1+r)^n] / [(1+r)^n - 1]
      const factor = Math.pow(1 + r, nMonths);
      initialMonthlyWithdrawal = Math.round((corpus * (r * factor)) / (factor - 1));
    }
  } else {
    // Binary search for initial monthly withdrawal under annual inflation step-up
    let low = 1;
    let high = corpus;
    let bestW = Math.round(corpus / nMonths);

    for (let iter = 0; iter < 40; iter++) {
      const mid = (low + high) / 2;
      const sim = runSwpSimulation({
        corpus,
        monthlyWithdrawal: mid,
        annualReturn,
        tenureYears: targetYears,
        inflation,
        isInflationAdjusted: true,
      });

      if (sim.isDepleted && sim.longevityMonths < nMonths) {
        high = mid;
      } else {
        bestW = mid;
        low = mid;
      }
    }
    initialMonthlyWithdrawal = Math.round(bestW);
  }

  const annualWithdrawal = initialMonthlyWithdrawal * 12;
  const withdrawalRatePct = corpus > 0 ? Number(((annualWithdrawal / corpus) * 100).toFixed(2)) : 0;

  const simResult = runSwpSimulation({
    corpus,
    monthlyWithdrawal: initialMonthlyWithdrawal,
    annualReturn,
    tenureYears: targetYears,
    inflation,
    isInflationAdjusted,
  });

  return {
    initialMonthlyWithdrawal,
    annualWithdrawal,
    withdrawalRatePct,
    projectedEndingCorpus: simResult.endingCorpus,
    targetYears,
  };
}

/**
 * Estimate SWP Taxation under Finance Act 2024 / FY 2025-26 Indian Capital Gains Rules.
 * Clearly labeled as an estimate based on portfolio gain proportion.
 */
function estimateSwpTaxation({ initialCorpus, yearlyBreakdown, monthlyWithdrawal, assetType, marginalTaxRatePct }) {
  const firstYearData = yearlyBreakdown[0] || { totalValue: initialCorpus, totalGrowth: 0 };
  const endYear1Corpus = firstYearData.totalValue;
  const annualWithdrawal = monthlyWithdrawal * 12;

  // Gain proportion estimate = (Current Portfolio Value - Initial Corpus) / Current Portfolio Value
  const totalGainEst = Math.max(0, firstYearData.totalGrowth);
  const gainProportion = endYear1Corpus > 0 ? Math.min(1, Math.max(0, totalGainEst / (endYear1Corpus + annualWithdrawal))) : 0;

  const estAnnualGainComponent = Math.round(annualWithdrawal * gainProportion);
  const estAnnualPrincipalComponent = Math.round(annualWithdrawal - estAnnualGainComponent);

  let estAnnualTax = 0;
  let taxSection = '';
  let taxRateDesc = '';

  if (assetType === 'debt_mf') {
    // Section 50AA: Specified Debt MFs taxed at marginal slab rate
    taxSection = CAPITAL_GAINS_TAX_RATES_FY2025_26.assetClasses.debt_mf.stcgSection;
    taxRateDesc = `${marginalTaxRatePct}% Slab Rate + 4% Cess`;
    const baseTax = estAnnualGainComponent * (marginalTaxRatePct / 100);
    estAnnualTax = Math.round(baseTax * 1.04);
  } else {
    // Equity Mutual Funds (>65% equity) - Section 112A LTCG (12.5% after ₹1.25L exemption)
    taxSection = CAPITAL_GAINS_TAX_RATES_FY2025_26.assetClasses.equity.ltcgSection;
    taxRateDesc = `12.5% LTCG + 4% Cess (Exemption ₹1.25L/yr)`;
    const sec112aExemption = CAPITAL_GAINS_TAX_RATES_FY2025_26.sec112aExemptionLimit;
    const taxableGain = Math.max(0, estAnnualGainComponent - sec112aExemption);
    const baseTax = taxableGain * 0.125;
    estAnnualTax = Math.round(baseTax * 1.04);
  }

  const netAnnualPayout = Math.round(annualWithdrawal - estAnnualTax);
  const netMonthlyPayout = Math.round(netAnnualPayout / 12);

  return {
    assetType,
    taxSection,
    taxRateDesc,
    grossAnnualWithdrawal: annualWithdrawal,
    estAnnualGainComponent,
    estAnnualPrincipalComponent,
    estAnnualTax,
    netAnnualPayout,
    netMonthlyPayout,
    gainProportionPct: Number((gainProportion * 100).toFixed(1)),
    isExempt: estAnnualTax === 0,
  };
}

/**
 * Health Score & Neutral Insights Generator
 */
function computeSwpHealthScore({
  initialCorpus,
  initialWithdrawalRatePct,
  simulationResult,
  isInflationAdjusted,
  inflation,
  annualReturn,
}) {
  let score = 50;

  if (!simulationResult.isDepleted) score += 30;
  if (initialWithdrawalRatePct <= 4.0) score += 20;
  else if (initialWithdrawalRatePct <= 5.0) score += 10;

  if (annualReturn >= 8.0) score += 10;
  if (isInflationAdjusted) score += 10;

  score = Math.min(100, Math.max(0, Math.round(score)));

  let healthStatus = 'Moderate Sustainability';
  let healthColor = 'text-semantic-warning border-semantic-warning/30 bg-semantic-warning/10';

  if (score >= 80) {
    healthStatus = 'High Sustainability';
    healthColor = 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
  } else if (score < 50) {
    healthStatus = 'High Exhaustion Risk';
    healthColor = 'text-semantic-danger border-semantic-danger/30 bg-semantic-danger/10';
  }

  const insights = [];
  if (initialWithdrawalRatePct > 5.0) {
    insights.push({
      type: 'warning',
      title: 'High Initial Withdrawal Rate',
      message: `Your initial withdrawal rate is ${initialWithdrawalRatePct}% p.a. Withdrawal rates above 5% significantly increase capital exhaustion risk during market downturns.`,
    });
  } else {
    insights.push({
      type: 'positive',
      title: 'Sustainable Withdrawal Rate',
      message: `Your initial withdrawal rate of ${initialWithdrawalRatePct}% p.a. aligns with standard long-term retirement income benchmarks.`,
    });
  }

  if (isInflationAdjusted) {
    insights.push({
      type: 'info',
      title: 'Inflation Adjustment Active',
      message: `Withdrawing with ${inflation}% annual inflation protection preserves purchasing power over time but accelerates portfolio consumption.`,
    });
  } else {
    insights.push({
      type: 'warning',
      title: 'Fixed Nominal Payout Risk',
      message: `A fixed monthly payout loses purchasing power over time due to inflation. Consider enabling inflation-adjusted withdrawals for realistic planning.`,
    });
  }

  return { score, healthStatus, healthColor, insights };
}

/**
 * Create Empty Result for Zero Corpus Input Edge Case
 */
function createEmptySwpResult(initialCorpus, monthlyWithdrawal, tenureYears) {
  return {
    totalInvestment: 0,
    monthlyWithdrawal,
    expectedReturnRate: 0,
    tenureYears,
    inflationRate: 0,
    isInflationAdjusted: false,
    calculationMode: 'forward',
    primaryOutput: 0,
    finalBalance: 0,
    totalWithdrawn: 0,
    totalGrowth: 0,
    longevityMonths: 0,
    longevityYears: 0,
    exactDepletionMonth: 0,
    exactDepletionYear: 0,
    depletionStatus: 'zero_corpus',
    isDepleted: true,
    yearlyBreakdown: [],
    initialAnnualWithdrawal: 0,
    initialWithdrawalRatePct: 0,
    withdrawalRateBenchmarks: [],
    scenarios: [],
    reverseResult: null,
    inflationMilestones: [],
    taxEstimation: {
      grossAnnualWithdrawal: 0,
      estAnnualGainComponent: 0,
      estAnnualPrincipalComponent: 0,
      estAnnualTax: 0,
      netAnnualPayout: 0,
      netMonthlyPayout: 0,
    },
    score: 0,
    healthStatus: 'Zero Capital Corpus',
    healthColor: 'text-semantic-danger border-semantic-danger/30 bg-semantic-danger/10',
    heroText: 'Starting capital corpus is ₹0. Please enter a valid initial investment amount.',
    insights: [],
  };
}