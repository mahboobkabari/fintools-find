import { calculateLoan } from '../core/loanEngine.js';

/**
 * Flagship Personal Borrowing Decision Engine (Math Engine V2)
 * 
 * @param {Object} inputs
 * @param {number} inputs.amount - Borrowed personal loan amount (₹)
 * @param {number} inputs.rate - Annual interest rate (p.a.)
 * @param {number} inputs.tenure - Loan tenure in years
 * @param {number} [inputs.monthlyIncome=100000] - Net monthly salary income (₹)
 * @param {number} [inputs.processingFeePct=1] - Processing fee percentage
 * @param {boolean} [inputs.includeInsurance=false] - Whether optional credit insurance is added
 */
export function calculatePersonalLoan(inputs = {}) {
  const {
    amount = 500000,
    rate = 11.5,
    tenure = 3,
    monthlyIncome = 100000,
    processingFeePct = 1,
    includeInsurance = false,
  } = inputs;

  const loanAmount = Math.max(0, Number(amount) || 0);
  const feePct = Math.max(0, Number(processingFeePct) || 0);
  const processingFee = Math.round((loanAmount * feePct) / 100);
  const insuranceFee = includeInsurance ? Math.round(loanAmount * 0.015) : 0;

  const loanResult = calculateLoan({
    amount: loanAmount,
    rate: Number(rate) || 0,
    tenure: Number(tenure) || 1,
    tenureType: 'years',
  });

  const emi = loanResult.emi;
  const totalInterest = loanResult.totalInterest;
  const totalRepayment = loanResult.totalPayment + processingFee + insuranceFee;

  // 1. Human-Friendly Interest Burden Ratio ("For every ₹100 borrowed, you repay ₹X")
  const repayPer100 = Math.round(((loanAmount + totalInterest + processingFee + insuranceFee) / (loanAmount || 1)) * 100);

  // 2. Monthly Budget Impact
  const income = Math.max(1, Number(monthlyIncome) || 100000);
  const foirPct = Math.round((emi / income) * 100);
  const remainingIncome = Math.max(0, income - emi);

  // 3. Borrowing Health Score (0 - 100)
  let healthScore = 100;
  if (foirPct > 20) healthScore -= (foirPct - 20) * 1.5;
  if (totalInterest > loanAmount * 0.4) healthScore -= 15;
  if (tenure > 5) healthScore -= 10;
  healthScore = Math.max(10, Math.min(100, Math.round(healthScore)));

  let healthStatus = 'Excellent';
  let healthColor = 'text-semantic-success';
  let healthDesc = 'Your loan payment uses less than 20% of your monthly income. Highly comfortable!';

  if (healthScore >= 60 && healthScore < 80) {
    healthStatus = 'Good';
    healthColor = 'text-accent-sky';
    healthDesc = 'Reasonable debt commitment. Maintain emergency savings balance.';
  } else if (healthScore >= 40 && healthScore < 60) {
    healthStatus = 'Caution';
    healthColor = 'text-accent-amber';
    healthDesc = 'Your monthly loan payment uses over 35% of your income. Keep extra expenses light.';
  } else if (healthScore < 40) {
    healthStatus = 'High Risk';
    healthColor = 'text-semantic-danger';
    healthDesc = 'Your monthly payment uses almost half of your income. High budget risk!';
  }

  // 4. Debt Trap Warning Criteria
  const isHighInterestBurden = totalInterest > loanAmount * 0.6;
  const isHighFoir = foirPct > 40;
  const isHighTenure = tenure >= 6;
  const isDebtTrapRisk = isHighInterestBurden || isHighFoir || isHighTenure;

  // 5. Borrow Less Simulator (-₹50K, -₹1L, -₹2L, -₹5L)
  const borrowLessScenarios = [50000, 100000, 200000, 500000]
    .filter((delta) => loanAmount - delta >= 50000)
    .map((delta) => {
      const newAmt = loanAmount - delta;
      const newRes = calculateLoan({ amount: newAmt, rate, tenure, tenureType: 'years' });
      return {
        delta,
        newAmt,
        newEmi: newRes.emi,
        emiSaved: emi - newRes.emi,
        interestSaved: totalInterest - newRes.totalInterest,
      };
    });

  // 6. Prepayment Coach (1 Extra EMI/yr, ₹25K lump sum, ₹50K lump sum)
  const extraEmiInterestSaved = Math.round(totalInterest * 0.22);
  const lumpSum25kSaved = Math.round(totalInterest * 0.12);
  const lumpSum50kSaved = Math.round(totalInterest * 0.24);

  // 7. Interest Rate Sensitivity (-0.5% and -1.0%)
  const rateLower05 = calculateLoan({ amount: loanAmount, rate: rate - 0.5, tenure, tenureType: 'years' });
  const rateLower10 = calculateLoan({ amount: loanAmount, rate: rate - 1.0, tenure, tenureType: 'years' });

  const savingsRate05 = totalInterest - rateLower05.totalInterest;
  const savingsRate10 = totalInterest - rateLower10.totalInterest;

  // 8. Smart Ranked Recommendations
  const defaultLess = borrowLessScenarios.find((s) => s.delta === 100000) || borrowLessScenarios[0];
  const recommendations = [
    {
      rank: 1,
      title: `Borrow ${defaultLess ? `₹${(defaultLess.delta / 100000).toFixed(1)} Lakh` : 'Less'}`,
      savings: defaultLess ? defaultLess.interestSaved : 30000,
      action: defaultLess
        ? `Lowers EMI by ₹${defaultLess.emiSaved.toLocaleString('en-IN')}/mo and saves ₹${defaultLess.interestSaved.toLocaleString('en-IN')} interest.`
        : 'Borrowing less reduces total interest charges.',
    },
    {
      rank: 2,
      title: 'Pay 1 Extra EMI Every Year',
      savings: extraEmiInterestSaved,
      action: `Reduces total tenure and saves approximately ₹${extraEmiInterestSaved.toLocaleString('en-IN')} in total interest.`,
    },
    {
      rank: 3,
      title: 'Improve Credit Score before Applying',
      savings: savingsRate10,
      action: `Negotiating a 1.0% lower interest rate saves ₹${savingsRate10.toLocaleString('en-IN')}.`,
    },
  ].sort((a, b) => b.savings - a.savings);

  // 9. Hero Decision Text
  const heroText = defaultLess
    ? `Reducing your loan by ₹${(defaultLess.delta / 100000).toFixed(1)} Lakh lowers your EMI by ₹${defaultLess.emiSaved.toLocaleString('en-IN')}/mo and saves ₹${defaultLess.interestSaved.toLocaleString('en-IN')} in interest.`
    : `Your EMI is ${formatCurrency(emi)} per month, consuming ${foirPct}% of your monthly income.`;

  return {
    loanAmount,
    rate,
    tenure,
    emi,
    totalInterest,
    processingFee,
    insuranceFee,
    totalRepayment,
    repayPer100,
    foirPct,
    remainingIncome,
    healthScore,
    healthStatus,
    healthColor,
    healthDesc,
    isDebtTrapRisk,
    borrowLessScenarios,
    prepaymentCoach: {
      extraEmiInterestSaved,
      lumpSum25kSaved,
      lumpSum50kSaved,
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