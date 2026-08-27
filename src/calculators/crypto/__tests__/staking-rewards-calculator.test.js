import { describe, it, expect } from 'vitest';
import {
  calculateStakingRewards,
  calculateStakingYield,
  calculateCryptoStaking,
  calculateProofOfStakeRewards,
  convertAprToApy,
  convertApyToApr,
  COMPOUNDING_FREQUENCIES,
  FIAT_CURRENCIES,
} from '../staking-rewards-calculator.js';
import { STAKING_REWARDS_CONFIG } from '../../configs/staking-rewards-calculator.config.js';

describe('Staking Rewards Calculator Engine (Sprint 84 / Flagship #91)', () => {
  // 1. APR to APY Conversion Math
  it('converts APR to APY accurately with daily compounding', () => {
    // 5% APR daily compounding: (1 + 0.05/365)^365 - 1 = 5.1267%
    const apy = convertAprToApy(5, 365);
    expect(apy).toBeCloseTo(5.127, 2);
  });

  // 2. APY to APR Conversion Math
  it('converts APY to APR accurately with daily compounding', () => {
    // 5.1267% APY daily compounding -> 5.0% APR
    const apr = convertApyToApr(5.1267, 365);
    expect(apr).toBeCloseTo(5.0, 1);
  });

  // 3. Simple Staking (No Compounding)
  it('calculates simple non-compounding staking rewards correctly', () => {
    const res = calculateStakingRewards({
      stakedAmount: 100,
      rewardRatePct: 10,
      compoundingFrequency: 'NONE',
      durationMonths: 12,
      validatorCommissionPct: 0,
      fixedFeeTokens: 0,
      recurringMonthlyFeeTokens: 0,
    });

    expect(res.grossRewardTokens).toBe(10);
    expect(res.netRewardTokens).toBe(10);
    expect(res.netEndingBalanceTokens).toBe(110);
    expect(res.totalRoiPct).toBe(10.0);
  });

  // 4. Compounded Staking (Daily Compounding)
  it('calculates daily compounding staking rewards accurately', () => {
    const res = calculateStakingRewards({
      stakedAmount: 1000,
      rewardRatePct: 10,
      compoundingFrequency: 'DAILY',
      durationMonths: 12,
      validatorCommissionPct: 0,
    });

    // 1000 * (1 + 0.10/365)^365 - 1000 = 105.1558
    expect(res.grossRewardTokens).toBeCloseTo(105.16, 1);
    expect(res.netEndingBalanceTokens).toBeCloseTo(1105.16, 1);
    expect(res.totalRoiPct).toBeCloseTo(10.516, 2);
  });

  // 5. Monthly Compounding Frequency
  it('calculates monthly compounding accurately', () => {
    const res = calculateStakingRewards({
      stakedAmount: 1000,
      rewardRatePct: 12,
      compoundingFrequency: 'MONTHLY',
      durationMonths: 12,
      validatorCommissionPct: 0,
    });

    // 1000 * (1 + 0.01)^12 = 1126.825
    expect(res.grossRewardTokens).toBeCloseTo(126.83, 1);
  });

  // 6. Annual Compounding Frequency
  it('calculates annual compounding accurately', () => {
    const res = calculateStakingRewards({
      stakedAmount: 1000,
      rewardRatePct: 8,
      compoundingFrequency: 'ANNUALLY',
      durationMonths: 24, // 2 years
      validatorCommissionPct: 0,
    });

    // 1000 * (1.08)^2 - 1000 = 166.40
    expect(res.grossRewardTokens).toBeCloseTo(166.40, 1);
    expect(res.netEndingBalanceTokens).toBeCloseTo(1166.40, 1);
  });

  // 7. APY Mode Input
  it('handles APY input mode directly without compounding distortion', () => {
    const res = calculateStakingRewards({
      stakedAmount: 1000,
      rateMode: 'APY',
      rewardRatePct: 10,
      durationMonths: 12,
      validatorCommissionPct: 0,
    });

    expect(res.effectiveApy).toBe(10);
    expect(res.grossRewardTokens).toBeCloseTo(100.0, 0);
  });

  // 8. Validator Commission Deduction
  it('deducts validator commission percentage from gross rewards', () => {
    const res = calculateStakingRewards({
      stakedAmount: 100,
      rewardRatePct: 10,
      compoundingFrequency: 'NONE',
      durationMonths: 12,
      validatorCommissionPct: 10, // 10% of 10 tokens = 1 token
    });

    expect(res.grossRewardTokens).toBe(10);
    expect(res.commissionTokens).toBe(1);
    expect(res.netRewardTokens).toBe(9);
    expect(res.netEndingBalanceTokens).toBe(109);
    expect(res.totalRoiPct).toBe(9.0);
  });

  // 9. Fixed Staking Transaction Fees
  it('deducts fixed token transaction/gas fees from net rewards', () => {
    const res = calculateStakingRewards({
      stakedAmount: 100,
      rewardRatePct: 10,
      compoundingFrequency: 'NONE',
      durationMonths: 12,
      validatorCommissionPct: 0,
      fixedFeeTokens: 0.5,
    });

    expect(res.grossRewardTokens).toBe(10);
    expect(res.totalFeesTokens).toBe(0.5);
    expect(res.netRewardTokens).toBe(9.5);
  });

  // 10. Recurring Monthly Fees
  it('deducts recurring monthly maintenance fees over the staking duration', () => {
    const res = calculateStakingRewards({
      stakedAmount: 100,
      rewardRatePct: 10,
      compoundingFrequency: 'NONE',
      durationMonths: 10,
      validatorCommissionPct: 0,
      recurringMonthlyFeeTokens: 0.1, // 0.1 * 10 = 1.0 token
    });

    expect(res.totalFeesTokens).toBe(1.0);
    // Gross: 100 * 0.10 * (10/12) = 8.3333 -> Net: 7.3333
    expect(res.netRewardTokens).toBeCloseTo(7.333, 2);
  });

  // 11. Dual Fiat & Token Valuation
  it('computes exact fiat values based on token price', () => {
    const res = calculateStakingRewards({
      stakedAmount: 10, // 10 ETH
      tokenPrice: 3000, // $30,000 initial value
      rewardRatePct: 5,
      compoundingFrequency: 'NONE',
      durationMonths: 12,
      validatorCommissionPct: 0,
    });

    expect(res.initialFiatValue).toBe(30000);
    expect(res.grossRewardTokens).toBe(0.5);
    expect(res.netRewardTokens).toBe(0.5);
    expect(res.netRewardFiatValue).toBe(1500); // 0.5 * $3000
    expect(res.netEndingFiatValue).toBe(31500);
  });

  // 12. Token Price Sensitivity Scenarios
  it('computes bull (+50%), flat (0%), and bear (-30%) scenarios', () => {
    const res = calculateStakingRewards({
      stakedAmount: 10,
      tokenPrice: 100, // Initial: $1,000
      rewardRatePct: 10,
      compoundingFrequency: 'NONE',
      durationMonths: 12,
      validatorCommissionPct: 0,
    });

    // Net ending tokens: 11 tokens
    expect(res.priceScenarios.flat.endingFiat).toBe(1100);
    expect(res.priceScenarios.bull.endingFiat).toBe(1650); // 11 * $150
    expect(res.priceScenarios.bear.endingFiat).toBe(770); // 11 * $70
  });

  // 13. Downside Depreciation Buffer & Break-Even Token Price
  it('calculates the break-even token price and downside depreciation buffer', () => {
    const res = calculateStakingRewards({
      stakedAmount: 100,
      tokenPrice: 10, // $1,000 initial fiat
      rewardRatePct: 25, // Net ending: 125 tokens
      compoundingFrequency: 'NONE',
      durationMonths: 12,
      validatorCommissionPct: 0,
    });

    // P_be = 1000 / 125 = $8.00 per token
    expect(res.breakEvenTokenPrice).toBe(8.00);
    expect(res.breakEvenBufferPct).toBe(20.0); // 20% price drop buffer
  });

  // 14. Periodic Reward Breakdown (Daily, Monthly, Annual)
  it('calculates consistent daily, monthly, and annual token rewards', () => {
    const res = calculateStakingRewards({
      stakedAmount: 365,
      rewardRatePct: 10,
      compoundingFrequency: 'NONE',
      durationMonths: 12,
      validatorCommissionPct: 0,
    });

    // 36.5 tokens/year -> 0.1 tokens/day
    expect(res.dailyRewardTokens).toBeCloseTo(0.1, 4);
    expect(res.annualRewardTokens).toBeCloseTo(36.5, 2);
  });

  // 15. Short Staking Period (1 Month)
  it('handles short 1-month staking periods accurately', () => {
    const res = calculateStakingRewards({
      stakedAmount: 120,
      rewardRatePct: 10,
      compoundingFrequency: 'NONE',
      durationMonths: 1, // 1/12 year
      validatorCommissionPct: 0,
    });

    expect(res.netRewardTokens).toBe(1.0);
  });

  // 16. Long Staking Period (5 Years / 60 Months)
  it('handles multi-year staking periods with compounding growth', () => {
    const res = calculateStakingRewards({
      stakedAmount: 100,
      rewardRatePct: 10,
      compoundingFrequency: 'ANNUALLY',
      durationMonths: 60, // 5 years
      validatorCommissionPct: 0,
    });

    // 100 * (1.10)^5 = 161.051
    expect(res.netEndingBalanceTokens).toBeCloseTo(161.05, 1);
    expect(res.totalRoiPct).toBeCloseTo(61.05, 1);
  });

  // 17. Zero Principal Protection
  it('safely handles zero staked amount', () => {
    const res = calculateStakingRewards({
      stakedAmount: 0,
      tokenPrice: 100,
    });

    expect(res.stakedAmount).toBe(0);
    expect(res.netRewardTokens).toBe(0);
    expect(res.totalRoiPct).toBe(0);
  });

  // 18. Zero Reward Rate (0% APR)
  it('safely handles zero reward rate without error', () => {
    const res = calculateStakingRewards({
      stakedAmount: 100,
      rewardRatePct: 0,
    });

    expect(res.netRewardTokens).toBe(0);
    expect(res.netEndingBalanceTokens).toBe(100);
  });

  // 19. Negative Input Sanitization
  it('sanitizes negative inputs to zero', () => {
    const res = calculateStakingRewards({
      stakedAmount: -50,
      rewardRatePct: -5,
      tokenPrice: -100,
      validatorCommissionPct: -2,
    });

    expect(res.stakedAmount).toBe(0);
    expect(res.rewardRatePct).toBe(0);
    expect(res.tokenPrice).toBe(0);
    expect(res.validatorCommissionPct).toBe(0);
  });

  // 20. Extreme 100% Validator Commission
  it('handles 100% validator commission safely (all rewards taken by validator)', () => {
    const res = calculateStakingRewards({
      stakedAmount: 100,
      rewardRatePct: 10,
      compoundingFrequency: 'NONE',
      durationMonths: 12,
      validatorCommissionPct: 100,
    });

    expect(res.grossRewardTokens).toBe(10);
    expect(res.commissionTokens).toBe(10);
    expect(res.netRewardTokens).toBe(0);
    expect(res.netEndingBalanceTokens).toBe(100);
  });

  // 21. High Staking APR (e.g. 50% DeFi / Staking Yield)
  it('computes high staking APR without overflow', () => {
    const res = calculateStakingRewards({
      stakedAmount: 1000,
      rewardRatePct: 50,
      compoundingFrequency: 'DAILY',
      durationMonths: 12,
      validatorCommissionPct: 0,
    });

    // 1000 * e^0.5 approx 1648.72
    expect(res.grossEndingBalanceTokens).toBeCloseTo(1648.16, 0);
  });

  // 22. Unbonding Period Disclosure Recommendation
  it('triggers unbonding period recommendation when unbondingDays > 0', () => {
    const res = calculateStakingRewards({
      unbondingDays: 21,
    });

    const rec = res.recommendations.find(r => r.title.includes('21-Day Unbonding Lock-Up Period'));
    expect(rec).toBeDefined();
    expect(rec?.type).toBe('warning');
  });

  // 23. High Commission Warning Recommendation
  it('triggers warning recommendation when validator commission > 10%', () => {
    const res = calculateStakingRewards({
      validatorCommissionPct: 15,
    });

    const rec = res.recommendations.find(r => r.title.includes('High Validator Commission'));
    expect(rec).toBeDefined();
    expect(rec?.type).toBe('warning');
  });

  // 24. Compounding Opportunity Recommendation
  it('recommends compounding when staking without compounding for >= 12 months', () => {
    const res = calculateStakingRewards({
      stakedAmount: 1000,
      rewardRatePct: 10,
      compoundingFrequency: 'NONE',
      durationMonths: 12,
    });

    const rec = res.recommendations.find(r => r.title.includes('Compounding Opportunity'));
    expect(rec).toBeDefined();
  });

  // 25. Always Includes Staking Tax Disclosure
  it('always includes staking tax disclosure in recommendations', () => {
    const res = calculateStakingRewards();
    const rec = res.recommendations.find(r => r.title.includes('Staking Tax & Market Volatility Disclosure'));
    expect(rec).toBeDefined();
  });

  // 26. Multi-Currency: INR (₹)
  it('supports INR quote currency and formatting', () => {
    const res = calculateStakingRewards({
      currency: 'INR',
      stakedAmount: 1,
      tokenPrice: 250000,
    });

    expect(res.currency).toBe('INR');
    expect(res.symbol).toBe('₹');
    expect(res.decimals).toBe(2);
  });

  // 27. Multi-Currency: EUR (€)
  it('supports EUR currency symbol', () => {
    const res = calculateStakingRewards({ currency: 'EUR' });
    expect(res.currency).toBe('EUR');
    expect(res.symbol).toBe('€');
  });

  // 28. Multi-Currency: GBP (£)
  it('supports GBP currency symbol', () => {
    const res = calculateStakingRewards({ currency: 'GBP' });
    expect(res.currency).toBe('GBP');
    expect(res.symbol).toBe('£');
  });

  // 29. Multi-Currency: JPY (¥) with 0 decimals
  it('supports JPY currency with 0 decimal places', () => {
    const res = calculateStakingRewards({ currency: 'JPY' });
    expect(res.currency).toBe('JPY');
    expect(res.symbol).toBe('¥');
    expect(res.decimals).toBe(0);
  });

  // 30. Invalid Currency Fallback to USD
  it('falls back to USD when unrecognized currency is passed', () => {
    const res = calculateStakingRewards({ currency: 'INVALID_CURR' });
    expect(res.symbol).toBe('$');
  });

  // 31. Preset Validation: eth_validator_pool
  it('validates preset: Ethereum Staking Pool', () => {
    const p = STAKING_REWARDS_CONFIG.presets.find(x => x.id === 'eth_validator_pool');
    expect(p).toBeDefined();
    const res = calculateStakingRewards(p);
    expect(res.stakedAmount).toBe(32);
    expect(res.assetName).toBe('Ethereum (ETH)');
    expect(res.netRewardTokens).toBeGreaterThan(1.1);
  });

  // 32. Preset Validation: sol_native_stake
  it('validates preset: Solana Native Validator Delegation', () => {
    const p = STAKING_REWARDS_CONFIG.presets.find(x => x.id === 'sol_native_stake');
    expect(p).toBeDefined();
    const res = calculateStakingRewards(p);
    expect(res.stakedAmount).toBe(250);
    expect(res.unbondingDays).toBe(3);
  });

  // 33. Preset Validation: ada_pool_stake
  it('validates preset: Cardano Non-Custodial Stake Pool', () => {
    const p = STAKING_REWARDS_CONFIG.presets.find(x => x.id === 'ada_pool_stake');
    expect(p).toBeDefined();
    const res = calculateStakingRewards(p);
    expect(res.stakedAmount).toBe(15000);
    expect(res.fixedFeeTokens).toBe(2.0);
  });

  // 34. Preset Validation: dot_npos_stake
  it('validates preset: Polkadot Nominated PoS', () => {
    const p = STAKING_REWARDS_CONFIG.presets.find(x => x.id === 'dot_npos_stake');
    expect(p).toBeDefined();
    const res = calculateStakingRewards(p);
    expect(res.rewardRatePct).toBe(11.5);
    expect(res.unbondingDays).toBe(28);
  });

  // 35. Preset Validation: atom_cosmos_stake
  it('validates preset: Cosmos Hub Staking', () => {
    const p = STAKING_REWARDS_CONFIG.presets.find(x => x.id === 'atom_cosmos_stake');
    expect(p).toBeDefined();
    const res = calculateStakingRewards(p);
    expect(res.rewardRatePct).toBe(14.0);
    expect(res.unbondingDays).toBe(21);
  });

  // 36. Preset Validation: usdc_stable_yield
  it('validates preset: Stablecoin Yield Vault', () => {
    const p = STAKING_REWARDS_CONFIG.presets.find(x => x.id === 'usdc_stable_yield');
    expect(p).toBeDefined();
    const res = calculateStakingRewards(p);
    expect(res.tokenPrice).toBe(1.00);
    expect(res.netRewardFiatValue).toBeGreaterThan(500);
  });

  // 37. Constants Validation: COMPOUNDING_FREQUENCIES
  it('exposes COMPOUNDING_FREQUENCIES map', () => {
    expect(COMPOUNDING_FREQUENCIES.NONE.periodsPerYear).toBe(0);
    expect(COMPOUNDING_FREQUENCIES.DAILY.periodsPerYear).toBe(365);
    expect(COMPOUNDING_FREQUENCIES.WEEKLY.periodsPerYear).toBe(52);
    expect(COMPOUNDING_FREQUENCIES.MONTHLY.periodsPerYear).toBe(12);
  });

  // 38. Constants Validation: FIAT_CURRENCIES
  it('exposes FIAT_CURRENCIES mapping', () => {
    expect(FIAT_CURRENCIES.USD).toBeDefined();
    expect(FIAT_CURRENCIES.EUR).toBeDefined();
    expect(FIAT_CURRENCIES.INR).toBeDefined();
  });

  // 39. Alias calculateStakingYield
  it('exports alias calculateStakingYield correctly', () => {
    const res = calculateStakingYield({ stakedAmount: 10, rewardRatePct: 10, durationMonths: 12, compoundingFrequency: 'NONE', validatorCommissionPct: 0 });
    expect(res.netRewardTokens).toBe(1.0);
  });

  // 40. Alias calculateCryptoStaking
  it('exports alias calculateCryptoStaking correctly', () => {
    const res = calculateCryptoStaking({ stakedAmount: 20, rewardRatePct: 5, durationMonths: 12, compoundingFrequency: 'NONE', validatorCommissionPct: 0 });
    expect(res.netRewardTokens).toBe(1.0);
  });

  // 41. Alias calculateProofOfStakeRewards
  it('exports alias calculateProofOfStakeRewards correctly', () => {
    const res = calculateProofOfStakeRewards({ stakedAmount: 50, rewardRatePct: 4, durationMonths: 12, compoundingFrequency: 'NONE', validatorCommissionPct: 0 });
    expect(res.netRewardTokens).toBe(2.0);
  });

  // 42. Invalid Compounding Frequency Fallback
  it('falls back to DAILY compounding when invalid compoundingFrequency is passed', () => {
    const res = calculateStakingRewards({
      compoundingFrequency: 'INVALID_FREQ',
    });
    expect(res.periodsPerYear).toBe(365);
  });

  // 43. Fees Exceeding Gross Rewards Protection
  it('caps net rewards at 0 if fees exceed gross rewards', () => {
    const res = calculateStakingRewards({
      stakedAmount: 1,
      rewardRatePct: 1, // 0.01 token gross
      fixedFeeTokens: 0.05, // 0.05 fee > 0.01 reward
    });

    expect(res.netRewardTokens).toBe(0);
    expect(res.netEndingBalanceTokens).toBe(1);
  });

  // 44. Configuration Metadata Validation
  it('validates configuration object integrity and preset length', () => {
    expect(STAKING_REWARDS_CONFIG.id).toBe('staking-rewards-calculator');
    expect(STAKING_REWARDS_CONFIG.category).toBe('crypto');
    expect(STAKING_REWARDS_CONFIG.presets.length).toBe(6);
  });

  // 45. Complete Lifecycle Balance Sheet Simulation
  it('simulates complete multi-variable staking lifecycle', () => {
    const res = calculateStakingRewards({
      stakedAmount: 32,
      tokenPrice: 3200,
      rewardRatePct: 4.2,
      compoundingFrequency: 'DAILY',
      durationMonths: 18, // 1.5 years
      validatorCommissionPct: 5.0,
      fixedFeeTokens: 0.01,
      currency: 'USD',
      assetName: 'Ethereum (ETH)',
    });

    expect(res.initialFiatValue).toBe(102400);
    expect(res.grossRewardTokens).toBeGreaterThan(2.0);
    expect(res.commissionTokens).toBeGreaterThan(0.1);
    expect(res.netRewardTokens).toBeGreaterThan(1.9);
    expect(res.netEndingFiatValue).toBeGreaterThan(108000);
    expect(res.breakEvenTokenPrice).toBeLessThan(3200);
    expect(res.heroVerdict).toContain('Staking Yield');
  });
});
