import { createNarrativeContract } from '../contracts/index.js';

export function processNarrative(normalizedData, customData = {}) {
  const headline = customData.heroDecision?.heroDecisionTitle ||
    customData.heroBanner?.heroTitle ||
    'Financial Intelligence Summary';

  const takeaway = customData.heroDecision?.heroDecisionSubtitle ||
    customData.heroBanner?.heroSubtitle ||
    'Your financial calculation has been successfully processed.';

  return createNarrativeContract({
    id: 'narrative-main',
    headline,
    takeaway,
    bulletPoints: (customData.taxScore?.reasons || customData.readinessStatus?.desc) ? [customData.readinessStatus?.desc || customData.taxScore?.reasons?.[0]] : [],
  });
}
