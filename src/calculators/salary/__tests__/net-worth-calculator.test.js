import { describe, it, expect } from 'vitest';
import { calculateNetWorth } from '../net-worth-calculator.js';
import { NET_WORTH_CONFIG } from '../../configs/net-worth-calculator.config.js';

describe('Net Worth Financial Engine', () => {

  // 1. Single Asset Test
  it('calculates net worth correctly for a single asset with zero liabilities', () => {
    const assets = [{ id: '1', name: 'Cash', categoryId: 'cash', value: 100000, isLiquid: true }];
    const res = calculateNetWorth({ assets, liabilities: [], monthlyExpenses: 20000 });

    expect(res.totalAssets).toBe(100000);
    expect(res.totalLiabilities).toBe(0);
    expect(res.netWorth).toBe(100000);
    expect(res.liquidAssets).toBe(100000);
    expect(res.debtToAssetRatio).toBe(0);
    expect(res.netWorthToAssetRatio).toBe(100);
    expect(res.liquidityCoverageMonths).toBe(5.0); // 100k / 20k = 5 months
  });

  // 2. Multiple Assets Test
  it('aggregates multiple asset categories correctly', () => {
    const assets = [
      { id: 'a1', name: 'Bank Account', categoryId: 'cash', value: 200000, isLiquid: true },
      { id: 'a2', name: 'Mutual Funds', categoryId: 'stocks_mf', value: 500000, isLiquid: true },
      { id: 'a3', name: 'Property', categoryId: 'real_estate', value: 4000000, isLiquid: false },
    ];
    const res = calculateNetWorth({ assets, liabilities: [] });

    expect(res.totalAssets).toBe(4700000);
    expect(res.liquidAssets).toBe(700000); // 200k + 500k
    expect(res.assetsByCategory.cash).toBe(200000);
    expect(res.assetsByCategory.real_estate).toBe(4000000);
  });

  // 3. Single Liability Test
  it('calculates net worth correctly for a single liability', () => {
    const assets = [{ id: 'a1', name: 'Cash', categoryId: 'cash', value: 500000, isLiquid: true }];
    const liabilities = [{ id: 'l1', name: 'Personal Loan', categoryId: 'personal_loans', balance: 200000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.totalAssets).toBe(500000);
    expect(res.totalLiabilities).toBe(200000);
    expect(res.netWorth).toBe(300000);
    expect(res.debtToAssetRatio).toBe(40.0); // 200k / 500k = 40%
    expect(res.netWorthToAssetRatio).toBe(60.0); // 300k / 500k = 60%
  });

  // 4. Multiple Liabilities Test
  it('aggregates multiple liability categories correctly', () => {
    const liabilities = [
      { id: 'l1', name: 'Credit Card', categoryId: 'credit_cards', balance: 50000 },
      { id: 'l2', name: 'Car Loan', categoryId: 'auto_loans', balance: 300000 },
      { id: 'l3', name: 'Home Loan', categoryId: 'mortgages', balance: 2500000 },
    ];
    const res = calculateNetWorth({ assets: [], liabilities });

    expect(res.totalAssets).toBe(0);
    expect(res.totalLiabilities).toBe(2850000);
    expect(res.netWorth).toBe(-2850000);
    expect(res.isNegativeNetWorth).toBe(true);
    expect(res.debtToAssetRatio).toBe(100);
  });

  // 5. Positive Net Worth Test
  it('handles positive net worth portfolio cleanly', () => {
    const assets = [{ id: 'a1', name: 'Stock Portfolio', categoryId: 'stocks_mf', value: 1000000, isLiquid: true }];
    const liabilities = [{ id: 'l1', name: 'Loan', categoryId: 'personal_loans', balance: 200000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.netWorth).toBe(800000);
    expect(res.isNegativeNetWorth).toBe(false);
  });

  // 6. Zero Net Worth Test (Assets = Liabilities)
  it('calculates zero net worth correctly when assets equal liabilities', () => {
    const assets = [{ id: 'a1', name: 'House', categoryId: 'real_estate', value: 5000000, isLiquid: false }];
    const liabilities = [{ id: 'l1', name: 'Mortgage', categoryId: 'mortgages', balance: 5000000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.totalAssets).toBe(5000000);
    expect(res.totalLiabilities).toBe(5000000);
    expect(res.netWorth).toBe(0);
    expect(res.debtToAssetRatio).toBe(100.0);
    expect(res.netWorthToAssetRatio).toBe(0.0);
    expect(res.isNegativeNetWorth).toBe(false);
  });

  // 7. Negative Net Worth Test (Liabilities > Assets)
  it('calculates negative net worth correctly when liabilities exceed assets', () => {
    const assets = [{ id: 'a1', name: 'Cash', categoryId: 'cash', value: 100000, isLiquid: true }];
    const liabilities = [{ id: 'l1', name: 'Loans', categoryId: 'personal_loans', balance: 400000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.netWorth).toBe(-300000);
    expect(res.isNegativeNetWorth).toBe(true);
    expect(res.debtToAssetRatio).toBe(400.0); // 400k / 100k = 400%
  });

  // 8. Zero Assets Test
  it('handles zero assets safely without runtime crashes', () => {
    const res = calculateNetWorth({ assets: [], liabilities: [], monthlyExpenses: 30000 });

    expect(res.totalAssets).toBe(0);
    expect(res.totalLiabilities).toBe(0);
    expect(res.netWorth).toBe(0);
    expect(res.debtToAssetRatio).toBe(0);
    expect(res.liquidityCoverageMonths).toBe(0);
  });

  // 9. Zero Liabilities Test
  it('handles zero liabilities correctly', () => {
    const assets = [{ id: 'a1', name: 'EPF', categoryId: 'epf_ppf', value: 800000, isLiquid: false }];
    const res = calculateNetWorth({ assets, liabilities: [] });

    expect(res.totalLiabilities).toBe(0);
    expect(res.netWorth).toBe(800000);
    expect(res.debtToAssetRatio).toBe(0);
    expect(res.netWorthToAssetRatio).toBe(100);
  });

  // 10. Debt-to-Asset Ratio Accuracy Test
  it('computes debt-to-asset ratio accurately', () => {
    const assets = [{ id: 'a1', name: 'Assets', categoryId: 'stocks_mf', value: 1000000, isLiquid: true }];
    const liabilities = [{ id: 'l1', name: 'Debt', categoryId: 'personal_loans', balance: 250000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.debtToAssetRatio).toBe(25.0);
  });

  // 11. Net-Worth-to-Asset Ratio Accuracy Test
  it('computes net-worth-to-asset ratio accurately', () => {
    const assets = [{ id: 'a1', name: 'Assets', categoryId: 'stocks_mf', value: 1000000, isLiquid: true }];
    const liabilities = [{ id: 'l1', name: 'Debt', categoryId: 'personal_loans', balance: 250000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.netWorthToAssetRatio).toBe(75.0);
  });

  // 12. Liquid Assets Filtering Test
  it('distinguishes liquid assets from illiquid real estate and vehicles', () => {
    const assets = [
      { id: '1', name: 'Bank Balance', categoryId: 'cash', value: 150000, isLiquid: true },
      { id: '2', name: 'Stocks', categoryId: 'stocks_mf', value: 350000, isLiquid: true },
      { id: '3', name: 'Apartment', categoryId: 'real_estate', value: 5000000, isLiquid: false },
      { id: '4', name: 'Car', categoryId: 'vehicles', value: 400000, isLiquid: false },
    ];

    const res = calculateNetWorth({ assets });
    expect(res.totalAssets).toBe(5900000);
    expect(res.liquidAssets).toBe(500000); // 150k + 350k
  });

  // 13. Liquidity Coverage Months Test
  it('calculates liquidity coverage months based on monthly expenses', () => {
    const assets = [{ id: '1', name: 'Liquid Cash', categoryId: 'cash', value: 300000, isLiquid: true }];
    const res = calculateNetWorth({ assets, monthlyExpenses: 50000 });

    expect(res.liquidityCoverageMonths).toBe(6.0); // 300k / 50k = 6 months
  });

  // 14. Zero Monthly Expenses Division-by-Zero Test
  it('handles zero monthly expenses safely without producing Infinity or NaN', () => {
    const assets = [{ id: '1', name: 'Liquid Cash', categoryId: 'cash', value: 200000, isLiquid: true }];
    const res = calculateNetWorth({ assets, monthlyExpenses: 0 });

    expect(res.liquidityCoverageMonths).toBe(0);
    expect(Number.isFinite(res.liquidityCoverageMonths)).toBe(true);
  });

  // 15. Invalid Negative Input Sanitization Test
  it('sanitizes negative values to zero', () => {
    const assets = [{ id: '1', name: 'Bad Asset', categoryId: 'cash', value: -50000, isLiquid: true }];
    const liabilities = [{ id: 'l1', name: 'Bad Liability', categoryId: 'credit_cards', balance: -20000 }];
    const res = calculateNetWorth({ assets, liabilities, monthlyExpenses: -10000 });

    expect(res.totalAssets).toBe(0);
    expect(res.totalLiabilities).toBe(0);
    expect(res.monthlyExpenses).toBe(0);
  });

  // 16. Numeric Input Sanitization Test
  it('sanitizes string numbers and non-numeric NaN values cleanly', () => {
    const assets = [
      { id: '1', name: 'String Value', categoryId: 'cash', value: '150000', isLiquid: true },
      { id: '2', name: 'NaN Value', categoryId: 'stocks_mf', value: NaN, isLiquid: true },
    ];
    const res = calculateNetWorth({ assets });

    expect(res.totalAssets).toBe(150000);
  });

  // 17. Very Large Values (Jumbo Net Worth) Test
  it('handles large INR currency values (e.g. ₹10 Crores+) without numeric overflow', () => {
    const assets = [
      { id: '1', name: 'Commercial Property', categoryId: 'real_estate', value: 80000000, isLiquid: false },
      { id: '2', name: 'Equity Portfolio', categoryId: 'stocks_mf', value: 30000000, isLiquid: true },
    ];
    const liabilities = [{ id: 'l1', name: 'Commercial Loan', categoryId: 'mortgages', balance: 25000000 }];

    const res = calculateNetWorth({ assets, liabilities });
    expect(res.totalAssets).toBe(110000000);
    expect(res.totalLiabilities).toBe(25000000);
    expect(res.netWorth).toBe(85000000); // 8.5 Crores
  });

  // 18. Preset Integration Test
  it('integrates cleanly with preset scenario default portfolios', () => {
    const preset = NET_WORTH_CONFIG.scenarios.midCareerFamily;
    const res = calculateNetWorth({
      assets: preset.assets,
      liabilities: preset.liabilities,
      monthlyExpenses: preset.monthlyExpenses,
    });

    expect(res.totalAssets).toBeGreaterThan(9000000);
    expect(res.totalLiabilities).toBeGreaterThan(3000000);
    expect(res.netWorth).toBeGreaterThan(5000000);
    expect(res.liquidityCoverageMonths).toBeGreaterThan(0);
  });

  // 19. Scenario Projections with Zero Growth Test
  it('computes 5, 10, 20-year scenario projections accurately with zero growth and zero debt reduction', () => {
    const assets = [{ id: 'a1', name: 'Cash', categoryId: 'cash', value: 1000000, isLiquid: true }];
    const liabilities = [{ id: 'l1', name: 'Loan', categoryId: 'personal_loans', balance: 200000 }];

    const projectionParams = { assetGrowthRate: 0, annualSavings: 0, annualDebtReduction: 0 };
    const res = calculateNetWorth({ assets, liabilities, projectionParams });

    expect(res.projections).not.toBeNull();
    expect(res.projections.scenarioPoints.length).toBe(3); // 5, 10, 20 years
    expect(res.projections.scenarioPoints[0].projectedNetWorth).toBe(800000); // 1M - 200k
    expect(res.projections.scenarioPoints[2].projectedNetWorth).toBe(800000);
  });

  // 20. Scenario Projections with Positive Growth and Annual Contributions Test
  it('computes scenario projections with positive asset growth and annual contributions', () => {
    const assets = [{ id: 'a1', name: 'Investments', categoryId: 'stocks_mf', value: 1000000, isLiquid: true }];
    const liabilities = [{ id: 'l1', name: 'Loan', categoryId: 'personal_loans', balance: 200000 }];

    const projectionParams = { assetGrowthRate: 10, annualSavings: 100000, annualDebtReduction: 40000 };
    const res = calculateNetWorth({ assets, liabilities, projectionParams });

    const p5 = res.projections.scenarioPoints.find((p) => p.years === 5);
    expect(p5.projectedAssets).toBeGreaterThan(1000000);
    expect(p5.projectedLiabilities).toBe(0); // 200k - (40k * 5) = 0
    expect(p5.projectedNetWorth).toBeGreaterThan(1500000);
  });

  // 21. Empty Input Arrays Safety Test
  it('handles null or undefined input arguments gracefully', () => {
    const res = calculateNetWorth();

    expect(res.totalAssets).toBe(0);
    expect(res.totalLiabilities).toBe(0);
    expect(res.netWorth).toBe(0);
    expect(res.projections).toBeNull();
  });
});
