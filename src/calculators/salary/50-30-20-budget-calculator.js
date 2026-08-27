/**
 * Flagship 50/30/20 Budget, Rule Comparison & 10-Year Wealth Projection Engine (Math Engine V2)
 * Supports standard Elizabeth Warren 50/30/20 rule, 70/20/10, 60/20/20, and 40/20/40 FIRE frameworks,
 * detailed itemized expense breakdown, variance deficit/surplus analytics, and compound wealth projections.
 * 
 * @param {Object} inputs
 * @param {number} [inputs.monthlyIncome=100000] - Net take-home monthly income (₹, $, £, etc.)
 * @param {string} [inputs.ruleFramework='50_30_20'] - '50_30_20' | '60_20_20' | '70_20_10' | '40_20_40' | 'custom'
 * @param {number} [inputs.customNeedsPct=50] - Custom Needs %
 * @param {number} [inputs.customWantsPct=30] - Custom Wants %
 * @param {number} [inputs.customSavingsPct=20] - Custom Savings %
 * @param {number} [inputs.actualRent=25000] - Rent or Home Loan EMI
 * @param {number} [inputs.actualGroceries=12000] - Food & groceries
 * @param {number} [inputs.actualUtilities=6000] - Power, water, gas, broadband
 * @param {number} [inputs.actualInsurance=4000] - Health/term insurance & medical
 * @param {number} [inputs.actualTransport=5000] - Fuel, public transit, car maintenance
 * @param {number} [inputs.actualDining=10000] - Dining out & food delivery
 * @param {number} [inputs.actualEntertainment=6000] - Movies, events, streaming OTT
 * @param {number} [inputs.actualShopping=8000] - Fashion, electronics, hobbies
 * @param {number} [inputs.actualVacation=4000] - Travel & holiday fund
 * @param {number} [inputs.actualInvestments=15000] - Equity SIPs, mutual funds, stocks
 * @param {number} [inputs.actualEmergencyFund=5000] - Cash savings & liquid funds
 * @param {number} [inputs.expectedReturnRate=12] - Annual investment CAGR % for 10-year wealth projection
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const BUDGET_FRAMEWORKS = {
  '50_30_20': { name: 'Standard 50/30/20 Rule', needs: 50, wants: 30, savings: 20, desc: 'Balanced lifestyle with steady 20% wealth building.' },
  '60_20_20': { name: 'Metro Living 60/20/20', needs: 60, wants: 20, savings: 20, desc: 'Tailored for tier-1 cities with elevated rent and living costs.' },
  '70_20_10': { name: 'Debt Recovery 70/20/10', needs: 70, wants: 20, savings: 10, desc: 'Focuses on meeting high debt EMIs and essential living needs.' },
  '40_20_40': { name: 'Aggressive FIRE 40/20/40', needs: 40, wants: 20, savings: 40, desc: 'Maximized 40% savings rate for early financial independence.' },
};

export const DEFAULT_BUDGET_INPUTS = {
  monthlyIncome: 100000,
  ruleFramework: '50_30_20',
  customNeedsPct: 50,
  customWantsPct: 30,
  customSavingsPct: 20,
  actualRent: 25000,
  actualGroceries: 12000,
  actualUtilities: 6000,
  actualInsurance: 4000,
  actualTransport: 5000,
  actualDining: 10000,
  actualEntertainment: 6000,
  actualShopping: 8000,
  actualVacation: 4000,
  actualInvestments: 15000,
  actualEmergencyFund: 5000,
  expectedReturnRate: 12,
  currencySymbol: '₹',
};

export function calculate503020BudgetCalculator(inputs = {}) {
  const merged = { ...DEFAULT_BUDGET_INPUTS, ...inputs };

  const income = Math.max(0, Number(merged.monthlyIncome) || 0);
  const ruleKey = String(merged.ruleFramework || '50_30_20').toLowerCase();

  // 1. Determine Target Percentages
  let targetNeedsPct = 50;
  let targetWantsPct = 30;
  let targetSavingsPct = 20;

  if (BUDGET_FRAMEWORKS[ruleKey]) {
    targetNeedsPct = BUDGET_FRAMEWORKS[ruleKey].needs;
    targetWantsPct = BUDGET_FRAMEWORKS[ruleKey].wants;
    targetSavingsPct = BUDGET_FRAMEWORKS[ruleKey].savings;
  } else if (ruleKey === 'custom') {
    targetNeedsPct = Math.max(0, Math.min(100, Number(merged.customNeedsPct) || 50));
    targetWantsPct = Math.max(0, Math.min(100, Number(merged.customWantsPct) || 30));
    targetSavingsPct = Math.max(0, Math.min(100, Number(merged.customSavingsPct) || 20));
  }

  const currencySymbol = merged.currencySymbol || '₹';
  const rawCagr = Number(merged.expectedReturnRate);
  const expectedCagr = isNaN(rawCagr) ? 12 : Math.max(0, Math.min(30, rawCagr));

  // 2. Compute Target Rupee Allocations
  const targetNeedsAmount = Math.round((income * targetNeedsPct) / 100);
  const targetWantsAmount = Math.round((income * targetWantsPct) / 100);
  const targetSavingsAmount = Math.round((income * targetSavingsPct) / 100);

  // 3. Compute Itemized Actual Spend
  const rent = Math.max(0, Number(merged.actualRent) || 0);
  const groceries = Math.max(0, Number(merged.actualGroceries) || 0);
  const utilities = Math.max(0, Number(merged.actualUtilities) || 0);
  const insurance = Math.max(0, Number(merged.actualInsurance) || 0);
  const transport = Math.max(0, Number(merged.actualTransport) || 0);
  const totalActualNeeds = rent + groceries + utilities + insurance + transport;

  const dining = Math.max(0, Number(merged.actualDining) || 0);
  const entertainment = Math.max(0, Number(merged.actualEntertainment) || 0);
  const shopping = Math.max(0, Number(merged.actualShopping) || 0);
  const vacation = Math.max(0, Number(merged.actualVacation) || 0);
  const totalActualWants = dining + entertainment + shopping + vacation;

  const investments = Math.max(0, Number(merged.actualInvestments) || 0);
  const emergencyFund = Math.max(0, Number(merged.actualEmergencyFund) || 0);
  const totalActualSavings = investments + emergencyFund;

  const totalActualExpenses = totalActualNeeds + totalActualWants + totalActualSavings;
  const unallocatedCash = income - totalActualExpenses;

  // 4. Actual Spending Percentages
  const actualNeedsPct = income > 0 ? Math.round((totalActualNeeds / income) * 1000) / 10 : 0;
  const actualWantsPct = income > 0 ? Math.round((totalActualWants / income) * 1000) / 10 : 0;
  const actualSavingsPct = income > 0 ? Math.round((totalActualSavings / income) * 1000) / 10 : 0;

  // 5. Variance Analytics (Positive = Over target, Negative = Under target)
  const needsVariance = totalActualNeeds - targetNeedsAmount;
  const wantsVariance = totalActualWants - targetWantsAmount;
  const savingsVariance = totalActualSavings - targetSavingsAmount;

  // 6. 10-Year Compound Wealth Projection for Target vs Actual Savings
  const monthlyRate = expectedCagr / 100 / 12;
  const projectionYears = [1, 3, 5, 10, 15, 20];

  const calculateFutureCorpus = (monthlySavings, years) => {
    const totalMonths = years * 12;
    if (monthlyRate === 0) return monthlySavings * totalMonths;
    return Math.round(monthlySavings * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
  };

  const wealthProjections = projectionYears.map((yrs) => ({
    years: yrs,
    targetCorpus: calculateFutureCorpus(targetSavingsAmount, yrs),
    actualCorpus: calculateFutureCorpus(totalActualSavings, yrs),
    targetInvested: targetSavingsAmount * yrs * 12,
    actualInvested: totalActualSavings * yrs * 12,
  }));

  const tenYearActualCorpus = calculateFutureCorpus(totalActualSavings, 10);
  const tenYearTargetCorpus = calculateFutureCorpus(targetSavingsAmount, 10);

  // 7. Spending Health Scorecard (0 to 100)
  let healthScore = 100;
  if (actualNeedsPct > targetNeedsPct + 5) healthScore -= Math.min(30, (actualNeedsPct - targetNeedsPct) * 2);
  if (actualWantsPct > targetWantsPct + 5) healthScore -= Math.min(25, (actualWantsPct - targetWantsPct) * 1.5);
  if (actualSavingsPct < targetSavingsPct) healthScore -= Math.min(35, (targetSavingsPct - actualSavingsPct) * 2.5);
  if (unallocatedCash < 0) healthScore -= 20; // Living beyond means
  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  let healthGrade = 'Optimal Budget';
  let healthColor = 'text-semantic-success';
  if (healthScore < 50) {
    healthGrade = 'Deficit Stress';
    healthColor = 'text-rose-600';
  } else if (healthScore < 75) {
    healthGrade = 'Moderate Variance';
    healthColor = 'text-amber-600';
  }

  // 8. Framework Comparisons
  const frameworkComparisons = Object.entries(BUDGET_FRAMEWORKS).map(([k, fw]) => {
    const fwNeeds = Math.round((income * fw.needs) / 100);
    const fwWants = Math.round((income * fw.wants) / 100);
    const fwSavings = Math.round((income * fw.savings) / 100);
    return {
      id: k,
      name: fw.name,
      needsPct: fw.needs,
      wantsPct: fw.wants,
      savingsPct: fw.savings,
      needsAmount: fwNeeds,
      wantsAmount: fwWants,
      savingsAmount: fwSavings,
      tenYearCorpus: calculateFutureCorpus(fwSavings, 10),
      description: fw.desc,
      isSelected: k === ruleKey,
    };
  });

  // 9. Smart Ranked Recommendations
  const recommendations = [
    {
      rank: 1,
      title: actualSavingsPct >= targetSavingsPct ? 'Strong Wealth Building Rate' : 'Increase Monthly Savings to Reach Target',
      savings: Math.max(0, targetSavingsAmount - totalActualSavings),
      action: actualSavingsPct >= targetSavingsPct
        ? `You are saving ${actualSavingsPct}% (${currencySymbol}${totalActualSavings.toLocaleString()}/mo), exceeding the ${targetSavingsPct}% target. In 10 years @ ${expectedCagr}% CAGR, this creates ${currencySymbol}${tenYearActualCorpus.toLocaleString()} in liquid wealth.`
        : `Your current savings rate is ${actualSavingsPct}% (${currencySymbol}${totalActualSavings.toLocaleString()}/mo). Increasing savings by ${currencySymbol}${(targetSavingsAmount - totalActualSavings).toLocaleString()}/mo to reach ${targetSavingsPct}% will add ${currencySymbol}${(tenYearTargetCorpus - tenYearActualCorpus).toLocaleString()} to your 10-year corpus.`,
    },
    {
      rank: 2,
      title: actualNeedsPct > targetNeedsPct ? 'Essential Needs Exceed Target Ratio' : 'Needs Ratio is Well-Controlled',
      savings: Math.max(0, totalActualNeeds - targetNeedsAmount),
      action: actualNeedsPct > targetNeedsPct
        ? `Essential needs consume ${actualNeedsPct}% (${currencySymbol}${totalActualNeeds.toLocaleString()}) vs the ${targetNeedsPct}% target. Consider optimizing rent, utility subscriptions, or refinancing loans to free up cash.`
        : `Essential living expenses are contained at ${actualNeedsPct}% (${currencySymbol}${totalActualNeeds.toLocaleString()}), giving you healthy headroom for discretionary spending and investments.`,
    },
    {
      rank: 3,
      title: actualWantsPct > targetWantsPct ? 'Trim Discretionary Wants Spending' : 'Discretionary Wants Balanced',
      savings: Math.max(0, totalActualWants - targetWantsAmount),
      action: actualWantsPct > targetWantsPct
        ? `Discretionary lifestyle spending is at ${actualWantsPct}% (${currencySymbol}${totalActualWants.toLocaleString()}), exceeding the ${targetWantsPct}% cap by ${currencySymbol}${(totalActualWants - targetWantsAmount).toLocaleString()}. Redirecting excess lifestyle cash into SIPs significantly accelerates financial independence.`
        : `Lifestyle spending is disciplined at ${actualWantsPct}% (${currencySymbol}${totalActualWants.toLocaleString()}), comfortably within the ${targetWantsPct}% ceiling.`,
    },
  ];

  // 10. Hero Decision Text
  const heroText = `Your monthly budget allocates ${actualNeedsPct}% to Needs (${currencySymbol}${totalActualNeeds.toLocaleString()}), ${actualWantsPct}% to Wants (${currencySymbol}${totalActualWants.toLocaleString()}), and ${actualSavingsPct}% to Savings (${currencySymbol}${totalActualSavings.toLocaleString()}). 10-Year projected wealth: ${currencySymbol}${tenYearActualCorpus.toLocaleString()}.`;

  return {
    primaryOutput: totalActualSavings,
    monthlyIncome: income,
    ruleFramework: ruleKey,
    targetNeedsPct,
    targetWantsPct,
    targetSavingsPct,
    targetNeedsAmount,
    targetWantsAmount,
    targetSavingsAmount,
    totalActualNeeds,
    totalActualWants,
    totalActualSavings,
    totalActualExpenses,
    unallocatedCash,
    actualNeedsPct,
    actualWantsPct,
    actualSavingsPct,
    needsVariance,
    wantsVariance,
    savingsVariance,
    healthScore,
    healthGrade,
    healthColor,
    expectedReturnRate: expectedCagr,
    wealthProjections,
    tenYearActualCorpus,
    tenYearTargetCorpus,
    frameworkComparisons,
    recommendations,
    heroText,
    currencySymbol,
  };
}

export const calculate503020BudgetTool = calculate503020BudgetCalculator;
