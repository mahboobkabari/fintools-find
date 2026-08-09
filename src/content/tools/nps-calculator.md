---
title: "NPS Calculator: Calculate National Pension System Corpus, Pension & Tax Savings"
metaDescription: "Calculate your NPS Tier 1 retirement corpus at age 60, 60% tax-free lump-sum, monthly pension stream, and Section 80CCD(1B) tax savings."
category: "retirement"
categoryName: "Retirement Calculators"
slug: "nps-calculator"
currency: "INR"
howToUse:
  - "Enter your current age and planned exit/retirement age (default age 60)."
  - "Enter your monthly self-contribution to NPS Tier 1 in Indian Rupees (₹)."
  - "Enter existing accumulated NPS Tier 1 balance if applicable."
  - "Select your Income Tax Regime (Old Tax Regime vs New Tax Regime u/s 115BAC)."
  - "Select your marginal income tax bracket % (5%, 10%, 15%, 20%, or 30%)."
  - "Adjust your Active Choice asset allocation (Equity Class E up to 75%, Corporate Debt Class C, Govt Bonds Class G)."
  - "Select mandatory annuity purchase % (minimum 40%, maximum 100%) and illustrative annuity pension return rate."
  - "Instantly review total corpus at age 60, 60% tax-free lump-sum, monthly pension stream, and annual tax saved today."
features:
  - "PFRDA-compliant NPS Tier 1 compounding & pension decision engine"
  - "Section 80CCD(1B) extra ₹50,000 deduction & Section 80CCD(2) employer 14% tax savings calculation"
  - "Old Tax Regime vs New Tax Regime (u/s 115BAC) tax benefit modeling"
  - "Active Choice asset allocation return weighting (Equity E, Corporate C, Govt G)"
  - "60% tax-free lump-sum withdrawal u/s 10(12A) and 40% mandatory annuity pension simulator"
  - "Annuity pension rate sensitivity matrix across 5.0%, 6.0%, 7.0%, and 8.0% return rates"
benefits:
  - "Know the exact annual tax saved today under Section 80CCD(1B) and 80CCD(2)"
  - "Calculate total retirement nest egg accumulated at age 60 under custom asset allocation"
  - "Determine exact 60% tax-free lump-sum payout vs lifetime monthly pension stream"
  - "Compare NPS Tier 1 vs Tier 2 features, lock-in rules, and withdrawal flexibility"
faqs:
  - question: "What is the National Pension System (NPS)?"
    answer: "NPS is a voluntary, government-backed pension scheme regulated by PFRDA (Pension Fund Regulatory and Development Authority). It allows Indian citizens aged 18 to 70 to systematically build a retirement nest egg across Equity, Corporate Debt, and Government Securities."
  - question: "What are the tax benefits of NPS under Section 80CCD(1B) and 80CCD(2)?"
    answer: "Under the Old Tax Regime, Section 80CCD(1B) provides an exclusive extra tax deduction of up to ₹50,000/year over and above Section 80C's ₹1.5 Lakh limit (saving up to ₹15,600/year in 30% slab). Under Section 80CCD(2), employer contributions up to 14% of Basic Salary are tax-deductible under BOTH Old and New Tax Regimes."
  - question: "Is NPS lump-sum withdrawal tax-free at age 60?"
    answer: "Yes. Under Section 10(12A) of the Income Tax Act, up to 60% of the total accumulated NPS Tier 1 corpus withdrawn at age 60 is completely tax-free. The remaining minimum 40% must be used to purchase an annuity pension stream."
  - question: "What happens if total NPS corpus is ₹5 Lakhs or less at age 60?"
    answer: "Under PFRDA exit guidelines, if total accumulated Tier 1 corpus is ₹5 Lakhs or less at superannuation (age 60), the subscriber can withdraw 100% of the corpus as a lump sum without any mandatory annuity purchase requirement."
  - question: "What is the difference between NPS Tier 1 and Tier 2 accounts?"
    answer: "Tier 1 is the mandatory retirement account with tax benefits and lock-in until age 60. Tier 2 is a voluntary liquid savings account with zero lock-in and instant withdrawal flexibility, but no tax deductions for private subscribers."
calculatorModule: "retirement/nps-calculator.js"
publishDate: 2026-08-06
priority: "P0"
eeat:
  reviewedBy: "Fintools Find Engineering & Quant Team"
  methodology: "Calculations strictly execute PFRDA exit regulations, Section 10(12A) lump-sum tax exemptions, Section 80CCD(1B) & 80CCD(2) deduction caps, and weighted asset return models."
  dataSources:
    - "PFRDA (Pension Fund Regulatory and Development Authority) Master Circulars"
    - "Income Tax Act 1961: Section 10(12A), Section 80CCD(1), Section 80CCD(1B), Section 80CCD(2)"
    - "Budget 2024 Corporate NPS 14% Employer Match Guidelines"
advancedContent:
  definitionSnippet: "An NPS Calculator (National Pension System Calculator) is an interactive decision engine that estimates retirement corpus at age 60, 60% tax-free lump sum, monthly annuity pension, and tax savings under Section 80CCD(1B) & 80CCD(2)."
  proTips:
    - "Under the Old Tax Regime, invest ₹50,000 annually in NPS Tier 1 to maximize Section 80CCD(1B) tax savings regardless of whether your Section 80C ₹1.5L limit is full."
    - "Under the New Tax Regime (u/s 115BAC), opt for Corporate NPS employer contribution u/s 80CCD(2) up to 14% of Basic Salary for tax-deductible retirement savings."
    - "If under age 50, select Active Choice Equity (Class E) at 75% to harness maximum equity growth over a 20+ year compounding runway."
  commonMistakes:
    - "Assuming Section 80CCD(1B) ₹50,000 deduction is available under the New Tax Regime (u/s 115BAC). It is valid ONLY under the Old Tax Regime."
    - "Assuming annuity pension income is tax-free. While the 60% lump-sum is tax-free u/s 10(12A), monthly annuity pension received is taxable as regular income."
  glossaryTerms:
    - term: "Section 80CCD(1B)"
      definition: "An exclusive income tax deduction of up to ₹50,000/year for self-contributions to NPS Tier 1, available over and above Section 80C's ₹1.5L cap under the Old Tax Regime."
    - term: "Section 80CCD(2)"
      definition: "Tax deduction for employer contribution to NPS up to 14% of Basic Salary + DA, available under BOTH Old and New Tax Regimes."
    - term: "Section 10(12A)"
      definition: "Income Tax provision making up to 60% lump-sum withdrawal from NPS Tier 1 at age 60 completely tax-free."
---

## Understanding the National Pension System (NPS)

The National Pension System (**NPS**) is a government-backed pension scheme regulated by PFRDA. It offers individuals a low-cost, structured framework to build retirement wealth across Equity (E), Corporate Debt (C), and Government Securities (G), while providing dual tax benefits during the accumulation phase and at maturity.

---

### NPS Tax Benefit Framework Summary

| Tax Section | Eligible Account | Maximum Annual Deduction | Applicable Tax Regime |
| :--- | :--- | :--- | :--- |
| **Section 80CCD(1)** | Tier 1 Self-Contribution | Up to 10% of Basic Salary (within ₹1.5L 80C cap) | **Old Tax Regime Only** |
| **Section 80CCD(1B)** | Tier 1 Self-Contribution | Exclusive Extra **₹50,000 / year** | **Old Tax Regime Only** |
| **Section 80CCD(2)** | Employer Contribution | Up to **14% of Basic Salary + DA** | **Both Old & New Tax Regimes** |
| **Section 10(12A)** | Tier 1 Maturity Exit | **60% Lump-Sum Tax-Free** | **Both Old & New Tax Regimes** |

---

### Worked Reference Case Study

**Profile**: Age 30 Employee, ₹5,000/month Tier 1 Contribution, 10.0% Weighted Return, 40% Mandatory Annuity at 6.0% Rate, 30% Tax Bracket (Old Tax Regime).

- **Investment Runway**: $60 - 30 = 30 \text{ Years}$
- **Total Self-Invested**: ₹18.0 Lakhs
- **Total Accumulated Nest Egg at Age 60**: **₹1,13,96,627** (₹1.14 Crores)
- **60% Tax-Free Lump-Sum Withdrawal**: **₹68,37,976**
- **40% Mandatory Annuity Purchase**: **₹45,58,651**
- **Estimated Monthly Pension Stream**: **₹22,793 / month**
- **Annual Tax Saved Today u/s 80CCD(1B)**: **₹15,600 / year** (₹50,000 × 30% + 4% cess)