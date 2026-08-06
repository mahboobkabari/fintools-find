import { describe, it, expect } from 'vitest';
import { calculateCapitalGainsTaxCalculator } from '../capital-gains-tax-calculator.js';

describe('Capital Gains Tax Calculator Engine', () => {
  it('calculates Equity LTCG correctly with ₹1.25L exemption (₹1L to ₹2.5L in 18 months)', () => {
    const output = calculateCapitalGainsTaxCalculator({
      purchasePrice: 100000,
      salePrice: 250000,
      assetType: 'equity',
      holdingPeriodMonths: 18,
      transferExpenses: 0,
    });
    expect(output.netCapitalGain).toBe(150000);
    expect(output.isLongTerm).toBe(true);
    expect(output.exemptionAmount).toBe(125000);
    expect(output.taxableGain).toBe(25000);
    expect(output.taxRate).toBe(12.5);
    expect(output.taxPayable).toBe(3250); // ₹3,125 base + ₹125 cess
  });

  it('calculates Equity STCG correctly @ 20% rate (₹1L to ₹2L in 6 months)', () => {
    const output = calculateCapitalGainsTaxCalculator({
      purchasePrice: 100000,
      salePrice: 200000,
      assetType: 'equity',
      holdingPeriodMonths: 6,
      transferExpenses: 0,
    });
    expect(output.netCapitalGain).toBe(100000);
    expect(output.isLongTerm).toBe(false);
    expect(output.taxRate).toBe(20.0);
    expect(output.taxPayable).toBe(20800); // ₹20,000 base + ₹800 cess
  });

  it('handles loss scenarios with zero tax payable', () => {
    const output = calculateCapitalGainsTaxCalculator({
      purchasePrice: 150000,
      salePrice: 100000,
      assetType: 'equity',
      holdingPeriodMonths: 12,
    });
    expect(output.netCapitalGain).toBe(0);
    expect(output.taxPayable).toBe(0);
  });
});