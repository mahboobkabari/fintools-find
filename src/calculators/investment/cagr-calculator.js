/**
 * Institutional CAGR (Compound Annual Growth Rate) Decision Engine
 * Computes geometric annual growth rate, Fisher real return (inflation-adjusted),
 * wealth multiplier, benchmark comparison, 4-scenario hypothetical simulations,
 * illustrative performance score, and annual growth schedule.
 *
 * Sourced from src/data/investment-benchmarks/indianInvestmentBenchmarks.js
 */

import { INDIAN_INVESTMENT_BENCHMARKS } from '../../data/investment-benchmarks/indianInvestmentBenchmarks.js';
import { calculateCagrCore, inflationAdjustedValue } from '../core/investmentUtils.js';

/**
 * Primary pure calculation function for CAGR Calculator.
 *
 * @param {Object} inputs
 * @param {number} [inputs.initialValue=100000] - Initial investment purchase cost (₹)
 * @param {number} [inputs.finalValue=250000] - Current / maturity final value (₹)
 * @param {number} [inputs.tenureYears=5] - Holding duration in years
 * @param {number} [inputs.inflationRate=6] - Expected annual inflation rate (%)
 * @param {string} [inputs.selectedBenchmarkId='nifty50'] - Benchmark ID for comparison
 * @returns {Object} Structured numerical results and decision intelligence object
 */
export function calculateCagr(inputs = {}) {
  const {
    initialValue = 100000,
    finalValue = 250000,
    tenureYears = 5,
    inflationRate = 6,
    selectedBenchmarkId = 'nifty50',
  } = inputs;

  const rawInitial = Math.max(0, Number(initialValue) || 0);
  const rawFinal = Math.max(0, Number(finalValue) || 0);
  const rawYears = Math.max(0.0833, Number(tenureYears) || 1); // Minimum 1 month (0.0833 yrs)
  const numInflation = Math.max(0, Number(inflationRate) || 0);

  // 1. CORE CAGR CALCULATION
  const coreRes = calculateCagrCore({
    initialValue: rawInitial,
    finalValue: rawFinal,
    tenureYears: rawYears,
  });

  const cagrPct = coreRes.cagrPct;
  const absoluteGain = coreRes.absoluteGain;
  const absoluteGrowthPct = coreRes.absoluteGrowthPct;
  const wealthMultiplier = coreRes.wealthMultiplier;
  const isLossScenario = rawFinal < rawInitial;

  // 2. REAL CAGR & INFLATION ADJUSTMENT (Fisher Equation)
  // Real Rate = ((1 + Nominal Rate) / (1 + Inflation Rate) - 1) * 100
  const nomRate = cagrPct / 100;
  const infRate = numInflation / 100;
  let realCagrPct = 0;
  if (1 + infRate > 0) {
    realCagrPct = ((1 + nomRate) / (1 + infRate) - 1) * 100;
  }
  realCagrPct = Number(realCagrPct.toFixed(2));

  const infRes = inflationAdjustedValue(rawFinal, numInflation, rawYears);
  const inflationAdjustedFinalValue = infRes.realValue;
  const purchasingPowerLoss = infRes.purchasingPowerLoss;

  // 3. BENCHMARK COMPARISON
  const benchmarkObj = INDIAN_INVESTMENT_BENCHMARKS[selectedBenchmarkId] || INDIAN_INVESTMENT_BENCHMARKS.nifty50;
  const benchmarkRate = benchmarkObj.annualRate;
  const diffFromBenchmarkPct = Number((cagrPct - benchmarkRate).toFixed(2));

  let benchmarkStatus = 'Similar';
  let benchmarkStatusColor = 'text-body-muted border-hairline bg-surface';
  if (diffFromBenchmarkPct > 0.5) {
    benchmarkStatus = 'Outperformed';
    benchmarkStatusColor = 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
  } else if (diffFromBenchmarkPct < -0.5) {
    benchmarkStatus = 'Underperformed';
    benchmarkStatusColor = 'text-semantic-danger border-semantic-danger/30 bg-semantic-danger/10';
  }

  // 4. ILLUSTRATIVE PERFORMANCE SCORE & DECISION VERDICT
  let score = 50;
  if (isLossScenario) {
    score = 25;
  } else {
    if (cagrPct > numInflation) score += 20;
    if (cagrPct >= benchmarkRate) score += 20;
    if (wealthMultiplier >= 2.0) score += 10;
  }
  score = Math.min(100, Math.max(0, Math.round(score)));

  let healthStatus = 'Good Performance';
  let healthColor = 'text-semantic-success border-semantic-success/30 bg-semantic-success/10';
  if (isLossScenario) {
    healthStatus = 'Capital Loss Scenario';
    healthColor = 'text-semantic-danger border-semantic-danger/30 bg-semantic-danger/10';
  } else if (score >= 80) {
    healthStatus = 'Exceptional Performance';
    healthColor = 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
  } else if (score < 65 && score >= 50) {
    healthStatus = 'Moderate Performance';
    healthColor = 'text-semantic-warning border-semantic-warning/30 bg-semantic-warning/10';
  } else if (score < 50) {
    healthStatus = 'Below Inflation / Benchmark';
    healthColor = 'text-semantic-danger border-semantic-danger/30 bg-semantic-danger/10';
  }

  // Hero Verdict Descriptions
  let heroText = '';
  let healthDesc = '';

  if (isLossScenario) {
    heroText = `Your investment decreased by ₹${Math.abs(absoluteGain).toLocaleString('en-IN')} (${cagrPct}% CAGR loss over ${rawYears} years).`;
    healthDesc = `Your final value of ₹${rawFinal.toLocaleString('en-IN')} is lower than your initial capital of ₹${rawInitial.toLocaleString('en-IN')}.`;
  } else {
    heroText = `Your investment grew at ${cagrPct}% CAGR, expanding ₹${rawInitial.toLocaleString('en-IN')} to ₹${rawFinal.toLocaleString('en-IN')}.`;
    healthDesc = `Over a ${rawYears}-year holding period, your capital created ₹${absoluteGain.toLocaleString('en-IN')} in wealth (${wealthMultiplier}x wealth multiplier). After ${numInflation}% estimated inflation, your real CAGR is ${realCagrPct}%.`;
  }

  // 5. HYPOTHETICAL 4-SCENARIO GROWTH MODELS
  // Scenario 1: Current Base
  const sc1 = {
    id: 'current',
    name: 'Current Investment',
    badge: 'Base Scenario',
    cagrPct: cagrPct,
    tenureYears: rawYears,
    finalValue: rawFinal,
    wealthCreated: absoluteGain,
    diffFromBase: 0,
    isHypothetical: false,
  };

  // Scenario 2: +2 Years Holding
  const yearsSc2 = rawYears + 2;
  const valSc2 = Math.round(rawInitial * Math.pow(1 + nomRate, yearsSc2));
  const wealthSc2 = valSc2 - rawInitial;
  const sc2 = {
    id: 'plus2years',
    name: '+2 Years Holding Period',
    badge: 'Extended Duration',
    cagrPct: cagrPct,
    tenureYears: yearsSc2,
    finalValue: valSc2,
    wealthCreated: wealthSc2,
    diffFromBase: valSc2 - rawFinal,
    isHypothetical: true,
  };

  // Scenario 3: +2% CAGR Performance Hike
  const cagrSc3 = Number((cagrPct + 2).toFixed(2));
  const rateSc3 = cagrSc3 / 100;
  const valSc3 = Math.round(rawInitial * Math.pow(1 + rateSc3, rawYears));
  const wealthSc3 = valSc3 - rawInitial;
  const sc3 = {
    id: 'plus2percent',
    name: '+2% Annual CAGR Improvement',
    badge: 'Performance Hike',
    cagrPct: cagrSc3,
    tenureYears: rawYears,
    finalValue: valSc3,
    wealthCreated: wealthSc3,
    diffFromBase: valSc3 - rawFinal,
    isHypothetical: true,
  };

  // Scenario 4: Selected Benchmark Return
  const rateSc4 = benchmarkRate / 100;
  const valSc4 = Math.round(rawInitial * Math.pow(1 + rateSc4, rawYears));
  const wealthSc4 = valSc4 - rawInitial;
  const sc4 = {
    id: 'benchmark',
    name: `${benchmarkObj.name} Benchmark`,
    badge: 'Illustrative Benchmark',
    cagrPct: benchmarkRate,
    tenureYears: rawYears,
    finalValue: valSc4,
    wealthCreated: wealthSc4,
    diffFromBase: valSc4 - rawFinal,
    isHypothetical: true,
  };

  const scenarios = [sc1, sc2, sc3, sc4];

  // 6. DYNAMIC INSIGHTS ARRAY
  const dynamicInsights = [
    {
      title: 'Annualized Compound Growth Rate',
      value: `${cagrPct}% CAGR`,
      description: `Your capital grew at an annualized rate of ${cagrPct}% per year over ${rawYears} years.`,
      icon: '📈',
    },
    {
      title: 'Inflation-Adjusted Real Return',
      value: `${realCagrPct}% Real CAGR`,
      description: `After accounting for ${numInflation}% annual inflation, your real purchasing power growth rate is ${realCagrPct}%.`,
      icon: '🛡️',
    },
    {
      title: 'Benchmark Comparison',
      value: `${diffFromBenchmarkPct > 0 ? '+' : ''}${diffFromBenchmarkPct}% vs ${benchmarkObj.name}`,
      description: `Your CAGR ${diffFromBenchmarkPct >= 0 ? 'exceeded' : 'trailed'} the illustrative ${benchmarkObj.name} benchmark (${benchmarkRate}% p.a.) by ${Math.abs(diffFromBenchmarkPct)} percentage points.`,
      icon: '⚖️',
    },
    {
      title: 'Wealth Multiplier Factor',
      value: `${wealthMultiplier}x Multiplier`,
      description: `Your initial investment of ₹${rawInitial.toLocaleString('en-IN')} multiplied by ${wealthMultiplier}x to reach ₹${rawFinal.toLocaleString('en-IN')}.`,
      icon: '💎',
    },
  ];

  // 7. YEAR-BY-YEAR GROWTH SCHEDULE
  const yearlyBreakdown = [];
  const yearsInt = Math.ceil(rawYears);
  for (let y = 1; y <= yearsInt; y++) {
    const fracYear = Math.min(y, rawYears);
    const val = Math.round(rawInitial * Math.pow(1 + nomRate, fracYear));
    yearlyBreakdown.push({
      year: y,
      invested: rawInitial,
      returns: Math.max(0, val - rawInitial),
      totalValue: val,
    });
  }

  return {
    initialValue: rawInitial,
    finalValue: rawFinal,
    tenureYears: rawYears,
    inflationRate: numInflation,
    primaryOutput: cagrPct,
    absoluteGain,
    absoluteGrowthPct,
    cagrPct,
    wealthMultiplier,
    realCagrPct,
    inflationAdjustedFinalValue,
    purchasingPowerLoss,
    selectedBenchmark: benchmarkObj,
    benchmarkRate,
    diffFromBenchmarkPct,
    benchmarkStatus,
    benchmarkStatusColor,
    score,
    healthStatus,
    healthColor,
    heroText,
    healthDesc,
    scenarios,
    dynamicInsights,
    yearlyBreakdown,
  };
}