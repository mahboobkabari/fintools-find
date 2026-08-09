/**
 * Configuration & Financial Parameter Data for Flagship Loan Eligibility Calculator
 * Distinguishes statutory RBI regulatory ceilings from lender underwriting practices and illustrative assumptions.
 */

export const LOAN_ELIGIBILITY_CONFIGS = {
  loanTypes: {
    home_loan: {
      id: 'home_loan',
      name: 'Home Loan',
      category: 'loans',
      maxTenureYears: 30,
      defaultTenureYears: 20,
      defaultRatePct: 8.5,
      defaultFoirPct: 50,
      supportsLtv: true,
      ltvNote: 'RBI Circular DBR.BP.BC.No.74/21.04.048/2014-15 Statutory LTV Caps apply.',
      ltvRules: [
        { maxLoan: 3000000, maxLtvPct: 90, label: '≤ ₹30 Lakhs (Max 90% LTV)' },
        { maxLoan: 7500000, maxLtvPct: 80, label: '₹30L – ₹75L (Max 80% LTV)' },
        { maxLoan: Infinity, maxLtvPct: 75, label: '> ₹75 Lakhs (Max 75% LTV)' },
      ],
    },
    personal_loan: {
      id: 'personal_loan',
      name: 'Personal Loan (Unsecured)',
      category: 'loans',
      maxTenureYears: 5,
      defaultTenureYears: 4,
      defaultRatePct: 12.5,
      defaultFoirPct: 45,
      supportsLtv: false,
      ltvNote: 'Unsecured personal loan (No property asset backing).',
      ltvRules: [],
    },
    car_loan: {
      id: 'car_loan',
      name: 'Car / Vehicle Loan',
      category: 'loans',
      maxTenureYears: 7,
      defaultTenureYears: 5,
      defaultRatePct: 9.0,
      defaultFoirPct: 50,
      supportsLtv: true,
      ltvNote: 'Illustrative lender vehicle financing up to 85% on-road price.',
      ltvRules: [{ maxLoan: Infinity, maxLtvPct: 85, label: 'Vehicle On-Road Price (Max 85% LTV)' }],
    },
  },

  foirScenarios: [
    {
      id: 'conservative',
      name: 'Conservative FOIR',
      foirPct: 40,
      description: 'Lender assumption for lower income brackets (<₹50,000/mo) or single-income households.',
    },
    {
      id: 'standard',
      name: 'Standard FOIR',
      foirPct: 50,
      description: 'Standard retail banking benchmark for mid-to-high salaried professionals.',
    },
    {
      id: 'aggressive',
      name: 'Aggressive FOIR',
      foirPct: 60,
      description: 'Lender assumption for high-income earners (>₹1.5 Lakhs/mo) or dual-income joint loans.',
    },
  ],

  creditProfiles: {
    prime: {
      id: 'prime',
      name: 'Prime Credit Score (750+ CIBIL)',
      rateAdjustmentPct: 0.0,
      badge: 'Lowest Rate (750+)',
      description: 'Qualifies for base advertised interest rate with minimal risk markup.',
    },
    good: {
      id: 'good',
      name: 'Good Credit Score (700–749 CIBIL)',
      rateAdjustmentPct: 0.25,
      badge: '+0.25% Rate Adjustment',
      description: 'Standard credit history; mild interest rate adjustment (+0.25% p.a.).',
    },
    fair: {
      id: 'fair',
      name: 'Fair Credit Score (<700 CIBIL)',
      rateAdjustmentPct: 0.5,
      badge: '+0.50% Rate Adjustment',
      description: 'Higher credit risk profile; illustrative interest rate markup (+0.50% p.a.).',
    },
  },

  presets: [
    {
      id: 'first_home_buyer',
      title: 'First-Time Home Buyer',
      description: '₹80,000 monthly income with ₹10,000 existing EMIs seeking a 20-year Home Loan.',
      values: {
        loanType: 'home_loan',
        grossMonthlyIncome: 80000,
        coApplicantIncome: 0,
        existingEmis: 10000,
        rate: 8.5,
        tenure: 20,
        foirPct: 50,
        propertyValue: 6000000,
        creditProfile: 'prime',
        calculationMode: 'forward',
      },
    },
    {
      id: 'dual_income_joint',
      title: 'Dual-Income Joint Home Loan',
      description: '₹1.2L primary + ₹60,000 co-applicant income maximizing borrowing power for a 25-year loan.',
      values: {
        loanType: 'home_loan',
        grossMonthlyIncome: 120000,
        coApplicantIncome: 60000,
        existingEmis: 15000,
        rate: 8.5,
        tenure: 25,
        foirPct: 50,
        propertyValue: 12000000,
        creditProfile: 'prime',
        calculationMode: 'forward',
      },
    },
    {
      id: 'personal_loan_salaried',
      title: 'Salaried Executive Personal Loan',
      description: '₹1.5 Lakh monthly salary evaluating 4-year unsecured personal loan eligibility.',
      values: {
        loanType: 'personal_loan',
        grossMonthlyIncome: 150000,
        coApplicantIncome: 0,
        existingEmis: 20000,
        rate: 12.5,
        tenure: 4,
        foirPct: 45,
        propertyValue: 0,
        creditProfile: 'prime',
        calculationMode: 'forward',
      },
    },
    {
      id: 'target_75L_home_loan',
      title: 'Required Income for ₹75L Home Loan',
      description: 'Reverse solver calculating gross income required for a target ₹75 Lakh home loan.',
      values: {
        loanType: 'home_loan',
        targetLoanAmount: 7500000,
        existingEmis: 15000,
        rate: 8.5,
        tenure: 20,
        foirPct: 50,
        calculationMode: 'reverse_income',
      },
    },
  ],
};
