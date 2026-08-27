import { useState, useMemo } from 'preact/hooks';
import {
  calculatePurchasingPower,
  CURRENCY_METADATA,
} from '../../../calculators/currency/purchasing-power-calculator.js';
import { PURCHASING_POWER_CONFIG } from '../../../calculators/configs/purchasing-power-calculator.config.js';
import { useUrlSync } from '../../hooks/useUrlSync.js';

// Reusable Shared UI Components
import ScenarioPresetCards from '../../ui/ScenarioPresetCards';
import ResultDashboard from '../../ui/ResultDashboard';
import CostBreakdownCard from '../../ui/CostBreakdownCard';
import RecommendationCard from '../../ui/RecommendationCard';
import InsightCard from '../../ui/InsightCard';
import ShareActions from '../../ui/ShareActions';
import FormInputNumber from './FormInputNumber';

const DEFAULT_PURCHASING_POWER_STATE = {
  amount: 100000,
  inflationRate: 6.0,
  tenureYears: 10,
  incomeGrowthRate: 0,
  currency: 'INR',
};

const PURCHASING_POWER_PARAM_MAP = {
  amount: 'amt',
  inflationRate: 'inf',
  tenureYears: 'yrs',
  incomeGrowthRate: 'wage',
  currency: 'curr',
};

export default function PurchasingPowerFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(
    DEFAULT_PURCHASING_POWER_STATE,
    PURCHASING_POWER_PARAM_MAP
  );

  const {
    amount,
    inflationRate,
    tenureYears,
    incomeGrowthRate,
    currency,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showAdvancedWage, setShowAdvancedWage] = useState(Boolean(incomeGrowthRate > 0));

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('amount', p.amount);
    setParam('inflationRate', p.inflationRate);
    setParam('tenureYears', p.tenureYears);
    setParam('incomeGrowthRate', p.incomeGrowthRate || 0);
    setParam('currency', p.currency || 'INR');
    if (p.incomeGrowthRate > 0) {
      setShowAdvancedWage(true);
    }
  };

  const results = useMemo(() => {
    return calculatePurchasingPower({
      amount,
      inflationRate,
      tenureYears,
      incomeGrowthRate,
      currency,
    });
  }, [
    amount,
    inflationRate,
    tenureYears,
    incomeGrowthRate,
    currency,
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
    setShowAdvancedWage(false);
    resetUrlState();
  };

  const sym = results.currencyMeta.symbol;

  const breakdownItems = [
    {
      label: 'Retained Real Purchasing Power',
      amount: results.futureRealValue,
      colorClass: 'bg-primary',
      desc: `Real purchasing power in Year ${results.tenureYears} (${sym}${Math.round(results.futureRealValue).toLocaleString()})`,
    },
    {
      label: 'Purchasing Power Lost to Inflation',
      amount: results.purchasingPowerLossAmount,
      colorClass: 'bg-rose-500',
      desc: `${results.purchasingPowerLossPct}% decay over ${results.tenureYears} years (${sym}${Math.round(results.purchasingPowerLossAmount).toLocaleString()})`,
    },
  ];

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards
        presets={PURCHASING_POWER_CONFIG.presets}
        activePreset={activePreset}
        onSelect={applyPreset}
        label="Popular Purchasing Power Scenarios"
      />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-amber-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            📉 REAL PURCHASING POWER VALUATION
          </span>
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-hairline uppercase text-primary bg-surface-strong">
            {results.metadata.baselineDate} · INSTITUTIONAL BENCHMARK
          </span>
        </div>

        <h2 class="text-2xl sm:text-4xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Due to compound price inflation of <strong>{results.inflationRate}% p.a.</strong>, your money loses <strong>{results.purchasingPowerLossPct}%</strong> of its buying capacity. You will need <strong>{sym}{Math.round(results.equivalentFutureCost).toLocaleString()}</strong> in {results.tenureYears} years to buy what {sym}{results.amount.toLocaleString()} buys today.
        </p>

        <div class="pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Today's Cash Value</span>
            <span class="text-sm font-bold text-ink">{sym}{results.amount.toLocaleString()}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Future Real Power</span>
            <span class="text-sm font-bold text-primary">{sym}{Math.round(results.futureRealValue).toLocaleString()}</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Purchasing Loss</span>
            <span class="text-sm font-bold text-rose-600">−{results.purchasingPowerLossPct}%</span>
          </div>
          <div class="p-2 bg-canvas rounded-xl border border-hairline">
            <span class="text-[10px] text-muted block uppercase font-bold">Halving Horizon</span>
            <span class="text-sm font-bold text-amber-600">{results.halvingYears ? `${results.halvingYears} Yrs` : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Inflation &amp; Cash Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <div class="space-y-4">
            {/* Amount Input */}
            <FormInputNumber
              id="amount-in"
              label="Starting Sum / Annual Income"
              value={amount}
              min={1000}
              max={100000000}
              step={5000}
              prefix={sym}
              onChange={(v) => setParam('amount', v)}
            />

            {/* Inflation Rate Input */}
            <FormInputNumber
              id="inflation-in"
              label="Expected Annual Inflation Rate"
              value={inflationRate}
              min={0}
              max={25}
              step={0.1}
              suffix="% p.a."
              onChange={(v) => setParam('inflationRate', v)}
            />

            {/* Time Horizon Input */}
            <FormInputNumber
              id="tenure-in"
              label="Time Horizon (Years)"
              value={tenureYears}
              min={1}
              max={50}
              step={1}
              suffix="Years"
              onChange={(v) => setParam('tenureYears', v)}
            />

            {/* Currency Selector */}
            <div class="space-y-1.5 pt-2">
              <label for="currency-select" class="text-xs font-mono font-bold text-muted uppercase tracking-wider block">
                Currency Display
              </label>
              <div class="relative">
                <select
                  id="currency-select"
                  value={currency}
                  onChange={(e) => setParam('currency', e.target.value)}
                  class="w-full p-3 bg-surface-strong border border-hairline rounded-2xl font-mono text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                >
                  {Object.keys(CURRENCY_METADATA).map((code) => {
                    const c = CURRENCY_METADATA[code];
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

            {/* Optional Wage / Income Growth Toggle */}
            <div class="pt-3 border-t border-hairline">
              <button
                type="button"
                onClick={() => setShowAdvancedWage(!showAdvancedWage)}
                class="text-xs font-mono text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{showAdvancedWage ? '− Hide Salary / Wage Growth Modeling' : '+ Include Annual Salary / Wage Growth Hike'}</span>
              </button>

              {showAdvancedWage && (
                <div class="pt-4 space-y-2">
                  <FormInputNumber
                    id="income-growth-in"
                    label="Annual Salary / Income Hike"
                    value={incomeGrowthRate}
                    min={0}
                    max={30}
                    step={0.5}
                    suffix="% p.a."
                    onChange={(v) => setParam('incomeGrowthRate', v)}
                  />
                  <p class="text-[11px] text-muted">
                    If your salary increases by {incomeGrowthRate}% p.a. while inflation is {inflationRate}%, your net real purchasing power changes by {results.realIncomeGrowthRate > 0 ? `+${results.realIncomeGrowthRate}%` : `${results.realIncomeGrowthRate}%`}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: KPI Dashboard & Breakdown */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel={`Future Real Purchasing Power (Yr ${results.tenureYears})`}
            primaryValue={`${sym}${Math.round(results.futureRealValue).toLocaleString()}`}
            secondaryItems={[
              { label: 'Purchasing Power Loss', value: `−${results.purchasingPowerLossPct}% (${sym}${Math.round(results.purchasingPowerLossAmount).toLocaleString()})` },
              { label: 'Future Equivalent Cost', value: `${sym}${Math.round(results.equivalentFutureCost).toLocaleString()}` },
              { label: 'Halving Period (50% Lost)', value: results.halvingYears ? `${results.halvingYears} Years` : 'N/A' },
              { label: 'Quartering Period (75% Lost)', value: results.quarteringYears ? `${results.quarteringYears} Years` : 'N/A' },
            ]}
          />

          <CostBreakdownCard
            title="Real Value Retained vs. Cumulative Purchasing Loss"
            subtitle={`At ${results.inflationRate}% annual inflation over ${results.tenureYears} years, cumulative inflation reaches ${results.cumulativeInflationPct}%.`}
            items={breakdownItems}
          />

          {/* Wage Growth Metric Card (if active) */}
          {incomeGrowthRate > 0 && (
            <div class="p-6 bg-surface-soft border border-hairline rounded-3xl space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold uppercase text-primary tracking-wider">
                  Real Wage Compounding Verdict
                </span>
                <span class={`text-xs font-mono font-bold px-2 py-0.5 rounded-pill ${results.isBeatingInflation ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {results.isBeatingInflation ? 'BEATING INFLATION' : 'REAL WAGE DRAG'}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-3 text-center font-mono">
                <div class="p-3 bg-canvas rounded-2xl border border-hairline">
                  <span class="text-[10px] text-muted block uppercase font-bold">Nominal Future Salary</span>
                  <span class="text-sm font-bold text-ink">{sym}{Math.round(results.nominalFutureIncome).toLocaleString()}</span>
                  <span class="text-[10px] text-muted block mt-0.5">+{incomeGrowthRate}% Annual Hike</span>
                </div>
                <div class="p-3 bg-canvas rounded-2xl border border-hairline">
                  <span class="text-[10px] text-muted block uppercase font-bold">Real Discounted Salary</span>
                  <span class={`text-sm font-bold ${results.isBeatingInflation ? 'text-semantic-success' : 'text-rose-600'}`}>
                    {sym}{Math.round(results.futureRealIncome).toLocaleString()}
                  </span>
                  <span class="text-[10px] text-muted block mt-0.5">Net Real {results.realIncomeGrowthRate > 0 ? `+${results.realIncomeGrowthRate}%` : `${results.realIncomeGrowthRate}%`} p.a.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. MULTI-YEAR DEGRADATION SCHEDULE MATRIX */}
      <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">
              Year-by-Year Purchasing Power Degradation Schedule
            </h3>
            <p class="text-xs text-muted mt-0.5">
              Trajectory of real cash value erosion and required future lifestyle expense
            </p>
          </div>
          <span class="text-xs font-mono font-bold text-primary bg-surface-strong px-3 py-1 rounded-pill border border-hairline">
            TIMELINE MATRIX
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr class="border-b border-hairline bg-surface-soft text-muted uppercase">
                <th class="py-2.5 px-3">Year</th>
                <th class="py-2.5 px-3">Real Purchasing Power</th>
                <th class="py-2.5 px-3">Cumulative Lost</th>
                <th class="py-2.5 px-3">Loss %</th>
                <th class="py-2.5 px-3">Future Equivalent Cost</th>
                {incomeGrowthRate > 0 && <th class="py-2.5 px-3">Real Salary Value</th>}
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              {results.yearlySchedule.map((row) => (
                <tr key={row.year} class="hover:bg-surface-soft/50 transition-colors">
                  <td class="py-2 px-3 font-bold text-ink">Year {row.year}</td>
                  <td class="py-2 px-3 text-primary font-bold">{sym}{Math.round(row.realPurchasingPower).toLocaleString()}</td>
                  <td class="py-2 px-3 text-rose-600 font-medium">−{sym}{Math.round(row.lossAmount).toLocaleString()}</td>
                  <td class="py-2 px-3 text-rose-600 font-bold">−{row.lossPercent}%</td>
                  <td class="py-2 px-3 text-ink font-semibold">{sym}{Math.round(row.equivalentFutureCost).toLocaleString()}</td>
                  {incomeGrowthRate > 0 && (
                    <td class={`py-2 px-3 font-bold ${row.realIncome >= results.amount ? 'text-semantic-success' : 'text-rose-600'}`}>
                      {sym}{Math.round(row.realIncome).toLocaleString()}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ACTIONABLE RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 6. KEY INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="The Rule of 72 Inflation Shortcut"
          value={results.halvingYears ? `${results.halvingYears} Years` : '12 Years'}
          subtitle={`Divide 72 by ${results.inflationRate}% inflation to quickly find when your cash loses exactly 50% of its buying power.`}
          badgeText="Financial Heuristic"
          badgeColorClass="bg-primary"
        />
        <InsightCard
          title="Asset Allocation Defense"
          value="Equity & Real Estate"
          subtitle="Cash and savings accounts deliver negative real returns under inflation; diversified equities and tangible real estate hedge purchasing power."
          badgeText="Wealth Preservation"
          badgeColorClass="bg-emerald-500"
        />
      </div>

      {/* 7. EXECUTIVE VOUCHER */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 PURCHASING POWER AUDIT VOUCHER</span>
          <span class="text-xs text-muted font-mono">{results.tenureYears} YR HORIZON @ {results.inflationRate}% INFLATION</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Starting Cash</span>
            <span class="text-base font-bold text-ink">{sym}{results.amount.toLocaleString()}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Real Value Retained</span>
            <span class="text-base font-bold text-primary">{sym}{Math.round(results.futureRealValue).toLocaleString()}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Purchasing Loss</span>
            <span class="text-base font-bold text-rose-600">−{results.purchasingPowerLossPct}%</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Future Cost Equivalent</span>
            <span class="text-base font-bold text-semantic-success">{sym}{Math.round(results.equivalentFutureCost).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
