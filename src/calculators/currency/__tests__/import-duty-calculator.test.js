import { describe, it, expect } from 'vitest';
import {
  calculateImportDuty,
  calculateImportDutyCalculator,
  calculateLandedCost,
  calculateCustomsDuty,
  VALUATION_METHODS,
  CURRENCY_METADATA,
  REFERENCE_METADATA,
} from '../import-duty-calculator.js';
import { IMPORT_DUTY_CONFIG } from '../../configs/import-duty-calculator.config.js';

describe('Flagship Import Duty Suite (Sprint 80 / Flagship #87)', () => {
  // 1. Core Default Execution & Valuation
  describe('1. Default Execution & CIF vs FOB Valuation', () => {
    it('1. executes successfully with default inputs', () => {
      const res = calculateImportDuty();
      expect(res).toBeDefined();
      expect(res.productValue).toBe(10000);
      expect(res.assessableCustomsValue).toBe(12500); // 10000 + 2000 shipping + 500 insurance
      expect(res.basicDutyAmount).toBe(1250); // 10% of 12500
      expect(res.surchargeAmount).toBe(125); // 10% of 1250
      expect(res.vatGstBase).toBe(13875); // 12500 + 1250 + 125
      expect(res.vatGstAmount).toBe(2497.5); // 18% of 13875
      expect(res.totalTaxBurden).toBe(3872.5); // 1250 + 125 + 2497.5
      expect(res.totalLandedCost).toBe(17372.5); // 10000 + 2000 + 500 + 3872.5 + 1000
    });

    it('2. calculates assessable value under CIF mode (Product + Freight + Insurance)', () => {
      const res = calculateImportDuty({
        unitPrice: 20000,
        quantity: 1,
        shippingCost: 3000,
        insuranceCost: 1000,
        valuationMethod: 'CIF',
      });
      expect(res.assessableCustomsValue).toBe(24000);
    });

    it('3. calculates assessable value under FOB mode (Product only)', () => {
      const res = calculateImportDuty({
        unitPrice: 20000,
        quantity: 1,
        shippingCost: 3000,
        insuranceCost: 1000,
        valuationMethod: 'FOB',
      });
      expect(res.assessableCustomsValue).toBe(20000);
      expect(res.basicDutyAmount).toBe(2000); // 10% of 20000
    });

    it('4. calculates quantity multiplier accurately (Product Value = Price * Quantity)', () => {
      const res = calculateImportDuty({
        unitPrice: 500,
        quantity: 10,
        shippingCost: 1000,
        insuranceCost: 200,
      });
      expect(res.productValue).toBe(5000);
      expect(res.assessableCustomsValue).toBe(6200);
      expect(res.costPerUnit).toBe(Math.round((res.totalLandedCost / 10) * 100) / 100);
    });
  });

  // 2. Tax Compounding Sequence
  describe('2. Duty, Surcharges & Compounded VAT/GST Sequence', () => {
    it('5. computes Basic Customs Duty accurately', () => {
      const res = calculateImportDuty({
        unitPrice: 10000,
        shippingCost: 0,
        insuranceCost: 0,
        dutyRate: 15,
      });
      expect(res.basicDutyAmount).toBe(1500);
    });

    it('6. computes Social Welfare Surcharge (SWS) on Basic Customs Duty', () => {
      const res = calculateImportDuty({
        unitPrice: 10000,
        shippingCost: 0,
        insuranceCost: 0,
        dutyRate: 20, // BCD = 2000
        surchargeRate: 10, // SWS = 200
      });
      expect(res.basicDutyAmount).toBe(2000);
      expect(res.surchargeAmount).toBe(200);
    });

    it('7. verifies statutory VAT/GST base compounding (Customs + Duty + Surcharge)', () => {
      const res = calculateImportDuty({
        unitPrice: 10000,
        shippingCost: 0,
        insuranceCost: 0,
        dutyRate: 10, // BCD = 1000
        surchargeRate: 10, // SWS = 100
        vatGstRate: 18, // IGST on (10000 + 1000 + 100 = 11100) -> 1998
      });
      expect(res.vatGstBase).toBe(11100);
      expect(res.vatGstAmount).toBe(1998);
      expect(res.totalTaxBurden).toBe(3098); // 1000 + 100 + 1998
    });

    it('8. checks exact total landed cost component sum consistency', () => {
      const res = calculateImportDuty({
        unitPrice: 50000,
        quantity: 2,
        shippingCost: 5000,
        insuranceCost: 1000,
        dutyRate: 10,
        surchargeRate: 10,
        vatGstRate: 18,
        handlingFee: 2000,
      });
      const expectedLanded = res.productValue + res.shippingCost + res.insuranceCost + res.totalTaxBurden + res.handlingFee;
      expect(res.totalLandedCost).toBe(expectedLanded);
    });
  });

  // 3. Effective Ratios & Cost Shares
  describe('3. Effective Ratios & Landed Cost Breakdown Shares', () => {
    it('9. computes effective tax rate on base product value', () => {
      const res = calculateImportDuty({
        unitPrice: 10000,
        shippingCost: 0,
        insuranceCost: 0,
        dutyRate: 10,
        surchargeRate: 10,
        vatGstRate: 18,
      });
      // Product = 10000, Total Tax = 3098 -> Effective = 30.98%
      expect(res.effectiveDutyOnProductPct).toBe(30.98);
    });

    it('10. computes breakdown shares of total landed cost', () => {
      const res = calculateImportDuty();
      expect(res.productShareOfLandedPct).toBeGreaterThan(0);
      expect(res.dutyShareOfLandedPct).toBeGreaterThan(0);
      expect(res.freightShareOfLandedPct).toBeGreaterThan(0);
      expect(res.handlingShareOfLandedPct).toBeGreaterThan(0);
      const totalShares = res.productShareOfLandedPct + res.dutyShareOfLandedPct + res.freightShareOfLandedPct + res.handlingShareOfLandedPct;
      expect(Math.round(totalShares)).toBe(100);
    });
  });

  // 4. Edge Cases & Boundary Conditions
  describe('4. Zero, Boundary & Sanitization Safeguards', () => {
    it('11. handles zero duty and zero VAT (duty-free scenario)', () => {
      const res = calculateImportDuty({
        unitPrice: 10000,
        shippingCost: 1000,
        insuranceCost: 200,
        dutyRate: 0,
        surchargeRate: 0,
        vatGstRate: 0,
        handlingFee: 500,
      });
      expect(res.basicDutyAmount).toBe(0);
      expect(res.surchargeAmount).toBe(0);
      expect(res.vatGstAmount).toBe(0);
      expect(res.totalTaxBurden).toBe(0);
      expect(res.totalLandedCost).toBe(11700);
      expect(res.heroText).toContain('Duty-Free Import');
    });

    it('12. handles 100% duty rate boundary safely', () => {
      const res = calculateImportDuty({
        unitPrice: 10000,
        shippingCost: 0,
        insuranceCost: 0,
        dutyRate: 100,
        surchargeRate: 0,
        vatGstRate: 0,
      });
      expect(res.basicDutyAmount).toBe(10000);
      expect(res.totalTaxBurden).toBe(10000);
    });

    it('13. clamps duty rates exceeding 100% to 100%', () => {
      const res = calculateImportDuty({
        dutyRate: 150,
        vatGstRate: 200,
      });
      expect(res.dutyRate).toBe(100);
      expect(res.vatGstRate).toBe(100);
    });

    it('14. sanitizes negative inputs using Math.max(0)', () => {
      const res = calculateImportDuty({
        unitPrice: -5000,
        quantity: -2,
        shippingCost: -1000,
        insuranceCost: -500,
        dutyRate: -10,
        handlingFee: -200,
      });
      expect(res.unitPrice).toBe(0);
      expect(res.quantity).toBe(1); // Min 1 quantity
      expect(res.shippingCost).toBe(0);
      expect(res.dutyRate).toBe(0);
    });

    it('15. handles decimal unit prices accurately (cents / paise)', () => {
      const res = calculateImportDuty({
        unitPrice: 19.99,
        quantity: 3,
        shippingCost: 5.50,
        insuranceCost: 1.25,
        dutyRate: 5,
        surchargeRate: 0,
        vatGstRate: 20,
        handlingFee: 2.50,
      });
      expect(res.productValue).toBe(59.97);
      expect(res.assessableCustomsValue).toBe(66.72);
    });

    it('16. handles zero unit price gracefully', () => {
      const res = calculateImportDuty({
        unitPrice: 0,
        shippingCost: 1000,
        insuranceCost: 200,
      });
      expect(res.productValue).toBe(0);
      expect(res.effectiveDutyOnProductPct).toBe(0);
    });
  });

  // 5. Hero Text & Actionable Recommendations
  describe('5. Hero Verdict & Dynamic Recommendations', () => {
    it('17. formats hero text with tax burden and landed cost', () => {
      const res = calculateImportDuty({
        unitPrice: 10000,
        dutyRate: 10,
      });
      expect(res.heroText).toContain('Total Duty & Import Taxes');
      expect(res.heroText).toContain('Final landed cost is');
    });

    it('18. triggers critical recommendation when tax burden exceeds 35%', () => {
      const res = calculateImportDuty({
        unitPrice: 10000,
        shippingCost: 0,
        insuranceCost: 0,
        dutyRate: 25,
        surchargeRate: 10,
        vatGstRate: 28,
      });
      const crit = res.recommendations.find(r => r.type === 'critical');
      expect(crit).toBeDefined();
      expect(crit.title).toContain('High Tax Burden');
    });

    it('19. triggers zero duty positive recommendation', () => {
      const res = calculateImportDuty({
        dutyRate: 0,
        surchargeRate: 0,
        vatGstRate: 0,
      });
      const pos = res.recommendations.find(r => r.type === 'positive');
      expect(pos).toBeDefined();
      expect(pos.title).toContain('Zero Duty');
    });

    it('20. triggers high brokerage warning when handling fee > 15% of product price', () => {
      const res = calculateImportDuty({
        unitPrice: 1000,
        quantity: 1,
        handlingFee: 300, // 30% of product price
      });
      const warn = res.recommendations.find(r => r.type === 'warning');
      expect(warn).toBeDefined();
      expect(warn.title).toContain('High Brokerage & Courier Handling Fee');
    });
  });

  // 6. Multi-Currency Support & Metadata
  describe('6. Multi-Currency Formatting & Verification', () => {
    it('21. supports INR currency metadata', () => {
      const res = calculateImportDuty({ currency: 'INR' });
      expect(res.currency).toBe('INR');
      expect(res.currencyMeta.symbol).toBe('₹');
    });

    it('22. supports USD currency metadata', () => {
      const res = calculateImportDuty({ currency: 'USD' });
      expect(res.currency).toBe('USD');
      expect(res.currencyMeta.symbol).toBe('$');
    });

    it('23. supports EUR currency metadata', () => {
      const res = calculateImportDuty({ currency: 'EUR' });
      expect(res.currency).toBe('EUR');
      expect(res.currencyMeta.symbol).toBe('€');
    });

    it('24. supports GBP currency metadata', () => {
      const res = calculateImportDuty({ currency: 'GBP' });
      expect(res.currency).toBe('GBP');
      expect(res.currencyMeta.symbol).toBe('£');
    });

    it('25. supports AED, CAD, AUD, SGD codes', () => {
      expect(calculateImportDuty({ currency: 'AED' }).currencyMeta.symbol).toBe('د.إ');
      expect(calculateImportDuty({ currency: 'CAD' }).currencyMeta.symbol).toBe('C$');
      expect(calculateImportDuty({ currency: 'AUD' }).currencyMeta.symbol).toBe('A$');
      expect(calculateImportDuty({ currency: 'SGD' }).currencyMeta.symbol).toBe('S$');
    });

    it('26. falls back to INR for unknown currency code', () => {
      const res = calculateImportDuty({ currency: 'XYZ' });
      expect(res.currencyMeta.symbol).toBe('₹');
    });
  });

  // 7. Scenario Presets Verification
  describe('7. Scenario Presets Verification', () => {
    it('27. verifies India Electronics Preset (CIF, 10% BCD, 10% SWS, 18% IGST)', () => {
      const p = IMPORT_DUTY_CONFIG.presets[0];
      const res = calculateImportDuty(p);
      expect(res.valuationMethod).toBe('CIF');
      expect(res.assessableCustomsValue).toBe(28600); // 25000 + 3000 + 600
      expect(res.basicDutyAmount).toBe(2860); // 10% of 28600
      expect(res.surchargeAmount).toBe(286); // 10% of 2860
      expect(res.vatGstBase).toBe(31746); // 28600 + 2860 + 286
      expect(res.vatGstAmount).toBe(5714.28); // 18% of 31746
      expect(res.totalLandedCost).toBe(38960.28);
    });

    it('28. verifies India Luxury Goods Preset (CIF, 20% BCD, 28% IGST)', () => {
      const p = IMPORT_DUTY_CONFIG.presets[1];
      const res = calculateImportDuty(p);
      expect(res.assessableCustomsValue).toBe(106500); // 100000 + 5000 + 1500
      expect(res.basicDutyAmount).toBe(21300); // 20% of 106500
      expect(res.surchargeAmount).toBe(2130); // 10% of 21300
      expect(res.vatGstBase).toBe(129930); // 106500 + 21300 + 2130
      expect(res.vatGstAmount).toBe(36380.4); // 28% of 129930
    });

    it('29. verifies US Commercial Merchandise Preset (FOB Valuation, No VAT)', () => {
      const p = IMPORT_DUTY_CONFIG.presets[2];
      const res = calculateImportDuty(p);
      expect(res.valuationMethod).toBe('FOB');
      expect(res.productValue).toBe(6000); // 1200 * 5
      expect(res.assessableCustomsValue).toBe(6000); // FOB base
      expect(res.basicDutyAmount).toBe(210); // 3.5% of 6000
      expect(res.vatGstAmount).toBe(0); // 0% US VAT
      expect(res.totalLandedCost).toBe(6835); // 6000 + 400 + 100 + 210 + 125
    });

    it('30. verifies UK/EU Goods Preset (CIF, 4% Duty, 20% VAT)', () => {
      const p = IMPORT_DUTY_CONFIG.presets[3];
      const res = calculateImportDuty(p);
      expect(res.assessableCustomsValue).toBe(1000); // 900 + 80 + 20
      expect(res.basicDutyAmount).toBe(40); // 4% of 1000
      expect(res.vatGstBase).toBe(1040); // 1000 + 40
      expect(res.vatGstAmount).toBe(208); // 20% of 1040
      expect(res.totalLandedCost).toBe(1288); // 900 + 80 + 20 + 40 + 208 + 40
    });

    it('31. verifies UAE GCC Customs Tariff Preset (5% Duty, 5% VAT)', () => {
      const p = IMPORT_DUTY_CONFIG.presets[4];
      const res = calculateImportDuty(p);
      expect(res.assessableCustomsValue).toBe(5500); // 5000 + 400 + 100
      expect(res.basicDutyAmount).toBe(275); // 5% of 5500
      expect(res.vatGstBase).toBe(5775); // 5500 + 275
      expect(res.vatGstAmount).toBe(288.75); // 5% of 5775
      expect(res.totalLandedCost).toBe(6213.75);
    });

    it('32. verifies Free Trade Agreement Zero Duty Preset', () => {
      const p = IMPORT_DUTY_CONFIG.presets[5];
      const res = calculateImportDuty(p);
      expect(res.basicDutyAmount).toBe(0);
      expect(res.surchargeAmount).toBe(0);
      expect(res.vatGstBase).toBe(54800); // 50000 + 4000 + 800
      expect(res.vatGstAmount).toBe(9864); // 18% of 54800
      expect(res.totalLandedCost).toBe(65864);
    });
  });

  // 8. Valuation Methods & Reference Metadata
  describe('8. Valuation Methods & Disclosures', () => {
    it('33. provides both CIF and FOB methods in VALUATION_METHODS', () => {
      expect(VALUATION_METHODS.CIF).toBeDefined();
      expect(VALUATION_METHODS.FOB).toBeDefined();
      expect(VALUATION_METHODS.CIF.id).toBe('CIF');
      expect(VALUATION_METHODS.FOB.id).toBe('FOB');
    });

    it('34. includes baseline date and WTO standard in reference metadata', () => {
      expect(REFERENCE_METADATA.baselineDate).toBe('2026-08-27');
      expect(REFERENCE_METADATA.valuationStandard).toContain('WTO');
      expect(REFERENCE_METADATA.disclaimer).toContain('educational landed cost');
    });

    it('35. returns custom item description in calculation result', () => {
      const res = calculateImportDuty({ itemDescription: 'Specialty Optical Lens' });
      expect(res.itemDescription).toBe('Specialty Optical Lens');
    });
  });

  // 9. Precision & Multi-Quantity Scale
  describe('9. Multi-Quantity Scale & Precision', () => {
    it('36. handles high quantity commercial shipment (10,000 units)', () => {
      const res = calculateImportDuty({
        unitPrice: 50,
        quantity: 10000, // 500,000 product value
        shippingCost: 20000,
        insuranceCost: 5000,
        dutyRate: 7.5,
        surchargeRate: 10,
        vatGstRate: 18,
        handlingFee: 5000,
      });
      expect(res.productValue).toBe(500000);
      expect(res.assessableCustomsValue).toBe(525000);
      expect(res.costPerUnit).toBe(Math.round((res.totalLandedCost / 10000) * 100) / 100);
    });

    it('37. rounds all financial results to two decimal places', () => {
      const res = calculateImportDuty({
        unitPrice: 13.33,
        quantity: 7,
        shippingCost: 9.99,
        insuranceCost: 1.11,
        dutyRate: 6.5,
        surchargeRate: 10,
        vatGstRate: 19.5,
        handlingFee: 4.44,
      });
      expect(Number.isInteger(Math.round(res.totalLandedCost * 100))).toBe(true);
      expect(Number.isInteger(Math.round(res.basicDutyAmount * 100))).toBe(true);
    });

    it('38. handles missing optional insurance and shipping fees gracefully', () => {
      const res = calculateImportDuty({
        unitPrice: 10000,
        shippingCost: 0,
        insuranceCost: 0,
        handlingFee: 0,
      });
      expect(res.assessableCustomsValue).toBe(10000);
    });

    it('39. maintains non-negative effective duty percentage', () => {
      const res = calculateImportDuty({ unitPrice: 1000 });
      expect(res.effectiveDutyOnProductPct).toBeGreaterThanOrEqual(0);
    });

    it('40. handles single unit orders accurately ($quantity = 1$)', () => {
      const res = calculateImportDuty({ quantity: 1, unitPrice: 5000 });
      expect(res.costPerUnit).toBe(res.totalLandedCost);
    });

    it('41. verifies all 8 currency metadata entries in CURRENCY_METADATA', () => {
      expect(Object.keys(CURRENCY_METADATA).length).toBe(8);
      Object.keys(CURRENCY_METADATA).forEach((code) => {
        expect(CURRENCY_METADATA[code].symbol).toBeDefined();
        expect(CURRENCY_METADATA[code].flag).toBeDefined();
      });
    });

    it('42. validates recommendations array length between 2 and 4 items', () => {
      const res = calculateImportDuty();
      expect(res.recommendations.length).toBeGreaterThanOrEqual(2);
      expect(res.recommendations.length).toBeLessThanOrEqual(4);
    });
  });

  // 10. Aliases & Module Consistency
  describe('10. Aliases & Config Verification', () => {
    it('43. exports calculateImportDutyCalculator alias identically', () => {
      const res1 = calculateImportDuty({ unitPrice: 8000 });
      const res2 = calculateImportDutyCalculator({ unitPrice: 8000 });
      expect(res1.totalLandedCost).toBe(res2.totalLandedCost);
      expect(res1.basicDutyAmount).toBe(res2.basicDutyAmount);
    });

    it('44. exports calculateLandedCost & calculateCustomsDuty aliases identically', () => {
      const res1 = calculateImportDuty({ unitPrice: 8000 });
      const res2 = calculateLandedCost({ unitPrice: 8000 });
      const res3 = calculateCustomsDuty({ unitPrice: 8000 });
      expect(res1.totalLandedCost).toBe(res2.totalLandedCost);
      expect(res1.totalLandedCost).toBe(res3.totalLandedCost);
    });

    it('45. maintains consistent config id, category, and version', () => {
      expect(IMPORT_DUTY_CONFIG.id).toBe('import-duty-calculator');
      expect(IMPORT_DUTY_CONFIG.category).toBe('currency');
      expect(IMPORT_DUTY_CONFIG.version).toBe('3.0.0');
    });
  });
});
