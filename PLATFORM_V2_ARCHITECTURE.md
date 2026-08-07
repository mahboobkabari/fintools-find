# FinTool Platform V2 Architecture Specification

**Version**: 2.0.0  
**Status**: Institutional Platform Blueprint Baseline  

---

## 1. End-to-End Tiered Platform Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           1. USER INPUT TIER                              │
├───────────────────────────────────────────────────────────────────────────┤
│  FormInputNumber  │  FormToggleSwitch  │  FormSelect  │  Preset Chips     │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ URL Query Sync via useUrlSync.js
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        2. PURE MATHEMATICAL TIER                          │
├───────────────────────────────────────────────────────────────────────────┤
│  Pure JavaScript Calculators (src/calculators/core/ & /tax/ & /loans/)   │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Raw Numerical Outputs
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    3. FINANCIAL INTELLIGENCE LAYER                        │
├───────────────────────────────────────────────────────────────────────────┤
│ DecisionEngine │ ScoreEngine │ OpportunityEngine │ RecommendationEngine   │
│ WarningEngine  │ ConfidenceEngine │ ScenarioEngine │ InsightEngine        │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Standardized JSON Data Contracts
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        4. SHARED UI PRIMITIVES                            │
├───────────────────────────────────────────────────────────────────────────┤
│ ResultDashboard │ FinancialHealthGauge │ ComparisonCard │ CostBreakdownCard │
│ RecommendationCard │ InsightCard │ ResultDonutChart │ ShareActions        │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Component Props
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    5. DECLARATIVE PRESENTATION TIER                       │
├───────────────────────────────────────────────────────────────────────────┤
│  FlagshipLayout.astro (17-Section Declarative Registry Presenter)          │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Astro SSG Pre-Rendering
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    6. PRODUCTION STATIC DISTRIBUTION                      │
├───────────────────────────────────────────────────────────────────────────┤
│  100% Static HTML / CSS / JS (Dist Files - 0ms Server Lag)                 │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layer Responsibilities & Isolation Boundaries

1. **User Input Tier**: Manages client interaction via range sliders, numeric inputs, and scenario chips. All state changes synchronize instantly with URL parameters using `useUrlSync.js`.
2. **Pure Mathematical Tier**: Contains zero DOM or UI references. Pure JS math functions calculate compounding, amortization, tax slabs, and annuity present values. Tested 100% in Vitest.
3. **Financial Intelligence Layer**: Transforms raw mathematical figures into structured decision banners, confidence badges, warning alerts, ranked rupee savings opportunities, and subscores.
4. **Shared UI Primitives**: Preact components that render JSON data contracts into accessible, responsive visual UI widgets.
5. **Declarative Presentation Tier**: `FlagshipLayout.astro` renders the 17-section institutional page structure (Hero, Timeline, Personas, Formulas, Worked Case Studies, FAQs, Related Tools).
6. **Production Static Distribution**: Astro pre-renders 100% static HTML at build time for instant CDN loading.
