---
title: "Impermanent Loss Calculator: DeFi Liquidity Pool vs HODL Engine"
metaDescription: "Calculate impermanent loss, constant-product AMM rebalancing, LP vs HODL portfolio returns, and break-even trading fee APR for DeFi liquidity pools."
category: "crypto"
categoryName: "Crypto Calculators"
slug: "impermanent-loss-calculator"
currency: "generic"
howToUse:
  - "Enter the names or symbols of Token A (Base Asset) and Token B (Quote Asset / Stablecoin)."
  - "Specify your Total Initial Deposit in fiat (allocated 50% into Token A and 50% into Token B)."
  - "Input the Initial and Final Spot Prices for both tokens (or switch to % Price Move mode to enter percentage changes)."
  - "Optionally configure the Estimated Pool Fee APR (%) and Liquidity Holding Duration (in calendar days)."
  - "Examine the Pure Impermanent Loss %, Dollar Impact vs HODL, and Resulting Token Inventory Rebalancing."
  - "Review the Net LP Advantage vs HODL and the Break-Even Fee Yield Required to ensure profitable liquidity provision."
features:
  - "Rigorous constant-product AMM (x · y = k) mathematical engine modeling 50/50 liquidity pools"
  - "Dual calculation modes: Explicit Spot Prices mode and Percentage Price Move mode"
  - "Three-way comparative valuation: 100% HODL Benchmark vs Pure LP Position vs Fee-Adjusted LP Total"
  - "Token inventory rebalancing calculator demonstrating exact automated arbitrage purchases and sales"
  - "Analytical break-even fee solver calculating the exact fee dollar revenue and annualized APR required to offset IL"
  - "Interactive SVG Impermanent Loss curve plotting real-time position markers along the mathematical divergence curve"
  - "Comprehensive Price Divergence Sensitivity Matrix spanning 0.1x to 10x relative price shifts"
  - "Multi-currency quoting across 9 major fiat denominations (USD, EUR, GBP, INR, CAD, AUD, AED, SGD, JPY)"
benefits:
  - "Determine whether pool trading fees will outpace impermanent loss before committing capital to decentralized exchanges"
  - "Identify your exact break-even fee APR hurdle rate for any expected token price volatility scenario"
  - "Understand the exact token rebalancing mechanics that cause liquidity pools to sell winners and buy losers"
  - "Compare holding spot crypto in cold storage against active DeFi yield farming strategies"
faqs:
  - question: "What is impermanent loss in DeFi?"
    answer: "Impermanent loss (IL) is the opportunity cost of providing liquidity to an Automated Market Maker (AMM) pool compared to simply holding the original tokens in a private wallet. It occurs whenever the relative price ratio between the two deposited tokens diverges from its initial entry point."
  - question: "Why is it called 'impermanent' loss?"
    answer: "The loss is called 'impermanent' because it only becomes permanently realized when you withdraw your liquidity from the smart contract. If the relative price ratio between the two tokens returns to its original entry level (r = 1.0) before withdrawal, impermanent loss drops back to 0.00%."
  - question: "How much impermanent loss occurs at standard price movements?"
    answer: "For standard 50/50 constant-product pools (like Uniswap v2 or SushiSwap), a 1.25x price change results in -0.6% IL; a 1.5x price change results in -2.0% IL; a 2x price change results in -5.7% IL; a 3x price change results in -13.4% IL; a 4x price change results in -20.0% IL; and a 5x price change results in -25.5% IL."
  - question: "Can trading fees make up for impermanent loss?"
    answer: "Yes. Liquidity providers earn a share of exchange trading fees on every swap through the pool. If accumulated trading fee revenue exceeds the dollar impact of impermanent loss, the LP position achieves positive net alpha over simply holding the tokens."
  - question: "Does impermanent loss mean I lost money in fiat terms?"
    answer: "Not necessarily. If Token A doubles in price and Token B is a stablecoin, both your HODL value and your LP position value will increase significantly in fiat terms. Impermanent loss simply means your LP position gained less than if you had held the tokens outside the pool."
  - question: "Does this calculator apply to Uniswap v3 concentrated liquidity?"
    answer: "This calculator specifically models standard 50/50 constant-product AMM pools across the full 0 to infinity price range (such as Uniswap v2, PancakeSwap, and SushiSwap). Concentrated liquidity pools (Uniswap v3) experience higher capital efficiency but significantly amplified impermanent loss within custom price bounds."
calculatorModule: "crypto/impermanent-loss-calculator.js"
publishDate: 2026-08-28
priority: "P0"
relatedTools:
  - "crypto/yield-farming-apy-calculator"
  - "crypto/crypto-profit-loss-calculator"
  - "crypto/dca-calculator"
  - "crypto/staking-rewards-calculator"
  - "crypto/mining-profitability-calculator"
  - "crypto/crypto-tax-calculator"
eeat:
  reviewedBy: "Fintools Find Quantitative DeFi & Automated Market Maker Advisory Board"
  methodology: "Calculations strictly utilize the foundational constant-product invariant formula (x · y = k) and standard relative price divergence factor formulas established in Uniswap v2 and academic AMM literature."
  dataSources:
    - "Uniswap v2 Core Whitepaper (Hayden Adams, Noah Zinsmeister, Dan Robinson)"
    - "Bancor Protocol: Automated Liquidity and Continuous Price Discovery"
    - "Vitalik Buterin: Improving Front Running Resistance & On-Path Market Makers"
    - "CFA Institute Research: Automated Market Makers and Decentralized Finance Liquidity"
advancedContent:
  definitionSnippet: "An Impermanent Loss Calculator evaluates the performance divergence between holding cryptocurrencies in a wallet versus depositing them into a constant-product Automated Market Maker (AMM) liquidity pool, factoring in swap fee yields and relative price movements."
  proTips:
    - "Target correlated pairs (such as ETH/BTC or stablecoin pairs like USDC/USDT) to maximize fee capture while minimizing relative price divergence."
    - "Before entering high-volatility pools, check that the historical volume-to-liquidity ratio generates a fee APR higher than your projected break-even rate."
    - "Remember that impermanent loss is non-directional: a 50% price drop produces the exact same -5.72% IL as a 100% price surge."
  commonMistakes:
    - "Confusing Impermanent Loss with Total Portfolio Loss: IL measures underperformance relative to holding, not absolute fiat loss."
    - "Ignoring Trading Fee Yields: Evaluating IL in isolation without accounting for swap fee compounding produces an incomplete picture of LP profitability."
    - "Applying 50/50 AMM Formulas to Concentrated Liquidity: Standard constant-product formulas underestimate IL for narrow-range Uniswap v3 positions."
  keyTakeaways:
    - "Impermanent loss is a mathematical certainty whenever the relative price ratio between two pooled assets changes."
    - "The IL formula is completely symmetric: a 2x price increase and a 0.5x price decrease both generate exactly -5.72% impermanent loss."
    - "Liquidity provision is profitable over HODL only when trading fee revenue exceeds the dollar magnitude of impermanent loss."
  assumptions:
    - "Models standard 50/50 constant-product Automated Market Makers (x · y = k) across infinite price ranges."
    - "Trading fee APR assumptions reflect steady, uncompounded annualized yields over the selected duration."
  limitations:
    - "Does not model custom price ranges for Uniswap v3 concentrated liquidity, multi-token weighted pools (Balancer), or stableswap bonding curves (Curve)."
    - "Does not account for gas costs incurred during deposit and withdrawal smart contract transactions."
  glossaryTerms:
    - term: "Constant-Product Invariant (x · y = k)"
      definition: "The core smart contract equation governing 50/50 AMMs, requiring the product of token reserves to remain constant during swaps."
    - term: "Relative Price Ratio (r)"
      definition: "The factor by which the price of Token A relative to Token B changes from entry to exit."
    - term: "HODL Benchmark"
      definition: "The portfolio valuation achieved by simply holding the deposited token quantities in a wallet without pooling."
    - term: "Net LP Advantage"
      definition: "The net fiat profit or loss of providing liquidity compared to the HODL benchmark, after adding all earned trading fees."
---

# Impermanent Loss Mechanics in Decentralized Finance (DeFi)

Automated Market Makers (AMMs) revolutionized decentralized finance by replacing traditional central limit order books with peer-to-contract liquidity pools. 

However, providing liquidity to a 50/50 constant-product pool (such as Uniswap v2, SushiSwap, or PancakeSwap) exposes depositors to **Impermanent Loss (IL)**—a fundamental economic dynamic that causes liquidity provider positions to underperform passive holding whenever asset prices diverge.

---

## 1. The Constant-Product AMM Mechanism ($x \cdot y = k$)

In a standard 50/50 liquidity pool, the smart contract enforces that the product of the reserve quantities of Token A ($x$) and Token B ($y$) must remain equal to a constant invariant $k$:

$$x \cdot y = k$$

When a liquidity provider deposits capital, they must provide equal fiat value of both tokens:

$$\text{Value}(x) = \text{Value}(y) = \frac{V_0}{2}$$

```
┌─────────────────────────────────────────────────────────────────┐
│                 50/50 Liquidity Pool Dynamics                   │
└────────────────┬───────────────────────────────┬────────────────┘
                 │                               │
                 ▼                               ▼
    ┌───────────────────────────┐   ┌───────────────────────────┐
    │   Token A Reserves (x)    │   │   Token B Reserves (y)    │
    ├───────────────────────────┤   ├───────────────────────────┤
    │ 5 ETH @ $2,000 = $10,000  │   │ 10,000 USDC @ $1 = $10,000│
    └───────────────────────────┘   └───────────────────────────┘
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                                 ▼
                     Constant Product: k = x · y
                     k = 5 × 10,000 = 50,000
```

---

## 2. Why Impermanent Loss Occurs: Arbitrage Mechanics

When the external market price of Token A rises (e.g., from \$2,000 to \$4,000), an arbitrage opportunity is created:

1. Arbitrageurs deposit Token B (USDC) into the pool and withdraw Token A (ETH) until the pool's internal price matches the external market price.
2. Under $x \cdot y = k$, the pool **automatically sells the appreciating asset (ETH) and accumulates more of the stable asset (USDC)**.
3. When the price of ETH reaches \$4,000, the pool's inventory rebalances to fewer ETH units and more USDC units.

Because the pool continuously sold ETH on the way up, the final liquidity position is worth less than if the provider had simply held the original 5 ETH in a private wallet.

---

## 3. The Impermanent Loss Mathematical Formulation

For any relative price ratio movement $r = \frac{P_{A1} / P_{B1}}{P_{A0} / P_{B0}}$, the standard impermanent loss equation is:

$$\text{IL Factor} = \frac{2 \sqrt{r}}{1 + r}$$

$$\text{Impermanent Loss } \% = \left(\frac{2 \sqrt{r}}{1 + r} - 1\right) \times 100$$

### Key Mathematical Properties:
- **Zero Loss at Parity:** When $r = 1.0$, $\text{IL} = 0.00\%$.
- **Complete Symmetry:** A 2x price increase ($r = 2.0$) and a 50% price decrease ($r = 0.5$) produce the **exact same -5.72% impermanent loss**.
- **Always Non-Positive:** $\text{IL} \le 0$ for all real positive values of $r$.

| Relative Price Change ($r$) | Impermanent Loss (%) | Relative Price Change ($r$) | Impermanent Loss (%) |
|---|---|---|---|
| **1.25x (+25%)** | -0.62% | **0.80x (-20%)** | -0.62% |
| **1.50x (+50%)** | -2.02% | **0.67x (-33%)** | -2.02% |
| **2.00x (+100%)** | -5.72% | **0.50x (-50%)** | -5.72% |
| **3.00x (+200%)** | -13.40% | **0.33x (-67%)** | -13.40% |
| **4.00x (+300%)** | -20.00% | **0.25x (-75%)** | -20.00% |
| **5.00x (+400%)** | -25.46% | **0.20x (-80%)** | -25.46% |

---

## 4. Pure Impermanent Loss vs Fee-Adjusted Net Alpha

Impermanent loss alone does not dictate whether liquidity provision is profitable. AMM liquidity providers collect a continuous pro-rata share of trading fees (typically 0.30% per trade on Uniswap v2):

$$\text{Net LP Advantage} = V_{\text{LP}} + \text{Trading Fees} - V_{\text{HODL}}$$

```
┌───────────────────────────────────────────────────────────────┐
│                      Net LP Profitability                     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│   Trading Fees Collected > Impermanent Loss ($)               │
│   ──► POSITIVE NET ALPHA (LP Beats HODL ✓)                    │
│                                                               │
│   Trading Fees Collected < Impermanent Loss ($)               │
│   ──► NEGATIVE NET ALPHA (HODL Beats LP ✗)                    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 5. Risk Management & Liquidity Provision Strategies

1. **Provide Liquidity to Correlated Pairs:** Assets that move together (e.g. ETH/BTC, SOL/ETH, or pegged stablecoins like USDC/USDT) maintain a relative ratio near $r = 1.0$, minimizing IL while capturing swap fees.
2. **Target High Volume-to-Liquidity Pools:** Pools with daily trading volume exceeding 30% to 50% of total pool TVL generate high fee APRs that readily absorb moderate price divergence.
3. **Calculate Break-Even APR Before Depositing:** Use our built-in break-even solver to determine the minimum fee APR needed over your intended holding horizon.
