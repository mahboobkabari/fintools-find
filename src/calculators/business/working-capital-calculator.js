
/**
 * Flagship Working Capital, Liquidity Ratios & Cash Conversion Cycle Decision Engine (Math Engine V2)
 * Supports institutional corporate treasury, working capital turnover, liquidity scoring, and trapped cash optimization.
 * 
 * @param {Object} inputs
 * @param {number} [inputs.cash=500000] - Cash and marketable securities (₹, $, £, etc.)
 * @param {number} [inputs.accountsReceivable=1200000] - Trade debtors / Accounts receivable
 * @param {number} [inputs.inventory=800000] - Raw materials, WIP, and finished goods inventory
 * @param {number} [inputs.otherCurrentAssets=100000] - Prepaid expenses & other short-term assets
 * @param {number} [inputs.accountsPayable=900000] - Trade creditors / Accounts payable
 * @param {number} [inputs.shortTermDebt=400000] - Short-term bank loans, overdrafts, and credit lines
 * @param {number} [inputs.accruedExpenses=200000] - Outstanding wages, taxes, and accrued liabilities
 * @param {number} [inputs.annualRevenue=10000000] - Annual gross revenue / sales
 * @param {number} [inputs.annualCogs=6000000] - Annual Cost of Goods Sold (COGS)
 * @param {number} [inputs.costOfCapital=12] - Short-term borrowing cost / Overdraft interest rate %
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const INDUSTRY_WORKING_CAPITAL_BENCHMARKS = {
  ecommerce: { name: 'E-Commerce Retail', targetCurrentRatio: 1.5, targetDSO: 5, targetDIO: 35, targetDPO: 45, targetCCC: -5 },
  manufacturing: { name: 'Industrial Manufacturing', targetCurrentRatio: 1.8, targetDSO: 45, targetDIO: 60, targetDPO: 45, targetCCC: 60 },
  saas: { name: 'Software & SaaS Services', targetCurrentRatio: 2.0, targetDSO: 30, targetDIO: 0, targetDPO: 30, targetCCC: 0 },
  wholesale: { name: 'Wholesale Distribution', targetCurrentRatio: 1.4, targetDSO: 40, targetDIO: 45, targetDPO: 35, targetCCC: 50 },
  healthcare: { name: 'Hospital & Healthcare', targetCurrentRatio: 1.6, targetDSO: 50, targetDIO: 25, targetDPO: 40, targetCCC: 35 },
  construction: { name: 'Commercial Construction', targetCurrentRatio: 1.3, targetDSO: 75, targetDIO: 30, targetDPO: 60, targetCCC: 45 },
};

export const DEFAULT_WORKING_CAPITAL_INPUTS = {
  cash: 500000,
  accountsReceivable: 1200000,
  inventory: 800000,
  otherCurrentAssets: 100000,
  accountsPayable: 900000,
  shortTermDebt: 400000,
  accruedExpenses: 200000,
  annualRevenue: 10000000,
  annualCogs: 6000000,
  costOfCapital: 12,
  currencySymbol: '₹',
};

export function calculateWorkingCapitalCalculator(inputs = {}) {
  const merged = { ...DEFAULT_WORKING_CAPITAL_INPUTS, ...inputs };

  const numCash = Math.max(0, Number(merged.cash) || 0);
  const numAr = Math.max(0, Number(merged.accountsReceivable) || 0);
  const numInv = Math.max(0, Number(merged.inventory) || 0);
  const numOca = Math.max(0, Number(merged.otherCurrentAssets) || 0);

  const numAp = Math.max(0, Number(merged.accountsPayable) || 0);
  const numStd = Math.max(0, Number(merged.shortTermDebt) || 0);
  const numAccrued = Math.max(0, Number(merged.accruedExpenses) || 0);

  const revenue = Math.max(0, Number(merged.annualRevenue) || 0);
  const cogs = Math.max(0, Number(merged.annualCogs) || 0);
  const cocRate = Math.max(0, Math.min(50, Number(merged.costOfCapital) || 0));
  const currencySymbol = merged.currencySymbol || '₹';

  // 1. Total Current Assets & Total Current Liabilities
  const totalCurrentAssets = numCash + numAr + numInv + numOca;
  const totalCurrentLiabilities = numAp + numStd + numAccrued;

  // 2. Net Working Capital (NWC)
  const netWorkingCapital = totalCurrentAssets - totalCurrentLiabilities;
  const isSurplus = netWorkingCapital >= 0;

  // 3. Liquidity Ratios
  const currentRatio = totalCurrentLiabilities > 0
    ? Math.round((totalCurrentAssets / totalCurrentLiabilities) * 100) / 100
    : totalCurrentAssets > 0 ? 99.9 : 0;

  const quickAssets = numCash + numAr;
  const quickRatio = totalCurrentLiabilities > 0
    ? Math.round((quickAssets / totalCurrentLiabilities) * 100) / 100
    : quickAssets > 0 ? 99.9 : 0;

  const cashRatio = totalCurrentLiabilities > 0
    ? Math.round((numCash / totalCurrentLiabilities) * 100) / 100
    : numCash > 0 ? 99.9 : 0;

  // 4. Working Capital Efficiency Ratios
  const workingCapitalTurnover = (revenue > 0 && netWorkingCapital > 0)
    ? Math.round((revenue / netWorkingCapital) * 100) / 100
    : 0;

  const workingCapitalAsPctOfRevenue = revenue > 0
    ? Math.round((netWorkingCapital / revenue) * 10000) / 100
    : 0;

  // 5. Operating Cycle & Cash Conversion Cycle (CCC) in Days
  const dso = revenue > 0 ? Math.round((numAr / revenue) * 365) : 0;
  const dio = cogs > 0 ? Math.round((numInv / cogs) * 365) : 0;
  const dpo = cogs > 0 ? Math.round((numAp / cogs) * 365) : 0;
  const operatingCycle = dso + dio;
  const cashConversionCycle = dio + dso - dpo;

  // 6. Annual Financing Cost of Trapped Working Capital
  const annualInterestCost = netWorkingCapital > 0
    ? Math.round(netWorkingCapital * (cocRate / 100))
    : 0;

  // Potential Cash Unlock by reducing DSO & DIO by 15%
  const potentialDsoSavings = revenue > 0 ? Math.round(numAr * 0.15) : 0;
  const potentialDioSavings = cogs > 0 ? Math.round(numInv * 0.15) : 0;
  const totalPotentialCashUnlock = potentialDsoSavings + potentialDioSavings;
  const annualInterestSaved = Math.round(totalPotentialCashUnlock * (cocRate / 100));

  // 7. Liquidity Health Score (0 to 100)
  let healthScore = 50;
  if (currentRatio >= 1.5 && currentRatio <= 2.5) healthScore += 25;
  else if (currentRatio >= 1.2 && currentRatio < 1.5) healthScore += 15;
  else if (currentRatio >= 1.0 && currentRatio < 1.2) healthScore += 5;
  else if (currentRatio < 1.0) healthScore -= 30;

  if (quickRatio >= 1.0) healthScore += 15;
  else if (quickRatio >= 0.8) healthScore += 5;
  else healthScore -= 15;

  if (cashConversionCycle <= 60 && cashConversionCycle >= 0) healthScore += 10;
  else if (cashConversionCycle < 0) healthScore += 15; // Negative CCC (Amazon/Dell model)
  else if (cashConversionCycle > 120) healthScore -= 15;

  healthScore = Math.max(10, Math.min(100, healthScore));

  let healthStatus = 'Optimal Liquidity';
  let healthColor = 'text-semantic-success';
  if (healthScore < 40) {
    healthStatus = 'Severe Liquidity Deficit (Risk)';
    healthColor = 'text-rose-600';
  } else if (healthScore < 70) {
    healthStatus = 'Moderate Liquidity (Tight)';
    healthColor = 'text-amber-600';
  }

  // 8. Scenario Sensitivity Comparisons (Optimistic Cash Flow, Current, Stressed)
  const scenarios = {
    current: {
      label: 'Current Position',
      nwc: netWorkingCapital,
      currentRatio,
      ccc: cashConversionCycle,
    },
    optimized: {
      label: 'Optimized (15% Faster Collections)',
      nwc: netWorkingCapital - totalPotentialCashUnlock,
      currentRatio: totalCurrentLiabilities > 0
        ? Math.round(((totalCurrentAssets - totalPotentialCashUnlock + totalPotentialCashUnlock) / totalCurrentLiabilities) * 100) / 100
        : currentRatio,
      ccc: Math.max(-10, cashConversionCycle - Math.round((dso + dio) * 0.15)),
      cashFreed: totalPotentialCashUnlock,
    },
    stressed: {
      label: 'Stressed (30-Day Collection Delay)',
      nwc: netWorkingCapital + Math.round((revenue / 365) * 30),
      currentRatio: totalCurrentLiabilities > 0
        ? Math.round(((totalCurrentAssets) / (totalCurrentLiabilities + Math.round((revenue / 365) * 30 * 0.5))) * 100) / 100
        : currentRatio,
      ccc: cashConversionCycle + 30,
      extraFinancingCost: Math.round(Math.round((revenue / 365) * 30) * (cocRate / 100)),
    },
  };

  // 9. Smart Ranked Recommendations
  const recommendations = [
    {
      rank: 1,
      title: isSurplus ? 'Accelerate Cash Collection Cycle' : 'Urgent Working Capital Injection Required',
      savings: totalPotentialCashUnlock,
      action: isSurplus
        ? `Compressing Days Sales Outstanding (DSO: ${dso} days) and Inventory (DIO: ${dio} days) by 15% can unlock ${currencySymbol}${totalPotentialCashUnlock.toLocaleString()} in liquid cash, saving ${currencySymbol}${annualInterestSaved.toLocaleString()} in annual interest.`
        : `Current liabilities exceed current assets by ${currencySymbol}${Math.abs(netWorkingCapital).toLocaleString()} (Current Ratio: ${currentRatio}). Secure an emergency working capital term loan or invoice factoring to avoid supplier default.`,
    },
    {
      rank: 2,
      title: 'Accounts Payable Negotiation (DPO Optimization)',
      savings: dpo,
      action: `Current Days Payable Outstanding is ${dpo} days. Negotiating 15-day extended vendor credit terms can fund short-term operational cycles without external debt.`,
    },
    {
      rank: 3,
      title: 'Current vs Quick Ratio Balance',
      savings: numInv,
      action: `Inventory represents ${totalCurrentAssets > 0 ? Math.round((numInv / totalCurrentAssets) * 100) : 0}% of current assets. Quick Ratio is ${quickRatio}. Implement Just-in-Time (JIT) stocking to prevent dead capital buildup.`,
    },
  ];

  // 10. Hero Decision Verdict Text
  const heroText = isSurplus
    ? `Net Working Capital is positive at ${currencySymbol}${netWorkingCapital.toLocaleString()} (Current Ratio: ${currentRatio}). Cash Conversion Cycle is ${cashConversionCycle} days.`
    : `Working Capital Deficit of ${currencySymbol}${Math.abs(netWorkingCapital).toLocaleString()} detected (Current Ratio: ${currentRatio} < 1.0). Immediate short-term liquidity risk.`;

  return {
    primaryOutput: netWorkingCapital,
    totalCurrentAssets,
    totalCurrentLiabilities,
    netWorkingCapital,
    isSurplus,
    currentRatio,
    quickRatio,
    cashRatio,
    workingCapitalTurnover,
    workingCapitalAsPctOfRevenue,
    dso,
    dio,
    dpo,
    operatingCycle,
    cashConversionCycle,
    annualInterestCost,
    totalPotentialCashUnlock,
    annualInterestSaved,
    healthScore,
    healthStatus,
    healthColor,
    currencySymbol,
    scenarios,
    recommendations,
    heroText,
  };
}

export const calculateWorkingCapitalTool = calculateWorkingCapitalCalculator;
