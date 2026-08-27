/**
 * Flagship Term Life Insurance, Actuarial Pricing & HLV Decision Engine (Math Engine V2)
 * Supports IRDAI mortality benchmarks, Human Life Value (HLV), DIME needs-based sizing,
 * Pure Term vs TROP (Return of Premium) opportunity cost analyzer, riders, and Sec 80C/10(10D) tax benefits.
 * 
 * @param {Object} inputs
 * @param {number} [inputs.currentAge=30] - Insured age (18 to 65 years)
 * @param {number} [inputs.gender='male'] - 'male' | 'female'
 * @param {boolean} [inputs.isSmoker=false] - Tobacco / nicotine user
 * @param {number} [inputs.annualIncome=1200000] - Annual gross earnings (₹, $, £, etc.)
 * @param {number} [inputs.existingLiabilities=3000000] - Outstanding home/car/personal debt & loans
 * @param {number} [inputs.annualFamilyExpenses=600000] - Annual living expenses excluding self
 * @param {number} [inputs.expenseReplacementYears=15] - Years family needs income replacement
 * @param {number} [inputs.futureGoals=2000000] - Child higher education & marriage provisions
 * @param {number} [inputs.existingAssets=1000000] - Liquid savings, mutual funds & existing life cover
 * @param {number} [inputs.coverageYears=35] - Policy duration in years (or coverage up to age)
 * @param {string} [inputs.sizingMethod='dime'] - 'dime' | 'hlv' | 'multiple' | 'custom'
 * @param {number} [inputs.customSumAssured=15000000] - Custom chosen sum assured
 * @param {boolean} [inputs.criticalIllnessRider=false] - Add Critical Illness cover rider
 * @param {boolean} [inputs.accidentalRider=false] - Add Accidental Death & Disability rider
 * @param {boolean} [inputs.waiverOfPremiumRider=false] - Add Waiver of Premium rider
 * @param {number} [inputs.sipReturnRate=12] - Expected equity SIP return % for TROP opportunity cost
 * @param {string} [inputs.currencySymbol='₹'] - Display currency symbol
 */

export const MORTALITY_RATES_PER_THOUSAND = [
  { maxAge: 25, baseRate: 0.70 },
  { maxAge: 30, baseRate: 0.95 },
  { maxAge: 35, baseRate: 1.35 },
  { maxAge: 40, baseRate: 2.10 },
  { maxAge: 45, baseRate: 3.40 },
  { maxAge: 50, baseRate: 5.50 },
  { maxAge: 55, baseRate: 9.00 },
  { maxAge: 65, baseRate: 15.50 },
];

export const DEFAULT_TERM_INSURANCE_INPUTS = {
  currentAge: 30,
  gender: 'male',
  isSmoker: false,
  annualIncome: 1200000,
  existingLiabilities: 3000000,
  annualFamilyExpenses: 600000,
  expenseReplacementYears: 15,
  futureGoals: 2000000,
  existingAssets: 1000000,
  coverageYears: 35,
  sizingMethod: 'dime',
  customSumAssured: 15000000,
  criticalIllnessRider: false,
  accidentalRider: false,
  waiverOfPremiumRider: false,
  sipReturnRate: 12,
  currencySymbol: '₹',
};

export function calculateTermLifeInsuranceCalculator(inputs = {}) {
  const merged = { ...DEFAULT_TERM_INSURANCE_INPUTS, ...inputs };

  const age = Math.max(18, Math.min(65, Math.round(Number(merged.currentAge) || 30)));
  const isFemale = String(merged.gender).toLowerCase() === 'female';
  const isTobaccoUser = Boolean(merged.isSmoker === true || merged.isSmoker === 'true' || merged.isSmoker === 1);
  
  const income = Math.max(0, Number(merged.annualIncome) || 0);
  const debts = Math.max(0, Number(merged.existingLiabilities) || 0);
  const expenses = Math.max(0, Number(merged.annualFamilyExpenses) || 0);
  const replYears = Math.max(1, Math.min(40, Number(merged.expenseReplacementYears) || 15));
  const goals = Math.max(0, Number(merged.futureGoals) || 0);
  const assets = Math.max(0, Number(merged.existingAssets) || 0);
  const termYears = Math.max(5, Math.min(50, Math.min(85 - age, Number(merged.coverageYears) || 35)));
  
  const method = String(merged.sizingMethod || 'dime').toLowerCase();
  const customSa = Math.max(500000, Number(merged.customSumAssured) || 15000000);
  const hasCI = Boolean(merged.criticalIllnessRider);
  const hasAccidental = Boolean(merged.accidentalRider);
  const hasWOP = Boolean(merged.waiverOfPremiumRider);
  const rawSipRate = Number(merged.sipReturnRate);
  const sipRate = isNaN(rawSipRate) ? 12 : Math.max(0, Math.min(30, rawSipRate));
  const currencySymbol = merged.currencySymbol || '₹';

  // 1. Sizing Methodology Calculations
  // A. DIME (Debt, Income, Mortgage, Education)
  const dimeSizing = Math.round(Math.max(500000, debts + (expenses * replYears) + goals - assets) / 100000) * 100000;

  // B. Human Life Value (HLV): Capitalize 70% net earnings (less 30% personal consumption)
  const workingYearsRemaining = Math.max(1, 60 - age);
  const netAnnualContribution = income * 0.70;
  const realDiscountRate = 0.03; // 3% real interest rate (8% yield - 5% inflation)
  const hlvMultiplier = realDiscountRate > 0
    ? (1 - Math.pow(1 + realDiscountRate, -workingYearsRemaining)) / realDiscountRate
    : workingYearsRemaining;
  const hlvSizing = Math.round(Math.max(500000, Math.round(netAnnualContribution * hlvMultiplier)) / 100000) * 100000;

  // C. Income Multiple Rule (25x under 30, 20x under 40, 15x under 50, 10x thereafter)
  let incomeMultiplier = 20;
  if (age < 30) incomeMultiplier = 25;
  else if (age < 40) incomeMultiplier = 20;
  else if (age < 50) incomeMultiplier = 15;
  else incomeMultiplier = 10;
  const multipleSizing = Math.round(Math.max(500000, income * incomeMultiplier) / 100000) * 100000;

  // Active Recommended Sum Assured
  let recommendedSumAssured = dimeSizing;
  if (method === 'hlv') recommendedSumAssured = hlvSizing;
  else if (method === 'multiple') recommendedSumAssured = multipleSizing;
  else if (method === 'custom') recommendedSumAssured = Math.round(customSa / 100000) * 100000;

  // 2. Actuarial Annual Premium Estimation
  const mortalityBand = MORTALITY_RATES_PER_THOUSAND.find((b) => age <= b.maxAge) || MORTALITY_RATES_PER_THOUSAND[MORTALITY_RATES_PER_THOUSAND.length - 1];
  let baseRatePerThousand = mortalityBand.baseRate;

  // Policy duration loading (longer policies have higher average mortality)
  if (termYears > 30) baseRatePerThousand *= 1.15;
  else if (termYears > 20) baseRatePerThousand *= 1.08;

  // Gender longevity discount (females get ~10% lower rates)
  if (isFemale) baseRatePerThousand *= 0.90;

  // Smoker surcharge (+60% for tobacco users)
  if (isTobaccoUser) baseRatePerThousand *= 1.60;

  // Base Pure Term Premium (before riders & GST)
  const baseAnnualPremium = Math.round((recommendedSumAssured / 1000) * baseRatePerThousand);

  // Riders calculation
  let ciRiderCost = 0;
  let accidentalRiderCost = 0;
  let wopRiderCost = 0;

  if (hasCI) ciRiderCost = Math.round(baseAnnualPremium * 0.20);
  if (hasAccidental) accidentalRiderCost = Math.round(baseAnnualPremium * 0.10);
  if (hasWOP) wopRiderCost = Math.round(baseAnnualPremium * 0.04);

  const totalNetPremium = baseAnnualPremium + ciRiderCost + accidentalRiderCost + wopRiderCost;
  const gstAmount = Math.round(totalNetPremium * 0.18); // 18% GST on life insurance in India
  const grossAnnualPremium = totalNetPremium + gstAmount;
  const monthlyEquivalentPremium = Math.round(grossAnnualPremium / 12);
  const totalLifetimePremiumsPaid = grossAnnualPremium * termYears;

  // 3. Pure Term vs Return of Premium (TROP) Opportunity Cost Analysis
  // TROP costs ~2.2x pure term
  const tropAnnualPremium = Math.round(grossAnnualPremium * 2.2);
  const tropRefundAtMaturity = tropAnnualPremium * termYears;
  const annualPremiumDifference = tropAnnualPremium - grossAnnualPremium;

  // Future Value of Premium Difference invested in Index SIP @ sipRate %
  const monthlySipDiff = annualPremiumDifference / 12;
  const monthlyRate = sipRate / 100 / 12;
  const totalMonths = termYears * 12;
  const sipFutureValue = monthlyRate > 0
    ? Math.round(monthlySipDiff * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate))
    : annualPremiumDifference * termYears;

  const sipWealthAdvantage = Math.max(0, sipFutureValue - tropRefundAtMaturity);

  // 4. Section 80C Tax Savings Estimate (assuming 30% tax bracket)
  const annualTaxSavingsSec80C = Math.min(150000 * 0.312, Math.round(grossAnnualPremium * 0.312));

  // 5. Scenario Sizing Comparisons Matrix
  const sizingScenarios = [
    {
      id: 'dime',
      name: 'DIME Needs-Based',
      cover: dimeSizing,
      annualPremium: Math.round((dimeSizing / 1000) * baseRatePerThousand * 1.18),
      description: 'Covers debts, 15-yr family living expenses & kids goals minus assets.',
    },
    {
      id: 'hlv',
      name: 'Human Life Value (HLV)',
      cover: hlvSizing,
      annualPremium: Math.round((hlvSizing / 1000) * baseRatePerThousand * 1.18),
      description: 'Capitalizes your net economic earning capacity until age 60.',
    },
    {
      id: 'multiple',
      name: `Income Multiple (${incomeMultiplier}x)`,
      cover: multipleSizing,
      annualPremium: Math.round((multipleSizing / 1000) * baseRatePerThousand * 1.18),
      description: `Rule of thumb based on your current age (${age} yrs).`,
    },
  ];

  // 6. Smart Ranked Recommendations
  const recommendations = [
    {
      rank: 1,
      title: 'Opt for Pure Term over Return of Premium (TROP)',
      savings: sipWealthAdvantage,
      action: `Choosing Pure Term (${currencySymbol}${grossAnnualPremium.toLocaleString()}/yr) and investing the ${currencySymbol}${annualPremiumDifference.toLocaleString()}/yr difference into an Equity Index Fund generates ${currencySymbol}${sipFutureValue.toLocaleString()} at maturity—beating TROP refund by ${currencySymbol}${sipWealthAdvantage.toLocaleString()}.`,
    },
    {
      rank: 2,
      title: isTobaccoUser ? 'Smoker Cessation Surcharge Reduction' : 'Non-Smoker Preferred Rating Locked In',
      savings: isTobaccoUser ? Math.round(grossAnnualPremium * 0.375) : 0,
      action: isTobaccoUser
        ? `Tobacco use adds +60% mortality surcharge. Quitting for 12 months allows re-underwriting to save ~${currencySymbol}${Math.round(grossAnnualPremium * 0.375).toLocaleString()} annually (${currencySymbol}${Math.round(grossAnnualPremium * 0.375 * termYears).toLocaleString()} over policy life).`
        : `Your non-smoker status secures the lowest institutional mortality band, saving over 35% compared to smoker underwriting rates.`,
    },
    {
      rank: 3,
      title: 'Tax Exemption under Sec 80C & Sec 10(10D)',
      savings: annualTaxSavingsSec80C,
      action: `Premiums qualify for tax deductions up to ₹1,50,000 under Section 80C. Under Section 10(10D), the entire ${currencySymbol}${recommendedSumAssured.toLocaleString()} death benefit is 100% tax-free to your nominees.`,
    },
  ];

  // 7. Hero Decision Text
  const heroText = `Recommended Term Life Insurance cover is ${currencySymbol}${recommendedSumAssured.toLocaleString()} with an estimated annual premium of ${currencySymbol}${grossAnnualPremium.toLocaleString()} (${currencySymbol}${monthlyEquivalentPremium.toLocaleString()}/month) for ${termYears} years.`;

  return {
    primaryOutput: grossAnnualPremium,
    currentAge: age,
    gender: isFemale ? 'female' : 'male',
    isSmoker: isTobaccoUser,
    annualIncome: income,
    recommendedSumAssured,
    coverageYears: termYears,
    sizingMethod: method,
    dimeSizing,
    hlvSizing,
    multipleSizing,
    baseAnnualPremium,
    ciRiderCost,
    accidentalRiderCost,
    wopRiderCost,
    totalNetPremium,
    gstAmount,
    grossAnnualPremium,
    monthlyEquivalentPremium,
    totalLifetimePremiumsPaid,
    tropAnnualPremium,
    tropRefundAtMaturity,
    annualPremiumDifference,
    sipFutureValue,
    sipWealthAdvantage,
    annualTaxSavingsSec80C,
    sizingScenarios,
    recommendations,
    heroText,
    currencySymbol,
  };
}

export const calculateTermLifeInsuranceTool = calculateTermLifeInsuranceCalculator;
