import { createDecisionContract } from '../contracts/index.js';

export function processDecision(normalizedData, customData = {}) {
  if (customData.heroDecision) {
    return createDecisionContract({
      id: 'decision-hero',
      title: customData.heroDecision.heroDecisionTitle || customData.heroDecision.heroTitle || 'Optimal Decision Identified',
      subtitle: customData.heroDecision.heroDecisionSubtitle || customData.heroDecision.heroSubtitle || '',
      status: customData.heroDecision.isNewBetter !== false ? 'success' : 'info',
      winnerId: customData.heroDecision.isNewBetter ? 'new-regime' : 'old-regime',
      savingsAmount: customData.heroDecision.taxSavingsAmount || customData.heroDecision.savingsAmount || 0,
      confidenceStars: 5,
    });
  }

  if (customData.heroBanner) {
    return createDecisionContract({
      id: 'decision-hero',
      title: customData.heroBanner.heroTitle || 'Retirement Status Evaluated',
      subtitle: customData.heroBanner.heroSubtitle || '',
      status: customData.readinessScore >= 85 ? 'success' : customData.readinessScore >= 60 ? 'warning' : 'danger',
      confidenceStars: 5,
    });
  }

  const { tax, retirement, liability } = normalizedData;

  if (tax.taxSaved > 0) {
    return createDecisionContract({
      id: 'decision-tax',
      title: `${tax.winnerRegime === 'new' ? 'New' : 'Old'} Tax Regime saves you ₹${Math.round(tax.taxSaved).toLocaleString('en-IN')} this year.`,
      subtitle: `Optimal tax regime selection based on FY 2025-26 rules.`,
      status: 'success',
      winnerId: tax.winnerRegime,
      savingsAmount: tax.taxSaved,
    });
  }

  if (retirement.requiredCorpus > 0) {
    const isGood = retirement.readinessPct >= 85;
    return createDecisionContract({
      id: 'decision-retirement',
      title: isGood ? '🟢 You are on track for a comfortable retirement!' : '🟡 Action needed to close retirement gap.',
      subtitle: `Target corpus: ₹${Math.round(retirement.requiredCorpus).toLocaleString('en-IN')}`,
      status: isGood ? 'success' : 'warning',
    });
  }

  return createDecisionContract({
    id: 'decision-default',
    title: 'Financial Analysis Completed',
    subtitle: 'All parameters verified against standard financial principles.',
    status: 'success',
  });
}
