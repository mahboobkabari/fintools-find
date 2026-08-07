import { createConfidenceContract } from '../contracts/index.js';

export function processConfidence(normalizedData, customData = {}) {
  const basisText = customData.confidenceBasis ||
    (normalizedData.calculatorSlug === 'income-tax-calculator'
      ? 'Based on official Indian Income Tax Act FY 2025-26 rules.'
      : normalizedData.calculatorSlug === 'retirement-corpus-calculator'
      ? 'Based on present value annuity math and inflation compounding.'
      : 'Based on standard reducing-balance and financial compounding math.');

  return createConfidenceContract({
    id: 'confidence-main',
    ratingStars: 5,
    confidencePct: 100,
    verifiedBasisText: basisText,
    disclaimer: 'Calculations assume consistent inputs throughout the period.',
  });
}
