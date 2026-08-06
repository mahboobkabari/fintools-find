/**
 * Loan Eligibility Calculator Math Engine
 * Uses FOIR (Fixed Obligation to Income Ratio) model standard across retail banking.
 *
 * @param {Object} inputs
 * @param {number} inputs.grossMonthlyIncome - Gross monthly take-home income
 * @param {number} inputs.existingEmis - Current existing monthly EMI obligations
 * @param {number} inputs.rate - Expected annual interest rate (p.a.)
 * @param {number} inputs.tenure - Intended loan tenure
 * @param {string} [inputs.tenureType='years'] - 'years' or 'months'
 * @param {number} [inputs.foirPct=50] - Bank FOIR percentage limit (default 50%)
 */
export function calculateLoanEligibility(inputs = {}) {
  const {
    grossMonthlyIncome = 100000,
    existingEmis = 10000,
    rate = 8.5,
    tenure = 20,
    tenureType = 'years',
    foirPct = 50,
  } = inputs;

  const income = Math.max(0, Number(grossMonthlyIncome) || 0);
  const currentEmis = Math.max(0, Number(existingEmis) || 0);
  const foir = Math.min(80, Math.max(10, Number(foirPct) || 50)) / 100;
  const annualRate = Math.max(0, Number(rate) || 0);
  const tenureYears = tenureType === 'months' ? Number(tenure) / 12 : Number(tenure) || 1;
  const totalMonths = Math.max(1, Math.round(tenureYears * 12));

  // Max total EMI allowed by bank
  const maxTotalEmiAllowed = Math.round(income * foir);

  // Available monthly EMI capacity
  const maxAvailableEmi = Math.max(0, maxTotalEmiAllowed - currentEmis);

  if (maxAvailableEmi <= 0 || annualRate <= 0) {
    return {
      maxLoanAmount: 0,
      maxEmiCapacity: maxAvailableEmi,
      maxTotalEmiAllowed,
      totalInterest: 0,
      totalPayment: 0,
    };
  }

  // Reverse PMT: Calculate Maximum Loan Amount (PV) from Max Available EMI
  const monthlyRate = annualRate / 12 / 100;
  const pvFactor = (Math.pow(1 + monthlyRate, totalMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
  const maxLoanAmount = Math.round(maxAvailableEmi * pvFactor);

  const totalPayment = maxAvailableEmi * totalMonths;
  const totalInterest = totalPayment - maxLoanAmount;

  return {
    maxLoanAmount,
    maxEmiCapacity: maxAvailableEmi,
    maxTotalEmiAllowed,
    totalInterest,
    totalPayment,
  };
}