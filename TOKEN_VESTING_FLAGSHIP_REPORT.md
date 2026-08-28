# Flagship Calculator #97: Token Vesting Calculator Sprint Report

## 1. Executive Summary
- **Calculator Name**: Token Vesting Calculator (Crypto & Web3 Unlock Schedule Engine)
- **Flagship ID**: #97 / 194
- **Slug**: `/tools/crypto/token-vesting-calculator/`
- **Category**: `crypto` (Crypto Calculators)
- **Status**: Complete & Verified (Production Ready)
- **Quality Gates**:
  - Dedicated Engine Unit Tests: 45 / 45 passed (100%)
  - Full Vitest Test Suite: 2,809 / 2,809 passed (100%) across 109 test suites
  - Astro Diagnostics: 0 errors, 0 warnings, 87 hints across 738 project files
  - Static Production Build: 155 static pages built cleanly
  - Route Dispatcher: Wired in `src/pages/tools/[category]/[tool]/index.astro`
  - Cross-Tool Links: Connected bidirectionally across crypto calculation suite

---

## 2. Mathematical Engine & Vesting Methodology
- **Total Token Allocation**:
  $$\text{Total Tokens} = N$$
- **Total Allocation Value**:
  $$\text{Allocation Value} = N \times P$$
- **Initial TGE Unlock**:
  $$N_{\text{init}} = N \times \left(\frac{U_{\%}}{100}\right)$$
- **Remaining Vesting Allocation**:
  $$N_{\text{vest}} = \max(0, N - N_{\text{init}})$$
- **Vesting Progress Formulation**:
  $$N_{\text{vested}}(t_{\text{eval}}) = \begin{cases}
  0 & \text{if } t_{\text{eval}} < t_{\text{start}} \\
  N_{\text{init}} & \text{if } t_{\text{start}} \le t_{\text{eval}} < t_{\text{cliff}} \\
  N_{\text{init}} + N_{\text{vest}} \times \min\left(1, \frac{t_{\text{eval}} - t_{\text{start}}}{t_{\text{end}} - t_{\text{start}}}\right) & \text{if } t_{\text{cliff}} \le t_{\text{eval}} < t_{\text{end}} \\
  N & \text{if } t_{\text{eval}} \ge t_{\text{end}}
  \end{cases}$$
- **Vested / Unvested Ratio**:
  $$\text{Vested \%} = \left(\frac{N_{\text{vested}}}{N}\right) \times 100, \quad \text{Unvested \%} = 100 - \text{Vested \%}$$
- **Current Token Valuations**:
  $$V_{\text{vested}} = N_{\text{vested}} \times P, \quad V_{\text{unvested}} = (N - N_{\text{vested}}) \times P$$
- **Unrealized Gain / Loss vs Grant Price Basis ($P_0$)**:
  $$V_{\text{grant}} = N \times P_0, \quad \Delta V = (N \times P) - V_{\text{grant}}$$
- **Fully Diluted Token Ownership Percentage**:
  $$\text{Total Ownership \%} = \left(\frac{N}{S}\right) \times 100, \quad \text{Vested Ownership \%} = \left(\frac{N_{\text{vested}}}{S}\right) \times 100$$
- **Annualized Unlock Velocity**:
  $$\text{Annualized Tokens} = \frac{N}{\text{Vesting Duration Years}}, \quad \text{Annualized Value} = \text{Annualized Tokens} \times P$$

---

## 3. Supported Vesting Models
1. **Cliff + Linear Periodic Vesting** (`CLIFF_LINEAR`): Standard institutional model where accrued tokens unlock at the cliff date, followed by recurring periodic tranches.
2. **Linear Vesting without Cliff** (`LINEAR_NO_CLIFF`): Immediate continuous/periodic unlock starting from Day 1.
3. **Initial Unlock (TGE) + Cliff + Linear** (`INITIAL_UNLOCK_CLIFF_LINEAR`): Dual-tranche liquidity structure where an initial percentage unlocks at launch, with remainder subject to a cliff lockup.
4. **Stepped Tranche Vesting** (`PERIODIC_TRANCHE`): Discrete quarterly or annual block releases.
5. **Immediate / Fully Unlocked** (`IMMEDIATE`): 100% unlocked immediately.

---

## 4. Educational Presets
1. **Employee Equity Grant**: 100k tokens, 12m cliff, 48m total, monthly cadence, $1.50 spot price.
2. **Token Launch TGE**: 250k tokens, 10% TGE initial unlock, 6m cliff, 24m total, monthly cadence.
3. **Seed Investor**: 500k tokens, 12m cliff, 36m total, monthly cadence, $0.20 grant basis, $2.50 spot price.
4. **Advisor Grant**: 50k tokens, 0 cliff, 24m linear monthly cadence.
5. **Quarterly Tranche Vesting**: 200k tokens, 12m cliff, 36m total, quarterly block cadence.
6. **High Price Volatility Scenario**: 1M tokens, 12m cliff, 48m total, $0.10 grant basis to $5.00 spot price (10x expansion).

---

## 5. Token Price Sensitivity & Scenario Analysis
- Evaluates vested, unvested, and total portfolio valuations across 8 dynamic multiplier tiers:
  - **-75% Bear Crash** ($0.25 \times P$)
  - **-50% Major Drawdown** ($0.50 \times P$)
  - **-25% Mild Pullback** ($0.75 \times P$)
  - **0% Current Spot Price** ($1.00 \times P$)
  - **+25% Growth Surge** ($1.25 \times P$)
  - **+50% Strong Bull Run** ($1.50 \times P$)
  - **+100% 2x Rally** ($2.00 \times P$)
  - **+300% 4x Moonshot** ($4.00 \times P$)

---

## 6. Multi-Currency Quoting Support
- Supported currencies: **USD ($), EUR (€), GBP (£), INR (₹), CAD (C$), AUD (A$), AED (د.إ), SGD (S$), JPY (¥)**.
- JPY integers formatted with zero decimals; standard currencies formatted with 2 decimals.

---

## 7. Artifacts and Source Files Created / Modified
- `src/calculators/crypto/token-vesting-calculator.js`: Pure deterministic calculation engine.
- `src/calculators/configs/token-vesting-calculator.config.js`: Configuration, metadata, and 6 educational presets.
- `src/calculators/crypto/__tests__/token-vesting-calculator.test.js`: 45 dedicated unit tests covering math, schedules, dates, and edge cases.
- `src/components/calculators/primitives/TokenVestingFlagshipWidget.jsx`: Preact UI widget with decision hero, progress bar, schedule table, sensitivity matrix, and URL sync.
- `src/components/calculators/TokenVestingCalculatorWidget.jsx`: Preact wrapper component.
- `src/components/content/TokenVestingFlagshipLayout.astro`: Astro layout with timeline, user personas, formulas, case studies, and strategic guidelines.
- `src/content/tools/token-vesting-calculator.md`: Comprehensive EEAT markdown content with Schema.org JSON-LD definitions.
- `src/pages/tools/[category]/[tool]/index.astro`: Dynamic flagship routing dispatcher.
- `src/content/tools/gas-fee-calculator.md`: Updated cross-links to include token vesting calculator.

---

## 8. Quality Gates & Verification Summary
| Verification Step | Target / Threshold | Result | Status |
|---|---|---|---|
| Dedicated Unit Tests | $\ge 40$ unit tests | 45 / 45 passed | PASSED |
| Full Vitest Suite | 100% test pass rate | 2,809 / 2,809 passed | PASSED |
| Astro Diagnostics | 0 errors, 0 warnings | 0 errors, 0 warnings (87 hints) | PASSED |
| Static Build Generation | Clean build | 155 static HTML pages built | PASSED |
| Route Accessibility | Valid HTML & Schemas | `dist/tools/crypto/token-vesting-calculator/` generated | PASSED |
| Git Push Policy | No unauthorized push | Local changes only, 0 push | VERIFIED |

---

## 9. Next Roadmap Milestone
- **Next Sequential Tool**: Flagship #98 — **NFT Royalty Calculator**
- **Source**: `tool_slugs.csv` Line 169
- **Category**: `crypto`
- **Expected Slug**: `/tools/crypto/nft-royalty-calculator/`
