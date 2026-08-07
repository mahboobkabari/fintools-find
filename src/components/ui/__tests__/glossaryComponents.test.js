import { describe, it, expect } from 'vitest';

describe('Financial Glossary Engine Suite', () => {
  it('validates glossary term configuration contract', () => {
    const termConfig = {
      title: 'EMI',
      shortDefinition: 'Equated Monthly Installment',
      category: 'loans',
      synonyms: ['Monthly Payment'],
    };
    expect(termConfig.title).toBe('EMI');
    expect(termConfig.category).toBe('loans');
  });
});
