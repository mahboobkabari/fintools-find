---
title: "SWP Calculator: Systematic Withdrawal Plan & Monthly Income Simulator"
metaDescription: "Calculate regular monthly mutual fund cash withdrawals. Model portfolio longevity, inflation step-up, sequence of returns risk, and Budget 2024 SWP tax rules."
category: "investment"
categoryName: "Investment Calculators"
slug: "swp-calculator"
currency: "INR"
howToUse:
  - "Enter your initial mutual fund investment capital corpus in Rupees (₹)."
  - "Enter your desired monthly cash withdrawal payout (or switch to Reverse SWP mode to solve for sustainable monthly income)."
  - "Set your expected annual return rate (% p.a.) and inflation rate."
  - "Toggle Inflation-Adjusted Withdrawal to step up payouts annually with inflation."
  - "Review your projected portfolio longevity in years and months, multi-scenario stress tests, and Budget 2024 tax estimate."
features:
  - "Forward SWP Portfolio Longevity Engine with exact depletion capping"
  - "Reverse SWP Solver for target retirement durations"
  - "Annual inflation step-up payout simulator"
  - "4-Scenario Stress Tester (Base, Conservative, Optimistic, Sequence-Risk Downturn)"
  - "Withdrawal Rate Benchmark Framework (3%, 4%, 5%, 6% SWR)"
  - "Budget 2024 Mutual Fund SWP Capital Gains Tax Engine"
benefits:
  - "Plan predictable post-retirement monthly pension income"
  - "Protect real purchasing power against long-term inflation"
  - "Enjoy superior tax efficiency compared to traditional bank FD interest"
  - "Evaluate sequence-of-returns risk before starting monthly withdrawals"
faqs:
  - question: "What is a Systematic Withdrawal Plan (SWP) in Mutual Funds?"
    answer: "A Systematic Withdrawal Plan (SWP) is a facility offered by mutual funds that allows investors to redeem a specified cash amount from their accumulated corpus at regular monthly intervals while keeping the unredeemed balance invested to generate market returns."
  - question: "How does SWP taxation work under Finance Act 2024 in India?"
    answer: "Unlike Bank FD interest which is 100% taxed at income slab rates, SWP redemptions attract capital gains tax ONLY on the profit portion of redeemed units. For listed equity mutual funds, long-term capital gains (holding >12 months) beyond ₹1.25 Lakhs per year attract 12.5% LTCG tax. For specified debt mutual funds under Section 50AA, gains are taxed at your marginal slab rate."
  - question: "What is the 4% Safe Withdrawal Rate (SWR) rule in SWP?"
    answer: "The 4% Safe Withdrawal Rate rule suggests withdrawing no more than 4% of your initial portfolio value in the first year of retirement (adjusted for inflation thereafter). Historically, this rate provides high statistical probability that a balanced portfolio will last 30 years or more."
  - question: "What is Sequence of Returns Risk (SRR) in SWP planning?"
    answer: "Sequence of Returns Risk occurs when a portfolio experiences severe negative market returns during the early years of retirement while monthly withdrawals are active. Redeeming units during a market crash permanently reduces the principal unit count, accelerating capital depletion even if long-term average returns recover later."
  - question: "What is the difference between Fixed SWP and Inflation-Adjusted SWP?"
    answer: "A Fixed SWP maintains a constant monthly cash payout (e.g. ₹50,000/mo) throughout retirement. An Inflation-Adjusted SWP increases the monthly payout annually (e.g. by 6% each year) to match rising living expenses and preserve purchasing power."
  - question: "Is TDS deducted on Mutual Fund SWP payouts for domestic resident investors?"
    answer: "No. Unlike bank fixed deposits which attract 10% TDS under Section 194A, mutual fund SWP redemptions for domestic resident individuals do not attract any TDS deduction."
calculatorModule: "investment/swp-calculator.js"
publishDate: 2026-08-06
priority: "P0"
eeat:
  reviewedBy: "Fintools Find Financial Planning & Quant Team"
  methodology: "Month-by-month portfolio growth compounds opening balance before deducting monthly cash payout, with final month payout capped at exact available corpus."
  dataSources:
    - "AMFI India Systematic Withdrawal Plan (SWP) Framework"
    - "Income Tax Act, 1961 as amended by Finance Act 2024 (Section 112A & Section 50AA)"
    - "Trinity Study & Safe Withdrawal Rate (SWR) Research Literature"
advancedContent:
  definitionSnippet: "An SWP Calculator is an institutional-grade financial decision engine that models monthly mutual fund redemptions, portfolio longevity horizons, inflation-adjusted cash payouts, sequence-of-returns risk, and post-Budget 2024 taxation."
  proTips:
    - "Keep 2 to 3 years of expected SWP withdrawals in conservative liquid/short-duration debt funds to insulate your equity portfolio from early sequence-of-returns downturns."
    - "Align your initial annual withdrawal rate between 3.5% and 4.5% of starting capital corpus for sustainable multi-decade retirement income."
    - "Review your SWP withdrawal amount annually to adjust for unexpected inflation surges or portfolio market performance."
  commonMistakes:
    - "Setting a monthly withdrawal amount higher than expected annual portfolio returns during the first 3 years of retirement."
    - "Assuming 100% of SWP payouts are tax-free instead of accounting for capital gains on unit appreciation."
    - "Failing to step up monthly payouts for inflation, causing severe purchasing power loss over 15 to 20 years."
  glossaryTerms:
    - term: "Systematic Withdrawal Plan (SWP)"
      definition: "A mutual fund facility allowing investors to redeem fixed or inflation-adjusted cash payouts at regular intervals."
    - term: "Safe Withdrawal Rate (SWR)"
      definition: "The initial annual withdrawal percentage of a portfolio that can be sustained throughout retirement without depleting principal."
    - term: "Sequence of Returns Risk (SRR)"
      definition: "The risk that market downturns occurring early in retirement will prematurely exhaust a portfolio receiving regular cash withdrawals."
    - term: "Section 112A LTCG"
      definition: "Income tax provision levying 12.5% tax on long-term capital gains exceeding ₹1.25 Lakhs per financial year from listed equity mutual funds."
---

## What is an SWP Calculator?

An **SWP Calculator** (Systematic Withdrawal Plan Calculator) is an interactive financial planning tool designed to simulate regular monthly cash payouts from accumulated mutual fund investments. It answers two fundamental post-retirement financial questions:

1. **Forward SWP Mode:** *"How many years will my ₹X corpus last if I withdraw ₹Y every month at an expected return of R% p.a.?"*
2. **Reverse SWP Mode:** *"How much can I safely withdraw every month if I want my portfolio to last exactly N years?"*

SWP is widely regarded by Certified Financial Planners (CFPs) as the single most tax-efficient and flexible method to convert accumulated wealth into regular monthly pension income.

---

## How SWP Mathematics Works

Each month $m$, the opening portfolio balance $B_{m-1}$ earns investment growth at the monthly compounding rate $r_m = \frac{\text{Annual Rate}}{12 \times 100}$. The monthly cash payout $W_m$ is then deducted:

$$B_m = \left( B_{m-1} \times (1 + r_m) \right) - W_m$$

Where:
* **$B_{m-1}$:** Opening portfolio balance at month $m-1$.
* **$r_m$:** Nominal monthly compounding return decimal ($R / 1200$).
* **$W_m$:** Monthly cash withdrawal payout.
* **$B_m$:** Closing portfolio balance at month $m$.

### Depletion Capping Rule
If the pre-withdrawal balance $(B_{m-1} \times (1 + r_m))$ falls below the target monthly withdrawal $W_m$, the final payout is capped to the exact available balance, and closing balance $B_m$ becomes ₹0. The portfolio is marked as depleted at month $m$.

---

## Fixed vs. Inflation-Adjusted SWP Payouts

Our flagship engine supports two distinct withdrawal methodologies:

### 1. Fixed Monthly Withdrawal
The monthly cash payout remains constant throughout the retirement tenure (e.g. ₹50,000 every month for 20 years). While easy to manage, fixed payouts lose real purchasing power over time due to inflation.

### 2. Inflation-Adjusted Monthly Withdrawal
The monthly payout steps up annually at the start of each 12-month period based on your chosen inflation rate $g$:

$$W_m = W_0 \times (1 + g)^{y-1}, \quad \text{where } y = \left\lfloor \frac{m-1}{12} \right\rfloor + 1$$

For example, a ₹50,000 initial monthly payout under 6% annual inflation steps up to:
* **Year 1:** ₹50,000 / month
* **Year 5:** ₹63,124 / month
* **Year 10:** ₹79,692 / month
* **Year 20:** ₹1,60,357 / month

---

## Sequence-of-Returns Risk (SRR) Explained

Standard financial calculators assume a smooth, constant annual return (e.g. 8% every year). However, real stock and bond markets experience market cycles.

**Sequence of Returns Risk (SRR)** is the danger that severe market downturns occurring in the first 2 to 3 years of retirement will force you to redeem mutual fund units at depressed prices. Even if markets bounce back strongly in Year 5, the reduced unit count permanently diminishes portfolio longevity.

Our **4-Scenario Simulator** explicitly tests this risk by running:
* **Base Scenario:** User-selected expected return.
* **Conservative Scenario:** Expected return minus 2%.
* **Optimistic Scenario:** Expected return plus 2%.
* **Sequence-Risk Stress Scenario:** Simulates 3% return in Years 1–2, 5% in Year 3, and normal returns thereafter.

---

## SWP Mutual Fund Taxation (Finance Act 2024 Framework)

Unlike Bank Fixed Deposit (FD) monthly interest where 100% of the payout is added to your income tax slab (taxed up to 30% + cess), SWP payouts consist of two components:

1. **Invested Capital Principal:** Non-taxable return of your capital.
2. **Capital Gains Component:** Profit accrued on redeemed units.

$$\text{Capital Gain Proportion } P_{\text{gain}} = \max\left(0, \frac{\text{Current Portfolio Value} - \text{Initial Cost}}{\text{Current Portfolio Value}}\right)$$

### Budget 2024 Tax Rules (FY 2025-26 / AY 2026-27):

| Asset Class | Holding Period | Applicable Tax Section | Tax Rate & Exemption |
|---|---|---|---|
| **Listed Equity Mutual Funds** (>65% Equity) | > 12 Months (LTCG) | Section 112A | **12.5% + 4% Cess** (First ₹1.25 Lakhs/yr gain exempt) |
| **Listed Equity Mutual Funds** (>65% Equity) | ≤ 12 Months (STCG) | Section 111A | **20.0% + 4% Cess** |
| **Specified Debt Mutual Funds** (Sec 50AA, ≤35% Equity) | Any Duration | Section 50AA | **Taxpayer Marginal Slab Rate + 4% Cess** |

---

## Mutual Fund SWP vs. Bank FD Monthly Interest

| Feature | Bank FD Monthly Interest | Mutual Fund SWP |
|---|---|---|
| **Taxability** | 100% of payout taxed at marginal slab rate (up to 30%+). | Only gain portion taxed (12.5% LTCG u/s 112A). |
| **Annual Tax Exemption** | ₹40,000 for non-seniors (₹50,000 for seniors u/s 80TTB). | ₹1,25,000 annual LTCG exemption u/s 112A. |
| **TDS Deduction** | 10% TDS deducted automatically by bank. | **Zero TDS** on domestic resident redemptions. |
| **Capital Growth** | Principal remains fixed (eroded by inflation). | Unredeemed balance continues compounding in market. |
| **Flexibility** | Fixed interest rate for entire tenure. | Change payout amount or pause SWP anytime. |

---

## Practical Worked Example: ₹1.0 Crore Retirement Corpus

Suppose a retiree invests a **lump-sum corpus of ₹1,00,00,000 (₹1 Crore)** in an equity hybrid fund earning **10% p.a.** and sets up a monthly SWP of **₹50,00,00 (₹50,000/mo)**:

* **Initial Capital Corpus:** **₹1,00,00,000**
* **Initial Annual Withdrawal Rate:** **6.0% p.a.** (₹6.00 Lakhs / year)
* **10% Annual Growth Generated:** **~₹10.00 Lakhs / year**
* **Total Withdrawn over 10 Years:** $₹50,000 \times 120 = \mathbf{₹60,00,000}$
* **Projected Remaining Corpus after 10 Years:** **₹1,37,18,943**

Because annual portfolio growth (₹10 Lakhs) exceeds annual cash payouts (₹6 Lakhs), the corpus not only pays ₹60 Lakhs in monthly income but also grows to ₹1.37 Crores!