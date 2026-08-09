# Flagship Post Office Monthly Income Scheme (POMIS) Calculator Audit Report (Sprint 45)

## 1. What Changed
- Built Flagship Tool #35 (`/tools/savings/pomis-calculator`).
- Created pure financial math engine `src/calculators/savings/pomis-calculator.js` implementing guaranteed 7.4% p.a. monthly interest income payouts, statutory deposit ceiling enforcement (Single Account ₹9 Lakhs, Joint Account ₹15 Lakhs), premature closure penalty rules (2% between 1–3Y, 1% between 3–5Y), income tax slab audits, POMIS vs Bank FD/SCSS yield comparisons, 60-month payout cash flow schedules, and 5-year inflation-adjusted real purchasing power models.
- Created configuration module `src/calculators/configs/pomis-calculator.config.js`.
- Written 17 reference unit test cases in `src/calculators/savings/__tests__/pomis-calculator.test.js`.
- Built Preact UI components `src/components/calculators/primitives/PomisFlagshipWidget.jsx` and wrapper `src/components/calculators/PomisCalculatorWidget.jsx`.
- Registered component in `src/components/calculators/registry.js`.
- Built Astro flagship layout `src/components/content/PomisFlagshipLayout.astro`.
- Updated dynamic routing in `src/pages/tools/[category]/[tool]/index.astro`.
- Created content and SEO document `src/content/tools/pomis-calculator.md`.

## 2. Why It Changed
- Fintools Find Sprint 45 objective: Deliver Flagship Tool #35 (Post Office Monthly Income Scheme Calculator) to complete the Post Office Small Savings & Passive Monthly Income Suite alongside PPF (#25), SSY (#27), SCSS (#32), and NSC (#34).

## 3. Architecture Impact
- Reused existing design system primitives (`FormInputNumber`, `FormSelect`, `ScenarioPresetCards`, `ShareActions`, `FlagshipLayout`).
- Established a reusable **Monthly Income Payout Engine** pattern for future monthly income and annuity tools.

## 4. Financial Methodology & Authoritative Sources
- **Monthly Interest Formula**:
  $$\text{Monthly Interest Payout} = \frac{\text{Sanitized Deposit} \times (r / 100)}{12}$$
  Where $r = 7.4\%$ p.a. government-notified interest rate.
- **Authoritative Sources Verified**:
  - **Ministry of Finance (Department of Economic Affairs)**: National Savings (Monthly Income Account) Scheme, 2019. Notified rate: 7.4% p.a. payable monthly. Tenure: 5 years (60 months).
  - **Statutory Deposit Limits**: Single Account max ₹9,00,000 (₹9 Lakhs); Joint Account (up to 3 adults) max ₹15,00,000 (₹15 Lakhs). Minimum deposit ₹1,000.
  - **Statutory Premature Closure Rules**:
    - 0 to 1 Year: Closure NOT permitted.
    - 1 Year to 3 Years: 2% deduction on principal deposit.
    - 3 Years to 5 Years: 1% deduction on principal deposit.
  - **Income Tax Rules**: Monthly interest received is fully taxable under "Income from Other Sources" at investor's marginal tax slab. No TDS deducted by India Post at source. Principal does NOT qualify for Section 80C.

## 5. Reference Verification Calculations

| Case | Scenario Parameter | Input Values | Expected Calculation & Output |
| :--- | :--- | :--- | :--- |
| **Case A** | Standard Single Account | Deposit: ₹5,00,000 @ 7.4% | **Monthly Income**: ₹3,083 / mo<br>**Annual Interest**: ₹36,996 / yr<br>**5Y Interest**: ₹184,980 |
| **Case B** | Max Single Account | Deposit: ₹9,00,000 @ 7.4% | **Monthly Income**: ₹5,550 / mo<br>**Annual Interest**: ₹66,600 / yr<br>**5Y Interest**: ₹333,000 |
| **Case C** | Max Joint Account | Deposit: ₹15,00,000 @ 7.4% | **Monthly Income**: ₹9,250 / mo<br>**Annual Interest**: ₹111,000 / yr<br>**5Y Interest**: ₹555,000 |
| **Case D** | Cap Exceeded (Single) | Deposit: ₹12,00,000 (Single) | **Cap Applied**: Sanitized to ₹9 Lakhs<br>**Monthly Income**: ₹5,550 / mo<br>`isCapExceeded: true` |
| **Case E** | 5Y Total Interest | Deposit: ₹9,00,000 @ 7.4% | **Total Interest**: ₹333,000 (₹5,550 * 60 months) |
| **Case F** | Tax Estimate (30% Slab) | Income: ₹66,600 / yr | **Annual Tax Estimate**: ₹19,980<br>**Net Monthly After-Tax**: ₹3,885 |
| **Case G** | Real Purchasing Power | Income: ₹5,550 @ 5% Infl | **5Y Real Monthly Value**: ₹4,349 / mo |
| **Case H** | POMIS vs Bank FD Yield | Deposit: ₹9L (7.4% vs 6.75%) | **POMIS Monthly**: ₹5,550 / mo<br>**FD Monthly**: ₹5,063 / mo<br>**Monthly Delta**: +₹487 / mo |

## 6. Verification & Quality Gate Results
- **Unit Tests**: PASSED (`vitest run`). **47 test files passed, 351 total unit tests passed** (including 17 dedicated POMIS unit tests).
- **Astro Check**: PASSED (`npx astro check`). **0 errors, 0 warnings, 0 hints**.
- **Production Build**: PASSED (`npm run build`). **214 static page routes built successfully**, including `/tools/savings/pomis-calculator/index.html`.
- **Regression Verification**: Verified all 34 existing flagship calculators build and function cleanly without regressions.

## 7. Known Limitations
- Monthly interest must be claimed or transferred into a bank account; if left unwithdrawn in the post office account, it earns zero secondary interest.
