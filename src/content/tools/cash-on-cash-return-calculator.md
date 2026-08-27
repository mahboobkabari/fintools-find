---
title: "Cash-on-Cash Return Calculator (Leveraged Real Estate Yield)"
metaDescription: "Calculate Cash-on-Cash Return % for rental property investments. Model annual pre-tax cash flow, NOI, debt service, total cash invested, and Cap Rate."
category: "real-estate"
categoryName: "Real Estate & Property Calculators"
slug: "cash-on-cash-return-calculator"
currency: "INR"
calculatorModule: "@calculators/real-estate/cash-on-cash-return-calculator.js"
publishDate: 2026-08-10
priority: "P0"
howToUse:
  - "Enter property purchase price, down payment %, closing costs %, and initial rehab outlay."
  - "Input your mortgage interest rate (%) and loan tenure to calculate annual debt service."
  - "Specify monthly gross rental income, vacancy rate %, and annual property operating expenses."
  - "Review your Leveraged Cash-on-Cash Return %, Pre-Tax Cash Flow, and Cap Rate comparison."
features:
  - "Calculates Leveraged Cash-on-Cash Return % based on actual out-of-pocket cash invested"
  - "Computes Net Operating Income (NOI), Effective Gross Income (EGI), and Vacancy Loss"
  - "Models Mortgage Debt Service (Annual EMI x 12) and Pre-Tax Annual Cash Flow"
  - "Distinguishes Leveraged Cash-on-Cash Return from Unleveraged Cap Rate %"
  - "Evaluates Positive vs Negative Mortgage Leverage Effect"
  - "Includes 4 property presets (Single-Family, Multi-Family, Commercial Retail, Fixer-Upper BRRRR)"
benefits:
  - "Evaluate rental property profitability before committing capital"
  - "Determine whether mortgage financing enhances or erodes your equity cash flow returns"
  - "Compare multiple real estate deals using a standardized cash flow yield metric"
  - "Clear, step-by-step cash flow schedule from gross rent down to net cash in hand"
faqs:
  - question: "What is Cash-on-Cash Return in real estate?"
    answer: "Cash-on-Cash Return is a financial metric that measures the annual pre-tax cash flow earned by a real estate investor relative to the total out-of-pocket cash invested upfront (down payment + closing costs + rehab)."
  - question: "How is Cash-on-Cash Return different from Cap Rate?"
    answer: "Cap Rate measures property-level operating yield independent of mortgage debt (NOI / Purchase Price). Cash-on-Cash Return measures investor equity return incorporating mortgage debt service and actual out-of-pocket cash invested."
  - question: "What is a good Cash-on-Cash Return for rental properties?"
    answer: "A Cash-on-Cash Return of 8% to 12% is generally considered strong for residential rental properties, though target yields vary depending on location, property class, interest rates, and investor risk tolerance."
  - question: "Does Cash-on-Cash Return include mortgage payments?"
    answer: "Yes. Annual debt service (mortgage principal and interest) is subtracted from Net Operating Income (NOI) to calculate Pre-Tax Annual Cash Flow, which is then divided by total upfront cash outlays."
  - question: "What is positive vs negative mortgage leverage?"
    answer: "Positive leverage occurs when your property Cap Rate exceeds mortgage interest rates, increasing Cash-on-Cash Return. Negative leverage occurs when debt borrowing costs exceed property yield, reducing Cash-on-Cash Return below Cap Rate."
relatedTools:
  - "cap-rate-calculator"
  - "rental-yield-calculator"
  - "home-affordability-calculator"
  - "rent-vs-buy-calculator"
  - "net-worth-calculator"
eeat:
  reviewedBy: "Fintools Find Real Estate Advisory & Valuation Team"
  reviewedDate: 2026-08-10
  methodology: "Calculated using GAAP real estate accounting principles: dividing Pre-Tax Annual Cash Flow (NOI - Annual Debt Service) by Total Upfront Out-of-Pocket Cash Invested."
  dataSources:
    - "Reserve Bank of India (RBI) Commercial & Housing Finance Directives"
    - "National Housing Bank (NHB) Property Investment Guidelines"
advancedContent:
  definitionSnippet: "Cash-on-Cash Return is a real estate rate of return metric that calculates annual pre-tax cash flow as a percentage of the total out-of-pocket cash invested."
  proTips:
    - "Always include initial rehab and closing costs in your upfront cash invested, as ignoring them inflates your apparent Cash-on-Cash return."
    - "Compare Cash-on-Cash Return against alternative risk-free yields (such as fixed deposits or liquid funds) to ensure adequate risk compensation."
  commonMistakes:
    - "Confusing Cap Rate with Cash-on-Cash Return by failing to deduct mortgage EMI payments."
    - "Underestimating property maintenance and vacancy allowances when projecting annual operating expenses."
  keyTakeaways:
    - "Cash-on-Cash Return measures cash yield on actual capital deployed."
    - "Mortgage leverage can amplify returns (positive leverage) or erode returns (negative leverage)."
---

## Understanding Real Estate Cash-on-Cash Return

When evaluating income-producing real estate—such as single-family rentals, multi-family apartments, or commercial retail spaces—understanding your actual cash yield is essential.

> **Important Disclosure:** Cash-on-Cash Return figures are calculated estimates based on user-entered rental income, operating expenses, and loan terms. Actual property cash flows may fluctuate due to tenant turnover, emergency repairs, property tax revisions, or interest rate adjustments.

---

### Comparison: Cash-on-Cash Return vs Cap Rate vs Gross Rental Yield

| Metric | Cash-on-Cash Return % | Cap Rate % (Capitalization Rate) | Gross Rental Yield % |
| :--- | :--- | :--- | :--- |
| **Formula** | **Pre-Tax Cash Flow / Total Cash Invested** | Net Operating Income / Purchase Price | Annual Gross Rent / Purchase Price |
| **Mortgage Included?** | **YES (Debt Service Deducted)** | NO (Unleveraged Asset Yield) | NO |
| **Operating Expenses?**| **YES (Deducted)** | YES (Deducted) | NO |
| **Upfront Outlays?** | **YES (Down Payment + Closing + Rehab)**| Property Purchase Price | Property Purchase Price |
| **Primary Use** | **Investor Equity Performance** | Property Asset Valuation | Quick Screening |

---

### Step-by-Step Worked Example

Assume an investor purchases a rental property for ₹75,000,000 with 20% down payment:

1. **Upfront Out-of-Pocket Outlay**:
   - Purchase Price: ₹75,00,000
   - Down Payment (20%): ₹15,00,000
   - Closing Costs (3%): ₹2,25,000
   - Initial Rehab: ₹2,00,000
   - **Total Upfront Cash Invested**: **₹19,25,000**

2. **Mortgage Loan & Debt Service**:
   - Loan Amount (80%): ₹60,00,000 at 8.5% for 20 Years
   - Monthly Mortgage EMI: ₹52,069 / month
   - **Annual Debt Service (ADS)**: **₹6,24,828 / year**

3. **Property Operating Income (NOI)**:
   - Monthly Rent: ₹75,000 (₹9,00,000 / year)
   - Vacancy Loss (5%): -₹45,000
   - Effective Gross Income (EGI): ₹8,55,000
   - Annual Operating Expenses: -₹1,80,000
   - **Net Operating Income (NOI)**: **₹6,75,000 / year** (Cap Rate = 9.00%)

4. **Pre-Tax Cash Flow & Cash-on-Cash Return**:
   - Annual Pre-Tax Cash Flow = ₹6,75,000 - ₹6,24,828 = **₹50,172 / year**
   - **Cash-on-Cash Return %** = (₹50,172 / ₹19,25,000) × 100 = **2.61%**
