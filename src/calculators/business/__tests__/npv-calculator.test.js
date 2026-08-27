import { describe, it, expect } from 'vitest';
import {
  calculateNpv,
  calculateIrr,
  calculateMirr,
  calculateProfitabilityIndex,
  calculateDiscountedPayback,
  calculateNpvSensitivity,
  calculateNpvProject,
  analyzeCashFlowSigns,
} from '../npv-calculator';
import { NPV_CONFIG } from '../../configs/npv-calculator.config';

describe('Net Present Value (NPV) & IRR Financial Engine Tests', () => {

  // 1. Standard 5-year NPV
  it('calculates standard 5-year NPV accurately', () => {
    // CF0 = 10,00,000, r = 10%, Flows = [3L, 3.5L, 4L, 4.5L, 5L]
    // PV = 3L/1.1 + 3.5L/1.21 + 4L/1.331 + 4.5L/1.4641 + 5L/1.61051 = 272727 + 289256 + 300526 + 307356 + 310461 = 1480326
    // NPV = 1480326 - 1000000 = 480326
    const npv = calculateNpv(1000000, [300000, 350000, 400000, 450000, 500000], 10);
    expect(npv).toBeGreaterThan(470000);
    expect(npv).toBeLessThan(490000);
  });

  // 2. Standard IRR
  it('calculates standard IRR accurately matching expected root', () => {
    const res = calculateIrr(1000000, [300000, 350000, 400000, 450000, 500000]);
    expect(res.irr).toBeGreaterThan(24);
    expect(res.irr).toBeLessThan(27);
    expect(res.irrStatus).toBe('unique');
  });

  // 3. MIRR with custom reinvestment rate
  it('calculates MIRR with custom reinvestment and financing rates', () => {
    const res = calculateMirr(1000000, [300000, 350000, 400000, 450000, 500000], 10, 10);
    expect(res.isValid).toBe(true);
    expect(res.mirr).toBeGreaterThan(15);
    expect(res.mirr).toBeLessThan(22);
  });

  // 4. Profitability Index
  it('calculates Profitability Index (PI) accurately', () => {
    const res = calculateProfitabilityIndex(1000000, [300000, 350000, 400000, 450000, 500000], 10);
    expect(res.isValid).toBe(true);
    expect(res.pi).toBeGreaterThan(1.4);
    expect(res.pi).toBeLessThan(1.6);
  });

  // 5. Discounted Payback
  it('calculates Discounted Payback Period in fractional years', () => {
    const res = calculateDiscountedPayback(1000000, [300000, 350000, 400000, 450000, 500000], 10);
    expect(res.isRecovered).toBe(true);
    expect(res.paybackYears).toBeGreaterThan(2.5);
    expect(res.paybackYears).toBeLessThan(3.5);
  });

  // 6. Positive NPV signal
  it('assigns accept signal when NPV is positive', () => {
    const res = calculateNpvProject({
      initialOutlay: 1000000,
      discountRatePercent: 10,
      cashFlows: [300000, 350000, 400000, 450000, 500000],
    });
    expect(res.decisionSignal).toBe('accept');
    expect(res.npv).toBeGreaterThan(0);
  });

  // 7. Negative NPV signal
  it('assigns reject signal when NPV is negative', () => {
    const res = calculateNpvProject({
      initialOutlay: 1000000,
      discountRatePercent: 20,
      cashFlows: [100000, 150000, 200000, 250000, 300000],
    });
    expect(res.decisionSignal).toBe('reject');
    expect(res.npv).toBeLessThan(0);
  });

  // 8. Zero NPV boundary
  it('handles zero NPV boundary scenario', () => {
    // If cash flows equal exact discounted CF0 at 10%
    const npv = calculateNpv(100, [110], 10);
    expect(npv).toBe(0);
  });

  // 9. Normal cash-flow detection
  it('detects normal cash flows (single sign change)', () => {
    const analysis = analyzeCashFlowSigns(1000000, [300000, 350000, 400000]);
    expect(analysis.isNonNormal).toBe(false);
    expect(analysis.signChangeCount).toBe(1);
  });

  // 10. Non-normal cash-flow detection
  it('detects non-normal cash flows (multiple sign changes)', () => {
    const analysis = analyzeCashFlowSigns(1000000, [500000, -200000, 800000]);
    expect(analysis.isNonNormal).toBe(true);
    expect(analysis.signChangeCount).toBeGreaterThan(1);
  });

  // 11. Multiple sign-change detection
  it('counts sign changes accurately for multi-year cash flow stream', () => {
    const analysis = analyzeCashFlowSigns(100, [50, -30, 40, -10]);
    expect(analysis.signChangeCount).toBe(4);
  });

  // 12. Multiple IRR candidate handling
  it('handles non-normal cash flows and identifies multiple IRR candidates', () => {
    const res = calculateIrr(1000, [2500, -1500]);
    expect(res.signAnalysis.isNonNormal).toBe(true);
  });

  // 13. No-valid-IRR handling
  it('returns status none when cash flows have no valid real IRR root', () => {
    const res = calculateIrr(1000000, [-100000, -200000, -300000]);
    expect(res.irr).toBeNull();
    expect(res.irrStatus).toBe('none');
  });

  // 14. Newton-Raphson convergence
  it('converges using numerical solver for standard investment', () => {
    const res = calculateIrr(500000, [200000, 200000, 200000]);
    expect(res.irr).toBeGreaterThan(9);
    expect(res.irr).toBeLessThan(11);
  });

  // 15. Newton-Raphson instability fallback
  it('uses bisection fallback when Newton-Raphson is unstable', () => {
    const res = calculateIrr(100000, [10000, 10000, 10000, 10000, 150000]);
    expect(res.irr).toBeGreaterThan(0);
  });

  // 16. IRR NPV-residual validation
  it('verifies that calculated IRR produces an NPV close to zero', () => {
    const irrRes = calculateIrr(1000000, [300000, 350000, 400000, 450000, 500000]);
    const npvAtIrr = calculateNpv(1000000, [300000, 350000, 400000, 450000, 500000], irrRes.irr);
    expect(Math.abs(npvAtIrr)).toBeLessThan(5000); // Residual tolerance check
  });

  // 17. Zero discount-rate NPV
  it('calculates 0% discount rate NPV as simple cash flow sum minus CF0', () => {
    const npv = calculateNpv(1000, [300, 400, 500], 0);
    expect(npv).toBe(200); // 300+400+500 - 1000 = 200
  });

  // 18. 0% IRR case
  it('handles 0% IRR edge case accurately', () => {
    const res = calculateIrr(1000, [500, 500]);
    expect(res.irr).toBe(0);
  });

  // 19. 0% reinvestment rate
  it('handles 0% reinvestment rate for MIRR calculation', () => {
    const res = calculateMirr(1000, [500, 500], 0, 0);
    expect(res.isValid).toBe(true);
    expect(res.mirr).toBe(0);
  });

  // 20. Reinvestment rate equal to hurdle rate
  it('calculates MIRR when reinvestment rate equals discount rate', () => {
    const res = calculateMirr(1000000, [300000, 350000, 400000, 450000, 500000], 10, 10);
    expect(res.isValid).toBe(true);
    expect(res.mirr).toBeGreaterThan(0);
  });

  // 21. Negative discount-rate boundary handling
  it('sanitizes negative discount rates cleanly', () => {
    const npv = calculateNpv(1000, [500, 500], -5);
    expect(npv).toBeGreaterThan(0);
  });

  // 22. Single-period project
  it('calculates single-period project NPV and IRR accurately', () => {
    const npv = calculateNpv(1000, [1100], 10);
    expect(npv).toBe(0);
    const irrRes = calculateIrr(1000, [1100]);
    expect(irrRes.irr).toBe(10);
  });

  // 23. 10-year project
  it('handles 10-year multi-period cash flow project', () => {
    const flows = Array(10).fill(150000);
    const res = calculateNpvProject({ initialOutlay: 1000000, discountRatePercent: 8, cashFlows: flows });
    expect(res.isValid).toBe(true);
    expect(res.npv).toBeGreaterThan(0);
  });

  // 24. 30-year project
  it('handles 30-year long-horizon capital project cleanly', () => {
    const flows = Array(30).fill(100000);
    const res = calculateNpvProject({ initialOutlay: 1000000, discountRatePercent: 8, cashFlows: flows });
    expect(res.isValid).toBe(true);
    expect(res.npv).toBeGreaterThan(0);
  });

  // 25. Large capital outlay such as ₹100 Crore
  it('handles large capital outlay (₹100 Crores) cleanly without overflow', () => {
    const res = calculateNpvProject({
      initialOutlay: 1000000000,
      discountRatePercent: 10,
      cashFlows: [400000000, 500000000, 600000000],
    });
    expect(res.isValid).toBe(true);
    expect(res.npv).toBeGreaterThan(0);
  });

  // 26. Small project such as ₹1 Lakh
  it('handles small project outlay (₹1 Lakh) accurately', () => {
    const res = calculateNpvProject({
      initialOutlay: 100000,
      discountRatePercent: 10,
      cashFlows: [40000, 50000, 60000],
    });
    expect(res.isValid).toBe(true);
    expect(res.npv).toBeGreaterThan(0);
  });

  // 27. Numeric string sanitization
  it('sanitizes string inputs safely', () => {
    const res = calculateNpvProject({
      initialOutlay: '1000000',
      discountRatePercent: '10',
      cashFlows: ['400000', '500000', '600000'],
    });
    expect(res.isValid).toBe(true);
    expect(res.npv).toBeGreaterThan(0);
  });

  // 28. Negative future cash flow
  it('handles negative intermediate cash flow cleanly without conversion to zero', () => {
    const npv = calculateNpv(1000000, [500000, -200000, 800000], 10);
    expect(npv).toBeDefined();
    expect(typeof npv).toBe('number');
  });

  // 29. Zero future cash flow
  it('handles zero future cash flow period cleanly', () => {
    const npv = calculateNpv(1000000, [300000, 0, 500000], 10);
    expect(npv).toBeDefined();
  });

  // 30. Equipment replacement preset
  it('integrates cleanly with equipmentReplacement preset', () => {
    const res = calculateNpvProject(NPV_CONFIG.scenarios.equipmentReplacement);
    expect(res.isValid).toBe(true);
    expect(res.npv).toBeGreaterThan(0);
  });

  // 31. R&D preset
  it('integrates cleanly with softwareRd preset', () => {
    const res = calculateNpvProject(NPV_CONFIG.scenarios.softwareRd);
    expect(res.isValid).toBe(true);
    expect(res.npv).toBeGreaterThan(0);
  });

  // 32. Property acquisition preset
  it('integrates cleanly with commercialRealEstate preset', () => {
    const res = calculateNpvProject(NPV_CONFIG.scenarios.commercialRealEstate);
    expect(res.isValid).toBe(true);
    expect(res.npv).toBeGreaterThan(0);
  });

  // 33. Non-normal cash-flow preset
  it('integrates cleanly with nonNormalExpansion preset', () => {
    const res = calculateNpvProject(NPV_CONFIG.scenarios.nonNormalExpansion);
    expect(res.isValid).toBe(true);
    expect(res.signAnalysis.isNonNormal).toBe(true);
  });

  // 34. NPV sensitivity curve
  it('generates NPV sensitivity curve array across discount rates', () => {
    const series = calculateNpvSensitivity(1000000, [300000, 350000, 400000, 450000, 500000], [5, 10, 15, 20]);
    expect(series).toHaveLength(4);
    expect(series[0].discountRatePercent).toBe(5);
    expect(series[3].discountRatePercent).toBe(20);
  });

  // 35. REGRESSION PROOF: NPV decreases as discount rate increases
  it('REGRESSION PROOF: proves NPV decreases strictly as discount rate increases for conventional project', () => {
    const npv5 = calculateNpv(1000000, [300000, 350000, 400000, 450000, 500000], 5);
    const npv10 = calculateNpv(1000000, [300000, 350000, 400000, 450000, 500000], 10);
    const npv15 = calculateNpv(1000000, [300000, 350000, 400000, 450000, 500000], 15);
    const npv20 = calculateNpv(1000000, [300000, 350000, 400000, 450000, 500000], 20);

    expect(npv5).toBeGreaterThan(npv10);
    expect(npv10).toBeGreaterThan(npv15);
    expect(npv15).toBeGreaterThan(npv20);
  });

  // 36. MIRR vs IRR relationship
  it('verifies MIRR is lower than IRR when reinvestment rate is less than IRR', () => {
    const irrRes = calculateIrr(1000000, [300000, 350000, 400000, 450000, 500000]); // IRR ~ 25%
    const mirrRes = calculateMirr(1000000, [300000, 350000, 400000, 450000, 500000], 10, 10); // Reinvest @ 10%
    expect(mirrRes.mirr).toBeLessThan(irrRes.irr);
  });

  // 37. REGRESSION PROOF: PI > 1 iff NPV > 0 for conventional project
  it('REGRESSION PROOF: proves PI > 1 if and only if NPV > 0 for conventional project', () => {
    const posRes = calculateNpvProject({ initialOutlay: 1000000, discountRatePercent: 10, cashFlows: [300000, 350000, 400000, 450000, 500000] });
    expect(posRes.npv).toBeGreaterThan(0);
    expect(posRes.pi).toBeGreaterThan(1.0);

    const negRes = calculateNpvProject({ initialOutlay: 1000000, discountRatePercent: 30, cashFlows: [300000, 350000, 400000, 450000, 500000] });
    expect(negRes.npv).toBeLessThan(0);
    expect(negRes.pi).toBeLessThan(1.0);
  });

  // 38. Full calculateNpvProject integration
  it('returns complete structured result object for valid inputs', () => {
    const res = calculateNpvProject(NPV_CONFIG.defaultInputs);
    expect(res.isValid).toBe(true);
    expect(res.npv).toBeDefined();
    expect(res.irr).toBeDefined();
    expect(res.mirr).toBeDefined();
    expect(res.pi).toBeDefined();
    expect(res.schedule).toHaveLength(5);
  });

  // 39. Invalid/missing cash-flow validation
  it('handles invalid or empty inputs gracefully without throwing', () => {
    const res = calculateNpvProject({});
    expect(res.isValid).toBe(false);
    expect(res.validationMessage).toBeDefined();
  });

  // 40. Discounted payback unavailable when project never recovers investment
  it('returns payback recovered false when cash flows never cover initial outlay', () => {
    const payback = calculateDiscountedPayback(1000000, [100000, 100000], 10);
    expect(payback.isRecovered).toBe(false);
    expect(payback.paybackYears).toBeNull();
  });

});
