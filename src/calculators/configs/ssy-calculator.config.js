import { calculateSsyCalculator } from '../savings/ssy-calculator.js';

export const SSY_CONFIG = {
  id: 'ssy-calculator',
  title: 'Sukanya Samriddhi Yojana (SSY) Calculator',
  category: 'Deposit & Savings Calculators',
  categorySlug: 'savings',
  defaultAnnualDeposit: 150000,
  defaultRate: 8.2,
  defaultGirlChildAge: 1,

  presets: [
    {
      id: 'max_80c_150k',
      title: '🌟 Maximum Sec 80C Deposit (₹150,000/year @ 8.2%)',
      description: 'Maximal annual contribution utilizing the full ₹1.5 Lakh Section 80C tax deduction limit.',
      values: {
        annualDeposit: 150000,
        girlChildAge: 1,
        rate: 8.2,
        allowEducationWithdrawal: false,
        marginalTaxRate: 30,
        currency: 'INR',
      },
    },
    {
      id: 'target_100k',
      title: '🎓 Higher Education Corpus Goal (₹100,000/year @ 8.2%)',
      description: 'Systematic annual savings accumulating a guaranteed lump-sum college education fund.',
      values: {
        annualDeposit: 100000,
        girlChildAge: 1,
        rate: 8.2,
        allowEducationWithdrawal: false,
        marginalTaxRate: 20,
        currency: 'INR',
      },
    },
    {
      id: 'edu_withdrawn_150k',
      title: '🏫 50% College Admission Withdrawal (₹150,000/year with Age 18 Withdrawal)',
      description: 'Model 50% partial withdrawal when girl child turns 18 for college admission fees.',
      values: {
        annualDeposit: 150000,
        girlChildAge: 1,
        rate: 8.2,
        allowEducationWithdrawal: true,
        marginalTaxRate: 30,
        currency: 'INR',
      },
    },
    {
      id: 'starter_50k',
      title: '🌱 Starter Annual Deposit (₹50,000/year @ 8.2%)',
      description: 'Disciplined starter deposit accumulating 100% tax-free compound interest over 21 years.',
      values: {
        annualDeposit: 50000,
        girlChildAge: 1,
        rate: 8.2,
        allowEducationWithdrawal: false,
        marginalTaxRate: 20,
        currency: 'INR',
      },
    },
  ],

  benchmarks: {
    govtNotifiedSsyRate: 8.2,
    sec80cMaxDepositCap: 150000,
    minAnnualDeposit: 250,
    contributionWindowYears: 15,
    maturityHorizonYears: 21,
    expectedSipReturnBenchmark: 12.0,
  },
};

export const ssyCalculatorConfig = {
  ...SSY_CONFIG,
  currency: 'INR',
  currencySymbol: '₹',
  calculateFn: calculateSsyCalculator,
  primaryResult: {
    key: 'maturityValue',
    label: 'Guaranteed 100% Tax-Free Maturity Value',
  },
  ratioBarItems: [
    { key: 'totalDeposits', label: 'Total Installments Paid', colorClass: 'bg-primary' },
    { key: 'totalInterest', label: 'Total Tax-Free Interest Earned', colorClass: 'bg-semantic-up' },
  ],
  summaryItems: [
    { key: 'totalDeposits', label: 'Total Installments Paid (15 Years)' },
    { key: 'totalInterest', label: 'Total Tax-Free Interest Earned (21 Years)', class: 'text-semantic-up' },
    { key: 'totalSec80cTaxSaved', label: 'Total Section 80C Tax Saved', class: 'text-semantic-success' },
    { key: 'maturityValue', label: '100% Tax-Free Maturity Value', isTotal: true },
  ],
  inputs: [
    {
      id: 'annualDeposit',
      type: 'number',
      label: 'Annual Deposit Amount (₹)',
      min: 250,
      max: 150000,
      step: 250,
      prefix: '₹',
      minLabel: '₹250',
      maxLabel: '₹1.5L',
      default: 150000,
    },
    {
      id: 'girlChildAge',
      type: 'number',
      label: 'Current Girl Child Age (Years)',
      min: 0,
      max: 10,
      step: 1,
      minLabel: '0 (Birth)',
      maxLabel: '10 Years',
      default: 1,
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
