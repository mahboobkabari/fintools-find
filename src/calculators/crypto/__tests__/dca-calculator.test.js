import { describe, it, expect } from 'vitest';
import {
  calculateDca,
  calculateTransactionFee,
  generatePricePath,
  CONTRIBUTION_FREQUENCIES,
  SCENARIO_MODES,
  FEE_MODES,
  FIAT_CURRENCIES,
} from '../dca-calculator.js';
import { DCA_CALCULATOR_CONFIG } from '../../configs/dca-calculator.config.js';

describe('Flagship #92: Dollar Cost Averaging (DCA) Calculation Engine', () => {
  // 1. Single contribution (Initial only, no recurring)
  it('1. calculates single initial contribution correctly', () => {
    const res = calculateDca({
      initialInvestment: 1000,
      recurringContribution: 0,
      periods: 12,
      startPrice: 100,
      endPrice: 150,
      feeMode: 'NONE',
    });

    expect(res.summary.totalInvested).toBe(1000);
    expect(res.summary.totalUnits).toBe(10); // 1000 / 100
    expect(res.summary.averageCostPerUnit).toBe(100);
    expect(res.summary.endingPortfolioValue).toBe(1500); // 10 * 150
    expect(res.summary.totalProfitLoss).toBe(500);
    expect(res.summary.roiPct).toBe(50);
  });

  // 2. Pure recurring contributions (No initial)
  it('2. calculates recurring periodic contributions without initial lump sum', () => {
    const res = calculateDca({
      initialInvestment: 0,
      recurringContribution: 100,
      periods: 4,
      startPrice: 50,
      endPrice: 50,
      scenarioMode: 'CONSTANT',
      feeMode: 'NONE',
    });

    expect(res.summary.totalInvested).toBe(400); // 4 * 100
    expect(res.summary.totalUnits).toBe(8); // 4 * (100 / 50)
    expect(res.summary.averageCostPerUnit).toBe(50);
    expect(res.summary.endingPortfolioValue).toBe(400);
    expect(res.summary.totalProfitLoss).toBe(0);
    expect(res.summary.roiPct).toBe(0);
  });

  // 3. Both initial and recurring contributions
  it('3. calculates combined initial and recurring contributions', () => {
    const res = calculateDca({
      initialInvestment: 500,
      recurringContribution: 100,
      periods: 5,
      startPrice: 100,
      endPrice: 100,
      scenarioMode: 'CONSTANT',
      feeMode: 'NONE',
    });

    expect(res.summary.totalInvested).toBe(1000); // 500 + 5 * 100
    expect(res.summary.totalUnits).toBe(10); // 5 + 5
    expect(res.summary.averageCostPerUnit).toBe(100);
  });

  // 4. Daily frequency metadata
  it('4. handles daily frequency configuration and duration metrics', () => {
    const res = calculateDca({
      frequency: 'DAILY',
      periods: 30,
      recurringContribution: 10,
    });

    expect(res.meta.frequencyLabel).toContain('Daily');
    expect(res.meta.totalDays).toBe(30);
    expect(res.meta.totalMonths).toBeCloseTo(1.0, 0);
  });

  // 5. Weekly frequency
  it('5. handles weekly frequency schedule', () => {
    const res = calculateDca({
      frequency: 'WEEKLY',
      periods: 52,
      recurringContribution: 50,
    });

    expect(res.meta.frequencyLabel).toContain('Weekly');
    expect(res.meta.totalDays).toBe(364);
    expect(res.meta.totalYears).toBeCloseTo(1.0, 1);
  });

  // 6. Bi-weekly frequency
  it('6. handles bi-weekly frequency schedule', () => {
    const res = calculateDca({
      frequency: 'BIWEEKLY',
      periods: 26,
      recurringContribution: 200,
    });

    expect(res.meta.frequencyLabel).toContain('Bi-Weekly');
    expect(res.meta.totalDays).toBe(364);
  });

  // 7. Monthly frequency
  it('7. handles monthly frequency schedule', () => {
    const res = calculateDca({
      frequency: 'MONTHLY',
      periods: 12,
      recurringContribution: 500,
    });

    expect(res.meta.frequencyLabel).toContain('Monthly');
    expect(res.meta.totalMonths).toBe(12);
  });

  // 8. Quarterly frequency
  it('8. handles quarterly frequency schedule', () => {
    const res = calculateDca({
      frequency: 'QUARTERLY',
      periods: 4,
      recurringContribution: 1500,
    });

    expect(res.meta.frequencyLabel).toContain('Quarterly');
    expect(res.meta.totalDays).toBe(365);
  });

  // 9. Constant asset price scenario
  it('9. computes constant asset price scenario with identical period purchases', () => {
    const res = calculateDca({
      recurringContribution: 200,
      periods: 5,
      startPrice: 50,
      endPrice: 50,
      scenarioMode: 'CONSTANT',
      feeMode: 'NONE',
    });

    expect(res.pricePath).toEqual([50, 50, 50, 50, 50]);
    expect(res.summary.averageCostPerUnit).toBe(50);
    expect(res.summary.totalUnits).toBe(20); // 5 * 4
  });

  // 10. Rising asset price (Bull trend)
  it('10. models rising asset price trend and lowering unit acquisition per period', () => {
    const res = calculateDca({
      initialInvestment: 0,
      recurringContribution: 100,
      periods: 3,
      startPrice: 10,
      endPrice: 30,
      scenarioMode: 'RISING',
      feeMode: 'NONE',
    });

    // Prices: 10, 20, 30
    // Units: 100/10=10, 100/20=5, 100/30=3.33333333 => Total: 18.33333333
    expect(res.pricePath).toEqual([10, 20, 30]);
    expect(res.summary.totalInvested).toBe(300);
    expect(res.summary.totalUnits).toBeCloseTo(18.333333, 5);
    // Average Cost = 300 / 18.333333 = 16.3636
    expect(res.summary.averageCostPerUnit).toBeCloseTo(16.3636, 3);
    // Ending value at 30: 18.333333 * 30 = 550
    expect(res.summary.endingPortfolioValue).toBeCloseTo(550, 1);
    expect(res.summary.totalProfitLoss).toBeCloseTo(250, 1);
  });

  // 11. Falling asset price (Bear trend)
  it('11. models falling asset price trend and higher unit accumulation', () => {
    const res = calculateDca({
      initialInvestment: 0,
      recurringContribution: 100,
      periods: 3,
      startPrice: 30,
      endPrice: 10,
      scenarioMode: 'FALLING',
      feeMode: 'NONE',
    });

    // Prices: 30, 20, 10
    // Units: 100/30=3.3333, 100/20=5, 100/10=10 => Total: 18.3333
    expect(res.pricePath).toEqual([30, 20, 10]);
    expect(res.summary.totalInvested).toBe(300);
    expect(res.summary.totalUnits).toBeCloseTo(18.333333, 5);
    // Ending value at 10: 18.333333 * 10 = 183.33
    expect(res.summary.endingPortfolioValue).toBeCloseTo(183.33, 1);
    expect(res.summary.totalProfitLoss).toBeCloseTo(-116.67, 1);
  });

  // 12. Volatile price path (Dip and Rebound)
  it('12. models volatile mid-term dip scenario and shows DCA benefit', () => {
    const res = calculateDca({
      initialInvestment: 0,
      recurringContribution: 300,
      periods: 5,
      startPrice: 100,
      endPrice: 100,
      scenarioMode: 'VOLATILE',
      dipPct: 50,
      feeMode: 'NONE',
    });

    // Middle price should be lower than start/end
    expect(res.pricePath[0]).toBe(100);
    expect(res.pricePath[2]).toBeLessThan(100);
    expect(res.pricePath[4]).toBe(100);
    // Average cost should be strictly less than $100 due to purchasing during the dip
    expect(res.summary.averageCostPerUnit).toBeLessThan(100);
    expect(res.summary.roiPct).toBeGreaterThan(0); // Profitable even though startPrice == endPrice!
  });

  // 13. Custom period price path
  it('13. calculates precisely with user-defined custom price path', () => {
    const custom = [100, 80, 50, 120];
    const res = calculateDca({
      initialInvestment: 0,
      recurringContribution: 1000,
      periods: 4,
      scenarioMode: 'CUSTOM',
      customPrices: custom,
      feeMode: 'NONE',
    });

    // Period 1: 1000 / 100 = 10 units
    // Period 2: 1000 / 80 = 12.5 units
    // Period 3: 1000 / 50 = 20 units
    // Period 4: 1000 / 120 = 8.333333 units
    // Total units: 50.833333
    expect(res.pricePath).toEqual([100, 80, 50, 120]);
    expect(res.summary.totalInvested).toBe(4000);
    expect(res.summary.totalUnits).toBeCloseTo(50.833333, 4);
    expect(res.summary.endingPortfolioValue).toBeCloseTo(50.833333 * 120, 1);
  });

  // 14. Custom price path length mismatch (Padding & Truncating)
  it('14. safely handles custom price paths with fewer or more elements than periods', () => {
    const shortCustom = [100, 200];
    const res = calculateDca({
      periods: 4,
      scenarioMode: 'CUSTOM',
      customPrices: shortCustom,
    });
    expect(res.pricePath.length).toBe(4);
    expect(res.pricePath[2]).toBe(200); // Padded with last known price
    expect(res.pricePath[3]).toBe(200);

    const longCustom = [10, 20, 30, 40, 50, 60];
    const resLong = calculateDca({
      periods: 3,
      scenarioMode: 'CUSTOM',
      customPrices: longCustom,
    });
    expect(resLong.pricePath.length).toBe(3);
    expect(resLong.pricePath).toEqual([10, 20, 30]);
  });

  // 15. Total cash invested metric integrity
  it('15. verifies total invested matches sum of all period cash contributions', () => {
    const res = calculateDca({
      initialInvestment: 1250,
      recurringContribution: 375,
      periods: 7,
      feeMode: 'NONE',
    });

    const expectedTotal = 1250 + 7 * 375;
    expect(res.summary.totalInvested).toBe(expectedTotal);
  });

  // 16. Total net invested amount accuracy under fees
  it('16. verifies total net invested accounts for deducted fees', () => {
    const res = calculateDca({
      initialInvestment: 0,
      recurringContribution: 100,
      periods: 10,
      fixedFee: 2,
      pctFee: 1, // 1% = $1.00 => total fee per period = $3.00
      feeMode: 'DEDUCTED',
    });

    // Net per period = $97.00 => Total Net = $970.00
    expect(res.summary.totalInvested).toBe(1000);
    expect(res.summary.totalFeesPaid).toBe(30);
    expect(res.summary.totalNetInvested).toBe(970);
  });

  // 17. Total units acquired aggregation
  it('17. verifies total units is sum of units across all schedule rows', () => {
    const res = calculateDca({
      initialInvestment: 500,
      recurringContribution: 250,
      periods: 6,
      startPrice: 2500,
      endPrice: 3500,
    });

    const sumUnits = res.schedule.reduce((acc, row) => acc + row.unitsBought, 0);
    expect(res.summary.totalUnits).toBeCloseTo(sumUnits, 6);
  });

  // 18. Average cost per unit (Break-Even Exit Price)
  it('18. verifies average cost per unit equals total cash invested divided by total units', () => {
    const res = calculateDca({
      initialInvestment: 1000,
      recurringContribution: 200,
      periods: 12,
      startPrice: 50000,
      endPrice: 70000,
    });

    const expectedAvg = res.summary.totalInvested / res.summary.totalUnits;
    expect(res.summary.averageCostPerUnit).toBeCloseTo(expectedAvg, 2);
    expect(res.summary.breakEvenPrice).toBe(res.summary.averageCostPerUnit);
  });

  // 19. Pure average cost vs fee-included average cost
  it('19. distinguishes pure asset average cost from effective fee-included cost', () => {
    const res = calculateDca({
      recurringContribution: 100,
      periods: 5,
      startPrice: 100,
      endPrice: 100,
      scenarioMode: 'CONSTANT',
      fixedFee: 5, // $5 fee on $100 => $95 buys units
      pctFee: 0,
      feeMode: 'DEDUCTED',
    });

    expect(res.summary.pureAverageCost).toBe(100); // 95 / 0.95 = 100
    expect(res.summary.averageCostPerUnit).toBeCloseTo(105.2632, 3); // 100 / 0.95 = 105.26
  });

  // 20. Ending portfolio value calculation
  it('20. verifies ending portfolio value equals total units multiplied by final price', () => {
    const res = calculateDca({
      recurringContribution: 300,
      periods: 10,
      startPrice: 1000,
      endPrice: 2000,
    });

    const expectedVal = res.summary.totalUnits * res.summary.finalPrice;
    expect(res.summary.endingPortfolioValue).toBeCloseTo(expectedVal, 2);
  });

  // 21. Profit calculation in a rising market
  it('21. verifies profit is positive when ending portfolio value exceeds total capital', () => {
    const res = calculateDca({
      recurringContribution: 500,
      periods: 6,
      startPrice: 100,
      endPrice: 200,
      scenarioMode: 'RISING',
      feeMode: 'NONE',
    });

    expect(res.summary.totalProfitLoss).toBeGreaterThan(0);
    expect(res.summary.roiPct).toBeGreaterThan(0);
    expect(res.summary.isProfitable).toBe(true);
  });

  // 22. Loss calculation in a falling market
  it('22. verifies loss is negative when ending portfolio value is below total capital', () => {
    const res = calculateDca({
      recurringContribution: 500,
      periods: 6,
      startPrice: 200,
      endPrice: 100,
      scenarioMode: 'FALLING',
      feeMode: 'NONE',
    });

    expect(res.summary.totalProfitLoss).toBeLessThan(0);
    expect(res.summary.roiPct).toBeLessThan(0);
    expect(res.summary.isProfitable).toBe(false);
  });

  // 23. Break-even exit price validation
  it('23. confirms that selling at break-even price yields zero profit/loss', () => {
    const res = calculateDca({
      recurringContribution: 400,
      periods: 8,
      startPrice: 120,
      endPrice: 180,
      feeMode: 'DEDUCTED',
      fixedFee: 2,
      pctFee: 0.5,
    });

    const breakEven = res.summary.breakEvenPrice;
    const resAtBreakEven = calculateDca({
      recurringContribution: 400,
      periods: 8,
      startPrice: 120,
      endPrice: 180,
      feeMode: 'DEDUCTED',
      fixedFee: 2,
      pctFee: 0.5,
      targetExitPrice: breakEven,
    });

    expect(resAtBreakEven.summary.totalProfitLoss).toBeCloseTo(0, 1);
    expect(resAtBreakEven.summary.roiPct).toBeCloseTo(0, 1);
  });

  // 24. ROI formula accuracy
  it('24. verifies ROI % mathematically equals (Profit / Total Invested) * 100', () => {
    const res = calculateDca({
      recurringContribution: 1000,
      periods: 12,
      startPrice: 50,
      endPrice: 100,
      feeMode: 'NONE',
    });

    const expectedRoi = (res.summary.totalProfitLoss / res.summary.totalInvested) * 100;
    expect(res.summary.roiPct).toBeCloseTo(expectedRoi, 2);
  });

  // 25. Zero contribution safeguard
  it('25. gracefully handles zero initial and zero recurring contribution', () => {
    const res = calculateDca({
      initialInvestment: 0,
      recurringContribution: 0,
      periods: 12,
    });

    expect(res.summary.totalInvested).toBe(0);
    expect(res.summary.totalUnits).toBe(0);
    expect(res.summary.endingPortfolioValue).toBe(0);
    expect(res.summary.roiPct).toBe(0);
    expect(res.summary.averageCostPerUnit).toBe(0);
  });

  // 26. Zero and negative asset price safeguards
  it('26. handles zero or negative asset prices without division by zero errors', () => {
    const res = calculateDca({
      startPrice: 0,
      endPrice: 0,
      recurringContribution: 100,
      periods: 5,
    });

    expect(res.summary.totalUnits).toBeGreaterThan(0); // Clamped to non-zero positive epsilon
    expect(isFinite(res.summary.averageCostPerUnit)).toBe(true);
    expect(isFinite(res.summary.roiPct)).toBe(true);
  });

  // 27. Negative input rejection and sanitization
  it('27. sanitizes negative periods, negative investments, and negative fees', () => {
    const res = calculateDca({
      initialInvestment: -500,
      recurringContribution: -200,
      periods: -10,
      fixedFee: -5,
      pctFee: -2,
    });

    expect(res.inputs.initialInvestment).toBe(0);
    expect(res.inputs.periods).toBe(1); // Min 1 period
    expect(res.inputs.fixedFee).toBe(0);
    expect(res.inputs.pctFee).toBe(0);
  });

  // 28. Invalid frequency fallback
  it('28. falls back to MONTHLY for unknown frequency ID', () => {
    const res = calculateDca({
      frequency: 'INVALID_FREQ',
    });

    expect(res.inputs.frequency).toBe('MONTHLY');
    expect(res.meta.frequencyLabel).toContain('Monthly');
  });

  // 29. Invalid scenarioMode fallback
  it('29. falls back to RISING for unknown scenarioMode', () => {
    const res = calculateDca({
      scenarioMode: 'UNKNOWN_MODE',
    });

    expect(res.inputs.scenarioMode).toBe('RISING');
  });

  // 30. Fixed transaction fee in DEDUCTED mode
  it('30. correctly applies fixed fiat fee in DEDUCTED mode', () => {
    const tx = calculateTransactionFee(100, 5, 0, 'DEDUCTED');
    expect(tx.fee).toBe(5);
    expect(tx.netInvested).toBe(95);
    expect(tx.cashOutlay).toBe(100);
  });

  // 31. Percentage transaction fee in DEDUCTED mode
  it('31. correctly applies percentage fee in DEDUCTED mode', () => {
    const tx = calculateTransactionFee(200, 0, 1.5, 'DEDUCTED');
    expect(tx.fee).toBe(3); // 1.5% of 200 = 3
    expect(tx.netInvested).toBe(197);
    expect(tx.cashOutlay).toBe(200);
  });

  // 32. Fixed + percentage combined in DEDUCTED mode
  it('32. applies combined fixed and percentage fee in DEDUCTED mode', () => {
    const tx = calculateTransactionFee(500, 2.50, 0.5, 'DEDUCTED');
    // Fee = 2.50 + 2.50 = 5.00
    expect(tx.fee).toBe(5.00);
    expect(tx.netInvested).toBe(495.00);
    expect(tx.cashOutlay).toBe(500.00);
  });

  // 33. Fixed fee in SEPARATE mode
  it('33. correctly applies fixed fee charged separately on top', () => {
    const tx = calculateTransactionFee(100, 5, 0, 'SEPARATE');
    expect(tx.fee).toBe(5);
    expect(tx.netInvested).toBe(100);
    expect(tx.cashOutlay).toBe(105);
  });

  // 34. Percentage fee in SEPARATE mode
  it('34. correctly applies percentage fee charged separately on top', () => {
    const tx = calculateTransactionFee(200, 0, 1.5, 'SEPARATE');
    expect(tx.fee).toBe(3);
    expect(tx.netInvested).toBe(200);
    expect(tx.cashOutlay).toBe(203);
  });

  // 35. Combined fee in SEPARATE mode
  it('35. applies combined fees in SEPARATE mode', () => {
    const tx = calculateTransactionFee(500, 2.50, 0.5, 'SEPARATE');
    expect(tx.fee).toBe(5.00);
    expect(tx.netInvested).toBe(500.00);
    expect(tx.cashOutlay).toBe(505.00);
  });

  // 36. Zero fees in NONE mode
  it('36. ensures zero fee impact in NONE mode', () => {
    const tx = calculateTransactionFee(1000, 10, 5, 'NONE');
    expect(tx.fee).toBe(0);
    expect(tx.netInvested).toBe(1000);
    expect(tx.cashOutlay).toBe(1000);
  });

  // 37. Fee cap safeguard (Deducted fee cannot exceed contribution)
  it('37. caps deducted fee at gross contribution amount preventing negative net capital', () => {
    const tx = calculateTransactionFee(10, 50, 0, 'DEDUCTED');
    expect(tx.fee).toBe(10);
    expect(tx.netInvested).toBe(0);
    expect(tx.cashOutlay).toBe(10);
  });

  // 38. Decimal contribution amounts
  it('38. handles arbitrary decimal contribution amounts precisely', () => {
    const res = calculateDca({
      recurringContribution: 123.45,
      periods: 4,
      startPrice: 543.21,
      endPrice: 543.21,
      scenarioMode: 'CONSTANT',
      feeMode: 'NONE',
    });

    expect(res.summary.totalInvested).toBe(493.80);
    expect(res.summary.totalUnits).toBeCloseTo(493.80 / 543.21, 6);
  });

  // 39. Fractional crypto units precision (8 decimals)
  it('39. calculates high-precision fractional Bitcoin/Ethereum units', () => {
    const res = calculateDca({
      recurringContribution: 50,
      periods: 12,
      startPrice: 65432.10,
      endPrice: 98765.43,
      scenarioMode: 'RISING',
      feeMode: 'NONE',
    });

    expect(res.summary.totalUnits.toString()).toMatch(/^\d+\.\d+$/);
    expect(res.summary.totalUnits).toBeLessThan(0.1);
  });

  // 40. Large institutional capital scale ($1,000,000+)
  it('40. supports large institutional scale investment figures', () => {
    const res = calculateDca({
      initialInvestment: 1000000,
      recurringContribution: 250000,
      periods: 12,
      startPrice: 3000,
      endPrice: 4500,
    });

    expect(res.summary.totalInvested).toBe(4000000);
    expect(res.summary.endingPortfolioValue).toBeGreaterThan(4000000);
  });

  // 41. Small micro-investments ($5 / $10)
  it('41. supports micro-investing scenarios without precision degradation', () => {
    const res = calculateDca({
      recurringContribution: 5,
      periods: 30,
      startPrice: 100,
      endPrice: 150,
    });

    expect(res.summary.totalInvested).toBe(150);
    expect(res.summary.totalUnits).toBeGreaterThan(0);
  });

  // 42. Schedule row item consistency with summary aggregates
  it('42. verifies schedule row cumulative fields match summary outputs exactly', () => {
    const res = calculateDca({
      initialInvestment: 200,
      recurringContribution: 100,
      periods: 5,
      startPrice: 50,
      endPrice: 80,
      feeMode: 'DEDUCTED',
      fixedFee: 1,
      pctFee: 0.5,
    });

    const lastRow = res.schedule[res.schedule.length - 1];
    expect(lastRow.cumulativeInvested).toBe(res.summary.totalInvested);
    expect(lastRow.cumulativeUnits).toBe(res.summary.totalUnits);
    expect(lastRow.cumulativeFees).toBe(res.summary.totalFeesPaid);
    expect(lastRow.averageCost).toBe(res.summary.averageCostPerUnit);
  });

  // 43. Target exit price override vs last period price
  it('43. allows explicit target exit price valuation override', () => {
    const res = calculateDca({
      recurringContribution: 100,
      periods: 4,
      startPrice: 50,
      endPrice: 50,
      scenarioMode: 'CONSTANT',
      targetExitPrice: 100, // Explicitly evaluate portfolio at $100
      feeMode: 'NONE',
    });

    expect(res.summary.finalPrice).toBe(100);
    expect(res.summary.endingPortfolioValue).toBe(800); // 8 units * 100
    expect(res.summary.totalProfitLoss).toBe(400);
    expect(res.summary.roiPct).toBe(100);
  });

  // 44. Lump-Sum benchmark comparison logic
  it('44. compares DCA vs Lump-Sum benchmark under identical capital deployment', () => {
    // In a pure rising market, Lump-Sum should outperform DCA because capital entered at lowest price
    const resBull = calculateDca({
      recurringContribution: 100,
      periods: 4,
      startPrice: 10,
      endPrice: 40,
      scenarioMode: 'RISING',
      feeMode: 'NONE',
    });

    expect(resBull.lumpSumBenchmark.endingValue).toBeGreaterThan(resBull.summary.endingPortfolioValue);
    expect(resBull.lumpSumBenchmark.dcaOutperformed).toBe(false);

    // In a pure falling market, DCA should outperform Lump-Sum (less severe loss)
    const resBear = calculateDca({
      recurringContribution: 100,
      periods: 4,
      startPrice: 40,
      endPrice: 10,
      scenarioMode: 'FALLING',
      feeMode: 'NONE',
    });

    expect(resBear.summary.endingPortfolioValue).toBeGreaterThan(resBear.lumpSumBenchmark.endingValue);
    expect(resBear.lumpSumBenchmark.dcaOutperformed).toBe(true);
  });

  // 45. Multi-currency and config presets validation
  it('45. validates multi-currency outputs and config presets integrity', () => {
    const resEur = calculateDca({ currency: 'EUR' });
    expect(resEur.meta.currencyCode).toBe('EUR');
    expect(resEur.meta.currencySymbol).toBe('€');

    const resInr = calculateDca({ currency: 'INR' });
    expect(resInr.meta.currencyCode).toBe('INR');
    expect(resInr.meta.currencySymbol).toBe('₹');

    expect(DCA_CALCULATOR_CONFIG.id).toBe('dca-calculator');
    expect(Array.isArray(DCA_CALCULATOR_CONFIG.presets)).toBe(true);
    expect(DCA_CALCULATOR_CONFIG.presets.length).toBeGreaterThanOrEqual(5);

    DCA_CALCULATOR_CONFIG.presets.forEach((p) => {
      const sim = calculateDca(p);
      expect(sim.summary.totalInvested).toBeGreaterThan(0);
      expect(sim.summary.totalUnits).toBeGreaterThan(0);
      expect(isFinite(sim.summary.roiPct)).toBe(true);
    });
  });
});
