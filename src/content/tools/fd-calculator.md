---
title: "Fixed Deposit (FD) Calculator: Quarterly Compounding & TDS Estimator"
metaDescription: "Calculate fixed deposit (FD) maturity values with quarterly compounding, monthly income payouts, senior citizen rate bonus, and Section 194A TDS."
category: "savings"
categoryName: "Deposit & Savings Calculators"
slug: "fd-calculator"
currency: "INR"
howToUse:
  - "Enter your principal deposit amount in Indian Rupees (₹) or your preferred currency."
  - "Select your interest payout mode: Cumulative (quarterly compounding), Monthly Payout, or Quarterly Payout."
  - "Enter the base annual interest rate offered by your bank (% p.a.)."
  - "Set the deposit tenure in years, months, or days."
  - "Toggle Senior Citizen status to automatically add the +0.50% rate bonus."
  - "Review your guaranteed maturity value, total interest earned, estimated Section 194A TDS tax deduction, and net effective yield."
features:
  - "Quarterly bank compounding reinvestment FD calculation engine"
  - "Monthly and Quarterly simple interest payout mode solvers"
  - "Senior Citizen rate bonus toggle (+0.50% p.a. interest boost)"
  - "Section 194A statutory TDS tax deduction auditor (₹40,000 / ₹50,000 caps)"
  - "Section 206AA 20% higher TDS rate rule for missing PAN"
  - "Marginal income tax slab post-tax net yield calculator"
  - "Year-by-year Fixed Deposit accumulation schedule table"
benefits:
  - "Compare cumulative compounding vs. regular monthly income payouts for cash flow planning"
  - "Audit guaranteed maturity returns before locking funds into bank fixed deposits"
  - "Maximize senior citizen higher interest rates and tax-exempt TDS thresholds"
  - "Understand the net post-tax return after bank TDS and income tax slab deductions"
faqs:
  - question: "What is a Fixed Deposit (FD)?"
    answer: "A Fixed Deposit (FD) is a secure, fixed-income investment offered by banks and non-banking financial companies (NBFCs) where an investor deposits a lump sum amount for a fixed tenure at a predetermined, guaranteed interest rate."
  - question: "How is interest calculated on a Cumulative Fixed Deposit?"
    answer: "Most banks calculate interest on cumulative FDs using quarterly compounding: A = P * (1 + r/400)^(4*t). Interest earned each quarter is added back to the principal, earning interest on interest until maturity."
  - question: "What is the Senior Citizen rate bonus on FDs?"
    answer: "Banks typically offer an additional 0.50% p.a. interest rate bonus to senior citizens (individuals aged 60 and above). Some banks also offer an extra 0.75% p.a. for super senior citizens aged 80+."
  - question: "What is Section 194A TDS on Fixed Deposit interest?"
    answer: "Under Section 194A of the Income Tax Act, banks deduct Tax Deducted at Source (TDS) at 10% if annual FD interest income across all branches exceeds ₹40,000 for general citizens or ₹50,000 for senior citizens."
  - question: "What happens if I do not provide my PAN card to the bank?"
    answer: "Under Section 206AA, if a valid Permanent Account Number (PAN) is not furnished to the bank, TDS will be deducted at a higher statutory rate of 20% instead of 10%."
  - question: "Can I avoid TDS on FD interest legally?"
    answer: "If your total annual income is below the taxable exemption limit, you can submit Form 15G (for general citizens under 60) or Form 15H (for senior citizens aged 60+) to the bank at the start of the financial year to prevent TDS deduction."
calculatorModule: "savings/fd-calculator.js"
publishDate: 2026-08-08
priority: "P0"
eeat:
  reviewedBy: "Fintools Find Quantitative Finance & Engineering Team"
  methodology: "Calculations strictly execute Reserve Bank of India (RBI) deposit compounding rules and Income Tax Act Section 194A TDS statutory guidelines."
  dataSources:
    - "Reserve Bank of India (RBI) Master Direction - Interest Rate on Deposits"
    - "Income Tax Department, Government of India (Section 194A & Section 206AA Guidelines)"
advancedContent:
  definitionSnippet: "A Fixed Deposit (FD) Calculator is an interactive financial decision tool that computes guaranteed maturity values, quarterly compounded interest, regular monthly/quarterly payouts, senior citizen rate bonuses, and Section 194A TDS tax deductions."
  proTips:
    - "Ladder your FDs by splitting a large lump sum across multiple maturity tenures (1Y, 2Y, 3Y) to maintain liquidity and reduce reinvestment risk."
    - "Submit Form 15G/15H in the first week of April every financial year to avoid unnecessary TDS deductions if your income is tax-exempt."
    - "Consider 5-Year Tax-Saver FDs if you need Section 80C tax deductions, but note that tax-saver FDs carry a mandatory 5-year lock-in period with no premature withdrawal."
  commonMistakes:
    - "Forgetting that FD interest is fully taxable as per your marginal income tax bracket, not just the 10% TDS deducted by the bank."
    - "Choosing a cumulative FD when you actually need monthly income payouts for regular living expenses."
    - "Failing to furnish PAN details, leading to a 20% penalty TDS rate under Section 206AA."
  glossaryTerms:
    - term: "Fixed Deposit (FD)"
      definition: "A financial instrument provided by banks offering a higher rate of interest than a regular savings account until a given maturity date."
    - term: "Quarterly Compounding"
      definition: "An interest calculation method where interest is compounded 4 times per year, accelerating growth."
    - term: "Section 194A TDS"
      definition: "Statutory tax deduction at source on bank interest exceeding ₹40,000 (₹50,000 for senior citizens)."
---

## What is a Fixed Deposit (FD) Calculator?

A **Fixed Deposit (FD) Calculator** is an institutional-grade financial decision engine that calculates future maturity amounts and periodic interest payouts for bank fixed deposits. Whether you are investing ₹10,000 for short-term liquidity or locking ₹10,000,000 for retirement income, an FD calculator provides complete transparency on:

1. **Guaranteed Maturity Value**: The final maturity payout after applying bank quarterly compounding rules.
2. **Payout Mode Flexibility**: Comparing Cumulative reinvestment against Monthly or Quarterly interest income payouts.
3. **Senior Citizen Rate Bonus**: Evaluating the impact of the **+0.50% p.a.** additional interest offered to senior citizens.
4. **Section 194A TDS Audit**: Calculating statutory Tax Deducted at Source (TDS) based on the **₹40,000** (general) and **₹50,000** (senior citizen) annual exemption thresholds.
5. **Net Post-Tax Yield**: Determining your true post-tax return after accounting for your marginal income tax slab.

---

## Fixed Deposit Financial Methodology & Statutory Rules

### 1. Cumulative Reinvestment Mode (Quarterly Compounding)
$$A = P \times \left(1 + \frac{r/100}{4}\right)^{4t}$$
$$\text{Total Interest} = A - P$$

Where:
* $P$ = Principal deposit amount
* $r$ = Effective annual interest rate (% p.a.) = Base Rate + (Senior Citizen ? 0.50% : 0%)
* $t$ = Deposit tenure in years

### 2. Monthly Income Payout Mode (Simple Interest Payout)
$$\text{Monthly Payout} = P \times \frac{r/100}{12}$$
$$\text{Total Interest} = \text{Monthly Payout} \times (t \times 12)$$
$$\text{Maturity Value} = P$$

### 3. Section 194A Statutory TDS Tax Deduction
$$\text{TDS Threshold} = \begin{cases} ₹50,000, & \text{for Senior Citizens (Age } \ge 60) \\ ₹40,000, & \text{for General Public} \end{cases}$$
$$\text{TDS Rate} = \begin{cases} 10\%, & \text{if valid PAN is provided} \\ 20\%, & \text{if PAN is missing (Section 206AA)} \end{cases}$$
$$\text{TDS Amount} = \text{Annualized Interest} > \text{Threshold} \; ? \; (\text{Total Interest} \times \text{TDS Rate}) \; : \; 0$$

---

## Related Savings & Investment Calculators

Explore other flagship deposit, savings, and investment calculators across Fintools Find:

* [SIP Calculator](/tools/sip-calculator) — Systematic Investment Plan wealth compounding model.
* [Lumpsum Investment Calculator](/tools/lumpsum-calculator) — Mutual fund lump-sum growth calculator.
* [Provident Fund (EPF) Calculator](/tools/provident-fund-calculator) — Employee provident fund statutory accumulation.
* [Income Tax Calculator](/tools/income-tax-calculator) — New vs Old tax regime comparison engine.
* [NPS Calculator](/tools/nps-calculator) — National Pension System retirement annuity calculator.
* [401(k) Retirement Calculator](/tools/401k-calculator) — Employer match & 401(k) growth estimator.
