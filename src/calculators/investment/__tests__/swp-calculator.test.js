import { describe, it, expect } from 'vitest';
import { calculateSwp } from '../swp-calculator.js';

describe('SWP Calculator Math Engine — Sprint 28 Flagship Audit', () => {
  it('calculates standard fixed monthly withdrawal accurately (Reference Case A - Fixed)', () => {
    const result = calculateSwp({
      totalInvestment: 10000000, // ₹1 Crore
      monthlyWithdrawal: 50000,  // ₹50,000/mo (6% initial rate)
      expectedReturnRate: 10,    // 10% return > 6% payout
      tenureYears: 10,
      isInflationAdjusted: false,
    });

    expect(result.totalInvestment).toBe(10000000);
    expect(result.totalWithdrawn).toBe(6000000); // 50K * 120 months
    expect(result.finalBalance).toBeGreaterThan(13000000); // Growing corpus (~₹1.37 Cr)
    expect(result.isDepleted).toBe(false);
    expect(result.depletionStatus).toBe('target_reached');
  });

  it('calculates inflation-adjusted monthly withdrawal accurately (Reference Case A - Inflation)', () => {
    const result = calculateSwp({
      totalInvestment: 10000000,
      monthlyWithdrawal: 50000,
      expectedReturnRate: 10,
      tenureYears: 30,
      inflationRate: 6,
      isInflationAdjusted: true,
    });

    // At 10% return vs 6% inflation on ₹1 Cr starting corpus, early compounding growth keeps corpus positive for >30 Yrs
    expect(result.totalInvestment).toBe(10000000);
    expect(result.longevityYears).toBe(30);
    expect(result.finalBalance).toBeGreaterThan(0);
  });

  it('verifies Reference Case B: ₹1 Cr corpus, ₹40k payout, 8% return', () => {
    const result = calculateSwp({
      totalInvestment: 10000000,
      monthlyWithdrawal: 40000, // 4.8% initial withdrawal rate
      expectedReturnRate: 8,
      tenureYears: 10,
      isInflationAdjusted: false,
    });

    expect(result.totalWithdrawn).toBe(4800000);
    expect(result.finalBalance).toBeGreaterThan(14000000); // ~₹1.44 Cr
    expect(result.isDepleted).toBe(false);
    expect(result.initialWithdrawalRatePct).toBe(4.8);
  });

  it('verifies Reference Case C: ₹50 Lakh corpus, ₹50k payout, 8% return, 6% inflation', () => {
    // Fixed Withdrawal Test
    const fixedResult = calculateSwp({
      totalInvestment: 5000000,
      monthlyWithdrawal: 50000, // 12% initial rate
      expectedReturnRate: 8,
      tenureYears: 20,
      isInflationAdjusted: false,
    });

    expect(fixedResult.isDepleted).toBe(true);
    expect(fixedResult.longevityMonths).toBe(166); // 13 Yrs 10 Mos (166 months)
    expect(fixedResult.longevityYears).toBe(13.8);

    // Inflation-Adjusted Withdrawal Test
    const inflationResult = calculateSwp({
      totalInvestment: 5000000,
      monthlyWithdrawal: 50000,
      expectedReturnRate: 8,
      tenureYears: 20,
      inflationRate: 6,
      isInflationAdjusted: true,
    });

    expect(inflationResult.isDepleted).toBe(true);
    expect(inflationResult.longevityMonths).toBe(115); // 9 Yrs 7 Mos (115 months)
  });

  it('verifies Reference Case D: Zero-Return Stress Scenario (0% return)', () => {
    const result = calculateSwp({
      totalInvestment: 10000000,
      monthlyWithdrawal: 50000,
      expectedReturnRate: 0,
      tenureYears: 25,
      isInflationAdjusted: false,
    });

    expect(result.isDepleted).toBe(true);
    expect(result.longevityMonths).toBe(200); // 10,000,000 / 50,000 = 200 months (16 Yrs 8 Mos)
    expect(result.totalWithdrawn).toBe(10000000); // Caps at exact corpus
    expect(result.finalBalance).toBe(0);
  });

  it('verifies Reference Case E: High-Inflation Stress Scenario (10% inflation)', () => {
    const result = calculateSwp({
      totalInvestment: 10000000,
      monthlyWithdrawal: 50000,
      expectedReturnRate: 8,
      tenureYears: 30,
      inflationRate: 10,
      isInflationAdjusted: true,
    });

    expect(result.isDepleted).toBe(true);
    expect(result.longevityYears).toBeLessThan(20); // Depletes rapidly under 10% step-up
  });

  it('solves Reverse SWP Mode (Target Duration -> Sustainable Monthly Payout)', () => {
    const result = calculateSwp({
      totalInvestment: 10000000, // ₹1 Cr
      expectedReturnRate: 8,
      calculationMode: 'reverse',
      targetDurationYears: 25,
      isInflationAdjusted: false,
    });

    expect(result.reverseResult).not.toBeNull();
    // 8% p.a. for 25 yrs on ₹1 Cr yields ~₹77,182/mo payout
    expect(result.reverseResult.initialMonthlyWithdrawal).toBeGreaterThan(70000);
    expect(result.reverseResult.initialMonthlyWithdrawal).toBeLessThan(85000);
    expect(result.monthlyWithdrawal).toBe(result.reverseResult.initialMonthlyWithdrawal);
  });

  it('computes 4-scenario sustainability comparisons correctly', () => {
    const result = calculateSwp({
      totalInvestment: 5000000,
      monthlyWithdrawal: 40000,
      expectedReturnRate: 8,
      tenureYears: 15,
    });

    expect(result.scenarios.length).toBe(4);
    const [conservative, base, optimistic, seqRisk] = result.scenarios;

    expect(conservative.annualReturn).toBe(6);
    expect(base.annualReturn).toBe(8);
    expect(optimistic.annualReturn).toBe(10);

    // Optimistic scenario should yield higher ending corpus than Conservative
    expect(optimistic.endingCorpus).toBeGreaterThan(conservative.endingCorpus);
  });

  it('estimates Indian Mutual Fund SWP Taxation (Finance Act 2024)', () => {
    // Equity Mutual Fund Test (12.5% LTCG after ₹1.25L exemption)
    const equityResult = calculateSwp({
      totalInvestment: 5000000,
      monthlyWithdrawal: 30000,
      expectedReturnRate: 12,
      tenureYears: 10,
      assetType: 'equity',
    });

    expect(equityResult.taxEstimation.taxSection).toBe('Section 112A');
    expect(equityResult.taxEstimation.grossAnnualWithdrawal).toBe(360000);

    // Debt Mutual Fund Test (Section 50AA marginal slab rate)
    const debtResult = calculateSwp({
      totalInvestment: 5000000,
      monthlyWithdrawal: 30000,
      expectedReturnRate: 8,
      tenureYears: 10,
      assetType: 'debt_mf',
      marginalTaxRatePct: 30,
    });

    expect(debtResult.taxEstimation.taxSection).toBe('Section 50AA');
    expect(debtResult.taxEstimation.estAnnualTax).toBeGreaterThan(0);
  });

  it('handles edge cases safely without NaN or negative numbers', () => {
    // Edge Case 1: Zero Corpus
    const zeroCorpus = calculateSwp({ totalInvestment: 0 });
    expect(zeroCorpus.finalBalance).toBe(0);
    expect(zeroCorpus.totalWithdrawn).toBe(0);
    expect(zeroCorpus.depletionStatus).toBe('zero_corpus');

    // Edge Case 2: Zero Withdrawal
    const zeroWithdrawal = calculateSwp({ totalInvestment: 1000000, monthlyWithdrawal: 0 });
    expect(zeroWithdrawal.totalWithdrawn).toBe(0);
    expect(zeroWithdrawal.finalBalance).toBeGreaterThan(1000000);
    expect(zeroWithdrawal.depletionStatus).toBe('zero_withdrawal');

    // Edge Case 3: Withdrawal > Corpus (Depletes in Month 1)
    const instantDepletion = calculateSwp({ totalInvestment: 10000, monthlyWithdrawal: 50000 });
    expect(instantDepletion.isDepleted).toBe(true);
    expect(instantDepletion.totalWithdrawn).toBeLessThanOrEqual(10070); // Corpus + 1 month growth
    expect(instantDepletion.finalBalance).toBe(0);
  });
});