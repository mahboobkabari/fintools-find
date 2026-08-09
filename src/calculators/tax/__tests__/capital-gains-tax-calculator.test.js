import { describe, it, expect } from 'vitest';
import { calculateCapitalGainsTaxCalculator } from '../capital-gains-tax-calculator.js';

describe('Institutional Capital Gains Tax Calculator Engine (FY 2025-26 / AY 2026-27)', () => {
  it('calculates Listed Equity LTCG correctly with ₹1.25L Sec 112A exemption (₹1L to ₹2.5L in 18 months)', () => {
    const res = calculateCapitalGainsTaxCalculator({
      purchasePrice: 100000,
      salePrice: 250000,
      assetType: 'equity',
      holdingPeriodMonths: 18,
      transferExpenses: 0,
    });

    expect(res.netCapitalGain).toBe(150000);
    expect(res.isLongTerm).toBe(true);
    expect(res.taxSection).toBe('Section 112A');
    expect(res.exemptionAmount).toBe(125000);
    expect(res.taxableGain).toBe(25000);
    expect(res.applicableTaxRate).toBe(12.5);
    expect(res.baseTax).toBe(3125);
    expect(res.cessAmount).toBe(125);
    expect(res.taxPayable).toBe(3250);
  });

  it('calculates Listed Equity LTCG below ₹1.25L threshold as ₹0 tax payable (₹1L to ₹2L in 18 months)', () => {
    const res = calculateCapitalGainsTaxCalculator({
      purchasePrice: 100000,
      salePrice: 200000,
      assetType: 'equity',
      holdingPeriodMonths: 18,
    });

    expect(res.netCapitalGain).toBe(100000);
    expect(res.isLongTerm).toBe(true);
    expect(res.exemptionAmount).toBe(125000);
    expect(res.taxableGain).toBe(0);
    expect(res.taxPayable).toBe(0);
  });

  it('calculates Listed Equity STCG correctly @ 20% Sec 111A (₹1L to ₹2L in 6 months)', () => {
    const res = calculateCapitalGainsTaxCalculator({
      purchasePrice: 100000,
      salePrice: 200000,
      assetType: 'equity',
      holdingPeriodMonths: 6,
    });

    expect(res.netCapitalGain).toBe(100000);
    expect(res.isLongTerm).toBe(false);
    expect(res.taxSection).toBe('Section 111A');
    expect(res.exemptionAmount).toBe(0);
    expect(res.applicableTaxRate).toBe(20.0);
    expect(res.taxPayable).toBe(20800); // 20,000 + 800 cess
  });

  it('calculates Real Estate STCG using user marginal slab rate (e.g. 20%) vs LTCG @ 12.5%', () => {
    // STCG (18 months <= 24 months threshold) with 20% marginal slab rate
    const resStcg = calculateCapitalGainsTaxCalculator({
      purchasePrice: 5000000,
      salePrice: 6000000,
      assetType: 'real_estate',
      holdingPeriodMonths: 18,
      marginalTaxRate: 20,
    });

    expect(resStcg.isLongTerm).toBe(false);
    expect(resStcg.rateType).toBe('slab');
    expect(resStcg.applicableTaxRate).toBe(20);
    expect(resStcg.taxPayable).toBe(208000); // 1,000,000 * 20% + 4% cess

    // LTCG (36 months > 24 months threshold) @ 12.5% without indexation
    const resLtcg = calculateCapitalGainsTaxCalculator({
      purchasePrice: 5000000,
      salePrice: 7000000,
      assetType: 'real_estate',
      holdingPeriodMonths: 36,
    });

    expect(resLtcg.isLongTerm).toBe(true);
    expect(resLtcg.taxSection).toBe('Section 112');
    expect(resLtcg.applicableTaxRate).toBe(12.5);
    expect(resLtcg.exemptionAmount).toBe(0); // Sec 112A exemption does NOT apply to real estate
    expect(resLtcg.taxPayable).toBe(260000); // 2,000,000 * 12.5% + 4% cess
  });

  it('calculates Gold STCG using marginal slab rate vs LTCG @ 12.5%', () => {
    const resGoldLtcg = calculateCapitalGainsTaxCalculator({
      purchasePrice: 200000,
      salePrice: 350000,
      assetType: 'gold',
      holdingPeriodMonths: 30, // > 24 months
    });

    expect(resGoldLtcg.isLongTerm).toBe(true);
    expect(resGoldLtcg.applicableTaxRate).toBe(12.5);
    expect(resGoldLtcg.exemptionAmount).toBe(0);
    expect(resGoldLtcg.taxPayable).toBe(19500); // 150,000 * 12.5% + 4% cess
  });

  it('evaluates Specified Debt Mutual Funds under Section 50AA (taxed at slab rate regardless of 36 months duration)', () => {
    const resDebt = calculateCapitalGainsTaxCalculator({
      purchasePrice: 500000,
      salePrice: 650000,
      assetType: 'debt_mf',
      holdingPeriodMonths: 36, // Held 3 years, but Section 50AA deems it short-term
      marginalTaxRate: 30,
    });

    expect(resDebt.taxSection).toBe('Section 50AA');
    expect(resDebt.rateType).toBe('slab');
    expect(resDebt.applicableTaxRate).toBe(30);
    expect(resDebt.taxPayable).toBe(46800); // 150,000 * 30% + 4% cess
  });

  it('verifies Section 112A ₹1.25L exemption threshold is NOT applied to non-equity assets', () => {
    const resUnlisted = calculateCapitalGainsTaxCalculator({
      purchasePrice: 100000,
      salePrice: 300000,
      assetType: 'unlisted_equity',
      holdingPeriodMonths: 36,
    });

    expect(resUnlisted.isLongTerm).toBe(true);
    expect(resUnlisted.exemptionAmount).toBe(0);
    expect(resUnlisted.taxableGain).toBe(200000);
  });

  it('deducts transfer expenses and improvement costs from gross consideration', () => {
    const res = calculateCapitalGainsTaxCalculator({
      purchasePrice: 100000,
      salePrice: 250000,
      assetType: 'equity',
      holdingPeriodMonths: 18,
      transferExpenses: 5000,
      improvementCost: 10000,
    });

    // Net Consideration = 2,50,000 - 5,000 = 2,45,000
    // Total Cost Basis = 1,00,000 + 10,000 = 1,10,000
    // Net Gain = 2,45,000 - 1,10,000 = 1,35,000
    // Taxable = 1,35,000 - 1,25,000 = 10,000
    // Base Tax = 10,000 * 12.5% = 1,250
    // Cess = 50
    // Total Tax = 1,300
    expect(res.netCapitalGain).toBe(135000);
    expect(res.taxableGain).toBe(10000);
    expect(res.taxPayable).toBe(1300);
  });

  it('handles Capital Loss scenarios with ₹0 tax payable', () => {
    const resLoss = calculateCapitalGainsTaxCalculator({
      purchasePrice: 200000,
      salePrice: 150000,
      assetType: 'equity',
      holdingPeriodMonths: 12,
    });

    expect(resLoss.netCapitalGain).toBe(0);
    expect(resLoss.taxableGain).toBe(0);
    expect(resLoss.taxPayable).toBe(0);
    expect(resLoss.healthStatus).toBe('Capital Loss Scenario (₹0 Tax)');
  });

  it('handles boundary holding periods safely (12 months vs 13 months for equity, 24 months vs 25 months for real estate)', () => {
    const eq12 = calculateCapitalGainsTaxCalculator({ purchasePrice: 100000, salePrice: 200000, assetType: 'equity', holdingPeriodMonths: 12 });
    expect(eq12.isLongTerm).toBe(false);

    const eq13 = calculateCapitalGainsTaxCalculator({ purchasePrice: 100000, salePrice: 200000, assetType: 'equity', holdingPeriodMonths: 13 });
    expect(eq13.isLongTerm).toBe(true);

    const re24 = calculateCapitalGainsTaxCalculator({ purchasePrice: 100000, salePrice: 200000, assetType: 'real_estate', holdingPeriodMonths: 24 });
    expect(re24.isLongTerm).toBe(false);

    const re25 = calculateCapitalGainsTaxCalculator({ purchasePrice: 100000, salePrice: 200000, assetType: 'real_estate', holdingPeriodMonths: 25 });
    expect(re25.isLongTerm).toBe(true);
  });
});