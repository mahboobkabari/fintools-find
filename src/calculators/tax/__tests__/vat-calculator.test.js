import { describe, it, expect } from 'vitest';
import { calculateVatCalculator, calculateVatTool } from '../vat-calculator.js';

describe('Flagship VAT Calculator Decision Engine Suite (Sprint 59 Audit)', () => {
  // 1. Exclusive VAT Calculations (Standard UK & Regional Benchmarks)
  describe('Exclusive VAT Calculations (Add VAT to Net Price)', () => {
    it('1. calculates UK standard 20% VAT on £1,000 net base amount', () => {
      const res = calculateVatCalculator({
        amount: 1000,
        rate: 20,
        mode: 'exclusive',
      });
      expect(res.netAmount).toBe(1000);
      expect(res.vatAmount).toBe(200);
      expect(res.grossAmount).toBe(1200);
      expect(res.primaryOutput).toBe(200);
      expect(res.rate).toBe(20);
      expect(res.mode).toBe('exclusive');
    });

    it('2. calculates UK reduced 5% VAT on £500 domestic energy bill', () => {
      const res = calculateVatCalculator({
        amount: 500,
        rate: 5,
        mode: 'exclusive',
      });
      expect(res.netAmount).toBe(500);
      expect(res.vatAmount).toBe(25);
      expect(res.grossAmount).toBe(525);
    });

    it('3. calculates 0% zero-rated VAT', () => {
      const res = calculateVatCalculator({
        amount: 1500,
        rate: 0,
        mode: 'exclusive',
      });
      expect(res.netAmount).toBe(1500);
      expect(res.vatAmount).toBe(0);
      expect(res.grossAmount).toBe(1500);
    });

    it('4. calculates Germany standard 19% MwSt on €2,000 net supply', () => {
      const res = calculateVatCalculator({
        amount: 2000,
        rate: 19,
        mode: 'exclusive',
        currencySymbol: '€',
      });
      expect(res.netAmount).toBe(2000);
      expect(res.vatAmount).toBe(380);
      expect(res.grossAmount).toBe(2380);
      expect(res.currencySymbol).toBe('€');
    });

    it('5. calculates UAE standard 5% VAT on AED 10,000 corporate invoice', () => {
      const res = calculateVatCalculator({
        amount: 10000,
        rate: 5,
        mode: 'exclusive',
        currencySymbol: 'AED ',
      });
      expect(res.netAmount).toBe(10000);
      expect(res.vatAmount).toBe(500);
      expect(res.grossAmount).toBe(10500);
    });
  });

  // 2. Inclusive VAT Calculations (Reverse VAT Extraction)
  describe('Inclusive VAT Calculations (Extract VAT from Gross Total)', () => {
    it('6. extracts 20% VAT from £1,200 gross retail price', () => {
      const res = calculateVatCalculator({
        amount: 1200,
        rate: 20,
        mode: 'inclusive',
      });
      expect(res.grossAmount).toBe(1200);
      expect(res.netAmount).toBe(1000);
      expect(res.vatAmount).toBe(200);
    });

    it('7. extracts 5% VAT from £525 gross price', () => {
      const res = calculateVatCalculator({
        amount: 525,
        rate: 5,
        mode: 'inclusive',
      });
      expect(res.grossAmount).toBe(525);
      expect(res.netAmount).toBe(500);
      expect(res.vatAmount).toBe(25);
    });

    it('8. extracts 19% MwSt from €2,380 gross price', () => {
      const res = calculateVatCalculator({
        amount: 2380,
        rate: 19,
        mode: 'inclusive',
      });
      expect(res.grossAmount).toBe(2380);
      expect(res.netAmount).toBe(2000);
      expect(res.vatAmount).toBe(380);
    });

    it('9. handles 0% inclusive extraction', () => {
      const res = calculateVatCalculator({
        amount: 5000,
        rate: 0,
        mode: 'inclusive',
      });
      expect(res.grossAmount).toBe(5000);
      expect(res.netAmount).toBe(5000);
      expect(res.vatAmount).toBe(0);
    });

    it('10. extracts 25% peak European VAT from 1,250 gross price', () => {
      const res = calculateVatCalculator({
        amount: 1250,
        rate: 25,
        mode: 'inclusive',
      });
      expect(res.grossAmount).toBe(1250);
      expect(res.netAmount).toBe(1000);
      expect(res.vatAmount).toBe(250);
    });
  });

  // 3. International Global VAT Rates
  describe('International Statutory VAT Slabs', () => {
    it('11. calculates Spain standard 21% IVA on €1,000', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 21 });
      expect(res.vatAmount).toBe(210);
      expect(res.grossAmount).toBe(1210);
    });

    it('12. calculates Italy standard 22% IVA on €1,000', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 22 });
      expect(res.vatAmount).toBe(220);
      expect(res.grossAmount).toBe(1220);
    });

    it('13. calculates Australia 10% GST/VAT on $1,000', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 10 });
      expect(res.vatAmount).toBe(100);
      expect(res.grossAmount).toBe(1100);
    });

    it('14. calculates South Africa 15% VAT on R1,000', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 15 });
      expect(res.vatAmount).toBe(150);
      expect(res.grossAmount).toBe(1150);
    });

    it('15. calculates Hungary peak 27% EU VAT on 10,000 HUF', () => {
      const res = calculateVatCalculator({ amount: 10000, rate: 27 });
      expect(res.vatAmount).toBe(2700);
      expect(res.grossAmount).toBe(12700);
    });
  });

  // 4. Fractional and Decimal Rates
  describe('Fractional & Concessional VAT Rates', () => {
    it('16. calculates France reduced 5.5% food TVA on €100', () => {
      const res = calculateVatCalculator({ amount: 100, rate: 5.5 });
      expect(res.vatAmount).toBe(5.5);
      expect(res.grossAmount).toBe(105.5);
    });

    it('17. calculates Switzerland 8.1% standard VAT on CHF 1,000', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 8.1 });
      expect(res.vatAmount).toBe(81);
      expect(res.grossAmount).toBe(1081);
    });

    it('18. calculates Switzerland 2.6% reduced VAT on CHF 1,000', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 2.6 });
      expect(res.vatAmount).toBe(26);
      expect(res.grossAmount).toBe(1026);
    });

    it('19. extracts 5.5% TVA from inclusive price of €105.50', () => {
      const res = calculateVatCalculator({ amount: 105.5, rate: 5.5, mode: 'inclusive' });
      expect(res.netAmount).toBe(100);
      expect(res.vatAmount).toBe(5.5);
    });
  });

  // 5. Effective Tax Rate & Financial Metrics
  describe('Effective Tax Rate & Metric Computations', () => {
    it('20. computes effective tax rate on gross price for 20% VAT (200/1200 = 16.67%)', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 20 });
      expect(res.effectiveRate).toBe(16.67);
    });

    it('21. computes effective tax rate on gross price for 5% VAT (25/525 = 4.76%)', () => {
      const res = calculateVatCalculator({ amount: 500, rate: 5 });
      expect(res.effectiveRate).toBe(4.76);
    });

    it('22. computes tax per 100 base units for 20% VAT (£20)', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 20 });
      expect(res.taxPer100).toBe(20);
    });

    it('23. computes tax per 100 base units for 5% VAT (£5)', () => {
      const res = calculateVatCalculator({ amount: 500, rate: 5 });
      expect(res.taxPer100).toBe(5);
    });

    it('24. produces 0% effective rate for 0% VAT', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 0 });
      expect(res.effectiveRate).toBe(0);
      expect(res.taxPer100).toBe(0);
    });
  });

  // 6. Reverse VAT Analysis Sub-Object
  describe('Reverse VAT Sub-Object Details', () => {
    it('25. produces correct tax factor for 20% VAT (20/120 = 16.67%)', () => {
      const res = calculateVatCalculator({ amount: 1200, rate: 20, mode: 'inclusive' });
      expect(res.reverseVat.grossPrice).toBe(1200);
      expect(res.reverseVat.extractedNet).toBe(1000);
      expect(res.reverseVat.extractedTax).toBe(200);
      expect(res.reverseVat.taxFactor).toBe(16.67);
    });

    it('26. produces 0 tax factor for 0% VAT', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 0 });
      expect(res.reverseVat.taxFactor).toBe(0);
    });
  });

  // 7. Scenario Analysis Matrices
  describe('Scenario Sensitivity Comparisons', () => {
    it('27. generates zeroRated scenario with 0 tax', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 20 });
      expect(res.scenarios.zeroRated.rate).toBe(0);
      expect(res.scenarios.zeroRated.vatAmount).toBe(0);
      expect(res.scenarios.zeroRated.grossAmount).toBe(1000);
      expect(res.scenarios.zeroRated.diffFromCurrent).toBe(-200);
    });

    it('28. generates reduced 5% scenario', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 20 });
      expect(res.scenarios.reduced5.rate).toBe(5);
      expect(res.scenarios.reduced5.vatAmount).toBe(50);
      expect(res.scenarios.reduced5.grossAmount).toBe(1050);
      expect(res.scenarios.reduced5.diffFromCurrent).toBe(-150);
    });

    it('29. generates euAverage 21% scenario', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 20 });
      expect(res.scenarios.euAverage21.rate).toBe(21);
      expect(res.scenarios.euAverage21.vatAmount).toBe(210);
      expect(res.scenarios.euAverage21.grossAmount).toBe(1210);
      expect(res.scenarios.euAverage21.diffFromCurrent).toBe(10);
    });

    it('30. generates high 25% scenario', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 20 });
      expect(res.scenarios.high25.rate).toBe(25);
      expect(res.scenarios.high25.vatAmount).toBe(250);
      expect(res.scenarios.high25.grossAmount).toBe(1250);
      expect(res.scenarios.high25.diffFromCurrent).toBe(50);
    });
  });

  // 8. Itemized Invoice Preview
  describe('Itemized Commercial Invoice Preview', () => {
    it('31. generates itemized invoice for exclusive mode', () => {
      const res = calculateVatCalculator({ amount: 2500, rate: 20, mode: 'exclusive' });
      expect(res.invoicePreview.headline).toContain('Standard Commercial Tax Invoice');
      expect(res.invoicePreview.netAmount).toBe(2500);
      expect(res.invoicePreview.vatAmount).toBe(500);
      expect(res.invoicePreview.grossAmount).toBe(3000);
      expect(res.invoicePreview.isInclusive).toBe(false);
    });

    it('32. generates itemized invoice for inclusive mode', () => {
      const res = calculateVatCalculator({ amount: 3000, rate: 20, mode: 'inclusive' });
      expect(res.invoicePreview.headline).toContain('Tax-Inclusive Retail Invoice');
      expect(res.invoicePreview.netAmount).toBe(2500);
      expect(res.invoicePreview.vatAmount).toBe(500);
      expect(res.invoicePreview.grossAmount).toBe(3000);
      expect(res.invoicePreview.isInclusive).toBe(true);
    });
  });

  // 9. Recommendations & Decision Intelligence
  describe('Smart Recommendations & Decision Intelligence', () => {
    it('33. generates input VAT recovery recommendation', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 20 });
      const rec = res.recommendations.find((r) => r.title.includes('Input VAT Recovery'));
      expect(rec).toBeDefined();
      expect(rec.savings).toBe(200);
      expect(rec.action).toContain('£200');
    });

    it('34. generates reverse extraction recommendation', () => {
      const res = calculateVatCalculator({ amount: 1200, rate: 20, mode: 'inclusive' });
      const rec = res.recommendations.find((r) => r.title.includes('Reverse Extraction'));
      expect(rec).toBeDefined();
      expect(rec.action).toContain('£1,000');
    });
  });

  // 10. Hero Decision Verdict Text
  describe('Hero Decision Verdict Text', () => {
    it('35. formats exclusive hero text with rate, amount, and gross total', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: 20, mode: 'exclusive' });
      expect(res.heroText).toContain('20% VAT adds £200');
      expect(res.heroText).toContain('£1,000 net price');
      expect(res.heroText).toContain('Total Invoice: £1,200');
    });

    it('36. formats inclusive hero text with extracted tax and net price', () => {
      const res = calculateVatCalculator({ amount: 1200, rate: 20, mode: 'inclusive' });
      expect(res.heroText).toContain('Extracted £200 VAT');
      expect(res.heroText).toContain('gross £1,200');
      expect(res.heroText).toContain('Net taxable price is £1,000');
    });
  });

  // 11. Edge Cases, Zero & Negative Values
  describe('Edge Cases & Boundary Values', () => {
    it('37. handles 0 amount gracefully', () => {
      const res = calculateVatCalculator({ amount: 0, rate: 20 });
      expect(res.netAmount).toBe(0);
      expect(res.vatAmount).toBe(0);
      expect(res.grossAmount).toBe(0);
    });

    it('38. clamps negative amount to 0', () => {
      const res = calculateVatCalculator({ amount: -500, rate: 20 });
      expect(res.netAmount).toBe(0);
      expect(res.vatAmount).toBe(0);
      expect(res.grossAmount).toBe(0);
    });

    it('39. clamps negative VAT rate to 0', () => {
      const res = calculateVatCalculator({ amount: 1000, rate: -15 });
      expect(res.rate).toBe(0);
      expect(res.vatAmount).toBe(0);
      expect(res.grossAmount).toBe(1000);
    });

    it('40. handles large commercial corporate invoices (£10 Million)', () => {
      const res = calculateVatCalculator({
        amount: 10000000, // £10M
        rate: 20,
      });
      expect(res.netAmount).toBe(10000000);
      expect(res.vatAmount).toBe(2000000);
      expect(res.grossAmount).toBe(12000000);
    });

    it('41. ensures mathematical invariant: grossAmount = netAmount + vatAmount (exclusive)', () => {
      const amounts = [10, 49.99, 100, 245.5, 999.99, 12500, 850000];
      amounts.forEach((amt) => {
        const res = calculateVatCalculator({ amount: amt, rate: 20, mode: 'exclusive' });
        expect(res.grossAmount).toBeCloseTo(res.netAmount + res.vatAmount, 1);
      });
    });

    it('42. ensures mathematical invariant: netAmount + vatAmount = grossAmount (inclusive)', () => {
      const amounts = [12, 60, 120, 294.6, 1200, 15000];
      amounts.forEach((amt) => {
        const res = calculateVatCalculator({ amount: amt, rate: 20, mode: 'inclusive' });
        expect(res.grossAmount).toBeCloseTo(res.netAmount + res.vatAmount, 1);
      });
    });
  });

  // 12. Default Parameters & Aliases
  describe('Default Parameters & Framework Aliases', () => {
    it('43. defaults to amount=1000, rate=20, mode=exclusive when called with no arguments', () => {
      const res = calculateVatCalculator();
      expect(res.netAmount).toBe(1000);
      expect(res.rate).toBe(20);
      expect(res.vatAmount).toBe(200);
      expect(res.grossAmount).toBe(1200);
    });

    it('44. exports calculateVatTool alias identically', () => {
      const res1 = calculateVatCalculator({ amount: 1000, rate: 20 });
      const res2 = calculateVatTool({ amount: 1000, rate: 20 });
      expect(res1.netAmount).toBe(res2.netAmount);
      expect(res1.vatAmount).toBe(res2.vatAmount);
      expect(res1.grossAmount).toBe(res2.grossAmount);
    });

    it('45. handles string numbers correctly without crashing', () => {
      const res = calculateVatCalculator({
        amount: '2000',
        rate: '15',
        mode: 'exclusive',
      });
      expect(res.netAmount).toBe(2000);
      expect(res.rate).toBe(15);
      expect(res.vatAmount).toBe(300);
      expect(res.grossAmount).toBe(2300);
    });

    it('46. handles invalid strings gracefully', () => {
      const res = calculateVatCalculator({
        amount: 'invalid',
        rate: 'abc',
      });
      expect(res.netAmount).toBe(0);
      expect(res.rate).toBe(0);
      expect(res.vatAmount).toBe(0);
      expect(res.grossAmount).toBe(0);
    });
  });
});