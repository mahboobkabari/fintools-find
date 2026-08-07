# FinTool Financial Intelligence Platform Standard

**Version**: 2.0.0  
**Status**: Institutional Platform Specification Baseline  
**Scope**: Universal Financial Intelligence Layer for all 194 Calculators  

---

## 1. Architectural Philosophy

FinTool's Financial Intelligence Layer decouples raw mathematical calculation from financial reasoning, coaching, decision scoring, and recommendation ranking. 

```
                                  USER INPUTS
                                       │
                                       ▼
                       ┌──────────────────────────────┐
                       │    PURE MATH ENGINES         │
                       │    (src/calculators/)        │
                       └───────────────┬──────────────┘
                                       │ Raw Financial Calculations
                                       ▼
                       ┌──────────────────────────────┐
                       │ FINANCIAL INTELLIGENCE LAYER │
                       ├──────────────────────────────┤
                       │  - DecisionEngine.js         │
                       │  - ScoreEngine.js            │
                       │  - OpportunityEngine.js      │
                       │  - RecommendationEngine.js   │
                       │  - WarningEngine.js          │
                       │  - ConfidenceEngine.js       │
                       │  - ScenarioEngine.js         │
                       │  - InsightEngine.js          │
                       └───────────────┬──────────────┘
                                       │ Standardized JSON Data Contracts
                                       ▼
                       ┌──────────────────────────────┐
                       │   SHARED UI COMPONENTS       │
                       └──────────────────────────────┘
```

---

## 2. Standard JSON Data Contracts

### 2.1 Decision Engine Contract (`DecisionContract`)
```json
{
  "status": "success",
  "title": "New Tax Regime saves you ₹34,850 this year.",
  "subtitle": "The New Regime offers lower tax slabs with standard deduction of ₹75,000 without needing complex investments.",
  "winnerId": "new-regime",
  "savingsAmount": 34850,
  "confidenceStars": 5,
  "actionText": "Select New Regime"
}
```

### 2.2 Score Engine Contract (`ScoreContract`)
```json
{
  "score": 92,
  "level": "Excellent",
  "color": "#10B981",
  "badge": "Fully On Track",
  "description": "Your projected retirement corpus fully meets or exceeds your inflation-adjusted nest egg goal.",
  "subscores": {
    "savingsProgressStars": 5,
    "inflationProtectionStars": 5,
    "withdrawalSafetyStars": 4,
    "investmentDisciplineStars": 5
  },
  "reasons": [
    "✓ Section 80C fully maximized (₹1.5 Lakhs).",
    "✓ Section 24(b) Home Loan Interest fully claimed (₹2.0 Lakhs).",
    "✓ Optimized on New Tax Regime for maximum tax savings."
  ]
}
```

### 2.3 Opportunity Engine Contract (`OpportunityContract`)
```json
[
  {
    "id": "increase-sip",
    "rank": 1,
    "title": "Increase Monthly SIP by ₹3,000",
    "estimatedSavings": 6800000,
    "impactText": "Corpus grows by ₹68 Lakhs to reach 100% target",
    "description": "Bridge the shortfall by stepping up your monthly investment today."
  },
  {
    "id": "nps-benefit",
    "rank": 2,
    "title": "Contribute ₹50,000 into NPS (Sec 80CCD 1B)",
    "estimatedSavings": 15600,
    "impactText": "Saves ₹15,600 in tax",
    "description": "Claim additional tax deduction up to ₹50,000 dedicated for National Pension System."
  }
]
```

### 2.4 Warning Engine Contract (`WarningContract`)
```json
[
  {
    "id": "longevity-risk",
    "level": "danger",
    "title": "Longevity Risk Warning",
    "message": "At your current savings rate, your retirement corpus is projected to run out around age 81 (4 years before life expectancy).",
    "actionText": "Step up monthly SIP or delay retirement by 2 years."
  }
]
```

### 2.5 Confidence Engine Contract (`ConfidenceContract`)
```json
{
  "ratingStars": 5,
  "confidencePct": 100,
  "verifiedBasisText": "Based on official Indian Income Tax Act FY 2025-26 budget rules.",
  "disclaimer": "Calculations assume current tax laws and user inputs."
}
```

### 2.6 Insight Engine Contract (`InsightContract`)
```json
[
  {
    "id": "effective-rate",
    "label": "Effective Tax Rate",
    "value": "5.96%",
    "labelColor": "text-primary",
    "valueColor": "text-primary",
    "desc": "You pay 5.96% of your total gross annual salary in income tax."
  },
  {
    "id": "marginal-tax",
    "label": "Marginal Tax Increment (+₹1L)",
    "value": "₹15,600",
    "labelColor": "text-accent-amber",
    "valueColor": "text-accent-amber",
    "desc": "If your salary increases by ₹1 Lakh, your additional tax will be approximately ₹15,600 (15% rate)."
  }
]
```

---

## 3. Execution Pipeline & Standard Flow

1. **User Interaction**: Input parameters change via sliders or scenario chips.
2. **Pure Math Execution**: Pure JS math function runs and produces raw numerical output.
3. **Financial Intelligence Layer**: Standard engines process raw output and generate JSON data contracts (`DecisionContract`, `ScoreContract`, `OpportunityContract`, etc.).
4. **Shared UI Layer**: Preact UI primitives (`ResultDashboard`, `ComparisonCard`, `FinancialHealthGauge`, `RecommendationCard`, `InsightCard`) render standard contracts with zero ad-hoc styling.
5. **Static Layout**: `FlagshipLayout.astro` presents the page with SSG pre-rendering.
