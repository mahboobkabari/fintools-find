# Flagship #90: Mining Profitability Calculator — Implementation & Verification Report

**Sprint**: 83  
**Date**: August 27, 2026  
**Status**: ✅ COMPLETED & 100% VERIFIED  
**Flagship Progress**: 90 / 194 Completed (104 Remaining)

---

## 1. Executive Summary

Flagship Calculator #90 (**Mining Profitability Calculator**) has been engineered, validated against first-principles thermodynamic energy conversion and Proof-of-Work (PoW) proportional reward distribution models, tested with 45 unit tests, and integrated into the static production build of Fintools Find.

- **Calculator Name**: Mining Profitability Calculator
- **Flagship Number**: #90
- **URL Slug**: `/tools/crypto/mining-profitability-calculator/`
- **Category**: Crypto Calculators (`crypto`)
- **Engine**: Pure JavaScript financial & thermodynamic engine (`src/calculators/crypto/mining-profitability-calculator.js`)
- **Unit Tests**: 45/45 dedicated tests passing (Total Vitest suite: 2,494/2,494 tests passing across 102 test suites)
- **Astro Diagnostic Check**: 0 errors, 0 warnings, 70 hints (695 files checked)
- **Production Build**: 148 static pages generated including `/tools/crypto/mining-profitability-calculator/index.html`

---

## 2. Mathematical & Financial Methodology

### A. Hashrate Normalization & Production Modeling
1. **Multi-Unit Normalization**:
   $$H_{\text{miner, base}} = H_{\text{miner}} \times 10^{\text{exp}} \quad (\text{H/s, kH/s, MH/s, GH/s, TH/s, PH/s, EH/s})$$
2. **Network Hashrate Share**:
   $$\text{Share} = \frac{H_{\text{miner, base}}}{H_{\text{network, base}}}$$
3. **Daily Coins Produced**:
   $$\text{Coins}_{\text{daily}} = \text{Share} \times \text{Blocks Per 24h} \times (\text{Block Subsidy} + \text{Tx Fees}) \times \left(\frac{\text{Uptime \%}}{100}\right)$$
4. **Daily Gross Mining Revenue**:
   $$\text{Revenue}_{\text{daily}} = \text{Coins}_{\text{daily}} \times P_{\text{crypto}}$$

### B. Thermodynamic Operating Expenses (OPEX)
1. **Daily Electrical Energy Consumption**:
   $$\text{Daily kWh} = \left(\frac{\text{Power Watts}}{1000}\right) \times 24 \times \left(\frac{\text{Uptime \%}}{100}\right)$$
2. **Daily Power Cost**:
   $$\text{Cost}_{\text{elec, daily}} = \text{Daily kWh} \times \text{Rate}_{\text{elec}} \quad (\$/\text{kWh})$$
3. **Mining Pool Fees**:
   $$\text{Fee}_{\text{pool, daily}} = \text{Revenue}_{\text{daily}} \times \left(\frac{\text{Pool Fee \%}}{100}\right)$$
4. **Total Daily Operating Costs**:
   $$\text{Cost}_{\text{daily, total}} = \text{Cost}_{\text{elec, daily}} + \text{Fee}_{\text{pool, daily}} + \text{Cost}_{\text{other, daily}}$$

### C. Net Earnings, Payback Horizon & Hardware ROI
1. **Daily, Monthly, and Annual Net Profit**:
   $$\text{Profit}_{\text{daily}} = \text{Revenue}_{\text{daily}} - \text{Cost}_{\text{daily, total}}$$
   $$\text{Profit}_{\text{monthly}} = \text{Profit}_{\text{daily}} \times \left(\frac{365}{12}\right)$$
   $$\text{Profit}_{\text{annual}} = \text{Profit}_{\text{daily}} \times 365$$
2. **Hardware Capital Payback Period**:
   $$\text{Payback Days} = \frac{\text{Hardware CAPEX}}{\text{Profit}_{\text{daily}}} \quad (\text{when } \text{Profit}_{\text{daily}} > 0)$$
   $$\text{Payback Months} = \frac{\text{Payback Days}}{30.4167}$$
3. **Annualized Hardware ROI %**:
   $$\text{ROI}_{\text{annual}} = \left(\frac{\text{Profit}_{\text{annual}}}{\text{Hardware CAPEX}}\right) \times 100$$

### D. Analytical Break-Even Shutdown Price Solver
Solves for the exact crypto price $P_{\text{shutdown}}$ below which daily power and pool costs exceed revenue:
$$\text{Coins}_{\text{daily}} \times P_{\text{shutdown}} \times \left(1 - \frac{\text{Pool Fee \%}}{100}\right) = \text{Cost}_{\text{elec, daily}} + \text{Cost}_{\text{other, daily}}$$
$$P_{\text{shutdown}} = \frac{\text{Cost}_{\text{elec, daily}} + \text{Cost}_{\text{other, daily}}}{\text{Coins}_{\text{daily}} \times \left(1 - \frac{\text{Pool Fee \%}}{100}\right)}$$

---

## 3. Data & Market Assumptions

- **Zero Fabricated Live Data**: The calculator does not connect to unverified live difficulty APIs or fabricate real-time pool stats. All calculations are transparently driven by user-entered inputs and explicit structural reference baselines.
- **Representative Hardware & Network Archetypes**: Includes 6 realistic structural scenarios:
  1. *Bitcoin (BTC) Next-Gen Industrial ASIC*: 234 TH/s @ 3.51 kW (15 J/TH), $0.05/kWh industrial power
  2. *Bitcoin (BTC) Retail Home Miner*: 140 TH/s @ 3.01 kW (21.5 J/TH), $0.12/kWh residential power
  3. *Litecoin & Dogecoin Scrypt ASIC*: 9.5 GH/s @ 3.42 kW, $0.06/kWh merged mining
  4. *Kaspa kHeavyHash ASIC*: 10 TH/s @ 3.4 kW, $0.055/kWh
  5. *Monero RandomX CPU*: 20 kH/s @ 150W, $0.10/kWh
  6. *Unprofitable High-Power Demo*: 110 TH/s @ 3.25 kW, $0.18/kWh (Demonstrating negative cashflow)
- **Disclosures**: Full disclosure reminding users that real-world network difficulty adjustments and halving schedules will alter production over multi-year horizons.

---

## 4. Implemented Components & Files

| Component / Artifact | File Path | Status |
|---|---|---|
| **Calculation Engine** | `src/calculators/crypto/mining-profitability-calculator.js` | ✅ Created (245 lines) |
| **Config & Presets** | `src/calculators/configs/mining-profitability-calculator.config.js` | ✅ Created (100 lines) |
| **Vitest Test Suite** | `src/calculators/crypto/__tests__/mining-profitability-calculator.test.js` | ✅ Created (45/45 passed) |
| **Preact Island Widget** | `src/components/calculators/primitives/MiningProfitabilityFlagshipWidget.jsx` | ✅ Created (430 lines) |
| **Widget Wrapper** | `src/components/calculators/MiningProfitabilityCalculatorWidget.jsx` | ✅ Created |
| **Astro Flagship Layout** | `src/components/content/MiningProfitabilityFlagshipLayout.astro` | ✅ Created (150 lines) |
| **EEAT Markdown Article** | `src/content/tools/mining-profitability-calculator.md` | ✅ Created (175 lines) |
| **Dynamic Routing** | `src/pages/tools/[category]/[tool]/index.astro` | ✅ Updated |
| **Cross-Links** | `src/content/tools/crypto-profit-loss-calculator.md` | ✅ Updated |

---

## 5. Verification & Quality Gates

### A. Dedicated Unit Tests
```bash
Test Files  1 passed (1)
Tests       45 passed (45)
Duration    27ms
```

### B. Full Vitest Suite
```bash
Test Files  102 passed (102)
Tests       2494 passed (2494)
Duration    8.55s
```

### C. Astro Diagnostics Check
```bash
Result (695 files): 
- 0 errors
- 0 warnings
- 70 hints
```

### D. Static Production Build
```bash
148 page(s) built in 18.92s
- /tools/crypto/mining-profitability-calculator/index.html (19ms)
```

---

## 6. Project Roadmap Progress

- **Completed**: 90 / 194 Flagship Calculators
- **Remaining**: 104 Flagship Calculators
- **Next Sequentially**: Flagship Calculator #91 (`Staking Rewards Calculator`, line 162 in `tool_slugs.csv`)
