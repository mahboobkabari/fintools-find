import { describe, it, expect } from 'vitest';
import {
  calculateBreakEven,
  calculateContributionMargin,
  calculateContributionMarginRatio,
  calculateBreakEvenUnits,
  calculateBreakEvenRevenue,
  calculateProfit,
  calculateRequiredUnitsForTargetProfit,
} from '../break-even-calculator.js';
import { BREAK_EVEN_CONFIG } from '../../configs/break-even-calculator.config.js';

describe('Break-Even Analysis Financial Engine', () => {

  // 1. Contribution Margin
  it('calculates contribution margin per unit correctly', () => {
    expect(calculateContributionMargin(100, 40)).toBe(60);
    expect(calculateContributionMargin(1200, 450)).toBe(750);
  });

  // 2. Contribution Margin Ratio
  it('calculates contribution margin ratio percentage correctly', () => {
    expect(calculateContributionMarginRatio(100, 40)).toBe(60.0);
    expect(calculateContributionMarginRatio(1000, 400)).toBe(60.0);
    expect(calculateContributionMarginRatio(0, 50)).toBe(0);
  });

  // 3. Basic Break-Even Units
  it('calculates break-even units correctly for standard inputs', () => {
    // Fixed: 10,000, Selling Price: 100, Variable: 50 -> CM = 50 -> BEP = 200 units
    expect(calculateBreakEvenUnits(10000, 100, 50)).toBe(200);
  });

  // 4. Basic Break-Even Revenue
  it('calculates break-even revenue correctly', () => {
    // Fixed: 10,000, Selling Price: 100, Variable: 50 -> BEP Units = 200 -> Revenue = 20,000
    expect(calculateBreakEvenRevenue(10000, 100, 50)).toBe(20000);
  });

  // 5. Profit at Zero Units
  it('calculates profit at zero unit sales as negative fixed costs', () => {
    expect(calculateProfit(150000, 1000, 400, 0)).toBe(-150000);
  });

  // 6. Profit Below Break-Even
  it('calculates loss when sales volume is below break-even point', () => {
    // Fixed: 10,000, Price: 100, Variable: 50 -> BEP = 200. Test at 100 units: 100*50 - 10,000 = -5,000
    expect(calculateProfit(10000, 100, 50, 100)).toBe(-5000);
  });

  // 7. Profit at Break-Even
  it('calculates net zero profit at exact break-even sales volume', () => {
    // Fixed: 10,000, Price: 100, Variable: 50 -> BEP = 200 units. Profit = 200*50 - 10,000 = 0
    expect(calculateProfit(10000, 100, 50, 200)).toBe(0);
  });

  // 8. Profit Above Break-Even
  it('calculates positive net profit when sales volume exceeds break-even', () => {
    // Fixed: 10,000, Price: 100, Variable: 50. At 300 units: 300*50 - 10,000 = 5,000
    expect(calculateProfit(10000, 100, 50, 300)).toBe(5000);
  });

  // 9. Zero Fixed Costs
  it('returns zero break-even units when fixed costs are zero', () => {
    expect(calculateBreakEvenUnits(0, 100, 40)).toBe(0);
    expect(calculateBreakEvenRevenue(0, 100, 40)).toBe(0);
  });

  // 10. Zero Variable Costs
  it('handles zero variable costs with 100% contribution margin ratio', () => {
    expect(calculateContributionMarginRatio(500, 0)).toBe(100.0);
    expect(calculateBreakEvenUnits(50000, 500, 0)).toBe(100);
  });

  // 11. Negative Input Rejection
  it('sanitizes negative inputs to non-negative values cleanly', () => {
    const res = calculateBreakEven({
      fixedCosts: -50000,
      sellingPrice: -100,
      variableCost: -20,
    });
    expect(res.fixedCosts).toBe(0);
    expect(res.sellingPrice).toBe(0);
    expect(res.variableCost).toBe(0);
  });

  // 12. Zero Selling Price Handling
  it('flags validation error state when selling price is zero', () => {
    const res = calculateBreakEven({ fixedCosts: 10000, sellingPrice: 0, variableCost: 50 });
    expect(res.isValid).toBe(false);
    expect(res.validationMessage).toContain('greater than zero');
  });

  // 13. Variable Cost Equal to Selling Price
  it('flags validation error when variable cost equals selling price', () => {
    const res = calculateBreakEven({ fixedCosts: 10000, sellingPrice: 100, variableCost: 100 });
    expect(res.isValid).toBe(false);
    expect(res.validationMessage).toContain('equals variable cost');
    expect(res.breakEvenUnits).toBe(0);
  });

  // 14. Variable Cost Greater than Selling Price
  it('flags validation error when variable cost exceeds selling price', () => {
    const res = calculateBreakEven({ fixedCosts: 10000, sellingPrice: 100, variableCost: 150 });
    expect(res.isValid).toBe(false);
    expect(res.validationMessage).toContain('exceeds selling price');
    expect(res.breakEvenUnits).toBe(0);
  });

  // 15. Large Monetary Values
  it('handles enterprise-scale values (e.g., ₹10 Crores fixed costs) without numeric overflow', () => {
    const res = calculateBreakEven({
      fixedCosts: 100000000,
      sellingPrice: 5000,
      variableCost: 2000,
      currentSalesVolume: 40000,
    });
    expect(res.isValid).toBe(true);
    expect(res.breakEvenUnits).toBe(33334); // Ceil(100M / 3000)
    expect(res.breakEvenRevenue).toBe(166670000);
  });

  // 16. Fractional Break-Even Result Rounding
  it('rounds fractional break-even units UP to the nearest whole unit (ceil)', () => {
    // Fixed: 1,000, Price: 10, Variable: 7 -> CM = 3. 1000/3 = 333.333 -> Ceil = 334 units
    expect(calculateBreakEvenUnits(1000, 10, 7)).toBe(334);
  });

  // 17. Target Profit Calculation
  it('calculates required unit sales and revenue for target profit goals', () => {
    // Fixed: 10,000, Price: 100, Variable: 50, Target Profit: 5,000 -> (10k + 5k)/50 = 300 units
    const reqUnits = calculateRequiredUnitsForTargetProfit(10000, 100, 50, 5000);
    expect(reqUnits).toBe(300);

    const res = calculateBreakEven({
      fixedCosts: 10000,
      sellingPrice: 100,
      variableCost: 50,
      targetProfit: 5000,
    });
    expect(res.targetProfitUnits).toBe(300);
    expect(res.targetProfitRevenue).toBe(30000);
  });

  // 18. Zero Target Profit Handling
  it('returns standard break-even units when target profit is zero', () => {
    const reqUnits = calculateRequiredUnitsForTargetProfit(10000, 100, 50, 0);
    expect(reqUnits).toBe(200);
  });

  // 19. Input Sanitization (Strings & NaN)
  it('sanitizes string numbers and non-numeric NaN values safely', () => {
    const res = calculateBreakEven({
      fixedCosts: '150000',
      sellingPrice: '1000',
      variableCost: '400',
      currentSalesVolume: NaN,
    });

    expect(res.isValid).toBe(true);
    expect(res.fixedCosts).toBe(150000);
    expect(res.breakEvenUnits).toBe(250); // 150k / 600
    expect(res.currentSalesVolume).toBe(0);
  });

  // 20. Preset Integration
  it('integrates cleanly with preset business scenario defaults', () => {
    const preset = BREAK_EVEN_CONFIG.scenarios.saas;
    const res = calculateBreakEven(preset);

    expect(res.isValid).toBe(true);
    expect(res.fixedCosts).toBe(450000);
    expect(res.contributionMargin).toBe(2250); // 2500 - 250
    expect(res.breakEvenUnits).toBe(200); // 450k / 2250
    expect(res.breakEvenRevenue).toBe(500000);
  });

  // 21. Price Sensitivity Matrix Generation
  it('generates price sensitivity matrix with price variation thresholds', () => {
    const res = calculateBreakEven({
      fixedCosts: 100000,
      sellingPrice: 1000,
      variableCost: 400,
    });

    expect(res.sensitivityMatrix).toHaveLength(5); // -10%, -5%, 0%, +5%, +10%
    const baseRow = res.sensitivityMatrix.find((r) => r.priceChangePct === 0);
    expect(baseRow.adjustedPrice).toBe(1000);
    expect(baseRow.breakEvenUnits).toBe(167); // Ceil(100k / 600)
  });
});
