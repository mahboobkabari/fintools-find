/**
 * Flagship Cost of Living Financial & Relocation Analysis Engine (Sprint 79 / Flagship #86)
 * 
 * Provides a pure, transparent, category-based cost of living comparison engine.
 * Models itemized monthly expenditures, annual totals, category differentials,
 * housing cost burdens, and lifestyle-equivalent income requirements.
 * 
 * Expense Pillars:
 * 1. Housing (Rent, Mortgage, HOA/Maintenance, Property Tax)
 * 2. Utilities (Electricity, Water, Gas/Heating, Internet, Mobile)
 * 3. Food & Groceries (Supermarket essentials, Dining out, Deliveries)
 * 4. Transportation (Fuel, Transit passes, Insurance, Maintenance, Cabs)
 * 5. Healthcare (Health insurance, Prescriptions, Out-of-pocket medical)
 * 6. Lifestyle & Entertainment (Gym, Subscriptions, Shopping, Leisure)
 * 7. Family & Childcare (Tuition, Daycare, Activities, Dependent support)
 * 8. Miscellaneous (Personal care, Home services, Contingency buffer)
 */

export const EXPENSE_CATEGORIES = [
  { id: 'housing', label: 'Housing & Rent', icon: '🏠', isEssential: true },
  { id: 'utilities', label: 'Utilities & Bills', icon: '⚡', isEssential: true },
  { id: 'food', label: 'Food & Groceries', icon: '🛒', isEssential: true },
  { id: 'transportation', label: 'Transportation', icon: '🚗', isEssential: true },
  { id: 'healthcare', label: 'Healthcare & Insurance', icon: '🏥', isEssential: true },
  { id: 'lifestyle', label: 'Lifestyle & Leisure', icon: '☕', isEssential: false },
  { id: 'family', label: 'Family & Childcare', icon: '👶', isEssential: false },
  { id: 'miscellaneous', label: 'Miscellaneous Buffer', icon: '📦', isEssential: false },
];

export const CURRENCY_METADATA = {
  INR: { symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
};

export const REFERENCE_METADATA = {
  baselineDate: '2026-08-27',
  methodologyType: 'Personalized Itemized Category Budget Comparison',
  source: 'Fintools Find Household Financial Modeling Standards',
  disclaimer: 'This calculator evaluates personalized budget comparisons across user-defined spending categories. It does not claim to represent an official statutory city price index.',
};

/**
 * Calculates Cost of Living Comparison, Differentials, and Income Equivalence
 * 
 * @param {Object} [inputs={}]
 * @param {string} [inputs.currentLocation='Location A (Current)']
 * @param {string} [inputs.targetLocation='Location B (Target)']
 * @param {number} [inputs.currentIncome=100000] - Current monthly net income
 * @param {number} [inputs.targetIncome=0] - Optional proposed target monthly income
 * @param {string} [inputs.currency='INR'] - Currency code
 * @param {Object} [inputs.currentExpenses={}] - Current monthly category expenses
 * @param {Object} [inputs.targetExpenses={}] - Target monthly category expenses
 * @returns {Object} Structured cost of living analytics
 */
export function calculateCostOfLiving(inputs = {}) {
  const {
    currentLocation = 'Location A (Current)',
    targetLocation = 'Location B (Target)',
    currentIncome = 100000,
    targetIncome = 0,
    currency = 'INR',
    currentExpenses = {},
    targetExpenses = {},
  } = inputs;

  // 1. INPUT SANITIZATION
  const cleanCurrentIncome = Math.max(0, Number(currentIncome) || 0);
  const cleanTargetIncome = Math.max(0, Number(targetIncome) || 0);
  const currKey = String(currency).trim().toUpperCase();
  const currMeta = CURRENCY_METADATA[currKey] || CURRENCY_METADATA.INR;
  const sym = currMeta.symbol;

  // Default baseline expenses if empty
  const defaultCurrent = {
    housing: 25000,
    utilities: 6000,
    food: 15000,
    transportation: 6000,
    healthcare: 4000,
    lifestyle: 8000,
    family: 0,
    miscellaneous: 4000,
  };

  const defaultTarget = {
    housing: 35000,
    utilities: 7500,
    food: 18000,
    transportation: 8000,
    healthcare: 5000,
    lifestyle: 10000,
    family: 0,
    miscellaneous: 5000,
  };

  // 2. PARSE & SANITIZE CATEGORIES
  let currentMonthlyTotal = 0;
  let targetMonthlyTotal = 0;
  let currentEssentialTotal = 0;
  let targetEssentialTotal = 0;
  let currentDiscretionaryTotal = 0;
  let targetDiscretionaryTotal = 0;

  const categoryBreakdown = [];

  EXPENSE_CATEGORIES.forEach((cat) => {
    const rawCurr = currentExpenses[cat.id] !== undefined
      ? currentExpenses[cat.id]
      : (inputs.currentExpenses ? 0 : defaultCurrent[cat.id] || 0);
    const rawTarg = targetExpenses[cat.id] !== undefined
      ? targetExpenses[cat.id]
      : (inputs.targetExpenses ? 0 : defaultTarget[cat.id] || 0);

    const cVal = Math.max(0, Math.min(10000000, Number(rawCurr) || 0));
    const tVal = Math.max(0, Math.min(10000000, Number(rawTarg) || 0));

    currentMonthlyTotal += cVal;
    targetMonthlyTotal += tVal;

    if (cat.isEssential) {
      currentEssentialTotal += cVal;
      targetEssentialTotal += tVal;
    } else {
      currentDiscretionaryTotal += cVal;
      targetDiscretionaryTotal += tVal;
    }

    const diff = tVal - cVal;
    const diffPct = cVal > 0 ? Number(((diff / cVal) * 100).toFixed(2)) : (tVal > 0 ? 100 : 0);

    categoryBreakdown.push({
      id: cat.id,
      label: cat.label,
      icon: cat.icon,
      isEssential: cat.isEssential,
      currentMonthly: cVal,
      targetMonthly: tVal,
      diffMonthly: diff,
      diffPct,
      currentAnnual: cVal * 12,
      targetAnnual: tVal * 12,
    });
  });

  // Category shares calculation
  categoryBreakdown.forEach((item) => {
    item.shareCurrentPct = currentMonthlyTotal > 0
      ? Number(((item.currentMonthly / currentMonthlyTotal) * 100).toFixed(1))
      : 0;
    item.shareTargetPct = targetMonthlyTotal > 0
      ? Number(((item.targetMonthly / targetMonthlyTotal) * 100).toFixed(1))
      : 0;
  });

  // 3. CORE TOTALS & ANNUALIZATIONS
  const currentAnnualTotal = currentMonthlyTotal * 12;
  const targetAnnualTotal = targetMonthlyTotal * 12;

  const costDifferenceMonthly = targetMonthlyTotal - currentMonthlyTotal;
  const costDifferenceAnnual = targetAnnualTotal - currentAnnualTotal;
  const percentageDifference = currentMonthlyTotal > 0
    ? Number(((costDifferenceMonthly / currentMonthlyTotal) * 100).toFixed(2))
    : (targetMonthlyTotal > 0 ? 100 : 0);

  // 4. HOUSING BURDEN & ESSENTIAL RATIOS
  const housingItem = categoryBreakdown.find((c) => c.id === 'housing');
  const currentHousingShare = housingItem ? housingItem.shareCurrentPct : 0;
  const targetHousingShare = housingItem ? housingItem.shareTargetPct : 0;

  // 5. LIFESTYLE-EQUIVALENT INCOME SOLVER
  // If user earns currentIncome today, what target income is required to retain same standard / savings buffer?
  let equivalentTargetIncome = 0;
  let incomeChangeNeededPct = 0;
  let incomeDifference = 0;

  if (cleanCurrentIncome > 0 && currentMonthlyTotal > 0) {
    const costMultiplier = targetMonthlyTotal / currentMonthlyTotal;
    equivalentTargetIncome = Math.round(cleanCurrentIncome * costMultiplier);
    incomeChangeNeededPct = Number(((costMultiplier - 1) * 100).toFixed(2));
    incomeDifference = equivalentTargetIncome - cleanCurrentIncome;
  } else if (cleanCurrentIncome > 0) {
    equivalentTargetIncome = cleanCurrentIncome;
  } else {
    equivalentTargetIncome = targetMonthlyTotal;
  }

  // 6. NET MONTHLY SAVINGS CAPACITY (If incomes provided)
  const currentMonthlySavings = cleanCurrentIncome > 0 ? Math.max(0, cleanCurrentIncome - currentMonthlyTotal) : 0;
  const effectiveTargetIncome = cleanTargetIncome > 0 ? cleanTargetIncome : equivalentTargetIncome;
  const targetMonthlySavings = effectiveTargetIncome > 0 ? Math.max(0, effectiveTargetIncome - targetMonthlyTotal) : 0;
  const savingsDeltaMonthly = targetMonthlySavings - currentMonthlySavings;

  // 7. DYNAMIC HERO VERDICT
  let heroText = '';
  if (currentMonthlyTotal === targetMonthlyTotal) {
    heroText = `Cost of living in ${targetLocation} is identical to ${currentLocation} (${sym}${currentMonthlyTotal.toLocaleString()}/mo).`;
  } else if (costDifferenceMonthly > 0) {
    heroText = `${targetLocation} is ${percentageDifference}% more expensive than ${currentLocation} (+${sym}${costDifferenceMonthly.toLocaleString()}/mo).`;
  } else {
    heroText = `${targetLocation} is ${Math.abs(percentageDifference)}% cheaper than ${currentLocation} (−${sym}${Math.abs(costDifferenceMonthly).toLocaleString()}/mo).`;
  }

  // 8. ACTIONABLE RECOMMENDATIONS & INSIGHTS
  const recommendations = [];

  if (percentageDifference > 20) {
    recommendations.push({
      title: `Substantial Relocation Cost Increase (+${percentageDifference}%)`,
      type: 'critical',
      description: `Living in ${targetLocation} will require an extra ${sym}${costDifferenceAnnual.toLocaleString()} per year. Negotiate a salary of at least ${sym}${equivalentTargetIncome.toLocaleString()}/month (${sym}${(equivalentTargetIncome * 12).toLocaleString()}/year) to preserve your current lifestyle.`,
    });
  } else if (percentageDifference < -10) {
    recommendations.push({
      title: `Geo-Arbitrage Savings Opportunity (${Math.abs(percentageDifference)}% Lower Cost)`,
      type: 'positive',
      description: `Relocating to ${targetLocation} frees up ${sym}${Math.abs(costDifferenceAnnual).toLocaleString()} annually. Channel this surplus into investments or accelerated retirement savings.`,
    });
  } else {
    recommendations.push({
      title: 'Comparable Cost of Living Corridor',
      type: 'info',
      description: `Living costs between ${currentLocation} and ${targetLocation} differ by only ${Math.abs(percentageDifference)}% (${sym}${Math.abs(costDifferenceMonthly).toLocaleString()}/month). Lifestyle choices and rent negotiations will matter more than baseline city averages.`,
    });
  }

  if (targetHousingShare > 35) {
    recommendations.push({
      title: `Elevated Housing Burden in ${targetLocation} (${targetHousingShare}% of Budget)`,
      type: 'warning',
      description: `Housing expenses exceed the recommended 30%-35% threshold. Consider expanding your residential search radius or exploring suburban commuter corridors to prevent house-poor cash flow constraints.`,
    });
  }

  recommendations.push({
    title: 'Itemized Expense Optimization',
    type: 'info',
    description: `Essentials (Housing, Utilities, Groceries, Healthcare) comprise ${((targetEssentialTotal / (targetMonthlyTotal || 1)) * 100).toFixed(0)}% of your target budget (${sym}${targetEssentialTotal.toLocaleString()}/mo). Audit discretionary categories for flexible savings buffers.`,
  });

  return {
    currentLocation,
    targetLocation,
    currentIncome: cleanCurrentIncome,
    targetIncome: cleanTargetIncome,
    currency: currKey,
    currencyMeta: currMeta,
    currentMonthlyTotal,
    targetMonthlyTotal,
    currentAnnualTotal,
    targetAnnualTotal,
    costDifferenceMonthly,
    costDifferenceAnnual,
    percentageDifference,
    currentEssentialTotal,
    targetEssentialTotal,
    currentDiscretionaryTotal,
    targetDiscretionaryTotal,
    currentHousingShare,
    targetHousingShare,
    equivalentTargetIncome,
    incomeChangeNeededPct,
    incomeDifference,
    currentMonthlySavings,
    targetMonthlySavings,
    savingsDeltaMonthly,
    categoryBreakdown,
    heroText,
    recommendations,
    metadata: REFERENCE_METADATA,
  };
}

// Aliases
export const calculateCostOfLivingCalculator = calculateCostOfLiving;
export const calculateRelocationBudget = calculateCostOfLiving;
