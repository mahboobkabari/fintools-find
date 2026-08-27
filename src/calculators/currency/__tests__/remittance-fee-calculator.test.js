import { describe, it, expect } from 'vitest';
import {
  calculateRemittanceFee,
  calculateRemittanceFeeCalculator,
  calculateMoneyTransferFee,
  calculateCrossBorderTransfer,
  FEE_PAYMENT_MODES,
} from '../remittance-fee-calculator.js';
import { REMITTANCE_FEE_CONFIG } from '../../configs/remittance-fee-calculator.config.js';
import { REFERENCE_EXCHANGE_RATES } from '../currency-converter.js';

describe('Remittance Fee Calculator Engine (Sprint 81 / Flagship #88)', () => {
  // 1. Basic Mid-market Remittance (Zero Fee, Zero Spread)
  it('calculates mid-market transfer with 0 fee and 0 spread accurately (USD -> INR)', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 0,
      percentageFee: 0,
      fxSpreadPct: 0,
    });

    expect(res.sendAmount).toBe(1000);
    expect(res.midMarketRate).toBe(87.5);
    expect(res.customerRate).toBe(87.5);
    expect(res.netRecipientAmount).toBe(87500);
    expect(res.totalSenderFee).toBe(0);
    expect(res.fxLossInSenderCurrency).toBe(0);
    expect(res.totalCostInSenderCurrency).toBe(0);
    expect(res.effectiveFeePct).toBe(0);
    expect(res.effectiveNetFxRate).toBe(87.5);
  });

  // 2. Same-currency transfer
  it('handles same-currency transfers correctly with 1:1 base rate', () => {
    const res = calculateRemittanceFee({
      sendAmount: 500,
      fromCurrency: 'USD',
      toCurrency: 'USD',
      fixedFee: 10,
      fxSpreadPct: 2,
    });

    expect(res.midMarketRate).toBe(1);
    expect(res.customerRate).toBe(1);
    expect(res.netRecipientAmount).toBe(500);
    expect(res.totalSenderFee).toBe(10);
    expect(res.totalCostInSenderCurrency).toBe(10);
    expect(res.effectiveFeePct).toBe(2);
  });

  // 3. Cross-currency transfer (EUR -> USD)
  it('correctly calculates cross-rate conversion (EUR -> USD)', () => {
    const eurToUsdMid = REFERENCE_EXCHANGE_RATES.USD.rateToUsd / REFERENCE_EXCHANGE_RATES.EUR.rateToUsd; // 1 / 0.92 = 1.086957
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      fixedFee: 0,
      fxSpreadPct: 0,
    });

    expect(res.midMarketRate).toBeCloseTo(eurToUsdMid, 4);
    expect(res.netRecipientAmount).toBeCloseTo(1000 * eurToUsdMid, 1);
  });

  // 4. Explicit Fixed Transfer Fee
  it('adds fixed fee properly under ADD_ON_TOP mode', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 15,
      fxSpreadPct: 0,
      feeMode: 'ADD_ON_TOP',
    });

    expect(res.fixedFee).toBe(15);
    expect(res.totalSenderFee).toBe(15);
    expect(res.totalSenderOutflow).toBe(1015);
    expect(res.netRecipientAmount).toBe(87500);
    expect(res.totalCostInSenderCurrency).toBe(15);
    expect(res.effectiveFeePct).toBe(1.5);
  });

  // 5. Explicit Variable Percentage Fee
  it('computes variable percentage fee on send amount', () => {
    const res = calculateRemittanceFee({
      sendAmount: 2000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      percentageFee: 1.5,
      fxSpreadPct: 0,
    });

    expect(res.percentageFee).toBe(1.5);
    expect(res.totalSenderFee).toBe(30);
    expect(res.totalSenderOutflow).toBe(2030);
    expect(res.effectiveFeePct).toBe(1.5);
  });

  // 6. FX Markup / Spread only
  it('accurately quantifies hidden FX spread cost when upfront fee is zero', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 0,
      percentageFee: 0,
      fxSpreadPct: 1.0, // 1% spread on 87.5 = 86.625
    });

    expect(res.customerRate).toBe(86.625);
    expect(res.idealGrossReceived).toBe(87500);
    expect(res.actualGrossReceived).toBe(86625);
    expect(res.fxLossInRecipientCurrency).toBe(875);
    expect(res.fxLossInSenderCurrency).toBe(10); // $10 loss on $1000 = 1%
    expect(res.totalCostInSenderCurrency).toBe(10);
    expect(res.effectiveFeePct).toBe(1.0);
    expect(res.effectiveNetFxRate).toBe(86.625);
  });

  // 7. Combined upfront fee + FX spread
  it('combines upfront fee and FX spread without double counting', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 5,
      fxSpreadPct: 1.5,
    });

    // Upfront fee = $5
    // FX spread: mid=87.5, customer=87.5*(1-0.015) = 86.1875
    // actual received = 86,187.50, ideal = 87,500
    // fxLoss in INR = 1,312.50 -> in USD = 1,312.50 / 87.5 = $15
    // Total cost = $5 + $15 = $20
    expect(res.totalSenderFee).toBe(5);
    expect(res.fxLossInSenderCurrency).toBe(15);
    expect(res.totalCostInSenderCurrency).toBe(20);
    expect(res.effectiveFeePct).toBe(2.0);
    expect(res.totalSenderOutflow).toBe(1005);
  });

  // 8. Recipient-side bank fee
  it('deducts recipient fee from beneficiary payout and reflects in total sender cost', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 0,
      fxSpreadPct: 0,
      recipientFee: 875, // ₹875 fee in INR (~$10)
    });

    expect(res.recipientFee).toBe(875);
    expect(res.actualGrossReceived).toBe(87500);
    expect(res.netRecipientAmount).toBe(86625);
    expect(res.recipientFeesInSenderCurrency).toBe(10);
    expect(res.totalCostInSenderCurrency).toBe(10);
    expect(res.effectiveFeePct).toBe(1.0);
  });

  // 9. Intermediary / correspondent bank fee
  it('deducts intermediary fee and reports in total recipient deductions', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 0,
      fxSpreadPct: 0,
      intermediaryFee: 437.5, // ₹437.5 in INR (~$5)
    });

    expect(res.intermediaryFee).toBe(437.5);
    expect(res.totalRecipientSideDeductions).toBe(437.5);
    expect(res.netRecipientAmount).toBe(87062.5);
    expect(res.recipientFeesInSenderCurrency).toBe(5);
    expect(res.totalCostInSenderCurrency).toBe(5);
  });

  // 10. Both recipient and intermediary fees combined
  it('correctly aggregates recipient and intermediary deductions', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 10,
      fxSpreadPct: 1.0,
      recipientFee: 500,
      intermediaryFee: 375,
    });

    expect(res.totalRecipientSideDeductions).toBe(875);
    expect(res.recipientFeesInSenderCurrency).toBe(10);
    expect(res.totalSenderFee).toBe(10);
    expect(res.fxLossInSenderCurrency).toBe(10);
    expect(res.totalCostInSenderCurrency).toBe(30); // 10 + 10 + 10 = 30
    expect(res.effectiveFeePct).toBe(3.0);
  });

  // 11. Deduct fee from send amount mode
  it('handles DEDUCT_FROM_SEND mode by reducing net converted principal', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 50,
      fxSpreadPct: 0,
      feeMode: 'DEDUCT_FROM_SEND',
    });

    // Net send principal = $1,000 - $50 = $950
    // Gross received in INR = $950 * 87.5 = ₹83,125
    expect(res.feeMode).toBe('DEDUCT_FROM_SEND');
    expect(res.totalSenderOutflow).toBe(1000);
    expect(res.netRecipientAmount).toBe(83125);
    expect(res.totalSenderFee).toBe(50);
  });

  // 12. Custom user-overridden exchange rate
  it('accepts and prioritizes custom exchange rate override', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      customRate: 85.0,
    });

    expect(res.customerRate).toBe(85.0);
    expect(res.actualGrossReceived).toBe(85000);
    expect(res.netRecipientAmount).toBe(85000);
  });

  // 13. Small transfer amounts ($10)
  it('handles micro remittance amounts ($10) without division errors', () => {
    const res = calculateRemittanceFee({
      sendAmount: 10,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 2,
      fxSpreadPct: 1.0,
    });

    expect(res.sendAmount).toBe(10);
    expect(res.totalSenderFee).toBe(2);
    expect(res.netRecipientAmount).toBeGreaterThan(0);
    expect(res.effectiveFeePct).toBeGreaterThan(20);
  });

  // 14. Large commercial remittance amounts ($1,000,000)
  it('handles large multi-million transfers accurately with precision', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 25,
      fxSpreadPct: 0.5,
    });

    expect(res.sendAmount).toBe(1000000);
    expect(res.actualGrossReceived).toBe(87062500); // 1M * (87.5 * 0.995)
    expect(res.totalCostInSenderCurrency).toBe(5025);
    expect(res.effectiveFeePct).toBe(0.5);
  });

  // 15. Zero send amount
  it('safely handles zero send amount', () => {
    const res = calculateRemittanceFee({
      sendAmount: 0,
      fromCurrency: 'USD',
      toCurrency: 'INR',
    });

    expect(res.sendAmount).toBe(0);
    expect(res.netRecipientAmount).toBe(0);
    expect(res.totalCostInSenderCurrency).toBe(0);
    expect(res.effectiveFeePct).toBe(0);
  });

  // 16. Negative send amount sanitization
  it('sanitizes negative send amount to 0', () => {
    const res = calculateRemittanceFee({
      sendAmount: -500,
      fromCurrency: 'USD',
      toCurrency: 'INR',
    });

    expect(res.sendAmount).toBe(0);
    expect(res.netRecipientAmount).toBe(0);
  });

  // 17. Negative fee sanitization
  it('sanitizes negative fees and spreads to 0', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: -20,
      percentageFee: -5,
      fxSpreadPct: -2,
      recipientFee: -100,
      intermediaryFee: -50,
    });

    expect(res.fixedFee).toBe(0);
    expect(res.percentageFee).toBe(0);
    expect(res.fxSpreadPct).toBe(0);
    expect(res.recipientFee).toBe(0);
    expect(res.intermediaryFee).toBe(0);
    expect(res.totalCostInSenderCurrency).toBe(0);
  });

  // 18. Invalid currency codes fallback
  it('gracefully falls back to USD/INR when invalid currency codes are provided', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'XYZ_INVALID',
      toCurrency: 'ABC_INVALID',
    });

    expect(res.fromCurrency).toBe('XYZ_INVALID');
    expect(res.fromMeta.code).toBe('USD');
    expect(res.toMeta.code).toBe('INR');
  });

  // 19. Excessive fee in DEDUCT_FROM_SEND mode (fee > sendAmount)
  it('caps net send and net recipient amount at 0 if fee exceeds sendAmount in deduct mode', () => {
    const res = calculateRemittanceFee({
      sendAmount: 100,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 150,
      feeMode: 'DEDUCT_FROM_SEND',
    });

    expect(res.netRecipientAmount).toBe(0);
    expect(res.totalSenderOutflow).toBe(100);
  });

  // 20. Excessive recipient deductions (deductions > gross received)
  it('caps net recipient amount at 0 if recipient fees exceed gross converted payout', () => {
    const res = calculateRemittanceFee({
      sendAmount: 10,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      recipientFee: 5000, // ₹5,000 fee on ₹875 payout
    });

    expect(res.netRecipientAmount).toBe(0);
  });

  // 21. GBP to INR remittance corridor
  it('models GBP to INR corridor accurately', () => {
    const gbpMid = REFERENCE_EXCHANGE_RATES.INR.rateToUsd / REFERENCE_EXCHANGE_RATES.GBP.rateToUsd; // 87.5 / 0.785 = 111.464968
    const res = calculateRemittanceFee({
      sendAmount: 500,
      fromCurrency: 'GBP',
      toCurrency: 'INR',
      fixedFee: 2,
      fxSpreadPct: 0.8,
    });

    expect(res.fromCurrency).toBe('GBP');
    expect(res.toCurrency).toBe('INR');
    expect(res.midMarketRate).toBeCloseTo(gbpMid, 4);
    expect(res.totalSenderFee).toBe(2);
  });

  // 22. AED to INR remittance corridor
  it('models UAE AED to INR remittance corridor accurately', () => {
    const aedMid = REFERENCE_EXCHANGE_RATES.INR.rateToUsd / REFERENCE_EXCHANGE_RATES.AED.rateToUsd; // 87.5 / 3.6725 = 23.825732
    const res = calculateRemittanceFee({
      sendAmount: 2000,
      fromCurrency: 'AED',
      toCurrency: 'INR',
      fixedFee: 15,
      fxSpreadPct: 0.75,
    });

    expect(res.midMarketRate).toBeCloseTo(aedMid, 4);
    expect(res.totalSenderFee).toBe(15);
    expect(res.netRecipientAmount).toBeGreaterThan(45000);
  });

  // 23. CAD to INR remittance corridor
  it('models CAD to INR remittance corridor accurately', () => {
    const cadMid = REFERENCE_EXCHANGE_RATES.INR.rateToUsd / REFERENCE_EXCHANGE_RATES.CAD.rateToUsd; // 87.5 / 1.375 = 63.636364
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'CAD',
      toCurrency: 'INR',
      fixedFee: 4,
      fxSpreadPct: 1.0,
    });

    expect(res.midMarketRate).toBeCloseTo(cadMid, 4);
  });

  // 24. AUD to INR remittance corridor
  it('models AUD to INR remittance corridor accurately', () => {
    const audMid = REFERENCE_EXCHANGE_RATES.INR.rateToUsd / REFERENCE_EXCHANGE_RATES.AUD.rateToUsd; // 87.5 / 1.525 = 57.377049
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'AUD',
      toCurrency: 'INR',
      fxSpreadPct: 0.5,
    });

    expect(res.midMarketRate).toBeCloseTo(audMid, 4);
  });

  // 25. SGD to INR remittance corridor
  it('models SGD to INR remittance corridor accurately', () => {
    const sgdMid = REFERENCE_EXCHANGE_RATES.INR.rateToUsd / REFERENCE_EXCHANGE_RATES.SGD.rateToUsd; // 87.5 / 1.345 = 65.055762
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'SGD',
      toCurrency: 'INR',
      fxSpreadPct: 0.6,
    });

    expect(res.midMarketRate).toBeCloseTo(sgdMid, 4);
  });

  // 26. JPY with 0 decimal places formatting check
  it('respects JPY 0 decimal places in metadata', () => {
    const res = calculateRemittanceFee({
      sendAmount: 100,
      fromCurrency: 'USD',
      toCurrency: 'JPY',
      fxSpreadPct: 0,
    });

    expect(res.toDecimals).toBe(0);
    expect(res.toSymbol).toBe('¥');
  });

  // 27. KWD with 3 decimal places formatting check
  it('respects KWD 3 decimal places in metadata', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'KWD',
      fxSpreadPct: 0,
    });

    expect(res.toDecimals).toBe(3);
    expect(res.toSymbol).toBe('KD');
  });

  // 28. Share percentage breakdown integrity (Upfront + Spread + Recipient = 100%)
  it('ensures fee share percentages sum to 100% when total cost > 0', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 10,
      fxSpreadPct: 1.0,
      recipientFee: 875, // $10 in USD
    });

    // Total cost = $10 + $10 + $10 = $30
    // Shares: 33.3%, 33.3%, 33.3%
    const sumShares = res.upfrontFeeSharePct + res.fxSpreadSharePct + res.recipientFeeSharePct;
    expect(sumShares).toBeCloseTo(100, 0);
  });

  // 29. Effective Net FX Rate calculation
  it('computes effective net FX rate as netRecipient / sendAmount', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 10,
      fxSpreadPct: 1.5,
    });

    expect(res.effectiveNetFxRate).toBe(Number((res.netRecipientAmount / 1000).toFixed(6)));
  });

  // 30. High fee corridor critical recommendation
  it('generates high fee recommendation when effective fee > 4%', () => {
    const res = calculateRemittanceFee({
      sendAmount: 100,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 5,
      fxSpreadPct: 2.0,
    });

    expect(res.effectiveFeePct).toBe(7.0);
    const criticalRec = res.recommendations.find(r => r.type === 'critical');
    expect(criticalRec).toBeDefined();
    expect(criticalRec?.title).toContain('High Remittance Fee Corridor');
  });

  // 31. Hidden FX spread dominates recommendation
  it('generates warning recommendation when FX loss exceeds upfront fee', () => {
    const res = calculateRemittanceFee({
      sendAmount: 2000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 0,
      fxSpreadPct: 1.5, // $30 FX loss vs $0 upfront fee
    });

    const hiddenWarn = res.recommendations.find(r => r.title.includes('Hidden FX Markup'));
    expect(hiddenWarn).toBeDefined();
  });

  // 32. Zero friction / low cost recommendation
  it('generates positive recommendation when effective fee < 0.5%', () => {
    const res = calculateRemittanceFee({
      sendAmount: 5000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 0,
      fxSpreadPct: 0.2, // 0.2% effective fee
    });

    const posRec = res.recommendations.find(r => r.type === 'positive');
    expect(posRec).toBeDefined();
  });

  // 33. Beneficiary deduction recommendation
  it('generates warning when recipient/intermediary deductions are present', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      recipientFee: 15,
    });

    const recWarn = res.recommendations.find(r => r.title.includes('Beneficiary Receiving'));
    expect(recWarn).toBeDefined();
  });

  // 34. Dynamic Hero Text formulation
  it('generates dynamic hero verdict text', () => {
    const res = calculateRemittanceFee({
      sendAmount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fixedFee: 10,
      fxSpreadPct: 1.0,
    });

    expect(res.heroText).toContain('Recipient receives');
    expect(res.heroText).toContain('Total transfer cost is $20');
  });

  // 35. Config Presets Validation: us_india_fintech
  it('validates preset: US to India Fintech ACH', () => {
    const p = REMITTANCE_FEE_CONFIG.presets.find(x => x.id === 'us_india_fintech');
    expect(p).toBeDefined();
    const res = calculateRemittanceFee(p);
    expect(res.fromCurrency).toBe('USD');
    expect(res.toCurrency).toBe('INR');
    expect(res.totalSenderFee).toBe(0);
    expect(res.effectiveFeePct).toBe(0.9);
  });

  // 36. Config Presets Validation: uae_india_exchange
  it('validates preset: UAE to India Exchange House', () => {
    const p = REMITTANCE_FEE_CONFIG.presets.find(x => x.id === 'uae_india_exchange');
    expect(p).toBeDefined();
    const res = calculateRemittanceFee(p);
    expect(res.fromCurrency).toBe('AED');
    expect(res.toCurrency).toBe('INR');
    expect(res.fixedFee).toBe(15);
  });

  // 37. Config Presets Validation: uk_india_bank
  it('validates preset: UK to India Bank Transfer', () => {
    const p = REMITTANCE_FEE_CONFIG.presets.find(x => x.id === 'uk_india_bank');
    expect(p).toBeDefined();
    const res = calculateRemittanceFee(p);
    expect(res.fromCurrency).toBe('GBP');
    expect(res.toCurrency).toBe('INR');
    expect(res.fixedFee).toBe(2.5);
  });

  // 38. Config Presets Validation: swift_wire_high_cost
  it('validates preset: International SWIFT Wire Traditional Bank', () => {
    const p = REMITTANCE_FEE_CONFIG.presets.find(x => x.id === 'swift_wire_high_cost');
    expect(p).toBeDefined();
    const res = calculateRemittanceFee(p);
    expect(res.fixedFee).toBe(35);
    expect(res.fxSpreadPct).toBe(2.5);
    expect(res.totalRecipientSideDeductions).toBe(25); // 10 + 15
    expect(res.totalCostInSenderCurrency).toBeGreaterThan(150);
  });

  // 39. Config Presets Validation: canada_india_transfer
  it('validates preset: Canada to India Interac Online', () => {
    const p = REMITTANCE_FEE_CONFIG.presets.find(x => x.id === 'canada_india_transfer');
    expect(p).toBeDefined();
    const res = calculateRemittanceFee(p);
    expect(res.fromCurrency).toBe('CAD');
    expect(res.toCurrency).toBe('INR');
  });

  // 40. Config Presets Validation: europe_us_transfer
  it('validates preset: Eurozone to US SEPA', () => {
    const p = REMITTANCE_FEE_CONFIG.presets.find(x => x.id === 'europe_us_transfer');
    expect(p).toBeDefined();
    const res = calculateRemittanceFee(p);
    expect(res.fromCurrency).toBe('EUR');
    expect(res.toCurrency).toBe('USD');
  });

  // 41. FEE_PAYMENT_MODES constants validation
  it('exposes FEE_PAYMENT_MODES definitions', () => {
    expect(FEE_PAYMENT_MODES.ADD_ON_TOP).toBeDefined();
    expect(FEE_PAYMENT_MODES.DEDUCT_FROM_SEND).toBeDefined();
    expect(FEE_PAYMENT_MODES.ADD_ON_TOP.id).toBe('ADD_ON_TOP');
  });

  // 42. Alias: calculateRemittanceFeeCalculator
  it('exports alias calculateRemittanceFeeCalculator correctly', () => {
    const res = calculateRemittanceFeeCalculator({ sendAmount: 1000 });
    expect(res.sendAmount).toBe(1000);
  });

  // 43. Alias: calculateMoneyTransferFee
  it('exports alias calculateMoneyTransferFee correctly', () => {
    const res = calculateMoneyTransferFee({ sendAmount: 2000 });
    expect(res.sendAmount).toBe(2000);
  });

  // 44. Alias: calculateCrossBorderTransfer
  it('exports alias calculateCrossBorderTransfer correctly', () => {
    const res = calculateCrossBorderTransfer({ sendAmount: 3000 });
    expect(res.sendAmount).toBe(3000);
  });

  // 45. Metadata transparency timestamp validation
  it('provides reference rate metadata with baseline date and source', () => {
    const res = calculateRemittanceFee();
    expect(res.metadata).toBeDefined();
    expect(res.metadata.baselineDate).toBe('2026-08-27');
    expect(res.metadata.rateType).toContain('Mid-Market Reference Rate');
  });
});
