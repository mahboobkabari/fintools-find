import { useState, useMemo } from 'preact/hooks';
import {
  calculateTokenVesting,
  VESTING_MODELS,
  VESTING_FREQUENCIES,
  FIAT_CURRENCIES,
} from '../../../calculators/crypto/token-vesting-calculator.js';
import { TOKEN_VESTING_CONFIG } from '../../../calculators/configs/token-vesting-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

export default function TokenVestingFlagshipWidget() {
  const [activePreset, setActivePreset] = useState('employee_equity_grant');

  const [totalTokens, setTotalTokens] = useState(100000);
  const [tokenPrice, setTokenPrice] = useState(1.5);
  const [grantPrice, setGrantPrice] = useState(0.25);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [evaluationDate, setEvaluationDate] = useState('2025-01-01');
  const [vestingModel, setVestingModel] = useState('CLIFF_LINEAR');
  const [cliffMonths, setCliffMonths] = useState(12);
  const [vestingMonths, setVestingMonths] = useState(48);
  const [vestingFrequency, setVestingFrequency] = useState('MONTHLY');
  const [initialUnlockPct, setInitialUnlockPct] = useState(0);
  const [totalSupply, setTotalSupply] = useState(10000000);
  const [currency, setCurrency] = useState('USD');
  const [tokenSymbol, setTokenSymbol] = useState('TOKEN');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  // URL Sync
  useUrlSync(
    {
      totalTokens,
      tokenPrice,
      grantPrice,
      startDate,
      evaluationDate,
      vestingModel,
      cliffMonths,
      vestingMonths,
      vestingFrequency,
      initialUnlockPct,
      totalSupply,
      currency,
      tokenSymbol,
    },
    (params) => {
      if (params.totalTokens !== undefined) setTotalTokens(Number(params.totalTokens) || 100000);
      if (params.tokenPrice !== undefined) setTokenPrice(Number(params.tokenPrice) || 1.5);
      if (params.grantPrice !== undefined) setGrantPrice(Number(params.grantPrice) || 0.25);
      if (params.startDate) setStartDate(params.startDate);
      if (params.evaluationDate) setEvaluationDate(params.evaluationDate);
      if (params.vestingModel) setVestingModel(params.vestingModel);
      if (params.cliffMonths !== undefined) setCliffMonths(Number(params.cliffMonths) || 12);
      if (params.vestingMonths !== undefined) setVestingMonths(Number(params.vestingMonths) || 48);
      if (params.vestingFrequency) setVestingFrequency(params.vestingFrequency);
      if (params.initialUnlockPct !== undefined) setInitialUnlockPct(Number(params.initialUnlockPct) || 0);
      if (params.totalSupply !== undefined) setTotalSupply(Number(params.totalSupply) || 10000000);
      if (params.currency) setCurrency(params.currency);
      if (params.tokenSymbol) setTokenSymbol(params.tokenSymbol);
      setActivePreset('');
    }
  );

  const applyPreset = (p) => {
    setActivePreset(p.id);
    if (p.totalTokens !== undefined) setTotalTokens(p.totalTokens);
    if (p.tokenPrice !== undefined) setTokenPrice(p.tokenPrice);
    if (p.grantPrice !== undefined) setGrantPrice(p.grantPrice);
    if (p.startDate) setStartDate(p.startDate);
    if (p.evaluationDate) setEvaluationDate(p.evaluationDate);
    if (p.vestingModel) setVestingModel(p.vestingModel);
    if (p.cliffMonths !== undefined) setCliffMonths(p.cliffMonths);
    if (p.vestingMonths !== undefined) setVestingMonths(p.vestingMonths);
    if (p.vestingFrequency) setVestingFrequency(p.vestingFrequency);
    if (p.initialUnlockPct !== undefined) setInitialUnlockPct(p.initialUnlockPct);
    if (p.totalSupply !== undefined) setTotalSupply(p.totalSupply);
    if (p.currency) setCurrency(p.currency);
    if (p.tokenSymbol) setTokenSymbol(p.tokenSymbol);
  };

  const results = useMemo(() => {
    return calculateTokenVesting({
      totalTokens,
      tokenPrice,
      grantPrice,
      startDate,
      evaluationDate,
      vestingModel,
      cliffMonths,
      vestingMonths,
      vestingFrequency,
      initialUnlockPct,
      totalSupply,
      currency,
      tokenSymbol,
    });
  }, [
    totalTokens,
    tokenPrice,
    grantPrice,
    startDate,
    evaluationDate,
    vestingModel,
    cliffMonths,
    vestingMonths,
    vestingFrequency,
    initialUnlockPct,
    totalSupply,
    currency,
    tokenSymbol,
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

  const displayedSchedule = showFullSchedule ? results.schedule : results.schedule.slice(0, 12);

  // Status headline narrative
  let statusBadgeText = `${results.kpis.vestedPct}% Currently Vested`;
  let statusBadgeColor = 'bg-primary/10 text-primary border-primary/20';

  if (results.meta.isBeforeStart) {
    statusBadgeText = 'Grant Not Yet Started';
    statusBadgeColor = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  } else if (results.meta.isDuringCliff) {
    statusBadgeText = `In Cliff Period (${results.kpis.vestedPct}% Unlocked)`;
    statusBadgeColor = 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
  } else if (results.meta.isFullyVested) {
    statusBadgeText = '100% Fully Vested & Unlocked';
    statusBadgeColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  }

  return (
    <div class="space-y-10">
      {/* PRESET SCENARIO SELECTOR */}
      <section class="space-y-3" role="region" aria-label="Preset Token Vesting Scenarios">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted">
            Representative Token Vesting Scenarios
          </span>
          <span class="text-xs font-mono text-primary font-semibold">1-Tap Fill</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {TOKEN_VESTING_CONFIG.presets.map((p) => {
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
        {/* LEFT COLUMN: PARAMETER INPUT CONTROLS */}
        <div class="lg:col-span-6 space-y-6">
          <div class="bg-surface border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
            <div class="border-b border-hairline pb-4">
              <h3 class="text-lg font-bold font-heading text-ink">Token Allocation & Vesting Parameters</h3>
              <p class="text-xs text-muted mt-0.5">Configure your grant size, cliff lockup, and unlock timeline.</p>
            </div>

            {/* VESTING MODEL SELECTOR */}
            <div class="space-y-1.5">
              <label for="vesting-model-select" class="text-[11px] font-mono font-bold text-muted uppercase tracking-wider block">
                Vesting Architecture Model
              </label>
              <select
                id="vesting-model-select"
                value={vestingModel}
                onChange={(e) => {
                  setVestingModel(e.currentTarget.value);
                  setActivePreset('');
                }}
                class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-heading text-xs font-bold text-ink"
              >
                {Object.keys(VESTING_MODELS).map((k) => (
                  <option key={k} value={k}>
                    {VESTING_MODELS[k].label}
                  </option>
                ))}
              </select>
            </div>

            {/* TOKEN ALLOCATION & TICKER */}
            <div class="grid sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2 space-y-1">
                <div class="flex justify-between">
                  <label for="total-tokens-input" class="text-[11px] font-mono font-bold text-muted uppercase">
                    Total Token Grant
                  </label>
                  <span class="text-xs font-mono font-bold text-primary">{totalTokens.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  id="total-tokens-input"
                  value={totalTokens}
                  min="1"
                  step="10000"
                  onInput={(e) => {
                    setTotalTokens(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                />
              </div>

              <div class="space-y-1">
                <label for="token-sym-input" class="text-[11px] font-mono font-bold text-muted uppercase block">
                  Token Symbol
                </label>
                <input
                  type="text"
                  id="token-sym-input"
                  value={tokenSymbol}
                  onInput={(e) => {
                    setTokenSymbol(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink"
                />
              </div>
            </div>

            {/* DATES: START DATE & EVALUATION DATE */}
            <div class="grid sm:grid-cols-2 gap-4 p-4 bg-surface-soft rounded-2xl border border-hairline">
              <div class="space-y-1">
                <label for="start-date-input" class="text-[10px] font-mono font-bold text-muted uppercase block">
                  Grant / TGE Start Date
                </label>
                <input
                  type="date"
                  id="start-date-input"
                  value={startDate}
                  onInput={(e) => {
                    setStartDate(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink"
                />
              </div>

              <div class="space-y-1">
                <label for="eval-date-input" class="text-[10px] font-mono font-bold text-muted uppercase block">
                  Status Evaluation Date
                </label>
                <input
                  type="date"
                  id="eval-date-input"
                  value={evaluationDate}
                  onInput={(e) => {
                    setEvaluationDate(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink"
                />
              </div>
            </div>

            {/* CLIFF & VESTING DURATIONS */}
            <div class="grid sm:grid-cols-3 gap-3">
              <div class="space-y-1">
                <div class="flex justify-between">
                  <label for="cliff-months-input" class="text-[10px] font-mono text-muted uppercase truncate">
                    Cliff (Months)
                  </label>
                  <span class="text-xs font-mono font-bold text-ink">{cliffMonths}m</span>
                </div>
                <input
                  type="number"
                  id="cliff-months-input"
                  value={cliffMonths}
                  min="0"
                  max="120"
                  step="1"
                  disabled={vestingModel === 'LINEAR_NO_CLIFF' || vestingModel === 'IMMEDIATE'}
                  onInput={(e) => {
                    const val = Number(e.currentTarget.value) || 0;
                    setCliffMonths(val);
                    if (val > vestingMonths) setVestingMonths(val);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right disabled:opacity-50"
                />
              </div>

              <div class="space-y-1">
                <div class="flex justify-between">
                  <label for="vesting-months-input" class="text-[10px] font-mono text-muted uppercase truncate">
                    Total Vest (Months)
                  </label>
                  <span class="text-xs font-mono font-bold text-primary">{vestingMonths}m</span>
                </div>
                <input
                  type="number"
                  id="vesting-months-input"
                  value={vestingMonths}
                  min="1"
                  max="240"
                  step="1"
                  disabled={vestingModel === 'IMMEDIATE'}
                  onInput={(e) => {
                    setVestingMonths(Number(e.currentTarget.value) || 1);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right disabled:opacity-50"
                />
              </div>

              <div class="space-y-1">
                <label for="vesting-freq-select" class="text-[10px] font-mono text-muted uppercase block truncate">
                  Unlock Frequency
                </label>
                <select
                  id="vesting-freq-select"
                  value={vestingFrequency}
                  disabled={vestingModel === 'IMMEDIATE'}
                  onChange={(e) => {
                    setVestingFrequency(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink disabled:opacity-50"
                >
                  {Object.keys(VESTING_FREQUENCIES).map((f) => (
                    <option key={f} value={f}>
                      {VESTING_FREQUENCIES[f].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* INITIAL UNLOCK & TOKEN PRICES */}
            <div class="p-4 bg-surface-soft rounded-2xl border border-hairline space-y-4">
              <div class="grid sm:grid-cols-3 gap-3">
                <div class="space-y-1">
                  <label for="initial-unlock-input" class="text-[10px] font-mono text-muted uppercase block truncate">
                    TGE Initial Unlock %
                  </label>
                  <input
                    type="number"
                    id="initial-unlock-input"
                    value={initialUnlockPct}
                    min="0"
                    max="100"
                    step="5"
                    disabled={vestingModel === 'IMMEDIATE'}
                    onInput={(e) => {
                      setInitialUnlockPct(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right disabled:opacity-50"
                  />
                </div>

                <div class="space-y-1">
                  <label for="token-price-input" class="text-[10px] font-mono text-muted uppercase block truncate">
                    Spot Price ({sym})
                  </label>
                  <input
                    type="number"
                    id="token-price-input"
                    value={tokenPrice}
                    min="0.0001"
                    step="0.25"
                    onInput={(e) => {
                      setTokenPrice(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                  />
                </div>

                <div class="space-y-1">
                  <label for="grant-price-input" class="text-[10px] font-mono text-muted uppercase block truncate">
                    Grant Price ({sym})
                  </label>
                  <input
                    type="number"
                    id="grant-price-input"
                    value={grantPrice}
                    min="0"
                    step="0.05"
                    onInput={(e) => {
                      setGrantPrice(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                  />
                </div>
              </div>
            </div>

            {/* TOTAL SUPPLY & QUOTE CURRENCY */}
            <div class="grid sm:grid-cols-2 gap-4 pt-2 border-t border-hairline">
              <div class="space-y-1">
                <label for="total-supply-input" class="text-[11px] font-mono font-bold text-muted uppercase block">
                  Total Token Supply (Optional)
                </label>
                <input
                  type="number"
                  id="total-supply-input"
                  value={totalSupply}
                  min="0"
                  step="1000000"
                  onInput={(e) => {
                    setTotalSupply(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                />
              </div>

              <div class="space-y-1">
                <label for="currency-select" class="text-[11px] font-mono font-bold text-muted uppercase block">
                  Quote Currency
                </label>
                <select
                  id="currency-select"
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink"
                >
                  {Object.keys(FIAT_CURRENCIES).map((c) => (
                    <option key={c} value={c}>
                      {c} ({FIAT_CURRENCIES[c].symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS, KPIS & SCHEDULE */}
        <div class="lg:col-span-6 space-y-6">
          {/* PRIMARY HERO METRIC CARD */}
          <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Current Vested Status (@ {results.inputs.evaluationDate})
                </span>
                <div class="flex items-baseline gap-2 mt-1">
                  <span class="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight text-primary">
                    {sym}{results.kpis.vestedValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                  </span>
                  <span class="text-xs font-mono text-muted">
                    ({results.kpis.vestedTokens.toLocaleString()} {tokenSymbol})
                  </span>
                </div>
              </div>

              <div class="flex flex-col items-end">
                <span class={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${statusBadgeColor}`}>
                  {statusBadgeText}
                </span>
                {results.kpis.ownershipPct > 0 && (
                  <span class="text-[10px] font-mono text-muted mt-1">
                    {results.kpis.vestedOwnershipPct.toFixed(3)}% Vested Ownership ({results.kpis.ownershipPct.toFixed(2)}% Total)
                  </span>
                )}
              </div>
            </div>

            {/* VISUAL VESTING PROGRESS BAR */}
            <div class="space-y-2">
              <div class="flex justify-between text-xs font-mono">
                <span class="text-primary font-bold">
                  {results.kpis.vestedPct}% Vested ({results.kpis.vestedTokens.toLocaleString()} {tokenSymbol})
                </span>
                <span class="text-muted">
                  {results.kpis.unvestedPct}% Unvested ({results.kpis.unvestedTokens.toLocaleString()} {tokenSymbol})
                </span>
              </div>
              <div class="w-full bg-surface-strong rounded-full h-3.5 overflow-hidden flex border border-hairline p-0.5">
                <div
                  class="bg-gradient-to-r from-primary to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${results.kpis.vestedPct}%` }}
                ></div>
              </div>
            </div>

            {/* THREE-WAY METRIC GRID */}
            <div class="grid grid-cols-3 gap-3 font-mono text-xs">
              <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Total Grant Value</span>
                <span class="text-sm sm:text-base font-extrabold text-ink block mt-0.5">
                  {sym}{results.kpis.totalGrantValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">({results.inputs.totalTokens.toLocaleString()} {tokenSymbol})</span>
              </div>

              <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Remaining Unvested</span>
                <span class="text-sm sm:text-base font-extrabold text-muted block mt-0.5">
                  {sym}{results.kpis.unvestedValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">({results.kpis.unvestedTokens.toLocaleString()} {tokenSymbol})</span>
              </div>

              <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Unrealized Gain</span>
                <span class={`text-sm sm:text-base font-extrabold block mt-0.5 ${results.kpis.unrealizedGainFiat >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {results.kpis.unrealizedGainFiat >= 0 ? '+' : ''}{sym}{results.kpis.unrealizedGainFiat.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">({results.kpis.unrealizedGainPct >= 0 ? '+' : ''}{results.kpis.unrealizedGainPct.toFixed(1)}%)</span>
              </div>
            </div>

            {/* UPCOMING UNLOCK & TIMELINE SUMMARY */}
            <div class="p-4 bg-surface-soft rounded-2xl border border-hairline space-y-2.5 font-mono text-xs">
              <div class="flex items-center justify-between">
                <span class="text-muted">Next Scheduled Unlock:</span>
                <span class="font-bold text-primary">
                  {results.kpis.nextUnlockDate} (+{results.kpis.nextUnlockAmount.toLocaleString()} {tokenSymbol} · {sym}{results.kpis.nextUnlockValue.toLocaleString()})
                </span>
              </div>

              <div class="flex items-center justify-between border-t border-hairline pt-2">
                <span class="text-muted">Time to Next Unlock:</span>
                <span class="font-bold text-ink">
                  {results.kpis.daysUntilNextUnlock} Days
                </span>
              </div>

              <div class="flex items-center justify-between border-t border-hairline pt-2">
                <span class="text-muted">Fully Vested Completion Date:</span>
                <span class="font-bold text-ink">
                  {results.meta.vestingEndDate} ({results.meta.daysUntilEnd} Days Remaining)
                </span>
              </div>

              <div class="flex items-center justify-between border-t border-hairline pt-2">
                <span class="text-muted">Annualized Unlock Velocity:</span>
                <span class="font-bold text-ink">
                  {results.kpis.annualizedUnlockTokens.toLocaleString()} {tokenSymbol}/yr ({sym}{results.kpis.annualizedUnlockValue.toLocaleString()}/yr)
                </span>
              </div>
            </div>
          </div>

          {/* TOKEN PRICE SENSITIVITY MATRIX */}
          <div class="bg-surface border border-hairline rounded-3xl p-6 space-y-4 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-2">
              <h4 class="text-sm font-bold font-heading text-ink">Token Price Sensitivity Scenarios</h4>
              <span class="text-xs font-mono text-muted">Baseline Spot: {sym}{tokenPrice}</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr class="border-b border-hairline text-muted uppercase text-[10px] bg-surface-soft/40">
                    <th class="py-2 px-2.5">Scenario</th>
                    <th class="py-2 px-2.5">Token Price</th>
                    <th class="py-2 px-2.5">Vested Value</th>
                    <th class="py-2 px-2.5">Total Grant Value</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-hairline">
                  {results.priceScenarios.map((s) => {
                    const isBase = s.multiplier === 1.0;
                    return (
                      <tr key={s.label} class={`hover:bg-surface-soft/60 transition-colors ${isBase ? 'bg-primary/5 font-bold text-primary' : ''}`}>
                        <td class="py-2 px-2.5 text-ink">{s.label}</td>
                        <td class="py-2 px-2.5">{sym}{s.tokenPrice.toFixed(2)}</td>
                        <td class="py-2 px-2.5 text-emerald-600">{sym}{s.vestedValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</td>
                        <td class="py-2 px-2.5 font-bold text-ink">{sym}{s.totalValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* VESTING SCHEDULE TABLE */}
      <section class="bg-surface border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-4">
          <div>
            <h3 class="text-base sm:text-lg font-bold font-heading text-ink">
              Detailed Token Unlock Schedule ({results.schedule.length} Total Periods)
            </h3>
            <p class="text-xs text-muted">Chronological tranche release milestones from TGE start to final 100% vesting.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            class="px-3 py-1.5 bg-surface-strong hover:bg-surface border border-hairline rounded-xl text-xs font-mono font-bold text-primary transition-all self-start sm:self-auto"
          >
            {showFullSchedule ? 'Collapse Table' : `Show All ${results.schedule.length} Periods`}
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr class="border-b border-hairline text-muted uppercase text-[10px] bg-surface-soft/40">
                <th class="py-2.5 px-3">#</th>
                <th class="py-2.5 px-3">Unlock Date</th>
                <th class="py-2.5 px-3">Milestone Event</th>
                <th class="py-2.5 px-3 text-right">Unlocked ({tokenSymbol})</th>
                <th class="py-2.5 px-3 text-right">Cumulative Vested</th>
                <th class="py-2.5 px-3 text-right">Vested %</th>
                <th class="py-2.5 px-3 text-right">Period Value ({sym})</th>
                <th class="py-2.5 px-3 text-right">Remaining Tokens</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              {displayedSchedule.map((row) => (
                <tr
                  key={row.periodNumber + row.date}
                  class={`hover:bg-surface-soft/60 transition-colors ${
                    row.isCliffEvent ? 'bg-indigo-500/5 font-semibold text-indigo-900' : ''
                  }`}
                >
                  <td class="py-2.5 px-3 text-muted">{row.periodNumber}</td>
                  <td class="py-2.5 px-3 font-semibold text-ink">{row.date}</td>
                  <td class="py-2.5 px-3 text-ink">
                    <span class="inline-flex items-center gap-1">
                      {row.isCliffEvent && <span class="text-xs">🔒</span>}
                      {row.eventName}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-right text-primary font-bold">+{row.unlockedTokens.toLocaleString()}</td>
                  <td class="py-2.5 px-3 text-right font-bold text-ink">{row.cumulativeVestedTokens.toLocaleString()}</td>
                  <td class="py-2.5 px-3 text-right font-bold text-emerald-600">{row.vestedPct.toFixed(1)}%</td>
                  <td class="py-2.5 px-3 text-right text-ink">{sym}{row.unlockedValue.toLocaleString()}</td>
                  <td class="py-2.5 px-3 text-right text-muted">{row.remainingTokens.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!showFullSchedule && results.schedule.length > 12 && (
          <div class="text-center pt-2">
            <button
              type="button"
              onClick={() => setShowFullSchedule(true)}
              class="text-xs font-mono font-bold text-primary hover:underline"
            >
              + View {results.schedule.length - 12} More Schedule Periods
            </button>
          </div>
        )}
      </section>

      {/* BOTTOM ACTION BAR & DISCLAIMER */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-surface-soft border border-hairline rounded-2xl">
        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            class="px-4 py-2 bg-surface-strong hover:bg-surface border border-hairline text-ink rounded-xl font-heading text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>{copiedUrl ? '✓ Link Copied!' : '🔗 Share Schedule URL'}</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset(TOKEN_VESTING_CONFIG.presets[0])}
            class="px-4 py-2 bg-surface-strong hover:bg-surface border border-hairline text-muted hover:text-ink rounded-xl font-heading text-xs font-semibold transition-all"
          >
            Reset Defaults
          </button>
        </div>

        <p class="text-[11px] text-muted text-center sm:text-right max-w-md">
          <strong>Vesting Analytical Notice:</strong> Token vesting represents an ownership unlock schedule. Calculations are deterministic mathematical simulations and do not guarantee future token price, market liquidity, or project performance.
        </p>
      </div>
    </div>
  );
}
