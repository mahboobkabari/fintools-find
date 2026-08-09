/**
 * Illustrative Investment Benchmark Rates & Assumptions (FY 2025-26)
 * Note: These are illustrative reference benchmarks for portfolio comparison purposes,
 * not guaranteed historical performance facts or investment guarantees.
 */

export const INDIAN_INVESTMENT_BENCHMARKS = {
  nifty50: {
    id: 'nifty50',
    name: 'Broad Market Index (e.g. Nifty 50)',
    annualRate: 12.0,
    category: 'Equity',
    description: 'Illustrative long-term broad equity market benchmark (~12% p.a.).',
    disclaimer: 'Illustrative benchmark assumption (not a guaranteed rate).',
  },
  fixedDeposit: {
    id: 'fixedDeposit',
    name: 'Fixed Deposit (Bank FD)',
    annualRate: 7.0,
    category: 'Fixed Income',
    description: 'Illustrative bank fixed deposit compounding return (~7% p.a.).',
    disclaimer: 'Illustrative benchmark assumption (subject to prevailing bank interest rates).',
  },
  gold: {
    id: 'gold',
    name: 'Sovereign Gold / Physical Gold',
    annualRate: 9.0,
    category: 'Precious Metals',
    description: 'Illustrative long-term gold annual appreciation benchmark (~9% p.a.).',
    disclaimer: 'Illustrative benchmark assumption.',
  },
  longTermEquity: {
    id: 'longTermEquity',
    name: 'Long-Term Diversified Equity',
    annualRate: 14.5,
    category: 'Active Equity',
    description: 'Illustrative active equity fund portfolio benchmark (~14.5% p.a.).',
    disclaimer: 'Illustrative benchmark assumption.',
  },
  realEstate: {
    id: 'realEstate',
    name: 'Residential Real Estate',
    annualRate: 10.0,
    category: 'Real Estate',
    description: 'Illustrative long-term property value appreciation benchmark (~10% p.a.).',
    disclaimer: 'Illustrative benchmark assumption.',
  },
  inflationRate: {
    id: 'inflationRate',
    name: 'Consumer Inflation (CPI)',
    annualRate: 6.0,
    category: 'Economic Metric',
    description: 'Standard estimated annual cost-of-living inflation (~6% p.a.).',
    disclaimer: 'Illustrative benchmark assumption.',
  },
};
