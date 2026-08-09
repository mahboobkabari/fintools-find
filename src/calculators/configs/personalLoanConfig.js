/**
 * Reference Configuration & Statutory Benchmark Data for Flagship Personal Loan Calculator
 */

export const PERSONAL_LOAN_CONFIG = {
  defaultInterestRate: 11.5, // Standard personal loan benchmark interest rate (11.5% p.a.)

  benchmarks: {
    processingFeeGstPct: 18.0, // Statutory 18% GST on bank processing fees
    creditCardAprDefault: 36.0, // Typical credit card revolving interest rate (36% - 42% p.a.)
    maxFoirComfortablePct: 35.0, // Safe FOIR ceiling for debt allocation
  },

  presets: [
    {
      id: 'standard_personal_loan',
      title: 'Standard Personal Loan (₹5 Lakhs)',
      description: '₹5 Lakhs personal loan at 11.5% p.a. over 3 years for general financial needs.',
      values: {
        amount: 500000,
        rate: 11.5,
        tenure: 3,
        monthlyIncome: 100000,
        processingFeePct: 1.0,
        includeInsurance: false,
        creditCardBalance: 0,
        creditCardApr: 36.0,
        marginalTaxRate: 30,
        calculationMode: 'forward',
        targetEmi: 15000,
        inflationRate: 6,
      },
    },
    {
      id: 'credit_card_consolidation',
      title: 'Credit Card Debt Consolidation (₹8 Lakhs)',
      description: 'Consolidate ₹8 Lakhs high-interest credit card debt (36% APR) into a single 12% personal loan.',
      values: {
        amount: 800000,
        rate: 12.0,
        tenure: 4,
        monthlyIncome: 150000,
        processingFeePct: 1.5,
        includeInsurance: false,
        creditCardBalance: 800000,
        creditCardApr: 36.0,
        marginalTaxRate: 30,
        calculationMode: 'forward',
        targetEmi: 20000,
        inflationRate: 6,
      },
    },
    {
      id: 'high_ticket_emergency',
      title: 'High Ticket Emergency Loan (₹15 Lakhs)',
      description: '₹15 Lakhs loan at 10.5% p.a. over 5 years for medical or family emergencies.',
      values: {
        amount: 1500000,
        rate: 10.5,
        tenure: 5,
        monthlyIncome: 200000,
        processingFeePct: 1.0,
        includeInsurance: true,
        creditCardBalance: 0,
        creditCardApr: 36.0,
        marginalTaxRate: 30,
        calculationMode: 'forward',
        targetEmi: 30000,
        inflationRate: 6,
      },
    },
    {
      id: 'target_emi_solver',
      title: 'Target EMI Solver (₹15,000/mo)',
      description: 'Solves maximum borrowing capacity for a target monthly EMI of ₹15,000.',
      values: {
        amount: 500000,
        rate: 11.5,
        tenure: 3,
        monthlyIncome: 100000,
        processingFeePct: 1.0,
        includeInsurance: false,
        creditCardBalance: 0,
        creditCardApr: 36.0,
        marginalTaxRate: 30,
        calculationMode: 'reverse_emi',
        targetEmi: 15000,
        inflationRate: 6,
      },
    },
  ],
};
