/**
 * Configuration module for Property Valuation Calculator (Income Capitalization Approach)
 */

export const PROPERTY_VALUATION_CONFIG = {
  meta: {
    title: 'Property Valuation Calculator (Income Capitalization Approach)',
    description: 'Calculate income-implied property valuation based on Net Operating Income (NOI) and Target Cap Rate. Model current cap rate, valuation gap, and 2D NOI sensitivity.',
    category: 'real-estate',
    categoryName: 'Real Estate & Property Calculators',
    slug: 'property-valuation-calculator',
    route: '/tools/real-estate/property-valuation-calculator',
  },

  defaultInputs: {
    currentPropertyValue: 10000000, // ₹1 Crore optional asking price / market value
    targetCapRatePct: 6.0,
    monthlyGrossRent: 65000, // ₹65k / month
    otherAnnualIncome: 20000,
    vacancyRatePct: 5,
    annualOperatingExpenses: 160000, // ₹1.6 Lakhs / year
  },

  fieldBoundaries: {
    currentPropertyValue: { min: 0, max: 10000000000, step: 100000 },
    targetCapRatePct: { min: 1.0, max: 25.0, step: 0.25 },
    monthlyGrossRent: { min: 0, max: 50000000, step: 1000 },
    otherAnnualIncome: { min: 0, max: 10000000, step: 5000 },
    vacancyRatePct: { min: 0, max: 100, step: 1 },
    annualOperatingExpenses: { min: 0, max: 100000000, step: 10000 },
  },

  disclaimers: {
    educationalNotice: 'This calculator estimates income-implied property value using the Direct Capitalization Approach (Value = NOI / Target Cap Rate). It is for educational purposes only and does not constitute a certified property appraisal or financial recommendation.',
    capRateNotice: 'Cap rates vary significantly based on location, property type, tenant quality, and market conditions. Lower cap rates reflect lower perceived risk and higher property valuations.',
  },

  scenarios: {
    singleFamily: {
      title: 'Single-Family Rental (₹50 Lakhs)',
      description: 'Standard suburban residential rental home yielding stable gross rent.',
      currentPropertyValue: 5000000,
      targetCapRatePct: 6.5,
      monthlyGrossRent: 35000,
      otherAnnualIncome: 10000,
      vacancyRatePct: 5,
      annualOperatingExpenses: 90000,
    },
    multiFamily: {
      title: 'Multi-Family Apartment (₹2 Crores)',
      description: '6-unit residential multi-family building with diversified tenant rental income.',
      currentPropertyValue: 20000000,
      targetCapRatePct: 6.0,
      monthlyGrossRent: 150000,
      otherAnnualIncome: 60000,
      vacancyRatePct: 6,
      annualOperatingExpenses: 420000,
    },
    commercialRetail: {
      title: 'Commercial Retail Store (₹1.5 Crores)',
      description: 'Prime high-street commercial retail space with long-term commercial lease.',
      currentPropertyValue: 15000000,
      targetCapRatePct: 7.0,
      monthlyGrossRent: 110000,
      otherAnnualIncome: 30000,
      vacancyRatePct: 4,
      annualOperatingExpenses: 280000,
    },
    industrialWarehouse: {
      title: 'Industrial Warehouse / Logistics (₹3 Crores)',
      description: 'Logistics facility with low operating expense ratio and long-term corporate tenant.',
      currentPropertyValue: 30000000,
      targetCapRatePct: 7.5,
      monthlyGrossRent: 220000,
      otherAnnualIncome: 80000,
      vacancyRatePct: 3,
      annualOperatingExpenses: 450000,
    },
  },
};
