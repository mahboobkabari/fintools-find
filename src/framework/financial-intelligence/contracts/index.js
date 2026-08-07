/**
 * Standardized Financial Decision Platform Data Contracts
 */

export function createBaseContract(type, props = {}) {
  return {
    type,
    id: props.id || `${type}-${Math.random().toString(36).substring(2, 9)}`,
    title: props.title || '',
    description: props.description || '',
    priority: props.priority ?? 1,
    severity: props.severity || 'info', // 'info' | 'success' | 'warning' | 'danger'
    icon: props.icon || '💡',
    colorToken: props.colorToken || 'primary',
    category: props.category || 'general',
    metadata: props.metadata || {},
  };
}

export function createDecisionContract(props = {}) {
  return {
    ...createBaseContract('decision', props),
    status: props.status || 'success', // 'success' | 'warning' | 'danger' | 'info'
    winnerId: props.winnerId || null,
    savingsAmount: Number(props.savingsAmount) || 0,
    confidenceStars: Number(props.confidenceStars) || 5,
    actionText: props.actionText || '',
  };
}

export function createScoreContract(props = {}) {
  return {
    ...createBaseContract('score', props),
    score: Math.min(100, Math.max(0, Number(props.score) || 0)),
    level: props.level || 'Good',
    badge: props.badge || 'On Track',
    subscores: props.subscores || {},
    reasons: props.reasons || [],
  };
}

export function createOpportunityContract(props = {}) {
  return {
    ...createBaseContract('opportunity', props),
    rank: Number(props.rank) || 1,
    estimatedSavings: Number(props.estimatedSavings) || 0,
    impactText: props.impactText || '',
  };
}

export function createWarningContract(props = {}) {
  return {
    ...createBaseContract('warning', props),
    level: props.level || 'warning',
    message: props.message || props.description || '',
    actionText: props.actionText || '',
  };
}

export function createRecommendationContract(props = {}) {
  return {
    ...createBaseContract('recommendation', props),
    tagLine: props.tagLine || 'Smart Advice',
    badgeText: props.badgeText || 'Contextual',
    metrics: props.metrics || [],
  };
}

export function createInsightContract(props = {}) {
  return {
    ...createBaseContract('insight', props),
    label: props.label || props.title || '',
    value: props.value || '',
    labelColor: props.labelColor || 'text-primary',
    valueColor: props.valueColor || 'text-primary',
    desc: props.desc || props.description || '',
  };
}

export function createConfidenceContract(props = {}) {
  return {
    ...createBaseContract('confidence', props),
    ratingStars: Number(props.ratingStars) || 5,
    confidencePct: Number(props.confidencePct) || 100,
    verifiedBasisText: props.verifiedBasisText || 'Verified via Financial Standards',
    disclaimer: props.disclaimer || '',
  };
}

export function createScenarioContract(props = {}) {
  return {
    ...createBaseContract('scenario', props),
    scenarioA: props.scenarioA || {},
    scenarioB: props.scenarioB || {},
    highlights: props.highlights || [],
    recommendationText: props.recommendationText || '',
  };
}

export function createNarrativeContract(props = {}) {
  return {
    ...createBaseContract('narrative', props),
    headline: props.headline || '',
    takeaway: props.takeaway || '',
    bulletPoints: props.bulletPoints || [],
  };
}
