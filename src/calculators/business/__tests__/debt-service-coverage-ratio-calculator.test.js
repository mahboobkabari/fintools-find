import { describe, it, expect } from 'vitest';
import {
  calculateDebtServiceCoverageRatioCalculator,
  calculateDebtServiceCoverageRatioTool,
  calculateDscrCalculator,
  DEFAULT_DSCR_INPUTS,
} from '../debt-service-coverage-ratio-calculator.js';

describe('Flagship Debt Service Coverage Ratio (DSCR) Suite (Sprint 72 Audit)', () => {
  // 1. Direct NOI Calculation Mode
  describe('Direct NOI Calculation Mode', () => {
    it('1. calculates standard DSCR accurately with baseline inputs', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        calculationMode: 'direct',
        netOperatingIncome: 6000000,
        annualPrincipal: 2500000,
        annualInterest: 1500000,
        annualLeaseObligations: 0,
      });

      // Debt Service = 2.5M + 1.5M = 4,000,000
      // DSCR = 6,000,000 / 4,000,000 = 1.50x
      expect(res.totalDebtService).toBe(4000000);
      expect(res.effectiveNoi).toBe(6000000);
      expect(res.dscr).toBe(1.5);
      expect(res.cashFlowSurplus).toBe(2000000);
    });

    it('2. calculates Interest Coverage Ratio (ICR) correctly', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 6000000,
        annualInterest: 1500000,
      });

      // ICR = 6M / 1.5M = 4.00x
      expect(res.icr).toBe(4.0);
    });

    it('3. includes annual lease obligations in total debt service', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 6000000,
        annualPrincipal: 2000000,
        annualInterest: 1000000,
        annualLeaseObligations: 1000000,
      });

      // Total Debt Service = 2M + 1M + 1M = 4,000,000
      expect(res.totalDebtService).toBe(4000000);
      expect(res.dscr).toBe(1.5);
    });
  });

  // 2. Real Estate Rental & Itemized Mode
  describe('Real Estate Rental & Itemized Mode', () => {
    it('4. calculates Effective NOI from Gross Rent, Vacancy % and OPEX', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        calculationMode: 'real_estate',
        grossRevenue: 10000000, // 10M Gross Rent
        vacancyLossPct: 5, // 5% Vacancy = 500k -> EGI = 9.5M
        operatingExpenses: 3500000, // 3.5M OPEX -> NOI = 6.0M
        annualPrincipal: 2500000,
        annualInterest: 1500000,
      });

      expect(res.vacancyLossAmount).toBe(500000);
      expect(res.effectiveNoi).toBe(6000000);
      expect(res.dscr).toBe(1.5);
    });

    it('5. handles itemized mode identically to real estate mode', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        calculationMode: 'itemized',
        grossRevenue: 12000000,
        vacancyLossPct: 10, // 1.2M loss -> 10.8M EGI
        operatingExpenses: 4000000, // NOI = 6.8M
        annualPrincipal: 3000000,
        annualInterest: 2000000,
      });

      // Debt Service = 5.0M -> DSCR = 6.8M / 5.0M = 1.36x
      expect(res.effectiveNoi).toBe(6800000);
      expect(res.dscr).toBe(1.36);
    });
  });

  // 3. Maximum Borrowing Capacity & Headroom
  describe('Maximum Borrowing Capacity & Headroom', () => {
    it('6. calculates maximum supportable loan amount at target DSCR', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 6000000,
        targetDscrBenchmark: 1.25,
        loanInterestRate: 8.5,
        loanTenureYears: 10,
      });

      // Max Annual Debt Service = 6,000,000 / 1.25 = 4,800,000
      expect(res.maxSupportableAnnualDebtService).toBe(4800000);
      expect(res.maxSupportableLoanAmount).toBeGreaterThan(0);
    });

    it('7. calculates additional borrowing headroom correctly', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 6000000,
        annualPrincipal: 2500000,
        annualInterest: 1500000,
        targetDscrBenchmark: 1.25,
      });

      expect(res.additionalBorrowingHeadroom).toBeGreaterThan(0);
    });
  });

  // 4. Breakeven Revenue & Safety Cushion
  describe('Breakeven Revenue & Safety Cushion', () => {
    it('8. calculates revenue decline tolerance % correctly', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        calculationMode: 'real_estate',
        grossRevenue: 10000000,
        vacancyLossPct: 5,
        operatingExpenses: 3500000,
        annualPrincipal: 2500000,
        annualInterest: 1500000,
      });

      // Total Outflows = 4M Debt Service + 3.5M OPEX = 7.5M
      // Breakeven Gross = 7.5M / 0.95 = 7,894,737
      // Drop Tolerance = (10M - 7.894M) / 10M = 21.1%
      expect(res.revenueDeclineTolerancePct).toBe(21.1);
      expect(res.breakevenGrossRevenue).toBe(7894737);
    });
  });

  // 5. Health & Underwriting Covenant Verdicts
  describe('Health & Underwriting Covenant Verdicts', () => {
    it('9. classifies DSCR >= 1.50x as STRONG_PRIME', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 6000000,
        annualPrincipal: 2000000,
        annualInterest: 1000000, // DSCR = 2.0x
      });

      expect(res.healthVerdict).toBe('STRONG_PRIME');
    });

    it('10. classifies DSCR between 1.25x and 1.49x as HEALTHY', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 5000000,
        annualPrincipal: 2500000,
        annualInterest: 1500000, // 5M / 4M = 1.25x
        targetDscrBenchmark: 1.25,
      });

      expect(res.healthVerdict).toBe('HEALTHY');
    });

    it('11. classifies DSCR below covenant as BELOW_COVENANT', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 4500000,
        annualPrincipal: 2500000,
        annualInterest: 1500000, // 4.5M / 4M = 1.13x < 1.25x
        targetDscrBenchmark: 1.25,
      });

      expect(res.healthVerdict).toBe('BELOW_COVENANT');
    });

    it('12. classifies DSCR < 1.00x as DEFAULT_RISK', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 3000000,
        annualPrincipal: 2500000,
        annualInterest: 1500000, // 3M / 4M = 0.75x
      });

      expect(res.healthVerdict).toBe('DEFAULT_RISK');
    });
  });

  // 6. Multi-Scenario Stress Testing Matrix
  describe('Multi-Scenario Stress Testing Matrix', () => {
    it('13. generates 4 stress test scenarios with status evaluation', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 6000000,
        annualPrincipal: 2500000,
        annualInterest: 1500000,
        targetDscrBenchmark: 1.25,
      });

      expect(res.stressScenarios.length).toBe(4);
      expect(res.stressScenarios[0].scenario).toContain('Base Case');
      expect(res.stressScenarios[1].scenario).toContain('-10% Revenue Drop');
      expect(res.stressScenarios[2].scenario).toContain('-20% Occupancy Shock');
      expect(res.stressScenarios[3].scenario).toContain('+200 bps Interest Rate');
    });
  });

  // 7. Presets Validation
  describe('Presets Validation', () => {
    it('14. validates Commercial Real Estate Multifamily preset', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        calculationMode: 'real_estate',
        grossRevenue: 12000000,
        vacancyLossPct: 5,
        operatingExpenses: 3500000,
        annualPrincipal: 2500000,
        annualInterest: 1500000,
        targetDscrBenchmark: 1.25,
      });

      // EGI = 11.4M -> NOI = 7.9M -> DSCR = 7.9M / 4M = 1.98x
      expect(res.effectiveNoi).toBe(7900000);
      expect(res.dscr).toBe(1.98);
      expect(res.healthVerdict).toBe('STRONG_PRIME');
    });

    it('15. validates Corporate Term Loan preset', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        calculationMode: 'direct',
        netOperatingIncome: 8000000,
        annualPrincipal: 4500000,
        annualInterest: 1800000,
        targetDscrBenchmark: 1.25,
      });

      // DSCR = 8M / 6.3M = 1.27x
      expect(res.dscr).toBe(1.27);
      expect(res.healthVerdict).toBe('HEALTHY');
    });

    it('16. validates MSME Business Loan preset', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        calculationMode: 'direct',
        netOperatingIncome: 3500000,
        annualPrincipal: 1400000,
        annualInterest: 800000,
        targetDscrBenchmark: 1.20,
      });

      // DSCR = 3.5M / 2.2M = 1.59x
      expect(res.dscr).toBe(1.59);
      expect(res.healthVerdict).toBe('STRONG_PRIME');
    });

    it('17. validates Industrial Logistics Warehouse preset', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        calculationMode: 'real_estate',
        grossRevenue: 25000000,
        vacancyLossPct: 3,
        operatingExpenses: 5000000,
        annualPrincipal: 7500000,
        annualInterest: 4500000,
        targetDscrBenchmark: 1.30,
      });

      // EGI = 24.25M -> NOI = 19.25M -> Debt Service = 12M -> DSCR = 1.60x
      expect(res.dscr).toBe(1.6);
    });

    it('18. validates Leveraged Buyout (LBO) preset', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        calculationMode: 'direct',
        netOperatingIncome: 50000000,
        annualPrincipal: 25000000,
        annualInterest: 13000000,
        targetDscrBenchmark: 1.25,
      });

      // DSCR = 50M / 38M = 1.32x
      expect(res.dscr).toBe(1.32);
    });

    it('19. validates Healthcare Practice preset', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        calculationMode: 'itemized',
        grossRevenue: 9000000,
        vacancyLossPct: 4,
        operatingExpenses: 3000000,
        annualPrincipal: 2200000,
        annualInterest: 1300000,
        targetDscrBenchmark: 1.25,
      });

      // EGI = 8.64M -> NOI = 5.64M -> Debt Service = 3.5M -> DSCR = 1.61x
      expect(res.dscr).toBe(1.61);
    });
  });

  // 8. Boundary Safeguards & Edge Cases
  describe('Boundary Safeguards & Edge Cases', () => {
    it('20. handles zero total debt service cleanly without division by zero', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 5000000,
        annualPrincipal: 0,
        annualInterest: 0,
        annualLeaseObligations: 0,
      });

      expect(res.totalDebtService).toBe(0);
      expect(res.dscr).toBe(99.99);
    });

    it('21. handles zero NOI returning 0 DSCR', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 0,
        annualPrincipal: 2000000,
        annualInterest: 1000000,
      });

      expect(res.dscr).toBe(0);
      expect(res.healthVerdict).toBe('DEFAULT_RISK');
    });

    it('22. clamps negative gross revenue to 0', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({ grossRevenue: -500000 });
      expect(res.grossRevenue).toBe(0);
    });

    it('23. clamps negative OPEX to 0', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({ operatingExpenses: -200000 });
      expect(res.operatingExpenses).toBe(0);
    });

    it('24. clamps vacancy loss between 0 and 100%', () => {
      const resHigh = calculateDebtServiceCoverageRatioCalculator({ vacancyLossPct: 150 });
      expect(resHigh.vacancyLossPct).toBe(100);

      const resLow = calculateDebtServiceCoverageRatioCalculator({ vacancyLossPct: -20 });
      expect(resLow.vacancyLossPct).toBe(0);
    });

    it('25. handles string inputs cleanly', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: '6000000',
        annualPrincipal: '2500000',
        annualInterest: '1500000',
      });

      expect(res.effectiveNoi).toBe(6000000);
      expect(res.totalDebtService).toBe(4000000);
      expect(res.dscr).toBe(1.5);
    });

    it('26. supports custom currency symbol ($)', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({ currencySymbol: '$' });
      expect(res.currencySymbol).toBe('$');
      expect(res.heroText).toContain('$');
    });

    it('27. exports calculateDebtServiceCoverageRatioTool alias identically', () => {
      const res1 = calculateDebtServiceCoverageRatioCalculator();
      const res2 = calculateDebtServiceCoverageRatioTool();
      expect(res1.dscr).toBe(res2.dscr);
      expect(res1.totalDebtService).toBe(res2.totalDebtService);
    });

    it('28. exports calculateDscrCalculator alias identically', () => {
      const res1 = calculateDebtServiceCoverageRatioCalculator();
      const res2 = calculateDscrCalculator();
      expect(res1.dscr).toBe(res2.dscr);
    });

    it('29. verifies default inputs when called with empty object', () => {
      const res = calculateDebtServiceCoverageRatioCalculator();
      expect(res.effectiveNoi).toBe(DEFAULT_DSCR_INPUTS.netOperatingIncome);
      expect(res.dscr).toBe(1.5);
    });

    it('30. verifies primaryOutput is dscr', () => {
      const res = calculateDebtServiceCoverageRatioCalculator();
      expect(res.primaryOutput).toBe(res.dscr);
    });

    it('31. clamps loan interest rate between 0.1% and 40%', () => {
      const resHigh = calculateDebtServiceCoverageRatioCalculator({ loanInterestRate: 50 });
      expect(resHigh.loanInterestRate).toBe(40);

      const resLow = calculateDebtServiceCoverageRatioCalculator({ loanInterestRate: 0 });
      expect(resLow.loanInterestRate).toBe(0.1);
    });

    it('32. clamps loan tenure between 1 and 40 years', () => {
      const resHigh = calculateDebtServiceCoverageRatioCalculator({ loanTenureYears: 50 });
      expect(resHigh.loanTenureYears).toBe(40);

      const resLow = calculateDebtServiceCoverageRatioCalculator({ loanTenureYears: 0 });
      expect(resLow.loanTenureYears).toBe(1);
    });

    it('33. verifies debt breakdown list contains 4 categories', () => {
      const res = calculateDebtServiceCoverageRatioCalculator();
      expect(res.debtBreakdownList.length).toBe(4);
      expect(res.debtBreakdownList[0].label).toContain('Principal');
      expect(res.debtBreakdownList[1].label).toContain('Interest');
      expect(res.debtBreakdownList[2].label).toContain('Lease');
      expect(res.debtBreakdownList[3].label).toContain('Free Cash Flow');
    });

    it('34. verifies 3 prioritized recommendations are produced', () => {
      const res = calculateDebtServiceCoverageRatioCalculator();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });

    it('35. handles 100% vacancy loss properly in real estate mode', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        calculationMode: 'real_estate',
        grossRevenue: 10000000,
        vacancyLossPct: 100,
        operatingExpenses: 2000000,
      });

      expect(res.effectiveNoi).toBe(0);
      expect(res.dscr).toBe(0);
    });

    it('36. handles high DSCR scenario (e.g. 5.0x)', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 10000000,
        annualPrincipal: 1000000,
        annualInterest: 1000000,
      });

      expect(res.dscr).toBe(5.0);
      expect(res.healthVerdict).toBe('STRONG_PRIME');
    });

    it('37. handles tight DSCR scenario (1.05x)', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 4200000,
        annualPrincipal: 2500000,
        annualInterest: 1500000, // 4.2M / 4M = 1.05x
        targetDscrBenchmark: 1.25,
      });

      expect(res.dscr).toBe(1.05);
      expect(res.healthVerdict).toBe('BELOW_COVENANT');
    });

    it('38. handles zero interest expense with positive principal', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 5000000,
        annualPrincipal: 2500000,
        annualInterest: 0,
      });

      expect(res.totalDebtService).toBe(2500000);
      expect(res.dscr).toBe(2.0);
      expect(res.icr).toBe(99.99);
    });

    it('39. verifies hero text contains DSCR ratio and target benchmark', () => {
      const res = calculateDebtServiceCoverageRatioCalculator();
      expect(res.heroText).toContain('Debt Service Coverage Ratio is 1.5x');
      expect(res.heroText).toContain('Lender Target: 1.25x');
    });

    it('40. handles fractional target DSCR (e.g. 1.35x)', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({ targetDscrBenchmark: 1.35 });
      expect(res.targetDscrBenchmark).toBe(1.35);
    });

    it('41. checks that cashFlowSurplus is negative when in deficit', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 3000000,
        annualPrincipal: 2500000,
        annualInterest: 1500000,
      });

      expect(res.cashFlowSurplus).toBe(-1000000);
    });

    it('42. handles massive corporate enterprise numbers (₹100 Crores NOI)', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        netOperatingIncome: 1000000000,
        annualPrincipal: 400000000,
        annualInterest: 200000000,
      });

      expect(res.dscr).toBe(1.67);
      expect(res.cashFlowSurplus).toBe(400000000);
    });

    it('43. checks that operating expenses higher than revenue clamp NOI to 0', () => {
      const res = calculateDebtServiceCoverageRatioCalculator({
        calculationMode: 'itemized',
        grossRevenue: 5000000,
        vacancyLossPct: 0,
        operatingExpenses: 8000000,
      });

      expect(res.effectiveNoi).toBe(0);
    });

    it('44. checks that target DSCR benchmark clamps between 0.5 and 5.0', () => {
      const resHigh = calculateDebtServiceCoverageRatioCalculator({ targetDscrBenchmark: 10 });
      expect(resHigh.targetDscrBenchmark).toBe(5.0);

      const resLow = calculateDebtServiceCoverageRatioCalculator({ targetDscrBenchmark: 0.1 });
      expect(resLow.targetDscrBenchmark).toBe(0.5);
    });

    it('45. verifies complete return object contract integrity', () => {
      const res = calculateDebtServiceCoverageRatioCalculator();
      expect(res).toHaveProperty('dscr');
      expect(res).toHaveProperty('effectiveNoi');
      expect(res).toHaveProperty('totalDebtService');
      expect(res).toHaveProperty('cashFlowSurplus');
      expect(res).toHaveProperty('icr');
      expect(res).toHaveProperty('maxSupportableLoanAmount');
      expect(res).toHaveProperty('additionalBorrowingHeadroom');
      expect(res).toHaveProperty('stressScenarios');
      expect(res).toHaveProperty('debtBreakdownList');
      expect(res).toHaveProperty('recommendations');
    });
  });
});
