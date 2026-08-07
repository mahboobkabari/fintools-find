export function adaptHomeLoanCalculator(inputs, results) {
  return {
    heroDecision: {
      heroTitle: `Home Loan Monthly EMI: ₹${Math.round(results.monthlyEmi || 0).toLocaleString('en-IN')}`,
      heroSubtitle: `Total interest outgo over loan tenure: ₹${Math.round(results.totalInterestPayable || 0).toLocaleString('en-IN')}.`,
      isNewBetter: true,
    },
    opportunities: [
      {
        id: 'increase-downpayment',
        rank: 1,
        title: 'Increase Down Payment by 5%',
        estimatedSavings: Math.round((results.totalInterestPayable || 0) * 0.15),
        impactText: 'Saves substantial interest outgo',
        description: 'Paying a higher down payment lowers loan principal and interest burden throughout loan life.',
      },
    ],
  };
}
