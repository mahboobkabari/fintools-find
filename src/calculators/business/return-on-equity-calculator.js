/**
 * Flagship Return on Equity (ROE) & DuPont Intelligence Engine (Math Engine V2)
 * Comprehensive Shareholder Capital Efficiency & DuPont Decomposition Framework:
 * 1. Standard ROE = (Net Income / Shareholders' Equity) * 100
 * 2. 3-Step DuPont Decomposition:
 *    ROE = Net Profit Margin (%) * Asset Turnover (x) * Equity Multiplier (x)
 * 3. 5-Step Extended DuPont Decomposition:
 *    ROE = Tax Burden (%) * Interest Burden (%) * Operating Margin (%) * Asset Turnover (x) * Equity Multiplier (x)
 * 4. Sustainable Growth Rate (SGR) = ROE * Retention Rate (b)
 * 5. Return on Assets (ROA) = Net Income / Total Assets
 * 6. Equity Value Spread = ROE - Cost of Equity (Ke)
 * 7. Quality of ROE Diagnosis (Operational Margin vs Asset Efficiency vs Leverage-driven)
 * 
 * @param {Object} inputs
 * @param {string} [inputs.calculationMode='dupont3'] - 'standard' | 'dupont3' | 'dupont5'
 * @param {number} [inputs.netIncome=25000000] - Net Income / PAT (e.g. ₹2.5 Crores)
 * @param {number} [inputs.shareholdersEquity=125000000] - Total Shareholders' Equity / Net Worth (e.g. ₹12.5 Crores)
 * @param {number} [inputs.revenue=200000000] - Total Revenue / Sales (e.g. ₹20 Crores)
 * @param {number} [inputs.totalAssets=250000000] - Total Assets (e.g. ₹25 Crores)
 * @param {number} [inputs.ebit=38000000] - Operating Profit / EBIT (e.g. ₹3.8 Crores)
 * @param {number} [inputs.ebt=33000000] - Earnings Before Tax / EBT (e.g. ₹3.3 Crores)
 * @param {number} [inputs.dividendPayoutRatio=30] - Dividend Payout % (e.g. 30%)
 * @param {number} [inputs.costOfEquity=12] - Required Cost of Equity (Ke %) (e.g. 12%)
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const DEFAULT_ROE_INPUTS = {
  calculationMode: 'dupont3',
  netIncome: 25000000,
  shareholdersEquity: 125000000,
  revenue: 200000000,
  totalAssets: 250000000,
  ebit: 38000000,
  ebt: 33000000,
  dividendPayoutRatio: 30,
  costOfEquity: 12,
  currencySymbol: '₹',
};

export function calculateReturnOnEquityCalculator(inputs = {}) {
  const merged = { ...DEFAULT_ROE_INPUTS, ...inputs };

  // 1. Input Sanitization & Clamping
  const calculationMode = merged.calculationMode || 'dupont3';

  const rawNetIncome = Number(merged.netIncome);
  const netIncome = isNaN(rawNetIncome) ? 25000000 : rawNetIncome;

  const rawEquity = Number(merged.shareholdersEquity);
  const shareholdersEquity = isNaN(rawEquity) ? 125000000 : Math.max(1, rawEquity);

  const rawRev = Number(merged.revenue);
  const revenue = isNaN(rawRev) ? 200000000 : Math.max(0, rawRev);

  const rawAssets = Number(merged.totalAssets);
  const totalAssets = isNaN(rawAssets) ? 250000000 : Math.max(shareholdersEquity, rawAssets);

  const rawEbit = Number(merged.ebit);
  const ebit = isNaN(rawEbit) ? 38000000 : rawEbit;

  const rawEbt = Number(merged.ebt);
  const ebt = isNaN(rawEbt) ? 33000000 : rawEbt;

  const rawDivPayout = Number(merged.dividendPayoutRatio);
  const dividendPayoutRatio = isNaN(rawDivPayout) ? 30 : Math.max(0, Math.min(100, rawDivPayout));

  const rawKe = Number(merged.costOfEquity);
  const costOfEquity = isNaN(rawKe) ? 12 : Math.max(0, Math.min(100, rawKe));

  const currencySymbol = merged.currencySymbol || '₹';

  // 2. Standard ROE Calculation
  // ROE = (Net Income / Shareholders' Equity) * 100
  const roePct = Math.round(((netIncome / shareholdersEquity) * 100) * 100) / 100;

  // 3. Return on Assets (ROA)
  // ROA = (Net Income / Total Assets) * 100
  const roaPct = totalAssets > 0
    ? Math.round(((netIncome / totalAssets) * 100) * 100) / 100
    : 0;

  // 4. 3-Step DuPont Decomposition Components
  // Net Profit Margin (%) = (Net Income / Revenue) * 100
  const netProfitMarginPct = revenue > 0
    ? Math.round(((netIncome / revenue) * 100) * 100) / 100
    : 0;

  // Asset Turnover (x) = Revenue / Total Assets
  const assetTurnoverRatio = totalAssets > 0
    ? Math.round((revenue / totalAssets) * 100) / 100
    : 0;

  // Equity Multiplier / Financial Leverage (x) = Total Assets / Shareholders' Equity
  const equityMultiplier = shareholdersEquity > 0
    ? Math.round((totalAssets / shareholdersEquity) * 100) / 100
    : 1.0;

  // 5. 5-Step Extended DuPont Decomposition Components
  // Tax Burden (%) = Net Income / EBT
  const taxBurdenPct = ebt > 0
    ? Math.round((netIncome / ebt) * 1000) / 10
    : 100;

  // Interest Burden (%) = EBT / EBIT
  const interestBurdenPct = ebit > 0
    ? Math.round((ebt / ebit) * 1000) / 10
    : 100;

  // Operating Margin / EBIT Margin (%) = (EBIT / Revenue) * 100
  const ebitMarginPct = revenue > 0
    ? Math.round(((ebit / revenue) * 100) * 100) / 100
    : 0;

  // 6. Sustainable Growth Rate (SGR)
  // Retention Rate (b) = 1 - (Dividend Payout / 100)
  const retentionRatePct = Math.round((100 - dividendPayoutRatio) * 100) / 100;
  const retentionRateFraction = retentionRatePct / 100;

  // SGR (%) = ROE * b
  const sustainableGrowthRatePct = Math.round((roePct * retentionRateFraction) * 100) / 100;

  // 7. Economic Value Spread (EVA Spread against Cost of Equity)
  const valueCreationSpreadPct = Math.round((roePct - costOfEquity) * 100) / 100;

  // 8. Quality of ROE Diagnosis
  let roeQualityVerdict = 'HIGH_QUALITY_OPERATIONAL';
  let roeQualityTitle = 'High Quality Return (Moat & Operational Efficiency)';
  let roeQualityColor = 'text-semantic-success';

  if (roePct < 0) {
    roeQualityVerdict = 'LOSS_MAKING';
    roeQualityTitle = 'Value Destructive (Negative ROE / Net Loss)';
    roeQualityColor = 'text-rose-600';
  } else if (equityMultiplier > 3.5 && netProfitMarginPct < 5.0) {
    roeQualityVerdict = 'HIGH_LEVERAGE_RISK';
    roeQualityTitle = 'Leverage-Driven ROE (High Financial Risk & Debt Dependency)';
    roeQualityColor = 'text-amber-600';
  } else if (roePct < costOfEquity) {
    roeQualityVerdict = 'BELOW_COST_OF_EQUITY';
    roeQualityTitle = 'Below Hurdle (ROE < Cost of Equity Ke - Economic Loss)';
    roeQualityColor = 'text-amber-600';
  } else if (roePct >= 20.0) {
    roeQualityVerdict = 'EXCEPTIONAL_MOAT';
    roeQualityTitle = 'Exceptional ROE (>20% Tier-1 Moat Compounder)';
    roeQualityColor = 'text-indigo-600';
  }

  // 9. DuPont Breakdown Visual Items
  const dupontBreakdownList = [
    { label: 'Net Profit Margin', value: `${netProfitMarginPct}%`, multiplier: netProfitMarginPct / 100, desc: 'Operating profitability per dollar of revenue', colorClass: 'bg-primary' },
    { label: 'Asset Turnover', value: `${assetTurnoverRatio}x`, multiplier: assetTurnoverRatio, desc: 'Revenue generated per dollar of assets', colorClass: 'bg-emerald-500' },
    { label: 'Equity Multiplier (Leverage)', value: `${equityMultiplier}x`, multiplier: equityMultiplier, desc: 'Total assets supported per dollar of equity', colorClass: 'bg-indigo-500' },
  ];

  // 10. Strategic Recommendations
  const recommendations = [
    {
      rank: 1,
      title: 'DuPont Driver Optimization & Profitability Engine',
      savings: roePct,
      action: netProfitMarginPct >= 10.0
        ? `Your Net Profit Margin of ${netProfitMarginPct}% is strong, contributing significantly to your ${roePct}% ROE. Maintaining pricing power protects this operational moat.`
        : `Your Net Profit Margin is ${netProfitMarginPct}%. Accelerate margin expansion through cost containment and high-margin product mix to raise ROE organically without adding debt.`,
    },
    {
      rank: 2,
      title: 'Sustainable Growth Rate & Reinvestment Capacity',
      savings: sustainableGrowthRatePct,
      action: `By retaining ${retentionRatePct}% of earnings, your business can grow revenues and asset base at a sustainable rate of ${sustainableGrowthRatePct}% annually without raising new equity or increasing debt leverage.`,
    },
    {
      rank: 3,
      title: 'Economic Value Added (EVA Spread)',
      savings: valueCreationSpreadPct,
      action: valueCreationSpreadPct > 0
        ? `Your ROE (${roePct}%) exceeds the required Cost of Equity (${costOfEquity}%) by +${valueCreationSpreadPct}%, creating positive economic value and compounding shareholder wealth.`
        : `Your ROE (${roePct}%) is below your Cost of Equity (${costOfEquity}%) by ${valueCreationSpreadPct}%. Management is failing to generate the minimum return demanded by equity investors.`,
    },
  ];

  // 11. Hero Text
  const heroText = `Your Return on Equity (ROE) is ${roePct}% (ROA: ${roaPct}%), generating ${currencySymbol}${netIncome.toLocaleString()} on ${currencySymbol}${shareholdersEquity.toLocaleString()} in shareholder net worth with a Sustainable Growth Rate of ${sustainableGrowthRatePct}%.`;

  return {
    primaryOutput: roePct,
    roePct,
    roaPct,
    netProfitMarginPct,
    assetTurnoverRatio,
    equityMultiplier,
    taxBurdenPct,
    interestBurdenPct,
    ebitMarginPct,
    retentionRatePct,
    sustainableGrowthRatePct,
    valueCreationSpreadPct,
    netIncome,
    shareholdersEquity,
    revenue,
    totalAssets,
    ebit,
    ebt,
    dividendPayoutRatio,
    costOfEquity,
    dupontBreakdownList,
    recommendations,
    roeQualityVerdict,
    roeQualityTitle,
    roeQualityColor,
    heroText,
    calculationMode,
    currencySymbol,
  };
}

export const calculateReturnOnEquityTool = calculateReturnOnEquityCalculator;
export const calculateRoeCalculator = calculateReturnOnEquityCalculator;
