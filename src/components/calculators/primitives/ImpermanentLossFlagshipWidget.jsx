import { useState, useMemo } from 'preact/hooks';
import {
  calculateImpermanentLoss,
  FIAT_CURRENCIES,
} from '../../../calculators/crypto/impermanent-loss-calculator.js';
import { IMPERMANENT_LOSS_CONFIG } from '../../../calculators/configs/impermanent-loss-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

export default function ImpermanentLossFlagshipWidget() {
  const [activePreset, setActivePreset] = useState('eth_2x_bull_move');

  const [calculationMode, setCalculationMode] = useState('EXPLICIT_PRICES');
  const [tokenAName, setTokenAName] = useState('Ethereum (ETH)');
  const [tokenBName, setTokenBName] = useState('USDC / USD');
  const [initialPriceA, setInitialPriceA] = useState(2000);
  const [finalPriceA, setFinalPriceA] = useState(4000);
  const [initialPriceB, setInitialPriceB] = useState(1.0);
  const [finalPriceB, setFinalPriceB] = useState(1.0);
  const [priceChangePctA, setPriceChangePctA] = useState(100);
  const [priceChangePctB, setPriceChangePctB] = useState(0);
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [feeAprPct, setFeeAprPct] = useState(15);
  const [feeRevenueAmount, setFeeRevenueAmount] = useState(0);
  const [holdingDays, setHoldingDays] = useState(90);
  const [currency, setCurrency] = useState('USD');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // URL Sync
  useUrlSync(
    {
      calculationMode,
      tokenAName,
      tokenBName,
      initialPriceA,
      finalPriceA,
      initialPriceB,
      finalPriceB,
      priceChangePctA,
      priceChangePctB,
      initialInvestment,
      feeAprPct,
      feeRevenueAmount,
      holdingDays,
      currency,
    },
    (params) => {
      if (params.calculationMode) setCalculationMode(params.calculationMode);
      if (params.tokenAName) setTokenAName(params.tokenAName);
      if (params.tokenBName) setTokenBName(params.tokenBName);
      if (params.initialPriceA !== undefined) setInitialPriceA(Number(params.initialPriceA) || 2000);
      if (params.finalPriceA !== undefined) setFinalPriceA(Number(params.finalPriceA) || 4000);
      if (params.initialPriceB !== undefined) setInitialPriceB(Number(params.initialPriceB) || 1.0);
      if (params.finalPriceB !== undefined) setFinalPriceB(Number(params.finalPriceB) || 1.0);
      if (params.priceChangePctA !== undefined) setPriceChangePctA(Number(params.priceChangePctA) || 0);
      if (params.priceChangePctB !== undefined) setPriceChangePctB(Number(params.priceChangePctB) || 0);
      if (params.initialInvestment !== undefined) setInitialInvestment(Number(params.initialInvestment) || 10000);
      if (params.feeAprPct !== undefined) setFeeAprPct(Number(params.feeAprPct) || 0);
      if (params.feeRevenueAmount !== undefined) setFeeRevenueAmount(Number(params.feeRevenueAmount) || 0);
      if (params.holdingDays !== undefined) setHoldingDays(Number(params.holdingDays) || 90);
      if (params.currency) setCurrency(params.currency);
      setActivePreset('');
    }
  );

  const applyPreset = (p) => {
    setActivePreset(p.id);
    if (p.calculationMode) setCalculationMode(p.calculationMode);
    if (p.tokenAName) setTokenAName(p.tokenAName);
    if (p.tokenBName) setTokenBName(p.tokenBName);
    if (p.initialPriceA !== undefined) setInitialPriceA(p.initialPriceA);
    if (p.finalPriceA !== undefined) setFinalPriceA(p.finalPriceA);
    if (p.initialPriceB !== undefined) setInitialPriceB(p.initialPriceB);
    if (p.finalPriceB !== undefined) setFinalPriceB(p.finalPriceB);
    if (p.priceChangePctA !== undefined) setPriceChangePctA(p.priceChangePctA);
    if (p.priceChangePctB !== undefined) setPriceChangePctB(p.priceChangePctB);
    if (p.initialInvestment !== undefined) setInitialInvestment(p.initialInvestment);
    if (p.feeAprPct !== undefined) setFeeAprPct(p.feeAprPct);
    if (p.feeRevenueAmount !== undefined) setFeeRevenueAmount(p.feeRevenueAmount);
    if (p.holdingDays !== undefined) setHoldingDays(p.holdingDays);
    if (p.currency) setCurrency(p.currency);
  };

  const results = useMemo(() => {
    return calculateImpermanentLoss({
      tokenAName,
      tokenBName,
      initialPriceA,
      finalPriceA,
      initialPriceB,
      finalPriceB,
      initialInvestment,
      feeAprPct,
      feeRevenueAmount,
      holdingDays,
      currency,
      calculationMode,
      priceChangePctA,
      priceChangePctB,
    });
  }, [
    tokenAName,
    tokenBName,
    initialPriceA,
    finalPriceA,
    initialPriceB,
    finalPriceB,
    initialInvestment,
    feeAprPct,
    feeRevenueAmount,
    holdingDays,
    currency,
    calculationMode,
    priceChangePctA,
    priceChangePctB,
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

  // SVG IL Curve points calculation
  const curvePoints = useMemo(() => {
    // Map ratio from 0.1 to 5.0 to SVG coordinates (width 400, height 180)
    // X range: ratio 0.1 (x=20) to ratio 5.0 (x=380) (logarithmic or linear spacing)
    const points = [];
    const ratios = [0.1, 0.2, 0.3, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0];
    ratios.forEach((r) => {
      const factor = (2 * Math.sqrt(r)) / (1 + r);
      const ilPct = (factor - 1) * 100; // 0% to -45%
      // x: ratio 0.1 -> 30, ratio 1.0 -> 180, ratio 5.0 -> 380
      const x = 30 + ((r - 0.1) / (5.0 - 0.1)) * 350;
      // y: 0% IL -> y=30, -50% IL -> y=160
      const y = 30 + (Math.abs(ilPct) / 50) * 130;
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    });
    return points.join(' ');
  }, []);

  // Current marker on SVG curve
  const currentMarker = useMemo(() => {
    const r = Math.max(0.1, Math.min(5.0, results.meta.priceRatio));
    const x = 30 + ((r - 0.1) / (5.0 - 0.1)) * 350;
    const y = 30 + (Math.min(50, Math.abs(results.summary.pureImpermanentLossPct)) / 50) * 130;
    return { x, y };
  }, [results.meta.priceRatio, results.summary.pureImpermanentLossPct]);

  return (
    <div class="space-y-10">
      {/* PRESETS BAR */}
      <section class="space-y-3" role="region" aria-label="Preset Scenarios">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted">
            Representative DeFi AMM Pool Scenarios
          </span>
          <span class="text-xs font-mono text-primary font-semibold">1-Tap Fill</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {IMPERMANENT_LOSS_CONFIG.presets.map((p) => {
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
        {/* LEFT COLUMN: CONTROLS */}
        <div class="lg:col-span-6 space-y-6">
          <div class="bg-surface border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-4">
              <h3 class="text-lg font-bold font-heading text-ink">50/50 Liquidity Pool Setup</h3>
              <div class="flex items-center gap-1.5 bg-surface-soft p-1 rounded-xl border border-hairline">
                <button
                  type="button"
                  onClick={() => {
                    setCalculationMode('EXPLICIT_PRICES');
                    setActivePreset('');
                  }}
                  class={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    calculationMode === 'EXPLICIT_PRICES'
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Spot Prices
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalculationMode('PERCENTAGE_CHANGE');
                    setActivePreset('');
                  }}
                  class={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    calculationMode === 'PERCENTAGE_CHANGE'
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  % Price Move
                </button>
              </div>
            </div>

            {/* ASSET NAMES & CURRENCY */}
            <div class="grid sm:grid-cols-3 gap-3">
              <div class="space-y-1">
                <label for="token-a-name" class="text-[11px] font-mono font-bold text-muted uppercase tracking-wider block">
                  Token A (Base)
                </label>
                <input
                  type="text"
                  id="token-a-name"
                  value={tokenAName}
                  onInput={(e) => {
                    setTokenAName(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-heading text-xs font-bold text-ink"
                />
              </div>

              <div class="space-y-1">
                <label for="token-b-name" class="text-[11px] font-mono font-bold text-muted uppercase tracking-wider block">
                  Token B (Quote)
                </label>
                <input
                  type="text"
                  id="token-b-name"
                  value={tokenBName}
                  onInput={(e) => {
                    setTokenBName(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-heading text-xs font-bold text-ink"
                />
              </div>

              <div class="space-y-1">
                <label for="il-currency-select" class="text-[11px] font-mono font-bold text-muted uppercase tracking-wider block">
                  Quote Currency
                </label>
                <select
                  id="il-currency-select"
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

            {/* INITIAL CAPITAL INVESTMENT */}
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label for="initial-investment-input" class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                  Total Initial Deposit (50% in A + 50% in B)
                </label>
                <span class="text-xs font-mono font-bold text-primary">
                  {sym}{initialInvestment.toLocaleString()}
                </span>
              </div>
              <div class="flex items-center bg-surface-strong px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                <span class="text-xs font-mono text-muted mr-1.5 font-bold">{sym}</span>
                <input
                  type="number"
                  id="initial-investment-input"
                  value={initialInvestment}
                  min="1"
                  step="500"
                  onInput={(e) => {
                    setInitialInvestment(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                />
              </div>
            </div>

            {/* EXPLICIT SPOT PRICES MODE */}
            {calculationMode === 'EXPLICIT_PRICES' ? (
              <div class="space-y-4 p-4 bg-surface-soft rounded-2xl border border-hairline">
                <span class="text-xs font-mono font-bold text-ink uppercase block">
                  Token Spot Prices in Fiat ({sym})
                </span>

                <div class="grid sm:grid-cols-2 gap-4">
                  {/* TOKEN A PRICES */}
                  <div class="space-y-3 p-3 bg-canvas rounded-xl border border-hairline">
                    <span class="text-xs font-bold text-primary block">{tokenAName}</span>
                    <div class="space-y-1">
                      <label for="initial-price-a" class="text-[10px] font-mono text-muted uppercase block">
                        Initial Price ({sym})
                      </label>
                      <input
                        type="number"
                        id="initial-price-a"
                        value={initialPriceA}
                        min="0.00000001"
                        step="100"
                        onInput={(e) => {
                          setInitialPriceA(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-1.5 bg-surface border border-hairline rounded font-mono text-xs font-bold text-ink text-right"
                      />
                    </div>
                    <div class="space-y-1">
                      <label for="final-price-a" class="text-[10px] font-mono text-muted uppercase block">
                        Final Price ({sym})
                      </label>
                      <input
                        type="number"
                        id="final-price-a"
                        value={finalPriceA}
                        min="0.00000001"
                        step="100"
                        onInput={(e) => {
                          setFinalPriceA(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-1.5 bg-surface border border-hairline rounded font-mono text-xs font-bold text-ink text-right"
                      />
                    </div>
                  </div>

                  {/* TOKEN B PRICES */}
                  <div class="space-y-3 p-3 bg-canvas rounded-xl border border-hairline">
                    <span class="text-xs font-bold text-ink block">{tokenBName}</span>
                    <div class="space-y-1">
                      <label for="initial-price-b" class="text-[10px] font-mono text-muted uppercase block">
                        Initial Price ({sym})
                      </label>
                      <input
                        type="number"
                        id="initial-price-b"
                        value={initialPriceB}
                        min="0.00000001"
                        step="0.1"
                        onInput={(e) => {
                          setInitialPriceB(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-1.5 bg-surface border border-hairline rounded font-mono text-xs font-bold text-ink text-right"
                      />
                    </div>
                    <div class="space-y-1">
                      <label for="final-price-b" class="text-[10px] font-mono text-muted uppercase block">
                        Final Price ({sym})
                      </label>
                      <input
                        type="number"
                        id="final-price-b"
                        value={finalPriceB}
                        min="0.00000001"
                        step="0.1"
                        onInput={(e) => {
                          setFinalPriceB(Number(e.currentTarget.value) || 0);
                          setActivePreset('');
                        }}
                        class="w-full p-1.5 bg-surface border border-hairline rounded font-mono text-xs font-bold text-ink text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* PERCENTAGE CHANGE MODE */
              <div class="space-y-4 p-4 bg-surface-soft rounded-2xl border border-hairline">
                <span class="text-xs font-mono font-bold text-ink uppercase block">
                  Expected Percentage Price Movements (%)
                </span>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="space-y-2 p-3 bg-canvas rounded-xl border border-hairline">
                    <div class="flex items-center justify-between">
                      <label for="price-change-a" class="text-xs font-bold text-primary">
                        {tokenAName} Move
                      </label>
                      <span class="text-xs font-mono font-bold text-ink">{priceChangePctA}%</span>
                    </div>
                    <input
                      type="range"
                      id="price-change-a"
                      min="-90"
                      max="500"
                      step="5"
                      value={priceChangePctA}
                      onInput={(e) => {
                        setPriceChangePctA(Number(e.currentTarget.value));
                        setActivePreset('');
                      }}
                      class="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  <div class="space-y-2 p-3 bg-canvas rounded-xl border border-hairline">
                    <div class="flex items-center justify-between">
                      <label for="price-change-b" class="text-xs font-bold text-ink">
                        {tokenBName} Move
                      </label>
                      <span class="text-xs font-mono font-bold text-ink">{priceChangePctB}%</span>
                    </div>
                    <input
                      type="range"
                      id="price-change-b"
                      min="-90"
                      max="500"
                      step="5"
                      value={priceChangePctB}
                      onInput={(e) => {
                        setPriceChangePctB(Number(e.currentTarget.value));
                        setActivePreset('');
                      }}
                      class="w-full accent-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TRADING FEES & HOLDING DURATION */}
            <div class="space-y-4 p-4 bg-surface-soft rounded-2xl border border-hairline">
              <span class="text-xs font-mono font-bold text-primary uppercase block">
                Trading Fee Yield &amp; Holding Period Assumptions
              </span>

              <div class="grid sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <label for="fee-apr-input" class="text-[11px] font-mono text-muted uppercase font-bold">
                      Estimated Pool Fee APR (%)
                    </label>
                    <span class="text-xs font-mono font-bold text-ink">{feeAprPct}%</span>
                  </div>
                  <input
                    type="number"
                    id="fee-apr-input"
                    value={feeAprPct}
                    min="0"
                    max="1000"
                    step="1"
                    onInput={(e) => {
                      setFeeAprPct(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                  />
                </div>

                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <label for="holding-days-input" class="text-[11px] font-mono text-muted uppercase font-bold">
                      Holding Duration (Days)
                    </label>
                    <span class="text-xs font-mono font-bold text-ink">{holdingDays} Days</span>
                  </div>
                  <input
                    type="number"
                    id="holding-days-input"
                    value={holdingDays}
                    min="1"
                    max="3650"
                    step="1"
                    onInput={(e) => {
                      setHoldingDays(Number(e.currentTarget.value) || 1);
                      setActivePreset('');
                    }}
                    class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                  />
                </div>
              </div>

              <div class="pt-2 border-t border-hairline">
                <div class="flex items-center justify-between">
                  <label for="fee-override-input" class="text-[11px] font-mono text-muted uppercase">
                    Direct Fee Revenue Override ({sym})
                  </label>
                  <input
                    type="number"
                    id="fee-override-input"
                    value={feeRevenueAmount}
                    min="0"
                    placeholder="0 (Calculated via APR)"
                    onInput={(e) => {
                      setFeeRevenueAmount(Number(e.currentTarget.value) || 0);
                      setActivePreset('');
                    }}
                    class="w-36 p-1.5 bg-canvas border border-hairline rounded-lg font-mono text-xs font-bold text-ink text-right"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS & IL CURVE */}
        <div class="lg:col-span-6 space-y-6">
          {/* PRIMARY HERO METRICS CARD */}
          <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  Pure Impermanent Loss (%)
                </span>
                <div class="flex items-baseline gap-2 mt-1">
                  <span
                    class={`text-3xl sm:text-4xl font-extrabold font-heading tracking-tight ${
                      results.summary.pureImpermanentLossPct === 0 ? 'text-ink' : 'text-rose-600'
                    }`}
                  >
                    {results.summary.pureImpermanentLossPct.toFixed(2)}%
                  </span>
                  <span class="text-xs font-mono text-muted">
                    ({sym}{Math.abs(results.summary.pureIlDollarImpact).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} Drag vs HODL)
                  </span>
                </div>
              </div>

              <div class="flex flex-col items-end">
                <span
                  class={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                    results.meta.isLpSuperior
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : results.meta.isLpInferior
                      ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      : 'bg-surface-soft text-muted border-hairline'
                  }`}
                >
                  {results.meta.isLpSuperior
                    ? 'LP Outperforms HODL ✓'
                    : results.meta.isLpInferior
                    ? 'HODL Outperforms LP ✗'
                    : 'LP Matches HODL'}
                </span>
                <span class="text-[10px] font-mono text-muted mt-1">
                  Price Ratio: {results.meta.priceRatio}x
                </span>
              </div>
            </div>

            {/* THREE-WAY VALUATION MATRIX */}
            <div class="grid grid-cols-3 gap-3 font-mono text-xs">
              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">1. HODL Value</span>
                <span class="text-sm sm:text-base font-extrabold text-ink block mt-0.5">
                  {sym}{results.summary.hodlValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">({results.summary.hodlRoiPct >= 0 ? '+' : ''}{results.summary.hodlRoiPct.toFixed(1)}% ROI)</span>
              </div>

              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">2. LP Value (No Fees)</span>
                <span class="text-sm sm:text-base font-extrabold text-primary block mt-0.5">
                  {sym}{results.summary.lpValueWithoutFees.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">Pure pool value</span>
              </div>

              <div class="p-3.5 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">3. LP Total (+ Fees)</span>
                <span
                  class={`text-sm sm:text-base font-extrabold block mt-0.5 ${
                    results.meta.isLpSuperior ? 'text-emerald-600' : 'text-ink'
                  }`}
                >
                  {sym}{results.summary.feeAdjustedLpValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
                <span class="text-[9px] text-muted block">({results.summary.lpRoiPct >= 0 ? '+' : ''}{results.summary.lpRoiPct.toFixed(1)}% ROI)</span>
              </div>
            </div>

            {/* NET LP ADVANTAGE & BREAK-EVEN ANALYSIS */}
            <div class="p-4 bg-surface-soft rounded-2xl border border-hairline space-y-3 font-mono text-xs">
              <div class="flex items-center justify-between">
                <span class="text-muted">Net LP Position vs 100% HODL:</span>
                <span
                  class={`text-sm font-extrabold ${
                    results.summary.netLpAdvantage >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {results.summary.netLpAdvantage >= 0 ? '+' : ''}{sym}{results.summary.netLpAdvantage.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
              </div>

              <div class="flex items-center justify-between border-t border-hairline pt-2">
                <span class="text-muted">Accumulated Fee Revenue ({holdingDays}d):</span>
                <span class="font-bold text-emerald-600">
                  +{sym}{results.summary.totalFeesEarned.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
              </div>

              <div class="flex items-center justify-between border-t border-hairline pt-2">
                <span class="text-muted">Break-Even Fee Yield Required:</span>
                <span class="font-bold text-ink">
                  {sym}{results.summary.breakEvenFeesRequired.toLocaleString()} ({results.summary.breakEvenAnnualApr.toFixed(1)}% APR)
                </span>
              </div>
            </div>

            {/* SVG IL CURVE WITH CURRENT POSITION MARKER */}
            <div class="space-y-2 pt-2 border-t border-hairline">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold font-heading text-ink">Impermanent Loss Curve (50/50 AMM)</span>
                <span class="font-mono text-[10px] text-muted">Current: {results.meta.priceRatio}x ({results.summary.pureImpermanentLossPct.toFixed(2)}%)</span>
              </div>

              <div class="bg-surface-soft p-3 rounded-2xl border border-hairline">
                <svg viewBox="0 0 400 180" class="w-full h-36 overflow-visible">
                  {/* Grid Lines */}
                  <line x1="30" y1="30" x2="380" y2="30" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="3,3" />
                  <line x1="30" y1="95" x2="380" y2="95" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="3,3" />
                  <line x1="30" y1="160" x2="380" y2="160" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="3,3" />
                  
                  {/* Ratio 1.0 vertical center line */}
                  <line x1="102" y1="30" x2="102" y2="160" stroke="currentColor" stroke-opacity="0.15" />

                  {/* Y-axis labels */}
                  <text x="5" y="34" class="text-[9px] fill-muted font-mono">0%</text>
                  <text x="5" y="99" class="text-[9px] fill-muted font-mono">-25%</text>
                  <text x="5" y="164" class="text-[9px] fill-muted font-mono">-50%</text>

                  {/* X-axis labels */}
                  <text x="30" y="175" class="text-[8px] fill-muted font-mono">0.1x</text>
                  <text x="102" y="175" class="text-[8px] fill-muted font-mono font-bold">1x</text>
                  <text x="180" y="175" class="text-[8px] fill-muted font-mono">2x</text>
                  <text x="250" y="175" class="text-[8px] fill-muted font-mono">3x</text>
                  <text x="320" y="175" class="text-[8px] fill-muted font-mono">4x</text>
                  <text x="375" y="175" class="text-[8px] fill-muted font-mono">5x</text>

                  {/* IL Polyline Curve */}
                  <polyline
                    fill="none"
                    stroke="#e11d48"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    points={curvePoints}
                  />

                  {/* User Position Point */}
                  <circle
                    cx={currentMarker.x}
                    cy={currentMarker.y}
                    r="5.5"
                    fill="#3b82f6"
                    stroke="#ffffff"
                    stroke-width="2"
                    class="transition-all duration-300"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* POOL REBALANCING COMPOSITION BREAKDOWN */}
          <div class="bg-surface border border-hairline rounded-3xl p-6 space-y-4 shadow-soft">
            <h4 class="text-sm font-bold font-heading text-ink border-b border-hairline pb-2">
              Pool Token Inventory Rebalancing (Arbitrage Mechanics)
            </h4>

            <div class="grid sm:grid-cols-2 gap-4 text-xs font-mono">
              <div class="p-3 bg-surface-soft rounded-xl space-y-1">
                <span class="font-bold text-primary block">{tokenAName}</span>
                <div class="flex justify-between text-muted">
                  <span>Initial:</span>
                  <span class="text-ink font-semibold">{results.poolComposition.initial.qtyA} units</span>
                </div>
                <div class="flex justify-between text-muted">
                  <span>Resulting:</span>
                  <span class="text-ink font-semibold">{results.poolComposition.final.qtyA} units</span>
                </div>
                <div class="flex justify-between text-[11px] pt-1 border-t border-hairline font-bold">
                  <span>Delta:</span>
                  <span class={results.poolComposition.tokensRebalanced.deltaQtyA >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {results.poolComposition.tokensRebalanced.deltaQtyA >= 0 ? '+' : ''}{results.poolComposition.tokensRebalanced.deltaQtyA}
                  </span>
                </div>
              </div>

              <div class="p-3 bg-surface-soft rounded-xl space-y-1">
                <span class="font-bold text-ink block">{tokenBName}</span>
                <div class="flex justify-between text-muted">
                  <span>Initial:</span>
                  <span class="text-ink font-semibold">{results.poolComposition.initial.qtyB} units</span>
                </div>
                <div class="flex justify-between text-muted">
                  <span>Resulting:</span>
                  <span class="text-ink font-semibold">{results.poolComposition.final.qtyB} units</span>
                </div>
                <div class="flex justify-between text-[11px] pt-1 border-t border-hairline font-bold">
                  <span>Delta:</span>
                  <span class={results.poolComposition.tokensRebalanced.deltaQtyB >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {results.poolComposition.tokensRebalanced.deltaQtyB >= 0 ? '+' : ''}{results.poolComposition.tokensRebalanced.deltaQtyB}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SENSITIVITY MATRIX TABLE */}
      <section class="bg-surface border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-hairline pb-3">
          <div>
            <h3 class="text-base font-bold font-heading text-ink">Price Divergence Sensitivity Matrix</h3>
            <p class="text-xs text-muted">Mathematical impermanent loss and portfolio valuations across relative price shifts</p>
          </div>
          <span class="text-xs font-mono text-muted">50/50 Constant-Product Model (x · y = k)</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr class="border-b border-hairline text-muted uppercase text-[10px] bg-surface-soft/40">
                <th class="py-2.5 px-3">Relative Ratio (r)</th>
                <th class="py-2.5 px-3">Price Move</th>
                <th class="py-2.5 px-3">{tokenAName} Price</th>
                <th class="py-2.5 px-3">Pure IL %</th>
                <th class="py-2.5 px-3">HODL Value</th>
                <th class="py-2.5 px-3">LP Value</th>
                <th class="py-2.5 px-3">IL Drag ($)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              {results.sensitivityMatrix.map((row) => {
                const isCurrent = Math.abs(row.ratio - results.meta.priceRatio) < 0.08;
                return (
                  <tr
                    key={row.ratio}
                    class={`hover:bg-surface-soft/60 transition-colors ${
                      isCurrent ? 'bg-primary/10 font-bold' : ''
                    }`}
                  >
                    <td class="py-2.5 px-3 text-ink">
                      {row.ratioLabel} {isCurrent && <span class="text-primary text-[10px] font-bold">◀ Current</span>}
                    </td>
                    <td class="py-2.5 px-3 text-muted">
                      {row.priceChangePct >= 0 ? '+' : ''}{row.priceChangePct}%
                    </td>
                    <td class="py-2.5 px-3">{sym}{row.tokenAPrice.toLocaleString()}</td>
                    <td class={`py-2.5 px-3 font-bold ${row.ilPct === 0 ? 'text-ink' : 'text-rose-600'}`}>
                      {row.ilPct.toFixed(2)}%
                    </td>
                    <td class="py-2.5 px-3">{sym}{row.hodlValue.toLocaleString()}</td>
                    <td class="py-2.5 px-3 font-semibold text-primary">{sym}{row.lpValue.toLocaleString()}</td>
                    <td class="py-2.5 px-3 text-rose-500">{sym}{row.ilDollarImpact.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

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
            onClick={() => applyPreset(IMPERMANENT_LOSS_CONFIG.presets[0])}
            class="px-4 py-2 bg-surface-strong hover:bg-surface border border-hairline text-muted hover:text-ink rounded-xl font-heading text-xs font-semibold transition-all"
          >
            Reset Defaults
          </button>
        </div>

        <p class="text-[11px] text-muted text-center sm:text-right max-w-md">
          <strong>DeFi Analytical Notice:</strong> Models reflect standard 50/50 constant-product AMM mechanics (e.g. Uniswap v2). Concentrated liquidity ranges (v3) or weighted pools (Balancer) exhibit higher or different IL characteristics.
        </p>
      </div>
    </div>
  );
}
