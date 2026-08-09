import { calculatePensionCalculator } from '../retirement/pension-calculator.js';

export const PENSION_CONFIG = {
  id: 'pension-calculator',
  title: 'Pension & Annuity Calculator',
  category: 'Retirement Calculators',
  categorySlug: 'retirement',
  defaultPensionCorpus: 5000000,
  defaultAnnuityRate: 6.5,
  defaultAnnuityType: 'rop',
  defaultEmploymentType: 'private_gratuity',
  defaultCommutationPct: 33.33,
  defaultEpsSalary: 15000,
  defaultEpsServiceYears: 30,

  benchmarks: {
    epsMaxSalaryCap: 15000,
    epsDivisor: 70,
    epsMinServiceYears: 10,
    epsBonusYears: 2,
    epsBonusThresholdService: 20,
    sec10_10a_gratuityCommutationLimit: 1 / 3,
    sec10_10a_nonGratuityCommutationLimit: 1 / 2,
    sec10_10a_govtCommutationLimit: 1.0,
    defaultSwpReturnRate: 8.5,
    defaultInflationRate: 5.0,
  },

  annuityTypes: [
    {
      id: 'single_life',
      label: 'Single Life Annuity',
      description: 'Highest fixed monthly pension paid for retiree\'s entire life (ceases upon death).',
      rateAdjustment: 0.5, // ~7.0% if base is 6.5%
    },
    {
      id: 'joint_life',
      label: 'Joint Life Annuity (100% Spouse)',
      description: 'Pension continues to spouse for their lifetime upon demise of primary retiree.',
      rateAdjustment: -0.3, // ~6.2% if base is 6.5%
    },
    {
      id: 'rop',
      label: 'Life Annuity with Return of Purchase Price (ROP)',
      description: 'Guaranteed pension for life + 100% principal corpus returned to nominee on death.',
      rateAdjustment: 0.0, // Benchmark 6.5%
    },
    {
      id: 'guaranteed_20y',
      label: '20-Year Guaranteed Annuity & Life',
      description: 'Pension guaranteed for at least 20 years to retiree/nominee, and for life thereafter.',
      rateAdjustment: 0.2, // ~6.7% if base is 6.5%
    },
  ],

  employmentTypes: [
    {
      id: 'private_gratuity',
      label: 'Private Sector (Covered by Gratuity Act)',
      taxExemptCommutationFraction: 1 / 3,
      description: 'Up to 1/3rd (33.33%) commuted lump sum is 100% tax-free under Sec 10(10A)(ii)(a).',
    },
    {
      id: 'private_non_gratuity',
      label: 'Private Sector (Not Covered by Gratuity Act)',
      taxExemptCommutationFraction: 1 / 2,
      description: 'Up to 1/2 (50.00%) commuted lump sum is 100% tax-free under Sec 10(10A)(ii)(b).',
    },
    {
      id: 'government',
      label: 'Government / PSU Employee',
      taxExemptCommutationFraction: 1.0,
      description: '100% commuted pension lump sum is tax-exempt under Sec 10(10A)(i).',
    },
  ],

  presets: [
    {
      id: 'rop_pension_50l',
      title: '👑 Max Return of Purchase Price (₹50L @ 6.5% ROP)',
      description: 'Guaranteed ₹27,083/month pension for life while preserving ₹50 Lakhs principal for heirs.',
      values: {
        pensionCorpus: 5000000,
        annuityRate: 6.5,
        annuityType: 'rop',
        employmentType: 'private_gratuity',
        commutationPct: 0,
        epsServiceYears: 0,
        currency: 'INR',
      },
    },
    {
      id: 'joint_spouse_1cr',
      title: '💑 Joint Life Spouse Annuity (₹1 Crore @ 6.2% Joint)',
      description: 'Provides ₹51,667/month lifetime passive pension for both retiree and surviving spouse.',
      values: {
        pensionCorpus: 10000000,
        annuityRate: 6.2,
        annuityType: 'joint_life',
        employmentType: 'private_gratuity',
        commutationPct: 0,
        epsServiceYears: 0,
        currency: 'INR',
      },
    },
    {
      id: 'commuted_tax_free_33',
      title: '✂️ 33.3% Tax-Free Lump-Sum Commutation (₹75L Corpus)',
      description: 'Commute ₹25 Lakhs 100% tax-free upfront, deploying remaining ₹50L into lifetime annuity.',
      values: {
        pensionCorpus: 7500000,
        annuityRate: 6.5,
        annuityType: 'rop',
        employmentType: 'private_gratuity',
        commutationPct: 33.33,
        epsServiceYears: 0,
        currency: 'INR',
      },
    },
    {
      id: 'epfo_eps_35yr',
      title: '🏛️ EPFO EPS-95 Pension (35 Yrs Service @ ₹15,000 Cap)',
      description: 'Statutory EPFO EPS-95 monthly pension calculation with 2-year long-service bonus.',
      values: {
        pensionCorpus: 0,
        annuityRate: 6.5,
        annuityType: 'rop',
        employmentType: 'private_gratuity',
        commutationPct: 0,
        epsSalary: 15000,
        epsServiceYears: 35,
        currency: 'INR',
      },
    },
  ],
};

export const pensionCalculatorConfig = {
  ...PENSION_CONFIG,
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculatePensionCalculator,
  primaryResult: {
    key: 'totalMonthlyIncome',
    label: 'Total Net Monthly Pension Income',
  },
  ratioBarItems: [
    { key: 'annualAnnuityPension', label: 'Annual Annuity Pension', colorClass: 'bg-primary' },
    { key: 'epsAnnualPension', label: 'EPFO EPS-95 Annual Pension', colorClass: 'bg-semantic-up' },
  ],
  summaryItems: [
    { key: 'pensionCorpus', label: 'Initial Pension Corpus' },
    { key: 'commutedLumpSum', label: 'Commuted Tax-Free Lump Sum' },
    { key: 'netAnnuityCorpus', label: 'Net Corpus Deployed into Annuity' },
    { key: 'monthlyAnnuityPension', label: 'Monthly Annuity Pension', class: 'text-semantic-up' },
    { key: 'epsMonthlyPension', label: 'EPFO EPS-95 Monthly Pension', class: 'text-indigo-600' },
    { key: 'totalMonthlyIncome', label: 'Total Net Monthly Pension Payout', isTotal: true },
  ],
  inputs: [
    {
      id: 'pensionCorpus',
      type: 'number',
      label: 'Retirement Pension Corpus (₹)',
      min: 0,
      max: 100000000,
      step: 50000,
      prefix: '₹',
      minLabel: '₹0',
      maxLabel: '₹10 Cr',
      default: 5000000,
    },
    {
      id: 'annuityRate',
      type: 'number',
      label: 'Assumed Annuity Rate (% p.a.)',
      min: 1,
      max: 15,
      step: 0.1,
      suffix: '%',
      minLabel: '1.0%',
      maxLabel: '15.0%',
      default: 6.5,
    },
  ],
  hasAmortizationTable: false,
};