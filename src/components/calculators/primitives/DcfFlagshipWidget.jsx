import { useState, useMemo } from 'preact/hooks';
import { calculateDcf } from '../../../calculators/investment/discounted-cash-flow-calculator';
import { DCF_CONFIG } from '../../../calculators/configs/discounted-cash-flow-calculator.config';
import FormInputNumber from './FormInputNumber';
import ShareActions from '../../ui/ShareActions';
import { formatCurrency } from '@utils/formatters';

export default function DcfFlagshipWidget() {
  const [mode, setMode] = useState(DCF_CONFIG.defaultInputs.mode);
  const [startingFcf, setStartingFcf] = useState(DCF_CONFIG.defaultInputs.startingFcf);
  const [fcfGrowthRatePercent, setFcfGrowthRatePercent] = useState(DCF_CONFIG.defaultInputs.fcfGrowthRatePercent);
  const [projectionYears, setProjectionYears] = useState(DCF_CONFIG.defaultInputs.projectionYears);
  
  // Explicit FCF inputs (5 years array)
  const [explicitFcfs, setExplicitFcfs] = useState([...DCF_CONFIG.defaultInputs.explicitFcfs]);

  // Step 2: Discount Rate & Terminal Value
  const [discountRatePercent, setDiscountRatePercent] = useState(DCF_CONFIG.defaultInputs.discountRatePercent);
  const [terminalMethod, setTerminalMethod] = useState(DCF_CONFIG.defaultInputs.terminalMethod);
  const [terminalGrowthRatePercent, setTerminalGrowthRatePercent] = useState(DCF_CONFIG.defaultInputs.terminalGrowthRatePercent);
  const [terminalEbitda, setTerminalEbitda] = useState(DCF_CONFIG.defaultInputs.terminalEbitda);
  const [exitMultiple, setExitMultiple] = useState(DCF_CONFIG.defaultInputs.exitMultiple);

  // Step 3: Balance Sheet & Market Inputs
  const [cashAndEquivalents, setCashAndEquivalents] = useState(DCF_CONFIG.defaultInputs.cashAndEquivalents);
  const [totalDebt, setTotalDebt] = useState(DCF_CONFIG.defaultInputs.totalDebt);
  const [sharesOutstanding, setSharesOutstanding] = useState(DCF_CONFIG.defaultInputs.sharesOutstanding);
  const [currentStockPrice, setCurrentStockPrice] = useState(DCF_CONFIG.defaultInputs.currentStockPrice);
  const [marginOfSafetyPercent, setMarginOfSafetyPercent] = useState(DCF_CONFIG.defaultInputs.marginOfSafetyPercent);

  // Helper for updating explicit FCF array
  const handleExplicitFcfChange = (index, value) => {
    const next = [...explicitFcfs];
    next[index] = value;
    setExplicitFcfs(next);
  };

  // Compute Engine Results
  const results = useMemo(() => {
    return calculateDcf({
      mode,
      startingFcf,
      fcfGrowthRatePercent,
      explicitFcfs,
      projectionYears,
      discountRatePercent,
      terminalMethod,
      terminalGrowthRatePercent,
      terminalEbitda,
      exitMultiple,
      cashAndEquivalents,
      totalDebt,
      sharesOutstanding,
      currentStockPrice,
      marginOfSafetyPercent,
    });
  }, [
    mode,
    startingFcf,
    fcfGrowthRatePercent,
    explicitFcfs,
    projectionYears,
    discountRatePercent,
    terminalMethod,
    terminalGrowthRatePercent,
    terminalEbitda,
    exitMultiple,
    cashAndEquivalents,
    totalDebt,
    sharesOutstanding,
    currentStockPrice,
    marginOfSafetyPercent,
  ]);

  // Preset Handler
  const handleApplyPreset = (presetKey) => {
    const p = DCF_CONFIG.scenarios[presetKey];
    if (p) {
      setMode(p.mode);
      setStartingFcf(p.startingFcf);
      setFcfGrowthRatePercent(p.fcfGrowthRatePercent);
      setExplicitFcfs([...p.explicitFcfs]);
      setProjectionYears(p.projectionYears);
      setDiscountRatePercent(p.discountRatePercent);
      setTerminalMethod(p.terminalMethod);
      setTerminalGrowthRatePercent(p.terminalGrowthRatePercent);
      setTerminalEbitda(p.terminalEbitda);
      setExitMultiple(p.exitMultiple);
      setCashAndEquivalents(p.cashAndEquivalents);
      setTotalDebt(p.totalDebt);
      setSharesOutstanding(p.sharesOutstanding);
      setCurrentStockPrice(p.currentStockPrice);
      setMarginOfSafetyPercent(p.marginOfSafetyPercent);
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
              📊 Corporate Valuation & Intrinsic Price Model
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Discounted Cash Flow (DCF) Calculator
            </h2>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Model intrinsic share value by discounting future Free Cash Flows (FCF) and terminal value back to present value using WACC.
            </p>
          </div>

          <div class="bg-indigo-900/50 border border-indigo-500/40 p-5 rounded-xl text-center min-w-[260px]">
            <span class="text-xs uppercase tracking-wider text-indigo-300 font-bold block">
              Estimated Intrinsic Share Price
            </span>
            <span class="text-3xl sm:text-4xl font-black mt-1 block font-mono text-emerald-400">
              {results.isValid ? `${fmt(results.intrinsicValuePerShare)}` : '—'}
            </span>
            {results.isValid && (
              <span class={`inline-block mt-2 px-3 py-0.5 text-xs font-bold rounded-full font-mono border ${results.upsideDownsidePercent >= 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                {results.upsideDownsidePercent >= 0 ? '+' : ''}{results.upsideDownsidePercent}% vs Price ({fmt(results.currentStockPrice)})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Disclosure Alert */}
      <div class="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
        <span class="font-bold flex items-center gap-1.5">
          ℹ️ Educational Financial Model Disclaimer:
        </span>
        <p class="leading-relaxed">
          Discounted Cash Flow (DCF) outputs depend heavily on future cash flow growth, WACC, and terminal assumptions. Intrinsic share values are illustrative estimates for financial analysis and do not constitute guaranteed stock target prices or investment advice.
        </p>
      </div>

      {/* 2. Presets Quick Selector */}
      <div class="space-y-3">
        <label class="text-xs font-bold uppercase tracking-wider text-muted block">
          Load Valuation Archetype Presets
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(DCF_CONFIG.scenarios).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              class="p-4 rounded-xl border border-hairline bg-canvas hover:border-indigo-500 hover:bg-indigo-50/30 transition-all text-left group"
            >
              <span class="font-bold text-xs text-ink group-hover:text-primary block">{s.title}</span>
              <p class="text-[11px] text-muted mt-1 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Form & Analysis Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs (7 cols) */}
        <div class="lg:col-span-7 space-y-6 bg-canvas border border-hairline p-6 rounded-2xl shadow-soft">
          {/* Step 1: Cash Flow Forecast */}
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-hairline pb-2">
              <h3 class="text-sm font-bold text-ink flex items-center gap-2">
                <span class="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 text-xs rounded-md">Step 1</span>
                Free Cash Flow (FCF) Forecast
              </h3>
              <div class="flex items-center bg-surface-soft p-1 rounded-lg border border-hairline text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode('growth')}
                  class={`px-3 py-1 rounded-md transition-all ${mode === 'growth' ? 'bg-canvas text-primary shadow-xs font-bold' : 'text-muted'}`}
                >
                  Growth Shortcut
                </button>
                <button
                  type="button"
                  onClick={() => setMode('explicit')}
                  class={`px-3 py-1 rounded-md transition-all ${mode === 'explicit' ? 'bg-canvas text-primary shadow-xs font-bold' : 'text-muted'}`}
                >
                  Explicit Annual FCF
                </button>
              </div>
            </div>

            {mode === 'growth' ? (
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInputNumber
                  id="startingFcf"
                  label="Starting Free Cash Flow (₹)"
                  value={startingFcf}
                  onChange={(v) => setStartingFcf(v)}
                  min={-1000000000}
                  max={10000000000}
                  step={50000}
                  prefix="₹"
                  helpText="Baseline FCF0 for projection."
                />

                <FormInputNumber
                  id="fcfGrowthRatePercent"
                  label="Annual FCF Growth (% p.a.)"
                  value={fcfGrowthRatePercent}
                  onChange={(v) => setFcfGrowthRatePercent(v)}
                  min={-50}
                  max={100}
                  step={0.5}
                  helpText="Constant annual growth rate."
                />

                <FormInputNumber
                  id="projectionYears"
                  label="Projection Horizon (Years)"
                  value={projectionYears}
                  onChange={(v) => setProjectionYears(v)}
                  min={1}
                  max={15}
                  step={1}
                  helpText="Explicit forecast years (1-15)."
                />
              </div>
            ) : (
              <div class="space-y-3">
                <p class="text-xs text-muted">Enter custom projected Free Cash Flow for each forecast year:</p>
                <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <FormInputNumber
                      key={idx}
                      id={`explicitFcf_${idx}`}
                      label={`Year ${idx + 1} FCF (₹)`}
                      value={explicitFcfs[idx] || 0}
                      onChange={(v) => handleExplicitFcfChange(idx, v)}
                      step={50000}
                      prefix="₹"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Discount Rate & Terminal Value */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 text-xs rounded-md">Step 2</span>
              Discount Rate (WACC) & Terminal Value
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="discountRatePercent"
                label="Discount Rate / WACC (% p.a.)"
                value={discountRatePercent}
                onChange={(v) => setDiscountRatePercent(v)}
                min={0.1}
                max={50}
                step={0.5}
                helpText="Weighted Average Cost of Capital / Hurdle Rate."
              />

              <div class="space-y-1">
                <label class="text-xs font-bold text-ink block">Terminal Valuation Method</label>
                <select
                  value={terminalMethod}
                  onChange={(e) => setTerminalMethod(e.target.value)}
                  class="w-full p-2.5 text-xs bg-canvas border border-hairline rounded-xl text-ink font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="gordon">Gordon Perpetuity Growth Model</option>
                  <option value="exitMultiple">Exit EV / EBITDA Multiple Method</option>
                </select>
              </div>
            </div>

            {terminalMethod === 'gordon' ? (
              <FormInputNumber
                id="terminalGrowthRatePercent"
                label="Terminal Perpetuity Growth Rate (% p.a.)"
                value={terminalGrowthRatePercent}
                onChange={(v) => setTerminalGrowthRatePercent(v)}
                min={0}
                max={15}
                step={0.25}
                helpText="Perpetual growth rate (must be strictly less than WACC!)."
              />
            ) : (
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInputNumber
                  id="terminalEbitda"
                  label="Terminal Year EBITDA (₹)"
                  value={terminalEbitda}
                  onChange={(v) => setTerminalEbitda(v)}
                  min={0}
                  max={10000000000}
                  step={100000}
                  prefix="₹"
                />

                <FormInputNumber
                  id="exitMultiple"
                  label="Exit EV / EBITDA Multiple"
                  value={exitMultiple}
                  onChange={(v) => setExitMultiple(v)}
                  min={1}
                  max={50}
                  step={0.5}
                />
              </div>
            )}
          </div>

          {/* Step 3: Balance Sheet & Market Inputs */}
          <div class="space-y-4 pt-4 border-t border-hairline">
            <h3 class="text-sm font-bold text-ink border-b border-hairline pb-2 flex items-center gap-2">
              <span class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-xs rounded-md">Step 3</span>
              Balance Sheet & Market Share Inputs
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInputNumber
                id="cashAndEquivalents"
                label="Cash & Short-Term Equivalents (₹)"
                value={cashAndEquivalents}
                onChange={(v) => setCashAndEquivalents(v)}
                min={0}
                max={100000000000}
                step={100000}
                prefix="₹"
                helpText="Liquid cash added to Enterprise Value."
              />

              <FormInputNumber
                id="totalDebt"
                label="Total Debt Outstanding (₹)"
                value={totalDebt}
                onChange={(v) => setTotalDebt(v)}
                min={0}
                max={100000000000}
                step={100000}
                prefix="₹"
                helpText="Total interest-bearing debt deducted."
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInputNumber
                id="sharesOutstanding"
                label="Diluted Shares Outstanding"
                value={sharesOutstanding}
                onChange={(v) => setSharesOutstanding(v)}
                min={1}
                max={100000000000}
                step={1000}
                helpText="Total diluted shares."
              />

              <FormInputNumber
                id="currentStockPrice"
                label="Current Stock Price (₹)"
                value={currentStockPrice}
                onChange={(v) => setCurrentStockPrice(v)}
                min={0}
                max={100000}
                step={1}
                prefix="₹"
                helpText="Market share price."
              />

              <FormInputNumber
                id="marginOfSafetyPercent"
                label="Margin of Safety (%)"
                value={marginOfSafetyPercent}
                onChange={(v) => setMarginOfSafetyPercent(v)}
                min={0}
                max={50}
                step={1}
                helpText="Target valuation discount (e.g. 15%)."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Key Outputs & Valuation Summary (5 cols) */}
        <div class="lg:col-span-5 space-y-6">
          {!results.isValid ? (
            <div class="p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-center space-y-2">
              <span class="text-2xl">⚠️</span>
              <h4 class="font-bold text-amber-700 dark:text-amber-300 text-sm">Validation Error</h4>
              <p class="text-xs text-amber-600 dark:text-amber-400">{results.validationMessage}</p>
            </div>
          ) : (
            <>
              {/* Output Metrics Grid Card */}
              <div class="bg-canvas border border-hairline p-6 rounded-2xl space-y-4 shadow-soft">
                <h3 class="text-sm font-bold uppercase tracking-wider text-muted">
                  Valuation Metrics Summary
                </h3>

                {/* Primary Metric Card */}
                <div class="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/40 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-indigo-900 dark:text-indigo-300">Intrinsic Value / Share</span>
                    <span class="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                      {fmt(results.intrinsicValuePerShare)}
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-xs pt-1">
                    <span class="text-muted">Current Stock Price:</span>
                    <span class="font-mono font-bold text-ink">{fmt(results.currentStockPrice)}</span>
                  </div>
                </div>

                {/* KPI Grid */}
                <div class="grid grid-cols-2 gap-3">
                  <div class="p-3 bg-surface-soft rounded-xl border border-hairline space-y-0.5">
                    <span class="text-[11px] text-muted font-medium block">Enterprise Value (EV)</span>
                    <span class="text-base font-mono font-bold text-ink block">{fmt(results.enterpriseValue)}</span>
                  </div>

                  <div class="p-3 bg-surface-soft rounded-xl border border-hairline space-y-0.5">
                    <span class="text-[11px] text-muted font-medium block">Equity Value</span>
                    <span class="text-base font-mono font-bold text-ink block">{fmt(results.equityValue)}</span>
                  </div>

                  <div class="p-3 bg-surface-soft rounded-xl border border-hairline space-y-0.5">
                    <span class="text-[11px] text-muted font-medium block">Margin of Safety Price</span>
                    <span class="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400 block">{fmt(results.marginOfSafetyPrice)}</span>
                  </div>

                  <div class="p-3 bg-surface-soft rounded-xl border border-hairline space-y-0.5">
                    <span class="text-[11px] text-muted font-medium block">Terminal Value Contribution</span>
                    <span class="text-base font-mono font-bold text-ink block">{results.tvContributionPercent}%</span>
                  </div>
                </div>

                {/* Cash Flow Schedule Table */}
                <div class="pt-2 space-y-2">
                  <span class="text-xs font-bold text-muted uppercase tracking-wider block">
                    Cash Flow & Discount Schedule (₹)
                  </span>
                  <div class="overflow-x-auto">
                    <table class="w-full text-xs text-left">
                      <thead>
                        <tr class="border-b border-hairline text-muted">
                          <th class="py-1">Year</th>
                          <th class="py-1 text-right">Projected FCF</th>
                          <th class="py-1 text-right">PV @ {discountRatePercent}%</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-hairline">
                        {results.breakdownSchedule.map((item) => (
                          <tr key={item.year}>
                            <td class="py-1 font-semibold text-ink">Year {item.year}</td>
                            <td class="py-1 text-right font-mono text-ink">{fmt(item.fcf)}</td>
                            <td class="py-1 text-right font-mono font-bold text-indigo-600">{fmt(item.pv)}</td>
                          </tr>
                        ))}
                        <tr class="font-bold text-ink bg-surface-soft">
                          <td class="py-1.5 pl-1">Explicit PV Sum</td>
                          <td class="py-1.5 text-right">—</td>
                          <td class="py-1.5 text-right font-mono text-emerald-600">{fmt(results.totalPvExplicit)}</td>
                        </tr>
                        <tr class="font-bold text-ink bg-indigo-50/50 dark:bg-indigo-950/30">
                          <td class="py-1.5 pl-1">PV Terminal Value</td>
                          <td class="py-1.5 text-right font-mono text-muted">{fmt(results.terminalValue)}</td>
                          <td class="py-1.5 text-right font-mono text-indigo-600">{fmt(results.pvTerminalValue)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2D Sensitivity Matrix */}
                <div class="pt-3 border-t border-hairline space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-muted uppercase tracking-wider">
                      Intrinsic Value Sensitivity (WACC vs Growth)
                    </span>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-[11px] text-center border-collapse">
                      <thead>
                        <tr class="bg-surface-soft text-muted font-bold">
                          <th class="p-1 border border-hairline text-left">g \ WACC</th>
                          {results.sensitivity.discountRates.map((r) => (
                            <th key={r} class="p-1 border border-hairline">{r}%</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.sensitivity.matrix.map((row) => (
                          <tr key={row.terminalGrowthRatePercent}>
                            <td class="p-1 font-bold text-ink border border-hairline text-left bg-surface-soft">{row.terminalGrowthRatePercent}%</td>
                            {row.cells.map((cell, idx) => (
                              <td
                                key={idx}
                                class={`p-1 font-mono border border-hairline ${!cell.isValid ? 'bg-rose-50/50 dark:bg-rose-950/30 text-rose-500 font-bold' : cell.discountRatePercent === discountRatePercent && row.terminalGrowthRatePercent === terminalGrowthRatePercent ? 'bg-indigo-100 dark:bg-indigo-900/50 font-black text-indigo-700 dark:text-indigo-300' : 'text-ink'}`}
                              >
                                {cell.formattedValue}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p class="text-[10px] text-muted leading-relaxed">
                    Cells marked <span class="font-bold text-rose-500">N/A</span> represent invalid mathematical combinations where perpetual growth rate equals or exceeds WACC (g ≥ r).
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Share Actions & Financial Disclaimer */}
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-surface-soft border border-hairline rounded-2xl">
        <ShareActions title="Discounted Cash Flow (DCF) Calculator - Fintools Find" />
        <p class="text-[11px] text-muted max-w-xl text-center sm:text-right">
          Disclaimer: Educational valuation planning model. Intrinsic share values are estimates based on user inputs; actual market prices, corporate growth rates, and cost of capital vary over time.
        </p>
      </div>
    </div>
  );
}
