/**
 * Comprehensive Net Worth, Balance Sheet & Wealth Analytics Engine.
 * Pure deterministic mathematical calculation functions for personal asset/liability aggregation,
 * liquidity analysis, investable net worth, home equity, debt burden ratios, wealth concentration,
 * historical trend analysis, and multi-horizon scenario planning.
 *
 * Zero DOM dependency, zero external side-effects.
 */

export const ASSET_CATEGORIES = {
  CASH: { id: 'cash', name: 'Cash & Checking Accounts', isLiquid: true, group: 'liquid' },
  SAVINGS_CD: { id: 'savings_cd', name: 'Savings Accounts & CDs', isLiquid: true, group: 'liquid' },
  EMERGENCY: { id: 'emergency', name: 'Emergency Fund', isLiquid: true, group: 'liquid' },
  STOCKS_ETFS: { id: 'stocks_etfs', name: 'Stocks, Mutual Funds & ETFs', isLiquid: true, isInvestable: true, group: 'investment' },
  BONDS: { id: 'bonds', name: 'Bonds & Fixed Income', isLiquid: true, isInvestable: true, group: 'investment' },
  RETIREMENT: { id: 'retirement', name: 'Retirement (401k, IRA, EPF, Super)', isLiquid: false, isInvestable: true, group: 'investment' },
  CRYPTO: { id: 'crypto', name: 'Cryptocurrency & Digital Assets', isLiquid: true, isInvestable: true, group: 'investment' },
  PRIMARY_HOME: { id: 'primary_home', name: 'Primary Residence (Home)', isLiquid: false, isRealEstate: true, group: 'real_estate' },
  RENTAL_PROPERTY: { id: 'rental_property', name: 'Rental & Commercial Property', isLiquid: false, isRealEstate: true, group: 'real_estate' },
  VEHICLES: { id: 'vehicles', name: 'Vehicles & Automobiles', isLiquid: false, group: 'personal' },
  BUSINESS_EQUITY: { id: 'business_equity', name: 'Business Ownership & Private Equity', isLiquid: false, group: 'business' },
  PRECIOUS_METALS: { id: 'precious_metals', name: 'Precious Metals & Valuables', isLiquid: false, group: 'personal' },
  OTHER_ASSETS: { id: 'other_assets', name: 'Other Assets', isLiquid: false, group: 'personal' },
};

export const LIABILITY_CATEGORIES = {
  MORTGAGE: { id: 'mortgage', name: 'Mortgage / Home Loan', isShortTerm: false, isRealEstate: true },
  AUTO_LOAN: { id: 'auto_loan', name: 'Auto / Vehicle Loan', isShortTerm: false },
  STUDENT_LOAN: { id: 'student_loan', name: 'Student / Education Loan', isShortTerm: false },
  CREDIT_CARD: { id: 'credit_card', name: 'Credit Card Balances', isShortTerm: true },
  PERSONAL_LOAN: { id: 'personal_loan', name: 'Personal Loan', isShortTerm: true },
  MEDICAL_DEBT: { id: 'medical_debt', name: 'Medical Debt', isShortTerm: true },
  BUSINESS_DEBT: { id: 'business_debt', name: 'Business Debt & Commercial Loans', isShortTerm: false },
  OTHER_LIABILITY: { id: 'other_liability', name: 'Other Liabilities', isShortTerm: true },
};

export const CONCENTRATION_THRESHOLDS = {
  REAL_ESTATE_HIGH_PCT: 60.0,
  CRYPTO_HIGH_PCT: 15.0,
  SINGLE_ASSET_HIGH_PCT: 40.0,
  CASH_HIGH_PCT: 35.0,
  DEBT_TO_ASSET_WARNING_PCT: 50.0,
};

function sanitizeNumber(val, defaultVal = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? Math.max(0, num) : defaultVal;
}

/**
 * Calculates complete net worth metrics, liquidity breakdowns, ratios, and concentration risks.
 *
 * @param {Object} params
 * @param {Array} params.assets - Array of asset objects
 * @param {Array} params.liabilities - Array of liability objects
 * @param {number} [params.monthlyExpenses=0] - Monthly essential living expenses
 * @param {Array} [params.historicalSnapshots=[]] - Optional historical balance sheet points
 * @param {Object} [params.scenarioParams=null] - Optional scenario modeling settings
 * @returns {Object} Structured net worth intelligence object
 */
export function calculateNetWorth({
  assets = [],
  liabilities = [],
  monthlyExpenses = 0,
  historicalSnapshots = [],
  scenarioParams = null,
} = {}) {
  // 1. Sanitize & Normalize Assets
  const sanitizedAssets = (Array.isArray(assets) ? assets : []).map((a, i) => {
    const catId = a.categoryId || 'other_assets';
    const catDef = ASSET_CATEGORIES[catId.toUpperCase()] || ASSET_CATEGORIES.OTHER_ASSETS;
    const isLiquid = a.isLiquid !== undefined ? Boolean(a.isLiquid) : catDef.isLiquid;
    const isInvestable = catDef.isInvestable || false;
    const isRealEstate = catDef.isRealEstate || false;

    return {
      id: a.id || `asset_${i}`,
      name: (a.name || `Asset ${i + 1}`).trim(),
      categoryId: catId,
      group: catDef.group || 'personal',
      value: sanitizeNumber(a.value),
      isLiquid,
      isInvestable,
      isRealEstate,
    };
  });

  // 2. Sanitize & Normalize Liabilities
  const sanitizedLiabilities = (Array.isArray(liabilities) ? liabilities : []).map((l, i) => {
    const catId = l.categoryId || 'other_liability';
    const catDef = LIABILITY_CATEGORIES[catId.toUpperCase()] || LIABILITY_CATEGORIES.OTHER_LIABILITY;
    const isShortTerm = catDef.isShortTerm || false;
    const isRealEstate = catDef.isRealEstate || false;

    return {
      id: l.id || `liability_${i}`,
      name: (l.name || `Liability ${i + 1}`).trim(),
      categoryId: catId,
      balance: sanitizeNumber(l.balance),
      isShortTerm,
      isRealEstate,
    };
  });

  const sanitizedExpenses = sanitizeNumber(monthlyExpenses);

  // 3. Core Totals & Accounting Identity
  const totalAssets = Math.round(sanitizedAssets.reduce((sum, a) => sum + a.value, 0));
  const totalLiabilities = Math.round(sanitizedLiabilities.reduce((sum, l) => sum + l.balance, 0));
  const netWorth = Math.round(totalAssets - totalLiabilities);

  // 4. Liquidity & Category Subtotals
  const liquidAssets = Math.round(
    sanitizedAssets.filter((a) => a.isLiquid).reduce((sum, a) => sum + a.value, 0)
  );
  const illiquidAssets = Math.max(0, totalAssets - liquidAssets);

  const shortTermLiabilities = Math.round(
    sanitizedLiabilities.filter((l) => l.isShortTerm).reduce((sum, l) => sum + l.balance, 0)
  );
  const longTermLiabilities = Math.max(0, totalLiabilities - shortTermLiabilities);

  const liquidNetWorth = Math.round(liquidAssets - shortTermLiabilities);

  // 5. Investable Net Worth
  const investableAssets = Math.round(
    sanitizedAssets.filter((a) => a.isInvestable).reduce((sum, a) => sum + a.value, 0)
  );
  const investableNetWorth = Math.round(investableAssets - shortTermLiabilities);

  // 6. Real Estate & Home Equity
  const realEstateAssets = Math.round(
    sanitizedAssets.filter((a) => a.isRealEstate).reduce((sum, a) => sum + a.value, 0)
  );
  const mortgageLiabilities = Math.round(
    sanitizedLiabilities.filter((l) => l.isRealEstate).reduce((sum, l) => sum + l.balance, 0)
  );
  const homeEquity = Math.round(realEstateAssets - mortgageLiabilities);

  // 7. Cash-Only Reserves (Pure Cash & Emergency Savings)
  const cashOnlyReserves = Math.round(
    sanitizedAssets
      .filter((a) => a.categoryId === 'cash' || a.categoryId === 'emergency' || a.categoryId === 'savings_cd')
      .reduce((sum, a) => sum + a.value, 0)
  );

  // 8. Financial Health Ratios
  const debtToAssetRatio = totalAssets > 0 ? Number(((totalLiabilities / totalAssets) * 100).toFixed(1)) : totalLiabilities > 0 ? 100.0 : 0.0;
  const debtToNetWorthRatio = netWorth > 0 ? Number(((totalLiabilities / netWorth) * 100).toFixed(1)) : null;
  const netWorthToAssetRatio = totalAssets > 0 ? Number(((netWorth / totalAssets) * 100).toFixed(1)) : 0.0;
  const liquidAssetPct = totalAssets > 0 ? Number(((liquidAssets / totalAssets) * 100).toFixed(1)) : 0.0;
  const illiquidAssetPct = totalAssets > 0 ? Number(((illiquidAssets / totalAssets) * 100).toFixed(1)) : 0.0;

  // Emergency Coverage
  const emergencyReserveMonths = sanitizedExpenses > 0 ? Number((cashOnlyReserves / sanitizedExpenses).toFixed(1)) : 0.0;
  const liquidCoverageMonths = sanitizedExpenses > 0 ? Number((liquidAssets / sanitizedExpenses).toFixed(1)) : 0.0;

  // 9. Allocations by Category
  const assetsByCategory = {};
  sanitizedAssets.forEach((a) => {
    assetsByCategory[a.categoryId] = (assetsByCategory[a.categoryId] || 0) + a.value;
  });

  const assetAllocation = Object.entries(assetsByCategory).map(([catId, amount]) => ({
    categoryId: catId,
    categoryName: ASSET_CATEGORIES[catId.toUpperCase()]?.name || catId,
    amount: Math.round(amount),
    percentage: totalAssets > 0 ? Number(((amount / totalAssets) * 100).toFixed(1)) : 0.0,
  })).sort((a, b) => b.amount - a.amount);

  const liabilitiesByCategory = {};
  sanitizedLiabilities.forEach((l) => {
    liabilitiesByCategory[l.categoryId] = (liabilitiesByCategory[l.categoryId] || 0) + l.balance;
  });

  const liabilityAllocation = Object.entries(liabilitiesByCategory).map(([catId, amount]) => ({
    categoryId: catId,
    categoryName: LIABILITY_CATEGORIES[catId.toUpperCase()]?.name || catId,
    amount: Math.round(amount),
    percentage: totalLiabilities > 0 ? Number(((amount / totalLiabilities) * 100).toFixed(1)) : 0.0,
  })).sort((a, b) => b.amount - a.amount);

  // 10. Wealth Concentration Analysis
  const concentrationRisks = [];
  const realEstatePct = totalAssets > 0 ? (realEstateAssets / totalAssets) * 100 : 0;
  const cryptoAssets = assetsByCategory.crypto || 0;
  const cryptoPct = totalAssets > 0 ? (cryptoAssets / totalAssets) * 100 : 0;
  const cashPct = totalAssets > 0 ? (cashOnlyReserves / totalAssets) * 100 : 0;

  if (realEstatePct > CONCENTRATION_THRESHOLDS.REAL_ESTATE_HIGH_PCT) {
    concentrationRisks.push({
      type: 'REAL_ESTATE_CONCENTRATION',
      severity: 'MODERATE',
      title: 'High Real Estate Concentration',
      detail: `Real estate represents ${realEstatePct.toFixed(1)}% of total assets, which exceeds the ${CONCENTRATION_THRESHOLDS.REAL_ESTATE_HIGH_PCT}% illiquid threshold.`,
    });
  }

  if (cryptoPct > CONCENTRATION_THRESHOLDS.CRYPTO_HIGH_PCT) {
    concentrationRisks.push({
      type: 'CRYPTO_CONCENTRATION',
      severity: 'HIGH',
      title: 'Elevated Cryptocurrency Exposure',
      detail: `Cryptocurrency represents ${cryptoPct.toFixed(1)}% of total assets, which introduces substantial market volatility risk.`,
    });
  }

  if (cashPct > CONCENTRATION_THRESHOLDS.CASH_HIGH_PCT && totalAssets > 100000) {
    concentrationRisks.push({
      type: 'CASH_DRAG',
      severity: 'LOW',
      title: 'Potential Cash Drag',
      detail: `Cash and savings represent ${cashPct.toFixed(1)}% of gross assets, which may cause purchasing power loss due to inflation.`,
    });
  }

  if (debtToAssetRatio > CONCENTRATION_THRESHOLDS.DEBT_TO_ASSET_WARNING_PCT) {
    concentrationRisks.push({
      type: 'HIGH_LEVERAGE',
      severity: 'HIGH',
      title: 'Elevated Leverage Ratio',
      detail: `Total liabilities equal ${debtToAssetRatio.toFixed(1)}% of gross assets, indicating significant financial leverage.`,
    });
  }

  // Check largest single asset concentration
  const largestAsset = sanitizedAssets.reduce((max, a) => (a.value > (max?.value || 0) ? a : max), null);
  if (largestAsset && totalAssets > 0) {
    const singleAssetPct = (largestAsset.value / totalAssets) * 100;
    if (singleAssetPct > CONCENTRATION_THRESHOLDS.SINGLE_ASSET_HIGH_PCT && sanitizedAssets.length > 1) {
      concentrationRisks.push({
        type: 'SINGLE_ASSET_CONCENTRATION',
        severity: 'MODERATE',
        title: `Single Asset Concentration: ${largestAsset.name}`,
        detail: `"${largestAsset.name}" constitutes ${singleAssetPct.toFixed(1)}% of your total balance sheet.`,
      });
    }
  }

  // 11. Historical Trend Analysis
  let historicalTrends = null;
  if (Array.isArray(historicalSnapshots) && historicalSnapshots.length > 0) {
    const sortedSnapshots = [...historicalSnapshots].sort((a, b) => new Date(a.date) - new Date(b.date));
    const latestSnapshot = sortedSnapshots[sortedSnapshots.length - 1];
    const earliestSnapshot = sortedSnapshots[0];

    const absoluteChange = netWorth - earliestSnapshot.netWorth;
    const pctChange = earliestSnapshot.netWorth !== 0
      ? Number(((absoluteChange / Math.abs(earliestSnapshot.netWorth)) * 100).toFixed(1))
      : 0.0;

    // Annualized growth rate (CAGR) if > 1 year
    const daysDiff = (new Date(latestSnapshot.date) - new Date(earliestSnapshot.date)) / (1000 * 60 * 60 * 24);
    const yearsDiff = daysDiff / 365.25;
    let annualizedGrowthPct = 0;
    if (yearsDiff >= 1 && earliestSnapshot.netWorth > 0 && netWorth > 0) {
      annualizedGrowthPct = Number(((Math.pow(netWorth / earliestSnapshot.netWorth, 1 / yearsDiff) - 1) * 100).toFixed(1));
    }

    historicalTrends = {
      snapshotsCount: sortedSnapshots.length,
      earliestNetWorth: earliestSnapshot.netWorth,
      latestNetWorth: netWorth,
      absoluteChange,
      pctChange,
      annualizedGrowthPct,
      snapshots: sortedSnapshots,
    };
  }

  // 12. Multi-Horizon Scenario Planning
  let scenarioProjections = null;
  if (scenarioParams) {
    const horizons = [1, 3, 5, 10, 20];
    const assetGrowthPct = Number(scenarioParams.assetGrowthPct) || 7.0;
    const annualSavings = Math.max(0, Number(scenarioParams.annualSavings) || 0);
    const annualDebtReduction = Math.max(0, Number(scenarioParams.annualDebtReduction) || 0);
    const growthRate = assetGrowthPct / 100;

    const projectionPoints = horizons.map((years) => {
      let projectedAssets = totalAssets;
      for (let y = 1; y <= years; y++) {
        projectedAssets = projectedAssets * (1 + growthRate) + annualSavings;
      }

      const projectedLiabilities = Math.max(0, totalLiabilities - annualDebtReduction * years);
      const projectedNetWorth = Math.round(projectedAssets - projectedLiabilities);
      const netWorthDelta = projectedNetWorth - netWorth;

      return {
        years,
        projectedAssets: Math.round(projectedAssets),
        projectedLiabilities: Math.round(projectedLiabilities),
        projectedNetWorth,
        netWorthDelta,
      };
    });

    scenarioProjections = {
      assetGrowthPct,
      annualSavings,
      annualDebtReduction,
      projectionPoints,
    };
  }

  return {
    totals: {
      totalAssets,
      totalLiabilities,
      netWorth,
      liquidAssets,
      illiquidAssets,
      shortTermLiabilities,
      longTermLiabilities,
      liquidNetWorth,
      investableAssets,
      investableNetWorth,
      realEstateAssets,
      mortgageLiabilities,
      homeEquity,
      cashOnlyReserves,
      isNegativeNetWorth: netWorth < 0,
    },
    ratios: {
      debtToAssetRatio,
      debtToNetWorthRatio,
      netWorthToAssetRatio,
      liquidAssetPct,
      illiquidAssetPct,
      emergencyReserveMonths,
      liquidCoverageMonths,
    },
    allocations: {
      assets: assetAllocation,
      liabilities: liabilityAllocation,
    },
    concentrationRisks,
    historicalTrends,
    scenarioProjections,
    assets: sanitizedAssets,
    liabilities: sanitizedLiabilities,
    monthlyExpenses: sanitizedExpenses,
  };
}

/**
 * Calculates hypothetical instant one-off balance sheet scenario adjustments.
 *
 * @param {Object} baseResults - Current Net Worth result object
 * @param {Object} scenario - One-off adjustments: { assetAppreciationPct, debtPayoff, newInvestment, newDebt, homeValueChange }
 * @returns {Object} Adjusted scenario metrics
 */
export function calculateInstantScenario(baseResults, scenario = {}) {
  const currentAssets = baseResults.totals.totalAssets;
  const currentLiabilities = baseResults.totals.totalLiabilities;
  const currentNetWorth = baseResults.totals.netWorth;

  const apprecPct = Number(scenario.assetAppreciationPct) || 0;
  const debtPayoff = Math.max(0, Number(scenario.debtPayoff) || 0);
  const newInvestment = Math.max(0, Number(scenario.newInvestment) || 0);
  const newDebt = Math.max(0, Number(scenario.newDebt) || 0);
  const homeValueChange = Number(scenario.homeValueChange) || 0;

  // New assets
  const appreciationImpact = currentAssets * (apprecPct / 100);
  const adjustedAssets = Math.max(0, Math.round(currentAssets + appreciationImpact + newInvestment + homeValueChange));

  // New liabilities (debt payoff cannot exceed liabilities)
  const adjustedLiabilities = Math.max(0, Math.round(currentLiabilities - debtPayoff + newDebt));
  const adjustedNetWorth = Math.round(adjustedAssets - adjustedLiabilities);
  const netWorthDelta = adjustedNetWorth - currentNetWorth;

  return {
    currentNetWorth,
    adjustedAssets,
    adjustedLiabilities,
    adjustedNetWorth,
    netWorthDelta,
    pctChange: currentNetWorth !== 0 ? Number(((netWorthDelta / Math.abs(currentNetWorth)) * 100).toFixed(1)) : 0.0,
  };
}
