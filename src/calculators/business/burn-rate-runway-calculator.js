/**
 * Flagship Startup Burn Rate, Cash Runway & Solvency Projection Engine (Math Engine V2)
 * Computes Gross Burn, Net Burn, Static Runway, Dynamic Runway with MoM Revenue & Expense Growth,
 * Zero Cash Date (ZCD), Default Alive vs Default Dead trajectory, and Cost-Cutting Runway Extensions.
 * 
 * @param {Object} inputs
 * @param {number} [inputs.cashBalance=5000000] - Total available liquid cash / bank treasury balance (₹, $, etc.)
 * @param {number} [inputs.monthlyRevenue=400000] - Monthly recurring revenue / cash collections
 * @param {number} [inputs.monthlyPayroll=600000] - Employee salaries, contractor fees & benefits
 * @param {number} [inputs.monthlyMarketing=150000] - Paid ads, growth marketing, sponsorships
 * @param {number} [inputs.monthlyServers=80000] - AWS/GCP cloud hosting, software tools & SaaS licenses
 * @param {number} [inputs.monthlyOffice=50000] - Rent, co-working, utilities, travel
 * @param {number} [inputs.monthlyOtherExpenses=20000] - Legal, accounting, compliance, miscellaneous
 * @param {number} [inputs.monthlyRevGrowthPct=5] - Expected month-over-month (MoM) revenue growth %
 * @param {number} [inputs.monthlyExpGrowthPct=2] - Expected month-over-month (MoM) expense inflation/hiring growth %
 * @param {number} [inputs.targetSafetyMonths=6] - Target runway buffer needed for next fundraising round
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const DEFAULT_BURN_INPUTS = {
  cashBalance: 5000000,
  monthlyRevenue: 400000,
  monthlyPayroll: 600000,
  monthlyMarketing: 150000,
  monthlyServers: 80000,
  monthlyOffice: 50000,
  monthlyOtherExpenses: 20000,
  monthlyRevGrowthPct: 5,
  monthlyExpGrowthPct: 2,
  targetSafetyMonths: 6,
  currencySymbol: '₹',
};

export function calculateBurnRateRunwayCalculator(inputs = {}) {
  const merged = { ...DEFAULT_BURN_INPUTS, ...inputs };

  const cash = Math.max(0, Number(merged.cashBalance) || 0);
  const revenue = Math.max(0, Number(merged.monthlyRevenue) || 0);

  // 1. Itemized Operating Outflows (Gross Burn)
  const payroll = Math.max(0, Number(merged.monthlyPayroll) || 0);
  const marketing = Math.max(0, Number(merged.monthlyMarketing) || 0);
  const servers = Math.max(0, Number(merged.monthlyServers) || 0);
  const office = Math.max(0, Number(merged.monthlyOffice) || 0);
  const otherExpenses = Math.max(0, Number(merged.monthlyOtherExpenses) || 0);

  const grossBurn = payroll + marketing + servers + office + otherExpenses;
  const netBurn = grossBurn - revenue;

  const rawRevGrowth = Number(merged.monthlyRevGrowthPct);
  const monthlyRevGrowth = isNaN(rawRevGrowth) ? 5 : Math.max(-50, Math.min(100, rawRevGrowth));

  const rawExpGrowth = Number(merged.monthlyExpGrowthPct);
  const monthlyExpGrowth = isNaN(rawExpGrowth) ? 2 : Math.max(-50, Math.min(100, rawExpGrowth));

  const rawSafetyMonths = Number(merged.targetSafetyMonths);
  const safetyMonths = isNaN(rawSafetyMonths) ? 6 : Math.max(1, Math.min(36, rawSafetyMonths));
  const currencySymbol = merged.currencySymbol || '₹';

  // 2. Static Runway Calculation
  let staticRunwayMonths = 0;
  let isProfitable = netBurn <= 0;

  if (isProfitable) {
    staticRunwayMonths = Infinity;
  } else if (cash > 0 && netBurn > 0) {
    staticRunwayMonths = Math.round((cash / netBurn) * 10) / 10;
  } else {
    staticRunwayMonths = 0;
  }

  // 3. Dynamic Month-by-Month Cash Trajectory (up to 36 months)
  const monthlyTrajectory = [];
  let currentCash = cash;
  let curRev = revenue;
  let curExp = grossBurn;
  let dynamicZeroCashMonth = null;
  let breakEvenMonth = null;
  let isDefaultAlive = isProfitable;

  const revMultiplier = 1 + monthlyRevGrowth / 100;
  const expMultiplier = 1 + monthlyExpGrowth / 100;

  for (let m = 1; m <= 36; m++) {
    curRev = Math.round(curRev * revMultiplier);
    curExp = Math.round(curExp * expMultiplier);
    const monthlyNetFlow = curRev - curExp;
    currentCash += monthlyNetFlow;

    if (curRev >= curExp && breakEvenMonth === null) {
      breakEvenMonth = m;
    }

    if (currentCash <= 0 && dynamicZeroCashMonth === null) {
      dynamicZeroCashMonth = m;
      currentCash = 0; // Floor at zero
    }

    monthlyTrajectory.push({
      month: m,
      revenue: curRev,
      grossBurn: curExp,
      netBurn: Math.max(0, curExp - curRev),
      netCashFlow: monthlyNetFlow,
      endingCash: Math.max(0, currentCash),
      isBreakeven: curRev >= curExp,
    });
  }

  if (breakEvenMonth !== null && (dynamicZeroCashMonth === null || breakEvenMonth < dynamicZeroCashMonth)) {
    isDefaultAlive = true;
  }

  const effectiveRunwayMonths = isProfitable
    ? 'Infinite (Profitable)'
    : dynamicZeroCashMonth !== null
      ? dynamicZeroCashMonth
      : staticRunwayMonths === Infinity
        ? 'Infinite'
        : staticRunwayMonths;

  // 4. Solvency Alert & Health Classification
  let alertStatus = 'HEALTHY';
  let alertTitle = 'Healthy Runway';
  let alertBadge = 'bg-semantic-success text-white';
  let alertColor = 'text-semantic-success';

  if (isProfitable) {
    alertStatus = 'PROFITABLE';
    alertTitle = 'Default Alive (Cash-Flow Positive)';
    alertBadge = 'bg-emerald-500 text-white';
    alertColor = 'text-emerald-600';
  } else if (staticRunwayMonths < 3) {
    alertStatus = 'CRITICAL';
    alertTitle = 'Critical Default Alert (< 3 Months)';
    alertBadge = 'bg-rose-600 text-white';
    alertColor = 'text-rose-600';
  } else if (staticRunwayMonths < 6) {
    alertStatus = 'URGENT';
    alertTitle = 'Active Fundraising Window (3 - 6 Months)';
    alertBadge = 'bg-amber-500 text-white';
    alertColor = 'text-amber-600';
  } else if (staticRunwayMonths <= 12) {
    alertStatus = 'MODERATE';
    alertTitle = 'Moderate Runway (6 - 12 Months)';
    alertBadge = 'bg-blue-600 text-white';
    alertColor = 'text-primary';
  }

  // 5. Fundraising Buffer Deficit/Surplus
  const runwayValueNumeric = typeof effectiveRunwayMonths === 'number' ? effectiveRunwayMonths : 999;
  const bufferGapMonths = Math.round((runwayValueNumeric - safetyMonths) * 10) / 10;
  const cashNeededForBuffer = !isProfitable && bufferGapMonths < 0 ? Math.round(Math.abs(bufferGapMonths) * netBurn) : 0;

  // 6. Cost-Cutting & Capital Injection Extension Scenarios
  const cut10Gross = grossBurn * 0.9;
  const cut10Net = Math.max(1, cut10Gross - revenue);
  const cut10Runway = Math.round((cash / cut10Net) * 10) / 10;

  const cut20Gross = grossBurn * 0.8;
  const cut20Net = Math.max(1, cut20Gross - revenue);
  const cut20Runway = Math.round((cash / cut20Net) * 10) / 10;

  const cut30Gross = grossBurn * 0.7;
  const cut30Net = Math.max(1, cut30Gross - revenue);
  const cut30Runway = Math.round((cash / cut30Net) * 10) / 10;

  const runwayScenarios = [
    {
      scenario: 'Current Baseline',
      grossBurn,
      netBurn,
      runwayMonths: isProfitable ? 'Infinite' : `${staticRunwayMonths} Mo`,
      extendedBy: '0 Mo',
    },
    {
      scenario: '10% Expense Reduction',
      grossBurn: Math.round(cut10Gross),
      netBurn: Math.round(cut10Net),
      runwayMonths: cut10Net <= 0 ? 'Infinite' : `${cut10Runway} Mo`,
      extendedBy: isProfitable ? '0 Mo' : `+${Math.max(0, Math.round((cut10Runway - staticRunwayMonths) * 10) / 10)} Mo`,
    },
    {
      scenario: '20% Expense Reduction',
      grossBurn: Math.round(cut20Gross),
      netBurn: Math.round(cut20Net),
      runwayMonths: cut20Net <= 0 ? 'Infinite' : `${cut20Runway} Mo`,
      extendedBy: isProfitable ? '0 Mo' : `+${Math.max(0, Math.round((cut20Runway - staticRunwayMonths) * 10) / 10)} Mo`,
    },
    {
      scenario: '30% Austerity Cut',
      grossBurn: Math.round(cut30Gross),
      netBurn: Math.round(cut30Net),
      runwayMonths: cut30Net <= 0 ? 'Infinite' : `${cut30Runway} Mo`,
      extendedBy: isProfitable ? '0 Mo' : `+${Math.max(0, Math.round((cut30Runway - staticRunwayMonths) * 10) / 10)} Mo`,
    },
  ];

  // 7. Smart Ranked Action Recommendations
  const recommendations = [
    {
      rank: 1,
      title: isProfitable
        ? 'Default Alive: Cash Flow Positive'
        : staticRunwayMonths < 6
          ? 'Initiate Immediate Capital Raising or Cost Reductions'
          : 'Comfortable Milestone Execution Horizon',
      savings: !isProfitable && staticRunwayMonths < 6 ? Math.round(grossBurn * 0.2) : 0,
      action: isProfitable
        ? `Monthly revenue of ${currencySymbol}${revenue.toLocaleString()} exceeds gross expenses of ${currencySymbol}${grossBurn.toLocaleString()}, generating ${currencySymbol}${Math.abs(netBurn).toLocaleString()}/month in free cash flow.`
        : staticRunwayMonths < 6
          ? `With only ${staticRunwayMonths} months of runway remaining (${currencySymbol}${netBurn.toLocaleString()}/mo net burn), you need to initiate investor pitches immediately or reduce monthly OpEx by 20% (${currencySymbol}${Math.round(grossBurn * 0.2).toLocaleString()}/mo) to extend runway.`
          : `You have ${staticRunwayMonths} months of operational runway. Focus on hitting key revenue milestones before kicking off your next fundraising round 6 months prior to cash depletion.`,
    },
    {
      rank: 2,
      title: payroll > grossBurn * 0.6 ? 'Payroll Represents Dominant Cost Center' : 'Balanced OpEx Distribution',
      savings: Math.round(payroll * 0.1),
      action: payroll > grossBurn * 0.6
        ? `Payroll accounts for ${Math.round((payroll / grossBurn) * 100)}% (${currencySymbol}${payroll.toLocaleString()}) of gross burn. Any aggressive runway extension requires freezing non-essential hiring or renegotiating contractor commitments.`
        : `Payroll is well-contained at ${Math.round((payroll / grossBurn) * 100)}% of gross monthly expenses.`,
    },
    {
      rank: 3,
      title: breakEvenMonth ? `Projected Break-Even in Month ${breakEvenMonth}` : 'Revenue Growth Pace',
      savings: 0,
      action: breakEvenMonth
        ? `At ${monthlyRevGrowth}% MoM revenue growth, the startup reaches profitability by Month ${breakEvenMonth}, requiring ${currencySymbol}${cash.toLocaleString()} total capital.`
        : `With ${monthlyRevGrowth}% MoM revenue growth vs ${monthlyExpGrowth}% expense inflation, monitor gross margins closely to ensure growth outpaces burn acceleration.`,
    },
  ];

  // 8. Hero Verdict Summary
  const heroText = isProfitable
    ? `Startup is Default Alive with monthly free cash flow of ${currencySymbol}${Math.abs(netBurn).toLocaleString()} and infinite cash runway on a ${currencySymbol}${cash.toLocaleString()} treasury reserve.`
    : `Current cash runway is ${staticRunwayMonths} months at a net burn of ${currencySymbol}${netBurn.toLocaleString()}/month (Gross: ${currencySymbol}${grossBurn.toLocaleString()}, Revenue: ${currencySymbol}${revenue.toLocaleString()}).`;

  return {
    primaryOutput: typeof staticRunwayMonths === 'number' ? staticRunwayMonths : 999,
    cashBalance: cash,
    monthlyRevenue: revenue,
    grossBurn,
    netBurn,
    staticRunwayMonths,
    effectiveRunwayMonths,
    isProfitable,
    isDefaultAlive,
    breakEvenMonth,
    dynamicZeroCashMonth,
    monthlyRevGrowth,
    monthlyExpGrowth,
    safetyMonths,
    bufferGapMonths,
    cashNeededForBuffer,
    alertStatus,
    alertTitle,
    alertBadge,
    alertColor,
    payroll,
    marketing,
    servers,
    office,
    otherExpenses,
    payrollPct: grossBurn > 0 ? Math.round((payroll / grossBurn) * 1000) / 10 : 0,
    marketingPct: grossBurn > 0 ? Math.round((marketing / grossBurn) * 1000) / 10 : 0,
    serversPct: grossBurn > 0 ? Math.round((servers / grossBurn) * 1000) / 10 : 0,
    officePct: grossBurn > 0 ? Math.round((office / grossBurn) * 1000) / 10 : 0,
    otherPct: grossBurn > 0 ? Math.round((otherExpenses / grossBurn) * 1000) / 10 : 0,
    monthlyTrajectory,
    runwayScenarios,
    recommendations,
    heroText,
    currencySymbol,
  };
}

export const calculateBurnRateRunwayTool = calculateBurnRateRunwayCalculator;
