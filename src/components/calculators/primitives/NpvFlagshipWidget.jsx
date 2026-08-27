import { useState, useMemo } from 'preact/hooks';
import { calculateNpvProject } from '../../../calculators/business/npv-calculator';
import { NPV_CONFIG } from '../../../calculators/configs/npv-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function NpvFlagshipWidget() {
  const [initialOutlay, setInitialOutlay] = useState(NPV_CONFIG.defaultInputs.initialOutlay);
  const [discountRatePercent, setDiscountRatePercent] = useState(NPV_CONFIG.defaultInputs.discountRatePercent);
  const [reinvestmentRatePercent, setReinvestmentRatePercent] = useState(NPV_CONFIG.defaultInputs.reinvestmentRatePercent);
  const [financingRatePercent, setFinancingRatePercent] = useState(NPV_CONFIG.defaultInputs.financingRatePercent);
  const [cashFlows, setCashFlows] = useState(NPV_CONFIG.defaultInputs.cashFlows);

  // Dynamic cash flow array manipulation
  const handleUpdateCashFlow = (index, value) => {
    const updated = [...cashFlows];
    updated[index] = value;
    setCashFlows(updated);
  };

  const handleAddYear = () => {
    if (cashFlows.length < 30) {
      setCashFlows([...cashFlows, 300000]);
    }
  };

  const handleRemoveYear = () => {
    if (cashFlows.length > 1) {
      setCashFlows(cashFlows.slice(0, -1));
    }
  };

  // Compute Engine Results
  const results = useMemo(() => {
    return calculateNpvProject({
      initialOutlay,
      discountRatePercent,
      reinvestmentRatePercent,
      financingRatePercent,
      cashFlows,
    });
  }, [initialOutlay, discountRatePercent, reinvestmentRatePercent, financingRatePercent, cashFlows]);

  // Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = NPV_CONFIG.scenarios[presetKey];
    if (p) {
      setInitialOutlay(p.initialOutlay);
      setDiscountRatePercent(p.discountRatePercent);
      setReinvestmentRatePercent(p.reinvestmentRatePercent);
      setFinancingRatePercent(p.financingRatePercent);
      setCashFlows(p.cashFlows);
    }
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-emerald-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              📊 Capital Budgeting & Discounted Cash Flow Model
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Net Present Value (NPV) & IRR Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Evaluate capital investment projects, acquisition proposals, and business projects using multi-period discounted cash flows.
            </p>
          </div>

          <div class="bg-emerald-900/50 border border-emerald-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-emerald-300 font-bold block">
              Net Present Value (NPV)
            </span>
            <span class={`text-3xl sm:text-4xl font-black mt-1 block font-mono ${results.npv >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {results.isValid ? fmt(results.npv) : '—'}
            </span>
            {results.isValid && (
              <span class={`inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full font-mono border ${results.decisionSignal === 'accept' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                {results.decisionSignal === 'accept' ? '✓ Positive NPV (Accept Under Assumptions)' : '✕ Negative NPV (Reject Under Assumptions)'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Educational Notice */}
      <div class="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
        <span class="font-bold flex items-center gap-1.5">
          ℹ️ Capital Budgeting Educational Notice:
        </span>
        <p class="leading-relaxed">
          {NPV_CONFIG.disclaimers.educationalNotice}
        </p>
      </div>

      {/* Non-Normal Cash Flow / Multiple IRR Warning Alert */}
      {results.isValid && results.signAnalysis && results.signAnalysis.isNonNormal && (
        <div class="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <span class="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
            ⚠️ Non-Normal Cash Flow Alert ({results.signAnalysis.signChangeCount} Sign Changes Detected):
          </span>
          <p class="leading-relaxed">
            {NPV_CONFIG.disclaimers.irrNotice}
          </p>
        </div>
      )}

      {/* 2. Presets Quick Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Capital Budgeting Archetype Presets
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(NPV_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-4 rounded-xl border border-hairline bg-canvas hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-left group"
            >
              <span class="font-bold text-xs text-ink group-hover:text-emerald-600 block">{s.title}</span>
              <p class="text-[11px] text-muted mt-1 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Form & Analysis Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          {/* Section 1: Initial Outlay & Hurdle Rates */}
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-md">Step 1</span>
              Capital Outlay & Hurdle Rates
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="initialOutlay"
                label="Initial Capital Outlay (CF0 ₹)"
                value={initialOutlay}
                onChange={(v) => setInitialOutlay(v)}
                min={1000}
                max={1000000000}
                step={50000}
                prefix="₹"
                helpText="Upfront investment cost."
              />

              <FormInputNumber
                id="discountRatePercent"
                label="Discount / Hurdle Rate (% p.a.)"
                value={discountRatePercent}
                onChange={(v) => setDiscountRatePercent(v)}
                min={0}
                max={100}
                step={0.5}
                helpText="Required rate of return."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-hairline">
              <FormInputNumber
                id="reinvestmentRatePercent"
                label="MIRR Reinvestment Rate (%)"
                value={reinvestmentRatePercent}
                onChange={(v) => setReinvestmentRatePercent(v)}
                min={0}
                max={100}
                step={0.5}
                helpText="Rate for intermediate cash inflows."
              />

              <FormInputNumber
                id="financingRatePercent"
                label="MIRR Financing Rate (%)"
                value={financingRatePercent}
                onChange={(v) => setFinancingRatePercent(v)}
                min={0}
                max={100}
                step={0.5}
                helpText="Cost of capital for negative outflows."
              />
            </div>
          </div>

          {/* Section 2: Dynamic Annual Cash Flow Projections */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <div class="flex items-center justify-between border-b border-hairline pb-2">
              <h3 class="text-sm font-bold text-ink flex items-center gap-2">
                <span class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-xs rounded-md">Step 2</span>
                Annual Cash Flow Projections ({cashFlows.length} Years)
              </h3>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddYear}
                  disabled={cashFlows.length >= 30}
                  class="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-all disabled:opacity-50"
                >
                  + Add Year
                </button>
                <button
                  type="button"
                  onClick={handleRemoveYear}
                  disabled={cashFlows.length <= 1}
                  class="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-all disabled:opacity-50"
                >
                  - Remove Year
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {cashFlows.map((cf, idx) => (
                <FormInputNumber
                  key={idx}
                  id={`cf_${idx + 1}`}
                  label={`Year ${idx + 1} Cash Flow (₹)`}
                  value={cf}
                  onChange={(v) => handleUpdateCashFlow(idx, v)}
                  step={10000}
                  prefix="₹"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Key KPI Cards & Sensitivity (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {/* KPI Cards Grid */}
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-canvas border border-hairline rounded-2xl space-y-1 shadow-soft">
              <span class="text-[11px] font-bold uppercase tracking-wider text-muted block">Internal Rate of Return (IRR)</span>
              <span class="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 block">
                {results.isValid && results.irr !== null ? `${results.irr}%` : 'N/A'}
              </span>
              <span class="text-[10px] text-muted block">
                {results.irrStatus === 'multiple' ? '⚠️ Multiple Roots' : 'Unique Root'}
              </span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl space-y-1 shadow-soft">
              <span class="text-[11px] font-bold uppercase tracking-wider text-muted block">Modified IRR (MIRR)</span>
              <span class="text-2xl font-mono font-black text-indigo-600 dark:text-indigo-400 block">
                {results.isValid && results.mirr !== null ? `${results.mirr}%` : 'N/A'}
              </span>
              <span class="text-[10px] text-muted block">Reinvest @ {reinvestmentRatePercent}%</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl space-y-1 shadow-soft">
              <span class="text-[11px] font-bold uppercase tracking-wider text-muted block">Profitability Index (PI)</span>
              <span class="text-2xl font-mono font-black text-teal-600 dark:text-teal-400 block">
                {results.isValid && results.pi !== null ? `${results.pi}` : 'N/A'}
              </span>
              <span class="text-[10px] text-muted block">{results.pi > 1.0 ? 'PI > 1.0 (Value Adding)' : 'PI < 1.0'}</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl space-y-1 shadow-soft">
              <span class="text-[11px] font-bold uppercase tracking-wider text-muted block">Discounted Payback</span>
              <span class="text-2xl font-mono font-black text-amber-600 dark:text-amber-400 block">
                {results.isValid && results.isPaybackRecovered ? `${results.paybackYears} Yrs` : 'Not Recovered'}
              </span>
              <span class="text-[10px] text-muted block">At {discountRatePercent}% hurdle rate</span>
            </div>
          </div>

          {/* NPV Sensitivity Table */}
          <div class="bg-canvas border border-hairline p-5 rounded-2xl space-y-3 shadow-soft">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
              NPV Sensitivity Analysis Across Discount Rates
            </h3>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead>
                  <tr class="border-b border-hairline text-muted">
                    <th class="py-1.5">Discount Rate</th>
                    <th class="py-1.5 text-right">Calculated NPV</th>
                    <th class="py-1.5 text-right">Signal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-hairline font-mono">
                  {results.isValid && results.sensitivity.map((item) => (
                    <tr key={item.discountRatePercent}>
                      <td class="py-1.5 font-bold text-ink">{item.discountRatePercent}%</td>
                      <td class={`py-1.5 text-right font-bold ${item.npv >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {fmt(item.npv)}
                      </td>
                      <td class="py-1.5 text-right">
                        <span class={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.npv >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {item.npv >= 0 ? 'Accept' : 'Reject'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Multi-Period Cash Flow Amortization Schedule Table */}
      {results.isValid && (
        <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
          <h3 class="text-sm font-bold text-ink flex items-center justify-between">
            <span>Discounted Cash Flow Schedule @ {discountRatePercent}% Hurdle Rate</span>
            <span class="text-xs text-muted font-mono font-normal">CF0 Initial Outlay: -{fmt(initialOutlay)}</span>
          </h3>

          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead>
                <tr class="border-b border-hairline text-muted uppercase tracking-wider">
                  <th class="py-2">Period</th>
                  <th class="py-2 text-right">Nominal Cash Flow</th>
                  <th class="py-2 text-right">Present Value (PV)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-hairline font-mono">
                <tr class="bg-surface-soft font-bold">
                  <td class="py-2 text-ink">Year 0 (Outlay)</td>
                  <td class="py-2 text-right text-rose-600">-{fmt(initialOutlay)}</td>
                  <td class="py-2 text-right text-rose-600">-{fmt(initialOutlay)}</td>
                </tr>
                {results.schedule.map((row) => (
                  <tr key={row.year}>
                    <td class="py-2 font-bold text-ink">Year {row.year}</td>
                    <td class={`py-2 text-right ${row.cashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {fmt(row.cashFlow)}
                    </td>
                    <td class={`py-2 text-right font-bold ${row.pv >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {fmt(row.pv)}
                    </td>
                  </tr>
                ))}
                <tr class="border-t-2 border-hairline font-extrabold text-sm">
                  <td class="py-3 text-ink">Net Present Value (NPV)</td>
                  <td class="py-3 text-right text-muted">—</td>
                  <td class={`py-3 text-right ${results.npv >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {fmt(results.npv)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Share Actions & Financial Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Net Present Value (NPV) & IRR Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Educational capital budgeting scenario model. Actual net present values depend on project operating performance, timing uncertainties, tax policies, and external economic conditions.
        </p>
      </div>
    </div>
  );
}
