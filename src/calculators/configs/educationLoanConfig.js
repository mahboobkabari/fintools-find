/**
 * Reference Configuration & Regulatory Data for Flagship Education Loan Calculator
 * Distinguishes statutory Section 80E Income Tax rules from RBI model education loan scheme conventions.
 */

export const EDUCATION_LOAN_CONFIG = {
  defaultInterestRate: 9.5, // Standard education loan rate (% p.a.)

  statutoryRules: {
    sec80E_maxYears: 8, // Maximum consecutive financial years eligible for Section 80E deduction
    sec80E_maxCap: Infinity, // 100% uncapped deduction for interest paid
    sec80E_taxRegime: 'Old Tax Regime (u/s 80E)',
    rbi_marginMoney: {
      upTo4Lakhs: 0, // 0% margin up to ₹4 Lakhs
      above4LakhsDomestic: 5, // 5% margin for domestic >₹4L
      above4LakhsAbroad: 15, // 15% margin for abroad >₹4L
    },
  },

  presets: [
    {
      id: 'domestic_btech_10l',
      title: 'Domestic B.Tech (₹10 Lakhs)',
      description: '4-Year engineering degree + 1-year moratorium at 9.5% p.a. with 10-year repayment.',
      values: {
        amount: 1000000,
        rate: 9.5,
        tenure: 10,
        tenureType: 'years',
        moratoriumYears: 5,
        payInterestDuringMoratorium: false,
        marginalTaxRate: 30,
        calculationMode: 'forward',
        inflationRate: 6,
      },
    },
    {
      id: 'abroad_masters_25l',
      title: 'Abroad MS / STEM (₹25 Lakhs)',
      description: '2-Year US/UK Masters + 1-year grace period at 10.5% p.a. with 10-year repayment.',
      values: {
        amount: 2500000,
        rate: 10.5,
        tenure: 10,
        tenureType: 'years',
        moratoriumYears: 3,
        payInterestDuringMoratorium: false,
        marginalTaxRate: 30,
        calculationMode: 'forward',
        inflationRate: 6,
      },
    },
    {
      id: 'top_mba_20l',
      title: 'Top IIM / MBA (₹20 Lakhs)',
      description: '2-Year MBA + 0.5-year grace period at 8.5% p.a. with 7-year fast-track repayment.',
      values: {
        amount: 2000000,
        rate: 8.5,
        tenure: 7,
        tenureType: 'years',
        moratoriumYears: 2.5,
        payInterestDuringMoratorium: true, // Pay interest monthly during study
        marginalTaxRate: 30,
        calculationMode: 'forward',
        inflationRate: 6,
      },
    },
    {
      id: 'target_emi_solver',
      title: 'Target EMI Solver (₹20,000/mo)',
      description: 'Reverse solver calculating maximum affordable loan for a ₹20,000/mo EMI target.',
      values: {
        amount: 1500000,
        rate: 9.5,
        tenure: 10,
        tenureType: 'years',
        moratoriumYears: 4,
        payInterestDuringMoratorium: false,
        marginalTaxRate: 30,
        calculationMode: 'reverse_emi',
        targetEmi: 20000,
        inflationRate: 6,
      },
    },
  ],
};
