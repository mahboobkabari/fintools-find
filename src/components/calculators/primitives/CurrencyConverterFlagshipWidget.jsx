import { useState, useMemo } from 'preact/hooks';
import {
  calculateCurrencyConverter,
  REFERENCE_EXCHANGE_RATES,
  SUPPORTED_CURRENCY_CODES,
} from '../../../calculators/currency/currency-converter.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';

const DEFAULT_CURRENCY_STATE = {
  amount: 1000,
  fromCurrency: 'USD',
  toCurrency: 'INR',
  fxSpreadPct: 0,
  customRate: '',
};

const CURRENCY_PARAM_MAP = {
  amount: 'amt',
  fromCurrency: 'from',
  toCurrency: 'to',
  fxSpreadPct: 'spread',
  customRate: 'rate',
};

export default function CurrencyConverterFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_CURRENCY_STATE, CURRENCY_PARAM_MAP);
  const {
    amount,
    fromCurrency,
    toCurrency,
    fxSpreadPct,
    customRate,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showCustomRate, setShowCustomRate] = useState(Boolean(customRate));

  // Presets
  const presets = [
    {
      id: 'usd_inr',
      label: 'USD to INR',
      icon: '🇺🇸',
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fxSpreadPct: 0,
      customRate: '',
      desc: '$1,000 → ₹87,500 · Trade & Freelance',
    },
    {
      id: 'eur_usd',
      label: 'EUR to USD',
      icon: '🇪🇺',
      amount: 1000,
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      fxSpreadPct: 0,
      customRate: '',
      desc: '€1,000 → $1,086.96 · Forex Standard',
    },
    {
      id: 'gbp_inr',
      label: 'GBP to INR',
      icon: '🇬🇧',
      amount: 1000,
      fromCurrency: 'GBP',
      toCurrency: 'INR',
      fxSpreadPct: 0,
      customRate: '',
      desc: '£1,000 → ₹111,464.97 · UK Diaspora',
    },
    {
      id: 'aed_inr',
      label: 'AED to INR',
      icon: '🇦🇪',
      amount: 1000,
      fromCurrency: 'AED',
      toCurrency: 'INR',
      fxSpreadPct: 0,
      customRate: '',
      desc: 'AED 1,000 → ₹23,825.73 · Gulf Remittance',
    },
    {
      id: 'cad_inr',
      label: 'CAD to INR',
      icon: '🇨🇦',
      amount: 1000,
      fromCurrency: 'CAD',
      toCurrency: 'INR',
      fxSpreadPct: 0,
      customRate: '',
      desc: 'C$1,000 → ₹63,636.36 · Canada Student',
    },
    {
      id: 'usd_jpy',
      label: 'USD to JPY',
      icon: '🇯🇵',
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'JPY',
      fxSpreadPct: 0,
      customRate: '',
      desc: '$1,000 → ¥155,000 · Asia Tourism',
    },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    Object.keys(p).forEach((key) => {
      if (key !== 'id' && key !== 'label' && key !== 'icon' && key !== 'desc') {
        setParam(key, p[key]);
      }
    });
  };

  const handleSwapCurrencies = () => {
    const currentFrom = fromCurrency;
    const currentTo = toCurrency;
    setParam('fromCurrency', currentTo);
    setParam('toCurrency', currentFrom);
    if (customRate) {
      setParam('customRate', '');
      setShowCustomRate(false);
    }
  };

  const results = useMemo(() => {
    return calculateCurrencyConverter({
      amount,
      fromCurrency,
      toCurrency,
      fxSpreadPct,
      customRate: customRate || null,
    });
  }, [
    amount,
    fromCurrency,
    toCurrency,
    fxSpreadPct,
    customRate,
  ]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleReset = () => {
    setActivePreset(null);
    setShowCustomRate(false);
    resetUrlState();
  };

  const feeBreakdownItems = [
    {
      label: 'Mid-Market Net Amount',
      amount: results.effectiveConvertedAmount,
      colorClass: 'bg-primary',
      desc: `Gross conversion value before dealer markups (${results.toMeta.symbol}${results.convertedAmount.toLocaleString()})`,
    },
    {
      label: 'Bank / Card Spread Markup',
      amount: results.spreadFeeCostInTarget,
      colorClass: 'bg-rose-500',
      desc: `${fxSpreadPct}% spread cost deducted by card issuer or bank (${results.toMeta.symbol}${results.spreadFeeCostInTarget.toLocaleString()})`,
    },
  ];

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards
        presets={presets}
        activePreset={activePreset}
        onSelect={applyPreset}
        label="Popular Currency Conversion Corridors"
      />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            🌐 MID-MARKET REFERENCE EXCHANGE RATE
          </span>
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase text-primary bg-surface-strong">
            {results.metadata.baselineDate} · BASELINE BENCHMARK
          </span>
        </div>

        <h2 class="text-2xl sm:text-4xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          1 {results.fromCurrency} = <strong>{results.displayExchangeRate} {results.toCurrency}</strong> · 1 {results.toCurrency} = <strong>{results.displayInverseRate} {results.fromCurrency}</strong> · Effective Net: <strong>{results.toMeta.symbol}{results.effectiveConvertedAmount.toLocaleString()}</strong> ({fxSpreadPct}% spread fee: {results.toMeta.symbol}{results.spreadFeeCostInTarget.toLocaleString()}).
        </p>

        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">From ({results.fromCurrency})</span>
            <span class="text-sm font-bold text-ink">
              {results.fromMeta.flag} {results.fromMeta.symbol}{results.amount.toLocaleString()}
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">To ({results.toCurrency})</span>
            <span class="text-sm font-bold text-semantic-success">
              {results.toMeta.flag} {results.toMeta.symbol}{results.convertedAmount.toLocaleString()}
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Exchange Rate</span>
            <span class="text-sm font-bold text-primary">{results.displayExchangeRate}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Inverse Rate</span>
            <span class="text-sm font-bold text-indigo-600">{results.displayInverseRate}</span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Conversion Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Amount Input */}
          <div class="space-y-4">
            <FormInputNumber
              id="amount-in"
              label="Amount to Convert"
              value={amount}
              min={0}
              max={100000000}
              step={100}
              prefix={results.fromMeta.symbol}
              onChange={(v) => setParam('amount', v)}
            />

            {/* Currency Selectors with Swap */}
            <div class="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center pt-2">
              {/* From Currency */}
              <div class="sm:col-span-5 space-y-1.5">
                <label for="from-currency-select" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  From Currency
                </label>
                <div class="relative">
                  <select
                    id="from-currency-select"
                    value={fromCurrency}
                    onChange={(e) => setParam('fromCurrency', e.target.value)}
                    class="w-full p-3 bg-surface-strong border border-hairline rounded-2xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                  >
                    {SUPPORTED_CURRENCY_CODES.map((code) => {
                      const c = REFERENCE_EXCHANGE_RATES[code];
                      return (
                        <option key={code} value={code}>
                          {c.flag} {code} - {c.name} ({c.symbol})
                        </option>
                      );
                    })}
                  </select>
                  <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                    ▼
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div class="sm:col-span-1 flex justify-center pt-4 sm:pt-4">
                <button
                  type="button"
                  onClick={handleSwapCurrencies}
                  title="Swap From and To Currencies"
                  class="w-10 h-10 rounded-full bg-surface-soft border border-hairline hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary active:scale-95"
                  aria-label="Swap Currencies"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
              </div>

              {/* To Currency */}
              <div class="sm:col-span-5 space-y-1.5">
                <label for="to-currency-select" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                  To Currency
                </label>
                <div class="relative">
                  <select
                    id="to-currency-select"
                    value={toCurrency}
                    onChange={(e) => setParam('toCurrency', e.target.value)}
                    class="w-full p-3 bg-surface-strong border border-hairline rounded-2xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                  >
                    {SUPPORTED_CURRENCY_CODES.map((code) => {
                      const c = REFERENCE_EXCHANGE_RATES[code];
                      return (
                        <option key={code} value={code}>
                          {c.flag} {code} - {c.name} ({c.symbol})
                        </option>
                      );
                    })}
                  </select>
                  <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Bank / Card FX Spread Fee */}
            <div class="pt-4 border-t border-hairline space-y-2">
              <FormInputNumber
                id="spread-in"
                label="Bank / Card FX Spread Fee (Optional)"
                value={fxSpreadPct}
                min={0}
                max={15}
                step={0.5}
                suffix="%"
                onChange={(v) => setParam('fxSpreadPct', v)}
              />
              <p class="text-[11px] text-muted">
                Standard credit cards: 1.5% - 3.5% · Zero-forex cards: 0.0% · Airport forex booths: 5.0% - 8.0%.
              </p>
            </div>

            {/* Optional Custom Rate Toggle */}
            <div class="pt-2">
              <button
                type="button"
                onClick={() => setShowCustomRate(!showCustomRate)}
                class="text-xs font-mono text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{showCustomRate ? '− Hide Custom Exchange Rate' : '+ Override with Custom Quoted Rate'}</span>
              </button>

              {showCustomRate && (
                <div class="pt-3">
                  <FormInputNumber
                    id="custom-rate-in"
                    label={`Custom Exchange Rate (1 ${fromCurrency} in ${toCurrency})`}
                    value={customRate ? Number(customRate) : results.midMarketRate}
                    min={0.000001}
                    max={1000000}
                    step={0.01}
                    onChange={(v) => setParam('customRate', v)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Visual Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel={`Converted Amount (${toCurrency})`}
            primaryValue={`${results.toMeta.symbol}${results.convertedAmount.toLocaleString()}`}
            secondaryItems={[
              { label: `1 ${fromCurrency} =`, value: `${results.displayExchangeRate} ${toCurrency}` },
              { label: `1 ${toCurrency} =`, value: `${results.displayInverseRate} ${fromCurrency}` },
              { label: 'Effective Net Received', value: `${results.toMeta.symbol}${results.effectiveConvertedAmount.toLocaleString()}` },
              { label: 'Dealer Spread Cost', value: `${results.toMeta.symbol}${results.spreadFeeCostInTarget.toLocaleString()}` },
            ]}
          />

          {/* Mid-Market Unit Conversion Card */}
          <div class="p-6 sm:p-8 bg-surface-soft border border-hairline rounded-3xl space-y-3">
            <h4 class="text-sm font-mono font-bold uppercase text-primary tracking-wider">
              Cross-Rate Mathematical Linkage
            </h4>
            <div class="grid grid-cols-2 gap-3 text-center font-mono">
              <div class="p-3 bg-canvas rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">Direct Exchange Rate</span>
                <span class="text-base font-bold text-primary">1 {fromCurrency} = {results.displayExchangeRate} {toCurrency}</span>
                <span class="text-[10px] text-muted block mt-1">USD Benchmark Ratio</span>
              </div>
              <div class="p-3 bg-canvas rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">Inverse Exchange Rate</span>
                <span class="text-base font-bold text-emerald-600">1 {toCurrency} = {results.displayInverseRate} {fromCurrency}</span>
                <span class="text-[10px] text-muted block mt-1">Reciprocal Value (1 / Rate)</span>
              </div>
            </div>
            <p class="text-xs text-muted text-center pt-1 font-mono">
              {results.fromMeta.symbol}{results.amount.toLocaleString()} × {results.displayExchangeRate} = {results.toMeta.symbol}{results.convertedAmount.toLocaleString()} {toCurrency}
            </p>
          </div>
        </div>
      </div>

      {/* 4. MULTI-DENOMINATION SCHEDULE MATRIX */}
      <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">
              Quick Conversion Matrix ({fromCurrency} ⇄ {toCurrency})
            </h3>
            <p class="text-xs text-muted mt-0.5">
              Standard denomination table for travelers, traders, and international transfers
            </p>
          </div>
          <span class="text-xs font-mono font-bold text-primary bg-surface-strong px-3 py-1 rounded-pill border border-hairline">
            REFERENCE TABLE
          </span>
        </div>

        <div class="grid sm:grid-cols-2 gap-6 pt-2">
          {/* Direct Column */}
          <div class="space-y-2">
            <h4 class="text-xs font-mono font-bold uppercase text-primary border-b border-hairline pb-1.5">
              Converting {fromCurrency} to {toCurrency}
            </h4>
            <div class="divide-y divide-hairline font-mono text-xs">
              {results.conversionMatrix.slice(0, 8).map((row) => (
                <div key={`d-${row.sourceAmount}`} class="py-1.5 flex items-center justify-between">
                  <span class="text-ink font-semibold">{results.fromMeta.symbol}{row.sourceAmount.toLocaleString()} {fromCurrency}</span>
                  <span class="text-emerald-600 font-bold">{results.toMeta.symbol}{row.convertedTarget.toLocaleString()} {toCurrency}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inverse Column */}
          <div class="space-y-2">
            <h4 class="text-xs font-mono font-bold uppercase text-indigo-600 border-b border-hairline pb-1.5">
              Converting {toCurrency} to {fromCurrency}
            </h4>
            <div class="divide-y divide-hairline font-mono text-xs">
              {results.conversionMatrix.slice(0, 8).map((row) => (
                <div key={`i-${row.targetAmount}`} class="py-1.5 flex items-center justify-between">
                  <span class="text-ink font-semibold">{results.toMeta.symbol}{row.targetAmount.toLocaleString()} {toCurrency}</span>
                  <span class="text-primary font-bold">{results.fromMeta.symbol}{row.convertedSource.toLocaleString()} {fromCurrency}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. SPREAD / FEE BREAKDOWN (IF SPREAD > 0) */}
      {fxSpreadPct > 0 && (
        <CostBreakdownCard
          title="Bank Spread Markup &amp; Hidden Conversion Cost"
          subtitle={`A ${fxSpreadPct}% bank spread deducts ${results.toMeta.symbol}${results.spreadFeeCostInTarget.toLocaleString()} from your received total.`}
          items={feeBreakdownItems}
        />
      )}

      {/* 6. RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 7. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Dynamic Currency Conversion (DCC) Warning"
          value="Avoid DCC"
          subtitle="Always choose to be charged in the destination currency when using credit cards abroad to avoid 3% - 7% merchant conversion fees."
          badgeText="Travel Tip"
          badgeColorClass="bg-primary"
        />
        <InsightCard
          title="Reference Benchmark Baseline"
          value="Mid-Market FX"
          subtitle={`Rates anchored against international interbank benchmarks as of ${results.metadata.baselineDate}.`}
          badgeText="Data Transparency"
          badgeColorClass="bg-emerald-500"
        />
      </div>

      {/* 8. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 CURRENCY VALUATION VOUCHER</span>
          <span class="text-xs text-muted font-mono">{fromCurrency}/{toCurrency} MID-MARKET</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Source Amount</span>
            <span class="text-base font-bold text-ink">{results.fromMeta.symbol}{results.amount.toLocaleString()}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Converted Total</span>
            <span class="text-base font-bold text-semantic-success">{results.toMeta.symbol}{results.convertedAmount.toLocaleString()}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Direct Rate</span>
            <span class="text-base font-bold text-primary">{results.displayExchangeRate}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Inverse Rate</span>
            <span class="text-base font-bold text-indigo-600">{results.displayInverseRate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
