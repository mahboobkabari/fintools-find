import { createRecommendationContract } from '../contracts/index.js';

export function processRecommendations(normalizedData, customData = {}) {
  if (customData.recommendationCard) {
    return createRecommendationContract(customData.recommendationCard);
  }

  const opps = customData.opportunities || [];
  const metrics = opps.slice(0, 3).map((opp) => ({
    label: opp.title,
    value: opp.impactText || `Save ₹${Math.round(opp.estimatedSavings || 0).toLocaleString('en-IN')}`,
    labelColor: 'text-emerald-300',
  }));

  return createRecommendationContract({
    id: 'rec-default',
    tagLine: 'Smart Recommendations',
    badgeText: 'Highest Impact First',
    title: 'Actionable Steps to Maximize Wealth',
    description: 'Prioritized steps based on algorithmic financial evaluation:',
    metrics,
  });
}
