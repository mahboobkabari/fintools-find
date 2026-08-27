# Flagship #87: Import Duty Calculator — Implementation & Verification Report

**Sprint**: 80  
**Date**: August 27, 2026  
**Status**: ✅ COMPLETED & 100% VERIFIED  
**Flagship Progress**: 87 / 194 Completed (107 Remaining)

---

## 1. Executive Summary

Flagship Calculator #87 (**Import Duty Calculator**) has been fully engineered, validated under international customs valuation standards (WTO/GATT 1994), tested, and integrated into the static production build of Fintools Find.

- **Calculator Name**: Import Duty Calculator
- **Flagship Number**: #87
- **URL Slug**: `/tools/currency/import-duty-calculator/`
- **Category**: Currency & Cost Calculators (`currency`)
- **Engine**: Pure JavaScript financial engine (`src/calculators/currency/import-duty-calculator.js`)
- **Unit Tests**: 45/45 dedicated tests passing (Total Vitest suite: 2,359/2,359 tests passing across 99 test suites)
- **Astro Diagnostic Check**: 0 errors, 0 warnings (677 files checked)
- **Production Build**: 144 static pages generated including `/tools/currency/import-duty-calculator/index.html`

---

## 2. Financial & Customs Methodology

The engine calculates landed cost following standard international customs compounding sequences:

### A. Assessable Customs Value
- **Under CIF Standard (Cost, Insurance & Freight - India, EU, UK, GCC)**:
  $$\text{Assessable Value} = (\text{Unit Price} \times \text{Quantity}) + \text{Shipping Freight} + \text{Cargo Insurance}$$
- **Under FOB Standard (Free on Board - USA CBP)**:
  $$\text{Assessable Value} = \text{Unit Price} \times \text{Quantity}$$

### B. Customs Duties & Levies
1. **Basic Customs Duty (BCD)**:
   $$\text{Basic Duty} = \text{Assessable Value} \times \left(\frac{\text{Duty Rate \%}}{100}\right)$$

2. **Social Welfare Surcharge (SWS)**:
   $$\text{SWS} = \text{Basic Duty} \times \left(\frac{\text{Surcharge Rate \%}}{100}\right)$$

3. **Compounded Import GST / VAT (IGST)**:
   $$\text{Tax Base} = \text{Assessable Value} + \text{Basic Duty} + \text{SWS}$$
   $$\text{Import GST/VAT} = \text{Tax Base} \times \left(\frac{\text{GST/VAT Rate \%}}{100}\right)$$

4. **Total Tax & Duty Burden**:
   $$\text{Total Tax Burden} = \text{Basic Duty} + \text{SWS} + \text{Import GST/VAT}$$

5. **Total Landed Cost**:
   $$\text{Landed Cost} = \text{Product Value} + \text{Shipping} + \text{Insurance} + \text{Total Tax Burden} + \text{Clearance Brokerage}$$

6. **Effective Duty Rate & Landed Unit Cost**:
   $$\text{Effective Duty on Product \%} = \left(\frac{\text{Total Tax Burden}}{\text{Product Value}}\right) \times 100$$
   $$\text{Landed Cost / Unit} = \frac{\text{Total Landed Cost}}{\text{Quantity}}$$

---

## 3. Data & Reference Methodology

- **Valuation Standard**: WTO Agreement on Implementation of Article VII of GATT 1994 (Customs Valuation Agreement).
- **Reference Date**: `2026-08-27` (`Institutional Baseline Benchmark`).
- **Disclosures**: Explicitly identifies the calculator as an educational landed cost estimation tool, noting that official binding tariff classifications (HS Codes) and anti-dumping duties are determined exclusively by the destination customs authority upon entry.

---

## 4. Implemented Components & Files

| Component / Artifact | File Path | Status |
|---|---|---|
| **Calculation Engine** | `src/calculators/currency/import-duty-calculator.js` | ✅ Created (220 lines) |
| **Config & Presets** | `src/calculators/configs/import-duty-calculator.config.js` | ✅ Created (110 lines) |
| **Vitest Test Suite** | `src/calculators/currency/__tests__/import-duty-calculator.test.js` | ✅ Created (45/45 passed) |
| **Preact Island Widget** | `src/components/calculators/primitives/ImportDutyFlagshipWidget.jsx` | ✅ Created (370 lines) |
| **Widget Wrapper** | `src/components/calculators/ImportDutyCalculatorWidget.jsx` | ✅ Created |
| **Astro Flagship Layout** | `src/components/content/ImportDutyFlagshipLayout.astro` | ✅ Created (150 lines) |
| **EEAT Markdown Article** | `src/content/tools/import-duty-calculator.md` | ✅ Created (210 lines) |
| **Dynamic Routing** | `src/pages/tools/[category]/[tool]/index.astro` | ✅ Updated |
| **Cross-Links** | `src/content/tools/cost-of-living-calculator.md`, `src/content/tools/currency-converter.md` | ✅ Updated |

---

## 5. Verification & Quality Gates

### A. Dedicated Unit Tests
```bash
Test Files  1 passed (1)
Tests       45 passed (45)
Duration    489ms
```

### B. Full Vitest Suite
```bash
Test Files  99 passed (99)
Tests       2359 passed (2359)
Duration    8.66s
```

### C. Astro Diagnostics Check
```bash
Result (677 files): 
- 0 errors
- 0 warnings
- 70 hints
```

### D. Static Production Build
```bash
144 page(s) built in 37.82s
- /tools/currency/import-duty-calculator/index.html (27ms)
```

---

## 6. Project Roadmap Progress

- **Completed**: 87 / 194 Flagship Calculators
- **Remaining**: 107 Flagship Calculators
- **Next Sequentially**: Flagship Calculator #88 (`Remittance Fee Calculator`, `/tools/currency/remittance-fee-calculator/`)
