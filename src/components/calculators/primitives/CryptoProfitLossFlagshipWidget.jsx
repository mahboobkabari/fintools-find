import { useState, useMemo } from 'preact/hooks';
import {
  calculateCryptoProfitLoss,
  FIAT_CURRENCIES,
} from '../../../calculators/crypto/crypto-profit-loss-calculator.js';
import { CRYPTO_PROFIT_LOSS_CONFIG } from '../../../calculators/configs/crypto-profit-loss-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

export default function CryptoProfitLossFlagshipWidget() {
  const [activePreset, setActivePreset] = useState('btc_swing_profit');

  const [assetName, setAssetName] = useState('Bitcoin (BTC)');
  const [quantity, setQuantity] = useState(0.25);
  const [buyPrice, setBuyPrice] = useState(48000);
  const [sellPrice, setSellPrice] = useState(68000);
  const [buyFeePct, setBuyFeePct] = useState(0.1);
  const [sellFeePct, setSellFeePct] = useState(0.1);
  const [buyFixedFee, setBuyFixedFee] = useState(0);
  const [sellFixedFee, setSellFixedFee] = useState(0);
  const [buyGasFee, setBuyGasFee] = useState(5);
  const [sellGasFee, setSellGasFee] = useState(5);
  const [currency, setCurrency] = useState('USD');
  const [positionMode, setPositionMode] = useState('REALIZED');
  const [showAdvancedFees, setShowAdvancedFees] = useState(false);

  // URL Sync
  useUrlSync(
    {
      assetName,
      quantity,
      buyPrice,
      sellPrice,
      buyFeePct,
      sellFeePct,
      buyFixedFee,
      sellFixedFee,
      buyGasFee,
      sellGasFee,
      currency,
      positionMode,
    },
    (params) => {
      if (params.assetName) setAssetName(params.assetName);
      if (params.quantity !== undefined) setQuantity(Number(params.quantity) || 0.25);
      if (params.buyPrice !== undefined) setBuyPrice(Number(params.buyPrice) || 48000);
      if (params.sellPrice !== undefined) setSellPrice(Number(params.sellPrice) || 68000);
      if (params.buyFeePct !== undefined) setBuyFeePct(Number(params.buyFeePct) || 0);
      if (params.sellFeePct !== undefined) setSellFeePct(Number(params.sellFeePct) || 0);
      if (params.buyFixedFee !== undefined) setBuyFixedFee(Number(params.buyFixedFee) || 0);
      if (params.sellFixedFee !== undefined) setSellFixedFee(Number(params.sellFixedFee) || 0);
      if (params.buyGasFee !== undefined) setBuyGasFee(Number(params.buyGasFee) || 0);
      if (params.sellGasFee !== undefined) setSellGasFee(Number(params.sellGasFee) || 0);
      if (params.currency) setCurrency(params.currency);
      if (params.positionMode) setPositionMode(params.positionMode);
      setActivePreset('');
    }
  );

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setAssetName(p.assetName);
    setQuantity(p.quantity);
    setBuyPrice(p.buyPrice);
    setSellPrice(p.sellPrice);
    setBuyFeePct(p.buyFeePct);
    setSellFeePct(p.sellFeePct);
    setBuyFixedFee(p.buyFixedFee);
    setSellFixedFee(p.sellFixedFee);
    setBuyGasFee(p.buyGasFee);
    setSellGasFee(p.sellGasFee);
    setCurrency(p.currency);
    setPositionMode(p.positionMode);
  };

  const results = useMemo(() => {
    return calculateCryptoProfitLoss({
      assetName,
      quantity,
      buyPrice,
      sellPrice,
      buyFeePct,
      sellFeePct,
      buyFixedFee,
      sellFixedFee,
      buyGasFee,
      sellGasFee,
      currency,
      positionMode,
    });
  }, [
    assetName,
    quantity,
    buyPrice,
    sellPrice,
    buyFeePct,
    sellFeePct,
    buyFixedFee,
    sellFixedFee,
    buyGasFee,
    sellGasFee,
    currency,
    positionMode,
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
            Representative Crypto Market Archetypes & Presets
          </span>
          <span class="text-xs font-mono text-primary font-semibold">1-Tap Auto Fill</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CRYPTO_PROFIT_LOSS_CONFIG.presets.map((p) => {
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
        results.status === 'PROFIT'
          ? 'bg-gradient-to-br from-emerald-500/10 via-canvas to-primary/10 border-emerald-500/40'
          : results.status === 'LOSS'
          ? 'bg-gradient-to-br from-rose-500/10 via-canvas to-amber-500/10 border-rose-500/40'
          : 'bg-gradient-to-br from-primary/10 via-canvas to-surface-strong border-primary/40'
      }`}>
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-white font-mono text-xs font-bold uppercase ${
            results.status === 'PROFIT' ? 'bg-emerald-600' : results.status === 'LOSS' ? 'bg-rose-600' : 'bg-primary'
          }`}>
            ⚡ {results.positionMode === 'REALIZED' ? 'REALIZED TRADE' : 'UNREALIZED POSITION'} · {results.assetName}
          </span>
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase text-primary bg-surface-strong">
            BREAK-EVEN: {sym}{results.breakEvenPrice.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
          </span>
        </div>
        <h2 class={`text-2xl sm:text-4xl font-heading font-extrabold leading-tight ${
          results.status === 'PROFIT' ? 'text-emerald-700' : results.status === 'LOSS' ? 'text-rose-700' : 'text-ink'
        }`}>
          {results.heroVerdict}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Acquired <strong>{results.quantity.toLocaleString()} units</strong> for a total cost basis of{' '}
          <strong>{sym}{results.totalCostBasis.toLocaleString()}</strong> ({sym}{results.effectiveBuyPrice.toLocaleString()} effective/unit).
          Current / Exit value yields <strong>{sym}{results.netProceeds.toLocaleString()}</strong> net of all fees.
        </p>
        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Total Cost Basis</span>
            <span class="text-sm font-bold text-ink">{sym}{results.totalCostBasis.toLocaleString()}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Net Sale Proceeds</span>
            <span class="text-sm font-bold text-ink">{sym}{results.netProceeds.toLocaleString()}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Net Profit / Loss</span>
            <span class={`text-sm font-black ${results.status === 'PROFIT' ? 'text-emerald-600' : results.status === 'LOSS' ? 'text-rose-600' : 'text-ink'}`}>
              {results.netProfitLoss >= 0 ? '+' : ''}{sym}{results.netProfitLoss.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Return on Investment</span>
            <span class={`text-sm font-black ${results.status === 'PROFIT' ? 'text-emerald-600' : results.status === 'LOSS' ? 'text-rose-600' : 'text-ink'}`}>
              {results.roiPct >= 0 ? '+' : ''}{results.roiPct}%
            </span>
          </div>
        </div>
      </div>

      {/* INPUT CONTROLS & SIDE-BY-SIDE ANALYTICS */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Trade Parameters</h3>
            <div class="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Shareable trade scenario URL copied to clipboard!');
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
                  applyPreset(CRYPTO_PROFIT_LOSS_CONFIG.presets[0]);
                }}
                class="px-3 py-1.5 bg-surface-strong hover:bg-hairline text-muted hover:text-ink text-xs font-semibold rounded-pill transition-colors border border-hairline focus:outline-none focus:ring-2 focus:ring-primary"
                title="Reset to defaults"
              >
                Reset
              </button>
            </div>
          </div>

          <div class="space-y-4">
            {/* ASSET NAME & CURRENCY */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="asset-name" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Asset Symbol / Name
                </label>
                <input
                  id="asset-name"
                  type="text"
                  value={assetName}
                  onInput={(e) => {
                    setAssetName(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-sans text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div class="space-y-1.5">
                <label for="fiat-currency-select" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Quote Fiat Currency
                </label>
                <select
                  id="fiat-currency-select"
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

            {/* REALIZED VS UNREALIZED TOGGLE */}
            <div class="space-y-1.5">
              <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                Position Status
              </span>
              <div class="grid grid-cols-2 gap-2 bg-surface-soft p-1.5 rounded-2xl border border-hairline">
                <button
                  type="button"
                  onClick={() => {
                    setPositionMode('UNREALIZED');
                    setActivePreset('');
                  }}
                  class={`py-2 px-3 rounded-xl font-heading text-xs font-bold transition-all ${
                    positionMode === 'UNREALIZED'
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Holding (Unrealized)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPositionMode('REALIZED');
                    setActivePreset('');
                  }}
                  class={`py-2 px-3 rounded-xl font-heading text-xs font-bold transition-all ${
                    positionMode === 'REALIZED'
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Closed (Realized Trade)
                </button>
              </div>
            </div>

            {/* QUANTITY */}
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label for="crypto-quantity" class="text-sm font-semibold text-ink">
                  Total Quantity (Coins / Tokens)
                </label>
                <div class="flex items-center bg-surface-strong px-3.5 py-1.5 rounded-xl border border-hairline focus-within:border-primary min-h-[44px]">
                  <input
                    type="number"
                    id="crypto-quantity"
                    value={quantity}
                    min="0"
                    step="0.01"
                    onInput={(e) => {
                      setQuantity(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-32 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                    aria-label="Cryptocurrency Quantity input"
                  />
                  <span class="text-xs font-mono text-muted ml-1.5 font-bold">Units</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.05"
                value={quantity}
                onInput={(e) => {
                  setQuantity(Number(e.currentTarget.value) || 0);
                  setActivePreset('');
                }}
                class="w-full h-3 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* BUY PRICE & SELL PRICE */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label for="buy-price" class="text-sm font-semibold text-ink">
                    Buy / Entry Price
                  </label>
                  <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                    <span class="text-xs font-mono text-muted mr-1 font-bold">{sym}</span>
                    <input
                      type="number"
                      id="buy-price"
                      value={buyPrice}
                      min="0"
                      step="100"
                      onInput={(e) => {
                        setBuyPrice(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-28 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150000"
                  step="500"
                  value={buyPrice}
                  onInput={(e) => {
                    setBuyPrice(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-full h-3 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label for="sell-price" class="text-sm font-semibold text-ink">
                    {positionMode === 'REALIZED' ? 'Exit / Sell Price' : 'Current Market Price'}
                  </label>
                  <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                    <span class="text-xs font-mono text-muted mr-1 font-bold">{sym}</span>
                    <input
                      type="number"
                      id="sell-price"
                      value={sellPrice}
                      min="0"
                      step="100"
                      onInput={(e) => {
                        setSellPrice(Number(e.currentTarget.value) || 0);
                        setActivePreset('');
                      }}
                      class="w-28 bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150000"
                  step="500"
                  value={sellPrice}
                  onInput={(e) => {
                    setSellPrice(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-full h-3 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* EXCHANGE TRADING FEES */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="buy-fee-pct" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Buy Exchange Fee (%)
                </label>
                <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                  <input
                    type="number"
                    id="buy-fee-pct"
                    value={buyFeePct}
                    min="0"
                    max="10"
                    step="0.05"
                    onInput={(e) => {
                      setBuyFeePct(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  />
                  <span class="text-xs font-mono text-muted ml-1 font-bold">%</span>
                </div>
              </div>

              <div class="space-y-1.5">
                <label for="sell-fee-pct" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Sell Exchange Fee (%)
                </label>
                <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                  <input
                    type="number"
                    id="sell-fee-pct"
                    value={sellFeePct}
                    min="0"
                    max="10"
                    step="0.05"
                    onInput={(e) => {
                      setSellFeePct(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                  />
                  <span class="text-xs font-mono text-muted ml-1 font-bold">%</span>
                </div>
              </div>
            </div>

            {/* ADVANCED FEES (GAS & FIXED CHARGES) TOGGLE */}
            <div class="pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setShowAdvancedFees(!showAdvancedFees)}
                class="text-xs font-mono text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{showAdvancedFees ? '▲ Hide' : '▼ Show'} Network Gas &amp; Fixed Fiat Fees</span>
              </button>

              {showAdvancedFees && (
                <div class="mt-4 p-4 bg-surface-soft rounded-2xl border border-hairline space-y-4">
                  <div class="grid sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label for="buy-gas-fee" class="text-xs font-mono text-muted uppercase font-bold block">
                        Buy Gas / Network Fee ({sym})
                      </label>
                      <input
                        type="number"
                        id="buy-gas-fee"
                        value={buyGasFee}
                        min="0"
                        step="1"
                        onInput={(e) => {
                          setBuyGasFee(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div class="space-y-1.5">
                      <label for="sell-gas-fee" class="text-xs font-mono text-muted uppercase font-bold block">
                        Sell Gas / Network Fee ({sym})
                      </label>
                      <input
                        type="number"
                        id="sell-gas-fee"
                        value={sellGasFee}
                        min="0"
                        step="1"
                        onInput={(e) => {
                          setSellGasFee(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div class="grid sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label for="buy-fixed-fee" class="text-xs font-mono text-muted uppercase font-bold block">
                        Fixed Purchase Surcharge ({sym})
                      </label>
                      <input
                        type="number"
                        id="buy-fixed-fee"
                        value={buyFixedFee}
                        min="0"
                        step="5"
                        onInput={(e) => {
                          setBuyFixedFee(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div class="space-y-1.5">
                      <label for="sell-fixed-fee" class="text-xs font-mono text-muted uppercase font-bold block">
                        Fixed Exit Surcharge ({sym})
                      </label>
                      <input
                        type="number"
                        id="sell-fixed-fee"
                        value={sellFixedFee}
                        min="0"
                        step="5"
                        onInput={(e) => {
                          setSellFixedFee(Number(e.currentTarget.value) || 0);
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
            <h3 class="text-xl font-bold font-heading text-ink">Analytical Break-Even &amp; Thresholds</h3>
            
            <div class="grid grid-cols-2 gap-3 font-mono text-center">
              <div class="p-4 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Break-Even Exit Target</span>
                <span class="text-base sm:text-lg font-extrabold text-primary block mt-1">
                  {sym}{results.breakEvenPrice.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[10px] text-muted block mt-0.5">Includes all fees &amp; gas</span>
              </div>

              <div class="p-4 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Total Transaction Friction</span>
                <span class="text-base sm:text-lg font-extrabold text-rose-600 block mt-1">
                  {sym}{results.totalFeesPaid.toLocaleString()}
                </span>
                <span class="text-[10px] text-muted block mt-0.5">
                  Trading ({sym}{Math.round((results.buyTradingFee + results.sellTradingFee) * 100) / 100}) + Gas ({sym}{results.totalGasFeesPaid})
                </span>
              </div>
            </div>

            {/* CAPITAL OUTFLOW VS PROCEEDS PROGRESS */}
            <div class="space-y-3 pt-2">
              <span class="text-xs font-mono font-bold uppercase text-muted block">
                Position Capital Comparison
              </span>

              {/* Total Cost Basis */}
              <div class="space-y-1 p-3 rounded-2xl bg-surface-strong/60 border border-hairline">
                <div class="flex items-center justify-between text-xs font-semibold">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span class="text-ink">Total Capital Invested (Cost Basis)</span>
                  </div>
                  <span class="font-mono font-bold text-ink">{sym}{results.totalCostBasis.toLocaleString()}</span>
                </div>
              </div>

              {/* Net Sale Proceeds */}
              <div class="space-y-1 p-3 rounded-2xl bg-surface-strong/60 border border-hairline">
                <div class="flex items-center justify-between text-xs font-semibold">
                  <div class="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${results.status === 'PROFIT' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span class="text-ink">Net Liquidatable Value (Proceeds)</span>
                  </div>
                  <span className={`font-mono font-bold ${results.status === 'PROFIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {sym}{results.netProceeds.toLocaleString()}
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

      {/* ITEMIZED P/L AUDIT MATRIX */}
      <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">Comprehensive Position &amp; Fee Audit Schedule</h3>
            <p class="text-xs text-muted mt-0.5">Itemized transaction statement detailing gross cost, trading fees, network gas, and realized return</p>
          </div>
          <span class="text-xs font-mono font-bold text-primary bg-surface-strong px-3 py-1 rounded-pill border border-hairline">
            TRANSACTION AUDIT
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr class="border-b border-hairline bg-surface-soft text-muted uppercase">
                <th class="py-2.5 px-3">Transaction Leg</th>
                <th class="py-2.5 px-3">Calculation Basis</th>
                <th class="py-2.5 px-3">Price / Rate</th>
                <th class="py-2.5 px-3">Financial Value ({currency})</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">1. Gross Acquisition Cost</td>
                <td class="py-2.5 px-3 text-muted">{results.quantity.toLocaleString()} units @ {sym}{results.buyPrice.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-muted">{sym}{results.buyPrice.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-ink font-bold">{sym}{results.grossCostBasis.toLocaleString()}</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-amber-600">2. Acquisition Fees &amp; Gas</td>
                <td class="py-2.5 px-3 text-amber-600">Trading ({results.buyFeePct}%) + Fixed + Gas ({sym}{results.buyGasFee})</td>
                <td class="py-2.5 px-3 text-muted">—</td>
                <td class="py-2.5 px-3 text-amber-600 font-bold">+{sym}{results.totalBuyFees.toLocaleString()}</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors bg-surface-soft/30">
                <td class="py-2.5 px-3 font-bold text-primary">↳ Total Cost Basis</td>
                <td class="py-2.5 px-3 text-primary">Gross Cost + All Acquisition Fees</td>
                <td class="py-2.5 px-3 text-primary font-bold">{sym}{results.effectiveBuyPrice.toLocaleString()}/unit</td>
                <td class="py-2.5 px-3 text-primary font-bold">{sym}{results.totalCostBasis.toLocaleString()}</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">3. Gross Exit Proceeds</td>
                <td class="py-2.5 px-3 text-muted">{results.quantity.toLocaleString()} units @ {sym}{results.sellPrice.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-muted">{sym}{results.sellPrice.toLocaleString()}</td>
                <td class="py-2.5 px-3 text-ink font-semibold">{sym}{results.grossProceeds.toLocaleString()}</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors">
                <td class="py-2.5 px-3 font-bold text-rose-600">4. Exit Trading Fees &amp; Gas</td>
                <td class="py-2.5 px-3 text-rose-600">Trading ({results.sellFeePct}%) + Fixed + Gas ({sym}{results.sellGasFee})</td>
                <td class="py-2.5 px-3 text-muted">—</td>
                <td class="py-2.5 px-3 text-rose-600 font-bold">-{sym}{results.totalSellFees.toLocaleString()}</td>
              </tr>
              <tr class="hover:bg-surface-soft/50 transition-colors bg-surface-soft/30">
                <td class="py-2.5 px-3 font-bold text-primary">↳ Net Liquidatable Proceeds</td>
                <td class="py-2.5 px-3 text-primary">Gross Proceeds - All Exit Fees</td>
                <td class="py-2.5 px-3 text-primary font-bold">{sym}{results.effectiveSellPrice.toLocaleString()}/unit</td>
                <td class="py-2.5 px-3 text-primary font-bold">{sym}{results.netProceeds.toLocaleString()}</td>
              </tr>
              <tr class="border-t-2 border-hairline font-bold bg-surface-soft/60">
                <td class="py-3 px-3 text-ink uppercase text-sm">Net Profit / Loss</td>
                <td className={`py-3 px-3 text-xs ${results.status === 'PROFIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ROI: {results.roiPct >= 0 ? '+' : ''}{results.roiPct}% (Gross ROI: {results.grossRoiPct}%)
                </td>
                <td class="py-3 px-3 text-muted text-xs">Total Friction: {sym}{results.totalFeesPaid.toLocaleString()}</td>
                <td className={`py-3 px-3 font-black text-sm ${results.status === 'PROFIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {results.netProfitLoss >= 0 ? '+' : ''}{sym}{results.netProfitLoss.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
