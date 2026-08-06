import { describe, it, expect } from 'vitest';
import { calculateHraCalculator } from '../hra-calculator.js';

describe('HRA Calculator Engine', () => {
  it('calculates 100% HRA exemption for high-rent metro benchmark', () => {
    const output = calculateHraCalculator({
      basicSalary: 600000,
      hraReceived: 240000,
      rentPaid: 300000,
      isMetro: true,
    });
    expect(output.actualHra).toBe(240000);
    expect(output.rentMinusTenPercent).toBe(240000);
    expect(output.salaryPercentageLimit).toBe(300000);
    expect(output.exemptHra).toBe(240000);
    expect(output.taxableHra).toBe(0);
    expect(output.primaryOutput).toBe(240000);
  });

  it('calculates partial HRA exemption for non-metro scenario', () => {
    const output = calculateHraCalculator({
      basicSalary: 600000,
      hraReceived: 240000,
      rentPaid: 180000,
      isMetro: false,
    });
    expect(output.actualHra).toBe(240000);
    expect(output.rentMinusTenPercent).toBe(120000); // 180k - 60k
    expect(output.salaryPercentageLimit).toBe(240000); // 40% of 600k
    expect(output.exemptHra).toBe(120000);
    expect(output.taxableHra).toBe(120000);
  });
});