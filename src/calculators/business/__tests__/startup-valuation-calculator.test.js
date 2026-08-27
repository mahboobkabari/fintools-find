import { describe, it, expect } from 'vitest';
import {
  calculateStartupValuationCalculator,
  calculateStartupValuationTool,
  DEFAULT_STARTUP_VALUATION_INPUTS,
  SCORECARD_WEIGHTS,
} from '../startup-valuation-calculator.js';

describe('Flagship Startup Valuation Intelligence Suite (Sprint 71 Audit)', () => {
  // 1. Method 1: Scorecard Valuation (Bill Payne)
  describe('Method 1: Scorecard Valuation (Bill Payne)', () => {
    it('1. calculates standard scorecard valuation accurately with baseline inputs', () => {
      const res = calculateStartupValuationCalculator({
        primaryMethod: 'scorecard',
        basePreMoneyValuation: 20000000,
        teamScore: 110, // 0.30 * 1.10 = 0.33
        marketSizeScore: 115, // 0.25 * 1.15 = 0.2875
        productScore: 105, // 0.15 * 1.05 = 0.1575
        competitionScore: 100, // 0.10 * 1.00 = 0.10
        partnershipsScore: 100, // 0.10 * 1.00 = 0.10
        capitalNeedScore: 100, // 0.05 * 1.00 = 0.05
        regulatoryScore: 100, // 0.05 * 1.00 = 0.05
      });

      // Total factor = 0.33 + 0.2875 + 0.1575 + 0.10 + 0.10 + 0.05 + 0.05 = 1.075
      // Valuation = 20,000,000 * 1.075 = 21,500,000
      expect(res.weightedScoreFactor).toBe(1.075);
      expect(res.scorecardValuation).toBe(21500000);
      expect(res.selectedPreMoney).toBe(21500000);
    });

    it('2. verifies scorecard weights sum up to 1.0 (100%)', () => {
      const sum = Object.values(SCORECARD_WEIGHTS).reduce((acc, w) => acc + w, 0);
      expect(Math.round(sum * 100) / 100).toBe(1);
    });

    it('3. handles all 100% neutral scores resulting in exactly base valuation', () => {
      const res = calculateStartupValuationCalculator({
        basePreMoneyValuation: 25000000,
        teamScore: 100,
        marketSizeScore: 100,
        productScore: 100,
        competitionScore: 100,
        partnershipsScore: 100,
        capitalNeedScore: 100,
        regulatoryScore: 100,
      });

      expect(res.weightedScoreFactor).toBe(1);
      expect(res.scorecardValuation).toBe(25000000);
    });
  });

  // 2. Method 2: Berkus Method (Dave Berkus)
  describe('Method 2: Berkus Method (Dave Berkus)', () => {
    it('4. calculates Berkus valuation as the sum of 5 risk-reduction milestone values', () => {
      const res = calculateStartupValuationCalculator({
        primaryMethod: 'berkus',
        berkusSoundIdea: 4000000,
        berkusPrototype: 4000000,
        berkusQualityTeam: 5000000,
        berkusStrategicAlliances: 3000000,
        berkusProductRollout: 2000000,
      });

      // Sum = 4 + 4 + 5 + 3 + 2 = 18,000,000
      expect(res.berkusValuation).toBe(18000000);
      expect(res.selectedPreMoney).toBe(18000000);
    });
  });

  // 3. Method 3: Venture Capital (VC) Exit Method
  describe('Method 3: Venture Capital (VC) Exit Method', () => {
    it('5. calculates VC Exit Pre-Money Valuation accurately', () => {
      const res = calculateStartupValuationCalculator({
        primaryMethod: 'vc_method',
        investmentAsk: 10000000,
        exitYearRevenue: 100000000, // 100M
        exitMultiple: 6, // 600M Terminal Exit
        futureDilutionPct: 25, // Retention = 75% -> 450M Adjusted Exit
        targetRoiMultiple: 10, // 10x ROI -> Post-Money = 45M
      });

      // Terminal Exit = 100M * 6 = 600M
      // Adjusted Exit = 600M * 0.75 = 450M
      // VC Post-Money = 450M / 10 = 45M
      // VC Pre-Money = 45M - 10M = 35M
      expect(res.terminalExitValue).toBe(600000000);
      expect(res.vcPostMoneyValuation).toBe(45000000);
      expect(res.vcPreMoneyValuation).toBe(35000000);
      expect(res.selectedPreMoney).toBe(35000000);
    });
  });

  // 4. Method 4: ARR Multiple Method
  describe('Method 4: ARR Multiple Method', () => {
    it('6. calculates ARR Multiple valuation accurately (Annual Revenue * Multiple)', () => {
      const res = calculateStartupValuationCalculator({
        primaryMethod: 'arr_multiple',
        annualRevenue: 25000000,
        arrMultiple: 8,
      });

      // 25M * 8 = 200,000,000
      expect(res.arrMultipleValuation).toBe(200000000);
      expect(res.selectedPreMoney).toBe(200000000);
    });
  });

  // 5. Method 5: Blended Synthesis Valuation
  describe('Method 5: Blended Synthesis Valuation', () => {
    it('7. calculates Blended average across all active methods and min/max range', () => {
      const res = calculateStartupValuationCalculator({
        primaryMethod: 'blended',
      });

      expect(res.blendedValuation).toBeGreaterThan(0);
      expect(res.valuationMin).toBeLessThanOrEqual(res.blendedValuation);
      expect(res.valuationMax).toBeGreaterThanOrEqual(res.blendedValuation);
      expect(res.selectedPreMoney).toBe(res.blendedValuation);
    });
  });

  // 6. Investment Ask & Dilution Analysis
  describe('Investment Ask & Dilution Analysis', () => {
    it('8. calculates Post-Money Valuation and Investor Dilution % accurately', () => {
      const res = calculateStartupValuationCalculator({
        primaryMethod: 'scorecard',
        basePreMoneyValuation: 20000000,
        investmentAsk: 5000000,
        teamScore: 100,
        marketSizeScore: 100,
        productScore: 100,
        competitionScore: 100,
        partnershipsScore: 100,
        capitalNeedScore: 100,
        regulatoryScore: 100,
      });

      // Pre-Money = 20,000,000
      // Post-Money = 25,000,000
      // Investor % = 5M / 25M = 20.0%
      // Founder % = 80.0%
      expect(res.postMoneyValuation).toBe(25000000);
      expect(res.investorEquityPct).toBe(20);
      expect(res.founderRetainedPct).toBe(80);
    });
  });

  // 7. Health Classifications
  describe('Health Classifications', () => {
    it('9. classifies standard 15-25% dilution as HEALTHY', () => {
      const res = calculateStartupValuationCalculator({
        basePreMoneyValuation: 20000000,
        investmentAsk: 5000000, // 20%
      });

      expect(res.healthVerdict).toBe('HEALTHY');
    });

    it('10. classifies heavy dilution (> 30%) as HEAVY_DILUTION', () => {
      const res = calculateStartupValuationCalculator({
        basePreMoneyValuation: 10000000,
        investmentAsk: 10000000, // 50%
      });

      expect(res.healthVerdict).toBe('HEAVY_DILUTION');
    });

    it('11. classifies sub-10% dilution as AGGRESSIVE', () => {
      const res = calculateStartupValuationCalculator({
        basePreMoneyValuation: 50000000,
        investmentAsk: 2000000, // 3.8%
      });

      expect(res.healthVerdict).toBe('AGGRESSIVE');
    });
  });

  // 8. Valuation Synthesis Methods List
  describe('Valuation Synthesis Methods List', () => {
    it('12. builds 4 comparison method items with descriptions', () => {
      const res = calculateStartupValuationCalculator();
      expect(res.valuationMethodsList.length).toBe(4);
      expect(res.valuationMethodsList[0].method).toContain('Scorecard');
      expect(res.valuationMethodsList[1].method).toContain('Berkus');
      expect(res.valuationMethodsList[2].method).toContain('VC Exit');
      expect(res.valuationMethodsList[3].method).toContain('ARR Multiple');
    });
  });

  // 9. Strategic Recommendations
  describe('Strategic Recommendations', () => {
    it('13. generates 3 prioritized strategic recommendations', () => {
      const res = calculateStartupValuationCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });
  });

  // 10. Presets Validation
  describe('Presets Validation', () => {
    it('14. validates Seed Stage Prototype preset', () => {
      const res = calculateStartupValuationCalculator({
        primaryMethod: 'scorecard',
        basePreMoneyValuation: 20000000,
        investmentAsk: 5000000,
        annualRevenue: 12000000,
        arrMultiple: 8,
        teamScore: 110,
        marketSizeScore: 115,
        productScore: 105,
        competitionScore: 100,
        partnershipsScore: 100,
        capitalNeedScore: 100,
        regulatoryScore: 100,
      });

      expect(res.selectedPreMoney).toBe(21500000);
      expect(res.postMoneyValuation).toBe(26500000);
      expect(res.investorEquityPct).toBe(18.9);
    });

    it('15. validates Pre-Seed Idea Stage preset (Berkus)', () => {
      const res = calculateStartupValuationCalculator({
        primaryMethod: 'berkus',
        basePreMoneyValuation: 10000000,
        investmentAsk: 2500000,
        annualRevenue: 0,
        arrMultiple: 5,
        berkusSoundIdea: 4000000,
        berkusPrototype: 4000000,
        berkusQualityTeam: 4000000,
        berkusStrategicAlliances: 2000000,
        berkusProductRollout: 1000000,
      });

      expect(res.selectedPreMoney).toBe(15000000);
      expect(res.postMoneyValuation).toBe(17500000);
      expect(res.investorEquityPct).toBe(14.3);
    });

    it('16. validates Early SaaS ARR Multiple preset', () => {
      const res = calculateStartupValuationCalculator({
        primaryMethod: 'arr_multiple',
        annualRevenue: 36000000,
        arrMultiple: 10,
        investmentAsk: 7500000,
      });

      expect(res.selectedPreMoney).toBe(360000000);
      expect(res.postMoneyValuation).toBe(367500000);
    });

    it('17. validates Series A VC Exit preset', () => {
      const res = calculateStartupValuationCalculator({
        primaryMethod: 'vc_method',
        investmentAsk: 100000000,
        exitYearRevenue: 1000000000,
        exitMultiple: 6,
        targetRoiMultiple: 10,
        futureDilutionPct: 25,
      });

      // Terminal = 6,000M -> Adjusted = 4,500M -> Post = 450M -> Pre = 350M
      expect(res.selectedPreMoney).toBe(350000000);
      expect(res.postMoneyValuation).toBe(450000000);
      expect(res.investorEquityPct).toBe(22.2);
    });

    it('18. validates DeepTech IP heavy preset', () => {
      const res = calculateStartupValuationCalculator({
        primaryMethod: 'scorecard',
        basePreMoneyValuation: 50000000,
        teamScore: 130,
        marketSizeScore: 120,
        productScore: 150,
        competitionScore: 120,
        partnershipsScore: 100,
        capitalNeedScore: 90,
        regulatoryScore: 110,
      });

      expect(res.selectedPreMoney).toBeGreaterThan(50000000);
    });

    it('19. validates Consumer Tech blended preset', () => {
      const res = calculateStartupValuationCalculator({
        primaryMethod: 'blended',
        basePreMoneyValuation: 25000000,
        investmentAsk: 5000000,
      });

      expect(res.selectedPreMoney).toBe(res.blendedValuation);
    });
  });

  // 11. Boundary Safeguards & Edge Cases
  describe('Boundary Safeguards & Edge Cases', () => {
    it('20. clamps negative base valuation to safe minimum', () => {
      const res = calculateStartupValuationCalculator({ basePreMoneyValuation: -100000 });
      expect(res.basePreMoneyValuation).toBe(10000);
    });

    it('21. clamps negative investment ask to 0', () => {
      const res = calculateStartupValuationCalculator({ investmentAsk: -500000 });
      expect(res.investmentAsk).toBe(0);
    });

    it('22. clamps scorecard scores between 0 and 200%', () => {
      const resHigh = calculateStartupValuationCalculator({ teamScore: 300 });
      expect(resHigh.teamScore).toBe(200);

      const resLow = calculateStartupValuationCalculator({ teamScore: -50 });
      expect(resLow.teamScore).toBe(0);
    });

    it('23. handles zero revenue cleanly without error', () => {
      const res = calculateStartupValuationCalculator({
        primaryMethod: 'arr_multiple',
        annualRevenue: 0,
      });

      expect(res.arrMultipleValuation).toBe(0);
    });

    it('24. clamps arrMultiple between 1 and 100', () => {
      const resHigh = calculateStartupValuationCalculator({ arrMultiple: 150 });
      expect(resHigh.arrMultiple).toBe(100);

      const resLow = calculateStartupValuationCalculator({ arrMultiple: 0 });
      expect(resLow.arrMultiple).toBe(1);
    });

    it('25. handles string inputs cleanly', () => {
      const res = calculateStartupValuationCalculator({
        basePreMoneyValuation: '20000000',
        investmentAsk: '5000000',
        annualRevenue: '10000000',
      });

      expect(res.basePreMoneyValuation).toBe(20000000);
      expect(res.investmentAsk).toBe(5000000);
    });

    it('26. supports custom currency symbol ($)', () => {
      const res = calculateStartupValuationCalculator({ currencySymbol: '$' });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
    });

    it('27. exports calculateStartupValuationTool alias identically', () => {
      const res1 = calculateStartupValuationCalculator({ basePreMoneyValuation: 20000000 });
      const res2 = calculateStartupValuationTool({ basePreMoneyValuation: 20000000 });
      expect(res1.selectedPreMoney).toBe(res2.selectedPreMoney);
      expect(res1.postMoneyValuation).toBe(res2.postMoneyValuation);
    });

    it('28. verifies default inputs when called with empty object', () => {
      const res = calculateStartupValuationCalculator();
      expect(res.basePreMoneyValuation).toBe(DEFAULT_STARTUP_VALUATION_INPUTS.basePreMoneyValuation);
      expect(res.selectedPreMoney).toBeGreaterThan(0);
    });

    it('29. verifies primaryOutput is selectedPreMoney', () => {
      const res = calculateStartupValuationCalculator();
      expect(res.primaryOutput).toBe(res.selectedPreMoney);
    });

    it('30. handles 0 target ROI gracefully in VC method without crashing', () => {
      const res = calculateStartupValuationCalculator({
        primaryMethod: 'vc_method',
        targetRoiMultiple: 0,
      });

      expect(res.vcPostMoneyValuation).toBe(0);
      expect(res.vcPreMoneyValuation).toBe(0);
    });

    it('31. clamps future dilution between 0 and 90%', () => {
      const res = calculateStartupValuationCalculator({ futureDilutionPct: 95 });
      expect(res.futureDilutionPct).toBe(90);
    });

    it('32. handles zero investment ask (post-money equals pre-money)', () => {
      const res = calculateStartupValuationCalculator({
        investmentAsk: 0,
      });

      expect(res.postMoneyValuation).toBe(res.selectedPreMoney);
      expect(res.investorEquityPct).toBe(0);
      expect(res.founderRetainedPct).toBe(100);
    });

    it('33. verifies hero text formatting includes pre-money and post-money', () => {
      const res = calculateStartupValuationCalculator();
      expect(res.heroText).toContain('Estimated Pre-Money Valuation is');
      expect(res.heroText).toContain('Post-Money Valuation');
      expect(res.heroText).toContain('investor dilution');
    });

    it('34. handles high exit multiple (25x) in VC method', () => {
      const res = calculateStartupValuationCalculator({
        exitMultiple: 25,
      });

      expect(res.exitMultiple).toBe(25);
    });

    it('35. handles massive unicorn valuation (₹1000 Crores)', () => {
      const res = calculateStartupValuationCalculator({
        basePreMoneyValuation: 10000000000,
      });

      expect(res.basePreMoneyValuation).toBe(10000000000);
      expect(res.scorecardValuation).toBeGreaterThan(10000000000);
    });

    it('36. verifies Berkus component values are non-negative', () => {
      const res = calculateStartupValuationCalculator({
        berkusSoundIdea: -1000000,
      });

      expect(res.berkusSoundIdea).toBe(0);
    });

    it('37. checks that increasing team score increases scorecard valuation', () => {
      const res1 = calculateStartupValuationCalculator({ teamScore: 100 });
      const res2 = calculateStartupValuationCalculator({ teamScore: 150 });
      expect(res2.scorecardValuation).toBeGreaterThan(res1.scorecardValuation);
    });

    it('38. checks that increasing ARR multiple increases ARR valuation proportionally', () => {
      const res1 = calculateStartupValuationCalculator({ arrMultiple: 5, annualRevenue: 10000000 });
      const res2 = calculateStartupValuationCalculator({ arrMultiple: 10, annualRevenue: 10000000 });
      expect(res2.arrMultipleValuation).toBe(res1.arrMultipleValuation * 2);
    });

    it('39. verifies blended valuation handles scenario where some methods are zero', () => {
      const res = calculateStartupValuationCalculator({
        annualRevenue: 0,
        berkusSoundIdea: 0,
        berkusPrototype: 0,
        berkusQualityTeam: 0,
        berkusStrategicAlliances: 0,
        berkusProductRollout: 0,
      });

      expect(res.blendedValuation).toBeGreaterThan(0);
    });

    it('40. handles fractional multiple inputs (e.g. 7.5x)', () => {
      const res = calculateStartupValuationCalculator({ arrMultiple: 7.5 });
      expect(res.arrMultiple).toBe(7.5);
    });

    it('41. verifies VC pre-money clamps to 0 when post-money is less than investment ask', () => {
      const res = calculateStartupValuationCalculator({
        investmentAsk: 100000000,
        exitYearRevenue: 10000000,
        exitMultiple: 2,
        targetRoiMultiple: 10,
      });

      expect(res.vcPreMoneyValuation).toBe(0);
    });

    it('42. checks that founder retained plus investor equity always equals 100%', () => {
      const res = calculateStartupValuationCalculator({
        investmentAsk: 7500000,
      });

      expect(Math.round(res.founderRetainedPct + res.investorEquityPct)).toBe(100);
    });

    it('43. checks Scorecard product score weight is 15%', () => {
      expect(SCORECARD_WEIGHTS.product).toBe(0.15);
    });

    it('44. checks Scorecard market size weight is 25%', () => {
      expect(SCORECARD_WEIGHTS.marketSize).toBe(0.25);
    });

    it('45. verifies complete return object contract integrity', () => {
      const res = calculateStartupValuationCalculator();
      expect(res).toHaveProperty('selectedPreMoney');
      expect(res).toHaveProperty('postMoneyValuation');
      expect(res).toHaveProperty('blendedValuation');
      expect(res).toHaveProperty('scorecardValuation');
      expect(res).toHaveProperty('berkusValuation');
      expect(res).toHaveProperty('vcPreMoneyValuation');
      expect(res).toHaveProperty('arrMultipleValuation');
      expect(res).toHaveProperty('valuationMin');
      expect(res).toHaveProperty('valuationMax');
      expect(res).toHaveProperty('investorEquityPct');
      expect(res).toHaveProperty('founderRetainedPct');
      expect(res).toHaveProperty('valuationMethodsList');
      expect(res).toHaveProperty('recommendations');
    });
  });
});
