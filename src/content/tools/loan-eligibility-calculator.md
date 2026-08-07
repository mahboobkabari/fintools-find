---
title: "Loan Eligibility Calculator: FOIR & Borrowing Power Estimator"
metaDescription: "Calculate your maximum borrowing capacity for home, personal, and car loans using the bank FOIR formula. Estimate affordable EMIs based on monthly income."
category: "loans"
categoryName: "Loan & EMI Calculators"
slug: "loan-eligibility-calculator"
currency: "INR"
howToUse:
  - "Enter your gross monthly take-home income in Rupees (₹)."
  - "Enter your total existing monthly EMI obligations (car loans, credit card EMIs, personal loans)."
  - "Set the expected annual interest rate (p.a.)."
  - "Select your desired loan tenure (from 1 to 30 years)."
  - "Set the bank FOIR (Fixed Obligation to Income Ratio) limit (standard is 50%)."
  - "Instantly view your maximum eligible loan principal amount and maximum available monthly EMI capacity."
features:
  - "Banking-standard FOIR (Fixed Obligation to Income Ratio) calculation engine"
  - "Existing EMI debt deduction engine"
  - "Real-time calculation with synchronized range sliders"
  - "Visual maximum borrowing capacity progress bar"
  - "Multi-tenure eligibility comparison"
benefits:
  - "Know your exact maximum loan limit before applying to prevent bank loan rejections"
  - "Avoid hard credit score inquiries caused by applying for unapproved loan amounts"
  - "Understand how paying off existing small debts increases your borrowing capacity"
  - "Select optimal loan tenures to maximize eligible borrowing limits"
faqs:
  - question: "What is a Loan Eligibility Calculator?"
    answer: "A Loan Eligibility Calculator is an online tool that computes the maximum loan amount a bank or lender will sanction based on your monthly income, existing debts, interest rate, and loan tenure."
  - question: "What is FOIR in loan eligibility?"
    answer: "FOIR stands for Fixed Obligation to Income Ratio. It is the percentage of your monthly income that banks allow for total loan repayments (typically 40% to 60%). If your monthly income is ₹1 Lakh and the bank's FOIR limit is 50%, your total combined EMIs cannot exceed ₹50,000."
  - question: "How can I increase my loan eligibility?"
    answer: "You can increase your loan eligibility by adding a co-applicant (e.g., spouse or parents), paying off existing credit card and personal loan debts, choosing a longer loan tenure, or maintaining a CIBIL score above 750."
  - question: "Does existing credit card debt lower loan eligibility?"
    answer: "Yes, any ongoing credit card EMIs or high outstanding credit balances reduce your available monthly EMI capacity, lowering the maximum loan amount banks will approve."
calculatorModule: "loans/loan-eligibility-calculator.js"
publishDate: 2026-08-06
priority: "P0"
eeat:
  reviewedBy: "Fintools Find Engineering & Quant Team"
  methodology: "Calculations strictly enforce Reserve Bank of India (RBI) retail lending guidelines and standard banking FOIR formulations."
  dataSources:
    - "Reserve Bank of India (RBI) Credit Assessment Guidelines"
    - "Standard Banking Fixed Obligation to Income Ratio (FOIR) Formulas"
advancedContent:
  definitionSnippet: "A Loan Eligibility Calculator is an interactive financial tool that determines the maximum loan amount a borrower qualifies for based on monthly take-home income, existing EMI obligations, interest rate, and bank FOIR limits."
  proTips:
    - "Pay off small personal loans or credit card EMIs before applying for a large home loan to instantly boost your borrowing limit."
    - "Adding an earning co-applicant (spouse) combines household incomes, increasing eligible loan limits by up to 80%."
    - "Keep your credit score above 750 to qualify for higher FOIR limits (up to 60%) from prime banks."
  commonMistakes:
    - "Applying for a loan amount higher than your eligible limit, resulting in loan application rejection and a negative credit score impact."
    - "Failing to disclose existing monthly debt obligations during preliminary bank applications."
  glossaryTerms:
    - term: "FOIR (Fixed Obligation to Income Ratio)"
      definition: "The maximum proportion of monthly income that lenders permit to be allocated toward total loan repayments."
    - term: "Co-Applicant"
      definition: "An additional individual (such as a spouse or parent) who joins a loan application, combining incomes to boost total borrowing capacity."
---

## What is a Loan Eligibility Calculator?

A **Loan Eligibility Calculator** helps borrowers determine the maximum loan amount banks and housing finance companies (HFCs) are willing to lend based on their financial profile.

Before submitting a formal loan application for a [Home Loan](/tools/loans/home-loan-calculator/), [Car Loan](/tools/loans/car-loan-calculator/), or [Personal Loan](/tools/loans/personal-loan-calculator/), checking your eligibility prevents loan rejections. Bank rejections trigger hard credit inquiries that lower your CIBIL credit score.

---

## The FOIR Calculation Formula

All commercial banks (such as SBI, HDFC, ICICI, and Axis Bank) evaluate borrowing capacity using the **Fixed Obligation to Income Ratio (FOIR)**:

$$\text{Max Total EMI Allowed} = \text{Gross Monthly Income} \times \left(\frac{\text{FOIR \%}}{100}\right)$$

$$\text{Max Available Monthly EMI} = \text{Max Total EMI Allowed} - \text{Existing EMIs}$$

### Present Value (Reverse PMT) Formula
Once the **Max Available Monthly EMI** is determined, the maximum eligible loan principal ($P$) is calculated by reversing the annuity formula:

$$P = \text{Max Available EMI} \times \left[ \frac{(1+r)^n - 1}{r \times (1+r)^n} \right]$$

---

## Practical Worked Example: ₹1 Lakh Monthly Income

Suppose you earn a **gross monthly income of ₹1,00,000 (₹1 Lakh)** and currently pay **₹10,00,000** per month in existing credit card EMIs:

* **Bank FOIR Limit:** **50%**
* **Expected Interest Rate:** **8.5% p.a.**
* **Loan Tenure:** **20 Years** (240 months).

### Step-by-Step Eligibility Breakdown
1. **Max Total EMI Allowed (50% of ₹1L):** **₹50,000 per month**
2. **Max Available Monthly EMI:** $₹50,000 - ₹10,000 = \mathbf{₹40,000\text{ per month}}$
3. **Maximum Eligible Loan Amount:** **₹46,09,460 (₹46.09 Lakhs)**

If you pay off your ₹10,000 existing EMI debt, your available monthly EMI capacity jumps from ₹40,000 to ₹50,000, increasing your home loan eligibility from **₹46.09 Lakhs to ₹57.61 Lakhs**—an instant gain of **₹11.52 Lakhs** in borrowing power!

---

## 4 Proven Ways to Increase Your Loan Eligibility

1. **Clear Existing Short-Term Debts:** Pay off credit card dues, personal loans, and consumer EMIs to free up monthly cash flow before applying for a mortgage.
2. **Add an Earning Co-Borrower:** Applying jointly with a working spouse combines monthly incomes, significantly expanding your bank FOIR ceiling.
3. **Opt for a Longer Tenure:** Extending loan tenure from 15 to 20 or 25 years lowers monthly EMI per Lakh borrowed, increasing total loan eligibility.
4. **Maintain a 750+ CIBIL Score:** Prime credit scores qualify borrowers for higher FOIR allowances (up to 60%) and lower interest rates.