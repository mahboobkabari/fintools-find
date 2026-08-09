import { useState, useMemo } from 'preact/hooks';
import { calculateCagr } from '../../../calculators/investment/cagr-calculator.js';
import { INDIAN_INVESTMENT_BENCHMARKS } from '../../../data/investment-benchmarks/indianInvestmentBenchmarks.js';
import { formatCurrency } from '@utils/formatters.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Library Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import ResultDonutChart from '../../ui/ResultDonutChart';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import FinancialHealthGauge from '../../ui/FinancialHealthGauge';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';

const DEFAULT_CAGR_STATE = {
  initialValue: 100000,
  finalValue: 250000,
  tenureYears: 5,
  inflationRate: 6,
  selectedBenchmarkId: 'nifty50',
};

const CAGR_PARAM_MAP = {
  initialValue: 'iv',
  finalValue: 'fv',
  tenureYears: 'yr',
  inflationRate: 'inf',
  selectedBenchmarkId: 'bm',
};

export default function CagrFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_CAGR_STATE, CAGR_PARAM_MAP);
  const { initialValue, finalValue, tenureYears, inflationRate, selectedBenchmarkId } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Illustrative Smart Presets (No Multibagger / Extreme Claims)
  const presets = [
    { id: 'fd', label: 'Fixed Deposit', icon: '🏛️', initialValue: 100000, finalValue: 143000, tenureYears: 5, desc: '₹1L to ₹1.43L in 5 Yrs (~7.4% CAGR)' },
    { id: 'nifty', label: 'Broad Market Index', icon: '📈', initialValue: 100000, finalValue: 310000, tenureYears: 10, desc: '₹1L to ₹3.1L in 10 Yrs (~12% CAGR)' },
    { id: 'equity', label: 'Long-Term Equity', icon: '🚀', initialValue: 200000, finalValue: 1030000, tenureYears: 12, desc: '₹2L to ₹10.3L in 12 Yrs (~14.5% CAGR)' },
    { id: 'realestate', label: 'Real Estate', icon: '🏡', initialValue: 2500000, finalValue: 6500000, tenureYears: 10, desc: '₹25L to ₹65L in 10 Yrs (~10% CAGR)' },
    { id: 'gold', label: 'Sovereign Gold', icon: '🪙', initialValue: 100000, finalValue: 236000, tenureYears: 10, desc: '₹1L to ₹2.36L in 10 Yrs (~9% CAGR)' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('initialValue', p.initialValue);
    setParam('finalValue', p.finalValue);
    setParam('tenureYears', p.tenureYears);
  };

  // Run pure math calculation engine
  const results = useMemo(() => {
    return calculateCagr({
      initialValue,
      finalValue,
      tenureYears,
      inflationRate,
      selectedBenchmarkId,
    });
  }, [initialValue, finalValue, tenureYears, inflationRate, selectedBenchmarkId]);

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

  // Dashboard Metrics items
  const dashboardMetrics = [
    { label: 'CAGR (Annualized Return)', value: `${results.cagrPct}%`, highlight: true, subtitle: 'Compound annual growth rate' },
    { label: 'Absolute Wealth Created', value: formatCurrency(results.absoluteGain), subtitle: 'Total profit in Rupees' },
    { label: 'Absolute Return (%)', value: `${results.absoluteGrowthPct}%`, subtitle: 'Total percentage gain' },
    { label: 'Wealth Multiplier Factor', value: `${results.wealthMultiplier}x`, subtitle: 'Ratio of Final to Initial' },
    { label: 'Real CAGR (After Inflation)', value: `${results.realCagrPct}%`, subtitle: `Adjusted for ${inflationRate}% inflation` },
    { label: 'Benchmark Status', value: results.benchmarkStatus, subtitle: `vs ${results.selectedBenchmark.name}` },
  ];

  // Donut Chart items for Capital Allocation
  const cagrDonutData = [
    { name: 'Initial Capital', value: results.initialValue, color: '#3b82f6' },
    { name: 'Capital Wealth Gain', value: Math.max(0, results.absoluteGain), color: '#10b981' },
  ];

  // Benchmark Comparison Items
  const benchmarkItems = [
    {
      label: 'Your Portfolio Investment CAGR',
      amount: results.cagrPct,
      colorClass: 'bg-primary',
      desc: `${results.cagrPct}% annual compound rate over ${tenureYears} years.`,
    },
    {
      label: `Selected Benchmark: ${results.selectedBenchmark.name}`,
      amount: results.selectedBenchmark.annualRate,
      colorClass: 'bg-accent-sky',
      desc: `${results.selectedBenchmark.description} (${results.selectedBenchmark.disclaimer})`,
    },
    {
      label: 'Annualized Performance Alpha (Difference)',
      amount: results.diffFromBenchmarkPct,
      colorClass: results.diffFromBenchmarkPct >= 0 ? 'bg-emerald-500' : 'bg-semantic-danger',
      desc: `${results.diffFromBenchmarkPct >= 0 ? 'Surplus alpha' : 'Deficit'} relative to benchmark rate.`,
    },
  ];

  return (
    <div class="space-y-10">
      {/* 1. Smart Presets Section */}
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-mono text-body font-semibold uppercase tracking-wider">
            Illustrative Investment Performance Profiles
          </span>
          <span class="text-[11px] font-mono text-body-muted bg-surface px-2 py-0.5 rounded border border-hairline">
            Illustrative Examples (Not Guaranteed Returns)
          </span>
        </div>
        <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select CAGR Profile Preset" />
      </div>

      {/* 2. PROMINENT QUESTION BANNER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider">
            📊 CAGR PERFORMANCE VERDICT
          </span>
          <div class="flex items-center gap-2">
            <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${results.healthColor}`}>
              Illustrative Performance Score: {results.score}/100 ({results.healthStatus})
            </span>
          </div>
        </div>

        {/* UX PROMINENT QUESTIONS */}
        <div class="grid md:grid-cols-3 gap-4 pt-2">
          <div class="p-4 rounded-2xl bg-canvas border border-hairline space-y-1">
            <div class="text-xs font-mono text-body-muted uppercase font-bold">1. How fast did it grow?</div>
            <div class={`text-2xl sm:text-3xl font-extrabold font-heading ${results.cagrPct >= 0 ? 'text-emerald-500' : 'text-semantic-danger'}`}>
              {results.cagrPct}% <span class="text-xs text-body font-normal">CAGR</span>
            </div>
            <div class="text-[11px] text-body-muted font-mono">Annualized geometric compound growth</div>
          </div>

          <div class="p-4 rounded-2xl bg-canvas border border-hairline space-y-1">
            <div class="text-xs font-mono text-body-muted uppercase font-bold">2. How much wealth created?</div>
            <div class="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
              {formatCurrency(results.absoluteGain)}
            </div>
            <div class="text-[11px] text-body-muted font-mono">{results.wealthMultiplier}x initial capital multiplier</div>
          </div>

          <div class="p-4 rounded-2xl bg-canvas border border-hairline space-y-1">
            <div class="text-xs font-mono text-body-muted uppercase font-bold">3. Benchmark comparison</div>
            <div class="text-2xl sm:text-3xl font-extrabold font-heading text-ink">
              {results.diffFromBenchmarkPct > 0 ? `+${results.diffFromBenchmarkPct}%` : `${results.diffFromBenchmarkPct}%`}
            </div>
            <div class="text-[11px] text-body-muted font-mono">{results.benchmarkStatus} vs {results.selectedBenchmark.name}</div>
          </div>
        </div>

        <p class="text-xs sm:text-sm text-body leading-relaxed pt-1">
          {results.healthDesc}
        </p>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Control Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <div>
              <h3 class="text-xl font-bold font-heading text-ink">CAGR Investment Parameters</h3>
              <p class="text-xs text-body-muted font-mono mt-0.5">Geometric Annual Growth Engine</p>
            </div>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="initial-value-input"
            label="Initial Investment Cost (₹)"
            value={initialValue}
            min={1000}
            max={50000000}
            step={5000}
            prefix="₹"
            minLabel="₹1k"
            maxLabel="₹5Cr"
            onChange={(v) => setParam('initialValue', v)}
          />

          <FormInputNumber
            id="final-value-input"
            label="Final / Current Investment Value (₹)"
            value={finalValue}
            min={0}
            max={200000000}
            step={10000}
            prefix="₹"
            minLabel="₹0"
            maxLabel="₹20Cr"
            onChange={(v) => setParam('finalValue', v)}
          />

          <FormInputNumber
            id="tenure-years-input"
            label="Holding Period Duration (Years)"
            value={tenureYears}
            min={1}
            max={40}
            step={1}
            prefix=""
            minLabel="1 Yr"
            maxLabel="40 Yrs"
            onChange={(v) => setParam('tenureYears', v)}
          />

          <FormInputNumber
            id="inflation-rate-input"
            label="Estimated Annual Inflation Rate (%)"
            value={inflationRate}
            min={0}
            max={15}
            step={0.5}
            prefix="%"
            minLabel="0%"
            maxLabel="15%"
            onChange={(v) => setParam('inflationRate', v)}
          />

          {/* Benchmark Selector */}
          <div class="space-y-2 pt-2 border-t border-hairline">
            <label class="block text-xs font-bold font-heading text-ink">Illustrative Benchmark for Comparison</label>
            <select
              value={selectedBenchmarkId}
              onChange={(e) => setParam('selectedBenchmarkId', e.target.value)}
              class="w-full p-3 rounded-2xl border border-hairline bg-surface text-ink text-xs font-mono font-bold focus:outline-none focus:border-primary"
            >
              {Object.values(INDIAN_INVESTMENT_BENCHMARKS).filter((b) => b.id !== 'inflationRate').map((bm) => (
                <option key={bm.id} value={bm.id}>
                  {bm.name} ({bm.annualRate}% p.a.)
                </option>
              ))}
            </select>
            <p class="text-[11px] font-mono text-body-muted">
              Note: Benchmark rates are illustrative assumptions for performance comparison, not guaranteed returns.
            </p>
          </div>
        </div>

        {/* Right Output Panel */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard metrics={dashboardMetrics} />

          <FinancialHealthGauge
            score={results.score}
            statusText={results.healthStatus}
            description={`Your investment grew at an annual rate of ${results.cagrPct}%, creating ${formatCurrency(results.absoluteGain)} in total capital wealth over ${tenureYears} years.`}
          />

          <ResultDonutChart title="Capital vs Growth Allocation" data={cagrDonutData} />
        </div>
      </div>

      {/* 4. BENCHMARK COMPARISON CARD */}
      <div class="space-y-4">
        <div>
          <h3 class="text-xl font-bold font-heading text-ink">Illustrative Benchmark Performance Analysis</h3>
          <p class="text-xs text-body-muted font-mono mt-0.5">Comparing your portfolio CAGR against benchmark rates</p>
        </div>

        <CostBreakdownCard title="Benchmark Comparison Breakdown" items={benchmarkItems} />
      </div>

      {/* 5. HYPOTHETICAL 4-SCENARIO SIMULATOR GRID */}
      <div class="space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">Hypothetical Growth Scenario Simulator</h3>
            <p class="text-xs text-body-muted font-mono mt-0.5">Evaluating duration extension and performance hike impacts</p>
          </div>
          <span class="text-xs font-mono text-body-muted">4 Hypothetical Models</span>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {results.scenarios.map((sc) => (
            <div key={sc.id} class="p-5 rounded-2xl bg-canvas border border-hairline space-y-3 shadow-soft hover:border-primary/50 transition-all">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold font-mono px-2 py-0.5 rounded bg-surface border border-hairline text-ink">{sc.badge}</span>
              </div>

              <div>
                <div class="text-xs text-body-muted font-mono">{sc.name}</div>
                <div class="text-lg font-extrabold font-heading text-ink">{formatCurrency(sc.finalValue)}</div>
              </div>

              <div class="space-y-1.5 text-[11px] font-mono pt-2 border-t border-hairline text-body-muted">
                <div class="flex justify-between"><span>CAGR:</span><span class="text-primary font-bold">{sc.cagrPct}%</span></div>
                <div class="flex justify-between"><span>Holding Period:</span><span class="text-ink font-bold">{sc.tenureYears} Yrs</span></div>
                <div class="flex justify-between"><span>Wealth Created:</span><span class="text-emerald-500 font-bold">{formatCurrency(sc.wealthCreated)}</span></div>
                {sc.id !== 'current' && (
                  <div class="flex justify-between font-bold pt-1 border-t border-hairline text-ink">
                    <span>Diff vs Base:</span>
                    <span class={sc.diffFromBase >= 0 ? 'text-semantic-success' : 'text-semantic-danger'}>
                      {sc.diffFromBase >= 0 ? `+${formatCurrency(sc.diffFromBase)}` : formatCurrency(sc.diffFromBase)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. DYNAMIC INSIGHT CARDS & RECOMMENDATIONS */}
      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <h4 class="text-lg font-bold font-heading text-ink">Dynamic CAGR Insights</h4>
          <div class="space-y-3">
            {results.dynamicInsights.map((ins, idx) => (
              <InsightCard key={idx} title={ins.title} metric={ins.value} description={ins.description} icon={ins.icon} />
            ))}
          </div>
        </div>

        <div class="space-y-4">
          <h4 class="text-lg font-bold font-heading text-ink">CAGR Analysis Best Practices</h4>
          <div class="space-y-3">
            <RecommendationCard
              title="CAGR Assumes Smooth Annual Growth"
              description="Remember that CAGR calculates a steady geometric mean. Actual stock and equity fund returns fluctuate significantly year-to-year."
              priority="high"
            />
            <RecommendationCard
              title="Use XIRR for Multiple Cash Flows"
              description="CAGR measures single point-to-point lump sums. If you made multiple SIP deposits or withdrawals, use XIRR / IRR metrics for accurate returns."
              priority="medium"
            />
            <RecommendationCard
              title="Always Factor Inflation into Real CAGR"
              description="A nominal CAGR of 8% in a 6% inflation environment yields a real purchasing power CAGR of only ~1.89% per year."
              priority="low"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
