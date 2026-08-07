import { describe, it, expect } from 'vitest';
import { buildFinancialIntelligence, registerEngine } from '../FinancialIntelligenceOrchestrator.js';
import { normalizeCalculatorOutput } from '../normalize/index.js';
import { createDecisionContract, createScoreContract } from '../contracts/index.js';

describe('Financial Decision Platform V2 Framework', () => {
  it('validates contract schemas correctly', () => {
    const decision = createDecisionContract({ title: 'Test Title', status: 'success' });
    expect(decision.type).toBe('decision');
    expect(decision.title).toBe('Test Title');
    expect(decision.status).toBe('success');

    const score = createScoreContract({ score: 95 });
    expect(score.type).toBe('score');
    expect(score.score).toBe(95);
  });

  it('normalizes calculator outputs for EMI and Income Tax', () => {
    const emiNorm = normalizeCalculatorOutput('emi-calculator', { loanAmount: 1000000 }, { emi: 12000, foirPct: 35 });
    expect(emiNorm.liability.monthlyCost).toBe(12000);
    expect(emiNorm.risk.foirPct).toBe(35);

    const taxNorm = normalizeCalculatorOutput('income-tax-calculator', { grossIncome: 1200000 }, { winner: { regime: 'new', totalTax: 71500 } });
    expect(taxNorm.tax.totalTaxPayable).toBe(71500);
    expect(taxNorm.tax.winnerRegime).toBe('new');
  });

  it('orchestrates all intelligence engines for Income Tax flagship', () => {
    const intel = buildFinancialIntelligence({
      calculator: 'income-tax-calculator',
      inputs: { grossIncome: 1200000 },
      results: {
        winner: { regime: 'new', totalTax: 71500, effectiveRate: 5.96 },
        heroDecision: { heroDecisionTitle: 'New Regime Saves ₹34k', isNewBetter: true },
      },
    });

    expect(intel.calculatorSlug).toBe('income-tax-calculator');
    expect(intel.decision.title).toContain('New Regime');
    expect(intel.confidence.ratingStars).toBe(5);
    expect(intel.insights.length).toBeGreaterThan(0);
  });

  it('orchestrates all intelligence engines for Retirement Corpus flagship', () => {
    const intel = buildFinancialIntelligence({
      calculator: 'retirement-corpus-calculator',
      inputs: { currentAge: 30, retirementAge: 60 },
      results: {
        requiredCorpus: 60000000,
        projectedCorpus: 45000000,
        readinessScore: 75,
        readinessStatus: { level: 'Needs Improvement', color: '#F59E0B', badge: 'Shortfall' },
      },
    });

    expect(intel.calculatorSlug).toBe('retirement-corpus-calculator');
    expect(intel.score.score).toBe(75);
    expect(intel.decision.status).toBe('warning');
  });

  it('supports dynamic plugin engine registration', () => {
    registerEngine('CustomEngine', (norm) => ({ type: 'custom', ok: true }));
    const intel = buildFinancialIntelligence({ calculator: 'test-calc' });
    expect(intel).toBeDefined();
  });
});
