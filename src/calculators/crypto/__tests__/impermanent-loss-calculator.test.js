import { describe, it, expect } from 'vitest';
import {
  calculateImpermanentLoss,
  calculateImpermanentLossFactor,
  generateSensitivityMatrix,
  FIAT_CURRENCIES,
  SENSITIVITY_RATIOS,
} from '../impermanent-loss-calculator.js';
import { IMPERMANENT_LOSS_CONFIG } from '../../configs/impermanent-loss-calculator.config.js';

describe('Flagship #94: Impermanent Loss Calculation Engine', () => {
  // 1. Equal starting and final prices (No price movement -> 0% IL)
  it('1. calculates 0% IL when relative prices are unchanged (r = 1.0)', () => {
    const res = calculateImpermanentLoss({
      initialPriceA: 2000,
      finalPriceA: 2000,
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      initialInvestment: 10000,
      feeAprPct: 0,
    });

    expect(res.meta.priceRatio).toBe(1.0);
    expect(res.meta.ilFactor).toBe(1.0);
    expect(res.summary.pureImpermanentLossPct).toBe(0);
    expect(res.summary.pureIlDollarImpact).toBe(0);
    expect(res.summary.hodlValue).toBe(10000);
    expect(res.summary.lpValueWithoutFees).toBe(10000);
  });

  // 2. 2x relative price move (r = 2.0 -> ~ -5.72% IL)
  it('2. calculates standard -5.72% IL for a 2x relative price divergence (r = 2.0)', () => {
    const { factor, ilPct } = calculateImpermanentLossFactor(2.0);
    // Factor = 2 * sqrt(2) / (1 + 2) = 2.828427 / 3 = 0.942809
    // IL % = (0.942809 - 1) * 100 = -5.7191%
    expect(factor).toBeCloseTo(0.942809, 5);
    expect(ilPct).toBeCloseTo(-5.7191, 2);

    const res = calculateImpermanentLoss({
      initialPriceA: 1000,
      finalPriceA: 2000,
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      initialInvestment: 10000,
      feeAprPct: 0,
    });

    expect(res.meta.priceRatio).toBe(2.0);
    expect(res.summary.pureImpermanentLossPct).toBeCloseTo(-5.72, 2);
    // HODL: 5 ETH * 2000 + 5000 USDC * 1 = 10,000 + 5,000 = 15,000
    expect(res.summary.hodlValue).toBe(15000);
    // LP: 15,000 * 0.942809 = 14,142.14
    expect(res.summary.lpValueWithoutFees).toBeCloseTo(14142.14, 1);
    expect(res.summary.pureIlDollarImpact).toBeCloseTo(-857.86, 1);
  });

  // 3. 4x relative price move (r = 4.0 -> -20.00% IL)
  it('3. calculates standard -20.00% IL for a 4x relative price surge (r = 4.0)', () => {
    const { factor, ilPct } = calculateImpermanentLossFactor(4.0);
    // Factor = 2 * sqrt(4) / (1 + 4) = 4 / 5 = 0.80
    // IL % = (0.80 - 1) * 100 = -20.00%
    expect(factor).toBe(0.80);
    expect(ilPct).toBe(-20.00);

    const res = calculateImpermanentLoss({
      initialPriceA: 50,
      finalPriceA: 200,
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      initialInvestment: 10000,
      feeAprPct: 0,
    });

    expect(res.meta.priceRatio).toBe(4.0);
    expect(res.summary.pureImpermanentLossPct).toBe(-20.0);
    // HODL: 100 SOL * 200 + 5000 USDC = 20,000 + 5,000 = 25,000
    expect(res.summary.hodlValue).toBe(25000);
    // LP: 25,000 * 0.8 = 20,000
    expect(res.summary.lpValueWithoutFees).toBe(20000);
    expect(res.summary.pureIlDollarImpact).toBe(-5000);
  });

  // 4. 0.5x relative price move (r = 0.5 -> ~ -5.72% IL, symmetric to 2x)
  it('4. verifies mathematical symmetry: a 50% price drop (r = 0.5) produces identical -5.72% IL', () => {
    const { factor, ilPct } = calculateImpermanentLossFactor(0.5);
    // Factor = 2 * sqrt(0.5) / 1.5 = (2 * 0.7071067) / 1.5 = 1.4142135 / 1.5 = 0.942809
    expect(factor).toBeCloseTo(0.942809, 5);
    expect(ilPct).toBeCloseTo(-5.7191, 2);

    const res = calculateImpermanentLoss({
      initialPriceA: 2000,
      finalPriceA: 1000,
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      initialInvestment: 10000,
      feeAprPct: 0,
    });

    expect(res.meta.priceRatio).toBe(0.5);
    expect(res.summary.pureImpermanentLossPct).toBeCloseTo(-5.72, 2);
    // HODL: 2.5 ETH * 1000 + 5000 USDC = 2500 + 5000 = 7500
    expect(res.summary.hodlValue).toBe(7500);
    // LP: 7500 * 0.942809 = 7071.07
    expect(res.summary.lpValueWithoutFees).toBeCloseTo(7071.07, 1);
  });

  // 5. 0.25x relative price move (r = 0.25 -> -20.00% IL, symmetric to 4x)
  it('5. verifies mathematical symmetry: a 75% price drop (r = 0.25) produces identical -20.00% IL', () => {
    const { factor, ilPct } = calculateImpermanentLossFactor(0.25);
    // Factor = 2 * sqrt(0.25) / 1.25 = 1 / 1.25 = 0.80
    expect(factor).toBe(0.80);
    expect(ilPct).toBe(-20.00);

    const res = calculateImpermanentLoss({
      initialPriceA: 400,
      finalPriceA: 100,
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      initialInvestment: 10000,
      feeAprPct: 0,
    });

    expect(res.meta.priceRatio).toBe(0.25);
    expect(res.summary.pureImpermanentLossPct).toBe(-20.0);
  });

  // 6. 1.25x price move (r = 1.25 -> -0.62% IL)
  it('6. calculates -0.62% IL for a 1.25x price move', () => {
    const { ilPct } = calculateImpermanentLossFactor(1.25);
    expect(ilPct).toBeCloseTo(-0.6192, 2);
  });

  // 7. 1.5x price move (r = 1.50 -> -2.02% IL)
  it('7. calculates -2.02% IL for a 1.50x price move', () => {
    const { ilPct } = calculateImpermanentLossFactor(1.50);
    expect(ilPct).toBeCloseTo(-2.0204, 2);
  });

  // 8. 3x price move (r = 3.0 -> -13.40% IL)
  it('8. calculates -13.40% IL for a 3.0x price move', () => {
    const { ilPct } = calculateImpermanentLossFactor(3.0);
    expect(ilPct).toBeCloseTo(-13.3975, 2);
  });

  // 9. 5x price move (r = 5.0 -> -25.46% IL)
  it('9. calculates -25.46% IL for a 5.0x price move', () => {
    const { ilPct } = calculateImpermanentLossFactor(5.0);
    expect(ilPct).toBeCloseTo(-25.4644, 2);
  });

  // 10. 10x price move (r = 10.0 -> -42.50% IL)
  it('10. calculates -42.50% IL for a 10.0x price move', () => {
    const { ilPct } = calculateImpermanentLossFactor(10.0);
    expect(ilPct).toBeCloseTo(-42.5040, 2);
  });

  // 11. Symmetric token appreciation (Both tokens rise by +50% -> r = 1.0 -> 0% IL)
  it('11. returns 0% IL when both tokens in the pool appreciate by the same percentage (+50%)', () => {
    const res = calculateImpermanentLoss({
      initialPriceA: 2000,
      finalPriceA: 3000, // +50%
      initialPriceB: 100,
      finalPriceB: 150,  // +50%
      initialInvestment: 10000,
      feeAprPct: 0,
    });

    expect(res.meta.priceRatio).toBe(1.0);
    expect(res.summary.pureImpermanentLossPct).toBe(0);
    expect(res.summary.hodlValue).toBe(15000);
    expect(res.summary.lpValueWithoutFees).toBe(15000);
  });

  // 12. Symmetric token depreciation (Both tokens drop by -40% -> r = 1.0 -> 0% IL)
  it('12. returns 0% IL when both tokens depreciate by the same percentage (-40%)', () => {
    const res = calculateImpermanentLoss({
      initialPriceA: 2000,
      finalPriceA: 1200, // -40%
      initialPriceB: 50,
      finalPriceB: 30,   // -40%
      initialInvestment: 10000,
      feeAprPct: 0,
    });

    expect(res.meta.priceRatio).toBe(1.0);
    expect(res.summary.pureImpermanentLossPct).toBe(0);
    expect(res.summary.hodlValue).toBe(6000);
    expect(res.summary.lpValueWithoutFees).toBe(6000);
  });

  // 13. Token B appreciation while Token A is constant
  it('13. calculates IL correctly when Token B appreciates and Token A remains flat', () => {
    const res = calculateImpermanentLoss({
      initialPriceA: 1.0,
      finalPriceA: 1.0,
      initialPriceB: 100,
      finalPriceB: 200, // Token B doubles -> r = (1/200) / (1/100) = 0.5
      initialInvestment: 10000,
      feeAprPct: 0,
    });

    expect(res.meta.priceRatio).toBe(0.5);
    expect(res.summary.pureImpermanentLossPct).toBeCloseTo(-5.72, 2);
  });

  // 14. Explicit price mode calculation
  it('14. computes explicit token prices mode properly', () => {
    const res = calculateImpermanentLoss({
      calculationMode: 'EXPLICIT_PRICES',
      initialPriceA: 1500,
      finalPriceA: 3000,
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      initialInvestment: 12000,
    });

    expect(res.inputs.finalPriceA).toBe(3000);
    expect(res.meta.priceRatio).toBe(2.0);
    expect(res.summary.initialInvestment).toBe(12000);
  });

  // 15. Percentage change mode calculation
  it('15. computes percentage change mode properly', () => {
    const res = calculateImpermanentLoss({
      calculationMode: 'PERCENTAGE_CHANGE',
      initialPriceA: 2000,
      initialPriceB: 1.0,
      priceChangePctA: 100, // +100% -> finalPriceA = 4000
      priceChangePctB: 0,
      initialInvestment: 10000,
    });

    expect(res.inputs.finalPriceA).toBe(4000);
    expect(res.meta.priceRatio).toBe(2.0);
    expect(res.summary.pureImpermanentLossPct).toBeCloseTo(-5.72, 2);
  });

  // 16. Consistency between explicit price and percentage mode
  it('16. produces identical results between explicit price and percentage mode', () => {
    const explicitRes = calculateImpermanentLoss({
      calculationMode: 'EXPLICIT_PRICES',
      initialPriceA: 1000,
      finalPriceA: 2500,
      initialPriceB: 10,
      finalPriceB: 10,
      initialInvestment: 20000,
    });

    const pctRes = calculateImpermanentLoss({
      calculationMode: 'PERCENTAGE_CHANGE',
      initialPriceA: 1000,
      initialPriceB: 10,
      priceChangePctA: 150, // +150% -> 2500
      priceChangePctB: 0,
      initialInvestment: 20000,
    });

    expect(explicitRes.summary.hodlValue).toBe(pctRes.summary.hodlValue);
    expect(explicitRes.summary.lpValueWithoutFees).toBe(pctRes.summary.lpValueWithoutFees);
    expect(explicitRes.summary.pureImpermanentLossPct).toBe(pctRes.summary.pureImpermanentLossPct);
  });

  // 17. Initial 50/50 pool token quantity allocation
  it('17. allocates exactly 50% fiat value to Token A and 50% to Token B upon deposit', () => {
    const res = calculateImpermanentLoss({
      initialPriceA: 2500,
      initialPriceB: 1.0,
      initialInvestment: 10000,
    });

    // $5,000 in Token A = 2.0 ETH
    expect(res.poolComposition.initial.qtyA).toBe(2.0);
    expect(res.poolComposition.initial.valueA).toBe(5000);

    // $5,000 in Token B = 5,000 USDC
    expect(res.poolComposition.initial.qtyB).toBe(5000);
    expect(res.poolComposition.initial.valueB).toBe(5000);
  });

  // 18. Constant-product invariant (x * y = k) preservation
  it('18. verifies that pool invariant k is preserved after price rebalancing', () => {
    const res = calculateImpermanentLoss({
      initialPriceA: 1000,
      finalPriceA: 4000, // 4x surge
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      initialInvestment: 10000,
    });

    const initK = res.poolComposition.initial.qtyA * res.poolComposition.initial.qtyB;
    const finalK = res.poolComposition.final.qtyA * res.poolComposition.final.qtyB;

    expect(initK).toBe(25000); // 5 * 5000
    expect(finalK).toBeCloseTo(25000, 2); // 2.5 * 10000 = 25000
  });

  // 19. Resulting token quantity rebalancing
  it('19. rebalances token quantities: sells appreciating asset and buys depreciating asset', () => {
    const res = calculateImpermanentLoss({
      initialPriceA: 1000,
      finalPriceA: 4000, // Token A surges 4x -> r = 4, sqrt(r) = 2
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      initialInvestment: 10000,
    });

    // Initial: 5 ETH, 5,000 USDC
    // Final: 5 / 2 = 2.5 ETH, 5000 * 2 = 10,000 USDC
    expect(res.poolComposition.final.qtyA).toBe(2.5);
    expect(res.poolComposition.final.qtyB).toBe(10000);
    expect(res.poolComposition.tokensRebalanced.deltaQtyA).toBe(-2.5);
    expect(res.poolComposition.tokensRebalanced.deltaQtyB).toBe(5000);
  });

  // 20. HODL portfolio valuation accuracy
  it('20. accurately computes HODL portfolio value based on initial quantities at new prices', () => {
    const res = calculateImpermanentLoss({
      initialPriceA: 2000,
      finalPriceA: 3000,
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      initialInvestment: 20000,
    });

    // Initial: 5 ETH ($10k) + 10,000 USDC ($10k)
    // HODL at new prices: 5 * 3000 + 10000 * 1 = 15,000 + 10,000 = $25,000
    expect(res.summary.hodlValue).toBe(25000);
    expect(res.summary.hodlProfitDollar).toBe(5000);
    expect(res.summary.hodlRoiPct).toBe(25);
  });

  // 21. Zero fees scenario
  it('21. handles zero fees with feeAdjustedLpValue equal to lpValueWithoutFees', () => {
    const res = calculateImpermanentLoss({
      feeAprPct: 0,
      feeRevenueAmount: 0,
      initialInvestment: 10000,
      initialPriceA: 1000,
      finalPriceA: 2000,
    });

    expect(res.summary.totalFeesEarned).toBe(0);
    expect(res.summary.feeAdjustedLpValue).toBe(res.summary.lpValueWithoutFees);
    expect(res.summary.netLpAdvantage).toBe(res.summary.pureIlDollarImpact);
  });

  // 22. Positive fee APR accrual
  it('22. calculates fee yield accrual from fee APR and holding duration', () => {
    const res = calculateImpermanentLoss({
      initialInvestment: 10000,
      feeAprPct: 20, // 20% APR
      holdingDays: 182.5, // Half a year -> 10% yield on $10k = $1,000
      initialPriceA: 2000,
      finalPriceA: 2000,
    });

    expect(res.summary.totalFeesEarned).toBeCloseTo(1000, 2);
    expect(res.summary.feeAdjustedLpValue).toBeCloseTo(11000, 2);
  });

  // 23. Direct fee revenue override amount
  it('23. respects direct fee revenue dollar override', () => {
    const res = calculateImpermanentLoss({
      initialInvestment: 10000,
      feeRevenueAmount: 1500, // Explicit fee revenue
      initialPriceA: 2000,
      finalPriceA: 2000,
    });

    expect(res.summary.totalFeesEarned).toBe(1500);
    expect(res.summary.feeAdjustedLpValue).toBe(11500);
  });

  // 24. Positive Net LP Advantage when fees exceed IL
  it('24. detects positive Net LP advantage when trading fees exceed impermanent loss', () => {
    const res = calculateImpermanentLoss({
      initialInvestment: 10000,
      initialPriceA: 1000,
      finalPriceA: 2000, // IL = -$857.86
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      feeRevenueAmount: 1500, // $1,500 fees > $857.86 IL
    });

    // Net Advantage = -857.86 + 1500 = +$642.14
    expect(res.summary.pureIlDollarImpact).toBeCloseTo(-857.86, 1);
    expect(res.summary.netLpAdvantage).toBeCloseTo(642.14, 1);
    expect(res.meta.isLpSuperior).toBe(true);
    expect(res.meta.isLpInferior).toBe(false);
  });

  // 25. Negative Net LP Advantage when IL exceeds fees
  it('25. detects negative Net LP advantage when impermanent loss exceeds trading fees', () => {
    const res = calculateImpermanentLoss({
      initialInvestment: 10000,
      initialPriceA: 1000,
      finalPriceA: 2000, // IL = -$857.86
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      feeRevenueAmount: 300, // $300 fees < $857.86 IL
    });

    expect(res.summary.netLpAdvantage).toBeCloseTo(-557.86, 1);
    expect(res.meta.isLpSuperior).toBe(false);
    expect(res.meta.isLpInferior).toBe(true);
  });

  // 26. Break-even fees required calculation
  it('26. calculates the exact break-even dollar fee amount required to offset IL', () => {
    const res = calculateImpermanentLoss({
      initialInvestment: 10000,
      initialPriceA: 1000,
      finalPriceA: 2000, // IL dollar impact = -$857.86
      initialPriceB: 1.0,
      finalPriceB: 1.0,
    });

    expect(res.summary.breakEvenFeesRequired).toBeCloseTo(857.86, 1);
    // Break-even fee % of HODL ($15,000): 857.86 / 15000 = 5.719%
    expect(res.summary.breakEvenFeePctOfHodl).toBeCloseTo(5.72, 2);
  });

  // 27. Break-even annual fee APR %
  it('27. solves for the required annualized fee APR to break even over the holding period', () => {
    const res = calculateImpermanentLoss({
      initialInvestment: 10000,
      initialPriceA: 1000,
      finalPriceA: 2000, // Break-even fee = $857.86
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      holdingDays: 182.5, // 0.5 year
    });

    // Required APR = (857.86 / 10000) * (365 / 182.5) * 100 = 8.5786 * 2 = 17.157%
    expect(res.summary.breakEvenAnnualApr).toBeCloseTo(17.16, 1);
  });

  // 28. HODL ROI % vs LP ROI %
  it('28. accurately computes HODL ROI % and LP ROI %', () => {
    const res = calculateImpermanentLoss({
      initialInvestment: 10000,
      initialPriceA: 1000,
      finalPriceA: 2000,
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      feeRevenueAmount: 500,
    });

    // HODL: $15,000 -> +50% ROI
    expect(res.summary.hodlRoiPct).toBe(50.0);

    // LP: $14,142.14 + $500 = $14,642.14 -> +46.42% ROI
    expect(res.summary.lpRoiPct).toBeCloseTo(46.42, 1);
  });

  // 29. Zero initial investment safeguard
  it('29. handles zero initial investment gracefully with zero outputs', () => {
    const res = calculateImpermanentLoss({
      initialInvestment: 0,
      initialPriceA: 1000,
      finalPriceA: 2000,
    });

    expect(res.summary.initialInvestment).toBe(0);
    expect(res.summary.hodlValue).toBe(0);
    expect(res.summary.lpValueWithoutFees).toBe(0);
    expect(res.summary.pureIlDollarImpact).toBe(0);
  });

  // 30. Negative input sanitization
  it('30. sanitizes negative initial investment, fee APR, and prices', () => {
    const res = calculateImpermanentLoss({
      initialInvestment: -10000,
      feeAprPct: -25,
      initialPriceA: -1000,
      finalPriceA: -2000,
    });

    expect(res.inputs.initialInvestment).toBe(0);
    expect(res.inputs.feeAprPct).toBe(0);
    expect(res.inputs.initialPriceA).toBe(0.00000001);
  });

  // 31. High precision fractional crypto token quantities
  it('31. handles fractional token quantities with high numerical precision', () => {
    const res = calculateImpermanentLoss({
      initialPriceA: 60000, // Bitcoin
      finalPriceA: 90000,
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      initialInvestment: 1000, // $500 in BTC = 0.008333 BTC
    });

    expect(res.poolComposition.initial.qtyA).toBeCloseTo(0.008333, 5);
    expect(res.summary.pureImpermanentLossPct).toBeCloseTo(-2.02, 2);
  });

  // 32. Large institutional liquidity deposit ($10,000,000+)
  it('32. supports large institutional scale liquidity positions', () => {
    const res = calculateImpermanentLoss({
      initialPriceA: 3000,
      finalPriceA: 6000, // 2x move
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      initialInvestment: 10000000, // $10M
      feeAprPct: 20,
      holdingDays: 365,
    });

    expect(res.summary.hodlValue).toBe(15000000);
    expect(res.summary.pureIlDollarImpact).toBeCloseTo(-857864.38, 1);
    expect(res.summary.totalFeesEarned).toBe(2000000); // 20% on $10M
    expect(res.summary.netLpAdvantage).toBeCloseTo(1142135.62, 1);
  });

  // 33. Stablecoin pair minimal IL (< 0.01%)
  it('33. demonstrates negligible IL on tightly pegged stablecoin pools', () => {
    const res = calculateImpermanentLoss({
      initialPriceA: 1.0,
      finalPriceA: 1.002, // 0.2% peg deviation
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      initialInvestment: 50000,
    });

    expect(res.meta.priceRatio).toBe(1.002);
    expect(res.summary.pureImpermanentLossPct).toBeCloseTo(0.00, 2);
    expect(Math.abs(res.summary.pureIlDollarImpact)).toBeLessThan(1.0);
  });

  // 34. Sensitivity matrix generation structure
  it('34. generates a complete sensitivity matrix with correct ratios', () => {
    const matrix = generateSensitivityMatrix(10000, 2000, 1.0);
    expect(Array.isArray(matrix)).toBe(true);
    expect(matrix.length).toBe(SENSITIVITY_RATIOS.length);

    const r1 = matrix.find((m) => m.ratio === 1.0);
    expect(r1.ilPct).toBe(0);
    expect(r1.hodlValue).toBe(10000);
    expect(r1.lpValue).toBe(10000);

    const r2 = matrix.find((m) => m.ratio === 2.0);
    expect(r2.ilPct).toBeCloseTo(-5.72, 2);

    const r4 = matrix.find((m) => m.ratio === 4.0);
    expect(r4.ilPct).toBe(-20.0);
  });

  // 35. Multi-currency outputs
  it('35. supports different quote fiat currency denominations', () => {
    const resEur = calculateImpermanentLoss({ currency: 'EUR' });
    expect(resEur.meta.currencyCode).toBe('EUR');
    expect(resEur.meta.currencySymbol).toBe('€');

    const resGbp = calculateImpermanentLoss({ currency: 'GBP' });
    expect(resGbp.meta.currencyCode).toBe('GBP');
    expect(resGbp.meta.currencySymbol).toBe('£');

    const resInr = calculateImpermanentLoss({ currency: 'INR' });
    expect(resInr.meta.currencyCode).toBe('INR');
    expect(resInr.meta.currencySymbol).toBe('₹');
  });

  // 36. Config presets integrity
  it('36. validates that all configuration presets execute successfully', () => {
    expect(IMPERMANENT_LOSS_CONFIG.id).toBe('impermanent-loss-calculator');
    expect(Array.isArray(IMPERMANENT_LOSS_CONFIG.presets)).toBe(true);
    expect(IMPERMANENT_LOSS_CONFIG.presets.length).toBeGreaterThanOrEqual(6);

    IMPERMANENT_LOSS_CONFIG.presets.forEach((p) => {
      const sim = calculateImpermanentLoss(p);
      expect(isFinite(sim.summary.pureImpermanentLossPct)).toBe(true);
      expect(isFinite(sim.summary.hodlValue)).toBe(true);
      expect(isFinite(sim.summary.lpValueWithoutFees)).toBe(true);
      expect(isFinite(sim.summary.feeAdjustedLpValue)).toBe(true);
    });
  });

  // 37. Extreme price divergence (50x move)
  it('37. handles extreme price divergence (50x move) gracefully', () => {
    const { ilPct } = calculateImpermanentLossFactor(50.0);
    // Factor = 2 * sqrt(50) / 51 = 14.142135 / 51 = 0.277296
    // IL % = -72.27%
    expect(ilPct).toBeCloseTo(-72.27, 1);
  });

  // 38. Extreme downward price divergence (99% drop -> r = 0.01)
  it('38. handles extreme downward crash (99% drop -> r = 0.01)', () => {
    const { ilPct } = calculateImpermanentLossFactor(0.01);
    // Factor = 2 * sqrt(0.01) / 1.01 = 0.2 / 1.01 = 0.198019
    // IL % = -80.20%
    expect(ilPct).toBeCloseTo(-80.20, 1);
  });

  // 39. Zero price ratio boundary safeguard
  it('39. handles zero price ratio returning -100% IL safeguard', () => {
    const { factor, ilPct } = calculateImpermanentLossFactor(0);
    expect(factor).toBe(0);
    expect(ilPct).toBe(-100);
  });

  // 40. Meta indicators (isLpSuperior vs isLpInferior)
  it('40. sets boolean superiority flags accurately', () => {
    const neutralRes = calculateImpermanentLoss({
      initialPriceA: 2000,
      finalPriceA: 2000,
      feeAprPct: 0,
      feeRevenueAmount: 0,
    });
    expect(neutralRes.meta.isLpSuperior).toBe(false);
    expect(neutralRes.meta.isLpInferior).toBe(false);
  });

  // 41. Rebalanced token values equal 50% each of total LP value
  it('41. confirms that after rebalancing, Token A fiat value equals Token B fiat value in the LP pool', () => {
    const res = calculateImpermanentLoss({
      initialPriceA: 1000,
      finalPriceA: 3000, // 3x move
      initialPriceB: 1.0,
      finalPriceB: 1.0,
      initialInvestment: 10000,
    });

    // In a 50/50 AMM pool, value of token A always equals value of token B in fiat
    expect(res.poolComposition.final.valueA).toBeCloseTo(res.poolComposition.final.valueB, 1);
    expect(res.poolComposition.final.valueA + res.poolComposition.final.valueB).toBeCloseTo(res.summary.lpValueWithoutFees, 1);
  });

  // 42. Token percentage changes in metadata
  it('42. accurately records individual token price percentage changes in metadata', () => {
    const res = calculateImpermanentLoss({
      initialPriceA: 2000,
      finalPriceA: 3000, // +50%
      initialPriceB: 100,
      finalPriceB: 80,   // -20%
    });

    expect(res.meta.priceChangePctTokenA).toBe(50.0);
    expect(res.meta.priceChangePctTokenB).toBe(-20.0);
  });

  // 43. Holding days parameter bounds
  it('43. sanitizes excessive holding days', () => {
    const res = calculateImpermanentLoss({
      holdingDays: 999999,
    });
    expect(res.inputs.holdingDays).toBe(36500); // Capped at 100 years
  });

  // 44. Aliased function exports validation
  it('44. exports helper aliases accurately', () => {
    expect(typeof calculateImpermanentLoss).toBe('function');
    expect(typeof calculateImpermanentLossFactor).toBe('function');
    expect(typeof generateSensitivityMatrix).toBe('function');
  });

  // 45. Pure IL vs Fee-Adjusted separation validation
  it('45. strictly maintains separation between Pure IL and Fee-Adjusted Net Advantage', () => {
    const res = calculateImpermanentLoss({
      initialPriceA: 1000,
      finalPriceA: 2000,
      feeRevenueAmount: 2000,
      initialInvestment: 10000,
    });

    // Pure IL is purely a function of relative price movement (-5.72%)
    expect(res.summary.pureImpermanentLossPct).toBeCloseTo(-5.72, 2);
    expect(res.summary.pureIlDollarImpact).toBeCloseTo(-857.86, 1);

    // Fee adjusted performance is positive (+$1,142.14)
    expect(res.summary.netLpAdvantage).toBeCloseTo(1142.14, 1);
  });
});
