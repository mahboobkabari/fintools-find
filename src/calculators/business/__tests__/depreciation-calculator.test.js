import { describe, it, expect } from 'vitest';
import { calculateDepreciationCalculator, calculateDepreciationTool, ASSET_CLASS_STANDARDS } from '../depreciation-calculator.js';

describe('Flagship Asset Depreciation & Amortization Decision Suite (Sprint 61 Audit)', () => {
  // 1. Straight-Line Method (SLM) Benchmarks
  describe('Straight-Line Method (SLM) Accounting Standards', () => {
    it('1. calculates standard SLM for ₹5,00,000 asset over 5 years with ₹50,000 salvage', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 500000,
        salvageValue: 50000,
        usefulLife: 5,
        method: 'slm',
        taxRate: 25,
      });

      expect(res.assetCost).toBe(500000);
      expect(res.salvageValue).toBe(50000);
      expect(res.depreciableAmount).toBe(450000);
      expect(res.firstYearDepreciation).toBe(90000); // 450,000 / 5
      expect(res.primaryOutput).toBe(90000);
      expect(res.schedule.length).toBe(5);
      expect(res.schedule[0].depreciationExpense).toBe(90000);
      expect(res.schedule[0].taxShield).toBe(22500); // 90,000 * 25%
      expect(res.schedule[4].closingBookValue).toBe(50000); // Equals salvage
      expect(res.schedule[4].accumulatedDepreciation).toBe(450000);
    });

    it('2. calculates SLM for asset with ₹0 salvage value (100% write-off)', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 1000000,
        salvageValue: 0,
        usefulLife: 10,
        method: 'slm',
      });

      expect(res.depreciableAmount).toBe(1000000);
      expect(res.firstYearDepreciation).toBe(100000);
      expect(res.schedule[9].closingBookValue).toBe(0);
      expect(res.schedule[9].accumulatedDepreciation).toBe(1000000);
    });

    it('3. calculates 1-year immediate SLM expensing', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 150000,
        salvageValue: 15000,
        usefulLife: 1,
        method: 'slm',
      });

      expect(res.firstYearDepreciation).toBe(135000);
      expect(res.schedule.length).toBe(1);
      expect(res.schedule[0].closingBookValue).toBe(15000);
    });
  });

  // 2. Written Down Value (WDV / Declining Balance) Benchmarks
  describe('Written Down Value (WDV) Depreciation Rules', () => {
    it('4. calculates WDV for ₹5,00,000 asset over 5 years with ₹50,000 salvage', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 500000,
        salvageValue: 50000,
        usefulLife: 5,
        method: 'wdv',
      });

      expect(res.schedule.length).toBe(5);
      // WDV rate = 1 - (50,000 / 500,000)^(1/5) = 1 - 0.1^0.2 = ~36.904%
      // Year 1 dep = 500,000 * 36.904% = ~184,521
      expect(res.firstYearDepreciation).toBeGreaterThan(180000);
      expect(res.firstYearDepreciation).toBeLessThan(190000);
      // Ensure monotonic decline in annual depreciation
      for (let i = 0; i < res.schedule.length - 1; i++) {
        expect(res.schedule[i].depreciationExpense).toBeGreaterThanOrEqual(res.schedule[i + 1].depreciationExpense);
      }
      expect(res.schedule[4].closingBookValue).toBeCloseTo(50000, -2);
    });

    it('5. prevents WDV from depreciating below salvage value', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 200000,
        salvageValue: 50000,
        usefulLife: 3,
        method: 'wdv',
      });

      res.schedule.forEach((row) => {
        expect(row.closingBookValue).toBeGreaterThanOrEqual(50000);
      });
    });
  });

  // 3. Double Declining Balance (DDB) Benchmarks
  describe('Double Declining Balance (DDB) Mechanics', () => {
    it('6. calculates DDB for ₹10,00,000 asset over 5 years (40% annual rate)', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 1000000,
        salvageValue: 50000,
        usefulLife: 5,
        method: 'ddb',
        taxRate: 30,
      });

      // DDB rate = 2 / 5 = 40%
      // Year 1 dep = 1,000,000 * 40% = 400,000
      expect(res.firstYearDepreciation).toBe(400000);
      expect(res.schedule[0].taxShield).toBe(120000); // 400,000 * 30%
      expect(res.schedule[0].closingBookValue).toBe(600000);
      // Year 2 dep = 600,000 * 40% = 240,000
      expect(res.schedule[1].depreciationExpense).toBe(240000);
    });

    it('7. DDB stops depreciating once salvage value is reached', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 100000,
        salvageValue: 40000,
        usefulLife: 4,
        method: 'ddb',
      });

      // DDB rate = 50%
      // Y1 dep = 50,000 -> book = 50,000
      // Y2 dep max = 50,000 - 40,000 = 10,000 -> book = 40,000
      expect(res.schedule[0].depreciationExpense).toBe(50000);
      expect(res.schedule[1].depreciationExpense).toBe(10000);
      expect(res.schedule[1].closingBookValue).toBe(40000);
      expect(res.schedule[2].depreciationExpense).toBe(0);
      expect(res.schedule[3].depreciationExpense).toBe(0);
    });
  });

  // 4. Sum-of-the-Years'-Digits (SYD) Benchmarks
  describe("Sum-of-the-Years'-Digits (SYD) Mechanics", () => {
    it('8. calculates SYD for ₹6,00,000 asset over 5 years with ₹1,00,000 salvage', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 600000,
        salvageValue: 100000,
        usefulLife: 5,
        method: 'syd',
      });

      // Sum of years = 5*(6)/2 = 15
      // Depreciable base = 500,000
      // Y1 = 5/15 * 500,000 = 166,667
      expect(res.firstYearDepreciation).toBe(166667);
      // Y5 = 1/15 * 500,000 = 33,333
      expect(res.schedule[4].depreciationExpense).toBe(33333);
      expect(res.schedule[4].closingBookValue).toBe(100000);
      expect(res.schedule[4].accumulatedDepreciation).toBe(500000);
    });
  });

  // 5. Units of Production (Activity Method) Benchmarks
  describe('Units of Production Method', () => {
    it('9. calculates Units of Production depreciation based on output', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 1000000,
        salvageValue: 100000,
        usefulLife: 5,
        method: 'units',
        totalUnits: 100000,
        firstYearUnits: 30000,
      });

      // Dep per unit = 900,000 / 100,000 = ₹9 per unit
      // Y1 dep = 30,000 * 9 = 270,000
      expect(res.firstYearDepreciation).toBe(270000);
      expect(res.schedule[0].depreciationExpense).toBe(270000);
      expect(res.schedule[0].closingBookValue).toBe(730000);
    });
  });

  // 6. Corporate Tax Shield & Cash Flow Benefits
  describe('Corporate Tax Shield Modeling', () => {
    it('10. calculates 30% tax shield on SLM schedule', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 1000000,
        salvageValue: 0,
        usefulLife: 5,
        method: 'slm',
        taxRate: 30,
      });

      // Annual dep = 200,000 -> Annual tax shield = 60,000
      expect(res.schedule[0].taxShield).toBe(60000);
      expect(res.totalTaxShield).toBe(300000); // 60,000 * 5
    });

    it('11. handles 0% corporate tax rate (no tax shield)', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 500000,
        taxRate: 0,
      });

      expect(res.totalTaxShield).toBe(0);
      res.schedule.forEach((row) => {
        expect(row.taxShield).toBe(0);
      });
    });
  });

  // 7. Multi-Method Comparison Matrix
  describe('Multi-Method Comparison Matrix', () => {
    it('12. generates comparative results for SLM, WDV, DDB, and SYD', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 1000000,
        salvageValue: 100000,
        usefulLife: 5,
      });

      expect(res.methodComparison.length).toBe(4);
      const slmComp = res.methodComparison.find((m) => m.id === 'slm');
      const ddbComp = res.methodComparison.find((m) => m.id === 'ddb');
      expect(slmComp).toBeDefined();
      expect(ddbComp).toBeDefined();
      // DDB initial depreciation should be higher than SLM
      expect(ddbComp.year1Dep).toBeGreaterThan(slmComp.year1Dep);
    });
  });

  // 8. Smart Recommendations & Decision Insights
  describe('Smart Recommendations & Decision Insights', () => {
    it('13. generates accelerated tax shield recommendation', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 1000000,
        salvageValue: 100000,
        usefulLife: 5,
      });

      const topRec = res.recommendations.find((r) => r.title.includes('Tax Shield'));
      expect(topRec).toBeDefined();
      expect(topRec.savings).toBeGreaterThan(0);
    });

    it('14. generates Sec 32 vs Companies Act compliance guidance', () => {
      const res = calculateDepreciationCalculator();
      const compRec = res.recommendations.find((r) => r.title.includes('Tax Compliance'));
      expect(compRec).toBeDefined();
      expect(compRec.action).toContain('Section 32');
    });
  });

  // 9. Hero Decision Verdict Text
  describe('Hero Decision Verdict Text', () => {
    it('15. formats hero verdict text with asset cost, Y1 depreciation, and tax shield', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 500000,
        salvageValue: 50000,
        usefulLife: 5,
        method: 'slm',
      });

      expect(res.heroText).toContain('₹5,00,000');
      expect(res.heroText).toContain('₹90,000');
      expect(res.heroText).toContain('Straight-Line Method');
    });
  });

  // 10. Edge Cases, Zero Values & Boundaries
  describe('Edge Cases & Boundary Handling', () => {
    it('16. handles ₹0 asset cost gracefully', () => {
      const res = calculateDepreciationCalculator({ assetCost: 0 });
      expect(res.assetCost).toBe(0);
      expect(res.depreciableAmount).toBe(0);
      expect(res.firstYearDepreciation).toBe(0);
      expect(res.totalTaxShield).toBe(0);
    });

    it('17. clamps negative asset cost to 0', () => {
      const res = calculateDepreciationCalculator({ assetCost: -500000 });
      expect(res.assetCost).toBe(0);
      expect(res.firstYearDepreciation).toBe(0);
    });

    it('18. clamps salvage value if entered higher than asset cost', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 500000,
        salvageValue: 600000, // Higher than cost
      });

      expect(res.salvageValue).toBe(500000); // Clamped to cost
      expect(res.depreciableAmount).toBe(0);
      expect(res.firstYearDepreciation).toBe(0);
    });

    it('19. clamps useful life to range [1, 50] years', () => {
      const res1 = calculateDepreciationCalculator({ usefulLife: 0 });
      expect(res1.usefulLife).toBe(1);

      const res2 = calculateDepreciationCalculator({ usefulLife: 100 });
      expect(res2.usefulLife).toBe(50);
    });

    it('20. handles large corporate plant asset (₹50 Crores over 30 years)', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 500000000,
        salvageValue: 50000000,
        usefulLife: 30,
        method: 'slm',
        taxRate: 25,
      });

      expect(res.depreciableAmount).toBe(450000000);
      expect(res.firstYearDepreciation).toBe(15000000); // 45Cr / 30 = 1.5Cr
      expect(res.schedule[29].closingBookValue).toBe(50000000);
    });

    it('21. ensures mathematical balance invariant: opening - dep = closing for all years', () => {
      const methods = ['slm', 'wdv', 'ddb', 'syd'];
      methods.forEach((m) => {
        const res = calculateDepreciationCalculator({
          assetCost: 800000,
          salvageValue: 80000,
          usefulLife: 5,
          method: m,
        });

        res.schedule.forEach((row) => {
          expect(row.closingBookValue).toBe(row.openingBookValue - row.depreciationExpense);
        });
      });
    });

    it('22. ensures accumulated depreciation monotonically increases for all methods', () => {
      const methods = ['slm', 'wdv', 'ddb', 'syd'];
      methods.forEach((m) => {
        const res = calculateDepreciationCalculator({
          assetCost: 600000,
          salvageValue: 60000,
          usefulLife: 6,
          method: m,
        });

        for (let i = 0; i < res.schedule.length - 1; i++) {
          expect(res.schedule[i + 1].accumulatedDepreciation).toBeGreaterThanOrEqual(res.schedule[i].accumulatedDepreciation);
        }
      });
    });
  });

  // 11. Framework Compatibility & Aliases
  describe('Framework Compatibility & Aliases', () => {
    it('23. defaults to 5 Lakhs asset over 5 years when called with no parameters', () => {
      const res = calculateDepreciationCalculator();
      expect(res.assetCost).toBe(500000);
      expect(res.salvageValue).toBe(50000);
      expect(res.usefulLife).toBe(5);
      expect(res.firstYearDepreciation).toBe(90000);
    });

    it('24. exports calculateDepreciationTool alias identically', () => {
      const res1 = calculateDepreciationCalculator({ assetCost: 500000 });
      const res2 = calculateDepreciationTool({ assetCost: 500000 });
      expect(res1.firstYearDepreciation).toBe(res2.firstYearDepreciation);
      expect(res1.primaryOutput).toBe(res2.primaryOutput);
    });

    it('25. handles string numeric inputs cleanly', () => {
      const res = calculateDepreciationCalculator({
        assetCost: '800000',
        salvageValue: '80000',
        usefulLife: '4',
      });
      expect(res.assetCost).toBe(800000);
      expect(res.firstYearDepreciation).toBe(180000);
    });

    it('26. handles invalid strings without throwing', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 'bad',
        salvageValue: 'invalid',
      });
      expect(res.assetCost).toBe(0);
      expect(res.firstYearDepreciation).toBe(0);
    });

    it('27. handles WDV with 0 salvage value (nominal geometric assumption)', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 500000,
        salvageValue: 0,
        usefulLife: 5,
        method: 'wdv',
      });
      expect(res.firstYearDepreciation).toBeGreaterThan(200000);
      expect(res.schedule[4].closingBookValue).toBeLessThan(10000);
    });

    it('28. handles SYD with 10-year asset lifespan', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 1100000,
        salvageValue: 100000,
        usefulLife: 10,
        method: 'syd',
      });
      // Sum of 10 years = 55. Y1 = 10/55 * 1,000,000 = 181,818
      expect(res.firstYearDepreciation).toBe(181818);
      expect(res.schedule[9].accumulatedDepreciation).toBe(1000000);
    });

    it('29. handles Units of Production where Y1 units exceed total units', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 500000,
        salvageValue: 50000,
        usefulLife: 5,
        method: 'units',
        totalUnits: 100000,
        firstYearUnits: 120000, // Exceeds total
      });
      // Should not depreciate below salvage
      expect(res.firstYearDepreciation).toBe(450000);
      expect(res.schedule[0].closingBookValue).toBe(50000);
    });

    it('30. handles DDB on 2-year short life asset (100% rate)', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 400000,
        salvageValue: 40000,
        usefulLife: 2,
        method: 'ddb',
      });
      // DDB rate = 2/2 = 100%
      // Y1 dep max = 400,000 - 40,000 = 360,000
      expect(res.firstYearDepreciation).toBe(360000);
      expect(res.schedule[0].closingBookValue).toBe(40000);
    });

    it('31. handles corporate tax rate of 40% for high tax jurisdiction', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 1000000,
        salvageValue: 0,
        usefulLife: 4,
        method: 'slm',
        taxRate: 40,
      });
      expect(res.schedule[0].taxShield).toBe(100000); // 250,000 * 40%
      expect(res.totalTaxShield).toBe(400000);
    });

    it('32. handles commercial vehicle asset standard from lookup table', () => {
      const std = ASSET_CLASS_STANDARDS.commercial_vehicle;
      const res = calculateDepreciationCalculator({
        assetCost: 1000000,
        salvageValue: 1000000 * (std.defaultSalvagePct / 100),
        usefulLife: std.defaultLife,
        method: 'slm',
      });
      expect(res.usefulLife).toBe(6);
      expect(res.salvageValue).toBe(50000);
      expect(res.firstYearDepreciation).toBe(158333); // 950,000 / 6
    });

    it('33. handles computer servers standard from lookup table', () => {
      const std = ASSET_CLASS_STANDARDS.computer_servers;
      const res = calculateDepreciationCalculator({
        assetCost: 600000,
        salvageValue: 600000 * (std.defaultSalvagePct / 100),
        usefulLife: std.defaultLife,
        method: 'slm',
      });
      expect(res.usefulLife).toBe(3);
      expect(res.salvageValue).toBe(12000);
    });

    it('34. formats currency symbols correctly in hero and recommendations', () => {
      const res = calculateDepreciationCalculator({
        assetCost: 100000,
        currencySymbol: '$',
      });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
      expect(res.heroText).toContain('Straight-Line Method');
    });

    it('35. returns custom method name in methodName field', () => {
      const res1 = calculateDepreciationCalculator({ method: 'slm' });
      expect(res1.methodName).toContain('Straight-Line');

      const res2 = calculateDepreciationCalculator({ method: 'ddb' });
      expect(res2.methodName).toContain('Double Declining');

      const res3 = calculateDepreciationCalculator({ method: 'wdv' });
      expect(res3.methodName).toContain('Written Down Value');
    });

    it('36. handles zero useful life safely by defaulting to 1 year', () => {
      const res = calculateDepreciationCalculator({ usefulLife: 0 });
      expect(res.usefulLife).toBe(1);
    });

    it('37. handles negative tax rate safely by clamping to 0', () => {
      const res = calculateDepreciationCalculator({ taxRate: -20 });
      expect(res.taxRate).toBe(0);
      expect(res.totalTaxShield).toBe(0);
    });

    it('38. handles tax rate greater than 100% safely by clamping to 100', () => {
      const res = calculateDepreciationCalculator({ taxRate: 150 });
      expect(res.taxRate).toBe(100);
    });

    it('39. verifies closing book value is non-negative across all methods', () => {
      ['slm', 'wdv', 'ddb', 'syd', 'units'].forEach((m) => {
        const res = calculateDepreciationCalculator({ assetCost: 500000, salvageValue: 50000, method: m });
        res.schedule.forEach((row) => {
          expect(row.closingBookValue).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('40. verifies depreciation expense is non-negative across all methods and years', () => {
      ['slm', 'wdv', 'ddb', 'syd', 'units'].forEach((m) => {
        const res = calculateDepreciationCalculator({ assetCost: 500000, salvageValue: 50000, method: m });
        res.schedule.forEach((row) => {
          expect(row.depreciationExpense).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('41. verifies total accumulated depreciation at end of life matches depreciable base (SLM & SYD)', () => {
      ['slm', 'syd'].forEach((m) => {
        const res = calculateDepreciationCalculator({ assetCost: 600000, salvageValue: 60000, usefulLife: 5, method: m });
        const lastRow = res.schedule[res.schedule.length - 1];
        expect(lastRow.accumulatedDepreciation).toBe(540000);
      });
    });

    it('42. handles single-year asset for time-based methods cleanly', () => {
      ['slm', 'wdv', 'ddb', 'syd'].forEach((m) => {
        const res = calculateDepreciationCalculator({ assetCost: 200000, salvageValue: 20000, usefulLife: 1, method: m });
        expect(res.schedule.length).toBe(1);
        expect(res.schedule[0].closingBookValue).toBe(20000);
      });
    });

    it('43. generates correct recommendation ranking array', () => {
      const res = calculateDepreciationCalculator({ assetCost: 1000000, salvageValue: 100000 });
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });

    it('44. provides total depreciation sum across all method comparisons', () => {
      const res = calculateDepreciationCalculator({ assetCost: 500000, salvageValue: 50000, usefulLife: 5 });
      res.methodComparison.forEach((comp) => {
        expect(comp.totalDepreciation).toBeGreaterThan(0);
        expect(comp.year1Dep).toBeGreaterThan(0);
      });
    });

    it('45. handles unknown method safely by falling back to SLM', () => {
      const res = calculateDepreciationCalculator({ method: 'unknown_method' });
      expect(res.method).toBe('slm');
      expect(res.schedule.length).toBe(5);
    });
  });
});
