import { generateCalculatorSEO } from './seo.js';
import { CalculatorHooks } from './hooks.js';

export function defineCalculator(definition = {}) {
  const hooks = new CalculatorHooks();

  const calcDef = {
    id: definition.id || 'generic-calculator',
    slug: definition.slug || definition.id || 'generic-calculator',
    category: definition.category || 'general',
    title: definition.title || 'Financial Calculator',
    description: definition.description || '',
    engine: definition.engine || (() => ({})),
    adapter: definition.adapter || null,
    config: definition.config || {},
    content: definition.content || {},
    flagship: definition.flagship ?? true,
    intelligence: definition.intelligence || {},
    presets: definition.presets || [],
    scenarios: definition.scenarios || [],
    charts: definition.charts || {},
    insights: definition.insights || [],
    comparisons: definition.comparisons || {},
    relatedTools: definition.relatedTools || [],
    faq: definition.faq || [],
    seo: generateCalculatorSEO(definition),
    schema: definition.schema || {},
    analytics: definition.analytics || { eventCategory: 'calculator' },
    hooks,

    // AI Interface Ready Declarations
    getSummary(inputs, results) {
      return `Summary for ${calcDef.title} with primary output ₹${results?.primaryOutput || 0}`;
    },
    getInsights(inputs, results) {
      return results?.insights || calcDef.insights;
    },
    getRecommendations(inputs, results) {
      return results?.opportunities || [];
    },
    getRisks(inputs, results) {
      return results?.warnings || [];
    },
    getExplanation(inputs, results) {
      return `Detailed mathematical explanation for ${calcDef.title}.`;
    },
    getEducation(inputs, results) {
      return calcDef.faq;
    },
  };

  return calcDef;
}
