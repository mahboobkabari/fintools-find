import { useState, useMemo } from 'preact/hooks';
import { calculateMrrArrCalculator } from '../../../calculators/business/mrr-arr-calculator.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import ResultDonutChart from '../../ui/ResultDonutChart';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';

const DEFAULT_MRR_STATE = {
  startingMrr: 1000000,
  newMrr: 150000,
  expansionMrr: 80000,
  reactivationMrr: 20000,
  contractionMrr: 30000,
  churnedMrr: 40000,
  valuationMultiple: 8,
  currencySymbol: '₹',
};

const MRR_PARAM_MAP = {
  startingMrr: 'smrr',
  newMrr: 'new',
  expansionMrr: 'exp',
  reactivationMrr: 'react',
  contractionMrr: 'contr',
  churnedMrr: 'churn',
  valuationMultiple: 'mult',
  currencySymbol: 'cur',
};

export default function MrrArrFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_MRR_STATE, MRR_PARAM_MAP);
  const {
    startingMrr,
    newMrr,
    expansionMrr,
    reactivationMrr,
    contractionMrr,
    churnedMrr,
    valuationMultiple,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Industry Presets
  const presets = [
    { id: 'seed_saas', label: 'Seed Stage (₹2.5L)', icon: '🌱', startingMrr: 250000, newMrr: 50000, expansionMrr: 20000, reactivationMrr: 5000, contractionMrr: 10000, churnedMrr: 15000, valuationMultiple: 8, currencySymbol: '₹', desc: '₹3.0L MRR · ₹36L ARR' },
    { id: 'growth_scaleup', label: 'Series A (₹25L)', icon: '🚀', startingMrr: 2500000, newMrr: 400000, expansionMrr: 250000, reactivationMrr: 50000, contractionMrr: 100000, churnedMrr: 150000, valuationMultiple: 10, currencySymbol: '₹', desc: '₹29.5L MRR · ₹3.54 Cr ARR' },
    { id: 'enterprise_saas', label: 'Enterprise (₹1.5 Cr)', icon: '🏢', startingMrr: 15000000, newMrr: 1500000, expansionMrr: 2000000, reactivationMrr: 200000, contractionMrr: 500000, churnedMrr: 800000, valuationMultiple: 12, currencySymbol: '₹', desc: '₹1.74 Cr MRR · ₹20.88 Cr ARR' },
    { id: 'expansion_flywheel', label: 'Elite Expansion', icon: '💎', startingMrr: 5000000, newMrr: 600000, expansionMrr: 1200000, reactivationMrr: 100000, contractionMrr: 100000, churnedMrr: 200000, valuationMultiple: 14, currencySymbol: '₹', desc: '118% NRR · 6.0x Quick Ratio' },
    { id: 'churn_turnaround', label: 'Churn Turnaround', icon: '⚠️', startingMrr: 1000000, newMrr: 100000, expansionMrr: 20000, reactivationMrr: 10000, contractionMrr: 80000, churnedMrr: 120000, valuationMultiple: 5, currencySymbol: '₹', desc: '82% NRR · Contraction Alert' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('startingMrr', p.startingMrr);
    setParam('newMrr', p.newMrr);
    setParam('expansionMrr', p.expansionMrr);
    setParam('reactivationMrr', p.reactivationMrr);
    setParam('contractionMrr', p.contractionMrr);
    setParam('churnedMrr', p.churnedMrr);
    setParam('valuationMultiple', p.valuationMultiple);
    setParam('currencySymbol', p.currencySymbol);
  };

  const results = useMemo(() => {
    return calculateMrrArrCalculator({
      startingMrr,
      newMrr,
      expansionMrr,
      reactivationMrr,
      contractionMrr,
      churnedMrr,
      valuationMultiple,
      currencySymbol,
    });
  }, [
    startingMrr,
    newMrr,
    expansionMrr,
    reactivationMrr,
    contractionMrr,
    churnedMrr,
    valuationMultiple,
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

  const fmt = (val) => `${currencySymbol}${Number(val).toLocaleString()}`;

  // Donut chart items for waterfall additions vs losses
  const waterfallSegments = results.waterfallItems
    .filter((w) => w.amount > 0)
    .map((w) => ({
      label: w.label,
      amount: w.amount,
      colorClass: w.colorClass,
      desc: w.type === 'addition' ? 'Revenue Expansion' : 'Revenue Contraction/Churn',
    }));

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Startup Scale &amp; Growth Preset" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            📊 SAAS REVENUE INTELLIGENCE &amp; ARR RUN-RATE
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase ${results.ratingColor} bg-surface-strong`}>
            {results.ratingTitle}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Starting MRR: <strong>{fmt(results.startingMrr)}</strong> · Gross Additions: <strong>+{fmt(results.grossAdditions)}</strong> · Gross Losses: <strong>-{fmt(results.grossLosses)}</strong> · NRR: <strong>{results.nrrPct}%</strong> · GRR: <strong>{results.grrPct}%</strong>.
        </p>

        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Ending MRR</span>
            <span class="text-sm font-bold text-primary">{fmt(results.endingMrr)}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Run-Rate ARR</span>
            <span class="text-sm font-bold text-emerald-600">{fmt(results.runRateArr)}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Net New MRR</span>
            <span class={`text-sm font-bold ${results.netNewMrr >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {results.netNewMrr >= 0 ? `+${fmt(results.netNewMrr)}` : fmt(results.netNewMrr)}
            </span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Quick Ratio</span>
            <span class="text-sm font-bold text-indigo-600">{isFinite(results.quickRatio) ? `${results.quickRatio}x` : 'Inf'}</span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">MRR Waterfall Streams</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Starting MRR */}
          <FormInputNumber id="start-mrr" label="Starting MRR (Beginning of Month)" value={startingMrr} min={0} max={1000000000} step={25000} prefix={currencySymbol} onChange={(v) => setParam('startingMrr', v)} />

          {/* Revenue Inflows */}
          <div class="space-y-4 pt-2">
            <span class="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider">
              🚀 REVENUE EXPANSIONS &amp; ADDITIONS
            </span>
            <div class="grid sm:grid-cols-3 gap-3">
              <FormInputNumber id="new-mrr" label="New Customer MRR" value={newMrr} min={0} max={500000000} step={10000} prefix={currencySymbol} onChange={(v) => setParam('newMrr', v)} />
              <FormInputNumber id="exp-mrr" label="Expansion &amp; Upsell" value={expansionMrr} min={0} max={500000000} step={10000} prefix={currencySymbol} onChange={(v) => setParam('expansionMrr', v)} />
              <FormInputNumber id="react-mrr" label="Reactivation MRR" value={reactivationMrr} min={0} max={500000000} step={5000} prefix={currencySymbol} onChange={(v) => setParam('reactivationMrr', v)} />
            </div>
          </div>

          {/* Revenue Outflows */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <span class="text-xs font-mono font-bold text-rose-600 uppercase tracking-wider">
              ⚠️ REVENUE CONTRACTION &amp; CHURN LOSSES
            </span>
            <div class="grid sm:grid-cols-2 gap-3">
              <FormInputNumber id="contr-mrr" label="Contraction &amp; Downgrades" value={contractionMrr} min={0} max={500000000} step={5000} prefix={currencySymbol} onChange={(v) => setParam('contractionMrr', v)} />
              <FormInputNumber id="churn-mrr" label="Churned Account Cancellations" value={churnedMrr} min={0} max={500000000} step={10000} prefix={currencySymbol} onChange={(v) => setParam('churnedMrr', v)} />
            </div>
          </div>

          {/* Valuation Multiples */}
          <div class="pt-4 border-t border-hairline">
            <FormInputNumber id="mult-input" label="SaaS ARR Valuation Multiple (x ARR)" value={valuationMultiple} min={1} max={50} step={0.5} suffix="x ARR" onChange={(v) => setParam('valuationMultiple', v)} />
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Visual Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Ending Monthly Recurring Revenue (MRR)"
            primaryValue={fmt(results.endingMrr)}
            secondaryItems={[
              { label: 'Run-Rate ARR', value: fmt(results.runRateArr) },
              { label: 'Net Revenue Retention', value: `${results.nrrPct}%` },
              { label: 'Gross Revenue Retention', value: `${results.grrPct}%` },
              { label: 'Enterprise Valuation', value: fmt(results.estimatedValuation) },
            ]}
          />

          <ResultDonutChart
            title="Monthly Waterfall Stream Distribution"
            centerValue={fmt(results.grossAdditions)}
            centerSubtext="Gross Additions"
            segments={waterfallSegments.map((s) => ({ label: s.label, amount: s.amount, colorClass: s.colorClass }))}
          />
        </div>
      </div>

      {/* 4. 12-MONTH FORWARD PROJECTION SCHEDULE */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono overflow-x-auto">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <h4 class="text-base font-bold font-heading text-ink">12-Month Forward Compound MRR &amp; ARR Schedule</h4>
          <span class="text-xs text-muted">Compound MoM Growth: {results.netGrowthRatePct}%</span>
        </div>

        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-hairline text-muted uppercase font-bold">
              <th class="py-2.5 px-3">Month</th>
              <th class="py-2.5 px-3 text-right">Projected MRR</th>
              <th class="py-2.5 px-3 text-right">Run-Rate ARR</th>
              <th class="py-2.5 px-3 text-right">Implied Valuation ({valuationMultiple}x ARR)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-hairline/60">
            {results.forwardProjection.map((row) => (
              <tr key={row.month} class="hover:bg-surface-soft transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">Month {row.month}</td>
                <td class="py-2.5 px-3 text-right font-semibold text-primary">{fmt(row.mrr)}</td>
                <td class="py-2.5 px-3 text-right font-bold text-emerald-600">{fmt(row.arr)}</td>
                <td class="py-2.5 px-3 text-right font-mono text-ink">{fmt(row.impliedValuation)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. ITEMISED WATERFALL BREAKDOWN */}
      <CostBreakdownCard
        title="Revenue Movement Decomposition"
        subtitle={`Net Monthly Movement: ${results.netNewMrr >= 0 ? `+${fmt(results.netNewMrr)}` : fmt(results.netNewMrr)}`}
        items={waterfallSegments}
      />

      {/* 6. RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 7. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Net Revenue Retention (NRR)"
          value={`${results.nrrPct}%`}
          subtitle={results.nrrPct >= 100 ? 'Existing customers expand faster than churn losses.' : 'Existing account base is shrinking.'}
          badgeText="Expansion"
          badgeColorClass={results.nrrPct >= 100 ? 'bg-semantic-success' : 'bg-rose-500'}
        />
        <InsightCard
          title="SaaS Quick Ratio"
          value={isFinite(results.quickRatio) ? `${results.quickRatio}x` : 'Infinite'}
          subtitle={`Ratio of gross expansion additions to revenue churn leakage.`}
          badgeText="Efficiency"
          badgeColorClass="bg-primary"
        />
      </div>

      {/* 8. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 SAAS REVENUE EXECUTIVE VOUCHER</span>
          <span class="text-xs text-muted font-mono">{valuationMultiple}X ARR VALUATION MULTIPLE</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Ending MRR</span>
            <span class="text-base font-bold text-primary">{fmt(results.endingMrr)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Run-Rate ARR</span>
            <span class="text-base font-bold text-emerald-600">{fmt(results.runRateArr)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Net New MRR</span>
            <span class="text-base font-bold text-indigo-600">{fmt(results.netNewMrr)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Valuation</span>
            <span class="text-base font-bold text-amber-600">{fmt(results.estimatedValuation)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
