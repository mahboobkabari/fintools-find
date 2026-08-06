---
title: "CAGR Calculator: Compound Annual Growth Rate Formula"
metaDescription: "Calculate Compound Annual Growth Rate (CAGR) for stocks, mutual funds, and real estate investments. Measure annualized investment growth performance."
category: "investment"
categoryName: "Investment Calculators"
slug: "cagr-calculator"
currency: "INR"
howToUse:
  - "Enter initial investment purchase value in Rupees (₹)."
  - "Enter final current or maturity value."
  - "Select total investment holding period in years."
  - "Instantly view your annualized CAGR percentage, total absolute gain (₹), and annual growth progression schedule."
features:
  - "Standard geometric Compound Annual Growth Rate (CAGR) engine"
  - "Real-time calculation with synchronized range sliders"
  - "Visual initial investment vs capital gain ratio bar"
  - "Yearly balance growth schedule"
benefits:
  - "Compare investment performance across asset classes with varying holding periods"
  - "Smooth out annual market volatility into a single accurate annual rate"
  - "Evaluate stock, mutual fund, and real estate returns against benchmark indices (Nifty 50)"
faqs:
  - question: "What is CAGR (Compound Annual Growth Rate)?"
    answer: "CAGR stands for Compound Annual Growth Rate. It measures the mean annual growth rate of an investment over a specified period of time longer than one year, assuming the investment compounds annually."
  - question: "How is CAGR calculated?"
    answer: "CAGR is calculated using the formula: CAGR = [(Final Value / Initial Value)^(1 / Years)] - 1. Expressed as a percentage, it shows the steady annual rate at which your initial capital grew."
  - question: "Why is CAGR better than Absolute Return?"
    answer: "Absolute return only measures total percentage gain without accounting for time. A 100% absolute return over 2 years (CAGR: 41.4%) is far superior to a 100% absolute return over 10 years (CAGR: 7.18%). CAGR normalizes returns across time horizons."
calculatorModule: "investment/cagr-calculator.js"
publishDate: 2026-08-06
priority: "P0"
eeat:
  reviewedBy: "FinTool Engineering & Quant Team"
  methodology: "Calculations strictly execute standard geometric mean CAGR formulations."
  dataSources:
    - "SEBI Performance Metric Regulations"
    - "Standard Corporate Finance & Portfolio Valuation Formulations"
advancedContent:
  definitionSnippet: "A CAGR Calculator is an interactive financial tool that measures the annualized geometric compound growth rate of an investment over a multi-year holding period."
  proTips:
    - "Always use CAGR (not absolute returns) when evaluating equity mutual fund performance over 3, 5, and 10-year horizons."
    - "Compare your portfolio CAGR against benchmark indices (such as Nifty 50 or Sensex) to measure alpha creation."
  commonMistakes:
    - "Applying CAGR to investments shorter than 1 year (use absolute return or annualized simple yield for periods < 12 months)."
    - "Ignoring annual market volatility; CAGR assumes smooth annual growth when actual stock returns fluctuate yearly."
  glossaryTerms:
    - term: "CAGR (Compound Annual Growth Rate)"
      definition: "The geometric progression ratio that provides a constant annual rate of return over a multi-year period."
    - term: "Absolute Return"
      definition: "The simple percentage gain or loss on an investment, ignoring the duration of time held."
---

## What is a CAGR Calculator?

A **CAGR Calculator** (Compound Annual Growth Rate Calculator) enables investors to measure the true annualized return of an investment across multi-year holding periods.

Financial markets (stocks, mutual funds, real estate, gold) experience volatile year-to-year swings. CAGR smooths out annual fluctuations to provide a single, constant annual growth rate that makes disparate investments directly comparable.

---

## The CAGR Calculation Formula

The **Compound Annual Growth Rate (CAGR)** formula is:

$$\text{CAGR (\%)} = \left[ \left(\frac{\text{Final Value}}{\text{Initial Value}}\right)^{\frac{1}{n}} - 1 \right] \times 100$$

Where:
* **Final Value ($FV$):** Current or final value of the investment.
* **Initial Value ($IV$):** Original purchase or investment cost.
* **$n$ (Years):** Holding period in years.

---

## Practical Worked Example: Stock Investment

Suppose you bought shares of an equity fund for **₹1,00,000 (₹1 Lakh)** and sold them 5 years later for **₹2,50,000 (₹2.5 Lakhs)**:

* **Initial Investment ($IV$):** **₹1,00,000**
* **Final Value ($FV$):** **₹2,50,000**
* **Holding Period ($n$):** **5 Years**
* **Absolute Gain:** $₹2,50,000 - ₹1,00,000 = \mathbf{₹1,50,000\text{ (150\% Absolute Gain)}}$
* **CAGR Calculation:**
  $$\text{CAGR} = \left[ \left(\frac{250000}{100000}\right)^{\frac{1}{5}} - 1 \right] \times 100 = \left[ (2.5)^{0.2} - 1 \right] \times 100 = \mathbf{20.11\% \text{ p.a.}}$$

Even though your investment gained **150% in absolute terms**, your true annualized compound growth rate was **20.11% per year**.

---

## CAGR vs. Absolute Return Comparison

| Metric | Absolute Return | CAGR (Annualized Growth) |
|---|---|---|
| **Formula** | $\frac{FV - IV}{IV} \times 100$ | $[(\frac{FV}{IV})^{\frac{1}{n}} - 1] \times 100$ |
| **Accounts for Time?** | No | **Yes** |
| **Best Used For** | Investments under 1 year | Investments over 1 to 40+ years |
| **Example (₹1L to ₹2L in 10 Yrs)** | 100% Total Gain | **7.18% Annualized CAGR** |