import { useState, useMemo } from 'preact/hooks';
import {
  calculateNftRoyalty,
  ROYALTY_BASIS_MODELS,
  SALE_TYPES,
  FIAT_CURRENCIES,
  CRYPTO_DENOMINATIONS,
} from '../../../calculators/crypto/nft-royalty-calculator.js';
import { NFT_ROYALTY_CONFIG } from '../../../calculators/configs/nft-royalty-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

export default function NftRoyaltyFlagshipWidget() {
  const [activePreset, setActivePreset] = useState('standard_secondary_5pct');

  const [salePrice, setSalePrice] = useState(2.0);
  const [royaltyPct, setRoyaltyPct] = useState(5.0);
  const [marketplaceFeePct, setMarketplaceFeePct] = useState(2.5);
  const [otherFees, setOtherFees] = useState(0.005);
  const [enforcementPct, setEnforcementPct] = useState(100);
  const [royaltyBasis, setRoyaltyBasis] = useState('GROSS_SALE_PRICE');
  const [saleType, setSaleType] = useState('SECONDARY_RESALE');
  const [cryptoDenomination, setCryptoDenomination] = useState('ETH');
  const [cryptoPriceFiat, setCryptoPriceFiat] = useState(2500);
  const [currency, setCurrency] = useState('USD');
  const [activeTab, setActiveTab] = useState('price'); // 'price' | 'royalty' | 'enforcement' | 'volume'
  const [copiedUrl, setCopiedUrl] = useState(false);

  // URL Sync
  useUrlSync(
    {
      salePrice,
      royaltyPct,
      marketplaceFeePct,
      otherFees,
      enforcementPct,
      royaltyBasis,
      saleType,
      cryptoDenomination,
      cryptoPriceFiat,
      currency,
    },
    (params) => {
      if (params.salePrice !== undefined) setSalePrice(Number(params.salePrice) || 2.0);
      if (params.royaltyPct !== undefined) setRoyaltyPct(Number(params.royaltyPct) || 5.0);
      if (params.marketplaceFeePct !== undefined) setMarketplaceFeePct(Number(params.marketplaceFeePct) || 2.5);
      if (params.otherFees !== undefined) setOtherFees(Number(params.otherFees) || 0.005);
      if (params.enforcementPct !== undefined) setEnforcementPct(Number(params.enforcementPct) || 100);
      if (params.royaltyBasis) setRoyaltyBasis(params.royaltyBasis);
      if (params.saleType) setSaleType(params.saleType);
      if (params.cryptoDenomination) setCryptoDenomination(params.cryptoDenomination);
      if (params.cryptoPriceFiat !== undefined) setCryptoPriceFiat(Number(params.cryptoPriceFiat) || 2500);
      if (params.currency) setCurrency(params.currency);
      setActivePreset('');
    }
  );

  const applyPreset = (p) => {
    setActivePreset(p.id);
    if (p.salePrice !== undefined) setSalePrice(p.salePrice);
    if (p.royaltyPct !== undefined) setRoyaltyPct(p.royaltyPct);
    if (p.marketplaceFeePct !== undefined) setMarketplaceFeePct(p.marketplaceFeePct);
    if (p.otherFees !== undefined) setOtherFees(p.otherFees);
    if (p.enforcementPct !== undefined) setEnforcementPct(p.enforcementPct);
    if (p.royaltyBasis) setRoyaltyBasis(p.royaltyBasis);
    if (p.saleType) setSaleType(p.saleType);
    if (p.cryptoDenomination) {
      setCryptoDenomination(p.cryptoDenomination);
      setCryptoPriceFiat(CRYPTO_DENOMINATIONS[p.cryptoDenomination]?.defaultPriceUsd || 2500);
    }
    if (p.cryptoPriceFiat !== undefined) setCryptoPriceFiat(p.cryptoPriceFiat);
    if (p.currency) setCurrency(p.currency);
  };

  const results = useMemo(() => {
    return calculateNftRoyalty({
      salePrice,
      royaltyPct,
      marketplaceFeePct,
      otherFees,
      enforcementPct,
      royaltyBasis,
      saleType,
      cryptoDenomination,
      cryptoPriceFiat,
      currency,
    });
  }, [
    salePrice,
    royaltyPct,
    marketplaceFeePct,
    otherFees,
    enforcementPct,
    royaltyBasis,
    saleType,
    cryptoDenomination,
    cryptoPriceFiat,
    currency,
  ]);

  const currMeta = FIAT_CURRENCIES[currency] || FIAT_CURRENCIES.USD;
  const fiatSym = currMeta.symbol;
  const decimals = currMeta.decimals;
  const cryptoSym = CRYPTO_DENOMINATIONS[cryptoDenomination]?.symbol || cryptoDenomination;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const isPrimary = saleType === 'PRIMARY_MINT';

  return (
    <div class="space-y-10">
      {/* PRESET SCENARIO SELECTOR */}
      <section class="space-y-3" role="region" aria-label="NFT Royalty Preset Scenarios">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted">
            Representative NFT Trade Scenarios
          </span>
          <span class="text-xs font-mono text-primary font-semibold">1-Tap Fill</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {NFT_ROYALTY_CONFIG.presets.map((p) => {
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
        {/* LEFT COLUMN: INPUT CONTROLS */}
        <div class="lg:col-span-6 space-y-6">
          <div class="bg-surface border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
            <div class="border-b border-hairline pb-4 flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold font-heading text-ink">Sale & Royalty Configuration</h3>
                <p class="text-xs text-muted mt-0.5">Customize price, royalty rates, fees, and enforcement assumptions.</p>
              </div>
              <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-surface-strong border border-hairline text-primary">
                {cryptoDenomination}
              </span>
            </div>

            {/* SALE TYPE SELECTOR */}
            <div class="space-y-1.5">
              <label for="sale-type-select" class="text-[11px] font-mono font-bold text-muted uppercase tracking-wider block">
                Transaction Nature
              </label>
              <select
                id="sale-type-select"
                value={saleType}
                onChange={(e) => {
                  setSaleType(e.currentTarget.value);
                  setActivePreset('');
                }}
                class="w-full p-2.5 bg-surface-strong border border-hairline rounded-xl font-heading text-xs font-bold text-ink"
              >
                {Object.keys(SALE_TYPES).map((st) => (
                  <option key={st} value={st}>
                    {SALE_TYPES[st].label}
                  </option>
                ))}
              </select>
            </div>

            {/* NFT SALE PRICE & CRYPTO DENOMINATION */}
            <div class="grid sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2 space-y-1">
                <div class="flex justify-between">
                  <label for="sale-price-input" class="text-[11px] font-mono font-bold text-muted uppercase">
                    NFT Sale Price ({cryptoSym})
                  </label>
                  <span class="text-xs font-mono font-bold text-primary">
                    {fiatSym}{results.single.fiat.salePriceFiat.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                  </span>
                </div>
                <input
                  type="number"
                  id="sale-price-input"
                  value={salePrice}
                  min="0"
                  step="0.1"
                  onInput={(e) => {
                    setSalePrice(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                />
              </div>

              <div class="space-y-1">
                <label for="crypto-denom-select" class="text-[11px] font-mono font-bold text-muted uppercase block">
                  Token / Asset
                </label>
                <select
                  id="crypto-denom-select"
                  value={cryptoDenomination}
                  onChange={(e) => {
                    const c = e.currentTarget.value;
                    setCryptoDenomination(c);
                    setCryptoPriceFiat(CRYPTO_DENOMINATIONS[c]?.defaultPriceUsd || 2500);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink"
                >
                  {Object.keys(CRYPTO_DENOMINATIONS).map((c) => (
                    <option key={c} value={c}>
                      {c} ({CRYPTO_DENOMINATIONS[c].name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROYALTY % & MARKETPLACE FEE % */}
            <div class="grid sm:grid-cols-2 gap-4 p-4 bg-surface-soft rounded-2xl border border-hairline">
              <div class="space-y-1.5">
                <div class="flex justify-between items-center">
                  <label for="royalty-pct-input" class="text-[10px] font-mono font-bold text-muted uppercase">
                    Creator Royalty %
                  </label>
                  <span class="text-xs font-mono font-bold text-primary">{royaltyPct}%</span>
                </div>
                <input
                  type="number"
                  id="royalty-pct-input"
                  value={royaltyPct}
                  min="0"
                  max="100"
                  step="0.5"
                  disabled={isPrimary}
                  onInput={(e) => {
                    setRoyaltyPct(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right disabled:opacity-50"
                />
              </div>

              <div class="space-y-1.5">
                <div class="flex justify-between items-center">
                  <label for="mkt-fee-input" class="text-[10px] font-mono font-bold text-muted uppercase">
                    Marketplace Fee %
                  </label>
                  <span class="text-xs font-mono font-bold text-ink">{marketplaceFeePct}%</span>
                </div>
                <input
                  type="number"
                  id="mkt-fee-input"
                  value={marketplaceFeePct}
                  min="0"
                  max="100"
                  step="0.5"
                  onInput={(e) => {
                    setMarketplaceFeePct(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-canvas border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                />
              </div>
            </div>

            {/* ROYALTY BASIS & OTHER TRANSACTION FEES */}
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label for="royalty-basis-select" class="text-[10px] font-mono font-bold text-muted uppercase block truncate">
                  Royalty Calculation Basis
                </label>
                <select
                  id="royalty-basis-select"
                  value={royaltyBasis}
                  disabled={isPrimary}
                  onChange={(e) => {
                    setRoyaltyBasis(e.currentTarget.value);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink disabled:opacity-50"
                >
                  {Object.keys(ROYALTY_BASIS_MODELS).map((b) => (
                    <option key={b} value={b}>
                      {ROYALTY_BASIS_MODELS[b].label}
                    </option>
                  ))}
                </select>
              </div>

              <div class="space-y-1">
                <div class="flex justify-between items-center">
                  <label for="other-fees-input" class="text-[10px] font-mono font-bold text-muted uppercase truncate">
                    Network Gas / Other ({cryptoSym})
                  </label>
                </div>
                <input
                  type="number"
                  id="other-fees-input"
                  value={otherFees}
                  min="0"
                  step="0.001"
                  onInput={(e) => {
                    setOtherFees(Number(e.currentTarget.value) || 0);
                    setActivePreset('');
                  }}
                  class="w-full p-2 bg-surface-strong border border-hairline rounded-xl font-mono text-xs font-bold text-ink text-right"
                />
              </div>
            </div>

            {/* MARKETPLACE ENFORCEMENT RATE SLIDER */}
            <div class="p-4 bg-surface-soft rounded-2xl border border-hairline space-y-2">
              <div class="flex justify-between items-center">
                <label for="enforce-pct-slider" class="text-[10px] font-mono font-bold text-muted uppercase">
                  Marketplace Enforcement Probability
                </label>
                <span class={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  enforcementPct === 100
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : enforcementPct === 0
                    ? 'bg-rose-500/10 text-rose-600'
                    : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {enforcementPct}% Enforced
                </span>
              </div>
              <input
                type="range"
                id="enforce-pct-slider"
                value={enforcementPct}
                min="0"
                max="100"
                step="5"
                disabled={isPrimary}
                onInput={(e) => {
                  setEnforcementPct(Number(e.currentTarget.value) || 0);
                  setActivePreset('');
                }}
                class="w-full accent-primary cursor-pointer disabled:opacity-50"
              />
              <div class="flex justify-between text-[9px] font-mono text-muted">
                <span>0% (Bypass / Zero Royalty)</span>
                <span>50% (Mixed Platforms)</span>
                <span>100% (Full Enforcement)</span>
              </div>
            </div>

            {/* FIAT SPOT PRICE & CURRENCY SELECTOR */}
            <div class="grid sm:grid-cols-2 gap-4 pt-2 border-t border-hairline">
              <div class="space-y-1">
                <label for="crypto-fiat-price" class="text-[11px] font-mono font-bold text-muted uppercase block">
                  1 {cryptoDenomination} Spot Price ({fiatSym})
                </label>
                <input
                  type="number"
                  id="crypto-fiat-price"
                  value={cryptoPriceFiat}
                  min="0.0001"
                  step="50"
                  onInput={(e) => {
                    setCryptoPriceFiat(Number(e.currentTarget.value) || 0);
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

        {/* RIGHT COLUMN: HERO KPI & PROCEEDS BREAKDOWN */}
        <div class="lg:col-span-6 space-y-6">
          {/* PRIMARY DECISION HERO */}
          <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  {isPrimary ? 'Creator Net Primary Proceeds' : 'Expected Creator Royalty Proceeds'}
                </span>
                <div class="flex items-baseline gap-2 mt-1">
                  <span class="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight text-primary">
                    {isPrimary
                      ? `${results.single.amounts.creatorNetProceeds.toFixed(3)} ${cryptoSym}`
                      : `${results.single.amounts.expectedRoyaltyAmount.toFixed(3)} ${cryptoSym}`}
                  </span>
                  <span class="text-xs font-mono text-muted">
                    ({fiatSym}
                    {(isPrimary ? results.single.fiat.creatorNetFiat : results.single.fiat.expectedRoyaltyFiat).toLocaleString(
                      undefined,
                      { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
                    )})
                  </span>
                </div>
              </div>

              <div class="flex flex-col items-end">
                <span class="text-xs font-mono font-bold px-3 py-1 rounded-full border bg-primary/10 text-primary border-primary/20">
                  {isPrimary
                    ? `${results.single.percentages.creatorProceedsPct.toFixed(1)}% Net to Creator`
                    : `${results.single.percentages.effectiveRoyaltyRate.toFixed(1)}% Effective Royalty`}
                </span>
                <span class="text-[10px] font-mono text-muted mt-1">
                  Friction: {results.single.percentages.effectiveFrictionPct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* VISUAL PROCEEDS ALLOCATION BAR */}
            <div class="space-y-2">
              <div class="flex justify-between text-xs font-mono">
                <span class="text-emerald-600 font-bold">
                  Seller: {results.single.percentages.sellerProceedsPct.toFixed(1)}% ({results.single.amounts.sellerNetProceeds.toFixed(3)} {cryptoSym})
                </span>
                <span class="text-primary font-bold">
                  Royalty: {results.single.percentages.effectiveRoyaltyRate.toFixed(1)}%
                </span>
                <span class="text-amber-600 font-bold">
                  Mkt Fee: {results.single.percentages.effectiveMktFeeRate.toFixed(1)}%
                </span>
              </div>
              <div class="w-full bg-surface-strong rounded-full h-3.5 overflow-hidden flex border border-hairline p-0.5">
                <div
                  class="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                  style={{ width: `${results.single.percentages.sellerProceedsPct}%` }}
                ></div>
                <div
                  class="bg-primary h-full transition-all duration-500"
                  style={{ width: `${results.single.percentages.effectiveRoyaltyRate}%` }}
                ></div>
                <div
                  class="bg-amber-500 h-full rounded-r-full transition-all duration-500"
                  style={{ width: `${results.single.percentages.effectiveMktFeeRate}%` }}
                ></div>
              </div>
            </div>

            {/* THREE-WAY METRIC GRID */}
            <div class="grid grid-cols-3 gap-3 font-mono text-xs">
              <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Seller Net</span>
                <span class="text-sm sm:text-base font-extrabold text-emerald-600 block mt-0.5">
                  {results.single.amounts.sellerNetProceeds.toFixed(3)} {cryptoSym}
                </span>
                <span class="text-[9px] text-muted block">
                  {fiatSym}{results.single.fiat.sellerNetFiat.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
              </div>

              <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Marketplace Fee</span>
                <span class="text-sm sm:text-base font-extrabold text-amber-600 block mt-0.5">
                  {results.single.amounts.marketplaceFeeAmount.toFixed(3)} {cryptoSym}
                </span>
                <span class="text-[9px] text-muted block">
                  {fiatSym}{results.single.fiat.marketplaceFeeFiat.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </span>
              </div>

              <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted uppercase font-bold block">Total Friction</span>
                <span class="text-sm sm:text-base font-extrabold text-rose-600 block mt-0.5">
                  {results.single.amounts.totalFriction.toFixed(3)} {cryptoSym}
                </span>
                <span class="text-[9px] text-muted block">({results.single.percentages.effectiveFrictionPct.toFixed(1)}% of sale)</span>
              </div>
            </div>

            {/* ENFORCEMENT & LOST ROYALTY ALERT */}
            {enforcementPct < 100 && !isPrimary && (
              <div class="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs font-mono">
                <div class="flex items-center gap-2">
                  <span class="text-base">⚠️</span>
                  <div>
                    <span class="font-bold text-amber-900 block">Enforcement Risk Gap ({100 - enforcementPct}% Unenforced)</span>
                    <span class="text-muted text-[10px]">
                      Gross configured royalty is {results.single.amounts.grossRoyaltyAmount.toFixed(3)} {cryptoSym} ({fiatSym}{results.single.fiat.grossRoyaltyFiat.toFixed(2)}).
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-bold text-rose-600 block">-{results.single.amounts.lostRoyaltyAmount.toFixed(3)} {cryptoSym}</span>
                  <span class="text-[9px] text-muted">-{fiatSym}{results.single.fiat.lostRoyaltyFiat.toFixed(2)} Lost</span>
                </div>
              </div>
            )}
          </div>

          {/* SENSITIVITY SCENARIOS TABS */}
          <div class="bg-surface border border-hairline rounded-3xl p-6 space-y-4 shadow-soft">
            <div class="flex items-center justify-between border-b border-hairline pb-3">
              <h4 class="text-sm font-bold font-heading text-ink">Scenario & Sensitivity Analysis</h4>
              <div class="flex gap-1 bg-surface-strong p-1 rounded-xl border border-hairline text-[10px] font-mono font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('price')}
                  class={`px-2 py-1 rounded-lg transition-all ${
                    activeTab === 'price' ? 'bg-canvas text-primary shadow-sm' : 'text-muted hover:text-ink'
                  }`}
                >
                  Price Multiplier
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('royalty')}
                  class={`px-2 py-1 rounded-lg transition-all ${
                    activeTab === 'royalty' ? 'bg-canvas text-primary shadow-sm' : 'text-muted hover:text-ink'
                  }`}
                >
                  Royalty %
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('enforcement')}
                  class={`px-2 py-1 rounded-lg transition-all ${
                    activeTab === 'enforcement' ? 'bg-canvas text-primary shadow-sm' : 'text-muted hover:text-ink'
                  }`}
                >
                  Enforcement
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('volume')}
                  class={`px-2 py-1 rounded-lg transition-all ${
                    activeTab === 'volume' ? 'bg-canvas text-primary shadow-sm' : 'text-muted hover:text-ink'
                  }`}
                >
                  Volume
                </button>
              </div>
            </div>

            {/* TAB 1: PRICE MULTIPLIER */}
            {activeTab === 'price' && (
              <div class="overflow-x-auto">
                <table class="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-hairline text-muted uppercase text-[10px] bg-surface-soft/40">
                      <th class="py-2 px-2.5">Scenario</th>
                      <th class="py-2 px-2.5">Simulated Price</th>
                      <th class="py-2 px-2.5 text-right">Creator Royalty</th>
                      <th class="py-2 px-2.5 text-right">Seller Net</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-hairline">
                    {results.sensitivities.priceSensitivity.map((p) => {
                      const isBase = p.multiplier === 1.0;
                      return (
                        <tr key={p.label} class={`hover:bg-surface-soft/60 transition-colors ${isBase ? 'bg-primary/5 font-bold text-primary' : ''}`}>
                          <td class="py-2 px-2.5 text-ink">{p.label}</td>
                          <td class="py-2 px-2.5">{p.simulatedPriceCrypto.toFixed(2)} {cryptoSym}</td>
                          <td class="py-2 px-2.5 text-right text-primary font-bold">
                            {p.expectedRoyaltyCrypto.toFixed(3)} {cryptoSym} ({fiatSym}{p.expectedRoyaltyFiat.toFixed(0)})
                          </td>
                          <td class="py-2 px-2.5 text-right text-emerald-600">{p.sellerNetCrypto.toFixed(2)} {cryptoSym}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: ROYALTY RATE SENSITIVITY */}
            {activeTab === 'royalty' && (
              <div class="overflow-x-auto">
                <table class="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-hairline text-muted uppercase text-[10px] bg-surface-soft/40">
                      <th class="py-2 px-2.5">Configured Royalty</th>
                      <th class="py-2 px-2.5 text-right">Expected Royalty</th>
                      <th class="py-2 px-2.5 text-right">Seller Proceeds</th>
                      <th class="py-2 px-2.5 text-right">Total Friction %</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-hairline">
                    {results.sensitivities.royaltySensitivity.map((r) => {
                      const isCurrent = r.royaltyPct === royaltyPct;
                      return (
                        <tr key={r.royaltyPct} class={`hover:bg-surface-soft/60 transition-colors ${isCurrent ? 'bg-primary/5 font-bold text-primary' : ''}`}>
                          <td class="py-2 px-2.5 text-ink">{r.royaltyPct}% Royalty</td>
                          <td class="py-2 px-2.5 text-right text-primary font-bold">{r.expectedRoyaltyCrypto.toFixed(3)} {cryptoSym}</td>
                          <td class="py-2 px-2.5 text-right text-emerald-600">{r.sellerNetCrypto.toFixed(3)} {cryptoSym}</td>
                          <td class="py-2 px-2.5 text-right text-muted">{r.effectiveFrictionPct.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: ENFORCEMENT SENSITIVITY */}
            {activeTab === 'enforcement' && (
              <div class="overflow-x-auto">
                <table class="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-hairline text-muted uppercase text-[10px] bg-surface-soft/40">
                      <th class="py-2 px-2.5">Platform Tier</th>
                      <th class="py-2 px-2.5 text-right">Received Royalty</th>
                      <th class="py-2 px-2.5 text-right">Lost Royalty</th>
                      <th class="py-2 px-2.5 text-right">Seller Net</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-hairline">
                    {results.sensitivities.enforcementSensitivity.map((e) => (
                      <tr key={e.enforcementPct} class="hover:bg-surface-soft/60 transition-colors">
                        <td class="py-2 px-2.5 text-ink">{e.label}</td>
                        <td class="py-2 px-2.5 text-right text-primary font-bold">{e.expectedRoyaltyCrypto.toFixed(3)} {cryptoSym}</td>
                        <td class="py-2 px-2.5 text-right text-rose-600">-{e.lostRoyaltyCrypto.toFixed(3)} {cryptoSym}</td>
                        <td class="py-2 px-2.5 text-right text-emerald-600">{e.sellerNetCrypto.toFixed(3)} {cryptoSym}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 4: VOLUME SCENARIOS */}
            {activeTab === 'volume' && (
              <div class="overflow-x-auto">
                <table class="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-hairline text-muted uppercase text-[10px] bg-surface-soft/40">
                      <th class="py-2 px-2.5">Resale Volume</th>
                      <th class="py-2 px-2.5">Total Trade Volume</th>
                      <th class="py-2 px-2.5 text-right">Cumulative Royalties</th>
                      <th class="py-2 px-2.5 text-right">Total Mkt Fees</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-hairline">
                    {results.sensitivities.volumeScenarios.map((v) => (
                      <tr key={v.resaleCount} class="hover:bg-surface-soft/60 transition-colors">
                        <td class="py-2 px-2.5 text-ink">{v.resaleCount} Resales</td>
                        <td class="py-2 px-2.5">{v.totalVolumeCrypto.toFixed(1)} {cryptoSym} ({fiatSym}{v.totalVolumeFiat.toLocaleString()})</td>
                        <td class="py-2 px-2.5 text-right text-primary font-bold">
                          +{v.totalExpectedRoyaltiesCrypto.toFixed(2)} {cryptoSym} ({fiatSym}{v.totalExpectedRoyaltiesFiat.toLocaleString()})
                        </td>
                        <td class="py-2 px-2.5 text-right text-muted">{v.totalMarketplaceFeesCrypto.toFixed(2)} {cryptoSym}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MULTI-SALE RESALE LIFETIME SCHEDULE */}
      <section class="bg-surface border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-4">
          <div>
            <h3 class="text-base sm:text-lg font-bold font-heading text-ink">
              Multi-Sale Resale Schedule & Cumulative Royalty Projections
            </h3>
            <p class="text-xs text-muted">Lifetime royalty income generated across consecutive secondary market resales.</p>
          </div>

          <span class="text-xs font-mono font-bold text-primary px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 self-start sm:self-auto">
            {results.multi.totals.totalSalesCount} Secondary Resales Modeled
          </span>
        </div>

        {/* AGGREGATES KPI BAR */}
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
            <span class="text-[10px] text-muted uppercase font-bold block">Total Gross Volume</span>
            <span class="text-sm sm:text-base font-extrabold text-ink block mt-0.5">
              {results.multi.totals.totalVolumeCrypto.toFixed(2)} {cryptoSym}
            </span>
            <span class="text-[9px] text-muted block">({fiatSym}{results.multi.totals.totalVolumeFiat.toLocaleString()})</span>
          </div>

          <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
            <span class="text-[10px] text-muted uppercase font-bold block">Lifetime Royalties</span>
            <span class="text-sm sm:text-base font-extrabold text-primary block mt-0.5">
              +{results.multi.totals.totalExpectedRoyaltiesCrypto.toFixed(3)} {cryptoSym}
            </span>
            <span class="text-[9px] text-muted block">({fiatSym}{results.multi.totals.totalExpectedRoyaltiesFiat.toLocaleString()})</span>
          </div>

          <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
            <span class="text-[10px] text-muted uppercase font-bold block">Avg Royalty / Sale</span>
            <span class="text-sm sm:text-base font-extrabold text-ink block mt-0.5">
              {results.multi.totals.averageRoyaltyCrypto.toFixed(3)} {cryptoSym}
            </span>
            <span class="text-[9px] text-muted block">({fiatSym}{results.multi.totals.averageRoyaltyFiat.toFixed(2)})</span>
          </div>

          <div class="p-3 bg-surface-strong/60 rounded-2xl border border-hairline">
            <span class="text-[10px] text-muted uppercase font-bold block">Effective Royalty Rate</span>
            <span class="text-sm sm:text-base font-extrabold text-emerald-600 block mt-0.5">
              {results.multi.totals.effectiveLifetimeRoyaltyRate.toFixed(2)}%
            </span>
            <span class="text-[9px] text-muted block">of gross lifetime volume</span>
          </div>
        </div>

        {/* DETAILED SCHEDULE TABLE */}
        <div class="overflow-x-auto">
          <table class="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr class="border-b border-hairline text-muted uppercase text-[10px] bg-surface-soft/40">
                <th class="py-2.5 px-3">#</th>
                <th class="py-2.5 px-3">Resale Milestone</th>
                <th class="py-2.5 px-3 text-right">Sale Price</th>
                <th class="py-2.5 px-3 text-right">Royalty ({royaltyPct}%)</th>
                <th class="py-2.5 px-3 text-right">Marketplace Fee</th>
                <th class="py-2.5 px-3 text-right">Seller Net</th>
                <th class="py-2.5 px-3 text-right">Cumulative Volume</th>
                <th class="py-2.5 px-3 text-right">Cumulative Royalty</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              {results.multi.schedule.map((row) => (
                <tr key={row.saleNumber} class="hover:bg-surface-soft/60 transition-colors">
                  <td class="py-2.5 px-3 text-muted">{row.saleNumber}</td>
                  <td class="py-2.5 px-3 font-semibold text-ink">{row.label}</td>
                  <td class="py-2.5 px-3 text-right font-bold text-ink">{row.salePriceCrypto.toFixed(2)} {cryptoSym}</td>
                  <td class="py-2.5 px-3 text-right font-bold text-primary">+{row.expectedRoyaltyCrypto.toFixed(3)} {cryptoSym}</td>
                  <td class="py-2.5 px-3 text-right text-amber-600">{row.marketplaceFeeCrypto.toFixed(3)} {cryptoSym}</td>
                  <td class="py-2.5 px-3 text-right text-emerald-600">{row.sellerNetCrypto.toFixed(2)} {cryptoSym}</td>
                  <td class="py-2.5 px-3 text-right text-muted">{row.cumulativeVolumeCrypto.toFixed(2)} {cryptoSym}</td>
                  <td class="py-2.5 px-3 text-right font-bold text-primary">+{row.cumulativeExpectedRoyaltiesCrypto.toFixed(3)} {cryptoSym}</td>
                </tr>
              ))}
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
            <span>{copiedUrl ? '✓ Link Copied!' : '🔗 Share Trade URL'}</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset(NFT_ROYALTY_CONFIG.presets[0])}
            class="px-4 py-2 bg-surface-strong hover:bg-surface border border-hairline text-muted hover:text-ink rounded-xl font-heading text-xs font-semibold transition-all"
          >
            Reset Defaults
          </button>
        </div>

        <p class="text-[11px] text-muted text-center sm:text-right max-w-md">
          <strong>Marketplace Safeguard Notice:</strong> NFT creator royalties are not universally guaranteed across all secondary protocols and marketplace smart contracts. Enforcement rates are user-configurable scenario assumptions, not financial promises.
        </p>
      </div>
    </div>
  );
}
