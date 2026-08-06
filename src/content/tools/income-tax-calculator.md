---
title: "Income Tax Calculator FY 2025-26: New Tax Regime Slabs"
metaDescription: "Calculate income tax liability for FY 2025-26 (AY 2026-27) under the New Tax Regime. Estimate taxable income, Section 87A rebate, and net take-home salary."
category: "tax"
categoryName: "Tax Calculators"
slug: "income-tax-calculator"
currency: "INR"
howToUse:
  - "Enter your gross annual income (salary, business income, freelancing, or rental income) in Rupees (₹)."
  - "Adjust standard deduction (default ₹75,000 as per Budget 2024/2025)."
  - "View your net taxable income, base income tax, 4% Health & Education Cess, total income tax payable, and net take-home pay."
features:
  - "New Tax Regime tax slab engine (FY 2025-26)"
  - "Section 87A rebate automation (zero tax up to ₹7 Lakhs taxable income)"
  - "Real-time calculation with synchronized range sliders"
  - "Visual net take-home vs total tax payable ratio bar"
benefits:
  - "Determine exact tax liabilities before annual income tax return filing"
  - "Maximize net take-home pay by budgeting with official slab rates"
  - "Understand the ₹75,000 standard deduction impact under the New Tax Regime"
faqs:
  - question: "What is the standard deduction in the New Tax Regime for FY 2025-26?"
    answer: "The standard deduction under the New Tax Regime is ₹75,000 for salaried employees and pensioners for FY 2025-26 (increased from ₹50,000 in Budget 2024)."
  - question: "Is income up to ₹7 Lakhs tax-free in India?"
    answer: "Yes. Under Section 87A of the Income Tax Act, salaried individuals with taxable income up to ₹7,00,000 qualify for a 100% tax rebate under the New Tax Regime, resulting in zero net tax payable."
  - question: "What are the New Tax Regime slabs for FY 2025-26?"
    answer: "Income up to ₹3L: Nil | ₹3L to ₹7L: 5% | ₹7L to ₹10L: 10% | ₹10L to ₹12L: 15% | ₹12L to ₹15L: 20% | Above ₹15L: 30%."
calculatorModule: "tax/income-tax-calculator.js"
publishDate: 2026-08-06
priority: "P0"
eeat:
  reviewedBy: "FinTool Engineering & Quant Team"
  methodology: "Calculations model official Central Board of Direct Taxes (CBDT) tax slabs and Section 87A rebate rules."
  dataSources:
    - "Income Tax Department, Government of India"
    - "Union Budget 2024 & Finance Act Amendments"
advancedContent:
  definitionSnippet: "An Income Tax Calculator is an interactive financial tool that computes annual tax liabilities, Health & Education Cess, and net take-home pay under official CBDT tax slabs."
  proTips:
    - "Salaried individuals earning up to ₹7,75,000 pay zero tax thanks to the ₹75,000 standard deduction and Section 87A rebate."
    - "Evaluate whether the New Tax Regime or Old Tax Regime saves more tax if you have large housing loan interest or Section 80C deductions."
  commonMistakes:
    - "Forgetting to apply the 4% Health & Education Cess on base income tax."
    - "Assuming Section 87A rebate applies automatically if gross income exceeds ₹7.75 Lakhs."
  glossaryTerms:
    - term: "Section 87A Rebate"
      definition: "An income tax rebate granting up to ₹25,000 tax relief for resident individuals with taxable income up to ₹7 Lakhs."
    - term: "Standard Deduction"
      definition: "A flat deduction allowed from gross salary income without requiring proof of expenditure."
---

## What is an Income Tax Calculator?

An **Income Tax Calculator** is a direct tool designed to compute personal income tax liabilities for salaried employees, self-employed professionals, and business owners under the default **New Tax Regime (FY 2025-26 / AY 2026-27)**.

Knowing your exact income tax liability enables accurate annual budgeting, payroll TDS verification, and income tax return (ITR-1 / ITR-2) filing.

### Who Should Use It & When?
* **Salaried Employees:** At the start of the financial year (April) to submit Form 12BB tax declarations to HR employers.
* **Property Buyers:** When evaluating home loan interest deductions under Section 24(b) (up to ₹2 Lakhs) via our [Home Loan Calculator](/tools/loans/home-loan-calculator/).
* **Student Borrowers:** When estimating Section 80E interest deductions for higher education loans via our [Education Loan Calculator](/tools/loans/education-loan-calculator/).
* **Freelancers & Consultants:** Quarter-by-quarter to calculate advance tax obligations due in June, September, December, and March.

---

## Income Tax Slabs (FY 2025-26 / New Tax Regime)

| Income Slab | Tax Rate | Notes |
|---|---|---|
| **Up to ₹3,00,000** | **Nil** | Basic Exemption Limit |
| **₹3,00,001 – ₹7,00,000** | **5%** | Rebatable under Sec 87A if taxable income $\le$ ₹7L |
| **₹7,00,001 – ₹10,00,000** | **10%** | Standard Tax Bracket |
| **₹10,00,001 – ₹12,00,000** | **15%** | Mid Tax Bracket |
| **₹12,00,001 – ₹15,00,000** | **20%** | Higher Tax Bracket |
| **Above ₹15,00,000** | **30%** | Peak Tax Bracket |

---

## Practical Worked Example: ₹12 Lakh Annual Salary

Suppose an employee earns a **gross annual salary of ₹12,00,000 (₹12 Lakhs)**:

1. **Gross Salary:** **₹12,00,000**
2. **Standard Deduction:** **₹75,000**
3. **Net Taxable Income:** $₹12,00,000 - ₹75,000 = \mathbf{₹11,25,000}$

### Slab-by-Slab Base Tax Calculation
* **₹0 to ₹3,00,000 (Nil):** ₹0
* **₹3,00,001 to ₹7,00,000 (5% of ₹4L):** ₹20,000
* **₹7,00,001 to ₹10,00,000 (10% of ₹3L):** ₹30,000
* **₹10,00,001 to ₹11,25,000 (15% of ₹1.25L):** ₹18,750
* **Base Tax Payable:** $₹20,000 + ₹30,000 + ₹18,750 = \mathbf{₹68,750}$
* **Health & Education Cess (4% of ₹68,750):** **₹2,750**
* **Total Tax Payable:** $₹68,750 + ₹2,750 = \mathbf{₹71,500}$
* **Net Take-Home Annual Salary:** $₹12,00,000 - ₹71,500 = \mathbf{₹11,28,500}$