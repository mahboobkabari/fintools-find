---
title: "IRR Calculator: Internal Rate of Return, MIRR & Hurdle Rate Analysis"
metaDescription: "Calculate Internal Rate of Return (IRR) & Modified IRR (MIRR) online. Analyze project NPV, Hurdle Rate spreads, Profitability Index & cash flow schedules."
category: "business"
categoryName: "Business & Corporate Finance Calculators"
slug: "irr-calculator"
currency: "INR"
howToUse:
  - "Enter the Year 0 initial capital outlay (CapEx investment)."
  - "Input the projected annual net cash inflows for each operating year (add or remove years dynamically)."
  - "Specify your corporate Hurdle Rate (WACC) to evaluate project economic viability."
  - "Adjust MIRR reinvestment and financing rates for realistic multi-year cash compounding."
  - "Review your instant IRR, MIRR, NPV at Hurdle, Profitability Index, and Go / No-Go decision verdict."
features:
  - "High-precision Newton-Raphson polynomial root solver with Secant / Bisection method fallback"
  - "Modified Internal Rate of Return (MIRR) calculator addressing the flawed IRR reinvestment rate assumption"
  - "Net Present Value (NPV) & Profitability Index (PI) at corporate WACC hurdle rates"
  - "NPV Profile Discount Rate Sensitivity Curve mapping NPV across discount rates from 0% to 30%"
  - "Annual discounted cash flow schedule with cumulative undiscounted and discounted cash balances"
benefits:
  - "Make data-backed capital allocation and project investment decisions with institutional rigor"
  - "Identify whether proposed CapEx creates or destroys shareholder value relative to cost of capital"
  - "Avoid flawed capital budgeting conclusions by comparing Standard IRR with Modified IRR (MIRR)"
  - "Detect non-conventional cash flow streams with multiple sign changes and multiple mathematical roots"
faqs:
  - question: "What is Internal Rate of Return (IRR)?"
    answer: "Internal Rate of Return (IRR) is the annual compound rate of growth an investment or capital project is expected to generate. Mathematically, it is the exact discount rate that makes the Net Present Value (NPV) of all future cash flows equal to zero."
  - question: "What is the difference between IRR and MIRR?"
    answer: "Standard IRR assumes all interim cash inflows are reinvested at the project's own IRR—an assumption that is often unrealistically high. Modified IRR (MIRR) solves this flaw by assuming positive cash flows are reinvested at the company's realistic cost of capital (WACC) and negative cash flows are financed at the borrowing rate."
  - question: "What is a good IRR for a business investment?"
    answer: "A good IRR is one that substantially exceeds the company's Weighted Average Cost of Capital (WACC) or Hurdle Rate. For example, if a corporate hurdle rate is 10%, an IRR of 18% to 25% provides a strong safety margin against operational risks and cost overruns."
  - question: "What is the Hurdle Rate / Cost of Capital?"
    answer: "The Hurdle Rate is the minimum acceptable rate of return required by investors or corporate management before approving a capital project. If IRR is greater than the Hurdle Rate, the project is value accretive and should generally be accepted."
  - question: "Can a project have multiple IRRs?"
    answer: "Yes. If a cash flow stream has non-conventional sign reversals (e.g., negative outflow in year 0, positive inflows in years 1-3, and another negative outflow in year 4 for maintenance), Descartes' Rule of Signs states that multiple mathematical IRRs may exist. In such cases, financial analysts rely on MIRR or NPV."
  - question: "Why is NPV considered superior to IRR for mutually exclusive projects?"
    answer: "IRR ignores the scale of the investment. For instance, a 50% IRR on a ₹1 Lakh project generates ₹50,000, whereas a 20% IRR on a ₹1 Crore project creates ₹20 Lakhs in wealth. When selecting between mutually exclusive alternatives, the project with the higher absolute NPV should always be chosen."
calculatorModule: "business/irr-calculator.js"
publishDate: 2026-08-26
priority: "P0"
relatedTools:
  - "npv-calculator"
  - "payback-period-calculator"
  - "break-even-calculator"
  - "working-capital-calculator"
  - "discounted-cash-flow-calculator"
eeat:
  reviewedBy: "Fintools Find Corporate Finance & Capital Markets Advisory Team"
  methodology: "Calculations follow standard Corporate Finance Institute (CFI) and Wharton capital budgeting principles, using Newton-Raphson polynomial algorithms and MIRR formulas."
  dataSources:
    - "Corporate Finance Institute (CFI Capital Budgeting Standards)"
    - "Wharton School of Business (Corporate Valuation & Capital Budgeting)"
    - "Principles of Corporate Finance (Brealey, Myers & Allen)"
    - "Institute of Chartered Accountants of India (Financial Management Framework)"
advancedContent:
  definitionSnippet: "An IRR Calculator solves for the exact discount rate where Net Present Value (NPV) equals zero, comparing project returns against corporate hurdle rates and computing Modified IRR (MIRR)."
  proTips:
    - "Always compare both IRR and NPV simultaneously—IRR measures return efficiency while NPV measures absolute shareholder wealth creation."
    - "Use MIRR when pitching capital budgets to investment committees to present conservative, highly defensible reinvestment assumptions."
    - "Include terminal salvage value or working capital recovery in the final year's cash inflow for complete project lifecycle evaluation."
  commonMistakes:
    - "Assuming interim project cash inflows can be continually reinvested at a high 30%+ IRR rather than the realistic company WACC."
    - "Choosing a smaller high-IRR project over a larger low-IRR project that delivers significantly more total cash profit."
  glossaryTerms:
    - term: "Internal Rate of Return (IRR)"
      definition: "The annualized compound discount rate that equates the present value of future cash inflows with the initial capital outlay."
    - term: "Modified IRR (MIRR)"
      definition: "An enhanced rate of return metric that uses explicit financing and reinvestment rates for cash outflows and inflows."
    - term: "Hurdle Rate (WACC)"
      definition: "The minimum required rate of return that a project must achieve to be approved by corporate management."
    - term: "Profitability Index (PI)"
      definition: "The ratio of the present value of future cash inflows to the initial capital investment outlay."
---

## Understanding Internal Rate of Return (IRR) & Capital Allocation

The **Internal Rate of Return (IRR)** is one of the most widely used metrics in corporate finance, venture capital, private equity, and commercial real estate. It answers a fundamental financial question: *What annualized compound return does this capital expenditure project generate over its operating lifecycle?*

---

### Core Mathematical Formulations

$$\sum_{t=0}^n \frac{C_t}{(1 + \text{IRR})^t} = 0$$

Where:
- $C_0 < 0$: Initial capital investment (Year 0 CapEx)
- $C_1, C_2, \dots, C_n$: Net operational cash flows in subsequent years
- $\text{IRR}$: The internal rate of return discount rate solved numerically

---

### Modified Internal Rate of Return (MIRR)

Standard IRR assumes that cash flows generated during the project are reinvested at the **same high IRR rate**, which frequently distorts corporate forecasts. **Modified IRR (MIRR)** corrects this distortion by utilizing realistic corporate rates:

$$\text{MIRR} = \left( \frac{\text{FV of Positive Cash Flows at Reinvestment Rate } r_r}{\text{PV of Negative Cash Flows at Financing Rate } r_f} \right)^{1/n} - 1$$

---

### Capital Budgeting Decision Rules Matrix

| Financial Condition | NPV Result | Capital Allocation Decision | Strategic Action |
|---|---|---|---|
| **$\text{IRR} > \text{Hurdle Rate}$** | $\text{NPV} > 0$ | **ACCEPT** | Proceed with capital deployment; project is value accretive. |
| **$\text{IRR} = \text{Hurdle Rate}$** | $\text{NPV} = 0$ | **INDIFFERENT** | Project breaks even with cost of funds; non-financial strategic drivers govern. |
| **$\text{IRR} < \text{Hurdle Rate}$** | $\text{NPV} < 0$ | **REJECT** | Do not fund; destroys economic value relative to capital cost. |
