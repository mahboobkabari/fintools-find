import { useState, useMemo } from 'preact/hooks';
import {
  calculateRemittanceFee,
} from '../../../calculators/currency/remittance-fee-calculator.js';
import { REMITTANCE_FEE_CONFIG } from '../../../calculators/configs/remittance-fee-calculator.config.js';
import {
  REFERENCE_EXCHANGE_RATES,
  SUPPORTED_CURRENCY_CODES,
  REFERENCE_RATE_METADATA,
} from '../../../calculators/currency/currency-converter.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

export default function RemittanceFeeFlagshipWidget() {
  const [activePreset, setActivePreset] = useState('us_india_fintech');

  const [sendAmount, setSendAmount] = useState(1000);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [fixedFee, setFixedFee] = useState(0);
  const [percentageFee, setPercentageFee] = useState(0);
  const [fxSpreadPct, setFxSpreadPct] = useState(0.9);
  const [recipientFee, setRecipientFee] = useState(0);
  const [intermediaryFee, setIntermediaryFee] = useState(0);
  const [feeMode, setFeeMode] = useState('ADD_ON_TOP');
  const [customRate, setCustomRate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // URL Sync
  useUrlSync(
    {
      sendAmount,
      fromCurrency,
      toCurrency,
      fixedFee,
      percentageFee,
      fxSpreadPct,
      recipientFee,
      intermediaryFee,
      feeMode,
      customRate,
    },
    (params) => {
      if (params.sendAmount !== undefined) setSendAmount(Number(params.sendAmount) || 1000);
      if (params.fromCurrency) setFromCurrency(params.fromCurrency);
      if (params.toCurrency) setToCurrency(params.toCurrency);
      if (params.fixedFee !== undefined) setFixedFee(Number(params.fixedFee) || 0);
      if (params.percentageFee !== undefined) setPercentageFee(Number(params.percentageFee) || 0);
      if (params.fxSpreadPct !== undefined) setFxSpreadPct(Number(params.fxSpreadPct) || 0);
      if (params.recipientFee !== undefined) setRecipientFee(Number(params.recipientFee) || 0);
      if (params.intermediaryFee !== undefined) setIntermediaryFee(Number(params.intermediaryFee) || 0);
      if (params.feeMode) setFeeMode(params.feeMode);
      if (params.customRate !== undefined) setCustomRate(params.customRate);
      setActivePreset('');
    }
  );

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setSendAmount(p.sendAmount);
    setFromCurrency(p.fromCurrency);
    setToCurrency(p.toCurrency);
    setFixedFee(p.fixedFee);
    setPercentageFee(p.percentageFee);
    setFxSpreadPct(p.fxSpreadPct);
    setRecipientFee(p.recipientFee);
    setIntermediaryFee(p.intermediaryFee);
    setFeeMode(p.feeMode);
    setCustomRate('');
  };

  const handleSwapCurrencies = () => {
    const prevFrom = fromCurrency;
    const prevTo = toCurrency;
    setFromCurrency(prevTo);
    setToCurrency(prevFrom);
    setActivePreset('');
  };

  const results = useMemo(() => {
    return calculateRemittanceFee({
      sendAmount,
      fromCurrency,
      toCurrency,
      fixedFee,
      percentageFee,
      fxSpreadPct,
      recipientFee,
      intermediaryFee,
      feeMode,
      customRate: customRate !== '' ? Number(customRate) : null,
    });
  }, [
    sendAmount,
    fromCurrency,
    toCurrency,
    fixedFee,
    percentageFee,
    fxSpreadPct,
    recipientFee,
    intermediaryFee,
    feeMode,
    customRate,
  ]);

  const fromMeta = REFERENCE_EXCHANGE_RATES[fromCurrency] || REFERENCE_EXCHANGE_RATES.USD;
  const toMeta = REFERENCE_EXCHANGE_RATES[toCurrency] || REFERENCE_EXCHANGE_RATES.INR;
  const toDecimals = toMeta.decimals !== undefined ? toMeta.decimals : 2;

  return (
    <div class="space-y-10">
      {/* PRESETS */}
      <section class="space-y-3" role="region" aria-label="Preset scenarios">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted">
            Popular Remittance Corridors & Channel Presets
          </span>
          <span class="text-xs font-mono text-primary font-semibold">1-Tap Auto Fill</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {REMITTANCE_FEE_CONFIG.presets.map((p) => {
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
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            💸 REMITTANCE & FX FEE ANALYSIS
          </span>
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase text-primary bg-surface-strong">
            {REFERENCE_RATE_METADATA.baselineDate} · {REFERENCE_RATE_METADATA.rateType}
          </span>
        </div>
        <h2 class="text-2xl sm:text-4xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Sending <strong>{fromMeta.symbol}{results.sendAmount.toLocaleString()} {fromCurrency}</strong> yields{' '}
          <strong class="text-semantic-success">{toMeta.symbol}{results.netRecipientAmount.toLocaleString(undefined, { minimumFractionDigits: toDecimals, maximumFractionDigits: toDecimals })} {toCurrency}</strong>{' '}
          delivered to beneficiary (Effective Rate: 1 {fromCurrency} = {toMeta.symbol}{results.effectiveNetFxRate}).
        </p>
        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Mid-Market Payout</span>
            <span class="text-sm font-bold text-ink">
              {toMeta.symbol}{results.idealGrossReceived.toLocaleString(undefined, { minimumFractionDigits: toDecimals, maximumFractionDigits: toDecimals })}
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Upfront Transfer Fee</span>
            <span class="text-sm font-bold text-amber-600">
              {fromMeta.symbol}{results.totalSenderFee.toLocaleString()}
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Hidden FX Spread Loss</span>
            <span class="text-sm font-bold text-rose-600">
              {fromMeta.symbol}{results.fxLossInSenderCurrency.toLocaleString()}
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Total Transfer Friction</span>
            <span class="text-sm font-bold text-primary">
              {fromMeta.symbol}{results.totalCostInSenderCurrency.toLocaleString()} ({results.effectiveFeePct}%)
            </span>
          </div>
        </div>
      </div>

      {/* INPUT CONTROLS & SIDE-BY-SIDE ANALYTICS */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Transfer Parameters</h3>
            <div class="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Shareable scenario URL copied to clipboard!');
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
                  applyPreset(REMITTANCE_FEE_CONFIG.presets[0]);
                }}
                class="px-3 py-1.5 bg-surface-strong hover:bg-hairline text-muted hover:text-ink text-xs font-semibold rounded-pill transition-colors border border-hairline focus:outline-none focus:ring-2 focus:ring-primary"
                title="Reset to defaults"
              >
                Reset
              </button>
            </div>
          </div>

          <div class="space-y-4">
            {/* SEND AMOUNT */}
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label for="send-amount" class="text-sm font-semibold text-ink">
                  You Send ({fromCurrency})
                </label>
                <div class="flex items-center bg-surface-strong px-3.5 py-1.5 rounded-xl border border-hairline focus-within:border-primary min-h-[44px]">
                  <span class="text-xs font-mono text-muted mr-1 font-bold">{fromMeta.symbol}</span>
                  <input
                    type="number"
                    id="send-amount"
                    value={sendAmount}
                    min="0"
                    max="1000000"
                    step="50"
                    onInput={(e) => {
                      setSendAmount(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-32 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                    aria-label="Send Amount input"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="50"
                value={sendAmount}
                onInput={(e) => {
                  setSendAmount(Number(e.currentTarget.value) || 0);
                  setActivePreset('');
                }}
                class="w-full h-3 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label="Send Amount slider"
              />
            </div>

            {/* CURRENCY SELECTORS & SWAP */}
            <div class="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center bg-surface-soft p-3.5 rounded-2xl border border-hairline">
              <div class="sm:col-span-5 space-y-1">
                <label for="from-currency-select" class="text-[11px] font-mono font-bold text-muted uppercase">From Currency</label>
                <select
                  id="from-currency-select"
                  value={fromCurrency}
                  onChange={(e) => {
                    setFromCurrency(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {SUPPORTED_CURRENCY_CODES.map((code) => {
                    const c = REFERENCE_EXCHANGE_RATES[code];
                    return (
                      <option key={code} value={code}>
                        {c.flag} {c.code} ({c.symbol})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div class="sm:col-span-1 flex justify-center py-1">
                <button
                  type="button"
                  onClick={handleSwapCurrencies}
                  class="p-2 bg-surface-strong hover:bg-hairline rounded-full border border-hairline text-primary transition-transform hover:rotate-180 duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  title="Swap source and target currencies"
                >
                  ⇄
                </button>
              </div>

              <div class="sm:col-span-5 space-y-1">
                <label for="to-currency-select" class="text-[11px] font-mono font-bold text-muted uppercase">To Currency</label>
                <select
                  id="to-currency-select"
                  value={toCurrency}
                  onChange={(e) => {
                    setToCurrency(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {SUPPORTED_CURRENCY_CODES.map((code) => {
                    const c = REFERENCE_EXCHANGE_RATES[code];
                    return (
                      <option key={code} value={code}>
                        {c.flag} {c.code} ({c.symbol})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* UPFRONT FIXED FEE & FX SPREAD */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label for="fixed-fee" class="text-sm font-semibold text-ink">
                    Fixed Transfer Fee
                  </label>
                  <div class="flex items-center bg-surface-strong px-3 py-1 rounded-xl border border-hairline focus-within:border-primary">
                    <span class="text-xs font-mono text-muted mr-1 font-bold">{fromMeta.symbol}</span>
                    <input
                      type="number"
                      id="fixed-fee"
                      value={fixedFee}
                      min="0"
                      max="1000"
                      step="0.5"
                      onInput={(e) => {
                        setFixedFee(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-24 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={fixedFee}
                  onInput={(e) => {
                    setFixedFee(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-full h-3 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label for="fx-spread" class="text-sm font-semibold text-ink">
                    FX Markup / Spread
                  </label>
                  <div class="flex items-center bg-surface-strong px-3 py-1 rounded-xl border border-hairline focus-within:border-primary">
                    <input
                      type="number"
                      id="fx-spread"
                      value={fxSpreadPct}
                      min="0"
                      max="20"
                      step="0.1"
                      onInput={(e) => {
                        setFxSpreadPct(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-20 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                    />
                    <span class="text-xs font-mono text-muted ml-1 font-bold">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={fxSpreadPct}
                  onInput={(e) => {
                    setFxSpreadPct(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-full h-3 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* FEE MODE SELECTOR */}
            <div class="space-y-1.5">
              <label for="fee-mode-select" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                Fee Payment Method
              </label>
              <select
                id="fee-mode-select"
                value={feeMode}
                onChange={(e) => {
                  setFeeMode(e.currentTarget.value);
                  setActivePreset('');
                }}
                class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-sans text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ADD_ON_TOP">Fee Paid On Top (Sender pays amount + fee separately)</option>
                <option value="DEDUCT_FROM_SEND">Fee Deducted (Fee deducted from send amount before FX)</option>
              </select>
            </div>

            {/* ADVANCED TOGGLE */}
            <div class="pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                class="text-xs font-mono text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{showAdvanced ? '▲ Hide' : '▼ Show'} Advanced (Percentage Fee, Custom FX Rate, Recipient Bank Fees)</span>
              </button>

              {showAdvanced && (
                <div class="mt-4 p-4 bg-surface-soft rounded-2xl border border-hairline space-y-4">
                  <div class="grid sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label for="percentage-fee" class="text-xs font-mono text-muted uppercase font-bold block">
                        Variable Fee Percentage (%)
                      </label>
                      <input
                        type="number"
                        id="percentage-fee"
                        value={percentageFee}
                        min="0"
                        max="20"
                        step="0.1"
                        onInput={(e) => {
                          setPercentageFee(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div class="space-y-1.5">
                      <label for="custom-rate" class="text-xs font-mono text-muted uppercase font-bold block">
                        Custom FX Rate (1 {fromCurrency} = ? {toCurrency})
                      </label>
                      <input
                        type="number"
                        id="custom-rate"
                        placeholder={`Default: ${results.customerRate}`}
                        value={customRate}
                        step="0.0001"
                        onInput={(e) => {
                          setCustomRate(e.currentTarget.value);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div class="grid sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label for="recipient-fee" class="text-xs font-mono text-muted uppercase font-bold block">
                        Recipient Bank Fee ({toCurrency})
                      </label>
                      <input
                        type="number"
                        id="recipient-fee"
                        value={recipientFee}
                        min="0"
                        step="50"
                        onInput={(e) => {
                          setRecipientFee(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div class="space-y-1.5">
                      <label for="intermediary-fee" class="text-xs font-mono text-muted uppercase font-bold block">
                        SWIFT Intermediary Fee ({toCurrency})
                      </label>
                      <input
                        type="number"
                        id="intermediary-fee"
                        value={intermediaryFee}
                        min="0"
                        step="50"
                        onInput={(e) => {
                          setIntermediaryFee(Number(e.currentTarget.value) || 0);
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

        {/* RIGHT COLUMN: FEE COMPOSITION & FX RATES */}
        <div class="lg:col-span-6 space-y-6">
          {/* RATE COMPARISON CARD */}
          <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
            <h3 class="text-xl font-bold font-heading text-ink">Exchange Rate Transparency</h3>
            
            <div class="grid grid-cols-2 gap-3 font-mono text-center">
              <div class="p-4 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Mid-Market Rate (Zero Spread)</span>
                <span class="text-base font-extrabold text-ink block mt-1">
                  1 {fromCurrency} = {toMeta.symbol}{results.midMarketRate}
                </span>
                <span class="text-[10px] text-emerald-600 font-semibold block mt-0.5">Indicative Benchmark</span>
              </div>

              <div class="p-4 bg-primary/10 rounded-2xl border border-primary/30">
                <span class="text-[10px] text-primary uppercase font-bold block">Your Offered Rate</span>
                <span class="text-base font-extrabold text-primary block mt-1">
                  1 {fromCurrency} = {toMeta.symbol}{results.customerRate}
                </span>
                <span class="text-[10px] text-rose-600 font-semibold block mt-0.5">
                  -{results.fxSpreadPct}% Dealer Spread
                </span>
              </div>
            </div>

            {/* COST COMPOSITION PROGRESS BARS */}
            <div class="space-y-3 pt-2">
              <span class="text-xs font-mono font-bold uppercase text-muted block">
                Total Remittance Friction Composition ({fromMeta.symbol}{results.totalCostInSenderCurrency.toLocaleString()})
              </span>

              {/* Upfront Transfer Fee */}
              <div class="space-y-1 p-3 rounded-2xl bg-surface-strong/60 border border-hairline">
                <div class="flex items-center justify-between text-xs font-semibold">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span class="text-ink">Explicit Upfront Transfer Fee</span>
                  </div>
                  <div class="flex items-center gap-2 font-mono">
                    <span class="text-muted text-[11px]">({results.upfrontFeeSharePct}%)</span>
                    <span class="font-bold text-ink">{fromMeta.symbol}{results.totalSenderFee.toLocaleString()}</span>
                  </div>
                </div>
                <div class="w-full h-2 bg-hairline rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-amber-500" style={{ width: `${results.upfrontFeeSharePct}%` }}></div>
                </div>
              </div>

              {/* Hidden FX Spread */}
              <div class="space-y-1 p-3 rounded-2xl bg-surface-strong/60 border border-hairline">
                <div class="flex items-center justify-between text-xs font-semibold">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span class="text-ink">Hidden Exchange Rate Markup (Spread)</span>
                  </div>
                  <div class="flex items-center gap-2 font-mono">
                    <span class="text-muted text-[11px]">({results.fxSpreadSharePct}%)</span>
                    <span class="font-bold text-rose-600">{fromMeta.symbol}{results.fxLossInSenderCurrency.toLocaleString()}</span>
                  </div>
                </div>
                <div class="w-full h-2 bg-hairline rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-rose-500" style={{ width: `${results.fxSpreadSharePct}%` }}></div>
                </div>
              </div>

              {/* Recipient / Correspondent Deductions */}
              {results.totalRecipientSideDeductions > 0 && (
                <div class="space-y-1 p-3 rounded-2xl bg-surface-strong/60 border border-hairline">
                  <div class="flex items-center justify-between text-xs font-semibold">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                      <span class="text-ink">Recipient & Intermediary Deductions</span>
                    </div>
                    <div class="flex items-center gap-2 font-mono">
                      <span class="text-muted text-[11px]">({results.recipientFeeSharePct}%)</span>
                      <span class="font-bold text-indigo-600">{fromMeta.symbol}{results.recipientFeesInSenderCurrency.toLocaleString()}</span>
                    </div>
                  </div>
                  <div class="w-full h-2 bg-hairline rounded-full overflow-hidden">
                    <div class="h-full rounded-full bg-indigo-500" style={{ width: `${results.recipientFeeSharePct}%` }}></div>
                  </div>
                </div>
              )}
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

      {/* ITEMIZED REMITTANCE AUDIT SCHEDULE */}
      <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">Comprehensive Remittance Audit Matrix</h3>
            <p class="text-xs text-muted mt-0.5">Step-by-step breakdown of sender principal, fees, FX compounding, and final payout</p>
          </div>
          <span class="text-xs font-mono font-bold text-primary bg-surface-strong px-3 py-1 rounded-pill border border-hairline">
            ITEMIZED SCHEDULE
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr class="border-b border-hairline bg-surface-soft text-muted uppercase">
                <th class="py-2.5 px-3">Transaction Step</th>
                <th class="py-2.5 px-3">Calculation Basis</th>
                <th class="py-2.5 px-3">Sender Outflow ({fromCurrency})</th>
                <th class="py-2.5 px-3">Beneficiary Value ({toCurrency})</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">1. Gross Send Principal</td>
                <td class="py-2.5 px-3 text-muted">Sender Input Amount</td>
                <td class="py-2.5 px-3 text-ink font-bold">{fromMeta.symbol}{results.sendAmount.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-muted">—</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-amber-600">2. Explicit Transfer Fee</td>
                <td class="py-2.5 px-3 text-amber-600">
                  Fixed ({fromMeta.symbol}{results.fixedFee}) + Variable ({results.percentageFee}%)
                </td>
                <td class="py-2.5 px-3 text-amber-600 font-bold">{fromMeta.symbol}{results.totalSenderFee.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-muted">—</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors bg-surface-soft/30">
                <td class="py-2.5 px-3 font-bold text-primary">↳ Total Sender Outflow</td>
                <td class="py-2.5 px-3 text-primary">{results.feeMode === 'ADD_ON_TOP' ? 'Send Amount + Fee Paid on Top' : 'Send Amount (Fee Deducted from Net)'}</td>
                <td class="py-2.5 px-3 text-primary font-bold">{fromMeta.symbol}{results.totalSenderOutflow.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-muted">—</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">3. Mid-Market Benchmark Value</td>
                <td class="py-2.5 px-3 text-muted">Zero-spread rate (1 {fromCurrency} = {toMeta.symbol}{results.midMarketRate})</td>
                <td class="py-2.5 px-3 text-muted">—</td>
                <td class="py-2.5 px-3 text-ink font-semibold">
                  {toMeta.symbol}{results.idealGrossReceived.toLocaleString(undefined, { minimumFractionDigits: toDecimals, maximumFractionDigits: toDecimals })}
                </td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-rose-600">4. Hidden FX Markup / Spread</td>
                <td class="py-2.5 px-3 text-rose-600">-{results.fxSpreadPct}% Spread on Exchange Rate</td>
                <td class="py-2.5 px-3 text-rose-600 font-bold">{fromMeta.symbol}{results.fxLossInSenderCurrency.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-rose-600 font-bold">
                  -{toMeta.symbol}{results.fxLossInRecipientCurrency.toLocaleString(undefined, { minimumFractionDigits: toDecimals, maximumFractionDigits: toDecimals })}
                </td>
              </tr>
              {results.totalRecipientSideDeductions > 0 && (
                <tr class="hover:bg-surface-soft/50 transition-colors">
                  <td class="py-2.5 px-3 font-bold text-indigo-600">5. Recipient & SWIFT Deductions</td>
                  <td class="py-2.5 px-3 text-indigo-600">Receiving Bank + Intermediary Correspondent Fees</td>
                  <td class="py-2.5 px-3 text-indigo-600 font-bold">{fromMeta.symbol}{results.recipientFeesInSenderCurrency.toLocaleString()}</td>
                  <td class="py-2.5 px-3 text-indigo-600 font-bold">
                    -{toMeta.symbol}{results.totalRecipientSideDeductions.toLocaleString(undefined, { minimumFractionDigits: toDecimals, maximumFractionDigits: toDecimals })}
                  </td>
                </tr>
              )}
              <tr class="border-t-2 border-hairline font-bold bg-surface-soft/60">
                <td class="py-3 px-3 text-ink uppercase text-sm">Net Beneficiary Payout</td>
                <td class="py-3 px-3 text-semantic-success text-xs">Effective Net FX: 1 {fromCurrency} = {toMeta.symbol}{results.effectiveNetFxRate}</td>
                <td class="py-3 px-3 text-primary text-xs">Total Friction: {fromMeta.symbol}{results.totalCostInSenderCurrency.toLocaleString()} ({results.effectiveFeePct}%)</td>
                <td class="py-3 px-3 text-semantic-success font-black text-sm">
                  {toMeta.symbol}{results.netRecipientAmount.toLocaleString(undefined, { minimumFractionDigits: toDecimals, maximumFractionDigits: toDecimals })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
