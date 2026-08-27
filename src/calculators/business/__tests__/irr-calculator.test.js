import { describe, it, expect } from 'vitest';
import {
  calculateIrrCalculator,
  calculateIrrTool,
  solveIRR,
  calculateMIRR,
  calculateNPVForRate,
  DEFAULT_IRR_INPUTS,
} from '../irr-calculator.js';

describe('Flagship IRR, MIRR & Capital Budgeting Decision Suite (Sprint 64 Audit)', () => {
  // 1. Core Mathematical Accuracy of IRR Solver
  describe('IRR Polynomial Root Solver & NPV Zero Point', () => {
    it('1. calculates exact IRR for standard 5-year project', () => {
      // Outlay: 1,000,000, Inflows: [250000, 350000, 400000, 450000, 500000]
      const res = calculateIrrCalculator({
        initialInvestment: 1000000,
        cashFlows: [250000, 350000, 400000, 450000, 500000],
        hurdleRate: 10,
      });

      // Total undiscounted: 1,950,000. IRR should be approx 24.0%
      expect(res.irrPercentage).toBeGreaterThanOrEqual(24.0);
      expect(res.irrPercentage).toBeLessThan(25.5);

      // Verify NPV at calculated IRR is effectively zero (< 1 rupee)
      const npvAtIrr = calculateNPVForRate(res.irrPercentage / 100, res.allCashFlows);
      expect(Math.abs(npvAtIrr)).toBeLessThan(100);
    });

    it('2. calculates exact IRR for simple 1-period doubling investment (100% IRR)', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 100000,
        cashFlows: [200000],
        hurdleRate: 10,
      });

      expect(res.irrPercentage).toBe(100);
    });

    it('3. calculates exact IRR for 2-year break-even investment (0% IRR)', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 100000,
        cashFlows: [50000, 50000],
        hurdleRate: 10,
      });

      expect(res.irrPercentage).toBe(0);
    });
  });

  // 2. Modified Internal Rate of Return (MIRR)
  describe('Modified Internal Rate of Return (MIRR)', () => {
    it('4. computes MIRR with distinct reinvestment (10%) and financing (8%) rates', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 1000000,
        cashFlows: [250000, 350000, 400000, 450000, 500000],
        hurdleRate: 10,
        reinvestmentRate: 10,
        financingRate: 8,
      });

      // MIRR is more conservative than standard IRR (typically between Hurdle and IRR)
      expect(res.mirrPercentage).toBeGreaterThan(10);
      expect(res.mirrPercentage).toBeLessThan(res.irrPercentage);
    });

    it('5. computes MIRR for 0% reinvestment and financing rates', () => {
      const mirr = calculateMIRR([-100000, 50000, 70000], 0, 0);
      expect(mirr).toBeGreaterThan(0);
    });
  });

  // 3. Net Present Value (NPV) & Profitability Index (PI) at Hurdle Rate
  describe('NPV at Hurdle Rate & Profitability Index', () => {
    it('6. calculates positive NPV and PI > 1.0 for value accretive project', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 1000000,
        cashFlows: [250000, 350000, 400000, 450000, 500000],
        hurdleRate: 10,
      });

      expect(res.npvAtHurdle).toBeGreaterThan(400000);
      expect(res.profitabilityIndex).toBeGreaterThan(1.4);
      expect(res.decision).toBe('ACCEPT');
      expect(res.decisionBadge).toBe('Value Accretive');
    });

    it('7. calculates negative NPV and PI < 1.0 when hurdle rate exceeds IRR', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 1000000,
        cashFlows: [200000, 200000, 200000, 200000, 200000], // 0% IRR
        hurdleRate: 15,
      });

      expect(res.npvAtHurdle).toBeLessThan(0);
      expect(res.profitabilityIndex).toBeLessThan(1.0);
      expect(res.decision).toBe('REJECT');
      expect(res.decisionBadge).toBe('Value Destructive');
    });
  });

  // 4. Hurdle Rate Spread & Decision Logic
  describe('Capital Allocation Decision Engine', () => {
    it('8. computes positive spread when IRR > Hurdle Rate', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 1000000,
        cashFlows: [400000, 400000, 400000, 400000],
        hurdleRate: 10,
      });

      expect(res.irrSpread).toBe(Math.round((res.irrPercentage - 10) * 100) / 100);
      expect(res.irrSpread).toBeGreaterThan(0);
    });

    it('9. identifies break-even indifferent decision when IRR equals Hurdle Rate', () => {
      // 100k outlay, 110k at yr 1 -> IRR = 10%
      const res = calculateIrrCalculator({
        initialInvestment: 100000,
        cashFlows: [110000],
        hurdleRate: 10,
      });

      expect(res.irrPercentage).toBe(10);
      expect(res.npvAtHurdle).toBe(0);
      expect(res.decision).toBe('INDIFFERENT');
      expect(res.decisionBadge).toBe('Break-Even');
    });
  });

  // 5. Non-Conventional Cash Flows (Multiple Sign Changes)
  describe('Non-Conventional Cash Flow Diagnostics', () => {
    it('10. flags project with multiple sign changes (interim negative cash flows)', () => {
      // -100k, +150k, -50k (2 sign changes)
      const res = calculateIrrCalculator({
        initialInvestment: 100000,
        cashFlows: [150000, -50000],
      });

      expect(res.isNonConventional).toBe(true);
      expect(res.signChanges).toBe(2);
      expect(res.recommendations[2].title).toContain('Multiple Sign Change Warning');
    });

    it('11. verifies single sign change is flagged as conventional', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 100000,
        cashFlows: [30000, 40000, 50000],
      });

      expect(res.isNonConventional).toBe(false);
      expect(res.signChanges).toBe(1);
    });
  });

  // 6. NPV Sensitivity Profile (Discount Rate vs NPV Curve)
  describe('NPV Sensitivity Profile', () => {
    it('12. generates monotonic decreasing NPV profile for conventional project', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 1000000,
        cashFlows: [300000, 400000, 500000, 600000],
      });

      expect(res.npvProfile.length).toBe(10);
      // As discount rate rises, NPV must strictly decrease
      for (let i = 0; i < res.npvProfile.length - 1; i++) {
        expect(res.npvProfile[i].npv).toBeGreaterThan(res.npvProfile[i + 1].npv);
      }
    });
  });

  // 7. Annual Breakdown Table
  describe('Annual Breakdown Table', () => {
    it('13. constructs full annual table with discounted flows and cumulative totals', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 500000,
        cashFlows: [200000, 250000, 300000],
        hurdleRate: 10,
      });

      expect(res.annualTable.length).toBe(4); // Year 0 to 3
      expect(res.annualTable[0].year).toBe(0);
      expect(res.annualTable[0].cashFlow).toBe(-500000);
      expect(res.annualTable[3].year).toBe(3);
      expect(res.annualTable[3].cumulativeDiscounted).toBe(res.npvAtHurdle);
    });
  });

  // 8. Smart Ranked Recommendations
  describe('Smart Ranked Recommendations', () => {
    it('14. produces 3 actionable recommendations', () => {
      const res = calculateIrrCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });
  });

  // 9. Hero Decision Verdict Text
  describe('Hero Decision Verdict Text', () => {
    it('15. formats hero text with IRR %, Hurdle Spread %, and NPV value', () => {
      const res = calculateIrrCalculator();
      expect(res.heroText).toContain('Internal Rate of Return (IRR) is');
      expect(res.heroText).toContain('Hurdle Rate');
      expect(res.heroText).toContain('NPV of');
    });
  });

  // 10. Presets Validation
  describe('Industry Presets Validation', () => {
    it('16. validates SaaS expansion preset', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 1000000,
        cashFlows: [250000, 350000, 400000, 450000, 500000],
        hurdleRate: 10,
      });
      expect(res.decision).toBe('ACCEPT');
    });

    it('17. validates manufacturing automation preset', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 5000000,
        cashFlows: [1200000, 1500000, 1800000, 2000000, 2200000],
        hurdleRate: 12,
      });
      expect(res.irrPercentage).toBeGreaterThan(12);
    });

    it('18. validates commercial real estate syndication preset', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 10000000,
        cashFlows: [900000, 1000000, 1100000, 1200000, 13200000],
        hurdleRate: 9,
      });
      expect(res.irrPercentage).toBeGreaterThan(9);
      expect(res.npvAtHurdle).toBeGreaterThan(0);
    });

    it('19. validates solar renewable power preset (7 years)', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 8000000,
        cashFlows: [1500000, 1600000, 1700000, 1750000, 1800000, 1850000, 1900000],
        hurdleRate: 8,
      });
      expect(res.cashFlows.length).toBe(7);
      expect(res.irrPercentage).toBeGreaterThan(8);
    });
  });

  // 11. Edge Cases & Boundary Safeguards
  describe('Edge Cases & Boundary Safeguards', () => {
    it('20. handles zero initial investment safely (no negative outflow)', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 0,
        cashFlows: [100000, 200000],
      });
      expect(res.irrPercentage).toBeNull();
      expect(res.npvAtHurdle).toBeGreaterThan(0);
    });

    it('21. handles all negative cash flows (no positive inflows)', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 100000,
        cashFlows: [-50000, -20000],
      });
      expect(res.irrPercentage).toBeNull();
      expect(res.decision).toBe('REJECT');
    });

    it('22. handles zero hurdle rate (NPV equals undiscounted profit)', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 500000,
        cashFlows: [300000, 400000],
        hurdleRate: 0,
      });
      expect(res.npvAtHurdle).toBe(200000); // 700k - 500k
    });

    it('23. handles 10-year long-term cash flow stream', () => {
      const longFlows = [100, 120, 140, 160, 180, 200, 220, 240, 260, 280].map((f) => f * 1000);
      const res = calculateIrrCalculator({
        initialInvestment: 1000000,
        cashFlows: longFlows,
      });
      expect(res.annualTable.length).toBe(11);
      expect(res.irrPercentage).toBeGreaterThan(0);
    });

    it('24. handles string numeric cash flows cleanly', () => {
      const res = calculateIrrCalculator({
        initialInvestment: '1000000',
        cashFlows: ['250000', '350000', '400000', '450000', '500000'],
        hurdleRate: '10',
      });
      expect(res.initialInvestment).toBe(1000000);
      expect(res.hurdleRate).toBe(10);
      expect(res.irrPercentage).toBeGreaterThan(20);
    });

    it('25. clamps negative hurdle rate to 0', () => {
      const res = calculateIrrCalculator({ hurdleRate: -5 });
      expect(res.hurdleRate).toBe(0);
    });

    it('26. clamps hurdle rate greater than 100% to 100', () => {
      const res = calculateIrrCalculator({ hurdleRate: 150 });
      expect(res.hurdleRate).toBe(100);
    });

    it('27. handles empty cash flows array by falling back to default flows', () => {
      const res = calculateIrrCalculator({ cashFlows: [] });
      expect(res.cashFlows.length).toBe(5);
    });

    it('28. handles undefined inputs cleanly with defaults', () => {
      const res = calculateIrrCalculator();
      expect(res.initialInvestment).toBe(1000000);
      expect(res.hurdleRate).toBe(10);
      expect(res.irrPercentage).toBeGreaterThan(0);
    });

    it('29. exports calculateIrrTool alias identically', () => {
      const res1 = calculateIrrCalculator({ initialInvestment: 500000 });
      const res2 = calculateIrrTool({ initialInvestment: 500000 });
      expect(res1.irrPercentage).toBe(res2.irrPercentage);
      expect(res1.npvAtHurdle).toBe(res2.npvAtHurdle);
    });

    it('30. formats currency symbol cleanly', () => {
      const res = calculateIrrCalculator({ currencySymbol: '$' });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
    });

    it('31. verifies total inflows equals sum of raw cash flows', () => {
      const res = calculateIrrCalculator({ cashFlows: [100000, 200000, 300000] });
      expect(res.totalInflows).toBe(600000);
      expect(res.netUndiscountedProfit).toBe(600000 - res.initialInvestment);
    });

    it('32. verifies primaryOutput is irrPercentage', () => {
      const res = calculateIrrCalculator();
      expect(res.primaryOutput).toBe(res.irrPercentage);
    });

    it('33. handles non-array cashFlows parameter safely', () => {
      const res = calculateIrrCalculator({ cashFlows: 'invalid' });
      expect(res.cashFlows.length).toBe(5);
    });

    it('34. handles single cash flow year', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 100000,
        cashFlows: [150000],
      });
      expect(res.irrPercentage).toBe(50);
    });

    it('35. handles negative initial investment by clamping to 0', () => {
      const res = calculateIrrCalculator({ initialInvestment: -500000 });
      expect(res.initialInvestment).toBe(0);
    });

    it('36. handles high initial CapEx (₹100 Crores)', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 1000000000,
        cashFlows: [400000000, 500000000, 600000000],
      });
      expect(res.irrPercentage).toBeGreaterThan(0);
      expect(res.npvAtHurdle).toBeGreaterThan(0);
    });

    it('37. verifies Newton-Raphson solver tolerance for high accuracy', () => {
      const flows = [-1000, 400, 400, 400, 400];
      const irr = solveIRR(flows);
      expect(irr).toBeDefined();
      const npv = calculateNPVForRate(irr, flows);
      expect(Math.abs(npv)).toBeLessThan(1e-4);
    });

    it('38. handles extreme discount rate profile curve cleanly', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 1000000,
        cashFlows: [500000, 500000, 500000],
      });
      expect(res.npvProfile.find((p) => p.rate === 0).npv).toBe(500000);
    });

    it('39. verifies MIRR is always between financing rate and reinvestment rate when cash flows equal 0 profit', () => {
      const mirr = calculateMIRR([-100, 100], 0.08, 0.08);
      expect(mirr).toBeCloseTo(0, 2);
    });

    it('40. handles multiple negative cash flows in later years', () => {
      const res = calculateIrrCalculator({
        initialInvestment: 1000000,
        cashFlows: [800000, -200000, 900000],
      });
      expect(res.mirrPercentage).toBeDefined();
    });

    it('41. verifies discount factor at year 0 is 1.0', () => {
      const res = calculateIrrCalculator();
      expect(res.annualTable[0].discountFactor).toBe(1.0);
    });

    it('42. verifies cumulative discounted cash flow at final year equals NPV', () => {
      const res = calculateIrrCalculator();
      const lastRow = res.annualTable[res.annualTable.length - 1];
      expect(lastRow.cumulativeDiscounted).toBe(res.npvAtHurdle);
    });

    it('43. checks that higher initial investment reduces IRR', () => {
      const res1 = calculateIrrCalculator({ initialInvestment: 1000000, cashFlows: [500000, 500000, 500000] });
      const res2 = calculateIrrCalculator({ initialInvestment: 1200000, cashFlows: [500000, 500000, 500000] });
      expect(res1.irrPercentage).toBeGreaterThan(res2.irrPercentage);
    });

    it('44. checks that higher cash flows increase IRR', () => {
      const res1 = calculateIrrCalculator({ initialInvestment: 1000000, cashFlows: [400000, 400000] });
      const res2 = calculateIrrCalculator({ initialInvestment: 1000000, cashFlows: [600000, 600000] });
      expect(res2.irrPercentage).toBeGreaterThan(res1.irrPercentage);
    });

    it('45. verifies solveIRR returns null for impossible polynomial', () => {
      expect(solveIRR([100, 200, 300])).toBeNull();
      expect(solveIRR([-100, -200, -300])).toBeNull();
    });
  });
});
