/**
 * Institutional Flagship Mutual Fund Returns Calculator Engine
 * Supports both Systematic Investment Plan (SIP) and Lumpsum investment modes.
 *
 * Distinguishes:
 *  - CAGR (%) for Lumpsum mode (single initial investment)
 *  - XIRR (%) for SIP mode (regular monthly cash flows using Newton-Raphson solver)
 *  - Absolute Return (%)
 *  - Wealth Multiplier
 *  - Exit Load deduction (when user provides explicit exit-load percentage)
 *  - Real inflation-adjusted purchasing power
 *  - Benchmark comparisons (Nifty 50, FD, Gold, Inflation)
 *
 * Reuses:
 *  - calculateSip & calculateLumpsum from ../core/investmentEngine.js
 *  - calculateXirr & generateSipCashFlows from ../core/xirrEngine.js
 *  - calculateCagrCore, inflationAdjustedValue, wealthMultiplier, realReturn from ../core/investmentUtils.js
 *  - INDIAN_INVESTMENT_BENCHMARKS from ../../data/investment-benchmarks/indianInvestmentBenchmarks.js
 */

import { calculateSip, calculateLumpsum } from '../core/investmentEngine.js';
import { calculateXirr, generateSipCashFlows } from '../core/xirrEngine.js';
import {
  calculateCagrCore,
  inflationAdjustedValue,
  wealthMultiplier,
  realReturn,
} from '../core/investmentUtils.js';
import { INDIAN_INVESTMENT_BENCHMARKS } from '../../data/investment-benchmarks/indianInvestmentBenchmarks.js';

/**
 * Primary pure calculation function for Mutual Fund Returns.
 *
 * @param {Object} inputs
 * @param {number} [inputs.amount=5000] - Monthly SIP contribution OR lump-sum principal (₹)
 * @param {number} [inputs.expectedReturnRate=12] - Annual expected return rate (% p.a.)
 * @param {number} [inputs.tenureYears=10] - Holding duration in years
 * @param {string} [inputs.investmentType='sip'] - 'sip' or 'lumpsum'
 * @param {number} [inputs.exitLoadPct=0] - Explicit user exit load assumption (%)
 * @param {number} [inputs.inflationRate=6] - Expected annual inflation rate (%)
 * @returns {Object} Structured numerical results and decision intelligence object
 */
export function calculateMutualFundReturns(inputs = {}) {
  const {
    amount = 5000,
    expectedReturnRate = 12,
    tenureYears = 10,
    investmentType = 'sip',
    exitLoadPct = 0,
    inflationRate = 6,
  } = inputs;

  const returnRate = Math.max(0, Number(expectedReturnRate) || 0);
  const years = Math.max(0.0833, Number(tenureYears) || 1); // min 1 month
  const capital = Math.max(0, Number(amount) || 0);
  const exitLoad = Math.max(0, Math.min(10, Number(exitLoadPct) || 0));
  const inflation = Math.max(0, Number(inflationRate) || 0);
  const isLumpsum = investmentType === 'lumpsum';

  let totalInvested = 0;
  let grossMaturityValue = 0;
  let rawReturns = 0;
  let yearlyBreakdown = [];

  let cagrPct = null;
  let xirrPct = null;
  let xirrStatus = { valid: true, error: null };
  let annualizedReturnPct = 0;
  let annualizedReturnLabel = '';

  if (isLumpsum) {
    // 1. LUMPSUM MODE
    const res = calculateLumpsum({
      principal: capital,
      expectedReturnRate: returnRate,
      tenureYears: years,
    });
    totalInvested = res.totalInvested;
    grossMaturityValue = res.maturityValue;
    rawReturns = res.estReturns;
    yearlyBreakdown = res.yearlyBreakdown;

    const cagrRes = calculateCagrCore({
      initialValue: totalInvested,
      finalValue: grossMaturityValue,
      tenureYears: years,
    });
    cagrPct = cagrRes.cagrPct;
    annualizedReturnPct = cagrPct;
    annualizedReturnLabel = 'CAGR (%)';
  } else {
    // 2. SIP MODE
    const res = calculateSip({
      monthlyInvestment: capital,
      expectedReturnRate: returnRate,
      tenureYears: years,
    });
    totalInvested = res.totalInvested;
    grossMaturityValue = res.maturityValue;
    rawReturns = res.estReturns;
    yearlyBreakdown = res.yearlyBreakdown;

    // Generate cash flows and calculate XIRR
    const cashFlows = generateSipCashFlows({
      monthlyAmount: capital,
      tenureYears: years,
      finalValue: grossMaturityValue,
    });
    const xirrRes = calculateXirr(cashFlows);
    xirrStatus = xirrRes;

    if (xirrRes.valid) {
      xirrPct = xirrRes.xirrPct;
      annualizedReturnPct = xirrPct;
    } else {
      xirrPct = null;
      annualizedReturnPct = returnRate;
    }
    annualizedReturnLabel = 'XIRR / Annualized Return (%)';
  }

  // 3. ABSOLUTE RETURN & WEALTH MULTIPLIER
  const absoluteReturnPct = totalInvested > 0
    ? Number((((grossMaturityValue - totalInvested) / totalInvested) * 100).toFixed(2))
    : 0;

  // 4. EXIT LOAD DEDUCTION
  const exitLoadAmount = Math.round(grossMaturityValue * (exitLoad / 100));
  const netMaturityValue = Math.max(0, grossMaturityValue - exitLoadAmount);
  const rawNetGain = netMaturityValue - totalInvested;
  const isLossScenario = rawNetGain <= 0;
  const netProfit = Math.max(0, rawNetGain);
  const multiplier = wealthMultiplier(netMaturityValue, totalInvested);

  // 5. INFLATION ADJUSTMENT & REAL RETURN
  const realComp = inflationAdjustedValue(netMaturityValue, inflation, years);
  const realCorpus = realComp.realValue;
  const purchasingPowerLoss = realComp.purchasingPowerLoss;
  const realReturnPct = realReturn(annualizedReturnPct, inflation);

  // 6. BENCHMARK COMPARISONS
  const benchmarkComparisons = [
    {
      id: 'nifty50',
      name: INDIAN_INVESTMENT_BENCHMARKS.nifty50.name,
      benchmarkRate: INDIAN_INVESTMENT_BENCHMARKS.nifty50.annualRate,
      diffPct: Number((annualizedReturnPct - INDIAN_INVESTMENT_BENCHMARKS.nifty50.annualRate).toFixed(2)),
      description: `Your annualized return is ${Math.abs(annualizedReturnPct - INDIAN_INVESTMENT_BENCHMARKS.nifty50.annualRate).toFixed(2)} percentage points ${annualizedReturnPct >= INDIAN_INVESTMENT_BENCHMARKS.nifty50.annualRate ? 'above' : 'below'} the Nifty 50 illustrative benchmark (~12% p.a.).`,
      disclaimer: INDIAN_INVESTMENT_BENCHMARKS.nifty50.disclaimer,
    },
    {
      id: 'fixedDeposit',
      name: INDIAN_INVESTMENT_BENCHMARKS.fixedDeposit.name,
      benchmarkRate: INDIAN_INVESTMENT_BENCHMARKS.fixedDeposit.annualRate,
      diffPct: Number((annualizedReturnPct - INDIAN_INVESTMENT_BENCHMARKS.fixedDeposit.annualRate).toFixed(2)),
      description: `Your annualized return is ${Math.abs(annualizedReturnPct - INDIAN_INVESTMENT_BENCHMARKS.fixedDeposit.annualRate).toFixed(2)} percentage points ${annualizedReturnPct >= INDIAN_INVESTMENT_BENCHMARKS.fixedDeposit.annualRate ? 'above' : 'below'} bank fixed deposits (~7% p.a.).`,
      disclaimer: INDIAN_INVESTMENT_BENCHMARKS.fixedDeposit.disclaimer,
    },
    {
      id: 'gold',
      name: INDIAN_INVESTMENT_BENCHMARKS.gold.name,
      benchmarkRate: INDIAN_INVESTMENT_BENCHMARKS.gold.annualRate,
      diffPct: Number((annualizedReturnPct - INDIAN_INVESTMENT_BENCHMARKS.gold.annualRate).toFixed(2)),
      description: `Your annualized return is ${Math.abs(annualizedReturnPct - INDIAN_INVESTMENT_BENCHMARKS.gold.annualRate).toFixed(2)} percentage points ${annualizedReturnPct >= INDIAN_INVESTMENT_BENCHMARKS.gold.annualRate ? 'above' : 'below'} long-term gold appreciation (~9% p.a.).`,
      disclaimer: INDIAN_INVESTMENT_BENCHMARKS.gold.disclaimer,
    },
    {
      id: 'inflationRate',
      name: 'Consumer Inflation (CPI)',
      benchmarkRate: inflation,
      diffPct: Number((annualizedReturnPct - inflation).toFixed(2)),
      description: `Your annualized return is ${Math.abs(annualizedReturnPct - inflation).toFixed(2)} percentage points ${annualizedReturnPct >= inflation ? 'above' : 'below'} cost-of-living inflation (~${inflation}% p.a.).`,
      disclaimer: 'Illustrative inflation rate assumption.',
    },
  ];

  // 7. DIRECT PLAN EXPENSE RATIO IMPACT SCENARIO (+0.75% TER Savings)
  const directPlanReturnRate = returnRate + 0.75;
  let directMaturityValue = 0;
  if (isLumpsum) {
    directMaturityValue = calculateLumpsum({ principal: capital, expectedReturnRate: directPlanReturnRate, tenureYears: years }).maturityValue;
  } else {
    directMaturityValue = calculateSip({ monthlyInvestment: capital, expectedReturnRate: directPlanReturnRate, tenureYears: years }).maturityValue;
  }
  const directPlanWealthGain = Math.max(0, directMaturityValue - grossMaturityValue);

  // 8. HYPOTHETICAL 5-SCENARIO SENSITIVITY GRID
  const createScenario = (id, name, badge, sRate, sYears) => {
    let sRes;
    if (isLumpsum) {
      sRes = calculateLumpsum({ principal: capital, expectedReturnRate: sRate, tenureYears: sYears });
    } else {
      sRes = calculateSip({ monthlyInvestment: capital, expectedReturnRate: sRate, tenureYears: sYears });
    }
    const sGross = sRes.maturityValue;
    const sExit = Math.round(sGross * (exitLoad / 100));
    const sNet = Math.max(0, sGross - sExit);
    const sInvested = sRes.totalInvested;
    const sProfit = Math.max(0, sNet - sInvested);

    return {
      id,
      name,
      badge,
      expectedReturnRate: sRate,
      tenureYears: sYears,
      totalInvested: sInvested,
      netMaturityValue: sNet,
      netProfit: sProfit,
      diffFromBase: sNet - netMaturityValue,
    };
  };

  const scenarios = [
    createScenario('current', 'Current Baseline Scenario', 'Base', returnRate, years),
    createScenario('rate_plus2', '+2% Higher Annual Return', 'Optimistic', returnRate + 2, years),
    createScenario('rate_minus2', '-2% Lower Annual Return', 'Conservative', Math.max(0, returnRate - 2), years),
    createScenario('years_plus5', '+5 Years Longer Tenure', 'Duration Extension', returnRate, years + 5),
    {
      id: 'direct_plan',
      name: 'Direct Plan (+0.75% TER Savings)',
      badge: 'TER Advantage',
      expectedReturnRate: directPlanReturnRate,
      tenureYears: years,
      totalInvested,
      netMaturityValue: Math.max(0, directMaturityValue - Math.round(directMaturityValue * (exitLoad / 100))),
      netProfit: Math.max(0, directMaturityValue - totalInvested),
      diffFromBase: directPlanWealthGain,
    },
  ];

  // 9. DYNAMIC INSIGHTS ARRAY
  const dynamicInsights = [
    {
      title: isLumpsum ? 'Compound Annual Growth Rate (CAGR)' : 'XIRR Money-Weighted Annualized Return',
      value: `${annualizedReturnPct}% p.a.`,
      description: isLumpsum
        ? `Lumpsum investment of ₹${capital.toLocaleString('en-IN')} grows at ${annualizedReturnPct}% CAGR over ${years} years.`
        : xirrStatus.valid
          ? `SIP monthly contributions grow at an annualized money-weighted XIRR rate of ${annualizedReturnPct}% p.a.`
          : `XIRR calculation unavailable for supplied cash flows (${xirrStatus.error}).`,
      icon: '📈',
    },
    {
      title: 'Absolute Wealth Gain & Multiplier',
      value: `+${absoluteReturnPct}% (${multiplier}x Multiplier)`,
      description: `Your invested capital of ₹${totalInvested.toLocaleString('en-IN')} generated ₹${netProfit.toLocaleString('en-IN')} in net profit.`,
      icon: '💰',
    },
    {
      title: 'Inflation-Adjusted Real Value',
      value: `₹${realCorpus.toLocaleString('en-IN')} Real Corpus`,
      description: `After accounting for ~${inflation}% annual cost-of-living inflation, your future net corpus of ₹${netMaturityValue.toLocaleString('en-IN')} has an estimated real purchasing power of ₹${realCorpus.toLocaleString('en-IN')}.`,
      icon: '🛡️',
    },
    {
      title: 'Direct Plan Expense Ratio Impact',
      value: `+₹${directPlanWealthGain.toLocaleString('en-IN')} Extra Gain`,
      description: `Illustrative expense-ratio impact scenario: Choosing a Direct Plan (~0.75% lower TER) adds an estimated ₹${directPlanWealthGain.toLocaleString('en-IN')} to your final corpus.`,
      icon: '⚡',
    },
  ];

  // Score & Status
  let score = 50;
  if (isLossScenario) {
    score = 30;
  } else {
    if (annualizedReturnPct >= inflation + 4) score += 20;
    if (multiplier >= 2) score += 15;
    if (years >= 7) score += 15;
  }
  score = Math.min(100, Math.max(0, Math.round(score)));

  let healthStatus = 'Moderate Wealth Growth';
  let healthColor = 'text-semantic-warning border-semantic-warning/30 bg-semantic-warning/10';
  if (isLossScenario) {
    healthStatus = 'Negative Portfolio Return';
    healthColor = 'text-semantic-danger border-semantic-danger/30 bg-semantic-danger/10';
  } else if (score >= 80) {
    healthStatus = 'High Wealth Compounding';
    healthColor = 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
  }

  const heroText = `Estimated Net Maturity Corpus is ₹${netMaturityValue.toLocaleString('en-IN')} (${annualizedReturnPct}% ${annualizedReturnLabel}).`;
  const healthDesc = `Over ${years} years, your total ${isLumpsum ? 'lump-sum investment' : 'SIP contribution'} of ₹${totalInvested.toLocaleString('en-IN')} generates ₹${netProfit.toLocaleString('en-IN')} in net profit (${multiplier}x wealth multiplier).`;

  return {
    amount: capital,
    expectedReturnRate: returnRate,
    tenureYears: years,
    investmentType,
    isLumpsum,
    exitLoadPct: exitLoad,
    inflationRate: inflation,
    primaryOutput: netMaturityValue,
    totalInvested,
    grossMaturityValue,
    exitLoadAmount,
    netMaturityValue,
    rawNetGain,
    netProfit,
    absoluteReturnPct,
    cagrPct,
    xirrPct,
    xirrStatus,
    annualizedReturnPct,
    annualizedReturnLabel,
    wealthMultiplier: multiplier,
    realCorpus,
    purchasingPowerLoss,
    realReturnPct,
    yearlyBreakdown,
    benchmarkComparisons,
    directPlanWealthGain,
    scenarios,
    dynamicInsights,
    score,
    healthStatus,
    healthColor,
    heroText,
    healthDesc,
  };
}