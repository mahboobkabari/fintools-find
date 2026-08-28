import { describe, it, expect } from 'vitest';
import {
  convertGweiToNative,
  convertNativeToGwei,
  calculateEffectiveGasPriceGwei,
  calculateGasBudgetCapacity,
  calculateGasFee,
  sanitizeNumber,
  GWEI_PER_NATIVE_TOKEN,
} from '../gas-fee-calculator.js';

describe('Gas Fee Engine (Flagship #96)', () => {
  // 1. Gwei -> ETH: 1 Gwei = 1e-9 ETH
  it('1. converts 1 Gwei to 0.000000001 ETH', () => {
    expect(convertGweiToNative(1)).toBe(0.000000001);
  });

  // 2. Gwei -> ETH: 1,000,000,000 Gwei = 1 ETH
  it('2. converts 1,000,000,000 Gwei to exactly 1 ETH', () => {
    expect(convertGweiToNative(1_000_000_000)).toBe(1.0);
  });

  // 3. Gwei -> ETH: 30 Gwei = 0.000000030 ETH
  it('3. converts 30 Gwei to 0.00000003 ETH', () => {
    expect(convertGweiToNative(30)).toBe(0.00000003);
  });

  // 4. ETH -> Gwei: 1 ETH = 1,000,000,000 Gwei
  it('4. converts 1 ETH to 1,000,000,000 Gwei', () => {
    expect(convertNativeToGwei(1.0)).toBe(1_000_000_000);
  });

  // 5. ETH -> Gwei: 0.005 ETH = 5,000,000 Gwei
  it('5. converts 0.005 ETH to 5,000,000 Gwei', () => {
    expect(convertNativeToGwei(0.005)).toBe(5_000_000);
  });

  // 6. EIP-1559 Effective Gas Price: Unconstrained (Base 20 + Tip 2 = 22 Gwei)
  it('6. calculates effective gas price as Base Fee + Priority Fee when under Max Fee', () => {
    const effective = calculateEffectiveGasPriceGwei(20, 2, 35);
    expect(effective).toBe(22);
  });

  // 7. EIP-1559 Effective Gas Price: Constrained by Max Fee (Base 30 + Tip 10 vs Max 35 -> 35 Gwei)
  it('7. caps effective gas price at Max Fee when Base Fee + Tip exceeds Max Fee', () => {
    const effective = calculateEffectiveGasPriceGwei(30, 10, 35);
    expect(effective).toBe(35);
  });

  // 8. EIP-1559 Zero Priority Fee (Base 20 + Tip 0 = 20 Gwei)
  it('8. handles zero priority tip fee accurately', () => {
    const effective = calculateEffectiveGasPriceGwei(20, 0, 30);
    expect(effective).toBe(20);
  });

  // 9. Simple ETH Transfer: 21,000 gas @ 20 Gwei = 0.00042 ETH ($1.05 @ $2,500/ETH)
  it('9. calculates exact cost for standard 21,000 gas ETH transfer', () => {
    const res = calculateGasFee({
      gasLimit: 21000,
      gasUsed: 21000,
      baseFeeGwei: 18,
      priorityFeeGwei: 2,
      maxFeeGwei: 30,
      nativeTokenPrice: 2500,
    });
    // 21,000 * 20 Gwei = 420,000 Gwei = 0.00042 ETH
    expect(res.singleTransaction.actualGasCostNative).toBe(0.00042);
    // 0.00042 * 2500 = $1.05
    expect(res.singleTransaction.actualGasCostFiat).toBe(1.05);
  });

  // 10. Base Fee portion vs Priority Fee portion
  it('10. decomposes total cost into burned base fee and validator tip portions', () => {
    const res = calculateGasFee({
      gasLimit: 21000,
      gasUsed: 21000,
      baseFeeGwei: 18,
      priorityFeeGwei: 2,
      maxFeeGwei: 30,
      nativeTokenPrice: 2500,
    });
    // Base: 21,000 * 18 Gwei = 0.000378 ETH ($0.945 -> $0.95)
    expect(res.singleTransaction.baseFeeCostNative).toBe(0.000378);
    // Tip: 21,000 * 2 Gwei = 0.000042 ETH ($0.105 -> $0.11)
    expect(res.singleTransaction.priorityFeeCostNative).toBe(0.000042);
    // Sum of native parts matches total
    expect(res.singleTransaction.baseFeeCostNative + res.singleTransaction.priorityFeeCostNative).toBeCloseTo(res.singleTransaction.actualGasCostNative, 8);
  });

  // 11. Gas Limit vs Actual Gas Used (ERC-20: 65k Limit vs 45k Used)
  it('11. charges only for actual gas consumed, not full gas limit', () => {
    const res = calculateGasFee({
      gasLimit: 65000,
      gasUsed: 45000,
      baseFeeGwei: 20,
      priorityFeeGwei: 2,
      maxFeeGwei: 30,
      nativeTokenPrice: 2500,
    });
    // Actual: 45,000 * 22 Gwei = 0.00099 ETH ($2.475 -> $2.48)
    expect(res.singleTransaction.actualGasCostNative).toBe(0.00099);
    // Max potential: 65,000 * 30 Gwei = 0.00195 ETH ($4.875 -> $4.88)
    expect(res.singleTransaction.maxPotentialCostNative).toBe(0.00195);
    // Unused gas units: 65,000 - 45,000 = 20,000
    expect(res.meta.unusedGasUnits).toBe(20000);
  });

  // 12. Unused Gas Refund quantification
  it('12. calculates the unused gas refund between max potential cost and actual cost', () => {
    const res = calculateGasFee({
      gasLimit: 65000,
      gasUsed: 45000,
      baseFeeGwei: 20,
      priorityFeeGwei: 2,
      maxFeeGwei: 30,
      nativeTokenPrice: 2500,
    });
    // Max potential native ($4.875) - actual native ($2.475) = 0.00096 ETH ($2.40)
    expect(res.singleTransaction.unusedGasRefundNative).toBe(0.00096);
  });

  // 13. Legacy Gas Price Mode
  it('13. calculates gas costs accurately under Legacy Gas Price mode', () => {
    const res = calculateGasFee({
      feeModel: 'LEGACY',
      gasLimit: 21000,
      gasUsed: 21000,
      legacyGasPriceGwei: 50,
      nativeTokenPrice: 2000,
    });
    // 21,000 * 50 Gwei = 0.00105 ETH ($2.10)
    expect(res.singleTransaction.actualGasCostNative).toBe(0.00105);
    expect(res.singleTransaction.actualGasCostFiat).toBe(2.1);
  });

  // 14. Batch Transaction Modeling (10 transactions)
  it('14. scales costs linearly for batch transactions (10 txs)', () => {
    const res = calculateGasFee({
      gasLimit: 21000,
      gasUsed: 21000,
      baseFeeGwei: 20,
      priorityFeeGwei: 2,
      transactionCount: 10,
      nativeTokenPrice: 2500,
    });
    // Single = $1.155 -> 10 txs = $11.55
    expect(res.batch.totalBatchFiatCost).toBeCloseTo(res.singleTransaction.actualGasCostFiat * 10, 1);
    expect(res.batch.totalBatchNativeCost).toBeCloseTo(res.singleTransaction.actualGasCostNative * 10, 7);
  });

  // 15. Gas Cost Ratio (% of Transaction Value)
  it('15. computes gas fee as a percentage of transaction value', () => {
    const res = calculateGasFee({
      gasLimit: 21000,
      gasUsed: 21000,
      baseFeeGwei: 20,
      priorityFeeGwei: 0,
      nativeTokenPrice: 2500, // $1.05 gas fee
      transactionValueFiat: 105, // $105 transfer
    });
    // $1.05 / $105 = 1.00%
    expect(res.economics.gasCostRatioPct).toBe(1.0);
  });

  // 16. Break-Even Transaction Value
  it('16. solves for break-even transaction value based on maximum acceptable cost percentage', () => {
    const res = calculateGasFee({
      gasLimit: 21000,
      gasUsed: 21000,
      baseFeeGwei: 20,
      priorityFeeGwei: 0,
      nativeTokenPrice: 2500, // $1.05 fee
      maxAcceptableCostPct: 1.0, // 1% max acceptable
    });
    // $1.05 / 0.01 = $105.00
    expect(res.economics.breakEvenTxValueFiat).toBe(105);
  });

  // 17. Gas Budget Capacity Planner (Affordable Txs)
  it('17. calculates maximum affordable transactions within a fixed fiat gas budget', () => {
    const budget = calculateGasBudgetCapacity(100, 4.5);
    // 100 / 4.5 = 22.22 -> 22 transactions
    expect(budget.maxTransactions).toBe(22);
    // 22 * 4.5 = $99.00 spent
    expect(budget.totalSpentFiat).toBe(99);
    // $1.00 remaining
    expect(budget.remainingBudgetFiat).toBe(1.0);
    // 99% utilization
    expect(budget.budgetUtilizationPct).toBe(99);
  });

  // 18. Gas Budget Capacity Planner: Zero budget
  it('18. handles zero gas budget gracefully', () => {
    const budget = calculateGasBudgetCapacity(0, 5);
    expect(budget.maxTransactions).toBe(0);
    expect(budget.remainingBudgetFiat).toBe(0);
    expect(budget.budgetUtilizationPct).toBe(0);
  });

  // 19. Gas Budget Capacity Planner: Zero cost per tx
  it('19. handles zero cost per transaction gracefully without division by zero', () => {
    const budget = calculateGasBudgetCapacity(100, 0);
    expect(budget.maxTransactions).toBe(0);
    expect(budget.remainingBudgetFiat).toBe(100);
  });

  // 20. Uniswap Swap Scenario (130k gas @ 27.5 Gwei)
  it('20. accurately models a Uniswap v3 token swap transaction cost', () => {
    const res = calculateGasFee({
      gasLimit: 180000,
      gasUsed: 130000,
      baseFeeGwei: 25,
      priorityFeeGwei: 2.5,
      maxFeeGwei: 45,
      nativeTokenPrice: 3000,
    });
    // 130,000 * 27.5 Gwei = 3,575,000 Gwei = 0.003575 ETH
    expect(res.singleTransaction.actualGasCostNative).toBe(0.003575);
    // 0.003575 * 3000 = $10.725 (~$10.73)
    expect(res.singleTransaction.actualGasCostFiat).toBeCloseTo(10.73, 1);
  });

  // 21. NFT Mint Scenario (150k gas @ 38 Gwei)
  it('21. accurately models an NFT mint transaction cost', () => {
    const res = calculateGasFee({
      gasLimit: 200000,
      gasUsed: 150000,
      baseFeeGwei: 35,
      priorityFeeGwei: 3.0,
      maxFeeGwei: 60,
      nativeTokenPrice: 2500,
    });
    // 150,000 * 38 Gwei = 5,700,000 Gwei = 0.0057 ETH
    expect(res.singleTransaction.actualGasCostNative).toBe(0.0057);
    // 0.0057 * 2500 = $14.25
    expect(res.singleTransaction.actualGasCostFiat).toBe(14.25);
  });

  // 22. DeFi Interaction Scenario (260k gas @ 33 Gwei)
  it('22. accurately models complex DeFi contract interaction cost', () => {
    const res = calculateGasFee({
      gasLimit: 350000,
      gasUsed: 260000,
      baseFeeGwei: 30,
      priorityFeeGwei: 3.0,
      maxFeeGwei: 55,
      nativeTokenPrice: 2500,
    });
    // 260,000 * 33 Gwei = 8,580,000 Gwei = 0.00858 ETH
    expect(res.singleTransaction.actualGasCostNative).toBe(0.00858);
    // 0.00858 * 2500 = $21.45
    expect(res.singleTransaction.actualGasCostFiat).toBe(21.45);
  });

  // 23. High Congestion Spike Scenario (180k gas @ 135 Gwei)
  it('23. models a high congestion fee spike scenario accurately', () => {
    const res = calculateGasFee({
      gasLimit: 250000,
      gasUsed: 180000,
      baseFeeGwei: 120,
      priorityFeeGwei: 15.0,
      maxFeeGwei: 200,
      nativeTokenPrice: 2500,
    });
    // 180,000 * 135 Gwei = 24,300,000 Gwei = 0.0243 ETH ($60.75)
    expect(res.singleTransaction.actualGasCostNative).toBe(0.0243);
    expect(res.singleTransaction.actualGasCostFiat).toBe(60.75);
  });

  // 24. Zero Base Fee (L2 / Devnet scenario)
  it('24. handles zero base fee properly', () => {
    const res = calculateGasFee({
      baseFeeGwei: 0,
      priorityFeeGwei: 1.0,
      maxFeeGwei: 5.0,
    });
    expect(res.meta.effectiveBaseFeeGwei).toBe(0);
    expect(res.meta.effectivePriorityFeeGwei).toBe(1.0);
    expect(res.meta.effectiveGasPriceGwei).toBe(1.0);
  });

  // 25. Extremely high token price ($10,000,000 ETH)
  it('25. handles ultra-high native token prices without floating point overflow', () => {
    const res = calculateGasFee({
      gasUsed: 21000,
      baseFeeGwei: 20,
      priorityFeeGwei: 0,
      nativeTokenPrice: 10000000,
    });
    // 0.00042 ETH * $10,000,000 = $4,200
    expect(res.singleTransaction.actualGasCostFiat).toBe(4200);
  });

  // 26. Micro-value base fees (0.001 Gwei on L2s like Arbitrum/Base)
  it('26. calculates sub-Gwei micro gas fees accurately', () => {
    const res = calculateGasFee({
      gasLimit: 50000,
      gasUsed: 50000,
      baseFeeGwei: 0.001,
      priorityFeeGwei: 0.0005,
      nativeTokenPrice: 2500,
    });
    // 50,000 * 0.0015 Gwei = 75 Gwei = 0.000000075 ETH ($0.0001875)
    expect(res.singleTransaction.actualGasCostNative).toBe(0.000000075);
  });

  // 27. Sanitization: Negative gas inputs clamped to minimums
  it('27. sanitizes negative gas limit and gas used to standard minimum (21,000)', () => {
    const res = calculateGasFee({
      gasLimit: -5000,
      gasUsed: -1000,
    });
    expect(res.inputs.gasLimit).toBe(21000);
    expect(res.inputs.gasUsed).toBe(21000);
  });

  // 28. Sanitization: Gas used cannot exceed gas limit
  it('28. automatically caps gas used at gas limit', () => {
    const res = calculateGasFee({
      gasLimit: 50000,
      gasUsed: 80000,
    });
    expect(res.inputs.gasUsed).toBe(50000);
    expect(res.meta.unusedGasUnits).toBe(0);
  });

  // 29. Sanitization: Negative prices clamped to 0
  it('29. sanitizes negative base fee and priority fee to 0', () => {
    const res = calculateGasFee({
      baseFeeGwei: -20,
      priorityFeeGwei: -5,
    });
    expect(res.inputs.baseFeeGwei).toBe(0);
    expect(res.inputs.priorityFeeGwei).toBe(0);
  });

  // 30. Sanitization: Negative transaction value
  it('30. sanitizes negative transaction value to 0', () => {
    const res = calculateGasFee({
      transactionValueFiat: -500,
    });
    expect(res.inputs.transactionValueFiat).toBe(0);
    expect(res.economics.gasCostRatioPct).toBe(0);
  });

  // 31. Multi-currency: EUR formatting
  it('31. formats outputs in EUR currency correctly', () => {
    const res = calculateGasFee({ currency: 'EUR' });
    expect(res.meta.currencySymbol).toBe('€');
    expect(res.meta.currencyCode).toBe('EUR');
    expect(res.meta.currencyDecimals).toBe(2);
  });

  // 32. Multi-currency: INR formatting
  it('32. formats outputs in INR currency correctly', () => {
    const res = calculateGasFee({ currency: 'INR' });
    expect(res.meta.currencySymbol).toBe('₹');
    expect(res.meta.currencyCode).toBe('INR');
  });

  // 33. Multi-currency: JPY formatting (0 decimals)
  it('33. formats outputs in JPY currency with 0 decimals', () => {
    const res = calculateGasFee({ currency: 'JPY', nativeTokenPrice: 350000 });
    expect(res.meta.currencySymbol).toBe('¥');
    expect(res.meta.currencyDecimals).toBe(0);
    expect(Number.isInteger(res.singleTransaction.actualGasCostFiat)).toBe(true);
  });

  // 34. Non-ETH native token symbol (BNB, MATIC, AVAX)
  it('34. supports non-ETH native token symbols', () => {
    const res = calculateGasFee({ nativeTokenSymbol: 'BNB', nativeTokenPrice: 600 });
    expect(res.meta.nativeTokenSymbol).toBe('BNB');
    expect(res.inputs.nativeTokenSymbol).toBe('BNB');
  });

  // 35. Scenario benchmark estimates array
  it('35. generates 5 common transaction scenario estimates', () => {
    const res = calculateGasFee({ nativeTokenPrice: 2000, baseFeeGwei: 20, priorityFeeGwei: 2 });
    expect(res.scenarioEstimates.length).toBe(5);
    expect(res.scenarioEstimates[0].type).toBe('Simple ETH Transfer');
    expect(res.scenarioEstimates[0].gas).toBe(21000);
    expect(res.scenarioEstimates[1].type).toBe('ERC-20 Token Transfer');
    expect(res.scenarioEstimates[2].type).toBe('Uniswap v3 Swap');
  });

  // 36. Maximum possible cost consistency
  it('36. ensures max potential cost is always greater than or equal to actual cost', () => {
    const res = calculateGasFee({
      gasLimit: 100000,
      gasUsed: 60000,
      baseFeeGwei: 20,
      priorityFeeGwei: 2,
      maxFeeGwei: 40,
    });
    expect(res.singleTransaction.maxPotentialCostNative).toBeGreaterThanOrEqual(res.singleTransaction.actualGasCostNative);
    expect(res.singleTransaction.maxPotentialCostFiat).toBeGreaterThanOrEqual(res.singleTransaction.actualGasCostFiat);
  });

  // 37. Sanitization helper: NaN and string handling
  it('37. handles invalid string representations seamlessly', () => {
    expect(sanitizeNumber('123.45', 0)).toBe(123.45);
    expect(sanitizeNumber('not_a_number', 15)).toBe(15);
    expect(sanitizeNumber(null, 5)).toBe(5);
    expect(sanitizeNumber(undefined, 25)).toBe(25);
  });

  // 38. Large batch (1,000 transactions)
  it('38. handles large batch volume modeling (1,000 txs)', () => {
    const res = calculateGasFee({
      transactionCount: 1000,
      gasUsed: 21000,
      baseFeeGwei: 20,
      priorityFeeGwei: 0,
      nativeTokenPrice: 2000,
    });
    // 1 tx = 0.00042 ETH ($0.84) -> 1,000 txs = 0.42 ETH ($840)
    expect(res.batch.totalBatchNativeCost).toBe(0.42);
    expect(res.batch.totalBatchFiatCost).toBe(840);
  });

  // 39. Gas limit upper boundary (30,000,000 full block gas limit)
  it('39. handles full block gas limit tests (30M gas units)', () => {
    const res = calculateGasFee({
      gasLimit: 30000000,
      gasUsed: 30000000,
      baseFeeGwei: 20,
      priorityFeeGwei: 0,
      nativeTokenPrice: 2000,
    });
    // 30,000,000 * 20 Gwei = 0.6 ETH ($1,200)
    expect(res.singleTransaction.actualGasCostNative).toBe(0.6);
    expect(res.singleTransaction.actualGasCostFiat).toBe(1200);
  });

  // 40. Preset: Simple ETH Transfer
  it('40. verifies the Simple ETH Transfer preset returns', () => {
    const res = calculateGasFee({
      gasLimit: 21000,
      gasUsed: 21000,
      baseFeeGwei: 15,
      priorityFeeGwei: 1.5,
      maxFeeGwei: 25,
      nativeTokenPrice: 2500,
    });
    // 21,000 * 16.5 Gwei = 346,500 Gwei = 0.0003465 ETH ($0.86625 -> $0.87)
    expect(res.singleTransaction.actualGasCostNative).toBe(0.0003465);
    expect(res.singleTransaction.actualGasCostFiat).toBe(0.87);
  });

  // 41. Preset: High Congestion Surge
  it('41. verifies High Congestion Surge preset returns', () => {
    const res = calculateGasFee({
      gasLimit: 250000,
      gasUsed: 180000,
      baseFeeGwei: 120,
      priorityFeeGwei: 15.0,
      maxFeeGwei: 200,
      nativeTokenPrice: 2500,
    });
    expect(res.meta.effectiveGasPriceGwei).toBe(135);
    expect(res.singleTransaction.actualGasCostNative).toBe(0.0243);
    expect(res.singleTransaction.actualGasCostFiat).toBe(60.75);
  });

  // 42. Transaction Count edge case (0 or negative tx count defaults to 1)
  it('42. sanitizes zero or negative transaction count to 1', () => {
    const res = calculateGasFee({ transactionCount: 0 });
    expect(res.inputs.transactionCount).toBe(1);
    expect(res.batch.transactionCount).toBe(1);
  });

  // 43. Default execution test
  it('43. runs with default parameters smoothly without error', () => {
    const res = calculateGasFee();
    expect(res).toBeDefined();
    expect(res.singleTransaction.actualGasCostFiat).toBeGreaterThan(0);
  });

  // 44. Decimal precision of Gwei constant
  it('44. verifies GWEI_PER_NATIVE_TOKEN is strictly 1,000,000,000', () => {
    expect(GWEI_PER_NATIVE_TOKEN).toBe(1000000000);
  });

  // 45. Gas Budget Capacity exact fit
  it('45. calculates exact budget match with zero remaining balance', () => {
    const budget = calculateGasBudgetCapacity(100, 20);
    expect(budget.maxTransactions).toBe(5);
    expect(budget.totalSpentFiat).toBe(100);
    expect(budget.remainingBudgetFiat).toBe(0);
    expect(budget.budgetUtilizationPct).toBe(100);
  });
});
