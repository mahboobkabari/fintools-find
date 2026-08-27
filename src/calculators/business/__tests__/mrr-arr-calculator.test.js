import { describe, it, expect } from 'vitest';
import {
  calculateMrrArrCalculator,
  calculateMrrArrTool,
  DEFAULT_MRR_INPUTS,
} from '../mrr-arr-calculator.js';

describe('Flagship MRR / ARR & SaaS Revenue Intelligence Suite (Sprint 69 Audit)', () => {
  // 1. Net New MRR Waterfall Calculations
  describe('Net New MRR Waterfall Calculations', () => {
    it('1. calculates Gross Additions accurately (New + Expansion + Reactivation)', () => {
      const res = calculateMrrArrCalculator({
        newMrr: 200000,
        expansionMrr: 100000,
        reactivationMrr: 50000,
      });

      // Gross additions = 200k + 100k + 50k = 350k
      expect(res.grossAdditions).toBe(350000);
    });

    it('2. calculates Gross Losses accurately (Contraction + Churn)', () => {
      const res = calculateMrrArrCalculator({
        contractionMrr: 40000,
        churnedMrr: 60000,
      });

      // Gross losses = 40k + 60k = 100k
      expect(res.grossLosses).toBe(100000);
    });

    it('3. calculates Net New MRR accurately (Additions - Losses)', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        newMrr: 200000,
        expansionMrr: 100000,
        reactivationMrr: 50000, // +350k
        contractionMrr: 30000,
        churnedMrr: 70000, // -100k
      });

      // Net New MRR = 350k - 100k = 250k
      expect(res.netNewMrr).toBe(250000);
      expect(res.endingMrr).toBe(1250000);
    });

    it('4. calculates Run-Rate ARR accurately (Ending MRR * 12)', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        newMrr: 0,
        expansionMrr: 0,
        reactivationMrr: 0,
        contractionMrr: 0,
        churnedMrr: 0,
      });

      // ARR = 1,000,000 * 12 = 12,000,000
      expect(res.runRateArr).toBe(12000000);
    });
  });

  // 2. Growth Rates & Metrics
  describe('Growth Rates & Metrics', () => {
    it('5. computes net monthly growth rate % accurately', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        newMrr: 100000,
        expansionMrr: 0,
        reactivationMrr: 0,
        contractionMrr: 0,
        churnedMrr: 0, // Net New = 100k -> 10.0%
      });

      expect(res.netGrowthRatePct).toBe(10);
    });

    it('6. computes annualized compound growth rate % accurately', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        newMrr: 100000,
        expansionMrr: 0,
        reactivationMrr: 0,
        contractionMrr: 0,
        churnedMrr: 0,
      });

      // (1.10)^12 - 1 = 3.1384 - 1 = 213.8%
      expect(res.annualizedGrowthRatePct).toBe(213.8);
    });
  });

  // 3. SaaS Health Metrics: NRR, GRR & Quick Ratio
  describe('SaaS Health Metrics: NRR, GRR & Quick Ratio', () => {
    it('7. calculates Net Revenue Retention (NRR %) correctly', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        expansionMrr: 200000,
        contractionMrr: 50000,
        churnedMrr: 50000,
      });

      // NRR = (1,000,000 + 200k - 50k - 50k) / 1,000,000 = 1,100,000 / 1,000,000 = 110.0%
      expect(res.nrrPct).toBe(110);
    });

    it('8. calculates Gross Revenue Retention (GRR %) correctly', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        contractionMrr: 40000,
        churnedMrr: 60000,
      });

      // GRR = (1,000,000 - 40k - 60k) / 1,000,000 = 900,000 / 1,000,000 = 90.0%
      expect(res.grrPct).toBe(90);
    });

    it('9. calculates SaaS Quick Ratio correctly ((New + Exp) / (Contr + Churn))', () => {
      const res = calculateMrrArrCalculator({
        newMrr: 150000,
        expansionMrr: 50000, // Total Additions = 200k
        contractionMrr: 20000,
        churnedMrr: 30000, // Total Losses = 50k
      });

      // Quick Ratio = 200k / 50k = 4.0x
      expect(res.quickRatio).toBe(4);
    });

    it('10. handles zero gross losses with positive additions safely (Infinity ratio)', () => {
      const res = calculateMrrArrCalculator({
        newMrr: 100000,
        expansionMrr: 0,
        contractionMrr: 0,
        churnedMrr: 0,
      });

      expect(res.quickRatio).toBe(Infinity);
    });
  });

  // 4. ARR Valuation Multiples
  describe('ARR Valuation Multiples', () => {
    it('11. calculates estimated valuation, bear, and bull ranges based on multiple', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        newMrr: 0,
        expansionMrr: 0,
        reactivationMrr: 0,
        contractionMrr: 0,
        churnedMrr: 0,
        valuationMultiple: 10,
      });

      // Run-rate ARR = 1.20 Cr
      // 10x = 12.0 Cr
      // Bear (7x) = 8.4 Cr
      // Bull (13x) = 15.6 Cr
      expect(res.estimatedValuation).toBe(120000000);
      expect(res.valuationBear).toBe(84000000);
      expect(res.valuationBull).toBe(156000000);
    });
  });

  // 5. Health Ratings
  describe('Health Ratings', () => {
    it('12. classifies negative net new MRR as CONTRACTING', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        newMrr: 10000,
        churnedMrr: 100000,
      });

      expect(res.rating).toBe('CONTRACTING');
    });

    it('13. classifies Quick Ratio < 2.0 or NRR < 95% as MODERATE', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        newMrr: 50000,
        expansionMrr: 20000,
        contractionMrr: 20000,
        churnedMrr: 30000, // Quick ratio = 70k / 50k = 1.4x
      });

      expect(res.rating).toBe('MODERATE');
    });

    it('14. classifies NRR >= 115% and Quick Ratio >= 4.0 as ELITE', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        newMrr: 300000,
        expansionMrr: 200000, // NRR = 117%
        contractionMrr: 10000,
        churnedMrr: 20000, // Quick ratio = 500k / 30k = 16.7x
      });

      expect(res.rating).toBe('ELITE');
    });

    it('15. classifies standard positive metrics as HEALTHY', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        newMrr: 100000,
        expansionMrr: 50000,
        contractionMrr: 20000,
        churnedMrr: 30000,
      });

      expect(res.rating).toBe('HEALTHY');
    });
  });

  // 6. 12-Month Compound Trajectory Schedule
  describe('12-Month Compound Trajectory Schedule', () => {
    it('16. generates 12 months of forward MRR and ARR projections', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        newMrr: 100000,
      });

      expect(res.forwardProjection.length).toBe(12);
      expect(res.forwardProjection[0].month).toBe(1);
      expect(res.forwardProjection[11].month).toBe(12);
      expect(res.forwardProjection[11].mrr).toBeGreaterThan(res.endingMrr);
      expect(res.forwardProjection[11].arr).toBe(res.forwardProjection[11].mrr * 12);
    });
  });

  // 7. Waterfall Decomposition & Recommendations
  describe('Waterfall Decomposition & Recommendations', () => {
    it('17. builds 5 itemized waterfall streams', () => {
      const res = calculateMrrArrCalculator();
      expect(res.waterfallItems.length).toBe(5);
      expect(res.waterfallItems[0].label).toContain('New Customer');
      expect(res.waterfallItems[1].label).toContain('Expansion');
      expect(res.waterfallItems[4].label).toContain('Churned');
    });

    it('18. generates 3 prioritized SaaS recommendations', () => {
      const res = calculateMrrArrCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });
  });

  // 8. Hero Text Formatting
  describe('Hero Text Formatting', () => {
    it('19. formats hero text with ending MRR, run-rate ARR, and Net New MRR', () => {
      const res = calculateMrrArrCalculator();
      expect(res.heroText).toContain('Ending MRR is');
      expect(res.heroText).toContain('Run-Rate ARR of');
      expect(res.heroText).toContain('Net New MRR');
      expect(res.heroText).toContain('SaaS Quick Ratio');
    });
  });

  // 9. Presets Validation
  describe('Industry Presets Validation', () => {
    it('20. validates seed-stage SaaS preset', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 250000,
        newMrr: 50000,
        expansionMrr: 20000,
        reactivationMrr: 5000,
        contractionMrr: 10000,
        churnedMrr: 15000,
        valuationMultiple: 8,
      });

      expect(res.endingMrr).toBe(300000);
      expect(res.runRateArr).toBe(3600000);
      expect(res.quickRatio).toBe(2.8);
      expect(res.nrrPct).toBe(98);
    });

    it('21. validates Series A scaleup preset', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 2500000,
        newMrr: 400000,
        expansionMrr: 250000,
        reactivationMrr: 50000,
        contractionMrr: 100000,
        churnedMrr: 150000,
        valuationMultiple: 10,
      });

      expect(res.endingMrr).toBe(2950000);
      expect(res.runRateArr).toBe(35400000);
      expect(res.quickRatio).toBe(2.6);
      expect(res.nrrPct).toBe(100);
    });

    it('22. validates Enterprise B2B preset', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 15000000,
        newMrr: 1500000,
        expansionMrr: 2000000,
        reactivationMrr: 200000,
        contractionMrr: 500000,
        churnedMrr: 800000,
        valuationMultiple: 12,
      });

      expect(res.endingMrr).toBe(17400000);
      expect(res.runRateArr).toBe(208800000);
      expect(res.quickRatio).toBe(2.69);
    });

    it('23. validates elite expansion flywheel preset', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 5000000,
        newMrr: 600000,
        expansionMrr: 1200000,
        reactivationMrr: 100000,
        contractionMrr: 100000,
        churnedMrr: 200000,
        valuationMultiple: 14,
      });

      expect(res.endingMrr).toBe(6600000);
      expect(res.runRateArr).toBe(79200000);
      expect(res.nrrPct).toBe(118);
      expect(res.quickRatio).toBe(6);
      expect(res.rating).toBe('ELITE');
    });

    it('24. validates churn turnaround preset', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        newMrr: 100000,
        expansionMrr: 20000,
        reactivationMrr: 10000,
        contractionMrr: 80000,
        churnedMrr: 120000,
      });

      expect(res.endingMrr).toBe(930000);
      expect(res.quickRatio).toBe(0.6);
      expect(res.rating).toBe('CONTRACTING');
    });

    it('25. validates bootstrapped micro-SaaS preset', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 75000,
        newMrr: 15000,
        expansionMrr: 5000,
        reactivationMrr: 2000,
        contractionMrr: 2000,
        churnedMrr: 4000,
      });

      expect(res.endingMrr).toBe(91000);
      expect(res.runRateArr).toBe(1092000);
      expect(res.quickRatio).toBe(3.33);
    });
  });

  // 10. Boundary Safeguards & Edge Cases
  describe('Boundary Safeguards & Edge Cases', () => {
    it('26. handles zero starting MRR safely without NaN', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 0,
        newMrr: 100000,
        expansionMrr: 0,
        reactivationMrr: 0,
        contractionMrr: 0,
        churnedMrr: 0,
      });

      expect(res.endingMrr).toBe(100000);
      expect(res.nrrPct).toBe(100);
      expect(res.netGrowthRatePct).toBe(0);
    });

    it('27. clamps negative revenue inputs to 0', () => {
      const res = calculateMrrArrCalculator({
        newMrr: -50000,
        expansionMrr: -20000,
      });

      expect(res.newMrr).toBe(0);
      expect(res.expansionMrr).toBe(0);
    });

    it('28. clamps valuation multiple between 1 and 100', () => {
      const resLow = calculateMrrArrCalculator({ valuationMultiple: 0 });
      expect(resLow.valuationMultiple).toBe(1);

      const resHigh = calculateMrrArrCalculator({ valuationMultiple: 200 });
      expect(resHigh.valuationMultiple).toBe(100);
    });

    it('29. handles string numeric inputs cleanly', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: '1000000',
        newMrr: '100000',
        expansionMrr: '50000',
      });

      expect(res.startingMrr).toBe(1000000);
      expect(res.endingMrr).toBe(1100000);
    });

    it('30. supports custom currency symbol ($)', () => {
      const res = calculateMrrArrCalculator({ currencySymbol: '$' });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
    });

    it('31. exports calculateMrrArrTool alias identically', () => {
      const res1 = calculateMrrArrCalculator({ newMrr: 200000 });
      const res2 = calculateMrrArrTool({ newMrr: 200000 });
      expect(res1.endingMrr).toBe(res2.endingMrr);
      expect(res1.runRateArr).toBe(res2.runRateArr);
    });

    it('32. verifies default inputs when called with empty object', () => {
      const res = calculateMrrArrCalculator();
      expect(res.startingMrr).toBe(DEFAULT_MRR_INPUTS.startingMrr);
      expect(res.endingMrr).toBeGreaterThan(0);
    });

    it('33. verifies primaryOutput is endingMrr', () => {
      const res = calculateMrrArrCalculator();
      expect(res.primaryOutput).toBe(res.endingMrr);
    });

    it('34. handles complete catastrophic churn (churn >= starting MRR)', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 500000,
        newMrr: 0,
        expansionMrr: 0,
        reactivationMrr: 0,
        contractionMrr: 0,
        churnedMrr: 600000,
      });

      expect(res.endingMrr).toBe(0);
      expect(res.runRateArr).toBe(0);
      expect(res.rating).toBe('CONTRACTING');
    });

    it('35. handles 100% GRR when there is zero churn and zero contraction', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        contractionMrr: 0,
        churnedMrr: 0,
      });

      expect(res.grrPct).toBe(100);
    });

    it('36. handles high expansion resulting in NRR > 150%', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        expansionMrr: 600000,
        contractionMrr: 0,
        churnedMrr: 0,
      });

      expect(res.nrrPct).toBe(160);
    });

    it('37. checks that doubling new MRR increases net new MRR proportionally', () => {
      const res1 = calculateMrrArrCalculator({ newMrr: 100000, expansionMrr: 0, reactivationMrr: 0, contractionMrr: 0, churnedMrr: 0 });
      const res2 = calculateMrrArrCalculator({ newMrr: 200000, expansionMrr: 0, reactivationMrr: 0, contractionMrr: 0, churnedMrr: 0 });
      expect(res2.netNewMrr).toBe(res1.netNewMrr * 2);
    });

    it('38. handles massive enterprise MRR (₹50 Crores)', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 500000000,
        newMrr: 25000000,
        expansionMrr: 15000000,
        reactivationMrr: 0,
        contractionMrr: 0,
        churnedMrr: 0,
      });

      expect(res.endingMrr).toBe(540000000);
      expect(res.runRateArr).toBe(6480000000);
    });

    it('39. verifies forward projection reflects negative trajectory during contraction', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 1000000,
        newMrr: 10000,
        churnedMrr: 100000,
      });

      expect(res.forwardProjection[11].mrr).toBeLessThan(res.endingMrr);
    });

    it('40. verifies forward projection implied valuation is proportional to multiple', () => {
      const res = calculateMrrArrCalculator({ valuationMultiple: 10 });
      expect(res.forwardProjection[0].impliedValuation).toBe(res.forwardProjection[0].arr * 10);
    });

    it('41. handles fractional multiple inputs (e.g. 7.5x)', () => {
      const res = calculateMrrArrCalculator({ valuationMultiple: 7.5 });
      expect(res.valuationMultiple).toBe(7.5);
    });

    it('42. verifies zero reactivation MRR handles cleanly', () => {
      const res = calculateMrrArrCalculator({ reactivationMrr: 0 });
      expect(res.reactivationMrr).toBe(0);
    });

    it('43. checks that starting MRR plus Net New MRR always equals Ending MRR', () => {
      const res = calculateMrrArrCalculator({
        startingMrr: 450000,
        newMrr: 60000,
        expansionMrr: 15000,
        reactivationMrr: 5000,
        contractionMrr: 8000,
        churnedMrr: 12000,
      });

      expect(res.endingMrr).toBe(res.startingMrr + res.netNewMrr);
    });

    it('44. verifies Quick Ratio is 1 when additions equal losses', () => {
      const res = calculateMrrArrCalculator({
        newMrr: 50000,
        expansionMrr: 50000, // 100k additions
        contractionMrr: 40000,
        churnedMrr: 60000, // 100k losses
      });

      expect(res.quickRatio).toBe(1);
    });

    it('45. verifies consistent return structure properties', () => {
      const res = calculateMrrArrCalculator();
      expect(res).toHaveProperty('endingMrr');
      expect(res).toHaveProperty('runRateArr');
      expect(res).toHaveProperty('netNewMrr');
      expect(res).toHaveProperty('nrrPct');
      expect(res).toHaveProperty('grrPct');
      expect(res).toHaveProperty('quickRatio');
      expect(res).toHaveProperty('estimatedValuation');
      expect(res).toHaveProperty('forwardProjection');
      expect(res).toHaveProperty('waterfallItems');
      expect(res).toHaveProperty('recommendations');
    });
  });
});
