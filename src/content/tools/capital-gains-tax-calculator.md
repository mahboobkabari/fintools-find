---
title: "Capital Gains Tax Calculator: Equity, Property & Asset Tax Rates"
metaDescription: "Calculate STCG and LTCG capital gains tax for FY 2025-26 under Budget 2024 rules. Estimate tax liability for stocks, equity mutual funds, and real estate."
category: "tax"
categoryName: "Tax Calculators"
slug: "capital-gains-tax-calculator"
currency: "INR"
howToUse:
  - "Enter original purchase cost in Rupees (₹)."
  - "Enter total sale or redemption price in Rupees (₹)."
  - "Select holding period duration in months."
  - "Enter brokerage or sales transfer expenses (if applicable)."
  - "Instantly view your gross capital gain, Section 112A tax exemption, taxable capital gain, 4% Cess, and net tax payable."
features:
  - "Budget 2024 tax rate engine (20% STCG & 12.5% LTCG for equity assets)"
  - "Automatic Section 112A ₹1.25 Lakh annual LTCG tax exemption deduction"
  - "4% Health & Education Cess inclusion"
  - "Visual net profit vs tax payable ratio progress bar"
benefits:
  - "Plan asset sales tax-efficiently before executing market redemptions"
  - "Harvest up to ₹1.25 Lakhs of tax-free long-term capital gains every financial year"
  - "Prepare accurate capital gains schedules for annual ITR-2 / ITR-3 tax returns"
  - "Understand new tax rates introduced in Finance Act 2024"
faqs:
  - question: "What is Capital Gains Tax?"
    answer: "Capital Gains Tax is a tax levied on the profits earned from the sale or transfer of capital assets such as equity shares, mutual funds, real estate property, gold, or bonds."
  - question: "What are the new Capital Gains Tax rates for FY 2025-26 (Budget 2024)?"
    answer: "Under Finance Act 2024 amendments: Short-Term Capital Gains (STCG) on equity assets held $\\le 12$ months are taxed at 20%. Long-Term Capital Gains (LTCG) on equity assets held $> 12$ months are taxed at 12.5% on profits exceeding ₹1.25 Lakhs per financial year."
  - question: "What is Section 112A tax exemption?"
    answer: "Section 112A provides an annual tax exemption on up to ₹1,25,000 of aggregate long-term capital gains realized from equity shares and equity-oriented mutual funds in a single financial year."
  - question: "How is the holding period determined for short-term vs long-term capital gains?"
    answer: "For listed equity shares and equity mutual funds, holding period $> 12$ months is classified as Long-Term. For real estate property, unlisted shares, and physical gold, holding period $> 24$ months is classified as Long-Term."
  - question: "What is Tax Loss Harvesting?"
    answer: "Tax Loss Harvesting is a legal tax-saving strategy where investors sell underperforming stocks or mutual fund units at a loss before the end of the financial year to offset taxable capital gains."
  - question: "Can capital losses be set off against capital gains?"
    answer: "Yes. Short-term capital losses can be set off against both STCG and LTCG. Long-term capital losses can only be set off against long-term capital gains. Unadjusted capital losses can be carried forward for up to 8 assessment years."
calculatorModule: "tax/capital-gains-tax-calculator.js"
publishDate: 2026-08-06
priority: "P0"
eeat:
  reviewedBy: "FinTool Engineering & Quant Team"
  methodology: "Calculations strictly execute official Central Board of Direct Taxes (CBDT) capital gains provisions under Income Tax Act, 1961 (as amended by Finance Act 2024)."
  dataSources:
    - "Income Tax Department, Government of India (Section 111A & Section 112A Provisions)"
    - "Union Budget 2024 Tax Reform Notifications"
advancedContent:
  definitionSnippet: "A Capital Gains Tax Calculator is an interactive tax planning tool that computes Short-Term (STCG) and Long-Term (LTCG) capital gains liabilities, Section 112A exemptions, and net post-tax profits under official CBDT tax rules."
  proTips:
    - "Harvest up to ₹1.25 Lakhs of tax-free LTCG each year by redeeming and reinvesting equity mutual fund units before March 31."
    - "Deduct brokerage fees, stamp duty, and transfer expenses from your gross sales price to lower your net taxable gain."
    - "Set off short-term capital losses against taxable long-term gains to minimize your annual tax bill."
  commonMistakes:
    - "Forgetting that the annual ₹1.25 Lakh LTCG exemption under Section 112A applies to aggregate equity gains, not per individual scheme."
    - "Failing to add the 4% Health & Education Cess when calculating total tax liabilities."
  glossaryTerms:
    - term: "STCG (Short-Term Capital Gain)"
      definition: "Profit realized from selling a capital asset held below the statutory long-term threshold period."
    - term: "LTCG (Long-Term Capital Gain)"
      definition: "Profit realized from selling a capital asset held beyond the statutory long-term threshold period."
    - term: "Section 112A Exemption"
      definition: "Annual ₹1.25 Lakh tax-free threshold granted on equity LTCG profits."
---

## What is a Capital Gains Tax Calculator?

A **Capital Gains Tax Calculator** is an essential wealth and tax planning tool designed to compute personal tax liabilities on profits realized from selling financial investments, real estate property, or commercial assets in India.

Following the major tax reforms enacted in **Union Budget 2024 (Finance Act 2024)**, capital gains tax rates were updated to **20% for STCG** and **12.5% for LTCG** (with an expanded annual exemption threshold of **₹1.25 Lakhs** under Section 112A). Knowing your exact tax liability before executing asset sales helps you optimize returns and preserve net net worth.

### Who Should Use It & When?
* **Equity & Mutual Fund Investors:** Before executing portfolio rebalancing, profit booking, or systematic withdrawals via our [SWP Calculator](/tools/investment/swp-calculator/).
* **Property Sellers:** When selling real estate residential apartments or land parcels to calculate post-2024 LTCG liabilities.
* **ESOP & RSU Holders:** When liquidating corporate stock options or vested RSUs.
* **Taxpayers Filing ITR-2 / ITR-3:** At tax return filing time to verify annual capital gains schedule figures against Form 26AS / AIS statements.

---

## Budget 2024 Capital Gains Tax Rate Structure (FY 2025-26)

| Asset Category | Short-Term Threshold | STCG Tax Rate | Long-Term Threshold | LTCG Tax Rate | Annual Exemption |
|---|---|---|---|---|---|
| **Listed Equity Shares & Equity MFs** | $\le 12$ Months | **20%** | $> 12$ Months | **12.5%** | **₹1.25 Lakhs / Yr** (Sec 112A) |
| **Real Estate Property** | $\le 24$ Months | Slab Rate | $> 24$ Months | **12.5%** | Nil (Sec 54 options available) |
| **Physical Gold & Commodities** | $\le 24$ Months | Slab Rate | $> 24$ Months | **12.5%** | Nil |
| **Unlisted Shares** | $\le 24$ Months | Slab Rate | $> 24$ Months | **12.5%** | Nil |

---

## Capital Gains Tax Formulas & Mathematical Logic

### 1. Net Capital Gain Formula
$$\text{Net Capital Gain} = \text{Sale Price} - \text{Purchase Price} - \text{Transfer Expenses}$$

### 2. Taxable Gain Formula (Equity LTCG)
$$\text{Taxable Gain} = \max(0, \text{Net Capital Gain} - \text{₹1,25,000 Exemption})$$

### 3. Total Tax Payable Formula (Including 4% Cess)
$$\text{Base Tax} = \text{Taxable Gain} \times \left( \frac{\text{Tax Rate \%}}{100} \right)$$

$$\text{Total Tax Payable} = \text{Base Tax} \times 1.04$$

---

## Practical Worked Examples

### Example 1: Equity Mutual Fund LTCG (₹1.5 Lakh Gain in 18 Months)

Suppose an investor bought equity fund units for **₹1,00,000 (₹1 Lakh)** and sold them 18 months later for **₹2,50,000 (₹2.5 Lakhs)** with **₹0 transfer fees**:

1. **Gross Profit:** $₹2,50,000 - ₹1,00,000 = \mathbf{₹1,50,000}$
2. **Holding Period:** 18 Months ($> 12$ Months $\rightarrow$ **LTCG @ 12.5%**)
3. **Section 112A Exemption:** **₹1,25,000**
4. **Net Taxable Gain:** $₹1,50,000 - ₹1,25,000 = \mathbf{₹25,000}$
5. **Base Tax (12.5% of ₹25,000):** **₹3,125**
6. **Health & Education Cess (4%):** **₹125**
7. **Total Tax Payable:** $₹3,125 + ₹125 = \mathbf{₹3,250}$
8. **Net Post-Tax Profit Kept:** $₹1,50,000 - ₹3,250 = \mathbf{₹1,46,750}$

Out of ₹1.5 Lakhs in profits, you pay only **₹3,250 in tax** thanks to the ₹1.25 Lakh exemption limit!

---

### Example 2: Equity Short-Term Capital Gain (₹1 Lakh Gain in 6 Months)

Suppose an investor bought stock shares for **₹1,00,000** and sold them 6 months later for **₹2,00,000**:

1. **Net Capital Gain:** **₹1,00,000**
2. **Holding Period:** 6 Months ($\le 12$ Months $\rightarrow$ **STCG @ 20%**)
3. **Exemption:** Nil (Exemption applies only to LTCG)
4. **Base Tax (20% of ₹1L):** **₹20,000**
5. **Health & Education Cess (4%):** **₹800**
6. **Total Tax Payable:** $₹20,000 + ₹800 = \mathbf{₹20,800}$

---

## 5 Smart Capital Gains Tax-Saving Strategies

1. **Utilize Annual Tax Loss Harvesting:** Realize up to ₹1.25 Lakhs of equity LTCG every financial year before March 31 tax-free to reset your cost basis higher.
2. **Hold Equities for $> 12$ Months:** Holding stocks for more than 1 year lowers your effective tax rate from 20% (STCG) down to 12.5% (LTCG) plus grants ₹1.25L exemption.
3. **Set Off Losses Legal Method:** Offset short-term losses against both short-term and long-term capital gains to minimize taxable income.
4. **Reinvest Real Estate Gains under Section 54:** Reinvest residential house property gains into buying another residential house property within 2 years to claim 100% tax exemption.
5. **Evaluate Overall Tax Bracket:** Plan capital gains redemptions alongside overall annual take-home salary using our [Income Tax Calculator](/tools/tax/income-tax-calculator/).