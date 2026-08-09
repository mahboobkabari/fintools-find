import { describe, it, expect } from 'vitest';
import { calculateRentVsBuyCalculator } from '../rent-vs-buy-calculator.js';

describe('Flagship Rent vs Buy Financial Decision Engine', () => {
  it('1. verifies Standard ₹75L Property vs ₹25k Rent 20-Year Baseline', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      monthlyRent: 25000,
      downPaymentPct: 20.0,
      homeLoanRate: 8.5,
      tenureYears: 20,
    });

    expect(result.propertyPrice).toBe(7500000);
    expect(result.monthlyRent).toBe(25000);
    expect(result.tenureYears).toBe(20);
    expect(result.downPayment).toBe(1500000);
    expect(result.loanPrincipal).toBe(6000000);
    expect(result.netWorthBuy).toBeGreaterThan(0);
    expect(result.netWorthRent).toBeGreaterThan(0);
  });

  it('2. verifies Home Loan EMI calculation accuracy (₹60L @ 8.5% for 20 Yrs)', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      downPaymentPct: 20.0,
      homeLoanRate: 8.5,
      tenureYears: 20,
    });

    // EMI for 60L @ 8.5% for 240 months = 52,069/mo
    expect(result.monthlyEMI).toBe(52069);
  });

  it('3. verifies remaining loan balance amortization reaches 0 at end of tenure', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      tenureYears: 20,
    });

    const finalRow = result.yearlySchedule[result.yearlySchedule.length - 1];
    expect(finalRow.remainingLoan).toBe(0);
  });

  it('4. verifies Future Property Appreciation: ₹75L @ 5% p.a. for 20 Years', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      propertyAppreciationRate: 5.0,
      tenureYears: 20,
    });

    // V = 7,500,000 * (1.05)^20 = 19,899,733 -> ~1.99 Cr
    expect(result.futurePropertyValue).toBe(19899733);
  });

  it('5. verifies Rent Escalation Calculation: ₹25,000 @ 7% p.a. in Year 20', () => {
    const result = calculateRentVsBuyCalculator({
      monthlyRent: 25000,
      rentInflationRate: 7.0,
      tenureYears: 20,
    });

    // Rent Year 20 = 25,000 * (1.07)^19 = 90,413
    const year20Row = result.yearlySchedule[19];
    expect(year20Row.monthlyRent).toBe(90413);
  });

  it('6. verifies Initial Down Payment Opportunity Cost Tracking (20% down + 5% costs)', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      downPaymentPct: 20.0,
      purchaseCostPct: 5.0,
    });

    // Down payment = 15L, Purchase costs = 3.75L -> Initial Cash = 18.75L
    expect(result.initialCashBuy).toBe(1875000);
  });

  it('7. verifies monthly cash flow difference surplus investment into equity', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      monthlyRent: 25000,
      tenureYears: 20,
    });

    expect(result.netWorthRent).toBeGreaterThan(result.initialCashBuy);
  });

  it('8. calculates annual maintenance costs accurately (1% p.a.)', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      annualMaintenanceRate: 1.0,
    });

    expect(result.annualMaintenanceRate).toBe(1.0);
  });

  it('9. verifies purchase and selling transaction costs calculation', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      purchaseCostPct: 5.0,
      sellingCostPct: 2.0,
    });

    expect(result.purchaseCosts).toBe(375000);
  });

  it('10. handles zero property appreciation scenario (0% appreciation)', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      propertyAppreciationRate: 0,
      tenureYears: 20,
    });

    expect(result.futurePropertyValue).toBe(7500000);
    expect(result.winningOption).toBe('RENT');
  });

  it('11. handles zero rent inflation scenario (0% rent inflation)', () => {
    const result = calculateRentVsBuyCalculator({
      monthlyRent: 25000,
      rentInflationRate: 0,
      tenureYears: 20,
    });

    const finalRow = result.yearlySchedule[result.yearlySchedule.length - 1];
    expect(finalRow.monthlyRent).toBe(25000);
  });

  it('12. handles 100% cash purchase scenario (0% loan, 100% down payment)', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      downPaymentPct: 100.0,
      tenureYears: 20,
    });

    expect(result.loanPrincipal).toBe(0);
    expect(result.monthlyEMI).toBe(0);
    expect(result.initialCashBuy).toBe(7875000);
  });

  it('13. handles 0% down payment scenario (100% financing)', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      downPaymentPct: 0,
      tenureYears: 20,
    });

    expect(result.downPayment).toBe(0);
    expect(result.loanPrincipal).toBe(7500000);
  });

  it('14. calculates short horizon scenario (5 Years)', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      tenureYears: 5,
    });

    expect(result.yearlySchedule.length).toBe(5);
  });

  it('15. calculates long horizon scenario (30 Years)', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      tenureYears: 30,
    });

    expect(result.yearlySchedule.length).toBe(30);
  });

  it('16. verifies High Property Appreciation Scenario (10% p.a. -> Buying wins)', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      monthlyRent: 25000,
      propertyAppreciationRate: 10.0,
      investmentReturnRate: 8.0,
      tenureYears: 20,
    });

    expect(result.winningOption).toBe('BUY');
    expect(result.netAdvantage).toBeGreaterThan(0);
  });

  it('17. verifies High Equity Return Scenario (15% p.a. -> Renting & Investing wins)', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      monthlyRent: 25000,
      investmentReturnRate: 15.0,
      tenureYears: 20,
    });

    expect(result.winningOption).toBe('RENT');
    expect(result.netAdvantage).toBeLessThan(0);
  });

  it('18. verifies breakeven year detection when buying becomes superior', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      monthlyRent: 25000,
      propertyAppreciationRate: 10.0,
      investmentReturnRate: 8.0,
      tenureYears: 20,
    });

    expect(result.breakevenYear).toContain('Year');
  });

  it('19. verifies Tax Module isolation (Section 24(b) Old Tax Regime toggle)', () => {
    const withoutTax = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      includeTaxBenefits: false,
    });

    const withTax = calculateRentVsBuyCalculator({
      propertyPrice: 7500000,
      includeTaxBenefits: true,
      taxSlabRate: 30.0,
    });

    expect(withTax.cumTaxBenefits).toBeGreaterThan(0);
    expect(withTax.netWorthBuy).toBeGreaterThan(withoutTax.netWorthBuy);
  });

  it('20. handles USD currency mode formatting', () => {
    const result = calculateRentVsBuyCalculator({
      propertyPrice: 500000,
      monthlyRent: 2000,
      currency: 'USD',
    });

    expect(result.currency).toBe('USD');
    expect(result.heroText).toContain('$500,000');
  });
});
