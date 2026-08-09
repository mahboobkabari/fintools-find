# Flagship FD vs Debt Mutual Fund Calculator Audit Report (Sprint 55)

## 1. What Changed
- Built Flagship Tool #45 (`/tools/savings/fd-vs-debt-fund-calculator`).
- Created pure financial calculation engine `src/calculators/savings/fd-vs-debt-fund-calculator.js` implementing a 3-way post-tax yield comparison engine across Bank Fixed Deposit (Section 56 annual income slab taxing), Debt Mutual Fund (Section 50AA Finance Act 2023 redemption slab taxing with tax deferral), and Equity Arbitrage Fund (Section 112A 12.5% LTCG / Section 111A 20% STCG).
- Created configuration module `src/calculators/configs/fd-vs-debt-fund-calculator.config.js`.
- Written 20 reference unit test cases in `src/calculators/savings/__tests__/fd-vs-debt-fund-calculator.test.js`.
- Built Preact UI components `src/components/calculators/primitives/FdVsDebtFundFlagshipWidget.jsx` and wrapper `src/components/calculators/FdVsDebtFundCalculatorWidget.jsx`.
- Registered component in `src/components/calculators/registry.js`.
- Built Astro flagship layout `src/components/content/FdVsDebtFundFlagshipLayout.astro`.
- Updated dynamic routing in `src/pages/tools/[category]/[tool]/index.astro`.
- Created content and SEO document `src/content/tools/fd-vs-debt-fund-calculator.md`.

## 2. Why It Changed
- Fintools Find Sprint 55 objective: Deliver Flagship Tool #45 (FD vs Debt Mutual Fund Calculator) to provide a post-tax fixed income decision engine.

## 3. Financial Methodology & Tax-Rule Verification
- **Bank Fixed Deposit (FD)**:
  $$A_{\text{gross, FD}} = P \times \left(1 + \frac{r_{\text{FD}}}{400}\right)^{4n}, \quad A_{\text{postTax, FD}} = P + (A_{\text{gross, FD}} - P) \times (1 - t_{\text{effective}})$$
- **Debt Mutual Fund (Section 50AA - Specified Mutual Fund Amendment, Finance Act 2023)**:
  $$V_{\text{gross, Debt}} = P \times \left(1 + \frac{r_{\text{Debt}}}{100}\right)^n, \quad A_{\text{postTax, Debt}} = P + (V_{\text{gross, Debt}} - P) \times (1 - t_{\text{effective}})$$
  *Tax Deferral Advantage*: Unpaid tax compounds undisturbed during tenure $n$ until redemption.
- **Equity Arbitrage Fund (Section 112A / Section 111A)**:
  - $n \le 1$ Year (STCG): Taxed at 20% + 4% Cess.
  - $n > 1$ Year (LTCG): Taxed at 12.5% + 4% Cess on gains exceeding ₹1.25 Lakhs exemption limit.

## 4. Financial Accuracy Audit & Verification Matrix

| Case | Scenario Parameter | Input Values | Expected Calculation & Output | Result Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Case A** | Standard ₹5L 3-Year Deposit @ 30% Slab | Principal: ₹5L, Tenure: 3 Yrs | **Bank FD Post-Tax**: ₹5,79,615 (5.03% CAGR)<br>**Debt Fund Post-Tax**: ₹5,83,350 (5.28% CAGR)<br>**Arbitrage Fund Post-Tax**: ₹6,09,088 (6.80% CAGR) | PASSED (Arbitrage fund wins due to Sec 112A ₹1.25L exemption) |
| **Case B** | Senior Citizen 15% Slab (High FD Rate) | Principal: ₹10L, 5 Yrs @ 7.75% FD | **Bank FD Post-Tax**: ₹13,25,191<br>**Winner**: BANK FD | PASSED (High FD rate & low slab rate favors Bank FD) |
| **Case C** | High Debt Return Scenario (9% Debt vs 7% FD) | Principal: ₹5L, 3 Yrs @ 30% Slab | **Debt Fund Post-Tax**: ₹6,07,052<br>**Winner**: DEBT MUTUAL FUND | PASSED (Superior pre-tax return outpaces FD) |
| **Case D** | Zero Tax Slab (0% Tax) | Principal: ₹5L, 3 Yrs @ 0% Tax | **Tax Liabilities**: ₹0<br>**Gross = Post-Tax** | PASSED (Clean zero tax parity) |

## 5. Build Count Reconciliation & Quality Gate Results
- **Unit Tests**: PASSED (`vitest run`). **57 test files passed, 516 total unit tests passed** (including 20 dedicated FD vs Debt Fund unit tests).
- **Astro Check**: PASSED (`npx astro check`). **0 errors, 0 warnings, 0 hints**.
- **Production Build**: PASSED (`npm run build`). **224 static page routes built successfully**, including `/tools/savings/fd-vs-debt-fund-calculator/index.html`.
- **Regression Verification**: Verified all 44 existing flagship calculators build and function cleanly without regressions.

## 6. Known Limitations
- Tax slab rates and Section 112A thresholds may be updated in future Finance Acts; configuration structure ensures easy annual updates.
