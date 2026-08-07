# FinTool Component Roadmap & Architectural Registry

**Version**: 1.0.0  
**Scope**: Master Component Inventory & Future Component Roadmap for 194 Calculators  
**Status**: Frozen Architecture Baseline  

---

## 1. Architectural Component Categories

```
                    ┌─────────────────────────────────────────────────────────┐
                    │               FlagshipLayout.astro                      │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
          ┌──────────────────────────────────────┼──────────────────────────────────────┐
          │                                      │                                      │
┌─────────┴──────────┐                ┌──────────┴──────────┐                ┌──────────┴──────────┐
│   Input Layer      │                │  Dashboard & Charts │                │  Coaching & Layout  │
├────────────────────┤                ├─────────────────────┤                ├─────────────────────┤
│ FormInputNumber    │                │ ResultDashboard     │                │ ComparisonCard      │
│ FormToggleSwitch   │                │ ResultDonutChart    │                │ RecommendationCard  │
│ FormSelect         │                │ CompoundGrowthChart │                │ InsightCard         │
│ useUrlSync Hook    │                │ TaxBreakdownCard    │                │ CostBreakdownCard   │
└────────────────────┘                └─────────────────────┘                └─────────────────────┘
```

---

## 2. Master Component Inventory & Status

| Layer | Component Name | File Path | Status | Estimated 194-Tool Reuse | Priority |
|---|---|---|---|---|---|
| **Foundation** | `useUrlSync` | `src/components/hooks/useUrlSync.js` | ✅ Production | 194 / 194 tools (100%) | **P0 (Critical)** |
| **Foundation** | `Tailwind Tokens` | `tailwind.config.mjs` | ✅ Production | 194 / 194 tools (100%) | **P0 (Critical)** |
| **Inputs** | `FormInputNumber` | `src/components/calculators/primitives/FormInputNumber.jsx` | ✅ Production | 194 / 194 tools (100%) | **P0 (Critical)** |
| **Inputs** | `FormToggleSwitch` | `src/components/calculators/primitives/FormToggleSwitch.jsx` | ✅ Production | 120 / 194 tools (62%) | **P1 (High)** |
| **Inputs** | `FormSelect` | `src/components/calculators/primitives/FormSelect.jsx` | ✅ Production | 90 / 194 tools (46%) | **P1 (High)** |
| **Inputs** | `CurrencyConverterInput` | *Proposed* | 💡 Planned | 15 / 194 tools (8%) | **P2 (Medium)** |
| **Charts** | `ResultDonutChart` | `src/components/ui/ResultDonutChart.jsx` | ✅ Production | 45 / 194 tools (23%) | **P1 (High)** |
| **Charts** | `CompoundGrowthChart` | *Proposed* | 💡 Planned | 35 / 194 tools (18%) | **P0 (Critical)** |
| **Charts** | `BreakEvenChart` | *Proposed* | 💡 Planned | 15 / 194 tools (8%) | **P2 (Medium)** |
| **Financial Widgets** | `FinancialHealthGauge` | `src/components/ui/FinancialHealthGauge.jsx` | ✅ Production | 25 / 194 tools (13%) | **P1 (High)** |
| **Financial Widgets** | `RiskMeterGauge` | *Proposed* | 💡 Planned | 22 / 194 tools (11%) | **P2 (Medium)** |
| **Financial Widgets** | `GoalTrackerCard` | *Proposed* | 💡 Planned | 18 / 194 tools (9%) | **P2 (Medium)** |
| **Result Components** | `ResultDashboard` | `src/components/ui/ResultDashboard.jsx` | ✅ Production | 194 / 194 tools (100%) | **P0 (Critical)** |
| **Result Components** | `TaxBreakdownCard` | *Proposed* | 💡 Planned | 20 / 194 tools (10%) | **P0 (Critical)** |
| **Result Components** | `SalaryBreakdownCard` | *Proposed* | 💡 Planned | 12 / 194 tools (6%) | **P1 (High)** |
| **Result Components** | `CostBreakdownCard` | `src/components/ui/CostBreakdownCard.jsx` | ✅ Production | 30 / 194 tools (15%) | **P1 (High)** |
| **Recommendation** | `RecommendationCard` | `src/components/ui/RecommendationCard.jsx` | ✅ Production | 194 / 194 tools (100%) | **P0 (Critical)** |
| **Recommendation** | `OpportunityCostCard` | *Proposed* | 💡 Planned | 25 / 194 tools (13%) | **P1 (High)** |
| **Recommendation** | `DecisionBanner` | *Proposed* | 💡 Planned | 40 / 194 tools (21%) | **P0 (Critical)** |
| **Comparison** | `ComparisonCard` | `src/components/ui/ComparisonCard.jsx` | ✅ Production | 80 / 194 tools (41%) | **P0 (Critical)** |
| **Comparison** | `AssetAllocationCard` | *Proposed* | 💡 Planned | 15 / 194 tools (8%) | **P1 (High)** |
| **Content** | `HeroSection` | `src/components/ui/HeroSection.astro` | ✅ Production | 194 / 194 tools (100%) | **P0 (Critical)** |
| **Content** | `TimelineSection` | `src/components/ui/TimelineSection.astro` | ✅ Production | 194 / 194 tools (100%) | **P0 (Critical)** |
| **Content** | `PersonaGrid` | `src/components/ui/PersonaGrid.astro` | ✅ Production | 194 / 194 tools (100%) | **P0 (Critical)** |
| **Content** | `FormulaCard` | `src/components/ui/FormulaCard.astro` | ✅ Production | 194 / 194 tools (100%) | **P0 (Critical)** |
| **Content** | `TaxReliefCard` | `src/components/ui/TaxReliefCard.astro` | ✅ Production | 25 / 194 tools (13%) | **P1 (High)** |
| **Trust** | `FAQAccordion` | `src/components/ui/FAQAccordion.jsx` | ✅ Production | 194 / 194 tools (100%) | **P0 (Critical)** |
| **Trust** | `ShareActions` | `src/components/ui/ShareActions.jsx` | ✅ Production | 194 / 194 tools (100%) | **P0 (Critical)** |
| **Trust** | `WarningAlertBanner` | *Proposed* | 💡 Planned | 50 / 194 tools (26%) | **P0 (Critical)** |
| **Layout** | `FlagshipLayout` | `src/components/content/FlagshipLayout.astro` | ✅ Production | 194 / 194 tools (100%) | **P0 (Critical)** |
| **Navigation** | `Breadcrumbs` | `src/components/Breadcrumbs.astro` | ✅ Production | 194 / 194 tools (100%) | **P0 (Critical)** |
| **Navigation** | `RelatedTools` | `src/components/RelatedTools.astro` | ✅ Production | 194 / 194 tools (100%) | **P0 (Critical)** |

---

## 3. High-ROI Missing Components Specification

### 1. `CompoundGrowthChart.jsx` (High ROI - Priority P0)
- **Purpose**: Interactive SVG area/line chart displaying year-by-year compounding wealth growth vs total invested capital.
- **Estimated Reuse**: 35+ calculators (SIP, SWP, FD, RD, PPF, Lumpsum, Retirement Corpus, CAGR, Step-Up SIP, 401k, NPS, EPF, FIRE, etc.).
- **Data Contract**: `data={[{ year, invested, returns, totalValue }]}`.

### 2. `TaxBreakdownCard.jsx` (High ROI - Priority P0)
- **Purpose**: Itemized statutory tax deduction & slab breakdown card with exemption caps.
- **Estimated Reuse**: 20+ calculators (Income Tax, GST, Capital Gains, Take-Home Salary, TDS, HRA, RSU, Crypto Tax, Payroll, etc.).
- **Data Contract**: `slabs={[{ label, taxableAmount, ratePct, taxAmount }]}, totalTax, cess`.

### 3. `DecisionBanner.jsx` (High ROI - Priority P0)
- **Purpose**: High-impact financial decision outcome banner highlighting the mathematical winner between two financial choices.
- **Estimated Reuse**: 40+ calculators (Buy vs Rent, 15 vs 30 yr loan, Prepay vs Invest, Flat vs Reducing, New vs Old Tax, Lump sum vs SIP, etc.).
- **Data Contract**: `winnerTitle, winnerBadge, savingsAmount, summaryText`.

### 4. `WarningAlertBanner.jsx` (High ROI - Priority P0)
- **Purpose**: Caution banner highlighting critical financial risks, penalty thresholds, or lock-in rules.
- **Estimated Reuse**: 50+ calculators (High debt FOIR, early PPF withdrawal, tax penalties, credit card interest traps, etc.).
- **Data Contract**: `alertLevel ('warning' | 'danger'), title, message, actionText`.

---

## 4. Component Implementation Order Ranked by ROI

```
1. CompoundGrowthChart.jsx ──────► Powers 35+ Investment & Retirement Calculators
2. DecisionBanner.jsx ───────────► Powers 40+ Scenario Comparison Decisions
3. TaxBreakdownCard.jsx ─────────► Powers 20+ Tax & Payroll Calculators
4. WarningAlertBanner.jsx ───────► Powers 50+ Risk & Affordability Callouts
5. AssetAllocationCard.jsx ──────► Powers 15+ Retirement & Portfolio Calculators
6. SalaryBreakdownCard.jsx ──────► Powers 12+ Salary & Compensation Calculators
7. OpportunityCostCard.jsx ──────► Powers 25+ Tradeoff Calculators
8. RiskMeterGauge.jsx ───────────► Powers 22+ Investment Risk Calculators
```
