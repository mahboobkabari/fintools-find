export function adaptSIPCalculator(inputs, results) {
  return {
    heroDecision: {
      heroTitle: `Projected Wealth: ₹${Math.round(results.futureValue || 0).toLocaleString('en-IN')}`,
      heroSubtitle: `Your total investment of ₹${Math.round(results.totalInvestment || 0).toLocaleString('en-IN')} generates ₹${Math.round(results.wealthGained || 0).toLocaleString('en-IN')} in wealth gains.`,
      isNewBetter: true,
    },
    opportunities: [
      {
        id: 'step-up-sip',
        rank: 1,
        title: 'Step Up SIP by 10% Annually',
        estimatedSavings: Math.round((results.futureValue || 0) * 0.4),
        impactText: 'Doubles final accumulated corpus',
        description: 'Increasing your monthly SIP in tandem with annual salary increments exponentially accelerates wealth growth.',
      },
    ],
  };
}
