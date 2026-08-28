import { describe, it, expect } from 'vitest';
import {
  calculateNetWorth,
  calculateInstantScenario,
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
  CONCENTRATION_THRESHOLDS,
} from '../net-worth-calculator.js';

describe('Net Worth Calculator Engine (Flagship #100)', () => {
  // 1-5: Core Balance Sheet & Accounting Identity
  it('1. should calculate net worth correctly for a single asset with zero liabilities', () => {
    const assets = [{ id: '1', name: 'Cash Account', categoryId: 'cash', value: 100000, isLiquid: true }];
    const res = calculateNetWorth({ assets, liabilities: [], monthlyExpenses: 20000 });

    expect(res.totals.totalAssets).toBe(100000);
    expect(res.totals.totalLiabilities).toBe(0);
    expect(res.totals.netWorth).toBe(100000);
    expect(res.totals.liquidAssets).toBe(100000);
    expect(res.ratios.debtToAssetRatio).toBe(0);
    expect(res.ratios.netWorthToAssetRatio).toBe(100);
    expect(res.ratios.emergencyReserveMonths).toBe(5.0); // 100k / 20k = 5 months
  });

  it('2. should aggregate multiple asset categories accurately', () => {
    const assets = [
      { id: 'a1', name: 'Checking Account', categoryId: 'cash', value: 25000, isLiquid: true },
      { id: 'a2', name: 'Stock Portfolio', categoryId: 'stocks_etfs', value: 75000, isLiquid: true },
      { id: 'a3', name: 'Primary Residence', categoryId: 'primary_home', value: 400000, isLiquid: false },
    ];
    const res = calculateNetWorth({ assets, liabilities: [] });

    expect(res.totals.totalAssets).toBe(500000);
    expect(res.totals.liquidAssets).toBe(100000); // 25k + 75k
    expect(res.totals.illiquidAssets).toBe(400000);
    expect(res.totals.netWorth).toBe(500000);
  });

  it('3. should calculate net worth correctly for a single liability', () => {
    const assets = [{ id: 'a1', name: 'Bank Cash', categoryId: 'cash', value: 500000, isLiquid: true }];
    const liabilities = [{ id: 'l1', name: 'Personal Loan', categoryId: 'personal_loan', balance: 200000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.totals.totalAssets).toBe(500000);
    expect(res.totals.totalLiabilities).toBe(200000);
    expect(res.totals.netWorth).toBe(300000);
    expect(res.ratios.debtToAssetRatio).toBe(40.0); // 200k / 500k = 40%
    expect(res.ratios.netWorthToAssetRatio).toBe(60.0); // 300k / 500k = 60%
  });

  it('4. should aggregate multiple liabilities accurately across short-term and long-term', () => {
    const liabilities = [
      { id: 'l1', name: 'Credit Card', categoryId: 'credit_card', balance: 5000 },
      { id: 'l2', name: 'Auto Loan', categoryId: 'auto_loan', balance: 25000 },
      { id: 'l3', name: 'Mortgage', categoryId: 'mortgage', balance: 250000 },
    ];
    const res = calculateNetWorth({ assets: [], liabilities });

    expect(res.totals.totalAssets).toBe(0);
    expect(res.totals.totalLiabilities).toBe(280000);
    expect(res.totals.shortTermLiabilities).toBe(5000);
    expect(res.totals.longTermLiabilities).toBe(275000);
    expect(res.totals.netWorth).toBe(-280000);
    expect(res.totals.isNegativeNetWorth).toBe(true);
  });

  it('5. should verify that Total Assets minus Total Liabilities strictly equals Net Worth (zero leakage)', () => {
    const assets = [
      { id: 'a1', name: 'Savings', categoryId: 'savings_cd', value: 45000 },
      { id: 'a2', name: '401k', categoryId: 'retirement', value: 130000 },
    ];
    const liabilities = [
      { id: 'l1', name: 'Student Loan', categoryId: 'student_loan', balance: 35000 },
    ];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.totals.totalAssets - res.totals.totalLiabilities).toBe(res.totals.netWorth);
    expect(res.totals.netWorth).toBe(140000);
  });

  // 6-10: Negative & Zero Net Worth Handling
  it('6. should handle zero assets and zero liabilities gracefully', () => {
    const res = calculateNetWorth({ assets: [], liabilities: [] });

    expect(res.totals.totalAssets).toBe(0);
    expect(res.totals.totalLiabilities).toBe(0);
    expect(res.totals.netWorth).toBe(0);
    expect(res.ratios.debtToAssetRatio).toBe(0);
    expect(res.totals.isNegativeNetWorth).toBe(false);
  });

  it('7. should flag negative net worth when liabilities exceed assets', () => {
    const assets = [{ id: 'a1', name: 'Cash', categoryId: 'cash', value: 10000 }];
    const liabilities = [{ id: 'l1', name: 'Debt', categoryId: 'credit_card', balance: 25000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.totals.netWorth).toBe(-15000);
    expect(res.totals.isNegativeNetWorth).toBe(true);
  });

  it('8. should handle exactly zero net worth (assets == liabilities)', () => {
    const assets = [{ id: 'a1', name: 'Cash', categoryId: 'cash', value: 50000 }];
    const liabilities = [{ id: 'l1', name: 'Loan', categoryId: 'personal_loan', balance: 50000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.totals.netWorth).toBe(0);
    expect(res.totals.isNegativeNetWorth).toBe(false);
    expect(res.ratios.debtToAssetRatio).toBe(100.0);
  });

  it('9. should sanitize negative asset and liability inputs to zero', () => {
    const assets = [{ id: 'a1', name: 'Invalid Negative Asset', categoryId: 'cash', value: -50000 }];
    const liabilities = [{ id: 'l1', name: 'Invalid Negative Debt', categoryId: 'credit_card', balance: -20000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.totals.totalAssets).toBe(0);
    expect(res.totals.totalLiabilities).toBe(0);
    expect(res.totals.netWorth).toBe(0);
  });

  it('10. should safely handle non-numeric asset and liability values', () => {
    const assets = [{ id: 'a1', name: 'Corrupt Value', categoryId: 'cash', value: 'invalid_string' }];
    const liabilities = [{ id: 'l1', name: 'NaN Value', categoryId: 'credit_card', balance: NaN }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.totals.totalAssets).toBe(0);
    expect(res.totals.totalLiabilities).toBe(0);
  });

  // 11-15: Liquidity Analysis
  it('11. should compute Liquid Assets by filtering only liquid asset classifications', () => {
    const assets = [
      { id: 'a1', name: 'Cash', categoryId: 'cash', value: 10000, isLiquid: true },
      { id: 'a2', name: 'Stocks', categoryId: 'stocks_etfs', value: 40000, isLiquid: true },
      { id: 'a3', name: 'Car', categoryId: 'vehicles', value: 20000, isLiquid: false },
      { id: 'a4', name: 'Home', categoryId: 'primary_home', value: 300000, isLiquid: false },
    ];
    const res = calculateNetWorth({ assets });

    expect(res.totals.liquidAssets).toBe(50000); // 10k + 40k
    expect(res.totals.illiquidAssets).toBe(320000); // 20k + 300k
    expect(res.ratios.liquidAssetPct).toBeCloseTo(13.5, 1);
  });

  it('12. should compute Liquid Net Worth (Liquid Assets - Short-Term Liabilities)', () => {
    const assets = [
      { id: 'a1', name: 'Checking', categoryId: 'cash', value: 20000, isLiquid: true },
      { id: 'a2', name: 'Stocks', categoryId: 'stocks_etfs', value: 50000, isLiquid: true },
      { id: 'a3', name: 'Home', categoryId: 'primary_home', value: 400000, isLiquid: false },
    ];
    const liabilities = [
      { id: 'l1', name: 'Credit Card', categoryId: 'credit_card', balance: 5000 }, // short-term
      { id: 'l2', name: 'Personal Loan', categoryId: 'personal_loan', balance: 10000 }, // short-term
      { id: 'l3', name: 'Mortgage', categoryId: 'mortgage', balance: 250000 }, // long-term
    ];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.totals.liquidAssets).toBe(70000);
    expect(res.totals.shortTermLiabilities).toBe(15000);
    expect(res.totals.liquidNetWorth).toBe(55000); // 70k - 15k
  });

  it('13. should handle negative Liquid Net Worth when short-term debts exceed liquid assets', () => {
    const assets = [{ id: 'a1', name: 'Cash', categoryId: 'cash', value: 5000, isLiquid: true }];
    const liabilities = [{ id: 'l1', name: 'Credit Card', categoryId: 'credit_card', balance: 12000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.totals.liquidNetWorth).toBe(-7000);
  });

  it('14. should distinguish pure cash reserves from broader liquid investments', () => {
    const assets = [
      { id: 'a1', name: 'Checking', categoryId: 'cash', value: 10000, isLiquid: true },
      { id: 'a2', name: 'Emergency Fund', categoryId: 'emergency', value: 15000, isLiquid: true },
      { id: 'a3', name: 'Brokerage Stocks', categoryId: 'stocks_etfs', value: 80000, isLiquid: true },
    ];
    const res = calculateNetWorth({ assets });

    expect(res.totals.cashOnlyReserves).toBe(25000); // 10k + 15k
    expect(res.totals.liquidAssets).toBe(105000);
  });

  it('15. should verify Liquid % and Illiquid % sum to 100%', () => {
    const assets = [
      { id: 'a1', name: 'Cash', categoryId: 'cash', value: 30000, isLiquid: true },
      { id: 'a2', name: 'Property', categoryId: 'primary_home', value: 70000, isLiquid: false },
    ];
    const res = calculateNetWorth({ assets });

    expect(res.ratios.liquidAssetPct + res.ratios.illiquidAssetPct).toBe(100.0);
  });

  // 16-20: Investable Net Worth & Home Equity
  it('16. should calculate Investable Assets across stocks, retirement, and crypto', () => {
    const assets = [
      { id: 'a1', name: 'Checking', categoryId: 'cash', value: 10000 },
      { id: 'a2', name: 'Stocks', categoryId: 'stocks_etfs', value: 50000 },
      { id: 'a3', name: '401k', categoryId: 'retirement', value: 100000 },
      { id: 'a4', name: 'Bitcoin', categoryId: 'crypto', value: 20000 },
      { id: 'a5', name: 'Car', categoryId: 'vehicles', value: 15000 },
    ];
    const res = calculateNetWorth({ assets });

    expect(res.totals.investableAssets).toBe(170000); // 50k + 100k + 20k
  });

  it('17. should calculate Investable Net Worth (Investable Assets - Short-Term Debt)', () => {
    const assets = [
      { id: 'a1', name: 'Stocks', categoryId: 'stocks_etfs', value: 80000 },
      { id: 'a2', name: 'Retirement', categoryId: 'retirement', value: 120000 },
    ];
    const liabilities = [
      { id: 'l1', name: 'Credit Card', categoryId: 'credit_card', balance: 5000 },
    ];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.totals.investableNetWorth).toBe(195000); // 200k - 5k
  });

  it('18. should calculate Home Equity (Real Estate Assets - Mortgage Balances)', () => {
    const assets = [
      { id: 'a1', name: 'Primary Home', categoryId: 'primary_home', value: 500000 },
      { id: 'a2', name: 'Rental Property', categoryId: 'rental_property', value: 300000 },
    ];
    const liabilities = [
      { id: 'l1', name: 'Primary Mortgage', categoryId: 'mortgage', balance: 350000 },
      { id: 'l2', name: 'Rental Mortgage', categoryId: 'mortgage', balance: 200000 },
    ];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.totals.realEstateAssets).toBe(800000);
    expect(res.totals.mortgageLiabilities).toBe(550000);
    expect(res.totals.homeEquity).toBe(250000);
  });

  it('19. should calculate negative Home Equity (underwater mortgage)', () => {
    const assets = [{ id: 'a1', name: 'Primary Home', categoryId: 'primary_home', value: 300000 }];
    const liabilities = [{ id: 'l1', name: 'Mortgage', categoryId: 'mortgage', balance: 350000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.totals.homeEquity).toBe(-50000);
  });

  it('20. should return zero Home Equity when user owns no real estate', () => {
    const assets = [{ id: 'a1', name: 'Stocks', categoryId: 'stocks_etfs', value: 100000 }];
    const res = calculateNetWorth({ assets });

    expect(res.totals.homeEquity).toBe(0);
  });

  // 21-25: Financial Health Ratios & Coverage
  it('21. should calculate Debt-to-Asset ratio accurately', () => {
    const assets = [{ id: 'a1', name: 'Assets', categoryId: 'cash', value: 200000 }];
    const liabilities = [{ id: 'l1', name: 'Liabilities', categoryId: 'personal_loan', balance: 50000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.ratios.debtToAssetRatio).toBe(25.0); // 50k / 200k = 25%
  });

  it('22. should calculate Debt-to-Net-Worth ratio when Net Worth is positive', () => {
    const assets = [{ id: 'a1', name: 'Assets', categoryId: 'cash', value: 150000 }];
    const liabilities = [{ id: 'l1', name: 'Debt', categoryId: 'personal_loan', balance: 50000 }];
    const res = calculateNetWorth({ assets, liabilities });

    // Net Worth = 100k, Debt = 50k -> Debt/NW = 50%
    expect(res.ratios.debtToNetWorthRatio).toBe(50.0);
  });

  it('23. should return null Debt-to-Net-Worth ratio when Net Worth is zero or negative', () => {
    const assets = [{ id: 'a1', name: 'Assets', categoryId: 'cash', value: 50000 }];
    const liabilities = [{ id: 'l1', name: 'Debt', categoryId: 'credit_card', balance: 80000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.ratios.debtToNetWorthRatio).toBeNull();
  });

  it('24. should compute Emergency Reserve Months based on pure cash and monthly expenses', () => {
    const assets = [
      { id: 'a1', name: 'Checking', categoryId: 'cash', value: 12000, isLiquid: true },
      { id: 'a2', name: 'Emergency Fund', categoryId: 'emergency', value: 18000, isLiquid: true },
      { id: 'a3', name: 'Stocks', categoryId: 'stocks_etfs', value: 50000, isLiquid: true },
    ];
    const res = calculateNetWorth({ assets, monthlyExpenses: 5000 });

    // Cash = 30k -> 30k / 5k = 6.0 months
    expect(res.ratios.emergencyReserveMonths).toBe(6.0);
    // Liquid = 80k -> 80k / 5k = 16.0 months
    expect(res.ratios.liquidCoverageMonths).toBe(16.0);
  });

  it('25. should return zero emergency reserve months if monthly expenses are zero or omitted', () => {
    const assets = [{ id: 'a1', name: 'Cash', categoryId: 'cash', value: 20000 }];
    const res = calculateNetWorth({ assets, monthlyExpenses: 0 });

    expect(res.ratios.emergencyReserveMonths).toBe(0.0);
  });

  // 26-30: Category Allocations
  it('26. should calculate asset category allocation percentages correctly', () => {
    const assets = [
      { id: 'a1', name: 'Cash', categoryId: 'cash', value: 20000 },
      { id: 'a2', name: 'Stocks', categoryId: 'stocks_etfs', value: 30000 },
      { id: 'a3', name: 'Home', categoryId: 'primary_home', value: 50000 },
    ];
    const res = calculateNetWorth({ assets });

    const totalPct = res.allocations.assets.reduce((sum, a) => sum + a.percentage, 0);
    expect(totalPct).toBeCloseTo(100.0, 1);
  });

  it('27. should calculate liability category allocation percentages correctly', () => {
    const liabilities = [
      { id: 'l1', name: 'Credit Card', categoryId: 'credit_card', balance: 10000 },
      { id: 'l2', name: 'Mortgage', categoryId: 'mortgage', balance: 90000 },
    ];
    const res = calculateNetWorth({ liabilities });

    const totalPct = res.allocations.liabilities.reduce((sum, l) => sum + l.percentage, 0);
    expect(totalPct).toBeCloseTo(100.0, 1);
  });

  it('28. should sort asset allocations by descending monetary amount', () => {
    const assets = [
      { id: 'a1', name: 'Small Cash', categoryId: 'cash', value: 5000 },
      { id: 'a2', name: 'Big Real Estate', categoryId: 'primary_home', value: 450000 },
      { id: 'a3', name: 'Medium Stocks', categoryId: 'stocks_etfs', value: 120000 },
    ];
    const res = calculateNetWorth({ assets });

    expect(res.allocations.assets[0].categoryId).toBe('primary_home');
    expect(res.allocations.assets[1].categoryId).toBe('stocks_etfs');
    expect(res.allocations.assets[2].categoryId).toBe('cash');
  });

  it('29. should handle empty asset allocations array when total assets are zero', () => {
    const res = calculateNetWorth({ assets: [] });
    expect(res.allocations.assets).toEqual([]);
  });

  it('30. should handle empty liability allocations array when total liabilities are zero', () => {
    const res = calculateNetWorth({ liabilities: [] });
    expect(res.allocations.liabilities).toEqual([]);
  });

  // 31-35: Wealth Concentration Risks
  it('31. should flag High Real Estate Concentration when real estate > 60% of total assets', () => {
    const assets = [
      { id: 'a1', name: 'Cash', categoryId: 'cash', value: 50000 },
      { id: 'a2', name: 'Mansion', categoryId: 'primary_home', value: 800000 }, // 800k / 850k = 94%
    ];
    const res = calculateNetWorth({ assets });

    const risk = res.concentrationRisks.find((r) => r.type === 'REAL_ESTATE_CONCENTRATION');
    expect(risk).toBeDefined();
    expect(risk.severity).toBe('MODERATE');
  });

  it('32. should flag Elevated Cryptocurrency Exposure when crypto > 15% of total assets', () => {
    const assets = [
      { id: 'a1', name: 'Stocks', categoryId: 'stocks_etfs', value: 70000 },
      { id: 'a2', name: 'Crypto', categoryId: 'crypto', value: 30000 }, // 30k / 100k = 30%
    ];
    const res = calculateNetWorth({ assets });

    const risk = res.concentrationRisks.find((r) => r.type === 'CRYPTO_CONCENTRATION');
    expect(risk).toBeDefined();
    expect(risk.severity).toBe('HIGH');
  });

  it('33. should flag Potential Cash Drag when cash > 35% of total assets on substantial balance', () => {
    const assets = [
      { id: 'a1', name: 'Cash', categoryId: 'cash', value: 200000 },
      { id: 'a2', name: 'Stocks', categoryId: 'stocks_etfs', value: 100000 }, // Cash is 66.7% of 300k
    ];
    const res = calculateNetWorth({ assets });

    const risk = res.concentrationRisks.find((r) => r.type === 'CASH_DRAG');
    expect(risk).toBeDefined();
  });

  it('34. should flag High Leverage when Debt-to-Asset ratio > 50%', () => {
    const assets = [{ id: 'a1', name: 'Home', categoryId: 'primary_home', value: 300000 }];
    const liabilities = [{ id: 'l1', name: 'Mortgage', categoryId: 'mortgage', balance: 240000 }]; // 80% DTA
    const res = calculateNetWorth({ assets, liabilities });

    const risk = res.concentrationRisks.find((r) => r.type === 'HIGH_LEVERAGE');
    expect(risk).toBeDefined();
    expect(risk.severity).toBe('HIGH');
  });

  it('35. should flag Single Asset Concentration when one asset constitutes > 40% of multi-asset sheet', () => {
    const assets = [
      { id: 'a1', name: 'Private Startup Stock', categoryId: 'stocks_etfs', value: 300000 }, // 60%
      { id: 'a2', name: 'Cash', categoryId: 'cash', value: 100000 },
      { id: 'a3', name: 'Gold', categoryId: 'precious_metals', value: 100000 },
    ];
    const res = calculateNetWorth({ assets });

    const risk = res.concentrationRisks.find((r) => r.type === 'SINGLE_ASSET_CONCENTRATION');
    expect(risk).toBeDefined();
  });

  // 36-40: Historical Snapshot Analysis
  it('36. should calculate historical net worth growth and percentage change across snapshots', () => {
    const historicalSnapshots = [
      { date: '2024-01-01', netWorth: 100000 },
      { date: '2025-01-01', netWorth: 130000 },
    ];
    const assets = [{ id: 'a1', name: 'Current', categoryId: 'cash', value: 160000 }];
    const res = calculateNetWorth({ assets, historicalSnapshots });

    expect(res.historicalTrends.snapshotsCount).toBe(2);
    expect(res.historicalTrends.earliestNetWorth).toBe(100000);
    expect(res.historicalTrends.absoluteChange).toBe(60000); // 160k - 100k
    expect(res.historicalTrends.pctChange).toBe(60.0);
  });

  it('37. should calculate annualized CAGR growth rate when history spans > 1 year', () => {
    const historicalSnapshots = [
      { date: '2023-01-01', netWorth: 100000 },
      { date: '2024-01-01', netWorth: 120000 },
      { date: '2025-01-01', netWorth: 144000 },
    ];
    const assets = [{ id: 'a1', name: 'Current', categoryId: 'cash', value: 144000 }];
    const res = calculateNetWorth({ assets, historicalSnapshots });

    expect(res.historicalTrends.annualizedGrowthPct).toBeGreaterThan(15);
  });

  it('38. should handle empty historical snapshots array gracefully', () => {
    const res = calculateNetWorth({ assets: [{ id: 'a1', name: 'Cash', categoryId: 'cash', value: 50000 }], historicalSnapshots: [] });
    expect(res.historicalTrends).toBeNull();
  });

  it('39. should sort historical snapshots chronologically by date automatically', () => {
    const historicalSnapshots = [
      { date: '2025-01-01', netWorth: 150000 },
      { date: '2023-01-01', netWorth: 100000 },
    ];
    const assets = [{ id: 'a1', name: 'Cash', categoryId: 'cash', value: 150000 }];
    const res = calculateNetWorth({ assets, historicalSnapshots });

    expect(res.historicalTrends.snapshots[0].date).toBe('2023-01-01');
    expect(res.historicalTrends.earliestNetWorth).toBe(100000);
  });

  it('40. should handle negative historical baseline net worth gracefully', () => {
    const historicalSnapshots = [
      { date: '2024-01-01', netWorth: -20000 },
    ];
    const assets = [{ id: 'a1', name: 'Cash', categoryId: 'cash', value: 10000 }];
    const res = calculateNetWorth({ assets, historicalSnapshots });

    expect(res.historicalTrends.absoluteChange).toBe(30000); // 10k - (-20k) = +30k
  });

  // 41-45: Scenario Planner & Projections
  it('41. should project multi-horizon net worth compounding and debt reduction', () => {
    const assets = [{ id: 'a1', name: 'Portfolio', categoryId: 'stocks_etfs', value: 100000 }];
    const liabilities = [{ id: 'l1', name: 'Debt', categoryId: 'personal_loan', balance: 20000 }];
    const scenarioParams = {
      assetGrowthPct: 10.0,
      annualSavings: 10000,
      annualDebtReduction: 5000,
    };
    const res = calculateNetWorth({ assets, liabilities, scenarioParams });

    expect(res.scenarioProjections).toBeDefined();
    expect(res.scenarioProjections.projectionPoints).toHaveLength(5); // 1, 3, 5, 10, 20 yrs
    const yr5 = res.scenarioProjections.projectionPoints.find((p) => p.years === 5);
    expect(yr5.projectedLiabilities).toBe(0); // 20k - (5k * 5 = 25k) -> capped at 0
    expect(yr5.projectedNetWorth).toBeGreaterThan(150000);
  });

  it('42. should calculate instant one-off balance sheet scenario adjustments (appreciation + payoff)', () => {
    const base = calculateNetWorth({
      assets: [{ id: 'a1', name: 'Home', categoryId: 'primary_home', value: 500000 }],
      liabilities: [{ id: 'l1', name: 'Mortgage', categoryId: 'mortgage', balance: 300000 }],
    });

    const scenario = calculateInstantScenario(base, {
      assetAppreciationPct: 10.0, // +50k
      debtPayoff: 50000, // -50k debt
      newInvestment: 20000,
    });

    expect(scenario.currentNetWorth).toBe(200000);
    expect(scenario.adjustedAssets).toBe(570000); // 500k + 50k + 20k
    expect(scenario.adjustedLiabilities).toBe(250000); // 300k - 50k
    expect(scenario.adjustedNetWorth).toBe(320000); // 570k - 250k
    expect(scenario.netWorthDelta).toBe(120000);
  });

  it('43. should calculate instant market drawdown scenario accurately', () => {
    const base = calculateNetWorth({
      assets: [{ id: 'a1', name: 'Stocks', categoryId: 'stocks_etfs', value: 200000 }],
      liabilities: [],
    });

    const scenario = calculateInstantScenario(base, {
      assetAppreciationPct: -25.0, // -50k drop
    });

    expect(scenario.adjustedAssets).toBe(150000);
    expect(scenario.adjustedNetWorth).toBe(150000);
    expect(scenario.netWorthDelta).toBe(-50000);
    expect(scenario.pctChange).toBe(-25.0);
  });

  it('44. should handle large balance-sheet balances with exact numerical precision', () => {
    const assets = [{ id: 'a1', name: 'Billionaire Portfolio', categoryId: 'stocks_etfs', value: 1500000000 }];
    const liabilities = [{ id: 'l1', name: 'Commercial Debt', categoryId: 'business_debt', balance: 350000000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.totals.netWorth).toBe(1150000000);
    expect(res.ratios.debtToAssetRatio).toBeCloseTo(23.3, 1);
  });

  it('45. should preserve custom user-entered asset and liability category names', () => {
    const assets = [{ id: 'a1', name: 'Rare Vintage Watch Collection', categoryId: 'precious_metals', value: 45000 }];
    const liabilities = [{ id: 'l1', name: 'Private Family Promissory Note', categoryId: 'personal_loan', balance: 15000 }];
    const res = calculateNetWorth({ assets, liabilities });

    expect(res.assets[0].name).toBe('Rare Vintage Watch Collection');
    expect(res.liabilities[0].name).toBe('Private Family Promissory Note');
    expect(res.totals.netWorth).toBe(30000);
  });
});
