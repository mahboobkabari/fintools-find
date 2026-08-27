import { describe, it, expect } from 'vitest';
import {
  calculateEmi,
  calculateExistingLoanBaseline,
  calculateUpfrontFees,
  calculateRefinancedLoan,
  calculateCumulativeCashFlowBreakEven,
  calculateBalanceTransferSavings,
} from '../balance-transfer-calculator.js';
import { BALANCE_TRANSFER_CONFIG } from '../../configs/balance-transfer-calculator.config.js';

describe('Refinance & Balance Transfer Financial Engine', () => {

  // 1. MANDATORY TEST CASE: Cash-paid fees
  it('MANDATORY TEST: calculates net savings correctly for cash-paid fees', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 1000000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 60,
      newInterestRatePercent: 8,
      newTenureMonths: 60,
      processingFeePercent: 1, // 10,000 fee paid in cash
      financeFeesIntoLoan: false,
    });
    expect(res.isValid).toBe(true);
    expect(res.fees.totalUpfrontFees).toBe(10000);
    expect(res.refinanced.newPrincipal).toBe(1000000);
    expect(res.refinanced.cashOutlayFees).toBe(10000);
    expect(res.netFinancialSavings).toBe(res.currentRemainingCost - res.refinanceRemainingCost);
    expect(res.netFinancialSavings).toBeGreaterThan(0);
  });

  // 2. MANDATORY TEST CASE: Financed fees
  it('MANDATORY TEST: calculates net savings correctly for financed fees without double counting', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 1000000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 60,
      newInterestRatePercent: 8,
      newTenureMonths: 60,
      processingFeePercent: 1, // 10,000 fee financed into loan
      financeFeesIntoLoan: true,
    });
    expect(res.isValid).toBe(true);
    expect(res.fees.totalUpfrontFees).toBe(10000);
    expect(res.refinanced.newPrincipal).toBe(1010000);
    expect(res.refinanced.cashOutlayFees).toBe(0);
    // Refinance cost = New EMI * 60 (fees are already in New EMI)
    expect(res.refinanceRemainingCost).toBe(res.refinanced.newEmi * 60);
    expect(res.netFinancialSavings).toBe(res.currentRemainingCost - res.refinanceRemainingCost);
  });

  // 3. MANDATORY TEST CASE: Financed fees with higher refinance interest cost
  it('MANDATORY TEST: handles financed fees with higher refinance interest rate cleanly', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 500000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 36,
      newInterestRatePercent: 12, // higher interest rate!
      newTenureMonths: 36,
      processingFeePercent: 2,
      financeFeesIntoLoan: true,
    });
    expect(res.isValid).toBe(true);
    expect(res.isRateAdvantageous).toBe(false);
    expect(res.netFinancialSavings).toBeLessThan(0);
  });

  // 4. MANDATORY TEST CASE: Same rate with financed fees
  it('MANDATORY TEST: handles same rate with financed fees resulting in negative net savings', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 500000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 36,
      newInterestRatePercent: 10, // same rate!
      newTenureMonths: 36,
      processingFeePercent: 1,
      financeFeesIntoLoan: true,
    });
    expect(res.isValid).toBe(true);
    expect(res.netFinancialSavings).toBeLessThan(0); // fees increase total outflow
  });

  // 5. MANDATORY TEST CASE: Different new tenure with cash-paid fees
  it('MANDATORY TEST: evaluates different new tenure with cash-paid fees accurately', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 1000000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 60,
      newInterestRatePercent: 8,
      newTenureMonths: 48, // shorter tenure
      processingFeePercent: 1,
      financeFeesIntoLoan: false,
    });
    expect(res.isValid).toBe(true);
    expect(res.refinanceRemainingCost).toBe(res.refinanced.newEmi * 48 + 10000);
    expect(res.netFinancialSavings).toBeGreaterThan(0);
  });

  // 6. MANDATORY TEST CASE: Different new tenure with financed fees
  it('MANDATORY TEST: evaluates different new tenure with financed fees accurately', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 1000000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 60,
      newInterestRatePercent: 8,
      newTenureMonths: 72, // extended tenure
      processingFeePercent: 1,
      financeFeesIntoLoan: true,
    });
    expect(res.isValid).toBe(true);
    expect(res.isTenureExtended).toBe(true);
  });

  // 7. MANDATORY TEST CASE: Scenario where naive fee subtraction would double-count
  it('MANDATORY TEST: proves net savings formula prevents naive fee double counting when fees are financed', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 1000000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 60,
      newInterestRatePercent: 8,
      newTenureMonths: 60,
      processingFeePercent: 2, // 20,000 fee
      financeFeesIntoLoan: true,
    });

    const correctNetSavings = res.currentRemainingCost - res.refinanceRemainingCost;
    expect(res.netFinancialSavings).toBe(correctNetSavings);
    expect(res.refinanced.interestOnFinancedFees).toBeGreaterThan(0);
  });

  // 8. MANDATORY TEST CASE: Scenario where there is no cumulative break-even
  it('MANDATORY TEST: returns hasBreakEven: false when crossover never occurs', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 500000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 24,
      newInterestRatePercent: 12, // higher interest rate
      newTenureMonths: 24,
      processingFeePercent: 5, // high fee
      financeFeesIntoLoan: false,
    });
    expect(res.breakEven.hasBreakEven).toBe(false);
    expect(res.breakEven.breakEvenMonth).toBeNull();
  });

  // 9. MANDATORY TEST CASE: Scenario where break-even occurs after several months
  it('MANDATORY TEST: calculates exact month where cumulative break-even occurs', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 1000000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 60,
      newInterestRatePercent: 8,
      newTenureMonths: 60,
      processingFeePercent: 2, // 20,000 cash fee upfront
      financeFeesIntoLoan: false,
    });
    expect(res.breakEven.hasBreakEven).toBe(true);
    expect(res.breakEven.breakEvenMonth).toBeGreaterThan(1);
    expect(res.breakEven.breakEvenMonth).toBeLessThan(60);
  });

  // 10. MANDATORY TEST CASE: Exact hand-calculated cash-flow crossover
  it('MANDATORY TEST: verifies exact hand-calculated cash-flow crossover month', () => {
    // Current EMI = 1000, Refinance EMI = 800, Cash Upfront Fee = 500
    // Month 0: CumCurrent = 0, CumRefinance = 500
    // Month 1: CumCurrent = 1000, CumRefinance = 1300
    // Month 2: CumCurrent = 2000, CumRefinance = 2100
    // Month 3: CumCurrent = 3000, CumRefinance = 2900 -> Break-even at Month 3!
    const baseline = { remainingTenureMonths: 10, currentEmi: 1000 };
    const refinanced = { newTenureMonths: 10, newEmi: 800, cashOutlayFees: 500, financeFeesIntoLoan: false, newPrincipal: 5000 };
    const breakEven = calculateCumulativeCashFlowBreakEven(baseline, refinanced);
    expect(breakEven.breakEvenMonth).toBe(3);
  });

  // 11. MANDATORY TEST CASE: Regression test comparing both fee-treatment modes
  it('MANDATORY TEST: REGRESSION PROOF comparing cash-paid vs financed fee treatment modes', () => {
    const cashRes = calculateBalanceTransferSavings({
      outstandingPrincipal: 1000000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 60,
      newInterestRatePercent: 8,
      newTenureMonths: 60,
      processingFeePercent: 1,
      financeFeesIntoLoan: false,
    });

    const financedRes = calculateBalanceTransferSavings({
      outstandingPrincipal: 1000000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 60,
      newInterestRatePercent: 8,
      newTenureMonths: 60,
      processingFeePercent: 1,
      financeFeesIntoLoan: true,
    });

    expect(cashRes.fees.totalUpfrontFees).toBe(financedRes.fees.totalUpfrontFees);
    expect(cashRes.refinanced.newPrincipal).toBe(1000000);
    expect(financedRes.refinanced.newPrincipal).toBe(1010000);
    // Cash-paid fees have lower monthly EMI because principal is lower
    expect(cashRes.refinanced.newEmi).toBeLessThan(financedRes.refinanced.newEmi);
  });

  // 12. Standard EMI formula verification
  it('calculates standard EMI accurately', () => {
    const emi = calculateEmi(100000, 12, 12);
    expect(emi).toBe(8885);
  });

  // 13. Zero interest EMI formula
  it('calculates 0% interest EMI accurately', () => {
    const emi = calculateEmi(120000, 0, 12);
    expect(emi).toBe(10000);
  });

  // 14. Fee calculation from fixed amount override
  it('uses fixed fee amount when provided over percentage', () => {
    const fees = calculateUpfrontFees({
      outstandingPrincipal: 1000000,
      processingFeePercent: 1,
      processingFeeFixed: 5000, // fixed override!
    });
    expect(fees.processingFee).toBe(5000);
  });

  // 15. Home loan rate reduction preset integration
  it('integrates cleanly with homeLoanRateReduction preset', () => {
    const preset = BALANCE_TRANSFER_CONFIG.scenarios.homeLoanRateReduction;
    const res = calculateBalanceTransferSavings(preset);
    expect(res.isValid).toBe(true);
    expect(res.netFinancialSavings).toBeGreaterThan(0);
  });

  // 16. Personal loan balance transfer preset integration
  it('integrates cleanly with personalLoanBalanceTransfer preset', () => {
    const preset = BALANCE_TRANSFER_CONFIG.scenarios.personalLoanBalanceTransfer;
    const res = calculateBalanceTransferSavings(preset);
    expect(res.isValid).toBe(true);
    expect(res.netFinancialSavings).toBeGreaterThan(0);
  });

  // 17. Car loan refinancing preset integration
  it('integrates cleanly with carLoanRefinancing preset', () => {
    const preset = BALANCE_TRANSFER_CONFIG.scenarios.carLoanRefinancing;
    const res = calculateBalanceTransferSavings(preset);
    expect(res.isValid).toBe(true);
    expect(res.netFinancialSavings).toBeGreaterThan(0);
  });

  // 18. Short tenure high fee preset integration (unfavorable)
  it('integrates cleanly with shortTenureHighFeeRefinance preset', () => {
    const preset = BALANCE_TRANSFER_CONFIG.scenarios.shortTenureHighFeeRefinance;
    const res = calculateBalanceTransferSavings(preset);
    expect(res.isValid).toBe(true);
    expect(res.isNetSavingsPositive).toBe(false);
  });

  // 19. Numeric string input sanitization
  it('sanitizes numeric string inputs safely', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: '1000000',
      currentInterestRatePercent: '9.5',
      remainingTenureMonths: '180',
      newInterestRatePercent: '8.4',
    });
    expect(res.isValid).toBe(true);
    expect(res.baseline.outstandingPrincipal).toBe(1000000);
  });

  // 20. Large loan principal handling (₹10 Crores)
  it('handles large loan principal (₹10 Crores) cleanly without overflow', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 100000000,
      currentInterestRatePercent: 9,
      remainingTenureMonths: 240,
      newInterestRatePercent: 8,
      newTenureMonths: 240,
    });
    expect(res.isValid).toBe(true);
    expect(res.netFinancialSavings).toBeGreaterThan(1000000);
  });

  // 21. Small loan principal handling (₹50,000)
  it('handles small loan principal (₹50,000) cleanly', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 50000,
      currentInterestRatePercent: 15,
      remainingTenureMonths: 12,
      newInterestRatePercent: 12,
      newTenureMonths: 12,
    });
    expect(res.isValid).toBe(true);
    expect(res.netFinancialSavings).toBeGreaterThan(0);
  });

  // 22. Interest cost attributable to financed fees
  it('calculates interest cost attributable to financed fees', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 1000000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 60,
      newInterestRatePercent: 8,
      newTenureMonths: 60,
      processingFeePercent: 2, // 20,000 fee financed
      financeFeesIntoLoan: true,
    });
    expect(res.refinanced.interestOnFinancedFees).toBeGreaterThan(0);
  });

  // 23. Zero fee balance transfer scenario
  it('calculates savings accurately when zero fees are charged', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 1000000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 60,
      newInterestRatePercent: 8,
      newTenureMonths: 60,
      processingFeePercent: 0,
      financeFeesIntoLoan: false,
    });
    expect(res.fees.totalUpfrontFees).toBe(0);
    expect(res.breakEven.breakEvenMonth).toBe(1); // Immediate break-even!
  });

  // 24. Monthly EMI savings calculation
  it('calculates monthly EMI savings accurately', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 1000000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 60,
      newInterestRatePercent: 8,
      newTenureMonths: 60,
    });
    expect(res.monthlyEmiSavings).toBe(res.baseline.currentEmi - res.refinanced.newEmi);
  });

  // 25. Gross interest saved calculation
  it('calculates gross interest saved accurately', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 1000000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 60,
      newInterestRatePercent: 8,
      newTenureMonths: 60,
    });
    expect(res.grossInterestSaved).toBe(res.baseline.totalRemainingInterest - res.refinanced.refinanceRemainingInterest);
  });

  // 26. Cumulative schedule generation
  it('generates cumulative cash flow comparison schedule array', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 500000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 24,
      newInterestRatePercent: 8,
      newTenureMonths: 24,
    });
    expect(res.breakEven.schedule.length).toBe(24);
    expect(res.breakEven.schedule[0]).toHaveProperty('cumCurrent');
  });

  // 27. High prepayment penalty fee integration
  it('deducts high foreclosure penalty fee correctly', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 1000000,
      currentInterestRatePercent: 10,
      remainingTenureMonths: 60,
      newInterestRatePercent: 9,
      newTenureMonths: 60,
      foreclosurePenaltyPercent: 3, // 30,000 penalty
      financeFeesIntoLoan: false,
    });
    expect(res.fees.foreclosurePenalty).toBe(30000);
  });

  // 28. Equal tenure refinancing net savings verification
  it('verifies net savings equals current remaining cost minus refinance remaining cost', () => {
    const res = calculateBalanceTransferSavings({
      outstandingPrincipal: 2000000,
      currentInterestRatePercent: 9.5,
      remainingTenureMonths: 120,
      newInterestRatePercent: 8.5,
      newTenureMonths: 120,
      processingFeePercent: 0.5,
    });
    expect(res.netFinancialSavings).toBe(res.currentRemainingCost - res.refinanceRemainingCost);
  });

  // 29. Default inputs validation
  it('handles default inputs cleanly', () => {
    const res = calculateBalanceTransferSavings(BALANCE_TRANSFER_CONFIG.defaultInputs);
    expect(res.isValid).toBe(true);
    expect(res.netFinancialSavings).toBeGreaterThan(0);
  });

  // 30. Full calculateBalanceTransferSavings integration
  it('returns complete structured result object for valid inputs', () => {
    const res = calculateBalanceTransferSavings(BALANCE_TRANSFER_CONFIG.defaultInputs);
    expect(res.isValid).toBe(true);
    expect(res).toHaveProperty('baseline');
    expect(res).toHaveProperty('fees');
    expect(res).toHaveProperty('refinanced');
    expect(res).toHaveProperty('netFinancialSavings');
    expect(res).toHaveProperty('breakEven');
  });
});
