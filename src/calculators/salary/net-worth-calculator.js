/**
 * Net Worth Financial Engine
 * 
 * Pure mathematical calculation engine for personal balance sheet analysis,
 * asset & liability aggregation, financial health ratios, and illustrative scenario projections.
 * 
 * Framework-decoupled, zero DOM dependency.
 */

/**
 * Default asset category classification definitions
 */
export const ASSET_CATEGORIES = {
  CASH: { id: 'cash', name: 'Cash & Bank Balances', isLiquid: true },
  EMERGENCY: { id: 'emergency', name: 'Emergency Savings', isLiquid: true },
  STOCKS_MF: { id: 'stocks_mf', name: 'Stocks & Mutual Funds', isLiquid: true },
  EPF_PPF: { id: 'epf_ppf', name: 'EPF / PPF / NPS', isLiquid: false },
  REAL_ESTATE: { id: 'real_estate', name: 'Real Estate & Property', isLiquid: false },
  VEHICLES: { id: 'vehicles', name: 'Vehicles & Automobiles', isLiquid: false },
  OTHER_ASSETS: { id: 'other_assets', name: 'Other Assets & Valuables', isLiquid: false },
};

/**
 * Default liability category classification definitions
 */
export const LIABILITY_CATEGORIES = {
  CREDIT_CARDS: { id: 'credit_cards', name: 'Credit Cards', isShortTerm: true },
  PERSONAL_LOANS: { id: 'personal_loans', name: 'Personal Loans', isShortTerm: true },
  AUTO_LOANS: { id: 'auto_loans', name: 'Auto Loans', isShortTerm: false },
  STUDENT_LOANS: { id: 'student_loans', name: 'Student / Education Loans', isShortTerm: false },
  MORTGAGES: { id: 'mortgages', name: 'Mortgages / Home Loans', isShortTerm: false },
  OTHER_LIABILITIES: { id: 'other_liabilities', name: 'Other Liabilities', isShortTerm: true },
};

/**
 * Sanitizes input numeric values.
 */
function sanitize(val, defaultVal = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? Math.max(0, num) : defaultVal;
}

/**
 * Computes core Net Worth metrics from arrays of assets and liabilities.
 * 
 * @param {Array} assets - Array of asset objects: { id, name, categoryId, value, isLiquid }
 * @param {Array} liabilities - Array of liability objects: { id, name, categoryId, balance }
 * @param {number} monthlyExpenses - Monthly essential living expenses
 * @param {Object} [projectionParams] - Optional scenario projection settings: { years, assetGrowthRate, annualSavings, annualDebtReduction }
 * @returns {Object} Net Worth calculation results
 */
export function calculateNetWorth({
  assets = [],
  liabilities = [],
  monthlyExpenses = 0,
  projectionParams = null,
} = {}) {
  const sanitizedAssets = (Array.isArray(assets) ? assets : []).map((a, i) => ({
    id: a.id || `asset_${i}`,
    name: (a.name || `Asset ${i + 1}`).trim(),
    categoryId: a.categoryId || 'other_assets',
    value: sanitize(a.value),
    isLiquid: Boolean(a.isLiquid ?? (ASSET_CATEGORIES[a.categoryId?.toUpperCase()]?.isLiquid || false)),
  }));

  const sanitizedLiabilities = (Array.isArray(liabilities) ? liabilities : []).map((l, i) => ({
    id: l.id || `liability_${i}`,
    name: (l.name || `Liability ${i + 1}`).trim(),
    categoryId: l.categoryId || 'other_liabilities',
    balance: sanitize(l.balance),
  }));

  const sanitizedExpenses = sanitize(monthlyExpenses);

  // 1. Core Totals
  const totalAssets = Math.round(sanitizedAssets.reduce((sum, a) => sum + a.value, 0));
  const totalLiabilities = Math.round(sanitizedLiabilities.reduce((sum, l) => sum + l.balance, 0));
  const netWorth = Math.round(totalAssets - totalLiabilities);

  // 2. Liquid Assets
  const liquidAssets = Math.round(
    sanitizedAssets.filter((a) => a.isLiquid).reduce((sum, a) => sum + a.value, 0)
  );

  // 3. Financial Health Ratios
  let debtToAssetRatio = 0;
  if (totalAssets > 0) {
    debtToAssetRatio = Number(((totalLiabilities / totalAssets) * 100).toFixed(1));
  } else if (totalLiabilities > 0) {
    debtToAssetRatio = 100;
  }

  let netWorthToAssetRatio = 0;
  if (totalAssets > 0) {
    netWorthToAssetRatio = Number(((netWorth / totalAssets) * 100).toFixed(1));
  }

  let liquidityCoverageMonths = 0;
  if (sanitizedExpenses > 0) {
    liquidityCoverageMonths = Number((liquidAssets / sanitizedExpenses).toFixed(1));
  }

  // 4. Asset Category Breakdown
  const assetsByCategory = {};
  sanitizedAssets.forEach((a) => {
    assetsByCategory[a.categoryId] = (assetsByCategory[a.categoryId] || 0) + a.value;
  });

  // 5. Liability Category Breakdown
  const liabilitiesByCategory = {};
  sanitizedLiabilities.forEach((l) => {
    liabilitiesByCategory[l.categoryId] = (liabilitiesByCategory[l.categoryId] || 0) + l.balance;
  });

  // 6. Optional Illustrative Scenario Projections
  let projections = null;
  if (projectionParams) {
    const horizonYears = [5, 10, 20];
    const growthRate = Math.max(-50, Math.min(100, Number(projectionParams.assetGrowthRate) || 0)) / 100;
    const annualSavings = Math.max(0, Number(projectionParams.annualSavings) || 0);
    const annualDebtReduction = Math.max(0, Number(projectionParams.annualDebtReduction) || 0);

    const scenarioPoints = horizonYears.map((years) => {
      // Compounded asset growth + accumulated annual savings contributions
      let projectedAssets = totalAssets;
      for (let y = 1; y <= years; y++) {
        projectedAssets = projectedAssets * (1 + growthRate) + annualSavings;
      }

      // Projected remaining debt (cannot drop below 0)
      const projectedLiabilities = Math.max(0, totalLiabilities - annualDebtReduction * years);
      const projectedNetWorth = Math.round(projectedAssets - projectedLiabilities);

      return {
        years,
        projectedAssets: Math.round(projectedAssets),
        projectedLiabilities: Math.round(projectedLiabilities),
        projectedNetWorth,
      };
    });

    projections = {
      growthRatePct: Number((growthRate * 100).toFixed(1)),
      annualSavings,
      annualDebtReduction,
      scenarioPoints,
    };
  }

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    liquidAssets,
    debtToAssetRatio,
    netWorthToAssetRatio,
    liquidityCoverageMonths,
    monthlyExpenses: sanitizedExpenses,
    assets: sanitizedAssets,
    liabilities: sanitizedLiabilities,
    assetsByCategory,
    liabilitiesByCategory,
    projections,
    isNegativeNetWorth: netWorth < 0,
  };
}
