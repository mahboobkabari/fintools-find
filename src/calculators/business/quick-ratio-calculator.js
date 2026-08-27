/**
 * Flagship Quick Ratio (Acid-Test Ratio) Intelligence Engine (Math Engine V2)
 * Comprehensive Short-Term Liquidity & Solvency Analysis Framework:
 * 1. Component Method: Cash + Marketable Securities + Accounts Receivable (Net)
 * 2. Deductive Balance Sheet Method: Current Assets - Inventory - Prepaid Expenses
 * 3. Exact Quick Ratio (Acid-Test), Current Ratio, and Cash Ratio
 * 4. Quick Working Capital Surplus / (Deficit) = Quick Assets - Current Liabilities
 * 5. Defensive Interval Ratio (DIR - Days of Immediate Operational Cash Runway)
 * 6. Target Liquidity Gap Analysis (Cash needed to reach 1.0x / 1.25x ratio)
 * 7. Multi-Tier Liquidity Rating & Recommendations.
 * 
 * @param {Object} inputs
 * @param {string} [inputs.calculationMode='component'] - 'component' | 'deductive'
 * @param {number} [inputs.cashAndEquivalents=2500000] - Cash & Bank Balances (e.g. ₹25 Lakhs)
 * @param {number} [inputs.marketableSecurities=1500000] - Short-term Liquid Investments (e.g. ₹15 Lakhs)
 * @param {number} [inputs.accountsReceivable=3500000] - Trade Receivables / Debtors (Net) (e.g. ₹35 Lakhs)
 * @param {number} [inputs.totalCurrentAssets=12000000] - Total Balance Sheet Current Assets (e.g. ₹1.2 Cr)
 * @param {number} [inputs.inventory=4000000] - Raw Materials, WIP & Finished Goods Inventory (e.g. ₹40 Lakhs)
 * @param {number} [inputs.prepaidExpenses=500000] - Prepaid Insurance, Taxes & Advances (e.g. ₹5 Lakhs)
 * @param {number} [inputs.otherIlliquidAssets=0] - Other non-convertible current assets
 * @param {number} [inputs.currentLiabilities=5000000] - Total Current Liabilities (AP + Short Debt + Taxes) (e.g. ₹50 Lakhs)
 * @param {number} [inputs.dailyOperatingExpenses=50000] - Daily Cash Operating Outflows (e.g. ₹50,000/day)
 * @param {number} [inputs.targetQuickRatio=1.0] - Target Benchmark Quick Ratio (e.g. 1.0x - 1.25x)
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const DEFAULT_QUICK_RATIO_INPUTS = {
  calculationMode: 'component',
  cashAndEquivalents: 2500000,
  marketableSecurities: 1500000,
  accountsReceivable: 3500000,
  totalCurrentAssets: 12000000,
  inventory: 4000000,
  prepaidExpenses: 500000,
  otherIlliquidAssets: 0,
  currentLiabilities: 5000000,
  dailyOperatingExpenses: 50000,
  targetQuickRatio: 1.0,
  currencySymbol: '₹',
};

export function calculateQuickRatioCalculator(inputs = {}) {
  const merged = { ...DEFAULT_QUICK_RATIO_INPUTS, ...inputs };

  // 1. Input Sanitization & Clamping
  const calculationMode = merged.calculationMode || 'component';

  const rawCash = Number(merged.cashAndEquivalents);
  const cashAndEquivalents = isNaN(rawCash) ? 2500000 : Math.max(0, rawCash);

  const rawSec = Number(merged.marketableSecurities);
  const marketableSecurities = isNaN(rawSec) ? 1500000 : Math.max(0, rawSec);

  const rawAr = Number(merged.accountsReceivable);
  const accountsReceivable = isNaN(rawAr) ? 3500000 : Math.max(0, rawAr);

  const rawTotAssets = Number(merged.totalCurrentAssets);
  const totalCurrentAssets = isNaN(rawTotAssets) ? 12000000 : Math.max(0, rawTotAssets);

  const rawInv = Number(merged.inventory);
  const inventory = isNaN(rawInv) ? 4000000 : Math.max(0, rawInv);

  const rawPrepaid = Number(merged.prepaidExpenses);
  const prepaidExpenses = isNaN(rawPrepaid) ? 500000 : Math.max(0, rawPrepaid);

  const rawOther = Number(merged.otherIlliquidAssets);
  const otherIlliquidAssets = isNaN(rawOther) ? 0 : Math.max(0, rawOther);

  const rawLiab = Number(merged.currentLiabilities);
  const currentLiabilities = isNaN(rawLiab) ? 5000000 : Math.max(0, rawLiab);

  const rawDailyOpex = Number(merged.dailyOperatingExpenses);
  const dailyOperatingExpenses = isNaN(rawDailyOpex) ? 50000 : Math.max(0, rawDailyOpex);

  const rawTarget = Number(merged.targetQuickRatio);
  const targetQuickRatio = isNaN(rawTarget) || rawTarget <= 0 ? 1.0 : Math.max(0.2, Math.min(5.0, rawTarget));

  const currencySymbol = merged.currencySymbol || '₹';

  // 2. Derive Quick Assets & Total Current Assets
  let quickAssets = 0;
  let derivedCurrentAssets = totalCurrentAssets;

  if (calculationMode === 'deductive') {
    const illiquidDeductions = inventory + prepaidExpenses + otherIlliquidAssets;
    quickAssets = Math.max(0, totalCurrentAssets - illiquidDeductions);
    derivedCurrentAssets = totalCurrentAssets;
  } else {
    // Component Mode
    quickAssets = cashAndEquivalents + marketableSecurities + accountsReceivable;
    // In component mode, total current assets = quick assets + inventory + prepaid
    derivedCurrentAssets = quickAssets + inventory + prepaidExpenses + otherIlliquidAssets;
  }

  // 3. Ratio Computations
  // Quick Ratio (Acid-Test) = Quick Assets / Current Liabilities
  const quickRatio = currentLiabilities > 0
    ? Math.round((quickAssets / currentLiabilities) * 100) / 100
    : quickAssets > 0 ? 99.99 : 0;

  // Current Ratio = Total Current Assets / Current Liabilities
  const currentRatio = currentLiabilities > 0
    ? Math.round((derivedCurrentAssets / currentLiabilities) * 100) / 100
    : derivedCurrentAssets > 0 ? 99.99 : 0;

  // Cash Ratio = (Cash + Marketable Securities) / Current Liabilities
  const absoluteCashAssets = cashAndEquivalents + marketableSecurities;
  const cashRatio = currentLiabilities > 0
    ? Math.round((absoluteCashAssets / currentLiabilities) * 100) / 100
    : absoluteCashAssets > 0 ? 99.99 : 0;

  // 4. Quick Working Capital (Acid-Test Surplus/Deficit)
  const quickWorkingCapital = quickAssets - currentLiabilities;
  const netWorkingCapital = derivedCurrentAssets - currentLiabilities;

  // 5. Defensive Interval Ratio (DIR - Days of Immediate Liquidity Runway)
  const defensiveIntervalDays = dailyOperatingExpenses > 0
    ? Math.round(quickAssets / dailyOperatingExpenses)
    : 0;

  // 6. Target Liquidity Gap Analysis
  // Quick Assets Required = Current Liabilities * Target Quick Ratio
  const requiredQuickAssets = Math.round(currentLiabilities * targetQuickRatio);
  const liquidityGap = requiredQuickAssets - quickAssets; // Positive = Deficit (need cash), Negative = Surplus

  // 7. Maximum Additional Short-Term Debt Allowable before hitting target
  // Max Debt = Quick Assets / Target
  const maxAllowableShortTermDebt = targetQuickRatio > 0
    ? Math.round(quickAssets / targetQuickRatio)
    : quickAssets;
  const debtCapacityHeadroom = Math.max(0, maxAllowableShortTermDebt - currentLiabilities);

  // 8. Liquidity Health Verdict
  let healthVerdict = 'HEALTHY';
  let healthTitle = 'Optimal Liquidity (1.0x - 1.5x Acid-Test)';
  let healthColor = 'text-semantic-success';

  if (quickRatio < 0.8) {
    healthVerdict = 'CRITICAL_DEFICIT';
    healthTitle = 'Severe Liquidity Deficit (Quick Ratio < 0.80x)';
    healthColor = 'text-rose-600';
  } else if (quickRatio < 1.0) {
    healthVerdict = 'VULNERABLE';
    healthTitle = 'Tight Liquidity Buffer (Quick Ratio < 1.00x - Inventory Reliant)';
    healthColor = 'text-amber-600';
  } else if (quickRatio > 2.5) {
    healthVerdict = 'EXCESS_IDLE_CASH';
    healthTitle = 'Excess Idle Liquidity (Quick Ratio > 2.50x - Capital Inefficient)';
    healthColor = 'text-indigo-600';
  }

  // 9. Asset Breakdown Chart Items
  const assetBreakdownList = [
    { label: 'Cash & Bank Balances', amount: cashAndEquivalents, colorClass: 'bg-primary' },
    { label: 'Marketable Securities', amount: marketableSecurities, colorClass: 'bg-emerald-500' },
    { label: 'Accounts Receivable (Net)', amount: accountsReceivable, colorClass: 'bg-indigo-500' },
    { label: 'Inventory (Excluded from Acid-Test)', amount: inventory, colorClass: 'bg-amber-500' },
    { label: 'Prepaid Expenses & Other', amount: prepaidExpenses + otherIlliquidAssets, colorClass: 'bg-slate-400' },
  ];

  // 10. Strategic Recommendations
  const recommendations = [
    {
      rank: 1,
      title: 'Acid-Test Solvency & Working Capital Cushion',
      savings: Math.abs(quickWorkingCapital),
      action: quickRatio >= 1.0
        ? `Your Quick Ratio of ${quickRatio}x provides ${currencySymbol}${quickWorkingCapital.toLocaleString()} in net quick working capital surplus. You can settle 100% of current liabilities without liquidating inventory or seeking emergency credit lines.`
        : `Your Quick Ratio of ${quickRatio}x creates an immediate liquidity shortfall of ${currencySymbol}${Math.abs(quickWorkingCapital).toLocaleString()}. To reach the standard 1.0x baseline, accelerate receivables collection or secure a ${currencySymbol}${Math.abs(liquidityGap).toLocaleString()} working capital facility.`,
    },
    {
      rank: 2,
      title: 'Defensive Interval Runway & Operating Burn',
      savings: defensiveIntervalDays,
      action: defensiveIntervalDays > 0
        ? `With ${currencySymbol}${quickAssets.toLocaleString()} in quick assets, your business can sustain daily operating cash expenses (${currencySymbol}${dailyOperatingExpenses.toLocaleString()}/day) for ${defensiveIntervalDays} days without generating any new sales or collections.`
        : `Establish a daily operating expenditure benchmark to monitor defensive interval runway.`,
    },
    {
      rank: 3,
      title: 'Comparative Current Ratio vs Acid-Test Ratio',
      savings: inventory,
      action: `Your Current Ratio is ${currentRatio}x while your Quick Ratio is ${quickRatio}x. The ${(currentRatio - quickRatio).toFixed(2)}x gap reflects ${currencySymbol}${inventory.toLocaleString()} tied up in inventory. If inventory turnover slows, your true liquidity will mirror the Quick Ratio.`,
    },
  ];

  // 11. Hero Text
  const heroText = `Your Quick Ratio (Acid-Test) is ${quickRatio}x with ${currencySymbol}${quickAssets.toLocaleString()} in liquid assets available to cover ${currencySymbol}${currentLiabilities.toLocaleString()} in short-term liabilities (Quick Working Capital: ${currencySymbol}${quickWorkingCapital.toLocaleString()}).`;

  return {
    primaryOutput: quickRatio,
    quickRatio,
    currentRatio,
    cashRatio,
    quickAssets,
    derivedCurrentAssets,
    totalCurrentAssets,
    currentLiabilities,
    cashAndEquivalents,
    marketableSecurities,
    accountsReceivable,
    inventory,
    prepaidExpenses,
    otherIlliquidAssets,
    quickWorkingCapital,
    netWorkingCapital,
    defensiveIntervalDays,
    dailyOperatingExpenses,
    targetQuickRatio,
    requiredQuickAssets,
    liquidityGap,
    maxAllowableShortTermDebt,
    debtCapacityHeadroom,
    assetBreakdownList,
    recommendations,
    healthVerdict,
    healthTitle,
    healthColor,
    heroText,
    calculationMode,
    currencySymbol,
  };
}

export const calculateQuickRatioTool = calculateQuickRatioCalculator;
export const calculateAcidTestRatioCalculator = calculateQuickRatioCalculator;
