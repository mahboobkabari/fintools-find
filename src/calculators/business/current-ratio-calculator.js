/**
 * Flagship Current Ratio (Working Capital Ratio) Intelligence Engine (Math Engine V2)
 * Comprehensive Balance Sheet Liquidity & Working Capital Solvency Framework:
 * 1. Direct Summary Mode vs Itemized Balance Sheet Component Mode
 * 2. Exact Current Ratio (Working Capital Ratio = Current Assets / Current Liabilities)
 * 3. Net Working Capital (NWC = Current Assets - Current Liabilities)
 * 4. Comparative Quick Ratio (Acid-Test) & Cash Ratio
 * 5. Inventory Concentration & Liquidity Drag %
 * 6. Target Working Capital Gap & Maximum Debt Sizing
 * 7. Multi-Tier Liquidity Underwriting Rating & Recommendations.
 * 
 * @param {Object} inputs
 * @param {string} [inputs.calculationMode='itemized'] - 'itemized' | 'direct'
 * @param {number} [inputs.totalCurrentAssets=15000000] - Total Current Assets (Direct Mode) (e.g. ₹1.5 Cr)
 * @param {number} [inputs.totalCurrentLiabilities=7500000] - Total Current Liabilities (Direct Mode) (e.g. ₹75 Lakhs)
 * @param {number} [inputs.cashAndEquivalents=3000000] - Cash & Bank Balances (e.g. ₹30 Lakhs)
 * @param {number} [inputs.marketableSecurities=1500000] - Short-term Marketable Securities (e.g. ₹15 Lakhs)
 * @param {number} [inputs.accountsReceivable=4500000] - Accounts Receivable / Trade Debtors (e.g. ₹45 Lakhs)
 * @param {number} [inputs.inventory=5000000] - Inventories (Raw materials, WIP, Finished goods) (e.g. ₹50 Lakhs)
 * @param {number} [inputs.prepaidExpenses=1000000] - Prepaid Expenses & Advances (e.g. ₹10 Lakhs)
 * @param {number} [inputs.otherCurrentAssets=0] - Other Short-Term Current Assets
 * @param {number} [inputs.accountsPayable=3500000] - Accounts Payable / Trade Creditors (e.g. ₹35 Lakhs)
 * @param {number} [inputs.shortTermDebt=2000000] - Short-Term Bank Borrowings & Overdrafts (e.g. ₹20 Lakhs)
 * @param {number} [inputs.currentPortionLongDebt=1000000] - Current Portion of Long-Term Debt (CPLTD) (e.g. ₹10 Lakhs)
 * @param {number} [inputs.accruedExpenses=1000000] - Accrued Payroll & Operating Expenses (e.g. ₹10 Lakhs)
 * @param {number} [inputs.otherCurrentLiabilities=0] - Taxes Payable & Other Current Liabilities
 * @param {number} [inputs.targetCurrentRatio=2.0] - Target Benchmark Current Ratio (e.g. 1.5x - 2.0x)
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const DEFAULT_CURRENT_RATIO_INPUTS = {
  calculationMode: 'itemized',
  totalCurrentAssets: 15000000,
  totalCurrentLiabilities: 7500000,
  cashAndEquivalents: 3000000,
  marketableSecurities: 1500000,
  accountsReceivable: 4500000,
  inventory: 5000000,
  prepaidExpenses: 1000000,
  otherCurrentAssets: 0,
  accountsPayable: 3500000,
  shortTermDebt: 2000000,
  currentPortionLongDebt: 1000000,
  accruedExpenses: 1000000,
  otherCurrentLiabilities: 0,
  targetCurrentRatio: 2.0,
  currencySymbol: '₹',
};

export function calculateCurrentRatioCalculator(inputs = {}) {
  const merged = { ...DEFAULT_CURRENT_RATIO_INPUTS, ...inputs };

  // 1. Input Sanitization & Clamping
  const calculationMode = merged.calculationMode || 'itemized';

  const rawDirCa = Number(merged.totalCurrentAssets);
  const directCurrentAssets = isNaN(rawDirCa) ? 15000000 : Math.max(0, rawDirCa);

  const rawDirCl = Number(merged.totalCurrentLiabilities);
  const directCurrentLiabilities = isNaN(rawDirCl) ? 7500000 : Math.max(0, rawDirCl);

  const rawCash = Number(merged.cashAndEquivalents);
  const cashAndEquivalents = isNaN(rawCash) ? 3000000 : Math.max(0, rawCash);

  const rawSec = Number(merged.marketableSecurities);
  const marketableSecurities = isNaN(rawSec) ? 1500000 : Math.max(0, rawSec);

  const rawAr = Number(merged.accountsReceivable);
  const accountsReceivable = isNaN(rawAr) ? 4500000 : Math.max(0, rawAr);

  const rawInv = Number(merged.inventory);
  const inventory = isNaN(rawInv) ? 5000000 : Math.max(0, rawInv);

  const rawPrep = Number(merged.prepaidExpenses);
  const prepaidExpenses = isNaN(rawPrep) ? 1000000 : Math.max(0, rawPrep);

  const rawOtherCa = Number(merged.otherCurrentAssets);
  const otherCurrentAssets = isNaN(rawOtherCa) ? 0 : Math.max(0, rawOtherCa);

  const rawAp = Number(merged.accountsPayable);
  const accountsPayable = isNaN(rawAp) ? 3500000 : Math.max(0, rawAp);

  const rawStDebt = Number(merged.shortTermDebt);
  const shortTermDebt = isNaN(rawStDebt) ? 2000000 : Math.max(0, rawStDebt);

  const rawCpltd = Number(merged.currentPortionLongDebt);
  const currentPortionLongDebt = isNaN(rawCpltd) ? 1000000 : Math.max(0, rawCpltd);

  const rawAccrued = Number(merged.accruedExpenses);
  const accruedExpenses = isNaN(rawAccrued) ? 1000000 : Math.max(0, rawAccrued);

  const rawOtherCl = Number(merged.otherCurrentLiabilities);
  const otherCurrentLiabilities = isNaN(rawOtherCl) ? 0 : Math.max(0, rawOtherCl);

  const rawTarget = Number(merged.targetCurrentRatio);
  const targetCurrentRatio = isNaN(rawTarget) || rawTarget <= 0 ? 2.0 : Math.max(0.5, Math.min(5.0, rawTarget));

  const currencySymbol = merged.currencySymbol || '₹';

  // 2. Aggregate Assets & Liabilities based on mode
  let effectiveCurrentAssets = directCurrentAssets;
  let effectiveCurrentLiabilities = directCurrentLiabilities;

  if (calculationMode === 'itemized') {
    effectiveCurrentAssets = (
      cashAndEquivalents +
      marketableSecurities +
      accountsReceivable +
      inventory +
      prepaidExpenses +
      otherCurrentAssets
    );

    effectiveCurrentLiabilities = (
      accountsPayable +
      shortTermDebt +
      currentPortionLongDebt +
      accruedExpenses +
      otherCurrentLiabilities
    );
  }

  // 3. Current Ratio Calculation
  // Current Ratio = Total Current Assets / Total Current Liabilities
  const currentRatio = effectiveCurrentLiabilities > 0
    ? Math.round((effectiveCurrentAssets / effectiveCurrentLiabilities) * 100) / 100
    : effectiveCurrentAssets > 0 ? 99.99 : 0;

  // 4. Net Working Capital (NWC)
  const netWorkingCapital = effectiveCurrentAssets - effectiveCurrentLiabilities;

  // 5. Comparative Liquidity Metrics: Quick Ratio & Cash Ratio
  const quickAssets = Math.max(0, effectiveCurrentAssets - inventory - prepaidExpenses - otherCurrentAssets);
  const quickRatio = effectiveCurrentLiabilities > 0
    ? Math.round((quickAssets / effectiveCurrentLiabilities) * 100) / 100
    : quickAssets > 0 ? 99.99 : 0;

  const absoluteCash = cashAndEquivalents + marketableSecurities;
  const cashRatio = effectiveCurrentLiabilities > 0
    ? Math.round((absoluteCash / effectiveCurrentLiabilities) * 100) / 100
    : absoluteCash > 0 ? 99.99 : 0;

  // 6. Inventory Concentration %
  const inventoryConcentrationPct = effectiveCurrentAssets > 0
    ? Math.round((inventory / effectiveCurrentAssets) * 1000) / 10
    : 0;

  // 7. Target Working Capital Gap & Borrowing Capacity Headroom
  // Target Assets = Current Liabilities * Target Ratio
  const requiredCurrentAssets = Math.round(effectiveCurrentLiabilities * targetCurrentRatio);
  const workingCapitalGap = requiredCurrentAssets - effectiveCurrentAssets; // Positive = Deficit, Negative = Surplus

  // Max Short-term liabilities supported at target ratio = Current Assets / Target Ratio
  const maxAllowableCurrentLiabilities = targetCurrentRatio > 0
    ? Math.round(effectiveCurrentAssets / targetCurrentRatio)
    : effectiveCurrentAssets;
  const shortTermBorrowingHeadroom = Math.max(0, maxAllowableCurrentLiabilities - effectiveCurrentLiabilities);

  // 8. Liquidity Health & Underwriting Classification
  let healthVerdict = 'HEALTHY';
  let healthTitle = 'Optimal Liquidity (1.5x - 2.5x Working Capital Ratio)';
  let healthColor = 'text-semantic-success';

  if (currentRatio < 1.0) {
    healthVerdict = 'WORKING_CAPITAL_DEFICIT';
    healthTitle = 'Severe Working Capital Deficit (Current Ratio < 1.00x - Solvency Risk)';
    healthColor = 'text-rose-600';
  } else if (currentRatio < 1.5) {
    healthVerdict = 'TIGHT_BUFFER';
    healthTitle = 'Tight Liquidity Buffer (Current Ratio < 1.50x)';
    healthColor = 'text-amber-600';
  } else if (currentRatio > 3.0) {
    healthVerdict = 'EXCESS_IDLE_CAPITAL';
    healthTitle = 'Excess Idle Capital (Current Ratio > 3.00x - Capital Inefficient)';
    healthColor = 'text-indigo-600';
  }

  // 9. Asset Breakdown Chart Items
  const assetBreakdownList = [
    { label: 'Cash & Bank Balances', amount: cashAndEquivalents, colorClass: 'bg-primary' },
    { label: 'Marketable Securities', amount: marketableSecurities, colorClass: 'bg-emerald-500' },
    { label: 'Accounts Receivable (Trade)', amount: accountsReceivable, colorClass: 'bg-indigo-500' },
    { label: 'Inventory (Raw/WIP/Finished)', amount: inventory, colorClass: 'bg-amber-500' },
    { label: 'Prepaid Expenses & Other', amount: prepaidExpenses + otherCurrentAssets, colorClass: 'bg-slate-400' },
  ];

  // 10. Strategic Recommendations
  const recommendations = [
    {
      rank: 1,
      title: 'Working Capital Cushion & Solvency',
      savings: Math.abs(netWorkingCapital),
      action: currentRatio >= 1.5
        ? `Your Current Ratio of ${currentRatio}x delivers ${currencySymbol}${netWorkingCapital.toLocaleString()} in Net Working Capital (NWC). You have ${currencySymbol}${((currentRatio - 1.0) * effectiveCurrentLiabilities).toLocaleString()} in liquid buffer above immediate short-term liabilities.`
        : `Your Current Ratio of ${currentRatio}x indicates tight solvency. To reach the recommended 1.50x benchmark, secure a ${currencySymbol}${Math.abs(workingCapitalGap).toLocaleString()} long-term debt or equity infusion.`,
    },
    {
      rank: 2,
      title: 'Inventory Liquidity & Acid-Test Spread',
      savings: inventory,
      action: `Inventory represents ${inventoryConcentrationPct}% of your total current assets (${currencySymbol}${inventory.toLocaleString()}). The ${(currentRatio - quickRatio).toFixed(2)}x gap between your Current Ratio (${currentRatio}x) and Quick Ratio (${quickRatio}x) reflects exposure to inventory holding and liquidation risks.`,
    },
    {
      rank: 3,
      title: 'Short-Term Debt & Vendor Payable Management',
      savings: effectiveCurrentLiabilities,
      action: `Short-term liabilities total ${currencySymbol}${effectiveCurrentLiabilities.toLocaleString()}. Converting short-term overdrafts into 3-to-5 year term debt can immediately raise your Current Ratio to ${((effectiveCurrentAssets / Math.max(1, effectiveCurrentLiabilities - shortTermDebt))).toFixed(2)}x.`,
    },
  ];

  // 11. Hero Text
  const heroText = `Your Current Ratio is ${currentRatio}x (Net Working Capital: ${currencySymbol}${netWorkingCapital.toLocaleString()}), indicating ${effectiveCurrentAssets >= effectiveCurrentLiabilities ? 'strong short-term debt coverage' : 'a working capital shortfall'} with ${currencySymbol}${effectiveCurrentAssets.toLocaleString()} in current assets against ${currencySymbol}${effectiveCurrentLiabilities.toLocaleString()} in obligations.`;

  return {
    primaryOutput: currentRatio,
    currentRatio,
    quickRatio,
    cashRatio,
    effectiveCurrentAssets,
    effectiveCurrentLiabilities,
    netWorkingCapital,
    directCurrentAssets,
    directCurrentLiabilities,
    cashAndEquivalents,
    marketableSecurities,
    accountsReceivable,
    inventory,
    prepaidExpenses,
    otherCurrentAssets,
    accountsPayable,
    shortTermDebt,
    currentPortionLongDebt,
    accruedExpenses,
    otherCurrentLiabilities,
    inventoryConcentrationPct,
    targetCurrentRatio,
    requiredCurrentAssets,
    workingCapitalGap,
    maxAllowableCurrentLiabilities,
    shortTermBorrowingHeadroom,
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

export const calculateCurrentRatioTool = calculateCurrentRatioCalculator;
export const calculateWorkingCapitalRatioCalculator = calculateCurrentRatioCalculator;
