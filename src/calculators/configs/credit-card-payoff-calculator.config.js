/**
 * Credit Card Payoff & Debt Avalanche Calculator Configuration Module
 * 
 * Defines metadata, input boundaries, classifications, reference bands, and illustrative valuation presets.
 */

export const CREDIT_CARD_PAYOFF_CONFIG = {
  metadata: {
    title: 'Credit Card Payoff & Debt Avalanche Calculator',
    slug: 'credit-card-payoff-calculator',
    category: 'credit',
    categoryName: 'Credit & Debt Calculators',
    lastUpdated: '2026-08-09',
    financialAuthority: 'Consumer Financial Protection & Debt Acceleration Advisory Standard',
    disclosure: 'Illustrative minimum payment defaults are estimated modeling assumptions. Actual minimum payments, fees, interest compounding, and promotional terms depend on your specific card issuer agreement, regulations, and monthly statement.',
  },

  financialMethodology: 'Debt Avalanche orders credit card debts by Annual Percentage Rate (APR %) in descending order, allocating extra monthly budget to the highest interest card first while maintaining required minimum payments on remaining cards.',

  defaultInputs: {
    mode: 'multi', // 'single' | 'multi'
    singleBalance: 100000,
    singleAprPercent: 36,
    singleMinPayment: '', // User-entered override (blank for illustrative default)
    singleTargetPayment: 5000,
    monthlyPayoffBudget: 12000,
    cards: [
      { id: 'card_1', name: 'Premium Store Card', balance: 50000, aprPercent: 36, minPayment: 2500 },
      { id: 'card_2', name: 'Rewards Credit Card', balance: 120000, aprPercent: 24, minPayment: 4000 },
      { id: 'card_3', name: 'Low-Rate Cash Credit Card', balance: 80000, aprPercent: 18, minPayment: 2500 },
    ],
  },

  scenarios: {
    highInterestStoreCards: {
      id: 'highInterestStoreCards',
      title: 'High-Interest Retail & Store Cards',
      description: 'Multiple high-APR (24%–36% p.a.) retail store cards with urgent high-interest elimination.',
      mode: 'multi',
      monthlyPayoffBudget: 15000,
      cards: [
        { id: 'card_1', name: 'Department Store Card', balance: 40000, aprPercent: 36, minPayment: 2000 },
        { id: 'card_2', name: 'Electronics Store Card', balance: 75000, aprPercent: 30, minPayment: 3000 },
        { id: 'card_3', name: 'General Credit Card', balance: 110000, aprPercent: 24, minPayment: 4000 },
      ],
    },
    singleHeavyBalanceCard: {
      id: 'singleHeavyBalanceCard',
      title: 'Single Heavy Credit Card Balance',
      description: 'Single large credit card balance (₹2,00,000) evaluated at 28% APR with fixed monthly target payment.',
      mode: 'single',
      singleBalance: 200000,
      singleAprPercent: 28,
      singleMinPayment: 6000,
      singleTargetPayment: 10000,
      monthlyPayoffBudget: 10000,
      cards: [],
    },
    balancedMultiCardDebt: {
      id: 'balancedMultiCardDebt',
      title: 'Balanced Multi-Card Household Debt',
      description: 'Balanced mix of three household credit cards comparing Debt Avalanche vs Debt Snowball.',
      mode: 'multi',
      monthlyPayoffBudget: 18000,
      cards: [
        { id: 'card_1', name: 'Travel Platinum Card', balance: 150000, aprPercent: 30, minPayment: 5000 },
        { id: 'card_2', name: 'Fuel Cash Card', balance: 35000, aprPercent: 22, minPayment: 1500 },
        { id: 'card_3', name: 'Online Shopping Card', balance: 90000, aprPercent: 26, minPayment: 3000 },
      ],
    },
    acceleratedPayoffGoal: {
      id: 'acceleratedPayoffGoal',
      title: 'Aggressive 12-Month Debt Freedom',
      description: 'High monthly payment budget allocated to wipe out credit card debt rapidly.',
      mode: 'multi',
      monthlyPayoffBudget: 30000,
      cards: [
        { id: 'card_1', name: 'Card A (High APR)', balance: 80000, aprPercent: 32, minPayment: 3000 },
        { id: 'card_2', name: 'Card B (Medium APR)', balance: 120000, aprPercent: 24, minPayment: 4000 },
      ],
    },
  },

  fieldLimits: {
    singleBalance: { min: 0, max: 10000000, step: 5000, label: 'Current Card Balance (₹ / $)' },
    singleAprPercent: { min: 0, max: 60, step: 0.5, label: 'Annual Percentage Rate (APR % p.a.)' },
    singleMinPayment: { min: 0, max: 1000000, step: 500, label: 'Monthly Minimum Payment (₹ / $)' },
    singleTargetPayment: { min: 0, max: 1000000, step: 500, label: 'Fixed Target Monthly Payment (₹ / $)' },
    monthlyPayoffBudget: { min: 0, max: 10000000, step: 1000, label: 'Total Monthly Payoff Budget (₹ / $)' },
  },
};
