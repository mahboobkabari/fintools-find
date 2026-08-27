import { useState, useMemo } from 'preact/hooks';
import { calculateProfitMarginMetrics } from '../../../calculators/business/profit-margin-calculator';
import { PROFIT_MARGIN_CONFIG } from '../../../calculators/configs/profit-margin-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function ProfitMarginFlagshipWidget() {
  const [cogs, setCogs] = useState(PROFIT_MARGIN_CONFIG.defaultInputs.cogs);
  const [revenue, setRevenue] = useState(PROFIT_MARGIN_CONFIG.defaultInputs.revenue);
  const [operatingExpenses, setOperatingExpenses] = useState(PROFIT_MARGIN_CONFIG.defaultInputs.operatingExpenses);
  const [otherExpenses, setOtherExpenses] = useState(PROFIT_MARGIN_CONFIG.defaultInputs.otherExpenses);
  const [taxRatePercent, setTaxRatePercent] = useState(PROFIT_MARGIN_CONFIG.defaultInputs.taxRatePercent);
  const [desiredMarginPercent, setDesiredMarginPercent] = useState(PROFIT_MARGIN_CONFIG.defaultInputs.desiredMarginPercent);

  // Compute Engine Metrics
  const metrics = useMemo(() => {
    return calculateProfitMarginMetrics({
      cogs,
      revenue,
      operatingExpenses,
      otherExpenses,
      taxRatePercent,
      desiredMarginPercent,
    });
  }, [cogs, revenue, operatingExpenses, otherExpenses, taxRatePercent, desiredMarginPercent]);

  // Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = PROFIT_MARGIN_CONFIG.scenarios[presetKey];
    if (p) {
      setCogs(p.cogs);
      setRevenue(p.revenue);
      setOperatingExpenses(p.operatingExpenses);
      setOtherExpenses(p.otherExpenses);
      setTaxRatePercent(p.taxRatePercent);
      setDesiredMarginPercent(p.desiredMarginPercent);
    }
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
              📊 Unit Economics & Profitability Model
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Profit Margin & Markup Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Calculate Gross Profit Margin %, Net Profit Margin %, Cost-Plus Markup %, and target selling prices required to achieve desired product unit economics.
            </p>
          </div>

          <div class="bg-indigo-900/50 border border-indigo-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-indigo-300 font-bold block">
              Calculated Gross Margin
            </span>
            <span class="text-3xl sm:text-4xl font-black text-indigo-400 mt-1 block font-mono">
              {metrics.isValid ? `${metrics.grossMarginPercent.toFixed(1)}%` : '—'}
            </span>
            {metrics.isValid && (
              <span class="inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Markup: {metrics.isZeroCost ? 'N/A' : `${metrics.markupPercent.toFixed(1)}%`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Educational & Margin vs Markup Notice */}
      <div class="p-4 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
        <span class="font-bold flex items-center gap-1.5">
          ℹ️ Margin vs Markup Distinction:
        </span>
        <p class="leading-relaxed">
          {PROFIT_MARGIN_CONFIG.disclaimers.marginVsMarkupNotice}
        </p>
      </div>

      {/* 2. Presets Quick Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Business Presets
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(PROFIT_MARGIN_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-4 rounded-xl border border-hairline bg-canvas hover:border-indigo-500 hover:bg-indigo-50/30 transition-all text-left group"
            >
              <span class="font-bold text-xs text-ink group-hover:text-indigo-600 block">{s.title}</span>
              <p class="text-[11px] text-muted mt-1 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Form & Analysis Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
            <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-md">Inputs</span>
            Revenue & Cost Breakdown
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInputNumber
              id="cogs"
              label="Cost of Goods Sold (COGS ₹)"
              value={cogs}
              onChange={(v) => setCogs(v)}
              min={0}
              max={1000000000}
              step={1000}
              prefix="₹"
              helpText="Direct cost of producing or acquiring item."
            />

            <FormInputNumber
              id="revenue"
              label="Selling Price / Revenue (₹)"
              value={revenue}
              onChange={(v) => setRevenue(v)}
              min={0}
              max={1000000000}
              step={1000}
              prefix="₹"
              helpText="Selling price or gross revenue."
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <FormInputNumber
              id="operatingExpenses"
              label="Operating Expenses (OPEX ₹)"
              value={operatingExpenses}
              onChange={(v) => setOperatingExpenses(v)}
              min={0}
              max={1000000000}
              step={1000}
              prefix="₹"
              helpText="Rent, marketing, payroll, utilities."
            />

            <FormInputNumber
              id="otherExpenses"
              label="Other Expenses / Interest (₹)"
              value={otherExpenses}
              onChange={(v) => setOtherExpenses(v)}
              min={0}
              max={1000000000}
              step={1000}
              prefix="₹"
              helpText="Non-operating overheads."
            />

            <FormInputNumber
              id="taxRatePercent"
              label="Corporate Tax Rate (%)"
              value={taxRatePercent}
              onChange={(v) => setTaxRatePercent(v)}
              min={0}
              max={100}
              step={1}
              helpText="Business income tax rate."
            />
          </div>

          {metrics.isSellingBelowCost && (
            <div class="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 rounded-xl text-xs text-amber-900 dark:text-amber-200">
              ⚠️ Warning: Selling price is lower than COGS. Gross profit is negative!
            </div>
          )}
        </div>

        {/* Right Column: KPI Cards & Target Price Solver (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {/* KPI Cards Grid */}
          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Gross Profit</span>
              <span class="text-xl font-mono font-black text-ink block">{fmt(metrics.grossProfit)}</span>
              <span class="text-[11px] font-bold text-indigo-600 block">{metrics.grossMarginPercent.toFixed(1)}% Margin</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Cost-Plus Markup</span>
              <span class="text-xl font-mono font-black text-indigo-600 block">
                {metrics.isZeroCost ? 'N/A' : `${metrics.markupPercent.toFixed(1)}%`}
              </span>
              <span class="text-[11px] text-muted block">on COGS ({fmt(metrics.cogs)})</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Operating Profit</span>
              <span class="text-xl font-mono font-black text-ink block">{fmt(metrics.operatingProfit)}</span>
              <span class="text-[11px] font-bold text-emerald-600 block">{metrics.operatingMarginPercent.toFixed(1)}% Margin</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Net Profit (Post-Tax)</span>
              <span class="text-xl font-mono font-black text-emerald-600 block">{fmt(metrics.netProfit)}</span>
              <span class="text-[11px] font-bold text-emerald-600 block">{metrics.netMarginPercent.toFixed(1)}% Net Margin</span>
            </div>
          </div>

          {/* Reverse Target Price Solver Card */}
          <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
              Reverse Target Price Solver
            </h3>

            <FormInputNumber
              id="desiredMarginPercent"
              label="Desired Gross Margin (%)"
              value={desiredMarginPercent}
              onChange={(v) => setDesiredMarginPercent(v)}
              min={0}
              max={99.9}
              step={1}
              helpText="Target gross profit margin percentage."
            />

            {metrics.targetPrice.isValid ? (
              <div class="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/40 rounded-xl space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-muted">Illustrative Target Selling Price:</span>
                  <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                    {fmt(metrics.targetPrice.targetSellingPrice)}
                  </span>
                </div>
                <div class="flex items-center justify-between text-xs pt-1 border-t border-hairline">
                  <span class="text-muted">Implied Gross Profit:</span>
                  <span class="font-mono font-bold text-ink">{fmt(metrics.targetPrice.impliedGrossProfit)}</span>
                </div>
              </div>
            ) : (
              <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {metrics.targetPrice.errorMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Margin vs Markup Reference Table */}
      <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
        <h3 class="text-sm font-bold text-ink">
          Margin vs Markup Conversion Quick Reference
        </h3>
        <p class="text-xs text-muted">
          Compare equivalent Gross Profit Margin % and Cost-Plus Markup % values across standard pricing benchmarks.
        </p>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-hairline bg-surface-soft">
                <th class="p-3 font-bold text-ink">Gross Margin % (on Price)</th>
                <th class="p-3 font-bold text-ink">Cost-Plus Markup % (on Cost)</th>
                <th class="p-3 font-bold text-ink">Profit Formula Identity</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-hairline">
              {metrics.conversionTable.map((row) => (
                <tr key={row.grossMarginPercent} class="hover:bg-surface-soft/50">
                  <td class="p-3 font-mono font-bold text-indigo-600">{row.grossMarginPercent}%</td>
                  <td class="p-3 font-mono font-bold text-ink">{row.markupPercent}%</td>
                  <td class="p-3 text-muted">Markup = {row.grossMarginPercent}% / (100% - {row.grossMarginPercent}%)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Share Actions & Educational Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Profit Margin & Markup Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Educational unit economics scenario model. Calculated margins and prices do not guarantee customer demand, market adoption, or net business profitability.
        </p>
      </div>
    </div>
  );
}
