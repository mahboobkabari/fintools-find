import { useState, useMemo } from 'preact/hooks';
import { calculateLumpsumTool } from '../../../calculators/investment/lumpsum-calculator.js';
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
import FormSelect from './FormSelect';
import AmortizationTable from './AmortizationTable';

const DEFAULT_LUMPSUM_STATE = {
  initialInvestment: 100000,
  expectedReturnRate: 12,
  tenureYears: 10,
  compoundingFrequency: 'annually',
  inflationRate: 6,
};

const LUMPSUM_PARAM_MAP = {
  initialInvestment: 'amt',
  expectedReturnRate: 'rate',
  tenureYears: 'yr',
  compoundingFrequency: 'freq',
  inflationRate: 'inf',
};

export default function LumpsumFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_LUMPSUM_STATE, LUMPSUM_PARAM_MAP);
  const { initialInvestment, expectedReturnRate, tenureYears, compoundingFrequency, inflationRate } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Investment Profile Presets
  const presets = [
    { id: 'fd', label: 'FD Alternative', icon: '🏛️', initialInvestment: 100000, expectedReturnRate: 7.5, tenureYears: 5, desc: '₹1L Fixed Deposit' },
    { id: 'index', label: 'Index Mutual Fund', icon: '📈', initialInvestment: 200000, expectedReturnRate: 12.0, tenureYears: 10, desc: '₹2L Nifty 50 Fund' },
    { id: 'multiasset', label: 'Multi-Asset Growth', icon: '🚀', initialInvestment: 500000, expectedReturnRate: 15.0, tenureYears: 15, desc: '₹5L Growth Portfolio' },
    { id: 'retirement', label: 'Retirement Corpus', icon: '🌴', initialInvestment: 1000000, expectedReturnRate: 12.0, tenureYears: 20, desc: '₹10L Long-Term Wealth' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('initialInvestment', p.initialInvestment);
    setParam('expectedReturnRate', p.expectedReturnRate);
    setParam('tenureYears', p.tenureYears);
  };

  // Perform calculation
  const results = useMemo(() => {
    return calculateLumpsumTool({
      initialInvestment,
      expectedReturnRate,
      tenureYears,
      compoundingFrequency,
      inflationRate,
    });
  }, [initialInvestment, expectedReturnRate, tenureYears, compoundingFrequency, inflationRate]);

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

  // Cost breakdown items for Inflation & Real Purchasing Power
  const inflationItems = [
    { label: 'Nominal Future Value', amount: results.maturityValue, colorClass: 'bg-primary', desc: 'Future value before inflation.' },
    { label: 'Real Purchasing Power Value', amount: results.inflationAdjustedValue, colorClass: 'bg-emerald-500', desc: `Real value adjusted for ${inflationRate}% inflation.` },
    { label: 'Purchasing Power Erosion', amount: results.purchasingPowerLoss, colorClass: 'bg-semantic-warning', desc: 'Value lost to cost-of-living increases.' },
  ];

  return (
    <div class="space-y-10">
      {/* 1. Presets */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Investment Profile Preset" />

      {/* 2. HERO DECISION BANNER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-emerald-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            🏆 OPTIMAL WEALTH CREATION VERDICT
          </span>
          <span class={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline ${results.healthColor}`}>
            Health Score: {results.healthScore}/100 ({results.healthStatus})
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          {results.healthDesc}
        </p>
      </div>

      {/* 3. Interactive Calculator Workspace */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Investment Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="initial-investment"
            label="Initial Investment Amount (₹)"
            value={initialInvestment}
            min={5000}
            max={10000000}
            step={5000}
            prefix="₹"
            minLabel="₹5,000"
            maxLabel="₹1 Crore"
            onChange={(v) => setParam('initialInvestment', v)}
          />

          <FormInputNumber
            id="expected-return-rate"
            label="Expected Annual Return Rate (% p.a.)"
            value={expectedReturnRate}
            min={1.0}
            max={30.0}
            step={0.5}
            suffix="%"
            minLabel="1%"
            maxLabel="30%"
            onChange={(v) => setParam('expectedReturnRate', v)}
          />

          <FormInputNumber
            id="tenure-years"
            label="Investment Duration (Years)"
            value={tenureYears}
            min={1}
            max={40}
            step={1}
            suffix=" Years"
            minLabel="1 Yr"
            maxLabel="40 Yrs"
            onChange={(v) => setParam('tenureYears', v)}
          />

          <FormSelect
            id="compounding-frequency"
            label="Compounding Frequency"
            value={compoundingFrequency}
            options={[
              { value: 'annually', label: 'Compounded Annually' },
              { value: 'semi-annually', label: 'Compounded Semi-Annually' },
              { value: 'quarterly', label: 'Compounded Quarterly' },
              { value: 'monthly', label: 'Compounded Monthly' },
            ]}
            onChange={(v) => setParam('compoundingFrequency', v)}
          />

          <FormInputNumber
            id="inflation-rate"
            label="Expected Inflation Rate (%)"
            value={inflationRate}
            min={0.0}
            max={15.0}
            step={0.5}
            suffix="%"
            minLabel="0%"
            maxLabel="15%"
            onChange={(v) => setParam('inflationRate', v)}
          />
        </div>

        {/* Right Panel: Output Dashboard & Charts */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Future Wealth Value"
            primaryValue={formatCurrency(results.maturityValue)}
            secondaryItems={[
              { label: 'Initial Capital Invested', value: formatCurrency(results.totalInvested) },
              { label: 'Estimated Wealth Gain', value: formatCurrency(results.estReturns) },
              { label: 'Wealth Multiplier', value: `${results.wealthMultiplier}x` },
              { label: 'Real Value (Inflation Adjusted)', value: formatCurrency(results.inflationAdjustedValue) },
            ]}
          />

          <ResultDonutChart
            title="Capital Invested vs Wealth Growth"
            centerValue={formatCurrency(results.maturityValue)}
            centerSubtext="Future Value"
            segments={[
              { label: 'Initial Capital Invested', amount: results.totalInvested, colorClass: 'bg-primary' },
              { label: 'Estimated Wealth Gain', amount: results.estReturns, colorClass: 'bg-emerald-500' },
            ]}
          />

          <FinancialHealthGauge
            title="Investment Health Score"
            score={results.healthScore}
            statusLabel={results.healthStatus}
            description={results.healthDesc}
          />
        </div>
      </div>

      {/* 4. REAL GROWTH VISUAL ("Every ₹100 becomes ₹X") */}
      <div class="p-6 sm:p-8 rounded-3xl bg-surface-strong border border-hairline space-y-4 shadow-soft">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">Human-Friendly Capital Growth</span>
            <h4 class="text-lg font-bold font-heading text-ink">Real Growth Per ₹100 Invested</h4>
          </div>
          <span class="text-2xl font-bold font-mono text-emerald-600">₹{results.repayPer100}</span>
        </div>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Every <strong>₹100</strong> invested today grows to approximately <strong>₹{results.repayPer100}</strong> over {tenureYears} years at {expectedReturnRate}% p.a.
        </p>
      </div>

      {/* 5. RETURN SENSITIVITY SCENARIO COMPARISON */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between">
          <h4 class="text-base font-bold font-heading text-ink">Market Return Sensitivity Analysis</h4>
          <span class="text-xs text-muted">+-2% Scenario Range</span>
        </div>
        <div class="grid sm:grid-cols-3 gap-4">
          <div class="p-4 bg-surface-strong border border-hairline rounded-2xl space-y-1 text-center">
            <span class="text-xs text-muted font-bold block uppercase">Conservative ({results.scenarios.conservative.rate}%)</span>
            <span class="text-lg font-bold text-ink">{formatCurrency(results.scenarios.conservative.futureValue)}</span>
            <span class="text-[11px] text-muted block">{formatCurrency(results.scenarios.conservative.diffFromExpected)} vs Expected</span>
          </div>

          <div class="p-4 bg-primary/10 border-2 border-primary/40 rounded-2xl space-y-1 text-center">
            <span class="text-xs text-primary font-bold block uppercase">Expected ({results.scenarios.expected.rate}%)</span>
            <span class="text-lg font-bold text-primary">{formatCurrency(results.scenarios.expected.futureValue)}</span>
            <span class="text-[11px] text-primary block font-bold">Base Benchmark</span>
          </div>

          <div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-1 text-center">
            <span class="text-xs text-semantic-success font-bold block uppercase">Optimistic ({results.scenarios.optimistic.rate}%)</span>
            <span class="text-lg font-bold text-semantic-success">{formatCurrency(results.scenarios.optimistic.futureValue)}</span>
            <span class="text-[11px] text-semantic-success block font-bold">+{formatCurrency(results.scenarios.optimistic.diffFromExpected)} Gain</span>
          </div>
        </div>
      </div>

      {/* 6. DELAY INVESTMENT SIMULATOR ("Cost of Waiting 5 Years") */}
      <div class="p-6 sm:p-8 rounded-3xl bg-rose-500/5 border border-rose-500/20 space-y-4 shadow-soft">
        <div class="flex items-center gap-2 text-semantic-danger font-bold font-heading text-lg">
          <span>⏳</span>
          <h3>Delay Investment Simulator: "Cost of Waiting 5 Years"</h3>
        </div>
        <div class="grid sm:grid-cols-3 gap-4 font-mono text-center">
          <div class="p-4 bg-canvas rounded-2xl border border-hairline space-y-1">
            <span class="text-xs text-muted font-bold block uppercase">Invest Today ({tenureYears} Yrs)</span>
            <span class="text-lg font-bold text-semantic-success">{formatCurrency(results.delayCost.todayValue)}</span>
          </div>
          <div class="p-4 bg-canvas rounded-2xl border border-hairline space-y-1">
            <span class="text-xs text-muted font-bold block uppercase">Delay 5 Years ({Math.max(1, tenureYears - 5)} Yrs)</span>
            <span class="text-lg font-bold text-ink">{formatCurrency(results.delayCost.delayedValue)}</span>
          </div>
          <div class="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/30 space-y-1">
            <span class="text-xs text-semantic-danger font-bold block uppercase">Opportunity Wealth Lost</span>
            <span class="text-lg font-bold text-semantic-danger">- {formatCurrency(results.delayCost.wealthCostOfWaiting)}</span>
          </div>
        </div>
      </div>

      {/* 7. INFLATION & PURCHASING POWER BREAKDOWN */}
      <CostBreakdownCard
        title="Inflation & Real Purchasing Power Breakdown"
        subtitle={`Real purchasing power value: ${formatCurrency(results.inflationAdjustedValue)}`}
        items={inflationItems}
      />

      {/* 8. SMART RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 9. KEY FINANCIAL INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Wealth Multiplier"
          value={`${results.wealthMultiplier}x`}
          subtitle={`Your capital grows ${results.wealthMultiplier} times.`}
          badgeText="Capital Multiplier"
          badgeColorClass="bg-primary"
        />
        <InsightCard
          title="Real Annual Return"
          value={`+${results.realReturn}%`}
          subtitle={`Net annual return after subtracting ${inflationRate}% inflation.`}
          badgeText="After Inflation"
          badgeColorClass="bg-emerald-500"
        />
      </div>

      {/* 10. DECISION SUMMARY CARD (SCREENSHOT FRIENDLY) */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 LUMPSUM WEALTH DECISION SUMMARY</span>
          <span class="text-xs text-muted font-mono">{tenureYears} Year Plan</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Initial Capital</span>
            <span class="text-base font-bold text-ink">{formatCurrency(results.initialInvestment)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Future Value</span>
            <span class="text-base font-bold text-semantic-success">{formatCurrency(results.maturityValue)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Multiplier</span>
            <span class="text-base font-bold text-primary">{results.wealthMultiplier}x</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Health Score</span>
            <span class={`text-base font-bold ${results.healthColor}`}>{results.healthScore}/100</span>
          </div>
        </div>
      </div>

      {/* 11. YEARLY GROWTH SCHEDULE TABLE */}
      <AmortizationTable schedule={results.yearlyBreakdown} />
    </div>
  );
}
