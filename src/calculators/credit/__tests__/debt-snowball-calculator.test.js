import { describe, it, expect } from 'vitest';
import {
  calculateDebtPayoff,
  simulatePayoffStrategy,
  sanitizeDebts,
  getPriorityOrder,
} from '../debt-snowball-calculator';
import { DEBT_SNOWBALL_CONFIG } from '../../configs/debt-snowball-calculator.config';

describe('Debt Snowball vs Debt Avalanche Financial Engine', () => {
  const sampleDebts = [
    { id: 'd1', name: 'Credit Card A', balance: 20000, annualRate: 36.0, minPayment: 1000 },
    { id: 'd2', name: 'Credit Card B', balance: 50000, annualRate: 24.0, minPayment: 2000 },
    { id: 'd3', name: 'Personal Loan', balance: 100000, annualRate: 14.0, minPayment: 3000 },
  ];

  // 1. Single Debt Test
  it('calculates payoff correctly for a single debt', () => {
    const debts = [{ id: 'card1', name: 'Card 1', balance: 12000, annualRate: 12.0, minPayment: 1000 }];
    const res = calculateDebtPayoff(debts, 0);

    expect(res.debtsCount).toBe(1);
    expect(res.snowball.totalMonths).toBeGreaterThan(0);
    expect(res.snowball.totalInterestPaid).toBeGreaterThan(0);
    expect(res.snowball.totalAmountPaid).toBe(res.snowball.totalPrincipalPaid + res.snowball.totalInterestPaid);
  });

  // 2. Multiple Debts Test
  it('handles multiple debts correctly across strategies', () => {
    const res = calculateDebtPayoff(sampleDebts, 3000);

    expect(res.debtsCount).toBe(3);
    expect(res.totalInitialDebt).toBe(170000);
    expect(res.totalMinimumMonthlyPayment).toBe(6000);
    expect(res.totalMonthlyPaymentBudget).toBe(9000);
    expect(res.snowball.totalMonths).toBeLessThan(res.minimumOnly.totalMonths);
    expect(res.avalanche.totalInterestPaid).toBeLessThan(res.minimumOnly.totalInterestPaid);
  });

  // 3. Snowball Priority Order Test
  it('orders debts by lowest balance first under Debt Snowball', () => {
    const order = getPriorityOrder(sampleDebts, 'snowball');
    expect(order).toEqual(['d1', 'd2', 'd3']); // 20k, 50k, 100k
  });

  // 4. Avalanche Priority Order Test
  it('orders debts by highest interest rate first under Debt Avalanche', () => {
    const order = getPriorityOrder(sampleDebts, 'avalanche');
    expect(order).toEqual(['d1', 'd2', 'd3']); // 36%, 24%, 14%
  });

  // 5. Equal Balance Tie-Breaking Test
  it('uses highest APR as tie-breaker for equal balances in Snowball', () => {
    const debts = [
      { id: 'a', name: 'A', balance: 30000, annualRate: 15.0, minPayment: 1000 },
      { id: 'b', name: 'B', balance: 30000, annualRate: 25.0, minPayment: 1000 },
    ];
    const order = getPriorityOrder(debts, 'snowball');
    expect(order).toEqual(['b', 'a']);
  });

  // 6. Equal APR Tie-Breaking Test
  it('uses lowest balance as tie-breaker for equal APRs in Avalanche', () => {
    const debts = [
      { id: 'a', name: 'A', balance: 50000, annualRate: 20.0, minPayment: 1000 },
      { id: 'b', name: 'B', balance: 20000, annualRate: 20.0, minPayment: 1000 },
    ];
    const order = getPriorityOrder(debts, 'avalanche');
    expect(order).toEqual(['b', 'a']);
  });

  // 7. Minimum Payments Only Baseline Test
  it('calculates minimum payments baseline correctly with zero extra payment', () => {
    const res = calculateDebtPayoff(sampleDebts, 0);

    expect(res.minimumOnly.totalMonths).toBeGreaterThan(res.avalanche.totalMonths);
    expect(res.comparison.avalancheInterestSaved).toBeGreaterThanOrEqual(0);
    expect(res.comparison.avalancheMonthsSaved).toBeGreaterThanOrEqual(0);
  });

  // 8. Additional Payment Allocation Acceleration Test
  it('accelerates debt payoff when extra monthly payment is added', () => {
    const resNoExtra = calculateDebtPayoff(sampleDebts, 0);
    const resExtra = calculateDebtPayoff(sampleDebts, 5000);

    expect(resExtra.snowball.totalMonths).toBeLessThan(resNoExtra.snowball.totalMonths);
    expect(resExtra.snowball.totalInterestPaid).toBeLessThan(resNoExtra.snowball.totalInterestPaid);
  });

  // 9. Minimum Payment Rollover Test
  it('rolls over freed minimum payment into active target debt when a debt is paid off', () => {
    const debts = [
      { id: 'small', name: 'Small Card', balance: 5000, annualRate: 24.0, minPayment: 1000 },
      { id: 'big', name: 'Big Card', balance: 50000, annualRate: 18.0, minPayment: 2000 },
    ];

    const sim = simulatePayoffStrategy(debts, 1000, 'snowball');
    expect(sim.payoffOrder[0].id).toBe('small');
    expect(sim.payoffOrder[0].month).toBeLessThan(sim.payoffOrder[1].month);
  });

  // 10. Extra Payment Larger Than Remaining Balance Test
  it('prevents overpayment beyond remaining balance and carries excess to next debt', () => {
    const debts = [
      { id: 'tiny', name: 'Tiny Debt', balance: 1000, annualRate: 12.0, minPayment: 500 },
      { id: 'large', name: 'Large Debt', balance: 50000, annualRate: 18.0, minPayment: 2000 },
    ];

    const sim = simulatePayoffStrategy(debts, 5000, 'snowball');
    expect(sim.monthlySchedule[0].totalPaidThisMonth).toBeGreaterThan(0);
    expect(sim.individualDebts.find((d) => d.id === 'tiny').payoffMonth).toBe(1);
  });

  // 11. Zero-Interest Debt Test
  it('handles 0% interest rate debts safely', () => {
    const debts = [{ id: 'zero', name: 'Zero Rate Loan', balance: 12000, annualRate: 0, minPayment: 1000 }];
    const sim = simulatePayoffStrategy(debts, 0, 'snowball');

    expect(sim.totalInterestPaid).toBe(0);
    expect(sim.totalMonths).toBe(12);
  });

  // 12. Zero Extra Payment Test
  it('handles zero extra payment cleanly across all strategies', () => {
    const res = calculateDebtPayoff(sampleDebts, 0);

    expect(res.extraMonthlyPayment).toBe(0);
    expect(res.snowball.totalMonths).toBeGreaterThan(0);
    expect(res.avalanche.totalMonths).toBeGreaterThan(0);
  });

  // 13. Zero Balance Filtering Test
  it('filters out initial zero-balance debts from simulation', () => {
    const debts = [
      { id: 'zero', name: 'Zero Card', balance: 0, annualRate: 20.0, minPayment: 500 },
      { id: 'active', name: 'Active Card', balance: 10000, annualRate: 15.0, minPayment: 1000 },
    ];

    const sanitized = sanitizeDebts(debts);
    expect(sanitized.length).toBe(1);
    expect(sanitized[0].id).toBe('active');
  });

  // 14. Negative Input Sanitization Test
  it('sanitizes negative inputs to non-negative numbers', () => {
    const debts = [{ id: 'neg', name: 'Neg Card', balance: -5000, annualRate: -10, minPayment: -500 }];
    const sanitized = sanitizeDebts(debts);

    expect(sanitized.length).toBe(0);
  });

  // 15. Very High APR Test
  it('computes simulation correctly for very high APR (42% credit card)', () => {
    const debts = [{ id: 'high', name: 'High APR Card', balance: 30000, annualRate: 42.0, minPayment: 2000 }];
    const sim = simulatePayoffStrategy(debts, 1000, 'snowball');

    expect(sim.totalInterestPaid).toBeGreaterThan(0);
    expect(sim.totalMonths).toBeLessThan(600);
  });

  // 16. Identical Balances Test
  it('handles debts with identical balances predictably using APR tie-breaker', () => {
    const debts = [
      { id: 'd1', name: 'Card 1', balance: 20000, annualRate: 30.0, minPayment: 1000 },
      { id: 'd2', name: 'Card 2', balance: 20000, annualRate: 18.0, minPayment: 1000 },
    ];

    const order = getPriorityOrder(debts, 'snowball');
    expect(order[0]).toBe('d1'); // Higher APR tie-breaker
  });

  // 17. Identical APRs Test
  it('handles debts with identical APRs predictably', () => {
    const debts = [
      { id: 'd1', name: 'Card 1', balance: 40000, annualRate: 20.0, minPayment: 1500 },
      { id: 'd2', name: 'Card 2', balance: 15000, annualRate: 20.0, minPayment: 1000 },
    ];

    const res = calculateDebtPayoff(debts, 1000);
    expect(res.avalanche.payoffOrder[0].id).toBe('d2'); // Lower balance tie-breaker
  });

  // 18. Maximum 10 Debts Cap Test
  it('restricts input debts array to maximum 10 items', () => {
    const manyDebts = Array.from({ length: 15 }, (_, i) => ({
      id: `d_${i}`,
      name: `Debt ${i}`,
      balance: 10000,
      annualRate: 15,
      minPayment: 500,
    }));

    const sanitized = sanitizeDebts(manyDebts);
    expect(sanitized.length).toBe(10);
  });

  // 19. Impossible Repayment Safety Limit Test
  it('flags impossible repayment scenario if minimum payment is less than interest accrued', () => {
    // 100k balance at 36% APR accrues 3000 interest/mo, but min payment is only 500 -> balance grows infinitely
    const debts = [{ id: 'trap', name: 'Trap Loan', balance: 100000, annualRate: 36.0, minPayment: 500 }];
    const sim = simulatePayoffStrategy(debts, 0, 'minimum_only');

    expect(sim.isImpossible).toBe(true);
    expect(sim.totalMonths).toBe(600);
  });

  // 20. Comparative Strategy Savings Accuracy Test
  it('accurately computes interest savings difference between Snowball and Avalanche', () => {
    const debts = [
      { id: 'small_low', name: 'Small Low Rate', balance: 10000, annualRate: 10.0, minPayment: 500 },
      { id: 'big_high', name: 'Big High Rate', balance: 80000, annualRate: 36.0, minPayment: 3000 },
    ];

    const res = calculateDebtPayoff(debts, 2000);

    // Avalanche pays 36% first -> saves interest over Snowball which pays 10% first
    expect(res.avalanche.totalInterestPaid).toBeLessThan(res.snowball.totalInterestPaid);
    expect(res.comparison.cheapestStrategy).toBe('avalanche');
    expect(res.comparison.snowballVsAvalancheInterestDiff).toBeGreaterThan(0);
  });

  // 21. Presets Configuration Integration Test
  it('integrates cleanly with preset scenario default debts', () => {
    const preset = DEBT_SNOWBALL_CONFIG.scenarios.highInterestCards;
    const res = calculateDebtPayoff(preset.debts, preset.extraMonthlyPayment);

    expect(res.debtsCount).toBe(3);
    expect(res.avalanche.totalMonths).toBeLessThan(res.minimumOnly.totalMonths);
  });

  // 22. Currency-Independent Accuracy Test
  it('maintains numeric precision across large currency amounts', () => {
    const debts = [
      { id: 'large1', name: 'Jumbo Personal Loan', balance: 2500000, annualRate: 14.0, minPayment: 60000 },
      { id: 'large2', name: 'Jumbo Auto Loan', balance: 1500000, annualRate: 9.5, minPayment: 35000 },
    ];

    const res = calculateDebtPayoff(debts, 20000);

    expect(res.totalInitialDebt).toBe(4000000);
    expect(Number.isFinite(res.avalanche.totalInterestPaid)).toBe(true);
  });
});
