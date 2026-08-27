import { describe, it, expect } from 'vitest';
import { calculateGst } from '../gst-calculator.js';

describe('Flagship GST Tax Decision Engine Suite (Sprint 57 Audit)', () => {
  // 1. Exclusive GST Calculations (Standard Slabs)
  describe('Exclusive GST Calculations (Add GST to Net Base)', () => {
    it('1. calculates 18% standard GST on ₹10,000 net base (Intrastate)', () => {
      const res = calculateGst({
        amount: 10000,
        gstRate: 18,
        gstType: 'exclusive',
        txType: 'intrastate',
      });
      expect(res.netAmount).toBe(10000);
      expect(res.gstAmount).toBe(1800);
      expect(res.cgst).toBe(900);
      expect(res.sgst).toBe(900);
      expect(res.igst).toBe(0);
      expect(res.grossAmount).toBe(11800);
      expect(res.gstRate).toBe(18);
    });

    it('2. calculates 5% essential GST on ₹2,000 restaurant bill', () => {
      const res = calculateGst({
        amount: 2000,
        gstRate: 5,
        gstType: 'exclusive',
        txType: 'intrastate',
      });
      expect(res.netAmount).toBe(2000);
      expect(res.gstAmount).toBe(100);
      expect(res.cgst).toBe(50);
      expect(res.sgst).toBe(50);
      expect(res.grossAmount).toBe(2100);
    });

    it('3. calculates 12% GST on ₹5,000 apparel purchase', () => {
      const res = calculateGst({
        amount: 5000,
        gstRate: 12,
        gstType: 'exclusive',
        txType: 'intrastate',
      });
      expect(res.netAmount).toBe(5000);
      expect(res.gstAmount).toBe(600);
      expect(res.cgst).toBe(300);
      expect(res.sgst).toBe(300);
      expect(res.grossAmount).toBe(5600);
    });

    it('4. calculates 28% peak GST on ₹50,000 luxury appliance', () => {
      const res = calculateGst({
        amount: 50000,
        gstRate: 28,
        gstType: 'exclusive',
        txType: 'intrastate',
      });
      expect(res.netAmount).toBe(50000);
      expect(res.gstAmount).toBe(14000);
      expect(res.cgst).toBe(7000);
      expect(res.sgst).toBe(7000);
      expect(res.grossAmount).toBe(64000);
    });

    it('5. calculates 0% exempt GST', () => {
      const res = calculateGst({
        amount: 15000,
        gstRate: 0,
        gstType: 'exclusive',
      });
      expect(res.netAmount).toBe(15000);
      expect(res.gstAmount).toBe(0);
      expect(res.cgst).toBe(0);
      expect(res.sgst).toBe(0);
      expect(res.grossAmount).toBe(15000);
    });
  });

  // 2. Inclusive GST Calculations (Reverse GST Extraction)
  describe('Inclusive GST Calculations (Extract GST from Gross Total)', () => {
    it('6. extracts 18% GST from ₹11,800 gross MRP', () => {
      const res = calculateGst({
        amount: 11800,
        gstRate: 18,
        gstType: 'inclusive',
        txType: 'intrastate',
      });
      expect(res.grossAmount).toBe(11800);
      expect(res.netAmount).toBe(10000);
      expect(res.gstAmount).toBe(1800);
      expect(res.cgst).toBe(900);
      expect(res.sgst).toBe(900);
    });

    it('7. extracts 5% GST from ₹2,100 gross price', () => {
      const res = calculateGst({
        amount: 2100,
        gstRate: 5,
        gstType: 'inclusive',
        txType: 'intrastate',
      });
      expect(res.grossAmount).toBe(2100);
      expect(res.netAmount).toBe(2000);
      expect(res.gstAmount).toBe(100);
      expect(res.cgst).toBe(50);
      expect(res.sgst).toBe(50);
    });

    it('8. extracts 12% GST from ₹5,600 gross price', () => {
      const res = calculateGst({
        amount: 5600,
        gstRate: 12,
        gstType: 'inclusive',
        txType: 'intrastate',
      });
      expect(res.grossAmount).toBe(5600);
      expect(res.netAmount).toBe(5000);
      expect(res.gstAmount).toBe(600);
    });

    it('9. extracts 28% GST from ₹64,000 gross price', () => {
      const res = calculateGst({
        amount: 64000,
        gstRate: 28,
        gstType: 'inclusive',
        txType: 'intrastate',
      });
      expect(res.grossAmount).toBe(64000);
      expect(res.netAmount).toBe(50000);
      expect(res.gstAmount).toBe(14000);
      expect(res.cgst).toBe(7000);
      expect(res.sgst).toBe(7000);
    });

    it('10. handles 0% inclusive extraction', () => {
      const res = calculateGst({
        amount: 25000,
        gstRate: 0,
        gstType: 'inclusive',
      });
      expect(res.grossAmount).toBe(25000);
      expect(res.netAmount).toBe(25000);
      expect(res.gstAmount).toBe(0);
    });
  });

  // 3. Interstate vs Intrastate Transactions
  describe('Jurisdiction & Tax Split Mechanics', () => {
    it('11. allocates 100% to IGST for interstate exclusive transaction', () => {
      const res = calculateGst({
        amount: 100000,
        gstRate: 18,
        gstType: 'exclusive',
        txType: 'interstate',
      });
      expect(res.igst).toBe(18000);
      expect(res.cgst).toBe(0);
      expect(res.sgst).toBe(0);
      expect(res.gstAmount).toBe(18000);
      expect(res.grossAmount).toBe(118000);
    });

    it('12. allocates 100% to IGST for interstate inclusive transaction', () => {
      const res = calculateGst({
        amount: 118000,
        gstRate: 18,
        gstType: 'inclusive',
        txType: 'interstate',
      });
      expect(res.netAmount).toBe(100000);
      expect(res.igst).toBe(18000);
      expect(res.cgst).toBe(0);
      expect(res.sgst).toBe(0);
    });

    it('13. splits 50/50 for intrastate with odd cent/tax amounts', () => {
      const res = calculateGst({
        amount: 10001,
        gstRate: 5,
        gstType: 'exclusive',
        txType: 'intrastate',
      });
      // 5% of 10001 = 500.05 => 500
      expect(res.cgst + res.sgst).toBe(res.gstAmount);
    });

    it('14. handles case-insensitive txType (e.g. INTERSTATE)', () => {
      const res = calculateGst({
        amount: 50000,
        gstRate: 18,
        txType: 'INTERSTATE',
      });
      expect(res.igst).toBe(9000);
      expect(res.cgst).toBe(0);
    });
  });

  // 4. Effective Tax Rate & Financial Metrics
  describe('Effective Tax Rate & Metric Computations', () => {
    it('15. computes effective tax rate on gross amount for 18% GST (1800/11800 = 15.25%)', () => {
      const res = calculateGst({ amount: 10000, gstRate: 18 });
      expect(res.effectiveRate).toBe(15.25);
    });

    it('16. computes tax per ₹100 base price for 18% rate (₹18)', () => {
      const res = calculateGst({ amount: 10000, gstRate: 18 });
      expect(res.taxPer100).toBe(18);
    });

    it('17. computes tax per ₹100 base price for 28% rate (₹28)', () => {
      const res = calculateGst({ amount: 50000, gstRate: 28 });
      expect(res.taxPer100).toBe(28);
    });

    it('18. computes 0 effective rate when GST rate is 0%', () => {
      const res = calculateGst({ amount: 10000, gstRate: 0 });
      expect(res.effectiveRate).toBe(0);
      expect(res.taxPer100).toBe(0);
    });
  });

  // 5. Scenario Analysis Engine
  describe('Scenario Slabs & Sensitivity Analysis', () => {
    it('19. generates noGst scenario correctly', () => {
      const res = calculateGst({ amount: 10000, gstRate: 18 });
      expect(res.scenarios.noGst.rate).toBe(0);
      expect(res.scenarios.noGst.gstAmount).toBe(0);
      expect(res.scenarios.noGst.grossAmount).toBe(10000);
      expect(res.scenarios.noGst.diff).toBe(-1800);
    });

    it('20. generates current scenario matching base calculation', () => {
      const res = calculateGst({ amount: 10000, gstRate: 18 });
      expect(res.scenarios.current.rate).toBe(18);
      expect(res.scenarios.current.gstAmount).toBe(1800);
      expect(res.scenarios.current.grossAmount).toBe(11800);
      expect(res.scenarios.current.diff).toBe(0);
    });

    it('21. generates lower -5% slab scenario (18% -> 13%)', () => {
      const res = calculateGst({ amount: 10000, gstRate: 18 });
      expect(res.scenarios.lower.rate).toBe(13);
      expect(res.scenarios.lower.gstAmount).toBe(1300);
      expect(res.scenarios.lower.grossAmount).toBe(11300);
    });

    it('22. generates higher +5% slab scenario (18% -> 23%)', () => {
      const res = calculateGst({ amount: 10000, gstRate: 18 });
      expect(res.scenarios.higher.rate).toBe(23);
      expect(res.scenarios.higher.gstAmount).toBe(2300);
      expect(res.scenarios.higher.grossAmount).toBe(12300);
    });

    it('23. clamps lower scenario to 0 when base rate is 3%', () => {
      const res = calculateGst({ amount: 10000, gstRate: 3 });
      expect(res.scenarios.lower.rate).toBe(0);
      expect(res.scenarios.lower.gstAmount).toBe(0);
    });
  });

  // 6. B2B Invoice & Voucher Preview
  describe('B2B Invoice Preview Object', () => {
    it('24. generates intrastate B2B invoice preview with CGST and SGST', () => {
      const res = calculateGst({
        amount: 25000,
        gstRate: 18,
        txType: 'intrastate',
      });
      expect(res.invoicePreview.b2bHeadline).toBe('Intrastate B2B Invoice (CGST + SGST)');
      expect(res.invoicePreview.isInterstate).toBe(false);
      expect(res.invoicePreview.netAmount).toBe(25000);
      expect(res.invoicePreview.cgst).toBe(2250);
      expect(res.invoicePreview.sgst).toBe(2250);
      expect(res.invoicePreview.grossAmount).toBe(29500);
    });

    it('25. generates interstate B2B invoice preview with IGST', () => {
      const res = calculateGst({
        amount: 25000,
        gstRate: 18,
        txType: 'interstate',
      });
      expect(res.invoicePreview.b2bHeadline).toBe('Interstate B2B Invoice (IGST)');
      expect(res.invoicePreview.isInterstate).toBe(true);
      expect(res.invoicePreview.igst).toBe(4500);
    });
  });

  // 7. Special Slabs & Specialized Rates
  describe('Specialized Commodity Rates (3% Gold, 0.25% Precious Stones)', () => {
    it('26. calculates 3% GST on ₹1,00,000 Gold jewellery purchase', () => {
      const res = calculateGst({
        amount: 100000,
        gstRate: 3,
        txType: 'intrastate',
      });
      expect(res.gstAmount).toBe(3000);
      expect(res.cgst).toBe(1500);
      expect(res.sgst).toBe(1500);
      expect(res.grossAmount).toBe(103000);
    });

    it('27. calculates 0.25% GST on ₹10,00,000 rough diamonds', () => {
      const res = calculateGst({
        amount: 1000000,
        gstRate: 0.25,
        txType: 'intrastate',
      });
      expect(res.gstAmount).toBe(2500);
      expect(res.grossAmount).toBe(1002500);
    });

    it('28. extracts 3% GST from ₹1,03,000 inclusive gold purchase', () => {
      const res = calculateGst({
        amount: 103000,
        gstRate: 3,
        gstType: 'inclusive',
      });
      expect(res.netAmount).toBe(100000);
      expect(res.gstAmount).toBe(3000);
    });
  });

  // 8. Robustness, Zero, and Negative Values
  describe('Edge Cases & Boundary Robustness', () => {
    it('29. handles 0 amount gracefully', () => {
      const res = calculateGst({ amount: 0, gstRate: 18 });
      expect(res.netAmount).toBe(0);
      expect(res.gstAmount).toBe(0);
      expect(res.grossAmount).toBe(0);
    });

    it('30. clamps negative amount to 0', () => {
      const res = calculateGst({ amount: -5000, gstRate: 18 });
      expect(res.netAmount).toBe(0);
      expect(res.gstAmount).toBe(0);
      expect(res.grossAmount).toBe(0);
    });

    it('31. clamps negative GST rate to 0', () => {
      const res = calculateGst({ amount: 10000, gstRate: -10 });
      expect(res.gstRate).toBe(0);
      expect(res.gstAmount).toBe(0);
      expect(res.grossAmount).toBe(10000);
    });

    it('32. handles large commercial corporate amounts (₹50 Crores)', () => {
      const res = calculateGst({
        amount: 500000000, // ₹50 Cr
        gstRate: 18,
        txType: 'interstate',
      });
      expect(res.gstAmount).toBe(90000000); // ₹9 Cr
      expect(res.grossAmount).toBe(590000000);
    });

    it('33. ensures mathematical invariant: grossAmount = netAmount + gstAmount for exclusive', () => {
      const testAmounts = [100, 257, 999, 12345, 876543, 10000000];
      testAmounts.forEach((amt) => {
        const res = calculateGst({ amount: amt, gstRate: 18 });
        expect(res.grossAmount).toBe(res.netAmount + res.gstAmount);
      });
    });

    it('34. ensures mathematical invariant: netAmount + gstAmount = grossAmount for inclusive', () => {
      const testAmounts = [118, 560, 11800, 99999, 1180000];
      testAmounts.forEach((amt) => {
        const res = calculateGst({ amount: amt, gstRate: 18, gstType: 'inclusive' });
        expect(res.netAmount + res.gstAmount).toBe(res.grossAmount);
      });
    });
  });

  // 9. Recommendations & Decision Intelligence
  describe('Smart Recommendations & Decision Insights', () => {
    it('35. generates interstate recommendation for interstate transactions', () => {
      const res = calculateGst({
        amount: 100000,
        gstRate: 18,
        txType: 'interstate',
      });
      const topRec = res.recommendations[0];
      expect(topRec.title).toContain('Interstate Supply');
      expect(topRec.action).toContain('IGST');
    });

    it('36. generates intrastate recommendation for intrastate transactions', () => {
      const res = calculateGst({
        amount: 100000,
        gstRate: 18,
        txType: 'intrastate',
      });
      const topRec = res.recommendations[0];
      expect(topRec.title).toContain('Intrastate Supply');
      expect(topRec.action).toContain('CGST');
      expect(topRec.action).toContain('SGST');
    });

    it('37. generates ITC compliance recommendation', () => {
      const res = calculateGst({ amount: 50000, gstRate: 18 });
      const itcRec = res.recommendations.find((r) => r.title.includes('Input Tax Credit'));
      expect(itcRec).toBeDefined();
      expect(itcRec.savings).toBe(9000);
    });

    it('38. generates reverse extraction recommendation', () => {
      const res = calculateGst({ amount: 10000, gstRate: 18 });
      const revRec = res.recommendations.find((r) => r.title.includes('Reverse Extraction'));
      expect(revRec).toBeDefined();
    });
  });

  // 10. Hero Text Formatting
  describe('Hero Decision Verdict Text', () => {
    it('39. formats hero text for exclusive mode', () => {
      const res = calculateGst({
        amount: 10000,
        gstRate: 18,
        gstType: 'exclusive',
      });
      expect(res.heroText).toContain('18% GST adds ₹1,800');
      expect(res.heroText).toContain('₹10,000 base price');
      expect(res.heroText).toContain('Total Invoice: ₹11,800');
    });

    it('40. formats hero text for inclusive mode', () => {
      const res = calculateGst({
        amount: 11800,
        gstRate: 18,
        gstType: 'inclusive',
      });
      expect(res.heroText).toContain('Extracted GST of ₹1,800');
      expect(res.heroText).toContain('gross ₹11,800');
      expect(res.heroText).toContain('Net taxable price is ₹10,000');
    });
  });

  // 11. Reverse GST Engine Sub-Object
  describe('Reverse GST Analysis Sub-Object', () => {
    it('41. produces correct reverseRes properties on exclusive calculation', () => {
      const res = calculateGst({ amount: 10000, gstRate: 18, gstType: 'exclusive' });
      // Gross is 11,800. reverseGST of 11,800 @ 18% gives net 10,000, gst 1,800
      expect(res.reverseRes.netAmount).toBe(10000);
      expect(res.reverseRes.gstAmount).toBe(1800);
    });

    it('42. produces correct reverseRes properties on inclusive calculation', () => {
      const res = calculateGst({ amount: 11800, gstRate: 18, gstType: 'inclusive' });
      expect(res.reverseRes.netAmount).toBe(10000);
      expect(res.reverseRes.gstAmount).toBe(1800);
    });
  });

  // 12. Default Parameters & Fallbacks
  describe('Default Inputs & Fallbacks', () => {
    it('43. defaults amount to 10000 and rate to 18 when inputs are empty', () => {
      const res = calculateGst();
      expect(res.netAmount).toBe(10000);
      expect(res.gstRate).toBe(18);
      expect(res.gstAmount).toBe(1800);
      expect(res.grossAmount).toBe(11800);
    });

    it('44. handles string number inputs correctly', () => {
      const res = calculateGst({
        amount: '20000',
        gstRate: '12',
      });
      expect(res.netAmount).toBe(20000);
      expect(res.gstRate).toBe(12);
      expect(res.gstAmount).toBe(2400);
      expect(res.grossAmount).toBe(22400);
    });

    it('45. handles invalid string gracefully', () => {
      const res = calculateGst({
        amount: 'invalid',
        gstRate: 'abc',
      });
      expect(res.netAmount).toBe(0);
      expect(res.gstRate).toBe(0);
      expect(res.gstAmount).toBe(0);
      expect(res.grossAmount).toBe(0);
    });
  });
});