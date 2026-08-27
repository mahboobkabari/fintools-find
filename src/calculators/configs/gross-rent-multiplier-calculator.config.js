/**
 * Configuration module for Gross Rent Multiplier (GRM) Calculator
 *
 * GRM is a gross-income screening metric. It does NOT account for operating
 * expenses, vacancy, financing costs, taxes, insurance, maintenance, or
 * capital expenditures.
 */

export const GRM_CONFIG = {
  meta: {
    title: 'Gross Rent Multiplier Calculator (GRM)',
    description: 'Calculate Gross Rent Multiplier, implied property value from target GRM, gross rent yield, GRM comparison, and 2D sensitivity analysis across rent and GRM scenarios.',
    category: 'real-estate',
    categoryName: 'Real Estate & Property Calculators',
    slug: 'gross-rent-multiplier-calculator',
    route: '/tools/real-estate/gross-rent-multiplier-calculator',
  },

  defaultInputs: {
    currentPropertyValue: 7500000,     // ₹75 Lakhs
    monthlyGrossRent: 50000,           // ₹50,000 / month
    otherAnnualGrossIncome: 24000,     // ₹24,000 / year (parking, etc.)
    targetGRM: 8,
    comparablePropertyPrice: '',
    comparableAnnualGrossRent: '',
  },

  fieldBoundaries: {
    currentPropertyValue: { min: 0, max: 10000000000, step: 100000, label: 'Current Property Value / Asking Price' },
    monthlyGrossRent: { min: 0, max: 50000000, step: 1000, label: 'Monthly Gross Rent' },
    otherAnnualGrossIncome: { min: 0, max: 100000000, step: 5000, label: 'Other Annual Gross Income' },
    targetGRM: { min: 0.5, max: 50, step: 0.5, label: 'Target GRM' },
    comparablePropertyPrice: { min: 0, max: 10000000000, step: 100000, label: 'Comparable Property Price' },
    comparableAnnualGrossRent: { min: 0, max: 100000000, step: 5000, label: 'Comparable Annual Gross Rent' },
  },

  disclaimers: {
    educationalNotice: 'This calculator estimates the Gross Rent Multiplier (GRM) based on gross rental income only. GRM is a screening metric and does NOT account for operating expenses, vacancy, financing, taxes, insurance, maintenance, or capital expenditures. It is for educational purposes only and does not constitute a property appraisal or investment recommendation.',
    grossIncomeNotice: 'Gross Rent Multiplier uses total gross rental income before any deductions. Do not confuse GRM with Cap Rate, which uses Net Operating Income (NOI) after operating expenses.',
    noAppraisalNotice: 'GRM-based implied property values are illustrative screening estimates only. They do not represent certified appraisals, market valuations, or guaranteed asset values.',
  },

  educationalLabels: {
    grm: 'Gross Rent Multiplier (GRM) = Property Price ÷ Annual Gross Rental Income',
    impliedValue: 'Implied Property Value = Annual Gross Rental Income × Target GRM',
    grossRentYield: 'Gross Rent Yield % = (Annual Gross Rental Income ÷ Property Price) × 100',
    reciprocal: 'GRM and Gross Rent Yield are mathematical reciprocals: Gross Rent Yield % = 100 ÷ GRM',
  },

  scenarios: {
    singleFamilyRental: {
      title: 'Single-Family Rental',
      description: 'Illustrative suburban single-family home with standard residential rental income.',
      currentPropertyValue: 5000000,
      monthlyGrossRent: 35000,
      otherAnnualGrossIncome: 12000,
      targetGRM: 10,
    },
    duplexSmallMultifamily: {
      title: 'Duplex / Small Multifamily',
      description: 'Illustrative duplex or small multifamily property with combined rental income.',
      currentPropertyValue: 8500000,
      monthlyGrossRent: 65000,
      otherAnnualGrossIncome: 30000,
      targetGRM: 9,
    },
    apartmentProperty: {
      title: 'Apartment Property',
      description: 'Illustrative multi-unit apartment building with diversified rental streams.',
      currentPropertyValue: 25000000,
      monthlyGrossRent: 200000,
      otherAnnualGrossIncome: 120000,
      targetGRM: 8,
    },
    smallCommercialRental: {
      title: 'Small Commercial Rental',
      description: 'Illustrative small commercial retail or office space with higher gross rental yield.',
      currentPropertyValue: 12000000,
      monthlyGrossRent: 120000,
      otherAnnualGrossIncome: 50000,
      targetGRM: 7,
    },
  },
};
