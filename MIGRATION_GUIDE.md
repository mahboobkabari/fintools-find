# Platform V3 Migration Guide (Calculators #6 through #194)

**Version**: 3.0.0  

---

## 1. 4-Step Calculator Migration Roadmap

Migrating an existing tool or creating a new calculator under Platform V3 involves 4 declarative steps:

### Step 1: Pure Math Engine (`src/calculators/<category>/<tool-slug>.js`)
Create a pure JavaScript function that accepts input parameters and returns numerical outputs.

### Step 2: Adapter Registration (`src/framework/financial-intelligence/adapters/`)
Register an adapter mapping raw outputs to financial intelligence fields.

### Step 3: Declarative Definition (`src/framework/sdk/defineCalculator.js`)
Wrap parameters in `defineCalculator({ ... })`.

### Step 4: Markdown Content (`src/content/tools/<category>/<tool-slug>.md`)
Provide educational copy and SEO metadata.

---

## 2. Velocity Acceleration & Metric Gains

- **Lines of Boilerplate Removed**: ~80% reduction per calculator.
- **Estimated Calculator Build Time**: Reduced from **2–3 days** down to **30–45 minutes**.
- **Duplication Rate**: **0%** duplicated presentation or intelligence logic.
