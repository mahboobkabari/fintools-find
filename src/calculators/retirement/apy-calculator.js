import { APY_CONFIG } from '../configs/apy-calculator.config.js';

/**
 * Flagship Atal Pension Yojana (APY) Math & Decision Engine (V3)
 * Implements Pension Fund Regulatory and Development Authority (PFRDA) APY provisions:
 * - Subscriber Entry Age Window: 18 to 40 Years
 * - Pension Start Age: 60 Years
 * - Guaranteed Monthly Pension Tiers: ₹1,000, ₹2,000, ₹3,000, ₹4,000, ₹5,000 / month
 * - PFRDA Statutory Monthly Contribution Table lookup by entry age & pension tier
 * - Auto-debit payment frequencies: Monthly, Quarterly, and Half-Yearly
 * - Statutory Return of Pension Corpus to Nominee upon death (up to ₹8,50,000)
 * - Inflation-adjusted real purchasing power pension at age 60
 * - Year-by-year cumulative contribution schedule generation
 *
 * @param {Object} inputs
 * @param {number} [inputs.entryAge=25] - Subscriber entry age (18 to 40 Years)
 * @param {number} [inputs.targetPension=5000] - Target monthly pension (1000, 2000, 3000, 4000, 5000)
 * @param {string} [inputs.frequency='monthly'] - Payment frequency ('monthly' | 'quarterly' | 'halfYearly')
 * @param {number} [inputs.inflationRate=5.0] - Inflation rate (%)
 * @param {string} [inputs.currency='INR'] - Currency code ('INR' | 'USD' | 'EUR' | 'GBP')
 * @returns {Object} Structured APY decision model
 */
export function calculateApyCalculator(inputs = {}) {
  const {
    entryAge = 25,
    targetPension = 5000,
    frequency = 'monthly',
    inflationRate = 5.0,
    currency = 'INR',
  } = inputs;

  // 1. INPUT SANITIZATION & BOUNDARY VALIDATION
  const rawAge = Number(entryAge) || 25;
  const ageEntry = Math.round(rawAge);
  const inflPct = Math.max(0, Math.min(20, Number(inflationRate) || 0));

  // Validate Entry Age Window (18 to 40 Years)
  const isValidEntryAge = ageEntry >= 18 && ageEntry <= 40;
  if (!isValidEntryAge) {
    return createInvalidApyResult(ageEntry, currency);
  }

  // Validate Pension Tier
  const validTiers = APY_CONFIG.benchmarks.pensionTiers;
  const pensionTier = validTiers.includes(Number(targetPension)) ? Number(targetPension) : 5000;

  // 2. PFRDA CONTRIBUTION LOOKUP
  const monthlyContribution = APY_CONFIG.pfrdaContributionTable[ageEntry]?.[pensionTier] || 0;
  const quarterlyContribution = Math.round(monthlyContribution * 3);
  const halfYearlyContribution = Math.round(monthlyContribution * 6);

  // 3. TENURE & TOTAL CONTRIBUTION MATH
  const pensionStartAge = 60;
  const tenureYears = pensionStartAge - ageEntry;
  const tenureMonths = tenureYears * 12;
  const totalEmployeeContribution = monthlyContribution * tenureMonths;

  // 4. GUARANTEED PENSION BENEFITS & NOMINEE RETURN OF CORPUS
  const guaranteedMonthlyPension = pensionTier;
  const guaranteedAnnualPension = pensionTier * 12;
  const nomineeCorpusReturn = APY_CONFIG.nomineeCorpusMap[pensionTier] || 850000;

  // 5. INFLATION-ADJUSTED REAL PURCHASING POWER AT AGE 60
  const purchasingPowerPension = Math.round(guaranteedMonthlyPension / Math.pow(1 + inflPct / 100, tenureYears));

  // 6. YEAR-BY-YEAR CUMULATIVE CONTRIBUTION SCHEDULE
  const yearlySchedule = [];
  const annualContrib = monthlyContribution * 12;
  let cumContrib = 0;

  for (let y = 1; y <= tenureYears; y++) {
    cumContrib += annualContrib;
    yearlySchedule.push({
      year: y,
      age: ageEntry + y,
      annualContribution: annualContrib,
      cumulativeContribution: cumContrib,
      isRetirementRow: ageEntry + y === 60,
    });
  }

  // 7. SCENARIO MATRIX COMPARISON
  const scenarios = [
    {
      id: 'baseline',
      label: 'Your Entry Age (' + ageEntry + ' Yrs)',
      entryAge: ageEntry,
      monthlyContribution,
      totalEmployeeContribution,
      guaranteedMonthlyPension,
      nomineeCorpusReturn,
    },
    {
      id: 'entry_18',
      label: 'Earliest Entry (Age 18)',
      entryAge: 18,
      monthlyContribution: APY_CONFIG.pfrdaContributionTable[18][pensionTier],
      totalEmployeeContribution: APY_CONFIG.pfrdaContributionTable[18][pensionTier] * 42 * 12,
      guaranteedMonthlyPension,
      nomineeCorpusReturn,
    },
    {
      id: 'entry_30',
      label: 'Mid Entry (Age 30)',
      entryAge: 30,
      monthlyContribution: APY_CONFIG.pfrdaContributionTable[30][pensionTier],
      totalEmployeeContribution: APY_CONFIG.pfrdaContributionTable[30][pensionTier] * 30 * 12,
      guaranteedMonthlyPension,
      nomineeCorpusReturn,
    },
    {
      id: 'entry_40',
      label: 'Late Entry Cap (Age 40)',
      entryAge: 40,
      monthlyContribution: APY_CONFIG.pfrdaContributionTable[40][pensionTier],
      totalEmployeeContribution: APY_CONFIG.pfrdaContributionTable[40][pensionTier] * 20 * 12,
      guaranteedMonthlyPension,
      nomineeCorpusReturn,
    },
  ];

  // 8. HERO SUMMARY TEXT
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const heroText = `Joining APY at age ${ageEntry} with an auto-debited monthly contribution of ${currencySymbol}${monthlyContribution.toLocaleString()} secures a guaranteed lifetime monthly pension of ${currencySymbol}${guaranteedMonthlyPension.toLocaleString()} starting at age 60 (${currencySymbol}${nomineeCorpusReturn.toLocaleString()} nominee corpus return).`;

  return {
    entryAge: ageEntry,
    targetPension: pensionTier,
    frequency,
    pensionStartAge,
    tenureYears,
    tenureMonths,
    isValidEntryAge: true,
    currency,

    // Primary Outputs
    primaryOutput: guaranteedMonthlyPension,
    guaranteedMonthlyPension,
    guaranteedAnnualPension,
    monthlyContribution,
    quarterlyContribution,
    halfYearlyContribution,
    totalEmployeeContribution,
    nomineeCorpusReturn,

    // Inflation & Schedules
    purchasingPowerPension,
    yearlySchedule,
    scenarios,
    heroText,
  };
}

/**
 * Fallback Engine Result for Invalid Entry Age
 */
function createInvalidApyResult(entryAge, currency = 'INR') {
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  return {
    entryAge,
    targetPension: 5000,
    frequency: 'monthly',
    pensionStartAge: 60,
    tenureYears: 0,
    tenureMonths: 0,
    isValidEntryAge: false,
    currency,

    primaryOutput: 0,
    guaranteedMonthlyPension: 0,
    guaranteedAnnualPension: 0,
    monthlyContribution: 0,
    quarterlyContribution: 0,
    halfYearlyContribution: 0,
    totalEmployeeContribution: 0,
    nomineeCorpusReturn: 0,

    purchasingPowerPension: 0,
    yearlySchedule: [],
    scenarios: [],
    heroText: `Subscriber entry age must be between 18 and 40 years. Age ${entryAge} is outside the statutory PFRDA Atal Pension Yojana eligibility window.`,
  };
}
