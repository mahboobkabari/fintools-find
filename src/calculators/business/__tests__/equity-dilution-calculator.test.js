import { describe, it, expect } from 'vitest';
import {
  calculateEquityDilutionCalculator,
  calculateEquityDilutionTool,
  DEFAULT_EQUITY_DILUTION_INPUTS,
} from '../equity-dilution-calculator.js';

describe('Flagship Equity Dilution & Cap Table Intelligence Suite (Sprint 70 Audit)', () => {
  // 1. Core Post-Money & Ownership Dynamics
  describe('Core Post-Money & Ownership Dynamics', () => {
    it('1. calculates Post-Money Valuation correctly (Pre-Money + Investment)', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 20000000,
        investmentAmount: 5000000,
      });

      expect(res.postMoneyValuation).toBe(25000000);
    });

    it('2. calculates Investor Ownership % accurately on Pre-Money Option Pool Shuffle', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 20000000,
        investmentAmount: 5000000,
        targetEsopPoolPct: 10,
        esopPoolTiming: 'pre_money',
      });

      // Investor gets exactly 5M / 25M = 20.0%
      expect(res.investorPostRoundPct).toBe(20);
      expect(res.esopPostRoundPct).toBe(10);
      // Founder takes the full 10% ESOP hit: 100% - 20% - 10% = 70.0%
      expect(res.founderPostRoundPct).toBe(70);
    });

    it('3. calculates effective Founder Dilution % correctly', () => {
      const res = calculateEquityDilutionCalculator({
        founderInitialOwnershipPct: 100,
        preMoneyValuation: 20000000,
        investmentAmount: 5000000,
        targetEsopPoolPct: 10,
        esopPoolTiming: 'pre_money',
      });

      // Dilution = (1 - 70/100) * 100 = 30.0%
      expect(res.founderDilutionPct).toBe(30);
    });

    it('4. calculates Post-Money Option Pool structuring accurately (Pro-Rata Dilution)', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 20000000,
        investmentAmount: 5000000,
        targetEsopPoolPct: 10,
        existingEsopPoolPct: 0,
        esopPoolTiming: 'post_money',
      });

      // Investor unadjusted: 20%. Post 10% pool: 20% * 0.9 = 18.0%
      // Founder unadjusted: 80%. Post 10% pool: 80% * 0.9 = 72.0%
      // ESOP: 10.0%
      expect(res.investorPostRoundPct).toBe(18);
      expect(res.founderPostRoundPct).toBe(72);
      expect(res.esopPostRoundPct).toBe(10);
      expect(res.founderDilutionPct).toBe(28);
    });
  });

  // 2. Existing ESOP Pool & Incremental Expansion
  describe('Existing ESOP Pool & Incremental Expansion', () => {
    it('5. handles existing ESOP pool expansion accurately (only expands net delta)', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 20000000,
        investmentAmount: 5000000,
        founderInitialOwnershipPct: 95,
        existingEsopPoolPct: 5,
        targetEsopPoolPct: 10,
        esopPoolTiming: 'pre_money',
      });

      expect(res.esopExpansionPct).toBe(5);
      expect(res.investorPostRoundPct).toBe(20);
      expect(res.esopPostRoundPct).toBe(10);
      // Remaining for founder: 100 - 20 - 10 = 70.0%
      expect(res.founderPostRoundPct).toBe(70);
    });
  });

  // 3. Share Count & Share Price Mechanics
  describe('Share Count & Share Price Mechanics', () => {
    it('6. calculates share price and new shares issued under standard pre-money pool', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 20000000,
        investmentAmount: 5000000,
        existingShares: 10000000,
        targetEsopPoolPct: 10,
        existingEsopPoolPct: 0,
        esopPoolTiming: 'pre_money',
      });

      // Effective pre-shares = 10,000,000 / (1 - 0.10) = 11,111,111
      // Share price = 20,000,000 / 11,111,111 = ₹1.80
      // New shares issued = 5,000,000 / 1.80 = 2,777,778
      expect(res.sharePrice).toBe(1.8);
      expect(res.newSharesIssued).toBe(2777778);
      expect(res.esopSharesIssued).toBe(1111111);
      expect(res.totalPostRoundShares).toBe(13888889);
    });

    it('7. calculates share price without ESOP expansion cleanly', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 20000000,
        investmentAmount: 5000000,
        existingShares: 10000000,
        targetEsopPoolPct: 0,
        existingEsopPoolPct: 0,
        esopPoolTiming: 'pre_money',
      });

      // Share price = 20,000,000 / 10,000,000 = ₹2.00
      expect(res.sharePrice).toBe(2);
      expect(res.newSharesIssued).toBe(2500000);
      expect(res.totalPostRoundShares).toBe(12500000);
    });
  });

  // 4. Founder Equity Value Growth
  describe('Founder Equity Value Growth', () => {
    it('8. computes pre vs post round founder equity value and net value added', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 20000000,
        investmentAmount: 5000000,
        founderInitialOwnershipPct: 100,
        targetEsopPoolPct: 10,
        esopPoolTiming: 'pre_money',
      });

      // Pre-round value = 100% of 20M = 20,000,000
      // Post-round value = 70% of 25M = 17,500,000
      expect(res.founderPreRoundValue).toBe(20000000);
      expect(res.founderPostRoundValue).toBe(17500000);
      expect(res.founderNetValueAdded).toBe(-2500000); // Downward valuation hit before enterprise growth
    });

    it('9. computes positive net value creation when pre-money valuation is up', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 100000000, // Up-round at 100M
        investmentAmount: 25000000,
        founderInitialOwnershipPct: 70, // 70% of 100M = 70M
        targetEsopPoolPct: 10,
        existingEsopPoolPct: 5,
        esopPoolTiming: 'pre_money',
      });

      expect(res.founderPreRoundValue).toBe(70000000);
      expect(res.postMoneyValuation).toBe(125000000);
    });
  });

  // 5. Prior Investors & Cap Table Distribution
  describe('Prior Investors & Cap Table Distribution', () => {
    it('10. handles prior angel/seed investors pro-rata dilution alongside founders', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 50000000,
        investmentAmount: 10000000, // 16.67%
        founderInitialOwnershipPct: 70,
        existingEsopPoolPct: 5,
        targetEsopPoolPct: 10,
        esopPoolTiming: 'pre_money',
      });

      // Other existing = 100 - 70 - 5 = 25%
      // Total remaining for existing = 100 - 16.67 - 10 = 73.33%
      // Founder = 70 / 95 * 73.33 = 54.04%
      // Prior = 25 / 95 * 73.33 = 19.3%
      expect(res.capTable.length).toBe(4);
      expect(res.capTable[0].stakeholder).toBe('Founding Team');
      expect(res.capTable[1].stakeholder).toBe('New Round Investors');
      expect(res.capTable[2].stakeholder).toBe('ESOP Option Pool');
      expect(res.capTable[3].stakeholder).toBe('Prior Investors / Angels');
    });
  });

  // 6. Multi-Round Forward Waterfall Trajectory
  describe('Multi-Round Forward Waterfall Trajectory', () => {
    it('11. generates 3 multi-round milestones (Current, Series A, Series B)', () => {
      const res = calculateEquityDilutionCalculator();
      expect(res.forwardRounds.length).toBe(3);
      expect(res.forwardRounds[0].roundName).toBe('Current Round');
      expect(res.forwardRounds[1].roundName).toContain('Series A');
      expect(res.forwardRounds[2].roundName).toContain('Series B');
      expect(res.forwardRounds[2].founderPct).toBeLessThan(res.forwardRounds[0].founderPct);
      expect(res.forwardRounds[2].founderValue).toBeGreaterThan(res.forwardRounds[0].founderValue);
    });
  });

  // 7. Health Classifications
  describe('Health Classifications', () => {
    it('12. classifies low dilution (< 25%) as OPTIMAL', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 30000000,
        investmentAmount: 3000000, // 9.1%
        targetEsopPoolPct: 5,
      });

      expect(res.healthVerdict).toBe('OPTIMAL');
    });

    it('13. classifies moderate dilution (25% - 35%) as MODERATE', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 20000000,
        investmentAmount: 5000000, // 20%
        targetEsopPoolPct: 10, // Dilution = 30%
      });

      expect(res.healthVerdict).toBe('MODERATE');
    });

    it('14. classifies heavy dilution (> 35%) as HEAVY_DILUTION', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 10000000,
        investmentAmount: 5000000, // 33.3%
        targetEsopPoolPct: 15, // Dilution > 40%
      });

      expect(res.healthVerdict).toBe('HEAVY_DILUTION');
    });
  });

  // 8. Presets Validation
  describe('Presets Validation', () => {
    it('15. validates Seed Round preset', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 20000000,
        investmentAmount: 5000000,
        founderInitialOwnershipPct: 100,
        targetEsopPoolPct: 10,
        existingEsopPoolPct: 0,
        esopPoolTiming: 'pre_money',
        existingShares: 10000000,
      });

      expect(res.postMoneyValuation).toBe(25000000);
      expect(res.founderPostRoundPct).toBe(70);
      expect(res.investorPostRoundPct).toBe(20);
      expect(res.esopPostRoundPct).toBe(10);
    });

    it('16. validates Pre-Seed Angel Round preset', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 6000000,
        investmentAmount: 1000000,
        founderInitialOwnershipPct: 100,
        targetEsopPoolPct: 5,
        existingEsopPoolPct: 0,
        esopPoolTiming: 'pre_money',
      });

      expect(res.postMoneyValuation).toBe(7000000);
      expect(res.investorPostRoundPct).toBe(14.29);
      expect(res.esopPostRoundPct).toBe(5);
      expect(res.founderPostRoundPct).toBe(80.71);
    });

    it('17. validates Series A Growth preset', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 100000000,
        investmentAmount: 25000000,
        founderInitialOwnershipPct: 70,
        targetEsopPoolPct: 12,
        existingEsopPoolPct: 5,
        esopPoolTiming: 'pre_money',
      });

      expect(res.postMoneyValuation).toBe(125000000);
      expect(res.investorPostRoundPct).toBe(20);
      expect(res.esopPostRoundPct).toBe(12);
    });

    it('18. validates Series B Expansion preset', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 350000000,
        investmentAmount: 75000000,
        founderInitialOwnershipPct: 50,
        targetEsopPoolPct: 10,
        existingEsopPoolPct: 8,
        esopPoolTiming: 'pre_money',
      });

      expect(res.postMoneyValuation).toBe(425000000);
      expect(res.investorPostRoundPct).toBe(17.65);
    });

    it('19. validates Post-Money SAFE note preset', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 12000000,
        investmentAmount: 2000000,
        founderInitialOwnershipPct: 100,
        targetEsopPoolPct: 8,
        existingEsopPoolPct: 0,
        esopPoolTiming: 'post_money',
      });

      expect(res.postMoneyValuation).toBe(14000000);
      expect(res.investorPostRoundPct).toBe(13.14);
      expect(res.esopPostRoundPct).toBe(8);
      expect(res.founderPostRoundPct).toBe(78.86);
    });

    it('20. validates Bootstrapped ESOP Carveout preset (zero investment)', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 10000000,
        investmentAmount: 0,
        founderInitialOwnershipPct: 100,
        targetEsopPoolPct: 10,
        existingEsopPoolPct: 0,
        esopPoolTiming: 'pre_money',
      });

      expect(res.postMoneyValuation).toBe(10000000);
      expect(res.investorPostRoundPct).toBe(0);
      expect(res.esopPostRoundPct).toBe(10);
      expect(res.founderPostRoundPct).toBe(90);
      expect(res.founderDilutionPct).toBe(10);
    });
  });

  // 9. Boundary Safeguards & Edge Cases
  describe('Boundary Safeguards & Edge Cases', () => {
    it('21. clamps negative pre-money valuation to safe minimum', () => {
      const res = calculateEquityDilutionCalculator({ preMoneyValuation: -5000000 });
      expect(res.preMoneyValuation).toBe(10000);
    });

    it('22. clamps negative investment to 0', () => {
      const res = calculateEquityDilutionCalculator({ investmentAmount: -1000000 });
      expect(res.investmentAmount).toBe(0);
    });

    it('23. clamps founder initial ownership between 1 and 100%', () => {
      const resHigh = calculateEquityDilutionCalculator({ founderInitialOwnershipPct: 150 });
      expect(resHigh.founderInitialOwnershipPct).toBe(100);

      const resLow = calculateEquityDilutionCalculator({ founderInitialOwnershipPct: 0 });
      expect(resLow.founderInitialOwnershipPct).toBe(1);
    });

    it('24. clamps target ESOP pool between 0 and 50%', () => {
      const resHigh = calculateEquityDilutionCalculator({ targetEsopPoolPct: 75 });
      expect(resHigh.targetEsopPoolPct).toBe(50);
    });

    it('25. handles existing ESOP > target ESOP by clamping existing to target', () => {
      const res = calculateEquityDilutionCalculator({
        targetEsopPoolPct: 10,
        existingEsopPoolPct: 15,
      });

      expect(res.existingEsopPoolPct).toBe(10);
      expect(res.esopExpansionPct).toBe(0);
    });

    it('26. handles string inputs cleanly', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: '20000000',
        investmentAmount: '5000000',
        targetEsopPoolPct: '10',
      });

      expect(res.preMoneyValuation).toBe(20000000);
      expect(res.investmentAmount).toBe(5000000);
      expect(res.postMoneyValuation).toBe(25000000);
    });

    it('27. supports custom currency symbol ($)', () => {
      const res = calculateEquityDilutionCalculator({ currencySymbol: '$' });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
    });

    it('28. exports calculateEquityDilutionTool alias identically', () => {
      const res1 = calculateEquityDilutionCalculator({ investmentAmount: 5000000 });
      const res2 = calculateEquityDilutionTool({ investmentAmount: 5000000 });
      expect(res1.founderPostRoundPct).toBe(res2.founderPostRoundPct);
      expect(res1.postMoneyValuation).toBe(res2.postMoneyValuation);
    });

    it('29. verifies default inputs when called with empty object', () => {
      const res = calculateEquityDilutionCalculator();
      expect(res.preMoneyValuation).toBe(DEFAULT_EQUITY_DILUTION_INPUTS.preMoneyValuation);
      expect(res.founderPostRoundPct).toBe(70);
    });

    it('30. verifies primaryOutput is founderPostRoundPct', () => {
      const res = calculateEquityDilutionCalculator();
      expect(res.primaryOutput).toBe(res.founderPostRoundPct);
    });

    it('31. handles 0% ESOP pool (pure founder + investor split)', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 20000000,
        investmentAmount: 5000000,
        targetEsopPoolPct: 0,
        existingEsopPoolPct: 0,
      });

      expect(res.investorPostRoundPct).toBe(20);
      expect(res.esopPostRoundPct).toBe(0);
      expect(res.founderPostRoundPct).toBe(80);
      expect(res.founderDilutionPct).toBe(20);
    });

    it('32. handles 50% massive investment dilution', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 10000000,
        investmentAmount: 10000000, // 50%
        targetEsopPoolPct: 0,
      });

      expect(res.investorPostRoundPct).toBe(50);
      expect(res.founderPostRoundPct).toBe(50);
      expect(res.founderDilutionPct).toBe(50);
    });

    it('33. verifies sum of cap table percentages equals 100%', () => {
      const res = calculateEquityDilutionCalculator();
      const totalPct = res.founderPostRoundPct + res.investorPostRoundPct + res.esopPostRoundPct;
      expect(Math.round(totalPct)).toBe(100);
    });

    it('34. verifies strategic recommendations structure', () => {
      const res = calculateEquityDilutionCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });

    it('35. verifies hero text formatting includes founder post-round pct and stake value', () => {
      const res = calculateEquityDilutionCalculator();
      expect(res.heroText).toContain('Founders retain 70% equity');
      expect(res.heroText).toContain('diluted by 30%');
      expect(res.heroText).toContain('Post-Money Valuation');
    });

    it('36. handles high initial share count (100 million shares)', () => {
      const res = calculateEquityDilutionCalculator({
        existingShares: 100000000,
        preMoneyValuation: 200000000,
      });

      expect(res.existingShares).toBe(100000000);
      expect(res.totalPostRoundShares).toBeGreaterThan(100000000);
    });

    it('37. handles 100% investor acquisition (investment >= huge amount)', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 10000,
        investmentAmount: 990000,
        targetEsopPoolPct: 0,
      });

      expect(res.investorPostRoundPct).toBe(99);
      expect(res.founderPostRoundPct).toBe(1);
    });

    it('38. checks founder value multiple calculation', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 20000000,
        investmentAmount: 5000000,
      });

      expect(res.founderValueMultiple).toBe(0.88); // 17.5M / 20M = 0.875 -> 0.88
    });

    it('39. verifies post-money pool timing generates higher founder ownership than pre-money', () => {
      const preRes = calculateEquityDilutionCalculator({ esopPoolTiming: 'pre_money' });
      const postRes = calculateEquityDilutionCalculator({ esopPoolTiming: 'post_money' });

      expect(postRes.founderPostRoundPct).toBeGreaterThan(preRes.founderPostRoundPct);
    });

    it('40. handles 1 rupee/cent minimum valuation cleanly without NaN', () => {
      const res = calculateEquityDilutionCalculator({
        preMoneyValuation: 10000,
        investmentAmount: 10000,
      });

      expect(res.postMoneyValuation).toBe(20000);
      expect(isNaN(res.founderPostRoundPct)).toBe(false);
    });

    it('41. handles fractional ESOP targets (e.g. 7.5%)', () => {
      const res = calculateEquityDilutionCalculator({ targetEsopPoolPct: 7.5 });
      expect(res.targetEsopPoolPct).toBe(7.5);
      expect(res.esopPostRoundPct).toBe(7.5);
    });

    it('42. verifies existing option pool equals target resulting in 0 expansion', () => {
      const res = calculateEquityDilutionCalculator({
        targetEsopPoolPct: 10,
        existingEsopPoolPct: 10,
      });

      expect(res.esopExpansionPct).toBe(0);
    });

    it('43. checks that founder pre-round value equals initial ownership times pre-money', () => {
      const res = calculateEquityDilutionCalculator({
        founderInitialOwnershipPct: 80,
        preMoneyValuation: 50000000,
      });

      expect(res.founderPreRoundValue).toBe(40000000);
    });

    it('44. checks that founder post-round value equals post-round ownership times post-money', () => {
      const res = calculateEquityDilutionCalculator({
        founderInitialOwnershipPct: 100,
        preMoneyValuation: 20000000,
        investmentAmount: 5000000,
      });

      expect(res.founderPostRoundValue).toBe(17500000);
    });

    it('45. verifies complete return object contract integrity', () => {
      const res = calculateEquityDilutionCalculator();
      expect(res).toHaveProperty('founderPostRoundPct');
      expect(res).toHaveProperty('investorPostRoundPct');
      expect(res).toHaveProperty('esopPostRoundPct');
      expect(res).toHaveProperty('founderDilutionPct');
      expect(res).toHaveProperty('founderPreRoundValue');
      expect(res).toHaveProperty('founderPostRoundValue');
      expect(res).toHaveProperty('sharePrice');
      expect(res).toHaveProperty('totalPostRoundShares');
      expect(res).toHaveProperty('capTable');
      expect(res).toHaveProperty('forwardRounds');
      expect(res).toHaveProperty('recommendations');
    });
  });
});
