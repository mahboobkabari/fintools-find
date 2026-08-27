import { useState, useMemo } from 'preact/hooks';
import { calculatePaybackDetails } from '../../../calculators/business/payback-period-calculator.js';
import { PAYBACK_CONFIG } from '../../../calculators/configs/payback-period-calculator.config.js';
import FormInputNumber from './FormInputNumber.jsx';
import ShareActions from '../../ui/ShareActions.jsx';
import { formatCurrency } from '@utils/formatters.js';

export default function PaybackPeriodFlagshipWidget() {
  const [initialInvestment, setInitialInvestment] = useState(PAYBACK_CONFIG.defaultInputs.initialInvestment);
  const [cashFlowType, setCashFlowType] = useState(PAYBACK_CONFIG.defaultInputs.cashFlowType);
  const [annualCashFlow, setAnnualCashFlow] = useState(PAYBACK_CONFIG.defaultInputs.annualCashFlow);
  const [unevenCashFlows, setUnevenCashFlows] = useState(PAYBACK_CONFIG.defaultInputs.unevenCashFlows);
  const [discountRatePct, setDiscountRatePct] = useState(PAYBACK_CONFIG.defaultInputs.discountRatePct);
  const [projectLifeYears, setProjectLifeYears] = useState(PAYBACK_CONFIG.defaultInputs.projectLifeYears);
  const [targetPaybackYears, setTargetPaybackYears] = useState(PAYBACK_CONFIG.defaultInputs.targetPaybackYears);

  // Compute Payback Results
  const results = useMemo(() => {
    return calculatePaybackDetails({
      initialInvestment,
      cashFlowType,
      annualCashFlow,
      unevenCashFlows,
      discountRatePct,
      projectLifeYears,
      targetPaybackYears,
    });
  }, [
    initialInvestment,
    cashFlowType,
    annualCashFlow,
    unevenCashFlows,
    discountRatePct,
    projectLifeYears,
    targetPaybackYears,
  ]);

  const handleApplyPreset = (presetKey) => {
    const s = PAYBACK_CONFIG.scenarios[presetKey];
    if (s) {
      setInitialInvestment(s.initialInvestment);
      setCashFlowType(s.cashFlowType);
      if (s.cashFlowType === 'equal') {
        setAnnualCashFlow(s.annualCashFlow);
      } else if (Array.isArray(s.unevenCashFlows)) {
        setUnevenCashFlows(s.unevenCashFlows);
      }
      setDiscountRatePct(s.discountRatePct);
      setProjectLifeYears(s.projectLifeYears);
      setTargetPaybackYears(s.targetPaybackYears);
    }
  };

  const handleUnevenFlowChange = (index, value) => {
    const next = [...unevenCashFlows];
    next[index] = value;
    setUnevenCashFlows(next);
  };

  const fmt = (val) => formatCurrency(val, 'INR');

  return (
    <div class="space-y-8">
      {/* 1. Hero Decision Header Banner */}
      <div class="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-emerald-700/40">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
              📊 Capital Budgeting Payback Engine
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Payback Period Calculator (Simple & Discounted)
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Calculate Simple Payback Period, Discounted Payback Period (time-value-of-money), Net Present Value (NPV), and Profitability Index (PI) for corporate capital investments.
            </p>
          </div>

          <div class="bg-emerald-900/50 border border-emerald-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-emerald-300 font-bold block">
              Simple Payback Duration
            </span>
            <span class="text-3xl sm:text-4xl font-black text-emerald-400 mt-1 block font-mono">
              {results.isValid ? results.simplePaybackFormatted : '—'}
            </span>
            {results.isValid && (
              <span class="inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Discounted Payback: {results.discountedPaybackFormatted}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Educational Disclosure Banner */}
      <div class="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
        <span class="font-bold flex items-center gap-1.5">
          ℹ️ Capital Budgeting Estimation Disclosure:
        </span>
        <p class="leading-relaxed">
          {PAYBACK_CONFIG.disclaimers.educationalNotice} {PAYBACK_CONFIG.disclaimers.limitationsNotice}
        </p>
      </div>

      {/* 2. Sample Presets Quick Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Capital Investment Scenarios
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(PAYBACK_CONFIG.scenarios).map(([key, s]) => (
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
        {/* Left Column: Input Controls (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          {/* Step 1: Initial Investment & Cash Flow Structure */}
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-md">Step 1</span>
              Initial Outlay & Cash Flow Model
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="initialInvestment"
                label="Initial Capital Outlay (₹)"
                value={initialInvestment}
                onChange={(v) => setInitialInvestment(v)}
                min={10000}
                max={1000000000}
                step={50000}
                prefix="₹"
                helpText="Total upfront initial investment."
              />

              <div>
                <label class="text-xs font-bold text-ink block mb-1">Cash Flow Projection Type</label>
                <select
                  value={cashFlowType}
                  onChange={(e) => setCashFlowType(e.target.value)}
                  class="w-full p-2.5 bg-surface-soft border border-hairline rounded-xl text-xs font-semibold text-ink focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="equal">Equal Annual Cash Inflows (Uniform)</option>
                  <option value="uneven">Uneven Year-by-Year Cash Inflows</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <FormInputNumber
                id="projectLifeYears"
                label="Project Life (Years)"
                value={projectLifeYears}
                onChange={(v) => setProjectLifeYears(v)}
                min={1}
                max={20}
                step={1}
                helpText="Modeled operational life of project."
              />

              <FormInputNumber
                id="targetPaybackYears"
                label="Target Payback Cutoff (Years)"
                value={targetPaybackYears}
                onChange={(v) => setTargetPaybackYears(v)}
                min={0.5}
                max={20}
                step={0.5}
                helpText="Benchmark cutoff for risk comparison."
              />
            </div>
          </div>

          {/* Step 2: Annual Cash Inflow Inputs */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-xs rounded-md">Step 2</span>
              Projected Annual Cash Inflows
            </h3>

            {cashFlowType === 'equal' ? (
              <FormInputNumber
                id="annualCashFlow"
                label="Uniform Net Annual Cash Inflow (₹/year)"
                value={annualCashFlow}
                onChange={(v) => setAnnualCashFlow(v)}
                min={0}
                max={1000000000}
                step={25000}
                prefix="₹"
                helpText="Net annual cash savings or profits."
              />
            ) : (
              <div class="space-y-3">
                <label class="text-xs font-bold text-ink block">Year-by-Year Cash Inflows (₹)</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {Array.from({ length: projectLifeYears }).map((_, idx) => (
                    <FormInputNumber
                      key={`year-${idx}`}
                      id={`uneven-cf-${idx}`}
                      label={`Year ${idx + 1} Net Cash Flow`}
                      value={unevenCashFlows[idx] !== undefined ? unevenCashFlows[idx] : 0}
                      onChange={(v) => handleUnevenFlowChange(idx, v)}
                      min={-100000000}
                      max={1000000000}
                      step={25000}
                      prefix="₹"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Discount Rate for Time Value of Money */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 text-xs rounded-md">Step 3</span>
              Discount Rate & Capital Costs
            </h3>

            <FormInputNumber
              id="discountRatePct"
              label="Annual Discount Rate / Cost of Capital (%)"
              value={discountRatePct}
              onChange={(v) => setDiscountRatePct(v)}
              min={0}
              max={50}
              step={0.5}
              helpText="Used for Discounted Payback Period and NPV."
            />
          </div>
        </div>

        {/* Right Column: KPI Summary & Timeline (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {/* KPI Summary Cards */}
          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Simple Payback</span>
              <span class="text-lg font-mono font-black text-emerald-600 block">{results.simplePaybackFormatted}</span>
              <span class="text-[10px] text-muted block">
                {results.simplePaybackWithinTarget ? '✓ Within Target Cutoff' : '⚠ Exceeds Target Cutoff'}
              </span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Discounted Payback</span>
              <span class="text-lg font-mono font-black text-teal-600 block">{results.discountedPaybackFormatted}</span>
              <span class="text-[10px] text-muted block">At {results.discountRatePct}% Discount Rate</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Net Present Value (NPV)</span>
              <span
                class={`text-lg font-mono font-black block ${
                  results.npv >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {fmt(results.npv)}
              </span>
              <span class="text-[10px] text-muted block">PV Inflows: {fmt(results.pvInflows)}</span>
            </div>

            <div class="p-4 bg-canvas border border-hairline rounded-2xl shadow-soft space-y-1">
              <span class="text-[10px] text-muted font-bold uppercase">Profitability Index</span>
              <span class="text-lg font-mono font-black text-indigo-600 block">
                {results.pi !== null ? `${results.pi.toFixed(2)}x` : '—'}
              </span>
              <span class="text-[10px] text-muted block">{results.pi >= 1.0 ? '✓ Value Creating' : '⚠ Below Par'}</span>
            </div>
          </div>

          {/* Cumulative Cash Flow Recovery Timeline Card */}
          <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted">
              Cumulative Recovery Timeline
            </h3>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="border-b border-hairline bg-surface-soft">
                    <th class="p-2 font-bold text-ink">Year</th>
                    <th class="p-2 font-bold text-ink">Cash Flow</th>
                    <th class="p-2 font-bold text-ink">PV Cash Flow</th>
                    <th class="p-2 font-bold text-ink">Cumul. Nominal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-hairline">
                  {results.timeline.map((row) => {
                    const isRecoveredNow = row.cumulativeNominal >= results.initialInvestment;
                    return (
                      <tr key={row.year} class={isRecoveredNow ? 'bg-emerald-50/40 dark:bg-emerald-950/20 font-semibold' : ''}>
                        <td class="p-2 font-mono text-ink">Year {row.year}</td>
                        <td class="p-2 font-mono text-ink">{fmt(row.cashFlow)}</td>
                        <td class="p-2 font-mono text-muted">{fmt(row.pvCashFlow)}</td>
                        <td class={`p-2 font-mono ${isRecoveredNow ? 'text-emerald-600 font-bold' : 'text-slate-600'}`}>
                          {fmt(row.cumulativeNominal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Share Actions & Educational Footer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Payback Period Calculator (Simple & Discounted) - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Educational capital budgeting model. Simple and Discounted Payback measure capital liquidity recovery, not lifetime profitability. Always combine payback with NPV, IRR, and risk analysis.
        </p>
      </div>
    </div>
  );
}
