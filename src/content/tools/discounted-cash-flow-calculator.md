---
title: "Discounted Cash Flow (DCF) Calculator (Intrinsic Share Price & WACC Valuation)"
metaDescription: "Calculate Enterprise Value, Equity Value, Intrinsic Share Price, Margin of Safety, and 2D WACC Sensitivity Matrix using Discounted Cash Flow (DCF) valuation."
category: "investment"
categoryName: "Investment Calculators"
slug: "discounted-cash-flow-calculator"
currency: "INR"
calculatorModule: "@calculators/investment/discounted-cash-flow-calculator.js"
publishDate: 2026-08-09
priority: "P0"
howToUse:
  - "Select FCF forecast mode: Growth-rate shortcut (% p.a.) or Explicit annual cash flow inputs."
  - "Input Discount Rate / WACC % and choose Terminal Valuation method (Gordon Growth vs Exit EV/EBITDA Multiple)."
  - "Enter Balance Sheet cash, total debt, diluted shares outstanding, and target Margin of Safety %."
  - "Review Intrinsic Value Per Share, Upside/Downside %, Enterprise Value, and 2D Sensitivity Matrix."
features:
  - "Dual FCF input modes: Explicit annual FCF forecast vs simplified growth rate shortcut"
  - "Dual terminal valuation methodologies: Gordon Perpetuity Growth vs Exit EV/EBITDA Multiple"
  - "Strict terminal growth validation preventing invalid g ≥ r perpetuity calculations"
  - "2D WACC vs Terminal Growth Sensitivity Matrix with automatic N/A invalid cell handling"
  - "Complete Enterprise Value to Equity Value bridge accounting for cash and debt"
  - "Target Margin of Safety price calculation and terminal value contribution % exposure"
benefits:
  - "Determine true intrinsic stock valuation based on fundamental cash flow generation rather than market noise"
  - "Evaluate margin of safety before buying shares or acquiring business assets"
  - "Analyze how variations in cost of capital (WACC) impact asset valuation"
  - "Compare Gordon Growth perpetuity assumptions against market Exit Multiples"
faqs:
  - question: "What is Discounted Cash Flow (DCF) Valuation?"
    answer: "Discounted Cash Flow (DCF) valuation is a fundamental corporate valuation technique that calculates the present value of an asset or company by discounting all projected future Free Cash Flows (FCF) and terminal value back to present value using a discount rate (WACC)."
  - question: "What is the difference between Enterprise Value and Equity Value?"
    answer: "Enterprise Value (EV) measures the total operating value of a business (PV of cash flows + PV of terminal value). Equity Value adjusts Enterprise Value for balance sheet claims by adding liquid cash & equivalents and subtracting total debt."
  - question: "Why must perpetual terminal growth rate (g) be less than discount rate (r)?"
    answer: "Under the Gordon Growth Model, terminal value is computed as TV = FCF_N * (1 + g) / (r - g). If terminal growth (g) equals or exceeds WACC (r), the denominator becomes zero or negative, creating mathematically impossible or infinite valuations. No business can grow faster than the overall economy indefinitely."
  - question: "What is Margin of Safety in stock valuation?"
    answer: "Margin of Safety is the percentage discount applied to the calculated intrinsic share price (e.g. 15% or 25%) to establish a conservative buy price, protecting investors against forecasting errors or unexpected economic downturns."
  - question: "What is Terminal Value Contribution %?"
    answer: "Terminal Value Contribution % measures the percentage of total Enterprise Value derived from the terminal value relative to explicit cash flows. A very high contribution (e.g. > 80%) indicates that valuation relies heavily on long-term terminal assumptions."
relatedTools:
  - "cagr-calculator"
  - "xirr-calculator"
  - "break-even-calculator"
  - "net-worth-calculator"
  - "capital-gains-tax-calculator"
  - "lumpsum-calculator"
eeat:
  reviewedBy: "Fintools Find Corporate Finance & Valuation Advisory Team"
  reviewedDate: 2026-08-09
  methodology: "Calculated using standard corporate finance DCF equations, Gordon Growth perpetuities, and WACC discounting principles."
  dataSources:
    - "Corporate Finance Institute (CFI) Valuation Framework"
    - "Stern School of Business (Damodaran Valuation Standards)"
advancedContent:
  definitionSnippet: "Discounted Cash Flow (DCF) valuation determines the intrinsic value of a company or stock by discounting projected future Free Cash Flows (FCF) and terminal value back to present value using a Weighted Average Cost of Capital (WACC)."
  proTips:
    - "Avoid overly optimistic long-term growth assumptions; cap perpetual terminal growth at 2%–3.5% (aligned with long-term GDP growth)."
    - "Perform sensitivity analysis across WACC variations to understand how interest rate changes impact intrinsic stock value."
  commonMistakes:
    - "Setting terminal perpetuity growth rate equal to or higher than WACC, resulting in invalid division-by-zero math."
    - "Confusing Enterprise Value with Equity Value by forgetting to add cash and subtract debt before calculating share price."
  keyTakeaways:
    - "DCF evaluates intrinsic value based on fundamental cash flow generation rather than market sentiment."
    - "Margin of Safety protects investors by setting a conservative entry price below estimated intrinsic value."
---

## Understanding Discounted Cash Flow (DCF) Stock & Business Valuation

Discounted Cash Flow (DCF) is a core valuation methodology in corporate finance and equity research used to estimate the intrinsic value of an asset based on its expected future cash flows.

> **Educational Disclaimer:** DCF calculations are illustrative financial estimations based on user-supplied cash flow, WACC, and terminal growth assumptions. Intrinsic share values do not represent guaranteed market prices or investment recommendations.

---

### Key Components of DCF Valuation

| Component | Mathematical Formula | Purpose |
| :--- | :--- | :--- |
| **Explicit Free Cash Flows ($FCF_t$)** | $FCF_0 \times (1 + g)^t$ | Cash generated by business operations available to all capital providers. |
| **Present Value of FCF ($PV_{explicit}$)** | $\sum \frac{FCF_t}{(1 + r)^t}$ | Value of explicit forecast cash flows discounted at WACC ($r$). |
| **Gordon Growth Terminal Value ($TV$)** | $\frac{FCF_N \times (1 + g_{perpetuity})}{r - g_{perpetuity}}$ | Value of all cash flows beyond explicit forecast period into perpetuity ($g < r$). |
| **Enterprise Value (EV)** | $PV_{explicit} + PV(TV)$ | Total economic operating value of the enterprise. |
| **Equity Value** | $EV + \text{Cash} - \text{Debt}$ | Net operating value attributable to equity shareholders. |
| **Intrinsic Value Per Share** | $\frac{\text{Equity Value}}{\text{Shares Outstanding}}$ | Estimated fundamental share price. |

---

### Step-by-Step Worked Example

Assume an investor evaluates a company with the following profile:

1. **Cash Flow & Discount Inputs**:
   - Starting Free Cash Flow ($FCF_0$): ₹10,00,000
   - Annual FCF Growth Rate: 8% p.a. for 5 Years
   - Discount Rate / WACC ($r$): 10% p.a.
   - Terminal Growth Rate ($g$): 3% p.a.

2. **Explicit Cash Flows & Present Value**:
   - Year 1 FCF = ₹10,80,000 | PV = ₹9,81,818
   - Year 2 FCF = ₹11,66,400 | PV = ₹9,63,967
   - Year 3 FCF = ₹12,59,712 | PV = ₹9,46,439
   - Year 4 FCF = ₹13,60,489 | PV = ₹9,29,228
   - Year 5 FCF = ₹14,69,328 | PV = ₹9,12,332
   - **Sum of PV Explicit FCFs** = **₹47,33,784**

3. **Terminal Value & Enterprise Value**:
   - Terminal Value ($TV$) = $\frac{₹14,69,328 \times 1.03}{0.10 - 0.03} = \frac{₹15,13,408}{0.07} = $ **₹2,16,20,112**
   - Present Value of TV ($PV_{TV}$) = $\frac{₹2,16,20,112}{(1.10)^5} = $ **₹1,34,24,375**
   - **Enterprise Value (EV)** = ₹47,33,784 + ₹1,34,24,375 = **₹1,81,58,159**
   - **Terminal Value Contribution %** = $\frac{₹1,34,24,375}{₹1,81,58,159} \times 100 = $ **73.93%**

4. **Bridge to Intrinsic Share Price**:
   - Cash & Equivalents: ₹5,00,000 | Total Debt: ₹10,00,000
   - **Equity Value** = ₹1,81,58,159 + ₹5,00,000 − ₹10,00,000 = **₹1,76,58,159**
   - Diluted Shares: 1,00,000
   - **Intrinsic Value Per Share** = $\frac{₹1,76,58,159}{1,00,000} = $ **₹176.58**
   - At a 15% Target Margin of Safety, **Buy Price** = ₹176.58 × 0.85 = **₹150.09**
