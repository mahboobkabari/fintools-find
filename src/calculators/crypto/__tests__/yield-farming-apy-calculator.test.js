import { describe, it, expect } from 'vitest';
import {
  convertAprToApy,
  convertApyToApr,
  generateCompoundingComparison,
  calculateYieldFarming,
  sanitizeNumber,
  COMPOUNDING_FREQUENCIES,
} from '../yield-farming-apy-calculator.js';

describe('Yield Farming APY Engine (Flagship #95)', () => {
  // 1. APR -> APY: Simple interest (No Compounding)
  it('1. converts APR to APY with No Compounding (APY equals APR)', () => {
    const apy = convertAprToApy(20, 0);
    expect(apy).toBe(20);
  });

  // 2. APR -> APY: Daily Compounding (365x / yr)
  it('2. converts 20% APR to 22.1336% APY with Daily Compounding', () => {
    const apy = convertAprToApy(20, 365);
    expect(apy).toBeCloseTo(22.1336, 2);
  });

  // 3. APR -> APY: Weekly Compounding (52x / yr)
  it('3. converts 20% APR to 22.0934% APY with Weekly Compounding', () => {
    const apy = convertAprToApy(20, 52);
    expect(apy).toBeCloseTo(22.0934, 2);
  });

  // 4. APR -> APY: Monthly Compounding (12x / yr)
  it('4. converts 12% APR to 12.6825% APY with Monthly Compounding', () => {
    const apy = convertAprToApy(12, 12);
    expect(apy).toBeCloseTo(12.6825, 2);
  });

  // 5. APR -> APY: Quarterly Compounding (4x / yr)
  it('5. converts 10% APR to 10.3813% APY with Quarterly Compounding', () => {
    const apy = convertAprToApy(10, 4);
    expect(apy).toBeCloseTo(10.3813, 2);
  });

  // 6. APR -> APY: Annual Compounding (1x / yr)
  it('6. converts 15% APR to 15% APY with Annual Compounding', () => {
    const apy = convertAprToApy(15, 1);
    expect(apy).toBe(15);
  });

  // 7. APR -> APY: Continuous Compounding (e^r - 1)
  it('7. converts 20% APR to 22.1403% APY with Continuous Compounding', () => {
    const apy = convertAprToApy(20, Infinity);
    expect(apy).toBeCloseTo(22.1403, 2);
  });

  // 8. APY -> APR: Daily Compounding
  it('8. converts 22.1336% APY to 20% APR with Daily Compounding', () => {
    const apr = convertApyToApr(22.1336, 365);
    expect(apr).toBeCloseTo(20.0, 2);
  });

  // 9. APY -> APR: Monthly Compounding
  it('9. converts 12.6825% APY to 12% APR with Monthly Compounding', () => {
    const apr = convertApyToApr(12.6825, 12);
    expect(apr).toBeCloseTo(12.0, 2);
  });

  // 10. APY -> APR: Continuous Compounding
  it('10. converts 22.1403% APY to 20% APR with Continuous Compounding', () => {
    const apr = convertApyToApr(22.1403, Infinity);
    expect(apr).toBeCloseTo(20.0, 2);
  });

  // 11. Zero APR conversion
  it('11. returns 0 for zero APR or APY', () => {
    expect(convertAprToApy(0, 365)).toBe(0);
    expect(convertApyToApr(0, 365)).toBe(0);
  });

  // 12. Round-trip APR -> APY -> APR consistency
  it('12. maintains mathematical consistency across APR -> APY -> APR round trips', () => {
    const originalApr = 35.5;
    const apy = convertAprToApy(originalApr, 365);
    const recoveredApr = convertApyToApr(apy, 365);
    expect(recoveredApr).toBeCloseTo(originalApr, 2);
  });

  // 13. Gross Yield: 1-Year Simple Interest ($10k @ 20% APR)
  it('13. calculates exactly $2,000 gross yield for 1-year simple interest on $10k at 20% APR', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      compoundingFrequency: 'NONE',
      farmingDurationDays: 365,
      depositFeePct: 0,
      performanceFeePct: 0,
      withdrawalFeePct: 0,
    });
    expect(res.summary.baseGrossYield).toBe(2000);
    expect(res.summary.endingGrossBalance).toBe(12000);
  });

  // 14. Gross Yield: 1-Year Daily Compounding ($10k @ 20% APR -> $2,213.36 yield)
  it('14. calculates $2,213.36 gross yield for 1-year daily compounding on $10k at 20% APR', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      compoundingFrequency: 'DAILY',
      farmingDurationDays: 365,
      depositFeePct: 0,
      performanceFeePct: 0,
      withdrawalFeePct: 0,
    });
    expect(res.summary.baseGrossYield).toBeCloseTo(2213.36, 1);
    expect(res.summary.endingGrossBalance).toBeCloseTo(12213.36, 1);
  });

  // 15. Gross Yield: 90 Days Daily Compounding ($10k @ 20% APR)
  it('15. calculates 90-day daily compounding yield accurately', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      compoundingFrequency: 'DAILY',
      farmingDurationDays: 90,
      depositFeePct: 0,
      performanceFeePct: 0,
      withdrawalFeePct: 0,
    });
    // (1 + 0.20/365)^90 - 1 = 0.050537 -> $505.37
    expect(res.summary.baseGrossYield).toBeCloseTo(505.37, 1);
  });

  // 16. Deposit Fee deduction ($10k deposit with 3% deposit fee -> $9,700 net principal)
  it('16. deducts deposit fee from initial principal before yield generation', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      compoundingFrequency: 'NONE',
      farmingDurationDays: 365,
      depositFeePct: 3.0,
      performanceFeePct: 0,
      withdrawalFeePct: 0,
    });
    expect(res.fees.depositFeeAmount).toBe(300);
    expect(res.summary.netPrincipalDeposited).toBe(9700);
    // 20% of $9,700 = $1,940
    expect(res.summary.baseGrossYield).toBe(1940);
  });

  // 17. Performance Fee on earned yield ($10k @ 20% simple -> $2,000 yield with 5% perf fee -> $100 fee)
  it('17. accurately calculates performance fee on gross yield', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      compoundingFrequency: 'NONE',
      farmingDurationDays: 365,
      depositFeePct: 0,
      performanceFeePct: 5.0,
      withdrawalFeePct: 0,
    });
    expect(res.summary.baseGrossYield).toBe(2000);
    expect(res.fees.performanceFeeAmount).toBe(100);
    expect(res.summary.totalNetProfit).toBe(1900);
  });

  // 18. Withdrawal Fee deduction on ending balance
  it('18. accurately applies withdrawal exit fee on final balance', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      compoundingFrequency: 'NONE',
      farmingDurationDays: 365,
      depositFeePct: 0,
      performanceFeePct: 0,
      withdrawalFeePct: 1.0,
    });
    // Gross balance = $12,000 -> 1% withdrawal fee = $120
    expect(res.fees.withdrawalFeeAmount).toBe(120);
    expect(res.summary.netEndingBalance).toBe(11880);
    expect(res.summary.totalNetProfit).toBe(1880);
  });

  // 19. Multi-tier fee stacking without double counting
  it('19. correctly accounts for combined deposit, performance, and withdrawal fees', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      compoundingFrequency: 'NONE',
      farmingDurationDays: 365,
      depositFeePct: 2.0, // $200
      performanceFeePct: 10.0, // 10% of $1,960 = $196
      withdrawalFeePct: 1.0, // 1% of ($9,800 + $1,764 = $11,564) = $115.64
    });
    expect(res.fees.depositFeeAmount).toBe(200);
    expect(res.fees.performanceFeeAmount).toBe(196);
    expect(res.fees.withdrawalFeeAmount).toBeCloseTo(115.64, 1);
    expect(res.fees.totalFeesPaid).toBeCloseTo(511.64, 1);
  });

  // 20. Fee Drag Percentage
  it('20. computes fee drag percentage relative to gross yield', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      compoundingFrequency: 'NONE',
      farmingDurationDays: 365,
      performanceFeePct: 15.0,
    });
    // 15% of $2,000 yield = $300 fee -> Fee drag = 15%
    expect(res.fees.feeDragPct).toBe(15);
  });

  // 21. Net ROI % and Net Annualized APY %
  it('21. calculates Net ROI and Net Annualized APY accurately', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      compoundingFrequency: 'DAILY',
      farmingDurationDays: 365,
      depositFeePct: 0,
      performanceFeePct: 2.0,
      withdrawalFeePct: 0,
    });
    // Gross yield = $2,213.36 -> Perf fee = $44.27 -> Net profit = $2,169.09
    expect(res.summary.netRoiPct).toBeCloseTo(21.69, 1);
    expect(res.summary.netAnnualizedApyPct).toBeCloseTo(21.69, 1);
  });

  // 22. Volatile Reward Token: +50% Price Surge
  it('22. models reward token price surge (+50%) increasing gross and net fiat yield', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      compoundingFrequency: 'NONE',
      farmingDurationDays: 365,
      isRewardTokenVolatile: true,
      initialRewardTokenPrice: 10,
      finalRewardTokenPrice: 15, // +50%
      depositFeePct: 0,
      performanceFeePct: 0,
      withdrawalFeePct: 0,
    });
    // Base gross yield = $2,000 (200 tokens). At $15/token, gross value = $3,000
    expect(res.meta.rewardTokensEarned).toBe(200);
    expect(res.summary.adjustedGrossYield).toBe(3000);
    expect(res.meta.rewardTokenValueImpact).toBe(1000);
    expect(res.summary.totalNetProfit).toBe(3000);
  });

  // 23. Volatile Reward Token: -60% Price Depreciation
  it('23. models reward token price decline (-60%) reducing gross and net fiat yield', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      compoundingFrequency: 'NONE',
      farmingDurationDays: 365,
      isRewardTokenVolatile: true,
      initialRewardTokenPrice: 10,
      finalRewardTokenPrice: 4, // -60%
      depositFeePct: 0,
      performanceFeePct: 0,
      withdrawalFeePct: 0,
    });
    // Base gross yield = $2,000 (200 tokens). At $4/token, adjusted gross yield = $800
    expect(res.meta.rewardTokensEarned).toBe(200);
    expect(res.summary.adjustedGrossYield).toBe(800);
    expect(res.meta.rewardTokenValueImpact).toBe(-1200);
    expect(res.summary.totalNetProfit).toBe(800);
  });

  // 24. Break-even reward token price solver
  it('24. calculates break-even reward token price required to offset multi-tier fees', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      compoundingFrequency: 'NONE',
      farmingDurationDays: 365,
      isRewardTokenVolatile: true,
      initialRewardTokenPrice: 10,
      depositFeePct: 2.0, // $200
      performanceFeePct: 5.0,
      withdrawalFeePct: 0,
    });
    // Base gross yield on $9,800 is $1,960 (196 tokens). Total fees = $200 + $98 = $298.
    // Break-even price = $298 / 196 tokens = ~$1.52
    expect(res.summary.breakEvenRewardPrice).toBeGreaterThan(0);
    expect(res.summary.breakEvenRewardPrice).toBeLessThan(10);
  });

  // 25. Break-even Annual APR solver
  it('25. calculates required break-even APR to overcome deposit and withdrawal fees', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      farmingDurationDays: 90,
      depositFeePct: 2.0,
      withdrawalFeePct: 1.0,
      performanceFeePct: 0,
    });
    // In 90 days, to overcome 3% total drag, required annualized APR must be > 10%
    expect(res.summary.breakEvenAnnualApr).toBeGreaterThan(10);
  });

  // 26. LP Mode: 2x Relative Price Move (-5.72% IL drag)
  it('26. integrates Impermanent Loss in LP farming mode', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 30,
      compoundingFrequency: 'NONE',
      farmingDurationDays: 365,
      isLpMode: true,
      lpPriceRatio: 2.0, // 2x move -> -5.72% IL
      depositFeePct: 0,
      performanceFeePct: 0,
      withdrawalFeePct: 0,
    });
    expect(res.meta.impermanentLossPct).toBeCloseTo(-5.72, 1);
    expect(res.meta.impermanentLossDollarDrag).toBeCloseTo(-571.91, 0);
    // Gross yield = $3,000 -> Total net profit = $3,000 - $571.91 = $2,428.09
    expect(res.summary.totalNetProfit).toBeCloseTo(2428.09, 0);
  });

  // 27. LP Mode: Neutral 1x ratio (0% IL)
  it('27. results in 0% IL when LP price ratio is 1.0', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 30,
      isLpMode: true,
      lpPriceRatio: 1.0,
    });
    expect(res.meta.impermanentLossPct).toBe(0);
    expect(res.meta.impermanentLossDollarDrag).toBe(0);
  });

  // 28. APY input mode resolution
  it('28. accurately converts APY input to APR and computes matching yield', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      rateMode: 'APY',
      interestRate: 22.1336, // ~20% APR daily
      compoundingFrequency: 'DAILY',
      farmingDurationDays: 365,
      depositFeePct: 0,
      performanceFeePct: 0,
      withdrawalFeePct: 0,
    });
    expect(res.meta.baseApr).toBeCloseTo(20.0, 1);
    expect(res.summary.baseGrossYield).toBeCloseTo(2213.36, 1);
  });

  // 29. Compounding comparison matrix structure
  it('29. generates compounding comparison matrix with all 8 frequencies', () => {
    const comparison = generateCompoundingComparison(10000, 20, 365);
    expect(comparison.length).toBe(8);
    expect(comparison[0].id).toBe('NONE');
    expect(comparison[0].effectiveApyPct).toBe(20);
    expect(comparison[6].id).toBe('DAILY');
    expect(comparison[6].effectiveApyPct).toBeCloseTo(22.13, 1);
    expect(comparison[7].id).toBe('CONTINUOUS');
    expect(comparison[7].effectiveApyPct).toBeCloseTo(22.14, 1);
  });

  // 30. Periodic Projections: Daily, Monthly, Annual
  it('30. provides accurate periodic yield estimates', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 36.5,
      compoundingFrequency: 'NONE',
      farmingDurationDays: 365,
    });
    // $3,650 / 365 = $10/day
    expect(res.summary.dailyYieldGross).toBe(10);
    expect(res.summary.annualGrossProjected).toBe(3650);
  });

  // 31. Zero Capital handling
  it('31. safely handles zero initial deposit without NaN or crashes', () => {
    const res = calculateYieldFarming({
      initialDeposit: 0,
      interestRate: 20,
    });
    expect(res.summary.baseGrossYield).toBe(0);
    expect(res.summary.netEndingBalance).toBe(0);
    expect(res.summary.netRoiPct).toBe(0);
  });

  // 32. Zero Duration handling
  it('32. handles zero farming duration gracefully', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      farmingDurationDays: 0,
    });
    expect(res.summary.baseGrossYield).toBe(0);
    expect(res.summary.netEndingBalance).toBe(10000);
  });

  // 33. Sanitization of negative inputs
  it('33. sanitizes negative interest rates and negative deposits to 0', () => {
    const res = calculateYieldFarming({
      initialDeposit: -5000,
      interestRate: -20,
      depositFeePct: -5,
    });
    expect(res.inputs.initialDeposit).toBe(0);
    expect(res.inputs.interestRate).toBe(0);
    expect(res.inputs.depositFeePct).toBe(0);
  });

  // 34. Out-of-bounds fee caps
  it('34. caps excessive fee percentages at reasonable maximums (50%)', () => {
    const res = calculateYieldFarming({
      depositFeePct: 99,
      performanceFeePct: 100,
    });
    expect(res.inputs.depositFeePct).toBe(50);
    expect(res.inputs.performanceFeePct).toBe(50);
  });

  // 35. High APR scenario (1,000% APR)
  it('35. computes astronomical high-yield degen farm math accurately', () => {
    const res = calculateYieldFarming({
      initialDeposit: 1000,
      interestRate: 1000,
      compoundingFrequency: 'DAILY',
      farmingDurationDays: 30, // 30 days of 1000% APR
      depositFeePct: 0,
      performanceFeePct: 0,
      withdrawalFeePct: 0,
    });
    expect(res.summary.baseGrossYield).toBeGreaterThan(1000);
    expect(Number.isFinite(res.summary.endingGrossBalance)).toBe(true);
  });

  // 36. Large Capital ($10,000,000 institutional deployment)
  it('36. handles eight-figure institutional capital balances without overflow', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000000,
      interestRate: 15,
      compoundingFrequency: 'DAILY',
      farmingDurationDays: 365,
    });
    expect(res.summary.baseGrossYield).toBeCloseTo(1617984, -2);
    expect(res.summary.endingGrossBalance).toBeGreaterThan(11600000);
  });

  // 37. Small Micro-deposit ($10 capital)
  it('37. handles micro-deposit capital scenarios accurately', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10,
      interestRate: 20,
      compoundingFrequency: 'NONE',
      farmingDurationDays: 365,
    });
    expect(res.summary.baseGrossYield).toBe(2.0);
    expect(res.summary.endingGrossBalance).toBe(12.0);
  });

  // 38. Multi-Year Farming Duration (3 years / 1095 days)
  it('38. compounds yields correctly across multi-year horizons (3 years)', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 10,
      compoundingFrequency: 'ANNUALLY',
      farmingDurationDays: 1095, // ~3 years
      depositFeePct: 0,
      performanceFeePct: 0,
      withdrawalFeePct: 0,
    });
    // 10,000 * (1.10)^3 = 13,310 -> Gross yield = 3,310
    expect(res.summary.endingGrossBalance).toBeCloseTo(13310, 0);
  });

  // 39. Currency metadata adherence
  it('39. attaches correct fiat currency symbols and decimals (EUR, INR, JPY)', () => {
    const resEur = calculateYieldFarming({ currency: 'EUR' });
    expect(resEur.meta.currencySymbol).toBe('€');
    const resInr = calculateYieldFarming({ currency: 'INR' });
    expect(resInr.meta.currencySymbol).toBe('₹');
    const resJpy = calculateYieldFarming({ currency: 'JPY' });
    expect(resJpy.meta.currencySymbol).toBe('¥');
    expect(resJpy.meta.currencyDecimals).toBe(0);
  });

  // 40. Preset: Daily Compounding 20% APR scenario
  it('40. verifies the Daily Compounding 20% APR scenario returns', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 20,
      compoundingFrequency: 'DAILY',
      farmingDurationDays: 90,
      performanceFeePct: 2,
    });
    expect(res.meta.baseApy).toBeCloseTo(22.13, 1);
    expect(res.summary.baseGrossYield).toBeCloseTo(505.37, 1);
    expect(res.fees.performanceFeeAmount).toBeCloseTo(10.11, 1);
    expect(res.summary.totalNetProfit).toBeCloseTo(495.26, 1);
  });

  // 41. Preset: Stablecoin Pair Farm (8% APR)
  it('41. verifies the Stablecoin Pair Farm preset returns on $25k', () => {
    const res = calculateYieldFarming({
      initialDeposit: 25000,
      interestRate: 8,
      compoundingFrequency: 'DAILY',
      farmingDurationDays: 365,
      performanceFeePct: 1,
    });
    expect(res.meta.baseApy).toBeCloseTo(8.33, 1);
    expect(res.summary.baseGrossYield).toBeCloseTo(2082.09, 0);
    expect(res.summary.totalNetProfit).toBeCloseTo(2061.27, 0);
  });

  // 42. Preset: High Yield High Fee Scenario
  it('42. verifies high fee erosion in high yield farm scenario', () => {
    const res = calculateYieldFarming({
      initialDeposit: 10000,
      interestRate: 80,
      compoundingFrequency: 'DAILY',
      farmingDurationDays: 60,
      depositFeePct: 3.0,
      performanceFeePct: 4.0,
      withdrawalFeePct: 1.5,
    });
    expect(res.fees.depositFeeAmount).toBe(300);
    expect(res.fees.totalFeesPaid).toBeGreaterThan(400);
    expect(res.summary.totalNetProfit).toBeGreaterThan(0);
  });

  // 43. Default input completeness
  it('43. runs with default parameters seamlessly without exceptions', () => {
    const res = calculateYieldFarming();
    expect(res).toBeDefined();
    expect(res.summary.endingGrossBalance).toBeGreaterThan(10000);
    expect(res.compoundingComparison.length).toBe(8);
  });

  // 44. Sanitization of extreme strings
  it('44. handles string representations and NaN inputs gracefully', () => {
    expect(sanitizeNumber('123.45', 0)).toBe(123.45);
    expect(sanitizeNumber('invalid', 10)).toBe(10);
    expect(sanitizeNumber(undefined, 50)).toBe(50);
  });

  // 45. Monotonic property of compounding frequencies
  it('45. proves mathematically that higher compounding frequency yields monotonically higher returns', () => {
    const comp = generateCompoundingComparison(10000, 20, 365);
    // None < Annually (equal for 1 yr) <= Quarterly <= Monthly <= Weekly <= Daily <= Continuous
    const apyNone = comp.find((c) => c.id === 'NONE').effectiveApyPct;
    const apyAnnual = comp.find((c) => c.id === 'ANNUALLY').effectiveApyPct;
    const apyQuarterly = comp.find((c) => c.id === 'QUARTERLY').effectiveApyPct;
    const apyMonthly = comp.find((c) => c.id === 'MONTHLY').effectiveApyPct;
    const apyDaily = comp.find((c) => c.id === 'DAILY').effectiveApyPct;
    const apyContinuous = comp.find((c) => c.id === 'CONTINUOUS').effectiveApyPct;

    expect(apyNone).toBe(20);
    expect(apyAnnual).toBe(20);
    expect(apyQuarterly).toBeGreaterThan(apyAnnual);
    expect(apyMonthly).toBeGreaterThan(apyQuarterly);
    expect(apyDaily).toBeGreaterThan(apyMonthly);
    expect(apyContinuous).toBeGreaterThanOrEqual(apyDaily);
  });
});
