---
title: "Mutual Fund Returns Calculator: Estimate SIP & Lumpsum CAGR / XIRR Gains"
metaDescription: "Calculate mutual fund returns, CAGR, XIRR, and net wealth growth for SIP and lumpsum investments. Compare equity, hybrid, and index fund performance."
category: "investment"
categoryName: "Investment Calculators"
slug: "mutual-fund-returns-calculator"
currency: "INR"
howToUse:
  - "Select your preferred investment mode (Monthly SIP or One-Time Lumpsum)."
  - "Enter your monthly contribution or initial lump-sum principal in Rupees (₹)."
  - "Set your expected annual return rate (% p.a.)."
  - "Select your investment duration in years."
  - "Enter assumed exit load (%) or inflation rate (%) if applicable."
  - "Instantly view your net maturity value, estimated net profit, XIRR / CAGR, absolute return %, and real corpus."
features:
  - "Dual SIP (XIRR) & Lumpsum (CAGR) calculation mode engine"
  - "Mathematically rigorous Newton-Raphson XIRR solver for SIP cash flows"
  - "Assumed exit load deduction modeling"
  - "Inflation-adjusted real purchasing power corpus calculation"
  - "Illustrative benchmark comparisons (Nifty 50, FD, Gold, Inflation)"
  - "Direct Plan TER expense ratio savings scenario (+0.75% return)"
  - "Hypothetical 5-scenario sensitivity simulator grid"
benefits:
  - "Forecast potential wealth accumulation before investing in mutual fund schemes"
  - "Differentiate CAGR (lumpsum) vs XIRR (SIP) to evaluate returns accurately"
  - "Understand the financial advantage of Direct Growth plans over Regular plans"
  - "Evaluate portfolio returns in real inflation-adjusted purchasing power terms"
faqs:
  - question: "What is the difference between CAGR and XIRR in mutual funds?"
    answer: "CAGR (Compounded Annual Growth Rate) measures the geometric annualized return for a single one-time lump-sum investment. XIRR (Extended Internal Rate of Return) measures the money-weighted annualized return for multiple recurring cash flows, such as monthly SIP contributions."
  - question: "Are mutual fund NAVs net of expense ratio?"
    answer: "Yes. In India, Net Asset Values (NAVs) published daily by Asset Management Companies (AMCs) are already net of the Total Expense Ratio (TER). The expected return rate entered into this calculator reflects your net return after fund expenses."
  - question: "How does exit load affect my mutual fund returns?"
    answer: "Exit load is a fee charged by mutual fund schemes if units are redeemed before a specified duration (typically 1% if redeemed within 1 year for equity funds). The calculator deducts the exit load percentage from your gross maturity value if an exit-load assumption is provided."
  - question: "How are equity mutual fund capital gains taxed in India (FY 2025-26)?"
    answer: "Under Budget 2024 rules (Finance Act 2024), Short-Term Capital Gains (STCG, units held <=12 months) are taxed at 20%. Long-Term Capital Gains (LTCG, units held >12 months) are taxed at 12.5% on aggregate profits exceeding ₹1,25,000 per financial year."
  - question: "What is the advantage of Direct Mutual Fund plans over Regular plans?"
    answer: "Direct plans are purchased directly from the AMC without paying distributor commissions, resulting in a lower Total Expense Ratio (typically 0.75% to 1.0% p.a. lower). This lower TER compounds over 10-20 years to add lakhs of rupees to your net corpus."
calculatorModule: "investment/mutual-fund-returns-calculator.js"
publishDate: 2026-08-06
priority: "P0"
eeat:
  reviewedBy: "Fintools Find Engineering & Quant Team"
  methodology: "Calculations execute standard Time Value of Money (TVM) annuity formulas for SIPs and geometric compound interest for Lumpsum, with XIRR calculated via Newton-Raphson cash-flow solvers."
  dataSources:
    - "AMFI India Mutual Fund Regulations & Benchmark Metrics"
    - "Central Board of Direct Taxes (CBDT) Capital Gains Tax Guidelines"
advancedContent:
  definitionSnippet: "A Mutual Fund Returns Calculator is an interactive financial decision tool that computes maturity corpus, net capital gains, CAGR, XIRR, and real inflation-adjusted purchasing power for SIP and lumpsum investments."
  proTips:
    - "Choose Direct Growth plans to save ~0.75% in annual TER, compounding into lakhs of additional wealth over 10+ years."
    - "Stay invested for at least 7 to 10 years in equity mutual funds to smooth out short-term market cycles."
    - "Use XIRR to measure annual performance for monthly SIPs; do not use simple CAGR on total SIP contributions."
  commonMistakes:
    - "Subtracting expense ratio twice from return rates when AMC NAVs are already net of TER."
    - "Applying simple CAGR formulas directly to total SIP contributions instead of money-weighted XIRR."
    - "Ignoring exit load deductions when redeeming units within 12 months."
  glossaryTerms:
    - term: "Net Asset Value (NAV)"
      definition: "The per-unit market value of a mutual fund scheme, published daily net of scheme expenses."
    - term: "CAGR"
      definition: "Compounded Annual Growth Rate, measuring annualized geometric return for one-time investments."
    - term: "XIRR"
      definition: "Extended Internal Rate of Return, measuring money-weighted annualized return for dated cash flows."
    - term: "Total Expense Ratio (TER)"
      definition: "Annual operational and management fees charged by AMC, deducted daily from scheme assets."
---

## What is a Mutual Fund Returns Calculator?

A **Mutual Fund Returns Calculator** is an essential wealth planning tool designed to forecast maturity values, net profits, and annualized returns for both **Systematic Investment Plans (SIP)** and **Lumpsum Investments**.

Whether investing ₹5,000 monthly in an index fund or deploying a ₹1 Lakh lump-sum in a flexi-cap scheme, understanding your expected **CAGR**, **XIRR**, and **real purchasing power** helps you align portfolio choices with major life goals like retirement, property purchase, or financial independence.

---

## CAGR vs. XIRR: Which Metric Should You Use?

Understanding how returns are annualized is critical for financial accuracy:

| Metric | Full Name | Best Used For | Calculation Basis |
|---|---|---|---|
| **CAGR** | Compounded Annual Growth Rate | **Lumpsum Investments** | Single initial principal invested at $T=0$ |
| **XIRR** | Extended Internal Rate of Return | **Monthly SIP / Recurring Cash Flows** | Money-weighted return on dated contributions |

> [!NOTE]
> Applying simple CAGR directly to total SIP contributions underestimates your true money-weighted annual performance because SIP payments are made over time. This calculator uses **CAGR for Lumpsum** and **XIRR for SIP**.

---

## Mutual Fund Return Formulas

### 1. Lumpsum Compounding & CAGR Formula
For a single lump-sum principal ($P$) held over $Y$ years:

$$\text{Maturity Value (FV)} = P \times (1 + r)^Y$$

$$\text{CAGR \%} = \left( \left( \frac{\text{FV}}{P} \right)^{1/Y} - 1 \right) \times 100$$

### 2. Monthly SIP Annuity & XIRR Cash-Flow Equation
For monthly contributions ($P$) over $N$ months ($N = Y \times 12$):

$$\text{Maturity Value (FV)} = P \times \left[ \frac{(1+i)^N - 1}{i} \right] \times (1 + i), \quad i = \frac{r}{12 \times 100}$$

$$\sum_{k=0}^{N-1} \frac{-P}{(1 + r_{\text{xirr}})^{(d_k - d_0)/365.25}} + \frac{\text{FV}}{(1 + r_{\text{xirr}})^{(d_N - d_0)/365.25}} = 0$$

---

## Practical Worked Example: ₹5,000 Monthly SIP vs. ₹1 Lakh Lumpsum

Consider two investors over a **10-year period** at an expected return rate of **12% p.a.**:

* **Investor A: ₹5,000 Monthly SIP**
  * Total Invested Capital: **₹6,00,000** (120 monthly payments)
  * **Net Maturity Corpus:** **₹11,61,695**
  * Est. Net Profit: **₹5,61,695**
  * **XIRR Annualized Return:** **12.68% p.a.**
  * Absolute Return: **+93.62%** (1.94x Multiplier)

* **Investor B: ₹1,00,000 One-Time Lumpsum**
  * Initial Principal: **₹1,00,000**
  * **Net Maturity Corpus:** **₹3,10,585**
  * Est. Net Profit: **₹2,10,585**
  * **CAGR Annualized Return:** **12.00% p.a.**
  * Absolute Return: **+210.59%** (3.11x Multiplier)

---

## Related Financial Calculators

- [Capital Gains Tax Calculator](/tools/tax/capital-gains-tax-calculator/) – Calculate STCG (20%) and LTCG (12.5% above ₹1.25L) tax liabilities on mutual fund redemptions.
- [CAGR Calculator](/tools/investment/cagr-calculator/) – Compute annualized compound growth rates for multi-year investments.
- [Lumpsum Calculator](/tools/investment/lumpsum-calculator/) – Project future wealth for one-time lump-sum investments.
- [SIP Calculator](/tools/investment/sip-calculator/) – Plan systematic investment contributions and wealth goals.
- [Step-Up SIP Calculator](/tools/investment/step-up-sip-calculator/) – Calculate returns with annual SIP contribution step-ups.
- [SWP Calculator](/tools/investment/swp-calculator/) – Plan systematic withdrawal plans for regular monthly income.
- [Income Tax Calculator](/tools/tax/income-tax-calculator/) – Estimate annual personal income tax liabilities under Old vs New Tax Regime.