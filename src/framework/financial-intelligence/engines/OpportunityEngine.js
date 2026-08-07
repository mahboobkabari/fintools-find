import { createOpportunityContract } from '../contracts/index.js';

export function processOpportunities(normalizedData, customData = {}) {
  const oppList = customData.opportunities || customData.rankedOpportunities || [];
  if (oppList.length > 0) {
    return oppList.map((opp, idx) =>
      createOpportunityContract({
        id: opp.id || `opportunity-${idx}`,
        rank: opp.rank || idx + 1,
        title: opp.title || '',
        estimatedSavings: opp.estimatedSavings || opp.savings || 0,
        impactText: opp.impactText || opp.desc || '',
        description: opp.description || opp.desc || '',
        priority: idx + 1,
      })
    );
  }

  return [
    createOpportunityContract({
      id: 'opportunity-default',
      rank: 1,
      title: 'Optimize Asset Allocation',
      estimatedSavings: 50000,
      impactText: 'Unlocks compounding growth',
      description: 'Rebalance portfolio to align with risk tolerance and compounding goals.',
    }),
  ];
}
