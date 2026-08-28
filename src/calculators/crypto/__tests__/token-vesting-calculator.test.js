import { describe, it, expect } from 'vitest';
import {
  calculateTokenVesting,
  generateVestingSchedule,
  addMonthsToDate,
  addDaysToDate,
  diffDays,
  parseDateParts,
  formatDateParts,
  sanitizeNumber,
} from '../token-vesting-calculator.js';

describe('Token Vesting Engine (Flagship #97)', () => {
  // 1. Date utilities: Parse date parts
  it('1. correctly parses ISO date strings into year, month, and day', () => {
    const parts = parseDateParts('2024-06-15');
    expect(parts.year).toBe(2024);
    expect(parts.month).toBe(6);
    expect(parts.day).toBe(15);
  });

  // 2. Date utilities: Add months deterministically
  it('2. adds months across year boundaries accurately', () => {
    expect(addMonthsToDate('2024-10-15', 5)).toBe('2025-03-15');
    expect(addMonthsToDate('2024-01-31', 1)).toBe('2024-02-29'); // Leap year 2024
  });

  // 3. Date utilities: Add days deterministically
  it('3. adds days across month and year boundaries', () => {
    expect(addDaysToDate('2024-01-01', 30)).toBe('2024-01-31');
    expect(addDaysToDate('2024-12-30', 5)).toBe('2025-01-04');
  });

  // 4. Date utilities: Difference in calendar days
  it('4. calculates calendar days between two dates', () => {
    expect(diffDays('2024-01-01', '2024-01-11')).toBe(10);
    expect(diffDays('2024-01-01', '2024-01-01')).toBe(0);
    expect(diffDays('2024-01-15', '2024-01-01')).toBe(-14);
  });

  // 5. Basic Valuation: Total Allocation Value
  it('5. calculates total grant value as total tokens times token price', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      tokenPrice: 2.5,
    });
    expect(res.kpis.totalGrantValue).toBe(250000);
  });

  // 6. Evaluation before grant start date (0% Vested)
  it('6. returns 0% vested when evaluated before grant start date', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      startDate: '2024-01-01',
      evaluationDate: '2023-10-01',
      cliffMonths: 12,
      vestingMonths: 48,
    });
    expect(res.kpis.vestedTokens).toBe(0);
    expect(res.kpis.unvestedTokens).toBe(100000);
    expect(res.kpis.vestedPct).toBe(0);
    expect(res.meta.isBeforeStart).toBe(true);
  });

  // 7. Evaluation during cliff period (No initial unlock)
  it('7. returns 0 vested during cliff period when initial unlock is 0', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      startDate: '2024-01-01',
      evaluationDate: '2024-06-01', // Month 5 (during 12m cliff)
      cliffMonths: 12,
      vestingMonths: 48,
    });
    expect(res.kpis.vestedTokens).toBe(0);
    expect(res.kpis.unvestedTokens).toBe(100000);
    expect(res.kpis.vestedPct).toBe(0);
    expect(res.meta.isDuringCliff).toBe(true);
  });

  // 8. Evaluation during cliff period with 10% TGE Initial Unlock
  it('8. preserves initial unlock tokens as vested during cliff period', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      startDate: '2024-01-01',
      evaluationDate: '2024-06-01', // Month 5 (during 12m cliff)
      cliffMonths: 12,
      vestingMonths: 48,
      initialUnlockPct: 10,
    });
    expect(res.kpis.vestedTokens).toBe(10000);
    expect(res.kpis.unvestedTokens).toBe(90000);
    expect(res.kpis.vestedPct).toBe(10);
  });

  // 9. Evaluation exactly at 1-Year Cliff (12 months on 48-month schedule = 25% Vested)
  it('9. unlocks 25% of allocation exactly at the 12-month cliff date', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      startDate: '2024-01-01',
      evaluationDate: '2025-01-01', // Exactly Month 12
      cliffMonths: 12,
      vestingMonths: 48,
      initialUnlockPct: 0,
    });
    // 12/48 = 25% -> 25,000 tokens
    expect(res.kpis.vestedTokens).toBe(25000);
    expect(res.kpis.unvestedTokens).toBe(75000);
    expect(res.kpis.vestedPct).toBe(25);
  });

  // 10. Evaluation Midway Post-Cliff (Month 24 on 48-month schedule = 50% Vested)
  it('10. vests 50% of tokens at the 24-month midpoint of a 4-year schedule', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      startDate: '2024-01-01',
      evaluationDate: '2026-01-01', // Month 24
      cliffMonths: 12,
      vestingMonths: 48,
    });
    expect(res.kpis.vestedTokens).toBe(50000);
    expect(res.kpis.unvestedTokens).toBe(50000);
    expect(res.kpis.vestedPct).toBe(50);
  });

  // 11. Evaluation exactly at Vesting End Date (100% Vested)
  it('11. reaches 100% vested status at the exact vesting end date', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      startDate: '2024-01-01',
      evaluationDate: '2028-01-01', // Month 48
      cliffMonths: 12,
      vestingMonths: 48,
    });
    expect(res.kpis.vestedTokens).toBe(100000);
    expect(res.kpis.unvestedTokens).toBe(0);
    expect(res.kpis.vestedPct).toBe(100);
    expect(res.meta.isFullyVested).toBe(true);
  });

  // 12. Evaluation after Vesting End Date (100% Vested, never exceeds 100%)
  it('12. caps vested tokens strictly at 100% when evaluated past vesting end date', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      startDate: '2024-01-01',
      evaluationDate: '2030-01-01', // Year 6 on 4-year schedule
      cliffMonths: 12,
      vestingMonths: 48,
    });
    expect(res.kpis.vestedTokens).toBe(100000);
    expect(res.kpis.unvestedTokens).toBe(0);
    expect(res.kpis.vestedPct).toBe(100);
  });

  // 13. Linear Vesting Without Cliff (Linear from Month 1)
  it('13. vests linearly from month 1 when cliff is set to 0', () => {
    const res = calculateTokenVesting({
      totalTokens: 120000,
      startDate: '2024-01-01',
      evaluationDate: '2024-07-01', // Month 6 of 24
      vestingModel: 'LINEAR_NO_CLIFF',
      cliffMonths: 0,
      vestingMonths: 24,
    });
    // 6 / 24 = 25% -> 30,000 tokens
    expect(res.kpis.vestedTokens).toBe(30000);
    expect(res.kpis.vestedPct).toBe(25);
  });

  // 14. Immediate / Fully Unlocked Model
  it('14. immediately vests 100% in IMMEDIATE vesting model', () => {
    const res = calculateTokenVesting({
      totalTokens: 50000,
      vestingModel: 'IMMEDIATE',
    });
    expect(res.kpis.vestedTokens).toBe(50000);
    expect(res.kpis.vestedPct).toBe(100);
    expect(res.kpis.unvestedTokens).toBe(0);
  });

  // 15. Initial Unlock + Post-Cliff Linear (10% TGE + 6m Cliff + 24m Total)
  it('15. calculates initial unlock plus subsequent cliff linear vesting correctly', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      startDate: '2024-01-01',
      evaluationDate: '2024-07-01', // Month 6 (Cliff release date)
      vestingModel: 'INITIAL_UNLOCK_CLIFF_LINEAR',
      cliffMonths: 6,
      vestingMonths: 24,
      initialUnlockPct: 10,
    });
    // Initial = 10,000 tokens (10%)
    // Remaining = 90,000 tokens
    // Month 6 / 24 = 25% of 90,000 = 22,500
    // Total Vested = 10,000 + 22,500 = 32,500 (32.5%)
    expect(res.kpis.vestedTokens).toBe(32500);
    expect(res.kpis.vestedPct).toBe(32.5);
  });

  // 16. Vested Value and Unvested Value calculations
  it('16. calculates vested and unvested dollar valuations based on token price', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      tokenPrice: 3.0,
      startDate: '2024-01-01',
      evaluationDate: '2025-01-01', // 25,000 vested
      cliffMonths: 12,
      vestingMonths: 48,
    });
    // 25,000 * $3 = $75,000
    expect(res.kpis.vestedValue).toBe(75000);
    // 75,000 * $3 = $225,000
    expect(res.kpis.unvestedValue).toBe(225000);
    expect(res.kpis.totalGrantValue).toBe(300000);
  });

  // 17. Grant Cost Basis & Unrealized Gain Calculation
  it('17. computes unrealized gain against original grant price', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      grantPrice: 0.50, // $50,000 cost basis
      tokenPrice: 2.00, // $200,000 current value
    });
    expect(res.kpis.initialGrantCostValue).toBe(50000);
    expect(res.kpis.totalGrantValue).toBe(200000);
    expect(res.kpis.unrealizedGainFiat).toBe(150000);
    expect(res.kpis.unrealizedGainPct).toBe(300); // 300% gain
  });

  // 18. Token Ownership Percentage (with Total Supply)
  it('18. computes token ownership percentage accurately against total supply', () => {
    const res = calculateTokenVesting({
      totalTokens: 500000,
      totalSupply: 10000000, // 5% ownership
      startDate: '2024-01-01',
      evaluationDate: '2025-01-01', // 25% vested (125k tokens = 1.25%)
      cliffMonths: 12,
      vestingMonths: 48,
    });
    expect(res.kpis.ownershipPct).toBe(5.0);
    expect(res.kpis.vestedOwnershipPct).toBe(1.25);
  });

  // 19. Zero Total Supply handling
  it('19. returns 0 ownership percentage if total supply is 0', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      totalSupply: 0,
    });
    expect(res.kpis.ownershipPct).toBe(0);
  });

  // 20. Quarterly Vesting Schedule
  it('20. generates quarterly discrete unlock schedule', () => {
    const res = calculateTokenVesting({
      totalTokens: 120000,
      startDate: '2024-01-01',
      cliffMonths: 12,
      vestingMonths: 24,
      vestingFrequency: 'QUARTERLY',
    });
    // Schedule should have cliff at Month 12, then Months 15, 18, 21, 24
    expect(res.schedule.length).toBeGreaterThanOrEqual(4);
    const last = res.schedule[res.schedule.length - 1];
    expect(last.cumulativeVestedTokens).toBe(120000);
    expect(last.vestedPct).toBe(100);
  });

  // 21. Weekly Vesting Schedule
  it('21. generates weekly discrete unlock schedule', () => {
    const res = calculateTokenVesting({
      totalTokens: 52000,
      startDate: '2024-01-01',
      cliffMonths: 0,
      vestingMonths: 12,
      vestingFrequency: 'WEEKLY',
    });
    expect(res.schedule.length).toBeGreaterThan(45);
    const last = res.schedule[res.schedule.length - 1];
    expect(last.cumulativeVestedTokens).toBe(52000);
  });

  // 22. Daily Vesting Schedule
  it('22. generates daily unlock schedule without crashing', () => {
    const res = calculateTokenVesting({
      totalTokens: 36500,
      startDate: '2024-01-01',
      cliffMonths: 0,
      vestingMonths: 1, // 1 month
      vestingFrequency: 'DAILY',
    });
    expect(res.schedule.length).toBeGreaterThan(25);
  });

  // 23. Next Unlock Date identification
  it('23. identifies next upcoming unlock date and amount when evaluated during vesting', () => {
    const res = calculateTokenVesting({
      totalTokens: 48000,
      startDate: '2024-01-01',
      evaluationDate: '2024-05-15', // Month 5
      cliffMonths: 0,
      vestingMonths: 48,
      vestingFrequency: 'MONTHLY',
    });
    // Next unlock is Month 6 (2024-06-01 or next schedule item)
    expect(res.kpis.nextUnlockAmount).toBeGreaterThan(0);
    expect(res.kpis.daysUntilNextUnlock).toBeGreaterThan(0);
  });

  // 24. Next Unlock during Cliff
  it('24. sets next unlock date to the cliff date when evaluated during cliff', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      startDate: '2024-01-01',
      evaluationDate: '2024-06-01',
      cliffMonths: 12,
      vestingMonths: 48,
    });
    expect(res.kpis.nextUnlockDate).toBe('2025-01-01');
    expect(res.kpis.nextUnlockAmount).toBe(25000);
  });

  // 25. Price Sensitivity Scenarios (8 scenarios)
  it('25. calculates 8 price sensitivity scenarios', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      tokenPrice: 2.0,
      startDate: '2024-01-01',
      evaluationDate: '2025-01-01', // 25,000 vested
    });
    expect(res.priceScenarios.length).toBe(8);
    // Multipliers: 0.25, 0.50, 0.75, 1.00, 1.25, 1.50, 2.00, 4.00
    const currentScenario = res.priceScenarios.find((s) => s.multiplier === 1.0);
    expect(currentScenario.vestedValue).toBe(50000); // 25k * $2
    expect(currentScenario.totalValue).toBe(200000); // 100k * $2

    const doubleScenario = res.priceScenarios.find((s) => s.multiplier === 2.0);
    expect(doubleScenario.vestedValue).toBe(100000); // 25k * $4
    expect(doubleScenario.totalValue).toBe(400000); // 100k * $4
  });

  // 26. Price Crash Scenario (-75%)
  it('26. calculates bear crash scenario values correctly', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      tokenPrice: 4.0,
      startDate: '2024-01-01',
      evaluationDate: '2025-01-01',
    });
    const crash = res.priceScenarios.find((s) => s.multiplier === 0.25);
    expect(crash.tokenPrice).toBe(1.0);
    expect(crash.totalValue).toBe(100000);
    expect(crash.vestedValue).toBe(25000);
  });

  // 27. Zero Token Price handling
  it('27. handles zero token spot price without crashing', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      tokenPrice: 0,
    });
    expect(res.kpis.totalGrantValue).toBe(0);
    expect(res.kpis.vestedValue).toBe(0);
    expect(res.kpis.unvestedValue).toBe(0);
  });

  // 28. Large token allocation (1,000,000,000 tokens)
  it('28. handles billion token allocations without floating point overflow', () => {
    const res = calculateTokenVesting({
      totalTokens: 1000000000,
      tokenPrice: 0.10,
      startDate: '2024-01-01',
      evaluationDate: '2026-01-01', // 50%
      cliffMonths: 12,
      vestingMonths: 48,
    });
    expect(res.kpis.vestedTokens).toBe(500000000);
    expect(res.kpis.vestedValue).toBe(50000000);
  });

  // 29. Tiny fractional tokens (0.005 tokens)
  it('29. handles micro fractional token grants with precision', () => {
    const res = calculateTokenVesting({
      totalTokens: 0.005,
      tokenPrice: 50000,
      startDate: '2024-01-01',
      evaluationDate: '2026-01-01',
      cliffMonths: 12,
      vestingMonths: 48,
    });
    expect(res.kpis.vestedTokens).toBe(0.0025);
    expect(res.kpis.vestedValue).toBe(125);
  });

  // 30. Annualized Unlock Rate
  it('30. computes annualized unlock tokens and value accurately', () => {
    const res = calculateTokenVesting({
      totalTokens: 400000,
      tokenPrice: 2.0,
      vestingMonths: 48, // 4 years
    });
    // 400,000 / 4 = 100,000 tokens/year
    expect(res.kpis.annualizedUnlockTokens).toBe(100000);
    // 100,000 * $2 = $200,000/year
    expect(res.kpis.annualizedUnlockValue).toBe(200000);
  });

  // 31. Multi-currency: EUR formatting
  it('31. supports EUR quote currency', () => {
    const res = calculateTokenVesting({ currency: 'EUR' });
    expect(res.meta.currencySymbol).toBe('€');
    expect(res.meta.currencyCode).toBe('EUR');
    expect(res.meta.currencyDecimals).toBe(2);
  });

  // 32. Multi-currency: INR formatting
  it('32. supports INR quote currency', () => {
    const res = calculateTokenVesting({ currency: 'INR' });
    expect(res.meta.currencySymbol).toBe('₹');
    expect(res.meta.currencyCode).toBe('INR');
  });

  // 33. Multi-currency: JPY formatting (0 decimals)
  it('33. supports JPY quote currency with 0 decimal places', () => {
    const res = calculateTokenVesting({ currency: 'JPY', tokenPrice: 200 });
    expect(res.meta.currencySymbol).toBe('¥');
    expect(res.meta.currencyDecimals).toBe(0);
    expect(Number.isInteger(res.kpis.totalGrantValue)).toBe(true);
  });

  // 34. Custom Token Symbol
  it('34. preserves custom token ticker symbol in output meta', () => {
    const res = calculateTokenVesting({ tokenSymbol: 'BTC' });
    expect(res.inputs.tokenSymbol).toBe('BTC');
  });

  // 35. Schedule reconciliation: Schedule totals equal total allocation
  it('35. guarantees schedule final cumulative vested equals total allocation exactly', () => {
    const res = calculateTokenVesting({
      totalTokens: 123456,
      startDate: '2024-01-01',
      cliffMonths: 12,
      vestingMonths: 36,
      vestingFrequency: 'MONTHLY',
    });
    const lastRow = res.schedule[res.schedule.length - 1];
    expect(lastRow.cumulativeVestedTokens).toBe(123456);
    expect(lastRow.remainingTokens).toBe(0);
    expect(lastRow.vestedPct).toBe(100);
  });

  // 36. Schedule reconciliation: No double counting initial unlock
  it('36. does not double-count initial unlock in schedule rows', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      initialUnlockPct: 20, // 20k initial
      startDate: '2024-01-01',
      cliffMonths: 12,
      vestingMonths: 48,
    });
    // First row should have 20,000
    expect(res.schedule[0].unlockedTokens).toBe(20000);
    expect(res.schedule[0].cumulativeVestedTokens).toBe(20000);

    // Sum of all unlockedTokens in schedule must equal 100,000
    const sumUnlocked = res.schedule.reduce((acc, row) => acc + row.unlockedTokens, 0);
    expect(sumUnlocked).toBeCloseTo(100000, 2);
  });

  // 37. Input Sanitization: Negative allocation clamped to 0
  it('37. sanitizes negative allocation to 0', () => {
    const res = calculateTokenVesting({ totalTokens: -50000 });
    expect(res.inputs.totalTokens).toBe(0);
    expect(res.kpis.totalGrantValue).toBe(0);
  });

  // 38. Input Sanitization: Negative price clamped to 0
  it('38. sanitizes negative token price to 0', () => {
    const res = calculateTokenVesting({ tokenPrice: -10 });
    expect(res.inputs.tokenPrice).toBe(0);
  });

  // 39. Input Sanitization: Initial unlock > 100 clamped to 100
  it('39. clamps initial unlock percentage exceeding 100% to 100%', () => {
    const res = calculateTokenVesting({ initialUnlockPct: 150 });
    expect(res.inputs.initialUnlockPct).toBe(100);
  });

  // 40. Input Sanitization: Cliff greater than Vesting duration
  it('40. automatically ensures vesting duration is at least equal to cliff duration', () => {
    const res = calculateTokenVesting({
      cliffMonths: 24,
      vestingMonths: 12, // smaller than cliff
    });
    expect(res.inputs.vestingMonths).toBeGreaterThanOrEqual(24);
  });

  // 41. Preset: Employee Equity Grant
  it('41. verifies Employee Equity Grant preset calculation', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      tokenPrice: 1.5,
      grantPrice: 0.25,
      startDate: '2024-01-01',
      evaluationDate: '2025-01-01',
      cliffMonths: 12,
      vestingMonths: 48,
      vestingFrequency: 'MONTHLY',
    });
    expect(res.kpis.vestedTokens).toBe(25000);
    expect(res.kpis.vestedValue).toBe(37500);
    expect(res.kpis.unrealizedGainFiat).toBe(125000);
  });

  // 42. Preset: Token Launch TGE (10% Initial + 6m Cliff)
  it('42. verifies Token Launch TGE preset calculation', () => {
    const res = calculateTokenVesting({
      totalTokens: 250000,
      tokenPrice: 2.0,
      grantPrice: 0.50,
      startDate: '2024-01-01',
      evaluationDate: '2024-07-01',
      cliffMonths: 6,
      vestingMonths: 24,
      initialUnlockPct: 10,
    });
    // 10% (25k) + 6/24 (25% of 225k = 56.25k) = 81,250 tokens
    expect(res.kpis.vestedTokens).toBe(81250);
    expect(res.kpis.vestedValue).toBe(162500);
  });

  // 43. Continuous Linear Vesting Progression
  it('43. models continuous linear vesting smoothly without discreteness', () => {
    const res = calculateTokenVesting({
      totalTokens: 100000,
      startDate: '2024-01-01',
      evaluationDate: '2024-07-01', // exactly 182 days out of 366 (leap year)
      vestingModel: 'LINEAR_NO_CLIFF',
      vestingMonths: 12,
      vestingFrequency: 'CONTINUOUS',
    });
    expect(res.kpis.vestedTokens).toBeGreaterThan(45000);
    expect(res.kpis.vestedTokens).toBeLessThan(55000);
  });

  // 44. Default execution test
  it('44. executes default configuration successfully without exceptions', () => {
    const res = calculateTokenVesting();
    expect(res).toBeDefined();
    expect(res.kpis.totalGrantValue).toBeGreaterThan(0);
    expect(res.schedule.length).toBeGreaterThan(0);
  });

  // 45. Sanitize helper with string and null inputs
  it('45. sanitizeNumber handles null, undefined, strings, and bounds properly', () => {
    expect(sanitizeNumber('500', 10)).toBe(500);
    expect(sanitizeNumber('invalid_text', 20)).toBe(20);
    expect(sanitizeNumber(null, 50)).toBe(50);
    expect(sanitizeNumber(undefined, 75)).toBe(75);
    expect(sanitizeNumber(150, 0, 0, 100)).toBe(100);
  });
});
