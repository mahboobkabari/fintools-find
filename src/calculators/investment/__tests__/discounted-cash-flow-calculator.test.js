import { describe, it, expect } from 'vitest';
import {
  calculateFcfProjections,
  calculatePvCashFlows,
  calculateTerminalValue,
  calculateEnterpriseAndEquityValue,
  calculateIntrinsicValuePerShare,
  calculateDcfSensitivityMatrix,
  calculateDcf,
} from '../discounted-cash-flow-calculator.js';
import { DCF_CONFIG } from '../../configs/discounted-cash-flow-calculator.config.js';

describe('Discounted Cash Flow (DCF) Financial Engine', () => {

  // 1. Explicit 5-year FCF forecast
  it('calculates explicit 5-year FCF forecast accurately without modification', () => {
    const res = calculateFcfProjections({
      mode: 'explicit',
      explicitFcfs: [100, 110, 120, 130, 140],
      projectionYears: 5,
    });
    expect(res.fcfList).toEqual([100, 110, 120, 130, 140]);
    expect(res.projectionYears).toBe(5);
  });

  // 2. Growth-rate FCF forecast
  it('calculates growth-rate FCF forecast starting from FCF0 accurately', () => {
    const res = calculateFcfProjections({
      mode: 'growth',
      startingFcf: 1000,
      fcfGrowthRatePercent: 10,
      projectionYears: 3,
    });
    expect(res.fcfList).toEqual([1100, 1210, 1331]);
  });

  // 3. PV of explicit FCFs
  it('calculates present value of explicit FCFs correctly at 10% discount rate', () => {
    const fcfList = [1100, 1210, 1331];
    const res = calculatePvCashFlows(fcfList, 10);
    // 1100 / 1.1 = 1000, 1210 / 1.21 = 1000, 1331 / 1.331 = 1000 -> total = 3000
    expect(res.pvList).toEqual([1000, 1000, 1000]);
    expect(res.totalPvExplicit).toBe(3000);
  });

  // 4. Gordon Growth terminal value
  it('calculates Gordon Growth terminal value and present value of TV accurately', () => {
    const res = calculateTerminalValue({
      method: 'gordon',
      lastYearFcf: 1000,
      terminalGrowthRatePercent: 2,
      discountRatePercent: 10,
      projectionYears: 5,
    });
    // TV = 1000 * 1.02 / (0.10 - 0.02) = 1020 / 0.08 = 12750
    expect(res.isValid).toBe(true);
    expect(res.tv).toBe(12750);
    // PV(TV) = 12750 / (1.1)^5 = 12750 / 1.61051 = 7917
    expect(res.pvTv).toBe(7917);
  });

  // 5. Exit Multiple terminal value
  it('calculates Exit Multiple terminal value accurately', () => {
    const res = calculateTerminalValue({
      method: 'exitMultiple',
      terminalEbitda: 2000,
      exitMultiple: 10,
      discountRatePercent: 10,
      projectionYears: 5,
    });
    expect(res.isValid).toBe(true);
    expect(res.tv).toBe(20000);
    // PV = 20000 / 1.61051 = 12418
    expect(res.pvTv).toBe(12418);
  });

  // 6. Gordon Growth invalid g >= r
  it('returns invalid state when terminal growth g >= r for Gordon Growth Model', () => {
    const res = calculateTerminalValue({
      method: 'gordon',
      lastYearFcf: 1000,
      terminalGrowthRatePercent: 10,
      discountRatePercent: 10,
    });
    expect(res.isValid).toBe(false);
    expect(res.validationMessage).toContain('strictly less than');
    expect(res.tv).toBe(0);
  });

  // 7. Sensitivity matrix invalid cells (N/A)
  it('returns formatted N/A for cells where g >= r in sensitivity matrix', () => {
    const res = calculateDcfSensitivityMatrix({
      mode: 'growth',
      startingFcf: 100000,
      fcfGrowthRatePercent: 5,
      projectionYears: 5,
      baseDiscountRate: 5,
      baseTerminalGrowth: 5, // offsets will push g >= r in top right
      sharesOutstanding: 1000,
    });
    const invalidCell = res.matrix.find((r) => r.terminalGrowthRatePercent >= 5)?.cells.find((c) => c.discountRatePercent <= 4);
    if (invalidCell) {
      expect(invalidCell.formattedValue).toBe('N/A');
      expect(invalidCell.isValid).toBe(false);
    }
  });

  // 8. Enterprise Value
  it('aggregates PV explicit and PV terminal value into Enterprise Value', () => {
    const res = calculateEnterpriseAndEquityValue(300000, 700000, 100000, 50000);
    expect(res.enterpriseValue).toBe(1000000);
  });

  // 9. Equity Value bridge
  it('calculates Equity Value (Enterprise Value + Cash - Debt) correctly', () => {
    const res = calculateEnterpriseAndEquityValue(300000, 700000, 100000, 50000);
    expect(res.equityValue).toBe(1050000);
  });

  // 10. Intrinsic share value
  it('calculates intrinsic value per share accurately', () => {
    const res = calculateIntrinsicValuePerShare(1000000, 10000, 80, 15);
    expect(res.intrinsicValuePerShare).toBe(100.00);
  });

  // 11. Upside/downside %
  it('calculates upside/downside % vs current stock price accurately', () => {
    const res = calculateIntrinsicValuePerShare(1000000, 10000, 80, 15);
    // (100 - 80) / 80 * 100 = 25%
    expect(res.upsideDownsidePercent).toBe(25.00);
  });

  // 12. Margin of safety price
  it('calculates margin of safety buy price correctly at 15% discount', () => {
    const res = calculateIntrinsicValuePerShare(1000000, 10000, 80, 15);
    // 100 * (1 - 0.15) = 85
    expect(res.marginOfSafetyPrice).toBe(85.00);
  });

  // 13. Terminal Value Contribution %
  it('calculates Terminal Value Contribution % as PV(TV) / EV * 100', () => {
    const res = calculateEnterpriseAndEquityValue(300000, 700000, 0, 0);
    expect(res.tvContributionPercent).toBe(70.00);
  });

  // 14. Negative FCF handling
  it('preserves negative FCF values in explicit forecast mode without converting to 0', () => {
    const fcfRes = calculateFcfProjections({
      mode: 'explicit',
      explicitFcfs: [-5000, -2000, 1000, 5000, 8000],
      projectionYears: 5,
    });
    expect(fcfRes.fcfList).toEqual([-5000, -2000, 1000, 5000, 8000]);
  });

  // 15. Zero debt scenario
  it('calculates valuation when company has zero debt', () => {
    const res = calculateEnterpriseAndEquityValue(500000, 500000, 100000, 0);
    expect(res.equityValue).toBe(1100000);
  });

  // 16. High debt scenario
  it('reduces Equity Value appropriately when company has high debt', () => {
    const res = calculateEnterpriseAndEquityValue(500000, 500000, 100000, 800000);
    expect(res.equityValue).toBe(300000);
  });

  // 17. Zero cash scenario
  it('calculates valuation when company has zero cash', () => {
    const res = calculateEnterpriseAndEquityValue(500000, 500000, 0, 200000);
    expect(res.equityValue).toBe(800000);
  });

  // 18. Zero shares validation
  it('returns invalid state when shares outstanding is zero or negative', () => {
    const res = calculateIntrinsicValuePerShare(1000000, 0, 100, 15);
    expect(res.isValid).toBe(false);
    expect(res.validationMessage).toContain('greater than zero');
  });

  // 19. Large valuation ($100 Billion)
  it('handles large corporate valuations cleanly without overflow', () => {
    const res = calculateDcf({
      mode: 'growth',
      startingFcf: 1000000000, // $1 Billion FCF
      fcfGrowthRatePercent: 10,
      projectionYears: 5,
      discountRatePercent: 9,
      terminalGrowthRatePercent: 3,
      cashAndEquivalents: 5000000000,
      totalDebt: 2000000000,
      sharesOutstanding: 100000000,
      currentStockPrice: 150,
    });
    expect(res.isValid).toBe(true);
    expect(res.enterpriseValue).toBeGreaterThan(15000000000);
  });

  // 20. String sanitization
  it('sanitizes numeric string inputs safely', () => {
    const res = calculateDcf({
      startingFcf: '1000000',
      discountRatePercent: '10',
      sharesOutstanding: '100000',
    });
    expect(res.isValid).toBe(true);
    expect(res.sharesOutstanding).toBe(100000);
  });

  // 21. Negative input handling
  it('returns invalid state when WACC is <= 0%', () => {
    const res = calculateDcf({
      discountRatePercent: 0,
    });
    expect(res.isValid).toBe(false);
  });

  // 22. Custom projection horizon (10 years)
  it('calculates DCF for custom 10-year projection horizon', () => {
    const res = calculateDcf({
      mode: 'growth',
      startingFcf: 500000,
      projectionYears: 10,
    });
    expect(res.fcfList.length).toBe(10);
    expect(res.pvList.length).toBe(10);
  });

  // 23. High WACC sensitivity
  it('reduces intrinsic value per share when discount rate increases', () => {
    const lowWacc = calculateDcf({ discountRatePercent: 8 });
    const highWacc = calculateDcf({ discountRatePercent: 12 });
    expect(lowWacc.intrinsicValuePerShare).toBeGreaterThan(highWacc.intrinsicValuePerShare);
  });

  // 24. Low WACC sensitivity
  it('increases present value of explicit cash flows when discount rate drops', () => {
    const lowWacc = calculatePvCashFlows([1000, 1000, 1000], 5);
    const highWacc = calculatePvCashFlows([1000, 1000, 1000], 10);
    expect(lowWacc.totalPvExplicit).toBeGreaterThan(highWacc.totalPvExplicit);
  });

  // 25. Higher growth sensitivity
  it('increases terminal value when terminal growth rate increases', () => {
    const lowG = calculateTerminalValue({ method: 'gordon', lastYearFcf: 1000, terminalGrowthRatePercent: 2, discountRatePercent: 10 });
    const highG = calculateTerminalValue({ method: 'gordon', lastYearFcf: 1000, terminalGrowthRatePercent: 4, discountRatePercent: 10 });
    expect(highG.tv).toBeGreaterThan(lowG.tv);
  });

  // 26. Lower growth sensitivity
  it('reduces FCF projections when growth rate is lower', () => {
    const lowG = calculateFcfProjections({ mode: 'growth', startingFcf: 1000, fcfGrowthRatePercent: 4 });
    const highG = calculateFcfProjections({ mode: 'growth', startingFcf: 1000, fcfGrowthRatePercent: 12 });
    expect(highG.fcfList[4]).toBeGreaterThan(lowG.fcfList[4]);
  });

  // 27. Exit multiple integration
  it('calculates full DCF using Exit Multiple method cleanly', () => {
    const res = calculateDcf({
      terminalMethod: 'exitMultiple',
      terminalEbitda: 5000000,
      exitMultiple: 12,
    });
    expect(res.isValid).toBe(true);
    expect(res.terminalMethod).toBe('exitMultiple');
    expect(res.terminalValue).toBe(60000000);
  });

  // 28. Preset scenarios
  it('integrates cleanly with mature cash generator preset', () => {
    const preset = DCF_CONFIG.scenarios.matureCashGenerator;
    const res = calculateDcf(preset);
    expect(res.isValid).toBe(true);
    expect(res.intrinsicValuePerShare).toBeGreaterThan(0);
  });

  // 29. Full calculateDcf integration
  it('returns complete structured result object for valid inputs', () => {
    const res = calculateDcf();
    expect(res.isValid).toBe(true);
    expect(res).toHaveProperty('intrinsicValuePerShare');
    expect(res).toHaveProperty('marginOfSafetyPrice');
    expect(res).toHaveProperty('tvContributionPercent');
    expect(res).toHaveProperty('sensitivity');
    expect(res).toHaveProperty('breakdownSchedule');
  });

  // 30. REGRESSION TEST: Explicit FCF values are NOT overwritten by growth shortcut
  it('REGRESSION PROOF: explicit FCF mode respects custom array values and ignores growth shortcut rate', () => {
    const explicitRes = calculateDcf({
      mode: 'explicit',
      explicitFcfs: [50000, 60000, 55000, 70000, 80000],
      fcfGrowthRatePercent: 25, // should be ignored!
    });
    expect(explicitRes.fcfList).toEqual([50000, 60000, 55000, 70000, 80000]);

    const growthRes = calculateDcf({
      mode: 'growth',
      startingFcf: 50000,
      fcfGrowthRatePercent: 25,
    });
    expect(explicitRes.fcfList).not.toEqual(growthRes.fcfList);
  });
});
