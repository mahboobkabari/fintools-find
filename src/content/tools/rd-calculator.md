---
title: "Recurring Deposit (RD) Calculator: Quarterly Bank Compounding"
metaDescription: "Calculate Recurring Deposit (RD) maturity values with quarterly bank compounding, senior citizen rate bonus, Section 194A TDS, and RD vs SIP comparison."
category: "savings"
categoryName: "Deposit & Savings Calculators"
slug: "rd-calculator"
currency: "INR"
howToUse:
  - "Enter your monthly recurring deposit installment amount in Indian Rupees (₹) or your preferred currency."
  - "Enter the base annual interest rate offered by your bank (% p.a.)."
  - "Set the deposit tenure in years or months."
  - "Toggle Senior Citizen status to automatically add the +0.50% rate bonus."
  - "Review your guaranteed maturity value, total interest earned, estimated Section 194A TDS tax deduction, and RD vs. Equity SIP comparison."
features:
  - "RBI quarterly bank compounding calculation engine for equal monthly installments"
  - "Senior Citizen rate bonus toggle (+0.50% p.a. interest boost)"
  - "Section 194A statutory TDS tax deduction auditor (₹40,000 / ₹50,000 caps)"
  - "Section 206AA 20% higher TDS rate rule for missing PAN"
  - "Guaranteed Bank RD vs. Market-Linked Equity SIP comparison engine"
  - "Inflation-adjusted real purchasing power calculator"
  - "Year-by-year Recurring Deposit accumulation schedule table"
benefits:
  - "Build disciplined monthly savings habits with guaranteed fixed-rate maturity returns"
  - "Audit guaranteed interest outgo before opening bank or post office recurring deposits"
  - "Maximize senior citizen interest rate bonuses and higher ₹50,000 TDS exemption caps"
  - "Evaluate whether a guaranteed RD or a market-linked Equity SIP better matches your risk profile"
faqs:
  - question: "What is a Recurring Deposit (RD)?"
    answer: "A Recurring Deposit (RD) is a term deposit offered by banks and post offices that allows investors to deposit a fixed amount every month for a pre-agreed tenure at a guaranteed interest rate."
  - question: "How is interest calculated on a Recurring Deposit?"
    answer: "In Indian commercial banks, interest on RDs is compounded quarterly. First installment compounds for full tenure, second installment compounds for 1 month less, and so on until maturity."
  - question: "Is TDS applicable on Recurring Deposit interest?"
    answer: "Yes, under Section 194A of the Income Tax Act (amended via Finance Act 2019), banks deduct 10% TDS if annual RD interest across all branches exceeds ₹40,000 for general citizens or ₹50,000 for senior citizens."
  - question: "What is the Senior Citizen rate bonus on RDs?"
    answer: "Commercial banks typically offer an additional 0.50% p.a. interest rate bonus on recurring deposits for senior citizens aged 60 and above."
  - question: "How does a Recurring Deposit differ from a Mutual Fund SIP?"
    answer: "A Recurring Deposit offers 100% guaranteed, fixed interest returns backed by bank capital protection. A Mutual Fund SIP invests in equities or debt, offering variable, market-linked returns without capital guarantees."
  - question: "What happens if I miss an RD installment?"
    answer: "If you default on an RD installment, banks may charge a nominal penalty (e.g. ₹1.50 per ₹100 per month) and the total maturity interest will be marginally reduced."
calculatorModule: "savings/rd-calculator.js"
publishDate: 2026-08-08
priority: "P0"
eeat:
  reviewedBy: "Fintools Find Quantitative Finance & Engineering Team"
  methodology: "Calculations strictly execute Reserve Bank of India (RBI) quarterly deposit compounding rules and Income Tax Act Section 194A TDS statutory guidelines."
  dataSources:
    - "Reserve Bank of India (RBI) Master Direction - Interest Rate on Deposits"
    - "Income Tax Department, Government of India (Section 194A & Section 206AA Guidelines)"
advancedContent:
  definitionSnippet: "A Recurring Deposit (RD) Calculator is an interactive wealth decision engine that computes guaranteed maturity values, quarterly compounded interest on monthly installments, senior citizen rate bonuses, Section 194A TDS tax deductions, and RD vs SIP comparisons."
  proTips:
    - "Automate your monthly RD installment via standing instruction on the day after salary credit to ensure disciplined savings without default penalties."
    - "If your total annual income is non-taxable, submit Form 15G or Form 15H to your bank at the start of April to prevent Section 194A TDS deductions."
    - "Use RDs for short-term goals (1 to 3 years) requiring guaranteed capital preservation, and use Equity SIPs for long-term goals (5+ years) to beat inflation."
  commonMistakes:
    - "Assuming RD interest is tax-free—RD interest is fully taxable under 'Income from Other Sources' as per your marginal tax slab."
    - "Failing to furnish PAN details to the bank, triggering a higher 20% penalty TDS deduction under Section 206AA."
    - "Comparing gross RD returns directly against equity SIP returns without accounting for market volatility and capital risk."
  glossaryTerms:
    - term: "Recurring Deposit (RD)"
      definition: "A monthly systematic deposit scheme earning fixed quarterly compounded interest."
    - term: "Quarterly Compounding"
      definition: "An interest calculation method where interest is compounded 4 times per year on accumulated deposits."
    - term: "Section 194A TDS"
      definition: "Statutory tax deduction at source on bank interest exceeding ₹40,000 (₹50,000 for senior citizens)."
---

## What is a Recurring Deposit (RD) Calculator?

A **Recurring Deposit (RD) Calculator** is an institutional-grade financial decision tool that projects future maturity values and total interest earned on monthly systematic bank deposits. Designed for disciplined monthly savers, an RD calculator provides clear insights on:

1. **Guaranteed Maturity Value**: The final maturity lump sum accumulated from monthly installments after applying Reserve Bank of India (RBI) quarterly compounding standards.
2. **Senior Citizen Rate Bonus**: Evaluating the compounding impact of the **+0.50% p.a.** additional interest rate offered to senior citizens (age 60+).
3. **Section 194A Statutory TDS Audit**: Calculating Tax Deducted at Source (TDS) based on the statutory **₹40,000** (general) and **₹50,000** (senior citizen) annual exemption thresholds.
4. **Guaranteed RD vs. Market Equity SIP**: Side-by-side comparison of fixed contractual RD returns against projected equity mutual fund SIP growth.
5. **Inflation-Adjusted Real Purchasing Power**: Determining what your future guaranteed lump sum will be worth in today's terms.

---

## Recurring Deposit Financial Methodology & Statutory Rules

### 1. Quarterly Compounding for Monthly Installments (RBI Standard)
$$A = \sum_{m=1}^{n} P \times \left(1 + \frac{r/100}{4}\right)^{(n - m + 1)/3}$$

Where:
* $P$ = Fixed monthly installment amount
* $r$ = Effective annual interest rate (% p.a.) = Base Rate + (Senior Citizen ? 0.50% : 0%)
* $n$ = Total tenure in months ($n = \text{Years} \times 12$)
* $m$ = Installment index ($1 \le m \le n$)

### 2. Section 194A Statutory TDS Tax Audit
$$\text{TDS Threshold} = \begin{cases} ₹50,000, & \text{for Senior Citizens (Age } \ge 60) \\ ₹40,000, & \text{for General Public} \end{cases}$$
$$\text{TDS Rate} = \begin{cases} 10\%, & \text{if valid PAN is provided} \\ 20\%, & \text{if PAN is missing (Section 206AA)} \end{cases}$$
$$\text{TDS Amount} = \text{Annualized Interest} > \text{Threshold} \; ? \; (\text{Total Interest} \times \text{TDS Rate}) \; : \; 0$$

---

## Related Savings & Investment Calculators

Explore other flagship deposit, savings, and investment calculators across Fintools Find:

* [Fixed Deposit (FD) Calculator](/tools/fd-calculator) — Bank quarterly compounding & Section 194A TDS estimator.
* [Public Provident Fund (PPF) Calculator](/tools/ppf-calculator) — 15-year statutory EEE tax-free compounding engine.
* [SIP Calculator](/tools/sip-calculator) — Systematic Investment Plan wealth compounding model.
* [Step-up SIP Calculator](/tools/step-up-sip-calculator) — Annual top-up equity SIP growth calculator.
* [Income Tax Calculator](/tools/income-tax-calculator) — New vs Old tax regime comparison engine.
* [Provident Fund (EPF) Calculator](/tools/provident-fund-calculator) — Employee provident fund statutory accumulation.
