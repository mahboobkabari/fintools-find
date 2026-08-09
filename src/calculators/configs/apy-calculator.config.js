import { calculateApyCalculator } from '../retirement/apy-calculator.js';

export const APY_CONFIG = {
  id: 'apy-calculator',
  title: 'Atal Pension Yojana (APY) Calculator',
  category: 'Retirement Calculators',
  categorySlug: 'retirement',
  defaultEntryAge: 25,
  defaultTargetPension: 5000,
  defaultFrequency: 'monthly',

  benchmarks: {
    minEntryAge: 18,
    maxEntryAge: 40,
    pensionStartAge: 60,
    pensionTiers: [1000, 2000, 3000, 4000, 5000],
    sourceNotice: 'Pension Fund Regulatory and Development Authority (PFRDA) & Ministry of Finance, Government of India',
    taxPayerExclusionDate: 'October 1, 2022',
  },

  // Statutory PFRDA Nominee Return of Corpus Map
  nomineeCorpusMap: {
    1000: 170000,
    2000: 340000,
    3000: 510000,
    4000: 680000,
    5000: 850000,
  },

  // Official PFRDA Statutory Monthly Contribution Table (Entry Ages 18 to 40)
  // Format: [age, tier1000, tier2000, tier3000, tier4000, tier5000]
  pfrdaContributionTable: {
    18: { 1000: 42, 2000: 84, 3000: 126, 4000: 168, 5000: 210 },
    19: { 1000: 46, 2000: 92, 3000: 138, 4000: 183, 5000: 228 },
    20: { 1000: 50, 2000: 100, 3000: 150, 4000: 198, 5000: 248 },
    21: { 1000: 55, 2000: 109, 3000: 163, 4000: 217, 5000: 271 },
    22: { 1000: 59, 2000: 118, 3000: 177, 4000: 236, 5000: 295 },
    23: { 1000: 65, 2000: 128, 3000: 192, 4000: 256, 5000: 320 },
    24: { 1000: 70, 2000: 139, 3000: 208, 4000: 277, 5000: 347 },
    25: { 1000: 76, 2000: 151, 3000: 226, 4000: 301, 5000: 376 },
    26: { 1000: 82, 2000: 164, 3000: 245, 4000: 327, 5000: 409 },
    27: { 1000: 90, 2000: 178, 3000: 267, 4000: 356, 5000: 446 },
    28: { 1000: 97, 2000: 193, 3000: 289, 4000: 386, 5000: 483 },
    29: { 1000: 106, 2000: 211, 3000: 316, 4000: 421, 5000: 527 },
    30: { 1000: 116, 2000: 231, 3000: 347, 4000: 462, 5000: 577 },
    31: { 1000: 126, 2000: 252, 3000: 378, 4000: 504, 5000: 630 },
    32: { 1000: 138, 2000: 276, 3000: 413, 4000: 551, 5000: 689 },
    33: { 1000: 150, 2000: 300, 3000: 450, 4000: 601, 5000: 751 },
    34: { 1000: 165, 2000: 329, 3000: 494, 4000: 658, 5000: 823 },
    35: { 1000: 181, 2000: 362, 3000: 543, 4000: 722, 5000: 902 },
    36: { 1000: 198, 2000: 396, 3000: 593, 4000: 791, 5000: 989 },
    37: { 1000: 218, 2000: 436, 3000: 653, 4000: 871, 5000: 1088 },
    38: { 1000: 240, 2000: 479, 3000: 718, 4000: 957, 5000: 1196 },
    39: { 1000: 264, 2000: 528, 3000: 792, 4000: 1056, 5000: 1318 },
    40: { 1000: 291, 2000: 582, 3000: 873, 4000: 1164, 5000: 1454 },
  },

  presets: [
    {
      id: 'max_pension_18',
      title: '👑 Max Guaranteed Pension at Age 18 (₹5,000/mo @ ₹210/mo)',
      description: 'Earliest entry age maximizing guaranteed lifetime pension with minimal monthly contribution of ₹210.',
      values: {
        entryAge: 18,
        targetPension: 5000,
        frequency: 'monthly',
        currency: 'INR',
      },
    },
    {
      id: 'mid_entry_30',
      title: '🚀 Mid-Career Entry at Age 30 (₹5,000/mo @ ₹577/mo)',
      description: 'Standard mid-career entry securing ₹5,000 monthly pension starting at age 60.',
      values: {
        entryAge: 30,
        targetPension: 5000,
        frequency: 'monthly',
        currency: 'INR',
      },
    },
    {
      id: 'late_entry_40',
      title: '🛡️ Late Entry Cap at Age 40 (₹5,000/mo @ ₹1,454/mo)',
      description: 'Maximum entry age 40 securing ₹5,000 monthly pension over a 20-year contribution window.',
      values: {
        entryAge: 40,
        targetPension: 5000,
        frequency: 'monthly',
        currency: 'INR',
      },
    },
    {
      id: 'starter_micro_20',
      title: '🌱 Starter Micro Pension (Age 20, ₹1,000/mo @ ₹50/mo)',
      description: 'Entry-level social security micro pension tier requiring just ₹50 monthly contribution.',
      values: {
        entryAge: 20,
        targetPension: 1000,
        frequency: 'monthly',
        currency: 'INR',
      },
    },
  ],
};

export const apyCalculatorConfig = {
  ...APY_CONFIG,
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculateApyCalculator,
  primaryResult: {
    key: 'guaranteedMonthlyPension',
    label: 'Guaranteed Monthly Lifetime Pension',
  },
  ratioBarItems: [
    { key: 'totalEmployeeContribution', label: 'Total Employee Contribution Paid', colorClass: 'bg-primary' },
    { key: 'nomineeCorpusReturn', label: 'Statutory Return of Corpus to Nominee', colorClass: 'bg-semantic-up' },
  ],
  summaryItems: [
    { key: 'entryAge', label: 'Subscriber Entry Age' },
    { key: 'monthlyContribution', label: 'Auto-Debited Monthly Contribution' },
    { key: 'tenureYears', label: 'Contribution Window (Years)' },
    { key: 'totalEmployeeContribution', label: 'Total Cumulative Contribution Paid' },
    { key: 'guaranteedMonthlyPension', label: 'Guaranteed Monthly Lifetime Pension', class: 'text-emerald-600 font-bold' },
    { key: 'guaranteedAnnualPension', label: 'Guaranteed Annual Pension Payout' },
    { key: 'nomineeCorpusReturn', label: 'Statutory Nominee Corpus Return', isTotal: true },
  ],
  inputs: [
    {
      id: 'entryAge',
      type: 'number',
      label: 'Subscriber Entry Age (Years)',
      min: 18,
      max: 40,
      step: 1,
      suffix: ' Yrs',
      minLabel: '18 Yrs',
      maxLabel: '40 Yrs (Max)',
      default: 25,
    },
    {
      id: 'targetPension',
      type: 'select',
      label: 'Target Guaranteed Monthly Pension',
      options: [
        { value: 1000, label: '₹1,000 / month (Nominee Corpus: ₹1.7 Lakhs)' },
        { value: 2000, label: '₹2,000 / month (Nominee Corpus: ₹3.4 Lakhs)' },
        { value: 3000, label: '₹3,000 / month (Nominee Corpus: ₹5.1 Lakhs)' },
        { value: 4000, label: '₹4,000 / month (Nominee Corpus: ₹6.8 Lakhs)' },
        { value: 5000, label: '₹5,000 / month (Nominee Corpus: ₹8.5 Lakhs)' },
      ],
      default: 5000,
    },
  ],
  hasAmortizationTable: true,
};
