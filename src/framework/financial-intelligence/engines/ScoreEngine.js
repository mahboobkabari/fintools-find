import { createScoreContract } from '../contracts/index.js';

export function processScore(normalizedData, customData = {}) {
  if (customData.taxScore) {
    return createScoreContract({
      id: 'score-tax',
      title: 'Tax Optimization Score',
      score: customData.taxScore.score ?? 80,
      level: customData.taxScore.score >= 80 ? 'Highly Optimized' : 'Moderate',
      badge: customData.taxScore.score >= 80 ? 'Optimized' : 'Gaps Available',
      color: customData.taxScore.score >= 80 ? '#10B981' : '#F59E0B',
      reasons: customData.taxScore.reasons || [],
    });
  }

  if (customData.readinessStatus && customData.readinessScore !== undefined) {
    return createScoreContract({
      id: 'score-readiness',
      title: 'Retirement Readiness Score',
      score: customData.readinessScore,
      level: customData.readinessStatus.level || 'Good Progress',
      badge: customData.readinessStatus.badge || 'On Track',
      color: customData.readinessStatus.color || '#10B981',
      subscores: customData.healthSubscores || {},
      reasons: [customData.readinessStatus.desc || ''],
    });
  }

  const foir = normalizedData.risk.foirPct;
  if (foir > 0) {
    const scoreVal = Math.max(0, Math.min(100, Math.round(100 - foir)));
    return createScoreContract({
      id: 'score-foir',
      title: 'Debt Affordability Score',
      score: scoreVal,
      level: foir <= 35 ? 'Healthy Debt' : foir <= 50 ? 'Moderate Debt' : 'High Debt Risk',
      badge: foir <= 35 ? 'Safe FOIR' : 'High FOIR',
      color: foir <= 35 ? '#10B981' : foir <= 50 ? '#F59E0B' : '#EF4444',
      reasons: [`Fixed Monthly Debt Obligation is ${foir}% of monthly income.`],
    });
  }

  return createScoreContract({
    id: 'score-default',
    title: 'Financial Health Score',
    score: 90,
    level: 'Excellent',
    badge: 'Verified',
    color: '#10B981',
  });
}
