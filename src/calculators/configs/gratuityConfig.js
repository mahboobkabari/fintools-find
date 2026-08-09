/**
 * Reference Configuration & Statutory Data for Flagship Gratuity Calculator
 * Payment of Gratuity Act 1972 rules vs Section 10(10) Income Tax Act statutory limits.
 */

export const GRATUITY_CONFIG = {
  statutoryRules: {
    sec10_10_taxFreeCeiling: 2000000, // Section 10(10) statutory tax-free exemption ceiling (₹20 Lakhs)
    minEligibilityMonths: 60, // Standard 5-year continuous service eligibility (60 months)
    coveredWorkingDays: 26, // Working days per month for covered establishment (15/26 rule)
    nonCoveredDays: 30, // Days per month for non-covered establishment (15/30 rule)
    coveredRoundingThresholdMonths: 6, // 6 months or more rounds UP to 1 full year
  },

  presets: [
    {
      id: 'covered_15y_7m',
      title: 'Standard Covered Employee (15Y 7M)',
      description: '₹50,000 last drawn basic salary in a covered organization after 15 years and 7 months (16 years rounded).',
      values: {
        lastDrawnBasic: 50000,
        tenureYears: 15,
        tenureMonths: 7,
        coverageType: 'covered',
        isDisabilityWaiver: false,
        annualSalaryIncrease: 5,
        marginalTaxRate: 30,
        calculationMode: 'forward',
        inflationRate: 6,
      },
    },
    {
      id: 'non_covered_10y_4m',
      title: 'Non-Covered Establishment (10Y 4M)',
      description: '₹60,000 last drawn basic salary in an establishment not covered under the Gratuity Act (15/30 rule, 10 full years).',
      values: {
        lastDrawnBasic: 60000,
        tenureYears: 10,
        tenureMonths: 4,
        coverageType: 'non_covered',
        isDisabilityWaiver: false,
        annualSalaryIncrease: 5,
        marginalTaxRate: 30,
        calculationMode: 'forward',
        inflationRate: 6,
      },
    },
    {
      id: 'high_basic_ceiling_breach',
      title: 'Senior Executive (₹20L Ceiling Breach)',
      description: '₹1.5 Lakhs last drawn basic salary after 25 years generating ₹21.63L gratuity (₹1.63L taxable).',
      values: {
        lastDrawnBasic: 150000,
        tenureYears: 25,
        tenureMonths: 0,
        coverageType: 'covered',
        isDisabilityWaiver: false,
        annualSalaryIncrease: 7,
        marginalTaxRate: 30,
        calculationMode: 'forward',
        inflationRate: 6,
      },
    },
    {
      id: 'government_100_tax_free',
      title: 'Government Employee (100% Tax-Free)',
      description: '₹80,000 last drawn basic salary for government employee (100% tax-free under Section 10(10)(i)).',
      values: {
        lastDrawnBasic: 80000,
        tenureYears: 20,
        tenureMonths: 0,
        coverageType: 'government',
        isDisabilityWaiver: false,
        annualSalaryIncrease: 5,
        marginalTaxRate: 30,
        calculationMode: 'forward',
        inflationRate: 6,
      },
    },
  ],
};
