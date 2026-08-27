import { describe, it, expect } from 'vitest';
import {
  calculateCurrencyConverter,
  calculateCurrencyConverterTool,
  calculateFxConverter,
  REFERENCE_EXCHANGE_RATES,
  REFERENCE_RATE_METADATA,
  SUPPORTED_CURRENCY_CODES,
  DEFAULT_CURRENCY_CONVERTER_INPUTS,
} from '../currency-converter.js';
import { CURRENCY_PRESETS } from '../../configs/currency-converter.config.js';

describe('Flagship Currency Converter Suite (Sprint 77 / Flagship #84)', () => {
  // 1. Same-Currency Conversions
  describe('1. Same-Currency Conversions', () => {
    it('1. converts USD to USD with exact 1.0 rate and identical amount', () => {
      const res = calculateCurrencyConverter({
        amount: 500,
        fromCurrency: 'USD',
        toCurrency: 'USD',
      });

      expect(res.midMarketRate).toBe(1.0);
      expect(res.convertedAmount).toBe(500);
      expect(res.primaryOutput).toBe(500);
    });

    it('2. converts INR to INR with 1.0 rate', () => {
      const res = calculateCurrencyConverter({
        amount: 75000,
        fromCurrency: 'INR',
        toCurrency: 'INR',
      });

      expect(res.midMarketRate).toBe(1.0);
      expect(res.convertedAmount).toBe(75000);
    });

    it('3. converts EUR to EUR correctly', () => {
      const res = calculateCurrencyConverter({
        amount: 1250.5,
        fromCurrency: 'EUR',
        toCurrency: 'EUR',
      });

      expect(res.midMarketRate).toBe(1.0);
      expect(res.convertedAmount).toBe(1250.5);
    });
  });

  // 2. Standard Base Currency Conversions (USD to Target)
  describe('2. Standard Base Currency Conversions (USD to Target)', () => {
    it('4. converts USD to INR accurately ($1,000 -> ₹87,500)', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'USD',
        toCurrency: 'INR',
      });

      // Rate = 87.50, Converted = 87,500.00
      expect(res.midMarketRate).toBe(87.5);
      expect(res.convertedAmount).toBe(87500);
      expect(res.fromCurrency).toBe('USD');
      expect(res.toCurrency).toBe('INR');
    });

    it('5. converts USD to EUR accurately ($1,000 -> €920)', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
      });

      // Rate = 0.92, Converted = 920.00
      expect(res.midMarketRate).toBe(0.92);
      expect(res.convertedAmount).toBe(920);
    });

    it('6. converts USD to JPY with 0 decimal precision ($1,000 -> ¥155,000)', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'USD',
        toCurrency: 'JPY',
      });

      // Rate = 155.0, Converted = 155,000
      expect(res.midMarketRate).toBe(155);
      expect(res.convertedAmount).toBe(155000);
      expect(res.toMeta.decimals).toBe(0);
    });

    it('7. converts USD to KWD with 3 decimal precision ($1,000 -> KD 306.500)', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'USD',
        toCurrency: 'KWD',
      });

      // Rate = 0.3065, Converted = 306.500
      expect(res.midMarketRate).toBe(0.3065);
      expect(res.convertedAmount).toBe(306.5);
      expect(res.toMeta.decimals).toBe(3);
    });
  });

  // 3. Cross-Currency Conversions & Arbitrage
  describe('3. Cross-Currency Conversions & Arbitrage', () => {
    it('8. converts EUR to USD accurately (€1,000 -> $1,086.96)', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'EUR',
        toCurrency: 'USD',
      });

      // Rate = 1 / 0.92 = 1.0869565... -> $1,086.96
      expect(res.convertedAmount).toBe(1086.96);
      expect(Number(res.displayExchangeRate)).toBeCloseTo(1.087, 2);
    });

    it('9. converts GBP to INR accurately (£1,000 -> ₹111,464.97)', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'GBP',
        toCurrency: 'INR',
      });

      // Rate = 87.5 / 0.785 = 111.464968... -> ₹111,464.97
      expect(res.convertedAmount).toBe(111464.97);
    });

    it('10. converts AED to INR accurately (AED 1,000 -> ₹23,825.73)', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'AED',
        toCurrency: 'INR',
      });

      // Rate = 87.5 / 3.6725 = 23.82573... -> ₹23,825.73
      expect(res.convertedAmount).toBe(23825.73);
    });

    it('11. converts CAD to INR accurately (C$ 1,000 -> ₹63,636.36)', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'CAD',
        toCurrency: 'INR',
      });

      // Rate = 87.5 / 1.375 = 63.63636... -> ₹63,636.36
      expect(res.convertedAmount).toBe(63636.36);
    });
  });

  // 4. Inverse Rates & Reciprocal Consistency
  describe('4. Inverse Rates & Reciprocal Consistency', () => {
    it('12. calculates reciprocal inverse exchange rate accurately', () => {
      const res = calculateCurrencyConverter({
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'INR',
      });

      // Direct: 1 USD = 87.50 INR
      // Inverse: 1 INR = 1 / 87.50 = 0.01142857 USD
      expect(res.midMarketRate).toBe(87.5);
      expect(res.inverseRate).toBeCloseTo(0.011428, 5);
      expect(Number(res.displayInverseRate)).toBe(0.0114);
    });

    it('13. maintains perfect mathematical round-trip consistency', () => {
      const direct = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'EUR',
        toCurrency: 'GBP',
      });

      const reverse = calculateCurrencyConverter({
        amount: direct.convertedAmount,
        fromCurrency: 'GBP',
        toCurrency: 'EUR',
      });

      expect(reverse.convertedAmount).toBeCloseTo(1000, 0);
    });
  });

  // 5. Amount Magnitudes: Large, Small, Zero & Decimal Handling
  describe('5. Amount Magnitudes & Precision', () => {
    it('14. handles zero amount safely without NaN ($0 -> ₹0)', () => {
      const res = calculateCurrencyConverter({
        amount: 0,
        fromCurrency: 'USD',
        toCurrency: 'INR',
      });

      expect(res.convertedAmount).toBe(0);
      expect(res.effectiveConvertedAmount).toBe(0);
    });

    it('15. handles small fractional amounts ($0.05)', () => {
      const res = calculateCurrencyConverter({
        amount: 0.05,
        fromCurrency: 'USD',
        toCurrency: 'INR',
      });

      // 0.05 * 87.5 = 4.38
      expect(res.convertedAmount).toBe(4.38);
    });

    it('16. handles micro-amounts ($0.01)', () => {
      const res = calculateCurrencyConverter({
        amount: 0.01,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
      });

      // 0.01 * 0.92 = 0.01
      expect(res.convertedAmount).toBe(0.01);
    });

    it('17. handles institutional scale large amounts ($50,000,000)', () => {
      const res = calculateCurrencyConverter({
        amount: 50000000,
        fromCurrency: 'USD',
        toCurrency: 'INR',
      });

      // 50,000,000 * 87.50 = 4,375,000,000
      expect(res.convertedAmount).toBe(4375000000);
    });
  });

  // 6. Bank Spread & Retail Forex Fee Simulation
  describe('6. Bank Spread & Retail Forex Fee Simulation', () => {
    it('18. simulates 0% mid-market spread (effective = converted)', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'USD',
        toCurrency: 'INR',
        fxSpreadPct: 0,
      });

      expect(res.convertedAmount).toBe(87500);
      expect(res.effectiveConvertedAmount).toBe(87500);
      expect(res.spreadFeeCostInTarget).toBe(0);
    });

    it('19. calculates 2.0% bank card spread fee accurately', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'USD',
        toCurrency: 'INR',
        fxSpreadPct: 2.0,
      });

      // Converted Mid-Market = ₹87,500
      // Effective Rate = 87.5 * (1 - 0.02) = 85.75
      // Net Received = ₹85,750
      // Spread Cost = ₹1,750
      expect(res.convertedAmount).toBe(87500);
      expect(res.effectiveConvertedAmount).toBe(85750);
      expect(res.spreadFeeCostInTarget).toBe(1750);
      expect(res.spreadFeeCostInSource).toBe(20);
    });

    it('20. calculates 3.5% international credit card FX fee', () => {
      const res = calculateCurrencyConverter({
        amount: 2000,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        fxSpreadPct: 3.5,
      });

      // Mid-Market: 2000 * 0.92 = €1,840.00
      // Effective: 2000 * (0.92 * 0.965) = €1,775.60
      // Spread Cost: €64.40
      expect(res.convertedAmount).toBe(1840);
      expect(res.effectiveConvertedAmount).toBe(1775.6);
      expect(res.spreadFeeCostInTarget).toBe(64.4);
    });

    it('21. clamps spread percentage to a maximum of 20%', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fxSpreadPct: 50,
      });

      expect(res.fxSpreadPct).toBe(20);
    });
  });

  // 7. Custom User-Specified Rate Overrides
  describe('7. Custom Rate Overrides', () => {
    it('22. respects custom user exchange rate override', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'USD',
        toCurrency: 'INR',
        customRate: '90.25',
      });

      // 1000 * 90.25 = 90,250
      expect(res.midMarketRate).toBe(90.25);
      expect(res.convertedAmount).toBe(90250);
    });

    it('23. ignores invalid non-numeric custom rate and uses reference rate', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'USD',
        toCurrency: 'INR',
        customRate: 'invalid_rate',
      });

      expect(res.midMarketRate).toBe(87.5);
      expect(res.convertedAmount).toBe(87500);
    });
  });

  // 8. Multi-Denomination Schedule Matrix
  describe('8. Multi-Denomination Schedule Matrix', () => {
    it('24. generates 12 standard denomination entries in matrix', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'USD',
        toCurrency: 'INR',
      });

      expect(res.conversionMatrix.length).toBe(12);
      expect(res.conversionMatrix[0].sourceAmount).toBe(1);
      expect(res.conversionMatrix[0].convertedTarget).toBe(87.5);
      expect(res.conversionMatrix[7].sourceAmount).toBe(1000);
      expect(res.conversionMatrix[7].convertedTarget).toBe(87500);
    });

    it('25. includes formatted direct and inverse display strings', () => {
      const res = calculateCurrencyConverter({
        amount: 100,
        fromCurrency: 'EUR',
        toCurrency: 'USD',
      });

      expect(res.conversionMatrix[0].formattedDirect).toContain('€1');
      expect(res.conversionMatrix[0].formattedDirect).toContain('$1.09');
    });
  });

  // 9. Input Sanitization & Robust Boundary Safeguards
  describe('9. Input Sanitization & Edge Safeguards', () => {
    it('26. sanitizes negative amounts using absolute value', () => {
      const res = calculateCurrencyConverter({
        amount: -500,
        fromCurrency: 'USD',
        toCurrency: 'INR',
      });

      expect(res.amount).toBe(500);
      expect(res.convertedAmount).toBe(43750);
    });

    it('27. handles non-numeric NaN amount gracefully by defaulting to 1000', () => {
      const res = calculateCurrencyConverter({
        amount: 'not_a_number',
      });

      expect(res.amount).toBe(1000);
      expect(isNaN(res.convertedAmount)).toBe(false);
    });

    it('28. falls back to USD for invalid/unknown fromCurrency', () => {
      const res = calculateCurrencyConverter({
        amount: 100,
        fromCurrency: 'XYZ_UNKNOWN',
        toCurrency: 'INR',
      });

      expect(res.fromCurrency).toBe('USD');
      expect(res.isFromValid).toBe(false);
    });

    it('29. falls back to INR for invalid/unknown toCurrency', () => {
      const res = calculateCurrencyConverter({
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'ABC_UNKNOWN',
      });

      expect(res.toCurrency).toBe('INR');
      expect(res.isToValid).toBe(false);
    });

    it('30. handles lowercase and untrimmed currency codes', () => {
      const res = calculateCurrencyConverter({
        amount: 100,
        fromCurrency: '  usd  ',
        toCurrency: ' inr ',
      });

      expect(res.fromCurrency).toBe('USD');
      expect(res.toCurrency).toBe('INR');
      expect(res.isFromValid).toBe(true);
      expect(res.isToValid).toBe(true);
    });
  });

  // 10. Reference Metadata & Disclosures
  describe('10. Reference Metadata & Disclosures', () => {
    it('31. includes baseline date, source, and disclaimer in result metadata', () => {
      const res = calculateCurrencyConverter();
      expect(res.metadata.baselineDate).toBe(REFERENCE_RATE_METADATA.baselineDate);
      expect(res.metadata.source).toContain('Reference FX Rates');
      expect(res.metadata.disclaimer).toContain('Exchange rates displayed');
    });

    it('32. provides all 20 supported currency codes in metadata dictionary', () => {
      expect(SUPPORTED_CURRENCY_CODES.length).toBe(20);
      expect(SUPPORTED_CURRENCY_CODES).toContain('USD');
      expect(SUPPORTED_CURRENCY_CODES).toContain('INR');
      expect(SUPPORTED_CURRENCY_CODES).toContain('EUR');
      expect(SUPPORTED_CURRENCY_CODES).toContain('GBP');
      expect(SUPPORTED_CURRENCY_CODES).toContain('JPY');
      expect(SUPPORTED_CURRENCY_CODES).toContain('AED');
      expect(SUPPORTED_CURRENCY_CODES).toContain('CAD');
    });

    it('33. verifies all reference currency definitions contain symbols and flags', () => {
      SUPPORTED_CURRENCY_CODES.forEach((code) => {
        const item = REFERENCE_EXCHANGE_RATES[code];
        expect(item.code).toBe(code);
        expect(item.symbol).toBeDefined();
        expect(item.flag).toBeDefined();
        expect(item.rateToUsd).toBeGreaterThan(0);
      });
    });
  });

  // 11. Presets Verification (All 6 Presets)
  describe('11. Presets Verification', () => {
    it('34. verifies USD to INR Preset', () => {
      const p = CURRENCY_PRESETS.find((x) => x.id === 'usd_inr');
      expect(p).toBeDefined();
      const res = calculateCurrencyConverter(p.values);
      expect(res.fromCurrency).toBe('USD');
      expect(res.toCurrency).toBe('INR');
      expect(res.convertedAmount).toBe(87500);
    });

    it('35. verifies EUR to USD Preset', () => {
      const p = CURRENCY_PRESETS.find((x) => x.id === 'eur_usd');
      expect(p).toBeDefined();
      const res = calculateCurrencyConverter(p.values);
      expect(res.fromCurrency).toBe('EUR');
      expect(res.toCurrency).toBe('USD');
      expect(res.convertedAmount).toBe(1086.96);
    });

    it('36. verifies GBP to INR Preset', () => {
      const p = CURRENCY_PRESETS.find((x) => x.id === 'gbp_inr');
      expect(p).toBeDefined();
      const res = calculateCurrencyConverter(p.values);
      expect(res.fromCurrency).toBe('GBP');
      expect(res.toCurrency).toBe('INR');
      expect(res.convertedAmount).toBe(111464.97);
    });

    it('37. verifies AED to INR Preset', () => {
      const p = CURRENCY_PRESETS.find((x) => x.id === 'aed_inr');
      expect(p).toBeDefined();
      const res = calculateCurrencyConverter(p.values);
      expect(res.fromCurrency).toBe('AED');
      expect(res.toCurrency).toBe('INR');
      expect(res.convertedAmount).toBe(23825.73);
    });

    it('38. verifies CAD to INR Preset', () => {
      const p = CURRENCY_PRESETS.find((x) => x.id === 'cad_inr');
      expect(p).toBeDefined();
      const res = calculateCurrencyConverter(p.values);
      expect(res.fromCurrency).toBe('CAD');
      expect(res.toCurrency).toBe('INR');
      expect(res.convertedAmount).toBe(63636.36);
    });

    it('39. verifies USD to JPY Preset', () => {
      const p = CURRENCY_PRESETS.find((x) => x.id === 'usd_jpy');
      expect(p).toBeDefined();
      const res = calculateCurrencyConverter(p.values);
      expect(res.fromCurrency).toBe('USD');
      expect(res.toCurrency).toBe('JPY');
      expect(res.convertedAmount).toBe(155000);
    });
  });

  // 12. Hero Text & Actionable Recommendations
  describe('12. Hero Text & Actionable Recommendations', () => {
    it('40. formats hero text with currency symbols and amounts', () => {
      const res = calculateCurrencyConverter({
        amount: 1000,
        fromCurrency: 'USD',
        toCurrency: 'INR',
      });

      expect(res.heroText).toBe('$1,000 USD = ₹87,500.00 INR');
    });

    it('41. generates 3 ranked actionable recommendations', () => {
      const res = calculateCurrencyConverter();
      expect(res.recommendations.length).toBe(3);
      expect(res.recommendations[0].rank).toBe(1);
      expect(res.recommendations[1].rank).toBe(2);
      expect(res.recommendations[2].rank).toBe(3);
    });

    it('42. includes Dynamic Currency Conversion (DCC) advice in recommendations', () => {
      const res = calculateCurrencyConverter({
        amount: 500,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
      });

      expect(res.recommendations[1].action).toContain('Dynamic Currency Conversion');
    });
  });

  // 13. Export Aliases & Default Fallbacks
  describe('13. Export Aliases & Default Fallbacks', () => {
    it('43. uses default parameters when invoked without arguments', () => {
      const res = calculateCurrencyConverter();
      expect(res.amount).toBe(DEFAULT_CURRENCY_CONVERTER_INPUTS.amount);
      expect(res.fromCurrency).toBe(DEFAULT_CURRENCY_CONVERTER_INPUTS.fromCurrency);
      expect(res.toCurrency).toBe(DEFAULT_CURRENCY_CONVERTER_INPUTS.toCurrency);
    });

    it('44. exports calculateCurrencyConverterTool alias identically', () => {
      expect(typeof calculateCurrencyConverterTool).toBe('function');
      const res1 = calculateCurrencyConverter();
      const res2 = calculateCurrencyConverterTool();
      expect(res1.convertedAmount).toBe(res2.convertedAmount);
    });

    it('45. exports calculateFxConverter alias identically', () => {
      expect(typeof calculateFxConverter).toBe('function');
      const res1 = calculateCurrencyConverter();
      const res3 = calculateFxConverter();
      expect(res1.convertedAmount).toBe(res3.convertedAmount);
    });
  });
});
