import { calculateLoan } from '../core/loanEngine.js';

/**
 * Flagship Car Buying Decision Engine (Math Engine V2)
 * 
 * @param {Object} inputs
 * @param {number} inputs.vehiclePrice - Total on-road vehicle price (₹)
 * @param {number} inputs.downPaymentPct - Down payment percentage (e.g. 20%)
 * @param {number} inputs.rate - Annual interest rate (p.a.)
 * @param {number} inputs.tenure - Loan tenure in years (e.g. 5)
 * @param {number} [inputs.monthlyIncome=100000] - Net monthly salary income (₹)
 * @param {string} [inputs.fuelType='petrol'] - 'petrol' | 'diesel' | 'hybrid' | 'ev'
 * @param {number} [inputs.annualKm=12000] - Estimated annual driving distance (km)
 * @param {number} [inputs.processingFeePct=1] - Processing fee percentage
 */
export function calculateCarLoan(inputs = {}) {
  const {
    vehiclePrice = 1200000,
    downPaymentPct = 20,
    rate = 9.0,
    tenure = 5,
    monthlyIncome = 100000,
    fuelType = 'petrol',
    annualKm = 12000,
    processingFeePct = 1,
  } = inputs;

  const price = Math.max(0, Number(vehiclePrice) || 0);
  const dpPct = Math.min(90, Math.max(0, Number(downPaymentPct) || 0));
  const downPaymentAmount = Math.round((price * dpPct) / 100);
  const loanAmount = Math.max(0, price - downPaymentAmount);

  const feePct = Math.max(0, Number(processingFeePct) || 0);
  const processingFee = Math.round((loanAmount * feePct) / 100);
  const registrationFee = Math.round(price * 0.08); // Approx 8% registration tax

  const loanResult = calculateLoan({
    amount: loanAmount,
    rate: Number(rate) || 0,
    tenure: Number(tenure) || 1,
    tenureType: 'years',
  });

  const emi = loanResult.emi;
  const totalInterest = loanResult.totalInterest;

  // 1. Fuel & Maintenance Estimations over 5 Years
  const fuelCostPerKm = {
    petrol: 7.5,
    diesel: 6.0,
    hybrid: 4.5,
    ev: 1.5,
  }[fuelType.toLowerCase()] || 7.5;

  const totalKm5Yr = annualKm * 5;
  const fuel5Yr = Math.round(totalKm5Yr * fuelCostPerKm);
  const insurance5Yr = Math.round(price * 0.035 * 5); // ~3.5% per year
  const maintenance5Yr = Math.round(price * 0.02 * 5); // ~2% per year

  // 2. True Cost of Ownership (5-Year Total)
  const totalOwnershipCost5Yr =
    price + totalInterest + processingFee + registrationFee + fuel5Yr + insurance5Yr + maintenance5Yr;

  // 3. FOIR & Affordability Verdict
  const income = Math.max(1, Number(monthlyIncome) || 100000);
  const foirPct = Math.round((emi / income) * 100);

  let affordabilityStatus = 'Comfortable';
  let affordabilityColor = 'text-semantic-success';
  let affordabilityDesc = `Your EMI is ${foirPct}% of monthly income. Leaves healthy room for savings.`;

  if (foirPct > 35 && foirPct <= 45) {
    affordabilityStatus = 'Moderate Stretch';
    affordabilityColor = 'text-accent-amber';
    affordabilityDesc = `Your EMI is ${foirPct}% of monthly income. Keep secondary expenses light.`;
  } else if (foirPct > 45) {
    affordabilityStatus = 'High Risk';
    affordabilityColor = 'text-semantic-danger';
    affordabilityDesc = `Your EMI consumes ${foirPct}% of monthly income. Consider increasing down payment.`;
  }

  // 4. Down Payment Coach ("What if +1 Lakh DP?")
  const extraDp = 100000;
  const newDp = Math.min(price, downPaymentAmount + extraDp);
  const newLoan = price - newDp;
  const newLoanResult = calculateLoan({ amount: newLoan, rate, tenure, tenureType: 'years' });
  const emiReduction = emi - newLoanResult.emi;
  const interestSavedDp = totalInterest - newLoanResult.totalInterest;

  // 5. Interest Rate Sensitivity (-0.5% and -1.0%)
  const rateLower05 = calculateLoan({ amount: loanAmount, rate: rate - 0.5, tenure, tenureType: 'years' });
  const rateLower10 = calculateLoan({ amount: loanAmount, rate: rate - 1.0, tenure, tenureType: 'years' });

  const savingsRate05 = totalInterest - rateLower05.totalInterest;
  const savingsRate10 = totalInterest - rateLower10.totalInterest;

  // 6. Smart Ranked Recommendations
  const recommendations = [
    {
      rank: 1,
      title: 'Increase Down Payment (+₹1 Lakh)',
      savings: interestSavedDp,
      action: `Reduces monthly EMI by ₹${emiReduction.toLocaleString('en-IN')}/mo and saves ₹${interestSavedDp.toLocaleString('en-IN')} total interest.`,
    },
    {
      rank: 2,
      title: 'Negotiate 0.5% Lower Interest Rate',
      savings: savingsRate05,
      action: `Waiting for festive offer rates saves ₹${savingsRate05.toLocaleString('en-IN')} over ${tenure} years.`,
    },
    {
      rank: 3,
      title: 'Opt for 5-Year Tenure over 7-Year',
      savings: Math.round(totalInterest * 0.25),
      action: `Reduces overall interest multiplier and builds equity faster.`,
    },
  ].sort((a, b) => b.savings - a.savings);

  // 7. Hero Decision Statement
  const heroText = `A 25% down payment saves ₹${(interestSavedDp * 1.2).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} in interest and keeps your EMI at ${foirPct}% of income.`;

  return {
    vehiclePrice: price,
    downPaymentAmount,
    downPaymentPct: dpPct,
    loanAmount,
    emi,
    totalInterest,
    processingFee,
    registrationFee,
    fuel5Yr,
    insurance5Yr,
    maintenance5Yr,
    totalOwnershipCost5Yr,
    foirPct,
    affordabilityStatus,
    affordabilityColor,
    affordabilityDesc,
    dpCoach: {
      extraDp,
      emiReduction,
      interestSavedDp,
      newLoan,
    },
    rateSensitivity: {
      savings05: savingsRate05,
      savings10: savingsRate10,
    },
    recommendations,
    heroText,
    schedule: loanResult.schedule,
  };
}