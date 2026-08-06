# FinTool — Golden Calculator Standard

**Document Status:** **PERMANENT INSTITUTIONAL QUALITY STANDARD**  
**Reference Benchmark:** EMI Calculator (`/tools/loans/emi-calculator/`)  
**Scope:** Applies to all 194 calculators built in this repository.

---

## 1. Overview & Purpose

This document defines the non-negotiable quality baseline for every calculator built in FinTool. Every new calculator (#3 to #194) must satisfy **all 8 quality checklists** below before being considered shipped.

---

## 2. Quality Checklists Across 8 Dimensions

### A. Product Checklist
- [ ] **Instant Clarity:** Above-the-fold calculator island pre-filled with sensible, real-world default values.
- [ ] **Zero Confusion UI:** Synchronized sliders and numeric fields allow typing without jarring value resets.
- [ ] **Tenure & Unit Toggles:** Unit toggle switches (`Yr` $\leftrightarrow$ `Mo`, `Annual` $\leftrightarrow$ `Monthly`) preserve state smoothly.
- [ ] **Actionable Next Steps:** Explicit advice boxes, pro tips, and contextual links to next recommended tools.

### B. Engineering & Architecture Checklist
- [ ] **Config-Driven Framework:** UI widgets must use `UniversalCalculatorWidget` and declarative config objects (`/src/calculators/configs/*.config.js`). Zero custom Preact layout JSX allowed.
- [ ] **Pure Math Decoupling:** Math functions must be pure, functional, and DOM-independent in `/src/calculators/<category>/<slug>.js`.
- [ ] **Zero Code Duplication:** Shared utilities (`mathHelpers.js`, `validation.js`, `currencies.js`, `financialMath.js`) must be reused.
- [ ] **TypeScript / JSDoc:** Full `@typedef` JSDoc annotations for all options and calculation results.

### C. Financial Accuracy Checklist
- [ ] **Formula Verification:** Formulas must cite authoritative standards (RBI, IRS, TVM annuity mathematics).
- [ ] **Boundary Testing:** Handles zero rates (`rate === 0`), 0 principal, negative inputs, and maximum bounds cleanly.
- [ ] **Numerical Precision:** Intermediate calculations maintain full float precision; outputs round cleanly to integer currency units.

### D. UX & Accessibility Checklist (WCAG AAA)
- [ ] **Keyboard Navigation:** All inputs, range sliders, toggles, and buttons navigable via `Tab` / `Space` / `Arrow` keys.
- [ ] **Screen Reader Live Regions:** Output results container must include `aria-live="polite"`.
- [ ] **Explicit Labels:** Every `<input>` must have a matching `<label htmlFor="...">`.
- [ ] **Touch Targets:** All interactive tap targets $\ge$ 44px height.

### E. Content & YMYL Checklist
- [ ] **Content Depth:** Min 1,000 words of publication-grade Markdown text.
- [ ] **Required Sections:** H1 Title, Widget, Introduction, How to Use, Features, Benefits, Formula (LaTeX), Worked Examples, Comparison Table, 5 Strategies, FAQs (min 6), Disclaimer.
- [ ] **Advanced Callouts:** Frontmatter must define `advancedContent` (`definitionSnippet`, `proTips`, `commonMistakes`, `glossaryTerms`).

### F. SEO Checklist
- [ ] **Title Tag:** Under 60 characters with brand suffix (`| FinTool`).
- [ ] **Meta Description:** Under 160 characters (strictly 140–156 chars).
- [ ] **Canonical URL:** Explicit canonical URL with trailing slash.
- [ ] **Featured Snippet Targets:** Paragraph snippet box, comparative markdown table, numbered strategy list.
- [ ] **Internal Linking:** Min 3 contextual links to live related calculators.

### G. EEAT Checklist
- [ ] **Editorial Review Badge:** Displays `reviewedBy` (Defaults to *"FinTool Engineering & Quant Team"*).
- [ ] **Timestamp:** Automatically displays human-readable `updatedDate` or `publishDate`.
- [ ] **Methodology Notice:** Explicit explanation of TVM calculation methodology and data privacy standards.

### H. Structured Data (JSON-LD) Checklist
- [ ] **`WebApplication` Schema:** Auto-injected with price (`$0`), operating system, and category.
- [ ] **`BreadcrumbList` Schema:** Auto-injected 3-level breadcrumb chain.
- [ ] **`FAQPage` Schema:** Auto-injected from `faqs` array using `is:inline` scripts.

---

## 3. Definition of Done (DoD)

A calculator ticket is officially **Shipped** only when:
1. Vitest unit tests pass (`npm test`).
2. Static compilation completes with **0 errors, 0 warnings, 0 hints** (`npm run build`).
3. All 8 checklist dimensions above pass validation.
