import { useState, useMemo } from 'preact/hooks';
import {
  calculateYieldFarming,
  COMPOUNDING_FREQUENCIES,
  FIAT_CURRENCIES,
} from '../../../calculators/crypto/yield-farming-apy-calculator.js';
import { YIELD_FARMING_APY_CONFIG } from '../../../calculators/configs/yield-farming-apy-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

export default function YieldFarmingApyFlagshipWidget() {
  const [activePreset, setActivePreset] = useState('daily_compounding_20apr');

  const [poolName, setPoolName] = useState('Yearn / Beefy Auto-Vault');
  const [rateMode, setRateMode] = useState('APR');
  const [interestRate, setInterestRate] = useState(20);
  const [compoundingFrequency, setCompoundingFrequency] = useState('DAILY');
  const [initialDeposit, setInitialDeposit] = useState(10000);
  const [farmingDurationDays, setFarmingDurationDays] = useState(90);
  const [depositFeePct, setDepositFeePct] = useState(0);
  const [performanceFeePct, setPerformanceFeePct] = useState(2);
  const [withdrawalFeePct, setWithdrawalFeePct] = useState(0);
  const [isRewardTokenVolatile, setIsRewardTokenVolatile] = useState(false);
  const [initialRewardTokenPrice, setInitialRewardTokenPrice] = useState(10);
  const [finalRewardTokenPrice, setFinalRewardTokenPrice] = useState(10);
  const [isLpMode, setIsLpMode] = useState(false);
  const [lpPriceRatio, setLpPriceRatio] = useState(1.0);
  const [currency, setCurrency] = useState('USD');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // URL Sync
  useUrlSync(
    {
      poolName,
      rateMode,
      interestRate,
      compoundingFrequency,
      initialDeposit,
      farmingDurationDays,
      depositFeePct,
      performanceFeePct,
      withdrawalFeePct,
      isRewardTokenVolatile,
      initialRewardTokenPrice,
      finalRewardTokenPrice,
      isLpMode,
      lpPriceRatio,
      currency,
    },
    (params) => {
      if (params.poolName) setPoolName(params.poolName);
      if (params.rateMode) setRateMode(params.rateMode);
      if (params.interestRate !== undefined) setInterestRate(Number(params.interestRate) || 20);
      if (params.compoundingFrequency) setCompoundingFrequency(params.compoundingFrequency);
      if (params.initialDeposit !== undefined) setInitialDeposit(Number(params.initialDeposit) || 10000);
      if (params.farmingDurationDays !== undefined) setFarmingDurationDays(Number(params.farmingDurationDays) || 90);
      if (params.depositFeePct !== undefined) setDepositFeePct(Number(params.depositFeePct) || 0);
      if (params.performanceFeePct !== undefined) setPerformanceFeePct(Number(params.performanceFeePct) || 0);
      if (params.withdrawalFeePct !== undefined) setWithdrawalFeePct(Number(params.withdrawalFeePct) || 0);
      if (params.isRewardTokenVolatile !== undefined) setIsRewardTokenVolatile(params.isRewardTokenVolatile === 'true' || params.isRewardTokenVolatile === true);
      if (params.initialRewardTokenPrice !== undefined) setInitialRewardTokenPrice(Number(params.initialRewardTokenPrice) || 10);
      if (params.finalRewardTokenPrice !== undefined) setFinalRewardTokenPrice(Number(params.finalRewardTokenPrice) || 10);
      if (params.isLpMode !== undefined) setIsLpMode(params.isLpMode === 'true' || params.isLpMode === true);
      if (params.lpPriceRatio !== undefined) setLpPriceRatio(Number(params.lpPriceRatio) || 1.0);
      if (params.currency) setCurrency(params.currency);
      setActivePreset('');
    }
  );

  const applyPreset = (p) => {
    setActivePreset(p.id);
    if (p.poolName) setPoolName(p.poolName);
    if (p.rateMode) setRateMode(p.rateMode);
    if (p.interestRate !== undefined) setInterestRate(p.interestRate);
    if (p.compoundingFrequency) setCompoundingFrequency(p.compoundingFrequency);
    if (p.initialDeposit !== undefined) setInitialDeposit(p.initialDeposit);
    if (p.farmingDurationDays !== undefined) setFarmingDurationDays(p.farmingDurationDays);
    if (p.depositFeePct !== undefined) setDepositFeePct(p.depositFeePct);
    if (p.performanceFeePct !== undefined) setPerformanceFeePct(p.performanceFeePct);
    if (p.withdrawalFeePct !== undefined) setWithdrawalFeePct(p.withdrawalFeePct);
    if (p.isRewardTokenVolatile !== undefined) setIsRewardTokenVolatile(p.isRewardTokenVolatile);
    if (p.initialRewardTokenPrice !== undefined) setInitialRewardTokenPrice(p.initialRewardTokenPrice);
    if (p.finalRewardTokenPrice !== undefined) setFinalRewardTokenPrice(p.finalRewardTokenPrice);
    if (p.isLpMode !== undefined) setIsLpMode(p.isLpMode);
    if (p.lpPriceRatio !== undefined) setLpPriceRatio(p.lpPriceRatio);
    if (p.currency) setCurrency(p.currency);
  };

  const results = useMemo(() => {
    return calculateYieldFarming({
      poolName,
      rateMode,
      interestRate,
      compoundingFrequency,
      initialDeposit,
      farmingDurationDays,
      depositFeePct,
      performanceFeePct,
      withdrawalFeePct,
      isRewardTokenVolatile,
      initialRewardTokenPrice,
      finalRewardTokenPrice,
      isLpMode,
      lpPriceRatio,
      currency,
    });
  }, [
    poolName,
    rateMode,
    interestRate,
    compoundingFrequency,
    initialDeposit,
    farmingDurationDays,
    depositFeePct,
    performanceFeePct,
    withdrawalFeePct,
    isRewardTokenVolatile,
    initialRewardTokenPrice,
    finalRewardTokenPrice,
    isLpMode,
    lpPriceRatio,
    currency,
  ]);

  const currMeta = FIAT_CURRENCIES[currency] || FIAT_CURRENCIES.USD;
  const sym = currMeta.symbol;
  const decimals = currMeta.decimals;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  return (
    <div class="space-y-10">
      {/* PRESET SCENARIO SELECTOR */}
      <section class="space-y-3" role="region" aria-label="Preset Farming Scenarios">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted">
            Representative DeFi Yield Farming Presets
          </span>
          <span class="text-xs font-mono text-primary font-semibold">1-Tap Fill</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {YIELD_FARMING_APY_CONFIG.presets.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                class={`p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                    : 'border-hairline bg-surface hover:border-primary/40 hover:bg-surface-soft'
                }`}
              >
                <div class="flex items-center gap-1.5 mb-1">
                  <span class="text-base">{p.icon}</span>
                  <span class="text-xs font-heading font-bold text-ink truncate">{p.label}</span>
                </div>
                <span class="text-[10px] font-sans text-muted leading-tight line-clamp-2">{p.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* MAIN TWO-COLUMN WORKBENCH */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: INPUTS & PARAMETERS */}
        <div class="lg:col-span-6 space-y-6">
          <div class="bg-surface border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-4">
              <h3 class="text-lg font-bold font-heading text-ink">Yield Farming Parameters</h3>
              <div class="flex items-center gap-1.5 bg-surface-soft p-1 rounded-xl border border-hairline">
                <button
                  type="button"
                  onClick={() => {
                    setRateMode('APR');
                    setActivePreset('');
                  }}
                  class={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    rateMode === 'APR'
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Enter APR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRateMode('APY');
                    setActivePreset('');
                  }}
                  class={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    rateMode === 'APY'
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Enter APY
                </button>
              </div>
            </div>

            {/* CAPITAL & CURRENCY */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label for="initial-deposit-input" class="text-[11px] font-mono font-bold text-muted uppercase tracking-wider">
                    Initial Deposit Capital
                  </label>
                  <span class="text-xs font-mono font-bold text-primary">
                    {sym}{initialDeposit.toLocaleString()}
                  </span>
                </div>
                <div class="flex items-center bg-surface-strong px-3 py-2 rounded-xl border border-hairline focus-within:border-primary">
                  <span class="text-xs font-mono text-muted mr-1.5 font-bold">{sym}</span>
                  <input
                    type="number"
                    id="initial-deposit-input"
                    value={initialDeposit}
                    min="1"
                    step="500"
                    onInput={(e) => {
                      setInitialDeposit(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label for="currency-select" class="text-[11px] font-mono font-bold text-muted uppercase tracking-wider block">
                  Quote Currency
                </label>
                <select
                  id="currency-select"
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink"
                >
                  {Object.keys(FIAT_CURRENCIES).map((c) => (
                    <option key={c} value={c}>
                      {c} ({FIAT_CURRENCIES[c].symbol}) - {FIAT_CURRENCIES[c].name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* QUOTED RATE & COMPOUNDING FREQUENCY */}
            <div class="space-y-4 p-4 bg-surface-soft rounded-2xl border border-hairline">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-ink uppercase">
                  Quoted {rateMode} Rate &amp; Frequency
                </span>
                <span class="text-xs font-mono font-bold text-primary">
                  {interestRate}% {rateMode}
                </span>
              </div>

              <div class="space-y-2">
                <input
                  type="range"
                  id="rate-slider"
                  aria-label="Quoted Rate Slider"
                  min="0"
                  max="200"
                  step="0.5"
                  value={interestRate}
                  onInput={(e) => {
                    setInterestRate(Number(e.currentTarget.value));
                    setActivePreset('');
                  }}
                  class="w-full accent-primary cursor-pointer"
                />
                <div class="flex justify-between text-[10px] font-mono text-muted">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                  <span>200%</span>
                </div>
              </div>

              <div class="grid sm:grid-cols-2 gap-4 pt-2">
                <div class="space-y-1">
                  <label for="rate-number-input" class="text-[10px] font-mono text-muted uppercase block">
                    Exact {rateMode} (%)
                  </label>
                  <input
                    type="number"
                    id="rate-number-input"
                    value={interestRate}
                    min="0"
                    max="10000"
                    step="0.1"
                    onInput={(e) => {
                      setInterestRate(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                  />
                </div>

                <div class="space-y-1">
                  <label for="freq-select" class="text-[10px] font-mono text-muted uppercase block">
                    Compounding Schedule
                  </label>
                  <select
                    id="freq-select"
                    value={compoundingFrequency}
                    onChange={(e) => {
                      setCompoundingFrequency(e.currentTarget.value);
                      setActivePreset('');
                    }}
                    class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink"
                  >
                    {Object.keys(COMPOUNDING_FREQUENCIES).map((k) => (
                      <option key={k} value={k}>
                        {COMPOUNDING_FREQUENCIES[k].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* FARMING DURATION */}
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label for="duration-input" class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                  Farming Duration (Days)
                </label>
                <span class="text-xs font-mono font-bold text-ink">{farmingDurationDays} Days ({(farmingDurationDays / 30.4375).toFixed(1)} Months)</span>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  id="duration-input"
                  value={farmingDurationDays}
                  min="1"
                  max="3650"
                  step="1"
                  onInput={(e) => {
                    setFarmingDurationDays(Number(e.currentTarget.value) || 1);
                    setActivePreset('');
                  }}
                  class="w-32 p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                />
                <div class="flex gap-1 flex-1 overflow-x-auto pb-1">
                  {[7, 30, 90, 180, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setFarmingDurationDays(d);
                        setActivePreset('');
                      }}
                      class={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        farmingDurationDays === d
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface border-hairline text-muted hover:text-ink'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MULTI-TIER FEE DECOMPOSITION */}
            <div class="space-y-4 p-4 bg-surface-soft rounded-2xl border border-hairline">
              <span class="text-xs font-mono font-bold text-primary uppercase block">
                Protocol &amp; Platform Fee Structure (%)
              </span>

              <div class="grid grid-cols-3 gap-3">
                <div class="space-y-1">
                  <label for="deposit-fee-input" class="text-[10px] font-mono text-muted uppercase block truncate">
                    Deposit Fee (%)
                  </label>
                  <input
                    type="number"
                    id="deposit-fee-input"
                    value={depositFeePct}
                    min="0"
                    max="50"
                    step="0.25"
                    onInput={(e) => {
                      setDepositFeePct(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                  />
                </div>

                <div class="space-y-1">
                  <label for="perf-fee-input" class="text-[10px] font-mono text-muted uppercase block truncate">
                    Perf / Reward Fee (%)
                  </label>
                  <input
                    type="number"
                    id="perf-fee-input"
                    value={performanceFeePct}
                    min="0"
                    max="50"
                    step="0.5"
                    onInput={(e) => {
                      setPerformanceFeePct(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                  />
                </div>

                <div class="space-y-1">
                  <label for="with-fee-input" class="text-[10px] font-mono text-muted uppercase block truncate">
                    Withdrawal Fee (%)
                  </label>
                  <input
                    type="number"
                    id="with-fee-input"
                    value={withdrawalFeePct}
                    min="0"
                    max="50"
                    step="0.25"
                    onInput={(e) => {
                      setWithdrawalFeePct(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                  />
                </div>
              </div>
            </div>

            {/* ADVANCED TOGGLES: REWARD TOKEN VOLATILITY & LP MODE */}
            <div class="space-y-4 pt-2 border-t border-hairline">
              {/* REWARD TOKEN VOLATILITY TOGGLE */}
              <div class="p-3.5 bg-surface-soft rounded-2xl border border-hairline space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-xs font-bold font-heading text-ink block">Reward Token Volatility Sensitivity</span>
                    <span class="text-[10px] text-muted">Model farm token price drop or appreciation upon harvest</span>
                  </div>
                  <input
                    type="checkbox"
                    id="reward-token-toggle"
                    checked={isRewardTokenVolatile}
                    onChange={(e) => {
                      setIsRewardTokenVolatile(e.currentTarget.checked);
                      setActivePreset('');
                    }}
                    class="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>

                {isRewardTokenVolatile && (
                  <div class="grid sm:grid-cols-2 gap-3 pt-2 border-t border-hairline">
                    <div class="space-y-1">
                      <label for="init-reward-price" class="text-[10px] font-mono text-muted uppercase block">
                        Initial Token Price ({sym})
                      </label>
                      <input
                        type="number"
                        id="init-reward-price"
                        value={initialRewardTokenPrice}
                        min="0.0001"
                        step="1"
                        onInput={(e) => {
                          setInitialRewardTokenPrice(Number(e.currentTarget.value) || 1);
                          setActivePreset('');
                        }}
                        class="w-full p-1.5 bg-canvas border border-hairline rounded font-mono text-xs font-bold text-ink text-right"
                      />
                    </div>
                    <div class="space-y-1">
                      <label for="final-reward-price" class="text-[10px] font-mono text-muted uppercase block">
                        Harvest Token Price ({sym})
                      </label>
                      <input
                        type="number"
                        id="final-reward-price"
                        value={finalRewardTokenPrice}
                        min="0.0001"
                        step="1"
                        onInput={(e) => {
                          setFinalRewardTokenPrice(Number(e.currentTarget.value) || 1);
                          setActivePreset('');
                        }}
                        class="w-full p-1.5 bg-canvas border border-hairline rounded font-mono text-xs font-bold text-ink text-right"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* LP FARMING MODE TOGGLE */}
              <div class="p-3.5 bg-surface-soft rounded-2xl border border-hairline space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-xs font-bold font-heading text-ink block">LP Token Farming (Impermanent Loss Drag)</span>
                    <span class="text-[10px] text-muted">Factor in relative price movement between pooled 50/50 assets</span>
                  </div>
                  <input
                    type="checkbox"
                    id="lp-mode-toggle"
                    checked={isLpMode}
                    onChange={(e) => {
                      setIsLpMode(e.currentTarget.checked);
                      setActivePreset('');
                    }}
                    class="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </div>

                {isLpMode && (
                  <div class="space-y-2 pt-2 border-t border-hairline">
                    <div class="flex items-center justify-between">
                      <label for="lp-ratio-slider" class="text-[10px] font-mono text-muted uppercase">
                        Relative Price Ratio (r)
                      </label>
                      <span class="text-xs font-mono font-bold text-primary">{lpPriceRatio}x ({results.meta.impermanentLossPct.toFixed(2)}% IL)</span>
                    </div>
                    <input
                      type="range"
                      id="lp-ratio-slider"
                      min="0.1"
                      max="5.0"
                      step="0.1"
                      value={lpPriceRatio}
                      onInput={(e) => {
                        setLpPriceRatio(Number(e.currentTarget.value));
                        setActivePreset('');
                      }}
                      class="w-full accent-primary cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS & BENCHMARKING */}
        <div class="lg:col-span-6 space-y-6">
          {/* PRIMARY HERO CARD */}
          <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Net Farming Yield ({farmingDurationDays} Days)
                </span>
                <div class="flex items-baseline gap-2 mt-1">
                  <span
                    class={`text-3xl sm:text-4xl font-extrabold font-heading tracking-tight ${
                      results.summary.totalNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {results.summary.totalNetProfit >= 0 ? '+' : ''}{sym}{results.summary.totalNetProfit.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                  </span>
                  <span class="text-xs font-mono text-muted">
                    ({results.summary.netRoiPct >= 0 ? '+' : ''}{results.summary.netRoiPct.toFixed(2)}% Net ROI)
                  </span>
                </div>
              </div>

              <div class="flex flex-col items-end">
                <span class="text-xs font-mono font-bold px-3 py-1 rounded-full border bg-primary/10 text-primary border-primary/20">
                  {results.meta.baseApy.toFixed(2)}% Base APY
                </span>
                <span class="text-[10px] font-mono text-muted mt-1">
                  Net APY: {results.summary.netAnnualizedApyPct.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* THREE-WAY SUMMARY METRICS */}
            <div class="grid grid-cols-3 gap-3 font-mono text-xs">
              <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Gross Yield</span>
                <span class="text-sm sm:text-base font-extrabold text-ink block mt-0.5">
                  +{sym}{results.summary.adjustedGrossYield.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">Before fees</span>
              </div>

              <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Total Fees Paid</span>
                <span class="text-sm sm:text-base font-extrabold text-rose-600 block mt-0.5">
                  -{sym}{results.fees.totalFeesPaid.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">({results.fees.feeDragPct.toFixed(1)}% Fee Drag)</span>
              </div>

              <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Ending Balance</span>
                <span class="text-sm sm:text-base font-extrabold text-primary block mt-0.5">
                  {sym}{results.summary.netEndingBalance.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">Net Capital</span>
              </div>
            </div>

            {/* BREAK-EVEN & RISK ANALYTICS */}
            <div class="p-4 bg-surface-soft rounded-2xl border border-hairline space-y-2.5 font-mono text-xs">
              <div class="flex items-center justify-between">
                <span class="text-muted">Break-Even Required Gross Yield:</span>
                <span class="font-bold text-ink">{sym}{results.summary.breakEvenGrossYield.toLocaleString()} ({results.summary.breakEvenAnnualApr.toFixed(1)}% APR)</span>
              </div>

              {isRewardTokenVolatile && (
                <div class="flex items-center justify-between border-t border-hairline pt-2">
                  <span class="text-muted">Break-Even Reward Token Price:</span>
                  <span class="font-bold text-ink">{sym}{results.summary.breakEvenRewardPrice.toFixed(4)}</span>
                </div>
              )}

              {isLpMode && (
                <div class="flex items-center justify-between border-t border-hairline pt-2 text-rose-600">
                  <span>Impermanent Loss Impact:</span>
                  <span class="font-bold">-{sym}{Math.abs(results.meta.impermanentLossDollarDrag).toLocaleString()} ({results.meta.impermanentLossPct.toFixed(2)}%)</span>
                </div>
              )}

              <div class="flex items-center justify-between border-t border-hairline pt-2">
                <span class="text-muted">Periodic Equivalent (Daily / Monthly):</span>
                <span class="font-bold text-ink">
                  {sym}{results.summary.dailyYieldGross.toFixed(2)}/day · {sym}{results.summary.monthlyYieldGross.toFixed(2)}/mo
                </span>
              </div>
            </div>
          </div>

          {/* COMPOUNDING BENCHMARK TABLE */}
          <div class="bg-surface border border-hairline rounded-3xl p-6 space-y-4 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-2">
              <h4 class="text-sm font-bold font-heading text-ink">Compounding Frequency Matrix</h4>
              <span class="text-xs font-mono text-muted">{results.inputs.interestRate}% APR Base</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr class="border-b border-hairline text-muted uppercase text-[10px] bg-surface-soft/40">
                    <th class="py-2 px-2.5">Schedule</th>
                    <th class="py-2 px-2.5">Effective APY</th>
                    <th class="py-2 px-2.5">Gross Yield ({farmingDurationDays}d)</th>
                    <th class="py-2 px-2.5">Ending Balance</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-hairline">
                  {results.compoundingComparison.map((row) => {
                    const isCurrent = row.id === compoundingFrequency;
                    return (
                      <tr
                        key={row.id}
                        class={`hover:bg-surface-soft/60 transition-colors ${
                          isCurrent ? 'bg-primary/10 font-bold' : ''
                        }`}
                      >
                        <td class="py-2 px-2.5 text-ink">
                          {row.label} {isCurrent && <span class="text-primary text-[10px]">◀</span>}
                        </td>
                        <td class="py-2 px-2.5 text-primary">{row.effectiveApyPct.toFixed(2)}%</td>
                        <td class="py-2 px-2.5 text-emerald-600">+{sym}{row.grossYield.toLocaleString()}</td>
                        <td class="py-2 px-2.5 text-ink">{sym}{row.endingBalance.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR & DISCLAIMER */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-surface-soft border border-hairline rounded-2xl">
        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            class="px-4 py-2 bg-surface-strong hover:bg-surface border border-hairline text-ink rounded-xl font-heading text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>{copiedUrl ? '✓ Link Copied!' : '🔗 Share Scenario URL'}</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset(YIELD_FARMING_APY_CONFIG.presets[0])}
            class="px-4 py-2 bg-surface-strong hover:bg-surface border border-hairline text-muted hover:text-ink rounded-xl font-heading text-xs font-semibold transition-all"
          >
            Reset Defaults
          </button>
        </div>

        <p class="text-[11px] text-muted text-center sm:text-right max-w-md">
          <strong>DeFi Analytical Notice:</strong> Yield farming returns fluctuate with protocol TVL, trading volume, and token prices. Models are deterministic simulations and do not guarantee future smart contract performance.
        </p>
      </div>
    </div>
  );
}
