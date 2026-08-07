export function adaptRetirementCorpusCalculator(inputs, results) {
  return {
    heroBanner: results.heroBanner || {
      heroTitle: `Required Target Corpus: ₹${Math.round(results.requiredCorpus || 0).toLocaleString('en-IN')}`,
      heroSubtitle: `Projected savings: ₹${Math.round(results.projectedCorpus || 0).toLocaleString('en-IN')}`,
    },
    readinessScore: results.readinessScore ?? 80,
    readinessStatus: results.readinessStatus || {
      level: 'Good Progress',
      color: '#10B981',
      badge: 'On Track',
      desc: 'Projected corpus meets major goals.',
    },
    healthSubscores: results.healthSubscores || {},
    longevity: results.longevity || {},
    opportunities: results.opportunities || [],
    insights: results.insights || [],
  };
}
