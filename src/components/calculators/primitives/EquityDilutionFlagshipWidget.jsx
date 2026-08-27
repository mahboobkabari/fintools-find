import { useState, useMemo } from 'preact/hooks';
import { calculateEquityDilutionCalculator } from '../../../calculators/business/equity-dilution-calculator.js';
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

const DEFAULT_DILUTION_STATE = {
  preMoneyValuation: 20000000,
  investmentAmount: 5000000,
  founderInitialOwnershipPct: 100,
  targetEsopPoolPct: 10,
  existingEsopPoolPct: 0,
  esopPoolTiming: 'pre_money',
  existingShares: 10000000,
  currencySymbol: '₹',
};

const DILUTION_PARAM_MAP = {
  preMoneyValuation: 'pre',
  investmentAmount: 'inv',
  founderInitialOwnershipPct: 'fown',
  targetEsopPoolPct: 'esop',
  existingEsopPoolPct: 'eesop',
  esopPoolTiming: 'timing',
  existingShares: 'shares',
  currencySymbol: 'cur',
};

export default function EquityDilutionFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_DILUTION_STATE, DILUTION_PARAM_MAP);
  const {
    preMoneyValuation,
    investmentAmount,
    founderInitialOwnershipPct,
    targetEsopPoolPct,
    existingEsopPoolPct,
    esopPoolTiming,
    existingShares,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Industry Presets
  const presets = [
    { id: 'seed_round', label: 'Seed (₹5 Cr / ₹20 Cr)', icon: '🌱', preMoneyValuation: 20000000, investmentAmount: 5000000, founderInitialOwnershipPct: 100, targetEsopPoolPct: 10, existingEsopPoolPct: 0, esopPoolTiming: 'pre_money', existingShares: 10000000, currencySymbol: '₹', desc: '70% Founder · 20% Investor · 10% ESOP' },
    { id: 'pre_seed_angel', label: 'Pre-Seed (₹1 Cr / ₹6 Cr)', icon: '👼', preMoneyValuation: 6000000, investmentAmount: 1000000, founderInitialOwnershipPct: 100, targetEsopPoolPct: 5, existingEsopPoolPct: 0, esopPoolTiming: 'pre_money', existingShares: 10000000, currencySymbol: '₹', desc: '80.7% Founder · 14.3% Angel' },
    { id: 'series_a_growth', label: 'Series A (₹25 Cr / ₹100 Cr)', icon: '🚀', preMoneyValuation: 100000000, investmentAmount: 25000000, founderInitialOwnershipPct: 70, targetEsopPoolPct: 12, existingEsopPoolPct: 5, esopPoolTiming: 'pre_money', existingShares: 12500000, currencySymbol: '₹', desc: '51.5% Founder · 20% Series A' },
    { id: 'series_b_expansion', label: 'Series B (₹75 Cr / ₹350 Cr)', icon: '🏢', preMoneyValuation: 350000000, investmentAmount: 75000000, founderInitialOwnershipPct: 50, targetEsopPoolPct: 10, existingEsopPoolPct: 8, esopPoolTiming: 'pre_money', existingShares: 16000000, currencySymbol: '₹', desc: '40.2% Founder · 17.6% Series B' },
    { id: 'post_money_safe', label: 'SAFE Note (Post-Money)', icon: '📝', preMoneyValuation: 12000000, investmentAmount: 2000000, founderInitialOwnershipPct: 100, targetEsopPoolPct: 8, existingEsopPoolPct: 0, esopPoolTiming: 'post_money', existingShares: 10000000, currencySymbol: '₹', desc: '78.9% Founder · Pro-Rata ESOP' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('preMoneyValuation', p.preMoneyValuation);
    setParam('investmentAmount', p.investmentAmount);
    setParam('founderInitialOwnershipPct', p.founderInitialOwnershipPct);
    setParam('targetEsopPoolPct', p.targetEsopPoolPct);
    setParam('existingEsopPoolPct', p.existingEsopPoolPct);
    setParam('esopPoolTiming', p.esopPoolTiming);
    setParam('existingShares', p.existingShares);
    setParam('currencySymbol', p.currencySymbol);
  };

  const results = useMemo(() => {
    return calculateEquityDilutionCalculator({
      preMoneyValuation,
      investmentAmount,
      founderInitialOwnershipPct,
      targetEsopPoolPct,
      existingEsopPoolPct,
      esopPoolTiming,
      existingShares,
      currencySymbol,
    });
  }, [
    preMoneyValuation,
    investmentAmount,
    founderInitialOwnershipPct,
    targetEsopPoolPct,
    existingEsopPoolPct,
    esopPoolTiming,
    existingShares,
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

  // Donut chart segments for cap table post-round
  const capTableSegments = results.capTable.map((item) => ({
    label: item.stakeholder,
    amount: item.postRoundPct,
    colorClass: item.colorClass,
    desc: `${item.postRoundPct}% (${fmt(item.postRoundValue)})`,
  }));

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Funding Stage &amp; Cap Table Preset" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            ⚖️ CAP TABLE DILUTION &amp; VALUATION INTELLIGENCE
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase ${results.healthColor} bg-surface-strong`}>
            {results.healthTitle}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Pre-Money: <strong>{fmt(results.preMoneyValuation)}</strong> · Investment Raised: <strong>{fmt(results.investmentAmount)}</strong> · Post-Money: <strong>{fmt(results.postMoneyValuation)}</strong> · ESOP Pool: <strong>{results.esopPostRoundPct}%</strong> · Price Per Share: <strong>{fmt(results.sharePrice)}</strong>.
        </p>

        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Founder Equity</span>
            <span class="text-sm font-bold text-primary">{results.founderPostRoundPct}%</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Stake Value</span>
            <span class="text-sm font-bold text-emerald-600">{fmt(results.founderPostRoundValue)}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Round Dilution</span>
            <span class="text-sm font-bold text-rose-600">{results.founderDilutionPct}%</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Post-Money</span>
            <span class="text-sm font-bold text-ink">{fmt(results.postMoneyValuation)}</span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Round Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber id="pre-val" label="Pre-Money Valuation" value={preMoneyValuation} min={10000} max={10000000000} step={500000} prefix={currencySymbol} onChange={(v) => setParam('preMoneyValuation', v)} />
          <FormInputNumber id="inv-amt" label="Investment Capital Raised" value={investmentAmount} min={0} max={5000000000} step={250000} prefix={currencySymbol} onChange={(v) => setParam('investmentAmount', v)} />

          <div class="grid sm:grid-cols-2 gap-3 pt-2">
            <FormInputNumber id="f-own" label="Founder Initial Equity (%)" value={founderInitialOwnershipPct} min={1} max={100} step={1} suffix="%" onChange={(v) => setParam('founderInitialOwnershipPct', v)} />
            <FormInputNumber id="t-esop" label="Target ESOP Pool (%)" value={targetEsopPoolPct} min={0} max={30} step={1} suffix="%" onChange={(v) => setParam('targetEsopPoolPct', v)} />
          </div>

          <div class="grid sm:grid-cols-2 gap-3 pt-2">
            <FormInputNumber id="e-esop" label="Existing ESOP Pool (%)" value={existingEsopPoolPct} min={0} max={30} step={1} suffix="%" onChange={(v) => setParam('existingEsopPoolPct', v)} />
            <FormInputNumber id="shares" label="Existing Share Count" value={existingShares} min={1000} max={1000000000} step={100000} suffix="Shares" onChange={(v) => setParam('existingShares', v)} />
          </div>

          {/* Option Pool Shuffle Timing Selector */}
          <div class="pt-4 border-t border-hairline space-y-2">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-muted block">
              Option Pool Timing &amp; Dilution Structure
            </span>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setParam('esopPoolTiming', 'pre_money')}
                class={`p-3 rounded-xl border text-left font-mono text-xs transition-all ${
                  esopPoolTiming === 'pre_money'
                    ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                    : 'bg-surface-soft border-hairline text-body hover:border-primary/50'
                }`}
              >
                <span class="block font-bold">Pre-Money Pool (VC Standard)</span>
                <span class="text-[10px] opacity-80">Founders bear 100% of ESOP dilution</span>
              </button>
              <button
                type="button"
                onClick={() => setParam('esopPoolTiming', 'post_money')}
                class={`p-3 rounded-xl border text-left font-mono text-xs transition-all ${
                  esopPoolTiming === 'post_money'
                    ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                    : 'bg-surface-soft border-hairline text-body hover:border-primary/50'
                }`}
              >
                <span class="block font-bold">Post-Money Pool (Pro-Rata)</span>
                <span class="text-[10px] opacity-80">Investors &amp; Founders share dilution</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Visual Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Founding Team Post-Round Ownership"
            primaryValue={`${results.founderPostRoundPct}%`}
            secondaryItems={[
              { label: 'Post-Money Valuation', value: fmt(results.postMoneyValuation) },
              { label: 'Founder Stake Value', value: fmt(results.founderPostRoundValue) },
              { label: 'New Round Investors', value: `${results.investorPostRoundPct}%` },
              { label: 'ESOP Option Pool', value: `${results.esopPostRoundPct}%` },
            ]}
          />

          <ResultDonutChart
            title="Post-Round Cap Table Ownership"
            centerValue={`${results.founderPostRoundPct}%`}
            centerSubtext="Founders"
            segments={capTableSegments.map((s) => ({ label: s.label, amount: s.amount, colorClass: s.colorClass }))}
          />
        </div>
      </div>

      {/* 4. MULTI-ROUND FORWARD DILUTION WATERFALL */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono overflow-x-auto">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <h4 class="text-base font-bold font-heading text-ink">Multi-Round Forward Cap Table Trajectory (Seed → Series B)</h4>
          <span class="text-xs text-muted">Simulated Growth &amp; Compounding Value</span>
        </div>

        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-hairline text-muted uppercase font-bold">
              <th class="py-2.5 px-3">Round</th>
              <th class="py-2.5 px-3 text-right">Pre-Money</th>
              <th class="py-2.5 px-3 text-right">Raised</th>
              <th class="py-2.5 px-3 text-right">Post-Money</th>
              <th class="py-2.5 px-3 text-right">Founder Equity (%)</th>
              <th class="py-2.5 px-3 text-right">Founder Stake Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-hairline/60">
            {results.forwardRounds.map((r, idx) => (
              <tr key={idx} class="hover:bg-surface-soft transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">{r.roundName}</td>
                <td class="py-2.5 px-3 text-right font-mono text-muted">{fmt(r.preMoney)}</td>
                <td class="py-2.5 px-3 text-right font-mono text-primary font-semibold">+{fmt(r.raised)}</td>
                <td class="py-2.5 px-3 text-right font-mono text-ink font-bold">{fmt(r.postMoney)}</td>
                <td class="py-2.5 px-3 text-right font-bold text-indigo-600">{r.founderPct}%</td>
                <td class="py-2.5 px-3 text-right font-bold text-emerald-600">{fmt(r.founderValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. ITEMISED CAP TABLE BREAKDOWN */}
      <CostBreakdownCard
        title="Cap Table Ownership Breakdown"
        subtitle={`Total Capital Raised: ${fmt(results.investmentAmount)} on ${fmt(results.postMoneyValuation)} Post-Money`}
        items={capTableSegments}
      />

      {/* 6. RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 7. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Share Price &amp; Issuance"
          value={fmt(results.sharePrice)}
          subtitle={`Total post-round shares: ${results.totalPostRoundShares.toLocaleString()} (+${results.newSharesIssued.toLocaleString()} new shares issued).`}
          badgeText="Share Price"
          badgeColorClass="bg-primary"
        />
        <InsightCard
          title="Founder Dilution Impact"
          value={`${results.founderDilutionPct}%`}
          subtitle={`Initial: ${results.founderInitialOwnershipPct}% → Post-Round: ${results.founderPostRoundPct}%.`}
          badgeText="Round Dilution"
          badgeColorClass={results.founderDilutionPct <= 25 ? 'bg-semantic-success' : 'bg-rose-500'}
        />
      </div>

      {/* 8. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 CAP TABLE EXECUTIVE VOUCHER</span>
          <span class="text-xs text-muted font-mono">{esopPoolTiming === 'pre_money' ? 'PRE-MONEY ESOP SHUFFLE' : 'POST-MONEY PRO-RATA ESOP'}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Founder Equity</span>
            <span class="text-base font-bold text-primary">{results.founderPostRoundPct}%</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Stake Value</span>
            <span class="text-base font-bold text-emerald-600">{fmt(results.founderPostRoundValue)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Investor Stake</span>
            <span class="text-base font-bold text-indigo-600">{results.investorPostRoundPct}%</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">ESOP Pool</span>
            <span class="text-base font-bold text-amber-600">{results.esopPostRoundPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
