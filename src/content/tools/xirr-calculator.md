---
title: "XIRR Calculator (Extended Internal Rate of Return)"
metaDescription: "Calculate Extended Internal Rate of Return (XIRR) for irregular SIPs, top-ups, partial redemptions, and mutual fund portfolios."
category: "investment"
categoryName: "Investment & Wealth Calculators"
slug: "xirr-calculator"
currency: "INR"
howToUse:
  - "Enter transaction dates and amounts for your investment cash flows."
  - "Use negative (-) numbers for investment outflows (e.g. -₹50,000 for a deposit)."
  - "Use positive (+) numbers for cash inflows, redemptions, or current net asset portfolio valuation."
  - "Click '+ Add Transaction' to add multi-year SIP deposits, step-up contributions, or partial withdrawals."
  - "Instantly view your annualized Extended Internal Rate of Return (XIRR % p.a.)."
  - "Audit absolute profit, absolute return percentage, total holding period, and equivalent CAGR benchmark."
features:
  - "Flagship XIRR calculation engine utilizing Newton-Raphson numerical root finding with bisection fallback"
  - "Dynamic multi-transaction cash flow table with Add Row and Delete Row controls"
  - "Clear cash-flow direction indicators (Outflow (-) vs Inflow (+))"
  - "Absolute profit and absolute return percentage indicators"
  - "Total holding period horizon counter"
  - "Side-by-side XIRR vs Benchmark CAGR comparison card"
  - "Scenario analysis matrix (+10% / -10% valuation sensitivities)"
benefits:
  - "Accurately measure real annualized returns for irregular Mutual Fund SIP investments"
  - "Factor in the exact dates of multiple top-up contributions and dividend/partial redemptions"
  - "Eliminate return calculation errors caused by simple CAGR or absolute return metrics"
  - "Compare portfolio performance against benchmark FD rates or market indices"
faqs:
  - question: "What is XIRR?"
    answer: "Extended Internal Rate of Return (XIRR) is the financial metric used to compute the annualized rate of return for a series of irregular cash flows occurring on specific dates. It accounts for both the exact timing and magnitude of every investment deposit and withdrawal."
  - question: "What is the difference between XIRR and CAGR?"
    answer: "CAGR (Compound Annual Growth Rate) assumes a single initial investment and a single final value over a fixed number of years. XIRR is an extension of CAGR designed to calculate annualized returns when there are multiple, irregular cash deposits or withdrawals over time (such as monthly SIPs)."
  - question: "Why must cash flows have both negative and positive values?"
    answer: "XIRR represents the interest rate that sets the Net Present Value (NPV) of all cash flows to zero. Investments or contributions represent money paid out (negative cash flow), while redemptions or current portfolio value represent money received (positive cash flow)."
  - question: "How is XIRR calculated in mutual funds?"
    answer: "Mutual fund companies and platforms (SEBI/AMFI compliant) use XIRR to report real investor returns because investors make multiple monthly SIP payments. Each SIP instalment earns returns for a different duration, which XIRR accurately annualizes."
  - question: "Can XIRR be negative?"
    answer: "Yes, if the total value of redemptions and current portfolio valuation is less than the total invested capital over time, the XIRR will be negative, indicating an annualized loss."
calculatorModule: "investment/xirr-calculator.js"
publishDate: 2026-08-08
priority: "P0"
eeat:
  reviewedBy: "Fintools Find Quantitative Finance & Engineering Team"
  methodology: "Calculations execute exact Newton-Raphson numerical root finding for the equation NPV(r) = sum [C_i / (1 + r)^((d_i - d_0)/365.25)] = 0."
  dataSources:
    - "Corporate Finance Institute (CFI) XIRR & Internal Rate of Return Guidelines"
    - "Investopedia Financial Engineering & XIRR Reference Standards"
advancedContent:
  definitionSnippet: "The XIRR Calculator computes the annualized Extended Internal Rate of Return for irregular, multi-transaction investment cash flows using Newton-Raphson numerical root finding."
  proTips:
    - "Always enter your current portfolio value as a positive cash flow on today's date to measure unrealized portfolio XIRR."
    - "For step-up SIPs or lump-sum top-ups, XIRR is the only accurate way to evaluate true annualized compounding returns."
    - "Compare your XIRR against benchmark equity indices (e.g. Nifty 50 XIRR over the same timeframe) to evaluate alpha."
  commonMistakes:
    - "Entering all amounts as positive numbers: XIRR will fail unless there is at least one negative outflow and one positive inflow."
    - "Confusing Absolute Return with XIRR: A 50% absolute return over 10 years translates to an XIRR of only ~4.14% p.a."
    - "Using incorrect dates: Date accuracy is critical for XIRR because day fractions directly dictate exponential discounting."
  glossaryTerms:
    - term: "XIRR"
      definition: "Extended Internal Rate of Return, an annualization algorithm for irregular dated cash flows."
    - term: "Cash Outflow"
      definition: "Money invested or deposited into an asset, represented as a negative numerical value (-)."
    - term: "Cash Inflow"
      definition: "Money received from redemption, dividend, or current net asset valuation, represented as a positive numerical value (+)."
---

## Understanding XIRR (Extended Internal Rate of Return)

**Extended Internal Rate of Return (XIRR)** is the gold standard metric for evaluating the true performance of investments involving **multiple cash flows on different dates**. While **CAGR** works well for a single lumpsum purchase, real-world investing often involves monthly **SIP installments**, lump-sum **top-ups**, **partial redemptions**, and **dividend payouts**.

---

## XIRR Mathematical Equation

$$\sum_{i=1}^{N} \frac{C_i}{(1 + \text{XIRR})^{\frac{d_i - d_1}{365.25}}} = 0$$

Where:
- $C_i$ = Cash flow amount at transaction $i$ (Negative for investments, Positive for redemptions/valuation)
- $d_i$ = Date of transaction $i$
- $d_1$ = Date of first transaction
- $\text{XIRR}$ = Annualized rate of return solved numerically using Newton-Raphson iteration so Net Present Value equals zero.

---

## XIRR vs CAGR vs Absolute Return Benchmark Comparison

Below is a benchmark comparison demonstrating why XIRR is necessary for multi-transaction cash flows:

| Scenario Parameter | Absolute Return (%) | CAGR (% p.a.) | XIRR (% p.a.) | Applicability |
| :--- | :--- | :--- | :--- | :--- |
| **Lumpsum (₹1L to ₹1.1L in 1 Yr)** | 10.0% | 10.0% | **10.0%** | Single Inflow + Single Outflow |
| **Lumpsum (₹1L to ₹1.21L in 2 Yrs)** | 21.0% | 10.0% | **10.0%** | Single Inflow + Single Outflow |
| **3-Year Annual SIP (₹50k x 3 yrs $\rightarrow$ ₹1.85L)** | 23.33% | 7.24% (Distorted) | **12.33%** | **Irregular / Multiple Cash Flows** |

---

## Worked Financial Examples

### Case Study 1: Lumpsum + Top-up + Final Valuation
- **2023-01-01**: -₹100,000 (Initial Purchase)
- **2024-01-01**: -₹50,000 (Top-up Investment)
- **2025-01-01**: +₹180,000 (Current Portfolio Value)
- **Total Invested**: **₹150,000**
- **Net Profit**: **₹30,000**
- **Annualized XIRR**: **12.33% p.a.**

### Case Study 2: Real Estate Purchase + Rent + Sale
- **2023-01-01**: -₹5,000,000 (Property Purchase)
- **2024-01-01**: +₹200,000 (Annual Rental Income)
- **2025-01-01**: +₹6,000,000 (Property Sale Proceeds)
- **Total Invested**: **₹5,000,000**
- **Total Received**: **₹6,200,000**
- **Annualized XIRR**: **11.61% p.a.**

---

## Frequently Asked Questions (FAQs)

### 1. Why does FinTools Find use 365.25 days per year for XIRR?
FinTools Find uses the standard quantitative finance day-count fraction of 365.25 days per year to accurately account for leap years over long multi-decade investment horizons.

### 2. What should I do if my XIRR calculation returns an error?
Ensure that: (1) You have at least one negative amount (investment) and at least one positive amount (valuation/redemption), (2) All dates are valid, and (3) Dates are chronologically ordered or valid.

### 3. Is XIRR better than CAGR for mutual fund SIPs?
Yes! CAGR assumes all money was invested on Day 1. For SIPs, money is deposited gradually, so CAGR underestimates performance. XIRR accurately annualizes each instalment's return.

---

## Related Investment & Wealth Calculators

- [SIP Calculator](/tools/investment/sip-calculator)
- [CAGR Calculator](/tools/investment/cagr-calculator)
- [Mutual Fund Returns Calculator](/tools/investment/mutual-fund-returns-calculator)
- [Compound Interest Calculator](/tools/investment/compound-interest-calculator)
- [Simple Interest Calculator](/tools/investment/simple-interest-calculator)
