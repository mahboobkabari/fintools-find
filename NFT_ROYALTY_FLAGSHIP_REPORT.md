# Flagship Calculator #98: NFT Royalty Calculator Sprint Report

## 1. Executive Summary
- **Calculator Name**: NFT Royalty Calculator (Creator Earnings & Secondary Resale Fee Engine)
- **Flagship ID**: #98 / 194
- **Slug**: `/tools/crypto/nft-royalty-calculator/`
- **Category**: `crypto` (Crypto Calculators)
- **Status**: Complete & Verified (Production Ready)
- **Quality Gates**:
  - Dedicated Engine Unit Tests: 45 / 45 passed (100%)
  - Full Vitest Test Suite: 2,854 / 2,854 passed (100%) across 110 test suites
  - Astro Diagnostics: 0 errors, 0 warnings, 92 hints across 744 project files
  - Static Production Build: 156 static pages built cleanly
  - Route Dispatcher: Wired in `src/pages/tools/[category]/[tool]/index.astro`
  - Cross-Tool Links: Connected bidirectionally across crypto calculation suite

---

## 2. Mathematical Engine & Royalty Methodology
- **Gross Sale Price**:
  $$\text{Sale Price} = P$$
- **Gross Creator Royalty (Gross Basis)**:
  $$R_{\text{gross}} = P \times \left(\frac{\text{Royalty \%}}{100}\right)$$
- **Gross Creator Royalty (Net Proceeds Basis)**:
  $$R_{\text{gross}} = \max\left(0, P - \text{MarketplaceFee} - F_{\text{other}}\right) \times \left(\frac{\text{Royalty \%}}{100}\right)$$
- **Marketplace Commission**:
  $$\text{Marketplace Fee} = P \times \left(\frac{\text{MarketplaceFee \%}}{100}\right)$$
- **Expected Royalty Received (Marketplace Enforcement Assumption)**:
  $$R_{\text{expected}} = R_{\text{gross}} \times \left(\frac{\text{Enforcement \%}}{100}\right)$$
- **Lost / Unenforced Royalty**:
  $$R_{\text{lost}} = \max(0, R_{\text{gross}} - R_{\text{expected}})$$
- **Secondary Seller Net Proceeds**:
  $$\text{Seller Net} = \max\left(0, P - R_{\text{expected}} - \text{MarketplaceFee} - F_{\text{other}}\right)$$
- **Primary Mint Creator Proceeds**:
  $$\text{Creator Net (Primary)} = \max\left(0, P - \text{MarketplaceFee} - F_{\text{other}}\right)$$
- **Total Transaction Friction**:
  $$\text{Total Friction} = R_{\text{expected}} + \text{MarketplaceFee} + F_{\text{other}}$$
  $$\text{Effective Friction \%} = \left(\frac{\text{Total Friction}}{P}\right) \times 100$$
- **Effective Royalty Rate**:
  $$\text{Effective Royalty \%} = \left(\frac{R_{\text{expected}}}{P}\right) \times 100$$

---

## 3. Multi-Sale Resale Schedule Model
- **Cumulative Metrics**:
  $$\text{Total Gross Volume} = \sum_{i=1}^{M} P_i$$
  $$\text{Total Expected Royalties} = \sum_{i=1}^{M} R_{\text{expected}, i}$$
  $$\text{Average Royalty per Resale} = \frac{\text{Total Expected Royalties}}{M}$$
  $$\text{Effective Lifetime Royalty Rate} = \left(\frac{\text{Total Expected Royalties}}{\text{Total Gross Volume}}\right) \times 100$$

---

## 4. Educational Presets
1. **Standard 5% Royalty**: 2.0 ETH sale, 5.0% creator royalty, 2.5% marketplace fee, 100% enforcement.
2. **Primary Mint / Initial Sale**: 1.0 ETH initial collection mint, 100% net to creator minus 2.5% platform fee.
3. **High Marketplace Fee (5%)**: 10.0 SOL sale, 7.5% royalty, 5.0% curated platform fee.
4. **Creator Lifetime Resales**: 5-step compounding resale trajectory simulating floor price appreciation.
5. **Zero-Royalty Marketplace**: 2.5 ETH trade with 0% enforcement modeling optional tipping bypass.
6. **Enforcement Risk (50%)**: 4.0 ETH trade with 50% enforcement probability modeling mixed secondary liquidity.

---

## 5. Multi-Way Scenario Sensitivity Analysis
- **Price Sensitivity**: -50% Bear Market, -25% Dip, 0% Spot, +25% Appreciation, +50% Bull Run, +100% 2x Rally.
- **Royalty Rate Sensitivity**: 0%, 2.5%, 5.0%, 7.5%, 10.0%.
- **Enforcement Sensitivity**: 0% (Zero royalty), 25% (Low), 50% (Mixed), 75% (High), 100% (Full).
- **Volume Scenarios**: 1, 5, 10, 25, 50 resales with cumulative volume and royalties.

---

## 6. Multi-Asset & Multi-Currency Quoting Support
- **Crypto Denominations**: ETH (Ξ), SOL (◎), POL/MATIC (POL), BNB (BNB), AVAX (AVAX), USD ($).
- **Fiat Quote Currencies**: USD ($), EUR (€), GBP (£), INR (₹), CAD (C$), AUD (A$), AED (د.إ), SGD (S$), JPY (¥).

---

## 7. Marketplace & Regulatory Safeguards
- **No Universal Enforcement Claims**: The engine and UI explicitly highlight that creator royalties are not guaranteed by blockchain protocols, and that enforcement is an off-chain/marketplace decision.
- **No Fabricated Live Data**: Uses user-specified inputs and deterministic pricing multipliers.
- **Clear Separation**: Distinguishes between configured gross royalties, expected collections, and unenforced/lost royalties.

---

## 8. Artifacts and Source Files Created / Modified
- `src/calculators/crypto/nft-royalty-calculator.js`: Pure deterministic calculation engine.
- `src/calculators/configs/nft-royalty-calculator.config.js`: Configuration, metadata, and 6 educational presets.
- `src/calculators/crypto/__tests__/nft-royalty-calculator.test.js`: 45 dedicated unit tests covering math, schedules, fees, and edge cases.
- `src/components/calculators/primitives/NftRoyaltyFlagshipWidget.jsx`: Preact UI widget with decision hero, proceeds breakdown bar, sensitivity tabs, multi-sale schedule, and URL sync.
- `src/components/calculators/NftRoyaltyCalculatorWidget.jsx`: Preact wrapper component.
- `src/components/content/NftRoyaltyFlagshipLayout.astro`: Astro layout with timeline, user personas, formulas, case studies, and strategic guidelines.
- `src/content/tools/nft-royalty-calculator.md`: Comprehensive EEAT markdown content with Schema.org JSON-LD definitions.
- `src/pages/tools/[category]/[tool]/index.astro`: Dynamic flagship routing dispatcher.
- `src/content/tools/token-vesting-calculator.md`: Updated cross-links to include NFT royalty calculator.
- `src/content/tools/gas-fee-calculator.md`: Updated cross-links to include NFT royalty calculator.

---

## 9. Quality Gates & Verification Summary
| Verification Step | Target / Threshold | Result | Status |
|---|---|---|---|
| Dedicated Unit Tests | $\ge 40$ unit tests | 45 / 45 passed (20ms) | PASSED |
| Full Vitest Suite | 100% test pass rate | 2,854 / 2,854 passed (110 test files) | PASSED |
| Astro Diagnostics | 0 errors, 0 warnings | 0 errors, 0 warnings (92 hints across 744 files) | PASSED |
| Static Build Generation | Clean build | 156 static HTML pages built | PASSED |
| Route Accessibility | Valid HTML & Schemas | `dist/tools/crypto/nft-royalty-calculator/` generated | PASSED |
| Git Push Policy | No unauthorized push | Local changes only, 0 push | VERIFIED |

---

## 10. Next Roadmap Milestone
- **Next Sequential Tool**: Flagship #99 — **Salary Calculator**
- **Source**: `tool_slugs.csv` Line 170
- **Category**: `salary` (Personal/Salary Calculators)
- **Expected Slug**: `/tools/salary/salary-calculator/`
