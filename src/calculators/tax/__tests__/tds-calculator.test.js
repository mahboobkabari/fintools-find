import { describe, it, expect } from 'vitest';
import { calculateTdsCalculator, TDS_SECTIONS } from '../tds-calculator.js';

describe('Flagship TDS Calculator Math Engine (Sprint 56 Audit)', () => {
  // 1. Statutory Sections Verification
  describe('Statutory Section Calculations (With Valid PAN)', () => {
    it('1. calculates Section 194J(b) Professional Fees (10% on ₹1,00,000)', () => {
      const res = calculateTdsCalculator({
        amount: 100000,
        sectionKey: '194J_PROF',
        hasPan: true,
      });
      expect(res.grossAmount).toBe(100000);
      expect(res.baseRate).toBe(10);
      expect(res.effectiveRate).toBe(10);
      expect(res.tdsAmount).toBe(10000);
      expect(res.netPayout).toBe(90000);
      expect(res.primaryOutput).toBe(10000);
    });

    it('2. calculates Section 194J(a) Technical / BPO Services (2% on ₹2,50,000)', () => {
      const res = calculateTdsCalculator({
        amount: 250000,
        sectionKey: '194J_TECH',
        hasPan: true,
      });
      expect(res.baseRate).toBe(2);
      expect(res.effectiveRate).toBe(2);
      expect(res.tdsAmount).toBe(5000);
      expect(res.netPayout).toBe(245000);
    });

    it('3. calculates Section 194C Individual/HUF Contractor (1% on ₹80,000)', () => {
      const res = calculateTdsCalculator({
        amount: 80000,
        sectionKey: '194C_IND',
        hasPan: true,
      });
      expect(res.baseRate).toBe(1);
      expect(res.tdsAmount).toBe(800);
      expect(res.netPayout).toBe(79200);
    });

    it('4. calculates Section 194C Corporate Contractor (2% on ₹5,00,000)', () => {
      const res = calculateTdsCalculator({
        amount: 500000,
        sectionKey: '194C_CORP',
        hasPan: true,
      });
      expect(res.baseRate).toBe(2);
      expect(res.tdsAmount).toBe(10000);
      expect(res.netPayout).toBe(490000);
    });

    it('5. calculates Section 194A Bank FD Interest for General Citizen (10% on ₹60,000)', () => {
      const res = calculateTdsCalculator({
        amount: 60000,
        sectionKey: '194A_FD',
        hasPan: true,
        isSeniorCitizen: false,
      });
      expect(res.threshold).toBe(40000);
      expect(res.tdsAmount).toBe(6000);
      expect(res.netPayout).toBe(54000);
    });

    it('6. calculates Section 194A Bank FD Interest for Senior Citizen (₹50,000 threshold)', () => {
      const belowSenior = calculateTdsCalculator({
        amount: 45000,
        sectionKey: '194A_FD',
        hasPan: true,
        isSeniorCitizen: true,
      });
      expect(belowSenior.threshold).toBe(50000);
      expect(belowSenior.isAboveThreshold).toBe(false);
      expect(belowSenior.tdsAmount).toBe(0);
      expect(belowSenior.netPayout).toBe(45000);

      const aboveSenior = calculateTdsCalculator({
        amount: 60000,
        sectionKey: '194A_FD',
        hasPan: true,
        isSeniorCitizen: true,
      });
      expect(aboveSenior.isAboveThreshold).toBe(true);
      expect(aboveSenior.tdsAmount).toBe(6000);
      expect(aboveSenior.netPayout).toBe(54000);
    });

    it('7. calculates Section 194I(b) Rent for Land/Building (10% on ₹3,60,000)', () => {
      const res = calculateTdsCalculator({
        amount: 360000,
        sectionKey: '194I_RENT_PROP',
        hasPan: true,
      });
      expect(res.threshold).toBe(240000);
      expect(res.tdsAmount).toBe(36000);
      expect(res.netPayout).toBe(324000);
    });

    it('8. calculates Section 194I(a) Rent for Plant/Machinery (2% on ₹3,00,000)', () => {
      const res = calculateTdsCalculator({
        amount: 300000,
        sectionKey: '194I_RENT_MACH',
        hasPan: true,
      });
      expect(res.baseRate).toBe(2);
      expect(res.tdsAmount).toBe(6000);
      expect(res.netPayout).toBe(294000);
    });

    it('9. calculates Section 194IA Property Purchase TDS (1% on ₹75,00,000)', () => {
      const res = calculateTdsCalculator({
        amount: 7500000,
        sectionKey: '194IA_PROP_SALE',
        hasPan: true,
      });
      expect(res.threshold).toBe(5000000);
      expect(res.tdsAmount).toBe(75000);
      expect(res.netPayout).toBe(7425000);
    });

    it('10. calculates Section 194IB Individual Monthly Rent (5% on ₹80,000/mo)', () => {
      const res = calculateTdsCalculator({
        amount: 80000,
        sectionKey: '194IB_RENT_IND',
        hasPan: true,
      });
      expect(res.threshold).toBe(50000);
      expect(res.baseRate).toBe(5);
      expect(res.tdsAmount).toBe(4000);
      expect(res.netPayout).toBe(76000);
    });

    it('11. calculates Section 194H Commission / Brokerage (5% on ₹50,000)', () => {
      const res = calculateTdsCalculator({
        amount: 50000,
        sectionKey: '194H_COMM',
        hasPan: true,
      });
      expect(res.threshold).toBe(15000);
      expect(res.baseRate).toBe(5);
      expect(res.tdsAmount).toBe(2500);
      expect(res.netPayout).toBe(47500);
    });

    it('12. calculates Section 194M High-Value Non-Audit Contract (5% on ₹60,00,000)', () => {
      const res = calculateTdsCalculator({
        amount: 6000000,
        sectionKey: '194M_IND_CONT',
        hasPan: true,
      });
      expect(res.threshold).toBe(5000000);
      expect(res.baseRate).toBe(5);
      expect(res.tdsAmount).toBe(300000);
      expect(res.netPayout).toBe(5700000);
    });

    it('13. calculates Section 194Q Purchase of Goods (0.1% on excess over ₹50 Lakhs)', () => {
      const res = calculateTdsCalculator({
        amount: 8000000, // ₹80 Lakhs total purchase
        sectionKey: '194Q_GOODS',
        hasPan: true,
      });
      // Excess is ₹30 Lakhs => 0.1% of ₹30,00,000 = ₹3,000
      expect(res.tdsAmount).toBe(3000);
      expect(res.netPayout).toBe(7997000);
    });

    it('14. calculates Section 194Q below threshold of ₹50 Lakhs (₹0 TDS)', () => {
      const res = calculateTdsCalculator({
        amount: 4000000,
        sectionKey: '194Q_GOODS',
        hasPan: true,
      });
      expect(res.isAboveThreshold).toBe(false);
      expect(res.tdsAmount).toBe(0);
      expect(res.netPayout).toBe(4000000);
    });
  });

  // 2. Section 206AA Penal Non-PAN Deductions
  describe('Section 206AA Non-PAN Penal Deductions', () => {
    it('15. triggers 20% penal rate on 194J when PAN is missing', () => {
      const res = calculateTdsCalculator({
        amount: 100000,
        sectionKey: '194J_PROF',
        hasPan: false,
      });
      expect(res.hasPan).toBe(false);
      expect(res.baseRate).toBe(10);
      expect(res.effectiveRate).toBe(20);
      expect(res.tdsAmount).toBe(20000);
      expect(res.netPayout).toBe(80000);
      expect(res.panPenaltyAmount).toBe(10000);
    });

    it('16. triggers 20% penal rate on 194C Individual (1% -> 20%) when PAN is missing', () => {
      const res = calculateTdsCalculator({
        amount: 100000,
        sectionKey: '194C_IND',
        hasPan: false,
      });
      expect(res.effectiveRate).toBe(20);
      expect(res.tdsAmount).toBe(20000);
      expect(res.panPenaltyRate).toBe(19);
      expect(res.panPenaltyAmount).toBe(19000);
    });

    it('17. triggers 5% penal rate for Section 194Q when PAN is missing', () => {
      const res = calculateTdsCalculator({
        amount: 7000000, // ₹20L excess
        sectionKey: '194Q_GOODS',
        hasPan: false,
      });
      expect(res.effectiveRate).toBe(5);
      expect(res.tdsAmount).toBe(100000); // 5% of ₹20,00,000
    });

    it('18. handles string boolean hasPan="false"', () => {
      const res = calculateTdsCalculator({
        amount: 50000,
        sectionKey: '194H_COMM',
        hasPan: 'false',
      });
      expect(res.effectiveRate).toBe(20);
      expect(res.tdsAmount).toBe(10000);
    });
  });

  // 3. Lower TDS Certificate (Section 197 / 197A) & Custom Rates
  describe('Lower Rate Certificates & Custom Rates', () => {
    it('19. applies Section 197 Lower Rate Certificate (e.g. 1.5% on 194J)', () => {
      const res = calculateTdsCalculator({
        amount: 500000,
        sectionKey: '194J_PROF',
        hasLowerRateCert: true,
        lowerRatePercent: 1.5,
      });
      expect(res.hasLowerRateCert).toBe(true);
      expect(res.effectiveRate).toBe(1.5);
      expect(res.tdsAmount).toBe(7500);
      expect(res.netPayout).toBe(492500);
    });

    it('20. applies 0% NIL TDS Certificate under Section 197', () => {
      const res = calculateTdsCalculator({
        amount: 1000000,
        sectionKey: '194J_PROF',
        hasLowerRateCert: true,
        lowerRatePercent: 0,
      });
      expect(res.effectiveRate).toBe(0);
      expect(res.tdsAmount).toBe(0);
      expect(res.netPayout).toBe(1000000);
    });

    it('21. computes custom TDS rate', () => {
      const res = calculateTdsCalculator({
        amount: 200000,
        sectionKey: 'CUSTOM',
        customRate: 7.5,
      });
      expect(res.baseRate).toBe(7.5);
      expect(res.effectiveRate).toBe(7.5);
      expect(res.tdsAmount).toBe(15000);
      expect(res.netPayout).toBe(185000);
    });
  });

  // 4. Threshold Limits & Boundaries
  describe('Threshold Limits & Boundary Cases', () => {
    it('22. returns ₹0 TDS when amount is below 194J threshold (₹25,000 < ₹30,000)', () => {
      const res = calculateTdsCalculator({
        amount: 25000,
        sectionKey: '194J_PROF',
      });
      expect(res.isAboveThreshold).toBe(false);
      expect(res.tdsAmount).toBe(0);
      expect(res.netPayout).toBe(25000);
    });

    it('23. applies TDS when amount equals threshold exactly (₹30,000 on 194J)', () => {
      const res = calculateTdsCalculator({
        amount: 30000,
        sectionKey: '194J_PROF',
      });
      expect(res.isAboveThreshold).toBe(true);
      expect(res.tdsAmount).toBe(3000);
      expect(res.netPayout).toBe(27000);
    });

    it('24. returns ₹0 TDS when amount is ₹1 below 194I rent threshold (₹2,39,999)', () => {
      const res = calculateTdsCalculator({
        amount: 239999,
        sectionKey: '194I_RENT_PROP',
      });
      expect(res.isAboveThreshold).toBe(false);
      expect(res.tdsAmount).toBe(0);
    });

    it('25. applies TDS when amount is ₹1 above 194I rent threshold (₹2,40,001)', () => {
      const res = calculateTdsCalculator({
        amount: 240001,
        sectionKey: '194I_RENT_PROP',
      });
      expect(res.isAboveThreshold).toBe(true);
      expect(res.tdsAmount).toBe(24000);
    });

    it('26. bypasses threshold when isThresholdExempt=true (cumulative bills in FY)', () => {
      const res = calculateTdsCalculator({
        amount: 15000,
        sectionKey: '194J_PROF',
        isThresholdExempt: true,
      });
      expect(res.isAboveThreshold).toBe(true);
      expect(res.tdsAmount).toBe(1500);
      expect(res.netPayout).toBe(13500);
    });
  });

  // 5. Edge Cases & Boundary Handling
  describe('Mathematical Boundary & Robustness', () => {
    it('27. handles 0 payment amount gracefully', () => {
      const res = calculateTdsCalculator({ amount: 0 });
      expect(res.grossAmount).toBe(0);
      expect(res.tdsAmount).toBe(0);
      expect(res.netPayout).toBe(0);
    });

    it('28. clamps negative payment amount to 0', () => {
      const res = calculateTdsCalculator({ amount: -50000 });
      expect(res.grossAmount).toBe(0);
      expect(res.tdsAmount).toBe(0);
      expect(res.netPayout).toBe(0);
    });

    it('29. handles large institutional amounts (₹100 Crores)', () => {
      const res = calculateTdsCalculator({
        amount: 1000000000, // ₹100 Cr
        sectionKey: '194C_CORP',
      });
      expect(res.tdsAmount).toBe(20000000); // ₹2 Cr
      expect(res.netPayout).toBe(980000000);
    });

    it('30. ensures mathematical balance: grossAmount = netPayout + tdsAmount', () => {
      const testCases = [
        { amount: 123456, sectionKey: '194J_PROF' },
        { amount: 987654, sectionKey: '194C_IND' },
        { amount: 543210, sectionKey: '194I_RENT_PROP' },
        { amount: 777777, sectionKey: '194H_COMM' },
      ];
      testCases.forEach((tc) => {
        const res = calculateTdsCalculator(tc);
        expect(res.grossAmount).toBe(res.netPayout + res.tdsAmount);
      });
    });
  });

  // 6. Final Tax Reconciliation (TDS vs Actual Tax at ITR)
  describe('ITR Tax Reconciliation & Refund vs Advance Tax Due', () => {
    it('31. identifies 100% Tax Refund for 0% tax slab recipient', () => {
      const res = calculateTdsCalculator({
        amount: 100000,
        sectionKey: '194J_PROF',
        recipientTaxSlab: 0,
      });
      expect(res.taxReconciliation.estimatedFinalTax).toBe(0);
      expect(res.taxReconciliation.isRefund).toBe(true);
      expect(res.taxReconciliation.refundAmount).toBe(10000);
      expect(res.taxReconciliation.balanceTaxDue).toBe(0);
    });

    it('32. calculates partial refund for 5% tax slab recipient on 194J (10% TDS)', () => {
      const res = calculateTdsCalculator({
        amount: 100000,
        sectionKey: '194J_PROF',
        recipientTaxSlab: 5,
      });
      // 5% slab + 4% cess = 5.2% => ₹5,200 final tax
      expect(res.taxReconciliation.estimatedFinalTax).toBe(5200);
      expect(res.taxReconciliation.isRefund).toBe(true);
      expect(res.taxReconciliation.refundAmount).toBe(4800); // ₹10,000 - ₹5,200
    });

    it('33. calculates balance advance tax due for 30% tax slab recipient on 194J (10% TDS)', () => {
      const res = calculateTdsCalculator({
        amount: 100000,
        sectionKey: '194J_PROF',
        recipientTaxSlab: 30,
      });
      // 30% slab + 4% cess = 31.2% => ₹31,200 final tax
      expect(res.taxReconciliation.estimatedFinalTax).toBe(31200);
      expect(res.taxReconciliation.isRefund).toBe(false);
      expect(res.taxReconciliation.balanceTaxDue).toBe(21200); // ₹31,200 - ₹10,000
    });

    it('34. calculates balance advance tax due for 20% slab on 194C (1% TDS)', () => {
      const res = calculateTdsCalculator({
        amount: 200000,
        sectionKey: '194C_IND',
        recipientTaxSlab: 20,
      });
      // 1% TDS = ₹2,000. Final tax = 20.8% of ₹2L = ₹41,600
      expect(res.tdsAmount).toBe(2000);
      expect(res.taxReconciliation.balanceTaxDue).toBe(39600);
    });
  });

  // 7. Statutory Compliance & Late Deposit Penalties
  describe('Statutory Compliance & Section 201(1A) Interest', () => {
    it('35. computes 0 late interest when delay is 0 months', () => {
      const res = calculateTdsCalculator({
        amount: 100000,
        sectionKey: '194J_PROF',
        delayMonthsDeposit: 0,
      });
      expect(res.compliance.lateInterestAmount).toBe(0);
      expect(res.compliance.totalPayableWithLateInterest).toBe(10000);
    });

    it('36. computes 1.5% interest per month for 1 month late deposit', () => {
      const res = calculateTdsCalculator({
        amount: 100000,
        sectionKey: '194J_PROF',
        delayMonthsDeposit: 1,
      });
      // 1.5% of ₹10,000 = ₹150
      expect(res.compliance.lateInterestAmount).toBe(150);
      expect(res.compliance.totalPayableWithLateInterest).toBe(10150);
    });

    it('37. computes 4.5% interest for 3 months late deposit', () => {
      const res = calculateTdsCalculator({
        amount: 200000,
        sectionKey: '194J_PROF', // 10% = ₹20,000
        delayMonthsDeposit: 3,
      });
      // 1.5% * 3 = 4.5% of ₹20,000 = ₹900
      expect(res.compliance.lateInterestAmount).toBe(900);
      expect(res.compliance.totalPayableWithLateInterest).toBe(20900);
    });

    it('38. returns correct statutory certificate form metadata', () => {
      const res194J = calculateTdsCalculator({ sectionKey: '194J_PROF' });
      expect(res194J.compliance.certificateForm).toBe('Form 16A');

      const res194IA = calculateTdsCalculator({ sectionKey: '194IA_PROP_SALE', amount: 6000000 });
      expect(res194IA.compliance.certificateForm).toBe('Form 16B');

      const res194IB = calculateTdsCalculator({ sectionKey: '194IB_RENT_IND', amount: 80000 });
      expect(res194IB.compliance.certificateForm).toBe('Form 16C');

      const res194M = calculateTdsCalculator({ sectionKey: '194M_IND_CONT', amount: 6000000 });
      expect(res194M.compliance.certificateForm).toBe('Form 16D');
    });
  });

  // 8. Multi-Section Comparison & B2B Voucher
  describe('Multi-Section Comparison & B2B Voucher Data', () => {
    it('39. generates 6 comparison rows for the given invoice amount', () => {
      const res = calculateTdsCalculator({ amount: 100000 });
      expect(res.multiSectionComparison).toHaveLength(6);
      const profRow = res.multiSectionComparison.find((r) => r.sectionKey === '194J_PROF');
      expect(profRow.tdsAmount).toBe(10000);
      const corpRow = res.multiSectionComparison.find((r) => r.sectionKey === '194C_CORP');
      expect(corpRow.tdsAmount).toBe(2000);
    });

    it('40. generates valid B2B invoice preview object', () => {
      const res = calculateTdsCalculator({
        amount: 150000,
        sectionKey: '194J_PROF',
        hasPan: true,
      });
      expect(res.b2bInvoicePreview.grossAmount).toBe(150000);
      expect(res.b2bInvoicePreview.tdsDeducted).toBe(15000);
      expect(res.b2bInvoicePreview.netPayable).toBe(135000);
      expect(res.b2bInvoicePreview.sectionCode).toBe('Section 194J(b)');
    });
  });

  // 9. Recommendations & Hero Text
  describe('Smart Recommendations & Hero Decision Engine', () => {
    it('41. generates non-PAN warning recommendation when PAN is missing', () => {
      const res = calculateTdsCalculator({
        amount: 100000,
        sectionKey: '194J_PROF',
        hasPan: false,
      });
      const panRec = res.recommendations.find((r) => r.title.includes('PAN'));
      expect(panRec).toBeDefined();
      expect(panRec.savings).toBe(10000);
    });

    it('42. generates refund recommendation when recipient is in 0% slab', () => {
      const res = calculateTdsCalculator({
        amount: 100000,
        sectionKey: '194J_PROF',
        recipientTaxSlab: 0,
      });
      const refundRec = res.recommendations.find((r) => r.title.includes('Refund'));
      expect(refundRec).toBeDefined();
      expect(refundRec.savings).toBe(10000);
    });

    it('43. formats hero text for below threshold invoice', () => {
      const res = calculateTdsCalculator({
        amount: 10000,
        sectionKey: '194J_PROF',
      });
      expect(res.heroText).toContain('below statutory threshold');
    });

    it('44. formats hero text for standard TDS deduction', () => {
      const res = calculateTdsCalculator({
        amount: 100000,
        sectionKey: '194J_PROF',
      });
      expect(res.heroText).toContain('10%');
      expect(res.heroText).toContain('10,000');
      expect(res.heroText).toContain('90,000');
    });
  });
});