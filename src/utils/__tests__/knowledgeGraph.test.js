import { describe, it, expect, vi } from 'vitest';

vi.mock('astro:content', () => ({
  getCollection: async (collectionName) => {
    if (collectionName === 'tools') {
      return [{ id: 'home-loan-calculator', data: { title: 'Home Loan Calculator', category: 'loans', slug: 'home-loan-calculator' } }];
    }
    return [];
  },
}));

import { getRelatedContent } from '../getRelatedContent.js';

describe('Metadata-Driven Internal Linking Engine Suite', () => {
  it('validates getRelatedContent function contract', async () => {
    const result = await getRelatedContent({
      type: 'tool',
      slug: 'emi-calculator',
      category: 'loans',
      limit: 4,
    });

    expect(result).toBeDefined();
    expect(result.category).toBe('loans');
    expect(result.hubUrl).toBe('/loans/');
    expect(Array.isArray(result.relatedCalculators)).toBe(true);
    expect(Array.isArray(result.relatedGuides)).toBe(true);
    expect(Array.isArray(result.relatedComparisons)).toBe(true);
    expect(Array.isArray(result.relatedTerms)).toBe(true);
  });
});
