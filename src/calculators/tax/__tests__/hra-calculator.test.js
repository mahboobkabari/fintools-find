import { describe, it, expect } from 'vitest';
import { calculateHraCalculator } from '../hra-calculator.js';

describe('Institutional HRA Calculator Engine Tests', () => {
  it('verifies Rule 2A 3-limit calculation for Metro benchmark (Basic 6L, HRA 2.4L, Rent 3L)', () => {
    const res = calculateHraCalculator({
      basicSalary: 600000,
      daAmount: 0,
      hraReceived: 240000,
      rentPaid: 300000,
      isMetro: true,
      inputPeriod: 'annual',
    });

    // 1. Actual HRA = 2,40,000
    // 2. Rent - 10% Basic = 3,00,000 - 60,000 = 2,40,000
    // 3. 50% Basic = 3,00,000
    // Min = 2,40,000
    expect(res.rule2A.actualHra).toBe(240000);
    expect(res.rule2A.rentMinusTenPercent).toBe(240000);
    expect(res.rule2A.salaryCap).toBe(300000);
    expect(res.rule2A.exemptHra).toBe(240000);
    expect(res.rule2A.taxableHra).toBe(0);
    expect(res.primaryOutput).toBe(240000);
  });

  it('tests Rent-minus-10%-Salary limit binding (Rent 1.5L, Basic 6L, HRA 2.4L)', () => {
    // 1. Actual HRA = 2,40,000
    // 2. Rent - 10% Basic = 1,50,000 - 60,000 = 90,000 (BINDING LIMIT)
    // 3. 50% Basic = 3,00,000
    const res = calculateHraCalculator({
      basicSalary: 600000,
      hraReceived: 240000,
      rentPaid: 150000,
      isMetro: true,
    });

    expect(res.rule2A.rentMinusTenPercent).toBe(90000);
    expect(res.rule2A.exemptHra).toBe(90000);
    expect(res.rule2A.taxableHra).toBe(150000);
    expect(res.rule2A.bindingLimit).toBe('rent_minus_10pct');
  });

  it('tests 50% Metro Salary Cap limit binding (Rent 5L, Basic 6L, HRA 4L)', () => {
    // 1. Actual HRA = 4,00,000
    // 2. Rent - 10% Basic = 5,00,000 - 60,000 = 4,40,000
    // 3. 50% Basic = 3,00,000 (BINDING LIMIT)
    const res = calculateHraCalculator({
      basicSalary: 600000,
      hraReceived: 400000,
      rentPaid: 500000,
      isMetro: true,
    });

    expect(res.rule2A.salaryCap).toBe(300000);
    expect(res.rule2A.exemptHra).toBe(300000);
    expect(res.rule2A.taxableHra).toBe(100000);
    expect(res.rule2A.bindingLimit).toBe('salary_cap');
  });

  it('tests 40% Non-Metro Salary Cap limit binding (Rent 5L, Basic 6L, HRA 4L, Non-Metro)', () => {
    // 1. Actual HRA = 4,00,000
    // 2. Rent - 10% Basic = 5,00,000 - 60,000 = 4,40,000
    // 3. 40% Basic = 2,40,000 (BINDING LIMIT)
    const res = calculateHraCalculator({
      basicSalary: 600000,
      hraReceived: 400000,
      rentPaid: 500000,
      isMetro: false,
    });

    expect(res.rule2A.salaryCap).toBe(240000);
    expect(res.rule2A.exemptHra).toBe(240000);
    expect(res.rule2A.taxableHra).toBe(160000);
    expect(res.rule2A.bindingLimit).toBe('salary_cap');
  });

  it('tests Actual HRA limit binding (HRA 1.2L, Rent 3L, Basic 6L)', () => {
    // 1. Actual HRA = 1,20,000 (BINDING LIMIT)
    // 2. Rent - 10% Basic = 3,00,000 - 60,000 = 2,40,000
    // 3. 50% Basic = 3,00,000
    const res = calculateHraCalculator({
      basicSalary: 600000,
      hraReceived: 120000,
      rentPaid: 300000,
      isMetro: true,
    });

    expect(res.rule2A.actualHra).toBe(120000);
    expect(res.rule2A.exemptHra).toBe(120000);
    expect(res.rule2A.taxableHra).toBe(0);
    expect(res.rule2A.bindingLimit).toBe('actual_hra');
  });

  it('handles Zero Rent scenario correctly', () => {
    const res = calculateHraCalculator({
      basicSalary: 600000,
      hraReceived: 240000,
      rentPaid: 0,
      isMetro: true,
    });

    expect(res.rule2A.rentMinusTenPercent).toBe(0);
    expect(res.rule2A.exemptHra).toBe(0);
    expect(res.rule2A.taxableHra).toBe(240000);
  });

  it('handles Zero HRA scenario correctly', () => {
    const res = calculateHraCalculator({
      basicSalary: 600000,
      hraReceived: 0,
      rentPaid: 300000,
      isMetro: true,
    });

    expect(res.rule2A.actualHra).toBe(0);
    expect(res.rule2A.exemptHra).toBe(0);
    expect(res.rule2A.taxableHra).toBe(0);
  });

  it('correctly compares Old Tax Regime vs New Tax Regime (HRA exemption 0 in New Regime)', () => {
    const res = calculateHraCalculator({
      basicSalary: 600000,
      hraReceived: 240000,
      rentPaid: 300000,
      grossSalary: 1200000,
      otherDeductionsOld: 150000,
    });

    expect(res.oldRegime.exemptHra).toBe(240000);
    expect(res.newRegime.exemptHra).toBe(0);
    expect(res.oldRegime.totalIncomeTax).toBeLessThan(res.newRegime.totalIncomeTax);
    expect(res.recommendedRegime).toBe('old');
  });

  it('evaluates Rent Scenarios and computes net financial impact (additional tax saved minus additional rent)', () => {
    const res = calculateHraCalculator({
      basicSalary: 600000,
      hraReceived: 240000,
      rentPaid: 120000, // Rent 10k/mo -> Rent-10% Basic = 1.2L - 60k = 60k exempt
      isMetro: true,
    });

    expect(res.scenarios.length).toBe(6);
    const scPlus5k = res.scenarios.find((s) => s.id === 'plus5k');
    expect(scPlus5k).toBeDefined();
    expect(scPlus5k.monthlyRent).toBe(15000);
    expect(scPlus5k.addlRentCostAnnual).toBe(60000);
    expect(scPlus5k.exemptHraAnnual).toBeGreaterThan(res.rule2A.exemptHra);
  });

  it('handles invalid or negative inputs gracefully without throwing', () => {
    const resInvalid = calculateHraCalculator({
      basicSalary: 'abc',
      hraReceived: -500,
      rentPaid: null,
    });

    expect(resInvalid.rule2A.exemptHra).toBe(0);
    expect(resInvalid.rule2A.taxableHra).toBe(0);
  });
});