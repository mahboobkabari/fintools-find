/**
 * Break-Even Analysis Calculator Configuration Module
 * 
 * Defines metadata, input boundaries, classifications, and illustrative business presets.
 */

export const BREAK_EVEN_CONFIG = {
  metadata: {
    title: 'Break-Even Analysis Calculator',
    slug: 'break-even-calculator',
    category: 'business',
    categoryName: 'Business & Corporate Finance Calculators',
    lastUpdated: '2026-08-09',
    financialAuthority: 'Managerial Accounting & Cost-Volume-Profit (CVP) Framework',
  },

  financialMethodology: 'Cost-Volume-Profit (CVP) analysis calculating the sales volume where total revenues equal total costs (Fixed Costs plus Variable Costs).',

  classifications: {
    statutory: [],
    userInputs: [
      'Fixed Overhead Costs (Rent, Salaries, Software, Insurance)',
      'Selling Price Per Unit',
      'Variable Cost Per Unit (Raw Materials, Direct Labor, Shipping)',
      'Current or Projected Unit Sales Volume',
      'Optional Target Profit Goal'
    ],
    marketAssumptions: [
      { name: 'Linear Cost Assumption', description: 'Variable costs are assumed to scale linearly per unit within the relevant production range.' },
      { name: 'Constant Price Assumption', description: 'Selling price per unit is assumed constant across all unit volume levels.' }
    ],
    lenderAssumptions: []
  },

  defaultInputs: {
    fixedCosts: 150000,
    sellingPrice: 1000,
    variableCost: 400,
    currentSalesVolume: 350,
    targetProfit: 50000,
  },

  scenarios: {
    eCommerce: {
      id: 'eCommerce',
      title: 'E-Commerce / D2C Brand',
      description: 'Online direct-to-consumer store with product manufacturing, packaging, and digital ad overheads.',
      fixedCosts: 150000,
      sellingPrice: 1200,
      variableCost: 450,
      currentSalesVolume: 300,
      targetProfit: 50000,
    },
    saas: {
      id: 'saas',
      title: 'SaaS / Digital Subscription',
      description: 'High-margin software subscription product with low per-user hosting cost and high developer overheads.',
      fixedCosts: 450000,
      sellingPrice: 2500,
      variableCost: 250,
      currentSalesVolume: 250,
      targetProfit: 100000,
    },
    retailShop: {
      id: 'retailShop',
      title: 'Retail Shop / Store',
      description: 'Physical storefront with commercial rent, staff wages, inventory COGS, and utility bills.',
      fixedCosts: 80000,
      sellingPrice: 800,
      variableCost: 480,
      currentSalesVolume: 320,
      targetProfit: 30000,
    },
    consulting: {
      id: 'consulting',
      title: 'Consulting / Professional Services',
      description: 'Service provider charging per project/client package with office expenses and subcontractor costs.',
      fixedCosts: 200000,
      sellingPrice: 15000,
      variableCost: 3000,
      currentSalesVolume: 20,
      targetProfit: 100000,
    }
  },

  fieldLimits: {
    fixedCosts: { min: 0, max: 100000000, step: 5000, label: 'Fixed Overhead Costs (₹)' },
    sellingPrice: { min: 0, max: 10000000, step: 10, label: 'Selling Price Per Unit (₹)' },
    variableCost: { min: 0, max: 10000000, step: 10, label: 'Variable Cost Per Unit (₹)' },
    currentSalesVolume: { min: 0, max: 10000000, step: 10, label: 'Current Sales Volume (Units)' },
    targetProfit: { min: 0, max: 100000000, step: 5000, label: 'Target Profit Goal (₹)' },
  }
};
