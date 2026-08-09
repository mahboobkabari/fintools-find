import { calculateScssCalculator } from '../savings/scss-calculator.js';

export const SCSS_CONFIG = {
  id: 'scss-calculator',
  title: 'Senior Citizens Savings Scheme (SCSS) Calculator',
  category: 'Deposit & Savings Calculators',
  categorySlug: 'savings',
  defaultDepositAmount: 3000000,
  defaultRate: 8.2,
  defaultAccountType: 'individual',

  presets: [
    {
      id: 'max_individual_30l',
      title: '👑 Max Individual Deposit (₹30 Lakhs @ 8.2%)',
      description: 'Maximal individual deposit generating ₹61,500 guaranteed quarterly pension income.',
      values: {
        depositAmount: 3000000,
        accountType: 'individual',
        eligibilityCategory: 'age_60_plus',
        rate: 8.2,
        hasPan: true,
        hasForm15H: false,
        currency: 'INR',
      },
    },
    {
      id: 'max_joint_60l',
      title: '💑 Max Joint Deposit with Spouse (₹60 Lakhs @ 8.2%)',
      description: 'Joint account with spouse utilizing full ₹60 Lakh statutory limit for ₹123,000/quarter income.',
      values: {
        depositAmount: 6000000,
        accountType: 'joint',
        eligibilityCategory: 'age_60_plus',
        rate: 8.2,
        hasPan: true,
        hasForm15H: false,
        currency: 'INR',
      },
    },
    {
      id: 'moderate_15l',
      title: '🛡️ Moderate Retirement Allocation (₹15 Lakhs @ 8.2%)',
      description: 'Balanced retirement deposit generating ₹30,750 quarterly passive interest income.',
      values: {
        depositAmount: 1500000,
        accountType: 'individual',
        eligibilityCategory: 'age_60_plus',
        rate: 8.2,
        hasPan: true,
        hasForm15H: true, // Form 15H submitted
        currency: 'INR',
      },
    },
    {
      id: 'vrs_retiree_55',
      title: '🎖️ VRS Civilian Retiree (₹20 Lakhs @ 8.2%)',
      description: 'Retired civilian employee aged 55-60 deploying lump-sum VRS retirement benefits into SCSS.',
      values: {
        depositAmount: 2000000,
        accountType: 'individual',
        eligibilityCategory: 'vrs_55_60',
        rate: 8.2,
        hasPan: true,
        hasForm15H: false,
        currency: 'INR',
      },
    },
  ],

  benchmarks: {
    govtNotifiedScssRate: 8.2,
    individualMaxCap: 3000000,
    jointMaxCap: 6000000,
    minDeposit: 1000,
    tenureYears: 5,
    extensionYears: 3,
    sec80cMaxCap: 150000,
    sec80ttbMaxExemption: 50000,
    sec194aSeniorThreshold: 50000,
    expectedFdRateBenchmark: 7.5,
  },
};

export const scssCalculatorConfig = {
  ...SCSS_CONFIG,
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculateScssCalculator,
  primaryResult: {
    key: 'quarterlyGrossPayout',
    label: 'Guaranteed Quarterly Passive Income',
  },
  ratioBarItems: [
    { key: 'depositAmount', label: 'Principal Deposit', colorClass: 'bg-primary' },
    { key: 'total5YearInterest', label: 'Total 5-Year Interest Income', colorClass: 'bg-semantic-up' },
  ],
  summaryItems: [
    { key: 'depositAmount', label: 'Principal SCSS Deposit' },
    { key: 'quarterlyGrossPayout', label: 'Guaranteed Quarterly Pension Income', class: 'text-semantic-up' },
    { key: 'annualGrossInterest', label: 'Annual Gross Interest Income' },
    { key: 'sec80ttbExemptInterest', label: 'Section 80TTB Tax-Exempt Interest', class: 'text-semantic-success' },
    { key: 'estimatedAnnualTds', label: 'Estimated Section 194A TDS Tax', class: 'text-semantic-down' },
    { key: 'total5YearInterest', label: 'Total 5-Year Interest Earned', isTotal: true },
  ],
  inputs: [
    {
      id: 'depositAmount',
      type: 'number',
      label: 'SCSS Deposit Amount (₹)',
      min: 1000,
      max: 6000000,
      step: 1000,
      prefix: '₹',
      minLabel: '₹1,000',
      maxLabel: '₹60L',
      default: 3000000,
    },
    {
      id: 'rate',
      type: 'number',
      label: 'Interest Rate (% p.a.)',
      min: 1,
      max: 15,
      step: 0.1,
      suffix: '%',
      minLabel: '1%',
      maxLabel: '15%',
      default: 8.2,
    },
  ],
  hasAmortizationTable: false,
};
