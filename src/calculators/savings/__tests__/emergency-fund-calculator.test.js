import { describe, it, expect } from 'vitest';
import {
  calculateEmergencyFund,
  calculateEssentialMonthlyExpenses,
  calculateEmergencyFundTarget,
  calculateFundingGap,
  calculateMonthsToTarget,
  calculateScenarioTarget,
} from '../emergency-fund-calculator.js';
import { EMERGENCY_FUND_CONFIG } from '../../configs/emergency-fund-calculator.config.js';

describe('Emergency Fund Financial Engine', () => {

  // 1. Basic monthly-expense calculation (Scenario A)
  it('calculates basic essential monthly expenses accurately (Scenario A)', () => {
    const expenses = calculateEssentialMonthlyExpenses({
      housingRentMortgage: 20000,
      utilities: 3000,
      groceriesFood: 12000,
      insurancePremiums: 2000,
      transportation: 4000,
      minimumDebtPayments: 5000,
      healthcare: 2000,
      childcareDependentCare: 0,
      otherEssentials: 2000,
    });
    expect(expenses).toBe(50000);
  });

  // 2. Housing expense isolation
  it('handles housing expense in isolation', () => {
    const expenses = calculateEssentialMonthlyExpenses({ housingRentMortgage: 25000 });
    expect(expenses).toBe(25000);
  });

  // 3. Utilities expense isolation
  it('handles utilities expense in isolation', () => {
    const expenses = calculateEssentialMonthlyExpenses({ utilities: 4500 });
    expect(expenses).toBe(4500);
  });

  // 4. Food & Groceries isolation
  it('handles food & groceries expense in isolation', () => {
    const expenses = calculateEssentialMonthlyExpenses({ groceriesFood: 15000 });
    expect(expenses).toBe(15000);
  });

  // 5. Insurance premiums isolation
  it('handles insurance premiums in isolation', () => {
    const expenses = calculateEssentialMonthlyExpenses({ insurancePremiums: 3000 });
    expect(expenses).toBe(3000);
  });

  // 6. Transportation isolation
  it('handles essential transportation in isolation', () => {
    const expenses = calculateEssentialMonthlyExpenses({ transportation: 5000 });
    expect(expenses).toBe(5000);
  });

  // 7. Minimum debt payments isolation
  it('handles minimum debt EMIs in isolation', () => {
    const expenses = calculateEssentialMonthlyExpenses({ minimumDebtPayments: 10000 });
    expect(expenses).toBe(10000);
  });

  // 8. Healthcare isolation
  it('handles healthcare expenses in isolation', () => {
    const expenses = calculateEssentialMonthlyExpenses({ healthcare: 2500 });
    expect(expenses).toBe(2500);
  });

  // 9. Child/dependent care isolation
  it('handles childcare & dependent care expenses in isolation', () => {
    const expenses = calculateEssentialMonthlyExpenses({ childcareDependentCare: 8000 });
    expect(expenses).toBe(8000);
  });

  // 10. Other essential expenses isolation
  it('handles other essential recurring expenses in isolation', () => {
    const expenses = calculateEssentialMonthlyExpenses({ otherEssentials: 3500 });
    expect(expenses).toBe(3500);
  });

  // 11. Total essential expenses aggregation
  it('aggregates all 9 essential expense categories accurately', () => {
    const res = calculateEmergencyFund({
      housingRentMortgage: 10000,
      utilities: 1000,
      groceriesFood: 5000,
      insurancePremiums: 1000,
      transportation: 2000,
      minimumDebtPayments: 3000,
      healthcare: 1000,
      childcareDependentCare: 2000,
      otherEssentials: 1000,
    });
    expect(res.essentialMonthlyExpenses).toBe(26000);
  });

  // 12. Target months calculation
  it('calculates target reserve amount for 6 months', () => {
    const target = calculateEmergencyFundTarget(50000, 6);
    expect(target).toBe(300000);
  });

  // 13. Emergency fund target verification (Scenario A)
  it('verifies 6-month target amount equals ₹3,00,000 for ₹50,000 expenses (Scenario A)', () => {
    const res = calculateEmergencyFund({
      housingRentMortgage: 20000,
      utilities: 3000,
      groceriesFood: 12000,
      insurancePremiums: 2000,
      transportation: 4000,
      minimumDebtPayments: 5000,
      healthcare: 2000,
      otherEssentials: 2000,
      targetMonths: 6,
    });
    expect(res.essentialMonthlyExpenses).toBe(50000);
    expect(res.targetAmount).toBe(300000);
  });

  // 14. Current savings offset (Scenario B)
  it('calculates funding gap accurately when current savings exist (Scenario B)', () => {
    const gap = calculateFundingGap(300000, 125000);
    expect(gap).toBe(175000);

    const res = calculateEmergencyFund({
      housingRentMortgage: 20000,
      utilities: 3000,
      groceriesFood: 12000,
      insurancePremiums: 2000,
      transportation: 4000,
      minimumDebtPayments: 5000,
      healthcare: 2000,
      otherEssentials: 2000,
      targetMonths: 6,
      currentEmergencySavings: 125000,
    });
    expect(res.targetAmount).toBe(300000);
    expect(res.fundingGap).toBe(175000);
    expect(res.isFullyFunded).toBe(false);
  });

  // 15. Funding gap cannot become negative (Scenario C)
  it('ensures funding gap never becomes negative when savings exceed target (Scenario C)', () => {
    const gap = calculateFundingGap(300000, 400000);
    expect(gap).toBe(0);

    const res = calculateEmergencyFund({
      housingRentMortgage: 20000,
      utilities: 3000,
      groceriesFood: 12000,
      insurancePremiums: 2000,
      transportation: 4000,
      minimumDebtPayments: 5000,
      healthcare: 2000,
      otherEssentials: 2000,
      targetMonths: 6,
      currentEmergencySavings: 400000,
    });
    expect(res.targetAmount).toBe(300000);
    expect(res.fundingGap).toBe(0);
    expect(res.surplusAmount).toBe(100000);
    expect(res.isFullyFunded).toBe(true);
  });

  // 16. Funding gap zero verification
  it('verifies exact funding gap zero when savings equal target', () => {
    const gap = calculateFundingGap(300000, 300000);
    expect(gap).toBe(0);
  });

  // 17. Zero monthly contribution (Scenario E)
  it('returns null months to target when monthly contribution is zero (Scenario E)', () => {
    const months = calculateMonthsToTarget(180000, 0);
    expect(months).toBeNull();

    const res = calculateEmergencyFund({
      housingRentMortgage: 30000,
      targetMonths: 6, // target = 180k
      currentEmergencySavings: 0,
      monthlyContribution: 0,
    });
    expect(res.fundingGap).toBe(180000);
    expect(res.monthsToTarget).toBeNull();
  });

  // 18. Positive monthly contribution (Scenario D)
  it('calculates 12 months to target for ₹1.8L gap at ₹15k monthly contribution (Scenario D)', () => {
    const months = calculateMonthsToTarget(180000, 15000);
    expect(months).toBe(12);

    const res = calculateEmergencyFund({
      housingRentMortgage: 30000,
      targetMonths: 6, // target = 180k
      currentEmergencySavings: 0,
      monthlyContribution: 15000,
    });
    expect(res.fundingGap).toBe(180000);
    expect(res.monthsToTarget).toBe(12);
  });

  // 19. Months-to-target ceiling rounding
  it('rounds up partial months to target accurately using ceiling logic', () => {
    const months = calculateMonthsToTarget(100000, 15000); // 100k / 15k = 6.666 -> 7
    expect(months).toBe(7);
  });

  // 20. Variable-income scenario (Scenario F)
  it('calculates illustrative target months for variable income (Scenario F)', () => {
    const targetMonths = calculateScenarioTarget('variable', 0);
    expect(targetMonths).toBe(6);
  });

  // 21. Stable-income scenario
  it('calculates illustrative target months for stable income', () => {
    const targetMonths = calculateScenarioTarget('stable', 0);
    expect(targetMonths).toBe(3);
  });

  // 22. Multiple dependents scenario
  it('calculates illustrative target months for 3+ dependents', () => {
    const targetMonths = calculateScenarioTarget('stable', 3);
    expect(targetMonths).toBe(6); // 3 base + 3 for 3+ dependents

    const freelanceMonths = calculateScenarioTarget('freelance', 3);
    expect(freelanceMonths).toBe(12); // 9 base + 3 for 3+ dependents
  });

  // 23. Numeric-string sanitization
  it('sanitizes numeric string inputs safely', () => {
    const res = calculateEmergencyFund({
      housingRentMortgage: '20000',
      utilities: '3000',
      targetMonths: '6',
      currentEmergencySavings: '50000',
      monthlyContribution: '10000',
    });
    expect(res.essentialMonthlyExpenses).toBe(23000);
    expect(res.targetAmount).toBe(138000);
    expect(res.fundingGap).toBe(88000);
    expect(res.monthsToTarget).toBe(9); // ceil(88000 / 10000) = 9
  });

  // 24. Negative input handling (Scenario G)
  it('sanitizes negative inputs to 0 safely (Scenario G)', () => {
    const res = calculateEmergencyFund({
      housingRentMortgage: -20000,
      utilities: -3000,
      currentEmergencySavings: -50000,
      monthlyContribution: -10000,
    });
    expect(res.essentialMonthlyExpenses).toBe(0);
    expect(res.targetAmount).toBe(0);
    expect(res.fundingGap).toBe(0);
  });

  // 25. Large-value handling
  it('handles very large expense figures (e.g. ₹5 Lakhs/mo) cleanly', () => {
    const res = calculateEmergencyFund({
      housingRentMortgage: 500000,
      targetMonths: 12,
    });
    expect(res.essentialMonthlyExpenses).toBe(500000);
    expect(res.targetAmount).toBe(6000000);
  });

  // 26. Zero essential expenses
  it('handles zero essential expenses returning valid zero target state', () => {
    const res = calculateEmergencyFund({
      housingRentMortgage: 0,
      utilities: 0,
    });
    expect(res.essentialMonthlyExpenses).toBe(0);
    expect(res.targetAmount).toBe(0);
    expect(res.fundingGap).toBe(0);
    expect(res.progressPercent).toBe(100);
  });

  // 27. Preset calculations integration
  it('integrates cleanly with default scenario presets', () => {
    const preset = EMERGENCY_FUND_CONFIG.scenarios.familyMortgage;
    const res = calculateEmergencyFund(preset);

    expect(res.essentialMonthlyExpenses).toBe(82000);
    expect(res.targetAmount).toBe(492000); // 82,000 * 6
    expect(res.fundingGap).toBe(342000); // 492,000 - 150,000
    expect(res.monthsToTarget).toBe(23); // ceil(342000 / 15000) = 23
  });

  // 28. Regression scenarios (Empty Options)
  it('handles empty options object safely returning default valid state', () => {
    const res = calculateEmergencyFund();
    expect(res.isValid).toBe(false);
    expect(res.essentialMonthlyExpenses).toBe(0);
    expect(res.targetAmount).toBe(0);
  });
});
