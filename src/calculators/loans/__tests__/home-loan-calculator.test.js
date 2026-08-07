import { describe, it, expect } from 'vitest';
import { calculateHomeLoan } from '../home-loan-calculator.js';

describe('Home Loan Calculator Math Engine', () => {
  it('calculates accurate home loan EMI and down payment for benchmark values', () => {
    const result = calculateHomeLoan({
      propertyValue: 5000000, // ₹50 Lakhs
      downPaymentPct: 20,     // 20% = ₹10 Lakhs down payment, ₹40 Lakhs loan
      rate: 8.5,              // 8.5% p.a.
      tenure: 20,             // 20 Years
      tenureType: 'years',
      processingFeePct: 0.5,  // 0.5% = ₹20,000 processing fee
      stampDutyPct: 6.0,      // 6% = ₹300,000 stamp duty
    });

    expect(result.loanAmount).toBe(4000000);
    expect(result.downPaymentAmount).toBe(1000000);
    expect(result.emi).toBe(34713);
    expect(result.processingFee).toBe(20000);
    expect(result.stampDutyAmount).toBe(300000);
    expect(result.totalInterest).toBe(4331120);
    expect(result.totalPayment).toBe(4000000 + 4331120 + 20000);
    expect(result.totalOwnershipCost).toBe(5000000 + 4331120 + 20000 + 300000);
    expect(result.schedule.length).toBe(240); // 240 monthly schedule rows
  });

  it('handles 0% down payment cleanly', () => {
    const result = calculateHomeLoan({
      propertyValue: 1000000,
      downPaymentPct: 0,
      rate: 10,
      tenure: 10,
      tenureType: 'years',
    });

    expect(result.loanAmount).toBe(1000000);
    expect(result.downPaymentAmount).toBe(0);
    expect(result.emi).toBeGreaterThan(0);
  });

  it('simulates down payment impact accurately when increasing DP by 5%', () => {
    const result = calculateHomeLoan({
      propertyValue: 5000000,
      downPaymentPct: 20,
      rate: 8.5,
      tenure: 20,
    });

    const dpImpact = result.downPaymentImpact;
    expect(dpImpact.currentDpPct).toBe(20);
    expect(dpImpact.altDpPct).toBe(25);
    expect(dpImpact.additionalDpNeeded).toBe(250000); // 5% of 50L = 2.5L
    expect(dpImpact.emiSavings).toBeGreaterThan(0);
    expect(dpImpact.interestSaved).toBeGreaterThan(0);
  });

  it('evaluates FOIR affordability categories correctly', () => {
    // 1. Excellent FOIR (<30%)
    const resLow = calculateHomeLoan({
      propertyValue: 3000000,
      downPaymentPct: 20,
      rate: 8.5,
      tenure: 20,
      monthlyIncome: 200000, // Monthly EMI ~₹20,828 / 200,000 = ~10%
    });
    expect(resLow.affordability.category).toBe('Excellent');

    // 2. Good FOIR (30%-40%)
    const resGood = calculateHomeLoan({
      propertyValue: 5000000,
      downPaymentPct: 20,
      rate: 8.5,
      tenure: 20,
      monthlyIncome: 100000, // Monthly EMI ~₹34,713 / 100,000 = ~35%
    });
    expect(resGood.affordability.category).toBe('Good');

    // 3. Risky FOIR (>50%)
    const resRisky = calculateHomeLoan({
      propertyValue: 5000000,
      downPaymentPct: 20,
      rate: 8.5,
      tenure: 20,
      monthlyIncome: 50000, // EMI 34.7k / 50k = 69%
    });
    expect(resRisky.affordability.category).toBe('Risky');
  });

  it('calculates Section 24b and Section 80C tax deduction caps correctly', () => {
    const result = calculateHomeLoan({
      propertyValue: 6000000,
      downPaymentPct: 20,
      rate: 8.5,
      tenure: 20,
      taxSlabPct: 30,
    });

    const tax = result.taxBenefit;
    expect(tax.sec24bDeduction).toBeLessThanOrEqual(200000);
    expect(tax.sec80cDeduction).toBeLessThanOrEqual(150000);
    expect(tax.totalTaxDeduction).toBe(tax.sec24bDeduction + tax.sec80cDeduction);
    expect(tax.annualTaxSaved).toBe(Math.round(tax.totalTaxDeduction * 0.3));
  });

  it('generates 4 contextual smart recommendations', () => {
    const result = calculateHomeLoan({
      propertyValue: 5000000,
      downPaymentPct: 20,
      rate: 8.5,
      tenure: 20,
    });

    expect(result.smartRecommendations.length).toBe(4);
    expect(result.smartRecommendations[0].type).toBe('downPayment');
    expect(result.smartRecommendations[1].type).toBe('tenure');
    expect(result.smartRecommendations[2].type).toBe('rate');
    expect(result.smartRecommendations[3].type).toBe('prepayment');
  });
});