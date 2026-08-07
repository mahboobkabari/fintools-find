export function adaptEMICalculator(inputs, results) {
  return {
    heroDecision: {
      heroTitle: `Monthly EMI: ₹${Math.round(results.emi || results.monthlyEmi || 0).toLocaleString('en-IN')}`,
      heroSubtitle: `1 Extra EMI per year saves ₹${Math.round((results.totalInterestPayable || 0) * 0.2).toLocaleString('en-IN')} in interest.`,
      isNewBetter: true,
    },
    opportunities: [
      {
        id: 'extra-emi',
        rank: 1,
        title: 'Pay 1 Extra EMI per Year',
        estimatedSavings: Math.round((results.totalInterestPayable || 0) * 0.2),
        impactText: 'Reduces loan tenure significantly',
        description: 'Making one extra loan payment annually shortens loan duration and slashes overall interest outgo.',
      },
    ],
  };
}
