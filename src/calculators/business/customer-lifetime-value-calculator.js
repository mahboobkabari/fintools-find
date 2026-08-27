/**
 * Flagship Customer Lifetime Value (CLV / LTV), LTV:CAC & Unit Economics Engine (Math Engine V2)
 * Supports both Subscription/SaaS (ARPU + Monthly Churn) and E-Commerce/Transactional (AOV + Frequency + Lifespan)
 * business models, discounted cash-flow LTV, CAC Payback Period, 12-Month Cohort Retention Schedules, and Sensitivity Levers.
 * 
 * @param {Object} inputs
 * @param {string} [inputs.businessModel='saas'] - 'saas' | 'ecommerce'
 * @param {number} [inputs.arpu=3500] - Average Monthly Revenue Per User / Account (₹, $, etc.)
 * @param {number} [inputs.monthlyChurnPct=3.5] - Monthly customer churn rate % (for SaaS)
 * @param {number} [inputs.aov=2500] - Average Order Value (for E-Commerce)
 * @param {number} [inputs.purchaseFrequency=4] - Average orders per customer per year (for E-Commerce)
 * @param {number} [inputs.customerLifespanYears=3] - Average customer lifespan in years (for E-Commerce)
 * @param {number} [inputs.grossMarginPct=75] - Product/Service Gross Margin %
 * @param {number} [inputs.cac=15000] - Customer Acquisition Cost (Blended CAC)
 * @param {number} [inputs.annualDiscountRate=10] - Annual discount rate / cost of capital % for DCF LTV
 * @param {number} [inputs.cohortSize=1000] - Initial cohort acquisition size for retention schedule
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const DEFAULT_CLV_INPUTS = {
  businessModel: 'saas',
  arpu: 3500,
  monthlyChurnPct: 3.5,
  aov: 2500,
  purchaseFrequency: 4,
  customerLifespanYears: 3,
  grossMarginPct: 75,
  cac: 15000,
  annualDiscountRate: 10,
  cohortSize: 1000,
  currencySymbol: '₹',
};

export function calculateCustomerLifetimeValueCalculator(inputs = {}) {
  const merged = { ...DEFAULT_CLV_INPUTS, ...inputs };

  const model = String(merged.businessModel || 'saas').toLowerCase();
  const rawMargin = Number(merged.grossMarginPct);
  const grossMargin = isNaN(rawMargin) ? 75 : Math.max(1, Math.min(100, rawMargin));
  const marginDecimal = grossMargin / 100;

  const rawCac = Number(merged.cac);
  const cac = isNaN(rawCac) ? 15000 : Math.max(0, rawCac);

  const rawDiscount = Number(merged.annualDiscountRate);
  const annualDiscountRate = isNaN(rawDiscount) ? 10 : Math.max(0, Math.min(50, rawDiscount));
  const monthlyDiscountRate = annualDiscountRate / 100 / 12;

  const cohortSize = Math.max(10, Math.min(1000000, Number(merged.cohortSize) || 1000));
  const currencySymbol = merged.currencySymbol || '₹';

  let grossLtv = 0;
  let netLtv = 0;
  let discountedLtv = 0;
  let averageLifespanMonths = 0;
  let monthlyMarginPerCustomer = 0;

  // 1. Core Model Calculations
  if (model === 'ecommerce') {
    const rawAov = Number(merged.aov);
    const aov = isNaN(rawAov) ? 2500 : Math.max(0, rawAov);

    const rawFreq = Number(merged.purchaseFrequency);
    const freq = isNaN(rawFreq) ? 4 : Math.max(0.1, Math.min(365, rawFreq));

    const rawLife = Number(merged.customerLifespanYears);
    const lifespanYears = isNaN(rawLife) ? 3 : Math.max(0.1, Math.min(50, rawLife));

    averageLifespanMonths = Math.round(lifespanYears * 12 * 10) / 10;
    const annualRevenuePerCustomer = aov * freq;
    grossLtv = Math.round(annualRevenuePerCustomer * lifespanYears);
    netLtv = Math.round(grossLtv * marginDecimal);
    monthlyMarginPerCustomer = (annualRevenuePerCustomer * marginDecimal) / 12;

    // Discounted E-Commerce LTV (annual discrete discounting)
    let dcfLtv = 0;
    const annualDiscount = annualDiscountRate / 100;
    for (let yr = 1; yr <= Math.ceil(lifespanYears); yr++) {
      const yrWeight = yr <= Math.floor(lifespanYears) ? 1 : lifespanYears - Math.floor(lifespanYears);
      const discountedYearCash = (annualRevenuePerCustomer * marginDecimal * yrWeight) / Math.pow(1 + annualDiscount, yr);
      dcfLtv += discountedYearCash;
    }
    discountedLtv = Math.round(dcfLtv);
  } else {
    // SaaS / Subscription Model
    const rawArpu = Number(merged.arpu);
    const arpu = isNaN(rawArpu) ? 3500 : Math.max(0, rawArpu);

    const rawChurn = Number(merged.monthlyChurnPct);
    const monthlyChurn = isNaN(rawChurn) ? 3.5 : Math.max(0.01, Math.min(100, rawChurn));
    const churnDecimal = monthlyChurn / 100;

    averageLifespanMonths = Math.round((1 / churnDecimal) * 10) / 10;
    grossLtv = Math.round(arpu * (1 / churnDecimal));
    netLtv = Math.round(grossLtv * marginDecimal);
    monthlyMarginPerCustomer = arpu * marginDecimal;

    // Discounted SaaS LTV formula: (ARPU * GM) / (Churn + Monthly Discount Rate)
    discountedLtv = Math.round((arpu * marginDecimal) / (churnDecimal + monthlyDiscountRate));
  }

  // 2. Unit Economics: LTV:CAC Ratio & Payback Period
  const ltvCacRatio = cac > 0 ? Math.round((netLtv / cac) * 100) / 100 : Infinity;
  const cacPaybackMonths = monthlyMarginPerCustomer > 0 ? Math.round((cac / monthlyMarginPerCustomer) * 10) / 10 : 0;
  const netCustomerProfit = netLtv - cac;

  // 3. Unit Economics Health Score & Rating
  let rating = 'IDEAL';
  let ratingTitle = 'Gold Standard Unit Economics (3.0x - 5.0x)';
  let ratingBadge = 'bg-semantic-success text-white';
  let ratingColor = 'text-semantic-success';

  if (ltvCacRatio < 1.0) {
    rating = 'CRITICAL';
    ratingTitle = 'Insolvent Unit Economics (LTV < CAC)';
    ratingBadge = 'bg-rose-600 text-white';
    ratingColor = 'text-rose-600';
  } else if (ltvCacRatio < 3.0) {
    rating = 'SUBOPTIMAL';
    ratingTitle = 'Sub-Optimal Margin (1.0x - 3.0x)';
    ratingBadge = 'bg-amber-500 text-white';
    ratingColor = 'text-amber-600';
  } else if (ltvCacRatio > 5.0) {
    rating = 'UNDERINVESTING';
    ratingTitle = 'High Capital Efficiency (> 5.0x, Scale CAC)';
    ratingBadge = 'bg-indigo-600 text-white';
    ratingColor = 'text-indigo-600';
  }

  // 4. 12-Month Cohort Retention & Cumulative Value Schedule
  const cohortSchedule = [];
  const monthlyChurnRate = model === 'ecommerce'
    ? 1 - Math.pow(1 - 0.5, 1 / 12) // approximate 50% annual decay
    : (Number(merged.monthlyChurnPct) || 3.5) / 100;

  let cumulativeRevenue = 0;
  let cumulativeGrossProfit = 0;
  const initialAcquisitionCost = cohortSize * cac;

  for (let m = 1; m <= 12; m++) {
    const retainedPct = Math.pow(1 - monthlyChurnRate, m - 1);
    const activeCustomers = Math.round(cohortSize * retainedPct);
    const monthlyRevPerUser = model === 'ecommerce'
      ? (Number(merged.aov) || 2500) * ((Number(merged.purchaseFrequency) || 4) / 12)
      : Number(merged.arpu) || 3500;

    const monthlyCohortRev = Math.round(activeCustomers * monthlyRevPerUser);
    const monthlyCohortProfit = Math.round(monthlyCohortRev * marginDecimal);

    cumulativeRevenue += monthlyCohortRev;
    cumulativeGrossProfit += monthlyCohortProfit;
    const netCohortValue = cumulativeGrossProfit - initialAcquisitionCost;

    cohortSchedule.push({
      month: m,
      activeCustomers,
      retentionPct: Math.round(retainedPct * 1000) / 10,
      monthlyRevenue: monthlyCohortRev,
      cumulativeRevenue,
      cumulativeGrossProfit,
      netCohortValue,
      isPaybackAchieved: cumulativeGrossProfit >= initialAcquisitionCost,
    });
  }

  // 5. Sensitivity & Growth Levers
  const sensitivityLevers = [
    {
      lever: 'Current Baseline',
      netLtv,
      ltvCacRatio,
      cacPaybackMonths,
      impact: '0%',
    },
    {
      lever: '10% Price / ARPU Expansion',
      netLtv: Math.round(netLtv * 1.1),
      ltvCacRatio: cac > 0 ? Math.round(((netLtv * 1.1) / cac) * 100) / 100 : Infinity,
      cacPaybackMonths: Math.round((cac / (monthlyMarginPerCustomer * 1.1)) * 10) / 10,
      impact: '+10.0% LTV',
    },
    {
      lever: '20% Churn Reduction',
      netLtv: Math.round(netLtv * 1.25),
      ltvCacRatio: cac > 0 ? Math.round(((netLtv * 1.25) / cac) * 100) / 100 : Infinity,
      cacPaybackMonths,
      impact: '+25.0% LTV',
    },
    {
      lever: '15% CAC Optimization',
      netLtv,
      ltvCacRatio: cac > 0 ? Math.round((netLtv / (cac * 0.85)) * 100) / 100 : Infinity,
      cacPaybackMonths: Math.round((cac * 0.85 / monthlyMarginPerCustomer) * 10) / 10,
      impact: '+17.6% LTV:CAC',
    },
  ];

  // 6. Smart Ranked Action Recommendations
  const recommendations = [
    {
      rank: 1,
      title: ltvCacRatio >= 3.0 ? 'Venture Scale LTV:CAC Unit Economics' : 'Optimize Unit Economics Before Scaling Paid Spend',
      savings: Math.max(0, Math.round(cac - netLtv / 3)),
      action: ltvCacRatio >= 3.0
        ? `Your LTV:CAC ratio is ${ltvCacRatio}x with a ${cacPaybackMonths}-month payback. This indicates excellent unit economics. You can comfortably increase paid marketing acquisition spend.`
        : `Your LTV:CAC ratio is ${ltvCacRatio}x (under the 3.0x benchmark). Focus on reducing CAC by ${currencySymbol}${Math.max(0, Math.round(cac - netLtv / 3)).toLocaleString()} or reducing churn to prevent unprofitable customer acquisition.`,
    },
    {
      rank: 2,
      title: cacPaybackMonths <= 12 ? 'Healthy CAC Payback Horizon' : 'Extended Payback Period Pressures Working Capital',
      savings: 0,
      action: cacPaybackMonths <= 12
        ? `CAC payback is ${cacPaybackMonths} months, well within the 12-month venture capital ideal. Your working capital is recycled rapidly into new growth.`
        : `It takes ${cacPaybackMonths} months to recover your ${currencySymbol}${cac.toLocaleString()} CAC. Consider offering annual upfront billing with discounts to collect full CAC at contract signing.`,
    },
    {
      rank: 3,
      title: grossMargin >= 70 ? 'High Gross Margin Leverage' : 'COGS & Hosting Optimization Opportunity',
      savings: Math.round(netLtv * 0.05),
      action: grossMargin >= 70
        ? `Gross margin of ${grossMargin}% delivers strong gross profit conversion (${currencySymbol}${Math.round(monthlyMarginPerCustomer).toLocaleString()}/customer/month).`
        : `Gross margin is ${grossMargin}%. Optimizing infrastructure hosting, payment gateway fees, and onboarding costs will expand net LTV significantly.`,
    },
  ];

  // 7. Hero Verdict Summary
  const heroText = `Customer Lifetime Value (LTV) is ${currencySymbol}${netLtv.toLocaleString()} against a CAC of ${currencySymbol}${cac.toLocaleString()}, delivering a ${ltvCacRatio}x LTV:CAC ratio with a ${cacPaybackMonths}-month payback period.`;

  return {
    primaryOutput: netLtv,
    businessModel: model,
    grossLtv,
    netLtv,
    discountedLtv,
    cac,
    ltvCacRatio,
    cacPaybackMonths,
    netCustomerProfit,
    grossMargin,
    averageLifespanMonths,
    monthlyMarginPerCustomer,
    rating,
    ratingTitle,
    ratingBadge,
    ratingColor,
    cohortSchedule,
    sensitivityLevers,
    recommendations,
    heroText,
    currencySymbol,
  };
}

export const calculateCustomerLifetimeValueTool = calculateCustomerLifetimeValueCalculator;
