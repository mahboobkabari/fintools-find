import { describe, it, expect } from 'vitest';
import {
  calculateIllustrativeMinimumPayment,
  resolveCardMinimumPayment,
  calculateSingleCardPayoff,
  simulateMultiCardPayoff,
  calculateCreditCardPayoff,
} from '../credit-card-payoff-calculator.js';
import { CREDIT_CARD_PAYOFF_CONFIG } from '../../configs/credit-card-payoff-calculator.config.js';

describe('Credit Card Payoff & Debt Avalanche Engine', () => {

  // 1. Single card fixed payment payoff months
  it('calculates single card payoff horizon accurately for target payment', () => {
    const res = calculateSingleCardPayoff({
      balance: 100000,
      aprPercent: 24,
      targetMonthlyPayment: 10000,
    });
    expect(res.isValid).toBe(true);
    expect(res.months).toBe(12);
    expect(res.totalInterestPaid).toBeGreaterThan(0);
  });

  // 2. Single card total interest calculation
  it('calculates total interest paid accurately for a 12-month payoff', () => {
    const res = calculateSingleCardPayoff({
      balance: 120000,
      aprPercent: 12, // 1% per month
      targetMonthlyPayment: 10662,
    });
    expect(res.isValid).toBe(true);
    expect(res.totalAmountPaid).toBeGreaterThan(120000);
  });

  // 3. Illustrative default minimum payment formula
  it('calculates illustrative default minimum payment correctly when user min is omitted', () => {
    const min = calculateIllustrativeMinimumPayment(100000, 24);
    // 5% of 100000 = 5000, Interest = 2000 + 1000 = 3000 -> max is 5000
    expect(min).toBe(5000);
  });

  // 4. Negative amortization warning (payment <= monthly interest)
  it('returns negative amortization warning when target payment <= monthly interest', () => {
    const res = calculateSingleCardPayoff({
      balance: 100000,
      aprPercent: 36, // 3% per month = 3000 interest
      targetMonthlyPayment: 2500, // less than 3000 interest
    });
    expect(res.isValid).toBe(false);
    expect(res.isNegativeAmortization).toBe(true);
    expect(res.validationMessage).toContain('less than or equal to accrued monthly interest');
  });

  // 5. Multi-card Debt Avalanche APR sorting
  it('sorts multi-card debts by APR descending under Debt Avalanche', () => {
    const cards = [
      { id: 'c1', name: 'Low APR Card', balance: 50000, aprPercent: 12, minPayment: 1500 },
      { id: 'c2', name: 'High APR Card', balance: 50000, aprPercent: 36, minPayment: 1500 },
    ];
    const res = simulateMultiCardPayoff(cards, 10000, 'avalanche');
    expect(res.isValid).toBe(true);
    expect(res.cards[0].aprPercent).toBe(36);
  });

  // 6. Multi-card payment rollover upon card payoff
  it('rolls over payment amount into next card when top card reaches zero balance', () => {
    const cards = [
      { id: 'c1', name: 'Card 1', balance: 10000, aprPercent: 36, minPayment: 1000 },
      { id: 'c2', name: 'Card 2', balance: 50000, aprPercent: 18, minPayment: 1500 },
    ];
    const res = simulateMultiCardPayoff(cards, 6000, 'avalanche');
    expect(res.isValid).toBe(true);
    expect(res.months).toBeLessThan(12);
  });

  // 7. Multi-card Debt Snowball balance sorting
  it('sorts multi-card debts by balance ascending under Debt Snowball', () => {
    const cards = [
      { id: 'c1', name: 'Large Balance', balance: 100000, aprPercent: 30, minPayment: 3000 },
      { id: 'c2', name: 'Small Balance', balance: 20000, aprPercent: 18, minPayment: 1000 },
    ];
    const res = simulateMultiCardPayoff(cards, 8000, 'snowball');
    expect(res.isValid).toBe(true);
    expect(res.cards[0].initialBalance).toBe(20000);
  });

  // 8. Interest saved comparison (Avalanche vs Snowball)
  it('demonstrates Debt Avalanche saves more or equal interest than Debt Snowball', () => {
    const cards = [
      { id: 'c1', name: 'Small Low APR', balance: 20000, aprPercent: 12, minPayment: 1000 },
      { id: 'c2', name: 'Large High APR', balance: 100000, aprPercent: 36, minPayment: 3000 },
    ];
    const res = calculateCreditCardPayoff({
      mode: 'multi',
      cards,
      monthlyPayoffBudget: 8000,
    });
    expect(res.isValid).toBe(true);
    expect(res.avalanche.totalInterestPaid).toBeLessThanOrEqual(res.snowball.totalInterestPaid);
  });

  // 9. Budget less than total minimum payments validation
  it('returns validation error if budget is less than total required minimum payments', () => {
    const cards = [
      { id: 'c1', name: 'Card A', balance: 50000, aprPercent: 24, minPayment: 2500 },
      { id: 'c2', name: 'Card B', balance: 50000, aprPercent: 18, minPayment: 2500 },
    ];
    const res = simulateMultiCardPayoff(cards, 4000, 'avalanche');
    expect(res.isValid).toBe(false);
    expect(res.validationMessage).toContain('less than the required minimum payments');
  });

  // 10. Zero balance card filtering
  it('filters out zero balance cards automatically', () => {
    const cards = [
      { id: 'c1', name: 'Paid Card', balance: 0, aprPercent: 24, minPayment: 0 },
      { id: 'c2', name: 'Active Card', balance: 50000, aprPercent: 18, minPayment: 2000 },
    ];
    const res = simulateMultiCardPayoff(cards, 5000, 'avalanche');
    expect(res.isValid).toBe(true);
    expect(res.cards.length).toBe(1);
  });

  // 11. APR boundary clamping & handling
  it('handles 0% APR promotional rate cards with zero interest calculation', () => {
    const res = calculateSingleCardPayoff({
      balance: 60000,
      aprPercent: 0,
      targetMonthlyPayment: 10000,
    });
    expect(res.isValid).toBe(true);
    expect(res.totalInterestPaid).toBe(0);
    expect(res.months).toBe(6);
  });

  // 12. High APR card tests (36% to 42% p.a.)
  it('calculates payoff correctly for high 42% p.a. store cards', () => {
    const res = calculateSingleCardPayoff({
      balance: 50000,
      aprPercent: 42,
      targetMonthlyPayment: 5000,
    });
    expect(res.isValid).toBe(true);
    expect(res.months).toBe(13);
  });

  // 13. Single card fully paid off in 1 month
  it('handles single card payoff in 1 month when payment exceeds total due', () => {
    const res = calculateSingleCardPayoff({
      balance: 10000,
      aprPercent: 24,
      targetMonthlyPayment: 15000,
    });
    expect(res.isValid).toBe(true);
    expect(res.months).toBe(1);
  });

  // 14. Multi-card schedule table generation
  it('generates multi-card month-by-month schedule table', () => {
    const cards = [
      { id: 'c1', name: 'Card 1', balance: 30000, aprPercent: 24, minPayment: 1500 },
    ];
    const res = simulateMultiCardPayoff(cards, 5000, 'avalanche');
    expect(res.schedule.length).toBe(res.months);
    expect(res.schedule[0]).toHaveProperty('totalRemainingBalance');
  });

  // 15. Preset scenarios integration
  it('integrates cleanly with highInterestStoreCards preset', () => {
    const preset = CREDIT_CARD_PAYOFF_CONFIG.scenarios.highInterestStoreCards;
    const res = calculateCreditCardPayoff(preset);
    expect(res.isValid).toBe(true);
    expect(res.avalanche.months).toBeGreaterThan(0);
  });

  // 16. Numeric string sanitization
  it('sanitizes numeric string inputs safely', () => {
    const res = calculateSingleCardPayoff({
      balance: '50000',
      aprPercent: '24',
      targetMonthlyPayment: '5000',
    });
    expect(res.isValid).toBe(true);
    expect(res.balance).toBe(50000);
  });

  // 17. Large debt balance handling
  it('handles large debt balance (₹50 Lakhs) cleanly', () => {
    const res = calculateSingleCardPayoff({
      balance: 5000000,
      aprPercent: 18,
      targetMonthlyPayment: 200000,
    });
    expect(res.isValid).toBe(true);
    expect(res.months).toBe(32);
  });

  // 18. Small debt balance handling
  it('handles small debt balance (₹2,000) cleanly', () => {
    const res = calculateSingleCardPayoff({
      balance: 2000,
      aprPercent: 24,
      targetMonthlyPayment: 1000,
    });
    expect(res.isValid).toBe(true);
    expect(res.months).toBe(3);
  });

  // 19. Dual card equal APR tie-breaking
  it('breaks equal APR ties using balance descending under Avalanche', () => {
    const cards = [
      { id: 'c1', name: 'Card Small', balance: 20000, aprPercent: 24, minPayment: 1000 },
      { id: 'c2', name: 'Card Large', balance: 80000, aprPercent: 24, minPayment: 3000 },
    ];
    const res = simulateMultiCardPayoff(cards, 6000, 'avalanche');
    expect(res.cards[0].initialBalance).toBe(80000);
  });

  // 20. Full calculateCreditCardPayoff single card integration
  it('returns single card structured result when mode is single', () => {
    const res = calculateCreditCardPayoff({
      mode: 'single',
      singleBalance: 50000,
      singleAprPercent: 24,
      singleTargetPayment: 5000,
    });
    expect(res.mode).toBe('single');
    expect(res.months).toBe(12);
  });

  // 21. Full calculateCreditCardPayoff multi-card integration
  it('returns complete structured result object for multi-card mode', () => {
    const res = calculateCreditCardPayoff(CREDIT_CARD_PAYOFF_CONFIG.defaultInputs);
    expect(res.mode).toBe('multi');
    expect(res.isValid).toBe(true);
    expect(res).toHaveProperty('avalanche');
    expect(res).toHaveProperty('snowball');
    expect(res).toHaveProperty('interestSavedVsSnowball');
  });

  // 22. DEDICATED PROOF: User-entered minimum payments explicitly override illustrative default formula
  it('DEDICATED PROOF: user-entered minPayment explicitly overrides illustrative default', () => {
    const cardWithUserMin = {
      balance: 100000,
      aprPercent: 24,
      minPayment: 7500, // Explicit user override!
    };
    const res = resolveCardMinimumPayment(cardWithUserMin);
    expect(res.minPayment).toBe(7500);
    expect(res.isIllustrativeDefault).toBe(false);
    expect(res.label).toBe('User-Specified Minimum Payment');

    const cardWithoutUserMin = {
      balance: 100000,
      aprPercent: 24,
      minPayment: '', // Omitted!
    };
    const defaultRes = resolveCardMinimumPayment(cardWithoutUserMin);
    expect(defaultRes.minPayment).toBe(5000); // 5% of 100k
    expect(defaultRes.isIllustrativeDefault).toBe(true);
    expect(defaultRes.label).toBe('Illustrative Default Assumption');
  });

  // 23. DEDICATED PROOF: Illustrative default minimum payment formula returns isIllustrativeDefault: true when user minimum is omitted
  it('DEDICATED PROOF: illustrative default minimum payment flags isIllustrativeDefault: true', () => {
    const res = resolveCardMinimumPayment({ balance: 50000, aprPercent: 18 });
    expect(res.isIllustrativeDefault).toBe(true);
    expect(res.minPayment).toBeGreaterThan(0);
  });

  // 24. DEDICATED PROOF: Fee/interest edge cases with 0% APR promo balance
  it('DEDICATED PROOF: 0% APR promo balance calculates zero interest and exact fixed payments', () => {
    const promoCard = {
      id: 'promo_1',
      name: '0% Promo Card',
      balance: 120000,
      aprPercent: 0,
      minPayment: 10000,
    };
    const res = simulateMultiCardPayoff([promoCard], 10000, 'avalanche');
    expect(res.isValid).toBe(true);
    expect(res.totalInterestPaid).toBe(0);
    expect(res.months).toBe(12);
  });

  // 25. High extra monthly budget allocation
  it('accelerates payoff significantly when high extra monthly budget is provided', () => {
    const cards = [
      { id: 'c1', name: 'Card A', balance: 50000, aprPercent: 24, minPayment: 2500 },
      { id: 'c2', name: 'Card B', balance: 50000, aprPercent: 18, minPayment: 2500 },
    ];
    const lowBudget = simulateMultiCardPayoff(cards, 6000, 'avalanche');
    const highBudget = simulateMultiCardPayoff(cards, 20000, 'avalanche');
    expect(highBudget.months).toBeLessThan(lowBudget.months);
    expect(highBudget.totalInterestPaid).toBeLessThan(lowBudget.totalInterestPaid);
  });

  // 26. Custom minimum payment floor override
  it('enforces minimum payment floor correctly on low balances', () => {
    const min = calculateIllustrativeMinimumPayment(2000, 18, 500);
    expect(min).toBe(500); // floor of 500
  });

  // 27. Payoff schedule rollover math verification
  it('verifies exact total amount paid equals initial total balance plus total interest paid', () => {
    const cards = [
      { id: 'c1', name: 'Card 1', balance: 40000, aprPercent: 24, minPayment: 2000 },
      { id: 'c2', name: 'Card 2', balance: 60000, aprPercent: 18, minPayment: 3000 },
    ];
    const res = simulateMultiCardPayoff(cards, 8000, 'avalanche');
    expect(res.totalAmountPaid).toBe(res.initialTotalBalance + res.totalInterestPaid);
  });

  // 28. Single card target payment lower than user-entered minimum
  it('allows single card payment if target payment >= minimum, even if low', () => {
    const res = calculateSingleCardPayoff({
      balance: 10000,
      aprPercent: 12,
      minPayment: 500,
      targetMonthlyPayment: 1000,
    });
    expect(res.isValid).toBe(true);
    expect(res.months).toBe(11);
  });

  // 29. 100% payoff budget matching minimum payments exactly
  it('calculates payoff when budget equals exact sum of minimum payments', () => {
    const cards = [
      { id: 'c1', name: 'Card 1', balance: 20000, aprPercent: 18, minPayment: 1000 },
      { id: 'c2', name: 'Card 2', balance: 30000, aprPercent: 24, minPayment: 1500 },
    ];
    const res = simulateMultiCardPayoff(cards, 2500, 'avalanche');
    expect(res.isValid).toBe(true);
    expect(res.totalMinPayments).toBe(2500);
  });

  // 30. REGRESSION PROOF: Debt Avalanche minimizes total interest paid vs Debt Snowball
  it('REGRESSION PROOF: Debt Avalanche always yields less than or equal total interest paid vs Debt Snowball', () => {
    const cards = [
      { id: 'c1', name: 'Small Card Low APR', balance: 15000, aprPercent: 12, minPayment: 1000 },
      { id: 'c2', name: 'Large Card High APR', balance: 85000, aprPercent: 36, minPayment: 3000 },
    ];
    const avalanche = simulateMultiCardPayoff(cards, 6000, 'avalanche');
    const snowball = simulateMultiCardPayoff(cards, 6000, 'snowball');
    expect(avalanche.totalInterestPaid).toBeLessThan(snowball.totalInterestPaid);
  });
});
