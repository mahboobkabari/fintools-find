# Flagship #91: Staking Rewards Calculator — Implementation & Verification Report

**Sprint**: 84  
**Date**: August 27, 2026  
**Status**: ✅ COMPLETED & 100% VERIFIED  
**Flagship Progress**: 91 / 194 Completed (103 Remaining)

---

## 1. Executive Summary

Flagship Calculator #91 (**Staking Rewards Calculator**) has been engineered, validated against Proof-of-Stake (PoS) discrete compounding yield dynamics and validator commission structures, tested with 45 unit tests, and integrated into the static production build of Fintools Find.

- **Calculator Name**: Staking Rewards Calculator
- **Flagship Number**: #91
- **URL Slug**: `/tools/crypto/staking-rewards-calculator/`
- **Category**: Crypto Calculators (`crypto`)
- **Engine**: Pure JavaScript financial & PoS discrete compounding engine (`src/calculators/crypto/staking-rewards-calculator.js`)
- **Unit Tests**: 45/45 dedicated tests passing (Total Vitest suite: 2,539/2,539 tests passing across 103 test suites)
- **Astro Diagnostic Check**: 0 errors, 0 warnings, 70 hints (701 files checked)
- **Production Build**: 149 static pages generated including `/tools/crypto/staking-rewards-calculator/index.html`

---

## 2. Mathematical & Financial Methodology

### A. APR vs. APY Bidirectional Normalization
1. **APR to APY Conversion**:
   $$\text{APY} = \left(1 + \frac{\text{APR} / 100}{m}\right)^m - 1$$
2. **APY to APR Conversion**:
   $$\text{APR} = m \times \left((1 + \text{APY} / 100)^{1/m} - 1\right) \times 100$$
   Where $m$ is the compounding frequency (365 for daily, 52 for weekly, 12 for monthly, 4 for quarterly, 2 for semi-annually, 1 for annually, 0 for simple non-compounding).

### B. Gross Protocol Emission & Staking Yield
1. **Simple Non-Compounding Model ($m = 0$)**:
   $$\text{Gross Rewards}_{\text{tokens}} = P \times \left(\frac{\text{APR}}{100}\right) \times t$$
   $$\text{Gross Ending Balance}_{\text{tokens}} = P + \text{Gross Rewards}_{\text{tokens}}$$
2. **Discrete Compounded Model ($m > 0$)**:
   $$\text{Gross Ending Balance}_{\text{tokens}} = P \times \left(1 + \frac{\text{APR} / 100}{m}\right)^{m \times t}$$
   $$\text{Gross Rewards}_{\text{tokens}} = \text{Gross Ending Balance}_{\text{tokens}} - P$$

### C. Validator Commission & Staking Fee Deductions
1. **Validator Commission**:
   $$\text{Commission}_{\text{tokens}} = \text{Gross Rewards}_{\text{tokens}} \times \left(\frac{\text{Commission \%}}{100}\right)$$
2. **Net Staking Rewards**:
   $$\text{Total Fees}_{\text{tokens}} = \text{Commission}_{\text{tokens}} + \text{Fee}_{\text{fixed}} + (\text{Fee}_{\text{monthly, rec}} \times M)$$
   $$\text{Net Rewards}_{\text{tokens}} = \max\left(0, \text{Gross Rewards}_{\text{tokens}} - \text{Total Fees}_{\text{tokens}}\right)$$
   $$\text{Net Ending Balance}_{\text{tokens}} = P + \text{Net Rewards}_{\text{tokens}}$$

### D. Return on Investment (ROI %) & Periodic Breakdown
1. **Total Net Yield %**:
   $$\text{ROI \%} = \left(\frac{\text{Net Rewards}_{\text{tokens}}}{P}\right) \times 100$$
2. **Periodic Payout Schedules**:
   $$\text{Daily Rewards}_{\text{tokens}} = \frac{\text{Net Rewards}_{\text{tokens}}}{t \times 365}$$
   $$\text{Monthly Rewards}_{\text{tokens}} = \text{Daily Rewards}_{\text{tokens}} \times \left(\frac{365}{12}\right)$$
   $$\text{Annual Rewards}_{\text{tokens}} = \text{Daily Rewards}_{\text{tokens}} \times 365$$

### E. Dual Fiat Valuation & Break-Even Token Price
1. **Fiat Value of Net Rewards**:
   $$\text{Net Reward Fiat Value} = \text{Net Rewards}_{\text{tokens}} \times P_{\text{token}}$$
2. **Break-Even Depreciation Buffer Solver**:
   Solves for the minimum token price $P_{\text{token, break-even}}$ required at exit to prevent nominal fiat loss:
   $$P_{\text{token, break-even}} = \frac{\text{Initial Fiat Staked Capital}}{\text{Net Ending Balance}_{\text{tokens}}} = \frac{P \times P_{\text{token, entry}}}{P + \text{Net Rewards}_{\text{tokens}}}$$
   $$\text{Downside Buffer \%} = \left(\frac{P_{\text{token, entry}} - P_{\text{token, break-even}}}{P_{\text{token, entry}}}\right) \times 100$$

---

## 3. Data & Market Assumptions

- **Zero Fabricated Live Data**: The calculator does not connect to unverified third-party validator APIs or fabricate live staking yields. All calculations are transparently driven by user-entered inputs and explicit structural reference baselines.
- **Representative Protocol Archetypes**: Includes 6 realistic structural scenarios as of Q3 2026:
  1. *Ethereum (ETH) Staking Pool*: 32 ETH @ $3,000, 3.8% APR, Daily Compounding, 5% pool fee, 0-day liquid unbonding
  2. *Solana (SOL) Native Validator Delegation*: 250 SOL @ $150, 6.8% APY (Epoch compounding ~2.5 days), 5% validator commission, 3-day unbonding
  3. *Cardano (ADA) Non-Custodial Stake Pool*: 15,000 ADA @ $0.45, 3.2% APR (Epoch compounding 5 days), 2% validator margin, 0-day unbonding
  4. *Polkadot (DOT) Nominated PoS*: 500 DOT @ $7.50, 11.5% APR (Daily era payout), 3% validator commission, 28-day unbonding lockup
  5. *Cosmos (ATOM) Hub Staking*: 300 ATOM @ $8.00, 14.0% APR (Daily compounding), 5% commission, 21-day unbonding lockup
  6. *Stablecoin Yield Vault (USDC/USDT)*: 10,000 USDC @ $1.00, 5.2% APY, Daily compounding, 0% commission, instant liquidity
- **Disclosures**: Full disclosure reminding users that staking rewards are estimates subject to token price volatility, unbonding lock-up liquidity constraints, slashing penalties, and localized taxation rules.

---

## 4. Implemented Components & Files

| Component / Artifact | File Path | Status |
|---|---|---|
| **Calculation Engine** | `src/calculators/crypto/staking-rewards-calculator.js` | ✅ Created (275 lines) |
| **Config & Presets** | `src/calculators/configs/staking-rewards-calculator.config.js` | ✅ Created (110 lines) |
| **Vitest Test Suite** | `src/calculators/crypto/__tests__/staking-rewards-calculator.test.js` | ✅ Created (45/45 passed) |
| **Preact Island Widget** | `src/components/calculators/primitives/StakingRewardsFlagshipWidget.jsx` | ✅ Created (450 lines) |
| **Widget Wrapper** | `src/components/calculators/StakingRewardsCalculatorWidget.jsx` | ✅ Created |
| **Astro Flagship Layout** | `src/components/content/StakingRewardsFlagshipLayout.astro` | ✅ Created (160 lines) |
| **EEAT Markdown Article** | `src/content/tools/staking-rewards-calculator.md` | ✅ Created (185 lines) |
| **Dynamic Routing** | `src/pages/tools/[category]/[tool]/index.astro` | ✅ Updated |
| **Cross-Links** | `src/content/tools/crypto-profit-loss-calculator.md`, `src/content/tools/mining-profitability-calculator.md` | ✅ Updated |

---

## 5. Verification & Quality Gates

### A. Dedicated Unit Tests
```bash
Test Files  1 passed (1)
Tests       45 passed (45)
Duration    48ms
```

### B. Full Vitest Suite
```bash
Test Files  103 passed (103)
Tests       2539 passed (2539)
Duration    9.12s
```

### C. Astro Diagnostics Check
```bash
Result (701 files): 
- 0 errors
- 0 warnings
- 70 hints
```

### D. Static Production Build
```bash
149 page(s) built in 20.36s
- /tools/crypto/staking-rewards-calculator/index.html (15ms)
```

---

## 6. Project Roadmap Progress

- **Completed**: 91 / 194 Flagship Calculators
- **Remaining**: 103 Flagship Calculators
- **Next Sequentially**: Flagship Calculator #92 (`DCA Calculator` / `Dollar Cost Averaging Calculator`, line 163 in `tool_slugs.csv`)
