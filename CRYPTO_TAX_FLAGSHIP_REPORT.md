# Flagship Calculator #93: Crypto Tax Calculator Implementation & Verification Report

---

### 1. Calculator Name
- **Display Name**: Crypto Tax Calculator
- **Full Title**: Cryptocurrency Capital Gains & Income Tax Calculator
- **Sub-headline**: Institutional-Grade Multi-Jurisdiction Cost Basis, Holding Period, and Yield Income Tax Engine

---

### 2. Flagship Number
- **Flagship Sequence Number**: **#93 of 194**

---

### 3. Exact Slug
- **URL Path**: `/tools/crypto/crypto-tax-calculator/`
- **Source Identifier**: `tool_slugs.csv` (Line 164: `Crypto Calculators,Crypto Tax Calculator,/tools/crypto-tax-calculator`)

---

### 4. Category
- **Category ID**: `crypto`
- **Category Name**: `Crypto Calculators`

---

### 5. Supported Jurisdictions
1. **Generic Global (`GENERIC`)**: International baseline model with fully customizable short-term and long-term tax rates, holding period thresholds, and ordinary income brackets.
2. **United States (`US`)**: IRS Notice 2014-21 / Form 8949 compliance modeling short-term gains (taxed at ordinary income rates) vs long-term gains (>365 days taxed at preferential 0%/15%/20% rates).
3. **India (`IN`)**: Income Tax Act Section 115BBH enforcing a flat 30% tax (+4% cess = 31.2%) on Virtual Digital Asset (VDA) gains, strict exchange fee deduction disallowance, zero loss set-off, and Section 194S 1% TDS on transfers $\ge$ ₹50,000.
4. **United Kingdom (`UK`)**: HMRC Cryptoassets Manual model applying 10% basic / 20% higher rate Capital Gains Tax above the £3,000 Annual Exempt Amount (AEA).
5. **Germany (`DE`)**: Einkommensteuergesetz (EStG § 23) model where private cryptocurrency sales held for more than 1 year (>365 days) are **100% Tax-Free**, and short-term sales under €1,000 are covered by the statutory *Freigrenze* exemption.
6. **Australia (`AU`)**: ATO Capital Gains Tax model providing individual Australian residents with a **50% CGT discount** on crypto held for 12+ months ($\ge 365$ days).

---

### 6. Tax Methodology
The engine operates on a modular two-tier framework distinguishing between **Disposal Events (Capital Gains Tax)** and **Receipt Events (Ordinary Income Tax)**:
- **Capital Gains Tax**: Evaluated on net proceeds exceeding adjusted cost basis upon fiat sales or crypto-to-crypto swaps.
- **Ordinary Income Tax**: Evaluated on the Fair Market Value (FMV) of newly acquired tokens upon receipt from proof-of-stake validation, mining, or protocol airdrops.
- **Total Tax Liability**: $\text{Total Estimated Tax} = \text{Capital Gains Tax} + \text{Ordinary Income Tax} + \text{Subsequent Disposal CGT}$.

---

### 7. Capital-Gains Methodology
- Realized Capital Gain/Loss formulation:
  $$\text{Realized Gain} = \text{Net Disposal Proceeds} - \text{Adjusted Cost Basis}$$
- Where:
  $$\text{Net Proceeds} = \text{Gross Fiat Consideration} - \text{Allowable Disposal Fees}$$
- In profitable disposal events ($\text{Realized Gain} > 0$), taxable capital gains are computed after applying statutory exemptions and discounts. In loss scenarios ($\text{Realized Gain} \le 0$), capital gains tax is strictly \$0, preserving the capital loss for tracking.

---

### 8. Cost-Basis Methodology
- **Single-Lot Mode**: $\text{Cost Basis} = (\text{Quantity} \times \text{Acquisition Price}) + \text{Allowable Acquisition Fees}$.
- **Multi-Lot Inventory Mode**: Automatically tracks lots, depleted tranches, and remaining unsold units.
- **Reward Income Cost Basis**: For staking, mining, and airdrops, the recognized Fair Market Value upon receipt is locked in as the opening cost basis for any subsequent disposals.
- **India Section 115BBH Compliance**: Transaction and exchange fees are strictly excluded from cost basis under Indian statutory rules.

---

### 9. Transaction-Fee Methodology
- **Allowable Jurisdictions (US, UK, DE, AU, Generic)**:
  - Acquisition trading fees increase total cost basis.
  - Disposal trading fees reduce gross proceeds.
  - Fees paid are tracked without double-counting.
- **Disallowed Jurisdictions (India)**:
  - Exchange commissions, network gas, and transfer fees cannot reduce taxable capital gains under strict Section 115BBH interpretation.

---

### 10. Staking/Mining Income Methodology
- **Dominion & Control Principle (Rev. Rul. 2023-14 / HMRC CRYPTO21200)**:
  - $\text{Ordinary Income} = \text{Reward Token Quantity} \times \text{Spot FMV at Receipt}$.
  - $\text{Income Tax} = \text{Ordinary Income} \times (\text{Marginal Income Tax Rate} / 100)$.
- **Subsequent Sale Modeling**:
  - If reward tokens are sold later at an exit price:
    $$\text{Subsequent Gain} = (\text{Reward Quantity} \times \text{Exit Price}) - \text{Recognized Income Cost Basis}$$
  - Holding period is measured from the initial reward receipt date to the subsequent sale date.

---

### 11. Lot-Selection Methodology
1. **FIFO (First-In, First-Out)**: Depletes oldest acquired lots first chronologically.
2. **LIFO (Last-In, First-Out)**: Depletes most recently acquired lots first.
3. **HIFO (Highest-In, First-Out)**: Depletes highest purchase cost lots first to minimize current-year taxable gain.
4. **Specific Identification**: Matches individual transaction lots directly.

---

### 12. Holding-Period Methodology
- Holding period is calculated as the exact calendar day difference between acquisition date and disposal date:
  $$\Delta t = \text{floor}\left(\frac{\text{Date}_{\text{sell}} - \text{Date}_{\text{buy}}}{1000 \times 60 \times 60 \times 24}\right)$$
- If $\Delta t > \text{threshold}$ (typically 365 days / 12 months), the transaction is classified as **Long-Term**, unlocking statutory rate discounts (15% LTCG in US, 50% discount in Australia, 100% tax-free in Germany).

---

### 13. Tax-Rate Methodology
- Pre-configured with official statutory baseline rates and brackets for major economies.
- Includes expandable override controls allowing users to enter custom Short-Term, Long-Term, and Ordinary Income tax percentages.

---

### 14. Tax-Year/Source Methodology
- **Reference Tax Year**: 2025–2026 Assessment Baseline.
- **US**: IRS Notice 2014-21, Rev. Rul. 2019-24, Rev. Rul. 2023-14 (Form 8949 / Schedule D).
- **India**: Income Tax Act, 1961 as amended by Finance Act 2022–2024 (Sections 115BBH, 194S, 56(2)(x)).
- **United Kingdom**: HMRC Cryptoassets Manual (CRYPTO20000, Section 104 Pooling).
- **Germany**: Federal Ministry of Finance (BMF Guidance on Cryptocurrency Taxation 2022, EStG § 23 Abs. 1 Nr. 2).
- **Australia**: Australian Taxation Office (ATO Crypto Asset Guidelines, ITAA 1997 Division 115).

---

### 15. Reference Sources and Dates
- *US IRS*: Notice 2014-21 (Virtual Currency Guidance), Rev. Rul. 2023-14 (Staking Rewards).
- *India Ministry of Finance*: Section 115BBH & 194S (Effective April 1, 2022 / July 1, 2022).
- *UK HMRC*: Cryptoassets Manual CRYPTO20000 (Updated 2024–2026).
- *German BMF*: Guidance on Income Tax Treatment of Virtual Currencies (May 10, 2022).
- *Australian ATO*: Web Guidance on Cryptocurrency and Capital Gains Tax (Reviewed 2025).

---

### 16. Assumptions
- User inputs accurate historical spot prices, receipt dates, and transaction fees.
- Standard individual tax residency applies without state/provincial surcharges unless modeled in statutory rates.
- Crypto-to-crypto swaps are treated as disposals of the original asset at spot Fair Market Value.

---

### 17. Financial/Legal Safeguards
- **Clear Disclaimers**: Prominent notices throughout the widget and layout stating that results are educational estimates and do not constitute formal tax or legal advice.
- **Zero Loss Taxation**: Losses never produce positive tax liabilities.
- **Zero Fabricated Tax Laws**: Rates, exemptions, and thresholds strictly adhere to published statutory guidelines.
- **Fee Integrity**: Fees are never double-counted and comply with local deductibility laws.

---

### 18. Files Created
1. `src/data/tax-rates/cryptoTaxRules.js` — Multi-jurisdiction statutory rules, tax rates, exemption limits, and transaction classifications.
2. `src/calculators/crypto/crypto-tax-calculator.js` — Pure calculation engine supporting single-lot, multi-lot matching, staking income, and tax liability solver.
3. `src/calculators/configs/crypto-tax-calculator.config.js` — Configuration presets and default values.
4. `src/calculators/crypto/__tests__/crypto-tax-calculator.test.js` — 45 dedicated Vitest unit tests.
5. `src/components/calculators/primitives/CryptoTaxFlagshipWidget.jsx` — Interactive Preact UI island widget with jurisdiction switching, multi-lot builder, and SVG charts.
6. `src/components/calculators/CryptoTaxCalculatorWidget.jsx` — Preact export wrapper.
7. `src/components/content/CryptoTaxFlagshipLayout.astro` — Astro flagship layout with EEAT case studies, statutory formulas, and strategic tax planning guides.
8. `src/content/tools/crypto-tax-calculator.md` — EEAT content article with WebApplication, BreadcrumbList, and FAQPage JSON-LD schemas.
9. `CRYPTO_TAX_FLAGSHIP_REPORT.md` — This comprehensive sprint verification report.

---

### 19. Files Modified
1. `src/pages/tools/[category]/[tool]/index.astro` — Wired `CryptoTaxFlagshipLayout` dynamic route branch.
2. `src/content/tools/crypto-profit-loss-calculator.md` — Added `crypto-tax-calculator` to `relatedTools`.
3. `src/content/tools/dca-calculator.md` — Added `crypto/crypto-tax-calculator` to `relatedTools`.
4. `src/content/tools/staking-rewards-calculator.md` — Added `crypto/crypto-tax-calculator` to `relatedTools`.

---

### 20. Dedicated Test Result
- **Command**: `npx vitest run src/calculators/crypto/__tests__/crypto-tax-calculator.test.js`
- **Result**: **45 / 45 passed (100%)** in 11ms.

---

### 21. Full Vitest Result
- **Command**: `npx vitest run`
- **Result**: **2,629 / 2,629 passed (100%)** across 105 test suites in 8.72s.

---

### 22. Astro Check Result
- **Command**: `npx astro check`
- **Result**: **0 errors, 0 warnings, 81 hints** across 714 files.

---

### 23. Production Build Result
- **Command**: `npm run build`
- **Result**: **151 static pages built** in 19.98s.

---

### 24. Route Verification
- **Verified Route**: `/tools/crypto/crypto-tax-calculator/index.html` (Generated in `dist/`).

---

### 25. SEO Impact
- Unique title: `"Crypto Tax Calculator: Multi-Jurisdiction Capital Gains & Income Engine"`
- Meta description: 156 characters ($\le 160$).
- JSON-LD schemas: `WebApplication`, `BreadcrumbList`, and `FAQPage`.
- Clean semantic heading hierarchy (`h1`, `h2`, `h3`, `h4`).

---

### 26. Accessibility Impact
- Explicit form `<label>` associations (`for="id"`).
- High-contrast typography and semantic color tokens (`text-emerald-600`, `text-rose-600`).
- Keyboard-navigable controls and ARIA landmark regions.

---

### 27. Performance Impact
- Preact client island loaded via `client:visible`.
- Zero external runtime heavy libraries or API fetch latency.
- Fast interactive execution (<1ms calculation time).

---

### 28. Architecture/Reuse Impact
- Pure mathematical functions decoupled from UI layers.
- Reused `useUrlSync` hook for shareable URL scenario states.
- Clean integration with existing `FlagshipLayout.astro`.

---

### 29. Known Limitations
- Educational modeling tool; does not connect directly to exchange APIs or wallet public keys via OAuth.
- Does not model individual taxpayer Alternative Minimum Tax (AMT) or corporate business entities.

---

### 30. Git Push Status
- **Status**: **NO GIT PUSH PERFORMED** (Strict adherence to instructions).

---

### 31. Updated Flagship Count
- **Completed Flagships**: **93 / 194 (47.9%)**

---

### 32. Remaining Roadmap Count
- **Remaining Flagships**: **101 Flagships**
- **Next Sequentially**: Flagship Calculator **#94** — **Impermanent Loss Calculator** (`/tools/crypto/impermanent-loss-calculator/`, line 165 in `tool_slugs.csv`).
