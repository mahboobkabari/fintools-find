import { describe, it, expect } from 'vitest';
import { calculateStepUpSip } from '../step-up-sip-calculator.js';

describe('Step-Up SIP Calculator Math Engine — Sprint 30 Flagship Audit', () => {
  it('Reference Case A: ₹10,000/mo, 10% step-up, 12% return, 20 years', () => {
    const result = calculateStepUpSip({
      initialMonthlyInvestment: 10000,
      annualStepUpPct: 10,
      expectedReturnRate: 12,
      tenureYears: 20,
    });

    expect(result.initialMonthlyInvestment).toBe(10000);
    expect(result.annualStepUpPct).toBe(10);
    expect(result.totalInvested).toBeGreaterThan(6500000);
    expect(result.maturityValue).toBeGreaterThan(19000000); // ~₹1.99 Crores
    expect(result.wealthMultiplier).toBeGreaterThan(2.5);
  });

  it('Reference Case B: Reverse Goal Solver for ₹1 Crore Target (10% step-up, 12% return, 20 years)', () => {
    const goalResult = calculateStepUpSip({
      targetCorpus: 10000000, // ₹1 Crore
      annualStepUpPct: 10,
      expectedReturnRate: 12,
      tenureYears: 20,
      calculationMode: 'reverse_goal',
    });

    // Required starting SIP should be ~₹4,350/mo
    expect(goalResult.initialMonthlyInvestment).toBeLessThan(6000);
    expect(goalResult.initialMonthlyInvestment).toBeGreaterThan(3000);

    // Round-trip verification: feed solved initial SIP back into forward engine
    const roundTrip = calculateStepUpSip({
      initialMonthlyInvestment: goalResult.initialMonthlyInvestment,
      annualStepUpPct: 10,
      expectedReturnRate: 12,
      tenureYears: 20,
      calculationMode: 'accumulation',
    });

    expect(Math.abs(roundTrip.maturityValue - 10000000) / 10000000).toBeLessThan(0.01); // within 1%
  });

  it('Reference Case C: Reverse Goal Solver for ₹1 Crore Target with Fixed SIP (0% step-up)', () => {
    const fixedGoal = calculateStepUpSip({
      targetCorpus: 10000000, // ₹1 Crore
      annualStepUpPct: 0,
      expectedReturnRate: 12,
      tenureYears: 20,
      calculationMode: 'reverse_goal',
    });

    // Required starting fixed SIP is ~₹10,000/mo
    expect(fixedGoal.initialMonthlyInvestment).toBeGreaterThan(9000);
    expect(fixedGoal.initialMonthlyInvestment).toBeLessThan(11000);
  });

  it('Reference Case D: Reverse Goal Solver for ₹1 Crore Target with 15% Step-Up', () => {
    const highStepUpGoal = calculateStepUpSip({
      targetCorpus: 10000000, // ₹1 Crore
      annualStepUpPct: 15,
      expectedReturnRate: 12,
      tenureYears: 20,
      calculationMode: 'reverse_goal',
    });

    // 15% step-up requires much lower starting SIP (~₹2,700/mo) than fixed SIP
    expect(highStepUpGoal.initialMonthlyInvestment).toBeLessThan(4000);
  });

  it('Reference Case E: Zero Return Rate Stress Case (0% return, 10% step-up, 20 years)', () => {
    const zeroReturn = calculateStepUpSip({
      initialMonthlyInvestment: 10000,
      annualStepUpPct: 10,
      expectedReturnRate: 0,
      tenureYears: 20,
    });

    expect(zeroReturn.estReturns).toBe(0);
    expect(zeroReturn.maturityValue).toBe(zeroReturn.totalInvested);
  });

  it('computes 4-Scenario Step-Up comparison grid correctly', () => {
    const result = calculateStepUpSip({
      targetCorpus: 10000000,
      expectedReturnRate: 12,
      tenureYears: 20,
      calculationMode: 'reverse_goal',
    });

    expect(result.stepUpScenarios.length).toBe(4);
    const [sc0, sc5, sc10, sc15] = result.stepUpScenarios;

    // Higher step-up percentage reduces starting monthly SIP requirement
    expect(sc0.startingMonthlySip).toBeGreaterThan(sc5.startingMonthlySip);
    expect(sc5.startingMonthlySip).toBeGreaterThan(sc10.startingMonthlySip);
    expect(sc10.startingMonthlySip).toBeGreaterThan(sc15.startingMonthlySip);
  });

  it('calculates inflation-adjusted real purchasing power', () => {
    const result = calculateStepUpSip({
      initialMonthlyInvestment: 10000,
      annualStepUpPct: 10,
      expectedReturnRate: 12,
      tenureYears: 20,
      inflationRate: 6,
    });

    expect(result.realValue).toBeLessThan(result.maturityValue);
    expect(result.purchasingPowerLoss).toBe(result.maturityValue - result.realValue);
  });

  it('handles edge cases safely without NaN or negative values', () => {
    // Edge Case 1: Zero initial investment in accumulation mode
    const zeroInit = calculateStepUpSip({ initialMonthlyInvestment: 0 });
    expect(zeroInit.maturityValue).toBe(0);
    expect(zeroInit.totalInvested).toBe(0);

    // Edge Case 2: 1-Year Tenure
    const oneYear = calculateStepUpSip({ initialMonthlyInvestment: 5000, tenureYears: 1 });
    expect(oneYear.yearlyBreakdown.length).toBe(1);

    // Edge Case 3: Zero target corpus in reverse mode
    const zeroGoal = calculateStepUpSip({ targetCorpus: 0, calculationMode: 'reverse_goal' });
    expect(zeroGoal.initialMonthlyInvestment).toBe(0);
  });
});