---
title: "TDS Calculator: Tax Deducted at Source Rate & Net Payout Estimator"
metaDescription: "Calculate Tax Deducted at Source (TDS) for salary, professional fees, contractor payments, and bank FD interest. View net cash payout and 26AS credit."
category: "tax"
categoryName: "Tax Calculators"
slug: "tds-calculator"
currency: "INR"
howToUse:
  - "Enter the gross bill, invoice, or payment amount in Rupees (₹)."
  - "Select the applicable statutory TDS rate percentage (e.g. 10% for professional fees, 2% for contractors, 10% for rent)."
  - "Specify whether a valid PAN (Permanent Account Number) is furnished by the deductee."
  - "Instantly view your calculated TDS amount, net cash payout receivable, and Section 206AA non-PAN tax impact."
features:
  - "Statutory TDS rate engine supporting major sections (194A, 194C, 194I, 194J)"
  - "Section 206AA non-PAN 20% higher tax deduction penalty automation"
  - "Real-time calculation with synchronized range sliders"
  - "Visual net cash payout vs TDS tax ratio progress bar"
benefits:
  - "Prevent invoice underpayments and billing disputes between payers and deductees"
  - "Plan quarterly cash flow and advance tax payments with complete precision"
  - "Verify annual Form 26AS and AIS (Annual Information Statement) tax credit entries"
  - "Ensure compliance with statutory monthly TDS deposit deadlines (7th of following month)"
faqs:
  - question: "What is Tax Deducted at Source (TDS)?"
    answer: "Tax Deducted at Source (TDS) is a system introduced by the Indian Income Tax Department where a person or company (deductor) responsible for making specified payments (such as salary, rent, interest, or professional fees) deducts a prescribed percentage of tax before transferring the net balance to the recipient (deductee)."
  - question: "What is Section 194J TDS on professional and technical fees?"
    answer: "Section 194J mandates a 10% TDS deduction on professional fees (lawyers, doctors, engineers, consultants) and technical services if aggregate payments to a single professional exceed ₹30,000 in a financial year."
  - question: "What is Section 194A TDS on bank fixed deposit (FD) interest?"
    answer: "Section 194A requires banks to deduct 10% TDS on annual fixed deposit (FD) interest if total interest earned across bank branches exceeds ₹40,000 per year (₹50,000 for senior citizens aged 60+)."
  - question: "What happens if I do not furnish my PAN card to the deductor?"
    answer: "Under Section 206AA of the Income Tax Act, if a deductee fails to furnish a valid PAN card to the deductor, TDS is deducted at a penal rate of 20% (or the prescribed rate, whichever is higher)."
  - question: "Can I claim a refund for excess TDS deducted?"
    answer: "Yes. If total TDS deducted during the financial year exceeds your actual final income tax liability (calculated via our Income Tax Calculator), you can claim a 100% refund of excess TDS plus interest by filing your annual Income Tax Return (ITR)."
  - question: "What is Form 16A?"
    answer: "Form 16A is a quarterly TDS certificate issued by deductors to deductees showing the total gross payment made and the exact amount of TDS deducted and deposited with the government under non-salary sections."
calculatorModule: "tax/tds-calculator.js"
publishDate: 2026-08-06
priority: "P0"
eeat:
  reviewedBy: "Fintools Find Engineering & Quant Team"
  methodology: "Calculations strictly execute Central Board of Direct Taxes (CBDT) statutory TDS rate provisions under Income Tax Act, 1961."
  dataSources:
    - "Income Tax Department, Government of India (TDS Rate Chart & Section 206AA Rules)"
    - "TRACES (TDS Reconciliation Analysis and Correction Enabling System)"
advancedContent:
  definitionSnippet: "A TDS Calculator is an interactive tax tool that computes Tax Deducted at Source (TDS) amounts, statutory section rates, non-PAN penalties, and net cash payouts for invoices and payments."
  proTips:
    - "Submit Form 15G or Form 15H to your bank at the start of the financial year if your total taxable income is below the exemption limit to prevent 10% TDS on FD interest."
    - "Regularly check your Form 26AS on the Income Tax e-filing portal to verify that deductors have deposited TDS under your PAN."
    - "Ensure TDS payments are deposited by the 7th of the following month to avoid 1.5% per month interest penalties."
  commonMistakes:
    - "Assuming TDS deducted is your final tax liability (if you fall in the 30% tax bracket, you must pay the 20% balance tax during ITR filing)."
    - "Failing to furnish PAN card details to clients, resulting in an avoidable 20% Section 206AA TDS deduction."
  glossaryTerms:
    - term: "Deductor"
      definition: "The person or entity making a payment who is legally obligated to deduct tax at source."
    - term: "Deductee"
      definition: "The recipient of the payment from whose income TDS is withheld."
    - term: "Section 206AA"
      definition: "The statutory tax provision mandating a minimum 20% TDS deduction if a valid PAN is not furnished."
---

## What is a TDS Calculator?

A **TDS Calculator** (Tax Deducted at Source Calculator) is a financial tax tool designed for freelancers, contractors, salaried professionals, business owners, and bank depositors to calculate statutory withholding tax amounts and net cash payouts.

Under the Indian Income Tax Act, withholding tax ensures steady revenue collection for the government at the point of income generation. Calculating exact TDS deductions prevents invoicing disputes, ensures accurate quarterly advance tax planning, and simplifies annual Income Tax Return (ITR) filing.

### Who Should Use It & When?
* **Freelancers & Independent Consultants:** Before issuing invoices for professional services under Section 194J (10% TDS).
* **Contractors & Service Vendors:** When billing clients for commercial work contracts under Section 194C (1% or 2% TDS).
* **Property Landlords & Tenants:** When paying monthly commercial or residential rent above ₹2,40,000/year under Section 194I (10% TDS).
* **Bank Fixed Deposit Investors:** When evaluating net interest payouts after bank TDS deductions on fixed deposits.

---

## Common Statutory TDS Rate Slabs (FY 2025-26)

| Income Type / Section | Statutory TDS Rate | Exemption Threshold Limit | Mandatory PAN Rate |
|---|---|---|---|
| **Sec 194A (Bank FD Interest)** | **10%** | ₹40,000/yr (₹50,000 for Senior Citizens) | 20% |
| **Sec 194J (Professional / Tech Fees)** | **10%** | ₹30,000/yr per professional | 20% |
| **Sec 194C (Contractor - Individual/HUF)** | **1%** | ₹30,000 single bill / ₹1,00,000 aggregate | 20% |
| **Sec 194C (Contractor - Company/Firm)** | **2%** | ₹30,000 single bill / ₹1,00,000 aggregate | 20% |
| **Sec 194I (Rent - Building & Land)** | **10%** | ₹2,40,000/yr | 20% |
| **Sec 194H (Brokerage & Commission)** | **5%** | ₹15,000/yr | 20% |

---

## TDS Calculation Formulas & Mathematical Logic

### 1. Standard TDS Formula (With Valid PAN)

$$\text{TDS Amount} = \text{Gross Payment Amount} \times \left( \frac{\text{Statutory TDS Rate \%}}{100} \right)$$

$$\text{Net Cash Payout} = \text{Gross Payment Amount} - \text{TDS Amount}$$

### 2. Penal TDS Formula (Without PAN - Section 206AA)

$$\text{Effective TDS Rate} = \max(20\%, \text{Statutory TDS Rate})$$

$$\text{Penal TDS Amount} = \text{Gross Payment Amount} \times \left( \frac{\text{Effective TDS Rate \%}}{100} \right)$$

---

## Practical Worked Examples

### Example 1: Professional Consulting Fee (₹1,00,000 Invoice @ 10% TDS with PAN)

Suppose an IT consultant bills a corporate client **₹1,00,000** under Section 194J:

1. **Gross Invoice Amount:** **₹1,00,000**
2. **Statutory TDS Rate (Sec 194J):** **10%**
3. **TDS Amount Withheld:** $₹1,00,000 \times 0.10 = \mathbf{₹10,000}$
4. **Net Cash Received by Consultant:** $₹1,00,000 - ₹10,00,000 = \mathbf{₹90,000}$
5. **Tax Credit Logged in Form 26AS:** **₹10,000**

---

### Example 2: Contractor Invoice Without PAN (Section 206AA Penalty)

Suppose a contractor submits a **₹1,00,000** invoice under Section 194C (normally 2% TDS), but fails to provide a PAN card:

1. **Gross Invoice Amount:** **₹1,00,000**
2. **Effective Rate (Sec 206AA Penalty):** **20%** (instead of standard 2%)
3. **TDS Amount Withheld:** $₹1,00,000 \times 0.20 = \mathbf{₹20,00,000}$
4. **Net Cash Received:** $₹1,00,000 - ₹20,000 = \mathbf{₹80,000}$

Failing to provide a PAN card increases the withheld tax tenfold from **₹2,000 to ₹20,000**!

---

## 5 Essential Strategies for TDS Management

1. **Always Furnish PAN Details:** Provide your valid PAN card on all invoices to avoid penal 20% TDS under Section 206AA.
2. **Reconcile Form 26AS Quarterly:** Check TRACES Form 26AS online every quarter to verify that clients have deposited deducted tax against your PAN.
3. **Submit Form 15G / 15H Early:** Senior citizens and low-income taxpayers should submit Form 15G/15H to banks in April to prevent 10% TDS on FD interest.
4. **Claim 100% Excess TDS Refunds:** File your annual Income Tax Return (ITR) to claim full refunds plus 0.5%/month government interest if excess TDS was deducted.
5. **Plan Take-Home Salary:** Salaried employees can calculate their net monthly salary after employer payroll TDS using our [Income Tax Calculator](/tools/tax/income-tax-calculator/).