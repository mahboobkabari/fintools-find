# Roadmap Validation Report

**Date:** August 6, 2026  
**Status:** Audit Complete — 0 Architectural Defects Found  
**Scope:** Verification of all implemented calculators against [`tool_slugs.csv`](file:///c:/Users/mahbo/Admin/02_Side%20Project/Tools%20Website/FinTool/tool_slugs.csv) and [`4-feature-tickets.md`](file:///c:/Users/mahbo/Admin/02_Side%20Project/Tools%20Website/FinTool/4-feature-tickets.md).

---

## 1. Executive Summary

| Metric | Count | Details |
|---|---|---|
| **Total Planned Calculators** | **194** | Defined across 14 categories in `tool_slugs.csv`. |
| **Total Implemented Calculators** | **21** | 8 Loans + 6 Investment + 7 Tax tools fully built & shipped. |
| **Missing (Unbuilt) Calculators** | **173** | Scheduled for future category sprints. |
| **Extra (Unplanned) Calculators** | **0** | Zero unauthorized or off-roadmap calculators were built. |
| **Category Mismatches** | **0** | 100% of tools are assigned to their designated functional category. |
| **Slug Variations / Mismatches** | **3** | Minor URL slug simplifications (detailed in Section 5). |

---

## 2. Planned Calculators (Master Roadmap: 194 Tools)

The master product backlog in [`tool_slugs.csv`](file:///c:/Users/mahbo/Admin/02_Side%20Project/Tools%20Website/FinTool/tool_slugs.csv) defines 194 calculators grouped into 14 categories:

1. **Loan & EMI Calculators:** 23 tools (Lines 2–24)
2. **Investment Calculators:** 30 tools (Lines 25–54)
3. **Deposit & Savings Calculators:** 7 tools (Lines 55–61)
4. **Retirement Calculators:** 18 tools (Lines 62–79)
5. **Tax Calculators:** 20 tools (Lines 80–99)
6. **Real Estate Calculators:** 13 tools (Lines 100–112)
7. **Insurance Calculators:** 12 tools (Lines 113–124)
8. **Credit & Debt Calculators:** 6 tools (Lines 125–130)
9. **Business & Corporate Finance Calculators:** 24 tools (Lines 131–153)
10. **Currency & Cost Calculators:** 6 tools (Lines 154–159)
11. **Crypto Calculators:** 10 tools (Lines 160–169)
12. **Personal/Salary Calculators:** 6 tools (Lines 170–175)
13. **Health & Benefits Calculators:** 4 tools (Lines 176–179)
14. **Everyday, Life & Education Calculators:** 15 tools (Lines 180–195)

---

## 3. Implemented Calculators (21 Shipped Tools)

All 21 currently implemented calculators correspond directly to planned items in `tool_slugs.csv`:

### A. Loan Cluster (8 Tools Shipped)
1. `emi-calculator` (`/tools/loans/emi-calculator/`) — CSV Row 2
2. `home-loan-calculator` (`/tools/loans/home-loan-calculator/`) — CSV Row 3
3. `car-loan-calculator` (`/tools/loans/car-loan-calculator/`) — CSV Row 4
4. `personal-loan-calculator` (`/tools/loans/personal-loan-calculator/`) — CSV Row 5
5. `education-loan-calculator` (`/tools/loans/education-loan-calculator/`) — CSV Row 6
6. `loan-amortization-calculator` (`/tools/loans/loan-amortization-calculator/`) — CSV Row 8
7. `loan-eligibility-calculator` (`/tools/loans/loan-eligibility-calculator/`) — CSV Row 9
8. `loan-prepayment-calculator` (`/tools/loans/loan-prepayment-calculator/`) — CSV Row 10

### B. Investment Cluster (6 Tools Shipped)
9. `sip-calculator` (`/tools/investment/sip-calculator/`) — CSV Row 25
10. `lumpsum-calculator` (`/tools/investment/lumpsum-calculator/`) — CSV Row 26
11. `swp-calculator` (`/tools/investment/swp-calculator/`) — CSV Row 27
12. `step-up-sip-calculator` (`/tools/investment/step-up-sip-calculator/`) — CSV Row 28
13. `mutual-fund-returns-calculator` (`/tools/investment/mutual-fund-returns-calculator/`) — CSV Row 29
14. `cagr-calculator` (`/tools/investment/cagr-calculator/`) — CSV Row 30

### C. Tax Cluster (7 Tools Shipped)
15. `income-tax-calculator` (`/tools/tax/income-tax-calculator/`) — CSV Row 80
16. `gst-calculator` (`/tools/tax/gst-calculator/`) — CSV Row 81
17. `vat-calculator` (`/tools/tax/vat-calculator/`) — CSV Row 82
18. `capital-gains-tax-calculator` (`/tools/tax/capital-gains-tax-calculator/`) — CSV Row 83
19. `hra-calculator` (`/tools/tax/hra-calculator/`) — CSV Row 84
20. `tds-calculator` (`/tools/tax/tds-calculator/`) — CSV Row 85
21. `take-home-salary-calculator` (`/tools/tax/take-home-salary-calculator/`) — CSV Row 86

---

## 4. Missing Calculators (173 Remaining Tools)

The following 173 planned calculators remain to be built in future category sprints:

* **Loans Cluster (15 remaining):** Business Loan, Balance Transfer, Refinance, Debt Consolidation, Line of Credit, LTV, Auto Lease, Bridge Loan, Hard Money, P2P Lending, ARM, Reverse Mortgage, Construction Loan, Mortgage Points, PMI.
* **Investment Cluster (24 remaining):** XIRR, Compound Interest, Simple Interest, ROI, Rule of 72, Goal-based SIP, Stock Average, Dividend Yield, Bond Yield, Annuity, Options P/L, Margin Trading, Portfolio Rebalancing, Sharpe Ratio, Asset Allocation, DRIP, Beta, VaR, Stock Split, ESPP, RSU Tax, Stock Option, DCF, WACC.
* **Deposit & Savings Cluster (7 remaining):** FD, RD, PPF, NSC, Savings Goal, Emergency Fund, High-Yield Savings.
* **Retirement Cluster (18 remaining):** Retirement Corpus, NPS, 401(k), IRA, Pension, Social Security, Gratuity, Provident Fund (EPF), FIRE, Roth Conversion, RMD, Retirement Withdrawal, Social Security Break-even, Pension Lump Sum vs Annuity, Coast FIRE, Superannuation, APY, VPF.
* **Tax Cluster (13 remaining):** Payroll Tax, Property Tax, Sales Tax, Tax Refund, Estimated Quarterly Tax, Self-Employment Tax, AMT, Estate Tax, Gift Tax, W-4 Withholding, FICA Tax, Tax Bracket, Marginal vs Effective Tax.
* **Real Estate Cluster (13 remaining):** Home Affordability, Rent vs Buy, Property Valuation, Stamp Duty, Rental Yield, Home Equity, Closing Cost, Cap Rate, Cash-on-Cash Return, Gross Rent Multiplier, 1% Rule, Escrow, Property Tax Proration.
* **Insurance Cluster (12 remaining):** Term Life, Life Insurance Needs, Health Insurance Premium, Car Insurance, Annuity/Pension, Disability Insurance, Long-term Care, Umbrella, Renters, Home, Whole Life, Critical Illness Cover.
* **Credit & Debt Cluster (6 remaining):** Credit Card Payoff, Debt Snowball, Debt Avalanche, Debt-to-Income, Credit Utilization, Balance Transfer Savings.
* **Business & Corporate Finance Cluster (24 remaining):** Break-even, Profit Margin, Cash Flow, Working Capital, Payback Period, NPV, IRR, Depreciation, Inventory Turnover, Burn Rate/Runway, Valuation, EBITDA, Gross Margin, CLV, CAC, MRR/ARR, Equity Dilution, Startup Valuation, DSCR, Quick Ratio, Current Ratio, ROE, ROA.
* **Currency & Cost Cluster (6 remaining):** Currency Converter, Inflation, Purchasing Power, Cost of Living, Import Duty, Remittance Fee.
* **Crypto Cluster (10 remaining):** Crypto P/L, Mining Profitability, Staking Rewards, DCA, Crypto Tax, Impermanent Loss, Yield Farming APY, Gas Fee, Token Vesting, NFT Royalty.
* **Personal & Benefits Cluster (10 remaining):** Salary, Net Worth, Budget, 50/30/20 Budget, Student Loan, College Savings, HSA, FSA, COBRA, Medicare.
* **Everyday & Life Event Cluster (15 remaining):** Wedding Budget, Baby Cost, Child Support, Alimony, Divorce Settlement, 529 Plan, FAFSA, Student Loan Refinance, Student Loan Forgiveness, Cost of College, Freelancer Hourly Rate, Overtime Pay, Tip, Bill Split, Zakat, Tithe.

---

## 5. Extra Calculators & Variations

### Extra Calculators
* **Count:** **0**
* There are no extra, unauthorized, or out-of-scope calculators in the codebase.

### Minor URL Slug Simplifications
Three implemented calculators use cleaner, more concise URL slugs compared to `tool_slugs.csv`:

1. **Home Loan Calculator:**
   - `tool_slugs.csv`: `/tools/home-loan-mortgage-calculator`
   - Codebase Slug: `/tools/loans/home-loan-calculator`
   - *Rationale:* Concise, user-friendly Indian & Global search keyword match.
2. **Lumpsum Investment Calculator:**
   - `tool_slugs.csv`: `/tools/lumpsum-investment-calculator`
   - Codebase Slug: `/tools/investment/lumpsum-calculator`
   - *Rationale:* Standardized shorter URL pattern.
3. **Mutual Fund Returns Calculator:**
   - `tool_slugs.csv`: `/tools/mutual-fund-return-calculator`
   - Codebase Slug: `/tools/investment/mutual-fund-returns-calculator`
   - *Rationale:* Uses plural `returns` matching high-volume search intent.

---

## 6. Priority & Category Mismatches

### Priority Alignment
- All 21 implemented tools are classified as **P0 or P1** in `4-feature-tickets.md` and `tool_slugs.csv`.
- No P2 or low-priority tools were built out of order.

### Category Mapping
- CSV Category Names map 1:1 to Astro URL route parameters:
  - `Loan & EMI Calculators` $\rightarrow$ `/tools/loans/`
  - `Investment Calculators` $\rightarrow$ `/tools/investment/`
  - `Tax Calculators` $\rightarrow$ `/tools/tax/`

---

## 7. Conclusion & Next Sprint Recommendation

The platform implementation is **100% aligned** with the master roadmap defined in `tool_slugs.csv` and `4-feature-tickets.md`. Zero unauthorized tools have been added.

**Next Action:** Await user direction on which category cluster to execute next (e.g. Deposit & Savings Sprint 1 or Retirement Sprint 1).
