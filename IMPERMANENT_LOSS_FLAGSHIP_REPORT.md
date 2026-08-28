# Flagship Calculator #94: Impermanent Loss Calculator Implementation & Verification Report

---

### 1. Calculator Name
- **Display Name**: Impermanent Loss Calculator
- **Full Title**: Impermanent Loss Calculator (DeFi Liquidity Pool vs HODL Engine)
- **Sub-headline**: Institutional Constant-Product AMM Liquidity Provision, Arbitrage Rebalancing, and Break-Even Fee Yield Simulator

---

### 2. Flagship Number
- **Flagship Sequence Number**: **#94 of 194**

---

### 3. Exact Slug
- **URL Path**: `/tools/crypto/impermanent-loss-calculator/`
- **Source Identifier**: `tool_slugs.csv` (Line 165: `Crypto Calculators,Impermanent Loss Calculator,/tools/impermanent-loss-calculator`)

---

### 4. Category
- **Category ID**: `crypto`
- **Category Name**: `Crypto Calculators`

---

### 5. AMM Model
- **Primary Architecture**: Standard 50/50 Constant-Product Automated Market Maker ($x \cdot y = k$) spanning the full $[0, \infty)$ price curve (Uniswap v2, SushiSwap, PancakeSwap, Balancer 50/50 equivalent).

---

### 6. Impermanent-Loss Methodology
- Evaluates the divergence in portfolio value between holding tokens in a wallet versus supplying them to a constant-product AMM:
  $$\text{IL Factor} = \frac{2 \sqrt{r}}{1 + r}$$
  $$\text{Impermanent Loss } \% = (\text{IL Factor} - 1) \times 100$$
- Where $r$ is the relative price ratio. The formula is completely symmetric ($r=2.0$ and $r=0.5$ both produce $-5.72\%$ IL).

---

### 7. HODL Methodology
- The HODL benchmark measures the portfolio value if the initial deposited quantities of Token A ($A_0$) and Token B ($B_0$) were held outside the pool at current market prices:
  $$V_{\text{HODL}} = A_0 \cdot P_{A1} + B_0 \cdot P_{B1}$$

---

### 8. LP Position Methodology
- Under automated arbitrage rebalancing, the smart contract adjusts token reserves so that $A_1 = A_0 / \sqrt{r}$ and $B_1 = B_0 \cdot \sqrt{r}$.
- The pure pool position value without fees is:
  $$V_{\text{LP}} = A_1 \cdot P_{A1} + B_1 \cdot P_{B1} = V_{\text{HODL}} \times \text{IL Factor}$$
- Pure Impermanent Loss Dollar Drag: $\text{Pure IL (\$) } = V_{\text{LP}} - V_{\text{HODL}}$.

---

### 9. Constant-Product Methodology
- The invariant $k = A_0 \cdot B_0$ is strictly preserved across all price divergence scenarios:
  $$k_1 = A_1 \cdot B_1 = \left(\frac{A_0}{\sqrt{r}}\right) \cdot (B_0 \sqrt{r}) = A_0 \cdot B_0 = k_0$$

---

### 10. Fee Methodology
- Supports both **Annualized Fee APR (%)** accrual over a customizable holding duration (in calendar days) and **Direct Fee Revenue (\$)** overrides.
- **Fee-Adjusted LP Valuation**:
  $$V_{\text{LP+Fees}} = V_{\text{LP}} + \text{Accumulated Fees}$$
- **Net LP Advantage vs HODL**:
  $$\text{Net LP Advantage} = V_{\text{LP+Fees}} - V_{\text{HODL}} = \text{Pure IL (\$) } + \text{Accumulated Fees}$$
- Pure IL and Fee-Adjusted performance are strictly decoupled in analytical displays.

---

### 11. Break-Even Fee Methodology
- Calculates the exact fee hurdle rate required to eliminate the impermanent loss drag:
  $$\text{Break-Even Fees} = V_{\text{HODL}} - V_{\text{LP}}$$
  $$\text{Break-Even Fee \% of HODL} = \left(\frac{\text{Break-Even Fees}}{V_{\text{HODL}}}\right) \times 100$$
  $$\text{Required Annualized APR \%} = \left(\frac{\text{Break-Even Fees}}{V_0}\right) \times \left(\frac{365}{\text{Holding Days}}\right) \times 100$$

---

### 12. Price-Ratio Methodology
- Supports dual input modes:
  1. **Explicit Spot Prices Mode**: User inputs initial and final prices for Token A and Token B ($P_{A0}, P_{A1}, P_{B0}, P_{B1}$).
  2. **Percentage Price Move Mode**: User configures percentage price shifts ($\% \Delta P_A, \% \Delta P_B$).
- Relative Price Ratio: $r = \frac{P_{A1}/P_{B1}}{P_{A0}/P_{B0}}$.

---

### 13. Data-Source Methodology
- **Scenario Simulation Engine**: Uses deterministic user-entered spot prices, price changes, and fee assumptions.
- Does not claim live API connectivity or fabricate unverified real-time pool metrics.

---

### 14. Reference Sources and Dates
- *Uniswap v2 Core Whitepaper*: Hayden Adams, Noah Zinsmeister, Dan Robinson (2020).
- *Bancor Protocol Technical Report*: Eyal Hertzog, Guy Benartzi, Galia Benartzi (2017).
- *CFA Institute Research*: Automated Market Makers and Decentralized Finance Liquidity Provision (2023).

---

### 15. Assumptions
- 50/50 capital allocation into Token A and Token B upon initial deposit.
- Constant-product AMM bonding curve with infinite price liquidity bounds.
- Constant fee APR yield rate over the specified holding horizon.

---

### 16. Financial/Data Safeguards
- **Zero Fabricated Pool Metrics**: No simulated live TVL, APY, or volume claims.
- **Pure IL Separation**: Pure IL is never conflated with total LP P&L.
- **Mathematical Invariant Verification**: All rebalancing calculations preserve $x \cdot y = k$.
- **Clear Limitations Disclosure**: Explicitly discloses that concentrated liquidity (Uniswap v3) and weighted pools (Balancer) behave differently.

---

### 17. Supported AMM Limitations
- Models standard full-range 50/50 constant-product pools.
- Does not model concentrated liquidity price ticks (Uniswap v3), Stableswap amplification coefficients (Curve), or custom weight pools (80/20 Balancer).

---

### 18. Files Created
1. `src/calculators/crypto/impermanent-loss-calculator.js` — Pure mathematical AMM calculation engine.
2. `src/calculators/configs/impermanent-loss-calculator.config.js` — Educational presets and scenario defaults.
3. `src/calculators/crypto/__tests__/impermanent-loss-calculator.test.js` — 45 dedicated Vitest unit tests.
4. `src/components/calculators/primitives/ImpermanentLossFlagshipWidget.jsx` — Interactive Preact island UI with SVG IL curve, pool rebalancing cards, and sensitivity matrix.
5. `src/components/calculators/ImpermanentLossCalculatorWidget.jsx` — Preact export wrapper.
6. `src/components/content/ImpermanentLossFlagshipLayout.astro` — Astro flagship layout with EEAT case studies, formulas, and LP strategies.
7. `src/content/tools/impermanent-loss-calculator.md` — EEAT content article with WebApplication, BreadcrumbList, and FAQPage JSON-LD schemas.
8. `IMPERMANENT_LOSS_FLAGSHIP_REPORT.md` — This sprint verification report.

---

### 19. Files Modified
1. `src/pages/tools/[category]/[tool]/index.astro` — Wired dynamic route for `impermanent-loss-calculator`.
2. `src/content/tools/crypto-profit-loss-calculator.md` — Added `impermanent-loss-calculator` to `relatedTools`.
3. `src/content/tools/crypto-tax-calculator.md` — Added `crypto/impermanent-loss-calculator` to `relatedTools`.

---

### 20. Dedicated Test Result
- **Command**: `npx vitest run src/calculators/crypto/__tests__/impermanent-loss-calculator.test.js`
- **Result**: **45 / 45 passed (100%)** in 15ms.

---

### 21. Full Vitest Result
- **Command**: `npx vitest run`
- **Result**: **2,674 / 2,674 passed (100%)** across 106 test suites in 8.86s.

---

### 22. Astro Check Result
- **Command**: `npx astro check`
- **Result**: **0 errors, 0 warnings, 83 hints** across 720 files.

---

### 23. Production Build Result
- **Command**: `npm run build`
- **Result**: **152 static pages built** in 21.06s.

---

### 24. Route Verification
- **Verified Route**: `/tools/crypto/impermanent-loss-calculator/index.html` (Generated in `dist/`).

---

### 25. SEO Impact
- Unique title: `"Impermanent Loss Calculator: DeFi Liquidity Pool vs HODL Engine"`
- Meta description: 154 characters ($\le 160$).
- JSON-LD schemas: `WebApplication`, `BreadcrumbList`, and `FAQPage`.
- Clean semantic heading hierarchy (`h1`, `h2`, `h3`, `h4`).

---

### 26. Accessibility Impact
- Explicit form `<label>` associations (`for="id"`).
- Keyboard-navigable sliders, buttons, and high-contrast color tokens.
- ARIA landmark regions.

---

### 27. Performance Impact
- Fast client island hydration via `client:visible`.
- Zero external charting library bloat (native responsive SVG curve).
- Instant sub-millisecond calculation execution.

---

### 28. Architecture/Reuse Impact
- Pure mathematical functions decoupled from UI layers.
- Reused `useUrlSync` hook for shareable URL scenario states.
- Clean integration with existing `FlagshipLayout.astro`.

---

### 29. Known Limitations
- Does not model custom tick ranges for Uniswap v3 concentrated liquidity.
- Does not connect to live RPC endpoints or automated DEX subgraph APIs.

---

### 30. Git Push Status
- **Status**: **NO GIT PUSH PERFORMED** (Strict adherence to instructions).

---

### 31. Updated Flagship Count
- **Completed Flagships**: **94 / 194 (48.5%)**

---

### 32. Remaining Roadmap Count
- **Remaining Flagships**: **100 Flagships**
- **Next Sequentially**: Flagship Calculator **#95** — **Yield Farming APY Calculator** (`/tools/crypto/yield-farming-apy-calculator/`, line 166 in `tool_slugs.csv`).
