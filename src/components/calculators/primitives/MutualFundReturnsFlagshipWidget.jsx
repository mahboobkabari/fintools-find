import { useState, useMemo } from 'preact/hooks';
import { calculateMutualFundReturns } from '../../../calculators/investment/mutual-fund-returns-calculator.js';
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

const DEFAULT_MF_STATE = {
  amount: 5000,
  expectedReturnRate: 12,
  tenureYears: 10,
  investmentType: 'sip',
  exitLoadPct: 0,
  inflationRate: 6,
};

const MF_PARAM_MAP = {
  amount: 'amt',
  expectedReturnRate: 'rate',
  tenureYears: 'yr',
  investmentType: 'type',
  exitLoadPct: 'el',
  inflationRate: 'inf',
};

export default function MutualFundReturnsFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_MF_STATE, MF_PARAM_MAP);
  const {
    amount,
    expectedReturnRate,
    tenureYears,
    investmentType,
    exitLoadPct,
    inflationRate,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  const isLumpsum = investmentType === 'lumpsum';

  // Smart Presets
  const presets = [
    { id: 'index_fund', label: 'Index Fund (Nifty 50)', icon: '📊', amount: isLumpsum ? 100000 : 5000, expectedReturnRate: 12, tenureYears: 10, desc: '12.0% p.a. • Broad Market Benchmark' },
    { id: 'large_cap', label: 'Large Cap Equity', icon: '🏢', amount: isLumpsum ? 100000 : 5000, expectedReturnRate: 13.5, tenureYears: 10, desc: '13.5% p.a. • Bluechip Enterprise Basket' },
    { id: 'flexi_cap', label: 'Flexi Cap Fund', icon: '⚡', amount: isLumpsum ? 100000 : 5000, expectedReturnRate: 14, tenureYears: 10, desc: '14.0% p.a. • Multi-Cap Diversified' },
    { id: 'hybrid', label: 'Conservative Hybrid', icon: '⚖️', amount: isLumpsum ? 100000 : 5000, expectedReturnRate: 9, tenureYears: 7, desc: '9.0% p.a. • Equity & Fixed Income' },
    { id: 'debt_fund', label: 'Debt Mutual Fund', icon: '🏛️', amount: isLumpsum ? 100000 : 5000, expectedReturnRate: 7, tenureYears: 5, desc: '7.0% p.a. • Fixed Income Stability' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('amount', p.amount);
    setParam('expectedReturnRate', p.expectedReturnRate);
    setParam('tenureYears', p.tenureYears);
  };

  // Run pure calculation engine
  const results = useMemo(() => {
    return calculateMutualFundReturns({
      amount,
      expectedReturnRate,
      tenureYears,
      investmentType,
      exitLoadPct,
      inflationRate,
    });
  }, [
    amount,
    expectedReturnRate,
    tenureYears,
    investmentType,
    exitLoadPct,
    inflationRate,
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

  // Dashboard Metrics items
  const dashboardMetrics = [
    { label: 'Net Maturity Corpus', value: formatCurrency(results.netMaturityValue), highlight: true, subtitle: `Post-Exit Load (${results.annualizedReturnPct}% ${results.annualizedReturnLabel})` },
    { label: 'Est. Net Profit', value: formatCurrency(results.netProfit), subtitle: 'Net wealth generated' },
    { label: 'Total Invested', value: formatCurrency(results.totalInvested), subtitle: isLumpsum ? 'One-time principal' : `${tenureYears * 12} monthly payments` },
    { label: results.annualizedReturnLabel, value: `${results.annualizedReturnPct}%`, subtitle: isLumpsum ? 'CAGR (Compounded)' : 'XIRR (Money-Weighted)' },
    { label: 'Absolute Return', value: `+${results.absoluteReturnPct}%`, subtitle: 'Total growth percentage' },
    { label: 'Real Purchasing Power', value: formatCurrency(results.realCorpus), subtitle: `After ~${inflationRate}% annual inflation` },
  ];

  // Donut Chart items for Invested vs Profit
  const donutData = [
    { name: 'Total Invested Capital', value: results.totalInvested, color: '#3b82f6' },
    { name: 'Est. Net Profit Created', value: results.netProfit, color: '#10b981' },
  ];

  if (results.exitLoadAmount > 0) {
    donutData.push({ name: 'Assumed Exit Load Deduction', value: results.exitLoadAmount, color: '#ef4444' });
  }

  // Cost Basis & Exit Load Breakdown Items
  const costBreakdownItems = [
    {
      label: '1. Total Invested Capital',
      amount: results.totalInvested,
      colorClass: 'bg-primary',
      desc: isLumpsum ? 'Initial lump-sum principal.' : `${tenureYears * 12} monthly contributions of ${formatCurrency(amount)}.`,
    },
    {
      label: '2. Gross Maturity Corpus (Before Exit Load)',
      amount: results.grossMaturityValue,
      colorClass: 'bg-accent-sky',
      desc: `Value accrued at ${expectedReturnRate}% p.a. expected return.`,
    },
    {
      label: '3. Assumed Exit Load Deduction',
      amount: results.exitLoadAmount,
      colorClass: exitLoadPct > 0 ? 'bg-semantic-danger' : 'bg-surface',
      desc: exitLoadPct > 0
        ? `Applied user-assumed ${exitLoadPct}% exit load penalty.`
        : '₹0 Exit Load (Assumed redeemed past exit-load window).',
    },
    {
      label: '4. Net Post-Exit Maturity Corpus',
      amount: results.netMaturityValue,
      colorClass: 'bg-emerald-500',
      desc: 'Net value after exit-load deduction.',
    },
    {
      label: '5. Est. Net Profit Created',
      amount: results.netProfit,
      colorClass: 'bg-emerald-400',
      desc: 'Net post-exit maturity value minus total invested capital.',
    },
    {
      label: `6. Inflation-Adjusted Real Corpus (~${inflationRate}% Inflation)`,
      amount: results.realCorpus,
      colorClass: 'bg-amber-500',
      desc: `Real purchasing power in today's Rupees over ${tenureYears} years.`,
    },
  ];

  return (
    <div class="space-y-10">
      {/* 1. Smart Presets Section */}
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-mono text-body font-semibold uppercase tracking-wider">
            Illustrative Mutual Fund Category Presets
          </span>
          <span class="text-[11px] font-mono text-body-muted bg-surface px-2 py-0.5 rounded border border-hairline">
            Illustrative Benchmark Assumptions
          </span>
        </div>
        <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Portfolio Preset" />
      </div>

      {/* 2. PROMINENT QUESTION BANNER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider">
            🚀 MUTUAL FUND RETURN VERDICT
          </span>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-body-muted">Mode: {isLumpsum ? 'One-Time Lumpsum' : 'Monthly SIP'}</span>
            <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${results.healthColor}`}>
              Compounding Score: {results.score}/100 ({results.healthStatus})
            </span>
          </div>
        </div>

        {/* UX PROMINENT QUESTIONS */}
        <div class="grid md:grid-cols-3 gap-4 pt-2">
          <div class="p-4 rounded-2xl bg-canvas border border-hairline space-y-1">
            <div class="text-xs font-mono text-body-muted uppercase font-bold">1. How much will my fund grow?</div>
            <div class="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
              {formatCurrency(results.netMaturityValue)}
            </div>
            <div class="text-[11px] text-body-muted font-mono">Net Maturity Corpus over {tenureYears} Years</div>
          </div>

          <div class="p-4 rounded-2xl bg-canvas border border-hairline space-y-1">
            <div class="text-xs font-mono text-body-muted uppercase font-bold">2. How much profit made?</div>
            <div class="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-500">
              {formatCurrency(results.netProfit)}
            </div>
            <div class="text-[11px] text-body-muted font-mono">{results.wealthMultiplier}x Wealth Multiplier (+{results.absoluteReturnPct}%)</div>
          </div>

          <div class="p-4 rounded-2xl bg-canvas border border-hairline space-y-1">
            <div class="text-xs font-mono text-body-muted uppercase font-bold">3. Annualized Return ({isLumpsum ? 'CAGR' : 'XIRR'})?</div>
            <div class="text-2xl sm:text-3xl font-extrabold font-heading text-ink">
              {results.annualizedReturnPct}%
            </div>
            <div class="text-[11px] text-body-muted font-mono">{isLumpsum ? 'Compounded Annual Growth Rate (CAGR)' : 'Money-Weighted Return (XIRR)'}</div>
          </div>
        </div>

        <p class="text-xs sm:text-sm text-body leading-relaxed pt-1">
          {results.healthDesc}
        </p>

        {/* TER Expense Ratio Notice */}
        <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-900 text-xs font-mono flex items-center gap-2">
          <span>ℹ️</span>
          <span>
            <strong>Expense Ratio Notice:</strong> Mutual fund NAVs published by AMCs in India are already <strong>NET of fund expenses (Total Expense Ratio)</strong>. Your return rate entered reflects net returns after expense ratio.
          </span>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Control Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <div>
              <h3 class="text-xl font-bold font-heading text-ink">Investment Parameters</h3>
              <p class="text-xs text-body-muted font-mono mt-0.5">Customize your SIP or Lumpsum contributions</p>
            </div>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          {/* Investment Mode Toggle */}
          <div class="space-y-2">
            <label class="block text-xs font-bold font-heading text-ink">Investment Mode</label>
            <div class="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-surface border border-hairline">
              <button
                type="button"
                onClick={() => setParam('investmentType', 'sip')}
                class={`p-3 rounded-xl font-mono text-xs font-bold transition-all ${
                  !isLumpsum
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-body hover:text-ink'
                }`}
              >
                🔄 Monthly SIP
              </button>
              <button
                type="button"
                onClick={() => setParam('investmentType', 'lumpsum')}
                class={`p-3 rounded-xl font-mono text-xs font-bold transition-all ${
                  isLumpsum
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-body hover:text-ink'
                }`}
              >
                💰 One-Time Lumpsum
              </button>
            </div>
          </div>

          <FormInputNumber
            id="amount-input"
            label={isLumpsum ? 'One-Time Lumpsum Principal (₹)' : 'Monthly SIP Contribution (₹)'}
            value={amount}
            min={500}
            max={isLumpsum ? 10000000 : 500000}
            step={500}
            prefix="₹"
            minLabel="₹500"
            maxLabel={isLumpsum ? '₹1Cr' : '₹5L/mo'}
            onChange={(v) => setParam('amount', v)}
          />

          <FormInputNumber
            id="expected-return-rate-input"
            label="Expected Annual Return Rate (% p.a.)"
            value={expectedReturnRate}
            min={1}
            max={30}
            step={0.5}
            prefix="%"
            minLabel="1%"
            maxLabel="30%"
            onChange={(v) => setParam('expectedReturnRate', v)}
          />

          <FormInputNumber
            id="tenure-years-input"
            label="Holding Duration (Years)"
            value={tenureYears}
            min={1}
            max={40}
            step={1}
            prefix=""
            minLabel="1 Year"
            maxLabel="40 Years"
            onChange={(v) => setParam('tenureYears', v)}
          />

          <FormInputNumber
            id="exit-load-input"
            label="Assumed Exit Load (%)"
            value={exitLoadPct}
            min={0}
            max={5}
            step={0.25}
            prefix="%"
            minLabel="0% (Standard)"
            maxLabel="5%"
            onChange={(v) => setParam('exitLoadPct', v)}
          />

          <FormInputNumber
            id="inflation-rate-input"
            label="Expected Inflation Rate (% p.a.)"
            value={inflationRate}
            min={0}
            max={12}
            step={0.5}
            prefix="%"
            minLabel="0%"
            maxLabel="12%"
            onChange={(v) => setParam('inflationRate', v)}
          />
        </div>

        {/* Right Output Panel */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard metrics={dashboardMetrics} />

          <FinancialHealthGauge
            score={results.score}
            statusText={results.healthStatus}
            description={`Your investment of ${formatCurrency(results.totalInvested)} yields an estimated net maturity corpus of ${formatCurrency(results.netMaturityValue)} (${results.annualizedReturnPct}% ${results.annualizedReturnLabel}).`}
          />

          <ResultDonutChart title="Invested Capital vs Net Profit" data={donutData} />
        </div>
      </div>

      {/* 4. COST BASIS & EXIT LOAD BREAKDOWN CARD */}
      <div class="space-y-4">
        <div>
          <h3 class="text-xl font-bold font-heading text-ink">Corpus Growth & Exit Load Breakdown</h3>
          <p class="text-xs text-body-muted font-mono mt-0.5">Step-by-step maturity corpus progression</p>
        </div>

        <CostBreakdownCard title="Maturity Corpus & Inflation Adjustments" items={costBreakdownItems} />
      </div>

      {/* 5. ILLUSTRATIVE BENCHMARK COMPARISON MATRIX */}
      <div class="space-y-4">
        <div>
          <h3 class="text-xl font-bold font-heading text-ink">Benchmark Performance Comparisons</h3>
          <p class="text-xs text-body-muted font-mono mt-0.5">Neutral comparison against illustrative benchmark assumptions (Not guaranteed returns)</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {results.benchmarkComparisons.map((bench) => (
            <div key={bench.id} class="p-4 rounded-2xl bg-canvas border border-hairline space-y-2 shadow-soft">
              <div class="text-xs font-bold font-heading text-ink">{bench.name}</div>
              <div class="flex items-baseline justify-between">
                <span class="text-xs font-mono text-body-muted">Benchmark Rate:</span>
                <span class="text-sm font-extrabold font-mono text-ink">{bench.benchmarkRate}% p.a.</span>
              </div>
              <div class="text-[11px] text-body leading-relaxed font-mono pt-1 border-t border-hairline">
                {bench.description}
              </div>
              <div class="text-[10px] text-body-muted font-mono italic">
                {bench.disclaimer}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. HYPOTHETICAL 5-SCENARIO SIMULATOR GRID */}
      <div class="space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">Returns Sensitivity Simulator</h3>
            <p class="text-xs text-body-muted font-mono mt-0.5">Evaluating return rate fluctuations, longer tenures, and Direct Plan TER savings</p>
          </div>
          <span class="text-xs font-mono text-body-muted">5 Sensitivity Models</span>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {results.scenarios.map((sc) => (
            <div key={sc.id} class="p-4 rounded-2xl bg-canvas border border-hairline space-y-2.5 shadow-soft hover:border-primary/50 transition-all">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-surface border border-hairline text-ink">{sc.badge}</span>
              </div>

              <div>
                <div class="text-[11px] text-body-muted font-mono truncate">{sc.name}</div>
                <div class="text-base font-extrabold font-heading text-ink">{sc.expectedReturnRate}% p.a.</div>
              </div>

              <div class="space-y-1 text-[10px] font-mono pt-1.5 border-t border-hairline text-body-muted">
                <div class="flex justify-between"><span>Net Corpus:</span><span class="text-emerald-500 font-bold">{formatCurrency(sc.netMaturityValue)}</span></div>
                <div class="flex justify-between"><span>Net Profit:</span><span class="text-ink font-bold">{formatCurrency(sc.netProfit)}</span></div>
                {sc.id !== 'current' && (
                  <div class="flex justify-between font-bold pt-1 border-t border-hairline text-ink">
                    <span>Gain Diff:</span>
                    <span class={sc.diffFromBase >= 0 ? 'text-emerald-500' : 'text-semantic-danger'}>
                      {sc.diffFromBase >= 0 ? `+${formatCurrency(sc.diffFromBase)}` : formatCurrency(sc.diffFromBase)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. DYNAMIC INSIGHT CARDS & TAX DECOUPLING LINK */}
      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <h4 class="text-lg font-bold font-heading text-ink">Dynamic Portfolio Insights</h4>
          <div class="space-y-3">
            {results.dynamicInsights.map((ins, idx) => (
              <InsightCard key={idx} title={ins.title} metric={ins.value} description={ins.description} icon={ins.icon} />
            ))}
          </div>
        </div>

        <div class="space-y-4">
          <h4 class="text-lg font-bold font-heading text-ink">Capital Gains Tax Link & Tips</h4>
          <div class="space-y-3">
            <div class="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div class="flex items-center gap-2 font-bold font-heading text-amber-900 text-sm">
                <span>⚖️</span>
                <span>Tax Decoupling Notice</span>
              </div>
              <p class="text-xs text-body leading-relaxed font-mono">
                Returns shown above are <strong>pre-tax</strong>. Capital gains tax (STCG 20% or LTCG 12.5% above ₹1.25L) applies upon mutual fund unit redemption.
              </p>
              <a
                href="/tools/tax/capital-gains-tax-calculator/"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-mono text-xs font-bold hover:bg-primary/90 transition-all mt-1"
              >
                Calculate Capital Gains Tax →
              </a>
            </div>

            <RecommendationCard
              title="Choose Direct Growth Plans"
              description="Direct Growth plans eliminate distributor commissions, saving ~0.75% in annual TER and adding lakhs to your long-term compounding corpus."
              priority="high"
            />
            <RecommendationCard
              title="Maintain a 7 to 10 Year Horizon"
              description="Staying invested across market cycles helps absorb short-term volatility and capture the full power of compound growth."
              priority="medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
