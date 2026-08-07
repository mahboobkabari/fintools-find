import { createScenarioContract } from '../contracts/index.js';

export function processScenario(normalizedData, customData = {}) {
  if (customData.scenarioComparison) {
    return createScenarioContract(customData.scenarioComparison);
  }

  return createScenarioContract({
    id: 'scenario-main',
    title: 'Scenario Comparison',
    scenarioA: { title: 'Baseline Scenario', isRecommended: true },
    scenarioB: { title: 'Alternative Scenario', isRecommended: false },
    highlights: [],
  });
}
