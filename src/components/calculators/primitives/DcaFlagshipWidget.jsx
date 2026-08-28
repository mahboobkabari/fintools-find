import { useState, useMemo } from 'preact/hooks';
import {
  calculateDca,
  CONTRIBUTION_FREQUENCIES,
  SCENARIO_MODES,
  FEE_MODES,
  FIAT_CURRENCIES,
} from '../../../calculators/crypto/dca-calculator.js';
import { DCA_CALCULATOR_CONFIG } from '../../../calculators/configs/dca-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

export default function DcaFlagshipWidget() {
  const [activePreset, setActivePreset] = useState('btc_monthly_rising');

  const [assetName, setAssetName] = useState('Bitcoin (BTC)');
  const [initialInvestment, setInitialInvestment] = useState(1000);
  const [recurringContribution, setRecurringContribution] = useState(500);
  const [frequency, setFrequency] = useState('MONTHLY');
  const [periods, setPeriods] = useState(12);
  const [startPrice, setStartPrice] = useState(60000);
  const [endPrice, setEndPrice] = useState(90000);
  const [scenarioMode, setScenarioMode] = useState('RISING');
  const [customPricesInput, setCustomPricesInput] = useState('60000, 62000, 58000, 65000, 72000, 68000, 75000, 82000, 80000, 85000, 88000, 90000');
  const [dipPct, setDipPct] = useState(35);
  const [feeMode, setFeeMode] = useState('DEDUCTED');
  const [fixedFee, setFixedFee] = useState(0);
  const [pctFee, setPctFee] = useState(0.25);
  const [currency, setCurrency] = useState('USD');
  const [showAdvancedFees, setShowAdvancedFees] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // URL Sync
  useUrlSync(
    {
      assetName,
      initialInvestment,
      recurringContribution,
      frequency,
      periods,
      startPrice,
      endPrice,
      scenarioMode,
      dipPct,
      feeMode,
      fixedFee,
      pctFee,
      currency,
    },
    (params) => {
      if (params.assetName) setAssetName(params.assetName);
      if (params.initialInvestment !== undefined) setInitialInvestment(Number(params.initialInvestment) || 0);
      if (params.recurringContribution !== undefined) setRecurringContribution(Number(params.recurringContribution) || 500);
      if (params.frequency) setFrequency(params.frequency);
      if (params.periods !== undefined) setPeriods(Number(params.periods) || 12);
      if (params.startPrice !== undefined) setStartPrice(Number(params.startPrice) || 60000);
      if (params.endPrice !== undefined) setEndPrice(Number(params.endPrice) || 90000);
      if (params.scenarioMode) setScenarioMode(params.scenarioMode);
      if (params.dipPct !== undefined) setDipPct(Number(params.dipPct) || 35);
      if (params.feeMode) setFeeMode(params.feeMode);
      if (params.fixedFee !== undefined) setFixedFee(Number(params.fixedFee) || 0);
      if (params.pctFee !== undefined) setPctFee(Number(params.pctFee) || 0.25);
      if (params.currency) setCurrency(params.currency);
      setActivePreset('');
    }
  );

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setAssetName(p.assetName);
    setInitialInvestment(p.initialInvestment || 0);
    setRecurringContribution(p.recurringContribution);
    setFrequency(p.frequency);
    setPeriods(p.periods);
    setStartPrice(p.startPrice);
    setEndPrice(p.endPrice);
    setScenarioMode(p.scenarioMode);
    if (p.dipPct !== undefined) setDipPct(p.dipPct);
    setFeeMode(p.feeMode);
    setFixedFee(p.fixedFee);
    setPctFee(p.pctFee);
    setCurrency(p.currency);
  };

  const parsedCustomPrices = useMemo(() => {
    if (scenarioMode !== 'CUSTOM') return [];
    return customPricesInput
      .split(/[\s,]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);
  }, [customPricesInput, scenarioMode]);

  const results = useMemo(() => {
    return calculateDca({
      assetName,
      initialInvestment,
      recurringContribution,
      frequency,
      periods,
      startPrice,
      endPrice,
      scenarioMode,
      customPrices: parsedCustomPrices,
      dipPct,
      feeMode,
      fixedFee,
      pctFee,
      currency,
    });
  }, [
    assetName,
    initialInvestment,
    recurringContribution,
    frequency,
    periods,
    startPrice,
    endPrice,
    scenarioMode,
    parsedCustomPrices,
    dipPct,
    feeMode,
    fixedFee,
    pctFee,
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

  // Sparkline SVG Points Generator
  const chartData = useMemo(() => {
    const pts = results.schedule;
    if (!pts || pts.length === 0) return null;

    const maxVal = Math.max(...pts.map((p) => Math.max(p.portfolioValue, p.cumulativeInvested)), 1);
    const minVal = 0;
    const width = 600;
    const height = 220;
    const padding = 20;

    const getX = (idx) => padding + (idx / Math.max(1, pts.length - 1)) * (width - 2 * padding);
    const getY = (val) => height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);

    const valLine = pts.map((p, idx) => `${getX(idx)},${getY(p.portfolioValue)}`).join(' ');
    const investLine = pts.map((p, idx) => `${getX(idx)},${getY(p.cumulativeInvested)}`).join(' ');

    const valArea = `${getX(0)},${height - padding} ${valLine} ${getX(pts.length - 1)},${height - padding}`;
    const investArea = `${getX(0)},${height - padding} ${investLine} ${getX(pts.length - 1)},${height - padding}`;

    // Price path vs Avg cost
    const maxPrice = Math.max(...pts.map((p) => Math.max(p.price, p.averageCost)), 1);
    const minPrice = Math.min(...pts.map((p) => Math.min(p.price, p.averageCost)), 0) * 0.8;
    const getPriceY = (val) => height - padding - ((val - minPrice) / Math.max(1, maxPrice - minPrice)) * (height - 2 * padding);

    const priceLine = pts.map((p, idx) => `${getX(idx)},${getPriceY(p.price)}`).join(' ');
    const avgCostLine = pts.map((p, idx) => `${getX(idx)},${getPriceY(p.averageCost)}`).join(' ');

    return {
      width,
      height,
      maxVal,
      valLine,
      investLine,
      valArea,
      investArea,
      priceLine,
      avgCostLine,
      maxPrice,
      minPrice,
    };
  }, [results.schedule]);

  const displayedSchedule = showFullSchedule ? results.schedule : results.schedule.slice(0, 12);

  return (
    <div class="space-y-10">
      {/* EDUCATIONAL PRESETS */}
      <section class="space-y-3" role="region" aria-label="Preset DCA Scenarios">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted">
            Hypothetical DCA Strategy Scenarios &amp; Presets
          </span>
          <span class="text-xs font-mono text-primary font-semibold">1-Tap Preset Fill</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DCA_CALCULATOR_CONFIG.presets.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                class={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                    : 'border-hairline bg-surface hover:border-primary/40 hover:bg-surface-soft'
                }`}
              >
                <div class="flex items-center gap-1.5 mb-1.5">
                  <span class="text-base font-bold">{p.icon}</span>
                  <span class="text-xs font-heading font-bold text-ink truncate">{p.label.split(':')[0]}</span>
                </div>
                <span class="text-[11px] font-sans text-muted leading-tight line-clamp-2">{p.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* MAIN TWO-COLUMN WORKBENCH */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS */}
        <div class="lg:col-span-6 space-y-6">
          <div class="bg-surface border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-4">
              <h2 class="text-lg font-bold font-heading text-ink">DCA Contribution Parameters</h2>
              <span class="text-xs font-mono text-muted uppercase font-semibold">Simulation Inputs</span>
            </div>

            {/* ASSET NAME & CURRENCY */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="dca-asset-name" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Asset / Token Label
                </label>
                <input
                  type="text"
                  id="dca-asset-name"
                  value={assetName}
                  onInput={(e) => {
                    setAssetName(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-sans text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div class="space-y-1.5">
                <label for="dca-currency-select" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Fiat Currency
                </label>
                <select
                  id="dca-currency-select"
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

            {/* INITIAL LUMP SUM & RECURRING CONTRIBUTION */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label for="dca-initial-investment" class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                    Starting Capital
                  </label>
                  <span class="text-[10px] font-mono text-muted">Initial Day 1</span>
                </div>
                <div class="flex items-center bg-surface-strong px-3.5 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                  <span class="text-xs font-mono text-muted mr-1 font-bold">{sym}</span>
                  <input
                    type="number"
                    id="dca-initial-investment"
                    value={initialInvestment}
                    min="0"
                    step="100"
                    onInput={(e) => {
                      setInitialInvestment(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label for="dca-recurring-contribution" class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                    Recurring Contribution
                  </label>
                  <span class="text-[10px] font-mono text-primary font-bold">Per Period</span>
                </div>
                <div class="flex items-center bg-surface-strong px-3.5 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                  <span class="text-xs font-mono text-muted mr-1 font-bold">{sym}</span>
                  <input
                    type="number"
                    id="dca-recurring-contribution"
                    value={recurringContribution}
                    min="0"
                    step="50"
                    onInput={(e) => {
                      setRecurringContribution(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* FREQUENCY & PERIODS */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="dca-frequency" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Contribution Frequency
                </label>
                <select
                  id="dca-frequency"
                  value={frequency}
                  onChange={(e) => {
                    setFrequency(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-heading text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.keys(CONTRIBUTION_FREQUENCIES).map((k) => (
                    <option key={k} value={k}>
                      {CONTRIBUTION_FREQUENCIES[k].label}
                    </option>
                  ))}
                </select>
              </div>

              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label for="dca-periods" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                    Number of Periods
                  </label>
                  <span class="text-[10px] font-mono text-muted">{results.meta.totalMonths} Months approx.</span>
                </div>
                <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                  <input
                    type="number"
                    id="dca-periods"
                    value={periods}
                    min="1"
                    max="360"
                    step="1"
                    onInput={(e) => {
                      setPeriods(Number(e.currentTarget.value) || 1);
                      setActivePreset('');
                    }}
                    class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  />
                  <span class="text-xs font-mono text-muted ml-1 font-bold">x</span>
                </div>
              </div>
            </div>

            {/* PERIODS RANGE SLIDER */}
            <div class="space-y-1">
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={Math.min(periods, 60)}
                onInput={(e) => {
                  setPeriods(Number(e.currentTarget.value) || 1);
                  setActivePreset('');
                }}
                class="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
              <div class="flex justify-between text-[10px] font-mono text-muted">
                <span>1 Period</span>
                <span>12 Periods</span>
                <span>24 Periods</span>
                <span>60 Periods</span>
              </div>
            </div>

            {/* SCENARIO MODE SELECTOR */}
            <div class="space-y-2 pt-2 border-t border-hairline">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                  Simulated Market Price Path
                </span>
                <span class="text-[10px] font-mono text-amber-600 font-bold">Hypothetical Model</span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.keys(SCENARIO_MODES).map((modeKey) => {
                  const m = SCENARIO_MODES[modeKey];
                  const isSelected = scenarioMode === modeKey;
                  return (
                    <button
                      key={modeKey}
                      type="button"
                      onClick={() => {
                        setScenarioMode(modeKey);
                        setActivePreset('');
                      }}
                      class={`p-2 rounded-xl text-left border text-xs font-heading font-bold transition-all ${
                        isSelected
                          ? 'border-primary bg-primary text-white shadow-soft'
                          : 'border-hairline bg-surface-soft text-ink hover:border-primary/40'
                      }`}
                    >
                      <span class="block truncate">{m.label.split('/')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* START PRICE & END PRICE */}
            {scenarioMode !== 'CUSTOM' ? (
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label for="dca-start-price" class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                      Initial Price (P₁)
                    </label>
                  </div>
                  <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                    <span class="text-xs font-mono text-muted mr-1 font-bold">{sym}</span>
                    <input
                      type="number"
                      id="dca-start-price"
                      value={startPrice}
                      min="0.00001"
                      step="100"
                      onInput={(e) => {
                        setStartPrice(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label for="dca-end-price" class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                      Final / Target Price (Pₙ)
                    </label>
                  </div>
                  <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                    <span class="text-xs font-mono text-muted mr-1 font-bold">{sym}</span>
                    <input
                      type="number"
                      id="dca-end-price"
                      value={endPrice}
                      min="0.00001"
                      step="100"
                      onInput={(e) => {
                        setEndPrice(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div class="space-y-2">
                <label for="dca-custom-prices" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Custom Prices Array (Comma-Separated per Period)
                </label>
                <textarea
                  id="dca-custom-prices"
                  rows={2}
                  value={customPricesInput}
                  onInput={(e) => {
                    setCustomPricesInput(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  placeholder="e.g. 60000, 62000, 58000, 65000..."
                  class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {scenarioMode === 'VOLATILE' && (
              <div class="space-y-1.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <div class="flex items-center justify-between">
                  <label for="dca-dip-pct" class="text-xs font-mono font-bold text-amber-700 dark:text-amber-300 uppercase">
                    Mid-Cycle Price Dip Depth (%)
                  </label>
                  <span class="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">-{dipPct}%</span>
                </div>
                <input
                  type="range"
                  id="dca-dip-pct"
                  min="5"
                  max="80"
                  step="5"
                  value={dipPct}
                  onInput={(e) => {
                    setDipPct(Number(e.currentTarget.value) || 35);
                    setActivePreset('');
                  }}
                  class="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                />
              </div>
            )}

            {/* TRANSACTION FEES COLLAPSIBLE */}
            <div class="pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setShowAdvancedFees(!showAdvancedFees)}
                class="text-xs font-mono text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{showAdvancedFees ? '▲ Hide' : '▼ Customize'} Exchange Fees &amp; Commission Modeling</span>
              </button>

              {showAdvancedFees && (
                <div class="mt-4 p-4 bg-surface-soft rounded-2xl border border-hairline space-y-4">
                  <div class="space-y-1.5">
                    <label for="dca-fee-mode" class="text-xs font-mono text-muted uppercase font-bold block">
                      Fee Treatment Mode
                    </label>
                    <select
                      id="dca-fee-mode"
                      value={feeMode}
                      onChange={(e) => {
                        setFeeMode(e.currentTarget.value);
                        setActivePreset('');
                      }}
                      class="w-full p-2 bg-canvas border border-hairline rounded-xl font-heading text-xs font-bold text-ink focus:outline-none"
                    >
                      {Object.keys(FEE_MODES).map((fk) => (
                        <option key={fk} value={fk}>
                          {FEE_MODES[fk].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {feeMode !== 'NONE' && (
                    <div class="grid sm:grid-cols-2 gap-4">
                      <div class="space-y-1.5">
                        <label for="dca-pct-fee" class="text-xs font-mono text-muted uppercase font-bold block">
                          Trading Fee Rate (%)
                        </label>
                        <input
                          type="number"
                          id="dca-pct-fee"
                          value={pctFee}
                          min="0"
                          max="20"
                          step="0.05"
                          onInput={(e) => {
                            setPctFee(Number(e.currentTarget.value) || 0);
                            setActivePreset('');
                          }}
                          class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none"
                        />
                      </div>

                      <div class="space-y-1.5">
                        <label for="dca-fixed-fee" class="text-xs font-mono text-muted uppercase font-bold block">
                          Fixed Fee per Trade ({sym})
                        </label>
                        <input
                          type="number"
                          id="dca-fixed-fee"
                          value={fixedFee}
                          min="0"
                          step="0.5"
                          onInput={(e) => {
                            setFixedFee(Number(e.currentTarget.value) || 0);
                            setActivePreset('');
                          }}
                          class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS, BENCHMARKS & CHARTS */}
        <div class="lg:col-span-6 space-y-6">
          {/* PRIMARY HERO CARD */}
          <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Ending Portfolio Value
                </span>
                <div class="flex items-baseline gap-2 mt-1">
                  <span class="text-3xl sm:text-4xl font-extrabold font-heading text-ink tracking-tight">
                    {sym}{results.summary.endingPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                  </span>
                  <span class="text-xs font-mono text-muted uppercase">{currency}</span>
                </div>
              </div>

              <div
                class={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold border ${
                  results.summary.isProfitable
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                }`}
              >
                {results.summary.isProfitable ? '+' : ''}{results.summary.roiPct}% ROI
              </div>
            </div>

            {/* KPI MATRIX */}
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Total Cash Invested</span>
                <span class="text-sm font-extrabold text-ink block mt-0.5">
                  {sym}{results.summary.totalInvested.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">Out of pocket</span>
              </div>

              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Total Units Acquired</span>
                <span class="text-sm font-extrabold text-primary block mt-0.5 truncate">
                  {results.summary.totalUnits}
                </span>
                <span class="text-[9px] text-muted block truncate">{assetName.split(' ')[0]} units</span>
              </div>

              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Average Cost / Unit</span>
                <span class="text-sm font-extrabold text-amber-600 block mt-0.5">
                  {sym}{results.summary.averageCostPerUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
                <span class="text-[9px] text-muted block">Break-even price</span>
              </div>

              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Net Absolute P&amp;L</span>
                <span
                  class={`text-sm font-extrabold block mt-0.5 ${
                    results.summary.isProfitable ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {results.summary.isProfitable ? '+' : ''}{sym}{results.summary.totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">Net after all fees</span>
              </div>

              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Exit Valuation Price</span>
                <span class="text-sm font-extrabold text-ink block mt-0.5">
                  {sym}{results.summary.finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span class="text-[9px] text-muted block">Final period spot</span>
              </div>

              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Fees &amp; Friction Drag</span>
                <span class="text-sm font-extrabold text-rose-500 block mt-0.5">
                  {sym}{results.summary.totalFeesPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span class="text-[9px] text-muted block">({results.summary.feeDragPct}% of capital)</span>
              </div>
            </div>

            {/* DCA VS LUMP SUM BENCHMARK CARD */}
            <div class="p-4 bg-surface-soft rounded-2xl border border-hairline space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold uppercase text-ink">
                  DCA vs. Lump-Sum Benchmark
                </span>
                <span
                  class={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    results.lumpSumBenchmark.dcaOutperformed
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-indigo-500/10 text-indigo-600'
                  }`}
                >
                  {results.lumpSumBenchmark.dcaOutperformed ? '✓ DCA Ahead' : 'Lump-Sum Ahead'}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-3 text-xs font-mono">
                <div class="p-2.5 bg-canvas rounded-xl border border-hairline">
                  <span class="text-[10px] text-muted uppercase block">DCA Strategy</span>
                  <span class="text-xs font-bold text-ink block mt-1">
                    Value: {sym}{results.summary.endingPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span class="text-[10px] text-emerald-600 font-bold block">
                    ROI: {results.summary.roiPct}% ({results.summary.totalUnits} units)
                  </span>
                </div>

                <div class="p-2.5 bg-canvas rounded-xl border border-hairline">
                  <span class="text-[10px] text-muted uppercase block">Lump-Sum on Day 1</span>
                  <span class="text-xs font-bold text-ink block mt-1">
                    Value: {sym}{results.lumpSumBenchmark.endingValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span class="text-[10px] text-indigo-600 font-bold block">
                    ROI: {results.lumpSumBenchmark.roiPct}% ({results.lumpSumBenchmark.lumpUnits} units)
                  </span>
                </div>
              </div>

              <p class="text-[11px] text-muted leading-relaxed">
                {results.lumpSumBenchmark.dcaOutperformed
                  ? `In this declining or volatile scenario, DCA reduced your average purchase price (${sym}${results.summary.averageCostPerUnit.toLocaleString()}) below the starting spot (${sym}${startPrice.toLocaleString()}), protecting ${sym}${Math.abs(results.lumpSumBenchmark.dcaVsLumpDiff).toLocaleString()} in capital compared to investing all at once on Day 1.`
                  : `In a steadily rising market, lump-sum capital deployment on Day 1 at ${sym}${startPrice.toLocaleString()} captures early upside, outperforming DCA by ${sym}${Math.abs(results.lumpSumBenchmark.dcaVsLumpDiff).toLocaleString()}. However, DCA eliminated timing anxiety and smoothed entry volatility.`}
              </p>
            </div>
          </div>

          {/* SVG CAPITAL PROGRESSION CHART */}
          {chartData && (
            <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-base font-bold font-heading text-ink">Capital Invested vs. Portfolio Value</h3>
                  <p class="text-xs text-muted">Progression across all {periods} contribution periods</p>
                </div>
                <div class="flex items-center gap-3 text-[11px] font-mono">
                  <span class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span> Portfolio Value
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="w-2.5 h-2.5 rounded-full bg-muted/60 inline-block"></span> Total Invested
                  </span>
                </div>
              </div>

              <div class="relative w-full h-48 sm:h-56">
                <svg viewBox={`0 0 ${chartData.width} ${chartData.height}`} class="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="valGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="var(--color-primary, #6366f1)" stop-opacity="0.3" />
                      <stop offset="100%" stop-color="var(--color-primary, #6366f1)" stop-opacity="0.0" />
                    </linearGradient>
                    <linearGradient id="investGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#94a3b8" stop-opacity="0.2" />
                      <stop offset="100%" stop-color="#94a3b8" stop-opacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="20" y1="20" x2="580" y2="20" stroke="currentColor" class="text-hairline" stroke-dasharray="3,3" />
                  <line x1="20" y1="110" x2="580" y2="110" stroke="currentColor" class="text-hairline" stroke-dasharray="3,3" />
                  <line x1="20" y1="200" x2="580" y2="200" stroke="currentColor" class="text-hairline" />

                  {/* Areas */}
                  <polygon points={chartData.investArea} fill="url(#investGrad)" />
                  <polygon points={chartData.valArea} fill="url(#valGrad)" />

                  {/* Lines */}
                  <polyline points={chartData.investLine} fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4" />
                  <polyline points={chartData.valLine} fill="none" stroke="var(--color-primary, #6366f1)" stroke-width="3" />
                </svg>
              </div>

              <div class="flex items-center justify-between text-[10px] font-mono text-muted pt-1">
                <span>Period 1 (Start: {sym}{startPrice.toLocaleString()})</span>
                <span>Period {periods} (End: {sym}{endPrice.toLocaleString()})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PERIOD-BY-PERIOD SCHEDULE TABLE */}
      <section class="bg-surface border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft" role="region" aria-label="DCA Contribution Schedule">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-hairline pb-4">
          <div>
            <h3 class="text-lg font-bold font-heading text-ink">Periodic DCA Contribution Schedule</h3>
            <p class="text-xs text-muted">Exact breakdown of unit accumulation and cost basis across each contribution window</p>
          </div>
          {results.schedule.length > 12 && (
            <button
              type="button"
              onClick={() => setShowFullSchedule(!showFullSchedule)}
              class="text-xs font-mono font-bold text-primary hover:underline px-3 py-1 bg-surface-soft border border-hairline rounded-xl"
            >
              {showFullSchedule ? '▲ Show First 12 Rows' : `▼ View All ${results.schedule.length} Periods`}
            </button>
          )}
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr class="border-b border-hairline text-muted uppercase text-[10px] bg-surface-soft/40">
                <th class="py-2.5 px-3">Period</th>
                <th class="py-2.5 px-3">Spot Price ({sym})</th>
                <th class="py-2.5 px-3">Gross Outlay</th>
                <th class="py-2.5 px-3">Fee</th>
                <th class="py-2.5 px-3">Units Bought</th>
                <th class="py-2.5 px-3">Cumul. Units</th>
                <th class="py-2.5 px-3">Total Invested</th>
                <th class="py-2.5 px-3">Avg Cost ({sym})</th>
                <th class="py-2.5 px-3">Portfolio Value</th>
                <th class="py-2.5 px-3">Unrealized P&amp;L</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              {displayedSchedule.map((row) => {
                const isGain = row.unrealizedPnL >= 0;
                return (
                  <tr key={row.period} class="hover:bg-surface-soft/60 transition-colors">
                    <td class="py-2.5 px-3 font-bold text-ink">{row.label}</td>
                    <td class="py-2.5 px-3">{sym}{row.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="py-2.5 px-3 font-semibold">{sym}{row.grossContribution.toLocaleString()}</td>
                    <td class="py-2.5 px-3 text-rose-500">{sym}{row.fee.toFixed(2)}</td>
                    <td class="py-2.5 px-3 text-primary font-bold">{row.unitsBought}</td>
                    <td class="py-2.5 px-3 text-ink font-bold">{row.cumulativeUnits}</td>
                    <td class="py-2.5 px-3">{sym}{row.cumulativeInvested.toLocaleString()}</td>
                    <td class="py-2.5 px-3 text-amber-600 font-bold">{sym}{row.averageCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="py-2.5 px-3 font-bold text-ink">{sym}{row.portfolioValue.toLocaleString()}</td>
                    <td class={`py-2.5 px-3 font-bold ${isGain ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isGain ? '+' : ''}{sym}{row.unrealizedPnL.toLocaleString()} ({row.unrealizedRoiPct}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* BOTTOM ACTION BAR & SIMULATION NOTICE */}
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
            onClick={() => applyPreset(DCA_CALCULATOR_CONFIG.presets[0])}
            class="px-4 py-2 bg-surface-strong hover:bg-surface border border-hairline text-muted hover:text-ink rounded-xl font-heading text-xs font-semibold transition-all"
          >
            Reset Defaults
          </button>
        </div>

        <p class="text-[11px] text-muted text-center sm:text-right max-w-md">
          <strong>Hypothetical Simulation:</strong> This tool performs mathematical DCA projections based on user-entered parameters. It does not provide financial advice, live pricing, or historical performance guarantees.
        </p>
      </div>
    </div>
  );
}
