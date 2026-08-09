import { describe, it, expect } from 'vitest';
import { calculateProvidentFundCalculator } from '../provident-fund-calculator.js';

describe('Provident Fund (EPF & VPF) Calculator Math Engine — Sprint 31 Flagship Audit', () => {
  it('Reference Case A: Standard EPF Only (₹50,000 Basic, 0% VPF, 8.25% Rate, 25 to 58 Yrs)', () => {
    const result = calculateProvidentFundCalculator({
      monthlyBasicSalary: 50000,
      monthlyDa: 0,
      currentAge: 25,
      retirementAge: 58,
      epfInterestRate: 8.25,
      annualSalaryIncrease: 5,
      currentEpfBalance: 0,
      vpfValue: 0,
    });

    expect(result.monthlyBasicSalary).toBe(50000);
    expect(result.yearsInvested).toBe(33); // 58 - 25
    expect(result.totalEmployeeContribution).toBeGreaterThan(5000000);
    expect(result.totalEmployerContribution).toBeGreaterThan(1500000);
    expect(result.finalEpfBalance).toBeGreaterThan(15000000); // >₹1.5 Crores
    expect(result.wealthMultiplier).toBeGreaterThan(2.0);
  });

  it('Reference Case B: EPF + VPF (+10% VPF Top-Up)', () => {
    const epfOnly = calculateProvidentFundCalculator({
      monthlyBasicSalary: 50000,
      currentAge: 25,
      retirementAge: 58,
      vpfValue: 0,
    });

    const epfPlusVpf = calculateProvidentFundCalculator({
      monthlyBasicSalary: 50000,
      currentAge: 25,
      retirementAge: 58,
      vpfContributionType: 'percentage',
      vpfValue: 10, // 10% VPF top-up
    });

    expect(epfPlusVpf.vpfCorpus).toBeGreaterThan(0);
    expect(epfPlusVpf.finalEpfBalance).toBeGreaterThan(epfOnly.finalEpfBalance);
  });

  it('Reference Case C: EPS Pension Allocation Ceiling (8.33% of ₹15,000 = ₹1,250/mo)', () => {
    const result = calculateProvidentFundCalculator({
      monthlyBasicSalary: 100000, // ₹1 Lakh Basic
      currentAge: 30,
      retirementAge: 58,
      yearsInvested: 28,
    });

    // Monthly EPS contribution is capped at ₹15,000 * 8.33% = ₹1,250/mo -> ₹15,000/year
    const expectedTotalEps = 1250 * 12 * 28; // ₹4.2 Lakhs total EPS
    expect(result.totalEpsContribution).toBe(expectedTotalEps);
  });

  it('Reference Case D: Section 10(11) Tax Threshold Alert (Employee Contrib > ₹2.5L/yr)', () => {
    // Basic ₹2.0 Lakhs/mo -> 12% EPF = ₹24,000/mo -> ₹2,88,000/yr (exceeds ₹2.5L threshold)
    const result = calculateProvidentFundCalculator({
      monthlyBasicSalary: 200000,
      currentAge: 35,
      retirementAge: 58,
      annualSalaryIncrease: 0,
    });

    expect(result.isSec10_11_Taxable).toBe(true);
    expect(result.maxAnnualEmployeeContrib).toBe(288000);
    expect(result.taxableEmployeeContribYearly).toBe(38000); // 2.88L - 2.50L
  });

  it('Reference Case E: Zero-Interest Stress Case (0% EPFO Rate)', () => {
    const zeroRate = calculateProvidentFundCalculator({
      monthlyBasicSalary: 50000,
      currentAge: 25,
      retirementAge: 58,
      epfInterestRate: 0,
      annualSalaryIncrease: 0,
    });

    expect(zeroRate.totalInterestEarned).toBe(0);
    expect(zeroRate.finalEpfBalance).toBe(zeroRate.totalContribution);
  });

  it('Reference Case F: Existing Balance Inclusion', () => {
    const withBalance = calculateProvidentFundCalculator({
      monthlyBasicSalary: 50000,
      currentAge: 35,
      retirementAge: 58,
      currentEpfBalance: 1000000, // ₹10 Lakhs existing balance
    });

    expect(withBalance.finalEpfBalance).toBeGreaterThan(1000000);
  });

  it('Reference Case G: Reverse VPF Solver & Round-Trip Consistency', () => {
    const goalResult = calculateProvidentFundCalculator({
      monthlyBasicSalary: 60000,
      currentAge: 30,
      retirementAge: 58,
      calculationMode: 'reverse_vpf',
      targetVpfCorpus: 10000000, // ₹1 Crore VPF target
    });

    expect(goalResult.vpfValue).toBeGreaterThan(0);

    // Round-trip verification: feed solved VPF contribution back into forward engine
    const roundTrip = calculateProvidentFundCalculator({
      monthlyBasicSalary: 60000,
      currentAge: 30,
      retirementAge: 58,
      vpfContributionType: 'fixed_amount',
      vpfValue: goalResult.vpfValue,
      calculationMode: 'forward',
    });

    expect(Math.abs(roundTrip.vpfCorpus - 10000000) / 10000000).toBeLessThan(0.01); // within 1%
  });

  it('computes 4-Scenario VPF comparison grid correctly', () => {
    const result = calculateProvidentFundCalculator({
      monthlyBasicSalary: 50000,
      currentAge: 25,
      retirementAge: 58,
    });

    expect(result.vpfScenarios.length).toBe(4);
    const [sc0, sc2k, sc5k, sc10k] = result.vpfScenarios;

    expect(sc10k.finalCorpus).toBeGreaterThan(sc5k.finalCorpus);
    expect(sc5k.finalCorpus).toBeGreaterThan(sc2k.finalCorpus);
    expect(sc2k.finalCorpus).toBeGreaterThan(sc0.finalCorpus);
  });

  it('handles edge cases safely without NaN or negative values', () => {
    // Edge Case 1: Zero Basic Salary
    const zeroSal = calculateProvidentFundCalculator({ monthlyBasicSalary: 0 });
    expect(zeroSal.finalEpfBalance).toBe(0);

    // Edge Case 2: Retirement Age = Current Age
    const sameAge = calculateProvidentFundCalculator({ currentAge: 58, retirementAge: 58 });
    expect(sameAge.yearsInvested).toBe(1); // Min 1 year
  });
});