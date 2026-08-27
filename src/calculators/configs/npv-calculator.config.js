/**
 * Configuration module for Net Present Value (NPV) & Internal Rate of Return (IRR) Calculator
 */

export const NPV_CONFIG = {
  meta: {
    title: 'Net Present Value (NPV) & Internal Rate of Return (IRR) Calculator',
    description: 'Evaluate capital investment proposals, corporate projects, and business acquisitions using NPV, IRR, MIRR, Profitability Index (PI), and Discounted Payback Period.',
    category: 'business',
    categoryName: 'Business & Corporate Calculators',
    slug: 'npv-calculator',
  },

  defaultInputs: {
    initialOutlay: 1000000,
    discountRatePercent: 10,
    reinvestmentRatePercent: 10,
    financingRatePercent: 10,
    cashFlows: [300000, 350000, 400000, 450000, 500000],
  },

  fieldBoundaries: {
    initialOutlay: { min: 1000, max: 1000000000, step: 50000 },
    discountRatePercent: { min: 0, max: 100, step: 0.5 },
    reinvestmentRatePercent: { min: 0, max: 100, step: 0.5 },
    financingRatePercent: { min: 0, max: 100, step: 0.5 },
  },

  disclaimers: {
    educationalNotice: 'This calculator provides an illustrative capital-budgeting analysis based on the cash flows, discount rates, and assumptions entered. A positive NPV or IRR does not guarantee project success, profitability, liquidity, or investment returns. Actual outcomes depend on operating performance, financing, taxes, timing, uncertainty, and other factors.',
    irrNotice: 'IRR can be non-unique for cash flows with multiple sign changes. When that occurs, IRR should not be interpreted as a single definitive return measure. Rely on MIRR and NPV for non-normal cash flow profiles.',
  },

  scenarios: {
    equipmentReplacement: {
      title: 'Equipment Replacement Project',
      description: 'Standard 5-year capital outlay for industrial machinery with steady operational savings.',
      initialOutlay: 1000000,
      discountRatePercent: 10,
      reinvestmentRatePercent: 10,
      financingRatePercent: 10,
      cashFlows: [300000, 350000, 400000, 450000, 500000],
    },
    softwareRd: {
      title: 'Software Product R&D Expansion',
      description: 'High upfront development cost followed by exponentially growing subscription revenue.',
      initialOutlay: 2500000,
      discountRatePercent: 12,
      reinvestmentRatePercent: 12,
      financingRatePercent: 12,
      cashFlows: [200000, 600000, 1200000, 2000000, 3000000],
    },
    commercialRealEstate: {
      title: 'Commercial Property Acquisition',
      description: 'Commercial real estate purchase with annual rental yields and major Year 5 resale exit.',
      initialOutlay: 10000000,
      discountRatePercent: 9,
      reinvestmentRatePercent: 9,
      financingRatePercent: 9,
      cashFlows: [800000, 850000, 900000, 950000, 14000000],
    },
    nonNormalExpansion: {
      title: 'Multi-Stage Non-Normal Expansion',
      description: 'Project with secondary Year 3 overhaul investment resulting in non-normal cash flows.',
      initialOutlay: 1500000,
      discountRatePercent: 11,
      reinvestmentRatePercent: 11,
      financingRatePercent: 11,
      cashFlows: [800000, 900000, -300000, 1000000, 1200000],
    },
  },
};
