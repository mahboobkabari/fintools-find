import { useState, useMemo } from 'preact/hooks';
import { calculateBreakEven } from '../../../calculators/business/break-even-calculator';
import { BREAK_EVEN_CONFIG } from '../../../calculators/configs/break-even-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function BreakEvenFlagshipWidget() {
  const [fixedCosts, setFixedCosts] = useState(BREAK_EVEN_CONFIG.defaultInputs.fixedCosts);
  const [sellingPrice, setSellingPrice] = useState(BREAK_EVEN_CONFIG.defaultInputs.sellingPrice);
  const [variableCost, setVariableCost] = useState(BREAK_EVEN_CONFIG.defaultInputs.variableCost);
  const [currentSalesVolume, setCurrentSalesVolume] = useState(BREAK_EVEN_CONFIG.defaultInputs.currentSalesVolume);
  const [targetProfit, setTargetProfit] = useState(BREAK_EVEN_CONFIG.defaultInputs.targetProfit);

  // Compute CVP Analysis
  const results = useMemo(() => {
    return calculateBreakEven({
      fixedCosts,
      sellingPrice,
      variableCost,
      currentSalesVolume,
      targetProfit,
    });
  }, [fixedCosts, sellingPrice, variableCost, currentSalesVolume, targetProfit]);

  // Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = BREAK_EVEN_CONFIG.scenarios[presetKey];
    if (p) {
      setFixedCosts(p.fixedCosts);
      setSellingPrice(p.sellingPrice);
      setVariableCost(p.variableCost);
      setCurrentSalesVolume(p.currentSalesVolume);
      setTargetProfit(p.targetProfit);
    }
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-blue-800/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30">
              📊 Managerial Cost-Volume-Profit Engine
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Break-Even Analysis Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Determine the exact unit sales volume and revenue required to cover fixed overhead costs, achieve zero profit/loss, and evaluate target profit milestones.
            </p>
          </div>

          <div class="bg-blue-950/60 border border-blue-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-blue-300 font-bold block">
              Break-Even Revenue
            </span>
            <span class={`text-3xl sm:text-4xl font-black mt-1 block font-mono ${!results.isValid ? 'text-rose-400' : 'text-emerald-400'}`}>
              {results.isValid ? fmt(results.breakEvenRevenue) : 'N/A'}
            </span>
            <span class="text-xs text-blue-200 mt-1 block font-mono">
              {results.isValid ? `${results.breakEvenUnits.toLocaleString('en-IN')} Units Required` : 'Adjust Inputs'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Business Scenario Presets Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Illustrative Business Presets
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(BREAK_EVEN_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-4 rounded-xl border border-hairline bg-canvas hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left group"
            >
              <span class="font-bold text-xs text-ink group-hover:text-primary block">{s.title}</span>
              <p class="text-[11px] text-muted mt-1 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Calculator Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          <h3 class="text-base font-bold text-ink border-b border-hairline pb-3">
            Cost & Revenue Parameters
          </h3>

          <div class="space-y-5">
            <FormInputNumber
              id="fixedCosts"
              label="Fixed Overhead Costs (₹)"
              value={fixedCosts}
              onChange={(v) => setFixedCosts(v)}
              min={BREAK_EVEN_CONFIG.fieldLimits.fixedCosts.min}
              max={BREAK_EVEN_CONFIG.fieldLimits.fixedCosts.max}
              step={BREAK_EVEN_CONFIG.fieldLimits.fixedCosts.step}
              prefix="₹"
              helpText="Rent, salaries, software, insurance, utilities (costs that do not change with unit volume)."
            />

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="sellingPrice"
                label="Selling Price Per Unit (₹)"
                value={sellingPrice}
                onChange={(v) => setSellingPrice(v)}
                min={BREAK_EVEN_CONFIG.fieldLimits.sellingPrice.min}
                max={BREAK_EVEN_CONFIG.fieldLimits.sellingPrice.max}
                step={BREAK_EVEN_CONFIG.fieldLimits.sellingPrice.step}
                prefix="₹"
                helpText="Revenue generated per single unit sold."
              />

              <FormInputNumber
                id="variableCost"
                label="Variable Cost Per Unit (₹)"
                value={variableCost}
                onChange={(v) => setVariableCost(v)}
                min={BREAK_EVEN_CONFIG.fieldLimits.variableCost.min}
                max={BREAK_EVEN_CONFIG.fieldLimits.variableCost.max}
                step={BREAK_EVEN_CONFIG.fieldLimits.variableCost.step}
                prefix="₹"
                helpText="Direct material, labor, shipping cost per unit."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-hairline">
              <FormInputNumber
                id="currentSalesVolume"
                label="Current Sales Volume (Units)"
                value={currentSalesVolume}
                onChange={(v) => setCurrentSalesVolume(v)}
                min={BREAK_EVEN_CONFIG.fieldLimits.currentSalesVolume.min}
                max={BREAK_EVEN_CONFIG.fieldLimits.currentSalesVolume.max}
                step={BREAK_EVEN_CONFIG.fieldLimits.currentSalesVolume.step}
                helpText="Modeled sales volume to calculate profit & safety margin."
              />

              <FormInputNumber
                id="targetProfit"
                label="Optional Target Profit Goal (₹)"
                value={targetProfit}
                onChange={(v) => setTargetProfit(v)}
                min={BREAK_EVEN_CONFIG.fieldLimits.targetProfit.min}
                max={BREAK_EVEN_CONFIG.fieldLimits.targetProfit.max}
                step={BREAK_EVEN_CONFIG.fieldLimits.targetProfit.step}
                prefix="₹"
                helpText="Target net profit milestone beyond break-even."
              />
            </div>
          </div>

          {/* Validation Alert if Variable Cost >= Selling Price */}
          {!results.isValid && (
            <div class="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl space-y-1 text-xs">
              <span class="font-bold block">⚠️ Validation Alert</span>
              <p>{results.validationMessage}</p>
            </div>
          )}
        </div>

        {/* Right Column: Key Metrics, CVP Visualizer, and Sensitivity Matrix (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {/* Key Metrics Panel */}
          <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
            <h3 class="text-sm font-bold uppercase tracking-wider text-muted">
              Cost-Volume-Profit Indicators
            </h3>

            {/* Contribution Margin / Unit */}
            <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-ink">Contribution Margin Per Unit</span>
                <span class="text-sm font-mono font-extrabold text-emerald-600">
                  {fmt(results.contributionMargin)}
                </span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                Amount from each unit sale ({fmt(results.sellingPrice)} − {fmt(results.variableCost)}) contributing toward fixed overhead.
              </p>
            </div>

            {/* Contribution Margin Ratio */}
            <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-ink">Contribution Margin Ratio</span>
                <span class="text-sm font-mono font-extrabold text-primary">
                  {results.contributionMarginRatio}%
                </span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                Percentage of revenue remaining after covering per-unit variable costs.
              </p>
            </div>

            {/* Profit at Current Sales Volume */}
            <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-ink">Net Profit at {results.currentSalesVolume} Units</span>
                <span class={`text-sm font-mono font-extrabold ${results.currentProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {fmt(results.currentProfit)}
                </span>
              </div>
              <p class="text-[11px] text-muted leading-relaxed">
                {results.isAboveBreakEven
                  ? `Margin of Safety: ${results.marginOfSafetyPercent}% (${results.marginOfSafetyUnits.toLocaleString('en-IN')} units above break-even).`
                  : `Currently ${Math.abs(results.marginOfSafetyUnits).toLocaleString('en-IN')} units below break-even threshold.`}
              </p>
            </div>

            {/* Target Profit Units */}
            {results.targetProfit > 0 && results.isValid && (
              <div class="p-4 bg-surface-soft rounded-xl border border-hairline space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-ink">Target Profit ({fmt(results.targetProfit)}) Goal</span>
                  <span class="text-sm font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                    {results.targetProfitUnits.toLocaleString('en-IN')} Units
                  </span>
                </div>
                <p class="text-[11px] text-muted leading-relaxed">
                  Required revenue: {fmt(results.targetProfitRevenue)} to achieve target profit.
                </p>
              </div>
            )}

            {/* Restrained CVP Progress Visualization */}
            {results.isValid && (
              <div class="pt-2 space-y-2">
                <div class="flex items-center justify-between text-xs font-mono">
                  <span class="text-primary font-bold">Fixed Overhead: {fmt(results.fixedCosts)}</span>
                  <span class="text-emerald-600 font-bold">Current Volume: {results.currentSalesVolume} Units</span>
                </div>
                <div class="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    class="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (results.currentSalesVolume / (results.breakEvenUnits || 1)) * 100)}%` }}
                  />
                </div>
                <div class="flex items-center justify-between text-[11px] text-muted">
                  <span>0 Units</span>
                  <span class="font-mono font-bold text-ink">BEP: {results.breakEvenUnits.toLocaleString('en-IN')} Units</span>
                </div>
              </div>
            )}
          </div>

          {/* Price Sensitivity Matrix */}
          {results.isValid && (
            <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-3 shadow-soft">
              <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
                Price Sensitivity Matrix (±10% Price Impact)
              </h3>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs font-mono">
                  <thead>
                    <tr class="border-b border-hairline text-muted">
                      <th class="pb-2">Price Shift</th>
                      <th class="pb-2">Price (₹)</th>
                      <th class="pb-2">BEP Units</th>
                      <th class="pb-2">BEP Revenue</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-hairline">
                    {results.sensitivityMatrix.map((row) => (
                      <tr key={row.priceChangePct} class={row.priceChangePct === 0 ? 'bg-blue-50/50 font-bold text-primary' : 'text-ink'}>
                        <td class="py-2">{row.priceChangePct > 0 ? `+${row.priceChangePct}%` : `${row.priceChangePct}%`}</td>
                        <td class="py-2">{fmt(row.adjustedPrice)}</td>
                        <td class="py-2">{row.breakEvenUnits.toLocaleString('en-IN')}</td>
                        <td class="py-2">{fmt(row.breakEvenRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Share Actions & Financial Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Break-Even Analysis Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Educational CVP decision-support model. Managerial accounting calculations depend on user-entered cost assumptions and do not guarantee business performance or tax compliance.
        </p>
      </div>
    </div>
  );
}
