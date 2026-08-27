---
title: "Net Present Value (NPV) & Internal Rate of Return (IRR) Calculator"
metaDescription: "Calculate Net Present Value (NPV), Internal Rate of Return (IRR), MIRR, and Profitability Index for capital investments and projects."
category: "business"
categoryName: "Business & Corporate Calculators"
slug: "npv-calculator"
currency: "INR"
calculatorModule: "@calculators/business/npv-calculator.js"
publishDate: 2026-08-09
priority: "P0"
howToUse:
  - "Enter the initial capital outlay (CF0) required for the investment project."
  - "Specify your target discount rate or cost of capital hurdle rate (% p.a.)."
  - "Input projected annual net cash flows (CF1 to CFN) over the operating life."
  - "Review Net Present Value (NPV), IRR %, Modified IRR %, Profitability Index (PI), and Discounted Payback Period."
features:
  - "Net Present Value (NPV) discounting using custom hurdle rates"
  - "Iterative Internal Rate of Return (IRR %) solver with Newton-Raphson & bisection safeguards"
  - "Modified Internal Rate of Return (MIRR %) with custom reinvestment and financing rates"
  - "Profitability Index (PI) value-creation ratio"
  - "Discounted Payback Period calculation in fractional operating years"
  - "Multi-rate NPV Sensitivity analysis across varying discount rates"
  - "Non-normal cash flow sign-change analysis and multiple-IRR warnings"
benefits:
  - "Determine whether a proposed capital project creates shareholder value above cost of capital"
  - "Compare competing capital budgeting projects of different sizes and cash flow timings"
  - "Mitigate IRR flaws by utilizing Modified IRR (MIRR) with realistic reinvestment assumptions"
  - "Identify exact payback timelines after discounting future cash flows for time value of money"
faqs:
  - question: "What is Net Present Value (NPV)?"
    answer: "Net Present Value (NPV) is the sum of all future cash inflows discounted back to present value, minus the initial capital outlay. A positive NPV indicates that the project earns a return exceeding the discount hurdle rate."
  - question: "What is the difference between IRR and MIRR?"
    answer: "Internal Rate of Return (IRR) is the discount rate that makes project NPV equal zero, assuming intermediate cash flows are reinvested at the IRR itself. Modified IRR (MIRR) assumes intermediate inflows are reinvested at a user-specified cost of capital, making MIRR a more realistic measure."
  - question: "What is a Non-Normal Cash Flow?"
    answer: "A non-normal cash flow occurs when cash flows change signs multiple times over the project lifetime (e.g., initial outlay, positive inflows, followed by a secondary major equipment overhaul outlay). Non-normal cash flows can produce multiple valid IRR roots."
  - question: "What does a Profitability Index (PI) greater than 1 mean?"
    answer: "A Profitability Index (PI) > 1.0 indicates that the present value of future cash inflows exceeds the initial investment outlay, which directly corresponds to a positive Net Present Value (NPV)."
  - question: "Is a positive NPV a guarantee of business success?"
    answer: "No. NPV and IRR calculations are educational scenario models based on user projections and assumptions. Actual project profitability depends on market performance, operating execution, tax changes, and economic conditions."
relatedTools:
  - "break-even-calculator"
  - "discounted-cash-flow-calculator"
  - "xirr-calculator"
  - "cagr-calculator"
  - "commercial-real-estate-calculator"
eeat:
  reviewedBy: "Fintools Find Corporate Finance & Capital Allocation Advisory Team"
  reviewedDate: 2026-08-09
  methodology: "Calculated using standard financial NPV discounting formulas, Newton-Raphson / bisection iterative root-finding algorithms, and MIRR terminal value equations."
  dataSources:
    - "Corporate Finance Institute (CFI) Capital Budgeting Standards"
    - "Financial Management Association International (FMA) Valuation Guidelines"
advancedContent:
  definitionSnippet: "Net Present Value (NPV) evaluates capital budgeting projects by discounting projected cash inflows to present value using a hurdle rate and subtracting initial outlay."
  proTips:
    - "Always evaluate both NPV and MIRR when analyzing projects with non-normal cash flow streams or secondary major overhaul expenses."
    - "Perform sensitivity analysis across a range of hurdle discount rates to test project resilience against rising cost of capital."
  commonMistakes:
    - "Relying solely on unadjusted IRR for projects with high returns, which overstates true performance due to unrealistic reinvestment assumptions."
    - "Using undiscounted payback period, which ignores the time value of money and cash flows generated after payback."
  keyTakeaways:
    - "A positive NPV indicates that a project is expected to create value above the firm's required cost of capital."
    - "Profitability Index (PI) > 1.0 aligns with positive NPV and provides a scale-independent measure of efficiency."
---

## Evaluating Capital Projects with Net Present Value (NPV) & IRR

Net Present Value (NPV) and Internal Rate of Return (IRR) are the primary capital budgeting metrics used by finance teams to evaluate capital expenditure proposals, equipment purchases, R&D investments, and corporate acquisitions.

> **Educational Capital Budgeting Disclaimer:** This calculator provides illustrative scenario modeling based on user-entered cash flows, discount rates, and assumptions. A positive NPV or IRR does not guarantee project success, profitability, or liquidity.

---

### Key Capital Budgeting Metrics Comparison

| Metric | Full Name | Primary Decision Benchmark | Best Used For |
| :--- | :--- | :--- | :--- |
| **NPV** | Net Present Value | $\text{NPV} > 0$ (Accept) | Absolute currency value created by project |
| **IRR** | Internal Rate of Return | $\text{IRR} > \text{Hurdle Rate}$ | Percentage return for normal cash flows |
| **MIRR** | Modified IRR | $\text{MIRR} > \text{Hurdle Rate}$ | Realistic return with custom reinvestment rate |
| **PI** | Profitability Index | $\text{PI} > 1.0$ (Value Adding) | Ranking capital-constrained projects |
| **Payback** | Discounted Payback | $\text{Payback} < \text{Target Years}$ | Assessing liquidity and time to recover capital |

---

### Step-by-Step Worked Example

Assume a company evaluates an industrial equipment replacement project:

1. **Project Inputs**:
   - Initial Outlay ($CF_0$): ₹10,00,000
   - Discount Hurdle Rate ($r$): 10% p.a.
   - Projected Annual Cash Flows: Year 1 = ₹3L | Year 2 = ₹3.5L | Year 3 = ₹4L | Year 4 = ₹4.5L | Year 5 = ₹5L

2. **Present Value (PV) Calculation**:
   - Year 1 PV = $\frac{3,00,000}{1.10^1} = ₹2,72,727$
   - Year 2 PV = $\frac{3,50,000}{1.10^2} = ₹2,89,256$
   - Year 3 PV = $\frac{4,00,000}{1.10^3} = ₹3,00,526$
   - Year 4 PV = $\frac{4,50,000}{1.10^4} = ₹3,07,356$
   - Year 5 PV = $\frac{5,00,000}{1.10^5} = ₹3,10,461$
   - **Total Present Value of Inflows** = **₹14,80,326**

3. **Capital Budgeting Outputs**:
   - **Net Present Value (NPV)** = ₹14,80,326 − ₹10,00,000 = **+₹4,80,326** (Accept Project)
   - **Internal Rate of Return (IRR)** = **25.3%**
   - **Modified IRR (MIRR @ 10%)** = **18.7%**
   - **Profitability Index (PI)** = $14,80,326 / 10,00,000 = \mathbf{1.48}$
   - **Discounted Payback Period** = **2.97 Years**
