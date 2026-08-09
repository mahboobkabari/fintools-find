---
title: "CAGR Calculator: Compound Annual Growth Rate Formula & Analysis"
metaDescription: "Calculate Compound Annual Growth Rate (CAGR) for stocks, mutual funds, real estate & gold. Measure annualized returns, real CAGR, and benchmark comparison."
category: "investment"
categoryName: "Investment Calculators"
slug: "cagr-calculator"
currency: "INR"
howToUse:
  - "Enter initial investment purchase value in Rupees (₹)."
  - "Enter final current or maturity value."
  - "Select total investment holding period in years."
  - "Instantly view your annualized CAGR percentage, absolute gain (₹), real CAGR after inflation, and benchmark comparison."
features:
  - "Geometric mean Compound Annual Growth Rate (CAGR) engine"
  - "Fisher equation Real CAGR inflation adjustment"
  - "Illustrative benchmark performance comparison (Nifty 50, Gold, FD)"
  - "Hypothetical 4-scenario growth simulation grid"
  - "Synchronized inputs with real-time URL state sharing"
benefits:
  - "Compare investment performance across asset classes with varying holding periods"
  - "Smooth out annual market volatility into a single accurate annual rate"
  - "Evaluate stock, mutual fund, and real estate returns against benchmark indices"
faqs:
  - question: "What is CAGR (Compound Annual Growth Rate)?"
    answer: "CAGR stands for Compound Annual Growth Rate. It measures the mean annual geometric growth rate of an investment over a specified period longer than one year, assuming the investment compounds annually."
  - question: "How is CAGR calculated?"
    answer: "CAGR is calculated using the formula: CAGR = [(Final Value / Initial Value)^(1 / Years)] - 1. Expressed as a percentage, it shows the steady annual rate at which your initial capital grew."
  - question: "Why is CAGR better than Absolute Return?"
    answer: "Absolute return only measures total percentage gain without accounting for time duration. A 100% absolute return over 2 years (CAGR: 41.4%) is far superior to a 100% absolute return over 10 years (CAGR: 7.18%). CAGR normalizes returns across time horizons."
  - question: "What is the difference between CAGR and XIRR?"
    answer: "CAGR is designed for single point-to-point investments (lump sums) with a single purchase price and final value. XIRR (Extended Internal Rate of Return) is designed for multiple irregular cash flows, such as monthly Systematic Investment Plans (SIPs) or partial redemptions."
  - question: "What is Real CAGR after inflation?"
    answer: "Real CAGR adjusts nominal CAGR for annual inflation using the Fisher equation: Real CAGR = [(1 + Nominal CAGR) / (1 + Inflation Rate) - 1]. It reflects your true purchasing power growth."
calculatorModule: "investment/cagr-calculator.js"
publishDate: 2026-08-06
priority: "P0"
eeat:
  reviewedBy: "Fintools Find Engineering & Quant Team"
  methodology: "Calculations strictly execute standard geometric mean CAGR formulations and Fisher real return equations."
  dataSources:
    - "SEBI Performance Metric Regulations"
    - "Standard Corporate Finance & Portfolio Valuation Formulations"
advancedContent:
  definitionSnippet: "A CAGR Calculator is an interactive financial tool that measures the annualized geometric compound growth rate of an investment over a multi-year holding period."
  proTips:
    - "Always use CAGR (not absolute returns) when evaluating equity mutual fund performance over 3, 5, and 10-year horizons."
    - "Compare your portfolio CAGR against benchmark indices (such as Nifty 50) to measure performance alpha."
  commonMistakes:
    - "Applying CAGR to investments shorter than 1 year (use absolute return or annualized simple yield for periods under 12 months)."
    - "Ignoring annual market volatility; CAGR assumes smooth annual growth when actual stock returns fluctuate yearly."
    - "Using CAGR for SIP investments with multiple cash flows instead of XIRR."
  glossaryTerms:
    - term: "CAGR (Compound Annual Growth Rate)"
      definition: "The geometric progression ratio that provides a constant annual rate of return over a multi-year period."
    - term: "Absolute Return"
      definition: "The simple percentage gain or loss on an investment, ignoring the duration of time held."
    - term: "XIRR (Extended Internal Rate of Return)"
      definition: "The annualized rate of return for investments involving multiple cash inflows and outflows on specific dates."
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

## Real CAGR (Inflation-Adjusted Return)

Inflation reduces the purchasing power of your money over time. To calculate your **Real CAGR** after accounting for inflation, we apply the **Fisher Equation**:

$$\text{Real CAGR (\%)} = \left[ \frac{1 + \frac{\text{CAGR}}{100}}{1 + \frac{\text{Inflation Rate}}{100}} - 1 \right] \times 100$$

For example, if your investment achieves a nominal **12% CAGR** in an economy with **6% annual inflation**, your real purchasing power growth rate is **5.66% per year** (not 6.00%).

---

## Practical Worked Example: Stock Investment

Suppose you bought shares of an equity fund for **₹1,00,000 (₹1 Lakh)** and sold them 5 years later for **₹2,50,000 (₹2.5 Lakhs)**:

1. **Initial Investment ($IV$):** **₹1,00,000**
2. **Final Value ($FV$):** **₹2,50,000**
3. **Holding Period ($n$):** **5 Years**
4. **Absolute Gain:** $₹2,50,000 - ₹1,00,000 = \mathbf{₹1,50,000\text{ (150\% Absolute Gain)}}$
5. **CAGR Calculation:**
   $$\text{CAGR} = \left[ \left(\frac{250000}{100000}\right)^{\frac{1}{5}} - 1 \right] \times 100 = \left[ (2.5)^{0.2} - 1 \right] \times 100 = \mathbf{20.11\% \text{ p.a.}}$$

Even though your investment gained **150% in absolute terms**, your true annualized compound growth rate was **20.11% per year**.

---

## CAGR vs. Absolute Return vs. XIRR Comparison

| Metric | Absolute Return | CAGR (Annualized Growth) | XIRR (Internal Rate of Return) |
|---|---|---|---|
| **Formula** | $\frac{FV - IV}{IV} \times 100$ | $[(\frac{FV}{IV})^{\frac{1}{n}} - 1] \times 100$ | Extended Cash Flow Root |
| **Accounts for Time?** | No | **Yes** | **Yes** |
| **Best Used For** | Periods under 1 year | Point-to-point Lump Sums | Multiple SIP Cash Flows |
| **Example (₹1L to ₹2.5L in 5 Yrs)** | 150% Total Gain | **20.11% Annualized CAGR** | N/A (Single Cash Flow) |

---

## Key Limitations of CAGR

1. **Assumes Smooth Annual Growth:** CAGR calculates a constant annual rate, ignoring year-to-year volatility and market drawdowns.
2. **Single Cash Flow Limitation:** CAGR assumes no intermediate cash deposits or withdrawals occurred during the holding period.
3. **Historical Not Predictive:** Past CAGR performance does not guarantee future investment returns.

---

## Related Financial Tools

- [Lumpsum Calculator](/tools/investment/lumpsum-calculator/) – Calculate compound growth for single lump-sum investments.
- [SIP Calculator](/tools/investment/sip-calculator/) – Compute wealth growth for monthly systematic investment plans.
- [Mutual Fund Returns Calculator](/tools/investment/mutual-fund-returns-calculator/) – Estimate total returns and capital gains tax on mutual fund investments.
- [SWP Calculator](/tools/investment/swp-calculator/) – Plan systematic withdrawal plans for monthly income.
- [NPS Calculator](/tools/retirement/nps-calculator/) – Calculate National Pension System retirement corpus and annuity returns.
- [Retirement Corpus Calculator](/tools/retirement/retirement-corpus-calculator/) – Estimate required retirement target corpus.