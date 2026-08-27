import { useState, useMemo } from 'preact/hooks';
import { calculateIrrCalculator } from '../../../calculators/business/irr-calculator.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import ResultDonutChart from '../../ui/ResultDonutChart';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';

const DEFAULT_IRR_STATE = {
  initialInvestment: 1000000,
  cashFlowsStr: '250000,350000,400000,450000,500000',
  hurdleRate: 10,
  reinvestmentRate: 10,
  financingRate: 8,
  currencySymbol: '₹',
};

const IRR_PARAM_MAP = {
  initialInvestment: 'inv',
  cashFlowsStr: 'cfs',
  hurdleRate: 'hr',
  reinvestmentRate: 'rr',
  financingRate: 'fr',
  currencySymbol: 'cur',
};

export default function IrrFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_IRR_STATE, IRR_PARAM_MAP);
  const {
    initialInvestment,
    cashFlowsStr,
    hurdleRate,
    reinvestmentRate,
    financingRate,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Parse cash flows from comma-separated string
  const cashFlows = useMemo(() => {
    return String(cashFlowsStr || '250000,350000,400000,450000,500000')
      .split(',')
      .map((s) => Number(s.trim()) || 0);
  }, [cashFlowsStr]);

  const updateCashFlow = (index, value) => {
    const updated = [...cashFlows];
    updated[index] = Number(value) || 0;
    setParam('cashFlowsStr', updated.join(','));
  };

  const addCashFlowYear = () => {
    if (cashFlows.length < 15) {
      const lastVal = cashFlows[cashFlows.length - 1] || 100000;
      const updated = [...cashFlows, lastVal];
      setParam('cashFlowsStr', updated.join(','));
    }
  };

  const removeCashFlowYear = (index) => {
    if (cashFlows.length > 1) {
      const updated = cashFlows.filter((_, i) => i !== index);
      setParam('cashFlowsStr', updated.join(','));
    }
  };

  // Industry Presets
  const presets = [
    { id: 'saas', label: 'Tech SaaS Expansion', icon: '💻', initialInvestment: 1000000, cashFlowsStr: '250000,350000,400000,450000,500000', hurdleRate: 10, reinvestmentRate: 10, financingRate: 8, currencySymbol: '₹', desc: '₹10L CapEx · 24.0% IRR' },
    { id: 'mfg', label: 'Manufacturing Robotics', icon: '🏭', initialInvestment: 5000000, cashFlowsStr: '1200000,1500000,1800000,2000000,2200000', hurdleRate: 12, reinvestmentRate: 10, financingRate: 9, currencySymbol: '₹', desc: '₹50L Plant · 21.6% IRR' },
    { id: 'cre', label: 'Commercial Real Estate', icon: '🏢', initialInvestment: 10000000, cashFlowsStr: '900000,1000000,1100000,1200000,13200000', hurdleRate: 9, reinvestmentRate: 8, financingRate: 8.5, currencySymbol: '₹', desc: '₹1 Cr Outlay · 13.6% IRR' },
    { id: 'solar', label: 'Solar Rooftop Farm', icon: '☀️', initialInvestment: 8000000, cashFlowsStr: '1500000,1600000,1700000,1750000,1800000,1850000,1900000', hurdleRate: 8, reinvestmentRate: 8, financingRate: 7.5, currencySymbol: '₹', desc: '7-Year PPA · 11.2% IRR' },
    { id: 'retail', label: 'Retail Storefront', icon: '🛍️', initialInvestment: 2000000, cashFlowsStr: '400000,600000,700000,800000,900000', hurdleRate: 11, reinvestmentRate: 10, financingRate: 9.5, currencySymbol: '₹', desc: '₹20L Buildout · 21.5% IRR' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('initialInvestment', p.initialInvestment);
    setParam('cashFlowsStr', p.cashFlowsStr);
    setParam('hurdleRate', p.hurdleRate);
    setParam('reinvestmentRate', p.reinvestmentRate);
    setParam('financingRate', p.financingRate);
    setParam('currencySymbol', p.currencySymbol);
  };

  // Perform calculation
  const results = useMemo(() => {
    return calculateIrrCalculator({
      initialInvestment,
      cashFlows,
      hurdleRate,
      reinvestmentRate,
      financingRate,
      currencySymbol,
    });
  }, [
    initialInvestment,
    cashFlows,
    hurdleRate,
    reinvestmentRate,
    financingRate,
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

  // Donut chart items
  const cashFlowComposition = [
    { label: 'Initial Investment (Year 0 CapEx)', amount: results.initialInvestment, colorClass: 'bg-rose-500', desc: 'Upfront capital expenditure.' },
    { label: 'Net Present Value (NPV @ Hurdle)', amount: Math.max(0, results.npvAtHurdle), colorClass: 'bg-emerald-500', desc: 'Discounted value added above hurdle rate.' },
  ].filter((item) => item.amount > 0);

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Capital Investment Preset" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            📊 CAPITAL BUDGETING & IRR VERDICT
          </span>
          <span
            class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase ${
              results.decision === 'ACCEPT'
                ? 'text-semantic-success bg-emerald-500/10 border-emerald-500/30'
                : results.decision === 'INDIFFERENT'
                ? 'text-amber-600 bg-amber-500/10 border-amber-500/30'
                : 'text-rose-600 bg-rose-500/10 border-rose-500/30'
            }`}
          >
            {results.decision} · {results.decisionBadge}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          {results.decisionReason} Modified IRR (MIRR) is <strong>{results.mirrPercentage}%</strong> and Profitability Index is <strong>{results.profitabilityIndex}x</strong>.
        </p>

        {/* Hurdle Rate Spread KPI Strip */}
        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Standard IRR</span>
            <span class="text-sm font-bold text-primary">{results.irrPercentage !== null ? `${results.irrPercentage}%` : 'N/A'}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Modified IRR (MIRR)</span>
            <span class="text-sm font-bold text-indigo-600">{results.mirrPercentage}%</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Hurdle Rate (WACC)</span>
            <span class="text-sm font-bold text-amber-600">{results.hurdleRate}%</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">NPV @ Hurdle</span>
            <span class={`text-sm font-bold ${results.npvAtHurdle >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {fmt(results.npvAtHurdle)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Investment & Annual Cash Flow Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Project Cash Flow Stream</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="inv-input"
            label="Year 0 Initial Capital Outlay (CapEx)"
            value={initialInvestment}
            min={0}
            max={1000000000}
            step={50000}
            prefix={currencySymbol}
            onChange={(v) => setParam('initialInvestment', v)}
          />

          <div class="space-y-4 pt-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                📥 ANNUAL NET CASH INFLOWS ({cashFlows.length} YEARS)
              </span>
              <button
                type="button"
                onClick={addCashFlowYear}
                class="px-2.5 py-1 text-xs font-mono font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-1"
                disabled={cashFlows.length >= 15}
              >
                + Add Year
              </button>
            </div>

            <div class="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {cashFlows.map((cf, idx) => (
                <div key={idx} class="flex items-center gap-3 p-3 bg-surface-strong rounded-2xl border border-hairline">
                  <span class="w-16 font-mono font-bold text-xs text-muted flex-shrink-0">
                    Year {idx + 1}:
                  </span>
                  <div class="flex-grow flex items-center bg-canvas px-3 py-1.5 rounded-xl border border-hairline focus-within:border-primary">
                    <span class="text-xs font-mono text-muted mr-1 font-bold">{currencySymbol}</span>
                    <input
                      type="number"
                      value={cf}
                      onChange={(e) => updateCashFlow(idx, e.target.value)}
                      class="w-full bg-transparent text-right font-mono text-sm font-bold text-ink focus:outline-none"
                    />
                  </div>
                  {cashFlows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCashFlowYear(idx)}
                      class="p-2 text-muted hover:text-rose-600 rounded-lg hover:bg-hairline transition-colors flex-shrink-0"
                      title="Remove Year"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Discount & Hurdle Rates Panel */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider">📈 COST OF CAPITAL & MIRR ASSUMPTIONS</span>
            <div class="grid sm:grid-cols-3 gap-3">
              <FormInputNumber
                id="hurdle-input"
                label="Hurdle Rate"
                value={hurdleRate}
                min={0}
                max={50}
                step={0.5}
                suffix="%"
                onChange={(v) => setParam('hurdleRate', v)}
              />
              <FormInputNumber
                id="reinvest-input"
                label="Reinvestment"
                value={reinvestmentRate}
                min={0}
                max={50}
                step={0.5}
                suffix="%"
                onChange={(v) => setParam('reinvestmentRate', v)}
              />
              <FormInputNumber
                id="finance-input"
                label="Financing"
                value={financingRate}
                min={0}
                max={50}
                step={0.5}
                suffix="%"
                onChange={(v) => setParam('financingRate', v)}
              />
            </div>
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Profitability */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Internal Rate of Return (IRR)"
            primaryValue={results.irrPercentage !== null ? `${results.irrPercentage}%` : 'Undefined'}
            secondaryItems={[
              { label: 'Modified IRR (MIRR)', value: `${results.mirrPercentage}%` },
              { label: 'Net Present Value (NPV @ Hurdle)', value: fmt(results.npvAtHurdle) },
              { label: 'Profitability Index (PI)', value: `${results.profitabilityIndex}x` },
              { label: 'IRR Hurdle Rate Spread', value: `${results.irrSpread > 0 ? '+' : ''}${results.irrSpread}%` },
            ]}
          />

          <ResultDonutChart
            title="Capital Investment vs NPV Added"
            centerValue={fmt(results.totalInflows)}
            centerSubtext="Total Inflows"
            segments={cashFlowComposition.map((c) => ({ label: c.label, amount: c.amount, colorClass: c.colorClass }))}
          />
        </div>
      </div>

      {/* 4. NPV PROFILE SENSITIVITY TABLE */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 class="text-base font-bold font-heading text-ink">NPV Profile & Discount Rate Sensitivity Curve</h4>
            <p class="text-xs text-muted font-mono mt-0.5">How project NPV changes across varying discount rates (IRR is where NPV = 0)</p>
          </div>
          <span class="px-3 py-1 bg-primary/10 text-primary rounded-pill text-xs font-bold">
            Break-Even Discount: {results.irrPercentage !== null ? `${results.irrPercentage}%` : 'N/A'}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {results.npvProfile.map((p) => (
            <div
              key={p.rate}
              class={`p-3 rounded-2xl border text-center space-y-1 ${
                p.isHurdle
                  ? 'bg-primary/10 border-2 border-primary/40 shadow-sm'
                  : 'bg-surface-strong border-hairline'
              }`}
            >
              <span class="text-[10px] text-muted font-bold block uppercase">
                {p.rate}% Discount {p.isHurdle ? '(Hurdle)' : ''}
              </span>
              <span class={`text-sm font-bold block ${p.npv >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {fmt(p.npv)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. ANNUAL DISCOUNTED CASH FLOW BREAKDOWN TABLE */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono overflow-x-auto">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <h4 class="text-base font-bold font-heading text-ink">Annual Cash Flow & Present Value Schedule</h4>
          <span class="text-xs text-muted">Hurdle Rate: {hurdleRate}%</span>
        </div>
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-hairline text-muted uppercase font-bold">
              <th class="py-2.5 px-3">Period</th>
              <th class="py-2.5 px-3 text-right">Cash Flow</th>
              <th class="py-2.5 px-3 text-right">Discount Factor</th>
              <th class="py-2.5 px-3 text-right">Discounted PV</th>
              <th class="py-2.5 px-3 text-right">Cumulative Undiscounted</th>
              <th class="py-2.5 px-3 text-right">Cumulative Discounted</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-hairline/60">
            {results.annualTable.map((row) => (
              <tr key={row.year} class="hover:bg-surface-soft transition-colors">
                <td class="py-2.5 px-3 font-bold text-ink">
                  {row.year === 0 ? 'Year 0 (Outlay)' : `Year ${row.year}`}
                </td>
                <td class={`py-2.5 px-3 text-right font-bold ${row.cashFlow < 0 ? 'text-rose-600' : 'text-ink'}`}>
                  {fmt(row.cashFlow)}
                </td>
                <td class="py-2.5 px-3 text-right text-muted">{row.discountFactor.toFixed(4)}</td>
                <td class={`py-2.5 px-3 text-right font-bold ${row.discountedFlow < 0 ? 'text-rose-600' : 'text-primary'}`}>
                  {fmt(row.discountedFlow)}
                </td>
                <td class="py-2.5 px-3 text-right text-muted">{fmt(row.cumulativeUndiscounted)}</td>
                <td class={`py-2.5 px-3 text-right font-bold ${row.cumulativeDiscounted >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {fmt(row.cumulativeDiscounted)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. SMART RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 7. KEY FINANCIAL INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Value Creation Potential"
          value={fmt(results.npvAtHurdle)}
          subtitle={`At your ${hurdleRate}% hurdle rate, this capital expenditure creates ${fmt(results.npvAtHurdle)} in shareholder wealth.`}
          badgeText="NPV Added"
          badgeColorClass="bg-semantic-success"
        />
        <InsightCard
          title="Profitability Ratio"
          value={`${results.profitabilityIndex}x`}
          subtitle={`Each ${currencySymbol}1 invested yields ${currencySymbol}${results.profitabilityIndex} in present value terms.`}
          badgeText="Benefit-Cost Ratio"
          badgeColorClass="bg-primary"
        />
      </div>

      {/* 8. SUMMARY VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 CAPITAL ALLOCATION EXECUTIVE SUMMARY</span>
          <span class="text-xs text-muted font-mono">{results.decision} DECISION</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Initial Outlay</span>
            <span class="text-base font-bold text-rose-600">{fmt(results.initialInvestment)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Standard IRR</span>
            <span class="text-base font-bold text-primary">{results.irrPercentage !== null ? `${results.irrPercentage}%` : 'N/A'}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Modified IRR</span>
            <span class="text-base font-bold text-indigo-600">{results.mirrPercentage}%</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">NPV @ Hurdle</span>
            <span class="text-base font-bold text-emerald-600">{fmt(results.npvAtHurdle)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
