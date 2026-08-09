# Flagship Rent vs Buy Calculator Audit Report (Sprint 54)

## 1. What Changed
- Built Flagship Tool #44 (`/tools/loans/rent-vs-buy-calculator`).
- Created pure financial calculation engine `src/calculators/loans/rent-vs-buy-calculator.js` implementing a 30-year multi-asset net worth decision model comparing property purchase equity ($V_{\text{prop}}(y) - L(y) - C_{\text{sell}}(y)$) against renting + down payment lumpsum & monthly cash flow surplus equity SIP accumulation.
- Created configuration module `src/calculators/configs/rent-vs-buy-calculator.config.js`.
- Written 20 reference unit test cases in `src/calculators/loans/__tests__/rent-vs-buy-calculator.test.js`.
- Built Preact UI components `src/components/calculators/primitives/RentVsBuyFlagshipWidget.jsx` and wrapper `src/components/calculators/RentVsBuyCalculatorWidget.jsx`.
- Registered component in `src/components/calculators/registry.js`.
- Built Astro flagship layout `src/components/content/RentVsBuyFlagshipLayout.astro`.
- Updated dynamic routing in `src/pages/tools/[category]/[tool]/index.astro`.
- Created content and SEO document `src/content/tools/rent-vs-buy-calculator.md`.

## 2. Why It Changed
- Fintools Find Sprint 54 objective: Deliver Flagship Tool #44 (Rent vs Buy Calculator) to provide a multi-asset real estate vs equity opportunity cost decision engine.

## 3. Financial Methodology & Tax-Rule Verification
- **Buy Net Worth**:
  $$NW_{\text{Buy}}(y) = V_{\text{property}}(y) - \text{LoanBalance}(y) - C_{\text{selling}}(y) + \text{TaxBenefits}(y)$$
  where $V_{\text{property}}(y) = \text{PropertyPrice} \times (1 + g_{\text{property}})^y$.
- **Rent Net Worth**:
  $$NW_{\text{Rent}}(y) = V_{\text{Lumpsum}}(y) + V_{\text{SIPSurplus}}(y)$$
  where $V_{\text{Lumpsum}}(y)$ is initial cash needed for buying ($D + C_{\text{purchase}}$) invested @ $r_{\text{equity}}\%$, and $V_{\text{SIPSurplus}}(y)$ is monthly cash flow savings $( \text{EMI} + \text{Maintenance} ) - \text{Rent}$ invested in equity SIP @ $r_{\text{equity}}\%$.
- **Tax-Rule Context**: Section 24(b) Home Loan Interest deduction (up to ₹2 Lakhs p.a. for self-occupied property under Old Tax Regime, AY 2025-26) modeled as an optional scenario toggle.

## 4. Financial Accuracy Audit & Verification Matrix

| Case | Scenario Parameter | Input Values | Expected Calculation & Output | Result Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Case A** | Standard ₹75L Property vs ₹25k Rent (20 Yrs @ 5% Prop, 7% Rent Infl, 12% Equity) | Price: ₹75L, Rent: ₹25k | **Net Worth Buy**: ₹1.85 Cr<br>**Net Worth Rent**: ₹2.76 Cr<br>**Winner**: RENTING (+₹90.9L) | PASSED (Down payment & monthly surplus equity compounding outpaces property) |
| **Case B** | High Property Growth (10% Prop, 8% Equity) | Price: ₹75L, Rent: ₹25k | **Net Worth Buy**: ₹4.87 Cr<br>**Net Worth Rent**: ₹1.88 Cr<br>**Winner**: BUYING (+₹2.99 Cr) | PASSED (High property growth outpaces equity) |
| **Case C** | High Equity Return (15% Equity, 5% Prop) | Price: ₹75L, Rent: ₹25k | **Net Worth Rent**: ₹4.89 Cr<br>**Winner**: RENTING (+₹3.04 Cr) | PASSED (High equity return strongly favors renting) |
| **Case D** | Breakeven Detection | Price: ₹75L, 10% Prop | **Breakeven Year**: Year 6 | PASSED (Buy net worth crosses Rent net worth in Year 6) |

## 5. Build Count Reconciliation & Quality Gate Results
- **Unit Tests**: PASSED (`vitest run`). **56 test files passed, 496 total unit tests passed** (including 20 dedicated Rent vs Buy unit tests).
- **Astro Check**: PASSED (`npx astro check`). **0 errors, 0 warnings, 0 hints**.
- **Production Build**: PASSED (`npm run build`). **223 static page routes built successfully**, including `/tools/loans/rent-vs-buy-calculator/index.html`.
- **Regression Verification**: Verified all 43 existing flagship calculators build and function cleanly without regressions.

## 6. Known Limitations
- Model assumes constant annual property appreciation and rent inflation rates over the selected horizon.
