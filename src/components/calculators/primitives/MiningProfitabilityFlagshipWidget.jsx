import { useState, useMemo } from 'preact/hooks';
import {
  calculateMiningProfitability,
  HASHRATE_UNITS,
  FIAT_CURRENCIES,
} from '../../../calculators/crypto/mining-profitability-calculator.js';
import { MINING_PROFITABILITY_CONFIG } from '../../../calculators/configs/mining-profitability-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

export default function MiningProfitabilityFlagshipWidget() {
  const [activePreset, setActivePreset] = useState('btc_industrial_s21');

  const [assetName, setAssetName] = useState('Bitcoin (BTC)');
  const [hashrate, setHashrate] = useState(234);
  const [hashrateUnit, setHashrateUnit] = useState('TH');
  const [powerWatts, setPowerWatts] = useState(3510);
  const [electricityCost, setElectricityCost] = useState(0.05);
  const [cryptoPrice, setCryptoPrice] = useState(65000);
  const [uptimePct, setUptimePct] = useState(99);
  const [poolFeePct, setPoolFeePct] = useState(1.5);
  const [hardwareCost, setHardwareCost] = useState(4200);
  const [otherDailyCost, setOtherDailyCost] = useState(0.5);

  // Network Assumptions
  const [networkHashrate, setNetworkHashrate] = useState(650);
  const [networkHashrateUnit, setNetworkHashrateUnit] = useState('EH');
  const [blockReward, setBlockReward] = useState(3.125);
  const [blocksPerDay, setBlocksPerDay] = useState(144);
  const [txFeesPerBlock, setTxFeesPerBlock] = useState(0.25);
  const [currency, setCurrency] = useState('USD');
  const [showNetworkSettings, setShowNetworkSettings] = useState(false);

  // URL Sync
  useUrlSync(
    {
      assetName,
      hashrate,
      hashrateUnit,
      powerWatts,
      electricityCost,
      cryptoPrice,
      uptimePct,
      poolFeePct,
      hardwareCost,
      otherDailyCost,
      networkHashrate,
      networkHashrateUnit,
      blockReward,
      blocksPerDay,
      currency,
    },
    (params) => {
      if (params.assetName) setAssetName(params.assetName);
      if (params.hashrate !== undefined) setHashrate(Number(params.hashrate) || 200);
      if (params.hashrateUnit) setHashrateUnit(params.hashrateUnit);
      if (params.powerWatts !== undefined) setPowerWatts(Number(params.powerWatts) || 3500);
      if (params.electricityCost !== undefined) setElectricityCost(Number(params.electricityCost) || 0.06);
      if (params.cryptoPrice !== undefined) setCryptoPrice(Number(params.cryptoPrice) || 65000);
      if (params.uptimePct !== undefined) setUptimePct(Number(params.uptimePct) || 99);
      if (params.poolFeePct !== undefined) setPoolFeePct(Number(params.poolFeePct) || 2.0);
      if (params.hardwareCost !== undefined) setHardwareCost(Number(params.hardwareCost) || 3500);
      if (params.otherDailyCost !== undefined) setOtherDailyCost(Number(params.otherDailyCost) || 0);
      if (params.networkHashrate !== undefined) setNetworkHashrate(Number(params.networkHashrate) || 650);
      if (params.networkHashrateUnit) setNetworkHashrateUnit(params.networkHashrateUnit);
      if (params.blockReward !== undefined) setBlockReward(Number(params.blockReward) || 3.125);
      if (params.blocksPerDay !== undefined) setBlocksPerDay(Number(params.blocksPerDay) || 144);
      if (params.currency) setCurrency(params.currency);
      setActivePreset('');
    }
  );

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setAssetName(p.assetName);
    setHashrate(p.hashrate);
    setHashrateUnit(p.hashrateUnit);
    setPowerWatts(p.powerWatts);
    setElectricityCost(p.electricityCost);
    setCryptoPrice(p.cryptoPrice);
    setUptimePct(p.uptimePct);
    setPoolFeePct(p.poolFeePct);
    setHardwareCost(p.hardwareCost);
    setOtherDailyCost(p.otherDailyCost);
    setNetworkHashrate(p.networkHashrate);
    setNetworkHashrateUnit(p.networkHashrateUnit);
    setBlockReward(p.blockReward);
    setBlocksPerDay(p.blocksPerDay);
    setTxFeesPerBlock(p.txFeesPerBlock);
    setCurrency(p.currency);
  };

  const results = useMemo(() => {
    return calculateMiningProfitability({
      assetName,
      hashrate,
      hashrateUnit,
      powerWatts,
      electricityCost,
      cryptoPrice,
      uptimePct,
      poolFeePct,
      hardwareCost,
      otherDailyCost,
      networkHashrate,
      networkHashrateUnit,
      blockReward,
      blocksPerDay,
      txFeesPerBlock,
      currency,
    });
  }, [
    assetName,
    hashrate,
    hashrateUnit,
    powerWatts,
    electricityCost,
    cryptoPrice,
    uptimePct,
    poolFeePct,
    hardwareCost,
    otherDailyCost,
    networkHashrate,
    networkHashrateUnit,
    blockReward,
    blocksPerDay,
    txFeesPerBlock,
    currency,
  ]);

  const currMeta = FIAT_CURRENCIES[currency] || FIAT_CURRENCIES.USD;
  const sym = currMeta.symbol;
  const decimals = currMeta.decimals;

  return (
    <div class="space-y-10">
      {/* PRESETS */}
      <section class="space-y-3" role="region" aria-label="Preset scenarios">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted">
            Representative PoW Hardware &amp; Network Archetypes
          </span>
          <span class="text-xs font-mono text-primary font-semibold">1-Tap Auto Fill</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MINING_PROFITABILITY_CONFIG.presets.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                class={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20'
                    : 'bg-canvas border-hairline hover:border-primary/50 text-ink shadow-soft'
                }`}
                aria-pressed={isSelected}
              >
                <div class="flex items-center justify-between">
                  <span class="text-xl" aria-hidden="true">{p.icon}</span>
                </div>
                <div>
                  <span class="font-heading font-bold text-xs block text-ink">{p.label}</span>
                  <span class="text-[10px] font-mono block mt-0.5 text-muted">{p.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* HERO VERDICT BANNER */}
      <div class={`p-6 sm:p-8 rounded-3xl border-2 shadow-soft space-y-3 ${
        results.status === 'PROFITABLE'
          ? 'bg-gradient-to-br from-emerald-500/10 via-canvas to-primary/10 border-emerald-500/40'
          : results.status === 'UNPROFITABLE'
          ? 'bg-gradient-to-br from-rose-500/10 via-canvas to-amber-500/10 border-rose-500/40'
          : 'bg-gradient-to-br from-primary/10 via-canvas to-surface-strong border-primary/40'
      }`}>
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-white font-mono text-xs font-bold uppercase ${
            results.status === 'PROFITABLE' ? 'bg-emerald-600' : results.status === 'UNPROFITABLE' ? 'bg-rose-600' : 'bg-primary'
          }`}>
            ⛏️ {results.assetName} · {results.hashrate} {results.hashrateUnit}/s ({results.powerWatts}W)
          </span>
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase text-primary bg-surface-strong">
            BREAK-EVEN: {sym}{results.breakEvenCryptoPrice.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
          </span>
        </div>
        <h2 class={`text-2xl sm:text-4xl font-heading font-extrabold leading-tight ${
          results.status === 'PROFITABLE' ? 'text-emerald-700' : results.status === 'UNPROFITABLE' ? 'text-rose-700' : 'text-ink'
        }`}>
          {results.heroVerdict}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Generates ~<strong>{results.dailyCoinsGross.toFixed(6)} coins/day</strong> ({sym}{results.dailyGrossRevenue.toLocaleString()} gross revenue)
          consuming <strong>{results.dailyKwh.toFixed(1)} kWh/day</strong> at a power cost of {sym}{results.dailyElecCost.toLocaleString()}/day ({sym}{results.electricityCostPerCoin.toLocaleString()}/coin).
        </p>
        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Daily Gross Revenue</span>
            <span class="text-sm font-bold text-ink">{sym}{results.dailyGrossRevenue.toLocaleString()}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Daily Power Cost</span>
            <span class="text-sm font-bold text-rose-600">-{sym}{results.dailyElecCost.toLocaleString()}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Daily Net Profit</span>
            <span class={`text-sm font-black ${results.status === 'PROFITABLE' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {results.dailyNetProfit >= 0 ? '+' : ''}{sym}{results.dailyNetProfit.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Hardware Payback</span>
            <span class="text-sm font-bold text-primary">
              {results.paybackMonths !== null ? `${results.paybackMonths} mo` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* INPUT CONTROLS & SIDE-BY-SIDE ANALYTICS */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Hardware &amp; Energy Inputs</h3>
            <div class="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Shareable mining scenario URL copied to clipboard!');
                  }
                }}
                class="px-3 py-1.5 bg-surface-strong hover:bg-hairline text-ink text-xs font-semibold rounded-pill transition-colors flex items-center gap-1.5 border border-hairline focus:outline-none focus:ring-2 focus:ring-primary"
                title="Copy shareable scenario URL"
              >
                <svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  applyPreset(MINING_PROFITABILITY_CONFIG.presets[0]);
                }}
                class="px-3 py-1.5 bg-surface-strong hover:bg-hairline text-muted hover:text-ink text-xs font-semibold rounded-pill transition-colors border border-hairline focus:outline-none focus:ring-2 focus:ring-primary"
                title="Reset to defaults"
              >
                Reset
              </button>
            </div>
          </div>

          <div class="space-y-4">
            {/* HASHRATE & UNIT */}
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label for="miner-hashrate" class="text-sm font-semibold text-ink">
                  Hardware Hashrate
                </label>
                <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                  <input
                    type="number"
                    id="miner-hashrate"
                    value={hashrate}
                    min="0"
                    step="1"
                    onInput={(e) => {
                      setHashrate(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-24 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  />
                  <select
                    id="hashrate-unit-select"
                    value={hashrateUnit}
                    onChange={(e) => {
                      setHashrateUnit(e.currentTarget.value);
                      setActivePreset('');
                    }}
                    class="ml-1.5 bg-transparent font-mono text-xs font-bold text-primary focus:outline-none cursor-pointer"
                  >
                    {Object.keys(HASHRATE_UNITS).map((u) => (
                      <option key={u} value={u}>{HASHRATE_UNITS[u].label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* POWER CONSUMPTION & EFFICIENCY */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label for="power-watts" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                    Power (Watts)
                  </label>
                  {results.efficiencyJoulePerTh !== null && (
                    <span class="text-[10px] font-mono text-primary font-bold">
                      {results.efficiencyJoulePerTh} J/TH
                    </span>
                  )}
                </div>
                <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                  <input
                    type="number"
                    id="power-watts"
                    value={powerWatts}
                    min="0"
                    step="50"
                    onInput={(e) => {
                      setPowerWatts(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  />
                  <span class="text-xs font-mono text-muted ml-1.5 font-bold">W</span>
                </div>
              </div>

              {/* ELECTRICITY COST */}
              <div class="space-y-1.5">
                <label for="electricity-cost" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Power Rate ({sym}/kWh)
                </label>
                <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                  <span class="text-xs font-mono text-muted mr-1 font-bold">{sym}</span>
                  <input
                    type="number"
                    id="electricity-cost"
                    value={electricityCost}
                    min="0"
                    step="0.01"
                    onInput={(e) => {
                      setElectricityCost(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  />
                  <span class="text-xs font-mono text-muted ml-1.5 font-bold">/kWh</span>
                </div>
              </div>
            </div>

            {/* CRYPTO PRICE & CURRENCY */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="crypto-coin-price" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Coin Price ({sym})
                </label>
                <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                  <span class="text-xs font-mono text-muted mr-1 font-bold">{sym}</span>
                  <input
                    type="number"
                    id="crypto-coin-price"
                    value={cryptoPrice}
                    min="0"
                    step="100"
                    onInput={(e) => {
                      setCryptoPrice(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label for="mining-currency-select" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Fiat Currency
                </label>
                <select
                  id="mining-currency-select"
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.keys(FIAT_CURRENCIES).map((code) => {
                    const c = FIAT_CURRENCIES[code];
                    return (
                      <option key={code} value={code}>
                        {c.code} ({c.symbol} - {c.name})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* POOL FEE & HARDWARE COST */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="pool-fee-pct" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Pool Fee (%)
                </label>
                <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                  <input
                    type="number"
                    id="pool-fee-pct"
                    value={poolFeePct}
                    min="0"
                    max="20"
                    step="0.5"
                    onInput={(e) => {
                      setPoolFeePct(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  />
                  <span class="text-xs font-mono text-muted ml-1 font-bold">%</span>
                </div>
              </div>

              <div class="space-y-1.5">
                <label for="hardware-cost" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Hardware CAPEX ({sym})
                </label>
                <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                  <span class="text-xs font-mono text-muted mr-1 font-bold">{sym}</span>
                  <input
                    type="number"
                    id="hardware-cost"
                    value={hardwareCost}
                    min="0"
                    step="100"
                    onInput={(e) => {
                      setHardwareCost(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* NETWORK ASSUMPTIONS ACCORDION */}
            <div class="pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setShowNetworkSettings(!showNetworkSettings)}
                class="text-xs font-mono text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{showNetworkSettings ? '▲ Hide' : '▼ Customize'} Network Difficulty &amp; Block Reward Settings</span>
              </button>

              {showNetworkSettings && (
                <div class="mt-4 p-4 bg-surface-soft rounded-2xl border border-hairline space-y-4">
                  <div class="grid sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label for="network-hashrate" class="text-xs font-mono text-muted uppercase font-bold block">
                        Network Hashrate
                      </label>
                      <div class="flex items-center bg-canvas px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                        <input
                          type="number"
                          id="network-hashrate"
                          value={networkHashrate}
                          min="0"
                          step="10"
                          onInput={(e) => {
                            setNetworkHashrate(Number(e.currentTarget.value) || 0);
                            setActivePreset('');
                          }}
                          class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                        />
                        <select
                          id="network-hashrate-unit-select"
                          value={networkHashrateUnit}
                          onChange={(e) => {
                            setNetworkHashrateUnit(e.currentTarget.value);
                            setActivePreset('');
                          }}
                          class="ml-1 bg-transparent font-mono text-xs font-bold text-primary focus:outline-none cursor-pointer"
                        >
                          {Object.keys(HASHRATE_UNITS).map((u) => (
                            <option key={u} value={u}>{HASHRATE_UNITS[u].label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <label for="block-reward" class="text-xs font-mono text-muted uppercase font-bold block">
                        Block Reward Subsidy
                      </label>
                      <input
                        type="number"
                        id="block-reward"
                        value={blockReward}
                        min="0"
                        step="0.125"
                        onInput={(e) => {
                          setBlockReward(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div class="grid sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label for="blocks-per-day" class="text-xs font-mono text-muted uppercase font-bold block">
                        Blocks Per 24h
                      </label>
                      <input
                        type="number"
                        id="blocks-per-day"
                        value={blocksPerDay}
                        min="0"
                        step="1"
                        onInput={(e) => {
                          setBlocksPerDay(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div class="space-y-1.5">
                      <label for="hardware-uptime" class="text-xs font-mono text-muted uppercase font-bold block">
                        Rig Uptime (%)
                      </label>
                      <input
                        type="number"
                        id="hardware-uptime"
                        value={uptimePct}
                        min="0"
                        max="100"
                        step="1"
                        onInput={(e) => {
                          setUptimePct(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PERFORMANCE ANALYTICS & BREAK-EVEN */}
        <div class="lg:col-span-6 space-y-6">
          {/* BREAK-EVEN & TARGET BENCHMARK CARD */}
          <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
            <h3 class="text-xl font-bold font-heading text-ink">Thermodynamic &amp; Financial Payback</h3>
            
            <div class="grid grid-cols-2 gap-3 font-mono text-center">
              <div class="p-4 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Shutdown Price</span>
                <span class="text-base sm:text-lg font-extrabold text-primary block mt-1">
                  {sym}{results.breakEvenCryptoPrice.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[10px] text-muted block mt-0.5">Zero net profit threshold</span>
              </div>

              <div class="p-4 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Power Cost / Coin</span>
                <span class="text-base sm:text-lg font-extrabold text-ink block mt-1">
                  {sym}{results.electricityCostPerCoin.toLocaleString()}
                </span>
                <span class="text-[10px] text-muted block mt-0.5">Total Cost: {sym}{results.totalCostPerCoin.toLocaleString()}</span>
              </div>
            </div>

            {/* MONTHLY & ANNUAL PROJECTIONS */}
            <div class="space-y-3 pt-2">
              <span class="text-xs font-mono font-bold uppercase text-muted block">
                Time Horizon Cashflow Forecast
              </span>

              {/* Monthly Summary */}
              <div class="space-y-1 p-3 rounded-2xl bg-surface-strong/60 border border-hairline">
                <div class="flex items-center justify-between text-xs font-semibold">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span class="text-ink">Monthly Net Cashflow (30.4 days)</span>
                  </div>
                  <span className={`font-mono font-bold ${results.status === 'PROFITABLE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {results.monthlyNetProfit >= 0 ? '+' : ''}{sym}{results.monthlyNetProfit.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                  </span>
                </div>
              </div>

              {/* Annual Summary */}
              <div class="space-y-1 p-3 rounded-2xl bg-surface-strong/60 border border-hairline">
                <div class="flex items-center justify-between text-xs font-semibold">
                  <div class="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${results.status === 'PROFITABLE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span class="text-ink">Annual Net Cashflow (365 days)</span>
                  </div>
                  <span className={`font-mono font-bold ${results.status === 'PROFITABLE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {results.annualNetProfit >= 0 ? '+' : ''}{sym}{results.annualNetProfit.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONABLE RECOMMENDATIONS */}
          <div class="space-y-3">
            {results.recommendations.map((r, idx) => (
              <div
                key={idx}
                class={`p-4 rounded-2xl border text-xs space-y-1 ${
                  r.type === 'positive'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900'
                    : r.type === 'critical'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-900'
                    : r.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-900'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-900'
                }`}
              >
                <div class="font-bold font-heading flex items-center gap-1.5">
                  <span>{r.type === 'positive' ? '✅' : r.type === 'critical' ? '🚨' : r.type === 'warning' ? '⚠️' : '💡'}</span>
                  <span>{r.title}</span>
                </div>
                <p class="leading-relaxed text-body">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ITEMIZED MINING CASHFLOW AUDIT MATRIX */}
      <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">Comprehensive Mining Statement &amp; OPEX Ledger</h3>
            <p class="text-xs text-muted mt-0.5">Itemized statement of crypto production, electricity usage, pool fees, and bottom-line earnings</p>
          </div>
          <span class="text-xs font-mono font-bold text-primary bg-surface-strong px-3 py-1 rounded-pill border border-hairline">
            OPEX STATEMENT
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr class="border-b border-hairline bg-surface-soft text-muted uppercase">
                <th class="py-2.5 px-3">Revenue &amp; Cost Category</th>
                <th class="py-2.5 px-3 text-right">Daily (24h)</th>
                <th class="py-2.5 px-3 text-right">Monthly (30.4d)</th>
                <th class="py-2.5 px-3 text-right">Annual (365d)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">Estimated Coins Mined</td>
                <td class="py-2.5 px-3 text-right font-bold text-ink">{results.dailyCoinsGross.toFixed(6)}</td>
                <td class="py-2.5 px-3 text-right text-muted">{results.monthlyCoinsGross.toFixed(5)}</td>
                <td class="py-2.5 px-3 text-right text-muted">{results.annualCoinsGross.toFixed(4)}</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-primary">1. Gross Mining Revenue</td>
                <td class="py-2.5 px-3 text-right font-bold text-primary">{sym}{results.dailyGrossRevenue.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-right font-bold text-primary">{sym}{results.monthlyGrossRevenue.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-right font-bold text-primary">{sym}{results.annualGrossRevenue.toLocaleString()}</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-rose-600">2. Electricity Cost ({results.dailyKwh.toFixed(1)} kWh/d @ {sym}{results.electricityCost}/kWh)</td>
                <td class="py-2.5 px-3 text-right text-rose-600 font-bold">-{sym}{results.dailyElecCost.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-right text-rose-600">-{sym}{results.monthlyElecCost.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-right text-rose-600">-{sym}{results.annualElecCost.toLocaleString()}</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-amber-600">3. Mining Pool Fees ({results.poolFeePct}%)</td>
                <td class="py-2.5 px-3 text-right text-amber-600 font-bold">-{sym}{results.dailyPoolFee.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-right text-amber-600">-{sym}{results.monthlyPoolFee.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-right text-amber-600">-{sym}{results.annualPoolFee.toLocaleString()}</td>
              </tr>
              {results.dailyOtherCost > 0 && (
                <tr class="hover:bg-surface-soft/50 transition-colors">
                  <td class="py-2.5 px-3 font-bold text-muted">4. Facility &amp; Maintenance Costs</td>
                  <td class="py-2.5 px-3 text-right text-muted">-{sym}{results.dailyOtherCost.toLocaleString()}</td>
                  <td class="py-2.5 px-3 text-right text-muted">-{sym}{results.monthlyOtherCost.toLocaleString()}</td>
                  <td class="py-2.5 px-3 text-right text-muted">-{sym}{results.annualOtherCost.toLocaleString()}</td>
                </tr>
              )}
              <tr class="border-t-2 border-hairline font-bold bg-surface-soft/60">
                <td class="py-3 px-3 text-ink uppercase text-sm">Net Mining Profit / (Loss)</td>
                <td className={`py-3 px-3 text-right font-black text-sm ${results.status === 'PROFITABLE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {results.dailyNetProfit >= 0 ? '+' : ''}{sym}{results.dailyNetProfit.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </td>
                <td className={`py-3 px-3 text-right font-black text-sm ${results.status === 'PROFITABLE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {results.monthlyNetProfit >= 0 ? '+' : ''}{sym}{results.monthlyNetProfit.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </td>
                <td className={`py-3 px-3 text-right font-black text-sm ${results.status === 'PROFITABLE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {results.annualNetProfit >= 0 ? '+' : ''}{sym}{results.annualNetProfit.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
