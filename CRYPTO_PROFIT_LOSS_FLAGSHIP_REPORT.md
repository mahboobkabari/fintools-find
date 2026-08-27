# Flagship #89: Crypto Profit/Loss Calculator — Implementation & Verification Report

**Sprint**: 82  
**Date**: August 27, 2026  
**Status**: ✅ COMPLETED & 100% VERIFIED  
**Flagship Progress**: 89 / 194 Completed (105 Remaining)

---

## 1. Executive Summary

Flagship Calculator #89 (**Crypto Profit/Loss Calculator**) has been fully engineered, validated under institutional digital asset accounting and cost-basis standards, tested with 45 unit tests, and integrated into the static production build of Fintools Find.

- **Calculator Name**: Crypto Profit/Loss Calculator
- **Flagship Number**: #89
- **URL Slug**: `/tools/crypto/crypto-profit-loss-calculator/`
- **Category**: Crypto Calculators (`crypto`)
- **Engine**: Pure JavaScript financial calculation engine (`src/calculators/crypto/crypto-profit-loss-calculator.js`)
- **Unit Tests**: 45/45 dedicated tests passing (Total Vitest suite: 2,449/2,449 tests passing across 101 test suites)
- **Astro Diagnostic Check**: 0 errors, 0 warnings, 70 hints (689 files checked)
- **Production Build**: 147 static pages generated including `/tools/crypto/crypto-profit-loss-calculator/index.html` and the `/tools/crypto/` hub

---

## 2. Financial & Mathematical Methodology

### A. Position Sizing & Cost Basis
1. **Gross Cost Basis**:
   $$\text{Gross Cost Basis} = \text{Quantity } (Q) \times \text{Buy Price } (P_{\text{buy}})$$
2. **Total Acquisition Friction**:
   $$F_{\text{buy}} = \text{Gross Cost Basis} \times \left(\frac{\text{Buy Fee \%}}{100}\right) + \text{Buy Fixed Fee} + \text{Buy Gas Fee}$$
3. **Total Cost Basis**:
   $$\text{Total Cost Basis} = \text{Gross Cost Basis} + F_{\text{buy}}$$
4. **Effective Buy Price per Coin**:
   $$P_{\text{buy\_eff}} = \frac{\text{Total Cost Basis}}{Q}$$

### B. Exit Proceeds & Disposal Friction
1. **Gross Exit Proceeds**:
   $$\text{Gross Proceeds} = \text{Quantity } (Q) \times \text{Sell Price } (P_{\text{sell}})$$
2. **Total Disposal Friction**:
   $$F_{\text{sell}} = \text{Gross Proceeds} \times \left(\frac{\text{Sell Fee \%}}{100}\right) + \text{Sell Fixed Fee} + \text{Sell Gas Fee}$$
3. **Net Liquidatable Proceeds**:
   $$\text{Net Proceeds} = \max(0, \text{Gross Proceeds} - F_{\text{sell}})$$
4. **Effective Sell Price per Coin**:
   $$P_{\text{sell\_eff}} = \frac{\text{Net Proceeds}}{Q}$$

### C. Profit / Loss & ROI
1. **Net Profit / Loss**:
   $$\text{Net P/L} = \text{Net Proceeds} - \text{Total Cost Basis}$$
2. **Gross Profit / Loss (Excluding fees)**:
   $$\text{Gross P/L} = \text{Gross Proceeds} - \text{Gross Cost Basis}$$
3. **Return on Investment (ROI %)**:
   $$\text{ROI \%} = \left(\frac{\text{Net P/L}}{\text{Total Cost Basis}}\right) \times 100$$
4. **Gross ROI %**:
   $$\text{Gross ROI \%} = \left(\frac{\text{Gross P/L}}{\text{Gross Cost Basis}}\right) \times 100$$

### D. Analytical Break-Even Exit Price Solver
Solves for the exact market exit price $P_{\text{be}}$ required so that $\text{Net Proceeds} = \text{Total Cost Basis}$:
$$Q \times P_{\text{be}} \times \left(1 - \frac{\text{Sell Fee \%}}{100}\right) - \text{Sell Fixed Fee} - \text{Sell Gas Fee} = \text{Total Cost Basis}$$
$$P_{\text{be}} = \frac{\text{Total Cost Basis} + \text{Sell Fixed Fee} + \text{Sell Gas Fee}}{Q \times \left(1 - \frac{\text{Sell Fee \%}}{100}\right)}$$

---

## 3. Data & Market Assumptions

- **Zero Fabricated Market Data**: The calculator does not connect to unverified live price feeds or pretend to display real-time order books. All calculations operate transparently on user-entered trade executions.
- **Representative Educational Presets**: Includes 6 realistic structural archetypes:
  1. *Bitcoin (BTC) Swing Trade*: 0.25 BTC, Bought @ $48k, Sold @ $68k (+41.3% ROI)
  2. *Ethereum (ETH) DeFi Trade*: 2.0 ETH, Bought @ $2.5k, Current @ $3.4k with $45 Gas
  3. *Solana (SOL) Low-Fee Active Trade*: 40 SOL, Bought @ $110, Current @ $165 (+50% Gain)
  4. *Bitcoin in INR (₹)*: 0.05 BTC, ₹2.1L Inflow → ₹2.89L Outflow
  5. *Drawdown / Market Loss*: 1,000 Altcoin units, Bought @ $5.50, Current @ $3.80 (-31.1% Loss)
  6. *Scalp Trade Near Break-Even*: 5 ETH @ $3,000 testing fee threshold
- **Tax Disclosure**: Explicitly discloses that investment performance represents pre-tax figures, and highlights that in most jurisdictions (US IRS, UK HMRC, Australia ATO), crypto-to-crypto swaps and stablecoin trades represent taxable realization events.

---

## 4. Implemented Components & Files

| Component / Artifact | File Path | Status |
|---|---|---|
| **Calculation Engine** | `src/calculators/crypto/crypto-profit-loss-calculator.js` | ✅ Created (240 lines) |
| **Config & Presets** | `src/calculators/configs/crypto-profit-loss-calculator.config.js` | ✅ Created (100 lines) |
| **Vitest Test Suite** | `src/calculators/crypto/__tests__/crypto-profit-loss-calculator.test.js` | ✅ Created (45/45 passed) |
| **Preact Island Widget** | `src/components/calculators/primitives/CryptoProfitLossFlagshipWidget.jsx` | ✅ Created (420 lines) |
| **Widget Wrapper** | `src/components/calculators/CryptoProfitLossCalculatorWidget.jsx` | ✅ Created |
| **Astro Flagship Layout** | `src/components/content/CryptoProfitLossFlagshipLayout.astro` | ✅ Created (150 lines) |
| **EEAT Markdown Article** | `src/content/tools/crypto-profit-loss-calculator.md` | ✅ Created (180 lines) |
| **Dynamic Routing** | `src/pages/tools/[category]/[tool]/index.astro` | ✅ Updated |
| **Cross-Links** | `src/content/tools/remittance-fee-calculator.md` | ✅ Updated |

---

## 5. Verification & Quality Gates

### A. Dedicated Unit Tests
```bash
Test Files  1 passed (1)
Tests       45 passed (45)
Duration    89ms
```

### B. Full Vitest Suite
```bash
Test Files  101 passed (101)
Tests       2449 passed (2449)
Duration    8.45s
```

### C. Astro Diagnostics Check
```bash
Result (689 files): 
- 0 errors
- 0 warnings
- 70 hints
```

### D. Static Production Build
```bash
147 page(s) built in 18.98s
- /tools/crypto/crypto-profit-loss-calculator/index.html (17ms)
- /tools/crypto/index.html (3ms)
```

---

## 6. Project Roadmap Progress

- **Completed**: 89 / 194 Flagship Calculators
- **Remaining**: 105 Flagship Calculators
- **Next Sequentially**: Flagship Calculator #90 (`Mining Profitability Calculator`, line 161 in `tool_slugs.csv`)
