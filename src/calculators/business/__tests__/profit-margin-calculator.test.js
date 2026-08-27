import { describe, it, expect } from 'vitest';
import {
  calculateGrossMargin,
  calculateOperatingMargin,
  calculateNetMargin,
  calculateMarkupFromCostPrice,
  convertMarginToMarkup,
  calculateTargetPriceFromMargin,
  generateMarginMarkupConversionTable,
  calculateProfitMarginMetrics,
} from '../profit-margin-calculator';
import { PROFIT_MARGIN_CONFIG } from '../../configs/profit-margin-calculator.config';

describe('Profit Margin & Markup Engine Tests', () => {

  // 1. Gross profit calculation
  it('calculates gross profit correctly (100k revenue, 60k COGS)', () => {
    const res = calculateGrossMargin(100000, 60000);
    expect(res.grossProfit).toBe(40000);
  });

  // 2. Gross margin % calculation
  it('calculates gross margin % correctly (40% for 100k revenue, 60k COGS)', () => {
    const res = calculateGrossMargin(100000, 60000);
    expect(res.grossMarginPercent).toBe(40);
  });

  // 3. Markup % calculation
  it('calculates markup % correctly (66.67% markup on 60k cost, 100k price)', () => {
    const res = calculateMarkupFromCostPrice(100000, 60000);
    expect(res.markupPercent).toBeCloseTo(66.67, 1);
  });

  // 4. Operating profit calculation
  it('calculates operating profit correctly', () => {
    const res = calculateOperatingMargin(100000, 60000, 15000);
    expect(res.operatingProfit).toBe(25000);
  });

  // 5. Operating margin % calculation
  it('calculates operating margin % correctly', () => {
    const res = calculateOperatingMargin(100000, 60000, 15000);
    expect(res.operatingMarginPercent).toBe(25);
  });

  // 6. Net profit calculation
  it('calculates net profit after 25% tax on pre-tax profit', () => {
    // Gross: 40k, OPEX: 15k => Operating: 25k. Other Exp: 5k => Pre-tax: 20k. Tax 25% of 20k = 5k. Net: 15k.
    const res = calculateNetMargin(100000, 60000, 15000, 5000, 25);
    expect(res.preTaxProfit).toBe(20000);
    expect(res.taxes).toBe(5000);
    expect(res.netProfit).toBe(15000);
  });

  // 7. Net margin % calculation
  it('calculates net margin % correctly', () => {
    const res = calculateNetMargin(100000, 60000, 15000, 5000, 25);
    expect(res.netMarginPercent).toBe(15);
  });

  // 8. Target selling price calculation
  it('calculates target selling price for 40% desired gross margin on 60k COGS', () => {
    // Target = 60000 / (1 - 0.40) = 100,000
    const res = calculateTargetPriceFromMargin(60000, 40);
    expect(res.isValid).toBe(true);
    expect(res.targetSellingPrice).toBe(100000);
  });

  // 9. Margin-to-markup conversion
  it('converts gross margin % into cost-plus markup %', () => {
    const res = convertMarginToMarkup(40);
    expect(res.markupPercent).toBeCloseTo(66.67, 1);
  });

  // 10. E-commerce preset integration
  it('integrates cleanly with e-commerce preset', () => {
    const res = calculateProfitMarginMetrics(PROFIT_MARGIN_CONFIG.scenarios.ecommerceRetailer);
    expect(res.isValid).toBe(true);
    expect(res.grossMarginPercent).toBe(40);
  });

  // 11. SaaS preset integration
  it('integrates cleanly with software SaaS preset', () => {
    const res = calculateProfitMarginMetrics(PROFIT_MARGIN_CONFIG.scenarios.softwareSaas);
    expect(res.isValid).toBe(true);
    expect(res.grossMarginPercent).toBe(85);
  });

  // 12. Consulting preset integration
  it('integrates cleanly with consulting services preset', () => {
    const res = calculateProfitMarginMetrics(PROFIT_MARGIN_CONFIG.scenarios.consultingServices);
    expect(res.isValid).toBe(true);
    expect(res.grossMarginPercent).toBe(80);
  });

  // 13. Restaurant preset integration
  it('integrates cleanly with restaurant preset', () => {
    const res = calculateProfitMarginMetrics(PROFIT_MARGIN_CONFIG.scenarios.restaurantFoodService);
    expect(res.isValid).toBe(true);
    expect(res.grossMarginPercent).toBe(65);
  });

  // 14. 50% margin = 100% markup
  it('verifies mathematical identity: 50% gross margin = 100% markup', () => {
    const res = convertMarginToMarkup(50);
    expect(res.markupPercent).toBe(100);
  });

  // 15. 20% margin = 25% markup
  it('verifies mathematical identity: 20% gross margin = 25% markup', () => {
    const res = convertMarginToMarkup(20);
    expect(res.markupPercent).toBe(25);
  });

  // 16. 75% margin = 300% markup
  it('verifies mathematical identity: 75% gross margin = 300% markup', () => {
    const res = convertMarginToMarkup(75);
    expect(res.markupPercent).toBe(300);
  });

  // 17. Selling at cost
  it('handles selling at cost (0% margin, 0% markup)', () => {
    const gross = calculateGrossMargin(100, 100);
    const markup = calculateMarkupFromCostPrice(100, 100);
    expect(gross.grossProfit).toBe(0);
    expect(gross.grossMarginPercent).toBe(0);
    expect(markup.markupPercent).toBe(0);
  });

  // 18. Selling below cost
  it('handles selling below cost (negative margin & markup)', () => {
    const gross = calculateGrossMargin(80, 100);
    const markup = calculateMarkupFromCostPrice(80, 100);
    expect(gross.grossProfit).toBe(-20);
    expect(gross.grossMarginPercent).toBe(-25);
    expect(gross.isSellingBelowCost).toBe(true);
    expect(markup.markupPercent).toBe(-20);
  });

  // 19. Zero COGS edge case handling
  it('handles zero COGS gracefully without division-by-zero crash', () => {
    const markup = calculateMarkupFromCostPrice(100, 0);
    expect(markup.isZeroCost).toBe(true);
    expect(markup.markupPercent).toBe(0);
  });

  // 20. Desired margin >= 100% error validation handling
  it('validates desired margin >= 100% and returns error state', () => {
    const res = calculateTargetPriceFromMargin(100, 100);
    expect(res.isValid).toBe(false);
    expect(res.errorMessage).toBeDefined();
  });

  // 21. Numeric string input sanitization
  it('sanitizes numeric string inputs safely', () => {
    const res = calculateProfitMarginMetrics({
      revenue: '100000',
      cogs: '60000',
      operatingExpenses: '15000',
    });
    expect(res.isValid).toBe(true);
    expect(res.grossMarginPercent).toBe(40);
  });

  // 22. Large business values
  it('handles large corporate revenue values (₹100 Crores)', () => {
    const res = calculateProfitMarginMetrics({
      revenue: 1000000000,
      cogs: 600000000,
    });
    expect(res.grossProfit).toBe(400000000);
  });

  // 23. Small unit economics
  it('handles small unit economics (₹10 cost item)', () => {
    const res = calculateProfitMarginMetrics({
      revenue: 15,
      cogs: 10,
    });
    expect(res.grossProfit).toBe(5);
    expect(res.markupPercent).toBe(50);
  });

  // 24. Tax deduction calculation
  it('calculates 0 taxes when pre-tax profit is zero or negative', () => {
    const res = calculateNetMargin(100, 100, 20, 0, 25);
    expect(res.preTaxProfit).toBe(-20);
    expect(res.taxes).toBe(0);
  });

  // 25. Zero operating expenses scenario
  it('handles zero operating expenses scenario', () => {
    const res = calculateOperatingMargin(100, 60, 0);
    expect(res.operatingProfit).toBe(40);
  });

  // 26. High operating expenses scenario
  it('handles high OPEX exceeding gross profit', () => {
    const res = calculateOperatingMargin(100, 60, 50);
    expect(res.operatingProfit).toBe(-10);
    expect(res.operatingMarginPercent).toBe(-10);
  });

  // 27. Negative net profit scenario
  it('handles negative net profit scenario cleanly', () => {
    const res = calculateProfitMarginMetrics({
      revenue: 100,
      cogs: 60,
      operatingExpenses: 50,
    });
    expect(res.netProfit).toBe(-10);
  });

  // 28. Conversion table generation
  it('generates non-empty margin vs markup conversion reference table', () => {
    const table = generateMarginMarkupConversionTable();
    expect(table.length).toBeGreaterThan(5);
    expect(table[0]).toHaveProperty('grossMarginPercent');
    expect(table[0]).toHaveProperty('markupPercent');
  });

  // 29. Full metrics integration
  it('returns complete metrics object for default inputs', () => {
    const res = calculateProfitMarginMetrics(PROFIT_MARGIN_CONFIG.defaultInputs);
    expect(res.isValid).toBe(true);
    expect(res.grossProfit).toBeDefined();
    expect(res.operatingProfit).toBeDefined();
    expect(res.netProfit).toBeDefined();
    expect(res.targetPrice).toBeDefined();
  });

  // 30. Invalid input handling
  it('handles empty inputs safely without throwing errors', () => {
    const res = calculateProfitMarginMetrics({});
    expect(res.isValid).toBe(false);
    expect(res.grossProfit).toBe(0);
  });

  // 31. REGRESSION PROOF: Higher selling price increases gross margin %
  it('REGRESSION PROOF: Higher selling price strictly increases gross margin % for fixed COGS', () => {
    const low = calculateGrossMargin(100, 60);
    const high = calculateGrossMargin(120, 60);
    expect(high.grossMarginPercent).toBeGreaterThan(low.grossMarginPercent);
  });

  // 32. REGRESSION PROOF: Markup exceeds margin for positive profit
  it('REGRESSION PROOF: Markup % is strictly greater than Gross Margin % for positive profits', () => {
    const res = calculateProfitMarginMetrics({ revenue: 100, cogs: 60 });
    expect(res.markupPercent).toBeGreaterThan(res.grossMarginPercent);
  });

  // 33. REGRESSION PROOF: Gross margin never exceeds 100%
  it('REGRESSION PROOF: Gross margin % never exceeds 100% for any positive revenue and COGS', () => {
    const res = calculateGrossMargin(1000, 1);
    expect(res.grossMarginPercent).toBeLessThan(100);
  });

  // 34. Structured result object verification
  it('verifies all expected properties in result object', () => {
    const res = calculateProfitMarginMetrics(PROFIT_MARGIN_CONFIG.defaultInputs);
    expect(res).toHaveProperty('revenue');
    expect(res).toHaveProperty('cogs');
    expect(res).toHaveProperty('grossMarginPercent');
    expect(res).toHaveProperty('operatingMarginPercent');
    expect(res).toHaveProperty('netMarginPercent');
    expect(res).toHaveProperty('markupPercent');
    expect(res).toHaveProperty('conversionTable');
  });

  // 35. Regression coverage for edge cases
  it('handles edge case where revenue equals COGS plus OPEX', () => {
    const res = calculateProfitMarginMetrics({ revenue: 100, cogs: 70, operatingExpenses: 30 });
    expect(res.operatingProfit).toBe(0);
    expect(res.operatingMarginPercent).toBe(0);
  });

});
