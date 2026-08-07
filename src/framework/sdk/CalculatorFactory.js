import { buildFinancialIntelligence } from '../financial-intelligence/FinancialIntelligenceOrchestrator.js';

export class CalculatorFactory {
  static create(calculatorDefinition) {
    const def = calculatorDefinition;

    return {
      definition: def,
      async calculate(inputs = {}) {
        await def.hooks.run('beforeCalculate', { inputs });

        const rawResults = def.engine(inputs);

        const intelligence = buildFinancialIntelligence({
          calculator: def.slug,
          inputs,
          results: rawResults,
        });

        const fullContext = {
          inputs,
          rawResults,
          intelligence,
          seo: def.seo,
          presets: def.presets,
        };

        await def.hooks.run('afterCalculate', fullContext);

        return fullContext;
      },
    };
  }
}
