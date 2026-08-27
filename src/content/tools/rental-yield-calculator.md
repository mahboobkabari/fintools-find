---
title: "Rental Yield & Property ROI Calculator (Gross Yield, Net Yield, Cap Rate)"
metaDescription: "Calculate Gross Rental Yield %, Net Rental Yield %, Cap Rate %, Net Operating Income (NOI), and Cash-on-Cash Return for residential or commercial property."
category: "real-estate"
categoryName: "Real Estate Calculators"
slug: "rental-yield-calculator"
currency: "INR"
calculatorModule: "@calculators/real-estate/rental-yield-calculator.js"
publishDate: 2026-08-09
priority: "P0"
howToUse:
  - "Enter your property purchase price, current estimated property value, and expected monthly rental income."
  - "Input estimated vacancy rate % and itemize annual property taxes, maintenance fees, insurance, and management costs."
  - "Configure optional home loan financing (loan amount, interest rate, tenure, or existing monthly EMI)."
  - "Specify upfront cash invested (down payment, stamp duty/closing costs, initial renovation costs)."
  - "Review your Gross Rental Yield %, Net Rental Yield %, Cap Rate %, Monthly Net Cash Flow, and Cash-on-Cash Return %."
features:
  - "Multi-metric real estate analysis: Gross Yield, Net Yield, Cap Rate, NOI, and Cash-on-Cash Return"
  - "Strict accounting separation keeping mortgage debt service out of Net Operating Income (NOI)"
  - "Uncapped cash flow modeling allowing negative monthly cash flows to be displayed accurately"
  - "Isolated property appreciation scenario modeling capital gains over custom holding periods"
  - "Pre-built property presets (Metro Apartment, Suburban House, Commercial Office, Financed Investment)"
  - "100% client-side calculation with zero data retention and complete financial privacy"
benefits:
  - "Determine true net property yield after accounting for property tax, maintenance, and vacancy loss"
  - "Compare unleveraged property performance (Cap Rate) vs leveraged cash return (Cash-on-Cash Return)"
  - "Evaluate whether a rental property generates positive or negative monthly cash flow after home loan EMIs"
  - "Make data-driven real estate investment decisions before buying or leasing out residential/commercial assets"
faqs:
  - question: "What is Gross Rental Yield?"
    answer: "Gross Rental Yield is the percentage return calculated by dividing annual gross rental income by the property purchase price, before subtracting operating expenses, taxes, or vacancy loss."
  - question: "What is Net Rental Yield and how is it different from Gross Yield?"
    answer: "Net Rental Yield deducts operating expenses (property tax, maintenance fees, insurance, management fees, vacancy loss) from gross rent to get Net Operating Income (NOI), then divides by the property purchase price. It provides a more accurate picture of operating performance."
  - question: "What is Cap Rate (Capitalization Rate)?"
    answer: "Cap Rate is the ratio of Net Operating Income (NOI) divided by the current estimated property value. While Net Yield uses the original purchase price as the denominator, Cap Rate uses current market value."
  - question: "Does mortgage EMI reduce Net Operating Income (NOI)?"
    answer: "No. Standard real estate accounting excludes mortgage principal and interest from Net Operating Income (NOI) to evaluate unleveraged property performance. Mortgage debt service is subtracted after NOI to compute Pre-Tax Cash Flow."
  - question: "What is Cash-on-Cash Return?"
    answer: "Cash-on-Cash Return measures annual pre-tax cash flow as a percentage of actual upfront cash invested (Down Payment + Stamp Duty / Closing Costs + Initial Renovation). It measures leveraged cash performance."
relatedTools:
  - "home-affordability-calculator"
  - "home-loan-calculator"
  - "rent-vs-buy-calculator"
  - "net-worth-calculator"
  - "capital-gains-tax-calculator"
  - "emergency-fund-calculator"
eeat:
  reviewedBy: "Fintools Find Real Estate & Wealth Management Advisory Team"
  reviewedDate: 2026-08-09
  methodology: "Calculated using standard real estate financial analysis equations (NOI, Cap Rate, Cash-on-Cash Return) and retail banking guidelines."
  dataSources:
    - "Royal Institution of Chartered Surveyors (RICS) Valuation Standards"
    - "National Housing Bank (NHB) RESIDEX Real Estate Index Guidelines"
advancedContent:
  definitionSnippet: "Rental yield is a financial percentage metric measuring annual rental income relative to property cost or value, evaluated as Gross Rental Yield (before expenses), Net Rental Yield (after operating expenses), or Cash-on-Cash Return (after financing)."
  proTips:
    - "Always factor in a 3%–5% annual vacancy reserve, as tenant turnover gaps significantly impact net rental income."
    - "For leveraged property, ensure the property NOI exceeds annual mortgage payments to avoid monthly negative cash flow out of pocket."
  commonMistakes:
    - "Subtracting mortgage loan EMIs from Net Operating Income (NOI) rather than Pre-Tax Cash Flow."
    - "Mixing purchase price and current property market value when comparing Gross Yield vs Cap Rate."
  keyTakeaways:
    - "Gross Rental Yield ignores operating expenses, while Net Rental Yield accounts for real property costs."
    - "Cap Rate measures unleveraged property performance against current market value."
---

## Understanding Real Estate Rental Yield & Cash Flow Analysis

Evaluating real estate as an income-generating asset requires looking beyond headline rent to analyze true net cash flows, operating expenses, and financing costs.

> **Important Disclosure:** Rental income, property appreciation, and cash flows are estimates based on user inputs and market assumptions. Actual rental yields, vacancy rates, operating costs, and financing terms vary by property, location, and market conditions.

---

### Real Estate Yield Reference Matrix

| Metric | Denominator | Deducts Operating Expenses? | Deducts Mortgage Debt Service? | Primary Purpose |
| :--- | :--- | :---: | :---: | :--- |
| **Gross Rental Yield %** | Purchase Price | No | No | Top-line income benchmarking |
| **Net Rental Yield %** | Purchase Price | **Yes (NOI)** | No | Operating profitability on purchase cost |
| **Cap Rate %** | Current Market Value | **Yes (NOI)** | No | Unleveraged property asset valuation |
| **Cash-on-Cash Return %** | Initial Cash Invested | **Yes (NOI)** | **Yes (Debt Service)** | Leveraged cash return on actual cash out of pocket |

---

### Step-by-Step Worked Example

Assume an investor evaluates a residential rental property with the following profile:

1. **Property Purchase & Rental Income**:
   - Property Purchase Price: ₹60,00,000
   - Monthly Rent: ₹25,000 / month
   - **Annual Gross Rent** = ₹25,000 × 12 = **₹3,00,000**
   - **Gross Rental Yield %** = $\frac{₹3,00,000}{₹60,00,000} \times 100 =$ **5.00%**

2. **Operating Expenses & Net Operating Income (NOI)**:
   - Vacancy Loss (5%): ₹15,000
   - Effective Gross Income (EGI): ₹2,85,000
   - Annual Property Tax & Insurance: ₹11,000
   - Annual Society Maintenance: ₹24,000
   - **Total Annual Operating Expenses** = **₹35,000**
   - **Net Operating Income (NOI)** = ₹2,85,000 − ₹35,000 = **₹2,50,000**
   - **Net Rental Yield %** = $\frac{₹2,50,000}{₹60,00,000} \times 100 =$ **4.17%**

3. **Financing & Net Cash Flow**:
   - Home Loan: ₹45,00,000 at 8.5% for 20 Yrs (EMI = ₹39,052 / mo)
   - **Annual Debt Service** = ₹39,052 × 12 = **₹4,68,624**
   - **Annual Pre-Tax Cash Flow** = ₹2,50,000 − ₹4,68,624 = **−₹2,18,624 / year** (−₹18,219 / mo)
   - Down Payment + Closing Costs = ₹18,60,000
   - **Cash-on-Cash Return %** = $\frac{−₹2,18,624}{₹18,60,000} \times 100 =$ **−11.75%**
