import { describe, it, expect } from 'vitest';
import {
  formatPaybackDuration,
  calculateSimplePayback,
  calculateDiscountedPayback,
  calculateCumulativeCashFlows,
  calculateNpvAndPi,
  calculatePaybackDetails,
} from '../payback-period-calculator';
import { PAYBACK_CONFIG } from '../../configs/payback-period-calculator.config';

describe('Payback Period Engine Tests (Simple & Discounted)', () => {

  // 1. Equal annual cash flows simple payback
  it('calculates simple payback period for equal annual cash flows correctly', () => {
    const res = calculateSimplePayback({ initialInvestment: 1000000, annualCashFlows: [250000, 250000, 250000, 250000] });
    expect(res.isRecovered).toBe(true);
    expect(res.simplePaybackYears).toBe(4.0);
    expect(res.simplePaybackFormatted).toBe('4 years');
  });

  // 2. Uneven annual cash flows simple payback
  it('calculates simple payback period for uneven annual cash flows', () => {
    const res = calculateSimplePayback({ initialInvestment: 500000, annualCashFlows: [150000, 200000, 250000, 300000] });
    expect(res.isRecovered).toBe(true);
    // Year 1: 150k (350k needed), Year 2: 350k total (150k needed), Year 3: 250k flow -> 150/250 = 0.6. Total = 2.6 yrs
    expect(res.simplePaybackYears).toBe(2.6);
  });

  // 3. Recovery in first year
  it('handles investment recovery within the first year', () => {
    const res = calculateSimplePayback({ initialInvestment: 100000, annualCashFlows: [200000, 200000] });
    expect(res.isRecovered).toBe(true);
    expect(res.simplePaybackYears).toBe(0.5);
    expect(res.simplePaybackFormatted).toBe('6 months');
  });

  // 4. Recovery exactly at year boundary
  it('handles recovery exactly at year boundary', () => {
    const res = calculateSimplePayback({ initialInvestment: 600000, annualCashFlows: [200000, 400000, 300000] });
    expect(res.isRecovered).toBe(true);
    expect(res.simplePaybackYears).toBe(2.0);
    expect(res.simplePaybackFormatted).toBe('2 years');
  });

  // 5. Fractional year recovery
  it('calculates fractional year recovery accurately', () => {
    const res = calculateSimplePayback({ initialInvestment: 1000000, annualCashFlows: [400000, 400000, 400000] });
    // Year 1: 400k, Year 2: 800k (200k needed out of 400k) -> 2.5 years
    expect(res.simplePaybackYears).toBe(2.5);
    expect(res.simplePaybackFormatted).toBe('2 yrs 6 mos');
  });

  // 6. Years and months formatting string
  it('formats duration strings into human-readable years and months', () => {
    expect(formatPaybackDuration(3.25)).toBe('3 yrs 3 mos');
    expect(formatPaybackDuration(1.0)).toBe('1 year');
    expect(formatPaybackDuration(0.5)).toBe('6 months');
    expect(formatPaybackDuration(null)).toBe('Not recovered within timeline');
  });

  // 7. Discounted payback calculation (10% discount rate)
  it('calculates discounted payback period at 10% discount rate', () => {
    const res = calculateDiscountedPayback({ initialInvestment: 1000000, annualCashFlows: [400000, 400000, 400000, 400000], discountRatePct: 10 });
    expect(res.isRecovered).toBe(true);
    expect(res.discountedPaybackYears).toBeGreaterThan(2.5); // Takes longer than simple payback
  });

  // 8. Discounted payback calculation (15% discount rate)
  it('takes longer to recover investment under higher 15% discount rate', () => {
    const d10 = calculateDiscountedPayback({ initialInvestment: 1000000, annualCashFlows: [400000, 400000, 400000, 400000], discountRatePct: 10 });
    const d15 = calculateDiscountedPayback({ initialInvestment: 1000000, annualCashFlows: [400000, 400000, 400000, 400000], discountRatePct: 15 });
    expect(d15.discountedPaybackYears).toBeGreaterThan(d10.discountedPaybackYears);
  });

  // 9. Zero discount rate
  it('produces identical simple and discounted payback when discount rate is 0%', () => {
    const simple = calculateSimplePayback({ initialInvestment: 1000000, annualCashFlows: [300000, 400000, 500000] });
    const discounted = calculateDiscountedPayback({ initialInvestment: 1000000, annualCashFlows: [300000, 400000, 500000], discountRatePct: 0 });
    expect(discounted.discountedPaybackYears).toBe(simple.simplePaybackYears);
  });

  // 10. Negative annual cash flows in intermediate years
  it('handles negative cash flows in intermediate operating years correctly', () => {
    const res = calculateSimplePayback({ initialInvestment: 500000, annualCashFlows: [300000, -100000, 400000, 200000] });
    // Year 1: 300k, Year 2: 200k total, Year 3: 400k flow -> needs 300k out of 400k -> 2.75 yrs
    expect(res.isRecovered).toBe(true);
    expect(res.simplePaybackYears).toBe(2.75);
  });

  // 11. Zero cash flow period
  it('handles zero cash flow period in a year cleanly', () => {
    const res = calculateSimplePayback({ initialInvestment: 500000, annualCashFlows: [300000, 0, 300000] });
    expect(res.isRecovered).toBe(true);
    expect(res.simplePaybackYears).toBe(2.67);
  });

  // 12. Unrecovered investment
  it('returns isRecovered = false when investment is not recovered within timeline', () => {
    const res = calculateSimplePayback({ initialInvestment: 1000000, annualCashFlows: [200000, 200000, 200000] });
    expect(res.isRecovered).toBe(false);
    expect(res.simplePaybackYears).toBeNull();
    expect(res.simplePaybackFormatted).toBe('Not recovered within timeline');
  });

  // 13. NPV calculation (equal flows)
  it('calculates Net Present Value (NPV) correctly for equal flows', () => {
    const res = calculateNpvAndPi({ initialInvestment: 1000000, annualCashFlows: [300000, 300000, 300000, 300000, 300000], discountRatePct: 10 });
    expect(res.npv).toBeGreaterThan(0);
    expect(res.pvInflows).toBeGreaterThan(1000000);
  });

  // 14. NPV calculation (uneven flows)
  it('calculates Net Present Value (NPV) correctly for uneven flows', () => {
    const res = calculateNpvAndPi({ initialInvestment: 1000000, annualCashFlows: [250000, 350000, 400000, 450000, 500000], discountRatePct: 10 });
    expect(res.npv).toBeGreaterThan(0);
  });

  // 15. NPV at 0% discount rate
  it('calculates NPV at 0% discount rate as total inflows minus initial investment', () => {
    const res = calculateNpvAndPi({ initialInvestment: 1000000, annualCashFlows: [300000, 400000, 500000], discountRatePct: 0 });
    expect(res.npv).toBe(200000); // 12L - 10L = 2L
  });

  // 16. Profitability Index (PI) calculation
  it('calculates Profitability Index (PI) correctly', () => {
    const res = calculateNpvAndPi({ initialInvestment: 1000000, annualCashFlows: [300000, 300000, 300000, 300000, 300000], discountRatePct: 10 });
    expect(res.pi).toBeGreaterThan(1.0);
  });

  // 17. Target cutoff threshold comparison (within target)
  it('identifies when payback is within modeled target cutoff', () => {
    const res = calculatePaybackDetails({
      initialInvestment: 1000000,
      cashFlowType: 'equal',
      annualCashFlow: 400000,
      projectLifeYears: 5,
      targetPaybackYears: 3.0,
    });
    expect(res.simplePaybackWithinTarget).toBe(true); // 2.5 yrs <= 3.0 yrs
  });

  // 18. Target cutoff threshold comparison (beyond target)
  it('identifies when payback exceeds modeled target cutoff', () => {
    const res = calculatePaybackDetails({
      initialInvestment: 1000000,
      cashFlowType: 'equal',
      annualCashFlow: 250000,
      projectLifeYears: 5,
      targetPaybackYears: 3.0,
    });
    expect(res.simplePaybackWithinTarget).toBe(false); // 4.0 yrs > 3.0 yrs
  });

  // 19. Target cutoff exact match
  it('handles exact match on target payback cutoff', () => {
    const res = calculatePaybackDetails({
      initialInvestment: 1000000,
      cashFlowType: 'equal',
      annualCashFlow: 500000,
      projectLifeYears: 4,
      targetPaybackYears: 2.0,
    });
    expect(res.simplePaybackWithinTarget).toBe(true);
  });

  // 20. Equipment Upgrade preset integration
  it('integrates equipmentUpgrade preset cleanly', () => {
    const res = calculatePaybackDetails(PAYBACK_CONFIG.scenarios.equipmentUpgrade);
    expect(res.isValid).toBe(true);
    expect(res.simplePaybackYears).toBe(3.33);
  });

  // 21. Software Automation preset integration
  it('integrates softwareAutomation preset cleanly', () => {
    const res = calculatePaybackDetails(PAYBACK_CONFIG.scenarios.softwareAutomation);
    expect(res.isValid).toBe(true);
    expect(res.isSimpleRecovered).toBe(true);
  });

  // 22. Retail Expansion preset integration
  it('integrates retailExpansion preset cleanly', () => {
    const res = calculatePaybackDetails(PAYBACK_CONFIG.scenarios.retailExpansion);
    expect(res.isValid).toBe(true);
    expect(res.npv).toBeGreaterThan(0);
  });

  // 23. Solar Installation preset integration
  it('integrates solarInstallation preset cleanly', () => {
    const res = calculatePaybackDetails(PAYBACK_CONFIG.scenarios.solarInstallation);
    expect(res.isValid).toBe(true);
    expect(res.simplePaybackYears).toBe(5.0);
  });

  // 24. Zero initial investment validation
  it('returns isValid = false when initial investment is zero', () => {
    const res = calculatePaybackDetails({ initialInvestment: 0, annualCashFlow: 300000 });
    expect(res.isValid).toBe(false);
  });

  // 25. Zero cash flow validation
  it('returns isValid = false when cash flow array contains only zeros', () => {
    const res = calculatePaybackDetails({ initialInvestment: 1000000, cashFlowType: 'equal', annualCashFlow: 0 });
    expect(res.isValid).toBe(false);
  });

  // 26. Small investment (₹10,000)
  it('handles small investment amount (₹10,000) safely', () => {
    const res = calculatePaybackDetails({ initialInvestment: 10000, annualCashFlow: 4000 });
    expect(res.isValid).toBe(true);
    expect(res.simplePaybackYears).toBe(2.5);
  });

  // 27. Large corporate investment (₹100 Crores)
  it('handles large corporate investment (₹100 Crores) safely', () => {
    const res = calculatePaybackDetails({ initialInvestment: 1000000000, annualCashFlow: 300000000, projectLifeYears: 5 });
    expect(res.isValid).toBe(true);
    expect(res.simplePaybackYears).toBe(3.33);
  });

  // 28. Numeric string input sanitization
  it('sanitizes numeric string inputs safely', () => {
    const res = calculatePaybackDetails({ initialInvestment: '1000000', annualCashFlow: '250000', discountRatePct: '10' });
    expect(res.isValid).toBe(true);
    expect(res.initialInvestment).toBe(1000000);
  });

  // 29. Negative initial investment clamping
  it('clamps negative initial investment to zero safely returning isValid = false', () => {
    const res = calculatePaybackDetails({ initialInvestment: -500000, annualCashFlow: 100000 });
    expect(res.isValid).toBe(false);
  });

  // 30. High discount rate (30%)
  it('handles high discount rate (30%) safely', () => {
    const res = calculatePaybackDetails({ initialInvestment: 1000000, annualCashFlow: 400000, discountRatePct: 30 });
    expect(res.isValid).toBe(true);
    expect(res.npv).toBeDefined();
  });

  // 31. Timeline cumulative cash flow generation
  it('generates accurate year-by-year cumulative cash flow timeline', () => {
    const timeline = calculateCumulativeCashFlows({ initialInvestment: 1000000, annualCashFlows: [300000, 400000, 500000], discountRatePct: 10 });
    expect(timeline).toHaveLength(3);
    expect(timeline[0].year).toBe(1);
    expect(timeline[0].cumulativeNominal).toBe(300000);
    expect(timeline[1].cumulativeNominal).toBe(700000);
    expect(timeline[2].cumulativeNominal).toBe(1200000);
  });

  // 32. Unrecovered initial investment timeline values
  it('tracks unrecovered initial investment correctly in timeline', () => {
    const timeline = calculateCumulativeCashFlows({ initialInvestment: 1000000, annualCashFlows: [300000, 400000, 500000], discountRatePct: 0 });
    expect(timeline[0].unrecoveredNominal).toBe(700000);
    expect(timeline[1].unrecoveredNominal).toBe(300000);
    expect(timeline[2].unrecoveredNominal).toBe(0);
  });

  // 33. REGRESSION PROOF: Initial investment is NOT double-discounted
  it('REGRESSION PROOF: Initial investment is subtracted once from present value of inflows', () => {
    const res = calculateNpvAndPi({ initialInvestment: 1000000, annualCashFlows: [1100000], discountRatePct: 10 });
    // PV of Year 1 11L at 10% = 10L. NPV = 10L - 10L = 0
    expect(res.pvInflows).toBe(1000000);
    expect(res.npv).toBe(0);
  });

  // 34. REGRESSION PROOF: Negative annual cash flows remain negative
  it('REGRESSION PROOF: Intermediate negative annual cash flows remain negative in calculations', () => {
    const timeline = calculateCumulativeCashFlows({ initialInvestment: 500000, annualCashFlows: [200000, -50000, 300000], discountRatePct: 0 });
    expect(timeline[1].cashFlow).toBe(-50000);
    expect(timeline[1].cumulativeNominal).toBe(150000);
  });

  // 35. REGRESSION PROOF: Discounted payback uses PV of cash flows, taking longer than simple payback
  it('REGRESSION PROOF: Discounted payback uses PV of cash flows, taking longer than simple payback', () => {
    const simple = calculateSimplePayback({ initialInvestment: 1000000, annualCashFlows: [400000, 400000, 400000, 400000] });
    const discounted = calculateDiscountedPayback({ initialInvestment: 1000000, annualCashFlows: [400000, 400000, 400000, 400000], discountRatePct: 10 });
    expect(simple.simplePaybackYears).toBeLessThan(discounted.discountedPaybackYears);
  });

  // 36. REGRESSION PROOF: Unrecovered investment returns explicit unrecovered state
  it('REGRESSION PROOF: Investment that is never recovered returns paybackYears = null and isRecovered = false', () => {
    const res = calculateDiscountedPayback({ initialInvestment: 1000000, annualCashFlows: [100000, 100000], discountRatePct: 10 });
    expect(res.isRecovered).toBe(false);
    expect(res.discountedPaybackYears).toBeNull();
    expect(res.discountedPaybackFormatted).toBe('Not recovered within timeline');
  });

  // 37. REGRESSION PROOF: Fractional payback is calculated from actual recovery period rather than rounded annual values
  it('REGRESSION PROOF: Fractional payback preserves exact fractional year precision', () => {
    const res = calculateSimplePayback({ initialInvestment: 1000000, annualCashFlows: [600000, 800000] });
    // Year 1 recovers 600k (400k needed out of 800k in Year 2) -> 1 + (400k/800k) = 1.5 years
    expect(res.simplePaybackYears).toBe(1.5);
  });

  // 38. Full structured result object verification
  it('verifies all expected properties in master calculatePaybackDetails result', () => {
    const res = calculatePaybackDetails(PAYBACK_CONFIG.defaultInputs);
    expect(res).toHaveProperty('isValid');
    expect(res).toHaveProperty('initialInvestment');
    expect(res).toHaveProperty('simplePaybackYears');
    expect(res).toHaveProperty('simplePaybackFormatted');
    expect(res).toHaveProperty('discountedPaybackYears');
    expect(res).toHaveProperty('discountedPaybackFormatted');
    expect(res).toHaveProperty('npv');
    expect(res).toHaveProperty('pi');
    expect(res).toHaveProperty('timeline');
  });

  // 39. Direct calculateSimplePayback function tests
  it('calculates simple payback directly via calculateSimplePayback helper', () => {
    const res = calculateSimplePayback({ initialInvestment: 500000, annualCashFlows: [250000, 250000] });
    expect(res.simplePaybackYears).toBe(2.0);
  });

  // 40. Direct calculateDiscountedPayback function tests
  it('calculates discounted payback directly via calculateDiscountedPayback helper', () => {
    const res = calculateDiscountedPayback({ initialInvestment: 500000, annualCashFlows: [250000, 250000, 250000], discountRatePct: 10 });
    expect(res.isRecovered).toBe(true);
  });

  // 41. Direct calculateCumulativeCashFlows function tests
  it('generates cumulative timeline array directly via helper', () => {
    const flows = calculateCumulativeCashFlows({ initialInvestment: 500000, annualCashFlows: [200000, 300000], discountRatePct: 10 });
    expect(flows).toHaveLength(2);
  });

  // 42. Direct calculateNpvAndPi function tests
  it('calculates NPV and PI directly via calculateNpvAndPi helper', () => {
    const res = calculateNpvAndPi({ initialInvestment: 500000, annualCashFlows: [300000, 300000], discountRatePct: 10 });
    expect(res.npv).toBeGreaterThan(0);
    expect(res.pi).toBeGreaterThan(1.0);
  });

  // 43. FormatPaybackDuration function helper tests
  it('tests edge cases of formatPaybackDuration helper function', () => {
    expect(formatPaybackDuration(0)).toBe('0 years (Immediate recovery)');
    expect(formatPaybackDuration(-1)).toBe('Not recovered within timeline');
    expect(formatPaybackDuration(2.08333)).toBe('2 yrs 1 mo');
  });

  // 44. Uneven cash flow padding up to project life
  it('pads uneven cash flow arrays up to projectLifeYears when fewer values are provided', () => {
    const res = calculatePaybackDetails({
      initialInvestment: 1000000,
      cashFlowType: 'uneven',
      unevenCashFlows: [300000, 400000], // 2 values
      projectLifeYears: 5,
    });
    expect(res.annualCashFlows).toHaveLength(5);
    expect(res.annualCashFlows[2]).toBe(0);
  });

  // 45. Extreme negative cash flow resulting in negative NPV
  it('handles negative NPV when cash flows fail to cover initial investment', () => {
    const res = calculatePaybackDetails({
      initialInvestment: 1000000,
      cashFlowType: 'equal',
      annualCashFlow: 150000, // Total = 7.5L over 5 yrs < 10L
      projectLifeYears: 5,
      discountRatePct: 10,
    });
    expect(res.isValid).toBe(true);
    expect(res.npv).toBeLessThan(0);
    expect(res.isSimpleRecovered).toBe(false);
  });

});
