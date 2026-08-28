# Flagship Calculator #95: Yield Farming APY Calculator Implementation & Verification Report

---

### 1. Calculator Name
- **Display Name**: Yield Farming APY Calculator
- **Full Title**: Yield Farming APY Calculator (DeFi Liquidity Mining & Compounding Engine)
- **Sub-headline**: Institutional Compounding Frequencies, Multi-Tier Protocol Fee Decomposition, Reward Token Volatility Sensitivity, and Break-Even Yield Simulator

---

### 2. Flagship Number
- **Flagship Sequence Number**: **#95 of 194**

---

### 3. Exact Slug
- **URL Path**: `/tools/crypto/yield-farming-apy-calculator/`
- **Source Identifier**: `tool_slugs.csv` (Line 166: `Crypto Calculators,Yield Farming APY Calculator,/tools/yield-farming-apy-calculator`)

---

### 4. Category
- **Category ID**: `crypto`
- **Category Name**: `Crypto Calculators`

---

### 5. Methodology
- Models decentralized finance (DeFi) yield farming, staking pools, and liquidity mining reward schedules.
- Seamlessly handles bidirectional APR $\leftrightarrow$ APY conversion, discrete compounding period accrual, multi-tier protocol fees (deposit, performance, withdrawal), volatile reward-token price depreciation, and optional LP impermanent loss drag.

---

### 6. APR/APY Formulas
- **APR to APY Conversion**:
  $$\text{APY} = \left(1 + \frac{\text{APR}}{m}\right)^m - 1$$
- **APY to APR Conversion**:
  $$\text{APR} = m \times \left[(1 + \text{APY})^{1/m} - 1\right]$$
- Where $m$ is compounding periods per year ($m=365$ for daily, $m=52$ for weekly, $m=12$ for monthly, $m=4$ for quarterly, $m=1$ for annual, $m=0$ for simple interest, and $m=\infty$ for continuous compounding: $\text{APY} = e^{\text{APR}} - 1$).

---

### 7. Compounding Methodology
- Computes gross yield over arbitrary duration $t$ (in years, $t = \text{days} / 365$):
  - **Discrete Compounding ($m > 0$)**:
    $$\text{Ending Gross Balance} = V_{\text{dep}} \times \left(1 + \frac{\text{APR}}{100 \cdot m}\right)^{m \cdot t}$$
    $$\text{Base Gross Yield} = \text{Ending Gross Balance} - V_{\text{dep}}$$
  - **Simple Interest ($m = 0$)**:
    $$\text{Base Gross Yield} = V_{\text{dep}} \times \left(\frac{\text{APR}}{100}\right) \times t$$
  - **Continuous Compounding ($m = \infty$)**:
    $$\text{Ending Gross Balance} = V_{\text{dep}} \times e^{(\text{APR}/100) \cdot t}$$

---

### 8. Yield Methodology
- Quantifies both gross and net financial yields:
  - **Net Principal Deposited**: $V_{\text{dep}} = V_0 - F_{\text{dep}}$
  - **Gross Yield Accumulation**: Earned through base token swap fees or liquidity emissions.
  - **Periodic Yield Equivalents**: Daily gross yield, monthly projected yield, and annualized uncompounded equivalent.

---

### 9. Fee Methodology
- Models three distinct protocol fee layers without double-counting:
  1. **Deposit Fee ($F_{\text{dep}}$)**: $V_0 \times (f_{\text{dep}} / 100)$ deducted upfront from working capital.
  2. **Performance Fee ($F_{\text{perf}}$)**: $\text{Adjusted Gross Yield} \times (f_{\text{perf}} / 100)$ deducted from harvested yield.
  3. **Withdrawal Fee ($F_{\text{with}}$)**: $(V_{\text{dep}} + \text{Yield}_{\text{net\_perf}}) \times (f_{\text{with}} / 100)$ deducted upon exit.
  - **Total Fees Paid**: $F_{\text{total}} = F_{\text{dep}} + F_{\text{perf}} + F_{\text{with}}$
  - **Fee Drag %**: $(F_{\text{total}} / \text{Gross Yield}) \times 100$

---

### 10. Reward-Token Methodology
- Converts base gross yield into physical reward tokens earned:
  $$N_R = \frac{\text{Base Gross Yield}}{P_{\text{initial}}}$$

---

### 11. Price Sensitivity Methodology
- When reward assets are volatile, values harvested tokens at final market spot price $P_{\text{final}}$:
  $$\text{Adjusted Gross Yield} = N_R \times P_{\text{final}}$$
  $$\text{Reward Token Value Impact} = \text{Adjusted Gross Yield} - \text{Base Gross Yield}$$
- Quantifies how hyper-inflationary reward token collapse (-50% to -80%) directly reduces fiat ROI despite high nominal APRs.

---

### 12. Break-Even Methodology
- **Break-Even Gross Yield**:
  $$\text{Required Yield} = \frac{F_{\text{dep}} + V_{\text{dep}} \cdot (f_{\text{with}} / 100)}{(1 - f_{\text{perf}} / 100) \cdot (1 - f_{\text{with}} / 100)}$$
- **Break-Even Annual APR %**: Minimum annualized APR needed to overcome fee drag over the specified farming duration.
- **Break-Even Reward Token Price**: The minimum token spot price upon harvest required to prevent net financial loss.

---

### 13. Data-Source Methodology
- **Deterministic Scenario Engine**: Pure user-entered inputs and explicit mathematical formulas.
- Does not connect to live blockchain subgraphs or fabricate unverified real-time protocol statistics.

---

### 14. Assumptions
- Constant APR/APY yield throughout the duration.
- Reinvested rewards compound at the same constant interest rate.
- 365-day Gregorian calendar year basis.

---

### 15. Financial Safeguards
- **Zero Fabricated Live Data**: No fake TVL, APY, volume, or live price feeds.
- **Strict Decoupling of Yield vs IL**: Impermanent loss from LP tokens is kept distinct from pure farming yield.
- **Fee Integrity**: Deposit fees reduce working principal upfront; performance fees only apply to earned profit.
- **Clear Disclosures**: Prominently highlights smart contract, liquidation, and token depreciation risks.

---

### 16. Limitations
- Does not calculate network gas costs (EVM/Solana transaction gas).
- Does not model dynamic reward emission halving schedules or custom lockup vesting cliffs.

---

### 17. Files Created
1. `src/calculators/crypto/yield-farming-apy-calculator.js` — Pure financial calculation engine.
2. `src/calculators/configs/yield-farming-apy-calculator.config.js` — Configuration defaults and 6 educational scenario presets.
3. `src/calculators/crypto/__tests__/yield-farming-apy-calculator.test.js` — 45 dedicated Vitest unit tests.
4. `src/components/calculators/primitives/YieldFarmingApyFlagshipWidget.jsx` — Interactive Preact island UI with compounding matrix and fee drag analytics.
5. `src/components/calculators/YieldFarmingApyCalculatorWidget.jsx` — Preact export wrapper.
6. `src/components/content/YieldFarmingApyFlagshipLayout.astro` — Astro flagship layout with EEAT case studies, formulas, and strategies.
7. `src/content/tools/yield-farming-apy-calculator.md` — Comprehensive EEAT content article with WebApplication, BreadcrumbList, and FAQPage JSON-LD schemas.
8. `YIELD_FARMING_APY_FLAGSHIP_REPORT.md` — This sprint verification report.

---

### 18. Files Modified
1. `src/pages/tools/[category]/[tool]/index.astro` — Wired dynamic route for `yield-farming-apy-calculator`.
2. `src/content/tools/staking-rewards-calculator.md` — Added `yield-farming-apy-calculator` to `relatedTools`.
3. `src/content/tools/impermanent-loss-calculator.md` — Added `yield-farming-apy-calculator` to `relatedTools`.

---

### 19. Dedicated Tests
- **Command**: `npx vitest run src/calculators/crypto/__tests__/yield-farming-apy-calculator.test.js`
- **Result**: **45 / 45 passed (100%)** in 10ms.

---

### 20. Full Vitest
- **Command**: `npx vitest run`
- **Result**: **2,719 / 2,719 passed (100%)** across 107 test suites in 8.74s.

---

### 21. Astro Check
- **Command**: `npx astro check`
- **Result**: **0 errors, 0 warnings, 84 hints** across 726 files.

---

### 22. Production Build
- **Command**: `npm run build`
- **Result**: **153 static pages built** in 35.62s.

---

### 23. Route Verification
- **Verified Route**: `/tools/crypto/yield-farming-apy-calculator/index.html` (Generated in `dist/`).

---

### 24. SEO Impact
- Unique title: `"Yield Farming APY Calculator: DeFi Liquidity Mining & Compounding Engine"`
- Meta description: 156 characters ($\le 160$).
- Structured data: `WebApplication`, `BreadcrumbList`, and `FAQPage` JSON-LD schemas.
- Clean semantic heading hierarchy (`h1`, `h2`, `h3`, `h4`).

---

### 25. Accessibility Impact
- Explicit form `<label>` associations (`for="id"`).
- Keyboard-navigable buttons, range sliders, and dropdown selectors.
- ARIA landmark regions.

---

### 26. Performance Impact
- Fast client island hydration via `client:visible`.
- Zero external charting or heavyweight numerical library dependencies.
- Sub-millisecond calculation response times.

---

### 27. Architecture/Reuse Impact
- Pure mathematical functions decoupled from UI layers.
- Seamless reuse of Impermanent Loss math engine from Flagship #94 for LP farming mode.
- Reused `useUrlSync` hook for shareable URL scenario states.

---

### 28. Known Limitations
- Does not connect to live RPC nodes or automated DEX subgraphs.
- Does not model gas fees or complex locked ve-token boosting mechanics.

---

### 29. Git Push Status
- **Status**: **NO GIT PUSH PERFORMED** (Strict adherence to instructions).

---

### 30. Updated Roadmap Count
- **Completed Flagships**: **95 / 194 (49.0%)**
- **Remaining Flagships**: **99 Flagships**
- **Next Sequentially**: Flagship Calculator **#96** — **Gas Fee Calculator** (`/tools/crypto/gas-fee-calculator/`, line 167 in `tool_slugs.csv`).
