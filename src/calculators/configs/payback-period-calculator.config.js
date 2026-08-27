/**
 * Configuration module for Payback Period Calculator (Simple & Discounted)
 */

export const PAYBACK_CONFIG = {
  meta: {
    title: 'Payback Period Calculator (Simple & Discounted)',
    description: 'Calculate Simple Payback Period, Discounted Payback Period (time-value-of-money), Net Present Value (NPV), and Profitability Index (PI) for capital investments.',
    category: 'business',
    categoryName: 'Business & Corporate Finance Calculators',
    slug: 'payback-period-calculator',
    route: '/tools/business/payback-period-calculator',
  },

  defaultInputs: {
    initialInvestment: 1000000, // ₹10 Lakhs
    cashFlowType: 'equal',
    annualCashFlow: 300000, // ₹3 Lakhs / year
    unevenCashFlows: [250000, 350000, 400000, 450000, 500000],
    discountRatePct: 10,
    projectLifeYears: 5,
    targetPaybackYears: 3.5,
  },

  fieldBoundaries: {
    initialInvestment: { min: 10000, max: 1000000000, step: 50000 },
    annualCashFlow: { min: 0, max: 1000000000, step: 25000 },
    discountRatePct: { min: 0, max: 50, step: 0.5 },
    projectLifeYears: { min: 1, max: 20, step: 1 },
    targetPaybackYears: { min: 0.5, max: 20, step: 0.5 },
  },

  disclaimers: {
    educationalNotice: 'This calculator provides a capital budgeting model to estimate investment recovery timelines. Simple payback measures raw cash recovery; discounted payback incorporates the time value of money.',
    limitationsNotice: 'Payback period measures liquidity recovery time, not total lifetime investment profitability. Cash flows generated after the payback cutoff period are excluded from payback metrics.',
  },

  scenarios: {
    equipmentUpgrade: {
      title: 'Machinery & Equipment Upgrade (₹10 Lakhs)',
      description: 'Capital equipment investment yielding uniform ₹3 Lakhs annual net cash savings over a 5-year operational life.',
      initialInvestment: 1000000,
      cashFlowType: 'equal',
      annualCashFlow: 300000,
      discountRatePct: 10,
      projectLifeYears: 5,
      targetPaybackYears: 4,
    },
    softwareAutomation: {
      title: 'Software Automation Project (₹5 Lakhs)',
      description: 'IT workflow automation project with uneven growing net savings (₹1.5L, ₹2.0L, ₹2.5L, ₹3.0L) over 4 years.',
      initialInvestment: 500000,
      cashFlowType: 'uneven',
      unevenCashFlows: [150000, 200000, 250000, 300000],
      discountRatePct: 12,
      projectLifeYears: 4,
      targetPaybackYears: 2.5,
    },
    retailExpansion: {
      title: 'Retail Store Expansion (₹25 Lakhs)',
      description: 'Commercial retail outlet expansion evaluated with 5-year growing cash inflow projections.',
      initialInvestment: 2500000,
      cashFlowType: 'uneven',
      unevenCashFlows: [600000, 800000, 950000, 1100000, 1250000],
      discountRatePct: 10,
      projectLifeYears: 5,
      targetPaybackYears: 3.5,
    },
    solarInstallation: {
      title: 'Commercial Solar Installation (₹8 Lakhs)',
      description: 'Green energy commercial solar panels generating steady ₹1.6 Lakhs annual electricity bill savings over 7 years.',
      initialInvestment: 800000,
      cashFlowType: 'equal',
      annualCashFlow: 160000,
      discountRatePct: 8,
      projectLifeYears: 7,
      targetPaybackYears: 5.5,
    },
  },
};
