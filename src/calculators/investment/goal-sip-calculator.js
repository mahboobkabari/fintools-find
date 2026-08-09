import { calculateSip } from '../core/investmentEngine.js';
import { calculateStepUpSip } from './step-up-sip-calculator.js';
import { GOAL_SIP_CONFIG } from '../configs/goal-sip-calculator.config.js';

/**
 * Flagship Goal-Based SIP Financial Engine
 * Reverse solves the exact required monthly SIP (Fixed or Step-Up) needed to reach a target future goal corpus,
 * supporting inflation goal escalation, forward validation against universal SIP engine, and step-up scenarios.
 *
 * @param {Object} inputs
 * @param {number} [inputs.targetGoal=5000000] - Present target goal amount today (₹)
 * @param {number} [inputs.tenureYears=10] - Investment duration in years
 * @param {number} [inputs.expectedReturnRate=12.0] - Annual expected return rate (% p.a.)
 * @param {number} [inputs.inflationRate=6.0] - Annual assumed inflation rate (% p.a.)
 * @param {number} [inputs.stepUpRate=10.0] - Annual step-up percentage (% p.a.)
 * @param {boolean} [inputs.adjustForInflation=true] - Whether to inflate target goal corpus
 * @param {string} [inputs.currency='INR'] - Currency code ('INR'|'USD'|'EUR'|'GBP')
 * @returns {Object} Structured Goal-Based SIP decision model
 */
export function calculateGoalSipCalculator(inputs = {}) {
  const {
    targetGoal = 5000000,
    tenureYears = 10,
    expectedReturnRate = 12.0,
    inflationRate = 6.0,
    stepUpRate = 10.0,
    adjustForInflation = true,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & BOUNDARY AUDIT
  const rawTargetGoal = Math.max(0, Number(targetGoal) || 0);
  const years = Math.max(1, Math.min(50, Math.round(Number(tenureYears) || 1)));
  const annualReturn = Math.max(0, Math.min(50, Number(expectedReturnRate) || 0));
  const rawInflation = Math.max(0, Math.min(30, Number(inflationRate) || 0));
  const rawStepUp = Math.max(0, Math.min(50, Number(stepUpRate) || 0));
  const shouldInflate = Boolean(adjustForInflation);

  const nMonths = years * 12;
  const iMonthly = (annualReturn / 12) / 100;
  const inflDec = rawInflation / 100;

  // 2. TARGET GOAL INFLATION ESCALATION
  // FV_inflated = Target * (1 + inflation)^years
  const exactInflatedGoal = rawTargetGoal * Math.pow(1 + inflDec, years);
  const inflatedTargetGoal = Math.round(exactInflatedGoal);
  const effectiveTargetGoal = shouldInflate ? inflatedTargetGoal : rawTargetGoal;

  // 3. FIXED MONTHLY SIP REVERSE SOLVER
  // annuity due: M(i, n) = [((1+i)^n - 1) / i] * (1+i)
  let requiredMonthlySip = 0;
  if (effectiveTargetGoal > 0) {
    if (iMonthly === 0) {
      requiredMonthlySip = Math.round(effectiveTargetGoal / nMonths);
    } else {
      const annuityMultiplier = ((Math.pow(1 + iMonthly, nMonths) - 1) / iMonthly) * (1 + iMonthly);
      requiredMonthlySip = Math.round(effectiveTargetGoal / annuityMultiplier);
    }
  }

  // 4. FORWARD SIP VALIDATION
  // Verify requiredMonthlySip through universal calculateSip engine
  const forwardResult = calculateSip({
    monthlyInvestment: requiredMonthlySip,
    expectedReturnRate: annualReturn,
    tenureYears: years,
  });

  const totalInvested = forwardResult.totalInvested;
  const maturityValue = forwardResult.maturityValue;
  const wealthGain = Math.max(0, maturityValue - totalInvested);

  // 5. STEP-UP SIP REVERSE SOLVER
  // Solves starting monthly SIP required under annual step-up rate
  const stepUpAnalysis = calculateStepUpSip({
    initialMonthlyInvestment: 5000,
    annualStepUpPct: rawStepUp,
    expectedReturnRate: annualReturn,
    tenureYears: years,
    calculationMode: 'reverse_goal',
    targetCorpus: effectiveTargetGoal,
    inflationRate: 0,
  });

  const stepUpStartingSip = stepUpAnalysis.initialMonthlyInvestment;
  const stepUpTotalInvested = stepUpAnalysis.totalInvested;
  const stepUpMaturityValue = stepUpAnalysis.maturityValue;
  const stepUpWealthGain = stepUpAnalysis.estReturns;
  const stepUpSavingsMonthly = Math.max(0, requiredMonthlySip - stepUpStartingSip);

  // 6. 4-SCENARIO STEP-UP GRID (0% vs 5% vs 10% vs 15% Step-Up)
  const scenarioStepUps = [0, 5, 10, 15].map((sRate) => {
    const scAnalysis = calculateStepUpSip({
      initialMonthlyInvestment: 5000,
      annualStepUpPct: sRate,
      expectedReturnRate: annualReturn,
      tenureYears: years,
      calculationMode: 'reverse_goal',
      targetCorpus: effectiveTargetGoal,
      inflationRate: 0,
    });

    return {
      stepUpRate: sRate,
      label: sRate === 0 ? 'Fixed SIP (0% Step-Up)' : `${sRate}% Annual Step-Up`,
      startingMonthlySip: scAnalysis.initialMonthlyInvestment,
      finalMonthlySip: scAnalysis.finalMonthlyInvestment,
      totalInvested: scAnalysis.totalInvested,
      maturityValue: scAnalysis.maturityValue,
      wealthGain: scAnalysis.estReturns,
    };
  });

  // 7. YEAR-BY-YEAR ACCUMULATION SCHEDULE
  const yearlySchedule = forwardResult.yearlyBreakdown.map((row) => {
    const progressPercent = effectiveTargetGoal > 0
      ? Number(((row.totalValue / effectiveTargetGoal) * 100).toFixed(1))
      : 0;

    return {
      year: row.year,
      invested: row.invested,
      returns: row.returns,
      totalValue: row.totalValue,
      progressPercent: Math.min(100, progressPercent),
      isFinalRow: row.year === years,
    };
  });

  // 8. HERO SUMMARY TEXT
  const currencySymbol = currency === 'USD' ? '$' : '₹';
  const locale = currency === 'USD' ? 'en-US' : 'en-IN';
  const goalFormatted = `${currencySymbol}${rawTargetGoal.toLocaleString(locale)}`;
  const effectiveGoalFormatted = `${currencySymbol}${effectiveTargetGoal.toLocaleString(locale)}`;
  const sipFormatted = `${currencySymbol}${requiredMonthlySip.toLocaleString(locale)}`;
  const stepUpSipFormatted = `${currencySymbol}${stepUpStartingSip.toLocaleString(locale)}`;

  let heroText = '';
  if (shouldInflate && rawInflation > 0) {
    heroText = `To accumulate a target goal of ${goalFormatted} today (inflated to ${effectiveGoalFormatted} in ${years} years @ ${rawInflation}% inflation), start a monthly SIP of ${sipFormatted} @ ${annualReturn}% p.a. return. Alternatively, start at ${stepUpSipFormatted}/mo with a ${rawStepUp}% annual step-up.`;
  } else {
    heroText = `To accumulate a target goal of ${goalFormatted} in ${years} years at an expected return of ${annualReturn}% p.a., start a monthly SIP of ${sipFormatted}. Alternatively, start at ${stepUpSipFormatted}/mo with a ${rawStepUp}% annual step-up.`;
  }

  return {
    targetGoal: rawTargetGoal,
    tenureYears: years,
    expectedReturnRate: annualReturn,
    inflationRate: rawInflation,
    stepUpRate: rawStepUp,
    adjustForInflation: shouldInflate,
    currency,

    // Primary Outputs
    primaryOutput: requiredMonthlySip,
    requiredMonthlySip,
    inflatedTargetGoal,
    effectiveTargetGoal,
    totalInvested,
    maturityValue,
    wealthGain,

    // Step-Up Solved Metrics
    stepUpStartingSip,
    stepUpTotalInvested,
    stepUpMaturityValue,
    stepUpWealthGain,
    stepUpSavingsMonthly,

    // Reference & Schedules
    rateConvention: GOAL_SIP_CONFIG.rateConvention,
    scenarioStepUps,
    yearlySchedule,
    heroText,
  };
}
