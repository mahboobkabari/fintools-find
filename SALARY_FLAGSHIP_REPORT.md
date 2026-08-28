# Flagship Calculator #99: Salary Calculator Sprint Report

## 1. Flagship Number
- **Flagship ID**: #99 / 194 (51.0% completion milestone)

## 2. Tool Name
- **Name**: Salary Calculator (Gross to Net Take-Home Pay & Compensation Engine)

## 3. Slug & Canonical Route
- **Slug**: `/tools/salary/salary-calculator/`
- **Canonical URL**: `https://fintool.org/tools/salary/salary-calculator/`

## 4. Category
- **Category**: `salary` (Personal/Salary Calculators)
- **Category Name**: `Personal/Salary Calculators`

## 5. Existing Tax Architecture Reused
- **Indian Tax Reference Database**: Integrated directly with `src/data/tax-rates/indianTaxRates.js` (`INDIAN_TAX_RATES_FY2025_26`), utilizing official standard deduction constants (₹75,000 New Regime, ₹50,000 Old Regime), Section 87A rebate rules (₹7,00,000 threshold), and 4% Health & Education Cess.
- **Shared Payroll Core Mathematics**: Reused `calculateIncomeTaxForRegime` from `src/calculators/core/salaryUtils.js`.

## 6. Supported Jurisdictions
1. **United States (`US`)**: Federal progressive tax brackets (10%, 12%, 22%, 24%, 32%, 35%, 37%), Standard Deduction ($15,000 Single Filer), FICA Social Security (6.2% up to $176,100 cap), Medicare (1.45% + 0.9% additional over $200k), and configurable State Income Tax (0% to 13.3%).
2. **India (`IN`)**: FY 2025-26 New Tax Regime (Section 115BAC) & Old Tax Regime, ₹75k / ₹50k Standard Deduction, Section 87A rebate, 4% Cess, Employee EPF (12% of basic), and Professional Tax (capped at ₹2,400).
3. **United Kingdom (`UK`)**: 2025/2026 Personal Allowance (£12,570 with £1 for £2 taper over £100k), Basic Rate (20%), Higher Rate (40%), Additional Rate (45%), and Class 1 National Insurance (8% and 2%).
4. **Canada (`CA`)**: 2025/2026 Federal progressive tax brackets (15% to 33%), Basic Personal Amount (C$15,705), CPP (5.95% up to C$4,050), EI (1.66% up to C$1,077), and provincial tax rate estimates.
5. **Australia (`AU`)**: 2024-25/2025-26 Stage 3 revised individual income tax rates (16%, 30%, 37%, 45%), tax-free threshold (A$18,200), and 2% Medicare Levy.
6. **Generic / Global Flat Rate (`GENERIC`)**: User-configurable effective income tax rate % and social/payroll contribution percentage.

## 7. Salary Methodology & Hourly/Annual Conversions
- **Annual Base Salary**:
  $$\text{Annual Base} = \begin{cases} P_{\text{input}} & \text{Annual} \\ P_{\text{input}} \times 12 & \text{Monthly} \\ P_{\text{input}} \times 24 & \text{Semi-Monthly} \\ P_{\text{input}} \times 26 & \text{Bi-Weekly} \\ P_{\text{input}} \times 52 & \text{Weekly} \\ P_{\text{input}} \times \text{WorkingDaysPerYear} & \text{Daily} \\ P_{\text{input}} \times \text{HoursPerWeek} \times \text{WeeksPerYear} & \text{Hourly} \end{cases}$$
- **Total Gross Compensation**:
  $$G_{\text{total}} = \text{Annual Base} + \text{Bonus}_{\text{annual}} + \text{Commission}_{\text{annual}} + \text{OtherTaxable}_{\text{annual}}$$
- **Taxable Income Base**:
  $$\text{Taxable Income} = \max\left(0, G_{\text{total}} - D_{\text{pre}}\right)$$
- **Net In-Hand Take-Home Pay**:
  $$N_{\text{annual}} = \max\left(0, G_{\text{total}} - T_{\text{income}} - S_{\text{social}} - D_{\text{pre}} - D_{\text{post}}\right)$$

## 8. Pay-Frequency Methodology
Provides consistent period conversion across 7 distinct cadences:
- **Annual**: $N_{\text{annual}}$
- **Monthly**: $N_{\text{annual}} \div 12$
- **Semi-Monthly**: $N_{\text{annual}} \div 24$
- **Bi-Weekly**: $N_{\text{annual}} \div 26$
- **Weekly**: $N_{\text{annual}} \div 52$
- **Daily**: $N_{\text{annual}} \div \text{WorkingDaysPerYear}$
- **Hourly Equivalent**: $N_{\text{annual}} \div (\text{HoursPerWeek} \times \text{WeeksPerYear})$

## 9. Bonus & Variable Pay Methodology
- Variable compensation (performance bonuses, commissions, stipends) is separated from base salary for cashflow predictability while aggregating into gross taxable earnings for statutory tax assessment.

## 10. Deduction Methodology (Pre-Tax vs Post-Tax)
- **Pre-Tax Deductions ($D_{\text{pre}}$)**: Subtracts directly from gross compensation *before* income tax calculation (e.g. 401(k), Traditional Pension, EPF, HSA), reducing adjusted taxable income.
- **Post-Tax Deductions ($D_{\text{post}}$)**: Subtracted from net earnings *after* income taxes are computed (e.g. Roth contributions, union dues, garnishments).

## 11. Target-Net Solver Methodology (Reverse Gross-Up)
- Employs a **deterministic numerical bisection algorithm** (sub-cent precision, $\le 80$ iterations) that accurately solves the non-linear progressive tax inverse to find the exact required gross salary for any desired monthly or annual net take-home pay.

## 12. Comparison Methodology (Dual Offer A/B)
- Compares Scenario A against Scenario B side-by-side:
  - $\Delta \text{Gross Annual} = G_B - G_A$
  - $\Delta \text{Net Annual} = N_B - N_A$
  - $\Delta \text{Net Monthly} = \frac{N_B - N_A}{12}$
  - $\Delta \text{Total Deductions} = D_B - D_A$
  - $\Delta \text{Effective Tax Rate} = \text{Rate}_B - \text{Rate}_A$
  - Winner designation based on maximum in-hand cash retention.

## 13. Tax Assumptions & Disclosures
- Single filer tax status assumed for US/CA standard deduction baselines.
- Tax calculations reflect statutory individual progressive brackets and statutory payroll levies; local municipal surcharges or special credits may vary.

## 14. Tax-Year Assumptions
- **US**: 2025/2026 IRS Federal Brackets & FICA Limits ($176,100 Social Security cap).
- **India**: FY 2025-26 / AY 2026-27 Union Budget Amendments (Section 115BAC).
- **UK**: 2025/2026 HMRC PAYE & Class 1 NI.
- **Canada**: 2025/2026 CRA Federal & CPP/EI maximums.
- **Australia**: 2024-25/2025-26 ATO Stage 3 Individual Rates.

## 15. Files Created
1. `src/calculators/salary/salary-calculator.js` (Pure deterministic calculation engine)
2. `src/calculators/configs/salary-calculator.config.js` (Metadata, config, 6 educational presets)
3. `src/calculators/salary/__tests__/salary-calculator.test.js` (45 dedicated unit tests)
4. `src/components/calculators/primitives/SalaryFlagshipWidget.jsx` (Interactive Preact UI island)
5. `src/components/calculators/SalaryCalculatorWidget.jsx` (Preact wrapper component)
6. `src/components/content/SalaryFlagshipLayout.astro` (Flagship layout component)
7. `src/content/tools/salary-calculator.md` (Comprehensive EEAT content with JSON-LD schemas)
8. `SALARY_FLAGSHIP_REPORT.md` (Sprint completion report)

## 16. Files Modified
1. `src/pages/tools/[category]/[tool]/index.astro` (Wired route dispatcher for `salary-calculator`)
2. `src/content/tools/take-home-salary-calculator.md` (Added cross-link)
3. `src/content/tools/ctc-calculator.md` (Added cross-link)

## 17. Dedicated Tests
- **Passed**: 45 / 45 (100%) in 7ms

## 18. Full Vitest Results
- **Passed**: 2,899 / 2,899 (100%) across 111 test suites in 8.69s

## 19. Astro Results
- **Diagnostics**: 0 errors, 0 warnings, 95 hints across 750 project files

## 20. Production Build Results
- **Status**: Complete & Clean (18.06s)
- **Static Pages Generated**: 157 static HTML pages

## 21. Route Verification
- `dist/tools/salary/salary-calculator/index.html` verified:
  - Canonical: `https://fintool.org/tools/salary/salary-calculator/`
  - JSON-LD: `WebApplication`, `BreadcrumbList`, `FAQPage`
  - Meta Description $\le 160$ chars: Verified (156 characters)

## 22. SEO Impact
- High-intent search volume capture for salary calculation, take-home pay, paycheck deductions, hourly to salary conversion, and job offer comparisons.

## 23. Accessibility Impact
- High-contrast visual allocation progress bars, semantic HTML5 headings, accessible labels on all form inputs and range sliders, and full keyboard navigability.

## 24. Performance Impact
- 100% client-side calculation execution with zero server latency and instant response times.

## 25. Reusable Architecture Impact
- Modularized multi-jurisdiction tax engine that can be extended to additional countries without altering the core gross-to-net or reverse solver framework.

## 26. Known Limitations
- State/provincial taxes use representative average percentages or user-adjustable sliders rather than hundreds of individual municipal codes.

## 27. Technical Debt Assessment
- Zero technical debt identified; zero duplicate tax code introduced.

## 28. Git Push Status
- No git push performed (Local repository changes only).

## 29. Updated Roadmap Progress
- **Completed Flagship Calculators**: 99 / 194 (51.0%)
- **Remaining**: 95
- **Next Sequential Tool**: Flagship #100 — **Net Worth Calculator**
  - Category: `salary` (Personal/Salary Calculators)
  - Source: `tool_slugs.csv` Line 171
  - Expected Slug: `/tools/salary/net-worth-calculator/`
