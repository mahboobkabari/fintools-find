# Platform V3 Calculator SDK Manual

**Version**: 3.0.0  

---

## 1. Quick Start Guide

Creating a new calculator under Platform V3 requires defining a single configuration using `defineCalculator`:

```js
import { defineCalculator } from '@/framework/sdk/defineCalculator.js';
import { createDashboard, createInsights, createRecommendations } from '@/framework/sdk/builders.js';
import { calculateCarLoan } from '@/calculators/loans/car-loan-calculator.js';
import { adaptCarLoan } from '@/framework/financial-intelligence/adapters/CarLoanAdapter.js';

export default defineCalculator({
  id: 'car-loan-calculator',
  slug: 'car-loan-calculator',
  category: 'loans',
  title: 'Car Loan Calculator',
  description: 'Calculate car loan EMIs, interest outgo, and optimal down payment.',
  engine: calculateCarLoan,
  adapter: adaptCarLoan,
  presets: [
    { id: 'hatchback', label: 'Hatchback', carValue: 600000, tenureYears: 5 },
    { id: 'suv', label: 'SUV', carValue: 1800000, tenureYears: 7 },
  ],
  insights: createInsights([
    { id: 'ins1', label: 'Effective Interest Multiplier', value: '1.24x' },
  ]),
});
```

---

## 2. Builder Utilities API

- **`createDashboard(config)`**: Generates KPI dashboard configuration.
- **`createDecision(config)`**: Generates decision banner criteria.
- **`createWarnings(rules)`**: Generates rule-based caution alerts.
- **`createInsights(items)`**: Generates financial insight cards.
- **`createRecommendations(items)`**: Generates ranked opportunity advice cards.
- **`createScenarioCards(scenarios)`**: Generates scenario presets.
- **`createComparison(config)`**: Generates 2-column scenario comparisons.
- **`createCharts(config)`**: Generates donut chart color tokens.
- **`createFaq(faqList)`**: Generates FAQ accordion list.
- **`createRelatedTools(tools)`**: Generates related tool cards.
- **`createSeo(config)`**: Generates custom SEO metadata.
- **`createSchema(config)`**: Generates JSON-LD schema rules.
