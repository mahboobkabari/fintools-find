export function adaptIncomeTaxCalculator(inputs, results) {
  return {
    heroDecision: results.heroDecision || {
      heroDecisionTitle: `Tax Payable: ₹${Math.round(results.winner?.totalTax || 0).toLocaleString('en-IN')}`,
      heroDecisionSubtitle: `Optimal regime: ${results.winner?.regime?.toUpperCase() || 'NEW'} REGIME`,
      isNewBetter: results.winner?.regime === 'new',
      taxSavingsAmount: results.heroDecision?.taxSavingsAmount || 0,
    },
    taxScore: results.taxScore || {
      score: 85,
      reasons: ['Standard deduction utilized.'],
    },
    opportunities: results.opportunities || [],
    insights: results.insights || [],
  };
}
