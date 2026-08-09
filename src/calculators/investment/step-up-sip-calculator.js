import { inflationAdjustedValue, wealthMultiplier } from '../core/investmentUtils.js';

/**
 * Institutional Flagship Step-Up SIP & Goal-Based Investment Engine
 * Supports forward wealth accumulation, reverse goal solver, 4-step-up scenario grid, return sensitivity, and inflation-adjusted real purchasing power.
 *
 * @param {Object} inputs
 * @param {number} [inputs.initialMonthlyInvestment=5000] - Initial monthly contribution (₹)
 * @param {number} [inputs.annualStepUpPct=10] - Annual percentage increase in monthly contribution (% p.a.)
 * @param {number} [inputs.expectedReturnRate=12] - Annual return rate (% p.a.)
 * @param {number} [inputs.tenureYears=10] - Investment duration in years
 * @param {string} [inputs.calculationMode='accumulation'] - Mode: 'accumulation' | 'reverse_goal'
 * @param {number} [inputs.targetCorpus=10000000] - Target corpus for reverse solver (₹)
 * @param {number} [inputs.inflationRate=6] - Expected annual inflation rate (% p.a.)
 * @returns {Object} Complete step-up SIP analysis & scenario model
 */
export function calculateStepUpSip(inputs = {}) {
  const {
    initialMonthlyInvestment = 5000,
    annualStepUpPct = 10,
    expectedReturnRate = 12,
    tenureYears = 10,
    calculationMode = 'accumulation',
    targetCorpus = 10000000,
    inflationRate = 6,
  } = inputs;

  // 1. Input Sanitization & Validation
  const rawInitMonthly = Math.max(0, Number(initialMonthlyInvestment) || 0);
  const stepUpPct = Math.max(0, Math.min(100, Number(annualStepUpPct) || 0)) / 100;
  const annualRate = Math.max(0, Math.min(50, Number(expectedReturnRate) || 0));
  const years = Math.max(1, Math.min(50, Math.round(Number(tenureYears) || 1)));
  const monthlyRate = annualRate / 12 / 100;
  const infRate = Math.max(0, Math.min(30, Number(inflationRate) || 0));
  const targetGoal = Math.max(0, Number(targetCorpus) || 0);

  // 2. Reverse Solver Mode (Goal-Based Target SIP Solver)
  let solvedInitialMonthly = rawInitMonthly;
  if (calculationMode === 'reverse_goal') {
    if (targetGoal === 0) {
      solvedInitialMonthly = 0;
    } else {
      solvedInitialMonthly = solveRequiredStartingSipInternal({
        targetCorpus: targetGoal,
        stepUpPct,
        monthlyRate,
        years,
      });
    }
  }

  const effectiveInitialMonthly = solvedInitialMonthly;

  // 3. Forward Simulation Execution
  const forwardResult = runForwardStepUpSimulation({
    initialMonthly: effectiveInitialMonthly,
    stepUpPct,
    monthlyRate,
    years,
  });

  // 4. Inflation Adjustment (Real Purchasing Power)
  const realValResult = inflationAdjustedValue(
    forwardResult.maturityValue,
    infRate,
    years
  );

  // 5. 4-Scenario Step-Up Grid (0% vs 5% vs 10% vs 15% Step-Up)
  const stepUpScenarios = [0, 5, 10, 15].map((pct) => {
    let scenarioInitMonthly = effectiveInitialMonthly;
    if (calculationMode === 'reverse_goal' && targetGoal > 0) {
      scenarioInitMonthly = solveRequiredStartingSipInternal({
        targetCorpus: targetGoal,
        stepUpPct: pct / 100,
        monthlyRate,
        years,
      });
    }

    const scSim = runForwardStepUpSimulation({
      initialMonthly: scenarioInitMonthly,
      stepUpPct: pct / 100,
      monthlyRate,
      years,
    });

    return {
      stepUpPct: pct,
      label: pct === 0 ? 'Fixed SIP (0% Step-Up)' : `${pct}% Annual Step-Up`,
      startingMonthlySip: scenarioInitMonthly,
      finalMonthlySip: scSim.finalMonthlyInvestment,
      totalInvested: scSim.totalInvested,
      maturityValue: scSim.maturityValue,
      estReturns: scSim.estReturns,
      startingSipDiff: scenarioInitMonthly - effectiveInitialMonthly,
    };
  });

  // 6. Return Sensitivity Analysis (Conservative, Expected, Optimistic)
  const sensitivityScenarios = [
    { label: 'Conservative (-2%)', rateDelta: -2 },
    { label: 'Expected Return', rateDelta: 0 },
    { label: 'Optimistic (+2%)', rateDelta: 2 },
  ].map((sc) => {
    const scRate = Math.max(0, annualRate + sc.rateDelta);
    const scMonthlyRate = scRate / 12 / 100;
    const scSim = runForwardStepUpSimulation({
      initialMonthly: effectiveInitialMonthly,
      stepUpPct,
      monthlyRate: scMonthlyRate,
      years,
    });
    return {
      label: sc.label,
      rate: scRate,
      maturityValue: scSim.maturityValue,
      totalInvested: scSim.totalInvested,
      estReturns: scSim.estReturns,
    };
  });

  // Hero Summary Text
  let heroText = '';
  if (calculationMode === 'reverse_goal' && targetGoal > 0) {
    heroText = `To achieve your goal of ₹${targetGoal.toLocaleString(
      'en-IN'
    )} in ${years} years at ${annualRate}% return, start with a monthly SIP of ₹${effectiveInitialMonthly.toLocaleString(
      'en-IN'
    )} and increase it by ${(stepUpPct * 100).toFixed(0)}% every year.`;
  } else {
    heroText = `Starting at ₹${effectiveInitialMonthly.toLocaleString(
      'en-IN'
    )}/mo with an annual step-up of ${(stepUpPct * 100).toFixed(
      0
    )}% for ${years} years will grow your wealth to ₹${forwardResult.maturityValue.toLocaleString(
      'en-IN'
    )} at an expected return of ${annualRate}%.`;
  }

  const multiplier = wealthMultiplier(
    forwardResult.maturityValue,
    forwardResult.totalInvested
  );

  return {
    initialMonthlyInvestment: effectiveInitialMonthly,
    annualStepUpPct: Number((stepUpPct * 100).toFixed(1)),
    expectedReturnRate: annualRate,
    tenureYears: years,
    calculationMode,
    targetCorpus: targetGoal,
    inflationRate: infRate,

    // Primary Outputs
    primaryOutput: forwardResult.maturityValue,
    maturityValue: forwardResult.maturityValue,
    totalInvested: forwardResult.totalInvested,
    estReturns: forwardResult.estReturns,
    finalMonthlyInvestment: forwardResult.finalMonthlyInvestment,
    wealthMultiplier: multiplier,
    yearlyBreakdown: forwardResult.yearlyBreakdown,

    // Real Inflation Purchasing Power
    realValue: realValResult.realValue,
    purchasingPowerLoss: realValResult.purchasingPowerLoss,

    // Scenarios & Sensitivity
    stepUpScenarios,
    sensitivityScenarios,

    // Health Score & Hero Summary
    heroText,
    score: computeInvestmentHealthScore(multiplier, years),
    healthStatus: multiplier >= 2.5 ? 'Strong Wealth Creation' : 'Steady Accumulation',
  };
}

/**
 * Pure Forward Step-Up Simulation Engine
 */
function runForwardStepUpSimulation({ initialMonthly, stepUpPct, monthlyRate, years }) {
  let currentMonthly = initialMonthly;
  let currentBalance = 0;
  let totalInvested = 0;
  const yearlyBreakdown = [];

  for (let y = 1; y <= years; y++) {
    let yearInvested = 0;
    for (let m = 1; m <= 12; m++) {
      currentBalance = (currentBalance + currentMonthly) * (1 + monthlyRate);
      totalInvested += currentMonthly;
      yearInvested += currentMonthly;
    }

    yearlyBreakdown.push({
      year: y,
      monthlyContrib: Math.round(currentMonthly),
      yearInvested: Math.round(yearInvested),
      invested: Math.round(totalInvested),
      returns: Math.max(0, Math.round(currentBalance) - Math.round(totalInvested)),
      totalValue: Math.round(currentBalance),
    });

    if (y < years) {
      currentMonthly = Math.round(currentMonthly * (1 + stepUpPct));
    }
  }

  return {
    totalInvested: Math.round(totalInvested),
    estReturns: Math.max(0, Math.round(currentBalance) - Math.round(totalInvested)),
    maturityValue: Math.round(currentBalance),
    finalMonthlyInvestment: Math.round(currentMonthly),
    yearlyBreakdown,
  };
}

/**
 * High-Precision Binary Search Reverse Solver for Starting Monthly SIP
 */
function solveRequiredStartingSipInternal({ targetCorpus, stepUpPct, monthlyRate, years }) {
  if (targetCorpus <= 0) return 0;

  let low = 1;
  let high = targetCorpus;
  let bestSip = high;

  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const sim = runForwardStepUpSimulation({
      initialMonthly: mid,
      stepUpPct,
      monthlyRate,
      years,
    });

    if (Math.abs(sim.maturityValue - targetCorpus) < 1) {
      bestSip = mid;
      break;
    }

    if (sim.maturityValue < targetCorpus) {
      low = mid;
    } else {
      high = mid;
      bestSip = mid;
    }
  }

  return Math.round(bestSip);
}

function computeInvestmentHealthScore(multiplier, years) {
  let score = 50;
  if (multiplier >= 3.0) score += 40;
  else if (multiplier >= 2.0) score += 25;
  else if (multiplier >= 1.5) score += 10;

  if (years >= 15) score += 10;
  return Math.min(100, Math.max(0, Math.round(score)));
}