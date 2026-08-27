import { useState, useMemo } from 'preact/hooks';
import { calculateReturnOnAssetsCalculator } from '../../../calculators/business/return-on-assets-calculator.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';

const DEFAULT_ROA_STATE = {
  calculationMode: 'dupont',
  netIncome: 25000000,
  revenue: 200000000,
  totalAssets: 250000000,
  shareholdersEquity: 125000000,
  ebit: 38000000,
  fixedAssets: 175000000,
  currentAssets: 75000000,
  taxRate: 25,
  currencySymbol: '₹',
};

const ROA_PARAM_MAP = {
  calculationMode: 'mode',
  netIncome: 'pat',
  revenue: 'rev',
  totalAssets: 'ta',
  shareholdersEquity: 'eq',
  ebit: 'ebit',
  fixedAssets: 'fa',
  currentAssets: 'ca',
  taxRate: 'tax',
  currencySymbol: 'cur',
};

export default function RoaFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_ROA_STATE, ROA_PARAM_MAP);
  const {
    calculationMode,
    netIncome,
    revenue,
    totalAssets,
    shareholdersEquity,
    ebit,
    fixedAssets,
    currentAssets,
    taxRate,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Presets
  const presets = [
    {
      id: 'saas_software',
      label: 'SaaS / Software',
      icon: '💻',
      calculationMode: 'dupont',
      netIncome: 50000000,
      revenue: 250000000,
      totalAssets: 250000000,
      shareholdersEquity: 200000000,
      ebit: 75000000,
      fixedAssets: 25000000,
      currentAssets: 225000000,
      taxRate: 25,
      currencySymbol: '₹',
      desc: '20.00% ROA · Asset-Light High Margin',
    },
    {
      id: 'consumer_fmcg',
      label: 'Consumer FMCG',
      icon: '🛒',
      calculationMode: 'dupont',
      netIncome: 150000000,
      revenue: 1200000000,
      totalAssets: 850000000,
      shareholdersEquity: 600000000,
      ebit: 220000000,
      fixedAssets: 350000000,
      currentAssets: 500000000,
      taxRate: 25,
      currencySymbol: '₹',
      desc: '17.65% ROA · Brand Pricing & High Turn',
    },
    {
      id: 'retail_chain',
      label: 'Retail Supermarket',
      icon: '🏬',
      calculationMode: 'dupont',
      netIncome: 100000000,
      revenue: 3000000000,
      totalAssets: 1000000000,
      shareholdersEquity: 500000000,
      ebit: 160000000,
      fixedAssets: 600000000,
      currentAssets: 400000000,
      taxRate: 25,
      currencySymbol: '₹',
      desc: '10.00% ROA · Ultra Turn (3.00x) Velocity',
    },
    {
      id: 'industrial_mfg',
      label: 'Industrial Mfg',
      icon: '🏭',
      calculationMode: 'dupont',
      netIncome: 25000000,
      revenue: 200000000,
      totalAssets: 250000000,
      shareholdersEquity: 125000000,
      ebit: 38000000,
      fixedAssets: 175000000,
      currentAssets: 75000000,
      taxRate: 25,
      currencySymbol: '₹',
      desc: '10.00% ROA · Balanced Capital-Intensive',
    },
    {
      id: 'commercial_bank',
      label: 'Commercial Bank',
      icon: '🏦',
      calculationMode: 'dupont',
      netIncome: 400000000,
      revenue: 2000000000,
      totalAssets: 20000000000,
      shareholdersEquity: 2500000000,
      ebit: 600000000,
      fixedAssets: 1000000000,
      currentAssets: 19000000000,
      taxRate: 25,
      currencySymbol: '₹',
      desc: '2.00% ROA · High Leverage (8x) Intermediation',
    },
    {
      id: 'infra_utility',
      label: 'Infrastructure Utility',
      icon: '⚡',
      calculationMode: 'dupont',
      netIncome: 300000000,
      revenue: 2500000000,
      totalAssets: 6000000000,
      shareholdersEquity: 3000000000,
      ebit: 500000000,
      fixedAssets: 5200000000,
      currentAssets: 800000000,
      taxRate: 25,
      currencySymbol: '₹',
      desc: '5.00% ROA · Heavy Regulated Asset Base',
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

  const results = useMemo(() => {
    return calculateReturnOnAssetsCalculator({
      calculationMode,
      netIncome,
      revenue,
      totalAssets,
      shareholdersEquity,
      ebit,
      fixedAssets,
      currentAssets,
      taxRate,
      currencySymbol,
    });
  }, [
    calculationMode,
    netIncome,
    revenue,
    totalAssets,
    shareholdersEquity,
    ebit,
    fixedAssets,
    currentAssets,
    taxRate,
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
      <ScenarioPresetCards
        presets={presets}
        activePreset={activePreset}
        onSelect={applyPreset}
        label="Select Industry Asset Intensity Archetype"
      />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            ⚡ ASSET PRODUCTIVITY &amp; DUPONT EFFICIENCY
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase ${results.roaQualityColor} bg-surface-strong`}>
            {results.roaQualityTitle}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Strategy Archetype: <strong>{results.dupontStrategyTitle}</strong> · Net Profit Margin: <strong>{results.netProfitMarginPct}%</strong> · Asset Turnover: <strong>{results.totalAssetTurnover}x</strong> · Operating ROA (EBIT): <strong>{results.operatingRoaPct}%</strong> · ROE: <strong>{results.roePct}%</strong>.
        </p>

        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Return on Assets (ROA)</span>
            <span class={`text-sm font-bold ${results.roaPct >= 10 ? 'text-primary' : 'text-amber-600'}`}>
              {results.roaPct}%
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Operating ROA (EBIT)</span>
            <span class="text-sm font-bold text-emerald-600">{results.operatingRoaPct}%</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Asset Turnover</span>
            <span class="text-sm font-bold text-indigo-600">{results.totalAssetTurnover}x</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Return on Equity (ROE)</span>
            <span class="text-sm font-bold text-ink">{results.roePct}%</span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Asset Efficiency Inputs</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Mode Switcher */}
          <div class="space-y-2">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted block">
              Analysis Framework Mode
            </span>
            <div class="grid grid-cols-3 gap-2">
              {[
                { id: 'dupont', label: '2-Step DuPont' },
                { id: 'standard', label: 'Direct Net ROA' },
                { id: 'extended', label: 'Extended Fixed/EBIT' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setParam('calculationMode', mode.id)}
                  class={`p-2 rounded-xl border text-center font-mono text-xs transition-all ${
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
                id="pat-roa"
                label="Net Income (PAT)"
                value={netIncome}
                min={-5000000000}
                max={50000000000}
                step={1000000}
                prefix={currencySymbol}
                onChange={(v) => setParam('netIncome', v)}
              />
              <FormInputNumber
                id="ta-roa"
                label="Total Balance Sheet Assets"
                value={totalAssets}
                min={1}
                max={100000000000}
                step={5000000}
                prefix={currencySymbol}
                onChange={(v) => setParam('totalAssets', v)}
              />
            </div>

            <div class="grid sm:grid-cols-2 gap-3">
              <FormInputNumber
                id="rev-roa"
                label="Total Revenue / Sales"
                value={revenue}
                min={0}
                max={100000000000}
                step={5000000}
                prefix={currencySymbol}
                onChange={(v) => setParam('revenue', v)}
              />
              <FormInputNumber
                id="eq-roa"
                label="Shareholders' Equity (Net Worth)"
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
                id="ebit-roa"
                label="Operating Profit (EBIT)"
                value={ebit}
                min={-5000000000}
                max={50000000000}
                step={1000000}
                prefix={currencySymbol}
                onChange={(v) => setParam('ebit', v)}
              />
              <FormInputNumber
                id="tax-roa"
                label="Effective Tax Rate"
                value={taxRate}
                min={0}
                max={60}
                step={1}
                suffix="%"
                onChange={(v) => setParam('taxRate', v)}
              />
            </div>

            {/* Granular Asset Split */}
            <div class="grid sm:grid-cols-2 gap-3 pt-3 border-t border-hairline">
              <FormInputNumber
                id="fa-roa"
                label="Fixed Assets (PP&E)"
                value={fixedAssets}
                min={0}
                max={100000000000}
                step={5000000}
                prefix={currencySymbol}
                onChange={(v) => setParam('fixedAssets', v)}
              />
              <FormInputNumber
                id="ca-roa"
                label="Current Assets (Cash/AR/Inv)"
                value={currentAssets}
                min={0}
                max={100000000000}
                step={5000000}
                prefix={currencySymbol}
                onChange={(v) => setParam('currentAssets', v)}
              />
            </div>
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Visual Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Return on Assets (ROA)"
            primaryValue={`${results.roaPct}%`}
            secondaryItems={[
              { label: 'Operating ROA (EBIT)', value: `${results.operatingRoaPct}%` },
              { label: 'Total Asset Turnover', value: `${results.totalAssetTurnover}x` },
              { label: 'Net Profit Margin', value: `${results.netProfitMarginPct}%` },
              { label: 'Return on Equity (ROE)', value: `${results.roePct}%` },
            ]}
          />

          {/* 2-Step DuPont Waterfall Cards */}
          <div class="p-6 sm:p-8 bg-surface-soft border border-hairline rounded-3xl space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-mono font-bold uppercase text-primary tracking-wider">
                2-Step DuPont Decomposition of ROA
              </h4>
              <span class="text-xs font-mono font-bold text-muted">ROA = Margin × Turnover</span>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center font-mono">
              <div class="p-3 bg-canvas rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">Net Profit Margin</span>
                <span class="text-base font-bold text-primary">{results.netProfitMarginPct}%</span>
                <span class="text-[10px] text-muted block mt-1">PAT / Sales</span>
              </div>
              <div class="p-3 bg-canvas rounded-2xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">Asset Turnover</span>
                <span class="text-base font-bold text-emerald-600">{results.totalAssetTurnover}x</span>
                <span class="text-[10px] text-muted block mt-1">Sales / Assets</span>
              </div>
              <div class="p-3 bg-canvas rounded-2xl border border-hairline col-span-2 sm:col-span-1">
                <span class="text-[10px] text-muted block uppercase font-bold">Capital Intensity</span>
                <span class="text-base font-bold text-indigo-600">{results.capitalIntensityRatio}x</span>
                <span class="text-[10px] text-muted block mt-1">Assets / Sales</span>
              </div>
            </div>
            <p class="text-xs text-muted text-center pt-1 font-mono">
              ROA ({results.roaPct}%) = Net Margin ({results.netProfitMarginPct}%) × Asset Turnover ({results.totalAssetTurnover}x)
            </p>
          </div>

          {/* Asset Utilization Efficiency Breakdown */}
          <div class="p-6 sm:p-8 bg-canvas border border-hairline rounded-3xl space-y-3">
            <h4 class="text-sm font-mono font-bold uppercase text-ink tracking-wider">
              Asset Category Velocity &amp; Productivity
            </h4>
            <div class="grid grid-cols-3 gap-2 text-center font-mono">
              <div class="p-2.5 bg-surface-soft rounded-xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">Fixed Asset Turn</span>
                <span class="text-sm font-bold text-indigo-600">{results.fixedAssetTurnover}x</span>
              </div>
              <div class="p-2.5 bg-surface-soft rounded-xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">Current Asset Turn</span>
                <span class="text-sm font-bold text-emerald-600">{results.currentAssetTurnover}x</span>
              </div>
              <div class="p-2.5 bg-surface-soft rounded-xl border border-hairline">
                <span class="text-[10px] text-muted block uppercase font-bold">Return on Fixed</span>
                <span class="text-sm font-bold text-primary">{results.returnOnFixedAssetsPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DUPONT BREAKDOWN */}
      <CostBreakdownCard
        title="DuPont Multipliers &amp; Balance Sheet Leverage"
        subtitle={`ROA of ${results.roaPct}% converted to ${results.roePct}% ROE via an Equity Multiplier of ${results.equityMultiplier}x`}
        items={dupontItems}
      />

      {/* 5. RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 6. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Operating ROA (Basic Earning Power)"
          value={`${results.operatingRoaPct}%`}
          subtitle="Pre-tax, pre-interest operational earning power of total assets."
          badgeText="Basic Earning Power"
          badgeColorClass="bg-primary"
        />
        <InsightCard
          title="Leverage Multiplier & ROE Amplifier"
          value={`${results.equityMultiplier}x`}
          subtitle={`Liabilities fund ${results.debtToAssetsPct}% of assets, amplifying ROA to ${results.roePct}% ROE.`}
          badgeText="Financial Leverage"
          badgeColorClass="bg-emerald-500"
        />
      </div>

      {/* 7. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 ASSET EFFICIENCY EXECUTIVE VOUCHER</span>
          <span class="text-xs text-muted font-mono">{calculationMode.toUpperCase()} AUDIT</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Return on Assets</span>
            <span class="text-base font-bold text-primary">{results.roaPct}%</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Operating ROA (EBIT)</span>
            <span class="text-base font-bold text-emerald-600">{results.operatingRoaPct}%</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Asset Turnover</span>
            <span class="text-base font-bold text-indigo-600">{results.totalAssetTurnover}x</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Return on Equity</span>
            <span class="text-base font-bold text-amber-600">{results.roePct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
