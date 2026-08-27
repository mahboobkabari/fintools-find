import { describe, it, expect } from 'vitest';
import {
  calculateMiningProfitability,
  calculateCryptoMining,
  calculateBtcMiningProfitability,
  calculateAsicProfitability,
  convertToHashesPerSecond,
  HASHRATE_UNITS,
  FIAT_CURRENCIES,
} from '../mining-profitability-calculator.js';
import { MINING_PROFITABILITY_CONFIG } from '../../configs/mining-profitability-calculator.config.js';

describe('Mining Profitability Calculator Engine (Sprint 83 / Flagship #90)', () => {
  // 1. Hashrate Unit Normalization
  it('converts hashrate units to base Hashes/sec accurately', () => {
    expect(convertToHashesPerSecond(1, 'H')).toBe(1);
    expect(convertToHashesPerSecond(1, 'KH')).toBe(1e3);
    expect(convertToHashesPerSecond(1, 'MH')).toBe(1e6);
    expect(convertToHashesPerSecond(1, 'GH')).toBe(1e9);
    expect(convertToHashesPerSecond(1, 'TH')).toBe(1e12);
    expect(convertToHashesPerSecond(1, 'PH')).toBe(1e15);
    expect(convertToHashesPerSecond(1, 'EH')).toBe(1e18);
  });

  // 2. Thermodynamic Power & Electricity Math
  it('calculates daily, monthly, and annual kWh and power costs correctly', () => {
    // 1000W at 100% uptime = 24 kWh/day. At $0.10/kWh = $2.40/day
    const res = calculateMiningProfitability({
      powerWatts: 1000,
      electricityCost: 0.10,
      uptimePct: 100,
      hashrate: 0, // isolate power
    });

    expect(res.dailyKwh).toBe(24);
    expect(res.monthlyKwh).toBeCloseTo(730, 0); // 24 * 365/12
    expect(res.annualKwh).toBe(8760); // 24 * 365
    expect(res.dailyElecCost).toBe(2.40);
    expect(res.annualElecCost).toBe(876.00);
  });

  // 3. Uptime Percentage Scaling
  it('scales power consumption and coin production with uptime %', () => {
    const full = calculateMiningProfitability({
      powerWatts: 2000,
      electricityCost: 0.10,
      uptimePct: 100,
      manualDailyCoins: 1.0,
      cryptoPrice: 100,
    });

    const half = calculateMiningProfitability({
      powerWatts: 2000,
      electricityCost: 0.10,
      uptimePct: 50,
      manualDailyCoins: 1.0,
      cryptoPrice: 100,
    });

    expect(half.dailyKwh).toBe(full.dailyKwh / 2);
    expect(half.dailyElecCost).toBe(full.dailyElecCost / 2);
    expect(half.dailyCoinsGross).toBe(full.dailyCoinsGross / 2);
  });

  // 4. Basic Profitable Mining Scenario
  it('calculates positive net profit, payback, and ROI for an efficient ASIC rig', () => {
    const res = calculateMiningProfitability({
      hashrate: 200,
      hashrateUnit: 'TH',
      powerWatts: 3000,
      electricityCost: 0.05, // 3kW * 24h = 72 kWh = $3.60/day
      cryptoPrice: 65000,
      poolFeePct: 2.0,
      hardwareCost: 3000,
      networkHashrate: 650,
      networkHashrateUnit: 'EH', // Share: 200 / 650,000,000 = 3.0769e-7
      blockReward: 3.125,
      blocksPerDay: 144, // Total reward: 450 BTC/day -> Coins: ~0.00013846 BTC/day -> Gross: ~$9.00/day
      txFeesPerBlock: 0,
      uptimePct: 100,
    });

    expect(res.status).toBe('PROFITABLE');
    expect(res.dailyGrossRevenue).toBeGreaterThan(8.5);
    expect(res.dailyElecCost).toBe(3.60);
    expect(res.dailyNetProfit).toBeGreaterThan(4.5);
    expect(res.paybackMonths).toBeGreaterThan(0);
    expect(res.annualRoiPct).toBeGreaterThan(0);
  });

  // 5. Unprofitable Mining Scenario (High Power Cost)
  it('identifies negative cashflow when electricity exceeds gross mining revenue', () => {
    const res = calculateMiningProfitability({
      hashrate: 100,
      hashrateUnit: 'TH',
      powerWatts: 3500,
      electricityCost: 0.25, // 3.5kW * 24h = 84 kWh = $21.00/day
      cryptoPrice: 50000,
      networkHashrate: 650,
      networkHashrateUnit: 'EH',
      blockReward: 3.125,
      blocksPerDay: 144,
      txFeesPerBlock: 0,
      uptimePct: 100,
    });

    expect(res.status).toBe('UNPROFITABLE');
    expect(res.dailyNetProfit).toBeLessThan(0);
    expect(res.paybackDays).toBeNull();
    expect(res.heroVerdict).toContain('Unprofitable Operation');
  });

  // 6. Break-Even Operating Scenario
  it('correctly handles exact break-even operating status', () => {
    const res = calculateMiningProfitability({
      manualDailyCoins: 0.1,
      cryptoPrice: 100, // Gross: $10.00
      poolFeePct: 0,
      powerWatts: 4166.6667, // 100 kWh/day
      electricityCost: 0.10, // $10.00/day
      otherDailyCost: 0,
      hardwareCost: 0,
      uptimePct: 100,
    });

    expect(res.dailyGrossRevenue).toBe(10.00);
    expect(res.dailyElecCost).toBe(10.00);
    expect(res.dailyNetProfit).toBe(0.00);
    expect(res.status).toBe('BREAK_EVEN');
  });

  // 7. Analytical Break-Even Crypto Price Solver
  it('calculates the shutdown / break-even crypto price accurately', () => {
    const res = calculateMiningProfitability({
      manualDailyCoins: 0.01, // 0.01 coins/day
      powerWatts: 2000, // 48 kWh/day
      electricityCost: 0.10, // $4.80/day
      poolFeePct: 4.0, // 4% pool fee -> 96% retention
      otherDailyCost: 0.20, // Total required OPEX: $5.00/day
      uptimePct: 100,
    });

    // P_be = 5.00 / (0.01 * 0.96) = 5.00 / 0.0096 = $520.83
    expect(res.breakEvenCryptoPrice).toBeCloseTo(520.83, 1);

    // Verify that at breakEvenCryptoPrice, daily net profit is ~0
    const testBe = calculateMiningProfitability({
      manualDailyCoins: 0.01,
      cryptoPrice: res.breakEvenCryptoPrice,
      powerWatts: 2000,
      electricityCost: 0.10,
      poolFeePct: 4.0,
      otherDailyCost: 0.20,
      uptimePct: 100,
    });
    expect(testBe.dailyNetProfit).toBeCloseTo(0, 0);
  });

  // 8. Mining Pool Fee Deductions
  it('properly deducts pool fees from gross revenue', () => {
    const res = calculateMiningProfitability({
      manualDailyCoins: 1.0,
      cryptoPrice: 1000, // $1000 gross
      poolFeePct: 2.5, // $25 fee
      powerWatts: 0,
      electricityCost: 0,
      uptimePct: 100,
    });

    expect(res.dailyGrossRevenue).toBe(1000);
    expect(res.dailyPoolFee).toBe(25);
    expect(res.dailyNetProfit).toBe(975);
  });

  // 9. Other Daily Costs (Facility Rent / Cooling / Maintenance)
  it('incorporates other daily operational costs', () => {
    const res = calculateMiningProfitability({
      manualDailyCoins: 1.0,
      cryptoPrice: 500,
      powerWatts: 1000, // 24 kWh
      electricityCost: 0.05, // $1.20 power
      otherDailyCost: 2.50, // $2.50 maintenance
      poolFeePct: 0,
      uptimePct: 100,
    });

    expect(res.dailyElecCost).toBe(1.20);
    expect(res.dailyOtherCost).toBe(2.50);
    expect(res.dailyTotalOpex).toBe(3.70);
    expect(res.dailyNetProfit).toBe(496.30);
  });

  // 10. Hardware Payback Period in Days & Months
  it('computes simple hardware payback period in days and months', () => {
    const res = calculateMiningProfitability({
      manualDailyCoins: 1.0,
      cryptoPrice: 20, // $20 gross
      powerWatts: 0,
      electricityCost: 0,
      poolFeePct: 0,
      hardwareCost: 600, // $600 rig
      uptimePct: 100,
    });

    expect(res.dailyNetProfit).toBe(20);
    expect(res.paybackDays).toBe(30.0);
    expect(res.paybackMonths).toBeCloseTo(1.0, 0);
    expect(res.annualRoiPct).toBeCloseTo(1216.67, 0);
  });

  // 11. Consistency Across Daily, Monthly, and Annual Projections
  it('ensures mathematical consistency across time horizons', () => {
    const res = calculateMiningProfitability({
      manualDailyCoins: 0.05,
      cryptoPrice: 40000,
      powerWatts: 3000,
      electricityCost: 0.06,
      poolFeePct: 2.0,
      otherDailyCost: 1.0,
      uptimePct: 98,
    });

    expect(res.monthlyGrossRevenue).toBeCloseTo(res.dailyGrossRevenue * (365 / 12), 1);
    expect(res.annualGrossRevenue).toBeCloseTo(res.dailyGrossRevenue * 365, 0);
    expect(res.annualElecCost).toBeCloseTo(res.dailyElecCost * 365, 0);
    expect(res.annualNetProfit).toBeCloseTo(res.dailyNetProfit * 365, 0);
  });

  // 12. Thermodynamic Efficiency Metric (Joules per Terahash)
  it('calculates energy efficiency in J/TH for ASIC hardware', () => {
    const res = calculateMiningProfitability({
      hashrate: 200,
      hashrateUnit: 'TH',
      powerWatts: 3500, // 3500W / 200 TH = 17.5 J/TH
    });

    expect(res.efficiencyJoulePerTh).toBe(17.5);
  });

  // 13. Electricity Cost Per Coin Produced
  it('calculates the marginal electricity cost per coin produced', () => {
    const res = calculateMiningProfitability({
      manualDailyCoins: 0.5,
      powerWatts: 2000, // 48 kWh
      electricityCost: 0.10, // $4.80/day -> $9.60 per coin
      uptimePct: 100,
    });

    expect(res.electricityCostPerCoin).toBe(9.60);
  });

  // 14. Zero Electricity Cost Scenario (Stranded Gas / 100% Free Hydro)
  it('handles zero electricity cost correctly', () => {
    const res = calculateMiningProfitability({
      manualDailyCoins: 1.0,
      cryptoPrice: 50,
      electricityCost: 0,
      powerWatts: 5000,
      poolFeePct: 0,
      uptimePct: 100,
    });

    expect(res.dailyElecCost).toBe(0);
    expect(res.dailyNetProfit).toBe(50);
  });

  // 15. Zero Hardware Cost Scenario
  it('handles zero hardware cost gracefully (0 payback days)', () => {
    const res = calculateMiningProfitability({
      manualDailyCoins: 1.0,
      cryptoPrice: 100,
      hardwareCost: 0,
      electricityCost: 0,
      uptimePct: 100,
    });

    expect(res.paybackDays).toBe(0);
    expect(res.paybackMonths).toBe(0);
    expect(res.annualRoiPct).toBe(100);
  });

  // 16. Negative Input Sanitization
  it('sanitizes negative inputs to 0 safely', () => {
    const res = calculateMiningProfitability({
      hashrate: -50,
      powerWatts: -3000,
      electricityCost: -0.10,
      cryptoPrice: -60000,
      uptimePct: -10,
      hardwareCost: -5000,
    });

    expect(res.hashrate).toBe(0);
    expect(res.powerWatts).toBe(0);
    expect(res.electricityCost).toBe(0);
    expect(res.cryptoPrice).toBe(0);
    expect(res.uptimePct).toBe(0);
    expect(res.hardwareCost).toBe(0);
  });

  // 17. Extreme High Pool Fee Capping (Max 50%)
  it('caps pool fee percentage at 50%', () => {
    const res = calculateMiningProfitability({
      poolFeePct: 80,
    });
    expect(res.poolFeePct).toBe(50);
  });

  // 18. Monero (XMR) Small CPU Mining Scenario
  it('handles small CPU mining parameters with kH/s and low wattage', () => {
    const res = calculateMiningProfitability({
      hashrate: 15,
      hashrateUnit: 'KH',
      powerWatts: 120,
      electricityCost: 0.10,
      cryptoPrice: 150,
      networkHashrate: 2.5,
      networkHashrateUnit: 'GH', // 15,000 / 2,500,000,000 = 6e-6 share
      blockReward: 0.6,
      blocksPerDay: 720,
      txFeesPerBlock: 0,
      uptimePct: 99,
    });

    expect(res.dailyKwh).toBeCloseTo(2.85, 1);
    expect(res.dailyElecCost).toBeCloseTo(0.29, 1);
    expect(res.dailyGrossRevenue).toBeGreaterThan(0);
  });

  // 19. Multi-Currency: INR (₹)
  it('supports INR quote currency and formatting', () => {
    const res = calculateMiningProfitability({
      currency: 'INR',
      electricityCost: 6.5, // ₹6.5/kWh
      cryptoPrice: 5500000,
    });

    expect(res.currency).toBe('INR');
    expect(res.symbol).toBe('₹');
    expect(res.decimals).toBe(2);
  });

  // 20. Multi-Currency: EUR (€)
  it('supports EUR currency symbol', () => {
    const res = calculateMiningProfitability({ currency: 'EUR' });
    expect(res.currency).toBe('EUR');
    expect(res.symbol).toBe('€');
  });

  // 21. Multi-Currency: GBP (£)
  it('supports GBP currency symbol', () => {
    const res = calculateMiningProfitability({ currency: 'GBP' });
    expect(res.currency).toBe('GBP');
    expect(res.symbol).toBe('£');
  });

  // 22. Multi-Currency: JPY (¥)
  it('supports JPY currency with 0 decimals', () => {
    const res = calculateMiningProfitability({ currency: 'JPY' });
    expect(res.currency).toBe('JPY');
    expect(res.symbol).toBe('¥');
    expect(res.decimals).toBe(0);
  });

  // 23. Invalid Currency Fallback to USD
  it('falls back to USD when unrecognized currency is passed', () => {
    const res = calculateMiningProfitability({ currency: 'UNKNOWN_CURR' });
    expect(res.symbol).toBe('$');
  });

  // 24. Recommendation: Negative Cashflow Critical Warning
  it('triggers critical warning when power costs exceed gross revenue', () => {
    const res = calculateMiningProfitability({
      manualDailyCoins: 0.001,
      cryptoPrice: 1000, // $1.00 gross
      powerWatts: 3000,
      electricityCost: 0.10, // $7.20 elec -> -$6.20/day
      uptimePct: 100,
    });

    const rec = res.recommendations.find(r => r.type === 'critical');
    expect(rec).toBeDefined();
    expect(rec?.title).toContain('Power Costs Exceed Gross Revenue');
  });

  // 25. Recommendation: High Power Cost Drag (>75%)
  it('triggers warning when electricity exceeds 75% of revenue', () => {
    const res = calculateMiningProfitability({
      manualDailyCoins: 1.0,
      cryptoPrice: 10, // $10 gross
      powerWatts: 3333.33, // 80 kWh
      electricityCost: 0.10, // $8.00 elec = 80% of revenue
      uptimePct: 100,
    });

    const rec = res.recommendations.find(r => r.type === 'warning');
    expect(rec).toBeDefined();
    expect(rec?.title).toContain('High Power Cost Drag');
  });

  // 26. Recommendation: Favorable Operating Margin
  it('triggers positive recommendation when margin is strong', () => {
    const res = calculateMiningProfitability({
      manualDailyCoins: 1.0,
      cryptoPrice: 100,
      powerWatts: 500,
      electricityCost: 0.05,
      uptimePct: 100,
    });

    const rec = res.recommendations.find(r => r.type === 'positive');
    expect(rec).toBeDefined();
    expect(rec?.title).toContain('Favorable Operating Margin');
  });

  // 27. Recommendation: Network Difficulty & Halving Advisory
  it('always includes network difficulty & halving advisory recommendation', () => {
    const res = calculateMiningProfitability();
    const rec = res.recommendations.find(r => r.title.includes('Dynamic Network Difficulty'));
    expect(rec).toBeDefined();
  });

  // 28. Transaction Fees Included in Block Reward
  it('includes transaction fees per block in daily coin calculation', () => {
    const baseReward = calculateMiningProfitability({
      networkHashrate: 100,
      networkHashrateUnit: 'TH',
      hashrate: 1,
      hashrateUnit: 'TH',
      blockReward: 3.125,
      txFeesPerBlock: 0,
      blocksPerDay: 100,
      uptimePct: 100,
    });

    const withFees = calculateMiningProfitability({
      networkHashrate: 100,
      networkHashrateUnit: 'TH',
      hashrate: 1,
      hashrateUnit: 'TH',
      blockReward: 3.125,
      txFeesPerBlock: 0.5,
      blocksPerDay: 100,
      uptimePct: 100,
    });

    expect(withFees.dailyCoinsGross).toBeGreaterThan(baseReward.dailyCoinsGross);
    expect(withFees.dailyCoinsGross).toBeCloseTo(baseReward.dailyCoinsGross * (3.625 / 3.125), 4);
  });

  // 29. Preset Validation: btc_industrial_s21
  it('validates preset: Bitcoin Next-Gen Industrial ASIC', () => {
    const p = MINING_PROFITABILITY_CONFIG.presets.find(x => x.id === 'btc_industrial_s21');
    expect(p).toBeDefined();
    const res = calculateMiningProfitability(p);
    expect(res.hashrate).toBe(234);
    expect(res.status).toBe('PROFITABLE');
    expect(res.efficiencyJoulePerTh).toBe(15.0);
  });

  // 30. Preset Validation: btc_residential_s19
  it('validates preset: Bitcoin Retail / Home Miner', () => {
    const p = MINING_PROFITABILITY_CONFIG.presets.find(x => x.id === 'btc_residential_s19');
    expect(p).toBeDefined();
    const res = calculateMiningProfitability(p);
    expect(res.hashrate).toBe(140);
    expect(res.efficiencyJoulePerTh).toBe(21.5);
  });

  // 31. Preset Validation: ltc_doge_scrypt
  it('validates preset: Litecoin & Dogecoin Scrypt Merged Mining', () => {
    const p = MINING_PROFITABILITY_CONFIG.presets.find(x => x.id === 'ltc_doge_scrypt');
    expect(p).toBeDefined();
    const res = calculateMiningProfitability(p);
    expect(res.hashrateUnit).toBe('GH');
    expect(res.blocksPerDay).toBe(576);
  });

  // 32. Preset Validation: kas_kheavyhash
  it('validates preset: Kaspa kHeavyHash ASIC', () => {
    const p = MINING_PROFITABILITY_CONFIG.presets.find(x => x.id === 'kas_kheavyhash');
    expect(p).toBeDefined();
    const res = calculateMiningProfitability(p);
    expect(res.assetName).toBe('Kaspa (KAS)');
    expect(res.blocksPerDay).toBe(86400);
  });

  // 33. Preset Validation: xmr_randomx_cpu
  it('validates preset: Monero RandomX CPU', () => {
    const p = MINING_PROFITABILITY_CONFIG.presets.find(x => x.id === 'xmr_randomx_cpu');
    expect(p).toBeDefined();
    const res = calculateMiningProfitability(p);
    expect(res.hashrateUnit).toBe('KH');
    expect(res.powerWatts).toBe(150);
  });

  // 34. Preset Validation: unprofitable_high_power
  it('validates preset: Unprofitable High Power Demo', () => {
    const p = MINING_PROFITABILITY_CONFIG.presets.find(x => x.id === 'unprofitable_high_power');
    expect(p).toBeDefined();
    const res = calculateMiningProfitability(p);
    expect(res.status).toBe('UNPROFITABLE');
    expect(res.dailyNetProfit).toBeLessThan(0);
  });

  // 35. Constants Validation: HASHRATE_UNITS
  it('exposes full HASHRATE_UNITS map with correct exponents', () => {
    expect(HASHRATE_UNITS.H.exponent).toBe(0);
    expect(HASHRATE_UNITS.KH.exponent).toBe(3);
    expect(HASHRATE_UNITS.MH.exponent).toBe(6);
    expect(HASHRATE_UNITS.GH.exponent).toBe(9);
    expect(HASHRATE_UNITS.TH.exponent).toBe(12);
    expect(HASHRATE_UNITS.PH.exponent).toBe(15);
    expect(HASHRATE_UNITS.EH.exponent).toBe(18);
  });

  // 36. Constants Validation: FIAT_CURRENCIES
  it('exposes FIAT_CURRENCIES mapping', () => {
    expect(FIAT_CURRENCIES.USD).toBeDefined();
    expect(FIAT_CURRENCIES.EUR).toBeDefined();
    expect(FIAT_CURRENCIES.INR).toBeDefined();
    expect(FIAT_CURRENCIES.AED.symbol).toBe('د.إ');
  });

  // 37. Alias calculateCryptoMining
  it('exports alias calculateCryptoMining correctly', () => {
    const res = calculateCryptoMining({ manualDailyCoins: 1, cryptoPrice: 50, uptimePct: 100 });
    expect(res.dailyGrossRevenue).toBe(50);
  });

  // 38. Alias calculateBtcMiningProfitability
  it('exports alias calculateBtcMiningProfitability correctly', () => {
    const res = calculateBtcMiningProfitability({ manualDailyCoins: 2, cryptoPrice: 100, uptimePct: 100 });
    expect(res.dailyGrossRevenue).toBe(200);
  });

  // 39. Alias calculateAsicProfitability
  it('exports alias calculateAsicProfitability correctly', () => {
    const res = calculateAsicProfitability({ manualDailyCoins: 0.5, cryptoPrice: 1000, uptimePct: 100 });
    expect(res.dailyGrossRevenue).toBe(500);
  });

  // 40. Zero Network Hashrate Protection
  it('safely handles zero network hashrate without division by zero errors', () => {
    const res = calculateMiningProfitability({
      networkHashrate: 0,
      hashrate: 100,
    });
    expect(res.dailyCoinsGross).toBe(0);
    expect(res.dailyGrossRevenue).toBe(0);
  });

  // 41. Zero Miner Hashrate Protection
  it('safely handles zero miner hashrate without crashing', () => {
    const res = calculateMiningProfitability({
      hashrate: 0,
      networkHashrate: 650,
    });
    expect(res.dailyCoinsGross).toBe(0);
    expect(res.efficiencyJoulePerTh).toBeNull();
  });

  // 42. Total Cost Per Coin Produced
  it('calculates total cost (electricity + fees + maintenance) per coin produced', () => {
    const res = calculateMiningProfitability({
      manualDailyCoins: 0.1,
      powerWatts: 1000, // 24 kWh @ $0.10 = $2.40
      electricityCost: 0.10,
      otherDailyCost: 0.60, // Total cost = $3.00 -> $30.00/coin
      poolFeePct: 0,
      uptimePct: 100,
    });

    expect(res.totalCostPerCoin).toBe(30.00);
  });

  // 43. Uptime Upper Bound Capping
  it('caps uptime at 100%', () => {
    const res = calculateMiningProfitability({
      uptimePct: 150,
      powerWatts: 1000,
      electricityCost: 0.10,
    });
    expect(res.uptimePct).toBe(100);
    expect(res.dailyKwh).toBe(24);
  });

  // 44. Configuration Metadata Validation
  it('validates configuration object integrity and preset length', () => {
    expect(MINING_PROFITABILITY_CONFIG.id).toBe('mining-profitability-calculator');
    expect(MINING_PROFITABILITY_CONFIG.category).toBe('crypto');
    expect(MINING_PROFITABILITY_CONFIG.presets.length).toBe(6);
  });

  // 45. Complete Lifecycle Simulation
  it('simulates complete multi-variable mining balance sheet', () => {
    const res = calculateMiningProfitability({
      hashrate: 200,
      hashrateUnit: 'TH',
      powerWatts: 3500,
      electricityCost: 0.06,
      cryptoPrice: 65000,
      uptimePct: 98,
      poolFeePct: 2.0,
      hardwareCost: 3500,
      otherDailyCost: 0.50,
      networkHashrate: 650,
      networkHashrateUnit: 'EH',
      blockReward: 3.125,
      blocksPerDay: 144,
      txFeesPerBlock: 0.25,
    });

    expect(res.dailyKwh).toBeCloseTo(82.32, 1);
    expect(res.dailyElecCost).toBeCloseTo(4.94, 1);
    expect(res.dailyTotalOpex).toBeGreaterThan(5.0);
    expect(res.dailyGrossRevenue).toBeGreaterThan(0);
    expect(res.breakEvenCryptoPrice).toBeGreaterThan(0);
  });
});
