/**
 * Flagship Return on Assets (ROA) & Asset Efficiency Intelligence Engine (Math Engine V2)
 * Comprehensive Corporate Asset Productivity & DuPont Decomposition Framework:
 * 
 * 1. Net ROA (%) = (Net Income / Total Assets) * 100
 * 2. Operating ROA / Basic Earning Power (%) = (EBIT / Total Assets) * 100
 * 3. 2-Step DuPont Decomposition:
 *    ROA (%) = Net Profit Margin (%) * Total Asset Turnover (x)
 *    where Net Profit Margin = (Net Income / Revenue) * 100
 *    and Total Asset Turnover = Revenue / Total Assets
 * 4. Extended DuPont & ROE Linkage:
 *    Equity Multiplier (x) = Total Assets / Shareholders' Equity
 *    ROE (%) = ROA (%) * Equity Multiplier
 *    Debt-to-Assets Ratio (%) = ((Total Assets - Shareholders' Equity) / Total Assets) * 100
 * 5. Capital Intensity Ratio = Total Assets / Revenue = 1 / Total Asset Turnover
 * 6. Granular Asset Productivity:
 *    Fixed Asset Turnover (FAT) = Revenue / Fixed Assets
 *    Current Asset Turnover (CAT) = Revenue / Current Assets
 *    Return on Fixed Assets (ROFA %) = (Net Income / Fixed Assets) * 100
 * 7. Tax-Adjusted / NOPAT ROA:
 *    NOPAT = EBIT * (1 - Tax Rate / 100)
 *    NOPAT ROA (%) = (NOPAT / Total Assets) * 100
 * 8. Quality of ROA Diagnosis & Strategic Insights
 * 
 * @param {Object} inputs
 * @param {string} [inputs.calculationMode='dupont'] - 'dupont' | 'standard' | 'extended'
 * @param {number} [inputs.netIncome=25000000] - Net Income / PAT (e.g. ₹2.5 Crores)
 * @param {number} [inputs.revenue=200000000] - Total Revenue / Sales (e.g. ₹20 Crores)
 * @param {number} [inputs.totalAssets=250000000] - Total Assets (e.g. ₹25 Crores)
 * @param {number} [inputs.shareholdersEquity=125000000] - Shareholders' Equity (e.g. ₹12.5 Crores)
 * @param {number} [inputs.ebit=38000000] - Operating Profit / EBIT (e.g. ₹3.8 Crores)
 * @param {number} [inputs.fixedAssets=175000000] - Net Fixed Assets / PP&E (e.g. ₹17.5 Crores)
 * @param {number} [inputs.currentAssets=75000000] - Total Current Assets (e.g. ₹7.5 Crores)
 * @param {number} [inputs.taxRate=25] - Effective Corporate Tax Rate % (e.g. 25%)
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const DEFAULT_ROA_INPUTS = {
  calculationMode: 'dupont',
  netIncome: 25000000,
  revenue: 200000000,
  totalAssets: 250000000,
  shareholdersEquity: 125000000,
  ebit: 38000000,
  fixedAssets: 175000000,
  currentAssets: 75000000,
  taxRate: 25,
  currencySymbol: '₹',
};

export function calculateReturnOnAssetsCalculator(inputs = {}) {
  const merged = { ...DEFAULT_ROA_INPUTS, ...inputs };

  // 1. Input Sanitization & Clamping
  const calculationMode = merged.calculationMode || 'dupont';

  const rawNetIncome = Number(merged.netIncome);
  const netIncome = isNaN(rawNetIncome) ? 25000000 : rawNetIncome;

  const rawRevenue = Number(merged.revenue);
  const revenue = isNaN(rawRevenue) ? 200000000 : Math.max(0, rawRevenue);

  const rawAssets = Number(merged.totalAssets);
  const totalAssets = isNaN(rawAssets) ? 250000000 : Math.max(1, rawAssets);

  const rawEquity = Number(merged.shareholdersEquity);
  const shareholdersEquity = isNaN(rawEquity) ? 125000000 : Math.max(1, rawEquity);

  const rawEbit = Number(merged.ebit);
  const ebit = isNaN(rawEbit) ? 38000000 : rawEbit;

  const rawFixed = Number(merged.fixedAssets);
  const fixedAssets = isNaN(rawFixed) ? Math.max(0, totalAssets * 0.7) : Math.max(0, rawFixed);

  const rawCurrent = Number(merged.currentAssets);
  const currentAssets = isNaN(rawCurrent) ? Math.max(0, totalAssets - fixedAssets) : Math.max(0, rawCurrent);

  const rawTaxRate = Number(merged.taxRate);
  const taxRate = isNaN(rawTaxRate) ? 25 : Math.max(0, Math.min(100, rawTaxRate));

  const currencySymbol = merged.currencySymbol || '₹';

  // 2. Core ROA Calculations
  // Net Return on Assets (ROA) = (Net Income / Total Assets) * 100
  const roaPct = Math.round(((netIncome / totalAssets) * 100) * 100) / 100;

  // Operating Return on Assets (Basic Earning Power) = (EBIT / Total Assets) * 100
  const operatingRoaPct = Math.round(((ebit / totalAssets) * 100) * 100) / 100;

  // 3. 2-Step DuPont Decomposition Components
  // Net Profit Margin (%) = (Net Income / Revenue) * 100
  const netProfitMarginPct = revenue > 0
    ? Math.round(((netIncome / revenue) * 100) * 100) / 100
    : 0;

  // Total Asset Turnover (x) = Revenue / Total Assets
  const totalAssetTurnover = totalAssets > 0
    ? Math.round((revenue / totalAssets) * 100) / 100
    : 0;

  // Capital Intensity Ratio = Total Assets / Revenue = 1 / Total Asset Turnover
  const capitalIntensityRatio = revenue > 0
    ? Math.round((totalAssets / revenue) * 100) / 100
    : 0;

  // 4. Extended DuPont & Return on Equity (ROE) Linkage
  // Equity Multiplier = Total Assets / Shareholders' Equity
  const equityMultiplier = shareholdersEquity > 0
    ? Math.round((totalAssets / shareholdersEquity) * 100) / 100
    : 1.0;

  // ROE (%) = (Net Income / Shareholders' Equity) * 100 or ROA * Equity Multiplier
  const roePct = Math.round(((netIncome / shareholdersEquity) * 100) * 100) / 100;

  // Debt-to-Assets Ratio (%) = ((Total Assets - Shareholders' Equity) / Total Assets) * 100
  const liabilities = Math.max(0, totalAssets - shareholdersEquity);
  const debtToAssetsPct = Math.round(((liabilities / totalAssets) * 100) * 100) / 100;

  // 5. Granular Asset Productivity Metrics
  // Fixed Asset Turnover (FAT) = Revenue / Fixed Assets
  const fixedAssetTurnover = fixedAssets > 0
    ? Math.round((revenue / fixedAssets) * 100) / 100
    : 0;

  // Current Asset Turnover (CAT) = Revenue / Current Assets
  const currentAssetTurnover = currentAssets > 0
    ? Math.round((revenue / currentAssets) * 100) / 100
    : 0;

  // Return on Fixed Assets (ROFA %) = (Net Income / Fixed Assets) * 100
  const returnOnFixedAssetsPct = fixedAssets > 0
    ? Math.round(((netIncome / fixedAssets) * 100) * 100) / 100
    : 0;

  // 6. Tax-Adjusted / NOPAT Return on Assets
  // NOPAT = EBIT * (1 - Tax Rate / 100)
  const nopat = Math.round(ebit * (1 - taxRate / 100));
  const nopatRoaPct = totalAssets > 0
    ? Math.round(((nopat / totalAssets) * 100) * 100) / 100
    : 0;

  // 7. DuPont Strategy Archetype Identification
  let dupontStrategy = 'BALANCED_EFFICIENCY';
  let dupontStrategyTitle = 'Balanced Profitability & Asset Utilization';
  let dupontStrategyDesc = 'Healthy equilibrium between operating margins and asset turnover rate.';

  if (netProfitMarginPct >= 15.0 && totalAssetTurnover < 1.0) {
    dupontStrategy = 'HIGH_MARGIN_LOW_TURNOVER';
    dupontStrategyTitle = 'High Margin / Capital Intensive Moat (Pricing Power Strategy)';
    dupontStrategyDesc = 'Profits are driven by strong pricing power, software IP, or premium brand equity despite slower asset turns.';
  } else if (netProfitMarginPct < 6.0 && totalAssetTurnover >= 1.8) {
    dupontStrategy = 'LOW_MARGIN_HIGH_TURNOVER';
    dupontStrategyTitle = 'High Volume / Rapid Asset Velocity (Turnover Powerhouse)';
    dupontStrategyDesc = 'Profits are driven by ultra-fast inventory rotation and lean asset efficiency despite slim unit margins.';
  } else if (netProfitMarginPct < 3.0 && totalAssetTurnover < 0.8) {
    dupontStrategy = 'CAPITAL_INEFFICIENT_TRAP';
    dupontStrategyTitle = 'Capital Inefficient Trapped Assets (Margin & Turn Squeeze)';
    dupontStrategyDesc = 'Both pricing power and asset utilization are constrained, resulting in sub-par capital productivity.';
  }

  // 8. Quality of ROA Diagnostic Classification
  let roaQualityVerdict = 'HEALTHY_INDUSTRIAL';
  let roaQualityTitle = 'Healthy Asset Efficiency (5.0% - 10.0% Standard)';
  let roaQualityColor = 'text-primary';

  if (roaPct < 0) {
    roaQualityVerdict = 'VALUE_DESTRUCTIVE';
    roaQualityTitle = 'Value Destructive (Negative ROA / Net Operating Losses)';
    roaQualityColor = 'text-rose-600';
  } else if (roaPct >= 15.0) {
    roaQualityVerdict = 'TIER_ONE_COMPOUNDER';
    roaQualityTitle = 'Tier-1 Asset-Light Compounder (ROA ≥ 15.0% Exceptional Moat)';
    roaQualityColor = 'text-indigo-600';
  } else if (roaPct >= 10.0) {
    roaQualityVerdict = 'STRONG_OPERATIONAL_EFFICIENCY';
    roaQualityTitle = 'Strong Operating Efficiency (ROA 10.0% - 14.9%)';
    roaQualityColor = 'text-semantic-success';
  } else if (roaPct < 5.0) {
    if (equityMultiplier >= 6.0) {
      roaQualityVerdict = 'FINANCIAL_INTERMEDIATION';
      roaQualityTitle = 'Financial Intermediation / Banking Profile (Leverage-Supported)';
      roaQualityColor = 'text-blue-600';
    } else {
      roaQualityVerdict = 'SUB_OPTIMAL_UTILIZATION';
      roaQualityTitle = 'Sub-Optimal Asset Utilization (ROA < 5.0% Low Return)';
      roaQualityColor = 'text-amber-600';
    }
  }

  // 9. DuPont Breakdown Visual Items
  const dupontBreakdownList = [
    {
      label: 'Net Profit Margin',
      value: `${netProfitMarginPct}%`,
      multiplier: netProfitMarginPct / 100,
      desc: 'Net income generated per dollar of top-line revenue',
      colorClass: 'bg-primary',
    },
    {
      label: 'Total Asset Turnover',
      value: `${totalAssetTurnover}x`,
      multiplier: totalAssetTurnover,
      desc: 'Annual revenue generated per dollar of balance sheet assets',
      colorClass: 'bg-emerald-500',
    },
    {
      label: 'Equity Multiplier',
      value: `${equityMultiplier}x`,
      multiplier: equityMultiplier,
      desc: 'Financial leverage multiplier converting ROA into ROE',
      colorClass: 'bg-indigo-500',
    },
  ];

  // 10. Asset Mix Breakdown
  const fixedAssetPct = totalAssets > 0 ? Math.round((fixedAssets / totalAssets) * 100) : 70;
  const currentAssetPct = Math.max(0, 100 - fixedAssetPct);
  const assetMixList = [
    { label: 'Fixed Assets (PP&E / Intangibles)', amount: fixedAssets, percentage: fixedAssetPct, colorClass: 'bg-indigo-600' },
    { label: 'Current Assets (Cash, AR, Inventory)', amount: currentAssets, percentage: currentAssetPct, colorClass: 'bg-emerald-500' },
  ];

  // 11. Strategic Actionable Recommendations
  const recommendations = [
    {
      rank: 1,
      title: 'DuPont Driver Optimization & Strategic Model',
      savings: roaPct,
      action: dupontStrategy === 'HIGH_MARGIN_LOW_TURNOVER'
        ? `Your business relies on pricing power (Net Margin: ${netProfitMarginPct}%) with lower asset turnover (${totalAssetTurnover}x). Protecting gross margin and brand premium is your highest leverage lever.`
        : dupontStrategy === 'LOW_MARGIN_HIGH_TURNOVER'
        ? `Your model is an asset velocity machine (Turnover: ${totalAssetTurnover}x) on slim margins (${netProfitMarginPct}%). Ensure supply chain friction and inventory days are minimized to maintain this volume advantage.`
        : `Your ${roaPct}% ROA is generated from a ${netProfitMarginPct}% net margin and ${totalAssetTurnover}x asset turnover. Target incremental margin improvements and rationalize idle assets to push ROA above 15%.`,
    },
    {
      rank: 2,
      title: 'Operating ROA (Basic Earning Power) vs Capital Structure',
      savings: operatingRoaPct,
      action: `Your Operating ROA (Basic Earning Power) is ${operatingRoaPct}%, reflecting pre-tax and pre-interest asset efficiency. Compared to Net ROA of ${roaPct}%, the difference represents financing costs and taxes.`,
    },
    {
      rank: 3,
      title: 'Leverage Multiplier & Shareholder Equity Amplification',
      savings: roePct,
      action: `With an Equity Multiplier of ${equityMultiplier}x (${debtToAssetsPct}% funded by liabilities), your ${roaPct}% ROA is amplified into a Return on Equity (ROE) of ${roePct}%. Ensure debt service coverage remains safe against earnings volatility.`,
    },
  ];

  // 12. Hero Text
  const heroText = `Your Return on Assets (ROA) is ${roaPct}% (Operating ROA: ${operatingRoaPct}%), generating ${currencySymbol}${netIncome.toLocaleString()} in net profit on a ${currencySymbol}${totalAssets.toLocaleString()} total asset base with an Asset Turnover of ${totalAssetTurnover}x and ROE of ${roePct}%.`;

  return {
    primaryOutput: roaPct,
    roaPct,
    operatingRoaPct,
    netProfitMarginPct,
    totalAssetTurnover,
    capitalIntensityRatio,
    equityMultiplier,
    roePct,
    debtToAssetsPct,
    liabilities,
    fixedAssetTurnover,
    currentAssetTurnover,
    returnOnFixedAssetsPct,
    nopat,
    nopatRoaPct,
    taxRate,
    netIncome,
    revenue,
    totalAssets,
    shareholdersEquity,
    ebit,
    fixedAssets,
    currentAssets,
    dupontStrategy,
    dupontStrategyTitle,
    dupontStrategyDesc,
    roaQualityVerdict,
    roaQualityTitle,
    roaQualityColor,
    dupontBreakdownList,
    assetMixList,
    recommendations,
    heroText,
    calculationMode,
    currencySymbol,
  };
}

export const calculateReturnOnAssetsTool = calculateReturnOnAssetsCalculator;
export const calculateRoaCalculator = calculateReturnOnAssetsCalculator;
