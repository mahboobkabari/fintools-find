import { describe, it, expect } from 'vitest';
import {
  calculateCryptoProfitLoss,
  calculateCryptoPl,
  calculateCryptoGains,
  calculateCryptoReturn,
  CRYPTO_POSITION_MODES,
  FIAT_CURRENCIES,
} from '../crypto-profit-loss-calculator.js';
import { CRYPTO_PROFIT_LOSS_CONFIG } from '../../configs/crypto-profit-loss-calculator.config.js';

describe('Crypto Profit/Loss Calculator Engine (Sprint 82 / Flagship #89)', () => {
  // 1. Profitable Trade with Zero Fees
  it('calculates zero-fee profitable trade accurately', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 1.0,
      buyPrice: 50000,
      sellPrice: 65000,
      buyFeePct: 0,
      sellFeePct: 0,
      buyGasFee: 0,
      sellGasFee: 0,
    });

    expect(res.quantity).toBe(1.0);
    expect(res.grossCostBasis).toBe(50000);
    expect(res.totalCostBasis).toBe(50000);
    expect(res.grossProceeds).toBe(65000);
    expect(res.netProceeds).toBe(65000);
    expect(res.netProfitLoss).toBe(15000);
    expect(res.roiPct).toBe(30.0);
    expect(res.status).toBe('PROFIT');
    expect(res.breakEvenPrice).toBe(50000);
  });

  // 2. Losing Trade with Zero Fees
  it('calculates zero-fee losing trade accurately', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 2.0,
      buyPrice: 3000,
      sellPrice: 2000,
      buyFeePct: 0,
      sellFeePct: 0,
    });

    expect(res.totalCostBasis).toBe(6000);
    expect(res.netProceeds).toBe(4000);
    expect(res.netProfitLoss).toBe(-2000);
    expect(res.roiPct).toBe(-33.33);
    expect(res.status).toBe('LOSS');
  });

  // 3. Exact Break-Even Trade
  it('identifies exact break-even trade', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 10,
      buyPrice: 100,
      sellPrice: 100,
      buyFeePct: 0,
      sellFeePct: 0,
    });

    expect(res.netProfitLoss).toBe(0);
    expect(res.roiPct).toBe(0);
    expect(res.status).toBe('BREAK_EVEN');
  });

  // 4. Exchange Buy & Sell Percentage Trading Fees
  it('properly calculates percentage trading fees on entry and exit', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 1.0,
      buyPrice: 10000,
      sellPrice: 20000,
      buyFeePct: 0.1, // $10 fee on $10k
      sellFeePct: 0.1, // $20 fee on $20k
    });

    expect(res.buyTradingFee).toBe(10);
    expect(res.totalCostBasis).toBe(10010);
    expect(res.sellTradingFee).toBe(20);
    expect(res.netProceeds).toBe(19980);
    expect(res.netProfitLoss).toBe(9970);
    expect(res.totalFeesPaid).toBe(30);
  });

  // 5. Fixed Fiat Fees (Card / Wire Surcharges)
  it('incorporates fixed fiat purchase and exit surcharges', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 1.0,
      buyPrice: 5000,
      sellPrice: 8000,
      buyFixedFee: 25,
      sellFixedFee: 15,
      buyFeePct: 0,
      sellFeePct: 0,
    });

    expect(res.totalBuyFees).toBe(25);
    expect(res.totalCostBasis).toBe(5025);
    expect(res.totalSellFees).toBe(15);
    expect(res.netProceeds).toBe(7985);
    expect(res.netProfitLoss).toBe(2960);
  });

  // 6. Blockchain On-Chain Network Gas Fees
  it('incorporates network gas fees into cost basis and exit proceeds', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 2.0,
      buyPrice: 2000,
      sellPrice: 3000,
      buyGasFee: 30,
      sellGasFee: 40,
      buyFeePct: 0,
      sellFeePct: 0,
    });

    expect(res.totalCostBasis).toBe(4030); // $4,000 + $30 gas
    expect(res.netProceeds).toBe(5960); // $6,000 - $40 gas
    expect(res.netProfitLoss).toBe(1930);
    expect(res.totalGasFeesPaid).toBe(70);
  });

  // 7. Combined All Fee Types (Pct + Fixed + Gas)
  it('combines all fee types without double-counting', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 0.5,
      buyPrice: 60000, // Gross cost: $30,000
      sellPrice: 80000, // Gross proceeds: $40,000
      buyFeePct: 0.2, // $60
      buyFixedFee: 10,
      buyGasFee: 15, // Total buy fees: $85 -> Cost basis: $30,085
      sellFeePct: 0.2, // $80
      sellFixedFee: 10,
      sellGasFee: 20, // Total sell fees: $110 -> Net proceeds: $39,890
    });

    expect(res.totalCostBasis).toBe(30085);
    expect(res.netProceeds).toBe(39890);
    expect(res.netProfitLoss).toBe(9805);
    expect(res.totalFeesPaid).toBe(195);
  });

  // 8. Analytical Break-Even Exit Price Solver
  it('calculates analytical break-even exit price accurately', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 1.0,
      buyPrice: 50000,
      buyFeePct: 0.2, // $100 -> Cost basis: $50,100
      sellFeePct: 0.2,
      sellGasFee: 20,
    });

    // P_be = (50100 + 20) / (1.0 * (1 - 0.002)) = 50120 / 0.998 = 50220.4409
    expect(res.breakEvenPrice).toBeCloseTo(50220.44, 1);

    // Verify that selling at break-even price results in ~0 net profit/loss
    const simExit = calculateCryptoProfitLoss({
      quantity: 1.0,
      buyPrice: 50000,
      sellPrice: res.breakEvenPrice,
      buyFeePct: 0.2,
      sellFeePct: 0.2,
      sellGasFee: 20,
    });
    expect(simExit.netProfitLoss).toBeCloseTo(0, 0);
  });

  // 9. Decimal Crypto Quantities (e.g. 0.0025 BTC)
  it('handles micro decimal crypto quantities with high precision', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 0.0025,
      buyPrice: 60000, // Gross: $150
      sellPrice: 90000, // Gross: $225
      buyFeePct: 0.1,
      sellFeePct: 0.1,
    });

    expect(res.grossCostBasis).toBe(150);
    expect(res.grossProceeds).toBe(225);
    expect(res.netProfitLoss).toBeCloseTo(74.62, 1);
    expect(res.roiPct).toBeCloseTo(49.7, 0);
  });

  // 10. Decimal Unit Prices (e.g. $0.00045 altcoin)
  it('handles fractional micro-cent altcoin unit prices', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 1000000,
      buyPrice: 0.0005, // $500
      sellPrice: 0.0008, // $800
      buyFeePct: 0.1,
      sellFeePct: 0.1,
    });

    expect(res.grossCostBasis).toBe(500);
    expect(res.grossProceeds).toBe(800);
    expect(res.netProfitLoss).toBeCloseTo(298.7, 1);
  });

  // 11. Large Position ($10 Million Institutional Trade)
  it('handles large multi-million portfolio sizes without floating overflow', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 200,
      buyPrice: 50000, // $10,000,000
      sellPrice: 60000, // $12,000,000
      buyFeePct: 0.05,
      sellFeePct: 0.05,
    });

    expect(res.grossCostBasis).toBe(10000000);
    expect(res.grossProceeds).toBe(12000000);
    expect(res.netProfitLoss).toBe(1989000);
  });

  // 12. Multi-Lot Weighted Average Cost Basis Support
  it('correctly computes weighted average cost basis across multiple lots', () => {
    const lots = [
      { quantity: 1.0, buyPrice: 40000, fee: 40 }, // $40,040
      { quantity: 2.0, buyPrice: 50000, fee: 100 }, // $100,100
      { quantity: 1.0, buyPrice: 60000, fee: 60 }, // $60,060
    ];

    const res = calculateCryptoProfitLoss({
      lots,
      sellPrice: 70000, // 4.0 BTC @ $70k = $280,000
      sellFeePct: 0.1,
    });

    expect(res.isMultiLot).toBe(true);
    expect(res.quantity).toBe(4.0);
    expect(res.grossCostBasis).toBe(200000); // 40k + 100k + 60k
    expect(res.totalBuyFees).toBe(200);
    expect(res.totalCostBasis).toBe(200200);
    expect(res.cleanBuyPrice ?? res.buyPrice).toBe(50000); // Weighted average: 200k / 4 = 50k
    expect(res.netProceeds).toBe(279720); // $280,000 - 0.1% ($280)
    expect(res.netProfitLoss).toBe(79520);
  });

  // 13. Unrealized vs Realized Mode Tagging
  it('correctly sets position mode and reflects in hero verdict', () => {
    const unrealized = calculateCryptoProfitLoss({
      quantity: 1,
      buyPrice: 50000,
      sellPrice: 60000,
      positionMode: 'UNREALIZED',
    });
    expect(unrealized.positionMode).toBe('UNREALIZED');
    expect(unrealized.heroVerdict).toContain('Unrealized Gain');

    const realized = calculateCryptoProfitLoss({
      quantity: 1,
      buyPrice: 50000,
      sellPrice: 60000,
      positionMode: 'REALIZED',
    });
    expect(realized.positionMode).toBe('REALIZED');
    expect(realized.heroVerdict).toContain('Realized Profit');
  });

  // 14. Realized Loss Hero Verdict
  it('formats realized loss properly in hero verdict', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 1,
      buyPrice: 50000,
      sellPrice: 40000,
      positionMode: 'REALIZED',
    });
    expect(res.status).toBe('LOSS');
    expect(res.heroVerdict).toContain('Realized Loss');
  });

  // 15. Zero Quantity Input
  it('safely handles zero quantity input without division errors', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 0,
      buyPrice: 50000,
      sellPrice: 60000,
    });

    expect(res.quantity).toBe(0);
    expect(res.totalCostBasis).toBe(0);
    expect(res.netProceeds).toBe(0);
    expect(res.netProfitLoss).toBe(0);
    expect(res.roiPct).toBe(0);
  });

  // 16. Zero Buy Price
  it('safely handles zero buy price (e.g. airdrop / mining yield)', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 10,
      buyPrice: 0,
      sellPrice: 50,
      buyGasFee: 5,
    });

    expect(res.grossCostBasis).toBe(0);
    expect(res.totalCostBasis).toBe(5);
    expect(res.netProceeds).toBeCloseTo(499.5, 0);
    expect(res.netProfitLoss).toBeCloseTo(494.5, 0);
  });

  // 17. Negative Input Sanitization
  it('sanitizes negative values to 0', () => {
    const res = calculateCryptoProfitLoss({
      quantity: -5,
      buyPrice: -1000,
      sellPrice: -2000,
      buyFeePct: -2,
    });

    expect(res.quantity).toBe(0);
    expect(res.buyPrice).toBe(0);
    expect(res.sellPrice).toBe(0);
  });

  // 18. Effective Buy and Sell Prices per Unit
  it('computes effective buy and sell price per unit including fees', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 2.0,
      buyPrice: 1000,
      sellPrice: 1500,
      buyFixedFee: 20, // $2,020 total cost -> $1,010/unit
      sellFixedFee: 30, // $2,970 net proceeds -> $1,485/unit
      buyFeePct: 0,
      sellFeePct: 0,
    });

    expect(res.effectiveBuyPrice).toBe(1010);
    expect(res.effectiveSellPrice).toBe(1485);
  });

  // 19. Multi-Currency: INR (₹) Formatting & Symbol
  it('supports INR currency symbol and 2 decimals', () => {
    const res = calculateCryptoProfitLoss({
      currency: 'INR',
      quantity: 0.1,
      buyPrice: 5000000,
      sellPrice: 6000000,
    });

    expect(res.currency).toBe('INR');
    expect(res.symbol).toBe('₹');
    expect(res.decimals).toBe(2);
  });

  // 20. Multi-Currency: EUR (€) Formatting & Symbol
  it('supports EUR currency symbol', () => {
    const res = calculateCryptoProfitLoss({
      currency: 'EUR',
    });
    expect(res.currency).toBe('EUR');
    expect(res.symbol).toBe('€');
  });

  // 21. Multi-Currency: GBP (£) Formatting & Symbol
  it('supports GBP currency symbol', () => {
    const res = calculateCryptoProfitLoss({
      currency: 'GBP',
    });
    expect(res.currency).toBe('GBP');
    expect(res.symbol).toBe('£');
  });

  // 22. Multi-Currency: JPY (¥) with 0 Decimals
  it('supports JPY with 0 decimal places', () => {
    const res = calculateCryptoProfitLoss({
      currency: 'JPY',
      quantity: 1,
      buyPrice: 8000000,
      sellPrice: 10000000,
    });

    expect(res.currency).toBe('JPY');
    expect(res.symbol).toBe('¥');
    expect(res.decimals).toBe(0);
  });

  // 23. Invalid Currency Fallback to USD
  it('gracefully falls back to USD when invalid currency is passed', () => {
    const res = calculateCryptoProfitLoss({
      currency: 'XYZ_INVALID',
    });
    expect(res.symbol).toBe('$');
  });

  // 24. High ROI Recommendation (> 50%)
  it('triggers substantial gains recommendation for ROI > 50%', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 1,
      buyPrice: 100,
      sellPrice: 200, // 100% gain
    });

    const gainRec = res.recommendations.find(r => r.title.includes('Substantial Gains'));
    expect(gainRec).toBeDefined();
    expect(gainRec?.type).toBe('positive');
  });

  // 25. Significant Drawdown Recommendation (< -25%)
  it('triggers drawdown recommendation for loss > 25%', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 1,
      buyPrice: 1000,
      sellPrice: 600, // -40% loss
    });

    const lossRec = res.recommendations.find(r => r.title.includes('Significant Position Drawdown'));
    expect(lossRec).toBeDefined();
    expect(lossRec?.type).toBe('critical');
  });

  // 26. Fee Drag Exceeds Return Recommendation
  it('triggers fee drag warning when fees exceed net gain', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 1,
      buyPrice: 1000,
      sellPrice: 1020, // $20 gross profit
      buyFixedFee: 15,
      sellFixedFee: 15, // Total fees: $30 -> Net loss -$10
    });

    const feeRec = res.recommendations.find(r => r.title.includes('Fee Drag'));
    expect(feeRec).toBeDefined();
  });

  // 27. High Gas Friction Recommendation
  it('triggers high gas warning when gas fees exceed 2% of proceeds', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 0.1,
      buyPrice: 1000, // $100
      sellPrice: 1500, // $150
      buyGasFee: 10,
      sellGasFee: 10, // $20 gas on $150 gross = 13.3% gas
    });

    const gasRec = res.recommendations.find(r => r.title.includes('High Blockchain Gas Friction'));
    expect(gasRec).toBeDefined();
  });

  // 28. Tax Disclosure Recommendation is always present
  it('always provides tax disclosure recommendation', () => {
    const res = calculateCryptoProfitLoss();
    const taxRec = res.recommendations.find(r => r.title.includes('Tax & Compliance Disclosure'));
    expect(taxRec).toBeDefined();
  });

  // 29. Gross vs Net ROI comparison
  it('differentiates gross ROI from fee-adjusted net ROI', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 1,
      buyPrice: 1000,
      sellPrice: 1100, // +10% gross price increase
      buyFeePct: 1.0, // $10
      sellFeePct: 1.0, // $11 -> Total fees: $21
    });

    expect(res.grossRoiPct).toBe(10.0);
    expect(res.roiPct).toBeLessThan(10.0);
    expect(res.roiPct).toBeCloseTo(7.82, 1);
  });

  // 30. Unit Price Difference & Percentage Change
  it('computes unit price diff and percentage change', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 0.5,
      buyPrice: 40000,
      sellPrice: 50000,
    });

    expect(res.priceDiffPerUnit).toBe(10000);
    expect(res.priceChangePct).toBe(25.0);
  });

  // 31. Asset Name pass-through
  it('retains assetName in results', () => {
    const res = calculateCryptoProfitLoss({
      assetName: 'Ethereum (ETH)',
    });
    expect(res.assetName).toBe('Ethereum (ETH)');
  });

  // 32. Preset Validation: btc_swing_profit
  it('validates preset: Bitcoin (BTC) Multi-Month Swing Trade', () => {
    const p = CRYPTO_PROFIT_LOSS_CONFIG.presets.find(x => x.id === 'btc_swing_profit');
    expect(p).toBeDefined();
    const res = calculateCryptoProfitLoss(p);
    expect(res.quantity).toBe(0.25);
    expect(res.status).toBe('PROFIT');
    expect(res.roiPct).toBeGreaterThan(40);
  });

  // 33. Preset Validation: eth_defi_gas
  it('validates preset: Ethereum (ETH) DeFi Trade with Gas Costs', () => {
    const p = CRYPTO_PROFIT_LOSS_CONFIG.presets.find(x => x.id === 'eth_defi_gas');
    expect(p).toBeDefined();
    const res = calculateCryptoProfitLoss(p);
    expect(res.totalGasFeesPaid).toBe(45);
    expect(res.status).toBe('PROFIT');
  });

  // 34. Preset Validation: sol_low_fee
  it('validates preset: Solana (SOL) High-Frequency / Low-Fee', () => {
    const p = CRYPTO_PROFIT_LOSS_CONFIG.presets.find(x => x.id === 'sol_low_fee');
    expect(p).toBeDefined();
    const res = calculateCryptoProfitLoss(p);
    expect(res.quantity).toBe(40.0);
    expect(res.status).toBe('PROFIT');
  });

  // 35. Preset Validation: btc_inr_corridor
  it('validates preset: Bitcoin in INR (₹)', () => {
    const p = CRYPTO_PROFIT_LOSS_CONFIG.presets.find(x => x.id === 'btc_inr_corridor');
    expect(p).toBeDefined();
    const res = calculateCryptoProfitLoss(p);
    expect(res.currency).toBe('INR');
    expect(res.symbol).toBe('₹');
    expect(res.status).toBe('PROFIT');
  });

  // 36. Preset Validation: drawdown_loss
  it('validates preset: Market Correction / Drawdown Position', () => {
    const p = CRYPTO_PROFIT_LOSS_CONFIG.presets.find(x => x.id === 'drawdown_loss');
    expect(p).toBeDefined();
    const res = calculateCryptoProfitLoss(p);
    expect(res.status).toBe('LOSS');
    expect(res.roiPct).toBeLessThan(-30);
  });

  // 37. Preset Validation: break_even_scalp
  it('validates preset: Tight Scalp Trade Near Break-Even', () => {
    const p = CRYPTO_PROFIT_LOSS_CONFIG.presets.find(x => x.id === 'break_even_scalp');
    expect(p).toBeDefined();
    const res = calculateCryptoProfitLoss(p);
    expect(res.totalFeesPaid).toBeGreaterThan(40);
  });

  // 38. Constants Validation: CRYPTO_POSITION_MODES
  it('exposes CRYPTO_POSITION_MODES definitions', () => {
    expect(CRYPTO_POSITION_MODES.UNREALIZED).toBeDefined();
    expect(CRYPTO_POSITION_MODES.REALIZED).toBeDefined();
    expect(CRYPTO_POSITION_MODES.UNREALIZED.id).toBe('UNREALIZED');
  });

  // 39. Constants Validation: FIAT_CURRENCIES
  it('exposes FIAT_CURRENCIES mapping with major global currencies', () => {
    expect(FIAT_CURRENCIES.USD).toBeDefined();
    expect(FIAT_CURRENCIES.EUR).toBeDefined();
    expect(FIAT_CURRENCIES.INR).toBeDefined();
    expect(FIAT_CURRENCIES.JPY.decimals).toBe(0);
  });

  // 40. Alias calculateCryptoPl
  it('exports alias calculateCryptoPl correctly', () => {
    const res = calculateCryptoPl({ quantity: 1, buyPrice: 100, sellPrice: 150 });
    expect(res.netProfitLoss).toBeCloseTo(50, 0);
  });

  // 41. Alias calculateCryptoGains
  it('exports alias calculateCryptoGains correctly', () => {
    const res = calculateCryptoGains({ quantity: 2, buyPrice: 50, sellPrice: 75 });
    expect(res.netProfitLoss).toBeCloseTo(50, 0);
  });

  // 42. Alias calculateCryptoReturn
  it('exports alias calculateCryptoReturn correctly', () => {
    const res = calculateCryptoReturn({ quantity: 3, buyPrice: 10, sellPrice: 20 });
    expect(res.netProfitLoss).toBeCloseTo(30, 0);
  });

  // 43. Multi-Lot Empty Array Fallback
  it('handles empty lots array gracefully by falling back to scalar buyPrice', () => {
    const res = calculateCryptoProfitLoss({
      lots: [],
      quantity: 1,
      buyPrice: 5000,
      sellPrice: 6000,
    });
    expect(res.isMultiLot).toBe(false);
    expect(res.grossCostBasis).toBe(5000);
  });

  // 44. Extreme Fee Edge Case (100% Fee)
  it('handles high fee capping safely', () => {
    const res = calculateCryptoProfitLoss({
      quantity: 1,
      buyPrice: 100,
      sellPrice: 100,
      buyFeePct: 50,
      sellFeePct: 50,
    });
    expect(res.netProfitLoss).toBe(-100);
    expect(res.status).toBe('LOSS');
  });

  // 45. Configuration metadata check
  it('validates configuration object integrity', () => {
    expect(CRYPTO_PROFIT_LOSS_CONFIG.id).toBe('crypto-profit-loss-calculator');
    expect(CRYPTO_PROFIT_LOSS_CONFIG.category).toBe('crypto');
    expect(CRYPTO_PROFIT_LOSS_CONFIG.presets.length).toBe(6);
  });
});
