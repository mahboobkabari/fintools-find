# Platform V3 Plugin System Guide

**Version**: 3.0.0  

---

## 1. Registering Platform Plugins

Plugins extend platform behavior globally across all calculators without modifying calculator code:

```js
import { registerPlugin, getPlugin } from '@/framework/sdk/plugins.js';

// Analytics Plugin
registerPlugin('Analytics', {
  trackCalculation(calculatorSlug, inputs) {
    console.log(`[Analytics] Calculation executed for ${calculatorSlug}`);
  },
});

// Localization Plugin
registerPlugin('Localization', {
  formatCurrency(amount, locale = 'en-IN') {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'INR' }).format(amount);
  },
});
```
