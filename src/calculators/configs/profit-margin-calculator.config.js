/**
 * Configuration module for Profit Margin & Markup Calculator
 */

export const PROFIT_MARGIN_CONFIG = {
  meta: {
    title: 'Profit Margin & Markup Calculator',
    description: 'Calculate Gross Profit Margin %, Net Profit Margin %, Operating Margin %, Cost-Plus Markup %, and target selling price for desired business profitability.',
    category: 'business',
    categoryName: 'Business & Corporate Finance Calculators',
    slug: 'profit-margin-calculator',
  },

  defaultInputs: {
    cogs: 60000,
    revenue: 100000,
    operatingExpenses: 15000,
    otherExpenses: 2000,
    taxRatePercent: 25,
    desiredMarginPercent: 40,
  },

  fieldBoundaries: {
    cogs: { min: 0, max: 1000000000, step: 1000 },
    revenue: { min: 0, max: 1000000000, step: 1000 },
    operatingExpenses: { min: 0, max: 1000000000, step: 1000 },
    otherExpenses: { min: 0, max: 1000000000, step: 1000 },
    taxRatePercent: { min: 0, max: 100, step: 1 },
    desiredMarginPercent: { min: 0, max: 99.9, step: 1 },
  },

  disclaimers: {
    educationalNotice: 'This calculator provides illustrative unit economics and profitability models based on user-entered costs and prices. Results are for educational guidance and do not guarantee customer demand, market adoption, or net business cash flow.',
    marginVsMarkupNotice: 'Gross Profit Margin % is calculated on Revenue (Price), while Markup % is calculated on Cost. Gross Margin % can never exceed 100%, whereas Markup % can exceed 100%.',
  },

  scenarios: {
    ecommerceRetailer: {
      title: 'E-Commerce Product Retailer',
      description: 'Physical inventory retail business with 40% COGS, marketing OPEX, and standard corporate tax rate.',
      cogs: 60000,
      revenue: 100000,
      operatingExpenses: 20000,
      otherExpenses: 2000,
      taxRatePercent: 25,
      desiredMarginPercent: 40,
    },
    softwareSaas: {
      title: 'Software / SaaS Business',
      description: 'High gross margin digital service business with low COGS (hosting/support) and high R&D/sales OPEX.',
      cogs: 15000,
      revenue: 100000,
      operatingExpenses: 50000,
      otherExpenses: 3000,
      taxRatePercent: 25,
      desiredMarginPercent: 85,
    },
    consultingServices: {
      title: 'Consulting & Professional Services',
      description: 'Service agency with zero physical inventory COGS, moderate administrative OPEX, and high net profit margin.',
      cogs: 20000,
      revenue: 100000,
      operatingExpenses: 30000,
      otherExpenses: 1000,
      taxRatePercent: 25,
      desiredMarginPercent: 80,
    },
    restaurantFoodService: {
      title: 'Restaurant & Food Service',
      description: 'Food and beverage establishment with ~33% food cost (COGS), high rent/staff OPEX, and targeted markup.',
      cogs: 35000,
      revenue: 100000,
      operatingExpenses: 45000,
      otherExpenses: 5000,
      taxRatePercent: 25,
      desiredMarginPercent: 65,
    },
  },
};
