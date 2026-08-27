# Flagship TDS Calculator Implementation & Audit Report (Sprint 56)

**Tool Name**: TDS Calculator (Tax Deducted at Source Rate & Net Payout Estimator)  
**Slug**: `/tools/tax/tds-calculator`  
**Category**: Tax (`/tools/tax/`)  
**Flagship Tool Number**: #63  
**Sprint**: Sprint 56  
**Status**: 100% Production-Ready & Verified  

---

## 1. Executive Summary

In Sprint 56, the **TDS Calculator** was promoted to Flagship Tool #63 on Fintools Find. It features a statutory CBDT tax engine covering all major provisions under the Indian Income Tax Act, 1961, including Section 206AA non-PAN 20% penal rate withholding, Section 197 Lower Rate Certificates, Section 201(1A) late deposit interest calculation, ITR tax reconciliation (Refund Claimable vs Balance Advance Tax Due), multi-section comparison matrices, and B2B invoice deduction voucher previews.

---

## 2. Files Created & Modified

| File Path | Action | Description |
|---|---|---|
| `src/calculators/tax/tds-calculator.js` | **Created/Upgraded** | Institutional Flagship Math Engine V2 supporting 12+ statutory sections, Section 206AA penalties, Section 197 certificates, refund reconciliation, and compliance interest. |
| `src/calculators/configs/tds-calculator.config.js` | **Created/Upgraded** | Flagship configuration containing 7 one-tap scenario presets, section dictionaries, and metadata. |
| `src/calculators/tax/__tests__/tds-calculator.test.js` | **Created/Upgraded** | 44 deterministic unit tests covering statutory sections, edge cases, thresholds, penalties, and ITR reconciliation. |
| `src/components/calculators/primitives/TdsFlagshipWidget.jsx` | **Created** | Preact Island flagship widget featuring interactive controls, KPI cards, allocation ratio bar, B2B invoice voucher preview, multi-section comparison table, and actionable recommendations. |
| `src/components/calculators/TdsCalculatorWidget.jsx` | **Modified** | Direct wrapper rendering `TdsFlagshipWidget`. |
| `src/components/content/TdsFlagshipLayout.astro` | **Created** | Full 17-section declarative layout with process architecture, target personas, mathematical formulas, case studies, and compliance strategies. |
| `src/content/tools/tds-calculator.md` | **Modified** | Rich EEAT content, structured schemas, worked examples, FAQs, glossary, and related tool internal links. |
| `src/pages/tools/[category]/[tool]/index.astro` | **Modified** | Integrated `TdsFlagshipLayout` into the dynamic route dispatcher. |

---

## 3. Financial Methodology & Statutory Research

### A. Statutory Direct Tax Rules
* **Section 194J(b)**: 10% TDS on professional fees (Doctors, CAs, Lawyers, Engineers, Consultants) exceeding ₹30,000 in a FY.
* **Section 194J(a)**: Concessional 2% TDS on technical services, BPO/Call Center fees, and cinematographic film royalties.
* **Section 194C**: 1% TDS for Individual/HUF contractors and 2% for Corporate entities (Single bill > ₹30,000 or aggregate > ₹1,00,000).
* **Section 194A**: 10% TDS on bank/post office FD interest exceeding ₹40,000/yr (₹50,000 for Senior Citizens aged 60+).
* **Section 194I(b)**: 10% TDS on rent for land, building, or furnished space exceeding ₹2,40,000/yr.
* **Section 194I(a)**: 2% TDS on plant, machinery, or equipment leasing exceeding ₹2,40,000/yr.
* **Section 194IA**: 1% TDS deducted by property buyers on purchase consideration or stamp value exceeding ₹50,00,000.
* **Section 194IB**: 5% TDS by individual tenants paying monthly rent exceeding ₹50,000.
* **Section 194H**: 5% TDS on commission or brokerage exceeding ₹15,000/yr.
* **Section 194M**: 5% TDS on payments exceeding ₹50 Lakhs/yr by non-audit individuals.
* **Section 194Q**: 0.1% TDS on purchase of goods exceeding ₹50 Lakhs from a resident seller.

### B. Statutory Penalties & Safeguards
* **Section 206AA**: Mandatory minimum 20% TDS rate if deductee fails to furnish a valid PAN (5% for Section 194Q).
* **Section 197 / 197A**: Application of Lower Rate or NIL TDS certificates issued by the Assessing Officer.
* **Section 201(1A)**: Simple interest of 1.5% per month or part of a month for late deposit to the central government.
* **ITR Reconciliation**:
  $$\text{Final Tax} = P \times \frac{\text{Tax Slab} \times 1.04}{100}$$
  $$\text{Net Tax Position} = \text{TDS Deducted} - \text{Final Tax}$$
  * If $\text{TDS} > \text{Final Tax} \rightarrow \text{Refund Due under Section 244A}$
  * If $\text{Final Tax} > \text{TDS} \rightarrow \text{Balance Advance Tax Due to avoid Sec 234B/234C interest}$

---

## 4. Quality Gate Verification

| Verification Gate | Requirement | Actual Result | Status |
|---|---|---|---|
| **Dedicated Vitest** | 40+ tests passing | 44 / 44 tests passed (66ms) | ✅ Passed |
| **Full Vitest Suite** | 0 failures across repo | 1,290 / 1,290 tests passed across 78 test files | ✅ Passed |
| **Astro Check** | 0 errors, 0 warnings | 0 errors, 0 warnings (547 files checked) | ✅ Passed |
| **Production Build** | 0 build errors | 122 pages built in 15.71s (`dist/`) | ✅ Passed |
| **Route Generation** | Verified static HTML | `dist/tools/tax/tds-calculator/index.html` (76.2 KB) | ✅ Passed |
| **SEO Schemas** | WebApplication, FAQPage, Breadcrumb | Full JSON-LD structured schemas generated | ✅ Passed |
| **A11y & Responsiveness** | Keyboard, ARIA labels, responsive grids | Compliant | ✅ Passed |
| **Git Push Status** | No git push performed | Local repository clean, unpushed | ✅ Passed |

---

## 5. Flagship Metrics

* **Updated Flagship Count**: 63 Flagship Calculators
* **Platform Health**: 100% test pass rate, 0 Astro check warnings, clean production build
