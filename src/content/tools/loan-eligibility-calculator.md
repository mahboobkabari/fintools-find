---
title: "Loan Eligibility Calculator: FOIR & Borrowing Power Estimator"
metaDescription: "Calculate your maximum borrowing capacity for home, personal, and car loans using bank FOIR formulas and RBI LTV caps. Estimate affordable EMIs based on income."
category: "loans"
categoryName: "Loan & EMI Calculators"
slug: "loan-eligibility-calculator"
currency: "INR"
howToUse:
  - "Select your target loan category (Home Loan, Personal Loan, or Car Loan)."
  - "Enter your primary gross monthly take-home income in Rupees (₹)."
  - "Add co-applicant monthly income (spouse or parent) if applying jointly."
  - "Enter your total existing monthly EMI obligations (car loans, credit cards, personal loans)."
  - "Set the expected annual interest rate (% p.a.) and loan tenure (years)."
  - "Choose an illustrative FOIR scenario (40%, 50%, or 60%) and credit profile tier."
  - "Instantly view your estimated borrowing capacity, available EMI capacity, and repayment health score."
features:
  - "Institutional FOIR (Fixed Obligation to Income Ratio) calculation engine"
  - "Statutory RBI Loan-to-Value (LTV) ceiling verification for Home Loans"
  - "Co-applicant income pooling and debt-deduction engine"
  - "Dual Mode (Borrowing Power vs Reverse Required Income & EMI Reduction Solver)"
  - "4-Scenario FOIR Simulator (40%, 50%, 60%, Co-Applicant Joined)"
  - "5-Tenure Comparison Matrix (10 Years to 30 Years)"
  - "Repayment Burden Health Snapshot & Year-by-Year Amortization Schedule"
benefits:
  - "Know your estimated borrowing capacity before applying to prevent bank loan rejections"
  - "Avoid hard credit score inquiries caused by applying for unapproved loan amounts"
  - "Understand how paying off existing small debts increases your borrowing capacity"
  - "Evaluate the tradeoff between longer loan tenure and total interest paid"
faqs:
  - question: "What is a Loan Eligibility Calculator?"
    answer: "A Loan Eligibility Calculator is an interactive financial tool that estimates the maximum loan principal a borrower could qualify for based on monthly take-home income, existing obligations, loan category, interest rate, and lender underwriting assumptions."
  - question: "What is FOIR in loan eligibility?"
    answer: "FOIR stands for Fixed Obligation to Income Ratio. It is the percentage of monthly income that lenders permit for total loan repayments (typically 40% to 60%). For example, if your monthly income is ₹1 Lakh and the bank's FOIR assumption is 50%, your total combined monthly EMIs cannot exceed ₹50,000."
  - question: "Are FOIR thresholds mandated by the RBI?"
    answer: "No. The Reserve Bank of India (RBI) does not prescribe a universal FOIR threshold for all commercial banks. FOIR thresholds are internal risk policies determined independently by each bank or housing finance company (HFC) based on income tiers and credit profiles."
  - question: "What are RBI's statutory LTV caps on Home Loans?"
    answer: "Under RBI Circular DBR.BP.BC.No.74/21.04.048/2014-15, individual housing loans are subject to statutory Loan-to-Value (LTV) ceilings: max 90% LTV for loans ≤ ₹30 Lakhs, max 80% LTV for loans between ₹30 Lakhs and ₹75 Lakhs, and max 75% LTV for loans exceeding ₹75 Lakhs."
  - question: "How can I increase my loan eligibility?"
    answer: "You can increase your loan eligibility by adding a co-applicant (spouse or parent), paying off existing credit card and personal loan debts, selecting a longer loan tenure, or maintaining a CIBIL credit score above 750."
  - question: "Does existing credit card debt lower loan eligibility?"
    answer: "Yes. Any ongoing credit card EMIs or high outstanding monthly debt obligations reduce your available monthly EMI capacity, directly lowering the maximum loan amount lenders will approve."
calculatorModule: "loans/loan-eligibility-calculator.js"
publishDate: 2026-08-06
priority: "P0"
eeat:
  reviewedBy: "Fintools Find Engineering & Quant Team"
  methodology: "Calculations enforce Reserve Bank of India (RBI) statutory LTV ceilings (DBR.BP.BC.No.74/21.04.048/2014-15) and standard retail banking FOIR formulations."
  dataSources:
    - "Reserve Bank of India (RBI) Housing Finance LTV Circular DBR.BP.BC.No.74/21.04.048/2014-15"
    - "Standard Commercial Banking Credit & FOIR Guidelines (SBI, HDFC, ICICI, Axis Bank)"
advancedContent:
  definitionSnippet: "A Loan Eligibility Calculator is an institutional-grade financial decision tool that computes estimated maximum borrowing capacity using Fixed Obligation to Income Ratio (FOIR) guidelines, co-applicant income pooling, statutory RBI LTV caps, and reverse PMT present value formulas."
  proTips:
    - "Prepaying small personal loans or high-cost credit card EMIs before applying for a large mortgage instantly frees up available EMI capacity."
    - "Adding an earning co-applicant (spouse) combines household incomes, expanding your total FOIR obligation ceiling."
    - "Maintain a credit score above 750 to qualify for prime advertised interest rates and higher lender FOIR allowances."
  commonMistakes:
    - "Applying for a loan principal higher than your repayment capacity, triggering loan rejection and a negative credit score hit."
    - "Failing to disclose existing monthly debt commitments during preliminary bank eligibility checks."
  glossaryTerms:
    - term: "FOIR (Fixed Obligation to Income Ratio)"
      definition: "The maximum proportion of monthly income that lenders permit to be allocated toward total monthly loan repayments."
    - term: "LTV (Loan-to-Value Ratio)"
      definition: "The maximum percentage of a property's market value that a regulated lender can finance under RBI guidelines."
    - term: "Co-Applicant"
      definition: "An additional individual (such as a spouse or parent) who joins a loan application, combining incomes to expand borrowing power."
---

## What is a Loan Eligibility Calculator?

A **Loan Eligibility Calculator** helps borrowers determine the estimated maximum loan principal banks and housing finance companies (HFCs) are willing to lend based on their financial profile.

Before submitting a formal loan application for a [Home Loan](/tools/loans/home-loan-calculator/), [Car Loan](/tools/loans/car-loan-calculator/), or [Personal Loan](/tools/loans/personal-loan-calculator/), evaluating your borrowing capacity prevents bank rejections. Application rejections trigger hard credit inquiries that lower your CIBIL credit score.

---

## The FOIR Calculation Formula

Commercial banks evaluate repayment capacity using the **Fixed Obligation to Income Ratio (FOIR)**:

$$\text{Max Total Monthly EMI Allowed} = \text{Total Monthly Income} \times \left(\frac{\text{FOIR \%}}{100}\right)$$

$$\text{Available Monthly EMI Capacity } (E_{\text{avail}}) = \max\left(0, \text{Max Total EMI Allowed} - \text{Existing EMIs}\right)$$

### Present Value (Reverse PMT) Formula
Once available monthly EMI capacity is calculated, maximum eligible loan principal ($P_{\text{max}}$) is determined using reverse PMT discounting:

$$P_{\text{max}} = E_{\text{avail}} \times \left[ \frac{(1+r_m)^N - 1}{r_m (1+r_m)^N} \right]$$

Where:
* $r_m = \frac{\text{Annual Rate}}{12 \times 100}$ (Effective Monthly Interest Rate)
* $N = \text{Tenure Years} \times 12$ (Total Repayment Months)

---

## Statutory RBI LTV Ceilings vs. Bank FOIR Policies

It is critical to distinguish statutory regulatory rules from lender underwriting assumptions:

1. **Statutory RBI LTV Ceilings (DBR.BP.BC.No.74/21.04.048/2014-15):**
   * **Individual Housing Loans ≤ ₹30 Lakhs:** Max LTV Ceiling = **90%** of property value.
   * **Individual Housing Loans ₹30L – ₹75L:** Max LTV Ceiling = **80%** of property value.
   * **Individual Housing Loans > ₹75 Lakhs:** Max LTV Ceiling = **75%** of property value.
2. **Lender FOIR Policies (Illustrative Assumptions):**
   * FOIR is **not** an RBI mandate. Lenders independently set FOIR limits (40% for lower incomes, 50% standard, 60% for high earners/co-applicants).

---

## Worked Example: ₹1.0 Lakh Monthly Income

Suppose you earn a **gross monthly income of ₹1,00,000 (₹1 Lakh)** and currently pay **₹10,000/mo** in existing credit card EMIs:

* **Assumed Lender FOIR:** **50%**
* **Expected Interest Rate:** **8.5% p.a.**
* **Loan Tenure:** **20 Years** (240 months).

### Step-by-Step Eligibility Calculation:
1. **Max Total EMI Allowed (50% of ₹1L):** **₹50,000 per month**
2. **Available Monthly EMI Capacity:** $₹50,000 - ₹10,000 = \mathbf{₹40,000\text{ per month}}$
3. **Maximum Estimated Loan Principal:** **₹46,08,127 (₹46.08 Lakhs)**

If you prepay your ₹10,000 existing EMI debt, your available monthly EMI capacity rises to ₹50,000, increasing your home loan borrowing limit from **₹46.08 Lakhs to ₹57.60 Lakhs**—an instant gain of **₹11.52 Lakhs** in borrowing power!

---

## 4 Proven Ways to Safely Increase Loan Eligibility

1. **Prepay Existing Short-Term Debts:** Clear credit card EMIs and personal loans before applying for a mortgage.
2. **Add an Earning Co-Borrower:** Applying jointly with a working spouse combines monthly incomes, expanding your total FOIR ceiling.
3. **Opt for an Optimal Tenure:** Extending loan tenure from 15 to 20 or 25 years increases borrowing capacity, though it increases total interest paid over time.
4. **Maintain a 750+ CIBIL Score:** Prime credit scores qualify borrowers for advertised base interest rates with minimal risk markups.