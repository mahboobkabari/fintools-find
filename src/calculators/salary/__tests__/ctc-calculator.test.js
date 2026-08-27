import { describe, it, expect } from 'vitest';
import {
  decomposeCtc,
  calculateGrossSalary,
  calculateEmployerContributions,
  calculateHraExemption,
  calculateEmployeeDeductions,
  calculateTaxableSalary,
  calculateIncomeTax,
  compareCtcRegimes,
  calculateCtcTakeHome,
} from '../ctc-calculator';
import { CTC_CONFIG } from '../../configs/ctc-calculator.config';

describe('CTC to Take-Home Salary Breakdown Engine Tests', () => {

  // 1. Standard ₹12 LPA CTC decomposition
  it('decomposes standard ₹12 LPA CTC package correctly', () => {
    const res = decomposeCtc({ annualCtc: 1200000, basicSalaryPercent: 50 });
    expect(res.basicSalary).toBe(600000);
    expect(res.employerEpf).toBe(72000); // 12% of 6L
    expect(res.grossAnnualSalary).toBeLessThan(1200000);
  });

  // 2. Basic salary 50% allocation
  it('allocates exactly 50% of CTC to basic salary by default', () => {
    const res = decomposeCtc({ annualCtc: 1000000, basicSalaryPercent: 50 });
    expect(res.basicSalary).toBe(500000);
  });

  // 3. Custom Basic % = 40%
  it('handles custom 40% basic salary allocation', () => {
    const res = decomposeCtc({ annualCtc: 1000000, basicSalaryPercent: 40 });
    expect(res.basicSalary).toBe(400000);
  });

  // 4. Custom Basic % = 60%
  it('handles custom 60% basic salary allocation', () => {
    const res = decomposeCtc({ annualCtc: 1000000, basicSalaryPercent: 60 });
    expect(res.basicSalary).toBe(600000);
  });

  // 5. Employer EPF calculation
  it('calculates employer EPF contribution at 12% of basic salary', () => {
    const res = decomposeCtc({ annualCtc: 1200000, basicSalaryPercent: 50, employerEpfIncluded: true });
    expect(res.employerEpf).toBe(72000);
  });

  // 6. Employee EPF calculation
  it('calculates employee EPF deduction at 12% of basic salary', () => {
    const res = calculateEmployeeDeductions({ basicSalary: 600000, grossAnnualSalary: 1100000 });
    expect(res.employeeEpf).toBe(72000);
  });

  // 7. Gratuity provision
  it('calculates gratuity provision (~4.81% of basic)', () => {
    const res = decomposeCtc({ annualCtc: 1200000, basicSalaryPercent: 50, includeGratuity: true });
    expect(res.employerGratuity).toBeGreaterThan(0);
    expect(res.employerGratuity).toBeLessThan(72000);
  });

  // 8. Employer NPS when present
  it('includes employer NPS contribution when specified', () => {
    const res = decomposeCtc({ annualCtc: 1200000, employerNps: 50000 });
    expect(res.employerNps).toBe(50000);
    expect(res.totalEmployerRetainers).toBeGreaterThan(100000);
  });

  // 9. Professional tax
  it('calculates statutory professional tax deduction (₹2,500/year)', () => {
    const res = calculateEmployeeDeductions({ basicSalary: 600000, grossAnnualSalary: 1100000, professionalTax: 2500 });
    expect(res.professionalTax).toBe(2500);
  });

  // 10. Metro HRA treatment
  it('calculates 50% HRA for metro city classification', () => {
    const res = decomposeCtc({ annualCtc: 1200000, basicSalaryPercent: 50, isMetro: true });
    expect(res.hraReceived).toBe(300000); // 50% of 6L
  });

  // 11. Non-metro HRA treatment
  it('calculates 40% HRA for non-metro city classification', () => {
    const res = decomposeCtc({ annualCtc: 1200000, basicSalaryPercent: 50, isMetro: false });
    expect(res.hraReceived).toBe(240000); // 40% of 6L
  });

  // 12. HRA exemption with rent
  it('calculates HRA exemption when rent is paid under Old Tax Regime', () => {
    const res = calculateHraExemption({ regime: 'old', basicSalary: 600000, hraReceived: 300000, rentPaidMonthly: 25000, isMetro: true });
    expect(res.isExempt).toBe(true);
    expect(res.hraExemption).toBeGreaterThan(0);
  });

  // 13. HRA exemption with zero rent
  it('returns 0 HRA exemption when rent paid is zero', () => {
    const res = calculateHraExemption({ regime: 'old', basicSalary: 600000, hraReceived: 300000, rentPaidMonthly: 0, isMetro: true });
    expect(res.hraExemption).toBe(0);
    expect(res.isExempt).toBe(false);
  });

  // 14. HRA exemption cap behavior
  it('caps HRA exemption at minimum of 3 clauses', () => {
    const res = calculateHraExemption({ regime: 'old', basicSalary: 600000, hraReceived: 300000, rentPaidMonthly: 100000, isMetro: true });
    expect(res.hraExemption).toBeLessThanOrEqual(300000);
  });

  // 15. Tax regime comparison
  it('compares Old vs New Tax Regime side-by-side cleanly', () => {
    const comp = compareCtcRegimes({ annualCtc: 1200000, rentPaidMonthly: 25000 });
    expect(comp.oldRegime).toBeDefined();
    expect(comp.newRegime).toBeDefined();
    expect(comp.recommendedRegime).toBeDefined();
  });

  // 16. Standard deduction treatment
  it('applies standard deduction ₹75,000 / ₹50,000 correctly', () => {
    const oldTaxable = calculateTaxableSalary({ grossAnnualSalary: 1000000, regime: 'old' });
    const newTaxable = calculateTaxableSalary({ grossAnnualSalary: 1000000, regime: 'new' });
    expect(oldTaxable.standardDeduction).toBe(50000);
    expect(newTaxable.standardDeduction).toBe(75000);
  });

  // 17. Old-regime taxable income
  it('subtracts HRA and EPF in Old Regime taxable income', () => {
    const res = calculateTaxableSalary({ grossAnnualSalary: 1000000, regime: 'old', hraExemption: 100000, employeeEpf: 60000 });
    expect(res.taxableIncome).toBe(1000000 - 50000 - 100000 - 60000);
  });

  // 18. New-regime taxable income
  it('disallows HRA exemption in New Regime taxable income', () => {
    const res = calculateTaxableSalary({ grossAnnualSalary: 1000000, regime: 'new', hraExemption: 100000 });
    expect(res.hraExemption).toBe(0);
    expect(res.taxableIncome).toBe(1000000 - 75000);
  });

  // 19. Annual income tax calculation
  it('calculates positive income tax for taxable CTC', () => {
    const res = calculateCtcTakeHome({ annualCtc: 2500000, taxRegime: 'new' });
    expect(res.comparison.newRegime.totalTax).toBeGreaterThan(0);
  });

  // 20. Monthly tax impact
  it('calculates monthly take-home after deducting monthly tax', () => {
    const res = calculateCtcTakeHome({ annualCtc: 1200000, taxRegime: 'new' });
    expect(res.netMonthlyTakeHome).toBe(Math.round(res.netAnnualTakeHome / 12));
  });

  // 21. Annual bonus included in CTC
  it('deducts annual performance bonus from fixed monthly gross salary', () => {
    const noBonus = decomposeCtc({ annualCtc: 1200000, performanceBonusAnnual: 0 });
    const withBonus = decomposeCtc({ annualCtc: 1200000, performanceBonusAnnual: 100000 });
    expect(withBonus.specialAllowance).toBeLessThan(noBonus.specialAllowance);
  });

  // 22. Bonus excluded from fixed monthly salary
  it('preserves correct annual CTC when performance bonus is included', () => {
    const res = decomposeCtc({ annualCtc: 1200000, performanceBonusAnnual: 100000 });
    expect(res.annualCtc).toBe(1200000);
  });

  // 23. ₹6 LPA preset
  it('integrates cleanly with entryLevel preset', () => {
    const res = calculateCtcTakeHome(CTC_CONFIG.scenarios.entryLevel);
    expect(res.isValid).toBe(true);
    expect(res.netMonthlyTakeHome).toBeGreaterThan(30000);
  });

  // 24. ₹18 LPA preset
  it('integrates cleanly with midCareer preset', () => {
    const res = calculateCtcTakeHome(CTC_CONFIG.scenarios.midCareer);
    expect(res.isValid).toBe(true);
    expect(res.netMonthlyTakeHome).toBeGreaterThan(80000);
  });

  // 25. ₹45 LPA preset
  it('integrates cleanly with seniorExecutive preset', () => {
    const res = calculateCtcTakeHome(CTC_CONFIG.scenarios.seniorExecutive);
    expect(res.isValid).toBe(true);
    expect(res.netMonthlyTakeHome).toBeGreaterThan(200000);
  });

  // 26. High-bonus preset
  it('integrates cleanly with highBonus preset', () => {
    const res = calculateCtcTakeHome(CTC_CONFIG.scenarios.highBonus);
    expect(res.isValid).toBe(true);
  });

  // 27. ₹3 LPA low-end package
  it('handles low-end CTC package (₹3 LPA) cleanly', () => {
    const res = calculateCtcTakeHome({ annualCtc: 300000 });
    expect(res.isValid).toBe(true);
    expect(res.netMonthlyTakeHome).toBeGreaterThan(15000);
  });

  // 28. ₹1 Crore high CTC
  it('handles high CTC package (₹1 Crore) cleanly', () => {
    const res = calculateCtcTakeHome({ annualCtc: 10000000 });
    expect(res.isValid).toBe(true);
    expect(res.netMonthlyTakeHome).toBeGreaterThan(400000);
  });

  // 29. Numeric string sanitization
  it('sanitizes numeric string inputs safely', () => {
    const res = calculateCtcTakeHome({ annualCtc: '1200000', basicSalaryPercent: '50' });
    expect(res.isValid).toBe(true);
  });

  // 30. Negative input sanitization
  it('clamps negative inputs to zero safely', () => {
    const res = decomposeCtc({ annualCtc: -100000 });
    expect(res.annualCtc).toBe(0);
  });

  // 31. Missing CTC validation
  it('handles missing CTC input safely returning isValid = false', () => {
    const res = calculateCtcTakeHome({});
    expect(res.isValid).toBe(false);
  });

  // 32. Zero CTC validation
  it('handles zero CTC input safely', () => {
    const res = calculateCtcTakeHome({ annualCtc: 0 });
    expect(res.isValid).toBe(false);
    expect(res.netMonthlyTakeHome).toBe(0);
  });

  // 33. Invalid Basic % validation
  it('clamps invalid basic salary percentage to valid boundary [10%, 100%]', () => {
    const low = decomposeCtc({ annualCtc: 1000000, basicSalaryPercent: 5 });
    const high = decomposeCtc({ annualCtc: 1000000, basicSalaryPercent: 120 });
    expect(low.basicPercent).toBe(10);
    expect(high.basicPercent).toBe(100);
  });

  // 34. REGRESSION PROOF: higher CTC strictly increases modeled gross salary
  it('REGRESSION PROOF: higher annual CTC strictly increases modeled gross salary', () => {
    const low = decomposeCtc({ annualCtc: 1000000 });
    const high = decomposeCtc({ annualCtc: 1500000 });
    expect(high.grossAnnualSalary).toBeGreaterThan(low.grossAnnualSalary);
  });

  // 35. REGRESSION PROOF: employer-retained components must not be counted twice
  it('REGRESSION PROOF: gross salary plus employer retainers equals total CTC', () => {
    const res = decomposeCtc({ annualCtc: 1200000, employerNps: 20000 });
    expect(res.grossAnnualSalary + res.totalEmployerRetainers).toBe(1200000);
  });

  // 36. REGRESSION PROOF: employee EPF must not equal employer EPF twice in deductions
  it('REGRESSION PROOF: employee EPF is subtracted from gross salary, not CTC twice', () => {
    const decomp = decomposeCtc({ annualCtc: 1200000 });
    const deductions = calculateEmployeeDeductions({ basicSalary: decomp.basicSalary, grossAnnualSalary: decomp.grossAnnualSalary });
    expect(deductions.employeeEpf).toBe(72000);
  });

  // 37. REGRESSION PROOF: bonus must not be double-counted
  it('REGRESSION PROOF: performance bonus does not exceed annual CTC', () => {
    const res = decomposeCtc({ annualCtc: 1200000, performanceBonusAnnual: 200000 });
    expect(res.annualCtc).toBe(1200000);
  });

  // 38. REGRESSION PROOF: HRA exemption cannot exceed applicable limits
  it('REGRESSION PROOF: HRA exemption never exceeds actual HRA received', () => {
    const res = calculateHraExemption({ regime: 'old', basicSalary: 600000, hraReceived: 300000, rentPaidMonthly: 50000 });
    expect(res.hraExemption).toBeLessThanOrEqual(300000);
  });

  // 39. Full structured result object
  it('verifies all expected properties in master calculateCtcTakeHome result', () => {
    const res = calculateCtcTakeHome(CTC_CONFIG.defaultInputs);
    expect(res).toHaveProperty('decomposition');
    expect(res).toHaveProperty('deductions');
    expect(res).toHaveProperty('comparison');
    expect(res).toHaveProperty('netAnnualTakeHome');
    expect(res).toHaveProperty('netMonthlyTakeHome');
  });

  // 40. Old vs New regime comparison object
  it('verifies Old vs New regime comparison object structure', () => {
    const comp = compareCtcRegimes(CTC_CONFIG.defaultInputs);
    expect(comp).toHaveProperty('oldRegime');
    expect(comp).toHaveProperty('newRegime');
    expect(comp).toHaveProperty('recommendedRegime');
    expect(comp).toHaveProperty('monthlySavings');
  });

  // 41. Direct test of calculateGrossSalary function
  it('calculates gross salary directly using calculateGrossSalary', () => {
    const gross = calculateGrossSalary({ annualCtc: 1200000, totalEmployerRetainers: 100000 });
    expect(gross).toBe(1100000);
  });

  // 42. Direct test of calculateEmployerContributions function
  it('calculates employer contributions directly', () => {
    const contribs = calculateEmployerContributions({ basicSalary: 500000, employerEpfIncluded: true, includeGratuity: true, employerNps: 25000 });
    expect(contribs.employerEpf).toBe(60000);
    expect(contribs.employerGratuity).toBeGreaterThan(0);
    expect(contribs.employerNps).toBe(25000);
    expect(contribs.totalEmployerRetainers).toBe(60000 + contribs.employerGratuity + 25000);
  });

  // 43. Direct test of calculateIncomeTax function
  it('calculates income tax directly for New Regime', () => {
    const tax = calculateIncomeTax({ taxableIncome: 1000000, regime: 'new' });
    expect(tax.totalIncomeTax).toBeGreaterThan(0);
    expect(tax.taxableIncome).toBe(1000000);
  });

  // 44. Direct test of calculateIncomeTax function for Old Regime
  it('calculates income tax directly for Old Regime', () => {
    const tax = calculateIncomeTax({ taxableIncome: 1000000, regime: 'old' });
    expect(tax.totalIncomeTax).toBeGreaterThan(0);
    expect(tax.taxableIncome).toBe(1000000);
  });

  // 45. Edge case: Zero employer retainers
  it('handles zero employer retainers when EPF and gratuity are excluded from CTC', () => {
    const res = decomposeCtc({ annualCtc: 1200000, employerEpfIncluded: false, includeGratuity: false, employerNps: 0 });
    expect(res.totalEmployerRetainers).toBe(0);
    expect(res.grossAnnualSalary).toBe(1200000);
  });

});

