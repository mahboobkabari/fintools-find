import { describe, it, expect } from 'vitest';
import { calculateApyCalculator } from '../apy-calculator.js';

describe('Flagship Atal Pension Yojana (APY) Math Engine', () => {
  it('1. verifies Entry Age 18 for ₹5,000/mo pension (Monthly contribution = ₹210)', () => {
    const result = calculateApyCalculator({
      entryAge: 18,
      targetPension: 5000,
    });

    expect(result.entryAge).toBe(18);
    expect(result.targetPension).toBe(5000);
    expect(result.monthlyContribution).toBe(210);
    expect(result.tenureYears).toBe(42);
    expect(result.totalEmployeeContribution).toBe(105840); // 42 * 12 * ₹210 = ₹105,840
    expect(result.nomineeCorpusReturn).toBe(850000);
  });

  it('2. verifies Entry Age 30 for ₹5,000/mo pension (Monthly contribution = ₹577)', () => {
    const result = calculateApyCalculator({
      entryAge: 30,
      targetPension: 5000,
    });

    expect(result.entryAge).toBe(30);
    expect(result.monthlyContribution).toBe(577);
    expect(result.tenureYears).toBe(30);
    expect(result.totalEmployeeContribution).toBe(207720); // 30 * 12 * ₹577 = ₹207,720
    expect(result.nomineeCorpusReturn).toBe(850000);
  });

  it('3. verifies Entry Age 40 for ₹5,000/mo pension (Monthly contribution = ₹1,454)', () => {
    const result = calculateApyCalculator({
      entryAge: 40,
      targetPension: 5000,
    });

    expect(result.entryAge).toBe(40);
    expect(result.monthlyContribution).toBe(1454);
    expect(result.tenureYears).toBe(20);
    expect(result.totalEmployeeContribution).toBe(348960); // 20 * 12 * ₹1,454 = ₹348,960
    expect(result.nomineeCorpusReturn).toBe(850000);
  });

  it('4. verifies Entry Age 18 for ₹1,000/mo pension (Monthly contribution = ₹42)', () => {
    const result = calculateApyCalculator({
      entryAge: 18,
      targetPension: 1000,
    });

    expect(result.entryAge).toBe(18);
    expect(result.monthlyContribution).toBe(42);
    expect(result.tenureYears).toBe(42);
    expect(result.totalEmployeeContribution).toBe(21168); // 42 * 12 * ₹42 = ₹21,168
    expect(result.nomineeCorpusReturn).toBe(170000);
  });

  it('5. verifies PFRDA contribution matrix lookup across all 5 pension tiers at Entry Age 25', () => {
    const t1 = calculateApyCalculator({ entryAge: 25, targetPension: 1000 });
    const t2 = calculateApyCalculator({ entryAge: 25, targetPension: 2000 });
    const t3 = calculateApyCalculator({ entryAge: 25, targetPension: 3000 });
    const t4 = calculateApyCalculator({ entryAge: 25, targetPension: 4000 });
    const t5 = calculateApyCalculator({ entryAge: 25, targetPension: 5000 });

    expect(t1.monthlyContribution).toBe(76);
    expect(t2.monthlyContribution).toBe(151);
    expect(t3.monthlyContribution).toBe(226);
    expect(t4.monthlyContribution).toBe(301);
    expect(t5.monthlyContribution).toBe(376);
  });

  it('6. verifies nominee return of corpus across all 5 pension tiers', () => {
    const t1 = calculateApyCalculator({ entryAge: 25, targetPension: 1000 });
    const t2 = calculateApyCalculator({ entryAge: 25, targetPension: 2000 });
    const t3 = calculateApyCalculator({ entryAge: 25, targetPension: 3000 });
    const t4 = calculateApyCalculator({ entryAge: 25, targetPension: 4000 });
    const t5 = calculateApyCalculator({ entryAge: 25, targetPension: 5000 });

    expect(t1.nomineeCorpusReturn).toBe(170000);
    expect(t2.nomineeCorpusReturn).toBe(340000);
    expect(t3.nomineeCorpusReturn).toBe(510000);
    expect(t4.nomineeCorpusReturn).toBe(680000);
    expect(t5.nomineeCorpusReturn).toBe(850000);
  });

  it('7. computes auto-debit frequency equivalents (Monthly, Quarterly, Half-Yearly)', () => {
    const result = calculateApyCalculator({
      entryAge: 25,
      targetPension: 5000,
    });

    expect(result.monthlyContribution).toBe(376);
    expect(result.quarterlyContribution).toBe(1128); // 376 * 3
    expect(result.halfYearlyContribution).toBe(2256); // 376 * 6
  });

  it('8. calculates 42-year annual rollup schedule for Entry Age 18', () => {
    const result = calculateApyCalculator({
      entryAge: 18,
      targetPension: 5000,
    });

    expect(result.yearlySchedule.length).toBe(42);
    expect(result.yearlySchedule[0].year).toBe(1);
    expect(result.yearlySchedule[0].age).toBe(19);
    expect(result.yearlySchedule[0].annualContribution).toBe(2520); // ₹210 * 12

    expect(result.yearlySchedule[41].year).toBe(42);
    expect(result.yearlySchedule[41].age).toBe(60);
    expect(result.yearlySchedule[41].cumulativeContribution).toBe(105840);
  });

  it('9. handles invalid entry age below 18 (<18, e.g. Age 16)', () => {
    const result = calculateApyCalculator({
      entryAge: 16,
      targetPension: 5000,
    });

    expect(result.isValidEntryAge).toBe(false);
    expect(result.monthlyContribution).toBe(0);
    expect(result.heroText).toContain('outside the statutory PFRDA');
  });

  it('10. handles invalid entry age above 40 (>40, e.g. Age 45)', () => {
    const result = calculateApyCalculator({
      entryAge: 45,
      targetPension: 5000,
    });

    expect(result.isValidEntryAge).toBe(false);
    expect(result.monthlyContribution).toBe(0);
    expect(result.heroText).toContain('outside the statutory PFRDA');
  });

  it('11. computes 5% inflation-adjusted real purchasing power pension at age 60', () => {
    const result = calculateApyCalculator({
      entryAge: 30,
      targetPension: 5000,
      inflationRate: 5.0,
    });

    // ₹5,000 / (1.05)^30 = ₹1,157
    expect(result.purchasingPowerPension).toBe(1157);
  });

  it('12. handles invalid pension tier fallback to ₹5,000 default', () => {
    const result = calculateApyCalculator({
      entryAge: 25,
      targetPension: 9999, // Invalid tier
    });

    expect(result.targetPension).toBe(5000);
    expect(result.monthlyContribution).toBe(376);
  });

  it('13. computes scenario matrix comparison outputs', () => {
    const result = calculateApyCalculator({
      entryAge: 25,
      targetPension: 5000,
    });

    expect(result.scenarios.length).toBe(4);
    expect(result.scenarios[0].entryAge).toBe(25);
    expect(result.scenarios[1].entryAge).toBe(18);
    expect(result.scenarios[2].entryAge).toBe(30);
    expect(result.scenarios[3].entryAge).toBe(40);
  });

  it('14. handles USD currency mode formatting', () => {
    const result = calculateApyCalculator({
      entryAge: 25,
      targetPension: 5000,
      currency: 'USD',
    });

    expect(result.currency).toBe('USD');
    expect(result.heroText).toContain('$376');
  });

  it('15. verifies exact entry age boundaries (Age 18 and Age 40)', () => {
    const res18 = calculateApyCalculator({ entryAge: 18 });
    const res40 = calculateApyCalculator({ entryAge: 40 });

    expect(res18.isValidEntryAge).toBe(true);
    expect(res40.isValidEntryAge).toBe(true);
    expect(res18.monthlyContribution).toBe(210);
    expect(res40.monthlyContribution).toBe(1454);
  });
});
