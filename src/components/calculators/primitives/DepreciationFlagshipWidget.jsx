import { useState, useMemo } from 'preact/hooks';
import { calculateDepreciationCalculator } from '../../../calculators/business/depreciation-calculator.js';
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
import FormSelect from './FormSelect';

const DEFAULT_DEPRECIATION_STATE = {
  assetCost: 500000,
  salvageValue: 50000,
  usefulLife: 5,
  method: 'slm',
  taxRate: 25,
  totalUnits: 100000,
  firstYearUnits: 25000,
  currencySymbol: '₹',
};

const DEPRECIATION_PARAM_MAP = {
  assetCost: 'cost',
  salvageValue: 'salvage',
  usefulLife: 'life',
  method: 'm',
  taxRate: 'tax',
  totalUnits: 'tu',
  firstYearUnits: 'y1u',
  currencySymbol: 'cur',
};

export default function DepreciationFlagshipWidget() {
  const [params, setParam, resetUrlState] = useUrlSync(DEFAULT_DEPRECIATION_STATE, DEPRECIATION_PARAM_MAP);
  const {
    assetCost,
    salvageValue,
    usefulLife,
    method,
    taxRate,
    totalUnits,
    firstYearUnits,
    currencySymbol,
  } = params;

  const [activePreset, setActivePreset] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Asset Presets
  const presets = [
    { id: 'vehicle', label: 'Commercial Van (6 Yrs)', icon: '🚐', assetCost: 1200000, salvageValue: 60000, usefulLife: 6, method: 'slm', taxRate: 25, currencySymbol: '₹', desc: 'SLM 6 Years' },
    { id: 'machinery', label: 'Factory CNC (15 Yrs)', icon: '⚙️', assetCost: 5000000, salvageValue: 250000, usefulLife: 15, method: 'wdv', taxRate: 30, currencySymbol: '₹', desc: 'WDV 15 Years' },
    { id: 'servers', label: 'IT Servers (3 Yrs)', icon: '🖥️', assetCost: 1500000, salvageValue: 30000, usefulLife: 3, method: 'ddb', taxRate: 25, currencySymbol: '₹', desc: 'DDB 3 Years' },
    { id: 'furniture', label: 'Office Fitout (10 Yrs)', icon: '🪑', assetCost: 800000, salvageValue: 40000, usefulLife: 10, method: 'slm', taxRate: 25, currencySymbol: '₹', desc: 'SLM 10 Years' },
    { id: 'warehouse', label: 'Warehouse (30 Yrs)', icon: '🏭', assetCost: 20000000, salvageValue: 2000000, usefulLife: 30, method: 'slm', taxRate: 25, currencySymbol: '₹', desc: 'SLM 30 Years' },
  ];

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setParam('assetCost', p.assetCost);
    setParam('salvageValue', p.salvageValue);
    setParam('usefulLife', p.usefulLife);
    setParam('method', p.method);
    setParam('taxRate', p.taxRate);
    setParam('currencySymbol', p.currencySymbol);
  };

  // Perform calculation
  const results = useMemo(() => {
    return calculateDepreciationCalculator({
      assetCost,
      salvageValue,
      usefulLife,
      method,
      taxRate,
      totalUnits,
      firstYearUnits,
      currencySymbol,
    });
  }, [assetCost, salvageValue, usefulLife, method, taxRate, totalUnits, firstYearUnits, currencySymbol]);

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
  const costItems = [
    { label: 'Total Depreciable Base', amount: results.depreciableAmount, colorClass: 'bg-primary', desc: 'Asset cost written off over useful lifespan.' },
    { label: 'Estimated Residual Scrap Value', amount: results.salvageValue, colorClass: 'bg-amber-500', desc: 'Un-depreciated terminal salvage realization value.' },
  ];

  return (
    <div class="space-y-10">
      {/* 1. PRESETS */}
      <ScenarioPresetCards presets={presets} activePreset={activePreset} onSelect={applyPreset} label="Select Asset Class Preset" />

      {/* 2. HERO DECISION VERDICT */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-canvas to-amber-500/10 border-2 border-primary/40 shadow-soft space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary text-white font-mono text-xs font-bold uppercase">
            📊 CAPITAL DEPRECIATION DECISION VERDICT
          </span>
          <span class="text-xs font-mono font-bold text-ink bg-surface-strong px-2.5 py-1 rounded-xl border border-hairline uppercase">
            {results.methodName} · {usefulLife} YEARS
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-heading font-extrabold text-ink leading-tight">
          {results.heroText}
        </h2>
        <p class="text-xs sm:text-sm text-body leading-relaxed">
          Total depreciable base of <strong>{fmt(results.depreciableAmount)}</strong> is amortized down to terminal scrap value <strong>{fmt(results.salvageValue)}</strong>.
        </p>

        {/* Method Toggle Buttons */}
        <div class="pt-3 border-t border-hairline/60 flex items-center gap-2 flex-wrap">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-muted mr-1">Method:</span>
          {[
            { id: 'slm', label: 'Straight-Line (SLM)' },
            { id: 'wdv', label: 'Written Down (WDV)' },
            { id: 'ddb', label: 'Double Declining (DDB)' },
            { id: 'syd', label: "Sum-of-Years' (SYD)" },
            { id: 'units', label: 'Units of Production' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setParam('method', m.id)}
              class={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                method === m.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-canvas hover:bg-surface-soft border border-hairline text-ink'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CALCULATOR WORKSPACE */}
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div class="lg:col-span-6 bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft">
          <div class="flex items-center justify-between border-b border-hairline pb-4">
            <h3 class="text-xl font-bold font-heading text-ink">Asset Cost & Accounting Parameters</h3>
            <ShareActions onShare={handleCopyLink} onReset={handleReset} copiedToast={copiedToast} />
          </div>

          <FormInputNumber
            id="asset-cost"
            label="Initial Asset Purchase Cost"
            value={assetCost}
            min={1000}
            max={500000000}
            step={10000}
            prefix={currencySymbol}
            minLabel={`${currencySymbol}1,000`}
            maxLabel={`${currencySymbol}50 Crores`}
            onChange={(v) => setParam('assetCost', v)}
          />

          <FormInputNumber
            id="salvage-value"
            label="Estimated Residual / Scrap Value"
            value={salvageValue}
            min={0}
            max={50000000}
            step={5000}
            prefix={currencySymbol}
            minLabel={`${currencySymbol}0`}
            maxLabel={`${currencySymbol}5 Crores`}
            onChange={(v) => setParam('salvageValue', v)}
          />

          <div class="grid sm:grid-cols-2 gap-4">
            <FormInputNumber
              id="useful-life"
              label="Useful Lifespan (Years)"
              value={usefulLife}
              min={1}
              max={50}
              step={1}
              suffix="Yrs"
              minLabel="1 Yr"
              maxLabel="50 Yrs"
              onChange={(v) => setParam('usefulLife', v)}
            />

            <FormInputNumber
              id="tax-rate"
              label="Corporate Tax Rate (%)"
              value={taxRate}
              min={0}
              max={50}
              step={1}
              suffix="%"
              minLabel="0%"
              maxLabel="50%"
              onChange={(v) => setParam('taxRate', v)}
            />
          </div>

          <FormSelect
            id="method-select"
            label="Depreciation Accounting Method"
            value={method}
            options={[
              { value: 'slm', label: 'Straight-Line Method (SLM - Equal Annual Write-Off)' },
              { value: 'wdv', label: 'Written Down Value (WDV / Diminishing Balance - Sec 32 Standard)' },
              { value: 'ddb', label: 'Double Declining Balance (DDB - 2x Accelerated Write-Off)' },
              { value: 'syd', label: "Sum-of-the-Years'-Digits (SYD - Fractional Lifetime Decline)" },
              { value: 'units', label: 'Units of Production (Activity & Output Based)' },
            ]}
            onChange={(v) => setParam('method', v)}
          />

          {method === 'units' && (
            <div class="grid sm:grid-cols-2 gap-4 p-4 bg-surface-strong rounded-2xl border border-hairline">
              <FormInputNumber
                id="total-units"
                label="Total Lifetime Units"
                value={totalUnits}
                min={1}
                max={10000000}
                step={1000}
                onChange={(v) => setParam('totalUnits', v)}
              />
              <FormInputNumber
                id="first-year-units"
                label="Year 1 Units Produced"
                value={firstYearUnits}
                min={0}
                max={10000000}
                step={1000}
                onChange={(v) => setParam('firstYearUnits', v)}
              />
            </div>
          )}

          <FormSelect
            id="currency-select"
            label="Display Currency Symbol"
            value={currencySymbol}
            options={[
              { value: '₹', label: '₹ (Indian Rupee INR)' },
              { value: '$', label: '$ (US Dollar USD)' },
              { value: '£', label: '£ (British Pound GBP)' },
              { value: '€', label: '€ (Euro EUR)' },
              { value: 'AED ', label: 'AED (UAE Dirham)' },
            ]}
            onChange={(v) => setParam('currencySymbol', v)}
          />
        </div>

        {/* Right Panel: KPI Dashboard & Charts */}
        <div class="lg:col-span-6 space-y-6">
          <ResultDashboard
            primaryLabel="Year 1 Depreciation Expense"
            primaryValue={fmt(results.firstYearDepreciation)}
            secondaryItems={[
              { label: 'Initial Asset Cost', value: fmt(results.assetCost) },
              { label: 'Depreciable Base', value: fmt(results.depreciableAmount) },
              { label: 'Terminal Scrap Value', value: fmt(results.salvageValue) },
              { label: 'Total Tax Shield Savings', value: fmt(results.totalTaxShield) },
            ]}
          />

          <ResultDonutChart
            title="Asset Cost Composition"
            centerValue={fmt(results.assetCost)}
            centerSubtext="Total Cost"
            segments={[
              { label: 'Depreciable Base', amount: results.depreciableAmount, colorClass: 'bg-primary' },
              { label: 'Residual Salvage', amount: results.salvageValue, colorClass: 'bg-amber-500' },
            ]}
          />
        </div>
      </div>

      {/* 4. MULTI-METHOD COMPARISON CARDS */}
      <div class="p-6 sm:p-8 rounded-3xl bg-canvas border border-hairline space-y-4 shadow-soft font-mono">
        <div class="flex items-center justify-between">
          <h4 class="text-base font-bold font-heading text-ink">Institutional Method Comparison (Year 1 Expense)</h4>
          <span class="text-xs text-muted">Cost: {fmt(results.assetCost)}</span>
        </div>
        <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {results.methodComparison.map((comp) => (
            <div
              key={comp.id}
              class={`p-4 rounded-2xl border text-center space-y-1 ${
                method === comp.id
                  ? 'bg-primary/10 border-2 border-primary/40'
                  : 'bg-surface-strong border-hairline'
              }`}
            >
              <span class="text-xs text-muted font-bold block uppercase">{comp.name.split(' ')[0]}</span>
              <span class="text-lg font-bold text-ink">{fmt(comp.year1Dep)}</span>
              <span class="text-[11px] text-semantic-success block font-bold">Tax Shield: {fmt(comp.year1TaxShield)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. YEAR-BY-YEAR ASSET DEPRECIATION & BOOK VALUE SCHEDULE TABLE */}
      <div class="bg-canvas border border-hairline rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft overflow-hidden">
        <div class="flex items-center justify-between border-b border-hairline pb-4 flex-wrap gap-2">
          <div>
            <h3 class="text-xl font-bold font-heading text-ink">Yearly Asset Depreciation & Book Value Schedule</h3>
            <p class="text-xs text-muted font-mono mt-0.5">Tracking annual write-offs, accumulated depreciation, and closing book balance</p>
          </div>
          <span class="px-3 py-1 bg-surface-strong border border-hairline rounded-pill text-xs font-mono font-bold text-primary">
            {results.schedule.length} Years Schedule
          </span>
        </div>

        <div class="overflow-x-auto -mx-6 sm:-mx-8">
          <table class="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr class="border-b border-hairline bg-surface-strong text-muted uppercase text-[10px] tracking-wider">
                <th class="py-3 px-4 font-bold text-center">Year</th>
                <th class="py-3 px-4 font-bold text-right">Opening Book Value</th>
                <th class="py-3 px-4 font-bold text-right text-rose-600">Depreciation Expense</th>
                <th class="py-3 px-4 font-bold text-right text-amber-600">Tax Shield ({taxRate}%)</th>
                <th class="py-3 px-4 font-bold text-right">Accumulated Dep.</th>
                <th class="py-3 px-4 font-bold text-right text-primary">Closing Book Value</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline text-ink">
              {results.schedule.map((row) => (
                <tr key={row.year} class="hover:bg-surface-soft transition-colors">
                  <td class="py-3 px-4 text-center font-bold">{row.year}</td>
                  <td class="py-3 px-4 text-right text-muted">{fmt(row.openingBookValue)}</td>
                  <td class="py-3 px-4 text-right font-bold text-rose-600">-{fmt(row.depreciationExpense)}</td>
                  <td class="py-3 px-4 text-right font-bold text-emerald-600">+{fmt(row.taxShield)}</td>
                  <td class="py-3 px-4 text-right text-muted">{fmt(row.accumulatedDepreciation)}</td>
                  <td class="py-3 px-4 text-right font-bold text-primary">{fmt(row.closingBookValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. COST BREAKDOWN */}
      <CostBreakdownCard
        title="Asset Capital Cost Breakdown"
        subtitle={`Total Asset Value: ${fmt(results.assetCost)}`}
        items={costItems}
      />

      {/* 7. SMART RECOMMENDATIONS */}
      <RecommendationCard recommendations={results.recommendations} />

      {/* 8. KEY FINANCIAL INSIGHTS */}
      <div class="grid sm:grid-cols-2 gap-4">
        <InsightCard
          title="Total Tax Shield Generated"
          value={fmt(results.totalTaxShield)}
          subtitle={`Direct cash tax deductions across ${usefulLife} years at ${taxRate}% tax rate.`}
          badgeText="Corporate Tax Savings"
          badgeColorClass="bg-semantic-success"
        />
        <InsightCard
          title="Residual Salvage Share"
          value={`${results.assetCost > 0 ? Math.round((results.salvageValue / results.assetCost) * 100) : 0}%`}
          subtitle="Proportion of initial cost retained as residual market scrap."
          badgeText="Residual Value"
          badgeColorClass="bg-amber-500"
        />
      </div>

      {/* 9. DECISION SUMMARY CARD */}
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-strong to-canvas border-2 border-hairline shadow-soft space-y-4">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">📸 ASSET DEPRECIATION DECISION SUMMARY</span>
          <span class="text-xs text-muted font-mono">{results.methodName.split(' ')[0]}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Asset Cost</span>
            <span class="text-base font-bold text-ink">{fmt(results.assetCost)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Year 1 Write-off</span>
            <span class="text-base font-bold text-rose-600">{fmt(results.firstYearDepreciation)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Total Tax Shield</span>
            <span class="text-base font-bold text-emerald-600">{fmt(results.totalTaxShield)}</span>
          </div>
          <div>
            <span class="text-[11px] text-muted block uppercase font-bold">Terminal Scrap</span>
            <span class="text-base font-bold text-primary">{fmt(results.salvageValue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
