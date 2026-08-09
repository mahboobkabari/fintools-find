# Flagship Atal Pension Yojana (APY) Calculator Audit Report (Sprint 48)

## 1. What Changed
- Built Flagship Tool #38 (`/tools/retirement/apy-calculator`).
- Created pure financial calculation engine `src/calculators/retirement/apy-calculator.js` implementing PFRDA statutory contribution table lookups for subscriber entry ages 18 to 40 years across 5 guaranteed pension tiers (₹1k, ₹2k, ₹3k, ₹4k, ₹5k/mo), auto-debit frequency equivalents (monthly, quarterly, half-yearly), total cumulative employee contributions over working years (up to 42 years), statutory return of pension corpus to nominee upon death (up to ₹8,50,000), 5% inflation-adjusted real pension at age 60, and year-by-year cumulative contribution schedules.
- Created configuration module `src/calculators/configs/apy-calculator.config.js`.
- Written 15 reference unit test cases in `src/calculators/retirement/__tests__/apy-calculator.test.js`.
- Built Preact UI components `src/components/calculators/primitives/ApyFlagshipWidget.jsx` and wrapper `src/components/calculators/ApyCalculatorWidget.jsx`.
- Registered component in `src/components/calculators/registry.js`.
- Built Astro flagship layout `src/components/content/ApyFlagshipLayout.astro`.
- Updated dynamic routing in `src/pages/tools/[category]/[tool]/index.astro`.
- Created content and SEO document `src/content/tools/apy-calculator.md`.

## 2. Why It Changed
- Fintools Find Sprint 48 objective: Deliver Flagship Tool #38 (Atal Pension Yojana Calculator) to complete 100% flagship coverage of the Indian Sovereign Retirement & Pension Suite alongside NPS (#13), Provident Fund (#17), Pension & Annuity (#33), and VPF (#36).

## 3. Architecture Impact
- Reused existing design system primitives (`FormInputNumber`, `FormSelect`, `ScenarioPresetCards`, `ShareActions`, `FlagshipLayout`).
- Established a reusable **PFRDA Statutory Matrix Lookup Engine Pattern** for micro-pension schemes.

## 4. Financial Methodology & Official Verification
- **Authoritative Sources Verified**:
  - **Pension Fund Regulatory and Development Authority (PFRDA)** & **Ministry of Finance (Department of Financial Services)**: Atal Pension Yojana Scheme Guidelines & Notified Monthly Contribution Matrix.
  - **Entry Age Limits**: **18 to 40 Years**. Vesting Age: **60 Years**.
  - **Guaranteed Pension Options**: **₹1,000, ₹2,000, ₹3,000, ₹4,000, or ₹5,000 / month** starting at age 60.
  - **Nominee Return of Corpus**:
    - ₹1,000/mo tier $\rightarrow$ ₹1,70,000
    - ₹2,000/mo tier $\rightarrow$ ₹3,40,000
    - ₹3,000/mo tier $\rightarrow$ ₹5,10,000
    - ₹4,000/mo tier $\rightarrow$ ₹6,80,000
    - ₹5,000/mo tier $\rightarrow$ **₹8,50,000**
  - **Tax-Payer Restriction**: Effective Oct 1, 2022, income tax payers are not eligible to open new APY accounts.

## 5. Reference Verification Calculations

| Case | Scenario Parameter | Input Values | Expected Calculation & Output |
| :--- | :--- | :--- | :--- |
| **Case A** | Earliest Entry Age 18 | Age 18, ₹5,000/mo Pension | **Monthly Contribution**: ₹210/mo<br>**42-Yr Total Contrib**: ₹105,840<br>**Nominee Corpus**: ₹850,000 |
| **Case B** | Standard Mid Entry Age 30 | Age 30, ₹5,000/mo Pension | **Monthly Contribution**: ₹577/mo<br>**30-Yr Total Contrib**: ₹207,720<br>**Nominee Corpus**: ₹850,000 |
| **Case C** | Late Entry Cap Age 40 | Age 40, ₹5,000/mo Pension | **Monthly Contribution**: ₹1,454/mo<br>**20-Yr Total Contrib**: ₹348,960<br>**Nominee Corpus**: ₹850,000 |
| **Case D** | Micro Tier Entry Age 18 | Age 18, ₹1,000/mo Pension | **Monthly Contribution**: ₹42/mo<br>**42-Yr Total Contrib**: ₹21,168<br>**Nominee Corpus**: ₹170,000 |
| **Case E** | Payment Frequency Equivalent | Age 25, ₹5,000/mo Pension | **Monthly**: ₹376/mo<br>**Quarterly**: ₹1,128/qtr<br>**Half-Yearly**: ₹2,256/half-yr |
| **Case F** | Invalid Entry Age (<18) | Age 16, ₹5,000/mo Pension | **Status**: Invalid Entry Age<br>**Monthly Contribution**: ₹0 |
| **Case G** | Invalid Entry Age (>40) | Age 45, ₹5,000/mo Pension | **Status**: Invalid Entry Age<br>**Monthly Contribution**: ₹0 |
| **Case H** | Real Purchasing Power | Age 30, ₹5,000/mo @ 5% Infl | **60Y Real Pension**: ₹1,157 / mo |

## 6. Build Count Reconciliation
- **Total Static Page Routes Generated**: **217 page routes** (Up from 216 in Sprint 47 due to new route `/tools/retirement/apy-calculator/index.html`).
- **Distinct HTML Files**: **89 static HTML pages** built in `dist/` (38 flagship calculator pages under `/tools/[category]/[tool]`, 6 category indexes, 5 guides, 5 glossary, 5 comparison tools, 3 hubs, core pages, sitemap, rss).

## 7. Quality Gate Results
- **Unit Tests**: PASSED (`vitest run`). **50 test files passed, 396 total unit tests passed** (including 15 dedicated APY unit tests).
- **Astro Check**: PASSED (`npx astro check`). **0 errors, 0 warnings, 0 hints**.
- **Production Build**: PASSED (`npm run build`). **217 static page routes built successfully**, including `/tools/retirement/apy-calculator/index.html`.
- **Regression Verification**: Verified all 37 existing flagship calculators build and function cleanly without regressions.

## 8. Known Limitations
- Effective Oct 1, 2022, citizens who pay income tax are barred from joining new APY accounts.
