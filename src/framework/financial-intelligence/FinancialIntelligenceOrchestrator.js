import { normalizeCalculatorOutput } from './normalize/index.js';
import { processDecision } from './engines/DecisionEngine.js';
import { processScore } from './engines/ScoreEngine.js';
import { processOpportunities } from './engines/OpportunityEngine.js';
import { processRecommendations } from './engines/RecommendationEngine.js';
import { processWarnings } from './engines/WarningEngine.js';
import { processInsights } from './engines/InsightEngine.js';
import { processConfidence } from './engines/ConfidenceEngine.js';
import { processScenario } from './engines/ScenarioEngine.js';
import { processNarrative } from './engines/NarrativeEngine.js';

import { adaptEMICalculator } from './adapters/EMIAdapter.js';
import { adaptSIPCalculator } from './adapters/SIPAdapter.js';
import { adaptHomeLoanCalculator } from './adapters/HomeLoanAdapter.js';
import { adaptIncomeTaxCalculator } from './adapters/IncomeTaxAdapter.js';
import { adaptRetirementCorpusCalculator } from './adapters/RetirementCorpusAdapter.js';

const engineRegistry = new Map([
  ['DecisionEngine', processDecision],
  ['ScoreEngine', processScore],
  ['OpportunityEngine', processOpportunities],
  ['RecommendationEngine', processRecommendations],
  ['WarningEngine', processWarnings],
  ['InsightEngine', processInsights],
  ['ConfidenceEngine', processConfidence],
  ['ScenarioEngine', processScenario],
  ['NarrativeEngine', processNarrative],
]);

const adapterRegistry = new Map([
  ['emi-calculator', adaptEMICalculator],
  ['sip-calculator', adaptSIPCalculator],
  ['home-loan-calculator', adaptHomeLoanCalculator],
  ['income-tax-calculator', adaptIncomeTaxCalculator],
  ['retirement-corpus-calculator', adaptRetirementCorpusCalculator],
]);

export function registerEngine(name, engineFn) {
  engineRegistry.set(name, engineFn);
}

export function registerAdapter(calculatorSlug, adapterFn) {
  adapterRegistry.set(calculatorSlug, adapterFn);
}

/**
 * Public Orchestrator API
 *
 * @param {Object} options
 * @param {string} options.calculator - Calculator slug (e.g. 'income-tax-calculator')
 * @param {Object} options.inputs - Raw input parameters
 * @param {Object} options.results - Raw math results
 * @returns {Object} Unified Financial Intelligence Payload
 */
export function buildFinancialIntelligence({ calculator, inputs = {}, results = {} }) {
  const calculatorSlug = calculator || 'generic-calculator';

  // 1. Run Adapter if registered
  const adapterFn = adapterRegistry.get(calculatorSlug);
  const customData = adapterFn ? adapterFn(inputs, results) : {};

  // 2. Normalize Data
  const normalized = normalizeCalculatorOutput(calculatorSlug, inputs, results);

  // 3. Execute Registered Engines
  const decision = (engineRegistry.get('DecisionEngine') || processDecision)(normalized, customData);
  const score = (engineRegistry.get('ScoreEngine') || processScore)(normalized, customData);
  const opportunities = (engineRegistry.get('OpportunityEngine') || processOpportunities)(normalized, customData);
  const recommendations = (engineRegistry.get('RecommendationEngine') || processRecommendations)(normalized, customData);
  const warnings = (engineRegistry.get('WarningEngine') || processWarnings)(normalized, customData);
  const insights = (engineRegistry.get('InsightEngine') || processInsights)(normalized, customData);
  const confidence = (engineRegistry.get('ConfidenceEngine') || processConfidence)(normalized, customData);
  const scenario = (engineRegistry.get('ScenarioEngine') || processScenario)(normalized, customData);
  const narrative = (engineRegistry.get('NarrativeEngine') || processNarrative)(normalized, customData);

  return {
    calculatorSlug,
    normalized,
    decision,
    score,
    opportunities,
    recommendations,
    warnings,
    insights,
    confidence,
    scenario,
    narrative,
  };
}
