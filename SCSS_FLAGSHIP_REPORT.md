# Flagship Senior Citizens Savings Scheme (SCSS) Calculator Implementation Audit Report (Sprint 42)

## 1. What Changed
- Implemented the Flagship Senior Citizens Savings Scheme (SCSS) Calculator (#32) at route `/tools/savings/scss-calculator`.
- Created pure financial math engine `src/calculators/savings/scss-calculator.js`.
- Created configuration module `src/calculators/configs/scss-calculator.config.js`.
- Expanded unit test suite `src/calculators/savings/__tests__/scss-calculator.test.js` to 22 test cases covering statutory caps, quarterly payouts, tax rules (80C, 80TTB, 194A TDS), Form 15H, premature exit tiers, FD comparison, and boundary edge cases.
- Built interactive Preact primitive `src/components/calculators/primitives/ScssFlagshipWidget.jsx` and wrapper `src/components/calculators/ScssCalculatorWidget.jsx`.
- Registered widget in `src/components/calculators/registry.js`.
- Built Astro flagship layout `src/components/content/ScssFlagshipLayout.astro`.
- Wired page routing in `src/pages/tools/[category]/[tool]/index.astro`.
- Created comprehensive educational content and SEO document `src/content/tools/scss-calculator.md`.

## 2. Why It Changed
- Fintools Find Sprint 42 objective: Deliver Flagship Tool #32 (Senior Citizens Savings Scheme Calculator) to empower Indian retirees with a sovereign-backed passive income planning tool.

## 3. Financial Methodology
- **Quarterly Interest Payout**: $I_q = D \times \frac{r / 100}{4}$, credited on the 1st working day of April, July, October, and January.
- **Statutory Limits**:
  - Individual Deposit Cap: ₹30,000,000 (₹30 Lakhs) as per Budget 2023 notification.
  - Joint Account with Spouse: Combined limit of up to ₹60,000,000 (₹60 Lakhs) for an eligible couple.
- **Premature Closure Penalty Tiers**:
  - < 1 Year: 100% interest clawback.
  - 1Y to 2Y: 1.5% principal penalty.
  - 2Y to 5Y: 1.0% principal penalty.
  - Full 5Y Maturity: 0% penalty.
- **Tax & TDS Rules**:
  - Section 80C: Up to ₹1.5L principal deduction in deposit year.
  - Section 80TTB: Up to ₹50k senior citizen interest tax exemption per FY.
  - Section 194A TDS: 10% TDS with PAN (20% non-PAN) if interest > ₹50,000/year; 0% TDS with Form 15H.

## 4. Statutory Rules & Government-Notified Values
- **Current Interest Rate**: 8.2% p.a. (notified by Ministry of Finance).
- **Statutory Rules**: Senior Citizens Savings Scheme Rules 2019 & Income Tax Act, 1961.

## 5. Reference Calculations
- Deposit: ₹3,000,000 @ 8.2% p.a.
- Quarterly Payout: ₹61,500
- Annual Interest: ₹246,000
- 5-Year Total Interest: ₹1,230,000
- Sec 80TTB Tax-Exempt: ₹50,000
- Taxable Interest: ₹196,000
- Annual TDS (10% PAN): ₹24,600 (or ₹0 with Form 15H)

## 6. Verification Results
- **Unit Tests**: 45 passed (301 total tests across workspace; 22 SCSS tests).
- **Astro Check**: 0 errors, 0 warnings, 0 hints.
- **Production Build**: Built 212 static routes successfully including `/tools/savings/scss-calculator/index.html`.
