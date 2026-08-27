/**
 * Flagship Customer Acquisition Cost (CAC), Blended vs Paid CAC & Marketing Efficiency Engine (Math Engine V2)
 * Supports itemized acquisition expenditures, Paid CAC vs Blended CAC decomposition, Organic Multipliers,
 * CAC Payback Period (Months), SaaS Magic Number, Channel Allocation, and Cost Optimization Scenarios.
 * 
 * @param {Object} inputs
 * @param {number} [inputs.paidAdSpend=300000] - Total paid advertising spend (Google, Meta, LinkedIn, etc.)
 * @param {number} [inputs.salesSalaries=250000] - Sales team salaries, SDR payroll & commissions
 * @param {number} [inputs.marketingSalaries=150000] - Marketing team salaries & growth personnel
 * @param {number} [inputs.softwareTools=50000] - Marketing SaaS tools, CRM licenses & analytics
 * @param {number} [inputs.agencyFees=50000] - External creative agency, SEO & copywriting fees
 * @param {number} [inputs.paidCustomers=200] - Number of new customers acquired via paid ads
 * @param {number} [inputs.organicCustomers=100] - Number of new customers acquired via organic, SEO & referrals
 * @param {number} [inputs.monthlyArpu=3500] - Average Monthly Revenue Per User / Account (ARPU)
 * @param {number} [inputs.grossMarginPct=75] - Product/Service Gross Margin %
 * @param {number} [inputs.customerLifetimeMonths=24] - Estimated customer tenure in months
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const DEFAULT_CAC_INPUTS = {
  paidAdSpend: 300000,
  salesSalaries: 250000,
  marketingSalaries: 150000,
  softwareTools: 50000,
  agencyFees: 50000,
  paidCustomers: 200,
  organicCustomers: 100,
  monthlyArpu: 3500,
  grossMarginPct: 75,
  customerLifetimeMonths: 24,
  currencySymbol: '₹',
};

export function calculateCustomerAcquisitionCostCalculator(inputs = {}) {
  const merged = { ...DEFAULT_CAC_INPUTS, ...inputs };

  // 1. Itemized Expenses
  const rawAd = Number(merged.paidAdSpend);
  const paidAdSpend = isNaN(rawAd) ? 300000 : Math.max(0, rawAd);

  const rawSales = Number(merged.salesSalaries);
  const salesSalaries = isNaN(rawSales) ? 250000 : Math.max(0, rawSales);

  const rawMktg = Number(merged.marketingSalaries);
  const marketingSalaries = isNaN(rawMktg) ? 150000 : Math.max(0, rawMktg);

  const rawTools = Number(merged.softwareTools);
  const softwareTools = isNaN(rawTools) ? 50000 : Math.max(0, rawTools);

  const rawAgency = Number(merged.agencyFees);
  const agencyFees = isNaN(rawAgency) ? 50000 : Math.max(0, rawAgency);

  const totalAcquisitionSpend = paidAdSpend + salesSalaries + marketingSalaries + softwareTools + agencyFees;

  // 2. Customer Acquisition Volumes
  const rawPaidCust = Number(merged.paidCustomers);
  const paidCustomers = isNaN(rawPaidCust) ? 200 : Math.max(0, rawPaidCust);

  const rawOrgCust = Number(merged.organicCustomers);
  const organicCustomers = isNaN(rawOrgCust) ? 100 : Math.max(0, rawOrgCust);

  const totalCustomers = paidCustomers + organicCustomers;

  // 3. Paid CAC vs Blended CAC
  const paidCac = paidCustomers > 0 ? Math.round(paidAdSpend / paidCustomers) : 0;
  const blendedCac = totalCustomers > 0 ? Math.round(totalAcquisitionSpend / totalCustomers) : 0;
  const fullyLoadedPaidCac = paidCustomers > 0 ? Math.round(totalAcquisitionSpend / paidCustomers) : 0;

  const organicSharePct = totalCustomers > 0 ? Math.round((organicCustomers / totalCustomers) * 1000) / 10 : 0;
  const organicMultiplier = paidCustomers > 0 ? Math.round((totalCustomers / paidCustomers) * 100) / 100 : 1;

  // 4. Payback Period & Unit Economics Conversion
  const rawArpu = Number(merged.monthlyArpu);
  const monthlyArpu = isNaN(rawArpu) ? 3500 : Math.max(0, rawArpu);

  const rawMargin = Number(merged.grossMarginPct);
  const grossMarginPct = isNaN(rawMargin) ? 75 : Math.max(1, Math.min(100, rawMargin));
  const marginDecimal = grossMarginPct / 100;

  const rawTenure = Number(merged.customerLifetimeMonths);
  const customerLifetimeMonths = isNaN(rawTenure) ? 24 : Math.max(1, Math.min(240, rawTenure));

  const monthlyMarginPerCustomer = monthlyArpu * marginDecimal;
  const estimatedLtv = Math.round(monthlyMarginPerCustomer * customerLifetimeMonths);

  const cacPaybackMonths = monthlyMarginPerCustomer > 0 ? Math.round((blendedCac / monthlyMarginPerCustomer) * 10) / 10 : 0;
  const ltvCacRatio = blendedCac > 0 ? Math.round((estimatedLtv / blendedCac) * 100) / 100 : Infinity;
  const firstYearAcv = monthlyArpu * 12;
  const cacToAcvPct = firstYearAcv > 0 ? Math.round((blendedCac / firstYearAcv) * 1000) / 10 : 0;

  const currencySymbol = merged.currencySymbol || '₹';

  // 5. Acquisition Health Rating
  let rating = 'HEALTHY';
  let ratingTitle = 'Optimal Acquisition Efficiency (Payback < 12 Mo)';
  let ratingBadge = 'bg-semantic-success text-white';
  let ratingColor = 'text-semantic-success';

  if (cacPaybackMonths > 18 || (isFinite(ltvCacRatio) && ltvCacRatio < 2.0)) {
    rating = 'CRITICAL';
    ratingTitle = 'High CAC / Capital Drag (Payback > 18 Mo)';
    ratingBadge = 'bg-rose-600 text-white';
    ratingColor = 'text-rose-600';
  } else if (cacPaybackMonths > 12 || (isFinite(ltvCacRatio) && ltvCacRatio < 3.0)) {
    rating = 'MODERATE';
    ratingTitle = 'Moderate Payback Horizon (12 - 18 Mo)';
    ratingBadge = 'bg-amber-500 text-white';
    ratingColor = 'text-amber-600';
  } else if (cacPaybackMonths <= 6 && isFinite(ltvCacRatio) && ltvCacRatio >= 5.0) {
    rating = 'EXCEPTIONAL';
    ratingTitle = 'World-Class Efficiency (Scale Budget Rapidly)';
    ratingBadge = 'bg-indigo-600 text-white';
    ratingColor = 'text-indigo-600';
  }

  // 6. Expense Breakdown Structure
  const expenseBreakdown = [
    { label: 'Paid Ad Spend', amount: paidAdSpend, pct: totalAcquisitionSpend > 0 ? Math.round((paidAdSpend / totalAcquisitionSpend) * 100) : 0, colorClass: 'bg-primary' },
    { label: 'Sales Salaries & SDRs', amount: salesSalaries, pct: totalAcquisitionSpend > 0 ? Math.round((salesSalaries / totalAcquisitionSpend) * 100) : 0, colorClass: 'bg-indigo-500' },
    { label: 'Marketing Team Salaries', amount: marketingSalaries, pct: totalAcquisitionSpend > 0 ? Math.round((marketingSalaries / totalAcquisitionSpend) * 100) : 0, colorClass: 'bg-emerald-500' },
    { label: 'Software & CRM Licenses', amount: softwareTools, pct: totalAcquisitionSpend > 0 ? Math.round((softwareTools / totalAcquisitionSpend) * 100) : 0, colorClass: 'bg-amber-500' },
    { label: 'Agency & Creative Fees', amount: agencyFees, pct: totalAcquisitionSpend > 0 ? Math.round((agencyFees / totalAcquisitionSpend) * 100) : 0, colorClass: 'bg-rose-500' },
  ];

  // 7. CAC Optimization Scenarios
  const optimizationScenarios = [
    {
      scenario: 'Current Baseline',
      blendedCac,
      paybackMonths: cacPaybackMonths,
      ltvCacRatio,
      savings: '0%',
    },
    {
      scenario: '-20% Paid Ad Waste Optimization',
      blendedCac: totalCustomers > 0 ? Math.round((totalAcquisitionSpend - paidAdSpend * 0.2) / totalCustomers) : 0,
      paybackMonths: monthlyMarginPerCustomer > 0 ? Math.round(((totalAcquisitionSpend - paidAdSpend * 0.2) / totalCustomers / monthlyMarginPerCustomer) * 10) / 10 : 0,
      ltvCacRatio: totalCustomers > 0 ? Math.round((estimatedLtv / ((totalAcquisitionSpend - paidAdSpend * 0.2) / totalCustomers)) * 100) / 100 : Infinity,
      savings: `-${Math.round((paidAdSpend * 0.2 / totalAcquisitionSpend) * 100)}% Spend`,
    },
    {
      scenario: '+25% Organic Referral Inflow',
      blendedCac: (totalCustomers + Math.round(organicCustomers * 0.25)) > 0 ? Math.round(totalAcquisitionSpend / (totalCustomers + Math.round(organicCustomers * 0.25))) : 0,
      paybackMonths: monthlyMarginPerCustomer > 0 ? Math.round((totalAcquisitionSpend / (totalCustomers + Math.round(organicCustomers * 0.25)) / monthlyMarginPerCustomer) * 10) / 10 : 0,
      ltvCacRatio: Math.round((estimatedLtv / (totalAcquisitionSpend / (totalCustomers + Math.round(organicCustomers * 0.25)))) * 100) / 100,
      savings: '+25% Customers',
    },
    {
      scenario: '+15% Sales Close Rate Boost',
      blendedCac: Math.round(blendedCac * 0.87),
      paybackMonths: Math.round((cacPaybackMonths * 0.87) * 10) / 10,
      ltvCacRatio: Math.round((ltvCacRatio * 1.15) * 100) / 100,
      savings: '-13% CAC',
    },
  ];

  // 8. Smart Ranked Recommendations
  const recommendations = [
    {
      rank: 1,
      title: cacPaybackMonths <= 12 ? 'Healthy Customer Payback Dynamics' : 'High CAC Payback Pressuring Working Capital',
      savings: Math.max(0, Math.round(totalAcquisitionSpend * 0.15)),
      action: cacPaybackMonths <= 12
        ? `Your blended CAC payback of ${cacPaybackMonths} months is within the 12-month venture capital ideal. Your customer margin recovers acquisition outlay swiftly.`
        : `Your ${cacPaybackMonths}-month payback exceeds 12 months. Focus on eliminating low-converting paid keywords, automating SDR follow-ups, or offering annual upfront contracts to recover CAC faster.`,
    },
    {
      rank: 2,
      title: organicSharePct >= 30 ? 'Strong Organic Channel Flywheel' : 'High Dependency on Paid Advertising',
      savings: Math.round(paidAdSpend * 0.1),
      action: organicSharePct >= 30
        ? `Organic and referral channels generate ${organicSharePct}% of customer volume, providing an organic multiplier of ${organicMultiplier}x on paid acquisition.`
        : `Only ${organicSharePct}% of customer acquisition comes from organic/referral sources. Investing in SEO content and customer referral incentives will lower blended CAC sustainably.`,
    },
    {
      rank: 3,
      title: ltvCacRatio >= 3.0 ? 'Capital-Efficient Growth Engine' : 'Unit Economics Optimization Required',
      savings: 0,
      action: ltvCacRatio >= 3.0
        ? `Estimated LTV:CAC ratio is ${ltvCacRatio}x (${currencySymbol}${estimatedLtv.toLocaleString()} LTV vs ${currencySymbol}${blendedCac.toLocaleString()} CAC), supporting aggressive growth investment.`
        : `LTV:CAC ratio is ${ltvCacRatio}x. Improve product retention or increase price tiers before increasing top-of-funnel ad spend.`,
    },
  ];

  // 9. Hero Verdict
  const heroText = `Blended Customer Acquisition Cost (CAC) is ${currencySymbol}${blendedCac.toLocaleString()} across ${totalCustomers.toLocaleString()} new customers, achieving a ${cacPaybackMonths}-month payback horizon with a ${ltvCacRatio}x LTV:CAC ratio.`;

  return {
    primaryOutput: blendedCac,
    blendedCac,
    paidCac,
    fullyLoadedPaidCac,
    totalAcquisitionSpend,
    paidCustomers,
    organicCustomers,
    totalCustomers,
    organicSharePct,
    organicMultiplier,
    monthlyArpu,
    grossMarginPct,
    monthlyMarginPerCustomer,
    estimatedLtv,
    cacPaybackMonths,
    ltvCacRatio,
    cacToAcvPct,
    rating,
    ratingTitle,
    ratingBadge,
    ratingColor,
    expenseBreakdown,
    optimizationScenarios,
    recommendations,
    heroText,
    currencySymbol,
  };
}

export const calculateCustomerAcquisitionCostTool = calculateCustomerAcquisitionCostCalculator;
