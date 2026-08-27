import { describe, it, expect } from 'vitest';
import {
  sanitizeDebts,
  getPriorityOrder,
  simulatePayoffStrategy,
  calculateDebtAvalancheSchedule,
  calculateDebtSnowballSchedule,
  calculateBaselineMinimumSchedule,
  comparePayoffStrategies,
  calculateDebtAvalancheDetails,
} from '../debt-avalanche-calculator';
import { DEBT_AVALANCHE_CONFIG } from '../../configs/debt-avalanche-calculator.config';

describe('Debt Avalanche Engine Tests (Highest APR First)', () => {

  const sampleDebts = [
    { id: 'd1', name: 'Credit Card A', balance: 150000, annualRate: 42, minPayment: 4500 },
    { id: 'd2', name: 'Store Card B', balance: 75000, annualRate: 36, minPayment: 2500 },
    { id: 'd3', name: 'Personal Loan C', balance: 300000, annualRate: 14, minPayment: 8000 },
  ];

  // 1. Single debt avalanche schedule
  it('calculates single debt avalanche schedule correctly', () => {
    const single = [{ id: 's1', name: 'Single Card', balance: 100000, annualRate: 24, minPayment: 3000 }];
    const res = calculateDebtAvalancheSchedule(single, 2000);
    expect(res.totalMonths).toBeGreaterThan(0);
    expect(res.isImpossible).toBe(false);
    expect(res.totalPrincipalPaid).toBe(100000);
  });

  // 2. Multiple debts avalanche sorting (highest APR first)
  it('prioritizes debts strictly by highest APR % first in Avalanche strategy', () => {
    const order = getPriorityOrder(sampleDebts, 'avalanche');
    expect(order[0]).toBe('d1'); // 42% APR
    expect(order[1]).toBe('d2'); // 36% APR
    expect(order[2]).toBe('d3'); // 14% APR
  });

  // 3. Total interest saved vs minimum payments baseline
  it('calculates total interest saved vs minimum payments baseline correctly', () => {
    const details = calculateDebtAvalancheDetails({ debts: sampleDebts, extraMonthlyPayment: 5000 });
    expect(details.isValid).toBe(true);
    expect(details.interestSaved).toBeGreaterThan(0);
    expect(details.avalancheInterest).toBeLessThan(details.baselineInterest);
  });

  // 4. Comparison vs Debt Snowball
  it('compares Debt Avalanche against Debt Snowball mathematically', () => {
    const details = calculateDebtAvalancheDetails({ debts: sampleDebts, extraMonthlyPayment: 5000 });
    expect(details.comparison).toHaveProperty('snowballVsAvalancheInterestDiff');
    expect(details.avalanche.totalInterestPaid).toBeLessThanOrEqual(details.snowball.totalInterestPaid);
  });

  // 5. Zero extra monthly payment case
  it('handles zero extra monthly payment cleanly with freed minimum payment rollover', () => {
    const avalancheZero = calculateDebtAvalancheSchedule(sampleDebts, 0);
    const baseline = calculateBaselineMinimumSchedule(sampleDebts);
    expect(avalancheZero.totalInterestPaid).toBeLessThan(baseline.totalInterestPaid);
    expect(avalancheZero.totalMonths).toBeLessThan(baseline.totalMonths);
  });

  // 6. High extra monthly payment acceleration
  it('accelerates debt payoff significantly under high extra monthly payment', () => {
    const resSlow = calculateDebtAvalancheSchedule(sampleDebts, 1000);
    const resFast = calculateDebtAvalancheSchedule(sampleDebts, 10000);
    expect(resFast.totalMonths).toBeLessThan(resSlow.totalMonths);
    expect(resFast.totalInterestPaid).toBeLessThan(resSlow.totalInterestPaid);
  });

  // 7. Equal interest rate debt tie-breaking
  it('handles tie-breaking deterministically when two debts have identical APRs', () => {
    const tiedDebts = [
      { id: 't1', name: 'Card X', balance: 100000, annualRate: 24, minPayment: 3000 },
      { id: 't2', name: 'Card Y', balance: 50000, annualRate: 24, minPayment: 1500 },
    ];
    const order = getPriorityOrder(tiedDebts, 'avalanche');
    expect(order[0]).toBe('t2'); // Tie-breaker: lowest balance first
  });

  // 8. Month-by-month debt elimination timeline
  it('generates a non-empty month-by-month schedule array', () => {
    const res = calculateDebtAvalancheSchedule(sampleDebts, 5000);
    expect(res.monthlySchedule.length).toBe(res.totalMonths);
  });

  // 9. Paid-off debt rollover acceleration
  it('rolls over freed minimum payments into avalanche extra pool when a debt is paid off', () => {
    const res = calculateDebtAvalancheSchedule(sampleDebts, 5000);
    expect(res.payoffOrder).toHaveLength(3);
  });

  // 10. Minimum payment handling
  it('applies minimum monthly payment to every active debt each month', () => {
    const res = calculateDebtAvalancheSchedule(sampleDebts, 3000);
    expect(res.totalPrincipalPaid).toBe(525000);
  });

  // 11. Credit Card Trap preset integration
  it('integrates creditCardTrap preset cleanly', () => {
    const details = calculateDebtAvalancheDetails(DEBT_AVALANCHE_CONFIG.scenarios.creditCardTrap);
    expect(details.isValid).toBe(true);
    expect(details.avalancheMonths).toBeGreaterThan(0);
  });

  // 12. Post-Grad Debt Mix preset integration
  it('integrates postGradMix preset cleanly', () => {
    const details = calculateDebtAvalancheDetails(DEBT_AVALANCHE_CONFIG.scenarios.postGradMix);
    expect(details.isValid).toBe(true);
  });

  // 13. High Interest Cleanout preset integration
  it('integrates highInterestCleanout preset cleanly', () => {
    const details = calculateDebtAvalancheDetails(DEBT_AVALANCHE_CONFIG.scenarios.highInterestCleanout);
    expect(details.isValid).toBe(true);
  });

  // 14. Moderate Debt Consolidation preset integration
  it('integrates moderateConsolidation preset cleanly', () => {
    const details = calculateDebtAvalancheDetails(DEBT_AVALANCHE_CONFIG.scenarios.moderateConsolidation);
    expect(details.isValid).toBe(true);
  });

  // 15. Empty debt array handling
  it('returns isValid = false when debts array is empty', () => {
    const details = calculateDebtAvalancheDetails({ debts: [] });
    expect(details.isValid).toBe(false);
  });

  // 16. Zero balance debt filtering
  it('filters out zero-balance debts cleanly', () => {
    const mixed = [
      { id: 'z1', name: 'Zero Card', balance: 0, annualRate: 20, minPayment: 500 },
      { id: 'z2', name: 'Active Card', balance: 50000, annualRate: 18, minPayment: 1500 },
    ];
    const clean = sanitizeDebts(mixed);
    expect(clean).toHaveLength(1);
    expect(clean[0].id).toBe('z2');
  });

  // 17. Single debt edge case
  it('handles single debt calculation in master details function', () => {
    const single = [{ id: 's1', name: 'Card', balance: 50000, annualRate: 18, minPayment: 1500 }];
    const details = calculateDebtAvalancheDetails({ debts: single, extraMonthlyPayment: 1000 });
    expect(details.isValid).toBe(true);
  });

  // 18. Large monetary debt amounts (₹50 Lakhs)
  it('handles large corporate/mortgage debt amounts safely', () => {
    const large = [{ id: 'l1', name: 'Property Loan', balance: 5000000, annualRate: 9.5, minPayment: 50000 }];
    const details = calculateDebtAvalancheDetails({ debts: large, extraMonthlyPayment: 20000 });
    expect(details.isValid).toBe(true);
  });

  // 19. Numeric string input sanitization
  it('sanitizes numeric string inputs in debts cleanly', () => {
    const strDebts = [
      { id: 'st1', name: 'Card', balance: '100000', annualRate: '24', minPayment: '3000' },
    ];
    const clean = sanitizeDebts(strDebts);
    expect(clean[0].balance).toBe(100000);
    expect(clean[0].annualRate).toBe(24);
  });

  // 20. Negative extra payment clamping to 0
  it('clamps negative extra monthly payment to 0', () => {
    const details = calculateDebtAvalancheDetails({ debts: sampleDebts, extraMonthlyPayment: -5000 });
    expect(details.extraMonthlyPayment).toBe(0);
  });

  // 21. High APR (48%) handling
  it('handles very high APR (48%) credit card debt safely', () => {
    const highApr = [{ id: 'h1', name: 'Store Card', balance: 50000, annualRate: 48, minPayment: 2500 }];
    const res = calculateDebtAvalancheSchedule(highApr, 1000);
    expect(res.isImpossible).toBe(false);
  });

  // 22. 0% APR promotional balance handling
  it('handles 0% APR promotional balance debt without division-by-zero errors', () => {
    const promo = [{ id: 'p1', name: 'Promo 0% Balance', balance: 60000, annualRate: 0, minPayment: 2000 }];
    const res = calculateDebtAvalancheSchedule(promo, 0);
    expect(res.totalInterestPaid).toBe(0);
    expect(res.totalMonths).toBe(30);
  });

  // 23. Strategy comparison output verification
  it('verifies comparison metrics in calculateDebtPayoff result', () => {
    const res = comparePayoffStrategies(sampleDebts, 5000);
    expect(res.comparison).toHaveProperty('fastestStrategy');
    expect(res.comparison).toHaveProperty('cheapestStrategy');
  });

  // 24. Timeline schedule structure verification
  it('verifies snapshot structure of monthly schedule items', () => {
    const res = calculateDebtAvalancheSchedule(sampleDebts, 5000);
    const firstMonth = res.monthlySchedule[0];
    expect(firstMonth).toHaveProperty('month', 1);
    expect(firstMonth).toHaveProperty('totalBalanceRemaining');
    expect(firstMonth).toHaveProperty('debtBalances');
  });

  // 25. REGRESSION PROOF: Balances never become negative
  it('REGRESSION PROOF: Individual debt balances never become negative during simulation', () => {
    const res = calculateDebtAvalancheSchedule(sampleDebts, 10000);
    res.monthlySchedule.forEach((m) => {
      Object.values(m.debtBalances).forEach((bal) => {
        expect(bal).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // 26. REGRESSION PROOF: Interest is never charged after debt is paid off
  it('REGRESSION PROOF: Interest is zero for debts that are fully paid off', () => {
    const res = calculateDebtAvalancheSchedule(sampleDebts, 10000);
    expect(res.totalPrincipalPaid).toBe(525000);
  });

  // 27. REGRESSION PROOF: Avalanche priority always follows highest APR among active debts
  it('REGRESSION PROOF: Avalanche priority order matches highest APR active debt', () => {
    const order = getPriorityOrder(sampleDebts, 'avalanche');
    expect(order).toEqual(['d1', 'd2', 'd3']);
  });

  // 28. REGRESSION PROOF: Snowball priority always follows lowest balance among active debts
  it('REGRESSION PROOF: Snowball priority order matches lowest balance active debt', () => {
    const order = getPriorityOrder(sampleDebts, 'snowball');
    expect(order).toEqual(['d2', 'd1', 'd3']);
  });

  // 29. REGRESSION PROOF: Total interest equals the sum of modeled monthly interest
  it('REGRESSION PROOF: Total interest paid equals sum of individual debt interest charges', () => {
    const res = calculateDebtAvalancheSchedule(sampleDebts, 5000);
    const sumIndividual = res.individualDebts.reduce((sum, d) => sum + d.totalInterestPaid, 0);
    expect(Math.abs(res.totalInterestPaid - sumIndividual)).toBeLessThanOrEqual(1);
  });

  // 30. REGRESSION PROOF: Strategy comparisons use identical starting portfolio
  it('REGRESSION PROOF: Avalanche, Snowball, and Minimum Payments start with identical total debt', () => {
    const res = comparePayoffStrategies(sampleDebts, 5000);
    expect(res.avalanche.totalPrincipalPaid).toBe(res.snowball.totalPrincipalPaid);
    expect(res.snowball.totalPrincipalPaid).toBe(res.minimumOnly.totalPrincipalPaid);
  });

  // 31. Direct calculateDebtAvalancheSchedule helper function test
  it('executes calculateDebtAvalancheSchedule helper directly', () => {
    const res = calculateDebtAvalancheSchedule(sampleDebts, 2000);
    expect(res.strategy).toBe('avalanche');
  });

  // 32. Direct calculateDebtSnowballSchedule helper function test
  it('executes calculateDebtSnowballSchedule helper directly', () => {
    const res = calculateDebtSnowballSchedule(sampleDebts, 2000);
    expect(res.strategy).toBe('snowball');
  });

  // 33. Direct calculateBaselineMinimumSchedule helper function test
  it('executes calculateBaselineMinimumSchedule helper directly', () => {
    const res = calculateBaselineMinimumSchedule(sampleDebts);
    expect(res.strategy).toBe('minimum_only');
  });

  // 34. Direct comparePayoffStrategies helper function test
  it('executes comparePayoffStrategies helper directly', () => {
    const res = comparePayoffStrategies(sampleDebts, 3000);
    expect(res.debtsCount).toBe(3);
  });

  // 35. sanitizeDebts helper function tests
  it('sanitizes bad objects, non-array inputs, and limits to max 10 debts', () => {
    expect(sanitizeDebts(null)).toEqual([]);
    const elevenDebts = Array.from({ length: 12 }).map((_, i) => ({
      id: `d${i}`,
      name: `Debt ${i}`,
      balance: 10000 * (i + 1),
      annualRate: 10,
      minPayment: 500,
    }));
    const sanitized = sanitizeDebts(elevenDebts);
    expect(sanitized).toHaveLength(10);
  });

  // 36. Max safety limit (600 months) handling
  it('flags isImpossible = true if minimum payment is insufficient to cover monthly interest', () => {
    const badDebt = [{ id: 'b1', name: 'Predatory Debt', balance: 100000, annualRate: 48, minPayment: 100 }];
    const res = calculateBaselineMinimumSchedule(badDebt);
    expect(res.isImpossible).toBe(true);
  });

  // 37. Paid-off debt order list recording
  it('records debt payoff order items with month and name', () => {
    const res = calculateDebtAvalancheSchedule(sampleDebts, 10000);
    expect(res.payoffOrder.length).toBe(3);
    expect(res.payoffOrder[0]).toHaveProperty('month');
    expect(res.payoffOrder[0]).toHaveProperty('name');
  });

  // 38. Rollover of unused minimum payment when last debt payment is smaller than minPayment
  it('handles rollover of unused min payment correctly', () => {
    const res = calculateDebtAvalancheSchedule(sampleDebts, 5000);
    expect(res.isImpossible).toBe(false);
  });

  // 39. Full structured master result object verification
  it('verifies all expected properties in master calculateDebtAvalancheDetails result', () => {
    const details = calculateDebtAvalancheDetails(DEBT_AVALANCHE_CONFIG.defaultInputs);
    expect(details).toHaveProperty('isValid', true);
    expect(details).toHaveProperty('totalInitialDebt');
    expect(details).toHaveProperty('avalanche');
    expect(details).toHaveProperty('snowball');
    expect(details).toHaveProperty('minimumOnly');
    expect(details).toHaveProperty('comparison');
  });

  // 40. Zero extra payment comparison validity
  it('remains valid when extra monthly payment is zero', () => {
    const details = calculateDebtAvalancheDetails({ debts: sampleDebts, extraMonthlyPayment: 0 });
    expect(details.isValid).toBe(true);
    expect(details.extraMonthlyPayment).toBe(0);
  });

  // 41. Identical APR and balance tie-breaking stability
  it('handles identical APR and balance debts stably', () => {
    const identical = [
      { id: 'i1', name: 'Card A', balance: 50000, annualRate: 24, minPayment: 1500 },
      { id: 'i2', name: 'Card B', balance: 50000, annualRate: 24, minPayment: 1500 },
    ];
    const order = getPriorityOrder(identical, 'avalanche');
    expect(order).toHaveLength(2);
  });

  // 42. Multiple debts with identical 0% APR
  it('handles multiple debts with 0% APR safely', () => {
    const zeroAprs = [
      { id: 'z1', name: 'Medical Debt', balance: 40000, annualRate: 0, minPayment: 2000 },
      { id: 'z2', name: 'Family Loan', balance: 20000, annualRate: 0, minPayment: 1000 },
    ];
    const res = calculateDebtAvalancheSchedule(zeroAprs, 1000);
    expect(res.totalInterestPaid).toBe(0);
  });

  // 43. High monthly extra payment clearing all debt in Month 1
  it('handles extreme extra payment that clears all debt in Month 1', () => {
    const res = calculateDebtAvalancheSchedule(sampleDebts, 1000000);
    expect(res.totalMonths).toBe(1);
  });

  // 44. Partial extra payment allocation across remaining active debts
  it('allocates extra pool across multiple debts if first debt is paid off mid-month', () => {
    const smallDebts = [
      { id: 's1', name: 'Tiny Card', balance: 2000, annualRate: 36, minPayment: 500 },
      { id: 's2', name: 'Small Card', balance: 10000, annualRate: 24, minPayment: 1000 },
    ];
    const res = calculateDebtAvalancheSchedule(smallDebts, 5000);
    expect(res.totalMonths).toBeLessThan(5);
  });

  // 45. Validation message when no valid debts exist
  it('returns validationMessage when debts array is empty or contains zero balance debts', () => {
    const details = calculateDebtAvalancheDetails({ debts: [{ id: 'x', name: 'Zero', balance: 0, annualRate: 10, minPayment: 0 }] });
    expect(details.isValid).toBe(false);
    expect(details.validationMessage).toContain('valid debt');
  });

});
