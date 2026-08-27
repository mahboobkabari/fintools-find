import { useState, useMemo } from 'preact/hooks';
import { calculateStartupValuationCalculator } from '../../../calculators/business/startup-valuation-calculator.js';
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

const DEFAULT_VALUATION_STATE = {
  primaryMethod: 'scorecard',
  basePreMoneyValuation: 20000000,
  investmentAsk: 5000000,
  annualRevenue: 12000000,
  arrMultiple: 8,
  teamScore: 110,
  marketSizeScore: 115,
  productScore: 105,
  competitionScore: 100,
  partnershipsScore: 100,
  capitalNeedScore: 100,
  regulatoryScore: 100,
  berkusSoundIdea: 5000000,
  berkusPrototype: 5000000,
  berkusQualityTeam: 5000000,
  berkusStrategicAlliances: 4000000,
  berkusProductRollout: 3000000,
  exitYearRevenue: 100000000,
  exitMultiple: 6,
  targetRoiMultiple: 10,
  futureDilutionPct: 25,
  currencySymbol: '₹',
};

const VALUATION_PARAM_MAP = {
  primaryMethod: 'mth',
  basePreMoneyValuation: 'base',
  investmentAsk: 'ask',
  annualRevenue: 'rev',
  arrMultiple: 'mult',
  teamScore: 'team',
  marketSizeScore: 'mkt',
  productScore: 'prod',
  currencySymbol: 'cur',
};

export default function StartupValuationFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_VALUATION_STATE, VALUATION_PARAM_MAP);
  const {
    primaryMethod,
    basePreMoneyValuation,
    investmentAsk,
    annualRevenue,
    arrMultiple,
    teamScore,
    marketSizeScore,
    productScore,
    competitionScore,
    partnershipsScore,
    capitalNeedScore,
    regulatoryScore,
    berkusSoundIdea,
    berkusPrototype,
    berkusQualityTeam,
    berkusStrategicAlliances,
    berkusProductRollout,
    exitYearRevenue,
    exitMultiple,
    targetRoiMultiple,
    futureDilutionPct,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Presets
  const presets = [
    { id: 'seed_prototype', label: 'Seed Prototype', icon: '🌱', primaryMethod: 'scorecard', basePreMoneyValuation: 20000000, investmentAsk: 5000000, annualRevenue: 12000000, arrMultiple: 8, teamScore: 110, marketSizeScore: 115, productScore: 105, currencySymbol: '₹', desc: 'Scorecard Method · ₹2.16 Cr Valuation' },
    { id: 'pre_seed_idea', label: 'Pre-Seed (Berkus)', icon: '💡', primaryMethod: 'berkus', basePreMoneyValuation: 10000000, investmentAsk: 2500000, annualRevenue: 0, berkusSoundIdea: 4000000, berkusPrototype: 4000000, berkusQualityTeam: 4000000, berkusStrategicAlliances: 2000000, berkusProductRollout: 1000000, currencySymbol: '₹', desc: '5 Milestones · ₹1.50 Cr Valuation' },
    { id: 'early_saas', label: 'Early SaaS (10x ARR)', icon: '🚀', primaryMethod: 'arr_multiple', basePreMoneyValuation: 30000000, investmentAsk: 7500000, annualRevenue: 36000000, arrMultiple: 10, currencySymbol: '₹', desc: '₹3.6 Cr ARR · ₹3.60 Cr Pre-Money' },
    { id: 'series_a_vc', label: 'Series A VC Exit', icon: '🏢', primaryMethod: 'vc_method', basePreMoneyValuation: 400000000, investmentAsk: 100000000, exitYearRevenue: 1000000000, exitMultiple: 6, targetRoiMultiple: 10, futureDilutionPct: 25, currencySymbol: '₹', desc: '10x ROI Hurdle · ₹35.0 Cr Pre-Money' },
    { id: 'blended_synthesis', label: 'Blended Synthesis', icon: '⚖️', primaryMethod: 'blended', basePreMoneyValuation: 25000000, investmentAsk: 5000000, annualRevenue: 10000000, arrMultiple: 8, currencySymbol: '₹', desc: 'Weighted Multi-Method Average' },
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
    return calculateStartupValuationCalculator({
      primaryMethod,
      basePreMoneyValuation,
      investmentAsk,
      annualRevenue,
      arrMultiple,
      teamScore,
      marketSizeScore,
      productScore,
      competitionScore,
      partnershipsScore,
      capitalNeedScore,
      regulatoryScore,
      berkusSoundIdea,
      berkusPrototype,
      berkusQualityTeam,
      berkusStrategicAlliances,
      berkusProductRollout,
      exitYearRevenue,
      exitMultiple,
      targetRoiMultiple,
      futureDilutionPct,
      currencySymbol,
    });
  }, [
    primaryMethod,
    basePreMoneyValuation,
    investmentAsk,
    annualRevenue,
    arrMultiple,
    teamScore,
    marketSizeScore,
    productScore,
    competitionScore,
    partnershipsScore,
    capitalNeedScore,
    regulatoryScore,
    berkusSoundIdea,
    berkusPrototype,
    berkusQualityTeam,
    berkusStrategicAlliances,
    berkusProductRollout,
    exitYearRevenue,
    exitMultiple,
    targetRoiMultiple,
    futureDilutionPct,
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

  // Donut chart segments for valuation comparison methods
  const methodSegments = results.valuationMethodsList
    .filter((m) => m.value > 0)
    .map((m) => ({
      label: m.method,
      amount: m.value,
      colorClass: m.colorClass,
      desc: `${fmt(m.value)} (${m.desc})`,
    }));

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Stage &amp; Valuation Methodology Preset" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            🚀 STARTUP PRE-MONEY VALUATION INTELLIGENCE
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase ${results.healthColor} bg-surface-strong`}>
            {results.healthTitle}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Primary Method: <strong>{primaryMethod.toUpperCase()}</strong> · Investment Target: <strong>{fmt(results.investmentAsk)}</strong> · Post-Money: <strong>{fmt(results.postMoneyValuation)}</strong> · Investor Equity: <strong>{results.investorEquityPct}%</strong> · Valuation Range: <strong>{fmt(results.valuationMin)} – {fmt(results.valuationMax)}</strong>.
        </p>

        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Pre-Money</span>
            <span class="text-sm font-bold text-primary">{fmt(results.selectedPreMoney)}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Post-Money</span>
            <span class="text-sm font-bold text-emerald-600">{fmt(results.postMoneyValuation)}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Investor Stake</span>
            <span class="text-sm font-bold text-indigo-600">{results.investorEquityPct}%</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Blended Avg</span>
            <span class="text-sm font-bold text-ink">{fmt(results.blendedValuation)}</span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Valuation Model Drivers</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Primary Model Tab Selector */}
          <div class="space-y-2">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted block">
              Primary Valuation Methodology
            </span>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'scorecard', label: 'Scorecard (Payne)' },
                { id: 'berkus', label: 'Berkus (Milestones)' },
                { id: 'vc_method', label: 'VC Exit Method' },
                { id: 'arr_multiple', label: 'ARR Multiple' },
                { id: 'blended', label: 'Blended Synthesis' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setParam('primaryMethod', tab.id)}
                  class={`p-2.5 rounded-xl border text-center font-mono text-xs transition-all ${
                    primaryMethod === tab.id
                      ? 'bg-primary text-white border-primary font-bold shadow-sm'
                      : 'bg-surface-soft border-hairline text-body hover:border-primary/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Core Investment & Base Parameters */}
          <div class="grid sm:grid-cols-2 gap-3 pt-2">
            <FormInputNumber id="base-val" label="Regional Base Valuation" value={basePreMoneyValuation} min={10000} max={10000000000} step={500000} prefix={currencySymbol} onChange={(v) => setParam('basePreMoneyValuation', v)} />
            <FormInputNumber id="inv-ask" label="Target Capital Raised" value={investmentAsk} min={0} max={5000000000} step={250000} prefix={currencySymbol} onChange={(v) => setParam('investmentAsk', v)} />
          </div>

          {/* Contextual Model Sliders */}
          {primaryMethod === 'scorecard' && (
            <div class="space-y-3 pt-2 border-t border-hairline">
              <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider block">
                Bill Payne Scorecard Factor Multipliers (%)
              </span>
              <FormInputNumber id="team-sc" label="Management Team Strength (30% Wt)" value={teamScore} min={0} max={200} step={5} suffix="%" onChange={(v) => setParam('teamScore', v)} />
              <FormInputNumber id="mkt-sc" label="Market Opportunity Size (25% Wt)" value={marketSizeScore} min={0} max={200} step={5} suffix="%" onChange={(v) => setParam('marketSizeScore', v)} />
              <FormInputNumber id="prod-sc" label="Product / Technology Stage (15% Wt)" value={productScore} min={0} max={200} step={5} suffix="%" onChange={(v) => setParam('productScore', v)} />
            </div>
          )}

          {primaryMethod === 'berkus' && (
            <div class="space-y-3 pt-2 border-t border-hairline">
              <span class="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider block">
                Berkus Pre-Revenue 5-Milestone Values
              </span>
              <FormInputNumber id="b-idea" label="Sound Idea (Basic Value)" value={berkusSoundIdea} min={0} max={10000000} step={500000} prefix={currencySymbol} onChange={(v) => setParam('berkusSoundIdea', v)} />
              <FormInputNumber id="b-proto" label="Prototype (Technology Risk)" value={berkusPrototype} min={0} max={10000000} step={500000} prefix={currencySymbol} onChange={(v) => setParam('berkusPrototype', v)} />
              <FormInputNumber id="b-team" label="Quality Management Team (Execution)" value={berkusQualityTeam} min={0} max={10000000} step={500000} prefix={currencySymbol} onChange={(v) => setParam('berkusQualityTeam', v)} />
              <FormInputNumber id="b-allies" label="Strategic Relationships (Partnerships)" value={berkusStrategicAlliances} min={0} max={10000000} step={500000} prefix={currencySymbol} onChange={(v) => setParam('berkusStrategicAlliances', v)} />
            </div>
          )}

          {primaryMethod === 'vc_method' && (
            <div class="space-y-3 pt-2 border-t border-hairline">
              <span class="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider block">
                VC Exit Hurdle &amp; Multiple Parameters
              </span>
              <FormInputNumber id="exit-rev" label="Projected Year-5 Revenue" value={exitYearRevenue} min={1000000} max={50000000000} step={5000000} prefix={currencySymbol} onChange={(v) => setParam('exitYearRevenue', v)} />
              <div class="grid sm:grid-cols-2 gap-3">
                <FormInputNumber id="exit-mult" label="Exit Revenue Multiple" value={exitMultiple} min={1} max={30} step={0.5} suffix="x" onChange={(v) => setParam('exitMultiple', v)} />
                <FormInputNumber id="roi-hurdle" label="Target ROI Multiple" value={targetRoiMultiple} min={1} max={50} step={1} suffix="x ROI" onChange={(v) => setParam('targetRoiMultiple', v)} />
              </div>
            </div>
          )}

          {(primaryMethod === 'arr_multiple' || primaryMethod === 'blended') && (
            <div class="space-y-3 pt-2 border-t border-hairline">
              <span class="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider block">
                Annual Recurring Revenue (ARR) Drivers
              </span>
              <div class="grid sm:grid-cols-2 gap-3">
                <FormInputNumber id="arr-val" label="Current Annual Revenue" value={annualRevenue} min={0} max={1000000000} step={500000} prefix={currencySymbol} onChange={(v) => setParam('annualRevenue', v)} />
                <FormInputNumber id="arr-mult" label="Sector ARR Multiple" value={arrMultiple} min={1} max={40} step={0.5} suffix="x ARR" onChange={(v) => setParam('arrMultiple', v)} />
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: KPI Dashboard & Visual Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Estimated Pre-Money Valuation"
            primaryValue={fmt(results.selectedPreMoney)}
            secondaryItems={[
              { label: 'Post-Money Valuation', value: fmt(results.postMoneyValuation) },
              { label: 'Investor Ownership', value: `${results.investorEquityPct}%` },
              { label: 'Blended Synthesis', value: fmt(results.blendedValuation) },
              { label: 'Valuation Range', value: `${fmt(results.valuationMin)} - ${fmt(results.valuationMax)}` },
            ]}
          />

          <ResultDonutChart
            title="Multi-Method Valuation Comparison"
            centerValue={fmt(results.blendedValuation)}
            centerSubtext="Blended Average"
            segments={methodSegments.map((s) => ({ label: s.label, amount: s.amount, colorClass: s.colorClass }))}
          />
        </div>
      </div>

      {/* 4. METHODOLOGY COMPARISON SCHEDULE */}
      <CostBreakdownCard
        title="Valuation Triangulation Synthesis"
        subtitle={`Synthesis across Angel, Seed, VC, and Revenue Multiple frameworks`}
        items={methodSegments}
      />

      {/* 5. RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 6. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Round Dilution Impact"
          value={`${results.investorEquityPct}%`}
          subtitle={`Founders retain ${results.founderRetainedPct}% on ${fmt(results.postMoneyValuation)} post-money.`}
          badgeText="Dilution"
          badgeColorClass={results.investorEquityPct <= 25 ? 'bg-semantic-success' : 'bg-rose-500'}
        />
        <InsightCard
          title="Scorecard Factor"
          value={`${Math.round(results.weightedScoreFactor * 100)}%`}
          subtitle={`Relative to ${fmt(results.basePreMoneyValuation)} regional baseline valuation.`}
          badgeText="Payne Score"
          badgeColorClass="bg-primary"
        />
      </div>

      {/* 7. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 STARTUP VALUATION EXECUTIVE VOUCHER</span>
          <span class="text-xs text-muted font-mono">{primaryMethod.toUpperCase()} FRAMEWORK</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Pre-Money</span>
            <span class="text-base font-bold text-primary">{fmt(results.selectedPreMoney)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Investment Ask</span>
            <span class="text-base font-bold text-emerald-600">{fmt(results.investmentAsk)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Post-Money</span>
            <span class="text-base font-bold text-ink">{fmt(results.postMoneyValuation)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Investor Stake</span>
            <span class="text-base font-bold text-indigo-600">{results.investorEquityPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
