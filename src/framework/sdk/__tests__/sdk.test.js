import { describe, it, expect, vi } from 'vitest';
import { defineCalculator } from '../defineCalculator.js';
import { CalculatorFactory } from '../CalculatorFactory.js';
import {
  createDashboard,
  createInsights,
  createRecommendations,
  createDecision,
  createWarnings,
  createScenarioCards,
  createComparison,
  createCharts,
  createFaq,
  createRelatedTools,
  createSeo,
  createSchema,
} from '../builders.js';
import { registerPlugin, getPlugin } from '../plugins.js';

describe('Platform V3 SDK Framework Suite', () => {
  it('defines calculator using defineCalculator and generates automatic SEO & schemas', () => {
    const calc = defineCalculator({
      id: 'car-loan-calculator',
      slug: 'car-loan-calculator',
      category: 'loans',
      title: 'Car Loan Calculator',
      description: 'Calculate car loan EMIs and total interest payable.',
      engine: (inputs) => ({ primaryOutput: 15000 }),
    });

    expect(calc.id).toBe('car-loan-calculator');
    expect(calc.seo.title).toBe('Car Loan Calculator');
    expect(calc.seo.canonical).toContain('/tools/loans/car-loan-calculator/');
    expect(calc.seo.schemas.length).toBe(2);
  });

  it('instantiates calculator via CalculatorFactory and executes math & intelligence pipeline', async () => {
    const calcDef = defineCalculator({
      id: 'income-tax-calculator',
      slug: 'income-tax-calculator',
      category: 'tax',
      engine: (inputs) => ({ winner: { regime: 'new', totalTax: 50000 } }),
    });

    const instance = CalculatorFactory.create(calcDef);
    const result = await instance.calculate({ grossIncome: 1000000 });

    expect(result.rawResults.winner.regime).toBe('new');
    expect(result.intelligence).toBeDefined();
    expect(result.intelligence.calculatorSlug).toBe('income-tax-calculator');
  });

  it('validates builder utilities', () => {
    const dashboard = createDashboard({ heroTitle: 'Monthly EMI' });
    expect(dashboard.type).toBe('dashboard');
    expect(dashboard.heroTitle).toBe('Monthly EMI');

    const insights = createInsights([{ id: 'ins1', label: 'Rate' }]);
    expect(insights.type).toBe('insights');
    expect(insights.items.length).toBe(1);

    const warnings = createWarnings([{ id: 'w1', message: 'High debt' }]);
    expect(warnings.type).toBe('warnings');
  });

  it('registers and retrieves plugins', () => {
    registerPlugin('Analytics', { log: () => 'logged' });
    const plugin = getPlugin('Analytics');
    expect(plugin).toBeDefined();
    expect(plugin.log()).toBe('logged');
  });

  it('triggers lifecycle hooks and AI ready interfaces', async () => {
    const beforeSpy = vi.fn();
    const calcDef = defineCalculator({
      id: 'sip-calculator',
      engine: () => ({ primaryOutput: 100000 }),
    });

    calcDef.hooks.register('beforeCalculate', beforeSpy);
    const instance = CalculatorFactory.create(calcDef);
    await instance.calculate();

    expect(beforeSpy).toHaveBeenCalled();
    expect(calcDef.getSummary({}, { primaryOutput: 100000 })).toContain('100000');
  });
});
