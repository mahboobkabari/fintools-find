import { useState, useMemo } from 'preact/hooks';
import { calculateReturnOnEquityCalculator } from '../../../calculators/business/return-on-equity-calculator.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';

const DEFAULT_ROE_STATE = {
  calculationMode: 'dupont3',
  netIncome: 25000000,
  shareholdersEquity: 125000000,
  revenue: 200000000,
  totalAssets: 250000000,
  ebit: 38000000,
  ebt: 33000000,
  dividendPayoutRatio: 30,
  costOfEquity: 12,
  currencySymbol: '₹',
};

const ROE_PARAM_MAP = {
  calculationMode: 'mode',
  netIncome: 'pat',
  shareholdersEquity: 'eq',
  revenue: 'rev',
  totalAssets: 'ta',
  ebit: 'ebit',
  ebt: 'ebt',
  dividendPayoutRatio: 'div',
  costOfEquity: 'ke',
  currencySymbol: 'cur',
};

export default function RoeFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_ROE_STATE, ROE_PARAM_MAP);
  const {
    calculationMode,
    netIncome,
    shareholdersEquity,
    revenue,
    totalAssets,
    ebit,
    ebt,
    dividendPayoutRatio,
    costOfEquity,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Presets
  const presets = [
    { id: 'saas_tech', label: 'SaaS / Software', icon: '💻', calculationMode: 'dupont3', netIncome: 50000000, shareholdersEquity: 200000000, revenue: 250000000, totalAssets: 220000000, ebit: 75000000, ebt: 70000000, dividendPayoutRatio: 0, costOfEquity: 12, currencySymbol: '₹', desc: '25.00% ROE · High Margin (20%)' },
    { id: 'consumer_fmcg', label: 'Consumer FMCG', icon: '🛒', calculationMode: 'dupont3', netIncome: 150000000, shareholdersEquity: 600000000, revenue: 1200000000, totalAssets: 850000000, ebit: 220000000, ebt: 200000000, dividendPayoutRatio: 40, costOfEquity: 11, currencySymbol: '₹', desc: '25.00% ROE · High Asset Turns (1.4x)' },
    { id: 'industrial_mfg', label: 'Industrial Mfg', icon: '🏭', calculationMode: 'dupont3', netIncome: 25000000, shareholdersEquity: 125000000, revenue: 200000000, totalAssets: 250000000, ebit: 38000000, ebt: 33000000, dividendPayoutRatio: 30, costOfEquity: 12, currencySymbol: '₹', desc: '20.00% ROE · Balanced DuPont' },
    { id: 'commercial_bank', label: 'Commercial Bank', icon: '🏦', calculationMode: 'dupont3', netIncome: 400000000, shareholdersEquity: 2500000000, revenue: 2000000000, totalAssets: 20000000000, ebit: 600000000, ebt: 550000000, dividendPayoutRatio: 25, costOfEquity: 13, currencySymbol: '₹', desc: '16.00% ROE · High Leverage (8x)' },
    { id: 'retail_chain', label: 'Retail Supermarket', icon: '🏬', calculationMode: 'dupont3', netIncome: 100000000, shareholdersEquity: 500000000, revenue: 3000000000, totalAssets: 1000000000, ebit: 160000000, ebt: 140000000, dividendPayoutRatio: 35, costOfEquity: 12, currencySymbol: '₹', desc: '20.00% ROE · Ultra Turns (3.0x)' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    Object.keys(p).forEach((key) => {
      if (key !== 'id' && key !== 'label' && key !== 'icon' && key !== 'desc') {
        setParam(key, p[key]);
      }
    });
  };

  const results = useMemo(() => {
    return calculateReturnOnEquityCalculator({
      calculationMode,
      netIncome,
      shareholdersEquity,
      revenue,
      totalAssets,
      ebit,
      ebt,
      dividendPayoutRatio,
      costOfEquity,
      currencySymbol,
    });
  }, [
    calculationMode,
    netIncome,
    shareholdersEquity,
    revenue,
    totalAssets,
    ebit,
    ebt,
    dividendPayoutRatio,
    costOfEquity,
    currencySymbol,
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
    resetUrlState();
  };

  const dupontItems = results.dupontBreakdownList.map((d) => ({
    label: d.label,
    amount: Math.round(d.multiplier * 100),
    colorClass: d.colorClass,
    desc: `${d.value} — ${d.desc}`,
  }));

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Industry DuPont Archetype Preset" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            📈 SHAREHOLDER CAPITAL EFFICIENCY &amp; DUPONT
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase ${results.roeQualityColor} bg-surface-strong`}>
            {results.roeQualityTitle}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Net Profit Margin: <strong>{results.netProfitMarginPct}%</strong> · Asset Turnover: <strong>{results.assetTurnoverRatio}x</strong> · Equity Multiplier: <strong>{results.equityMultiplier}x</strong> · Sustainable Growth Rate: <strong>{results.sustainableGrowthRatePct}%</strong> · Economic Spread: <strong>{results.valueCreationSpreadPct > 0 ? `+${results.valueCreationSpreadPct}%` : `${results.valueCreationSpreadPct}%`}</strong>.
        </p>

        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Return on Equity (ROE)</span>
            <span class={`text-sm font-bold ${results.roePct >= 15 ? 'text-primary' : 'text-amber-600'}`}>
              {results.roePct}%
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Return on Assets (ROA)</span>
            <span class="text-sm font-bold text-emerald-600">{results.roaPct}%</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Sustainable Growth (SGR)</span>
            <span class="text-sm font-bold text-indigo-600">{results.sustainableGrowthRatePct}%</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Equity Multiplier</span>
            <span class="text-sm font-bold text-ink">{results.equityMultiplier}x</span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Financial Performance Drivers</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Mode Switcher */}
          <div class="space-y-2">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted block">
              DuPont Analysis Framework
            </span>
            <div class="grid grid-cols-2 gap-2">
              {[
                { id: 'dupont3', label: '3-Step DuPont (Operational / Asset / Leverage)' },
                { id: 'standard', label: 'Standard Formula (Net Income / Equity)' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setParam('calculationMode', mode.id)}
                  class={`p-2.5 rounded-xl border text-center font-mono text-xs transition-all ${
                    calculationMode === mode.id
                      ? 'bg-primary text-white border-primary font-bold shadow-sm'
                      : 'bg-surface-soft border-hairline text-body hover:border-primary/50'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Core Inputs */}
          <div class="space-y-4 pt-2">
            <div class="grid sm:grid-cols-2 gap-3">
              <FormInputNumber
                id="pat-in"
                label="Net Income (PAT)"
                value={netIncome}
                min={-5000000000}
                max={50000000000}
                step={1000000}
                prefix={currencySymbol}
                onChange={(v) => setParam('netIncome', v)}
              />
              <FormInputNumber
                id="eq-in"
                label="Total Shareholders' Equity"
                value={shareholdersEquity}
                min={1}
                max={50000000000}
                step={5000000}
                prefix={currencySymbol}
                onChange={(v) => setParam('shareholdersEquity', v)}
              />
            </div>

            <div class="grid sm:grid-cols-2 gap-3">
              <FormInputNumber
                id="rev-in"
                label="Total Revenue / Sales"
                value={revenue}
                min={0}
                max={100000000000}
                step={5000000}
                prefix={currencySymbol}
                onChange={(v) => setParam('revenue', v)}
              />
              <FormInputNumber
                id="ta-in"
                label="Total Assets"
                value={totalAssets}
                min={1}
                max={100000000000}
                step={5000000}
                prefix={currencySymbol}
                onChange={(v) => setParam('totalAssets', v)}
              />
            </div>

            {/* Dividend & Hurdle Rate */}
            <div class="grid sm:grid-cols-2 gap-3 pt-3 border-t border-hairline">
              <FormInputNumber
                id="div-in"
                label="Dividend Payout Ratio"
                value={dividendPayoutRatio}
                min={0}
                max={100}
                step={5}
                suffix="%"
                onChange={(v) => setParam('dividendPayoutRatio', v)}
              />
              <FormInputNumber
                id="ke-in"
                label="Cost of Equity (Ke Hurdle)"
                value={costOfEquity}
                min={0}
                max={30}
                step={0.5}
                suffix="%"
                onChange={(v) => setParam('costOfEquity', v)}
              />
            </div>
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Visual Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Return on Equity (ROE)"
            primaryValue={`${results.roePct}%`}
            secondaryItems={[
              { label: 'Return on Assets (ROA)', value: `${results.roaPct}%` },
              { label: 'Net Profit Margin', value: `${results.netProfitMarginPct}%` },
              { label: 'Asset Turnover', value: `${results.assetTurnoverRatio}x` },
              { label: 'Equity Multiplier', value: `${results.equityMultiplier}x` },
            ]}
          />

          {/* DuPont Waterfall Cards */}
          <div class="p-6 sm:p-8 bg-surface-soft border border-hairline rounded-3xl space-y-4">
            <h4 class="text-sm font-mono font-bold uppercase text-primary tracking-wider">
              3-Step DuPont Decomposition Engine
            </h4>
            <div class="grid grid-cols-3 gap-2 text-center font-mono">
              <div class="p-3 bg-canvas rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">Net Margin</span>
                <span class="text-base font-bold text-primary">{results.netProfitMarginPct}%</span>
                <span class="text-[10px] text-muted block mt-1">PAT / Rev</span>
              </div>
              <div class="p-3 bg-canvas rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">Asset Turn</span>
                <span class="text-base font-bold text-emerald-600">{results.assetTurnoverRatio}x</span>
                <span class="text-[10px] text-muted block mt-1">Rev / Assets</span>
              </div>
              <div class="p-3 bg-canvas rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">Leverage</span>
                <span class="text-base font-bold text-indigo-600">{results.equityMultiplier}x</span>
                <span class="text-[10px] text-muted block mt-1">Assets / Equity</span>
              </div>
            </div>
            <p class="text-xs text-muted text-center pt-1 font-mono">
              ROE ({results.roePct}%) = {results.netProfitMarginPct}% × {results.assetTurnoverRatio} × {results.equityMultiplier}
            </p>
          </div>
        </div>
      </div>

      {/* 4. DUPONT BREAKDOWN */}
      <CostBreakdownCard
        title="DuPont Driver Multipliers &amp; Operational Efficiency"
        subtitle={`ROE of ${results.roePct}% synthesized from margin (${results.netProfitMarginPct}%), efficiency (${results.assetTurnoverRatio}x), and financial leverage (${results.equityMultiplier}x)`}
        items={dupontItems}
      />

      {/* 5. RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 6. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Sustainable Growth Rate (SGR)"
          value={`${results.sustainableGrowthRatePct}%`}
          subtitle={`Annual growth rate supported organically by retaining ${results.retentionRatePct}% of profits.`}
          badgeText="SGR Engine"
          badgeColorClass="bg-primary"
        />
        <InsightCard
          title="Economic Value Spread (EVA)"
          value={`${results.valueCreationSpreadPct > 0 ? `+${results.valueCreationSpreadPct}%` : `${results.valueCreationSpreadPct}%`}`}
          subtitle={`ROE spread over required Cost of Equity (${costOfEquity}%).`}
          badgeText="EVA Spread"
          badgeColorClass="bg-emerald-500"
        />
      </div>

      {/* 7. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 SHAREHOLDER VALUE EXECUTIVE VOUCHER</span>
          <span class="text-xs text-muted font-mono">{calculationMode.toUpperCase()} AUDIT</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Return on Equity</span>
            <span class="text-base font-bold text-primary">{results.roePct}%</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Return on Assets</span>
            <span class="text-base font-bold text-emerald-600">{results.roaPct}%</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Sustainable Growth</span>
            <span class="text-base font-bold text-indigo-600">{results.sustainableGrowthRatePct}%</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Equity Multiplier</span>
            <span class="text-base font-bold text-amber-600">{results.equityMultiplier}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
