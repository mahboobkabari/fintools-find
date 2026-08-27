/**
 * Financial Engine for Profit Margin & Markup Calculator
 */

/**
 * Calculates Gross Profit and Gross Profit Margin %
 */
export function calculateGrossMargin(revenueInput, cogsInput) {
  const revenue = Math.max(0, Number(revenueInput) || 0);
  const cogs = Math.max(0, Number(cogsInput) || 0);

  const grossProfit = revenue - cogs;
  const grossMarginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  return {
    revenue,
    cogs,
    grossProfit,
    grossMarginPercent,
    isSellingBelowCost: revenue > 0 && cogs > revenue,
  };
}

/**
 * Calculates Operating Profit and Operating Profit Margin %
 */
export function calculateOperatingMargin(revenueInput, cogsInput, opexInput) {
  const { grossProfit } = calculateGrossMargin(revenueInput, cogsInput);
  const opex = Math.max(0, Number(opexInput) || 0);

  const revenue = Math.max(0, Number(revenueInput) || 0);
  const operatingProfit = grossProfit - opex;
  const operatingMarginPercent = revenue > 0 ? (operatingProfit / revenue) * 100 : 0;

  return {
    opex,
    operatingProfit,
    operatingMarginPercent,
  };
}

/**
 * Calculates Net Profit and Net Profit Margin % after Taxes
 */
export function calculateNetMargin(revenueInput, cogsInput, opexInput, otherExpensesInput, taxRateInput) {
  const revenue = Math.max(0, Number(revenueInput) || 0);
  const { operatingProfit } = calculateOperatingMargin(revenueInput, cogsInput, opexInput);
  const otherExpenses = Math.max(0, Number(otherExpensesInput) || 0);
  const taxRatePercent = Math.min(100, Math.max(0, Number(taxRateInput) || 0));

  const preTaxProfit = operatingProfit - otherExpenses;
  // Taxes apply only on positive taxable pre-tax profit (no artificial tax benefit)
  const taxes = preTaxProfit > 0 ? preTaxProfit * (taxRatePercent / 100) : 0;
  const netProfit = preTaxProfit - taxes;
  const netMarginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return {
    otherExpenses,
    taxRatePercent,
    preTaxProfit,
    taxes,
    netProfit,
    netMarginPercent,
  };
}

/**
 * Calculates Cost-Plus Markup % from Revenue and COGS
 */
export function calculateMarkupFromCostPrice(revenueInput, cogsInput) {
  const revenue = Math.max(0, Number(revenueInput) || 0);
  const cogs = Math.max(0, Number(cogsInput) || 0);

  // If COGS is zero, markup cannot be calculated on zero cost
  if (cogs === 0) {
    return {
      markupPercent: 0,
      isZeroCost: true,
    };
  }

  const markupPercent = ((revenue - cogs) / cogs) * 100;

  return {
    markupPercent,
    isZeroCost: false,
  };
}

/**
 * Converts Gross Margin % into Cost-Plus Markup %
 */
export function convertMarginToMarkup(grossMarginPercentInput) {
  const marginPercent = Number(grossMarginPercentInput) || 0;

  if (marginPercent >= 100) {
    return { markupPercent: Infinity, isValid: false };
  }

  const markupPercent = (marginPercent / (100 - marginPercent)) * 100;
  return { markupPercent, isValid: true };
}

/**
 * Calculates Target Selling Price required for a Desired Gross Margin %
 */
export function calculateTargetPriceFromMargin(cogsInput, desiredMarginPercentInput, opexInput = 0, otherExpensesInput = 0) {
  const cogs = Math.max(0, Number(cogsInput) || 0);
  const opex = Math.max(0, Number(opexInput) || 0);
  const otherExpenses = Math.max(0, Number(otherExpensesInput) || 0);
  const desiredMarginPercent = Number(desiredMarginPercentInput);

  if (isNaN(desiredMarginPercent) || desiredMarginPercent >= 100) {
    return {
      isValid: false,
      errorMessage: 'Desired Gross Margin % must be strictly less than 100%.',
      targetSellingPrice: 0,
      impliedGrossProfit: 0,
    };
  }

  const totalCostBase = cogs + opex + otherExpenses;
  const targetSellingPrice = desiredMarginPercent < 100 ? totalCostBase / (1 - desiredMarginPercent / 100) : 0;
  const impliedGrossProfit = targetSellingPrice - cogs;

  return {
    isValid: true,
    targetSellingPrice,
    impliedGrossProfit,
    desiredMarginPercent,
    totalCostBase,
  };
}

/**
 * Generates side-by-side Margin vs Markup conversion reference table
 */
export function generateMarginMarkupConversionTable() {
  const marginSteps = [5, 10, 15, 20, 25, 30, 33.33, 40, 50, 60, 75, 80, 90];

  return marginSteps.map((margin) => {
    const markup = margin < 100 ? (margin / (100 - margin)) * 100 : Infinity;
    return {
      grossMarginPercent: margin,
      markupPercent: Math.round(markup * 100) / 100,
    };
  });
}

/**
 * Master integration function for Profit Margin & Markup calculations
 */
export function calculateProfitMarginMetrics(inputs = {}) {
  const revenue = Math.max(0, Number(inputs.revenue || inputs.sellingPrice) || 0);
  const cogs = Math.max(0, Number(inputs.cogs || inputs.costOfGoodsSold) || 0);
  const opex = Math.max(0, Number(inputs.operatingExpenses) || 0);
  const otherExpenses = Math.max(0, Number(inputs.otherExpenses) || 0);
  const taxRatePercent = Math.min(100, Math.max(0, Number(inputs.taxRatePercent) || 0));
  const desiredMarginPercent = inputs.desiredMarginPercent !== undefined && inputs.desiredMarginPercent !== ''
    ? Number(inputs.desiredMarginPercent)
    : 25;

  const grossMetrics = calculateGrossMargin(revenue, cogs);
  const opexMetrics = calculateOperatingMargin(revenue, cogs, opex);
  const netMetrics = calculateNetMargin(revenue, cogs, opex, otherExpenses, taxRatePercent);
  const markupMetrics = calculateMarkupFromCostPrice(revenue, cogs);
  const targetPriceMetrics = calculateTargetPriceFromMargin(cogs, desiredMarginPercent, opex, otherExpenses);
  const conversionTable = generateMarginMarkupConversionTable();

  const isValid = revenue > 0 || cogs > 0;

  return {
    isValid,
    revenue,
    cogs,
    grossProfit: grossMetrics.grossProfit,
    grossMarginPercent: grossMetrics.grossMarginPercent,
    isSellingBelowCost: grossMetrics.isSellingBelowCost,

    opex: opexMetrics.opex,
    operatingProfit: opexMetrics.operatingProfit,
    operatingMarginPercent: opexMetrics.operatingMarginPercent,

    otherExpenses: netMetrics.otherExpenses,
    taxRatePercent: netMetrics.taxRatePercent,
    preTaxProfit: netMetrics.preTaxProfit,
    taxes: netMetrics.taxes,
    netProfit: netMetrics.netProfit,
    netMarginPercent: netMetrics.netMarginPercent,

    markupPercent: markupMetrics.markupPercent,
    isZeroCost: markupMetrics.isZeroCost,

    targetPrice: targetPriceMetrics,
    conversionTable,
  };
}
