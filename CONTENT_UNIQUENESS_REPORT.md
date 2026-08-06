# Cross-Calculator Quality Audit Report

**Date:** August 6, 2026  
**Scope:** All 16 published calculators across Loans, Investment, and Tax categories  
**Audit Purpose:** Evaluate content uniqueness, SEO targeting, internal link graph integrity, topical authority, and content depth across the entire platform.

---

## Executive Summary

A comprehensive quality audit was conducted on all 16 published calculators. The audit evaluated five core dimensions:
1. **Content Uniqueness** (Duplicate intros, FAQs, features, benefits, pro tips, common mistakes, worked examples)
2. **SEO Uniqueness** (Title tags, meta descriptions, H1s, heading structures, definition snippets)
3. **Internal Link Graph Integrity** (Broken 404 links, orphan pages, missing contextual/category links)
4. **Topical Authority** (Cross-linking within and across Loans, Investment, and Tax clusters)
5. **Content Depth** (Coverage of the 8 Golden Calculator Standard questions)

### Overall Findings
- **High Quality Base:** Most loan and investment calculators (14 of 16) are written with high technical depth, accurate financial formulas, latex mathematical rendering, and practical worked examples.
- **1 Critical Issue:** `gst-calculator.md` consists almost entirely of generic placeholder text, generic features/benefits/FAQs/pro tips, and broken metadata ("Calculate your GST Calculator instantly").
- **3 Broken 404 Internal Links (High Priority):** 
  - `emi-calculator.md` $\rightarrow$ `/tools/loans/balance-transfer-calculator/` (page does not exist)
  - `home-loan-calculator.md` $\rightarrow$ `/tools/loans/balance-transfer-calculator/` (page does not exist)
  - `sip-calculator.md` $\rightarrow$ `/tools/investment/goal-based-sip-calculator/` (page does not exist)
- **Missing EEAT Frontmatter (High Priority):** `sip-calculator.md` is missing the `eeat` schema block in its frontmatter.
- **Topical Cross-Cluster Opportunities (Medium Priority):** Tax deductions mentioned in loan and investment calculators (Section 24b, 80C, 80E, LTCG/STCG) currently lack direct links to `income-tax-calculator.md`.

---

## Detailed Audit Breakdown by Category

### 1. Duplicate & Boilerplate Content Audit

| Content Element | Issue Description | Affected Files | Severity |
|---|---|---|---|
| **Placeholder Content** | Generic placeholder copy ("This calculator helps you plan your financial goals accurately", generic howToUse, generic features/benefits). | `gst-calculator.md` | **Critical** |
| **Irrelevant Pro Tips / Common Mistakes** | Pro tips reference interest rates and common mistakes reference nominal yield in a GST calculator. | `gst-calculator.md` | **Critical** |
| **Duplicated Worked Examples** | Exact worked example (₹5,000/mo @ 12% for 10 Yrs = ₹11,61,695 maturity) repeated verbatim. | `sip-calculator.md`, `mutual-fund-returns-calculator.md`, `step-up-sip-calculator.md` | **Medium** |
| **Duplicated Comparison Tables** | Lumpsum vs SIP comparison table repeated with minor variations. | `lumpsum-calculator.md`, `mutual-fund-returns-calculator.md`, `sip-calculator.md` | **Medium** |
| **Repeated Feature Phrasing** | Phrasing like *"Real-time calculation with synchronized range sliders"* repeated across 12+ files. | Most tools | **Low** |
| **Repeated EEAT Reviewer Text** | Identical reviewer string `"FinTool Engineering & Quant Team"`. | All 16 tools | **Pass (Design System standard)** |

---

### 2. SEO & Metadata Uniqueness Audit

| Tool Slug | Current Title | Meta Description Status | Definition Snippet | SEO Priority |
|---|---|---|---|---|
| `gst-calculator` | `"GST Calculator"` | **BROKEN:** "Calculate your GST Calculator instantly..." | Generic / Invalid | **Critical** |
| `income-tax-calculator` | `"Income Tax Calculator FY 2025-26: New Tax Regime Slabs"` | Valid (158 chars) | Present | **Good** |
| `emi-calculator` | `"EMI Calculator: Instant Loan Repayment & Amortization Schedule"` | Valid (156 chars) | Present | **Good** |
| `home-loan-calculator` | `"Home Loan Calculator: Estimate EMI & Mortgage Amortization"` | Valid (158 chars) | Present | **Good** |
| `car-loan-calculator` | `"Car Loan Calculator: Vehicle EMI & Down Payment Estimator"` | Valid (151 chars) | Present | **Good** |
| `personal-loan-calculator` | `"Personal Loan Calculator: Repayment EMI & Interest Estimator"` | Valid (152 chars) | Present | **Good** |
| `education-loan-calculator` | `"Education Loan Calculator: Estimate Student Loan EMI & Tax Benefits"` | Valid (156 chars) | Present | **Good** |
| `loan-amortization-calculator` | `"Loan Amortization Calculator: Complete Repayment Schedule Table"` | Valid (154 chars) | Present | **Good** |
| `loan-eligibility-calculator` | `"Loan Eligibility Calculator: FOIR & Borrowing Power Estimator"` | Valid (158 chars) | Present | **Good** |
| `loan-prepayment-calculator` | `"Loan Prepayment Calculator: Calculate Interest Savings & Reduced Tenure"` | Valid (152 chars) | Present | **Good** |
| `sip-calculator` | `"SIP Calculator: Calculate Mutual Fund Returns & Wealth Corpus"` | Valid (154 chars) | Present (In body text) | **High** (Frontmatter EEAT missing) |
| `lumpsum-calculator` | `"Lumpsum Calculator: Mutual Fund Compound Interest Returns"` | Valid (153 chars) | Present | **Good** |
| `step-up-sip-calculator` | `"Step-up SIP Calculator: Top-Up Mutual Fund Returns"` | Valid (148 chars) | Present | **Good** |
| `swp-calculator` | `"SWP Calculator: Systematic Withdrawal Plan & Monthly Income"` | Valid (150 chars) | Present | **Good** |
| `cagr-calculator` | `"CAGR Calculator: Compound Annual Growth Rate Formula"` | Valid (148 chars) | Present | **Good** |
| `mutual-fund-returns-calculator` | `"Mutual Fund Returns Calculator: Estimate SIP & Lumpsum Gains"` | Valid (152 chars) | Present | **Good** |

---

### 3. Internal Link Graph Audit

#### A. Broken 404 Links (Action Required in Phase 2)
1. **`emi-calculator.md` (Line 143):** Links to `/tools/loans/balance-transfer-calculator/` $\rightarrow$ **404 Not Found**.
2. **`home-loan-calculator.md` (Line 119):** Links to `/tools/loans/balance-transfer-calculator/` $\rightarrow$ **404 Not Found**.
3. **`sip-calculator.md` (Line 111):** Links to `/tools/investment/goal-based-sip-calculator/` $\rightarrow$ **404 Not Found**.

#### B. Missing Topical Cluster Links (Recommended in Phase 2 / Phase 3)
- **Tax Cluster Cross-Links:**
  - `home-loan-calculator.md` & `emi-calculator.md` mention Section 24(b) and Section 80C tax relief, but do not link to `income-tax-calculator`.
  - `education-loan-calculator.md` mentions Section 80E 100% interest tax deduction, but does not link to `income-tax-calculator`.
  - `mutual-fund-returns-calculator.md` & `swp-calculator.md` explain STCG/LTCG mutual fund taxation (20% STCG, 12.5% LTCG), but do not link to `income-tax-calculator`.
  - `income-tax-calculator.md` mentions home loan deductions and investment savings, but contains zero markdown links to `home-loan-calculator` or `sip-calculator`.
- **Loan Cluster Cross-Links:**
  - `loan-amortization-calculator.md` discusses prepayment strategies and home loan equity, but does not link to `loan-prepayment-calculator` or `home-loan-calculator`.
  - `personal-loan-calculator.md` compares personal loans with home and car loans in a table, but does not link to `home-loan-calculator` or `car-loan-calculator`.
- **Investment Cluster Cross-Links:**
  - `cagr-calculator.md` explains multi-year annualized returns, but does not link to `mutual-fund-returns-calculator` or `lumpsum-calculator`.
  - `step-up-sip-calculator.md` compares step-up SIP with flat SIP, but does not link to `sip-calculator`.
  - `swp-calculator.md` covers retirement decumulation, but does not link to `sip-calculator` (accumulation phase).

---

### 4. Content Depth Audit (Golden Calculator Standard)

| Tool Name | What is it? | Who should use it? | When to use it? | Formula | Worked Example | Common Mistakes | Comparison Table | Depth Status |
|---|---|---|---|---|---|---|---|---|
| `gst-calculator` | ❌ Generic | ❌ Missing | ❌ Missing | ❌ Missing | ❌ Missing | ❌ Invalid | ❌ Missing | **Critical Deficit** |
| `income-tax-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Yes (Slabs) | ✅ Yes | ✅ Yes (Frontmatter) | ✅ Slab Table | **High Quality** (Needs explicit Who/When sections) |
| `emi-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Latex | ✅ 2 Examples | ✅ Yes | ✅ Reducing vs Flat | **Golden Standard** |
| `home-loan-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Latex | ✅ Yes | ✅ Yes | ✅ 15Yr vs 30Yr | **Golden Standard** |
| `car-loan-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Latex | ✅ Yes | ✅ Yes | ✅ Tenure Comparison | **Golden Standard** |
| `personal-loan-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Latex | ✅ Yes | ✅ Yes | ✅ Loan Type Matrix | **Golden Standard** |
| `education-loan-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Latex | ✅ Yes | ✅ Yes | ✅ Sec 80E Breakdown | **Golden Standard** |
| `loan-amortization-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Latex | ✅ Yes | ✅ Yes | ✅ Monthly Schedule | **Golden Standard** |
| `loan-eligibility-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Latex | ✅ Yes | ✅ Yes | ✅ FOIR Ceiling | **Golden Standard** |
| `loan-prepayment-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Latex | ✅ Yes | ✅ Yes | ✅ Tenure vs EMI | **Golden Standard** |
| `sip-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Latex | ✅ 2 Examples | ✅ Yes | ✅ SIP vs Lumpsum | **Golden Standard** |
| `lumpsum-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Latex | ✅ Yes | ✅ Yes | ✅ Lumpsum vs SIP | **Golden Standard** |
| `step-up-sip-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Latex | ✅ Yes | ✅ Yes | ✅ Step-Up vs Flat | **Golden Standard** |
| `swp-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Latex | ✅ Yes | ✅ Yes | ✅ SWP vs Bank FD | **Golden Standard** |
| `cagr-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Latex | ✅ Yes | ✅ Yes | ✅ CAGR vs Absolute | **Golden Standard** |
| `mutual-fund-returns-calculator` | ✅ Yes | 🟡 Implicit | 🟡 Implicit | ✅ Latex | ✅ Yes | ✅ Yes | ✅ Tax Rate Table | **Golden Standard** |

---

## Prioritized Issue Directory

### Category 1: Critical Priority Issues
*Issues that represent broken functionality, placeholder text, or severe quality degradation.*

1. **`gst-calculator.md` - Complete Content Overhaul Required:**
   - Replace placeholder text across all frontmatter fields (`howToUse`, `features`, `benefits`, `faqs`, `advancedContent`).
   - Fix title, meta description, and definition snippet for target search intent ("GST Calculator: Inclusive & Exclusive Tax Estimator for FY 2025-26").
   - Write full markdown body content including: Inclusive vs Exclusive GST formulas, CGST/SGST/IGST breakdown rules, worked examples for 5%, 12%, 18%, 28% GST slabs, common mistakes, and tax compliance tips.

---

### Category 2: High Priority Issues
*Issues that lead to 404 broken user navigation or missing schema metadata.*

1. **`emi-calculator.md` - Fix 404 Broken Link:**
   - Change `[Balance Transfer Calculator](/tools/loans/balance-transfer-calculator/)` (Line 143) to `[Loan Prepayment Calculator](/tools/loans/loan-prepayment-calculator/)` or `[Loan Eligibility Calculator](/tools/loans/loan-eligibility-calculator/)`.
2. **`home-loan-calculator.md` - Fix 404 Broken Link:**
   - Change `[Balance Transfer Calculator](/tools/loans/balance-transfer-calculator/)` (Line 119) to `[Loan Prepayment Calculator](/tools/loans/loan-prepayment-calculator/)` or `[Loan Eligibility Calculator](/tools/loans/loan-eligibility-calculator/)`.
3. **`sip-calculator.md` - Fix 404 Broken Link & Missing EEAT Schema:**
   - Change `[Goal-Based SIP Calculator](/tools/investment/goal-based-sip-calculator/)` (Line 111) to `[Step-Up SIP Calculator](/tools/investment/step-up-sip-calculator/)`.
   - Add missing `eeat` schema block to frontmatter to match platform standards.
4. **`income-tax-calculator.md` - Add Missing Content Depth & Cross-Cluster Links:**
   - Add explicit "Who Should Use It", "When to Use It", and "Key Differences" sections to complete Golden Calculator Standard depth.
   - Add cross-cluster links to `home-loan-calculator` (Section 24b) and `education-loan-calculator` (Section 80E).

---

### Category 3: Medium Priority Issues (Recommendations for Phase 3)
*Improvements to internal link graph and subtle content duplication.*

1. **Cross-Cluster Link Graph Enhancements:**
   - Add link from `education-loan-calculator.md` to `income-tax-calculator.md` (Section 80E tax deduction).
   - Add link from `mutual-fund-returns-calculator.md` and `swp-calculator.md` to `income-tax-calculator.md` (Capital Gains Tax rates).
   - Add link from `loan-amortization-calculator.md` to `loan-prepayment-calculator.md` and `home-loan-calculator.md`.
   - Add link from `cagr-calculator.md` to `mutual-fund-returns-calculator.md` and `lumpsum-calculator.md`.
   - Add link from `step-up-sip-calculator.md` to `sip-calculator.md`.
2. **Worked Example Variety:**
   - Slightly vary the ₹5,000/mo @ 12% for 10 Yrs example between `sip-calculator.md`, `mutual-fund-returns-calculator.md`, and `step-up-sip-calculator.md` to make each tool's example unique.

---

### Category 4: Low Priority Issues (Recommendations for Phase 3)
*Minor phrasing polish where content is already high quality.*

1. **Feature & Benefit Phrasing Diversity:**
   - Minor rephrasing of recurring bullet points like *"Real-time calculation with synchronized range sliders"* to provide distinct tool-specific phrasing (e.g. *"Interactive vehicle price & down payment sliders"* for car loan).

---

## Action Plan & Approval Request

- **Phase 1 Status:** COMPLETE. `CONTENT_UNIQUENESS_REPORT.md` generated.
- **Phase 2 Target:** Fix only **Critical** and **High** priority issues (Fix `gst-calculator.md`, 3 broken 404 links, missing EEAT schema, and missing tax cross-cluster links in `income-tax-calculator.md`).
- **Phase 3 Target:** Present Medium/Low recommendations for approval.

*Awaiting approval to proceed to Phase 2.*
