/**
 * Reference Configuration & Regulatory Data for Flagship Provident Fund (EPF & VPF) Calculator
 * Distinguishes statutory EPFO rules from Section 10(11) Income Tax Act thresholds and declared interest assumptions.
 */

export const PROVIDENT_FUND_CONFIG = {
  epfoInterestRate: 8.25, // Declared EPFO interest rate (% p.a.)
  metadata: {
    financialYear: 'FY 2025-26',
    ratePct: 8.25,
    authority: 'Employees\' Provident Fund Organisation (EPFO) Central Board of Trustees',
    isAssumption: true,
    description: 'Declared EPFO annual interest rate credited on monthly accumulated balance.',
  },

  statutoryRules: {
    employeeEpfPct: 12.0, // Standard employee EPF contribution % of Basic + DA
    employerEpfTotalPct: 12.0, // Standard employer total contribution %
    epsMaxWageCap: 15000, // Maximum basic wage ceiling for EPS pension allocation (₹15,000/mo)
    epsPct: 8.33, // Percentage allocated to Employees' Pension Scheme (EPS)
    maxEpsMonthlyAmount: 1250, // Max monthly EPS contribution (₹15,000 * 8.33% = ₹1,250/mo)
    sec10_11_tax_threshold: 250000, // Section 10(11) annual employee contribution tax threshold (₹2.5 Lakhs/yr)
    standardRetirementAge: 58,
  },

  presets: [
    {
      id: 'standard_epf_12',
      title: 'Standard EPF (12% Only)',
      description: '₹50,000 monthly basic salary with standard 12% EPF contribution from age 25 to 58.',
      values: {
        monthlyBasicSalary: 50000,
        monthlyDa: 0,
        currentAge: 25,
        retirementAge: 58,
        epfInterestRate: 8.25,
        annualSalaryIncrease: 5,
        currentEpfBalance: 0,
        vpfContributionType: 'percentage',
        vpfValue: 0,
        calculationMode: 'forward',
        inflationRate: 6,
      },
    },
    {
      id: 'vpf_booster_10',
      title: 'VPF Wealth Booster (+10% VPF)',
      description: 'Standard EPF plus an additional 10% Voluntary Provident Fund (VPF) contribution.',
      values: {
        monthlyBasicSalary: 50000,
        monthlyDa: 0,
        currentAge: 25,
        retirementAge: 58,
        epfInterestRate: 8.25,
        annualSalaryIncrease: 5,
        currentEpfBalance: 0,
        vpfContributionType: 'percentage',
        vpfValue: 10,
        calculationMode: 'forward',
        inflationRate: 6,
      },
    },
    {
      id: 'high_salary_tax_alert',
      title: 'High Basic Section 10(11) Tax Alert',
      description: '₹2.0 Lakh monthly basic salary triggering Section 10(11) ₹2.5 Lakh tax threshold.',
      values: {
        monthlyBasicSalary: 200000,
        monthlyDa: 0,
        currentAge: 30,
        retirementAge: 58,
        epfInterestRate: 8.25,
        annualSalaryIncrease: 7,
        currentEpfBalance: 500000,
        vpfContributionType: 'percentage',
        vpfValue: 0,
        calculationMode: 'forward',
        inflationRate: 6,
      },
    },
    {
      id: 'target_vpf_goal',
      title: 'Target Additional VPF Goal',
      description: 'Reverse solver calculating monthly VPF required for ₹1 Crore additional VPF corpus.',
      values: {
        monthlyBasicSalary: 60000,
        monthlyDa: 0,
        currentAge: 30,
        retirementAge: 58,
        epfInterestRate: 8.25,
        annualSalaryIncrease: 5,
        currentEpfBalance: 200000,
        vpfContributionType: 'percentage',
        calculationMode: 'reverse_vpf',
        targetVpfCorpus: 10000000,
        inflationRate: 6,
      },
    },
  ],
};
