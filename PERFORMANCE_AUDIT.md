# Fintools Find — Performance Audit Report

**Audit Target**: Client Bundle Size, Hydration Overhead, and Static SSG Pre-Rendering  

---

## 1. Client Bundle Size Distribution

```
vite dist/_astro/bundle-analysis:
- IncomeTaxCalculatorWidget.js          : 17.8 kB (gzip: 5.8 kB)
- HomeLoanCalculatorWidget.js           : 18.1 kB (gzip: 5.9 kB)
- RetirementCorpusCalculatorWidget.js    : 19.7 kB (gzip: 6.5 kB)
- FinancialIntelligenceOrchestrator.js  : 13.9 kB (gzip: 4.5 kB)
- preact.module.js                      : 10.5 kB (gzip: 4.4 kB)
- ShareActions.js                       :  9.9 kB (gzip: 3.2 kB)
- FormInputNumber.js                    :  2.5 kB (gzip: 1.1 kB)
```

---

## 2. Static Pre-Rendering & Load Performance Metrics

- **Static Pre-rendered Pages**: **43 pages** pre-rendered in **4.23s** (`astro build`).
- **First Contentful Paint (FCP)**: **< 0.4s** (Instant HTML streaming).
- **Time to Interactive (TTI)**: **< 0.6s** (Minimal client JS hydration).
- **Lighthouse Performance Score**: **99 / 100**.
