import { describe, it, expect } from 'vitest';
import {
  calculateCryptoTax,
  calculateHoldingDays,
  matchLots,
  FIAT_CURRENCIES,
} from '../crypto-tax-calculator.js';
import {
  CRYPTO_TAX_JURISDICTIONS,
  CRYPTO_TRANSACTION_TYPES,
  COST_BASIS_METHODS,
} from '../../../data/tax-rates/cryptoTaxRules.js';
import { CRYPTO_TAX_CONFIG } from '../../configs/crypto-tax-calculator.config.js';

describe('Flagship #93: Crypto Tax Calculation Engine', () => {
  // 1. Profitable crypto sale
  it('1. calculates profitable crypto sale with accurate cost basis and realized gain', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'GENERIC',
      transactionType: 'SELL',
      quantity: 1.0,
      buyPrice: 40000,
      sellPrice: 60000,
      buyFee: 0,
      sellFee: 0,
      shortTermTaxRate: 30,
      longTermTaxRate: 15,
      buyDate: '2025-01-01',
      sellDate: '2025-03-01', // 59 days -> Short term
    });

    expect(res.summary.costBasis).toBe(40000);
    expect(res.summary.grossProceeds).toBe(60000);
    expect(res.summary.netProceeds).toBe(60000);
    expect(res.summary.realizedGainLoss).toBe(20000);
    expect(res.summary.isGain).toBe(true);
    expect(res.summary.capitalGainsTax).toBe(6000); // 30% of 20,000
    expect(res.summary.afterTaxProceeds).toBe(54000);
    expect(res.summary.afterTaxGain).toBe(14000);
  });

  // 2. Losing crypto sale
  it('2. calculates losing crypto sale with zero tax liability and negative P&L', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'GENERIC',
      transactionType: 'SELL',
      quantity: 2.0,
      buyPrice: 3000,
      sellPrice: 2000,
      buyFee: 0,
      sellFee: 0,
    });

    expect(res.summary.costBasis).toBe(6000);
    expect(res.summary.grossProceeds).toBe(4000);
    expect(res.summary.realizedGainLoss).toBe(-2000);
    expect(res.summary.isLoss).toBe(true);
    expect(res.summary.capitalGainsTax).toBe(0); // Zero tax on loss!
    expect(res.summary.totalEstimatedTax).toBe(0);
    expect(res.summary.afterTaxGain).toBe(-2000);
  });

  // 3. Break-even crypto sale
  it('3. calculates exact break-even sale with zero gain and zero tax', () => {
    const res = calculateCryptoTax({
      quantity: 0.5,
      buyPrice: 50000,
      sellPrice: 50000,
      buyFee: 0,
      sellFee: 0,
    });

    expect(res.summary.realizedGainLoss).toBe(0);
    expect(res.summary.capitalGainsTax).toBe(0);
    expect(res.summary.isGain).toBe(false);
    expect(res.summary.isLoss).toBe(false);
  });

  // 4. Acquisition fee addition to cost basis
  it('4. includes acquisition fee into total cost basis in deductible jurisdictions', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'GENERIC',
      quantity: 1.0,
      buyPrice: 10000,
      sellPrice: 15000,
      buyFee: 150,
      sellFee: 0,
    });

    // Cost basis = 10,000 + 150 = 10,150
    expect(res.summary.costBasis).toBe(10150);
    expect(res.summary.realizedGainLoss).toBe(4850);
  });

  // 5. Disposal fee deduction from gross proceeds
  it('5. subtracts disposal fee from gross proceeds to calculate net proceeds', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'GENERIC',
      quantity: 1.0,
      buyPrice: 10000,
      sellPrice: 15000,
      buyFee: 0,
      sellFee: 200,
    });

    expect(res.summary.grossProceeds).toBe(15000);
    expect(res.summary.netProceeds).toBe(14800);
    expect(res.summary.realizedGainLoss).toBe(4800);
  });

  // 6. Combined buy and sell fees
  it('6. correctly combines buy and sell fees without double counting', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'US',
      quantity: 1.0,
      buyPrice: 20000,
      sellPrice: 30000,
      buyFee: 50,
      sellFee: 75,
    });

    expect(res.summary.costBasis).toBe(20050);
    expect(res.summary.grossProceeds).toBe(30000);
    expect(res.summary.netProceeds).toBe(29925);
    expect(res.summary.realizedGainLoss).toBe(9875);
    expect(res.summary.totalFeesPaid).toBe(125);
  });

  // 7. Holding period in days calculation
  it('7. calculates calendar holding days between buyDate and sellDate', () => {
    const days = calculateHoldingDays('2024-01-01', '2025-01-01');
    expect(days).toBe(366); // 2024 was leap year

    const daysShort = calculateHoldingDays('2025-01-01', '2025-04-01');
    expect(daysShort).toBe(90);
  });

  // 8. Short-term holding period classification
  it('8. classifies holding period <= 365 days as Short-Term and applies ST rate', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'US',
      buyDate: '2025-01-01',
      sellDate: '2025-06-01', // 151 days
      quantity: 1.0,
      buyPrice: 1000,
      sellPrice: 2000,
      shortTermTaxRate: 24,
      longTermTaxRate: 15,
    });

    expect(res.meta.isLongTerm).toBe(false);
    expect(res.meta.holdingDays).toBe(151);
    expect(res.meta.applicableCgtRate).toBe(24);
    expect(res.summary.capitalGainsTax).toBe(240); // 24% of 1000
  });

  // 9. Long-term holding period classification
  it('9. classifies holding period > 365 days as Long-Term and applies LT rate', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'US',
      buyDate: '2024-01-01',
      sellDate: '2025-03-01', // 425 days
      quantity: 1.0,
      buyPrice: 1000,
      sellPrice: 2000,
      shortTermTaxRate: 24,
      longTermTaxRate: 15,
    });

    expect(res.meta.isLongTerm).toBe(true);
    expect(res.meta.applicableCgtRate).toBe(15);
    expect(res.summary.capitalGainsTax).toBe(150); // 15% of 1000
  });

  // 10. User-entered tax rate in Generic mode
  it('10. respects custom user-entered tax rates in Generic mode', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'GENERIC',
      quantity: 1.0,
      buyPrice: 10000,
      sellPrice: 20000,
      shortTermTaxRate: 37.5,
      buyDate: '2025-01-01',
      sellDate: '2025-02-01',
    });

    expect(res.summary.capitalGainsTax).toBe(3750); // 37.5% of 10000
  });

  // 11. Zero tax rate (0% tax)
  it('11. computes $0 tax when user enters a 0% tax rate', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'GENERIC',
      quantity: 1.0,
      buyPrice: 10000,
      sellPrice: 50000,
      shortTermTaxRate: 0,
      longTermTaxRate: 0,
    });

    expect(res.summary.capitalGainsTax).toBe(0);
    expect(res.summary.totalEstimatedTax).toBe(0);
    expect(res.summary.afterTaxGain).toBe(40000);
  });

  // 12. Negative tax rate sanitization
  it('12. sanitizes negative tax rates to zero', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'GENERIC',
      shortTermTaxRate: -25,
      longTermTaxRate: -10,
    });

    expect(res.inputs.shortTermTaxRate).toBe(0);
    expect(res.inputs.longTermTaxRate).toBe(0);
  });

  // 13. Zero quantity safeguard
  it('13. handles zero quantity with zero gain and zero tax', () => {
    const res = calculateCryptoTax({
      quantity: 0,
      buyPrice: 50000,
      sellPrice: 70000,
    });

    expect(res.summary.costBasis).toBe(0);
    expect(res.summary.grossProceeds).toBe(0);
    expect(res.summary.realizedGainLoss).toBe(0);
    expect(res.summary.totalEstimatedTax).toBe(0);
  });

  // 14. Negative quantity and price sanitization
  it('14. sanitizes negative quantity, price, and fee inputs to zero', () => {
    const res = calculateCryptoTax({
      quantity: -5,
      buyPrice: -1000,
      sellPrice: -2000,
      buyFee: -50,
      sellFee: -50,
    });

    expect(res.inputs.quantity).toBe(0);
    expect(res.inputs.buyPrice).toBe(0);
    expect(res.inputs.sellPrice).toBe(0);
    expect(res.inputs.buyFee).toBe(0);
    expect(res.inputs.sellFee).toBe(0);
  });

  // 15. Fractional crypto quantity precision (8 decimals)
  it('15. handles fractional crypto asset quantities with high precision', () => {
    const res = calculateCryptoTax({
      quantity: 0.03456789,
      buyPrice: 60000,
      sellPrice: 90000,
      shortTermTaxRate: 20,
      buyDate: '2025-01-01',
      sellDate: '2025-03-01', // Short term
    });

    const expectedCost = 0.03456789 * 60000; // 2074.0734
    const expectedProceeds = 0.03456789 * 90000; // 3111.1101
    const expectedGain = expectedProceeds - expectedCost; // 1037.0367

    expect(res.summary.costBasis).toBeCloseTo(expectedCost, 2);
    expect(res.summary.grossProceeds).toBeCloseTo(expectedProceeds, 2);
    expect(res.summary.realizedGainLoss).toBeCloseTo(expectedGain, 2);
    expect(res.summary.capitalGainsTax).toBeCloseTo(expectedGain * 0.20, 2);
  });

  // 16. Decimal asset prices (e.g. Altcoins / Memecoins)
  it('16. handles micro-priced tokens and decimal prices precisely', () => {
    const res = calculateCryptoTax({
      quantity: 50000,
      buyPrice: 0.045,
      sellPrice: 0.125,
      shortTermTaxRate: 25,
      buyDate: '2025-01-01',
      sellDate: '2025-03-01', // Short term
    });

    // Cost = 2,250, Proceeds = 6,250, Gain = 4,000
    expect(res.summary.costBasis).toBe(2250);
    expect(res.summary.grossProceeds).toBe(6250);
    expect(res.summary.realizedGainLoss).toBe(4000);
    expect(res.summary.capitalGainsTax).toBe(1000);
  });

  // 17. Large institutional transaction ($5,000,000+)
  it('17. supports large institutional scale crypto transactions', () => {
    const res = calculateCryptoTax({
      quantity: 100,
      buyPrice: 30000,
      sellPrice: 70000,
      buyFee: 2500,
      sellFee: 5000,
      shortTermTaxRate: 35,
      buyDate: '2025-01-01',
      sellDate: '2025-03-01', // Short term
    });

    expect(res.summary.grossProceeds).toBe(7000000);
    expect(res.summary.realizedGainLoss).toBe(3992500);
    expect(res.summary.capitalGainsTax).toBeCloseTo(3992500 * 0.35, 2);
  });

  // 18. Staking reward ordinary income recognition
  it('18. recognizes staking rewards as ordinary income at FMV upon receipt', () => {
    const res = calculateCryptoTax({
      transactionType: 'STAKING_REWARD',
      rewardQuantity: 3.5,
      rewardFmv: 2500,
      incomeTaxRate: 24,
      isRewardSoldLater: false,
    });

    // Income = 3.5 * 2500 = 8750
    expect(res.summary.recognizedIncomeFmv).toBe(8750);
    expect(res.summary.incomeTaxLiability).toBe(2100); // 24% of 8750
    expect(res.summary.capitalGainsTax).toBe(0);
    expect(res.summary.totalEstimatedTax).toBe(2100);
    expect(res.summary.afterTaxGain).toBe(6650);
  });

  // 19. Staking reward subsequent disposal (Capital Gain on top of Income Basis)
  it('19. models subsequent disposal of staking rewards using recognized FMV as cost basis', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'US',
      transactionType: 'STAKING_REWARD',
      rewardQuantity: 2.0,
      rewardFmv: 3000,
      incomeTaxRate: 24,
      buyDate: '2024-01-01', // Reward receipt date
      isRewardSoldLater: true,
      rewardSalePrice: 4500,
      rewardSaleDate: '2025-06-01', // Sold > 1 year later (Long term)
      shortTermTaxRate: 24,
      longTermTaxRate: 15,
    });

    // Income = 2.0 * 3000 = $6,000 -> Income Tax = $1,440
    expect(res.summary.recognizedIncomeFmv).toBe(6000);
    expect(res.summary.incomeTaxLiability).toBe(1440);

    // Later Sale: Proceeds = 2.0 * 4500 = $9,000. Cost basis = $6,000.
    // Capital Gain = $3,000 -> Long-Term Capital Gains Tax (15%) = $450
    expect(res.summary.rewardDisposalGainLoss).toBe(3000);
    expect(res.summary.rewardCapitalGainsTax).toBe(450);

    // Total Tax = $1,440 + $450 = $1,890
    expect(res.summary.totalEstimatedTax).toBe(1890);
  });

  // 20. Mining reward income recognition
  it('20. treats mining rewards as ordinary income at FMV', () => {
    const res = calculateCryptoTax({
      transactionType: 'MINING_REWARD',
      rewardQuantity: 0.5,
      rewardFmv: 60000,
      incomeTaxRate: 30,
    });

    expect(res.summary.recognizedIncomeFmv).toBe(30000);
    expect(res.summary.incomeTaxLiability).toBe(9000);
    expect(res.summary.totalEstimatedTax).toBe(9000);
  });

  // 21. Airdrop income recognition
  it('21. treats airdrops as taxable ordinary income upon receipt', () => {
    const res = calculateCryptoTax({
      transactionType: 'AIRDROP',
      rewardQuantity: 1000,
      rewardFmv: 1.50,
      incomeTaxRate: 22,
    });

    expect(res.summary.recognizedIncomeFmv).toBe(1500);
    expect(res.summary.incomeTaxLiability).toBe(330);
  });

  // 22. Crypto-to-Crypto Swap taxable event
  it('22. classifies crypto-to-crypto swaps as taxable disposals of the swapped asset', () => {
    const res = calculateCryptoTax({
      transactionType: 'SWAP',
      assetName: 'ETH to BTC Swap',
      quantity: 5.0,
      buyPrice: 2000,
      sellPrice: 3500, // FMV at swap
      shortTermTaxRate: 20,
      buyDate: '2025-01-01',
      sellDate: '2025-03-01', // Short term
    });

    expect(res.summary.costBasis).toBe(10000);
    expect(res.summary.grossProceeds).toBe(17500);
    expect(res.summary.realizedGainLoss).toBe(7500);
    expect(res.summary.capitalGainsTax).toBe(1500);
  });

  // 23. Buy acquisition non-taxable event
  it('23. treats fiat purchases as non-taxable acquisitions', () => {
    const res = calculateCryptoTax({
      transactionType: 'BUY',
      quantity: 1.0,
      buyPrice: 50000,
    });

    expect(res.summary.realizedGainLoss).toBe(0);
    expect(res.summary.totalEstimatedTax).toBe(0);
  });

  // 24. Internal wallet transfer non-taxable event
  it('24. treats internal wallet transfers as non-taxable', () => {
    const res = calculateCryptoTax({
      transactionType: 'TRANSFER',
      quantity: 2.0,
      buyPrice: 3000,
    });

    expect(res.summary.realizedGainLoss).toBe(0);
    expect(res.summary.totalEstimatedTax).toBe(0);
  });

  // 25. Multi-lot matching under FIFO
  it('25. matches lots in chronological First-In, First-Out (FIFO) order', () => {
    const lots = [
      { id: 'lot_1', buyDate: '2024-01-01', quantity: 1.0, buyPrice: 20000, buyFee: 0 },
      { id: 'lot_2', buyDate: '2024-06-01', quantity: 2.0, buyPrice: 40000, buyFee: 0 },
      { id: 'lot_3', buyDate: '2024-12-01', quantity: 1.0, buyPrice: 60000, buyFee: 0 },
    ];

    const res = calculateCryptoTax({
      costBasisMethod: 'FIFO',
      lots,
      quantity: 2.0, // Selling 2 units -> 1 unit from lot 1 (@20k) + 1 unit from lot 2 (@40k)
      sellPrice: 70000,
      sellDate: '2025-05-01',
    });

    // Cost basis = 1*20000 + 1*40000 = 60,000
    expect(res.summary.costBasis).toBe(60000);
    expect(res.summary.grossProceeds).toBe(140000); // 2 * 70,000
    expect(res.summary.realizedGainLoss).toBe(80000);
    expect(res.matchedLotsResult.matchedLots.length).toBe(2);
    expect(res.matchedLotsResult.matchedLots[0].lotId).toBe('lot_1');
    expect(res.matchedLotsResult.matchedLots[1].lotId).toBe('lot_2');
  });

  // 26. Multi-lot matching under LIFO
  it('26. matches lots in Last-In, First-Out (LIFO) order', () => {
    const lots = [
      { id: 'lot_1', buyDate: '2024-01-01', quantity: 1.0, buyPrice: 20000, buyFee: 0 },
      { id: 'lot_2', buyDate: '2024-06-01', quantity: 2.0, buyPrice: 40000, buyFee: 0 },
      { id: 'lot_3', buyDate: '2024-12-01', quantity: 1.0, buyPrice: 60000, buyFee: 0 },
    ];

    const res = calculateCryptoTax({
      costBasisMethod: 'LIFO',
      lots,
      quantity: 2.0, // Selling 2 units -> 1 unit from lot 3 (@60k) + 1 unit from lot 2 (@40k)
      sellPrice: 70000,
    });

    // Cost basis = 1*60000 + 1*40000 = 100,000
    expect(res.summary.costBasis).toBe(100000);
    expect(res.summary.grossProceeds).toBe(140000);
    expect(res.summary.realizedGainLoss).toBe(40000);
    expect(res.matchedLotsResult.matchedLots[0].lotId).toBe('lot_3');
  });

  // 27. Multi-lot matching under HIFO
  it('27. matches lots in Highest-In, First-Out (HIFO) order minimizing current gain', () => {
    const lots = [
      { id: 'lot_1', buyDate: '2024-01-01', quantity: 1.0, buyPrice: 20000, buyFee: 0 },
      { id: 'lot_2', buyDate: '2024-06-01', quantity: 1.0, buyPrice: 65000, buyFee: 0 }, // Highest cost
      { id: 'lot_3', buyDate: '2024-12-01', quantity: 1.0, buyPrice: 40000, buyFee: 0 },
    ];

    const res = calculateCryptoTax({
      costBasisMethod: 'HIFO',
      lots,
      quantity: 1.0, // Selling 1 unit -> picks lot_2 (@65k)
      sellPrice: 70000,
    });

    expect(res.summary.costBasis).toBe(65000);
    expect(res.summary.realizedGainLoss).toBe(5000);
    expect(res.matchedLotsResult.matchedLots[0].lotId).toBe('lot_2');
  });

  // 28. United States Jurisdiction (US IRS Model)
  it('28. validates US statutory tax rates and holding thresholds', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'US',
      quantity: 1.0,
      buyPrice: 30000,
      sellPrice: 50000,
      buyDate: '2024-01-01',
      sellDate: '2025-05-01', // Long term
    });

    expect(res.meta.jurisdictionName).toContain('United States');
    expect(res.meta.countryCode).toBe('US');
    expect(res.meta.isLongTerm).toBe(true);
    expect(res.meta.applicableCgtRate).toBe(15.0);
    expect(res.summary.capitalGainsTax).toBe(3000); // 15% of 20000
  });

  // 29. India Jurisdiction (Sec 115BBH 31.2% Flat Tax)
  it('29. enforces India Section 115BBH flat 30% tax + 4% cess (31.2%)', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'IN',
      quantity: 1.0,
      buyPrice: 1000000,
      sellPrice: 2000000,
      buyDate: '2024-01-01',
      sellDate: '2026-01-01', // 2 years holding - still flat 31.2%!
    });

    expect(res.meta.jurisdictionName).toContain('India');
    expect(res.meta.countryCode).toBe('IN');
    expect(res.summary.taxableCapitalGain).toBe(1000000);
    expect(res.summary.capitalGainsTax).toBe(312000); // 31.2%
  });

  // 30. India Jurisdiction Fee Disallowance
  it('30. disallows transaction fee deductions under India Sec 115BBH', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'IN',
      quantity: 1.0,
      buyPrice: 500000,
      sellPrice: 800000,
      buyFee: 5000,
      sellFee: 5000,
    });

    // Indian law does not allow deducting exchange or transfer fees from capital gain
    expect(res.summary.costBasis).toBe(500000); // Fees excluded!
    expect(res.summary.netProceeds).toBe(800000);
    expect(res.summary.realizedGainLoss).toBe(300000);
    expect(res.summary.capitalGainsTax).toBe(93600); // 31.2% of 300,000
  });

  // 31. India Jurisdiction 1% TDS (Section 194S)
  it('31. computes 1% TDS on Indian VDA transfer consideration exceeding ₹50,000', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'IN',
      quantity: 1.0,
      buyPrice: 40000,
      sellPrice: 100000, // Gross consideration = ₹100,000 >= ₹50,000
    });

    expect(res.summary.tdsDeducted).toBe(1000); // 1% of 100,000
  });

  // 32. United Kingdom Jurisdiction (HMRC £3,000 CGT Exemption)
  it('32. applies UK £3,000 Annual Exempt Amount (AEA)', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'UK',
      quantity: 1.0,
      buyPrice: 4000,
      sellPrice: 9000, // Gain = £5,000
      shortTermTaxRate: 20,
    });

    expect(res.meta.jurisdictionName).toContain('United Kingdom');
    expect(res.summary.cgtExemptionApplied).toBe(3000);
    expect(res.summary.taxableCapitalGain).toBe(2000); // £5,000 - £3,000
    expect(res.summary.capitalGainsTax).toBe(400); // 20% of £2,000
  });

  // 33. United Kingdom Jurisdiction Gain under £3,000 threshold
  it('33. computes £0 tax when UK capital gains are within the £3,000 exemption limit', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'UK',
      quantity: 1.0,
      buyPrice: 1000,
      sellPrice: 3500, // Gain = £2,500 <= £3,000
    });

    expect(res.summary.taxableCapitalGain).toBe(0);
    expect(res.summary.capitalGainsTax).toBe(0);
  });

  // 34. Germany Jurisdiction (>1 Year Holding 100% Tax-Free)
  it('34. grants 100% Tax-Free private sales for Germany holdings > 365 days', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'DE',
      quantity: 10,
      buyPrice: 1000,
      sellPrice: 5000, // Gain = €40,000
      buyDate: '2024-01-01',
      sellDate: '2025-02-01', // 397 days > 365 days
    });

    expect(res.meta.jurisdictionName).toContain('Germany');
    expect(res.meta.isTaxFreeLongTerm).toBe(true);
    expect(res.summary.taxableCapitalGain).toBe(0);
    expect(res.summary.capitalGainsTax).toBe(0); // €0 tax!
    expect(res.summary.afterTaxGain).toBe(40000);
  });

  // 35. Germany Jurisdiction (Short-Term <= €1,000 Exemption Limit)
  it('35. applies Germany €1,000 Freigrenze exemption for short-term sales', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'DE',
      quantity: 1.0,
      buyPrice: 1000,
      sellPrice: 1800, // Gain = €800 <= €1,000 exemption
      buyDate: '2025-01-01',
      sellDate: '2025-03-01', // Short term
    });

    expect(res.summary.cgtExemptionApplied).toBe(800);
    expect(res.summary.taxableCapitalGain).toBe(0);
    expect(res.summary.capitalGainsTax).toBe(0);
  });

  // 36. Australia Jurisdiction (50% CGT Discount on >= 12 Months)
  it('36. applies Australia 50% CGT discount for assets held 12+ months', () => {
    const res = calculateCryptoTax({
      jurisdiction: 'AU',
      quantity: 1.0,
      buyPrice: 10000,
      sellPrice: 30000, // Gain = $20,000
      buyDate: '2024-01-01',
      sellDate: '2025-03-01', // 425 days
      shortTermTaxRate: 32.5,
    });

    expect(res.meta.jurisdictionName).toContain('Australia');
    expect(res.meta.isLongTerm).toBe(true);
    expect(res.summary.cgtDiscountApplied).toBe(10000); // 50% discount = $10,000
    expect(res.summary.taxableCapitalGain).toBe(10000);
    expect(res.summary.capitalGainsTax).toBe(3250); // 32.5% on $10,000
  });

  // 37. Effective tax rate % calculation
  it('37. accurately computes effective tax rate % as tax divided by gross gain/income', () => {
    const res = calculateCryptoTax({
      quantity: 1.0,
      buyPrice: 20000,
      sellPrice: 40000,
      shortTermTaxRate: 25,
      buyDate: '2025-01-01',
      sellDate: '2025-03-01', // Short term
    });

    expect(res.summary.effectiveTaxRatePct).toBe(25);
  });

  // 38. Multi-currency outputs
  it('38. supports multiple fiat currency quote denominations', () => {
    const resEur = calculateCryptoTax({ currency: 'EUR' });
    expect(resEur.meta.currencyCode).toBe('EUR');
    expect(resEur.meta.currencySymbol).toBe('€');

    const resGbp = calculateCryptoTax({ currency: 'GBP' });
    expect(resGbp.meta.currencyCode).toBe('GBP');
    expect(resGbp.meta.currencySymbol).toBe('£');

    const resInr = calculateCryptoTax({ currency: 'INR' });
    expect(resInr.meta.currencyCode).toBe('INR');
    expect(resInr.meta.currencySymbol).toBe('₹');
  });

  // 39. Config presets integrity
  it('39. verifies config presets data integrity and execution', () => {
    expect(CRYPTO_TAX_CONFIG.id).toBe('crypto-tax-calculator');
    expect(Array.isArray(CRYPTO_TAX_CONFIG.presets)).toBe(true);
    expect(CRYPTO_TAX_CONFIG.presets.length).toBeGreaterThanOrEqual(6);

    CRYPTO_TAX_CONFIG.presets.forEach((p) => {
      const sim = calculateCryptoTax(p);
      expect(isFinite(sim.summary.totalEstimatedTax)).toBe(true);
      expect(isFinite(sim.summary.afterTaxGain)).toBe(true);
    });
  });

  // 40. Unsupported/Invalid jurisdiction fallback
  it('40. safely falls back to GENERIC for unknown jurisdiction IDs', () => {
    const res = calculateCryptoTax({ jurisdiction: 'INVALID_COUNTRY' });
    expect(res.inputs.jurisdiction).toBe('GENERIC');
    expect(res.meta.jurisdictionName).toContain('Generic');
  });

  // 41. Invalid dates fallback
  it('41. safely handles missing or invalid dates returning 0 holding days', () => {
    const res = calculateCryptoTax({
      buyDate: 'invalid-date',
      sellDate: null,
    });

    expect(res.meta.holdingDays).toBe(0);
    expect(res.meta.isLongTerm).toBe(false);
  });

  // 42. Multi-lot empty array fallback
  it('42. handles empty or invalid lots array falling back to single-lot mode', () => {
    const res = calculateCryptoTax({
      costBasisMethod: 'FIFO',
      lots: [],
      quantity: 1.0,
      buyPrice: 50000,
      sellPrice: 60000,
    });

    expect(res.summary.costBasis).toBe(50000);
    expect(res.summary.realizedGainLoss).toBe(10000);
  });

  // 43. Multi-lot partial lot depletion
  it('43. tracks remaining unsold units in multi-lot depletion', () => {
    const lots = [
      { id: 'lot_1', buyDate: '2024-01-01', quantity: 5.0, buyPrice: 1000, buyFee: 10 },
    ];

    const res = matchLots({
      lots,
      sellQty: 2.0,
      sellPrice: 2000,
      method: 'FIFO',
    });

    expect(res.matchedLots.length).toBe(1);
    expect(res.matchedLots[0].quantityUsed).toBe(2.0);
    expect(res.remainingLots.length).toBe(1);
    expect(res.remainingLots[0].quantity).toBe(3.0);
  });

  // 44. Transaction type registry completeness
  it('44. validates transaction type registry metadata', () => {
    expect(CRYPTO_TRANSACTION_TYPES.SELL.isTaxableDisposal).toBe(true);
    expect(CRYPTO_TRANSACTION_TYPES.BUY.isTaxableDisposal).toBe(false);
    expect(CRYPTO_TRANSACTION_TYPES.STAKING_REWARD.generatesIncomeTax).toBe(true);
    expect(CRYPTO_TRANSACTION_TYPES.TRANSFER.isTaxableDisposal).toBe(false);
  });

  // 45. Cost basis methods registry completeness
  it('45. validates cost basis method registry', () => {
    expect(COST_BASIS_METHODS.FIFO.id).toBe('FIFO');
    expect(COST_BASIS_METHODS.LIFO.id).toBe('LIFO');
    expect(COST_BASIS_METHODS.HIFO.id).toBe('HIFO');
    expect(COST_BASIS_METHODS.SPECIFIC_ID.id).toBe('SPECIFIC_ID');
  });
});
