import { describe, it, expect } from 'vitest';
import { calculateCarLoan } from '../car-loan-calculator.js';

describe('Car Loan Calculator Math Engine — Sprint 34 Flagship Audit', () => {
  it('Reference Case A: Benchmark ₹12 Lakhs Car Loan (20% DP = ₹2.4L, ₹9.6L Loan @ 9.0% for 5 Years)', () => {
    const result = calculateCarLoan({
      vehiclePrice: 1200000,
      downPaymentPct: 20,
      rate: 9.0,
      tenure: 5,
      monthlyIncome: 100000,
      fuelType: 'petrol',
    });

    expect(result.vehiclePrice).toBe(1200000);
    expect(result.downPaymentAmount).toBe(240000);
    expect(result.loanAmount).toBe(960000);
    expect(result.emi).toBe(19928); // Standard PMT(9%/12, 60, -960000) = ₹19,928
    expect(result.totalInterest).toBe(235680);
    expect(result.foirPct).toBe(20); // ₹19,928 / ₹1,00,000 = 20%
    expect(result.affordabilityStatus).toBe('Comfortable');
  });

  it('Reference Case B: Petrol vs EV 5-Year Operational Fuel & Ownership Cost Comparison', () => {
    const petrol = calculateCarLoan({
      vehiclePrice: 1500000,
      fuelType: 'petrol',
      annualKm: 15000,
    });

    const ev = calculateCarLoan({
      vehiclePrice: 1500000,
      fuelType: 'ev',
      annualKm: 15000,
    });

    expect(ev.fuel5Yr).toBeLessThan(petrol.fuel5Yr); // ₹1.12L EV electricity vs ₹5.62L petrol!
    expect(ev.totalOwnershipCost5Yr).toBeLessThan(petrol.totalOwnershipCost5Yr);
  });

  it('Reference Case C: FOIR Affordability Verdict Thresholds (Comfortable vs Moderate vs High Risk)', () => {
    const comfortable = calculateCarLoan({
      vehiclePrice: 1000000,
      monthlyIncome: 100000, // EMI ~₹16k = 16% FOIR
    });
    expect(comfortable.affordabilityStatus).toBe('Comfortable');

    const highRisk = calculateCarLoan({
      vehiclePrice: 3000000,
      monthlyIncome: 80000, // EMI ~₹49k = 62% FOIR
    });
    expect(highRisk.affordabilityStatus).toBe('High Risk');
  });

  it('Reference Case D: Down Payment Coach (+₹1 Lakh DP Savings)', () => {
    const result = calculateCarLoan({
      vehiclePrice: 1200000,
      downPaymentPct: 20,
      rate: 9.0,
      tenure: 5,
    });

    expect(result.dpCoach.extraDp).toBe(100000);
    expect(result.dpCoach.emiReduction).toBeGreaterThan(0);
    expect(result.dpCoach.interestSavedDp).toBeGreaterThan(0);
  });

  it('Reference Case E: Section 80EEB EV Tax Savings Calculation', () => {
    const evTax = calculateCarLoan({
      vehiclePrice: 1800000,
      downPaymentPct: 20,
      rate: 8.5,
      tenure: 5,
      fuelType: 'ev',
      isSec80EEBEligible: true,
      marginalTaxRate: 30,
    });

    expect(evTax.sec80EEB_eligibleInterest).toBeGreaterThan(0);
    expect(evTax.sec80EEB_taxSavings).toBeGreaterThan(50000); // >₹50,000 tax savings!
    expect(evTax.effectiveNetCostAfterEvTax).toBe(evTax.totalOwnershipCost5Yr - evTax.sec80EEB_taxSavings);
  });

  it('Reference Case F: Reverse Target EMI Solver & Round-Trip Consistency', () => {
    const goalResult = calculateCarLoan({
      rate: 9.0,
      tenure: 5,
      downPaymentPct: 20,
      calculationMode: 'reverse_emi',
      targetEmi: 20000, // ₹20,000/mo EMI target
    });

    expect(goalResult.vehiclePrice).toBeGreaterThan(1000000);

    // Round-trip verification: feed solved vehicle price back into forward engine
    const roundTrip = calculateCarLoan({
      vehiclePrice: goalResult.vehiclePrice,
      downPaymentPct: 20,
      rate: 9.0,
      tenure: 5,
      calculationMode: 'forward',
    });

    expect(Math.abs(roundTrip.emi - 20000)).toBeLessThan(10); // within ₹10
  });

  it('Reference Case G: 4-Scenario Tenure & DP Grid (3Y vs 5Y vs 7Y)', () => {
    const result = calculateCarLoan({
      vehiclePrice: 1200000,
      downPaymentPct: 20,
      tenure: 5,
    });

    expect(result.scenarios.length).toBe(4);
    const [fast3Y, std5Y, long7Y, boost30] = result.scenarios;

    expect(fast3Y.emi).toBeGreaterThan(std5Y.emi);
    expect(long7Y.emi).toBeLessThan(std5Y.emi);
    expect(boost30.totalInterest).toBeLessThan(std5Y.totalInterest);
  });

  it('handles edge cases safely without NaN or negative numbers', () => {
    // Edge Case 1: Zero Vehicle Price
    const zeroPrice = calculateCarLoan({ vehiclePrice: 0 });
    expect(zeroPrice.emi).toBe(0);
    expect(zeroPrice.totalOwnershipCost5Yr).toBe(0);

    // Edge Case 2: Extreme High Price & Tenure
    const extreme = calculateCarLoan({ vehiclePrice: 10000000, tenure: 7 });
    expect(isNaN(extreme.emi)).toBe(false);
    expect(isFinite(extreme.totalOwnershipCost5Yr)).toBe(true);
  });
});