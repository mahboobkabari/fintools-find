---
title: "CTC to Take-Home Salary Breakdown Calculator"
metaDescription: "Decompose Cost to Company (CTC) into Basic Salary, HRA, EPF deductions, income tax, and estimated monthly in-hand take-home salary."
category: "salary"
categoryName: "Salary & Personal Income Calculators"
slug: "ctc-calculator"
currency: "INR"
calculatorModule: "@calculators/salary/ctc-calculator.js"
publishDate: 2026-08-09
priority: "P0"
howToUse:
  - "Enter your total annual Cost to Company (CTC) offer package."
  - "Configure Basic Salary % (default 50%), annual bonus, and city classification."
  - "Provide monthly rent paid for Old Tax Regime HRA exemption solver."
  - "Compare Old Tax Regime vs New Tax Regime side-by-side to discover lower modeled tax and maximum monthly take-home salary."
features:
  - "Decomposes Annual CTC into Gross Salary, Employer Retainers, Employee EPF, and Net In-Hand Take-Home"
  - "HRA Tax Exemption solver under Section 10(13A) & Rule 2A (Old Tax Regime)"
  - "Side-by-side Old Tax Regime vs New Tax Regime (Section 115BAC) comparison"
  - "Statutory Employee EPF (12%) and Professional Tax (₹2,500/yr) calculation"
  - "Employer EPF (12%) and Gratuity (~4.81%) retainage breakdown"
  - "Pre-built salary presets (Entry-Level ₹6L, Mid-Career ₹18L, Executive ₹45L, High Bonus)"
benefits:
  - "Understand exactly how much monthly cash will land in your bank account before accepting a job offer"
  - "Discover why a ₹15 LPA CTC does not equal ₹1.25 Lakhs monthly take-home salary"
  - "Determine whether Old Tax Regime (with HRA & 80C) or New Tax Regime yields higher monthly take-home"
  - "Identify non-cash employer retainers like gratuity provisions and corporate health insurance"
faqs:
  - question: "Why is my monthly take-home salary lower than my CTC divided by 12?"
    answer: "Annual Cost to Company (CTC) includes employer-side contributions (Employer EPF 12%, Gratuity ~4.81%, corporate health insurance) and annual variable bonus. Furthermore, employee statutory deductions (Employee EPF 12%, Professional Tax) and Income Tax TDS are deducted from gross cash salary."
  - question: "Is HRA tax exemption available under the New Tax Regime?"
    answer: "No. Under the New Tax Regime (Section 115BAC), Chapter VI-A deductions including HRA exemption under Section 10(13A) are disallowed. However, the New Tax Regime offers lower slab tax rates and a standard deduction of ₹75,000 (FY 2025-26)."
  - question: "How is Basic Salary calculated in a CTC breakdown?"
    answer: "In standard Indian corporate salary structures, Basic Salary is typically configured at 50% of total annual CTC (or 40% in some organizations). EPF contributions and HRA allowances are calculated directly as percentages of Basic Salary."
  - question: "What is the formula for HRA tax exemption under the Old Tax Regime?"
    answer: "HRA exemption is the minimum of three statutory limits: (1) Actual HRA received, (2) Rent paid minus 10% of Basic Salary, and (3) 50% of Basic Salary for metro cities (Delhi, Mumbai, Kolkata, Chennai) or 40% of Basic Salary for non-metro cities."
relatedTools:
  - "take-home-salary-calculator"
  - "income-tax-calculator"
  - "hra-calculator"
  - "provident-fund-calculator"
  - "gratuity-calculator"
  - "net-worth-calculator"
eeat:
  reviewedBy: "Fintools Find Payroll & Compensation Advisory Team"
  reviewedDate: 2026-08-09
  methodology: "Calculated using standard Indian corporate payroll structures, CBDT tax slabs for FY 2025-26 (AY 2026-27), Employees' Provident Fund rules, and Section 10(13A) HRA exemption formulas."
  dataSources:
    - "Income Tax Department of India Tax Slabs FY 2025-26"
    - "Employees' Provident Fund Organisation (EPFO) Statutory Guidelines"
    - "Payment of Gratuity Act, 1972"
advancedContent:
  definitionSnippet: "CTC to Take-Home calculation breaks down total employer expenditure into gross cash salary, statutory retentions, tax deductions, and net monthly in-hand cash flow."
  proTips:
    - "When evaluating job offers, check if Employer EPF (12%) and Gratuity are included inside the CTC or provided as external benefits."
    - "If your monthly rent is high and you have Section 80C deductions, calculate if the Old Tax Regime yields higher monthly take-home than the default New Tax Regime."
  commonMistakes:
    - "Assuming annual performance bonus will be received equally across 12 monthly payslips."
    - "Confusing Employer EPF contribution (part of CTC) with Employee EPF deduction (subtracted from gross salary)."
  keyTakeaways:
    - "Monthly take-home = (CTC - Employer Retainers - Employee EPF - PT - Tax TDS) / 12."
    - "New Tax Regime disallows HRA exemptions but offers lower slab rates."
---

## Understanding Annual CTC vs Monthly In-Hand Take-Home Salary

When receiving a job offer or salary revision, the Cost to Company (CTC) figure rarely matches the monthly cash credited to your bank account.

> **Educational Scenario Disclaimer:** This calculator models payroll breakdowns based on standard Indian corporate compensation structures. Actual payslip credit depends on your employer's specific HR policy, flexible benefit allowances, and tax declarations.

---

### CTC Component Breakdown Summary

| Component | Description | CTC Inclusion | Monthly In-Hand Impact |
| :--- | :--- | :--- | :--- |
| **Basic Salary** | Core taxable salary component ($50\%$ of CTC) | Included in CTC | Part of Gross Monthly Cash |
| **House Rent Allowance (HRA)** | Rent allowance ($50\%$ Metro / $40\%$ Non-Metro) | Included in CTC | Part of Gross Monthly Cash |
| **Employer EPF (12%)** | Employer contribution to provident fund | Included in CTC | Retained in EPF Account (Non-Cash) |
| **Employer Gratuity** | Statutory gratuity provision ($\approx 4.81\%$) | Included in CTC | Retained until 5-year tenure completion |
| **Employee EPF (12%)** | Statutory employee PF contribution | Subtracted from Gross | Deposited into EPF Passbook |
| **Income Tax (TDS)** | Monthly income tax withholding | Subtracted from Gross | Remitted to Income Tax Dept |

---

### Step-by-Step Worked Example

Assume a corporate professional receiving a **₹12,00,000 (₹12 LPA) CTC offer** in a Metro city, paying **₹20,000/month rent**:

1. **CTC Decomposition**:
   - Annual CTC = ₹12,00,000
   - Basic Salary (50%) = ₹6,00,000
   - Employer EPF (12% of Basic) = ₹72,000
   - Employer Gratuity (~4.81% of Basic) = ₹28,846
   - **Gross Annual Cash Salary** = ₹12,00,000 − ₹72,000 − ₹28,846 = **₹10,99,154** (Gross Monthly: ₹91,596)

2. **Employee Statutory Deductions**:
   - Employee EPF (12% of Basic) = ₹72,000/year (₹6,000/month)
   - Professional Tax (PT) = ₹2,500/year

3. **Tax & Net Monthly Take-Home (New Tax Regime FY 2025-26)**:
   - Taxable Income = ₹10,99,154 − ₹75,000 (Std Deduction) = ₹10,24,154
   - Income Tax (New Regime Slabs) = ₹53,616/year (₹4,468/month)
   - **Net Monthly In-Hand Take-Home** = **₹80,836 / month** (vs ₹1,00,000 CTC/12)
