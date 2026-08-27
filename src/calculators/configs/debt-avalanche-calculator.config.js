/**
 * Configuration module for Debt Avalanche Calculator (Highest Interest Rate First)
 */

export const DEBT_AVALANCHE_CONFIG = {
  meta: {
    title: 'Debt Avalanche Calculator (Highest Interest Rate First)',
    description: 'Model the Debt Avalanche repayment strategy by targeting your highest APR debts first. Calculate total interest saved, debt-free timeline, and compare vs Debt Snowball.',
    category: 'credit',
    categoryName: 'Credit & Debt Calculators',
    slug: 'debt-avalanche-calculator',
    route: '/tools/credit/debt-avalanche-calculator',
  },

  defaultInputs: {
    extraMonthlyPayment: 5000,
    debts: [
      { id: 'd1', name: 'High-APR Credit Card A', balance: 150000, annualRate: 42, minPayment: 4500 },
      { id: 'd2', name: 'Store Credit Card B', balance: 75000, annualRate: 36, minPayment: 2500 },
      { id: 'd3', name: 'Personal Loan C', balance: 300000, annualRate: 14, minPayment: 8000 },
      { id: 'd4', name: 'Auto Loan D', balance: 400000, annualRate: 9.5, minPayment: 9500 },
    ],
  },

  fieldBoundaries: {
    extraMonthlyPayment: { min: 0, max: 500000, step: 500 },
    balance: { min: 1000, max: 50000000, step: 5000 },
    annualRate: { min: 0, max: 60, step: 0.5 },
    minPayment: { min: 100, max: 500000, step: 500 },
  },

  disclaimers: {
    educationalNotice: 'This calculator models mathematical debt elimination schedules based on user-entered balance, APR, and minimum payment inputs. Actual issuer payment processing, daily compound conventions, and fees may vary.',
    strategyNotice: 'Debt Avalanche prioritizes highest interest rates (APR %) to minimize total interest paid. Debt Snowball prioritizes lowest balances for psychological momentum. Choose the strategy that best suits your financial plan.',
  },

  scenarios: {
    creditCardTrap: {
      title: 'High Interest Credit Card Trap',
      description: 'Three high-interest credit card balances total ₹2.55 Lakhs with interest rates between 36% and 42%.',
      extraMonthlyPayment: 6000,
      debts: [
        { id: 'cc1', name: 'Premium Rewards Card', balance: 120000, annualRate: 42, minPayment: 3600 },
        { id: 'cc2', name: 'Shopping Credit Card', balance: 85000, annualRate: 38, minPayment: 2550 },
        { id: 'cc3', name: 'Fuel Credit Card', balance: 50000, annualRate: 36, minPayment: 1500 },
      ],
    },
    postGradMix: {
      title: 'Post-Graduate Mixed Loans',
      description: 'Combination of high-interest credit card debt, personal loan, and education loan.',
      extraMonthlyPayment: 7500,
      debts: [
        { id: 'pg1', name: 'Travel Credit Card', balance: 90000, annualRate: 40, minPayment: 2700 },
        { id: 'pg2', name: 'Unsecured Personal Loan', balance: 250000, annualRate: 15, minPayment: 6800 },
        { id: 'pg3', name: 'Higher Education Loan', balance: 400000, annualRate: 9.0, minPayment: 5200 },
      ],
    },
    highInterestCleanout: {
      title: 'Aggressive High Interest Cleanout',
      description: 'Four mixed debts with an aggressive ₹10,000 monthly extra payment to eliminate 42% credit card interest.',
      extraMonthlyPayment: 10000,
      debts: [
        { id: 'hc1', name: 'Card 1 (42% APR)', balance: 180000, annualRate: 42, minPayment: 5400 },
        { id: 'hc2', name: 'Card 2 (36% APR)', balance: 110000, annualRate: 36, minPayment: 3300 },
        { id: 'hc3', name: 'Personal Loan (13.5% APR)', balance: 350000, annualRate: 13.5, minPayment: 9000 },
        { id: 'hc4', name: 'Car Loan (9% APR)', balance: 500000, annualRate: 9.0, minPayment: 11500 },
      ],
    },
    moderateConsolidation: {
      title: 'Moderate Debt Elimination',
      description: 'Balanced portfolio of car loan, personal loan, and 2 credit cards evaluating avalanche savings.',
      extraMonthlyPayment: 4000,
      debts: [
        { id: 'mc1', name: 'Card A (39% APR)', balance: 65000, annualRate: 39, minPayment: 2000 },
        { id: 'mc2', name: 'Card B (34% APR)', balance: 95000, annualRate: 34, minPayment: 2850 },
        { id: 'mc3', name: 'Personal Loan (14% APR)', balance: 200000, annualRate: 14, minPayment: 5500 },
      ],
    },
  },
};
