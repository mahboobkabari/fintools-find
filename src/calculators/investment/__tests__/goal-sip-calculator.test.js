import { describe, it, expect } from 'vitest';
import { calculateGoalSipCalculator } from '../goal-sip-calculator.js';
import { calculateSip } from '../../core/investmentEngine.js';
import { calculateStepUpSip } from '../step-up-sip-calculator.js';

describe('Flagship Goal-Based SIP Financial Engine', () => {
  it('1. verifies Standard Target Corpus without Inflation: ₹50 Lakhs @ 12% for 10 Years', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 5000000,
      tenureYears: 10,
      expectedReturnRate: 12.0,
      inflationRate: 6.0,
      adjustForInflation: false,
    });

    expect(result.targetGoal).toBe(5000000);
    expect(result.effectiveTargetGoal).toBe(5000000);
    expect(result.requiredMonthlySip).toBe(21520);
    expect(result.primaryOutput).toBe(21520);
  });

  it('2. verifies ₹50 Lakhs Target Corpus with 6% Inflation over 10 Years', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 5000000,
      tenureYears: 10,
      expectedReturnRate: 12.0,
      inflationRate: 6.0,
      adjustForInflation: true,
    });

    // Inflated Goal = 5,000,000 * (1.06)^10 = 8,954,238
    expect(result.inflatedTargetGoal).toBe(8954238);
    expect(result.effectiveTargetGoal).toBe(8954238);
    expect(result.requiredMonthlySip).toBe(38540);
  });

  it('3. verifies 15-Year ₹25 Lakhs Higher Education Goal Benchmark', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 2500000,
      tenureYears: 15,
      expectedReturnRate: 12.0,
      inflationRate: 6.0,
      adjustForInflation: true,
    });

    // Inflated Goal = 2,500,000 * (1.06)^15 = 5,991,395
    expect(result.inflatedTargetGoal).toBe(5991395);
    expect(result.requiredMonthlySip).toBe(11874);
  });

  it('4. verifies 7-Year ₹50 Lakhs Home Down Payment Goal Benchmark', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 5000000,
      tenureYears: 7,
      expectedReturnRate: 12.0,
      inflationRate: 6.0,
      adjustForInflation: true,
    });

    // Inflated Goal = 5,000,000 * (1.06)^7 = 7,518,151
    expect(result.inflatedTargetGoal).toBe(7518151);
    expect(result.requiredMonthlySip).toBe(56965);
  });

  it('5. verifies 20-Year ₹1 Crore Retirement Goal Benchmark', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 10000000,
      tenureYears: 20,
      expectedReturnRate: 12.0,
      inflationRate: 6.0,
      adjustForInflation: true,
    });

    // Inflated Goal = 10,000,000 * (1.06)^20 = 32,071,355
    expect(result.inflatedTargetGoal).toBe(32071355);
    expect(result.requiredMonthlySip).toBe(32099);
  });

  it('6. handles zero inflation rate cleanly (0% inflation)', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 5000000,
      tenureYears: 10,
      expectedReturnRate: 12.0,
      inflationRate: 0,
      adjustForInflation: true,
    });

    expect(result.inflatedTargetGoal).toBe(5000000);
    expect(result.requiredMonthlySip).toBe(21520);
  });

  it('7. handles zero expected return rate cleanly (0% return)', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 1200000,
      tenureYears: 10,
      expectedReturnRate: 0,
      inflationRate: 0,
      adjustForInflation: false,
    });

    // 1,200,000 / (10 * 12) = 10,000
    expect(result.requiredMonthlySip).toBe(10000);
    expect(result.totalInvested).toBe(1200000);
    expect(result.wealthGain).toBe(0);
  });

  it('8. handles short horizon calculation (1 Year)', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 120000,
      tenureYears: 1,
      expectedReturnRate: 12.0,
      adjustForInflation: false,
    });

    // 120,000 in 1 yr @ 12% -> required SIP ~9,368/mo
    expect(result.requiredMonthlySip).toBe(9368);
  });

  it('9. handles long horizon calculation (30 Years)', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 10000000,
      tenureYears: 30,
      expectedReturnRate: 12.0,
      adjustForInflation: false,
    });

    expect(result.requiredMonthlySip).toBe(2833);
  });

  it('10. verifies Step-Up SIP starting monthly requirement calculation (10% step-up)', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 5000000,
      tenureYears: 10,
      expectedReturnRate: 12.0,
      stepUpRate: 10.0,
      adjustForInflation: false,
    });

    // Fixed required SIP: 21,520. Step-up starting SIP should be significantly lower (14,818)
    expect(result.stepUpStartingSip).toBe(14818);
    expect(result.stepUpSavingsMonthly).toBe(6702);
  });

  it('11. verifies 0% step-up starting SIP equals fixed required monthly SIP', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 5000000,
      tenureYears: 10,
      expectedReturnRate: 12.0,
      stepUpRate: 0,
      adjustForInflation: false,
    });

    expect(Math.abs(result.stepUpStartingSip - result.requiredMonthlySip)).toBeLessThanOrEqual(1);
  });

  it('12. verifies higher step-up rate (20% step-up)', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 5000000,
      tenureYears: 10,
      expectedReturnRate: 12.0,
      stepUpRate: 20.0,
      adjustForInflation: false,
    });

    // Higher step-up requires an even lower starting SIP (~9,869)
    expect(result.stepUpStartingSip).toBeLessThan(14818);
  });

  it('13. CRITICAL FORWARD/REVERSE CONSISTENCY TEST: verifies ForwardSIP(requiredMonthlySIP) ≈ effectiveTargetGoal', () => {
    const scenarios = [
      { targetGoal: 5000000, tenureYears: 10, expectedReturnRate: 12.0, adjustForInflation: false },
      { targetGoal: 10000000, tenureYears: 15, expectedReturnRate: 14.0, adjustForInflation: true },
      { targetGoal: 2500000, tenureYears: 5, expectedReturnRate: 10.0, adjustForInflation: true },
    ];

    scenarios.forEach((sc) => {
      const result = calculateGoalSipCalculator(sc);
      const forward = calculateSip({
        monthlyInvestment: result.requiredMonthlySip,
        expectedReturnRate: result.expectedReturnRate,
        tenureYears: result.tenureYears,
      });

      const diff = Math.abs(forward.maturityValue - result.effectiveTargetGoal);
      const relativeDiff = diff / result.effectiveTargetGoal;
      // Forward SIP maturity must equal target goal within 0.5% tolerance
      expect(relativeDiff).toBeLessThan(0.005);
    });
  });

  it('14. CRITICAL STEP-UP FORWARD/REVERSE CONSISTENCY TEST: verifies ForwardStepUp(stepUpStartingSip) ≈ effectiveTargetGoal', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 5000000,
      tenureYears: 10,
      expectedReturnRate: 12.0,
      stepUpRate: 10.0,
      adjustForInflation: false,
    });

    const forwardStepUp = calculateStepUpSip({
      initialMonthlyInvestment: result.stepUpStartingSip,
      annualStepUpPct: 10,
      expectedReturnRate: 12.0,
      tenureYears: 10,
      calculationMode: 'accumulation',
    });

    const diff = Math.abs(forwardStepUp.maturityValue - result.effectiveTargetGoal);
    const relativeDiff = diff / result.effectiveTargetGoal;
    expect(relativeDiff).toBeLessThan(0.005);
  });

  it('15. verifies required SIP rounding and total invested capital', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 5000000,
      tenureYears: 10,
      expectedReturnRate: 12.0,
      adjustForInflation: false,
    });

    // Total Invested = 21,520 * 12 * 10 = 2,582,400
    expect(result.totalInvested).toBe(2582400);
  });

  it('16. verifies wealth gain calculation accuracy', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 5000000,
      tenureYears: 10,
      expectedReturnRate: 12.0,
      adjustForInflation: false,
    });

    // Wealth Gain = 5,000,000 - 2,582,400 = 2,417,600 (approx)
    expect(result.wealthGain).toBeGreaterThan(2300000);
    expect(result.wealthGain + result.totalInvested).toBeCloseTo(result.maturityValue, -3);
  });

  it('17. verifies 10-year annual schedule rollups and final row reconciliation', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 5000000,
      tenureYears: 10,
      expectedReturnRate: 12.0,
      adjustForInflation: false,
    });

    expect(result.yearlySchedule.length).toBe(10);
    expect(result.yearlySchedule[0].year).toBe(1);
    expect(result.yearlySchedule[9].year).toBe(10);
    expect(result.yearlySchedule[9].progressPercent).toBe(100);
  });

  it('18. sanitizes invalid negative inputs properly', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: -5000000,
      tenureYears: -10,
      expectedReturnRate: -12.0,
      inflationRate: -6.0,
    });

    expect(result.targetGoal).toBe(0);
    expect(result.tenureYears).toBe(1);
    expect(result.requiredMonthlySip).toBe(0);
  });

  it('19. handles USD currency mode formatting', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 500000,
      currency: 'USD',
    });

    expect(result.currency).toBe('USD');
    expect(result.heroText).toContain('$500,000');
  });

  it('20. handles high return edge case (25% p.a. expected return)', () => {
    const result = calculateGoalSipCalculator({
      targetGoal: 10000000,
      tenureYears: 10,
      expectedReturnRate: 25.0,
      adjustForInflation: false,
    });

    // High return reduces required monthly SIP (~18,769)
    expect(result.requiredMonthlySip).toBeLessThan(20000);
  });
});
